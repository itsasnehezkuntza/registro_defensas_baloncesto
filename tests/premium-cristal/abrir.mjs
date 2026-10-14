// Abrir la revisión con Chromium instalado, en un contexto efímero propio.
import {fileURLToPath} from 'node:url';
process.env.PLAYWRIGHT_BROWSERS_PATH=fileURLToPath(new URL('../../.test-artifacts/playwright/browsers',import.meta.url));
const {chromium}=await import('@playwright/test');
const browser=await chromium.launch({headless:false});
const page=await browser.newPage({viewport:{width:1440,height:960},locale:'es-ES'});
await page.goto('http://127.0.0.1:4185/tests/premium-cristal/revision.html');
await page.evaluate(()=>document.fonts.ready);
await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
for(const id of ['before','after'])await page.locator('#'+id).check();
for(const size of ['tablet','tablet-compacta','tablet-vertical','movil','movil-final','estrecho','escritorio']){
 await page.locator('#size').selectOption(size);
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
}
await page.screenshot({path:fileURLToPath(new URL('./capturas/revision.png',import.meta.url))});
console.log('Revisión abierta y capturas cargadas. Cerrar esta ventana termina el proceso.');
await new Promise(resolve=>browser.on('disconnected',resolve));
