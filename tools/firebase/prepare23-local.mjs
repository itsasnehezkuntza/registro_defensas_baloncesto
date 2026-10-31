// Copia estática local sin Git, red, credenciales ni despliegue.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { assets17 } from './prepare17-ipad.mjs';
export const assets23 = [...assets17, 'supervision.html', 'supervision.css', 'js/panel-configuration.js', 'js/supervision-reader.js', 'js/supervision-ui.js'];
if (process.argv[1]?.endsWith('prepare23-local.mjs')) {
  const root = '.test-artifacts/pages/', files = [];
  for (const name of assets23) {
    const bytes = await readFile(name);
    if (name.endsWith('.js')) for (const match of bytes.toString().matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g))
      if (match[1].startsWith('.')) assert(assets23.includes(posix.normalize(posix.join(posix.dirname(name), match[1]))), `${name} → ${match[1]}`);
    await mkdir(dirname(root + name), { recursive: true }); await writeFile(root + name, bytes);
    files.push({ name, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  const actual = (await readdir(root, { recursive: true, withFileTypes: true })).filter(e => e.isFile()).length;
  assert.equal(actual, assets23.length);
  await mkdir('.test-artifacts/firebase/fase23', { recursive: true });
  await writeFile('.test-artifacts/firebase/fase23/paquete.json', JSON.stringify({ published: false, files }, null, 2));
  console.log(`${files.length} archivos públicos preparados localmente, dependencias relativas completas.`);
}
