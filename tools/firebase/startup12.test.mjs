// Aplicación y almacenamiento reales en perfiles efímeros; Auth/transporte
// controlados y sin SDK ni peticiones externas. Nunca usa cuentas o datos reales.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, configure, initialized, idle, createGame, snapshot } from './browser-support.mjs';

const server = await startServer(4197), browser = await chromium.launch();
const contexts = [], reports = [], errors = [], forbidden = [];
const origin = 'http://127.0.0.1:4197';
const uid = 'cuenta-ficticia-12', team = { id: 'equipo-12', name: 'Equipo ficticio' };
const pass = text => { reports.push(text); console.log('OK: ' + text); };
const adapter = `export function createWebAuth() {
  let resolve, reject, user = null, notify;
  const pending = new Promise((ok, no) => { resolve = ok; reject = no; });
  window.F12 = {
    resolve() { user = { uid: '${uid}', email: 'fase12@ficticio.test' }; resolve(); },
    reject() { reject({ code: 'auth/network-request-failed' }); },
    late() { notify?.({ uid: '${uid}', email: 'fase12@ficticio.test' }); }
  };
  return { ready: () => pending, observe(next) { notify = next; next(user); return () => {}; },
    login: async () => {}, logout: async () => { user = null; notify?.(null); } };
}`;

async function device({ cache = true, sync = true, timeout = 12000 } = {}) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } }); contexts.push(context);
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === origin) return route.fallback();
    forbidden.push(route.request().url()); return route.abort();
  });
  await configure(context, { enabled: true, config: { projectId: 'demo-defensas' }, authEmulator: false });
  await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript', body: `export const syncSettings={enabled:${sync},emulator:false,allowRealWrites:false};` }));
  await context.route('**/js/firebase-auth.js', route => route.fulfill({ contentType: 'text/javascript', body: adapter }));
  await context.route('**/js/firestore-sync.js', route => route.fulfill({ contentType: 'text/javascript', body: `
export async function loadFirestoreTransport() {
  return { teams: () => new Promise((resolve, reject) => { window.F12Teams = { resolve: (missing = false) => resolve(missing ? [] : [${JSON.stringify(team)}]), reject: () => reject(Error('Red ficticia')) }; }),
    send: async () => {}, pull: async () => [], verifyTeam: async () => (${JSON.stringify(team)}) };
}` }));
  const storageSource = (await readFile('js/sync-storage.js', 'utf8')).replace('export function cachedTeams(uid)', 'function originalCachedTeams(uid)');
  await context.route('**/js/sync-storage.js', route => route.fulfill({ contentType: 'text/javascript', body: storageSource + `
export async function cachedTeams(uid) { if(window.F12ScopeGate) await window.F12ScopeGate; return originalCachedTeams(uid); }
` }));
  if (timeout !== 12000) {
    const source = (await readFile('js/cuenta-ui.js', 'utf8')).replace('settings: firebaseSettings,', `settings: firebaseSettings, timeoutMs: ${timeout},`);
    await context.route('**/js/cuenta-ui.js', route => route.fulfill({ contentType: 'text/javascript', body: source }));
  }
  await context.addInitScript(() => { if (!localStorage.getItem('defensas-account-mode')) localStorage.setItem('defensas-account-mode', 'local'); });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin); await idle(page);
  const localId = await createGame(page, 'LOCAL FICTICIO');
  await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
  const localBefore = await snapshot(page);
  await page.evaluate(async ({ uid, team, cache, sync }) => {
    const s = await import('./js/sync-storage.js'), p = await import('./js/persistencia.js');
    if (sync) {
      s.setStorageIdentity(uid); s.setStorageScope(team.id);
      await p.createGameAndSelect({ id: 'cloud-12', jornada: '12', rival: 'CUENTA FICTICIA', createdAt: '2026-10-20' });
      if (cache) await s.cacheTeams(uid, [team]);
      await s.syncPreference(uid, team.id);
      s.setStorageIdentity(null);
      localStorage.setItem('defensas-sync-consent:' + JSON.stringify(['demo-defensas', uid]), 'enabled');
      localStorage.setItem('defensas-local-offer:' + JSON.stringify(['demo-defensas', uid]), 'preguntado');
    }
    localStorage.setItem('defensas-account-mode', 'google');
  }, { uid, team, cache, sync });
  return { context, page, localId, localBefore };
}

async function unchanged(page, before) {
  const localEvents = await page.evaluate(async () => (await import('./js/persistencia.js')).allEvents());
  assert.deepEqual(localEvents, before.events, 'Los eventos originales del dispositivo no cambian');
}
async function locked(page) {
  assert(await page.locator('#loginScreen').isVisible());
  assert(await page.locator('.app-shell').evaluate(node => node.inert));
  assert.equal(await page.locator('.app-shell').evaluate(node => getComputedStyle(node).visibility), 'hidden');
  assert(await page.locator('#newGameBtn').isDisabled());
  const buttons = await page.locator('.action-btn, .defense-btn, .result-btn').evaluateAll(nodes => nodes.map(node => node.disabled));
  assert(buttons.every(Boolean));
  // Forzar los eventos del DOM tampoco debe saltarse las guardas del registro.
  await page.evaluate(() => {
    document.querySelector('.action-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('.result-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('#undoBtn').dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

try {
  const { page: a, localBefore } = await device();
  let releaseModule;
  const moduleGate = new Promise(resolve => { releaseModule = resolve; });
  await a.route('**/js/cuenta-ui.js', async route => { await moduleGate; await route.continue(); });
  await a.goto(origin, { waitUntil: 'commit' });
  await a.locator('#loginScreen').waitFor({ state: 'visible' });
  assert.equal(await a.evaluate(() => document.documentElement.dataset.login), 'restaurando', 'Bloqueo previo a los módulos');
  assert.equal(await a.locator('.app-shell').evaluate(node => getComputedStyle(node).visibility), 'hidden');
  releaseModule(); await initialized(a); await a.waitForFunction(() => window.F12);
  await locked(a); await unchanged(a, localBefore);
  await a.evaluate(() => { window.F12ScopeGate = new Promise(resolve => { window.releaseScope12 = resolve; }); F12.resolve(); });
  await a.waitForFunction(() => document.querySelector('#accountIdentity').textContent === 'fase12@ficticio.test');
  await locked(a); await unchanged(a, localBefore);
  await mkdir('.test-artifacts/firebase/fase12', { recursive: true });
  await a.screenshot({ path: '.test-artifacts/firebase/fase12/restaurando.png' });
  for (const [width, height] of [[1180, 740], [820, 1180], [390, 844]]) {
    await a.setViewportSize({ width, height });
    const layout = await a.evaluate(() => {
      const screen = document.querySelector('#loginScreen'), local = document.querySelector('#loginLocal').getBoundingClientRect();
      return { horizontal: document.documentElement.scrollWidth > innerWidth || screen.scrollWidth > screen.clientWidth,
        scroll: screen.scrollHeight > screen.clientHeight + 1, width: local.width, height: local.height };
    });
    assert(!layout.horizontal); assert(layout.width >= 44 && layout.height >= 44);
    if (width >= 820) assert(!layout.scroll, 'Restauración sin desplazar en iPad: ' + JSON.stringify(layout));
  }
  await a.setViewportSize({ width: 1024, height: 768 });
  await a.evaluate(() => releaseScope12()); await idle(a);
  await a.waitForFunction(() => document.querySelector('#gameSelect option[value="cloud-12"]'));
  assert(await a.locator('#loginScreen').isHidden());
  assert.equal(await a.evaluate(async () => (await import('./js/sync-storage.js')).storageContext().teamId), team.id);
  await a.locator('#gameSelect').selectOption('cloud-12'); await idle(a);
  await a.locator('.action-btn').first().click(); await a.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(a);
  assert.equal((await snapshot(a)).events.length, 1); await unchanged(a, localBefore);
  pass('Módulos, Auth y equipo retrasados: registro bloqueado; al recuperar solo se registra en el equipo correcto, sin doble toque');

  const { page: b, localId, localBefore: beforeB } = await device();
  await b.reload(); await initialized(b); await b.waitForFunction(() => window.F12); await locked(b);
  await b.locator('#loginLocal').click(); await idle(b);
  await b.evaluate(() => F12.resolve()); await b.waitForTimeout(200);
  assert(await b.locator('#loginScreen').isHidden());
  assert.equal(await b.evaluate(() => localStorage.getItem('defensas-account-mode')), 'local');
  assert.equal((await snapshot(b)).currentGameId, localId);
  await b.locator('.action-btn').first().click(); await b.locator('[data-points="2"][data-result="fallado"]').click(); await idle(b);
  assert.equal((await snapshot(b)).events.length, beforeB.events.length + 1);
  assert.equal(await b.evaluate(async () => (await import('./js/sync-storage.js')).storageContext().uid), null);
  pass('Continuar sin cuenta durante la espera permite registrar y descarta la restauración tardía');

  const { page: c, localBefore: beforeC } = await device({ sync: false });
  await c.reload(); await initialized(c); await c.waitForFunction(() => window.F12); await c.evaluate(() => F12.reject());
  await c.locator('#loginRetry').waitFor({ state: 'visible' }); await locked(c); await unchanged(c, beforeC);
  await c.evaluate(() => { window.previousF12 = F12; });
  await c.locator('#loginRetry').click(); await c.waitForFunction(() => window.F12 !== window.previousF12);
  await c.evaluate(() => F12.resolve());
  await idle(c);
  assert(await c.locator('#loginScreen').isHidden());
  await c.evaluate(() => F12.late()); await idle(c);
  pass('Error de Auth mantiene bloqueo; Reintentar recupera la sesión sin modificar los tiros');

  const { page: d, localBefore: beforeD } = await device({ cache: false });
  await d.reload(); await initialized(d); await d.waitForFunction(() => window.F12); await d.evaluate(() => F12.resolve());
  await d.waitForFunction(() => window.F12Teams); await locked(d); await unchanged(d, beforeD);
  await d.evaluate(() => F12Teams.reject()); await d.locator('#loginRetry').waitFor({ state: 'visible' });
  await locked(d); assert.match(await d.locator('#loginMessage').textContent(), /preparar tu equipo/);
  await d.locator('#loginLocal').click(); await idle(d);
  assert.equal((await snapshot(d)).games[0].rival, 'LOCAL FICTICIO');
  pass('Equipo preferido sin caché y servidor inaccesible: sin salto silencioso a partidos locales');

  for (const cache of [false, true]) {
    const { page: missing, localBefore: beforeMissing } = await device({ cache });
    await missing.reload(); await initialized(missing); await missing.waitForFunction(() => window.F12);
    await missing.evaluate(() => F12.resolve()); await missing.waitForFunction(() => window.F12Teams);
    if (cache) await idle(missing);
    await missing.evaluate(() => F12Teams.resolve(true));
    await missing.locator('#teamSetup').waitFor({ state: 'visible' }); await locked(missing); await unchanged(missing, beforeMissing);
    assert.equal(await missing.evaluate(async () => (await import('./js/sync-storage.js')).syncPreference('cuenta-ficticia-12')), team.id);
  }
  pass('Equipo ausente o sin acceso, con y sin caché: bloqueo explícito y preferencia conservada para reintentar');

  const { page: e, localBefore: beforeE } = await device({ sync: false, timeout: 80 });
  await e.reload(); await initialized(e); await e.locator('#loginRetry').waitFor({ state: 'visible' });
  assert.match(await e.locator('#loginMessage').textContent(), /tarda demasiado/); await locked(e); await unchanged(e, beforeE);
  await e.locator('#loginLocal').click(); await idle(e); await e.evaluate(() => F12.resolve()); await e.waitForTimeout(150);
  assert(await e.locator('#loginScreen').isHidden());
  pass('Timeout acotado conserva los tiros; salida local operativa y respuesta tardía ignorada');

  await b.reload(); await idle(b); assert(await b.locator('#loginScreen').isHidden());
  assert.equal(await b.evaluate(() => Boolean(window.F12)), false, 'Sin cuenta recordado no inicia Auth');
  // Fase 15: cambio de ámbito justo antes del callback de IndexedDB. Debe
  // rechazar la operación como SCOPE_CHANGED sin excepción global del evento.
  assert(await a.evaluate(async () => {
    const s = await import('./js/sync-storage.js'), cfg = await import('./js/configuracion-guardada.js');
    const source = await (await import('./js/configuracion.js')).loadConfigurationSource();
    const original = IDBObjectStore.prototype.get;
    let changed = false;
    IDBObjectStore.prototype.get = function(key) {
      const request = original.call(this, key);
      if (!changed && this.name === 'settings' && String(key).startsWith('configuracionBotones:')) {
        request.addEventListener('success', () => { changed = true; s.setStorageScope(null); }, { once: true });
      }
      return request;
    };
    try { await cfg.loadButtonConfiguration({ csvText: source.text, csvConfiguration: source.configuration }); return false; }
    catch (error) { return changed && error.code === 'SCOPE_CHANGED'; }
    finally { IDBObjectStore.prototype.get = original; }
  }));
  await unchanged(a, localBefore);
  pass('Cambio de ámbito dentro del callback IndexedDB aborta configuración sin excepción global ni modificar originales');
  assert.deepEqual(errors, []); assert.deepEqual(forbidden, []);
  pass('Elección local recordada y cero peticiones externas en toda la batería');
  await writeFile('.test-artifacts/firebase/fase12/arranque.json', JSON.stringify({ ok: true, reports, externalRequests: 0, realWrites: 0 }, null, 2));
} finally { for (const context of contexts) await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); }
