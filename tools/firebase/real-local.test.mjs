// Perfiles efímeros y partidos ficticios. Nunca usa el perfil/datos del usuario.
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, idle, initialized, createGame, snapshot } from './browser-support.mjs';
const server = await startServer(4198);
const reports = [];
let browser;
try {
  browser = await chromium.launch();
  for (const mode of ['real-sdk', 'sdk-failure', 'sdk-stalled']) {
    const context = await browser.newContext({ acceptDownloads: true });
    let release;
    if (mode === 'sdk-failure') await context.route('https://www.gstatic.com/firebasejs/**', route => route.abort());
    if (mode === 'sdk-stalled') {
      const gate = new Promise(ok => { release = ok; });
      await context.route('https://www.gstatic.com/firebasejs/**', async route => { await gate; await route.abort(); });
    }
    const firestore = [];
    context.on('request', request => { if (new URL(request.url()).hostname === 'firestore.googleapis.com') firestore.push('unexpected-firestore'); });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:4198/'); await initialized(page);
    const settings = await page.evaluate(async () => {
      const { firebaseSettings: s } = await import('./js/firebase-config.js');
      return { enabled: s.enabled, projectId: s.config.projectId, emulator: s.authEmulator };
    });
    assert.deepEqual(settings, { enabled: true, projectId: 'registro-defensivo', emulator: false });
    assert.equal((await snapshot(page)).games.length, 0, 'base ficticia nueva');
    // Fase 10: primera apertura con inicio de sesión; el registro local siempre está a un toque.
    assert(await page.locator('#loginScreen').isVisible());
    if (mode === 'real-sdk') await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled);
    if (mode === 'sdk-failure') await page.waitForFunction(() => !document.querySelector('#loginRetry').hidden);
    await page.locator('#loginLocal').click();
    const id = await createGame(page, 'Prueba aislada 8A.1 · ' + mode);
    await page.locator('.action-btn').first().click();
    await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1);
    assert.equal(await page.locator('#saveStatusText').textContent(), 'Guardado localmente');
    if (mode === 'sdk-stalled') {
      release();
      await page.waitForTimeout(200);
      assert(await page.locator('#loginScreen').isHidden(), 'La restauración cancelada no vuelve a bloquear');
    } else if (mode === 'real-sdk') {
      await context.setOffline(true);
      await page.locator('.action-btn').first().click();
      await page.locator('[data-points="2"][data-result="anotado"]').click(); await idle(page);
      assert.equal((await snapshot(page)).events.length, 2);
      await context.setOffline(false);
      await page.locator('#undoBtn').click(); await idle(page);
      assert.equal((await snapshot(page)).events.length, 1);
    }
    await page.reload(); await idle(page);
    assert(!await page.locator('#loginScreen').isVisible(), '«Sin cuenta» se recuerda');
    assert.equal((await snapshot(page)).events.length, 1);
    assert.equal((await snapshot(page)).currentGameId, id);
    assert.equal(await page.locator('#cloudStatus').textContent(), 'Solo local');
    if (!await page.locator('#exportCsvBtn').isVisible()) await page.locator('#moreBtn').click();
    const downloading = page.waitForEvent('download'); await page.locator('#exportCsvBtn').click();
    const csv = await readFile(await (await downloading).path());
    assert.equal(csv.subarray(0, 3).toString('hex'), 'efbbbf'); assert(csv.toString('utf8').includes(id));
    await idle(page); await page.locator('#undoBtn').click(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 0);
    assert.deepEqual(firestore, []); assert.deepEqual(errors, []);
    reports.push({ mode, settings, localSave: true, doubleTap: true, reload: true, undo: true, csv: true,
      offlineShot: mode === 'real-sdk', firestoreRequests: 0 });
    await context.close();
    console.log(mode + ': guardado local, doble toque, recarga, Deshacer y CSV correctos.');
  }
  const out = new URL('../../.test-artifacts/firebase/', import.meta.url);
  await mkdir(out, { recursive: true });
  await writeFile(new URL('real-local.json', out), JSON.stringify({ ok: true, reports }, null, 2));
} finally { await browser?.close(); await new Promise(ok => server.close(ok)); }
