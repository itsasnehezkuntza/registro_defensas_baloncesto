import { eventIdentity } from './identidad.js';
import { summarize, statMarkup } from './estadisticas.js';

const CATEGORY_IDS = ['transicion', 'estatico', 'directo'];
const safe = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const percent = s => s.attempts ? Math.round(100 * s.missed / s.attempts) : null;
const rateOrder = (a, b) => !a.attempts ? (!b.attempts ? a.order - b.order : 1)
  : !b.attempts ? -1 : a.missed / a.attempts - b.missed / b.attempts || a.order - b.order;

// Solo lectura. La configuración y los snapshots históricos nunca se reescriben.
export function buildDashboardModel(configuration, events, gameId) {
  const active = gameId ? events.filter(event => event.gameId === gameId) : [];
  const identified = active.map(event => ({ event, identity: eventIdentity(event) }));
  const groups = CATEGORY_IDS.map(id => {
    const config = configuration?.categories.find(category => category.id === id);
    const entries = identified.filter(item => item.identity?.category === id);
    const definitions = id === 'directo'
      ? [...new Map((config?.actions ?? []).flatMap(action => action.defenses).map(defense => [defense.id, defense])).values()]
      : config?.actions ?? [];
    const rows = new Map(definitions.map((item, order) => [item.id, { id: item.id, name: item.name, order, historical: false, events: [] }]));
    const unclassified = [];
    for (const { event, identity } of entries) {
      const key = id === 'directo' ? identity.defense : identity.action;
      if (!key) { unclassified.push(event); continue; }
      if (!rows.has(key)) rows.set(key, {id: key, name: (id === 'directo' ? event.estrategia : event.accion) || key, order: rows.size, historical: true, events: []});
      rows.get(key).events.push(event);
    }
    const data = [...rows.values()].map(({ events: list, ...item }) => ({...item, ...summarize(list)}));
    if (id !== 'transicion') data.sort(rateOrder);
    return { id, name: config?.name || entries[0]?.event.categoria || '', rows: data,
      ...summarize(entries.map(item => item.event)), unclassified: unclassified.length,
      types: (config?.actions ?? []).map(action => action.name) };
  });
  const unclassified = identified.filter(item => !CATEGORY_IDS.includes(item.identity?.category)).length;
  return { total: summarize(active), groups, unclassified };
}

function percentage(stat) {
  const value = percent(stat);
  return value === null ? '—' : `${value}<small>%</small>`;
}
function bar(stat) {
  return `<div class="performance-bar${stat.attempts ? '' : ' is-empty'}" aria-hidden="true">${stat.attempts
    ? `<span class="bar-missed" style="width:${100 * stat.missed / stat.attempts}%"></span><span class="bar-made" style="width:${100 * stat.made / stat.attempts}%"></span>` : ''}</div>`;
}
function rows(group) {
  return group.rows.map(item => `<article class="performance" data-stat-id="${safe(item.id)}" data-attempts="${item.attempts}">
    <div class="performance-heading"><h3>${safe(item.name)}</h3>${item.historical ? '<span class="historical-label">Histórico</span>' : ''}<strong class="percentage">${percentage(item)}</strong></div>
    ${bar(item)}<div class="performance-detail"><span>${statMarkup(item)}</span><span>${item.attempts} intento${item.attempts === 1 ? '' : 's'}</span></div>
  </article>`).join('');
}
function section(group) {
  return `<section class="stat-panel dashboard-group dashboard-${group.id}" aria-labelledby="stats-${group.id}">
    <div class="panel-heading"><div><h2 id="stats-${group.id}">${safe(group.name || 'Sin configuración')}</h2></div><span class="panel-summary">${group.attempts} intentos</span></div>
    <div class="dashboard-panel-content"><p class="dashboard-note">${group.id === 'transicion' ? 'Comparación por acción' : group.id === 'directo' ? 'Tipos agrupados · menor a mayor éxito' : 'Menor a mayor éxito defensivo'}</p>
    <div class="performance-rows">${rows(group)}</div>${group.unclassified ? `<p class="dashboard-note">${group.unclassified} registros históricos sin detalle, incluidos en el resumen.</p>` : ''}
    ${group.id === 'directo' && group.types.length ? `<p class="dashboard-aggregation">${group.types.map(safe).join(' · ')}</p>` : ''}</div></section>`;
}
export function renderDashboard(configuration, events, game) {
  const root = document.querySelector('#statisticsView');
  if (!root?.hasAttribute?.('data-dashboard') || root.hidden) return;
  const model = buildDashboardModel(configuration, events, game?.id);
  const [transition, fixed, direct] = model.groups;
  root.querySelector('#statisticsContent').innerHTML = `<section class="stat-panel dashboard-overview" aria-labelledby="stats-overview">
    <div class="panel-heading"><div><h2 id="stats-overview">Resumen general</h2></div><div class="dashboard-legend"><span><i class="bar-missed"></i>Fallados rival</span><span><i class="bar-made"></i>Anotados rival</span></div></div>
    <div class="overview-grid">${model.groups.map(group => `<div class="group-summary"><div><h3>${safe(group.name || 'Sin configuración')}</h3><strong>${percentage(group)}</strong></div>${bar(group)}<p>${group.missed}–${group.made} · ${group.attempts} intentos</p></div>`).join('')}
    <div class="global-summary"><div><p>Éxito global</p><strong id="statsSuccess">${percentage(model.total)}</strong><span id="statsAttempts">${model.total.missed}–${model.total.made} · ${model.total.attempts} intentos</span></div><div class="points"><p>Puntos concedidos</p><strong id="statsPoints">${model.total.pointsAllowed}</strong></div></div></div></section>
    <div class="analysis-grid"><div class="dashboard-situations">${section(transition)}${section(fixed)}</div>${section(direct)}</div>
    <p class="dashboard-footnote">Éxito defensivo = fallados / intentos. Barras al 100%; sin tiros: —.${model.unclassified ? ` ${model.unclassified} registros históricos sin clasificación incluidos en el total global y CSV.` : ''}</p>`;
}
