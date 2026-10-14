import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url)),dir=fileURLToPath(new URL('./',import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve(root,'.test-artifacts/playwright/browsers');
const {chromium}=await import('@playwright/test');
const server=createServer(async(req,res)=>{
 try{
  const relative=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).slice(1);
  if(relative==='favicon.ico'){res.writeHead(204).end();return;}
  if(!/^(tests\/exploracion-frontend\/(?:[\w.-]+\.(html|css|js)|capturas\/[\w.-]+\.png)|fonts\/[\w.-]+\.ttf)$/.test(relative)){res.writeHead(404).end();return;}
  const data=await readFile(resolve(root,relative));const ext=relative.split('.').pop();
  res.writeHead(200,{'Content-Type':{html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',ttf:'font/ttf',png:'image/png'}[ext],'Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end();}
});
let browser;const reports=[];
await mkdir(resolve(dir,'capturas'),{recursive:true});
try{
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(4181,'127.0.0.1',ok);});
 browser=await chromium.launch({headless:!process.argv.includes('--headed')});
 const sizes=[{name:'escritorio',width:1440,height:900},{name:'movil',width:390,height:844},{name:'estrecho',width:320,height:740},{name:'tablet',width:1180,height:820}].filter(size=>!process.argv.includes('--primary')||['escritorio','movil'].includes(size.name));
 for(const theme of ['pulse','bench','switch'])for(const size of sizes){
  const context=await browser.newContext({viewport:{width:size.width,height:size.height},isMobile:size.width<600,hasTouch:size.width<600,deviceScaleFactor:1,locale:'es-ES',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});page.on('request',req=>requests.push(req.url()));
  await page.goto(`http://127.0.0.1:4181/tests/exploracion-frontend/${theme}.html`);
  await page.waitForFunction(()=>!!window.demoState);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.target').count(),28);
  const before=await page.evaluate(()=>window.demoState.attempts);
  const blue=page.locator('[data-key="directo/pr_manejador/blue"]');
  await blue.click();await page.evaluate(()=>window.scrollTo(0,0));
  const metrics=await page.evaluate(()=>{
   const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
   const all=selector=>[...document.querySelectorAll(selector)];
   const small=all('button').filter(el=>{const r=rect(el);return r.width<43.9||r.height<43.9;}).map(el=>el.id||el.textContent);
   const clipped=all('.target-name,.target-stat,.result,.play-heading h3').filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent);
   const uppercase=all('body *').filter(el=>el.getClientRects().length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).every(el=>getComputedStyle(el).textTransform==='uppercase');
   const forbidden=[];for(const el of all('body *'))for(const property of ['color','backgroundColor','borderTopColor','outlineColor','boxShadow']){
    const style=getComputedStyle(el);for(const match of style[property].matchAll(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:[, /]+([\d.]+))?\)/g)){
     if(match[4]==='0')continue;const [r,g,b]=match.slice(1,4).map(Number),max=Math.max(r,g,b),min=Math.min(r,g,b);if(max-min<2)continue;
     const hue=(((max===r?(g-b)/(max-min):max===g?2+(b-r)/(max-min):4+(r-g)/(max-min))*60)+360)%360;
     if(hue<15||hue>35)forbidden.push({property,color:match[0]});
    }
   }
   return {horizontal:document.documentElement.scrollWidth>innerWidth+1,small,clipped,uppercase,forbidden,results:all('.result').map(rect),sections:all('.zone').length,defenses:all('.defense').length,loadedFonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)};
  });
  assert.equal(metrics.horizontal,false,theme+' desbordamiento');assert.deepEqual(metrics.small,[],theme+' objetivo táctil');assert.deepEqual(metrics.clipped,[],theme+' recortes');assert.equal(metrics.uppercase,true);assert.deepEqual(metrics.forbidden,[]);assert.equal(metrics.sections,3);assert.equal(metrics.defenses,20);
  assert(metrics.results.every(r=>r.x>=0&&r.right<=size.width+1&&r.y>=0&&r.bottom<=size.height+1),'Resultados fuera del viewport');
  await page.locator('body').click({position:{x:2,y:2}}); // Retirar foco para captura editorial, manteniendo selección.
  await page.screenshot({path:resolve(dir,'capturas',`${theme}-${size.name}.png`)});
  await page.screenshot({path:resolve(dir,'capturas',`${theme}-${size.name}-completa.png`),fullPage:true});
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await page.screenshot({path:resolve(dir,'capturas',`${theme}-${size.name}-final.png`)});
  const last=await page.locator('.target').last().boundingBox(),dock=await page.locator('.controls').boundingBox();
  assert(last.y+last.height<=dock.y+1||await page.locator('.controls').evaluate(el=>getComputedStyle(el).position!=='fixed'),'Última defensa tapada');
  await page.locator('.result[data-points="3"][data-result="fallado"]').evaluate(el=>{el.click();el.click();});
  assert.equal(await page.evaluate(()=>window.demoState.attempts),before+1);assert.equal(await page.evaluate(()=>window.demoState.shots),1);
  await page.locator('#undo').click();assert.equal(await page.evaluate(()=>window.demoState.attempts),before);
  await page.locator('[data-key="directo/pr_roller/blue"]').click();assert.equal(await page.locator('.result[data-points="3"]').first().isDisabled(),true);
  await page.locator('#reset').click();assert.equal(await page.evaluate(()=>window.demoState.shots),0);
  assert.equal(await page.evaluate(()=>localStorage.length),0);assert.deepEqual(await page.evaluate(()=>indexedDB.databases()),[]);
  await page.locator('#undo').evaluate(el=>{el.disabled=false;el.focus();});await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');
  assert.deepEqual(errors,[]);assert(requests.every(url=>url.startsWith('http://127.0.0.1:4181/')&&!url.endsWith('/app.js')));
  reports.push({theme,size:size.name,...metrics,errors,simulation:true,storageUntouched:true});await context.close();
  console.log(`${theme} / ${size.name}: captura y verificaciones correctas`);
 }
 const initial=JSON.parse((await readFile(resolve(dir,'integridad-inicial.json'),'utf8')).replace(/^\uFEFF/,''));
 for(const file of initial)assert.equal(createHash('sha256').update(await readFile(resolve(root,file.path))).digest('hex').toUpperCase(),file.sha256,'Producción modificada: '+file.path);
 const gallery=await browser.newPage({viewport:{width:1440,height:1000}});
 await gallery.goto('http://127.0.0.1:4181/tests/exploracion-frontend/comparacion.html');
 await gallery.evaluate(()=>document.fonts.ready);
 await gallery.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
 await gallery.screenshot({path:resolve(dir,'capturas','comparacion-escritorio.png'),fullPage:true});
 await gallery.locator('label[for="mobile"]').click();await gallery.screenshot({path:resolve(dir,'capturas','comparacion-movil.png'),fullPage:true});
 await gallery.locator('label[for="tablet"]').click();assert.equal(await gallery.locator('.tablet .card:visible').count(),3);
 await gallery.close();
 await writeFile(resolve(dir,process.argv.includes('--headed')?'verificacion-visible.json':'verificacion.json'),JSON.stringify({ok:true,browser:await browser.version(),headed:process.argv.includes('--headed'),reports,productionUnchanged:true,gallery:true},null,2));
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
