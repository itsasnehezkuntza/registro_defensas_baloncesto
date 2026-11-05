// Ejemplos de filas fuente inventadas: documentan el futuro mapeo, sin
// implementar lector ni adaptador de captura y sin importar módulos deportivos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackup } from './validate.mjs';
import { fixtureV2, sealFixture, clone } from './fixtures.mjs';
import { volumeFixture } from './volume-fixtures.mjs';
const validate = fixture => validateBackup(JSON.stringify(sealFixture(fixture)));

test('23.0: blocked ausente en fuente nueva se declara false solo en la representación JSON', () => {
  const f = volumeFixture(1), index = f.data.pendingIntents.findIndex(op => op.type === 'game'), dto = f.data.pendingIntents[index];
  const raw = { key: [JSON.stringify(dto.scope), dto.opId], opId: dto.opId, scope: JSON.stringify(dto.scope), uid: dto.scope[1],
    projectId: dto.scope[0], teamId: dto.scope[2], type: dto.type, gameId: dto.gameId, eventId: dto.eventId,
    payload: clone(dto.payload), sourceId: dto.sourceId, createdAt: dto.createdAt, attempts: 0, nextAttempt: 0 };
  const before = JSON.stringify(raw); assert.equal(Object.hasOwn(raw, 'blocked'), false);
  f.data.pendingIntents[index].blocked = false; // Derivación explícita, no escritura de la fila.
  assert.equal(validate(f).status, 'complete'); assert.equal(JSON.stringify(raw), before);
  delete f.data.pendingIntents[index].blocked;
  assert.equal(validate(f).issues[0].code, 'MISSING_FIELD');
});
test('23.0: fallo transitorio y bloqueo persistido se conservan sin reintentarlos', () => {
  for (const [blocked, error] of [[false, 'network'], [true, 'permission-denied'], [true, 'SYNC_CONFLICT']]) {
    const f = volumeFixture(1), op = f.data.pendingIntents.find(row => row.type === 'event');
    op.blocked = blocked; op.error = error;
    f.data.cloudEvents.find(row => row.eventId === op.eventId).cloudState = blocked ? 'blocked' : 'pending-local-ack';
    f.data.cloudGames[0].cloudState = blocked ? 'blocked' : 'pending-local-ack';
    const result = validate(f); assert.equal(result.status, 'complete', JSON.stringify(result.issues));
    assert.equal(op.executable, false); assert.equal(op.error, error);
  }
});
test('23.0: syncBindings.localGameId proviene de key[1], no de gameId remoto', () => {
  const f = fixtureV2(), binding = f.data.bindings[0];
  const raw = { key: [JSON.stringify(binding.scope), binding.localGameId], scope: JSON.stringify(binding.scope), gameId: binding.gameId, source: binding.source };
  assert.equal(Object.hasOwn(raw, 'localGameId'), false); assert.equal(raw.key[0], raw.scope);
  assert.notEqual(raw.key[1], raw.gameId);
  f.data.bindings[0] = { scope: JSON.parse(raw.scope), localGameId: raw.key[1], gameId: raw.gameId, source: raw.source };
  assert.equal(validate(f).status, 'complete');
  f.data.bindings[0].localGameId = raw.gameId;
  assert.equal(validate(f).issues[0].code, 'MISSING_REFERENCE');
});
test('23.0: cloudEvents.seq técnico puede diferir del payload.seq importado', () => {
  const f = fixtureV2(), imported = f.data.cloudEvents.find(row => row.payload.seq === 2);
  imported.sourceSeq = 100; assert.equal(imported.payload.seq, 2);
  assert.equal(validate(f).status, 'complete');
});
test('23.0: nube histórica sin snapshots ni configuración local no se completa artificialmente', () => {
  const f = fixtureV2(); f.data.pendingIntents = [];
  for (const row of [...f.data.cloudGames, ...f.data.cloudEvents]) row.cloudState = 'cloud-status-unknown';
  f.data.settings = f.data.settings.filter(row => row.scope === null);
  for (const row of f.data.cloudGames) delete row.panel;
  f.coverage.missingHistoricalPanels = f.data.cloudGames.map(row => ({ store: 'cloudGames', scope: clone(row.scope), gameId: row.gameId }));
  const result = validate(f); assert.equal(result.status, 'complete', JSON.stringify(result.issues));
  assert.ok(result.warnings.some(row => row.code === 'HISTORICAL_PANEL_UNAVAILABLE'));
});
test('23.0: undefined de sourceId técnico significa campo opcional ausente en JSON', () => {
  const f = fixtureV2(), game = f.data.cloudGames.find(row => row.payload.id === 'partido-equipo-b');
  const raw = { ...game, sourceId: undefined }; assert.ok(Object.hasOwn(raw, 'sourceId'));
  assert.equal(Object.hasOwn(game, 'sourceId'), false); assert.equal(validate(f).status, 'complete');
});
test('Las versiones de aplicación, IndexedDB y contrato se rechazan por separado', () => {
  for (const [change, code] of [
    [f => { f.producer.appVersion = '24.0'; }, 'APP_VERSION'],
    [f => { f.schemas.indexedDb = 3; }, 'SCHEMA_VERSION'],
    [f => { f.formatVersion.minor = 1; }, 'FORMAT_VERSION']
  ]) {
    const f = fixtureV2(); change(f); const result = validate(f);
    assert.equal(result.status, 'incompatible'); assert.equal(result.issues[0].code, code);
  }
});
