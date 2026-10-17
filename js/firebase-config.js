// Configuración web PÚBLICA. Nunca añadir claves de servicio ni secretos OAuth.
// App web del proyecto registro-defensivo. Authentication y Sync opcional.
export const firebaseSettings = Object.freeze({
  enabled: true,
  config: Object.freeze({
    apiKey: "AIzaSyAfvK3O8_16ahgVWWEqVNVW7_lQ_bpCGto",
    authDomain: "registro-defensivo.firebaseapp.com",
    projectId: "registro-defensivo",
    storageBucket: "registro-defensivo.firebasestorage.app",
    messagingSenderId: "760744900094",
    appId: "1:760744900094:web:56f037728d252c22fcfcaf"
  }),
  // Solo desarrollo en localhost/127.0.0.1 y proyecto demo-defensas.
  authEmulator: false
});
