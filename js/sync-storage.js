import { transact, hasSyncStorage } from './persistencia.js';
import { syncSettings } from './sync-config.js';
import { firebaseSettings } from './firebase-config.js';
import { panelKey, panelSnapshot, mergePanelRecord, validatePanel, PANEL_DEFAULT } from './panel-model.js';

export const SYNC_STORES = ['cloudGames', 'cloudEvents', 'cloudTombs', 'syncQueue', 'syncMeta', 'syncBindings', 'settings'];
export function upgradeSyncSchema(database) {
  const games = database.createObjectStore('cloudGames', { keyPath: 'key' }); games.createIndex('byScope', 'scope');
  const events = database.createObjectStore('cloudEvents', { keyPath: 'seq', autoIncrement: true });
  events.createIndex('byCloud', ['scope', 'gameId', 'eventId'], { unique: true });
  events.createIndex('byGame', ['scope', 'gameId']);
  const tombs = database.createObjectStore('cloudTombs', { keyPath: 'key' }); tombs.createIndex('byScope', 'scope');
  const queue = database.createObjectStore('syncQueue', { keyPath: 'key' }); queue.createIndex('byScope', 'scope');
  database.createObjectStore('syncMeta', { keyPath: 'key' });
  database.createObjectStore('syncBindings', { keyPath: 'key' });
}
const projectId = syncSettings.emulator ? 'demo-defensas' : firebaseSettings.config.projectId;
const accountKey = uid => JSON.stringify([projectId, uid]);
let identity = null, context = Object.freeze({ scope: null, uid: null, projectId, version: 0 });
export const storageContext = () => context;
export function setStorageIdentity(uid) {
  if (uid !== identity) { identity = uid; setStorageScope(null, true); }
}
export function setStorageScope(teamId, force = false) {
  if (teamId && !identity) throw Error('Inicia sesión antes de elegir equipo.');
  const scope = teamId ? JSON.stringify([projectId, identity, teamId]) : null;
  if (!force && context.scope === scope) return;
  context = Object.freeze({ uid: identity, teamId, projectId, scope, version: context.version + 1 });
  globalThis.dispatchEvent?.(new Event('defensas-scope-change'));
}
export function assertContext(c = context) {
  if (c !== context) throw Object.assign(Error('La cuenta o el equipo han cambiado.'), { code: 'SCOPE_CHANGED' });
}
const id = () => crypto.randomUUID();
export const canonical = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const ownerKey = gameId => 'legacy-owner:' + JSON.stringify(gameId);
export function claimLocalGame(tx, gameId) {
  if (hasSyncStorage() && identity) tx.objectStore('syncMeta').put({ key: ownerKey(gameId), uid: identity });
}
export function filterLegacyGames(tx, games, done) {
  if (!hasSyncStorage()) { done(games); return; }
  const uid = identity;
  const request = tx.objectStore('syncMeta').getAll();
  request.onsuccess = () => {
    const owners = new Map(request.result.map(row => [row.key, row]));
    done(games.filter(game => {
      const owner = owners.get(ownerKey(game.id));
      return !owner || (!owner.imported && owner.uid === uid);
    }));
  };
}
export function guardLegacyGame(tx, gameId, abort, done) {
  if (!hasSyncStorage()) { done(); return; }
  const request = tx.objectStore('syncMeta').get(ownerKey(gameId));
  request.onsuccess = () => {
    if (request.result && request.result.uid !== identity) { abort('Este partido pertenece a otra cuenta.', 'SCOPE_CHANGED'); return; }
    if (request.result?.imported) { abort('Abre el equipo sincronizado para continuar este partido.', 'GAME_BOUND'); return; }
    done();
  };
}
export function stampState(state, c = context) {
  return hasSyncStorage() ? { ...state, scope: c.scope, scopeVersion: c.version } : state;
}
const byGame = (tx, c, gid) => tx.objectStore('cloudEvents').index('byGame').getAll([c.scope, gid]);
function enqueue(tx, c, type, gameId, payload, eventId = null, sourceId = '', extra = {}) {
  const opId = id();
  tx.objectStore('syncQueue').add({ key: [c.scope, opId], opId, scope: c.scope, uid: c.uid, projectId: c.projectId,
    teamId: c.teamId, type, gameId, eventId, payload, sourceId, createdAt: Date.now(), attempts: 0, nextAttempt: 0, ...extra });
}
export function queuePanel(tx, c, gameId, panel, baseId = null) {
  validatePanel(panel);
  enqueue(tx, c, gameId === PANEL_DEFAULT ? 'default-panel' : 'panel', gameId, panel, null, panel.version.id, { baseId });
}
export function configEvents(c = context) {
  return transact(['cloudEvents'], 'readonly', (tx, done) => {
    const request = tx.objectStore('cloudEvents').getAll();
    request.onsuccess = () => done(request.result.filter(row => row.scope === c.scope).map(row => row.payload));
  });
}
function changed() { globalThis.dispatchEvent?.(new Event('defensas-sync-local')); }
function mutation(c, work) {
  assertContext(c);
  return transact(SYNC_STORES, 'readwrite', work).then(value => { changed(); return value; });
}
function cloudSnapshot(tx, done, c, selected) {
  const request = tx.objectStore('cloudGames').index('byScope').getAll(c.scope);
  request.onsuccess = () => {
    const games = request.result.filter(game => !game.deleted).map(game => ({ ...game.payload, id: game.gameId }));
    const gid = games.some(game => game.id === selected) ? selected : null;
    if (!gid) { done(stampState({ games, currentGameId: null, events: [] }, c)); return; }
    const events = byGame(tx, c, gid);
    events.onsuccess = () => done(stampState({ games, currentGameId: gid,
      events: events.result.filter(row => !row.deleted).sort((a, b) => a.seq - b.seq)
        .map(row => ({ ...row.payload, gameId: gid, seq: row.seq })) }, c));
  };
}
export function readCloudState(c = context) {
  return transact(SYNC_STORES, 'readonly', (tx, done) => {
    const request = tx.objectStore('syncMeta').get('active:' + c.scope);
    request.onsuccess = () => cloudSnapshot(tx, done, c, request.result?.value ?? null);
  });
}
export function createCloudGame(game, c = context, panel = null) {
  return mutation(c, (tx, done) => {
    tx.objectStore('cloudGames').add({ key: [c.scope, game.id], scope: c.scope, gameId: game.id, payload: game, deleted: false, ...(panel ? { panel: validatePanel(panel) } : {}) });
    tx.objectStore('syncMeta').put({ key: 'active:' + c.scope, value: game.id });
    enqueue(tx, c, 'game', game.id, game, null, 'device-' + game.id);
    if (panel) queuePanel(tx, c, game.id, panel);
    cloudSnapshot(tx, done, c, game.id);
  });
}
export function selectCloudGame(gid, c = context) {
  return mutation(c, (tx, done, abort) => {
    if (!gid) { tx.objectStore('syncMeta').delete('active:' + c.scope); cloudSnapshot(tx, done, c, null); return; }
    const game = tx.objectStore('cloudGames').get([c.scope, gid]);
    game.onsuccess = () => {
      if (!game.result || game.result.deleted) { abort('El partido ya no existe.'); return; }
      tx.objectStore('syncMeta').put({ key: 'active:' + c.scope, value: gid }); cloudSnapshot(tx, done, c, gid);
    };
  });
}
export function addCloudEvent(event, c = context, panel = null) {
  return mutation(c, (tx, done, abort) => {
    const gid = event.gameId, game = tx.objectStore('cloudGames').get([c.scope, gid]);
    game.onsuccess = () => {
      if (!game.result || game.result.deleted) { abort('El partido fue eliminado.'); return; }
      if (panel) {
        validatePanel(panel);
        if (game.result.panel && game.result.panel.version.id !== panel.version.id) { abort('El panel ha cambiado. Vuelve a elegir la acción.', 'CONFIG_CONFLICT'); return; }
        if (!game.result.panel) {
          tx.objectStore('cloudGames').put({ ...game.result, panel });
          queuePanel(tx, c, gid, panel);
        }
      }
      const payload = { ...event, gameId: game.result.payload.id };
      delete payload.seq;
      const key = [c.scope, gid, event.id];
      const tomb = tx.objectStore('cloudTombs').get(key);
      tomb.onsuccess = () => {
        if (tomb.result) { abort('Este evento fue deshecho.', 'EVENT_CONFLICT'); return; }
        const existing = tx.objectStore('cloudEvents').index('byCloud').get(key);
        existing.onsuccess = () => {
          if (existing.result) {
            const original = { ...existing.result.payload }; delete original.seq;
            if (canonical(original) !== canonical(payload)) { abort('ID de evento conflictivo.', 'EVENT_CONFLICT'); return; }
            done(existing.result.seq); return;
          }
          const add = tx.objectStore('cloudEvents').add({ scope: c.scope, gameId: gid, eventId: event.id, payload, deleted: false });
          add.onsuccess = () => {
            // Orden técnico local separado del payload histórico.
            enqueue(tx, c, 'event', gid, payload, event.id, 'event-' + event.id, { panelVersionId: (panel || game.result.panel)?.version.id ?? null }); done(add.result);
          };
        };
      };
    };
  });
}
export function undoCloudEvent(gid, c = context) {
  return mutation(c, (tx, done, abort) => {
    const game = tx.objectStore('cloudGames').get([c.scope, gid]);
    game.onsuccess = () => {
      if (!game.result || game.result.deleted) { abort('El partido fue eliminado.'); return; }
      const events = byGame(tx, c, gid);
      events.onsuccess = () => {
        const row = events.result.filter(row => !row.deleted).sort((a, b) => b.seq - a.seq)[0];
        if (!row) { done(null); return; }
        row.deleted = true; tx.objectStore('cloudEvents').put(row);
        tx.objectStore('cloudTombs').put({ key: [c.scope, gid, row.eventId], scope: c.scope, gameId: gid, eventId: row.eventId });
        enqueue(tx, c, 'undo', gid, null, row.eventId); done(row.payload);
      };
    };
  });
}
export function deleteCloudGame(gid, c = context) {
  return mutation(c, (tx, done, abort) => {
    const game = tx.objectStore('cloudGames').get([c.scope, gid]);
    game.onsuccess = () => {
      if (!game.result || game.result.deleted) { abort('El partido ya fue eliminado.'); return; }
      const row = { ...game.result, deleted: true }; tx.objectStore('cloudGames').put(row);
      tx.objectStore('cloudTombs').put({ key: [c.scope, gid, ''], scope: c.scope, gameId: gid });
      enqueue(tx, c, 'delete', gid, row.payload, null, row.sourceId || 'deleted-' + gid);
      const active = tx.objectStore('syncMeta').get('active:' + c.scope);
      active.onsuccess = () => { if (active.result?.value === gid) tx.objectStore('syncMeta').delete('active:' + c.scope); };
      cloudSnapshot(tx, done, c, null);
    };
  });
}
export const sameIds = (a, b) => a.length === b.length && [...a].sort().join('\n') === [...b].sort().join('\n');
// Fase 10: vaciar partido con cuenta. Cada tiro recibe su lápida (como Deshacer), en la misma transacción
// local; en la nube se envían como operaciones idempotentes y ningún tiro borrado puede volver a entrar.
export function clearCloudGame(gid, expectedIds, c = context) {
  return mutation(c, (tx, done, abort) => {
    const game = tx.objectStore('cloudGames').get([c.scope, gid]);
    game.onsuccess = () => {
      if (!game.result || game.result.deleted) { abort('El partido ya no existe. No se ha borrado nada.'); return; }
      const events = byGame(tx, c, gid);
      events.onsuccess = () => {
        const live = events.result.filter(row => !row.deleted);
        if (!sameIds(live.map(row => row.payload.id), expectedIds)) {
          abort('El partido ha cambiado mientras confirmabas. No se ha borrado nada.', 'GAME_CHANGED'); return;
        }
        for (const row of live) {
          tx.objectStore('cloudEvents').put({ ...row, deleted: true });
          tx.objectStore('cloudTombs').put({ key: [c.scope, gid, row.eventId], scope: c.scope, gameId: gid, eventId: row.eventId });
          enqueue(tx, c, 'undo', gid, null, row.eventId);
        }
        cloudSnapshot(tx, done, c, gid);
      };
    };
  });
}
export function exportCloudGame(gid, c = context) {
  return transact(SYNC_STORES, 'readonly', (tx, done, abort) => {
    const game = tx.objectStore('cloudGames').get([c.scope, gid]);
    game.onsuccess = () => {
      if (!game.result || game.result.deleted) { abort('El partido ya no existe.'); return; }
      const events = byGame(tx, c, gid);
      events.onsuccess = () => done({ game: game.result.payload, events: events.result.filter(row => !row.deleted)
        .sort((a, b) => a.seq - b.seq).map(row => ({ ...row.payload, seq: row.payload.seq ?? row.seq })) });
    };
  });
}

export function listPending(c = context) {
  return transact(['syncQueue'], 'readonly', (tx, done) => {
    const request = tx.objectStore('syncQueue').index('byScope').getAll(c.scope);
    request.onsuccess = () => done(request.result.sort((a, b) => {
      const priority = op => op.type === 'delete' ? 0 : op.type === 'game' ? 1 : ['panel', 'default-panel'].includes(op.type) ? 2 : op.type === 'undo' ? 3 : 4;
      const depth = (op, seen = new Set()) => {
        if (!['panel', 'default-panel'].includes(op.type) || !op.baseId || seen.has(op.opId)) return 0;
        seen.add(op.opId);
        const parent = request.result.find(item => item.gameId === op.gameId && item.type === op.type && item.payload.version.id === op.baseId);
        return parent ? 1 + depth(parent, seen) : 0;
      };
      return priority(a) - priority(b) || depth(a) - depth(b) || a.createdAt - b.createdAt || a.opId.localeCompare(b.opId);
    }));
  });
}
export function acknowledge(op) {
  return transact(['syncQueue'], 'readwrite', (tx, done) => { tx.objectStore('syncQueue').delete(op.key); done(); });
}
export function failOperation(op, error) {
  return transact(['syncQueue'], 'readwrite', (tx, done) => {
    const request = tx.objectStore('syncQueue').get(op.key);
    request.onsuccess = () => {
      if (!request.result) { done(null); return; }
      const blocked = /permission-denied|invalid-argument|SYNC_CONFLICT/.test(error.code || '');
      const failed = { ...request.result, attempts: op.attempts + 1,
        error: String(error.code || 'network'), blocked,
        nextAttempt: Date.now() + Math.min(60000, 1000 * 2 ** Math.min(op.attempts, 6)) + Math.floor(Math.random() * 500) };
      tx.objectStore('syncQueue').put(failed);
      done(failed);
    };
  });
}
export function retryOperations(c = context) {
  return transact(['syncQueue'], 'readwrite', (tx, done) => {
    const request = tx.objectStore('syncQueue').index('byScope').openCursor(c.scope);
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) { cursor.update({ ...cursor.value, blocked: false, nextAttempt: 0, error: null }); cursor.continue(); }
      else done();
    };
  });
}
export function lease(c, worker, release = false) {
  return transact(['syncMeta'], 'readwrite', (tx, done) => {
    const key = 'lease:' + c.scope, store = tx.objectStore('syncMeta'), request = store.get(key);
    request.onsuccess = () => {
      const row = request.result;
      if (release) { if (row?.worker === worker) store.delete(key); done(true); return; }
      if (row && row.worker !== worker && row.until > Date.now()) { done(false); return; }
      store.put({ key, worker, until: Date.now() + 30000 }); done(true);
    };
  });
}
export function cacheTeams(uid, teams) {
  return transact(['syncMeta'], 'readwrite', (tx, done) => { tx.objectStore('syncMeta').put({ key: 'teams:' + accountKey(uid), value: teams }); done(); });
}
export function cachedTeams(uid) {
  return transact(['syncMeta'], 'readonly', (tx, done) => {
    const request = tx.objectStore('syncMeta').get('teams:' + accountKey(uid)); request.onsuccess = () => done(request.result?.value || []);
  });
}
export function syncPreference(uid, teamId = undefined) {
  return transact(['syncMeta'], teamId === undefined ? 'readonly' : 'readwrite', (tx, done) => {
    const key = 'preferred-team:' + accountKey(uid);
    if (teamId !== undefined) { tx.objectStore('syncMeta').put({ key, value: teamId }); done(teamId); }
    else { const req = tx.objectStore('syncMeta').get(key); req.onsuccess = () => done(req.result?.value || null); }
  });
}
export function mergeRemote(c, games) {
  assertContext(c);
  
  let visibleChanged = false;
  return transact(SYNC_STORES, 'readwrite', (tx, done, abort) => {
    const settings = tx.objectStore('settings'), configKey = panelKey('configuracionBotones', c), usageKey = panelKey('configuracionPorPartido', c);
    const configRequest = settings.get(configKey), usageRequest = settings.get(usageKey), pendingRequest = tx.objectStore('syncQueue').index('byScope').getAll(c.scope);
    let loaded = 0;
    const start = () => {
    if (++loaded !== 3) return;
    let record = configRequest.result?.value ?? null;
    const usage = usageRequest.result?.value ?? {}, pending = pendingRequest.result;
    const applyPanel = (panel, gid = null, makeCurrent = false) => {
      const before = record;
      record = mergePanelRecord(record, panel, makeCurrent);
      if (record !== before) { settings.put({ key: configKey, scope: c.scope, value: record }); visibleChanged = true; }
      if (gid && usage[gid]?.at(-1) !== panel.version.id) {
        usage[gid] = [...(usage[gid] || []).filter(id => id !== panel.version.id), panel.version.id];
        settings.put({ key: usageKey, scope: c.scope, value: usage }); visibleChanged = true;
      }
    };
    for (const remote of games) {
      if (remote.kind === 'configuration') {
        try { applyPanel(remote.panel, null, !pending.some(op => op.type === 'default-panel')); }
        catch (error) { abort(error.message, error.code); }
        continue;
      }
      const gid = remote.id;
      const request = tx.objectStore('cloudGames').get([c.scope, gid]);
      request.onsuccess = () => {
        // Fase 10: si la cuenta cambia (o se cierra) durante la transacción, no se materializa nada.
        if (storageContext() !== c) { abort('La cuenta o el equipo han cambiado.', 'SCOPE_CHANGED'); return; }
        const old = request.result;
        if (old && canonical(old.payload) !== canonical(remote.payload)) { abort('Partido remoto conflictivo.', 'SYNC_CONFLICT'); return; }
        const deleted = Boolean(old?.deleted || remote.deleted);
        let panel = old?.panel;
        const panelPending = pending.filter(op => op.type === 'panel' && op.gameId === gid);
        const remoteHasShots = remote.events?.some(event => !(remote.tombs || []).includes(event.id));
        if (!deleted && remote.panel && (!panelPending.length || (remoteHasShots && panelPending.some(op => op.blocked)))) {
          try { applyPanel(remote.panel, gid); panel = remote.panel; }
          catch (error) { abort(error.message, error.code); return; }
        }
        if (!old || Boolean(old.deleted) !== deleted) visibleChanged = true;
        tx.objectStore('cloudGames').put({ key: [c.scope, gid], scope: c.scope, gameId: gid,
          payload: remote.payload, sourceId: remote.sourceId, deleted, ...(panel ? { panel } : {}) });
        if (deleted) tx.objectStore('cloudTombs').put({ key: [c.scope, gid, ''], scope: c.scope, gameId: gid });
        for (const eid of remote.tombs || []) {
          tx.objectStore('cloudTombs').put({ key: [c.scope, gid, eid], scope: c.scope, gameId: gid, eventId: eid });
          const event = tx.objectStore('cloudEvents').index('byCloud').get([c.scope, gid, eid]);
          event.onsuccess = () => {
            if (event.result && !event.result.deleted) {
              visibleChanged = true;
              tx.objectStore('cloudEvents').put({ ...event.result, deleted: true });
            }
          };
        }
        if (deleted) return;
        for (const event of remote.events || []) {
          const key = [c.scope, gid, event.id];
          const tomb = tx.objectStore('cloudTombs').get(key);
          tomb.onsuccess = () => {
            const existing = tx.objectStore('cloudEvents').index('byCloud').get(key);
            existing.onsuccess = () => {
              const oldEvent = existing.result;
              if (oldEvent && canonical(oldEvent.payload) !== canonical(event.payload)) { abort('Evento remoto conflictivo.', 'SYNC_CONFLICT'); return; }
              if (oldEvent) return; // Nunca reactivar un evento local deshecho ni cambiar su orden local.
              if (!tomb.result) visibleChanged = true;
              tx.objectStore('cloudEvents').add({ scope: c.scope, gameId: gid, eventId: event.id,
                payload: event.payload, deleted: Boolean(tomb.result), sourceId: event.sourceId });
            };
          };
        }
      };
    }
    done();
    };
    configRequest.onsuccess = usageRequest.onsuccess = pendingRequest.onsuccess = start;
  }).then(() => {
    
    if (visibleChanged && storageContext() === c) {
       globalThis.dispatchEvent?.(new Event('defensas-sync-remote'));
    }
  });
}
// Fase 10: ámbitos (equipos) de una cuenta en este proyecto.
const ownsScope = (scope, uid) => typeof scope === 'string' && scope.startsWith(accountKey(uid).slice(0, -1) + ',');
const LEGACY = 'legacy-owner:';
// Lo que se perdería al cerrar sesión: operaciones sin acuse y partidos de la cuenta guardados solo aquí.
export function accountUnsynced(uid) {
  if (!hasSyncStorage() || !uid) return Promise.resolve({ pending: 0, blocked: 0, localOnly: 0 });
  return transact(['games', 'syncQueue', 'syncMeta'], 'readonly', (tx, done) => {
    const queue = tx.objectStore('syncQueue').getAll(), meta = tx.objectStore('syncMeta').getAll(), games = tx.objectStore('games').getAllKeys();
    let count = 0;
    const finish = () => {
      if (++count !== 3) return;
      const ops = queue.result.filter(op => op.uid === uid && op.projectId === projectId);
      const ids = new Set(games.result);
      const localOnly = meta.result.filter(row => row.key.startsWith(LEGACY) && row.uid === uid && !row.imported &&
        ids.has(JSON.parse(row.key.slice(LEGACY.length)))).length;
      done({ pending: ops.length, blocked: ops.filter(op => op.blocked).length, localOnly });
    };
    queue.onsuccess = finish; meta.onsuccess = finish; games.onsuccess = finish;
  });
}
// Cerrar sesión borra de este dispositivo los datos de la cuenta: copias de la nube, cola, lista de equipos
// y partidos creados con esa cuenta sin subir. Una sola transacción e idempotente. Se conservan los partidos
// sin cuenta, las copias originales ya importadas (datos previos del dispositivo) y la preferencia de equipo.
export function purgeAccountData(uid, { protectUnsynced = false } = {}) {
  if (!hasSyncStorage() || !uid) return Promise.resolve({ rows: 0, localGames: 0 });
  const summary = { rows: 0, localGames: 0 }, account = accountKey(uid);
  return transact(['games', 'events', 'settings', ...SYNC_STORES], 'readwrite', (tx, done, abort) => {
    // Fase 22: la UI vuelve a comprobar dentro de la misma transacción que borra.
    // Cubre un tiro de otra pestaña posterior al aviso y purgas aplazadas de 20.0.
    if (protectUnsynced) {
      const queue = tx.objectStore('syncQueue').getAll(), meta = tx.objectStore('syncMeta').getAll(), games = tx.objectStore('games').getAllKeys();
      let loaded = 0;
      const check = () => {
        if (++loaded !== 3) return;
        const ids = new Set(games.result);
        if (queue.result.some(op => op.uid === uid && op.projectId === projectId) ||
          meta.result.some(row => row.key.startsWith(LEGACY) && row.uid === uid && !row.imported && ids.has(JSON.parse(row.key.slice(LEGACY.length))))) {
          abort('Los datos sin sincronizar se conservan en este dispositivo. Vuelve a esta cuenta para recuperarlos.', 'UNSYNCED_DATA'); return;
        }
        remove();
      };
      queue.onsuccess = check; meta.onsuccess = check; games.onsuccess = check;
    } else remove();
    function remove() {
    done(summary);
    for (const name of ['cloudGames', 'cloudEvents', 'cloudTombs', 'syncQueue', 'syncBindings']) {
      const request = tx.objectStore(name).openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        if (ownsScope(cursor.value.scope, uid)) { cursor.delete(); summary.rows++; }
        cursor.continue();
      };
    }
    const meta = tx.objectStore('syncMeta').openCursor();
    meta.onsuccess = () => {
      const cursor = meta.result;
      if (!cursor) return;
      const { key } = cursor.value;
      const scoped = /^(active|lease):/.test(key) && ownsScope(key.slice(key.indexOf(':') + 1), uid);
      if (scoped || key === 'teams:' + account) { cursor.delete(); summary.rows++; }
      else if (key.startsWith(LEGACY) && cursor.value.uid === uid && !cursor.value.imported) {
        const gameId = JSON.parse(key.slice(LEGACY.length));
        tx.objectStore('games').delete(gameId);
        const events = tx.objectStore('events').index('byGameId').openCursor(IDBKeyRange.only(gameId));
        events.onsuccess = () => { const row = events.result; if (row) { row.delete(); row.continue(); } };
        const active = tx.objectStore('settings').get('activeGame');
        active.onsuccess = () => { if (active.result?.value === gameId) tx.objectStore('settings').delete('activeGame'); };
        cursor.delete(); summary.localGames++;
      }
      cursor.continue();
    };
    const configs = tx.objectStore('settings').openCursor();
    configs.onsuccess = () => {
      const cursor = configs.result;
      if (!cursor) return;
      if (ownsScope(cursor.value.scope, uid)) { cursor.delete(); summary.rows++; }
      cursor.continue();
    };
    }
  });
}
// Partidos guardados sin cuenta en este dispositivo (para preguntar una vez al iniciar sesión).
export function listDeviceGames() {
  if (!hasSyncStorage()) return Promise.resolve([]);
  return transact(['games', 'syncMeta'], 'readonly', (tx, done) => {
    const games = tx.objectStore('games').getAll(), meta = tx.objectStore('syncMeta').getAllKeys();
    let count = 0;
    const finish = () => {
      if (++count !== 2) return;
      const owned = new Set(meta.result.filter(key => String(key).startsWith(LEGACY)));
      done(games.result.filter(game => !owned.has(ownerKey(game.id))));
    };
    games.onsuccess = finish; meta.onsuccess = finish;
  });
}
export function listLegacyForImport() {
  const uid = identity;
  return transact(['games', 'events', 'syncMeta', 'syncBindings'], 'readonly', (tx, done) => {
    const games = tx.objectStore('games').getAll(), events = tx.objectStore('events').getAll(), meta = tx.objectStore('syncMeta').getAll();
    let count = 0;
    const finish = () => { if (++count !== 3) return;
      const owners = new Map(meta.result.map(row => [row.key, row]));
      done(games.result.filter(game => !owners.has(ownerKey(game.id)) || (owners.get(ownerKey(game.id)).uid === uid && !owners.get(ownerKey(game.id)).imported))
        .map(game => ({ game, events: events.result.filter(event => event.gameId === game.id).sort((a, b) => a.seq - b.seq) })));
    };
    games.onsuccess = finish; events.onsuccess = finish; meta.onsuccess = finish;
  });
}
async function sourceIdentity() {
  return transact(['syncMeta'], 'readwrite', (tx, done) => {
    const store = tx.objectStore('syncMeta'), request = store.get('source');
    request.onsuccess = () => {
      const value = request.result?.value || id(); store.put({ key: 'source', value }); done(value);
    };
  });
}
async function hash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value)));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export function legacyImportIssue(item) {
  const text = (value, limit) => typeof value === 'string' && value.trim().length > 0 && value.length <= limit;
  const gameKeys = ['id', 'jornada', 'rival', 'createdAt'];
  const eventKeys = ['id', 'gameId', 'jornada', 'rival', 'categoria', 'accion', 'categoria_id', 'accion_id',
    'defensa_id', 'estrategia', 'tipo_bloqueo', 'tiros_permitidos', 'valor_tiro', 'resultado', 'fecha_hora', 'seq'];
  if (!item.game || Object.keys(item.game).some(key => !gameKeys.includes(key)) ||
    !text(item.game.id, 256) || !text(item.game.jornada, 256) || !text(item.game.rival, 1024) || !text(item.game.createdAt, 64)) return 'Metadatos antiguos no compatibles con el contrato de Firestore.';
  for (const event of item.events) {
    if (Object.keys(event).some(key => !eventKeys.includes(key)) || !text(event.id, 256) || event.gameId !== item.game.id ||
      !text(event.categoria, 256) || !text(event.accion, 256) || !text(event.fecha_hora, 64) ||
      ![2, 3].includes(event.valor_tiro) || !['fallado', 'anotado'].includes(event.resultado)) return 'Evento histórico no compatible; sus datos originales se conservan.';
    if (event.seq !== undefined && (!Number.isSafeInteger(event.seq) || event.seq <= 0)) return 'Orden histórico no compatible.';
    for (const key of ['categoria_id', 'accion_id', 'defensa_id', 'estrategia', 'tipo_bloqueo']) {
      if (event[key] != null && !text(event[key], 256)) return 'Identidad histórica no compatible.';
    }
    if (event.jornada !== undefined && !text(event.jornada, 256)) return 'Jornada histórica no compatible.';
    if (event.rival !== undefined && !text(event.rival, 1024)) return 'Rival histórico no compatible.';
    if (event.tiros_permitidos !== undefined && (!Array.isArray(event.tiros_permitidos) ||
      event.tiros_permitidos.length < 1 || event.tiros_permitidos.length > 2 ||
      event.tiros_permitidos.some(value => ![2, 3].includes(value)) || !event.tiros_permitidos.includes(event.valor_tiro))) return 'Permisos históricos no compatibles.';
  }
  return '';
}
export async function importLegacy(reviewed, c, confirmed = false) {
  assertContext(c);
  if (!c.scope || !confirmed) throw Error('Revisa y confirma cuenta, equipo y partidos.');
  if (!reviewed.length) return [];
  const issue = reviewed.map(legacyImportIssue).find(Boolean); if (issue) throw Error(issue);
  const source = await sourceIdentity();
  const plan = await Promise.all(reviewed.map(async item => ({ ...item,
    gid: 'g_' + await hash([1, source, 'game', item.game.id]),
    mapped: await Promise.all(item.events.map(async event => ({ payload: event,
      eid: 'e_' + await hash([1, source, 'event', item.game.id, event.id ?? null, event.seq]) }))) })));
  assertContext(c);
  return transact(['games', 'events', ...SYNC_STORES], 'readwrite', (tx, done, abort) => {
    for (const item of plan) {
      const game = tx.objectStore('games').get(item.game.id);
      game.onsuccess = () => {
        if (canonical(game.result) !== canonical(item.game)) { abort('El partido cambió; vuelve a revisarlo.', 'IMPORT_CHANGED'); return; }
        const events = tx.objectStore('events').index('byGameId').getAll(item.game.id);
        events.onsuccess = () => {
          if (canonical(events.result.sort((a, b) => a.seq - b.seq)) !== canonical(item.events)) { abort('Los eventos cambiaron; vuelve a revisarlos.', 'IMPORT_CHANGED'); return; }
          const owner = tx.objectStore('syncMeta').get(ownerKey(item.game.id));
          owner.onsuccess = () => {
            if (owner.result && owner.result.uid !== c.uid) { abort('Este partido pertenece a otra cuenta.', 'SCOPE_CHANGED'); return; }
            const binding = tx.objectStore('syncBindings').get([c.scope, item.game.id]);
            binding.onsuccess = () => {
              if (binding.result) return;
              if (owner.result?.imported) { abort('Este partido ya está incorporado a un equipo. Abre su equipo original para continuar.', 'ALREADY_IMPORTED'); return; }
              tx.objectStore('syncMeta').put({ key: ownerKey(item.game.id), uid: c.uid, imported: true });
              tx.objectStore('syncBindings').add({ key: [c.scope, item.game.id], scope: c.scope, gameId: item.gid, source });
              tx.objectStore('cloudGames').add({ key: [c.scope, item.gid], scope: c.scope, gameId: item.gid, payload: item.game, sourceId: source, deleted: false });
              enqueue(tx, c, 'game', item.gid, item.game, null, source);
              const config = tx.objectStore('settings').get('configuracionBotones');
              config.onsuccess = () => {
                const usage = tx.objectStore('settings').get('configuracionPorPartido');
                usage.onsuccess = () => {
                  const panel = panelSnapshot(config.result?.value, usage.result?.value, item.game.id, item.events.length > 0);
                  if (panel) {
                    tx.objectStore('cloudGames').put({ key: [c.scope, item.gid], scope: c.scope, gameId: item.gid, payload: item.game, sourceId: source, deleted: false, panel });
                    queuePanel(tx, c, item.gid, panel);
                  }
                };
              };
              for (const event of item.mapped) {
                tx.objectStore('cloudEvents').add({ scope: c.scope, gameId: item.gid, eventId: event.eid, payload: event.payload, sourceId: source, deleted: false });
                enqueue(tx, c, 'event', item.gid, event.payload, event.eid, source);
              }
            };
          };
        };
      };
    }
    done(plan.map(item => item.gid));
  }).then(value => { changed(); return value; });
}
