// Solo proyecto ficticio; configuración y CLI del propio clon.
import { spawn, spawnSync } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import { resolve, dirname, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const targets = { rules: ['firestore', 'rules.test.mjs'],
  auth: ['firestore,auth', 'account22.test.mjs'],
  account22: ['firestore,auth', 'account22.test.mjs'],
  sync: ['firestore,auth', 'sync.test.mjs'],
  supervision23: ['firestore,auth', 'supervision23.test.mjs'],
  suite23: ['firestore,auth', 'suite23.mjs'] };
const mode = process.argv[2] || 'rules';
if (!Object.hasOwn(targets, mode)) throw Error('Modo fuera de la batería vigente. Véase DESARROLLO.md: rules, auth, account22, sync, supervision23, suite23.');
const artifacts = resolve(root, '.test-artifacts/firebase');
await mkdir(artifacts, { recursive: true });
const env = { ...process.env, DEBUG: '', CI: 'true', FIREBASE_CLI_DISABLE_UPDATE_CHECK: 'true',
  DEFENSAS_TEST_EMULATOR_CSP: '1',
  PLAYWRIGHT_BROWSERS_PATH: resolve(root, '.test-artifacts/playwright/browsers'),
  FIREBASE_EMULATORS_PATH: resolve(artifacts, 'emulators'), XDG_CONFIG_HOME: resolve(artifacts, 'config'),
  GCLOUD_PROJECT: 'demo-defensas', GOOGLE_CLOUD_PROJECT: 'demo-defensas',
  PATH: (process.env.JAVA_HOME ? resolve(process.env.JAVA_HOME, 'bin') + delimiter : '') + dirname(process.execPath) + delimiter + process.env.PATH };
for (const key of ['GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_TOKEN', 'FIREBASE_CONFIG', 'DEFENSAS_RELEASE_8C',
  'DEFENSAS_TEST_FIREBASE_CLI', 'DEFENSAS_TEST_EMULATOR_CACHE', 'DEFENSAS_TEST_JAVA_ROOT']) delete env[key];
const java = spawnSync('java', ['-version'], { env, encoding: 'utf8' });
const version = (java.stderr + java.stdout).match(/version "(\d+)/)?.[1];
if (java.status !== 0 || !version || Number(version) < 21) throw Error('Se necesita Java 21 o superior en PATH o JAVA_HOME. No se usa Java ni caché de otro workspace.');
const cli = resolve(root, 'node_modules/firebase-tools/lib/bin/firebase.js');
await access(cli); // No resolver dependencias en un directorio padre.
const [only, script] = targets[mode];
const args = ['emulators:exec', '--config', resolve(root, 'firebase.json'), '--only', only,
  '--project', 'demo-defensas', 'node tools/firebase/' + script];
const child = spawn(process.execPath, [cli, ...args], { cwd: root, env, stdio: 'inherit' });
process.exitCode = await new Promise((ok, fail) => { child.once('exit', code => ok(code ?? 1)); child.once('error', fail); });
