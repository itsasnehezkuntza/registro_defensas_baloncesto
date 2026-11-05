import { ContractError, parseStrict, canonicalize, fingerprint, canonicalBytes, fail } from './json.mjs';
import { BACKUP_SCHEMA, SOURCE_SECTIONS, SECTIONS, FEATURES, SUPPORTED_APP_VERSIONS, shape } from './schema.mjs';

const key = (...parts) => canonicalize(parts);
const same = (a, b) => canonicalize(a) === canonicalize(b);
const issue = (condition, code, path, message, status) => { if (!condition) fail(code, path, message, status); };
const unique = (values, path) => issue(new Set(values.map(value => canonicalize(value))).size === values.length, 'DUPLICATE_ID', path, 'Identidad repetida.');
const iso = (value, path) => issue(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value,
  'DATE', path, 'Se requiere una fecha UTC calendárica ISO de milisegundos.');
const required = (map, id, path, code = 'MISSING_REFERENCE') => {
  issue(map.has(id), code, path, 'Falta la entidad referenciada.', 'incomplete'); return map.get(id);
};
function mapUnique(rows, identity, path) {
  const map = new Map();
  for (const [i, row] of rows.entries()) {
    const id = identity(row);
    if (map.has(id)) fail(same(map.get(id), row) ? 'DUPLICATE_ID' : 'ID_CONFLICT', `${path}[${i}]`, 'Identidad repetida o conflictiva.');
    map.set(id, row);
  }
  return map;
}
function security(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  const forbidden = /^(accesstoken|refreshtoken|idtoken|token|credentials?|password|secret|privatekey|apikey|auth|cookies?|permissions?|roles?|owneruid|members|leases?|worker|until|attempts|nextattempt|purge.*|defensaspurgepending)$/;
  for (const [name, child] of Object.entries(value)) {
    if (forbidden.test(name.replace(/[-_]/g, '').toLowerCase())) fail('FORBIDDEN_FIELD', `${path}.${name}`, 'Dato de sesión, permiso o ejecución prohibido.');
    security(child, `${path}.${name}`);
  }
}

export function sectionIdentity(section, row) {
  if (section === 'localGames') return key(row.id);
  if (['localEvents', 'cloudEvents'].includes(section)) return row.sourceSeq;
  if (section === 'settings') return key(row.kind, row.scope ?? null);
  if (section === 'cloudGames') return key(row.scope, row.gameId);
  if (section === 'tombstones') return key(row.scope, row.gameId, row.eventId ?? null);
  if (section === 'pendingIntents') return key(row.scope, row.opId);
  if (section === 'bindings') return key(row.scope, row.localGameId);
  return key(row.kind, row.gameId ?? row.scope ?? row.account ?? null);
}
function panelRules(panel, path, addVersion, usedCache) {
  const { version, usedIds } = panel;
  let used = usedCache.get(usedIds);
  if (!used) {
    unique(usedIds.actions, path + '.usedIds.actions'); unique(usedIds.defenses, path + '.usedIds.defenses');
    used = { actions: new Set(usedIds.actions), defenses: new Set(usedIds.defenses) };
    usedCache.set(usedIds, used);
  }
  iso(version.createdAt, path + '.version.createdAt');
  const categories = version.doc.categories;
  issue(categories[0].id === 'transicion' && categories[1].id === 'estatico', 'PANEL_CATEGORIES', path, 'Orden de categorías incorrecto.');
  unique([...categories[0].items, ...categories[1].items, ...categories[2].types].map(item => item.id), path + '.actions');
  for (const [i, section] of categories.entries()) {
    for (const [listName, list, allowed] of section.id === 'directo'
      ? [['types', section.types, used.actions], ['defenses', section.defenses, used.defenses]]
      : [['items', section.items, used.actions]]) {
      unique(list.map(item => item.id), `${path}.version.doc.categories[${i}].${listName}`);
      for (const item of list) {
        issue(item.name.trim().length > 0 && item.shots.length > 0, 'PANEL_ITEM', path, 'Elemento de panel vacío.');
        unique(item.shots, path + '.shots');
        issue(allowed.has(item.id), 'PANEL_USED_ID', path, 'ID de panel ausente en usedIds.', 'incomplete');
      }
    }
    if (section.id === 'directo') {
      const types = new Set(section.types.map(item => item.id)), defenses = new Set(section.defenses.map(item => item.id));
      for (const [cell, shots] of Object.entries(section.cells)) {
        const [type, defense] = cell.split('/'); unique(shots, path + '.cells');
        issue(types.has(type) && defenses.has(defense), 'PANEL_CELL_REFERENCE', path, 'Celda sin tipo o defensa.', 'incomplete');
      }
    }
  }
  issue(canonicalBytes(panel) <= 131072, 'PANEL_SIZE', path, 'Panel excede contrato de origen.');
  addVersion(version);
}

function relationships(backup) {
  const { data: d, coverage: c } = backup, warnings = [];
  const scopes = new Set(c.includedScopes.map(scope => canonicalize(scope)));
  unique(c.includedScopes, '$.coverage.includedScopes');
  issue(scopes.size > 0, 'EMPTY_SCOPE', '$.coverage.includedScopes', 'Debe declararse al menos un ámbito.');
  const assertAccount = (account, path) => issue(c.account !== null && same(account, c.account), 'SCOPE_ACCOUNT', path, 'Ámbito ajeno a la cuenta declarada.');
  const assertScope = (scope, path) => {
    issue(scopes.has(canonicalize(scope)), 'SCOPE_EXCLUDED', path, 'Datos fuera del alcance declarado.');
    if (scope) assertAccount(scope.slice(0, 2), path);
  };
  for (const scope of c.includedScopes) if (scope) assertAccount(scope.slice(0, 2), '$.coverage.includedScopes');
  if (backup.origin.databaseVersion === 1) issue(c.includedScopes.every(scope => scope === null), 'V1_SCOPE', '$.coverage', 'v1 no contiene ámbitos Sync.');
  const local = mapUnique(d.localGames, row => key(row.id), '$.data.localGames');
  if (local.size || d.localEvents.length || d.settings.some(row => row.kind === 'active-local')) assertScope(null, '$.data.localGames');
  const cloud = mapUnique(d.cloudGames, row => key(row.scope, row.gameId), '$.data.cloudGames');
  const events = mapUnique(d.cloudEvents, row => key(row.scope, row.gameId, row.eventId), '$.data.cloudEvents');
  mapUnique(d.localEvents, row => key(row.payload.id), '$.data.localEvents');
  const tombs = mapUnique(d.tombstones, row => key(row.scope, row.gameId, row.eventId ?? null), '$.data.tombstones');
  mapUnique(d.pendingIntents, row => key(row.scope, row.opId), '$.data.pendingIntents');
  mapUnique(d.settings, row => key(row.kind, row.scope ?? null), '$.data.settings');
  mapUnique(d.metadata, row => sectionIdentity('metadata', row), '$.data.metadata');
  mapUnique(d.bindings, row => key(row.scope, row.localGameId), '$.data.bindings');
  unique(d.bindings.map(row => row.localGameId), '$.data.bindings');
  unique(d.bindings.map(row => [row.scope, row.gameId]), '$.data.bindings');
  // Índices por identidad fuente: ninguna búsqueda vuelve a recorrer todo el
  // conjunto de tiros ni toda la cola por cada partido/evento.
  const localEventsByGame = new Map(), gameStates = new Map(), eventStates = new Map();
  for (const row of d.localEvents) {
    let list = localEventsByGame.get(row.payload.gameId);
    if (!list) { list = []; localEventsByGame.set(row.payload.gameId, list); }
    list.push(row);
  }
  const accumulateState = (map, id, blocked) => map.set(id, blocked || map.get(id) === 'blocked' ? 'blocked' : 'pending-local-ack');
  for (const op of d.pendingIntents) {
    accumulateState(gameStates, key(op.scope, op.gameId), op.blocked);
    if (op.eventId !== null) accumulateState(eventStates, key(op.scope, op.gameId, op.eventId), op.blocked);
  }
  for (const section of SECTIONS) {
    for (let i = 1; i < d[section].length; i++) {
      const before = sectionIdentity(section, d[section][i - 1]), after = sectionIdentity(section, d[section][i]);
      issue(before < after, 'SECTION_ORDER', `$.data.${section}[${i}]`, 'Orden o clave técnica de origen repetida.');
    }
  }
  function shot(payload, path) {
    iso(payload.fecha_hora, path + '.fecha_hora');
    issue(payload.categoria.trim() && payload.accion.trim(), 'EVENT_TEXT', path, 'Identidad histórica vacía.');
    if (payload.tiros_permitidos) {
      unique(payload.tiros_permitidos, path + '.tiros_permitidos');
      issue(payload.tiros_permitidos.includes(payload.valor_tiro), 'SHOT_PERMISSION', path, 'Valor del tiro fuera de sus permisos históricos.');
    }
  }
  for (const [i, game] of d.localGames.entries()) {
    iso(game.createdAt, `$.data.localGames[${i}].createdAt`);
    issue(game.jornada.trim() && game.rival.trim(), 'GAME_TEXT', `$.data.localGames[${i}]`, 'Partido sin jornada o rival.');
  }
  for (const [i, row] of d.localEvents.entries()) {
    const path = `$.data.localEvents[${i}]`; shot(row.payload, path + '.payload');
    required(local, key(row.payload.gameId), path, 'ORPHAN_EVENT');
    issue(row.payload.seq === row.sourceSeq, 'SOURCE_SEQ', path, 'El seq local original debe conservarse también en payload.seq.');
  }
  const versions = new Map(), bases = [], records = new Map(), versionIdsByScope = new Map(), usedCache = new WeakMap();
  const addVersion = (scope, version, path) => {
    const id = key(scope, version.id), old = versions.get(id);
    issue(!old || same(old, version), 'PANEL_ID_CONFLICT', path, 'Misma versión de panel con contenido diferente.');
    versions.set(id, version);
    if (version.basedOn) bases.push({ scope, versionId: version.basedOn });
  };
  const panel = (scope, value, path) => panelRules(value, path, version => addVersion(scope, version, path), usedCache);
  for (const [i, row] of d.settings.entries()) {
    const path = `$.data.settings[${i}]`;
    if (row.kind === 'active-local') { required(local, key(row.gameId), path); continue; }
    assertScope(row.scope, path);
    if (row.kind !== 'panel-record') continue;
    const record = row.record; iso(record.updatedAt, path + '.record.updatedAt');
    unique(record.versions.map(v => v.id), path + '.record.versions');
    const versionIds = new Set(record.versions.map(v => v.id));
    versionIdsByScope.set(canonicalize(row.scope), versionIds);
    for (const version of record.versions) panel(row.scope, { version, usedIds: record.usedIds }, path);
    for (const id of [record.currentId, record.baselineId, record.syncHead].filter(Boolean)) {
      issue(versionIds.has(id), 'PANEL_VERSION_MISSING', path, 'Puntero sin versión completa.', 'incomplete');
    }
    records.set(canonicalize(row.scope), record);
  }
  for (const [i, row] of d.cloudGames.entries()) {
    const path = `$.data.cloudGames[${i}]`; assertScope(row.scope, path); iso(row.payload.createdAt, path + '.payload.createdAt');
    issue(row.payload.jornada.trim() && row.payload.rival.trim(), 'GAME_TEXT', path, 'Partido sin jornada o rival.');
    issue(row.deleted === tombs.has(key(row.scope, row.gameId, null)), 'GAME_TOMBSTONE', path, 'Borrado de partido y lápida no coinciden.', 'incomplete');
    if (row.panel) panel(row.scope, row.panel, path + '.panel');
  }
  for (const [i, row] of d.cloudEvents.entries()) {
    const path = `$.data.cloudEvents[${i}]`; assertScope(row.scope, path); shot(row.payload, path + '.payload');
    const game = required(cloud, key(row.scope, row.gameId), path, 'ORPHAN_EVENT');
    issue(game.payload.id === row.payload.gameId, 'EVENT_GAME_ID', path, 'gameId deportivo distinto de payload.id del padre.');
    issue(row.deleted === tombs.has(key(row.scope, row.gameId, row.eventId)), 'EVENT_TOMBSTONE', path, 'Borrado de tiro y lápida no coinciden.', 'incomplete');
  }
  for (const [i, row] of d.tombstones.entries()) {
    assertScope(row.scope, `$.data.tombstones[${i}]`); required(cloud, key(row.scope, row.gameId), `$.data.tombstones[${i}]`);
    // Una lápida de tiro puede preceder legítimamente al alta: no exigir ese evento.
  }
  const detached = [], usageByScope = new Map();
  for (const [i, row] of d.settings.entries()) if (row.kind === 'game-usage') {
    const path = `$.data.settings[${i}]`; unique(row.games.map(game => game.gameId), path + '.games');
    required(records, canonicalize(row.scope), path, 'PANEL_VERSION_MISSING');
    const versionIds = versionIdsByScope.get(canonicalize(row.scope));
    const usage = new Map(row.games.map(game => [game.gameId, game.versionIds])); usageByScope.set(canonicalize(row.scope), usage);
    for (const game of row.games) {
      unique(game.versionIds, path); issue(game.versionIds.length > 0, 'PANEL_VERSION_MISSING', path, 'Uso vacío de panel.', 'incomplete');
      for (const versionId of game.versionIds) issue(versionIds.has(versionId), 'PANEL_VERSION_MISSING', path, 'Uso sin versión completa.', 'incomplete');
      if (!(row.scope === null ? local.has(key(game.gameId)) : cloud.has(key(row.scope, game.gameId)))) detached.push({ scope: row.scope, gameId: game.gameId });
    }
  }
  const owners = new Map(), teamIds = new Set(); let source = null;
  for (const [i, row] of d.metadata.entries()) {
    const path = `$.data.metadata[${i}]`;
    if (row.kind === 'source') { source = row.value; continue; }
    if (row.kind === 'legacy-owner') {
      required(local, key(row.gameId), path); issue(c.account && row.uid === c.account[1], 'SCOPE_ACCOUNT', path, 'Propietario de otro UID.');
      owners.set(row.gameId, row); continue;
    }
    if (row.kind === 'active-team') { assertScope(row.scope, path); required(cloud, key(row.scope, row.gameId), path); continue; }
    assertAccount(row.account, path);
    if (row.kind === 'teams') {
      unique(row.teams.map(team => team.id), path + '.teams');
      for (const team of row.teams) teamIds.add(key(...row.account, team.id));
    }
    // preferred-team puede recordar un equipo que ya no está en la caché: no es permiso.
  }
  issue((source === null && backup.origin.lineageKind === 'unresolved' && backup.origin.lineageId === null) ||
    (source !== null && backup.origin.lineageKind === 'sync-source' && backup.origin.lineageId === source),
  'ORIGIN_LINEAGE', '$.origin', 'El linaje debe corresponder al source existente o declararse desconocido.');
  if (source === null) warnings.push({ code: 'ORIGIN_UNRESOLVED', path: '$.origin', message: 'Origen local persistente desconocido; las rutas remotas conservan su identidad.' });
  for (const scope of c.includedScopes.filter(Boolean)) {
    if (!teamIds.has(key(...scope))) warnings.push({ code: 'TEAM_NAME_UNAVAILABLE', path: '$.data.metadata', message: 'Equipo incluido sin nombre cacheado; se conserva la referencia.' });
    teamIds.add(key(...scope));
  }

  for (const [i, op] of d.pendingIntents.entries()) {
    const path = `$.data.pendingIntents[${i}]`; assertScope(op.scope, path);
    issue(!op.blocked || !!op.error, 'BLOCKED_REASON', path, 'Intención bloqueada sin código de error.');
    if (op.type === 'default-panel') issue(op.gameId === '@configuration', 'OPERATION_TARGET', path, 'Plantilla con destino incorrecto.');
    else {
      issue(op.gameId !== '@configuration', 'OPERATION_TARGET', path, 'Operación deportiva dirigida a plantilla.');
      const game = required(cloud, key(op.scope, op.gameId), path);
      if (['game', 'delete'].includes(op.type)) issue(same(op.payload, game.payload), 'OPERATION_CONFLICT', path, 'Cabecera pendiente distinta de la fila local.');
      if (op.type === 'game' && game.sourceId !== undefined) issue(op.sourceId === game.sourceId, 'OPERATION_CONFLICT', path, 'sourceId de cabecera incompatible.');
      if (op.type === 'delete') issue(game.deleted, 'OPERATION_TOMBSTONE', path, 'Eliminación sin lápida local.', 'incomplete');
    }
    if (['event', 'undo'].includes(op.type)) {
      issue(op.eventId !== null, 'OPERATION_TARGET', path, 'Operación de tiro sin eventId.');
      if (op.type === 'event') {
        const event = required(events, key(op.scope, op.gameId, op.eventId), path, 'ORPHAN_EVENT');
        issue(same(event.payload, op.payload) && (event.sourceId === undefined || event.sourceId === op.sourceId), 'OPERATION_CONFLICT', path, 'Tiro pendiente distinto de la fila local.');
      } else issue(tombs.has(key(op.scope, op.gameId, op.eventId)), 'OPERATION_TOMBSTONE', path, 'Deshacer sin lápida.', 'incomplete');
    } else issue(op.eventId === null, 'OPERATION_TARGET', path, 'Operación sin tiro con eventId ajeno.');
    if (['panel', 'default-panel'].includes(op.type)) {
      panel(op.scope, op.payload, path + '.payload');
      issue(op.sourceId === op.payload.version.id, 'OPERATION_CONFLICT', path, 'sourceId de panel incorrecto.');
      if (op.baseId) bases.push({ scope: op.scope, versionId: op.baseId });
    }
  }
  for (const [i, op] of d.pendingIntents.entries()) if (op.type === 'event' && op.panelVersionId) required(versions, key(op.scope, op.panelVersionId), `$.data.pendingIntents[${i}].panelVersionId`, 'PANEL_VERSION_MISSING');
  const panelOperations = new Map();
  for (const op of d.pendingIntents.filter(op => ['panel', 'default-panel'].includes(op.type))) {
    const id = key(op.scope, op.type, op.gameId, op.payload.version.id);
    issue(!panelOperations.has(id) || panelOperations.get(id).baseId === op.baseId, 'OPERATION_BASE_CONFLICT', '$.data.pendingIntents', 'Misma versión pendiente con bases incompatibles.');
    panelOperations.set(id, op);
  }
  const opVisited = new Set(), opVisiting = new Set();
  function walkOperation(id) {
    if (opVisiting.has(id)) fail('OPERATION_CYCLE', '$.data.pendingIntents', 'Ciclo entre dependencias de intenciones de panel.');
    if (opVisited.has(id)) return;
    opVisiting.add(id); const op = panelOperations.get(id);
    const parent = key(op.scope, op.type, op.gameId, op.baseId);
    if (op.baseId && panelOperations.has(parent)) walkOperation(parent);
    opVisiting.delete(id); opVisited.add(id);
  }
  for (const id of panelOperations.keys()) walkOperation(id);
  const unresolvedBases = bases.filter(base => !versions.has(key(base.scope, base.versionId)));
  const distinct = list => {
    const byKey = new Map(list.map(row => [canonicalize(row), row]));
    return [...byKey.keys()].sort().map(id => byKey.get(id));
  };
  issue(same(distinct(unresolvedBases), distinct(c.externalBaseVersions)) && c.externalBaseVersions.length === distinct(c.externalBaseVersions).length,
    'EXTERNAL_BASES', '$.coverage.externalBaseVersions', 'Dependencias externas no declaradas exactamente.', 'incomplete');
  for (const row of c.externalBaseVersions) assertScope(row.scope, '$.coverage.externalBaseVersions');
  // Rechazar ciclos entre versiones disponibles; basedOn externo se declara aparte.
  const visited = new Set(), visiting = new Set();
  function walkVersion(id) {
    if (visiting.has(id)) fail('PANEL_CYCLE', '$.data.settings', 'Ciclo en linaje de versiones.');
    if (visited.has(id)) return;
    visiting.add(id); const version = versions.get(id), [scope] = JSON.parse(id);
    if (version?.basedOn && versions.has(key(scope, version.basedOn))) walkVersion(key(scope, version.basedOn));
    visiting.delete(id); visited.add(id);
  }
  for (const id of versions.keys()) walkVersion(id);

  const bound = new Set();
  for (const [i, binding] of d.bindings.entries()) {
    const path = `$.data.bindings[${i}]`; assertScope(binding.scope, path);
    const original = required(local, key(binding.localGameId), path), current = required(cloud, key(binding.scope, binding.gameId), path);
    issue(owners.get(binding.localGameId)?.imported === true, 'BINDING_OWNER', path, 'Vínculo sin original marcado como importado.', 'incomplete');
    issue(source === binding.source && binding.gameId === 'g_' + fingerprint([1, binding.source, 'game', original.id]) && same(original, current.payload),
      'BINDING_IDENTITY', path, 'Linaje, ID remoto o cabecera de importación incompatible.');
    for (const row of localEventsByGame.get(original.id) ?? []) {
      const eid = 'e_' + fingerprint([1, binding.source, 'event', original.id, row.payload.id, row.sourceSeq]);
      const event = events.get(key(binding.scope, binding.gameId, eid));
      issue(event || tombs.has(key(binding.scope, binding.gameId, eid)), 'IMPORTED_EVENT_MISSING', path, 'Falta representación actual o lápida del original.', 'incomplete');
      if (event) issue(same(event.payload, row.payload), 'IMPORTED_EVENT_CONFLICT', path, 'El payload importado diverge del original inmutable.');
    }
    bound.add(original.id);
  }
  const unresolvedOriginals = [...owners.values()].filter(row => row.imported && !bound.has(row.gameId)).map(row => row.gameId).sort();
  unique(c.unresolvedImportedOriginals, '$.coverage.unresolvedImportedOriginals');
  issue(same(unresolvedOriginals, [...c.unresolvedImportedOriginals].sort()), 'UNRESOLVED_ORIGINALS', '$.coverage.unresolvedImportedOriginals', 'Originales sin vínculo no declarados exactamente.', 'incomplete');
  unique(c.detachedGameUsage, '$.coverage.detachedGameUsage');
  issue(same(distinct(detached), distinct(c.detachedGameUsage)), 'DETACHED_USAGE', '$.coverage.detachedGameUsage', 'Usos de partidos ausentes no declarados exactamente.', 'incomplete');
  const missingPanels = [];
  for (const game of d.localGames) {
    const record = records.get('null'), usage = usageByScope.get('null')?.get(game.id);
    const hasEvents = localEventsByGame.has(game.id);
    const versionId = usage?.at(-1) ?? (hasEvents ? record?.baselineId : record?.currentId);
    if (!record || !versionIdsByScope.get('null').has(versionId)) missingPanels.push({ store: 'games', scope: null, gameId: game.id });
  }
  for (const game of d.cloudGames) if (!game.panel) missingPanels.push({ store: 'cloudGames', scope: game.scope, gameId: game.gameId });
  unique(c.missingHistoricalPanels, '$.coverage.missingHistoricalPanels');
  issue(same(distinct(missingPanels), distinct(c.missingHistoricalPanels)), 'HISTORICAL_PANELS', '$.coverage.missingHistoricalPanels', 'Paneles históricos ausentes no declarados exactamente.', 'incomplete');
  if (missingPanels.length) warnings.push({ code: 'HISTORICAL_PANEL_UNAVAILABLE', path: '$.coverage', message: 'La captura local no acredita todos los paneles históricos.' });
  if (unresolvedOriginals.length || detached.length || unresolvedBases.length) warnings.push({ code: 'DECLARED_HISTORICAL_GAPS', path: '$.coverage', message: 'Referencias históricas externas o retiradas declaradas.' });
  for (const [i, row] of d.cloudGames.entries()) issue(row.cloudState === (gameStates.get(key(row.scope, row.gameId)) ?? 'cloud-status-unknown'), 'CLOUD_STATE', `$.data.cloudGames[${i}].cloudState`, 'Estado incompatible con intenciones locales; no se infiere confirmación.');
  for (const [i, row] of d.cloudEvents.entries()) issue(row.cloudState === (eventStates.get(key(row.scope, row.gameId, row.eventId)) ?? 'cloud-status-unknown'), 'CLOUD_STATE', `$.data.cloudEvents[${i}].cloudState`, 'Estado incompatible con intenciones locales.');
  return { warnings, versions: versions.size, teams: teamIds.size, owners };
}

export function computedTotals(backup) {
  const d = backup.data;
  const originals = new Set(d.metadata.filter(row => row.kind === 'legacy-owner' && row.imported).map(row => row.gameId));
  const deletedGames = new Set(d.cloudGames.filter(row => row.deleted).map(row => key(row.scope, row.gameId)));
  const deletedEvents = d.cloudEvents.filter(row => row.deleted || deletedGames.has(key(row.scope, row.gameId))).length;
  const originalEvents = d.localEvents.filter(row => originals.has(row.payload.gameId)).length;
  const versions = new Set(), teams = new Set();
  const add = (scope, panel) => versions.add(key(scope, panel.version.id));
  for (const row of d.settings) if (row.kind === 'panel-record') for (const version of row.record.versions) add(row.scope, { version });
  for (const row of d.cloudGames) if (row.panel) add(row.scope, row.panel);
  for (const op of d.pendingIntents) if (['panel', 'default-panel'].includes(op.type)) add(op.scope, op.payload);
  for (const scope of backup.coverage.includedScopes.filter(Boolean)) teams.add(key(...scope));
  for (const row of d.metadata) if (row.kind === 'teams') for (const team of row.teams) teams.add(key(...row.account, team.id));
  return { representations: d.localGames.length + d.cloudGames.length,
    logicalGames: d.localGames.length + d.cloudGames.length - d.bindings.length, originals: originals.size,
    localEvents: d.localEvents.length, cloudEvents: d.cloudEvents.length,
    liveEvents: d.localEvents.length - originalEvents + d.cloudEvents.length - deletedEvents,
    deletedEvents, originalEvents, tombstones: d.tombstones.length, teams: teams.size, versions: versions.size,
    pending: d.pendingIntents.length, blocked: d.pendingIntents.filter(op => op.blocked).length };
}

export function validateBackup(text) {
  try {
    const backup = parseStrict(text); security(backup);
    issue(backup && backup.format === 'registro-defensivo-backup', 'FORMAT', '$.format', 'Formato desconocido.', 'incompatible');
    issue(backup.formatVersion?.major === 1 && backup.formatVersion?.minor === 0, 'FORMAT_VERSION', '$.formatVersion', 'Versión no soportada.', 'incompatible');
    if (backup.schemas) for (const [name, value] of Object.entries(backup.schemas)) {
      if (['indexedDb', 'panelRecord', 'panelDoc', 'remoteEnvelope'].includes(name)) issue(name === 'indexedDb' ? [1, 2].includes(value) : value === 1, 'SCHEMA_VERSION', `$.schemas.${name}`, 'Esquema no soportado.', 'incompatible');
    }
    if (backup.producer?.appVersion !== undefined) issue(SUPPORTED_APP_VERSIONS.includes(backup.producer.appVersion), 'APP_VERSION', '$.producer.appVersion', 'Versión de origen no soportada.', 'incompatible');
    const features = backup.manifest?.requiredFeatures;
    if (Array.isArray(features)) {
      issue(features.every(feature => FEATURES.includes(feature)), 'REQUIRED_FEATURE', '$.manifest.requiredFeatures', 'Capacidad obligatoria desconocida.', 'incompatible');
      issue(same(features, FEATURES), 'MISSING_FEATURE', '$.manifest.requiredFeatures', 'Debe declararse el perfil completo ordenado.', 'incomplete');
    }
    shape(backup, BACKUP_SCHEMA);
    iso(backup.exportedAt, '$.exportedAt');
    issue(backup.schemas.indexedDb === backup.origin.databaseVersion, 'SCHEMA_VERSION', '$.schemas.indexedDb', 'Versiones de base contradictorias.');
    if (backup.origin.webOrigin !== null) {
      let url; try { url = new URL(backup.origin.webOrigin); } catch { fail('WEB_ORIGIN', '$.origin.webOrigin', 'Origin web inválido.'); }
      issue(['http:', 'https:'].includes(url.protocol) && url.origin === backup.origin.webOrigin && !url.username && !url.password, 'WEB_ORIGIN', '$.origin.webOrigin', 'Solo origin sin credenciales, ruta ni parámetros.');
    }
    const { integrity, ...body } = backup;
    issue(fingerprint(body) === integrity.digest, 'HASH_GLOBAL', '$.integrity.digest', 'SHA-256 global no coincide.');
    let incomplete = !backup.coverage.localSnapshotComplete || backup.coverage.omissions.length > 0;
    unique(backup.coverage.excluded.map(row => row.reason), '$.coverage.excluded');
    unique(backup.coverage.omissions.map(row => [row.section, row.reason]), '$.coverage.omissions');
    for (const [index, [store, section]] of Object.entries(SOURCE_SECTIONS).entries()) {
      const path = '$.manifest.stores.' + store, status = backup.manifest.stores[store], rows = backup.data[section];
      const expectedPresent = backup.origin.databaseVersion === 2 || index < 3;
      if (!expectedPresent) issue(!status.present && status.read === 'absent' && status.sourceRows === 0 && rows.length === 0 && status.excludedRows === 0 && status.transientRows === 0 && status.omittedRows === 0, 'V1_STORE', path, 'v1 no puede declarar datos Sync.');
      else if (!status.present || status.read !== 'complete') incomplete = true;
      if (status.read === 'absent') issue(!status.present && status.sourceRows === 0, 'STORE_STATE', path, 'Almacén ausente con filas de origen.');
      if (!status.present) issue(rows.length === 0 && status.read === 'absent', 'STORE_STATE', path, 'Datos de un almacén declarado ausente.');
      issue(store === 'syncMeta' || status.transientRows === 0, 'TRANSIENT_ROWS', path, 'Solo concesiones de syncMeta son omisiones temporales reconocidas.');
      issue(status.sourceRows === rows.length + status.excludedRows + status.transientRows + status.omittedRows, 'SOURCE_COUNT', path, 'Conteo de filas de origen incoherente.', 'incomplete');
      if (status.excludedRows) issue(backup.coverage.excluded.length > 0, 'EXCLUSIONS', path, 'Filas excluidas sin declaración.', 'incomplete');
      const omitted = backup.coverage.omissions.filter(row => row.section === section).reduce((n, row) => n + row.count, 0);
      issue(omitted === status.omittedRows, 'OMISSION_COUNT', path, 'Omisiones no declaradas exactamente.', 'incomplete');
      if (status.omittedRows) incomplete = true;
      const manifest = backup.manifest.sections[section], sectionPath = '$.manifest.sections.' + section;
      issue(manifest.count === rows.length, 'SECTION_COUNT', sectionPath, 'Conteo de sección incoherente.', 'incomplete');
      issue(manifest.bytes === canonicalBytes(rows), 'SECTION_BYTES', sectionPath, 'Longitud canónica incoherente.');
      issue(manifest.sha256 === fingerprint(rows), 'HASH_SECTION', sectionPath, 'SHA-256 de sección no coincide.');
    }
    const { warnings } = relationships(backup), totals = computedTotals(backup);
    issue(same(totals, backup.manifest.totals), 'TOTAL_COUNT', '$.manifest.totals', 'Totales deportivos incoherentes.', 'incomplete');
    if (incomplete) fail('INCOMPLETE_CAPTURE', '$.coverage', 'Captura declarada parcial o almacenes sin leer completamente.', 'incomplete');
    return { status: 'complete', issues: [], warnings, summary: totals, restorationImplemented: false, authenticityVerified: false };
  } catch (error) {
    if (!(error instanceof ContractError)) throw error;
    return { status: error.status, issues: [{ code: error.code, path: error.path, message: error.message }], warnings: [], restorationImplemented: false, authenticityVerified: false };
  }
}
