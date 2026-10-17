// Adaptador web sustituible por uno nativo en Capacitor. No importa Firestore.
// SDK oficial modular, versión exacta; ninguna descarga si enabled es false.
export const FIREBASE_VERSION = "12.11.0";

export async function createWebAuth(settings) {
  const config = settings.config;
  if (!["apiKey", "authDomain", "projectId", "appId"].every(key =>
    typeof config?.[key] === "string" && config[key].trim())) {
    throw Object.assign(new Error(), { code: "app/invalid-config" });
  }
  if (settings.authEmulator &&
      (!["localhost", "127.0.0.1"].includes(location.hostname) || config.projectId !== "demo-defensas")) {
    throw Object.assign(new Error(), { code: "app/unsafe-emulator" });
  }
  const [appSdk, sdk] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js")
  ]);
  const app = appSdk.getApps().find(item => item.name === "defensas-auth") ||
    appSdk.initializeApp(config, "defensas-auth");
  const auth = sdk.initializeAuth(app, {
    persistence: [sdk.indexedDBLocalPersistence, sdk.browserLocalPersistence,
      sdk.browserSessionPersistence, sdk.inMemoryPersistence],
    popupRedirectResolver: sdk.browserPopupRedirectResolver
  });
  if (settings.authEmulator && !auth.emulatorConfig) {
    sdk.connectAuthEmulator(auth, "http://127.0.0.1:9099");
  }
  auth.languageCode = "es";
  const provider = new sdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return {
    ready: () => auth.authStateReady(),
    observe: (next, error) => sdk.onAuthStateChanged(auth, next, error),
    // Se invoca desde click, sin await/import/setPersistence antes de abrir popup.
    login: () => sdk.signInWithPopup(auth, provider),
    logout: () => sdk.signOut(auth)
  };
}
