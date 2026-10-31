// Solo proyecto ficticio. No login, despliegue ni acceso a proyectos reales.
import { spawn } from 'node:child_process';
import { mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname, delimiter } from 'node:path';
const root = process.cwd();
const artifacts = resolve(root, '.test-artifacts/firebase');
await mkdir(artifacts, { recursive: true });
const env = { ...process.env, DEBUG: '', CI: 'true', FIREBASE_CLI_DISABLE_UPDATE_CHECK: 'true',
  DEFENSAS_TEST_EMULATOR_CSP: '1',
  FIREBASE_EMULATORS_PATH: process.env.DEFENSAS_TEST_EMULATOR_CACHE || resolve(artifacts, 'emulators'), XDG_CONFIG_HOME: resolve(artifacts, 'config'),
  PATH: dirname(process.execPath) + delimiter + process.env.PATH };
// JRE portátil opcional, aislado en el proyecto. En otros equipos usar Java >=21.
const javaRoot = process.env.DEFENSAS_TEST_JAVA_ROOT || resolve(root, '.test-artifacts/java21');
const jre = (await readdir(javaRoot).catch(() => [])).find(name => name.startsWith('jdk-'));
if (jre) env.PATH = resolve(javaRoot, jre, 'bin') + delimiter + env.PATH;
const mode = process.argv[2] || 'rules';
if (!['suite23', 'supervision23', 'rules', 'auth', 'sync', 'account22', 'review8b2', 'preview8b3', 'receive8b4', 'receive8b6', 'receive8b7'].includes(mode)) throw Error('Modo de emulador desconocido');
const args = mode === 'suite23'
  ? ['emulators:exec', '--only', 'firestore,auth', '--project', 'demo-defensas', 'node tools/firebase/suite23.mjs']
  : mode === 'supervision23'
  ? ['emulators:exec', '--only', 'firestore,auth', '--project', 'demo-defensas', 'node tools/firebase/supervision23.test.mjs']
  : mode === 'rules'
  ? ['emulators:exec', '--only', 'firestore', '--project', 'demo-defensas', 'node tools/firebase/rules.test.mjs']
  : mode === 'account22' ? ['emulators:exec', '--only', 'firestore,auth', '--project', 'demo-defensas', 'node tools/firebase/account22.test.mjs']
  : mode === 'receive8b7' ? ['emulators:exec', '--only', 'firestore', '--project', 'demo-defensas', 'node tools/firebase/receive8b7.test.mjs']
  : mode === 'receive8b6' ? ['emulators:exec', '--only', 'firestore', '--project', 'demo-defensas', 'node tools/firebase/receive8b6.test.mjs']
  : mode === 'receive8b4' ? ['emulators:exec', '--only', 'firestore', '--project', 'demo-defensas', 'node tools/firebase/receive8b4.test.mjs']
  : mode === 'preview8b3' ? ['emulators:exec', '--only', 'firestore', '--project', 'demo-defensas', 'node tools/firebase/preview-account.test.mjs']
  : mode === 'review8b2' ? ['emulators:exec', '--only', 'firestore,auth', '--project', 'demo-defensas', 'node tools/firebase/review8b2.test.mjs']
  : mode === 'sync' ? ['emulators:exec', '--only', 'firestore,auth', '--project', 'demo-defensas', 'node tools/firebase/sync.test.mjs']
  : ['emulators:exec', '--only', 'auth,firestore', '--project', 'demo-defensas', 'node tools/firebase/auth-browser.mjs'];
const child = spawn(process.execPath, [process.env.DEFENSAS_TEST_FIREBASE_CLI || resolve(root, 'node_modules/firebase-tools/lib/bin/firebase.js'), ...args], { cwd: root, env, stdio: 'inherit' });
process.exitCode = await new Promise((ok, fail) => { child.on('exit', code => ok(code ?? 1)); child.on('error', fail); });
