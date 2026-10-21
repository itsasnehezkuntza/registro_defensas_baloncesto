import assert from 'node:assert/strict';
import { startServer } from './servidor.mjs';
import { chromium, configure, idle, createGame, snapshot } from './browser-support.mjs';
// Desde 8C el archivo fuente tiene la sincronización disponible; el modo desactivado se prueba sirviéndolo solo aquí.
const server = await startServer(4198); let browser;
try {
  browser = await chromium.launch();
  for (const prefix of ['', '/registro_defensas_baloncesto']) {
    const context = await browser.newContext(); await configure(context, { enabled: false, config: {}, authEmulator: false });
    await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript',
      body: 'export const syncSettings = Object.freeze({ enabled: false, emulator: false, allowRealWrites: false });' }));
    const requests = [], errors = []; context.on('request', request => requests.push(request.url()));
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(String(response.status()) + ' ' + response.url()); });
    await page.goto('http://127.0.0.1:4198' + prefix + '/'); await idle(page);
    assert(!await page.locator('#loginScreen').isVisible(), 'Sin Google no hay pantalla de inicio');
    const gid = await createGame(page, 'Bandera desactivada · ficticio');
    await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1);
    await page.reload(); await idle(page); assert.equal((await snapshot(page)).currentGameId, gid);
    assert.equal(await page.locator('.sync-controls').count(), 0);
    assert.equal(await page.locator('#cloudStatus').textContent(), 'Solo local');
    const version = await page.evaluate(async () => (await indexedDB.databases()).find(db => db.name === 'registro_defensivo_baloncesto').version);
    assert.equal(version, 1, 'Con la bandera desactivada no se actualiza una base nueva/v1');
    assert(!requests.some(url => /firebase-firestore|firestore\.googleapis|sync-ui\.js/.test(url)));
    assert.deepEqual(errors, []); await context.close();
  }
  console.log('Bandera OFF: esquema v1, registro/recarga, sin cola, sin Firestore y subruta Pages correctos.');
} finally { await browser?.close(); await new Promise(ok => server.close(ok)); }
