// Solo GET estáticos y navegador efímero sin datos ni sesión. Ninguna escritura real.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from './browser-support.mjs';
const { webkit } = await import('@playwright/test');
const phase6=process.argv.includes('--8b6');
const phase7=process.argv.includes('--8b7');
const dir = '.test-artifacts/firebase/'+(phase7?'fase8b7':phase6?'fase8b6':'fase8b5')+'/';
const deployment = JSON.parse(await readFile(dir + 'deployment.json', 'utf8'));
const manifest = JSON.parse(await readFile(phase7||phase6?dir+'candidate/manifest.json':'.test-artifacts/firebase/fase8b4/diagnostic-candidate/manifest.json', 'utf8'));
const results = await Promise.allSettled(manifest.files.map(async f => {
  const response = await fetch(deployment.url + '/' + f.file);
  assert.equal(response.status, 200, f.file);
  assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), f.sha256, f.file);
  assert.equal(response.headers.get('cache-control'), 'no-store', f.file);
  // Hosting impone noindex en canales preview; puede sustituir el nofollow configurado.
  assert((response.headers.get('x-robots-tag') || '').split(/\s*,\s*/).includes('noindex'), f.file);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', f.file);
  return { file: f.file, hashMatches: true, headersCorrect: true, robots: response.headers.get('x-robots-tag') };
}));
for (const r of results) if (r.status === 'rejected') throw r.reason;
const forbidden = ['AGENTS.md','ESPECIFICACION.md','.env','firestore.rules','firebase.diagnostic.preview.json','manifest.json','tools/firebase/candidate8b4.test.mjs','.test-artifacts/firebase/fase8b5/deployment.json',...(phase7?['firebase.diagnostic8b7.preview.json','tools/firebase/diagnostic8b7-client.js','FASE8B7_ESTABILIDAD_SAFARI.md']:phase6?['firebase.diagnostic8b6.preview.json','tools/firebase/diagnostic8b6-client.js']:[])];
const privateResults = await Promise.allSettled(forbidden.map(async path => {
  const response = await fetch(deployment.url + '/' + path); assert.equal(response.status, 404, path); return { path, status: 404 };
}));
for (const r of privateResults) if (r.status === 'rejected') throw r.reason;
const browsers = [];
for (const [name, type] of [['chromium',chromium],['webkit',webkit]]) {
  const browser = await type.launch();
  try {
    const context = await browser.newContext(), firebaseRequests = [];
    await context.route(/https:\/\/(www\.gstatic\.com|.*googleapis\.com)\//, r => { firebaseRequests.push(r.request().url()); return r.abort(); });
    const page = await context.newPage();
    await page.goto(deployment.url);
    await page.waitForFunction(() => document.body.textContent.includes('Se requiere la activación existente'));
    assert.deepEqual(await page.evaluate(() => indexedDB.databases()), []);
    assert.deepEqual(firebaseRequests, []);
    browsers.push({ name, emptyBrowserBlocked: true, databasesCreated: 0, firebaseRequests: 0 });
    await context.close();
  } finally { await browser.close(); }
}
const report = { checkedAt: new Date().toISOString(), url: deployment.url, buildId: manifest.buildId,
  files: results.map(r => r.value), excludedPaths: privateResults.map(r => r.value), browsers,
  realFirestoreWrites: 0, physicalSafariTest: 'pending' };
await writeFile(dir + 'https-verification.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ filesVerified: results.length, privatePaths404: privateResults.length, browsers, realFirestoreWrites: 0, physicalSafariTest: 'pending' }));
