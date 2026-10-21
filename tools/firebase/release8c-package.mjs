// Rama Pages con solo assets públicos. No hace push ni cambia configuración remota.
import{execFileSync}from'node:child_process';import{mkdir,readFile,writeFile}from'node:fs/promises';import{resolve,dirname}from'node:path';import{createHash}from'node:crypto';import assert from'node:assert/strict';
const dir='.test-artifacts/firebase/fase8c/',assets=JSON.parse(await readFile(dir+'assets.json','utf8')),previous=JSON.parse(await readFile(dir+'previous.json','utf8'));
const git=(args,options={})=>execFileSync('git',args,{maxBuffer:8*1024*1024,...options});
const source=git(['rev-parse','publicacion/fase8c'],{encoding:'utf8'}).trim();assert.equal(git(['rev-parse',source+'^'],{encoding:'utf8'}).trim(),previous.previous);
const files=[];
for(const file of assets){const bytes=git(['show',source+':'+file]);await mkdir(dirname(dir+'pages/'+file),{recursive:true});await writeFile(dir+'pages/'+file,bytes);files.push({file,sha256:createHash('sha256').update(bytes).digest('hex')});}
const info={version:'8C.0',sourceCommit:source,previousCommit:previous.previous,builtAt:new Date().toISOString()};
const metadata=Buffer.from(JSON.stringify(info,null,2)+'\n');await writeFile(dir+'pages/version.json',metadata);files.push({file:'version.json',sha256:createHash('sha256').update(metadata).digest('hex')});
assert.equal(files.length,36);assert(!files.some(f=>/tools\/|tests\/|diagnostic|\.md$|\.env|rules$/.test(f.file)));
const env={...process.env,GIT_INDEX_FILE:resolve(dir+'pages.index')};git(['read-tree','--empty'],{env});
for(const {file}of files){const bytes=await readFile(dir+'pages/'+file),oid=git(['hash-object','-w','--stdin'],{input:bytes,encoding:'utf8'}).trim();git(['update-index','--add','--cacheinfo','100644,'+oid+','+file],{env});}
const tree=git(['write-tree'],{env,encoding:'utf8'}).trim();
const commit=git(['commit-tree',tree],{input:'deploy: publica 8C.0 en GitHub Pages (origen '+source.slice(0,7)+')\n',encoding:'utf8'}).trim();
git(['update-ref','refs/heads/gh-pages',commit,'0000000000000000000000000000000000000000']);
await writeFile(dir+'package.json',JSON.stringify({...info,pagesCommit:commit,tree,files},null,2));console.log(JSON.stringify({...info,pagesCommit:commit,files:files.length}));
