// SDK cliente inyectado; no Admin SDK. Solo fixtures nuevas y delimitadas de 8B.2.
export async function fingerprint(uid) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uid)))].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
export async function runSecurityChecks(sdk, db, user, fixture, role, onResult = () => {}) {
  if (db.app.options.projectId !== fixture.projectId || !/^prueba8b2-seguridad-[a-f0-9-]{36}$/.test(fixture.teamId)) throw Error('Destino de seguridad inválido.');
  if (!['owner', 'external', 'signed-out'].includes(role)) throw Error('Caso no previsto.');
  if ((role === 'signed-out') !== !user) throw Error('La sesión no corresponde al caso.');
  const uidHash = user ? await fingerprint(user.uid) : null;
  if (role === 'owner' && uidHash !== fixture.ownerHash) throw Error('Se requiere la cuenta propietaria de pruebas.');
  if (role === 'external' && uidHash === fixture.ownerHash) throw Error('Usa la otra cuenta propia.');
  const team = sdk.doc(db, 'teams', fixture.teamId), game = sdk.doc(team, 'games', 'historia-ficticia');
  const dead = sdk.doc(team, 'games', 'borrado-ficticio'), event = sdk.doc(game, 'events', 'historico-ficticio');
  const tomb = sdk.doc(game, 'eventDeletions', 'deshecho-ficticio');
  const checks = [];
  async function check(name, expected, operation) {
    let result;
    try { await operation(); result = { name, expected, result: 'allowed', code: null }; }
    catch (error) { result = { name, expected, result: 'denied', code: error.code || 'unknown' }; }
    checks.push(result); await onResult(result);
    if ((expected === 'allowed' && result.result !== 'allowed') || (expected === 'denied' && result.code !== 'permission-denied')) {
      throw Object.assign(Error('Resultado inesperado: ' + name + '. Conservar datos y detenerse.'), { checks });
    }
  }
  const payload = { id: 'historia-deportiva-8b2', jornada: 'SEGURIDAD 8B.2', rival: 'Ficticio', createdAt: '2026-10-17T10:00:00Z' };
  const envelope = data => ({ schemaVersion: 1, createdBy: user.uid, createdAt: sdk.serverTimestamp(), sourceId: 'seguridad-8b2', payload: data });
  const shot = () => envelope({ id: 'evento-deportivo-8b2', gameId: payload.id, categoria: 'Categoría histórica ficticia', accion: 'Acción histórica ficticia',
    categoria_id: 'historica_8b2', accion_id: 'historica_8b2_accion', valor_tiro: 2, resultado: 'fallado', tiros_permitidos: [2], fecha_hora: '2020-01-01T10:00:00Z', seq: 7 });
  if (role === 'owner') {
    await check('equipo y propietario atómicos', 'allowed', async () => {
      const batch = sdk.writeBatch(db);
      batch.set(team, { schemaVersion: 1, name: 'PRUEBA 8B.2 SEGURIDAD', ownerUid: user.uid, createdAt: sdk.serverTimestamp() });
      batch.set(sdk.doc(team, 'members', user.uid), { schemaVersion: 1, uid: user.uid, role: 'owner', status: 'active', createdAt: sdk.serverTimestamp() });
      await batch.commit();
    });
    await check('crear partido ficticio', 'allowed', () => sdk.setDoc(game, { ...envelope(payload), deletedAt: null, deletedBy: null }));
    await check('conservar evento histórico ficticio', 'allowed', () => sdk.setDoc(event, shot()));
    await check('leer histórico sin reescritura', 'allowed', async () => {
      const doc = await sdk.getDocFromServer(event);
      if (doc.data().payload.fecha_hora !== '2020-01-01T10:00:00Z' || doc.data().payload.seq !== 7) throw Error('Histórico alterado.');
    });
    await check('inmutabilidad evento', 'denied', () => sdk.updateDoc(event, { 'payload.resultado': 'anotado' }));
    await check('no borrar físicamente evento', 'denied', () => sdk.deleteDoc(event));
    await check('no ascender rol propio', 'denied', () => sdk.updateDoc(sdk.doc(team, 'members', user.uid), { role: 'admin' }));
    await check('no modificar equipo', 'denied', () => sdk.updateDoc(team, { name: 'Alteración ficticia' }));
    await check('crear lápida antes del evento', 'allowed', () => sdk.setDoc(tomb, { schemaVersion: 1, eventId: 'deshecho-ficticio', deletedBy: user.uid, deletedAt: sdk.serverTimestamp(), operationId: 'undo-8b2' }));
    await check('alta tardía tras Deshacer', 'denied', () => sdk.setDoc(sdk.doc(game, 'events', 'deshecho-ficticio'), shot()));
    await check('crear partido ya eliminado', 'allowed', () => sdk.setDoc(dead, { ...envelope({ ...payload, id: 'borrado-deportivo-8b2' }), deletedAt: sdk.serverTimestamp(), deletedBy: user.uid }));
    await check('no resucitar partido', 'denied', () => sdk.updateDoc(dead, { deletedAt: null, deletedBy: null }));
    await check('no escribir bajo partido eliminado', 'denied', () => sdk.setDoc(sdk.doc(dead, 'events', 'tardio'), shot()));
    await check('campos extra rechazados', 'denied', () => sdk.setDoc(sdk.doc(team, 'games', 'invalido'), { ...envelope(payload), deletedAt: null, deletedBy: null, public: true }));
  } else {
    await check('leer equipo ajeno/sin sesión', 'denied', () => sdk.getDocFromServer(team));
    await check('leer partido privado', 'denied', () => sdk.getDocFromServer(game));
    await check('leer evento histórico privado', 'denied', () => sdk.getDocFromServer(event));
    if (role === 'external') {
      await check('crear partido ajeno', 'denied', () => sdk.setDoc(sdk.doc(team, 'games', 'intruso'), { ...envelope(payload), deletedAt: null, deletedBy: null }));
      await check('crear evento ajeno', 'denied', () => sdk.setDoc(sdk.doc(game, 'events', 'intruso'), shot()));
      await check('autoinclusión como propietario', 'denied', () => sdk.setDoc(sdk.doc(team, 'members', user.uid), { schemaVersion: 1, uid: user.uid, role: 'owner', status: 'active', createdAt: sdk.serverTimestamp() }));
      await check('cambiar propietario del equipo', 'denied', () => sdk.updateDoc(team, { ownerUid: user.uid }));
      await check('borrar partido ajeno', 'denied', () => sdk.updateDoc(game, { deletedAt: sdk.serverTimestamp(), deletedBy: user.uid }));
    }
  }
  return { role, uidHash, checks, halted: false };
}
