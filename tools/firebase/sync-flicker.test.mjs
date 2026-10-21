// Diagnóstico con app/IndexedDB reales y transporte ficticio. Sin OAuth/Firestore.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, configure, idle } from './browser-support.mjs';
const baseline = process.argv.includes('--baseline');
const server = await startServer(4190), browser = await chromium.launch();
const results = [];
try {
  for (const viewport of [{ width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    await configure(context, { enabled: false, config: { projectId: 'demo-defensas' }, authEmulator: false });
    await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript',
      body: 'export const syncSettings={enabled:true,emulator:false,allowRealWrites:false};' }));
    const forbidden = [], errors = [];
    await context.route(/https:\/\/(www\.gstatic\.com|.*googleapis\.com)\//, route => { forbidden.push(route.request().url()); return route.abort(); });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4190/'); await idle(page);
    await page.evaluate(async () => {
      const p = await import('./js/persistencia.js'), s = await import('./js/sync-storage.js');
      const { createSyncEngine } = await import('./js/sync-engine.js');
      s.setStorageIdentity('ficticio'); s.setStorageScope('equipo-ficticio');
      const game = { id: crypto.randomUUID(), jornada: 'PARPADEO', rival: 'Ficticio', createdAt: '2026-10-17T10:00:00Z' };
      await p.createGameAndSelect(game);
      dispatchEvent(new Event('defensas-sync-remote'));
      const remote = { id: game.id, payload: game, sourceId: 'device-' + game.id, deleted: false, events: [], tombs: [] };
      window.F = { p, s, game, remote, statuses: [], fail: false };
      F.engine = createSyncEngine({ send: async () => {}, pull: async () => {
        if (F.fail) throw Object.assign(Error('Red ficticia interrumpida'), { code: 'unavailable' });
        return [remote];
      } }, { intervalMs: 1000000, onStatus: text => { F.statuses.push(text); document.getElementById('cloudStatus').textContent = text; } });
      await F.engine.start();
    });
    await page.waitForFunction(() => document.getElementById('gameSelect').value === F.game.id && !document.getElementById('gameSelect').disabled);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.action-btn').first().click();
    await page.evaluate(() => {
      F.anchor = document.querySelector('.action-btn[aria-pressed="true"]'); F.anchor.focus();
      F.metrics = { buttonRemovals: 0, saving: 0, disabled: 0 };
      F.observer = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'childList') for (const n of r.removedNodes) {
            if (n.nodeType === 1) F.metrics.buttonRemovals += (n.matches?.('.action-btn,.defense-btn') ? 1 : 0) + n.querySelectorAll('.action-btn,.defense-btn').length;
          }
          if (r.attributeName === 'class' && r.target.id === 'saveStatus' && !r.oldValue?.includes('is-saving')) F.metrics.saving++;
          if (r.attributeName === 'disabled' && r.oldValue === null && r.target.matches('.action-btn,.defense-btn,#resultButtons button')) F.metrics.disabled++;
        }
      });
      F.observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'disabled'] });
    });
    for (let i = 0; i < 3; i++) { await page.evaluate(() => F.engine.start()); await idle(page); }
    const unchanged = await page.evaluate(() => ({ ...F.metrics, sameButton: F.anchor.isConnected, focusPreserved: document.activeElement === F.anchor, status: F.statuses.at(-1) }));
    if (baseline) assert(unchanged.buttonRemovals > 0 && !unchanged.sameButton);
    else {
      assert.equal(unchanged.buttonRemovals, 0); assert.equal(unchanged.saving, 0); assert.equal(unchanged.disabled, 0);
      assert(unchanged.sameButton && unchanged.focusPreserved);
      // Aviso repetido/foco sin cambios: tampoco debe reconstruir ni fingir escritura.
      await page.evaluate(() => dispatchEvent(new Event('defensas-sync-remote'))); await idle(page);
      assert.equal(await page.evaluate(() => F.anchor.isConnected), true);
      // Cambio remoto real entre las dos pulsaciones: conserva el botón y la selección.
      await page.evaluate(() => {
        F.remote.events.push({ id: 'remote-event', sourceId: 'otro-dispositivo', payload: { id: 'remote-event', gameId: F.game.id,
          categoria: 'Transición', accion: 'Bajo aro', categoria_id: 'transicion', accion_id: 'transicion_bajo_aro',
          tiros_permitidos: [2], valor_tiro: 2, resultado: 'fallado', fecha_hora: '2026-10-17T10:01:00Z' } });
        return F.engine.start();
      }); await idle(page);
      await page.waitForFunction(async () => (await F.p.readState()).events.length === 1);
      assert(await page.evaluate(() => F.anchor.isConnected && F.anchor.getAttribute('aria-pressed') === 'true' && document.activeElement === F.anchor));
      await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
      assert.equal(await page.evaluate(async () => (await F.p.readState()).events.length), 2);
      await page.evaluate(() => { F.fail = true; return F.engine.start(); });
      assert.equal(await page.locator('#cloudStatus').textContent(), 'Error de sincronización');
      await page.evaluate(() => { F.fail = false; return F.engine.start(); });
      assert.equal(await page.locator('#cloudStatus').textContent(), 'Sincronizado');
      // Una lectura/sincronización correcta no debe ocultar un fallo de escritura local.
      await page.locator('.action-btn').first().click();
      await page.evaluate(() => {
        const original = IDBDatabase.prototype.transaction;
        IDBDatabase.prototype.transaction = function (...args) {
          if (args[1] === 'readwrite') { IDBDatabase.prototype.transaction = original; throw new DOMException('Cuota ficticia agotada', 'QuotaExceededError'); }
          return original.apply(this, args);
        };
      });
      await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
      assert(await page.locator('#saveStatus').evaluate(node => node.classList.contains('is-error')));
      await page.evaluate(() => dispatchEvent(new Event('defensas-sync-remote'))); await idle(page);
      await page.evaluate(() => F.engine.start());
      assert(await page.locator('#saveStatus').evaluate(node => node.classList.contains('is-error')));
      assert.equal(await page.evaluate(async () => (await F.p.readState()).events.length), 2);
    }
    await page.evaluate(() => { F.observer.disconnect(); F.engine.stop(); });
    assert.deepEqual(forbidden, []); assert.deepEqual(errors, []);
    results.push({ viewport, unchanged, baseline, forbiddenRequests: forbidden.length, pageErrors: errors });
    await context.close();
  }
  const out = new URL(process.argv.includes('--phase8b4') ? '../../.test-artifacts/firebase/fase8b4/' : '../../.test-artifacts/firebase/fase8b2/', import.meta.url); await mkdir(out, { recursive: true });
  await writeFile(new URL(baseline ? 'flicker-before.json' : 'flicker-after.json', out), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
