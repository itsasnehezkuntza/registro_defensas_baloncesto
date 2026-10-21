// Solo lectura administrativa. No consulta documentos deportivos ni cambia recursos.
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url), cli = n => require('firebase-tools/lib/' + n);
const project = 'registro-defensivo', channel = 'ipad-8b2';
const account = cli('auth.js').getGlobalDefaultAccount();
if (!account) throw Error('Falta sesión CLI.');
await cli('requireAuth.js').requireAuth({ project, ...account }, true);
const api = cli('hosting/api.js');
const current = await api.getChannel(project, project, channel);
if (!current || !current.expireTime || Date.parse(current.expireTime) <= Date.now()) throw Error('STOP: canal inexistente o caducado. No crear ni renovar.');
const live = await api.getChannel(project, project, 'live');
const rules = cli('gcp/rules.js');
const release = (await rules.listAllReleases(project)).find(r => r.name === `projects/${project}/releases/cloud.firestore`);
if (!release) throw Error('No se encuentra el release de reglas.');
const files = await rules.getRulesetContent(release.rulesetName);
const normalize = s => s.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
const local = normalize(await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8'));
if (files.length !== 1 || normalize(files[0].content) !== local) throw Error('STOP: reglas distintas.');
const result = { checkedAt: new Date().toISOString(), projectId: project, channelId: channel,
  url: current.url, expireTime: current.expireTime, versionBefore: current.release?.version?.name ?? null,
  liveReleaseBefore: live?.release?.name ?? null, liveVersionBefore: live?.release?.version?.name ?? null,
  rulesMatch: true, ruleset: release.rulesetName, rulesHash: createHash('sha256').update(local).digest('hex') };
const dir = new URL('../../.test-artifacts/firebase/fase8b5/', import.meta.url);
await mkdir(dir, { recursive: true });
if (process.argv.includes('--closure')) {
  const deployment = JSON.parse(await readFile(new URL('deployment.json', dir), 'utf8'));
  const before = JSON.parse(await readFile(new URL('preflight.json', dir), 'utf8'));
  if (result.expireTime !== deployment.expireTimeBefore || result.versionBefore !== deployment.version || result.liveReleaseBefore !== before.liveReleaseBefore || result.ruleset !== before.ruleset) throw Error('STOP: estado final inesperado. No corregir automáticamente.');
  await writeFile(new URL('closure.json', dir), JSON.stringify({ ...result, deploymentVerified: true }, null, 2));
} else {
  await writeFile(new URL('preflight.json', dir), JSON.stringify(result, null, 2));
}
console.log(JSON.stringify(result));
