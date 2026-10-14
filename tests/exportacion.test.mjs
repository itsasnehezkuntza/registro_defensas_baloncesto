import assert from "node:assert/strict";
import { buildCsv, csvFilename } from "../js/exportacion.js";
import { parseCsv } from "../js/configuracion.js";
const game={id:"game-a",jornada:'Final; "A"',rival:"=SUM(A1)\nÑandú"};
const legacy={id:"old",gameId:game.id,seq:1,categoria:"Transición",accion:"Bajo aro",valor_tiro:2,resultado:"fallado",fecha_hora:"2026-01-02T00:00:00Z"};
const modern={...legacy,id:"new",seq:2,categoria_id:"transicion",accion_id:"transicion_bajo_aro",defensa_id:null,resultado:"anotado",valor_tiro:3};
const rows=parseCsv(buildCsv([modern,legacy],game)).map(row=>row.fields);
const headers=rows[0];
function cell(row,name) {return row[headers.indexOf(name)];}
assert.equal(buildCsv([],game).charCodeAt(0),0xfeff);
assert.equal(parseCsv(buildCsv([],game)).length,1);
assert.equal(rows.length,3);
assert.equal(cell(rows[1],"ID evento"),"old");
assert.equal(cell(rows[2],"ID evento"),"new");
assert.equal(cell(rows[1],"Jornada"),game.jornada);
assert.equal(cell(rows[1],"Rival"),"'"+game.rival);
assert.equal(cell(rows[1],"ID acción"),"transicion_bajo_aro");
assert.equal(cell(rows[1],"Puntos concedidos"),"0");
assert.equal(cell(rows[2],"Puntos concedidos"),"3");
assert.ok(buildCsv([legacy],game).includes("\r\n"));
assert.throws(()=>buildCsv([{...legacy,gameId:"other"}],game),/otro partido/);
for (const formula of ["=1+1","+SUM(A1)","-1","@A1"," \t=1","\r\n+1"]) {
  const data=parseCsv(buildCsv([{...legacy,accion:formula}],game))[1].fields;
  assert.equal(data[headers.indexOf("Acción")],"'"+formula.replace(/\r\n?/g,"\n"));
}
const filename=csvFilename({id:"unique",jornada:'.. /:*?<>|"\\',rival:"CON. "});
assert.ok(filename.endsWith(".csv") && filename.includes("unique"));
assert.ok(!/[<>:"/\\|?*\x00-\x1f]/.test(filename));
assert.notEqual(csvFilename(game),csvFilename({...game,id:"game-b"}));
assert.ok(csvFilename({...game,rival:"🏀".repeat(500)}).length<255);
assert.ok(new TextEncoder().encode(csvFilename({id:"🏀".repeat(100),jornada:"🏀".repeat(100),rival:"🏀".repeat(100)})).length<255);
console.log("✓ CSV: aislamiento, orden, BOM, escape, fórmulas, cabeceras vacías, IDs y nombre portable");
