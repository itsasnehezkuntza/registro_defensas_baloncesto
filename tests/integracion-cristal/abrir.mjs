import {fileURLToPath} from 'node:url';
process.env.PLAYWRIGHT_BROWSERS_PATH=fileURLToPath(new URL('../../.test-artifacts/playwright/browsers',import.meta.url));
const {chromium}=await import('@playwright/test');
const browser=await chromium.launch({headless:false});
const context=await browser.newContext({viewport:{width:1440,height:960},locale:'es-ES'});
const page=await context.newPage();
await page.goto('http://127.0.0.1:4191/tests/integracion-cristal/revision.html');
for(const size of ['tablet','compacta','vertical','movil','estrecho','escritorio']){
 await page.locator('#size').selectOption(size);
 for(const view of ['aprobada','estadisticas','dialogo','integrada']){await page.locator(`[value="${view}"]`).check();await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));}
}
await page.screenshot({path:fileURLToPath(new URL('./capturas/revision.png',import.meta.url))});
const app=await page.context().newPage();await app.goto('http://127.0.0.1:4191/');await app.waitForFunction(()=>!document.querySelector('#gameSelect').disabled);await page.bringToFront();
console.log('Comparador y aplicación abiertos en Chromium visible, perfil efímero sin datos personales.');
await new Promise(resolve=>browser.on('disconnected',resolve));
