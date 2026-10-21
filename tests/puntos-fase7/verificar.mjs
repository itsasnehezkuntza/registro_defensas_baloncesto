import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { server } from '../integracion-cristal/servidor.mjs';
import { verifyGames } from '../integracion-cristal/partidos.mjs';
const dir = new URL('./', import.meta.url), root = new URL('../../', import.meta.url);
process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('.test-artifacts/playwright/browsers', root));
const { chromium } = await import('@playwright/test');
await mkdir(new URL('capturas/', dir), { recursive: true });
await new Promise((ok, fail) => { server.once('error', fail); server.listen(4190, '127.0.0.1', ok); });
const reports = [];
const idle = page => page.waitForFunction(() => !document.querySelector('#gameSelect').disabled);
const capture = (page, name, fullPage = false) => page.screenshot({ path: fileURLToPath(new URL(`capturas/${name}.png`, dir)), fullPage, animations: 'disabled' });
let browser;
try {
  browser = await chromium.launch({ headless: !process.argv.includes('--headed') });
  if (!process.argv.includes('--visual-only')) {
    reports.push({ games: await verifyGames(browser) });
    console.log('Partidos, sincronización y subruta: correctos');
    for (const phase of [2, 3, 5, 6]) {
      const context = await browser.newContext({ acceptDownloads: true });
      const page = await context.newPage(); let downloads = 0;
      page.on('download', () => downloads++);
      await page.goto(`http://127.0.0.1:4190/tests/fase${phase}.html?isolated=1`);
      await page.waitForFunction(p => window['phase' + p + 'Result'], phase, { timeout: 180000 });
      const result = await page.evaluate(p => window['phase' + p + 'Result'], phase);
      assert(result.ok, JSON.stringify(result));
      if (phase === 5) assert(downloads > 0);
      reports.push({ phase, ...result }); console.log(`Fase ${phase}: correcta`);
      await context.close();
    }
  }
  for (const [name, width, height] of [['ipad', 1180, 820], ['ipad-compacto', 1024, 768], ['movil', 390, 844], ['estrecho', 320, 740], ['movil-horizontal', 844, 390]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: width < 600, locale: 'es-ES', reducedMotion: 'reduce', acceptDownloads: true });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto('http://127.0.0.1:4190/#estadisticas'); await idle(page);
    assert.equal(await page.locator('.matrix-cell').count(), 36);
    assert.equal(await page.locator('.matrix-cell .sample-note').filter({ hasText: 'Sin datos' }).count(), 36);
    await page.locator('#newGameBtn').click();
    await page.locator('#roundInput').fill('F7 · Prueba'); await page.locator('#rivalInput').fill('Equipo ficticio');
    await page.locator('#createGameBtn').click(); await idle(page);
    const expected = await page.evaluate(async () => {
      const store = await import('./js/persistencia.js');
      const { loadConfiguration } = await import('./js/configuracion.js');
      const { resolveSelection, makeShotEvent } = await import('./js/registro.js');
      const state = await store.readState();
      if (state.games.length !== 1 || state.events.length) throw Error('Contexto no aislado');
      const config = await loadConfiguration(), game = state.games[0];
      let index = 0, attempts = 0, missed = 0, made = 0, points = 0; const cells = {};
      for (const category of config.categories) for (const action of category.actions) for (const defense of action.defenses.length ? action.defenses : [null]) {
        const selection = resolveSelection(config, { category: category.id, actionId: action.id, strategyId: defense?.id ?? null });
        const key = JSON.stringify(['cell', action.id, defense?.id]); cells[key] = {points: 0, count: 0};
        const count = category.id === 'directo' ? [10, 6, 1, 5, 0][index++ % 5] : 5;
        for (let i = 0; i < count; i++) {
          const result = defense?.id === 'blue' || (defense?.id !== 'red' && i % 3 !== 0) ? 'fallado' : 'anotado';
          const value = selection.shots[i % selection.shots.length];
          await store.addEvent(makeShotEvent(crypto.randomUUID(), game, selection, value, result));
          cells[key].count++; if (result === 'anotado') cells[key].points += value;
          attempts++; if (result === 'fallado') missed++; else { made++; points += value; }
        }
      }
      return { attempts, missed, made, points, cells };
    });
    await page.reload(); await idle(page); await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('#statsPoints').textContent(), String(expected.points));
    assert.doesNotMatch(await page.locator('#statisticsContent').innerText(), /intentos?|pts\/tiro|[0-9]+%|[0-9]+[–][0-9]+/i);
    assert.equal(await page.locator('.analysis-matrix tbody tr').count(), 3);
    assert.equal(await page.locator('.analysis-matrix tbody .matrix-cell').count(), 27);
    assert.equal(await page.locator('.strategy-ranking .performance').count(), 8);
    const geometry = await page.evaluate(() => {
      const scroller = document.querySelector('.matrix-scroll');
      const buttons = [...document.querySelectorAll('.matrix-cell')];
      const small = buttons.filter(b => b.getBoundingClientRect().width < 44 || b.getBoundingClientRect().height < 44).length;
      const clipped = [...document.querySelectorAll('.matrix-cell>*,.matrix-detail dt,.matrix-detail dd,.performance-heading h3')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent);
      const forbidden = [];
      for (const el of document.querySelectorAll('#statisticsView *')) for (const prop of ['color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'outlineColor']) for (const m of getComputedStyle(el)[prop].matchAll(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:[, /]+([\d.]+))?\)/g)) {
        if (m[4] === '0') continue;
        const [r, g, b] = m.slice(1, 4).map(Number), max = Math.max(r, g, b), min = Math.min(r, g, b);
        if (max - min < 2) continue;
        const h = (((max === r ? (g - b) / (max - min) : max === g ? 2 + (b - r) / (max - min) : 4 + (r - g) / (max - min)) * 60) + 360) % 360;
        if (h < 15 || h > 35) forbidden.push({ prop, color: m[0] });
      }
      return { pageOverflow: document.documentElement.scrollWidth > innerWidth, internalOverflow: scroller.scrollWidth > scroller.clientWidth, small, clipped, forbidden,
        bars: ['.bar-missed', '.bar-made'].map(s => getComputedStyle(document.querySelector(s)).backgroundColor) };
    });
    assert.equal(geometry.pageOverflow, false); assert.equal(geometry.small, 0); assert.deepEqual(geometry.clipped, []); assert.deepEqual(geometry.forbidden, []);
    assert.deepEqual(geometry.bars, ['rgb(68, 68, 68)', 'rgb(193, 124, 75)']);
    await capture(page, name); await capture(page, name + '-completa', true);
    await page.locator('.matrix-scroll').screenshot({ path: fileURLToPath(new URL(`capturas/${name}-matriz.png`, dir)) });
    // Acceso a todas las combinaciones con scroll interno y detalle real del modelo.
    const keys = await page.locator('.analysis-matrix tbody td:not(.matrix-total) button').evaluateAll(bs => bs.map(b => b.dataset.matrixKey));
    for (const key of keys) {
      // Resolver por atributo sin interpolar IDs editables en un selector CSS.
      const target = page.locator('.matrix-cell').nth(await page.locator('.matrix-cell').evaluateAll((bs, k) => bs.findIndex(b => b.dataset.matrixKey === k), key));
      await target.click(); assert.equal(await target.getAttribute('aria-pressed'), 'true');
      const visibility = await target.evaluate(el => {
        const box = el.getBoundingClientRect(), area = el.closest('.matrix-scroll').getBoundingClientRect();
        const heading = document.querySelector('.analysis-matrix th');
        const left = area.left + (getComputedStyle(heading).position === 'sticky' ? heading.getBoundingClientRect().width : 0);
        return { fullyVisible: box.left >= left && box.right <= area.right };
      });
      assert(visibility.fullyVisible, 'La celda seleccionada debe verse completa junto al eje fijo');
      assert.equal(await page.locator('#matrixDetail dd').count(), 1);
      const detail = await page.locator('#matrixDetail dd').allTextContents();
      assert.deepEqual(detail, [expected.cells[key].count ? String(expected.cells[key].points) : '—']);
      assert.equal(await target.locator('.comparison-badge').count(), 0);
    }
    const total = page.locator('.analysis-matrix tfoot .matrix-cell').last();
    await total.focus(); await page.keyboard.press('Enter');
    assert.equal(await total.getAttribute('aria-pressed'), 'true');
    const focusStyle = await total.evaluate(el => ({ width: getComputedStyle(el).outlineWidth, style: getComputedStyle(el).outlineStyle }));
    assert.equal(focusStyle.width, '3px'); assert.equal(focusStyle.style, 'solid');
    await capture(page, name + '-detalle');
    await page.reload(); await idle(page);
    assert.equal(await page.locator('#statsPoints').textContent(), String(expected.points));
    await page.locator('#viewToggle').click(); await page.waitForSelector('#registrationView:not([hidden])');
    await page.locator('[data-action="pr_pop"][data-strategy="white"]').click();
    assert.doesNotMatch(await page.locator('#registrationView').innerText(), /intentos?|[0-9]+%|[0-9]+[–][0-9]+/i);
    assert.equal(await page.locator('#gameTotal').textContent(), 'Puntos concedidos · ' + expected.points);
    await capture(page, name + '-registro');
    await page.locator('[data-points="3"][data-result="anotado"]').evaluate(el => { el.click(); el.click(); }); await idle(page);
    await page.locator('#viewToggle').click(); await page.waitForSelector('#statisticsView:not([hidden])');
    assert.equal(await page.locator('#statsPoints').textContent(), String(expected.points + 3));
    assert.equal(await page.evaluate(async () => (await (await import('./js/persistencia.js')).readState()).events.length), expected.attempts + 1);
    const popWhiteKey = JSON.stringify(['cell', 'pr_pop', 'white']);
    const popWhite = page.locator('.matrix-cell').nth(await page.locator('.matrix-cell').evaluateAll((bs, k) => bs.findIndex(b => b.dataset.matrixKey === k), popWhiteKey));
    await popWhite.click();
    await page.locator('#undoBtn').click(); await idle(page);
    assert.equal(await page.locator('#statsPoints').textContent(), String(expected.points));
    assert.equal(await popWhite.getAttribute('aria-pressed'), 'true'); // Se conserva al actualizar.
    assert.deepEqual(await page.locator('#matrixDetail dd').allTextContents(), ['5']);
    const downloadPromise = page.waitForEvent('download'); await page.locator('#exportCsvBtn').click();
    const download = await downloadPromise, bytes = await readFile(await download.path());
    assert.deepEqual([...bytes.subarray(0, 3)], [239, 187, 191]);
    assert.equal(bytes.toString('utf8').trim().split('\r\n').length, expected.attempts + 1);
    assert.deepEqual(errors, []);
    reports.push({ name, viewport: { width, height }, expected, geometry, errors });
    console.log(`${name}: 24 combinaciones, métricas, teclado, recarga, doble toque, Deshacer, CSV y paleta correctos`);
    await context.close();
  }
  await writeFile(new URL(process.argv.includes('--visual-only') ? 'verificacion-visual.json' : 'verificacion.json', dir), JSON.stringify({ ok: true, browser: await browser.version(), reports }, null, 2));
} finally { await browser?.close(); await new Promise(ok => server.close(ok)); }
