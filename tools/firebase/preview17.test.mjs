// Candidato HTTPS servido solo mediante rutas de Playwright; sin publicación/red.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import { prepare17 } from './prepare17-ipad.mjs';
import { exerciseEditor19 } from './editor19.test.mjs';
import { chromium, idle, createGame, snapshot } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
const phase19 = process.argv.includes('--fase19');
const phase18 = phase19 || process.argv.includes('--fase18');
const { publicDir, output, manifest } = phase19 ? await (await import('./prepare19-ipad.mjs')).prepare19() : phase18 ? await (await import('./prepare18-ipad.mjs')).prepare18() : await prepare17();
const files = new Set(manifest.files.map(item => item.file));
const reports = [];
assert.equal(manifest.plan.syncEnabled, false); assert.equal(manifest.plan.allowRealWrites, false);
for (const item of manifest.files) {
  const bytes = await readFile(resolve(publicDir, item.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256);
  assert(!/^(?:tests|tools|node_modules|\.git|\.codex)\//.test(item.file));
  if (item.file.endsWith('.js')) {
    for (const match of bytes.toString('utf8').matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g))
      if (match[1].startsWith('.')) assert(files.has(posix.normalize(posix.join(posix.dirname(item.file), match[1]))), 'Dependencia ausente ' + match[1]);
  }
}
const stub = await import(pathToFileURL(resolve(publicDir, 'js/firestore-sync.js')));
assert.throws(() => stub.loadFirestoreTransport(), /desactivada/); assert.throws(() => stub.createFirestoreTransport(), /desactivada/);
const originalHtml = await readFile('index.html', 'utf8'), candidateHtml = await readFile(resolve(publicDir, 'index.html'), 'utf8');
assert.equal(originalHtml.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1], candidateHtml.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1]);
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  try {
    for (const scenario of ['clean', 'previous-data', 'wrong-origin', ...(phase18 ? ['upgrade'] : []), ...(phase19 ? ['upgrade18'] : [])]) {
      const host = scenario === 'wrong-origin' ? 'itsasnehezkuntza.github.io' : 'registro-defensivo--ipad17-ficticio.web.app';
      const origin = 'https://' + host, context = await browser.newContext({ acceptDownloads: true, viewport: { width: 820, height: 1180 } });
      const external = [], violations = [], errors = [], fetched = [];
      await context.exposeBinding('__csp17', (_, data) => violations.push(data));
      await context.addInitScript(() => {
        localStorage.setItem('defensas-account-mode', 'local');
        document.addEventListener('securitypolicyviolation', event => void window.__csp17(event.effectiveDirective + ' ' + event.blockedURI));
      });
      let oldCandidate = scenario === 'upgrade' || scenario === 'upgrade18';
      let baseline;
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) { external.push(url.origin); return route.abort(); }
        const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1); fetched.push(file);
        if (file === 'seed.html') return route.fulfill({ contentType: 'text/html', body: '<p>Semilla ficticia</p>' });
        if (file === 'favicon.ico') return route.fulfill({ status: 204 });
        if (file === 'js/firebase-config.js') return route.fulfill({ contentType: 'text/javascript', body: 'export const firebaseSettings={enabled:false,authEmulator:false,config:{projectId:"registro-defensivo"}};' });
        assert(files.has(file), 'Archivo no empaquetado: ' + file);
        return route.fulfill({ contentType: ({ html: 'text/html', js: 'text/javascript', css: 'text/css', ttf: 'font/ttf', csv: 'text/csv' })[file.split('.').pop()] || 'text/plain', body: await readFile(resolve(oldCandidate ? `.test-artifacts/firebase/fase${scenario === 'upgrade18' ? '18' : '17'}/candidate/public` : publicDir, file)) });
      });
      const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
      if (scenario === 'upgrade' || scenario === 'upgrade18') {
        await page.goto(origin); await idle(page); await createGame(page, 'CONSERVAR IPAD17');
        await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
        baseline = await snapshot(page); oldCandidate = false;
      }
      if (scenario === 'previous-data') {
        await page.goto(origin + '/seed.html');
        await page.evaluate(() => new Promise((done, fail) => {
          const request = indexedDB.open('anterior17', 1); request.onupgradeneeded = () => request.result.createObjectStore('fixture');
          request.onerror = () => fail(request.error); request.onsuccess = () => {
            const db = request.result, tx = db.transaction('fixture', 'readwrite'); tx.objectStore('fixture').put('conservar17', 'value'); tx.oncomplete = () => { db.close(); done(); };
          };
        }));
      }
      await page.goto(origin + '/');
      if (scenario === 'clean' || scenario === 'upgrade' || scenario === 'upgrade18') {
        await idle(page); assert.equal(await page.evaluate(() => document.documentElement.dataset.preview17), manifest.buildId);
        if (scenario === 'upgrade' || scenario === 'upgrade18') assert.deepEqual(await snapshot(page), baseline, 'Actualización conserva partido, eventos y selección activa');
        const gid = await createGame(page, 'FICTICIO IPAD17');
        await page.locator('#moreBtn').click(); await page.locator('#editButtonsBtn').click();
        await page.waitForSelector('#editorView:not([hidden]) .edit-tile');
        await page.locator('[data-edit="transicion:items:0"]').click(); await page.locator('#editNameInput').fill('Panel iPad17');
        await page.locator('[data-act="close"]').click(); await page.locator('[data-act="done"]').click();
        await page.waitForFunction(() => document.body.dataset.view === 'registro');
        if (phase19) await exerciseEditor19(page);
        await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page);
        assert.equal((await snapshot(page)).events.length, 1); await page.reload(); await idle(page);
        assert.equal((await snapshot(page)).currentGameId, gid); assert.equal((await snapshot(page)).events.length, 1);
        assert.equal(await page.locator('#cloudStatus').textContent(), 'Solo local');
        const download = page.waitForEvent('download'); await page.locator('#moreBtn').click(); await page.locator('#exportCsvBtn').click();
        const csv = await readFile(await (await download).path()); assert.equal(csv.subarray(0, 3).toString('hex'), 'efbbbf'); assert(csv.toString('utf8').includes('Panel iPad17'));
        await page.locator('#viewStatsBtn').click(); await page.waitForFunction(() => document.body.dataset.view === 'estadisticas');
        assert(await page.locator('.matrix-cell').count());
        assert.deepEqual(errors, []); assert.deepEqual(violations, []);
        reports.push(name + ': panel, doble toque, recarga, CSV y estadísticas locales correctos; Sync inaccesible');
      } else {
        const text = scenario === 'previous-data' ? 'Hay datos previos' : 'solo funciona en la vista previa';
        await page.waitForFunction(text => document.body.textContent.includes(text), text);
        assert(!fetched.includes('app.js') && !fetched.includes('js/cuenta-ui.js'), 'No iniciar aplicación tras fallar la guarda');
        assert.equal(errors.length, 1); assert(errors[0].includes(text));
        if (scenario === 'previous-data') {
          assert.equal(await page.evaluate(() => new Promise(done => {
            const r = indexedDB.open('anterior17'); r.onsuccess = () => { const db = r.result, value = db.transaction('fixture').objectStore('fixture').get('value'); value.onsuccess = () => { db.close(); done(value.result); }; };
          })), 'conservar17');
        }
        reports.push(name + ': ' + scenario + ' bloqueado sin cargar aplicación ni borrar datos');
      }
      assert.deepEqual(external, []); await context.close();
    }
  } finally { await browser.close(); }
}
await writeFile(resolve(output, '../verificacion.json'), JSON.stringify({ ok: true, buildId: manifest.buildId, reports, files: files.size, deployed: false, firestoreRequests: 0, realWrites: 0, authMockedForLocalTests: true }, null, 2));
console.log(reports.join('\n'));
