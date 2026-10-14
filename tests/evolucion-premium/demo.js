// Solo muestra visual en memoria. Nunca abre almacenamiento ni módulos funcionales.
(()=>{
const model=new Map(window.demoSeed.map(item=>[item.key,{...item}])),stack=[];
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
let chosen=null;
const stat=items=>{const m=items.reduce((s,x)=>s+x.missed,0),a=items.reduce((s,x)=>s+x.made,0);return m+a?`<span class="stat-missed">${m}</span>–<span class="stat-made">${a}</span> · ${Math.round(m*100/(m+a))}%`:'—';};
function render(){
 const items=[...model.values()],item=model.get(chosen);
 for(const b of all('[data-key]')){const v=model.get(b.dataset.key);b.querySelector('.action-score,.defense-score').innerHTML=stat([v]);b.setAttribute('aria-pressed',String(v===item));}
 for(const [cat,id] of Object.entries({transicion:'transitionTotal',estatico:'staticTotal',directo:'directTotal'}))$('#'+id).innerHTML=stat(items.filter(x=>x.category===cat));
 for(const el of all('[data-action-summary]'))el.innerHTML=stat(items.filter(x=>x.action===el.dataset.actionSummary));
 for(const el of all('[data-row]'))el.classList.toggle('is-axis-selected',item?.action===el.dataset.row);
 for(const el of all('[data-defense-heading]'))el.classList.toggle('is-axis-selected',item?.strategy===el.dataset.defenseHeading);
 for(const b of all('.result-btn'))b.disabled=!item||!item.shots.includes(+b.dataset.points);
 $('#selectedDescription').textContent=item?.name||'Selecciona una acción o defensa';
 const total=items.reduce((s,x)=>s+x.missed+x.made,0);
 $('#gameTotal').innerHTML=`${total} intentos · ${stat(items)}`;
 $('#undoBtn').disabled=!stack.length;
 window.demoState={chosen,attempts:total,shots:stack.length};
}
for(const b of all('[data-key]'))b.addEventListener('click',()=>{chosen=b.dataset.key;render();$('#feedback').textContent='Muestra ficticia · elige un resultado para simular';});
for(const b of all('.result-btn'))b.addEventListener('click',()=>{
 if(!chosen||b.disabled)return;
 const item=model.get(chosen),field=b.dataset.result==='fallado'?'missed':'made';stack.push({key:chosen,field});item[field]++;chosen=null;render();$('#feedback').textContent='Tiro simulado · no se ha guardado ningún dato';
});
$('#undoBtn').addEventListener('click',()=>{const last=stack.pop();if(last)model.get(last.key)[last.field]--;chosen=null;render();$('#feedback').textContent='Último tiro simulado deshecho';});
for(const id of ['newGameBtn','deleteGameBtn','exportCsvBtn'])$('#'+id).addEventListener('click',()=>{$('#feedback').textContent='Vista de prueba · gestión de partidos y CSV disponibles en la aplicación real';});
const dock=$('.result-dock'),reserve=()=>document.documentElement.style.setProperty('--dock-height',Math.ceil(dock.getBoundingClientRect().height)+'px');
new ResizeObserver(reserve).observe(dock);render();reserve();$('#feedback').textContent='Muestra ficticia · nada se guarda';
})();
