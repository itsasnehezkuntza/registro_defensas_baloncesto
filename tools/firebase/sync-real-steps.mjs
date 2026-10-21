// Pasos delimitados de la validación real autorizada. Solo el equipo de la sesión.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { firebaseSettings } from '../../js/firebase-config.js';

const idle = page => page.waitForFunction(() => !document.getElementById('gameSelect').disabled);
const state = page => page.evaluate(async () => (await import('./js/persistencia.js')).readState());
async function menu(page) { if (!await page.locator('#moreMenu').isVisible()) await page.locator('#moreBtn').click(); }
async function settled(page) {
  await page.waitForFunction(() => document.getElementById('cloudStatus').textContent === 'Sincronizado', undefined, { timeout: 60000 });
  const pending = await page.evaluate(async () => { const m = await import('./js/sync-storage.js'); return m.listPending(m.storageContext()); });
  assert.equal(pending.length, 0, 'Sincronizado requiere cola vacía');
}
async function count(page, expected) {
  await page.waitForFunction(async n => (await (await import('./js/persistencia.js')).readState()).events.length === n, expected, { timeout: 45000 });
  const current = await state(page); assert.equal(current.events.length, expected);
  assert.equal(new Set(current.events.map(event => event.id)).size, expected, 'IDs duplicados'); return current;
}
async function shot(page, index = 0, result = 'fallado') {
  const before = (await state(page)).events.map(event => event.id);
  const action = await page.locator('.action-btn').nth(index).getAttribute('data-action');
  await page.locator('.action-btn').nth(index).click();
  await page.locator(`[data-points="2"][data-result="${result}"]`).click(); await idle(page);
  const after = await state(page);
  // El otro dispositivo puede aportar un evento durante estas dos pulsaciones.
  const own = after.events.filter(event => !before.includes(event.id) && event.accion_id === action && event.resultado === result);
  assert.equal(own.length, 1, 'Las dos pulsaciones deben añadir un único evento de esta acción');
  assert.match(await page.locator('#saveStatusText').textContent(), /Guardado.*localmente/);
  return own[0].id;
}
async function remote(page, teamId, gameId) {
  return page.evaluate(async ({ teamId, gameId }) => {
    const sdk = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
    const { getApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
    const db = sdk.getFirestore(getApp('defensas-auth'));
    const game = await sdk.getDocFromServer(sdk.doc(db, 'teams', teamId, 'games', gameId));
    const data = game.data();
    if (data.deletedAt != null) return { gameId, deleted: true, deletedAt: data.deletedAt.toMillis() };
    const events = await sdk.getDocsFromServer(sdk.collection(game.ref, 'events'));
    const tombs = await sdk.getDocsFromServer(sdk.collection(game.ref, 'eventDeletions'));
    return { gameId, deleted: false, createdAt: data.createdAt.toMillis(), fromCache: game.metadata.fromCache,
      events: events.docs.map(doc => ({ id: doc.id, createdAt: doc.data().createdAt.toMillis(), fromCache: doc.metadata.fromCache })),
      tombs: tombs.docs.map(doc => ({ id: doc.id, deletedAt: doc.data().deletedAt.toMillis() })) };
  }, { teamId, gameId });
}
async function blockCloud(profile) {
  profile.block = route => route.abort('internetdisconnected');
  await profile.context.route('https://firestore.googleapis.com/**', profile.block);
  await profile.page.evaluate(async () => {
    const sdk = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
    const app = (await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js')).getApp('defensas-auth');
    await sdk.disableNetwork(sdk.getFirestore(app));
  });
}
async function unblockCloud(profile) {
  await profile.context.unroute('https://firestore.googleapis.com/**', profile.block);
  await profile.page.evaluate(async () => {
    const sdk = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
    const app = (await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js')).getApp('defensas-auth');
    await sdk.enableNetwork(sdk.getFirestore(app)); dispatchEvent(new Event('online'));
  });
}
const steps = {
  async create(session) {
    const { profiles: { A, B }, audit } = session;
    const uids = await Promise.all([A, B].map(({ page }) => page.evaluate(async () => (await import('./js/sync-storage.js')).storageContext().uid)));
    assert(uids[0] && uids[0] === uids[1], 'Es necesario el mismo Google real en A y B');
    assert.equal((await state(A.page)).games.length, 0); assert.equal((await state(B.page)).games.length, 0);
    await menu(A.page); A.page.once('dialog', dialog => dialog.accept('PRUEBA 8B'));
    await A.page.locator('#syncCreateTeam').click();
    await A.page.waitForFunction(id => document.getElementById('syncTeam').value === id, audit.teamId);
    await settled(A.page);
    await A.page.locator('#newGameBtn').click();
    await A.page.locator('#roundInput').fill('PRUEBA-8B.1'); await A.page.locator('#rivalInput').fill('Rival ficticio · PRUEBA 8B');
    await A.page.locator('#createGameBtn').click(); await idle(A.page); await settled(A.page);
    audit.gameId = await A.page.locator('#gameSelect').inputValue(); assert(audit.gameId);
    audit.serverReceipts = [await remote(A.page, audit.teamId, audit.gameId)];
    assert.equal(audit.serverReceipts[0].fromCache, false);
    await B.page.reload(); await idle(B.page);
    await B.page.waitForFunction(id => [...document.querySelectorAll('#syncTeam option')].some(option => option.value === id), audit.teamId, { timeout: 45000 });
    await menu(B.page); await B.page.locator('#syncTeam').selectOption(audit.teamId);
    await B.page.waitForFunction(id => [...document.querySelectorAll('#gameSelect option')].some(option => option.value === id), audit.gameId);
    await B.page.locator('#gameSelect').selectOption(audit.gameId); await idle(B.page); await settled(B.page);
    const recovered = await state(B.page); assert.equal(recovered.games[0].jornada, 'PRUEBA-8B.1');
    return { teamId: audit.teamId, gameId: audit.gameId, teamAndOwnerBatchConfirmed: true, BRecoveredGame: true };
  },
  async transfer({ profiles: { A, B }, audit }) {
    audit.createdEventIds = [];
    for (let i = 0; i < 3; i++) audit.createdEventIds.push(await shot(A.page, i, i % 2 ? 'anotado' : 'fallado'));
    await settled(A.page); await count(B.page, 3); await settled(B.page);
    const receipt = await remote(A.page, audit.teamId, audit.gameId); audit.serverReceipts.push(receipt);
    assert.deepEqual(receipt.events.map(e => e.id).sort(), audit.createdEventIds.slice().sort());
    assert(receipt.events.every(e => e.createdAt > 0 && !e.fromCache));
    return { recoveredInB: 3, serverDocuments: 3, duplicates: 0 };
  },
  async concurrent({ profiles: { A, B }, audit }) {
    const ids = await Promise.all([shot(A.page, 1), shot(B.page, 2, 'anotado')]);
    audit.createdEventIds.push(...ids);
    await count(A.page, 5); await count(B.page, 5); await settled(A.page); await settled(B.page);
    const receipt = await remote(A.page, audit.teamId, audit.gameId); audit.serverReceipts.push(receipt);
    assert.deepEqual(receipt.events.map(e => e.id).sort(), audit.createdEventIds.slice().sort());
    return { liveEventsInBoth: 5, duplicates: 0, lostEvents: 0 };
  },
  async offline({ profiles: { A, B }, audit }) {
    await blockCloud(B);
    const id = await shot(B.page, 0, 'anotado'); audit.createdEventIds.push(id);
    const pending = await B.page.evaluate(async () => { const m = await import('./js/sync-storage.js'); return m.listPending(m.storageContext()); });
    assert(pending.some(op => op.eventId === id));
    assert.notEqual(await B.page.locator('#cloudStatus').textContent(), 'Sincronizado');
    await count(A.page, 5);
    audit.offlineStatesBeforeReload = await B.page.evaluate(() => __realSyncTest.states);
    await B.page.reload(); await idle(B.page);
    await B.page.waitForFunction(async () => !!(await import('./js/sync-storage.js')).storageContext().scope);
    await count(B.page, 6);
    const afterReload = await B.page.evaluate(async () => { const m = await import('./js/sync-storage.js'); return m.listPending(m.storageContext()); });
    assert(afterReload.some(op => op.eventId === id), 'La cola debe sobrevivir a recarga');
    await unblockCloud(B); await settled(B.page); await count(A.page, 6); await settled(A.page);
    const receipt = await remote(A.page, audit.teamId, audit.gameId); audit.serverReceipts.push(receipt);
    assert.deepEqual(receipt.events.map(e => e.id).sort(), audit.createdEventIds.slice().sort());
    return { cloudConnectionBlocked: true, localhostKeptAvailableForReload: true, pendingSurvivedReload: true, serverDocuments: 6 };
  },
  async undo({ profiles: { A, B }, audit }) {
    const before = await state(A.page); audit.undoneEventId = before.events.at(-1).id;
    await A.page.locator('#undoBtn').click(); await idle(A.page);
    await settled(A.page); await count(B.page, 5); await settled(B.page);
    const receipt = await remote(A.page, audit.teamId, audit.gameId); audit.serverReceipts.push(receipt);
    assert(receipt.tombs.some(tomb => tomb.id === audit.undoneEventId));
    assert.equal(receipt.events.length, 6, 'El evento original se conserva inmutable, oculto por su lápida');
    await B.page.reload(); await idle(B.page); await settled(B.page);
    const current = await count(B.page, 5); assert(!current.events.some(event => event.id === audit.undoneEventId));
    return { liveEvents: 5, immutableEvents: 6, eventTombstones: 1, resurrected: false };
  },
  async security({ profiles: { A }, audit }) {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/registro-defensivo/databases/(default)/documents/teams/${audit.teamId}/games/${audit.gameId}`);
    url.searchParams.set('key', firebaseSettings.config.apiKey);
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    assert.equal(response.status, 403); assert.equal(body.error.status, 'PERMISSION_DENIED');
    // Ruta nueva sin datos: no se lee ningún equipo real de terceros.
    const denied = await A.page.evaluate(async missingTeam => {
      const sdk = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      const app = (await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js')).getApp('defensas-auth');
      try { await sdk.getDocFromServer(sdk.doc(sdk.getFirestore(app), 'teams', missingTeam, 'games', 'ficticio')); return 'ALLOWED'; }
      catch (error) { return error.code; }
    }, audit.teamId + '-no-creado');
    assert.equal(denied, 'permission-denied');
    return { unauthenticatedPrivateGame: 'DENIED', unownedNewPath: denied, otherRealTeamsAccessed: false,
      differentAuthenticatedAccount: 'PENDING_MANUAL_SECOND_ACCOUNT' };
  },
  async deletion({ profiles: { A, B }, audit }) {
    await blockCloud(B); audit.staleEventId = await shot(B.page, 0);
    await menu(A.page); await A.page.locator('#deleteGameBtn').click(); await A.page.locator('#confirmDeleteBtn').click(); await idle(A.page); await settled(A.page);
    const receipt = await remote(A.page, audit.teamId, audit.gameId); audit.serverReceipts.push(receipt); assert(receipt.deleted);
    await unblockCloud(B); await settled(B.page);
    await B.page.waitForFunction(async () => !(await (await import('./js/persistencia.js')).readState()).games.length);
    await B.page.reload(); await idle(B.page); await settled(B.page);
    assert.equal((await state(A.page)).games.length, 0); assert.equal((await state(B.page)).games.length, 0);
    return { serverGameTombstone: true, bothDevicesHideGame: true, lateOfflineEventResurrected: false };
  },
  async logout({ profiles: { B } }) {
    await menu(B.page); await B.page.locator('#googleLogout').click(); await idle(B.page);
    await B.page.waitForFunction(async () => !(await import('./js/sync-storage.js')).storageContext().uid);
    assert.equal((await state(B.page)).games.length, 0);
    return { BLoggedOut: true, cloudCopiesHidden: true, localRegistrationAvailable: await B.page.locator('#newGameBtn').isEnabled() };
  },
  async inventory({ profiles: { A, B }, audit }) {
    const receipt = await remote(A.page, audit.teamId, audit.gameId);
    for (const [label, { page }] of Object.entries({ A, B })) {
      audit.profiles[label].observedStates = await page.evaluate(() => __realSyncTest.states);
      await page.screenshot({ path: join(audit.outputDir, 'final-' + label + '.png'), fullPage: true });
    }
    return { teamId: audit.teamId, gameId: audit.gameId, parent: receipt,
      knownImmutableEventIds: audit.createdEventIds, knownEventDeletion: audit.undoneEventId,
      staleEventNotAcceptedUnderDeletedParent: audit.staleEventId, physicalCleanupPerformed: false };
  }
};
const order = ['create', 'transfer', 'concurrent', 'offline', 'undo', 'security', 'deletion', 'logout', 'inventory'];
export async function runStep(name, session) {
  if (!steps[name]) throw Error('Paso desconocido: ' + name);
  if (session.audit.stopped) throw Error('STOP: sesión detenida; conservar datos y revisar.');
  const expected = order[session.audit.steps.length];
  if (name !== expected) throw Error('Paso requerido antes de continuar: ' + expected);
  try {
    session.audit.outputDir = session.out;
    const result = await steps[name](session);
    session.audit.steps.push({ name, at: new Date().toISOString(), ok: true, result }); await session.save(); return result;
  } catch (error) {
    session.audit.stopped = true;
    session.audit.steps.push({ name, at: new Date().toISOString(), ok: false, error: error.message });
    // Conserva los perfiles en disco; no vacía IndexedDB ni fuerza reenvíos.
    for (const [label, profile] of Object.entries(session.profiles)) {
      await profile.context.route('https://firestore.googleapis.com/**', route => route.abort()).catch(() => {});
      const copy = await profile.page.evaluate(async () => {
        const m = await import('./js/persistencia.js');
        return m.transact(['cloudGames', 'cloudEvents', 'cloudTombs', 'syncQueue', 'syncBindings'], 'readonly', (tx, done) => {
          const result = {}; const stores = ['cloudGames', 'cloudEvents', 'cloudTombs', 'syncQueue', 'syncBindings']; let remaining = stores.length;
          for (const store of stores) { const request = tx.objectStore(store).getAll(); request.onsuccess = () => { result[store] = request.result; if (!--remaining) done(result); }; }
        });
      }).catch(() => ({ error: 'No se pudo capturar la copia; perfil conservado.' }));
      await writeFile(join(session.out, 'retained-' + label + '.json'), JSON.stringify(copy, null, 2));
    }
    await session.save(); throw error;
  }
}
