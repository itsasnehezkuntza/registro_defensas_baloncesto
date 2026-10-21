import * as p from '../js/persistencia.js';
import * as s from '../js/sync-storage.js';
import { createSyncEngine } from '../js/sync-engine.js';
import { createFirestoreTransport } from '../js/firestore-sync.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
let currentUid, backend, engine;
const statuses = [];
await p.openDatabase();
const T = {
  p, s, statuses, sdk,
  async setup(uid, teamId = null) {
    await engine?.stop(); currentUid = uid; s.setStorageIdentity(uid); s.setStorageScope(teamId);
    if (!uid) return;
    const app = initializeApp({ projectId: 'demo-defensas', apiKey: 'demo-key', appId: 'demo-app' }, crypto.randomUUID());
    const db = sdk.getFirestore(app);
    sdk.connectFirestoreEmulator(db, '127.0.0.1', 8085, { mockUserToken: { sub: uid, user_id: uid, firebase: { sign_in_provider: 'google.com' } } });
    // Contadores de API para detectar reconsultas o reaperturas accidentales.
    const metrics = T.metrics = { attached: 0, detached: 0, gets: 0, changes: 0 };
    const observed = { ...sdk,
      getDocsFromServer(...args) { metrics.gets++; return sdk.getDocsFromServer(...args); },
      getDocFromServer(...args) { metrics.gets++; return sdk.getDocFromServer(...args); },
      onSnapshot(ref, options, next, error) {
        metrics.attached++;
        const off = sdk.onSnapshot(ref, options, snapshot => {
          if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) metrics.changes += snapshot.docChanges().length;
          next(snapshot);
        }, error);
        let closed = false;
        return () => { if (!closed) { closed = true; metrics.detached++; off(); } };
      }
    };
    backend = createFirestoreTransport(observed, db, uid, () => currentUid);
    T.db = db;
    T.backend = backend;
    if (teamId) { engine = createSyncEngine(backend, { intervalMs: 1000000, onStatus: label => statuses.push(label) }); T.engine = engine; }
  },
  async flush() { await engine.start(); return { state: await p.readState(), queue: await s.listPending(), status: statuses.at(-1) }; },
  shot(gameId, eid = crypto.randomUUID(), result = 'fallado') {
    return p.addEvent({ id: eid, gameId, categoria: 'Transición', accion: 'Bajo aro', categoria_id: 'transicion',
      accion_id: 'transicion_bajo_aro', defensa_id: null, estrategia: null, tipo_bloqueo: null,
      tiros_permitidos: [2], valor_tiro: 2, resultado: result, fecha_hora: '2026-10-15T12:00:00Z' });
  }
};
window.T = T;
