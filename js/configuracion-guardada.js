// Configuración de botones editable, local o por cuenta/equipo (Fases 9B y 14).
// categorias.csv sigue siendo la configuración inicial.
// Se guarda en el almacén «settings» existente: no cambia la versión ni el esquema de IndexedDB.
// Las versiones inmutables conservan ID, fecha y origen al sincronizarse.
import { transact, allEvents } from './persistencia.js';
import { eventIdentity, legacyIdentityIds } from './identidad.js';
import { storageContext, assertContext, guardLegacyGame, SYNC_STORES, queuePanel, configEvents } from './sync-storage.js';
import { panelKey, panelSnapshot, mergePanelRecord, PANEL_DEFAULT } from './panel-model.js';

export const CONFIG_KEY = 'configuracionBotones';
export const USAGE_KEY = 'configuracionPorPartido';
export const CONFIG_SCHEMA = 1;
export const SECTION_IDS = ['transicion', 'estatico', 'directo'];
export const MAX_NAME = 40;
const SHOTS = [2, 3];

const clone = value => structuredClone(value);
const sameShots = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const normalizeShots = list => SHOTS.filter(v => list.includes(v));
export const intersectShots = (a, b) => normalizeShots(a.filter(v => b.includes(v)));
const cellKey = (typeId, defenseId) => `${typeId}/${defenseId}`;

// Huella estable del texto CSV para detectar cambios del archivo (FNV-1a de 32 bits).
export function textHash(text) {
  let hash = 0x811c9dc5;
  for (const ch of String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n')) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// Documento editable a partir de la configuración leída del CSV (misma forma que parseConfiguration).
export function docFromConfiguration(configuration) {
  const byId = new Map(configuration.categories.map(c => [c.id, c]));
  const categories = SECTION_IDS.map(id => {
    const source = byId.get(id);
    const name = source?.name ?? { transicion: 'Transición', estatico: 'Estático', directo: 'Bloqueo directo' }[id];
    if (id !== 'directo') {
      return { id, name, items: (source?.actions ?? []).map(a => ({ id: a.id, name: a.name, shots: normalizeShots(a.shots), retired: false })) };
    }
    const types = [], defenses = new Map(), offered = new Map();
    for (const action of source?.actions ?? []) {
      const union = new Set();
      for (const d of action.defenses) {
        d.shots.forEach(v => union.add(v));
        if (!defenses.has(d.id)) defenses.set(d.id, { id: d.id, name: d.name, shots: new Set(), retired: false });
        d.shots.forEach(v => defenses.get(d.id).shots.add(v));
        offered.set(cellKey(action.id, d.id), normalizeShots(d.shots));
      }
      types.push({ id: action.id, name: action.name, shots: normalizeShots([...union]), retired: false });
    }
    const defenseList = [...defenses.values()].map(d => ({ ...d, shots: normalizeShots([...d.shots]) }));
    // Excepciones por celda solo si el CSV no sigue la regla tipo ∩ defensa (o falta la combinación).
    const cells = {};
    for (const type of types) for (const defense of defenseList) {
      const key = cellKey(type.id, defense.id), actual = offered.get(key) ?? [];
      if (!sameShots(actual, intersectShots(type.shots, defense.shots))) cells[key] = actual;
    }
    return { id, name, types, defenses: defenseList, cells };
  });
  return { schema: CONFIG_SCHEMA, categories };
}

export const cellShots = (section, type, defense) =>
  section.cells?.[cellKey(type.id, defense.id)] ?? intersectShots(type.shots, defense.shots);

// Configuración de ejecución (solo elementos activos) con la forma que ya usan Registro y Estadísticas.
export function configurationFromDoc(doc) {
  const categories = [];
  for (const section of doc.categories) {
    if (section.id !== 'directo') {
      const actions = section.items.filter(i => !i.retired)
        .map(i => ({ id: i.id, categoryId: section.id, name: i.name, shots: [...i.shots], defenses: [] }));
      if (actions.length) categories.push({ id: section.id, name: section.name, actions });
      continue;
    }
    const defenses = section.defenses.filter(d => !d.retired);
    const actions = section.types.filter(t => !t.retired).map(type => ({
      id: type.id, categoryId: 'directo', name: type.name, shots: [...type.shots],
      defenses: defenses.map(d => ({ id: d.id, name: d.name, shots: cellShots(section, type, d) })).filter(d => d.shots.length)
    })).filter(a => a.defenses.length);
    if (actions.length) categories.push({ id: 'directo', name: section.name, actions });
  }
  return { categories };
}

// Errores que impiden guardar (la comprobación de espacio la hace el editor en el DOM).
export function validateDoc(doc) {
  const errors = [];
  const check = (list, label, section) => {
    const active = list.filter(i => !i.retired);
    if (!active.length) errors.push(`${section}: necesita al menos ${label === 'defensa' ? 'una defensa' : label === 'tipo' ? 'un tipo de bloqueo' : 'una acción'} activa.`);
    const names = new Map();
    for (const item of list) {
      const name = item.name.trim();
      if (!name) errors.push(`${section}: hay ${label === 'defensa' ? 'una defensa' : label === 'tipo' ? 'un tipo' : 'una acción'} sin nombre.`);
      else if (name.length > MAX_NAME) errors.push(`${section}: «${name}» supera ${MAX_NAME} caracteres.`);
      const key = name.toLocaleLowerCase('es');
      if (name && !item.retired && names.has(key)) errors.push(`${section}: el nombre «${name}» está repetido.`);
      if (!item.retired) names.set(key, true);
      if (!item.shots.length) errors.push(`${section}: «${name || 'sin nombre'}» no permite ningún tiro.`);
    }
  };
  for (const section of doc.categories) {
    if (section.id !== 'directo') { check(section.items, 'acción', section.name); continue; }
    check(section.types, 'tipo', section.name);
    check(section.defenses, 'defensa', section.name);
    const defenses = section.defenses.filter(d => !d.retired);
    for (const type of section.types.filter(t => !t.retired)) {
      if (!defenses.some(d => cellShots(section, type, d).length)) errors.push(`${section.name}: «${type.name}» no comparte ningún tiro con las defensas activas.`);
    }
  }
  return errors;
}

// ID estable a partir del nombre; nunca reutiliza uno emitido antes (aunque se borrara).
export function newId(name, used, prefix = '') {
  let slug = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 28) || 'boton';
  if (prefix) slug = `${prefix}_${slug}`;
  if (!/^[a-z]/.test(slug)) slug = `b_${slug}`;
  let id = slug;
  for (let n = 2; used.has(id); n++) id = `${slug}_${n}`;
  return id;
}

export function idsInDoc(doc) {
  const actions = new Set(), defenses = new Set();
  for (const section of doc.categories) {
    if (section.id !== 'directo') section.items.forEach(i => actions.add(i.id));
    else { section.types.forEach(t => actions.add(t.id)); section.defenses.forEach(d => defenses.add(d.id)); }
  }
  return { actions, defenses };
}

// Valores iniciales sobre el documento anterior: lo que no esté en el CSV queda retirado, con su nombre.
export function mergeIntoDoc(previous, incoming) {
  const result = clone(incoming);
  if (!previous) return result;
  for (const section of result.categories) {
    const old = previous.categories.find(c => c.id === section.id);
    if (!old) continue;
    const keep = (list, oldList) => {
      const ids = new Set(list.map(i => i.id));
      for (const item of oldList) if (!ids.has(item.id)) list.push({ ...clone(item), retired: true });
    };
    if (section.id !== 'directo') keep(section.items, old.items);
    else { keep(section.types, old.types); keep(section.defenses, old.defenses); }
  }
  return result;
}

// Recuento de tiros por ID en todos los partidos locales: decide qué se puede borrar del todo.
export async function eventCounts(events) {
  const list = events ?? [...await allEvents(), ...(storageContext().scope ? await configEvents() : [])];
  const actions = new Map(), defenses = new Map();
  for (const event of list) {
    const identity = eventIdentity(event);
    if (!identity) continue;
    actions.set(identity.action, (actions.get(identity.action) ?? 0) + 1);
    if (identity.defense) defenses.set(identity.defense, (defenses.get(identity.defense) ?? 0) + 1);
  }
  return { actions, defenses };
}

function unionUsed(used, doc, counts) {
  const legacy = legacyIdentityIds(), ids = idsInDoc(doc);
  return {
    actions: [...new Set([...(used?.actions ?? []), ...legacy.actions, ...ids.actions, ...(counts?.actions.keys() ?? [])])],
    defenses: [...new Set([...(used?.defenses ?? []), ...legacy.defenses, ...ids.defenses, ...(counts?.defenses.keys() ?? [])])]
  };
}

const randomId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
function makeVersion(doc, source, basedOn, csvHash = null) {
  return { id: `cfg-${randomId()}`, createdAt: new Date().toISOString(), source, basedOn: basedOn ?? null, csvHash, doc: clone(doc) };
}

function readRecord(tx, done, c = storageContext()) {
  const request = tx.objectStore('settings').get(panelKey(CONFIG_KEY, c));
  request.onsuccess = () => done(request.result?.value ?? null);
}
const putRecord = (tx, value, c = storageContext()) => tx.objectStore('settings').put({ key: panelKey(CONFIG_KEY, c), value, scope: c.scope });

const configChannel = () => globalThis.BroadcastChannel ? new BroadcastChannel('registro-defensivo-config') : null;
let channel;
export function notifyConfigChange(revision) {
  channel ??= configChannel();
  channel?.postMessage({ revision });
  try { globalThis.localStorage?.setItem('defensas-config-change', JSON.stringify({ revision, stamp: randomId() })); } catch {}
}
export function onConfigChange(listener) {
  const ownChannel = configChannel();
  if (ownChannel) ownChannel.onmessage = event => listener(event.data);
  globalThis.addEventListener?.('storage', event => { if (event.key === 'defensas-config-change') listener(JSON.parse(event.newValue || '{}')); });
}

export const currentVersion = record => record.versions.find(v => v.id === record.currentId);

// Copiar únicamente versiones que este dispositivo ya vinculó a partidos del
// equipo. Nunca atribuir el panel de otro equipo ni modificar los originales.
async function recoverKnownPanels(c, initial) {
  return transact(SYNC_STORES, 'readwrite', (tx, done, abort) => {
    const settings = tx.objectStore('settings'), old = settings.get(CONFIG_KEY), used = settings.get(USAGE_KEY);
    const current = settings.get(panelKey(CONFIG_KEY, c)), currentUsage = settings.get(panelKey(USAGE_KEY, c));
    const games = tx.objectStore('cloudGames').index('byScope').getAll(c.scope);
    let count = 0;
    const finish = () => {
      if (++count !== 5) return;
      if (storageContext() !== c) { abort('La cuenta o el equipo han cambiado.', 'SCOPE_CHANGED'); return; }
      let record = current.result?.value ?? initial;
      const usage = currentUsage.result?.value ?? {};
      if (old.result?.value) for (const game of games.result) {
        if (game.deleted || game.panel || usage[game.gameId]?.length) continue;
        const ids = used.result?.value?.[game.gameId] ?? used.result?.value?.[game.payload.id] ?? [];
        for (const id of ids) {
          const version = old.result.value.versions.find(item => item.id === id);
          if (!version) continue;
          const panel = { version, usedIds: old.result.value.usedIds };
          record = mergePanelRecord(record, panel, false);
          usage[game.gameId] = [...(usage[game.gameId] || []), id];
        }
        const version = record.versions.find(item => item.id === usage[game.gameId]?.at(-1));
        if (version) {
          const panel = { version, usedIds: record.usedIds };
          tx.objectStore('cloudGames').put({ ...game, panel }); queuePanel(tx, c, game.gameId, panel);
          if (!record.syncHead && old.result.value.currentId === version.id) {
            record = mergePanelRecord(record, panel, true); queuePanel(tx, c, PANEL_DEFAULT, panel);
          }
        }
      }
      putRecord(tx, record, c);
      settings.put({ key: panelKey(USAGE_KEY, c), scope: c.scope, value: usage }); done(record);
    };
    old.onsuccess = used.onsuccess = current.onsuccess = currentUsage.onsuccess = games.onsuccess = finish;
  });
}

// Arranque: crea la configuración inicial desde el CSV si no existe (migración conservadora) y,
// mientras no haya ediciones, adopta los cambios del CSV como antes. Nunca toca partidos ni eventos.
export async function loadButtonConfiguration({ csvText = null, csvConfiguration = null, csvError = null } = {}) {
  const c = storageContext();
  let counts = null;
  try { counts = await eventCounts(); } catch { counts = null; }
  const hash = csvText === null ? null : textHash(csvText);
  const incoming = csvConfiguration ? docFromConfiguration(csvConfiguration) : null;
  assertContext(c);
  const record = await transact(['settings'], 'readwrite', (tx, result, abort) => readRecord(tx, stored => {
    if (storageContext() !== c) { abort('La cuenta o el equipo han cambiado.', 'SCOPE_CHANGED'); return; }
    if (!stored) {
      if (!incoming) { result(null); return; }
      const version = makeVersion(incoming, 'csv', null, hash);
      const value = { schema: CONFIG_SCHEMA, revision: 1, currentId: version.id, baselineId: version.id,
        usedIds: unionUsed(null, incoming, counts), versions: [version], updatedAt: version.createdAt, origin: 'local' };
      putRecord(tx, value); result({ value, created: true }); return;
    }
    const current = currentVersion(stored);
    if (incoming && ['csv', 'restore'].includes(current.source) && current.csvHash !== hash) {
      const doc = mergeIntoDoc(current.doc, incoming);
      const version = makeVersion(doc, 'csv', current.id, hash);
      const value = { ...stored, revision: stored.revision + 1, currentId: version.id, usedIds: unionUsed(stored.usedIds, doc, counts),
        versions: [...stored.versions, version], updatedAt: version.createdAt };
      putRecord(tx, value); result({ value, adopted: true }); return;
    }
    result({ value: stored });
  }));
  if (!record) throw new Error(csvError || 'No hay configuración de botones disponible.');
  const value = record.created && c.scope ? await recoverKnownPanels(c, record.value) : record.value;
  const version = currentVersion(value);
  // Un CSV roto solo bloquea si la configuración vigente procede del propio CSV.
  if (csvError && ['csv', 'restore'].includes(version.source)) throw new Error(csvError);
  return { record: value, version, configuration: configurationFromDoc(version.doc), created: Boolean(record.created), adopted: Boolean(record.adopted) };
}

// Guardado atómico tras comprobar que nadie ha guardado antes (otra pestaña).
// La existencia del partido y la ausencia de tiros se comprueban en la misma tx
// que versión/asociación (y, en Sync, snapshot del partido y outbox).
export async function saveButtonConfiguration(doc, baseRevision, { source = 'editor', csvHash = null, gameId = null, baseVersionId = null } = {}) {
  const c = storageContext();
  const errors = validateDoc(doc);
  if (errors.length) throw Object.assign(new Error(errors.join(' ')), { code: 'INVALID_CONFIG' });
  let counts = null;
  try { counts = await eventCounts(); } catch {}
  assertContext(c);
  const value = await transact(c.scope ? SYNC_STORES : gameId ? ['games', 'events', 'settings'] : ['settings'], 'readwrite', (tx, result, abort) => readRecord(tx, stored => {
    if (storageContext() !== c) { abort('La cuenta o el equipo han cambiado.', 'SCOPE_CHANGED'); return; }
    if (!stored || stored.revision !== baseRevision) {
      abort('La configuración ha cambiado en otra pestaña. Cierra el editor y vuelve a abrirlo.', 'CONFIG_CONFLICT'); return;
    }
    // Ningún ID nuevo puede coincidir con uno emitido antes para otro elemento. Restaurar puede
    // recuperar los IDs del propio CSV: son los mismos elementos, no una reutilización.
    const before = (stored.versions.find(version => version.id === baseVersionId) ?? currentVersion(stored)).doc, known = idsInDoc(before);
    const used = { actions: new Set(stored.usedIds.actions), defenses: new Set(stored.usedIds.defenses) };
    const ids = idsInDoc(doc);
    const checkReuse = source === 'editor';
    for (const id of ids.actions) if (checkReuse && !known.actions.has(id) && used.actions.has(id)) { abort(`El ID ${id} ya se usó antes.`, 'ID_REUSED'); return; }
    for (const id of ids.defenses) if (checkReuse && !known.defenses.has(id) && used.defenses.has(id)) { abort(`El ID ${id} ya se usó antes.`, 'ID_REUSED'); return; }
    // Borrar del todo solo elementos sin tiros registrados.
    for (const id of known.actions) if (!ids.actions.has(id) && counts?.actions.get(id)) { abort('No se puede borrar un elemento con tiros registrados; retíralo.', 'HAS_EVENTS'); return; }
    for (const id of known.defenses) if (!ids.defenses.has(id) && counts?.defenses.get(id)) { abort('No se puede borrar una defensa con tiros registrados; retírala.', 'HAS_EVENTS'); return; }
    const version = makeVersion(doc, source, baseVersionId ?? stored.currentId, csvHash);
    const next = { ...stored, revision: stored.revision + 1, currentId: version.id, usedIds: unionUsed(stored.usedIds, doc, counts),
      versions: [...stored.versions, version], updatedAt: version.createdAt };
    const finish = game => {
      if (c.scope) {
        const panel = panelSnapshot(next);
        queuePanel(tx, c, PANEL_DEFAULT, panel, stored.syncHead ?? null);
        next.syncHead = version.id;
        if (gameId) {
          tx.objectStore('cloudGames').put({ ...game, panel });
          queuePanel(tx, c, gameId, panel, game.panel?.version.id ?? null);
        }
      }
      putRecord(tx, next);
      if (!gameId) { result({ record: next, usage: null }); return; }
      const usageRequest = tx.objectStore('settings').get(panelKey(USAGE_KEY, c));
      usageRequest.onsuccess = () => {
        const usage = usageRequest.result?.value ?? {};
        const list = (usage[gameId] ?? []).filter(id => id !== version.id);
        const nextUsage = { ...usage, [gameId]: [...list, version.id] };
        tx.objectStore('settings').put({ key: panelKey(USAGE_KEY, c), value: nextUsage, scope: c.scope });
        result({ record: next, usage: nextUsage });
      };
    };
    if (!gameId) { finish(null); return; }
    if (!c.scope) {
      const gameRequest = tx.objectStore('games').get(gameId);
      gameRequest.onsuccess = () => guardLegacyGame(tx, gameId, abort, () => {
        if (!gameRequest.result || gameRequest.result.deleted) { abort('El partido ya no existe.', 'GAME_NOT_FOUND'); return; }
        const events = tx.objectStore('events').index('byGameId').count(gameId);
        events.onsuccess = () => {
          if (events.result) { abort('Este partido ya tiene tiros: su panel no se puede cambiar.', 'HAS_EVENTS'); return; }
          finish(null);
        };
      });
      return;
    }
    const gameRequest = tx.objectStore('cloudGames').get([c.scope, gameId]);
    gameRequest.onsuccess = () => {
      if (!gameRequest.result || gameRequest.result.deleted) { abort('El partido ya no existe.', 'GAME_NOT_FOUND'); return; }
      const events = tx.objectStore('cloudEvents').index('byGame').getAll([c.scope, gameId]);
      events.onsuccess = () => {
        if (events.result.some(event => !event.deleted)) { abort('Este partido ya tiene tiros: su panel no se puede cambiar.', 'HAS_EVENTS'); return; }
        finish(gameRequest.result);
      };
    };
  }));
  notifyConfigChange(value.record.revision);
  if (c.scope) globalThis.dispatchEvent?.(new Event('defensas-sync-local'));
  const saved = currentVersion(value.record);
  return { record: value.record, usage: value.usage, version: saved, configuration: configurationFromDoc(saved.doc) };
}

export function restoredDoc(currentDoc, csvConfiguration) {
  return mergeIntoDoc(currentDoc, docFromConfiguration(csvConfiguration));
}

// Asociación partido → versiones con las que se ha registrado (sin tocar partidos ni eventos).
export function recordGameUsage(gameId, versionId) {
  if (!gameId || !versionId) return Promise.resolve(null);
  // Devuelve el mapa resultante en la misma transacción: no hace falta una lectura posterior.
  return transact(['settings'], 'readwrite', (tx, result) => {
    const c = storageContext();
    const request = tx.objectStore('settings').get(panelKey(USAGE_KEY, c));
    request.onsuccess = () => {
      const value = request.result?.value ?? {};
      const list = value[gameId] ?? [];
      if (list.at(-1) === versionId) { result(value); return; }
      const next = { ...value, [gameId]: [...list.filter(id => id !== versionId), versionId] };
      tx.objectStore('settings').put({ key: panelKey(USAGE_KEY, c), value: next, scope: c.scope });
      result(next);
    };
  });
}
export function readGameUsage() {
  return transact(['settings'], 'readonly', (tx, result) => {
    const request = tx.objectStore('settings').get(panelKey(USAGE_KEY, storageContext()));
    request.onsuccess = () => result(request.result?.value ?? {});
  });
}

// Versión para Estadísticas de un partido: la última con la que registró; si es anterior a la
// Fase 9B y tiene tiros, la inicial; si no tiene tiros, la vigente.
// Fase 9E: un partido con tiros nunca cambia de panel. Sin tiros, si usa la configuración del archivo
// (csv/restaurar), sigue los cambios de categorias.csv; en cuanto se edita su panel, queda fijo.
// Fase 14: en un equipo sincronizado el snapshot del partido queda fijo también si procede del CSV.
const followsFile = version => ['csv', 'restore'].includes(version?.source);
export function versionForGame(record, usage, gameId, hasEvents) {
  const id = usage?.[gameId]?.at(-1) ?? (hasEvents ? record.baselineId : record.currentId);
  const version = record.versions.find(v => v.id === id) ?? currentVersion(record);
  const current = currentVersion(record);
  return !storageContext().scope && !hasEvents && followsFile(version) && followsFile(current) ? current : version;
}
