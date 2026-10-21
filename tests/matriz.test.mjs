import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseConfiguration } from '../js/configuracion.js';
import { resolveSelection, makeShotEvent } from '../js/registro.js';
import { summarize } from '../js/estadisticas.js';
import { buildDashboardModel, comparePerformance } from '../js/dashboard.js';

const config = parseConfiguration(await readFile(new URL('../categorias.csv', import.meta.url), 'utf8'));
const game = { id: 'ficticio', jornada: 'Prueba', rival: 'Ficticio' };
let assertions = 0;
function check(events, stat) {
  const made2 = events.filter(e => e.resultado === 'anotado' && e.valor_tiro === 2).length;
  const made3 = events.filter(e => e.resultado === 'anotado' && e.valor_tiro === 3).length;
  assert.equal(stat.attempts, events.length);
  assert.equal(stat.made, made2 + made3);
  assert.equal(stat.missed, events.filter(e => e.resultado === 'fallado').length);
  assert.equal(stat.attempts, stat.missed + stat.made);
  assert.equal(stat.pointsAllowed, 2 * made2 + 3 * made3);
  if ('pointsPerAttempt' in stat) {
    assert.equal(stat.pointsPerAttempt, events.length ? (2 * made2 + 3 * made3) / events.length : null);
    assert.equal(stat.successRate, events.length ? 100 * stat.missed / events.length : null);
  }
  assertions++;
}
for (const value of [2, 3]) for (const result of ['anotado', 'fallado']) {
  const e = { valor_tiro: value, resultado: result };
  check([e], summarize([e]));
}
const sample77 = [...Array.from({ length: 31 }, () => ({ valor_tiro: 2, resultado: 'anotado' })),
  ...Array.from({ length: 5 }, () => ({ valor_tiro: 3, resultado: 'anotado' }))];
assert.deepEqual(summarize(sample77), { attempts: 36, made: 36, missed: 0, pointsAllowed: 77 });
const dashboard77 = buildDashboardModel(config, sample77.map(e => ({ ...e, gameId: game.id,
  categoria_id: 'directo', accion_id: 'pr_pop', defensa_id: 'blue' })), game.id);
for (const s of [dashboard77.total, dashboard77.groups[2], dashboard77.groups[2].matrix.total,
  dashboard77.groups[2].matrix.rows.find(r => r.id === 'pr_pop'), dashboard77.groups[2].rows.find(r => r.id === 'blue'),
  dashboard77.groups[2].matrix.cells.find(c => c.actionId === 'pr_pop' && c.defenseId === 'blue')]) {
  check(sample77, s);
  assert.equal(s.made, 36); assert.equal(s.pointsAllowed, 77);
}

const events = [];
for (const category of config.categories) for (const action of category.actions) {
  for (const defense of action.defenses.length ? action.defenses : [null]) {
    const selection = resolveSelection(config, { category: category.id, actionId: action.id, strategyId: defense?.id ?? null });
    for (const points of selection.shots) for (const result of ['anotado', 'fallado']) {
      events.push(makeShotEvent(String(events.length), game, selection, points, result));
    }
  }
}
// Volúmenes desiguales para detectar promedios de tasas en lugar de sumar eventos.
events.push(...Array.from({ length: 7 }, () => ({ ...events.find(e => e.defensa_id === 'black'), resultado: 'fallado' })));
events.push({ ...events[0], gameId: 'otro', resultado: 'anotado' });
const before = JSON.stringify({ config, events });
const model = buildDashboardModel(config, events, game.id), active = events.filter(e => e.gameId === game.id);
check(active, model.total);
for (const group of model.groups) {
  const groupEvents = active.filter(e => e.categoria_id === group.id);
  check(groupEvents, group);
  for (const row of group.rows) check(groupEvents.filter(e => (group.id === 'directo' ? e.defensa_id : e.accion_id) === row.id), row);
}
const matrix = model.groups[2].matrix, directEvents = active.filter(e => e.categoria_id === 'directo');
assert.equal(matrix.cells.length, 24);
assert.deepEqual(matrix.rows.map(r => r.name), ['PR Manejador', 'PR Roller', 'PR Pop']);
assert.deepEqual(matrix.columns.map(c => c.name), ['Black', 'White', 'Blue', 'Red', 'Tut', 'Next', 'Dance', 'Quick+Under']);
for (const cell of matrix.cells) check(directEvents.filter(e => e.accion_id === cell.actionId && e.defensa_id === cell.defenseId), cell);
for (const row of matrix.rows) check(directEvents.filter(e => e.accion_id === row.id), row);
for (const column of matrix.columns) check(directEvents.filter(e => e.defensa_id === column.id), column);
check(directEvents, matrix.total);
function sums(m) {
  for (const key of ['attempts', 'missed', 'made', 'pointsAllowed']) for (const axis of ['rows', 'columns', 'cells']) {
    assert.equal(m[axis].reduce((n, s) => n + s[key], 0), m.total[key], `${axis}: ${key}`);
  }
}
sums(matrix);
assert.equal(JSON.stringify({ config, events }), before);
const empty = buildDashboardModel(config, events, null).groups[2].matrix;
assert.equal(empty.cells.length, 24);
assert(empty.cells.every(c => c.attempts === 0 && c.pointsPerAttempt === null && c.successRate === null && !c.badge));
assert.equal(buildDashboardModel(config, events, 'otro').total.attempts, 1);

const item = (attempts, pointsAllowed) => ({ attempts, pointsAllowed });
assert.deepEqual(comparePerformance([item(1, 0), item(4, 0), item(5, 2), item(5, 8)]).map(x => x.badge), [null, null, 'best', 'worst']);
assert(comparePerformance([item(5, 2)]).every(x => !x.badge));
assert(comparePerformance([item(5, 5), item(10, 10)]).every(x => !x.badge));
assert.deepEqual(comparePerformance([item(5, 2), item(10, 4), item(5, 8), item(10, 16)]).map(x => x.badge), ['best', 'best', 'worst', 'worst']);
assert.deepEqual(comparePerformance([item(1000, 1001), item(1000, 1002)]).map(x => x.badge), ['best', 'worst']); // Redondean igual.
assert.deepEqual(comparePerformance([item(5, 6), item(20, 20)]).map(x => x.badge), ['worst', 'best']); // Menos puntos totales no implica mejor tasa.
for (const axis of ['rows', 'columns', 'cells']) assert.deepEqual(matrix[axis].map(x => x.badge), comparePerformance(matrix[axis]).map(x => x.badge));

const changed = structuredClone(config);
changed.categories[2].actions[0].name = 'Manejador renombrado';
changed.categories[2].actions[0].defenses[0].name = 'Black renombrada';
const renamed = buildDashboardModel(changed, events, game.id).groups[2].matrix;
assert.equal(renamed.rows[0].name, 'Manejador renombrado');
assert.equal(renamed.total.pointsAllowed, matrix.total.pointsAllowed);
changed.categories[2].actions.shift();
for (const a of changed.categories[2].actions) a.defenses = a.defenses.filter(d => d.id !== 'black');
const removed = buildDashboardModel(changed, events, game.id).groups[2].matrix;
assert(removed.rows.find(r => r.id === 'pr_manejador').historical);
assert(removed.columns.find(c => c.id === 'black').historical);
sums(removed);
assert.equal(removed.total.attempts, matrix.total.attempts);
const legacy = { gameId: game.id, categoria: 'Bloqueo directo', accion: 'PR Pop', tipo_bloqueo: 'PR Pop', estrategia: 'Blue', resultado: 'anotado', valor_tiro: 3 };
const history = [...events, legacy, { ...events.find(e => e.categoria_id === 'directo'), accion_id: 'retirado', defensa_id: 'retirada' },
  { ...events.find(e => e.categoria_id === 'directo'), defensa_id: null }, { gameId: game.id, categoria: 'Desconocida', valor_tiro: 2, resultado: 'anotado' }];
const historical = buildDashboardModel(config, history, game.id);
sums(historical.groups[2].matrix);
assert.equal(historical.unclassified, 1);
assert.equal(historical.groups[2].matrix.columns.find(c => c.id === null).attempts, 1);
assert.equal(historical.groups[2].matrix.cells.find(c => c.actionId === 'pr_pop' && c.defenseId === 'blue').pointsAllowed, 8);
sums(buildDashboardModel(null, history, game.id).groups[2].matrix);
console.log(`Matriz: ${assertions} agregaciones comprobadas; cuatro resultados, 36/77, totales, tasas ponderadas, aislamiento, vacíos, umbral, empates e históricos correctos.`);
