import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('../../.test-artifacts/playwright/browsers', import.meta.url));
export const { chromium } = await import('@playwright/test');
export const idle = page => page.waitForFunction(() => !document.querySelector('#gameSelect').disabled);
// La aplicación puede terminar de cargar y mantener el registro bloqueado por sesión.
export const initialized = page => page.waitForFunction(() => document.querySelector('#saveStatusText')?.textContent === 'Guardado localmente');
export async function createGame(page, rival = 'Ficticio F8A') {
  await page.locator('#newGameBtn').click();
  await page.locator('#roundInput').fill('8A'); await page.locator('#rivalInput').fill(rival);
  await page.locator('#createGameBtn').click(); await idle(page);
  return page.locator('#gameSelect').inputValue();
}
export const snapshot = page => page.evaluate(async () => (await import('./js/persistencia.js')).readState());
export const testConfig = { enabled: true, config: { apiKey: 'demo-key', authDomain: 'demo-defensas.firebaseapp.com',
  projectId: 'demo-defensas', appId: 'demo-app' }, authEmulator: true };
export async function configure(context, config = testConfig) {
  await context.route('**/js/firebase-config.js', route => route.fulfill({ contentType: 'text/javascript',
    body: 'export const firebaseSettings = ' + JSON.stringify(config) + ';' }));
}
// Bytes oficiales sin modificar. Caché de pruebas para no depender de la red del navegador.
export async function officialSdk(context, firestore = false) {
  const dir = new URL('../../.test-artifacts/firebase/sdk/', import.meta.url);
  await mkdir(dir, { recursive: true });
  const modules = new Map();
  for (const name of ['firebase-app.js', 'firebase-auth.js', ...(firestore ? ['firebase-firestore.js'] : [])]) {
    let body;
    try { body = await readFile(new URL(name, dir)); }
    catch {
      const response = await fetch('https://www.gstatic.com/firebasejs/12.11.0/' + name);
      if (!response.ok) throw Error('SDK oficial: ' + response.status);
      body = Buffer.from(await response.arrayBuffer()); await writeFile(new URL(name, dir), body);
    }
    modules.set(name, body);
  }
  await context.route('https://www.gstatic.com/firebasejs/12.11.0/*', route => {
    const body = modules.get(new URL(route.request().url()).pathname.split('/').pop());
    return body ? route.fulfill({ contentType: 'text/javascript', body }) : route.abort();
  });
}
// Fase 10: abre la pantalla de inicio (desde el perfil si hace falta) e inicia sesión en el Auth Emulator.
export async function emulatorLogin(page, email, name = 'Entrenador ficticio') {
  if (!await page.locator('#loginScreen').isVisible()) {
    if (await page.locator('#profileMenu').isHidden()) await page.locator('#profileBtn').click();
    await page.locator('#googleLogin').click();
  }
  await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled, undefined, { timeout: 30000 });
  const opening = page.waitForEvent('popup'); await page.locator('#loginGoogle').click();
  const popup = await opening; await popup.waitForLoadState('domcontentloaded');
  await popup.waitForSelector('#email-input, button:has-text("Add new account")');
  const existing = popup.getByText(email, { exact: true });
  if (await existing.count()) await existing.first().click();
  else {
    const add = popup.getByRole('button', { name: 'Add new account' }); if (await add.isVisible()) await add.click();
    await popup.locator('#email-input').fill(email); await popup.locator('#display-name-input').fill(name);
    await popup.locator('#sign-in').click();
  }
  try {
    await page.waitForFunction(email => document.querySelector('#accountIdentity').textContent === email, email, { timeout: 30000 });
  } catch (error) {
    const state = await page.evaluate(() => ({ message: document.querySelector('#loginMessage').textContent,
      identity: document.querySelector('#accountIdentity').textContent, mode: localStorage.getItem('defensas-account-mode'),
      button: document.querySelector('#loginGoogleText').textContent, frames: [...document.querySelectorAll('iframe')].map(frame => new URL(frame.src).origin) }));
    throw Error(error.message + ' · Auth: ' + JSON.stringify(state));
  }
}
// Pregunta única por los partidos sin cuenta, si aparece.
export async function answerLocalData(page, choice = 'keep', timeout = 4000) {
  try { await page.locator('#localDataDialog').waitFor({ state: 'visible', timeout }); } catch { return false; }
  await page.locator(choice === 'upload' ? '#localDataUploadBtn' : '#localDataKeepBtn').click();
  return true;
}
