// Copia del candidato aprobado 8B.5; habilita únicamente merge validado y emisor único.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const prior='.test-artifacts/firebase/fase8b4/diagnostic-candidate/',dir='.test-artifacts/firebase/fase8b6/candidate/';
const manifest=JSON.parse(await readFile(prior+'manifest.json','utf8')),content=new Map();
for(const f of manifest.files){const b=await readFile(prior+'public/'+f.file);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);content.set(f.file,f.file.endsWith('.ttf')?b:b.toString('utf8'));}
let engine=content.get('js/sync-engine.js');
const old="alive(); syncTrace('diagnostic.remote.observed', {games:remote.length}); alive();";
assert(engine.includes(old));
engine="import {beforeDiagnosticMerge} from './diagnostic8b6.js';\n"+engine.replace(old,"alive(); if(beforeDiagnosticMerge(c,remote)){syncTrace('diagnostic6.merge.start',{remoteEvents:remote.reduce((n,g)=>n+g.events.length,0)});await mergeRemote(c,remote);alive();syncTrace('diagnostic6.merge.complete');} alive();")
  .replace("status('Solo lectura', 'Respuesta remota recibida; copia local conservada.')","status('Recepción activa', 'Envíos, borrado y migración bloqueados. Preparar antes del evento único.')")
  .replace("syncTrace('engine.cycle.error', { code: error.code });", "syncTrace('engine.cycle.error', { code: error.code }); if(['DIAGNOSTIC_STOP','SYNC_CONFLICT'].includes(error.code))stopped=true;")
  .replace('async retry() { alive(); await retryOperations(c); this.wake(); }',"async retry() { throw Object.assign(Error('Reintento bloqueado.'),{code:'DIAGNOSTIC_STOP'}); }");
content.set('js/sync-engine.js',engine);
content.set('js/diagnostic8b6.js',await readFile('tools/firebase/diagnostic8b6-client.js','utf8'));
let ui=content.get('js/sync-diagnostics-ui.js');
ui=ui.replace('const report = syncDiagnosticSnapshot();',"const report = syncDiagnosticSnapshot(); report.control=(await import('./diagnostic8b6.js')).diagnosticState();")
  .replace("pending, scopeVersion: c.version","pending, scopeVersion: c.version, screenEvents: Number(document.querySelector('#gameTotal b:last-child')?.textContent ?? NaN), uniqueEvents: new Set(state.events.map(e=>e.id)).size")
  .replace('diagnostico-sync-8b4.json','diagnostico-sync-8b6.json');
content.set('js/sync-diagnostics-ui.js',ui);
const buildId='8b6-'+createHash('sha256').update([...content.entries()].map(([f,b])=>f+createHash('sha256').update(b).digest('hex')).join('\n')).digest('hex').slice(0,16);
content.set('preview-bootstrap.js',content.get('preview-bootstrap.js').replaceAll(manifest.buildId,buildId).replace('Diagnóstico de solo lectura ·','Diagnóstico de recepción 8B.6 ·')+"\n(await import('./js/diagnostic8b6.js')).mountDiagnostic6();\n");
const files=[];
for(const [file,bytes]of content){await mkdir(new URL('./',new URL(dir+'public/'+file,'file:///'+process.cwd().replaceAll('\\','/')+'/')),{recursive:true});await writeFile(dir+'public/'+file,bytes);files.push({file,sha256:createHash('sha256').update(bytes).digest('hex')});}
await writeFile(dir+'manifest.json',JSON.stringify({buildId,baselineVersion:'b7a7d00cc1e5587b',receiver:true,files},null,2));
console.log(JSON.stringify({buildId,files:files.length,receiverWritesToFirestore:false,singleSenderEvent:'reserved-fixed-id'}));
