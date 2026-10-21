// Solo candidato local: no hay código de despliegue ni llamadas a Firebase.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const prior='.test-artifacts/firebase/fase8b6/candidate/',dir='.test-artifacts/firebase/fase8b7/candidate/';
const manifest=JSON.parse(await readFile(prior+'manifest.json','utf8')),files=new Map();
for(const f of manifest.files){const b=await readFile(prior+'public/'+f.file);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);if(f.file!=='js/diagnostic8b6.js')files.set(f.file,f.file.endsWith('.ttf')?b:b.toString('utf8'));}
files.set('js/diagnostic8b7.js',await readFile('tools/firebase/diagnostic8b7-client.js','utf8'));
files.set('js/sync-engine.js',files.get('js/sync-engine.js').replaceAll('diagnostic8b6.js','diagnostic8b7.js').replaceAll('diagnostic6.','diagnostic7.'));
let log=files.get('js/sync-diagnostics.js');
assert(log.includes('if (entries.length > 500) { entries.shift(); dropped++; }'));
log=log.replace('entries.push({','if (entries.length >= 10000) { dropped++; return; }\n    entries.push({').replace('if (entries.length > 500) { entries.shift(); dropped++; }','// No descartar la secuencia inicial. Saturación visible; el escenario se detiene.').replace("enabled, dropped,","enabled, dropped, overflow: dropped > 0, maxEntries: 10000, retentionPolicy: 'preserve-initial',");
files.set('js/sync-diagnostics.js',log);
files.set('js/sync-diagnostics.js',files.get('js/sync-diagnostics.js')+'\nexport const diagnosticOverflow=()=>dropped>0;\n');
files.set('js/sync-diagnostics-ui.js',files.get('js/sync-diagnostics-ui.js').replaceAll('diagnostic8b6.js','diagnostic8b7.js').replaceAll('diagnostico-sync-8b6.json','diagnostico-sync-8b7.json').replace('report.control=(await import', 'report.savedScenarios=(await import(\'./diagnostic8b7.js\')).diagnosticHistory(); report.control=(await import'));
const buildId='8b7-'+createHash('sha256').update([...files].map(([f,b])=>f+createHash('sha256').update(b).digest('hex')).join('\n')).digest('hex').slice(0,16);
files.set('preview-bootstrap.js',files.get('preview-bootstrap.js').replaceAll(manifest.buildId,buildId).replaceAll('diagnostic8b6.js','diagnostic8b7.js').replaceAll('mountDiagnostic6','mountDiagnostic7').replaceAll('8B.6','8B.7'));
const list=[];
for(const[file,b]of files){await mkdir(new URL('./',new URL(dir+'public/'+file,'file:///'+process.cwd().replaceAll('\\','/')+'/')),{recursive:true});await writeFile(dir+'public/'+file,b);list.push({file,sha256:createHash('sha256').update(b).digest('hex')});}
await writeFile(dir+'manifest.json',JSON.stringify({buildId,files:list,baselineVersion:manifest.buildId,deployed:false,scenarios:['A','B','C'],maxNewEvents:3},null,2));console.log(JSON.stringify({buildId,files:list.length,deployed:false}));
