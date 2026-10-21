import { syncSettings } from './sync-config.js';
import { upgradeSyncSchema, storageContext, filterLegacyGames, guardLegacyGame, claimLocalGame, stampState,
  readCloudState, createCloudGame, selectCloudGame, deleteCloudGame, clearCloudGame, addCloudEvent, undoCloudEvent, exportCloudGame,
  sameIds } from './sync-storage.js';
const DB_NAME = "registro_defensivo_baloncesto";
let db;
let opening;
export const hasSyncStorage = () => Boolean(db?.objectStoreNames.contains('syncQueue'));

export function openDatabase() {
  if (db) return Promise.resolve();
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    let blocked = false;
    // Sin bandera no se actualiza una base v1 ni se rebaja una base v2 existente.
    const req = syncSettings.enabled ? indexedDB.open(DB_NAME, 2) : indexedDB.open(DB_NAME);
    req.onupgradeneeded = event => {
      const database = req.result;
      if (event.oldVersion < 1) {
      database.createObjectStore("games", { keyPath: "id" });
      const records = database.createObjectStore("events", { keyPath: "seq", autoIncrement: true });
      records.createIndex("byGameId", "gameId");
      records.createIndex("byGameSeq", ["gameId", "seq"]);
      records.createIndex("byUuid", "id", { unique: true });
      database.createObjectStore("settings", { keyPath: "key" });
      }
      if (database.version >= 2 && event.oldVersion < 2) upgradeSyncSchema(database);
    };
    req.onsuccess = () => {
      if (blocked) { req.result.close(); return; }
      db = req.result;
      db.onversionchange = () => {
        db.close();
        db = null;
        globalThis.dispatchEvent?.(new Event("defensas-storage-closed"));
      };
      resolve();
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      blocked = true;
      reject(new Error("Otra pestaña bloquea el almacenamiento. Ciérrala y recarga."));
    };
  }).finally(() => { opening = null; });
  return opening;
}

// Todos los resultados se entregan al confirmar la transacción, nunca al
// completar únicamente una petición. Las comprobaciones y escrituras comparten tx.
export function transact(stores, mode, work) {
  return new Promise((resolve, reject) => {
    if (!db) { reject(new Error("Almacenamiento no disponible. Recarga la página.")); return; }
    const names = hasSyncStorage() && stores.includes('games') ? [...new Set([...stores, 'syncMeta'])] : stores;
    const tx = db.transaction(names, mode);
    let result, reason;
    const abort = (message, code = "GAME_NOT_FOUND") => {
      reason = new Error(message);
      reason.code = code;
      tx.abort();
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(reason || tx.error || new Error("Transacción cancelada."));
    tx.onerror = () => {};
    try { work(tx, value => { result = value; }, abort); }
    catch (error) { reason = error; tx.abort(); }
  });
}

function snapshot(tx, setResult, activeId) {
  const c = storageContext();
  const gamesRequest = tx.objectStore("games").getAll();
  gamesRequest.onsuccess = () => {
    filterLegacyGames(tx, gamesRequest.result, games => {
    const id = games.some(game => game.id === activeId) ? activeId : null;
    if (!id) { setResult(stampState({ games, currentGameId: null, events: [] }, c)); return; }
    const request = tx.objectStore("events").index("byGameId").getAll(IDBKeyRange.only(id));
    request.onsuccess = () => setResult(stampState({
      games, currentGameId: id, events: request.result.sort((a, b) => a.seq - b.seq)
    }, c));
    });
  };
}

export function readState() {
  if (storageContext().scope) return readCloudState();
  return transact(["games", "events", "settings"], "readonly", (tx, result) => {
    const request = tx.objectStore("settings").get("activeGame");
    request.onsuccess = () => snapshot(tx, result, request.result?.value ?? null);
  });
}

export function createGameAndSelect(game, panel = null) {
  if (!game.id || !game.jornada?.trim() || !game.rival?.trim()) {
    return Promise.reject(new Error("Jornada y rival son obligatorios."));
  }
  if (storageContext().scope) return createCloudGame(game, storageContext(), panel);
  return transact(["games", "events", "settings"], "readwrite", (tx, result) => {
    tx.objectStore("games").add(game);
    claimLocalGame(tx, game.id);
    tx.objectStore("settings").put({ key: "activeGame", value: game.id });
    snapshot(tx, result, game.id);
  });
}

export function selectGameState(gameId) {
  if (storageContext().scope) return selectCloudGame(gameId);
  return transact(["games", "events", "settings"], "readwrite", (tx, result, abort) => {
    if (!gameId) {
      tx.objectStore("settings").delete("activeGame");
      snapshot(tx, result, null);
      return;
    }
    const request = tx.objectStore("games").get(gameId);
    request.onsuccess = () => guardLegacyGame(tx, gameId, abort, () => {
      if (!request.result) { abort("El partido ya no existe. Selecciona otro."); return; }
      tx.objectStore("settings").put({ key: "activeGame", value: gameId });
      snapshot(tx, result, gameId);
    });
  });
}

export function deleteGame(gameId) {
  if (storageContext().scope) return deleteCloudGame(gameId);
  return transact(["games", "events", "settings"], "readwrite", (tx, result, abort) => {
    const request = tx.objectStore("games").get(gameId);
    request.onsuccess = () => guardLegacyGame(tx, gameId, abort, () => {
      if (!request.result) { abort("El partido ya ha sido eliminado."); return; }
      tx.objectStore("games").delete(gameId);
      const cursorRequest = tx.objectStore("events").index("byGameId").openCursor(IDBKeyRange.only(gameId));
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) { cursor.delete(); cursor.continue(); }
      };
      const active = tx.objectStore("settings").get("activeGame");
      active.onsuccess = () => {
        if (active.result?.value === gameId) tx.objectStore("settings").delete("activeGame");
      };
      snapshot(tx, result, null);
    });
  });
}

// Fase 10: vaciar partido. Borra todos sus tiros en una sola transacción y conserva el partido
// (ID, jornada y rival). Solo si los tiros siguen siendo exactamente los que vio el usuario al confirmar.
export function clearGameEvents(gameId, expectedIds) {
  if (!Array.isArray(expectedIds)) return Promise.reject(new Error("Faltan los tiros confirmados."));
  if (storageContext().scope) return clearCloudGame(gameId, expectedIds);
  return transact(["games", "events", "settings"], "readwrite", (tx, result, abort) => {
    const game = tx.objectStore("games").get(gameId);
    game.onsuccess = () => guardLegacyGame(tx, gameId, abort, () => {
      if (!game.result) { abort("El partido ya no existe. No se ha borrado nada."); return; }
      const request = tx.objectStore("events").index("byGameId").getAll(IDBKeyRange.only(gameId));
      request.onsuccess = () => {
        if (!sameIds(request.result.map(event => event.id), expectedIds)) {
          abort("El partido ha cambiado mientras confirmabas. No se ha borrado nada.", "GAME_CHANGED"); return;
        }
        for (const event of request.result) tx.objectStore("events").delete(event.seq);
        snapshot(tx, result, gameId);
      };
    });
  });
}

export function addEvent(event, allowedShots = event.tiros_permitidos, panel = null) {
  if (![2, 3].includes(event.valor_tiro) || !["anotado", "fallado"].includes(event.resultado) ||
      (allowedShots && !allowedShots.includes(event.valor_tiro))) {
    return Promise.reject(new Error("El resultado no está permitido para esta acción."));
  }
  if (storageContext().scope) return addCloudEvent(event, storageContext(), panel);
  return transact(["games", "events"], "readwrite", (tx, result, abort) => {
    const game = tx.objectStore("games").get(event.gameId);
    game.onsuccess = () => guardLegacyGame(tx, event.gameId, abort, () => {
      if (!game.result) { abort("El partido fue eliminado. No se ha registrado el tiro."); return; }
      const records = tx.objectStore("events");
      const existing = records.index("byUuid").get(event.id);
      existing.onsuccess = () => {
        if (existing.result) {
          const { seq, ...original } = existing.result;
          const { seq: ignored, ...candidate } = event;
          const keys = new Set([...Object.keys(original), ...Object.keys(candidate)]);
          if ([...keys].some(key => JSON.stringify(original[key]) !== JSON.stringify(candidate[key]))) {
            abort("El ID del evento ya corresponde a otro registro.", "EVENT_CONFLICT"); return;
          }
          result(seq); // Reintento del mismo evento: no crea una segunda fila.
        } else {
          const request = records.add(event);
          request.onsuccess = () => result(request.result);
        }
      };
    });
  });
}

export function removeLastGameEvent(gameId) {
  if (storageContext().scope) return undoCloudEvent(gameId);
  return transact(["games", "events"], "readwrite", (tx, result, abort) => {
    const game = tx.objectStore("games").get(gameId);
    game.onsuccess = () => guardLegacyGame(tx, gameId, abort, () => {
      if (!game.result) { abort("El partido fue eliminado. No se puede deshacer."); return; }
      const range = IDBKeyRange.bound([gameId, 0], [gameId, Number.MAX_SAFE_INTEGER]);
      const request = tx.objectStore("events").index("byGameSeq").openCursor(range, "prev");
      request.onsuccess = () => {
        const cursor = request.result;
        result(cursor?.value ?? null);
        if (cursor) cursor.delete();
      };
    });
  });
}

// Snapshot del partido capturado al pulsar Exportar, independiente del activeGame
// que pueda cambiar en otra pestaña durante la lectura.
export function readExportSnapshot(gameId) {
  if (!gameId) return Promise.reject(new Error("Selecciona o crea un partido."));
  if (storageContext().scope) return exportCloudGame(gameId);
  return transact(["games", "events"], "readonly", (tx, result, abort) => {
    const game = tx.objectStore("games").get(gameId);
    game.onsuccess = () => guardLegacyGame(tx, gameId, abort, () => {
      if (!game.result) { abort("El partido ya no existe. No se ha exportado ningún dato."); return; }
      const range = IDBKeyRange.bound([gameId, 0], [gameId, Number.MAX_SAFE_INTEGER]);
      const events = tx.objectStore("events").index("byGameSeq").getAll(range);
      events.onsuccess = () => result({ game: game.result, events: events.result });
    });
  });
}

// Lectura general disponible para comprobaciones, nunca usada por la descarga.
export function allEvents() {
  return transact(["events"], "readonly", (tx, result) => {
    const request = tx.objectStore("events").getAll();
    request.onsuccess = () => result(request.result);
  });
}
