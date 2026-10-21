// Solo el candidato aprobado y un canal nuevo de 24h. Sin argumentos: preflight.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url), cli = name => require('firebase-tools/lib/' + name);
const dir = resolve('.test-artifacts/firebase/fase17'), candidate = resolve(dir, 'candidate'), project = 'registro-defensivo', channelId = 'ipad17';
const approvedBuild = '17-ff347879fc8976cc', publish = process.argv[2] === '--publish-approved';
assert(process.argv.length === (publish ? 3 : 2));
assert.equal(require('firebase-tools/package.json').version, '15.11.0');
const manifest = JSON.parse(await readFile(resolve(candidate, 'manifest.json'), 'utf8'));
const tests = JSON.parse(await readFile(resolve(dir, 'verificacion.json'), 'utf8'));
assert.equal(manifest.buildId, approvedBuild); assert.equal(tests.buildId, approvedBuild); assert(tests.ok && tests.reports.length === 6 && tests.realWrites === 0);
assert(manifest.plan.projectId === project && manifest.plan.channelId === channelId && manifest.plan.syncEnabled === false && manifest.plan.allowRealWrites === false && manifest.files.length === 39);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const actual = [];
async function inspect(path, prefix = '') {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), 'Enlace en candidato.');
    if (entry.isDirectory()) await inspect(resolve(path, entry.name), prefix + entry.name + '/');
    else actual.push(prefix + entry.name);
  }
}
await inspect(resolve(candidate, 'public'));
assert.deepEqual(actual.sort(), manifest.files.map(item => item.file).sort());
for (const file of manifest.files) assert.equal(hash(await readFile(resolve(candidate, 'public', file.file))), file.sha256);
const account = cli('auth.js').getGlobalDefaultAccount(); assert(account, 'Falta sesión CLI existente.');
const options = { project, projectId: project, site: project, ...account, cwd: candidate,
  configPath: resolve(candidate, 'firebase.preview.json'), nonInteractive: true, only: 'hosting', message: 'Prueba física iPad ' + approvedBuild };
options.config = cli('config.js').Config.load(options);
assert.deepEqual(Object.keys(options.config.src), ['hosting']);
assert.equal(options.config.path(options.config.get('hosting.public')), resolve(candidate, 'public'));
assert.equal(options.config.get('hosting.site'), project);
assert(!options.config.get('hosting.rewrites') && !options.config.get('hosting.redirects'));
await cli('requireAuth.js').requireAuth(options, true);
const api = cli('hosting/api.js'), auth = cli('gcp/auth.js');
async function protectedState() {
  const live = await api.getChannel(project, project, 'live');
  const rules = (await cli('gcp/rules.js').listAllReleases(project)).find(item => item.name === `projects/${project}/releases/cloud.firestore`);
  assert(rules?.rulesetName, 'No se identifica la referencia de reglas vigente.');
  return { liveRelease: live?.release?.name ?? null, liveVersion: live?.release?.version?.name ?? null, ruleset: rules.rulesetName };
}
assert.equal(await api.getChannel(project, project, channelId), null, 'El canal ya existe; no renovar ni sobrescribir.');
const protectedBefore = await protectedState(), beforeDomains = await auth.getAuthDomains(project);
assert(Array.isArray(beforeDomains) && beforeDomains.includes('itsasnehezkuntza.github.io') && beforeDomains.includes('localhost'));
const preflight = { checkedAt: new Date().toISOString(), projectId: project, channelId, buildId: approvedBuild, files: 39,
  channelAbsent: true, protectedBefore, beforeDomains, expiryHours: 24, syncEnabled: false };
if (!publish) {
  await writeFile(resolve(dir, 'preflight.json'), JSON.stringify(preflight, null, 2)); console.log(JSON.stringify(preflight, null, 2));
} else {
  const prior = JSON.parse(await readFile(resolve(dir, 'preflight.json'), 'utf8'));
  assert.equal(prior.buildId, approvedBuild); assert.deepEqual(prior.protectedBefore, protectedBefore); assert.deepEqual(prior.beforeDomains, beforeDomains);
  await cli('requirePermissions.js').requirePermissions(options, ['firebasehosting.sites.update']);
  const created = await api.createChannel(project, project, channelId, 24 * 60 * 60 * 1000);
  assert(/^https:\/\/registro-defensivo--ipad17-[a-z0-9-]+\.web\.app$/.test(created.url));
  assert(Date.parse(created.expireTime) > Date.now() && Date.parse(created.expireTime) <= Date.now() + 24 * 3600000 + 60000);
  await writeFile(resolve(dir, 'created-channel.json'), JSON.stringify({ projectId: project, channelId, url: created.url, expireTime: created.expireTime, createdAt: new Date().toISOString() }, null, 2));
  // Impedir cambios ajenos al canal aprobado, renovaciones o limpieza de Auth.
  for (const fn of ['createChannel', 'updateChannelTtl', 'deleteChannel', 'createSite', 'updateSite', 'deleteSite', 'addAuthDomains', 'removeAuthDomain', 'cleanAuthState'])
    api[fn] = async () => { throw Error('Operación no autorizada: ' + fn); };
  const client = new (cli('apiv2.js').Client)({ urlPrefix: cli('api.js').hostingApiOrigin(), apiVersion: 'v1beta1', auth: true });
  const release = api.createRelease;
  let uploadedCount = 0;
  api.createRelease = async (site, id, version, details) => {
    assert.equal(site, project); assert.equal(id, channelId);
    assert.deepEqual(await protectedState(), protectedBefore);
    const state = await api.getChannel(project, project, channelId); assert.equal(state.expireTime, created.expireTime); assert(!state.release);
    const remoteFiles = []; let pageToken;
    do {
      const response = await client.get('/' + version + '/files', { queryParams: { pageSize: 100, ...(pageToken ? { pageToken } : {}) } });
      remoteFiles.push(...response.body.files || []); pageToken = response.body.nextPageToken;
    } while (pageToken);
    const expected = manifest.files.filter(item => item.file !== '.nojekyll');
    assert.deepEqual(remoteFiles.map(item => item.path).sort(), [...expected.map(item => '/' + item.file), '/__/firebase/init.js', '/__/firebase/init.json'].sort());
    for (const file of expected) assert.equal(remoteFiles.find(item => item.path === '/' + file.file)?.hash, hash(gzipSync(await readFile(resolve(candidate, 'public', file.file)), { level: 9 })));
    uploadedCount = expected.length;
    await writeFile(resolve(dir, 'uploaded-review.json'), JSON.stringify({ version, filesVerified: uploadedCount, firebaseGeneratedFiles: 2, hashesMatch: true }, null, 2));
    return release(site, id, version, details);
  };
  const hosting = cli('deploy/hosting/index.js'), context = { projectId: project, hostingChannel: channelId };
  await hosting.prepare(context, options); assert.equal(context.hosting.deploys.length, 1); assert.equal(context.hosting.deploys[0].config.site, project);
  await hosting.deploy(context, options); await hosting.release(context, options, {});
  const after = await api.getChannel(project, project, channelId);
  assert.equal(after.url, created.url); assert.equal(after.expireTime, created.expireTime);
  assert.deepEqual(await protectedState(), protectedBefore);
  const hostname = new URL(after.url).hostname;
  assert.deepEqual(await auth.getAuthDomains(project), beforeDomains, 'Dominios cambiaron durante el despliegue.');
  const expectedDomains = beforeDomains.includes(hostname) ? beforeDomains : [...beforeDomains, hostname];
  if (!beforeDomains.includes(hostname)) await auth.updateAuthDomains(project, expectedDomains);
  assert.deepEqual(await auth.getAuthDomains(project), expectedDomains);
  assert.deepEqual(await protectedState(), protectedBefore);
  const receipt = { deployedAt: new Date().toISOString(), projectId: project, channelId, buildId: approvedBuild, url: after.url, hostname,
    expireTime: after.expireTime, version: after.release?.version?.name, applicationFilesVerified: uploadedCount, firebaseGeneratedFiles: 2,
    authDomainAdded: !beforeDomains.includes(hostname), previousDomainsPreserved: true, beforeDomains, afterDomains: expectedDomains,
    protectedBefore, liveUnchanged: true, rulesUnchanged: true, syncEnabled: false, realFirestoreWrites: 0, physicalTrial: 'pending' };
  await writeFile(resolve(dir, 'deployment.json'), JSON.stringify(receipt, null, 2)); console.log(JSON.stringify(receipt, null, 2));
}
