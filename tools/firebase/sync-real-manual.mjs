// Solo servidor local. El usuario abre perfiles normales; no hay WebDriver/OAuth automatizado.
import { prepareRealSyncSession } from './sync-real-session.mjs';
const resumeIndex = process.argv.indexOf('--resume');
if (resumeIndex >= 0 && !process.argv[resumeIndex + 1]) throw Error('Indica el identificador de la sesión después de --resume.');
const session = await prepareRealSyncSession({ rulesCopy: process.argv[2], manualBrowser: true,
  resumeRun: resumeIndex >= 0 ? process.argv[resumeIndex + 1] : null });
console.log('Servidor de prueba listo. No se ha abierto ningún navegador ni creado datos Firestore.');
console.log(resumeIndex >= 0 ? 'Sesión reanudada: usa los MISMOS perfiles A/B; no crees otro equipo ni borres datos.'
  : 'Crea manualmente dos perfiles NUEVOS de Chrome (sin activar sincronización del navegador).');
console.log('Primero abre en el perfil A: ' + session.audit.origin + '/?perfil=A');
console.log('Completa Google desde la app. Después abre en el otro perfil B: ' + session.audit.origin + '/?perfil=B');
console.log('Usa la misma cuenta Google en A y B. No uses perfiles con partidos reales.');
console.log('Avisa al agente después del acceso. No crees equipo/partidos hasta revisar los estados.');
console.log('Informe: ' + session.out + 'session.json');
console.log('Este modo no ejecuta la prueba automáticamente. Ctrl+C cierra solo el servidor.');
process.once('SIGINT', async () => { await session.stop('Servidor manual detenido por el propietario.'); process.exit(0); });
