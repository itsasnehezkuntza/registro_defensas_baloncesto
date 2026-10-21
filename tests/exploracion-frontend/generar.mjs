import { readFile, writeFile } from 'node:fs/promises';
import { parseConfiguration } from '../../js/configuracion.js';
const config=parseConfiguration(await readFile(new URL('../../categorias.csv',import.meta.url),'utf8'));
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let index=0;
const model=[];
function target(category,action,defense){
  const i=index++, key=[category.id,action.id,defense?.id||''].join('/');
  let missed=(i*3+2)%7,made=(i+1)%4;
  if(i%9===0) missed=made=0;
  if(action.id==='pr_manejador'&&defense?.id==='blue'){missed=7;made=3;}
  const item={key,category:category.id,name:action.name+(defense?' / '+defense.name:''),shots:defense?.shots||action.shots,missed,made};
  model.push(item);
  return `<button type="button" class="target ${defense?'defense':'action'}" data-key="${safe(key)}" aria-pressed="false"><span class="target-name">${safe(defense?.name||action.name)}</span><span class="target-stat">—</span><span class="chosen-mark" aria-hidden="true">✓</span></button>`;
}
const sections=config.categories.map(category=>{
  const direct=category.id==='directo';
  const content=direct?category.actions.map(action=>`<article class="play"><div class="play-heading"><h3>${safe(action.name)}</h3><span class="play-summary" data-action-summary="${action.id}">—</span></div><div class="defenses">${action.defenses.map(defense=>target(category,action,defense)).join('')}</div></article>`).join(''):category.actions.map(action=>target(category,action)).join('');
  return `<section class="zone ${category.id}" aria-labelledby="title-${category.id}"><div class="zone-heading"><h2 id="title-${category.id}">${safe(category.name)}</h2><span class="zone-summary" data-summary="${category.id}">—</span></div><div class="targets">${content}</div></section>`;
}).join('');
const buttons=[['2','fallado','✕'],['3','fallado','✕'],['2','anotado','✓'],['3','anotado','✓']].map(([points,result,sign])=>`<button type="button" class="result ${result}" data-points="${points}" data-result="${result}" disabled aria-label="Tiro de ${points} puntos ${result} por el rival"><span class="result-number">${points}<span class="sign">${sign}</span></span><span class="result-word">${result}</span></button>`).join('');
for(const name of ['pulse','bench','switch']){
 const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} · registro defensivo · demo</title><link rel="stylesheet" href="./base.css"><link rel="stylesheet" href="./${name}.css"><script src="./demo.js" defer></script></head><body class="${name}"><div class="workspace"><header class="header"><div class="identity"><h1>Registro<br> defensivo</h1><span class="demo-label">Demo en memoria</span></div><div class="match"><span class="round">Jornada 12</span><strong>Bilbao</strong></div><div class="game-stat"><strong id="globalPercent">—</strong><span id="attempts">0 intentos</span></div><div class="tools"><button id="undo" type="button" disabled aria-label="Deshacer el último tiro simulado">↶ Deshacer</button><button id="reset" type="button">Reiniciar muestra</button></div></header><main class="board">${sections}</main><footer class="controls"><div class="selection"><span class="selection-label">Acción seleccionada</span><strong id="selectionText" aria-live="polite">Elige una acción o defensa</strong></div><div class="results">${buttons}</div><p id="feedback" aria-live="polite">Datos ficticios. Nada se guarda.</p></footer></div></body></html>`;
 await writeFile(new URL(name+'.html',import.meta.url),html);
}
await writeFile(new URL('muestra.js',import.meta.url),'window.demoSeed='+JSON.stringify(model)+';');
// El seed se incrusta en demo.js mediante una carga local propia, nunca de producción.
console.log('Tres demos generadas desde el CSV local; muestra ficticia compartida.');
