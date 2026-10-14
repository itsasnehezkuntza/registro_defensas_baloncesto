import {readFile,writeFile} from 'node:fs/promises';
import {parseConfiguration} from '../../js/configuracion.js';
const dir=new URL('./',import.meta.url);
const config=parseConfiguration(await readFile(new URL('../../categorias.csv',dir),'utf8'));
let html=await readFile(new URL('../evolucion-premium/index.html',dir),'utf8');
const seed=JSON.parse((await readFile(new URL('muestra.js',dir),'utf8')).replace('window.demoSeed=','').replace(/;\s*$/,''));
const keys=config.categories.flatMap(c=>c.actions.flatMap(a=>a.defenses.length?a.defenses.map(d=>[c,a,d]):[[c,a,null]]));
if(keys.length!==seed.length||keys.some(([c,a,d],i)=>seed[i].key!==[c.id,a.id,d?.id||''].join('/')||JSON.stringify(seed[i].shots)!==JSON.stringify(d?.shots||a.shots)))throw Error('La muestra no coincide con la configuración actual');
html=html.replace('./evolucion.css','./premium-anterior.css');
await writeFile(new URL('antes.html',dir),html);
html=html.replace('</head>','<link rel="stylesheet" href="./cristal.css"></head>').replace('Premium · propuesta aislada','Premium cristal · prueba aislada');
html=html.replace('<body>','<body><div class="ambient" aria-hidden="true"><div class="ambient-ribbon"></div><div class="ambient-ring"></div><div class="ambient-light"></div></div>');
const svg=(body,cls='')=>`<svg class="ui-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const icons={
 newGameBtn:'<path d="M12 5v14M5 12h14"/>',
 deleteGameBtn:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7"/>',
 undoBtn:'<path d="m8 4-5 5 5 5M3 9h10a7 7 0 0 1 7 7v3"/>',
 exportCsvBtn:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>'
};
const labels={newGameBtn:'Nuevo partido',deleteGameBtn:'Eliminar',undoBtn:'Deshacer',exportCsvBtn:'Exportar CSV'};
for(const [id,paths] of Object.entries(icons))html=html.replace(new RegExp(`(<button[^>]*id="${id}"[^>]*>)[\\s\\S]*?</button>`),`$1${svg(paths)}<span>${labels[id]}</span></button>`);
const sections={transitionTitle:'<path d="M4 8h14m-4-4 4 4-4 4M6 16h14m-10-4-4 4 4 4"/>',staticTitle:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 5v4h6V5M9 19v-4h6v4"/><circle cx="12" cy="12" r="1"/>',directTitle:'<path d="M5 19V9a4 4 0 0 1 4-4h10m-4-4 4 4-4 4M12 11v8M9 14h6"/>'};
for(const [id,paths] of Object.entries(sections))html=html.replace(new RegExp(`(<h2 id="${id}">)`),`$1<span class="section-icon">${svg(paths)}</span>`);
await writeFile(new URL('index.html',dir),html);
console.log('Maqueta preparada; las herramientas de verificación se mantienen independientes.');