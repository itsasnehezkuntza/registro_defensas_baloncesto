// Solo metadatos públicos de versiones de Hosting; no imprime identidades.
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url), cli = n => require('firebase-tools/lib/' + n);
await cli('requireAuth.js').requireAuth({ project: 'registro-defensivo', ...cli('auth.js').getGlobalDefaultAccount() }, true);
const api = cli('hosting/api.js');
const versions = (await api.listVersions('registro-defensivo')).map(v => ({ name: v.name, status: v.status, fileCount: v.fileCount ?? null, createTime: v.createTime, config: v.config }));
await writeFile('.test-artifacts/firebase/fase8b5/hosting-versions.json', JSON.stringify(versions, null, 2));
console.log(JSON.stringify(versions.map(({ config, ...v }) => v)));
const client = new (cli('apiv2.js').Client)({ urlPrefix: cli('api.js').hostingApiOrigin(), apiVersion: 'v1beta1', auth: true });
for (const version of versions.filter(v => /b7a7d00cc1e5587b$/.test(v.name))) {
  const all = []; let pageToken;
  do {
    const response = await client.get('/' + version.name + '/files', { queryParams: { pageSize: 100, ...(pageToken ? { pageToken } : {}) } });
    all.push(...(response.body.files || [])); pageToken = response.body.nextPageToken;
  } while (pageToken);
  await writeFile('.test-artifacts/firebase/fase8b5/uploaded-files.json', JSON.stringify(all, null, 2));
  console.log(JSON.stringify(all));
}
