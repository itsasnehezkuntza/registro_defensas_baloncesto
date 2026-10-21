import assert from 'node:assert/strict';
import { createAccountController, authErrorText, readAccountMode, writeAccountMode, loginScreenVisible, initialsFor,
  syncWarning, SYNC_GRACE_MS } from '../../js/cuenta.js';
let calls = 0;
const off = createAccountController({ settings: { enabled: false }, loadAdapter: () => { calls++; } });
let state; off.subscribe(value => { state = value; }); await off.start();
assert.equal(calls, 0); assert.equal(state.status, 'disabled');
let notify, resolveLogin;
const adapter = { ready: async () => {}, observe: next => { notify = next; next(null); return () => {}; },
  login: () => { calls++; return new Promise(ok => { resolveLogin = ok; }); }, logout: async () => notify(null) };
const controller = createAccountController({ settings: { enabled: true }, loadAdapter: async () => adapter });
controller.subscribe(value => { state = value; }); await controller.start();
assert.equal(state.status, 'ready');
const signingIn = controller.act('login');
assert.equal(calls, 1, 'popup invocado sin ceder el gesto de usuario');
await controller.act('login'); assert.equal(calls, 1, 'doble toque bloqueado');
notify({ uid: 'a', email: 'a@example.test', accessToken: 'no-exponer' });
resolveLogin(); await signingIn;
assert.equal(state.user.uid, 'a'); assert.equal(state.user.accessToken, undefined);
const version = state.sessionVersion; await controller.act('logout');
assert.equal(state.user, null); assert(state.sessionVersion > version);
notify({ uid: 'b' }); assert.equal(state.user.uid, 'b');
adapter.login = () => Promise.reject({ code: 'auth/popup-blocked' });
await controller.act('login'); assert.match(state.error, /ventanas emergentes/); assert.equal(state.busy, false);
adapter.logout = () => Promise.reject({ code: 'auth/network-request-failed' });
await controller.act('logout'); assert.equal(state.user.uid, 'b', 'no fingir cierre si falla');
controller.dispose();
let resolveLate;
const timeout = createAccountController({ settings: { enabled: true }, timeoutMs: 5,
  loadAdapter: () => new Promise(ok => { resolveLate = ok; }) });
timeout.subscribe(value => { state = value; }); await timeout.start();
assert.equal(state.status, 'error'); resolveLate(adapter); await Promise.resolve();
assert.equal(state.status, 'error', 'carga tardía no conecta una sesión obsoleta'); timeout.dispose();
let lateFirstObservation, observerStopped = false;
const missingObservation = createAccountController({ settings: { enabled: true }, timeoutMs: 5,
  loadAdapter: async () => ({ ready: async () => {}, observe: next => { lateFirstObservation = next; return () => { observerStopped = true; }; } }) });
missingObservation.subscribe(value => { state = value; }); await missingObservation.start();
assert.equal(state.status, 'error'); assert(observerStopped);
lateFirstObservation({ uid: 'late-observer' }); assert.equal(state.user, null, 'no aceptar primera observación después del timeout');
assert.equal(state.status, 'error'); missingObservation.dispose();
assert.match(authErrorText({ code: 'auth/unauthorized-domain' }), /dominio/);
// Fase 10: resultado de la acción (cerrar sesión solo borra datos si se completó) y foto solo https.
const results = createAccountController({ settings: { enabled: true }, loadAdapter: async () => ({ ready: async () => {},
  observe: next => { notify = next; next({ uid: 'c', photoURL: 'javascript:alert(1)', accessToken: 'x' }); return () => {}; },
  login: async () => {}, logout: () => Promise.reject({ code: 'auth/network-request-failed' }) }) });
results.subscribe(value => { state = value; }); await results.start();
assert.equal(state.user.photoURL, '', 'foto no https descartada');
assert.equal(await results.act('logout'), false, 'cierre fallido informa false');
assert.equal(await results.act('otra'), false);
notify({ uid: 'c', photoURL: 'https://lh3.googleusercontent.com/a/ficticia' });
assert.equal(state.user.photoURL, 'https://lh3.googleusercontent.com/a/ficticia');
results.dispose();
const ok = createAccountController({ settings: { enabled: true }, loadAdapter: async () => ({ ready: async () => {}, observe: next => { next(null); return () => {}; }, login: async () => {}, logout: async () => {} }) });
ok.subscribe(() => {}); await ok.start(); assert.equal(await ok.act('login'), true); ok.dispose();
// Elección recordada y almacenamiento no disponible.
const memory = new Map(), storage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) };
assert.equal(readAccountMode(storage), null);
assert(writeAccountMode('local', storage)); assert.equal(readAccountMode(storage), 'local');
memory.set('defensas-account-mode', 'otro'); assert.equal(readAccountMode(storage), null, 'valor desconocido = sin elección');
assert(writeAccountMode(null, storage)); assert.equal(memory.size, 0);
const broken = { getItem() { throw Error('privado'); }, setItem() { throw Error('privado'); } };
assert.equal(readAccountMode(broken), null); assert.equal(writeAccountMode('google', broken), false);
// Cuándo aparece la pantalla de inicio.
const base = { enabled: true, status: 'ready', user: null };
assert.equal(loginScreenVisible({ ...base, mode: null }), true, 'sin elección previa');
assert.equal(loginScreenVisible({ ...base, mode: null, status: 'loading' }), true);
assert.equal(loginScreenVisible({ ...base, mode: 'local' }), false, '«sin cuenta» no se vuelve a mostrar');
assert.equal(loginScreenVisible({ ...base, mode: 'local', requested: true }), true, 'desde el perfil');
assert.equal(loginScreenVisible({ ...base, mode: 'google', status: 'loading' }), true, 'restaurando sesión no se puede registrar');
assert.equal(loginScreenVisible({ ...base, mode: 'google', status: 'error' }), true, 'el error exige reintentar o elegir sin cuenta');
assert.equal(loginScreenVisible({ ...base, mode: 'google', user: { uid: 'a' }, restoring: true }), true, 'esperar también al equipo');
assert.equal(loginScreenVisible({ ...base, mode: 'google', user: { uid: 'a' }, restoreError: 'Equipo no recuperado' }), true);
assert.equal(loginScreenVisible({ ...base, mode: 'google', user: { uid: 'a' } }), false, 'cuenta y equipo resueltos');
assert.equal(loginScreenVisible({ ...base, mode: 'google' }), true, 'sesión perdida o cerrada');
assert.equal(loginScreenVisible({ ...base, mode: null, user: { uid: 'a' } }), false);
assert.equal(loginScreenVisible({ ...base, enabled: false, mode: null }), false, 'Google desactivado');
// Cancelar una restauración al elegir sin cuenta invalida su generación.
let completeRestore, lateObserver, adapterObserved = false;
const suspended = createAccountController({ settings: { enabled: true }, loadAdapter: () => new Promise(resolve => { completeRestore = resolve; }) });
let suspendedState; suspended.subscribe(value => { suspendedState = value; });
const restoringSession = suspended.start(); suspended.suspend();
completeRestore({ ready: async () => {}, observe: () => { adapterObserved = true; return () => {}; } });
await restoringSession;
assert.equal(suspendedState.user, null); assert.equal(suspendedState.status, 'idle'); assert.equal(adapterObserved, false);
const observed = createAccountController({ settings: { enabled: true }, loadAdapter: async () => ({
  ready: async () => {}, observe: next => { lateObserver = next; next({ uid: 'a' }); return () => {}; }
}) });
observed.subscribe(value => { suspendedState = value; }); await observed.start(); observed.suspend();
lateObserver({ uid: 'b' }); assert.equal(suspendedState.user, null, 'callback tardío tras elegir sin cuenta ignorado');
suspended.dispose(); observed.dispose();
// Iniciales.
assert.equal(initialsFor({ displayName: 'Jone Garai' }), 'JG');
assert.equal(initialsFor({ displayName: 'Íñigo' }), 'ÍÑ');
assert.equal(initialsFor({ email: 'ane.lopez@example.test' }), 'AL');
assert.equal(initialsFor({}), '?');
// Aviso de sincronización: solo ante un problema.
const now = 100000;
assert.equal(syncWarning({ pending: 0, now }), null);
assert.equal(syncWarning({ pending: 2, pendingSince: now - 1000, now }), null, 'envío normal sin aviso');
assert.equal(syncWarning({ pending: 2, pendingSince: now - SYNC_GRACE_MS, now }), 'slow');
assert.equal(syncWarning({ pending: 2, online: false, pendingSince: now, now }), 'offline');
assert.equal(syncWarning({ pending: 2, error: true, pendingSince: now, now }), 'error');
assert.equal(syncWarning({ pending: 0, error: true, now }), null, 'error sin cambios pendientes no alarma');
assert.equal(syncWarning({ pending: 1, blocked: 1, now }), 'blocked');
console.log('Cuenta: configuración ausente, gesto popup, doble toque, cambios de sesión, errores, timeout, elección recordada, pantalla de inicio, iniciales y avisos correctos.');
