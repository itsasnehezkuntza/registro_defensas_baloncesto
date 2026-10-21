import assert from "node:assert/strict";
import { summarize, statText, statMarkup, pointsText, outcomeText } from "../js/estadisticas.js";
for (const [missed,made,expected] of [[7,3,"7–3 · 70%"],[0,5,"0–5 · 0%"],[5,0,"5–0 · 100%"],[0,0,"—"],[1,2,"1–2 · 33%"]]) {
  const events=Object.freeze([...Array.from({length:missed},()=>Object.freeze({resultado:"fallado",valor_tiro:3})),...Array.from({length:made},()=>Object.freeze({resultado:"anotado",valor_tiro:2}))]);
  const stat=Object.freeze(summarize(events));
  assert.equal(statText(stat),expected);
  assert.equal(statMarkup(stat).replace(/<[^>]*>/g,""),expected);
  assert.equal(stat.pointsAllowed,made*2);
  assert.equal(pointsText(stat), stat.attempts ? String(made * 2) : '—');
  assert.equal(outcomeText(stat), stat.attempts ? `${missed}/${made}` : '—');
  if(stat.attempts) {
    assert.ok(statMarkup(stat).includes('<span class="stat-missed">'+missed+'</span>'));
    assert.ok(statMarkup(stat).includes('<span class="stat-made">'+made+'</span>'));
  }
}
assert.equal(pointsText(summarize([{resultado:'anotado',valor_tiro:2},{resultado:'anotado',valor_tiro:3},{resultado:'fallado',valor_tiro:3}])), '5');
assert.equal(outcomeText(summarize([{resultado:'anotado',valor_tiro:2},{resultado:'anotado',valor_tiro:3}, ...[2,3,2,3].map(valor_tiro => ({resultado:'fallado',valor_tiro}))])), '4/2');
console.log("✓ Estadísticas: proporción, cero intentos, redondeo, colores y puntos originales");
