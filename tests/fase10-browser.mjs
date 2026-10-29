// Fase 10 · Vaciar partido e indicador de guardado. Perfil aislado, datos ficticios, sin cuenta.
import * as store from "../js/persistencia.js";
import { page, until, assert } from "./ui-fixture.mjs";
const checks = [];
const pass = message => { checks.push(message); document.querySelector("#results").textContent = checks.join("\n"); };
async function shots(ui, count) {
  for (let i = 0; i < count; i++) {
    ui.q('[data-action="transicion_bajo_aro"]').click();
    ui.q(`[data-points="2"][data-result="${i % 2 ? "anotado" : "fallado"}"]`).click(); await ui.idle();
  }
}
const ids = async gameId => (await store.allEvents()).filter(event => event.gameId === gameId).map(event => event.id);
try {
  assert(location.hostname === "127.0.0.1" && new URLSearchParams(location.search).get("isolated") === "1", "Perfil aislado obligatorio");
  await store.openDatabase();
  assert(!(await store.readState()).games.length, "Base no vacía: se detiene");
  const a = await page();

  // Indicador: «Guardado» solo para lectores de pantalla; visible únicamente con error.
  const other = await a.create("10", "Otro ficticio");
  await shots(a, 2);
  const status = a.q("#saveStatus"), view = a.frame.contentWindow;
  assert(a.q("#saveStatusText").textContent === "Guardado en este dispositivo", "Anuncio accesible de guardado perdido");
  assert(status.getAttribute("role") === "status" && status.getAttribute("aria-live") === "polite", "Región accesible ausente");
  assert(status.getBoundingClientRect().width <= 1 && view.getComputedStyle(status).clip !== "auto", "Indicador permanente visible");
  pass("Guardado: sin indicador visible, anuncio «Guardado localmente» para lectores de pantalla");

  const game = await a.create("10", "Vaciar ficticio");
  assert(a.q("#clearGameBtn").disabled, "Vaciar habilitado sin tiros");
  await shots(a, 5);
  assert(!a.q("#clearGameBtn").disabled, "Vaciar deshabilitado con tiros");
  const otherBefore = await ids(other);

  // Confirmación: identifica el partido y el número de tiros; Cancelar es la acción destacada.
  a.q("#clearGameBtn").click();
  const dialog = a.q("#clearGameDialog");
  assert(dialog.open && a.q("#clearGameMessage").textContent.includes("5 tiros") && a.q("#clearGameMessage").textContent.includes("J10 · Vaciar ficticio"), "Diálogo sin partido o recuento");
  assert(a.frame.contentDocument.activeElement === a.q("#cancelClearBtn") && a.q("#cancelClearBtn").classList.contains("pill-primary"), "Cancelar no es la acción destacada");
  a.q("#cancelClearBtn").click();
  assert(!dialog.open && (await ids(game)).length === 5, "Cancelar modificó datos");
  pass("Diálogo: partido J10 · Vaciar ficticio, 5 tiros, foco y énfasis en Cancelar; cancelar no cambia nada");

  // Exportar antes desde el propio diálogo.
  let downloads = 0;
  const anchor = view.HTMLAnchorElement.prototype, click = anchor.click;
  anchor.click = function () { if (this.download) { downloads++; return; } return click.call(this); };
  a.q("#clearGameBtn").click(); a.q("#clearExportBtn").click(); await a.idle();
  anchor.click = click;
  assert(downloads === 1 && dialog.open && (await ids(game)).length === 5, "Exportar antes no descargó o cerró el diálogo");
  pass("Exportar CSV antes: descarga sin cerrar el diálogo ni borrar");

  // Aborto real a mitad de la transacción: no se borra ningún tiro.
  const proto = view.IDBObjectStore.prototype, remove = proto.delete;
  let deletes = 0;
  proto.delete = function (key) { if (this.name === "events" && ++deletes === 3) { this.transaction.abort(); return {}; } return remove.call(this, key); };
  a.q("#confirmClearBtn").click(); await a.idle();
  proto.delete = remove;
  assert((await ids(game)).length === 5 && a.q("#clearGameError").textContent.includes("No se ha vaciado") && a.q("#saveStatus").classList.contains("is-error"), "Aborto borró tiros o no avisó: " + JSON.stringify([deletes, (await ids(game)).length, a.q("#clearGameError").textContent, a.q("#saveStatus").className, dialog.open]));
  pass("Atomicidad: un aborto en el tercer borrado conserva los 5 tiros y muestra el error");

  // Otra pestaña registra antes de confirmar: no se borra nada que el usuario no haya visto.
  const b = await page(true);
  await b.select(game); await shots(b, 1);
  await until(() => a.q("#gameTotal").textContent.endsWith("/6"));
  a.q("#confirmClearBtn").click(); await a.idle();
  // El diálogo se abrió con 5: la confirmación se rechaza sin borrar y el recuento pasa a 6.
  await until(() => a.q("#clearGameError").textContent.includes("ha cambiado"));
  assert((await ids(game)).length === 6 && dialog.open && a.q("#clearGameMessage").textContent.includes("6 tiros") &&
    a.q("#clearGameError").textContent.includes("ha cambiado"), "Vació tiros no vistos o no actualizó el recuento");
  a.q("#confirmClearBtn").click(); await a.idle();
  pass("Cambio en otra pestaña: el diálogo se actualiza y solo se vacía lo confirmado");

  // Doble toque de confirmación: una única operación.
  assert(!dialog.open && (await ids(game)).length === 0, "No se vació el partido");
  const state = await store.readState();
  assert(state.games.some(g => g.id === game && g.jornada === "10" && g.rival === "Vaciar ficticio"), "Se perdió el partido");
  assert(JSON.stringify(await ids(other)) === JSON.stringify(otherBefore), "Afectó a otro partido");
  assert(a.q("#undoBtn").disabled && a.q("#clearGameBtn").disabled && a.q("#gameTotal").textContent.endsWith("—") && a.q("#scoreboardValue").textContent === "—", "Deshacer o estadísticas no quedan a cero");
  await until(() => b.q("#gameTotal").textContent.endsWith("—"));
  await a.load(); await a.select(game);
  assert((await ids(game)).length === 0 && a.q("#undoBtn").disabled && a.q("#gameSelect").value === game, "Recarga recupera tiros o pierde el partido");
  pass("Vaciado: conserva ID/jornada/rival, otro partido intacto, Deshacer vacío, totales a cero, otra pestaña y recarga coherentes");

  await shots(a, 2);
  a.q("#clearGameBtn").click();
  a.q("#confirmClearBtn").click(); a.q("#confirmClearBtn").click(); await a.idle();
  assert((await ids(game)).length === 0 && !a.q("#clearGameDialog").open && !a.q("#feedback").classList.contains("is-error"), "Doble toque falló");
  await shots(a, 1);
  a.q("#undoBtn").click(); await a.idle();
  assert((await ids(game)).length === 0, "Deshacer tras vaciar");
  pass("Doble toque en Vaciar: una operación; registrar y deshacer después funcionan");
  b.frame.contentWindow.close();
  window.phase10Result = { ok: true, checks };
} catch (error) { window.phase10Result = { ok: false, checks, error: error.stack }; }
document.querySelector("#results").textContent = JSON.stringify(window.phase10Result, null, 2);
