// Carrera de arranque separada de la recepción con un partido ya abierto. Sin Firebase.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, configure } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
const server = await startServer(4194), results = [];
const base = '.test-artifacts/firebase/fase8b4/deployed/';
const original = await readFile(base + 'app.js', 'utf8');
const candidate = original.replace('let gameOptionsMarkup = null;', 'let gameOptionsMarkup = null;\nlet lastAppliedContext = null;')
  .replace('render({ preserveControls: keepSelection && previousConfiguration === configuration });', 'render({ preserveControls: keepSelection && previousConfiguration === configuration });\n  lastAppliedContext = c;')
  .replace('if (canonical([state.games, state.currentGameId, state.events])', 'if (lastAppliedContext === context && canonical([state.games, state.currentGameId, state.events])');
try {
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await type.launch();
    try {
      for (const patched of [false, true]) {
        const context = await browser.newContext(); let requested, release;
        const csvRequested = new Promise(resolve => { requested = resolve; });
        const csvRelease = new Promise(resolve => { release = resolve; });
        await context.route('**/js/*.js', async route => { try { await route.fulfill({ contentType: 'text/javascript', body: await readFile(base + new URL(route.request().url()).pathname.slice(1)) }); } catch { await route.continue(); } });
        await configure(context, { enabled: false, config: { projectId: 'demo-defensas' } });
        await context.route('**/js/sync-config.js', r => r.fulfill({ contentType: 'text/javascript', body: 'export const syncSettings={enabled:true,emulator:false,allowRealWrites:false};' }));
        await context.route('**/js/cuenta.js', r => r.fulfill({ contentType: 'text/javascript', body: `export function createAccountController(){const listeners=[];let state={status:'ready',busy:false,user:null,sessionVersion:0};globalThis.restoreTestAccount=()=>{state={...state,user:{uid:'ficticio',email:'ficticio@example.test'},sessionVersion:1};listeners.forEach(fn=>fn(state));};return {subscribe(fn){listeners.push(fn);fn(state);},start:async()=>{},act:async()=>{}}}` }));
        await context.route('**/js/firestore-sync.js', r => r.fulfill({ contentType: 'text/javascript', body: 'export async function loadFirestoreTransport(){return {teams:async()=>[]}}' }));
        await context.route('**/app.js', r => r.fulfill({ contentType: 'text/javascript', body: patched ? candidate : original }));
        await context.route('**/categorias.csv', async r => { requested(); await csvRelease; await r.fulfill({ contentType: 'text/csv', body: await readFile('categorias.csv') }); });
        const page = await context.newPage();
        await page.goto('http://127.0.0.1:4194/'); await csvRequested;
        await page.waitForFunction(() => typeof restoreTestAccount === 'function');
        await page.evaluate(() => restoreTestAccount()); release();
        await page.waitForFunction(() => document.getElementById('saveStatusText').textContent.includes('Guardado'));
        await page.waitForTimeout(300);
        const disabled = await page.locator('#newGameBtn').isDisabled();
        assert.equal(disabled, !patched);
        results.push({ browser: name, variant: patched ? 'candidate-in-memory-only' : 'published', controlsDisabled: disabled, firebaseWrites: 0 });
        await context.close();
      }
    } finally { await browser.close(); }
  }
  await writeFile('.test-artifacts/firebase/fase8b4/startup.json', JSON.stringify(results, null, 2));
  await writeFile('.test-artifacts/firebase/fase8b4/startup-candidate-app.js', candidate);
  console.log(JSON.stringify(results));
} finally { await new Promise(resolve => server.close(resolve)); }
