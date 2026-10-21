// Solo metadatos Hosting y reglas. Nunca publica, renueva o escribe Firestore.
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),cli=n=>require('firebase-tools/lib/'+n),project='registro-defensivo';
await cli('requireAuth.js').requireAuth({project,...cli('auth.js').getGlobalDefaultAccount()},true);
const api=cli('hosting/api.js'),channel=await api.getChannel(project,project,'ipad-8b2');
const result={checkedAt:new Date().toISOString(),projectId:project,channelId:'ipad-8b2',exists:Boolean(channel),
 active:Boolean(channel?.expireTime&&Date.parse(channel.expireTime)>Date.now()),expireTime:channel?.expireTime??null,url:channel?.url??null,version:channel?.release?.version?.name??null};
const dir='.test-artifacts/firebase/fase8b7/';await mkdir(dir,{recursive:true});
if(result.active){
 const live=await api.getChannel(project,project,'live');result.liveVersion=live?.release?.version?.name??null;
 const rules=cli('gcp/rules.js'),release=(await rules.listAllReleases(project)).find(r=>r.name===`projects/${project}/releases/cloud.firestore`);
 if(!release)throw Error('STOP: falta release de reglas.');
 const files=await rules.getRulesetContent(release.rulesetName),norm=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trim();
 const local=norm(await readFile('firestore.rules','utf8'));
 result.rulesMatch=files.length===1&&norm(files[0].content)===local;result.ruleset=release.rulesetName;result.rulesHash=createHash('sha256').update(local).digest('hex');
}
if(process.argv.includes('--closure')){
 const before=JSON.parse(await readFile(dir+'preflight.json','utf8'));
 if(result.version!==before.version||result.expireTime!==before.expireTime||result.ruleset!==before.ruleset)throw Error('STOP: cambió el entorno durante la preparación; no corregir automáticamente.');
}
await writeFile(dir+(process.argv.includes('--closure')?'closure.json':'preflight.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
if(!result.active)throw Error('STOP: canal caducado o inexistente. No renovar sin autorización.');
if(!result.rulesMatch)throw Error('STOP: reglas diferentes.');
