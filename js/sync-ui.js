import { openDatabase } from './persistencia.js';
import { loadFirestoreTransport } from './firestore-sync.js';
import { createSyncEngine } from './sync-engine.js';

import { setStorageIdentity, setStorageScope, storageContext, assertContext, cachedTeams, cacheTeams,
  syncPreference, listLegacyForImport, legacyImportIssue, importLegacy, listPending } from './sync-storage.js';

// Fase 10: los controles viven en el menú de perfil (antes en «⋯»). Este módulo solo informa del estado;
// cuenta-ui decide qué se ve (un punto en el avatar únicamente cuando hay un problema).
const FRIENDLY = {
  unavailable: 'Sin conexión con el servidor. Los cambios se subirán solos al recuperarla.',
  'permission-denied': 'Este equipo no permite el acceso con esta cuenta.',
  SYNC_CONFLICT: 'Hay un cambio que no coincide con el del servidor. Se conserva la copia local.'
};
export function initializeSyncUI(controller, { host = document.querySelector('#profileSync'), onState = () => {}, onNeedTeam = () => {} } = {}) {
  if (!host) return null;
  const section = document.createElement('div'); section.className = 'sync-controls'; section.hidden = true;
  section.innerHTML = `<p id="syncDetail" class="sync-detail" aria-live="polite"></p>
    <button id="syncEnable" class="menu-item" type="button">Activar sincronización</button>
    <div id="syncOptions" class="sync-options" hidden><label class="sync-team"><span>Equipo</span> <select id="syncTeam"><option value="">Solo local</option></select></label>
    <button id="syncCreateTeam" class="menu-item" type="button">Crear equipo</button>
    <button id="syncImport" class="menu-item" type="button" disabled>Revisar partidos locales</button>
    <button id="syncRetry" class="menu-item" type="button" disabled>Reintentar sincronización</button>
    <button id="syncDisable" class="menu-item" type="button">Desactivar sincronización aquí</button></div>`;
  host.append(section);
  const dialog = document.createElement('dialog'); dialog.className = 'game-dialog sync-dialog';
  dialog.setAttribute('aria-labelledby', 'syncReviewTitle');
  dialog.innerHTML = `<h2 id="syncReviewTitle">Subir partidos a tu cuenta</h2><p id="syncDestination"></p>
    <p>Revisa los partidos de este navegador. Se conservarán sus datos originales; iPad y ordenador tienen bases distintas. Continúa después desde el equipo sincronizado.</p>
    <div id="syncReviewList"></div><p id="syncImportError" role="alert"></p>
    <div class="dialog-buttons"><button id="syncCancel" class="pill" type="button">Cancelar</button>
    <button id="syncConfirm" class="pill pill-new" type="button">Confirmar subida de los seleccionados</button></div>`;
  document.body.append(dialog);
  const $ = id => document.getElementById(id);
  let uid = null, accountVersion = -1, generation = 0, transport, engine, teams = [], user, review, reviewContext;
  let connected = false, teamBusy = false, importOffer = false, stopping = Promise.resolve();
  let lastAccount;
  let restoring = false, restoreError = '';
  let label = 'Solo local', detail = '', pending = 0, blocked = 0, pendingSince = null;
  const consentKey = uid => 'defensas-sync-consent:' + JSON.stringify([storageContext().projectId, uid]);
  const consent = uid => { try { return localStorage.getItem(consentKey(uid)) === 'enabled'; } catch { return false; } };
  const emit = () => onState({ signedIn: Boolean(uid), active: Boolean(storageContext().scope), connected, label, detail,
    pending, blocked, pendingSince, uid, restoring, restoreError, error: label === 'Error de sincronización' });
  async function countPending() {
    const c = storageContext();
    if (!c.scope) { pending = 0; blocked = 0; pendingSince = null; emit(); return; }
    try {
      const ops = await listPending(c);
      if (c !== storageContext()) return;
      pending = ops.length; blocked = ops.filter(op => op.blocked).length;
      pendingSince = pending ? Math.min(...ops.map(op => op.createdAt)) : null;
      emit();
    } catch { /* El recuento es informativo; el guardado local no depende de él. */ }
  }
  const status = (text, info = '') => {
    label = text; detail = FRIENDLY[info] || info;
    $('cloudStatus').textContent = text; $('syncDetail').textContent = detail;
    emit(); void countPending();
  };
  function reset() {
    restoring = false; restoreError = '';
    generation++; stopping = engine?.stop() ?? Promise.resolve(); engine = null; transport = null; teams = [];
    if (dialog.open) dialog.close(); review = null; connected = false;
    $('syncTeam').innerHTML = '<option value="">Solo local</option>';
    $('syncImport').disabled = true; $('syncRetry').disabled = true;
    status('Solo local');
  }
  function renderTeams() {
    const selected = storageContext().teamId || '';
    $('syncTeam').replaceChildren(new Option('Solo local', ''), ...teams.map(team => new Option(team.name, team.id)));
    $('syncTeam').value = selected;
    $('syncCreateTeam').disabled = !transport || !connected || teamBusy;
    $('syncImport').disabled = !storageContext().scope;
    $('syncRetry').disabled = !engine;
  }
  function runEngine() {
    engine?.stop(); engine = null;
    if (storageContext().scope && transport) {
      engine = createSyncEngine(transport, { onStatus: status }); void engine.start();
    }
    renderTeams();
  }
  // «Subir a mi cuenta» desde la pregunta inicial: se abre la revisión cuando haya equipo y conexión.
  function maybeOffer() {
    if (!importOffer || !uid || !connected) return;
    if (storageContext().scope) { importOffer = false; void openReview(true); return; }
    status('Solo local', 'Crea o elige un equipo para subir los partidos de este dispositivo.');
    onNeedTeam();
  }
  async function choose(teamId, save = true) {
    const ticket = generation;
    if (teamId && !teams.some(team => team.id === teamId)) throw Error('Equipo desconocido.');
    engine?.stop(); engine = null;
    // La copia verificada permite registrar offline. El servidor revalida cada envío.
    setStorageScope(teamId || null);
    if (save) await syncPreference(uid, teamId || null);
    if (ticket !== generation) return;
    status(teamId ? 'Pendiente de sincronizar' : 'Solo local'); runEngine();
    maybeOffer();
  }
  function accountChanged(state) {
    lastAccount = state;
    const next = state.status === 'ready' && !state.busy ? state.user?.uid || null : null;
    if (next === uid && state.sessionVersion === accountVersion) return;
    reset(); uid = next; user = state.user; accountVersion = state.sessionVersion;
    restoring = Boolean(uid);
    if (!uid) importOffer = false;
    setStorageIdentity(uid); section.hidden = !uid;
    emit();
    if (!uid) return;
    const enabled = consent(uid);
    $('syncEnable').hidden = enabled;
    $('syncOptions').hidden = !enabled;
    if (!enabled) {
      restoring = false;
      setStorageScope(null);
      status('Solo local', 'La sincronización está desactivada en este navegador. Tus partidos locales se conservan.');
      return;
    }
    const ticket = generation;
    void (async () => {
      await openDatabase();
      const cached = await cachedTeams(uid); if (ticket !== generation) return; teams = cached;
      renderTeams();
      const preference = await syncPreference(uid);
      if (ticket !== generation) return;
      if (teams.some(team => team.id === preference)) await choose(preference, false);
      if (ticket !== generation) return;
      // Con el equipo recordado en caché se puede registrar offline sin esperar
      // al transporte. Sin preferencia, el ámbito de cuenta local es intencional.
      if (!preference || storageContext().scope) { restoring = false; emit(); }
      try {
        const backend = await loadFirestoreTransport(uid); if (ticket !== generation) return;
        transport = backend; connected = true; runEngine();
        const remoteTeams = await backend.teams(); if (ticket !== generation) return;
        teams = remoteTeams; await cacheTeams(uid, teams);
        if (storageContext().scope && !teams.some(team => team.id === storageContext().teamId)) {
          restoring = true; emit();
          await choose('', false);
        }
        // Tras cerrar sesión la lista de equipos se borra: el equipo preferido se recupera con la del servidor.
        else if (!storageContext().scope && teams.some(team => team.id === preference)) await choose(preference, false);
        if (ticket !== generation) return;
        if (restoring && preference && !storageContext().scope) throw Error('El equipo seleccionado ya no está disponible.');
        restoring = false; restoreError = '';
        renderTeams(); emit(); maybeOffer();
      } catch (error) { if (ticket === generation) {
        connected = false;
        if (restoring) { restoring = false; restoreError = 'No se ha podido recuperar tu equipo. Reintenta o continúa sin cuenta.'; }
        status('Error de sincronización', error.message); renderTeams();
      } }
    })().catch(error => { if (ticket === generation) {
      restoring = false; restoreError = 'No se ha podido recuperar tu equipo. Reintenta o continúa sin cuenta.';
      status('Error de sincronización', error.message);
    } });
  }
  controller.subscribe(accountChanged);
  function changeConsent(enabled) {
    if (!uid) return;
    try {
      localStorage.setItem(consentKey(uid), enabled ? 'enabled' : 'disabled');
      accountVersion = -1;
      accountChanged(lastAccount);
    } catch { status('Solo local', 'No se pudo guardar la activación. Puedes seguir registrando localmente.'); }
  }
  $('syncEnable').addEventListener('click', () => changeConsent(true));
  $('syncDisable').addEventListener('click', () => changeConsent(false));
  globalThis.addEventListener('storage', event => {
    if (uid && event.key === consentKey(uid)) { accountVersion = -1; accountChanged(lastAccount); }
  });
  $('syncTeam').addEventListener('change', () => { void choose($('syncTeam').value).catch(error => status('Error de sincronización', error.message)); });
  $('syncCreateTeam').addEventListener('click', () => {
    // Formulario nativo independiente: no altera las dos pulsaciones de registro.
    const name = window.prompt('Nombre del equipo que crearás como propietario:');
    if (!name?.trim() || teamBusy || !transport) return;
    teamBusy = true; renderTeams(); const ticket = generation, backend = transport;
    void backend.createTeam(name).then(async team => {
      if (ticket !== generation) return;
      teams.push(team); await cacheTeams(uid, teams); if (ticket !== generation) return;
      await choose(team.id);
    }).catch(error => { if (ticket === generation) status('Error de sincronización', error.message); })
      .finally(() => { teamBusy = false; renderTeams(); });
  });
  $('syncRetry').addEventListener('click', () => { void engine?.retry().catch(error => status('Error de sincronización', error.message)); });
  globalThis.addEventListener('defensas-sync-local', () => { engine?.wake(); void countPending(); });
  globalThis.addEventListener('online', () => { engine?.wake(); emit(); });
  globalThis.addEventListener('offline', emit);
  function openReview(preselect = false) {
    reviewContext = storageContext();
    return listLegacyForImport().then(items => {
      assertContext(reviewContext); review = items;
      const team = teams.find(team => team.id === reviewContext.teamId);
      $('syncDestination').textContent = `Cuenta: ${user.email || user.uid} · Equipo: ${team?.name || reviewContext.teamId} · Proyecto: ${reviewContext.projectId}`;
      $('syncReviewList').replaceChildren();
      for (const [index, item] of items.entries()) {
        const label = document.createElement('label'), checkbox = document.createElement('input');
        checkbox.type = 'checkbox'; checkbox.value = String(index);
        const issue = legacyImportIssue(item); checkbox.disabled = Boolean(issue);
        checkbox.checked = preselect && !issue;
        label.append(checkbox, document.createTextNode(` J${item.game.jornada} · ${item.game.rival} · ${item.events.length} eventos${issue ? ' · ' + issue : ''}`));
        $('syncReviewList').append(label);
      }
      $('syncImportError').textContent = items.length ? '' : 'No hay partidos locales disponibles para esta cuenta.';
      dialog.showModal();
    }).catch(error => status('Error de sincronización', error.message));
  }
  $('syncImport').addEventListener('click', () => { void openReview(false); });
  $('syncCancel').addEventListener('click', () => dialog.close());
  $('syncConfirm').addEventListener('click', () => {
    const c = reviewContext;
    const chosen = [...$('syncReviewList').querySelectorAll('input:checked')].map(input => review[Number(input.value)]);
    $('syncConfirm').disabled = true;
    void importLegacy(chosen, c, true).then(() => { assertContext(c); dialog.close(); engine?.wake(); })
      .catch(error => { $('syncImportError').textContent = error.message; })
      .finally(() => { $('syncConfirm').disabled = false; });
  });
  emit();
  return {
    // Cerrar sesión: espera a que el motor termine su ciclo antes de borrar los datos de la cuenta.
    async quiesce() { const current = engine?.stop(); engine = null; await Promise.all([stopping, current]); },
    offerImport() { importOffer = true; if (!uid) return; if (!consent(uid)) changeConsent(true); else maybeOffer(); },
    refresh: countPending
  };
}
