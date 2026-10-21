// Publicación única autorizada 8B.5. Reutiliza uploader/release de CLI 15.11.0,
// sin el wrapper hosting:channel:deploy que amplía automáticamente el TTL.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
if (!process.argv.includes('--publish-approved-8b5')) throw Error('Publicación no solicitada.');
await import('./audit8b5.mjs');
const require = createRequire(import.meta.url), cli = n => require('firebase-tools/lib/' + n);
assert.equal(require('firebase-tools/package.json').version, '15.11.0');
const project = 'registro-defensivo', channel = 'ipad-8b2';
const dir = '.test-artifacts/firebase/fase8b5/';
const before = JSON.parse(await readFile(dir + 'preflight.json', 'utf8'));
const manifest = JSON.parse(await readFile('.test-artifacts/firebase/fase8b4/diagnostic-candidate/manifest.json', 'utf8'));
assert.equal(before.projectId, project); assert.equal(before.channelId, channel); assert(before.rulesMatch);
const account = cli('auth.js').getGlobalDefaultAccount();
if (!account) throw Error('Falta sesión CLI.');
const options = { project, projectId: project, site: project, ...account, cwd: process.cwd(),
  configPath: 'firebase.diagnostic.preview.json', nonInteractive: true, only: 'hosting',
  message: '8B.5 diagnóstico de solo lectura ' + manifest.buildId };
options.config = cli('config.js').Config.load(options);
assert.deepEqual(Object.keys(options.config.src), ['hosting']);
await cli('requireAuth.js').requireAuth(options, true);
await cli('requirePermissions.js').requirePermissions(options, ['firebasehosting.sites.update']);
const api = cli('hosting/api.js');
async function unchangedChannel() {
  const c = await api.getChannel(project, project, channel);
  assert(c && c.expireTime && Date.parse(c.expireTime) > Date.now(), 'STOP: canal caducado.');
  assert.equal(c.expireTime, before.expireTime, 'STOP: caducidad cambiada.');
  assert.equal(c.release?.version?.name ?? null, before.versionBefore, 'STOP: versión previa cambiada.');
  return c;
}
await unchangedChannel();
const rules = cli('gcp/rules.js');
const r = (await rules.listAllReleases(project)).find(r => r.name === `projects/${project}/releases/cloud.firestore`);
assert.equal(r?.rulesetName, before.ruleset, 'STOP: reglas cambiadas desde la revisión.');
// Ninguna llamada puede crear/renovar canales, tocar Auth, el sitio o el canal live.
for (const method of ['createChannel','updateChannelTtl','deleteChannel','createSite','updateSite','deleteSite','addAuthDomains','removeAuthDomain','cleanAuthState']) {
  api[method] = async () => { throw Error('Operación fuera del alcance 8B.5: ' + method); };
}
const release = api.createRelease;
api.createRelease = async (site, id, version, partial) => {
  assert.equal(site, project); assert.equal(id, channel);
  assert(/^(?:projects\/(?:registro-defensivo|760744900094)\/)?sites\/registro-defensivo\/versions\/[a-f0-9]+$/.test(version));
  await unchangedChannel();
  return release(site, id, version, partial);
};
if (process.argv.includes('--resume-prepared-version')) {
  // Reutilizar la subida ya finalizada: no crear otra versión por un rechazo del guard.
  const prepared = JSON.parse(await readFile(dir + 'prepared-version.json', 'utf8'));
  assert.equal(prepared.buildId, manifest.buildId); assert.equal(prepared.expireTime, before.expireTime);
  const version = (await api.listVersions(project)).find(v => v.name === prepared.version);
  assert(version && version.status === 'FINALIZED');
  // fileCount es eventual e incluye init.js/init.json añadidos por Hosting.
  // Verificar el inventario y hashes reales, no asumir que fileCount son nuestros archivos.
  const client = new (cli('apiv2.js').Client)({ urlPrefix: cli('api.js').hostingApiOrigin(), apiVersion: 'v1beta1', auth: true });
  async function filesOf(name) {
    const files = []; let pageToken;
    do {
      const res = await client.get('/' + name + '/files', { queryParams: { pageSize: 100, ...(pageToken ? { pageToken } : {}) } });
      files.push(...(res.body.files || [])); pageToken = res.body.nextPageToken;
    } while (pageToken);
    return files;
  }
  const actual = await filesOf(prepared.version), baseline = await filesOf(before.versionBefore);
  const generated = ['/__/firebase/init.js', '/__/firebase/init.json'];
  assert.deepEqual(actual.map(f => f.path).sort(), [...manifest.files.map(f => '/' + f.file), ...generated].sort());
  for (const f of manifest.files) {
    const bytes = await readFile('.test-artifacts/firebase/fase8b4/diagnostic-candidate/public/' + f.file);
    assert.equal(actual.find(v => v.path === '/' + f.file)?.hash, createHash('sha256').update(gzipSync(bytes, { level: 9 })).digest('hex'), 'Hash subido distinto: ' + f.file);
  }
  for (const path of generated) assert.equal(actual.find(f => f.path === path)?.hash, baseline.find(f => f.path === path)?.hash, 'Recurso generado cambiado.');
  await writeFile(dir + 'uploaded-review.json', JSON.stringify({ checkedAt: new Date().toISOString(), version: prepared.version, candidateFiles: 38, generatedByHosting: generated, generatedUnchanged: true, allUploadedHashesMatch: true }, null, 2));
  await api.createRelease(project, channel, prepared.version, { message: options.message });
} else {
  const hosting = cli('deploy/hosting/index.js');
  const context = { projectId: project, hostingChannel: channel };
  await hosting.prepare(context, options);
  assert.equal(context.hosting.deploys.length, 1);
  assert.equal(context.hosting.deploys[0].config.site, project);
  await hosting.deploy(context, options);
  await writeFile(dir + 'prepared-version.json', JSON.stringify({ preparedAt: new Date().toISOString(), version: context.hosting.deploys[0].version, buildId: manifest.buildId, expireTime: before.expireTime }, null, 2));
  await hosting.release(context, options, {});
}
const after = await api.getChannel(project, project, channel);
const live = await api.getChannel(project, project, 'live');
const result = { deployedAt: new Date().toISOString(), projectId: project, channelId: channel,
  url: after.url, buildId: manifest.buildId, files: manifest.files.length,
  version: after.release?.version?.name ?? null, expireTimeBefore: before.expireTime,
  expireTimeAfter: after.expireTime, expiryUnchanged: after.expireTime === before.expireTime,
  liveUnchanged: (live?.release?.name ?? null) === before.liveReleaseBefore && (live?.release?.version?.name ?? null) === before.liveVersionBefore,
  realFirestoreWrites: 0, rulesPublished: false, startupCorrectionIncluded: false,
  manifestSha256: createHash('sha256').update(JSON.stringify(manifest)).digest('hex') };
await writeFile(dir + 'deployment.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
assert(result.expiryUnchanged && result.liveUnchanged, 'STOP: estado posterior inesperado. No corregir automáticamente.');
