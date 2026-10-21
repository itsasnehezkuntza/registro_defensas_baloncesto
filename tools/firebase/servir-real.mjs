import { startServer } from './servidor.mjs';
await startServer(4199);
console.log('Validación aislada: http://localhost:4199/tools/firebase/validacion-real.html');
console.log('Completa el acceso Google en el navegador; no introduzcas credenciales en la terminal.');
