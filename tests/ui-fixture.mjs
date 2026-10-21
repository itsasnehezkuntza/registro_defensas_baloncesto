export function assert(condition, message) { if (!condition) throw new Error(message); }
const pause = () => new Promise(resolve => setTimeout(resolve, 25));
export async function until(fn) {
  for (let i = 0; i < 400; i++) { if (fn()) return; await pause(); }
  throw new Error("Tiempo agotado esperando la interfaz");
}
export async function page(tab = false, variant = "") {
  let frame;
  if (tab) {
    const popup = window.open("about:blank", "_blank");
    assert(popup, "No se pudo abrir la segunda pestaña de pruebas");
    frame = {
      contentWindow: popup,
      get contentDocument() { return popup.document; },
      set src(url) { popup.location.href = url; }
    };
  } else {
    frame = document.createElement("iframe");
    frame.style.cssText = "width:1200px;height:850px";
    document.body.append(frame);
  }
  // Fase 10: usuario que ya eligió «Continuar sin cuenta» (la pantalla de inicio se prueba aparte).
  try { localStorage.setItem("defensas-account-mode", "local"); } catch {}
  async function load() {
    const previousDocument = frame.contentDocument;
    frame.src = new URL(variant ? "./config-page.html?variant=" + variant + "&t=" + crypto.randomUUID() : "../index.html?t=" + crypto.randomUUID(), location.href).href;
    await until(() => frame.contentDocument !== previousDocument &&
      frame.contentDocument.querySelector("#newGameBtn")?.disabled === false);
  }
  await load();
  const q = selector => frame.contentDocument.querySelector(selector);
  const all = selector => [...frame.contentDocument.querySelectorAll(selector)];
  const idle = () => until(() => !q("#gameSelect").disabled);
  async function select(id) { q("#gameSelect").value = id; q("#gameSelect").dispatchEvent(new Event("change")); await idle(); }
  async function create(round, rival) {
    q("#newGameBtn").click();
    await idle();
    q("#roundInput").value = round; q("#rivalInput").value = rival;
    q("#newGameForm").requestSubmit(); q("#newGameForm").requestSubmit();
    await idle(); return q("#gameSelect").value;
  }
  async function shoot() {
    q('[data-category="directo"][data-action="pr_roller"][data-strategy="blue"]').click();
    assert(q('[data-points="3"]').disabled, "Roller habilitó 3P");
    q('[data-points="2"][data-result="fallado"]').click(); await idle();
  }
  return { frame, q, all, idle, load, select, create, shoot };
}
