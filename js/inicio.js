// Se ejecuta antes de pintar la página y antes de los módulos: evita mostrar
// el registro mientras se recupera la cuenta. Archivo propio permitido por CSP.
try {
  var initialAccountMode = localStorage.getItem('defensas-account-mode');
  if (initialAccountMode !== 'local') document.documentElement.dataset.login = initialAccountMode === 'google' ? 'restaurando' : 'inicio';
} catch (error) {
  document.documentElement.dataset.login = 'inicio';
}

// También cubrir un módulo que no llega a evaluarse: el temporizador del
// controlador de cuenta todavía no existe en ese caso.
var accountUiReady = false;
var startupTimer = setTimeout(function () {
  if (accountUiReady || !document.documentElement.hasAttribute('data-login')) return;
  var message = document.querySelector('#loginMessage'), retry = document.querySelector('#loginRetry');
  if (message) message.textContent = 'No se ha podido terminar de cargar el acceso. Comprueba la conexión y vuelve a intentarlo.';
  if (retry) retry.hidden = false;
}, 15000);
window.addEventListener('defensas-account-ui-ready', function () { accountUiReady = true; clearTimeout(startupTimer); }, { once: true });
document.addEventListener('click', function (event) {
  if (accountUiReady) return;
  if (!event.target.closest) return;
  var local = event.target.closest('#loginLocal'), retry = event.target.closest('#loginRetry');
  if (!local && !retry) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (local) {
    try { localStorage.setItem('defensas-account-mode', 'local'); } catch (error) { return; }
  }
  location.reload();
}, true);
