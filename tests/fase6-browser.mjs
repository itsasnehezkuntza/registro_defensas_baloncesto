import * as store from "../js/persistencia.js";
import { page, assert } from "./ui-fixture.mjs";
const checks=[];
try {
  assert(location.hostname==="127.0.0.1" && new URLSearchParams(location.search).get("isolated")==="1","Perfil aislado obligatorio");
  await store.openDatabase();
  assert(!(await store.readState()).games.length,"Base no vacía: se detiene");
  const ui=await page();
  const destinations=[['[data-action="transicion_bajo_aro"]','.action-score','#transitionTotal'],['[data-action="estatico_1c1_exterior"]','.action-score','#staticTotal'],['[data-action="pr_manejador"][data-strategy="blue"]','.defense-score','#directTotal']];
  const order=ui.all('.result-btn').map(b=>b.dataset.points+':'+b.dataset.result);
  assert(JSON.stringify(order)===JSON.stringify(['2:fallado','3:fallado','2:anotado','3:anotado']),"Orden incorrecto");
  let first;
  for(const [target,score,summary] of destinations) {
    for(const [missed,made] of [[7,3],[0,5],[5,0]]) {
      const id=await ui.create('6A', 'Prueba '+checks.length);
      assert(ui.q(target+' '+score).textContent==='—' && ui.q(summary).textContent==='—' && ui.q('#gameTotal').textContent.endsWith('—'),"Vacío incorrecto");
      for(let i=0;i<missed+made;i++) {
        const points=target.includes('transicion')?2:(i%2?2:3);
        const result=i<missed?'fallado':'anotado';
        const before=(await store.readState()).events.length;
        ui.q(target).click();
        ui.q('[data-points="'+points+'"][data-result="'+result+'"]').click(); await ui.idle();
        const events=(await store.readState()).events;
        assert(events.length===before+1 && events.at(-1).valor_tiro===points && events.at(-1).resultado===result,"Botón reorganizado registra mal");
      }
      const expected = `${made}/${missed + made}`; // Registro: anotados/intentos.
      for(const element of [ui.q(target+' '+score),ui.q(summary),ui.q('#gameTotal')]) {
        assert(element.textContent === (element.id === 'gameTotal' ? 'Anotados/intentos · ' : '') + expected,"Presentación incorrecta: "+element.textContent);
        assert(!element.querySelector('.stat-missed,.stat-made'),"Se mantienen recuentos de tiros visibles");
      }
      if(target.includes('pr_manejador'))assert(ui.q('.direct-type').textContent.includes(expected),"Resumen de tipo incorrecto");
      await ui.load(); assert(ui.q(summary).textContent===expected,"Recarga pierde resultados");
      ui.q('#undoBtn').click();await ui.idle();
      const after = `${made ? made - 1 : 0}/${missed + made - 1}`;
      assert(ui.q(summary).textContent===after,"Deshacer no actualiza resultados");
      if(first) {await ui.select(first.id);assert(ui.q(first.summary).textContent===first.expected,"Partidos mezclados");await ui.select(id);assert(ui.q(summary).textContent===after,"Cambio pierde estadística propia");}
      else first={id,summary,expected:after};
      checks.push(target+' '+expected+': registro, recarga, Deshacer y aislamiento');
    }
  }
  window.phase6Result={ok:true,checks};
} catch(error) {window.phase6Result={ok:false,checks,error:error.stack};}
document.querySelector('#results').textContent=JSON.stringify(window.phase6Result,null,2);
