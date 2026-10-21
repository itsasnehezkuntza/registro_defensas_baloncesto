// Módulo exclusivo del paquete temporal. No se importa en la aplicación normal.
import {readState} from './persistencia.js';
import {storageContext,assertContext,listPending,canonical} from './sync-storage.js';
import {loadFirestoreTransport} from './firestore-sync.js';
import {syncTrace,syncDiagnosticSnapshot} from './sync-diagnostics.js';
export const fixture=Object.freeze({project:'registro-defensivo',team:'prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778',game:'0f901d0f-9885-499d-b40d-2e0234f51ad0',
  originals:['0ad91a0a-5b4b-4bf2-8c38-fe975e43e090','f5270206-1f1a-41c1-a98f-b4467891f125'],event:'prueba8b6-95424bdd-8861-43b2-a547-a7afab568e64'});
let armed=false,frozen=false,baseline,attempted=false,preparedAt=null;
export const diagnosticState=()=>({armed,frozen,preparedAt,initialEvents:preparedAt?2:null,attempted});
const stop=()=>{frozen=true;throw Object.assign(Error('Discrepancia: conservar datos, descargar diagnóstico y detenerse.'),{code:'DIAGNOSTIC_STOP'});};
const same=(a,b)=>canonical(a)===canonical(b);
const stripSeq=p=>{const {seq,...rest}=p;return rest;};
const ids=events=>events.map(e=>e.id).sort();
const checkContext=c=>{assertContext(c);if(c.projectId!==fixture.project||c.teamId!==fixture.team||!c.uid)stop();};
export const screenCount=()=>Number(document.querySelector('#gameTotal b:last-child')?.textContent??NaN);
function validRemote(remote,allowThird){
  if(remote.length!==1)stop();const g=remote[0];
  if(g.id!==fixture.game||g.deleted||g.deletedAt!=null||g.payload.id!==fixture.game||g.payload.jornada!=='IPAD-8B2'||g.payload.rival!=='Rival ficticio'||g.tombs.length)stop();
  const expected=[...fixture.originals,...(allowThird&&g.events.length===3?[fixture.event]:[])].sort();
  if(!same(ids(g.events),expected)||new Set(g.events.map(e=>e.payload.id)).size!==g.events.length||g.events.some(e=>e.payload.id!==e.id||e.payload.gameId!==fixture.game))stop();
  if(baseline&&(!same(g.payload,baseline.payload)||fixture.originals.some(id=>!same(g.events.find(e=>e.id===id)?.payload,baseline.events.find(e=>e.id===id)?.payload))))stop();
  return g;
}
export function beforeDiagnosticMerge(c,remote){
  checkContext(c);if(frozen)stop();if(!armed)return false;
  const g=validRemote(remote,true);syncTrace('diagnostic6.remote.validated',{remoteEvents:g.events.length});return true;
}
export async function verifyPreparation(){
  const c=storageContext();checkContext(c);if(frozen)stop();
  const backend=await loadFirestoreTransport(c.uid);await backend.verifyTeam(fixture.team);
  const remote=await backend.pull(fixture.team);checkContext(c);const g=validRemote(remote,false);
  const state=await readState(),pending=await listPending(c);checkContext(c);
  if(state.games.length!==1||state.currentGameId!==fixture.game||!same(ids(state.events),[...fixture.originals].sort())||pending.length||screenCount()!==2||document.querySelector('#gameSelect').value!==fixture.game)stop();
  for(const e of state.events)if(!same(stripSeq(e),stripSeq(g.events.find(r=>r.id===e.id).payload)))stop();
  baseline=g;preparedAt??=new Date().toISOString();syncTrace('diagnostic6.prepared',{remoteEvents:2,localEvents:2,count:screenCount(),pending:0});
  return {c,g};
}
async function sdkClient(c){
  const [a,b,sdk]=await Promise.all(['app','auth','firestore'].map(n=>import('https://www.gstatic.com/firebasejs/12.11.0/firebase-'+n+'.js')));
  const app=a.getApp('defensas-auth'),auth=b.getAuth(app);checkContext(c);
  if(app.options.projectId!==fixture.project||auth.currentUser?.uid!==c.uid)stop();
  return {sdk,db:sdk.getFirestore(app)};
}
// En una transacción online: solo set del ID reservado; nunca update/delete/batch/outbox.
export async function commitSingleEvent(sdk,db,c,g){
  if(new URLSearchParams(location.search).get('fase8b6')!=='ordenador')stop();
  const parent=sdk.doc(db,'teams',fixture.team,'games',fixture.game),ref=sdk.doc(parent,'events',fixture.event);
  const member=sdk.doc(db,'teams',fixture.team,'members',c.uid);
  const payload={...g.events.find(e=>e.id===fixture.originals[0]).payload,id:fixture.event,valor_tiro:2,resultado:'fallado',fecha_hora:new Date().toISOString()};delete payload.seq;
  return sdk.runTransaction(db,async tx=>{
    const refs=[parent,member,ref,...fixture.originals.map(id=>sdk.doc(parent,'events',id)),...[...fixture.originals,fixture.event].map(id=>sdk.doc(parent,'eventDeletions',id))];
    const [game,membership,existing,...rest]=await Promise.all(refs.map(r=>tx.get(r)));
    checkContext(c);
    if(!game.exists()||game.data().deletedAt!=null||!same(game.data().payload,g.payload)||membership.data()?.role!=='owner'||membership.data()?.status!=='active'||rest.slice(2).some(d=>d.exists()))stop();
    if(rest.slice(0,2).some((d,i)=>!d.exists()||!same(d.data().payload,g.events.find(e=>e.id===fixture.originals[i]).payload)))stop();
    if(existing.exists())stop();
    tx.set(ref,{schemaVersion:1,createdBy:c.uid,createdAt:sdk.serverTimestamp(),sourceId:'prueba8b6-unico-95424bdd',payload});
  },{maxAttempts:1});
}
export function mountDiagnostic6(){
  const sender=new URLSearchParams(location.search).get('fase8b6')==='ordenador',host=document.querySelector('.account-bar');
  const label=document.createElement('p');label.textContent=sender?'8B.6 · ORDENADOR · una única escritura ficticia':'8B.6 · SAFARI · solo recepción, envíos bloqueados';host.append(label);
  const prepare=document.createElement('button');prepare.className='menu-item';prepare.id='diagnostic6Prepare';prepare.textContent='Comprobar y preparar '+(sender?'ordenador':'recepción');
  const status=document.createElement('p');status.id='diagnostic6Status';status.setAttribute('role','status');
  const send=document.createElement('button');send.className='menu-item';send.id='diagnostic6Send';send.textContent='Registrar el ÚNICO tiro ficticio (2 fallado)';send.hidden=!sender;send.disabled=true;
  const key='prueba8b6-attempt-'+fixture.event;
  if(sender&&localStorage.getItem(key))attempted=true;
  prepare.onclick=async()=>{prepare.disabled=true;try{
    if(attempted)stop();await verifyPreparation();armed=true;
    status.textContent='Preparado · cuenta exclusiva/equipo/partido verificados · Firebase 2 · local 2 · pantalla 2 · cola 0. '+(sender?'Espera confirmación del iPad antes del único registro.':'Mantén Safari visible; no recargues.');
    send.disabled=!sender;
  }catch(e){frozen=true;status.textContent='Detenerse · '+(e.code||'DIAGNOSTIC_STOP')+'. Descarga diagnóstico; no reintentes.';syncTrace('diagnostic6.prepare.error',{code:e.code});}};
  send.onclick=async()=>{if(!sender||!armed||attempted||frozen)return;attempted=true;send.disabled=true;
    try{
      // El intento se consume antes de consultar/escribir. Ni recarga ni doble toque lo repiten.
      if(localStorage.getItem(key))stop();localStorage.setItem(key,'attempted');
      const {c,g}=await verifyPreparation();const {sdk,db}=await sdkClient(c);
      syncTrace('diagnostic6.single-write.start');await commitSingleEvent(sdk,db,c,g);
      syncTrace('diagnostic6.single-write.confirmed');
      const remote=await(await loadFirestoreTransport(c.uid)).pull(fixture.team);checkContext(c);
      if(validRemote(remote,true).events.length!==3)stop();
      status.textContent='Servidor confirmó 3 eventos. No pulses ni recargues: espera la recepción en Safari y descarga allí el diagnóstico.';
    }catch(e){frozen=true;status.textContent='Detenerse · resultado '+(e.code||'DIAGNOSTIC_STOP')+'. No repetir; conservar datos y descargar diagnóstico.';syncTrace('diagnostic6.single-write.error',{code:e.code});}
  };
  host.append(prepare,send,status);
}
