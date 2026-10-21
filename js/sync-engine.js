import { storageContext, assertContext, listPending, lease, acknowledge, failOperation, mergeRemote, retryOperations } from './sync-storage.js';

// Un conflicto ya identificado permanece pendiente de resolución: no elegir
// automáticamente entre dos contenidos con el mismo ID ni abortar el resto.
function receivable(games, queue) {
  const conflicts = queue.filter(op => op.blocked && op.error === 'SYNC_CONFLICT');
  return games.filter(game => !conflicts.some(op => op.gameId === game.id && ['game', 'delete'].includes(op.type)))
    .map(game => ({ ...game, events: game.events?.filter(event => !conflicts.some(op =>
      op.type === 'event' && op.gameId === game.id && op.eventId === event.id)) }));
}

export function createSyncEngine(transport, { onStatus = () => {}, intervalMs = 5000 } = {}) {
  const worker = crypto.randomUUID();
  let stopped = false, running = false, timer, revision = 0, current = Promise.resolve();
  const c = storageContext();
  let subscription, remoteRevision = 0;
  const remoteChanged = () => {
    remoteRevision++;
    if (!running && !stopped) { clearTimeout(timer); void cycle(); }
  };
  
  const status = (text, detail = '') => { if (!stopped && storageContext() === c) onStatus(text, detail); };
  const alive = () => { assertContext(c); if (stopped) throw Error('Trabajador detenido.'); };
  const leaving = event => { if (!event.persisted) void stop(); };
  globalThis.addEventListener?.('pagehide', leaving);
  function stop() {
    stopped = true; clearTimeout(timer); subscription?.stop(); subscription = null;
    globalThis.removeEventListener?.('pagehide', leaving);
    // Iniciar la liberación antes de abandonar la página; también esperarla al
    // cerrar sesión o cambiar de equipo. Si se mata el proceso queda la caducidad.
    const release = lease(c, worker, true).catch(() => {});
    return Promise.all([current.catch(() => {}), release]).then(() => {});
  }
  function cycle() {
    if (running || stopped) return current;
    current = run();
    return current;
  }
  async function run() {
    running = true; clearTimeout(timer);
    const ticket = revision;
    let receivedRevision = remoteRevision;
    let failed = false;
    
    try {
      alive();
      if (!await lease(c, worker)) {
        status('Pendiente de sincronizar', 'Otra pestaña está sincronizando.'); return;
      }
      try {
        let queue = await listPending(c);
        let writeError = null;
        // Aislar el partido completo conserva alta→tiros y lápidas→altas,
        // incluso si la operación pendiente aparece después en la prioridad.
        const waitingGames = new Set(queue.filter(op => op.blocked || op.nextAttempt > Date.now()).map(op => op.gameId));
        
        if (queue.length) status('Pendiente de sincronizar');
        for (const op of queue) {
          alive();
          if (waitingGames.has(op.gameId)) continue;
          if (!await lease(c, worker)) return;
          status('Sincronizando');
          try {
            
            await transport.send(op); alive(); await acknowledge(op);
            
          } catch (error) {
            alive();
            const failure = await failOperation(op, error);
            alive(); writeError ??= error; waitingGames.add(op.gameId);
            // Un error permanente solo aísla ese partido. Ante un fallo
            // transitorio no insistir enviando todos los partidos sin red;
            // aun así intentar incorporar cambios ya recibidos.
            if (!failure?.blocked) break;
          }
        }
        alive(); status('Sincronizando');
        
        // Una escucha por motor. Los ciclos de reintento ya no
        // vuelven a consultar colecciones si no ha cambiado nada.
        if (transport.watch && !subscription) subscription = transport.watch(c.teamId, remoteChanged);
        const remote = subscription ? await subscription.read() : await transport.pull(c.teamId);
        receivedRevision = remoteRevision;
        
        alive();
        queue = await listPending(c);
        await mergeRemote(c, receivable(remote, queue)); alive();
        queue = await listPending(c);
        const blocked = queue.find(op => op.blocked);
        if (blocked || writeError) status('Error de sincronización', blocked?.error || writeError?.code || writeError?.message || 'SYNC_BLOCKED');
        else if (!queue.length && ticket === revision) status('Sincronizado');
        else status('Pendiente de sincronizar');
      } finally { await lease(c, worker, true); }
    } catch (error) {
      failed = true;
      subscription?.stop(); subscription = null;
      await lease(c, worker, true);
      status('Error de sincronización', error.code || error.message);
    }
    finally {
      running = false;
      if (!stopped) {
        const delayMs = !failed && (revision !== ticket || remoteRevision !== receivedRevision) ? 0 : intervalMs;
        
        timer = setTimeout(() => {  void cycle(); }, delayMs);
      }
    }
  }
  return {
    start: cycle,
    wake() {  revision++; status('Pendiente de sincronizar'); if (!running && !stopped) { clearTimeout(timer); void cycle(); } },
    async retry() { alive(); await retryOperations(c); this.wake(); },
    // Fase 10: devuelve el ciclo en curso para esperar a que no quede ninguna escritura local pendiente.
    stop
  };
}
