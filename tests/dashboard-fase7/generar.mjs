// Maqueta estática: los eventos ficticios solo existen durante la generación.
import { readFile, writeFile } from 'node:fs/promises';
import { parseConfiguration } from '../../js/configuracion.js';
import { summarize } from '../../js/estadisticas.js';
const config = parseConfiguration(await readFile(new URL('../../categorias.csv', import.meta.url), 'utf8'));
const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const samples = {
  transicion_bajo_aro:[2,6], transicion_spot_up_3:[6,2],
  estatico_1c1_exterior:[3,3], estatico_1c1_interior:[1,4], estatico_pin_down:[4,2],
  estatico_cortes:[2,1], estatico_spot_up_3:[5,1], estatico_bajo_aro:[0,0],
  black:[2,6], white:[7,3], blue:[1,0], red:[4,4], tut:[0,0]
};
const events = [];
for (const cat of config.categories) {
  if (cat.id !== 'directo') for (const a of cat.actions) {
    const [missed,made] = samples[a.id];
    for (let i=0;i<missed+made;i++) events.push({categoria_id:cat.id,accion_id:a.id,defensa_id:null,resultado:i<missed?'fallado':'anotado',valor_tiro:a.shots[0]});
  } else {
    const defenses = [...new Map(cat.actions.flatMap(a=>a.defenses).map(d=>[d.id,d])).values()];
    for (const d of defenses) {
      const [missed,made] = samples[d.id];
      for (let i=0;i<missed+made;i++) {
        const a=cat.actions[i%cat.actions.length];
        const shots=a.defenses.find(x=>x.id===d.id).shots;
        events.push({categoria_id:cat.id,accion_id:a.id,defensa_id:d.id,resultado:i<missed?'fallado':'anotado',valor_tiro:shots[(i%2)%shots.length]});
      }
    }
  }
}
const percent = s => s.attempts ? Math.round(100*s.missed/s.attempts) : '—';
const bar = s => `<div class="bar${s.attempts?'':' empty'}" aria-hidden="true">${s.attempts?`<span class="missed" style="width:${100*s.missed/s.attempts}%"></span><span class="made" style="width:${100*s.made/s.attempts}%"></span>`:''}</div>`;
const summary = id => summarize(events.filter(e=>id===undefined || e.categoria_id===id));
function rows(id) {
  const cat=config.categories.find(c=>c.id===id);
  const items=id==='directo'?[...new Map(cat.actions.flatMap(a=>a.defenses).map(d=>[d.id,d])).values()]:cat.actions;
  const data=items.map((item,index)=>({...item,index,...summarize(events.filter(e=>e.categoria_id===id && (id==='directo'?e.defensa_id===item.id:e.accion_id===item.id)))}));
  const eligible=data.filter(d=>d.attempts>=5);
  const rates=eligible.map(d=>d.missed/d.attempts);
  const min=Math.min(...rates), max=Math.max(...rates);
  if(id!=='transicion') data.sort((a,b)=>a.attempts===0?(b.attempts===0?a.index-b.index:1):b.attempts===0?-1:a.missed/a.attempts-b.missed/b.attempts || a.index-b.index);
  return data.map(d=>{
    const rate=d.missed/d.attempts;
    const badge=eligible.length>=2 && min!==max && d.attempts>=5 ? rate===min?'worst':rate===max?'best':'' : '';
    return `<article class="performance" data-id="${safe(d.id)}" data-attempts="${d.attempts}" data-missed="${d.missed}" data-made="${d.made}">
      <div class="row-heading"><h3>${safe(d.name)}</h3>${badge?`<span class="badge ${badge}">${badge==='best'?'● Mejor rendimiento':'● A revisar'}</span>`:d.attempts>0&&d.attempts<5?'<span class="sample">Muestra pequeña</span>':''}<strong class="percentage">${percent(d)}${d.attempts?'<small>%</small>':''}</strong></div>
      ${bar(d)}<div class="row-detail"><span>${d.attempts?`<b class="green">${d.missed}</b>–<b class="red">${d.made}</b> · ${percent(d)}%`:'—'}</span><span>${d.attempts} ${d.attempts===1?'intento':'intentos'}</span></div>
    </article>`;
  }).join('');
}
const total=summary();
const summaries=config.categories.map(cat=>{const s=summary(cat.id);return `<div class="group-summary"><div><h3>${safe(cat.name)}</h3><strong>${percent(s)}<small>%</small></strong></div>${bar(s)}<p><span class="green">${s.missed}</span>–<span class="red">${s.made}</span> · ${s.attempts} intentos</p></div>`;}).join('');
const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard · Maqueta Fase 7</title><link rel="stylesheet" href="./maqueta.css"></head><body>
<main class="dashboard">
  <header class="header"><div><p class="eyebrow">REGISTRO DEFENSIVO <span>/ RENDIMIENTO</span></p><h1>Lectura del partido</h1><p class="game">Jornada 12 · CB Norte <span>Partido ficticio</span></p></div><span class="prototype">MAQUETA · DATOS FICTICIOS</span></header>
  <section class="overview" aria-labelledby="overview-title"><div class="section-top"><h2 id="overview-title">Resumen general</h2><div class="legend"><span><i class="missed"></i>Fallados rival</span><span><i class="made"></i>Anotados rival</span></div></div><div class="overview-grid">${summaries}<div class="global-summary"><div><p>Éxito global</p><strong>${percent(total)}<small>%</small></strong><span>${total.missed}–${total.made} · ${total.attempts} intentos</span></div><div class="points"><p>Puntos concedidos</p><strong>${total.pointsAllowed}</strong></div></div></div></section>
  <div class="analysis-grid"><div class="situations">
    <section class="section transition" aria-labelledby="transition-title"><div class="section-top"><h2 id="transition-title">Transición</h2><span class="volume">${summary('transicion').attempts} intentos</span></div><p class="section-note">Comparación por acción</p><div class="rows">${rows('transicion')}</div></section>
    <section class="section static" aria-labelledby="static-title"><div class="section-top"><h2 id="static-title">Estático</h2><span class="volume">${summary('estatico').attempts} intentos</span></div><p class="section-note">Menor → mayor éxito defensivo</p><div class="rows">${rows('estatico')}</div></section>
  </div><section class="section direct" aria-labelledby="direct-title"><div class="direct-intro"><p class="eyebrow">ESTRATEGIAS DEFENSIVAS</p><div class="section-top"><h2 id="direct-title">Bloqueo directo</h2><span class="volume">${summary('directo').attempts} intentos</span></div><p class="section-note">Todos los tipos agrupados · menor → mayor éxito</p></div><div class="rows">${rows('directo')}</div><p class="aggregation">PR Manejador · PR Roller · PR Pop · Spain</p></section></div>
  <footer><p><strong>Lectura:</strong> éxito defensivo = fallados / intentos. Barras al 100%; volumen siempre visible.</p><p>Distintivos por grupo desde 5 intentos. Sin tiros: —. Sin datos reales ni conexión al registro.</p></footer>
</main></body></html>`;
await writeFile(new URL('./index.html',import.meta.url),html);
await writeFile(new URL('./muestra.json',import.meta.url),JSON.stringify({advertencia:'Datos ficticios; no guardar en IndexedDB',total,events},null,2)+'\n');
console.log('Maqueta generada:',total);
