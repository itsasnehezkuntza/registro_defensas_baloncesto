import { eventIdentity } from "./identidad.js";

export function triggerDownload(filename, mime, contents) {
  const blob = new Blob([contents], { type: mime });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10000);
}

function csvCell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  // Excel/LibreOffice: neutraliza fórmulas introducidas en campos editables.
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function csvFilename(game) {
  const encoder = new TextEncoder();
  const part = (value, limit) => {
    const cleaned = String(value ?? "").normalize("NFKC")
      .replace(/[<>:"/\\|?*\x00-\x1f\x7f]/g, "-").trim().replace(/^[. ]+|[. ]+$/g, "");
    let text = "", bytes = 0;
    for (const character of cleaned) {
      const size = encoder.encode(character).length;
      if (bytes + size > limit) break;
      text += character; bytes += size;
    }
    return text || "sin-dato";
  };
  return `registro-defensivo-J${part(game.jornada, 64)}-${part(game.rival, 64)}-${part(game.id, 48)}.csv`;
}

export function buildCsv(records, game = null) {
    if (game && records.some(event => event.gameId !== game.id)) {
      throw new Error("La exportación contiene registros de otro partido.");
    }
    const headers = [
      "ID evento", "ID partido", "Jornada", "Rival", "Categoría defensiva", "Acción",
      "Tipo de bloqueo", "Defensa", "Valor tiro", "Resultado",
      "Intentos", "Anotados", "Fallados", "Puntos concedidos", "Fecha y hora (UTC)",
      "ID categoría", "ID acción", "ID defensa", "Orden de registro"
    ];
    const rows = [...records].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0)).map((event) => {
      const identity = eventIdentity(event);
      return [
      event.id, event.gameId, event.jornada ?? game?.jornada, event.rival ?? game?.rival, event.categoria, event.accion,
      event.tipo_bloqueo, event.estrategia, event.valor_tiro, event.resultado,
      1, Number(event.resultado === "anotado"), Number(event.resultado === "fallado"),
      event.resultado === "anotado" ? event.valor_tiro : 0, event.fecha_hora,
      identity?.category, identity?.action, identity?.defense, event.seq
    ]; });
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
    return csv;
}
