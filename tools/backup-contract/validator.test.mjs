import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { validateBackup } from './validate.mjs';
import { parseStrict, fingerprint, LIMITS } from './json.mjs';
import { fixtureV1, fixtureEmptyV1, fixtureV2, sealFixture, clone, SCOPE_A, SCOPE_B } from './fixtures.mjs';

const validate = value => validateBackup(JSON.stringify(value));
const expect = (value, status, code) => {
  const result = typeof value === 'string' ? validateBackup(value) : validate(value);
  assert.equal(result.status, status, JSON.stringify(result));
  if (code) assert.equal(result.issues[0]?.code, code, JSON.stringify(result));
  assert.equal(result.restorationImplemented, false); assert.equal(result.authenticityVerified, false);
  return result;
};
function mutation(make, change, status, code, options) {
  const fixture = make(); change(fixture); return expect(sealFixture(fixture, options), status, code);
}

for (const [name, make] of [['v1 mínima vacía', fixtureEmptyV1], ['v1 con panel', fixtureV1], ['v1 histórica sin panel', () => fixtureV1({ historical: true })], ['v2 nueve almacenes', fixtureV2]]) {
  test('Acepta ' + name, () => { expect(make(), 'complete'); });
}
test('v2: representaciones, originales, dos equipos, vivos, lápidas y seis tipos de intención', () => {
  const fixture = fixtureV2(), result = expect(fixture, 'complete');
  assert.deepEqual(result.summary, { representations: 5, logicalGames: 4, originals: 1, localEvents: 3, cloudEvents: 5,
    liveEvents: 5, deletedEvents: 1, originalEvents: 2, tombstones: 2, teams: 2, versions: 4, pending: 6, blocked: 1 });
  assert.deepEqual(new Set(fixture.data.pendingIntents.map(op => op.type)), new Set(['game', 'event', 'panel', 'default-panel', 'undo', 'delete']));
  const imported = fixture.data.cloudEvents.find(row => row.payload.seq === 2);
  assert.notEqual(imported.eventId, imported.payload.id); assert.notEqual(imported.gameId, imported.payload.gameId);
});
test('Sustitución de orden por hora imposible: conserva seq aunque fechas vayan al revés', () => {
  mutation(fixtureV2, fixture => { fixture.data.cloudEvents[0].payload.fecha_hora = '2030-01-01T00:00:00.000Z';
    const original = fixture.data.localEvents.find(row => row.payload.id === fixture.data.cloudEvents[0].payload.id);
    original.payload.fecha_hora = '2030-01-01T00:00:00.000Z'; }, 'complete');
});
test('Sin cola se declara desconocido, nunca confirmación de nube', () => {
  const fixture = fixtureV2(); fixture.data.pendingIntents = [];
  for (const row of [...fixture.data.cloudGames, ...fixture.data.cloudEvents]) row.cloudState = 'cloud-status-unknown';
  expect(sealFixture(fixture), 'complete');
  fixture.data.cloudGames[0].cloudState = 'cloud-verified-at'; expect(sealFixture(fixture), 'invalid', 'VALUE');
});
test('syncHead de plantilla pendiente no implica confirmación', () => {
  const fixture = fixtureV2(); expect(fixture, 'complete');
  assert.ok(fixture.data.settings.some(row => row.record?.syncHead === 'cfg-b'));
  assert.ok(fixture.data.pendingIntents.some(op => op.type === 'default-panel'));
});
test('Equipo referenciado sin nombre cacheado sigue incluido', () => {
  mutation(fixtureV2, fixture => { fixture.data.metadata = fixture.data.metadata.filter(row => row.kind !== 'teams'); }, 'complete');
});
test('Lápida anterior a un evento que nunca se recibió', () => {
  mutation(fixtureV2, fixture => { fixture.data.tombstones.push({ scope: clone(SCOPE_B), gameId: 'partido-equipo-b', eventId: 'no-recibido' }); }, 'complete');
});
test('Original importado retenido después de purga, sin vínculo ni copia actual', () => {
  mutation(fixtureV2, fixture => {
    const d = fixture.data; d.cloudGames = []; d.cloudEvents = []; d.tombstones = []; d.bindings = []; d.pendingIntents = [];
    d.settings = d.settings.filter(row => row.scope === null);
    d.metadata = d.metadata.filter(row => ['source', 'legacy-owner', 'preferred-team'].includes(row.kind));
    fixture.coverage.includedScopes = [null]; fixture.coverage.unresolvedImportedOriginals = ['original-ficticio'];
  }, 'complete');
});
test('Uso residual de un partido eliminado, declarado explícitamente', () => {
  mutation(fixtureV1, fixture => {
    fixture.data.settings.find(row => row.kind === 'game-usage').games.push({ gameId: 'eliminado-antes', versionIds: ['cfg-a'] });
    fixture.coverage.detachedGameUsage = [{ scope: null, gameId: 'eliminado-antes' }];
  }, 'complete');
});
test('basedOn remoto nunca cacheado se declara sin inventar documento', () => {
  mutation(fixtureV1, fixture => {
    fixture.data.settings.find(row => row.kind === 'panel-record').record.versions[0].basedOn = 'cfg-externa';
    fixture.coverage.externalBaseVersions = [{ scope: null, versionId: 'cfg-externa' }];
  }, 'complete');
});
test('Origen v1 desconocido sigue siendo captura local, con limitación explícita', () => {
  const result = expect(fixtureV1(), 'complete'); assert.ok(result.warnings.some(row => row.code === 'ORIGIN_UNRESOLVED'));
});
test('No muta el documento original ni convierte intenciones en cola', () => {
  const text = JSON.stringify(fixtureV2()); const before = fingerprint(parseStrict(text));
  expect(text, 'complete'); assert.equal(fingerprint(parseStrict(text)), before);
  assert.ok(parseStrict(text).data.pendingIntents.every(op => op.executable === false));
});

const badRelations = [
  ['evento huérfano', fixtureV1, f => { f.data.localEvents[0].payload.gameId = 'ausente'; }, 'incomplete', 'ORPHAN_EVENT'],
  ['versión de panel ausente', fixtureV1, f => { f.data.settings.find(r => r.kind === 'game-usage').games[0].versionIds = ['cfg-ausente']; }, 'incomplete', 'PANEL_VERSION_MISSING'],
  ['puntero de panel ausente', fixtureV1, f => { f.data.settings.find(r => r.kind === 'panel-record').record.currentId = 'cfg-ausente'; }, 'incomplete', 'PANEL_VERSION_MISSING'],
  ['ID duplicado idéntico', fixtureV1, f => { f.data.localGames.push(clone(f.data.localGames[0])); }, 'invalid', 'DUPLICATE_ID'],
  ['ID deportivo conflictivo', fixtureV1, f => { const row = clone(f.data.localEvents[0]); row.sourceSeq = 8; row.payload.seq = 8; row.payload.resultado = 'anotado'; f.data.localEvents.push(row); }, 'invalid', 'ID_CONFLICT'],
  ['seq técnico duplicado', fixtureV1, f => { const row = clone(f.data.localEvents[0]); row.payload.id = 'otro'; f.data.localEvents.push(row); }, 'invalid', 'SECTION_ORDER'],
  ['seq de payload original cambiado', fixtureV1, f => { f.data.localEvents[0].payload.seq = 8; }, 'invalid', 'SOURCE_SEQ'],
  ['referencia deportiva/remota confundida', fixtureV2, f => { f.data.cloudEvents[0].payload.gameId = f.data.cloudEvents[0].gameId; }, 'invalid', 'EVENT_GAME_ID'],
  ['lápida de evento perdida', fixtureV2, f => { f.data.tombstones = f.data.tombstones.filter(r => !r.eventId); }, 'incomplete', 'EVENT_TOMBSTONE'],
  ['lápida de partido perdida', fixtureV2, f => { f.data.tombstones = f.data.tombstones.filter(r => r.eventId); }, 'incomplete', 'GAME_TOMBSTONE'],
  ['evento de otro UID', fixtureV2, f => { f.data.cloudEvents[0].scope[1] = 'otro-uid'; }, 'invalid', 'SCOPE_EXCLUDED'],
  ['ámbito otro UID declarado incluido', fixtureV2, f => { f.coverage.includedScopes.push(['demo-defensas', 'otro-uid', 'otro-equipo']); }, 'invalid', 'SCOPE_ACCOUNT'],
  ['origen regenerado sin evidencia', fixtureV2, f => { f.origin.lineageId = 'otro-origen'; }, 'invalid', 'ORIGIN_LINEAGE'],
  ['binding remoto manipulado', fixtureV2, f => { f.data.bindings[0].source = 'otro-origen'; }, 'invalid', 'BINDING_IDENTITY'],
  ['cola ejecutable', fixtureV2, f => { f.data.pendingIntents[0].executable = true; }, 'invalid', 'VALUE'],
  ['intención sin padre', fixtureV2, f => { f.data.pendingIntents.find(o => o.type === 'event').gameId = 'sin-padre'; }, 'incomplete', 'MISSING_REFERENCE'],
  ['intención con payload cambiado', fixtureV2, f => { f.data.pendingIntents.find(o => o.type === 'event').payload.resultado = 'fallado'; }, 'invalid', 'OPERATION_CONFLICT'],
  ['bloqueo sin causa', fixtureV2, f => { delete f.data.pendingIntents.find(o => o.blocked).error; }, 'invalid', 'BLOCKED_REASON'],
  ['estado sincronizado inferido por error', fixtureV2, f => { f.data.cloudGames.find(r => r.cloudState === 'blocked').cloudState = 'cloud-status-unknown'; }, 'invalid', 'CLOUD_STATE'],
  ['basedOn externo no declarado', fixtureV1, f => { f.data.settings.find(r => r.kind === 'panel-record').record.versions[0].basedOn = 'cfg-externa'; }, 'incomplete', 'EXTERNAL_BASES'],
  ['ciclo de versiones', fixtureV1, f => { f.data.settings.find(r => r.kind === 'panel-record').record.versions[0].basedOn = 'cfg-a'; }, 'invalid', 'PANEL_CYCLE'],
  ['panel mismo ID con distinto documento', fixtureV2, f => { f.data.cloudGames.find(r => r.scope[2] === SCOPE_A[2]).panel.version.doc.categories[0].name = 'Distinta'; }, 'invalid', 'PANEL_ID_CONFLICT'],
  ['ID usado de panel ausente', fixtureV1, f => { f.data.settings.find(r => r.kind === 'panel-record').record.usedIds.actions = []; }, 'incomplete', 'PANEL_USED_ID'],
  ['orden de categorías inválido', fixtureV1, f => { const doc = f.data.settings.find(r => r.kind === 'panel-record').record.versions[0].doc; [doc.categories[0], doc.categories[1]] = [doc.categories[1], doc.categories[0]]; }, 'invalid', 'PANEL_CATEGORIES'],
  ['panel histórico perdido no declarado', () => fixtureV1({ historical: true }), f => { f.coverage.missingHistoricalPanels = []; }, 'incomplete', 'HISTORICAL_PANELS'],
  ['uso residual no declarado', fixtureV1, f => { f.data.settings.find(r => r.kind === 'game-usage').games.push({ gameId: 'viejo', versionIds: ['cfg-a'] }); }, 'incomplete', 'DETACHED_USAGE'],
  ['valor de tiro no permitido', fixtureV1, f => { f.data.localEvents[0].payload.tiros_permitidos = [3]; }, 'invalid', 'SHOT_PERMISSION'],
  ['fecha imposible', fixtureV1, f => { f.data.localGames[0].createdAt = '2026-02-30T10:00:00.000Z'; }, 'invalid', 'DATE'],
  ['cabecera vacía', fixtureV1, f => { f.data.localGames[0].rival = '   '; }, 'invalid', 'GAME_TEXT'],
  ['source sin ID persistido', fixtureV1, f => { f.origin.lineageKind = 'sync-source'; f.origin.lineageId = 'nuevo-cada-vez'; }, 'invalid', 'ORIGIN_LINEAGE']
];
for (const [name, make, change, status, code] of badRelations) test('Rechaza con hash correcto: ' + name, () => mutation(make, change, status, code));

test('Archivo marcado parcial', () => mutation(fixtureV1, f => { f.coverage.localSnapshotComplete = false; }, 'incomplete', 'INCOMPLETE_CAPTURE'));
test('Filas omitidas declaradas, aunque hashes cuadren', () => {
  mutation(fixtureV1, f => { f.coverage.omissions = [{ section: 'localEvents', count: 1, reason: 'read-error' }]; f.manifest.stores.events.omittedRows = 1; }, 'incomplete', 'INCOMPLETE_CAPTURE');
});
test('Conteo de origen mayor que las filas capturadas', () => mutation(fixtureV1, f => { f.manifest.stores.events.sourceRows++; }, 'incomplete', 'SOURCE_COUNT', { preserveStoreCounts: true }));
test('Sección ausente detectada antes de ignorarla', () => {
  const f = fixtureV1(); delete f.data.localEvents; expect(f, 'incomplete', 'MISSING_FIELD');
});
test('Almacén v2 declarado ausente', () => {
  const f = fixtureV2(); f.data.pendingIntents = [];
  for (const row of [...f.data.cloudGames, ...f.data.cloudEvents]) row.cloudState = 'cloud-status-unknown';
  f.manifest.stores.syncQueue = { present: false, read: 'absent', sourceRows: 0, excludedRows: 0, transientRows: 0, omittedRows: 0 };
  expect(sealFixture(f, { preserveStoreCounts: true }), 'incomplete', 'INCOMPLETE_CAPTURE');
});
test('Datos v2 dentro de una supuesta base v1', () => {
  const f = fixtureV2(); f.origin.databaseVersion = 1; f.schemas.indexedDb = 1;
  expect(sealFixture(f), 'invalid', 'V1_STORE');
});
test('Alteración del contenido sin actualizar huella global', () => { const f = fixtureV1(); f.data.localGames[0].rival = 'Manipulado'; expect(f, 'invalid', 'HASH_GLOBAL'); });
test('Hash global correcto pero hash de sección incorrecto', () => {
  const f = fixtureV1(); f.manifest.sections.localEvents.sha256 = '0'.repeat(64); const { integrity, ...body } = f; f.integrity.digest = fingerprint(body);
  expect(f, 'invalid', 'HASH_SECTION');
});
test('Conteo de sección manipulado y global recalculado', () => {
  const f = fixtureV1(); f.manifest.sections.localEvents.count++; const { integrity, ...body } = f; f.integrity.digest = fingerprint(body);
  expect(f, 'incomplete', 'SECTION_COUNT');
});
test('Bytes canónicos manipulados y global recalculado', () => {
  const f = fixtureV1(); f.manifest.sections.localEvents.bytes++; const { integrity, ...body } = f; f.integrity.digest = fingerprint(body);
  expect(f, 'invalid', 'SECTION_BYTES');
});
test('Totales vivos manipulados y global recalculado', () => {
  const f = fixtureV1(); f.manifest.totals.liveEvents++; const { integrity, ...body } = f; f.integrity.digest = fingerprint(body);
  expect(f, 'incomplete', 'TOTAL_COUNT');
});
for (const [name, change, code] of [
  ['major futuro', f => { f.formatVersion.major = 2; }, 'FORMAT_VERSION'],
  ['minor futuro', f => { f.formatVersion.minor = 1; }, 'FORMAT_VERSION'],
  ['panel futuro', f => { f.schemas.panelDoc = 2; }, 'SCHEMA_VERSION'],
  ['aplicación futura', f => { f.producer.appVersion = '24.0'; }, 'APP_VERSION'],
  ['feature futura', f => { f.manifest.requiredFeatures.push('encrypted'); }, 'REQUIRED_FEATURE']
]) test('Incompatible: ' + name, () => { const f = fixtureV1(); change(f); expect(f, 'incompatible', code); });

for (const field of ['idToken', 'refreshToken', 'access_token', 'credentials', 'password', 'private_key', 'apiKey', 'cookie', 'permissions', 'ownerUid', 'lease', 'worker', 'nextAttempt', 'attempts', 'defensas-purge-pending']) test('Prohibido: ' + field, () => {
  const f = fixtureV1(); f.data.localGames[0][field] = 'secreto-ficticio'; expect(f, 'invalid', 'FORBIDDEN_FIELD');
});
test('Campo desconocido no se descarta', () => { const f = fixtureV1(); f.data.localGames[0].nuevoCampo = 1; expect(f, 'invalid', 'UNKNOWN_FIELD'); });
test('Discriminante no textual se rechaza sin lanzar excepción interna', () => {
  const f = fixtureV1(); f.data.settings[0].kind = {}; expect(f, 'invalid', 'TYPE');
});
test('Sustituciones hostiles de contenedores/tipos siempre devuelven diagnóstico', () => {
  const paths = [['formatVersion'], ['origin'], ['schemas'], ['coverage'], ['manifest'], ['data'], ['integrity'],
    ['data', 'settings', 0, 'kind'], ['data', 'metadata', 0, 'kind'], ['data', 'pendingIntents', 0, 'type']];
  for (const path of paths) for (const value of [null, true, 0, '', 'desconocido', [], {}]) {
    const f = fixtureV2(); let target = f;
    for (const part of path.slice(0, -1)) target = target[part]; target[path.at(-1)] = value;
    const result = validate(f); assert.notEqual(result.status, 'complete', path.join('.'));
    assert.ok(result.issues[0]?.code);
  }
});
test('Dependencia de intención de panel sobre sí misma', () => {
  mutation(fixtureV2, f => { const op = f.data.pendingIntents.find(row => row.type === 'panel'); op.baseId = op.payload.version.id; }, 'invalid', 'OPERATION_CYCLE');
});
test('Identidad de acción reutilizada entre secciones', () => {
  mutation(fixtureV1, f => { const record = f.data.settings.find(row => row.kind === 'panel-record').record;
    record.versions[0].doc.categories[1].items[0].id = record.versions[0].doc.categories[0].items[0].id; }, 'invalid', 'DUPLICATE_ID');
});
test('Claves repetidas en el encabezado, incluso con escape', () => {
  const text = JSON.stringify(fixtureV1());
  expect(text.replace('"format":', '"format":"otro","for\\u006dat":'), 'invalid', 'DUPLICATE_KEY');
});
test('Clave repetida anidada antes del parser convencional', () => {
  expect('{"a":{"resultado":"fallado","resultado":"anotado"}}', 'invalid', 'DUPLICATE_KEY');
});
for (const field of ['__proto__', 'constructor', 'prototype', 'toJSON']) test('Clave peligrosa: ' + field, () => {
  expect(`{"${field}":{"polluted":true}}`, 'invalid', 'FORBIDDEN_KEY'); assert.equal({}.polluted, undefined);
});
for (const token of ['9007199254740992', '9007199254740993', '7.0', '7e0', '-0', '-1', '0.1', '1e-9999']) test('Perfil numérico rechaza ' + token, () => {
  expect('{"numero":' + token + '}', 'invalid', 'NUMBER_PROFILE');
});
test('Infinitos no se convierten en null', () => expect('{"n":1e9999}', 'invalid', 'NUMBER_RANGE'));
test('Entero seguro máximo conservado sin redondeo', () => assert.equal(parseStrict('9007199254740991'), Number.MAX_SAFE_INTEGER));
for (const text of ['{"x":01}', '{"x":NaN}', '{"x":Infinity}', '{"x":true,}', '[1,]', '{', 'true false', '\ufeff{}']) test('Sintaxis inválida: ' + JSON.stringify(text), () => expect(text, 'invalid', 'JSON_SYNTAX'));
test('Unicode aislado rechazado antes de hash', () => expect('{"x":"\\ud800"}', 'invalid', 'UNICODE'));
test('Objeto parseado no puede ocultar duplicados previos', () => { const result = validateBackup(fixtureV1()); assert.equal(result.issues[0].code, 'INPUT_TYPE'); });
test('Límites explícitos de profundidad, tamaño y número de nodos', () => {
  expect('['.repeat(66) + '0' + ']'.repeat(66), 'invalid', 'LIMIT_DEPTH');
  expect('"' + 'x'.repeat(LIMITS.string + 1) + '"', 'invalid', 'LIMIT_STRING');
  expect(' '.repeat(LIMITS.bytes + 1), 'invalid', 'LIMIT_BYTES');
  expect('[' + Array(LIMITS.nodes + 1).fill('null').join(',') + ']', 'invalid', 'LIMIT_NODES');
});
test('Texto hostil permanece texto y nunca se evalúa ni se presenta como HTML', () => {
  const f = fixtureV1(); f.data.localGames[0].rival = '<img src=x onerror="globalThis.__ejecutado=true">';
  f.data.localEvents[0].payload.accion = '(()=>{globalThis.__ejecutado=true})()';
  expect(sealFixture(f), 'complete'); assert.equal(globalThis.__ejecutado, undefined);
});
test('Origin no puede contener usuario, query, fragmento o ruta', () => {
  for (const origin of ['https://user:pass@ficticio.example', 'https://ficticio.example/?token=ficticio', 'https://ficticio.example/#x', 'https://ficticio.example/ruta', 'file:///tmp']) {
    mutation(fixtureV1, f => { f.origin.webOrigin = origin; }, 'invalid', 'WEB_ORIGIN');
  }
});
test('Se puede validar con acceso a navegador/red explícitamente prohibido', () => {
  const saved = new Map();
  try {
    for (const name of ['indexedDB', 'localStorage', 'sessionStorage', 'fetch', 'WebSocket']) {
      saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
      Object.defineProperty(globalThis, name, { configurable: true, get() { throw Error('Acceso prohibido: ' + name); } });
    }
    expect(fixtureV2(), 'complete');
  } finally { for (const [name, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } }
});
test('Grafo aislado: solo imports propios y primitivas Node de hash/tipos', async () => {
  for (const name of ['json.mjs', 'schema.mjs', 'validate.mjs']) {
    const source = await readFile(new URL(name, import.meta.url), 'utf8');
    const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(match => match[1]);
    assert.ok(imports.every(name => ['node:crypto', 'node:util', './json.mjs', './schema.mjs'].includes(name)));
    assert.doesNotMatch(source, /\b(?:eval|Function|fetch|indexedDB|localStorage|sessionStorage)\s*\(/);
  }
});
test('Ejemplos JSON de disco son ficticios y verificables sin regenerarlos', async () => {
  const dir = new URL('examples/', import.meta.url);
  const files = (await readdir(dir)).filter(name => name.endsWith('.json'));
  assert.ok(files.length >= 6);
  for (const file of files) {
    const text = await readFile(new URL(file, dir), 'utf8'), result = validateBackup(text);
    const expectedStatus = file.startsWith('valido-') ? 'complete' : file.startsWith('incompatible-') ? 'incompatible' : file.startsWith('incompleto-') ? 'incomplete' : 'invalid';
    assert.equal(result.status, expectedStatus, file + ': ' + JSON.stringify(result));
  }
});
