// Solo Auth/Firestore Emulator y datos ficticios. No utiliza credenciales administrativas reales.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import { startServer } from './servidor.mjs';
import { chromium, configure, officialSdk } from './browser-support.mjs';
import { webkit } from '@playwright/test';
import { createFirestoreTransport } from '../../js/firestore-sync.js';
import { parseConfiguration } from '../../js/configuracion.js';
import { docFromConfiguration, idsInDoc } from '../../js/configuracion-guardada.js';
import { accessPlan, applyEmulatorPlan } from './supervision-admin.mjs';

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Solo emuladores locales.');
sdk.setLogLevel('silent');
const env = await initializeTestEnvironment({ projectId: 'demo-defensas', firestore: { host: '127.0.0.1', port: 8085, rules: await readFile('firestore.rules', 'utf8') } });
const reports = [], errors = [], forbidden = [], sportsWrites = [], modules = new Set();
const failedChannels = new Set(), expectedTransportErrors = [], csp = [], staticProbes = [];
const channelKey = value => {
  const url = new URL(value);
  return url.origin === 'http://127.0.0.1:8085' && url.pathname === '/google.firestore.v1.Firestore/Listen/channel'
    && url.searchParams.get('database') === 'projects/demo-defensas/databases/(default)' && url.searchParams.get('SID')
    ? url.searchParams.get('SID') : null;
};
const out = '.test-artifacts/firebase/fase23'; await mkdir(out, { recursive: true });
const pass = text => { reports.push(text); console.log('OK: ' + text); };
const yes = async (text, promise) => { await assertSucceeds(promise); pass(text); };
const no = async (text, promise) => {
  const error = await assertFails(promise); assert.equal(error.code, 'permission-denied', text); pass('Denegado: ' + text);
};
const db = (uid, provider = 'google.com') => env.authenticatedContext(uid, { email: 'mismo-correo@ficticio.test', role: 'admin', firebase: { sign_in_provider: provider } }).firestore();
const owner = db('propietario23'), supervisor = db('supervisor23'), revoked = db('revocado23'), external = db('externo23');
const anonymous = env.unauthenticatedContext().firestore(), guest = db('anonimo23', 'anonymous');
const transport = (database, uid) => createFirestoreTransport(sdk, database, uid, () => uid);
const ownerTransport = transport(owner, 'propietario23'), supervisorTransport = transport(supervisor, 'supervisor23');
const base = 'teams/equipo23/games/remoto23';
const grant = { schemaVersion: 1, role: 'reader', status: 'active' };
const configuration = parseConfiguration(await readFile('categorias.csv', 'utf8'));
const docPanel = docFromConfiguration(configuration), ids = idsInDoc(docPanel);
docPanel.categories[0].items[0].name = 'Defensa ficticia 23';
const panel = { version: { id: 'cfg-fase23', createdAt: '2026-10-29T10:00:00Z', source: 'editor', basedOn: null, csvHash: null, doc: docPanel }, usedIds: { actions: [...ids.actions], defenses: [...ids.defenses] } };
const gamePayload = { id: 'local23', jornada: '23', rival: 'Rival ficticio 23', createdAt: '2026-10-29T10:00:00Z' };
const op = (type, extra = {}) => ({ type, uid: 'propietario23', projectId: 'demo-defensas', teamId: 'equipo23', gameId: 'remoto23', sourceId: 'dispositivo23', ...extra });
const event = (id, result = 'fallado') => ({ id, gameId: 'local23', categoria: 'Transición', accion: 'Contraataque', categoria_id: 'transicion', accion_id: configuration.categories[0].actions[0].id,
  defensa_id: null, tiros_permitidos: [2, 3], valor_tiro: 2, resultado: result, fecha_hora: '2026-10-29T10:00:01Z', seq: 1 });
const admin = fn => env.withSecurityRulesDisabled(c => fn(c.firestore()));
let server;
try {
  await env.clearFirestore();
  await ownerTransport.createTeam('Equipo ficticio 23', 'equipo23');
  await transport(external, 'externo23').createTeam('Equipo ajeno ficticio', 'ajeno23');
  await ownerTransport.send(op('game', { payload: gamePayload }));
  await ownerTransport.send(op('panel', { payload: panel, baseId: null }));
  await ownerTransport.send(op('default-panel', { payload: panel, baseId: null }));
  for (const id of ['e1', 'e2', 'e3']) await ownerTransport.send(op('event', { eventId: id, payload: event(id, id === 'e2' ? 'anotado' : 'fallado'), panelVersionId: panel.version.id }));
  await ownerTransport.send(op('undo', { eventId: 'e3', opId: 'undo23' }));
  await ownerTransport.send(op('game', { gameId: 'legacy23', payload: { ...gamePayload, id: 'legacy23', rival: 'Histórico ficticio' } }));
  await ownerTransport.send(op('game', { gameId: 'dead23', payload: { ...gamePayload, id: 'dead23' } }));
  await ownerTransport.send(op('delete', { gameId: 'dead23', payload: { ...gamePayload, id: 'dead23' } }));
  pass('Propietario: equipo, partidos, panel, tres tiros, Deshacer y borrado con transporte 22.0');
  await assert.rejects(applyEmulatorPlan(accessPlan('asignar', 'supervisor23', 'equipo23'), 'propietario-incorrecto'), /no coincide/);
  await applyEmulatorPlan(accessPlan('asignar', 'supervisor23', 'equipo23'), 'propietario23');
  await applyEmulatorPlan(accessPlan('asignar', 'revocado23', 'equipo23'), 'propietario23');
  await applyEmulatorPlan(accessPlan('revocar', 'revocado23', 'equipo23'), 'propietario23');
  await admin(database => sdk.setDoc(sdk.doc(database, 'supervision/anonimo23/teams/equipo23'), grant));
  pass('Administración ficticia: propietario verificado, asignación y revocación transaccionales');
  for (const path of ['teams/equipo23', base, base + '/events/e1', base + '/eventDeletions/e3', base + '/panelVersions/cfg-fase23', 'teams/equipo23/configuration/current', 'teams/equipo23/configurationVersions/cfg-fase23']) {
    await yes('Supervisor lee ' + path, sdk.getDocFromServer(sdk.doc(supervisor, path)));
  }
  for (const path of ['supervision/supervisor23/teams', 'teams/equipo23/games', base + '/events', base + '/eventDeletions', base + '/panelVersions']) await yes('Supervisor lista ' + path, sdk.getDocsFromServer(sdk.collection(supervisor, path)));
  for (const [role, database] of [['revocado', revoked], ['externo con mismo correo/claim admin', external], ['sin sesión', anonymous], ['anónimo con ACL', guest]]) {
    for (const path of ['teams/equipo23', base, base + '/events/e1']) await no(role + ': ' + path, sdk.getDocFromServer(sdk.doc(database, path)));
    await no(role + ': consulta partidos', sdk.getDocsFromServer(sdk.collection(database, 'teams/equipo23/games')));
  }
  for (const path of ['teams', 'supervision', 'supervision/revocado23/teams', 'teams/equipo23/members']) await no('Supervisor enumera ' + path, sdk.getDocsFromServer(sdk.collection(supervisor, path)));
  for (const path of ['teams/ajeno23', 'teams/ajeno23/games/adivinado', 'teams/equipo23/members/propietario23', 'users/propietario23']) await no('Supervisor adivina ' + path, sdk.getDocFromServer(sdk.doc(supervisor, path)));
  await no('consulta global aunque filtre por propietario ajeno', sdk.getDocsFromServer(sdk.query(sdk.collection(supervisor, 'teams'), sdk.where('ownerUid', '==', 'propietario23'))));
  await no('collectionGroup games', sdk.getDocsFromServer(sdk.collectionGroup(supervisor, 'games')));
  await no('collectionGroup events', sdk.getDocsFromServer(sdk.collectionGroup(supervisor, 'events')));
  for (const [role, database] of [['supervisor', supervisor], ['propietario', owner], ['externo', external], ['revocado', revoked]]) {
    const ref = sdk.doc(database, 'supervision/supervisor23/teams/equipo23');
    await no(role + ' altera autorización', sdk.updateDoc(ref, { status: 'active' }));
    await no(role + ' borra autorización', sdk.deleteDoc(ref));
    await no(role + ' crea autorización', sdk.setDoc(sdk.doc(database, 'supervision/supervisor23/teams/ajeno23'), grant));
  }
  const paths = [base, base + '/events/e1', base + '/eventDeletions/e3', base + '/panelVersions/cfg-fase23', 'teams/equipo23', 'teams/equipo23/configuration/current', 'teams/equipo23/configurationVersions/cfg-fase23', 'teams/equipo23/members/supervisor23'];
  for (const path of paths) {
    await no('Supervisor crea/sustituye ' + path, sdk.setDoc(sdk.doc(supervisor, path), { schemaVersion: 1 }));
    await no('Supervisor actualiza ' + path, sdk.updateDoc(sdk.doc(supervisor, path), { sourceId: 'ataque' }));
    await no('Supervisor borra ' + path, sdk.deleteDoc(sdk.doc(supervisor, path)));
  }
  for (const type of ['game', 'event', 'undo', 'delete', 'panel', 'default-panel']) {
    const operation = op(type, { uid: 'supervisor23', gameId: type === 'game' ? 'nuevo23' : 'remoto23', payload: type === 'panel' || type === 'default-panel' ? { ...panel, version: { ...panel.version, id: 'cfg-ataque' } } : type === 'event' ? event('ataque') : gamePayload,
      eventId: 'ataque', opId: 'undo-ataque', baseId: type === 'default-panel' ? 'cfg-fase23' : 'cfg-fase23' });
    await assert.rejects(supervisorTransport.send(operation), error => ['permission-denied', 'SYNC_CONFLICT'].includes(error.code));
    pass('Motor de escritura usado deliberadamente por supervisor: ' + type + ' rechazado');
  }
  // Escrituras con payload válido prueban las Rules sin depender de validaciones del transporte.
  const original = (await sdk.getDocFromServer(sdk.doc(supervisor, base))).data();
  const { panel: ignoredPanel, panelClock: ignoredClock, ...originalGame } = original;
  await no('crear partido con sobre válido', sdk.setDoc(sdk.doc(supervisor, 'teams/equipo23/games/nuevo-valido'), { ...originalGame, createdBy: 'supervisor23', createdAt: sdk.serverTimestamp() }));
  await no('eliminar partido por lápida válida', sdk.updateDoc(sdk.doc(supervisor, base), { deletedAt: sdk.serverTimestamp(), deletedBy: 'supervisor23' }));
  await no('Deshacer con lápida válida', sdk.setDoc(sdk.doc(supervisor, base + '/eventDeletions/ataque'), { schemaVersion: 1, eventId: 'ataque', deletedBy: 'supervisor23', deletedAt: sdk.serverTimestamp(), operationId: 'ataque' }));
  await no('eventos del partido borrado', sdk.getDocsFromServer(sdk.collection(supervisor, 'teams/equipo23/games/dead23/events')));
  await applyEmulatorPlan(accessPlan('revocar', 'supervisor23', 'equipo23'), 'propietario23');
  await no('revocación inmediata en nueva lectura con sesión abierta', sdk.getDocFromServer(sdk.doc(supervisor, base)));
  await no('revocación en consulta de eventos', sdk.getDocsFromServer(sdk.collection(supervisor, base + '/events')));
  await admin(database => sdk.deleteDoc(sdk.doc(database, 'supervision/supervisor23/teams/equipo23')));
  await no('permiso eliminado también revoca', sdk.getDocFromServer(sdk.doc(supervisor, base)));
  for (const malformed of [{ ...grant, role: 'owner' }, { ...grant, schemaVersion: 2 }, { role: 'reader', status: 'active' }]) {
    await admin(database => sdk.setDoc(sdk.doc(database, 'supervision/supervisor23/teams/equipo23'), malformed));
    await no('ACL inválida no autoriza', sdk.getDocFromServer(sdk.doc(supervisor, base)));
  }
  await ownerTransport.send(op('event', { eventId: 'continuidad', payload: event('continuidad'), panelVersionId: panel.version.id }));
  await ownerTransport.send(op('undo', { eventId: 'continuidad', opId: 'undo-continuidad' }));
  await yes('Propietario sigue consultando y registrando tras revocar supervisor', sdk.getDocFromServer(sdk.doc(owner, base)));
  assert.equal((await sdk.getDocsFromServer(sdk.collection(owner, base + '/events'))).size, 4);

  server = await startServer(4193);
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await type.launch();
    const context = await browser.newContext({ viewport: { width: 1180, height: 820 } });
    try {
      context.on('requestfailed', request => { const key = channelKey(request.url()); if (key) failedChannels.add(key); });
      await context.exposeBinding('__csp23', (_, text) => csp.push(text));
      await context.addInitScript(() => document.addEventListener('securitypolicyviolation', e => { void window.__csp23(e.effectiveDirective + ': ' + e.blockedURI); }));
      await configure(context); await officialSdk(context, true);
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        // Auth prepara el resolver de popups aunque esta prueba use credenciales
        // ficticias. La sonda de biblioteca se bloquea; no es una API de datos.
        if (url.origin === 'https://apis.google.com' && url.pathname === '/js/api.js' && route.request().method() === 'GET') {
          staticProbes.push(url.origin + url.pathname); return route.abort();
        }
        if (!['127.0.0.1', 'localhost', 'www.gstatic.com'].includes(url.hostname)) { forbidden.push(url.origin); return route.abort(); }
        if (url.pathname.startsWith('/js/')) modules.add(url.pathname);
        if (/\/Write\/|:commit/.test(url.pathname)) sportsWrites.push(url.pathname);
        return route.fallback();
      });
      const page = await context.newPage(); page.on('pageerror', error => errors.push(name + ': ' + error.message));
      await page.goto('http://127.0.0.1:4193/supervision.html');
      await page.waitForFunction(() => !document.querySelector('#supervisionLogin').disabled);
      const uid = await page.evaluate(async name => {
        const app = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
        const auth = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js');
        const result = await auth.signInWithCredential(auth.getAuth(app.getApp('defensas-auth')), auth.GoogleAuthProvider.credential(JSON.stringify({ sub: 'supervisor23-' + name, email: name + '@ficticio.test', email_verified: true, name: 'Supervisor ficticio' })));
        return result.user.uid;
      }, name);
      await page.waitForFunction(() => document.querySelector('#supervisionStatus').textContent.includes('No tienes equipos'));
      await applyEmulatorPlan(accessPlan('asignar', uid, 'equipo23'), 'propietario23');
      const ready = () => page.waitForFunction(() => !document.querySelector('#supervisionTeam').disabled);
      const selectTeam = async () => { await ready(); await page.locator('#supervisionTeam').selectOption('equipo23'); await page.waitForFunction(() => !document.querySelector('#supervisionGame').disabled); };
      const selectGame = async (id = 'remoto23') => { await page.locator('#supervisionGame').selectOption(id); await page.locator('#statisticsView').waitFor({ state: 'visible' }); };
      await selectTeam(); assert.equal(await page.locator('#supervisionGame option').count(), 3, 'Excluye el partido borrado');
      await selectGame(); assert.equal(await page.locator('#statsResults').textContent(), '1/2');
      assert.equal(await page.locator('#statsSuccess').textContent(), '50%');
      assert((await page.locator('#statisticsContent').textContent()).includes('Defensa ficticia 23'));
      assert.equal(await page.locator('#undoBtn, #newGameBtn, #editButtonsBtn, #deleteGameBtn, #exportCsvBtn, #syncEnable').count(), 0);
      const cell = page.locator('[data-matrix-key]').first(); await cell.click(); assert(await page.locator('#matrixDetail').isVisible()); await page.keyboard.press('Escape');
      for (const [width, height] of [[1180, 820], [820, 1180], [390, 844], [320, 740]]) {
        await page.setViewportSize({ width, height });
        assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `${name} overflow ${width}`);
        assert((await page.locator('#supervisionTeam').boundingBox()).height >= 44);
        await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true });
      }
      await selectGame('legacy23'); assert.equal(await page.locator('#statsResults').textContent(), '—');
      assert((await page.locator('#supervisionStatus').textContent()).includes('histórico'));
      await page.reload(); await selectTeam(); await selectGame();
      pass(name + ': Auth ficticio, descubrimiento en vivo, Dashboard compartido, lápidas, panel histórico, desglose, recarga y cuatro tamaños');
      const databases = await page.evaluate(() => indexedDB.databases());
      assert(!databases.some(db => /defensas/i.test(db.name)), 'No abre la base deportiva');
      await context.setOffline(true); await page.locator('#statisticsView').waitFor({ state: 'hidden' });
      await context.setOffline(false); await selectTeam(); await selectGame();
      await applyEmulatorPlan(accessPlan('revocar', uid, 'equipo23'), 'propietario23');
      await page.locator('#statisticsView').waitFor({ state: 'hidden' });
      await page.waitForFunction(() => document.querySelector('#supervisionTeam').disabled);
      assert.equal(await page.locator('#statisticsContent').textContent(), '');
      await page.reload(); await page.waitForFunction(() => document.querySelector('#supervisionStatus').textContent.includes('No tienes equipos'));
      pass(name + ': offline limpia, reconexión verifica, revocación limpia el Dashboard y persiste al recargar');
      // Cambio de cuenta externo con una respuesta pendiente de configuración.
      await applyEmulatorPlan(accessPlan('asignar', uid, 'equipo23'), 'propietario23');
      await selectTeam();
      // El fallback ya está cargado: se usa recarga para diferir de verdad la primera lectura.
      await page.reload(); await selectTeam();
      let releaseCsv, csvRequested;
      const requested = new Promise(resolve => { csvRequested = resolve; });
      const release = new Promise(resolve => { releaseCsv = resolve; });
      await context.route('**/categorias.csv', async route => { csvRequested(); await release; await route.continue(); });
      await page.locator('#supervisionGame').selectOption('remoto23'); await requested;
      await applyEmulatorPlan(accessPlan('revocar', uid, 'equipo23'), 'propietario23');
      await page.waitForFunction(() => document.querySelector('#supervisionTeam').disabled);
      releaseCsv();
      await page.waitForFunction(() => document.querySelector('#supervisionStatus').textContent.includes('No tienes equipos'));
      assert(await page.locator('#statisticsView').isHidden());
      await page.evaluate(async () => {
        const app = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
        const auth = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js');
        await auth.signOut(auth.getAuth(app.getApp('defensas-auth')));
      });
      await page.locator('#supervisionLogin').waitFor({ state: 'visible' });
      assert(await page.locator('#statisticsView').isHidden());
      pass(name + ': respuesta tardía tras revocación y cierre externo no repintan datos');
    } finally { await context.close(); await browser.close(); }
  }
  const unexpected = errors.filter(text => {
    // WebKit informa como pageerror del canal HTTP local abortado al cortar red,
    // recargar o cerrar sesión. Solo se admite si existe requestfailed del MISMO SID.
    const match = text.match(/^webkit: (\/127\.0\.0\.1:8085\/google\.firestore\.v1\.Firestore\/Listen\/channel\?\S+) due to access control checks\.$/);
    if (match && failedChannels.has(channelKey('http:/' + match[1]))) { expectedTransportErrors.push(text); return false; }
    return true;
  });
  await writeFile(out + '/diagnostico.json', JSON.stringify({ errors, unexpected, expectedTransportErrors, forbidden, sportsWrites, csp }, null, 2));
  assert.deepEqual(unexpected, []); assert.deepEqual(csp, []); assert.deepEqual(forbidden, []); assert.deepEqual(sportsWrites, []);
  for (const path of ['/js/firestore-sync.js', '/js/sync-engine.js', '/js/sync-storage.js', '/js/persistencia.js', '/app.js', '/js/cuenta-ui.js']) assert(!modules.has(path), 'Motor de escritura cargado: ' + path);
  pass('Cero errores inesperados/CSP, destinos de datos reales, escrituras deportivas o módulos de escritura en supervisión');
  await writeFile(out + '/resultados.json', JSON.stringify({ reports, unexpected, expectedTransportErrors, csp, forbidden, sportsWrites, staticProbes, modules: [...modules] }, null, 2));
} finally { server?.close(); await env.cleanup(); }
