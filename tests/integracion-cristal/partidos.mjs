import assert from 'node:assert/strict';
export async function verifyGames(browser) {
 const context=await browser.newContext();
 try {
  const page=await context.newPage();
  const ready=p=>p.waitForFunction(()=>!document.querySelector('#gameSelect').disabled);
  const total=(p,n)=>p.waitForFunction(n=>document.querySelector('#statsResults')?.textContent === (n ? '0/1' : '—'),n);
  await page.goto('http://127.0.0.1:4190/');await ready(page);
  async function create(name){await page.locator('#newGameBtn').click();await page.locator('#roundInput').fill('1');await page.locator('#rivalInput').fill(name);await page.locator('#createGameBtn').click();await ready(page);return page.locator('#gameSelect').inputValue();}
  const first=await create('Prueba A');
  await page.locator('.action-btn').first().click();await page.locator('.result-btn[data-points="2"][data-result="anotado"]').click();await ready(page);
  await page.locator('#viewToggle').click();await total(page,1);assert.equal(await page.locator('#statsResults').textContent(),'0/1');
  const second=await create('Prueba B');await total(page,0);
  await page.locator('#gameSelect').selectOption(first);await ready(page);await total(page,1);
  const peer=await context.newPage();await peer.goto('http://127.0.0.1:4190/#estadisticas');await ready(peer);await total(peer,1);
  await page.locator('#gameSelect').selectOption(second);await ready(page);await total(page,0);await total(peer,0);
  await page.locator('#gameSelect').selectOption(first);await ready(page);await total(peer,1);
  await peer.locator('#undoBtn').click();await ready(peer);await total(peer,0);await total(page,0);
  await page.locator('#deleteGameBtn').click();await page.locator('#cancelDeleteBtn').click();assert.equal(await page.locator('#gameSelect').inputValue(),first);
  await page.locator('#deleteGameBtn').click();await page.locator('#confirmDeleteBtn').click();await ready(page);
  const state=await page.evaluate(async()=>{const s=await import('./js/persistencia.js');return s.readState();});
  assert.equal(state.games.length,1);assert.equal(state.games[0].id,second);
  await page.locator('#gameSelect').selectOption(second);await ready(page);await total(page,0);
  await page.reload();await ready(page);await total(page,0);assert(await page.locator('#statisticsView').isVisible());
  const sub=await context.newPage();await sub.goto('http://127.0.0.1:4190/registro_defensas_baloncesto/#estadisticas');await ready(sub);await total(sub,0);
  assert.equal(await sub.locator('.stat-panel').first().evaluate(el=>getComputedStyle(el).backdropFilter),'blur(22px)');
  return {ok:true,isolation:true,crossTab:true,undo:true,deleteOnlySelected:true,reload:true,pagesSubpath:true};
 }finally{await context.close();}
}
