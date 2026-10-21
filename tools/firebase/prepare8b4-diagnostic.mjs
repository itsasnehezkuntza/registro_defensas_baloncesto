// Prepara un candidato local para revisión. No invoca CLI, no despliega ni renueva canales.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { guardPreviewTransport, plan } from './ipad-preview.mjs';
const root = new URL('../../', import.meta.url), dir = new URL('.test-artifacts/firebase/fase8b4/', root);
const baseline = JSON.parse(await readFile(new URL('deployed-manifest.json', dir), 'utf8'));
if (baseline.hostingVersion !== 'f0a4971d2c312bef') throw Error('Baseline desconocido.');
const content = new Map();
for (const f of baseline.files) {
  const bytes = await readFile(new URL('deployed/' + f.file, dir));
  if (createHash('sha256').update(bytes).digest('hex') !== f.sha256) throw Error('Evidencia alterada.');
  content.set(f.file, f.file.endsWith('.ttf') ? bytes : bytes.toString('utf8'));
}
for (const file of ['app.js', 'js/sync-storage.js', 'js/sync-engine.js', 'js/sync-ui.js', 'js/sync-diagnostics.js', 'js/sync-diagnostics-ui.js']) content.set(file, await readFile(new URL(file, root), 'utf8'));
// Dos barreras operativas de solo lectura, adicionales a las reglas y la identidad exclusiva.
const queueLine = "if (queue.length) status('Pendiente de sincronizar');";
if (!content.get('js/sync-engine.js').includes(queueLine)) throw Error('Motor cambiado: revisar guardia de cola.');
content.set('js/sync-engine.js', content.get('js/sync-engine.js').replace(queueLine,
  "if (queue.length) { syncTrace('diagnostic.pending-blocked', {pending:queue.length}); status('Pendiente de sincronizar', 'Diagnóstico: no se envían ni reintentan operaciones.'); return; }"));
let observer = content.get('js/sync-engine.js');
const mergeLine = 'alive(); await mergeRemote(c, remote); alive();';
if (!observer.includes(mergeLine)) throw Error('Incorporación remota cambiada: revisar modo observación.');
observer = observer.replace(mergeLine, "alive(); syncTrace('diagnostic.remote.observed', {games:remote.length}); alive();")
  .replace('if (!await lease(c, worker)) {', 'if (false) {')
  .replace('await lease(c, worker, true);', '/* Solo lectura: no modificar arrendamientos. */')
  .replace('void lease(c, worker, true).catch(() => {});', '/* Solo lectura. */')
  .replace("status('Sincronizado')", "status('Solo lectura', 'Respuesta remota recibida; copia local conservada.')");
content.set('js/sync-engine.js', observer);
const cacheStart = 'export function cacheTeams(uid, teams) {', cacheEnd = 'export function cachedTeams(uid) {';
const storage = content.get('js/sync-storage.js');
const cacheFrom = storage.indexOf(cacheStart), cacheTo = storage.indexOf(cacheEnd);
if (cacheFrom < 0 || cacheTo < cacheFrom) throw Error('Caché cambiada: revisar modo observación.');
content.set('js/sync-storage.js', storage.slice(0, cacheFrom) + 'export async function cacheTeams() { /* Diagnóstico: conservar metadatos. */ }\n' + storage.slice(cacheTo));
let transport = await readFile(new URL('js/firestore-sync.js', root), 'utf8');
const loadLine = 'return createFirestoreTransport(sdk, database, uid, () => auth.currentUser?.uid);';
if (!transport.includes(loadLine)) throw Error('Adaptador cambiado.');
transport = transport.replace(loadLine, `const transport=createFirestoreTransport(sdk,database,uid,()=>auth.currentUser?.uid);
  const blocked=async()=>{throw Object.assign(Error('Diagnóstico de solo lectura.'),{code:'DIAGNOSTIC_READ_ONLY'})};
  return {...transport,send:blocked,createTeam:blocked};`);
content.set('js/firestore-sync.js', guardPreviewTransport(transport));
const buildId = '8b4-' + createHash('sha256').update(await readFile(new URL(import.meta.url))).update([...content.entries()].map(([f, s]) => f + createHash('sha256').update(s).digest('hex')).join('\n')).digest('hex').slice(0, 16);
const originalBoot = content.get('preview-bootstrap.js');
const bootstrap = `import {enableSyncDiagnostics,syncTrace} from './js/sync-diagnostics.js';
enableSyncDiagnostics({buildId:${JSON.stringify(buildId)},baselineVersion:'f0a4971d2c312bef'});
const stop=text=>{document.body.textContent=text;throw Error(text)};
if(location.protocol!=='https:'||location.hostname!=='registro-defensivo--ipad-8b2-40nbq9cf.web.app')stop('Origen de diagnóstico no autorizado.');
if(localStorage.getItem('prueba8b3-sync')!==${JSON.stringify(plan.ownerHash)})stop('Se requiere la activación existente; no activar ni migrar desde el diagnóstico.');
const databases=await indexedDB.databases();
if(!databases.some(d=>d.name==='registro_defensivo_baloncesto'&&d.version===2))stop('No está la base de prueba esperada. No se ha abierto ni migrado.');
const pending=await new Promise((resolve,reject)=>{const r=indexedDB.open('registro_defensivo_baloncesto');r.onupgradeneeded=()=>{r.transaction.abort();reject(Error('No migrar'))};r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;const tx=db.transaction('syncQueue','readonly');let count;const q=tx.objectStore('syncQueue').count();q.onsuccess=()=>{count=q.result};tx.oncomplete=()=>{db.close();resolve(count)};tx.onabort=()=>{db.close();reject(Error('No se ha podido verificar la cola'))}}});
if(pending)stop('Hay operaciones pendientes: se conservan sin enviar ni reintentar. Detenerse y revisar.');
const blocked='#newGameBtn,#createGameBtn,#undoBtn,#deleteGameBtn,#confirmDeleteBtn,#editButtonsBtn,#syncCreateTeam,#syncImport,#syncConfirm,#syncRetry,#syncTeam,#gameSelect,#previewPause,#previewEnable,#googleLogin,#googleLogout,#accountRetry,.action-btn,.defense-btn,#resultButtons button';
for(const kind of ['click','submit','change'])document.addEventListener(kind,e=>{if(e.target.closest?.(blocked)||e.target.id==='newGameForm'){e.preventDefault();e.stopImmediatePropagation();}},true);
const disable=()=>document.querySelectorAll(blocked).forEach(el=>{if(!el.disabled)el.disabled=true});
new MutationObserver(disable).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});
` + originalBoot + `
disable();const host=document.querySelector('.account-bar');const note=document.createElement('p');note.textContent='Diagnóstico de solo lectura · '+${JSON.stringify(buildId)};host.append(note);
(await import('./js/sync-diagnostics-ui.js')).mountSyncDiagnosticDownload(host);
syncTrace('diagnostic.ready');`;
content.set('preview-bootstrap.js', bootstrap);
// No cambia el directorio de staging 8B.3 ni crea una configuración de Hosting desplegable.
const publicDir = new URL('diagnostic-candidate/public/', dir), files = [];
for (const [file, source] of content) {
  const dest = new URL(file, publicDir); await mkdir(new URL('./', dest), { recursive: true });
  await writeFile(dest, source); files.push({ file, sha256: createHash('sha256').update(source).digest('hex') });
}
await writeFile(new URL('diagnostic-candidate/manifest.json', dir), JSON.stringify({ buildId, baselineVersion: baseline.hostingVersion, readOnly: true, files, deployed: false }, null, 2));
console.log(JSON.stringify({ buildId, files: files.length, readOnly: true, deployed: false }));
