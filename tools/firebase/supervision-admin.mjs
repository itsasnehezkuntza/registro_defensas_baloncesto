// Herramienta fuera del paquete público. Plan sin red por defecto.
// Aplicación deliberadamente limitada al emulador; producción requiere revisión administrativa.
import { pathToFileURL } from 'node:url';
export function accessPlan(action, uid, teamId) {
  if (!['asignar', 'revocar'].includes(action)) throw Error('Acción: asignar o revocar.');
  const valid = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
  if (!valid(uid) || !valid(teamId)) throw Error('UID/ID inválido; usa los identificadores exactos, nunca un correo.');
  return { action, path: `supervision/${uid}/teams/${teamId}`,
    fields: { schemaVersion: 1, role: 'reader', status: action === 'asignar' ? 'active' : 'revoked' } };
}
export async function applyEmulatorPlan(plan, expectedOwnerUid) {
  if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085' || !expectedOwnerUid) throw Error('Solo emulador local y propietario esperado explícito.');
  const base = 'http://127.0.0.1:8085/v1/projects/demo-defensas/databases/(default)/documents';
  const headers = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
  const request = async (url, options) => {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000), ...options });
    if (!res.ok) throw Error(`Administración emulada: HTTP ${res.status}`);
    return res.json();
  };
  const id = plan.path.split('/').at(-1);
  const name = 'projects/demo-defensas/databases/(default)/documents/';
  const team = await request(`${base}/teams/${id}`);
  if (team.fields.ownerUid.stringValue !== expectedOwnerUid) throw Error('El propietario no coincide.');
  const res = await fetch(`${base}/${plan.path}`, { headers, signal: AbortSignal.timeout(10000) });
  if (!res.ok && res.status !== 404) throw Error('No se puede verificar el permiso previo.');
  const previous = res.ok ? await res.json() : null;
  const fields = Object.fromEntries(Object.entries(plan.fields).map(([key, value]) => [key, typeof value === 'number' ? { integerValue: String(value) } : { stringValue: value }]));
  // Commit atómico con precondiciones: equipo verificado sin modificarlo y
  // comparación del permiso previo. Una carrera aborta en vez de pisar una revocación.
  await request(base + ':commit', { method: 'POST', body: JSON.stringify({ writes: [
    { verify: name + 'teams/' + id, currentDocument: { updateTime: team.updateTime } },
    { update: { name: name + plan.path, fields }, currentDocument: previous ? { updateTime: previous.updateTime } : { exists: false } }
  ] }) });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [action, uid, team, ...flags] = process.argv.slice(2);
  const plan = accessPlan(action, uid, team);
  if (flags.length && (flags[0] !== '--aplicar-emulador' || flags.length !== 2)) throw Error('Uso: asignar|revocar UID EQUIPO [--aplicar-emulador UID_PROPIETARIO].');
  console.log(JSON.stringify(plan, null, 2));
  if (flags.length) { await applyEmulatorPlan(plan, flags[1]); console.log('Aplicado exclusivamente a demo-defensas.'); }
}
