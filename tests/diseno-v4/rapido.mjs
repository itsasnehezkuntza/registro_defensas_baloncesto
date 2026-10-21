// Capturas rápidas de iteración (sin aserciones). Uso: node tests/diseno-v4/rapido.mjs <carpeta>
import { fileURLToPath } from 'node:url';
import { server } from './servidor.mjs';
import { seedSample } from './muestra.mjs';
const root = new URL('../../', import.meta.url), out = process.argv[2];
process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('.test-artifacts/playwright/browsers', root));
const { chromium } = await import('@playwright/test');
await new Promise((ok, fail) => { server.once('error', fail); server.listen(4192, '127.0.0.1', ok); });
const browser = await chromium.launch();
const sizes = (process.argv[3] || '1180x740,1133x670,1366x1024,820x1180,390x844').split(',').map(s => s.split('x').map(Number));
try {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: width < 600, locale: 'es-ES', reducedMotion: 'reduce' });
    // Fase 10: usuario que ya eligió «Continuar sin cuenta».
    await context.addInitScript(() => { try { localStorage.setItem('defensas-account-mode', 'local'); } catch {} });
    await context.route(url => !url.href.startsWith('http://127.0.0.1'), route => route.abort());
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4192/');
    await page.waitForFunction(() => !document.querySelector('#gameSelect').disabled);
    await page.locator('#newGameBtn').click();
    await page.locator('#roundInput').fill('7'); await page.locator('#rivalInput').fill('CB Ficticio');
    await page.locator('#createGameBtn').click();
    await page.waitForFunction(() => !document.querySelector('#gameSelect').disabled && document.querySelector('#gameSelect').value);
    await seedSample(page); await page.reload();
    await page.waitForFunction(() => !document.querySelector('#gameSelect').disabled);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-action="pr_roller"][data-strategy="blue"]').click();
    await page.screenshot({ path: `${out}/registro-${width}x${height}.png`, fullPage: width < 700 });
    await page.locator('#viewStatsBtn').click();
    await page.waitForFunction(() => document.body.dataset.view === 'estadisticas');
    await page.locator('[data-matrix-key=\'["cell","pr_pop","red"]\']').click();
    await page.screenshot({ path: `${out}/stats-${width}x${height}.png`, fullPage: true });
    console.log(width, height, errors);
    await context.close();
  }
} finally { await browser.close(); server.close(); }
