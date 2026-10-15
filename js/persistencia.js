const DB_NAME = "registro_defensivo_baloncesto";
const DB_VERSION = 1;
let db;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    let blocked = false;
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const database = req.result;
      database.createObjectStore("games", { keyPath: "id" });
      const records = database.createObjectStore("events", { keyPath: "seq", autoIncrement: true });
      records.createIndex("byGameId", "gameId");
      records.createIndex("byGameSeq", ["gameId", "seq"]);
      records.createIndex("byUuid", "id", { unique: true });
      database.createObjectStore("settings", { keyPath: "key" });
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
  });
}

// Todos los resultados se entregan al confirmar la transacción, nunca al
// completar únicamente una petición. Las comprobaciones y escrituras comparten tx.
// Exportada para guardar la configuración del panel en «settings» (Fase 9B).
export function transact(stores, mode, work) {
  return new Promise((resolve, reject) => {
    if (!db) { reject(new Error("Almacenamiento no disponible. Recarga la página.")); return; }
    const tx = db.transaction(stores, mode);
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
  const gamesRequest = tx.objectStore("games").getAll();
  gamesRequest.onsuccess = () => {
    const games = gamesRequest.result;
    const id = games.some(game => game.id === activeId) ? activeId : null;
    if (!id) { setResult({ games, currentGameId: null, events: [] }); return; }
    const request = tx.objectStore("events").index("byGameId").getAll(IDBKeyRange.only(id));
    request.onsuccess = () => setResult({
      games, currentGameId: id, events: request.result.sort((a, b) => a.seq - b.seq)
    });
  };
}

export function readState() {
  return transact(["games", "events", "settings"], "readonly", (tx, result) => {
    const request = tx.objectStore("settings").get("activeGame");
    request.onsuccess = () => snapshot(tx, result, request.result?.value ?? null);
  });
}

export function createGameAndSelect(game) {
  if (!game.id || !game.jornada?.trim() || !game.rival?.trim()) {
    return Promise.reject(new Error("Jornada y rival son obligatorios."));
  }
  return transact(["games", "events", "settings"], "readwrite", (tx, result) => {
    tx.objectStore("games").add(game);
    tx.objectStore("settings").put({ key: "activeGame", value: game.id });
    snapshot(tx, result, game.id);
  });
}

export function selectGameState(gameId) {
  return transact(["games", "events", "settings"], "readwrite", (tx, result, abort) => {
    if (!gameId) {
      tx.objectStore("settings").delete("activeGame");
      snapshot(tx, result, null);
      return;
    }
    const request = tx.objectStore("games").get(gameId);
    request.onsuccess = () => {
      if (!request.result) { abort("El partido ya no existe. Selecciona otro."); return; }
      tx.objectStore("settings").put({ key: "activeGame", value: gameId });
      snapshot(tx, result, gameId);
    };
  });
}

export function deleteGame(gameId) {
  return transact(["games", "events", "settings"], "readwrite", (tx, result, abort) => {
    const request = tx.objectStore("games").get(gameId);
    request.onsuccess = () => {
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
    };
  });
}

export function addEvent(event, allowedShots = event.tiros_permitidos) {
  if (![2, 3].includes(event.valor_tiro) || !["anotado", "fallado"].includes(event.resultado) ||
      (allowedShots && !allowedShots.includes(event.valor_tiro))) {
    return Promise.reject(new Error("El resultado no está permitido para esta acción."));
  }
  return transact(["games", "events"], "readwrite", (tx, result, abort) => {
    const game = tx.objectStore("games").get(event.gameId);
    game.onsuccess = () => {
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
    };
  });
}

export function removeLastGameEvent(gameId) {
  return transact(["games", "events"], "readwrite", (tx, result, abort) => {
    const game = tx.objectStore("games").get(gameId);
    game.onsuccess = () => {
      if (!game.result) { abort("El partido fue eliminado. No se puede deshacer."); return; }
      const range = IDBKeyRange.bound([gameId, 0], [gameId, Number.MAX_SAFE_INTEGER]);
      const request = tx.objectStore("events").index("byGameSeq").openCursor(range, "prev");
      request.onsuccess = () => {
        const cursor = request.result;
        result(cursor?.value ?? null);
        if (cursor) cursor.delete();
      };
    };
  });
}

// Snapshot del partido capturado al pulsar Exportar, independiente del activeGame
// que pueda cambiar en otra pestaña durante la lectura.
export function readExportSnapshot(gameId) {
  if (!gameId) return Promise.reject(new Error("Selecciona o crea un partido."));
  return transact(["games", "events"], "readonly", (tx, result, abort) => {
    const game = tx.objectStore("games").get(gameId);
    game.onsuccess = () => {
      if (!game.result) { abort("El partido ya no existe. No se ha exportado ningún dato."); return; }
      const range = IDBKeyRange.bound([gameId, 0], [gameId, Number.MAX_SAFE_INTEGER]);
      const events = tx.objectStore("events").index("byGameSeq").getAll(range);
      events.onsuccess = () => result({ game: game.result, events: events.result });
    };
  });
}

// Lectura general disponible para comprobaciones, nunca usada por la descarga.
export function allEvents() {
  return transact(["events"], "readonly", (tx, result) => {
    const request = tx.objectStore("events").getAll();
    request.onsuccess = () => result(request.result);
  });
}
