// Capacidad de lectura exclusivamente. No importa transportes, colas o IndexedDB deportivo.
import { firebaseSettings } from './firebase-config.js';
import { validatePanel } from './panel-model.js';
import { configurationFromDoc } from './panel-configuration.js';

const denied = () => Object.assign(Error('Acceso no disponible. Actualiza los equipos autorizados.'), { code: 'permission-denied' });
const active = data => data?.schemaVersion === 1 && data.role === 'reader' && data.status === 'active';
const connected = new WeakSet();

export function createSupervisionReader(sdk, database, uid, currentUid) {
  let closed = false, authorized = new Set(), revision = 0, stop = null;
  const guard = (teamId, expected = revision) => {
    if (closed || currentUid() !== uid || expected !== revision || (teamId && !authorized.has(teamId))) throw denied();
  };
  const teamRef = teamId => sdk.doc(database, 'teams', teamId);
  return Object.freeze({
    watchAccess(onTeams, onError) {
      guard(); stop?.();
      stop = sdk.onSnapshot(sdk.collection(database, 'supervision', uid, 'teams'), { includeMetadataChanges: true }, snapshot => {
        if (closed || currentUid() !== uid) return;
        revision++;
        authorized = new Set(snapshot.metadata.fromCache ? [] : snapshot.docs.filter(d => active(d.data())).map(d => d.id));
        onTeams([...authorized]);
      }, error => {
        if (closed) return;
        revision++; authorized.clear(); onError(error);
      });
      return () => { stop?.(); stop = null; revision++; authorized.clear(); };
    },
    async team(teamId) {
      const rev = revision; guard(teamId, rev);
      const team = await sdk.getDocFromServer(teamRef(teamId)); guard(teamId, rev);
      if (!team.exists()) throw denied();
      return { id: team.id, name: team.data().name };
    },
    async games(teamId) {
      const rev = revision; guard(teamId, rev);
      const games = await sdk.getDocsFromServer(sdk.collection(teamRef(teamId), 'games')); guard(teamId, rev);
      return games.docs.filter(d => d.data().deletedAt == null).map(d => ({ remoteId: d.id, ...d.data().payload }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.remoteId.localeCompare(b.remoteId));
    },
    async game(teamId, remoteId, fallback) {
      const rev = revision; guard(teamId, rev);
      const ref = sdk.doc(teamRef(teamId), 'games', remoteId);
      // El reloj detecta cambios simultáneos en partidos modernos. Lápidas antes/después
      // evitan reincorporar tiros deshechos en partidos históricos sin reloj.
      for (let attempt = 0; attempt < 3; attempt++) {
        const before = await sdk.getDocFromServer(ref); guard(teamId, rev);
        if (!before.exists() || before.data().deletedAt != null) throw denied();
        const tombs = await sdk.getDocsFromServer(sdk.collection(ref, 'eventDeletions')); guard(teamId, rev);
        const events = await sdk.getDocsFromServer(sdk.collection(ref, 'events')); guard(teamId, rev);
        const finalTombs = await sdk.getDocsFromServer(sdk.collection(ref, 'eventDeletions')); guard(teamId, rev);
        const after = await sdk.getDocFromServer(ref); guard(teamId, rev);
        if (!after.exists() || after.data().deletedAt != null) throw denied();
        if (before.data().panelClock !== after.data().panelClock) continue;
        const deleted = new Set([...tombs.docs, ...finalTombs.docs].map(d => d.id));
        const data = after.data();
        const configuration = data.panel ? configurationFromDoc(validatePanel(data.panel).version.doc) : fallback;
        return { game: data.payload, configuration, historical: !data.panel,
          events: events.docs.filter(d => !deleted.has(d.id)).map(d => d.data().payload) };
      }
      throw Error('El partido está cambiando. Vuelve a consultarlo.');
    },
    close() { closed = true; revision++; authorized.clear(); stop?.(); stop = null; }
  });
}

export async function loadSupervisionReader(uid, currentUid) {
  const emulator = firebaseSettings.authEmulator;
  if (emulator && (firebaseSettings.config.projectId !== 'demo-defensas' || !['localhost', '127.0.0.1'].includes(location.hostname))) throw Error('Emulador inseguro.');
  const [appSdk, sdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js')
  ]);
  // App compartida solo con Auth. Caché de memoria predeterminada; nunca activar persistencia.
  const database = sdk.getFirestore(appSdk.getApp('defensas-auth'));
  if (emulator && !connected.has(database)) { sdk.connectFirestoreEmulator(database, '127.0.0.1', 8085); connected.add(database); }
  return createSupervisionReader(sdk, database, uid, currentUid);
}
