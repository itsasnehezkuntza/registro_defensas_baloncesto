import * as store from "../js/persistencia.js";
import { parseConfiguration } from "../js/configuracion.js";
import { summarize, outcomeText } from "../js/estadisticas.js";
import { matchesEvent } from "../js/identidad.js";
import { page, until, assert } from "./ui-fixture.mjs";
const results = [];
const output = document.querySelector("#results");
const pass = message => { results.push(message); output.textContent = results.join("\n"); };
function action(ui, category, id, defense = null) {
  return ui.q(`[data-category="${category}"][data-action="${id}"]${defense ? `[data-strategy="${defense}"]` : ""}`);
}
function result(ui, points, outcome) { return ui.q(`[data-points="${points}"][data-result="${outcome}"]`); }
async function shoot(ui, category, id, defense, points, outcome) {
  action(ui, category, id, defense).click(); // Primera pulsación.
  assert(action(ui, category, id, defense).getAttribute("aria-pressed") === "true", "Selección no resaltada");
  result(ui, points, outcome).click(); // Segunda pulsación.
  await ui.idle();
  assert(ui.all(".result-btn").every(button => button.disabled), "Resultados sin selección habilitados");
  assert(!ui.q('[aria-pressed="true"]'), "Selección no consumida");
}
try {
  assert(location.hostname === "127.0.0.1" && new URLSearchParams(location.search).get("isolated") === "1", "Requiere perfil aislado y loopback");
  await store.openDatabase();
  assert(!(await store.readState()).games.length, "Base no vacía: pruebas canceladas");
  const config = parseConfiguration(await (await fetch("../categorias.csv")).text());
  const a = await page();
  result(a,2,"anotado").disabled = false;
  result(a,2,"anotado").click(); await a.idle();
  assert(!(await store.allEvents()).length, "Registro sin partido");
  const first = await a.create("Fase 3", "Pruebas");
  let count = 0, expectedPoints = 0;
  for (const category of config.categories) for (const item of category.actions) {
    for (const defense of (item.defenses.length ? item.defenses : [null])) {
      const shots = defense?.shots ?? item.shots;
      action(a, category.id, item.id, defense?.id).click();
      for (const button of a.all(".result-btn")) {
        assert(button.disabled === !shots.includes(Number(button.dataset.points)), "Permisos incorrectos: " + JSON.stringify({action:item.id,points:button.dataset.points,disabled:button.disabled,description:a.q("#selectedDescription").textContent,active:a.q("#gameSelect").value,busy:a.q("#gameSelect").disabled}));
      }
      // El botón cambiado desde código tampoco permite el resultado inválido.
      const invalid = a.all(".result-btn").find(button => button.disabled);
      if (invalid) { invalid.disabled = false; invalid.click(); await a.idle(); assert((await store.allEvents()).length === count, "Resultado inválido registrado"); }
      for (const points of shots) for (const outcome of ["anotado", "fallado"]) {
        // Selección previa usada para permisos: cancelar y volver a seleccionar.
        if (a.q('[aria-pressed="true"]')) action(a,category.id,item.id,defense?.id).click();
        await shoot(a,category.id,item.id,defense?.id,points,outcome);
        count++;
        if (outcome === "anotado") expectedPoints += points;
        const events = await store.allEvents();
        assert(events.length === count, "Número de eventos incorrecto");
        const latest = events.at(-1);
        assert(latest.gameId === first && latest.categoria_id === category.id && latest.accion_id === item.id &&
          latest.defensa_id === (defense?.id ?? null) && latest.valor_tiro === points && latest.resultado === outcome &&
          latest.seq > 0 && latest.id && latest.fecha_hora && latest.categoria === category.name, "Evento incompleto");
        const group = events.filter(event=>matchesEvent(event,category.id,item.id,defense?.id));
        assert(action(a,category.id,item.id,defense?.id).querySelector('.action-score,.defense-score').textContent === outcomeText(summarize(group)), "Resultados no actualizados");
      }
    }
  }
  let events = await store.allEvents();
  const stats = summarize(events);
  assert(count === 104 && stats.attempts === 104 && stats.made === 52 && stats.missed === 52 && stats.pointsAllowed === expectedPoints && expectedPoints === 125, "Totales incorrectos");
  pass("1–4/7–10 · 33 combinaciones, 104 resultados válidos en dos pulsaciones; permisos, eventos y 125 puntos correctos");

  action(a,"transicion","transicion_bajo_aro").click();
  action(a,"transicion","transicion_spot_up_3").click();
  result(a,3,"fallado").click(); await a.idle();
  assert((await store.allEvents()).at(-1).accion_id === "transicion_spot_up_3", "No cambió la selección");
  const beforeDouble = (await store.allEvents()).length;
  action(a,"estatico","estatico_1c1_exterior").click();
  const made = result(a,2,"anotado"), missed = result(a,3,"fallado");
  made.click(); made.disabled = false; missed.disabled = false; made.click(); missed.click();
  await a.idle();
  assert((await store.allEvents()).length === beforeDouble + 1, "Doble toque creó duplicados");
  pass("5/6 · Doble toque y dos resultados distintos generan un solo evento; cambio de selección correcto");

  const second = await a.create("Otro", "Partido");
  assert(a.q("#undoBtn").disabled && a.q("#gameTotal").textContent === "Fallados/aciertos · —", "Partido vacío mezcla estadísticas");
  await shoot(a,"directo","pr_manejador","blue",3,"fallado");
  assert(action(a,"directo","pr_roller","blue").textContent.includes("—"), "Mezcla Blue entre tipos");
  await a.load(); a.q("#undoBtn").click(); await a.idle();
  assert(a.q("#undoBtn").disabled && (await store.readState()).events.length === 0, "Deshacer tras recarga incorrecto");
  assert((await store.allEvents()).filter(event=>event.gameId===first).length === beforeDouble+1, "Deshacer afectó otro partido");
  pass("11–13 · Deshacer tras recarga, estadísticas vacías, aislamiento de partidos y Blue por tipo");

  // El orden persistente prevalece sobre fechas invertidas.
  const base = {gameId:second,categoria:"Transición",accion:"Bajo aro",valor_tiro:2,resultado:"fallado"};
  await store.addEvent({...base,id:"order-a",fecha_hora:"2099-01-01"});
  await store.addEvent({...base,id:"order-b",fecha_hora:"2000-01-01"});
  assert((await store.removeLastGameEvent(second)).id === "order-b", "Deshacer usa fecha en lugar de seq");
  await a.load();
  const cursorPrototype = a.frame.contentWindow.IDBCursor.prototype;
  const cursorDelete = cursorPrototype.delete;
  const beforeUndoFailure = JSON.stringify(await store.allEvents());
  cursorPrototype.delete = function() {
    const request = cursorDelete.call(this);
    this.source.objectStore.transaction.abort();
    return request;
  };
  a.q("#undoBtn").click(); await a.idle();
  cursorPrototype.delete = cursorDelete;
  assert(JSON.stringify(await store.allEvents())===beforeUndoFailure &&
    a.q("#feedback").textContent.includes("No se ha podido deshacer"), "Deshacer fallido modificó datos");
  pass("11/16 · Aborto de Deshacer conserva todos los eventos y muestra error");
  const iframeStore = a.frame.contentWindow.IDBObjectStore.prototype;
  const originalAdd = iframeStore.add;
  let attempted;
  iframeStore.add = function(event, ...args) {
    if (this.name === "events") { attempted = structuredClone(event); this.transaction.abort(); return; }
    return originalAdd.call(this,event,...args);
  };
  const beforeFail = (await store.allEvents()).length;
  action(a,"transicion","transicion_bajo_aro").click(); result(a,2,"fallado").click(); await a.idle();
  iframeStore.add = originalAdd;
  assert((await store.allEvents()).length === beforeFail && a.q("#feedback").textContent.includes("No se ha guardado") &&
    !result(a,2,"fallado").disabled && a.q("#saveStatus").classList.contains("is-error"), "Fallo sin reintento o falso Guardado");
  result(a,2,"fallado").click(); await a.idle();
  events = await store.allEvents();
  assert(events.length === beforeFail+1 && events.at(-1).id === attempted.id, "Reintento perdió ID o duplicó");
  const latest = events.at(-1);
  const seq = await store.addEvent(latest);
  assert(seq === latest.seq && (await store.allEvents()).length === events.length, "Reintento de evento confirmado duplica");
  pass("12/16 · Deshacer por seq; aborto real y reintento conservan el ID y producen una sola fila");

  // Fallo de lectura tras commit: distinguir guardado de falta de refresco.
  const originalGet = iframeStore.get;
  let failRead = true;
  iframeStore.get = function(key) {
    if (this.name === "settings" && this.transaction.mode === "readonly" && failRead) { failRead=false; this.transaction.abort(); return; }
    return originalGet.call(this,key);
  };
  action(a,"transicion","transicion_bajo_aro").click(); result(a,2,"anotado").click(); await a.idle();
  iframeStore.get = originalGet;
  assert(a.q("#feedback").textContent.includes("El tiro está guardado") && a.all(".result-btn").every(button=>button.disabled), "Commit ambiguo permite duplicar");
  assert((await store.allEvents()).length === events.length+1, "Commit perdido");
  pass("16 · Fallo posterior al commit: mensaje preciso, evento conservado y selección consumida");
  const committedEvent = (await store.allEvents()).at(-1);
  const duplicateSeqs = await Promise.all([store.addEvent(committedEvent), store.addEvent(committedEvent)]);
  assert(duplicateSeqs.every(seq=>seq===committedEvent.seq) && (await store.allEvents()).length===events.length+1,
    "Dos reintentos simultáneos duplicaron un ID");
  let conflict = false;
  try { await store.addEvent({...committedEvent,resultado:"fallado"}); } catch(error) { conflict=error.code==="EVENT_CONFLICT"; }
  assert(conflict && (await store.allEvents()).at(-1).resultado==="anotado", "ID conflictivo alteró evento confirmado");
  pass("4/15 · Reintentos simultáneos idempotentes; ID conflictivo rechazado sin sobrescribir");

  failRead = true;
  iframeStore.get = function(key) {
    if (this.name === "settings" && this.transaction.mode === "readonly" && failRead) { failRead=false; this.transaction.abort(); return; }
    return originalGet.call(this,key);
  };
  const beforeCommittedUndo = (await store.allEvents()).length;
  a.q("#undoBtn").click(); await a.idle();
  iframeStore.get = originalGet;
  assert((await store.allEvents()).length===beforeCommittedUndo-1 &&
    a.q("#feedback").textContent.includes("Deshacer está guardado"), "Deshacer confirmado se presenta como abortado");
  pass("11/16 · Fallo de refresco tras Deshacer distingue la eliminación confirmada");


  const b = await page(true);
  action(a,"estatico","estatico_1c1_exterior").click();
  await shoot(b,"estatico","estatico_cortes",null,2,"fallado");
  await until(()=>!a.q("#gameSelect").disabled && action(a,"estatico","estatico_1c1_exterior").getAttribute("aria-pressed")==="true");
  const burst = new BroadcastChannel("registro-defensivo-changes");
  burst.postMessage({gameId:second}); burst.postMessage({gameId:second}); burst.close();
  await new Promise(resolve=>setTimeout(resolve,60));
  await a.idle();
  assert(action(a,"estatico","estatico_1c1_exterior").getAttribute("aria-pressed")==="true",
    "Avisos simultáneos perdieron la selección");
  result(a,3,"anotado").click(); await a.idle();
  await until(()=>!b.q("#gameSelect").disabled && b.q("#gameTotal").textContent===a.q("#gameTotal").textContent);
  pass("15 · Dos pestañas: eventos y estadísticas compartidos, sin perder una selección del mismo partido");

  // Transacción bloqueada para registrar mientras otra pestaña cambia de partido.
  const database = await new Promise((resolve,reject)=>{const request=indexedDB.open("registro_defensivo_baloncesto",1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  const beforeConcurrent = await store.allEvents();
  const lock = database.transaction(["games","events","settings"],"readwrite");
  let hold = true;
  function keepAlive() { const request=lock.objectStore("games").get(second); request.onsuccess=()=>{if(hold)keepAlive();}; }
  keepAlive();
  action(a,"transicion","transicion_bajo_aro").click(); result(a,2,"fallado").click();
  const switched = b.select(first);
  await new Promise(resolve=>setTimeout(resolve,80));
  assert(a.q("#saveStatus").classList.contains("is-saving"), "Indica Guardado antes del commit");
  hold = false;
  await a.idle(); await switched;
  const afterConcurrent = await store.allEvents();
  assert(afterConcurrent.length===beforeConcurrent.length+1 &&
    afterConcurrent.at(-1).gameId===second, "Cambio de partido cruzó el evento pendiente");
  pass("15 · Guardado bajo latencia y cambio de partido: ID capturado y sin falso Guardado");
  database.close();

  const doomed = await a.create("Carrera", "Borrado");
  await until(()=>b.q("#gameSelect").value===doomed && !b.q("#gameSelect").disabled);
  action(a,"transicion","transicion_bajo_aro").click();
  const removing = store.deleteGame(doomed);
  result(a,2,"fallado").click();
  await removing; await a.idle();
  assert(!(await store.allEvents()).some(event=>event.gameId===doomed), "Registro en partido eliminado desde otra pestaña");
  pass("15/16 · Borrado concurrente rechaza el registro y conserva el resto");
  b.frame.contentWindow.close();

  await a.select(first);
  const renamed = await page(false,"rename");
  assert(action(renamed,"transicion","transicion_bajo_aro").textContent.includes("Cerca del aro"), "Renombrado no aplicado");
  const original = (await store.allEvents()).filter(event=>event.gameId===first);
  const savedSnapshot=JSON.stringify(original);
  const retired = await page(false,"retire");
  assert(!action(retired,"transicion","transicion_bajo_aro") && retired.q("#gameTotal").textContent === 'Fallados/aciertos · ' + outcomeText(summarize(original)), "Retirada pierde eventos en total");
  assert(JSON.stringify((await store.allEvents()).filter(event=>event.gameId===first))===savedSnapshot, "CSV alteró históricos");
  const changedShots = await page(false,"shots");
  action(changedShots,"transicion","transicion_bajo_aro").click();
  assert(result(changedShots,2,"anotado").disabled && !result(changedShots,3,"anotado").disabled, "Permisos no proceden del CSV");
  pass("14/18 · Eventos v1 y con IDs; renombrado, retirada y cambio de permisos preservan el histórico");
  await a.select(""); result(a,2,"anotado").disabled=false;result(a,2,"anotado").click();await a.idle();
  assert((await store.allEvents()).length===beforeDouble+1+(await store.allEvents()).filter(event=>event.gameId===second).length,"Registró sin selección válida");
  pass("17 · Sin partido activo tampoco registra un botón alterado desde código");
  window.phase3Result={ok:true,results};
} catch(error) { window.phase3Result={ok:false,results,error:error.stack}; output.textContent += "\nERROR: "+error.stack; }
