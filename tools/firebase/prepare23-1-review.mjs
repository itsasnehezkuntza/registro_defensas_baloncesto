// Preparación verificable y completamente local. No red, Firebase CLI, stage o commits.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { assets23 } from './prepare23-local.mjs';
const dir = '.test-artifacts/firebase/fase23-1/';
const source22 = '6bfe942d32de8b4fe6efef8cafd48f533acbd339', pages22 = '3aed91f329ed00b672b16ae6002a41e9acf68001';
const git = args => execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] });
const hash = value => createHash('sha256').update(value).digest('hex');
const normalized = bytes => bytes.toString().replaceAll('\r\n', '\n');
const put = async (file, bytes) => { await mkdir(dirname(file), { recursive: true }); await writeFile(file, bytes); };
const originalDelivery = JSON.parse(await readFile('.test-artifacts/firebase/fase23/entrega.json', 'utf8'));
// Solo aplicación/reglas: los documentos de revisión se podrán ampliar al terminar.
for (const item of originalDelivery.files.filter(i => !i.file.endsWith('.md'))) assert.equal(hash(await readFile(item.file)), item.sha256, 'Candidato modificado desde pruebas: ' + item.file);
const reviewedPackage = JSON.parse(await readFile('.test-artifacts/firebase/fase23/paquete.json', 'utf8'));
assert.equal(reviewedPackage.files.length, 43);
for (const item of reviewedPackage.files) assert.equal(hash(await readFile(item.name)), item.sha256, 'Asset modificado desde pruebas: ' + item.name);
const rules = await readFile('firestore.rules'), baseline = git(['show', source22 + ':firestore.rules']);
let restored = normalized(rules);
const start = restored.indexOf('    // Una sola autorización administrativa');
const end = restored.indexOf('    function gameLive(', start);
assert(start > 0 && end > start); restored = restored.slice(0, start) + restored.slice(end);
const aclStart = restored.indexOf('    match /supervision/{uid}/teams/{teamId} {');
const teamStart = restored.indexOf('    match /teams/{teamId} {', aclStart);
assert(aclStart > 0 && teamStart > aclStart); restored = restored.slice(0, aclStart) + restored.slice(teamStart);
restored = restored.replaceAll('allow read: if reader(teamId)', 'allow read: if owner(teamId)').replace('allow get: if reader(teamId);', 'allow get: if owner(teamId);');
assert.equal(restored, normalized(baseline), 'No es una ampliación exclusivamente de lectura sobre 22.0');
const clauses = text => [...text.matchAll(/allow\s+(?:create|update|delete)[^;]+;/g)].map(m => m[0].replace(/\s+/g, ' '));
assert.equal(clauses(normalized(rules)).length, 19); assert.deepEqual(clauses(normalized(rules)), clauses(normalized(baseline)));
const graph = new Set();
async function visit(file) {
  if (graph.has(file)) return;
  graph.add(file); const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g)) if (match[1].startsWith('.')) await visit(posix.normalize(posix.join(posix.dirname(file), match[1])));
}
await visit('js/supervision-ui.js');
for (const file of graph) assert(!/persistencia|sync-|firestore-sync|firestore-watch|cuenta-ui|configuracion-guardada|app\.js/.test(file), file);
const entry = await readFile('supervision.html', 'utf8');
assert.deepEqual([...entry.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]), ['./js/supervision-ui.js']);
const oldNames = git(['ls-tree', '-r', '--name-only', pages22]).toString().trim().split(/\r?\n/); assert.equal(oldNames.length, 39);
const old = new Map(oldNames.map(file => [file, git(['show', pages22 + ':' + file])]));
const files = new Map(), sourceFingerprint = hash(JSON.stringify(await Promise.all(assets23.map(async file => [file, hash(await readFile(file))]))));
for (const file of assets23) {
  let bytes = await readFile(file);
  // Conservar bytes publicados en todos los recursos sin cambios de esta fase.
  if (old.has(file) && normalized(bytes) === normalized(git(['show', source22 + ':' + file]))) {
    assert.equal(normalized(old.get(file)), normalized(bytes), 'Pages22 y fuentes22 difieren: ' + file);
    bytes = old.get(file);
  }
  if (['index.html', 'supervision.html'].includes(file)) {
    const text = bytes.toString(); assert(text.includes('content="23.0-local"'));
    bytes = Buffer.from(text.replace('content="23.0-local"', 'content="23.0"'));
  }
  files.set(file, bytes);
}
const build = '23.0-' + sourceFingerprint.slice(0, 16);
files.set('version.json', Buffer.from(JSON.stringify({ version: '23.0', build, baseSourceCommit: source22, reviewedSourceFingerprint: sourceFingerprint }, null, 2) + '\n'));
assert.equal(files.size, 44);
const manifest = [], rollback = [];
for (const [file, bytes] of files) {
  assert(!/^(tools|tests|\.git|\.agents)\/|\.md$|\.rules$|^firebase/.test(file), file);
  await put(dir + 'candidato/public/' + file, bytes);
  manifest.push({ file, sha256: hash(bytes), status: !old.has(file) ? 'nuevo' : Buffer.compare(bytes, old.get(file)) === 0 ? 'identico-a-22.0' : 'modificado' });
}
for (const [file, bytes] of old) { await put(dir + 'reversion/pages22/' + file, bytes); rollback.push({ file, sha256: hash(bytes) }); }
await put(dir + 'candidato/reglas/firestore.rules', rules);
await put(dir + 'candidato/reglas/firebase.rules-only.json', JSON.stringify({ firestore: { rules: 'firestore.rules' } }, null, 2) + '\n');
await put(dir + 'reversion/reglas22-base.rules', baseline);
const proof = { preparedOnly: true, runtimeChanged: false, activeRemoteRulesChecked: false, source22, pages22, sourceFingerprint, build,
  originalWriteClausesUnchanged: 19, originalRuleHelpersAndScopesUnchanged: true, reviewedAssetsUnchanged: 43,
  supervisionImportGraph: [...graph].sort(), runtimeTransforms: ['Metadato 23.0-local→23.0 en los dos HTML', 'Conservar bytes de Pages22 para assets sin cambios', 'Añadir version.json de preparación sin inventar un commit de Fase23'],
  rules: { file: 'candidato/reglas/firestore.rules', sha256: hash(rules), baselineFile: 'reversion/reglas22-base.rules', baselineSha256: hash(baseline), baselineNormalizedSha256: hash(normalized(baseline)) },
  public: manifest, rollbackPages: rollback };
await put(dir + 'revision.json', JSON.stringify(proof, null, 2));
await put(dir + 'ARCHIVOS_PUBLICACION.txt', 'FIRESTORE (fuera de Pages):\ncandidato/reglas/firestore.rules\n\nPAGES (44 rutas exactas):\n' + manifest.map(item => item.file).join('\n') + '\n');
console.log('Revisión local: 19 cláusulas y auxiliares intactos; 43 assets de prueba conservados; grafo lector aislado; candidato de 44 archivos y reversión de 39 preparados.');
