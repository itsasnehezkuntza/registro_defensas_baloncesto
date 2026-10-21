import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, configure, idle, initialized, createGame, snapshot } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
const origin = 'http://127.0.0.1:4194', server = await startServer(4194), reports = [];
try {
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await type.launch();
    try {
      for (const scenario of ['normal', 'observer-stalled', 'module-failed']) {
        const context = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true });
        const external = [], errors = [];
        await context.route('**/*', route => {
          if (!route.request().url().startsWith(origin)) { external.push(route.request().url()); return route.abort(); }
          return route.fallback();
        });
        await configure(context, { enabled: true, authEmulator: false, config: { projectId: 'demo-defensas' } });
        await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'export const syncSettings={enabled:false,emulator:false,allowRealWrites:false};' }));
        await context.route('**/js/inicio.js', async route => route.fulfill({ contentType: 'text/javascript', body: (await readFile('js/inicio.js', 'utf8')).replace('}, 15000);', '}, 300);') }));
        await context.route('**/js/cuenta-ui.js', async route => {
          if (scenario === 'module-failed') return route.fulfill({ status: 503, contentType: 'text/javascript', body: '' });
          return route.fulfill({ contentType: 'text/javascript', body: (await readFile('js/cuenta-ui.js', 'utf8')).replace('settings: firebaseSettings,', 'settings: firebaseSettings, timeoutMs: 100,') });
        });
        await context.route('**/js/firebase-auth.js', route => route.fulfill({ contentType: 'text/javascript', body: `
export function createWebAuth() {
  return { ready: async () => {}, observe(next) { window.F18Observe = next; if (${JSON.stringify(scenario)} !== 'observer-stalled' || window.F18Retry) next(null); return () => {}; },
    login: async () => window.F18Observe({uid:'ficticia18',email:'fase18@ficticio.test'}), logout: async () => window.F18Observe(null) };
}` }));
        const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
        await page.goto(origin); await initialized(page);
        for (const [width, height] of [[820, 1180], [1180, 820], [390, 844], [844, 390]]) {
          await page.setViewportSize({ width, height });
          await page.evaluate(() => { window.scrollTo(0, 4000); document.querySelector('#loginScreen').scrollTop = 100000; });
          const layout = await page.evaluate(() => ({ scroll: window.scrollY, documentHeight: document.documentElement.scrollHeight,
            height: innerHeight, appRects: document.querySelector('.app-shell').getClientRects().length,
            dockRects: document.querySelector('.result-dock').getClientRects().length, horizontal: document.documentElement.scrollWidth > innerWidth }));
          assert.equal(layout.appRects, 0, name + ': Registro fuera del layout durante inicio'); assert.equal(layout.dockRects, 0);
          assert.equal(layout.scroll, 0); assert(layout.documentHeight <= layout.height + 1); assert(!layout.horizontal);
        }
        await page.setViewportSize({ width: 820, height: 1180 });
        if (scenario === 'observer-stalled') {
          await page.locator('#loginRetry').waitFor({ state: 'visible' });
          assert.match(await page.locator('#loginMessage').textContent(), /tarda demasiado/);
          await page.evaluate(() => { window.F18Retry = true; }); await page.locator('#loginRetry').click();
          await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled);
        } else if (scenario === 'module-failed') {
          await page.locator('#loginRetry').waitFor({ state: 'visible' });
          assert.match(await page.locator('#loginMessage').textContent(), /terminar de cargar/);
        } else await page.waitForFunction(() => !document.querySelector('#loginGoogle').disabled);
        await page.locator('#loginLocal').click(); await idle(page);
        assert(await page.locator('#loginScreen').isHidden());
        assert(await page.locator('.app-shell').isVisible());
        await createGame(page, 'FICTICIO 18'); await page.locator('.action-btn').first().click();
        await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
        assert.equal((await snapshot(page)).events.length, 1);
        assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
        assert.deepEqual(external, []); if (scenario !== 'module-failed') assert.deepEqual(errors, []);
        reports.push(name + ': ' + scenario + ', inicio exclusivo en cuatro tamaños, salida local y registro correctos');
        await context.close();
      }
    } finally { await browser.close(); }
  }
  await mkdir('.test-artifacts/firebase/fase18', { recursive: true });
  await writeFile('.test-artifacts/firebase/fase18/inicio.json', JSON.stringify({ ok: true, reports, externalRequests: 0, realWrites: 0 }, null, 2));
  console.log(reports.join('\n'));
} finally { await new Promise(ok => server.close(ok)); }
