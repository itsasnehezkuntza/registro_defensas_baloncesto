// Comprueba arranque y llegada a OAuth, sin credenciales ni creación de usuarios.
// No declara superados login/restauración/cierre de una sesión autenticada.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium } from './browser-support.mjs';
const server = await startServer(4199);
let browser;
const report = { type: 'real-auth-smoke', origin: 'http://localhost:4199', sdkMocked: false,
  oauthCompleted: false, sessionRestoreTested: false, authenticatedLogoutTested: false, firestoreRequests: 0 };
try {
  browser = await chromium.launch();
  const context = await browser.newContext();
  context.on('request', request => { if (new URL(request.url()).hostname === 'firestore.googleapis.com') report.firestoreRequests++; });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(report.origin + '/tools/firebase/validacion-real.html');
  await page.waitForFunction(() => !document.querySelector('#googleLogin').disabled || !document.querySelector('#accountRetry').hidden, { timeout: 20000 });
  report.sdkReady = await page.locator('#googleLogin').isEnabled();
  if (report.sdkReady) {
    await page.locator('#checkDomains').click();
    await page.waitForFunction(() => document.querySelector('#verification').textContent.includes('Dominios autorizados:') || document.querySelector('#verification').textContent.includes('no verificados:'));
    report.publicConfigVerifiedInBrowser = (await page.locator('#verification').textContent()).includes('Dominios autorizados:');
    const popupEvent = page.waitForEvent('popup', { timeout: 15000 }).catch(() => null);
    await page.locator('#googleLogin').click();
    const popup = await popupEvent;
    report.popupOpened = Boolean(popup);
    if (popup) {
      await Promise.race([
        popup.waitForURL(url => url.hostname === 'accounts.google.com', { timeout: 20000 }).catch(() => {}),
        page.waitForFunction(() => !document.querySelector('#continueLocal').hidden, { timeout: 20000 }).catch(() => {})
      ]);
      report.popupHost = popup.isClosed() ? 'closed' : new URL(popup.url()).hostname;
      report.googleOAuthReached = report.popupHost === 'accounts.google.com';
      if (!popup.isClosed()) await popup.close();
      await page.waitForFunction(() => !document.querySelector('#googleLogin').disabled, { timeout: 15000 });
      report.cancelMessage = await page.locator('#accountMessage').textContent();
    }
  } else report.accountError = await page.locator('#accountMessage').textContent();
  report.sportsDatabaseOpened = (await page.evaluate(() => indexedDB.databases())).some(db => db.name === 'registro_defensivo_baloncesto');
  assert.equal(report.sportsDatabaseOpened, false);
  assert.equal(report.firestoreRequests, 0);
  report.pageErrors = errors;
  await context.close();
} catch (error) { report.environmentError = error.message; }
finally {
  await browser?.close(); await new Promise(ok => server.close(ok));
  const out = new URL('../../.test-artifacts/firebase/', import.meta.url);
  await mkdir(out, { recursive: true });
  await writeFile(new URL('real-smoke.json', out), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
