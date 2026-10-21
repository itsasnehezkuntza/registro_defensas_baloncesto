// Fase 16/B4: retirar únicamente el dominio temporal autorizado por el usuario.
// Sin argumentos: lectura y plan. --apply: aplica el plan ya guardado y verifica.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url), cli = name => require('firebase-tools/lib/' + name);
const project = 'registro-defensivo', site = project, channelId = 'ipad-8b2';
const hostname = 'registro-defensivo--ipad-8b2-40nbq9cf.web.app';
const dir = new URL('../../.test-artifacts/firebase/fase16/', import.meta.url);
const apply = process.argv[2] === '--apply';
assert(process.argv.length === (apply ? 3 : 2), 'Solo se admite --apply o ningún argumento.');
const prior = JSON.parse(await readFile(new URL('../../.test-artifacts/firebase/fase8b3/deployment.json', import.meta.url), 'utf8'));
assert(prior.projectId === project && prior.channelId === channelId && prior.hostname === hostname && prior.url === 'https://' + hostname);
assert(Number.isFinite(Date.parse(prior.expireTime)) && Date.parse(prior.expireTime) < Date.now(), 'La caducidad original aún no ha llegado.');
const account = cli('auth.js').getGlobalDefaultAccount();
assert(account, 'No hay sesión Firebase CLI disponible; no se inicia login automáticamente.');
await cli('requireAuth.js').requireAuth({ project, ...account }, true);
const auth = cli('gcp/auth.js'), hosting = cli('hosting/api.js');
const channel = await hosting.getChannel(project, site, channelId);
if (channel) {
  assert(channel.url === 'https://' + hostname, 'El canal ahora corresponde a otra URL.');
  assert(Number.isFinite(Date.parse(channel.expireTime)) && Date.parse(channel.expireTime) < Date.now(), 'El canal sigue activo; detener.');
}
const before = await auth.getAuthDomains(project);
assert(Array.isArray(before) && before.every(value => typeof value === 'string') && new Set(before).size === before.length, 'Lista de dominios inesperada.');
for (const host of ['localhost', 'registro-defensivo.firebaseapp.com', 'registro-defensivo.web.app', 'itsasnehezkuntza.github.io'])
  assert(before.includes(host), 'Falta un dominio que se debe conservar: ' + host);
const plan = { checkedAt: new Date().toISOString(), projectId: project, siteId: site, channelId, hostname,
  originalExpireTime: prior.expireTime, channelState: channel ? 'expired' : 'not-found',
  currentExpireTime: channel?.expireTime ?? null, beforeDomains: before, afterDomains: before.filter(host => host !== hostname),
  removalNeeded: before.includes(hostname), scope: 'authorizedDomains only; no users, Firestore, rules or deployment' };
await mkdir(dir, { recursive: true });
if (!apply) {
  await writeFile(new URL('preflight.json', dir), JSON.stringify(plan, null, 2));
  console.log(JSON.stringify({ ...plan, applied: false }, null, 2));
} else {
  const reviewed = JSON.parse(await readFile(new URL('preflight.json', dir), 'utf8'));
  assert(reviewed.projectId === project && reviewed.hostname === hostname && reviewed.channelId === channelId);
  assert.deepEqual(before, reviewed.beforeDomains, 'Los dominios cambiaron desde la lectura previa; no aplicar un plan obsoleto.');
  assert.deepEqual(plan.afterDomains, reviewed.afterDomains);
  // Segunda lectura inmediatamente antes de la única modificación permitida.
  assert.deepEqual(await auth.getAuthDomains(project), before, 'Cambio concurrente de dominios.');
  if (plan.removalNeeded) await auth.updateAuthDomains(project, plan.afterDomains);
  const after = await auth.getAuthDomains(project);
  assert.deepEqual(after, plan.afterDomains, 'Resultado inesperado: detener sin más modificaciones.');
  const receipt = { ...plan, verifiedAt: new Date().toISOString(), afterDomains: after,
    removed: plan.removalNeeded, verified: true, otherDomainsPreserved: true, firestoreAccessed: false, deployed: false };
  await writeFile(new URL('resultado.json', dir), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
}
