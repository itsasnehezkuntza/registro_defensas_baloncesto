// Auditoría local contra la versión base; no consulta Firebase ni escribe Git.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
assert.equal(git(['rev-parse', 'HEAD']), '6003a72abae880f225669d0a4d4cf27b97093fd2');
assert.equal(git(['diff', '--cached', '--name-only']), '');
const oldRules = git(['show', 'HEAD:firestore.rules']), rules = await readFile('firestore.rules', 'utf8');
const writes = text => [...text.matchAll(/allow\s+(?:create|update|delete)[^;]+;/g)].map(m => m[0].replace(/\s+/g, ' '));
assert.deepEqual(writes(rules), writes(oldRules), 'Permisos de escritura existentes alterados');
assert(rules.includes('match /members/{uid} {\r\n        allow read: if owner(teamId);') || rules.includes('match /members/{uid} {\n        allow read: if owner(teamId);'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
assert.deepEqual(pkg.devDependencies, JSON.parse(git(['show', 'HEAD:package.json'])).devDependencies);
const intact = ['app.js', 'categorias.csv', 'package-lock.json', 'js/persistencia.js', 'js/sync-engine.js', 'js/sync-storage.js', 'js/firestore-sync.js', 'js/firestore-watch.js', 'js/firebase-auth.js', 'js/firebase-config.js', 'js/sync-config.js', 'js/cuenta.js', 'js/cuenta-ui.js', 'js/sync-ui.js', 'js/dashboard.js', 'js/estadisticas.js', 'js/exportacion.js', 'js/registro.js', 'js/identidad.js', 'styles.css', 'dashboard.css', 'registro.css', 'cuenta.css'];
const hashes = [];
for (const file of intact) {
  const current = await readFile(file), old = execFileSync('git', ['show', 'HEAD:' + file]);
  // Git puede convertir EOL al crear la copia en Windows; contenido intacto.
  const normalize = bytes => file.endsWith('.ttf') ? bytes : bytes.toString().replaceAll('\r\n', '\n');
  assert.deepEqual(normalize(current), normalize(old), file);
  hashes.push({ file, sha256: createHash('sha256').update(current).digest('hex') });
}
await mkdir('.test-artifacts/firebase/fase23', { recursive: true });
await writeFile('.test-artifacts/firebase/fase23/auditoria.json', JSON.stringify({ base: git(['rev-parse', 'HEAD']), staged: false, existingWriteClausesUnchanged: writes(rules).length, dependenciesUnchanged: true, intact: hashes, changed: git(['status', '--short']) }, null, 2));
console.log(`${hashes.length} archivos centrales intactos; ${writes(rules).length} cláusulas de escritura idénticas; sin dependencias nuevas ni cambios de índice.`);
