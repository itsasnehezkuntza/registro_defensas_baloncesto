// Ejecutar solo en servidor loopback y perfil aislado. Nunca borra una base.
import * as store from "../js/persistencia.js";
const results = [];
const output = document.querySelector("#results");
function assert(condition, message) { if (!condition) throw new Error(message); }
function pass(message) { results.push(message); output.textContent = results.join("\n"); }
const pause = () => new Promise(resolve => setTimeout(resolve, 25));
async function until(fn) {
  for (let i = 0; i < 400; i++) { if (fn()) return; await pause(); }
  throw new Error("Tiempo agotado esperando la interfaz");
}
async function page(tab = false) {
  localStorage.setItem("defensas-account-mode", "local");
  let frame;
  if (tab) {
    const popup = window.open("about:blank", "_blank");
    assert(popup, "No se pudo abrir la segunda pestaña de pruebas");
    frame = {
      contentWindow: popup,
      get contentDocument() { return popup.document; },
      set src(url) { popup.location.href = url; }
    };
  } else {
    frame = document.createElement("iframe");
    frame.style.cssText = "width:1200px;height:850px";
    document.body.append(frame);
  }
  async function load() {
    const previousDocument = frame.contentDocument;
    frame.src = new URL("../index.html?t=" + crypto.randomUUID(), location.href).href;
    await until(() => frame.contentDocument !== previousDocument &&
      frame.contentDocument.querySelector("#newGameBtn")?.disabled === false);
  }
  await load();
  const q = selector => frame.contentDocument.querySelector(selector);
  const all = selector => [...frame.contentDocument.querySelectorAll(selector)];
  const idle = () => until(() => !q("#gameSelect").disabled);
  async function select(id) { q("#gameSelect").value = id; q("#gameSelect").dispatchEvent(new Event("change")); await idle(); }
  async function create(round, rival) {
    q("#newGameBtn").click();
    q("#roundInput").value = round; q("#rivalInput").value = rival;
    q("#newGameForm").requestSubmit(); q("#newGameForm").requestSubmit();
    await idle(); return q("#gameSelect").value;
  }
  async function shoot() {
    q('[data-category="directo"][data-action="pr_roller"][data-strategy="blue"]').click();
    assert(q('[data-points="3"]').disabled, "Roller habilitó 3P");
    q('[data-points="2"][data-result="fallado"]').click(); await idle();
  }
  return { frame, q, all, idle, load, select, create, shoot };
}

try {
  assert(location.hostname === "127.0.0.1" && new URLSearchParams(location.search).get("isolated") === "1", "Requiere loopback y ?isolated=1 en un perfil de pruebas");
  await store.openDatabase();
  assert((await store.readState()).games.length === 0, "La base no está vacía: no se harán pruebas destructivas");
  const a = await page();
  assert(a.q("#gameSelect").value === "", "Se seleccionó un partido ficticio");
  assert(a.all(".action-btn,.defense-btn,.result-btn,#undoBtn,#deleteGameBtn,#exportCsvBtn").every(button => button.disabled), "Registro sin partido habilitado");
  assert(a.all(".action-btn,.defense-btn").length === 33, "Configuración alterada");
  a.q('[data-points="2"]').click();
  assert((await store.allEvents()).length === 0, "Se registró sin partido");
  pass("1/12/13 · Sin partidos: 33 combinaciones presentes, registro y herramientas bloqueados");

  a.q("#newGameBtn").click();
  a.q("#roundInput").value = "   "; a.q("#rivalInput").value = "   ";
  a.q("#newGameForm").requestSubmit(); await pause();
  assert((await store.readState()).games.length === 0, "Se aceptaron campos vacíos");
  a.q("#cancelNewGameBtn").click();
  const first = await a.create("  Final  ", "  Rival  ");
  let state = await store.readState();
  assert(first && state.currentGameId === first && state.games[0].jornada === "Final" && state.games[0].rival === "Rival", "Creación o trim incorrectos");
  assert(state.events.length === 0 && !a.q("#deleteGameBtn").disabled, "Creación no habilitó partido vacío");
  pass("2 · Creación obligatoria, validación, trim, ID y selección persistida");
  await a.load(); assert(a.q("#gameSelect").value === first, "No recuperó selección");
  pass("3 · Recarga recupera partido activo");
  await a.shoot(); await a.shoot();
  const originalEvents = await store.allEvents();
  await a.load();
  assert((await store.readState()).events.length === 2 && a.q("#gameTotal").textContent === "Anotados/intentos · 0/2", "Recarga perdió resultados");
  a.q("#undoBtn").click(); await a.idle();
  assert((await store.allEvents()).length === 1, "Deshacer tras recarga incorrecto");
  pass("6/7 · Eventos y orden recuperados; deshacer tras recarga funciona");

  const second = await a.create("Final", "Rival");
  assert(second !== first && a.q("#gameSelect").options.length === 3, "Partidos iguales se deduplicaron");
  await a.shoot();
  await a.select(first); assert((await store.readState()).events.length === 1 && a.q("#gameTotal").textContent === "Anotados/intentos · 0/1", "Mezcla de eventos");
  await a.select(second); assert((await store.readState()).events.every(e => e.gameId === second), "Partido incorrecto");
  pass("4/5 · Dos partidos con mismos nombres, IDs distintos y eventos aislados");

  // Cambios rápidos programáticos para ejercitar la cola y la última intención.
  for (const id of [first, second, first]) {
    a.q("#gameSelect").value = id; a.q("#gameSelect").dispatchEvent(new Event("change"));
  }
  await a.idle();
  assert(a.q("#gameSelect").value === first && (await store.readState()).currentGameId === first, "Selección antigua sobrescribió la nueva");
  pass("14 · Selecciones rápidas conservan la última intención");
  const selectionStore = a.frame.contentWindow.IDBObjectStore.prototype;
  const selectionPut = selectionStore.put;
  let failNextSelection = true;
  selectionStore.put = function(value, ...args) {
    if (this.name === "settings" && failNextSelection) {
      failNextSelection = false;
      this.transaction.abort();
      return;
    }
    return selectionPut.call(this, value, ...args);
  };
  for (const id of [second, first, second]) {
    a.q("#gameSelect").value = id; a.q("#gameSelect").dispatchEvent(new Event("change"));
  }
  await a.idle();
  selectionStore.put = selectionPut;
  assert(a.q("#gameSelect").value === second && (await store.readState()).currentGameId === second,
    "Un fallo antiguo sobrescribió la selección más reciente");
  await a.select(first);
  pass("14 · Un fallo de selección antiguo no sobrescribe una intención posterior");


  const before = JSON.stringify(await store.allEvents());
  a.q("#deleteGameBtn").click();
  assert(a.q("#deleteGameMessage").textContent.includes("Final - Rival"), "Confirmación no identifica partido");
  a.q("#cancelDeleteBtn").click();
  a.q("#confirmDeleteBtn").click();
  assert(JSON.stringify(await store.allEvents()) === before && (await store.readState()).games.length === 2, "Cancelar modificó datos");
  pass("8 · Cancelar borrado no cambia datos");

  const b = await page(true);
  a.q("#deleteGameBtn").click(); a.q("#confirmDeleteBtn").click(); a.q("#confirmDeleteBtn").click();
  await a.idle();
  await until(() => b.q("#gameSelect").value === "" && !b.q("#gameSelect").disabled);
  state = await store.readState();
  assert(state.games.length === 1 && state.games[0].id === second && !state.currentGameId, "Eliminación o selección incorrecta");
  assert((await store.allEvents()).every(e => e.gameId === second), "El borrado afectó otros eventos");
  assert((await store.allEvents()).length === 1, "Perdió datos del partido restante");
  assert(a.q("#gameSelect").value === "" && b.q("#deleteGameBtn").disabled, "Pestaña obsoleta mantiene partido válido");
  await a.load();
  assert(a.q("#gameSelect").value === "" && a.q("#gameSelect").options.length === 2, "Partido reapareció o selección automática");
  pass("9/10/11 · Borrado confirmado, aislado y persistente; otra pestaña se bloquea");
  let rejected = false;
  try { await store.addEvent({...originalEvents[0],id:crypto.randomUUID(),seq:undefined,gameId:first}); } catch { rejected = true; }
  assert(rejected && (await store.allEvents()).length === 1, "Evento insertado en partido eliminado");
  pass("14 · Transacción impide registrar en partido eliminado");

  // Fallos de escritura reales: DataCloneError y aborto posterior a escrituras.
  const previous = JSON.stringify(await store.readState());
  try { await store.createGameAndSelect({id:"bad",jornada:"X",rival:"Y",bad:()=>{}}); } catch {}
  assert(JSON.stringify(await store.readState()) === previous, "Creación fallida dejó selección/partido parcial");
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(value, ...args) {
    if (this.name === "settings") { this.transaction.abort(); return; }
    return put.call(this,value,...args);
  };
  try { await store.createGameAndSelect({id:"abort-create",jornada:"X",rival:"Y"}); } catch {}
  IDBObjectStore.prototype.put = put;
  assert(JSON.stringify(await store.readState()) === previous, "Aborto no revirtió creación");
  pass("14 · Fallo y aborto de creación revierten partido y selección atómicamente");

  await a.select(second);
  const iframeStore = a.frame.contentWindow.IDBObjectStore.prototype;
  const iframeDelete = iframeStore.delete;
  const beforeDeleteFailure = JSON.stringify(await store.readState());
  iframeStore.delete = function(key) {
    const request = iframeDelete.call(this,key);
    if (this.name === "games") this.transaction.abort();
    return request;
  };
  a.q("#deleteGameBtn").click(); a.q("#confirmDeleteBtn").click(); await a.idle();
  iframeStore.delete = iframeDelete;
  assert(JSON.stringify(await store.readState()) === beforeDeleteFailure, "Fallo de UI borró datos");
  assert(a.q("#deleteGameDialog").open && a.q("#deleteGameError").textContent && a.q("#saveStatus").classList.contains("is-error"), "UI ocultó fallo o indicó guardado");
  a.q("#cancelDeleteBtn").click();
  const del = IDBObjectStore.prototype.delete;
  const stable = JSON.stringify(await store.readState());
  IDBObjectStore.prototype.delete = function(key) {
    const request = del.call(this,key); if (this.name === "games") this.transaction.abort(); return request;
  };
  try { await store.deleteGame(second); } catch {}
  IDBObjectStore.prototype.delete = del;
  assert(JSON.stringify(await store.readState()) === stable, "Borrado fallido perdió datos");
  const cursorDelete = IDBCursor.prototype.delete;
  IDBCursor.prototype.delete = function() {
    const request = cursorDelete.call(this);
    this.source.objectStore.transaction.abort();
    return request;
  };
  try { await store.deleteGame(second); } catch {}
  IDBCursor.prototype.delete = cursorDelete;
  assert(JSON.stringify(await store.readState()) === stable, "Aborto durante borrado de eventos perdió datos");
  pass("14 · Aborto de borrado, también durante la cascada de eventos, conserva todos los datos");
  // Fallo de creación desde la interfaz: conserva formulario, datos y error.
  const iframePut = iframeStore.put;
  const beforeCreateFailure = JSON.stringify(await store.readState());
  iframeStore.put = function(value, ...args) {
    if (this.name === "settings") { this.transaction.abort(); return; }
    return iframePut.call(this, value, ...args);
  };
  a.q("#newGameBtn").click();
  a.q("#roundInput").value = "Fallida"; a.q("#rivalInput").value = "Fallida";
  a.q("#newGameForm").requestSubmit(); await a.idle();
  iframeStore.put = iframePut;
  assert(JSON.stringify(await store.readState()) === beforeCreateFailure, "Creación fallida en UI alteró datos");
  assert(a.q("#newGameDialog").open && a.q("#newGameError").textContent &&
    a.q("#saveStatus").classList.contains("is-error"), "UI no muestra error de creación");
  a.q("#cancelNewGameBtn").click();
  pass("14 · Fallo de creación en UI: formulario recuperable y sin falso Guardado");


  // Compatibilidad: crear un registro con el formato v1 y los nombres de ejemplo.
  const legacy = {id:"legacy",jornada:"1",rival:"Rival por definir",createdAt:"2020-01-01"};
  await store.createGameAndSelect(legacy);
  const oldEvent = {id:"legacy-event",gameId:legacy.id,categoria:"Transición",accion:"Bajo aro",valor_tiro:2,resultado:"fallado",fecha_hora:"2020-01-01T00:00:00Z"};
  await store.addEvent(oldEvent);
  await a.load();
  assert(a.q("#gameSelect").value === legacy.id, "No recupera partido v1");
  assert(a.q('[data-action="transicion_bajo_aro"] .action-score').textContent === '0/1', "No interpreta evento v1");
  assert((await store.allEvents()).some(e => e.id === oldEvent.id && !e.categoria_id), "Reescribió evento v1");
  pass("Compatibilidad · Partidos de ejemplo y eventos v1 conservados sin migración");

  const race = {id:"race",jornada:"Concurrencia",rival:"Prueba",createdAt:new Date().toISOString()};
  await store.createGameAndSelect(race);
  const deletions = await Promise.allSettled([store.deleteGame(race.id), store.deleteGame(race.id)]);
  assert(deletions.filter(result=>result.status==="fulfilled").length === 1, "Se ejecutaron dos borrados del mismo partido");
  assert((await store.readState()).games.some(game=>game.id === "legacy"), "La concurrencia afectó el histórico");
  pass("14 · Dos eliminaciones simultáneas: solo una confirma; el histórico permanece");
  b.frame.contentWindow.close();
  window.phase2Result = {ok:true,results};
  output.textContent += "\nFASE 2: PRUEBAS SUPERADAS";
} catch(error) {
  window.phase2Result = {ok:false,results,error:error.stack};
  output.textContent += "\nERROR: " + error.stack;
}
