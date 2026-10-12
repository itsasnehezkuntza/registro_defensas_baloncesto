"use strict";

/*
 * CONFIGURACIÓN DE CATEGORÍAS
 * Para cambiar acciones o tiros permitidos, edita solamente este objeto.
 * Las estrategias son comunes a los cuatro tipos de bloqueo directo.
 */
const DEFENSE_CONFIG = Object.freeze({
  transicion: [
    { name: "Bajo aro", shots: [2] },
    { name: "Spot up 3", shots: [3] }
  ],
  estatico: [
    { name: "1c1 exterior", shots: [2, 3] },
    { name: "1c1 interior", shots: [2] },
    { name: "Pin down", shots: [2, 3] },
    { name: "Cortes", shots: [2] },
    { name: "Spot up 3", shots: [3] },
    { name: "Bajo aro", shots: [2] }
  ],
  directo: [
    { name: "PR Manejador", shots: [2, 3] },
    { name: "PR Roller", shots: [2] },
    { name: "PR Pop", shots: [2, 3] },
    { name: "Spain", shots: [2, 3] }
  ],
  estrategias: ["Black", "White", "Blue", "Red", "Tut"]
});

const DB_NAME = "registro_defensivo_baloncesto";
const DB_VERSION = 1;
const BACKUP_SCHEMA = "registro-defensivo-baloncesto";
const CATEGORY_NAMES = { transicion: "Transición", estatico: "Estático", directo: "Bloqueo directo" };
const $ = (selector) => document.querySelector(selector);

let db;
let games = [];
let currentGameId = null;
let events = [];
let chosen = null;
let busy = false;
let metadataTimer = null;
let mutationQueue = Promise.resolve();
let feedbackVersion = 0;

function htmlSafe(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function uniqueId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (x) => x.toString(16).padStart(2, "0")).join("");
}

function requestResult(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function transactionDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error("Transacción cancelada"));
    tx.onerror = () => {}; // El error se notifica al abortar la transacción.
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
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
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("Hay otra pestaña bloqueando la base de datos"));
  });
}

async function allGames() {
  return requestResult(db.transaction("games").objectStore("games").getAll());
}

async function allEvents() {
  return requestResult(db.transaction("events").objectStore("events").getAll());
}

async function eventsForGame(gameId) {
  return requestResult(
    db.transaction("events").objectStore("events").index("byGameId").getAll(IDBKeyRange.only(gameId))
  );
}

async function activeGameSetting() {
  return requestResult(db.transaction("settings").objectStore("settings").get("activeGame"));
}

async function writeActiveGame(gameId) {
  const tx = db.transaction("settings", "readwrite");
  const done = transactionDone(tx);
  tx.objectStore("settings").put({ key: "activeGame", value: gameId });
  await done;
}

function queueMutation(task) {
  const queued = mutationQueue.catch(() => {}).then(task);
  mutationQueue = queued;
  return queued;
}

function setSaveStatus(status, description) {
  const element = $("#saveStatus");
  element.classList.toggle("is-saving", status === "saving");
  element.classList.toggle("is-error", status === "error");
  $("#saveStatusText").textContent = description || ({
    saving: "Guardando…", saved: "Guardado localmente", error: "Error al guardar"
  })[status];
}

function setFeedback(message, type = "normal") {
  feedbackVersion += 1;
  const element = $("#feedback");
  element.textContent = message;
  element.classList.toggle("is-success", type === "success");
  element.classList.toggle("is-error", type === "error");
}

function gameById(id) {
  return games.find((game) => game.id === id);
}

function makeNewGame() {
  return {
    id: uniqueId(),
    jornada: "1",
    rival: "Rival por definir",
    createdAt: new Date().toISOString()
  };
}

async function addGameToDatabase(game) {
  const tx = db.transaction("games", "readwrite");
  const done = transactionDone(tx);
  tx.objectStore("games").add(game);
  await done;
}

function labelForGame(game) {
  return `J${game.jornada || "—"} · ${game.rival || "Sin rival"}`;
}

function renderGameOptions() {
  const selector = $("#gameSelect");
  selector.innerHTML = games
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((game) => `<option value="${htmlSafe(game.id)}">${htmlSafe(labelForGame(game))}</option>`)
    .join("");
  selector.value = currentGameId || "";
}

function syncGameInputs() {
  const game = gameById(currentGameId);
  $("#roundInput").value = game?.jornada ?? "";
  $("#rivalInput").value = game?.rival ?? "";
}

// Si se corrige el rival o la jornada, se corrige también esa información
// en los eventos del mismo partido (sin cambiar sus resultados ni sus IDs).
async function persistGameDetails(snapshot) {
  const tx = db.transaction(["games", "events"], "readwrite");
  const done = transactionDone(tx);
  tx.objectStore("games").put(snapshot);
  const cursorRequest = tx.objectStore("events")
    .index("byGameId").openCursor(IDBKeyRange.only(snapshot.id));
  cursorRequest.onsuccess = () => {
    const cursor = cursorRequest.result;
    if (!cursor) return;
    const updated = { ...cursor.value, jornada: snapshot.jornada, rival: snapshot.rival };
    cursor.update(updated);
    cursor.continue();
  };
  await done;
}

function queueCurrentMetadataSave() {
  const game = gameById(currentGameId);
  if (!game) return Promise.resolve();
  const snapshot = { ...game };
  setSaveStatus("saving");
  return queueMutation(() => persistGameDetails(snapshot))
    .then(async () => {
      if (currentGameId === snapshot.id) events = await eventsForGame(snapshot.id);
      setSaveStatus("saved");
    })
    .catch((error) => {
      console.error("No se pudieron guardar los datos del partido", error);
      setSaveStatus("error");
      setFeedback("No se han podido guardar la jornada o el rival.", "error");
    });
}

function flushMetadata() {
  if (metadataTimer === null) return Promise.resolve();
  clearTimeout(metadataTimer);
  metadataTimer = null;
  return queueCurrentMetadataSave();
}

function onMetadataInput() {
  const game = gameById(currentGameId);
  if (!game || busy) return;
  game.jornada = $("#roundInput").value.trim().slice(0, 32);
  game.rival = $("#rivalInput").value.trim().slice(0, 80);
  renderGameOptions();
  setSaveStatus("saving");
  if (metadataTimer !== null) clearTimeout(metadataTimer);
  metadataTimer = setTimeout(() => {
    metadataTimer = null;
    queueCurrentMetadataSave();
  }, 400);
}

async function selectGame(gameId) {
  if (!gameById(gameId) || busy) return;
  busy = true;
  renderSelection();
  try {
    await flushMetadata();
    await queueMutation(() => writeActiveGame(gameId));
    currentGameId = gameId;
    events = await eventsForGame(gameId);
    chosen = null;
    syncGameInputs();
    render();
    setSaveStatus("saved");
    setFeedback(`Partido activo: ${labelForGame(gameById(gameId))}`);
  } catch (error) {
    console.error("No se pudo abrir el partido", error);
    setSaveStatus("error");
    setFeedback("No se ha podido cambiar de partido.", "error");
    renderGameOptions();
  } finally {
    busy = false;
    renderSelection();
  }
}

async function createGame() {
  if (busy) return;
  busy = true;
  renderSelection();
  setSaveStatus("saving");
  try {
    await flushMetadata();
    const newGame = makeNewGame();
    await queueMutation(async () => {
      await addGameToDatabase(newGame);
      await writeActiveGame(newGame.id);
    });
    games.push(newGame);
    currentGameId = newGame.id;
    events = [];
    chosen = null;
    syncGameInputs();
    render();
    setSaveStatus("saved");
    setFeedback("Partido nuevo. Puedes editar la jornada y el rival antes de empezar.", "success");
    $("#rivalInput").focus();
    $("#rivalInput").select();
  } catch (error) {
    console.error("No se pudo crear el partido", error);
    setSaveStatus("error");
    setFeedback("No se ha podido crear el partido.", "error");
  } finally {
    busy = false;
    renderSelection();
  }
}

function summarize(list) {
  const attempts = list.length;
  const missed = list.filter((e) => e.resultado === "fallado").length;
  const made = attempts - missed;
  const pointsAllowed = list.reduce(
    (total, event) => total + (event.resultado === "anotado" ? event.valor_tiro : 0), 0
  );
  return { attempts, missed, made, pointsAllowed };
}

function statText(stat) {
  if (!stat.attempts) return "—";
  return `${stat.missed}/${stat.attempts} — ${Math.round(100 * stat.missed / stat.attempts)}%`;
}

function isChosen(category, action, strategy = null) {
  return chosen?.category === category && chosen?.action === action && chosen?.strategy === strategy;
}

function buildSimpleActions(category, config, targetId) {
  $(targetId).innerHTML = config.map((action) => {
    const stat = summarize(events.filter((event) => event.categoria === CATEGORY_NAMES[category] && event.accion === action.name));
    const active = isChosen(category, action.name);
    return `<button type="button" class="action-btn" data-category="${category}" data-action="${htmlSafe(action.name)}" aria-pressed="${active}">
        <span><span class="action-name">${htmlSafe(action.name)}</span><span class="action-shots">${action.shots.join("P / ")}P</span></span>
        <span class="action-score">${statText(stat)}</span>
      </button>`;
  }).join("");
}

function buildDirectActions() {
  $("#directActions").innerHTML = DEFENSE_CONFIG.directo.map((action) => {
    const typeEvents = events.filter((event) => event.categoria === CATEGORY_NAMES.directo && event.tipo_bloqueo === action.name);
    const chips = DEFENSE_CONFIG.estrategias.map((strategy) => {
      const stat = summarize(typeEvents.filter((event) => event.estrategia === strategy));
      return `<button type="button" class="defense-btn" data-category="directo" data-action="${htmlSafe(action.name)}" data-strategy="${htmlSafe(strategy)}" aria-pressed="${isChosen("directo", action.name, strategy)}">
        <span class="defense-name">${htmlSafe(strategy)}</span>
        <span class="defense-score">${statText(stat)}</span>
      </button>`;
    }).join("");
    return `<div class="direct-row">
      <div class="direct-type"><strong>${htmlSafe(action.name)}</strong><span>${action.shots.join("P / ")}P · ${statText(summarize(typeEvents))}</span></div>
      <div class="defense-options">${chips}</div>
    </div>`;
  }).join("");
}

function renderSelection() {
  const selectedText = chosen
    ? `${CATEGORY_NAMES[chosen.category]} · ${chosen.action}${chosen.strategy ? ` · ${chosen.strategy}` : ""}`
    : "Selecciona una acción o defensa";
  $("#selectedDescription").textContent = selectedText;
  for (const button of $("#resultButtons").querySelectorAll("button")) {
    button.disabled = busy || !chosen || !chosen.shots.includes(Number(button.dataset.points));
  }
  $("#undoBtn").disabled = busy || events.length === 0;
  $("#gameSelect").disabled = busy;
  $("#newGameBtn").disabled = busy;
  $("#exportCsvBtn").disabled = busy;
  $("#exportJsonBtn").disabled = busy;
  $("#importJsonBtn").disabled = busy;
}

function render() {
  renderGameOptions();
  buildSimpleActions("transicion", DEFENSE_CONFIG.transicion, "#transitionActions");
  buildSimpleActions("estatico", DEFENSE_CONFIG.estatico, "#staticActions");
  buildDirectActions();
  for (const [category, id] of [
    ["transicion", "#transitionTotal"], ["estatico", "#staticTotal"], ["directo", "#directTotal"]
  ]) {
    $(id).textContent = statText(summarize(events.filter((e) => e.categoria === CATEGORY_NAMES[category])));
  }
  const total = summarize(events);
  $("#gameTotal").textContent = `${total.attempts} intento${total.attempts === 1 ? "" : "s"} · ${statText(total)} de éxito`;
  renderSelection();
}

function onActionPick(button) {
  if (busy) return;
  const { category, action, strategy } = button.dataset;
  const config = DEFENSE_CONFIG[category]?.find((item) => item.name === action);
  if (!config || (category === "directo" && !DEFENSE_CONFIG.estrategias.includes(strategy))) return;
  const value = { category, action, strategy: category === "directo" ? strategy : null, shots: config.shots };
  chosen = isChosen(value.category, value.action, value.strategy) ? null : value;
  render();
  setFeedback(chosen ? "Selecciona uno de los resultados habilitados." : "Selección cancelada.");
}

async function addEvent(event) {
  const tx = db.transaction("events", "readwrite");
  const done = transactionDone(tx);
  const req = tx.objectStore("events").add(event);
  const seq = await requestResult(req);
  await done;
  return seq;
}

async function recordResult(points, resultado) {
  if (busy || !chosen || !chosen.shots.includes(points)) return;
  if (resultado !== "anotado" && resultado !== "fallado") return;
  busy = true;
  renderSelection();
  setSaveStatus("saving");
  const selection = { ...chosen };
  try {
    await flushMetadata();
    const game = gameById(currentGameId);
    const event = {
      id: uniqueId(),
      gameId: game.id,
      jornada: game.jornada,
      rival: game.rival,
      categoria: CATEGORY_NAMES[selection.category],
      accion: selection.action,
      tipo_bloqueo: selection.category === "directo" ? selection.action : null,
      estrategia: selection.category === "directo" ? selection.strategy : null,
      valor_tiro: points,
      resultado,
      fecha_hora: new Date().toISOString()
    };
    const seq = await queueMutation(() => addEvent(event));
    events.push({ ...event, seq });
    chosen = null;
    render();
    setSaveStatus("saved");
    setFeedback(`✓ ${selection.action}${selection.strategy ? ` · ${selection.strategy}` : ""} · ${points}${resultado === "anotado" ? "✓" : "✕"} registrado`, "success");
  } catch (error) {
    console.error("No se pudo registrar el resultado", error);
    setSaveStatus("error");
    setFeedback("Error al guardar: la acción NO ha sido registrada. Vuelve a intentarlo.", "error");
  } finally {
    busy = false;
    renderSelection();
  }
}

async function removeLastGameEvent(gameId) {
  const tx = db.transaction("events", "readwrite");
  const done = transactionDone(tx);
  const index = tx.objectStore("events").index("byGameSeq");
  const keys = IDBKeyRange.bound([gameId, 0], [gameId, Number.MAX_SAFE_INTEGER]);
  let removed = null;
  index.openCursor(keys, "prev").onsuccess = (evt) => {
    const cursor = evt.target.result;
    if (!cursor) return;
    removed = cursor.value;
    cursor.delete();
  };
  await done;
  return removed;
}

async function undoLast() {
  if (busy || events.length === 0) return;
  busy = true;
  renderSelection();
  setSaveStatus("saving");
  try {
    await flushMetadata();
    const removed = await queueMutation(() => removeLastGameEvent(currentGameId));
    if (removed) {
      events = events.filter((event) => event.id !== removed.id);
      setFeedback(`↶ Deshecho: ${removed.accion}${removed.estrategia ? ` · ${removed.estrategia}` : ""}.`, "success");
    } else {
      setFeedback("No hay registros para deshacer.");
    }
    render();
    setSaveStatus("saved");
  } catch (error) {
    console.error("No se pudo deshacer", error);
    setSaveStatus("error");
    setFeedback("No se ha podido deshacer. Ningún otro partido se ha modificado.", "error");
  } finally {
    busy = false;
    renderSelection();
  }
}

function triggerDownload(filename, mime, contents) {
  const blob = new Blob([contents], { type: mime });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10000);
}

function csvCell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  // Excel/LibreOffice: neutraliza fórmulas introducidas en campos editables.
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function safeFileStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function exportCsv() {
  if (busy) return;
  await flushMetadata();
  try {
    const records = (await allEvents()).sort((a, b) => a.seq - b.seq);
    const headers = [
      "ID evento", "ID partido", "Jornada", "Rival", "Categoría defensiva", "Acción",
      "Tipo de bloqueo", "Estrategia", "Valor tiro", "Resultado",
      "Intentos", "Anotados", "Fallados", "Puntos concedidos", "Fecha y hora (UTC)"
    ];
    const rows = records.map((event) => [
      event.id, event.gameId, event.jornada, event.rival, event.categoria, event.accion,
      event.tipo_bloqueo, event.estrategia, event.valor_tiro, event.resultado,
      1, Number(event.resultado === "anotado"), Number(event.resultado === "fallado"),
      event.resultado === "anotado" ? event.valor_tiro : 0, event.fecha_hora
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
    triggerDownload(`registro-defensivo-${safeFileStamp()}.csv`, "text/csv;charset=utf-8", csv);
    setFeedback(`CSV descargado: ${records.length} jugadas de todos los partidos.`, "success");
  } catch (error) {
    console.error("Error al exportar CSV", error);
    setFeedback("No se ha podido generar el CSV.", "error");
  }
}

async function exportJson() {
  if (busy) return;
  await flushMetadata();
  try {
    const backup = {
      schema: BACKUP_SCHEMA,
      version: 1,
      exportedAt: new Date().toISOString(),
      games: await allGames(),
      events: (await allEvents()).sort((a, b) => a.seq - b.seq).map(({ seq, ...event }) => event)
    };
    triggerDownload(`copia-registro-defensivo-${safeFileStamp()}.json`, "application/json;charset=utf-8", JSON.stringify(backup, null, 2));
    setFeedback(`Copia JSON descargada: ${backup.events.length} jugadas.`, "success");
  } catch (error) {
    console.error("Error al exportar JSON", error);
    setFeedback("No se ha podido generar la copia JSON.", "error");
  }
}

function validateBackup(backup) {
  if (!backup || backup.schema !== BACKUP_SCHEMA || backup.version !== 1 || !Array.isArray(backup.games) || !Array.isArray(backup.events)) {
    throw new Error("El JSON no es una copia compatible con esta aplicación.");
  }
  const validString = (value, max = 200) => typeof value === "string" && value.length > 0 && value.length <= max;
  const ids = new Set();
  const gameIds = new Set(games.map((game) => game.id));
  const validatedGames = backup.games.map((game) => {
    if (!validString(game.id) || typeof game.jornada !== "string" || game.jornada.length > 32 || typeof game.rival !== "string" || game.rival.length > 80 || !validString(game.createdAt, 64) || ids.has(game.id)) {
      throw new Error("La copia contiene partidos con datos no válidos.");
    }
    ids.add(game.id);
    gameIds.add(game.id);
    return { id: game.id, jornada: game.jornada, rival: game.rival, createdAt: game.createdAt };
  });
  const eventIds = new Set();
  const validatedEvents = backup.events.map((event) => {
    const category = Object.keys(CATEGORY_NAMES).find((key) => CATEGORY_NAMES[key] === event.categoria);
    const action = category && DEFENSE_CONFIG[category].find((entry) => entry.name === event.accion);
    const validStrategy = category === "directo"
      ? event.tipo_bloqueo === event.accion && DEFENSE_CONFIG.estrategias.includes(event.estrategia)
      : event.tipo_bloqueo === null && event.estrategia === null;
    if (!validString(event.id) || eventIds.has(event.id) || !validString(event.gameId) || !gameIds.has(event.gameId)
      || !action || !validStrategy || !action.shots.includes(event.valor_tiro)
      || !["anotado", "fallado"].includes(event.resultado) || typeof event.jornada !== "string"
      || typeof event.rival !== "string" || !validString(event.fecha_hora, 64)) {
      throw new Error("La copia contiene alguna jugada no válida o duplicada.");
    }
    eventIds.add(event.id);
    return {
      id: event.id, gameId: event.gameId, jornada: event.jornada, rival: event.rival,
      categoria: event.categoria, accion: event.accion,
      tipo_bloqueo: event.tipo_bloqueo, estrategia: event.estrategia,
      valor_tiro: event.valor_tiro, resultado: event.resultado, fecha_hora: event.fecha_hora
    };
  });
  return { validatedGames, validatedEvents };
}

async function importJson(file) {
  if (!file || busy) return;
  if (file.size > 30 * 1024 * 1024) {
    setFeedback("El archivo supera el límite de seguridad de 30 MB.", "error");
    return;
  }
  busy = true;
  renderSelection();
  try {
    await flushMetadata();
    const input = JSON.parse(await file.text());
    const { validatedGames, validatedEvents } = validateBackup(input);
    const existingEvents = await allEvents();
    const oldGameIds = new Set(games.map((game) => game.id));
    const oldEventIds = new Set(existingEvents.map((event) => event.id));
    const newGames = validatedGames.filter((game) => !oldGameIds.has(game.id));
    const newEvents = validatedEvents.filter((event) => !oldEventIds.has(event.id));
    setSaveStatus("saving");
    await queueMutation(async () => {
      const tx = db.transaction(["games", "events"], "readwrite");
      const done = transactionDone(tx);
      const gameStore = tx.objectStore("games");
      const eventStore = tx.objectStore("events");
      newGames.forEach((game) => gameStore.add(game));
      newEvents.forEach((event) => eventStore.add(event));
      await done;
    });
    games = await allGames();
    events = await eventsForGame(currentGameId);
    render();
    setSaveStatus("saved");
    setFeedback(`Importación completada: ${newGames.length} partidos y ${newEvents.length} jugadas nuevas (sin duplicados).`, "success");
  } catch (error) {
    console.error("Error al importar", error);
    setSaveStatus("error");
    setFeedback(`Importación cancelada: ${error.message || "archivo no válido"}`, "error");
  } finally {
    busy = false;
    renderSelection();
  }
}

function bindEvents() {
  $("#transitionActions").addEventListener("click", onPickClick);
  $("#staticActions").addEventListener("click", onPickClick);
  $("#directActions").addEventListener("click", onPickClick);
  $("#resultButtons").addEventListener("click", (evt) => {
    const button = evt.target.closest("button[data-points]");
    if (button && !button.disabled) recordResult(Number(button.dataset.points), button.dataset.result);
  });
  $("#undoBtn").addEventListener("click", undoLast);
  $("#newGameBtn").addEventListener("click", createGame);
  $("#gameSelect").addEventListener("change", (evt) => selectGame(evt.target.value));
  $("#roundInput").addEventListener("input", onMetadataInput);
  $("#rivalInput").addEventListener("input", onMetadataInput);
  $("#roundInput").addEventListener("change", flushMetadata);
  $("#rivalInput").addEventListener("change", flushMetadata);
  $("#exportCsvBtn").addEventListener("click", exportCsv);
  $("#exportJsonBtn").addEventListener("click", exportJson);
  $("#importJsonBtn").addEventListener("click", () => $("#importJsonInput").click());
  $("#importJsonInput").addEventListener("change", async (evt) => {
    const file = evt.target.files?.[0];
    evt.target.value = "";
    await importJson(file);
  });
}

function onPickClick(evt) {
  const button = evt.target.closest("button[data-category][data-action]");
  if (button) onActionPick(button);
}

async function initialize() {
  bindEvents();
  try {
    if (!globalThis.indexedDB) throw new Error("El navegador no admite IndexedDB");
    db = await openDatabase();
    games = await allGames();
    if (games.length === 0) {
      const first = makeNewGame();
      await addGameToDatabase(first);
      games.push(first);
    }
    const saved = await activeGameSetting();
    currentGameId = games.some((g) => g.id === saved?.value)
      ? saved.value
      : games.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].id;
    await writeActiveGame(currentGameId);
    events = await eventsForGame(currentGameId);
    syncGameInputs();
    render();
    setSaveStatus("saved");
  } catch (error) {
    console.error("No se pudo iniciar la aplicación", error);
    busy = true;
    setSaveStatus("error", "Guardado no disponible");
    setFeedback("Este navegador no permite guardar datos. No registres jugadas hasta solucionarlo.", "error");
    renderSelection();
    document.querySelectorAll(".field input, .action-btn, .defense-btn").forEach((element) => { element.disabled = true; });
  }
}

document.addEventListener("DOMContentLoaded", initialize);
