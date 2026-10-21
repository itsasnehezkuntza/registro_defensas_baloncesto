// Solo configuración pública de Auth y llegada a Google; sin credenciales,
// usuarios nuevos, sesiones reales ni solicitudes Firestore.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, officialSdk, initialized } from './browser-support.mjs';
const server = await startServer(4195), browser = await chromium.launch();
const report = { ok: false, oauthCompleted: false, firestoreRequests: 0, realWrites: 0, violations: [], pageErrors: [] };
try {
  const context = await browser.newContext();
  await officialSdk(context); // bytes oficiales 12.11.0, sin modificar; caché local de pruebas
  await context.route('https://firestore.googleapis.com/**', route => { report.firestoreRequests++; return route.abort(); });
  await context.exposeBinding('__csp15', (_, data) => report.violations.push(data));
  await context.addInitScript(() => document.addEventListener('securitypolicyviolation', event => {
    void window.__csp15({ directive: event.effectiveDirective, blocked: event.blockedURI });
  }));
  const page = await context.newPage(); page.on('pageerror', error => report.pageErrors.push(error.message));
  await page.goto('http://localhost:4195/'); await initialized(page);
  assert(!/127\.0\.0\.1|localhost/.test(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')));
  await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled, undefined, { timeout: 25000 });
  const opening = page.waitForEvent('popup'); await page.locator('#loginGoogle').click(); const popup = await opening;
  await popup.waitForURL(url => url.hostname === 'accounts.google.com', { timeout: 30000 });
  report.googleOAuthReached = true;
  await popup.close();
  await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled, undefined, { timeout: 15000 });
  report.cancelMessage = await page.locator('#loginMessage').textContent();
  assert.equal(await page.locator('#accountIdentity').textContent(), '');
  assert.equal(report.firestoreRequests, 0); assert.deepEqual(report.violations, []); assert.deepEqual(report.pageErrors, []);
  report.ok = true; await context.close();
} catch (error) { report.error = error.message; process.exitCode = 1; }
finally {
  await browser.close(); await new Promise(ok => server.close(ok));
  await mkdir('.test-artifacts/firebase', { recursive: true });
  await writeFile('.test-artifacts/firebase/csp15-auth-smoke.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
