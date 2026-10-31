// Ejecuta las baterías existentes sobre las reglas candidatas, siempre en emuladores.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Solo emuladores locales.');
await mkdir('.test-artifacts/firebase/fase23', { recursive: true });
for (const name of ['rules', 'supervision23', 'sync', 'account22']) {
  console.log('BATERÍA: ' + name);
  const child = spawn(process.execPath, [`tools/firebase/${name}.test.mjs`], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
  let log = '';
  child.stdout.on('data', chunk => { log += chunk; process.stdout.write(chunk); });
  child.stderr.on('data', chunk => { log += chunk; process.stderr.write(chunk); });
  const code = await new Promise((resolve, reject) => { child.on('exit', resolve); child.on('error', reject); });
  await writeFile(`.test-artifacts/firebase/fase23/${name}.log`, log);
  if (code !== 0) throw Error('Ha fallado la batería ' + name);
}
