// Escuchas de servidor en memoria. IndexedDB sigue siendo la única copia duradera.
// Se reciben partidos antiguos sin panel y snapshots de panel de la Fase 14.
export function watchFirestoreTeam(sdk, database, teamId, guard, onChange) {
  const rows = new Map(), waiters = new Set();
  let stopped = false, failure, rootReady = false, rootOff, configReady = false, configOff, configPanel = null, configDirty = false;
  const unavailable = () => Object.assign(Error('Sin conexión con el servidor.'), { code: 'unavailable' });
  const confirmed = snapshot => !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites;
  const ready = () => configReady && rootReady && [...rows.values()].every(row => row.deleted || (row.eventsReady && row.tombsReady));
  function settle() {
    if (!failure && !ready()) return;
    for (const finish of [...waiters]) finish();
  }
  function fail(error) { if (stopped) return; failure = error; settle(); onChange(); }
  function guarded(callback) {
    return snapshot => {
      if (stopped) return;
      try { guard(); callback(snapshot); settle(); onChange(); } catch (error) { fail(error); }
    };
  }
  function closeRow(row) { row.eventsOff?.(); row.tombsOff?.(); }
  function watchRow(doc) {
    const row = { id: doc.id, data: doc.data(), events: [], tombs: [], eventsReady: false, tombsReady: false, dirty: true };
    rows.set(doc.id, row);
    if (row.data.deletedAt != null) { row.deleted = true; return; }
    // Antes de publicar eventos iniciales deben estar confirmadas también sus lápidas.
    row.tombsOff = sdk.onSnapshot(sdk.collection(doc.ref, 'eventDeletions'), { includeMetadataChanges: true }, guarded(snapshot => {
      row.tombsReady = confirmed(snapshot);
      if (!row.tombsReady) return;
      row.tombs = snapshot.docs.map(item => item.id); row.dirty = true;
    }), fail);
    row.eventsOff = sdk.onSnapshot(sdk.collection(doc.ref, 'events'), { includeMetadataChanges: true }, guarded(snapshot => {
      row.eventsReady = confirmed(snapshot);
      if (!row.eventsReady) return;
      row.events = snapshot.docs.slice().sort((a, b) => (a.data().createdAt?.toMillis() || 0) -
        (b.data().createdAt?.toMillis() || 0) || a.id.localeCompare(b.id)).map(item => ({ id: item.id, ...item.data() }));
      row.dirty = true;
    }), async error => {
      // Las reglas retiran el permiso de eventos al borrar el padre. Puede llegar
      // antes que su snapshot: comprobar la lápida, sin convertirla en un fallo.
      if (stopped || row.deleted) return;
      try {
        guard();
        if (error.code !== 'permission-denied') throw error;
        const parent = await sdk.getDocFromServer(doc.ref);
        if (stopped) return;
        guard();
        if (!parent.exists() || parent.data().deletedAt == null) throw error;
        row.data = parent.data(); row.deleted = true; row.dirty = true; closeRow(row); settle(); onChange();
      } catch (cause) { fail(cause); }
    });
  }
  rootOff = sdk.onSnapshot(sdk.collection(database, 'teams', teamId, 'games'), { includeMetadataChanges: true }, guarded(snapshot => {
    rootReady = confirmed(snapshot);
    if (!rootReady) return;
    for (const doc of snapshot.docs) {
      const row = rows.get(doc.id);
      if (!row) watchRow(doc);
      else if (doc.data().deletedAt != null && !row.deleted) {
        row.data = doc.data(); row.deleted = true; row.dirty = true; closeRow(row);
      } else if (!row.deleted) {
        if (JSON.stringify(row.data.panel) !== JSON.stringify(doc.data().panel)) row.dirty = true;
        row.data = doc.data();
      }
    }
  }), fail);
  configOff = sdk.onSnapshot(sdk.collection(database, 'teams', teamId, 'configuration'), { includeMetadataChanges: true }, guarded(snapshot => {
    configReady = confirmed(snapshot);
    if (!configReady) return;
    const panel = snapshot.docs.find(doc => doc.id === 'current')?.data().payload ?? null;
    if (JSON.stringify(panel) !== JSON.stringify(configPanel)) { configPanel = panel; configDirty = true; }
  }), fail);
  return {
    async read() {
      guard();
      if (stopped) throw Object.assign(Error('Escucha detenida.'), { code: 'SCOPE_CHANGED' });
      if (globalThis.navigator?.onLine === false) throw unavailable();
      if (failure) throw failure;
      if (!ready()) await new Promise((resolve, reject) => {
        const finish = () => { clearTimeout(timer); waiters.delete(finish); failure ? reject(failure) : resolve(); };
        const timer = setTimeout(() => { waiters.delete(finish); reject(unavailable()); }, 12000);
        waiters.add(finish);
      });
      guard();
      const result = [];
      if (configDirty && configPanel) result.push({ kind: 'configuration', id: '@configuration', panel: configPanel });
      configDirty = false;
      for (const row of rows.values()) {
        if (!row.dirty) continue;
        result.push({ id: row.id, ...row.data, deleted: Boolean(row.deleted), tombs: row.tombs, events: row.events });
        row.dirty = false;
      }
      return result;
    },
    stop() {
      if (stopped) return;
      failure = Object.assign(Error('Escucha detenida.'), { code: 'SCOPE_CHANGED' });
      stopped = true; rootOff?.(); configOff?.(); for (const row of rows.values()) closeRow(row);
      settle(); rows.clear();
    }
  };
}
