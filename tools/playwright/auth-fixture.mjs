// Adaptador exclusivo de la prueba visual sin red ni usuarios reales.
export async function createWebAuth() {
  return {
    ready: async () => {},
    observe(next) { next(null); return () => {}; },
    login() { throw Error('La prueba visual no admite Google real; usar emuladores.'); },
    logout: async () => {}
  };
}
