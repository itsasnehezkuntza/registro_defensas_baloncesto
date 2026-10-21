import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startServer } from './servidor.mjs';
import { chromium, idle, initialized, createGame, snapshot, configure, officialSdk, emulatorLogin, answerLocalData } from './browser-support.mjs';
if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Solo Auth Emulator local.');
const out = new URL('../../.test-artifacts/firebase/', import.meta.url);
await mkdir(out, { recursive: true });
const server = await startServer();
let browser;
const loginVisible = page => page.locator('#loginScreen').isVisible();
// Datos deportivos (sin el contador interno de ámbito, que cambia con cada identidad).
const sport = async page => { const s = await snapshot(page); return { games: s.games, currentGameId: s.currentGameId, events: s.events }; };
try {
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true });
  await configure(context); await officialSdk(context);
  const errors = [], firestore = [];
  await context.exposeBinding('__cspViolation15', (_, detail) => { errors.push('CSP ' + detail); console.error('CSP ' + detail); });
  await context.addInitScript(() => document.addEventListener('securitypolicyviolation', event => {
    void window.__cspViolation15(event.effectiveDirective + ' ' + event.blockedURI);
  }));
  context.on('request', req => {
    const url = new URL(req.url());
    if (['firestore.googleapis.com', 'identitytoolkit.googleapis.com', 'securetoken.googleapis.com'].includes(url.hostname)) firestore.push(req.url());
  });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  // Primera apertura: inicio de sesión. «Continuar sin cuenta» y un partido de este dispositivo.
  await page.goto('http://127.0.0.1:4198/'); await initialized(page);
  assert(await loginVisible(page), 'Sin sesión ni elección previa se muestra el inicio de sesión');
  await page.locator('#loginLocal').click();
  assert(!await loginVisible(page));
  assert(await page.locator('#profileAvatar svg').count(), 'Sin cuenta: icono de persona');
  const id = await createGame(page);
  await page.locator('.action-btn').first().click();
  await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page);
  const before = await sport(page); assert.equal(before.events.length, 1);
  await page.reload(); await idle(page);
  assert(!await loginVisible(page), '«Sin cuenta» no se vuelve a preguntar en cada inicio');

  // Iniciar sesión desde el perfil: la pregunta por los partidos locales aparece una vez.
  await emulatorLogin(page, 'a@ficticio.test');
  assert(!await loginVisible(page));
  assert(await answerLocalData(page, 'keep'), 'Debe preguntarse por los partidos sin cuenta');
  assert.equal(await page.locator('#profileAvatar').textContent(), 'EF', 'Iniciales sin foto');
  assert.deepEqual(await sport(page), before, 'login no modifica datos deportivos');
  assert.equal(await page.locator('#cloudStatus').textContent(), 'Solo local');
  await page.reload(); await idle(page);
  await page.waitForFunction(() => document.querySelector('#accountIdentity').textContent === 'a@ficticio.test');
  assert(!await loginVisible(page), 'Recarga con sesión: sin pantalla de inicio');
  assert(!await answerLocalData(page, 'keep', 1500), 'La pregunta no se repite');
  assert.deepEqual(await sport(page), before, 'restauración conserva datos');

  // Dos pestañas: cerrar sesión en una cierra la otra.
  const peer = await context.newPage(); await peer.goto('http://127.0.0.1:4198/'); await idle(peer);
  await peer.waitForFunction(() => document.querySelector('#accountIdentity').textContent === 'a@ficticio.test');
  await page.locator('#profileBtn').click();
  await page.locator('#googleLogout').click(); // Nada sin subir: cierre directo.
  await page.waitForFunction(() => document.documentElement.dataset.login);
  await peer.waitForFunction(() => document.querySelector('#accountIdentity').hidden && document.documentElement.dataset.login);
  assert.deepEqual(await sport(page), before, 'Los partidos sin cuenta no se borran al cerrar sesión');

  // Cambio de cuenta.
  const secondEmail = 'entrenador.muy.largo.para.verificar.el.ajuste@equipo-ficticio.test';
  await emulatorLogin(page, secondEmail);
  assert(await answerLocalData(page, 'keep'), 'Cada cuenta recibe su pregunta una vez');
  await peer.waitForFunction(email => document.querySelector('#accountIdentity').textContent === email, secondEmail);
  assert.deepEqual(await sport(page), before, 'cambio de cuenta no adopta ni sube partidos locales');
  for (const [width, height] of [[1180, 820], [1024, 768], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    if (await page.locator('#profileMenu').isHidden()) await page.locator('#profileBtn').click();
    const sizes = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth,
      menu: (r => ({ left: r.left, right: r.right }))(document.querySelector('#profileMenu').getBoundingClientRect()),
      buttons: [...document.querySelectorAll('#profileMenu button, #profileBtn')].filter(button => button.getClientRects().length).map(button => {
        const r = button.getBoundingClientRect(); return { id: button.id, width: r.width, height: r.height,
          clipped: button.scrollWidth > button.clientWidth + 1 };
      }) }));
    assert(!sizes.overflow, JSON.stringify(sizes)); assert(sizes.menu.left >= 0 && sizes.menu.right <= width, JSON.stringify(sizes.menu));
    assert(sizes.buttons.every(button => button.width >= 44 && button.height >= 44 && !button.clipped), JSON.stringify(sizes));
    await page.screenshot({ path: fileURLToPath(new URL(`auth-${width}-${height}.png`, out)) });
  }
  await page.setViewportSize({ width: 1024, height: 768 });

  // Partido creado con la cuenta sin subir: aviso al cerrar sesión, Cancelar conserva, Salir igualmente lo borra.
  await page.keyboard.press('Escape');
  const accountGame = await createGame(page, 'Solo con cuenta');
  await page.locator('#profileBtn').click(); await page.locator('#googleLogout').click();
  await page.locator('#logoutDialog').waitFor({ state: 'visible' });
  assert.match(await page.locator('#logoutMessage').textContent(), /solo en este dispositivo: 1/);
  assert(await page.locator('#logoutWaitBtn').isHidden(), 'Sin cola que esperar');
  await page.locator('#logoutCancelBtn').click();
  assert.equal(await page.locator('#accountIdentity').textContent(), secondEmail, 'Cancelar mantiene la sesión');
  assert((await snapshot(page)).games.some(game => game.id === accountGame));
  await page.locator('#profileBtn').click(); await page.locator('#googleLogout').click();
  await page.locator('#logoutForceBtn').click();
  await page.waitForFunction(() => document.documentElement.dataset.login);
  await page.locator('#loginLocal').click();
  const afterForce = await snapshot(page);
  assert.deepEqual(afterForce.games.map(game => game.id), [id], 'Solo se borra el partido de la cuenta');
  const stored = await page.evaluate(async () => (await import('./js/persistencia.js')).transact(['games'], 'readonly', (tx, done) => {
    const r = tx.objectStore('games').getAllKeys(); r.onsuccess = () => done(r.result); }));
  assert.deepEqual(stored, [id], 'El partido de la cuenta no queda en el dispositivo');

  // Bloqueo real de window.open, error del SDK oficial y vía local operativa.
  await page.locator('#profileBtn').click(); await page.locator('#googleLogin').click();
  await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled);
  await page.evaluate(() => { window.open = () => null; });
  await page.locator('#loginGoogle').click();
  await page.waitForFunction(() => document.querySelector('#loginMessage').textContent.includes('ventanas emergentes'));
  await page.locator('#loginLocal').click();
  await page.locator('#gameSelect').selectOption(id); await idle(page);
  await page.locator('#undoBtn').click(); await idle(page);
  assert.equal((await snapshot(page)).events.length, 0);
  assert.equal((await snapshot(page)).currentGameId, id);
  assert.equal(await page.locator('#saveStatusText').textContent(), 'Guardado localmente');
  assert.deepEqual(errors, []); assert.deepEqual(firestore, []);
  const report = { ok: true, sdk: '12.11.0 oficial modular', emulator: 'demo-defensas',
    loginScreen: true, localChoiceRemembered: true, login: true, askOnce: true, restore: true, logout: true, accountSwitch: true, crossTab: true,
    logoutWarningLocalOnly: true, purgeOnlyAccount: true, localDataUnchanged: true, popupBlocked: true, localUndoAfterAuthError: true, firestoreRequests: 0 };
  await writeFile(new URL('auth.json', out), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report)); await context.close();
} finally { await browser?.close(); await new Promise(ok => server.close(ok)); }
