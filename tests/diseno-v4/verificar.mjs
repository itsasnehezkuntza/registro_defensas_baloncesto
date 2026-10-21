// Verificación Fase 9 (diseño V4). Contextos efímeros de Chromium, datos ficticios y peticiones externas bloqueadas.
// Uso: node tests/diseno-v4/verificar.mjs [--solo-visual]
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { server } from './servidor.mjs';
import { seedSample } from './muestra.mjs';

const dir = new URL('./', import.meta.url), root = new URL('../../', import.meta.url);
const BASE = 'http://127.0.0.1:4192';
process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('.test-artifacts/playwright/browsers', root));
const { chromium } = await import('@playwright/test');
await mkdir(new URL('capturas/', dir), { recursive: true });
const report = { fecha: new Date().toISOString(), regresiones: [], partidos: null, tamanos: [] };
const shot = (page, name, fullPage = false) => page.screenshot({ path: fileURLToPath(new URL(`capturas/${name}.png`, dir)), fullPage, animations: 'disabled' });
const idle = page => page.waitForFunction(() => !document.querySelector('#gameSelect').disabled);
async function isolated(browser, options = {}, { firstOpen = false } = {}) {
  const context = await browser.newContext({ locale: 'es-ES', reducedMotion: 'reduce', acceptDownloads: true, ...options });
  // Sin Firebase ni otros servicios: solo el servidor local.
  await context.route(url => !url.href.startsWith(BASE), route => route.abort());
  // Fase 10: salvo en la primera apertura, usuario que ya eligió «Continuar sin cuenta».
  if (!firstOpen) await context.addInitScript(() => { try { localStorage.setItem('defensas-account-mode', 'local'); } catch {} });
  return context;
}
// Sesión de Google simulada solo para medir y capturar el menú de perfil (sin SDK ni red).
async function signedIn(context) {
  const real = (await readFile(new URL('js/cuenta.js', root), 'utf8')).replace('export function createAccountController', 'function realAccountController');
  const fake = `
export function createAccountController() {
  const state = { status: 'ready', busy: false, error: '', sessionVersion: 1,
    user: Object.freeze({ uid: 'cuenta-ficticia', displayName: 'Jone Garai', email: 'entrenadora.ficticia@example.test', photoURL: '' }) };
  return { subscribe(fn) { fn(state); return () => {}; }, start: async () => {}, act: async () => false, dispose() {} };
}`;
  await context.route('**/js/cuenta.js', route => route.fulfill({ contentType: 'text/javascript', body: real + fake }));
  await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'export const syncSettings = Object.freeze({ enabled: false, emulator: false, allowRealWrites: false });' }));
  await context.addInitScript(() => { try { localStorage.setItem('defensas-account-mode', 'google'); } catch {} });
}
async function createGame(page, round = '7', rival = 'CB Ficticio') {
  await page.locator('#newGameBtn').click();
  await page.locator('#roundInput').fill(round); await page.locator('#rivalInput').fill(rival);
  await page.locator('#createGameBtn').click(); await idle(page);
  return page.locator('#gameSelect').inputValue();
}
const events = page => page.evaluate(async () => (await (await import('./js/persistencia.js')).readState()).events);
async function menu(page, item) {
  await page.locator('#moreBtn').click();
  await page.locator(item).click();
}

const pages = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', fileURLToPath(new URL('tests/preparar-pages.ps1', root))], { encoding: 'utf8' });
assert.equal(pages.status, 0, pages.stderr || pages.stdout);
await new Promise((ok, fail) => { server.once('error', fail); server.listen(4192, '127.0.0.1', ok); });
let browser;
try {
  browser = await chromium.launch({ headless: !process.argv.includes('--headed') });
  if (!process.argv.includes('--solo-visual')) {
    for (const phase of [2, 3, 5, 6, 10]) {
      const context = await isolated(browser); const page = await context.newPage(); let downloads = 0;
      page.on('download', () => downloads++);
      await page.goto(`${BASE}/tests/fase${phase}.html?isolated=1`);
      await page.waitForFunction(p => window['phase' + p + 'Result'], phase, { timeout: 240000 });
      const result = await page.evaluate(p => window['phase' + p + 'Result'], phase);
      assert(result.ok, JSON.stringify(result).slice(0, 2000));
      if (phase === 5) assert(downloads > 0, 'Fase 5 sin descarga');
      report.regresiones.push({ fase: phase, ok: true, grupos: (result.checks || result.results || []).length });
      console.log(`Fase ${phase}: correcta`); await context.close();
    }
    report.partidos = await verifyGames(browser);
    console.log('Partidos, pestañas, eliminar desde el menú, recarga y subruta: correctos');
  }
  for (const [width, height] of [[1180, 740], [1133, 670], [1366, 1024], [820, 1180], [390, 844]]) {
    report.tamanos.push(await verifySize(browser, width, height));
    console.log(`${width}×${height}: correcto`);
  }
} finally {
  await browser?.close(); server.close();
  await writeFile(new URL('verificacion.json', dir), JSON.stringify(report, null, 2));
}

async function verifyGames(browser) {
  const context = await isolated(browser);
  try {
    const page = await context.newPage();
    const total = (p, n) => p.waitForFunction(n => document.querySelector('#statsResults')?.textContent === (n ? '1/1' : '—'), n);
    await page.goto(BASE + '/'); await idle(page);
    const first = await createGame(page, '1', 'Prueba A');
    await page.locator('.action-btn').first().click(); await page.locator('.result-btn[data-points="2"][data-result="anotado"]').click(); await idle(page);
    await page.locator('#viewStatsBtn').click(); await total(page, 1);
    assert.equal(await page.locator('#viewStatsBtn').getAttribute('aria-current'), 'page');
    const second = await createGame(page, '1', 'Prueba B'); await total(page, 0);
    await page.locator('#gameSelect').selectOption(first); await idle(page); await total(page, 1);
    const peer = await context.newPage(); await peer.goto(BASE + '/#estadisticas'); await idle(peer); await total(peer, 1);
    await page.locator('#gameSelect').selectOption(second); await idle(page); await total(page, 0); await total(peer, 0);
    await page.locator('#gameSelect').selectOption(first); await idle(page); await total(peer, 1);
    await peer.locator('#undoBtn').click(); await idle(peer); await total(peer, 0); await total(page, 0);
    await menu(page, '#deleteGameBtn'); assert(await page.locator('#moreMenu').isHidden(), 'El menú sigue abierto');
    await page.locator('#cancelDeleteBtn').click(); assert.equal(await page.locator('#gameSelect').inputValue(), first);
    await menu(page, '#deleteGameBtn'); await page.locator('#confirmDeleteBtn').click(); await idle(page);
    const state = await page.evaluate(async () => (await import('./js/persistencia.js')).readState());
    assert.equal(state.games.length, 1); assert.equal(state.games[0].id, second);
    await page.reload(); await idle(page); assert(await page.locator('#statisticsView').isVisible());
    const sub = await context.newPage(); const failures = [];
    sub.on('response', r => { if (r.status() >= 400) failures.push(r.url()); });
    await sub.goto(BASE + '/registro_defensas_baloncesto/'); await idle(sub);
    assert.equal(await sub.locator('[data-category]').count(), 33);
    assert.equal(await sub.locator('.result-dock').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    assert.deepEqual(failures, []);
    return { ok: true, aislamiento: true, pestanas: true, deshacerRemoto: true, eliminarSoloSeleccionado: true, recarga: true, subrutaPages: true };
  } finally { await context.close(); }
}

async function verifySize(browser, width, height) {
  const name = `${width}x${height}`, phone = width < 700;
  const context = await isolated(browser, { viewport: { width, height }, hasTouch: true, isMobile: phone });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  try {
    await page.goto(BASE + '/'); await idle(page);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('[data-category]').count(), 33);
    await shot(page, `${name}-sin-partido`);
    await createGame(page);
    await seedSample(page); await page.reload(); await idle(page); await page.evaluate(() => document.fonts.ready);
    // Selección: celda coral con marca, píldoras de columna y fila; Roller solo admite 2.
    const roller = page.locator('[data-action="pr_roller"][data-strategy="blue"]');
    await roller.click();
    assert.equal(await roller.getAttribute('aria-pressed'), 'true');
    assert.equal(await roller.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(218, 90, 53)');
    assert.equal(await page.locator('.defense-heading.is-axis-selected').textContent(), 'Blue');
    assert.equal(await page.locator('.direct-row.is-axis-selected .direct-type strong').textContent(), 'PR Roller');
    assert.deepEqual(await page.locator('.result-btn').evaluateAll(b => b.map(x => x.disabled)), [false, true, false, true]);
    assert.equal(await page.locator('#selectedDescription').textContent(), 'PR Roller · Blue');
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, `${name}-registro`, phone);
    const layout = await page.evaluate(phone => {
      const dock = document.querySelector('.result-dock').getBoundingClientRect();
      const rect = el => el.getBoundingClientRect();
      const options = [...document.querySelectorAll('[data-category]')];
      const results = [...document.querySelectorAll('.result-btn')];
      // En iPad las 33 opciones y los 4 resultados deben verse sin desplazar; en móvil se comprueba al final del scroll.
      if (phone) window.scrollTo(0, document.documentElement.scrollHeight);
      const covered = options.filter(el => { const r = rect(el); return phone ? r.bottom > dock.top : r.top < 0 || r.bottom > dock.top || r.right > innerWidth + 0.5; })
        .map(el => el.dataset.action + ':' + (el.dataset.strategy || ''));
      const inScroller = el => el.closest('.direct-matrix') && getComputedStyle(el.closest('.direct-matrix')).overflowX === 'auto';
      const offscreen = results.filter(el => { const r = rect(el); return r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth; }).length;
      const textSelectors = '.brand h1, .game-picker-label, #newGameBtn span, #saveStatusText, #undoBtn span, .view-switch span, .panel-heading h2, .panel-summary, .action-name, .action-score, .defense-score, .defense-heading, .direct-type strong, .direct-type span, .selection-label, #selectedDescription, .selection-meta, .result-value, .result-label';
      const clipped = [...document.querySelectorAll(textSelectors)].filter(el => {
        const s = getComputedStyle(el); if (s.position === 'absolute' && s.clip !== 'auto') return false; // Solo lectores de pantalla.
        if (el.closest('[hidden]') || s.display === 'none' || !el.getClientRects().length) return false;
        return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 2;
      }).map(el => `${el.className || el.id}:${el.textContent.trim()}`);
      const targets = [...document.querySelectorAll('.action-btn, .defense-btn, .result-btn, #newGameBtn, #undoBtn, #moreBtn, #profileBtn, .game-picker')]
        .filter(el => el.getClientRects().length).filter(el => { const r = rect(el); return r.width < 44 || r.height < 44; }).map(el => el.id || el.className);
      // Selector de vista: 36 px visibles, área táctil ampliada a 44 px mediante ::before.
      const switchHits = [...document.querySelectorAll('.view-switch button')].every(el => {
        window.scrollTo(0, 0); const r = rect(el);
        return document.elementFromPoint(r.left + r.width / 2, r.top - 3) === el && document.elementFromPoint(r.left + r.width / 2, r.bottom + 3) === el;
      });
      window.scrollTo(0, 0);
      const saveStatus = document.querySelector('#saveStatus').getBoundingClientRect().width;
      return { overflowX: document.documentElement.scrollWidth > innerWidth, covered, offscreen, clipped, smallTargets: targets, switchHits, saveStatus,
        options: options.length, inScroller: options.filter(inScroller).length, dockTop: Math.round(dock.top), lastOption: Math.round(Math.max(...options.map(el => rect(el).bottom))) };
    }, phone);
    assert(!layout.overflowX, 'Scroll horizontal de página');
    assert.deepEqual(layout.covered, [], 'Opciones tapadas por la barra: ' + layout.covered);
    assert.equal(layout.offscreen, 0, 'Resultados fuera de pantalla');
    assert.deepEqual(layout.clipped, [], 'Textos recortados');
    assert.deepEqual(layout.smallTargets, [], 'Objetivos < 44 px');
    assert(layout.switchHits, 'Selector de vista sin área táctil de 44 px');
    assert(layout.saveStatus <= 1, 'Fase 10: sin indicador permanente de guardado');
    // Doble toque: un solo evento. Deshacer: vuelve al estado anterior.
    const before = (await events(page)).length;
    await page.locator('.result-btn[data-points="2"][data-result="fallado"]').evaluate(el => { el.click(); el.click(); }); await idle(page);
    assert.equal((await events(page)).length, before + 1);
    assert.equal(await roller.locator('.defense-score').textContent(), '2/3'); // anotados/intentos
    await page.locator('#undoBtn').click(); await idle(page);
    assert.equal((await events(page)).length, before);
    // Menú «⋯»: CSV del activo con BOM; Escape cierra y devuelve el foco.
    const download = page.waitForEvent('download'); await menu(page, '#exportCsvBtn');
    const csv = await readFile(await (await download).path());
    assert.equal(csv.subarray(0, 3).toString('hex'), 'efbbbf'); assert.equal(csv.toString('utf8').trim().split(/\r?\n/).length, before + 1);
    await page.locator('#moreBtn').click(); await shot(page, `${name}-menu`);
    await page.keyboard.press('Escape'); assert(await page.locator('#moreMenu').isHidden());
    assert.equal(await page.evaluate(() => document.activeElement.id), 'moreBtn');
    // Fase 10: «⋯» solo con acciones del partido; perfil sin cuenta en el avatar.
    assert.deepEqual(await page.locator('#moreMenu button').evaluateAll(b => b.map(x => x.id)), ['editButtonsBtn', 'exportCsvBtn', 'clearGameBtn', 'deleteGameBtn']);
    await page.locator('#profileBtn').click(); await shot(page, `${name}-perfil-sin-cuenta`);
    const profileLocal = await menuGeometry(page, width);
    assert.deepEqual(profileLocal.problems, [], 'Menú de perfil: ' + JSON.stringify(profileLocal));
    await page.keyboard.press('Escape'); assert(await page.locator('#profileMenu').isHidden());
    assert.equal(await page.evaluate(() => document.activeElement.id), 'profileBtn');
    // Vaciar partido: diálogo con partido y recuento; Cancelar destacado.
    await menu(page, '#clearGameBtn'); await shot(page, `${name}-vaciar`);
    assert.match(await page.locator('#clearGameMessage').textContent(), /68 tiros/);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'cancelClearBtn');
    await page.locator('#cancelClearBtn').click();

    // Estadísticas
    await page.locator('#viewStatsBtn').click(); await page.waitForFunction(() => document.body.dataset.view === 'estadisticas');
    assert(await page.locator('.result-dock').isHidden());
    assert.equal(await page.locator('#statsResults').textContent(), '29/68');
    assert.equal(await page.locator('.matrix-cell').count(), 36);
    assert.equal(await page.locator('#matrixDetail').count(), 0, 'Desglose abierto sin pulsar');
    const verdicts = await page.locator('.verdict').allInnerTexts();
    assert.deepEqual(verdicts.map(t => t.replace(/\s+/g, ' ').trim()), ['MEJOR WHITE 0/5', 'A MEJORAR BLUE 4/6']);
    assert.deepEqual(await page.locator('.ranking-name').allTextContents(), ['Cortes', 'Spot up 3', '1c1 exterior', '1c1 interior', 'Pin down', 'Of. Screen', 'Spain']);
    assert.deepEqual(await page.locator('.ranking-tag').evaluateAll(t => t.map(x => x.textContent)), ['Mejor', 'Mejor', 'Peor', '', '', '', '']);
    assert.equal(await page.locator('.donut').count(), 2);
    await page.evaluate(() => window.scrollTo(0, 0)); await shot(page, `${name}-estadisticas`, true);
    // Desglose bajo la fila de la celda, con pestaña apuntando a ella.
    const checkDetail = async (key, expected) => {
      const cell = page.locator(`[data-matrix-key='${key}']`);
      await cell.click();
      assert.equal(await cell.getAttribute('aria-expanded'), 'true');
      const geometry = await page.evaluate(key => {
        const button = [...document.querySelectorAll('[data-matrix-key]')].find(b => b.dataset.matrixKey === key);
        const row = button.closest('tr'), detailRow = document.querySelector('#matrixDetail').closest('tr');
        const notch = document.querySelector('.matrix-notch').getBoundingClientRect(), cell = button.getBoundingClientRect();
        const facts = [...document.querySelectorAll('.detail-facts dd')].map(d => d.textContent);
        const scroller = document.querySelector('.matrix-scroll').getBoundingClientRect(), detail = document.querySelector('#matrixDetail').getBoundingClientRect();
        return { below: row.nextElementSibling === detailRow, notchCenter: notch.left + notch.width / 2, cellLeft: cell.left, cellRight: cell.right,
          facts, pct: document.querySelector('.detail-pct b').textContent, title: document.querySelector('.detail-title').textContent,
          detailVisible: detail.left >= scroller.left - 1 && detail.right <= scroller.right + 1 };
      }, key);
      assert(geometry.below, 'El desglose no está justo debajo de la fila');
      assert(geometry.notchCenter >= geometry.cellLeft && geometry.notchCenter <= geometry.cellRight, 'La pestaña no apunta a la celda: ' + JSON.stringify(geometry));
      assert(geometry.detailVisible, 'El desglose sale de la zona visible');
      assert.deepEqual([geometry.title, geometry.pct, ...geometry.facts], expected);
    };
    await checkDetail('["cell","pr_pop","red"]', ['PR Pop · Red', '33%', '3', '1', '2', '5', '1,67']);
    await page.locator('#matrixDetail').scrollIntoViewIfNeeded(); await shot(page, `${name}-desglose`);
    await checkDetail('["row","pr_manejador"]', ['PR Manejador · Total', '67%', '12', '8', '4', String(await pointsOf(page, 'pr_manejador')), await rateOf(page, 'pr_manejador')]);
    await checkDetail('["column","white"]', ['Total · White', '100%', '5', '5', '0', '0', '0,00']);
    await page.locator('[data-detail-close]').click();
    assert.equal(await page.locator('#matrixDetail').count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.matrixKey), '["column","white"]');
    await page.locator('[data-matrix-key=\'["total"]\']').click(); await page.keyboard.press('Escape');
    assert.equal(await page.locator('#matrixDetail').count(), 0, 'Escape no cierra el desglose');
    const statsLayout = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth > innerWidth,
      clipped: [...document.querySelectorAll('.game-card-total, .category-card-value, .category-card-label, .verdict, .col-head, .matrix-points, .analysis-matrix th, .donut-value, .donut-name, .ranking-name, .ranking-score, .tag')]
        .filter(el => el.getClientRects().length && !el.closest('.matrix-scroll')?.scrollLeft && (el.scrollWidth > el.clientWidth + 1))
        .map(el => `${el.className}:${el.textContent.trim()}`),
      small: [...document.querySelectorAll('.matrix-cell, .detail-close')].filter(el => { const r = el.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length
    }));
    assert(!statsLayout.overflowX, 'Scroll horizontal en Estadísticas');
    assert.deepEqual(statsLayout.clipped, [], 'Textos recortados en Estadísticas');
    assert.equal(statsLayout.small, 0);
    // Recarga conserva la vista; el desglose solo vive en memoria.
    await page.reload(); await idle(page);
    assert(await page.locator('#statisticsView').isVisible()); assert.equal(await page.locator('#matrixDetail').count(), 0);
    await page.locator('#viewRecordBtn').click(); await page.waitForFunction(() => document.body.dataset.view === 'registro');
    assert.deepEqual(errors, []);
    const fase10 = await verifyAccountScreens(browser, width, height);
    return { tamano: name, ok: true, ...layout, statsLayout, fase10, perfilSinCuenta: profileLocal };
  } finally { await context.close(); }
}
async function menuGeometry(page, width) {
  return page.evaluate(width => {
    const menu = document.querySelector('#profileMenu').getBoundingClientRect(), problems = [];
    if (menu.left < 0 || menu.right > width + 0.5 || menu.bottom > innerHeight + 0.5) problems.push('fuera de la pantalla');
    if (document.documentElement.scrollWidth > innerWidth) problems.push('scroll horizontal');
    for (const el of document.querySelectorAll('#profileMenu button, #profileBtn')) {
      if (!el.getClientRects().length) continue; const r = el.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) problems.push('objetivo < 44: ' + el.id);
      if (el.scrollWidth > el.clientWidth + 1) problems.push('texto recortado: ' + el.id);
    }
    return { problems, left: Math.round(menu.left), right: Math.round(menu.right), bottom: Math.round(menu.bottom) };
  }, width);
}
// Fase 10: pantalla de inicio (primera apertura) y menú de perfil con sesión, en cada tamaño.
async function verifyAccountScreens(browser, width, height) {
  const name = `${width}x${height}`, phone = width < 700, result = {};
  const first = await isolated(browser, { viewport: { width, height }, hasTouch: true, isMobile: phone }, { firstOpen: true });
  try {
    const page = await first.newPage(); await page.goto(BASE + '/');
    await page.waitForFunction(() => document.querySelector('#saveStatusText').textContent === 'Guardado localmente');
    await page.waitForFunction(() => !document.querySelector('#loginRetry').hidden || !document.querySelector('#loginGoogle').disabled);
    // Sin red en las pruebas: el aviso de error se oculta solo para la captura comparable con el lienzo.
    await page.evaluate(() => { document.querySelector('#loginMessage').textContent = ''; document.querySelector('#loginRetry').hidden = true;
      document.querySelector('#loginGoogle').disabled = false; document.querySelector('#loginGoogleText').textContent = 'Continuar con Google'; });
    await page.evaluate(() => document.fonts.ready); await shot(page, `${name}-inicio-sesion`);
    result.login = await page.evaluate(() => {
      const screen = document.querySelector('#loginScreen'), card = document.querySelector('.login-card').getBoundingClientRect();
      const panel = document.querySelector('.login-box').getBoundingClientRect();
      const small = [...screen.querySelectorAll('button')].filter(b => b.getClientRects().length).filter(b => { const r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map(b => b.id);
      const clipped = [...screen.querySelectorAll('.login-claim, .login-box h2, button, .login-note, .login-lead')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.className || el.id);
      return { fitsHeight: screen.scrollHeight <= screen.clientHeight + 1, overflowX: screen.scrollWidth > screen.clientWidth + 1,
        cardFirst: card.bottom <= panel.top + 1, cardLeft: card.right <= panel.left + 1, small, clipped,
        inert: document.querySelector('.app-shell').inert };
    });
    const portrait = width < 900 || height > width;
    assert(result.login.inert && !result.login.overflowX && !result.login.small.length && !result.login.clipped.length, JSON.stringify(result.login));
    assert(portrait ? result.login.cardFirst : result.login.cardLeft, 'Tarjeta coral mal colocada: ' + JSON.stringify(result.login));
    if (!phone) assert(result.login.fitsHeight, 'El inicio de sesión no cabe sin desplazar en iPad: ' + JSON.stringify(result.login));
    await page.locator('#loginLocal').click(); assert(await page.locator('#loginScreen').isHidden());
  } finally { await first.close(); }
  const account = await isolated(browser, { viewport: { width, height }, hasTouch: true, isMobile: phone }, { firstOpen: true });
  try {
    await signedIn(account);
    const page = await account.newPage(); await page.goto(BASE + '/'); await idle(page);
    await page.waitForFunction(() => document.querySelector('#profileAvatar').textContent === 'JG');
    assert(await page.locator('#loginScreen').isHidden(), 'Con sesión no se muestra el inicio');
    await page.locator('#profileBtn').click(); await page.evaluate(() => document.fonts.ready);
    await shot(page, `${name}-perfil`);
    result.profile = await menuGeometry(page, width);
    assert.deepEqual(result.profile.problems, [], 'Menú de perfil con sesión: ' + JSON.stringify(result.profile));
    assert.equal(await page.locator('#profileName').textContent(), 'Jone Garai');
    assert(await page.locator('#profileProvider').isVisible() && await page.locator('#googleLogout').isVisible());
    // Registro con sesión: la cabecera con avatar sigue cabiendo sin desplazar en iPad.
    await page.keyboard.press('Escape'); await createGame(page); await page.evaluate(() => document.fonts.ready);
    result.registro = await page.evaluate(phone => ({ overflowX: document.documentElement.scrollWidth > innerWidth,
      fits: phone || document.documentElement.scrollHeight <= innerHeight + 1 }), phone);
    assert(!result.registro.overflowX && result.registro.fits, 'Registro con sesión: ' + JSON.stringify(result.registro));
  } finally { await account.close(); }
  return result;
}
async function pointsOf(page, action) {
  return page.evaluate(async action => (await (await import('./js/persistencia.js')).readState()).events
    .filter(e => e.accion_id === action && e.resultado === 'anotado').reduce((n, e) => n + e.valor_tiro, 0), action);
}
async function rateOf(page, action) {
  return page.evaluate(async action => {
    const list = (await (await import('./js/persistencia.js')).readState()).events.filter(e => e.accion_id === action);
    const points = list.filter(e => e.resultado === 'anotado').reduce((n, e) => n + e.valor_tiro, 0);
    return (points / list.length).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, action);
}
