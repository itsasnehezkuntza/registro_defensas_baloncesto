// Paquete aislado y commits locales. No publica ni cambia el workspace develop.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, dirname, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { assets17 } from './prepare17-ipad.mjs';
const dir = '.test-artifacts/firebase/fase20/', repo = resolve('.test-artifacts/publicacion20-repo');
await mkdir(dir, { recursive: true });
const git = (args, options = {}) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', ...options }).trim();
const previous = execFileSync('git', ['rev-parse', 'origin/main', 'origin/gh-pages'], { encoding: 'utf8' }).trim().split('\n');
assert.deepEqual(previous, ['d98bee549303a179e642d60e4a7986e1ef1b267d', '2c49c4b8dce67de82e8d76682f760d88ce6c0d30']);
await writeFile(dir + 'previous.json', JSON.stringify({ main: previous[0], pages: previous[1] }, null, 2));
if (git(['branch', '--show-current']) !== 'publicacion/fase20') git(['switch', '-c', 'publicacion/fase20', previous[0]]);
assert.equal(git(['rev-parse', 'HEAD']), previous[0]);
git(['config', 'core.autocrlf', 'false']);
git(['remote', 'set-url', 'origin', 'https://github.com/itsasnehezkuntza/registro_defensas_baloncesto.git']);
const extras = execFileSync('rg', ['--files', 'tests', 'tools'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(file => !/\.(png|jpg|zip|log)$/i.test(file));
const docs = execFileSync('rg', ['--files', '-g', 'FASE*.md'], { encoding: 'utf8' }).trim().split(/\r?\n/);
const sources = [...new Set([...assets17, '.gitignore', 'firestore.rules', 'README.md', 'ESPECIFICACION.md', 'MEJORAS_OPCIONALES.md', 'package.json', 'package-lock.json', ...extras, ...docs])];
const known = new Set(assets17), files = [];
for (const file of sources) {
  const bytes = await readFile(file);
  if (!file.endsWith('.ttf')) assert(!/-----BEGIN [^-]*PRIVATE KEY-----|"type"\s*:\s*"service_account"|"private_key"\s*:|"refresh_token"\s*:/.test(bytes.toString()), 'Credencial privada en ' + file);
  await mkdir(dirname(resolve(repo, file)), { recursive: true }); await writeFile(resolve(repo, file), bytes);
  if (!known.has(file)) continue;
  assert(!/diagnostic|preview|^tools\/|^tests\//.test(file), file);
  if (file.endsWith('.js')) {
    assert.equal(spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' }).status, 0, file);
    for (const match of bytes.toString().matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g))
      if (match[1].startsWith('.')) assert(known.has(posix.normalize(posix.join(posix.dirname(file), match[1]))), file + ' → ' + match[1]);
  }
  files.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
}
git(['add', '--', ...sources]); git(['commit', '-m', 'release: publica las mejoras verificadas hasta Fase 19 (20.0)']);
const sourceCommit = git(['rev-parse', 'HEAD']);
const metadata = Buffer.from(JSON.stringify({ version: '20.0', sourceCommit, previousCommit: previous[0], builtAt: new Date().toISOString() }, null, 2) + '\n');
await mkdir(dir + 'pages', { recursive: true });
for (const { file } of files) { await mkdir(dirname(dir + 'pages/' + file), { recursive: true }); await writeFile(dir + 'pages/' + file, await readFile(file)); }
await writeFile(dir + 'pages/version.json', metadata);
files.push({ file: 'version.json', sha256: createHash('sha256').update(metadata).digest('hex') });
assert.equal(files.length, 39);
const env = { ...process.env, GIT_INDEX_FILE: resolve(dir + 'pages.index') };
git(['read-tree', '--empty'], { env });
for (const { file } of files) {
  const oid = git(['hash-object', '-w', '--stdin'], { input: await readFile(dir + 'pages/' + file) });
  git(['update-index', '--add', '--cacheinfo', '100644,' + oid + ',' + file], { env });
}
const tree = git(['write-tree'], { env });
const pagesCommit = git(['commit-tree', tree, '-p', previous[1]], { input: 'deploy: publica 20.0 en Pages\n' });
git(['update-ref', 'refs/heads/publicacion/pages20', pagesCommit, '0000000000000000000000000000000000000000']);
await writeFile(dir + 'package.json', JSON.stringify({ version: '20.0', sourceCommit, pagesCommit, previous, files, sourceFiles: sources.length }, null, 2));
console.log(JSON.stringify({ sourceCommit, pagesCommit, files: files.length, sourceFiles: sources.length, published: false }));
