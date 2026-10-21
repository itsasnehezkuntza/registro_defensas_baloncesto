// Solo lectura: vigencia/destino/reglas. Nunca crea o renueva canales ni lee datos ajenos.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require=createRequire(import.meta.url), cli=n=>require('firebase-tools/lib/'+n);
const project='registro-defensivo', channel='ipad-8b2';
await cli('requireAuth.js').requireAuth({project,...cli('auth.js').getGlobalDefaultAccount()},true);
const api=cli('hosting/api.js'), current=await api.getChannel(project,project,channel);
const result={checkedAt:new Date().toISOString(),projectId:project,channelId:channel,
  exists:Boolean(current),expireTime:current?.expireTime??null,
  active:Boolean(current?.expireTime&&Date.parse(current.expireTime)>Date.now()),
  url:current?.url??null,versionBefore:current?.release?.version?.name??null};
const dir='.test-artifacts/firebase/fase8b6/';await mkdir(dir,{recursive:true});
if(!result.active){await writeFile(dir+'preflight.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));throw Error('STOP: canal inexistente o caducado. No publicar ni renovar; hace falta nueva autorización.');}
const live=await api.getChannel(project,project,'live');
result.liveReleaseBefore=live?.release?.name??null;result.liveVersionBefore=live?.release?.version?.name??null;
const rules=cli('gcp/rules.js');
const release=(await rules.listAllReleases(project)).find(r=>r.name===`projects/${project}/releases/cloud.firestore`);
if(!release)throw Error('STOP: falta release de reglas.');
const files=await rules.getRulesetContent(release.rulesetName);
const normalized=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trim();
const local=normalized(await readFile('firestore.rules','utf8'));
if(files.length!==1||normalized(files[0].content)!==local)throw Error('STOP: reglas diferentes.');
Object.assign(result,{rulesMatch:true,ruleset:release.rulesetName,rulesHash:createHash('sha256').update(local).digest('hex')});
await writeFile(dir+'preflight.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
