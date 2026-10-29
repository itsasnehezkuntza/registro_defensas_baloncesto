import { firebaseSettings } from "./firebase-config.js";
import { createAccountController, readAccountMode, writeAccountMode, loginScreenVisible, initialsFor,
  syncWarning, SYNC_GRACE_MS } from "./cuenta.js";
import { syncSettings } from "./sync-config.js";
import { openDatabase } from "./persistencia.js";
import { accountUnsynced, purgeAccountData, listLegacyForImport, storageContext } from "./sync-storage.js";

// Fase 10: inicio de sesión, avatar y menú de perfil. No modifica saveStatus: solo app.js confirma el guardado.
// Sin cuenta elegida no se carga el SDK de Google (ninguna petición externa) salvo en la pantalla de inicio.
const $ = id => document.getElementById(id);
const root = document.documentElement;
const PERSON_SVG = $("profileAvatar").innerHTML;
const PURGE_KEY = "defensas-purge-pending";
const offerKey = uid => "defensas-local-offer:" + JSON.stringify([storageContext().projectId, uid]);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const online = () => globalThis.navigator?.onLine !== false;

let mode = firebaseSettings.enabled ? readAccountMode() : "local";
let requested = false, started = false, loggingOut = false, loginShown = false;
let account = { status: firebaseSettings.enabled ? "idle" : "disabled", user: null, busy: false, error: "" };
let syncState = { pending: 0, blocked: 0, error: false, detail: "", pendingSince: null };
let offeredFor = null, purgeAfterSignOut = null, waitTimer = 0, graceTimer = 0, avatarKey = null;
let confirmedStorageContext = null;
// Controles de sincronización: se cargan solo con el SDK (cuenta elegida o pantalla de inicio).
let syncApi = null, syncLoading = Promise.resolve(null);
const quiesceSync = async () => { await syncLoading; await syncApi?.quiesce(); };
const channel = globalThis.BroadcastChannel ? new BroadcastChannel("registro-defensivo-cuenta") : null;
const controller = createAccountController({
  settings: firebaseSettings,
  loadAdapter: async settings => (await import("./firebase-auth.js")).createWebAuth(settings)
});

function ensureStarted() {
  if (started || !firebaseSettings.enabled) return;
  started = true;
  if (syncSettings.enabled) {
    syncLoading = import("./sync-ui.js").then(module => {
      syncApi = module.initializeSyncUI(controller, {
        onState: state => { syncState = state; render(); }
      });
      return syncApi;
    }).catch(() => {
      syncState = { ...syncState, uid: account.user?.uid, restoring: false, restoreError: "No se ha podido recuperar tu equipo. Reintenta o continúa sin cuenta." };
      $("cloudStatus").textContent = "Error de sincronización"; render(); return null;
    });
  }
  void controller.start();
}

function paintAvatar(element, user) {
  element.classList.toggle("is-local", !user);
  if (!user) { element.innerHTML = PERSON_SVG; return; }
  const initials = initialsFor(user);
  if (!user.photoURL) { element.textContent = initials; return; }
  const image = document.createElement("img");
  image.alt = ""; image.decoding = "async"; image.referrerPolicy = "no-referrer";
  image.addEventListener("error", () => { element.textContent = initials; }, { once: true });
  image.src = user.photoURL;
  element.replaceChildren(image);
}

function render() {
  const user = account.user;
  const loading = account.status === "idle" || account.status === "loading";
  const restoring = mode === "google" && (loading || Boolean(user && (account.busy ||
    (syncSettings.enabled && (syncState.uid !== user.uid || syncState.restoring)))));
  const restoreError = (mode === "google" && account.status === "error" ? account.error : "") ||
    (user && syncState.uid === user.uid ? syncState.restoreError : "");
  const needsTeam = Boolean(user && syncState.uid === user.uid && syncState.needsTeam);
  // Pantalla de inicio (y el resto de la aplicación inerte mientras se muestra).
  const visible = loginScreenVisible({ enabled: firebaseSettings.enabled, mode, user, requested, restoring, restoreError, needsTeam });
  const accessChanged = visible !== root.hasAttribute("data-login");
  if (visible) root.dataset.login = restoring ? "restaurando" : needsTeam ? "equipo" : requested ? "perfil" : "inicio";
  else delete root.dataset.login;
  for (const element of document.querySelectorAll(".app-shell, .result-dock")) element.inert = visible;
  if (accessChanged) globalThis.dispatchEvent(new Event("defensas-account-access"));
  $("loginTitle").textContent = restoring ? "Recuperando tu sesión" : needsTeam ? "Prepara tu equipo" : restoreError ? "Recupera tu sesión" : "Inicia sesión";
  $("teamSetup").hidden = !needsTeam || restoring;
  $("teamSetupIdentity").textContent = user?.email || "";
  $("loginGoogle").hidden = Boolean(user);
  $("loginIntro").textContent = needsTeam ? "Crea o elige tu equipo para sincronizar los partidos. Los partidos anteriores solo se subirán si lo confirmas."
    : "Con Google, tus partidos se sincronizan con tu equipo. Sin cuenta, se guardan en este dispositivo.";
  if (visible && !loginShown) $("loginTitle").focus({ preventScroll: true });
  if (!visible && loginShown && document.activeElement === document.body) $("profileBtn").focus({ preventScroll: true });
  loginShown = visible;
  $("loginGoogle").disabled = account.status !== "ready" || account.busy || Boolean(user);
  $("loginGoogleText").textContent = restoring ? "Recuperando…" : loading ? "Cargando…" : account.busy && !user ? "Conectando…" : "Continuar con Google";
  $("loginMessage").textContent = restoreError || account.error || (needsTeam && !online() ? "Necesitas conexión para preparar tu primer equipo. Puedes continuar en modo local; esos partidos se guardan solo en este dispositivo." : restoring ? "Espera mientras recuperamos tu cuenta y el equipo seleccionado, o continúa sin cuenta." : account.status === "disabled" ? "Google no está disponible. Puedes continuar sin cuenta." : "");
  $("loginRetry").hidden = account.status !== "error" && !restoreError;
  if (user && !visible && account.status === "ready" && !account.busy) void offerLocalData(user);

  // Avatar y menú de perfil.
  const key = user ? user.uid + "|" + user.photoURL + "|" + initialsFor(user) : "local";
  if (key !== avatarKey) { avatarKey = key; paintAvatar($("profileAvatar"), user); paintAvatar($("profileBigAvatar"), user); }
  const waitingAccount = !user && mode === "google" && started;
  $("profileName").textContent = user ? user.displayName || "Cuenta de Google" : waitingAccount ? "Cuenta de Google" : "Sin cuenta";
  $("accountIdentity").hidden = !user;
  $("accountIdentity").textContent = user ? user.email || user.displayName || "Cuenta de Google conectada" : "";
  $("profileProvider").hidden = !user;
  $("profileLocalNote").hidden = Boolean(user);
  $("profileLocalNote").textContent = waitingAccount && account.status === "error"
    ? "Mientras tanto, los partidos se guardan solo en este dispositivo."
    : "Los partidos se guardan solo en este dispositivo.";
  $("profileSync").hidden = !user;
  // Sin cuenta elegida no se muestran errores de conexión de Google.
  const note = !visible && account.error && (mode === "google" || user) ? account.error : waitingAccount && loading ? "Conectando con tu cuenta…" : "";
  $("accountMessage").textContent = note;
  $("accountMessage").hidden = !note;
  $("accountRetry").hidden = !(waitingAccount && account.status === "error");
  $("googleLogin").hidden = Boolean(user) || (waitingAccount && account.status !== "ready");
  $("googleLogin").disabled = !firebaseSettings.enabled;
  $("googleLogout").hidden = !user;
  $("googleLogout").disabled = account.busy || loggingOut;
  renderWarning();
  renderStorageNotice();
}

// El guardado local y el estado de nube se mantienen separados, también visualmente.
function renderStorageNotice() {
  const notice = $("storageNotice");
  if (!notice) return;
  const context = storageContext();
  if (!account.user || !syncState.active || syncState.error || syncState.pending > 0 || syncState.label === "Pendiente de sincronizar") confirmedStorageContext = null;
  else if (syncState.label === "Sincronizado") confirmedStorageContext = context;
  const localError = $("saveStatus").classList.contains("is-error");
  const localSaving = $("saveStatus").classList.contains("is-saving");
  const text = localError ? $("saveStatusText").textContent : localSaving ? "Guardando en este dispositivo…"
    : !account.user || !syncState.active ? "Guardado en este dispositivo"
    : syncState.error ? "Guardado en este dispositivo · Error o conflicto de sincronización"
    : confirmedStorageContext === context && !syncState.pending ? "Sincronizado"
    : "Guardado en este dispositivo · Pendiente de sincronizar";
  if (notice.textContent !== text) notice.textContent = text;
  notice.classList.toggle("has-error", localError || Boolean(account.user && syncState.error));
}

// Aviso solo ante un problema: punto en el avatar y detalle en el menú de perfil.
function renderWarning() {
  const kind = account.user ? syncWarning({ ...syncState, online: online() }) : null;
  const n = syncState.pending;
  const text = {
    blocked: `${plural(syncState.blocked, "cambio no se puede subir", "cambios no se pueden subir")}. ${syncState.detail || ""} Se conservan en este dispositivo; puedes usar «Reintentar sincronización».`,
    offline: `${plural(n, "cambio pendiente", "cambios pendientes")} de subir: no hay conexión. Están guardados en este dispositivo y se subirán solos al recuperarla.`,
    error: `${plural(n, "cambio pendiente", "cambios pendientes")} de subir: no se ha podido conectar con el servidor. Se reintentará automáticamente.`,
    slow: `${plural(n, "cambio todavía no se ha", "cambios todavía no se han")} subido. Se reintentará automáticamente.`
  }[kind] ?? "";
  $("profileDot").hidden = !kind;
  $("profileSyncWarning").hidden = !kind;
  $("profileSyncWarning").textContent = text.replace(/\s+/g, " ").trim();
  const user = account.user;
  $("profileBtn").setAttribute("aria-label", (user ? `Perfil: ${user.displayName || user.email || "cuenta de Google"}` : "Perfil: sin cuenta") +
    (kind ? ". Hay cambios sin subir" : ""));
  clearTimeout(graceTimer);
  if (!kind && account.user && n > 0 && syncState.pendingSince != null) {
    graceTimer = setTimeout(renderWarning, Math.max(0, syncState.pendingSince + SYNC_GRACE_MS - Date.now()) + 50);
  }
}

function setProfile(open, restoreFocus = false) {
  $("profileMenu").hidden = !open;
  $("profileBtn").setAttribute("aria-expanded", String(open));
  if (open) {
    $("moreMenu").hidden = true; $("moreBtn").setAttribute("aria-expanded", "false");
    void syncApi?.refresh?.();
    $("profileMenu").querySelector("button:not([hidden]):not(:disabled), select:not(:disabled)")?.focus();
  } else if (restoreFocus) $("profileBtn").focus();
}

// Pregunta única por los partidos sin cuenta de este dispositivo al iniciar sesión.
async function offerLocalData(user) {
  if (!syncSettings.enabled || offeredFor === user.uid || loggingOut) return;
  offeredFor = user.uid;
  let previousOffer;
  try { previousOffer = localStorage.getItem(offerKey(user.uid)); } catch { /* La revisión sigue disponible. */ }
  const remember = () => { try { localStorage.setItem(offerKey(user.uid), "revisado22"); } catch {} };
  let games;
  try {
    await openDatabase(); games = await listLegacyForImport();
    // 20.0 ya preguntaba por los partidos sin cuenta, pero no por los creados
    // con cuenta en modo local. Ofrecer estos una vez al completar el equipo.
    const info = await accountUnsynced(user.uid);
    if (previousOffer && (!info.localOnly || previousOffer === 'revisado22')) return;
  } catch { return; }
  if (account.user?.uid !== user.uid) return;
  if (!games.length) { remember(); return; }
  const dialog = $("localDataDialog");
  $("localDataMessage").textContent = `En este dispositivo hay ${plural(games.length, "partido local", "partidos locales")} sin incorporar a un equipo. ` +
    "Puedes subirlos a tu cuenta para tenerlos también en tus otros dispositivos, o dejarlos solo aquí. " +
    "Solo se pregunta una vez; después puedes hacerlo desde tu perfil con «Revisar partidos locales».";
  dialog.addEventListener("close", remember, { once: true });
  dialog.showModal();
  $("localDataKeepBtn").focus();
}

async function purge(uid) {
  const pending = readPurges();
  try {
    await openDatabase();
    await purgeAccountData(uid, { protectUnsynced: true });
    writePurges(readPurges().filter(item => item !== uid));
    // La aplicación relee el estado sin los datos de la cuenta.
    globalThis.dispatchEvent(new Event("defensas-sync-local"));
    return true;
  } catch {
    if (!pending.includes(uid)) writePurges([...pending, uid]);
    return false;
  }
}
function readPurges() { try { return JSON.parse(localStorage.getItem(PURGE_KEY) || "[]").filter(item => typeof item === "string"); } catch { return []; } }
function writePurges(list) { try { if (list.length) localStorage.setItem(PURGE_KEY, JSON.stringify(list)); else localStorage.removeItem(PURGE_KEY); } catch {} }

async function logout(uid) {
  loggingOut = true; render();
  const ok = await controller.act("logout");
  if (!ok) { loggingOut = false; render(); setProfile(true); return; }
  try { await quiesceSync(); } catch { /* El motor ya estaba detenido. */ }
  await purge(uid);
  channel?.postMessage({ type: "purged", uid });
  loggingOut = false; offeredFor = null;
  render();
}

function logoutText(info) {
  if (!info) return "No se ha podido comprobar si hay cambios sin subir. La sesión permanece abierta para proteger tus datos. Reintenta cuando se pueda comprobar.";
  const parts = [];
  if (info.pending) parts.push(`Cambios sin subir a tu cuenta: ${info.pending}${online() ? "" : " (no hay conexión)"}${info.blocked ? `, ${info.blocked} bloqueados` : ""}.`);
  if (info.localOnly) parts.push(`Partidos de esta cuenta guardados solo en este dispositivo: ${info.localOnly}. Para conservarlos, súbelos con «Revisar partidos locales» o exporta su CSV.`);
  parts.push("La sesión permanece abierta para proteger estos datos. Puedes cancelar y seguir trabajando. Los partidos locales necesitan «Revisar partidos locales» antes de salir.");
  return parts.join(" ");
}
function showLogoutDialog(uid, info) {
  const canWait = Boolean(info && info.pending > 0 && !info.blocked && !info.localOnly);
  $("logoutMessage").textContent = logoutText(info);
  $("logoutProgress").hidden = true;
  $("logoutWaitBtn").hidden = !canWait;
  $("logoutCancelBtn").classList.toggle("pill-primary", !canWait);
  $("logoutDialog").dataset.uid = uid;
  if (!$("logoutDialog").open) $("logoutDialog").showModal();
  (canWait ? $("logoutWaitBtn") : $("logoutCancelBtn")).focus();
}
function waitForUpload(uid) {
  $("logoutWaitBtn").hidden = true;
  $("logoutCancelBtn").classList.add("pill-primary");
  $("logoutProgress").hidden = false;
  globalThis.dispatchEvent(new Event("defensas-sync-local")); // Despierta el motor.
  const tick = async () => {
    if (!$("logoutDialog").open || account.user?.uid !== uid) return;
    const info = await accountUnsynced(uid).catch(() => null);
    if (!$("logoutDialog").open) return;
    if (info && !info.pending && !info.localOnly) { $("logoutDialog").close(); await logout(uid); return; }
    if (!info || info.blocked || info.localOnly) { showLogoutDialog(uid, info); return; }
    $("logoutProgress").textContent = `Subiendo cambios… quedan ${info.pending}.${online() ? "" : " Esperando conexión."} Se cerrará la sesión al terminar.`;
    waitTimer = setTimeout(tick, 1000);
  };
  void tick();
}
async function requestLogout() {
  const user = account.user;
  if (!user || loggingOut || account.busy) return;
  setProfile(false);
  let info = null;
  try { await openDatabase(); info = await accountUnsynced(user.uid); } catch { info = null; }
  if (account.user?.uid !== user.uid) return;
  if (info && !info.pending && !info.localOnly) { await logout(user.uid); return; }
  showLogoutDialog(user.uid, info);
}

controller.subscribe(state => {
  account = state;
  if (state.user) {
    if (mode !== "google") { mode = "google"; writeAccountMode("google"); }
    requested = false;
  } else if (purgeAfterSignOut && state.status === "ready" && !state.busy) {
    const uid = purgeAfterSignOut; purgeAfterSignOut = null;
    void quiesceSync().catch(() => {}).then(() => purge(uid));
  }
  if (!state.user && $("logoutDialog").open && !loggingOut) $("logoutDialog").close();
  render();
});

// Otra pestaña cerró la sesión y borró los datos: aquí también, cuando el motor esté parado.
channel?.addEventListener("message", ({ data }) => {
  if (data?.type !== "purged" || typeof data.uid !== "string") return;
  if (account.user?.uid === data.uid) { purgeAfterSignOut = data.uid; return; }
  void quiesceSync().catch(() => {}).then(() => purge(data.uid));
});

$("loginGoogle").addEventListener("click", () => { void controller.act("login"); }); // Sin await previo: gesto de Safari.
$("loginLocal").addEventListener("click", () => {
  requested = false; mode = "local"; writeAccountMode("local"); controller.suspend(); render();
});
$("loginRetry").addEventListener("click", () => { void controller.start(); });
$("accountRetry").addEventListener("click", () => { void controller.start(); });
$("googleLogin").addEventListener("click", () => {
  requested = true; setProfile(false);
  if (started) void controller.start(); else ensureStarted();
  render();
});
$("googleLogout").addEventListener("click", () => { void requestLogout(); });
$("teamSetupLogout").addEventListener("click", () => { void requestLogout(); });
$("profileBtn").addEventListener("click", () => setProfile($("profileMenu").hidden));
$("logoutWaitBtn").addEventListener("click", () => waitForUpload($("logoutDialog").dataset.uid));
$("logoutCancelBtn").addEventListener("click", () => $("logoutDialog").close());
$("logoutDialog").addEventListener("close", () => { clearTimeout(waitTimer); });
$("localDataKeepBtn").addEventListener("click", () => $("localDataDialog").close());
$("localDataUploadBtn").addEventListener("click", () => {
  $("localDataDialog").close();
  void syncLoading.then(() => syncApi?.offerImport());
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !$("profileMenu").hidden) setProfile(false, true);
});
document.addEventListener("pointerdown", event => {
  if (!$("profileMenu").hidden && !$("profileMenu").contains(event.target) && !$("profileBtn").contains(event.target)) setProfile(false);
});
for (const kind of ["online", "offline"]) globalThis.addEventListener(kind, renderWarning);
new MutationObserver(renderStorageNotice).observe($("saveStatus"), { attributes: true, subtree: true, childList: true, characterData: true });

$("loginTitle").tabIndex = -1;
for (const uid of readPurges()) void purge(uid);
if (mode !== "local") ensureStarted();
render();
globalThis.dispatchEvent(new Event('defensas-account-ui-ready'));
