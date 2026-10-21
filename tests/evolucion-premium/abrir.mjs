// Abrir la revisión con Chromium instalado, en un contexto efímero propio.
import {fileURLToPath} from 'node:url';
process.env.PLAYWRIGHT_BROWSERS_PATH=fileURLToPath(new URL('../../.test-artifacts/playwright/browsers',import.meta.url));
const {chromium}=await import('@playwright/test');
const browser=await chromium.launch({headless:false});
const page=await browser.newPage({viewport:{width:1440,height:960},locale:'es-ES'});
await page.goto('http://127.0.0.1:4183/tests/evolucion-premium/revision.html');
await page.evaluate(()=>document.fonts.ready);
await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
for(const id of ['current','reference','proposal'])await page.locator('#'+id).check();
await page.screenshot({path:fileURLToPath(new URL('./capturas/revision.png',import.meta.url))});
console.log('Revisión abierta y capturas cargadas. Cerrar esta ventana termina el proceso.');
await new Promise(resolve=>browser.on('disconnected',resolve));
