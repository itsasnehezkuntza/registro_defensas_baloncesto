import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {parseConfiguration} from '../../js/configuracion.js';
const dir=new URL('./',import.meta.url), root=new URL('../../',import.meta.url);
const config=parseConfiguration(await readFile(new URL('categorias.csv',root),'utf8'));
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sample=[];
function button(cat,action,defense){
 const i=sample.length,key=[cat.id,action.id,defense?.id||''].join('/');
 let missed=(i*3+2)%7,made=(i+1)%4;
 if(i%9===0)missed=made=0;
 if(action.id==='pr_manejador'&&defense?.id==='blue'){missed=7;made=3;}
 sample.push({key,category:cat.id,action:action.id,strategy:defense?.id||'',name:`${cat.name} · ${action.name}${defense?' · '+defense.name:''}`,shots:defense?.shots||action.shots,missed,made});
 const type=defense?'defense':'action';
 return `<button type="button" class="${type}-btn" data-category="${cat.id}" data-action="${action.id}" ${defense?`data-strategy="${defense.id}"`:''} data-key="${key}" aria-pressed="false"><span class="${type}-name">${safe(defense?.name||action.name)}</span><span class="${type}-score">—</span></button>`;
}
let html=await readFile(new URL('index.html',root),'utf8');
html=html.replace('<script type="module" src="./app.js"></script>','<script src="./muestra.js" defer></script><script src="./demo.js" defer></script>').replace('./styles.css','./base.css').replace('./premium.css','./evolucion.css').replace('Registro defensivo · Baloncesto','Premium · propuesta aislada');
html=html.replace(/<p id="noGameNotice"[^>]*>.*?<\/p>/,'').replace('class="save-status is-saving"','class="save-status"').replace('Cargando…','Demo · en memoria').replace('<option value="">Selecciona o crea un partido</option>','<option value="demo">Jornada 12 · Bilbao (muestra)</option>').replaceAll(' disabled','');
for(const category of config.categories){
 const id={transicion:'transitionActions',estatico:'staticActions',directo:'directActions'}[category.id];
 let content;
 if(category.id!=='directo')content=category.actions.map(a=>button(category,a)).join('');
 else{
  const defs=category.actions[0].defenses;
  const shared=category.actions.every(a=>a.defenses.length===defs.length&&a.defenses.every((d,i)=>d.id===defs[i].id));
  content=`<div class="direct-matrix"><div class="direct-matrix-inner">${shared?`<div class="direct-matrix-head"><span class="direct-corner">Situación / defensa</span><div class="defense-headings">${defs.map(d=>`<span class="defense-heading" data-defense-heading="${d.id}">${safe(d.name)}</span>`).join('')}</div></div>`:''}${category.actions.map(a=>`<div class="direct-row" data-row="${a.id}"><div class="direct-type"><strong>${safe(a.name)}</strong><span data-action-summary="${a.id}">—</span></div><div class="defense-options">${a.defenses.map(d=>button(category,a,d)).join('')}</div></div>`).join('')}</div></div>`;
 }
 html=html.replace(new RegExp(`(<div id="${id}"[^>]*>)(</div>)`),`$1${content}$2`);
}
await writeFile(new URL('index.html',dir),html);
await writeFile(new URL('actual.html',dir),html.replace('./evolucion.css','./actual.css'));
let remote=execFileSync('git',['show','origin/design/premium-ui:premium.css'],{encoding:'utf8'});
remote=remote.replace(/@import[^;]+;/,'@font-face{font-family:Manrope;src:url("../../fonts/Manrope.ttf");font-weight:200 800}@font-face{font-family:"Barlow Condensed";src:url("../../fonts/BarlowCondensed-Bold.ttf");font-weight:600 900}');
await writeFile(new URL('referencia.css',dir),remote);
await writeFile(new URL('referencia.html',dir),html.replace('./evolucion.css','./referencia.css'));
await writeFile(new URL('muestra.js',dir),'window.demoSeed='+JSON.stringify(sample)+';');
const current=(await readFile(new URL('actual.css',dir),'utf8')).replaceAll('./fonts/','../../fonts/');
await writeFile(new URL('actual.css',dir),current);
console.log('Propuesta y dos referencias de comparación generadas con el mismo DOM y muestra.');
