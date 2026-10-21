// Muestra ficticia y determinista para capturas y comprobaciones V4.
// Se escribe con los módulos reales en un contexto efímero; nunca en un perfil del usuario.
export const SAMPLE_PATTERN = {
  // [fallados, aciertos] por acción simple; los vacíos comprueban el guion.
  transicion_bajo_aro: [1, 3], transicion_spot_up_3: [2, 1],
  estatico_1c1_exterior: [3, 2], estatico_1c1_interior: [2, 2], estatico_pin_down: [1, 2], estatico_cortes: [4, 1],
  estatico_spot_up_3: [4, 1], estatico_bajo_aro: [1, 3], estatico_spain: [0, 0]
};
// Bloqueo directo: [fallados, aciertos] por defensa (columnas) y tipo (filas).
export const DIRECT_PATTERN = {
  pr_manejador: { black: [2, 1], white: [3, 0], blue: [1, 1], red: [0, 1], tut: [2, 1] },
  pr_roller: { black: [1, 1], blue: [0, 2], red: [1, 0], tut: [2, 1], next: [1, 0] },
  pr_pop: { black: [1, 1], white: [2, 0], blue: [1, 1], red: [1, 2], tut: [0, 1], dance: [3, 1] }
};

export async function seedSample(page) {
  return page.evaluate(async ({ simple, direct }) => {
    const store = await import('./js/persistencia.js');
    const { loadConfiguration } = await import('./js/configuracion.js');
    const { resolveSelection, makeShotEvent } = await import('./js/registro.js');
    const state = await store.readState();
    if (state.games.length !== 1 || state.events.length) throw Error('Contexto no aislado: se detiene');
    const config = await loadConfiguration(), game = state.games[0];
    let total = 0;
    for (const category of config.categories) for (const action of category.actions) {
      for (const defense of action.defenses.length ? action.defenses : [null]) {
        const pair = defense ? direct[action.id]?.[defense.id] : simple[action.id];
        if (!pair) continue;
        const selection = resolveSelection(config, { category: category.id, actionId: action.id, strategyId: defense?.id ?? null });
        const results = [...Array(pair[0]).fill('fallado'), ...Array(pair[1]).fill('anotado')];
        for (const [i, result] of results.entries()) {
          await store.addEvent(makeShotEvent(crypto.randomUUID(), game, selection, selection.shots[i % selection.shots.length], result), selection.shots);
          total++;
        }
      }
    }
    return total;
  }, { simple: SAMPLE_PATTERN, direct: DIRECT_PATTERN });
}
