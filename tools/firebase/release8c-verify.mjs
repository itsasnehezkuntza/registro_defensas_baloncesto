// HTTPS y perfiles nuevos sin sesión. No escribe en Firestore ni abre perfiles deportivos.
import assert from'node:assert/strict';import{readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
import{chromium,idle,createGame,snapshot}from'./browser-support.mjs';const{webkit}=await import('@playwright/test');
const dir='.test-artifacts/firebase/fase8c/',pkg=JSON.parse(await readFile(dir+'package.json','utf8')),base='https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/';
const results=await Promise.allSettled(pkg.files.map(async f=>{const r=await fetch(base+f.file+'?verify='+pkg.pagesCommit);assert.equal(r.status,200,f.file);assert.equal(createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),f.sha256,f.file);return f.file;}));
for(const r of results)if(r.status==='rejected')throw r.reason;
const excluded=['README.md','ESPECIFICACION.md','FASE8C_PUBLICACION.md','package.json','firebase.json','firestore.rules','EJEMPLO.html','preview-bootstrap.js','js/sync-diagnostics.js','js/diagnostic8b7.js','tools/firebase/diagnostic8b7-client.js','tests/sync-fixture.html','.test-artifacts/firebase/fase8c/package.json'];
const privateResults=await Promise.allSettled(excluded.map(async p=>{const r=await fetch(base+p+'?verify='+pkg.pagesCommit);assert.equal(r.status,404,p);return p;}));for(const r of privateResults)if(r.status==='rejected')throw r.reason;
const sdkChecks=await Promise.allSettled(['app','auth','firestore'].map(async n=>{const r=await fetch('https://www.gstatic.com/firebasejs/12.11.0/firebase-'+n+'.js');assert.equal(r.status,200);return{module:n,status:r.status};}));for(const r of sdkChecks)if(r.status==='rejected')throw r.reason;
const browsers=[];
for(const[name,type]of[['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch();try{
  const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));context.on('request',r=>requests.push(r.url()));
  await page.goto(base);await idle(page);assert.equal(await page.locator('meta[name="app-version"]').getAttribute('content'),'8C.0');
  await page.waitForFunction(()=>!document.getElementById('googleLogin').disabled||!document.getElementById('accountRetry').hidden,undefined,{timeout:20000});
  const accountReady=!await page.locator('#googleLogin').isDisabled(),accountError=await page.locator('#accountMessage').textContent();
  assert(accountReady,'Inicialización Google: '+accountError);
  assert.equal(await page.locator('#cloudStatus').textContent(),'Solo local');assert.equal((await snapshot(page)).games.length,0);
  await createGame(page,'Ficticio local de verificación 8C');await page.locator('.action-btn').first().click();await page.locator('[data-points="2"][data-result="fallado"]').click();await idle(page);assert.equal((await snapshot(page)).events.length,1);
  await page.reload();await idle(page);assert.equal((await snapshot(page)).events.length,1);assert.deepEqual(errors,[]);
  const firebaseRequests=requests.filter(u=>/firestore\.googleapis\.com|firebase-firestore\.js/.test(u));assert.deepEqual(firebaseRequests,[]);
  browsers.push({browser:name,rawOfficialSdkLoaded:true,googleReady:accountReady,localMode:true,localRecordAndReload:true,firestoreRequests:0,errors});await context.close();
 }finally{await browser.close();}
}
const report={verifiedAt:new Date().toISOString(),url:base,version:pkg.version,sourceCommit:pkg.sourceCommit,pagesCommit:pkg.pagesCommit,filesVerified:results.length,excludedPaths404:privateResults.length,sdk:sdkChecks.map(r=>r.value),browsers,realFirestoreWrites:0,physicalSafariEmitterCheck:'pending-user'};await writeFile(dir+'deployed-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
