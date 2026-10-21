import { resolveSelection, makeShotEvent } from "./js/registro.js";
import { initializeLayout, initializeMenu } from "./js/interfaz.js";
import { initializeViews } from "./js/vistas.js";
import { renderDashboard } from "./js/dashboard.js";
import { loadConfigurationSource } from "./js/configuracion.js";
import { matchesEvent } from "./js/identidad.js";
import { summarize, attemptsMarkup, pointsAttempted } from "./js/estadisticas.js";
import { simpleActionsMarkup, directMatrixMarkup, updateRegistrationMarkup } from "./js/registro-vista.js";
import { fitRegistro } from "./js/distribucion.js";
import { loadButtonConfiguration, recordGameUsage, readGameUsage, versionForGame, configurationFromDoc, currentVersion, onConfigChange } from "./js/configuracion-guardada.js";
import { initializeEditor } from "./js/editor.js";
import { buildCsv, csvFilename, triggerDownload } from "./js/exportacion.js";
import { openDatabase, readState, createGameAndSelect, selectGameState,
  deleteGame, clearGameEvents, readExportSnapshot, addEvent, removeLastGameEvent } from "./js/persistencia.js";
import { storageContext, assertContext, canonical } from "./js/sync-storage.js";
import { panelSnapshot } from "./js/panel-model.js";


const $ = (selector) => document.querySelector(selector);
const accountBlocked = () => document.documentElement.hasAttribute("data-login");

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
let clearTarget = null;
let channel;
let saveError = false;
let mutationQueue = Promise.resolve();
let feedbackVersion = 0;
let activeView = "registro";
// Fase 9B: configuración de botones guardada (versiones), CSV inicial y versión usada por partido.
let buttonRecord = null;
let buttonVersion = null;
let csvSource = null;
let gameUsage = {};
let fitState = null;
let gameOptionsMarkup = null;
let lastAppliedContext = null;
let configurationContext = null;
const FIT_QUERY = "(min-width: 900px) and (min-height: 560px), (min-width: 700px) and (min-height: 900px)";

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
  const context = storageContext();
  pendingOperations++;
  busy = true;
  renderSelection();
  setSaveStatus("saving");
  const operation = mutationQueue.catch(() => {}).then(async () => {
    if (accountBlocked()) throw Object.assign(Error("Espera a recuperar la sesión o continúa sin cuenta."), { code: "SCOPE_CHANGED" });
    assertContext(context);
    const result = await task();
    assertContext(context);
    return result;
  });
  mutationQueue = operation;
  return operation.finally(() => {
    pendingOperations--;
    busy = pendingOperations > 0;
    if (!busy) selectionPending = false;
    renderSelection();
  });
}

function applyState(state, { keepSelection = false } = {}) {
  const c = storageContext();
  if ((state.scope ?? null) !== c.scope || (state.scopeVersion !== undefined && state.scopeVersion !== c.version)) {  return; }
  const previousSelection = keepSelection && state.currentGameId === currentGameId ? chosen : null;
  const previousConfiguration = configuration;
  if (state.currentGameId !== currentGameId) pendingShot = null;
  games = state.games;
  currentGameId = state.currentGameId;
  events = state.events;
  chosen = null;
  if (deletionTarget && !gameById(deletionTarget.id)) {
    $("#deleteGameDialog").close();
    deletionTarget = null;
  }
  if (clearTarget && (clearTarget.id !== currentGameId || !gameById(clearTarget.id))) $("#clearGameDialog").close();
  syncGameConfiguration();
  if (previousSelection) chosen = resolveSelection(configuration, previousSelection);
  render({ preserveControls: keepSelection && previousConfiguration === configuration });
  lastAppliedContext = c;

}

function markSaved() {
  if (pendingOperations <= 1) setSaveStatus("saved");
}

function notifyChange(gameId, deleted = false) {
  const message = { gameId, deleted, scope: storageContext().scope, stamp: uniqueId() };
  if (channel) channel.postMessage(message);
  else {
    try { localStorage.setItem("defensas-change", JSON.stringify(message)); } catch {}
  }
}

async function refreshState() {
  if (!storageReady) {  return; }
  const ticket = ++revision;
  const context = storageContext();

  try {
    // Lectura serializada con las escrituras, sin fingir guardado ni bloquear pulsaciones.
    const operation = mutationQueue.catch(() => {}).then(async () => {
      assertContext(context);
      const state = await readState();
      if (csvSource && (buttonRecord || context.scope)) {
        const loaded = await loadButtonConfiguration(csvSource ?? {});
        if (configurationContext !== context || loaded.record.revision !== buttonRecord?.revision || loaded.record.currentId !== buttonRecord?.currentId) {
          useButtonConfiguration(loaded); lastAppliedContext = null;
        }
        const previousUsage = canonical(gameUsage); await refreshUsage();
        if (previousUsage !== canonical(gameUsage)) lastAppliedContext = null;
      }

      assertContext(context);
      if (ticket === revision) {
        if (lastAppliedContext === context && canonical([state.games, state.currentGameId, state.events]) === canonical([games, currentGameId, events])) {  return; }
        applyState(state, { keepSelection: true });
      }
    });
    mutationQueue = operation;
    await operation;
  } catch (error) {

    if (error.code === 'SCOPE_CHANGED') return;
    storageReady = false;
    setSaveStatus("error");
    setFeedback(error.message, "error");
    renderSelection();
  }
}

function receiveChange(message) {
  if ((message?.scope ?? null) !== storageContext().scope) return;
  if (message?.deleted && message.gameId === currentGameId) {
    currentGameId = null;
    chosen = null;
    events = [];
    render();
  }
  refreshState();
}

function bindSynchronization() {
  window.addEventListener('defensas-account-access', () => {
    chosen = null; pendingShot = null;
    if (accountBlocked()) {
      for (const id of ['#newGameDialog', '#deleteGameDialog', '#clearGameDialog']) if ($(id).open) $(id).close();
    }
    renderSelection();
    if (!accountBlocked()) requestAnimationFrame(refit);
  });

  window.addEventListener('defensas-scope-change', () => {
    ++revision;
    currentGameId = null; games = []; events = []; chosen = null; pendingShot = null; deletionTarget = null;
    for (const id of ['#newGameDialog', '#deleteGameDialog', '#clearGameDialog']) if ($(id).open) $(id).close();
    render(); void refreshState();
  });
  window.addEventListener('defensas-sync-remote', () => {  notifyChange(currentGameId); void refreshState(); });
  // Importación/otras escrituras locales también actualizan la vista; no dependen de un eco remoto.
  window.addEventListener('defensas-sync-local', () => { notifyChange(currentGameId); void refreshState(); });
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
  // V4 muestra «Guardado»; «localmente» se conserva para lectores de pantalla.
  if (!description && status === "saved") $("#saveStatusText").innerHTML = 'Guardado<span class="sr-only"> localmente</span>';
  else $("#saveStatusText").textContent = description || ({ saving: "Guardando…", error: "Error al guardar" })[status];
}

function setFeedback(message, type = "normal") {
  feedbackVersion += 1;
  const element = $("#feedback");
  element.textContent = message;
  element.classList.toggle("is-success", type === "success");
  element.classList.toggle("is-error", type === "error");
  // Reinicia la animación de desaparición aunque se repita el mismo tipo de aviso.
  if (element.style && element.offsetWidth !== undefined) {
    element.style.animation = "none";
    void element.offsetWidth;
    element.style.animation = "";
  }
  const statsFeedback = $("#statisticsFeedback");
  if (statsFeedback) {
    statsFeedback.textContent = type === "normal" ? "" : message;
    statsFeedback.classList.toggle("is-success", type === "success");
    statsFeedback.classList.toggle("is-error", type === "error");
  }
}

function gameById(id) {
  return games.find((game) => game.id === id);
}

function labelForGame(game) {
  return `J${game.jornada || "—"} · ${game.rival || "Sin rival"}`;
}

function renderGameOptions() {
  const selector = $("#gameSelect");
  const markup = '<option value="">Selecciona o crea un partido</option>' + games
    .slice()
    .sort((a, b) => String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")))
    .map(game => `<option value="${htmlSafe(game.id)}">${htmlSafe(labelForGame(game))}</option>`)
    .join("");
  if (markup !== gameOptionsMarkup) { selector.innerHTML = markup; gameOptionsMarkup = markup; }
  selector.value = currentGameId || "";
}

async function selectGame(gameId) {
  if (accountBlocked()) return;
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
    if (error.code === 'SCOPE_CHANGED') return;
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
  if (accountBlocked()) return;
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
  if (accountBlocked()) return;
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
      const state = await createGameAndSelect(game, panelSnapshot(buttonRecord));
      try { gameUsage = (await recordGameUsage(game.id, buttonRecord && currentVersion(buttonRecord).id)) ?? gameUsage; } catch {}
      applyState(state);
      $("#newGameDialog").close();
      markSaved();
      setFeedback("Partido creado.", "success");
      notifyChange(game.id);
    });
  } catch (error) {
    if (error.code === 'SCOPE_CHANGED') return;
    $("#newGameError").textContent = "No se ha creado el partido. " + error.message;
    setSaveStatus("error");
    setFeedback("No se ha podido crear el partido.", "error");
  }
}

function askDeleteGame() {
  if (accountBlocked()) return;
  const game = gameById(currentGameId);
  if (busy || !storageReady || !game) return;
  deletionTarget = { ...game };
  $("#deleteGameMessage").textContent = `¿Seguro que quieres eliminar el partido ${game.jornada} - ${game.rival}? También se eliminarán todas sus acciones defensivas registradas. Esta operación no se puede deshacer.`;
  $("#deleteGameError").textContent = "";
  $("#deleteGameDialog").showModal();
  $("#cancelDeleteBtn").focus();
}

async function confirmDeleteGame() {
  if (accountBlocked()) return;
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
    if (error.code === 'SCOPE_CHANGED') return;
    $("#deleteGameError").textContent = "No se ha eliminado el partido. " + error.message;
    setSaveStatus("error");
    setFeedback("No se ha podido eliminar el partido.", "error");
    if (error.code === "GAME_NOT_FOUND") await refreshState();
  }
}

// Fase 10: vaciar partido. Conserva el partido (ID, jornada, rival) y borra todos sus tiros de forma atómica.
function clearMessage(game, count) {
  const account = storageContext().scope ? " También se borrarán en tus otros dispositivos con esta cuenta." : "";
  return `Se borrarán los ${count === 1 ? "1 tiro" : count + " tiros"} de ${labelForGame(game)}. El partido se conserva (jornada y rival) para empezar de cero.${account} Esta operación no se puede deshacer.`;
}

function askClearGame() {
  if (accountBlocked()) return;
  const game = gameById(currentGameId);
  if (busy || !storageReady || !game || !events.length) return;
  clearTarget = { id: game.id, ids: events.map(event => event.id) };
  $("#clearGameMessage").textContent = clearMessage(game, events.length);
  $("#clearGameError").textContent = "";
  $("#clearGameDialog").showModal();
  $("#cancelClearBtn").focus();
}

async function confirmClearGame() {
  if (accountBlocked()) return;
  if (busy || !storageReady || !clearTarget || !$("#clearGameDialog").open) return;
  const { id: gameId, ids } = clearTarget;
  ++revision;
  chosen = null;
  pendingShot = null;
  try {
    await queueOperation(async () => {
      const state = await clearGameEvents(gameId, ids);
      $("#clearGameDialog").close();
      applyState(state);
      markSaved();
      setFeedback("Partido vaciado: se han borrado sus tiros.", "success");
      notifyChange(gameId);
    });
  } catch (error) {
    if (error.code === 'SCOPE_CHANGED') return;
    setSaveStatus("error");
    if (error.code === "GAME_CHANGED") {
      await refreshState();
      const game = gameById(gameId);
      if (game && $("#clearGameDialog").open) {
        clearTarget = { id: gameId, ids: events.map(event => event.id) };
        $("#clearGameMessage").textContent = clearMessage(game, events.length);
      }
    }
    $("#clearGameError").textContent = "No se ha vaciado el partido. " + error.message;
    setFeedback("No se ha podido vaciar el partido.", "error");
    if (error.code === "GAME_NOT_FOUND") await refreshState();
  }
}

function categoryFor(id) {
  return configuration?.categories.find(category => category.id === id);
}

function isChosen(category, action, strategy = null) {
  return chosen?.category === category && chosen?.actionId === action && chosen?.strategyId === strategy;
}

function buildSimpleActions(category, targetId, preserveControls = false) {
  const actions = categoryFor(category)?.actions ?? [];
  const markup = simpleActionsMarkup(category, actions,
    id => summarize(events.filter(event => matchesEvent(event, category, id))), id => isChosen(category, id));
  if (!preserveControls || !updateRegistrationMarkup($(targetId), markup)) $(targetId).innerHTML = markup;
}

function buildDirectActions(preserveControls = false) {
  const actions = categoryFor("directo")?.actions ?? [];
  const markup = directMatrixMarkup(actions, {
    statFor: (action, defense) => summarize(events.filter(event => matchesEvent(event, "directo", action, defense))),
    typeStat: action => summarize(events.filter(event => matchesEvent(event, "directo", action))),
    chosen, isChosen: (action, defense) => isChosen("directo", action, defense)
  });
  if (!preserveControls || !updateRegistrationMarkup($("#directActions"), markup)) $("#directActions").innerHTML = markup;
}

// Distribución adaptable: filas equilibradas y pasos 0–3 hasta que todo cabe (js/distribucion.js).
function refit() {
  const root = $("#registrationView");
  if (!root?.getClientRects || root.hidden || !configuration) return;
  delete root.dataset.fits;
  const result = fitRegistro(root, { narrow: root.clientWidth < 660, checkHeight: matchMedia(FIT_QUERY).matches });
  if (!result) return;
  fitState = result;
  root.dataset.rows = String(result.rows);
  root.dataset.fits = String(result.fits);
}

// Estadísticas de cada partido con la configuración con la que registró (las anteriores no se reescriben).
// Fase 9C: cada partido registra y muestra Estadísticas con su propia configuración de pantalla.
// Sin partido activo se muestra la predeterminada (la que recibirán los partidos nuevos).
function syncGameConfiguration() {
  if (!buttonRecord) return;
  const version = currentGameId ? versionForGame(buttonRecord, gameUsage, currentGameId, events.length > 0) : currentVersion(buttonRecord);
  if (version.id === buttonVersion?.id && configuration) return;
  buttonVersion = version;
  configuration = configurationFromDoc(version.doc);
  if (chosen) chosen = resolveSelection(configuration, chosen);
}

function statsConfiguration() {
  return configuration;
}

async function refreshUsage() {
  try { gameUsage = await readGameUsage(); } catch { gameUsage = {}; }
}

function useButtonConfiguration(loaded) {
  configurationContext = storageContext();
  buttonRecord = loaded.record;
  if (loaded.usage) gameUsage = loaded.usage;
  buttonVersion = loaded.version;
  configuration = loaded.configuration;
  // Una selección que ya no existe en la nueva configuración se descarta.
  if (chosen) chosen = resolveSelection(configuration, chosen);
  pendingShot = null;
}

// Otra pestaña (o el editor) ha guardado: se relee sin recargar la página.
async function reloadButtonConfiguration() {
  try {
    useButtonConfiguration(await loadButtonConfiguration(csvSource ?? {}));
    await refreshUsage();
    syncGameConfiguration();
    render();
  } catch (error) { setFeedback(error.message, "error"); }
}

function renderSelection() {
  const locked = busy || accountBlocked();
  $("#selectedCategory").textContent = chosen ? categoryFor(chosen.category).name : "Selección";
  const selectedText = chosen
    ? `${chosen.action}${chosen.strategy ? ` · ${chosen.strategy}` : ""}`
    : (gameById(currentGameId) ? "Selecciona una acción o defensa" : "Selecciona o crea un partido");
  $("#selectedDescription").textContent = selectedText;
  for (const button of $("#resultButtons").querySelectorAll("button")) {
    button.disabled = activeView !== "registro" || locked || !storageReady || !configuration || !gameById(currentGameId) || !chosen || !chosen.shots.includes(Number(button.dataset.points));
  }
  document.querySelectorAll(".action-btn, .defense-btn").forEach(button => {
    button.disabled = locked || !storageReady || !configuration || !gameById(currentGameId);
  });
  const hasGame = storageReady && Boolean(gameById(currentGameId));
  $("#undoBtn").disabled = locked || !hasGame || events.length === 0;
  $("#deleteGameBtn").disabled = locked || !hasGame;
  // Vaciar solo tiene sentido con tiros.
  $("#clearGameBtn").disabled = locked || !hasGame || events.length === 0;
  $("#noGameNotice").hidden = Boolean(hasGame);
  $("#noGameNotice").textContent = activeView === "estadisticas"
    ? "Selecciona o crea un partido para consultar sus estadísticas."
    : "Selecciona o crea un partido para registrar.";
  $("#gameSelect").disabled = locked || !storageReady;
  $("#newGameBtn").disabled = locked || !storageReady;
  for (const id of ["#createGameBtn", "#confirmDeleteBtn", "#cancelNewGameBtn", "#cancelDeleteBtn", "#roundInput", "#rivalInput",
    "#confirmClearBtn", "#cancelClearBtn", "#clearExportBtn"]) $(id).disabled = locked;
  $("#exportCsvBtn").disabled = locked || !hasGame;
  // Fase 9D: un partido con tiros no puede cambiar su panel (deshacer, eliminar o crear otro partido).
  const panelLocked = hasGame && events.length > 0;
  $("#editButtonsBtn").disabled = locked || !storageReady || panelLocked;
  $("#editLockNote").hidden = !panelLocked;
  const statsState = $("#statisticsState");
  if (statsState) {
    statsState.textContent = !storageReady ? "Estadísticas no actualizadas: almacenamiento no disponible." : "";
    statsState.hidden = !statsState.textContent;
  }
}

function render({ preserveControls = false } = {}) {
  renderGameOptions();
  for (const [id, title] of [["transicion", "#transitionTitle"], ["estatico", "#staticTitle"], ["directo", "#directTitle"]]) {
    if (categoryFor(id)) ($(title).querySelector?.(".category-title") || $(title)).textContent = categoryFor(id).name.toUpperCase();
  }
  buildSimpleActions("transicion", "#transitionActions", preserveControls);
  buildSimpleActions("estatico", "#staticActions", preserveControls);
  buildDirectActions(preserveControls);
  for (const [category, id] of [
    ["transicion", "#transitionTotal"], ["estatico", "#staticTotal"], ["directo", "#directTotal"]
  ]) {
    $(id).innerHTML = attemptsMarkup(summarize(events.filter((e) => matchesEvent(e, category))));
  }
  const total = summarize(events);
  $("#gameTotal").innerHTML = `Anotados/intentos · ${total.attempts ? `<b class="made">${total.made}</b>/<b>${total.attempts}</b>` : "—"}`;
  // Marcador: puntos concedidos / puntos intentados (suma de valores 2/3).
  const scoreboard = $("#scoreboardValue");
  if (scoreboard) {
    const attempted = pointsAttempted(events);
    scoreboard.innerHTML = events.length ? `<span class="made">${total.pointsAllowed}</span>/${attempted}` : "—";
    scoreboard.setAttribute?.("aria-label", events.length ? `${total.pointsAllowed} puntos concedidos de ${attempted} intentados` : "Sin tiros registrados");
  }
  renderSelection();
  refit();
  renderDashboard(statsConfiguration(), events, gameById(currentGameId));
}

function onActionPick(button) {
  if (accountBlocked()) return;
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
  if (accountBlocked()) return;
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
      await addEvent(event, selection.shots, buttonRecord && buttonVersion ? { version: buttonVersion, usedIds: buttonRecord.usedIds } : null);
      committed = true;
      pendingShot = null;
      try { gameUsage = (await recordGameUsage(game.id, buttonVersion?.id)) ?? gameUsage; } catch {}
      notifyChange(game.id);
      applyState(await readState());
      markSaved();
      setFeedback("Tiro registrado.", "success");
    });
  } catch (error) {
    if (error.code === 'SCOPE_CHANGED') return;
    if (error.code === "EVENT_CONFLICT") pendingShot = null;
    if (!committed && currentGameId === game.id && error.code !== "GAME_NOT_FOUND") chosen = selection;
    // La selección restaurada permite repetir con una sola pulsación (la relectura puede no volver a pintar).
    renderSelection();
    setSaveStatus("error");
    setFeedback(committed ? "El tiro está guardado, pero no se han podido actualizar las estadísticas. Recarga para recuperarlas."
      : error.code === "GAME_NOT_FOUND" ? error.message
      : "No se ha guardado el tiro. Vuelve a pulsar el resultado para reintentarlo.", "error");
    await refreshState();
  }
}

async function undoLast() {
  if (accountBlocked()) return;
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
    if (error.code === 'SCOPE_CHANGED') return;
    setSaveStatus("error");
    setFeedback(committed ? "Deshacer está guardado, pero no se han podido actualizar las estadísticas. Recarga para recuperarlas."
      : error.code === "GAME_NOT_FOUND" ? error.message : "No se ha podido deshacer. Los eventos no se han modificado.", "error");
    await refreshState();
  }
}

async function exportCsv(gameId = currentGameId) {
  if (accountBlocked()) return;
  if (busy || !storageReady || !gameById(gameId)) return;
  try {
    await queueOperation(async () => {
      const snapshot = await readExportSnapshot(gameId);
      triggerDownload(csvFilename(snapshot.game), "text/csv;charset=utf-8", buildCsv(snapshot.events, snapshot.game));
      markSaved();
      setFeedback(`CSV descargado: ${snapshot.events.length} acciones de ${labelForGame(snapshot.game)}.`, "success");
    });
  } catch (error) {
    if (error.code === 'SCOPE_CHANGED') return;
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
  for (const [dialog, cancel] of [["#newGameDialog", "#cancelNewGameBtn"], ["#deleteGameDialog", "#cancelDeleteBtn"], ["#clearGameDialog", "#cancelClearBtn"]]) {
    $(cancel).addEventListener("click", () => { if (!busy) $(dialog).close(); });
    $(dialog).addEventListener("cancel", event => { if (busy) event.preventDefault(); });
    if (dialog === "#deleteGameDialog") $(dialog).addEventListener("close", () => { deletionTarget = null; });
    // El evento close llega en otra tarea: si el diálogo ya se ha reabierto, se conserva el objetivo nuevo.
    if (dialog === "#clearGameDialog") $(dialog).addEventListener("close", () => { if (!$(dialog).open) clearTarget = null; });
  }
  $("#exportCsvBtn").addEventListener("click", () => exportCsv());
  $("#clearGameBtn").addEventListener("click", askClearGame);
  $("#confirmClearBtn").addEventListener("click", confirmClearGame);
  $("#clearExportBtn").addEventListener("click", () => { if (clearTarget) void exportCsv(clearTarget.id); });
}

function onPickClick(evt) {
  const button = evt.target.closest("button[data-category][data-action]");
  if (button) onActionPick(button);
}

// Fase 10: pedir almacenamiento persistente. No bloquea ni cambia el guardado; el resultado queda en
// data-storage-persisted para diagnóstico. Safari puede negarlo fuera de la pantalla de inicio.
function requestPersistentStorage() {
  const root = document.documentElement;
  try {
    const storage = globalThis.navigator?.storage;
    if (!storage?.persist) { if (root?.dataset) root.dataset.storagePersisted = "no-disponible"; return; }
    void (storage.persisted ? storage.persisted() : Promise.resolve(false))
      .then(already => already || storage.persist())
      .then(granted => { if (root?.dataset) root.dataset.storagePersisted = granted ? "si" : "no"; })
      .catch(() => { if (root?.dataset) root.dataset.storagePersisted = "error"; });
  } catch { /* Sin efecto sobre el registro. */ }
}

async function initialize() {
  initializeLayout();
  initializeMenu();
  // Declarado antes de la navegación: una recarga en #editar abre el editor sin error.
  let editor = null;
  const views = initializeViews(view => {
    activeView = view;
    renderSelection();
    if (view === "registro") refit();
    if (view === "editar") void editor?.open();
    renderDashboard(statsConfiguration(), events, gameById(currentGameId));
  }, { canLeave: next => editor?.canLeave(next) ?? true });
  editor = initializeEditor({
    state: () => ({ buttonRecord, buttonVersion, csvSource, configuration, events, game: gameById(currentGameId), storageReady }),
    onSaved: async loaded => {
      useButtonConfiguration(loaded);
      await refreshUsage();
      syncGameConfiguration();
      render();
      setFeedback("Panel guardado: se aplica a los registros siguientes de este partido y a los partidos nuevos.", "success");
    },
    setFeedback,
    navigate: view => views.go(view)
  });
  // Girar el iPad o cambiar el tamaño de la ventana recalcula la distribución sin recargar.
  let fitFrame = 0;
  const scheduleFit = () => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(refit); };
  window.addEventListener("resize", scheduleFit);
  window.addEventListener("orientationchange", scheduleFit);
  // Las fuentes locales cambian las medidas: se recalcula al terminar cada carga.
  document.fonts?.ready?.then(scheduleFit);
  document.fonts?.addEventListener?.("loadingdone", scheduleFit);
  window.addEventListener("load", scheduleFit);
  bindEvents();
  renderSelection();
  try {
    if (!globalThis.indexedDB) throw new Error("El navegador no admite IndexedDB.");
    await openDatabase();
    requestPersistentStorage();
    const state = await readState();
    // categorias.csv es la configuración inicial; la vigente vive en IndexedDB (Fase 9B).
    try { csvSource = await loadConfigurationSource(); csvSource = { csvText: csvSource.text, csvConfiguration: csvSource.configuration }; }
    catch (error) { csvSource = { csvError: error.message }; }
    try { useButtonConfiguration(await loadButtonConfiguration(csvSource)); await refreshUsage(); }
    catch (error) {
      // Sin almacén de configuración disponible se usa el CSV, como antes de la Fase 9B.
      if (csvSource.csvConfiguration && error.message !== csvSource.csvError) configuration = csvSource.csvConfiguration;
      else configurationError = csvSource.csvError || error.message;
    }
    onConfigChange(() => { void reloadButtonConfiguration(); });
    storageReady = true;
    busy = false;
    applyState(state);
    bindSynchronization();
    if (views.current?.() === "editar") void editor.open();
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

// También se carga mediante import() después del preflight de la prueba local.
// En ese caso DOMContentLoaded ya puede haber ocurrido.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  void initialize();
}
