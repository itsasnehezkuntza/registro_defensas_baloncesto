import assert from 'node:assert/strict';

// SDK oficial/IndexedDB reales; todo dentro de demo-defensas. El conflicto
// se provoca en Emulator; la denegación individual se inyecta sin cambiar Rules.
export async function verifyBlockedQueue({ device, flush, pass }) {
  if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085') throw Error('Solo Firestore Emulator ficticio.');
  async function until(page, predicate) {
    const deadline = Date.now() + 20000;
    while (!await page.evaluate(predicate)) {
      assert(Date.now() < deadline, 'No llega el cambio esperado con la cola bloqueada');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  const { page: a } = await device('owner-13', 'team-13');
  await a.evaluate(() => T.backend.createTeam('Ficticio bloqueo 13', 'team-13'));
  for (const id of ['conflict-13', 'healthy-13']) await a.evaluate(id => T.p.createGameAndSelect({ id, jornada: '13', rival: 'Ficticio', createdAt: '2026-10-20' }), id);
  await flush(a);
  const { page: b } = await device('owner-13', 'team-13'); await flush(b);
  await a.evaluate(async () => {
    await T.engine.stop(); await T.p.selectGameState('conflict-13');
    await T.shot('conflict-13', 'collision-13');
    const collision = (await T.s.listPending()).find(op => op.eventId === 'collision-13');
    // Mismo ID en remoto con otro contenido: el SDK debe detectar el conflicto.
    await T.backend.send({ ...collision, payload: { ...collision.payload, resultado: 'anotado' } });
    await T.shot('conflict-13', 'behind-13'); await T.shot('healthy-13', 'healthy-out-13');
    await T.p.transact(['syncQueue'], 'readwrite', (tx, done) => {
      for (const op of [collision]) tx.objectStore('syncQueue').put({ ...op, createdAt: 0 }); done();
    });
    await T.setup('owner-13', 'team-13');
  });
  const result = await flush(a);
  assert.equal(result.status, 'Error de sincronización'); assert.equal(result.queue.length, 2);
  const blocked = result.queue.find(op => op.eventId === 'collision-13');
  assert(blocked.blocked && blocked.error === 'SYNC_CONFLICT'); assert.equal(blocked.attempts, 1);
  assert.equal(result.state.events.find(event => event.id === 'collision-13').resultado, 'fallado');
  await flush(b); await b.evaluate(() => T.p.selectGameState('healthy-13'));
  await until(b, async () => (await T.p.readState()).events.some(event => event.id === 'healthy-out-13'));
  const server = await a.evaluate(async () => (await T.sdk.getDocsFromServer(T.sdk.collection(T.db, 'teams', 'team-13', 'games', 'conflict-13', 'events'))).docs.map(doc => ({ id: doc.id, result: doc.data().payload.resultado })));
  assert.deepEqual(server, [{ id: 'collision-13', result: 'anotado' }]);
  pass('M5: conflicto real aislado, local/remoto conservados; se envía otro partido y el tiro posterior del partido conflictivo espera');

  const metrics = await a.evaluate(() => ({ ...T.metrics }));
  await b.evaluate(() => T.shot('conflict-13', 'incoming-13')); await flush(b);
  // No wake/start/recarga de A: la escucha debe incorporar el cambio por sí sola.
  await until(a, async () => (await T.p.readState()).events.some(event => event.id === 'incoming-13'));
  assert.equal(await a.evaluate(() => T.statuses.at(-1)), 'Error de sincronización');
  const after = await a.evaluate(() => ({ metrics: T.metrics }));
  assert.equal(after.metrics.attached, metrics.attached); assert.equal(after.metrics.detached, metrics.detached);
  assert.equal(after.metrics.gets, metrics.gets, 'Recibir no reconsulta colecciones por el bloqueo');
  assert.equal(await a.evaluate(async () => (await T.s.listPending()).find(op => op.blocked).attempts), 1);
  pass('M5: recepción automática incluso en el partido conflictivo, aviso de bloqueo persistente y escuchas reutilizadas');

  await a.evaluate(() => T.engine.stop()); await a.reload(); await a.waitForFunction(() => window.T);
  await a.evaluate(() => T.setup('owner-13', 'team-13')); await flush(a);
  assert.equal(await a.evaluate(async () => (await T.s.listPending()).find(op => op.blocked).attempts), 1);
  await a.evaluate(() => T.engine.retry());
  await until(a, async () => (await T.s.listPending()).some(op => op.blocked && op.attempts === 2));
  assert.equal((await a.evaluate(() => T.p.readState())).events.find(event => event.id === 'collision-13').resultado, 'fallado');
  pass('M5: bloqueo duradero tras recarga; Reintentar no sobrescribe un conflicto ni lo marca sincronizado');

  await a.evaluate(async () => {
    await T.engine.stop();
    await T.p.createGameAndSelect({ id: 'parent-block-13', jornada: '13', rival: 'Padre ficticio', createdAt: '2026-10-20' });
    await T.shot('parent-block-13', 'child-13'); await T.shot('healthy-13', 'independent-13');
    const { createSyncEngine } = await import('../js/sync-engine.js');
    T.sent13 = []; T.status13 = []; T.reject13 = true;
    T.custom13 = createSyncEngine({ watch: (...args) => T.backend.watch(...args), send: async op => {
      T.sent13.push(op.gameId + ':' + op.type);
      if (op.gameId === 'parent-block-13' && T.reject13) throw Object.assign(Error('Denegación individual ficticia'), { code: 'permission-denied' });
      return T.backend.send(op);
    } }, { intervalMs: 1000000, onStatus: label => T.status13.push(label) });
    await T.custom13.start();
  });
  const withheld = await a.evaluate(async () => ({ sent: T.sent13, queue: await T.s.listPending(), status: T.status13.at(-1) }));
  assert(withheld.queue.some(op => op.gameId === 'parent-block-13' && op.type === 'game' && op.blocked));
  assert(withheld.queue.some(op => op.eventId === 'child-13' && op.attempts === 0));
  assert.deepEqual(withheld.sent.filter(item => item.startsWith('parent-block-13:')), ['parent-block-13:game']);
  assert(withheld.sent.includes('healthy-13:event')); assert.equal(withheld.status, 'Error de sincronización');
  await b.evaluate(() => T.shot('healthy-13', 'incoming-denied-13')); await flush(b);
  await until(a, async () => (await T.p.readExportSnapshot('healthy-13')).events.some(event => event.id === 'incoming-denied-13'));
  await a.evaluate(async () => { T.reject13 = false; await T.custom13.retry(); });
  await until(a, async () => !(await T.s.listPending()).some(op => op.gameId === 'parent-block-13'));
  await flush(b);
  await until(b, async () => (await T.p.readState()).games.some(game => game.id === 'parent-block-13'));
  await b.evaluate(() => T.p.selectGameState('parent-block-13'));
  assert.deepEqual((await b.evaluate(() => T.p.readState())).events.map(event => event.id), ['child-13']);
  await a.evaluate(() => T.custom13.stop());
  pass('M5: alta denegada retiene sus hijos, permite recepción y otros envíos; al reintentar sube padre→tiro una sola vez');

  // La espera de una lápida impide adelantar el alta del mismo tiro.
  await a.evaluate(async () => {
    await T.setup('owner-13', 'team-13'); await T.engine.stop();
    await T.p.selectGameState('parent-block-13'); await T.shot('parent-block-13', 'delayed-tomb-13');
    await T.p.removeLastGameEvent('parent-block-13');
    const undo = (await T.s.listPending()).find(op => op.type === 'undo' && op.eventId === 'delayed-tomb-13');
    await T.p.transact(['syncQueue'], 'readwrite', (tx, done) => {
      tx.objectStore('syncQueue').put({ ...undo, nextAttempt: Date.now() + 60000 }); done();
    });
    await T.setup('owner-13', 'team-13'); await T.flush();
  });
  const tombWait = await a.evaluate(async () => ({ queue: await T.s.listPending(), remote: (await T.sdk.getDocsFromServer(T.sdk.collection(T.db, 'teams', 'team-13', 'games', 'parent-block-13', 'events'))).docs.map(doc => doc.id) }));
  assert(!tombWait.remote.includes('delayed-tomb-13'));
  assert.equal(tombWait.queue.find(op => op.eventId === 'delayed-tomb-13' && op.type === 'event').attempts, 0);
  await a.evaluate(() => T.engine.retry());
  await until(a, async () => !(await T.s.listPending()).some(op => op.eventId === 'delayed-tomb-13'));
  const ids = await a.evaluate(async () => (await T.sdk.getDocsFromServer(T.sdk.collection(T.db, 'teams', 'team-13', 'games', 'parent-block-13', 'events'))).docs.map(doc => doc.id));
  assert(!ids.includes('delayed-tomb-13')); await a.evaluate(() => T.engine.stop());
  pass('M5: lápida en espera mantiene el alta detrás; reintento sin crear ni resucitar el tiro vaciado');

  await a.evaluate(async () => {
    await T.p.createGameAndSelect({ id: 'game-collision-13', jornada: '13', rival: 'Local conservado', createdAt: '2026-10-20' });
    await T.shot('game-collision-13', 'child-conflict-13');
    const op = (await T.s.listPending()).find(op => op.gameId === 'game-collision-13' && op.type === 'game');
    await T.backend.send({ ...op, payload: { ...op.payload, rival: 'Remoto conservado' } });
    await T.setup('owner-13', 'team-13'); await T.flush();
  });
  assert.equal((await a.evaluate(() => T.p.readState())).games.find(game => game.id === 'game-collision-13').rival, 'Local conservado');
  const serverGame = await a.evaluate(async () => (await T.sdk.getDocFromServer(T.sdk.doc(T.db, 'teams', 'team-13', 'games', 'game-collision-13'))).data().payload.rival);
  assert.equal(serverGame, 'Remoto conservado');
  assert(await a.evaluate(async () => (await T.s.listPending()).some(op => op.gameId === 'game-collision-13' && op.blocked)));
  await b.evaluate(() => T.shot('healthy-13', 'incoming-game-conflict-13')); await flush(b);
  await until(a, async () => (await T.p.readExportSnapshot('healthy-13')).events.some(event => event.id === 'incoming-game-conflict-13'));
  assert.equal(await a.evaluate(async () => (await T.s.listPending()).find(op => op.eventId === 'child-conflict-13').attempts), 0);
  await a.evaluate(() => T.engine.stop());
  pass('M5: conflicto real de partido conserva ambas cabeceras, retiene sus tiros y permite recibir otros partidos');
}
