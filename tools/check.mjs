// Comprobaciones locales sin ejecutar la aplicación ni acceder a Firebase.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { publicFiles } from './public-files.mjs';
import { nativeTests } from './test.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const text = name => readFile(resolve(root, name), 'utf8');
const scriptRefs = source => [...source.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)['"]([^'"]+)['"]/g)].map(match => match[1]).filter(ref => /^(?:\.{1,2}\/|node:|https?:|@?[\w][\w./@-]*$)/.test(ref));
function relativeRef(name, reference) {
  if (reference.startsWith('#') || /^(?:https?:|data:|mailto:)/.test(reference)) return null;
  assert(!reference.startsWith('/'), name + ': ruta absoluta incompatible con subruta: ' + reference);
  const result = posix.normalize(posix.join(posix.dirname(name), reference.split(/[?#]/)[0]));
  assert(!result.startsWith('../'), name + ': referencia fuera del repositorio');
  return result;
}
assert.equal(new Set(publicFiles).size, 43, 'Lista pública de 23.0 sin duplicados');
for (const name of publicFiles) {
  assert(/^(?:index\.html|supervision\.html|app\.js|[\w-]+\.css|categorias\.csv|\.nojekyll|js\/[\w-]+\.js|fonts\/[\w.-]+)$/.test(name), 'Archivo interno en paquete: ' + name);
  await access(resolve(root, name));
  const source = /\.(?:js|html|css)$/.test(name) ? await text(name) : '';
  const refs = name.endsWith('.js') ? scriptRefs(source)
    : name.endsWith('.html') ? [...source.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)].map(match => match[1])
    : [...source.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)].map(match => match[1]);
  for (const reference of refs) {
    const target = relativeRef(name, reference);
    if (target) assert(publicFiles.includes(target), name + ' → archivo no público o ausente: ' + target);
  }
}
const entries = [...await nativeTests(), 'tools/check.mjs', 'tools/prepare-test-pages.mjs',
  'playwright.config.mjs', 'tools/playwright/cli.mjs', 'tools/playwright/servidor.mjs',
  'tools/playwright/visual.spec.mjs', 'tools/playwright/auth-fixture.mjs', 'tools/firebase/local-browser.mjs',
  'tools/firebase/emuladores.mjs', 'tools/firebase/rules.test.mjs', 'tools/firebase/account22.test.mjs',
  'tools/firebase/sync.test.mjs', 'tools/firebase/supervision23.test.mjs', 'tools/firebase/suite23.mjs'];
const checked = new Set();
async function checkScript(name) {
  if (checked.has(name)) return;
  checked.add(name);
  const source = await text(name);
  const syntax = spawnSync(process.execPath, ['--check', resolve(root, name)], { encoding: 'utf8' });
  assert.equal(syntax.status, 0, name + ': ' + syntax.stderr);
  for (const reference of scriptRefs(source)) {
    if (reference.startsWith('.')) {
      // Los imports ./js y ../js de page.evaluate se resuelven en la página, no en tools/firebase.
      const target = name.startsWith('tools/') && /^\.\.?\/js\//.test(reference)
        ? reference.replace(/^\.\.?\//, '') : relativeRef(name, reference);
      await access(resolve(root, target));
      if (/\.(?:js|mjs)$/.test(target)) await checkScript(target);
    } else if (!/^(?:node:|https?:)/.test(reference)) {
      createRequire(resolve(root, name)).resolve(reference);
    }
  }
}
for (const name of [...publicFiles.filter(name => name.endsWith('.js')), ...entries]) await checkScript(name);
const config = JSON.parse(await text('firebase.json'));
assert.deepEqual(Object.keys(config).sort(), ['emulators', 'firestore']);
assert.deepEqual(config.firestore, { rules: 'firestore.rules' });
assert.deepEqual(config.emulators, { auth: { host: '127.0.0.1', port: 9099 }, firestore: { host: '127.0.0.1', port: 8085 }, ui: { enabled: false }, singleProjectMode: true });
const pkg = JSON.parse(await text('package.json'));
const lock = JSON.parse(await text('package-lock.json'));
assert.deepEqual(pkg.devDependencies, lock.packages[''].devDependencies, 'Dependencias coherentes con lockfile');
assert(!pkg.dependencies || Object.keys(pkg.dependencies).length === 0, 'Sin dependencias de producción');
console.log('Correcto: ' + checked.size + ' scripts, imports vigentes, 43 archivos públicos y referencias de subruta; emuladores loopback y lockfile coherentes.');
