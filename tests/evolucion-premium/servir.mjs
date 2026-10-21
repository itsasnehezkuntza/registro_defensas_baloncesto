import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
export const server=createServer(async(req,res)=>{
 try{
 const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 if(path==='/'){res.writeHead(302,{Location:'/tests/evolucion-premium/index.html'}).end();return;}
 const relative=path==='/'?'tests/evolucion-premium/index.html':path.slice(1);
 if(relative==='favicon.ico'){res.writeHead(204).end();return;}
 if(!/^(tests\/evolucion-premium\/(?:[\w.-]+\.(html|css|js)|capturas\/[\w.-]+\.png)|fonts\/[\w.-]+\.ttf)$/.test(relative)){res.writeHead(404).end();return;}
 const types={html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',ttf:'font/ttf',png:'image/png'};
 res.writeHead(200,{'Content-Type':types[relative.split('.').pop()],'Cache-Control':'no-store'}).end(await readFile(new URL(relative,root)));
 }catch{res.writeHead(404).end();}
});
if(process.argv[1]?.endsWith('servir.mjs'))server.listen(4183,'127.0.0.1',()=>console.log('Propuesta premium: http://127.0.0.1:4183/'));
