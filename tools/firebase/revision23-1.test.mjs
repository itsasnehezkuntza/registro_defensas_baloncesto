// Comprobación adicional acotada: cliente exacto 22.0 bajo reglas candidatas 23.
// No ejecuta las baterías ya superadas. Únicamente emuladores y datos ficticios.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { chromium, officialSdk, testConfig, createGame, idle, snapshot } from './browser-support.mjs';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Solo emuladores.');
const source = '6bfe942d32de8b4fe6efef8cafd48f533acbd339';
const pages = '3aed91f329ed00b672b16ae6002a41e9acf68001';
const git = args => execFileSync('git', args);
const names = git(['ls-tree', '-r', '--name-only', pages]).toString().trim().split(/\r?\n/);
assert.equal(names.length, 39);
const bytes = new Map(names.map(file => [file, git(['show', `${pages}:${file}`])]));
const rules = await readFile('firestore.rules', 'utf8');
const env = await initializeTestEnvironment({ projectId: 'demo-defensas', firestore: { host: '127.0.0.1', port: 8085, rules } });
// Navegación HTTP real de loopback: Chromium debe reconocer la dirección de red
// local para permitir sus peticiones al emulador (no fulfill de la navegación).
const server = createServer((request, response) => {
  const file = new URL(request.url, 'http://127.0.0.1:4194').pathname.slice(1) || 'index.html';
  let body = bytes.get(file);
  if (file === 'js/firebase-config.js') body = Buffer.from('export const firebaseSettings=' + JSON.stringify(testConfig) + ';');
  if (file === 'js/sync-config.js') body = Buffer.from('export const syncSettings={enabled:true,emulator:true,allowRealWrites:false};');
  if (!body) { response.writeHead(file === 'favicon.ico' ? 204 : 404).end(); return; }
  if (file === 'index.html') body = Buffer.from(body.toString().replace(/(connect-src [^;]+)(;)/, '$1 http://127.0.0.1:8085 http://127.0.0.1:9099$2').replace(/(frame-src [^;]+)(;)/, '$1 http://127.0.0.1:9099$2'));
  response.writeHead(200, { 'Content-Type': ({ html: 'text/html', js: 'text/javascript', css: 'text/css', csv: 'text/csv', ttf: 'font/ttf' })[file.split('.').at(-1)] || 'text/plain', 'Cache-Control': 'no-store' }).end(body);
});
await new Promise(resolve => server.listen(4194, '127.0.0.1', resolve));
const browser = await chromium.launch(), errors = [], forbidden = [];
const context = await browser.newContext();
let result;
try {
  await officialSdk(context, true);
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === 'https://apis.google.com' && url.pathname === '/js/api.js') return route.abort();
    if (url.hostname === 'www.gstatic.com') return route.fallback();
    if (url.origin === 'http://127.0.0.1:8085' || url.origin === 'http://127.0.0.1:9099') return route.fallback();
    if (url.origin !== 'http://127.0.0.1:4194') { forbidden.push(url.origin); return route.abort(); }
    return route.fallback();
  });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4194');
  await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled);
  assert.equal(await page.locator('meta[name="app-version"]').getAttribute('content'), '22.0');
  await page.evaluate(async () => {
    const app = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
    const auth = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js');
    await auth.signInWithCredential(auth.getAuth(app.getApp('defensas-auth')), auth.GoogleAuthProvider.credential(JSON.stringify({ sub: 'revision23-1-propietario', email: 'propietario231@ficticio.test', email_verified: true, name: 'Propietario ficticio 23.1' })));
  });
  await page.locator('#teamSetupName').waitFor({ state: 'visible' });
  await page.locator('#teamSetupName').fill('Equipo ficticio revisión 23.1'); await page.locator('#teamSetupCreate').click(); await idle(page);
  const gameId = await createGame(page, 'Rival ficticio revisión 23.1');
  await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
  const synced = () => page.waitForFunction(() => document.querySelector('#storageNotice').textContent === 'Sincronizado');
  await synced();
  const remoteIds = () => page.evaluate(async () => {
    const storage = await import('./js/sync-storage.js');
    const scope = storage.storageContext();
    const backend = await (await import('./js/firestore-sync.js')).loadFirestoreTransport(scope.uid);
    const games = await backend.pull(scope.teamId);
    return games.filter(game => game.kind !== 'configuration').map(game => ({ id: game.payload.id, live: game.events.filter(e => !game.tombs.includes(e.id)).map(e => e.payload.id) }));
  });
  assert.equal((await remoteIds()).find(g => g.id === gameId).live.length, 1);
  await page.reload(); await idle(page); await synced(); assert.equal((await snapshot(page)).events.length, 1);
  await page.locator('#undoBtn').click(); await idle(page); await synced();
  assert.equal((await remoteIds()).find(g => g.id === gameId).live.length, 0);
  await page.reload(); await idle(page); await synced(); assert.equal((await snapshot(page)).events.length, 0);
  assert.deepEqual(errors, []); assert.deepEqual(forbidden, []);
  result = { ok: true, source, pages, appVersion: '22.0', rulesSha256: createHash('sha256').update(rules).digest('hex'),
    overrides: ['Configuración de Auth/Firestore al emulador', 'CSP loopback solo durante la prueba'],
    checked: ['Cliente publicado exacto 22.0', 'Login ficticio', 'Crear equipo', 'Crear partido', 'Registrar y confirmar tiro en servidor', 'Recargar y recuperar', 'Deshacer y confirmar lápida en servidor', 'Recargar sin resurrección'], errors, forbidden };
} finally { await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); await env.cleanup(); }
await mkdir('.test-artifacts/firebase/fase23-1', { recursive: true });
await writeFile('.test-artifacts/firebase/fase23-1/cliente22.json', JSON.stringify(result, null, 2));
console.log('Cliente exacto 22.0: equipo, partido, tiro, recarga y Deshacer correctos bajo reglas 23. Sin datos reales.');
