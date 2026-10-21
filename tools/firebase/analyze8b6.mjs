// Solo analiza datos JSON aportados. Sin red, evaluación de código ni operaciones Firebase.
import assert from 'node:assert/strict';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const [ipadPath,pcPath]=process.argv.slice(2);
if(!ipadPath||!pcPath)throw Error('Indicar diagnósticos iPad y PC.');
const dir='.test-artifacts/firebase/fase8b6/';
const expected=JSON.parse(await readFile(dir+'candidate/manifest.json','utf8')).buildId;
async function analyze(path,device){
 const bytes=await readFile(path),d=JSON.parse(bytes.toString('utf8'));assert.equal(d.format,'sync-diagnostic-8b4');assert.equal(d.buildId,expected);assert.equal(d.entries.length,500);
 const e=d.entries,st=s=>e.filter(v=>v.stage===s);
 const queries=st('firestore.read.received'),eventQueries=queries.filter(v=>v.kind==='events');
 assert(d.control.armed&&!d.control.frozen);assert.equal(d.control.initialEvents,2);
 for(const field of ['localEvents','screenEvents','uniqueEvents'])assert.equal(d.local[field],3);
 assert.equal(d.local.pending,0);assert(d.local.selected);assert.equal(d.local.games,1);
 const result={device,sha256:createHash('sha256').update(bytes).digest('hex'),buildId:d.buildId,generatedAt:d.generatedAt,
  retainedEntries:e.length,dropped:d.dropped,firstRetainedAt:e[0].at,lastRetainedAt:e.at(-1).at,control:d.control,local:d.local,
  sdkResponses:queries.length,serverOnly:queries.every(v=>v.fromCache===false),withoutPendingWrites:queries.every(v=>v.hasPendingWrites===false),
  remoteEventCounts:[...new Set(eventQueries.map(v=>v.count))],queueCounts:[...new Set(st('engine.queue.read').map(v=>v.pending))],
  errors:e.filter(v=>v.stage.endsWith('.error')),lifecycle:e.filter(v=>v.stage.startsWith('lifecycle.')),
  sendStarts:st('engine.send.start').length,singleWriteConfirmationsRetained:st('diagnostic6.single-write.confirmed').length,
  renders:st('app.state.rendered'),changedCommits:st('storage.merge.committed').filter(v=>v.changed),
  remoteNotifications:st('storage.remote.notify').length};
 await copyFile(path,dir+device+'-diagnostic.json');return{d,result};
}
const ipad=await analyze(ipadPath,'ipad'),pc=await analyze(pcPath,'pc');
assert.equal(ipad.d.control.attempted,false);assert.equal(pc.d.control.attempted,true);
const e=ipad.d.entries,firstRead=e.findIndex(v=>v.stage==='firestore.read.received'&&v.kind==='events'&&v.count===3);
assert(firstRead>=0&&e.slice(0,firstRead).some(v=>v.stage==='firestore.read.received'&&v.kind==='events'&&v.count===2));
let cursor=firstRead;
const next=(stage,condition=()=>true)=>{const i=e.findIndex((v,i)=>i>=cursor&&v.stage===stage&&condition(v));assert(i>=0,'Etapa ausente: '+stage);cursor=i+1;return e[i];};
const path={read:e[firstRead],pull:next('engine.pull.received',v=>v.remoteEvents===3),validated:next('diagnostic6.remote.validated',v=>v.remoteEvents===3),
 mergeStart:next('storage.merge.start'),committed:next('storage.merge.committed',v=>v.changed===true),notify:next('storage.remote.notify'),
 appReceived:next('app.remote.received'),stateRead:next('app.refresh.read',v=>v.localEvents===3),render:next('app.state.rendered',v=>v.localEvents===3)};
const base=path.read.elapsedMs;
const timeline=Object.fromEntries(Object.entries(path).map(([key,v])=>[key,{at:v.at,elapsedMs:v.elapsedMs,msFromFirstThreeResponse:v.elapsedMs-base}]));
const verifier=JSON.parse(await readFile(dir+'server-verification.json','utf8'));
assert.equal(verifier.serverEvents,3);assert.equal(verifier.uniqueDocumentIds,3);assert(verifier.originalPayloadsAndTimestampsUnchanged&&verifier.exactlyOneNewReservedEvent);
const report={analyzedAt:new Date().toISOString(),ipad:ipad.result,pc:pc.result,ipadCriticalTimeline:timeline,
 ipadServerResponseToRenderMs:path.render.elapsedMs-path.read.elapsedMs,
 ipadCommitToRenderMs:path.render.elapsedMs-path.committed.elapsedMs,
 serverCreatedAt:verifier.newEventServerTime,wallClockServerToRenderMs:Date.parse(path.render.at)-Date.parse(verifier.newEventServerTime),
 crossClockLatencyExact:false,serverVerification:verifier,
 conclusion:'Recepción completa 2→3 acreditada en la ejecución física aportada, ambos con tres IDs locales distintos y cola final cero; incidencia original no resuelta definitivamente.',
 limitations:['Registro circular descartó entradas antiguas: 562 iPad y 942 PC. No permite certificar todo el arranque ni ausencia de errores anterior al tramo retenido.',
 'El PC no conserva single-write.confirmed ni su primera incorporación/render de tres; el servidor y la cola/estado finales sí están verificados.',
 'La secuencia crítica de Safari está completa y conserva respuesta previa de dos. No se observa interrupción en esas etapas.',
 'Los tiempos entre servidor y dispositivos usan relojes distintos. Modelo/iPadOS y prueba visual de ausencia de parpadeo no constan en el JSON.'],
 networkAccess:false,firestoreWrites:false,newDeployments:false};
await writeFile(dir+'trace-analysis.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
