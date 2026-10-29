import { canonical } from './sync-storage.js';
import { syncSettings } from './sync-config.js';
import { firebaseSettings } from './firebase-config.js';
import { watchFirestoreTeam } from './firestore-watch.js';
import { validatePanel } from './panel-model.js';

const conflict = () => Object.assign(Error('El ID remoto contiene datos diferentes. Se conserva la copia local.'), { code: 'SYNC_CONFLICT' });
const emulatorDatabases = new WeakSet();
// Adaptador puro: en las pruebas recibe el SDK oficial conectado al emulador.
export function createFirestoreTransport(sdk, database, uid, currentUid) {
  const guard = () => { if (currentUid() !== uid) throw Object.assign(Error('La cuenta ha cambiado.'), { code: 'SCOPE_CHANGED' }); };
  const gameRef = (team, gid) => sdk.doc(database, 'teams', team, 'games', gid);
  const envelope = op => ({ schemaVersion: 1, createdBy: uid, createdAt: sdk.serverTimestamp(), sourceId: op.sourceId, payload: op.payload });
  const same = (existing, op) => canonical(existing.payload) === canonical(op.payload) && existing.sourceId === op.sourceId;
  return {
    watch(teamId, onChange) { guard(); return watchFirestoreTeam(sdk, database, teamId, guard, onChange); },
    async teams() {
      guard();
      const result = await sdk.getDocsFromServer(sdk.query(sdk.collection(database, 'teams'), sdk.where('ownerUid', '==', uid)));
      guard(); return result.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    },
    async verifyTeam(teamId) {
      guard();
      const [team, member] = await Promise.all([
        sdk.getDocFromServer(sdk.doc(database, 'teams', teamId)),
        sdk.getDocFromServer(sdk.doc(database, 'teams', teamId, 'members', uid))
      ]);
      guard();
      if (team.data()?.ownerUid !== uid || member.data()?.role !== 'owner' || member.data()?.status !== 'active') throw Object.assign(Error('El equipo no está autorizado.'), { code: 'permission-denied' });
      return { id: team.id, name: team.data().name };
    },
    async createTeam(name, teamId = crypto.randomUUID()) {
      guard();
      if (!name.trim() || name.length > 120) throw Error('Introduce un nombre de equipo de hasta 120 caracteres.');
      const batch = sdk.writeBatch(database);
      batch.set(sdk.doc(database, 'teams', teamId), { schemaVersion: 1, name: name.trim(), ownerUid: uid, createdAt: sdk.serverTimestamp() });
      batch.set(sdk.doc(database, 'teams', teamId, 'members', uid), { schemaVersion: 1, uid, role: 'owner', status: 'active', createdAt: sdk.serverTimestamp() });
      await batch.commit(); guard(); return { id: teamId, name: name.trim() };
    },
    async send(op) {
      guard(); if (op.uid !== uid || op.projectId !== database.app.options.projectId) throw Error('Operación de otra cuenta o proyecto.');
      if (op.type === 'default-panel') {
        validatePanel(op.payload);
        return sdk.runTransaction(database, async tx => {
          guard();
          const head = sdk.doc(database, 'teams', op.teamId, 'configuration', 'current');
          const version = sdk.doc(database, 'teams', op.teamId, 'configurationVersions', op.payload.version.id);
          const [current, stored] = await Promise.all([tx.get(head), tx.get(version)]);
          if (stored.exists() && !same(stored.data(), op)) throw conflict();
          if (current.data()?.payload.version.id === op.payload.version.id) { if (!same(current.data(), op)) throw conflict(); return; }
          if ((current.data()?.payload.version.id ?? null) !== op.baseId) throw conflict();
          guard(); if (!stored.exists()) tx.set(version, envelope(op));
          tx.set(head, { ...envelope(op), baseId: op.baseId });
        });
      }
      let panelCheck = null;
      if (op.type === 'panel') {
        validatePanel(op.payload);
        if (op.baseId) {
          const parent = gameRef(op.teamId, op.gameId), before = await sdk.getDocFromServer(parent);
          const events = await sdk.getDocsFromServer(sdk.collection(parent, 'events'));
          const tombs = await sdk.getDocsFromServer(sdk.collection(parent, 'eventDeletions'));
          guard();
          panelCheck = { clock: before.data()?.panelClock ?? null, live: events.docs.some(event => !tombs.docs.some(tomb => tomb.id === event.id)) };
        }
      }
      return sdk.runTransaction(database, async tx => {
        guard();
        const parent = gameRef(op.teamId, op.gameId), game = await tx.get(parent);
        if (game.exists() && game.data().deletedAt != null) return { deleted: true };
        if (op.type === 'panel') {
          if (!game.exists()) throw Object.assign(Error('El alta del partido está pendiente.'), { code: 'unavailable' });
          const existing = game.data().panel;
          const ref = sdk.doc(parent, 'panelVersions', op.payload.version.id), version = await tx.get(ref);
          if (version.exists() && !same(version.data(), op)) throw conflict();
          if (existing?.version.id === op.payload.version.id) { if (canonical(existing) !== canonical(op.payload)) throw conflict(); return; }
          if ((existing?.version.id ?? null) !== op.baseId) throw conflict();
          if (panelCheck) {
            if ((game.data().panelClock ?? null) !== panelCheck.clock) throw Object.assign(Error('El partido ha cambiado al comprobar su panel.'), { code: 'unavailable' });
            if (panelCheck.live) throw conflict();
          }
          guard(); if (!version.exists()) tx.set(ref, envelope(op));
          tx.update(parent, { panel: op.payload, panelClock: 'panel:' + op.payload.version.id }); return;
        }
        if (op.type === 'delete') {
          guard();
          if (game.exists()) {
            if (canonical(game.data().payload) !== canonical(op.payload)) throw conflict();
            tx.update(parent, { deletedAt: sdk.serverTimestamp(), deletedBy: uid });
          } else tx.set(parent, { ...envelope(op), deletedAt: sdk.serverTimestamp(), deletedBy: uid });
          return;
        }
        if (op.type === 'game') {
          if (game.exists()) { if (!same(game.data(), op)) throw conflict(); return; }
          guard(); tx.set(parent, { ...envelope(op), deletedAt: null, deletedBy: null }); return;
        }
        if (!game.exists()) throw Object.assign(Error('El alta del partido está pendiente.'), { code: 'unavailable' });
        if (op.type === 'event' && op.panelVersionId && game.data().panel?.version.id !== op.panelVersionId) throw conflict();
        const tombRef = sdk.doc(parent, 'eventDeletions', op.eventId), tomb = await tx.get(tombRef);
        if (tomb.exists()) return { deleted: true };
        if (op.type === 'undo') {
          if (game.data().panel) tx.update(parent, { panelClock: 'undo:' + op.eventId });
          guard(); tx.set(tombRef, { schemaVersion: 1, eventId: op.eventId, operationId: op.opId,
            deletedBy: uid, deletedAt: sdk.serverTimestamp() }); return;
        }
        const ref = sdk.doc(parent, 'events', op.eventId), event = await tx.get(ref);
        if (event.exists()) { if (!same(event.data(), op)) throw conflict(); return; }
        if (game.data().panel) tx.update(parent, { panelClock: 'event:' + op.eventId });
        guard(); tx.set(ref, envelope(op));
      });
    },
    // Lectura puntual de herramientas/adaptadores antiguos; el motor usa watch().
    async pull(teamId) {
      guard();
      const games = await sdk.getDocsFromServer(sdk.collection(database, 'teams', teamId, 'games'));
      const result = [];
      for (const doc of games.docs) {
        guard(); const data = doc.data();
        if (data.deletedAt != null) { result.push({ id: doc.id, ...data, deleted: true }); continue; }
        try {
          const tombs = await sdk.getDocsFromServer(sdk.collection(doc.ref, 'eventDeletions'));
          const events = await sdk.getDocsFromServer(sdk.collection(doc.ref, 'events'));
          const finalTombs = await sdk.getDocsFromServer(sdk.collection(doc.ref, 'eventDeletions'));
          const parent = await sdk.getDocFromServer(doc.ref);
          guard();
          if (!parent.exists()) throw Error('Falta una lápida remota de partido.');
          result.push({ id: doc.id, ...parent.data(), deleted: parent.data().deletedAt != null,
            tombs: [...new Set([...tombs.docs, ...finalTombs.docs].map(doc => doc.id))],
            events: events.docs.sort((a, b) => (a.data().createdAt?.toMillis() || 0) - (b.data().createdAt?.toMillis() || 0) || a.id.localeCompare(b.id))
              .map(doc => ({ id: doc.id, ...doc.data() })) });
        } catch (error) {
          const parent = await sdk.getDocFromServer(doc.ref); guard();
          if (parent.exists() && parent.data().deletedAt != null) result.push({ id: doc.id, ...parent.data(), deleted: true });
          else throw error;
        }
      }
      const configs = await sdk.getDocsFromServer(sdk.collection(database, 'teams', teamId, 'configuration'));
      for (const doc of configs.docs) result.push({ kind: 'configuration', id: '@configuration', panel: doc.data().payload });
      guard(); return result;
    }
  };
}

export async function loadFirestoreTransport(uid) {
  if (!syncSettings.enabled) throw Error('Sincronización desactivada.');
  if (!syncSettings.emulator && !syncSettings.allowRealWrites) throw Error('Firebase real pendiente de autorización explícita.');
  if (syncSettings.emulator && (firebaseSettings.config.projectId !== 'demo-defensas' || !firebaseSettings.authEmulator ||
    !['localhost', '127.0.0.1'].includes(location.hostname))) throw Error('El emulador exige proyecto demo-defensas en localhost.');
  const [appSdk, authSdk, sdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js')
  ]);
  const app = appSdk.getApp('defensas-auth'), auth = authSdk.getAuth(app), database = sdk.getFirestore(app);
  // Firestore solo usa caché de memoria; IndexedDB propio es el único almacenamiento duradero.
  if (syncSettings.emulator && !emulatorDatabases.has(database)) {
    sdk.connectFirestoreEmulator(database, '127.0.0.1', 8085); emulatorDatabases.add(database);
  }
  return createFirestoreTransport(sdk, database, uid, () => auth.currentUser?.uid);
}
