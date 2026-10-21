import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir='.test-artifacts/firebase/fase8b6/candidate/',manifest=JSON.parse(await readFile(dir+'manifest.json','utf8'));
const previous=JSON.parse(await readFile('.test-artifacts/firebase/fase8b4/diagnostic-candidate/manifest.json','utf8'));
async function walk(path,prefix=''){const paths=[];for(const e of await readdir(path,{withFileTypes:true})){assert(!e.isSymbolicLink());if(e.isDirectory())paths.push(...await walk(path+'/'+e.name,prefix+e.name+'/'));else paths.push(prefix+e.name);}return paths.sort();}
assert.equal(manifest.files.length,39);assert.deepEqual(await walk(dir+'public'),manifest.files.map(f=>f.file).sort());
const allowed=['preview-bootstrap.js','js/sync-engine.js','js/sync-diagnostics-ui.js','js/diagnostic8b6.js'],changed=[];
for(const f of manifest.files){const bytes=await readFile(dir+'public/'+f.file);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);assert(!/(^\.|\.(md|json|rules|env|map)$|^(tests|tools)\/)/i.test(f.file));if(!f.file.endsWith('.ttf'))assert(!/-----BEGIN [^-]*PRIVATE KEY-----|"type"\s*:\s*"service_account"|"private_key"\s*:|"refresh_token"\s*:/i.test(bytes.toString('utf8')));if(previous.files.find(p=>p.file===f.file)?.sha256!==f.sha256)changed.push(f.file);}
assert.deepEqual(changed.sort(),allowed.sort());
const transport=await readFile(dir+'public/js/firestore-sync.js','utf8');assert(transport.includes('send:blocked,createTeam:blocked'));
const boot=await readFile(dir+'public/preview-bootstrap.js','utf8');for(const id of['undoBtn','deleteGameBtn','confirmDeleteBtn','syncImport','syncConfirm','syncRetry','newGameBtn','resultButtons'])assert(boot.includes('#'+id));
const cfg=JSON.parse(await readFile('firebase.diagnostic8b6.preview.json','utf8'));assert.deepEqual(Object.keys(cfg),['hosting']);assert.equal(cfg.hosting.site,'registro-defensivo');assert.equal(cfg.hosting.public,dir+'public');assert(!cfg.hosting.predeploy&&!cfg.hosting.postdeploy&&!cfg.hosting.rewrites);
assert(/enabled:\s*false/.test(await readFile('js/sync-config.js','utf8')));
const report={checkedAt:new Date().toISOString(),buildId:manifest.buildId,files:39,changed,unchanged:35,privateCredentials:false,internalDocs:false,rootSyncOff:true};
await writeFile('.test-artifacts/firebase/fase8b6/audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
