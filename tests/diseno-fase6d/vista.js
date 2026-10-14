// Geometría y comprobaciones visuales de la maqueta; no registra, exporta ni persiste.
const dock = document.querySelector('.result-dock');
const reserve = () => { document.documentElement.style.setProperty('--dock-height', Math.ceil(dock.offsetHeight)+'px');document.documentElement.style.setProperty('--header-height', Math.ceil(document.querySelector('.header').offsetHeight)+'px'); };
new ResizeObserver(reserve).observe(document.querySelector('.header'));
new ResizeObserver(reserve).observe(dock);
reserve();
window.auditPreview = async () => {
  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const rect = element => { const r=element.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}; };
  const buttons = [...document.querySelectorAll('.action-btn,.defense-btn,.result-btn,.toolbar button,.toolbar select')];
  const last = document.querySelector('.direct-row:last-child .defense-btn:last-child');
  const rDock=rect(dock), rLast=rect(last);
  const initialFits=rLast.bottom<=rDock.y;
  const small=buttons.filter(b=>b.getBoundingClientRect().width<44||b.getBoundingClientRect().height<44).map(b=>b.id||b.textContent);
  const clipped=[...document.querySelectorAll('.action-name,.action-score,.defense-name,.defense-score,h1,h2,.panel-summary,#gameTotal,.result-btn')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
  window.scrollTo(0,document.documentElement.scrollHeight);
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const scrollAccessible=rect(last).bottom<=rect(dock).y;
  window.scrollTo(0,0);
  const selected=document.querySelector('[aria-pressed="true"]');
  document.querySelector('#undoBtn').focus({preventScroll:true});
  const focus=getComputedStyle(document.querySelector('#undoBtn'));
  const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
  const luminance=color=>rgb(color).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  const contrast=element=>{
    const foreground=getComputedStyle(element).color;
    let parent=element,background='rgb(255,255,255)';
    while(parent) { const bg=getComputedStyle(parent).backgroundColor; if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'){background=bg;break;} parent=parent.parentElement; }
    const a=luminance(foreground),b=luminance(background);
    return {foreground,background,ratio:Math.round(100*(Math.max(a,b)+.05)/(Math.min(a,b)+.05))/100};
  };
  const contrasts=Object.fromEntries(['.action-name','.action-score','.action-score .stat-missed','.action-score .stat-made',
    '[aria-pressed="true"] .defense-score .stat-missed','[aria-pressed="true"] .defense-score .stat-made',
    '.panel-summary','.stat-percent','.field select','.result-missed','.result-made','#saveStatusText','#feedback'].filter(s=>document.querySelector(s)).map(s=>[s,contrast(document.querySelector(s))]));
  const percentContrasts=[...document.querySelectorAll('.stat-percent')].map(contrast);
  if(percentContrasts.length) contrasts.percentMinimum=percentContrasts.reduce((a,b)=>a.ratio<b.ratio?a:b);
  const sampleButton=document.querySelector('.result-btn');
  sampleButton.disabled=true; contrasts.disabledResult=contrast(sampleButton);sampleButton.disabled=false;
  const status=document.querySelector('#saveStatus');
  status.classList.add('is-saving');contrasts.saving=contrast(document.querySelector('#saveStatusText'));status.classList.remove('is-saving');
  status.classList.add('is-error');contrasts.error=contrast(document.querySelector('#saveStatusText'));status.classList.remove('is-error');
  return {width:innerWidth,height:innerHeight,initialFits,scrollAccessible,small,clipped,
    horizontal:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    header:rect(document.querySelector('.header')),dock:rDock,last:rLast,gapToDock:Math.round(rDock.y-rLast.bottom),
    sections:document.querySelectorAll('main section').length,defenses:document.querySelectorAll('.defense-btn').length,
    resultOrder:[...document.querySelectorAll('.result-btn')].map(b=>b.dataset.points+':'+b.dataset.result),
    selected: selected.textContent,selectionMarker:getComputedStyle(selected,'::after').content,
    focusOutline:focus.outlineStyle,focusColor:focus.outlineColor,contrasts,
    stats:[...document.querySelectorAll('.action-score,.defense-score,.panel-summary,.direct-type > span,#gameTotal')].map(e=>e.textContent),
    fonts:{title:getComputedStyle(document.querySelector('h1')).fontFamily,stats:getComputedStyle(document.querySelector('.action-score')).fontFamily},
    externalResources:performance.getEntriesByType('resource').filter(e=>new URL(e.name).origin!==location.origin).map(e=>e.name)};
};
