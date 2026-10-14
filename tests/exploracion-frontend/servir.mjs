// Revisión local aislada. Nunca sirve app.js ni accede al almacenamiento.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root=new URL('../../',import.meta.url);
createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const relative=path==='/'?'tests/exploracion-frontend/comparacion.html':path.slice(1);
  if(relative==='favicon.ico'){res.writeHead(204).end();return;}
  if(!/^(tests\/exploracion-frontend\/(?:[\w.-]+\.(html|css|js)|capturas\/[\w.-]+\.png)|fonts\/[\w.-]+\.ttf)$/.test(relative)){res.writeHead(404).end();return;}
  const types={html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',ttf:'font/ttf',png:'image/png'};
  res.writeHead(200,{'Content-Type':types[relative.split('.').pop()],'Cache-Control':'no-store'}).end(await readFile(fileURLToPath(new URL(relative,root))));
 }catch{res.writeHead(404).end();}
}).listen(4182,'127.0.0.1',()=>console.log('Comparador local: http://127.0.0.1:4182/'));
