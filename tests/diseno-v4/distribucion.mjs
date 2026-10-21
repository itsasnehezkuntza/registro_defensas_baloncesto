// Distribución adaptable del Registro (Fase 9B): medición en la aplicación real.
// Transición y Estático de 1 a 12 botones y matrices de 2×2 a 6×8, en cinco tamaños.
// Contextos efímeros, datos ficticios y sin red externa. Uso: node tests/diseno-v4/distribucion.mjs [--capturas]
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { server } from './servidor.mjs';

const dir = new URL('./', import.meta.url), root = new URL('../../', import.meta.url);
const BASE = 'http://127.0.0.1:4193';
process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('.test-artifacts/playwright/browsers', root));
const { chromium } = await import('@playwright/test');
await mkdir(new URL('capturas/', dir), { recursive: true });
const SIZES = [[1180, 740], [1133, 670], [1366, 1024], [820, 1180], [390, 844]];
const IPAD = new Set(['1180x740', '1133x670', '1366x1024', '820x1180']);
const CASES = [
  ...Array.from({ length: 12 }, (_, i) => ({ name: `transicion-${i + 1}`, transition: i + 1, fixed: 7, rows: 3, cols: 8 })),
  ...Array.from({ length: 12 }, (_, i) => ({ name: `estatico-${i + 1}`, transition: 2, fixed: i + 1, rows: 3, cols: 8 })),
  ...[2, 3, 4, 5, 6].flatMap(rows => [2, 3, 4, 5, 6, 7, 8].map(cols => ({ name: `matriz-${rows}x${cols}`, transition: 2, fixed: 7, rows, cols }))),
  // Fase 9E: hasta 12 defensas.
  ...[2, 3, 4, 6].flatMap(rows => [10, 12].map(cols => ({ name: `matriz-${rows}x${cols}`, transition: 2, fixed: 7, rows, cols })))
];
const shots = process.argv.includes('--capturas') ? new Set(['transicion-1', 'transicion-12', 'estatico-1', 'estatico-5', 'estatico-12', 'matriz-2x2', 'matriz-6x8', 'matriz-4x5', 'matriz-3x12', 'matriz-6x12']) : new Set();

await new Promise((ok, fail) => { server.once('error', fail); server.listen(4193, '127.0.0.1', ok); });
const report = { fecha: new Date().toISOString(), pasos: ['completo', 'sin contador', 'compacto', 'nombres recortados'], tamanos: {} };
let browser;
try {
  browser = await chromium.launch();
  for (const [width, height] of SIZES) {
    const size = `${width}x${height}`, phone = width < 700;
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: phone, locale: 'es-ES', reducedMotion: 'reduce' });
    // Fase 10: usuario que ya eligió «Continuar sin cuenta».
    await context.addInitScript(() => { try { localStorage.setItem('defensas-account-mode', 'local'); } catch {} });
    await context.route(url => !url.href.startsWith(BASE), route => route.abort());
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE + '/');
    await page.waitForFunction(() => !document.querySelector('#gameSelect').disabled);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#newGameBtn').click();
    await page.locator('#roundInput').fill('Distribución'); await page.locator('#rivalInput').fill('Ficticio');
    await page.locator('#createGameBtn').click();
    await page.waitForFunction(() => document.querySelector('#gameSelect').value && !document.querySelector('#gameSelect').disabled);
    const rows = [];
    for (const item of CASES) {
      const total = await page.evaluate(applyCase, item);
      await page.waitForFunction(n => document.querySelectorAll('#registrationView [data-category]').length === n && document.querySelector('#registrationView').dataset.fits, total);
      await page.evaluate(() => new Promise(requestAnimationFrame));
      const m = await page.evaluate(measure, { phone });
      m.preview = await page.evaluate(predict, size);
      rows.push({ caso: item.name, ...m });
      const ipad = IPAD.has(size);
      // Sin huecos: la suma de anchos de cada fila coincide con su contenedor (±1 px).
      assert.deepEqual(m.gaps, [], `${size} ${item.name}: filas con hueco ${JSON.stringify(m.gaps)}`);
      assert(!m.overflowX, `${size} ${item.name}: scroll horizontal`);
      assert.equal(m.small, 0, `${size} ${item.name}: objetivos < 44 px`);
      if (ipad && m.fits) {
        assert(!m.scrollY, `${size} ${item.name}: desplazamiento vertical`);
        assert.equal(m.covered, 0, `${size} ${item.name}: botones tapados por la barra`);
        assert(m.matrixFills, `${size} ${item.name}: la matriz no llena el espacio`);
      }
      if (m.preview !== null) assert(m.level <= m.preview.level || !m.preview.fits, `${size} ${item.name}: la vista previa promete menos de lo que hace la app`);
      if (shots.has(item.name)) await page.screenshot({ path: fileURLToPath(new URL(`capturas/distribucion-${size}-${item.name}.png`, dir)), fullPage: phone });
    }
    assert.deepEqual(errors, []);
    report.tamanos[size] = rows;
    const byLevel = rows.reduce((acc, r) => { const k = r.fits ? `paso ${r.level}` : 'no cabe'; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {});
    console.log(`${size}: ${rows.length} casos · ${JSON.stringify(byLevel)}`);
    await context.close();
  }
} finally {
  await browser?.close(); server.close();
  await writeFile(new URL('distribucion.json', dir), JSON.stringify(report, null, 2));
}

// En la página: guarda una configuración ficticia con los tamaños pedidos (IDs nuevos, nunca reutilizados).
async function applyCase(item) {
  const store = await import('./js/configuracion-guardada.js');
  const record = await new Promise(resolve => { const r = indexedDB.open('registro_defensivo_baloncesto'); r.onsuccess = () => { const tx = r.result.transaction('settings'); const g = tx.objectStore('settings').get(store.CONFIG_KEY); g.onsuccess = () => { resolve(g.result.value); r.result.close(); }; }; });
  const doc = structuredClone(store.currentVersion(record).doc);
  const tag = Math.random().toString(36).slice(2, 7);
  const simple = ['Bajo aro', 'Spot up 3', '1c1 exterior', '1c1 interior', 'Pin down', 'Cortes', 'Of. Screen', 'Spain', 'Flare', 'Zipper', 'Floppy', 'Hammer'];
  const types = ['PR Manejador', 'PR Roller', 'PR Pop', 'Spain', 'Short roll', 'Ghost'];
  const defenses = ['Black', 'White', 'Blue', 'Red', 'Tut', 'Next', 'Dance', 'Quick+Under', 'Ice', 'Show', 'Switch', 'Hedge'];
  const make = (list, n, prefix) => list.slice(0, n).map((name, i) => ({ id: `${prefix}_${tag}_${i}`, name, shots: [2, 3], retired: false }));
  const section = id => doc.categories.find(c => c.id === id);
  // Sin tiros en ningún partido: las listas anteriores se sustituyen (borrado permitido).
  section('transicion').items = make(simple.slice(0).reverse(), item.transition, 't');
  section('estatico').items = make(simple, item.fixed, 'e');
  section('directo').types = make(types, item.rows, 'pr');
  section('directo').defenses = make(defenses, item.cols, 'd');
  section('directo').cells = {};
  // Fase 9C: la configuración es del partido; se asigna al activo como hace el editor.
  await store.saveButtonConfiguration(doc, record.revision, { gameId: document.querySelector('#gameSelect').value });
  return item.transition + item.fixed + item.rows * item.cols;
}

function measure({ phone }) {
  const view = document.querySelector('#registrationView');
  const dock = document.querySelector('.result-dock').getBoundingClientRect();
  const rect = el => el.getBoundingClientRect();
  const gaps = [];
  const top = rect(document.querySelector('.top-grid'));
  const sections = [...document.querySelectorAll('.top-grid > .stat-panel')];
  const gridGap = parseFloat(getComputedStyle(document.querySelector('.top-grid')).columnGap) || 0;
  if (!phone && Math.abs(sections.reduce((n, s) => n + rect(s).width, 0) + gridGap - top.width) > 1) gaps.push('secciones');
  for (const row of document.querySelectorAll('#registrationView .action-row')) {
    const buttons = [...row.children], gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    const sum = buttons.reduce((n, b) => n + rect(b).width, 0) + gap * (buttons.length - 1);
    if (Math.abs(sum - rect(row).width) > 1 || Math.abs(rect(row).width - rect(row.parentElement).width) > 1) gaps.push(`${row.parentElement.dataset.fitList}:${buttons.length}`);
  }
  const buttons = [...view.querySelectorAll('.action-btn, .defense-btn')];
  const small = buttons.filter(b => { const r = rect(b); return r.width < 43.5 || r.height < 43.5; }).length;
  const covered = buttons.filter(b => rect(b).bottom > dock.top + 0.5 || rect(b).top < 0).length;
  const matrix = view.querySelector('.direct-matrix-inner');
  const matrixFills = phone || (Math.abs(rect(matrix).bottom - rect(view).bottom) <= 1 && Math.abs(rect(matrix).right - rect(view).right) <= 1);
  return {
    level: Number(view.dataset.fit), rows: Number(view.dataset.rows), fits: view.dataset.fits === 'true',
    gaps, small, covered: phone ? 0 : covered, matrixFills,
    scrollY: document.documentElement.scrollHeight > innerHeight + 1, overflowX: document.documentElement.scrollWidth > innerWidth
  };
}

// Predicción del editor para el mismo iPad (null si el tamaño no es uno de la vista previa).
async function predict(size) {
  const { PREVIEW_DEVICES, fitOnDevice } = await import('./js/editor.js');
  const store = await import('./js/configuracion-guardada.js');
  const device = PREVIEW_DEVICES.find(d => `${d.width}x${d.height}` === size);
  if (!device) return null;
  const record = await new Promise(resolve => { const r = indexedDB.open('registro_defensivo_baloncesto'); r.onsuccess = () => { const g = r.result.transaction('settings').objectStore('settings').get(store.CONFIG_KEY); g.onsuccess = () => { resolve(g.result.value); r.result.close(); }; }; });
  const holder = document.createElement('div'); holder.className = 'preview-measure'; document.body.append(holder);
  const { result } = fitOnDevice(store.configurationFromDoc(store.currentVersion(record).doc), device, holder);
  holder.remove();
  return { level: result.level, fits: result.fits };
}
