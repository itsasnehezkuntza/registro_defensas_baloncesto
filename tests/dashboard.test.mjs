import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseConfiguration} from '../js/configuracion.js';
import {buildDashboardModel} from '../js/dashboard.js';
const configuration=parseConfiguration(await readFile(new URL('../categorias.csv',import.meta.url),'utf8'));
const shot=(gameId,action,defense,result='fallado',points=2)=>({gameId,categoria_id:'directo',accion_id:action,defensa_id:defense,categoria:'Bloqueo directo',accion:action,estrategia:defense,resultado:result,valor_tiro:points});
const events=[shot('a','pr_manejador','blue'),shot('a','pr_roller','blue','anotado'),shot('a','pr_pop','white','anotado',3),shot('b','pr_pop','white'),
 {gameId:'a',categoria:'Transición',accion:'Bajo aro',resultado:'fallado',valor_tiro:2},
 shot('a','retirado','retirada','fallado'),{gameId:'a',categoria:'Desconocida',accion:'Antigua',resultado:'anotado',valor_tiro:2}];
const original=JSON.stringify({configuration,events});
let model=buildDashboardModel(configuration,events,'a');
assert.deepEqual(model.total,{attempts:6,missed:3,made:3,pointsAllowed:7,successRate:50,pointsPerAttempt:7/6});
assert.equal(model.unclassified,1);
const direct=model.groups.find(x=>x.id==='directo');
assert.equal(direct.rows.find(x=>x.id==='blue').attempts,2);
assert.equal(direct.rows.find(x=>x.id==='blue').missed,1);
assert.equal(direct.rows[0].id,'retirada'); // Menor cociente de puntos, no menor éxito.
assert.equal(direct.rows.find(x=>x.id==='retirada').historical,true);
assert.equal(model.groups[0].rows[0].attempts,1);
const renamed=structuredClone(configuration);renamed.categories[2].actions.forEach(a=>a.defenses.find(d=>d.id==='blue').name='Nueva etiqueta');
assert.equal(buildDashboardModel(renamed,events,'a').groups[2].rows.find(r=>r.id==='blue').name,'Nueva etiqueta');
const removed=structuredClone(configuration);removed.categories[0].actions.shift();
assert.equal(buildDashboardModel(removed,events,'a').groups[0].rows.find(r=>r.id==='transicion_bajo_aro').historical,true);
assert.equal(buildDashboardModel(configuration,events,null).total.attempts,0);
assert.equal(buildDashboardModel(configuration,events,'b').total.attempts,1);
assert.equal(buildDashboardModel(null,events,'a').total.attempts,6);
assert.equal(JSON.stringify({configuration,events}),original);
console.log('Dashboard: partido activo, agregación por defensa, ranking, ceros, v1, renombrado/retirada, desconocidos y lectura inmutable correctos.');
