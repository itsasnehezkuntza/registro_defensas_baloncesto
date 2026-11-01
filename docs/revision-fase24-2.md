# Revisión y entrega local — Fase 24.2

1 de noviembre de 2026. Base remota verificada: main `4a9e639d26533e475c03b83a537d0aad2657de73`; aplicación pública 23.0. Rama nueva mantenimiento/fase24-2 en clon independiente. develop no es la base de trabajo. Implementación exclusivamente documental. Este informe conserva la validación local previa al commit; el estado de revisión e integración se consulta en CONTINUIDAD.md y en la PR.

## Estructura resultante

```text
README.md                 Presentación y enlaces vigentes
AGENTS.md                 Reglas breves para Codex
ESPECIFICACION.md         Contrato funcional/técnico de 23.0
CONTINUIDAD.md            Estado, referencias y pendientes
DESARROLLO.md             Instalación y pruebas (24.1, referencias actualizadas)
MEJORAS_OPCIONALES.md     MOP-001, conservado
docs/arquitectura.md      Almacenamiento, sincronización y permisos
docs/supervision.md       Consulta y administración controlada por UID/equipo
docs/pendientes.md        Prioridades y límites de evidencia
docs/inventario-documental.md
docs/revision-fase24-2.md
docs/historico/README.md  Índice y mapa de decisiones
docs/historico/FASE*.md   31 informes completos
docs/historico/*-antes-de-24-2.md   5 documentos principales anteriores
docs/historico/trazabilidad.json  Hashes y cambios reversibles de enlaces
```

## Archivos y conservación

Se reescriben README.md, AGENTS.md, ESPECIFICACION.md y CONTINUIDAD.md; DESARROLLO.md solo actualiza base, encabezado y referencias documentales. Sus cinco originales se archivan completos. Se trasladan los 31 informes FASE*.md al histórico; FASE20_PUBLICACION.md y FASE8C_PUBLICACION.md dejan alias breves en raíz por referencias literales en herramientas antiguas. No son nuevas fuentes de estado vigente.

Se crean las cinco guías actuales de docs (arquitectura, supervisión, pendientes, inventario y esta revisión), el índice histórico y trazabilidad.json. El [inventario](inventario-documental.md) enumera los 51 documentos originales y sus destinos; [trazabilidad](historico/trazabilidad.json) enumera exactamente los 36 cuerpos archivados. Las 14 guías de tests/tools y MEJORAS_OPCIONALES.md se conservan byte por byte. No se retira ningún prototipo, fixture o herramienta.

Antes de mover: inventario de rutas, enlaces, tamaños y SHA256; respaldo íntegro de los 51 Markdown dentro de evidencias ignoradas. Para los históricos solo se adaptan enlaces y se convierten tres destinos previamente ausentes en citas de código literal. La inversión de esas sustituciones debe recuperar el SHA256 del blob original de cada documento, normalizando LF para comparar distintos checkouts. El original también es localizable en el commit base de Git. No se pierde la cronología ni el contexto de ninguna decisión.

## Contradicciones resueltas con evidencia

| Texto anterior | Descripción vigente y evidencia de 23.0 |
|---|---|
| README anunciaba 8C, 20, 22 y candidato 23 como estados presentes | 23.0 es la versión pública; main 4a9e639 incorpora 24.1 sin nueva aplicación. [Metadato HTML](../index.html), [publicación 23](historico/FASE23_PUBLICACION.md) y referencia Git de la base. Anuncios íntegros en [README anterior](historico/README-antes-de-24-2.md). |
| Cuenta exige activar Sync manualmente y puede seguir Solo local con cuenta | Google prepara equipo y Sync automáticamente; sin cuenta es una experiencia distinta. [sync-ui.js](../js/sync-ui.js) y [account22.test.mjs](../tools/firebase/account22.test.mjs): primera sesión, varios equipos y consentimiento antiguo ignorado. |
| Cerrar sesión ofrece Salir igualmente y puede descartar pendientes | Esperar/cancelar y purga protegida, con UNSYNCED_DATA comprobado en la transacción. [cuenta-ui.js](../js/cuenta-ui.js), [sync-storage.js](../js/sync-storage.js) y escenarios de cierre protegido de [account22](../tools/firebase/account22.test.mjs). |
| Panel guardado solo en dispositivo, preparado para una sincronización futura | Panel y plantilla ya sincronizados, versiones inmutables y reloj del padre. [Modelo](../js/panel-model.js), [transporte](../js/firestore-sync.js), [reglas](../firestore.rules) y [panels14.test.mjs](../tools/firebase/panels14.test.mjs). |
| Todo partido vacío sigue los cambios del CSV | Solo el ámbito local que sigue el archivo; en equipo sincronizado se conserva el snapshot aunque esté vacío. versionForGame en [configuración guardada](../js/configuracion-guardada.js) y [pruebas del panel](../tests/configuracion-guardada.test.mjs). |
| Párrafos de Estadísticas presentan fallados/aciertos como marcador general | Registro y Dashboard muestran anotados/intentos; éxito defensivo conserva fallados/intentos. La utilidad outcomeText sigue representando fallados/aciertos y no se cambia. [app.js](../app.js), [Dashboard](../js/dashboard.js), [prueba visual vigente](../tools/playwright/visual.spec.mjs) y [utilidad probada](../tests/estadisticas.test.mjs). |
| Auditoría de 8C describe descarga de todas las colecciones cada cinco segundos | El entrenador usa escuchas del equipo; hay ciclos de cola/reintento, sin reconsultas completas sin cambios. No afirmar que solo escucha el partido visible. [watch](../js/firestore-watch.js), [motor](../js/sync-engine.js) y [watch.test.mjs](../tools/firebase/watch.test.mjs). |
| Sin cuenta se interpreta como cero red en cualquier apertura | Cero red con elección local recordada; la pantalla inicial prepara SDK para un toque en Google. Decisión original 67 y [cuenta-ui.js](../js/cuenta-ui.js), comprobaciones existentes en [local-browser.mjs](../tools/firebase/local-browser.mjs). |
| Los informes 23/24.1 todavía se describen como candidatos locales no publicados | Se archivan con su fecha/contexto. El presente distingue publicación 23.0, integración de 24.1 y preparación exclusivamente local de 24.2; no se reescribe una autorización histórica. |

No se ha resuelto ninguna regla funcional por intuición. Las referencias a pruebas son evidencia de contratos existentes, no nuevas ejecuciones de esas baterías. No se ha cambiado código para hacer coincidir la documentación.

## Límites y cuestiones que siguen abiertas

No se acredita el estado actual de datos deportivos, permisos reales o una causa de pérdida histórica: no se han consultado. Tampoco se extrapolan pruebas físicas anteriores a Supervisión o a todos los iPad. La cancelación individual del nombre requiere concretar alcance y sigue pendiente; Quitar/Eliminar y MOP-001 tampoco se implementan. [Pendientes priorizados](pendientes.md).

Tres enlaces ya ausentes se mantienen como referencias literales: dos recibos privados de Fase 23.1 y PRUEBA_SAFARI_IPAD.md. No se fabrica evidencia ni se copia desde develop. Los destinos HTTP antiguos se incluyen en el inventario, pero su disponibilidad no se valida; algunos previews caducaron.

## Resultados de verificación

| Comprobación | Resultado |
|---|---|
| npm ci en el clon independiente | Correcto: 779 paquetes; dependencias y lockfile sin cambios. |
| npm run check | Correcto: 63 scripts y referencias públicas; no ejecuta la aplicación. |
| npm test | 12 archivos correctos, cero fallos. |
| Enlaces Markdown | 64 documentos; 324 enlaces locales válidos de 374 totales; cero errores. Los 50 HTTP constan en el inventario, no se prueban. |
| Histórico | 36 documentos recuperables íntegramente; hashes del blob original validados tras invertir enlaces y normalizar LF. |
| Archivos ajenos a Markdown de la base | 323/323 idénticos por SHA256, incluidos código, pruebas, herramientas, configuraciones y dependencias. |
| Guías conservadas en su ubicación | 14 de tests/tools y MEJORAS_OPCIONALES.md sin cambios. |
| Producción, reglas y lockfile | 45/45 archivos con exactamente los bytes del clon inicial. |
| Formato del diff completo | Correcto, incluidos nuevos documentos, mediante índice temporal separado; índice real vacío. |
| develop | 368 rutas iguales, mismo HEAD, estado Git y worktrees. |
| Producción HTTPS | Metadato público 23.0, build 23.0-3c1018ebaed68c92. Pages conserva 062343707cdfc54a764ca7ae18f98fd5aedfe750. |
| Git del clon | HEAD/base 4a9e639, rama mantenimiento/fase24-2; sin commits nuevos, sin push/fusión. |

No se repitieron navegador, WebKit ni Emulator: el cambio es exclusivamente documental. No se consultaron o modificaron Firebase, Authentication, permisos o datos deportivos reales. Las pruebas nativas no usan el perfil/IndexedDB de dispositivos del usuario.


La verificación de enlaces incluye todos los Markdown finales, sus destinos locales y fragmentos; código literal no se trata como enlace. No se descargan recibos ni se ejecuta documentación histórica. La aplicación pública no se despliega; los 43 archivos fuente, reglas y lockfile se comparan byte por byte con el clon inicial y por blobs de Git.

## Recomendación de integración

Revisar el diff documental y este inventario. Con autorización separada, preparar un commit exclusivo en mantenimiento/fase24-2 y una PR hacia main; no mezclar develop, cachés o evidencias privadas. Aprovechar detección de renombres para revisar los textos trasladados y exigir que los cambios históricos fuera de enlaces sean cero. La entrega local inicial no incluía commit ni PR. La revisión posterior autoriza un commit documental y una PR en borrador; fusión y despliegue siguen fuera de ese alcance.

Para revertir la propuesta local, conservar el clon y no aplicar su diff; los originales íntegros siguen en el commit base y en el respaldo de esta fase. No borrar el workspace histórico ni ejecutar reset/clean. No hay cambios deportivos que revertir.
