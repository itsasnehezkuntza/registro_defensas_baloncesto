import { eventIdentity } from './identidad.js';
import { summarize, outcomeText } from './estadisticas.js';

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

function bar(stat) {
  return `<div class="performance-bar${stat.attempts ? '' : ' is-empty'}" aria-hidden="true">${stat.attempts
    ? `<span class="bar-missed" style="width:${100 * stat.missed / stat.attempts}%"></span><span class="bar-made" style="width:${100 * stat.made / stat.attempts}%"></span>` : ''}</div>`;
}
function rows(group) {
  const sorted = [...group.rows].sort((a, b) => a.order - b.order);
  return sorted.map(item => `<article class="performance" data-stat-id="${safe(item.id)}">
    <div class="performance-heading"><h3>${safe(item.name)}</h3>${item.historical ? '<span class="historical-label">Histórico</span>' : ''}<strong class="percentage">${outcomeText(item)}</strong></div>
    ${bar(item)}${!item.attempts ? '<span class="sample-note">Sin datos</span>' : ''}
  </article>`).join('');
}
function section(group) {
  return `<section class="stat-panel dashboard-group dashboard-${group.id}" aria-labelledby="stats-${group.id}">
    <div class="panel-heading"><div><h2 id="stats-${group.id}">${safe(group.name || 'Sin configuración')}</h2></div><span class="panel-summary">${outcomeText(group)}</span></div>
    <div class="dashboard-panel-content"><p class="dashboard-note">Fallados/aciertos por acción</p>
    <div class="performance-rows">${rows(group)}</div>${group.unclassified ? '<p class="dashboard-note">Datos históricos sin detalle incluidos en el resumen.</p>' : ''}</div></section>`;
}
const selectionKey = (kind, ...ids) => JSON.stringify([kind, ...ids]);
const dashboardStates = new WeakMap();
const successText = stat => stat.successRate === null ? '—' : `${Math.round(stat.successRate)}%`;
const pointsRateText = stat => stat.pointsPerAttempt === null ? '—'
  : stat.pointsPerAttempt.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function matrixSection(group, selected, details) {
  const { matrix } = group;
  const cell = (stat, key, name, total = false) => {
    details.set(key, { ...stat, name });
    const label = `${name}: ${stat.attempts ? `${stat.missed} fallados, ${stat.made} aciertos, ${successText(stat)} de éxito defensivo` : 'sin datos'}. Ver desglose`;
    return `<td${total ? ' class="matrix-total"' : ''}><button type="button" class="matrix-cell" data-matrix-key="${safe(key)}" aria-pressed="${key === selected}" aria-controls="matrixDetail" aria-label="${safe(label)}">
      <strong class="matrix-points">${outcomeText(stat)}</strong>${stat.attempts ? `<span class="matrix-success">${successText(stat)} éxito</span>` : '<span class="sample-note">Sin datos</span>'}
    </button></td>`;
  };
  const label = item => `${safe(item.name)}${item.historical ? '<span class="historical-label">Histórico</span>' : ''}`;
  const lookup = new Map(matrix.cells.map(stat => [JSON.stringify([stat.actionId, stat.defenseId]), stat]));
  return `<section class="stat-panel dashboard-group dashboard-direct" aria-labelledby="stats-directo">
    <div class="panel-heading"><div><h2 id="stats-directo">${safe(group.name || 'Bloqueo directo')}</h2></div><span class="panel-summary">${outcomeText(group)}</span></div>
    <div class="dashboard-panel-content"><p class="dashboard-note" id="matrixHelp">Fallados/aciertos y % de éxito defensivo. Pulsa una celda o total para ver su desglose.</p>
    <p class="matrix-scroll-hint">Desliza la tabla para consultar todas las defensas →</p>
    <div class="matrix-scroll" tabindex="0" role="region" aria-label="Matriz de bloqueo directo, desplazamiento horizontal" aria-describedby="matrixHelp">
    <table class="analysis-matrix" style="min-width:${Math.max(52, (matrix.columns.length + 2) * 7.4)}rem"><caption>Rendimiento por tipo de bloqueo y estrategia defensiva</caption>
      <thead><tr><th scope="col">Tipo / defensa</th>${matrix.columns.map(col => `<th scope="col">${label(col)}</th>`).join('')}<th scope="col">Total</th></tr></thead>
      <tbody>${matrix.rows.map(row => `<tr><th scope="row">${label(row)}</th>${matrix.columns.map(col => {
        const stat = lookup.get(JSON.stringify([row.id, col.id]));
        return cell(stat, selectionKey('cell', row.id, col.id), stat.name);
      }).join('')}${cell(row, selectionKey('row', row.id), `${row.name} · Total`, true)}</tr>`).join('')}</tbody>
      <tfoot><tr><th scope="row">Total</th>${matrix.columns.map(col => cell(col, selectionKey('column', col.id), `Total · ${col.name}`, true)).join('')}${cell(matrix.total, selectionKey('total'), `${group.name || 'Bloqueo directo'} · Total`, true)}</tr></tfoot>
    </table></div>
    <div id="matrixDetail" class="matrix-detail" role="status" aria-live="polite" aria-atomic="true" hidden></div>
    <div class="strategy-heading"><h3>Resumen de estrategias</h3><p class="dashboard-note">Fallados/aciertos · todos los tipos agrupados</p></div>
    <div class="performance-rows strategy-ranking">${rows(group)}</div>
    ${matrix.rows.some(row => row.historical) || matrix.columns.some(col => col.historical) ? '<p class="dashboard-note">Los ejes históricos conservan los tiros de categorías retiradas o sin defensa identificada y están incluidos en los totales.</p>' : ''}
    </div></section>`;
}

function renderDetail(root, stat) {
  const detail = root.querySelector('#matrixDetail');
  detail.hidden = !stat;
  detail.innerHTML = stat ? `<h3>${safe(stat.name)}</h3><dl>${[
    ['Intentos', stat.attempts], ['Fallados', stat.missed], ['Aciertos', stat.made],
    ['Éxito defensivo', successText(stat)], ['Puntos concedidos', stat.pointsAllowed],
    ['Puntos por tiro', pointsRateText(stat)]
  ].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>` : '';
}

export function renderDashboard(configuration, events, game) {
  const root = document.querySelector('#statisticsView');
  if (!root?.hasAttribute?.('data-dashboard') || root.hidden) return;
  const model = buildDashboardModel(configuration, events, game?.id);
  const [transition, fixed, direct] = model.groups;
  let state = dashboardStates.get(root);
  if (!state || state.gameId !== game?.id) state = { gameId: game?.id, selected: null };
  dashboardStates.set(root, state);
  const focused = root.contains(document.activeElement) ? document.activeElement?.dataset?.matrixKey : null;
  const scrollLeft = root.querySelector('.matrix-scroll')?.scrollLeft || 0;
  const details = new Map();
  root.querySelector('#statisticsContent').innerHTML = `<section class="stat-panel dashboard-overview" aria-labelledby="stats-overview">
    <div class="panel-heading"><div><h2 id="stats-overview">Resumen general</h2></div><div class="dashboard-legend"><span><i class="bar-missed"></i>Fallados</span><span><i class="bar-made"></i>Aciertos</span></div></div>
    <div class="overview-grid">${model.groups.map(group => `<div class="group-summary"><div><h3>${safe(group.name || 'Sin configuración')}</h3><strong>${outcomeText(group)}</strong></div><p class="overview-success">${successText(group)} éxito</p>${bar(group)}</div>`).join('')}
    <div class="global-summary"><div><p>Fallados/aciertos · Total</p><strong id="statsResults">${outcomeText(model.total)}</strong><p id="statsSuccess">${successText(model.total)} éxito defensivo</p></div></div></div></section>
    <div class="analysis-grid">${matrixSection(direct, state.selected, details)}<div class="dashboard-situations">${section(transition)}${section(fixed)}</div></div>
    <p class="dashboard-footnote">Fallados/aciertos del partido activo. Éxito defensivo: fallados / intentos × 100. Sin datos: —.${model.unclassified ? ' Datos históricos sin clasificación incluidos en el total global y CSV.' : ''}</p>`;
  if (!details.has(state.selected)) state.selected = null;
  const buttons = [...root.querySelectorAll('[data-matrix-key]')];
  for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.matrixKey === state.selected));
  renderDetail(root, details.get(state.selected));
  root.querySelector('.matrix-scroll').scrollLeft = scrollLeft;
  buttons.find(button => button.dataset.matrixKey === focused)?.focus({ preventScroll: true });
  root.querySelector('#statisticsContent').onclick = event => {
    const button = event.target.closest('[data-matrix-key]');
    if (!button || !details.has(button.dataset.matrixKey)) return;
    state.selected = button.dataset.matrixKey;
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    renderDetail(root, details.get(state.selected));
    // Mostrar entera la celda activa, también al usar teclado junto al eje fijo móvil.
    const scroller = root.querySelector('.matrix-scroll');
    const cellBox = button.getBoundingClientRect(), viewport = scroller.getBoundingClientRect();
    const heading = root.querySelector('.analysis-matrix th');
    const fixedWidth = getComputedStyle(heading).position === 'sticky' ? heading.getBoundingClientRect().width : 0;
    if (cellBox.right > viewport.right - 6) scroller.scrollLeft += cellBox.right - viewport.right + 6;
    else if (cellBox.left < viewport.left + fixedWidth + 6) scroller.scrollLeft -= viewport.left + fixedWidth + 6 - cellBox.left;
    root.querySelector('#matrixDetail').scrollIntoView({ block: 'nearest' });
  };
}
