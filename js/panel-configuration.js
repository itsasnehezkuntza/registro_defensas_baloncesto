// Proyección pura compartida por entrenador y supervisor. Sin persistencia.
const cellKey = (type, defense) => `${type}/${defense}`;
export const cellShots = (section, type, defense) =>
  section.cells?.[cellKey(type.id, defense.id)] ?? [2, 3].filter(value => type.shots.includes(value) && defense.shots.includes(value));

// Configuración de ejecución (solo elementos activos) con la forma que ya usan Registro y Estadísticas.
export function configurationFromDoc(doc) {
  const categories = [];
  for (const section of doc.categories) {
    if (section.id !== 'directo') {
      const actions = section.items.filter(i => !i.retired)
        .map(i => ({ id: i.id, categoryId: section.id, name: i.name, shots: [...i.shots], defenses: [] }));
      if (actions.length) categories.push({ id: section.id, name: section.name, actions });
      continue;
    }
    const defenses = section.defenses.filter(d => !d.retired);
    const actions = section.types.filter(t => !t.retired).map(type => ({
      id: type.id, categoryId: 'directo', name: type.name, shots: [...type.shots],
      defenses: defenses.map(d => ({ id: d.id, name: d.name, shots: cellShots(section, type, d) })).filter(d => d.shots.length)
    })).filter(a => a.defenses.length);
    if (actions.length) categories.push({ id: 'directo', name: section.name, actions });
  }
  return { categories };
}

