import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseConfiguration, parseCsv, loadConfiguration } from "../js/configuracion.js";
import { matchesEvent, eventIdentity } from "../js/identidad.js";
import { summarize, statText } from "../js/estadisticas.js";
import { buildCsv } from "../js/exportacion.js";

const csv = await readFile(new URL("../categorias.csv", import.meta.url), "utf8");
let passed = 0;
function test(name, fn) { fn(); passed++; console.log("✓ " + name); }
const config = parseConfiguration(csv);
const header = csv.split("\n")[0];
const simple = "transicion;Transición;aro;Bajo aro;;;2";
function invalid(row, message) { assert.throws(() => parseConfiguration(header + "\n" + row), message); }

test("33 combinaciones: 2 transición, 7 estático, 24 bloqueo", () => {
  assert.deepEqual(config.categories.map(c => c.actions.reduce((n,a) => n + (a.defenses.length || 1), 0)), [2,7,24]);
});
test("PR Roller: ocho defensas, exclusivamente 2 puntos", () => {
  const roller = config.categories[2].actions.find(a => a.id === "pr_roller");
  assert.equal(roller.defenses.length, 8);
  roller.defenses.forEach(d => assert.deepEqual(d.shots, [2]));
});
test("BOM, CRLF y líneas vacías", () => assert.deepEqual(parseConfiguration("\uFEFF" + csv.replaceAll("\n", "\r\n") + "\r\n"), config));
test("Comillas, separador, saltos y comillas escapadas", () => {
  assert.deepEqual(parseCsv('a;"b;c";"d""e";"f\ng"')[0].fields, ["a","b;c",'d"e',"f\ng"]);
});
test("Error en cabecera", () => assert.throws(() => parseConfiguration("categoria;accion"), /cabecera/));
test("Error si no hay acciones", () => assert.throws(() => parseConfiguration(header), /no hay acciones/));
test("Número incorrecto de columnas", () => invalid(simple + ";extra", /7 columnas/));
test("ID de categoría desconocido", () => invalid(simple.replace("transicion;", "otra;"), /categoria_id/));
test("Nombre obligatorio", () => invalid(simple.replace(";Bajo aro;", ";;"), /obligatorios/));
test("ID inválido", () => invalid(simple.replace(";aro;", ";Aro con espacios;"), /ID inválido/));
test("Tiros 1, 4, vacíos y repetidos rechazados", () => {
  for (const shots of ["1","4","","2,2","2,4"]) invalid(simple.slice(0,-1) + shots, /tiros debe/);
});
test("Defensa obligatoria en directo", () => invalid(simple.replace("transicion;Transición", "directo;Bloqueo directo"), /requiere defensa/));
test("Defensa prohibida en acciones simples", () => invalid(simple.replace(";;;2", ";blue;Blue;2"), /defensa vacía/));
test("Combinación duplicada", () => invalid(simple + "\n" + simple, /duplicada/));
test("Categoría con nombres contradictorios", () => invalid(simple + "\n" + simple.replace("Transición;aro", "Otro nombre;otro"), /contradictorios/));
test("Acción con ID reutilizado", () => invalid(simple + "\n" + simple.replace("transicion;Transición", "estatico;Estático"), /reutilizado/));
test("Defensa con ID y nombres contradictorios", () => invalid("directo;Bloqueo directo;pr;PR;blue;Blue;2\ndirecto;Bloqueo directo;pop;Pop;blue;Azul;3", /contradictorios/));
test("Comillas incorrectas", () => {
  assert.throws(() => parseCsv('a;"b'), /sin cerrar/);
  assert.throws(() => parseCsv('a;b"c'), /inicio del campo/);
  assert.throws(() => parseCsv('a;"b"x'), /después de cerrar/);
});
test("Nombres y tiros editables, sin cambiar IDs", () => {
  const changed = parseConfiguration(csv.replaceAll("Transición", "Contraataque").replaceAll("Blue", "Azul").replaceAll(";PR Pop;", ";Pop abierto;"));
  assert.equal(changed.categories[0].id, "transicion");
  assert.equal(changed.categories[2].actions[0].defenses[2].name, "Azul");
  const custom = parseConfiguration(header + "\n" + simple.slice(0,-1) + "3");
  assert.deepEqual(custom.categories[0].actions[0].shots, [3]);
});
const legacy = Object.freeze({ id:"old", seq:1, gameId:"game", categoria:"Bloqueo directo", accion:"PR Roller", tipo_bloqueo:"PR Roller", estrategia:"Blue", valor_tiro:2, resultado:"fallado" });
const modern = Object.freeze({ ...legacy, id:"new", categoria_id:"directo", accion_id:"pr_roller", defensa_id:"blue", tiros_permitidos:Object.freeze([2]) });
const snapshot = JSON.stringify([legacy,modern]);
test("Identidad v1 por tabla fija y nueva por IDs", () => {
  for (const event of [legacy,modern]) assert.equal(matchesEvent(event, "directo", "pr_roller", "blue"), true);
  assert.equal(eventIdentity({categoria:"Desconocida",accion:"Otra"}), null);
});
test("Retirar filas no cambia eventos ni su exportación", () => {
  const withoutRoller = parseConfiguration(csv.split("\n").filter(line => !line.includes(";pr_roller;")).join("\n"));
  assert.equal(withoutRoller.categories[2].actions.some(a => a.id === "pr_roller"), false);
  assert.match(buildCsv([legacy,modern]), /PR Roller/);
  assert.equal(JSON.stringify([legacy,modern]), snapshot);
});
test("Totales y porcentaje entero; eventos retirados siguen contando", () => {
  assert.equal(statText(summarize([legacy,modern,{resultado:"anotado",valor_tiro:3}])), "2–1 · 67%");
  assert.equal(summarize([legacy,modern]).attempts, 2);
  assert.equal(statText(summarize([])), "—");
});
test("CSV conserva BOM, cabeceras sin eventos y nombres históricos", () => {
  assert.ok(buildCsv([]).startsWith("\uFEFF"));
  assert.match(buildCsv([]), /ID evento/);
  assert.match(buildCsv([modern]), /Blue/);
});
await loadConfiguration("http://test/categorias.csv", async () => ({ok:true,text:async()=>csv}));
passed++; console.log("✓ Carga CSV mediante fetch");
await assert.rejects(loadConfiguration("http://test/missing", async () => ({ok:false,status:404})), /HTTP 404/);
passed++; console.log("✓ Error de carga HTTP");
await assert.rejects(loadConfiguration("file:test", async () => {throw Error("network");}), /servidor estático/);
passed++; console.log("✓ Error de red");
console.log(passed + " pruebas superadas.");
