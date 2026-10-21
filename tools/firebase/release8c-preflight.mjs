// Lectura exclusiva de configuración pública y reglas. Ningún acceso deportivo ni despliegue.
import{createRequire}from'node:module';import{readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';import assert from'node:assert/strict';
const require=createRequire(import.meta.url),cli=n=>require('firebase-tools/lib/'+n),project='registro-defensivo';
await cli('requireAuth.js').requireAuth({project,...cli('auth.js').getGlobalDefaultAccount()},true);
const rules=cli('gcp/rules.js'),release=(await rules.listAllReleases(project)).find(r=>r.name===`projects/${project}/releases/cloud.firestore`),files=await rules.getRulesetContent(release.rulesetName),norm=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trim();
const local=norm(await readFile('firestore.rules','utf8'));assert(files.length===1&&norm(files[0].content)===local,'Reglas diferentes.');
const {firebaseSettings}=await import('../../.test-artifacts/publicacion8c-repo/js/firebase-config.js');
assert(firebaseSettings.enabled&&!firebaseSettings.authEmulator&&firebaseSettings.config.projectId===project);
const url=new URL('https://identitytoolkit.googleapis.com/v1/projects');url.searchParams.set('key',firebaseSettings.config.apiKey);url.searchParams.set('firebaseAppId',firebaseSettings.config.appId);
const response=await fetch(url),body=await response.json();assert(response.ok);assert(body.authorizedDomains.includes('itsasnehezkuntza.github.io'));
const client=new(cli('apiv2.js').Client)({urlPrefix:'https://identitytoolkit.googleapis.com',apiVersion:'v2',auth:true});
const provider=await client.get('/projects/'+project+'/defaultSupportedIdpConfigs/google.com',{skipLog:{resBody:true}});assert.equal(provider.body.enabled,true);
const report={checkedAt:new Date().toISOString(),projectId:project,googleProviderEnabled:true,pagesDomainAuthorized:true,rulesMatch:true,ruleset:release.rulesetName,rulesHash:createHash('sha256').update(local).digest('hex'),sportsDataRead:false,firestoreWrites:0,rulesPublished:false};
await writeFile('.test-artifacts/firebase/fase8c/preflight.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
