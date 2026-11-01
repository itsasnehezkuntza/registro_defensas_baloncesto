# Pendientes y límites conocidos

Base: main 4a9e639, aplicación 23.0. Orden documental por protección de datos, validación y usabilidad; anotar un trabajo no autoriza ejecutarlo. No se han consultado datos reales en Fase 24.2.

## 1. Datos y respaldo independiente

El [contexto anterior](historico/CONTINUIDAD-antes-de-24-2.md) conserva una posible recuperación de partidos reales y un respaldo independiente como siguientes trabajos. Se necesita confirmar si siguen siendo necesarios y delimitar una autorización de diagnóstico. **No hay evidencia en esta fase de una pérdida actual ni de una causa nueva.** No resetear IndexedDB, purgar colas, volver a importar o mezclar dispositivos para investigar.

Límites vigentes: la persistencia solicitada al navegador no garantiza retención indefinida. El original oculto de una importación no sigue los cambios posteriores de la nube. CSV sirve para análisis y no existe importación/restauración desde CSV. Los conflictos se conservan; no hay una pantalla general de resolución. [Decisión sobre originales](historico/ESPECIFICACION-antes-de-24-2.md), apartado 66, y [arquitectura](arquitectura.md).

## 2. Validación física y acceso administrativo

Pendiente la prueba física de Supervisión en Safari/iPad. Las pruebas de Chromium/WebKit no equivalen al dispositivo real. No extrapolar las aceptaciones físicas de fases anteriores a funciones posteriores; la validación global de 22.1 no acredita Supervisión 23.0. El dispositivo antiguo y la persistencia prolongada no quedan universalmente acreditados. [Procedimiento y alcance](supervision.md).

Asignar equipos reales al UID del administrador es una actuación futura separada, con propietario y autorización verificados. Esta fase no comprueba permisos actuales ni crea ninguno. Los previews antiguos y sus fechas no son entornos vigentes que deban renovarse automáticamente.

## 3. Peticiones expresas del editor

- Cancelar o deshacer el cambio de nombre de un elemento, con alcance pendiente de concretar para elementos existentes y nuevos. Es diferente de Deshacer un tiro o cancelar todo el panel.
- Sustituir Quitar por Eliminar y revisar mensajes asociados sin alterar históricos.

Siguen pendientes: la [solicitud original](historico/ESPECIFICACION-antes-de-24-2.md), apartado 74, los distingue de mejoras de prioridad baja. [editor.js](../js/editor.js) aún muestra Quitar y mantiene la cancelación del panel completo; no se implementan aquí.

## 4. Opcional

[MOP-001](../MEJORAS_OPCIONALES.md): evitar desplazamiento vacío cuando todo cabe, conservando el desplazamiento necesario, giro y ampliación de texto. Prioridad baja; requiere comprobar Safari/iPad real antes de decidir.

## Mantenimiento futuro separado

La Fase 24.1 dejó avisos de paquetes transitivos antiguos y scripts de instalación no autorizados por la política local de npm; no se actualizó el lockfile ni se aplicó audit fix. Revisar dependencias o proponer GitHub Actions requiere alcance nuevo. No borrar prototipos, herramientas o fixtures por su nombre: algunos siguen siendo usados por pruebas actuales. [Inventario](inventario-documental.md) y [desarrollo](../DESARROLLO.md).

Eliminados del listado de pendientes actuales: activación manual de Sync, sincronización del panel, protección de cierre y publicación de Supervisión, porque ya están implementados en 23.0. Los documentos históricos conservan sus estados de preparación originales.
