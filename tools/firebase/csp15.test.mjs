// Política de producción sin excepciones de emulador, en perfiles efímeros.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, idle, createGame, snapshot } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
const html = await readFile('index.html', 'utf8');
const policy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
assert(policy && html.indexOf('Content-Security-Policy') < html.indexOf('<script'));
assert(!/<script\b[^>]*>\s*[^<\s]/i.test(html), 'Sin scripts incrustados');
const directives = Object.fromEntries(policy.split(';').map(part => part.trim().split(/\s+/)).map(([key, ...values]) => [key, values]));
assert(!directives['script-src'].some(value => ['*', "'unsafe-inline'", "'unsafe-eval'", 'data:', 'blob:'].includes(value)));
assert(!/localhost|127\.0\.0\.1|http:/.test(policy), 'Sin excepciones de prueba en producción');
assert(!directives['script-src'].includes('https:'));
assert.deepEqual(directives['object-src'], ["'none'"]);
const origin = 'http://127.0.0.1:4196', server = await startServer(4196), reports = [];
const probe = `
  window.P15 = { evalBlocked: false, fetchBlocked: false };
  try { eval('window.P15EvalRan = true'); } catch { P15.evalBlocked = true; }
  const inline = document.createElement('script'); inline.textContent = 'window.P15InlineRan = true'; document.head.append(inline);
  const handler = document.createElement('button'); handler.setAttribute('onclick', 'window.P15HandlerRan = true'); document.body.append(handler); handler.click();
  const script = document.createElement('script'); script.src = 'https://csp-denegado.invalid/injected.js'; document.head.append(script);
  fetch('https://csp-denegado.invalid/leak').catch(() => { P15.fetchBlocked = true; });
  const image = new Image(); image.src = 'https://csp-denegado.invalid/leak.png'; document.body.append(image);
  const frame = document.createElement('iframe'); frame.src = 'https://csp-denegado.invalid/frame'; document.body.append(frame);
  const object = document.createElement('object'); object.data = 'https://csp-denegado.invalid/object'; document.body.append(object);
  const base = document.createElement('base'); base.href = 'https://csp-denegado.invalid/'; document.head.append(base);
  const form = document.createElement('form'); form.action = 'https://csp-denegado.invalid/form'; document.body.append(form); form.submit();
  window.P15Done = true;
`;
try {
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await type.launch();
    try {
      const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1024, height: 768 } });
      const external = [], errors = [];
      context.on('request', request => { if (!request.url().startsWith(origin)) external.push(request.url()); });
      await context.route('https://csp-denegado.invalid/**', route => { throw Error('CSP dejó salir una petición: ' + route.request().url()); });
      await context.addInitScript(() => {
        localStorage.setItem('defensas-account-mode', 'local');
        window.P15Violations = [];
        document.addEventListener('securitypolicyviolation', event => P15Violations.push({ directive: event.effectiveDirective, blocked: event.blockedURI }));
      });
      const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
      for (const path of ['/', '/registro_defensas_baloncesto/']) {
        await page.goto(origin + path); await idle(page);
        assert.equal(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'), policy);
        const gid = await createGame(page, 'CSP ficticio');
        await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
        assert.equal((await snapshot(page)).events.length, 1);
        await page.reload(); await idle(page); assert.equal((await snapshot(page)).currentGameId, gid);
        assert.equal((await snapshot(page)).events.length, 1);
        await page.locator('#viewStatsBtn').click(); await page.waitForFunction(() => document.body.dataset.view === 'estadisticas');
        assert(await page.locator('.matrix-cell').count());
        assert.deepEqual(await page.evaluate(() => P15Violations), []);
        reports.push(name + ': registro, recarga y estadísticas sin violaciones en ' + path);
      }
      assert.deepEqual(external, []); assert.deepEqual(errors, []);
      await context.route('**/js/csp-probe15.js', route => route.fulfill({ contentType: 'text/javascript', body: probe }));
      await page.evaluate(url => { const script = document.createElement('script'); script.src = url; document.head.append(script); }, origin + '/js/csp-probe15.js');
      await page.waitForFunction(() => window.P15Done && P15.evalBlocked && P15.fetchBlocked && P15Violations.length >= 8);
      const security = await page.evaluate(() => ({ violations: P15Violations, inline: !!window.P15InlineRan, handler: !!window.P15HandlerRan, evaluated: !!window.P15EvalRan, base: document.baseURI }));
      assert(!security.inline && !security.handler && !security.evaluated);
      assert(security.base.startsWith(origin));
      // WebKit no inicia la carga de este <object>; no emite un evento CSP
      // para algo que el motor ya no intenta cargar. Chromium sí lo ejercita.
      for (const directive of ['script-src-elem', 'script-src-attr', 'connect-src', 'img-src', 'frame-src', ...(name === 'chromium' ? ['object-src'] : []), 'base-uri', 'form-action'])
        assert(security.violations.some(item => item.directive === directive), name + ': falta bloqueo ' + directive);
      // Algunos motores notifican el intento antes de bloquearlo; el handler de
      // route anterior garantiza que no llegue a una petición de red real.
      reports.push(name + ': bloqueados script incrustado, handler, eval, script externo, conexión, imagen, iframe, base y formulario externos; object-src none' + (name === 'chromium' ? ' bloqueado' : ' declarado (el motor no inicia object)'));
      await context.close();
    } finally { await browser.close(); }
  }
  await mkdir('.test-artifacts/firebase', { recursive: true });
  await writeFile('.test-artifacts/firebase/csp15.json', JSON.stringify({ ok: true, productionPolicy: policy, reports, realWrites: 0 }, null, 2));
  console.log(reports.join('\n'));
} finally { await new Promise(ok => server.close(ok)); }
