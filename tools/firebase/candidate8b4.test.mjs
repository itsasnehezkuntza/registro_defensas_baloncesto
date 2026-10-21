import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
const dir = '.test-artifacts/firebase/fase8b4/diagnostic-candidate/';
const manifest = JSON.parse(await readFile(dir + 'manifest.json', 'utf8'));
const baseline = JSON.parse(await readFile('.test-artifacts/firebase/fase8b4/deployed-manifest.json', 'utf8'));
for (const f of manifest.files) {
  assert(!/^tools\/|^tests\/|\.md$|\.json$|\.rules$|\.env$/.test(f.file));
  assert.equal(createHash('sha256').update(await readFile(dir + 'public/' + f.file)).digest('hex'), f.sha256);
  if (f.file.endsWith('.ttf')) assert.equal(f.sha256, baseline.files.find(x => x.file === f.file).sha256);
}
const origin = 'https://registro-defensivo--ipad-8b2-40nbq9cf.web.app', results = [];
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  try {
    for (const pending of [false, true]) {
      const context = await browser.newContext({ acceptDownloads: true }), forbidden = [];
      await context.route(/https:\/\/(www\.gstatic\.com|.*googleapis\.com)\//, r => { forbidden.push(r.request().url()); return r.abort(); });
      await context.route(origin + '/**', async r => {
        const path = new URL(r.request().url()).pathname;
        if (path === '/seed') { await r.fulfill({ contentType: 'text/html', body: '<p>Ficticio</p>' }); return; }
        if (path === '/js/firebase-config.js') { await r.fulfill({ contentType: 'text/javascript', body: 'export const firebaseSettings={enabled:false,config:{projectId:"registro-defensivo"},authEmulator:false};' }); return; }
        try { await r.fulfill({ contentType: path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : path.endsWith('.ttf') ? 'font/ttf' : 'text/html', body: await readFile(dir + 'public/' + (path === '/' ? 'index.html' : path.slice(1))) }); }
        catch { await r.fulfill({ status: 404 }); }
      });
      const page = await context.newPage(); await page.goto(origin + '/seed');
      await page.evaluate(async pending => {
        localStorage.setItem('prueba8b3-sync', '7e6e354a4f4deb94');
        localStorage.setItem('prueba8b2-ipad', JSON.stringify({ teamId: 'prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778' }));
        const p = await import('./js/persistencia.js'); await p.openDatabase();
        await p.createGameAndSelect({ id: 'ficticio', jornada: '8B4', rival: 'Ficticio', createdAt: '2026-10-17' });
        if (pending) await p.transact(['syncQueue'], 'readwrite', (tx, done) => { tx.objectStore('syncQueue').add({ key: 'pendiente-ficticio', scope: 'ficticio', attempts: 0 }); done(); });
      }, pending);
      await page.goto(origin + '/');
      if (pending) {
        await page.waitForFunction(() => document.body.textContent.includes('Hay operaciones pendientes'));
        const count = await page.evaluate(() => new Promise(resolve => { const r = indexedDB.open('registro_defensivo_baloncesto'); r.onsuccess = () => { const db = r.result; const q = db.transaction('syncQueue').objectStore('syncQueue').get('pendiente-ficticio'); q.onsuccess = () => { db.close(); resolve(q.result.attempts); }; }; }));
        assert.equal(count, 0);
      } else {
        await page.waitForFunction(() => !!document.getElementById('downloadSyncDiagnostic'));
        assert.equal(await page.locator('#newGameBtn').isDisabled(), true);
        await page.locator('#moreBtn').click(); const downloading = page.waitForEvent('download'); await page.locator('#downloadSyncDiagnostic').click();
        const report = JSON.parse(await readFile(await (await downloading).path(), 'utf8'));
        assert.equal(report.buildId, manifest.buildId); assert.equal(report.local.games, 1); assert.equal(report.local.pending, 0);
        // Comprobar la barrera send/createTeam con SDK dobles; ningún servicio Firebase real.
        await context.route('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js', r => r.fulfill({ contentType: 'text/javascript', body: "export const getApp=()=>({options:{projectId:'registro-defensivo'}});" }));
        await context.route('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js', r => r.fulfill({ contentType: 'text/javascript', body: "export const getAuth=()=>({currentUser:{uid:'ficticio'}});" }));
        await context.route('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js', r => r.fulfill({ contentType: 'text/javascript', body: "export const getFirestore=app=>({app});export function runTransaction(){globalThis.wouldWrite++;throw Error('Write reached')}export function writeBatch(){globalThis.wouldWrite++;throw Error('Write reached')}" }));
        const fixtureHash = createHash('sha256').update('ficticio').digest('hex').slice(0, 16);
        await context.route(origin + '/js/firestore-sync.js?readonly-test', async r => r.fulfill({ contentType: 'text/javascript', body: (await readFile(dir + 'public/js/firestore-sync.js', 'utf8')).replace('"ownerHash":"7e6e354a4f4deb94"', '"ownerHash":"' + fixtureHash + '"') }));
        const guard = await page.evaluate(async () => {
          globalThis.wouldWrite = 0;
          const t = await (await import('./js/firestore-sync.js?readonly-test')).loadFirestoreTransport('ficticio');
          const codes = [];
          for (const action of [() => t.createTeam('PRUEBA 8B.2 IPAD'), () => t.send({ teamId: 'prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778' })]) {
            try { await action(); codes.push('unexpected-success'); } catch (e) { codes.push(e.code); }
          }
          return { codes, writes: globalThis.wouldWrite };
        });
        assert.deepEqual(guard, { codes: ['DIAGNOSTIC_READ_ONLY', 'DIAGNOSTIC_READ_ONLY'], writes: 0 });
      }
      assert.deepEqual(forbidden, []); results.push({ browser: name, pending, noFirebaseRequests: true, pendingPreserved: pending, readOnlyExport: !pending });
      await context.close();
    }
  } finally { await browser.close(); }
}
await writeFile('.test-artifacts/firebase/fase8b4/candidate-tests.json', JSON.stringify({ buildId: manifest.buildId, results, realWrites: 0 }, null, 2));
console.log(JSON.stringify(results));
