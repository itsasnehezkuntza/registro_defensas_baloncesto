import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseConfiguration } from '../js/configuracion.js';
import { buildDashboardModel, rankBySuccess, successBadges, MIN_COMPARISON_ATTEMPTS, defenseBarGroups, MAX_DEFENSE_BARS } from '../js/dashboard.js';
import { outcomeMarkup, outcomeText } from '../js/estadisticas.js';

// Presentación V4: orden de mejor a peor por fallados/intentos exacto y distintivos con muestra mínima.
const item = (order, missed, made) => ({ order, id: 'i' + order, missed, made, attempts: missed + made });
assert.equal(MIN_COMPARISON_ATTEMPTS, 5);
// Orden exacto, empates en orden de configuración y vacíos al final.
const ranked = rankBySuccess([item(0, 0, 0), item(1, 2, 2), item(2, 4, 1), item(3, 3, 2), item(4, 8, 2), item(5, 1, 1)]);
assert.deepEqual(ranked.map(x => x.order), [2, 4, 3, 1, 5, 0]);
// 2/3 (66,67 %) frente a 666/1000 (66,6 %): redondean igual, pero el producto cruzado los distingue.
assert.deepEqual(rankBySuccess([item(0, 666, 334), item(1, 2, 1)]).map(x => x.order), [1, 0]);
// Umbral: con menos de 5 intentos no se marca nada, aunque sea el extremo.
assert.deepEqual(successBadges([item(0, 4, 0), item(1, 4, 1), item(2, 2, 3), item(3, 0, 3)]).map(x => x.verdict), [null, 'best', 'worst', null]);
// Un solo candidato o todos iguales: sin distintivos.
assert(successBadges([item(0, 4, 1), item(1, 1, 1)]).every(x => !x.verdict));
assert(successBadges([item(0, 4, 1), item(1, 8, 2)]).every(x => !x.verdict));
// Empates en un extremo comparten etiqueta.
assert.deepEqual(successBadges([item(0, 4, 1), item(1, 8, 2), item(2, 1, 4), item(3, 2, 8)]).map(x => x.verdict), ['best', 'best', 'worst', 'worst']);
// Sin datos: nada.
assert(successBadges([item(0, 0, 0), item(1, 0, 0)]).every(x => !x.verdict));
// Marcado sin alterar el texto fallados/aciertos.
for (const stat of [{ attempts: 0, missed: 0, made: 0 }, { attempts: 6, missed: 4, made: 2 }, { attempts: 3, missed: 0, made: 3 }]) {
  assert.equal(outcomeMarkup(stat).replace(/<[^>]+>/g, ''), outcomeText(stat));
}
// Columnas reales del CSV vigente: entradas inmutables y verdicto coherente con las cifras.
const config = parseConfiguration(await readFile(new URL('../categorias.csv', import.meta.url), 'utf8'));
const shot = (defense, result) => ({ gameId: 'g', categoria_id: 'directo', accion_id: 'pr_pop', defensa_id: defense, resultado: result, valor_tiro: 2 });
const events = [...Array(5)].map(() => shot('white', 'fallado')).concat([...Array(5)].map((_, i) => shot('blue', i < 2 ? 'fallado' : 'anotado')), [shot('red', 'anotado')]);
const before = JSON.stringify(events);
const columns = successBadges(buildDashboardModel(config, events, 'g').groups[2].matrix.columns);
assert.equal(columns.find(c => c.id === 'white').verdict, 'best');
assert.equal(columns.find(c => c.id === 'blue').verdict, 'worst');
assert.equal(columns.find(c => c.id === 'red').verdict, null);
assert.equal(JSON.stringify(events), before);
// Fase 9D: barras de la tarjeta coral. Hasta 6, todas; con más, 3 mejores y 3 peores (empates por configuración).
assert.equal(MAX_DEFENSE_BARS, 6);
const cols = n => Array.from({ length: n }, (_, i) => item(i, i % 4, 3));
assert.equal(defenseBarGroups(cols(6)).groups[0].items.length, 6);
const many = [item(0, 1, 4), item(1, 5, 0), item(2, 0, 5), item(3, 3, 2), item(4, 4, 1), item(5, 2, 3), item(6, 5, 0), item(7, 0, 0)];
const bars = defenseBarGroups(many);
assert.deepEqual(bars.groups.map(g => g.label), ['Mejores', 'Peores']);
assert.deepEqual(bars.groups[0].items.map(x => x.order), [1, 6, 4]);
assert.deepEqual(bars.groups[1].items.map(x => x.order), [5, 0, 2]);
assert.equal(defenseBarGroups([...cols(4), item(4, 0, 0), item(5, 0, 0), item(6, 0, 0)]).groups[0].items.length, 4); // Solo las que tienen tiros.
console.log('Diseño V4: barras de mejores/peores defensas, orden de mejor a peor exacto, empates, umbral de 5 intentos, marcado fallados/aciertos e inmutabilidad correctos.');
