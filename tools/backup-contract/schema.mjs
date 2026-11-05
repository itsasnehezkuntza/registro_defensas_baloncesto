// Contrato declarativo cerrado. No importa código de la aplicación.
import { fail } from './json.mjs';
export const SOURCE_SECTIONS = Object.freeze({
  games: 'localGames', events: 'localEvents', settings: 'settings',
  cloudGames: 'cloudGames', cloudEvents: 'cloudEvents', cloudTombs: 'tombstones',
  syncQueue: 'pendingIntents', syncMeta: 'metadata', syncBindings: 'bindings'
});
export const SECTIONS = Object.freeze(Object.values(SOURCE_SECTIONS));
export const FEATURES = Object.freeze(['inactive-intents', 'local-snapshot', 'panel-history', 'source-seq', 'tombstones']);
// Compatibilidad del lector actual, independiente de la versión del formato.
export const SUPPORTED_APP_VERSIONS = Object.freeze(['23.0']);
const str = (min = 1, max = 256, pattern = null) => ({ type: 'string', min, max, pattern });
const integer = (min = 0) => ({ type: 'integer', min });
const literal = value => ({ type: 'literal', value });
const enumeration = (...values) => ({ type: 'enum', values });
const array = (item, max = 100000) => ({ type: 'array', item, max });
const object = fields => ({ type: 'object', fields });
const optional = inner => ({ ...inner, optional: true });
const nullable = inner => ({ type: 'nullable', inner });
const union = (tag, cases) => ({ type: 'union', tag, cases });
const tuple = (...items) => ({ type: 'tuple', items });
const bool = { type: 'boolean' }, id = str(), panelId = str(1, 128, /^cfg-[a-zA-Z0-9-]+$/);
const date = str(1, 64); // La validez calendárica se comprueba aparte.
const hash = str(64, 64, /^[a-f0-9]{64}$/);
const scope = tuple(id, id, id), localScope = nullable(scope), account = tuple(id, id);
const usedId = str(1, 128, /^[a-z][a-z0-9_-]*$/);
const shots = array(enumeration(2, 3), 2);
const item = object({ id: usedId, name: str(1, 40), shots, retired: bool });
const simpleCategory = object({ id: enumeration('transicion', 'estatico'), name: str(1, 80), items: array(item, 128) });
const directCategory = object({ id: literal('directo'), name: str(1, 80), types: array(item, 128), defenses: array(item, 128),
  cells: { type: 'dictionary', value: shots, pattern: /^[a-z][a-z0-9_-]*\/[a-z][a-z0-9_-]*$/ } });
const doc = object({ schema: literal(1), categories: tuple(simpleCategory, simpleCategory, directCategory) });
const usedIds = object({ actions: array(usedId, 4096), defenses: array(usedId, 4096) });
const version = object({ id: panelId, createdAt: date, source: enumeration('csv', 'editor', 'restore'), basedOn: nullable(panelId), csvHash: nullable(str(1, 128)), doc });
const panel = object({ version, usedIds });
const panelRecord = object({ schema: literal(1), revision: integer(1), currentId: panelId, baselineId: panelId,
  usedIds, versions: array(version, 4096), updatedAt: date, origin: enumeration('local', 'cloud'), syncHead: optional(nullable(panelId)) });
export const gamePayload = object({ id, jornada: str(1, 256), rival: str(1, 1024), createdAt: date });
export const eventPayload = object({ id, gameId: id, jornada: optional(str(1, 256)), rival: optional(str(1, 1024)),
  categoria: str(1, 256), accion: str(1, 256), categoria_id: optional(nullable(id)), accion_id: optional(nullable(id)),
  defensa_id: optional(nullable(id)), estrategia: optional(nullable(id)), tipo_bloqueo: optional(nullable(id)),
  tiros_permitidos: optional(shots), valor_tiro: enumeration(2, 3), resultado: enumeration('anotado', 'fallado'), fecha_hora: date, seq: optional(integer(1)) });
const cloudState = enumeration('cloud-status-unknown', 'pending-local-ack', 'blocked');
const operationBase = { opId: id, scope, gameId: id, eventId: nullable(id), sourceId: str(0, 256), createdAt: integer(),
  blocked: bool, error: optional(nullable(str(1, 128, /^[a-zA-Z0-9_./-]+$/))), executable: literal(false) };
const operation = (type, payload, extra = {}) => object({ ...operationBase, type: literal(type), payload, ...extra });
const pending = union('type', {
  game: operation('game', gamePayload), event: operation('event', eventPayload, { panelVersionId: optional(nullable(panelId)) }),
  delete: operation('delete', gamePayload), undo: operation('undo', literal(null)),
  panel: operation('panel', panel, { baseId: nullable(panelId) }),
  'default-panel': operation('default-panel', panel, { baseId: nullable(panelId) })
});
const sections = {
  localGames: array(gamePayload),
  localEvents: array(object({ sourceSeq: integer(1), payload: eventPayload })),
  settings: array(union('kind', {
    'panel-record': object({ kind: literal('panel-record'), scope: localScope, record: panelRecord }),
    'game-usage': object({ kind: literal('game-usage'), scope: localScope, games: array(object({ gameId: id, versionIds: array(panelId, 4096) })) }),
    'active-local': object({ kind: literal('active-local'), gameId: id })
  })),
  cloudGames: array(object({ scope, gameId: id, payload: gamePayload, deleted: bool, sourceId: optional(str(0, 256)), panel: optional(panel), cloudState })),
  cloudEvents: array(object({ sourceSeq: integer(1), scope, gameId: id, eventId: id, payload: eventPayload,
    deleted: bool, sourceId: optional(str(0, 256)), cloudState })),
  tombstones: array(object({ scope, gameId: id, eventId: optional(id) })),
  pendingIntents: array(pending),
  metadata: array(union('kind', {
    source: object({ kind: literal('source'), value: id }),
    'legacy-owner': object({ kind: literal('legacy-owner'), gameId: id, uid: id, imported: optional(bool) }),
    teams: object({ kind: literal('teams'), account, teams: array(object({ id, name: str(1, 120) })) }),
    'preferred-team': object({ kind: literal('preferred-team'), account, teamId: id }),
    'active-team': object({ kind: literal('active-team'), scope, gameId: id })
  })),
  bindings: array(object({ scope, localGameId: id, gameId: id, source: id }))
};
const sectionManifest = object({ count: integer(), bytes: integer(), sha256: hash });
const storeManifest = object({ present: bool, read: enumeration('complete', 'incomplete', 'absent'), sourceRows: integer(), excludedRows: integer(), transientRows: integer(), omittedRows: integer() });
export const TOTAL_FIELDS = Object.freeze(['representations', 'logicalGames', 'originals', 'localEvents', 'cloudEvents', 'liveEvents', 'deletedEvents', 'originalEvents', 'tombstones', 'teams', 'versions', 'pending', 'blocked']);
export const BACKUP_SCHEMA = object({
  format: literal('registro-defensivo-backup'), formatVersion: object({ major: literal(1), minor: literal(0) }),
  backupId: str(36, 36, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/), exportedAt: date,
  producer: object({ appVersion: enumeration(...SUPPORTED_APP_VERSIONS), buildId: nullable(str(1, 128)), sourceCommit: str(40, 40, /^[a-f0-9]{40}$/), contractVersion: literal('1.0') }),
  origin: object({ webOrigin: nullable(str(1, 2048)), databaseName: literal('registro_defensivo_baloncesto'), databaseVersion: enumeration(1, 2),
    lineageKind: enumeration('sync-source', 'unresolved'), lineageId: nullable(id) }),
  schemas: object({ indexedDb: enumeration(1, 2), panelRecord: literal(1), panelDoc: literal(1), remoteEnvelope: literal(1) }),
  coverage: object({ account: nullable(account), includedScopes: array(localScope, 1024),
    excluded: array(object({ reason: enumeration('other-account', 'not-selected'), scopeCount: integer(1) }), 2),
    localSnapshotComplete: bool, remoteInventory: literal('not-performed'),
    omissions: array(object({ section: enumeration(...SECTIONS), count: integer(1), reason: enumeration('read-error', 'unsupported-row', 'not-captured') })),
    missingHistoricalPanels: array(object({ store: enumeration('games', 'cloudGames'), scope: localScope, gameId: id })),
    unresolvedImportedOriginals: array(id),
    detachedGameUsage: array(object({ scope: localScope, gameId: id })),
    externalBaseVersions: array(object({ scope: localScope, versionId: panelId })) }),
  manifest: object({ requiredFeatures: array(str(1, 64), 32),
    stores: object(Object.fromEntries(Object.keys(SOURCE_SECTIONS).map(name => [name, storeManifest]))),
    sections: object(Object.fromEntries(SECTIONS.map(name => [name, sectionManifest]))),
    totals: object(Object.fromEntries(TOTAL_FIELDS.map(name => [name, integer()]))) }),
  data: object(sections),
  integrity: object({ algorithm: literal('SHA-256'), canonicalization: literal('RFC8785'), digest: hash })
});

export function shape(value, rule, path = '$') {
  if (rule.type === 'nullable') { if (value !== null) shape(value, rule.inner, path); return; }
  if (rule.type === 'literal') { if (value !== rule.value) fail('VALUE', path, 'Valor fijo no reconocido.'); return; }
  if (rule.type === 'enum') { if (!rule.values.includes(value)) fail('VALUE', path, 'Valor fuera del contrato.'); return; }
  if (rule.type === 'integer') { if (!Number.isSafeInteger(value) || value < rule.min) fail('INTEGER', path, 'Entero fuera del rango permitido.'); return; }
  if (rule.type === 'boolean') { if (typeof value !== 'boolean') fail('TYPE', path, 'Se requiere booleano.'); return; }
  if (rule.type === 'string') {
    if (typeof value !== 'string' || value.length < rule.min || value.length > rule.max || (rule.pattern && !rule.pattern.test(value))) fail('STRING', path, 'Texto fuera del contrato.');
    return;
  }
  if (rule.type === 'array' || rule.type === 'tuple') {
    if (!Array.isArray(value)) fail('TYPE', path, 'Se requiere array.');
    if ((rule.type === 'tuple' && value.length !== rule.items.length) || (rule.type === 'array' && value.length > rule.max)) fail('ARRAY_SIZE', path, 'Longitud de array incompatible.');
    value.forEach((item, i) => shape(item, rule.type === 'array' ? rule.item : rule.items[i], `${path}[${i}]`)); return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('TYPE', path, 'Se requiere objeto.');
  if (rule.type === 'union') {
    if (!Object.hasOwn(value, rule.tag)) fail('MISSING_FIELD', path, 'Falta discriminante obligatorio.', 'incomplete');
    if (typeof value[rule.tag] !== 'string') fail('TYPE', `${path}.${rule.tag}`, 'El discriminante debe ser texto.');
    const selected = Object.hasOwn(rule.cases, value[rule.tag]) ? rule.cases[value[rule.tag]] : null;
    if (!selected) fail('VALUE', `${path}.${rule.tag}`, 'Variante no contemplada.');
    shape(value, selected, path); return;
  }
  if (rule.type === 'dictionary') {
    for (const [key, item] of Object.entries(value)) {
      if (!rule.pattern.test(key)) fail('FIELD', path, 'Clave de celda no válida.');
      shape(item, rule.value, `${path}.${key}`);
    }
    return;
  }
  for (const key of Object.keys(value)) if (!Object.hasOwn(rule.fields, key)) fail('UNKNOWN_FIELD', `${path}.${key}`, 'Campo no contemplado; no se ignora.');
  for (const [key, inner] of Object.entries(rule.fields)) {
    if (!Object.hasOwn(value, key)) { if (!inner.optional) fail('MISSING_FIELD', `${path}.${key}`, 'Falta campo obligatorio.', 'incomplete'); }
    else shape(value[key], inner, `${path}.${key}`);
  }
}
