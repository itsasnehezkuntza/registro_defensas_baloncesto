// Inventario del candidato aprobado; solo archivos locales, sin servicios Firebase.
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir = '.test-artifacts/firebase/fase8b4/diagnostic-candidate/';
const manifest = JSON.parse(await readFile(dir + 'manifest.json', 'utf8'));
const baseline = JSON.parse(await readFile('.test-artifacts/firebase/fase8b4/deployed-manifest.json', 'utf8'));
async function inventory(path, prefix = '') {
  const result = [];
  for (const e of await readdir(path, { withFileTypes: true })) {
    assert(!e.isSymbolicLink(), 'No se permiten enlaces simbólicos.');
    if (e.isDirectory()) result.push(...await inventory(path + '/' + e.name, prefix + e.name + '/'));
    else result.push(prefix + e.name);
  }
  return result.sort();
}
assert.equal(manifest.buildId, '8b4-256eb8ba4e2907e6');
assert.equal(manifest.files.length, 38);
assert.deepEqual(await inventory(dir + 'public'), manifest.files.map(f => f.file).sort());
const review = {
  'preview-bootstrap.js': 'Preflight de origen/base v2/activación y cola vacía, controles deportivos bloqueados, diagnóstico y descarga explícita. Restaura Auth; impide cambiar de cuenta durante la observación.',
  'app.js': 'Trazas de lectura, rechazo, aplicación y render. Sin corrección candidata de arranque.',
  'js/firestore-sync.js': 'Trazas SDK; send/createTeam rechazados antes de escribir; mismo ámbito ficticio.',
  'js/sync-engine.js': 'Solo observación remota; cola no enviada ni reintentada, sin merge ni arrendamientos.',
  'js/sync-storage.js': 'Trazas y caché de equipos sin escritura en esta copia.',
  'js/sync-ui.js': 'Trazas de identidad, reset y motor; sin cambios deportivos.',
  'js/sync-diagnostics.js': 'Nuevo: observación acotada en memoria sin PII ni red.',
  'js/sync-diagnostics-ui.js': 'Nuevo: conteos readonly y descarga explícita, sin transmisión.'
};
const files = [];
for (const f of manifest.files) {
  const bytes = await readFile(dir + 'public/' + f.file);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), f.sha256);
  assert(!/(^\.|(^|\/)(tools|tests|node_modules)\/|\.(md|json|rules|env|map)$)/i.test(f.file));
  if (!f.file.endsWith('.ttf')) assert(!/-----BEGIN [^-]*PRIVATE KEY-----|"type"\s*:\s*"service_account"|"private_key"\s*:|"refresh_token"\s*:/i.test(bytes.toString('utf8')), 'Credencial privada: ' + f.file);
  const previous = baseline.files.find(b => b.file === f.file);
  const changed = previous?.sha256 !== f.sha256;
  assert.equal(changed, Boolean(review[f.file]), 'Cambio no revisado: ' + f.file);
  files.push({ ...f, changed, review: review[f.file] || 'Idéntico byte a byte a la versión 8B.3.' });
}
const boot = await readFile(dir + 'public/preview-bootstrap.js', 'utf8');
for (const id of ['newGameBtn','createGameBtn','undoBtn','deleteGameBtn','confirmDeleteBtn','syncCreateTeam','syncImport','syncConfirm','syncRetry']) assert(boot.includes('#' + id));
const rootFlags = await readFile('js/sync-config.js', 'utf8');
assert(/enabled:\s*false/.test(rootFlags) && /allowRealWrites:\s*false/.test(rootFlags));
const cfg = JSON.parse(await readFile('firebase.diagnostic.preview.json', 'utf8'));
assert.deepEqual(Object.keys(cfg), ['hosting']);
assert.equal(cfg.hosting.site, 'registro-defensivo');
assert.equal(cfg.hosting.public, dir + 'public');
assert(!cfg.hosting.predeploy && !cfg.hosting.postdeploy && !cfg.hosting.rewrites);
const report = { checkedAt: new Date().toISOString(), buildId: manifest.buildId, total: files.length,
  changed: files.filter(f => f.changed).length, unchanged: files.filter(f => !f.changed).length,
  privateCredentialsFound: false, internalDocsOrTests: false, rootSyncOff: true, files };
await writeFile('.test-artifacts/firebase/fase8b5/audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ buildId: report.buildId, total: report.total, changed: report.changed, unchanged: report.unchanged, privateCredentialsFound: false, internalDocsOrTests: false, rootSyncOff: true }));
