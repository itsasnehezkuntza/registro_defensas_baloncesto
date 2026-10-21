// Solo genera HTML estático: sin cargar app.js ni persistencia, sin abrir ninguna base.
import { readFile, writeFile } from "node:fs/promises";
import { parseConfiguration } from "../../js/configuracion.js";
import { summarize, statMarkup } from "../../js/estadisticas.js";
const read = name => readFile(new URL(name, import.meta.url), "utf8");
const write = (name, value) => writeFile(new URL(name, import.meta.url), value);
const config = parseConfiguration(await read("../../categorias.csv"));
const safe = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
// Muestra determinista, compartida por A y B: vacío, 0%, 100% y proporciones mixtas.
const samples = [[4,2],[2,3],[7,3],[2,2],[3,1],[0,0],[0,5],[5,0],
  [2,1],[1,2],[7,3],[0,0],[1,1], [3,2],[1,1],[2,0],[0,2],[0,0],
  [1,2],[2,1],[0,0],[3,1],[1,0], [0,0],[1,2],[2,1],[1,1],[0,0]];
let cursor = 0;
const events = [];
for (const category of config.categories) for (const action of category.actions) {
  for (const defense of action.defenses.length ? action.defenses : [null]) {
    const [missed,made] = samples[cursor++];
    for(let i=0;i<missed+made;i++) events.push({categoria_id:category.id,accion_id:action.id,
      defensa_id:defense?.id??null, resultado:i<missed?"fallado":"anotado",
      valor_tiro:(defense?.shots??action.shots)[0]});
  }
}
const group = (category, action, defense) => events.filter(e => e.categoria_id===category &&
  (action===undefined || e.accion_id===action) && (defense===undefined || e.defensa_id===defense));
const selected = (action,defense) => action==="pr_manejador" && defense==="blue";
let html = await read("../../index.html");
html = html.replace(/  <script type="module" src="\.\/app.js"><\/script>/, '  <link rel="stylesheet" href="./courtflow.css">\n  <link rel="stylesheet" href="./TEMA.css">\n  <script src="./vista.js" defer></script>');
html = html.replace('href="./styles.css"','href="./base-6a.css"');
html = html.replace('<p id="noGameNotice"','<p hidden id="noGameNotice"');
html = html.replace(/ disabled/g, "").replace('save-status is-saving','save-status');
html = html.replace('Cargando…','Guardado localmente');
html = html.replace('<option value="">Selecciona o crea un partido</option>', '<option value="demo">Jornada 12 · CB Norte (datos ficticios)</option>');
for(const [categoryId,targetId,totalId] of [['transicion','transitionActions','transitionTotal'],['estatico','staticActions','staticTotal']]) {
  const category=config.categories.find(c=>c.id===categoryId);
  const buttons=category.actions.map(action=>`<button type="button" class="action-btn" data-category="${categoryId}" data-action="${safe(action.id)}" aria-pressed="false"><span class="action-name">${safe(action.name)}</span><span class="action-score">${statMarkup(summarize(group(categoryId,action.id)))}</span></button>`).join('\n');
  html = html.replace(new RegExp(`(<div id="${targetId}"[^>]*>).*?(</div>)`), '$1'+buttons+'$2');
  html = html.replace(new RegExp(`(<span class="panel-summary" id="${totalId}">).*?(</span>)`),'$1'+statMarkup(summarize(group(categoryId)))+'$2');
}
const rows=config.categories.find(c=>c.id==='directo').actions.map(action=>`<div class="direct-row"><div class="direct-type"><strong>${safe(action.name)}</strong><span>${statMarkup(summarize(group('directo',action.id)))}</span></div><div class="defense-options">${action.defenses.map(defense=>`<button type="button" class="defense-btn" data-category="directo" data-action="${safe(action.id)}" data-strategy="${safe(defense.id)}" aria-pressed="${selected(action.id,defense.id)}"><span class="defense-name">${safe(defense.name)}</span><span class="defense-score">${statMarkup(summarize(group('directo',action.id,defense.id)))}</span></button>`).join('')}</div></div>`).join('\n');
html=html.replace(/(<div id="directActions"[^>]*>).*?(<\/div>)/,'$1'+rows+'$2');
html=html.replace(/(<span class="panel-summary" id="directTotal">).*?(<\/span>)/,'$1'+statMarkup(summarize(group('directo')))+'$2');
html=html.replace('Selecciona una acción o defensa','Bloqueo directo · PR Manejador · Blue');
html=html.replace('0 intentos · —', events.length+' intentos · '+statMarkup(summarize(events)));
html=html.replace(/(<div id="feedback"[^>]*>).*?(<\/div>)/,'$1Vista previa · Datos ficticios$2');
html=html.replace(/(\d+%)/g,'<span class="stat-percent">$1</span>').replace('<h1>REGISTRO DEFENSIVO</h1>','<h1>Registro defensivo</h1>');
html=html.replace('>TRANSICIÓN<','>Transición<').replace('>ESTÁTICO<','>Estático<').replace('>BLOQUEO DIRECTO<','>Bloqueo directo<');
for(const theme of ['light','contrast']) {
  await write(theme+'.html',html.replace('TEMA',theme).replace('<body>','<body class="'+theme+'">').replace('<title>Registro defensivo · Baloncesto</title>','<title>Vista previa — '+(theme==='light'?'CourtFlow Light':'CourtFlow Contrast')+'</title>'));
}
await write('base-6a.css',await read('../../styles.css'));
await write('datos-ficticios.json',JSON.stringify({samples,events,total:summarize(events)},null,2));
console.log('Vistas estáticas CourtFlow generadas desde los archivos locales de Fase 6A.');

