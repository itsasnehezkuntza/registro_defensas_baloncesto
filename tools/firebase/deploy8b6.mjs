// Publica solo diagnóstico 8B.6 en canal vigente. Sin wrapper de renovación TTL.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
if(!process.argv.includes('--publish-approved-8b6'))throw Error('Publicación no solicitada.');
await import('./audit8b6.mjs');
const require=createRequire(import.meta.url),cli=n=>require('firebase-tools/lib/'+n);
assert.equal(require('firebase-tools/package.json').version,'15.11.0');
const dir='.test-artifacts/firebase/fase8b6/',before=JSON.parse(await readFile(dir+'preflight.json','utf8')),manifest=JSON.parse(await readFile(dir+'candidate/manifest.json','utf8'));
const tests=JSON.parse(await readFile(dir+'emulator.json','utf8'));assert.equal(tests.results.length,2);assert(tests.results.every(r=>r.trace.buildId===manifest.buildId&&r.events===3&&r.receiverCloudWrites===0));
const initial=JSON.parse(await readFile(dir+'read-fixture.json','utf8'));assert(!initial.gameDeleted&&initial.events.length===2&&initial.tombs===0);
const project='registro-defensivo',channel='ipad-8b2';assert(before.active&&before.rulesMatch&&before.projectId===project);
const options={project,projectId:project,site:project,...cli('auth.js').getGlobalDefaultAccount(),cwd:process.cwd(),configPath:'firebase.diagnostic8b6.preview.json',nonInteractive:true,only:'hosting',message:'8B.6 recepción controlada '+manifest.buildId};
options.config=cli('config.js').Config.load(options);assert.deepEqual(Object.keys(options.config.src),['hosting']);
await cli('requireAuth.js').requireAuth(options,true);
await cli('requirePermissions.js').requirePermissions(options,['firebasehosting.sites.update']);
const api=cli('hosting/api.js');
async function unchanged(){const c=await api.getChannel(project,project,channel);assert(c?.expireTime&&Date.parse(c.expireTime)>Date.now(),'STOP: canal caducado.');assert.equal(c.expireTime,before.expireTime);assert.equal(c.release?.version?.name,before.versionBefore);return c;}
await unchanged();
const rule=(await cli('gcp/rules.js').listAllReleases(project)).find(r=>r.name===`projects/${project}/releases/cloud.firestore`);assert.equal(rule?.rulesetName,before.ruleset);
for(const fn of['createChannel','updateChannelTtl','deleteChannel','createSite','updateSite','deleteSite','addAuthDomains','removeAuthDomain','cleanAuthState'])api[fn]=async()=>{throw Error('Operación no autorizada: '+fn)};
const client=new(cli('apiv2.js').Client)({urlPrefix:cli('api.js').hostingApiOrigin(),apiVersion:'v1beta1',auth:true});
async function inventory(version){let pageToken;const files=[];do{const r=await client.get('/'+version+'/files',{queryParams:{pageSize:100,...(pageToken?{pageToken}:{})}});files.push(...r.body.files||[]);pageToken=r.body.nextPageToken;}while(pageToken);return files;}
const release=api.createRelease;
api.createRelease=async(site,id,version,partial)=>{
 assert.equal(site,project);assert.equal(id,channel);assert(/^(?:projects\/(?:registro-defensivo|760744900094)\/)?sites\/registro-defensivo\/versions\/[a-f0-9]+$/.test(version));await unchanged();
 const actual=await inventory(version),prior=await inventory(before.versionBefore),generated=['/__/firebase/init.js','/__/firebase/init.json'];
 assert.deepEqual(actual.map(f=>f.path).sort(),[...manifest.files.map(f=>'/'+f.file),...generated].sort());
 for(const f of manifest.files){const bytes=await readFile(dir+'candidate/public/'+f.file);assert.equal(actual.find(a=>a.path==='/'+f.file)?.hash,createHash('sha256').update(gzipSync(bytes,{level:9})).digest('hex'));}
 for(const path of generated)assert.equal(actual.find(f=>f.path===path)?.hash,prior.find(f=>f.path===path)?.hash);
 await writeFile(dir+'uploaded-review.json',JSON.stringify({version,files:39,hashesMatch:true,generatedUnchanged:true},null,2));
 return release(site,id,version,partial);
};
const hosting=cli('deploy/hosting/index.js'),context={projectId:project,hostingChannel:channel};
await hosting.prepare(context,options);assert.equal(context.hosting.deploys.length,1);assert.equal(context.hosting.deploys[0].config.site,project);
await hosting.deploy(context,options);
await writeFile(dir+'prepared-version.json',JSON.stringify({version:context.hosting.deploys[0].version,buildId:manifest.buildId},null,2));
await hosting.release(context,options,{});
const after=await api.getChannel(project,project,channel),live=await api.getChannel(project,project,'live');
const result={deployedAt:new Date().toISOString(),projectId:project,channelId:channel,url:after.url,buildId:manifest.buildId,files:39,version:after.release?.version?.name,
 expireTimeBefore:before.expireTime,expireTimeAfter:after.expireTime,expiryUnchanged:before.expireTime===after.expireTime,
 liveUnchanged:(live?.release?.name??null)===before.liveReleaseBefore&&(live?.release?.version?.name??null)===before.liveVersionBefore,
 rulesPublished:false,realFirestoreWrites:0,physicalTrial:'pending',startupCorrectionIncluded:false};
await writeFile(dir+'deployment.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));assert(result.expiryUnchanged&&result.liveUnchanged);
