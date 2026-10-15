export function summarize(list) {
  const attempts = list.length;
  const missed = list.filter((e) => e.resultado === "fallado").length;
  const made = list.filter((e) => e.resultado === "anotado").length;
  const pointsAllowed = list.reduce(
    (total, event) => total + (event.resultado === "anotado" ? event.valor_tiro : 0), 0
  );
  return { attempts, missed, made, pointsAllowed };
}

// Formato solicitado: fallados/aciertos, un resultado por evento sin ponderar 2/3.
export function outcomeText(stat) {
  return stat.attempts ? `${stat.missed}/${stat.made}` : "—";
}

// Mismo texto que outcomeText; solo añade marcado para resaltar los aciertos (V4).
export function outcomeMarkup(stat) {
  return stat.attempts ? `<b>${stat.missed}</b>/<span class="made">${stat.made}</span>` : '<span class="score-empty">—</span>';
}

// Registro (Fase 9B): anotados/intentos, en número de tiros (no puntos). Ejemplo: 2/6.
export function attemptsText(stat) {
  return stat.attempts ? `${stat.made}/${stat.attempts}` : "—";
}
export function attemptsMarkup(stat) {
  return stat.attempts ? `<span class="made">${stat.made}</span>/<b>${stat.attempts}</b>` : '<span class="score-empty">—</span>';
}
// Marcador del Registro: puntos concedidos / puntos intentados (suma de valores 2/3 de todos los tiros).
export function pointsAttempted(list) {
  return list.reduce((total, event) => total + (Number(event.valor_tiro) || 0), 0);
}

// Conservado para comprobaciones de puntos; no es el formato visible vigente.
export function pointsText(stat) {
  return stat.attempts ? String(stat.pointsAllowed) : "—";
}

export function statText(stat) {
  if (!stat.attempts) return "—";
  return `${stat.missed}–${stat.made} · ${Math.round(100 * stat.missed / stat.attempts)}%`;
}


// Solo presentación: los valores proceden del resumen numérico, nunca de nombres editables.
export function statMarkup(stat) {
  if (!stat.attempts) return statText(stat);
  return `<span class="stat-missed">${stat.missed}</span>–<span class="stat-made">${stat.made}</span> · ${Math.round(100 * stat.missed / stat.attempts)}%`;
}
