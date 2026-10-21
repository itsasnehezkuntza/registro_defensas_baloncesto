// Regresión acotada del candidato publicable. Solo perfiles efímeros y datos ficticios.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {chromium,configure,idle,createGame,snapshot} from './browser-support.mjs';
const {webkit}=await import('@playwright/test');
process.env.DEFENSAS_RELEASE_8C='1';
const {startServer}=await import('./servidor.mjs');
const server=await startServer(4189),base='http://127.0.0.1:4189/',reports=[];
const legacy={id:'historico-ficticio-8c',seq:1,gameId:'local-ficticio-8c',categoria:'Bloqueo directo',accion:'PR Roller',tipo_bloqueo:'PR Roller',estrategia:'Blue',valor_tiro:2,resultado:'fallado',fecha_hora:'2020-01-01T12:00:00Z'};
async function seed(page){
 await page.route('**/seed',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Semilla ficticia</title>'}));await page.goto(base+'seed');
 await page.evaluate(async event=>{await new Promise((ok,fail)=>{const r=indexedDB.open('registro_defensivo_baloncesto',1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('games',{keyPath:'id'});const e=d.createObjectStore('events',{keyPath:'seq',autoIncrement:true});e.createIndex('byGameId','gameId');e.createIndex('byGameSeq',['gameId','seq']);e.createIndex('byUuid','id',{unique:true});d.createObjectStore('settings',{keyPath:'key'});};r.onerror=()=>fail(r.error);r.onsuccess=()=>{const d=r.result,t=d.transaction(['games','events','settings'],'readwrite');t.objectStore('games').add({id:event.gameId,jornada:'Antigua',rival:'Histórico ficticio',createdAt:'2020-01-01'});t.objectStore('events').add(event);t.objectStore('settings').add({key:'activeGame',value:event.gameId});t.oncomplete=()=>{d.close();ok()};t.onabort=()=>fail(t.error);};});},legacy);
}
try{
 for(const [name,type,viewport]of[['chromium',chromium,{width:390,height:844}],['webkit',webkit,{width:1024,height:768}]]){
  const browser=await type.launch();try{
   const context=await browser.newContext({viewport,acceptDownloads:true});
   await context.route(/https:\/\//,r=>r.abort());
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await seed(page);
   await page.goto(base);await idle(page);assert.deepEqual((await snapshot(page)).events,[legacy]);
   assert.equal(await page.evaluate(async()=>{const r=indexedDB.open('registro_defensivo_baloncesto');return new Promise(ok=>r.onsuccess=()=>{const v=r.result.version;r.result.close();ok(v)})}),2);
   await page.locator('.action-btn').first().click();await page.locator('[data-points="2"][data-result="fallado"]').dblclick();await idle(page);
   assert.equal((await snapshot(page)).events.length,2);await page.reload();await idle(page);assert.equal((await snapshot(page)).events.length,2);
   await page.locator('#viewStatsBtn').click();await page.waitForFunction(()=>document.body.dataset.view==='estadisticas');
   assert(await page.locator('.matrix-cell').count()>0);await page.locator('#viewRecordBtn').click();
   await page.locator('#moreBtn').click();const downloading=page.waitForEvent('download');await page.locator('#exportCsvBtn').click();const csv=await readFile(await(await downloading).path());assert.equal(csv.subarray(0,3).toString('hex'),'efbbbf');assert(csv.toString().includes(legacy.id));
   await page.keyboard.press('Escape');await page.locator('#undoBtn').click();await idle(page);assert.deepEqual((await snapshot(page)).events,[legacy]);
   const newId=await createGame(page,'Otro ficticio 8C');assert.notEqual(newId,legacy.gameId);await page.locator('#moreBtn').click();await page.locator('#deleteGameBtn').click();await page.locator('#confirmDeleteBtn').click();await idle(page);
   const final=await snapshot(page);assert.deepEqual(final.games.map(g=>g.id),[legacy.gameId]);
   const stored=await page.evaluate(async()=>{const p=await import('./js/persistencia.js');return p.allEvents()});assert.deepEqual(stored,[legacy]);
   assert.equal(await page.locator('#cloudStatus').textContent(),'Solo local');assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.deepEqual(errors,[]);
   await page.screenshot({path:'.test-artifacts/firebase/fase8c/local-'+name+'.png',fullPage:true});
   reports.push({browser:name,viewport,upgradeV1toV2:true,legacyUnchanged:true,twoTapsAndDoubleClick:true,reload:true,undo:true,csv:true,statistics:true,deleteIsolated:true,firebaseFailureDoesNotBlockLocal:true,overflow:false,errors});await context.close();
  }finally{await browser.close();}
 }
 for(const [name,type]of[['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch();try{
   const context=await browser.newContext();let release,requested;const requestedP=new Promise(ok=>requested=ok),held=new Promise(ok=>release=ok);
   await configure(context,{enabled:false,config:{projectId:'demo-defensas'}});
   await context.route('**/js/cuenta.js',r=>r.fulfill({contentType:'text/javascript',body:`export function createAccountController(){let state={status:'ready',busy:false,user:null,sessionVersion:0};const listeners=[];globalThis.restoreTestAccount=uid=>{state={...state,user:uid?{uid,email:'ficticio@example.test'}:null,sessionVersion:state.sessionVersion+1};listeners.forEach(fn=>fn(state));};return{subscribe(fn){listeners.push(fn);fn(state)},start:async()=>{},act:async()=>{}}}`}));
   await context.route('**/js/firestore-sync.js',r=>r.fulfill({contentType:'text/javascript',body:`export async function loadFirestoreTransport(){globalThis.cloudLoads=(globalThis.cloudLoads||0)+1;return{teams:async()=>[]}}`}));
   await context.route('**/categorias.csv',async r=>{requested();await held;await r.fulfill({contentType:'text/csv',body:await readFile('categorias.csv')})});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await requestedP;
   await page.waitForFunction(()=>typeof restoreTestAccount==='function');await page.evaluate(()=>restoreTestAccount('cuenta-ficticia-A'));await page.waitForFunction(()=>document.getElementById('accountIdentity').textContent);release();await idle(page);
   await page.locator('#moreBtn').click();await page.locator('#syncEnable').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>globalThis.cloudLoads||0),0);
   await page.locator('#syncEnable').click();await page.waitForFunction(()=>globalThis.cloudLoads===1);await page.locator('#syncDisable').click();assert.equal(await page.locator('#cloudStatus').textContent(),'Solo local');
   await page.evaluate(()=>restoreTestAccount('cuenta-ficticia-B'));await page.locator('#syncEnable').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>globalThis.cloudLoads),1);
   assert(!await page.locator('#newGameBtn').isDisabled());assert.deepEqual(errors,[]);reports.push({browser:name,startupRestoredDuringCsv:true,controlsEnabled:true,explicitConsent:true,disableSync:true,otherAccountNotOptedIn:true,errors});await context.close();
  }finally{await browser.close();}
 }
 await writeFile('.test-artifacts/firebase/fase8c/smoke.json',JSON.stringify({ok:true,realWrites:0,reports},null,2));console.log(JSON.stringify({ok:true,groups:reports.length,reports,realWrites:0}));
}finally{await new Promise(ok=>server.close(ok));}
