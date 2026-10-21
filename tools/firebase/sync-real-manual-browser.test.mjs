import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from './browser-support.mjs';
import { manualBrowserBootstrap, manualBrowserHtml, validateManualReport, validateManualAccessReport } from './sync-real-manual-browser.mjs';
import { prepareRealSyncSession } from './sync-real-session.mjs';

test('informe local solo acepta metadatos previstos y el equipo ficticio', () => {
  const report = { label: 'A', uidHash: null, teamId: 'test-team', cloud: 'Pendiente de sincronizar', local: 'Guardado localmente', gameIds: ['game'], eventIds: ['event'], pendingCount: 1, blockedCount: 0 };
  assert.equal(validateManualReport(report, 'test-team'), report);
  assert.throws(() => validateManualReport({ ...report, token: 'unexpected' }, 'test-team'));
  assert.throws(() => validateManualReport({ ...report, teamId: 'other-team' }, 'test-team'));
  assert.throws(() => validateManualReport({ ...report, pendingCount: -1 }, 'test-team'));
});

test('diagnóstico de acceso solo admite huella, equipo ficticio y decisiones acotadas', () => {
  const report = { label: 'B', uidHash: '0123456789abcdef', teamId: 'test-team', decision: 'permission-denied' };
  assert.equal(validateManualAccessReport(report, 'test-team'), report);
  for (const patch of [{ token: 'private' }, { uid: 'raw' }, { uidHash: null }, { uidHash: 1234 }, { teamId: 'other' }, { decision: 'arbitrary text' }]) {
    assert.throws(() => validateManualAccessReport({ ...report, ...patch }, 'test-team'));
  }
});

test('preflight manual: nuevo, recarga, aislamiento A/B y rechazo de base existente sin modificarla', async () => {
  const html = manualBrowserHtml(await readFile(new URL('../../index.html', import.meta.url), 'utf8'));
  const reports = [], accessReports = [], unexpected = [];
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    let body, type = 'text/javascript';
    if (path === '/' || path === '/index.html') { body = html; type = 'text/html'; }
    else if (path === '/empty') { body = '<!doctype html><p>Semilla ficticia</p>'; type = 'text/html'; }
    else if (path === '/__manual-bootstrap.js') body = manualBrowserBootstrap('test-run', 'test-team');
    else if (path === '/app.js') body = `window.testAppLoaded = true;
      await new Promise((resolve,reject)=>{const req=indexedDB.open('ficticia',1);req.onupgradeneeded=()=>req.result.createObjectStore('datos');req.onsuccess=()=>{req.result.close();resolve()};req.onerror=()=>reject(req.error)});
      document.getElementById('saveStatusText').textContent='Guardado localmente';`;
    else if (path === '/js/cuenta-ui.js') body = `
      // Los controles aparecen tarde y la UI puede volver a habilitarlos.
      await new Promise(resolve=>setTimeout(resolve,50));
      for(const id of ['syncImport','syncConfirm']) {
        const button=document.createElement('button');button.id=id;button.textContent=id;
        button.addEventListener('click',()=>{window.testImportOpened=true;});document.body.append(button);
      }
      window.testAccountLoaded=true;
      dispatchEvent(new CustomEvent('prueba8b-team-access',{detail:{uid:'cuenta-ficticia',teamId:'test-team',decision:'permission-denied'}}));`;
    else if (path === '/js/sync-storage.js') body = 'export const storageContext=()=>({uid:null,teamId:null,scope:null});export const listPending=async()=>[];';
    else if (path === '/js/persistencia.js') body = 'export const readState=async()=>({games:[],events:[]});';
    else if (path === '/__manual-access-report') {
      let text = ''; for await (const chunk of req) text += chunk;
      accessReports.push(validateManualAccessReport(JSON.parse(text), 'test-team')); res.writeHead(204).end(); return;
    }
    else if (path === '/__manual-report') {
      let text = ''; for await (const chunk of req) text += chunk;
      reports.push(validateManualReport(JSON.parse(text), 'test-team')); res.writeHead(204).end(); return;
    } else if (/\.(css|ttf)$/.test(path) || path === '/favicon.ico') { res.writeHead(204).end(); return; }
    else { unexpected.push(path); res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(body);
  });
  await new Promise(resolve => server.listen(4195, '127.0.0.1', resolve));
  const browser = await chromium.launch();
  try {
    const a = await browser.newContext(), b = await browser.newContext(), old = await browser.newContext();
    const pageA = await a.newPage(); await pageA.goto('http://localhost:4195/?perfil=A');
    await pageA.waitForFunction(() => window.testAccountLoaded);
    assert.equal(await pageA.locator('title').textContent(), 'PRUEBA 8B · Perfil A');
    // Ni el alta tardía ni un render que quite hidden/disabled expone la importación.
    const guarded = await pageA.evaluate(() => ['syncImport', 'syncConfirm'].map(id => {
      const button = document.getElementById(id); button.hidden = false; button.disabled = false;
      button.click(); return getComputedStyle(button).display;
    }));
    assert.deepEqual(guarded, ['none', 'none']);
    assert.equal(await pageA.evaluate(() => !!window.testImportOpened), false);
    for (let i = 0; i < 30 && !accessReports.length; i++) await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(accessReports[0]?.decision, 'permission-denied');
    assert.equal(accessReports[0]?.uidHash.length, 16);
    assert.equal(Object.hasOwn(accessReports[0], 'uid'), false);
    await pageA.reload(); await pageA.waitForFunction(() => window.testAccountLoaded);
    assert.equal((await pageA.evaluate(() => indexedDB.databases())).length, 1);
    await pageA.goto('http://localhost:4195/?perfil=B');
    await pageA.waitForFunction(() => document.body.textContent.includes('Usa un perfil nuevo'));
    assert.equal(await pageA.evaluate(() => !!window.testAppLoaded), false);
    assert.equal((await pageA.evaluate(() => indexedDB.databases())).length, 1);
    const pageB = await b.newPage(); await pageB.goto('http://localhost:4195/?perfil=B');
    await pageB.waitForFunction(() => window.testAccountLoaded);
    assert.equal(await pageB.locator('title').textContent(), 'PRUEBA 8B · Perfil B');
    const pageOld = await old.newPage(); await pageOld.goto('http://localhost:4195/empty');
    await pageOld.evaluate(() => new Promise(resolve => {
      const req = indexedDB.open('anterior-ficticia', 1); req.onupgradeneeded = () => req.result.createObjectStore('datos');
      req.onsuccess = () => { const db = req.result, tx = db.transaction('datos', 'readwrite'); tx.objectStore('datos').put('intacto', 'original'); tx.oncomplete = () => { db.close(); resolve(); }; };
    }));
    await pageOld.goto('http://localhost:4195/?perfil=A');
    await pageOld.waitForFunction(() => document.body.textContent.includes('contiene datos previos'));
    assert.equal(await pageOld.evaluate(() => !!window.testAppLoaded), false);
    const original = await pageOld.evaluate(() => new Promise(resolve => {
      const req = indexedDB.open('anterior-ficticia'); req.onsuccess = () => { const db = req.result, read = db.transaction('datos').objectStore('datos').get('original'); read.onsuccess = () => { db.close(); resolve(read.result); }; };
    }));
    assert.equal(original, 'intacto');
    await pageB.waitForFunction(() => !!document.querySelector('#syncImport')?.hidden || !!window.testAccountLoaded);
    assert(reports.some(report => report.label === 'A'));
    assert.deepEqual(unexpected, []);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
});

test('servidor manual no lanza navegadores ni abre perfiles; activación solo en sus respuestas', async () => {
  const session = await prepareRealSyncSession({ rulesCopy: new URL('../../firestore.rules', import.meta.url), port: 4194, manualBrowser: true });
  session.audit.testing = true;
  session.audit.rulesEvidence = 'Prueba del servidor con archivo local; sin autenticación ni acceso a Firestore.';
  try {
    assert.equal(session.browser, undefined); assert.equal(session.profiles, undefined);
    const html = await (await fetch('http://localhost:4194/')).text();
    assert(html.includes('__manual-bootstrap.js')); assert(!html.includes('src="./app.js"'));
    const config = await (await fetch('http://localhost:4194/js/sync-config.js')).text();
    assert(config.includes('enabled:true'));
    const runtime = await (await fetch('http://localhost:4194/js/firestore-sync.js')).text();
    assert(runtime.includes(session.audit.teamId));
    const report = { label: 'A', uidHash: null, teamId: null, cloud: 'Solo local', local: 'Guardado localmente', gameIds: [], eventIds: [], pendingCount: 0, blockedCount: 0 };
    const response = await fetch('http://localhost:4194/__manual-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report) });
    assert.equal(response.status, 204); assert.equal(session.audit.profiles.A.lastObservation.uidHash, null);
    const rejected = await fetch('http://localhost:4194/__manual-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...report, token: 'not-accepted' }) });
    assert.equal(rejected.status, 404); assert.equal(session.audit.profiles.A.reports.length, 1);
    const accessReport = { label: 'A', uidHash: '0123456789abcdef', teamId: session.audit.teamId, decision: 'permission-denied' };
    const accessResponse = await fetch('http://localhost:4194/__manual-access-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(accessReport) });
    assert.equal(accessResponse.status, 204);
    assert.equal(session.audit.profiles.A.accessReports[0].decision, 'permission-denied');
    assert.equal(session.audit.profiles.A.lastObservation.uidHash, null);
    const foreignOrigin = await fetch('http://localhost:4194/__manual-access-report', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://example.com' }, body: JSON.stringify(accessReport) });
    assert.equal(foreignOrigin.status, 403);
    const { syncSettings } = await import('../../js/sync-config.js');
    assert.deepEqual(syncSettings, { enabled: false, emulator: false, allowRealWrites: false });
  } finally { await session.stop('Prueba del servidor manual finalizada sin Google ni Firestore.'); }
});

test('app real: arranque diferido y reanudación del servidor conservan perfil, partido, tiro e informe', async () => {
  let session = await prepareRealSyncSession({ rulesCopy: new URL('../../firestore.rules', import.meta.url), port: 4193, manualBrowser: true });
  session.audit.testing = true;
  session.audit.rulesEvidence = 'Prueba de arranque real con Auth desactivado y datos ficticios; sin Firestore.';
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    await context.route('**/js/firebase-config.js', route => route.fulfill({ contentType: 'text/javascript',
      body: 'export const firebaseSettings={enabled:false,config:{projectId:"registro-defensivo"},authEmulator:false};' }));
    const forbidden = [], errors = [];
    await context.route(/https:\/\/.*googleapis\.com\//, route => { forbidden.push(route.request().url()); return route.abort(); });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:4193/?perfil=A');
    await page.waitForFunction(() => !document.getElementById('newGameBtn').disabled);
    assert.match(await page.locator('#saveStatusText').textContent(), /Guardado.*localmente/);
    await page.locator('#newGameBtn').click(); await page.locator('#roundInput').fill('ARRANQUE');
    await page.locator('#rivalInput').fill('Ficticio · preflight'); await page.locator('#createGameBtn').click();
    await page.waitForFunction(() => !document.getElementById('gameSelect').disabled);
    await page.locator('.action-btn').first().click();
    await page.locator('[data-points="2"][data-result="fallado"]').click();
    await page.waitForFunction(async () => (await (await import('./js/persistencia.js')).readState()).events.length === 1);
    const before = await page.evaluate(async () => ({ state: await (await import('./js/persistencia.js')).readState(), marker: localStorage.getItem('prueba8b-manual-profile') }));
    const runId = session.audit.runId, teamId = session.audit.teamId, startedAt = session.audit.startedAt;
    await session.stop('Servidor manual detenido por el propietario.');
    session = await prepareRealSyncSession({ rulesCopy: new URL('../../firestore.rules', import.meta.url), port: 4193, manualBrowser: true, resumeRun: runId });
    assert.equal(session.audit.runId, runId); assert.equal(session.audit.teamId, teamId); assert.equal(session.audit.startedAt, startedAt);
    assert.equal(session.audit.resumptions.length, 1); assert.equal(session.audit.stopped, false);
    await page.reload(); await page.waitForFunction(() => !document.getElementById('newGameBtn').disabled);
    const state = await page.evaluate(async () => (await import('./js/persistencia.js')).readState());
    assert.equal(state.games.length, 1); assert.equal(state.events.length, 1);
    assert.equal(state.currentGameId, before.state.currentGameId);
    assert.equal(state.events[0].id, before.state.events[0].id);
    assert.equal(await page.evaluate(() => localStorage.getItem('prueba8b-manual-profile')), before.marker);
    await page.waitForFunction(() => document.getElementById('saveStatusText').textContent.includes('Guardado'));
    // El informe periódico debe llegar al servidor con la app real, no un stub.
    for (let i = 0; i < 50 && session.audit.profiles.A?.lastObservation.eventIds.length !== 1; i++) await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(session.audit.profiles.A.lastObservation.eventIds.length, 1);
    assert.equal(session.audit.profiles.A.lastObservation.uidHash, null);
    assert.deepEqual(errors, []); assert.deepEqual(forbidden, []);
  } finally { await browser.close(); await session.stop('Prueba del arranque diferido finalizada; sin OAuth ni Firestore.'); }
  await assert.rejects(prepareRealSyncSession({ rulesCopy: new URL('../../firestore.rules', import.meta.url), port: 4193,
    manualBrowser: true, resumeRun: session.audit.runId }), /detenida para revisión/);
});

test('diagnóstico recorre la envoltura real del transporte: propietario permitido y otra cuenta denegada', async () => {
  const session = await prepareRealSyncSession({ rulesCopy: new URL('../../firestore.rules', import.meta.url), port: 4192, manualBrowser: true });
  session.audit.testing = true;
  session.audit.rulesEvidence = 'Diagnóstico con módulos SDK simulados; sin OAuth ni Firestore real.';
  const browser = await chromium.launch();
  try {
    for (const [label, uid, decision] of [['A', 'owner-ficticio', 'allowed'], ['B', 'otro-ficticio', 'permission-denied']]) {
      const context = await browser.newContext();
      const unexpected = [], errors = [];
      await context.route('**/app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      await context.route('**/js/cuenta-ui.js', route => route.fulfill({ contentType: 'text/javascript', body:
        `const {loadFirestoreTransport}=await import('./firestore-sync.js'); await (await loadFirestoreTransport(${JSON.stringify(uid)})).teams(); window.testAccessDone=true;` }));
      await context.route('**/js/sync-storage.js', route => route.fulfill({ contentType: 'text/javascript', body:
        `export const canonical=JSON.stringify;export const storageContext=()=>({uid:${JSON.stringify(uid)},scope:null,teamId:null});export const listPending=async()=>[];` }));
      await context.route('**/js/persistencia.js', route => route.fulfill({ contentType: 'text/javascript', body:
        'export const readState=async()=>({games:[],events:[]});' }));
      await context.route('https://www.gstatic.com/firebasejs/12.11.0/*', route => {
        const name = new URL(route.request().url()).pathname.split('/').pop();
        const modules = {
          'firebase-app.js': 'export const getApp=()=>({options:{projectId:"registro-defensivo"}});',
          'firebase-auth.js': `export const getAuth=()=>({currentUser:{uid:${JSON.stringify(uid)}}});`,
          'firebase-firestore.js': `export const getFirestore=app=>({app});export const doc=(...args)=>({id:args.at(-1)});
            export const getDocFromServer=async ref=>{
              if(${decision === 'permission-denied'}) throw Object.assign(Error('Denegación ficticia'),{code:'permission-denied'});
              return {id:ref.id,data:()=>ref.id===${JSON.stringify(uid)}?{role:'owner',status:'active'}:{ownerUid:${JSON.stringify(uid)},name:'PRUEBA 8B'}};
            };`
        };
        return modules[name] ? route.fulfill({ contentType: 'text/javascript', body: modules[name] }) : route.abort();
      });
      await context.route(/https:\/\/.*googleapis\.com\//, route => { unexpected.push(route.request().url()); return route.abort(); });
      const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://localhost:4192/?perfil=' + label);
      await page.waitForFunction(() => window.testAccessDone);
      for (let i = 0; i < 30 && !session.audit.profiles[label]?.accessReports?.length; i++) await new Promise(resolve => setTimeout(resolve, 100));
      assert.equal(session.audit.profiles[label]?.accessReports?.at(-1).decision, decision);
      assert.equal(session.audit.profiles[label].accessReports.at(-1).teamId, session.audit.teamId);
      assert.deepEqual(unexpected, []); assert.deepEqual(errors, []);
      await context.close();
    }
  } finally { await browser.close(); await session.stop('Prueba del diagnóstico con SDK simulado finalizada; sin OAuth ni Firestore.'); }
});

test('reanudar rechaza rutas arbitrarias e identificadores fuera del modo manual', async () => {
  await assert.rejects(prepareRealSyncSession({ manualBrowser: true, resumeRun: '../otra-carpeta' }), /identificador.*inválido/);
  await assert.rejects(prepareRealSyncSession({ manualBrowser: false, resumeRun: '2026-10-15T22-17-01-344Z-045994f9' }), /identificador.*inválido/);
});
