// Navegación local sin nuevas escrituras: el hash permite recarga y atrás/adelante.
// Fase 9B: vista «#editar» (editor de botones) con guarda para cambios sin guardar.
const VIEWS = { '#estadisticas': 'estadisticas', '#editar': 'editar' };
const TITLES = { registro: 'Registro defensivo', estadisticas: 'Estadísticas', editar: 'Editar panel' };

export function initializeViews(onChange, { canLeave = () => true } = {}) {
  const group = document.querySelector('#viewToggle');
  if (!group?.getAttribute || !group.querySelectorAll) return { go() {} }; // Fixtures antiguos sin navegación.
  const buttons = [...group.querySelectorAll('button[data-view]')];
  const record = document.querySelector('#registrationView');
  const stats = document.querySelector('#statisticsView');
  const editor = document.querySelector('#editorView');
  const dock = document.querySelector('.result-dock');
  const positions = { registro: 0, estadisticas: 0, editar: 0 };
  let current = null;
  function show() {
    const next = VIEWS[location.hash] ?? 'registro';
    if (current === next) return;
    // Salir del editor con cambios pide confirmación; mientras tanto se mantiene la vista.
    if (current && !canLeave(next)) {
      history.pushState(null, '', current === 'registro' ? location.pathname + location.search : `#${current}`);
      return;
    }
    if (current) positions[current] = window.scrollY;
    current = next;
    record.hidden = next !== 'registro';
    stats.hidden = next !== 'estadisticas';
    if (editor) editor.hidden = next !== 'editar';
    dock.hidden = next !== 'registro';
    document.body.dataset.view = next;
    // aria-current: es navegación entre vistas, no un interruptor.
    for (const button of buttons) {
      if (button.dataset.view === next) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    document.title = `${TITLES[next]} · Baloncesto`;
    onChange(next);
    window.scrollTo(0, positions[next]);
  }
  const go = view => { if (view !== current) location.hash = view; };
  for (const button of buttons) button.disabled = false;
  group.addEventListener('click', event => {
    const button = event.target.closest('button[data-view]');
    if (button && !button.disabled) go(button.dataset.view);
  });
  window.addEventListener('hashchange', show);
  show();
  return { go, current: () => current };
}
