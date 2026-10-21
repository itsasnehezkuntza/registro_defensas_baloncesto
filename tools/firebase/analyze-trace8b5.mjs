// Trata el JSON aportado como datos: no ejecuta contenido ni accede a Firebase.
import assert from 'node:assert/strict';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const input = process.argv[2];
const ipad = process.argv.includes('--ipad');
if (!input) throw Error('Indicar el archivo de diagnóstico.');
const bytes = await readFile(input), report = JSON.parse(bytes.toString('utf8'));
assert.equal(report.format, 'sync-diagnostic-8b4');
assert.equal(report.buildId, '8b4-256eb8ba4e2907e6');
assert(Array.isArray(report.entries));
const entries = report.entries, stage = name => entries.filter(e => e.stage === name);
const stats = values => {
  const sorted = [...values].sort((a,b) => a-b), n = sorted.length;
  return n ? { count:n, minMs:Math.min(...values), maxMs:Math.max(...values), medianMs:n%2 ? sorted[(n-1)/2] : (sorted[n/2-1]+sorted[n/2])/2 } : {count:0};
};
const active = new Map(), matched = [];
for (const e of entries) {
  if (e.stage === 'firestore.read.start') {
    const queue = active.get(e.kind) || []; queue.push(e); active.set(e.kind, queue);
  } else if (['firestore.read.received','firestore.read.error'].includes(e.stage)) {
    const start = active.get(e.kind)?.shift(); assert(start, 'Respuesta sin inicio.');
    matched.push({kind:e.kind, startedAt:start.at, endAt:e.at, durationMs:e.durationMs ?? e.elapsedMs-start.elapsedMs, stage:e.stage});
  }
}
const starts = stage('engine.cycle.start'), pulls = stage('engine.pull.received'), sdk = stage('firestore.read.received');
const summary = {
  source:ipad ? 'archivo aportado como diagnóstico de Safari del iPad; modelo/iPadOS no incluidos' : 'ordenador, confirmado por el usuario; no es Safari del iPad',
  sha256:createHash('sha256').update(bytes).digest('hex'),
  buildId:report.buildId, baselineVersion:report.baselineVersion, generatedAt:report.generatedAt,
  firstAt:entries[0].at, captureMs:entries.at(-1).elapsedMs, entries:entries.length, dropped:report.dropped,
  cyclesStarted:starts.length, cyclesCompleted:pulls.length,
  cycleStartIntervals:stats(starts.slice(1).map((e,i)=>e.elapsedMs-starts[i].elapsedMs)),
  pullDuration:stats(pulls.map(e=>{const s=stage('engine.pull.start').filter(s=>s.elapsedMs<=e.elapsedMs).at(-1);return e.elapsedMs-s.elapsedMs})),
  sdkStarted:stage('firestore.read.start').length, sdkReceived:sdk.length,
  sdkErrors:stage('firestore.read.error'), allReceivedFromServer:sdk.every(e=>e.fromCache===false),
  allReceivedWithoutPendingWrites:sdk.every(e=>e.hasPendingWrites===false),
  eventReads:stage('firestore.read.received').filter(e=>e.kind==='events').map(e=>({at:e.at,count:e.count})),
  uniqueRemoteEventCounts:[...new Set(pulls.map(e=>e.remoteEvents))],
  uniqueQueueCounts:[...new Set(stage('engine.queue.read').map(e=>e.pending))],
  local:report.local, renders:stage('app.state.rendered'), appErrors:stage('app.refresh.error'),
  engineErrors:stage('engine.cycle.error'), engineSendStarts:stage('engine.send.start').length,
  lifecycle:entries.filter(e=>e.stage.startsWith('lifecycle.')),
  pendingReadsAtExport:[...active.values()].flat().map(e=>({kind:e.kind,startedAt:e.at,ageAtExportMs:entries.at(-1).elapsedMs-e.elapsedMs})),
  limitations:['Dos eventos ya renderizados desde IndexedDB antes de la primera respuesta remota.',
    'Solo lectura: incorporación remota deliberadamente bloqueada; no prueba un alta remota nueva.',
    ipad ? 'No identifica la causa original: lectura de datos existentes, sin incorporación ni alta remota nueva.' : 'No identifica la causa de la incidencia de Safari; falta archivo descargado desde el iPad.'],
  firebaseAccessByAnalyzer:false, deployedChanges:false
};
assert.equal(summary.sdkStarted, matched.length+summary.pendingReadsAtExport.length);
const dir='.test-artifacts/firebase/fase8b5/';
const prefix = ipad ? 'ipad' : 'desktop';
await copyFile(input,dir+prefix+'-diagnostic.json');
await writeFile(dir+prefix+'-trace-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
