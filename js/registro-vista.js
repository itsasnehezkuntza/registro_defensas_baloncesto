// Marcado del Registro compartido por la aplicación y la vista previa del editor (Fase 9B).
// Solo presentación: recibe la configuración y una función que da el resumen de cada destino.
import { attemptsMarkup, attemptsText } from './estadisticas.js';

export function htmlSafe(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}
const label = (name, stat) => `${name}: ${stat.attempts ? `${stat.made} anotados de ${stat.attempts} intentos` : 'sin tiros'}`;

// Botones de Transición o Estático. Se generan en lista plana; js/distribucion.js los agrupa en filas.
export function simpleActionsMarkup(category, actions, statFor, isChosen = () => false) {
  return actions.map(action => {
    const stat = statFor(action.id);
    return `<button type="button" class="action-btn" data-category="${category}" data-action="${htmlSafe(action.id)}" aria-pressed="${isChosen(action.id)}" title="${htmlSafe(action.name)}" aria-label="${htmlSafe(label(action.name, stat))}">
      <span class="action-name">${htmlSafe(action.name)}</span>
      <span class="action-score">${attemptsMarkup(stat)}</span>
    </button>`;
  }).join('');
}

// Matriz de Bloqueo directo: tipos en filas y defensas como cabecera de columna.
export function directMatrixMarkup(actions, { statFor, typeStat, chosen = null, isChosen = () => false }) {
  const defenses = actions[0]?.defenses ?? [];
  // Los encabezados comunes solo son válidos si todos los tipos comparten el mismo eje de defensas.
  const sharedAxis = actions.length > 0 && actions.every(action => action.defenses.length === defenses.length &&
    action.defenses.every((defense, index) => defense.id === defenses[index].id));
  const selected = chosen?.category === 'directo' ? chosen : null;
  const headings = sharedAxis ? defenses.map(defense => `<span class="defense-heading${selected?.strategyId === defense.id ? ' is-axis-selected' : ''}" data-defense-heading="${htmlSafe(defense.id)}" title="${htmlSafe(defense.name)}"><span class="defense-heading-text">${htmlSafe(defense.name).replace(/([+/])/g, "$1<wbr>")}</span></span>`).join('') : '';
  const rows = actions.map(action => {
    const chips = action.defenses.map(defense => {
      const stat = statFor(action.id, defense.id);
      return `<button type="button" class="defense-btn" data-category="directo" data-action="${htmlSafe(action.id)}" data-strategy="${htmlSafe(defense.id)}" aria-pressed="${isChosen(action.id, defense.id)}" title="${htmlSafe(`${action.name} · ${defense.name}`)}">
        <span class="defense-name">${htmlSafe(action.name)} · ${htmlSafe(defense.name)}: </span>
        <span class="defense-score">${attemptsMarkup(stat)}</span>
      </button>`;
    }).join('');
    return `<div class="direct-row${selected?.actionId === action.id ? ' is-axis-selected' : ''}">
      <div class="direct-type" title="${htmlSafe(action.name)}"><strong>${htmlSafe(action.name)}</strong><span>${attemptsMarkup(typeStat(action.id))}</span></div>
      <div class="defense-options">${chips}</div>
    </div>`;
  }).join('');
  return `<div class="direct-matrix${sharedAxis ? '' : ' is-irregular'}"><div class="direct-matrix-inner" style="--cols:${Math.max(1, defenses.length)};--rows:${Math.max(1, actions.length)}">
    ${headings ? `<div class="direct-matrix-head"><span class="direct-corner" aria-hidden="true"></span><div class="defense-headings">${headings}</div></div>` : ''}
    ${rows}
  </div></div>`;
}

export { attemptsText };
