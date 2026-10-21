import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, posix } from 'node:path';
import { randomUUID } from 'node:crypto';
import { buildPreview, previewAssets, plan } from './ipad-preview.mjs';
import { chromium } from './browser-support.mjs';
const outputRoot = resolve('.test-artifacts/firebase/preview-test-' + randomUUID());
test('paquete con lista explícita, dependencias completas, banderas por origen y rechazo de archivos ajenos', async () => {
  const disabled = await buildPreview({ outputRoot });
  const code = await readFile(resolve(disabled.publicDir, 'js/sync-config.js'), 'utf8');
  const evaluate = (source, hostname, protocol = 'https:', opted = false) => new Function('location', 'localStorage', source.replace('export const syncSettings=', 'return '))({ hostname, protocol }, { getItem: () => opted ? plan.ownerHash : null });
  assert.equal(evaluate(code, 'registro-defensivo--ipad-8b2-fake.web.app').enabled, false);
  const enabled = await buildPreview({ outputRoot, syncEnabled: true });
  const active = await readFile(resolve(enabled.publicDir, 'js/sync-config.js'), 'utf8');
  assert.equal(enabled.manifest.syncEnabled, false);
  assert.equal(enabled.manifest.syncAvailable, true);
  assert.equal(evaluate(active, 'registro-defensivo--ipad-8b2-fake.web.app').enabled, false);
  assert.equal(evaluate(active, 'registro-defensivo--ipad-8b2-fake.web.app', 'https:', true).enabled, true);
  for (const host of ['itsasnehezkuntza.github.io', 'registro-defensivo.web.app', 'registro-defensivo.firebaseapp.com', 'other--ipad-8b2-fake.web.app', 'registro-defensivo--other-fake.web.app']) assert.equal(evaluate(active, host, 'https:', true).enabled, false);
  assert.equal(evaluate(active, 'registro-defensivo--ipad-8b2-fake.web.app', 'http:', true).enabled, false);
  const files = new Set(enabled.manifest.files.map(x => x.file));
  assert.equal(files.size, previewAssets.length + 1);
  for (const file of files) {
    assert(!/^(tests|tools|node_modules|\.git|\.codex)\//.test(file));
    assert(!/\.md$|\.rules$|\.json$|\.map$|\.env$/.test(file));
    if (file.endsWith('.js')) {
      const body = await readFile(resolve(enabled.publicDir, file), 'utf8');
      for (const match of body.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g)) {
        if (match[1].startsWith('.')) assert(files.has(posix.normalize(posix.join(posix.dirname(file), match[1]))), file + ' -> ' + match[1]);
      }
    }
  }
  await writeFile(resolve(enabled.publicDir, 'PRIVATE.txt'), 'ficticio');
  await assert.rejects(buildPreview({ outputRoot }), /Archivo inesperado/);
  assert.equal(await readFile(resolve(enabled.publicDir, 'PRIVATE.txt'), 'utf8'), 'ficticio');
  await assert.rejects(buildPreview({ outputRoot: process.cwd() }), /fuera/);
});
test('arranque HTTPS simulado, pausa duradera, rechazo de Pages y de IndexedDB anterior sin borrarlo', async () => {
  const folder = resolve('.test-artifacts/firebase/preview-browser-' + randomUUID());
  const { publicDir } = await buildPreview({ outputRoot: folder, syncEnabled: true });
  const browser = await chromium.launch();
  try {
    for (const [hostname, seed, opted] of [['registro-defensivo--ipad-8b2-fake.web.app', false, false], ['registro-defensivo--ipad-8b2-opted.web.app', false, true], ['itsasnehezkuntza.github.io', false, false], ['registro-defensivo--ipad-8b2-seeded.web.app', true, false]]) {
      const context = await browser.newContext({ viewport: { width: 1024, height: 768 } }); const forbidden = [], errors = [];
      await context.route(/https:\/\/(www\.gstatic\.com|.*googleapis\.com)\//, route => { forbidden.push(route.request().url()); return route.abort(); });
      await context.route('https://' + hostname + '/**', async route => {
        const path = new URL(route.request().url()).pathname, file = path === '/' ? 'index.html' : path.slice(1);
        if (file === 'seed') { await route.fulfill({ contentType: 'text/html', body: '<p>Semilla ficticia</p>' }); return; }
        if (file === 'favicon.ico') { await route.fulfill({ status: 204 }); return; }
        if (file === 'js/firebase-config.js') { await route.fulfill({ contentType: 'text/javascript', body: 'export const firebaseSettings={enabled:false,authEmulator:false,config:{projectId:"registro-defensivo"}};' }); return; }
        try { await route.fulfill({ contentType: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : file.endsWith('.ttf') ? 'font/ttf' : 'text/plain', body: await readFile(resolve(publicDir, file)) }); }
        catch { await route.fulfill({ status: 404 }); }
      });
      const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
      if (opted) await page.addInitScript(hash => localStorage.setItem('prueba8b3-sync', hash), plan.ownerHash);
      if (seed) {
        await page.goto('https://' + hostname + '/seed');
        await page.evaluate(() => new Promise(resolve => { const req = indexedDB.open('anterior-ficticia', 1); req.onupgradeneeded = () => req.result.createObjectStore('datos'); req.onsuccess = () => { req.result.close(); resolve(); }; }));
      }
      await page.goto('https://' + hostname + '/');
      if (!seed && hostname.startsWith('registro-defensivo--')) {
        await page.waitForFunction(() => !document.getElementById('newGameBtn').disabled);
        assert.equal(await page.evaluate(async () => (await import('./js/sync-config.js')).syncSettings.enabled), opted);
        assert.equal(await page.locator('#previewEnable').textContent(), opted ? 'Prueba activada en este navegador' : 'Activar prueba de sincronización');
        await page.waitForFunction(() => !!document.getElementById('previewPause'));
        await page.evaluate(() => document.getElementById('previewPause').click());
        assert.equal(await page.evaluate(() => localStorage.getItem('prueba8b2-offline')), '1');
        await page.reload(); await page.waitForFunction(() => !!document.getElementById('previewPause'));
        assert.equal(await page.evaluate(async () => (await import('./js/sync-config.js')).syncSettings.enabled), opted);
        assert.match(await page.locator('#previewPause').textContent(), /Reanudar/);
        assert.equal(await page.locator('#syncImport').isVisible(), false);
        assert.deepEqual(errors, []);
      } else {
        await page.waitForFunction(() => !document.querySelector('.app-shell'));
        const dbs = await page.evaluate(() => indexedDB.databases()); assert.equal(dbs.length, seed ? 1 : 0);
        if (seed) assert.equal(dbs[0].name, 'anterior-ficticia');
      }
      assert.deepEqual(forbidden, []); await context.close();
    }
  } finally { await browser.close(); }
});
