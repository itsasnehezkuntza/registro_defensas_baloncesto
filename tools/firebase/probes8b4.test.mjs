// Inyección de fallos controlados, sin Firebase: demuestra qué etapas distingue el diagnóstico.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { startServer } from './servidor.mjs';
import { chromium, configure, idle } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
const server = await startServer(4193), results = [];
try {
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await type.launch();
    try {
      const context = await browser.newContext({ acceptDownloads: true });
      await configure(context, { enabled: false, config: { projectId: 'demo-defensas' } });
      await context.route('**/js/sync-config.js', r => r.fulfill({ contentType: 'text/javascript', body: 'export const syncSettings={enabled:true,emulator:false,allowRealWrites:false};' }));
      await context.route(/https:\/\/(www\.gstatic\.com|.*googleapis\.com)\//, r => r.abort());
      const page = await context.newPage(); await page.goto('http://127.0.0.1:4193/'); await idle(page);
      await page.evaluate(async () => {
        const d = await import('./js/sync-diagnostics.js'); d.enableSyncDiagnostics();
        const p = await import('./js/persistencia.js'), s = await import('./js/sync-storage.js');
        s.setStorageIdentity('ficticio'); s.setStorageScope('fixture');
        const game = { id: crypto.randomUUID(), jornada: '8B4', rival: 'Ficticio', createdAt: '2026-10-17' };
        await p.createGameAndSelect(game);
        for (const op of await s.listPending()) await s.acknowledge(op);
        const shot = id => ({ id, sourceId: 'ficticio', payload: { id, gameId: game.id, categoria: 'Transición', accion: 'Bajo aro', categoria_id: 'transicion', accion_id: 'transicion_bajo_aro', valor_tiro: 2, resultado: 'fallado', fecha_hora: '2026-10-17T00:00:00Z' } });
        const remote = { id: game.id, payload: game, sourceId: 'fixture', deleted: false, events: [shot('uno')], tombs: [] };
        await s.mergeRemote(s.storageContext(), [remote]);
        window.P = { p, s, d, game, remote, shot };
      });
      await page.waitForFunction(() => document.getElementById('scoreboardValue').textContent.includes('0/2'));
      // Perdemos únicamente el aviso DOM. IndexedDB incorpora el evento; la vista queda atrás.
      const lostNotice = await page.evaluate(async () => {
        const original = globalThis.dispatchEvent;
        globalThis.dispatchEvent = function(event) { return event.type === 'defensas-sync-remote' ? true : original.call(this, event); };
        P.remote.events.push(P.shot('dos')); await P.s.mergeRemote(P.s.storageContext(), [P.remote]);
        await P.s.mergeRemote(P.s.storageContext(), [P.remote]); // respuesta idéntica ya no notifica
        globalThis.dispatchEvent = original;
        return { localEvents: (await P.p.readState()).events.length, points: document.getElementById('scoreboardValue').textContent, trace: P.d.syncDiagnosticSnapshot() };
      });
      assert.equal(lostNotice.localEvents, 2); assert(lostNotice.points.includes('0/2'));
      await page.evaluate(() => dispatchEvent(new Event('focus')));
      await page.waitForFunction(() => document.getElementById('scoreboardValue').textContent.includes('0/4'));
      // Lectura remota sin resolver: el motor no agenda otro ciclo hasta terminar.
      await page.evaluate(async () => {
        const { createSyncEngine } = await import('./js/sync-engine.js');
        P.d.enableSyncDiagnostics();
        P.engine = createSyncEngine({ send: async () => { throw Error('No enviar'); }, pull: async () => {
          const value = await P.d.traceRemoteRead('events', () => new Promise(resolve => { P.releaseRead = () => resolve({ docs: [1, 2, 3], metadata: { fromCache: false, hasPendingWrites: false } }); }));
          return value.docs;
        } }, { onStatus: text => { document.getElementById('cloudStatus').textContent = text; } });
        void P.engine.start();
        (await import('./js/sync-diagnostics-ui.js')).mountSyncDiagnosticDownload();
      });
      await page.waitForFunction(() => !!P.releaseRead);
      const before = await page.evaluate(async () => ({ state: await P.p.readState(), queue: await P.s.listPending() }));
      await page.locator('#moreBtn').click();
      const downloading = page.waitForEvent('download'); await page.locator('#downloadSyncDiagnostic').click();
      const file = JSON.parse(await readFile(await (await downloading).path(), 'utf8'));
      assert.equal(file.local.localEvents, 2); assert.equal(file.local.pending, 0);
      assert(file.entries.some(e => e.stage === 'firestore.read.start'));
      assert(!file.entries.some(e => e.stage === 'firestore.read.received'));
      assert(!JSON.stringify(file).includes(before.state.currentGameId));
      const after = await page.evaluate(async () => ({ state: await P.p.readState(), queue: await P.s.listPending() }));
      assert.deepEqual(after, before); // exportación sin modificar eventos ni cola
      if (await page.locator('#moreMenu').isVisible()) await page.locator('#moreBtn').click();
      await page.locator('.action-btn').first().click(); await page.locator('[data-points="2"][data-result="fallado"]').click(); await idle(page);
      assert.equal(await page.evaluate(async () => (await P.p.readState()).events.length), 3);
      await page.evaluate(() => P.engine.stop());
      results.push({ browser: name, lostNoticeLocal: 2, lostNoticeVisual: 1, identicalPullDoesNotNotify: true, focusRecovers: true, hungReadObserved: true, downloadReadOnly: true, localWriteWhileReadHung: true, trace: file });
      await context.close();
    } finally { await browser.close(); }
  }
  await writeFile('.test-artifacts/firebase/fase8b4/probes.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.map(({ trace, ...r }) => r)));
} finally { await new Promise(resolve => server.close(resolve)); }
