import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { firebaseSettings } from '../../js/firebase-config.js';
const root = new URL('../../', import.meta.url), out = new URL('.test-artifacts/firebase/fase8b2/', root);
const normalize = text => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
export async function serveSecurity({ rulesCopy, port = 4197 } = {}) {
  if (!firebaseSettings.enabled || firebaseSettings.authEmulator || firebaseSettings.config.projectId !== 'registro-defensivo') throw Error('Proyecto/Auth real no coincide.');
  const rules = normalize(await readFile(new URL('firestore.rules', root), 'utf8'));
  if (!rulesCopy || normalize(await readFile(rulesCopy, 'utf8')) !== rules) throw Error('STOP: falta copia actual coincidente de reglas publicadas.');
  await mkdir(out, { recursive: true });
  let fixture;
  try { fixture = JSON.parse(await readFile(new URL('security-fixture.json', out), 'utf8')); }
  catch { fixture = { projectId: 'registro-defensivo', ownerHash: '726336902dfccda7', teamId: 'prueba8b2-seguridad-' + randomUUID(), rulesHash: createHash('sha256').update(rules).digest('hex') }; }
  if (fixture.rulesHash !== createHash('sha256').update(rules).digest('hex')) throw Error('Reglas distintas del fixture; revisar.');
  const allowed = ['tools/firebase/security-8b2.html', 'tools/firebase/security-8b2.mjs', 'tools/firebase/security-checks.mjs', 'js/firebase-config.js', 'js/firebase-auth.js'];
  const server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url, `http://localhost:${port}`).pathname;
      if (path === '/__security-fixture') { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify(fixture)); return; }
      if (path === '/__security-report' && req.method === 'POST') {
        if (req.headers.origin !== `http://localhost:${port}`) { res.writeHead(403).end(); return; }
        let text = ''; for await (const part of req) { text += part; if (text.length > 64000) throw Error(); }
        const report = JSON.parse(text);
        if (Object.keys(report).sort().join(',') !== 'checks,halted,role,uidHash' || !['owner', 'external', 'signed-out'].includes(report.role) || typeof report.halted !== 'boolean'
          || !(report.uidHash === null || /^[a-f0-9]{16}$/.test(report.uidHash)) || !Array.isArray(report.checks) || report.checks.length > 20
          || report.checks.some(x => Object.keys(x).sort().join(',') !== 'code,expected,name,result' || typeof x.name !== 'string' || x.name.length > 100 || !['allowed', 'denied'].includes(x.expected) || !['allowed', 'denied'].includes(x.result) || !(x.code === null || /^[a-z-]{1,40}$/.test(x.code)))) throw Error();
        await writeFile(new URL(`security-real-${report.role}-${Date.now()}.json`, out), JSON.stringify({ at: new Date().toISOString(), fixture, ...report }, null, 2));
        if (report.halted) fixture.halted = true;
        if (report.role === 'owner' && !report.halted) fixture.ownerCompleted = true;
        await writeFile(new URL('security-fixture.json', out), JSON.stringify(fixture, null, 2));
        res.writeHead(204).end(); return;
      }
      if (path === '/favicon.ico') { res.writeHead(204).end(); return; }
      const file = path === '/' ? allowed[0] : path.slice(1); if (!allowed.includes(file)) throw Error();
      res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' }).end(await readFile(new URL(file, root)));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  await writeFile(new URL('security-fixture.json', out), JSON.stringify(fixture, null, 2));
  return server;
}
if (process.argv[1]?.endsWith('security-8b2-server.mjs')) { await serveSecurity({ rulesCopy: process.argv[2] }); console.log('Solo seguridad ficticia: http://localhost:4197/ ; sin Hosting, sin base deportiva y sin operaciones automáticas.'); }
