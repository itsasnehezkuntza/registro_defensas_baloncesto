// Servidor efímero de pruebas, solo loopback y archivos explícitos.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const root = new URL('../../', import.meta.url);
const releaseRoot = process.env.DEFENSAS_RELEASE_8C === '1'
  ? new URL('../../.test-artifacts/publicacion8c-repo/', import.meta.url) : root;
export async function startServer(port = 4198) {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      if (path === '/favicon.ico') { res.writeHead(204).end(); return; }
      const prefix = '/registro_defensas_baloncesto/';
      const packaged = path.startsWith(prefix);
      const asset = packaged ? path.slice(prefix.length) || 'index.html' : path === '/' ? 'index.html' : path.slice(1);
      const realAuthPage = !packaged && /^tools\/firebase\/validacion-real\.(html|js)$/.test(asset);
      if (!realAuthPage && !/^(index\.html|app\.js|[\w-]+\.css|categorias\.csv|js\/[\w-]+\.js|fonts\/[\w-]+\.(ttf|txt)|tests\/[\w-]+\.(html|mjs|csv))$/.test(asset)) {
        res.writeHead(404).end(); return;
      }
      let body = await readFile(new URL((packaged ? '.test-artifacts/pages/' : '') + asset,
        !packaged && !asset.startsWith('tests/') && !asset.startsWith('tools/') ? releaseRoot : root));
      // Excepción exclusiva de emuladores lanzados por emuladores.mjs. Se
      // sirve desde el propio servidor loopback, sin alterar los archivos ni
      // interceptar la navegación (Chromium valida el acceso a red local).
      if (asset === 'index.html' && process.env.DEFENSAS_TEST_EMULATOR_CSP === '1') {
        body = Buffer.from(body.toString('utf8').replace(/(connect-src [^;]+)(;)/, '$1 http://127.0.0.1:9099 http://127.0.0.1:8085$2')
          .replace(/(frame-src [^;]+)(;)/, '$1 http://127.0.0.1:9099$2'));
      }
      const ext = asset.split('.').pop();
      res.writeHead(200, { 'Content-Type': ({ html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8',
        mjs: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', csv: 'text/csv; charset=utf-8', ttf: 'font/ttf' })[ext] || 'text/plain', 'Cache-Control': 'no-store' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((ok, fail) => { server.once('error', fail); server.listen(port, '127.0.0.1', ok); });
  return server;
}
