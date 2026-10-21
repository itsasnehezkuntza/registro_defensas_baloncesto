// Firestore Emulator real + SDK oficial + dos IndexedDB/contextos independientes.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import { startServer } from './servidor.mjs';
import { chromium, configure, officialSdk, idle, createGame, snapshot } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085') throw Error('Solo Emulator demo-defensas.');
const env = await initializeTestEnvironment({ projectId: 'demo-defensas', firestore: { host: '127.0.0.1', port: 8085, rules: await readFile('firestore.rules', 'utf8') } });
const server = await startServer(4192), results = [], forbidden = [];
const baselineDir = '.test-artifacts/firebase/fase8b4/deployed/';
const menu = async page => { if (!await page.locator('#moreMenu').isVisible()) await page.locator('#moreBtn').click(); };
try {
  for (const [browserName, browserType] of [['chromium', chromium], ['webkit', webkit]]) {
    if (process.env.RECEIVE8B4_DEBUG && browserName !== 'chromium') continue;
    const browser = await browserType.launch();
    try {
      for (const variant of ['published', 'instrumented']) {
        if (process.env.RECEIVE8B4_DEBUG && variant !== 'instrumented') continue;
        const uid = 'ficticio-' + browserName + '-' + variant, teamId = 'equipo-' + uid;
        const db = env.authenticatedContext(uid, { firebase: { sign_in_provider: 'google.com' } }).firestore();
        const batch = sdk.writeBatch(db);
        batch.set(sdk.doc(db, 'teams', teamId), { schemaVersion: 1, ownerUid: uid, name: 'Ficticio 8B4', createdAt: sdk.serverTimestamp() });
        batch.set(sdk.doc(db, 'teams', teamId, 'members', uid), { schemaVersion: 1, uid, role: 'owner', status: 'active', createdAt: sdk.serverTimestamp() });
        await batch.commit();
        const contexts = [], errors = [], network = [];
        async function device() {
          const context = await browser.newContext({ viewport: { width: 1024, height: 768 } }); contexts.push(context);
          // Código publicado conservado en disco, no se modifica el paquete ni la URL real.
          if (variant === 'published') await context.route('**/js/*.js', async route => {
            const file = new URL(route.request().url()).pathname.slice(1);
            try { await route.fulfill({ contentType: 'text/javascript', body: await readFile(baselineDir + file) }); }
            catch { await route.continue(); }
          });
          if (variant === 'published') await context.route('**/app.js', async route => route.fulfill({ contentType: 'text/javascript', body: await readFile(baselineDir + 'app.js') }));
          await configure(context, { enabled: false, authEmulator: true, config: { projectId: 'demo-defensas' } });
          await officialSdk(context, true);
          await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'export const syncSettings={enabled:true,emulator:true,allowRealWrites:false};' }));
          await context.route('**/js/cuenta.js', route => route.fulfill({ contentType: 'text/javascript', body: `export function createAccountController(){const listeners=[];let state={status:'ready',busy:false,user:null,sessionVersion:0};globalThis.testSignIn=()=>{state={...state,user:{uid:${JSON.stringify(uid)},email:'ficticio@example.test'},sessionVersion:1};listeners.forEach(fn=>fn(state));};return{subscribe(fn){listeners.push(fn);fn(state);},start:async()=>{},act:async()=>{}}}` }));
          await context.route('**/js/firestore-sync.js', async route => {
            const source = await readFile((variant === 'published' ? baselineDir : '') + 'js/firestore-sync.js', 'utf8');
            const modified = source.replace('export async function loadFirestoreTransport(uid)', 'async function unusedRealLoader(uid)') + `
export async function loadFirestoreTransport(uid){
const a=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
const sdk=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
const app=a.initializeApp({projectId:'demo-defensas',apiKey:'demo',appId:'demo'},crypto.randomUUID());
const db=sdk.getFirestore(app);sdk.connectFirestoreEmulator(db,'127.0.0.1',8085,{mockUserToken:{sub:uid,user_id:uid,firebase:{sign_in_provider:'google.com'}}});
globalThis.emulatorReadControl={sdk,db};
return createFirestoreTransport(sdk,db,uid,()=>uid);}`;
            await route.fulfill({ contentType: 'text/javascript', body: modified });
          });
          if (variant === 'instrumented') await context.route('**/app.js', async route => route.fulfill({ contentType: 'text/javascript',
            body: `import {enableSyncDiagnostics} from './js/sync-diagnostics.js';enableSyncDiagnostics({buildId:'8b4-local-emulator'});\n` + await readFile('app.js', 'utf8') }));
          context.on('request', request => { if (!['127.0.0.1', 'localhost', 'www.gstatic.com'].includes(new URL(request.url()).hostname)) forbidden.push(request.url()); });
          context.on('requestfailed', r => network.push({ path: new URL(r.url()).pathname, error: r.failure()?.errorText }));
          context.on('response', r => { if (r.status() >= 400) network.push({ path: new URL(r.url()).pathname, status: r.status() }); });
          const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
          page.on('console', m => { if (m.type() === 'error') network.push({ console: m.text().replace(/https?:\/\/\S+/g, '[url]') }); });
          await page.goto('http://127.0.0.1:4192/'); await idle(page);
          await page.evaluate(() => testSignIn());
          try { await page.waitForFunction(id => !!document.querySelector('#syncTeam option[value="' + id + '"]'), teamId, { timeout: 12000 }); }
          catch (error) {
            console.log(JSON.stringify({ browserName, variant, errors, network, diagnostic: await page.evaluate(async () => ({ status: document.getElementById('cloudStatus').textContent, detail: document.getElementById('syncDetail')?.textContent, trace: (await import('./js/sync-diagnostics.js')).syncDiagnosticSnapshot().entries.slice(-12) })) })); throw error;
          }
          await menu(page); await page.locator('#syncTeam').selectOption(teamId); await idle(page);
          if (await page.locator('#moreMenu').isVisible()) await page.locator('#moreBtn').click();
          return page;
        }
        try {
          const a = await device(), b = await device();
          const gid = await createGame(a, 'Ficticio 8B.4');
          await a.locator('.action-btn').first().click(); await a.locator('[data-points="2"][data-result="fallado"]').click(); await idle(a);
          await b.waitForFunction(id => !!document.querySelector('#gameSelect option[value="' + id + '"]'), gid, { timeout: 25000 });
          await b.locator('#gameSelect').selectOption(gid); await idle(b);
          await b.waitForFunction(async () => (await import('./js/persistencia.js')).readState().then(s => s.events.length === 1), undefined, { timeout: 25000 });
          await b.waitForFunction(() => document.getElementById('cloudStatus').textContent === 'Sincronizado');
          assert.equal(await b.evaluate(async () => (await (await import('./js/sync-storage.js')).listPending()).length), 0);
          // Receptor con el partido ya seleccionado y sin pendientes. No recargar ni forzar ciclo.
          const started = Date.now();
          await a.locator('.action-btn').first().click(); await a.locator('[data-points="2"][data-result="anotado"]').click(); await idle(a);
          await b.waitForFunction(() => document.getElementById('scoreboardValue').textContent.includes('2/4'), undefined, { timeout: 25000 });
          const elapsedMs = Date.now() - started;
          const state = await snapshot(b); assert.equal(state.currentGameId, gid); assert.equal(state.events.length, 2);
          assert.equal(new Set(state.events.map(e => e.id)).size, 2);
          const result = { browser: browserName, variant, elapsedMs, activeEvents: 2, duplicates: 0, receiverPendingBefore: 0, reloads: 0, forcedCycles: 0, errors };
          if (variant === 'instrumented') {
            await b.evaluate(() => emulatorReadControl.sdk.disableNetwork(emulatorReadControl.db));
            await a.locator('.action-btn').first().click(); await a.locator('[data-points="2"][data-result="fallado"]').click(); await idle(a);
            await b.waitForFunction(() => document.getElementById('cloudStatus').textContent === 'Error de sincronización', undefined, { timeout: 20000 });
            assert.equal((await snapshot(b)).events.length, 2);
            await b.evaluate(async () => { await emulatorReadControl.sdk.enableNetwork(emulatorReadControl.db); dispatchEvent(new Event('online')); });
            await b.waitForFunction(() => document.getElementById('scoreboardValue').textContent.includes('2/6'), undefined, { timeout: 25000 });
            assert.equal((await snapshot(b)).events.length, 3);
            assert.equal(await b.evaluate(async () => (await (await import('./js/sync-storage.js')).listPending()).length), 0);
            result.reconnection = { receiverWrites: 0, errorVisible: true, eventsAfter: 3, recoveredWithoutReload: true };
            result.trace = await b.evaluate(async () => (await import('./js/sync-diagnostics.js')).syncDiagnosticSnapshot());
            for (const stage of ['firestore.read.received', 'storage.merge.committed', 'app.remote.received', 'app.refresh.read', 'app.state.rendered']) assert(result.trace.entries.some(e => e.stage === stage), stage);
          }
          assert.deepEqual(errors, []); results.push(result); console.log(JSON.stringify({ ...result, trace: undefined }));
        } finally { await Promise.all(contexts.map(c => c.close())); }
      }
    } finally { await browser.close(); }
  }
  assert.deepEqual(forbidden, []);
  await writeFile('.test-artifacts/firebase/fase8b4/emulator-receive.json', JSON.stringify({ projectId: 'demo-defensas', results, realWrites: 0, forbidden }, null, 2));
} finally { await env.cleanup(); await new Promise(resolve => server.close(resolve)); }
