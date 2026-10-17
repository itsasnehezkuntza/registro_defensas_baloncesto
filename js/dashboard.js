import { eventIdentity } from './identidad.js';
import { summarize, pointsAttempted } from './estadisticas.js';

const CATEGORY_IDS = ['transicion', 'estatico', 'directo'];
const safe = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const rateOrder = (a, b) => !a.attempts ? (!b.attempts ? a.order - b.order : 1)
  : !b.attempts ? -1 : a.missed / a.attempts - b.missed / b.attempts || a.order - b.order;
const pointOrder = (a, b) => !a.attempts ? (!b.attempts ? a.order - b.order : 1)
  : !b.attempts ? -1 : comparePoints(a, b) || a.order - b.order;
const comparePoints = (a, b) => a.pointsAllowed * b.attempts - b.pointsAllowed * a.attempts;
const summary = events => {
  const stat = summarize(events);
  return { ...stat, successRate: stat.attempts ? 100 * stat.missed / stat.attempts : null,
    pointsPerAttempt: stat.attempts ? stat.pointsAllowed / stat.attempts : null };
};
// Umbral PROVISIONAL de muestra para etiquetar «Mejor»/«Peor» (y «A mejorar»).
// Por debajo de este número de intentos no se marca nada. Pendiente de confirmar por el usuario.
export const MIN_COMPARISON_ATTEMPTS = 5;

// Comparación exacta, antes de redondear; cada llamada representa un conjunto independiente.
export function comparePerformance(items) {
  const eligible = items.filter(item => item.attempts >= MIN_COMPARISON_ATTEMPTS).sort(comparePoints);
  const best = eligible[0], worst = eligible.at(-1);
  const distinct = eligible.length > 1 && comparePoints(best, worst) !== 0;
  return items.map(item => ({ ...item, badge: distinct && item.attempts >= MIN_COMPARISON_ATTEMPTS
    ? comparePoints(item, best) === 0 ? 'best' : comparePoints(item, worst) === 0 ? 'worst' : null : null }));
}

function buildMatrix(config, entries) {
  const axis = definitions => new Map(definitions.map((item, order) => [item.id,
    { id: item.id, name: item.name, order, historical: false }]));
  const types = axis(config?.actions ?? []);
  const defenses = axis([...new Map((config?.actions ?? []).flatMap(action => action.defenses).map(d => [d.id, d])).values()]);
  const buckets = new Map(), byType = new Map(), byDefense = new Map();
  const append = (map, key, event) => { if (!map.has(key)) map.set(key, []); map.get(key).push(event); };
  for (const { event, identity } of entries) {
    const action = identity.action, defense = identity.defense;
    if (!types.has(action)) types.set(action, { id: action, name: event.accion || action, order: types.size, historical: true });
    if (!defenses.has(defense)) defenses.set(defense, { id: defense, name: event.estrategia || defense || 'Sin defensa identificada', order: defenses.size, historical: true });
    append(buckets, JSON.stringify([action, defense]), event);
    append(byType, action, event);
    append(byDefense, defense, event);
  }
  const cells = comparePerformance([...types.values()].flatMap(type => [...defenses.values()].map(defense => ({
    actionId: type.id, defenseId: defense.id, name: `${type.name} · ${defense.name}`,
    historical: type.historical || defense.historical,
    ...summary(buckets.get(JSON.stringify([type.id, defense.id])) ?? [])
  }))));
  return { cells,
    rows: comparePerformance([...types.values()].map(type => ({ ...type, ...summary(byType.get(type.id) ?? []) }))),
    columns: comparePerformance([...defenses.values()].map(defense => ({ ...defense, ...summary(byDefense.get(defense.id) ?? []) }))),
    total: summary(entries.map(item => item.event)) };
}

// Solo lectura. La configuración y los snapshots históricos nunca se reescriben.
export function buildDashboardModel(configuration, events, gameId) {
  const active = gameId ? events.filter(event => event.gameId === gameId) : [];
  const identified = active.map(event => ({ event, identity: eventIdentity(event) }));
  const groups = CATEGORY_IDS.map(id => {
    const config = configuration?.categories.find(category => category.id === id);
    const entries = identified.filter(item => item.identity?.category === id);
    if (id === 'directo') {
      const matrix = buildMatrix(config, entries);
      return { id, name: config?.name || entries[0]?.event.categoria || '', ...matrix.total, matrix,
        rows: [...matrix.columns].sort(pointOrder), unclassified: entries.filter(item => !item.identity.defense).length };
    }
    const definitions = config?.actions ?? [];
    const rows = new Map(definitions.map((item, order) => [item.id, { id: item.id, name: item.name, order, historical: false, events: [] }]));
    const unclassified = [];
    for (const { event, identity } of entries) {
      const key = identity.action;
      if (!key) { unclassified.push(event); continue; }
      if (!rows.has(key)) rows.set(key, {id: key, name: event.accion || key, order: rows.size, historical: true, events: []});
      rows.get(key).events.push(event);
    }
    const data = [...rows.values()].map(({ events: list, ...item }) => ({...item, ...summary(list)}));
    if (id !== 'transicion') data.sort(rateOrder);
    return { id, name: config?.name || entries[0]?.event.categoria || '', rows: data,
      ...summary(entries.map(item => item.event)), unclassified: unclassified.length };
  });
  const unclassified = identified.filter(item => !CATEGORY_IDS.includes(item.identity?.category)).length;
  return { total: summary(active), groups, unclassified };
}

// ---- Presentación V4 (Fase 9). Solo lectura del modelo anterior; nada se guarda. ----

// Éxito defensivo exacto: a supera a b si fallados/intentos es mayor (producto cruzado, sin redondeo).
const compareSuccess = (a, b) => b.missed * a.attempts - a.missed * b.attempts;
// De mejor a peor; empates en orden de configuración; sin datos al final.
export function rankBySuccess(items) {
  return [...items].sort((a, b) => !a.attempts ? (!b.attempts ? a.order - b.order : 1)
    : !b.attempts ? -1 : compareSuccess(a, b) || a.order - b.order);
}
// Mejor/peor solo entre elementos con MIN_COMPARISON_ATTEMPTS intentos (valor provisional).
// Hacen falta dos candidatos con tasas distintas; los empates en un extremo comparten etiqueta.
export function successBadges(items) {
  const eligible = rankBySuccess(items.filter(item => item.attempts >= MIN_COMPARISON_ATTEMPTS));
  const best = eligible[0], worst = eligible.at(-1);
  const distinct = eligible.length > 1 && compareSuccess(best, worst) !== 0;
  return items.map(item => ({ ...item, verdict: distinct && item.attempts >= MIN_COMPARISON_ATTEMPTS
    ? compareSuccess(item, best) === 0 ? 'best' : compareSuccess(item, worst) === 0 ? 'worst' : null : null }));
}

const ICONS = {
  transicion: '<rect x="1.5" y="5" width="21" height="14" rx="2"/><path d="M12 5v14" stroke-opacity=".45"/><path d="M4.5 12h14.5"/><path d="m16 9 3 3-3 3"/>',
  estatico: '<path d="M2 3.5h20"/><path d="M8.5 3.5v8h7v-8"/><path d="M8.5 11.5a3.5 3.5 0 0 0 7 0"/><path d="M3.5 3.5v3c0 7 3.8 11.5 8.5 11.5s8.5-4.5 8.5-11.5v-3"/><circle cx="12" cy="6" r="1.1"/>',
  directo: '<circle cx="5" cy="18.5" r="2.2"/><path d="M6.8 16.8C9 11.5 12.5 7.5 19 5.5"/><path d="m16.2 3.6 2.9 1.9-1.6 3"/><circle cx="18" cy="18" r="1.8"/><path d="M16.7 16.7 14 14"/><path d="M12.4 15.6l3.2-3.2"/>'
};
const icon = id => `<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id] || ICONS.directo}</svg>`;
const COURT = '<svg class="game-card-court" viewBox="0 0 700 320" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 -20v360"/><path d="M14 86h174v148H14"/><path d="M188 106a54 54 0 0 1 0 108"/><path d="M188 106a54 54 0 0 0 0 108" stroke-dasharray="7 9"/><path d="M50 133v54"/><circle cx="61" cy="160" r="8"/><path d="M61 122a38 38 0 0 1 0 76"/><path d="M14 -42h47a202 202 0 0 1 0 404H14"/><path d="M30 86v-8M30 234v8M58 86v-8M58 234v8M86 86v-8M86 234v8"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const ARROW_UP = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
const ARROW_DOWN = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';

const pct = (part, whole) => whole ? Math.round(1000 * part / whole) / 10 : 0;
// Fase 9C: anotados/intentos (veces que anota el rival / tiros registrados), igual que en el Registro.
const score = stat => stat.attempts ? `<span class="made">${stat.made}</span>/<b>${stat.attempts}</b>` : '<span class="score-empty">—</span>';
const successText = stat => stat.successRate === null ? '—' : `${Math.round(stat.successRate)}%`;
const pointsRateText = stat => stat.pointsPerAttempt === null ? '—'
  : stat.pointsPerAttempt.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const describe = stat => stat.attempts ? `${stat.made} anotados de ${stat.attempts} intentos, ${successText(stat)} de éxito defensivo` : 'sin datos';
// Permite partir nombres compuestos («Quick+Under») por el signo, no a mitad de palabra.
const breakable = name => safe(name).replace(/([+/])/g, '$1<wbr>');
const historical = item => item.historical ? ' <span class="historical-label">Histórico</span>' : '';
// Anillo: base = fallados (o blanco en el desglose), arco coral = proporción de aciertos.
function ring(stat, size, stroke, extra = '') {
  const r = (size - stroke) / 2, c = size / 2;
  return `<svg class="ring${stat.attempts ? '' : ' is-empty'}${extra}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle class="ring-base" cx="${c}" cy="${c}" r="${r}" stroke-width="${stroke}" pathLength="100"/>
    ${stat.attempts && stat.made ? `<circle class="ring-arc" cx="${c}" cy="${c}" r="${r}" stroke-width="${stroke}" pathLength="100" stroke-dasharray="${pct(stat.made, stat.attempts)} 100"/>` : ''}</svg>`;
}
// Barra horizontal: negro = fallados sobre fondo coral = aciertos.
const bar = stat => `<span class="cell-bar${stat.attempts ? '' : ' is-empty'}" aria-hidden="true">${stat.attempts && stat.missed ? `<i style="width:${pct(stat.missed, stat.attempts)}%"></i>` : ''}</span>`;
const tag = (verdict, long = false) => verdict === 'best' ? `<span class="tag tag-best">${long ? ARROW_UP : ''}Mejor</span>`
  : verdict === 'worst' ? `<span class="tag tag-worst">${long ? `${ARROW_DOWN}A mejorar` : 'Peor'}</span>` : '';

export const MAX_DEFENSE_BARS = 6;
// Hasta 6 defensas: todas en orden de configuración. Con más: las 3 mejores y las 3 peores por éxito
// defensivo exacto (empates en orden de configuración); si menos de 7 tienen tiros, solo esas.
export function defenseBarGroups(columns) {
  if (columns.length <= MAX_DEFENSE_BARS) return { groups: [{ items: columns }], caption: 'Fallados por defensa' };
  const withData = columns.filter(col => col.attempts);
  if (withData.length <= MAX_DEFENSE_BARS) return { groups: [{ items: withData }], caption: withData.length ? 'Fallados por defensa · con tiros' : 'Fallados por defensa · sin tiros todavía' };
  const ranked = rankBySuccess(withData), half = MAX_DEFENSE_BARS / 2;
  return { groups: [{ label: 'Mejores', items: ranked.slice(0, half) }, { label: 'Peores', items: ranked.slice(-half) }],
    caption: `Fallados por defensa · ${half} mejores y ${half} peores` };
}

function gameCard(model, game, columns, points) {
  const label = game ? `J${game.jornada || '—'} · ${game.rival || 'Sin rival'}` : 'Sin partido activo';
  // Fase 9D: con muchas defensas solo se muestran las mejores y las peores, que es lo que decide el entrenador.
  const { groups, caption } = defenseBarGroups(columns);
  const oneBar = col => `<div class="defense-bar"><span class="defense-bar-track">${col.attempts && col.missed ? `<i style="height:${pct(col.missed, col.attempts)}%"></i>` : ''}</span><span class="defense-bar-name" title="${safe(col.name)}">${breakable(col.name)}</span></div>`;
  const bars = groups.map(group => `<div class="defense-bar-group">${group.label ? `<span class="defense-bar-group-label">${group.label}</span>` : ''}<div class="defense-bar-row">${group.items.map(oneBar).join('')}</div></div>`).join('<span class="defense-bar-divider" aria-hidden="true"></span>');
  const summaryText = groups.flatMap(g => g.items).map(col => `${col.name}: ${col.attempts ? `${col.missed} de ${col.attempts} fallados` : 'sin datos'}`).join('; ');
  return `<section class="game-card" aria-label="Resumen del partido">${COURT}
    <div class="game-card-main">
      <span class="game-chip">${safe(label)}</span>
      <div><p class="game-card-eyebrow">Partido</p><strong id="statsResults" class="game-card-total">${model.total.attempts ? `${model.total.made}/${model.total.attempts}` : '—'}</strong>
      <p class="game-card-caption">Anotados / intentos del rival</p><p class="game-card-success">Puntos <b id="statsPoints">${model.total.attempts ? `${model.total.pointsAllowed}/${points}` : '—'}</b> · <span id="statsSuccess">${successText(model.total)}</span> éxito defensivo</p></div>
    </div>
    ${columns.length ? `<div class="defense-bars" role="img" aria-label="${safe(`${caption}. ${summaryText}`)}"><div class="defense-bars-plot">${bars}</div><span class="defense-bars-caption">${caption}</span></div>` : ''}
  </section>`;
}

function categoryCards(groups) {
  return `<section class="category-cards" aria-label="Por situación">${groups.map(group => `<div class="category-card">
    ${icon(group.id)}<div class="category-card-text"><span class="category-card-value">${score(group)}</span><span class="category-card-label">${safe(group.name || 'Sin configuración')} · ${successText(group)} éxito</span></div>
    ${ring(group, 46, 5, ' category-ring')}</div>`).join('')}</section>`;
}

function detailRow(stat, colspan) {
  return `<tr class="matrix-detail-row"><td colspan="${colspan}"><div id="matrixDetail" class="matrix-detail" role="region" aria-label="${safe(`Desglose ${stat.name}`)}">
    <span class="matrix-notch" aria-hidden="true"></span>
    <div class="detail-ring">${ring(stat, 104, 11, ' detail-ring-svg')}<span class="detail-pct"><b>${successText(stat)}</b><small>Éxito</small></span></div>
    <div class="detail-who"><span class="detail-eyebrow">${safe(stat.group)}</span><span class="detail-title">${safe(stat.name)}</span><span class="detail-sub">Anotados / intentos ${score(stat)}</span></div>
    <dl class="detail-facts">${[['Intentos', stat.attempts], ['Fallados', stat.missed], ['Aciertos', stat.made, 'made'],
      ['Puntos concedidos', stat.pointsAllowed], ['Puntos por tiro', pointsRateText(stat)]]
      .map(([label, value, css]) => `<div><dt>${label}</dt><dd${css ? ` class="${css}"` : ''}>${value}</dd></div>`).join('')}</dl>
    <button type="button" class="detail-close" data-detail-close aria-label="Cerrar desglose">${CLOSE}</button>
  </div></td></tr>`;
}

function matrixSheet(group, selected, details) {
  const { matrix } = group;
  const groupName = group.name || 'Bloqueo directo';
  const columns = successBadges(matrix.columns);
  const colspan = columns.length + 2;
  const lookup = new Map(matrix.cells.map(stat => [JSON.stringify([stat.actionId, stat.defenseId]), stat]));
  const cell = (stat, key, name, kind = '') => {
    details.set(key, { ...stat, name, group: groupName });
    const open = key === selected;
    return `<td${kind ? ` class="matrix-total"` : ''}><button type="button" class="matrix-cell${kind}" data-matrix-key="${safe(key)}" aria-pressed="${open}" aria-expanded="${open}"${open ? ' aria-controls="matrixDetail"' : ''} aria-label="${safe(`${name}: ${describe(stat)}. Ver desglose`)}">
      <span class="matrix-points">${score(stat)}</span>${bar(stat)}</button></td>`;
  };
  const bodyRows = matrix.rows.map(type => {
    const cells = columns.map(col => cell(lookup.get(JSON.stringify([type.id, col.id])), selectionKey('cell', type.id, col.id), `${type.name} · ${col.name}`)).join('')
      + cell(type, selectionKey('row', type.id), `${type.name} · Total`, ' is-total');
    // Las claves de la fila comparten prefijo ["cell","tipo" o ["row","tipo".
    const rowKeys = [JSON.stringify(['row', type.id]).slice(0, -1), JSON.stringify(['cell', type.id]).slice(0, -1)];
    const header = `<th scope="row">${safe(type.name)}${historical(type)}</th>`;
    const open = details.has(selected) && rowKeys.some(prefix => selected?.startsWith(prefix + ',') || selected === prefix + ']');
    return `<tr>${header}${cells}</tr>${open ? detailRow(details.get(selected), colspan) : ''}`;
  }).join('');
  const footCells = columns.map(col => cell(col, selectionKey('column', col.id), `Total · ${col.name}`,
    ` is-total${col.verdict === 'best' ? ' is-best' : col.verdict === 'worst' ? ' is-worst' : ''}`)).join('')
    + cell(matrix.total, selectionKey('total'), `${groupName} · Total`, ' is-grand');
  const footOpen = selected?.startsWith('["column"') || selected === selectionKey('total');
  const best = columns.filter(col => col.verdict === 'best'), worst = columns.filter(col => col.verdict === 'worst');
  const verdict = (list, kind) => list.length ? `<div class="verdict">${tag(kind, true)}<span class="verdict-name">${list.map(col => safe(col.name)).join(' · ')}</span><span class="verdict-score">${score(list[0])}</span></div>` : '';
  return `<section class="sheet matrix-sheet" aria-labelledby="stats-directo">
    <div class="sheet-head">${icon('directo')}<h2 id="stats-directo">${safe(groupName)}</h2><span class="sheet-hint" id="matrixHelp">Pulsa una celda o un total para ver el detalle</span>
      <div class="verdicts">${verdict(best, 'best')}${verdict(worst, 'worst')}</div></div>
    <div class="matrix-scroll" tabindex="0" role="region" aria-label="Matriz de bloqueo directo" aria-describedby="matrixHelp">
    <table class="analysis-matrix" style="--cols:${columns.length}"><caption class="sr-only">Anotados/intentos por tipo de bloqueo y defensa</caption>
      <thead><tr><td class="matrix-corner"></td>${columns.map(col => `<th scope="col"><span class="col-head">${tag(col.verdict)}<span>${breakable(col.name)}</span>${historical(col)}</span></th>`).join('')}<th scope="col" class="col-total"><span class="col-head"><span>Total</span></span></th></tr></thead>
      <tbody>${bodyRows}</tbody>
      <tfoot><tr><th scope="row">Total</th>${footCells}</tr>${footOpen && details.has(selected) ? detailRow(details.get(selected), colspan) : ''}</tfoot>
    </table></div>
    ${matrix.rows.some(r => r.historical) || matrix.columns.some(c => c.historical) ? '<p class="dashboard-note">Los ejes históricos conservan los tiros de categorías retiradas o sin defensa identificada y están incluidos en los totales.</p>' : ''}
  </section>`;
}

function transitionSheet(group) {
  const rows = [...group.rows].sort((a, b) => a.order - b.order);
  return `<section class="sheet transition-sheet" aria-labelledby="stats-transicion">
    <div class="sheet-head">${icon('transicion')}<h2 id="stats-transicion">${safe(group.name || 'Transición')}</h2><span class="sheet-total">${score(group)}</span></div>
    <div class="donuts">${rows.map(item => `<div class="donut" data-stat-id="${safe(item.id)}" role="img" aria-label="${safe(`${item.name}: ${describe(item)}`)}">
      <div class="donut-wrap">${ring(item, 150, 14, ' donut-ring')}<span class="donut-value">${score(item)}</span></div>
      <span class="donut-name">${safe(item.name)}${historical(item)}</span></div>`).join('')}</div>
    ${group.unclassified ? '<p class="dashboard-note">Datos históricos sin detalle incluidos en el resumen.</p>' : ''}
  </section>`;
}

function staticSheet(group) {
  const ranked = rankBySuccess(successBadges(group.rows));
  return `<section class="sheet static-sheet" aria-labelledby="stats-estatico">
    <div class="sheet-head">${icon('estatico')}<h2 id="stats-estatico">${safe(group.name || 'Estático')}</h2><span class="sheet-hint sheet-hint-end">De mejor a peor defensa</span></div>
    <ol class="ranking">${ranked.map((item, index) => `<li class="ranking-row${item.verdict === 'best' ? ' is-best' : ''}" data-stat-id="${safe(item.id)}">
      <span class="ranking-position">${item.attempts ? index + 1 : '—'}</span><span class="ranking-name">${safe(item.name)}${historical(item)}</span>
      ${bar(item)}<span class="ranking-score">${score(item)}</span><span class="ranking-tag">${tag(item.verdict)}</span></li>`).join('')}</ol>
    ${group.unclassified ? '<p class="dashboard-note">Datos históricos sin detalle incluidos en el resumen.</p>' : ''}
  </section>`;
}

const selectionKey = (kind, ...ids) => JSON.stringify([kind, ...ids]);
const dashboardStates = new WeakMap();
let resizeBound = false;

// Coloca la pestaña del desglose bajo la celda y ajusta su ancho a la zona visible en móvil.
function placeDetail(root, key) {
  const scroller = root.querySelector('.matrix-scroll');
  const detail = root.querySelector('#matrixDetail');
  if (!scroller || !detail) return;
  detail.style.setProperty('--detail-width', `${scroller.clientWidth}px`);
  const button = [...root.querySelectorAll('[data-matrix-key]')].find(item => item.dataset.matrixKey === key);
  if (!button) return;
  const cellBox = button.getBoundingClientRect(), box = detail.getBoundingClientRect();
  const left = Math.min(Math.max(cellBox.left + cellBox.width / 2 - box.left - 10, 18), box.width - 38);
  detail.querySelector('.matrix-notch').style.left = `${left}px`;
}

export function renderDashboard(configuration, events, game) {
  const root = document.querySelector('#statisticsView');
  if (!root?.hasAttribute?.('data-dashboard') || root.hidden) return;
  const model = buildDashboardModel(configuration, events, game?.id);
  const [transition, fixed, direct] = model.groups;
  let state = dashboardStates.get(root);
  if (!state || state.gameId !== game?.id) state = { gameId: game?.id, selected: null };
  state.args = [configuration, events, game];
  dashboardStates.set(root, state);
  const content = root.querySelector('#statisticsContent');
  const focused = root.contains(document.activeElement) ? document.activeElement?.dataset?.matrixKey : null;
  const scrollLeft = root.querySelector('.matrix-scroll')?.scrollLeft || 0;
  const details = new Map();
  content.innerHTML = `<div class="stats-top">${gameCard(model, game, direct.matrix.columns, pointsAttempted(game ? events.filter(event => event.gameId === game.id) : []))}${categoryCards(model.groups)}</div>
    ${matrixSheet(direct, state.selected, details)}
    <div class="stats-bottom">${transitionSheet(transition)}${staticSheet(fixed)}</div>
    <p class="dashboard-footnote">Anotados/intentos del partido activo; puntos concedidos/puntos intentados en el marcador. Éxito defensivo: fallados / intentos × 100. «Mejor» y «Peor» requieren al menos ${MIN_COMPARISON_ATTEMPTS} intentos.${model.unclassified ? ' Datos históricos sin clasificación incluidos en el total global y CSV.' : ''}</p>`;
  // Una selección que ya no existe (otro partido, eje retirado) se descarta sin desglose.
  if (!details.has(state.selected)) state.selected = null;
  root.querySelector('.matrix-scroll').scrollLeft = scrollLeft;
  if (state.selected) placeDetail(root, state.selected);
  [...root.querySelectorAll('[data-matrix-key]')].find(button => button.dataset.matrixKey === focused)?.focus({ preventScroll: true });
  const rerender = () => renderDashboard(...state.args);
  const close = () => {
    const key = state.selected;
    state.selected = null; rerender();
    [...root.querySelectorAll('[data-matrix-key]')].find(button => button.dataset.matrixKey === key)?.focus({ preventScroll: true });
  };
  content.onclick = event => {
    if (event.target.closest('[data-detail-close]')) { close(); return; }
    const button = event.target.closest('[data-matrix-key]');
    if (!button || !details.has(button.dataset.matrixKey)) return;
    const key = button.dataset.matrixKey;
    state.selected = state.selected === key ? null : key;
    rerender();
    const active = [...root.querySelectorAll('[data-matrix-key]')].find(item => item.dataset.matrixKey === key);
    active?.focus({ preventScroll: true });
    // Mostrar entera la celda activa, también junto al eje fijo en móvil.
    const view = root.querySelector('.matrix-scroll'), heading = root.querySelector('.analysis-matrix tbody th');
    if (active && view && heading) {
      const cellBox = active.getBoundingClientRect(), box = view.getBoundingClientRect();
      const fixedWidth = getComputedStyle(heading).position === 'sticky' ? heading.getBoundingClientRect().width : 0;
      if (cellBox.right > box.right - 6) view.scrollLeft += cellBox.right - box.right + 6;
      else if (cellBox.left < box.left + fixedWidth + 6) view.scrollLeft -= box.left + fixedWidth + 6 - cellBox.left;
      if (state.selected) placeDetail(root, key);
    }
    root.querySelector('#matrixDetail')?.scrollIntoView({ block: 'nearest' });
  };
  content.onkeydown = event => { if (event.key === 'Escape' && state.selected) close(); };
  if (!resizeBound && globalThis.addEventListener) {
    resizeBound = true;
    globalThis.addEventListener('resize', () => { const current = dashboardStates.get(root); if (current?.selected) placeDetail(root, current.selected); });
  }
}
