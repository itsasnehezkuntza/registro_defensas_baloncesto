// Operaciones limitadas a la publicación general solicitada. Sin datos deportivos.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const mode = process.argv[2]; assert(['preflight', 'rules', 'status', 'build', 'verify'].includes(mode));
const dir = '.test-artifacts/firebase/fase20/', project = 'registro-defensivo';
const pkg = JSON.parse(await readFile(dir + 'package.json', 'utf8')), previous = JSON.parse(await readFile(dir + 'previous.json', 'utf8'));
const require = createRequire(import.meta.url), cli = name => require('firebase-tools/lib/' + name);
const credential = spawnSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
assert.equal(credential.status, 0, 'Falta credencial Git');
const fields = Object.fromEntries(credential.stdout.trim().split('\n').map(line => { const at = line.indexOf('='); return [line.slice(0, at), line.slice(at + 1)]; }));
assert(fields.password);
async function github(path, method = 'GET') {
  const response = await fetch('https://api.github.com/repos/itsasnehezkuntza/registro_defensas_baloncesto' + path, { method, headers: { Authorization: 'Bearer ' + fields.password, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
  const body = await response.json(); assert(response.ok, 'GitHub ' + response.status + ': ' + body.message); return body;
}
const pages = await github('/pages'); assert.equal(pages.source.branch, 'gh-pages'); assert.equal(pages.source.path, '/');
const mainRef = (await github('/git/ref/heads/main')).object.sha, pagesRef = (await github('/git/ref/heads/gh-pages')).object.sha;
if (mode === 'status' || mode === 'build' || mode === 'verify') {
  if (mode === 'build') { assert.equal(pagesRef, pkg.pagesCommit); await github('/pages/builds', 'POST'); }
  const latest = await github('/pages/builds/latest');
  const result = { main: mainRef, pages: pagesRef, source: pages.source, status: latest.status, buildCommit: latest.commit, error: latest.error?.message };
  if (mode === 'verify') {
    assert.equal(pagesRef, pkg.pagesCommit); assert.equal(latest.commit, pkg.pagesCommit); assert.equal(latest.status, 'built');
    await cli('requireAuth.js').requireAuth({ project, ...cli('auth.js').getGlobalDefaultAccount() }, true);
    const deployed = JSON.parse(await readFile(dir + 'rules-deployment.json', 'utf8')), preflight = JSON.parse(await readFile(dir + 'preflight.json', 'utf8'));
    const rules = cli('gcp/rules.js');
    const current = (await rules.listAllReleases(project)).find(item => item.name === `projects/${project}/releases/cloud.firestore`);
    assert.equal(current.rulesetName, deployed.ruleset);
    const content = await rules.getRulesetContent(current.rulesetName); assert.equal(content.length, 1);
    assert.equal(createHash('sha256').update(content[0].content).digest('hex'), deployed.hash);
    assert.deepEqual(await cli('gcp/auth.js').getAuthDomains(project), preflight.protectedState.domains);
    assert.equal((await cli('hosting/api.js').getChannel(project, project, 'live'))?.release?.name ?? null, preflight.protectedState.liveRelease);
    result.rulesVerified = true; result.authUnchanged = true; result.hostingUnchanged = true;
    await writeFile(dir + 'remote-verification.json', JSON.stringify(result, null, 2));
  }
  await writeFile(dir + 'github-status.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} else {
  assert.equal(mainRef, previous.main); assert.equal(pagesRef, previous.pages);
  await cli('requireAuth.js').requireAuth({ project, ...cli('auth.js').getGlobalDefaultAccount() }, true);
  const rules = cli('gcp/rules.js'), auth = cli('gcp/auth.js'), hosting = cli('hosting/api.js');
  const currentRelease = async () => (await rules.listAllReleases(project)).find(item => item.name === `projects/${project}/releases/cloud.firestore`);
  const release = await currentRelease(); assert.equal(release.rulesetName, `projects/${project}/rulesets/4bc70f67-e0ed-4fb0-b46e-7c2494eab227`);
  const oldFiles = await rules.getRulesetContent(release.rulesetName);
  const files = [{ name: 'firestore.rules', content: await readFile('firestore.rules', 'utf8') }];
  const hash = createHash('sha256').update(files[0].content).digest('hex');
  const compiled = await rules.testRuleset(project, files);
  assert(!(compiled.body.issues || []).some(issue => issue.severity === 'ERROR'), JSON.stringify(compiled.body.issues));
  const domains = await auth.getAuthDomains(project), live = await hosting.getChannel(project, project, 'live');
  const protectedState = { domains, liveRelease: live?.release?.name ?? null };
  if (mode === 'preflight') {
    await writeFile(dir + 'previous-rules.json', JSON.stringify({ release, files: oldFiles }, null, 2));
    const result = { checkedAt: new Date().toISOString(), main: mainRef, pages: pagesRef, previousRuleset: release.rulesetName, candidateRulesHash: hash, protectedState, compiled: true, sportsDataRead: false };
    await writeFile(dir + 'preflight.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
  } else {
    const preflight = JSON.parse(await readFile(dir + 'preflight.json', 'utf8'));
    assert.equal(hash, preflight.candidateRulesHash); assert.deepEqual(protectedState, preflight.protectedState);
    const tests = JSON.parse(await readFile('.test-artifacts/firebase/sync.json', 'utf8'));
    assert(tests.ok && tests.reports.length === 40 && tests.realWrites === 0);
    // Los respaldos deben existir remotamente antes de cambiar reglas o Pages.
    assert.equal((await github('/git/ref/heads/respaldo/antes-fase20-main-20261021')).object.sha, previous.main);
    assert.equal((await github('/git/ref/heads/respaldo/antes-fase20-pages-20261021')).object.sha, previous.pages);
    const newRuleset = await rules.createRuleset(project, files);
    await writeFile(dir + 'created-ruleset.json', JSON.stringify({ name: newRuleset, hash }, null, 2));
    assert.equal((await currentRelease()).rulesetName, preflight.previousRuleset);
    await rules.updateRelease(project, newRuleset, 'cloud.firestore');
    assert.equal((await currentRelease()).rulesetName, newRuleset);
    assert.deepEqual(await rules.getRulesetContent(newRuleset), files);
    assert.deepEqual(await auth.getAuthDomains(project), domains);
    assert.equal((await hosting.getChannel(project, project, 'live'))?.release?.name ?? null, protectedState.liveRelease);
    const result = { publishedAt: new Date().toISOString(), previousRuleset: preflight.previousRuleset, ruleset: newRuleset, hash, authUnchanged: true, hostingUnchanged: true, sportsDataRead: false, sportsDataWrites: 0 };
    await writeFile(dir + 'rules-deployment.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
  }
}
