import * as store from "../js/persistencia.js";
import { page, until, assert } from "./ui-fixture.mjs";
const output=document.querySelector("#results");
try {
  assert(location.hostname==="127.0.0.1" && new URLSearchParams(location.search).get("isolated")==="1","Requiere perfil aislado");
  await store.openDatabase();
  assert(!(await store.readState()).games.length,"Base no vacía: no se harán pruebas");
  const ui=await page();
  const gameId=await ui.create("Jornada 12", "Rival de prueba");
  for(let i=0;i<10;i++) await store.addEvent({id:"visual-"+i,gameId,
    categoria_id:"directo",categoria:"Bloqueo directo",accion_id:"pr_manejador",accion:"PR Manejador",
    defensa_id:"blue",estrategia:"Blue",tipo_bloqueo:"PR Manejador",valor_tiro:3,
    resultado:i<7?"fallado":"anotado",fecha_hora:new Date().toISOString()});
  await ui.load();
  ui.frame.style.cssText="display:block;border:0";
  async function settle() {
    await ui.frame.contentDocument.fonts.ready;
    await new Promise(resolve=>setTimeout(resolve,80));
    await ui.idle();
  }
  function rect(element) {const r=element.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};}
  window.auditSize=async(width,height,scale=1,textScale=1)=>{
    ui.frame.style.width=width+"px";ui.frame.style.height=height+"px";
    const doc=ui.frame.contentDocument;
    doc.body.style.zoom=scale;
    doc.documentElement.style.fontSize=(textScale*100)+"%";
    await settle();
    const selectedButton=ui.q('[data-action="pr_manejador"][data-strategy="blue"]');
    if(selectedButton.getAttribute("aria-pressed")!=="true") selectedButton.click();
    doc.documentElement.scrollTop=0;
    await settle();
    const fitsWithoutScroll=rect(ui.all(".defense-btn").at(-1)).bottom<=rect(ui.q(".result-dock")).y;
    doc.documentElement.scrollTop=doc.documentElement.scrollHeight;
    await settle();
    const buttons=ui.all(".action-btn,.defense-btn,.result-btn,.toolbar button,.toolbar select");
    const dock=rect(ui.q(".result-dock"));
    const last=rect(ui.all(".defense-btn").at(-1));
    const horizontal=doc.documentElement.scrollWidth>doc.documentElement.clientWidth+1;
    const small=buttons.filter(button=>{const r=rect(button);return r.width<43.9||r.height<43.9;}).map(button=>button.id||button.textContent.trim());
    const clipped=ui.all(".action-name,.defense-name,.action-score,.defense-score").filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent);
    const results=ui.all(".result-btn").map(el=>({...rect(el),disabled:el.disabled,clipped:el.scrollWidth>el.clientWidth+1}));
    const selectedStyles=getComputedStyle(ui.q('[aria-pressed="true"]'));
    const topPanels=ui.all(".top-grid > .stat-panel").map(el=>rect(el).height);
    const staticStyle=getComputedStyle(ui.q("#staticActions"));
    const marker=getComputedStyle(ui.q('[aria-pressed="true"]'),"::after").content;
    ui.q("#undoBtn").focus();
    const focusVisible=getComputedStyle(ui.q("#undoBtn")).outlineStyle==="solid";

    const typography={
      loaded:[...doc.fonts].filter(face=>face.status==="loaded").map(face=>face.family.replaceAll('"','')),
      notUppercase:ui.all("body *").filter(el=>el.getClientRects().length &&
        [...el.childNodes].some(node=>node.nodeType===3 && node.textContent.trim()) &&
        getComputedStyle(el).textTransform!=="uppercase").map(el=>el.id||el.tagName),
      actionFont:getComputedStyle(ui.q(".action-name")).fontFamily,
      statFont:getComputedStyle(ui.q(".defense-score")).fontFamily
    };
    const metrics={width,height,scale,textScale,horizontal,small,clipped,dock,last,results,fitsWithoutScroll,typography,
      topPanels,staticColumns:staticStyle.gridTemplateColumns.split(" ").length,
      staticRows:staticStyle.gridTemplateRows.split(" ").length,
      dockCoversLast:last.bottom>dock.y+1,
      sections:ui.all("main section").length,
      defenses:ui.all(".defense-btn").length,
      marker,focusVisible,selectionBorder:selectedStyles.borderStyle,
      selected:ui.q('[aria-pressed="true"]')?.textContent.trim(),
      headerHeight:rect(ui.q(".header")).height,
      fixed:getComputedStyle(ui.q(".result-dock")).position,
      headerClipped:ui.all(".brand h1,#saveStatusText").some(el=>el.scrollWidth>el.clientWidth+1),
      stats:ui.q('[data-action="pr_manejador"][data-strategy="blue"] .defense-score').textContent};
    // Volver a inicio para la captura de la composición completa.
    doc.documentElement.scrollTop=0;
    await settle();
    return metrics;
  };
  window.auditScroll=async()=>{
    ui.frame.contentDocument.documentElement.scrollTop=ui.frame.contentDocument.documentElement.scrollHeight;
    await settle();
  };
  window.auditDialog=async(kind)=>{
    ui.q(kind==="new"?"#newGameBtn":"#deleteGameBtn").click();await settle();
    const dialog=ui.q(kind==="new"?"#newGameDialog":"#deleteGameDialog");
    const bounds=rect(dialog);
    const inputs=[...dialog.querySelectorAll("input")];
    inputs.forEach(input=>{input.value="Prueba mixta Ñ";});
    const metrics={kind,bounds,scrollWidth:dialog.scrollWidth,clientWidth:dialog.clientWidth,
      uppercase:[...dialog.querySelectorAll("*")].every(el=>getComputedStyle(el).textTransform==="uppercase"),
      unchangedValues:inputs.every(input=>input.value==="Prueba mixta Ñ"),
      visible:dialog.open,viewport:{width:ui.frame.clientWidth,height:ui.frame.clientHeight}};
    ui.q(kind==="new"?"#cancelNewGameBtn":"#cancelDeleteBtn").click();await settle();
    return metrics;
  };
  window.auditFunctional=async()=>{
    ui.q('[data-action="pr_roller"][data-strategy="blue"]').click();
    assert(ui.q('[data-points="3"]').disabled,"Roller habilita 3P");
    ui.q('[data-points="2"][data-result="fallado"]').click();await ui.idle();
    assert(ui.q('[data-action="pr_roller"][data-strategy="blue"]').textContent.includes("1–0 · 100%"),"Estadística no actualizada");
    ui.q("#undoBtn").click();await ui.idle();
    assert((await store.allEvents()).length===10,"Deshacer incorrecto");
    return true;
  };
  // Paleta calculada, incluidos estados dinámicos sin escribir datos.
  window.auditPalette=()=>{
    const colors=new Set(),outside=[];
    const inspect=()=>ui.all("body *").forEach(el=>{
      const style=getComputedStyle(el);
      for(const prop of ["color","backgroundColor","backgroundImage","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","outlineColor","boxShadow"]) {
        for(const match of style[prop].matchAll(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:[, /]+([\d.]+))?\)/g)) {
          if(match[4]==="0") continue;
          const [r,g,b]=match.slice(1,4).map(Number),max=Math.max(r,g,b),min=Math.min(r,g,b);
          colors.add(match[0]);
          if(max-min<2) continue;
          let hue=max===r?(g-b)/(max-min):max===g?2+(b-r)/(max-min):4+(r-g)/(max-min);
          hue=(hue*60+360)%360;
          if(hue<15||hue>35) outside.push({element:el.id||el.className,prop,color:match[0],hue});
        }
      }
    });
    inspect();
    const sample=ui.q('[data-action="pr_manejador"][data-strategy="blue"]');
    const wasSelected=sample.getAttribute("aria-pressed")==="true";
    if(!wasSelected) sample.click();
    inspect();
    for(const [id,states] of [["#saveStatus",["is-saving","is-error"]],["#feedback",["is-success","is-error"]]]) {
      const el=ui.q(id),old=el.className;
      for(const state of states){el.className=old+" "+state;inspect();}
      el.className=old;
    }
    if(!wasSelected) ui.q('[data-action="pr_manejador"][data-strategy="blue"]').click();
    const report={colors:[...colors],outside};
    return report;
  };
  window.auditReady=true;
} catch(error) {window.auditFailure=error.stack;output.textContent=error.stack;}
