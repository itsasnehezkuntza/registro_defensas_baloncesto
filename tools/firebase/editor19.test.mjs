// Regresión del teclado del editor. Solo contextos efímeros y partidos ficticios.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, idle, createGame } from './browser-support.mjs';
import { server } from '../../tests/diseno-v4/servidor.mjs';
const { webkit } = await import('@playwright/test');
export async function exerciseEditor19(page) {
  await page.locator('#moreBtn').click(); await page.locator('#editButtonsBtn').click();
  const add = page.locator('.edit-add[data-list="directo:defenses"]');
  await add.waitFor(); await page.waitForFunction(() => !document.querySelector('.edit-add[data-list="directo:defenses"]').disabled);
  await add.click();
  // La actualización diferida tras añadir tampoco debe cerrar el teclado.
  await page.waitForTimeout(500);
  const input = page.locator('#editNameInput');
  assert(await input.evaluate(el => document.activeElement === el), 'Se perdió el foco tras añadir la defensa');
  await input.fill('Zona');
  await page.keyboard.type(' lenta', { delay: 180 });
  await page.waitForTimeout(500);
  assert.equal(await input.inputValue(), 'Zona lenta');
  assert(await input.evaluate(el => document.activeElement === el), 'Se perdió el foco durante la escritura pausada');
  await input.evaluate(el => el.setSelectionRange(4, 4));
  await page.waitForTimeout(500);
  await page.keyboard.type(' nueva', { delay: 180 });
  assert.equal(await input.inputValue(), 'Zona nueva lenta', 'Se desplazó el cursor al editar en medio del nombre');
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: viewport.width, height: viewport.height - 240 });
  await page.waitForTimeout(500);
  assert(await input.evaluate(el => document.activeElement === el), 'Se perdió el foco al cambiar el espacio disponible');
  assert.equal(await input.evaluate(el => el.selectionStart), 10);
  await page.setViewportSize(viewport);
  await page.locator('[data-act="close"]').click(); await page.locator('[data-act="done"]').click();
  await page.waitForFunction(() => document.body.dataset.view === 'registro');
  await page.reload(); await idle(page);
  assert(await page.locator('#registrationView').getByText('Zona nueva lenta', { exact: true }).count(), 'No se conservó el nombre tras guardar y recargar');
}
if (process.argv[1]?.endsWith('editor19.test.mjs')) {
  const origin = 'http://127.0.0.1:4193', reports = [];
  await new Promise(resolve => server.listen(4193, '127.0.0.1', resolve));
  try {
    for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
      const browser = await type.launch();
      try {
        const context = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true });
        const external = [], errors = [];
        await context.addInitScript(() => localStorage.setItem('defensas-account-mode', 'local'));
        await context.route(url => url.origin !== origin, route => { external.push(route.request().url()); return route.abort(); });
        const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
        await page.goto(origin); await idle(page); await createGame(page, 'Foco ficticio F19');
        await exerciseEditor19(page);
        assert.deepEqual(errors, []); assert.deepEqual(external, []);
        reports.push(name + ': escritura pausada, cursor intermedio, cambio de altura y nombre guardado tras recarga correctos');
        await context.close();
      } finally { await browser.close(); }
    }
    await mkdir('.test-artifacts/firebase/fase19', { recursive: true });
    await writeFile('.test-artifacts/firebase/fase19/editor.json', JSON.stringify({ ok: true, reports, realWrites: 0 }, null, 2));
    console.log(reports.join('\n'));
  } finally { await new Promise(resolve => server.close(resolve)); }
}
