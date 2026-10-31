// Fuentes públicas de 23.0; sin documentos internos, pruebas ni herramientas.
export const publicFiles = Object.freeze([
  'index.html', 'app.js', 'styles.css', 'registro.css', 'dashboard.css', 'editor.css', 'cuenta.css',
  'categorias.csv', '.nojekyll',
  ...['inicio', 'configuracion', 'exportacion', 'identidad', 'interfaz', 'persistencia', 'registro',
    'estadisticas', 'dashboard', 'vistas', 'cuenta', 'cuenta-ui', 'firebase-auth', 'firebase-config',
    'sync-config', 'sync-storage', 'sync-engine', 'sync-ui', 'firestore-sync', 'firestore-watch',
    'panel-model', 'registro-vista', 'distribucion', 'configuracion-guardada', 'editor',
    'panel-configuration', 'supervision-reader', 'supervision-ui'].map(name => 'js/' + name + '.js'),
  ...['BarlowCondensed-Bold.ttf', 'Manrope.ttf', 'BarlowCondensed-OFL.txt', 'Manrope-OFL.txt'].map(name => 'fonts/' + name),
  'supervision.html', 'supervision.css'
]);
