// Volumen acotado e inventado: no accede al almacenamiento ni a la red.
import { fixtureV2, makePanel, makeRecord, game, shot, clone, sealFixture, SCOPE_A, SCOPE_B } from './fixtures.mjs';
export const VOLUME_SIZES = Object.freeze([25, 75, 225]);
export function volumeFixture(gamesPerKind) {
  if (!Number.isInteger(gamesPerKind) || gamesPerKind < 1 || gamesPerKind > 225) throw new RangeError('Volumen fuera de la campaña moderada de 1..225.');
  const f = fixtureV2(), d = f.data;
  for (const section of Object.keys(d)) d[section] = [];
  f.coverage.excluded = []; f.manifest.stores = {};
  d.metadata = fixtureV2().data.metadata.filter(row => ['source', 'teams'].includes(row.kind));
  const panels = Array.from({ length: Math.min(16, gamesPerKind) }, (_, i) => makePanel(i ? `cfg-vol-${i}` : 'cfg-a', i ? (i === 1 ? 'cfg-a' : `cfg-vol-${i - 1}`) : null));
  for (const scope of [null, SCOPE_A, SCOPE_B]) d.settings.push({ kind: 'panel-record', scope: clone(scope), record: makeRecord(panels) });
  const usage = { kind: 'game-usage', scope: null, games: [] }; d.settings.push(usage);
  for (let g = 0; g < gamesPerKind; g++) {
    const suffix = String(g).padStart(4, '0'), localId = 'local-vol-' + suffix, cloudId = 'cloud-vol-' + suffix;
    const scope = clone(g % 2 ? SCOPE_B : SCOPE_A);
    d.localGames.push(game(localId)); usage.games.push({ gameId: localId, versionIds: panels.map(panel => panel.version.id) });
    const parent = { scope, gameId: cloudId, payload: game(cloudId), deleted: false, panel: clone(panels[0]), cloudState: 'pending-local-ack' };
    d.cloudGames.push(parent);
    const intent = (id, type, payload, eventId = null, blocked = false) => ({
      opId: id, type, scope: clone(scope), gameId: cloudId, eventId, payload: clone(payload), sourceId: 'device-' + id,
      createdAt: 1793872800000, blocked, ...(blocked ? { error: 'SYNC_CONFLICT' } : {}), executable: false
    });
    d.pendingIntents.push(intent('op-game-' + suffix, 'game', parent.payload));
    for (let e = 0; e < 4; e++) {
      const seq = g * 4 + e + 1, eid = 'cloud-shot-' + String(seq).padStart(5, '0');
      d.localEvents.push({ sourceSeq: seq, payload: { ...shot('local-shot-' + seq, localId, e % 2 ? 3 : 2), seq } });
      const payload = shot(eid, cloudId, e % 2 ? 3 : 2), blocked = seq % 17 === 0;
      if (blocked) parent.cloudState = 'blocked';
      d.cloudEvents.push({ sourceSeq: seq + 1000, scope: clone(scope), gameId: cloudId, eventId: eid, payload, deleted: false, cloudState: blocked ? 'blocked' : 'pending-local-ack' });
      d.pendingIntents.push(intent('op-' + eid, 'event', payload, eid, blocked));
    }
  }
  return sealFixture(f);
}
