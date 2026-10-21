// Servidor local de pruebas, sin paquetes adicionales.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.argv[2] || 8080);
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const prefix = "/registro_defensas_baloncesto/";
    const relative = pathname.startsWith(prefix)
      ? "/.test-artifacts/pages/" + (pathname.slice(prefix.length) || "index.html")
      : pathname === "/" ? "/index.html" : pathname;
    const target = resolve(root, "." + relative);
    if (!target.startsWith(resolve(root) + sep)) { response.writeHead(403); response.end(); return; }
    const content = await readFile(target);
    response.setHeader("Content-Type", /\.(mjs|js)$/.test(target) ? "text/javascript" : target.endsWith(".html") ? "text/html; charset=utf-8" : target.endsWith(".css") ? "text/css" : "text/plain; charset=utf-8");
    response.end(content);
  } catch { response.writeHead(404); response.end(); }
}).listen(port, "127.0.0.1", () => console.log(`Servidor de pruebas: http://127.0.0.1:${port}`));
