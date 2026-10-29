// Controlador de Authentication sin DOM ni datos deportivos. La UI exige equipo
// antes de registrar con cuenta; los históricos requieren confirmación aparte.
export function authErrorText(error) {
  return ({
    "auth/popup-blocked": "Safari o el navegador ha bloqueado la ventana. Permite ventanas emergentes para este sitio y vuelve a pulsar Iniciar sesión con Google.",
    "auth/popup-closed-by-user": "Se ha cerrado la ventana sin completar el acceso. Puedes volver a intentarlo.",
    "auth/cancelled-popup-request": "Ya había un acceso en curso. Vuelve a intentarlo.",
    "auth/network-request-failed": "No se ha podido conectar con Google. Comprueba Internet y vuelve a intentarlo.",
    "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase Authentication.",
    "auth/operation-not-allowed": "El proveedor Google no está habilitado en Firebase Authentication.",
    "auth/web-storage-unsupported": "El navegador no permite guardar la sesión de Google.",
    "auth/account-exists-with-different-credential": "Esta dirección ya usa otro proveedor. No se han vinculado cuentas.",
    "app/invalid-config": "Completa la configuración web pública de Firebase para habilitar Google.",
    "app/unsafe-emulator": "La configuración del emulador solo se permite en localhost con demo-defensas.",
    "app/timeout": "La cuenta tarda demasiado en responder. Puedes reintentar la conexión."
  })[error?.code] || "No se ha podido conectar la cuenta. Reintenta; el registro local sigue disponible.";
}

// Fase 10: elección recordada en este navegador ('google' | 'local'); sin ella se muestra el inicio de sesión.
export const ACCOUNT_MODE_KEY = "defensas-account-mode";
export function readAccountMode(storage = globalThis.localStorage) {
  try { const value = storage?.getItem(ACCOUNT_MODE_KEY); return value === "google" || value === "local" ? value : null; }
  catch { return null; }
}
export function writeAccountMode(mode, storage = globalThis.localStorage) {
  try { if (mode) storage?.setItem(ACCOUNT_MODE_KEY, mode); else storage?.removeItem(ACCOUNT_MODE_KEY); return true; }
  catch { return false; }
}

// Pantalla de inicio: al abrir sin sesión ni elección previa, al perder la sesión de Google o a petición.
export function loginScreenVisible({ enabled, mode, user, requested = false, restoring = false, restoreError = "", needsTeam = false }) {
  if (!enabled) return false;
  if (mode === "local" && !requested) return false;
  if (restoring || restoreError || needsTeam) return true;
  if (user) return false;
  if (requested) return true;
  if (mode === "local") return false;
  return true;
}

// Iniciales para el avatar cuando Google no aporta foto.
export function initialsFor(user) {
  const source = String(user?.displayName || user?.email || "").replace(/@.*$/, "").trim();
  const words = source.split(/[\s._-]+/).filter(Boolean).map(word => [...word]);
  const letters = words.length > 1 ? words[0][0] + words.at(-1)[0] : (words[0] || []).slice(0, 2).join("");
  return letters.toLocaleUpperCase("es") || "?";
}

// Solo se avisa de un problema: cambios bloqueados, o pendientes sin conexión, con error o que no se suben.
export const SYNC_GRACE_MS = 8000;
export function syncWarning({ pending = 0, blocked = 0, online = true, error = false, pendingSince = null, now = Date.now() }) {
  if (blocked > 0) return "blocked";
  if (pending <= 0) return null;
  if (!online) return "offline";
  if (error) return "error";
  return pendingSince != null && now - pendingSince >= SYNC_GRACE_MS ? "slow" : null;
}

export function createAccountController({ settings, loadAdapter, timeoutMs = 12000 }) {
  let adapter, unsubscribe, generation = 0, sessionVersion = 0;
  let state = { status: "loading", user: null, busy: false, error: "", sessionVersion };
  const listeners = new Set();
  const publish = patch => {
    state = { ...state, ...patch };
    for (const listener of listeners) listener(Object.freeze({ ...state }));
  };
  const userChanged = user => {
    // Solo datos de presentación; nunca tokens. La foto solo se pide a Google con la cuenta activa.
    const identity = user ? Object.freeze({ uid: user.uid, displayName: user.displayName || "",
      email: user.email || "", photoURL: /^https:\/\//.test(user.photoURL || "") ? user.photoURL : "" }) : null;
    if (identity?.uid !== state.user?.uid) sessionVersion++;
    publish({ user: identity, sessionVersion });
  };
  return {
    subscribe(listener) { listeners.add(listener); listener({ ...state }); return () => listeners.delete(listener); },
    async start() {
      const ticket = ++generation;
      unsubscribe?.(); unsubscribe = null; adapter = null;
      if (!settings.enabled) {
        publish({ status: "disabled", busy: false, error: "" }); return;
      }
      publish({ status: "loading", busy: false, error: "" });
      const deadline = Date.now() + timeoutMs;
      let timer;
      try {
        const candidate = await Promise.race([
          (async () => { const value = await loadAdapter(settings); await value.ready(); return value; })(),
          new Promise((_, reject) => { timer = setTimeout(() => reject({ code: "app/timeout" }), timeoutMs); })
        ]);
        if (ticket !== generation) return;
        adapter = candidate;
        // authStateReady puede resolver antes de entregar la primera observación.
        // Mantener también ese tramo acotado: nunca dejar «Cargando» sin salida.
        await Promise.race([
          new Promise((resolve, reject) => {
            unsubscribe = candidate.observe(user => {
              if (ticket !== generation) return;
              userChanged(user);
              publish({ status: "ready", error: "" }); resolve();
            }, error => {
              if (ticket === generation) publish({ status: "error", busy: false, error: authErrorText(error) });
              reject(error);
            });
          }),
          new Promise((_, reject) => {
            clearTimeout(timer);
            timer = setTimeout(() => reject({ code: "app/timeout" }), Math.max(0, deadline - Date.now()));
          })
        ]);
      } catch (error) {
        if (ticket === generation) {
          generation++; unsubscribe?.(); unsubscribe = null; adapter = null;
          publish({ status: "error", busy: false, error: authErrorText(error) });
        }
      } finally { clearTimeout(timer); }
    },
    // No async/await previo al adaptador: conserva el gesto de usuario de Safari.
    act(action) {
      if (!adapter || state.status !== "ready" || state.busy) return Promise.resolve(false);
      if (action !== "login" && action !== "logout") return Promise.resolve(false);
      const ticket = generation;
      if (action === "logout") publish({ sessionVersion: ++sessionVersion });
      publish({ busy: true, error: "" });
      let result;
      try { result = adapter[action](); } catch (error) { result = Promise.reject(error); }
      // Fase 10: resuelve true si la acción se completó (cerrar sesión borra datos solo entonces).
      return Promise.resolve(result).then(() => true, error => {
        if (ticket === generation) publish({ error: authErrorText(error) });
        return false;
      }).finally(() => { if (ticket === generation) publish({ busy: false }); });
    },
    // Elegir sin cuenta cancela la restauración, sin cerrar la sesión persistida
    // de Google ni aceptar callbacks tardíos que cambien el ámbito de trabajo.
    suspend() {
      generation++; unsubscribe?.(); unsubscribe = null; adapter = null;
      publish({ status: "idle", user: null, busy: false, error: "", sessionVersion: ++sessionVersion });
    },
    dispose() { generation++; unsubscribe?.(); listeners.clear(); adapter = null; }
  };
}
