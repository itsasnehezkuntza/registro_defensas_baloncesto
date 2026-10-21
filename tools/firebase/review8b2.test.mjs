// Matriz adicional con el mismo SDK cliente usado en el control real; solo demo.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import { fingerprint, runSecurityChecks } from './security-checks.mjs';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085') throw Error('Solo Emulator.');
sdk.setLogLevel('silent');
const env = await initializeTestEnvironment({ projectId: 'demo-defensas', firestore: { host: '127.0.0.1', port: 8085, rules: await readFile('firestore.rules', 'utf8') } });
const fixture = { projectId: 'demo-defensas', ownerHash: await fingerprint('owner8b2'), teamId: 'prueba8b2-seguridad-' + randomUUID() };
const reports = [];
try {
  await env.clearFirestore();
  for (const [role, uid] of [['owner', 'owner8b2'], ['signed-out', null], ['external', 'external8b2']]) {
    const db = uid ? env.authenticatedContext(uid, { firebase: { sign_in_provider: 'google.com' } }).firestore() : env.unauthenticatedContext().firestore();
    reports.push(await runSecurityChecks(sdk, db, uid ? { uid } : null, fixture, role));
  }
  assert.equal(reports.flatMap(r => r.checks).length, 25);
  await mkdir('.test-artifacts/firebase/fase8b2', { recursive: true });
  await writeFile('.test-artifacts/firebase/fase8b2/security-emulator.json', JSON.stringify(reports, null, 2));
  console.log('Seguridad adicional: 25 comprobaciones SDK correctas en Emulator.');
} finally { await env.cleanup(); }
await import('./sync.test.mjs');
