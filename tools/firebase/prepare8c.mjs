// Limpieza del candidato aislado: ninguna red ni publicación.
import {readFile,writeFile} from 'node:fs/promises';
const root='.test-artifacts/publicacion8c-repo/';
function endCall(s,start){let depth=0,quote=null;for(let i=s.indexOf('(',start);i<s.length;i++){const c=s[i];if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote=null;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='(')depth++;if(c===')'&&--depth===0)return i;}throw Error('Llamada sin cerrar.');}
for(const file of ['app.js','js/sync-ui.js','js/sync-engine.js','js/sync-storage.js','js/firestore-sync.js']){
 let s=await readFile(root+file,'utf8');
 s=s.replace(/^import[^\n]+sync-diagnostics\.js[^\n]*\r?\n/gm,'');
 s=s.replace(/else syncTrace\([^;]*\);/g,'');
 while(s.includes('syncTrace(')){const start=s.indexOf('syncTrace('),end=endCall(s,start);if(s[end+1]!==';')throw Error('Traza fuera de sentencia.');s=s.slice(0,start)+s.slice(end+2);}
 while(s.includes('traceRemoteRead(')){const start=s.indexOf('traceRemoteRead('),end=endCall(s,start),args=s.slice(s.indexOf('(',start)+1,end);const body=args.replace(/^'[^']+',\s*\(\)\s*=>\s*/,'');if(body===args)throw Error('Lectura no reconocida.');s=s.slice(0,start)+body+s.slice(end+1);}
 await writeFile(root+file,s);
}
console.log('Instrumentación temporal retirada de cinco módulos; sin cambios de red o datos.');
