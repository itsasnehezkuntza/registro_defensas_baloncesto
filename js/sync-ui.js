import { openDatabase } from './persistencia.js';
import { loadFirestoreTransport } from './firestore-sync.js';
import { createSyncEngine } from './sync-engine.js';

import { setStorageIdentity, setStorageScope, storageContext, assertContext, cachedTeams, cacheTeams,
  syncPreference, listLegacyForImport, legacyImportIssue, importLegacy, listPending } from './sync-storage.js';

// Fase 22: prepara el equipo al entrar con Google y coordina importación y Sync.
// cuenta-ui bloquea el registro hasta resolver el equipo y presenta ambos estados.
const FRIENDLY = {
  unavailable: 'Sin conexión con el servidor. Los cambios se subirán solos al recuperarla.',
  'permission-denied': 'Este equipo no permite el acceso con esta cuenta.',
  SYNC_CONFLICT: 'Hay un cambio que no coincide con el del servidor. Se conserva la copia local.'
};
export function initializeSyncUI(controller, { host = document.querySelector('#profileSync'), onState = () => {} } = {}) {
  if (!host) return null;
  const section = document.createElement('div'); section.className = 'sync-controls'; section.hidden = true;
  section.innerHTML = `<p id="syncDetail" class="sync-detail" aria-live="polite"></p>
    <div id="syncOptions" class="sync-options" hidden><label class="sync-team"><span>Equipo</span> <select id="syncTeam"><option value="" disabled>Elige un equipo</option></select></label>
    <button id="syncCreateTeam" class="menu-item" type="button">Crear equipo</button>
    <button id="syncImport" class="menu-item" type="button" disabled>Revisar partidos locales</button>
    <button id="syncRetry" class="menu-item" type="button" disabled>Reintentar sincronización</button>
    </div>`;
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
  let restoring = false, restoreError = '', needsTeam = false, choosing = false;
  const setup = $('teamSetup');
  let label = 'Guardado en este dispositivo', detail = '', pending = 0, blocked = 0, pendingSince = null;
  const emit = () => onState({ signedIn: Boolean(uid), active: Boolean(storageContext().scope), connected, label, detail,
    pending, blocked, pendingSince, uid, restoring, restoreError, needsTeam, error: label === 'Error de sincronización' });
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
    restoring = false; restoreError = ''; needsTeam = false; choosing = false; teamBusy = false;
    generation++; stopping = Promise.all([stopping, engine?.stop()]); engine = null; transport = null; teams = [];
    if (dialog.open) dialog.close(); review = null; connected = false; pending = 0; blocked = 0; pendingSince = null;
    $('syncTeam').replaceChildren(new Option('Elige un equipo', ''));
    $('syncImport').disabled = true; $('syncRetry').disabled = true;
    status('Guardado en este dispositivo');
  }
  function renderTeams() {
    const selected = storageContext().teamId || '';
    const offline = globalThis.navigator?.onLine === false;
    $('syncTeam').replaceChildren(new Option('Elige un equipo', ''), ...teams.map(team => new Option(team.name, team.id)));
    $('syncTeam').value = selected;
    $('syncTeam').options[0].disabled = true;
    $('syncTeam').disabled = choosing || teamBusy || offline;
    $('syncOptions').hidden = false;
    if (setup) {
      $('teamSetupChoice').hidden = !teams.length;
      $('teamSetupContinue').hidden = !teams.length;
      const previous = $('teamSetupSelect').value;
      $('teamSetupSelect').replaceChildren(...teams.map(team => new Option(team.name, team.id)));
      if (teams.some(team => team.id === previous)) $('teamSetupSelect').value = previous;
      $('teamSetupContinue').disabled = choosing || teamBusy || !connected || offline;
      $('teamSetupCreate').disabled = choosing || teamBusy || !connected || offline;
      $('teamSetupName').disabled = choosing || teamBusy;
    }
    $('syncCreateTeam').disabled = !transport || !connected || teamBusy || choosing || offline;
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
    status('Pendiente de sincronizar', 'Crea o elige un equipo para subir los partidos de este dispositivo.');
    needsTeam = true; emit();
  }
  async function choose(teamId, save = true, verify = true) {
    if (choosing) return;
    const ticket = generation, backend = transport;
    if (!teamId || !teams.some(team => team.id === teamId)) throw Error('Elige un equipo de esta cuenta.');
    choosing = true; renderTeams();
    try {
      if (verify && backend) await backend.verifyTeam(teamId);
      if (ticket !== generation) return;
      const previous = engine; engine = null;
      await Promise.all([stopping, previous?.stop()]);
      if (ticket !== generation) return;
      // La selección recordada y verificada permite trabajar sin conexión.
      if (save) await syncPreference(uid, teamId);
      if (ticket !== generation) return;
      setStorageScope(teamId);
      needsTeam = false; restoring = false; restoreError = '';
      status('Pendiente de sincronizar'); runEngine(); maybeOffer();
    } finally { if (ticket === generation) { choosing = false; renderTeams(); } }
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
    const ticket = generation;
    void (async () => {
      await openDatabase();
      await stopping;
      if (ticket !== generation) return;
      const cached = await cachedTeams(uid); if (ticket !== generation) return; teams = cached;
      const preference = await syncPreference(uid);
      if (ticket !== generation) return;
      // No elegir arbitrariamente entre varios equipos en una primera sesión offline.
      if (teams.some(team => team.id === preference)) await choose(preference, false, false);
      if (ticket !== generation) return;
      renderTeams();
      try {
        const backend = await loadFirestoreTransport(uid); if (ticket !== generation) return;
        transport = backend;
        const remoteTeams = await backend.teams(); if (ticket !== generation) return;
        connected = true; teams = remoteTeams; await cacheTeams(uid, teams);
        if (ticket !== generation) return;
        if (storageContext().scope && !teams.some(team => team.id === storageContext().teamId)) {
          restoring = true; emit();
          const previous = engine; engine = null; await previous?.stop();
          if (ticket !== generation) return;
          setStorageScope(null);
        }
        const selected = storageContext().teamId;
        const candidate = teams.some(team => team.id === preference) ? preference : teams.length === 1 ? teams[0].id : null;
        if (selected) {
          await backend.verifyTeam(selected); if (ticket !== generation) return;
          runEngine();
        } else if (candidate) await choose(candidate);
        if (ticket !== generation) return;
        restoring = false; needsTeam = !storageContext().scope; restoreError = '';
        renderTeams(); emit(); maybeOffer();
      } catch (error) {
        if (ticket !== generation) return;
        connected = error.code === 'permission-denied';
        // Un permiso revocado no se trata como una desconexión.
        if (error.code === 'permission-denied' && storageContext().scope) {
          const previous = engine; engine = null; await previous?.stop();
          if (ticket !== generation) return;
          setStorageScope(null);
        }
        restoring = false; needsTeam = !storageContext().scope;
        restoreError = needsTeam ? 'No se ha podido preparar tu equipo. Reintenta con conexión o continúa en modo local. Los datos existentes se conservan.' : '';
        status('Error de sincronización', error.code || error.message); renderTeams();
        if (storageContext().scope) runEngine();
      }
    })().catch(error => { if (ticket === generation) {
      restoring = false; needsTeam = !storageContext().scope;
      restoreError = 'No se ha podido recuperar tu equipo. Reintenta o continúa en modo local.';
      status('Error de sincronización', error.message);
    } });
  }
  controller.subscribe(accountChanged);
  $('syncTeam').addEventListener('change', () => { void choose($('syncTeam').value).catch(error => status('Error de sincronización', error.message)); });
  async function createTeam(name) {
    if (!name?.trim() || teamBusy || choosing || !transport || !connected) return;
    teamBusy = true; renderTeams(); const ticket = generation, backend = transport;
    try {
      const team = await backend.createTeam(name);
      if (ticket !== generation) return;
      teams.push(team); await cacheTeams(uid, teams); if (ticket !== generation) return;
      await choose(team.id);
    } catch (error) {
      if (ticket === generation) {
        restoreError = needsTeam ? (FRIENDLY[error.code] || error.message) : '';
        status('Error de sincronización', error.code || error.message);
      }
    } finally { if (ticket === generation) { teamBusy = false; renderTeams(); } }
  }
  $('syncCreateTeam').addEventListener('click', () => { void createTeam(window.prompt('Nombre de tu equipo:')); });
  $('teamSetupForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const name = $('teamSetupName');
    if (!name.value.trim()) { name.setCustomValidity('Escribe el nombre de tu equipo.'); name.reportValidity(); return; }
    name.setCustomValidity(''); void createTeam(name.value.trim());
  });
  $('teamSetupName')?.addEventListener('input', () => $('teamSetupName').setCustomValidity(''));
  $('teamSetupContinue')?.addEventListener('click', () => {
    void choose($('teamSetupSelect').value).catch(error => {
      restoreError = error.message; status('Error de sincronización', error.code || error.message);
    });
  });
  $('syncRetry').addEventListener('click', () => { void engine?.retry().catch(error => status('Error de sincronización', error.message)); });
  globalThis.addEventListener('defensas-sync-local', () => { engine?.wake(); void countPending(); });
  globalThis.addEventListener('online', () => {
    if (uid && !storageContext().scope && !restoring && !connected) { accountVersion = -1; accountChanged(lastAccount); }
    else { engine?.wake(); renderTeams(); emit(); }
  });
  globalThis.addEventListener('offline', () => { renderTeams(); emit(); });
  globalThis.addEventListener('pageshow', () => engine?.wake());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') engine?.wake(); });
  function openReview(preselect = false) {
    const c = storageContext(); reviewContext = c;
    return listLegacyForImport().then(items => {
      assertContext(c); review = items;
      const team = teams.find(team => team.id === c.teamId);
      $('syncDestination').textContent = `Cuenta: ${user.email || user.uid} · Equipo: ${team?.name || c.teamId} · Proyecto: ${c.projectId}`;
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
    offerImport() { importOffer = true; maybeOffer(); },
    refresh: countPending
  };
}
