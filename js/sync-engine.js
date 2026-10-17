import { storageContext, assertContext, listPending, lease, acknowledge, failOperation, mergeRemote, retryOperations } from './sync-storage.js';

export function createSyncEngine(transport, { onStatus = () => {}, intervalMs = 5000 } = {}) {
  const worker = crypto.randomUUID();
  let stopped = false, running = false, timer, revision = 0;
  const c = storageContext();
  
  const status = (text, detail = '') => { if (!stopped && storageContext() === c) onStatus(text, detail); };
  const alive = () => { assertContext(c); if (stopped) throw Error('Trabajador detenido.'); };
  async function cycle() {
    if (running || stopped) return;
    running = true; clearTimeout(timer);
    const ticket = revision;
    
    try {
      alive();
      if (!await lease(c, worker)) {  status('Pendiente de sincronizar', 'Otra pestaña está sincronizando.'); return; }
      try {
        let queue = await listPending(c);
        
        if (queue.length) status('Pendiente de sincronizar');
        for (const op of queue) {
          alive();
          if (op.blocked) throw Object.assign(Error('Operación bloqueada: ' + op.error), { code: op.error });
          if (op.nextAttempt > Date.now()) continue;
          if (!await lease(c, worker)) return;
          status('Sincronizando');
          try {
            
            await transport.send(op); alive(); await acknowledge(op);
            
          } catch (error) {
            if (storageContext() === c && !stopped) await failOperation(op, error);
            throw error;
          }
        }
        alive(); status('Sincronizando');
        
        const remote = await transport.pull(c.teamId);
        
        alive(); await mergeRemote(c, remote); alive();
        queue = await listPending(c);
        if (!queue.length && ticket === revision) status('Sincronizado');
        else status('Pendiente de sincronizar');
      } finally { await lease(c, worker, true); }
    } catch (error) {  status('Error de sincronización', error.code || error.message); }
    finally {
      running = false;
      if (!stopped) {
        const delayMs = revision !== ticket ? 0 : intervalMs;
        
        timer = setTimeout(() => {  void cycle(); }, delayMs);
      }
    }
  }
  return {
    start: cycle,
    wake() {  revision++; status('Pendiente de sincronizar'); if (!running && !stopped) { clearTimeout(timer); void cycle(); } },
    async retry() { alive(); await retryOperations(c); this.wake(); },
    stop() {  stopped = true; clearTimeout(timer); void lease(c, worker, true).catch(() => {}); }
  };
}
