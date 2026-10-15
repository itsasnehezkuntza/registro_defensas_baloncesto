// Distribución adaptable del Registro (Fase 9B). Sin datos deportivos: solo geometría.
// Pasos, en orden, hasta que todo cabe sin desplazamiento:
//   0 completo · 1 sin contador · 2 márgenes y letra mínimos · 3 nombres con puntos suspensivos.
export const FIT_STEPS = Object.freeze(['completo', 'sin contador', 'compacto', 'nombres recortados']);
export const MIN_TARGET = 44;

// Reparte n botones en filas cuya diferencia es como mucho 1 (5 → 3+2, 7 → 4+3).
export function balancedRows(count, rows) {
  const total = Math.max(0, count), used = Math.max(1, Math.min(rows, total || 1));
  const base = Math.floor(total / used), extra = total % used;
  return Array.from({ length: total ? used : 0 }, (_, index) => base + (index < extra ? 1 : 0));
}

// Orden de preferencia de filas para la franja superior: el diseño V4 usa 2.
export function rowCandidates(maxButtons) {
  return [2, 3, 1, 4, 5, 6].filter(rows => rows <= Math.max(1, maxButtons));
}

const columnsFor = (count, rows) => Math.max(1, Math.ceil(count / Math.max(1, rows)));

// Agrupa los botones existentes en filas sin recrearlos: conserva foco y escuchadores delegados.
export function groupRows(list, rows) {
  if (!list?.querySelectorAll) return;
  const buttons = [...list.querySelectorAll('.action-btn')];
  const sizes = balancedRows(buttons.length, rows);
  const current = [...list.children].map(row => row.children.length);
  if (current.length === sizes.length && current.every((n, i) => n === sizes[i]) && list.children[0]?.classList?.contains('action-row')) return;
  const focused = document.activeElement;
  const fragment = document.createDocumentFragment();
  let index = 0;
  for (const size of sizes) {
    const row = document.createElement('div');
    row.className = 'action-row';
    for (let i = 0; i < size; i++) row.append(buttons[index++]);
    fragment.append(row);
  }
  list.replaceChildren(fragment);
  if (focused && list.contains(focused)) focused.focus({ preventScroll: true });
}

function overflowing(element) {
  return element.scrollWidth > element.clientWidth + 1;
}

// Comprueba en el DOM real: alto disponible, textos, matriz y objetivos táctiles.
export function measureFit(root, { level, checkHeight }) {
  const problems = [];
  if (checkHeight && root.scrollHeight > root.clientHeight + 1) problems.push('alto');
  const matrix = root.querySelector('.direct-matrix-inner');
  if (matrix && !root.classList.contains('is-narrow') && overflowing(matrix)) problems.push('ancho de matriz');
  for (const button of root.querySelectorAll('.action-btn, .defense-btn')) {
    const box = button.getBoundingClientRect();
    if (box.width < MIN_TARGET - 0.5 || box.height < MIN_TARGET - 0.5) { problems.push('objetivo < 44 px'); break; }
  }
  // Hasta el paso 2 los nombres deben verse completos; en el 3 se recortan con «…».
  if (level < 3) {
    for (const name of root.querySelectorAll('.action-name, .direct-type strong, .defense-heading-text')) {
      if (name.getClientRects().length && overflowing(name)) { problems.push('nombre recortado'); break; }
    }
  }
  if (level === 0) {
    for (const score of root.querySelectorAll('.action-btn, .defense-btn, .direct-type')) {
      if (score.getClientRects().length && overflowing(score)) { problems.push('contador'); break; }
    }
  }
  return problems;
}

// Prueba pasos y filas en orden de prioridad y se queda en el primero que cabe.
// Devuelve { level, rows, fits, problems }. Sirve para la aplicación y para la vista previa del editor.
export function fitRegistro(root, { narrow = false, checkHeight = true } = {}) {
  if (!root?.querySelector || !root.getClientRects?.().length) return null;
  const transition = root.querySelector('[data-fit-list="transicion"]');
  const fixed = root.querySelector('[data-fit-list="estatico"]');
  const top = root.querySelector('.top-grid');
  const nT = transition?.querySelectorAll('.action-btn').length ?? 0;
  const nS = fixed?.querySelectorAll('.action-btn').length ?? 0;
  root.classList.toggle('is-narrow', narrow);
  // Tablet vertical: el título de Bloqueo directo va encima de la matriz y las cabeceras pueden ocupar dos líneas.
  const medium = !narrow && root.clientWidth < 960;
  root.classList.toggle('is-medium', medium);
  const apply = (level, rows) => {
    root.dataset.fit = String(level);
    const heading = root.querySelector('.direct-panel > .panel-heading'), matrix = root.querySelector('.direct-matrix-inner');
    if (narrow) {
      // Móvil: cada sección en filas de dos, a lo ancho; se permite desplazamiento vertical.
      groupRows(transition, Math.ceil(nT / 2)); groupRows(fixed, Math.ceil(nS / 2));
      if (top) top.style.gridTemplateColumns = '';
      matrix?.style.setProperty('--corner-w', '0px');
      return;
    }
    groupRows(transition, rows); groupRows(fixed, rows);
    // El título de Bloqueo directo ocupa la esquina de la matriz: se reserva su ancho real.
    if (medium) matrix?.style.setProperty('--corner-w', '0px');
    else if (heading && matrix) matrix.style.setProperty('--corner-w', `${Math.ceil(heading.getBoundingClientRect().width) + 8}px`);
    // Ancho de cada sección proporcional a las columnas que necesita.
    if (top) top.style.gridTemplateColumns = `minmax(0, ${columnsFor(nT, rows)}fr) minmax(0, ${columnsFor(nS, rows)}fr)`;
  };
  const candidates = narrow ? [0] : rowCandidates(Math.max(nT, nS));
  let fallback = null;
  for (let level = 0; level < FIT_STEPS.length; level++) {
    for (const rows of candidates) {
      apply(level, rows);
      const problems = measureFit(root, { level, checkHeight: checkHeight && !narrow });
      if (!problems.length) return { level, step: FIT_STEPS[level], rows, fits: true, problems };
      if (level === FIT_STEPS.length - 1 && (!fallback || problems.length < fallback.problems.length)) fallback = { rows, problems };
    }
  }
  apply(FIT_STEPS.length - 1, fallback.rows);
  return { level: FIT_STEPS.length - 1, step: FIT_STEPS.at(-1), rows: fallback.rows, fits: false, problems: fallback.problems };
}
