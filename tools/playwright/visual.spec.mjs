import { test, expect } from '@playwright/test';

test('Capturas y comprobación visual del registro', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const capture = async (name, fullPage = false) => {
    const path = testInfo.outputPath(`${name}.png`);
    await page.screenshot({ path, fullPage, animations: 'disabled' });
    await testInfo.attach(name, { path, contentType: 'image/png' });
  };
  const noOverflow = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/');
  // Fase 10: primera apertura con inicio de sesión; se continúa sin cuenta (datos ficticios locales).
  await expect(page.locator('#loginScreen')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await noOverflow();
  await capture('00-inicio-sesion');
  await page.locator('#loginLocal').click();
  await expect(page.locator('#loginScreen')).toBeHidden();
  await expect(page.locator('#newGameBtn')).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-category]')).toHaveCount(33);
  await expect(page.locator('#configurationError')).toBeHidden();
  await noOverflow();
  await capture('01-sin-partido', true);

  // Contexto efímero nuevo por proyecto: únicamente datos ficticios.
  await page.locator('#newGameBtn').click();
  await page.locator('#roundInput').fill('Prueba visual');
  await page.locator('#rivalInput').fill('Equipo ficticio');
  await capture('02-nuevo-partido');
  await page.locator('#createGameBtn').click();
  await expect(page.locator('#newGameDialog')).not.toBeVisible();
  const action = page.locator('[data-category="directo"][data-action="pr_manejador"][data-strategy="blue"]');
  await expect(action).toBeEnabled();
  await capture('03-partido-activo', true);
  await action.click();
  await expect(page.locator('[data-points="3"][data-result="fallado"]')).toBeEnabled();
  await capture('04-seleccion');
  await page.locator('[data-points="3"][data-result="fallado"]').click();
  await expect(page.locator('#gameTotal')).toHaveText('Anotados/intentos · 0/1');
  expect(await page.evaluate(async () => (await (await import('./js/persistencia.js')).readState()).events.length)).toBe(1);
  await page.reload();
  await expect(page.locator('#gameTotal')).toHaveText('Anotados/intentos · 0/1');
  await page.evaluate(() => document.fonts.ready);
  await noOverflow();
  await capture('05-registro-recargado', true);
  await page.locator('[data-category="directo"]').last().scrollIntoViewIfNeeded();
  await capture('06-final-pagina');
  const geometry = await page.locator('.result-btn').evaluateAll(buttons => buttons.map(button => {
    const r = button.getBoundingClientRect();
    return { width: r.width, height: r.height, top: r.top, bottom: r.bottom };
  }));
  for (const box of geometry) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.top).toBeGreaterThanOrEqual(0);
    expect(box.bottom).toBeLessThanOrEqual(page.viewportSize().height);
  }
  expect(errors).toEqual([]);
});
