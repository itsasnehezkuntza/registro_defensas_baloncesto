// Navegación local sin nuevas escrituras: el hash permite recarga y atrás/adelante.
export function initializeViews(onChange) {
  const button = document.querySelector('#viewToggle');
  if (!button?.getAttribute) return; // Fixtures antiguos sin navegación.
  const record = document.querySelector('#registrationView');
  const stats = document.querySelector('#statisticsView');
  const dock = document.querySelector('.result-dock');
  const positions = { registro: 0, estadisticas: 0 };
  let current = null;
  function show() {
    const next = location.hash === '#estadisticas' ? 'estadisticas' : 'registro';
    if (current === next) return;
    if (current) positions[current] = window.scrollY;
    current = next;
    record.hidden = next !== 'registro';
    stats.hidden = next !== 'estadisticas';
    dock.hidden = next !== 'registro';
    document.body.dataset.view = next;
    const label = next === 'registro' ? 'Estadísticas' : 'Registro';
    button.querySelector('span').textContent = label;
    button.setAttribute('aria-label', `Ver ${label.toLowerCase()}`);
    document.title = `${next === 'registro' ? 'Registro defensivo' : 'Estadísticas'} · Baloncesto`;
    onChange(next);
    window.scrollTo(0, positions[next]);
  }
  button.disabled = false;
  button.addEventListener('click', () => {
    location.hash = current === 'registro' ? 'estadisticas' : 'registro';
  });
  window.addEventListener('hashchange', show);
  show();
}
