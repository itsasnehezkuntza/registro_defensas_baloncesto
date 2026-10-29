import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startServer } from './servidor.mjs';
import { chromium, idle, initialized, createGame, snapshot, configure, testConfig } from './browser-support.mjs';
const out = new URL('../../.test-artifacts/firebase/', import.meta.url);
await mkdir(out, { recursive: true });
const server = await startServer();
const reports = [];
// Fase 10: usuario que ya eligió «Continuar sin cuenta» en este navegador.
const asLocal = context => context.addInitScript(() => { try { localStorage.setItem('defensas-account-mode', 'local'); } catch {} });
// Únicos destinos externos admitidos, y solo mientras se muestra la pantalla de inicio: SDK oficial y Auth.
const FIREBASE_HOSTS = ['www.gstatic.com', 'registro-defensivo.firebaseapp.com', 'identitytoolkit.googleapis.com', 'securetoken.googleapis.com'];
let browser;
try {
  browser = await chromium.launch();
  for (const phase of [2, 3, 5, 6, 10]) {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4198/tests/fase${phase}.html?isolated=1`);
    await page.waitForFunction(phase => window['phase' + phase + 'Result'], phase, { timeout: 180000 });
    const result = await page.evaluate(phase => window['phase' + phase + 'Result'], phase);
    assert(result.ok, JSON.stringify(result)); reports.push({ phase, ...result });
    console.log('Regresión fase ' + phase + ': correcta'); await context.close();
  }
  // Primera apertura: pantalla de inicio; tras «Continuar sin cuenta» y recargar, ninguna petición externa.
  {
    const context = await browser.newContext({ viewport: { width: 1180, height: 740 } });
    const requests = [];
    context.on('request', request => { if (!request.url().startsWith('http://127.0.0.1')) requests.push(new URL(request.url()).hostname); });
    const page = await context.newPage(); await page.goto('http://127.0.0.1:4198/'); await initialized(page);
    assert(await page.locator('#loginScreen').isVisible(), 'Sin elección previa debe mostrarse el inicio de sesión');
    assert(await page.locator('.app-shell').evaluate(node => node.inert), 'La aplicación debe quedar inerte detrás');
    await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled || !document.querySelector('#loginRetry').hidden, undefined, { timeout: 20000 });
    assert(requests.every(host => FIREBASE_HOSTS.includes(host)), JSON.stringify(requests));
    await page.locator('#loginLocal').click();
    assert(!await page.locator('#loginScreen').isVisible());
    const before = requests.length;
    await page.reload(); await idle(page); await page.waitForTimeout(1500);
    assert(!await page.locator('#loginScreen').isVisible(), 'La elección «sin cuenta» se recuerda');
    assert.equal(requests.length, before, 'Con «sin cuenta» no hay peticiones externas: ' + JSON.stringify(requests.slice(before)));
    reports.push({ firstOpen: true, loginHosts: [...new Set(requests)], afterLocalReload: 0 }); await context.close();
  }
  for (const [width, height] of [[1440, 900], [1180, 820], [1024, 768], [768, 1024], [390, 844], [320, 740], [844, 390]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, acceptDownloads: true });
    await asLocal(context);
    const requests = [], errors = [];
    context.on('request', request => { if (!request.url().startsWith('http://127.0.0.1')) requests.push(request.url()); });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(response.url() + ' ' + response.status()); });
    await page.goto('http://127.0.0.1:4198/'); await idle(page);
    assert.equal((await snapshot(page)).games.length, 0, 'contexto efímero sin datos previos');
    const gameId = await createGame(page);
    await page.locator('.action-btn').first().click();
    await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1);
    await page.reload(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1);
    assert.equal(await page.locator('#cloudStatus').textContent(), 'Guardado en este dispositivo');
    assert.equal(await page.locator('#saveStatusText').textContent(), 'Guardado en este dispositivo');
    assert((await page.locator('#saveStatus').boundingBox()).width <= 1, 'Sin indicador visible de guardado');
    // V4: exportar está en el menú «⋯», que ya no contiene la cuenta.
    const download = page.waitForEvent('download'); await page.locator('#moreBtn').click();
    assert.equal(await page.locator('#moreMenu #googleLogin, #moreMenu #cloudStatus').count(), 0, '«⋯» solo con acciones del partido');
    await page.locator('#exportCsvBtn').click();
    const csv = await readFile(await (await download).path());
    assert.equal(csv.subarray(0, 3).toString('hex'), 'efbbbf'); assert(csv.toString('utf8').includes(gameId));
    await idle(page);
    await page.locator('#viewStatsBtn').click();
    await page.waitForFunction(() => document.body.dataset.view === 'estadisticas');
    assert.equal(await page.locator('.matrix-cell').count(), 36);
    await page.locator('.matrix-cell').first().click();
    await page.locator('#viewRecordBtn').click();
    await page.waitForFunction(() => document.body.dataset.view === 'registro');
    await page.locator('#profileBtn').click(); // Cuenta en el menú de perfil.
    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      buttons: [...document.querySelectorAll('#profileBtn, #profileMenu button:not([hidden]), .result-btn')].map(button => {
        const r = button.getBoundingClientRect(); return { id: button.id, width: r.width, height: r.height,
          clipped: button.scrollWidth > button.clientWidth + 1, left: r.left, right: r.right };
      })
    }));
    assert(!geometry.overflow, JSON.stringify(geometry));
    for (const button of geometry.buttons) {
      assert(button.width >= 44 && button.height >= 44 && !button.clipped, JSON.stringify(button));
      assert(button.left >= 0 && button.right <= width + 1, JSON.stringify(button));
    }
    await page.screenshot({ path: fileURLToPath(new URL(`local-${width}-${height}.png`, out)), fullPage: true });
    await page.keyboard.press('Escape');
    await page.locator('#undoBtn').click(); await idle(page); assert.equal((await snapshot(page)).events.length, 0);
    assert.deepEqual(requests, []); assert.deepEqual(errors, []);
    reports.push({ width, height, ok: true, ...geometry }); await context.close();
  }
  // SDK inaccesible y configuración inválida: la aplicación local debe seguir operativa.
  for (const mode of ['invalid', 'sdk-failure', 'sdk-stalled']) {
    const context = await browser.newContext();
    await configure(context, mode === 'invalid' ? { enabled: true, config: {} } : testConfig);
    if (mode === 'sdk-failure') await context.route('https://www.gstatic.com/**', route => route.abort());
    let release;
    if (mode === 'sdk-stalled') {
      const gate = new Promise(ok => { release = ok; });
      await context.route('https://www.gstatic.com/**', async route => { await gate; await route.abort(); });
    }
    const page = await context.newPage(); await page.goto('http://127.0.0.1:4198/'); await initialized(page);
    if (mode !== 'sdk-stalled') await page.waitForFunction(() => !document.querySelector('#loginRetry').hidden);
    else assert.equal(await page.locator('#loginGoogleText').textContent(), 'Cargando…');
    // «Continuar sin cuenta» siempre está disponible, también mientras Google no responde.
    await page.locator('#loginLocal').click();
    await createGame(page, 'Error de cuenta · partido ficticio');
    await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="anotado"]').click(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1);
    assert.equal(await page.locator('#saveStatusText').textContent(), 'Guardado en este dispositivo');
    assert.equal(await page.locator('#cloudStatus').textContent(), 'Guardado en este dispositivo');
    if (mode === 'sdk-stalled') {
      // Elegir sin cuenta invalida también el timeout/callback de la restauración.
      release();
      await page.waitForTimeout(200);
      assert(await page.locator('#loginScreen').isHidden());
      assert.equal(await page.evaluate(() => localStorage.getItem('defensas-account-mode')), 'local');
    }
    reports.push({ fault: mode, localWorks: true }); await context.close();
  }
  const context = await browser.newContext(); await asLocal(context); const page = await context.newPage();
  const failures = []; page.on('response', r => { if (r.status() >= 400) failures.push(r.url()); });
  await page.goto('http://127.0.0.1:4198/registro_defensas_baloncesto/'); await idle(page);
  assert.equal(await page.locator('#cloudStatus').textContent(), 'Guardado en este dispositivo');
  assert.deepEqual(failures, []); reports.push({ pagesSubpath: true }); await context.close();
  await writeFile(new URL('local.json', out), JSON.stringify({ ok: true, reports }, null, 2));
  console.log('Fase 8A/10: regresiones 2–10, inicio de sesión, 7 tamaños sin peticiones externas, fallos Firebase, CSV y subruta correctos.');
} finally { await browser?.close(); await new Promise(ok => server.close(ok)); }
