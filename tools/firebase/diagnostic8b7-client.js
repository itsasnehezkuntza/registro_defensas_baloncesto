// Solo candidato temporal 8B.7; no se importa desde la aplicación publicada normal.
import {readState} from './persistencia.js';
import {storageContext,assertContext,listPending,canonical} from './sync-storage.js';
import {loadFirestoreTransport} from './firestore-sync.js';
import {syncTrace,syncDiagnosticSnapshot,enableSyncDiagnostics,diagnosticOverflow} from './sync-diagnostics.js';
export const fixture=Object.freeze({project:'registro-defensivo',team:'prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778',game:'0f901d0f-9885-499d-b40d-2e0234f51ad0',
 originals:['0ad91a0a-5b4b-4bf2-8c38-fe975e43e090','f5270206-1f1a-41c1-a98f-b4467891f125','prueba8b6-95424bdd-8861-43b2-a547-a7afab568e64'],
 additional:['prueba8b7-a-3f994132-d7cc-4871-88fa-411fcbdf49cb','prueba8b7-b-6b18381b-47e3-4538-98e1-63c0d03ad103','prueba8b7-c-7d3416ea-71ad-4873-8a09-506dd311331a']});
let index=0,armed=false,frozen=false,baseline,preparedAt=null,attempted=false,closed=false,serverCreatedAt=null;
const archives=[];
const names=['A','B','C'],sender=()=>new URLSearchParams(location.search).get('fase8b7')==='ordenador';
export const diagnosticState=()=>({scenario:names[index],role:sender()?'ordenador':'receptor',armed,frozen,preparedAt,initialEvents:preparedAt?3+index:null,attempted,closed,serverCreatedAt});
export const diagnosticHistory=()=>archives.map(v=>JSON.parse(JSON.stringify(v)));
const stop=(reason='discrepancy')=>{frozen=true;syncTrace('diagnostic7.stop',{reason});throw Object.assign(Error('Conservar datos y trazas; detenerse sin reintentar.'),{code:'DIAGNOSTIC_STOP'});};
const check=c=>{assertContext(c);if(c.projectId!==fixture.project||c.teamId!==fixture.team||!c.uid)stop('scope');};
const same=(a,b)=>canonical(a)===canonical(b),ids=events=>events.map(e=>e.id).sort();
const strip=p=>{const{seq,...rest}=p;return rest;};
const expected=n=>[...fixture.originals,...fixture.additional.slice(0,n)].sort();
export const screenCount=()=>Number(document.querySelector('#gameTotal b:last-child')?.textContent??NaN);
function validate(remote,after=false){
 if(remote.length!==1)stop('games');const g=remote[0];
 if(g.id!==fixture.game||g.deleted||g.deletedAt!=null||g.tombs.length||g.payload.id!==fixture.game||g.payload.jornada!=='IPAD-8B2'||g.payload.rival!=='Rival ficticio')stop('game-or-tombs');
 const added=after&&g.events.length===4+index?index+1:index;
 if(!same(ids(g.events),expected(added))||g.events.some(e=>e.payload.id!==e.id||e.payload.gameId!==fixture.game))stop('event-set');
 if(baseline&&(!same(g.payload,baseline.payload)||baseline.events.some(e=>!same(e.payload,g.events.find(v=>v.id===e.id)?.payload))))stop('historical-payload');
 return g;
}
export function beforeDiagnosticMerge(c,remote){
 check(c);if(frozen)stop('frozen');if(!armed)return false;if(diagnosticOverflow())stop('trace-full');
 const g=validate(remote,true);if(g.events.length===4+index)serverCreatedAt=g.events.find(e=>e.id===fixture.additional[index]).createdAt?.toDate?.().toISOString()??null;
 syncTrace('diagnostic7.remote.validated',{kind:names[index],remoteEvents:g.events.length});return true;
}
async function verify(after=false){
 const c=storageContext();check(c);if(frozen)stop('frozen');const backend=await loadFirestoreTransport(c.uid);await backend.verifyTeam(fixture.team);
 const g=validate(await backend.pull(fixture.team),after),state=await readState(),queue=await listPending(c);check(c);
 const count=after?4+index:3+index;
 if(g.events.length!==count||state.games.length!==1||state.currentGameId!==fixture.game||state.events.length!==count||new Set(state.events.map(e=>e.id)).size!==count||!same(ids(state.events),ids(g.events))||queue.length||screenCount()!==count||document.querySelector('#gameSelect').value!==fixture.game)stop('counts-or-selection');
 for(const e of state.events)if(!same(strip(e),strip(g.events.find(v=>v.id===e.id).payload)))stop('local-payload');
 return{c,g,count};
}
export async function prepareScenario(){
 if(armed||closed)stop('already-prepared');
 const{g,count}=await verify();baseline=g;
 const old=syncDiagnosticSnapshot();
 if(index)archives.push({scenario:names[index-1],snapshot:old});
 enableSyncDiagnostics({buildId:old.buildId,baselineVersion:old.baselineVersion});
 preparedAt=new Date().toISOString();armed=true;
 syncTrace('diagnostic7.prepared',{kind:names[index],remoteEvents:count,localEvents:count,count:screenCount(),pending:0});
 return count;
}
async function sdkClient(c){
 const[a,b,sdk]=await Promise.all(['app','auth','firestore'].map(n=>import('https://www.gstatic.com/firebasejs/12.11.0/firebase-'+n+'.js')));
 const app=a.getApp('defensas-auth'),auth=b.getAuth(app);check(c);if(app.options.projectId!==fixture.project||auth.currentUser?.uid!==c.uid)stop('auth');return{sdk,db:sdk.getFirestore(app)};
}
export async function commitScenarioEvent(sdk,db,c,g){
 if(!sender()||!armed||closed||frozen||diagnosticOverflow())stop('write-disabled');
 const eid=fixture.additional[index],parent=sdk.doc(db,'teams',fixture.team,'games',fixture.game),ref=sdk.doc(parent,'events',eid);
 const payload={...g.events.find(e=>e.id===fixture.originals[0]).payload,id:eid,valor_tiro:2,resultado:'fallado',fecha_hora:new Date().toISOString()};delete payload.seq;
 return sdk.runTransaction(db,async tx=>{
  const refs=[parent,sdk.doc(db,'teams',fixture.team,'members',c.uid),ref,...g.events.map(e=>sdk.doc(parent,'events',e.id)),...[...g.events.map(e=>e.id),eid].map(id=>sdk.doc(parent,'eventDeletions',id))];
  const[p,m,existing,...rest]=await Promise.all(refs.map(r=>tx.get(r)));check(c);
  if(!p.exists()||p.data().deletedAt!=null||!same(p.data().payload,g.payload)||m.data()?.role!=='owner'||m.data()?.status!=='active'||existing.exists()||rest.slice(g.events.length).some(d=>d.exists()))stop('transaction-state');
  if(rest.slice(0,g.events.length).some((d,i)=>!d.exists()||!same(d.data().payload,g.events[i].payload)))stop('transaction-history');
  tx.set(ref,{schemaVersion:1,createdBy:c.uid,createdAt:sdk.serverTimestamp(),sourceId:'prueba8b7-'+names[index],payload});
 },{maxAttempts:1});
}
export function mountDiagnostic7(){
 const host=document.querySelector('.account-bar'),label=document.createElement('p'),status=document.createElement('p');status.id='diagnostic7Status';status.setAttribute('role','status');
 const button=(id,text)=>{const b=document.createElement('button');b.type='button';b.className='menu-item';b.id=id;b.textContent=text;return b;};
 const prepare=button('diagnostic7Prepare','Preparar escenario A'),send=button('diagnostic7Send','Registrar UN evento del escenario A'),finish=button('diagnostic7Finish','Verificar cierre del escenario'),advance=button('diagnostic7Next','Continuar solo tras revisión favorable');
 send.hidden=!sender();send.disabled=true;finish.disabled=true;advance.disabled=true;
 const key=()=> 'prueba8b7-attempt-'+fixture.additional[index];
 attempted=Boolean(localStorage.getItem(key()));
 const fail=e=>{frozen=true;send.disabled=prepare.disabled=finish.disabled=advance.disabled=true;status.textContent='Detenerse · '+(e.code||'DIAGNOSTIC_STOP')+'. Descargar trazas; no repetir.';syncTrace('diagnostic7.error',{code:e.code,kind:names[index]});};
 prepare.onclick=async()=>{prepare.disabled=true;try{if(attempted)stop('attempt-used');const count=await prepareScenario();label.textContent=names[index]+' · '+(sender()?'ORDENADOR':'SAFARI · envíos bloqueados');status.textContent='Preparado '+names[index]+' · Firebase '+count+' · local '+count+' · pantalla '+count+' · cola 0.';send.disabled=!sender();finish.disabled=false;}catch(e){fail(e);}};
 send.onclick=async()=>{if(!sender()||attempted||!armed||frozen||closed)return;attempted=true;send.disabled=true;
  try{if(localStorage.getItem(key()))stop('attempt-used');localStorage.setItem(key(),'attempted');const{c,g}=await verify();const{sdk,db}=await sdkClient(c);syncTrace('diagnostic7.single-write.start',{kind:names[index]});await commitScenarioEvent(sdk,db,c,g);syncTrace('diagnostic7.single-write.confirmed',{kind:names[index]});
   const remote=validate(await(await loadFirestoreTransport(c.uid)).pull(fixture.team),true);if(remote.events.length!==4+index)stop('confirmation-count');status.textContent='Servidor confirmó '+(4+index)+' eventos · escenario '+names[index]+'. Observar Safari sin recargar, máximo 60 s.';
  }catch(e){fail(e);}};
 finish.onclick=async()=>{finish.disabled=true;try{if(diagnosticOverflow())stop('trace-full');const{count}=await verify(true);closed=true;armed=false;syncTrace('diagnostic7.closed',{kind:names[index],remoteEvents:count,localEvents:count,count:screenCount(),pending:0});status.textContent='Escenario '+names[index]+' verificado: '+count+' eventos, cola 0. Descargar trazas y esperar revisión antes del siguiente.';advance.disabled=index===2;}catch(e){fail(e);}};
 advance.onclick=()=>{if(!closed||frozen||index>=2)return;if(!confirm('¿La revisión de las trazas de ambos dispositivos permitió continuar? Si hubo fallo, cancelar.'))return;
  index++;armed=closed=attempted=false;preparedAt=serverCreatedAt=null;baseline=null;attempted=Boolean(localStorage.getItem(key()));advance.disabled=true;prepare.disabled=false;prepare.textContent='Preparar escenario '+names[index];send.textContent='Registrar UN evento del escenario '+names[index];send.disabled=true;status.textContent='Preparar ambos dispositivos antes de registrar. No continuar si el escenario anterior falló.';
 };
 label.textContent='Estabilidad 8B.7 · A → B → C · máximo tres eventos ficticios';host.append(label,prepare,send,finish,advance,status);
}
