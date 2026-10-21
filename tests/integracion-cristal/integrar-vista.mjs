// Aplicación única de los materiales aprobados; aborta si ya están integrados.
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
const get=p=>readFile(new URL(p,root),'utf8');
let html=await get('index.html');
if(html.includes('id="viewToggle"'))throw Error('Integración ya aplicada; no sobrescribir cambios posteriores.');
const approved=await get('tests/premium-cristal/index.html');
const materials=(await get('tests/premium-cristal/premium-anterior.css')).replaceAll('../../fonts/','./fonts/')+'\n'+await get('tests/premium-cristal/cristal.css');
await writeFile(new URL('premium.css',root),materials);
html=html.replace('content="#f5f5f5"','content="#dedede"').replace('<script type="module"','<link rel="stylesheet" href="./dashboard.css">\n  <script type="module"');
html=html.replace('<body>','<body>'+approved.match(/<div class="ambient"[\s\S]*?<\/div><\/div>/)[0]);
for(const id of ['newGameBtn','deleteGameBtn','undoBtn','exportCsvBtn']){
 const re=new RegExp(`<button[^>]*id="${id}"[^>]*>[\\s\\S]*?</button>`);
 const body=approved.match(re)[0].replace('class="tool-button','disabled class="tool-button');
 html=html.replace(re,body);
}
for(const id of ['transitionTitle','staticTitle','directTitle']){
 const re=new RegExp(`<h2 id="${id}">[\\s\\S]*?</h2>`);
 let heading=approved.match(re)[0];
 heading=heading.replace(/<\/span>([^<]+)<\/h2>/,'</span><span class="category-title">$1</span></h2>');
 html=html.replace(re,heading);
}
html=html.replace('</select>\n        </label>','</select>\n        </label>\n        <button id="viewToggle" type="button" class="tool-button view-toggle" aria-controls="registrationView statisticsView" aria-label="Ver estadísticas" disabled><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V4M4 20h16M9 16v-5m5 5V6m5 10v-7"/></svg><span>Estadísticas</span></button>');
html=html.replace('<div class="top-grid">','<div id="registrationView" aria-label="Registro">\n      <div class="top-grid">');
html=html.replace('    </main>','      </div>\n      <section id="statisticsView" class="dashboard" data-dashboard aria-label="Estadísticas del partido activo" hidden>\n        <p id="statisticsState" class="dashboard-notice" role="status"></p>\n        <div id="statisticsContent"></div>\n        <p id="statisticsFeedback" class="feedback" role="status" aria-live="polite"></p>\n      </section>\n    </main>');
await writeFile(new URL('index.html',root),html);
console.log('Materiales e iconos copiados fielmente; lógica de aplicación no reemplazada.');
