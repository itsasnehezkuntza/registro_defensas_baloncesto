import { firebaseSettings } from './firebase-config.js';
import { createWebAuth } from './firebase-auth.js';
import { loadConfiguration } from './configuracion.js';
import { loadSupervisionReader } from './supervision-reader.js';
import { renderDashboard } from './dashboard.js';

const $ = id => document.getElementById(id);
let auth, user = null, reader = null, generation = 0, attempt = 0;
let stopAccess = null, fallback;
const message = text => { $('supervisionStatus').textContent = text; };
function clearDashboard() { $('statisticsContent').replaceChildren(); $('statisticsView').hidden = true; }
function reset() {
  generation++; attempt++; stopAccess?.(); stopAccess = null;
  $('supervisionTeam').replaceChildren(new Option('Selecciona un equipo', ''));
  $('supervisionGame').replaceChildren(new Option('Selecciona un partido', ''));
  $('supervisionTeam').disabled = true; $('supervisionGame').disabled = true;
  clearDashboard();
}
function failed(error) {
  reset();
  message(error?.code === 'permission-denied' ? 'Acceso retirado o no autorizado. Actualiza los equipos.' : 'No se puede consultar ahora. Comprueba la conexión y actualiza los equipos.');
}
async function refresh() {
  reset();
  if (!user) { message('Inicia sesión para consultar los equipos que tienes asignados.'); return; }
  if (!navigator.onLine || document.hidden) { message('Conecta y vuelve a esta página para verificar el acceso.'); return; }
  const gen = generation;
  message('Comprobando equipos autorizados…');
  try {
    if (!reader) {
      const candidate = await loadSupervisionReader(user.uid, () => user?.uid);
      if (gen !== generation) { candidate.close(); return; }
      reader = candidate;
    }
    if (gen !== generation) return;
    stopAccess = reader.watchAccess(async ids => {
      if (gen !== generation) return;
      const turn = ++attempt; clearDashboard();
      $('supervisionTeam').disabled = true; $('supervisionGame').disabled = true;
      $('supervisionTeam').replaceChildren(new Option('Selecciona un equipo', ''));
      $('supervisionGame').replaceChildren(new Option('Selecciona un partido', ''));
      try {
        const teams = await Promise.all(ids.map(id => reader.team(id)));
        if (gen !== generation || turn !== attempt) return;
        for (const team of teams) $('supervisionTeam').add(new Option(team.name, team.id));
        $('supervisionTeam').disabled = teams.length === 0;
        message(teams.length ? 'Selecciona un equipo. Consulta de solo lectura.' : 'No tienes equipos asignados para supervisión.');
      } catch (error) { if (gen === generation && turn === attempt) failed(error); }
    }, error => { if (gen === generation) failed(error); });
  } catch (error) { if (gen === generation) failed(error); }
}
$('supervisionTeam').onchange = async () => {
  const turn = ++attempt, id = $('supervisionTeam').value;
  clearDashboard(); $('supervisionGame').disabled = true;
  $('supervisionGame').replaceChildren(new Option('Selecciona un partido', ''));
  if (!id) { message('Selecciona un equipo.'); return; }
  message('Consultando partidos…');
  try {
    const games = await reader.games(id);
    if (turn !== attempt) return;
    for (const game of games) $('supervisionGame').add(new Option(`J${game.jornada} · ${game.rival}`, game.remoteId));
    $('supervisionGame').disabled = !games.length;
    message(games.length ? 'Selecciona un partido.' : 'Este equipo no tiene partidos disponibles.');
  } catch (error) { if (turn === attempt) failed(error); }
};
$('supervisionGame').onchange = async () => {
  const turn = ++attempt, team = $('supervisionTeam').value, game = $('supervisionGame').value;
  clearDashboard();
  if (!game) { message('Selecciona un partido.'); return; }
  message('Consultando estadísticas…');
  try {
    fallback ??= await loadConfiguration();
    const data = await reader.game(team, game, fallback);
    if (turn !== attempt) return;
    $('statisticsView').hidden = false;
    renderDashboard(data.configuration, data.events, data.game);
    message(`Solo lectura. Consulta realizada a las ${new Date().toLocaleTimeString('es-ES')}.${data.historical ? ' Partido histórico sin panel asociado: ejes del CSV actual y datos originales.' : ''} Para ver cambios, vuelve a seleccionar el partido.`);
  } catch (error) { if (turn === attempt) failed(error); }
};
$('supervisionRefresh').onclick = () => void refresh();
$('supervisionLogin').onclick = () => {
  $('supervisionLogin').disabled = true;
  void auth.login().catch(() => message('No se ha completado el acceso. Vuelve a intentarlo.')).finally(() => { $('supervisionLogin').disabled = !auth; });
};
// Salir de Google se hace desde el flujo habitual, con protección de sus colas.
// Esta página no cierra sesiones ni purga el almacenamiento deportivo.
addEventListener('offline', () => { reset(); message('Sin conexión: la consulta requiere verificar los permisos.'); });
addEventListener('online', () => void refresh());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { reset(); message('Consulta suspendida.'); }
  else void refresh();
});
addEventListener('pagehide', () => { reset(); });
addEventListener('pageshow', event => { if (event.persisted) void refresh(); });
try {
  if (!firebaseSettings.enabled) throw Error('Cuenta no disponible.');
  auth = await createWebAuth(firebaseSettings);
  auth.observe(next => {
    if (next?.uid === user?.uid && user) return;
    reset(); reader?.close(); reader = null; user = next && !next.isAnonymous ? next : null;
    $('supervisionIdentity').textContent = user?.email || user?.displayName || 'Sin cuenta';
    // Con sesión persistida no se ofrece cambiar de identidad fuera del cierre protegido.
    $('supervisionLogin').hidden = Boolean(user);
    void refresh();
  }, failed);
  $('supervisionLogin').disabled = false;
} catch { message('No se puede preparar Google. Recarga la página para reintentar.'); }
