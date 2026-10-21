// Solo repositorio autorizado. Credencial Git en memoria, nunca impresa o guardada.
import{spawnSync}from'node:child_process';import{readFile,writeFile}from'node:fs/promises';import assert from'node:assert/strict';
const mode=process.argv[2];assert(['inspect','switch','status','build'].includes(mode));
const r=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0'}});assert.equal(r.status,0,'Falta credencial Git.');
const fields=Object.fromEntries(r.stdout.trim().split('\n').map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)]}));assert(fields.password);
const base='https://api.github.com/repos/itsasnehezkuntza/registro_defensas_baloncesto',dir='.test-artifacts/firebase/fase8c/';
async function api(path,method='GET',body){const res=await fetch(base+path,{method,headers:{Authorization:'Bearer '+fields.password,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});const raw=await res.text(),d=raw?JSON.parse(raw):{};assert(res.ok,'GitHub '+res.status+': '+(d.message||''));return d;}
let pages=await api('/pages');
if(mode==='switch'){
 const pkg=JSON.parse(await readFile(dir+'package.json','utf8')),old=JSON.parse(await readFile(dir+'previous.json','utf8'));
 assert.equal(pages.source.branch,'main');assert.equal(pages.source.path,'/');
 assert.equal((await api('/git/ref/heads/main')).object.sha,old.previous);
 assert.equal((await api('/git/ref/heads/gh-pages')).object.sha,pkg.pagesCommit);
 assert.equal((await api('/git/ref/heads/respaldo/antes-fase8c-20261017')).object.sha,old.previous);
 await api('/pages','PUT',{source:{branch:'gh-pages',path:'/'}});
 pages=await api('/pages');
}
const report={checkedAt:new Date().toISOString(),url:pages.html_url,source:pages.source,buildType:pages.build_type,status:pages.status,mode};
if(mode==='build'){
 const pkg=JSON.parse(await readFile(dir+'package.json','utf8'));assert.equal(pages.source.branch,'gh-pages');assert.equal((await api('/git/ref/heads/gh-pages')).object.sha,pkg.pagesCommit);
 const result=await api('/pages/builds','POST');report.requestedStatus=result.status;
}
if(mode==='status'){const b=await api('/pages/builds/latest');report.build={commit:b.commit,status:b.status,error:b.error?.message,updatedAt:b.updated_at};}
await writeFile(dir+'github-'+mode+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
