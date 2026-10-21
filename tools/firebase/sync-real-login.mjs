// Solo ordena el acceso manual. No introduce credenciales ni llama a Firestore.
export async function sequentialGoogleLogin({ open, login, status, popupClosed, output = () => {},
  pause = () => new Promise(resolve => setTimeout(resolve, 1000)), attempts = 1200 }) {
  let ownerHash;
  for (const label of ['A', 'B']) {
    await open(label);
    await login(label);
    output({ waiting: `Completa Google manualmente en ${label}. No crees datos.`, profile: label });
    let ready = false;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const current = await status();
      const uidHash = current[label]?.uidHash;
      if (label === 'B' && current.A?.uidHash !== ownerHash) throw Error('STOP: la cuenta A ha cambiado.');
      if (uidHash && ownerHash && uidHash !== ownerHash) throw Error('STOP: A y B usan cuentas distintas.');
      // La sesión puede observarse antes de que Firebase cierre el popup.
      if (uidHash && await popupClosed(label)) { ownerHash = uidHash; ready = true; break; }
      await pause();
    }
    if (!ready) throw Error(`Tiempo agotado esperando Google manual en ${label}. No se crean datos.`);
    output({ authenticated: label, popupClosed: true });
  }
  return { sameAccount: true };
}
