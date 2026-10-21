// Solo HTTP GET de recursos públicos; no abre la aplicación ni accede a Firestore.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../../', import.meta.url), dir = new URL('.test-artifacts/firebase/fase8b4/', root);
const manifest = JSON.parse(await readFile(new URL('.test-artifacts/firebase/ipad-preview/manifest.json', root), 'utf8'));
const deployed = JSON.parse(await readFile(new URL('.test-artifacts/firebase/fase8b3/deployment.json', root), 'utf8'));
if (deployed.version !== 'f0a4971d2c312bef' || manifest.files.length !== 36) throw Error('Baseline distinto: conservar y revisar.');
await mkdir(dir, { recursive: true });
const files = [];
for (const f of manifest.files) {
  const response = await fetch(deployed.url + '/' + f.file, { cache: 'no-store' });
  if (!response.ok) throw Error('Recurso no disponible: ' + f.file);
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== f.sha256) throw Error('STOP: recurso desplegado distinto de la evidencia: ' + f.file);
  let sourceMatches = null;
  if (!['index.html', 'preview-bootstrap.js', 'js/sync-config.js', 'js/firestore-sync.js'].includes(f.file)) {
    sourceMatches = createHash('sha256').update(await readFile(new URL(f.file, root))).digest('hex') === hash;
  }
  const target = new URL('deployed/' + f.file, dir); await mkdir(new URL('./', target), { recursive: true });
  await writeFile(target, bytes, { flag: 'wx' }).catch(error => { if (error.code !== 'EEXIST') throw error; });
  files.push({ file: f.file, sha256: hash, matchesPublishedEvidence: true, sourceMatches, cacheControl: response.headers.get('cache-control'), etag: response.headers.get('etag') });
}
await writeFile(new URL('deployed-manifest.json', dir), JSON.stringify({ at: new Date().toISOString(), hostingVersion: deployed.version, url: deployed.url, files }, null, 2));
console.log(JSON.stringify({ hostingVersion: deployed.version, files: files.length, matched: true, sourceDifferences: files.filter(f => f.sourceMatches === false).map(f => f.file), noStore: files.every(f => f.cacheControl?.includes('no-store')) }));
