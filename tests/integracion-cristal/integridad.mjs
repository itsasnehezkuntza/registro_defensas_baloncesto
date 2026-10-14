import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),backup=new URL('.local-backups/integracion-cristal-20261014-063235/',root);
const get=p=>readFile(new URL(p,root));
const hash=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const before=JSON.parse((await readFile(new URL('integridad-inicial.json',backup),'utf8')).replace(/^\uFEFF/,''));
const runtime=[];
for(const entry of before){const equal=hash(await get(entry.path))===entry.sha256;runtime.push({path:entry.path,unchanged:equal});if(!['index.html','premium.css','app.js'].includes(entry.path))assert(equal,entry.path);}
const proposed=[];
async function compare(relative=''){
 for(const entry of await readdir(new URL('propuesta-aprobada/'+relative,backup),{withFileTypes:true})){
  const name=relative+entry.name;if(entry.isDirectory()){await compare(name+'/');continue;}
  assert.equal(hash(await readFile(new URL('propuesta-aprobada/'+name,backup))),hash(await get('tests/premium-cristal/'+name)),name);proposed.push(name);
 }
}
await compare();
const css=(await get('tests/premium-cristal/premium-anterior.css')).toString('utf8').replaceAll('../../fonts/','./fonts/')+'\n'+(await get('tests/premium-cristal/cristal.css')).toString('utf8');
assert.equal((await get('premium.css')).toString('utf8'),css);
await writeFile(new URL('integridad-final.json',import.meta.url),JSON.stringify({ok:true,runtime,approvedFilesUnchanged:proposed.length,approvedCssExact:true},null,2));
console.log('Módulos centrales y propuesta intactos; CSS aprobado exacto salvo rutas de fuentes.');
