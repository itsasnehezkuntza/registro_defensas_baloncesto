import test from 'node:test';
import assert from 'node:assert/strict';
import { volumeFixture, VOLUME_SIZES } from './volume-fixtures.mjs';
import { validateBackup } from './validate.mjs';
import { sealFixture, clone } from './fixtures.mjs';
for (const size of VOLUME_SIZES) test('Volumen ficticio acotado: ' + size + ' partidos locales y cloud', () => {
  const f = volumeFixture(size), result = validateBackup(JSON.stringify(f));
  assert.equal(result.status, 'complete', JSON.stringify(result.issues));
  assert.equal(result.summary.representations, size * 2); assert.equal(result.summary.liveEvents, size * 8);
  assert.equal(result.summary.pending, size * 5);
});
test('Índices mantienen aislados ámbito, partido y eventId repetido', () => {
  const f = volumeFixture(2), target = f.data.cloudEvents[4], first = f.data.cloudEvents[0];
  const op = f.data.pendingIntents.find(row => row.eventId === target.eventId && row.gameId === target.gameId);
  op.eventId = first.eventId; op.payload.id = first.payload.id; op.blocked = true; op.error = 'SYNC_CONFLICT';
  target.eventId = first.eventId; target.payload.id = first.payload.id; target.cloudState = 'blocked';
  f.data.cloudGames.find(row => row.gameId === target.gameId).cloudState = 'blocked';
  const result = validateBackup(JSON.stringify(sealFixture(f)));
  assert.equal(result.status, 'complete', JSON.stringify(result.issues)); assert.equal(first.cloudState, 'pending-local-ack');
});
test('Predomina un bloqueo aunque otras operaciones estén pendientes', () => {
  const f = volumeFixture(1), first = f.data.cloudEvents[0];
  const op = clone(f.data.pendingIntents.find(row => row.eventId === first.eventId));
  op.opId = 'otro-envio-mismo-tiro'; op.blocked = true; op.error = 'SYNC_CONFLICT'; f.data.pendingIntents.push(op);
  first.cloudState = 'blocked'; f.data.cloudGames[0].cloudState = 'blocked';
  assert.equal(validateBackup(JSON.stringify(sealFixture(f))).status, 'complete');
});
test('eventId repetido en dos partidos del mismo equipo no comparte bloqueo', () => {
  const f = volumeFixture(3), first = f.data.cloudEvents[0], target = f.data.cloudEvents[8];
  assert.deepEqual(first.scope, target.scope); assert.notEqual(first.gameId, target.gameId);
  const op = f.data.pendingIntents.find(row => row.gameId === target.gameId && row.eventId === target.eventId);
  op.eventId = first.eventId; op.payload.id = first.payload.id; op.blocked = true; op.error = 'SYNC_CONFLICT';
  target.eventId = first.eventId; target.payload.id = first.payload.id; target.cloudState = 'blocked';
  f.data.cloudGames.find(row => row.gameId === target.gameId).cloudState = 'blocked';
  const result = validateBackup(JSON.stringify(sealFixture(f)));
  assert.equal(result.status, 'complete', JSON.stringify(result.issues)); assert.equal(first.cloudState, 'pending-local-ack');
});
test('El constructor de volumen rechaza campañas extremas', () => {
  for (const value of [0, -1, 226, 1e9, 2.5, NaN]) assert.throws(() => volumeFixture(value), RangeError);
});
