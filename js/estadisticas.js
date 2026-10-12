export function summarize(list) {
  const attempts = list.length;
  const missed = list.filter((e) => e.resultado === "fallado").length;
  const made = list.filter((e) => e.resultado === "anotado").length;
  const pointsAllowed = list.reduce(
    (total, event) => total + (event.resultado === "anotado" ? event.valor_tiro : 0), 0
  );
  return { attempts, missed, made, pointsAllowed };
}

export function statText(stat) {
  if (!stat.attempts) return "—";
  return `${stat.missed}/${stat.attempts} — ${Math.round(100 * stat.missed / stat.attempts)}%`;
}

