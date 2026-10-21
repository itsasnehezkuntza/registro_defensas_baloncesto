// Reutiliza el harness Emulator revisado de 8B.6; nunca usa cuentas/proyectos reales.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8085')throw Error('Solo Emulator.');
let source=await readFile(new URL('./receive8b6.test.mjs',import.meta.url),'utf8');
source=source.replaceAll('8b6','8b7').replaceAll('diagnostic6','diagnostic7');
source=source.replace("from './browser-support.mjs'","from "+JSON.stringify(new URL('./browser-support.mjs',import.meta.url).href));
source=source.replace("const originals=['0ad91a0a-5b4b-4bf2-8c38-fe975e43e090','f5270206-1f1a-41c1-a98f-b4467891f125'];","const originals=['0ad91a0a-5b4b-4bf2-8c38-fe975e43e090','f5270206-1f1a-41c1-a98f-b4467891f125','prueba8b6-95424bdd-8861-43b2-a547-a7afab568e64'];");
source=source.replace("resultado:i?'anotado':'fallado'","resultado:i===1?'anotado':'fallado'");
source=source.replace("source.indexOf('// En una transacción',from)","source.indexOf('export async function commitScenarioEvent',from)");
source=source.replace("?.textContent==='2'","?.textContent==='3'");
const start=source.indexOf('   const a=await device(true),b=await device();'),end=source.indexOf('  }finally{await Promise.all',start);assert(start>=0&&end>start);
const body=`   const a=await device(true),b=await device(),scenarios=[];
   for(let i=0;i<3;i++){
    const nameScenario=['A','B','C'][i],count=4+i;
    for(const d of[a,b]){await d.page.locator('#diagnostic7Prepare').click();await d.page.waitForFunction(()=>document.querySelector('#diagnostic7Status').textContent.startsWith('Preparado'));}
    assert(await b.page.locator('#undoBtn').isDisabled());assert(await b.page.locator('#syncImport').isDisabled());assert(await b.page.locator('#deleteGameBtn').isDisabled());
    if(i===1)await b.page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
    if(i===2)await b.page.evaluate(async()=>{await testSDK.disableNetwork(testDB);Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});dispatchEvent(new Event('offline'));});
    const started=Date.now();await a.page.locator('#diagnostic7Send').click();await a.page.waitForFunction(n=>document.querySelector('#diagnostic7Status').textContent.startsWith('Servidor confirmó '+n),count);
    if(i===1)await b.page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange'));});
    if(i===2){await b.page.waitForFunction(()=>document.querySelector('#cloudStatus').textContent==='Error de sincronización',undefined,{timeout:20000});assert.equal(await b.page.evaluate(async()=>(await(await import('./js/persistencia.js')).readState()).events.length),5);await b.page.evaluate(async()=>{await testSDK.enableNetwork(testDB);Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>true});dispatchEvent(new Event('online'));});}
    await b.page.waitForFunction(n=>document.querySelector('#gameTotal b:last-child')?.textContent===String(n),count,{timeout:25000});
    await a.page.waitForFunction(n=>document.querySelector('#gameTotal b:last-child')?.textContent===String(n),count,{timeout:25000});
    const elapsedMs=Date.now()-started;
    for(const d of[a,b]){await d.page.locator('#diagnostic7Finish').click();await d.page.waitForFunction(()=>document.querySelector('#diagnostic7Status').textContent.includes('verificado:'));}
    const downloading=b.page.waitForEvent('download');await b.page.locator('#downloadSyncDiagnostic').click();const report=JSON.parse(await readFile(await(await downloading).path(),'utf8'));
    assert.equal(report.local.pending,0);assert.equal(report.local.localEvents,count);assert.equal(report.local.uniqueEvents,count);assert.equal(report.local.screenEvents,count);
    assert.equal(report.control.scenario,nameScenario);assert(report.control.closed);assert(!report.control.frozen);assert.equal(report.savedScenarios.length,i);assert.equal(report.dropped,0);assert.equal(report.overflow,false);
    assert(report.entries.some(e=>e.stage==='diagnostic7.prepared'&&e.kind===nameScenario));assert(report.entries.some(e=>e.stage==='app.state.rendered'&&e.localEvents===count));
    assert(!report.entries.some(e=>e.stage==='engine.send.start'));assert(!JSON.stringify(report).includes(gid));
    const server=await sdk.getDocs(sdk.collection(db,'teams',team,'games',gid,'events'));assert.equal(server.size,count);assert.equal(new Set(server.docs.map(d=>d.id)).size,count);
    for(const original of events)assert.deepEqual(server.docs.find(d=>d.id===original.id).data().payload,original.payload);
    await a.page.locator('#diagnostic7Send').dispatchEvent('click');assert.equal((await sdk.getDocs(sdk.collection(db,'teams',team,'games',gid,'events'))).size,count);
    scenarios.push({scenario:nameScenario,events:count,elapsedMs,pending:0,unique:count,initialTracePreserved:true,priorArchives:report.savedScenarios.length,trace:report});
    if(i<2){for(const d of[a,b]){d.page.once('dialog',dialog=>dialog.accept());await d.page.locator('#diagnostic7Next').click();}}
   }
   assert(await a.page.locator('#diagnostic7Next').isDisabled());
   await a.page.reload();await a.page.waitForFunction(()=>!!document.querySelector('#diagnostic7Send'));assert(await a.page.locator('#diagnostic7Send').isDisabled());
   const denied=await b.page.evaluate(async()=>{try{await(await import('./js/diagnostic8b7.js')).commitScenarioEvent({},null,{},{});return false}catch(e){return e.code==='DIAGNOSTIC_STOP'}});assert(denied);
   const p=await device(false,true);await p.page.waitForFunction(()=>document.body.textContent.includes('Hay operaciones pendientes'));
   const mismatch=await device();await mismatch.page.locator('#diagnostic7Prepare').click();await mismatch.page.waitForFunction(()=>document.querySelector('#diagnostic7Status').textContent.startsWith('Detenerse'));assert(await mismatch.page.locator('#diagnostic7Next').isDisabled());assert(await mismatch.page.locator('#diagnostic7Send').isDisabled());
   assert.deepEqual([...a.forbidden,...b.forbidden,...p.forbidden,...mismatch.forbidden],[]);
   results.push({browser:name,scenarios,events:6,maxAdditionalEvents:3,receiverCloudWrites:0,duplicateClicksBlocked:true,reloadBlocked:true,pendingBootBlocked:true,mismatchStopsProgress:true});console.log(JSON.stringify({browser:name,scenarios:scenarios.map(({trace,...rest})=>rest)}));
`;
source=source.slice(0,start)+body+source.slice(end);
const file=new URL('../../.test-artifacts/firebase/fase8b7/harness.mjs',import.meta.url);await writeFile(file,source);
const child=spawn(process.execPath,[file.pathname.replace(/^\/([A-Za-z]:)/,'$1')],{cwd:process.cwd(),env:process.env,stdio:'inherit'});
process.exitCode=await new Promise((ok,fail)=>{child.on('exit',code=>ok(code??1));child.on('error',fail);});
