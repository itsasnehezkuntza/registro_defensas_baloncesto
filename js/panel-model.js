// Contrato de panel compartido; sin DOM, SDK o escrituras deportivas.
export const PANEL_DEFAULT = '@configuration';
export const panelKey = (key, c) => c?.scope ? `${key}:${c.scope}` : key;
export const panelCanonical = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const bad = () => Object.assign(Error('La configuración compartida no es válida.'), { code: 'INVALID_CONFIG' });
export function validatePanel(panel) {
  const text = (value, max) => typeof value === 'string' && value.length > 0 && value.length <= max;
  const keys = (object, allowed) => object && typeof object === 'object' && !Array.isArray(object) && Object.keys(object).every(key => allowed.includes(key));
  const ids = list => Array.isArray(list) && list.length <= 4096 && new Set(list).size === list.length && list.every(id => text(id, 128) && /^[a-z][a-z0-9_-]*$/.test(id));
  const shots = list => Array.isArray(list) && list.length <= 2 && new Set(list).size === list.length && list.every(n => n === 2 || n === 3);
  const items = list => Array.isArray(list) && list.length <= 128 && new Set(list.map(item => item?.id)).size === list.length && list.every(item =>
    keys(item, ['id', 'name', 'shots', 'retired']) && text(item.id, 128) && /^[a-z][a-z0-9_-]*$/.test(item.id) && text(item.name, 40) && shots(item.shots) && item.shots.length && typeof item.retired === 'boolean');
  if (!keys(panel, ['version', 'usedIds']) || !keys(panel.usedIds, ['actions', 'defenses']) || !ids(panel.usedIds.actions) || !ids(panel.usedIds.defenses)) throw bad();
  const v = panel.version;
  if (!keys(v, ['id', 'createdAt', 'source', 'basedOn', 'csvHash', 'doc']) || !text(v.id, 128) || !/^cfg-[a-zA-Z0-9-]+$/.test(v.id) ||
    !text(v.createdAt, 64) || !Number.isFinite(Date.parse(v.createdAt)) || !['csv', 'editor', 'restore'].includes(v.source) ||
    !(v.basedOn === null || text(v.basedOn, 128)) || !(v.csvHash === null || text(v.csvHash, 128))) throw bad();
  const doc = v.doc;
  if (!keys(doc, ['schema', 'categories']) || doc.schema !== 1 || !Array.isArray(doc.categories) || doc.categories.length !== 3) throw bad();
  for (const [index, section] of doc.categories.entries()) {
    if (section?.id !== ['transicion', 'estatico', 'directo'][index] || !text(section.name, 80)) throw bad();
    if (section.id !== 'directo') {
      if (!keys(section, ['id', 'name', 'items']) || !items(section.items)) throw bad();
      for (const item of section.items) if (!panel.usedIds.actions.includes(item.id)) throw bad();
    } else {
      if (!keys(section, ['id', 'name', 'types', 'defenses', 'cells']) || !items(section.types) || !items(section.defenses) || !section.cells || typeof section.cells !== 'object' || Array.isArray(section.cells)) throw bad();
      for (const item of section.types) if (!panel.usedIds.actions.includes(item.id)) throw bad();
      for (const item of section.defenses) if (!panel.usedIds.defenses.includes(item.id)) throw bad();
      for (const [key, value] of Object.entries(section.cells)) {
        const [type, defense, extra] = key.split('/');
        if (extra || !section.types.some(item => item.id === type) || !section.defenses.some(item => item.id === defense) || !shots(value)) throw bad();
      }
    }
  }
  if (new TextEncoder().encode(JSON.stringify(panel)).length > 131072) throw bad();
  return panel;
}
export function panelSnapshot(record, usage = {}, gameId = null, hasEvents = false) {
  if (!record) return null;
  const id = usage?.[gameId]?.at(-1) ?? (hasEvents ? record.baselineId : record.currentId);
  const current = record.versions.find(v => v.id === record.currentId);
  let version = record.versions.find(v => v.id === id) ?? current;
  if (!hasEvents && ['csv', 'restore'].includes(version.source) && ['csv', 'restore'].includes(current.source)) version = current;
  return structuredClone(validatePanel({ version, usedIds: record.usedIds }));
}
// Añadir versiones nunca sustituye una versión histórica con el mismo ID.
export function mergePanelRecord(record, panel, makeCurrent = false) {
  validatePanel(panel);
  const v = panel.version, old = record?.versions.find(item => item.id === v.id);
  if (old && panelCanonical(old) !== panelCanonical(v)) throw Object.assign(Error('ID de configuración conflictivo.'), { code: 'SYNC_CONFLICT' });
  if (!record) return { schema: 1, revision: 1, currentId: v.id, baselineId: v.id, usedIds: panel.usedIds, versions: [v], updatedAt: v.createdAt, origin: 'cloud', syncHead: makeCurrent ? v.id : null };
  if (old && (!makeCurrent || (record.currentId === v.id && record.syncHead === v.id)) &&
    panel.usedIds.actions.every(id => record.usedIds.actions.includes(id)) && panel.usedIds.defenses.every(id => record.usedIds.defenses.includes(id))) return record;
  return { ...record, revision: record.revision + 1, currentId: makeCurrent ? v.id : record.currentId,
    syncHead: makeCurrent ? v.id : record.syncHead ?? null,
    versions: old ? record.versions : [...record.versions, v],
    usedIds: { actions: [...new Set([...record.usedIds.actions, ...panel.usedIds.actions])], defenses: [...new Set([...record.usedIds.defenses, ...panel.usedIds.defenses])] },
    updatedAt: makeCurrent ? v.createdAt : record.updatedAt };
}
