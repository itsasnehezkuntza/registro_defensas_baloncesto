// Lectura administrativa de metadatos; nunca publica reglas ni lee partidos.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
const cli = name => require('firebase-tools/lib/' + name);
const account = cli('auth.js').getGlobalDefaultAccount();
if (!account) throw Error('Falta sesión Firebase CLI.');
await cli('requireAuth.js').requireAuth({ project: 'registro-defensivo', ...account }, true);
const rules = cli('gcp/rules.js');
const releases = await rules.listAllReleases('registro-defensivo');
const release = releases.find(r => r.name === 'projects/registro-defensivo/releases/cloud.firestore');
if (!release) throw Error('No se encuentra el release de la base por defecto.');
const files = await rules.getRulesetContent(release.rulesetName);
const normalize = s => s.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
const local = normalize(await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8'));
if (files.length !== 1 || normalize(files[0].content) !== local) throw Error('STOP: reglas desplegadas distintas; no publicar ni activar.');
const sites = await cli('hosting/api.js').listSites('registro-defensivo');
if (!sites.some(s => s.name === 'projects/registro-defensivo/sites/registro-defensivo')) throw Error('Falta sitio autorizado.');
const result = { checkedAt: new Date().toISOString(), projectId: 'registro-defensivo', siteId: 'registro-defensivo', rulesRelease: release.name,
  ruleset: release.rulesetName, rulesMatch: true, rulesHash: createHash('sha256').update(local).digest('hex') };
const dir = new URL('../../.test-artifacts/firebase/fase8b3/', import.meta.url);
await mkdir(dir, { recursive: true });
await writeFile(new URL('preflight.json', dir), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
