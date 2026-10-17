// Controlador sin DOM ni acceso a datos deportivos. La cuenta no implica subirlos.
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

export function createAccountController({ settings, loadAdapter, timeoutMs = 12000 }) {
  let adapter, unsubscribe, generation = 0, sessionVersion = 0;
  let state = { status: "loading", user: null, busy: false, error: "", sessionVersion };
  const listeners = new Set();
  const publish = patch => {
    state = { ...state, ...patch };
    for (const listener of listeners) listener(Object.freeze({ ...state }));
  };
  const userChanged = user => {
    const identity = user ? Object.freeze({ uid: user.uid, displayName: user.displayName || "",
      email: user.email || "" }) : null;
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
      let timer;
      try {
        const candidate = await Promise.race([
          (async () => { const value = await loadAdapter(settings); await value.ready(); return value; })(),
          new Promise((_, reject) => { timer = setTimeout(() => reject({ code: "app/timeout" }), timeoutMs); })
        ]);
        if (ticket !== generation) return;
        adapter = candidate;
        unsubscribe = candidate.observe(user => {
          if (ticket !== generation) return;
          userChanged(user);
          publish({ status: "ready", error: "" });
        }, error => {
          if (ticket === generation) publish({ status: "error", busy: false, error: authErrorText(error) });
        });
      } catch (error) {
        if (ticket === generation) publish({ status: "error", busy: false, error: authErrorText(error) });
      } finally { clearTimeout(timer); }
    },
    // No async/await previo al adaptador: conserva el gesto de usuario de Safari.
    act(action) {
      if (!adapter || state.status !== "ready" || state.busy) return Promise.resolve();
      if (action !== "login" && action !== "logout") return Promise.resolve();
      const ticket = generation;
      if (action === "logout") publish({ sessionVersion: ++sessionVersion });
      publish({ busy: true, error: "" });
      let result;
      try { result = adapter[action](); } catch (error) { result = Promise.reject(error); }
      return Promise.resolve(result).catch(error => {
        if (ticket === generation) publish({ error: authErrorText(error) });
      }).finally(() => { if (ticket === generation) publish({ busy: false }); });
    },
    dispose() { generation++; unsubscribe?.(); listeners.clear(); adapter = null; }
  };
}
