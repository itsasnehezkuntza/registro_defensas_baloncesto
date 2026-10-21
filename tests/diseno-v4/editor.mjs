// Edición del panel (Fases 9B–9D): integridad de datos, migración, configuración por partido,
// dos pestañas y capturas. Contextos efímeros de Chromium, datos ficticios y sin red externa.
// Uso: node tests/diseno-v4/editor.mjs
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { server } from './servidor.mjs';

const dir = new URL('./', import.meta.url), root = new URL('../../', import.meta.url);
const BASE = 'http://127.0.0.1:4194';
process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('.test-artifacts/playwright/browsers', root));
const { chromium } = await import('@playwright/test');
await mkdir(new URL('capturas/', dir), { recursive: true });
const report = { fecha: new Date().toISOString(), comprobaciones: [] };
const ok = text => { report.comprobaciones.push(text); console.log('✓ ' + text); };
const shot = (page, name, fullPage = false) => page.screenshot({ path: fileURLToPath(new URL(`capturas/editor-${name}.png`, dir)), fullPage, animations: 'disabled' });
const idle = page => page.waitForFunction(() => !document.querySelector('#gameSelect').disabled);
const allEvents = page => page.evaluate(async () => { const s = await import('/js/persistencia.js'); await s.openDatabase(); return s.allEvents(); });
const readSetting = (page, key) => page.evaluate(async key => new Promise(resolve => {
  const r = indexedDB.open('registro_defensivo_baloncesto');
  r.onsuccess = () => { const g = r.result.transaction('settings').objectStore('settings').get(key); g.onsuccess = () => { resolve(g.result?.value ?? null); r.result.close(); }; };
}), key);
const record = page => readSetting(page, 'configuracionBotones');
async function isolated(browser, viewport = { width: 1180, height: 740 }) {
  const context = await browser.newContext({ viewport, hasTouch: true, locale: 'es-ES', reducedMotion: 'reduce', acceptDownloads: true });
  // Fase 10: usuario que ya eligió «Continuar sin cuenta».
  await context.addInitScript(() => { try { localStorage.setItem('defensas-account-mode', 'local'); } catch {} });
  await context.route(url => !url.href.startsWith(BASE), route => route.abort());
  return context;
}
const ready = page => page.waitForFunction(() => document.querySelector('.edit-add small') && !document.querySelector('.edit-add small').textContent.includes('Calculando'));
async function openEditor(page) {
  await page.locator('#moreBtn').click(); await page.locator('#editButtonsBtn').click();
  await page.waitForSelector('#editorView:not([hidden]) .edit-tile');
  await ready(page);
}
const pick = (page, key) => page.locator(`[data-edit="${key}"]`).click();
const listo = page => page.locator('[data-act="close"]').click();
async function rename(page, key, name) { await pick(page, key); await page.locator('#editNameInput').fill(name); await listo(page); }
async function quitar(page, key, expected) {
  await pick(page, key); await page.locator('[data-act="remove"]').click();
  assert.match(await page.locator('.edit-warn').innerText(), expected);
  await page.locator('[data-act="confirm-remove"]').click();
}
async function add(page, list, name) {
  await ready(page);
  await page.waitForFunction(l => { const b = document.querySelector(`.edit-add[data-list="${l}"]`); return b && !b.disabled; }, list);
  await page.locator(`.edit-add[data-list="${list}"]`).click();
  await page.locator('#editNameInput').fill(name);
}
async function shoot(page, action, defense, points, result) {
  await page.locator(`#registrationView [data-action="${action}"]${defense ? `[data-strategy="${defense}"]` : ''}`).click();
  await page.locator(`.result-btn[data-points="${points}"][data-result="${result}"]`).click(); await idle(page);
}
const names = page => page.locator('#registrationView .action-name').allTextContents();

await new Promise((resolve, fail) => { server.once('error', fail); server.listen(4194, '127.0.0.1', resolve); });
let browser;
try {
  browser = await chromium.launch();
  const context = await isolated(browser);
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));

  // 1. Migración conservadora desde una base existente (v1, sin configuración guardada).
  await page.goto(BASE + '/tests/diseno-v4/vacia.html'); // Mismo origen, sin abrir la aplicación.
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('registro_defensivo_baloncesto', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('games', { keyPath: 'id' });
      const events = db.createObjectStore('events', { keyPath: 'seq', autoIncrement: true });
      events.createIndex('byGameId', 'gameId'); events.createIndex('byGameSeq', ['gameId', 'seq']); events.createIndex('byUuid', 'id', { unique: true });
      db.createObjectStore('settings', { keyPath: 'key' });
    };
    request.onsuccess = () => {
      const tx = request.result.transaction(['games', 'events', 'settings'], 'readwrite');
      tx.objectStore('games').put({ id: 'g-antiguo', jornada: '1', rival: 'Antiguo', createdAt: '2026-01-01T00:00:00Z' });
      tx.objectStore('games').put({ id: 'g-actual', jornada: '2', rival: 'Actual', createdAt: '2026-02-01T00:00:00Z' });
      const add = e => tx.objectStore('events').add(e);
      add({ id: 'v1-1', gameId: 'g-antiguo', categoria: 'Transición', accion: 'Bajo aro', valor_tiro: 2, resultado: 'fallado', fecha_hora: '2026-01-01T10:00:00Z' });
      add({ id: 'v1-2', gameId: 'g-antiguo', categoria: 'Bloqueo directo', accion: 'PR Roller', tipo_bloqueo: 'PR Roller', estrategia: 'Blue', valor_tiro: 2, resultado: 'anotado', fecha_hora: '2026-01-01T10:01:00Z' });
      for (const [i, [accion, res, valor]] of [['estatico_pin_down', 'anotado', 3], ['estatico_pin_down', 'fallado', 2], ['transicion_bajo_aro', 'anotado', 2]].entries()) {
        const category = accion.startsWith('estatico') ? ['estatico', 'Estático'] : ['transicion', 'Transición'];
        add({ id: `m-${i}`, gameId: 'g-actual', jornada: '2', rival: 'Actual', categoria_id: category[0], categoria: category[1], accion_id: accion,
          accion: accion === 'estatico_pin_down' ? 'Pin down' : 'Bajo aro', defensa_id: null, estrategia: null, tipo_bloqueo: null,
          tiros_permitidos: [2, 3], valor_tiro: valor, resultado: res, fecha_hora: `2026-02-01T10:0${i}:00Z` });
      }
      tx.objectStore('settings').put({ key: 'activeGame', value: 'g-actual' });
      tx.oncomplete = () => { request.result.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  }));
  const before = await allEvents(page);
  await page.goto(BASE + '/'); await idle(page);
  const migrated = await record(page);
  assert(migrated && migrated.versions.length === 1 && migrated.versions[0].source === 'csv' && migrated.baselineId === migrated.currentId, 'No se creó la configuración inicial');
  assert(['transicion_bajo_aro', 'spain'].every(id => migrated.usedIds.actions.includes(id)) && ['black', 'tut'].every(id => migrated.usedIds.defenses.includes(id)), 'IDs heredados no reservados');
  assert.deepEqual(await allEvents(page), before, 'La migración alteró eventos');
  assert.equal(await page.locator('[data-action="estatico_pin_down"] .action-score').textContent(), '1/2');
  assert.equal(await page.locator('#gameTotal').textContent(), 'Anotados/intentos · 2/3');
  assert.equal(await page.locator('#scoreboardValue').textContent(), '5/7');
  await page.reload(); await idle(page);
  assert.equal((await record(page)).revision, migrated.revision, 'Recargar crea versiones nuevas');
  ok('Migración: base v1 con partidos y eventos ficticios → configuración inicial en «settings» sin cambiar versión ni eventos; IDs heredados reservados; marcador 5/7 y anotados/intentos; recargar no duplica versiones');

  // 2. Con tiros no se puede editar el panel; en un partido nuevo sí (estilo del lienzo).
  const tab = await context.newPage(); await tab.goto(BASE + '/'); await idle(tab);
  await page.locator('#moreBtn').click();
  assert(await page.locator('#editButtonsBtn').isDisabled(), 'Se podía editar el panel de un partido con tiros');
  assert.match(await page.locator('#editLockNote').innerText(), /Deshaz sus tiros, elimina el partido o crea uno nuevo/);
  await shot(page, '1180x740-bloqueado');
  await page.keyboard.press('Escape');
  await page.goto(BASE + '/#editar'); await idle(page);
  await page.waitForFunction(() => document.body.dataset.view === 'registro');
  assert.match(await page.locator('#feedback').textContent(), /no se puede cambiar/);
  await page.locator('#newGameBtn').click(); await page.locator('#roundInput').fill('3'); await page.locator('#rivalInput').fill('Editable'); await page.locator('#createGameBtn').click(); await idle(page);
  const editable = await page.locator('#gameSelect').inputValue();
  await openEditor(page);
  assert.match(await page.locator('.edit-game').innerText(), /3 · Editable/);
  assert.equal(await page.locator('.edit-meter, [data-act="restore"]').count(), 0, 'Quedan el medidor de filas o Restaurar');
  assert(!(await page.locator('.edit-add[data-list="directo:defenses"]').isDisabled()), 'Con 8 defensas ya no se puede añadir (el límite es 12)');
  await shot(page, '1180x740-modo-edicion');
  await rename(page, 'transicion:items:0', 'Cerca del aro');
  await pick(page, 'estatico:items:3'); await page.locator('[data-act="back"]').click(); await listo(page); // Cortes antes que Pin down.
  assert.equal(await page.locator('[data-edit="estatico:items:3"] .action-name').textContent(), 'Pin down');
  await quitar(page, 'estatico:items:3', /No se podrá recuperar\. Sus 2 tiros de otros partidos se conservan/); // Tiene tiros en otro partido: se retira.
  await quitar(page, 'directo:defenses:7', /No se podrá recuperar\.$/); // Quick+Under sin tiros: se borra.
  await quitar(page, 'estatico:items:6', /No se podrá recuperar\.$/); // Spain sin tiros: se borra.
  await add(page, 'estatico:items', 'Flex');
  await page.locator('[data-act="shot"][data-shot="3"]').click(); // Flex solo admite 2.
  await shot(page, '1180x740-boton-elegido');
  await listo(page);
  await add(page, 'directo:defenses', 'Ice'); await listo(page);
  // Atrás con cambios: pide confirmación y se queda en el editor.
  await page.goBack(); await page.waitForSelector('#confirmDialog[open]');
  await page.locator('#confirmCancelBtn').click();
  assert(await page.locator('#editorView').isVisible(), 'Salió con cambios sin guardar');
  await page.locator('[data-act="done"]').click();
  await page.waitForFunction(() => document.body.dataset.view === 'registro');
  const saved = await record(page), usage = await readSetting(page, 'configuracionPorPartido');
  const version = saved.versions.at(-1), doc = version.doc;
  assert.equal(saved.versions.length, 2); assert.equal(saved.currentId, version.id);
  assert.equal(usage[editable].at(-1), version.id, 'El partido no recibió su configuración');
  const fixedDoc = doc.categories.find(c => c.id === 'estatico').items;
  assert.deepEqual(fixedDoc.map(i => i.id), ['estatico_1c1_exterior', 'estatico_1c1_interior', 'estatico_cortes', 'estatico_pin_down', 'estatico_spot_up_3', 'estatico_bajo_aro', 'estatico_flex']);
  assert(fixedDoc.find(i => i.id === 'estatico_pin_down').retired);
  assert.deepEqual(fixedDoc.find(i => i.id === 'estatico_flex').shots, [2]);
  const defensesDoc = doc.categories.find(c => c.id === 'directo').defenses;
  assert(defensesDoc.some(d => d.id === 'ice') && !defensesDoc.some(d => d.id === 'quick_under'));
  assert(saved.usedIds.actions.includes('estatico_spain') && saved.usedIds.defenses.includes('quick_under'), 'Borrados sin reservar su ID');
  assert.deepEqual(await allEvents(page), before, 'Guardar alteró eventos');
  assert.equal(await page.locator('[data-action="transicion_bajo_aro"] .action-name').textContent(), 'Cerca del aro');
  assert.equal(await page.locator('[data-action="estatico_pin_down"]').count(), 0, 'Quitado sigue en el Registro');
  assert.equal(await page.locator('[data-defense-heading="ice"]').count(), 1);
  await tab.waitForFunction(() => document.querySelector('[data-action="estatico_flex"]') && !document.querySelector('[data-action="estatico_pin_down"]'));
  ok('Con tiros «Editar panel» está bloqueado con la explicación (también al recargar en #editar); en un partido sin tiros: partido en la cabecera, sin medidor ni Restaurar; renombrar, mover, quitar (retirado si tiene tiros en otros partidos, borrado con ID reservado si no), añadir Flex (solo 2) e Ice; añadir defensas por encima de 8; Atrás con cambios pide confirmación; guardado atómico asignado al partido; eventos idénticos; la otra pestaña se actualiza');
  await shot(page, '1180x740-registro-editado');

  // 3. Registrar bloquea el panel; deshacer todos los tiros lo desbloquea. CSV y Estadísticas.
  await shoot(page, 'estatico_flex', null, 2, 'anotado');
  assert(await page.locator('.result-btn[data-points="3"]').first().isDisabled(), 'Flex permite 3');
  assert.equal((await allEvents(page)).at(-1).accion, 'Flex');
  assert(await page.locator('#editButtonsBtn').isDisabled(), 'Con un tiro el panel sigue editable');
  await page.locator('#undoBtn').click(); await idle(page);
  assert(!(await page.locator('#editButtonsBtn').isDisabled()), 'Deshacer todos los tiros no desbloquea el panel');
  assert.deepEqual(await allEvents(page), before, 'Deshacer no eliminó el último');
  await shoot(page, 'pr_roller', 'ice', 2, 'fallado');
  await shoot(page, 'transicion_bajo_aro', null, 2, 'anotado');
  const download = page.waitForEvent('download');
  await page.locator('#moreBtn').click(); await page.locator('#exportCsvBtn').click();
  const csv = (await readFile(await (await download).path())).toString('utf8');
  assert(['"Cerca del aro"', '"Ice"'].every(name => csv.includes(name)) && csv.trim().split(/\r?\n/).length === 3, 'CSV del partido incorrecto');
  await page.locator('#viewStatsBtn').click(); await page.waitForFunction(() => document.body.dataset.view === 'estadisticas');
  assert.equal(await page.locator('#statsResults').textContent(), '1/2', 'Estadísticas no está en anotados/intentos');
  assert.equal(await page.locator('#statsPoints').textContent(), '2/4');
  const ranking = await page.locator('.ranking-name').allInnerTexts();
  assert(ranking.some(n => /Flex/i.test(n)) && !ranking.some(n => /Pin down/i.test(n)), 'Ranking con elemento quitado sin tiros en este partido');
  assert((await page.locator('.analysis-matrix thead').innerText()).includes('ICE'));
  await shot(page, '1180x740-estadisticas-editado', true);
  ok('Un tiro bloquea el panel y deshacerlo lo desbloquea; Flex solo 2; CSV del partido con los nombres nuevos; Estadísticas en anotados/intentos (1/2) y marcador de puntos (2/4)');

  // 4. Cada partido conserva su panel; uno nuevo recibe el último.
  await page.locator('#viewRecordBtn').click();
  await page.locator('#gameSelect').selectOption('g-antiguo'); await idle(page);
  assert.deepEqual(await names(page), ['Bajo aro', 'Spot up 3', '1c1 exterior', '1c1 interior', 'Pin down', 'Cortes', 'Spot up 3', 'Of. Screen', 'Spain'], 'El partido antiguo no conserva su panel');
  assert.equal(await page.locator('[data-defense-heading="ice"]').count(), 0);
  await shoot(page, 'estatico_pin_down', null, 3, 'anotado'); // Sigue registrando con su propio panel.
  await page.locator('#gameSelect').selectOption('g-actual'); await idle(page);
  assert((await names(page)).includes('Pin down') && (await names(page)).includes('Bajo aro'));
  await page.locator('#newGameBtn').click(); await page.locator('#roundInput').fill('4'); await page.locator('#rivalInput').fill('Nuevo'); await page.locator('#createGameBtn').click(); await idle(page);
  assert((await names(page)).includes('Flex') && !(await names(page)).includes('Pin down'), 'El partido nuevo no recibió la última configuración');
  ok('Cada partido usa su panel: los antiguos siguen con el suyo y registran con él; un partido nuevo recibe la última configuración');

  // 5. Cancelar; conflicto entre pestañas; otra pestaña registra mientras se edita → Hecho rechazado.
  const revision = (await record(page)).revision;
  await openEditor(page);
  await rename(page, 'transicion:items:0', 'No guardar');
  await page.locator('[data-act="cancel"]').click(); await page.locator('#confirmAcceptBtn').click();
  await page.waitForFunction(() => document.body.dataset.view === 'registro');
  assert.equal((await record(page)).revision, revision, 'Cancelar guardó cambios');
  await idle(tab); await openEditor(tab);
  await openEditor(page);
  await rename(page, 'transicion:items:0', 'Bajo aro A');
  await page.locator('[data-act="done"]').click(); await page.waitForFunction(() => document.body.dataset.view === 'registro');
  await rename(tab, 'transicion:items:0', 'Bajo aro B');
  await tab.locator('[data-act="done"]').click();
  await tab.waitForSelector('.edit-alert');
  assert.match(await tab.locator('.edit-alert').innerText(), /otra pestaña/);
  await tab.locator('[data-act="cancel"]').click(); await tab.locator('#confirmAcceptBtn').click();
  await tab.waitForFunction(() => document.body.dataset.view === 'registro');
  await openEditor(page);
  await rename(page, 'transicion:items:0', 'Tarde');
  await shoot(tab, 'estatico_flex', null, 2, 'fallado');
  await page.waitForFunction(() => document.querySelector('#editorView'));
  await page.locator('[data-act="done"]').click();
  await page.waitForSelector('.edit-alert');
  assert.match(await page.locator('.edit-alert').innerText(), /ya tiene tiros/);
  const unchanged = await record(page);
  assert.equal(unchanged.versions.at(-1).doc.categories[0].items[0].name, 'Bajo aro A', 'Se guardó un panel con tiros registrados');
  await page.locator('[data-act="cancel"]').click(); await page.locator('#confirmAcceptBtn').click();
  ok('Cancelar con cambios pide confirmación y no guarda; dos editores a la vez: el segundo «Hecho» se rechaza; si otra pestaña registra un tiro mientras se edita, «Hecho» se rechaza con la explicación');

  // 6. No se puede añadir lo que no cabe: «Añadir» se desactiva antes de llegar.
  await page.locator('#newGameBtn').click(); await page.locator('#roundInput').fill('5'); await page.locator('#rivalInput').fill('Lleno'); await page.locator('#createGameBtn').click(); await idle(page);
  await openEditor(page);
  let added = 0;
  while (added < 20 && !(await page.locator('.edit-add[data-list="estatico:items"]').isDisabled())) { await add(page, 'estatico:items', `Jugada ${added + 1}`); await listo(page); added++; await ready(page); }
  const reason = await page.locator('.edit-add[data-list="estatico:items"] small').innerText();
  assert(/Máximo 12|No cabe sin deslizar/.test(reason), reason);
  let types = 0;
  while (types < 10 && !(await page.locator('.edit-add[data-list="directo:types"]').isDisabled())) { await add(page, 'directo:types', `Bloqueo ${types + 1}`); await listo(page); types++; await ready(page); }
  const typeReason = await page.locator('.edit-add[data-list="directo:types"] small').innerText();
  assert(/Máximo 8|No cabe sin deslizar/.test(typeReason), typeReason);
  let defenses = 0;
  while (defenses < 6 && !(await page.locator('.edit-add[data-list="directo:defenses"]').isDisabled())) { await add(page, 'directo:defenses', `Defensa ${defenses + 1}`); await listo(page); defenses++; await ready(page); }
  const defenseReason = await page.locator('.edit-add[data-list="directo:defenses"] small').innerText();
  assert(/Máximo 12|No cabe sin deslizar/.test(defenseReason), defenseReason);
  await shot(page, '1180x740-lleno-edicion');
  await page.locator('[data-act="done"]').click(); await page.waitForFunction(() => document.body.dataset.view === 'registro');
  await page.evaluate(() => new Promise(requestAnimationFrame));
  const big = await page.evaluate(() => ({ scroll: document.documentElement.scrollHeight > innerHeight + 1, fits: document.querySelector('#registrationView').dataset.fits }));
  assert(!big.scroll && big.fits === 'true', 'Lo permitido por el editor no cabe en el Registro: ' + JSON.stringify(big));
  await shot(page, '1180x740-registro-lleno');
  ok(`Añadir se desactiva al llegar al límite (${added} acciones más en Estático: «${reason}»; ${types} tipos más: «${typeReason}»; ${defenses} defensas más: «${defenseReason}»); lo guardado cabe sin desplazar`);
  assert.deepEqual(errors, []);
  await context.close();

  // 7. Capturas del modo edición en otros tamaños.
  for (const [width, height] of [[1133, 670], [820, 1180], [390, 844]]) {
    const ctx = await isolated(browser, { width, height });
    const p = await ctx.newPage();
    await p.goto(BASE + '/'); await idle(p);
    await p.locator('#newGameBtn').click(); await p.locator('#roundInput').fill('3'); await p.locator('#rivalInput').fill('Ficticio'); await p.locator('#createGameBtn').click(); await idle(p);
    await openEditor(p);
    await shot(p, `${width}x${height}`, width < 700);
    await pick(p, 'directo:types:1');
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const small = await p.locator('#editorView button:visible').evaluateAll(list => list.filter(el => !el.closest('.edit-shots-group'))
      .filter(el => { const r = el.getBoundingClientRect(); return r.width < 43.5 || r.height < 43.5; }).map(el => el.className || el.dataset.act));
    assert(!overflow, `${width}: scroll horizontal`);
    assert.deepEqual(small, [], `${width}: controles pequeños`);
    if (width >= 700) assert.equal(await p.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1), false, `${width}: el modo edición desplaza`);
    await shot(p, `${width}x${height}-elegido`, width < 700);
    await ctx.close();
  }
  ok('Modo edición sin scroll horizontal, sin desplazamiento en iPad y con controles ≥ 44 px en 1133×670, 820×1180 y 390×844 (capturas)');
} finally {
  await browser?.close(); server.close();
  await writeFile(new URL('editor.json', dir), JSON.stringify(report, null, 2));
}
