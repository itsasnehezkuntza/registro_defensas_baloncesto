import { spawn, fork } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
let server;
let status = 1;
try {
  if (process.argv[2] === 'test') {
    server = fork(resolve(root, 'tools/playwright/servidor.mjs'), [], { cwd: root, env: { ...process.env, DEFENSAS_TEST_LOCAL_ONLY: '1' }, stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
    await new Promise((resolveReady, reject) => {
      const timer = setTimeout(() => reject(new Error('El servidor local no responde.')), 10000);
      server.once('message', () => { clearTimeout(timer); resolveReady(); });
      server.once('exit', () => { clearTimeout(timer); reject(new Error('No se pudo abrir el puerto 4173.')); });
      server.once('error', error => { clearTimeout(timer); reject(error); });
    });
  }
  const child = spawn(process.execPath, [resolve(root, 'node_modules/@playwright/test/cli.js'), ...process.argv.slice(2)], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: resolve(root, '.test-artifacts/playwright/browsers') }
  });
  status = await new Promise((resolveExit, reject) => {
    child.once('exit', code => resolveExit(code ?? 1));
    child.once('error', reject);
  });
} catch (error) { console.error(error.message); }
finally { server?.kill(); }
process.exitCode = status;
