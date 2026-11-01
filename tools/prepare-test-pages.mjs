// Paquete local regenerable; no publica ni cambia fuentes.
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles } from './public-files.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export async function prepareTestPages() {
  const output = resolve(root, '.test-artifacts/pages');
  const existing = await readdir(output, { recursive: true, withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  for (const entry of existing.filter(entry => entry.isFile())) {
    const name = relative(output, resolve(entry.parentPath, entry.name)).split(sep).join('/');
    if (!publicFiles.includes(name)) throw Error('Archivo ajeno en paquete de pruebas; conservar y revisar: ' + name);
  }
  for (const name of publicFiles) {
    const bytes = await readFile(resolve(root, name));
    await mkdir(dirname(resolve(output, name)), { recursive: true });
    await writeFile(resolve(output, name), bytes);
  }
  console.log(publicFiles.length + ' archivos preparados en .test-artifacts/pages (sin publicar).');
  return output;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareTestPages();
