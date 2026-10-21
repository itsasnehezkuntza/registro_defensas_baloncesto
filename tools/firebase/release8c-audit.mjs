import assert from'node:assert/strict';import{readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';import{execFileSync,spawnSync}from'node:child_process';import{posix}from'node:path';
const dir='.test-artifacts/firebase/fase8c/',root='.test-artifacts/publicacion8c-repo/',assets=JSON.parse(await readFile(dir+'assets.json','utf8')),known=new Set(assets),manifest=[];
assert.equal(assets.length,35);
for(const file of assets){
 const bytes=await readFile(root+file),source=bytes.toString('utf8');assert(!/(^\.|\.(json|md|rules|env|map)$|^(tests|tools)\/)/i.test(file)||file==='.nojekyll');
 if(!file.endsWith('.ttf'))assert(!/-----BEGIN [^-]*PRIVATE KEY-----|"type"\s*:\s*"service_account"|"private_key"\s*:|"refresh_token"\s*:/.test(source));
 if(file.endsWith('.js')){assert(!/sync-diagnostics|syncTrace\(|traceRemoteRead\(|diagnostic8b|preview-account/.test(source),file);const checked=spawnSync(process.execPath,['--check',root+file],{encoding:'utf8'});assert.equal(checked.status,0,file+' '+checked.stderr);for(const m of source.matchAll(/(?:from\s*|import\s*\()(['"])([^'"]+)\1/g)){const path=m[2];if(path.startsWith('.'))assert(known.has(posix.normalize(posix.join(posix.dirname(file),path))),file+' → '+path);else assert(path.startsWith('https://www.gstatic.com/firebasejs/12.11.0/'),path);}}
 manifest.push({file,sha256:createHash('sha256').update(bytes).digest('hex')});
}
const norm=s=>s.replace(/\r\n/g,'\n');
for(const file of ['styles.css','registro.css','dashboard.css','editor.css','categorias.csv','js/estadisticas.js','js/dashboard.js','js/registro.js','js/configuracion.js','js/editor.js','js/distribucion.js','js/configuracion-guardada.js','js/exportacion.js','js/identidad.js'])assert.equal(norm(await readFile(root+file,'utf8')),norm(execFileSync('git',['show','origin/main:'+file],{encoding:'utf8'})),file+' cambió fuera del alcance.');
const flags=await readFile(root+'js/sync-config.js','utf8');assert(/enabled:\s*true/.test(flags)&&/allowRealWrites:\s*true/.test(flags)&&/emulator:\s*false/.test(flags));
await writeFile(dir+'manifest.json',JSON.stringify({version:'8C.0',files:manifest,privateCredentials:false,diagnostics:false,designAndSportUnchanged:true},null,2));console.log(JSON.stringify({files:35,privateCredentials:false,diagnostics:false,designAndSportUnchanged:true,syntaxAndImports:true}));
