// Solo geometría: reservar la altura real de la barra, incluso con texto ampliado.
export function initializeLayout() {
  const dock = document.querySelector(".result-dock");
  if (!dock?.getBoundingClientRect || !document.documentElement?.style) return;
  const update = () => {
    // offsetHeight está en píxeles CSS de layout (no incluye transformaciones/zoom).
    document.documentElement.style.setProperty("--dock-height", `${Math.ceil(dock.offsetHeight)}px`);
  };
  update();
  if (globalThis.ResizeObserver) new ResizeObserver(update).observe(dock);
  else window.addEventListener("resize", update);
}

// Menú «⋯» accesible sin dependencias: Escape o pulsar fuera lo cierran.
export function initializeMenu() {
  const button = document.querySelector("#moreBtn");
  const menu = document.querySelector("#moreMenu");
  if (!button?.setAttribute || !menu || !document.addEventListener) return;
  const setOpen = (open, restoreFocus = false) => {
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    if (open) menu.querySelector("button:not([hidden]):not(:disabled)")?.focus();
    else if (restoreFocus) button.focus();
  };
  button.addEventListener("click", () => setOpen(menu.hidden));
  // Editar botones, exportar y eliminar cierran el menú; el diálogo de eliminar toma el foco.
  menu.addEventListener("click", event => {
    if (event.target.closest("#editButtonsBtn, #exportCsvBtn, #deleteGameBtn")) setOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) setOpen(false, true);
  });
  document.addEventListener("pointerdown", event => {
    if (!menu.hidden && !menu.contains(event.target) && !button.contains(event.target)) setOpen(false);
  });
}
