// Prepara una copia HTTPS aislada. No usa credenciales, red o Firebase CLI.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname, relative, sep } from 'node:path';
export const plan17 = { projectId: 'registro-defensivo', siteId: 'registro-defensivo', channelId: 'ipad17', expires: '24h',
  googleAvailable: true, syncEnabled: false, allowRealWrites: false, existingDataAllowed: false };
export const assets17 = ['index.html', 'app.js', 'styles.css', 'registro.css', 'dashboard.css', 'editor.css', 'cuenta.css', 'categorias.csv', '.nojekyll',
  ...['inicio', 'configuracion', 'exportacion', 'identidad', 'interfaz', 'persistencia', 'registro', 'estadisticas', 'dashboard', 'vistas',
    'cuenta', 'cuenta-ui', 'firebase-auth', 'firebase-config', 'sync-config', 'sync-storage', 'sync-engine', 'sync-ui', 'firestore-sync',
    'firestore-watch', 'panel-model', 'registro-vista', 'distribucion', 'configuracion-guardada', 'editor'].map(name => 'js/' + name + '.js'),
  ...['BarlowCondensed-Bold.ttf', 'Manrope.ttf', 'BarlowCondensed-OFL.txt', 'Manrope-OFL.txt'].map(name => 'fonts/' + name)];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export async function prepare17({ outputRoot = '.test-artifacts/firebase/fase17/candidate', buildPrefix = '17', compatibleBuildIds = [] } = {}) {
  const root = process.cwd(), output = resolve(outputRoot), publicDir = resolve(output, 'public');
  assert(output.startsWith(resolve('.test-artifacts/firebase') + sep));
  assert(['17', '18', '19'].includes(buildPrefix) && compatibleBuildIds.every(id => /^(17|18)-[a-f0-9]{16}$/.test(id)));
  const sources = new Map(await Promise.all(assets17.map(async name => [name, await readFile(name)])));
  const buildId = buildPrefix + '-' + hash(JSON.stringify({ plan17, compatibleBuildIds }) + [...sources].map(([name, bytes]) => name + hash(bytes)).join('\n')).slice(0, 16);
  const files = new Map(sources);
  files.set('js/sync-config.js', Buffer.from('export const syncSettings = Object.freeze({ enabled: false, emulator: false, allowRealWrites: false });\n'));
  files.set('js/firestore-sync.js', Buffer.from(`// Esta copia de prueba no puede crear un transporte Firestore.
const blocked = () => { throw Error('La sincronización está desactivada en esta prueba.'); };
export const createFirestoreTransport = blocked;
export const loadFirestoreTransport = blocked;
`));
  files.set('js/preview17-bootstrap.js', Buffer.from(`// Guardar el origen nuevo antes de cargar módulos de aplicación o Google.
const buildId = ${JSON.stringify(buildId)}, compatibleBuildIds = ${JSON.stringify(compatibleBuildIds)}, markerKey = 'defensas-preview17';
const stop = message => { document.body.textContent = message; throw Error(message); };
if (location.protocol !== 'https:' || !/^registro-defensivo--ipad17-[a-z0-9-]+[.]web[.]app$/.test(location.hostname)) stop('Esta copia solo funciona en la vista previa HTTPS de iPad 17.');
let marker;
try { marker = localStorage.getItem(markerKey); } catch { stop('No se puede comprobar el almacenamiento. Conserva los datos y avisa.'); }
if (marker && marker !== buildId && !compatibleBuildIds.includes(marker)) stop('Este origen pertenece a otra copia de prueba. Conserva los datos y avisa.');
if (!marker) {
  if (typeof indexedDB.databases !== 'function') stop('Safari no permite comprobar si hay datos previos. Conserva los datos y avisa.');
  if ((await indexedDB.databases()).length) stop('Hay datos previos en este origen. No se han abierto ni borrado; avisa.');
  try { localStorage.setItem(markerKey, buildId); } catch { stop('No se puede guardar la identificación de la prueba. Avisa.'); }
}
document.title = 'PRUEBA iPad 17 · Registro defensivo';
document.documentElement.dataset.preview17 = buildId;
const note = document.querySelector('.login-note');
if (note) note.textContent = 'Prueba iPad · Los partidos de esta copia se guardan solo en este navegador.';
await Promise.all([import('../app.js'), import('./cuenta-ui.js')]);
`));
  let html = sources.get('index.html').toString('utf8');
  for (const name of ['app.js', 'js/cuenta-ui.js']) {
    const tag = '<script type="module" src="./' + name + '"></script>';
    assert(html.includes(tag), 'HTML de arranque no reconocido.'); html = html.replace(tag, '');
  }
  html = html.replace('</head>', '  <script type="module" src="./js/preview17-bootstrap.js"></script>\n</head>');
  files.set('index.html', Buffer.from(html));
  // No sobrescribir archivos ajenos ni seguir enlaces en la salida.
  let current = root;
  for (const part of relative(root, publicDir).split(sep)) {
    current = resolve(current, part);
    const stat = await lstat(current).catch(error => { if (error.code !== 'ENOENT') throw error; });
    assert(!stat?.isSymbolicLink(), 'Enlace inesperado en salida.');
  }
  async function inspect(dir) {
    const entries = await readdir(dir, { withFileTypes: true }).catch(error => { if (error.code !== 'ENOENT') throw error; return []; });
    for (const entry of entries) {
      assert(!entry.isSymbolicLink(), 'Enlace inesperado en candidato.');
      const path = resolve(dir, entry.name), name = relative(publicDir, path).split(sep).join('/');
      if (entry.isDirectory()) { assert([...files.keys()].some(file => file.startsWith(name + '/'))); await inspect(path); }
      else assert(files.has(name), 'Archivo ajeno al candidato: ' + name);
    }
  }
  await inspect(publicDir);
  for (const [name, bytes] of files) { const target = resolve(publicDir, name); await mkdir(dirname(target), { recursive: true }); await writeFile(target, bytes); }
  const manifest = { preparedAt: new Date().toISOString(), buildId, plan: plan17, compatibleBuildIds,
    files: [...files].map(([file, bytes]) => ({ file, bytes: bytes.length, sha256: hash(bytes), sourceSha256: sources.has(file) ? hash(sources.get(file)) : null })) };
  await writeFile(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await writeFile(resolve(output, 'firebase.preview.json'), JSON.stringify({ hosting: { site: plan17.siteId, public: 'public', ignore: ['**/.*', '**/node_modules/**'],
    headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-store' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'X-Content-Type-Options', value: 'nosniff' }] }] } }, null, 2));
  return { output, publicDir, manifest };
}
if (process.argv[1]?.endsWith('prepare17-ipad.mjs')) {
  const result = await prepare17(); console.log(JSON.stringify({ buildId: result.manifest.buildId, files: result.manifest.files.length, output: result.output, deployed: false, plan: plan17 }, null, 2));
}
