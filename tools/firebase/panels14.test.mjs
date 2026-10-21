import assert from 'node:assert/strict';

export async function verifyPanels({ device, flush, pass }) {
  if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085') throw Error('Solo emulador ficticio.');
  async function until(page, predicate) {
    const deadline = Date.now() + 25000;
    while (!await page.evaluate(predicate)) {
      assert(Date.now() < deadline, 'No llega el panel esperado'); await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  async function initialize(page) {
    return page.evaluate(async () => {
      T.cfg = await import('../js/configuracion-guardada.js'); T.pm = await import('../js/panel-model.js');
      const source = await (await import('../js/configuracion.js')).loadConfigurationSource();
      T.csv14 = { csvText: source.text, csvConfiguration: source.configuration };
      T.load14 = () => T.cfg.loadButtonConfiguration(T.csv14);
      T.panel14 = async gid => {
        const loaded = await T.load14(), usage = await T.cfg.readGameUsage();
        return T.cfg.versionForGame(loaded.record, usage, gid, (await T.p.readExportSnapshot(gid)).events.length > 0);
      };
      return T.load14();
    });
  }
  const { page: a } = await device('owner-14', 'team-14');
  await a.evaluate(() => T.backend.createTeam('Paneles ficticios 14', 'team-14'));
  await initialize(a);
  const edited = await a.evaluate(async () => {
    const initial = await T.load14();
    await T.p.createGameAndSelect({ id: 'panel-game-14', jornada: '14', rival: 'Panel ficticio', createdAt: '2026-10-20' }, T.pm.panelSnapshot(initial.record));
    const doc = structuredClone(initial.version.doc);
    doc.categories[0].items[0].name = 'Salida catorce';
    doc.categories[0].items.push({ id: 'transicion_nueva14', name: 'Nueva catorce', shots: [2], retired: false });
    const result = await T.cfg.saveButtonConfiguration(doc, initial.record.revision, { gameId: 'panel-game-14', baseVersionId: initial.version.id });
    return result.version;
  });
  let result = await flush(a); assert.equal(result.queue.length, 0, JSON.stringify(result.queue));
  const { page: b } = await device('owner-14', 'team-14'); await initialize(b); await flush(b);
  await b.evaluate(() => T.p.selectGameState('panel-game-14'));
  assert.deepEqual(await b.evaluate(() => T.panel14('panel-game-14')), edited);
  assert.equal(await b.evaluate(async () => (await T.load14()).version.id), edited.id);
  pass('M6: panel editado, IDs nuevos y plantilla del equipo llegan a un segundo dispositivo');

  await b.evaluate(async () => {
    const loaded = await T.load14();
    await T.p.createGameAndSelect({ id: 'panel-next-14', jornada: '15', rival: 'Plantilla compartida', createdAt: '2026-10-20' }, T.pm.panelSnapshot(loaded.record));
  }); await flush(b);
  await until(a, async () => (await T.p.readState()).games.some(game => game.id === 'panel-next-14'));
  assert.equal((await a.evaluate(() => T.panel14('panel-next-14'))).id, edited.id);
  await a.evaluate(() => T.engine.stop()); await a.reload(); await a.waitForFunction(() => window.T);
  await a.evaluate(() => T.setup('owner-14', 'team-14')); await initialize(a); await flush(a);
  assert.equal((await a.evaluate(() => T.panel14('panel-game-14'))).id, edited.id);
  pass('M6: partidos nuevos usan la plantilla recibida y la configuración sobrevive a recargar');

  await b.evaluate(() => T.engine.stop());
  await a.evaluate(async () => {
    const version = await T.panel14('panel-game-14'), loaded = await T.load14();
    await T.p.addEvent({ id: 'shot-custom-14', gameId: 'panel-game-14', categoria: 'Transición', categoria_id: 'transicion',
      accion: 'Nueva catorce', accion_id: 'transicion_nueva14', valor_tiro: 2, resultado: 'fallado', fecha_hora: '2026-10-20T12:00:00Z', tiros_permitidos: [2] }, [2], { version, usedIds: loaded.record.usedIds });
  }); await flush(a);
  const rejected = await a.evaluate(async () => {
    const loaded = await T.load14(), doc = structuredClone(loaded.version.doc); doc.categories[0].items[0].name = 'Cambio prohibido';
    try { await T.cfg.saveButtonConfiguration(doc, loaded.record.revision, { gameId: 'panel-game-14' }); return false; }
    catch (error) { return error.code === 'HAS_EVENTS'; }
  }); assert(rejected);
  // B aún no ha recibido el tiro: la escritura remota también debe protegerlo.
  await b.evaluate(async () => {
    const loaded = await T.load14(), doc = structuredClone((await T.panel14('panel-game-14')).doc);
    doc.categories[0].items[0].name = 'Edición atrasada';
    await T.cfg.saveButtonConfiguration(doc, loaded.record.revision, { gameId: 'panel-game-14', baseVersionId: (await T.panel14('panel-game-14')).id });
    await T.setup('owner-14', 'team-14');
  }); result = await flush(b);
  assert(result.queue.some(op => op.type === 'panel' && op.blocked));
  await until(b, async () => (await T.p.readExportSnapshot('panel-game-14')).events.length === 1);
  assert.equal((await b.evaluate(() => T.panel14('panel-game-14'))).id, edited.id, 'La edición atrasada se conserva en cola, el histórico usa su panel real');
  const event = (await b.evaluate(() => T.p.readExportSnapshot('panel-game-14'))).events[0];
  assert.equal(event.accion, 'Nueva catorce'); assert.equal(event.id, 'shot-custom-14');
  pass('M6: tiros congelan su panel local y remotamente; edición atrasada queda pendiente sin reescribir panel ni tiros');

  await a.evaluate(async () => {
    await T.p.selectGameState('panel-game-14'); const s = await T.p.readState();
    await T.p.clearGameEvents('panel-game-14', s.events.map(event => event.id));
  }); await flush(a);
  await until(b, async () => (await T.p.readExportSnapshot('panel-game-14')).events.length === 0);
  await b.evaluate(() => T.engine.retry());
  await until(b, async () => !(await T.s.listPending()).some(op => op.type === 'panel'));
  await until(a, async () => (await T.panel14('panel-game-14')).doc.categories[0].items[0].name === 'Edición atrasada');
  const clearedRemote = await a.evaluate(async () => (await T.sdk.getDocsFromServer(T.sdk.collection(T.db, 'teams', 'team-14', 'games', 'panel-game-14', 'events'))).docs.map(doc => doc.data().payload));
  assert.equal(clearedRemote[0].id, 'shot-custom-14'); assert.equal(clearedRemote[0].accion, 'Nueva catorce');
  pass('M6: vaciar permite editar otra vez; versiones anteriores y eventos con lápida se conservan');

  // Pérdida de caché por cierre autorizado: solo datos ficticios de esta cuenta.
  await a.evaluate(async () => { await T.engine.stop(); await T.s.purgeAccountData('owner-14'); });
  await a.reload(); await a.waitForFunction(() => window.T); await a.evaluate(() => T.setup('owner-14', 'team-14'));
  await initialize(a); await flush(a);
  assert.equal((await a.evaluate(() => T.panel14('panel-game-14'))).doc.categories[0].items[0].name, 'Edición atrasada');
  await a.evaluate(() => T.setup('other-14', null)); await initialize(a);
  assert.notEqual(await a.evaluate(async () => (await T.load14()).version.doc.categories[0].items[0].name), 'Edición atrasada');
  await a.evaluate(() => T.setup('owner-14', 'team-14-other')); await a.evaluate(() => T.backend.createTeam('Otro equipo ficticio', 'team-14-other')); await initialize(a);
  assert.notEqual(await a.evaluate(async () => (await T.load14()).version.doc.categories[0].items[0].name), 'Edición atrasada');
  pass('M6: recuperación desde nube tras purgar la cuenta; otra cuenta y otro equipo no heredan su panel');

  const { page: offline, context: oc } = await device('offline-14', 'offline-team-14');
  await offline.evaluate(() => T.backend.createTeam('Offline ficticio', 'offline-team-14')); await initialize(offline);
  await offline.evaluate(async () => {
    const loaded = await T.load14();
    await T.p.createGameAndSelect({ id: 'offline-game-14', jornada: '14', rival: 'Sin conexión', createdAt: '2026-10-20' }, T.pm.panelSnapshot(loaded.record));
  }); await flush(offline); await offline.evaluate(() => T.engine.stop());
  const before = await offline.evaluate(async () => ({ loaded: await T.load14(), usage: await T.cfg.readGameUsage(), queue: await T.s.listPending(), state: await T.p.readState() }));
  assert(await offline.evaluate(async () => {
    const loaded = await T.load14(), doc = structuredClone(loaded.version.doc); doc.categories[0].items[0].name = 'No debe guardarse';
    const original = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function(value, ...args) {
      if (this.name === 'syncQueue') { this.transaction.abort(); return {}; }
      return original.call(this, value, ...args);
    };
    try { await T.cfg.saveButtonConfiguration(doc, loaded.record.revision, { gameId: 'offline-game-14', baseVersionId: loaded.version.id }); return false; }
    catch { return true; } finally { IDBObjectStore.prototype.add = original; }
  }));
  assert.deepEqual(await offline.evaluate(async () => ({ loaded: await T.load14(), usage: await T.cfg.readGameUsage(), queue: await T.s.listPending(), state: await T.p.readState() })), before);
  pass('M6: fallo al crear outbox revierte panel, versión, asociación y partido en una sola transacción');

  await oc.setOffline(true);
  const offlineVersion = await offline.evaluate(async () => {
    const loaded = await T.load14(), doc = structuredClone(loaded.version.doc); doc.categories[0].items[0].name = 'Panel sin conexión';
    const saved = await T.cfg.saveButtonConfiguration(doc, loaded.record.revision, { gameId: 'offline-game-14', baseVersionId: loaded.version.id });
    await T.p.addEvent({ id: 'offline-shot-14', gameId: 'offline-game-14', categoria: 'Transición', categoria_id: 'transicion',
      accion: 'Panel sin conexión', accion_id: doc.categories[0].items[0].id, valor_tiro: 2, resultado: 'anotado', fecha_hora: '2026-10-20T13:00:00Z', tiros_permitidos: [2] }, [2], T.pm.panelSnapshot(saved.record));
    return saved.version.id;
  });
  assert.equal(await offline.evaluate(async () => (await T.s.listPending()).length), 3);
  await oc.setOffline(false); await offline.reload(); await offline.waitForFunction(() => window.T);
  await offline.evaluate(() => T.setup('offline-14', 'offline-team-14')); await initialize(offline);
  assert.equal((await offline.evaluate(() => T.panel14('offline-game-14'))).id, offlineVersion);
  assert.equal(await offline.evaluate(async () => (await T.s.listPending()).length), 3);
  assert.equal((await flush(offline)).queue.length, 0);
  const { page: receiver } = await device('offline-14', 'offline-team-14'); await initialize(receiver); await flush(receiver);
  assert.equal((await receiver.evaluate(() => T.panel14('offline-game-14'))).id, offlineVersion);
  assert.equal((await receiver.evaluate(() => T.p.readExportSnapshot('offline-game-14'))).events[0].accion, 'Panel sin conexión');
  pass('M6: edición y tiro offline sobreviven a recarga; plantilla y panel suben antes del tiro y llegan juntos a otro dispositivo');

  // Ediciones simultáneas: la plantilla usa comparación con su versión base;
  // cada partido distinto puede conservar y subir su propio panel.
  for (const [page, gid] of [[offline, 'race-a-14'], [receiver, 'race-b-14']]) {
    await page.evaluate(async gid => {
      const loaded = await T.load14();
      await T.p.createGameAndSelect({ id: gid, jornada: '14', rival: 'Edición simultánea', createdAt: '2026-10-20' }, T.pm.panelSnapshot(loaded.record));
    }, gid); await flush(page);
  }
  await offline.evaluate(() => T.engine.stop()); await receiver.evaluate(() => T.engine.stop());
  const edits = await Promise.all([[offline, 'race-a-14', 'Plantilla A'], [receiver, 'race-b-14', 'Plantilla B']].map(async ([page, gid, name]) =>
    page.evaluate(async ({ gid, name }) => {
      const loaded = await T.load14(), doc = structuredClone(loaded.version.doc); doc.categories[0].items[0].name = name;
      return (await T.cfg.saveButtonConfiguration(doc, loaded.record.revision, { gameId: gid, baseVersionId: loaded.version.id })).version.id;
    }, { gid, name })));
  await offline.evaluate(() => T.setup('offline-14', 'offline-team-14'));
  await receiver.evaluate(() => T.setup('offline-14', 'offline-team-14'));
  assert.equal((await flush(offline)).queue.length, 0);
  const race = await flush(receiver);
  assert.equal(race.queue.length, 1); assert.equal(race.queue[0].type, 'default-panel'); assert(race.queue[0].blocked);
  assert.equal(await receiver.evaluate(async () => (await T.load14()).version.id), edits[1]);
  assert.equal(await receiver.evaluate(async () => (await T.sdk.getDocFromServer(T.sdk.doc(T.db, 'teams', 'offline-team-14', 'configuration', 'current'))).data().payload.version.id), edits[0]);
  await until(offline, async () => (await T.p.readState()).games.some(game => game.id === 'race-b-14'));
  assert.equal((await offline.evaluate(() => T.panel14('race-b-14'))).id, edits[1]);
  pass('M6: plantillas simultáneas no se sobrescriben; conflicto retenido y panel del otro partido sincronizado');

  const { page: legacy } = await device('import-14', 'import-team-14');
  await legacy.evaluate(() => T.setup(null)); await initialize(legacy);
  const originalVersion = await legacy.evaluate(async () => {
    await T.p.createGameAndSelect({ id: 'local-panel-14', jornada: '14', rival: 'Original ficticio', createdAt: '2026-10-20' });
    const loaded = await T.load14(), doc = structuredClone(loaded.version.doc); doc.categories[0].items[0].name = 'Personalizado original';
    const saved = await T.cfg.saveButtonConfiguration(doc, loaded.record.revision, { gameId: 'local-panel-14', baseVersionId: loaded.version.id });
    await T.shot('local-panel-14', 'local-shot-14'); return saved.version.id;
  });
  const originalRows = page => page.evaluate(() => T.p.transact(['games', 'events', 'settings'], 'readonly', (tx, done) => {
    const result = {}; let n = 0;
    for (const store of ['games', 'events', 'settings']) {
      const request = tx.objectStore(store).getAll(); request.onsuccess = () => {
        result[store] = store === 'settings' ? request.result.filter(row => ['configuracionBotones', 'configuracionPorPartido'].includes(row.key)) : request.result;
        if (++n === 3) done(result);
      };
    }
  }));
  const originals = await originalRows(legacy);
  await legacy.evaluate(() => T.setup('import-14', 'import-team-14'));
  await legacy.evaluate(() => T.backend.createTeam('Importación ficticia', 'import-team-14'));
  const [imported] = await legacy.evaluate(async () => T.s.importLegacy(await T.s.listLegacyForImport(), T.s.storageContext(), true));
  await initialize(legacy); assert.equal((await flush(legacy)).queue.length, 0);
  assert.deepEqual(await originalRows(legacy), originals);
  const { page: importedDevice } = await device('import-14', 'import-team-14'); await initialize(importedDevice); await flush(importedDevice);
  assert.equal((await importedDevice.evaluate(gid => T.panel14(gid), imported)).id, originalVersion);
  assert.equal((await importedDevice.evaluate(gid => T.panel14(gid), imported)).doc.categories[0].items[0].name, 'Personalizado original');
  assert.equal((await importedDevice.evaluate(gid => T.p.readExportSnapshot(gid), imported)).events[0].id, 'local-shot-14');
  pass('M6: importación confirmada incluye el panel personalizado; originales y eventos históricos idénticos');

  // Simular la versión anterior: asociación global conocida y partido de nube
  // sin snapshot, como los que ya existían antes de esta fase.
  await legacy.evaluate(() => T.setup(null));
  await legacy.evaluate(async versionId => T.cfg.recordGameUsage('known-panel-14', versionId), originalVersion);
  const legacyBefore = await originalRows(legacy);
  await legacy.evaluate(() => T.setup('known-14', 'known-team-14'));
  await legacy.evaluate(async () => {
    await T.backend.createTeam('Asociación antigua', 'known-team-14');
    await T.p.createGameAndSelect({ id: 'known-panel-14', jornada: '14', rival: 'Panel conocido', createdAt: '2026-10-20' });
  }); await flush(legacy); await initialize(legacy);
  assert.equal((await legacy.evaluate(() => T.panel14('known-panel-14'))).id, originalVersion);
  assert.equal((await flush(legacy)).queue.length, 0); assert.deepEqual(await originalRows(legacy), legacyBefore);
  const { page: knownDevice } = await device('known-14', 'known-team-14'); await initialize(knownDevice); await flush(knownDevice);
  assert.equal((await knownDevice.evaluate(() => T.panel14('known-panel-14'))).id, originalVersion);
  pass('M6: asociación antigua verificada recuperada y subida sin modificar settings globales ni originales');
}
