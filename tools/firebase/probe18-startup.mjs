// Reproducción local del candidato ya publicado con SDK oficial y WebKit táctil.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, officialSdk } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
const root = resolve('.test-artifacts/firebase/fase17/candidate/public');
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true });
    const requests = [], errors = [], consoleErrors = [], origin = 'https://registro-defensivo--ipad17-ficticio.web.app';
    await officialSdk(context);
    await context.route(origin + '/**', async route => {
      const file = new URL(route.request().url()).pathname.slice(1) || 'index.html'; requests.push(file);
      try { await route.fulfill({ contentType: ({ html: 'text/html', js: 'text/javascript', css: 'text/css', ttf: 'font/ttf' })[file.split('.').pop()] || 'text/plain', body: await readFile(resolve(root, file)) }); }
      catch { await route.fulfill({ status: 404 }); }
    });
    await context.route('https://apis.google.com/**', route => route.abort());
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.stack));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(origin); await page.waitForTimeout(14000);
    const state = await page.evaluate(() => ({ readyState: document.readyState, build: document.documentElement.dataset.preview17,
      login: document.documentElement.dataset.login, button: document.querySelector('#loginGoogleText').textContent,
      message: document.querySelector('#loginMessage').textContent, retry: !document.querySelector('#loginRetry').hidden,
      appVisibility: getComputedStyle(document.querySelector('.app-shell')).visibility, appDisplay: getComputedStyle(document.querySelector('.app-shell')).display,
      inert: document.querySelector('.app-shell').inert, bodyHeight: document.body.scrollHeight, height: innerHeight,
      loginHeight: document.querySelector('#loginScreen').scrollHeight, htmlOverflow: getComputedStyle(document.documentElement).overflow,
      save: document.querySelector('#saveStatusText').textContent }));
    const result = { name, state, requests, errors, consoleErrors };
    await writeFile('.test-artifacts/firebase/fase17/probe18-' + name + '.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2)); await context.close();
  } finally { await browser.close(); }
}
