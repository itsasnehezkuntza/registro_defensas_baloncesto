import { firebaseSettings } from '../../js/firebase-config.js';
import { createWebAuth } from '../../js/firebase-auth.js';
import { fingerprint, runSecurityChecks } from './security-checks.mjs';
const fixture = await (await fetch('/__security-fixture')).json();
const adapter = await createWebAuth(firebaseSettings); await adapter.ready();
const [appSdk, authSdk, sdk] = await Promise.all(['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(name => import('https://www.gstatic.com/firebasejs/12.11.0/' + name)));
const app = appSdk.getApp('defensas-auth'), auth = authSdk.getAuth(app), db = sdk.getFirestore(app);
const $ = id => document.getElementById(id); let busy = false, halted = Boolean(fixture.halted);
async function controls() {
  const user = auth.currentUser, hash = user ? await fingerprint(user.uid) : null;
  $('account').textContent = user ? 'Cuenta conectada: ' + (user.email || user.displayName) : 'Sin sesión';
  $('login').disabled = busy || !!user; $('logout').disabled = busy || !user;
  for (const role of ['owner', 'external', 'signed-out']) $(role).disabled = busy || halted || (role === 'owner' && fixture.ownerCompleted) || (role === 'signed-out' ? !!user : !user || (role === 'owner') !== (hash === fixture.ownerHash));
}
adapter.observe(() => void controls(), error => { $('error').textContent = error.code; });
$('login').onclick = () => { void adapter.login().catch(error => { $('error').textContent = error.code; }); };
$('logout').onclick = () => { void adapter.logout(); };
for (const role of ['owner', 'external', 'signed-out']) $(role).onclick = async () => {
  if (busy || halted) return; busy = true; await controls();
  const checks = []; let report;
  try {
    report = await runSecurityChecks(sdk, db, auth.currentUser, fixture, role, result => { checks.push(result); $('results').textContent += `${result.name}: ${result.result} ${result.code || ''}\n`; });
  } catch (error) {
    halted = true; $('error').textContent = error.message;
    report = { role, uidHash: auth.currentUser ? await fingerprint(auth.currentUser.uid) : null, checks, halted: true };
  }
  try { const response = await fetch('/__security-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report) }); if (!response.ok) throw Error(); }
  catch { $('error').textContent += ' No se pudo guardar el informe local.'; }
  busy = false; if (role === 'owner') halted = true; await controls();
};
void controls();
