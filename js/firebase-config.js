// Configuración web PÚBLICA. Nunca añadir claves de servicio ni secretos OAuth.
// Completar con la app web de Firebase y cambiar enabled a true para probar Google.
export const firebaseSettings = Object.freeze({
  enabled: false,
  config: Object.freeze({ apiKey: "", authDomain: "", projectId: "", appId: "" }),
  // Solo desarrollo en localhost/127.0.0.1 y proyecto demo-defensas.
  authEmulator: false
});
