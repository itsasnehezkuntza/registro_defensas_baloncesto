import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, writeBatch,
  serverTimestamp, setLogLevel, query, where } from 'firebase/firestore';

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085') throw Error('Solo emulador local 127.0.0.1:8085.');
setLogLevel('silent');
const env = await initializeTestEnvironment({ projectId: 'demo-defensas',
  firestore: { host: '127.0.0.1', port: 8085, rules: await readFile('firestore.rules', 'utf8') } });
let checks = 0;
const ok = async (label, promise) => { await assertSucceeds(promise); checks++; console.log('PERMITIDO: ' + label); };
const no = async (label, promise) => { await assertFails(promise); checks++; console.log('DENEGADO: ' + label); };
const account = (uid, provider = 'google.com') => env.authenticatedContext(uid, { firebase: { sign_in_provider: provider } }).firestore();
const owner = account('propietario'), outsider = account('externo'), guest = account('invitado');
const anonymous = env.unauthenticatedContext().firestore(), anonymousAuth = account('anon', 'anonymous');
const teamData = uid => ({ schemaVersion: 1, name: 'Equipo ficticio', ownerUid: uid, createdAt: serverTimestamp() });
const memberData = uid => ({ schemaVersion: 1, uid, role: 'owner', status: 'active', createdAt: serverTimestamp() });
function newTeam(db, id, uid) {
  const batch = writeBatch(db);
  batch.set(doc(db, `teams/${id}`), teamData(uid));
  batch.set(doc(db, `teams/${id}/members/${uid}`), memberData(uid));
  return batch.commit();
}
const game = () => ({ schemaVersion: 1, createdBy: 'propietario', createdAt: serverTimestamp(), sourceId: 'dispositivo-a',
  payload: { id: 'local-game', jornada: '1', rival: 'Ficticio', createdAt: '2026-10-14T10:00:00Z' }, deletedAt: null, deletedBy: null });
const event = () => ({ schemaVersion: 1, createdBy: 'propietario', createdAt: serverTimestamp(), sourceId: 'dispositivo-a',
  payload: { id: 'local-event', gameId: 'local-game', categoria: 'Estático', accion: 'Cortes',
    categoria_id: 'estatico', accion_id: 'estatico_cortes', defensa_id: null, tiros_permitidos: [2],
    valor_tiro: 2, resultado: 'fallado', fecha_hora: '2026-10-14T10:00:01Z', seq: 1 } });
const tombstone = id => ({ schemaVersion: 1, eventId: id, deletedBy: 'propietario', deletedAt: serverTimestamp(), operationId: 'op-1' });
const base = 'teams/a/games/g';
try {
  await env.clearFirestore();
  await ok('creación atómica equipo/propietario', newTeam(owner, 'a', 'propietario'));
  await ok('segundo equipo separado', newTeam(outsider, 'b', 'externo'));
  await no('equipo sin miembro atómico', setDoc(doc(owner, 'teams/orphan'), teamData('propietario')));
  await no('propietario suplantado', newTeam(outsider, 'false-owner', 'propietario'));
  await no('autenticación anónima no crea equipo', newTeam(anonymousAuth, 'anon-team', 'anon'));
  await ok('perfil propio', setDoc(doc(owner, 'users/propietario'), { schemaVersion: 1, displayName: 'Prueba', createdAt: serverTimestamp() }));
  await no('perfil con permisos inventados', setDoc(doc(outsider, 'users/externo'), { schemaVersion: 1, displayName: 'Prueba', createdAt: serverTimestamp(), role: 'admin' }));
  await no('perfil ajeno', getDoc(doc(outsider, 'users/propietario')));
  await ok('partido del propietario', setDoc(doc(owner, base), game()));
  await ok('lectura del propietario', getDoc(doc(owner, base)));
  await ok('consulta de partidos del equipo', getDocs(collection(owner, 'teams/a/games')));
  await ok('consulta equipos propios acotada', getDocs(query(collection(owner, 'teams'), where('ownerUid', '==', 'propietario'))));
  await no('consulta equipos global', getDocs(collection(owner, 'teams')));
  await no('sin sesión', getDoc(doc(anonymous, base)));
  await no('cuenta anónima', getDoc(doc(anonymousAuth, base)));
  await no('usuario externo lee partido', getDoc(doc(outsider, base)));
  await no('propietario de otro equipo lee miembros', getDocs(collection(outsider, 'teams/a/members')));
  await no('autoinclusión', setDoc(doc(outsider, 'teams/a/members/externo'), memberData('externo')));
  await no('propietario invita en fase no habilitada', setDoc(doc(owner, 'teams/a/members/invitado'), memberData('invitado')));
  await no('cambio propietario', updateDoc(doc(owner, 'teams/a'), { ownerUid: 'externo' }));
  await no('alteración de rol propio', updateDoc(doc(owner, 'teams/a/members/propietario'), { role: 'admin' }));
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'teams/a/members/invitado'), { ...memberData('invitado'), role: 'coach', status: 'invited' });
  });
  await no('invitado no tiene acceso', getDoc(doc(guest, base)));
  await no('invitado se activa/escala', updateDoc(doc(guest, 'teams/a/members/invitado'), { role: 'owner', status: 'active' }));
  await no('invitado escribe evento', setDoc(doc(guest, `${base}/events/guest`), event()));
  await no('jornada ausente', setDoc(doc(owner, 'teams/a/games/invalid'), { ...game(), payload: { id: 'x', rival: 'x', createdAt: 'x' } }));
  await no('campo no previsto', setDoc(doc(owner, 'teams/a/games/extra'), { ...game(), public: true }));
  await no('autor falsificado', setDoc(doc(owner, `${base}/events/spoof`), { ...event(), createdBy: 'externo' }));
  await no('evento entre equipos', setDoc(doc(outsider, `${base}/events/external`), { ...event(), createdBy: 'externo' }));
  await no('evento con otro partido', setDoc(doc(owner, `${base}/events/wrong-game`), { ...event(), payload: { ...event().payload, gameId: 'another' } }));
  await no('valor deportivo inválido', setDoc(doc(owner, `${base}/events/wrong-shot`), { ...event(), payload: { ...event().payload, valor_tiro: 3 } }));
  await no('resultado inválido', setDoc(doc(owner, `${base}/events/wrong-result`), { ...event(), payload: { ...event().payload, resultado: 'otro' } }));
  await no('tiempo de servidor falsificado', setDoc(doc(owner, `${base}/events/wrong-time`), { ...event(), createdAt: 'ayer' }));
  await ok('evento completo', setDoc(doc(owner, `${base}/events/e1`), event()));
  const legacy = event(); delete legacy.payload.categoria_id; delete legacy.payload.accion_id;
  delete legacy.payload.defensa_id; delete legacy.payload.tiros_permitidos;
  await ok('histórico sin IDs deportivos modernos', setDoc(doc(owner, `${base}/events/legacy`), legacy));
  await no('reescribir evento', updateDoc(doc(owner, `${base}/events/e1`), { 'payload.resultado': 'anotado' }));
  await no('borrado físico evento', deleteDoc(doc(owner, `${base}/events/e1`)));
  await ok('Deshacer persistente', setDoc(doc(owner, `${base}/eventDeletions/e1`), tombstone('e1')));
  await no('quitar lápida evento', deleteDoc(doc(owner, `${base}/eventDeletions/e1`)));
  await no('reescribir lápida evento', updateDoc(doc(owner, `${base}/eventDeletions/e1`), { operationId: 'otro' }));
  await ok('Deshacer antes del alta', setDoc(doc(owner, `${base}/eventDeletions/late`), tombstone('late')));
  await no('alta tardía tras Deshacer', setDoc(doc(owner, `${base}/events/late`), event()));
  const conflict = writeBatch(owner);
  conflict.set(doc(owner, `${base}/events/race`), event());
  conflict.set(doc(owner, `${base}/eventDeletions/race`), tombstone('race'));
  await no('alta y Deshacer contradictorios en batch', conflict.commit());
  const deletion = writeBatch(owner);
  deletion.update(doc(owner, base), { deletedAt: serverTimestamp(), deletedBy: 'propietario' });
  deletion.set(doc(owner, `${base}/events/race-game`), event());
  await no('alta y borrado del padre en batch', deletion.commit());
  await ok('borrado lógico partido', updateDoc(doc(owner, base), { deletedAt: serverTimestamp(), deletedBy: 'propietario' }));
  await ok('recuperar lápida partido', getDoc(doc(owner, base)));
  await no('lectura eventos de partido borrado', getDocs(collection(owner, `${base}/events`)));
  await no('alta tras borrado partido', setDoc(doc(owner, `${base}/events/late-game`), event()));
  await no('resucitar partido', updateDoc(doc(owner, base), { deletedAt: null, deletedBy: null }));
  await no('recrear partido con set', setDoc(doc(owner, base), game()));
  await no('quitar lápida partido', deleteDoc(doc(owner, base)));
  await no('colección no prevista', setDoc(doc(owner, 'public/private'), { data: 'x' }));
  assert(checks >= 50);
  console.log(`Reglas Firestore: ${checks} comprobaciones correctas.`);
} finally { await env.cleanup(); }
