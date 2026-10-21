import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { startServer } from './servidor.mjs';
import { chromium, officialSdk } from './browser-support.mjs';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085') throw Error('Solo Firestore Emulator ficticio.');
const env = await initializeTestEnvironment({ projectId: 'demo-defensas', firestore: { host: '127.0.0.1', port: 8085,
  rules: await readFile('firestore.rules', 'utf8') } });
await env.clearFirestore();
const server = await startServer(4198), reports = [], contexts = [], forbidden = [], blockedProbes = [];
let browser;
const pass = label => { reports.push(label); console.log('OK: ' + label); };
async function device(uid = 'owner', team = 'team-a') {
  const context = await browser.newContext(); contexts.push(context);
  await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript',
    body: 'export const syncSettings={enabled:true,emulator:true,allowRealWrites:false};' }));
  await officialSdk(context, true);
  // WebChannel comprueba conectividad con esta imagen al cortar la red. Se
  // intercepta sin salir del equipo; no se autoriza tráfico al proyecto real.
  await context.route('https://www.google.com/images/cleardot.gif*', route => {
    blockedProbes.push(route.request().url()); return route.abort();
  });
  context.on('request', request => {
    const url = new URL(request.url()), host = url.hostname;
    if (host === 'www.google.com' && url.pathname === '/images/cleardot.gif') return;
    if (!['127.0.0.1', 'localhost', 'www.gstatic.com'].includes(host)) forbidden.push(host);
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4198/tests/sync-fixture.html'); await page.waitForFunction(() => window.T);
  await page.evaluate(async ([uid, team]) => T.setup(uid, team), [uid, team]);
  return { page, context };
}
const flush = page => page.evaluate(() => T.flush());
// Las escuchas entregan cambios asincrónicamente, sin forzar una consulta nueva.
async function rowsIn(page, key, count) {
  const deadline = Date.now() + 35000;
  while ((await page.evaluate(() => T.p.readState()))[key].length !== count) {
    assert(Date.now() < deadline, `No se reciben ${count} filas de ${key}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
const eventsIn = (page, count) => rowsIn(page, 'events', count);
const gamesIn = (page, count) => rowsIn(page, 'games', count);
try {
  browser = await chromium.launch();
  const { page: a, context: ac } = await device();
  await a.evaluate(() => T.backend.createTeam('Equipo ficticio A', 'team-a'));
  const { page: b } = await device();
  const gid = await a.evaluate(async () => {
    const game = { id: crypto.randomUUID(), jornada: '8B', rival: 'Ficticio', createdAt: '2026-10-15T12:00:00Z' };
    await T.p.createGameAndSelect(game); await T.shot(game.id); return game.id;
  });
  let result = await flush(a); assert.equal(result.queue.length, 0); assert.equal(result.status, 'Sincronizado');
  await flush(b); await b.evaluate(gid => T.p.selectGameState(gid), gid);
  assert.equal((await b.evaluate(() => T.p.readState())).events.length, 1);
  pass('A registra localmente y B recupera partido, metadatos y evento');
  await Promise.all([a.evaluate(gid => T.shot(gid), gid), b.evaluate(gid => T.shot(gid), gid)]);
  await Promise.all([flush(a), flush(b)]); await flush(a); await flush(b);
  await eventsIn(a, 3); await eventsIn(b, 3);
  assert.equal((await a.evaluate(() => T.p.readState())).events.length, 3);
  assert.equal((await b.evaluate(() => T.p.readState())).events.length, 3);
  pass('Registro simultáneo en A y B: unión de eventos, sin sobrescritura');

  await ac.setOffline(true);
  await a.evaluate(gid => T.shot(gid), gid);
  assert.equal(await a.evaluate(async () => (await T.s.listPending()).length), 1);
  await ac.setOffline(false);
  await a.evaluate(() => T.engine.stop());
  await a.reload(); await a.waitForFunction(() => window.T); await a.evaluate(() => T.setup('owner', 'team-a'));
  assert.equal(await a.evaluate(async () => (await T.s.listPending()).length), 1);
  await flush(a); await flush(b);
  await eventsIn(b, 4);
  assert.equal((await b.evaluate(() => T.p.readState())).events.length, 4);
  pass('Registro offline, recarga con cola duradera y recuperación en B');

  const undone = await a.evaluate(async gid => {
    const removed = await T.p.removeLastGameEvent(gid);
    const op = (await T.s.listPending())[0]; await T.backend.send(op); await T.backend.send(op);
    return removed.id;
  }, gid);
  await b.evaluate(gid => T.shot(gid), gid); await flush(b); await flush(a); await flush(b);
  await eventsIn(b, 4);
  const afterUndo = await b.evaluate(() => T.p.readState());
  assert.equal(afterUndo.events.length, 4); assert(!afterUndo.events.some(event => event.id === undone));
  pass('Deshacer por ID, reenvío repetido y alta concurrente: no resucita el evento');

  // Fallo entre escritura deportiva y outbox: la transacción completa debe abortar.
  // La escucha de A debe haber incorporado el último tiro de B antes de tomar
  // la referencia: una recepción pendiente es ajena al aborto que se prueba.
  await eventsIn(a, 4);
  const beforeAbort = await a.evaluate(() => T.p.readState());
  const aborted = await a.evaluate(async gid => {
    const original = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function(value, ...args) {
      if (this.name === 'syncQueue') { this.transaction.abort(); return {}; }
      return original.call(this, value, ...args);
    };
    try { await T.shot(gid); return false; } catch { return true; }
    finally { IDBObjectStore.prototype.add = original; }
  }, gid);
  assert(aborted); assert.deepEqual(await a.evaluate(() => T.p.readState()), beforeAbort);
  pass('Aborto de outbox revierte el evento: atomicidad local real');

  // Acuse perdido: enviar sin retirar outbox, recargar y reintentar el mismo ID.
  await a.evaluate(gid => T.shot(gid), gid);
  await a.evaluate(async () => { const op = (await T.s.listPending())[0]; await T.backend.send(op); });
  await a.evaluate(() => T.engine.stop());
  await a.reload(); await a.waitForFunction(() => window.T); await a.evaluate(() => T.setup('owner', 'team-a'));
  await flush(a); await flush(b);
  await eventsIn(b, 5);
  assert.equal((await b.evaluate(() => T.p.readState())).events.length, 5);
  pass('Respuesta perdida tras commit remoto y recarga: reintento sin duplicados');

  // B retiene un evento pendiente mientras A elimina el partido.
  await b.evaluate(gid => T.shot(gid), gid);
  await a.evaluate(gid => T.p.deleteGame(gid), gid); await flush(a);
  result = await flush(b);
  await gamesIn(b, 0); result.state = await b.evaluate(() => T.p.readState());
  assert.equal(result.state.games.length, 0); assert.equal(result.queue.length, 0);
  await b.reload(); await b.waitForFunction(() => window.T); await b.evaluate(() => T.setup('owner', 'team-a')); await flush(b);
  assert.equal((await b.evaluate(() => T.p.readState())).games.length, 0);
  pass('Partido borrado frente a dispositivo atrasado: alta tardía rechazada y ninguna resurrección');

  const { page: legacy } = await device(null, null);
  const original = await legacy.evaluate(async () => {
    await T.p.createGameAndSelect({ id: 'legacy', jornada: 'Antigua', rival: 'Histórico', createdAt: '2020-01-01' });
    await T.p.addEvent({ id: 'legacy-event', gameId: 'legacy', categoria: 'Transición', accion: 'Bajo aro',
      valor_tiro: 2, resultado: 'fallado', fecha_hora: '2020-01-01T00:00:00Z' });
    return { state: await T.p.readState(), events: await T.p.allEvents() };
  });
  await legacy.evaluate(() => T.setup('owner', 'team-a'));
  const imported = await legacy.evaluate(async () => {
    const review = await T.s.listLegacyForImport(), c = T.s.storageContext();
    let refused = false; try { await T.s.importLegacy(review, c, false); } catch { refused = true; }
    if (!refused) throw Error('Importación sin confirmación');
    const ids = await T.s.importLegacy(review, c, true); await T.s.importLegacy(review, c, true);
    return { ids, pending: (await T.s.listPending()).length, originals: await T.p.allEvents() };
  });
  assert.equal(imported.pending, 2); assert.deepEqual(imported.originals, original.events);
  await flush(legacy); await flush(b);
  await gamesIn(b, 1);
  await b.evaluate(gid => T.p.selectGameState(gid), imported.ids[0]);
  const csvSnapshot = await b.evaluate(gid => T.p.readExportSnapshot(gid), imported.ids[0]);
  assert.equal(csvSnapshot.game.id, 'legacy'); assert.equal(csvSnapshot.events[0].id, 'legacy-event');
  assert.equal(csvSnapshot.events[0].gameId, 'legacy'); assert.equal(csvSnapshot.events[0].seq, 1);
  pass('Importación confirmada e idempotente: originales intactos, IDs históricos y CSV conservados');

  await legacy.evaluate(async gid => {
    await T.p.selectGameState(gid); await T.p.removeLastGameEvent(gid);
    const review = await T.s.listLegacyForImport(); await T.s.importLegacy(review, T.s.storageContext(), true);
  }, imported.ids[0]);
  await flush(legacy); await flush(b);
  await eventsIn(b, 0);
  assert.equal((await b.evaluate(() => T.p.readState())).events.length, 0);
  pass('Repetir importación tras Deshacer no restaura el histórico eliminado de la copia sincronizada');

  await legacy.evaluate(() => T.setup('outsider', null));
  assert.equal((await legacy.evaluate(() => T.p.readState())).games.length, 0);
  assert.equal(await legacy.evaluate(async () => (await T.s.listLegacyForImport()).length), 0);
  assert(await legacy.evaluate(async () => { try { await T.p.readExportSnapshot('legacy'); return false; } catch { return true; } }));
  await legacy.evaluate(() => T.setup('outsider', 'team-a'));
  result = await flush(legacy); assert.equal(result.status, 'Error de sincronización'); assert.equal(result.state.games.length, 0);
  pass('Cambio de cuenta: cachés/originales vinculados ocultos, exportación y acceso remoto ajenos denegados');

  await a.evaluate(() => T.backend.createTeam('Equipo ficticio B', 'team-b'));
  await a.evaluate(() => T.setup('owner', 'team-b')); await flush(a);
  assert.equal((await a.evaluate(() => T.p.readState())).games.length, 0);
  pass('Aislamiento de equipos de un mismo propietario');

  // Crear y eliminar sin haber enviado nunca: la lápida debe poder llegar primero.
  await a.evaluate(async () => {
    await T.p.createGameAndSelect({ id: 'never-uploaded', jornada: 'X', rival: 'Ficticio', createdAt: '2026-10-15' });
    await T.shot('never-uploaded'); await T.p.deleteGame('never-uploaded');
  });
  result = await flush(a); assert.equal(result.queue.length, 0); assert.equal(result.state.games.length, 0);
  pass('Borrado de partido antes de la primera subida: lápida prioritaria');

  const peer = await ac.newPage(); await peer.goto('http://127.0.0.1:4198/tests/sync-fixture.html'); await peer.waitForFunction(() => window.T);
  await peer.evaluate(() => T.setup('owner', 'team-b'));
  await a.evaluate(() => T.engine.stop());
  assert(await a.evaluate(() => T.s.lease(T.s.storageContext(), 'worker-one')));
  assert.equal(await peer.evaluate(() => T.s.lease(T.s.storageContext(), 'worker-two')), false);
  await a.evaluate(() => T.p.transact(['syncMeta'], 'readwrite', (tx, done) => {
    tx.objectStore('syncMeta').put({ key: 'lease:' + T.s.storageContext().scope, worker: 'worker-one', until: 0 }); done();
  }));
  assert(await peer.evaluate(() => T.s.lease(T.s.storageContext(), 'worker-two')));
  await peer.evaluate(() => T.s.lease(T.s.storageContext(), 'worker-two', true));
  pass('Varias pestañas: arrendamiento atómico, exclusión y recuperación tras caducar');

  // Base v1 real poblada: actualización aditiva sin tocar sus registros.
  const migrationContext = await browser.newContext(); contexts.push(migrationContext);
  await officialSdk(migrationContext, true);
  await migrationContext.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'export const syncSettings={enabled:true,emulator:true,allowRealWrites:false};' }));
  await migrationContext.route('**/tests/sync-fixture.html', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><p>Semilla v1 ficticia</p>' }));
  const migrated = await migrationContext.newPage(); await migrated.goto('http://127.0.0.1:4198/tests/sync-fixture.html');
  await migrated.evaluate(() => new Promise((ok, fail) => {
    const request = indexedDB.open('registro_defensivo_baloncesto', 1);
    request.onupgradeneeded = () => {
      const db = request.result; db.createObjectStore('games', { keyPath: 'id' }); db.createObjectStore('settings', { keyPath: 'key' });
      const events = db.createObjectStore('events', { keyPath: 'seq', autoIncrement: true }); events.createIndex('byGameId', 'gameId'); events.createIndex('byGameSeq', ['gameId', 'seq']); events.createIndex('byUuid', 'id', { unique: true });
    };
    request.onsuccess = () => { const db = request.result, tx = db.transaction(['games', 'events', 'settings'], 'readwrite');
      tx.objectStore('games').add({ id: 'v1', jornada: '1', rival: 'Ficticio', createdAt: '2020' });
      tx.objectStore('events').add({ id: 'e-v1', gameId: 'v1', categoria: 'Transición', accion: 'Bajo aro', valor_tiro: 2, resultado: 'fallado', fecha_hora: '2020' });
      tx.objectStore('settings').put({ key: 'activeGame', value: 'v1' });
      tx.oncomplete = () => { db.close(); ok(); }; tx.onabort = () => fail(tx.error);
    };
  }));
  await migrationContext.unroute('**/tests/sync-fixture.html'); await migrated.reload(); await migrated.waitForFunction(() => window.T);
  const migration = await migrated.evaluate(async () => ({ state: await T.p.readState(), queue: await T.p.transact(['syncQueue'], 'readonly', (tx, done) => {
    const r = tx.objectStore('syncQueue').getAll(); r.onsuccess = () => done(r.result);
  }) }));
  assert.equal(migration.state.currentGameId, 'v1'); assert.equal(migration.state.events[0].id, 'e-v1'); assert.equal(migration.state.events[0].seq, 1); assert.equal(migration.queue.length, 0);
  pass('Migración de esquema v1→v2 aditiva: partido, selección, histórico y seq intactos, cero subidas automáticas');

  await a.evaluate(async () => {
    await T.p.createGameAndSelect({ id: 'retry', jornada: 'R', rival: 'Ficticio', createdAt: '2026-10-15' });
    const { createSyncEngine } = await import('../js/sync-engine.js');
    T.engine.stop();
    const failure = createSyncEngine({ send: async () => { throw Object.assign(Error('Red de prueba'), { code: 'unavailable' }); }, pull: team => T.backend.pull(team) },
      { intervalMs: 1000000, onStatus: status => T.statuses.push(status) });
    await failure.start(); failure.stop();
  });
  let pending = await a.evaluate(() => T.s.listPending());
  assert.equal(pending.length, 1); assert.equal(pending[0].attempts, 1); assert(pending[0].nextAttempt > Date.now());
  assert.equal(await a.evaluate(() => T.statuses.at(-1)), 'Error de sincronización');
  await a.evaluate(async () => { await T.setup('owner', 'team-b'); await T.s.retryOperations(); });
  result = await flush(a); assert.equal(result.queue.length, 0);
  pass('Error de red conserva outbox y programa reintento; recuperación posterior confirmada');

  await a.evaluate(async () => {
    await T.shot('retry', 'conflict-id');
    const op = (await T.s.listPending())[0]; await T.backend.send(op);
    try { await T.backend.send({ ...op, payload: { ...op.payload, resultado: 'anotado' } }); throw Error('Conflicto aceptado'); }
    catch (error) { if (error.code !== 'SYNC_CONFLICT') throw error; }
  });
  await flush(a);
  assert.equal((await a.evaluate(() => T.p.readState())).events[0].resultado, 'fallado');
  pass('Mismo ID con contenido diferente: conflicto explícito sin sobrescribir');

  await a.evaluate(async () => {
    await T.shot('retry'); T.engine.stop();
    const { createSyncEngine } = await import('../js/sync-engine.js');
    T.delayedStatuses = [];
    const delayed = createSyncEngine({ send: async op => {
      await new Promise(ok => { T.releaseSend = ok; }); return T.backend.send(op);
    }, pull: team => T.backend.pull(team) }, { intervalMs: 1000000, onStatus: status => T.delayedStatuses.push(status) });
    T.delayed = delayed; T.delayedRun = delayed.start();
  });
  await a.waitForFunction(() => window.T.releaseSend);
  assert.equal(await a.evaluate(() => T.delayedStatuses.includes('Sincronizado')), false);
  await a.evaluate(async () => { await T.shot('retry'); T.delayed.wake(); T.releaseSend(); await T.delayedRun; T.delayed.stop(); });
  assert.equal(await a.evaluate(() => T.delayedStatuses.at(-1)), 'Pendiente de sincronizar');
  assert.equal(await a.evaluate(async () => (await T.s.listPending()).length), 1);
  await a.evaluate(() => T.setup('owner', 'team-b')); await flush(a);
  pass('Nunca Sincronizado antes del acuse; nueva mutación durante envío conserva estado pendiente');

  // Las cachés y outbox de emulador nunca se reutilizan en otro proyecto.
  await a.evaluate(async () => { await T.s.cacheTeams('owner', [{ id: 'team-b', name: 'Equipo demo' }]); await T.shot('retry'); });
  const otherProject = await ac.newPage();
  await otherProject.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript',
    body: 'export const syncSettings={enabled:true,emulator:false,allowRealWrites:false};' }));
  await otherProject.goto('http://127.0.0.1:4198/tests/sync-fixture.html'); await otherProject.waitForFunction(() => window.T);
  await otherProject.evaluate(() => T.setup('owner', 'team-b'));
  assert.equal((await otherProject.evaluate(() => T.p.readState())).games.length, 0);
  assert.equal(await otherProject.evaluate(async () => (await T.s.listPending()).length), 0);
  assert.equal(await otherProject.evaluate(async () => (await T.s.cachedTeams('owner')).length), 0);
  assert(await otherProject.evaluate(async () => {
    const { loadFirestoreTransport } = await import('../js/firestore-sync.js');
    try { await loadFirestoreTransport('owner'); return false; } catch (error) { return error.message.includes('autorización'); }
  }));
  await otherProject.close(); await flush(a);
  pass('Aislamiento por proyecto y segunda barrera real: sin reutilizar cola, equipos ni caché del emulador');

  await a.evaluate(() => T.engine.stop());
  await b.evaluate(async () => {
    await T.setup('owner', 'team-b');
    await T.p.createGameAndSelect({ id: 'late-remote', jornada: 'L', rival: 'Ficticio', createdAt: '2026-10-15' });
  }); await flush(b);
  await a.evaluate(async () => {
    T.engine.stop(); const { createSyncEngine } = await import('../js/sync-engine.js');
    T.lateEngine = createSyncEngine({ send: op => T.backend.send(op), pull: async team => {
      const remote = await T.backend.pull(team); await new Promise(ok => { T.releasePull = ok; }); return remote;
    } }, { intervalMs: 1000000 });
    T.lateRun = T.lateEngine.start();
  });
  await a.waitForFunction(() => window.T.releasePull);
  await a.evaluate(async () => { T.s.setStorageIdentity('outsider'); T.releasePull(); await T.lateRun; T.lateEngine.stop(); });
  assert.equal((await a.evaluate(() => T.p.readState())).games.length, 0);
  await a.evaluate(() => T.setup('owner', 'team-b'));
  assert(!(await a.evaluate(() => T.p.readState())).games.some(game => game.id === 'late-remote'));
  pass('Respuesta remota tardía tras cambio de cuenta descartada antes de materializar datos');

  // Fase 10 · Vaciar partido con cuenta: lápidas por tiro, idempotentes, sin reaparecer desde otro dispositivo ni desde la cola.
  const { page: v1, context: vc1 } = await device('owner', 'team-v');
  await v1.evaluate(() => T.backend.createTeam('Equipo ficticio vaciar', 'team-v'));
  const { page: v2, context: vc2 } = await device('owner', 'team-v');
  const vg = await v1.evaluate(async () => {
    const game = { id: crypto.randomUUID(), jornada: 'V10', rival: 'Ficticio vaciar', createdAt: '2026-10-17T12:00:00Z' };
    await T.p.createGameAndSelect(game); for (let i = 0; i < 3; i++) await T.shot(game.id); return game.id;
  });
  await flush(v1); await flush(v2); await v2.evaluate(gid => T.p.selectGameState(gid), vg);
  assert.equal((await v2.evaluate(() => T.p.readState())).events.length, 3);
  const cleared = (await v1.evaluate(() => T.p.readState())).events.map(event => event.id);
  // v2 registra sin conexión un tiro que v1 no ha visto; v1 vacía lo que ve (3 tiros).
  await vc2.setOffline(true);
  await v2.evaluate(gid => T.shot(gid, 'v10-pendiente'), vg);
  const vaciado = await v1.evaluate(async ([gid, ids]) => {
    let refused = false;
    try { await T.p.clearGameEvents(gid, ids.slice(1)); } catch (error) { refused = error.code === 'GAME_CHANGED'; }
    const state = await T.p.clearGameEvents(gid, ids);
    return { refused, events: state.events.length, games: state.games.length, queue: (await T.s.listPending()).filter(op => op.type === 'undo').length };
  }, [vg, cleared]);
  assert.deepEqual(vaciado, { refused: true, events: 0, games: 1, queue: 3 });
  result = await flush(v1); assert.equal(result.queue.length, 0); assert.equal(result.state.events.length, 0);
  await v1.evaluate(async () => { for (const op of await T.s.listPending()) await T.backend.send(op); }); // Reenvío idempotente.
  await vc2.setOffline(false);
  await v2.evaluate(() => T.engine.stop());
  await v2.reload(); await v2.waitForFunction(() => window.T); await v2.evaluate(() => T.setup('owner', 'team-v'));
  await flush(v2); await flush(v1); await flush(v2);
  for (const pageItem of [v1, v2]) {
    await eventsIn(pageItem, 1);
    const state = await pageItem.evaluate(() => T.p.readState());
    assert.deepEqual(state.events.map(event => event.id), ['v10-pendiente']);
    assert(state.games.some(game => game.id === vg && game.rival === 'Ficticio vaciar'));
  }
  pass('Vaciar partido sincronizado: atómico, solo lo confirmado, partido conservado, lápidas idempotentes y sin reaparecer en otro dispositivo');
  // El mismo dispositivo vacía sin conexión un tiro que aún estaba en cola: nunca llega al servidor.
  // Detener antes del lote garantiza que se prueba cola, no un envío ya en vuelo.
  await v2.evaluate(() => T.engine.stop());
  await vc2.setOffline(true);
  await v2.evaluate(async gid => {
    await T.shot(gid, 'v10-en-cola');
    const state = await T.p.readState(); await T.p.clearGameEvents(gid, state.events.map(event => event.id));
  }, vg);
  await vc2.setOffline(false);
  await v2.evaluate(() => T.engine.stop());
  await v2.reload(); await v2.waitForFunction(() => window.T); await v2.evaluate(() => T.setup('owner', 'team-v'));
  result = await flush(v2); assert.equal(result.queue.length, 0); assert.equal(result.state.events.length, 0);
  await flush(v1); await eventsIn(v1, 0); assert.equal((await v1.evaluate(() => T.p.readState())).events.length, 0);
  const remoteEvents = await v1.evaluate(async gid => (await T.sdk.getDocsFromServer(T.sdk.collection(T.db, 'teams', 'team-v', 'games', gid, 'events'))).docs.map(doc => doc.id), vg);
  assert(remoteEvents.length === 4 && !remoteEvents.includes('v10-en-cola'), 'El tiro vaciado en cola no debe crearse en el servidor: ' + remoteEvents);
  pass('Vaciar con tiros en cola, sin conexión y recarga: la lápida sale primero y el tiro nunca se crea');

  // Fase 10 · Cerrar sesión borra de este dispositivo los datos de la cuenta y solo los de esa cuenta.
  const { page: d } = await device(null, null);
  const purge = await d.evaluate(async () => {
    const make = (id, rival) => ({ id, jornada: 'P10', rival, createdAt: '2026-10-17T13:00:00Z' });
    await T.p.createGameAndSelect(make('dispositivo', 'Sin cuenta')); await T.shot('dispositivo');
    await T.setup('other', null); await T.p.createGameAndSelect(make('otra-cuenta', 'Otra cuenta'));
    await T.setup('owner', 'team-v'); await T.flush();
    await T.setup('owner', null); await T.p.createGameAndSelect(make('solo-aqui', 'Cuenta sin subir')); await T.shot('solo-aqui');
    await T.setup('owner', 'team-v');
    const gid = (await T.p.readState()).games[0].id; await T.p.selectGameState(gid); await T.shot(gid, 'p10-sin-subir');
    const before = await T.s.accountUnsynced('owner');
    const other = await T.s.accountUnsynced('other');
    const removed = await T.s.purgeAccountData('owner'); await T.s.purgeAccountData('owner');
    const rows = await T.p.transact(['cloudGames', 'cloudEvents', 'syncQueue', 'syncMeta'], 'readonly', (tx, done) => {
      const out = {}; let n = 0;
      for (const name of ['cloudGames', 'cloudEvents', 'syncQueue', 'syncMeta']) {
        const r = tx.objectStore(name).getAll(); r.onsuccess = () => { out[name] = r.result; if (++n === 4) done(out); };
      }
    });
    const owned = JSON.stringify(['demo-defensas', 'owner']).slice(0, -1);
    const leftovers = [...rows.cloudGames, ...rows.cloudEvents, ...rows.syncQueue].filter(row => String(row.scope).startsWith(owned)).length +
      rows.syncMeta.filter(row => row.key.includes('"owner"') && !/^(legacy-owner|preferred-team):/.test(row.key)).length;
    const games = await T.p.transact(['games'], 'readonly', (tx, done) => { const r = tx.objectStore('games').getAllKeys(); r.onsuccess = () => done(r.result.sort()); });
    await T.setup(null, null); const local = (await T.p.readState()).games.map(game => game.id);
    await T.setup('other', null); const otherView = (await T.p.readState()).games.map(game => game.id).sort();
    await T.setup('owner', 'team-v'); const afterPurge = (await T.p.readState()).games.length;
    await T.flush(); const restored = await T.p.readState();
    return { before, other, removed, leftovers, games, local, otherView, afterPurge, restoredGames: restored.games.length };
  });
  assert.deepEqual(purge.before, { pending: 1, blocked: 0, localOnly: 1 });
  assert.deepEqual(purge.other, { pending: 0, blocked: 0, localOnly: 1 });
  assert.equal(purge.removed.localGames, 1); assert.equal(purge.leftovers, 0);
  assert.deepEqual(purge.games, ['dispositivo', 'otra-cuenta']);
  assert.deepEqual(purge.local, ['dispositivo']); assert.deepEqual(purge.otherView, ['dispositivo', 'otra-cuenta']);
  assert.equal(purge.afterPurge, 0); assert(purge.restoredGames >= 1, 'Lo subido se recupera desde la nube al volver a entrar');
  pass('Cerrar sesión: recuento de lo no subido, borrado idempotente solo de esa cuenta; sin cuenta y otra cuenta intactos; lo subido vuelve al entrar');

  // Fase 11: temporada completa ficticia y escucha real del SDK en Emulator.
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    let batch = writeBatch(db);
    batch.set(doc(db, 'teams/season'), { schemaVersion: 1, ownerUid: 'season-owner', name: 'Temporada ficticia', createdAt: serverTimestamp() });
    batch.set(doc(db, 'teams/season/members/season-owner'), { schemaVersion: 1, uid: 'season-owner', role: 'owner', status: 'active', createdAt: serverTimestamp() });
    await batch.commit();
    for (let i = 0; i < 30; i++) {
      batch = writeBatch(db);
      const gameId = 'season-' + i;
      const envelope = payload => ({ schemaVersion: 1, createdBy: 'season-owner', createdAt: serverTimestamp(), sourceId: 'ficticio', payload });
      batch.set(doc(db, `teams/season/games/${gameId}`), { ...envelope({ id: gameId, jornada: String(i + 1), rival: 'Ficticio', createdAt: '2026-10-20' }), deletedAt: null, deletedBy: null });
      for (let j = 0; j < 70; j++) batch.set(doc(db, `teams/season/games/${gameId}/events/e${j}`), envelope({
        id: 'e' + j, gameId, categoria: 'Transición', accion: 'Bajo aro', valor_tiro: 2, resultado: 'fallado', fecha_hora: '2026-10-20T12:00:00Z' }));
      await batch.commit();
    }
  });
  const { page: season } = await device('season-owner', 'season');
  await flush(season); await gamesIn(season, 30);
  await season.evaluate(() => T.p.selectGameState('season-0')); await eventsIn(season, 70);
  const firstMetrics = await season.evaluate(() => ({ ...T.metrics }));
  assert.equal(firstMetrics.attached, 62); assert.equal(firstMetrics.gets, 0);
  for (let cycle = 0; cycle < 12; cycle++) await flush(season);
  assert.deepEqual(await season.evaluate(() => T.metrics), firstMetrics, 'Inactivo no debe consultar ni reabrir escuchas');
  const { page: seasonPeer } = await device('season-owner', 'season');
  await flush(seasonPeer);
  await seasonPeer.evaluate(() => T.p.selectGameState('season-0'));
  await seasonPeer.evaluate(() => T.shot('season-0', 'tiro-nuevo-season'));
  await flush(seasonPeer); await eventsIn(season, 71);
  assert.equal(await season.evaluate(() => T.metrics.attached), 62);
  assert.equal(await season.evaluate(() => T.metrics.gets), 0);
  await season.evaluate(() => T.engine.stop());
  assert.equal(await season.evaluate(() => T.metrics.detached), 62);
  pass('Temporada 30×70: lectura inicial por escuchas, 12 ciclos sin reconsultas, tiro remoto recibido y 62 escuchas cerradas');

  // Liberar navegadores/canales de los grupos concluidos antes de la siguiente
  // matriz; no reutilizamos datos ni contextos entre estas matrices.
  for (const context of contexts.splice(0)) await context.close();
  const { verifyBlockedQueue } = await import('./blocked13.test.mjs');
  await verifyBlockedQueue({ device, flush, pass });
  for (const context of contexts.splice(0)) await context.close();
  const { verifyPanels } = await import('./panels14.test.mjs');
  await verifyPanels({ device, flush, pass });
  for (const context of contexts.splice(0)) await context.close();

  const { verifySyncUI } = await import('./sync-ui.test.mjs');
  await verifySyncUI(browser); pass('Interfaz completa: inicio de sesión, pregunta única, dos dispositivos, vaciar, sin conexión con aviso, cerrar sesión esperando o saliendo, cambio de cuenta');

  assert.deepEqual(forbidden, []);
  const dir = new URL('../../.test-artifacts/firebase/', import.meta.url); await mkdir(dir, { recursive: true });
  await writeFile(new URL('sync.json', dir), JSON.stringify({ ok: true, environment: 'demo-defensas Firestore Emulator', reports, blockedConnectivityProbes: blockedProbes.length, realWrites: 0 }, null, 2));
  console.log(`Sincronización: ${reports.length} grupos correctos, cero escrituras reales.`);
} finally { for (const c of contexts) await c.close(); await browser?.close(); await new Promise(ok => server.close(ok)); await env.cleanup(); }
