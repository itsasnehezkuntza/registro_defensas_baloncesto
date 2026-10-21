// Sin navegador/red ni IndexedDB: privacidad, límite y conservación inicial del candidato.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const dir=new URL('../../.test-artifacts/firebase/fase8b7/',import.meta.url),manifest=JSON.parse(await readFile(new URL('candidate/manifest.json',dir),'utf8'));
const d=await import(new URL('candidate/public/js/sync-diagnostics.js',dir));
d.enableSyncDiagnostics({buildId:manifest.buildId});
d.syncTrace('diagnostic7.prepared',{kind:'A',count:3,token:'PRIVATE',email:'private@example.test',payload:{id:'PRIVATE'}});
for(let i=0;i<10050;i++)d.syncTrace('test.entry',{count:i});
const saved=d.syncDiagnosticSnapshot();
assert.equal(saved.entries.length,10000);assert.equal(saved.entries[0].stage,'diagnostic.enabled');assert.equal(saved.entries[1].stage,'diagnostic7.prepared');assert(saved.overflow&&d.diagnosticOverflow());assert.equal(saved.retentionPolicy,'preserve-initial');assert(saved.dropped>0);assert(!JSON.stringify(saved).includes('PRIVATE'));assert(!JSON.stringify(saved).includes('example.test'));
d.enableSyncDiagnostics({buildId:manifest.buildId});assert(!d.diagnosticOverflow());assert.equal(d.syncDiagnosticSnapshot().entries.length,1);assert.equal(saved.entries.length,10000);
const result={buildId:manifest.buildId,initialSequencePreserved:true,capacity:10000,overflowVisible:true,resetDoesNotMutateArchivedSnapshot:true,noPrivateFields:true,networkAccess:false};
await writeFile(new URL('retention.json',dir),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
