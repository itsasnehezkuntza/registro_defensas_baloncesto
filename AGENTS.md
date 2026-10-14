# Instrucciones del proyecto

- Responder y documentar en español. Leer `ESPECIFICACION.md` y los archivos locales antes de modificar código; no depender de versiones ausentes.
- Trabajar por fases y dentro de la tarea autorizada. Actualizar decisiones y avance en la especificación para conservar contexto. La Fase 0 está aprobada; cerrar cada fase solicitada y detenerse para revisión antes de iniciar la siguiente.
- Prioridad: registrar cada tiro en dos pulsaciones, acción/defensa y resultado, en una única página con las tres secciones desplegadas.
- Usar HTML, CSS y JavaScript puro, sin backend, frameworks ni dependencias innecesarias. Compatibilidad con rutas relativas de GitHub Pages. Preparar separación para Capacitor sin implementarlo.
- Centralizar configuración deportiva en `categorias.csv`. Usar IDs estables y conservar nombres/datos históricos; un cambio de configuración nunca borra ni reescribe eventos.
- Exigir partido activo para registrar. Jornada y rival obligatorios al crear; IDs únicos; eliminar únicamente el partido confirmado y sus eventos.
- Usar IndexedDB con migraciones conservadoras, transacciones atómicas y control de concurrencia/doble toque. «Guardado» significa transacción completada. Nunca reiniciar la base para resolver un cambio de esquema.
- Calcular estadísticas solo del partido activo: fallados/intentos × 100. Mostrar bajo acciones únicamente la cifra o un guion. Deshacer afecta solo al último evento de ese partido, incluso tras recargar.
- Exportar exclusivamente CSV del partido activo compatible con Excel. No añadir JSON, estadísticas de temporada ni funcionalidades no solicitadas.
- Verificar según la fase: recargas y conservación de datos, aislamiento de partidos, doble toque, fallos, configuración/histórico, CSV y diseño táctil responsive. No modificar datos reales para probar.
- Al cerrar una tarea, explicar cambios, verificación y decisiones pendientes. No publicar, desplegar ni hacer push sin autorización correspondiente.
