// Compatibilidad de lectura con eventos v1. No es configuración deportiva.
// Tabla fija de nombres originales: no editar al renombrar categorias.csv.
const LEGACY = [
  [
    "Transición",
    "Bajo aro",
    "transicion",
    "transicion_bajo_aro"
  ],
  [
    "Transición",
    "Spot up 3",
    "transicion",
    "transicion_spot_up_3"
  ],
  [
    "Estático",
    "1c1 exterior",
    "estatico",
    "estatico_1c1_exterior"
  ],
  [
    "Estático",
    "1c1 interior",
    "estatico",
    "estatico_1c1_interior"
  ],
  [
    "Estático",
    "Pin down",
    "estatico",
    "estatico_pin_down"
  ],
  [
    "Estático",
    "Cortes",
    "estatico",
    "estatico_cortes"
  ],
  [
    "Estático",
    "Spot up 3",
    "estatico",
    "estatico_spot_up_3"
  ],
  [
    "Estático",
    "Bajo aro",
    "estatico",
    "estatico_bajo_aro"
  ],
  [
    "Bloqueo directo",
    "PR Manejador",
    "directo",
    "pr_manejador"
  ],
  [
    "Bloqueo directo",
    "PR Roller",
    "directo",
    "pr_roller"
  ],
  [
    "Bloqueo directo",
    "PR Pop",
    "directo",
    "pr_pop"
  ],
  [
    "Bloqueo directo",
    "Spain",
    "directo",
    "spain"
  ]
];
const DEFENSE_IDS = { Black: "black", White: "white", Blue: "blue", Red: "red", Tut: "tut" };

export function eventIdentity(event) {
  if (event.categoria_id && event.accion_id) {
    return { category: event.categoria_id, action: event.accion_id, defense: event.defensa_id ?? null };
  }
  const matches = LEGACY.filter(([category, action]) =>
    category === event.categoria && action === event.accion &&
    (category !== "Bloqueo directo" || event.tipo_bloqueo === action));
  if (matches.length !== 1) return null;
  const [, , category, action] = matches[0];
  const defense = category === "directo" ? DEFENSE_IDS[event.estrategia] : null;
  if (category === "directo" && !defense) return null;
  return { category, action, defense };
}

export function matchesEvent(event, category, action, defense) {
  const identity = eventIdentity(event);
  return Boolean(identity && identity.category === category &&
    (action === undefined || identity.action === action) &&
    (defense === undefined || identity.defense === defense));
}
