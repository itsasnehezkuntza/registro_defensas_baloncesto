import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {server} from './servir.mjs';
const dir=new URL('./',import.meta.url),root=new URL('../../',import.meta.url);
process.env.PLAYWRIGHT_BROWSERS_PATH=fileURLToPath(new URL('.test-artifacts/playwright/browsers',root));
const {chromium}=await import('@playwright/test');
await mkdir(new URL('capturas/',dir),{recursive:true});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(4186,'127.0.0.1',ok);});
let browser;const reports=[];
try{
 browser=await chromium.launch({headless:!process.argv.includes('--headed')});
 const sizes=[['escritorio',1440,900],['tablet',1180,820],['tablet-compacta',1024,768],['tablet-vertical',768,1024],['movil',390,844],['estrecho',320,740]];
 for(const [name,width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600,locale:'es-ES',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
  await page.goto('http://127.0.0.1:4186/');await page.waitForFunction(()=>window.demoState);await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:fileURLToPath(new URL(`capturas/propuesta-${name}-reposo.png`,dir))});
  const before=await page.evaluate(()=>window.demoState.attempts);
  await page.locator('[data-key="directo/pr_manejador/blue"]').click();await page.mouse.move(0,0);await page.evaluate(()=>{document.activeElement.blur();scrollTo(0,0);});
  const metrics=await page.evaluate(()=>{
   const all=s=>[...document.querySelectorAll(s)],rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
   const small=all('button:not(dialog button),select').filter(el=>{const r=rect(el);return r.width<43.9||r.height<43.9;}).map(el=>el.textContent);
   const clipped=all('.action-name,.action-score,.defense-name,.defense-score,.direct-type strong').filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent);
   const panels=all('.top-grid>.stat-panel').map(rect),staticButtons=all('.static-list .action-btn').map(rect);
   const forbidden=[];
   for(const el of all('body *'))for(const prop of ['color','backgroundColor','backgroundImage','borderTopColor','outlineColor','boxShadow']){
    for(const match of getComputedStyle(el)[prop].matchAll(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:[, /]+([\d.]+))?\)/g)){
     if(match[4]==='0')continue;const [r,g,b]=match.slice(1,4).map(Number),max=Math.max(r,g,b),min=Math.min(r,g,b);if(max-min<2)continue;
     const hue=(((max===r?(g-b)/(max-min):max===g?2+(b-r)/(max-min):4+(r-g)/(max-min))*60)+360)%360;
     if(hue<15||hue>35)forbidden.push({prop,color:match[0]});
    }
   }
   return {horizontal:document.documentElement.scrollWidth>innerWidth+1,small,clipped,forbidden,panels,staticColumns:new Set(staticButtons.map(r=>Math.round(r.x))).size,staticRows:new Set(staticButtons.map(r=>Math.round(r.y))).size,results:all('.result-btn').map(rect),last:rect(all('.defense-btn').at(-1)),dock:rect(document.querySelector('.result-dock')),uppercase:all('body *').filter(el=>el.getClientRects().length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).every(el=>getComputedStyle(el).textTransform==='uppercase')};
  });
  assert.equal(await page.locator('[data-key]').count(),28);assert.equal(await page.locator('.stat-panel').count(),3);
  assert.equal(metrics.horizontal,false);assert.deepEqual(metrics.small,[]);assert.deepEqual(metrics.clipped,[]);assert.deepEqual(metrics.forbidden,[]);assert.equal(metrics.uppercase,true);
  assert.equal(metrics.staticColumns,3);assert.equal(metrics.staticRows,2);
  if(width>760){assert(Math.abs(metrics.panels[0].height-metrics.panels[1].height)<1);assert(metrics.last.bottom<metrics.dock.y,'Matriz oculta en tablet/escritorio');}
  assert(metrics.results.every(r=>r.x>=0&&r.right<=width+1&&r.y>=0&&r.bottom<=height+1));
  const material=await page.evaluate(()=>({panels:getComputedStyle(document.querySelector('.stat-panel')).backdropFilter,header:getComputedStyle(document.querySelector('.header'),'::before').backdropFilter,dock:getComputedStyle(document.querySelector('.result-dock')).backdropFilter,icons:document.querySelectorAll('.ui-icon').length,reducedTransition:getComputedStyle(document.querySelector('.defense-btn')).transitionDuration}));
  assert.deepEqual([material.panels,material.header,material.dock],['blur(22px)','blur(22px)','blur(26px)']);assert.equal(material.icons,7);assert.equal(material.reducedTransition,'0s');
  await page.screenshot({path:fileURLToPath(new URL(`capturas/propuesta-${name}.png`,dir))});
  if(name==='escritorio')for(const [label,selector] of [['cabecera','.header'],['panel','.top-grid'],['matriz','.direct-panel'],['barra','.result-dock']])await page.locator(selector).screenshot({path:fileURLToPath(new URL(`capturas/detalle-${label}.png`,dir))});
  await page.screenshot({path:fileURLToPath(new URL(`capturas/propuesta-${name}-completa.png`,dir)),fullPage:true});
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
  const last=await page.locator('.defense-btn').last().boundingBox(),dock=await page.locator('.result-dock').boundingBox();assert(last.y+last.height<=dock.y+1);
  await page.screenshot({path:fileURLToPath(new URL(`capturas/propuesta-${name}-final.png`,dir))});
  await page.locator('.result-btn[data-points="3"][data-result="fallado"]').evaluate(el=>{el.click();el.click();});assert.equal(await page.evaluate(()=>window.demoState.attempts),before+1);
  await page.locator('#undoBtn').click();assert.equal(await page.evaluate(()=>window.demoState.attempts),before);
  await page.locator('[data-key="directo/pr_roller/blue"]').click();assert(await page.locator('.result-btn[data-points="3"]').first().isDisabled());
  await page.locator('#newGameBtn').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');
  assert.equal(await page.evaluate(()=>localStorage.length),0);assert.deepEqual(await page.evaluate(()=>indexedDB.databases()),[]);
  await page.reload();await page.waitForFunction(()=>window.demoState);assert.equal(await page.evaluate(()=>window.demoState.attempts),before);
  assert.deepEqual(errors,[]);assert(requests.every(r=>r.startsWith('http://127.0.0.1:4186/')&&!r.endsWith('/app.js')));
  await page.emulateMedia({reducedMotion:'no-preference'});assert((await page.locator('.defense-btn').first().evaluate(el=>getComputedStyle(el).transitionDuration)).includes('0.18s'));await page.emulateMedia({reducedMotion:'reduce'});
  reports.push({name,width,height,...metrics,material,errors,simulation:true,storageUntouched:true});
  await page.goto('http://127.0.0.1:4186/tests/premium-cristal/antes.html');await page.waitForFunction(()=>window.demoState);await page.evaluate(()=>document.fonts.ready);await page.locator('[data-key="directo/pr_manejador/blue"]').click();await page.mouse.move(0,0);await page.evaluate(()=>{document.activeElement.blur();scrollTo(0,0);});await page.screenshot({path:fileURLToPath(new URL(`capturas/antes-${name}.png`,dir))});
  const oldPanels=await page.locator('.top-grid>.stat-panel').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{width:r.width,height:r.height,x:r.x,y:r.y};}));
  assert(oldPanels.every((r,i)=>Math.abs(r.width-metrics.panels[i].width)<1&&Math.abs(r.height-metrics.panels[i].height)<=2&&Math.abs(r.y-metrics.panels[i].y)<=2),JSON.stringify({name,oldPanels,newPanels:metrics.panels}));
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.screenshot({path:fileURLToPath(new URL(`capturas/antes-${name}-final.png`,dir))});
  await context.close();console.log(`${name}: correcto`);
 }
 const hashes=JSON.parse((await readFile(new URL('integridad-inicial.json',dir),'utf8')).replace(/^\uFEFF/,''));
 for(const file of hashes)assert.equal(createHash('sha256').update(await readFile(new URL(file.path,root))).digest('hex').toUpperCase(),file.sha256,file.path);
 await writeFile(new URL(process.argv.includes('--headed')?'verificacion-visible.json':'verificacion.json',dir),JSON.stringify({ok:true,browser:await browser.version(),productionUnchanged:true,reports},null,2));
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
