import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import { verifyPreviewAccount } from '../../js/preview-account.js';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085') throw Error('Solo Emulator.');
sdk.setLogLevel('silent');
const env = await initializeTestEnvironment({ projectId: 'demo-defensas', firestore: { host: '127.0.0.1', port: 8085, rules: await readFile('firestore.rules', 'utf8') } });
const user = { uid: 'cuenta-exclusiva-ficticia' }, other = 'otra-cuenta-ficticia';
const plan = { projectId: 'demo-defensas', ownerHash: createHash('sha256').update(user.uid).digest('hex').slice(0, 16), teamId: 'ipad-ficticio', teamName: 'PRUEBA IPAD FICTICIA' };
const db = env.authenticatedContext(user.uid, { firebase: { sign_in_provider: 'google.com' } }).firestore();
const create = async (database, teamId, uid, name) => {
  const batch = sdk.writeBatch(database);
  batch.set(sdk.doc(database, 'teams', teamId), { schemaVersion: 1, name, ownerUid: uid, createdAt: sdk.serverTimestamp() });
  batch.set(sdk.doc(database, 'teams', teamId, 'members', uid), { schemaVersion: 1, uid, role: 'owner', status: 'active', createdAt: sdk.serverTimestamp() });
  await batch.commit();
};
const checks = [];
try {
  await env.clearFirestore();
  const foreign = env.authenticatedContext(other, { firebase: { sign_in_provider: 'google.com' } }).firestore();
  await create(foreign, 'prueba8b2-seguridad-9941b41c-9837-419c-8385-3407bd4f897f', other, 'Ficticio ajeno');
  assert.equal((await verifyPreviewAccount(sdk, db, user, plan, () => user.uid)).ownedTeams, 0); checks.push('cuenta vacía y denegación real ajena');
  await assert.rejects(verifyPreviewAccount(sdk, db, { uid: other }, plan, () => other), /cuenta exclusiva/); checks.push('cuenta distinta rechazada');
  await assert.rejects(verifyPreviewAccount(sdk, db, null, plan, () => null), /cuenta ha cambiado/); checks.push('sin sesión rechazada');
  await assert.rejects(verifyPreviewAccount({ ...sdk, getDocFromServer: async () => { throw Object.assign(Error('Red'), { code: 'unavailable' }); } }, db, user, plan, () => user.uid), /Red/); checks.push('red no cuenta como denegación');
  await assert.rejects(verifyPreviewAccount({ ...sdk, getDocFromServer: async () => ({}) }, db, user, plan, () => user.uid), /Acceso inesperado/); checks.push('permiso inesperado detiene');
  let current = user.uid;
  await assert.rejects(verifyPreviewAccount({ ...sdk, getDocsFromServer: async (...args) => { const result = await sdk.getDocsFromServer(...args); current = other; return result; } }, db, user, plan, () => current), /cuenta ha cambiado/); checks.push('cambio de cuenta durante lectura detiene');
  await create(db, plan.teamId, user.uid, plan.teamName);
  assert.equal((await verifyPreviewAccount(sdk, db, user, plan, () => user.uid)).ownedTeams, 1); checks.push('equipo único con miembro activo permitido');
  await assertFails(sdk.getDocFromServer(sdk.doc(foreign, 'teams', plan.teamId))); checks.push('otra cuenta sin acceso al equipo iPad');
  await create(db, 'equipo-adicional-ficticio', user.uid, 'Ficticio adicional');
  await assert.rejects(verifyPreviewAccount(sdk, db, user, plan, () => user.uid), /otros equipos/); checks.push('otro equipo propio detiene');
  await writeFile('.test-artifacts/firebase/fase8b3/account-emulator.json', JSON.stringify({ projectId: 'demo-defensas', checks, passed: checks.length, realWrites: 0 }, null, 2));
  console.log('Activación segura: ' + checks.length + ' comprobaciones correctas en Emulator.');
} finally { await env.cleanup(); }
