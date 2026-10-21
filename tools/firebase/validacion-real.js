import { firebaseSettings } from '../../js/firebase-config.js';

const $ = selector => document.querySelector(selector);
const { config } = firebaseSettings;
const publicKeys = ['apiKey', 'authDomain', 'projectId', 'appId', 'storageBucket',
  'messagingSenderId', 'measurementId', 'databaseURL'];
const valid = firebaseSettings.enabled && firebaseSettings.authEmulator === false &&
  !config?.projectId?.startsWith('demo-') &&
  config && Object.keys(config).every(key => publicKeys.includes(key)) &&
  ['apiKey', 'authDomain', 'projectId', 'appId'].every(key => typeof config[key] === 'string' && config[key].trim());

$('#projectId').textContent = config?.projectId || 'Sin configurar';
$('#authDomain').textContent = config?.authDomain || 'Sin configurar';
$('#testOrigin').textContent = location.origin;
$('#configurationState').textContent = valid
  ? 'Configuración real presente. Todavía no equivale a una prueba de Google superada.'
  : 'Prueba real bloqueada: completa la configuración pública, enabled: true y authEmulator: false. No se ha iniciado autenticación.';

// No arrancar el SDK si falta configuración o se ha seleccionado un emulador.
if (valid) {
  await import('../../js/cuenta-ui.js');
  $('#checkDomains').disabled = false;
  let wasConnected = false;
  const refreshButtons = () => {
    const connected = !$('#accountIdentity').hidden;
    $('#verifySession').disabled = !connected;
    $('#reloadSession').disabled = !connected;
    if (wasConnected && !connected) {
      $('#verification').textContent = 'Sesión cerrada en este navegador. Recarga para comprobar que no reaparece. Firestore no se ha utilizado.';
    }
    wasConnected = connected;
  };
  new MutationObserver(refreshButtons).observe($('#accountIdentity'), { attributes: true });
  refreshButtons();
}

$('#checkDomains').addEventListener('click', async () => {
  const button = $('#checkDomains'); button.disabled = true;
  try {
    const url = new URL('https://identitytoolkit.googleapis.com/v1/projects');
    url.searchParams.set('key', config.apiKey);
    url.searchParams.set('firebaseAppId', config.appId);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let response;
    try { response = await fetch(url, { signal: controller.signal }); }
    finally { clearTimeout(timer); }
    if (!response.ok) throw Error('HTTP ' + response.status + '. Comprueba proyecto, API key, restricciones y activación de Authentication en consola.');
    const result = await response.json();
    if (!Array.isArray(result.authorizedDomains)) throw Error('La respuesta no permite verificar los dominios. Revísalos en Firebase Console.');
    const domains = result.authorizedDomains;
    $('#verification').textContent = 'Respuesta del servicio real. Dominios autorizados: ' + domains.join(', ') +
      '\nHost actual (' + location.hostname + '): ' + (domains.includes(location.hostname) ? 'presente.' : 'NO aparece; revisar en consola.') +
      '\nGitHub Pages: ' + (domains.includes('itsasnehezkuntza.github.io') ? 'presente.' : 'pendiente de añadir si se va a usar.') +
      '\nGoogle habilitado: comprobar en consola y confirmar con login real; la lista de dominios no prueba el proveedor.';
  } catch (error) {
    $('#verification').textContent = 'Dominios no verificados: ' + error.message;
  } finally { button.disabled = false; }
});

$('#verifySession').addEventListener('click', async () => {
  const button = $('#verifySession'); button.disabled = true;
  try {
    const [appSdk, authSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js')
    ]);
    const auth = authSdk.getAuth(appSdk.getApp('defensas-auth'));
    if (auth.emulatorConfig || !auth.currentUser) throw Error('No hay una cuenta real conectada.');
    const user = auth.currentUser;
    const result = await authSdk.getIdTokenResult(user, true);
    if (auth.currentUser?.uid !== user.uid) throw Error('La cuenta ha cambiado durante la comprobación. Repite la prueba.');
    if (result.signInProvider !== 'google.com') throw Error('El proveedor de la sesión no es Google.');
    if (result.claims.aud !== config.projectId || result.claims.iss !== 'https://securetoken.google.com/' + config.projectId) {
      throw Error('La sesión no corresponde al proyecto configurado.');
    }
    const key = 'defensas-real-auth-restore';
    let restore = false;
    try {
      restore = sessionStorage.getItem(key) === config.projectId;
      sessionStorage.removeItem(key);
    } catch {}
    $('#verification').textContent = 'Sesión Google real verificada con renovación forzada en el servidor. Proyecto correcto; sin emulador.\n' +
      (restore ? 'Restauración tras recarga y renovación de sesión: correctas.' : 'Para comprobar restauración, pulsa Recargar y después vuelve a verificar la sesión.') +
      '\nNo se muestran ni se guardan tokens en el informe. Firestore sigue sin utilizarse.';
  } catch (error) {
    // Mostrar código conocido, nunca la respuesta del servidor ni un token.
    $('#verification').textContent = 'Sesión real no verificada: ' + (error.code || error.message);
  } finally { button.disabled = $('#accountIdentity').hidden; }
});

$('#reloadSession').addEventListener('click', () => {
  try { sessionStorage.setItem('defensas-real-auth-restore', config.projectId); }
  catch { $('#verification').textContent = 'sessionStorage no disponible; anota manualmente la prueba de restauración.'; return; }
  location.reload();
});
