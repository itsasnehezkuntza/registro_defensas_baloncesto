import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { configure, officialSdk, idle, initialized, createGame, snapshot, emulatorLogin, answerLocalData } from './browser-support.mjs';

// Fase 10: interfaz completa con Auth y Firestore Emulator, dos «dispositivos» (contextos) con la misma cuenta.
export async function verifySyncUI(browser) {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Solo emuladores locales.');
  const contexts = [], errors = [], forbidden = [];
  async function device(name) {
    const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, acceptDownloads: true }); contexts.push(context);
    await context.exposeBinding('__cspViolation15', (_, detail) => errors.push(name + ': CSP ' + detail));
    await context.addInitScript(() => document.addEventListener('securitypolicyviolation', event => {
      void window.__cspViolation15(event.effectiveDirective + ' ' + event.blockedURI);
    }));
    await configure(context); await officialSdk(context, true);
    await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript',
      body: 'export const syncSettings={enabled:true,emulator:true,allowRealWrites:false};' }));
    context.on('request', request => { if (['firestore.googleapis.com', 'identitytoolkit.googleapis.com', 'securetoken.googleapis.com'].includes(new URL(request.url()).hostname)) forbidden.push(request.url()); });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(name + ': ' + error.message));
    await page.goto('http://127.0.0.1:4198/'); await initialized(page);
    return { page, context };
  }
  const profile = async page => { if (await page.locator('#profileMenu').isHidden()) await page.locator('#profileBtn').click(); };
  const closeProfile = async page => { if (await page.locator('#profileMenu').isVisible()) await page.keyboard.press('Escape'); };
  const synced = (page, timeout = 30000) => page.waitForFunction(() => document.querySelector('#cloudStatus').textContent === 'Sincronizado', undefined, { timeout });
  const eventsIn = (page, count, timeout = 30000) => page.waitForFunction(async n => (await (await import('./js/persistencia.js')).readState()).events.length === n, count, { timeout });
  const cloudRows = page => page.evaluate(async () => (await import('./js/persistencia.js')).transact(['cloudGames', 'cloudEvents', 'syncQueue'], 'readonly', (tx, done) => {
    let total = 0, n = 0; for (const name of ['cloudGames', 'cloudEvents', 'syncQueue']) { const r = tx.objectStore(name).count(); r.onsuccess = () => { total += r.result; if (++n === 3) done(total); }; }
  }));
  try {
    // A: partido sin cuenta y después inicio de sesión: «Subir a mi cuenta» desde la pregunta única.
    const { page: a, context: ac } = await device('A');
    assert(await a.locator('#loginScreen').isVisible());
    await a.locator('#loginLocal').click();
    await createGame(a, 'Antiguo ficticio UI');
    await a.locator('.action-btn').first().click(); await a.locator('[data-points="2"][data-result="fallado"]').click(); await idle(a);
    await emulatorLogin(a, 'sync-ui@ficticio.test', 'Propietario ficticio');
    assert(await answerLocalData(a, 'upload'), 'Pregunta por los partidos locales al iniciar sesión');
    // Sin equipo todavía: se abre el perfil para crearlo y después la revisión con los partidos marcados.
    await a.locator('#profileMenu').waitFor({ state: 'visible' });
    await a.waitForFunction(() => !document.querySelector('#syncCreateTeam').disabled);
    assert.match(await a.locator('#syncDetail').textContent(), /equipo para subir/);
    a.once('dialog', dialog => dialog.accept('Equipo ficticio UI'));
    await a.locator('#syncCreateTeam').click();
    await a.locator('.sync-dialog').waitFor({ state: 'visible' });
    assert.equal(await a.locator('#syncReviewList input:checked').count(), 1, 'Tras «Subir a mi cuenta» los partidos llegan marcados');
    assert.match(await a.locator('#syncDestination').textContent(), /sync-ui@ficticio.test.*Equipo ficticio UI/);
    for (const width of [1024, 390, 320]) {
      await a.setViewportSize({ width, height: 844 });
      assert(!await a.evaluate(() => document.documentElement.scrollWidth > innerWidth));
      await a.screenshot({ path: fileURLToPath(new URL(`../../.test-artifacts/firebase/sync-review-${width}.png`, import.meta.url)) });
    }
    await a.setViewportSize({ width: 1024, height: 768 });
    await a.locator('#syncConfirm').click();
    await a.waitForFunction(() => document.querySelector('#gameSelect').options.length === 2);
    const gid = await a.locator('#gameSelect option').last().getAttribute('value');
    await closeProfile(a);
    await a.locator('#gameSelect').selectOption(gid); await idle(a);
    await synced(a); assert.equal((await snapshot(a)).events.length, 1);
    assert.equal(await a.locator('#profileAvatar').textContent(), 'PF');
    assert(await a.locator('#profileDot').isHidden(), 'Sin problemas no hay aviso');

    // Recarga con sesión: sin pantalla de inicio, mismo equipo y partido.
    await a.reload(); await idle(a);
    await a.waitForFunction(() => document.querySelector('#accountIdentity').textContent === 'sync-ui@ficticio.test');
    assert(await a.locator('#loginScreen').isHidden()); await synced(a);
    assert.equal((await snapshot(a)).events.length, 1);

    // B: otro «dispositivo» con la misma cuenta recupera el partido.
    const { page: b, context: bc } = await device('B');
    await emulatorLogin(b, 'sync-ui@ficticio.test');
    assert(!await answerLocalData(b, 'keep', 1500), 'Sin partidos locales no se pregunta');
    const team = await a.evaluate(() => document.querySelector('#syncTeam').value);
    await profile(b); await b.locator('#syncEnable').click();
    await b.waitForFunction(id => !!document.querySelector(`#syncTeam option[value="${id}"]`), team, { timeout: 30000 });
    await b.locator('#syncTeam').selectOption(team); await idle(b); await closeProfile(b);
    await b.waitForFunction(id => !!document.querySelector(`#gameSelect option[value="${id}"]`), gid, { timeout: 30000 });
    await b.locator('#gameSelect').selectOption(gid); await idle(b); await eventsIn(b, 1);
    await b.locator('.action-btn').first().click(); await b.locator('[data-points="2"][data-result="anotado"]').click(); await idle(b);
    await eventsIn(a, 2);
    const downloading = a.waitForEvent('download'); await a.locator('#moreBtn').click(); await a.locator('#exportCsvBtn').click();
    const csv = await readFile(await (await downloading).path()); assert.equal(csv.subarray(0, 3).toString('hex'), 'efbbbf');

    // Vaciar partido en B: A recibe el vaciado sin recargar; el partido se conserva.
    await b.locator('#moreBtn').click(); await b.locator('#clearGameBtn').click();
    assert.match(await b.locator('#clearGameMessage').textContent(), /2 tiros.*otros dispositivos/);
    await b.locator('#confirmClearBtn').click(); await idle(b);
    await eventsIn(a, 0); await eventsIn(b, 0);
    await a.waitForFunction(() => document.querySelector('#undoBtn').disabled && document.querySelector('#scoreboardValue').textContent === '—');
    assert((await snapshot(a)).games.some(game => game.id === gid));
    await synced(b);

    // M6: edición real y recepción del panel, sin recargar el otro dispositivo.
    await a.locator('#moreBtn').click(); await a.locator('#editButtonsBtn').click();
    await a.waitForSelector('#editorView:not([hidden]) .edit-tile');
    await a.locator('[data-edit="transicion:items:0"]').click();
    await a.locator('#editNameInput').fill('Panel compartido UI');
    await a.locator('[data-act="close"]').click();
    await a.locator('[data-act="done"]').click();
    await a.waitForFunction(() => document.body.dataset.view === 'registro');
    await b.waitForFunction(() => [...document.querySelectorAll('.action-name')].some(node => node.textContent === 'Panel compartido UI'));
    await synced(a); await synced(b);

    // A sin conexión: el tiro queda pendiente, punto discreto en el avatar y detalle en el perfil.
    await synced(a);
    await ac.setOffline(true);
    await a.evaluate(() => dispatchEvent(new Event('offline')));
    await a.locator('.action-btn').first().click(); await a.locator('[data-points="2"][data-result="anotado"]').dblclick(); await idle(a);
    assert.equal((await snapshot(a)).events.length, 1);
    await a.waitForFunction(() => !document.querySelector('#profileDot').hidden, undefined, { timeout: 15000 });
    await profile(a);
    assert.match(await a.locator('#profileSyncWarning').textContent(), /no hay conexión/);
    assert.match(await a.locator('#profileBtn').getAttribute('aria-label'), /cambios sin subir/);
    // Cerrar sesión con cambios pendientes: «Esperar» sube y cierra al terminar.
    await a.locator('#googleLogout').click();
    await a.locator('#logoutDialog').waitFor({ state: 'visible' });
    assert.match(await a.locator('#logoutMessage').textContent(), /Cambios sin subir a tu cuenta: 1/);
    await a.locator('#logoutWaitBtn').click();
    await a.waitForFunction(() => /quedan 1/.test(document.querySelector('#logoutProgress').textContent));
    assert.equal(await a.locator('#accountIdentity').textContent(), 'sync-ui@ficticio.test', 'Esperar no cierra la sesión antes de subir');
    await ac.setOffline(false); await a.evaluate(() => dispatchEvent(new Event('online')));
    await a.waitForFunction(() => document.documentElement.dataset.login, undefined, { timeout: 60000 });
    await eventsIn(b, 1);
    assert.equal(await cloudRows(a), 0, 'Los datos de la cuenta se borran del dispositivo');
    await a.locator('#loginLocal').click();
    assert.equal((await snapshot(a)).games.length, 0, 'Sin cuenta no se ven partidos de la cuenta ni el original importado');

    // Cambio de cuenta en A: ningún dato de la primera cuenta.
    await emulatorLogin(a, 'otra@ficticio.test', 'Otra cuenta ficticia');
    assert(!await answerLocalData(a, 'keep', 1500));
    assert.equal((await snapshot(a)).games.length, 0);
    await profile(a); assert(await a.locator('#syncEnable').isVisible(), 'Otra cuenta no hereda la activación');
    await a.locator('#googleLogout').click();
    await a.waitForFunction(() => document.documentElement.dataset.login);

    // Vuelve la primera cuenta: no se repite la pregunta y lo subido vuelve desde la nube.
    await emulatorLogin(a, 'sync-ui@ficticio.test');
    assert(!await answerLocalData(a, 'keep', 1500), 'La pregunta solo se hace una vez');
    await a.waitForFunction(id => !!document.querySelector(`#gameSelect option[value="${id}"]`), gid, { timeout: 30000 });
    await a.locator('#gameSelect').selectOption(gid); await idle(a); await eventsIn(a, 1); await synced(a);

    // «Salir igualmente» con un cambio sin subir: se pierde de este dispositivo y nunca llega a B.
    await ac.setOffline(true); await a.evaluate(() => dispatchEvent(new Event('offline')));
    await a.locator('.action-btn').first().click(); await a.locator('[data-points="2"][data-result="fallado"]').click(); await idle(a);
    await profile(a); await a.locator('#googleLogout').click();
    await a.locator('#logoutDialog').waitFor({ state: 'visible' });
    await a.locator('#logoutForceBtn').click();
    await a.waitForFunction(() => document.documentElement.dataset.login, undefined, { timeout: 30000 });
    assert.equal(await cloudRows(a), 0);
    await ac.setOffline(false);
    await b.waitForTimeout(7000); await synced(b); assert.equal((await snapshot(b)).events.length, 1);

    assert.deepEqual(forbidden, []); assert.deepEqual(errors, []);
    for (const width of [1024, 390, 320]) {
      await b.setViewportSize({ width, height: 844 }); await profile(b);
      assert(!await b.evaluate(() => document.documentElement.scrollWidth > innerWidth));
      await b.screenshot({ path: fileURLToPath(new URL(`../../.test-artifacts/firebase/sync-ui-${width}.png`, import.meta.url)) });
    }
    void bc;
  } finally { for (const context of contexts) await context.close(); }
}
