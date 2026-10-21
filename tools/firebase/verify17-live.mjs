// Verificación HTTPS del candidato publicado. Perfiles efímeros, sin cuentas.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium, officialSdk, initialized, idle, createGame, snapshot } from './browser-support.mjs';
import { exerciseEditor19 } from './editor19.test.mjs';
const { webkit } = await import('@playwright/test');
const phase19 = process.argv.includes('--fase19');
const phase18 = phase19 || process.argv.includes('--fase18');
const dir = '.test-artifacts/firebase/fase' + (phase19 ? '19' : phase18 ? '18' : '17') + '/';
const deployment = JSON.parse(await readFile(dir + 'deployment.json', 'utf8'));
const manifest = JSON.parse(await readFile(dir + 'candidate/manifest.json', 'utf8'));
assert(deployment.buildId === (phase19 ? '19-79f88c07bb7931b7' : phase18 ? '18-eda58c0c0461ab73' : '17-ff347879fc8976cc') && manifest.buildId === deployment.buildId);
assert(/^https:\/\/registro-defensivo--ipad17-[a-z0-9-]+\.web\.app$/.test(deployment.url));
const reports = [], httpFiles = [], limitations = [];
const expected = manifest.files.filter(file => file.file !== '.nojekyll');
for (let i = 0; i < expected.length; i += 6) {
  const batch = await Promise.all(expected.slice(i, i + 6).map(async file => {
    const response = await fetch(deployment.url + '/' + file.file, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, file.file);
    assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), file.sha256, 'Hash HTTPS ' + file.file);
    assert(response.headers.get('cache-control')?.includes('no-store'));
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert(response.headers.get('x-robots-tag')?.includes('noindex'));
    return file.file;
  })); httpFiles.push(...batch);
}
for (const file of ['ESPECIFICACION.md', 'firestore.rules', 'tools/firebase/publish17-ipad.mjs', 'tests/sync-fixture.html', '.git/config']) {
  assert.equal((await fetch(deployment.url + '/' + file, { signal: AbortSignal.timeout(15000) })).status, 404, file);
}
reports.push('38 hashes HTTPS y cabeceras correctos; documentación, pruebas, herramientas, reglas y Git no publicados');
console.log(reports.at(-1));
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true, acceptDownloads: true });
    await officialSdk(context);
    const errors = [], violations = [], firestore = [];
    await context.route('https://firestore.googleapis.com/**', route => { firestore.push(route.request().method()); return route.abort(); });
    await context.exposeBinding('__csp17', (_, data) => violations.push(data));
    await context.addInitScript(() => document.addEventListener('securitypolicyviolation', event => void window.__csp17(event.effectiveDirective + ' ' + event.blockedURI)));
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    try { await page.goto(deployment.url); }
    catch (error) {
      if (name !== 'webkit' || !/SSL peer certificate/.test(error.message)) throw error;
      limitations.push('WebKit de escritorio no acepta la cadena TLS en este entorno; no se desactiva la validación. Sigue pendiente Safari/iPad físico.');
      await context.close(); continue;
    }
    await initialized(page);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.preview17), deployment.buildId);
    await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled, undefined, { timeout: 25000 });
    for (const [width, height] of [[820, 1180], [1180, 820], [390, 844]]) {
      await page.setViewportSize({ width, height });
      assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
      if (phase18) {
        assert.equal(await page.locator('.app-shell').evaluate(element => element.getClientRects().length), 0);
        await page.evaluate(() => window.scrollTo(0, 4000)); assert.equal(await page.evaluate(() => window.scrollY), 0);
      }
    }
    if (phase18) { await page.setViewportSize({ width: 820, height: 1180 }); await page.screenshot({ path: dir + 'login-' + name + '.png' }); }
    if (name === 'chromium') {
      const opening = page.waitForEvent('popup'); await page.locator('#loginGoogle').click(); const popup = await opening;
      await popup.waitForURL(url => url.hostname === 'accounts.google.com', { timeout: 30000 }); await popup.close();
      await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled, undefined, { timeout: 15000 });
      reports.push('Google llega a OAuth desde el dominio nuevo y se cancela; sin credenciales ni sesión completada');
    }
    await page.locator('#loginLocal').click(); await idle(page);
    const gid = await createGame(page, 'FICTICIO HTTPS17');
    if (phase19) {
      await exerciseEditor19(page);
      reports.push(name + ': escritura pausada, cursor y nombre guardado correctos sobre HTTPS publicado');
    }
    await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1); await page.reload(); await idle(page);
    assert.equal((await snapshot(page)).currentGameId, gid); assert.equal((await snapshot(page)).events.length, 1);
    assert.equal(await page.locator('#cloudStatus').textContent(), 'Solo local');
    await page.locator('#viewStatsBtn').click(); await page.waitForFunction(() => document.body.dataset.view === 'estadisticas');
    assert(await page.locator('.matrix-cell').count());
    assert.deepEqual(errors, []); assert.deepEqual(violations, []); assert.deepEqual(firestore, []);
    reports.push(name + ': HTTPS real, SDK listo, tres tamaños, tiro único, recarga y estadísticas correctos; sin CSP/errores/Firestore');
    console.log(reports.at(-1));
    await context.close();
  } finally { await browser.close(); }
}
// Consulta pública independiente de dominios, sin iniciar sesión ni Firestore.
const { firebaseSettings } = await import('../../js/firebase-config.js');
const url = new URL('https://identitytoolkit.googleapis.com/v1/projects');
url.searchParams.set('key', firebaseSettings.config.apiKey); url.searchParams.set('firebaseAppId', firebaseSettings.config.appId);
const publicResponse = await fetch(url, { signal: AbortSignal.timeout(15000) }); assert.equal(publicResponse.status, 200);
const publicConfig = await publicResponse.json(); assert.equal(publicConfig.projectId, '760744900094');
const expectedDomains = deployment.afterDomains ?? JSON.parse(await readFile('.test-artifacts/firebase/fase17/deployment.json', 'utf8')).afterDomains;
assert.deepEqual(publicConfig.authorizedDomains, expectedDomains);
const result = { ok: true, checkedAt: new Date().toISOString(), buildId: deployment.buildId, url: deployment.url, expireTime: deployment.expireTime,
  httpFilesVerified: httpFiles.length, reports, limitations, authorizedDomainsVerified: true, syncEnabled: false, realFirestoreWrites: 0,
  oauthCompleted: false, physicalTrial: 'pending' };
await writeFile(dir + 'https-verification.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
