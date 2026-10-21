import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseConfiguration } from '../js/configuracion.js';
import { docFromConfiguration, idsInDoc } from '../js/configuracion-guardada.js';
import { validatePanel, mergePanelRecord, panelSnapshot, panelCanonical } from '../js/panel-model.js';
const doc = docFromConfiguration(parseConfiguration(await readFile(new URL('../categorias.csv', import.meta.url), 'utf8')));
const ids = idsInDoc(doc);
const panel = { version: { id: 'cfg-test14', createdAt: '2026-10-20T12:00:00Z', source: 'editor', basedOn: null, csvHash: null, doc },
  usedIds: { actions: [...ids.actions], defenses: [...ids.defenses] } };
assert.equal(validatePanel(panel), panel);
const record = mergePanelRecord(null, panel, true), before = panelCanonical(record);
const next = structuredClone(panel); next.version.id = 'cfg-next14'; next.version.basedOn = panel.version.id;
next.version.doc.categories[0].items[0].name = 'Cambio';
const merged = mergePanelRecord(record, next, true);
assert.equal(panelCanonical(record), before); assert.equal(merged.versions.length, 2);
assert.deepEqual(panelSnapshot(merged, { game: [panel.version.id] }, 'game', true), panel);
assert.equal(mergePanelRecord(merged, next, true), merged, 'Un eco idéntico no incrementa la revisión');
const collision = structuredClone(next); collision.version.doc.categories[0].items[0].name = 'Otro';
assert.throws(() => mergePanelRecord(merged, collision), { code: 'SYNC_CONFLICT' });
for (const mutate of [p => { delete p.version.doc; }, p => { p.version.doc.categories = []; },
  p => { p.version.doc.categories[0].items[0].shots = [4]; }, p => { p.version.source = 'externo'; },
  p => { p.usedIds.actions = []; }, p => { p.version.doc.categories[0].items[0].id = '<script>'; },
  p => { p.version.doc.categories[0].items[0].name = 'x'.repeat(41); }]) {
  const invalid = structuredClone(panel); mutate(invalid); assert.throws(() => validatePanel(invalid), { code: 'INVALID_CONFIG' });
}
console.log('Panel compartido: contrato válido, datos malformados rechazados, versiones inmutables, eco idempotente y vínculo histórico conservado.');
