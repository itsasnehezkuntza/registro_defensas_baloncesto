// Control local de la sesión, con comandos explícitos. Nunca automatiza Google.
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { prepareRealSyncSession } from './sync-real-session.mjs';
import { sequentialGoogleLogin } from './sync-real-login.mjs';

if (process.argv.includes('--auto')) throw Error('Google ha bloqueado el navegador automatizado. Usa sync-real-manual.mjs con perfiles normales abiertos manualmente; no repitas --auto.');

const session = await prepareRealSyncSession({ rulesCopy: process.argv[2] });
const { profiles, audit, save } = session;
const output = value => console.log(JSON.stringify(value));
const profile = label => { if (!profiles[label]) throw Error('Perfil desconocido.'); return profiles[label]; };
async function status() {
  const result = {};
  for (const [label, { page }] of Object.entries(profiles)) {
    const info = await page.evaluate(async () => {
      const state = await (await import('./js/persistencia.js')).readState();
      const c = (await import('./js/sync-storage.js')).storageContext();
      const pending = c.scope ? await (await import('./js/sync-storage.js')).listPending(c) : [];
      return { uid: c.uid, scope: c.scope, teamId: c.teamId, games: state.games.map(game => ({ id: game.id, jornada: game.jornada, rival: game.rival })),
        currentGameId: state.currentGameId, eventIds: state.events.map(event => event.id),
        cloud: document.getElementById('cloudStatus').textContent, local: document.getElementById('saveStatusText').textContent,
        pending: pending.map(op => ({ id: op.opId, type: op.type, blocked: op.blocked || false, error: op.error || null })),
        teamCreateReady: !!document.getElementById('syncCreateTeam') && !document.getElementById('syncCreateTeam').disabled };
    });
    const uidHash = info.uid && createHash('sha256').update(info.uid).digest('hex').slice(0, 16);
    result[label] = { ...info, uid: undefined, scope: undefined, uidHash };
    audit.profiles[label].status = info.uid ? 'google-authenticated' : 'waiting-manual-google-login';
    audit.profiles[label].uidHash = uidHash;
  }
  await save(); return result;
}
const commands = {
  status,
  async login(label) {
    if (label === 'B') {
      const current = await status();
      if (!current.A?.uidHash || (profiles.A.loginPopup && !profiles.A.loginPopup.isClosed())) throw Error('Termina primero Google en A y espera a que cierre su popup.');
    }
    await session.openProfile(label);
    const { page } = profile(label);
    if (!await page.locator('#moreMenu').isVisible()) await page.locator('#moreBtn').click();
    await page.locator('#googleLogin').waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.getElementById('googleLogin').disabled);
    const opening = page.waitForEvent('popup', { timeout: 15000 });
    await page.locator('#googleLogin').click();
    const popup = await opening; profiles[label].loginPopup = popup; await popup.bringToFront();
    return { profile: label, popupOpened: true, next: 'Completar Google manualmente. No enviar credenciales al agente.' };
  },
  async stop() { await session.stop('Detenida para revisión.'); return { stopped: true, report: session.out }; }
};
output({ prepared: true, origin: audit.origin, teamId: audit.teamId, report: session.out, noFirestoreWritesYet: true });
// Lanzar desde la terminal del propietario cuando el sandbox no expone ventanas.
// No requiere comandos adicionales ni que el propietario cree datos manualmente.
if (process.argv.includes('--auto')) {
  try {
    await sequentialGoogleLogin({ open: label => session.openProfile(label), login: label => commands.login(label),
      status, popupClosed: label => !profiles[label].loginPopup || profiles[label].loginPopup.isClosed(), output });
    const { runStep } = await import('./sync-real-steps.mjs');
    for (const name of ['create', 'transfer', 'concurrent', 'offline', 'undo', 'security', 'deletion', 'logout', 'inventory']) {
      output({ step: name, result: await runStep(name, session) });
    }
    output({ completed: true, report: session.out });
    await session.stop('Prueba automática local terminada; resultados pendientes de revisión.');
  } catch (error) {
    audit.stopped = true; audit.stopReason = error.message; await save();
    output({ stopped: true, error: error.message, report: session.out, next: 'Conservar los perfiles y avisar al agente; no reintentar ni forzar resolución.' });
    // Los perfiles quedan abiertos y persistentes para conservar las pruebas.
  }
} else {
const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of input) {
  try {
    const [name, label] = line.trim().split(/\s+/);
    const result = commands[name] ? await commands[name](label)
      : await (await import('./sync-real-steps.mjs')).runStep(name, session, label);
    output({ command: line.trim(), result });
    if (name === 'stop') { input.close(); break; }
  } catch (error) { output({ stoppedCommand: line.trim(), error: error.message }); }
}
}
