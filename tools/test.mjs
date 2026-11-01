// Solo pruebas nativas rápidas: no inicia navegadores, Firebase ni scripts de publicación.
import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
export async function nativeTests() {
  return [...(await readdir(new URL('../tests/', import.meta.url)))
    .filter(name => name.endsWith('.test.mjs')).sort().map(name => 'tests/' + name),
    'tools/firebase/cuenta.test.mjs'];
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const child = spawn(process.execPath, ['--test', ...await nativeTests()], { cwd: root, stdio: 'inherit' });
  process.exitCode = await new Promise((ok, fail) => { child.once('exit', code => ok(code ?? 1)); child.once('error', fail); });
}
