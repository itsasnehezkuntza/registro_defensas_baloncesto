import { resolveSelection, makeShotEvent } from "./js/registro.js";
import { initializeLayout } from "./js/interfaz.js";
import { loadConfiguration } from "./js/configuracion.js";
import { matchesEvent } from "./js/identidad.js";
import { summarize, statText } from "./js/estadisticas.js";
import { buildCsv, csvFilename, triggerDownload } from "./js/exportacion.js";
import { openDatabase, readState, createGameAndSelect, selectGameState,
  deleteGame, readExportSnapshot, addEvent, removeLastGameEvent } from "./js/persistencia.js";

const $ = (selector) => document.querySelector(selector);

let games = [];
let currentGameId = null;
let events = [];
let chosen = null;
let pendingShot = null;
let busy = true;
let configuration = null;
let configurationError = null;
let storageReady = false;
let pendingOperations = 0;
let revision = 0;
let selectionPending = false;
let deletionTarget = null;
let channel;
let saveError = false;
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

function queueOperation(task) {
  pendingOperations++;
  busy = true;
  renderSelection();
  setSaveStatus("saving");
  const operation = mutationQueue.catch(() => {}).then(task);
  mutationQueue = operation;
  return operation.finally(() => {
    pendingOperations--;
    busy = pendingOperations > 0;
    if (!busy) selectionPending = false;
    renderSelection();
  });
}

function applyState(state) {
  if (state.currentGameId !== currentGameId) pendingShot = null;
  games = state.games;
  currentGameId = state.currentGameId;
  events = state.events;
  chosen = null;
  if (deletionTarget && !gameById(deletionTarget.id)) {
    $("#deleteGameDialog").close();
    deletionTarget = null;
  }
  render();
}

function markSaved() {
  if (pendingOperations <= 1) setSaveStatus("saved");
}

function notifyChange(gameId, deleted = false) {
  const message = { gameId, deleted, stamp: uniqueId() };
  if (channel) channel.postMessage(message);
  else {
    try { localStorage.setItem("defensas-change", JSON.stringify(message)); } catch {}
  }
}

async function refreshState() {
  if (!storageReady) return;
  const ticket = ++revision;
  const previousSelection = chosen;
  const previousGameId = currentGameId;
  try {
    await queueOperation(async () => {
      const state = await readState();
      if (ticket === revision) {
        applyState(state);
        if (previousGameId === currentGameId && previousSelection) {
          chosen = resolveSelection(configuration, previousSelection);
          render();
        }
      }
      // Una actualización ajena no oculta un error local de escritura.
      if (!saveError) markSaved();
      else setSaveStatus("error");
    });
  } catch (error) {
    storageReady = false;
    setSaveStatus("error");
    setFeedback(error.message, "error");
    renderSelection();
  }
}

function receiveChange(message) {
  if (message?.deleted && message.gameId === currentGameId) {
    currentGameId = null;
    chosen = null;
    events = [];
    render();
  }
  refreshState();
}

function bindSynchronization() {
  if (globalThis.BroadcastChannel) {
    channel = new BroadcastChannel("registro-defensivo-changes");
    channel.onmessage = event => receiveChange(event.data);
  } else {
    window.addEventListener("storage", event => {
      if (event.key === "defensas-change") {
        try { receiveChange(JSON.parse(event.newValue)); } catch {}
      }
    });
  }
  window.addEventListener("focus", refreshState);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshState();
  });
  window.addEventListener("defensas-storage-closed", () => {
    storageReady = false;
    chosen = null;
    setSaveStatus("error", "Recarga la página");
    renderSelection();
  });
}

function setSaveStatus(status, description) {
  if (status === "error") saveError = true;
  if (status === "saved") saveError = false;
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

function labelForGame(game) {
  return `J${game.jornada || "—"} · ${game.rival || "Sin rival"}`;
}

function renderGameOptions() {
  const selector = $("#gameSelect");
  selector.innerHTML = '<option value="">Selecciona o crea un partido</option>' + games
    .slice()
    .sort((a, b) => String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")))
    .map(game => `<option value="${htmlSafe(game.id)}">${htmlSafe(labelForGame(game))}</option>`)
    .join("");
  selector.value = currentGameId || "";
}

async function selectGame(gameId) {
  if (!storageReady || (busy && !selectionPending)) { renderGameOptions(); return; }
  const ticket = ++revision;
  selectionPending = true;
  chosen = null;
  try {
    await queueOperation(async () => {
      const state = await selectGameState(gameId || null);
      if (ticket === revision) {
        applyState(state);
        markSaved();
      }
      notifyChange(gameId);
    });
  } catch (error) {
    if (ticket === revision) {
      try {
        const state = await readState();
        if (ticket === revision) applyState(state);
      } catch { if (ticket === revision) storageReady = false; }
      if (ticket === revision) {
        setSaveStatus("error");
        setFeedback(error.message, "error");
      }
    }
  }
}

function openNewGame() {
  if (busy || !storageReady) return;
  $("#newGameForm").reset();
  $("#roundInput").setCustomValidity("");
  $("#rivalInput").setCustomValidity("");
  $("#newGameError").textContent = "";
  $("#newGameDialog").showModal();
  $("#roundInput").focus();
}

async function createGame(event) {
  event.preventDefault();
  if (busy || !storageReady || !$("#newGameDialog").open) return;
  const round = $("#roundInput"), rival = $("#rivalInput");
  round.value = round.value.trim();
  rival.value = rival.value.trim();
  round.setCustomValidity(round.value ? "" : "Introduce la jornada.");
  rival.setCustomValidity(rival.value ? "" : "Introduce el rival.");
  if (!$("#newGameForm").reportValidity()) return;
  const game = { id: uniqueId(), jornada: round.value, rival: rival.value, createdAt: new Date().toISOString() };
  ++revision;
  chosen = null;
  try {
    await queueOperation(async () => {
      const state = await createGameAndSelect(game);
      applyState(state);
      $("#newGameDialog").close();
      markSaved();
      setFeedback("Partido creado.", "success");
      notifyChange(game.id);
    });
  } catch (error) {
    $("#newGameError").textContent = "No se ha creado el partido. " + error.message;
    setSaveStatus("error");
    setFeedback("No se ha podido crear el partido.", "error");
  }
}

function askDeleteGame() {
  const game = gameById(currentGameId);
  if (busy || !storageReady || !game) return;
  deletionTarget = { ...game };
  $("#deleteGameMessage").textContent = `¿Seguro que quieres eliminar el partido ${game.jornada} - ${game.rival}? También se eliminarán todas sus acciones defensivas registradas. Esta operación no se puede deshacer.`;
  $("#deleteGameError").textContent = "";
  $("#deleteGameDialog").showModal();
  $("#cancelDeleteBtn").focus();
}

async function confirmDeleteGame() {
  if (busy || !storageReady || !deletionTarget || !$("#deleteGameDialog").open) return;
  const gameId = deletionTarget.id;
  ++revision;
  chosen = null;
  try {
    await queueOperation(async () => {
      const state = await deleteGame(gameId);
      $("#deleteGameDialog").close();
      deletionTarget = null;
      applyState(state);
      markSaved();
      setFeedback("Partido eliminado. Selecciona o crea un partido.", "success");
      notifyChange(gameId, true);
    });
  } catch (error) {
    $("#deleteGameError").textContent = "No se ha eliminado el partido. " + error.message;
    setSaveStatus("error");
    setFeedback("No se ha podido eliminar el partido.", "error");
    if (error.code === "GAME_NOT_FOUND") await refreshState();
  }
}

function categoryFor(id) {
  return configuration?.categories.find(category => category.id === id);
}

function isChosen(category, action, strategy = null) {
  return chosen?.category === category && chosen?.actionId === action && chosen?.strategyId === strategy;
}

function buildSimpleActions(category, targetId) {
  $(targetId).innerHTML = (categoryFor(category)?.actions ?? []).map(action => {
    const stat = summarize(events.filter(event => matchesEvent(event, category, action.id)));
    return `<button type="button" class="action-btn" data-category="${category}" data-action="${htmlSafe(action.id)}" aria-pressed="${isChosen(category, action.id)}">
      <span class="action-name">${htmlSafe(action.name)}</span>
      <span class="action-score">${statText(stat)}</span>
    </button>`;
  }).join("");
}

function buildDirectActions() {
  const actions = categoryFor("directo")?.actions ?? [];
  const defenses = actions[0]?.defenses ?? [];
  const selectedDirect = chosen?.category === "directo" ? chosen : null;
  const headings = defenses.map(defense => {
    const selected = selectedDirect?.strategyId === defense.id;
    return `<span class="defense-heading${selected ? " is-axis-selected" : ""}" data-defense-heading="${htmlSafe(defense.id)}">${htmlSafe(defense.name)}</span>`;
  }).join("");
  const rows = actions.map(action => {
    const typeEvents = events.filter(event => matchesEvent(event, "directo", action.id));
    const rowSelected = selectedDirect?.actionId === action.id;
    const chips = action.defenses.map(defense => {
      const stat = summarize(typeEvents.filter(event => matchesEvent(event, "directo", action.id, defense.id)));
      return `<button type="button" class="defense-btn" data-category="directo" data-action="${htmlSafe(action.id)}" data-strategy="${htmlSafe(defense.id)}" aria-pressed="${isChosen("directo", action.id, defense.id)}">
        <span class="defense-name">${htmlSafe(defense.name)}</span>
        <span class="defense-score">${statText(stat)}</span>
      </button>`;
    }).join("");
    return `<div class="direct-row${rowSelected ? " is-axis-selected" : ""}">
      <div class="direct-type"><strong>${htmlSafe(action.name)}</strong><span>${statText(summarize(typeEvents))}</span></div>
      <div class="defense-options">${chips}</div>
    </div>`;
  }).join("");
  $("#directActions").innerHTML = `<p class="matrix-hint">Desliza lateralmente para ver todas las defensas →</p>
    <div class="direct-matrix"><div class="direct-matrix-inner">
      <div class="direct-matrix-head"><span class="direct-corner">Situación / defensa</span><div class="defense-headings">${headings}</div></div>
      ${rows}
    </div></div>`;
}

function renderSelection() {
  const selectedText = chosen
    ? `${categoryFor(chosen.category).name} · ${chosen.action}${chosen.strategy ? ` · ${chosen.strategy}` : ""}`
    : (gameById(currentGameId) ? "Selecciona una acción o defensa" : "Selecciona o crea un partido");
  $("#selectedDescription").textContent = selectedText;
  for (const button of $("#resultButtons").querySelectorAll("button")) {
    button.disabled = busy || !storageReady || !configuration || !gameById(currentGameId) || !chosen || !chosen.shots.includes(Number(button.dataset.points));
  }
  document.querySelectorAll(".action-btn, .defense-btn").forEach(button => {
    button.disabled = busy || !storageReady || !configuration || !gameById(currentGameId);
  });
  const hasGame = storageReady && Boolean(gameById(currentGameId));
  $("#undoBtn").disabled = busy || !hasGame || events.length === 0;
  $("#deleteGameBtn").disabled = busy || !hasGame;
  $("#noGameNotice").hidden = Boolean(hasGame);
  $("#gameSelect").disabled = busy || !storageReady;
  $("#newGameBtn").disabled = busy || !storageReady;
  for (const id of ["#createGameBtn", "#confirmDeleteBtn", "#cancelNewGameBtn", "#cancelDeleteBtn", "#roundInput", "#rivalInput"]) $(id).disabled = busy;
  $("#exportCsvBtn").disabled = busy || !hasGame;
}

function render() {
  renderGameOptions();
  for (const [id, title] of [["transicion", "#transitionTitle"], ["estatico", "#staticTitle"], ["directo", "#directTitle"]]) {
    if (categoryFor(id)) $(title).textContent = categoryFor(id).name.toUpperCase();
  }
  buildSimpleActions("transicion", "#transitionActions");
  buildSimpleActions("estatico", "#staticActions");
  buildDirectActions();
  for (const [category, id] of [
    ["transicion", "#transitionTotal"], ["estatico", "#staticTotal"], ["directo", "#directTotal"]
  ]) {
    $(id).textContent = statText(summarize(events.filter((e) => matchesEvent(e, category))));
  }
  const total = summarize(events);
  $("#gameTotal").textContent = `${total.attempts} intento${total.attempts === 1 ? "" : "s"} · ${statText(total)} de éxito`;
  renderSelection();
}

function onActionPick(button) {
  if (busy || !configuration || !gameById(currentGameId) || button.disabled) return;
  const { category, action, strategy } = button.dataset;
  const value = resolveSelection(configuration, { category, actionId: action, strategyId: strategy ?? null });
  if (!value) return;
  chosen = isChosen(category, action, value.strategyId) ? null : value;
  pendingShot = null;
  render();
  setFeedback(chosen ? "Selecciona uno de los resultados habilitados." : "Selección cancelada.");
}

async function recordResult(points, resultado) {
  if (busy || !storageReady || !gameById(currentGameId) || !chosen) return;
  const selection = resolveSelection(configuration, chosen);
  if (!selection || !selection.shots.includes(points) || !["anotado", "fallado"].includes(resultado)) return;
  const game = { ...gameById(currentGameId) };
  // Mantener el ID y fecha del intento fallido cuando se repite el mismo resultado.
  const event = pendingShot && pendingShot.gameId === game.id &&
    pendingShot.accion_id === selection.actionId && pendingShot.defensa_id === selection.strategyId &&
    pendingShot.valor_tiro === points && pendingShot.resultado === resultado
      ? pendingShot : makeShotEvent(uniqueId(), game, selection, points, resultado);
  pendingShot = event;
  chosen = null; // Consumir antes de esperar IndexedDB: respuesta inmediata.
  ++revision;
  render();
  let committed = false;
  try {
    await queueOperation(async () => {
      await addEvent(event, selection.shots);
      committed = true;
      pendingShot = null;
      notifyChange(game.id);
      applyState(await readState());
      markSaved();
      setFeedback("Tiro registrado.", "success");
    });
  } catch (error) {
    if (error.code === "EVENT_CONFLICT") pendingShot = null;
    if (!committed && currentGameId === game.id && error.code !== "GAME_NOT_FOUND") chosen = selection;
    setSaveStatus("error");
    setFeedback(committed ? "El tiro está guardado, pero no se han podido actualizar las estadísticas. Recarga para recuperarlas."
      : error.code === "GAME_NOT_FOUND" ? error.message
      : "No se ha guardado el tiro. Vuelve a pulsar el resultado para reintentarlo.", "error");
    await refreshState();
  }
}

async function undoLast() {
  if (busy || !storageReady || !gameById(currentGameId) || !events.length) return;
  const gameId = currentGameId;
  ++revision;
  chosen = null;
  pendingShot = null;
  let committed = false;
  try {
    await queueOperation(async () => {
      const removed = await removeLastGameEvent(gameId);
      committed = true;
      notifyChange(gameId);
      applyState(await readState());
      markSaved();
      setFeedback(removed ? "Última acción deshecha." : "No hay registros para deshacer.", "success");
    });
  } catch (error) {
    setSaveStatus("error");
    setFeedback(committed ? "Deshacer está guardado, pero no se han podido actualizar las estadísticas. Recarga para recuperarlas."
      : error.code === "GAME_NOT_FOUND" ? error.message : "No se ha podido deshacer. Los eventos no se han modificado.", "error");
    await refreshState();
  }
}

async function exportCsv() {
  if (busy || !storageReady || !gameById(currentGameId)) return;
  const gameId = currentGameId;
  try {
    await queueOperation(async () => {
      const snapshot = await readExportSnapshot(gameId);
      triggerDownload(csvFilename(snapshot.game), "text/csv;charset=utf-8", buildCsv(snapshot.events, snapshot.game));
      markSaved();
      setFeedback(`CSV descargado: ${snapshot.events.length} acciones de ${labelForGame(snapshot.game)}.`, "success");
    });
  } catch (error) {
    setSaveStatus("error");
    setFeedback(error.message, "error");
    if (error.code === "GAME_NOT_FOUND") await refreshState();
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
  $("#newGameBtn").addEventListener("click", openNewGame);
  $("#newGameForm").addEventListener("submit", createGame);
  $("#deleteGameBtn").addEventListener("click", askDeleteGame);
  $("#confirmDeleteBtn").addEventListener("click", confirmDeleteGame);
  $("#gameSelect").addEventListener("change", (evt) => selectGame(evt.target.value));
  for (const id of ["#roundInput", "#rivalInput"]) {
    $(id).addEventListener("input", () => $(id).setCustomValidity(""));
  }
  for (const [dialog, cancel] of [["#newGameDialog", "#cancelNewGameBtn"], ["#deleteGameDialog", "#cancelDeleteBtn"]]) {
    $(cancel).addEventListener("click", () => { if (!busy) $(dialog).close(); });
    $(dialog).addEventListener("cancel", event => { if (busy) event.preventDefault(); });
    if (dialog === "#deleteGameDialog") $(dialog).addEventListener("close", () => { deletionTarget = null; });
  }
  $("#exportCsvBtn").addEventListener("click", exportCsv);
}

function onPickClick(evt) {
  const button = evt.target.closest("button[data-category][data-action]");
  if (button) onActionPick(button);
}

async function initialize() {
  initializeLayout();
  bindEvents();
  renderSelection();
  try {
    if (!globalThis.indexedDB) throw new Error("El navegador no admite IndexedDB.");
    await openDatabase();
    const state = await readState();
    try { configuration = await loadConfiguration(); }
    catch (error) { configurationError = error.message; }
    storageReady = true;
    busy = false;
    applyState(state);
    bindSynchronization();
    // Releer tras suscribirse evita perder cambios de otra pestaña durante el arranque.
    await refreshState();
    if (configurationError) {
      $("#configurationError").hidden = false;
      $("#configurationError").textContent = configurationError;
      setSaveStatus("error", "Configuración incorrecta");
      setFeedback("Registro bloqueado. Corrige categorias.csv y recarga.", "error");
    } else if (storageReady) setSaveStatus("saved");
  } catch (error) {
    busy = false;
    storageReady = false;
    setSaveStatus("error", "Guardado no disponible");
    setFeedback(error.message, "error");
    renderSelection();
  }
}

document.addEventListener("DOMContentLoaded", initialize);
