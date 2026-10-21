// Solo inventarios JSON ya leídos: preservación de los tres originales y hasta tres altas.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
if(process.argv[2]==='--baseline'){
 const prior=JSON.parse(await readFile('.test-artifacts/firebase/fase8b6/read-fixture-after.json','utf8')),current=JSON.parse(await readFile('.test-artifacts/firebase/fase8b7/read-fixture.json','utf8'));
 for(const key of['projectId','teamId','gameId','gameDeleted','tombs'])assert.equal(prior[key],current[key]);
 assert.equal(current.events.length,3);assert.equal(new Set(current.events.map(e=>e.id)).size,3);
 for(const e of prior.events){const found=current.events.find(v=>v.id===e.id);assert(found);for(const key of['payloadHash','localTime','serverTime','points','result'])assert.equal(e[key],found[key]);}
 const result={originals:3,unique:3,unchangedFrom8b6:true,tombs:0,networkAccess:false};await writeFile('.test-artifacts/firebase/fase8b7/baseline-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(0);
}
const scenario=process.argv[2];assert(/^[ABC]$/.test(scenario||''),'Indicar A, B o C.');
const count='ABC'.indexOf(scenario)+1,dir='.test-artifacts/firebase/fase8b7/';
const before=JSON.parse(await readFile(dir+'read-fixture.json','utf8')),after=JSON.parse(await readFile(dir+'read-fixture-after-'+scenario+'.json','utf8'));
const extra=['prueba8b7-a-3f994132-d7cc-4871-88fa-411fcbdf49cb','prueba8b7-b-6b18381b-47e3-4538-98e1-63c0d03ad103','prueba8b7-c-7d3416ea-71ad-4873-8a09-506dd311331a'];
assert.equal(before.events.length,3);assert.equal(after.events.length,3+count);assert(!after.gameDeleted);assert.equal(after.tombs,before.tombs);assert.equal(after.tombs,0);
for(const key of['projectId','teamId','gameId'])assert.equal(after[key],before[key]);
assert.deepEqual(after.events.map(e=>e.id).sort(),[...before.events.map(e=>e.id),...extra.slice(0,count)].sort());
const compare=(old,current)=>{for(const e of old.events){const found=current.events.find(v=>v.id===e.id);for(const key of['payloadHash','localTime','serverTime','points','result'])assert.equal(found?.[key],e[key]);}};
compare(before,after);
if(count>1)compare(JSON.parse(await readFile(dir+'read-fixture-after-'+'ABC'[count-2]+'.json','utf8')),after);
const result={scenario,serverEvents:after.events.length,uniqueIds:new Set(after.events.map(e=>e.id)).size,originalsUnchanged:true,priorScenarioEventsUnchanged:true,tombs:0,newEventServerTime:after.events.find(e=>e.id===extra[count-1]).serverTime,networkAccess:false};
await writeFile(dir+'server-verification-'+scenario+'.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
