// Contextos efímeros, sin OAuth ni escrituras Firestore. App HTTPS desplegada real.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium, idle, createGame, snapshot } from './browser-support.mjs';
const origin = 'https://registro-defensivo--ipad-8b2-40nbq9cf.web.app';
const browser = await chromium.launch();
const results = [];
try {
  for (const viewport of [{ width: 1024, height: 768 }, { width: 1180, height: 740 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage(), firestoreRequests = [], errors = [];
    page.on('request', r => { if (/firestore\.googleapis\.com|firebase-firestore\.js/.test(r.url())) firestoreRequests.push(r.url()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin); await idle(page);
    const flags = await page.evaluate(async () => (await import('./js/sync-config.js')).syncSettings);
    assert.equal(flags.enabled, false); assert.equal(flags.allowRealWrites, false);
    assert.equal(await page.locator('#previewEnable').textContent(), 'Activar prueba de sincronización');
    await page.waitForFunction(() => !document.querySelector('#googleLogin').disabled);
    await page.locator('#moreBtn').click();
    await page.locator('#previewEnable').click();
    await page.waitForFunction(() => document.getElementById('previewActivationStatus').textContent.includes('Inicia sesión'));
    assert.equal(await page.evaluate(() => localStorage.getItem('prueba8b3-sync')), null);
    if (await page.locator('#moreMenu').isVisible()) await page.locator('#moreBtn').click();
    assert.equal((await snapshot(page)).games.length, 0);
    const id = await createGame(page, 'Ficticio local HTTPS 8B.3');
    await page.locator('.action-btn').first().click();
    await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 1);
    await page.reload(); await idle(page);
    const state = await snapshot(page);
    assert.equal(state.currentGameId, id); assert.equal(state.events.length, 1);
    assert.equal(await page.locator('#cloudStatus').textContent(), 'Solo local');
    const localSaveError = await page.locator('#saveStatus').evaluate(n => n.classList.contains('is-error'));
    assert.equal(localSaveError, false);
    // Sin alterar respuestas de SDK ni simular un login OAuth.
    await page.waitForFunction(() => !document.querySelector('#googleLogin').disabled || !document.querySelector('#accountRetry').hidden, { timeout: 15000 }).catch(() => {});
    const auth = await page.locator('#googleLogin').evaluate(n => ({ label: n.textContent, disabled: n.disabled }));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false); assert.deepEqual(firestoreRequests, []); assert.deepEqual(errors, []);
    results.push({ viewport, syncEnabled: false, activationWithoutLoginRejected: true, initialSportsDatabaseEmpty: true, localTwoTaps: true, reloadPreserves: true, auth, horizontalOverflow: overflow, firestoreRequests: 0, pageErrors: errors });
    await context.close();
  }
  await writeFile(new URL('../../.test-artifacts/firebase/fase8b3/https-smoke.json', import.meta.url), JSON.stringify({ at: new Date().toISOString(), origin, results, oauthTested: false, safariTested: false, firestoreWrites: 0 }, null, 2));
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
