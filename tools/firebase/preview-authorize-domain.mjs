// Cambio autorizado: añadir únicamente el hostname del canal desplegado.
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const cli = name => require('firebase-tools/lib/' + name);
const dir = new URL('../../.test-artifacts/firebase/fase8b3/', import.meta.url);
const deployment = JSON.parse(await readFile(new URL('deployment.json', dir), 'utf8'));
const preflight = JSON.parse(await readFile(new URL('preflight.json', dir), 'utf8'));
const host = deployment.hostname;
if (deployment.projectId !== 'registro-defensivo' || deployment.channelId !== 'ipad-8b2' || deployment.syncEnabled !== false || !deployment.hashesMatch || !preflight.rulesMatch
  || !/^registro-defensivo--ipad-8b2-[a-z0-9-]+\.web\.app$/.test(host) || deployment.url !== 'https://' + host) throw Error('Destino sin verificar.');
const account = cli('auth.js').getGlobalDefaultAccount();
if (!account) throw Error('Falta sesión CLI.');
await cli('requireAuth.js').requireAuth({ project: 'registro-defensivo', ...account }, true);
const auth = cli('gcp/auth.js');
const before = await auth.getAuthDomains('registro-defensivo');
if (!Array.isArray(before) || before.some(x => typeof x !== 'string')) throw Error('Lista de dominios inválida.');
if (!before.includes(host)) await auth.updateAuthDomains('registro-defensivo', [...before, host]);
const after = await auth.getAuthDomains('registro-defensivo');
if (!after.includes(host) || before.some(x => !after.includes(x)) || after.some(x => !before.includes(x) && x !== host)) throw Error('Resultado inesperado; detener sin otra modificación.');
const result = { checkedAt: new Date().toISOString(), projectId: 'registro-defensivo', hostname: host, added: !before.includes(host), previousDomainsPreserved: true, verified: true };
await writeFile(new URL('auth-domain.json', dir), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
