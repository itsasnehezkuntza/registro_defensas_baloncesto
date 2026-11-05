// Solo constructores de documentos ficticios en memoria. No lee bases ni archivos.
import { fingerprint, canonicalBytes } from './json.mjs';
import { SOURCE_SECTIONS, SECTIONS, FEATURES } from './schema.mjs';
import { computedTotals, sectionIdentity } from './validate.mjs';
export const WHEN = '2026-11-05T10:00:00.000Z';
export const SOURCE = 'origen-ficticio-a';
export const SCOPE_A = ['demo-defensas', 'usuario-ficticio-a', 'equipo-ficticio-a'];
export const SCOPE_B = ['demo-defensas', 'usuario-ficticio-a', 'equipo-ficticio-b'];
export const clone = value => structuredClone(value);
export function makePanel(versionId = 'cfg-a', basedOn = null) {
  const item = (id, name) => ({ id, name, shots: [2, 3], retired: false });
  return {
    version: { id: versionId, createdAt: WHEN, source: 'editor', basedOn, csvHash: null,
      doc: { schema: 1, categories: [
        { id: 'transicion', name: 'Transición', items: [item('transicion_ficticia', 'Acción ficticia')] },
        { id: 'estatico', name: 'Estático', items: [item('estatico_ficticio', 'Histórica conservada')] },
        { id: 'directo', name: 'Bloqueo directo', types: [item('tipo_ficticio', 'Tipo ficticio')], defenses: [item('defensa_ficticia', 'Defensa ficticia')], cells: {} }
      ] } },
    usedIds: { actions: ['transicion_ficticia', 'estatico_ficticio', 'tipo_ficticio'], defenses: ['defensa_ficticia'] }
  };
}
export function makeRecord(panels) {
  return { schema: 1, revision: panels.length, currentId: panels.at(-1).version.id, baselineId: panels[0].version.id,
    usedIds: clone(panels.at(-1).usedIds), versions: panels.map(panel => clone(panel.version)), updatedAt: WHEN, origin: 'local' };
}
export const game = id => ({ id, jornada: 'F-01', rival: 'Rival ficticio', createdAt: WHEN });
export function shot(id, gameId, points = 2, result = 'fallado') {
  return { id, gameId, jornada: 'F-01', rival: 'Rival ficticio', categoria: 'Transición', accion: 'Acción ficticia',
    categoria_id: 'transicion', accion_id: 'transicion_ficticia', defensa_id: null, estrategia: null,
    tipo_bloqueo: null, tiros_permitidos: [2, 3], valor_tiro: points, resultado: result, fecha_hora: WHEN };
}
function envelope(version) {
  return {
    format: 'registro-defensivo-backup', formatVersion: { major: 1, minor: 0 },
    backupId: '00000000-0000-4000-8000-000000000262', exportedAt: WHEN,
    producer: { appVersion: '23.0', buildId: null, sourceCommit: 'b0bc47ec848d68977c52b9b3206d11cbee66a94e', contractVersion: '1.0' },
    origin: { webOrigin: 'https://ficticio.example', databaseName: 'registro_defensivo_baloncesto', databaseVersion: version, lineageKind: 'unresolved', lineageId: null },
    schemas: { indexedDb: version, panelRecord: 1, panelDoc: 1, remoteEnvelope: 1 },
    coverage: { account: null, includedScopes: [null], excluded: [], localSnapshotComplete: true, remoteInventory: 'not-performed', omissions: [],
      missingHistoricalPanels: [], unresolvedImportedOriginals: [], detachedGameUsage: [], externalBaseVersions: [] },
    manifest: { requiredFeatures: [...FEATURES], stores: {}, sections: {}, totals: {} },
    data: Object.fromEntries(SECTIONS.map(name => [name, []])),
    integrity: { algorithm: 'SHA-256', canonicalization: 'RFC8785', digest: '0'.repeat(64) }
  };
}
// Recalcular un documento inventado no valida su semántica. Se usa también para
// atacar relaciones con hashes correctos y evitar pruebas que solo fallen por hash.
export function sealFixture(input, { preserveStoreCounts = false } = {}) {
  const backup = clone(input);
  for (const section of SECTIONS) {
    backup.data[section].sort((a, b) => sectionIdentity(section, a) < sectionIdentity(section, b) ? -1 : sectionIdentity(section, a) > sectionIdentity(section, b) ? 1 : 0);
    const rows = backup.data[section];
    backup.manifest.sections[section] = { count: rows.length, bytes: canonicalBytes(rows), sha256: fingerprint(rows) };
  }
  for (const [i, [store, section]] of Object.entries(SOURCE_SECTIONS).entries()) {
    if (preserveStoreCounts) continue;
    const previous = backup.manifest.stores[store] ?? {}, present = backup.origin.databaseVersion === 2 || i < 3;
    const { excludedRows = 0, transientRows = 0, omittedRows = 0 } = previous;
    backup.manifest.stores[store] = { present, read: present ? 'complete' : 'absent',
      sourceRows: backup.data[section].length + excludedRows + transientRows + omittedRows, excludedRows, transientRows, omittedRows };
  }
  backup.manifest.totals = computedTotals(backup);
  const { integrity, ...body } = backup;
  backup.integrity.digest = fingerprint(body);
  return backup;
}
export function fixtureV1({ historical = false } = {}) {
  const backup = envelope(1), payload = { ...shot('tiro-local-1', 'partido-local'), seq: 7 };
  backup.data.localGames = [game('partido-local')];
  if (historical) for (const field of ['categoria_id', 'accion_id', 'defensa_id', 'tiros_permitidos']) delete payload[field];
  backup.data.localEvents = [{ sourceSeq: 7, payload }];
  if (historical) backup.coverage.missingHistoricalPanels = [{ store: 'games', scope: null, gameId: 'partido-local' }];
  else backup.data.settings = [
    { kind: 'active-local', gameId: 'partido-local' },
    { kind: 'panel-record', scope: null, record: makeRecord([makePanel()]) },
    { kind: 'game-usage', scope: null, games: [{ gameId: 'partido-local', versionIds: ['cfg-a'] }] }
  ];
  return sealFixture(backup);
}
export function fixtureEmptyV1() { return sealFixture(envelope(1)); }
export function fixtureV2() {
  const backup = envelope(2), d = backup.data, a = makePanel(), b = makePanel('cfg-b', 'cfg-a');
  b.version.doc.categories[1].items[0].name = 'Nombre posterior ficticio';
  b.version.doc.categories[1].items[0].retired = true;
  backup.origin.lineageKind = 'sync-source'; backup.origin.lineageId = SOURCE;
  backup.coverage.account = SCOPE_A.slice(0, 2); backup.coverage.includedScopes = [null, clone(SCOPE_A), clone(SCOPE_B)];
  backup.coverage.excluded = [{ reason: 'other-account', scopeCount: 1 }];
  const original = game('original-ficticio'), remoteId = 'g_' + fingerprint([1, SOURCE, 'game', original.id]);
  d.localGames = [original, game('solo-local-ficticio')];
  d.localEvents = [
    { sourceSeq: 1, payload: { ...shot('original-t1', original.id), seq: 1 } },
    { sourceSeq: 2, payload: { ...shot('original-t2', original.id, 3, 'anotado'), seq: 2 } },
    { sourceSeq: 3, payload: { ...shot('local-t1', 'solo-local-ficticio'), seq: 3 } }
  ];
  d.cloudGames = [
    { scope: clone(SCOPE_A), gameId: remoteId, payload: clone(original), sourceId: SOURCE, deleted: false, panel: clone(a), cloudState: 'blocked' },
    { scope: clone(SCOPE_B), gameId: 'partido-equipo-b', payload: game('partido-equipo-b'), deleted: false, panel: clone(a), cloudState: 'cloud-status-unknown' },
    { scope: clone(SCOPE_B), gameId: 'partido-eliminado', payload: game('partido-eliminado'), deleted: true, panel: clone(a), cloudState: 'pending-local-ack' }
  ];
  d.cloudEvents = d.localEvents.slice(0, 2).map(row => ({ sourceSeq: row.sourceSeq, scope: clone(SCOPE_A), gameId: remoteId,
    eventId: 'e_' + fingerprint([1, SOURCE, 'event', original.id, row.payload.id, row.sourceSeq]), payload: clone(row.payload), deleted: false, sourceId: SOURCE, cloudState: 'cloud-status-unknown' }));
  d.cloudEvents.push(
    { sourceSeq: 3, scope: clone(SCOPE_A), gameId: remoteId, eventId: 'nuevo-t3', payload: shot('nuevo-t3', original.id, 2, 'anotado'), deleted: false, cloudState: 'blocked' },
    { sourceSeq: 4, scope: clone(SCOPE_A), gameId: remoteId, eventId: 'eliminado-t4', payload: shot('eliminado-t4', original.id, 3), deleted: true, cloudState: 'pending-local-ack' },
    { sourceSeq: 5, scope: clone(SCOPE_B), gameId: 'partido-equipo-b', eventId: 'otro-t1', payload: shot('otro-t1', 'partido-equipo-b'), deleted: false, cloudState: 'cloud-status-unknown' }
  );
  d.tombstones = [{ scope: clone(SCOPE_A), gameId: remoteId, eventId: 'eliminado-t4' }, { scope: clone(SCOPE_B), gameId: 'partido-eliminado' }];
  d.settings = [
    { kind: 'panel-record', scope: null, record: makeRecord([a]) },
    { kind: 'game-usage', scope: null, games: [{ gameId: original.id, versionIds: ['cfg-a'] }, { gameId: 'solo-local-ficticio', versionIds: ['cfg-a'] }] },
    { kind: 'panel-record', scope: clone(SCOPE_A), record: { ...makeRecord([a, b]), origin: 'cloud', syncHead: 'cfg-b' } },
    { kind: 'game-usage', scope: clone(SCOPE_A), games: [{ gameId: remoteId, versionIds: ['cfg-a'] }] },
    { kind: 'panel-record', scope: clone(SCOPE_B), record: { ...makeRecord([a]), origin: 'cloud' } }
  ];
  d.metadata = [
    { kind: 'source', value: SOURCE }, { kind: 'legacy-owner', gameId: original.id, uid: SCOPE_A[1], imported: true },
    { kind: 'teams', account: SCOPE_A.slice(0, 2), teams: [{ id: SCOPE_A[2], name: 'Azul ficticio' }, { id: SCOPE_B[2], name: 'Verde ficticio' }] },
    { kind: 'preferred-team', account: SCOPE_A.slice(0, 2), teamId: SCOPE_B[2] },
    { kind: 'active-team', scope: clone(SCOPE_A), gameId: remoteId }
  ];
  d.bindings = [{ scope: clone(SCOPE_A), localGameId: original.id, gameId: remoteId, source: SOURCE }];
  const op = (opId, type, scope, gameId, payload, extra = {}) => ({ opId, type, scope: clone(scope), gameId,
    eventId: null, payload: clone(payload), sourceId: '', createdAt: 1793872800000, blocked: false, executable: false, ...extra });
  d.pendingIntents = [
    op('op-alta', 'game', SCOPE_A, remoteId, original, { sourceId: SOURCE }),
    op('op-panel', 'panel', SCOPE_A, remoteId, a, { sourceId: 'cfg-a', baseId: null }),
    op('op-plantilla', 'default-panel', SCOPE_A, '@configuration', b, { sourceId: 'cfg-b', baseId: 'cfg-a' }),
    op('op-evento', 'event', SCOPE_A, remoteId, d.cloudEvents[2].payload, { eventId: 'nuevo-t3', sourceId: 'event-nuevo-t3', panelVersionId: 'cfg-a', blocked: true, error: 'SYNC_CONFLICT' }),
    op('op-deshacer', 'undo', SCOPE_A, remoteId, null, { eventId: 'eliminado-t4' }),
    op('op-borrar', 'delete', SCOPE_B, 'partido-eliminado', game('partido-eliminado'), { sourceId: 'deleted-partido-eliminado' })
  ];
  // Declaración agregada sin identidades ni contenido de la cuenta excluida.
  backup.manifest.stores = {
    cloudGames: { excludedRows: 1 }, cloudEvents: { excludedRows: 2 }, settings: { excludedRows: 2 },
    syncMeta: { transientRows: 1, excludedRows: 1 }, syncQueue: { excludedRows: 1 }, syncBindings: { excludedRows: 1 }
  };
  return sealFixture(backup);
}
