import { canonical } from './sync-storage.js';
import { syncSettings } from './sync-config.js';
import { firebaseSettings } from './firebase-config.js';
// Los snapshots aquí son resultados de lecturas puntuales; no hay onSnapshot de aplicación.

const conflict = () => Object.assign(Error('El ID remoto contiene datos diferentes. Se conserva la copia local.'), { code: 'SYNC_CONFLICT' });
const emulatorDatabases = new WeakSet();
// Adaptador puro: en las pruebas recibe el SDK oficial conectado al emulador.
export function createFirestoreTransport(sdk, database, uid, currentUid) {
  const guard = () => { if (currentUid() !== uid) throw Object.assign(Error('La cuenta ha cambiado.'), { code: 'SCOPE_CHANGED' }); };
  const gameRef = (team, gid) => sdk.doc(database, 'teams', team, 'games', gid);
  const envelope = op => ({ schemaVersion: 1, createdBy: uid, createdAt: sdk.serverTimestamp(), sourceId: op.sourceId, payload: op.payload });
  const same = (existing, op) => canonical(existing.payload) === canonical(op.payload) && existing.sourceId === op.sourceId;
  return {
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
      if (team.data()?.ownerUid !== uid || member.data()?.role !== 'owner' || member.data()?.status !== 'active') throw Error('El equipo no está autorizado.');
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
      return sdk.runTransaction(database, async tx => {
        guard();
        const parent = gameRef(op.teamId, op.gameId), game = await tx.get(parent);
        if (game.exists() && game.data().deletedAt != null) return { deleted: true };
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
        const tombRef = sdk.doc(parent, 'eventDeletions', op.eventId), tomb = await tx.get(tombRef);
        if (tomb.exists()) return { deleted: true };
        if (op.type === 'undo') {
          guard(); tx.set(tombRef, { schemaVersion: 1, eventId: op.eventId, operationId: op.opId,
            deletedBy: uid, deletedAt: sdk.serverTimestamp() }); return;
        }
        const ref = sdk.doc(parent, 'events', op.eventId), event = await tx.get(ref);
        if (event.exists()) { if (!same(event.data(), op)) throw conflict(); return; }
        guard(); tx.set(ref, envelope(op));
      });
    },
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
