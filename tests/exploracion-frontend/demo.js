// Simulación aislada: sin IndexedDB, localStorage, backend ni módulos de producción.
(async()=>{
 const script=document.createElement('script');script.src='./muestra.js';
 await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=reject;document.head.append(script);});
 const original=window.demoSeed, model=new Map(original.map(item=>[item.key,{...item}]));
 let chosen=null;const stack=[];
 const buttons=[...document.querySelectorAll('.target')],results=[...document.querySelectorAll('.result')];
 const stat=(missed,made)=>missed+made?`${missed}–${made} · ${Math.round(100*missed/(missed+made))}%`:'—';
 function render(){
  let missed=0,made=0;
  for(const button of buttons){const item=model.get(button.dataset.key);button.querySelector('.target-stat').textContent=stat(item.missed,item.made);button.setAttribute('aria-pressed',String(chosen===item.key));missed+=item.missed;made+=item.made;}
  document.querySelector('#attempts').textContent=`${missed+made} intentos`;
  document.querySelector('#globalPercent').textContent=Math.round(100*missed/(missed+made))+'%';
  document.querySelector('#selectionText').textContent=chosen?model.get(chosen).name:'Elige una acción o defensa';
  for(const button of results)button.disabled=!chosen||!model.get(chosen).shots.includes(Number(button.dataset.points));
  document.querySelector('#undo').disabled=!stack.length;
  for(const element of document.querySelectorAll('[data-summary],[data-action-summary]')){
   const set=[...model.values()].filter(item=>element.dataset.summary?item.category===element.dataset.summary:item.key.split('/')[1]===element.dataset.actionSummary);
   element.textContent=stat(set.reduce((sum,item)=>sum+item.missed,0),set.reduce((sum,item)=>sum+item.made,0));
  }
  window.demoState={chosen,attempts:missed+made,shots:stack.length};
 }
 for(const button of buttons)button.addEventListener('click',()=>{chosen=chosen===button.dataset.key?null:button.dataset.key;render();document.querySelector('#feedback').textContent=chosen?'Elige el resultado. Solo se simula en memoria.':'Datos ficticios. Nada se guarda.';});
 for(const button of results)button.addEventListener('click',()=>{
  if(!chosen||button.disabled)return;const key=chosen,item=model.get(key),field=button.dataset.result==='fallado'?'missed':'made';
  item[field]++;stack.push({key,field});chosen=null;render();document.querySelector('#feedback').textContent='Tiro simulado. No se ha guardado ningún dato.';
 });
 document.querySelector('#undo').addEventListener('click',()=>{const last=stack.pop();if(!last)return;model.get(last.key)[last.field]--;chosen=null;render();document.querySelector('#feedback').textContent='Último tiro simulado deshecho.';});
 document.querySelector('#reset').addEventListener('click',()=>{for(const item of original)model.set(item.key,{...item});stack.length=0;chosen=null;render();document.querySelector('#feedback').textContent='Muestra ficticia reiniciada.';});
 const dock=document.querySelector('.controls');const reserve=()=>document.documentElement.style.setProperty('--reserve',getComputedStyle(dock).position==='fixed'?Math.ceil(dock.getBoundingClientRect().height+28)+'px':'0px');
 new ResizeObserver(reserve).observe(dock);window.addEventListener('resize',reserve);render();reserve();
})();
