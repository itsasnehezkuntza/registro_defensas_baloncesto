import assert from 'node:assert/strict';
import { createSupervisionReader } from '../js/supervision-reader.js';
import { accessPlan } from '../tools/firebase/supervision-admin.mjs';

function fixture() {
  let next, fail, uid = 'supervisor', calls = 0, stopped = 0, resolveRead;
  const sdk = {
    doc: (...args) => args.filter(a => typeof a === 'string').join('/'),
    collection: (...args) => args.filter(a => typeof a === 'string').join('/'),
    onSnapshot: (_ref, _options, n, f) => { next = n; fail = f; return () => stopped++; },
    getDocFromServer: async () => { calls++; return new Promise(resolve => { resolveRead = resolve; }); }
  };
  const reader = createSupervisionReader(sdk, {}, 'supervisor', () => uid);
  const teams = [], errors = [];
  reader.watchAccess(ids => teams.push(ids), error => errors.push(error));
  const emit = (data, fromCache = false) => next({ metadata: { fromCache }, docs: data.map(([id, value]) => ({ id, data: () => value })) });
  const grant = { schemaVersion: 1, role: 'reader', status: 'active' };
  return { reader, teams, errors, grant, emit, fail: error => fail(error),
    switchUid: () => { uid = 'externo'; }, calls: () => calls, stopped: () => stopped,
    resolve: () => resolveRead({ id: 'equipo', exists: () => true, data: () => ({ name: 'Ficticio' }) }) };
}
{
  const f = fixture();
  f.emit([['equipo', f.grant], ['revocado', { ...f.grant, status: 'revoked' }], ['otro', { ...f.grant, role: 'owner' }]]);
  assert.deepEqual(f.teams.at(-1), ['equipo']);
  await assert.rejects(f.reader.team('no-asignado'), { code: 'permission-denied' }); assert.equal(f.calls(), 0);
  const read = f.reader.team('equipo'); f.emit([]); f.resolve();
  await assert.rejects(read, { code: 'permission-denied' });
  f.reader.close();
}
{
  const f = fixture(); f.emit([['equipo', f.grant]]);
  const read = f.reader.team('equipo'); f.switchUid(); f.resolve();
  await assert.rejects(read, { code: 'permission-denied' });
  await assert.rejects(f.reader.games('equipo'), { code: 'permission-denied' }); f.reader.close();
}
{
  const f = fixture(); f.emit([['equipo', f.grant]], true); assert.deepEqual(f.teams.at(-1), []);
  await assert.rejects(f.reader.team('equipo'), { code: 'permission-denied' });
  f.emit([['equipo', f.grant]]); f.fail({ code: 'permission-denied' });
  assert.equal(f.errors.length, 1); await assert.rejects(f.reader.team('equipo'), { code: 'permission-denied' });
  f.reader.close(); const count = f.teams.length; f.emit([['equipo', f.grant]]); assert.equal(f.teams.length, count); assert.equal(f.stopped(), 1);
  assert.deepEqual(Object.keys(f.reader).sort(), ['close', 'game', 'games', 'team', 'watchAccess']);
}
assert.throws(() => accessPlan('asignar', 'correo@ficticio.test', 'equipo'));
assert.throws(() => accessPlan('borrar', 'uid', 'equipo'));
assert.throws(() => accessPlan('asignar', 'uid', '../equipo'));
console.log('Supervisor: respuestas tardías, cambio de UID, caché no confirmada, revocación, cierre y capacidad exclusivamente lectora correctos.');
