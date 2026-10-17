// Edición del panel (Fase 9C), como en el lienzo V4 «Registro con modo edición»:
// se edita sobre el propio Registro. Tocar un botón abre su editor en la cabecera;
// la barra inferior añade Transición, Estático, Tipo de bloqueo o Defensa si caben en iPad.
// Guardar («Hecho») crea una versión nueva de forma atómica y la asigna al partido activo.
// Fase 9D: un partido con tiros no puede cambiar su panel (deshacer, eliminar o crear otro partido).
import { configurationFromDoc, validateDoc, newId, idsInDoc, eventCounts, saveButtonConfiguration, MAX_NAME } from './configuracion-guardada.js';
import { simpleActionsMarkup, directMatrixMarkup, htmlSafe } from './registro-vista.js';
import { fitRegistro } from './distribucion.js';
import { matchesEvent } from './identidad.js';
import { summarize, attemptsMarkup } from './estadisticas.js';

// Geometría real del Registro en cada iPad (Safari): ancho útil y alto entre cabecera y barra.
// tests/diseno-v4/distribucion.mjs comprueba que la predicción coincide con la aplicación.
export const PREVIEW_DEVICES = Object.freeze([
  { id: 'ipad', label: 'iPad 1180×740', width: 1180, height: 740, record: { width: 1140, height: 528 } },
  { id: 'mini', label: 'iPad mini 1133×670', width: 1133, height: 670, record: { width: 1093, height: 458 } },
  { id: 'vertical', label: 'iPad vertical 820×1180', width: 820, height: 1180, record: { width: 780, height: 918 } }
]);
// Límites: 12 acciones por sección, 8 tipos y 12 defensas (Fase 9E, antes 8); además, nada se añade si no cabe en los tres iPad.
export const LIMITS = Object.freeze({ items: 12, types: 8, defenses: 12 });
// Contador de muestra para las comprobaciones de espacio: dos cifras, caso exigente pero realista.
const SAMPLE_STAT = { attempts: 20, made: 10, missed: 10, pointsAllowed: 25 };
const SECTION_ICONS = {
  transicion: '<rect x="1.5" y="5" width="21" height="14" rx="2"/><path d="M12 5v14" stroke-opacity=".45"/><path d="M4.5 12h14.5"/><path d="m16 9 3 3-3 3"/>',
  estatico: '<path d="M2 3.5h20"/><path d="M8.5 3.5v8h7v-8"/><path d="M8.5 11.5a3.5 3.5 0 0 0 7 0"/><path d="M3.5 3.5v3c0 7 3.8 11.5 8.5 11.5s8.5-4.5 8.5-11.5v-3"/><circle cx="12" cy="6" r="1.1"/>',
  directo: '<circle cx="5" cy="18.5" r="2.2"/><path d="M6.8 16.8C9 11.5 12.5 7.5 19 5.5"/><path d="m16.2 3.6 2.9 1.9-1.6 3"/><circle cx="18" cy="18" r="1.8"/><path d="M16.7 16.7 14 14"/><path d="M12.4 15.6l3.2-3.2"/>'
};
const icon = id => `<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SECTION_ICONS[id]}</svg>`;
const svg = (d, width = 2.2) => `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const LOGO = '<svg class="brand-logo" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><g transform="rotate(-22 16 16)"><path d="M27.6 12.2A12 12 0 1 0 25.2 23.8"/><path d="M4 16h24"/><path d="M16 4v24"/><path d="M7.6 7.4c2.9 2.4 4.4 5.3 4.4 8.6s-1.5 6.2-4.4 8.6"/><path d="M24.4 7.4c-2.9 2.4-4.4 5.3-4.4 8.6s1.5 6.2 4.4 8.6"/></g></svg>';
const SPECS = {
  'transicion:items': { key: 'transicion', field: 'items', section: 'Transición', kind: 'acción', add: 'Transición', fresh: 'Nueva acción', prefix: 'transicion', axis: 'h' },
  'estatico:items': { key: 'estatico', field: 'items', section: 'Estático', kind: 'acción', add: 'Estático', fresh: 'Nueva acción', prefix: 'estatico', axis: 'h' },
  'directo:types': { key: 'directo', field: 'types', section: 'Bloqueo directo', kind: 'tipo de bloqueo', add: 'Tipo de bloqueo', fresh: 'Nuevo bloqueo', prefix: '', axis: 'v' },
  'directo:defenses': { key: 'directo', field: 'defenses', section: 'Bloqueo directo', kind: 'defensa', add: 'Defensa', fresh: 'Nueva defensa', prefix: '', axis: 'h' }
};

// Registro de muestra (mismo marcado y CSS que la aplicación) para medir si una configuración cabe.
export function previewMarkup(configuration) {
  const category = id => configuration.categories.find(c => c.id === id);
  const sample = () => SAMPLE_STAT;
  const heading = (id, name) => `<div class="panel-heading"><h2>${icon(id)}<span class="category-title">${htmlSafe(name)}</span></h2><span class="panel-summary"><span class="made">30</span>/<b>60</b></span></div>`;
  const simple = id => `<section class="stat-panel">${heading(id, category(id)?.name ?? '')}
    <div class="action-list" data-fit-list="${id}">${simpleActionsMarkup(id, category(id)?.actions ?? [], sample)}</div></section>`;
  return `<div class="top-grid">${simple('transicion')}${simple('estatico')}</div>
    <section class="stat-panel direct-panel">${heading('directo', category('directo')?.name ?? 'Bloqueo directo')}
      <div class="direct-list">${directMatrixMarkup(category('directo')?.actions ?? [], { statFor: sample, typeStat: sample })}</div></section>`;
}

// ¿Cabe en un iPad? Mismo ajustador que la aplicación, en un contenedor fuera de pantalla.
export function fitOnDevice(configuration, device, host) {
  const root = document.createElement('div');
  root.className = 'record-view preview-record';
  root.setAttribute('aria-hidden', 'true');
  root.inert = true;
  root.style.width = `${device.record.width}px`;
  root.style.height = `${device.record.height}px`;
  root.innerHTML = previewMarkup(configuration);
  host.append(root);
  const result = fitRegistro(root, { narrow: false, checkHeight: true });
  return { root, result };
}
export function fitsAllDevices(configuration) {
  const holder = document.createElement('div');
  holder.className = 'preview-measure';
  document.body.append(holder);
  try {
    return PREVIEW_DEVICES.map(device => {
      const { result } = fitOnDevice(configuration, device, holder);
      holder.replaceChildren();
      return { device, ...result };
    });
  } finally { holder.remove(); }
}

// Explicación común para el menú y el editor.
export const LOCK_MESSAGE = 'Este partido ya tiene tiros: su panel no se puede cambiar. Deshaz sus tiros, elimina el partido o crea uno nuevo.';
export const isLocked = ({ game, events }) => Boolean(game && events.length);

export function initializeEditor({ state, onSaved, navigate, setFeedback = () => {} }) {
  const view = document.querySelector('#editorView');
  const openButton = document.querySelector('#editButtonsBtn');
  if (!view?.querySelector || !openButton?.addEventListener) return { canLeave: () => true, open() {} };
  let draft = null, baseRevision = null, counts = null, dirty = false, tempSeq = 0;
  let selected = null, confirming = null, alertText = '', capacity = null, capacityTimer = 0;

  openButton.addEventListener('click', () => { if (!isLocked(state())) navigate('editar'); });
  globalThis.addEventListener?.('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });

  const list = spec => draft.categories.find(c => c.id === spec.key)[spec.field];
  const active = spec => list(spec).filter(item => !item.retired);
  const isNew = item => item.id.startsWith('tmp-');
  const eventsFor = (spec, id) => spec.field === 'defenses' ? counts?.defenses.get(id) ?? 0 : counts?.actions.get(id) ?? 0;
  const selectedItem = () => selected && list(SPECS[selected.list])[selected.index];

  function confirmDialog({ title, message, accept, cancel = 'Cancelar', danger = false }) {
    const dialog = document.querySelector('#confirmDialog');
    return new Promise(resolve => {
      dialog.querySelector('#confirmTitle').textContent = title;
      dialog.querySelector('#confirmMessage').textContent = message;
      const ok = dialog.querySelector('#confirmAcceptBtn'), no = dialog.querySelector('#confirmCancelBtn');
      ok.textContent = accept; no.textContent = cancel;
      ok.classList.toggle('pill-new', !danger); ok.classList.toggle('delete-confirm-button', danger);
      const finish = value => { ok.onclick = no.onclick = dialog.oncancel = null; if (dialog.open) dialog.close(); resolve(value); };
      ok.onclick = () => finish(true); no.onclick = () => finish(false);
      dialog.oncancel = event => { event.preventDefault(); finish(false); };
      dialog.showModal(); no.focus();
    });
  }

  async function open() {
    const { buttonRecord, buttonVersion, storageReady } = state();
    selected = null; confirming = null; alertText = ''; capacity = null;
    if (!buttonRecord || !storageReady) {
      draft = null;
      view.innerHTML = '<div class="edit-bar"><p class="edit-warn">La configuración del panel no está disponible en este navegador. Recarga la página.</p></div>';
      return;
    }
    // Con tiros no se entra (p. ej. al recargar en #editar): se vuelve al Registro con la explicación.
    if (isLocked(state())) { draft = null; view.replaceChildren(); navigate('registro'); setFeedback(LOCK_MESSAGE, 'error'); return; }
    draft = structuredClone(buttonVersion.doc);
    baseRevision = buttonRecord.revision;
    dirty = false;
    try { counts = await eventCounts(); } catch { counts = null; }
    render(); scheduleCapacity();
  }

  // ---- Panel en modo edición (mismas clases que el Registro: el ajustador lo distribuye igual). ----
  function statFor(category, action, defense) {
    const { events } = state();
    return summarize(events.filter(event => matchesEvent(event, category, action, defense)));
  }
  const shotsChips = shots => `<span class="edit-shots" aria-hidden="true">${shots.map(v => `<span>${v}</span>`).join('')}</span>`;
  function tile(spec, item, index) {
    const on = selected?.list === `${spec.key}:${spec.field}` && selected.index === index;
    const label = `${spec.section}, ${item.name || 'sin nombre'}, tiros ${item.shots.join(' y ') || 'ninguno'}. Editar`;
    return `<button type="button" class="action-btn edit-tile" data-edit="${spec.key}:${spec.field}:${index}" aria-pressed="${on}" aria-label="${htmlSafe(label)}" title="${htmlSafe(item.name)}">
      <span class="action-name">${htmlSafe(item.name || '—')}</span>${shotsChips(item.shots)}</button>`;
  }
  function panelMarkup() {
    const simple = id => {
      const spec = SPECS[`${id}:items`], section = draft.categories.find(c => c.id === id);
      return `<section class="stat-panel"><div class="panel-heading"><h2>${icon(id)}<span class="category-title">${htmlSafe(section.name)}</span></h2><span class="panel-summary">${attemptsMarkup(statFor(id))}</span></div>
        <div class="action-list" data-fit-list="${id}">${list(spec).map((item, index) => item.retired ? '' : tile(spec, item, index)).join('')}</div></section>`;
    };
    const direct = draft.categories.find(c => c.id === 'directo');
    const types = SPECS['directo:types'], defenses = SPECS['directo:defenses'];
    const columns = list(defenses).map((item, index) => ({ item, index })).filter(({ item }) => !item.retired);
    const heads = columns.map(({ item, index }) => {
      const on = selected?.list === 'directo:defenses' && selected.index === index;
      return `<button type="button" class="defense-heading edit-col" data-edit="directo:defenses:${index}" aria-pressed="${on}" aria-label="${htmlSafe(`Defensa ${item.name || 'sin nombre'}. Editar`)}" title="${htmlSafe(item.name)}"><span class="defense-heading-text">${htmlSafe(item.name || '—').replace(/([+/])/g, '$1<wbr>')}</span></button>`;
    }).join('');
    const rows = list(types).map((type, index) => {
      if (type.retired) return '';
      const on = selected?.list === 'directo:types' && selected.index === index;
      const cells = columns.map(({ item }) => `<div class="defense-btn edit-cell" aria-hidden="true"><span class="defense-score">${isNew(type) || isNew(item) ? '<span class="score-empty">—</span>' : attemptsMarkup(statFor('directo', type.id, item.id))}</span></div>`).join('');
      return `<div class="direct-row"><button type="button" class="direct-type edit-row" data-edit="directo:types:${index}" aria-pressed="${on}" aria-label="${htmlSafe(`Tipo de bloqueo ${type.name || 'sin nombre'}, tiros ${type.shots.join(' y ') || 'ninguno'}. Editar`)}" title="${htmlSafe(type.name)}"><strong>${htmlSafe(type.name || '—')}</strong>${shotsChips(type.shots)}</button><div class="defense-options">${cells}</div></div>`;
    }).join('');
    return `<div class="top-grid">${simple('transicion')}${simple('estatico')}</div>
      <section class="stat-panel direct-panel"><div class="panel-heading"><h2>${icon('directo')}<span class="category-title">${htmlSafe(direct.name)}</span></h2><span class="panel-summary">${attemptsMarkup(statFor('directo'))}</span></div>
        <div class="direct-list"><div class="direct-matrix"><div class="direct-matrix-inner" style="--cols:${Math.max(1, columns.length)};--rows:${Math.max(1, active(types).length)}">
          <div class="direct-matrix-head"><span class="direct-corner" aria-hidden="true"></span><div class="defense-headings">${heads}</div></div>${rows}
        </div></div></div></section>`;
  }

  // ---- Cabecera: general, editor del botón elegido o confirmación de quitar. ----
  function gameChip() {
    const { game } = state();
    return `<div class="edit-game"><span class="edit-game-label">Partido</span><strong>${game ? htmlSafe(`J${game.jornada || '—'} · ${game.rival || 'Sin rival'}`) : 'Partidos nuevos'}</strong></div>`;
  }
  function barMarkup() {
    if (confirming) {
      return `<div class="edit-bar" role="alertdialog" aria-label="Confirmar"><p class="edit-warn">${confirming.text}</p>
        <button type="button" class="pill" data-act="cancel-remove">Cancelar</button>
        <button type="button" class="pill pill-dark" data-act="confirm-remove">Quitar del panel</button></div>`;
    }
    const item = selectedItem();
    if (item) {
      const spec = SPECS[selected.list];
      const visible = active(spec), position = visible.indexOf(item);
      const back = spec.axis === 'h' ? 'm15 6-6 6 6 6' : 'M12 19V5M5 12l7-7 7 7', fwd = spec.axis === 'h' ? 'm9 6 6 6-6 6' : 'M12 5v14M5 12l7 7 7-7';
      const last = visible.length <= 1;
      return `<div class="edit-bar">
        <label class="edit-field"><span>Nombre · ${spec.section}${spec.field === 'types' ? ' · tipo' : spec.field === 'defenses' ? ' · defensa' : ''}</span>
          <input id="editNameInput" type="text" value="${htmlSafe(item.name)}" maxlength="${MAX_NAME}" autocomplete="off" enterkeyhint="done"></label>
        <div class="edit-shots-group" role="group" aria-label="Tiros posibles"><span class="edit-shots-label">Tiros</span>
          ${[2, 3].map(v => `<button type="button" data-act="shot" data-shot="${v}" aria-pressed="${item.shots.includes(v)}" aria-label="Tiro de ${v}">${v}</button>`).join('')}</div>
        ${spec.field === 'defenses' ? '<span class="edit-note">Columna para todos los tipos</span>' : ''}
        <button type="button" class="circle-button" data-act="back" aria-label="Mover antes" ${position <= 0 ? 'disabled' : ''}>${svg(back)}</button>
        <button type="button" class="circle-button" data-act="forward" aria-label="Mover después" ${position >= visible.length - 1 ? 'disabled' : ''}>${svg(fwd)}</button>
        <button type="button" class="pill edit-remove" data-act="remove" ${last ? 'disabled title="Cada sección necesita al menos un botón"' : ''}>${svg('M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', 2)}Quitar</button>
        <button type="button" class="pill pill-dark" data-act="close">${svg('m5 12.5 4.5 4.5L19 7', 2.6)}Listo</button></div>`;
    }
    return `<div class="edit-bar">
      <div class="brand">${LOGO}</div>
      <div class="edit-title"><span class="edit-title-main">Editando panel</span></div>
      ${gameChip()}
      <div class="edit-actions">
        <button type="button" class="pill" data-act="cancel">Cancelar</button>
        <button type="button" class="pill pill-new" data-act="done">${svg('m5 12.5 4.5 4.5L19 7', 2.6)}Hecho</button>
      </div></div>`;
  }

  // ---- Barra inferior: qué hacer y añadir botones (desactivado si no cabría en iPad). ----
  function dockMarkup() {
    const { game } = state();
    const item = selectedItem(), spec = item && SPECS[selected.list];
    const kicker = alertText ? `<span class="edit-alert" role="alert">${htmlSafe(alertText)}</span>`
      : `<span class="selection-label">${item ? `${spec.section} · ${spec.kind}` : 'Toca un botón del panel para cambiarlo, o añade uno nuevo'}</span>`;
    const side = item ? (isNew(item) ? 'Nuevo · su ID se asigna al pulsar Hecho' : `ID ${htmlSafe(item.id)} · cambiar el nombre no toca los tiros guardados`)
      : game ? 'Se aplica a este partido y a los partidos nuevos' : 'Se aplicará a los partidos nuevos';
    const adds = Object.entries(SPECS).map(([key, s]) => {
      const why = capacity?.add?.[key];
      const off = why !== undefined && why !== null;
      return `<button type="button" class="result-btn edit-add" data-act="add" data-list="${key}" ${off || !capacity ? 'disabled' : ''} aria-label="Añadir ${s.kind} en ${s.section}${off ? `: ${why}` : ''}">
        <span class="result-value">${svg('M12 5v14M5 12h14', 2.6)}</span><span class="edit-add-label"><span>${s.add}</span><small>${!capacity ? 'Calculando…' : off ? why : 'Añadir'}</small></span></button>`;
    }).join('');
    return `<footer class="edit-dock" aria-label="Añadir botones"><div class="result-inner">
      <div class="selection-line">${kicker}<span class="selection-meta edit-side">${side}</span></div>
      <div class="result-buttons edit-add-buttons">${adds}</div></div></footer>`;
  }

  function render() {
    if (!draft) return;
    const focusId = document.activeElement?.id;
    const focusEdit = document.activeElement?.dataset?.edit;
    view.innerHTML = `${barMarkup()}<div class="record-view edit-panel" id="editPanel">${panelMarkup()}</div>${dockMarkup()}`;
    const dock = view.querySelector('.edit-dock');
    document.documentElement.style.setProperty('--edit-dock-height', `${Math.ceil(dock.offsetHeight)}px`);
    refit();
    if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
    else if (focusEdit) view.querySelector(`[data-edit="${focusEdit}"]`)?.focus({ preventScroll: true });
  }
  function refit() {
    const panel = view.querySelector('#editPanel');
    if (!panel) return;
    fitRegistro(panel, { narrow: panel.clientWidth < 660, checkHeight: matchMedia('(min-width: 900px) and (min-height: 560px), (min-width: 700px) and (min-height: 900px)').matches });
  }
  const renderParts = () => {
    if (!draft) return;
    const focusAct = document.activeElement?.dataset?.act, focusList = document.activeElement?.dataset?.list;
    view.querySelector('.edit-bar').outerHTML = barMarkup();
    view.querySelector('.edit-dock').outerHTML = dockMarkup();
    if (focusAct) view.querySelector(`[data-act="${focusAct}"]${focusList ? `[data-list="${focusList}"]` : ''}:not(:disabled)`)?.focus({ preventScroll: true });
  };

  // Capacidad: ¿cabe un botón más de cada tipo en los tres iPad?
  function computeCapacity() {
    const add = {};
    for (const [key, spec] of Object.entries(SPECS)) {
      const limit = LIMITS[spec.field];
      if (active(spec).length >= limit) { add[key] = `Máximo ${limit}`; continue; }
      const probe = structuredClone(draft);
      probe.categories.find(c => c.id === spec.key)[spec.field].push({ id: `tmp-probe-${key}`, name: spec.fresh, shots: [2, 3], retired: false });
      add[key] = fitsAllDevices(configurationFromDoc(probe)).every(r => r.fits) ? null : 'No cabe sin deslizar';
    }
    return { add };
  }
  function scheduleCapacity() {
    clearTimeout(capacityTimer);
    capacityTimer = setTimeout(() => { if (!draft) return; capacity = computeCapacity(); renderParts(); }, 120);
  }

  function change(mutator) {
    mutator();
    // La capacidad anterior deja de valer: «Añadir» queda desactivado hasta recalcularla.
    dirty = true; alertText = ''; capacity = null;
    render();
    scheduleCapacity();
  }

  // IDs estables definitivos para los elementos nuevos, a partir del nombre final.
  function finalizeIds(doc, record) {
    const used = { actions: new Set(record.usedIds.actions), defenses: new Set(record.usedIds.defenses) };
    const present = idsInDoc(doc);
    present.actions.forEach(id => used.actions.add(id)); present.defenses.forEach(id => used.defenses.add(id));
    for (const spec of Object.values(SPECS)) {
      const set = spec.field === 'defenses' ? used.defenses : used.actions;
      for (const item of doc.categories.find(c => c.id === spec.key)[spec.field]) {
        item.name = item.name.trim();
        if (!item.id.startsWith('tmp-')) continue;
        item.id = newId(item.name, set, spec.prefix);
        set.add(item.id);
      }
    }
    return doc;
  }

  async function done() {
    const { buttonRecord, game } = state();
    if (!dirty) { navigate('registro'); return; }
    // Otra pestaña puede haber registrado mientras se editaba.
    if (isLocked(state())) { alertText = LOCK_MESSAGE; selected = null; renderParts(); return; }
    const errors = validateDoc(draft);
    const tooBig = fitsAllDevices(configurationFromDoc(draft)).filter(r => !r.fits);
    if (tooBig.length) errors.push(`No cabe sin deslizar en ${tooBig.map(r => r.device.label).join(', ')}.`);
    if (errors.length) { alertText = errors[0]; selected = null; renderParts(); return; }
    try {
      const doc = finalizeIds(structuredClone(draft), buttonRecord);
      const loaded = await saveButtonConfiguration(doc, baseRevision, { source: 'editor', gameId: game?.id ?? null });
      dirty = false;
      await onSaved(loaded);
      navigate('registro');
    } catch (error) { alertText = error.message; renderParts(); }
  }

  function move(direction) {
    const spec = SPECS[selected.list], all = list(spec), item = all[selected.index];
    const visible = active(spec), target = visible[visible.indexOf(item) + direction];
    if (!target) return;
    const to = all.indexOf(target);
    change(() => { [all[selected.index], all[to]] = [all[to], all[selected.index]]; selected = { ...selected, index: to }; });
    view.querySelector(`[data-act="${direction < 0 ? 'back' : 'forward'}"]:not(:disabled)`)?.focus();
  }

  async function act(button) {
    const name = button.dataset.act;
    if (button.dataset.edit) {
      const [key, field, index] = button.dataset.edit.split(':');
      selected = { list: `${key}:${field}`, index: Number(index) }; confirming = null; alertText = '';
      render(); return;
    }
    if (name === 'done') return done();
    if (name === 'cancel') {
      if (dirty && !await confirmDialog({ title: 'Descartar cambios', message: 'Los cambios del panel no se han guardado. Si sales ahora se pierden; el Registro no cambia.', accept: 'Descartar cambios', cancel: 'Seguir editando', danger: true })) return;
      dirty = false; navigate('registro'); return;
    }
    if (name === 'add') {
      const spec = SPECS[button.dataset.list], all = list(spec);
      if (!capacity || capacity.add[button.dataset.list] || active(spec).length >= LIMITS[spec.field]) return;
      const names = new Set(active(spec).map(i => i.name.trim().toLocaleLowerCase('es')));
      let fresh = spec.fresh;
      for (let n = 2; names.has(fresh.toLocaleLowerCase('es')); n++) fresh = `${spec.fresh} ${n}`;
      change(() => { all.push({ id: `tmp-${++tempSeq}`, name: fresh, shots: [2, 3], retired: false }); selected = { list: button.dataset.list, index: all.length - 1 }; confirming = null; });
      const input = view.querySelector('#editNameInput'); input?.focus(); input?.select();
      return;
    }
    const item = selectedItem();
    if (!item) return;
    const spec = SPECS[selected.list];
    if (name === 'close') { const key = `${selected.list}:${selected.index}`; selected = null; render(); view.querySelector(`[data-edit="${key}"]`)?.focus({ preventScroll: true }); return; }
    if (name === 'back' || name === 'forward') { move(name === 'back' ? -1 : 1); return; }
    if (name === 'shot') {
      const value = Number(button.dataset.shot);
      change(() => {
        item.shots = item.shots.includes(value) ? item.shots.filter(v => v !== value) : [2, 3].filter(v => v === value || item.shots.includes(v));
        // Cambiar los tiros de un tipo o defensa sustituye sus excepciones por celda heredadas del CSV.
        const cells = draft.categories.find(c => c.id === 'directo').cells;
        if (spec.key === 'directo') for (const cell of Object.keys(cells)) {
          const [t, d] = cell.split('/');
          if ((spec.field === 'types' && t === item.id) || (spec.field === 'defenses' && d === item.id)) delete cells[cell];
        }
      });
      view.querySelector(`[data-act="shot"][data-shot="${value}"]`)?.focus();
      return;
    }
    if (name === 'remove') {
      const shots = eventsFor(spec, item.id);
      const text = isNew(item) ? `¿Quitar <b>«${htmlSafe(item.name)}»</b>? Es nuevo y aún no se ha guardado.`
        : shots ? `¿Quitar <b>«${htmlSafe(item.name)}»</b> del panel? No se podrá recuperar. Sus ${shots} ${shots === 1 ? 'tiro' : 'tiros'} de otros partidos se conservan en esos partidos.`
        : `¿Quitar <b>«${htmlSafe(item.name)}»</b> del panel? No se podrá recuperar.`;
      confirming = { text }; renderParts(); view.querySelector('[data-act="cancel-remove"]')?.focus();
    }
  }
  function confirmRemove(accept) {
    const item = selectedItem(), spec = item && SPECS[selected.list];
    confirming = null;
    if (!accept || !item) { renderParts(); view.querySelector('[data-act="remove"]')?.focus(); return; }
    change(() => {
      // Con tiros se retira (oculto, historial conservado); sin tiros se borra del todo.
      if (!isNew(item) && eventsFor(spec, item.id)) item.retired = true;
      else {
        list(spec).splice(selected.index, 1);
        const cells = draft.categories.find(c => c.id === 'directo').cells;
        if (spec.key === 'directo') for (const cell of Object.keys(cells)) if (cell.split('/').includes(item.id)) delete cells[cell];
      }
      selected = null;
    });
  }

  view.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled || !view.contains(button)) return;
    if (button.dataset.act === 'confirm-remove') { confirmRemove(true); return; }
    if (button.dataset.act === 'cancel-remove') { confirmRemove(false); return; }
    void act(button);
  });
  view.addEventListener('input', event => {
    const item = selectedItem();
    if (event.target.id !== 'editNameInput' || !item) return;
    item.name = event.target.value; dirty = true; alertText = '';
    // Actualiza el botón del panel sin reconstruir la cabecera: el campo conserva el foco.
    const target = view.querySelector(`[data-edit="${selected.list}:${selected.index}"]`);
    const text = target?.querySelector('.action-name, strong, .defense-heading-text');
    if (text) text.textContent = item.name || '—';
    target?.setAttribute('title', item.name);
    refit(); scheduleCapacity();
  });
  view.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.id === 'editNameInput') { event.preventDefault(); view.querySelector('[data-act="close"]')?.click(); return; }
    if (event.key !== 'Escape') return;
    if (confirming) { confirmRemove(false); return; }
    if (selected) view.querySelector('[data-act="close"]')?.click();
  });
  globalThis.addEventListener?.('resize', () => { if (!view.hidden && draft) refit(); });

  let leaving = false;
  return {
    open,
    canLeave(next) {
      if (!dirty || leaving) { if (next !== 'editar') { draft = null; selected = null; view.replaceChildren(); } return true; }
      void confirmDialog({ title: 'Descartar cambios', message: 'Los cambios del panel no se han guardado. Si sales ahora se pierden; el Registro no cambia.', accept: 'Descartar cambios', cancel: 'Seguir editando', danger: true })
        .then(discard => { if (discard) { dirty = false; leaving = true; navigate(next); leaving = false; } });
      return false;
    },
    isDirty: () => dirty
  };
}
