// JSON aportado como datos: sin red, evaluación de contenido ni operaciones Firebase.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const [scenario,ipadPath,pcPath]=process.argv.slice(2);
assert(/^[ABC]$/.test(scenario||'')&&ipadPath&&pcPath,'Indicar A/B/C y archivos iPad/PC.');
const dir='.test-artifacts/firebase/fase8b7/',dest=dir+'scenario-'+scenario+'/',index='ABC'.indexOf(scenario),initial=3+index,target=initial+1;
const expected=JSON.parse(await readFile(dir+'candidate/manifest.json','utf8')).buildId;
await mkdir(dest,{recursive:true});
async function analyze(path,device,role){
 const bytes=await readFile(path),d=JSON.parse(bytes.toString('utf8')),e=d.entries;
 assert.equal(d.format,'sync-diagnostic-8b4');assert.equal(d.buildId,expected);assert.equal(d.control.scenario,scenario);assert.equal(d.control.role,role);
 assert.equal(d.dropped,0);assert.equal(d.overflow,false);assert.equal(d.retentionPolicy,'preserve-initial');assert(e.length<=d.maxEntries);
 assert.equal(d.control.initialEvents,initial);assert(!d.control.frozen&&d.control.closed&&!d.control.armed);
 for(const field of ['localEvents','screenEvents','uniqueEvents'])assert.equal(d.local[field],target);
 assert.equal(d.local.pending,0);assert(d.local.selected);assert.equal(d.local.games,1);assert.equal(d.savedScenarios.length,index);
 const archives=[];
 for(const [i,a] of d.savedScenarios.entries()){
  assert.equal(a.scenario,'ABC'[i]);assert.equal(a.snapshot.dropped,0);assert.equal(a.snapshot.overflow,false);
  const prior=JSON.parse(await readFile(dir+'scenario-'+a.scenario+'/'+device+'-diagnostic.json','utf8'));
  assert.deepEqual(a.snapshot.entries.slice(0,prior.entries.length),prior.entries,'Archivo anterior sin conservar íntegramente.');
  archives.push({scenario:a.scenario,entries:a.snapshot.entries.length,priorExportEntries:prior.entries.length,priorExportPrefixPreserved:true});
 }
 const st=s=>e.filter(v=>v.stage===s),prepared=st('diagnostic7.prepared');
 assert.equal(prepared.length,1);assert(prepared[0].remoteEvents===initial&&prepared[0].localEvents===initial&&prepared[0].pending===0);
 assert.equal(e[0].stage,'diagnostic.enabled');
 const responses=st('firestore.read.received'),events=responses.filter(v=>v.kind==='events');
 assert(events.some(v=>v.count===initial)&&events.some(v=>v.count===target));
 const errors=e.filter(v=>v.stage.endsWith('.error')||v.stage==='engine.stopped'),sendStarts=st('engine.send.start');
 assert.equal(sendStarts.length,0);assert(st('engine.queue.read').every(v=>v.pending===0));
 assert(responses.every(v=>v.fromCache===false&&v.hasPendingWrites===false));
 const result={device,sha256:createHash('sha256').update(bytes).digest('hex'),buildId:d.buildId,generatedAt:d.generatedAt,
  retainedEntries:e.length,dropped:d.dropped,overflow:d.overflow,prepared:prepared[0],control:d.control,local:d.local,
  archivedScenarios:d.savedScenarios.map(a=>a.scenario),archives,serverResponses:responses.length,serverOnly:true,withoutPendingWrites:true,
  eventCounts:[...new Set(events.map(v=>v.count))],queueCounts:[...new Set(st('engine.queue.read').map(v=>v.pending))],errors,
  lifecycle:e.filter(v=>v.stage.startsWith('lifecycle.')),sendStarts:0,
  singleWriteStarts:st('diagnostic7.single-write.start'),singleWriteConfirmations:st('diagnostic7.single-write.confirmed'),
  changedCommits:st('storage.merge.committed').filter(v=>v.changed),renders:st('app.state.rendered'),
  longestSdkReadMs:Math.max(0,...responses.map(v=>v.durationMs||0)),
  unfinishedReadAtExport:e.at(-2)?.stage==='firestore.read.start'?e.at(-2):null};
 await writeFile(dest+device+'-diagnostic.json',bytes);return{d,result};
}
const ipad=await analyze(ipadPath,'ipad','receptor'),pc=await analyze(pcPath,'pc','ordenador');
assert.equal(ipad.d.control.attempted,false);assert.equal(pc.d.control.attempted,true);
assert.equal(ipad.result.singleWriteStarts.length,0);assert.equal(pc.result.singleWriteStarts.length,1);assert.equal(pc.result.singleWriteConfirmations.length,1);
const e=ipad.d.entries,first=e.findIndex(v=>v.stage==='firestore.read.received'&&v.kind==='events'&&v.count===target);let cursor=first;
const next=(stage,condition=()=>true)=>{const i=e.findIndex((v,i)=>i>=cursor&&v.stage===stage&&condition(v));assert(i>=0,'Etapa ausente: '+stage);cursor=i+1;return e[i];};
const path={read:e[first],pull:next('engine.pull.received',v=>v.remoteEvents===target),validated:next('diagnostic7.remote.validated',v=>v.remoteEvents===target),
 mergeStart:next('storage.merge.start'),committed:next('storage.merge.committed',v=>v.changed===true),notify:next('storage.remote.notify'),
 appReceived:next('app.remote.received'),stateRead:next('app.refresh.read',v=>v.localEvents===target),render:next('app.state.rendered',v=>v.localEvents===target)};
assert.equal(ipad.result.changedCommits.length,1);assert.equal(pc.result.changedCommits.length,1);
const server=JSON.parse(await readFile(dir+'server-verification-'+scenario+'.json','utf8'));
assert(server.serverEvents===target&&server.uniqueIds===target&&server.originalsUnchanged&&server.priorScenarioEventsUnchanged&&server.tombs===0);
assert.equal(ipad.d.control.serverCreatedAt,server.newEventServerTime);assert.equal(pc.d.control.serverCreatedAt,server.newEventServerTime);
const metrics={serverResponseToRenderMs:path.render.elapsedMs-path.read.elapsedMs,mergeMs:path.committed.elapsedMs-path.mergeStart.elapsedMs,
 commitToRenderMs:path.render.elapsedMs-path.committed.elapsedMs,
 approximateServerCreatedToRenderMs:Date.parse(path.render.at)-Date.parse(server.newEventServerTime),
 approximatePcAckToRenderMs:Date.parse(path.render.at)-Date.parse(pc.result.singleWriteConfirmations[0].at),crossDeviceClockLatencyExact:false};
const visibility=ipad.result.lifecycle.filter(v=>v.stage==='lifecycle.visibility'),allErrors=[...ipad.result.errors,...pc.result.errors];
let expectedConnectionErrors=[],unexpectedErrors=allErrors;
if(scenario==='B'){
 const hidden=visibility.find(v=>v.visible===false),visible=visibility.find(v=>v.visible===true&&v.elapsedMs>hidden?.elapsedMs);
 assert(hidden&&visible&&visible.elapsedMs<=path.render.elapsedMs,'Falta transición de segundo plano antes del render.');
 metrics.backgroundDurationMs=visible.elapsedMs-hidden.elapsedMs;
 metrics.visibleToRenderMs=path.render.elapsedMs-visible.elapsedMs;
 const ack=Date.parse(pc.result.singleWriteConfirmations[0].at);
 metrics.pcAckBetweenHiddenAndVisibleByWallClock=ack>=Date.parse(hidden.at)&&ack<=Date.parse(visible.at);
 assert(metrics.pcAckBetweenHiddenAndVisibleByWallClock,'Revisar si el evento se confirmó con Safari detrás.');
}
if(scenario==='C'){
 const offline=ipad.result.lifecycle.find(v=>v.stage==='lifecycle.offline'&&v.online===false),
 online=ipad.result.lifecycle.find(v=>v.stage==='lifecycle.online'&&v.online===true&&v.elapsedMs>offline?.elapsedMs);
 assert(offline&&online&&online.elapsedMs<path.read.elapsedMs,'Falta corte y reconexión antes de recibir el evento.');
 metrics.offlineDurationMs=online.elapsedMs-offline.elapsedMs;
 metrics.onlineToRenderMs=path.render.elapsedMs-online.elapsedMs;
 const ack=Date.parse(pc.result.singleWriteConfirmations[0].at);
 metrics.pcAckDuringOfflineByWallClock=ack>=Date.parse(offline.at)&&ack<=Date.parse(online.at);
 assert(metrics.pcAckDuringOfflineByWallClock,'Revisar si el evento se confirmó con iPad desconectado.');
 expectedConnectionErrors=ipad.result.errors.filter(v=>['firestore.read.error','engine.cycle.error'].includes(v.stage)&&v.code==='unavailable'&&v.elapsedMs>=offline.elapsedMs&&v.elapsedMs<=online.elapsedMs);
 unexpectedErrors=allErrors.filter(v=>!expectedConnectionErrors.includes(v));
 assert(expectedConnectionErrors.some(v=>v.stage==='firestore.read.error'),'Falta fallo efectivo de consulta durante el corte.');
}
const report={analyzedAt:new Date().toISOString(),scenario,initial,target,ipad:ipad.result,pc:pc.result,
 timeline:Object.fromEntries(Object.entries(path).map(([k,v])=>[k,{at:v.at,elapsedMs:v.elapsedMs,fromResponseMs:v.elapsedMs-path.read.elapsedMs}])),
 metrics,serverVerification:server,
 expectedConnectionErrors,unexpectedErrors,
 result:unexpectedErrors.length?'Revisar los errores inesperados; no avanzar automáticamente.':'Secuencia completa de recepción, incorporación y render, sin duplicados ni pendientes; errores de conexión esperados identificados y conservados donde procede.',
 visibilityChanges:visibility,limitations:['Relojes de PC, servidor e iPad distintos: latencia entre dispositivos aproximada; tiempos monotónicos internos fiables.',
 'Procedencia física tomada del contexto del usuario; el JSON no identifica modelo/iPadOS ni certifica por sí solo ausencia visual de parpadeos.',
 'La causa del fallo original sigue sin identificar; una prueba favorable no demuestra resolución definitiva.'],
 networkAccess:false,firestoreWrites:false,newDeployment:false};
await writeFile(dest+'trace-analysis.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({scenario,buildId:expected,metrics,server,devices:[ipad,pc].map(({result:r})=>({device:r.device,entries:r.retainedEntries,sha256:r.sha256,dropped:r.dropped,errors:r.errors,lifecycle:r.lifecycle,local:r.local,longestSdkReadMs:r.longestSdkReadMs,unfinishedReadAtExport:r.unfinishedReadAtExport})),result:report.result},null,2));
