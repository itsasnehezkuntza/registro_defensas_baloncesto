// Solo lectura. Consulta una identidad indicada por el usuario y sus equipos, sin listar usuarios.
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url), cli = name => require('firebase-tools/lib/' + name);
const email = process.argv[2];
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Indica el correo exclusivo de pruebas.');
const account = cli('auth.js').getGlobalDefaultAccount();
if (!account) throw Error('Falta sesión CLI.');
await cli('requireAuth.js').requireAuth({ project: 'registro-defensivo', ...account }, true);
const user = await cli('gcp/auth.js').findUser('registro-defensivo', email);
if (!user.uid || user.disabled || !user.providerUserInfo?.some(p => p.providerId === 'google.com')) throw Error('Identidad Google no válida.');
const hash = createHash('sha256').update(user.uid).digest('hex').slice(0, 16);
if (hash === '726336902dfccda7') throw Error('STOP: es la cuenta propietaria anterior, sin aislamiento adicional.');
const client = new (cli('apiv2.js').Client)({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1', auth: true });
const response = await client.post('/projects/registro-defensivo/databases/(default)/documents:runQuery', {
  structuredQuery: { select: { fields: [{ fieldPath: 'name' }] }, from: [{ collectionId: 'teams' }],
    where: { fieldFilter: { field: { fieldPath: 'ownerUid' }, op: 'EQUAL', value: { stringValue: user.uid } } }, limit: 2 }
}, { skipLog: { body: true, resBody: true } });
if (!Array.isArray(response.body)) throw Error('Respuesta de equipos inesperada.');
const teams = response.body.filter(r => r.document);
if (teams.length) throw Error('STOP: esta cuenta ya tiene equipos. Conservarlos y revisar antes de habilitar.');
const result = { checkedAt: new Date().toISOString(), projectId: 'registro-defensivo', ownerHash: hash, googleProvider: true,
  previousOwner: false, ownedTeams: 0, dedicatedConfirmedByUser: true, administrativeReadOnly: true, clientRulesTestedHere: false };
await writeFile(new URL('../../.test-artifacts/firebase/fase8b3/test-identity.json', import.meta.url), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
