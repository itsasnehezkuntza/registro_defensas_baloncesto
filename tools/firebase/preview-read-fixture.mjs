// Diagnóstico administrativo de solo lectura, limitado al fixture iPad autorizado.
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url), cli = name => require('firebase-tools/lib/' + name);
const plan = JSON.parse(await readFile(new URL('./ipad-preview-plan.json', import.meta.url), 'utf8'));
if (plan.projectId !== 'registro-defensivo' || plan.teamId !== 'prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778') throw Error('Fixture distinto; detener.');
const account = cli('auth.js').getGlobalDefaultAccount();
if (!account) throw Error('Falta sesión CLI.');
await cli('requireAuth.js').requireAuth({ project: plan.projectId, ...account }, true);
const client = new (cli('apiv2.js').Client)({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1', auth: true });
const base = '/projects/registro-defensivo/databases/(default)/documents/teams/' + plan.teamId;
const get = async path => (await client.get(path, { skipLog: { resBody: true } })).body;
const team = await get(base), uid = team.fields?.ownerUid?.stringValue;
if (!uid || team.fields?.name?.stringValue !== plan.teamName || createHash('sha256').update(uid).digest('hex').slice(0, 16) !== plan.ownerHash) throw Error('Propietario/equipo distintos.');
const games = (await get(base + '/games?pageSize=2')).documents || [];
if (games.length !== 1) throw Error('Número de partidos inesperado; no continuar.');
const game = games[0], payload = game.fields.payload?.mapValue?.fields;
if (payload?.jornada?.stringValue !== 'IPAD-8B2' || payload?.rival?.stringValue !== 'Rival ficticio') throw Error('No es el partido ficticio esperado.');
const gamePath = '/' + game.name;
const events = (await get(gamePath + '/events?pageSize=20')).documents || [];
const tombs = (await get(gamePath + '/eventDeletions?pageSize=20')).documents || [];
const result = { checkedAt: new Date().toISOString(), administrativeReadOnly: true, clientSecurityTest: false, projectId: plan.projectId, teamId: plan.teamId,
  gameId: game.name.split('/').pop(), gameDeleted: game.fields.deletedAt?.nullValue !== 'NULL_VALUE' && game.fields.deletedAt?.nullValue !== null,
  events: events.map(doc => { const p = doc.fields.payload.mapValue.fields;
    const localTime = p.fecha_hora.stringValue, serverTime = doc.fields.createdAt.timestampValue;
    const payloadHash=createHash('sha256').update(JSON.stringify(p,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v)).digest('hex');
    return { id: doc.name.split('/').pop(), payloadHash, points: p.valor_tiro.integerValue, result: p.resultado.stringValue, localTime, serverTime,
      serverMinusClientMs: Date.parse(serverTime) - Date.parse(localTime) }; }), tombs: tombs.length };
const output=process.argv.includes('--8b7')?'fase8b7':process.argv.includes('--8b6')?'fase8b6':'fase8b3';
const scenario=process.argv.find(a=>a.startsWith('--scenario='))?.split('=')[1];
if(scenario&&!/^[ABC]$/.test(scenario))throw Error('Escenario desconocido.');
await writeFile(new URL('../../.test-artifacts/firebase/'+output+'/'+(process.argv.includes('--after')?'read-fixture-after'+(output==='fase8b7'&&scenario?'-'+scenario:'')+'.json':'read-fixture.json'), import.meta.url), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
