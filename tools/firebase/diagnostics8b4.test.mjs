import test from 'node:test';
import assert from 'node:assert/strict';
import { syncTrace, syncDiagnosticSnapshot, enableSyncDiagnostics, disableSyncDiagnostics, traceRemoteRead } from '../../js/sync-diagnostics.js';
test('diagnóstico opt-in, acotado, inmutable y sin payload/PII', async () => {
  syncTrace('disabled'); assert.equal(syncDiagnosticSnapshot().entries.length, 0);
  enableSyncDiagnostics();
  syncTrace('privacy.test', { uid: 'UID_PRIVADO', email: 'PRIVADO@example.test', token: 'TOKEN_PRIVADO', payload: { rival: 'RIVAL_PRIVADO' }, message: 'MENSAJE_PRIVADO', count: 2, code: 'permission-denied' });
  let report = syncDiagnosticSnapshot();
  assert(!JSON.stringify(report).includes('PRIVADO')); assert.equal(report.entries.at(-1).count, 2);
  report.entries.at(-1).count = 90; assert.equal(syncDiagnosticSnapshot().entries.at(-1).count, 2);
  await traceRemoteRead('events', async () => ({ docs: [{}, {}], metadata: { fromCache: false, hasPendingWrites: false } }));
  assert.equal(syncDiagnosticSnapshot().entries.at(-1).fromCache, false);
  await assert.rejects(traceRemoteRead('events', async () => { throw Object.assign(Error('NO_REGISTRAR_MENSAJE'), { code: 'permission-denied' }); }));
  assert.equal(syncDiagnosticSnapshot().entries.at(-1).stage, 'firestore.read.error');
  assert(!JSON.stringify(syncDiagnosticSnapshot()).includes('NO_REGISTRAR'));
  for (let i = 0; i < 600; i++) syncTrace('ring.test', { count: i });
  assert.equal(syncDiagnosticSnapshot().entries.length, 500); assert(syncDiagnosticSnapshot().dropped > 0);
  const count = syncDiagnosticSnapshot().entries.length; disableSyncDiagnostics(); syncTrace('disabled.again'); assert.equal(syncDiagnosticSnapshot().entries.length, count);
});
