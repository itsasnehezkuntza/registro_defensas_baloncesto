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
