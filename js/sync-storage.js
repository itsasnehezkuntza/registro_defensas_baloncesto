import { transact, hasSyncStorage } from './persistencia.js';
import { syncSettings } from './sync-config.js';
import { firebaseSettings } from './firebase-config.js';

export const SYNC_STORES = ['cloudGames', 'cloudEvents', 'cloudTombs', 'syncQueue', 'syncMeta', 'syncBindings'];
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
function enqueue(tx, c, type, gameId, payload, eventId = null, sourceId = '') {
  const opId = id();
  tx.objectStore('syncQueue').add({ key: [c.scope, opId], opId, scope: c.scope, uid: c.uid, projectId: c.projectId,
    teamId: c.teamId, type, gameId, eventId, payload, sourceId, createdAt: Date.now(), attempts: 0, nextAttempt: 0 });
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
export function createCloudGame(game, c = context) {
  return mutation(c, (tx, done) => {
    tx.objectStore('cloudGames').add({ key: [c.scope, game.id], scope: c.scope, gameId: game.id, payload: game, deleted: false });
    tx.objectStore('syncMeta').put({ key: 'active:' + c.scope, value: game.id });
    enqueue(tx, c, 'game', game.id, game, null, 'device-' + game.id);
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
export function addCloudEvent(event, c = context) {
  return mutation(c, (tx, done, abort) => {
    const gid = event.gameId, game = tx.objectStore('cloudGames').get([c.scope, gid]);
    game.onsuccess = () => {
      if (!game.result || game.result.deleted) { abort('El partido fue eliminado.'); return; }
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
            enqueue(tx, c, 'event', gid, payload, event.id, 'event-' + event.id); done(add.result);
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
      const priority = op => op.type === 'delete' ? 0 : op.type === 'game' ? 1 : op.type === 'undo' ? 2 : 3;
      return priority(a) - priority(b) || a.createdAt - b.createdAt || a.opId.localeCompare(b.opId);
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
      if (!request.result) return;
      const blocked = /permission-denied|invalid-argument|SYNC_CONFLICT/.test(error.code || '');
      tx.objectStore('syncQueue').put({ ...request.result, attempts: op.attempts + 1,
        error: String(error.code || 'network'), blocked,
        nextAttempt: Date.now() + Math.min(60000, 1000 * 2 ** Math.min(op.attempts, 6)) + Math.floor(Math.random() * 500) });
      done();
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
    for (const remote of games) {
      const gid = remote.id;
      const request = tx.objectStore('cloudGames').get([c.scope, gid]);
      request.onsuccess = () => {
        const old = request.result;
        if (old && canonical(old.payload) !== canonical(remote.payload)) { abort('Partido remoto conflictivo.', 'SYNC_CONFLICT'); return; }
        const deleted = Boolean(old?.deleted || remote.deleted);
        if (!old || Boolean(old.deleted) !== deleted) visibleChanged = true;
        tx.objectStore('cloudGames').put({ key: [c.scope, gid], scope: c.scope, gameId: gid,
          payload: remote.payload, sourceId: remote.sourceId, deleted });
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
  }).then(() => {
    
    if (visibleChanged && storageContext() === c) {
       globalThis.dispatchEvent?.(new Event('defensas-sync-remote'));
    }
  });
}
export function listLegacyForImport() {
  const uid = identity;
  return transact(['games', 'events', 'syncMeta', 'syncBindings'], 'readonly', (tx, done) => {
    const games = tx.objectStore('games').getAll(), events = tx.objectStore('events').getAll(), meta = tx.objectStore('syncMeta').getAll();
    let count = 0;
    const finish = () => { if (++count !== 3) return;
      const owners = new Map(meta.result.map(row => [row.key, row.uid]));
      done(games.result.filter(game => !owners.has(ownerKey(game.id)) || owners.get(ownerKey(game.id)) === uid)
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
  if (!c.scope || !confirmed || !reviewed.length) throw Error('Revisa y confirma cuenta, equipo y partidos.');
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
              tx.objectStore('syncMeta').put({ key: ownerKey(item.game.id), uid: c.uid, imported: true });
              tx.objectStore('syncBindings').add({ key: [c.scope, item.game.id], scope: c.scope, gameId: item.gid, source });
              tx.objectStore('cloudGames').add({ key: [c.scope, item.gid], scope: c.scope, gameId: item.gid, payload: item.game, sourceId: source, deleted: false });
              enqueue(tx, c, 'game', item.gid, item.game, null, source);
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
