import * as store from "../js/persistencia.js";
import { parseCsv } from "../js/configuracion.js";
import { page, until, assert } from "./ui-fixture.mjs";
const results=[];const output=document.querySelector("#results");
const pass=message=>{results.push(message);output.textContent=results.join("\n");};
try {
  assert(location.hostname==="127.0.0.1" && new URLSearchParams(location.search).get("isolated")==="1","Requiere perfil aislado");
  await store.openDatabase();assert(!(await store.readState()).games.length,"Base no vacía");
  const a=await page();
  const first=await a.create('Final; "A"','=Rival Ñ\nPrueba');
  const special=(await store.readState()).games[0];
  const base={gameId:first,categoria_id:"transicion",categoria:"Nombre original",accion_id:"transicion_bajo_aro",accion:'Acción; "Ñ"\nOtra línea',defensa_id:null,valor_tiro:2,resultado:"fallado",fecha_hora:"2026-01-01T00:00:00Z"};
  await store.addEvent({...base,id:"a1"});await store.addEvent({...base,id:"a2",resultado:"anotado",valor_tiro:3});
  const second=await a.create("Otra", "Partido");await store.addEvent({...base,id:"b1",gameId:second});
  await a.select(first);
  const captured=[];
  function capture(ui) {
    const win=ui.frame.contentWindow;
    const blobs=new Map();let id=0;
    win.URL.createObjectURL=blob=>{const key="blob:test-"+id++;blobs.set(key,blob);return key;};
    win.URL.revokeObjectURL=key=>blobs.delete(key);
    win.HTMLAnchorElement.prototype.click=function(){ captured.push({filename:this.download,blob:blobs.get(this.href)}); };
  }
  capture(a);
  a.q("#exportCsvBtn").click();await a.idle();
  assert(captured.length===1,"No inicia descarga");
  async function read(download) {
    const bytes=new Uint8Array(await download.blob.arrayBuffer());
    assert(bytes[0]===239&&bytes[1]===187&&bytes[2]===191,"BOM no presente");
    return parseCsv(new TextDecoder().decode(bytes)).map(row=>row.fields);
  }
  let rows=await read(captured[0]);const headers=rows[0];const index=name=>headers.indexOf(name);
  assert(rows.length===3&&rows.slice(1).every(row=>row[index("ID partido")]===first),"Mezcla partidos");
  assert(rows[1][index("ID evento")]==="a1"&&rows[2][index("ID evento")]==="a2","Orden incorrecto");
  assert(rows[1][index("Acción")]===base.accion&&rows[1][index("Rival")]==="'"+special.rival,"Escape o protección incorrectos");
  assert(rows[1][index("Puntos concedidos")]==="0"&&rows[2][index("Puntos concedidos")]==="3","Puntos incorrectos");
  assert(rows[1][index("ID acción")]===base.accion_id&&captured[0].filename.includes(first),"IDs o nombre incompletos");
  pass("CSV real de interfaz: solo partido capturado, orden, BOM, nombres originales, escape y puntos");

  const renamed=await page(false,"rename");capture(renamed);
  renamed.q("#exportCsvBtn").click();await renamed.idle();
  rows=await read(captured.at(-1));assert(rows[1][index("Categoría defensiva")]===base.categoria,"Renombrado reescribe CSV histórico");
  const retired=await page(false,"retire");capture(retired);
  retired.q("#exportCsvBtn").click();await retired.idle();
  assert((await read(captured.at(-1))).length===3,"Categoría retirada excluida del CSV");
  pass("Histórico renombrado/retirado sigue exportándose sin reescritura");

  const empty=await a.create("Vacío", "Sin tiros");capture(a);
  a.q("#exportCsvBtn").click();await a.idle();assert((await read(captured.at(-1))).length===1,"Partido vacío no exporta cabeceras");
  await a.select("");const total=captured.length;
  assert(a.q("#exportCsvBtn").disabled,"Exportación sin activo habilitada");
  a.q("#exportCsvBtn").disabled=false;a.q("#exportCsvBtn").click();await a.idle();assert(captured.length===total,"Exporta sin activo");
  pass("Partido vacío exporta cabeceras; sin activo no descarga");

  await a.select(first);
  const b=await page(true);
  const database=await new Promise(resolve=>{const request=indexedDB.open("registro_defensivo_baloncesto");request.onsuccess=()=>resolve(request.result);});
  const lock=database.transaction(["games","events","settings"],"readwrite");let hold=true;
  function keep(){const request=lock.objectStore("games").get(first);request.onsuccess=()=>{if(hold)keep();};}keep();
  const changing=b.select(second); // Cambio pendiente antes de que empiece la lectura de exportación.
  a.q("#exportCsvBtn").click();await new Promise(resolve=>setTimeout(resolve,60));hold=false;
  await changing;await a.idle();
  rows=await read(captured.at(-1));assert(rows.slice(1).every(row=>row[index("ID partido")]===first),"Cambio ajeno cruzó la exportación");
  database.close();b.frame.contentWindow.close();
  pass("Cambio concurrente de activo no altera el ID capturado al iniciar CSV");

  await a.select(first);
  const get=a.frame.contentWindow.IDBObjectStore.prototype.get;
  a.frame.contentWindow.IDBObjectStore.prototype.get=function(key){
    if(this.name==="games"&&this.transaction.mode==="readonly"){this.transaction.abort();return;}
    return get.call(this,key);
  };
  const beforeFailure=captured.length;a.q("#exportCsvBtn").click();await a.idle();
  a.frame.contentWindow.IDBObjectStore.prototype.get=get;
  assert(captured.length===beforeFailure&&a.q("#saveStatus").classList.contains("is-error"),"Fallo genera descarga o falso Guardado");
  pass("Fallo de lectura: error visible y ninguna descarga parcial");

  const beforeDeleted=captured.length;
  await store.deleteGame(first);
  a.q("#exportCsvBtn").click();await a.idle();
  await until(()=>a.q("#gameSelect").value===""); // También debe terminar el refresco posterior al error.
  assert(captured.length===beforeDeleted && a.q("#gameSelect").value==="",
    "Partido eliminado exporta otro encuentro");
  pass("Partido eliminado: snapshot rechazado, ninguna descarga ajena y selección invalidada");

  await a.select(empty); // Recarga inmediata al recibir el commit, sin temporizador de guardado.
  const win=a.frame.contentWindow;const completion=new Promise(resolve=>{
    const listener=()=>{if(a.q("#feedback").textContent==="Tiro registrado."){observer.disconnect();resolve();}};
    const observer=new win.MutationObserver(listener);observer.observe(a.q("#feedback"),{childList:true,subtree:true});
  });
  a.q('[data-action="transicion_bajo_aro"]').click();a.q('[data-points="2"][data-result="fallado"]').click();
  await completion;await a.load();
  assert((await store.readState()).events.length===1&&a.q("#gameTotal").textContent === 'Anotados/intentos · 0/1',"Recarga inmediata perdió tiro confirmado");
  a.q("#undoBtn").click();await a.idle();await a.load();assert(!(await store.readState()).events.length,"Deshacer no persiste");
  pass("Recarga inmediata tras commit conserva tiro; Deshacer y recarga mantienen aislamiento");

  // Carga desde el paquete estático, servido bajo el subdirectorio de Pages.
  const frame=document.createElement("iframe");document.body.append(frame);
  frame.src="/registro_defensas_baloncesto/index.html";
  await until(()=>frame.contentDocument?.querySelector("#newGameBtn")?.disabled===false);
  assert(frame.contentDocument.querySelectorAll(".action-btn,.defense-btn").length===33,"Módulos/CSV fallan bajo subdirectorio");
  assert(getComputedStyle(frame.contentDocument.querySelector(".result-dock")).position==="fixed","CSS no cargado bajo subdirectorio");
  frame.contentDocument.querySelector("#exportCsvBtn").click();
  await until(()=>!frame.contentDocument.querySelector("#gameSelect").disabled);
  assert([...frame.contentDocument.styleSheets].some(sheet=>sheet.href?.endsWith('/styles.css') && sheet.cssRules.length),"styles.css no cargado bajo subdirectorio");
  await frame.contentDocument.fonts.ready;
  assert([...frame.contentDocument.fonts].filter(face=>face.status==="loaded").length===2,"Fuentes locales no cargadas bajo subdirectorio");
  pass("Paquete de 17 archivos bajo /registro_defensas_baloncesto/: HTML, CSS V4, fuentes locales, módulos y CSV cargan; descarga nativa solicitada");
  window.phase5Result={ok:true,results};
}catch(error){window.phase5Result={ok:false,results,error:error.stack};output.textContent+="\n"+error.stack;}
