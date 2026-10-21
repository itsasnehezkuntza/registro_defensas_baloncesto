// Comprueba las guardas de la página; NO es una prueba de autenticación real.
import assert from 'node:assert/strict';
import { startServer } from './servidor.mjs';
import { chromium, configure, testConfig } from './browser-support.mjs';
const server = await startServer(4199);
let browser;
try {
  browser = await chromium.launch();
  for (const config of [{ enabled: false, config: {}, authEmulator: false }, testConfig]) {
    const context = await browser.newContext();
    await configure(context, config);
    const requests = [], errors = [];
    context.on('request', request => requests.push(request.url()));
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4199/tools/firebase/validacion-real.html');
    await page.waitForFunction(() => document.querySelector('#configurationState').textContent.includes('bloqueada'));
    assert(await page.locator('#googleLogin').isDisabled());
    assert(await page.locator('#verifySession').isDisabled());
    assert(await page.locator('#checkDomains').isDisabled());
    assert.deepEqual(await page.evaluate(() => indexedDB.databases()), []);
    assert(!requests.some(url => /firebase-auth\.js|gstatic\.com|app\.js|persistencia\.js|firestore/.test(url)));
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('Página real: configuración ausente y emulador bloqueados; sin SDK, Firestore ni bases IndexedDB. No se ha probado Google real.');
} finally { await browser?.close(); await new Promise(ok => server.close(ok)); }
