// Paquete temporal exacto (salvo conexión Auth/proyecto de Emulator), dos IndexedDB aisladas.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import {chromium,officialSdk} from './browser-support.mjs';
const {webkit}=await import('@playwright/test');
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8085')throw Error('Solo Emulator demo-defensas.');
const env=await initializeTestEnvironment({projectId:'demo-defensas',firestore:{host:'127.0.0.1',port:8085,rules:await readFile('firestore.rules','utf8')}});
const dir='.test-artifacts/firebase/fase8b6/candidate/',origin='http://127.0.0.1:4193';
const manifest=JSON.parse(await readFile(dir+'manifest.json','utf8'));
const server=createServer(async(req,res)=>{const path=new URL(req.url,origin).pathname;if(path==='/seed'){res.writeHead(200,{'Content-Type':'text/html'}).end('<p>Emulator</p>');return;}const file=path==='/'?'index.html':path.slice(1);if(!manifest.files.some(f=>f.file===file)){res.writeHead(404).end();return;}try{res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':'text/plain'}).end(await readFile(dir+'public/'+file));}catch{res.writeHead(404).end();}});
await new Promise(ok=>server.listen(4193,'127.0.0.1',ok));
const uid='ficticio-8b6',hash=createHash('sha256').update(uid).digest('hex').slice(0,16);
const team='prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778',gid='0f901d0f-9885-499d-b40d-2e0234f51ad0';
const originals=['0ad91a0a-5b4b-4bf2-8c38-fe975e43e090','f5270206-1f1a-41c1-a98f-b4467891f125'];
const game={id:gid,jornada:'IPAD-8B2',rival:'Rival ficticio',createdAt:'2026-10-17T07:55:00.000Z'};
const events=originals.map((id,i)=>({id,payload:{id,gameId:gid,categoria:'TRANSICIÓN',accion:'BAJO ARO',valor_tiro:2,resultado:i?'anotado':'fallado',fecha_hora:'2026-10-17T07:56:00.000Z'}}));
const results=[];
try{
 for(const [name,type]of [['chromium',chromium],['webkit',webkit]]){
  await env.clearFirestore();
  const db=env.authenticatedContext(uid,{firebase:{sign_in_provider:'google.com'}}).firestore();
  let batch=sdk.writeBatch(db);batch.set(sdk.doc(db,'teams',team),{schemaVersion:1,name:'PRUEBA 8B.2 IPAD',ownerUid:uid,createdAt:sdk.serverTimestamp()});batch.set(sdk.doc(db,'teams',team,'members',uid),{schemaVersion:1,uid,role:'owner',status:'active',createdAt:sdk.serverTimestamp()});await batch.commit();
  const envelope=payload=>({schemaVersion:1,createdBy:uid,createdAt:sdk.serverTimestamp(),sourceId:'demo',payload});
  await sdk.setDoc(sdk.doc(db,'teams',team,'games',gid),{...envelope(game),deletedAt:null,deletedBy:null});
  batch=sdk.writeBatch(db);for(const e of events)batch.set(sdk.doc(db,'teams',team,'games',gid,'events',e.id),envelope(e.payload));await batch.commit();
  const browser=await type.launch(),contexts=[];
  async function device(sender=false,pending=false){
   const context=await browser.newContext({acceptDownloads:true,viewport:{width:1024,height:768}});contexts.push(context);await officialSdk(context,true);
   await context.route(origin+'/**',async r=>{
    const path=new URL(r.request().url()).pathname;
    if(path==='/seed'||path==='/')return r.continue();
    const file=path==='/'?'index.html':path.slice(1);let b;
    try{b=await readFile(dir+'public/'+file);}catch{return r.fulfill({status:404});}
    if(file.endsWith('.js')){
     let source=b.toString('utf8');
     // Solo harness: origen loopback para no depender de permisos de red privada HTTPS→HTTP.
     if(file==='preview-bootstrap.js')source=source.replace("location.protocol!=='https:'","location.protocol!=='http:'").replace("location.hostname!=='registro-defensivo--ipad-8b2-40nbq9cf.web.app'","location.hostname!=='127.0.0.1'").replace(/const permitted=.*;/,'const permitted=true;');
     if(file==='js/firebase-config.js')source='export const firebaseSettings={enabled:false,authEmulator:true,config:{projectId:"demo-defensas"}};';
     if(file==='js/sync-config.js')source='export const syncSettings={enabled:true,emulator:true,allowRealWrites:false};';
     if(file==='js/cuenta.js')source=`export function createAccountController(){let s={status:'ready',busy:false,user:null,sessionVersion:0},f=[];globalThis.testSignIn=()=>{s={...s,user:{uid:${JSON.stringify(uid)}},sessionVersion:1};f.forEach(fn=>fn(s));};return{subscribe(fn){f.push(fn);fn(s)},start:async()=>{},act:async()=>{}}}`;
     if(file==='js/firestore-sync.js'){
      const begin=source.indexOf('async function unrestrictedTransport(uid)'),end=source.indexOf('const previewPlan=',begin);assert(begin>=0&&end>begin);
      source=source.slice(0,begin)+`async function unrestrictedTransport(uid){
       if(globalThis.testBackend)return globalThis.testBackend;
       const a=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'),sdk=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
       const app=a.initializeApp({projectId:'demo-defensas',apiKey:'demo',appId:'demo'},crypto.randomUUID()),db=sdk.getFirestore(app);
       sdk.connectFirestoreEmulator(db,'127.0.0.1',8085,{mockUserToken:{sub:uid,user_id:uid,firebase:{sign_in_provider:'google.com'}}});
       globalThis.testSDK=sdk;globalThis.testDB=db;const blocked=async()=>{throw Object.assign(Error('blocked'),{code:'DIAGNOSTIC_READ_ONLY'})};return globalThis.testBackend={...createFirestoreTransport(sdk,db,uid,()=>uid),send:blocked,createTeam:blocked};}
       `+source.slice(end);source=source.replace('"ownerHash":"7e6e354a4f4deb94"','"ownerHash":"'+hash+'"');
     }
     if(file==='js/diagnostic8b6.js'){
      source=source.replace("project:'registro-defensivo'","project:'demo-defensas'");
      const from=source.indexOf('async function sdkClient(c)'),to=source.indexOf('// En una transacción',from);
      source=source.slice(0,from)+'async function sdkClient(c){return{sdk:globalThis.testSDK,db:globalThis.testDB};}\n'+source.slice(to);
     }
     b=Buffer.from(source);
    }
    return r.fulfill({contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.ttf')?'font/ttf':file.endsWith('.csv')?'text/csv':'text/html',body:b});
   });
   const forbidden=[];context.on('request',r=>{if(!['registro-defensivo--ipad-8b2-40nbq9cf.web.app','www.gstatic.com','127.0.0.1'].includes(new URL(r.url()).hostname))forbidden.push(r.url());});
   context.on('requestfailed',r=>console.log(JSON.stringify({browser:name,path:new URL(r.url()).pathname,requestFailure:r.failure()?.errorText})));
   const page=await context.newPage();page.on('console',m=>{if(m.type()==='error')console.log('BROWSER '+m.text());});page.on('pageerror',e=>console.log('HARNESS '+name+' '+e.message));await page.goto(origin+'/seed');
   await page.evaluate(async({uid,team,gid,game,events,pending})=>{
    localStorage.setItem('prueba8b3-sync','7e6e354a4f4deb94');localStorage.setItem('prueba8b2-ipad',JSON.stringify({teamId:team}));
    const p=await import('./js/persistencia.js'),s=await import('./js/sync-storage.js');await p.openDatabase();s.setStorageIdentity(uid);s.setStorageScope(team);const c=s.storageContext();
    await s.mergeRemote(c,[{id:gid,payload:game,events,tombs:[]}]);
    await p.transact(['syncMeta','syncQueue'],'readwrite',(tx,done)=>{
     const st=tx.objectStore('syncMeta');st.put({key:'teams:'+JSON.stringify(['demo-defensas',uid]),value:[{id:team,name:'PRUEBA 8B.2 IPAD'}]});st.put({key:'preferred-team:'+JSON.stringify(['demo-defensas',uid]),value:team});st.put({key:'active:'+c.scope,value:gid});
     if(pending)tx.objectStore('syncQueue').add({key:[c.scope,'pending'],scope:c.scope,attempts:0});done();
    });
   },{uid,team,gid,game,events,pending});
   await page.goto(origin+(sender?'/?fase8b6=ordenador':'/'));
   if(!pending){await page.waitForFunction(()=>!!document.querySelector('#diagnostic6Prepare')&&typeof globalThis.testSignIn==='function'&&!!document.querySelector('#syncTeam')&&document.querySelector('#saveStatusText')?.textContent.includes('Guardado'));await page.evaluate(()=>globalThis.testSignIn());await page.waitForFunction(()=>document.querySelector('#gameTotal b:last-child')?.textContent==='2');await page.locator('#moreBtn').click();}
   return{page,forbidden};
  }
  try{
   const a=await device(true),b=await device();
   for(const d of[a,b]){await d.page.locator('#diagnostic6Prepare').click();try{await d.page.waitForFunction(()=>document.querySelector('#diagnostic6Status').textContent.startsWith('Preparado'),undefined,{timeout:12000});}catch(e){console.log(JSON.stringify(await d.page.evaluate(async()=>({status:document.querySelector('#diagnostic6Status').textContent,cloud:document.querySelector('#syncDetail')?.textContent,c:(await import('./js/sync-storage.js')).storageContext(),state:await(await import('./js/persistencia.js')).readState(),trace:(await import('./js/sync-diagnostics.js')).syncDiagnosticSnapshot().entries.slice(-20)}))));throw e;}}
   for(const id of['undoBtn','deleteGameBtn','syncImport','syncRetry','newGameBtn'])assert(await b.page.locator('#'+id).isDisabled(),id);
   const start=Date.now();await a.page.locator('#diagnostic6Send').click();await a.page.waitForFunction(()=>document.querySelector('#diagnostic6Status').textContent.startsWith('Servidor confirmó 3'));
   await b.page.waitForFunction(()=>document.querySelector('#gameTotal b:last-child')?.textContent==='3',undefined,{timeout:20000});
   const elapsedMs=Date.now()-start;
   const state=await b.page.evaluate(async()=>(await import('./js/persistencia.js')).readState());assert.equal(state.events.length,3);assert.equal(new Set(state.events.map(e=>e.id)).size,3);
   const server=await sdk.getDocs(sdk.collection(db,'teams',team,'games',gid,'events'));assert.equal(server.size,3);
   const downloading=b.page.waitForEvent('download');await b.page.locator('#downloadSyncDiagnostic').click();const report=JSON.parse(await readFile(await(await downloading).path(),'utf8'));
   assert.equal(report.local.pending,0);assert.equal(report.local.uniqueEvents,3);assert.equal(report.local.screenEvents,3);assert.equal(report.control.initialEvents,2);assert(report.control.armed);
   for(const stage of['diagnostic6.remote.validated','storage.merge.committed','app.remote.received','app.state.rendered'])assert(report.entries.some(e=>e.stage===stage),stage);
   assert(!report.entries.some(e=>e.stage==='engine.send.start'));assert(!JSON.stringify(report).includes(gid));
   await a.page.locator('#diagnostic6Send').dispatchEvent('click');assert.equal((await sdk.getDocs(sdk.collection(db,'teams',team,'games',gid,'events'))).size,3);
   await a.page.reload();await a.page.waitForFunction(()=>!!document.querySelector('#diagnostic6Send'));assert(await a.page.locator('#diagnostic6Send').isDisabled());
   const denied=await b.page.evaluate(async()=>{const d=await import('./js/diagnostic8b6.js');try{await d.commitSingleEvent({},null,{},{});return false}catch(e){return e.code==='DIAGNOSTIC_STOP'}});assert(denied);
   const p=await device(false,true);await p.page.waitForFunction(()=>document.body.textContent.includes('Hay operaciones pendientes'));
   assert.equal(await p.page.evaluate(()=>new Promise(ok=>{const r=indexedDB.open('registro_defensivo_baloncesto');r.onsuccess=()=>{const db=r.result,q=db.transaction('syncQueue').objectStore('syncQueue').getAll();q.onsuccess=()=>{db.close();ok(q.result[0].attempts)}}})),0);
   assert.deepEqual([...a.forbidden,...b.forbidden,...p.forbidden],[]);
   results.push({browser:name,elapsedMs,events:3,unique:3,pending:0,receiverCloudWrites:0,doubleClickAndReloadProtected:true,receiverWriterRejected:true,pendingBootBlocked:true,trace:report});console.log(JSON.stringify({...results.at(-1),trace:undefined}));
  }finally{await Promise.all(contexts.map(c=>c.close()));await browser.close();}
 }
 await writeFile('.test-artifacts/firebase/fase8b6/emulator.json',JSON.stringify({project:'demo-defensas',realWrites:0,results},null,2));
}finally{await env.cleanup();await new Promise(ok=>server.close(ok));}
