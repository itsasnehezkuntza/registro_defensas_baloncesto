// Modelo del editor de botones (Fase 9B): funciones puras, sin IndexedDB.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseConfiguration } from '../js/configuracion.js';
import { docFromConfiguration, configurationFromDoc, validateDoc, newId, mergeIntoDoc, idsInDoc,
  textHash, intersectShots, versionForGame, eventCounts } from '../js/configuracion-guardada.js';
import { balancedRows, rowCandidates } from '../js/distribucion.js';

const csv = await readFile(new URL('../categorias.csv', import.meta.url), 'utf8');
const parsed = parseConfiguration(csv);
const doc = docFromConfiguration(parsed);

// Ida y vuelta: el CSV vigente produce exactamente la misma configuración de ejecución.
assert.deepEqual(configurationFromDoc(doc), parsed);
assert.deepEqual(doc.categories.find(c => c.id === 'directo').cells, {}, 'El CSV vigente sigue la regla tipo ∩ defensa');
assert.deepEqual(doc.categories.find(c => c.id === 'directo').types.find(t => t.id === 'pr_roller').shots, [2]);
assert.deepEqual(validateDoc(doc), []);

// Un CSV que no sigue la regla conserva su excepción por celda y su ausencia de combinación.
const irregular = parseConfiguration(csv.replace('directo;Bloqueo directo;pr_pop;PR Pop;blue;Blue;2,3', 'directo;Bloqueo directo;pr_pop;PR Pop;blue;Blue;3')
  .split('\n').filter(l => !l.includes(';pr_pop;PR Pop;red;')).join('\n'));
const irregularDoc = docFromConfiguration(irregular);
assert.deepEqual(irregularDoc.categories[2].cells, { 'pr_pop/blue': [3], 'pr_pop/red': [] });
assert.deepEqual(configurationFromDoc(irregularDoc), irregular);

// Tiros: intersección ordenada; una celda sin tiros comunes no se ofrece.
assert.deepEqual(intersectShots([3, 2], [2, 3]), [2, 3]);
assert.deepEqual(intersectShots([2], [3]), []);
const noShared = structuredClone(doc);
noShared.categories[2].defenses.forEach(d => { d.shots = [3]; });
assert(validateDoc(noShared).some(e => e.includes('PR Roller')), 'Roller sin tiros comunes debe impedir guardar');

// IDs: estables, legibles, nunca reutilizados (aunque el elemento anterior se borrara).
const used = new Set(['estatico_flex', 'estatico_flex_2']);
assert.equal(newId('Flex', used, 'estatico'), 'estatico_flex_3');
assert.equal(newId('Ángulo débil', new Set(), 'estatico'), 'estatico_angulo_debil');
assert.equal(newId('2x2', new Set()), 'b_2x2');
assert.equal(newId('Ice', new Set(['ice'])), 'ice_2');

// Validación: nombre vacío, repetido, sin tiros, sección vacía.
const bad = structuredClone(doc);
bad.categories[0].items[0].name = ' ';
bad.categories[1].items[1].name = bad.categories[1].items[0].name;
bad.categories[1].items[2].shots = [];
bad.categories[2].defenses.forEach(d => { d.retired = true; });
const errors = validateDoc(bad);
for (const fragment of ['sin nombre', 'repetido', 'no permite ningún tiro', 'una defensa activa']) assert(errors.some(e => e.includes(fragment)), fragment);

// Restaurar: lo que no está en el CSV queda retirado con su nombre; nada se pierde.
const edited = structuredClone(doc);
edited.categories[1].items.push({ id: 'estatico_flex', name: 'Flex', shots: [2], retired: false });
edited.categories[0].items[0].name = 'Cerca del aro';
const restored = mergeIntoDoc(edited, doc);
assert.equal(restored.categories[0].items[0].name, 'Bajo aro');
assert.deepEqual(restored.categories[1].items.at(-1), { id: 'estatico_flex', name: 'Flex', shots: [2], retired: true });
assert.deepEqual(configurationFromDoc(restored), parsed);
assert(idsInDoc(restored).actions.has('estatico_flex'));

// Cambio del CSV detectado por su huella; BOM y CRLF no cuentan como cambio.
assert.equal(textHash(csv), textHash('﻿' + csv.replace(/\r?\n/g, '\r\n')));
assert.notEqual(textHash(csv), textHash(csv + 'x'));

// Versión por partido: la última usada; antes de 9B con tiros, la inicial; sin tiros, la vigente.
const record = { currentId: 'c', baselineId: 'b', versions: [{ id: 'b' }, { id: 'x' }, { id: 'c' }] };
assert.equal(versionForGame(record, { g: ['b', 'x'] }, 'g', true).id, 'x');
assert.equal(versionForGame(record, {}, 'g', true).id, 'b');
assert.equal(versionForGame(record, {}, 'g', false).id, 'c');
// Un partido con la configuración del archivo sigue al CSV vigente; uno editado queda fijo.
const files = { currentId: 'c2', baselineId: 'c1', versions: [{ id: 'c1', source: 'csv' }, { id: 'e1', source: 'editor' }, { id: 'c2', source: 'csv' }] };
assert.equal(versionForGame(files, { g: ['c1'] }, 'g', false).id, 'c2');
assert.equal(versionForGame(files, { g: ['c1'] }, 'g', true).id, 'c1'); // Con tiros, nunca cambia.
assert.equal(versionForGame(files, { g: ['e1'] }, 'g', true).id, 'e1');
const editedDefault = { ...files, currentId: 'e1' };
assert.equal(versionForGame(editedDefault, { g: ['c1'] }, 'g', true).id, 'c1');

// Recuento por ID (incluye eventos v1 sin IDs).
const counts = await eventCounts([{ categoria_id: 'directo', accion_id: 'pr_pop', defensa_id: 'blue' },
  { categoria: 'Bloqueo directo', accion: 'PR Roller', tipo_bloqueo: 'PR Roller', estrategia: 'Blue' }]);
assert.equal(counts.defenses.get('blue'), 2);
assert.equal(counts.actions.get('pr_roller'), 1);

// Filas equilibradas: diferencia máxima 1, sin perder botones (1 a 12 botones, 1 a 6 filas).
for (let n = 1; n <= 12; n++) for (let rows = 1; rows <= 6; rows++) {
  const sizes = balancedRows(n, rows);
  assert.equal(sizes.reduce((a, b) => a + b, 0), n);
  assert(Math.max(...sizes) - Math.min(...sizes) <= 1);
  assert(sizes.every(size => size > 0));
}
assert.deepEqual(balancedRows(5, 2), [3, 2]);
assert.deepEqual(balancedRows(7, 2), [4, 3]);
assert.deepEqual(balancedRows(4, 2), [2, 2]);
assert.deepEqual(rowCandidates(1), [1]);
assert.deepEqual(rowCandidates(12), [2, 3, 1, 4, 5, 6]);
console.log('Editor de botones: ida y vuelta CSV, excepciones por celda, intersección de tiros, IDs nunca reutilizados, validación, restaurar, versiones por partido y filas equilibradas correctos.');
