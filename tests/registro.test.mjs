import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseConfiguration } from "../js/configuracion.js";
import { resolveSelection, makeShotEvent } from "../js/registro.js";
import { summarize, statText } from "../js/estadisticas.js";
import { matchesEvent } from "../js/identidad.js";
const csv = await readFile(new URL("../categorias.csv", import.meta.url), "utf8");
const config = parseConfiguration(csv);
const game = {id:"game",jornada:"Final",rival:"Rival"};
let combinations = 0;
const events = [];
for (const category of config.categories) for (const action of category.actions) {
  for (const defense of (action.defenses.length ? action.defenses : [null])) {
    combinations++;
    const selection = resolveSelection(config,{category:category.id,actionId:action.id,strategyId:defense?.id ?? null});
    assert.ok(selection);
    assert.ok(Object.isFrozen(selection) && Object.isFrozen(selection.shots));
    for (const points of [2,3]) for (const result of ["anotado","fallado"]) {
      if ((defense?.shots ?? action.shots).includes(points)) {
        const event = makeShotEvent(String(events.length),game,selection,points,result);
        assert.equal(event.accion_id,action.id);
        assert.equal(event.defensa_id,defense?.id ?? null);
        assert.equal(event.categoria,category.name);
        events.push(event);
      } else assert.throws(()=>makeShotEvent("invalid",game,selection,points,result),/no está permitido/);
    }
  }
}
assert.equal(combinations,33);
assert.equal(JSON.stringify(summarize(events)),JSON.stringify({attempts:104,missed:52,made:52,pointsAllowed:125}));
assert.equal(statText(summarize([])),"—");
assert.equal(statText(summarize([{resultado:"fallado"},{resultado:"anotado"},{resultado:"anotado"}])),"1–2 · 33%");
assert.equal(resolveSelection(config,{category:"directo",actionId:"pr_roller",strategyId:"unknown"}),null);
assert.equal(resolveSelection(config,{category:"transicion",actionId:"transicion_bajo_aro",strategyId:"blue"}),null);
const tampered = {category:"transicion",actionId:"transicion_bajo_aro",strategyId:null,shots:[3]};
assert.equal(JSON.stringify(resolveSelection(config,tampered).shots),"[2]");
const selection = resolveSelection(config,tampered);
assert.throws(()=>makeShotEvent("bad",game,selection,3,"fallado"),/no está permitido/);
assert.throws(()=>makeShotEvent("bad",game,selection,2,"otro"),/no está permitido/);
const original = Object.freeze(makeShotEvent("historical",game,selection,2,"fallado"));
const renamed = parseConfiguration(csv.replaceAll("Transición","Contraataque"));
assert.equal(resolveSelection(renamed,tampered).categoryName,"Contraataque");
assert.ok(matchesEvent(original,"transicion","transicion_bajo_aro"));
assert.equal(original.categoria,"Transición");
const legacy = Object.freeze({categoria:"Transición",accion:"Bajo aro",valor_tiro:2,resultado:"anotado"});
assert.ok(matchesEvent(legacy,"transicion","transicion_bajo_aro"));
assert.equal(summarize([original,legacy]).pointsAllowed,2);
console.log("✓ Registro: 33 combinaciones, 104 resultados, permisos canónicos, estadísticas e históricos");
