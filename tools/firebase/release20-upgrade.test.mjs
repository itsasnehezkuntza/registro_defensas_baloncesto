// Actualización 8C.0 → 20.0 en el mismo origen simulado. Sin red ni datos reales.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium, idle, createGame, snapshot } from './browser-support.mjs';
import { exerciseEditor19 } from './editor19.test.mjs';
const { webkit } = await import('@playwright/test');
const dir = '.test-artifacts/firebase/fase20/', base = 'https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/';
const pkg = JSON.parse(await readFile(dir + 'package.json', 'utf8')), reports = [];
const oldNames = execFileSync('git', ['ls-tree', '-r', '--name-only', 'origin/gh-pages'], { encoding: 'utf8' }).trim().split('\n');
const old = new Map(oldNames.map(file => [file, execFileSync('git', ['show', 'origin/gh-pages:' + file])]));
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 820, height: 1180 }, acceptDownloads: true });
    let previous = true; const errors = [], external = [], violations = [];
    await context.addInitScript(() => { localStorage.setItem('defensas-account-mode', 'local'); document.addEventListener('securitypolicyviolation', e => window.__violation20(e.effectiveDirective)); });
    await context.exposeBinding('__violation20', (_, value) => violations.push(value));
    await context.route('**/*', async route => {
      const url = route.request().url();
      if (!url.startsWith(base)) { external.push(url); return route.abort(); }
      const file = new URL(url).pathname.slice('/registro_defensas_baloncesto/'.length) || 'index.html';
      if (file === 'js/firebase-config.js') return route.fulfill({ contentType: 'text/javascript', body: 'export const firebaseSettings={enabled:false,authEmulator:false,config:{projectId:"registro-defensivo"}};' });
      const bytes = previous ? old.get(file) : pkg.files.some(item => item.file === file) ? await readFile(dir + 'pages/' + file) : null;
      if (!bytes) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ body: bytes, contentType: ({ html: 'text/html', css: 'text/css', js: 'text/javascript', csv: 'text/csv', ttf: 'font/ttf', json: 'application/json' })[file.split('.').pop()] || 'text/plain' });
    });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(base); await idle(page); await createGame(page, 'CONSERVAR 8C FICTICIO');
    await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
    const before = await snapshot(page);
    const beforeAll = await page.evaluate(async () => (await import('./js/persistencia.js')).allEvents());
    previous = false; await page.reload(); await idle(page);
    assert.equal(await page.locator('meta[name="app-version"]').getAttribute('content'), '20.0');
    const after = await snapshot(page);
    for (const key of ['games', 'events', 'currentGameId']) assert.deepEqual(after[key], before[key], key);
    assert.deepEqual(await page.evaluate(async () => (await import('./js/persistencia.js')).allEvents()), beforeAll);
    await page.locator('#undoBtn').click(); await idle(page); await page.reload(); await idle(page);
    assert.equal((await snapshot(page)).events.length, 0);
    await createGame(page, 'EDITOR FICTICIO 20'); await exerciseEditor19(page);
    assert.deepEqual(errors, []); assert.deepEqual(external, []); assert.deepEqual(violations, []);
    reports.push(name + ': 8C→20 en misma subruta conserva partido, selección e históricos; Deshacer y editor/recarga correctos');
    await context.close();
  } finally { await browser.close(); }
}
await writeFile(dir + 'upgrade.json', JSON.stringify({ ok: true, reports, firestoreWrites: 0 }, null, 2));
console.log(reports.join('\n'));
