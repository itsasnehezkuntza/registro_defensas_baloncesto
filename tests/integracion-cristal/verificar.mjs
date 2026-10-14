import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {server} from './servidor.mjs';
import {verifyGames} from './partidos.mjs';
const dir=new URL('./',import.meta.url),root=new URL('../../',import.meta.url);
process.env.PLAYWRIGHT_BROWSERS_PATH=fileURLToPath(new URL('.test-artifacts/playwright/browsers',root));
const {chromium}=await import('@playwright/test');
const seed=JSON.parse((await readFile(new URL('tests/premium-cristal/muestra.js',root),'utf8')).replace('window.demoSeed=','').replace(/;\s*$/,''));
await mkdir(new URL('capturas/',dir),{recursive:true});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(4190,'127.0.0.1',ok);});
let browser;const reports=[];
const snap=(page,name)=>page.screenshot({path:fileURLToPath(new URL('capturas/'+name+'.png',dir))});
const idle=page=>page.waitForFunction(()=>!document.querySelector('#gameSelect').disabled);
async function geometry(page,view){
 return page.evaluate(view=>{
  const all=s=>[...document.querySelectorAll(s)].filter(el=>el.getClientRects().length),rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
  const small=all('button,select,input').filter(el=>{const r=rect(el);return r.width<43.9||r.height<43.9;}).map(el=>el.id||el.textContent);
  const clipped=all('.action-name,.action-score,.defense-name,.defense-score,.performance-heading h3,.performance-detail,.group-summary h3').filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent);
  const forbidden=[];for(const el of all('body *'))for(const prop of ['color','backgroundColor','backgroundImage','borderTopColor','outlineColor','boxShadow'])for(const m of getComputedStyle(el)[prop].matchAll(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:[, /]+([\d.]+))?\)/g)){
   if(m[4]==='0')continue;const[r,g,b]=m.slice(1,4).map(Number),max=Math.max(r,g,b),min=Math.min(r,g,b);if(max-min<2)continue;const h=(((max===r?(g-b)/(max-min):max===g?2+(b-r)/(max-min):4+(r-g)/(max-min))*60)+360)%360;if(h<15||h>35)forbidden.push({prop,color:m[0]});
  }
  const panels=all('#registrationView .top-grid>.stat-panel').map(rect),st=all('#staticActions button').map(rect);
  return{view,horizontal:document.documentElement.scrollWidth>innerWidth+1,small,clipped,forbidden,panels,cols:new Set(st.map(r=>Math.round(r.x))).size,rows:new Set(st.map(r=>Math.round(r.y))).size,results:all('.result-btn').map(rect),dock:all('.result-dock').map(rect)[0],last:all('.defense-btn').map(rect).at(-1)};
 },view);
}
function check(m,w,h){assert.equal(m.horizontal,false,JSON.stringify(m));assert.deepEqual(m.small,[]);assert.deepEqual(m.clipped,[]);assert.deepEqual(m.forbidden,[]);if(m.view==='registro'){assert.equal(m.cols,3);assert.equal(m.rows,2);assert(m.results.every(r=>r.bottom<=h&&r.right<=w));if(w>760){assert(Math.abs(m.panels[0].height-m.panels[1].height)<1);assert(m.last.bottom<=m.dock.y+1,'Matriz oculta');}}}
try{
 browser=await chromium.launch({headless:!process.argv.includes('--headed')});
 reports.push({games:await verifyGames(browser)});console.log('Aislamiento, sincronización y subruta correctos');
 if(!process.argv.includes('--visual-only'))for(const phase of [2,3,5,6]){
  const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();let downloads=0;page.on('download',()=>downloads++);
  await page.goto(`http://127.0.0.1:4190/tests/fase${phase}.html?isolated=1`);await page.waitForFunction(p=>window['phase'+p+'Result'],phase,{timeout:180000});
  const result=await page.evaluate(p=>window['phase'+p+'Result'],phase);assert(result.ok,JSON.stringify(result));if(phase===5)assert(downloads>0);
  reports.push({phase,...result});console.log(`Fase ${phase}: correcta`);await context.close();
 }
 for(const [name,width,height] of [['escritorio',1440,900],['tablet',1180,820],['compacta',1024,768],['vertical',768,1024],['movil',390,844],['estrecho',320,740]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<800,isMobile:width<600,reducedMotion:'reduce',locale:'es-ES',acceptDownloads:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4190/');await idle(page);await page.evaluate(()=>document.fonts.ready);
  await page.locator('#viewToggle').click();await page.waitForSelector('#statisticsView:not([hidden])');assert.equal(await page.locator('#statsSuccess').textContent(),'—');
  await page.locator('#viewToggle').click();await page.waitForSelector('#registrationView:not([hidden])');
  await page.locator('#newGameBtn').click();await page.locator('#roundInput').fill('12');await page.locator('#rivalInput').fill('Bilbao (muestra)');await snap(page,'dialogo-'+name);await page.locator('#createGameBtn').click();await idle(page);
  await page.evaluate(async seed=>{
   const store=await import('./js/persistencia.js'),{loadConfiguration}=await import('./js/configuracion.js'),{resolveSelection,makeShotEvent}=await import('./js/registro.js');
   const state=await store.readState();if(state.games.length!==1||state.events.length)throw Error('Contexto no aislado');const game=state.games[0],config=await loadConfiguration();
   for(const item of seed){const[category,actionId,strategyId]=item.key.split('/');const selection=resolveSelection(config,{category,actionId,strategyId:strategyId||null});for(let i=0;i<item.missed+item.made;i++)await store.addEvent(makeShotEvent(crypto.randomUUID(),game,selection,selection.shots[0],i<item.missed?'fallado':'anotado'));}
  },seed);
  await page.reload();await idle(page);await page.evaluate(()=>document.fonts.ready);
  const blue=page.locator('[data-action="pr_manejador"][data-strategy="blue"]');await blue.click();await page.mouse.move(0,0);await page.evaluate(()=>{document.activeElement.blur();scrollTo(0,0);});
  const m=await geometry(page,'registro');check(m,width,height);await snap(page,'integrada-'+name);
  const shape=await page.locator('.top-grid').boundingBox();
  const clientWidth=await page.evaluate(()=>document.documentElement.clientWidth);
  const styles=await page.locator('.top-grid>.stat-panel').first().evaluate(el=>{const s=getComputedStyle(el);return[s.background,s.boxShadow,s.backdropFilter,s.borderRadius];});
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));const last=await page.locator('.defense-btn').last().boundingBox(),dock=await page.locator('.result-dock').boundingBox();assert(last.y+last.height<=dock.y+1);await snap(page,'integrada-'+name+'-final');
  await page.locator('#viewToggle').click();await page.waitForSelector('#statisticsView:not([hidden])');assert.equal(await page.locator('#statsSuccess').textContent(),'68%');assert((await page.locator('#statsAttempts').textContent()).includes('114 intentos'));
  const dm=await geometry(page,'estadisticas');check(dm,width,height);await snap(page,'estadisticas-'+name);await page.screenshot({path:fileURLToPath(new URL(`capturas/estadisticas-${name}-completa.png`,dir)),fullPage:true});
  await page.reload();await idle(page);assert(await page.locator('#statisticsView').isVisible());assert((await page.locator('#statsAttempts').textContent()).includes('114 intentos'));
  await page.locator('#viewToggle').click();await page.waitForSelector('#registrationView:not([hidden])');await blue.click();await page.locator('#viewToggle').click();await page.waitForSelector('#statisticsView:not([hidden])');await page.locator('#viewToggle').click();await page.waitForSelector('#registrationView:not([hidden])');assert.equal(await blue.getAttribute('aria-pressed'),'true');
  await page.locator('.result-btn[data-points="3"][data-result="fallado"]').evaluate(el=>{el.click();el.click();});await idle(page);assert((await page.locator('#gameTotal').textContent()).startsWith('115 intentos'));
  await page.locator('#viewToggle').click();await page.waitForSelector('#statisticsView:not([hidden])');assert((await page.locator('#statsAttempts').textContent()).includes('115 intentos'));
  await page.locator('#undoBtn').click();await idle(page);assert((await page.locator('#statsAttempts').textContent()).includes('114 intentos'));
  const downloadPromise=page.waitForEvent('download');await page.locator('#exportCsvBtn').click();const download=await downloadPromise;const bytes=await readFile(await download.path());assert.deepEqual([...bytes.subarray(0,3)],[239,187,191]);assert(bytes.toString('utf8').includes('Bilbao (muestra)'));
  assert.deepEqual(errors,[]);reports.push({name,registration:m,dashboard:dm,functional:true,download:download.suggestedFilename(),errors});
  const preview=await context.newPage();await preview.goto('http://127.0.0.1:4190/tests/premium-cristal/index.html');await preview.waitForFunction(()=>window.demoState);await preview.evaluate(()=>document.fonts.ready);await preview.locator('[data-key="directo/pr_manejador/blue"]').click();await preview.mouse.move(0,0);await preview.evaluate(()=>{document.activeElement.blur();scrollTo(0,0);});await snap(preview,'aprobada-'+name);
  const oldShape=await preview.locator('.top-grid').boundingBox();const oldClientWidth=await preview.evaluate(()=>document.documentElement.clientWidth);assert(Math.abs((oldShape.width-shape.width)-(oldClientWidth-clientWidth))<1);assert(Math.abs(oldShape.height-shape.height)<2);
  const oldStyles=await preview.locator('.top-grid>.stat-panel').first().evaluate(el=>{const s=getComputedStyle(el);return[s.background,s.boxShadow,s.backdropFilter,s.borderRadius];});assert.deepEqual(styles,oldStyles);
  console.log(`${name}: registro, estadísticas, CSV y apariencia correctos`);await context.close();
 }
 await writeFile(new URL(process.argv.includes('--headed')?'verificacion-visible.json':'verificacion.json',dir),JSON.stringify({ok:true,browser:await browser.version(),reports},null,2));
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
