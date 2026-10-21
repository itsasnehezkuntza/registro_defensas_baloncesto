// Arranque de la app de prueba en un navegador admitido, abierto por el usuario.
// No cambia user-agent, webdriver ni opciones de seguridad del navegador.
export function manualBrowserBootstrap(runId, teamId) {
  return `
const runId = ${JSON.stringify(runId)}, teamId = ${JSON.stringify(teamId)};
const label = new URL(location.href).searchParams.get('perfil');
const fail = message => { document.body.textContent = 'PRUEBA 8B · ' + message; throw Error(message); };
if (!['A', 'B'].includes(label)) fail('Abre el enlace del perfil A o B indicado en la terminal.');
const key = 'prueba8b-manual-profile';
let previous;
try { previous = JSON.parse(localStorage.getItem(key) || 'null'); } catch { fail('No se puede verificar el perfil.'); }
if (previous && (previous.runId !== runId || previous.label !== label)) fail('Este perfil ya se usó para otra prueba. Usa un perfil nuevo de Chrome; no borres sus datos.');
if (!previous) {
  if (!indexedDB.databases) fail('No se puede verificar que IndexedDB esté vacío.');
  const databases = await indexedDB.databases();
  if (databases.length) fail('Este origen contiene datos previos. Usa otro perfil nuevo; no se han abierto ni modificado sus bases.');
  localStorage.setItem(key, JSON.stringify({ runId, label }));
}
document.title = 'PRUEBA 8B · Perfil ' + label;
const note = document.createElement('p');
note.textContent = 'PRUEBA 8B · Perfil ' + label + ' · Solo datos ficticios';
note.style.cssText = 'position:fixed;bottom:0;right:0;z-index:10000;background:#161616;color:white;padding:3px 10px;margin:0;font:12px sans-serif;pointer-events:none';
document.body.append(note);
// Barrera local previa a la creación asíncrona del asistente. No depende del informe.
document.addEventListener('click', event => {
  if (event.target.closest?.('#syncImport, #syncConfirm')) {
    event.preventDefault(); event.stopImmediatePropagation();
  }
}, true);
const uidFingerprint = async uid => uid ? [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uid)))].map(n => n.toString(16).padStart(2, '0')).join('').slice(0, 16) : null;
// Solo registra el resultado de la lectura real del equipo ficticio. Nunca envía tokens/UID.
globalThis.addEventListener('prueba8b-team-access', event => {
  void (async () => {
    const data = { label, uidHash: await uidFingerprint(event.detail.uid), teamId: event.detail.teamId, decision: event.detail.decision };
    const response = await fetch('/__manual-access-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) throw Error('Diagnóstico local rechazado.');
  })().catch(() => { note.dataset.accessReport = 'pending'; });
});
// Preflight completado antes de importar app, Auth o persistencia.
await import('./app.js'); await import('./js/cuenta-ui.js');
const { storageContext, listPending } = await import('./js/sync-storage.js');
const { readState } = await import('./js/persistencia.js');
let sending = false, last = '';
async function report() {
  for (const id of ['syncImport', 'syncConfirm']) {
    const button = document.getElementById(id); if (button) { button.hidden = true; button.disabled = true; }
  }
  if (sending) return; sending = true;
  try {
    const c = storageContext(), state = await readState();
    const uidHash = await uidFingerprint(c.uid);
    const pending = c.scope ? await listPending(c) : [];
    const data = { label, uidHash, teamId: c.teamId || null, cloud: document.getElementById('cloudStatus').textContent,
      local: document.getElementById('saveStatusText').textContent, gameIds: state.games.map(game => game.id),
      eventIds: state.events.map(event => event.id), pendingCount: pending.length, blockedCount: pending.filter(op => op.blocked).length };
    const body = JSON.stringify(data);
    if (last !== body) {
      const response = await fetch('/__manual-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (!response.ok) throw Error('Informe local rechazado.'); last = body;
    }
  } catch (error) { note.textContent = 'PRUEBA 8B · Perfil ' + label + ' · Informe local pendiente'; }
  finally { sending = false; }
}
setInterval(report, 2000); void report();
`;
}

export function manualBrowserHtml(html) {
  for (const name of ['app.js', 'js/cuenta-ui.js']) {
    const script = `<script type="module" src="./${name}"></script>`;
    if (!html.includes(script)) throw Error('STOP: el arranque HTML cambió; revisar antes de probar.');
    html = html.replace(script, '');
  }
  return html.replace('</head>', '<style id="prueba8b-no-import">#syncImport,#syncConfirm{display:none!important}</style><script type="module" src="./__manual-bootstrap.js"></script></head>');
}

export function validateManualReport(data, teamId) {
  const fields = ['label', 'uidHash', 'teamId', 'cloud', 'local', 'gameIds', 'eventIds', 'pendingCount', 'blockedCount'];
  if (!data || Object.keys(data).length !== fields.length || Object.keys(data).some(key => !fields.includes(key))) throw Error('Informe inválido.');
  if (!['A', 'B'].includes(data.label) || (data.uidHash !== null && !/^[a-f0-9]{16}$/.test(data.uidHash))) throw Error('Perfil inválido.');
  if (data.teamId !== null && data.teamId !== teamId) throw Error('Equipo ajeno a la prueba.');
  for (const key of ['cloud', 'local']) if (typeof data[key] !== 'string' || data[key].length > 256) throw Error('Estado inválido.');
  for (const key of ['gameIds', 'eventIds']) if (!Array.isArray(data[key]) || data[key].length > 100 || data[key].some(id => typeof id !== 'string' || id.length > 256)) throw Error('IDs inválidos.');
  for (const key of ['pendingCount', 'blockedCount']) if (!Number.isInteger(data[key]) || data[key] < 0 || data[key] > 1000) throw Error('Contador inválido.');
  return data;
}

export function validateManualAccessReport(data, teamId) {
  const fields = ['label', 'uidHash', 'teamId', 'decision'];
  if (!data || Object.keys(data).length !== fields.length || Object.keys(data).some(key => !fields.includes(key))) throw Error('Diagnóstico inválido.');
  if (!['A', 'B'].includes(data.label) || typeof data.uidHash !== 'string' || !/^[a-f0-9]{16}$/.test(data.uidHash)) throw Error('Cuenta de diagnóstico inválida.');
  if (data.teamId !== teamId || !['allowed', 'permission-denied', 'not-found', 'error'].includes(data.decision)) throw Error('Destino o resultado de diagnóstico inválido.');
  return data;
}
