// Servidor de desarrollo limitado a los archivos de la aplicación y a loopback.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
const types = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', csv: 'text/csv; charset=utf-8', ttf: 'font/ttf', txt: 'text/plain; charset=utf-8' };
createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://127.0.0.1').pathname;
    const relative = path === '/' ? 'index.html' : path.slice(1);
    if (!/^(index\.html|app\.js|styles\.css|premium\.css|dashboard\.css|categorias\.csv|js\/[\w-]+\.js|fonts\/[\w-]+\.(ttf|txt))$/.test(relative)) {
      res.writeHead(404).end(); return;
    }
    const data = await readFile(fileURLToPath(new URL(relative, root)));
    res.writeHead(200, { 'Content-Type': types[relative.split('.').pop()], 'Cache-Control': 'no-store' }).end(data);
  } catch { res.writeHead(404).end(); }
}).listen(4173, '127.0.0.1', () => {
  console.log('Aplicación local: http://127.0.0.1:4173');
  process.send?.('ready');
});
