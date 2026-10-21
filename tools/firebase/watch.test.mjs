import assert from 'node:assert/strict';
import { watchFirestoreTeam } from '../../js/firestore-watch.js';

function fixture() {
  const listeners = new Map(), all = [], metrics = { attached: 0, detached: 0, gets: 0 };
  let account = true, notifications = 0, parent;
  const sdk = {
    collection: (ref, ...parts) => ({ path: [ref.path, ...parts].filter(Boolean).join('/') }),
    onSnapshot(ref, options, next, error) {
      const listener = { next, error, active: true }; all.push(listener); listeners.set(ref.path, listener); metrics.attached++;
      return () => { if (listener.active) { listener.active = false; metrics.detached++; } };
    },
    async getDocFromServer() { metrics.gets++; return parent; }
  };
  const doc = (id, data, path = 'teams/t/games') => ({ id, ref: { path: path + '/' + id }, data: () => data });
  const emit = (path, docs, fromCache = false, hasPendingWrites = false) => listeners.get(path).next({ docs, metadata: { fromCache, hasPendingWrites } });
  const watch = watchFirestoreTeam(sdk, {}, 't', () => {
    if (!account) throw Object.assign(Error('Cuenta cambiada'), { code: 'SCOPE_CHANGED' });
  }, () => notifications++);
  emit('teams/t/configuration', []);
  return { watch, emit, doc, listeners, all, metrics, account: () => { account = false; },
    parent: value => { parent = value; }, notifications: () => notifications };
}

// Temporada: solo una suscripción inicial por consulta, ningún get periódico.
const f = fixture(), games = Array.from({ length: 30 }, (_, i) => f.doc('g' + i, { payload: { id: 'g' + i }, deletedAt: null }));
f.emit('teams/t/games', games, true);
assert.equal(f.metrics.attached, 2, 'La caché no autoriza ni abre consultas hijas');
f.emit('teams/t/games', games);
const initial = f.watch.read(); let settled = false; initial.then(() => { settled = true; });
for (let i = 0; i < 30; i++) {
  const events = Array.from({ length: 70 }, (_, j) => f.doc('e' + j, { payload: { id: 'e' + j } }));
  f.emit(`teams/t/games/g${i}/events`, events);
  f.emit(`teams/t/games/g${i}/eventDeletions`, [], i === 29);
}
await Promise.resolve(); assert.equal(settled, false, 'No publicar tiros sin comprobar todas las lápidas');
f.emit('teams/t/games/g29/eventDeletions', []);
const season = await initial;
assert.equal(season.length, 30); assert.equal(season.reduce((sum, row) => sum + row.events.length, 0), 2100);
assert.equal(f.metrics.attached, 62);
for (let i = 0; i < 120; i++) assert.deepEqual(await f.watch.read(), []);
assert.deepEqual(f.metrics, { attached: 62, detached: 0, gets: 0 });
console.log('OK: 30 partidos/2100 tiros; 120 ciclos sin consultas ni suscripciones nuevas');

f.emit('teams/t/games/g0/events', [f.doc('nuevo', { payload: { id: 'nuevo' } })]);
assert.deepEqual((await f.watch.read()).map(row => row.id), ['g0']);
f.emit('teams/t/games/g0/eventDeletions', [f.doc('nuevo', {})]);
assert.deepEqual((await f.watch.read())[0].tombs, ['nuevo']);
console.log('OK: solo se entrega el partido cambiado, incluidas lápidas');

f.emit('teams/t/games', games.map((game, i) => i ? game : f.doc('g0', { payload: { id: 'g0' }, deletedAt: 'ahora' })));
assert.equal((await f.watch.read())[0].deleted, true); assert.equal(f.metrics.detached, 2);
f.watch.stop(); assert.equal(f.metrics.detached, 62);
const notices = f.notifications(); for (const listener of f.all) listener.next({});
assert.equal(f.notifications(), notices);
console.log('OK: borrar padre cierra sus escuchas; stop descarta callbacks tardíos');

const cancel = fixture(), cancelled = cancel.watch.read(); cancel.watch.stop();
await assert.rejects(cancelled, { code: 'SCOPE_CHANGED' });
const denied = fixture(), rejected = denied.watch.read();
denied.listeners.get('teams/t/games').error(Object.assign(Error('Sin permiso'), { code: 'permission-denied' }));
await assert.rejects(rejected, { code: 'permission-denied' }); denied.watch.stop();
console.log('OK: cierre y permisos resuelven las esperas con error, sin falso éxito');

const late = fixture(); late.account(); late.emit('teams/t/games', []);
await assert.rejects(late.watch.read(), { code: 'SCOPE_CHANGED' }); late.watch.stop();
const race = fixture(), parent = race.doc('g', { payload: { id: 'g' }, deletedAt: 'ahora' });
race.emit('teams/t/games', [race.doc('g', { payload: { id: 'g' }, deletedAt: null })]);
race.parent({ ...parent, exists: () => true });
await race.listeners.get('teams/t/games/g/events').error({ code: 'permission-denied' });
assert.equal((await race.watch.read())[0].deleted, true); assert.equal(race.metrics.gets, 1); race.watch.stop();
console.log('OK: cambio de cuenta y carrera permiso/lápida del padre');
