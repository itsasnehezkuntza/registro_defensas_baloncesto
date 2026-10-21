// DOM y persistencia simulados: no sustituye pruebas de navegador.
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const csv = await readFile(new URL("../categorias.csv", import.meta.url), "utf8");
const old = { id:"old", seq:1, gameId:"game", categoria:"Bloqueo directo", accion:"PR Roller", tipo_bloqueo:"PR Roller", estrategia:"Blue", valor_tiro:2, resultado:"fallado" };
let run = 0;

async function setup(csvText, failed = false) {
  globalThis.__fixture = {
    games:[{id:"game",jornada:"Final",rival:"Visitante",createdAt:"2026-01-01"}],
    events:[structuredClone(old)], added:[], calls:[],
  };
  const fixture = globalThis.__fixture;
  const elements = new Map();
  const results = [2,2,3,3].map((points, i) => ({dataset:{points:String(points),result:i % 2 ? "fallado":"anotado"},disabled:true}));
  function element(id) {
    if (!elements.has(id)) elements.set(id, {innerHTML:"",textContent:"",value:"",hidden:true,disabled:false,
      classList:{toggle(){}},listeners:{},addEventListener(name, fn){this.listeners[name]=fn;},
      querySelectorAll(){return results;},focus(){},select(){}});
    return elements.get(id);
  }
  const doc = {readyState:"loading",documentElement:{hasAttribute(){return false;}},querySelector:element,querySelectorAll(){return [];},
    addEventListener(name, fn){if(name==="DOMContentLoaded")this.ready=fn;}};
  globalThis.document = doc;
  globalThis.indexedDB = {};
  globalThis.window = {addEventListener(){}};
  globalThis.BroadcastChannel = undefined;
  globalThis.fetch = async () => {
    if(failed) throw Error("network");
    return {ok:true,text:async()=>csvText};
  };
  const persistence = `
    const f = globalThis.__fixture;
    export async function openDatabase() { f.calls.push("open"); }
    export async function readState() { return structuredClone({games:f.games,currentGameId:"game",events:f.events}); }
    export async function selectGameState() { return readState(); }
    export async function createGameAndSelect() { throw Error("unexpected creation"); }
    export async function deleteGame() { throw Error("unexpected deletion"); }
    export async function clearGameEvents() { throw Error("unexpected clear"); }
    export async function readExportSnapshot() { return {game:f.games[0],events:structuredClone(f.events)}; }
    export async function allEvents() { return structuredClone(f.events); }
    export async function addEvent(e) { f.added.push(structuredClone(e)); f.events.push({...e,seq:2}); return 2; }
    export async function removeLastGameEvent() { throw Error("unexpected undo"); }
  `;
  const temp = await mkdtemp(join(tmpdir(), "defensas-test-"));
  await writeFile(join(temp,"persistencia.mjs"), persistence);
  const persistenceUrl = pathToFileURL(join(temp,"persistencia.mjs")).href;
  let app = source.replace(/from "\.\/js\/([^"]+)"/g, (_, file) =>
    'from "' + (file === "persistencia.js" ? persistenceUrl : new URL("../js/" + file, import.meta.url).href) + '"');
  app += "\n// escenario " + run++;
  await writeFile(join(temp,"app.mjs"), app);
  try { await import(pathToFileURL(join(temp,"app.mjs")).href); }
  finally { await rm(temp, { recursive:true, force:true }); }
  await doc.ready();
  function pick(action, strategy) {
    element("#directActions").listeners.click({target:{closest:()=>({disabled:false,dataset:{category:"directo",action,strategy}})}});
  }
  async function result(index) {
    element("#resultButtons").listeners.click({target:{closest:()=>results[index]}});
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  return { fixture, element, results, pick, result };
}

let ui = await setup(csv);
assert.equal((ui.element("#directActions").innerHTML.match(/class="defense-btn"/g)||[]).length,24);
assert.equal((ui.element("#staticActions").innerHTML.match(/class="action-btn"/g)||[]).length,7);
assert.equal((ui.element("#transitionActions").innerHTML.match(/class="action-btn"/g)||[]).length,2);
ui.pick("pr_roller","blue");
assert.deepEqual(ui.results.map(b=>b.disabled), [false,false,true,true]);
await ui.result(3);
assert.equal(ui.fixture.added.length,0);
await ui.result(1);
assert.equal(ui.fixture.added.length,1);
const added=ui.fixture.added[0];
assert.equal(added.categoria_id,"directo");
assert.equal(added.accion_id,"pr_roller");
assert.equal(added.defensa_id,"blue");
assert.equal(JSON.stringify(added.tiros_permitidos),JSON.stringify([2]));
assert.equal(added.accion,"PR Roller");
assert.equal(added.estrategia,"Blue");
assert.equal(added.resultado,"fallado");
assert.equal(JSON.stringify(ui.fixture.events[0]),JSON.stringify(old));
assert.ok(ui.results.every(b=>b.disabled));
await ui.result(1);
assert.equal(ui.fixture.added.length,1);
console.log("✓ Arranque: 33 combinaciones, Roller 2P, evento con IDs, selección consumida e histórico intacto");

ui = await setup(csv.replaceAll("Bloqueo directo","Pick and roll").replaceAll("PR Roller","Continuador").replaceAll("Blue","Azul"));
assert.equal(ui.element("#directTitle").textContent,"PICK AND ROLL");
assert.match(ui.element("#directActions").innerHTML,/Continuador/);
const displayedScores = [...ui.element("#directActions").innerHTML.matchAll(/class="defense-score">([\s\S]*?)<\/button>/g)]
  .map(match => match[1].replace(/<[^>]+>/g, '').trim());
assert(displayedScores.includes('0/1')); // Registro: anotados/intentos (Fase 9B).
assert.equal(JSON.stringify(ui.fixture.events),JSON.stringify([old]));
ui.pick("pr_roller","blue");
await ui.result(0);
assert.equal(ui.fixture.added[0].accion,"Continuador");
assert.equal(ui.fixture.added[0].estrategia,"Azul");
assert.equal(JSON.stringify(ui.fixture.events[0]),JSON.stringify(old));
console.log("✓ Renombrado: agrupación antigua conservada, nombres nuevos solo en eventos nuevos");

ui = await setup(csv.split("\n").filter(line=>!line.includes(";pr_roller;")).join("\n"));
assert.doesNotMatch(ui.element("#directActions").innerHTML,/pr_roller/);
assert.equal(ui.element("#gameTotal").innerHTML.replace(/<[^>]+>/g, ''),"Anotados/intentos · 0/1");
assert.equal(JSON.stringify(ui.fixture.events),JSON.stringify([old]));
console.log("✓ Acción retirada: sin botón, evento conservado y contado");

for (const [text,failed] of [[csv.replace(/;2\r?\n/,";4\n"),false],[csv,true]]) {
  ui = await setup(text,failed);
  assert.equal(ui.element("#configurationError").hidden,false);
  assert.ok(ui.element("#configurationError").textContent.length>0);
  assert.ok(ui.results.every(b=>b.disabled));
  assert.equal(ui.element("#exportCsvBtn").disabled,false);
  ui.pick("pr_roller","blue");
  await ui.result(1);
  assert.equal(ui.fixture.added.length,0);
  assert.equal(JSON.stringify(ui.fixture.events),JSON.stringify([old]));
}
console.log("✓ CSV inválido o inaccesible: error visible, registro bloqueado, exportación disponible");
delete globalThis.window;
delete globalThis.indexedDB;
delete globalThis.document;
delete globalThis.fetch;
delete globalThis.__fixture;
