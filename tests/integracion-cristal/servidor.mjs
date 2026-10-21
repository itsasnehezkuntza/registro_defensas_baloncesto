import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
export const server=createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  if(path==='/favicon.ico'){res.writeHead(204).end();return;}
  let relative=path==='/'?'index.html':path.slice(1);
  if(relative.startsWith('registro_defensas_baloncesto/')){
   const asset=relative.slice('registro_defensas_baloncesto/'.length)||'index.html';
   if(!/^(index\.html|app\.js|[\w-]+\.css|categorias\.csv|js\/[\w-]+\.js|fonts\/[\w-]+\.(ttf|txt))$/.test(asset)){res.writeHead(404).end();return;}
   relative='.test-artifacts/pages/'+asset;
  }else if(!/^(index\.html|app\.js|styles\.css|premium\.css|dashboard\.css|cuenta\.css|categorias\.csv|js\/[\w-]+\.js|fonts\/[\w-]+\.(ttf|txt)|tests\/(?:[\w-]+\.(html|mjs|csv)|(?:premium-cristal|integracion-cristal)\/(?:[\w.-]+\.(html|css|js)|capturas\/[\w.-]+\.png)))$/.test(relative)){res.writeHead(404).end();return;}
  const data=await readFile(new URL(relative,root));
  res.writeHead(200,{'Content-Type':{html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',mjs:'text/javascript',csv:'text/csv; charset=utf-8',ttf:'font/ttf',png:'image/png'}[relative.split('.').pop()]||'text/plain','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end();}
});
if(process.argv[1]?.endsWith('servidor.mjs'))server.listen(4191,'127.0.0.1',()=>console.log('Aplicación integrada: http://127.0.0.1:4191/'));
