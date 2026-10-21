// Corrección del canal temporal existente; nunca crea/renueva canales o Auth.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url), cli = name => require('firebase-tools/lib/' + name);
const project = 'registro-defensivo', channelId = 'ipad17', dir = '.test-artifacts/firebase/fase19/', candidate = resolve(dir, 'candidate');
const publish = process.argv[2] === '--update-preview'; assert(process.argv.length === (publish ? 3 : 2));
const original = JSON.parse(await readFile('.test-artifacts/firebase/fase17/deployment.json', 'utf8'));
const prior = { ...JSON.parse(await readFile('.test-artifacts/firebase/fase18/deployment.json', 'utf8')), protectedBefore: original.protectedBefore, afterDomains: original.afterDomains };
const manifest = JSON.parse(await readFile(candidate + '/manifest.json', 'utf8'));
const tests = JSON.parse(await readFile(dir + 'verificacion.json', 'utf8'));
const focus = JSON.parse(await readFile(dir + 'editor.json', 'utf8'));
assert.equal(manifest.buildId, '19-79f88c07bb7931b7'); assert.equal(tests.buildId, manifest.buildId);
assert(tests.ok && tests.reports.length === 10 && focus.ok && focus.reports.length === 2);
assert.deepEqual(manifest.compatibleBuildIds, [original.buildId, prior.buildId]); assert.equal(prior.buildId, '18-eda58c0c0461ab73');
assert(manifest.files.length === 39 && manifest.plan.syncEnabled === false && manifest.plan.allowRealWrites === false);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const item of manifest.files) assert.equal(hash(await readFile(candidate + '/public/' + item.file)), item.sha256);
const account = cli('auth.js').getGlobalDefaultAccount(); assert(account);
const options = { project, projectId: project, site: project, ...account, cwd: candidate, configPath: candidate + '/firebase.preview.json', nonInteractive: true, only: 'hosting', message: 'Corrección cursor editor Safari ' + manifest.buildId };
options.config = cli('config.js').Config.load(options); assert.deepEqual(Object.keys(options.config.src), ['hosting']);
assert.equal(options.config.path(options.config.get('hosting.public')), candidate + '\\public');
await cli('requireAuth.js').requireAuth(options, true);
const api = cli('hosting/api.js'), auth = cli('gcp/auth.js');
async function protectedState() {
  const live = await api.getChannel(project, project, 'live');
  const rules = (await cli('gcp/rules.js').listAllReleases(project)).find(item => item.name === `projects/${project}/releases/cloud.firestore`);
  return { liveRelease: live?.release?.name ?? null, liveVersion: live?.release?.version?.name ?? null, ruleset: rules?.rulesetName };
}
async function unchangedChannel() {
  const channel = await api.getChannel(project, project, channelId);
  assert(channel && channel.url === prior.url && channel.expireTime === prior.expireTime && Date.parse(channel.expireTime) > Date.now());
  assert.equal(channel.release?.version?.name, prior.version); return channel;
}
await unchangedChannel(); assert.deepEqual(await protectedState(), prior.protectedBefore);
const domains = await auth.getAuthDomains(project); assert.deepEqual(domains, prior.afterDomains);
const preflight = { checkedAt: new Date().toISOString(), buildId: manifest.buildId, projectId: project, channelId, url: prior.url,
  expireTime: prior.expireTime, priorVersion: prior.version, protectedBefore: prior.protectedBefore, authorizedDomains: domains, renewalAllowed: false };
if (!publish) {
  await writeFile(dir + 'preflight.json', JSON.stringify(preflight, null, 2)); console.log(JSON.stringify(preflight, null, 2));
} else {
  const reviewed = JSON.parse(await readFile(dir + 'preflight.json', 'utf8'));
  assert.equal(reviewed.buildId, manifest.buildId); assert.deepEqual(reviewed.authorizedDomains, domains);
  await cli('requirePermissions.js').requirePermissions(options, ['firebasehosting.sites.update']);
  for (const fn of ['createChannel', 'updateChannelTtl', 'deleteChannel', 'createSite', 'updateSite', 'deleteSite', 'addAuthDomains', 'removeAuthDomain', 'cleanAuthState'])
    api[fn] = async () => { throw Error('Operación no autorizada: ' + fn); };
  const release = api.createRelease;
  const client = new (cli('apiv2.js').Client)({ urlPrefix: cli('api.js').hostingApiOrigin(), apiVersion: 'v1beta1', auth: true });
  api.createRelease = async (site, id, version, extra) => {
    assert.equal(site, project); assert.equal(id, channelId); await unchangedChannel(); assert.deepEqual(await protectedState(), prior.protectedBefore);
    const remoteFiles = []; let pageToken;
    do {
      const response = await client.get('/' + version + '/files', { queryParams: { pageSize: 100, ...(pageToken ? { pageToken } : {}) } });
      remoteFiles.push(...response.body.files || []); pageToken = response.body.nextPageToken;
    } while (pageToken);
    const expected = manifest.files.filter(item => item.file !== '.nojekyll');
    assert.deepEqual(remoteFiles.map(item => item.path).sort(), [...expected.map(item => '/' + item.file), '/__/firebase/init.js', '/__/firebase/init.json'].sort());
    for (const file of expected) assert.equal(remoteFiles.find(item => item.path === '/' + file.file)?.hash, hash(gzipSync(await readFile(candidate + '/public/' + file.file), { level: 9 })));
    await writeFile(dir + 'uploaded-review.json', JSON.stringify({ version, filesVerified: expected.length, firebaseGeneratedFiles: 2, hashesMatch: true }, null, 2));
    return release(site, id, version, extra);
  };
  const hosting = cli('deploy/hosting/index.js'), context = { projectId: project, hostingChannel: channelId };
  await hosting.prepare(context, options); assert.equal(context.hosting.deploys.length, 1); assert.equal(context.hosting.deploys[0].config.site, project);
  await hosting.deploy(context, options); await hosting.release(context, options, {});
  const after = await api.getChannel(project, project, channelId);
  assert.equal(after.url, prior.url); assert.equal(after.expireTime, prior.expireTime);
  assert.deepEqual(await auth.getAuthDomains(project), domains); assert.deepEqual(await protectedState(), prior.protectedBefore);
  const result = { deployedAt: new Date().toISOString(), projectId: project, channelId, buildId: manifest.buildId, previousBuildId: prior.buildId,
    url: after.url, expireTime: after.expireTime, version: after.release?.version?.name, expiryUnchanged: true, authUnchanged: true,
    liveUnchanged: true, rulesUnchanged: true, syncEnabled: false, realFirestoreWrites: 0, physicalRetest: 'pending',
    userReport: 'El cursor desaparece al nombrar una defensa' };
  await writeFile(dir + 'deployment.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
}
