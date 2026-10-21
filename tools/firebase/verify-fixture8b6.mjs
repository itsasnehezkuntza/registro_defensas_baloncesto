// Compara dos inventarios ya leídos. No tiene red ni operaciones de escritura Firebase.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const dir='.test-artifacts/firebase/fase8b6/';
const before=JSON.parse(await readFile(dir+'read-fixture.json','utf8'));
const after=JSON.parse(await readFile(dir+'read-fixture-after.json','utf8'));
const reserved='prueba8b6-95424bdd-8861-43b2-a547-a7afab568e64';
for(const key of ['projectId','teamId','gameId'])assert.equal(after[key],before[key]);
assert.equal(before.events.length,2);assert.equal(after.events.length,3);
assert(!before.gameDeleted&&!after.gameDeleted);assert.equal(after.tombs,before.tombs);assert.equal(after.tombs,0);
assert.deepEqual(after.events.map(e=>e.id).sort(),[...before.events.map(e=>e.id),reserved].sort());
for(const original of before.events){const current=after.events.find(e=>e.id===original.id);for(const key of['payloadHash','localTime','serverTime','points','result'])assert.equal(current[key],original[key]);}
const added=after.events.find(e=>e.id===reserved);assert.equal(Number(added.points),2);assert.equal(added.result,'fallado');
const result={checkedAt:after.checkedAt,serverEvents:3,uniqueDocumentIds:new Set(after.events.map(e=>e.id)).size,
 exactlyOneNewReservedEvent:true,originalPayloadsAndTimestampsUnchanged:true,gameLive:true,tombs:0,
 newEventServerTime:added.serverTime,toolsFirestoreWrites:0,clientTraceVerification:'pending',
 userObservation:'recepción en iPad en aproximadamente dos segundos; confirmación manual'};
await writeFile(dir+'server-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
