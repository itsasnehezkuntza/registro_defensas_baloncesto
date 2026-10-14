import { firebaseSettings } from "./firebase-config.js";
import { createAccountController } from "./cuenta.js";

const login = document.querySelector("#googleLogin");
const logout = document.querySelector("#googleLogout");
const retry = document.querySelector("#accountRetry");
const identity = document.querySelector("#accountIdentity");
const message = document.querySelector("#accountMessage");
const local = document.querySelector("#continueLocal");
const controller = createAccountController({
  settings: firebaseSettings,
  loadAdapter: async settings => (await import("./firebase-auth.js")).createWebAuth(settings)
});
controller.subscribe(state => {
  login.hidden = Boolean(state.user);
  login.disabled = state.status !== "ready" || state.busy;
  login.textContent = state.status === "loading" ? "Cargando cuenta…" :
    state.busy && !state.user ? "Conectando…" : "Iniciar sesión con Google";
  logout.hidden = !state.user;
  logout.disabled = state.status !== "ready" || state.busy;
  identity.hidden = !state.user;
  identity.textContent = state.user ? (state.user.email || state.user.displayName || "Cuenta de Google conectada") : "";
  identity.title = state.user?.displayName || "";
  retry.hidden = state.status !== "error";
  message.textContent = state.error || (state.status === "disabled"
    ? "Google pendiente de configuración. Puedes continuar sin cuenta."
    : state.user ? "Cuenta conectada. Los partidos siguen solo en este navegador; todavía no se suben." : "");
  message.hidden = !message.textContent;
  local.hidden = !state.error;
  // No se modifica saveStatus: solo app.js puede confirmar el guardado IndexedDB.
  document.querySelector("#cloudStatus").textContent = "Solo local";
});
login.addEventListener("click", () => { void controller.act("login"); });
logout.addEventListener("click", () => { void controller.act("logout"); });
retry.addEventListener("click", () => { void controller.start(); });
local.addEventListener("click", () => { message.hidden = true; local.hidden = true; });
void controller.start();
