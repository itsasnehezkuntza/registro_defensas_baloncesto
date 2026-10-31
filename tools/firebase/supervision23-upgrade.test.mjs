// 22.0 exacta del commit base → candidato 23, mismo origen y subruta simulados.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium, idle, createGame, snapshot } from './browser-support.mjs';
import { webkit } from '@playwright/test';
import { assets23 } from './prepare23-local.mjs';
const base = 'https://prueba-fase23.invalid/registro_defensas_baloncesto/';
const old = new Map(assets23.filter(f => !/supervision|panel-configuration/.test(f)).map(file => [file, execFileSync('git', ['show', 'HEAD:' + file])]));
const reports = [];
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  const context = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  let previous = true; const errors = [], external = [];
  try {
    await context.addInitScript(() => {
      localStorage.setItem('defensas-account-mode', 'local');
      window.__opened23 = [];
      const open = indexedDB.open.bind(indexedDB);
      indexedDB.open = (...args) => { window.__opened23.push(args[0]); return open(...args); };
    });
    await context.route('**/*', async route => {
      const url = route.request().url();
      if (!url.startsWith(base)) { external.push(url); return route.abort(); }
      const file = new URL(url).pathname.slice('/registro_defensas_baloncesto/'.length) || 'index.html';
      if (file === 'js/firebase-config.js') return route.fulfill({ contentType: 'text/javascript', body: 'export const firebaseSettings={enabled:false,authEmulator:false,config:{projectId:"registro-defensivo"}};' });
      const bytes = previous ? old.get(file) : assets23.includes(file) ? await readFile(file) : null;
      return route.fulfill(bytes ? { body: bytes, contentType: ({ html: 'text/html', js: 'text/javascript', css: 'text/css', csv: 'text/csv', ttf: 'font/ttf' })[file.split('.').pop()] || 'text/plain' } : { status: 404, body: '' });
    });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(base); await idle(page); await createGame(page, 'Conservar 22 ficticio');
    await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').dblclick(); await idle(page);
    const before = await snapshot(page); assert.equal(before.events.length, 1);
    previous = false; await page.reload(); await idle(page);
    assert.equal(await page.locator('meta[name="app-version"]').getAttribute('content'), '23.0-local');
    const after = await snapshot(page);
    for (const key of ['games', 'events', 'currentGameId']) assert.deepEqual(after[key], before[key]);
    await page.locator('#profileBtn').click(); await page.locator('#profileMenu a[href="./supervision.html"]').click();
    await page.waitForURL(base + 'supervision.html');
    await page.waitForFunction(() => document.querySelector('#supervisionStatus').textContent.includes('No se puede preparar'));
    assert.deepEqual(await page.evaluate(() => window.__opened23), [], 'Supervisión no abre IndexedDB deportivo ni Auth cuando está desactivado');
    await page.getByRole('link', { name: 'Volver al registro' }).click(); await idle(page);
    const returned = await snapshot(page);
    for (const key of ['games', 'events', 'currentGameId']) assert.deepEqual(returned[key], before[key]);
    await page.locator('#undoBtn').click(); await idle(page); await page.reload(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 0);
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    reports.push(name + ': 22→23 en subruta conserva partido, selección y tiro; ida/vuelta a supervisión sin abrir datos deportivos; Deshacer y recarga correctos');
  } finally { await context.close(); await browser.close(); }
}
await mkdir('.test-artifacts/firebase/fase23', { recursive: true });
await writeFile('.test-artifacts/firebase/fase23/upgrade.json', JSON.stringify({ reports, realRequests: 0 }, null, 2));
console.log(reports.join('\n'));
