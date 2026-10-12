const HEADERS = ["categoria_id", "categoria", "accion_id", "accion", "defensa_id", "defensa", "tiros"];
const CATEGORY_IDS = ["transicion", "estatico", "directo"];

function fail(line, message) {
  throw new Error("categorias.csv · línea " + line + ": " + message);
}

// Admite BOM, CRLF, campos entre comillas, comillas dobles y saltos en campos.
export function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rows = [];
  let fields = [], value = "", quoted = false, closed = false, line = 1, start = 1;
  const field = () => { fields.push(value); value = ""; closed = false; };
  const row = () => {
    field();
    if (fields.some(v => v.trim())) rows.push({ fields, line: start });
    fields = []; start = line + 1;
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { value += '"'; i++; }
        else { quoted = false; closed = true; }
      } else { value += ch; if (ch === "\n") line++; }
    } else if (ch === ";") field();
    else if (ch === "\n") { row(); line++; }
    else if (closed) fail(line, "carácter inesperado después de cerrar comillas.");
    else if (ch === '"') {
      if (value) fail(line, "las comillas deben comenzar al inicio del campo.");
      quoted = true;
    } else value += ch;
  }
  if (quoted) fail(start, "campo entre comillas sin cerrar.");
  if (fields.length || value || closed) row();
  return rows;
}

export function parseConfiguration(text) {
  const rows = parseCsv(text);
  if (!rows.length || rows[0].fields.map(v => v.trim()).join(";") !== HEADERS.join(";")) {
    fail(1, "cabecera incorrecta. Se espera: " + HEADERS.join(";"));
  }
  if (rows.length === 1) fail(2, "no hay acciones configuradas.");
  const categories = new Map(), actions = new Map(), defenses = new Map(), combinations = new Set();
  for (const { fields, line } of rows.slice(1)) {
    if (fields.length !== HEADERS.length) fail(line, "se esperan 7 columnas separadas por ;.");
    const [categoryId, categoryName, actionId, actionName, defenseId, defenseName, shotsText] = fields.map(v => v.trim());
    if (!CATEGORY_IDS.includes(categoryId)) fail(line, "categoria_id debe ser transicion, estatico o directo.");
    if (!categoryName || !actionName || !actionId) fail(line, "categoría, acción y accion_id son obligatorios.");
    for (const id of [categoryId, actionId, defenseId].filter(Boolean)) {
      if (!/^[a-z][a-z0-9_]*$/.test(id)) fail(line, "ID inválido: " + id + ". Usa minúsculas, números y guion bajo.");
    }
    if (categoryId === "directo" ? !defenseId || !defenseName : defenseId || defenseName) {
      fail(line, categoryId === "directo" ? "el bloqueo directo requiere defensa_id y defensa." : "las acciones simples deben dejar la defensa vacía.");
    }
    const parts = shotsText.split(",").map(v => v.trim());
    if (!parts.length || parts.some(v => v !== "2" && v !== "3") || new Set(parts).size !== parts.length) {
      fail(line, "tiros debe ser 2, 3 o 2,3, sin duplicados.");
    }
    const shots = parts.map(Number);
    let category = categories.get(categoryId);
    if (category && category.name !== categoryName) fail(line, "nombres contradictorios para categoria_id " + categoryId + ".");
    if (!category) { category = { id: categoryId, name: categoryName, actions: [] }; categories.set(categoryId, category); }
    let action = actions.get(actionId);
    if (action && (action.categoryId !== categoryId || action.name !== actionName)) {
      fail(line, "accion_id reutilizado con distinta categoría o nombre: " + actionId + ".");
    }
    if (!action) {
      action = { id: actionId, categoryId, name: actionName, shots, defenses: [] };
      actions.set(actionId, action); category.actions.push(action);
    }
    if (defenseId) {
      if (defenses.has(defenseId) && defenses.get(defenseId) !== defenseName) fail(line, "nombres contradictorios para defensa_id " + defenseId + ".");
      defenses.set(defenseId, defenseName);
    }
    const key = [categoryId, actionId, defenseId].join("/");
    if (combinations.has(key)) fail(line, "combinación duplicada: " + key + ".");
    combinations.add(key);
    if (defenseId) action.defenses.push({ id: defenseId, name: defenseName, shots });
  }
  return { categories: [...categories.values()] };
}

export async function loadConfiguration(url = new URL("../categorias.csv", import.meta.url), fetcher = globalThis.fetch) {
  let response;
  try { response = await fetcher(url, { cache: "no-store" }); }
  catch { throw new Error("No se puede cargar categorias.csv. Abre la aplicación mediante un servidor estático o GitHub Pages."); }
  if (!response.ok) throw new Error("No se puede cargar categorias.csv (HTTP " + response.status + ").");
  return parseConfiguration(await response.text());
}
