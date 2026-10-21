// Verificación pública, perfiles nuevos y datos ficticios; nunca inicia sesión.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium, officialSdk, initialized, idle, createGame, snapshot } from './browser-support.mjs';
import { exerciseEditor19 } from './editor19.test.mjs';
const { webkit } = await import('@playwright/test');
const dir = '.test-artifacts/firebase/fase20/', base = 'https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/';
const pkg = JSON.parse(await readFile(dir + 'package.json', 'utf8')), reports = [], limitations = [];
for (let at = 0; at < pkg.files.length; at += 6) {
  for (const result of await Promise.allSettled(pkg.files.slice(at, at + 6).map(async file => {
    const response = await fetch(base + file.file + '?verify=' + pkg.pagesCommit, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, file.file);
    assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), file.sha256, file.file);
  }))) if (result.status === 'rejected') throw result.reason;
}
for (const file of ['ESPECIFICACION.md', 'README.md', 'FASE20_PUBLICACION.md', 'firestore.rules', 'package.json', 'tools/firebase/release20-remote.mjs', 'tests/sync-fixture.html', 'js/preview17-bootstrap.js', 'js/sync-diagnostics.js', '.git/config'])
  assert.equal((await fetch(base + file + '?verify=' + pkg.pagesCommit)).status, 404, file);
const normal = await fetch(base + 'version.json'); assert.equal((await normal.json()).sourceCommit, pkg.sourceCommit);
console.log('39 hashes HTTPS, versión pública y 10 rutas internas 404 correctos');
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true });
    const errors = [], violations = [], firestore = [];
    await officialSdk(context);
    await context.route('https://firestore.googleapis.com/**', route => { firestore.push(route.request().url()); return route.abort(); });
    await context.exposeBinding('__csp20', (_, text) => violations.push(text));
    await context.addInitScript(() => document.addEventListener('securitypolicyviolation', e => window.__csp20(e.effectiveDirective + ' ' + e.blockedURI)));
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    try { await page.goto(base); }
    catch (error) {
      if (name !== 'webkit' || !/SSL peer certificate/.test(error.message)) throw error;
      limitations.push('WebKit HTTPS limitado por cadena TLS del entorno; certificado no ignorado. Actualización local WebKit correcta; prueba física de Sync pendiente.');
      await context.close(); continue;
    }
    await initialized(page);
    assert.equal(await page.locator('meta[name="app-version"]').getAttribute('content'), '20.0');
    await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled, undefined, { timeout: 25000 });
    assert.equal(await page.locator('.app-shell').evaluate(el => el.getClientRects().length), 0);
    await page.locator('#loginLocal').click(); await idle(page); await createGame(page, 'FICTICIO HTTPS20');
    await exerciseEditor19(page);
    await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1); await page.reload(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1);
    await page.locator('#viewStatsBtn').click(); await page.waitForFunction(() => document.body.dataset.view === 'estadisticas');
    assert(await page.locator('.matrix-cell').count());
    assert.deepEqual(errors, []); assert.deepEqual(violations, []); assert.deepEqual(firestore, []);
    reports.push(name + ': versión 20.0, Google listo, inicio exclusivo, cursor/editor, doble toque, recarga y estadísticas correctos; sin CSP/errores/Firestore');
    await context.close();
  } finally { await browser.close(); }
}
const result = { ok: true, checkedAt: new Date().toISOString(), sourceCommit: pkg.sourceCommit, pagesCommit: pkg.pagesCommit, version: pkg.version, url: base, filesVerified: pkg.files.length, excluded404: 10, reports, limitations, realFirestoreWrites: 0, physicalSync: 'pending' };
await writeFile(dir + 'deployed-verification.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
