// Empaqueta exclusivamente la vista previa. Nunca ejecuta Firebase CLI ni despliega.
import { readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../../', import.meta.url));
export const plan = JSON.parse(await readFile(new URL('./ipad-preview-plan.json', import.meta.url), 'utf8'));
export const previewAssets = [
  'index.html', 'app.js', 'styles.css', 'registro.css', 'dashboard.css', 'editor.css', 'cuenta.css', 'categorias.csv',
  ...['configuracion', 'configuracion-guardada', 'cuenta', 'cuenta-ui', 'dashboard', 'distribucion', 'editor', 'estadisticas', 'exportacion',
    'firebase-auth', 'firebase-config', 'firestore-sync', 'identidad', 'interfaz', 'persistencia', 'preview-account', 'registro', 'registro-vista', 'sync-config', 'sync-diagnostics', 'sync-engine', 'sync-storage', 'sync-ui', 'vistas'].map(name => 'js/' + name + '.js'),
  'fonts/Manrope.ttf', 'fonts/BarlowCondensed-Bold.ttf', 'fonts/Manrope-OFL.txt', 'fonts/BarlowCondensed-OFL.txt'
];
export function previewBootstrap(syncAvailable = false) {
  return `const plan=${JSON.stringify(plan)},syncAvailable=${Boolean(syncAvailable)};
const permitted=location.protocol==='https:'&&/^registro-defensivo--ipad-8b2-[a-z0-9-]+[.]web[.]app$/.test(location.hostname);
const fail=text=>{document.body.textContent=text;throw Error(text)};
if(!permitted)fail('Esta copia solo funciona en el canal HTTPS de pruebas autorizado.');
const key='prueba8b2-ipad';let marker;try{marker=JSON.parse(localStorage.getItem(key)||'null')}catch{fail('No se puede verificar el almacenamiento. No borres datos.');}
if(marker&&marker.teamId!==plan.teamId)fail('Hay otra prueba en este origen. Conservar datos y revisar.');
if(!marker){if(!indexedDB.databases)fail('Safari no permite verificar las bases existentes. Conservar datos y revisar compatibilidad.');
if((await indexedDB.databases()).length)fail('Este origen contiene datos previos. No se han abierto; conservarlos y revisar.');
localStorage.setItem(key,JSON.stringify({teamId:plan.teamId}));}
document.title='PRUEBA iPad · Registro defensivo';
const accountHost=document.querySelector('.account-bar');
if(syncAvailable&&accountHost){
const box=document.createElement('div');box.className='sync-controls';box.id='previewActivation';
const note=document.createElement('p');note.textContent='Solo datos ficticios · cuenta exclusiva · '+plan.teamName;
const button=document.createElement('button');button.type='button';button.className='menu-item';button.id='previewEnable';
const active=localStorage.getItem('prueba8b3-sync')===plan.ownerHash;
button.textContent=active?'Prueba activada en este navegador':'Activar prueba de sincronización';button.disabled=active;
const status=document.createElement('p');status.id='previewActivationStatus';status.setAttribute('role','status');
button.onclick=async()=>{button.disabled=true;status.textContent='Comprobando la cuenta y los permisos…';try{
const appSdk=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
const authSdk=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js');
const app=appSdk.getApp('defensas-auth'),auth=authSdk.getAuth(app);await auth.authStateReady();
if(!auth.currentUser)throw Error('Inicia sesión con la cuenta exclusiva y vuelve a abrir esta página.');
const uid=auth.currentUser.uid;
const sdk=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
const {verifyPreviewAccount}=await import('./js/preview-account.js');
const proof=await verifyPreviewAccount(sdk,sdk.getFirestore(app),auth.currentUser,plan,()=>auth.currentUser?.uid);
const p=await import('./js/persistencia.js');
if((await p.readState()).games.length)throw Error('Hay partidos locales. Conservarlos; no se importan en esta prueba.');
if(auth.currentUser?.uid!==uid)throw Error('La cuenta ha cambiado. No activar.');
localStorage.setItem('prueba8b3-verification',JSON.stringify({checkedAt:new Date().toISOString(),projectId:plan.projectId,...proof}));
localStorage.setItem('prueba8b3-sync',plan.ownerHash);location.reload();
}catch(error){status.textContent='No se ha activado: '+error.message+' Detenerse y avisar.';}};
box.append(note,button,status);accountHost.append(box);}
document.addEventListener('click',e=>{if(e.target.closest?.('#syncImport,#syncConfirm')){e.preventDefault();e.stopImmediatePropagation();}},true);
function controls(){for(const id of ['syncImport','syncConfirm']){const el=document.getElementById(id);if(el){if(!el.hidden)el.hidden=true;if(!el.disabled)el.disabled=true;}}
const host=document.querySelector('.sync-controls');if(host&&!document.getElementById('previewPause')){
const note=document.createElement('p');note.textContent='Solo datos ficticios · '+plan.teamName;host.append(note);
const button=document.createElement('button');button.id='previewPause';button.className='menu-item';button.type='button';
const label=()=>{button.textContent=localStorage.getItem('prueba8b2-offline')==='1'?'Reanudar sincronización de prueba':'Simular corte de sincronización';};
label();button.onclick=()=>{localStorage.setItem('prueba8b2-offline',localStorage.getItem('prueba8b2-offline')==='1'?'0':'1');label();dispatchEvent(new Event('online'));};host.append(button);}}
new MutationObserver(controls).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','hidden']});
await import('./app.js');await import('./js/cuenta-ui.js');controls();`;
}
export function guardPreviewTransport(source) {
  if (!source.includes('export async function loadFirestoreTransport(uid)')) throw Error('Adaptador cambiado: revisar empaquetado.');
  return source.replace('export async function loadFirestoreTransport(uid)', 'async function unrestrictedTransport(uid)') + `
const previewPlan=${JSON.stringify(plan)};
export async function loadFirestoreTransport(uid){
const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(uid)))].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,16);
if(hash!==previewPlan.ownerHash)throw Object.assign(Error('Usa la cuenta propietaria de pruebas.'),{code:'permission-denied'});
const backend=await unrestrictedTransport(uid);
const team=id=>{if(id!==previewPlan.teamId)throw Error('Destino ajeno al equipo ficticio de iPad.');};
const connected=()=>{if(localStorage.getItem('prueba8b2-offline')==='1')throw Object.assign(Error('Corte de sincronización simulado.'),{code:'unavailable'});};
return {async teams(){const own=await backend.teams();if(own.some(t=>t.id!==previewPlan.teamId))throw Error('La cuenta tiene otros equipos. Conservar datos y detenerse.');return own.length?[await backend.verifyTeam(previewPlan.teamId)]:[];},
verifyTeam(id){team(id);return backend.verifyTeam(id)},
createTeam(name){if(name!==previewPlan.teamName)throw Error('Usa el nombre del equipo ficticio indicado.');connected();return backend.createTeam(name,previewPlan.teamId)},
send(op){team(op.teamId);connected();return backend.send(op)},pull(id){team(id);connected();return backend.pull(id)}};}
`;
}
export async function buildPreview({ syncEnabled = false, outputRoot = resolve(root, '.test-artifacts/firebase/ipad-preview') } = {}) {
  if (typeof syncEnabled !== 'boolean') throw Error('Bandera de sincronización inválida.');
  if (syncEnabled) {
    const identity = JSON.parse(await readFile(resolve(root, '.test-artifacts/firebase/fase8b3/test-identity.json'), 'utf8'));
    if (identity.ownerHash !== plan.ownerHash || identity.projectId !== plan.projectId || identity.ownedTeams !== 0 || identity.previousOwner !== false || identity.dedicatedConfirmedByUser !== true) throw Error('Falta verificación de la cuenta exclusiva.');
  }
  const base = resolve(root, '.test-artifacts/firebase'); outputRoot = resolve(outputRoot);
  if (!outputRoot.startsWith(base + sep)) throw Error('Salida fuera de artefactos de prueba.');
  const publicDir = resolve(outputRoot, 'public'), generated = 'preview-bootstrap.js';
  let current = root;
  for (const part of relative(root, publicDir).split(sep)) {
    current = resolve(current, part);
    try { if ((await lstat(current)).isSymbolicLink()) throw Error('Enlace en ruta de salida no permitido.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const permitted = new Set([...previewAssets, generated]);
  async function inspect(dir) {
    let entries; try { entries = await readdir(dir, { withFileTypes: true }); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
    for (const entry of entries) {
      const path = resolve(dir, entry.name), name = relative(publicDir, path).split(sep).join('/');
      if (entry.isSymbolicLink()) throw Error('Enlace no permitido en salida.');
      if (entry.isDirectory()) { if (![...permitted].some(file => file.startsWith(name + '/'))) throw Error('Directorio inesperado: ' + name); await inspect(path); }
      else if (!permitted.has(name)) throw Error('Archivo inesperado; conservar y revisar: ' + name);
    }
  }
  await inspect(publicDir); const manifest = { createdAt: new Date().toISOString(), plan, syncEnabled: false, syncAvailable: syncEnabled, files: [] };
  for (const file of [...previewAssets, generated]) {
    let content;
    if (file === generated) content = Buffer.from(previewBootstrap(syncEnabled));
    else {
      const source = resolve(root, file); if (!(await lstat(source)).isFile()) throw Error('Origen no regular.');
      content = await readFile(source);
      if (file === 'index.html') {
        let html = content.toString('utf8');
        for (const name of ['app.js', 'js/cuenta-ui.js']) { const tag = '<script type="module" src="./' + name + '"></script>'; if (!html.includes(tag)) throw Error('HTML cambiado.'); html = html.replace(tag, ''); }
        content = Buffer.from(html.replace('</head>', '<style>#syncImport,#syncConfirm{display:none!important}</style><script type="module" src="./preview-bootstrap.js"></script></head>'));
      }
      if (file === 'js/sync-config.js') content = Buffer.from(`let opted=false;try{opted=localStorage.getItem('prueba8b3-sync')===${JSON.stringify(plan.ownerHash)}}catch{};const enabled=${Boolean(syncEnabled)}&&opted&&location.protocol==='https:'&&/^registro-defensivo--ipad-8b2-[a-z0-9-]+[.]web[.]app$/.test(location.hostname);export const syncSettings=Object.freeze({enabled,emulator:false,allowRealWrites:enabled});`);
      if (file === 'js/firestore-sync.js') content = Buffer.from(guardPreviewTransport(content.toString('utf8')));
    }
    const target = resolve(publicDir, file); await mkdir(dirname(target), { recursive: true }); await writeFile(target, content);
    manifest.files.push({ file, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') });
  }
  await writeFile(resolve(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return { publicDir, manifest };
}
if (process.argv[1]?.endsWith('ipad-preview.mjs')) { const result = await buildPreview({ syncEnabled: process.argv.includes('--enable-sync') }); console.log('Paquete local preparado; sin despliegue. Sync inicial: false; activación manual disponible: ' + result.manifest.syncAvailable); }
