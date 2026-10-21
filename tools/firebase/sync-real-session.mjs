// Herramienta manual local. No se importa desde la aplicación ni escribe al arrancar.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from './browser-support.mjs';
import { firebaseSettings } from '../../js/firebase-config.js';
import { syncSettings } from '../../js/sync-config.js';
import { manualBrowserBootstrap, manualBrowserHtml, validateManualReport, validateManualAccessReport } from './sync-real-manual-browser.mjs';

const root = new URL('../../', import.meta.url);
const normalized = text => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
const hash = text => createHash('sha256').update(text).digest('hex');

export async function prepareRealSyncSession({ rulesCopy, port = 4197, manualBrowser = false, resumeRun = null } = {}) {
  if (resumeRun && (!manualBrowser || !/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-f0-9]{8}$/.test(resumeRun))) throw Error('STOP: identificador de sesión manual inválido.');
  if (!rulesCopy) throw Error('Se necesita la copia de las reglas publicadas facilitada por el propietario.');
  const local = normalized(await readFile(new URL('firestore.rules', root), 'utf8'));
  if (local !== normalized(await readFile(rulesCopy, 'utf8'))) throw Error('STOP: las reglas publicadas facilitadas difieren de las locales.');
  if (firebaseSettings.config.projectId !== 'registro-defensivo' || !firebaseSettings.enabled || firebaseSettings.authEmulator) throw Error('STOP: proyecto/Auth incorrectos.');
  if (syncSettings.enabled || syncSettings.emulator || syncSettings.allowRealWrites) throw Error('STOP: las banderas en disco deben seguir desactivadas.');
  const runId = resumeRun || new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8);
  const out = new URL('.test-artifacts/firebase/real-sync/' + runId + '/', root);
  const previous = resumeRun ? JSON.parse(await readFile(new URL('session.json', out), 'utf8')) : null;
  if (previous && (previous.runId !== runId || previous.mode !== 'manual-supported-browser' || previous.projectId !== 'registro-defensivo'
    || previous.teamName !== 'PRUEBA 8B' || !/^prueba8b-[a-f0-9-]{36}$/.test(previous.teamId)
    || previous.origin !== `http://localhost:${port}` || previous.rulesNormalizedSha256 !== hash(local))) throw Error('STOP: sesión anterior incompatible; se conservan sus datos.');
  if (previous?.stopped && previous.stopReason !== 'Servidor manual detenido por el propietario.') throw Error('STOP: sesión detenida para revisión; no se fuerza su reanudación.');
  const url = new URL('https://identitytoolkit.googleapis.com/v1/projects');
  url.searchParams.set('key', firebaseSettings.config.apiKey); url.searchParams.set('firebaseAppId', firebaseSettings.config.appId);
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const config = await response.json();
  if (!response.ok || String(config.projectId) !== '760744900094' || !config.authorizedDomains?.includes('localhost')) throw Error('STOP: configuración pública real no verificada.');

  const teamId = previous?.teamId || 'prueba8b-' + randomUUID();
  await mkdir(out, { recursive: true });
  const audit = previous || { runId, startedAt: new Date().toISOString(), projectId: 'registro-defensivo', teamId,
    teamName: 'PRUEBA 8B', origin: `http://localhost:${port}`, rulesNormalizedSha256: hash(local),
    rulesEvidence: 'Copia de reglas publicadas facilitada por el propietario; no lectura administrativa.',
    publicConfigHttpStatus: response.status, mode: manualBrowser ? 'manual-supported-browser' : 'playwright', profiles: {}, steps: [], stopped: false };
  const save = () => writeFile(new URL('session.json', out), JSON.stringify(audit, null, 2));
  const sourceTransport = await readFile(new URL('js/firestore-sync.js', root), 'utf8');
  // El adaptador deportivo es el original. Esta envoltura restringe el destino
  // y la lista de equipos para no consultar partidos de otros equipos.
  const guardedTransport = sourceTransport.replace('export async function loadFirestoreTransport(uid)', 'async function unrestrictedTransport(uid)') + `
const ONLY_TEST_TEAM = ${JSON.stringify(teamId)};
const checkTestTeam = id => { if (id !== ONLY_TEST_TEAM) throw Error('STOP: destino ajeno a PRUEBA 8B.'); };
export async function loadFirestoreTransport(uid) {
  const backend = await unrestrictedTransport(uid);
  const recordAccess = decision => {
    if (${manualBrowser}) globalThis.dispatchEvent(new CustomEvent('prueba8b-team-access', { detail: { uid, teamId: ONLY_TEST_TEAM, decision } }));
  };
  return {
    async teams() {
      try { const team = await backend.verifyTeam(ONLY_TEST_TEAM); recordAccess('allowed'); return [team]; }
      catch (error) {
        const decision = ['permission-denied', 'not-found'].includes(error.code) ? error.code : 'error';
        recordAccess(decision);
        if (decision === 'permission-denied' || decision === 'not-found') return [];
        throw error;
      }
    },
    verifyTeam(id) { checkTestTeam(id); return backend.verifyTeam(id); },
    createTeam(name) {
      if (name !== 'PRUEBA 8B') throw Error('STOP: solo se permite crear PRUEBA 8B.');
      return backend.createTeam(name, ONLY_TEST_TEAM);
    },
    send(op) { checkTestTeam(op.teamId); return backend.send(op); },
    pull(id) { checkTestTeam(id); return backend.pull(id); }
  };
}
`;
  const server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url, audit.origin).pathname;
      if (manualBrowser && ['/__manual-report', '/__manual-access-report'].includes(path) && req.method === 'POST') {
        if (req.headers.origin && req.headers.origin !== audit.origin) { res.writeHead(403).end(); return; }
        let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 65536) { res.writeHead(413).end(); return; } }
        const access = path === '/__manual-access-report';
        const data = (access ? validateManualAccessReport : validateManualReport)(JSON.parse(body), teamId);
        audit.profiles[data.label] ||= { mode: 'manual', reports: [] };
        const profile = audit.profiles[data.label];
        if (access) {
          profile.accessReports ||= [];
          profile.accessReports.push({ at: new Date().toISOString(), ...data });
          if (profile.accessReports.length > 1000) profile.accessReports.shift();
        } else {
          profile.lastObservation = data;
          profile.reports.push({ at: new Date().toISOString(), ...data });
          if (profile.reports.length > 1000) profile.reports.shift();
        }
        await save(); res.writeHead(204).end(); return;
      }
      if (manualBrowser && path === '/__manual-bootstrap.js') {
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' }).end(manualBrowserBootstrap(runId, teamId)); return;
      }
      if (path === '/favicon.ico') { res.writeHead(204).end(); return; }
      if (path === '/_empty.html') { res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' }).end('<!doctype html><title>Perfil de prueba vacío</title>'); return; }
      const asset = path === '/' ? 'index.html' : path.slice(1);
      if (!/^(index\.html|app\.js|[\w-]+\.css|categorias\.csv|js\/[\w-]+\.js|fonts\/[\w-]+\.(ttf|txt))$/.test(asset)) { res.writeHead(404).end(); return; }
      let body = asset === 'js/sync-config.js'
        ? 'export const syncSettings=Object.freeze({enabled:true,emulator:false,allowRealWrites:true});'
        : asset === 'js/firestore-sync.js' ? guardedTransport : await readFile(new URL(asset, root));
      if (manualBrowser && asset === 'index.html') body = manualBrowserHtml(body.toString('utf8'));
      const ext = asset.split('.').pop();
      res.writeHead(200, { 'Content-Type': ({ html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', csv: 'text/csv; charset=utf-8', ttf: 'font/ttf' })[ext] || 'text/plain', 'Cache-Control': 'no-store' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  // Solo se modifica el informe tras conseguir el puerto; no se pisa otra sesión viva.
  if (previous) {
    audit.resumptions ||= [];
    audit.resumptions.push({ at: new Date().toISOString(), previousStopReason: audit.stopReason || null });
    audit.stopped = false; delete audit.stopReason;
  }
  await save();
  if (manualBrowser) return { audit, server, save, out: fileURLToPath(out), async stop(reason) {
    audit.stopped = true; audit.stopReason = reason; await save(); await new Promise(resolve => server.close(resolve));
  } };
  let browser;
  const profiles = {};
  try {
    const contexts = [];
    browser = { close: () => Promise.all(contexts.map(context => context.close())) };
    async function openProfile(label) {
      if (!['A', 'B'].includes(label)) throw Error('Perfil desconocido.');
      if (profiles[label]) return profiles[label];
      // Directorios nuevos por ejecución; nunca se abre un perfil del usuario.
      const context = await chromium.launchPersistentContext(fileURLToPath(new URL('profile-' + label + '/', out)), {
        headless: false, viewport: { width: 1180, height: 820 }, acceptDownloads: true
      });
      contexts.push(context);
      const page = context.pages()[0] || await context.newPage();
      await page.goto(audit.origin + '/_empty.html');
      const previous = await page.evaluate(() => indexedDB.databases());
      if (previous.length) throw Error('STOP: el perfil no está vacío.');
      audit.profiles[label] = { emptyBeforeOpening: true, status: 'waiting-manual-google-login', pageErrors: [] };
      page.on('pageerror', error => { audit.profiles[label].pageErrors.push(error.message); void save(); });
      await page.addInitScript(({ label, teamId }) => {
        globalThis.__realSyncTest = { label, teamId, states: [] };
        addEventListener('DOMContentLoaded', () => {
          document.title = 'PRUEBA 8B · Perfil ' + label;
          const note = document.createElement('div'); note.textContent = 'PRUEBA 8B · Perfil ' + label + ' · SOLO DATOS FICTICIOS';
          note.style.cssText = 'position:fixed;bottom:0;right:0;z-index:10000;background:#161616;color:white;padding:3px 10px;font:12px sans-serif;pointer-events:none';
          document.body.append(note);
          new MutationObserver(() => {
            const cloud = document.getElementById('cloudStatus')?.textContent;
            const local = document.getElementById('saveStatus')?.textContent;
            const last = globalThis.__realSyncTest.states.at(-1);
            if (cloud !== last?.cloud || local !== last?.local) globalThis.__realSyncTest.states.push({ at: new Date().toISOString(), cloud, local });
            const migration = document.getElementById('syncImport'); if (migration) { migration.disabled = true; migration.hidden = true; }
          }).observe(document.body, { subtree: true, childList: true, characterData: true });
        });
      }, { label, teamId });
      await page.goto(audit.origin + '/?perfil=' + label);
      profiles[label] = { context, page };
      await save();
      return profiles[label];
    }
    // B no abre ninguna página hasta terminar Google en A.
    await openProfile('A');
    await save();
    return { browser, server, profiles, audit, out: fileURLToPath(out), save, openProfile,
      async stop(reason) {
        audit.stopped = true; audit.stopReason = reason; await save();
        await browser.close(); await new Promise(resolve => server.close(resolve));
      }
    };
  } catch (error) { await browser?.close(); await new Promise(resolve => server.close(resolve)); throw error; }
}
