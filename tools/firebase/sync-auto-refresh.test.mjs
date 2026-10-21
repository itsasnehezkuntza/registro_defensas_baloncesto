// Dos contextos independientes, aplicación/IndexedDB/motor reales y transporte ficticio compartido.
// No OAuth ni Firebase. No llama start/wake/retry ni recarga para propagar los tiros.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, configure, idle, createGame, snapshot } from './browser-support.mjs';
const server = await startServer(4191), browser = await chromium.launch();
const remote = new Map(), contexts = [], forbidden = [], errors = [], pulls = { A: 0, B: 0 };
const team = { id: 'equipo-automatico-ficticio', name: 'Equipo ficticio automático' };
const result = { realFirebase: false, manuallyForcedCycles: 0, manualReloads: 0, checks: [] };
try {
  async function device(name) {
    const context = await browser.newContext({ viewport: { width: 1024, height: 768 } }); contexts.push(context);
    // Fase 10: Google «habilitado» solo para cargar los controles de cuenta; el controlador es ficticio y no hay SDK.
    await configure(context, { enabled: true, config: { projectId: 'demo-defensas' }, authEmulator: false });
    await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'export const syncSettings={enabled:true,emulator:false,allowRealWrites:false};' }));
    // Activación explícita (8C) de la cuenta ficticia en este navegador.
    await context.addInitScript(() => {
      localStorage.setItem('defensas-account-mode', 'google');
      localStorage.setItem('defensas-sync-consent:' + JSON.stringify(['demo-defensas', 'cuenta-ficticia']), 'enabled');
    });
    const realAccount = (await readFile(new URL('../../js/cuenta.js', import.meta.url), 'utf8')).replace('export function createAccountController', 'function realAccountController');
    await context.route('**/js/cuenta.js', route => route.fulfill({ contentType: 'text/javascript', body: realAccount + `
export function createAccountController(){const listeners=[];let state={status:'ready',busy:false,user:null,sessionVersion:0};globalThis.testSignIn=()=>{state={...state,user:{uid:'cuenta-ficticia',email:'ficticio@example.test'},sessionVersion:1};listeners.forEach(fn=>fn(state));};return{subscribe(fn){listeners.push(fn);fn(state);},start:async()=>{},act:async()=>{}}}` }));
    await context.route('**/js/firestore-sync.js', route => route.fulfill({ contentType: 'text/javascript', body: `export async function loadFirestoreTransport(){return {teams:async()=>[${JSON.stringify(team)}],verifyTeam:async()=>(${JSON.stringify(team)}),createTeam:async()=>{throw Error('No crear más equipos')},send:async op=>{const r=await fetch('/__mock/send',{method:'POST',body:JSON.stringify(op)});if(!r.ok)throw Error('Transporte ficticio fallido');},pull:async()=>{const r=await fetch('/__mock/pull?device=${name}');return r.json();}}}` }));
    await context.route('**/__mock/**', async route => {
      if (new URL(route.request().url()).pathname.endsWith('/send')) {
        const op = route.request().postDataJSON();
        if (op.type === 'game') { if (!remote.has(op.gameId)) remote.set(op.gameId, { id: op.gameId, payload: op.payload, sourceId: op.sourceId, deleted: false, events: [], tombs: [] }); }
        else if (op.type === 'event') {
          const game = remote.get(op.gameId); assert(game);
          if (!game.events.some(e => e.id === op.eventId)) game.events.push({ id: op.eventId, payload: op.payload, sourceId: op.sourceId });
        } else if (op.type === 'panel') remote.get(op.gameId).panel = op.payload;
        else throw Error('Operación inesperada en diagnóstico.');
        await route.fulfill({ status: 204 });
      } else { pulls[name]++; await route.fulfill({ contentType: 'application/json', body: JSON.stringify([...remote.values()]) }); }
    });
    await context.route(/https:\/\/(www\.gstatic\.com|.*googleapis\.com)\//, route => { forbidden.push(route.request().url()); return route.abort(); });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('http://127.0.0.1:4191/');
    try { await page.waitForFunction(() => document.getElementById('saveStatusText').textContent === 'Guardado localmente', undefined, { timeout: 5000 }); }
    catch (error) { console.log(JSON.stringify({ errors, details: await page.evaluate(() => ({ ready: document.readyState, cloud: document.getElementById('cloudStatus').textContent, body: document.body.textContent.slice(0, 1500), resources: performance.getEntriesByType('resource').map(r => r.name) })) })); throw error; }
    await page.evaluate(() => testSignIn());
    await page.waitForFunction(id => !!document.querySelector('#syncTeam option[value="' + id + '"]'), team.id);
    await page.evaluate(id => { const el = document.getElementById('syncTeam'); el.value = id; el.dispatchEvent(new Event('change')); }, team.id);
    await idle(page); return page;
  }
  const a = await device('A'), b = await device('B');
  const gid = await createGame(a, 'Ficticio automático');
  await a.locator('.action-btn').first().click(); await a.locator('[data-points="2"][data-result="fallado"]').click(); await idle(a);
  await b.waitForFunction(id => !!document.querySelector('#gameSelect option[value="' + id + '"]'), gid, { timeout: 20000 });
  await b.locator('#gameSelect').selectOption(gid); await idle(b);
  await b.waitForFunction(async () => (await import('./js/persistencia.js')).readState().then(s => s.events.length === 1), undefined, { timeout: 20000 });
  for (const page of [a, b]) await page.waitForFunction(() => document.getElementById('cloudStatus').textContent === 'Sincronizado', undefined, { timeout: 20000 });
  result.checks.push('A → B: partido y primer evento automáticos');
  // Esperar al siguiente sondeo de A y registrar justo después: evita que un ciclo inicial
  // pendiente o la coincidencia de temporizadores aparente probar el sondeo periódico.
  const previousPulls = pulls.A, deadline = Date.now() + 15000;
  while (pulls.A === previousPulls && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 100));
  assert(pulls.A > previousPulls, 'A debe seguir consultando estando inactivo.');
  await a.waitForFunction(() => document.getElementById('cloudStatus').textContent === 'Sincronizado');
  const started = Date.now();
  await b.locator('.action-btn').first().click(); await b.locator('[data-points="2"][data-result="anotado"]').click(); await idle(b);
  assert.equal((await snapshot(b)).events.length, 2);
  await a.waitForFunction(async () => (await import('./js/persistencia.js')).readState().then(s => s.events.length === 2), undefined, { timeout: 20000 });
  await a.waitForFunction(() => document.querySelector('#scoreboardValue').textContent.includes('2/4'), undefined, { timeout: 10000 });
  result.secondEventWaitMs = Date.now() - started;
  result.checks.push('B → A: segundo evento e interfaz sin recarga ni ciclos forzados');
  for (const page of [a, b]) {
    await page.waitForFunction(() => document.getElementById('cloudStatus').textContent === 'Sincronizado', undefined, { timeout: 20000 });
    assert.equal((await snapshot(page)).events.length, 2);
  }
  assert.deepEqual(forbidden, []); assert.deepEqual(errors, []);
  result.pulls = pulls; result.realWrites = 0;
  await writeFile('.test-artifacts/firebase/fase8b3/auto-refresh.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
