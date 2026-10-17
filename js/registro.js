// Resuelve IDs contra la configuración cargada, sin confiar en textos del DOM.
export function resolveSelection(configuration, ids) {
  const category = configuration?.categories.find(item => item.id === ids?.category);
  const action = category?.actions.find(item => item.id === ids?.actionId);
  if (!action) return null;
  const defense = action.defenses.find(item => item.id === ids.strategyId);
  if (category.id === "directo" ? !defense : ids.strategyId != null) return null;
  return Object.freeze({ category: category.id, categoryName: category.name,
    actionId: action.id, action: action.name, strategyId: defense?.id ?? null,
    strategy: defense?.name ?? null, shots: Object.freeze([...(defense?.shots ?? action.shots)]) });
}

export function makeShotEvent(id, game, selection, points, result) {
  if (!selection || !selection.shots.includes(points) || !["anotado", "fallado"].includes(result)) {
    throw new Error("El resultado no está permitido para esta acción.");
  }
  return { id, gameId: game.id, jornada: game.jornada, rival: game.rival,
    categoria_id: selection.category, categoria: selection.categoryName,
    accion_id: selection.actionId, accion: selection.action,
    defensa_id: selection.strategyId, estrategia: selection.strategy,
    tipo_bloqueo: selection.strategyId ? selection.action : null,
    tiros_permitidos: [...selection.shots], valor_tiro: points, resultado: result,
    fecha_hora: new Date().toISOString() };
}
