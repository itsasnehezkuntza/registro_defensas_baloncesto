import test from 'node:test';
import assert from 'node:assert/strict';
import { sequentialGoogleLogin } from './sync-real-login.mjs';

test('B no abre hasta que A tiene sesión y su popup está cerrado', async () => {
  const calls = []; let index = -1;
  const states = [
    { A: { uidHash: null } },
    { A: { uidHash: 'owner' } },
    { A: { uidHash: 'owner' } },
    { A: { uidHash: 'owner' }, B: { uidHash: null } },
    { A: { uidHash: 'owner' }, B: { uidHash: 'owner' } },
    { A: { uidHash: 'owner' }, B: { uidHash: 'owner' } }
  ];
  const result = await sequentialGoogleLogin({
    open: async label => { if (label === 'B') assert.equal(index, 2); calls.push('open ' + label); },
    login: async label => calls.push('login ' + label),
    status: async () => states[++index],
    popupClosed: label => label === 'A' ? index >= 2 : index >= 5,
    pause: async () => {}, attempts: 3
  });
  assert.deepEqual(calls, ['open A', 'login A', 'open B', 'login B']);
  assert.deepEqual(result, { sameAccount: true }); assert.equal(index, 5);
});

test('agotamiento en A no abre B', async () => {
  const opened = [];
  await assert.rejects(sequentialGoogleLogin({
    open: async label => opened.push(label), login: async () => {},
    status: async () => ({ A: { uidHash: null } }), popupClosed: () => false,
    pause: async () => {}, attempts: 2
  }), /agotado.*A/);
  assert.deepEqual(opened, ['A']);
});

test('dos cuentas diferentes detienen el acceso sin continuar', async () => {
  let stage = 'A';
  await assert.rejects(sequentialGoogleLogin({
    open: async label => { stage = label; }, login: async () => {},
    status: async () => ({ A: { uidHash: 'owner' }, B: { uidHash: stage === 'B' ? 'outsider' : null } }),
    popupClosed: () => true, pause: async () => {}, attempts: 1
  }), /cuentas distintas/);
});

test('si cambia A mientras se accede en B se detiene', async () => {
  let stage = 'A';
  await assert.rejects(sequentialGoogleLogin({
    open: async label => { stage = label; }, login: async () => {},
    status: async () => ({ A: { uidHash: stage === 'A' ? 'owner' : null }, B: { uidHash: null } }),
    popupClosed: () => true, pause: async () => {}, attempts: 1
  }), /cuenta A ha cambiado/);
});
