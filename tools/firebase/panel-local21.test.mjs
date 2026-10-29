// Fase 21: IndexedDB real, dos conexiones por contexto efímero y datos ficticios.
// node tools/firebase/panel-local21.test.mjs [--baseline]
// --baseline sirve únicamente el módulo original de 20.0 para reproducir el defecto.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, idle, createGame } from './browser-support.mjs';
import { server } from '../../tests/diseno-v4/servidor.mjs';
const { webkit } = await import('@playwright/test');
const baseline = process.argv.includes('--baseline');
const original = baseline ? execFileSync('git', ['show', '86cf617:js/configuracion-guardada.js']).toString() : null;
const reports = [];
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const output = new URL('../../.test-artifacts/firebase/fase21/', import.meta.url);
await mkdir(output, { recursive: true });

async function initialize(page) {
  await page.goto(origin + '/tests/diseno-v4/vacia.html');
  await page.evaluate(async () => {
    const p = await import('/js/persistencia.js'), cfg = await import('/js/configuracion-guardada.js');
    const source = await (await import('/js/configuracion.js')).loadConfigurationSource();
    const input = { csvText: source.text, csvConfiguration: source.configuration };
    await p.openDatabase();
    window.T = { p, cfg, load: () => cfg.loadButtonConfiguration(input) };
    T.loaded = await T.load();
    T.game = gid => p.createGameAndSelect({ id: gid, jornada: '21', rival: 'Ficticio F21', createdAt: '2026-10-29T10:00:00Z' });
    T.shot = (gid, id = 'shot-' + gid) => p.addEvent({ id, gameId: gid, categoria: 'Transición',
      accion: 'Bajo aro histórico', categoria_id: 'transicion', accion_id: 'transicion_bajo_aro',
      valor_tiro: 2, resultado: 'fallado', tiros_permitidos: [2], fecha_hora: '2026-10-29T10:01:00Z' });
    T.edit = async (gid, name = 'CAMBIO CON TIRO') => {
      const loaded = T.loaded, doc = structuredClone(loaded.version.doc);
      doc.categories[0].items[0].name = name;
      try {
        const saved = await cfg.saveButtonConfiguration(doc, loaded.record.revision, { gameId: gid, baseVersionId: loaded.version.id });
        return { accepted: true, version: saved.version };
      } catch (error) { return { accepted: false, code: error.code ?? null, message: error.message }; }
    };
    T.rows = () => p.transact(['games', 'events', 'settings'], 'readonly', (tx, done) => {
      const rows = {}; let n = 0;
      for (const key of ['games', 'events', 'settings']) {
        const request = tx.objectStore(key).getAll();
        request.onsuccess = () => { rows[key] = request.result; if (++n === 3) done(rows); };
      }
    });
  });
}

// Barrera solo de prueba: mantiene viva una transacción REAL con peticiones IDB.
// No simula el almacenamiento ni introduce esperas externas en el código probado.
async function holdNext(page, mode) {
  await page.evaluate(mode => {
    const original = IDBDatabase.prototype.transaction;
    window.gate = { held: false, release: false, mode };
    IDBDatabase.prototype.transaction = function(stores, txMode, ...args) {
      const tx = original.call(this, stores, txMode, ...args), names = Array.from(tx.objectStoreNames);
      const match = txMode === mode && (mode === 'readonly'
        ? names.includes('events') && !names.includes('settings')
        : names.includes('settings'));
      if (match) {
        IDBDatabase.prototype.transaction = original;
        gate.held = true;
        const store = tx.objectStore(names[0]);
        const pump = () => { const r = store.get('__f21_keep_alive__'); r.onsuccess = () => { if (!gate.release) pump(); }; };
        pump();
      }
      return tx;
    };
  }, mode);
}
async function observeNextWrite(page) {
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    window.writeCreated = false;
    IDBDatabase.prototype.transaction = function(stores, mode, ...args) {
      const tx = original.call(this, stores, mode, ...args);
      if (mode === 'readwrite') { writeCreated = true; IDBDatabase.prototype.transaction = original; }
      return tx;
    };
  });
}
const startEdit = (page, gid) => page.evaluate(gid => {
  window.pendingSettled = false;
  window.pending = T.edit(gid).then(result => { pendingSettled = true; return result; });
}, gid);
const released = page => page.evaluate(() => { gate.release = true; });

try {
for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  try {
    // v1 antigua sin Sync y v2 actual: no se cambia el esquema de ninguna.
    for (const schema of baseline ? [2] : [1, 2]) {
      const context = await browser.newContext({ viewport: { width: 1180, height: 740 } });
      const errors = [], external = [];
      await context.addInitScript(() => { if (location.protocol === 'http:') localStorage.setItem('defensas-account-mode', 'local'); });
      await context.route(url => url.origin !== origin, route => { external.push(route.request().url()); return route.abort(); });
      if (schema === 1) await context.route('**/js/sync-config.js', route => route.fulfill({ contentType: 'text/javascript',
        body: 'export const syncSettings = Object.freeze({enabled:false, emulator:false, allowRealWrites:false});' }));
      if (baseline) await context.route('**/js/configuracion-guardada.js', route => route.fulfill({ contentType: 'text/javascript', body: original }));
      context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
      try {
        const a = await context.newPage(), b = await context.newPage();
        await initialize(a); await initialize(b);
        const pass = detail => { reports.push({ engine, schema, detail }); console.log(`${engine} v${schema}: ${detail}`); };
        await a.evaluate(async () => { await T.game('with-shot'); await T.shot('with-shot'); });
        const before = await a.evaluate(() => T.rows());
        const denied = await a.evaluate(() => T.edit('with-shot'));
        if (baseline) {
          assert.equal(denied.accepted, true);
          const after = await a.evaluate(() => T.rows());
          assert.deepEqual(after.events, before.events);
          pass(`Fallo 20.0 reproducido: accepted=true, events=${after.events.length}, newPanel=${denied.version.doc.categories[0].items[0].name}`);
          continue;
        }
        assert.equal(denied.code, 'HAS_EVENTS'); assert.match(denied.message, /ya tiene tiros/);
        assert.deepEqual(await a.evaluate(() => T.rows()), before);
        pass('Con tiros: HAS_EVENTS; partido, versiones, asociaciones e históricos idénticos');

        for (const gid of ['missing', 'deleted']) {
          if (gid === 'deleted') await a.evaluate(async gid => { await T.game(gid); await T.p.deleteGame(gid); }, gid);
          const rows = await a.evaluate(() => T.rows());
          assert.equal((await a.evaluate(gid => T.edit(gid), gid)).code, 'GAME_NOT_FOUND');
          assert.deepEqual(await a.evaluate(() => T.rows()), rows);
        }
        pass('Inexistente/eliminado: GAME_NOT_FOUND; sin versiones ni asociaciones nuevas');

        await a.evaluate(() => T.game('empty'));
        const saved = await a.evaluate(() => T.edit('empty', 'Panel vacío válido'));
        assert.equal(saved.accepted, true);
        const validRows = await a.evaluate(() => T.rows());
        await initialize(a);
        assert.deepEqual(await a.evaluate(() => T.rows()), validRows);
        assert.equal(await a.evaluate(async () => T.cfg.versionForGame(T.loaded.record,
          await T.cfg.readGameUsage(), 'empty', false).id), saved.version.id);
        assert.equal(await a.evaluate(async () => (await T.cfg.readGameUsage()).empty.at(-1)), saved.version.id);
        pass('Vacío: versión y asociación coherentes, confirmadas y recuperadas al recargar');

        // Dos conexiones: prelectura vacía, tiro encolado, guardado posterior.
        // Ambas transacciones se solicitan antes de liberar la barrera.
        for (const operation of ['shot', 'delete']) {
          const gid = 'first-' + operation;
          await a.evaluate(async gid => { T.loaded = await T.load(); await T.game(gid); }, gid);
          await holdNext(a, 'readonly'); await startEdit(a, gid);
          await a.waitForFunction(() => gate.held);
          await observeNextWrite(b);
          await b.evaluate(({ gid, operation }) => {
            window.other = operation === 'shot' ? T.shot(gid) : T.p.deleteGame(gid);
          }, { gid, operation });
          await b.waitForFunction(() => writeCreated);
          await released(a);
          await b.evaluate(() => other);
          const rows = await b.evaluate(() => T.rows());
          const result = await a.evaluate(() => pending);
          assert.equal(result.code, operation === 'shot' ? 'HAS_EVENTS' : 'GAME_NOT_FOUND');
          assert.deepEqual(await a.evaluate(() => T.rows()), rows);
          pass(`Carrera ${operation}→panel: transacción concurrente previa respetada (${result.code})`);
        }

        for (const operation of ['shot', 'delete']) {
          const gid = 'panel-first-' + operation;
          await a.evaluate(async gid => { T.loaded = await T.load(); await T.game(gid); }, gid);
          await holdNext(a, 'readwrite'); await startEdit(a, gid);
          await a.waitForFunction(() => gate.held);
          await observeNextWrite(b);
          await b.evaluate(({ gid, operation }) => {
            window.other = operation === 'shot' ? T.shot(gid) : T.p.deleteGame(gid);
          }, { gid, operation });
          await b.waitForFunction(() => writeCreated);
          // La promesa de guardado sigue pendiente mientras su tx está retenida.
          assert.equal(await a.evaluate(() => pendingSettled), false);
          await released(a);
          const result = await a.evaluate(() => pending); assert.equal(result.accepted, true);
          await b.evaluate(() => other);
          if (operation === 'shot') {
            const snapshot = await a.evaluate(gid => T.p.readExportSnapshot(gid), gid);
            assert.equal(snapshot.events.length, 1);
            assert.equal(await a.evaluate(async gid => (await T.cfg.readGameUsage())[gid].at(-1), gid), result.version.id);
          } else assert.equal(await a.evaluate(async gid => (await T.p.readState()).games.some(g => g.id === gid), gid), false);
          pass(`Carrera panel→${operation}: panel válido confirmado antes de la operación concurrente`);
        }

        for (const fault of ['abort', 'request-error']) {
          await a.evaluate(async fault => { T.failureId = 'failure-' + fault; T.loaded = await T.load(); await T.game(T.failureId); }, fault);
          const rows = await a.evaluate(() => T.rows());
          const failure = await a.evaluate(async fault => {
            const put = IDBObjectStore.prototype.put;
            window.configNotifications = 0;
            const onStorage = () => { configNotifications++; };
            const originalSet = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value) { if (key === 'defensas-config-change') onStorage(); return originalSet.call(this, key, value); };
            IDBObjectStore.prototype.put = function(value, ...args) {
              const request = put.call(this, value, ...args);
              if (this.name === 'settings' && value.key === T.cfg.USAGE_KEY) {
                if (fault === 'abort') this.transaction.abort();
                else this.transaction.objectStore('games').add({ id: T.failureId }); // ConstraintError real.
              }
              return request;
            };
            try { return await T.edit(T.failureId); }
            finally { IDBObjectStore.prototype.put = put; Storage.prototype.setItem = originalSet; }
          }, fault);
          assert.equal(failure.accepted, false);
          assert.equal(await a.evaluate(() => configNotifications), 0);
          assert.deepEqual(await a.evaluate(() => T.rows()), rows);
          pass(`${fault}: rollback íntegro tras encolar versión y asociación; sin aviso de guardado`);
        }

        // Estadísticas, CSV e históricos ajenos no cambian ante un rechazo.
        const sports = await a.evaluate(async () => {
          const { summarize, statText } = await import('/js/estadisticas.js');
          const { buildCsv } = await import('/js/exportacion.js');
          const snapshot = await T.p.readExportSnapshot('with-shot');
          const before = { snapshot, stats: summarize(snapshot.events), csv: buildCsv(snapshot.events, snapshot.game) };
          T.loaded = await T.load(); const rejected = await T.edit('with-shot');
          const after = await T.p.readExportSnapshot('with-shot');
          return { before, after: { snapshot: after, stats: summarize(after.events), csv: buildCsv(after.events, after.game) },
            code: rejected.code, text: statText(before.stats) };
        });
        assert.deepEqual(sports.after, sports.before); assert.equal(sports.text, '1–0 · 100%');
        assert.equal(sports.code, 'HAS_EVENTS'); assert(sports.before.csv.startsWith('\uFEFF')); assert(sports.before.csv.includes('Bajo aro histórico'));
        await initialize(a);
        const undo = await a.evaluate(() => T.p.removeLastGameEvent('with-shot'));
        assert.equal(undo.id, 'shot-with-shot');
        const otherEvents = (await a.evaluate(() => T.rows())).events;
        assert.equal((await a.evaluate(() => T.edit('with-shot', 'Permitido tras Deshacer'))).accepted, true);
        assert.deepEqual((await a.evaluate(() => T.rows())).events, otherEvents);
        pass('Estadísticas/CSV idénticos ante rechazo; Deshacer tras recargar permite editar; otros eventos intactos');
        assert.deepEqual(errors, []); assert.deepEqual(external, []);
      } finally { await context.close(); }
    }

    if (!baseline) {
      // Editor real: el tiro llega después de su comprobación previa y antes de la escritura.
      const context = await browser.newContext({ viewport: { width: 1180, height: 740 } });
      const errors = [], external = [];
      await context.addInitScript(() => { if (location.protocol === 'http:') localStorage.setItem('defensas-account-mode', 'local'); });
      await context.route(url => url.origin !== origin, route => { external.push(route.request().url()); return route.abort(); });
      context.on('page', page => page.on('pageerror', e => errors.push(e.message)));
      try {
        const page = await context.newPage(), peer = await context.newPage();
        await page.goto(origin); await idle(page);
        const gid = await createGame(page, 'Editor ficticio F21'); await initialize(peer);
        await page.locator('#moreBtn').click(); await page.locator('#editButtonsBtn').click();
        await page.locator('[data-edit="transicion:items:0"]').click();
        await page.locator('#editNameInput').fill('Borrador rechazado');
        await page.locator('[data-act="close"]').click();
        const rows = await peer.evaluate(() => T.rows());
        await holdNext(page, 'readonly');
        await page.locator('[data-act="done"]').click(); await page.waitForFunction(() => gate.held);
        await observeNextWrite(peer);
        await peer.evaluate(gid => { window.other = T.shot(gid); }, gid);
        await peer.waitForFunction(() => writeCreated); await released(page); await peer.evaluate(() => other);
        await page.locator('.edit-alert').waitFor();
        assert.match(await page.locator('.edit-alert').innerText(), /ya tiene tiros/);
        assert.equal(await page.evaluate(() => document.body.dataset.view), 'editar');
        const after = await peer.evaluate(() => T.rows());
        assert.deepEqual(after.settings, rows.settings); assert.deepEqual(after.games, rows.games);
        await page.locator('[data-act="cancel"]').click(); await page.locator('#confirmAcceptBtn').click();
        await page.waitForFunction(() => document.body.dataset.view === 'registro');
        await page.reload(); await idle(page);
        assert.equal(await page.locator('#registrationView').getByText('Borrador rechazado', { exact: true }).count(), 0);
        assert.equal((await peer.evaluate(gid => T.p.readExportSnapshot(gid), gid)).events.length, 1);
        assert.deepEqual(errors, []); assert.deepEqual(external, []);
        reports.push({ engine, detail: 'Editor: rechazo transaccional visible, borrador descartable, original y tiro conservados al recargar' });
        console.log(engine + ': editor real correcto ante tiro en la ventana entre comprobación y guardado');
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
}
} finally { await new Promise(resolve => server.close(resolve)); }
await writeFile(new URL(baseline ? 'baseline.json' : 'regresion.json', output), JSON.stringify({ ok: true, baseline, reports, realWrites: 0 }, null, 2));
