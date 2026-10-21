// Consulta pública real, de solo lectura. No inicia sesión ni utiliza Firestore.
import { mkdir, writeFile } from 'node:fs/promises';
import { firebaseSettings } from '../../js/firebase-config.js';
const { config } = firebaseSettings;
if (!firebaseSettings.enabled || firebaseSettings.authEmulator || !config?.apiKey || !config.appId || config.projectId?.startsWith('demo-')) {
  throw Error('Se requiere configuración pública real habilitada y sin emulador.');
}
const url = new URL('https://identitytoolkit.googleapis.com/v1/projects');
url.searchParams.set('key', config.apiKey);
url.searchParams.set('firebaseAppId', config.appId);
const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
const body = await response.json();
const domains = Array.isArray(body.authorizedDomains) ? body.authorizedDomains : [];
const google = Array.isArray(body.idpConfig) ? body.idpConfig.find(item => item.providerId === 'google.com') : undefined;
const report = {
  checkedAt: new Date().toISOString(), type: 'real-public-config',
  configuredProjectId: config.projectId, httpStatus: response.status,
  backendProjectIdentifier: body.projectId || null,
  errorCode: response.ok ? null : (body.error?.message || 'UNKNOWN_ERROR'),
  authorizedDomains: response.ok ? domains : null,
  requiredHosts: Object.fromEntries(['localhost', '127.0.0.1', 'itsasnehezkuntza.github.io']
    .map(host => [host, response.ok ? domains.includes(host) : null])),
  googleProvider: google ? { present: true, enabled: typeof google.enabled === 'boolean' ? google.enabled : 'not-reported' } : 'not-verifiable-from-public-response',
  oauthLoginCompleted: false, firestoreAccessed: false
};
const out = new URL('../../.test-artifacts/firebase/', import.meta.url);
await mkdir(out, { recursive: true });
await writeFile(new URL('proyecto-real.json', out), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!response.ok) process.exitCode = 1;
