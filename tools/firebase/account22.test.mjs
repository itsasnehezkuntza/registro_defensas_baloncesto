// Aplicación real, SDK oficial y emuladores demo-defensas. Perfiles efímeros.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, updateDoc } from 'firebase/firestore';
import { startServer } from './servidor.mjs';
import { chromium, configure, officialSdk, initialized, idle, createGame, snapshot, emulatorLogin, answerLocalData } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Solo emuladores locales.');
if (process.env.DEFENSAS_BROWSER22 && !['chromium', 'webkit'].includes(process.env.DEFENSAS_BROWSER22)) throw Error('Motor de prueba desconocido.');
const env = await initializeTestEnvironment({ projectId: 'demo-defensas', firestore: { host: '127.0.0.1', port: 8085, rules: await readFile('firestore.rules', 'utf8') } });
const server = await startServer(4192), reports = [], forbidden = [], errors = [], expectedOfflineErrors = [], failedRequests = new Set(), failedChannels = new Set();
const out = '.test-artifacts/firebase/fase22'; await mkdir(out, { recursive: true });
const origin = 'http://127.0.0.1:4192';
// WebKit puede representar de forma distinta los escapes de la misma URL.
const requestKey = value => {
  const url = new URL(value);
  return JSON.stringify([url.origin, url.pathname, [...url.searchParams].sort(([a], [b]) => a.localeCompare(b))]);
};
const channelKey = value => {
  const url = new URL(value), database = url.searchParams.get('database'), session = url.searchParams.get('SID');
  if (url.origin !== 'http://127.0.0.1:8085' || !/^\/google\.firestore\.v1\.Firestore\/(Listen|Write)\/channel$/.test(url.pathname) ||
      database !== 'projects/demo-defensas/databases/(default)' || !session) return null;
  return JSON.stringify([url.origin, url.pathname, database, session]);
};
const synced = async page => {
  try { await page.waitForFunction(() => document.querySelector('#cloudStatus').textContent === 'Sincronizado' && document.querySelector('#storageNotice').textContent === 'Sincronizado', undefined, { timeout: 60000 }); }
  catch (error) {
    console.error('SYNC22', await page.evaluate(async () => {
      const s = await import('./js/sync-storage.js');
      return { label: document.querySelector('#cloudStatus').textContent, detail: document.querySelector('#syncDetail').textContent,
        notice: document.querySelector('#storageNotice').textContent, save: document.querySelector('#saveStatus').className,
        scope: s.storageContext(), queue: (await s.listPending()).map(op => ({type: op.type, gameId: op.gameId, error: op.error, blocked: op.blocked, attempts: op.attempts})) };
    })); throw error;
  }
};
const profile = async page => { if (await page.locator('#profileMenu').isHidden()) await page.locator('#profileBtn').click(); };
const closeProfile = async page => { if (await page.locator('#profileMenu').isVisible()) await page.keyboard.press('Escape'); };
const shot = async page => { await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page); };
const contextOf = page => page.evaluate(async () => (await import('./js/sync-storage.js')).storageContext());
const raw = page => page.evaluate(async () => {
  const p = await import('./js/persistencia.js');
  return p.transact(['games', 'events', 'syncQueue', 'syncMeta', 'cloudGames', 'cloudEvents'], 'readonly', (tx, done) => {
    const data = {}; let n = 0;
    for (const name of ['games', 'events', 'syncQueue', 'syncMeta', 'cloudGames', 'cloudEvents']) { const r = tx.objectStore(name).getAll(); r.onsuccess = () => { data[name] = r.result; if (++n === 6) done(data); }; }
  });
});
const remote = page => page.evaluate(async () => {
  const s = await import('./js/sync-storage.js'), backend = await (await import('./js/firestore-sync.js')).loadFirestoreTransport(s.storageContext().uid);
  return backend.pull(s.storageContext().teamId);
});
const signOutExternally = page => page.evaluate(async () => {
  const a = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'), auth = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js');
  await auth.signOut(auth.getAuth(a.getApp('defensas-auth')));
});
try {
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]].filter(([name]) => !process.env.DEFENSAS_BROWSER22 || process.env.DEFENSAS_BROWSER22 === name)) {
    const browser = await type.launch(), contexts = [];
    const pass = message => { reports.push(name + ': ' + message); console.log('OK: ' + reports.at(-1)); };
    const email = `fase22-${name}@ficticio.test`;
    async function login22(page, email, displayName = 'Entrenador ficticio') {
      if (name === 'chromium') return emulatorLogin(page, email, displayName);
      // WebKit de Windows falla en el popup gapi del emulador con auth/internal-error.
      // Solo en esta prueba: credencial Google ficticia validada por Auth Emulator.
      if (!await page.locator('#loginScreen').isVisible()) { await profile(page); await page.locator('#googleLogin').click(); }
      await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled);
      await page.evaluate(({ email, displayName }) => { window.identity22 = { sub: email, email, email_verified: true, name: displayName }; }, { email, displayName });
      await page.locator('#loginGoogle').click();
      await page.waitForFunction(email => document.querySelector('#accountIdentity').textContent === email, email);
    }
    async function device(local = false) {
      const c = await browser.newContext({ viewport: { width: 1024, height: 768 }, acceptDownloads: true }); contexts.push(c);
      c.setDefaultTimeout(30000);
      c.on('requestfailed', request => {
        failedRequests.add(requestKey(request.url()));
        const channel = channelKey(request.url()); if (channel) failedChannels.add(channel);
      });
      await configure(c); await officialSdk(c, true);
      const signIn = name === 'webkit'
        ? "window.rejectLogin22 ? Promise.reject({code:'auth/popup-blocked'}) : sdk.signInWithCredential(auth, sdk.GoogleAuthProvider.credential(JSON.stringify(window.identity22)))"
        : 'sdk.signInWithPopup(auth, provider)';
      const authSource = (await readFile('js/firebase-auth.js', 'utf8')).replace('login: () => sdk.signInWithPopup(auth, provider),', `login: () => (${signIn}).catch(error => { window.authError22 = error.code; throw error; }),`);
      await c.route('**/js/firebase-auth.js', r => r.fulfill({ contentType: 'text/javascript', body: authSource }));
      await c.route('**/js/sync-config.js', r => r.fulfill({ contentType: 'text/javascript', body: 'export const syncSettings={enabled:true,emulator:true,allowRealWrites:false};' }));
      await c.route('https://www.google.com/images/cleardot.gif*', r => r.abort());
      await c.route('**/*', r => {
        const u = new URL(r.request().url());
        // Los tres últimos hosts sirven la interfaz del Auth Emulator, no datos de la aplicación.
        if (['127.0.0.1', 'localhost', 'www.gstatic.com', 'apis.google.com', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(u.hostname) || (u.hostname === 'www.google.com' && u.pathname === '/images/cleardot.gif')) return r.fallback();
        forbidden.push(u.origin); return r.abort();
      });
      if (local) await c.addInitScript(() => { localStorage.setItem('defensas-account-mode', 'local'); });
      await c.exposeBinding('__csp22', (_, message) => errors.push(name + ': CSP ' + message));
      await c.addInitScript(() => document.addEventListener('securitypolicyviolation', e => { void window.__csp22(e.effectiveDirective + ' ' + e.blockedURI); }));
      const page = await c.newPage(); page.on('pageerror', e => errors.push(name + ': ' + e.message));
      await page.goto(origin); await initialized(page); return { page, context: c };
    }
    try {
      const { page: a, context: ac } = await device();
      assert(await a.locator('#loginScreen').isVisible()); await a.locator('#loginLocal').click(); await idle(a);
      const localId = await createGame(a, 'LOCAL FICTICIO 22'); await shot(a);
      const original = await raw(a); assert.equal(original.events.length, 1); assert.equal(original.syncQueue.length, 0);
      await a.reload(); await idle(a); assert.equal((await snapshot(a)).events.length, 1);
      await a.waitForFunction(() => document.querySelector('#storageNotice').textContent === 'Guardado en este dispositivo');
      pass('Modo local: registro, doble toque y recarga sin cola de Firebase');

      try { await login22(a, email); } catch (error) {
        console.error('AUTH22', await a.evaluate(() => ({ code: window.authError22, message: document.querySelector('#loginMessage').textContent, identity: document.querySelector('#accountIdentity').textContent, error: document.querySelector('#accountMessage').textContent, button: document.querySelector('#loginGoogleText').textContent })), errors, forbidden); throw error;
      }
      await a.locator('#teamSetup').waitFor({ state: 'visible' });
      assert(await a.locator('#newGameBtn').isDisabled()); assert(await a.locator('.app-shell').evaluate(n => n.inert));
      assert.equal((await contextOf(a)).scope, null); assert.equal(await a.locator('#syncEnable').count(), 0);
      await a.evaluate(() => document.querySelector('#createGameBtn').dispatchEvent(new MouseEvent('click', { bubbles: true })));
      assert.deepEqual((await raw(a)).events, original.events);
      for (const [width, height] of [[1180, 820], [820, 1180], [390, 844], [320, 740]]) {
        await a.setViewportSize({ width, height });
        assert(!await a.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.querySelector('#loginScreen').scrollWidth > innerWidth));
        assert((await a.locator('#teamSetupCreate').boundingBox()).height >= 44);
        await a.screenshot({ path: `${out}/${name}-equipo-${width}.png` });
      }
      await a.setViewportSize({ width: 1024, height: 768 });
      await a.locator('#teamSetupName').fill('Equipo ficticio 22'); await a.locator('#teamSetupCreate').dblclick();
      assert(await answerLocalData(a, 'keep')); await idle(a); await synced(a);
      assert.equal((await snapshot(a)).games.length, 0, 'Históricos no se importan al crear equipo');
      assert.deepEqual((await raw(a)).events, original.events);
      const cA = await contextOf(a), teamA = cA.teamId, uid = cA.uid;
      assert.equal(await a.evaluate(async uid => (await (await import('./js/firestore-sync.js')).loadFirestoreTransport(uid)).teams().then(t => t.length), uid), 1);
      pass('Primera sesión: bloqueo sin equipo, alta explícita única y ningún histórico subido automáticamente');

      await profile(a); await a.locator('#syncImport').click(); await a.locator('#syncReviewList input').check();
      await a.evaluate(async () => { window.review22 = await (await import('./js/sync-storage.js')).listLegacyForImport(); });
      await a.locator('#syncConfirm').click(); await closeProfile(a);
      await a.waitForFunction(() => document.querySelector('#gameSelect').options.length === 2); await synced(a);
      const importedId = await a.locator('#gameSelect option').last().getAttribute('value');
      await a.locator('#gameSelect').selectOption(importedId); await idle(a);
      await a.evaluate(async () => { const s = await import('./js/sync-storage.js'); await s.importLegacy(window.review22, s.storageContext(), true); });
      await synced(a); assert.equal((await remote(a)).filter(g => g.id === importedId)[0].events.length, 1);
      assert.deepEqual((await raw(a)).events, original.events);
      pass('Importación confirmada e idempotente: IDs históricos y originales intactos');

      const gid = await createGame(a, 'SYNC FICTICIO 22'); await shot(a); await synced(a);
      assert.equal((await remote(a)).find(g => g.id === gid).events.length, 1);
      assert.equal(await a.locator('#storageNotice').textContent(), 'Sincronizado');
      const { page: b } = await device(); await login22(b, email); await idle(b); await synced(b);
      assert.equal((await contextOf(b)).teamId, teamA); assert(await b.locator('#loginScreen').isHidden());
      await b.locator('#gameSelect').selectOption(gid); await idle(b); assert.equal((await snapshot(b)).events.length, 1);
      pass('Un equipo: selección automática, alta y tiro confirmados por servidor y recuperados en otro dispositivo');

      const teamB = await a.evaluate(async uid => (await (await import('./js/firestore-sync.js')).loadFirestoreTransport(uid)).createTeam('Segundo ficticio 22'), uid);
      await b.reload(); await idle(b); assert.equal((await contextOf(b)).teamId, teamA);
      const { page: c } = await device(); await login22(c, email); await c.locator('#teamSetupChoice').waitFor({ state: 'visible' });
      assert(await c.locator('#newGameBtn').isDisabled()); await c.locator('#teamSetupSelect').selectOption(teamB.id); await c.locator('#teamSetupContinue').click(); await idle(c); await synced(c);
      assert.equal((await snapshot(c)).games.length, 0); const gidB = await createGame(c, 'OTRO EQUIPO 22'); await shot(c); await synced(c);
      await c.reload(); await idle(c); assert.equal((await contextOf(c)).teamId, teamB.id); assert.equal((await snapshot(c)).currentGameId, gidB);
      pass('Varios equipos: elección inicial, preferencia válida, recarga y aislamiento');
      // Liberar canales de los dispositivos que ya no intervienen en esta matriz.
      // Mantener acotados los canales concurrentes de loopback de esta prueba.
      await c.context().close(); await b.goto('about:blank');

      // Una preferencia inválida y los antiguos consentimientos no permiten entrar sin equipo.
      await a.evaluate(async uid => {
        const s = await import('./js/sync-storage.js'); await s.syncPreference(uid, 'equipo-inexistente22');
        localStorage.setItem('defensas-sync-consent:' + JSON.stringify(['demo-defensas', uid]), 'disabled');
      }, uid);
      await a.reload(); await a.locator('#teamSetupChoice').waitFor({ state: 'visible' });
      await a.locator('#teamSetupSelect').selectOption(teamA); await a.locator('#teamSetupContinue').click(); await idle(a); await synced(a);
      assert.equal((await contextOf(a)).teamId, teamA); await a.locator('#gameSelect').selectOption(gid); await idle(a);
      pass('Compatibilidad 20.0: consentimiento anterior desactivado ignorado y selección inválida exige elegir');

      // Fixture 20.0: partido creado con cuenta, sin equipo, y pregunta antigua ya marcada.
      await a.evaluate(async uid => {
        const s = await import('./js/sync-storage.js'), p = await import('./js/persistencia.js'), team = s.storageContext().teamId;
        s.setStorageScope(null);
        await p.createGameAndSelect({ id: 'local-cuenta22', jornada: '22', rival: 'ANTERIOR CON CUENTA', createdAt: '2026-10-24T10:00:00Z' });
        s.setStorageScope(team);
        localStorage.setItem('defensas-local-offer:' + JSON.stringify(['demo-defensas', uid]), 'preguntado');
      }, uid);
      await a.reload(); assert(await answerLocalData(a, 'keep', 30000)); await idle(a);
      await profile(a); await a.locator('#googleLogout').click(); await a.locator('#logoutDialog').waitFor({ state: 'visible' });
      assert.match(await a.locator('#logoutMessage').textContent(), /solo en este dispositivo: 1/); assert(await a.locator('#logoutWaitBtn').isHidden());
      await a.locator('#logoutCancelBtn').click(); await profile(a); await a.locator('#syncImport').click();
      await a.locator('.sync-dialog').waitFor({ state: 'visible' });
      assert.equal(await a.locator('#syncReviewList input').count(), 1, 'El original ya importado no se vuelve a ofrecer');
      await a.locator('#syncReviewList input').check(); await a.locator('#syncConfirm').click();
      await a.locator('.sync-dialog').waitFor({ state: 'hidden' }); await closeProfile(a); await synced(a);
      await a.locator('#gameSelect').selectOption(gid); await idle(a);
      pass('Usuario 20.0 con partido local de su cuenta: oferta explícita, cierre protegido y revisión sin originales duplicados');

      await ac.setOffline(true); await a.evaluate(() => dispatchEvent(new Event('offline'))); await shot(a);
      const queued = await raw(a); assert.equal(queued.syncQueue.length, 1); assert.equal((await snapshot(a)).events.length, 2);
      await profile(a); await a.locator('#googleLogout').click(); await a.locator('#logoutDialog').waitFor({ state: 'visible' });
      assert.equal(await a.locator('#logoutForceBtn').count(), 0); assert.match(await a.locator('#logoutMessage').textContent(), /permanece abierta/);
      await a.locator('#logoutCancelBtn').click(); assert.equal((await raw(a)).syncQueue.length, 1);
      // Protección atómica aun si otra pestaña escribió después del recuento de la UI.
      const protectedPurge = await a.evaluate(async uid => { try { await (await import('./js/sync-storage.js')).purgeAccountData(uid, { protectUnsynced: true }); return 'borrado'; } catch(e) { return e.code; } }, uid);
      assert.equal(protectedPurge, 'UNSYNCED_DATA'); assert.deepEqual((await raw(a)).syncQueue, queued.syncQueue);
      pass('Sin conexión: cola atómica, cierre cancelado y protección transaccional ante una purga tardía');
      await ac.setOffline(false); await closeProfile(a);
      // Recarga con Firestore inaccesible, manteniendo disponibles archivos locales y Auth Emulator.
      let firestoreOffline = true;
      await ac.route('http://127.0.0.1:8085/**', r => firestoreOffline ? r.abort() : r.continue());
      await a.reload(); await idle(a);
      assert.equal((await contextOf(a)).teamId, teamA); assert.equal((await snapshot(a)).events.length, 2);
      assert.equal((await raw(a)).syncQueue.length, 1); assert.notEqual(await a.locator('#storageNotice').textContent(), 'Sincronizado');
      firestoreOffline = false; await a.evaluate(() => dispatchEvent(new Event('online'))); await synced(a);
      assert.equal((await remote(a)).find(g => g.id === gid).events.length, 2);
      await a.evaluate(() => { dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); dispatchEvent(new Event('pageshow')); });
      await synced(a); assert.equal((await remote(a)).find(g => g.id === gid).events.length, 2);
      pass('Recarga con equipo en caché y Firestore inaccesible; reconexión y regreso de segundo plano sin duplicados');

      // Cambio externo de identidad con una cola pendiente: no se purga ni se envía a otra cuenta.
      await ac.route('http://127.0.0.1:8085/**', r => r.abort()); await shot(a);
      const eventIds = (await snapshot(a)).events.map(e => e.id);
      await signOutExternally(a); await a.locator('#loginScreen').waitFor({ state: 'visible' });
      await login22(a, `otra22-${name}@ficticio.test`); await a.locator('#teamSetup').waitFor({ state: 'visible' });
      assert.equal((await contextOf(a)).scope, null); assert((await raw(a)).syncQueue.some(op => op.uid === uid));
      await a.locator('#loginLocal').click(); await idle(a); assert.equal((await snapshot(a)).games.length, 0, 'Original importado y cola de la otra cuenta ocultos');
      await ac.unroute('http://127.0.0.1:8085/**');
      await signOutExternally(a);
      await login22(a, email); await idle(a); await synced(a); await a.locator('#gameSelect').selectOption(gid); await idle(a);
      assert.deepEqual((await snapshot(a)).events.map(e => e.id).sort(), eventIds.sort());
      assert.equal((await remote(a)).find(g => g.id === gid).events.length, 3);
      pass('Cambio externo de cuenta con pendientes: aislamiento y recuperación con el UID original');

      await env.withSecurityRulesDisabled(async ctx => updateDoc(doc(ctx.firestore(), 'teams', teamA, 'members', uid), { status: 'inactive' }));
      await a.reload(); await a.locator('#teamSetup').waitFor({ state: 'visible' });
      assert(await a.locator('#newGameBtn').isDisabled()); assert.equal((await contextOf(a)).scope, null);
      assert.match(await a.locator('#loginMessage').textContent(), /equipo/);
      await env.withSecurityRulesDisabled(async ctx => updateDoc(doc(ctx.firestore(), 'teams', teamA, 'members', uid), { status: 'active' }));
      await a.locator('#loginRetry').click(); await idle(a); await synced(a);
      pass('Permisos revocados: error real de reglas, registro bloqueado y recuperación sin cambiar las reglas');

      // Equipo inaccesible en la primera sesión: salida local sin respaldo ficticio.
      const { page: d, context: dc } = await device();
      await d.waitForFunction(() => !document.querySelector('#loginGoogle').disabled);
      await d.evaluate(() => { window.originalOpen22 = window.open; window.open = () => null; window.rejectLogin22 = true; }); await d.locator('#loginGoogle').click();
      await d.waitForFunction(() => document.querySelector('#loginMessage').textContent.includes('ventanas emergentes'));
      await d.evaluate(() => { window.open = window.originalOpen22; window.rejectLogin22 = false; });
      pass('Error de autenticación: popup bloqueado informado, sin alterar datos ni crear equipo');
      await dc.route('http://127.0.0.1:8085/**', r => r.abort());
      await login22(d, `sin-red22-${name}@ficticio.test`); await d.locator('#loginLocal').click(); await idle(d);
      const localOffline = await createGame(d, 'LOCAL SIN EQUIPO 22'); await shot(d);
      assert.equal((await contextOf(d)).uid, null); assert.equal((await raw(d)).syncQueue.length, 0);
      assert.equal((await snapshot(d)).currentGameId, localOffline);
      pass('Primera configuración sin red: salida local identificada, sin equipo genérico ni falsa sincronización');

      // Cierre esperando: la sesión solo termina después del acuse, segundo dispositivo recibe exactamente uno.
      const peer = await ac.newPage(); await peer.goto(origin); await idle(peer); await synced(peer);
      // Volver a la pestaña emisora y esperar su restauración antes del corte.
      // Abrir peer puede restaurar la selección compartida de IndexedDB.
      await a.bringToFront(); await synced(a);
      await a.locator('#gameSelect').selectOption(gid); await idle(a);
      await a.waitForFunction(id => document.querySelector('#gameSelect').value === id, gid);
      await ac.setOffline(true); await a.evaluate(() => dispatchEvent(new Event('offline'))); await shot(a);
      await profile(a); await a.locator('#googleLogout').click(); await a.locator('#logoutWaitBtn').click();
      assert.equal((await contextOf(a)).uid, uid); await ac.setOffline(false); await a.evaluate(() => dispatchEvent(new Event('online')));
      await a.waitForFunction(() => document.querySelector('#accountIdentity').hidden && document.documentElement.dataset.login, undefined, { timeout: 60000 });
      await peer.waitForFunction(() => document.querySelector('#accountIdentity').hidden && document.documentElement.dataset.login, undefined, { timeout: 30000 });
      assert.equal((await raw(a)).syncQueue.filter(op => op.uid === uid).length, 0);
      await b.goto(origin); await idle(b); await b.locator('#gameSelect').selectOption(gid); await idle(b); await synced(b);
      assert.equal((await snapshot(b)).events.length, 4);
      assert.deepEqual((await raw(a)).events, original.events);
      pass('Esperar antes de cerrar sesión: acuse, recepción de cuatro eventos y originales conservados');
      void localId;
    } catch (error) {
      for (const c of contexts) for (const page of c.pages()) {
        if (!page.url().startsWith(origin)) continue;
        console.error('STATE22', name, await page.evaluate(() => ({ login: document.documentElement.dataset.login, message: document.querySelector('#loginMessage')?.textContent,
          cloud: document.querySelector('#cloudStatus')?.textContent, detail: document.querySelector('#syncDetail')?.textContent,
          game: document.querySelector('#gameSelect')?.value, selected: document.querySelector('#selectedDescription')?.textContent,
          results: [...document.querySelectorAll('#resultButtons button')].map(n => ({points:n.dataset.points, disabled:n.disabled})),
          dialogs: [...document.querySelectorAll('dialog[open]')].map(n => n.id || n.className) })).catch(e => e.message));
      }
      throw error;
    } finally { for (const c of contexts) await c.close(); await browser.close(); }
  }
  const unexpectedErrors = errors.filter(message => {
    // WebKit emite pageerror al cancelar XHR por cortes, recargas o cierre.
    // El reintento puede usar otro RID/zx: exigir el mismo SID del canal fallido,
    // tipo Listen/Write y base demo, nunca solo el texto genérico de WebKit.
    const match = message.match(/127\.0\.0\.1:8085\/google\.firestore\.v1\.Firestore\/(?:Listen|Write)\/channel\?[^\s]+/);
    if (message.startsWith('webkit:') && /due to access control checks\.$/.test(message) && match && failedChannels.has(channelKey('http://' + match[0]))) {
      expectedOfflineErrors.push('WebChannel cancelado/fallido en emulador'); return false;
    }
    return true;
  });
  await writeFile(`${out}/transporte.json`, JSON.stringify({ errors, failedRequests: [...failedRequests], failedChannels: [...failedChannels], unexpectedErrors }, null, 2));
  assert.deepEqual(forbidden, []); assert.deepEqual(unexpectedErrors, []);
  await writeFile(`${out}/cuentas.json`, JSON.stringify({ ok: true, reports, unexpectedErrors, expectedOfflineTransportErrors: expectedOfflineErrors.length, forbidden, realWrites: 0 }, null, 2));
} finally { await env.cleanup(); await new Promise(ok => server.close(ok)); }
