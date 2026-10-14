// Solo proyecto ficticio. No login, despliegue ni acceso a proyectos reales.
import { spawn } from 'node:child_process';
import { mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname, delimiter } from 'node:path';
const root = process.cwd();
const artifacts = resolve(root, '.test-artifacts/firebase');
await mkdir(artifacts, { recursive: true });
const env = { ...process.env, CI: 'true', FIREBASE_CLI_DISABLE_UPDATE_CHECK: 'true',
  FIREBASE_EMULATORS_PATH: resolve(artifacts, 'emulators'), XDG_CONFIG_HOME: resolve(artifacts, 'config'),
  PATH: dirname(process.execPath) + delimiter + process.env.PATH };
// JRE portátil opcional, aislado en el proyecto. En otros equipos usar Java >=21.
const javaRoot = resolve(root, '.test-artifacts/java21');
const jre = (await readdir(javaRoot).catch(() => [])).find(name => name.startsWith('jdk-'));
if (jre) env.PATH = resolve(javaRoot, jre, 'bin') + delimiter + env.PATH;
const mode = process.argv[2] || 'rules';
if (!['rules', 'auth'].includes(mode)) throw Error('Modo de emulador desconocido');
const args = mode === 'rules'
  ? ['emulators:exec', '--only', 'firestore', '--project', 'demo-defensas', 'node tools/firebase/rules.test.mjs']
  : ['emulators:exec', '--only', 'auth', '--project', 'demo-defensas', 'node tools/firebase/auth-browser.mjs'];
const child = spawn(process.execPath, [resolve(root, 'node_modules/firebase-tools/lib/bin/firebase.js'), ...args], { cwd: root, env, stdio: 'inherit' });
process.exitCode = await new Promise((ok, fail) => { child.on('exit', code => ok(code ?? 1)); child.on('error', fail); });
