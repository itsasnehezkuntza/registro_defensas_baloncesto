# Registro defensivo de baloncesto — especificación

**Estado vigente — 31 de octubre de 2026: versión 23.0 publicada y verificada**, con supervisión por UID/equipo, solo lectura y reglas efectivas. [Detalle, referencias y revocación ficticia](FASE23_PUBLICACION.md). Build 23.0-3c1018ebaed68c92; fuentes 8fbca8e80adaf99adc99089c362766beb80de82d; Pages 062343707cdfc54a764ca7ae18f98fd5aedfe750. Regla activa projects/registro-defensivo/rulesets/f8b43ea9-7556-4ca3-9f76-96fbefec5734. Publicación controlada autorizada, 44 hashes y 13 rutas internas 404; pruebas reales limitadas a ficción correctas. ACL temporal revoked, sin asignaciones reales. develop original preservado. Detenido para revisión final. Las entradas siguientes son históricas.

**Estado actual — 29 de octubre de 2026: versión 22.0 publicada y verificada para todos en GitHub Pages.** Fases 21 y 22 juntas, tras autorización expresa y validación física de 22.1. URL habitual https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/ . Fuentes `6bfe942d32de8b4fe6efef8cafd48f533acbd339`, Pages `3aed91f329ed00b672b16ae6002a41e9acf68001`, build `22.0-568698c631fa8c1b`. Build Pages correcto, 39 hashes HTTPS y 12 rutas internas 404; actualización simulada 20→22 correcta en Chromium/WebKit y arranque público sin errores/CSP/Firestore. Respaldos remotos de main y Pages creados; develop y acumulado conservados. Sin cambios de reglas, Authentication, Hosting o datos reales durante esta publicación. Recargar la URL habitual con conexión en todos los dispositivos, sin borrar almacenamiento. Alcance en [FASE22_PUBLICACION.md](FASE22_PUBLICACION.md); resumen para continuar y pendientes reales en [CONTINUIDAD.md](CONTINUIDAD-antes-de-24-2.md). Las notas siguientes conservan el histórico de fases previas.

**Fase 22.1 — 29 de octubre de 2026: validación física confirmada por el usuario, detenida para revisión de publicación conjunta.** Tras la guía A–D de Safari/iPad, el usuario confirma: «Acabo de hacer lo que me has pedido y funciona». Confirmación global de cuenta/equipo/Sync automático, recepción entre dispositivos, reconexión y modo local/históricos; sin nuevas escrituras de prueba ni inspección de datos por el agente. Candidato `22.1-3cd65834dc6e9da4`, versión Hosting `7746df95101a2bd6`, únicamente en https://registro-defensivo--fase22-1-bsovr4vx.web.app , caduca el 30 de octubre a las 17:09 de Madrid, sin renovación. Revisión de paquete y hashes HTTPS correcta; dominio nuevo añadido con autorización expresa, sin otros cambios Auth, reglas o Hosting live. Código y Git conservados, sin Pages, commit ni push; aplicación habitual 20.0. Recomendación favorable a publicar juntas Fases 21 y 22, pendiente de autorización expresa para el despliegue definitivo. Evidencia y límites en [FASE22_1_VALIDACION_IPAD.md](FASE22_1_VALIDACION_IPAD.md).

**Fase 22 — 29 de octubre de 2026: simplificación de acceso y sincronización implementada localmente, detenida para revisión.** Google activa automáticamente Sync y requiere equipo antes de registrar; modo sin cuenta independiente. Equipo único automático, selección válida recordada o elección entre varios. Históricos solo mediante revisión confirmada; cierre protegido ante pendientes y purgas tardías. 28 grupos nuevos de acceso correctos en Chromium/WebKit y regresiones de Sync (40), Fase 21 (42), arranque, editor, deporte y CSV correctas. Se conserva íntegra la corrección de Fase 21. Sin nuevas reglas, esquema, dependencias, migraciones reales, commits, push ni despliegue. Versión pública 20.0. Detalle, límites de Safari y revisión en [FASE22_CUENTAS.md](FASE22_CUENTAS.md).

**Fase 21 — 29 de octubre de 2026: corrección local terminada, detenida para revisión, sin publicar.** El guardado del panel local comprueba existencia del partido y ausencia de tiros en la misma transacción `readwrite` sobre `games`, `events` y `settings` que guarda versión/asociación. Rechazos `HAS_EVENTS` y `GAME_NOT_FOUND`, sin escrituras parciales. IndexedDB sin cambio de esquema; camino sincronizado conservado. Reproducción del fallo 20.0 y 42 grupos nuevos correctos en Chromium/WebKit (v1/v2), además de regresiones deportivas, editor y 40 grupos Sync en emuladores. Estado previo respaldado; sin commit, push ni despliegue. Alcance, comandos y límites en [FASE21_INTEGRIDAD_LOCAL.md](FASE21_INTEGRIDAD_LOCAL.md). La versión pública sigue siendo 20.0.

**Estado actual — 21 de octubre de 2026: versión 20.0 publicada y verificada para todos en GitHub Pages.** Fuentes `86cf617`, Pages `647aeb5`, mismo origen habitual. Incluye lo terminado hasta Fase 19 y reglas de Fase 14 coordinadas (`901339e9-c122-463f-98e2-a5a02d34439a`). 39 hashes HTTPS, build, reglas y navegador correctos; respaldos remotos y datos conservados. Detalles y límites en [FASE20_PUBLICACION.md](FASE20_PUBLICACION.md), apartado 75. Cancelar/Deshacer el nombre, «Eliminar» y MOP-001 quedan pendientes. Los dispositivos deben recargar la página. Las notas de estado anteriores que siguen son históricas y no sustituyen este resumen.

**Continuidad para mañana (21 de octubre de 2026):** el usuario confirma «Ya funciona perfecto!!» tras la corrección del cursor de Fase 19; prueba física favorable. Pide dejar anotados, sin implementar hoy, los dos cambios del editor del apartado 74.

**Última corrección — Fase 19 terminada y detenida para revisión física:** `19-79f88c07bb7931b7` publicado solo en el mismo canal temporal `ipad17`, con el cursor conservado al escribir nombres (apartado 73). Datos previos, enlace y caducidad intactos. Cerrar/reabrir Safari queda confirmado por el usuario; la corrección del editor espera su prueba. La aplicación habitual sigue en 8C.0.

**Estado actual — 20 de octubre de 2026:** versión publicada habitual documentada: **8C.0**. Fases 10 a **15 terminadas, sin publicar en la aplicación habitual**; A3 corregido en Fase 11 (apartado 61), M4 en Fase 12 (apartado 62), M5 en Fase 13 (apartado 63), M6 en Fase 14 (apartado 64) y B7/CSP en Fase 15 (apartado 65). Publicar M6 requiere coordinar código/reglas y actualizar dispositivos. Sin commit ni push; único despliegue posterior, la copia aislada de Fase 17B descrita debajo. Las entradas fechadas siguientes conservan el histórico y no sustituyen este resumen.

**Decisiones posteriores aprobadas:** conservar los originales importados como respaldo oculto y la preferencia de equipo al cerrar sesión (apartado 66; B6 cerrado por decisión), y cargar el SDK en la pantalla de inicio para abrir Google con un toque (apartado 67). Con «sin cuenta» recordado no se carga el SDK ni hay solicitudes externas. Ambas decisiones mantienen el comportamiento existente, sin modificar código.

**Fase 16 / B4 cerrada y verificada en Authentication real** (apartado 68): retirado con autorización únicamente `registro-defensivo--ipad-8b2-40nbq9cf.web.app`; canal ya inexistente y otros cuatro dominios conservados. La aplicación y reglas no se han publicado. Copia previa `.local-backups/fase16-dominio-20261020/`.

**Fase 17B publicada con autorización y verificada** (apartado 70): candidato `17-ff347879fc8976cc` en `https://registro-defensivo--ipad17-ot4rlj0m.web.app`, caduca el 21 de octubre a las 22:22:43 de Madrid. Google disponible, Sync bloqueado y único dominio añadido a Authentication; otros dominios, Hosting live y referencia de reglas conservados. Preparación en apartado 69; prueba física pendiente del usuario. Respaldo `.local-backups/fase17b-publicacion-20261020/`.

**Fase 18 corregida y confirmada físicamente por el usuario**, publicada solo en el canal temporal (apartado 71): build actual `18-eda58c0c0461ab73`, mismo enlace/caducidad, inicio y Registro excluyentes y cargas acotadas. Tras confirmar Google en iPad nuevo, el usuario responde «Funciona perfecto!!» a comprobar la corrección. El antiguo sigue sin compatibilidad confirmada. Datos de prueba conservados y live/Pages/reglas/Auth intactos; demás pasos físicos pendientes. Véase [FASE18_INICIO_IPAD.md](FASE18_INICIO_IPAD.md).

**Prueba física de registro y recarga confirmada:** el usuario indica «He recargado y se guardan» tras pedirle registrar tiros ficticios y recargar en el iPad nuevo. Se confirma conservación local en esa recarga; no persistencia prolongada ni sincronización (Sync OFF).

**CSV, Deshacer, uso sin conexión, estadísticas y orientaciones físicos confirmados:** el usuario acepta estos pasos guiados en el iPad nuevo, incluida conservación tras reconectar/recargar y revisión de estadísticas en vertical/horizontal. Sync sigue OFF; no se infieren sincronización, retención prolongada ni compatibilidad del iPad antiguo. El bloqueo del deslizamiento sin contenido queda como mejora opcional MOP-001, sin implementar (apartado 72).

Estado vigente, Fase 8C — 17 de octubre de 2026: **8C.0 publicada y verificada en GitHub Pages**. Código 403d252, Pages 2c49c4b (gh-pages/root, misma URL/origen), Google listo y Sync disponible con activación explícita por cuenta/navegador. Modo local operativo, sin subidas antiguas automáticas. 36 hashes correctos y 13 rutas internas 404; SDK 12.11.0 y Chromium/WebKit sin errores de inicialización, registro local y recarga correctos sin solicitudes Firestore. 20 grupos Emulator y cuatro smoke previos correctos. Datos reales no manipulados, reglas intactas; respaldo 8c6667d. Prueba física breve Safari emisor pendiente del usuario; detenido para revisión. Véase apartado 59 y FASE8C_PUBLICACION.md.

Estado vigente, Fase 8B.7 — 17 de octubre de 2026: **A/B/C físicos favorables y detenidos para revisión**. Seis IDs distintos en Firebase/IndexedDB/pantalla, colas cero; tres originales y eventos A/B intactos. A ≈2,4 s desde ack PC; B 3461 ms tras regresar visible; C 416 ms tras online, con cuatro unavailable esperados durante corte y recuperación automática. Trazas íntegras, sin errores inesperados, duplicados o pérdida observados; tres de tres nuevos eventos autorizados consumidos, no más registros. Causa original desconocida, producción no activada. Build `8b7-834293ccb97ae892`, Hosting `c64f791bfdcd2552`, misma caducidad 18 de octubre 09:38 Madrid; sin nuevos despliegues/reglas/Pages por el análisis. Véase apartado 58 y `FASE8B7_ESTABILIDAD_SAFARI.md`.

Estado vigente, Fase 8B.6 — 17 de octubre de 2026: prueba controlada física completada favorablemente y detenida para revisión. Build `8b6-7e84948603a7340a`, Hosting `66b5b0e84b947945`, misma caducidad del 18 de octubre 09:38 Madrid; reglas/Pages/live intactos. Trazas acreditan respuesta de servidor con tres → commit IndexedDB → aviso → estado → render en Safari (368 ms desde respuesta hasta render). Ambos terminan con tres IDs locales distintos y cola cero; servidor con único nuevo autorizado y originales intactos. Búfer descartó entradas antiguas, incluida confirmación inicial PC; secuencia crítica iPad conservada. No se identifica causa ni resolución definitiva del fallo original; sin nuevos registros/despliegues por el análisis. Véase apartado 57 y `FASE8B6_INCORPORACION_REMOTA.md`.

Estado vigente, Fase 8B.5 — 17 de octubre de 2026: candidato diagnóstico de solo lectura publicado con autorización en el canal existente `ipad-8b2`, build `8b4-256eb8ba4e2907e6`, Hosting `b7a7d00cc1e5587b`. Los 38 archivos están revisados y verificados por HTTPS; caducidad exactamente conservada (18 de octubre, 09:38 Madrid), reglas y live sin cambios. Capturas de ordenador e iPad analizadas por separado: consultas de servidor correctas y dos eventos remotos/locales/renderizados; sin alta nueva ni incorporación remota ejercitada. Causa original sin identificar, pendiente prueba completa autorizada. Sin nuevas operaciones deportivas, migraciones, corrección de arranque ni nuevo despliegue por el análisis. Véase apartado 56 y `FASE8B5_DIAGNOSTICO_FISICO.md`.

Estado vigente, Fase 8B.4 — 17 de octubre de 2026: diagnóstico local terminado para revisión; causa del fallo físico de Safari sin identificar. Código publicado contrastado por hash; recepción con SDK/Firestore Emulator correcta en Chromium y WebKit. Instrumentación opt-in y candidato de solo lectura preparados, sin publicar ni renovar el canal. Datos y operaciones reales conservados; no se retoman las pruebas de escritura. Véase apartado 55 y `FASE8B4_DIAGNOSTICO.md`.

Estado vigente, Fase 8B.3 — 17 de octubre de 2026: canal temporal `ipad-8b2`, URL `https://registro-defensivo--ipad-8b2-40nbq9cf.web.app`, caduca el 18 de octubre a las 09:38 de Madrid (dentro de las 24h originales). Sync OFF por defecto y activación manual de cuenta exclusiva. Reglas reales coincidentes sin cambios. Validación física Safari/ordenador en curso; resultados y pendientes actualizados en el apartado 54 y `FASE8B3_PREVIEW.md`. Sin live/Pages, migraciones, commit o push.

Estado vigente, Fase 8B.2 — 17 de octubre de 2026: parpadeo de sincronización reproducido y corregido localmente; 25 comprobaciones SDK adicionales correctas tanto en Emulator como en Firebase real ficticio. Paquete HTTPS para Safari/iPad preparado, con banderas OFF, sin desplegar. Véase apartado 53 y `FASE8B2_REVISION.md`. No cambia la versión publicada en GitHub Pages ni autoriza publicación, reglas nuevas o migraciones. Detenido para revisión.

Estado vigente, 16 de octubre de 2026: diseño V4 y edición del panel (Fases 9–9E) **publicados en main** (commit `8c6667d`), sin cuenta de Google ni sincronización (apartado 52). El trabajo de cuenta/Firebase sigue solo en local/develop.

Estado vigente, Fase 9D — 16 de octubre de 2026: panel bloqueado con tiros, sin Restaurar, barras de mejores/peores defensas, partido en la cabecera de edición y línea entre Transición y Estático, implementados localmente, verificados y detenidos para revisión (apartados 49 y 50). Sin commit, push ni despliegue.

Estado vigente, Fase 9C — 15 de octubre de 2026: anotados/intentos en Registro y Estadísticas, configuración de pantalla por partido y edición sobre el propio panel según el lienzo, implementados localmente, verificados y detenidos para revisión (apartados 47 y 48). Sin commit, push ni despliegue.

Estado vigente, Fase 9B — 15 de octubre de 2026: editor de botones y distribución adaptable del Registro implementados localmente, verificados y detenidos para revisión (apartados 45 y 46). Registro en anotados/intentos con marcador de puntos. IndexedDB sin cambio de versión; eventos nunca reescritos. Sin commit, push ni despliegue.

Estado vigente, Fase 9 — 15 de octubre de 2026: diseño V4 implementado localmente en las vistas Registro y Estadísticas (solo interfaz), verificado y detenido para revisión. Sustituye la capa Premium cristal. Sin cambios en registro de dos toques, IndexedDB, eventos, IDs, `categorias.csv`, Deshacer, CSV ni cálculos. Véase apartado 43. Sin commit, push ni despliegue.

Estado vigente, Fase 8B — 15 de octubre de 2026: sincronización local-first implementada y probada en emuladores, con bandera **desactivada por defecto** y bloqueo adicional de escrituras reales. Cola atómica, ámbitos proyecto/cuenta/equipo, lápidas, reintentos e importación confirmada; véase apartado 42 y `FASE8B_SINCRONIZACION.md`. No se ha escrito en Firestore real ni se han migrado datos reales. Sin commit, push o despliegue; detenerse para revisión y autorización de la validación ficticia real.

Estado vigente, Fase 8A.1 — 15 de octubre de 2026: configuración pública real de `registro-defensivo` incorporada, Authentication habilitado y emulador desactivado. Servicio real HTTP 200, dominios verificados y popup llegado a Google desde localhost. El usuario confirma acceso, recarga y cierre de sesión reales; prueba manual diferenciada de emuladores y automatización. Safari/iPad pendiente de confirmación específica. Véase apartado 41 y `FASE8A1_VALIDACION_REAL.md`. Firestore Sync desactivado, sin migraciones, commit, push ni despliegue.

Estado vigente, Fase 8A — 15 de octubre de 2026: autenticación Google opcional e infraestructura verificadas localmente en `develop`. Firebase entregado sin configuración real y con `enabled: false`. Sincronización de partidos desactivada; IndexedDB permanece en versión 1. Arquitectura, migración futura y reglas documentadas en `FASE8A_FIREBASE.md`; cierre y pruebas en el apartado 40. No se inicia 8B ni se publica esta continuación.

Estado vigente, Fase 7 ampliada — 14 de octubre de 2026: panel y matriz publicados con el commit `e27d320`. Presentación **fallados/aciertos**, por ejemplo **4/2**, en ambas vistas. Estadísticas añade porcentaje de éxito en resumen general y matriz, con desglose completo solo al pulsar una celda o total. Registro mantiene su formato compacto. El apartado 36 actualiza el 35.

Estado: Fases 1–5 completadas y publicación de prueba realizada. Fase 6A completada. Fase 6B auditada; Basketball Scout rechazada estéticamente. Fase 6D GAME DAY revisada; se pide una dirección más moderna. Fase 6E CourtFlow Light/Contrast prototipada y verificada, pendiente de elección antes de modificar producción.
Fecha: 13 de octubre de 2026. Fase 7: maqueta visual de Dashboard terminada, pendiente de revisión; sin integración funcional.

Actualización: integración visual de `origin/design/premium-ui` terminada localmente el 13 de octubre de 2026, pendiente de revisión. Véase apartado 24. No implica integrar el Dashboard ni publicar.

Estado vigente, 14 de octubre de 2026: el usuario aprueba **Premium cristal** y autoriza su integración local, incluida la vista funcional de Estadísticas y navegación entre ambas vistas. Integración realizada para revisión, sin publicar. Véase apartado 31. Los apartados anteriores conservan el histórico de propuestas; Copper Court y la exploración Pulse, Bench y Switch quedan descartados como dirección de trabajo.

## 1. Alcance y prioridad

Aplicación estática en español, con HTML, CSS y JavaScript puro, sin backend ni frameworks, destinada a GitHub Pages. La prioridad absoluta es registrar un tiro rival con dos pulsaciones: acción (o defensa dentro de un bloqueo) y resultado. No hay confirmación adicional al registrar.

La Fase 0 comprendió inspección, especificación, instrucciones permanentes y propuesta de fases. La Fase 1 implementó configuración e identidad. La Fase 2 implementó gestión de partidos y persistencia. La Fase 3 completó registro, estadísticas y Deshacer. La Fase 4 ajustó UX/UI y responsive. La Fase 5 implementa CSV por partido, verificación integral y preparación estática para Pages. La Fase 6A realiza ajustes concretos de usabilidad y presentación de estadísticas; la Fase 6B queda reservada para la auditoría estética deportiva. No se implementan estadísticas de temporada, opciones JSON, cuentas, sincronización, funcionalidades deportivas adicionales ni Capacitor.

## 2. Inspección de la base disponible

El repositorio local no está vacío. Su remoto `origin` corresponde a `https://github.com/itsasnehezkuntza/registro_defensas_baloncesto.git`. Al comenzar, el árbol de trabajo estaba limpio. Se han inspeccionado los cuatro archivos disponibles:

| Archivo | Situación actual |
| --- | --- |
| `index.html` | Una página con las tres secciones y resultados comunes fijos abajo. Falta eliminar partido. Contiene textos explicativos que se simplificarán. |
| `styles.css` | Diseño responsive, cuadrícula superior, bloqueos debajo y barra de resultados fija. En móvil las secciones se apilan. |
| `app.js` | Configuración deportiva embebida; IndexedDB; selección, registro, estadísticas, deshacer y CSV. Crea un partido automáticamente y utiliza jornada/rival de ejemplo. Exporta todos los partidos. |
| `README.md` | Describe configuración en JavaScript, exportación global y opciones JSON ausentes en la interfaz y el código. Necesita alinearse con el resultado futuro. |

No existen `categorias.csv`, módulos separados ni pruebas en los archivos inspeccionados. Se reutilizará la base disponible; no se dependerá de versiones anteriores.

IndexedDB actual: base `registro_defensivo_baloncesto`, versión 1; almacenes `games`, `events` y `settings`. Los eventos tienen clave secuencial `seq`, índice único `byUuid` para `id`, e índices por partido. Hay cola de mutaciones y bloqueo durante operaciones, pero todavía no se ha verificado su comportamiento en navegador bajo recargas o concurrencia.

Los registros actuales identifican categorías/acciones/defensas por nombres. Cambiar esos nombres puede dejar fuera estadísticas por acción. La evolución debe conservar los eventos existentes y añadir identidad estable sin reiniciar la base.

## 3. Interfaz y flujo

- Cabecera compacta: selector de partidos, creación con jornada y rival obligatorios, eliminar con confirmación explícita, deshacer, exportar CSV del partido activo e indicador de guardado.
- Tres secciones presentes en la misma página, sin pestañas, acordeones ni pasos para mostrar defensas: Transición y Estático arriba; Bloqueo directo debajo.
- Cuatro resultados grandes comunes, preferentemente fijos abajo: `2✕`, `3✕` a la izquierda (verde) y `2✓`, `3✓` a la derecha (rojo). ✓ significa tiro anotado por el rival; ✕ significa tiro fallado por el rival.
- Primera pulsación: seleccionar acción, o defensa dentro del tipo de bloqueo. Seleccionar una defensa selecciona también su tipo.
- Solo se habilitan resultados compatibles con la selección. Segunda pulsación: guardar un único evento; tras confirmar la transacción, actualizar estadísticas y limpiar selección.
- Ejemplo: `PR Manejador > Blue` y `3✕` requiere exactamente dos pulsaciones.
- Debajo del nombre de cada acción/defensa solo se muestra `fallados–anotados · porcentaje`, por ejemplo `7–3 · 70%` (fallados en verde y anotados en rojo), o `—` sin intentos. No se muestran etiquetas 2P/3P.
- Diseño deportivo, profesional y compacto, con objetivos táctiles adecuados, foco de teclado visible y selección inequívoca. La barra fija no debe ocultar contenido.
- Eliminar explicaciones redundantes. Mantener únicamente estados y errores necesarios para operar.

## 4. Configuración deportiva inicial

| Categoría | Acción / tipo | Tiros permitidos | Defensas |
| --- | --- | --- | --- |
| Transición | Bajo aro | 2 | — |
| Transición | Spot up 3 | 3 | — |
| Estático | 1c1 exterior | 2, 3 | — |
| Estático | 1c1 interior | 2 | — |
| Estático | Pin down | 2, 3 | — |
| Estático | Cortes | 2 | — |
| Estático | Spot up 3 | 3 | — |
| Estático | Bajo aro | 2 | — |
| Bloqueo directo | PR Manejador | 2, 3 | Black, White, Blue, Red, Tut |
| Bloqueo directo | PR Roller | 2 | Black, White, Blue, Red, Tut |
| Bloqueo directo | PR Pop | 2, 3 | Black, White, Blue, Red, Tut |
| Bloqueo directo | Spain | 2, 3 | Black, White, Blue, Red, Tut |

Todas las defensas aparecen directamente dentro de su tipo. No se requiere pulsar previamente el nombre del tipo.

## 5. Partidos

- Es obligatorio crear o seleccionar un partido antes de registrar. No crear partidos automáticamente ni usar campos ficticios para superar validaciones.
- Jornada y rival son textos obligatorios, no vacíos tras quitar espacios. La jornada no se limita a números sin un requisito posterior.
- Cada partido tiene un ID único y fecha de creación. El selector permite recuperar encuentros anteriores y continuar registrándolos.
- Sin partido activo: acciones y resultados deshabilitados; también deshacer, eliminar y exportar.
- Al cambiar de partido, limpiar selección y recuperar exclusivamente sus eventos y estadísticas.
- Eliminar requiere una confirmación que identifique jornada y rival. Cancelar no modifica nada. Confirmar elimina ese partido y únicamente sus eventos, en una transacción atómica.
- Decisión aprobada: después de eliminar el partido activo, quedar sin partido activo hasta una nueva selección o creación explícita.
- Al recargar, restaurar el ID activo si sigue existiendo; si no existe o no hay selección guardada, quedar sin partido activo.

## 6. Estadísticas y eventos

Las estadísticas se calculan exclusivamente con los eventos del partido activo:

- Intentos = número de tiros registrados.
- Anotados = tiros con resultado anotado.
- Fallados = tiros con resultado fallado.
- Puntos concedidos = suma del valor de los tiros anotados; los fallados aportan cero.
- Éxito defensivo = fallados / intentos × 100. Presentación aprobada: porcentaje redondeado al entero.

Cada evento conserva su ID único, ID del partido, categoría, acción, defensa (nula fuera de bloqueo directo), valor 2 o 3, resultado y fecha/hora ISO en UTC. Conservar además orden persistente para determinar el último evento, e indicadores de intento, anotado, fallado y puntos concedidos. Los totales se derivan de eventos; no mantener contadores independientes que puedan desajustarse.

Los eventos nuevos incluirán IDs estables de configuración y una copia de los nombres y tiros permitidos al registrar. Una edición futura del CSV no reescribe, revalida ni elimina tiros históricos. Los eventos antiguos conservarán sus campos y valores; cualquier asociación con IDs deberá ser determinista y no inventar equivalencias ambiguas.

Deshacer elimina solamente el último evento persistido del partido activo, también tras recargar. Actualiza las estadísticas después de confirmar la eliminación. No incluye rehacer ni historial visual de movimientos.

## 7. Persistencia y fiabilidad

- IndexedDB es la fuente de verdad para partidos, eventos y partido activo.
- Mantener el nombre de la base actual y aplicar migraciones versionadas si cambia el esquema. Nunca resolver una migración borrando la base.
- Guardar creación y selección del nuevo partido de forma atómica. Lo mismo para eliminar partido, sus eventos y su selección activa.
- Serializar operaciones incompatibles. Capturar partido y selección al iniciar una operación para impedir cruces al cambiar de partido.
- Bloquear resultados inmediatamente al registrar; consumir una selección una sola vez. El índice único del ID complementa, pero no sustituye, la prevención del doble toque.
- Mostrar «Guardado» solo al completar la transacción. Ante un fallo, no mostrar estadísticas ficticias ni éxito; conservar una vía de reintento sin duplicar.
- Iniciar con registro deshabilitado hasta recuperar base, configuración y partido. Manejar indisponibilidad de IndexedDB y actualizaciones bloqueadas por otra pestaña.
- Verificar recarga después de crear, seleccionar, registrar, deshacer y eliminar; incluir recarga inmediata y fallos de transacción. Solo una transacción confirmada puede considerarse guardada; no depender de guardar en el cierre de la página.
- Verificar operaciones desde dos pestañas para evitar estado obsoleto, deshacer incorrecto o registro en un partido eliminado. El mecanismo concreto se decide en la fase de persistencia.

## 8. `categorias.csv` editable

El archivo será la fuente de configuración deportiva; nombres, acciones, defensas y tiros permitidos no estarán duplicados como configuración en JavaScript.

Formato aprobado: CSV UTF-8, separador `;`, una fila por acción simple o combinación de tipo y defensa. Columnas:

```text
categoria_id;categoria;accion_id;accion;defensa_id;defensa;tiros
transicion;Transición;transicion_bajo_aro;Bajo aro;;;2
directo;Bloqueo directo;pr_manejador;PR Manejador;blue;Blue;2,3
```

Los IDs no cambian al renombrar. Las filas de un mismo tipo comparten `accion_id`. Las acciones simples dejan defensa vacía. El orden de las filas establece el orden de presentación. El README explicará con ejemplos cómo editar y añadir filas sin programar; el archivo completo inicial tendrá 28 filas de datos.

Validar cabeceras, campos obligatorios, IDs coherentes, combinaciones duplicadas, comillas, caracteres españoles y tiros admitidos. Ante configuración inválida o inaccesible, mostrar un error útil y bloquear nuevos registros, conservando los datos guardados y su exportación cuando puedan recuperarse. Cargar mediante rutas relativas compatibles con la subcarpeta del repositorio en GitHub Pages. El desarrollo local se probará con un servidor estático.

## 9. Exportación

- Única opción: CSV del partido activo, una fila por evento y orden de registro.
- UTF-8 con BOM, separador `;`, saltos CRLF y escape correcto de comillas, separadores y saltos dentro de campos.
- Incluir IDs, jornada, rival, categoría, acción, defensa/tipo, valor, resultado, intento, anotado, fallado, puntos concedidos y fecha/hora UTC.
- Conservar la protección existente frente a fórmulas en campos editables al abrir el CSV en Excel.
- Incluir también eventos históricos cuya acción ya no esté en la configuración actual.
- Decisión aprobada: un partido sin tiros exporta cabeceras. Nombre del archivo identificable por jornada y rival, saneado.
- No mostrar exportación ni importación JSON. Corregir sus referencias en README durante la fase correspondiente.

## 10. Estructura propuesta

Mantener los archivos actuales y separar responsabilidades mediante módulos ES nativos, sin compilación ni dependencias de producción:

```text
index.html             Página y estructura accesible
styles.css             Diseño y adaptación responsive
app.js                 Inicio y coordinación de estado/interfaz
categorias.csv         Configuración deportiva editable
js/configuracion.js    Lectura y validación del CSV
js/persistencia.js     IndexedDB, migraciones y operaciones atómicas
js/estadisticas.js     Cálculos puros a partir de eventos
js/exportacion.js      Construcción y descarga del CSV
README.md              Uso, edición de configuración y publicación
ESPECIFICACION.md      Requisitos, decisiones y avance
AGENTS.md              Instrucciones permanentes
```

La estructura modular se ha implementado en la Fase 1. Se añade también js/identidad.js para compatibilidad de lectura con eventos anteriores y tests/ para pruebas sin dependencias. La interfaz usará operaciones de persistencia encapsuladas; los cálculos no dependerán del DOM. Esa separación permite integrar Capacitor posteriormente sin implementar ahora proyectos nativos, plugins, empaquetado, service worker ni instalación.

## 11. Plan por fases y criterios de cierre

| Fase | Trabajo | Verificación para revisar el resultado |
| --- | --- | --- |
| 0 — Especificación (esta tarea) | Inspección, documentación y propuesta de estructura. | Solo se crean los dos documentos; aplicación intacta. |
| 1 — Configuración e identidad | Crear CSV completo, lector/validador, módulos y estrategia compatible con eventos existentes. | Los 28 destinos seleccionables coinciden con requisitos; renombrar o retirar una fila no modifica el histórico; errores de CSV controlados. |
| 2 — Partidos y persistencia | Creación obligatoria, selección, estado sin partido, eliminación confirmada, migración necesaria y operaciones atómicas. | Dos partidos aislados; cancelar eliminación sin efecto; recargas recuperan datos y selección; registros anteriores conservados. |
| 3 — Registro y estadísticas | Conectar selección y resultados, guardas de tiros, doble toque, estadísticas y deshacer persistente. | Todos los destinos registran en dos pulsaciones; Roller no admite 3; sin partido no se registra; deshacer tras recarga afecta solo al activo. |
| 4 — Diseño de una página | Afinar cabecera, disposición, barra fija, textos, accesibilidad y uso táctil. | Sin pestañas ni defensas ocultas; ratón/táctil/teclado; móvil, tablet y escritorio sin solapamientos. |
| 5 — CSV y validación final | Exportación activa, README coherente y comprobación de rutas para GitHub Pages. | CSV con acentos/comillas y sin eventos ajenos; pruebas de recarga, fallos, doble toque, varias pestañas e histórico; instrucciones reproducibles. |

Se avanza por tareas delimitadas, dejando en este documento decisiones y estado de cada fase. Esta primera entrega se detiene para revisión de estructura y fases, tal como se ha solicitado. La implementación posterior no implica publicar, hacer push ni desplegar sin una instrucción para ello.

## 12. Decisiones aprobadas

- Fase 0: estructura y plan aprobados por el usuario.
- En móvil, las tres secciones permanecen desplegadas y se permite desplazamiento vertical.
- Porcentajes redondeados al entero; jornada como texto obligatorio.
- Tras eliminar el partido activo, quedar sin selección.
- Exportar cabeceras si el partido no tiene tiros.
- No implementar edición de jornada/rival. El flujo heredado de edición se ha retirado en Fase 2; jornada y rival solo se introducen al crear.
- Las filas/categorías retiradas no generan botones; los eventos siguen almacenados, cuentan en el total del partido y se exportan.
- Renombrar conserva IDs. Los eventos conservan los nombres originales y no se reescriben.
- Los tres IDs estructurales de sección son transicion, estatico y directo; sus nombres visibles son editables. No se añaden secciones nuevas fuera del alcance.
- Una defensa puede tener tiros propios en su fila; PR Roller viene configurado con 2 en las cinco filas. No se impone una regla deportiva duplicada en JavaScript: cambiar tiros en CSV cambia los permisos futuros.

## 13. Estado de avance y verificación de Fase 1

Fase 1 aprobada. Este apartado conserva los resultados de su entrega; la situación actual se recoge en el apartado 14.

### Cambios

- `categorias.csv`: 28 filas, con IDs estables, nombres y tiros permitidos. Lectura sin caché al arrancar; los cambios se aplican al recargar.
- `js/configuracion.js`: lector CSV con BOM, CRLF, comillas escapadas, separadores y saltos dentro de campos; validación de cabecera, columnas, IDs, nombres coherentes, defensa, tiros y duplicados. Los errores indican archivo y línea cuando corresponde.
- `app.js`: módulos ES, selección por IDs, etiquetas obtenidas del CSV, defensas por tipo y permisos por combinación. Eventos nuevos añaden categoria_id, accion_id, defensa_id y tiros_permitidos sin quitar los campos originales.
- `js/identidad.js`: tabla fija para interpretar eventos de la versión original. Solo lectura, independiente del CSV; sin migración ni escritura de eventos. Eventos con nombres antiguos desconocidos no reciben una identidad inventada: siguen en total y exportación, aunque no se agrupen bajo un botón.
- `js/persistencia.js`: extracción del código existente manteniendo nombre, versión 1, almacenes e índices. No se ha borrado, reiniciado ni migrado ninguna base real.
- `js/estadisticas.js` y `js/exportacion.js`: cálculos y construcción del CSV separados del coordinador. El alcance global heredado de descarga todavía se conserva hasta la Fase 5.
- Error de configuración visible en la página. Impide registrar y deja disponible la recuperación de partidos y CSV si IndexedDB se pudo abrir.
- Diseño conservado, con un estilo mínimo para el aviso de error. README actualizado para explicar edición del CSV y estado por fases.

### Pruebas realizadas

Ejecutadas mediante el runtime Node disponible en la herramienta, sin instalar dependencias:

| Prueba | Resultado |
| --- | --- |
| `tests/configuracion.test.mjs` | 26 pruebas superadas: estructura 2+6+20, Roller solo 2P, lectura CSV, validación, nombres/tiros editables, IDs, histórico, estadísticas, CSV y fallos de carga. |
| `tests/integracion.test.mjs` | 5 escenarios superados con DOM y persistencia simulados: inicio/registro, renombrado, retirada, CSV inválido y fallo de carga. Comprueba selección consumida, eventos nuevos con IDs y eventos anteriores intactos. |
| `tests/persistencia.test.mjs` | Contrato de lectura superado con IndexedDB simulado: misma base/versión, recuperación y ninguna escritura de eventos al leer. |

Comandos reproducibles con Node moderno instalado:

```text
node tests/configuracion.test.mjs
node tests/integracion.test.mjs
node tests/persistencia.test.mjs
```

Limitaciones: Node/Python no están disponibles como ejecutables en PATH; se utilizó el runtime de la herramienta. Playwright no pudo cargarse. No se han ejecutado pruebas en navegador real, de IndexedDB real, recarga, concurrencia entre pestañas ni QA visual. Las pruebas usan datos ficticios; no se han modificado datos reales del navegador. Esas verificaciones siguen pendientes, especialmente en las fases de persistencia y validación final.

Al cerrar Fase 1 se conservaban la gestión heredada y la exportación global. La gestión se ha sustituido en Fase 2; la exportación global sigue pendiente de Fase 5.

## 14. Fase 2 — Gestión de partidos y persistencia

Estado: completada y revisada antes de iniciar Fase 3. Este apartado conserva el informe de Fase 2.

### Cambios implementados

- Selector con «Selecciona o crea un partido». Recupera solo un ID activo persistido que siga existiendo; no crea ejemplos ni elige el primero.
- Sin partido válido: acciones/defensas, resultados, Deshacer, Eliminar y CSV deshabilitados, con aviso discreto.
- «+ Nuevo partido» abre un formulario compacto: jornada y rival obligatorios, trim, límites existentes de 32/80 caracteres e ID único independiente de nombres. Se permiten nombres iguales. Creación y selección atómicas.
- Se retira la edición de jornada/rival y la reescritura de metadatos históricos.
- Cambiar de partido persiste la selección, limpia la acción y recupera un snapshot coherente de eventos y estadísticas.
- Borrado confirmado con jornada/rival, foco inicial en Cancelar y botón «Eliminar definitivamente». Se captura el ID confirmado. Transacción atómica: partido, exclusivamente sus eventos y referencia activa si corresponde. La interfaz queda sin selección.
- Registro y deshacer verifican existencia del partido en la misma transacción que modifica sus eventos. Capturan el ID antes de esperar operaciones.
- Guardado aparece solo tras completar transacciones. Los fallos dejan errores visibles y formularios recuperables. Una actualización ajena no oculta un fallo local.

### Decisiones técnicas

- Se mantiene `registro_defensivo_baloncesto`, versión 1, almacenes e índices; no se necesita migración. No se cambian partidos, IDs ni eventos antiguos al abrir.
- Lecturas coherentes mediante una sola transacción. Mutaciones resueltas en `tx.oncomplete`; abortos rechazan la operación y revierten escrituras.
- Cola local y bloqueo inmediato de controles. Las selecciones tienen un número de revisión: respuestas y errores antiguos no sustituyen intenciones posteriores.
- games y events comparten las transacciones de registro/deshacer, evitando carreras con eliminación. byGameSeq conserva el orden persistente.
- BroadcastChannel avisa solo tras confirmar cambios. Otras pestañas releen IndexedDB; un partido eliminado se invalida inmediatamente. La selección activa es compartida entre pestañas del mismo origen: la última selección confirmada se refleja en todas.
- Fallback mediante el evento storage; localStorage solo transporta avisos, no datos deportivos. Relectura al recuperar foco/visibilidad.
- Un cambio externo de versión cierra la conexión y bloquea registro hasta recargar.
- Si confirma un tiro pero falla la lectura posterior, se limpia la selección y se muestra error de confirmación, evitando un reintento duplicado.
- La exportación conserva su alcance global heredado; solo se añade la guarda de partido válido. Limitarla al activo corresponde a Fase 5.

### Pruebas ejecutadas realmente

Chrome 154 headless, servidor loopback y perfil nuevo aislado dentro de `.test-artifacts/`. IndexedDB real y dos pestañas reales. No se ha utilizado el perfil del usuario ni borrado ninguna base; el runner aborta si encuentra partidos preexistentes.

`tests/fase2-browser.mjs`: resultado `ok: true`, 15 grupos que cubren las 14 pruebas obligatorias:

| Requisitos | Resultado |
| --- | --- |
| 1/12/13 | Inicio sin partidos: 28 combinaciones presentes, sin creación ficticia, herramientas bloqueadas y ningún evento al intentar registrar. Roller no habilita 3P. |
| 2/3 | Campos vacíos rechazados; trim, ID y selección persistidos; estadísticas vacías; doble envío rápido crea solo un partido; recarga recupera activo. |
| 4/5 | Dos partidos con mismos nombres e IDs distintos; eventos aislados; cambios rápidos conservan la última intención. |
| 6/7 | Eventos sobreviven a recarga; deshacer después de recargar elimina únicamente el último. |
| 8 | Cancelar eliminación no modifica partidos ni eventos. |
| 9/10/11 | Borrado exclusivo, sin selección posterior, no reaparece al recargar y el partido restante conserva su evento. Segunda pestaña se invalida. |
| 14 | Registro en partido eliminado rechazado; DataCloneError y abortos de creación, selección y borrado, incluyendo cascada de eventos, revierten cambios. Errores de UI sin falso Guardado; fallo antiguo no pisa selección posterior; dos eliminaciones simultáneas solo confirman una. |
| Compatibilidad | Partido de ejemplo y evento v1 recuperados conservando IDs/campos y estadísticas, sin migración. |

También pasaron las 26 pruebas de `tests/configuracion.test.mjs` y los 5 escenarios de `tests/integracion.test.mjs`, adaptados al nuevo contrato. La prueba simulada `tests/persistencia.test.mjs` se sustituyó por las pruebas reales. `git diff --check` sin errores de espacios.

Reproducir con Node 22.7 o posterior y Chrome en Windows:

```text
node tests/configuracion.test.mjs
node tests/integracion.test.mjs
node tests/servidor.mjs 8080
```

Manteniendo el servidor abierto, en otra consola:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080
```

El runner crea un perfil nuevo y guarda `.test-artifacts/fase2-result.json`, excluido de Git. Los flags de Chrome incluyen desactivar su sandbox interno para este entorno restringido: utilizar solo contra el servidor de pruebas local, nunca para navegación habitual. No se cambia la política de ejecución de PowerShell del sistema.

### Limitaciones y pendientes

- Pendientes otros navegadores, dispositivos móviles y QA visual/táctil. No se implementan PWA ni apps nativas.
- Recargas verificadas después de transacciones confirmadas; una escritura interrumpida antes de confirmar no se considera guardada. No se prueba corte eléctrico ni limpieza del almacenamiento.
- Fallback sin BroadcastChannel y cambio externo de versión no ejercitados; las guardas transaccionales no dependen de los avisos.
- Fase 3: revisión específica de dobles toques y reintentos bajo latencia/fallos, flujo en dos pulsaciones y estadísticas activas. Se conserva el registro actual sin nuevas métricas.
- Fase 5: CSV exclusivo del activo y revisión de nombre/columnas.
- No hay push ni publicación. Se detiene para revisión de Fase 2.

## 15. Fase 3 — Registro defensivo, estadísticas y Deshacer

Estado: completada antes de iniciar Fase 4. Se conserva este informe de Fase 3.

### Inspección y reutilización

Ya existían selección de acción/defensa, botones comunes, estadísticas derivadas de eventos del activo y Deshacer por byGameSeq en IndexedDB. Se conservan el diseño, configuración CSV, gestión de partidos, esquema de base e identificación histórica. No se modifica la exportación global.

Se encontraron tres puntos a corregir: permisos confiados a la selección en memoria, pérdida de la vía de reintento al abortar y pérdida de una selección al refrescar desde otra pestaña del mismo partido.

### Cambios y decisiones

- `js/registro.js` resuelve los IDs contra la configuración cargada del CSV y construye eventos completos. Selecciones y permisos resueltos son inmutables. Los textos y permisos manipulados en el DOM o en una copia de selección no sustituyen los del CSV.
- Primera pulsación: acción simple o defensa directamente dentro de su tipo. Segunda: resultado compatible. Se consume la selección inmediatamente antes de esperar IndexedDB y se bloquean resultados mientras guarda.
- Cada nuevo evento contiene ID, partido, IDs/nombres de categoría/acción/defensa, valor, resultado, fecha y copia de permisos. IndexedDB asigna seq como orden persistente. No hay pasos ni confirmaciones nuevas.
- Al abortar, se muestra que el tiro no está guardado, se recupera la selección si el partido sigue activo y se puede repetir el resultado. El mismo intento conserva su ID y fecha. Elegir otra acción cancela ese intento no guardado.
- `addEvent` valida valor/resultado/permisos y comprueba byUuid dentro de la transacción. Si el mismo ID ya contiene el mismo evento devuelve su seq, sin duplicar. Si corresponde a otro contenido, rechaza con EVENT_CONFLICT sin sobrescribir.
- Un fallo de lectura después de confirmar un tiro informa que el tiro sí está guardado y mantiene la selección consumida. Deshacer distingue igualmente aborto y fallo posterior a la eliminación confirmada.
- Las notificaciones a otras pestañas se emiten tras confirmar la mutación, incluso si falla el refresco posterior.
- Refrescar conserva la selección si el ID del partido no cambia, incluso con varios avisos simultáneos. Cambiar/eliminar el partido la limpia. Los IDs capturados evitan cruzar un tiro pendiente con la nueva selección global.
- `js/estadisticas.js` cuenta anotados explícitamente por resultado. Intentos, fallados y puntos concedidos siguen derivados de los eventos persistidos del activo. No se añaden paneles, métricas ni estadísticas de temporada.
- Deshacer conserva la consulta inversa del índice byGameSeq y transacción exclusiva del partido. No usa una pila en memoria ni fecha como criterio de orden.
- Ninguna migración ni reescritura histórica. Las filas retiradas no producen botones; sus eventos siguen en totales y CSV. La tabla fija de compatibilidad continúa interpretando eventos v1 sin IDs.

### Pruebas realmente ejecutadas

Chrome 154 headless, IndexedDB real, perfil nuevo aislado y servidor loopback. Dos pestañas reales, fallos inyectados y datos ficticios. El runner rechaza una base con partidos previos. Resultado final de `tests/fase3-browser.mjs`: `ok: true`, 13 grupos de comprobaciones.

| Pruebas solicitadas | Resultado |
| --- | --- |
| 1–4 y 7 | Se recorren las 28 combinaciones y sus 90 resultados válidos. Cada registro usa dos clicks, crea una fila completa y consume selección; comprobación de permisos y estadística después de cada evento. |
| 5 y 6 | Doble click y dos resultados diferentes, también forzando botones desde código: una sola fila. Cambio de acción registra la última selección. |
| 8–10 | Muestra de 90 intentos, 45 anotados, 45 fallados y 109 puntos; fallado/intentos, porcentajes enteros y guion sin intentos. |
| 11 y 12 | Deshacer actualiza estadísticas, funciona tras recarga y elimina por seq con fechas invertidas. Aborto conserva datos; fallo de refresco distingue eliminación confirmada. |
| 13 | Eventos de partidos distintos aislados; Blue de Manejador y Roller independientes. |
| 14 y 18 | Eventos con IDs y v1; variantes de CSV solo en páginas de prueba: renombrar, retirar Transición y cambiar 2 a 3 modifican interfaz/permisos sin reescribir históricos. |
| 15 | Dos pestañas registran y actualizan estadísticas; se conserva selección frente a avisos simultáneos; escritura retenida por una transacción larga, cambio de partido y borrado concurrente no cruzan ni duplican eventos. |
| 16 | Aborto real de tiro y reintento con mismo ID; lectura fallida tras commit; abortos/lectura fallida de Deshacer; reintentos simultáneos del mismo ID idempotentes; conflicto rechazado sin sobrescribir. |
| 17 | Sin partido activo, ni habilitar un resultado desde código genera un evento. |

Regresiones adicionales ejecutadas:
- Fase 2: sus 15 grupos en navegador real pasaron tras integrar los cambios.
- `tests/configuracion.test.mjs`: 26 pruebas superadas.
- `tests/integracion.test.mjs`: sus 5 escenarios simulados superados.
- `tests/registro.test.mjs`: 28 combinaciones y 90 resultados, validación canónica/inmutabilidad, fórmulas, porcentaje entero e histórico.
- `git diff --check` sin errores de espacios.

Reproducción: las instrucciones de Fase 2 siguen vigentes. Añadir:

```text
node tests/registro.test.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 3
```

El servidor `node tests/servidor.mjs 8080` debe estar abierto. El runner acepta -Phase 2 o 3 y deja informes separados en `.test-artifacts/`, excluidos de Git. Las variantes de CSV están en `tests/config-page.html` y no modifican `categorias.csv`.

### Archivos de esta fase y límites

Producción: `app.js`, `js/persistencia.js`, `js/estadisticas.js` y nuevo `js/registro.js`. Pruebas: nuevo `tests/registro.test.mjs`, `tests/fase3.html`, `tests/fase3-browser.mjs`, `tests/ui-fixture.mjs`, `tests/config-page.html` y adaptación de `tests/run-browser.ps1`. Documentación: especificación y README. No se modifican el CSV deportivo, HTML/CSS de producción, identidad histórica ni exportación.

Pendientes: Safari/Firefox y dispositivos táctiles reales, cierre forzado durante una transacción, cortes de energía y disponibilidad/cuota de almacenamiento. Un intento abortado no es un evento guardado; su selección de reintento se conserva durante la sesión, no tras cerrar/recargar. No se promete impedir escrituras deliberadas directamente en IndexedDB desde herramientas del navegador: es una aplicación local sin backend. Se validan las interacciones y el registro normal aunque se alteren botones o copias de selección.

No se ha iniciado Fase 4, hecho push ni publicado.

## 16. Fase 4 — UX/UI y adaptación responsive

Estado: completada antes de iniciar Fase 5. Se conserva este informe de Fase 4.

### Revisión inicial en navegador

Se revisaron HTML, CSS, JavaScript y capturas iniciales con Chrome headless en perfil aislado. Se conservaron estética, composición y funcionalidades existentes.

Problemas observados:
- A 320 px, el ancho mínimo de html producía desplazamiento horizontal cuando el navegador reservaba espacio para su barra de desplazamiento.
- Selector y herramientas de cabecera tenían 38 px de altura, por debajo del objetivo táctil de 44 px.
- Reglas antiguas de tablet forzaban una fila adicional para exportar y desaprovechaban ancho.
- La reserva de espacio inferior era fija, sin seguir el crecimiento del texto ni el tamaño real de la barra.
- La ampliación de texto al 200% podía solapar marca y estado de guardado.

### Cambios implementados

- `styles.css`: se elimina el ancho mínimo rígido, se mantienen Transición/Estático en columnas para escritorio y tablet desde 700 px, y se apilan en móvil. Bloqueo directo permanece debajo, con todas sus defensas visibles y adaptadas en varias filas en pantallas estrechas.
- Cabecera: objetivos de al menos 44 × 44 px, selector de ancho flexible, herramientas en una sola fila cuando caben y cuadrícula compacta de dos columnas en móvil. Marca/guardado pueden envolver texto al ampliar.
- Barra inferior: cuatro botones comunes, separación mínima de 8 px en móvil, tamaños adaptables de símbolos, texto que puede envolver y estado deshabilitado con borde discontinuo. Se conservan colores rojo para anotado y verde para fallado.
- Selección: borde doble, franja lateral y ✓ además del color. Se conserva aria-pressed y la descripción inmediata de selección.
- Foco visible con contraste en superficies claras y cabecera oscura. Nombres y estadísticas permiten reflujo; tamaños de texto principales expresados en rem. El texto de estadísticas sigue exclusivamente como cifra o guion.
- Se consideran env(safe-area-inset-top/right/bottom/left), viewport-fit=cover y altura dinámica del viewport en diálogos. No se implementa empaquetado móvil.
- Diálogos: campos de al menos 44 px, anchura adaptable, altura máxima según viewport, scroll vertical interno si hace falta y botones que envuelven sus etiquetas.
- `index.html`: se eliminan los rótulos redundantes «SITUACIÓN» y la explicación de la fórmula en la página; la fórmula permanece documentada. Los resultados tienen nombres accesibles completos; en pantallas de hasta 360 px se ocultan solo sus subtítulos visuales, conservando 2✓, 2✕, 3✓ y 3✕. Se añade anuncio accesible de selección y enterkeyhint en campos de creación.
- `js/interfaz.js`: único módulo nuevo de producción, dedicado a medir la barra mediante ResizeObserver y actualizar --dock-height. La reserva inferior sigue la altura real por cambios de texto, pantalla u orientación. Fallback a resize.
- `app.js`: únicamente importación y llamada inicial a initializeLayout. No cambian registro, permisos, estadísticas, IDs, eventos, partidos, IndexedDB, Deshacer ni exportación.
- Sin cambios en categorias.csv ni en los módulos deportivos y de persistencia. Sin nuevas pantallas, pasos de registro, gráficos, PWA o dependencias.

### Pruebas realizadas

Emulación en Chrome 154 headless con IndexedDB real, servidor loopback y perfil de pruebas aislado. No se han utilizado dispositivos físicos ni datos reales.

`tests/revisar-responsive.ps1` y `tests/fase4-browser.mjs` verifican:
- 320×640, 360×740, 390×844, 768×1024, 1024×768, 1440×900.
- Horizontal: 844×390 y 640×360; 1024×768 cubre también tablet horizontal.
- Escalado CSS al 200% en 640×960 y ampliación de texto raíz al 200% en 320×800. Estas pruebas emulan ampliación; no equivalen a una prueba del zoom del navegador o de ajustes de accesibilidad de iOS/Android.
- En los diez casos: sin scroll horizontal, sin recortes de nombres/estadísticas, todos los objetivos táctiles principales de al menos 44 × 44 px, tres secciones y veinte defensas presentes, cuatro resultados en pantalla, y última defensa accesible por scroll sin quedar bajo la barra.
- Selección con borde doble y ✓, foco programático con contorno visible, y estadística de muestra 7/10 — 70%.
- Diálogos de crear/eliminar revisados a 320 px, horizontal 844 px, escalado CSS y texto ampliado: sin desbordar el viewport ni tener scroll horizontal.
- Registro en dos pulsaciones de Roller, restricción 2P, estadística inmediata y Deshacer desde la interfaz responsive.
- Contraste calculado de pares principales: estadísticas 6,04:1, anotado 5,17:1, fallado 5,59:1 y texto de acciones 14,20:1. No constituye una auditoría WCAG completa.

Regresiones ejecutadas:
- Fase 2 en navegador real: 15 grupos, ok:true.
- Fase 3 en navegador real: 13 grupos, ok:true; incluye 28 combinaciones, 90 resultados, concurrencia e históricos.
- Configuración: 26 pruebas superadas.
- Registro: 28 combinaciones y 90 resultados, permisos, fórmulas e histórico.
- Integración simulada: 5 escenarios superados.
- git diff --check sin errores de espacios.

### Capturas y reproducción

Capturas generadas y revisadas:
- `.test-artifacts/final-1440-900-1.png` — escritorio.
- `.test-artifacts/final-768-1024-1.png` — tablet vertical.
- `.test-artifacts/final-390-844-1.png` — móvil.
- `.test-artifacts/final-320-640-1.png` — móvil pequeño.
- `.test-artifacts/final-844-390-1.png` — móvil horizontal.
- `.test-artifacts/final-320-800-2.png` — texto al 200%.

Medidas e informes en `.test-artifacts/fase4-final.json`; revisión inicial en fase4-antes.json. Artifacts excluidos de Git. Todas las imágenes muestran datos ficticios.

Con el servidor `node tests/servidor.mjs 8080` abierto:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tests/revisar-responsive.ps1 -Port 8080 -Label final
```

Las órdenes de regresión de fases anteriores siguen vigentes. El runner visual tiene las mismas restricciones de perfil/loopback que el funcional; no utilizar su Chrome de pruebas para navegación habitual.

### Archivos y pendientes

Modificados: styles.css, index.html, app.js, ESPECIFICACION.md y README.md. Añadidos: js/interfaz.js, tests/fase4.html, tests/fase4-browser.mjs y tests/revisar-responsive.ps1.

Pendientes de verificación física: notch y zonas seguras reales de iPhone/Android, teclados virtuales, rotación real, navegadores Safari/Firefox y ajustes de texto/zoom del sistema. El foco se verificó mediante programación; no se ha realizado auditoría completa con lector de pantalla o teclado físico.

No se han modificado el alcance global de CSV ni funcionalidades de Fase 5. Sin push ni publicación; se detiene al cerrar Fase 4.

## 17. Fase 5 — CSV por partido, pruebas finales y preparación Pages

Estado: implementada, pendiente de revisión funcional. No se inicia la futura Fase 6 ni se publica.

### Cambios implementados

- app.js captura currentGameId sin esperar antes de exportar. No sustituye ese ID por una selección más reciente ni carga allEvents para descargar.
- readExportSnapshot(gameId) lee el partido y su índice byGameSeq en una sola transacción readonly de games/events. Devuelve un snapshot confirmado, ordenado y exclusivo; rechaza IDs vacíos o partidos eliminados.
- buildCsv comprueba que todas las filas pertenecen al partido recibido, no muta entradas y conserva orden seq. Los nombres provienen de eventos históricos; solo jornada/rival ausentes recurren a metadatos del snapshot.
- CSV: una fila por evento, BOM UTF-8, separador ;, CRLF y campos escapados. Incluye identificadores de evento/partido, nombres, valor, resultado, intentos/anotados/fallados, puntos concedidos, UTC, IDs de configuración y orden persistente.
- IDs históricos conocidos se deducen con la tabla fija de identidad, sin escribir eventos ni validar contra el CSV actual. Los desconocidos se dejan vacíos; la fila se conserva.
- Nombre de archivo con jornada, rival e ID, normalización y saneamiento de caracteres. Componentes limitados por bytes UTF-8 para respetar límites de sistemas operativos, también con emojis. No se sobrescribe un partido distinto por compartir nombres.
- Sin eventos: cabeceras. Sin activo: botón y operación bloqueados. Fallo: mensaje y ninguna descarga parcial. Un partido eliminado no provoca exportar el siguiente.
- Sin cambios de estética, CSV deportivo, reglas, eventos o esquema IndexedDB. La lectura global allEvents se conserva para pruebas, pero la descarga ya no la utiliza.
- tests/preparar-pages.ps1 copia una lista explícita de 12 archivos a .test-artifacts/pages y valida ausencia de archivos ajenos. No compila, borra datos, hace git/push o despliega. Incluye .nojekyll; excluye tests, perfiles, informes y documentos internos.
- El servidor local sirve ese paquete bajo /registro_defensas_baloncesto/. README documenta publicación manual desde gh-pages y actualización del CSV, según documentación oficial de GitHub.

### Verificación ejecutada

| Tipo | Pruebas y resultados |
| --- | --- |
| Chrome 154, IndexedDB real, perfil aislado | Fase 5: 8 grupos, ok:true. Exportación exclusiva y ordenada, BOM binario, escape/fórmulas, nombres originales, IDs/puntos, vacío/sin activo, renombrado/retirada, cambio concurrente, abortos de lectura, partido eliminado y recarga inmediata tras commit. |
| Descarga nativa de Chrome | Archivo CSV materializado en el perfil aislado y BOM verificado leyendo los bytes del archivo. Las comprobaciones de contenido anteriores capturan el Blob real generado por la interfaz para analizarlo sin depender del diálogo del sistema. |
| Persistencia y partidos | Fase 2: 15 grupos en navegador real, ok:true. Creación, selección, borrado, aislamiento, recargas, rollback y concurrencia. |
| Registro integral | Fase 3: 13 grupos en navegador real, ok:true. 28 combinaciones y 90 resultados, Roller 2P, duplicados, estadísticas, históricos y Deshacer tras recarga. |
| Responsive emulado | Diez tamaños/ampliaciones de Fase 4, sin errores. Cabecera, selector, diálogos y barra mantienen geometría y accesibilidad de objetivos. Informe fase4-fase5.json. |
| Pruebas puras/simuladas | Configuración: 26 pruebas. Registro: 28 combinaciones/90 resultados. Integración: 5 escenarios simulados. Exportación: aislamiento, orden, escape, fórmulas, histórico, encabezados, longitud Unicode y nombres. Todas superadas. |
| Preparación estática | Paquete de 12 archivos verificado y cargado en Chrome bajo /registro_defensas_baloncesto/: módulos, estilos y 28 destinos de CSV. Descarga nativa desde el paquete también funciona. Sin compilación. |

La recarga inmediata se dispara al observar la confirmación del tiro, sin temporizador de guardado, y recupera su evento y estadísticas. No se afirma que una transacción abortada por recargar antes del commit quede guardada. El indicador Guardado se mantiene vinculado a transacciones completas.

Se utilizaron perfiles nuevos y datos ficticios. No se abrió, reinició ni borró la base del usuario. Los cambios de CSV fueron variantes en páginas de prueba; categorias.csv original se conserva.

### Preparación, archivos y entrega

Producción modificada: app.js, js/persistencia.js y js/exportacion.js. Sin cambios en HTML/CSS de producción ni en categorías o registro. Documentación actualizada: README.md y ESPECIFICACION.md.

Pruebas nuevas: exportacion.test.mjs, fase5.html, fase5-browser.mjs y preparar-pages.ps1. Adaptados: run-browser.ps1 (Phase 5 y descarga nativa), servidor.mjs (subdirectorio del paquete) e integracion.test.mjs (nuevo contrato de snapshot).

Informes y paquete están en .test-artifacts/, excluidos de Git. El contenido de pages está limitado a runtime y .nojekyll; no hay temporales ni pruebas preparados para publicación. No se han creado ramas, workflows automáticos ni configurado GitHub Pages.

### Limitaciones y uso en partido

No se detectaron fallos bloqueantes en las pruebas realizadas con Chrome. La validez del CSV se comprobó por bytes y parseo; Excel no se abrió realmente. Firefox no se encontró en las rutas de instalación consultadas; no hay entorno Safari disponible. Pendientes dispositivos físicos, lectores de pantalla completos, zonas seguras y teclados reales, y el dominio remoto después de autorizar publicación.

El almacenamiento es local y depende del navegador. Esperar Guardado antes de cerrar/recargar; una escritura interrumpida antes de confirmar puede abortar. CSV no ofrece restauración/importación. Las pestañas comparten selección activa; esta conducta ya definida en Fase 2 se mantiene.

Se detiene al finalizar Fase 5. Sin push, publicación, rediseño ni nuevas funciones deportivas.

## 18. Auditoría para primera publicación desde main

Auditoría completada sin modificar diseño ni funcionalidades. Se añade .nojekyll en la raíz, se excluye tests/ mediante .gitignore y se actualiza README para main/(root). El empaquetador local copia el mismo marcador. Informe completo en AUDITORIA_PUBLICACION.md.

Repetidas y superadas las pruebas Node/simuladas, Fase 2 (15 grupos), Fase 3 (13 grupos), Fase 5 (8 grupos y descarga nativa) y diez casos responsive emulados. Doce archivos runtime verificados byte a byte; once referencias relativas comprobadas. No hay dependencias de desarrollo para ejecutar en Pages. Base/version1 e históricos conservados.

Plan: subir solo los 12 archivos de aplicación más README.md y .gitignore. Pruebas, artefactos y documentos internos permanecen locales. Índice vacío: no se ha ejecutado stage, commit, push ni despliegue. Revisar referencias remotas y permisos/configuración Pages antes de la publicación autorizada.

## Publicación de prueba autorizada — 12 de octubre de 2026

Publicación realizada tras autorización expresa del usuario. Commit: `611848aaad31b0330a1e5fa32a944cc0ca0538c6`, en `main` y `origin/main`, mediante push normal sin force. Se incluyeron exclusivamente las 14 rutas aprobadas. Los documentos internos, pruebas, capturas y perfiles siguen locales y no forman parte del commit.

GitHub Pages ya estaba configurado desde `main` → `/(root)`; no fue necesario cambiar sus ajustes. La API confirma el build `built`, sin errores, del mismo commit.

URL: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/

Verificación remota ejecutada: HTML, CSS, CSV y los ocho archivos JavaScript (app y siete módulos) responden HTTP 200 y coinciden con los archivos locales, normalizando únicamente saltos de línea. Chrome headless real, con perfil nuevo aislado y datos ficticios, recupera las 28 combinaciones sin error de configuración; empieza sin partido y con resultados bloqueados; permite crear un partido; PR Roller / Blue habilita solo los dos resultados de 2 puntos; la barra inferior conserva posición fija. Estas comprobaciones complementan las regresiones anteriores; no son pruebas en dispositivos físicos.

Ramas local/remota sincronizadas (0 commits de diferencia). No se modificaron diseño ni lógica. Pendientes pruebas personales en móvil/tablet/ordenador, Safari/Firefox y Excel. El almacenamiento de localhost no se transfiere al origen público; los datos permanecen por navegador y origen. Se detiene esta entrega sin iniciar la Fase 6.
## 19. Fase 6A — Usabilidad y presentación de estadísticas

Estado: implementada y verificada localmente el 12 de octubre de 2026; pendiente de revisión del usuario. Se detiene aquí. Fase 6B no iniciada; sin commit, push ni despliegue de estos cambios. La publicación de prueba anterior sigue con su versión anterior.

### Cambios y decisiones

- Cabecera: se retiran logotipo D/flecha y subtítulo. Solo queda REGISTRO DEFENSIVO; debajo, selector flexible y Nuevo partido, Eliminar, Deshacer y Exportar CSV en una fila cuando caben. Guardado conserva su estado transaccional. El rótulo Partido sigue disponible para accesibilidad, sin consumir altura visible.
- Resultados: orden DOM y visual 2✕, 3✕, 2✓, 3✓; parejas fallado verde a la izquierda y anotado rojo a la derecha, con separación central adicional. Permanecen los cuatro resultados compartidos y el flujo de dos pulsaciones. Altura habitual de botones reducida de 72 a 56 px; en pantallas pequeñas se conserva reflujo de textos y símbolos.
- Desde 1000 px, Estático usa tres columnas y dos filas; Transición permanece al lado. Bloqueo directo conserva cuatro filas y cinco defensas por fila. Se compactan márgenes/padding sin ocultar categorías ni reducir objetivos táctiles por debajo de 44 × 44 px.
- Se conserva viewport-fit=cover, env(safe-area-inset-*) y la medición real de la barra mediante ResizeObserver en js/interfaz.js, sin modificar ese módulo. El espacio inferior reservado sigue su altura, incluido el texto ampliado y las zonas seguras. Se permite scroll vertical.
- Todas las estadísticas visibles usan fallados–anotados · porcentaje: acciones, defensas, tipos de bloqueo, secciones y total del partido. Total conserva el número de intentos; ahora también es visible en móvil. Con cero eventos la cifra es —; el porcentaje sigue redondeado al entero.
- JavaScript de producción limitado a statText/statMarkup en js/estadisticas.js y las llamadas de presentación en app.js. statMarkup solo introduce spans de color alrededor de los contadores numéricos calculados; nombres editables siguen escapados. summarize y puntos concedidos quedan intactos.
- Sin cambios en categorias.csv, eventos, IDs, IndexedDB (nombre/versión/esquema), gestión de partidos, persistencia, permisos, registro, Deshacer o exportación. No hay nuevas dependencias.

### Pruebas y evidencias

Perfiles nuevos aislados, servidor loopback y datos ficticios; ninguna base o partido real del usuario se ha modificado. Emulación de viewport en Chrome headless, no Safari ni hardware iPad.

| Verificación | Resultado |
| --- | --- |
| Pruebas puras/simuladas | Configuración: 26; registro: 28 combinaciones/90 resultados; integración: 5 escenarios; exportación: todas sus comprobaciones. Superadas. |
| Nuevo tests/estadisticas.test.mjs | 7–3 · 70%, 0–5 · 0%, 5–0 · 100%, — vacío y 1–2 · 33%; markup/texto equivalentes, contadores con clases de color, entradas inmutables y puntos originales. Superadas. |
| Nuevo tests/fase6-browser.mjs | Nueve escenarios: los tres casos con eventos en Transición, Estático y Bloqueo directo. Verifica dos pulsaciones, valor/resultado de cada botón reorganizado, vacío, acción/defensa/tipo/sección/total, recarga, Deshacer y aislamiento entre partidos. ok:true. |
| Regresión Fase 2 | 15 grupos: partidos, recargas, histórico v1, abortos, borrado exclusivo y concurrencia. ok:true. |
| Regresión Fase 3 | 13 grupos: 28 combinaciones/90 resultados, doble toque, restricciones CSV, 109 puntos, fallos reales, reintentos, dos pestañas e históricos. ok:true. |
| Regresión Fase 5 | 8 grupos y descarga nativa CSV con BOM. Paquete regenerado con los cambios de 6A (12 archivos) y probado bajo /registro_defensas_baloncesto/, sin publicar. ok:true. |
| Responsive | 13 casos, sin scroll horizontal ni recortes de nombres/estadísticas/resultados, objetivos ≥44 × 44, tres secciones/20 defensas presentes, foco y selección visibles. Diálogos dentro del viewport; última defensa accesible por scroll sobre la barra. Superados. |

Tamaños probados **mediante emulación**:
- Móvil: 320×640, 360×740, 390×844; horizontales 844×390 y 640×360.
- Tablet vertical: 768×1024.
- iPad horizontal: 1024×768, 1180×820 y 1194×834. Las cuatro filas completas quedan por encima de la barra sin scroll con la configuración inicial y texto normal.
- Altura útil reducida: 1024×620; requiere scroll y permite llegar a la última defensa sin ocultarla tras la barra. Es una aproximación a menos altura disponible, no una reproducción de la interfaz de Safari.
- Escritorio: 1440×900.
- Ampliación: zoom CSS 200% en 640×960 y texto raíz 200% en 320×800. No equivalen a zoom/ajustes de iPadOS. Se corrigió un recorte inicial de símbolos de resultados en texto ampliado; el informe final pasa.

Medidas finales con muestra ficticia y selección PR Manejador/Blue: cabecera ≈89 px en 1024 y 91 px en 1180/1194; barra ≈117 px. Los mensajes/selecciones extensos pueden aumentar esa altura y el espacio reservado se actualiza.

**Dispositivos reales probados en esta fase: ninguno.** Pendiente verificar Safari en iPad físico, sus barras dinámicas, zonas seguras no nulas, rotación, teclado virtual y interacción táctil real. No se afirma haber validado esos aspectos físicamente.

### Capturas revisadas y reproducción

Todas las capturas contienen datos ficticios y permanecen locales en .test-artifacts/, excluido de Git:
- fase6a-1024-768-1.png, fase6a-1180-820-1.png y fase6a-1194-834-1.png: iPad horizontal.
- fase6a-1440-900-1.png: escritorio.
- fase6a-390-844-1.png y fase6a-390-844-scroll.png: móvil al inicio y con las defensas accesibles al final.
- fase6a-1024-620-scroll.png: altura reducida con última fila sobre la barra.
- También generadas capturas 320×640, 768×1024, 844×390 y texto 200% (320×800).

Informes: .test-artifacts/fase4-fase6a.json (geometría), fase6-result.json (estadísticas/interfaz), fase2-result.json, fase3-result.json y fase5-result.json. Los tests y documentos internos mantienen su exclusión de publicación.

Con Node moderno y el servidor node tests/servidor.mjs 8080 abierto:

~~~text
node tests/configuracion.test.mjs
node tests/registro.test.mjs
node tests/integracion.test.mjs
node tests/exportacion.test.mjs
node tests/estadisticas.test.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 2
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 3
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 5
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 6
powershell -NoProfile -ExecutionPolicy Bypass -File tests/revisar-responsive.ps1 -Port 8080 -Label fase6a
~~~

En esta sesión se usó el runtime Node de la herramienta para las pruebas puras y el servidor, porque node no está en PATH; los runners PowerShell y Chrome se ejecutaron directamente. git diff --check sin errores de espacios.

Producción modificada: index.html, styles.css, app.js y js/estadisticas.js. Documentación: ESPECIFICACION.md y README.md. Pruebas: casos nuevos de estadísticas/Fase 6A y adaptación de expectativas de formato, runner de Phase 6 y revisión responsive. La decisión pendiente es aprobar la distribución tras revisar capturas y contrastarla en el iPad; cualquier Fase 6B o publicación requerirá su propia autorización.

## 20. Fase 6B — Auditoría deportiva e identidad visual

Estado: auditoría completada el 12 de octubre de 2026, pendiente de elección de propuesta. El usuario ha confirmado completada la Fase 6A al solicitar esta fase. La interfaz de producción conserva esa versión; no se aplica aún ningún rediseño.

Entregables: AUDITORIA_DISENO.md con diagnóstico, decisiones a conservar, paletas HEX, fuentes locales, componentes, accesibilidad, riesgos y recomendación; vistas estáticas Basketball Scout (A) y Courtside Pro (B) en tests/diseno-fase6b/; comparacion.html reúne capturas reales comparables.

- A: planilla clara cálida, matriz continua, grafito y naranja, resúmenes a la derecha, cifras tabulares y controles planos.
- B: módulos oscuros sin tarjetas exteriores, títulos condensados, cifras monoespaciadas, resúmenes junto a títulos y resultados sólidos verdes/rojos.
- Recomendación: A por continuidad de lectura y menor ocupación; juicio de diseño sin medición de velocidad en partido. B sigue disponible como alternativa.
- Ambas usan el mismo snapshot: 87 intentos, 51 fallados y 36 anotados (51–36 · 59%); incluyen 7–3 · 70%, 0–5 · 0%, 5–0 · 100% y guiones. Categorías y IDs proceden del CSV local actual.
- Las vistas no cargan app.js, persistencia o exportación ni abren IndexedDB; son maquetas sin registro. El estado Guardado es simulado. Generación con módulos puros, sin modificar lógica de producción.
- Emulación Chrome headless, perfil nuevo aislado: 1180×820, 1440×900, 390×844, 1024×768, 1194×834 y 1024×620 por propuesta (12 casos). Tres secciones y veinte defensas, orden correcto, sin scroll horizontal ni recortes y objetivos ≥44×44 px. Cuatro filas visibles sin scroll en los tres tamaños de iPad. Móvil/altura reducida permiten alcanzar la última defensa sobre la barra mediante scroll.
- Foco verificado con Tab, selección por símbolo/borde y muestras de contraste normales/seleccionadas/guardando/error/deshabilitadas ≥4,5:1. Mínimos medidos finales: A 5,43:1, B 6,34:1. No constituye auditoría WCAG completa. Cabecera/barra en 1180×820: A 88/≈115 px; B 93/≈117 px.
- Dispositivos reales: ninguno. Pendientes Safari/iPad, zonas seguras no nulas, reflejos/brillo, fuentes locales, rotación, teclado, ampliación nativa y lector de pantalla.
- Capturas en .test-artifacts/fase6b-scout/courtside-1180-820.png, -1440-900.png y -390-844.png; móvil desplazado con sufijo -scroll. También capturas de los otros tamaños. Informe: fase6b-geometria.json. Fuentes y guía de reproducción en tests/diseno-fase6b/.
- Verificación SHA-256 de los 11 archivos HTML/CSS/CSV/JavaScript runtime al inicio/final: intactos respecto a la Fase 6A. No se repitieron regresiones funcionales, al no editar producción ni ejecutar la aplicación desde las maquetas.

Los artefactos de pruebas permanecen excluidos de publicación. Sin cambios en categorías, registros, IndexedDB, lógica, README o estilos de producción durante esta fase. Sin commit, push ni despliegue. Se detiene para elegir A/B o pedir una revisión; elegir y autorizar una dirección es el paso anterior a implementar la interfaz definitiva y repetir las regresiones de Fase 6A.

## 21. Fase 6D — Replanteamiento creativo GAME DAY

Estado: dos prototipos aislados terminados y refinados, pendientes de revisión del usuario. El resultado estético de Basketball Scout ha sido rechazado; su recomendación anterior se conserva como histórico y deja de ser la dirección vigente. No se inventa ni se ejecuta una fase intermedia no solicitada.

- Broadcast Desk: composición de marcador/retransmisión, bandas naranja-grafito, porcentajes protagonistas y matriz horizontal con tipos en carril oscuro. Mantiene el recorrido espacial de Transición/Estático arriba y Bloqueo directo debajo.
- Tactical Board: pizarra moderna, banda lateral de Transición/Estático y área principal de bloqueos en pantallas amplias; cuatro carriles con encabezado de tipo y cinco defensas. En móvil se apilan todas las secciones.
- Ambos aprovechan la altura disponible en escritorio con CSS Grid y celdas adaptativas. No añaden contenido decorativo. Separación última defensa/barra a 1440×900: Scout 221 px; Broadcast 18 px; Tactical 28 px. Cabecera/barra a 1180×820: Broadcast ≈96/119 px; Tactical 101/119 px.
- Mantienen categorías y veinte defensas, cuatro resultados compartidos 2✕, 3✕ | 2✓, 3✓, símbolos/texto, verde/rojo semánticos y estadísticas originales. Envoltura de porcentaje añadida únicamente al HTML de la maqueta para dar jerarquía; cálculos y JavaScript de producción intactos.
- Datos ficticios idénticos a Scout: 87 intentos · 51–36 · 59%. Las vistas no cargan app.js, IndexedDB, sincronización ni exportación, y no registran tiros. Guardado es un estado visual ficticio.
- Capturas comparables reales de Chrome headless y perfil nuevo aislado: 1180×820, 1440×900, 390×844; además 1024×768, 1194×834 y 1024×620 para cada nuevo prototipo y Scout (18 casos). Sin desbordamiento horizontal, recortes o objetivos menores de 44×44. Cuatro filas visibles en los tres tamaños de iPad amplios. Scroll permite llegar al final de la matriz en móvil/altura reducida.
- Revisión y refinamiento de capturas: porcentaje de tipos de bloqueo corregido sobre fondo oscuro, cabecera/barra compactadas y espacio inferior contrastado. Foco mediante Tab, selección por símbolo/borde y contraste de todos los porcentajes/muestras de controles/estados. Mínimos de texto medidos: Broadcast 5,51:1, Tactical 5,75:1; no es auditoría WCAG completa.
- Emulación únicamente; no probados Safari/iPad físico, reflejos, fuentes reales del dispositivo, zonas seguras no nulas, teclado, zoom/texto ampliado o rotación. No se afirma mejora de velocidad medida en partido.

Informe: DIRECCION_ARTISTICA_GAME_DAY.md. Comparador: tests/diseno-fase6d/comparacion.html; fuentes y reproducción en ese directorio. Capturas .test-artifacts/fase6d-broadcast/tactical/scout-ancho-alto.png, con -scroll para móvil desplazado. Informes: fase6d-geometria.json y fase6d-integridad.json. Se verifican las huellas de 12 archivos runtime contra el inicio de fase para conservar producción.

Producción y configuración no modificadas. No se ejecuta una nueva implementación funcional ni se repiten regresiones de IndexedDB/CSV al no tocar el código real. Una propuesta definitiva requerirá elección/autorización y posterior verificación de funcionalidad y responsive. Sin commit, push o publicación. Se detiene para revisión.

## 22. Fase 6E — CourtFlow / Modern Basketball Performance

Estado: dos prototipos aislados refinados, terminados y pendientes de elección. GAME DAY se conserva como antecedente; el usuario solicita ahora una identidad contemporánea sin Impact, tipografía condensada, bloques agresivos ni divisores negros gruesos.

- CourtFlow Light: base clara, cabecera blanca, tipografía sans local contemporánea, radios 8–12 px y cifras tabulares; Transición/Estático arriba, matriz debajo, resultados suaves.
- CourtFlow Contrast: misma identidad, cabecera/barra grafito y registro central claro; situaciones a la izquierda y bloqueos a la derecha en pantallas amplias, encabezados de tipo ligeros y resultados sólidos. En móvil se apilan las tres secciones.
- Paleta base #F46A2A / #202C2A / #F5F6F3 / #147A55 / #BE3548. Textos/foco sobre claro y verdes/rojos sobre grafito ajustados por contraste. Sin fuentes externas, sombras/degradados o ilustraciones.
- Las imágenes de referencia mencionadas no estaban accesibles en el hilo ni en adjuntos locales. Las decisiones responden a los criterios escritos; no se afirma haber analizado esas imágenes.
- Recomendación: Light por continuidad espacial y menor carga visual; sin afirmar una mejora de rapidez medida. La elección sigue pendiente.
- Capturas HTML/CSS reales: 1180×820, 1440×900 y 390×844, además 1024×768, 1194×834 y 1024×620 para cada variante (12 casos emulados Chrome). Sin recortes/scroll horizontal ni objetivos menores de 44×44, tres secciones/veinte defensas y cuatro resultados en orden. Cuatro filas completas en los tres tamaños amplios de iPad; scroll permite acceder al final en móvil/altura reducida.
- Mismos datos ficticios: 87 intentos · 51–36 · 59%; 36 campos estadísticos visibles idénticos, con 7–3 · 70%, 0–5 · 0%, 5–0 · 100% y —. No se cambian cálculos, CSV, eventos o lógica de registro.
- Cabecera/barra en 1180×820: Light 96/≈115 px; Contrast ≈95/116 px. Última defensa/barra en escritorio: 26/20 px. Celdas adaptativas sin rellenar con contenido decorativo.
- Foco Tab verificado, selección por borde/franja/✓ y muestras de contraste de controles/tipos/estados y todos los porcentajes ≥4,5:1; mínimo 4,77:1. No es auditoría WCAG completa. Las capturas finales retiran el anillo de foco de la prueba.
- Fuentes de ambas vistas en tests/diseno-fase6e/: hoja común courtflow.css y variantes light.css/contrast.css. No cargan app.js ni módulos funcionales en navegador, no abren IndexedDB, no registran datos; Guardado es ficticio. El generador usa módulos puros existentes y el CSV local.
- Huellas de 12 archivos runtime conservadas respecto al inicio de fase; producción intacta. Sin nuevas regresiones funcionales al no cambiar código real.
- Emulación solamente: pendientes Safari/iPad físico, fuentes efectivas, brillo/reflejos, zonas seguras no nulas, zoom/texto ampliado, teclado, rotación y lector de pantalla.

Informe: DIRECCION_VISUAL_COURTFLOW.md. Comparador: tests/diseno-fase6e/comparacion.html. Capturas .test-artifacts/fase6e-light/contrast-ancho-alto.png y -scroll.png para móvil desplazado; informes fase6e-geometria.json y fase6e-integridad.json. Pruebas/artefactos excluidos de publicación.

Sin implementación definitiva, commit, push o despliegue. Se detiene para elegir variante o solicitar revisión antes de autorizar cualquier aplicación a producción.

## 23. Fase 7 — Dashboard visual de rendimiento: maqueta

Estado: maqueta de consulta terminada el 13 de octubre de 2026; **se detiene para revisión**. El requisito adicional autoriza el diseño con datos ficticios y sus capturas; no autoriza todavía toda la funcionalidad ni publicación. Las elecciones de Fase 6E siguen pendientes; esta propuesta toma CourtFlow claro como punto de partida sin aplicarlo al registro.

### Distribución y codificación

- A: resumen de los tres grupos con barras y volúmenes; banda única de éxito global y puntos concedidos. B: Transición. C: Estático. D: Bloqueo directo con mayor anchura, barras y porcentajes mayores. En iPad B/C quedan a la izquierda y D a la derecha; en móvil se apilan A–D.
- Barras horizontales apiladas al 100%, verde para fallados rival y rojo para anotados rival. Segmentos proporcionales a los recuentos de cada fila; ancho total común para comparar porcentajes. Nombre, fallados–anotados, porcentaje e intentos visibles, sin hover ni dependencia exclusiva del color. Sin tablas, librerías, gráficos circulares ni animaciones.
- Estático y Bloqueo directo ordenados por éxito ascendente (fracción exacta), dejando cero intentos al final. Empates mantienen el orden del CSV. Transición conserva el orden de configuración.
- Estrategias agrupadas por ID de defensa entre PR Manejador, PR Roller, PR Pop y Spain. Nombres e IDs proceden del CSV local durante la generación, sin configuración deportiva duplicada en producción.
- Propuesta: distintivos «Mejor rendimiento» y «A revisar» dentro de cada grupo, únicamente entre filas con ≥5 intentos. Se requieren dos elegibles con rendimientos distintos; extremos empatados comparten distintivo, todas empatadas no se destacan. Las muestras menores conservan porcentaje y ranking con aviso discreto, sin distintivo. Umbral y política pendientes de revisión.
- Sin intentos: —, barra vacía y 0 intentos. El porcentaje global deriva del total de eventos, no de promediar porcentajes.

### Entregables y verificación

- `tests/dashboard-fase7/index.html` y `maqueta.css`: maqueta estática sin JavaScript en navegador, sin carga de app.js, IndexedDB ni exportación. `generar.mjs` crea eventos ficticios solo en memoria y usa módulos puros existentes; `muestra.json` documenta la muestra de desarrollo, sin añadir exportación JSON al producto.
- Muestra coherente: 69 intentos, 37 fallados, 32 anotados, 54% global y 71 puntos. Incluye White 7–3 · 70% · 10 intentos; Blue 1–0 · 100% con muestra pequeña y sin distintivo; Tut y Bajo aro de Estático vacíos.
- `revision.html`: comparación de capturas; `README.md`: decisiones, casos, limitaciones y reproducción; `capturar.ps1`: Chrome headless con perfil aislado.
- Capturas en `.test-artifacts/fase7/`: iPad 1180×820 y 1024×768, móvil 390×844 y 320×740, móvil completo y detalle de bloqueos. En ambos iPad las cuatro zonas y el pie caben sin scroll; móvil permite consulta completa mediante desplazamiento. Sin desbordamiento horizontal.
- Capturas inspeccionadas y compactación refinada. Verificados 13 registros visuales, segmentos proporcionales, recuentos, vacíos, ausencia de distintivos con muestras pequeñas y rankings. `verificacion.json` contiene geometría/valores/orden; `integridad.json` confirma SHA-256 idéntico de los 12 archivos de producción respecto al inicio.
- Ningún dato real creado o modificado. Registro en dos pulsaciones, IndexedDB, Deshacer, configuración y CSV intactos. No se repiten pruebas funcionales al no modificar o ejecutar la aplicación. No se han usado versiones locales ausentes.
- Solo emulación Chrome; pendientes Safari/iPad físico, lectura con brillo/reflejos y valoración del texto secundario compacto. No se afirma una rapidez de lectura medida en partido.

Artefactos locales excluidos de Git/publicación por reglas existentes. Sin commit, push o despliegue. Pendiente revisar distribución, protagonismo, ranking, umbral/empates y legibilidad antes de autorizar integración. La implementación posterior debe consultar exclusivamente el partido activo, conservar históricos por IDs y no escribir en eventos desde el Dashboard.

## 24. Integración local del diseño premium-ui

Estado: tarea autorizada completada el 13 de octubre de 2026; se detiene para revisión, sin iniciar otra fase.

### Origen y recuperación

- Rama local al inicio y al cierre: `main`. HEAD no modificado. Cinco archivos con cambios sin commit (README.md, app.js, index.html, js/estadisticas.js, styles.css) y seis documentos nuevos conservados.
- Ejecutado `git fetch origin` sin checkout, merge, reset, stash, commit ni push. Origen del diseño: `origin/design/premium-ui`, commit `c41774782bc216ca069fbf309c1a1274c0ae2398`. No se modifica ninguna rama remota.
- Copia anterior a las modificaciones en `.local-backups/premium-ui-20261013-173656/`: `fuentes.tar.gz` incluye fuentes, pruebas, documentos sin seguimiento y artefactos locales; `repositorio.bundle` conserva las referencias Git previas al fetch; `cambios.patch`, `estado.txt` y `HEAD.txt` documentan el estado inicial.
- Un primer intento de copia completa encontró un archivo bloqueado de un perfil temporal de Chrome. `workspace.tar.gz` es ese intento parcial; la copia válida es `fuentes.tar.gz`, verificada y completada excluyendo únicamente `.git`, la propia carpeta de copias y `.test-artifacts/chrome-*`. Los perfiles permanecen intactos en su ubicación. No se han borrado archivos ni datos reales.
- Para recuperar, extraer `fuentes.tar.gz` en una carpeta nueva y comparar antes de restaurar archivos selectivamente; no extraer encima del proyecto a ciegas. El bundle permite reconstruir el historial y el parche documenta los cambios previos sin depender de un commit nuevo.
- `.local-backups/` se añade a `.gitignore` para mantener la recuperación fuera de futuros commits.

### Integración selectiva y diferencias resueltas

- Nuevo `premium.css`: capa visual procedente del remoto (lienzo blanco, módulos grises, naranja de selección, matriz con ejes y resultados verdes/rojos). Ajustes finales locales para controles ≥44 px, foco/selección visibles, colores de estadísticas y espacio reservado a la barra. Se utilizan fuentes disponibles localmente y alternativas del sistema, sin importar Google Fonts; los tipos exactos del remoto solo se mostrarán si están instalados.
- `index.html`: enlace relativo a premium.css y color de tema claro. Conserva todos los IDs, formularios, accesibilidad y el orden local 2✕, 3✕, 2✓, 3✓.
- `app.js`: solo cambia `buildDirectActions`, incorporando envolturas de matriz y clases de selección de fila/columna. Se conserva statMarkup, filtros por ID, botones/atributos y la lógica local. Encabezados compartidos solo si todas las filas tienen las mismas defensas y orden; un CSV diferente mantiene sus botones y etiquetas sin ejes engañosos.
- Transición y Estático: dos filas, misma altura en tamaños normales; Estático mantiene tres columnas incluso a 320 px. En móvil los paneles se apilan y las defensas se reorganizan sin desplazamiento horizontal ni ocultar combinaciones.
- Se desactiva el desplazamiento suave del remoto para que el acceso a la última defensa y la reserva del pie sean inmediatos. Densidad de escritorio ajustada para que las cuatro filas estén sobre la barra en los tres tamaños de iPad horizontal comprobados.
- `styles.css`, categorias.csv y todos los módulos js/ permanecen idénticos a la copia inicial, incluidos los cambios locales previos de estadísticas. La comparación de app.js fuera de buildDirectActions también es idéntica. Informe: `.test-artifacts/premium-ui-integridad.json`.
- Diferencias resueltas sin merge automático: estadísticas coloreadas y resumen local; orden/significado de botones; densidad táctil y móvil; configuración editable frente a encabezados asumidos por el remoto. No se encontró un conflicto que exigiera perder datos o funcionalidad.
- README.md actualizado conservando el resto del documento. Preparación estática y prueba de subruta incorporan premium.css: 13 archivos runtime. Tests modificados: preparar-pages.ps1, fase5-browser.mjs, fase4-browser.mjs y revisar-responsive.ps1. Los dos últimos verifican alturas/cuadrícula y capturan excepciones JavaScript mediante CDP; emulan foco y envían Tab para comprobar modalidad de teclado en headless.

### Verificación ejecutada

- Cinco suites Node: configuración (26 casos), registro (28 combinaciones/90 resultados), integración simulada, CSV y estadísticas. Todas superadas, sin instalar paquetes.
- Chrome headless con perfiles nuevos aislados y servidor loopback: Fase 2 (15 grupos), Fase 3 (13 grupos), Fase 5 (8 grupos y descarga nativa CSV con BOM) y Fase 6 (9 escenarios de estadísticas, recarga, Deshacer y aislamiento). Todos ok:true.
- Responsive: 13 escenarios de tamaño/ampliación, sin scroll horizontal, botones inferiores fuera de pantalla, nombres/cifras recortados ni controles por debajo de 44 px. La última defensa queda accesible sobre el pie al desplazar. Tres secciones y veinte defensas presentes; foco, selección y diálogos verificados.
- Medición explícita de igualdad de altura y cuadrícula 3×2 en los 11 tamaños sin ampliación, incluido 320×640. A 200% se verifica accesibilidad y ausencia de recortes, sin exigir alturas iguales si el texto necesita crecer.
- iPad emulado 1024×768, 1180×820 y 1194×834: las cuatro filas de Bloqueo directo visibles sobre los resultados sin scroll. Móvil y altura reducida utilizan scroll vertical.
- `.test-artifacts/premium-ui-javascript.json`: cero excepciones JavaScript sin capturar durante carga y auditoría responsive; operación Roller 2P, estadística y Deshacer correctos. Las suites funcionales comprueban también fallos esperados de almacenamiento.
- Capturas finales inspeccionadas en 1180×820 y 390×844. Informes/capturas adicionales en `.test-artifacts/fase4-premium-ui.json` y `premium-ui-*.png`. Paquete bajo /registro_defensas_baloncesto/ probado con CSS premium cargado; generado sin publicación.
- git diff --check sin errores de espacios. No se han utilizado perfiles ni datos reales para probar.

Pendiente: revisión visual del usuario, Safari/iPad físico, teclado virtual, zonas seguras reales y apertura del CSV en Excel. Las fuentes del sistema pueden diferir del diseño remoto. No se afirma auditoría completa de contraste o accesibilidad. Dashboard sigue como maqueta aislada; no implementado en esta tarea. Sin commit, push, despliegue ni modificación de main remoto.

## 25. Ajuste tipográfico final del diseño premium

Estado: completado el 13 de octubre de 2026, pendiente de revisión del usuario; sin commit, push ni publicación.

- Fuentes oficiales descargadas del repositorio google/fonts e incluidas en `fonts/`: Barlow Condensed Bold (títulos, categorías, acciones, defensas y situaciones de bloqueo) y Manrope variable (cifras, estadísticas, controles, formularios y mensajes), con ambas licencias OFL. Carga mediante rutas relativas desde premium.css; ninguna petición externa al utilizar la aplicación. Sustituye las alternativas del sistema como tipografía principal del apartado 24.
- `body, body * { text-transform: uppercase; }` y transformación de placeholders por CSS. Cubre estados dinámicos, opciones del selector, diálogos y valores visibles de los campos. No convierte el contenido de los nodos ni los valores de los inputs. La capitalización original se conserva al guardar y al exportar CSV. Los avisos y tooltips nativos del navegador no son elementos estilables por CSS y conservan su presentación nativa.
- Ajustados únicamente familia, peso, espaciado, tamaño e interlineado tipográficos. Nombres en 16 px, situaciones de bloqueo en 17 px; Estático a 14 px hasta 360 px para mantener legibilidad sin recortar o alterar su cuadrícula. Manrope y cifras tabulares en estadísticas. Colores, grids, espaciados de distribución y funcionalidades intactos; no se han editado app.js, index.html, styles.css, categorias.csv ni módulos js/ durante esta tarea.
- Copia previa de los archivos afectados en `.local-backups/` dentro de la carpeta `tipografia-*` de esta sesión. Se conservan todas las modificaciones locales anteriores.
- Preparador de paquete, prueba de subruta y README actualizados para incluir fuentes/licencias: 17 archivos. Cambios de prueba en fase4-browser.mjs y revisar-responsive.ps1 para esperar document.fonts.ready, confirmar ambas fuentes realmente cargadas, revisar mayúsculas de texto dinámico y diálogos y verificar valores mixtos de formulario intactos.
- Responsive Chrome headless, perfil aislado: 13 escenarios superados, desde 320 px, iPad, escritorio, horizontal, altura reducida y ampliación de texto/zoom CSS al 200%. Sin textos recortados ni scroll horizontal; objetivos táctiles ≥44 px; tres secciones y veinte defensas presentes. Misma altura Transición/Estático y cuadrícula 3×2 en tamaños sin ampliación. Cuatro filas de bloqueo sobre el pie en los tres iPad horizontales comprobados. Registro Roller 2P y Deshacer correctos.
- Cero excepciones JavaScript sin capturar. Fase 5: ocho grupos superados; descarga nativa CSV con BOM, capitalización original, recargas, históricos, fallos, aislamiento y carga real de fuentes bajo /registro_defensas_baloncesto/. No se repiten otras suites de lógica porque la implementación JavaScript no cambia.
- Capturas inspeccionadas: 1180×820, 390×844 inicial y final de la matriz, y 320×640. Informes `.test-artifacts/fase4-tipografia.json`, `tipografia-javascript.json`; capturas `tipografia-*.png`. `git diff --check` sin errores.

Pendiente: revisión estética del usuario y prueba en Safari/iPad físico (teclado, selector nativo, interacción táctil y zonas seguras). Dashboard permanece aislado como maqueta. No se modifica ni publica ninguna rama remota.

## 26. Copper Court — evolución funcional desde las dos referencias adjuntas

Estado: propuesta terminada y funcional el 13 de octubre de 2026; se detiene para valoración del usuario. Una dirección coherente aplicada al registro local, sin integrar el Dashboard ni iniciar otra fase.

### Lectura de las referencias y criterio

- Primera imagen: tarjetas suaves con volumen discreto, blancos/grises superpuestos, esquinas amplias, controles agrupados y una acción principal reconocible. Se adapta esa profundidad mediante gradientes estrictamente neutros, sombras negras de baja opacidad y tarjetas táctiles; no se copia la ilustración ciclista, el azul ni el recorrido de navegación.
- Segunda imagen: títulos condensados deportivos, métricas sans legibles, contraste fuerte y módulos simples con radios cuidados. Se adapta la jerarquía con Barlow Condensed Bold en cabecera/categorías/acciones/situaciones y Manrope en cifras, estadísticas y controles; ambas fuentes locales existentes se conservan. Sin fotografías decorativas que resten espacio al registro.
- Identidad Copper Court: blanco, negro y grises neutros. Único acento cromático #B87145, naranja cobrizo desaturado; variaciones claras/oscuras del mismo naranja para selección, foco y errores. Sustituye la semántica verde/roja de las fases anteriores por contraste y etiquetas/símbolos, conforme a la nueva instrucción del usuario.
- La barra inferior pasa a ser una superficie negra redondeada con controles fallados oscuros y anotados blancos. Orden 2✕, 3✕, 2✓, 3✓ y significado intactos. La selección se comunica también con borde doble, franja y ✓; los estados siguen descritos mediante mensajes, sin depender del color.
- Transición y Estático sobre tarjetas blancas; Estático conserva 3×2 y ambos tienen igual altura en tamaños normales. Bloqueo directo sobre plano gris suave, ejes discretos y defensas blancas. En móvil se compacta el espacio de encabezados respecto al diseño anterior y todas las defensas siguen desplegadas, accesibles por scroll vertical.

### Cambios y conservación

- `premium.css` reconstruido como una sola dirección visual, retirando la acumulación de correcciones visuales anteriores. Conserva mayúsculas CSS y fuentes locales, añade superficies, contrastes, estados y ajustes de altura/ampliación. Nombres pequeños mantienen al menos 14 px; objetivos táctiles ≥44 px.
- `index.html`: únicamente theme-color de #f8f8f6 a gris neutro #f5f5f5. Ningún cambio de estructura, IDs o flujo.
- README.md y esta especificación actualizados para explicar la identidad y la nueva semántica visual; pruebas responsive ampliadas con auditoría de colores calculados, selección, estados, mayúsculas y fuentes. Capturas editoriales sin anillo de foco, después de verificarlo en las mediciones.
- Nuevo comparador `tests/diseno-copper-court/revision.html`: antes/después con capturas equivalentes y móvil inicial/final, enlace a la aplicación real. Solo muestra imágenes, sin abrir IndexedDB; excluido de publicación por las reglas existentes.
- Copia previa `.local-backups/copper-court-20261013-215941/fuentes.tar.gz`: incluye código, fuentes, pruebas y documentación; excluye .git, copias previas y artefactos de pruebas. Conserva el diseño anterior completo para recuperación selectiva en una carpeta nueva.
- Comparación binaria frente a la copia: app.js, styles.css, categorias.csv y los siete módulos funcionales idénticos. index.html cambia únicamente metadatos de color. Informe `.test-artifacts/copper-court-integridad.json`. Sin reescritura de configuración, registros o contenido CSV. El paquete se regenera localmente con sus 17 archivos, sin publicar.

### Comprobaciones realmente ejecutadas

- Cinco suites Node superadas: configuración (26 casos), registro (28 combinaciones/90 resultados), integración simulada, CSV y estadísticas.
- Fase 3 Chrome: 13 grupos superados, incluidas las 90 combinaciones válidas en dos pulsaciones, doble toque, Deshacer, recargas, históricos, fallos y concurrencia entre dos pestañas.
- Fase 5 Chrome: ocho grupos superados, CSV con BOM y capitalización original, aislamiento, configuración/histórico, fallos de lectura, recarga inmediata, descarga nativa y rutas/fuentes bajo /registro_defensas_baloncesto/.
- Responsive: 13 escenarios emulados de 320–1440 px, horizontal, altura reducida y ampliación de texto/zoom CSS 200%. Sin scroll horizontal, nombres/cifras/resultados recortados o controles menores de 44 px. Última defensa accesible sobre la barra mediante scroll, diálogos contenidos incluso con texto ampliado; alturas superiores iguales y Estático 3×2 en tamaños normales.
- iPad 1024×768, 1180×820, 1194×834: las cuatro filas sobre la barra sin desplazarse. Móvil y altura reducida permiten scroll vertical. Se afinaron interlineados, altura compacta y ajuste del diálogo de eliminación al 200%, manteniendo su lógica.
- Cero excepciones JavaScript sin capturar. Paleta de colores calculados (texto, fondos/gradientes, bordes, foco y sombras), incluida selección y estados guardando/error/éxito: ningún color fuera de grises/neutros y naranja. No se cambia el color de nombres de defensas como Blue, Red o White: son etiquetas de configuración, mostradas en texto neutro.
- Capturas finales inspeccionadas de iPad 1180×820 y móvil 390×844 inicial/final; también durante la iteración 1024×768. Informes `.test-artifacts/fase4-copper-court.json`, `copper-court-paleta.json`, `copper-court-javascript.json`; capturas `copper-court-*.png`. `git diff --check` sin errores.
- Solo datos ficticios y perfiles Chrome nuevos aislados. No se ha navegado con el perfil del usuario ni alterado datos reales.

Pendiente: valoración estética y uso táctil/Safari en iPad físico, zonas seguras reales, reflejos/brillo, selector/avisos nativos y apertura real en Excel. No se afirma auditoría WCAG completa ni mejora de velocidad medida en partido. Las imágenes son referentes visuales, no activos añadidos al producto. Sin commit, push, fetch, cambio de rama ni modificación remota.

## 27. Herramientas de revisión visual — Playwright

Estado: tarea autorizada completada el 13 de octubre de 2026; se cierra para revisión, sin iniciar otra fase de diseño ni publicar.

- Instalado @playwright/test 1.64.0 como dependencia de desarrollo, fijada con package-lock.json. Node v24.21.0 ya estaba instalado en C:\Program Files\nodejs; se añade al PATH únicamente durante las ejecuciones, sin cambiar la configuración del sistema.
- Chromium, Headless Shell y componentes auxiliares descargados en .test-artifacts/playwright/browsers/. node_modules y artefactos excluidos de Git. Sin dependencias nuevas de producción ni cambios en HTML/CSS/JavaScript de la aplicación.
- playwright.config.mjs define escritorio 1440×900, móvil táctil 390×844 y móvil estrecho 320×740. tools/playwright/ contiene runner, servidor estático loopback con lista de archivos permitidos, prueba y guía. El runner inicia/detiene su propio servidor en 127.0.0.1:4173 y rechaza puertos ocupados; no reutiliza servidores ajenos. Se usa gestión directa del proceso Node para evitar el bloqueo observado en el cierre del webServer de Playwright en este entorno Windows.
- Comandos: npm run visual (capturas), npm run visual:abrir (navegador visible), npm run visual:informe (informe HTML), npm run visual:instalar (instalar Chromium). Para explorar con Inspector: npm run visual -- --debug --project=movil. README enlaza la guía reproducible.
- Cada prueba abre un contexto efímero independiente sin perfil personal ni storageState; solo crea un partido ficticio y un tiro. No borra bases ni modifica datos reales. Sin cambios en IndexedDB, configuración deportiva, lógica de registro o exportación.
- Verificación: tres proyectos superados en headless y escritorio superado adicionalmente con navegador visible. Registro en dos pulsaciones y recarga correctos; 28 destinos, sin errores JavaScript/carga, sin desbordamiento horizontal y botones de resultado visibles de al menos 44×44 px.
- Se generan 18 PNG (seis por tamaño) con estado inicial, formulario, partido activo, selección, registro recargado y final de página. Capturas de página completa y viewport adjuntas al informe en .test-artifacts/playwright/report/. Las ejecuciones sustituyen los resultados anteriores; conservar copias para comparar iteraciones.
- Inspección visual realizada de las capturas completas con registro en los tres tamaños: módulos legibles, secciones desplegadas y sin recortes horizontales; móvil usa scroll vertical y todas las defensas aparecen. Las comprobaciones automáticas no sustituyen el juicio estético.

Pendiente: valoración del usuario y pruebas en Safari/dispositivos físicos. No se establecen referencias de píxeles aprobadas ni se cambia el diseño durante esta tarea. Sin commit, push o despliegue; cambios locales previos conservados.

## 28. Exploración independiente con frontend-design — Pulse / Bench / Switch

Estado: tres propuestas visuales terminadas el 13 de octubre de 2026. Se cierra para elección de dirección artística; no se integra ninguna en la aplicación principal. Copper Court queda descartada como propuesta estética, aunque sus archivos runtime se conservan intactos hasta autorizar un reemplazo.

- Habilidad leída y aplicada: `.agents/skills/frontend-design/SKILL.md`. Plan previo con tokens, tipografía, diagramas ASCII y autocrítica en `tests/exploracion-frontend/README.md`. Las mayúsculas solicitadas tienen prioridad sobre la preferencia genérica de la habilidad por sentence case.
- Las dos imágenes adjuntas se analizan como referentes de superficies suaves, agrupación de controles, proporción tipográfica y contraste deportivo. Se evitan fotografías y navegación decorativa que resten espacio a las defensas. Las tres opciones cambian estructura y manejo espacial, no solo color/bordes.
- Pulse: Manrope con títulos compactos, superficies claras suaves, situaciones a la izquierda y cuatro columnas de tipos de bloqueo, resultados circulares en una cápsula flotante. Naranja #B8815D. En móvil, tipos de bloqueo en dos columnas; requiere más scroll que una matriz horizontal.
- Bench: Manrope fuerte en fondo negro, herramientas a la izquierda, situaciones y matriz central, cuatro resultados grandes en columna derecha en escritorio. Naranja #B8825E. En móvil pasa a matriz compacta y resultados inferiores; hay que valorar la nueva ubicación lateral de los resultados en escritorio.
- Switch: Manrope con nombres grandes y proporciones asimétricas en un lienzo blanco sin tarjetas exteriores. Dos objetivos grandes de Transición, seis filas de Estático, bloqueos a la derecha y controles inferiores alargados. Naranja #C08C65. En móvil conserva objetivos protagonistas y necesita más desplazamiento que Bench.
- Solo blanco, negro, grises neutros y un naranja desaturado por propuesta. Valores y texto originales conservados; presentación en mayúsculas por CSS. Las tres utilizan la misma muestra ficticia: 114 intentos, 78 fallados, 36 anotados, 68%; PR Manejador/Blue 7–3 · 70%.
- Entregables nuevos únicamente en `tests/exploracion-frontend/`: tres HTML y sus hojas CSS, base accesible, generador, muestra JS, simulador en memoria, comparador, scripts de captura/servidor, informes y capturas. Las etiquetas y permisos se obtienen del CSV local durante generación. Ninguna demo importa app.js, abre IndexedDB, usa localStorage, exporta datos o consulta partidos reales.
- Se puede seleccionar una acción/defensa y pulsar resultado para simular un tiro; Deshacer y Reiniciar muestra afectan solo a memoria. Doble toque consume una selección una sola vez; Roller bloquea 3P según permisos del snapshot CSV. Recargar reinicia la muestra.
- Playwright existente, sin nuevas instalaciones ni cambios de package.json/configuración: Chromium real en 12 escenarios headless (tres propuestas × 1440×900, 390×844 táctil, 320×740 táctil, 1180×820) y seis escenarios adicionales con navegador visible (--headed --primary). Todas las verificaciones superadas. Las comprobaciones con contextos independientes no utilizan el perfil personal.
- 38 PNG finales: viewport, página completa y final por variante/tamaño, más comparaciones escritorio/móvil. Capturas visualmente revisadas de las tres propuestas en escritorio y móvil; refinados tipografía de cifras, espaciado del título y compactación de Switch en móvil. Comparador verificado en navegador, con sus nueve imágenes cargadas y tres vistas CSS seleccionables.
- Verificado: 28 destinos, 20 defensas, tres secciones desplegadas, resultados dentro del viewport, objetivos ≥44×44, ausencia de scroll horizontal/recortes, paleta permitida, mayúsculas, simulación de dos pulsaciones/Deshacer/permiso Roller, selección visible, foco de teclado y cero errores JavaScript/carga. La última defensa queda accesible por scroll sin quedar tapada por el pie fijo. Contextos con localStorage vacío y ninguna base IndexedDB.
- SHA-256 de 12 archivos runtime al inicio y al cierre: iguales, incluyendo index.html, app.js, styles.css, premium.css, categorias.csv y siete módulos js/. `integridad-inicial.json`, `verificacion.json` y `verificacion-visible.json` documentan las comprobaciones. No se repiten las regresiones de la aplicación real porque no se modifica ni se ejecuta desde estas demos.
- Comparador: `tests/exploracion-frontend/comparacion.html`; puede abrirse con el servidor de revisión en http://127.0.0.1:4182/. El servidor de capturas usa 4181 y se cierra al finalizar. El de revisión solo permite demos/capturas/fuente; no sirve la aplicación principal. Ambas rutas son locales, no despliegues.
- Se conserva copia previa de ESPECIFICACION.md en `.local-backups/exploracion-*/`; todos los cambios locales anteriores permanecen. Nuevos archivos de exploración excluidos de Git/publicación por la regla tests/ existente. Sin commit, push, fetch ni cambios remotos.

Pendiente: elección del usuario, evaluación táctil en dispositivo físico/Safari y autorización de una integración posterior. No se afirma auditoría WCAG completa, zoom nativo validado o rapidez de registro medida en partido. Las diferencias de densidad, disposición de defensas y posición de resultados son parte de la exploración y deberán revisarse antes de incorporarlas al registro real.

## 29. Evolución visual del premium original — propuesta aislada

Estado: propuesta única completada el 13 de octubre de 2026 y detenida para revisión, conforme a la petición del usuario de verla antes de aplicar cambios a la aplicación principal. No se inicia integración.

### Base y diagnóstico

- Leída la habilidad local frontend-design y documentado el plan antes de construir. La distribución solicitada y las mayúsculas prevalecen sobre preferencias genéricas de la habilidad.
- Comparados archivos locales, estilos finales de origin/design/premium-ui (c41774782bc216ca069fbf309c1a1274c0ae2398), diferencias HTML y capturas locales de la integración. No se hace fetch ni se cambia de rama.
- Los cuatro adjuntos visibles son referentes de superficies/aplicaciones; no contienen una captura identificable del registro original. Se utiliza como evidencia complementaria la captura local .test-artifacts/premium-ui-1180-820-1.png, sin presentarla como el adjunto del usuario.
- La integración preservó controles táctiles, orden local de resultados, estadísticas, ejes condicionales según CSV y reflujo móvil. Copper Court cambió posteriormente proporción superior 1:1,6 a 1:2, paneles grises a blancos, pie claro a negro y retiró el soporte interior de la matriz. Las demos Pulse/Bench/Switch alteraban la distribución y quedan descartadas como dirección vigente.

### Propuesta entregada

- tests/evolucion-premium/: HTML basado en index.html y reproducción de clases/envolturas reales de las acciones y buildDirectActions. Generación de etiquetas/permisos desde categorias.csv mediante el parser puro existente. Misma muestra ficticia en propuesta, reproducción actual y referencia remota.
- Recupera Transición izquierda / Estático derecha 1:1,6, igual altura, Estático 3×2, módulos grises, botones blancos, matriz horizontal con su plano interior y barra inferior clara fija. Móvil apila secciones y mantiene todas las defensas desplegadas; desplazamiento vertical permitido.
- Naranja cobre #C38053 con variantes del mismo tono. Grises estrictamente neutros, sombras negras suaves, bordes iluminados, gradientes contenidos y translucidez reservada a soportes y pie. Botones opacos para conservar lectura. Selección sólida con marca, fila/columna resaltadas, foco y respuesta de pulsación; reducción de movimiento respetada.
- Barlow Condensed local conserva los títulos originales; Manrope en nombres, herramientas y cifras. Todos los textos visibles de la maqueta en mayúsculas. Símbolos y etiquetas distinguen fallado/anotado por luminancia, sin colores adicionales; etiquetas de resultado visibles también a 320 px.
- demo.js simula selección, tiro y deshacer exclusivamente en memoria; recargar restablece la muestra. Gestión de partidos/CSV muestra un aviso de maqueta. No se importa app.js, no se abre almacenamiento, no se registra ni exporta dato real. El estado dice DEMO · EN MEMORIA, sin fingir transacciones guardadas.

### Verificación y revisión

- Chromium 156.0.8078.4 de Playwright existente, seis tamaños tanto headless como navegador visible: 1440×900, 1180×820, 1024×768, 768×1024, 390×844, 320×740. Versión exacta registrada en los informes; sin instalar dependencias.
- 28 objetivos / 20 defensas / tres secciones; Estático 3×2, paneles paralelos de igual altura; sin scroll horizontal ni recortes de nombres/cifras; controles ≥44×44 px; cuatro resultados en viewport y última defensa accesible sobre el pie al desplazar. Toda la matriz cabe sobre el pie en los cuatro tamaños de escritorio/tablet probados.
- Refinamientos derivados de capturas: compactación en 1024×768, selección que prevalece sobre hover y cifras de defensas a 11 px. Paleta calculada verificada incluyendo gradientes, mayúsculas, foco mediante Tab, simulación de dos pulsaciones, doble toque consumido una vez, Roller 2P, Deshacer y recarga. Cero errores de JavaScript/carga; IndexedDB sin bases y localStorage vacío en todos los contextos efímeros.
- 26 capturas de propuesta/referencias más captura del comparador. Inspeccionadas imágenes de escritorio, tablet y móvil; comparador abierto y verificado en Chromium visible con las tres vistas y todas sus imágenes cargadas. Las capturas completas móviles contienen el pie fijo a la altura del viewport; el comparador usa capturas de inicio y final para evitar confundir ese comportamiento de captura con una superposición permanente.
- Informes: tests/evolucion-premium/verificacion.json, verificacion-visible.json e integridad-inicial.json. SHA-256 de los 12 archivos runtime idéntico al inicio: HTML/CSS/JS/configuración intactos, incluidos cambios locales previos. Copia previa de especificación en .local-backups/evolucion-premium-20261013/.
- Revisión local: http://127.0.0.1:4183/tests/evolucion-premium/revision.html. Demo: http://127.0.0.1:4183/. Scripts servir.mjs, abrir.mjs y capturar.mjs documentados en el README de la propuesta. Servidor loopback limitado a maqueta, capturas y fuentes; nunca sirve la aplicación funcional.

Pendiente: valoración estética del usuario antes de integrar, Safari/dispositivo físico, brillo/reflejos y tacto real. No se afirma auditoría WCAG completa, zoom nativo validado o mejora de rapidez medida. No se repiten regresiones de persistencia/CSV al no modificar ni ejecutar la aplicación real. Sin commit, push, publicación o cambios en ramas remotas.

## 30. Premium cristal — nueva evolución visual aislada

Estado: propuesta terminada el 13 de octubre de 2026, pendiente de valoración antes de integrar. El usuario autoriza cambiar completamente el fondo siempre que siga claro, y exige un cambio perceptible en cristal, profundidad, materiales e iconografía, conservando la distribución premium. Se cierra esta tarea sin iniciar integración.

### Decisión visual y alcance

- Base: propuesta recuperada del apartado 29. Se revisan especificación, CSS/HTML local y herramientas existentes. Se continúa aplicando frontend-design; plan previo, esquema y autocrítica en tests/premium-cristal/README.md. El fondo casi uniforme y los paneles poco transparentes de la propuesta anterior limitaban el efecto vidrio; la cabecera carecía de un material propio.
- Nueva prueba en tests/premium-cristal/, sin sustituir tests/evolucion-premium/ ni archivos principales. premium-anterior.css conserva la geometría; cristal.css introduce únicamente materiales, fondo e iconos añadidos al HTML de prueba.
- Fondo perla con bandas de luz satinadas, halo circular y luz ambiental, hecho con CSS, sin imágenes generadas ni descargas. Blanco, negro, grises neutros y variaciones de un único naranja cobre #C17C4B. Las formas viven en una capa fija decorativa sin ocupar espacio ni captar eventos.
- Cabecera y pie de vidrio: bordes blancos, reflejos, sombras y backdrop-filter real de 22/26 px. Paneles con blur de 22 px y transparencia suficiente para ver la iluminación de fondo. Botones lechosos más densos mantienen la lectura; ejes de matriz más planos; selección cobre con relieve y marca. Resultados grafito/plata con reflejos suaves y signos/etiquetas originales.
- Siete iconos SVG lineales coherentes, locales y decorativos (aria-hidden). Acompañan etiquetas, nunca las sustituyen. Los iconos de sección se omiten cuando provocarían una fila extra: paneles superiores entre 761–1000 px y secciones móviles hasta 360 px. Se conservan todos los textos y los cuatro iconos de herramientas.
- Se mantienen fuentes locales: Barlow Condensed en títulos deportivos originales y Manrope en acciones, controles y cifras. Todos los textos visibles en mayúsculas. Transición/Estático 1:1,6 alineados; Estático 3×2; matriz horizontal; cuatro resultados fijos. No se cambian tamaños tipográficos ni se reducen objetivos táctiles respecto a la propuesta anterior.
- Microinteracciones de 180 ms responden a hover/pulsación/selección; no hay animación ambiental continua y se respeta prefers-reduced-motion. Fallback opaco claro si backdrop-filter no está disponible.

### Aislamiento y evidencia

- antes.html e index.html comparten muestra ficticia, selección, clases/IDs, simulador y distribución. La muestra se contrasta por IDs y permisos contra categorias.csv local mediante el parser puro existente. demo.js y muestra.js son copias sin cambios de la prueba anterior.
- La demo simula tiros y Deshacer solo en memoria; reinicia al recargar. Partidos y CSV se representan con aviso de maqueta; no se presenta como funcionalidad de producción. No importa app.js, no abre IndexedDB/localStorage ni consulta o modifica datos reales.
- Capturas antes/después a dimensiones idénticas en seis tamaños: 1440×900, 1180×820, 1024×768, 768×1024, 390×844 y 320×740. Inspección visual de escritorio, tablet compacta y móvil inicial/final. El nuevo fondo se transmite a los soportes, la cabecera gana un borde de vidrio visible, los paneles proyectan sombras, los controles tienen materiales distintos y los iconos quedan integrados.
- Tras inspección se suaviza el reflejo de los resultados y se aclara el extremo oscuro del cobre a #BD7A4C. Contraste conservador calculado para ese extremo: 4,89:1 con texto #261A11 en Nuevo partido y superior a 5:1 con #211810 en selección. No constituye una auditoría completa WCAG ni una medición de todos los fondos translúcidos.
- Playwright/Chromium 156.0.8078.4 ya instalado, sin nuevas dependencias: seis escenarios headless y los seis repetidos con navegador visible. 28 objetivos, tres secciones, 20 defensas, Estático 3×2, altura de paneles iguales y geometría superior comparada con el antes (tolerancia 2 px). Sin desbordamiento horizontal, nombres/cifras recortados ni controles menores de 44×44. Matriz completa sobre el pie en escritorio/tablet y última defensa accesible por scroll en móvil.
- Comprobados estilos efectivos de blur en cabecera/paneles/pie, iconos, paleta, mayúsculas, foco Tab, transiciones y movimiento reducido. Simulación de dos pulsaciones, consumo único en doble toque, Roller 2P, Deshacer y recarga correctos. Cero errores JavaScript/carga, ninguna base IndexedDB ni entrada localStorage en contextos efímeros sin perfil personal.
- Comparador revision.html con alternancia antes/después en seis tamaños y vista móvil desplazada; cuatro capturas de detalle para cabecera, paneles, matriz y barra. Abierto en Chromium visible y verificada la carga de todas las vistas. Hay 40 capturas de aplicación y detalles, más una del comparador. Las capturas completas de móvil incluyen el pie fijo a la altura del viewport; el comparador usa inicio/final para evaluar el desplazamiento.
- Informes: tests/premium-cristal/verificacion.json, verificacion-visible.json e integridad-inicial.json. 12 archivos runtime conservan SHA-256 inicial, incluida toda la lógica/configuración y los cambios locales. Copia previa de especificación en .local-backups/premium-cristal/ESPECIFICACION.md.

Revisión: http://127.0.0.1:4185/tests/premium-cristal/revision.html. Prueba: http://127.0.0.1:4185/. Scripts servir.mjs y abrir.mjs para revisión, capturar.mjs para reproducción (servidor efímero 4186). Servidores solo loopback y lista permitida de maqueta/capturas/fuentes; no sirven la aplicación funcional.

Pendiente: aceptación visual del usuario, Safari/dispositivos físicos, tacto, reflejos y rendimiento real del blur en tablet. No se afirma mejora de rapidez de registro medida ni auditoría completa de accesibilidad. Sin integración, commit, push, fetch, publicación o modificaciones remotas. La aplicación funcional y la propuesta anterior se conservan intactas.

## 31. Integración autorizada de Premium cristal y Estadísticas

Estado: completada localmente el 14 de octubre de 2026, pendiente de revisión del usuario. La aprobación explícita de la propuesta del apartado 30 autoriza integrar su diseño, conectar Estadísticas y añadir navegación. Se cierra esta fase sin commit, push, fetch, despliegue ni cambios remotos.

### Protección y alcance

- Antes de editar: `.local-backups/integracion-cristal-20261014-063235/` contiene proyecto-previo.tar.gz (277 entradas de fuentes, pruebas, documentos y fuentes tipográficas), parche de cambios locales, estado Git, HEAD y hashes iniciales. Excluye .git, dependencias instaladas, artefactos temporales y copias anteriores. Se verificó el listado del archivo. `propuesta-aprobada/` conserva una copia independiente de toda la demo; sus 57 archivos coinciden por SHA-256 con la propuesta original al finalizar.
- premium.css contiene exactamente las dos capas aprobadas, premium-anterior.css + cristal.css; solo se ajustan rutas de fuentes. HTML recibe ambiente e iconos de la demo conservando IDs, diálogos y lógica real. No se restauran archivos de una rama ni se reemplaza app.js. styles.css, categorias.csv y los siete módulos centrales conservan sus hashes iniciales, incluidos cambios locales anteriores.
- Se añade dashboard.css para navegación y la adaptación del Dashboard existente al mismo material. Botón Estadísticas / Registro con texto, icono y objetivo de 44 px, controles de partido compartidos, rutas hash y navegación Atrás/Adelante. Conserva selección en curso al alternar; resultados ocultos y deshabilitados durante consulta. En escritorio compacto, el botón requiere una primera fila 12 px más alta; la matriz sigue visible sobre el pie. La comparación de anchos descuenta el espacio de las barras nativas de scroll.
- Estadísticas reutiliza la composición de Fase 7: tres resúmenes, éxito global y puntos, Transición/Estático y defensas agrupadas de Bloqueo directo. Se conectan datos reales del partido activo, sin modificar eventos, esquema o cálculos existentes. Barras grafito/naranja con leyenda, cifras y volúmenes visibles. Sin intentos: guion. Ranking de Estático/Directo ascendente por tasa exacta, vacío al final. No se añaden distintivos ni umbrales de muestra que permanecían pendientes en la maqueta.
- Nuevos módulos js/vistas.js y js/dashboard.js. Modelo de solo lectura con filtro redundante por gameId, identidades estables y conservación de filas históricas retiradas. Eventos no clasificables siguen en total global/CSV y se informa su volumen. No se añade exportación ni persistencia. Avisos de operación/error disponibles también en Estadísticas; los avisos para elegir resultado solo aparecen en Registro.

### Verificación realizada

- Pruebas unitarias de configuración, registro, estadísticas, CSV e integración existentes correctas; nueva prueba dashboard.test.mjs para aislamiento, agrupación, ranking, vacíos, legado v1, renombrados, retirados y desconocidos, sin mutar entradas.
- Chromium 156.0.8078.4 visible, perfiles efímeros aislados: suites de navegador Fase 2 (15 grupos), Fase 3 (13), Fase 5 (8) y Fase 6 (9) correctas. Cubren persistencia/migración, concurrencia, abortos, doble toque, permisos de tiro, histórico, recarga, Deshacer y CSV. Prueba adicional de dos partidos/dos pestañas verifica aislamiento de Estadísticas, sincronización, Deshacer remoto, cancelar/eliminar solo el seleccionado, recarga de la vista y navegación en subruta Pages.
- Comparaciones a 1440×900, 1180×820, 1024×768, 768×1024, 390×844 y 320×740, con los mismos 114 tiros ficticios y defensa seleccionada que la demo. Registro real, selección mantenida al alternar, un solo tiro ante doble toque, actualización de Estadísticas, Deshacer y descarga CSV con BOM correctos en cada tamaño. Cero errores de JavaScript en esos recorridos.
- Capturas inspeccionadas de registro, estadísticas y diálogo. Misma altura y anchura útil de paneles superiores; mismo fondo, sombra, blur y radio computados que la propuesta. Estático 3×2, paneles alineados, matriz accesible y cuatro resultados en viewport. Sin scroll horizontal, nombres/cifras recortados ni objetivos menores de 44×44. Paleta calculada exclusivamente neutra/naranja, incluidos gradientes. Reflejos y transparencia mantienen lectura de etiquetas y cifras en las capturas; no se alteran sus materiales aprobados.
- Preparación estática actualizada a 20 archivos y verificada bajo /registro_defensas_baloncesto/, sin publicar. Comparador y aplicación abiertos en Chromium visible; verificadas todas las imágenes del comparador. Servidor local restringido: http://127.0.0.1:4191/ . Comparador: http://127.0.0.1:4191/tests/integracion-cristal/revision.html . Reproducción en tests/integracion-cristal/README.md.
- Informes: tests/integracion-cristal/verificacion-visible.json, integridad-final.json y capturas/. El informe verificacion.json corresponde a la primera pasada sin ventana; el visible es la comprobación final. Copias de seguridad y propuesta aprobada conservadas. Ningún perfil personal ni dato real se usó para probar.

Pendiente exclusivamente de revisión de la integración local. No se inicia otra fase. Safari, dispositivos físicos, tacto y rendimiento de blur en hardware real siguen sin comprobarse; no se afirma auditoría completa de accesibilidad ni mejora de rapidez medida. El almacenamiento depende del origen: el puerto de revisión puede aparecer vacío aunque otro servidor local conserve partidos; no se migran datos entre orígenes.

## 32. Publicación oficial autorizada — 14 de octubre de 2026

El usuario aprueba la integración Premium Glass y autoriza commit, integración segura en main, push normal y verificación pública. Se conserva el diseño y la funcionalidad local, sin añadir características. Copia integral y parche en .local-backups/publicacion-premium-20261014/; rama respaldo/antes-premium-glass-20261014 conserva HEAD previo. Publicación limitada a los 20 archivos runtime, README y .gitignore; se excluyen documentos internos, pruebas, herramientas, dependencias, copias y perfiles. Identidad Git del usuario sin coautoría. Seis suites Node superadas; navegador en curso.

### Cierre de publicación

Commit oficial: 7a3557bcff3ba4e022c92a57740da8495f652380, autor y committer itsasnehezkuntza, sin coautoría. Push normal completado; main y origin/main sincronizados (0/0). Fetch previo confirmó que no había cambios remotos nuevos; no fue necesaria una fusión. Ramas anteriores conservadas; respaldo/premium-glass-aprobado-20261014 apunta a la versión aprobada y respaldo/antes-premium-glass-20261014 al commit anterior.

GitHub Pages confirmado por API: main, raíz /, build built del commit oficial sin errores. URL: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/ . Los 20 archivos runtime públicos responden 200 y coinciden con local (texto normalizado solo en saltos CRLF; fuentes comparadas byte a byte). Licencias OFL originales conservadas, incluidos sus espacios finales, sin alterar contenido.

Pruebas: seis suites Node correctas; suites Chromium fases 2, 3, 5 y 6 correctas; comparación contra propuesta aprobada a 1440×900, 1180×820, 1024×768, 768×1024, 390×844 y 320×740 correcta. Sobre Pages: dos partidos, aislamiento, sincronización entre pestañas, Deshacer remoto, cancelar/eliminar solo seleccionado y recarga de vista correctos. En seis tamaños: 28 destinos, requisito de partido, Roller solo 2P, registro 2P/3P, doble toque único, estadísticas 50%/100% y puntos, recarga, CSV con BOM y dos eventos, controles ≥44 px, blur 22 px y sin desbordamiento. Cero errores JavaScript en esos recorridos. Captura de escritorio publicada inspeccionada y diseño conservado. Informes y capturas locales en .test-artifacts/publicacion-verificada.json y publicada-*.png; runner verificar-publicacion.mjs. Se usaron contextos efímeros sin datos reales.

No se modificaron diseño ni funcionalidades para publicar. README público actualizado para la versión oficial y retirados enlaces a archivos internos no publicados. No se publica documentación interna, dependencias ni herramientas. Pendientes únicamente comprobaciones que requieren otros entornos: Safari/Firefox, dispositivos físicos, tacto/rendimiento real de blur y apertura real del CSV en Excel. Publicación terminada; no se inicia otra fase.

## 33. Fase 7 — Auditoría de puntos y matriz de Bloqueo directo

Solicitud autorizada el 14 de octubre de 2026. Trabajo local; detenerse para revisión final, sin push ni despliegue. La paleta y los materiales Premium cristal aprobados son obligatorios.

### Auditoría previa (antes de editar código)

`summarize` cuenta un intento por evento, un anotado/fallado según resultado y suma el valor 2/3 únicamente al anotar. La persistencia valida valores numéricos 2/3 y resultados. El Dashboard filtra por partido activo y usa ese mismo resumen para global, categorías, acciones y estrategias. Las combinaciones del registro también usan `summarize`. No se encontró un error aritmético: comprobación independiente de 45 agregaciones con los 90 resultados permitidos (45 anotados, 45 fallados, 109 puntos), más las suites previas de registro y Dashboard, correcta.

36 canastas y 77 puntos son compatibles con 31 dobles y 5 triples. Es una comprobación de coherencia, no una inspección de los eventos reales de la captura. No se ha accedido a datos personales. Falta mostrar puntos por acción/combinación y puntos por tiro; el ranking anterior compara éxito defensivo, no eficiencia en puntos.

### Contrato de implementación y comparación

- Una tabla HTML semántica de 20 combinaciones, cuatro totales por tipo, cinco por defensa y total general. Ejes derivados del CSV, con identidades históricas retiradas añadidas y señaladas para no perder eventos. Ninguna escritura ni contador derivado persistido.
- Porcentaje y puntos destacados; puntos/tiro visibles, seis métricas completas al pulsar o activar con teclado. Un panel de detalle; selección solo en memoria, conservada en refrescos del mismo partido y restablecida al cambiar de partido. Sin nueva URL ni almacenamiento.
- Matriz a todo el ancho del Dashboard, ranking complementario de estrategias, Transición/Estático conservados con puntos y cociente. Solo DOM/CSS nativos; unas 30 celdas, actualizadas desde el snapshot confirmado por el flujo existente, sin bucles de animación ni dependencias.
- En tablet horizontal se aprovecha todo el ancho; móvil usa scroll interno con cabecera de fila fija y nombres accesibles completos. Tamaños legibles y objetivos ≥44 px. Sin alterar estilos del registro ni la cabecera.
- Comparar puntos/tiro exactos, menor es mejor, mínimo provisional 5 intentos. Tres conjuntos independientes: combinaciones, tipos y estrategias. Se requieren al menos dos candidatos con tasas diferentes; empates en extremos comparten etiqueta. Sin datos: guion y texto explícito; 1–4 intentos: muestra pequeña, sin distintivo. El total general no compite. Ranking ascendente por puntos/tiro; vacíos al final, empates mantienen orden de configuración.
- Paleta existente: barras grafito/naranja intactas; etiquetas y bordes neutros/cobre para extremos y selección. No introducir verde/rojo ni modificar fondos, fuentes o materiales generales.

### Implementación y cierre

Completada localmente. Producción modificada únicamente en `js/dashboard.js` y `dashboard.css`. El cálculo original de `js/estadisticas.js` no necesita corrección y permanece intacto. Los cocientes y distintivos se derivan en memoria de cada snapshot; no se guardan en eventos ni en IndexedDB. El porcentaje se presenta redondeado al entero y puntos/tiro a dos decimales con coma; las comparaciones utilizan productos cruzados sin redondear.

La matriz presenta 20 combinaciones y 10 totales. El ranking complementario permanece siempre desplegado. El detalle muestra intentos, fallados, anotados, éxito, puntos y puntos/tiro y se actualiza al Deshacer o recibir nuevos datos del mismo partido. En móvil la columna de tipos es fija; al activar una celda se ajusta el scroll interno para verla completa y se muestra su detalle. Se conservan todas las estadísticas de Transición/Estático y el resumen de las tres categorías.

Las filas/columnas históricas se añaden cuando existen eventos con identidades retiradas; una defensa ausente con identidad de categoría/acción se muestra en un eje histórico explícito. Eventos que no permiten identificar categoría continúan en total global y CSV con aviso de volumen, como antes. Nunca se inventa una equivalencia por nombres ni se reescriben eventos.

### Verificación realizada

- Siete suites Node correctas: configuración (26 pruebas), registro (28 destinos/90 resultados), integración, estadísticas, exportación, Dashboard y nueva matriz. La nueva suite comprueba 57 agregaciones por expectativas independientes, las cuatro reglas de resultado, 36 canastas/77 puntos en seis niveles, sumas de celdas/filas/columnas, cocientes ponderados, mínimo 5, empates y tasas que redondean igual, vacíos, aislamiento, legado v1, renombrados, retirados y entradas inmutables.
- Chromium 156.0.8078.4, contextos efímeros: regresiones Fase 2 (15 grupos), Fase 3 (13), Fase 5 (8, incluida descarga) y Fase 6 (9) correctas. Partidos, sincronización entre pestañas, Deshacer remoto, eliminar solo seleccionado, recarga y carga desde paquete bajo `/registro_defensas_baloncesto/` correctos. Paquete local de 20 archivos, sin publicar.
- Cinco tamaños: 1180×820, 1024×768, 390×844, 320×740 y 844×390. Treinta celdas, las veinte combinaciones activadas y seis métricas accesibles, foco de teclado visible, recarga, triple registrado con doble toque que genera un solo evento, Deshacer conservando el detalle seleccionado y CSV con BOM y filas del activo correctos. Cero errores de JavaScript/carga en estos recorridos.
- Cero desbordamiento horizontal de página; matriz completa a lo ancho en ambos iPad. En móvil, scroll interno y celda seleccionada íntegra junto al eje fijo. Objetivos ≥44 px y textos/cifras sin recorte dentro de sus celdas. Barras calculadas #444 y #c17c4b; auditoría de estilos del Dashboard sin colores ajenos a neutros/cobre. Inspeccionadas capturas completas, matriz y detalle en tablet/móvil. Afinada alineación vertical de celdas sin cambiar tamaños de texto.
- Muestra ficticia de capturas: 128 intentos, 68 fallados, 60 anotados y 141 puntos (53% y 1,10 pts/tiro); Bloqueo directo: 88 intentos, 44 fallados, 44 anotados y 103 puntos (50% y 1,17 pts/tiro). Incluye triples/dobles, sin datos, muestras de un intento al 100% sin distintivo, y empates. Es distinta de la comprobación aislada de 36/77.
- SHA-256 idéntico al inicio en diez archivos protegidos: index.html, premium.css, styles.css, app.js, categorias.csv, estadisticas.js, registro.js, persistencia.js, exportacion.js e identidad.js. La pantalla de registro y sus reglas no se modifican. Copia previa en `.local-backups/fase7-matriz-20261014/`. `git diff --check` sin errores.

### Entrega y pendientes

Revisión con capturas: `tests/matriz-fase7/revision.html` (se abre localmente sin servidor ni acceso a IndexedDB; todas sus imágenes verificadas). Reproducción en `tests/matriz-fase7/README.md`; informes `verificacion.json`, `verificacion-visual.json` (última pasada tras el ajuste de visibilidad móvil) e `integridad.json`; 26 capturas en `capturas/`. Pruebas y documentos internos mantienen su exclusión de publicación.

Pendiente revisión visual/funcional del usuario y confirmar o ajustar el umbral provisional de cinco intentos. Las comprobaciones de tablet/móvil son emulación Chromium; Safari/iPad físico, tacto, lector de pantalla completo y Excel real siguen pendientes. No se han usado datos ni perfiles reales, añadido Firebase/Capacitor, cambiado el esquema o instalado dependencias. Sin commit, push, despliegue ni cambios remotos. Fase cerrada para revisión; no se inicia la siguiente.

## 34. Ajuste solicitado — Solo puntos en Registro y Estadísticas

El usuario precisa durante la revisión: «No quiero que me contabilices el número de tiros en ninguna, solo el número de puntos, tanto en registro como en estadística». Esta instrucción sustituye la presentación de recuentos y métricas del apartado 33. Se planteó opcionalmente si conservar porcentajes/cocientes; sin respuesta adicional se aplicó la interpretación literal, comunicada antes de editar: únicamente puntos concedidos.

- Registro: cada acción, defensa, tipo, categoría y total muestra puntos concedidos. Bajo los botones se conserva solo una cifra o un guion; el total se etiqueta «Puntos concedidos». 2✓ aporta 2, 3✓ aporta 3, ambos fallos aportan 0. Sin datos: —; datos con cero puntos concedidos: 0.
- Dashboard: resumen global y por categorías, 20 combinaciones, totales de filas/columnas, detalle seleccionado, estrategias, Transición y Estático muestran únicamente puntos. Se retiran recuentos de intentos/fallados/anotados, porcentajes, puntos/tiro y distintivos. Las etiquetas accesibles tampoco muestran recuentos. El resumen de estrategias se ordena por puntos totales, sin calificarlo como mejor/peor eficacia.
- Barras con los mismos colores: naranja representa puntos concedidos, grafito completa la escala común explícita del grupo. No representan porcentajes de tiros. Superficies, fuentes, fondos, cabecera y pantalla de registro conservan sus estilos; solo cambian los valores presentados. La matriz se compacta al mostrar una única cifra por celda.
- Los eventos se conservan íntegros. Se mantienen cálculos internos de auditoría y detección de ausencia de datos; no se almacenan contadores nuevos. IndexedDB, IDs, CSV, Deshacer y registro en dos pulsaciones conservan el contrato previo. CSV sigue siendo un evento por fila con sus columnas originales, como se había solicitado preservar.

### Verificación y entrega vigentes

Siete suites Node superadas. Regresiones de navegador Fases 2/3/5/6 correctas, con expectativas de presentación actualizadas y controles de número de eventos mantenidos sobre almacenamiento. Conservan comprobaciones de recarga, concurrencia, doble toque, fallos, histórico, partidos, CSV y rutas relativas. Las pruebas internas siguen contando eventos para detectar pérdidas/duplicados; ese dato no se muestra en la aplicación.

Nuevo runner `tests/puntos-fase7/verificar.mjs`: cinco tamaños (1180×820, 1024×768, 390×844, 320×740, 844×390), treinta celdas y detalle de puntos correcto en las veinte combinaciones; ausencia de recuentos/porcentajes/cocientes en ambas vistas; teclado, celda visible, recarga, doble toque, Deshacer, CSV y paleta correctos. Capturas inspeccionadas de registro y Dashboard en tablet/móvil, sin desbordamiento horizontal de página. Cero errores JavaScript/carga. La muestra concede 141 puntos globales y 103 en Bloqueo directo.

Capturas e informe actualizados en `tests/puntos-fase7/`; revisión vigente: `tests/puntos-fase7/revision.html`. La carpeta anterior `tests/matriz-fase7/` conserva la revisión previa con métricas; sus capturas ya no describen la interfaz vigente. Copia anterior al ajuste en `.local-backups/fase7-presentacion-puntos-20261014/`. README actualizado; sin nuevas dependencias.

Trabajo local terminado y detenido para revisión final. Sin commit, push ni despliegue. Pendientes únicamente la revisión del usuario y las comprobaciones físicas de Safari/iPad ya señaladas; no se inicia otra fase.

## 35. Presentación final solicitada — Fallados/aciertos

El usuario concreta «queremos que ponga 4/2 (fallados)/(aciertos)» y reitera «fallados/aciertos». Se aplica ese formato en ambas vistas, interpretado y comunicado antes de editar como resultados de tiros: cuatro fallados y dos aciertos = 4/2. Cada evento cuenta una vez, con independencia de si su valor es 2 o 3. Esta presentación sustituye la versión de solo puntos del apartado 34. No se afirma una confirmación explícita adicional de las unidades más allá del formato reiterado por el usuario.

- `outcomeText` centraliza el formato: fallados/aciertos, sin espacios alrededor de la barra. Sin datos: —; todos fallados/aciertos: 4/0 o 0/2, sin perder los ceros.
- Aplicado a cada acción, defensa, tipo, categoría, total del partido, resumen global, 20 combinaciones, totales de filas/columnas, detalle y resumen de estrategias. Etiquetas «Fallados/aciertos», sin sufijos pts ni porcentajes/cocientes/distintivos.
- Barras originales gris oscuro = fallados y naranja = aciertos; proporciones derivadas de los mismos resultados, sin porcentaje numérico. El resumen conserva orden de configuración Black, White, Blue, Red, Tut; no se ordena por una métrica oculta. No cambian fondos, superficies, fuentes o materiales.
- Eventos, valores 2/3, puntos concedidos internos y CSV intactos. No hay migraciones, reescrituras ni contadores persistidos. El registro sigue en dos pulsaciones y Deshacer afecta solo al último evento del activo.

Verificación completada: siete suites Node superadas, incluida prueba exacta de 4/2 con mezcla de tiros 2/3. Runner vigente `tests/resultados-fase7/verificar.mjs`: fases 2, 3, 5 y 6 correctas, junto con aislamiento/sincronización de partidos y subruta Pages. Cinco tamaños (1180×820, 1024×768, 390×844, 320×740 y 844×390), las veinte combinaciones y sus totales, detalle, teclado, recarga, doble toque, Deshacer, CSV y paleta correctos. Sin errores JavaScript/carga ni desbordamiento horizontal de página. Se ajustó el salto de línea de «Fallados/aciertos» en el detalle móvil para evitar recorte.

Capturas inspeccionadas de Registro y Estadísticas en tablet/móvil. Revisión actual: `tests/resultados-fase7/revision.html`; informe `verificacion.json` y capturas en esa carpeta. Revisiones de `tests/puntos-fase7/` y `tests/matriz-fase7/` son históricas y ya no reflejan la presentación vigente. Copia previa en `.local-backups/fase7-fallados-aciertos-20261014/`.

Trabajo terminado localmente, detenido para revisión final. Sin commit, push ni despliegue. Datos reales no utilizados ni modificados. La comprobación de dispositivos es emulación Chromium; Safari/iPad físico sigue pendiente. No se inicia otra fase.

## 36. Porcentajes visibles y desglose solo al pulsar

El usuario solicita porcentaje en el resumen general y la tabla de Bloqueo directo, con detalle debajo únicamente al pulsar. Se mantiene el formato fallados/aciertos del apartado 35 y se amplía solo la vista de Estadísticas.

- Resumen general: cada categoría y el total muestran también éxito defensivo, calculado como fallados / intentos × 100 y redondeado al entero. Matriz: las veinte combinaciones y diez totales conservan fallados/aciertos y añaden porcentaje; ejemplo 4/2 y 67%. Sin datos se muestra guion y «Sin datos», sin inventar 0%.
- El desglose comienza oculto y sin selección. Pulsar una combinación o total muestra debajo intentos, fallados, aciertos, éxito defensivo, puntos concedidos y puntos por tiro (dos decimales con coma). Foco y hover no lo abren; Enter/Espacio activan los botones nativos. Las etiquetas accesibles incluyen porcentaje y propósito del botón.
- La selección vive únicamente en memoria y se conserva al actualizar datos del mismo partido, incluido Deshacer. Se cierra al recargar o cambiar de partido. No se guardan contadores ni preferencias nuevas. La matriz sigue teniendo scroll interno móvil, encabezado de tipos fijo y foco visible.
- Se mantienen el resumen compacto de estrategias, Transición y Estático. No se reintroducen distintivos. Registro conserva exactamente su presentación fallados/aciertos, sus controles y sus dos pulsaciones. La paleta, barras gris/naranja, materiales, fuentes y cabecera siguen intactos.

### Verificación y entrega

Siete suites Node correctas, incluida auditoría de 57 agregaciones, mezcla de dobles/triples y 36 aciertos/77 puntos. Regresiones de navegador de fases 2/3/5/6 correctas, aislamiento/sincronización de partidos y paquete bajo subruta Pages comprobados. Sin cambios en las fórmulas de agregación.

Runner `tests/detalle-fase7/verificar.mjs`: cinco tamaños (1180×820, 1024×768, 390×844, 320×740, 844×390). Se activan y verifican las treinta celdas con seis métricas, porcentajes exactos según redondeo, datos vacíos, detalle inicialmente oculto incluso con foco/hover, teclado, recarga, cambio de partido, doble toque, Deshacer y CSV. Ejemplo PR Pop/White: seis intentos, cuatro fallados, dos aciertos, 67%, cinco puntos concedidos, 0,83 puntos por tiro. Cero errores de carga/JavaScript, objetivos táctiles de al menos 44 px, sin recorte de cifras/etiquetas ni desbordamiento horizontal de página; matriz completa a lo ancho en ambos iPad. Auditoría de colores conserva neutros/cobre y barras #444/#c17c4b.

Capturas inspeccionadas en tablet/móvil, antes y después de pulsar. Revisión vigente: `tests/detalle-fase7/revision.html`; reproducción en su README, informes `verificacion.json` y `verificacion-visual.json`, treinta capturas. Las revisiones anteriores son históricas. Copia previa e integridad en `.local-backups/fase7-detalle-click-20261014/`: SHA-256 idéntico para app.js, index.html, premium.css, styles.css, persistencia.js, registro.js, exportacion.js y categorias.csv. Producción modificada en este ajuste únicamente en js/dashboard.js y dashboard.css; documentación actualizada.

Completado y publicado. Commit `e27d320` contiene el panel y la matriz aprobados. Los archivos de cuentas/Firebase permanecen fuera del commit y pendientes de decisión. No se usaron nuevas dependencias ni datos reales. Safari/iPad físico queda pendiente; las capturas son emulación Chromium. No se inicia la siguiente fase.

## 37. Actualización de categorías publicada

El usuario autoriza actualizar las categorías en la página web a partir del CSV local. Se valida y corrige su configuración antes de publicar:

- Estático renombra «Bajo aro» a «Of. Screen» conservando `estatico_bajo_aro`.
- «Spain» se añade como acción estática con ID nuevo `estatico_spain` para evitar reutilizar el ID histórico `spain`, que permanece en Bloqueo directo.
- Los cuatro tipos de bloqueo mantienen las defensas Black, White, Blue, Red y Tut, y añaden Next, Dance y Quick+Under. PR Roller conserva únicamente tiros de 2; los otros tipos permiten 2 y 3.
- Total actualizado: 41 combinaciones (2 Transición, 7 Estático y 32 Bloqueo directo). No se cambia IndexedDB ni se reescriben eventos históricos.

Se corrigen pruebas locales ignoradas por Git para expectativas de la configuración nueva; no se publican. Siete suites Node superadas, con 26 pruebas de CSV/configuración, registro de 136 resultados y 165 puntos, estadísticas, exportación, integración, Dashboard y 76 agregaciones de matriz. Regresiones Chromium Fase 2 y Fase 3 superadas; sin datos reales. Cambio de producción limitado a `categorias.csv`; README actualizado. Commit `ed38617` publicado en `main`; GitHub Pages ejecutó correctamente build y deploy. Se recargó la página publicada con caché nueva y se verificaron las ocho defensas en matriz y las acciones actualizadas Of. Screen y Spain en Estático.

## 38. Publicar configuración CSV vigente sin editar el archivo

El usuario solicita actualizar la página usando las categorías actuales «sin cambiar el csv». Se conserva byte por byte el archivo `categorias.csv` que ya estaba en el árbol de trabajo al iniciar esta solicitud: 33 filas de datos, con 2 combinaciones de Transición, 7 de Estático y 24 de Bloqueo directo (tres tipos, ocho defensas). No se modifica ni regenera el CSV. Su configuración se valida con `parseConfiguration` y se visualiza en Chromium local: aparecen Of. Screen y Spain en Estático, y Next, Dance y Quick+Under en los tres tipos de bloqueo configurados. Publicación autorizada por la solicitud. El commit `b95653e` contiene exclusivamente el estado vigente de `categorias.csv`, sin editar el archivo durante esta tarea; `main` recibió el commit y GitHub Pages completó build y deploy correctamente. Se verificó el CSV remoto y la matriz publicada. Para cargarla en el navegador, recargar la página (Ctrl+F5 si mantiene caché). No se publica esta especificación ni se incluyen los demás archivos locales pendientes.

## 39. Rama remota de desarrollo

El usuario autoriza crear una rama para trabajar desde otro dispositivo con el estado local completo, incluidos materiales aún en desarrollo. Rama `develop`, creada desde `main` (`b95653e`), sin cambiar `main` ni su publicación de GitHub Pages. Se incluyen especificación/instrucciones, código experimental de cuentas/Firebase, dependencias/herramientas y pruebas locales. Se excluyen capturas PNG, node_modules, logs, `.test-artifacts` y copias locales `.local-backups`. Se actualizan expectativas de pruebas a las 33 combinaciones del CSV local vigente.

Verificación: siete suites Node correctas; regresiones Chromium de fases 2, 3 y 5 correctas; runner integral de Fase 7 superado en cinco tamaños (matriz 36 celdas, 24 combinaciones y 12 totales). El servidor de pruebas sirve cuenta.css en raíz. Commit `2038356` subido a `origin/develop`; la rama está disponible para clonar desde otro dispositivo. `main` conserva el commit `b95653e` y GitHub Pages sigue apuntando a `main`; no se inició despliegue desde `develop`. PNG, node_modules, logs y archivos temporales quedan excluidos.

## 40. Fase 8A — Autenticación Google y arquitectura de sincronización

Completada localmente el 15 de octubre de 2026 y detenida para revisión. Esta solicitud autoriza cuentas/Firebase como ampliación del alcance anterior; no autoriza sincronizar partidos existentes, implementar 8B ni publicar. La continuación parte de `develop`/`7c439c1`, que ya incorporaba los módulos experimentales de cuenta de la primera parte de esta tarea. Se respetan los cambios del CSV realizados por el usuario durante la pausa: 33 combinaciones vigentes. No se hace checkout de versiones anteriores.

### Auditoría y decisiones

- Auditados los archivos reales de persistencia, identidad, partidos, registro, estadísticas, interfaz y CSV. La base sigue siendo `registro_defensivo_baloncesto`, versión 1. IDs nuevos criptográficos; `seq` y los IDs antiguos no se consideran globales sin procedencia verificable. Se conservan guardas transaccionales, reintentos idempotentes, doble toque, selección compartida por pestañas y snapshots de CSV.
- Deshacer y eliminar borran físicamente en la implementación local actual. La futura sincronización necesitará outbox, vínculos y lápidas en la misma transacción que la mutación deportiva. No se añade ahora una subida desde listeners ni una cola solo en memoria.
- Autenticación opcional con SDK oficial modular Firebase **12.11.0**, fijado, imports dinámicos y arranque independiente de `app.js`. Controlador sin DOM/datos deportivos y adaptador web sustituible para Capacitor. Persistencia propia del origen con alternativas de sesión/memoria, restauración, cambios de cuenta, estados de carga, timeout de 12 s, reintento y errores. Con configuración desactivada no se solicita el SDK.
- Google usa `signInWithPopup` directamente desde click con el SDK preparado. No se implementa redirect ni fallback automático: Pages no resuelve por sí solo el iframe/almacenamiento de terceros bloqueado por Safari. Documentadas ventanas bloqueadas, alternativas oficiales y pruebas físicas pendientes.
- Cabecera añade controles de cuenta y «Solo local», conservando «Guardado localmente» bajo control de IndexedDB. Iniciar sesión no atribuye ni sube partidos; cambiar cuenta no modifica el conjunto local del navegador. Los otros cuatro estados de nube están definidos con condiciones de confirmación real para 8B.
- Firestore diseñado por usuarios/equipos/miembros/partidos/eventos y lápidas. Propietario inicial creado atómicamente con su equipo; entrenadores futuros caben en la ruta, pero no hay invitaciones ni cambios de rol desde el cliente. Las reglas preparadas admiten lápida de partido antes de su alta y lápida de evento antes del evento; impiden resurrecciones y escrituras contradictorias.
- Asistente inicial diseñado con selección/revisión de cuenta, equipo y partidos, sin selección automática, sin borrar copias locales. Manifiesto duradero e IDs deterministas por origen para históricos; reintentos sobre rutas fijas, conflicto si cambia el contenido. Se distingue la base del iPad de la del ordenador. Cachés remotas futuras separadas por cuenta/equipo, para no colisionar con `byUuid` ni filtrar datos entre cuentas.

Diseño completo, esquema, transacciones futuras, política propuesta de orden, aislamiento de sesión, asistente, configuración y reproducción: [FASE8A_FIREBASE.md](FASE8A_FIREBASE.md). Las referencias oficiales de Firebase consultadas están enlazadas en esa guía. La arquitectura descrita no implica que el motor de sincronización esté implementado.

### Archivos de la fase

- Cuenta: `js/firebase-config.js`, `js/firebase-auth.js`, `js/cuenta.js`, `js/cuenta-ui.js`, `cuenta.css`; integración aislada en `index.html`. La configuración pública entregada está vacía, `enabled: false`, sin credenciales privadas.
- Seguridad/desarrollo: `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `package.json` y lockfile; reglas y SDK/CLI de pruebas fijados. `.gitignore` excluye logs/cachés. Dependencias de desarrollo: Firebase 12.11.0, rules-unit-testing 5.0.0 y firebase-tools 15.11.0, además de Playwright existente.
- Pruebas: `tools/firebase/{cuenta.test,rules.test,emuladores,auth-browser,browser-support,local-browser,servidor}.mjs`. Servidor Playwright y `tests/preparar-pages.ps1` actualizados: paquete relativo de 25 archivos runtime, sin reglas, dependencias ni pruebas. No se publica.
- Documentación: README, esta especificación y nueva guía `FASE8A_FIREBASE.md`.

### Verificación ejecutada

1. **Firestore Emulator Suite: 54 comprobaciones correctas**, proyecto ficticio `demo-defensas`, loopback. Propietario, externo, invitado, sin sesión y autenticación anónima; creación atómica, consulta de equipos acotada, aislamiento entre equipos, autoinclusión/escalada, autor/campos/tiros inválidos, histórico sin IDs modernos, inmutabilidad y borrados. Altas tardías de evento y partido rechazadas; batches de alta + borrado contradictorios rechazados. Reglas sin desplegar.
2. **Auth Emulator + SDK web oficial en Chromium**: login, restauración tras recarga, cierre, cambio A→B y observación entre dos pestañas. Snapshots deportivos idénticos antes/después del acceso y del cambio de cuenta. Popup bloqueado mediante `window.open = () => null`: error del SDK visible y Deshacer local operativo. Ninguna petición a Firestore ni a servicios reales de identidad. Se usa OAuth ficticio del emulador, no una cuenta real.
3. **Siete suites deportivas Node correctas** y controlador de cuenta correcto. Configuración: 26 pruebas, 33 combinaciones; registro: 104 resultados válidos; matriz: 67 agregaciones, cuatro resultados y muestra de 36 aciertos/77 puntos. Cuenta: ausencia de configuración, activación síncrona del popup, doble toque, cambios de identidad, error de cierre y timeout/carga tardía.
4. **Regresiones Chromium Fases 2/3/5/6 correctas**: 15/13/8/9 grupos; recargas, almacenamiento real, errores/rollback, reintento idempotente, aislamiento, histórico, doble toque, concurrencia, Deshacer y CSV con descarga nativa. La Fase 3 recorre 33 combinaciones/104 resultados y comprueba 125 puntos.
5. **Responsive Chromium**: 1440×900, 1180×820, 1024×768, 768×1024, 390×844, 320×740 y 844×390. Sin desbordamiento horizontal, controles de cuenta/resultados ≥44 px sin recorte; 36 celdas de matriz, navegación, registro/doble toque, recarga, Deshacer y CSV con BOM correctos. Cuenta conectada con correo largo comprobada además en cuatro tamaños de tablet/móvil. Capturas de tablet/móvil inspeccionadas; la nueva cuenta conserva los materiales existentes y permite scroll vertical.
6. **Fallos de Firebase**: configuración inválida, SDK inaccesible y SDK detenido no impiden crear/registrar localmente; el timeout se produce después de un guardado local confirmado. Se conserva la distinción de estados. Configuración desactivada sin solicitudes externas. Paquete probado bajo `/registro_defensas_baloncesto/`, sin errores de carga ni JavaScript en los recorridos locales normales.

Informes/capturas en `.test-artifacts/firebase/`: `reglas.txt`, `auth.json`, `local.json` y PNG de siete tamaños locales/cuatro con cuenta. Pruebas con contextos efímeros y datos ficticios, sin perfiles ni bases reales. Node v24.21.0; JRE 21 portátil aislado para el emulador de Firestore. `git diff --check` correcto.

### Límites y pendientes para 8B

La aplicación real continúa en IndexedDB sin cambios de esquema ni de datos históricos. No se activan listeners/escrituras de partidos en Firestore ni se ejecuta el asistente. Reglas y emuladores son locales. El proyecto público de Firebase no se ha configurado desde esta tarea: completar configuración/proveedor/dominios para probar Google real. Quedan pendientes Safari/iPad físico, privacidad/ITP, ventanas emergentes y OAuth real; Chromium con emulador no los sustituye.

8B requerirá revisión del asistente/política de orden, migración aditiva probada, cola atómica, aislamiento de cachés/selección por ámbito, arrendamientos entre pestañas, confirmación de servidor, redes interrumpidas y conflictos entre dispositivos. Roles adicionales e invitaciones siguen fuera de alcance. No se hace commit, push ni despliegue en esta continuación; se detiene para revisión de 8A.

## 41. Fase 8A.1 — Conexión y validación del proyecto real

Fase 8A aprobada provisionalmente. Nueva solicitud autoriza conectar/probar Google real, revisar proveedor/dominios y explicar el despliegue seguro de reglas; no autoriza activar sincronización, migrar IndexedDB ni publicar la aplicación. Estado: **conexión implementada y validación real parcial; detenida para revisión**, con las comprobaciones autenticadas pendientes explícitas.

Se releen AGENTS, esta especificación, `FASE8A_FIREBASE.md`, configuración/adaptador de cuenta, reglas, herramientas de pruebas y estado local. Se conservan los cambios de interfaz/documentación ya presentes y los que el usuario realiza durante el trabajo. Después de solicitar los valores que faltaban, el usuario facilita la configuración pública de su proyecto `registro-defensivo` y autoriza incorporarla. No se dispone de una sesión de usuario en consola/Google; las pruebas automatizadas usan perfiles efímeros, sin credenciales.

### Preparación y validación ejecutada

- Añadida guía `FASE8A1_VALIDACION_REAL.md`: ruta de consola para obtener configuración, proveedor Google, hosts de localhost/Pages, diferencias entre prueba emulada/real, comandos limitados de despliegue de reglas y protocolo Safari/iPad. Las reglas remotas actuales no se conocen; la guía exige compararlas y conservar copia antes de un despliegue autorizado.
- Añadida página aislada `tools/firebase/validacion-real.html` y su módulo JS. Reutiliza cuenta/SDK oficiales, no carga `app.js` ni persistencia deportiva ni Firestore. Bloquea emuladores/configuración incompleta. Permite consultar dominios al servicio público real y verificar la sesión Google mediante renovación forzada, comprobando proveedor y audiencia/emisor del proyecto, sin mostrar tokens. Incluye recarga y observación de cierre de sesión.
- Añadido `tools/firebase/servir-real.mjs` y comando `npm run firebase:validar-real`. El servidor existente admite exclusivamente esos dos archivos de validación adicionales en raíz y mantiene loopback; no añade archivos al paquete de Pages ni despliega nada.
- **54 casos correctos en Firestore Emulator**, repetidos en esta fase, proyecto `demo-defensas`. Informe `.test-artifacts/firebase/reglas-8a1.txt`. No son pruebas de las reglas desplegadas del proyecto real.
- Controlador de cuenta correcto en su prueba simulada. Nueva prueba `tools/firebase/real-page.test.mjs` superada en Chromium: configuración ausente y emulador bloqueados, cero errores JS, ningún SDK/Firestore ni base IndexedDB abierta. Son comprobaciones de guardas; no se presentan como login Google real.

### Conexión realizada con los valores del usuario

- `js/firebase-config.js` conserva exportación `firebaseSettings` y `Object.freeze`. Se incorporan apiKey web pública, authDomain `registro-defensivo.firebaseapp.com`, projectId `registro-defensivo`, storageBucket, messagingSenderId `760744900094` y appId `1:760744900094:web:56f037728d252c22fcfcaf`. `enabled: true`, `authEmulator: false`; no Analytics ni credenciales privadas.
- **Consulta pública real HTTP 200** con API key/appId: número de proyecto `760744900094`, dominios `localhost`, `registro-defensivo.firebaseapp.com` y `registro-defensivo.web.app`. No figuran `127.0.0.1` ni `itsasnehezkuntza.github.io`; las pruebas se realizan desde **localhost**. No se han cambiado dominios desde esta tarea.
- **Prueba real Chromium sin interceptar SDK**: App/Auth oficiales cargan, consulta de dominios funciona en navegador y popup llega a `accounts.google.com`. Se cancela antes de introducir credenciales: aviso y reintento correctos. Cero errores JS, cero peticiones a Firestore y ninguna apertura de la base deportiva en la página aislada. Esto prueba el inicio del flujo OAuth, no un acceso completo ni restauración/cierre autenticados.
- **Aplicación actual con configuración real**: guardado sin cuenta, doble toque, recarga, Deshacer y descarga CSV correctos en tres escenarios: SDK real disponible, SDK bloqueado y SDK detenido hasta timeout. Registro adicional sin Internet confirmado en IndexedDB. Contextos nuevos y partidos ficticios; no se usa el perfil ni los datos deportivos del usuario. Cero peticiones a Firestore.
- Herramientas reproducibles: `tools/firebase/comprobar-proyecto.mjs`, `real-smoke.mjs`, `real-local.test.mjs`; comandos `firebase:comprobar-proyecto`, `test:auth-real-inicio` y `test:auth-real-local`. Informes `.test-artifacts/firebase/{proyecto-real,real-smoke,real-local}.json`. Página manual en `http://localhost:4199/tools/firebase/validacion-real.html` al ejecutar `npm run firebase:validar-real`.
- README y guía actualizados. No se modifica el adaptador de cuenta ni la lógica deportiva; hashes de persistencia, registro, identidad, estadísticas, Dashboard, CSV, configuración deportiva y archivos de aplicación conservados frente al inicio de esta conexión.

### Pendientes explícitos

El usuario confirma después de las pruebas: «He podido entrar, recargar y cerrar sesión». Se registra como resultado correcto de la prueba manual real de esos tres pasos, sin atribuir observación automática ni inspección de credenciales/tokens. No especifica dispositivo/navegador ni confirma expresamente renovación forzada o recarga después del cierre; esos detalles no se inventan. La página aislada permite completar las comprobaciones adicionales sin abrir partidos. La consola administrativa y las reglas desplegadas no se han inspeccionado.

Safari/iPad requiere una URL accesible y adecuada para OAuth, preferiblemente HTTPS, con host autorizado. `localhost` en iPad no accede al servidor loopback del ordenador. No se publica ni crea un túnel automáticamente; el protocolo preparado queda pendiente de dispositivo/origen de prueba.

Las pruebas de Auth Emulator se mantienen separadas de la confirmación manual real. `firestore.rules` continúa sin desplegar en esta fase; el usuario ha pedido explicar su despliegue seguro. No hay cambios deportivos, migración ni subida automática por esta tarea. No se hace commit, push ni despliegue. Se detiene para revisar los resultados, sin iniciar 8B; Firestore Sync sigue desactivado.

## 42. Fase 8B — Sincronización segura entre dispositivos

Autorizada tras completar 8A.1. El propietario confirma expresamente Google real, persistencia/cierre, dominio Pages autorizado, Firestore creado y reglas preparadas publicadas. Se registra como evidencia del propietario, sin atribuir inspección administrativa propia de esas reglas. La publicación de reglas no se considera validación suficiente: se contrasta el archivo con Emulator Suite y los envíos del adaptador; el comportamiento del proyecto real se reserva a una prueba ficticia delimitada con permiso explícito.

### Implementación

- Nuevos `js/sync-config.js`, `sync-storage.js`, `firestore-sync.js`, `sync-engine.js` y `sync-ui.js`. La configuración entregada es `enabled: false`, `emulator: false`, `allowRealWrites: false`. Con la bandera inactiva no se importa la interfaz/transporte Firestore ni se actualiza una base v1. Cambiar solo enabled no habilita Firebase real.
- IndexedDB v2 **solo al activar la bandera**: almacenes aditivos `cloudGames`, `cloudEvents`, `cloudTombs`, `syncQueue`, `syncMeta` y `syncBindings`; sin reescribir games/events/settings ni cambiar byUuid. Lectura sin versión explícita cuando está desactivada permite conservar una v2 ya existente sin rebajarla. Se mantienen errores/versionchange/bloqueo sin reiniciar la base.
- Evento y outbox se confirman en la misma transacción local. Deshacer y borrar guardan sus lápidas/operaciones atómicamente. Nunca hay un await de Internet dentro de una transacción IndexedDB. «Guardado» sigue dependiendo de su commit y un fallo remoto no bloquea las dos pulsaciones.
- Datos y pendientes separados por **proyecto, UID y equipo**; no se mezcla el índice único de eventos antiguos con documentos descargados. Cuenta/equipo/proyecto se capturan en la operación. Selección y tareas de interfaz se invalidan al cambiar de ámbito; las respuestas antiguas no se materializan en una cuenta nueva.
- Trabajador con arrendamiento transaccional por ámbito (30 s renovables), retroceso exponencial con variación, operación/ID fijos y transacciones remotas idempotentes. Reconoce el envío después de perder una respuesta, sin duplicados; conflictos de contenido/permisos quedan pendientes para revisión, sin sobrescribir datos.
- Recuperación por consulta explícita del servidor cada cinco segundos, merge por ID y aplicación de lápidas antes de eventos. No se guardan estadísticas. «Sincronizado» exige cola vacía y reconciliación real del servidor completada, sin nueva mutación local durante el ciclo; nunca basta la conectividad ni una cuenta visible.
- Borrado prevalece frente a altas tardías. Partido puede llegar ya como lápida antes de su primera subida; evento tiene lápida independiente aun sin alta. No se eliminan/expiran lápidas ni se reactiva un documento borrado.
- Deshacer usa el último evento vivo materializado por orden técnico local persistente y captura su ID. Los nuevos eventos remotos se incorporan en orden de aceptación del servidor/ID y no se reordenan después. No se usa el reloj del dispositivo como criterio global. Esta decisión concreta sustituye la propuesta provisional de orden de 8A; payload e IDs/seq originales continúan en CSV.
- Menú de cuenta: selección de Solo local/equipo, creación explícita como propietario en batch equipo+miembro, reintento y asistente. Asistente muestra cuenta, equipo, proyecto y partidos/volumen; sin casillas seleccionadas, con cancelación y confirmación explícita. Comprueba formato/cambios antes de crear vínculo+cola. Identidad de origen y hashes canónicos hacen repetible la importación.
- Los originales importados se conservan íntegros y se retiran del selector local editable mediante metadatos laterales; se continúa desde su equipo para no registrar en una copia sin cola. Otra cuenta no ve/exporta esas copias. Partidos antiguos aún sin propietario siguen como datos locales del navegador hasta una confirmación explícita. No se ha usado ninguna base real del usuario para ejecutar esto.

### Archivos y límites de alcance

Producción: cinco módulos nuevos, `js/persistencia.js` (actualización conservadora y despacho por ámbito), `app.js` (guardas/invalidación de tareas), `js/cuenta-ui.js` (coordinador condicionado y mensaje coherente) y `cuenta.css` (controles del menú/diálogo con estilos existentes, scroll y tamaños táctiles). No se rediseña la aplicación ni se cambian index.html, categorías, registro.js, identidad.js, estadísticas.js, Dashboard, exportación.js, styles.css o dashboard.css en esta fase. Se mantienen las modificaciones del usuario previas a esta tarea.

Desarrollo: `tests/sync-fixture.html/.mjs`, `tools/firebase/sync.test.mjs`, `sync-ui.test.mjs`, `default-off.test.mjs`; runner de emuladores/SDK de prueba ampliados; script `npm run test:sync`. Preparador Pages actualizado a 30 archivos runtime relativos, sin publicar. La prueba de integración antigua se adapta al marcado numérico que ya traía la interfaz actual; no se cambia producción para satisfacer una expectativa de presentación anterior.

Documentación: nueva guía `FASE8B_SINCRONIZACION.md`, README, estado de 8A/8A.1 y esta especificación. Guía completa con esquema, política de conflictos, límites, pruebas y plan de validación real.

### Verificación

- **20 grupos correctos en Auth + Firestore Emulator**, proyecto `demo-defensas`: A→B, simultaneidad, offline/cola tras recarga, Deshacer, eliminación frente a dispositivo atrasado, reenvío tras perder acuse, aborto de outbox que revierte el evento, importación repetida/histórico/CSV, aislamiento de cuenta/equipo/proyecto, arrendamiento entre pestañas, actualización v1→v2 con selección/seq intactos y cola vacía, reintento/backoff, conflicto de payload, ausencia de Sincronizado anticipado, descarte de recepción tardía tras cambio de cuenta e interfaz completa del asistente/registro offline. Cero escrituras reales; SDK oficial modular 12.11.0, perfiles efímeros.
- **54 casos de reglas** contrastados en Firestore Emulator, sobre el mismo `firestore.rules` sin cambios de reglas en 8B. Propietario, invitado, externo, anónimo, escalada, campos inválidos, borrados y batches contradictorios.
- **Siete suites Node deportivas correctas**: configuración (26 casos, 33 combinaciones), registro (104 resultados), integración, estadísticas, CSV, Dashboard y matriz (67 agregaciones). Sin cambios de fórmulas ni configuración deportiva.
- **Bandera OFF y paquete Pages**: raíz/subruta, registro en dos pulsaciones, doble toque y recarga; base nueva en versión 1, sin controles de sincronización, sin cargar Firestore y sin errores de rutas. Paquete local de 30 archivos preparado sin publicar.
- **Modo local con Authentication real**: SDK disponible, bloqueado y detenido; registro/recarga/Deshacer/CSV y evento sin Internet confirmados con datos ficticios, sin Firestore. No son pruebas de sincronización real.
- **Responsive y revisión**: asistente a 1024/390/320 px, sin desbordamiento horizontal. Capturas de 1024 y 320 inspeccionadas; cuenta/equipo/proyecto visibles, casillas inicialmente vacías, botones y scroll disponibles. Se reutilizan estilos de la aplicación actual y se conserva el flujo de registro. Safari físico pendiente.

Informes `.test-artifacts/firebase/sync.json`, `sync.txt`, `reglas-8b.txt`, `real-local.json`; capturas `sync-review-*.png` y `sync-ui-*.png`. Copia previa y hashes en `.local-backups/fase8b-inicio/`. Los archivos deportivos protegidos conservan sus hashes. `git diff --check` correcto.

### Revisión y autorización pendiente

No se ha leído administrativamente el ruleset desplegado ni escrito en Firebase real. Queda preparado el procedimiento de dos dispositivos en la guía. Requiere permiso explícito para crear en `registro-defensivo` un **equipo nuevo PRUEBA 8B**, su propietario y únicamente partidos/eventos ficticios y sus lápidas; no importar datos reales. Usar perfiles/orígenes vacíos y registrar IDs de prueba. Si se necesita un origen HTTPS accesible desde iPad, su publicación/exposición requiere autorización separada.

Pendientes: validación real de las reglas desplegadas y los dos dispositivos/Safari, consumo/latencia de la consulta completa en equipos grandes, tratamiento manual de conflictos bloqueados y política futura de retención/compactación. Solo propietario; invitaciones y roles adicionales no se implementan. Cerrar el navegador no garantiza envío en segundo plano: la cola se conserva para reabrir.

Implementación local terminada; detenerse para revisión. No activar banderas reales, migrar datos reales, hacer commit, push ni desplegar sin autorización.

## 43. Fase 9 — Diseño V4 en Registro y Estadísticas

Tarea autorizada el 15 de octubre de 2026: implementar solo la interfaz del lienzo V4 (`EJEMPLO.html`, pantallas «V4 · Registro» y «V4 · Estadísticas»; V1–V3, inicio de sesión, perfil y modo edición son historial o quedan fuera). Se parte del estado local: CSV vigente de 33 combinaciones (2 Transición, 7 Estático, 3 tipos × 8 defensas), formato fallados/aciertos y desglose por celda. Copia previa: `.local-backups/fase9-diseno-v4-20261015-182002/` (archivo del proyecto, parche, estado Git, HEAD y hashes).

Durante esta fase otra sesión trabajó en paralelo en el mismo árbol (Fases 8A.1/8B: `persistencia.js`, módulos `sync-*`, cuenta, Firebase y herramientas). Sus cambios se conservan y no forman parte de esta fase; esa sesión ya adaptó su interfaz de sincronización al menú «⋯».

### Sistema visual y decisiones

- Tokens en `styles.css`: fondo #E7E7E4, botones #F5F5F3, blanco, tinta #161616 (texto y fallados), gris #5E5E5A, coral #DA5A35 (aciertos, selección, «+ Nuevo»), coral texto #BF4320 y coral de tarjeta #C4461F, más neutros derivados del lienzo. Sin cristal, blur ni degradados. `premium.css` se retira (queda en Git y en la copia); paquete Pages de 29 archivos.
- Barlow Condensed en mayúsculas para nombres, títulos y cifras grandes; Manrope para controles y etiquetas. Solo existe el fichero Bold de Barlow: se declara para 500–800 y los pesos 600 del lienzo se ven en 700. Sin cursivas.
- Esquinas 20 px en botones, 26–34 px en tarjetas, cápsulas en controles; círculos solo en anillos y en el número de los resultados. Logo de balón de un trazo coral + «REGISTRO DEFENSIVO» gris.
- Cabecera de una fila (≥1000 px): logo, selector en cápsula blanca con «PARTIDO», «+ Nuevo», estado, Deshacer, selector Registro/Estadísticas con iconos (activo en negro, `aria-current="page"`; área táctil de 44 px) y «⋯». En tablet vertical pasa a dos filas y en móvil a tres.
- Menú «⋯»: Exportar CSV, Eliminar partido y los controles de cuenta ya existentes de 8A (no se añade perfil ni avatar). Cierra con Escape, pulsación fuera o al elegir exportar/eliminar.
- El estado muestra «Guardado»; «localmente» se mantiene solo para lectores de pantalla (el texto accesible sigue siendo «Guardado localmente»).
- Avisos de operación: errores y confirmaciones aparecen como cápsula sobre la barra (las confirmaciones se desvanecen); los mensajes de guía quedan solo para lectores de pantalla.

### Registro

- Transición (columna de 2 filas) y Estático (2 filas con `ceil(n/2)` columnas; con el CSV vigente 4+3) arriba, con títulos pequeños, icono de trazo coral y total a la derecha; raya fina y matriz de Bloqueo directo con defensas como columnas. El lienzo muestra 3×2 y 28 opciones; se adapta al CSV real sin modificarlo.
- Botones: nombre a la izquierda y fallados/aciertos a la derecha (aciertos en coral); en la matriz solo la cifra, el nombre queda accesible. Selección: celda coral con marca blanca, columna y fila con píldora negra.
- Barra inferior blanca fija: categoría y selección, total del partido y cuatro cápsulas (2✕ 3✕ negras | 2✓ 3✓ coral) con círculo para el número; los no permitidos al 30 %. Se conserva `#gameTotal` con «Fallados/aciertos · x/y» precedido de «Partido» (contrato de las pruebas existentes).
- En iPad horizontal y escritorio la vista ocupa exactamente el alto visible y la matriz reparte el espacio (filas 48–112 px); también en tablet vertical alta. En móvil, scroll vertical y matriz con scroll interno y eje de tipos fijo.

### Estadísticas

- Tarjeta coral con media pista en line art, total grande (`#statsResults`) y barras verticales de fallados/intentos por defensa; al lado Transición, Estático y Bloqueo directo con anillo (negro fallados, coral aciertos) y % de éxito (se mantiene la petición del apartado 36).
- Matriz con totales, píldoras «Mejor»/«A mejorar» por defensa y marcas en sus totales. Celdas: cifra y barra. Siguiendo el lienzo, el porcentaje sale del cuerpo de la celda y pasa al desglose y a la etiqueta accesible (decisión a confirmar).
- Desglose bajo la fila de la celda o total pulsado (tabla semántica con fila insertada), pestaña posicionada sobre la celda, anillo con % de éxito, intentos, fallados, aciertos, puntos concedidos, puntos por tiro y Cerrar (también Escape; el foco vuelve a la celda). Pulsar de nuevo la misma celda lo cierra. Solo vive en memoria. En tablet vertical y móvil la matriz tiene scroll interno, eje fijo y el desglose se ajusta al ancho visible.
- Transición: dos anillos grandes en orden de configuración. Estático: barras de mejor a peor por fallados/intentos exacto (producto cruzado), empates en orden de configuración, sin datos al final, etiquetas MEJOR y PEOR.
- Mejor/peor: `MIN_COMPARISON_ATTEMPTS = 5` en `js/dashboard.js` (provisional, documentado); hacen falta dos candidatos con tasas distintas y los empates en un extremo comparten etiqueta. Por debajo no se marca. Nuevas funciones puras `rankBySuccess` y `successBadges`; `buildDashboardModel` y `comparePerformance` no cambian.

### Archivos

Producción: `index.html`, `styles.css`, `dashboard.css`, `app.js` (solo marcado y textos de presentación), `js/dashboard.js` (capa de presentación), `js/vistas.js` (selector segmentado), `js/interfaz.js` (menú) y `js/estadisticas.js` (`outcomeMarkup`, mismo texto que `outcomeText`). Retirado `premium.css`. Intactos por hash: `categorias.csv`, `registro.js`, `exportacion.js`, `identidad.js`, `configuracion.js`.

Pruebas: nueva `tests/diseno-v4.test.mjs`; runner `tests/diseno-v4/verificar.mjs` con servidor propio (4192), muestra ficticia `muestra.mjs`, `rapido.mjs` para capturas, `revision.html`, `referencia/` y `capturas/`. Ajustes de contrato: `tests/config-page.html` regenerado desde el nuevo `index.html`; `fase5-browser.mjs` comprueba `styles.css` en vez de `premium.css`; `preparar-pages.ps1` sin `premium.css`; `tools/firebase/local-browser.mjs` abre el menú «⋯» y usa los botones de vista concretos.

### Verificación

- Ocho suites Node correctas (configuración 26 pruebas, registro 104 resultados, integración, estadísticas, exportación, Dashboard, matriz 67 agregaciones y diseño V4) y controlador de cuenta.
- Chromium 1248 (Playwright), contextos efímeros, datos ficticios y peticiones externas bloqueadas: regresiones Fase 2, 3, 5 (con descarga) y 6 correctas; partidos aislados, dos pestañas, Deshacer remoto, eliminar desde el menú solo el seleccionado, recarga de la vista y paquete bajo `/registro_defensas_baloncesto/`.
- 1180×740, 1133×670, 1366×1024, 820×1180 y 390×844 con 68 tiros ficticios: 33 opciones y 4 resultados visibles sin desplazar ni tapados por la barra en iPad (en móvil, accesibles con scroll vertical sin quedar bajo la barra), sin scroll horizontal de página, sin textos recortados, objetivos ≥44 px. Selección coral y píldoras, Roller solo 2, doble toque = un evento, Deshacer, CSV con BOM desde el menú, Escape y foco. Estadísticas: 36 celdas, desglose inicialmente cerrado, bajo su fila con pestaña sobre la celda y dentro de la zona visible (celda, total de fila y total de columna), valores exactos (PR Pop · Red: 3, 1, 2, 5 puntos, 1,67, 33 %), Mejor White 5/0 y A mejorar Blue 2/4, orden de Estático, Escape y recarga. Cero errores JavaScript o de carga.
- Capturas comparadas con el lienzo en `tests/diseno-v4/revision.html`; informe `verificacion.json`.
- `tools/firebase/local-browser.mjs`: la parte de interfaz pasa con el menú; termina fallando porque la configuración real activada en paralelo (`enabled: true`, 8A.1) solicita el SDK a gstatic y la prueba exige cero peticiones externas. Ajeno a esta fase; no se modifica la configuración de Firebase.

### Pendientes de revisión

Aceptación visual del usuario; Safari/iPad y iPad mini físicos (la medición es emulación Chromium con el viewport indicado); confirmar el umbral de 5 intentos; confirmar que el porcentaje deja el cuerpo de las celdas de la matriz; si «Guardado» sin «localmente» basta ahora que existe sincronización opcional. Fase cerrada; no se inicia la siguiente. Sin commit, push ni despliegue.

## 44. Fase 8B.1 — Validación real controlada

**Cierre para revisión, 17 de octubre de 2026:** resultados actuales en [FASE8B1_RESULTADOS.md](FASE8B1_RESULTADOS.md). Creación/recuperación entre perfiles, registro cercano A/B, cola tras recarga sin Firestore, reconexión sin duplicados, Deshacer pendiente y eliminación frente a envío atrasado correctos en los casos observados. Cierre/cambio de cuenta y retorno de B a propietaria contrastados: mismo partido de aislamiento/un tiro, Sincronizado y colas vacías; el partido eliminado no reaparece. SDK real: propietaria `allowed`, otra cuenta propia `permission-denied` al leer el equipo ficticio; sin sesión REST 403. No se declara probada toda la matriz real. Siete pruebas locales del coordinador correctas, separadas de 54 comprobaciones de reglas/20 grupos Sync previos en Emulator. Safari/iPad, parpadeo y mejoras de estado visibles quedan pendientes. Permanecen equipo/propietario, un partido ficticio vivo/un tiro y documentos/lápidas del partido borrado; sin limpieza física. Banderas de producción false/false/false. Sin migraciones reales, commit, push ni despliegue.

Los párrafos siguientes conservan la bitácora histórica de la fase; el informe enlazado sustituye sus estados provisionales para la revisión final.

Servidor local 8B.1 detenido al cierre, sesión marcada para revisión y sin reanudación automática. Las páginas ya cargadas deben cerrarse para detener sus trabajadores; se conservan las copias IndexedDB. Reabrir sin servidor produce error de conexión local, sin significar pérdida de datos.

El propietario autoriza expresamente crear solo `PRUEBA 8B` y partidos/eventos ficticios en `registro-defensivo`, sin datos históricos, migraciones reales, cambios de reglas, publicación, commit ni push. El acceso manual Google en dos perfiles nuevos es un requisito pendiente, no una nueva solicitud de autorización para esas escrituras.

La copia de reglas publicadas aportada coincide con el archivo local tras normalizar saltos/BOM/extremos (SHA-256 `8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`). Compatible con el adaptador 8B; no sustituye la validación de permisos contra el servidor. Consulta pública real HTTP 200: proyecto `760744900094`, localhost y Pages autorizados. No lectura administrativa del ruleset remoto.

Nuevos `tools/firebase/sync-real-session.mjs`, `sync-real-control.mjs`, `sync-real-steps.mjs`: servidor solo loopback, configuración activa únicamente en sus respuestas, perfiles persistentes nuevos A/B verificados vacíos antes de abrir la aplicación, destino limitado al ID ficticio de la sesión, sin asistente de importación. Los tres módulos pasan la comprobación sintáctica. No cambia código deportivo ni configuración publicada; `js/sync-config.js` sigue false/false/false.

Se abrieron los popups Google para el acceso manual. A/B seguían sin UID, sin partidos y sin errores JavaScript en la última comprobación. No se han ejecutado los pasos deportivos ni creado documentos Firestore o hecho limpieza. No se atribuyen resultados reales a los 20 grupos/54 casos de emulador de 8B.

Sesión preparada `2026-10-15T18-55-16-637Z-d200aae0`, ID reservado localmente (no creado) `prueba8b-2d623b87-cb23-4fad-b6a3-e31b018113d4`. Evidencia local en `.test-artifacts/firebase/real-sync/…/session.json`, perfiles excluidos de Git. Informe y continuación en `FASE8B1_VALIDACION_REAL.md`. Pendientes login manual A/B, pruebas reales de unión/offline/recarga/Deshacer/borrado/estados/permisos y cuenta externa. Ante inconsistencia se conservan datos y se detiene el flujo. Safari/iPad y cualquier publicación HTTPS requieren pasos posteriores; no se publica nada en esta preparación.

Incidencia posterior: el propietario no ve las ventanas de prueba. Se verificó su ausencia del escritorio visible; la sesión del sandbox se cerró sin acceso Google ni escrituras deportivas. El arranque elevado fue denegado por el sistema (`CreateProcessW`, error 5). Se prepara `sync-real-control.mjs … --auto` para que el propietario lo inicie desde su terminal visible: abre perfiles nuevos, espera manualmente el mismo Google y ejecuta los pasos autorizados en orden, con parada y conservación ante fallo. Comando exacto en la guía 8B.1. No se solicita permiso de escritura de nuevo ni se afirma haber superado las pruebas reales pendientes.

Corrección solicitada por el propietario: los accesos Google deben abrirse uno a uno porque el intento simultáneo muestra un aviso de otra pestaña activa. Ahora solo se crea A al preparar la sesión; B se crea de forma diferida después de observar la cuenta de A y el cierre de su popup. Nuevo coordinador `tools/firebase/sync-real-login.mjs`; el modo manual también bloquea B antes de terminar A. Tras completar ambos, se conservan abiertos para sincronización. Cuatro pruebas en `sync-real-login.test.mjs` cubren orden/cierre, timeout sin abrir B, cuentas diferentes y cambio de A. No se toca autenticación productiva, reglas, datos deportivos ni las banderas desactivadas. OAuth real y la prueba de nube siguen pendientes de completar desde el escritorio del propietario.

16 de octubre de 2026: el propietario aporta captura de Google rechazando el acceso («el navegador o la aplicación no sean seguros») en Chrome for Testing. Google documenta el bloqueo posible de navegadores automatizados; no se elude. El intento `2026-10-15T21-15-44-783Z-d67ef3ee` terminó por timeout en A, con pasos vacíos. El flujo real vigente pasa a `tools/firebase/sync-real-manual.mjs`: servidor loopback sin lanzar/controlar navegadores; el usuario abre A y después B en dos perfiles nuevos de Chrome normal y completa Google manualmente. `--auto` del controlador anterior se detiene antes de preparar una sesión.

Nuevo `sync-real-manual-browser.mjs`: preflight antes de cargar app/Auth que exige IndexedDB vacío y separa perfil/ejecución; permite recargar el mismo perfil ficticio y rechaza bases anteriores sin modificarlas. Conserva el destino limitado al equipo ficticio y las banderas reales desactivadas en disco. Observaciones locales minimizadas sin tokens/contraseñas; no sustituyen comprobaciones de reglas/confirmación del servidor. Tres pruebas correctas en `sync-real-manual-browser.test.mjs`: contrato de informes, arranque/recarga/aislamiento/conservación y servidor sin navegador con configuración activa solo en respuestas. Consulta pública HTTP 200 durante la prueba de arranque; sin OAuth ni Firestore. Los artefactos de esta prueba están marcados `testing: true`. Informe 8B.1 actualizado con el nuevo comando. Pruebas de sincronización real pendientes; sin cambios deportivos, reglas publicadas, migraciones reales, commit, push ni despliegue.

Avance posterior del 16 de octubre: el informe activo `2026-10-15T22-17-01-344Z-045994f9` estaba vacío. Se reprodujo que el import asíncrono tras el preflight perdía `DOMContentLoaded`, dejando la app sin inicializar. Corrección mínima en `app.js`: comprobar `document.readyState` y arrancar una sola vez cuando el DOM esté disponible. No cambia lógica deportiva ni datos. La prueba de integración simulada declara su estado de carga. Cuatro pruebas del modo manual correctas (ahora con app real, registro ficticio, recarga e informe) y nueve suites Node correctas. OAuth desactivado en la prueba de arranque; ninguna petición a Google APIs.

El propietario recarga A/B y confirma acceso. Ambos informes ya muestran «Guardado localmente», sin partidos ni pendientes; sus observaciones todavía indican UID ausente y «Solo local», por lo que se solicita comprobar correo/«Cerrar sesión» dentro de la aplicación antes de escribir. El equipo reservado para esa sesión es `prueba8b-07d8d701-cb78-485f-8bd3-b190fde0f5f5`; no se declara creado ni sincronizado. Se mantienen los perfiles y el servidor; sin reinicios ni borrados. No confundir la prueba local de arranque con validación real de reglas o partidos.

El propietario confirma que el menú muestra «Iniciar sesión con Google»: falta el acceso dentro de la app en ambos perfiles, primero A y después B. No hay escrituras deportivas remotas. Regresión del modo estático con bandera OFF correcta (registro, doble toque, recarga, esquema v1 y sin Firestore).

Acceso manual posterior completado: el propietario confirma «Me ha funcionado» y los informes de A/B muestran la misma huella de UID no vacía, guardado local correcto y cero partidos/pendientes antes de comenzar. No se extraen tokens ni se usa WebDriver para el login. Lectura REST real sin token del equipo reservado denegada con 403 PERMISSION_DENIED; evidencia `unauthenticated-preflight.json` en la sesión `2026-10-15T22-17-01-344Z-045994f9`. La prueba es sobre una ruta aún sin partido confirmado, no una validación completa de reglas. Hash local de reglas coincide con la copia publicada proporcionada. Se solicita crear en A solo `PRUEBA 8B`, partido `PRUEBA-8B.1` / `Rival ficticio` y tres eventos; esperar confirmación y recuperar ese mismo equipo/partido en B. Resultado deportivo todavía pendiente; sin publicar ni activar banderas de producción.

Primera escritura real autorizada realizada manualmente: A informa el equipo previsto, partido `269e49af-bae7-4ae1-8316-5f50dfb36d58` y tres eventos con IDs distintos, estado Sincronizado, cola vacía y sin bloqueos; se observó pendiente antes del acuse. Lectura REST sin token del partido real de prueba denegada con 403 PERMISSION_DENIED (`unauthenticated-game.json`). El propietario afirma que B ve los tres eventos, pero el último informe de B todavía muestra Solo local y ningún equipo/partido. Se pausa antes de añadir más acciones para comprobar la etiqueta de la ventana observada. No se declara A→B superado ni conflicto/pérdida a partir de datos que aún no concuerdan. No se fuerza resolución ni se borra nada; se conservan los datos ficticios y la revisión parcial en `revision-agente.json`.

Aclaración y A→B confirmado: la captura mostraba que B tenía «Solo local» seleccionado. Tras recargar y seleccionar PRUEBA 8B y su partido, la nueva captura y los informes de B muestran tres eventos. Se comparan UID, equipo, partido y conjunto de IDs con A: coincidencia exacta de los tres eventos iniciales, sin duplicados visibles, ambos Sincronizado y colas/bloqueos a cero. No se recrea/importa/corrige nada. Se documenta como recuperación real A→B, no como validación global de toda la sincronización. Se solicita después una acción desde cada perfil sin esperar la sincronización de la primera, objetivo cinco intentos; pendiente de resultado. La secuencia manual cercana no acredita simultaneidad temporal garantizada. Revisión guardada fuera de Git en `revision-agente.json`.

Registro desde ambos perfiles confirmado después: cinco IDs únicos coincidentes en A/B, con dos altas nuevas conservadas, estado Sincronizado y colas/bloqueos a cero. El orden técnico local difiere entre los dos eventos nuevos, coherente con la política definida; no se impone un orden global ni se afirma simultaneidad temporal garantizada. El propietario pide pausa: «Mañana seguimos con las pruebas». Se detiene aquí, con punto de control en `revision-agente.json`; sin nuevas operaciones de Firebase ni limpieza. Se retoma comprobando informes/servidor/perfiles existentes y luego la prueba de desconexión de Firestore en B, recarga y reconexión. Las instrucciones de bloqueo ya se enviaron, pero su ejecución no está confirmada. No crear otro equipo ni borrar/reiniciar bases para reanudar; conservar el ámbito de la sesión. Permanecen pendientes Deshacer, eliminación, aislamiento adicional y Safari. Banderas publicadas desactivadas; sin commit, push ni despliegue de esta fase.

Al guardar la pausa aparecen nueve eventos en cada perfil, Sincronizado y cola vacía. Se conservan esas observaciones en `pauseObservations`, sin borrar los cuatro adicionales ni darlos por prueba offline/concurrencia validada. Al retomar se revisarán primero y se ajustará el punto de partida; los cinco previos son el último conjunto contrastado paso a paso. No se continúa la investigación ni se ejecutan más pruebas durante la pausa solicitada.

Reanudación solicitada después por el propietario. Se contrastan los últimos nueve IDs: son únicos, coincidentes en A/B y contienen los cinco de la prueba dirigida. El servidor estaba apagado. Se añade `--resume <runId>` a la herramienta manual para recuperar la misma sesión/equipo, origen, historial y marcas de los perfiles; no se borran bases ni se genera otro equipo. Comprueba identificador seguro, modo manual, proyecto y hash de reglas y rechaza sesiones detenidas para revisión. No rearma la cola ni fuerza conflictos. El informe solo se actualiza tras obtener el puerto. Cinco pruebas del modo manual correctas, incluida app real con mismo partido/evento/marker tras parar y reanudar. Sin OAuth ni Firestore en las pruebas de desarrollo.

El agente reanuda el servidor de `2026-10-15T22-17-01-344Z-045994f9` en localhost:4197; consulta pública del proyecto HTTP 200 y reglas coincidentes. La pausa queda revocada por el usuario. Se solicita recargar en los mismos perfiles A/B, desactivar cualquier bloqueo de red y confirmar nueve intentos, misma cuenta/equipo/partido y estado Sincronizado antes de la prueba offline. El equipo sigue siendo `prueba8b-07d8d701-cb78-485f-8bd3-b190fde0f5f5`. No se crea ningún registro de Firestore al arrancar el servidor ni se activa producción. Revisión y próximo paso en `FASE8B1_VALIDACION_REAL.md` y `revision-agente.json`.

Incidencia de selección de perfil al retomar: A muestra el aviso de marca de otra prueba. El servidor sirve la sesión original; B ya ha recuperado nueve eventos con Sincronizado/cola vacía. El preflight produce ese mismo aviso si difiere la etiqueta A/B del almacenamiento, no solo si difiere el runId. Se pide navegar a la URL B desde la ventana del aviso como diagnóstico, sin registrar ni modificar marcas/bases. No se descarta la protección ni se recomienda borrar datos o crear perfiles nuevos antes de aclararlo. Offline pendiente.

El propietario confirma que B abre en esa ventana, pero no consigue abrir el perfil A original. Servidor verificado HTTP 200 con la sesión/equipo originales. Se recupera el partido ficticio existente en un perfil nuevo de Chrome con IndexedDB vacío y la misma cuenta desde la app; no se crean equipo/partido ni se modifican marcas. A confirma los nueve IDs originales, Sincronizado y cola vacía en su informe del 16 de octubre a las 20:20:30 UTC; no acredita conservación de la cola del A original. El último informe B está sin cuenta/equipo y Solo local: se pide verificar su sesión y seleccionar el equipo/partido antes de probar offline. No se presupone pérdida de datos. La prueba de cola tras recarga se mantiene prevista en B; banderas de producción desactivadas.

El propietario confirma que B abre el partido desde la ventana del aviso: corresponde al almacenamiento B de la sesión actual, no a otra ejecución. Se indica abrir la URL A en el otro perfil de Chrome de prueba usado ayer; no modificar marcas, bases ni equipos. La copia B y los nueve IDs se conservan. Este diagnóstico queda resuelto con la recuperación descrita arriba.

Punto de partida contrastado tras «Listo»: informes A/B del 16 de octubre a las 20:21:48/20:22:10 UTC con misma cuenta/equipo/partido, nueve IDs únicos iguales y Guardado localmente/Sincronizado, sin pendientes ni bloqueos. Prueba posterior confirmada por el propietario: bloqueado solo Firestore en B, se registra un evento ficticio y se recarga. El mismo ID `ba70450c-3277-4e16-9c87-b3a171fa8d3c` permanece antes/después: B diez eventos únicos y una operación pendiente, cero bloqueos de conflicto, Guardado localmente y sin Sincronizado; A sigue con nueve. Conservación local/cola tras recarga correcta. Reconexión y confirmación sin duplicados pendientes. No se alteran banderas de producción ni registros desde el agente.

Reconexión posterior confirmada y contrastada en informes A/B del 16 de octubre (20:26:16/20:26:36 UTC): diez IDs únicos iguales, incluido el evento pendiente, todos los anteriores conservados, Guardado localmente/Sincronizado y colas/bloqueos a cero. No se observan pérdidas ni duplicados en este ciclo. Siguiente comprobación preparada: Deshacer una sola vez en B y recarga de ambas vistas; aún pendiente de ejecución.

Incidencia tras Deshacer: el propietario confirma actualización de ambos, pero observa parpadeo y no ve Sincronizando. Informes contrastados: nueve IDs originales iguales, evento deshecho ausente, colas/bloqueos vacíos y Sincronizado en ambos; recarga posterior aún pendiente. El estado de nube está en el menú «⋯», mientras la cabecera indica guardado local. El código notifica y redibuja tras cada consulta remota, aunque no cambie contenido: posible causa del parpadeo, sin reproducción visual confirmada. Se conservan datos y se detienen siguientes escrituras de prueba, incluida eliminación, para revisión de esta incidencia. Sin cambios de código, banderas, reglas ni publicación.

Preferencia futura del propietario: estado/control de sincronización al lado de Guardado, manteniendo diferenciadas confirmación local y de servidor; anotada, sin rediseño en esta fase. Informa también de «Revisar partidos locales» visible en la prueba: se refuerza su ocultación y bloqueo únicamente en el HTML/bootstrap de la herramienta manual, antes del arranque y con independencia del informe periódico. Cinco pruebas locales correctas (sin OAuth/Firestore), incluyendo controles creados tarde/reactivados y clic bloqueado. Servidor reanudado con los mismos IDs, sin nuevas escrituras deportivas; protección servida y pendiente de recarga A/B. Parpadeo pendiente de revisión.

Últimas observaciones: diez IDs únicos iguales en A/B, sin pendientes, evento deshecho ausente y otro nuevo distinto (`8d956b98-aba1-4167-8044-d491f717812b`). La propietaria aclara «Añadí un tiro»: corresponde a una acción manual adicional en el partido existente, no a otro partido. Se conserva y se fija como referencia un partido/diez tiros; no hay discrepancia de volumen ni resurrección del evento deshecho en las observaciones. No se atribuye a una prueba dirigida. Eliminación todavía sin ejecutar; incidencia de parpadeo y confirmación visual del bloqueo del asistente pendientes.

La propietaria confirma «No aparece»: ocultación del asistente de importación en la prueba verificada manualmente. Referencia un partido/diez tiros; preferencia de estado junto a Guardado y parpadeo siguen anotados para revisión. Se prepara Deshacer con alta todavía pendiente en B, bloqueando únicamente Firestore y recargando antes de reconectar, para contrastar que el tiro deshecho no reaparezca; ejecución pendiente. No se crean datos desde el agente ni se continúa con eliminación todavía.

Deshacer antes de subir: la propietaria confirma registro, Deshacer y recarga de B con Firestore bloqueado. Informes: nuevo tiro `895060bf-84f1-4272-9c96-fbcc014655cf` visible al subir a once y ausente después, mismos diez IDs de referencia en A/B, dos operaciones pendientes en B, cero bloqueos de conflicto y guardado local correcto. Reconexión, recepción remota del borrado y recarga sin resurrección todavía pendientes; no se modifican datos ni cola desde el agente.

Deshacer con alta pendiente tras reconexión: la propietaria confirma recarga A/B correcta; informes de las 20:39:03/20:39:10 UTC coinciden en los diez IDs de referencia, tiro `895060bf-84f1-4272-9c96-fbcc014655cf` ausente, Sincronizado y cero pendientes/bloqueos. Sin pérdidas, duplicados o resurrección observados. Siguiente caso preparado: eliminación exclusivamente del partido ficticio PRUEBA-8B.1 / Rival ficticio en A, con un tiro pendiente y Firestore bloqueado en B; eliminación y reconexión de ese caso todavía no ejecutadas. Se preservan lápidas y no se fuerza ningún conflicto.

Eliminación ficticia, primera parte ejecutada por la propietaria: A sin partidos/eventos y Sincronizado, cola vacía; B mantiene el partido y once eventos únicos con una operación pendiente y cero bloqueos. Nuevo evento pendiente `2171178f-270e-4fd7-a401-d23af95b4e7e`. Se guardan observaciones antes de reconectar; eliminación lógica, sin limpieza física ni otros equipos afectados. Pendiente retirar bloqueo en B, confirmar que recibe el borrado y que no reaparece el partido tras recargar. No se fuerza resolución de conflictos.

Eliminación frente a envío atrasado superada: propietaria confirma reconexión y recarga; A/B sin partidos/eventos visibles, Sincronizado y colas/bloqueos vacíos (20:41:49/20:41:52 UTC). El evento pendiente de B no restaura el partido. Eliminación lógica con conservación de documentos/lápidas, sin limpieza física ni inventario administrativo. Se prepara otro partido ficticio en el mismo equipo, PRUEBA-8B.1-AISLAMIENTO / Rival ficticio con un tiro, para verificar ocultación al cerrar/cambiar cuenta; creación y cierre todavía pendientes. No se accede a datos de terceros ni se ejecutan migraciones.

17 de octubre, cierre de sesión con contenido: la propietaria confirma y los informes contrastan el nuevo partido ficticio `ed3c53fa-b7a3-403e-ac0c-2f47f5b3c0b4` y tiro `57dce4f7-7d5a-484f-8522-db3fb68b5c6b`. B recibe ambos y al cerrar sesión deja UID/equipo nulos, sin datos visibles, Solo local; A conserva partido/tiro, Sincronizado y cola vacía. Ocultación al salir correcta, sin borrar datos. Quedan otra cuenta autenticada, permisos reales adicionales y Safari/iPad; parpadeo anotado para revisión. Un partido ficticio vivo/un tiro permanece junto a los documentos conservados del partido eliminado. Sin limpieza física, migraciones reales, commit, push ni despliegue.

Otra cuenta propia disponible, confirmada el 17 de octubre. Para verificar permiso real además de la ocultación de interfaz, la herramienta manual registra el resultado de la lectura de servidor del equipo ficticio: perfil, huella de cuenta, equipo y decisión acotada; sin tokens, UID en claro, correo ni datos deportivos. No cambia el adaptador de producción, reglas ni datos. Seis pruebas locales correctas con decisiones simuladas, sin OAuth/Firestore; no equivalen a reglas reales validadas. Mismo servidor/sesión/equipo reanudados. Pendiente recargar e iniciar en B con la segunda cuenta, comprobar huella distinta/denegación real y conservación en A; sin crear equipo ni acciones con la segunda cuenta.

Segunda cuenta real: B confirma huella distinta de A, sin equipo/partidos/eventos ni pendientes; A conserva su partido/tiro. Aislamiento visible contrastado. No ha llegado ningún informe de decisión de permisos, por lo que no se declara validada la denegación de reglas reales a partir de la interfaz vacía. Diagnóstico nuevo servido en localhost; se solicita recargar ambas páginas manteniendo las cuentas distintas para recogerlo, sin volver a autenticar ni crear datos. Pendiente evidencia de servidor.

Aún sin diagnóstico de permisos recibido tras confirmación de recarga; se conserva como pendiente y no se infiere una denegación real. Prueba local adicional recorre la envoltura de transporte servida con SDK simulado, propietario permitido y otra cuenta denegada, verificando recepción del resultado: siete pruebas locales correctas, sin OAuth/Firestore. Causa de ausencia en ventanas reales no demostrada. Se prepara navegación explícita a las URLs A/B con parámetro `control=permisos`, mismo origen/ámbito y cuentas, sin crear datos ni modificar permisos.

17 de octubre, evidencia real de permisos recibida tras navegación explícita: lectura SDK del equipo ficticio permitida para A/propietaria (`allowed`, 07:03:54 UTC) y denegada a B/segunda cuenta con huella distinta (`permission-denied`, 07:04:08 UTC). B sin datos privados; A conserva partido/tiro. Prueba acotada al equipo y membresía de la cuenta actual; no equivale a lectura administrativa del ruleset ni a toda la matriz de reglas real. Sin consultas a equipos de terceros ni escrituras de permisos. Pendiente volver a la propietaria en B y recuperar el mismo partido/un tiro; producción desactivada.

## 45. Respuestas a las decisiones de Fase 9 y nueva tarea (Fase 9B)

Respuestas del usuario del 15 de octubre de 2026 a los pendientes del apartado 43, registradas antes de empezar la tarea siguiente:

1. **Umbral mejor/peor**: 5 intentos aprobado para empezar. `MIN_COMPARISON_ATTEMPTS = 5` deja de ser provisional; se podrá ajustar más adelante.
2. **Contadores del Registro**: no se muestra porcentaje. Cada contador del Registro pasa a **anotados/intentos**: número de veces que el rival anota (no puntos de canasta) sobre el total de tiros registrados, por ejemplo **2/6**. Se aplica a botones, celdas de la matriz, totales de sección y de tipo y total del partido en la barra. Interpretación aplicada: Estadísticas no cambia (sigue en fallados/aciertos con el porcentaje en las tarjetas por situación y en el desglose).
3. **Marcador del partido en el Registro**: arriba, **puntos concedidos / puntos intentados**, ahora sí en puntos: suma de los valores 2/3 de los tiros anotados sobre la suma de los valores 2/3 de todos los tiros registrados del partido activo. Si hace falta espacio, el nombre «Registro defensivo» desaparece de la cabecera y queda solo el logo (con su nombre accesible).
4. **«Guardado» sin «localmente»**: se mantiene porque es cierto. El indicador solo pasa a «Guardado» cuando la transacción de IndexedDB del navegador termina; no afirma nada sobre la nube, cuyo estado va aparte en el menú «⋯».

Tarea autorizada a continuación (Fase 9B): **editor de botones** (vista propia desde «⋯» → «Editar botones», con IDs estables nunca reutilizados, renombrar sin reescribir eventos, retirar conservando historial, borrar solo elementos sin eventos, guardado atómico, cancelación sin cambios, configuración en IndexedDB con migración conservadora, `categorias.csv` como configuración inicial y de «Restaurar valores iniciales», partidos con distinta configuración tenidos en cuenta en datos y Estadísticas, estructura preparada para sincronizar sin implementarla) y **distribución adaptable del Registro** (filas equilibradas sin huecos, matriz que llena el espacio, degradación en orden: contador → márgenes/letra → puntos suspensivos; nunca desplazamiento ni objetivos < 44 px en iPad). Fuera de alcance: inicio de sesión, perfil, sincronización, nuevas estadísticas, JSON y XLSX. El trabajo de cuenta/Firebase en curso (`sync-*`, cuenta, configuración de Firebase) no se modifica.

## 46. Fase 9B — Editor de botones y distribución adaptable del Registro

Completada localmente el 15 de octubre de 2026 y detenida para revisión. Copia previa: `.local-backups/fase9b-editor-20261015-222856/` (archivo del proyecto, parche, estado Git, HEAD y hashes). El trabajo paralelo de cuenta/Firebase (`sync-*`, `cuenta*`, `firebase-*`, `firestore-sync.js`) y `persistencia.js` conservan su hash: no se han modificado.

### Respuestas aplicadas (apartado 45)

- Registro en **anotados/intentos** (veces, no puntos) en botones, celdas, totales de sección y tipo y total de la barra (`Anotados/intentos · 2/3`). Estadísticas no cambia.
- **Marcador** en la cabecera, solo en Registro: puntos concedidos / puntos intentados (`5/7`). El nombre «Registro defensivo» queda solo para lectores de pantalla; se ve el logo.
- «Guardado» se mantiene: solo aparece cuando termina la transacción de IndexedDB. En móvil se reduce al punto de estado (texto accesible).

### Parte A — Distribución adaptable

- `js/distribucion.js` (sin datos deportivos) prueba en el DOM real, en orden, pasos 0 completo → 1 sin contador → 2 márgenes y letra mínimos (17 px en nombres, 44 px de alto) → 3 nombres con «…», y para en el primero que cabe. Dentro de cada paso prueba 2, 3, 1, 4… filas para la franja superior (preferencia del lienzo). Comprueba alto disponible, ancho de matriz, objetivos ≥ 44 px, nombres completos (pasos 0–2) y contadores (paso 0).
- Filas equilibradas (diferencia máxima 1) que ocupan todo el ancho; en la última fila los botones se estiran. Anchos de Transición y Estático proporcionales a sus columnas. La matriz llena todo el alto y el ancho restantes; el título de Bloqueo directo ocupa la esquina reservando su ancho real. En tablet vertical (< 960 px de ancho útil) el título va encima y las cabeceras pueden partirse en dos líneas por «+» o «/».
- Se recalcula al cambiar la configuración (también desde otra pestaña), al girar, al cambiar el tamaño de ventana y al terminar de cargar las fuentes (sin recargar). Móvil: secciones apiladas en filas de dos, desplazamiento vertical y matriz con scroll interno, como antes.
- `registro.css` concentra el Registro y depende del paso (`data-fit`), no de media queries, para que la vista previa del editor y la aplicación usen las mismas reglas. `js/registro-vista.js` genera el mismo marcado para ambas.
- Si, aun así, no cabe (configuración guardada fuera del editor o pantalla no prevista), queda el paso 3 y se informa en `data-fits="false"`; en iPad el editor impide llegar a ese caso.

### Parte B — Editor de botones

- Vista `#editar` desde «⋯ → Editar botones», con la cabecera y el selector comunes. Listas de Transición, Estático, tipos de bloqueo y defensas: añadir, renombrar, reordenar (flechas de 44 px), retirar/recuperar, borrar (solo sin tiros en ningún partido local) y tiros 2/3. En Bloqueo directo cada celda permite los tiros comunes a tipo y defensa; las excepciones por celda que traiga un CSV se conservan hasta que se cambian los tiros de ese tipo o defensa.
- Vista previa en vivo escalada para iPad 1180×740, iPad mini 1133×670 e iPad vertical 820×1180 (geometría real de la app en `PREVIEW_DEVICES`), con estado por dispositivo y paso. Usa un contador de muestra de dos cifras (10/20), más exigente que un partido recién empezado. Si algún iPad no cabe ni recortando nombres, Guardar se bloquea con el motivo.
- Integridad: IDs estables asignados al guardar a partir del nombre final, nunca reutilizados (`usedIds` incluye IDs heredados v1, IDs de eventos y borrados; colisión → sufijo `_2`). Renombrar no reescribe eventos. Retirar oculta y conserva historial. Guardado en un único `put` dentro de una transacción que comprueba la revisión (otra pestaña que guardó antes provoca un aviso, no se pisa). Cancelar/Atrás con cambios piden confirmación. Aviso visible si el partido activo tiene tiros.
- Persistencia (`js/configuracion-guardada.js`): registro `configuracionBotones` en el almacén `settings` existente, **sin cambiar la versión de IndexedDB**: `schema`, `revision`, `currentId`, `baselineId`, `usedIds` y versiones inmutables (`id`, `createdAt`, `source` csv/editor/restore, `basedOn`, huella del CSV, documento). Migración conservadora al arrancar: si no existe, se crea desde `categorias.csv` sin tocar partidos ni eventos. Mientras no haya ediciones, un cambio del CSV se adopta al recargar (comportamiento anterior); después, el CSV solo sirve para «Restaurar valores iniciales» (con confirmación; lo que no esté en el archivo queda retirado). Preparado para sincronizar (versiones con ID, origen y padre), sin implementarlo.
- Partidos con distinta configuración: `configuracionPorPartido` (mismo almacén) guarda, sin tocar partidos ni eventos, las versiones con las que registró cada partido. Estadísticas usa la última; un partido anterior a 9B con tiros usa la inicial; uno sin tiros, la vigente. Los elementos con tiros que no estén en esa versión aparecen como filas históricas, como antes. El Registro siempre usa la configuración vigente.
- Cambios mínimos fuera de los módulos nuevos: `configuracion.js` (`loadConfigurationSource`, aditivo), `identidad.js` (`legacyIdentityIds`, aditivo), `estadisticas.js` (formatos anotados/intentos y puntos intentados), `vistas.js` (vista editar y guarda), `interfaz.js` (cerrar menú) y `app.js` (carga de configuración, marcador, distribución, uso por partido, enlace del editor).

### Verificación

- Node: configuración (26), registro (104 resultados), integración, estadísticas, exportación, Dashboard, matriz (67 agregaciones), diseño V4 y nueva `configuracion-guardada.test.mjs` (ida y vuelta exacta con el CSV vigente, excepciones por celda, intersección de tiros, IDs nunca reutilizados, validación, restaurar, versión por partido y filas equilibradas 1–12 × 1–6). Controlador de cuenta correcto.
- Chromium (contextos efímeros, datos ficticios, sin red externa): regresiones Fase 2, 3, 5 y 6 correctas; partidos/pestañas/subruta; runner V4 en 1180×740, 1133×670, 1366×1024, 820×1180 y 390×844; suite visual de Playwright 3/3.
- `tests/diseno-v4/distribucion.mjs`: 59 casos (Transición 1–12, Estático 1–12, matrices 2×2–6×8) × 5 tamaños = 295 mediciones. Ninguna fila con hueco (suma de anchos = contenedor ±1 px), sin scroll horizontal, objetivos ≥ 44 px; en iPad sin desplazamiento, sin botones bajo la barra y matriz llenando el espacio. Pasos: 1180×740 → 52 en paso 0 y 7 en paso 2; 1133×670 → 42 en paso 0, 3 en paso 1 y 14 en paso 2; 1366×1024, 820×1180 y 390×844 → todos en paso 0. Ningún caso necesita el paso 3. La vista previa nunca promete un paso mejor que el de la app. Detalle por caso en `distribucion.json`.
- `tests/diseno-v4/editor.mjs` (7 grupos): migración desde una base v1 ficticia (configuración creada, IDs heredados reservados, eventos idénticos, recargar no duplica); renombrar/reordenar/retirar/añadir/borrar con eventos idénticos y agrupación por ID; Atrás y Cancelar con confirmación; otra pestaña se actualiza sin recargar y un segundo editor no pisa al primero; registro con la nueva configuración, Deshacer, CSV con nombres antiguos y nuevos; Estadísticas del partido activo con su versión y del antiguo con la inicial; Restaurar idéntico a `categorias.csv` y persistente; configuración demasiado grande bloqueada; editor sin scroll horizontal y con controles ≥ 44 px en tres tamaños.
- Fuera de esta fase: `tools/firebase/local-browser.mjs` sigue fallando al final por las peticiones al SDK de gstatic (configuración real activada por el trabajo 8A.1); sus regresiones de interfaz pasan. No se cuenta como regresión.
- Capturas en `tests/diseno-v4/capturas/` (editor y distribución) y página `tests/diseno-v4/revision.html` actualizada. Paquete Pages local de 35 archivos (nuevos `registro.css`, `editor.css` y cuatro módulos), sin publicar. Expectativas de presentación actualizadas en pruebas de fases 2, 3, 5, 6, integración y suite visual (anotados/intentos); `tests/config-page.html` regenerado.

### Pendientes de revisión

- Confirmar la interpretación de anotados/intentos solo en Registro y del marcador puntos concedidos / puntos intentados.
- El Registro de un partido antiguo usa la configuración vigente (sus Estadísticas, la suya). Confirmar si se prefiere registrar cada partido con su propia versión.
- Borrar del todo comprueba solo los tiros de este navegador; con sincronización habrá que comprobar también los de la nube. La configuración no se sincroniza todavía.
- Safari/iPad y iPad mini físicos: las medidas son emulación Chromium con los tamaños indicados; la geometría de `PREVIEW_DEVICES` debería confirmarse en el dispositivo.
- Umbral de 5 intentos aprobado; nombres de más de 40 caracteres no se admiten en el editor.

Fase cerrada; no se inicia la siguiente. Sin commit, push ni despliegue.

## 47. Respuestas a los pendientes de Fase 9B y ajustes (Fase 9C)

Respuestas del usuario del 15 de octubre de 2026:

1. **Anotados/intentos también en Estadísticas**: todas las cifras pasan a anotados/intentos (veces, no puntos). El **marcador** es puntos concedidos / puntos intentados (confirmado). Interpretación aplicada: el desglose mantiene intentos, fallados, aciertos, puntos y puntos por tiro; el % de éxito (fallados/intentos) y los anillos y barras no cambian de significado.
2. **Cada partido guarda la configuración de su pantalla**: el Registro y las Estadísticas de cada partido usan su propia versión; un partido antiguo sigue registrando con la suya. El usuario duda si permitir cambiar el panel cuando ya hay datos. Recomendación aplicada (pendiente de confirmar): permitirlo con aviso visible, porque los tiros no se reescriben (IDs estables; lo que tiene tiros se retira, no se borra) y en pleno partido puede faltar una jugada. Bloquearlo sería un cambio pequeño.
3. **Edición como en el lienzo** (`EJEMPLO.html`, «Registro con modo edición» y «Modo edición con categorias.csv»): se edita sobre el propio panel, con cabecera «Editando panel», medidor de filas y defensas, Restaurar/Cancelar/Hecho; al tocar un botón, su editor (nombre, tiros, mover, Quitar, Listo) en la cabecera; barra inferior para añadir Transición, Estático, Tipo de bloqueo o Defensa, desactivada si no cabría. Se mantienen las versiones de configuración por botones de la Fase 9B.

## 48. Fase 9C — Anotados/intentos en Estadísticas, panel por partido y edición en el propio panel

Completada localmente el 15 de octubre de 2026 y detenida para revisión. Copia previa: `.local-backups/fase9c-panel-20261015-231752/`. Sin cambios en `persistencia.js`, `sync-*`, cuenta, Firebase, `categorias.csv`, `registro.js`, `exportacion.js`, IndexedDB (versión) ni eventos.

### Cambios

- **Estadísticas en anotados/intentos** (`js/dashboard.js`): tarjeta coral (`#statsResults`, p. ej. 29/68, y «Puntos 67/157 · 57 % éxito defensivo»), situaciones, matriz, totales, píldoras Mejor/A mejorar, desglose («Anotados / intentos»), anillos de Transición y ranking de Estático. El orden y las marcas Mejor/Peor siguen por éxito defensivo exacto (fallados/intentos) con mínimo de 5 intentos; barras y anillos sin cambios de significado.
- **Panel por partido** (`app.js`, `js/configuracion-guardada.js`): el Registro y las Estadísticas de cada partido usan su versión (`configuracionPorPartido`). Un partido nuevo recibe la predeterminada (la última guardada). «Hecho» guarda la versión y la asigna al partido activo en la misma transacción. Un partido anterior a 9B con tiros usa la inicial. Regla de compatibilidad: mientras un partido use la configuración del archivo (csv/restaurar) y la predeterminada también, sigue los cambios de `categorias.csv` como antes; un panel editado queda fijo. Se permite editar con tiros (recomendación pendiente de confirmar).
- **Edición sobre el panel** (`js/editor.js`, `editor.css`, menú «Editar panel» con lápiz): reproduce el lienzo «Registro con modo edición». Cabecera «Editando panel» con partido, medidor «N de M filas · D de 8 defensas» (filas = franja superior + tipos; máximo calculado en iPad mini), Restaurar/Cancelar/Hecho. Botones blancos con borde y chips de tiros; variante compacta con los chips bajo el nombre cuando no caben en línea; celdas atenuadas con anotados/intentos del partido. Al tocar un botón: campo de nombre con anillo coral, tiros 2/3, mover ‹ › (↑ ↓ en tipos), Quitar y Listo; «Columna para todos los tipos» en defensas; confirmación de Quitar en la cabecera, distinta si tiene tiros (se retira) o no (se borra). Barra inferior con los cuatro «Añadir»; quedan desactivados con «Máximo 12/8/8» o «No cabe sin deslizar» si el botón nuevo no cabría en los tres iPad; la capacidad se invalida en cada cambio para no permitir pulsaciones rápidas por encima del límite. La vista anterior en listas se retira.

### Verificación

- Node: nueve suites correctas, incluida `configuracion-guardada.test.mjs` con la regla de seguir al archivo; controlador de cuenta correcto.
- Chromium (contextos efímeros, datos ficticios, sin red externa): regresiones Fase 2, 3, 5 y 6; partidos/pestañas/subruta; runner V4 en cinco tamaños (Estadísticas 29/68, Mejor White 0/5, A mejorar Blue 4/6); suite visual Playwright 3/3.
- `tests/diseno-v4/distribucion.mjs`: 295 mediciones correctas, mismos pasos que en 9B (ahora asignando cada configuración al partido activo).
- `tests/diseno-v4/editor.mjs` (8 grupos): migración v1; edición en el panel (renombrar, mover, quitar con tiros → retirado, sin tiros → borrado con ID reservado, añadir Flex solo 2 e Ice tras liberar una defensa; «Máximo 8» en defensas); Atrás/Cancelar con confirmación; otra pestaña actualizada; Registro, Deshacer, CSV con nombres antiguos y nuevos; Estadísticas 2/5 y puntos 5/11; **panel por partido** (el antiguo conserva Bajo aro, Pin down, Spain y registra con ellos; uno nuevo recibe la última); conflicto entre pestañas; Restaurar idéntico al CSV; límites al añadir (5 acciones más → «Máximo 12»; 3 tipos más → «No cabe sin deslizar») y lo guardado cabe sin desplazar; modo edición sin scroll horizontal, sin desplazamiento en iPad y con controles ≥ 44 px en 1133×670, 820×1180 y 390×844.
- Fuera de esta fase: `tools/firebase/local-browser.mjs` sigue fallando solo por las peticiones a gstatic de la configuración real activada en paralelo; sus regresiones de interfaz pasan.
- Capturas en `tests/diseno-v4/capturas/` y `revision.html` actualizada (sección 9C). Paquete Pages local de 35 archivos, sin publicar.

### Pendientes de revisión

- Confirmar que se permita editar el panel de un partido con tiros (aplicado con aviso) o si se prefiere bloquearlo.
- Confirmar los límites del lienzo (12 acciones por sección, 8 tipos, 8 defensas) junto con la comprobación de espacio.
- Un elemento quitado con tiros no se puede «recuperar» desde el panel; si se añade otro con el mismo nombre recibe un ID nuevo. Restaurar recupera los del CSV.
- Borrar del todo solo comprueba tiros de este navegador; la configuración aún no se sincroniza. Safari/iPad físicos pendientes.

Fase cerrada; no se inicia la siguiente. Sin commit, push ni despliegue.

## 49. Respuestas a los pendientes de Fase 9C y ajustes (Fase 9D)

Respuestas del usuario:

1. **No se permite editar el panel de un partido con tiros.** Para cambiarlo hay que deshacer sus tiros, eliminar el partido o crear uno nuevo. Sustituye la recomendación del apartado 47. «Editar panel» queda desactivado con la explicación; «Hecho» lo vuelve a comprobar (otra pestaña podría haber registrado).
2. **Límites** de 12 acciones por sección, 8 tipos y 8 defensas: aprobados.
3. **Sin «Restaurar»**: lo que se quita del panel se pierde para el panel. Por integridad, si tiene tiros en otros partidos su historial se conserva (Estadísticas y CSV), pero no hay forma de recuperarlo desde el editor. `categorias.csv` sigue siendo la configuración inicial.
4. Pruebas en iPad físico: las hará el usuario.

Ajustes pedidos:

- **Barras «fallados por defensa»** de la tarjeta coral: si son demasiadas, mostrar solo las mejores y las peores (lo que necesita el entrenador para decidir). Aplicado: con más de 6 defensas se muestran las 3 mejores y las 3 peores por éxito defensivo; con 6 o menos, todas.
- **Cabecera de edición**: en lugar de «N de M filas», el partido.
- **Registro**: línea vertical entre Transición y Estático.

## 50. Fase 9D — Panel bloqueado con tiros y ajustes visuales

Completada localmente y detenida para revisión. Copia previa: `.local-backups/fase9d-ajustes-20261015-234137/`. Sin cambios en `persistencia.js`, `sync-*`, cuenta, Firebase, `categorias.csv`, `registro.js`, `exportacion.js`, IndexedDB ni eventos.

### Cambios

- **Panel bloqueado con tiros** (`app.js`, `js/editor.js`, `index.html`): «Editar panel» se desactiva cuando el partido activo tiene tiros y una nota del menú explica las salidas (deshacer, eliminar el partido o crear otro). Recargar en `#editar` con tiros vuelve al Registro con la explicación. «Hecho» lo comprueba de nuevo: si otra pestaña registra mientras se edita, no guarda. Deshacer todos los tiros vuelve a permitirlo. Sin partido activo se edita el panel de los partidos nuevos. Nota: un partido que sigue la configuración del archivo continúa recibiendo los cambios de `categorias.csv` (comportamiento anterior al editor).
- **Sin Restaurar**: se retira el botón. Quitar avisa de que no se podrá recuperar; si el elemento tiene tiros en otros partidos se conserva como retirado por integridad (sus datos siguen en esos partidos), pero no hay forma de recuperarlo. Las funciones de restaurar del módulo quedan sin uso en la interfaz.
- **Cabecera de edición**: chip «Partido · J3 · Editable» (o «Partidos nuevos») en lugar del medidor de filas, que se elimina junto con su cálculo.
- **Barras de la tarjeta coral** (`js/dashboard.js`, `dashboard.css`): hasta 6 defensas, todas; con más, las 3 mejores y las 3 peores por éxito defensivo exacto (empates en orden de configuración), separadas y rotuladas «Mejores» / «Peores»; si solo 6 o menos tienen tiros, se muestran esas. Nombres en dos líneas si hace falta (corte por «+» o «/»). `MAX_DEFENSE_BARS = 6` y `defenseBarGroups` exportados y probados.
- **Registro**: línea vertical fina entre Transición y Estático (no en móvil, donde se apilan).

### Verificación

- Nueve suites Node correctas (incluida la nueva prueba de barras en `diseno-v4.test.mjs`) y controlador de cuenta.
- Chromium: regresiones Fase 2, 3, 5 y 6; partidos/pestañas/subruta; runner V4 en cinco tamaños; distribución 295 mediciones (sin cambios de pasos); suite visual Playwright 3/3.
- `tests/diseno-v4/editor.mjs` (7 grupos): bloqueo con tiros en el menú y al recargar en `#editar`; edición en un partido sin tiros con el partido en la cabecera y sin medidor ni Restaurar; quitar (retirado si tiene tiros en otros partidos, borrado con ID reservado si no); un tiro bloquea y deshacerlo desbloquea; CSV y Estadísticas en anotados/intentos; panel por partido; Cancelar, conflicto entre pestañas y tiro registrado desde otra pestaña durante la edición (Hecho rechazado); límites al añadir; controles ≥ 44 px en tres tamaños.
- Fuera de esta fase: `tools/firebase/local-browser.mjs` sigue fallando solo por gstatic; sus regresiones de interfaz pasan.

### Pendientes de revisión

- En las barras «Mejores/Peores» entra cualquier defensa con tiros, aunque tenga menos de 5 intentos (las píldoras Mejor/A mejorar sí exigen 5). Confirmar si se prefiere aplicar también ese mínimo.
- Confirmar que un partido que sigue `categorias.csv` deba seguir recibiendo los cambios del archivo aunque tenga tiros, o congelarlo también.
- Pruebas en iPad físico: las hará el usuario.

Fase cerrada; no se inicia la siguiente. Sin commit, push ni despliegue.

## 51. Fase 9E — Más defensas, panel congelado con tiros y preparación para publicar

Peticiones del usuario: 8 defensas pueden ser pocas («estoy abierta a ideas»); en las barras puede entrar cualquier defensa aunque tenga menos de 5 intentos; si un partido tiene tiros, su panel no cambia nunca, sea cual sea su configuración; valorar subir a `main` lo hecho hoy de estética y edición para que lo pruebe otra persona. Copia previa: `.local-backups/fase9e-defensas-20261015-235425/`.

### Cambios

- **Hasta 12 defensas** (`LIMITS.defenses = 12` en `js/editor.js`); el límite real sigue siendo que quepa sin deslizar en los tres iPad. En el paso compacto (2 y 3) la matriz se comprime antes de recortar nombres: «Bloqueo directo» en dos líneas, nombres de tipo y cabeceras de defensa en hasta dos líneas y columna de tipos que puede estrecharse (`fit-content`, 132 px). Se descarta girar la matriz (12 filas no caben en altura en el iPad mini).
- **Estadísticas con muchas defensas**: la tabla tiene un ancho mínimo por columna y se desliza en horizontal; el eje de tipos y el desglose quedan siempre a la vista.
- **Panel congelado con tiros**: `versionForGame` ya no hace seguir al CSV a un partido con tiros (solo a los que no tienen). La prueba de Fase 3 se adapta: el CSV no cambia el panel de un partido con tiros y sí el de uno vacío.
- **Barras**: se mantiene que entre cualquier defensa con tiros (confirmado).

### Verificación

- Nueve suites Node y cuenta correctas; regresiones Fase 2, 3, 5 y 6; partidos/pestañas/subruta; runner V4 en cinco tamaños; suite visual 3/3.
- Distribución: 67 configuraciones (nuevas matrices 2/3/4/6 × 10/12) × 5 tamaños = 335 mediciones correctas. 1180×740: 58 en paso 0 y 9 en paso 2; 1133×670: 48/3/16; 820×1180: 63/0/4; 1366×1024 y 390×844: todas en paso 0. Ninguna en paso 3 (6×12 cabe en iPad mini en paso 2).
- Editor (7 grupos) con el nuevo límite: se pueden añadir defensas por encima de 8 hasta «Máximo 12».

### Publicación en main: situación

El árbol de trabajo mezcla el trabajo de hoy con el de cuenta/Firebase de la sesión paralela, no autorizado para publicar: `app.js` importa `sync-storage.js`, `persistencia.js` (versión 8B, que exporta `transact`) importa los módulos de sincronización, `index.html` carga `cuenta-ui.js` y `firebase-config.js` tiene la configuración real con `enabled: true` (botón de Google visible). `main` (`b95653e`) no tiene nada de eso y su `persistencia.js` no exporta `transact`. Publicar «solo estética y edición» requiere una rama de publicación desde `main` que excluya cuenta/sincronización (con un `app.js` sin esos enganches y `transact` exportado en `persistencia.js`), verificada aparte. Pendiente de decisión del usuario; no se ha hecho commit ni push.

## 52. Publicación en main del diseño V4 y la edición del panel

El usuario autoriza subir a `main` lo hecho de estética y edición para que otra persona lo pruebe, y elige publicar **solo estética y edición**, sin la cuenta de Google ni la sincronización de la sesión paralela (no revisadas para publicar).

- **Versión de publicación** preparada en un worktree temporal desde `main` (`b95653e`), sin tocar el árbol de trabajo compartido: archivos de la app de este trabajo; `app.js` sin los enganches de sincronización (ámbitos de cuenta/equipo); `index.html` sin barra ni scripts de cuenta (también retira la barra de cuenta que la web publicada mostraba sin su script); `persistencia.js` de `main` con `transact` exportada (necesaria para la configuración del panel); `premium.css` retirado; README público reescrito. 25 archivos de aplicación más README y `.gitignore`. Pruebas, herramientas y documentos internos no se publican.
- **Verificación sobre la versión de publicación** (contextos efímeros, datos ficticios, sin red externa): nueve suites Node; regresiones Fase 2, 3, 5 y 6 con la persistencia de `main`; partidos, pestañas y subruta de Pages; runner V4 en cinco tamaños; distribución 335 mediciones; editor 7 grupos (incluida la migración desde una base existente); suite visual Playwright 3/3; menú sin cuenta.
- **Publicación**: `git fetch` confirmó `origin/main` = `b95653e`. Rama de respaldo `respaldo/antes-diseno-v4-20261016`. Commit `8c6667d` «feat: publica el diseño V4 y la edición del panel» (identidad del repositorio, con línea de coautoría como los anteriores), avance rápido de `main` y push normal `b95653e..8c6667d`. La rama `develop` y el árbol de trabajo local no cambian.
- Pendiente: comprobación en Safari/iPad físicos por el usuario y su primo; los datos de cada dispositivo se quedan en su navegador (exportar CSV para conservar copia).

## 53. Fase 8B.2 — Parpadeo, revisión de seguridad y preparación HTTPS para iPad

La Fase 8B.1 se cierra con confirmación del usuario: B recupera partido y tiro, el partido eliminado no reaparece y ambas colas quedan vacías. Sus resultados se conservan en `FASE8B1_RESULTADOS.md`. Esta continuación no modifica sus equipos, eventos ni lápidas.

### Diagnóstico y corrección local

- Reproducción con aplicación/IndexedDB reales y transporte ficticio: tres respuestas remotas idénticas causaban 252 retiradas de botones, tres estados falsos de Guardando y 303 transiciones disabled, tanto a 1024×768 como a 390×844. El botón seleccionado y el foco se perdían.
- Causa: `mergeRemote` avisaba sin cambios, la lectura entraba como mutación busy/Guardando y `applyState` reconstruía el panel dos veces para restaurar la selección. También se propagaba entre pestañas.
- Corrección en `js/sync-storage.js`, `app.js` y `js/registro-vista.js`: avisar solo cambios visibles confirmados; serializar lecturas sin simular escrituras; omitir estados idénticos; conservar opciones, botones, foco y selección cuando la configuración no cambia. El asistente notifica sus commits locales directamente, sin depender de respuestas remotas vacías.
- Después: cero retiradas de botones, falsos Guardando y deshabilitaciones en los ciclos idénticos. La llegada de un evento remoto entre las dos pulsaciones conserva la selección y permite exactamente un nuevo tiro. Error de nube visible; un Error al guardar real no se borra por una lectura/sincronización correcta. Sin cambios de esquema, IDs, datos deportivos, cálculos o CSV.

### Seguridad y evidencia

- Copia actual de reglas facilitada por la propietaria desde Console, coincidente con `firestore.rules` tras normalizar BOM/saltos/extremos. SHA256 `8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`. No hay sesión administrativa CLI: es comparación de la copia, no lectura administrativa del ruleset. No se publican ni relajan reglas.
- Matriz SDK compartida entre Emulator y control real: propietario, sin sesión y cuenta externa. Solo `permission-denied` satisface una denegación esperada; otros resultados detienen la ejecución y conservan datos.
- Fixture real nuevo `PRUEBA 8B.2 SEGURIDAD`, ID `prueba8b2-seguridad-9941b41c-9837-419c-8385-3407bd4f897f`. Las 25 comprobaciones reales son correctas: 14 de propietaria, tres sin sesión y ocho de segunda cuenta propia; seis operaciones permitidas y 19 denegadas. Informes recibidos y confirmación manual del usuario, sin resultados inesperados.
- Seis documentos ficticios creados por la prueba propietaria: equipo, miembro, partido vivo, evento histórico ficticio, lápida de Deshacer y partido ya eliminado. Sin limpieza física ni acceso a datos ajenos reales. Página de seguridad independiente, sin abrir IndexedDB deportivo ni guardar credenciales.

### Verificación

Nueve suites Node deportivas correctas después del cambio final; 54 comprobaciones de reglas en Emulator; matriz adicional de 25 casos SDK en Emulator; 20 grupos de sincronización en Emulator, incluido asistente, idempotencia, Deshacer, borrados tardíos y aislamiento; siete pruebas del coordinador manual; dos pruebas de empaquetado/arranque de preview; bandera OFF en raíz/subruta Pages y reproducción del parpadeo en dos tamaños. Las pruebas de preview simulan HTTPS/Auth: no acreditan Safari físico ni Hosting desplegado.

### Entorno de iPad preparado, no publicado

- `firebase.preview.json` separado, solo Hosting. Directorio público limitado a `.test-artifacts/firebase/ipad-preview/public`, generado por lista explícita de aplicación/fuentes/licencias; documentación, herramientas, pruebas, informes y archivos privados excluidos. Manifiesto de hashes fuera de public.
- Proyecto/sitio `registro-defensivo`, canal propuesto `ipad-8b2`, TTL 24h. Debe comprobarse la existencia del sitio con cuenta CLI autorizada. No se ha creado ni desplegado sitio/canal.
- `tools/firebase/ipad-preview.mjs` genera por defecto Sync OFF. La eventual opción `--enable-sync` actúa solo sobre la copia y solo en el hostname HTTPS previsto. Fuentes false/false/false; GitHub Pages y canal live excluidos. Inventario de almacenamiento previo, asistente bloqueado y transporte limitado a un equipo reservado; las reglas siguen siendo la autorización efectiva.
- Equipo futuro, aún no creado: `PRUEBA 8B.2 IPAD`, ID `prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778`. Cuenta propietaria de las pruebas. Origen nuevo sin borrar datos del Safari habitual.
- Se mantiene popup Google por gesto del usuario, sin redirect improvisado. Dominio exacto de preview pendiente de autorización y de añadir manualmente a Authentication; el comando previsto usa `--no-authorized-domains` para evitar cambios automáticos.
- `PRUEBA_SAFARI_IPAD.md`: acceso/persistencia, recuperación entre dispositivos, dos pulsaciones, corte simulado duradero y corte real aparte, estadísticas, Deshacer, eliminación y observación de parpadeo. Sin prometer recarga sin Internet (no hay service worker).

Falta autorización explícita para publicar el paquete revisado en ese canal durante 24h, habilitar Sync solo allí, autorizar su hostname y crear/usar el fixture iPad. Retirada limitada al canal/dominio, conservando documentos y lápidas. No incluye reglas nuevas, producción, migraciones, commit o push. Procedimiento exacto y límites en `FASE8B2_REVISION.md`. Detenido para revisión antes del despliegue.

## 54. Fase 8B.3 — Publicación temporal autorizada, preparación previa

El usuario autoriza únicamente publicar `ipad-8b2` en `registro-defensivo` por 24h, añadir su hostname exacto a Authentication y habilitar las pruebas ficticias con Sync inicialmente desactivado. Prohíbe canal live, Pages, commit/push, datos reales y borrado de lápidas.

- Se releen instrucciones, especificación, informe y módulos de preview/Auth/Sync. Paquete regenerado sin `--enable-sync`: 35 archivos explícitos y hashes comprobados; pruebas de empaquetado/arranque 2/2 correctas. Fuentes y paquete mantienen Sync OFF. No se publica documentación, pruebas, informes o credenciales administrativas.
- Destino público confirmado `registro-defensivo`; configuración separada `firebase.preview.json` contiene solo Hosting. Reglas locales coinciden con la copia de Console contrastada en 8B.2 (SHA256 `8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`), con 25 comprobaciones reales correctas ya documentadas. Sin cambios de reglas.
- Condición adicional de aislamiento: `owner()` permite a la propietaria acceder a todos sus equipos. El filtro cliente a un ID no reduce ese permiso en servidor. No habilitar Sync usando solo ese filtro. Se pregunta por cuenta Google exclusiva de pruebas sin datos reales; si no está disponible, revisar otra solución en servidor antes de activar.
- Sin sesión Firebase CLI en el entorno. Se solicita login manual en la terminal con la cuenta administradora (no confundir con la futura identidad cliente de pruebas). No se piden tokens ni contraseñas en el chat.
- Pendientes: sesión CLI, existencia del sitio, lectura actual de reglas si hay permisos, despliegue del paquete OFF al canal temporal, URL/TTL reales y autorización del hostname en Console. No hay URL real todavía; no se inventa.

### Resultado de 8B.3

- El usuario completa login CLI y confirma cuenta Google exclusiva para la aplicación de pruebas. Se consulta el sitio real existente, sin crearlo. Lectura administrativa del release `cloud.firestore`, ruleset `4bc70f67-e0ed-4fb0-b46e-7c2494eab227`: contenido coincidente con el hash anterior. Sin publicación de reglas ni lectura de partidos reales.
- Canal `ipad-8b2` publicado con Sync OFF: `https://registro-defensivo--ipad-8b2-40nbq9cf.web.app`, versión `b719302881e4018e`, caducidad `2026-10-18T07:40:18.547766856Z` (18 de octubre, 09:40 CEST). Live sigue sin release. No Pages, commit ni push.
- Dominio `registro-defensivo--ipad-8b2-40nbq9cf.web.app` añadido expresamente a Authentication mediante API y verificado; todos los anteriores conservados. No se ha modificado ningún otro parámetro de Authentication.
- 35 archivos HTTPS verificados por hash; cabeceras no-store/noindex y rutas privadas 404. Dos contextos Chromium efímeros en horizontal: arranque vacío, dos pulsaciones, persistencia tras recargar y cero Firestore, sin errores ni desbordamiento. No equivale a Safari físico ni login OAuth probado.
- No se ha creado el fixture iPad ni vinculado aún su cuenta. El `ownerHash` anterior del plan no debe utilizarse para habilitarla; revisar con la nueva identidad dedicada y verificar ámbito mediante SDK antes de activar Sync. Mientras tanto solo login/persistencia y uso local ficticio.
- Confirmación física posterior del usuario: «Funciona», en respuesta a abrir Safari en horizontal, iniciar Google con la cuenta exclusiva y recargar conservando sesión/«Solo local». Acceso y persistencia tras recarga acreditados manualmente; no se extrapola a Sync, suspensión, cierre/reapertura o responsive completo. Pendiente identificar únicamente esa cuenta para vincular/verificar el ámbito ficticio; no se activa ni se escribe en Firestore por esta confirmación.

### Identidad dedicada verificada y actualización con activación manual

- Consulta de una única identidad indicada por el usuario: Google válido, huella `7e6e354a4f4deb94`, distinta de la propietaria anterior. Consulta administrativa de equipos filtrada por su ownerUid: cero. No se listan usuarios ni se leen partidos. No se publica correo/UID ni se almacenan credenciales en el repositorio.
- Plan vinculado a esa huella. Nuevo `js/preview-account.js`, importado solo por el preview: proyecto/cuenta/sesión estables, ningún otro equipo propio, miembro activo si existe el fixture y denegación exacta a un equipo ficticio ajeno de 8B.2. Sin escrituras; un error detiene sin activar. La seguridad efectiva sigue en Rules mediante identidad/propiedad/membresía; filtro y bandera cliente solo previenen errores adicionales.
- Botón «Activar prueba de sincronización» en «⋯», requiere pulsación explícita y comprobaciones SDK; rechaza partidos locales previos sin importarlos. Guarda evidencia mínima/aceptación en ese origen y recarga. No crea equipo o partido ni sube eventos. Marca persistente para probar recargas pendientes; por defecto OFF. Las banderas fuente siguen false/false/false.
- Nueve casos nuevos correctos en Emulator y dos pruebas de empaquetado/arranque actualizadas. Paquete de 36 archivos verificado por HTTPS; versión vigente `f0a4971d2c312bef`. Caducidad `2026-10-18T07:38:46.623547158Z`: actualización sin prolongar las 24h iniciales. Live sin release, dominio sin nuevos cambios. Verificación HTTPS real en dos tamaños: activación sin sesión rechazada, cero Firestore, registro local/recarga correctos.
- Pendiente usuario: recargar Safari, pulsar activación una sola vez y confirmar que aparecen Prueba activada/Equipo/Crear equipo. No crear equipo/partido aún. La comprobación SDK real con esa sesión no se marca como superada hasta recibir resultado. No hay documentos Firestore nuevos en esta continuación.
- Resultado posterior: el usuario confirma «Veo la prueba activada, Equipo y Crear equipo». Control SDK real previo en Safari superado por confirmación manual; no se ha extraído informe del dispositivo. Esa activación no crea documentos. Se indica crear una sola vez el fixture `PRUEBA 8B.2 IPAD`, jornada `IPAD-8B2` / rival `Rival ficticio`, registrar Bajo aro → 2 fallado y comprobar un intento/«Sincronizado». Primera escritura pendiente de confirmación; ante error detener sin repetir.
- Primera escritura posteriormente confirmada por el usuario: «Un intento y Sincronizado». Equipo/miembro, partido y un evento ficticios creados mediante SDK desde Safari con confirmación del servidor; no se extrae aún inventario administrativo. Se pide al ordenador recuperar ese equipo/partido existente y un intento, con la misma cuenta y activación manual, sin crear ni registrar nada nuevo. Quedan recuperación cruzada y resto de pruebas físicas; las afirmaciones anteriores de cero escrituras describen el estado previo a esta confirmación.
- Recuperación cruzada confirmada: «Veo el mismo partido, un intento y Sincronizado» en el ordenador. Equipo/partido existentes recuperados con la cuenta exclusiva, sin duplicados visibles. Se indica un único tiro desde el ordenador (Bajo aro → 2 anotado), esperando dos intentos/Sincronizado en ambos; resultado pendiente. Aún no se dan por probados desconexión/recarga, estadísticas, Deshacer/borrado ni ausencia de parpadeo físico.
- Incidencia del recorrido inverso: ordenador con dos intentos, iPad con uno; el usuario solo vio ambos actualizados tras recargar el ordenador. Confirma ahora dos/Sincronizado en ambos. Se pausa cualquier nuevo tiro/Deshacer/borrado. Lectura administrativa exclusiva del fixture confirma dos eventos, cero lápidas y partido vivo `0f901d0f-9885-499d-b40d-2e0234f51ad0`; segundo evento recibido por servidor 287 ms después de su fecha local. Sin pérdidas/duplicados en ese inventario; no se da por probado refresco automático ni se atribuye causa sin comprobar tiempo de espera/visibilidad. Sondeo de cinco segundos más red. Revisión local en curso, sin cambios publicados ni forzar reintentos. Véase `read-fixture.json` e informe 8B.3.
- Aclaración: Safari visible y espera ≥15 s. La actualización inversa automática no queda aprobada. Nueva prueba con dos contextos/app/IndexedDB/motor reales y transporte ficticio pasa sin recargar ni ciclos forzados: recepción/UI tras 5006 ms. No acredita Firestore/Safari físico. Se mantiene pausa de nuevas operaciones y datos conservados; pendiente instrumentar transporte/recepción real. La preparación detectó además una posible carrera al simular restauración síncrona de cuenta antes del arranque; se registra separadamente para regresión, sin atribuirle esta incidencia ni parchear/publicar sin prueba. Detenido para revisión de la incidencia; sin nuevas escrituras reales ni cambios de despliegue/reglas.

Procedimiento, comandos de retirada y evidencia en `FASE8B3_PREVIEW.md`; guía física en `PRUEBA_SAFARI_IPAD.md`. La caducidad de Hosting no borra documentos Firestore ni lápidas. Los despliegues no crearon documentos; después el usuario creó el fixture y dos eventos ficticios manualmente, con la incidencia de recepción descrita arriba. Pruebas de escritura pausadas.

## 55. Fase 8B.4 — Diagnóstico de recepción en Safari, sin cambios reales

Alcance autorizado: investigar y reproducir primero en emuladores, instrumentar localmente y preparar diagnóstico descargable. Prohibidos nuevos eventos/reintentos/borrados en el fixture real, limpieza de datos/cachés, publicación/renovación de preview, cambios de reglas, commit o push. Cumplido; esta fase no accede al equipo real ni a los perfiles deportivos. Solo GET de archivos estáticos públicos y pruebas locales.

### Hechos y causas pendientes

- Los 36 recursos de Hosting coinciden con la evidencia de `f0a4971d2c312bef`; módulos fuente inicialmente iguales, recursos no-store y sin service worker. Copia inmutable en `.test-artifacts/firebase/fase8b4/deployed/`. No identifica qué código tenía evaluado el iPad durante el fallo ni demuestra caché obsoleta.
- No existe `onSnapshot` de aplicación: `firestore-sync.js` hace lecturas de servidor; `sync-engine.js` programa el siguiente ciclo 5000 ms después del anterior. Si una lectura se queda pendiente no hay otro ciclo hasta finally. Rechazos llegan a Error; no se fuerza lectura desde caché para ocultarlos. FromCache false en los resultados correctos de Emulator.
- Tras respuesta SDK, `mergeRemote` confirma transacción y emite DOM; `refreshState` relee IndexedDB y `applyState` renderiza. Un aviso perdido podría dejar IDB actualizado y vista atrasada, pues el siguiente remoto idéntico ya no notifica tras 8B.2. Reproducido solo mediante fallo inyectado, sin probar que ocurriera en Safari.
- Focus/visibility releen solo IDB; online despierta motor. Stop cancela timer, no aborta una lectura SDK ya lanzada; guardas impiden aplicar respuestas de otro ámbito. No se atribuye a segundo plano: el usuario confirmó Safari visible ≥15 s.
- Carrera independiente demostrada al restaurar identidad durante carga CSV: snapshot inicial rechazado por versión y comparación de estado vacío impide renderizar controles. Candidata mínima en memoria recuerda último contexto aplicado; corrige ambos motores. Solo artefacto `startup-candidate-app.js`, sin aplicar al fuente ni presentar como arreglo del partido ya abierto.

### Cambios locales

Observación en `app.js`, `js/firestore-sync.js`, `js/sync-engine.js`, `js/sync-storage.js` y `js/sync-ui.js`; nuevos `sync-diagnostics.js` y `sync-diagnostics-ui.js`. Desactivado por defecto, máximo 500 entradas en memoria, campos limitados: tiempos, contadores, metadata, ámbito numérico, ciclo de vida y build. Sin tokens/UID/correos/payloads/URLs/mensajes de error. Descarga JSON técnica de solo lectura, sin datos deportivos; CSV sin cambios.

Herramientas de comparación/reproducción/fallos/arranque/preparación/candidato en `tools/firebase/*8b4*`; modo receive8b4 en emuladores y salida de parpadeo separada para no pisar la evidencia anterior. Lista de dependencias futuras de preview incluye el logger inactivo. No se regenera ni sustituye el staging publicado de 8B.3.

### Verificación

- Cuatro casos SDK/Firestore Emulator con receptor activo y cola vacía: código publicado e instrumentado en Chromium y WebKit, sin recarga ni ciclos forzados, actualización en 5,2–5,6 s y cero duplicados.
- Reconexión de lectura en ambos motores: error visible, estado local conservado y recuperación automática; cero escrituras del receptor.
- Inyección de aviso DOM perdido y lectura sin resolver: diagnóstico distingue etapas; guardado local continúa. Exportación no modifica estado/cola, sin ID del partido en el archivo. Ambos motores.
- Carrera de arranque: publicado falla y candidata en memoria pasa en Chromium/WebKit. Separada del incidente.
- Candidato: ambos motores exportan con cola vacía; si hay pendientes se bloquea antes de la app conservando attempts=0. Sin peticiones Firebase en esos tests HTTPS simulados.
- 20 grupos de regresión de sincronización/Emulator correctos, incluido Deshacer, eliminación tardía, reenvíos, conflictos, cuenta/equipo, histórico/CSV y transacción atómica; nueve suites deportivas Node correctas; privacidad/opt-in/límite de traza y dos pruebas de empaquetado correctas.
- Sin parpadeo a 1024×768 y 390×844: cero retiradas de botones/falsos Guardando/deshabilitaciones, selección y foco conservados. WebKit automatizado no equivale a Safari físico.

### Candidato para revisión y siguiente autorización

Preparado `diagnostic-candidate/public/`, 38 archivos, build `8b4-256eb8ba4e2907e6`; configuración separada `firebase.diagnostic.preview.json`, solo Hosting. No se ha desplegado. Exige origen/base v2/activación existentes, no migra ni crea base; si hay pendientes se detiene. Bloquea controles de escritura/reintento y SDK send/createTeam. El motor generado solo observa: no materializa remoto, modifica arrendamientos/caché, envía, confirma o marca operaciones; muestra Solo lectura tras una respuesta. El diagnóstico descargado recoge solo conteos y trazas.

Falta autorización expresa para publicar ese candidato en el mismo canal/origen, sin modificar eventos ni ampliar la caducidad del 18 de octubre a las 09:38 de Madrid. Si caduca, no renovar sin permiso adicional. Propuesta: abrir con los dos eventos existentes, Safari visible 60 s, anotar iPad/iPadOS y descargar diagnóstico; sin crear/deshacer/borrar eventos, limpiar datos o reintentar. Este modo de solo lectura no puede acreditar el recorrido completo de un alta nueva: si no reproduce el fallo, la causa sigue pendiente y haría falta otra prueba explícitamente autorizada.

Informe y protocolo completos en `FASE8B4_DIAGNOSTICO.md`. Detenido para revisión; no dar por resuelto el fallo físico.

## 56. Fase 8B.5 — Publicación diagnóstica limitada y observación física pendiente

El usuario autoriza el candidato existente de 38 archivos únicamente en `ipad-8b2`, sin ampliar vencimiento, cambiar reglas/Pages/live, escribir eventos reales o aplicar la corrección candidata de arranque. No se regenera el candidato ni se cambian sus hashes/build. Publicación completada, detenida para prueba manual.

- Revisión recursiva y por hash: 30 archivos idénticos a 8B.3 y ocho cambios/nuevos de trazas, controles y bloqueos readonly, inventariados individualmente en `FASE8B5_DIAGNOSTICO_FISICO.md`. Sin documentación interna, pruebas, manifiestos ni credenciales privadas en public. Hosting añade dos recursos públicos init.js/init.json; sus hashes son iguales a baseline. Verificados por API los hashes gzip de los 38 archivos propios y ausencia de otras rutas.
- Preflight real: canal vigente, proyecto/sitio `registro-defensivo`, reglas publicadas coincidentes con las previstas, mismo ruleset/hash de 8B.3. Solo metadatos/reglas, sin consultar documentos deportivos desde herramientas. La protección sigue en Rules y cuenta exclusiva; no se confía en una bandera cliente como autorización.
- Arranque exige activación y base v2 previas; no crea ni migra la base. Cualquier cola pendiente detiene antes de importar app/Auth. Bloquea registro, nuevo partido, Deshacer, borrado, importación, reintento, cambios de partido/equipo y creación de equipo. Restauración/renovación Auth conservadas; cambios manuales de identidad bloqueados durante la observación.
- Segunda barrera: adaptador send/createTeam rechaza antes de escritura SDK. Motor no envía/ack/fail/retry/merge ni modifica arrendamientos/caché. Consulta servidor y muestra Solo lectura; no presenta una incorporación inexistente como Sincronizado. No se aplica la candidata independiente de arranque.
- Despliegue a `https://registro-defensivo--ipad-8b2-40nbq9cf.web.app`, build `8b4-256eb8ba4e2907e6`, versión `b7a7d00cc1e5587b`, `2026-10-17T15:38:25.856Z`. Caducidad antes/después exactamente `2026-10-18T07:38:46.623547158Z` (18 octubre 09:38 Madrid). Se usan upload/release de CLI 15.11.0 sin wrapper de renovación TTL; crear/renovar canal, Auth y live están bloqueados expresamente.
- Guardas iniciales detienen antes de release por formato con número de proyecto y supuesto fileCount; se inspeccionan respuestas reales y se comprueban rutas/hashes antes de reutilizar la subida finalizada. Versión adicional `9d9769e305a10510` quedó sin publicar en Hosting; no se elimina. No son eventos Firestore.
- Repetidos cuatro casos de candidato en Chromium/WebKit: descarga readonly con cola vacía y bloqueo con pendientes conservando attempts=0; send/createTeam rechazados con SDK dobles antes de escribir. Privacidad/opt-in/límite de traza: una prueba Node correcta. No son OAuth ni Safari físicos.
- Verificación HTTPS posterior: 38 hashes coincidentes; no-store/nosniff/noindex, ocho rutas internas/privadas 404. Hosting sirve su noindex en lugar del nofollow adicional configurado. Dos navegadores efímeros sin activación bloquean antes de app, cero bases creadas y cero peticiones Firebase. No se usan los perfiles con evidencia.
- Operaciones reales de herramientas limitadas a Hosting/metadatos/reglas/GET públicos. Cero escrituras Firestore, cambios de reglas o datos deportivos, limpieza de bases/cachés/lápidas, commit o push. Fuentes generales Sync false/false/false; Pages y live no cambian.

Diagnóstico local en memoria, máximo 500 entradas, sin tokens/UID/correos/nombres/IDs deportivos/payloads/URLs. Descarga técnica explícita `diagnostico-sync-8b4.json`, sin telemetría. Registra versión, ciclos/timers, inicios/resultados/errores SDK y metadata, conteos remotos/locales, render, visibilidad y conectividad detectada. En esta copia la incorporación remota está deliberadamente bloqueada; no se interpreta su ausencia como nueva avería.

Pendiente usuario: abrir el mismo enlace en Safari conservando base/sesión; comprobar build en ⋯; anotar intentos iniciales, modelo/iPadOS/hora; dejar visible 60 segundos sin operaciones, recarga o cambio de conexión; descargar mediante ⋯ y adjuntar archivo. Si hay bloqueo, sesión no restaurada o build distinto, detenerse sin borrar ni reintentar. No generar cambios desde el ordenador. Si ya muestra dos eventos al inicio, no reproduce un alta remota nueva. Causa física y validación de actualización automática siguen pendientes de evidencia/prueba posterior autorizada; no se declaran resueltas.

Recibos e inventarios en `.test-artifacts/firebase/fase8b5/`; informe y protocolo exactos en `FASE8B5_DIAGNOSTICO_FISICO.md`. La caducidad de Hosting no elimina documentos Firestore ni lápidas. No renovar ni limpiar sin nueva autorización.

### Diagnóstico aportado desde el ordenador, no desde Safari

El usuario adjunta `diagnostico-sync-8b4.json` y confirma que se descargó del ordenador. No se considera evidencia de Safari físico. SHA256 `79aefd00cb8eaeccb6c477f6017cde676c1c9042c407543a54488ca98d0c6dc5`; build correcto, 325 entradas sin descartes durante 86,714 s. Análisis local reproducible en `tools/firebase/analyze-trace8b5.mjs`, copia/resumen en artefactos 8B.5, sin red ni modificación del original.

17 ciclos iniciados y 16 completos; 86 respuestas SDK de servidor sin pendientes ni errores, 17 consultas de eventos con dos documentos y cola siempre vacía. IndexedDB al exportar: un partido y dos eventos; render de esos dos a los 1849 ms, anterior a primera respuesta remota de eventos (2186 ms). Un SCOPE_CHANGED al cambiar ámbito de arranque queda seguido 9 ms después por el render correcto. La última consulta incompleta solo llevaba 24 ms al descargar: no prueba un atasco. No se registran paradas de motor ni cambios de visibilidad/conectividad; blur/focus mantienen visible/online=true.

Esta captura acredita lectura remota periódica y estado local/render coherentes **en el ordenador**, sin demostrar recepción de un alta nueva, ausencia visual de parpadeo o causa del fallo del iPad. Incorporación deliberadamente bloqueada en el candidato readonly. Sigue pendiente descargar directamente en Safari físico, con modelo/iPadOS y conteos observados, sin operaciones deportivas. No se cambia aplicación/despliegue ni se consulta o escribe en Firebase al analizar el archivo. Caducidad sin ampliar.

### Archivo del iPad recibido después

El usuario aporta `diagnostico-sync-8b4_IPAD.json` en respuesta al protocolo físico. SHA256 `e85e30c21ba1a32c6da0eb7c1ec0dd4b1e84e94002a08027d7f7e90ce75cf5ca`, distinto del ordenador; build esperado. No contiene identificación de modelo/iPadOS: procedencia tomada del contexto del usuario, sin inventar datos técnicos. Captura de unos 59,1 s, 202 entradas sin descartes. Diez ciclos iniciados y completos, 53 lecturas iniciadas/respondidas, todas de servidor sin pendientes y sin errores SDK/motor. Diez consultas de eventos con dos documentos; un partido y dos eventos locales del activo; cola siempre cero, sin envíos.

Intervalo entre ciclos 5,695–6,093 s (mediana 5,767), pulls de 690–1072 ms; compatible con cinco segundos después de cada ciclo. Más lento que la captura del ordenador, sin acreditar causa de esa diferencia ni explicar el fallo original. Un SCOPE_CHANGED durante restauración (2055 ms) queda seguido 47 ms después por render de los dos eventos. No hay parada o cambio de visibilidad/conexión registrado. Modelo/iPadOS y observación visual humana pendientes.

Las etapas de consulta/entrega funcionan en esta ventana para datos existentes. El render local con dos eventos ocurre a los 2102 ms, anterior a la primera respuesta remota de eventos (2845 ms): no hay alta nueva. Incorporación remota bloqueada deliberadamente, sin prueba de las etapas de merge/actualización visual por cambio nuevo. No se demuestra el fallo original ni su resolución, ausencia visual de parpadeo o ausencia de duplicados deportivos solo por conteos.

Herramienta de análisis ampliada con --ipad para evitar sobrescribir evidencia del ordenador; copia `ipad-diagnostic.json` y resumen `ipad-trace-summary.json` en artefactos 8B.5. Solo lectura de JSON y archivos locales de evidencia/documentación: sin red, cambios de app/despliegue, operaciones Firebase, modificaciones de base/caché, renovación, commit o push. Se detiene para revisión. Para cerrar el incidente falta prueba física expresamente autorizada con incorporación habilitada y un único evento ficticio nuevo desde otro dispositivo, bajo instrumentación, sin recarga ni pérdida de los dos conservados. Antes habrá que revisar y autorizar su paquete/publicación; la autorización readonly actual no la cubre. No renovar canal automáticamente.

## 57. Fase 8B.6 — Recepción remota y registro único autorizado

El usuario autoriza actualizar el canal vigente, habilitar incorporación remota en Safari y un único evento ficticio desde ordenador en el partido conservado. No autoriza segundo registro, borrados, Deshacer, migración, renovación, reglas, producción/Pages, commit o push.

- Canal vigente confirmado y reglas exactas del ruleset anterior, sin cambios. Lecturas solo del fixture iPad: un partido vivo, los dos IDs originales esperados, cero lápidas. Guardadas huellas de payload/timestamps para comprobar conservación después del tercero. No se usa la captura antigua como sustituto de la preparación física actual.
- Candidato de 39 archivos: 35 idénticos al diagnóstico 8B.5; cambian bootstrap, motor, exportador técnico y nuevo módulo temporal `js/diagnostic8b6.js`. No contiene herramientas/docs/pruebas/credenciales; manifiesto fuera de public. Raíz false/false/false. Sin corrección de arranque ni sondeo adicional.
- Safari mantiene send/createTeam del transporte rechazados, cola sin procesamiento, controles deportivos/borrado/Deshacer/importación/reintento/cambios de ámbito bloqueados y preflight de base v2 existente/cola global cero. Comprobar preparación valida servidor, identidad exclusiva, equipo/miembro/partido, exactamente dos IDs y payloads iguales al local, pantalla dos y cola cero. Hasta preparar no hace merge. Después solo incorpora del fixture dos originales o esos dos más el ID reservado; rechaza lápidas, otros partidos/eventos/cuentas, payloads originales cambiados o conflicto, sin forzar resolución.
- Modo ordenador por URL específica, misma identidad/datos verificados; botón exclusivo de un único 2 fallado con ID estable `prueba8b6-95424bdd-8861-43b2-a547-a7afab568e64`. Marca intento persistente antes de escribir; doble toque/recarga/error no habilitan otro. Transacción SDK cliente online maxAttempts=1, lee padre/miembro/originales/evento reservado/lápidas y solo set del evento nuevo. No update/delete de originales ni cola general. Respuesta servidor de tres IDs esperados antes de mostrar confirmación. La seguridad efectiva sigue en Rules, no en el parámetro/bandera.
- Emulator final, paquete candidato con conexión Auth/proyecto/origen simulados y dos IDB independientes: Chromium 4120 ms y WebKit 4690 ms para 2→3 sin recarga/ciclo forzado; servidor/local tres IDs distintos, cola cero, sin envíos del receptor, trazas completas. Repetición/recarga del emisor y llamada al escritor desde receptor rechazadas; pendientes detienen conservando attempts=0; controles prohibidos bloqueados. El harness necesitó HTML loopback real por CORS confirmado y una única instancia SDK por navegador, sin parches al producto. No equivale a Safari físico/OAuth real.
- Publicado con autorización `2026-10-17T16:11:06.860Z`, build `8b6-7e84948603a7340a`, Hosting `66b5b0e84b947945`. Caducidad antes/después exacta `2026-10-18T07:38:46.623547158Z`; sin wrapper de ampliación TTL, live intacto. HTTPS: 39 hashes correctos, diez rutas privadas 404, no-store/nosniff/noindex; navegador vacío bloquea sin base ni solicitudes Firebase. No se prueban perfiles deportivos mediante automatización.

El usuario confirma **«Ambos preparados: 2 / 2 / 2 y cola 0»** tras comprobar el build nuevo y pulsar Comprobar y preparar recepción/ordenador en sus mismas sesiones. Queda acreditada manualmente la preparación física y el estado inicial de ambos; no es todavía confirmación de creación/recepción del tercero. Se indica el único clic previamente autorizado desde el ordenador, con Safari visible y sin recargar, seguido de descarga de ambos diagnósticos. No se pide repetir preparación ni autorización. URLs y protocolo exactos en `FASE8B6_INCORPORACION_REMOTA.md`. Si aparece discrepancia o canal caducado, detenerse sin renovar/reintentar ni corregir datos.

Estado real al documentar: cero eventos nuevos de esta fase, originales conservados. Próximo paso tras preparación confirmada: un clic en ordenador, esperar Servidor confirmó 3 eventos, Safari visible máximo 60 s sin recarga y descargar traza antes de cerrar incluso si falla. Comprobar consulta→validación→merge→estado→render, servidor tres IDs, huellas originales y colas; una prueba positiva no cierra definitivamente el fallo. No se borra nada al terminar. Sin nuevas reglas, migraciones, Pages, commit o push.

Herramientas/artefactos separados en `tools/firebase/*8b6*` y `.test-artifacts/firebase/fase8b6/`; auxiliares anteriores ampliados con salida separada para preservar evidencia. La caducidad de Hosting no elimina los documentos o lápidas de Firestore. Preparación publicada; prueba real pendiente de pasos humanos.

### Registro único real y recepción manual favorable; trazas pendientes

El usuario comunica «Tardó poco un par d esegundos» tras el paso del único clic y observación de tres intentos en Safari sin recargar. Confirmación manual y tiempo aproximado, sin convertirla en medición exacta del logger. Lectura acotada del fixture a `2026-10-17T16:20:18.616Z`: tres documentos, exactamente los dos originales más `prueba8b6-95424bdd-8861-43b2-a547-a7afab568e64`, 2 fallado, creado en servidor a `16:19:26.032Z`; partido vivo y cero lápidas. PayloadHash y timestamps de originales idénticos a baseline. Sin duplicación de documentos en ese inventario. No se deducen colas finales ni unicidad local desde una lectura administrativa.

Comparación local reproducible en `verify-fixture8b6.mjs`; evidencia `read-fixture-after.json` y `server-verification.json`, preservando baseline. Pendientes los diagnósticos 8B.6 de iPad y PC, descargados antes de recargar/cerrar, para contrastar consulta/merge/estado/render, tiempo y colas finales. Se conserva el único evento nuevo, sin repetir, borrar, deshacer o reintentar. La incidencia original no se declara definitivamente resuelta por esta prueba favorable. Esta continuación solo lee el fixture real y actualiza evidencia/documentación; sin nuevos despliegues, reglas, producción, commit o push.

### Cierre tras recibir ambas trazas

Se reciben y analizan como datos `diagnostico-sync-8b6_IPAD.json` y `diagnostico-sync-8b6_PC.json`, build exacto, ambas preparadas inicialmente con dos, armed=true y frozen=false. SHA256 iPad `241cde6e0d3e526ba3adaaf3804bb3ad68c4416cca8282c674c0eda16d09c5a7`, PC `60b9a6ba59c71665a2aeb9e87af086989f910d3a83ba8af29e95cdf79a212113`. Copias/evidencia 8B.6 separadas de 8B.5.

- Safari conserva consulta de dos y posterior de tres (`16:19:29.060Z`, fromCache=false), pull validado, merge iniciado, commit changed=true (`16:19:29.408Z`), aviso recibido por app, estado con tres y render (`16:19:29.429Z`). **368 ms monotónicos** desde respuesta de eventos hasta render, 8 ms de merge y 21 ms de commit a render. Incluye las relecturas finales de lápidas/padre antes del merge. Las cinco etapas se completan sin recarga o wake registrado en ese tramo; no hay fallo reproducido.
- Archivos finales de ambos: un partido seleccionado, tres eventos locales, tres IDs distintos, pantalla tres, cola cero. iPad sin intento de escritura, PC con intento consumido. 117 respuestas SDK retenidas en iPad y 115 en PC, todas de servidor sin pendingWrites. Sin errores o envíos del motor en el tramo retenido. Se concilia con el inventario real: tres documentos exactos, originales intactos y cero lápidas.
- Límite explícito: el búfer circular conserva 500 entradas por archivo y descarta 562 iPad / 942 PC. La confirmación de envío y primer render de tres del PC ya no están; no se inventa su secuencia. Sí queda completa la transición crítica de Safari. No certifica ausencia de errores anterior al tramo, ausencia visual de parpadeo o modelo/iPadOS. Restar timestamp de servidor y render da unos 3,397 s entre relojes distintos, referencia no exacta; medida fiable dentro de Safari es 368 ms. Tiempo humano aproximado: un par de segundos.
- Análisis reproducible local `tools/firebase/analyze8b6.mjs`, informe `trace-analysis.json`, sin red ni nuevas operaciones Firebase, app o despliegue. Originales conservados; el recibo server-verification anterior mantiene su estado histórico pending, sustituido en el cierre por la evidencia consolidada.

**Validación puntual real 8B.6 favorable; fase detenida para revisión.** Un solo evento ficticio autorizado consumido, sin pérdida o duplicación observadas en esta prueba y colas finales vacías. La causa original sigue sin demostrarse y no se declara resolución definitiva. No se corrige código adicional, activa producción, repite registro, renueva canal o modifica reglas. Se conservan tres eventos, partido y lápidas; sin commit/push y sin iniciar la siguiente fase.

## 58. Fase 8B.7 — Estabilidad de Safari: preparación y publicación controlada

El usuario autoriza hasta tres eventos ficticios nuevos en el mismo fixture para A visible, B segundo plano unos 30 s y C desconexión/reconexión. Exige revisión favorable por escenario, máximo 60 s desde confirmación y conservación de trazas iniciales, sin registros repetidos, Deshacer, borrado, migración, reglas, producción o commit/push. Si es necesaria una nueva publicación o caduca el canal, obliga a detenerse y solicitar permiso antes de desplegar.

- Revisión demuestra que 8B.6 es insuficiente: preparación fija en dos, máximo tercer ID y marcador de intento consumido; un cuarto sería discrepancia. Búfer circular de 500 pierde entradas. No se eluden guardas ni se limpian marcadores; se prepara un candidato local concreto y se detiene antes de publicar.
- Lecturas reales inicial y final (17:17/17:26 UTC): `ipad-8b2` vigente, Hosting `66b5b0e84b947945` sin cambios, vencimiento exacto `2026-10-18T07:38:46.623547158Z`, live sin release. Reglas coincidentes, mismo ruleset/hash anteriores. Fixture: tres IDs distintos, partido vivo, cero lápidas; payloadHash y timestamps de los tres idénticos al cierre 8B.6. Cero eventos nuevos de 8B.7, ninguna escritura real de herramientas.
- Candidato `8b7-834293ccb97ae892`, 39 archivos, 34 iguales; modificados bootstrap, motor, logger y descarga, sustitución del módulo de control 8b6 por 8b7. Configuración separada solo Hosting, manifiesto/herramientas/docs fuera de public, sin credenciales privadas; raíces false/false/false. No publicado y sin corrección especulativa/arranque ni otro sondeo.
- Safari conserva bloqueos de envíos/cola/registro/Deshacer/borrado/importación/reintento y valida datos antes de merge. Cuenta exclusiva, mismo equipo/partido, tres originales y hasta tres IDs nuevos fijos. Inicial/final por etapa: A 3→4, B 4→5, C 5→6. Emisor SDK cliente, un intento persistente por ID/escenario, maxAttempts=1, solo set de nuevo documento, sin actualización/borrado de los previos. Sin avance automático: requiere cierre local/servidor/pantalla coherentes, cola cero y confirmación humana de revisión de ambos antes de pasar. Discrepancia bloquea registro/avance. Rules siguen siendo la autorización efectiva, no las banderas.
- Retención: hasta 10.000 entradas por escenario, preserva primeras; saturación visible detiene la prueba activa. Antes del siguiente archiva copia inmutable y crea nueva traza. Descarga explícita incluye anteriores y actual, solo en memoria y sin PII/IDs/payloads/tokens/URLs; no escritura IDB ni envío de telemetría. Descargar tras cada caso; no promete supervivencia a desalojo de pestaña. Prueba Node correcta de límite, overflow, privacidad y copia previa no mutada.
- Emulator final con SDK oficial/demo y dos contextos: Chromium A 4827/B 3544/C 3759 ms; WebKit A 4598/B 6445/C 5651 ms, desde clic a cifra final incluyendo emisor/reconexión. Cada caso cuatro/cinco/seis únicos y cola cero, tres originales ficticios intactos, sin envío de motor receptor; repetición/recarga no duplica, límite tres, pendientes o discrepancia bloquean. Archivado 0/1/2 y dropped=0. B solo simula visibilidad, C corta SDK y espera unavailable antes de reconectar; no son Safari físico ni corte de Wi-Fi. Sin errores A/B; unavailable esperado C y recuperación, sin fallos Auth/permisos en esas trazas.

Protocolo y tabla de escenarios **físicos pendientes** en `FASE8B7_ESTABILIDAD_SAFARI.md`; no se afirma que estén aprobados. Plan: publicar solo con permiso específico/canal activo, verificar build/cuenta/ámbito y cifras iniciales, guiar una única alta por caso desde ordenador. Descarga y revisión A antes de B, B antes de C; ante fallo conservar y detener. Tiempos de confirmación entre PC/servidor/iPad informados con límite de relojes distintos; tiempos internos de Safari monotónicos. Verificación readonly posterior por escenario mantiene inventarios y huellas separados. Sin recarga manual, limpieza o forzado de sincronización.

Si los tres casos físicos pasan, recomendar fase separada de Safari emisor online/offline/outbox y persistencia, concurrencia/cuentas/seguridad, controles en horizontal/CSV/histórico, revisión del arranque y, con autorización diferente y otro partido ficticio, Deshacer/borrados/lápidas; después piloto acotado antes de lanzamiento. No se ejecutan ahora ni se identifica/resuelve por conjetura la causa original.

Archivos y evidencia separados `tools/firebase/*8b7*`, `firebase.diagnostic8b7.preview.json`, informe y `.test-artifacts/firebase/fase8b7/`. Helpers de emuladores/lector readonly ampliados sin sobrescribir fases anteriores. Falta permiso **solo de publicación** del candidato exacto de 39 archivos en el `ipad-8b2` todavía vigente, manteniendo exactamente su caducidad. Los eventos ya están autorizados; ningún despliegue/renovación, escritura real, regla, Pages, eliminación, commit o push realizado en esta preparación. Detenido antes de publicar para revisión del usuario.

### Publicación posterior expresamente autorizada; pendiente preparación física A

El usuario responde «Sí» a publicar el candidato exacto sin renovar. Preflight actualizado a `2026-10-17T17:35:20.298Z` confirma canal vigente, reglas coincidentes y versión 8B.6 esperada. Publicado a `17:36:48.609Z`, build **`8b7-834293ccb97ae892`**, Hosting **`c64f791bfdcd2552`**, solo `ipad-8b2`. Vencimiento exacto antes/después **`2026-10-18T07:38:46.623547158Z`**, 18 de octubre 09:38 Madrid, live y reglas intactos, sin renovación/Auth/Pages. `deploy8b7.mjs` utiliza prepare/upload/release con canal explícito, bloqueos de operaciones no autorizadas, comprobación de build/Emulator y de inventario antes de release. Dos recursos públicos generados por Hosting permanecen idénticos, además de los 39 archivos del candidato.

HTTPS posterior: 39 hashes/cabeceras correctos y 11 rutas privadas/internas 404; Chromium y WebKit vacíos bloqueados antes de crear base o solicitar Firebase. `verify-deployed8b5.mjs --8b7` guarda evidencia separada. No se modificó el candidato aprobado, no se incorporó corrección de arranque, no se registraron eventos reales nuevos ni se procesó cola. Sin reglas nuevas, borrados, migración, limpieza, commit o push.

Escenarios físicos A/B/C todavía pendientes. Próximo paso: mismas sesiones exclusivas, Safari URL habitual y ordenador `?fase8b7=ordenador`; verificar build exacto y pulsar «Preparar escenario A» en ambos, esperando Firebase/local/pantalla 3, cola cero. No registrar antes de comprobar la preparación humana, ni avanzar a B sin revisar trazas/cierre A. Causa original aún desconocida. El canal caduca sin borrar documentos ni lápidas de Firestore.

Confirmación posterior: usuario «Funciona» ante preparación A en ambos con tres/cola cero; se toma como estado inicial manual confirmado. Metadatos readonly a `17:40:42.205Z` mantienen versión y caducidad autorizadas. Se guía un único clic A en ordenador, Safari visible y máximo 60 s desde confirmación de cuatro, sin recarga. Resultado/tiempo/trazas pendientes; no se declara A superado ni se inicia B. Ninguna escritura deportiva ejecutada por las herramientas en esta continuación.

### Cierre favorable A tras recibir trazas físicas

Se reciben diagnósticos 8B.7 IPAD/PC y se analizan como datos con `analyze8b7.mjs`; evidencia por escenario, sin sobrescribir 8B.6. Build y roles correctos, preparación con tres íntegra; 1809/1865 entradas, cero descartes/overflow/errores. PC un único registro confirmado a `17:47:57.470Z`; iPad respuesta de servidor con cuatro `17:47:59.509Z`, validación/merge/commit/aviso/estado y render con cuatro `59.866Z`. **357 ms** monotónicos respuesta→render, 7 ms merge y 19 ms commit→render. Ack PC→render ≈2396 ms entre relojes distintos (aproximado). Sin cambio de visibilidad/recarga en receptor durante la traza; finales ambos con cuatro IDs locales distintos, pantalla cuatro, cola cero y cierre correcto, sin envíos del motor receptor.

Inventario real acotado readonly a `17:51:54.282Z`: exactamente tres originales más ID reservado A, originales intactos por hash/fechas, vivo y cero lápidas; verificador A correcto. Un evento real nuevo consumido de los tres autorizados; B/C no ejecutados. Observación: consulta anterior Safari de 30075 ms completada sin error y consulta en curso de unos 9,4 s al exportar, posteriores al cierre ya correcto; no se ocultan ni se atribuye causa sin evidencia. Ausencia visual de parpadeo/modelo/iPadOS no certificadas por JSON; causa original desconocida.

Canal vigente/version/caducidad idénticos contrastados a `17:52:39.662Z`. A favorable permite preparar B en las mismas páginas: Continuar tras revisión y Preparar B, esperando Firebase/local/pantalla cuatro y cola cero. No registrar B antes de confirmar preparación ni avanzar C antes de revisar B. Análisis sin nuevas escrituras, despliegues, reglas, limpieza, Deshacer, borrados, migración, commit o push.

Preparación B confirmada manualmente por el usuario («Sí»): ambos cuatro/cola cero. Se guía segundo plano de Safari unos 30 s y único clic B en ordenador, retorno inmediato tras confirmar cinco, sin recarga y máximo 60 s desde confirmación. Descarga/revisión de ambas trazas antes de C; ante fallo no repetir. Resultado real B aún pendiente, sin escrituras deportivas ejecutadas por las herramientas.

### Cierre favorable B tras recibir trazas físicas

Archivos IPAD2/PC2 del usuario: build y roles correctos, escenario B, inicio cuatro y cierre correcto en ambos, cinco IDs locales distintos/pantalla cinco/cola cero. 322/464 entradas actuales, dropped=0, sin overflow/errores; archivos A previos íntegros como prefijos exactos de los archivos archivados (2761/2906 entradas). `analyze8b7.mjs` añade comprobación local de esa conservación y métricas de visibilidad, sin modificar publicación.

Safari oculto `17:56:32.680Z`→visible `17:57:02.459Z`, **29780 ms**. PC confirma su único B `17:56:44.619Z` con Safari detrás; vuelta completa unos 30 s totales, registro unos 12 s después de ocultarlo. Consulta tombs-before de 30083 ms abarca ese periodo, responde de servidor sin error; duración no identifica causa. Respuesta de cinco a `17:57:05.584Z`, commit `05.907Z`, estado y render `05.919Z`: **3461 ms desde regreso visible**, **336 ms respuesta→render**, 5 ms merge y 13 ms commit→render. Ack PC→render ≈21,3 s con relojes distintos, incluyendo segundo plano y dentro del máximo 60 s. Sin recarga o reinicio observado, sin duplicados/envíos del motor/errores de permisos.

Inventario readonly de `17:58:41.455Z`: cinco IDs exactos, único nuevo B, tres originales y A intactos por hash/fechas, partido vivo y cero lápidas. Dos de tres eventos autorizados consumidos. B favorable; C pendiente. Metadatos `17:59:18.373Z` mantienen canal vigente/versión/caducidad. Próximo paso humano: Continuar tras revisión B y preparar C en ambos, esperando cinco/cola cero antes de cortar red o registrar. No nuevos despliegues/escrituras de herramientas, reglas, Pages, limpieza, migración, Deshacer, borrado, commit o push. Causa original desconocida, parpadeo visual y modelo/iPadOS no acreditados por JSON.

Preparación C confirmada por el usuario («Funciona»): ambos cinco/cola cero. Se guía corte únicamente de Internet del iPad conservando página, ordenador conectado por vía independiente, único clic C y reconexión inmediata del iPad tras confirmar seis; sin recarga/reintento y máximo 60 s desde confirmación. Cierre/descarga de ambos solo después de recepción; ante fallo conservar y detener sin repetir. Es el tercer y último evento autorizado; resultado C todavía pendiente y ninguna escritura deportiva ejecutada por herramientas en esta continuación.

### Cierre favorable C y ronda 8B.7 completa

Recibidos IPAD_C/PC_C, build/roles correctos, preparación cinco y cierre seis en ambos, seis IDs locales distintos/pantalla seis/cola cero. Trazas de 608/856 entradas sin descarte/overflow; archivos previos A/B conservados íntegramente. iPad offline `18:04:21.357Z`→online `18:04:47.481Z` (**26123 ms**); PC confirma único C `18:04:27.734Z` durante corte. Cuatro consultas fallan unavailable (ocho entradas contando errores de ciclo), dentro de desconexión deliberada; sin Auth/permisos o errores inesperados. Se conservan y clasifican explícitamente, sin ocultarlos.

Respuesta de seis servidor `18:04:47.748Z`, commit IndexedDB `47.882Z`, aviso/estado y render `47.896Z`: **416 ms desde online**, **148 ms respuesta→render**, 10 ms merge y 14 ms commit→render, monotónicos. Ack PC→render ≈20,162 s entre relojes distintos incluyendo corte, dentro de 60 s. Recuperación automática sin recarga/reintento; ninguna escritura del receptor/envío del motor. Lectura larga completada (máximo 29669 ms) no permite atribuir causa original.

Inventario readonly `18:07:18.646Z` y verificador C: exactamente seis IDs previstos, tres originales y A/B intactos por hash/fechas, único nuevo C, partido vivo y cero lápidas. Tres eventos nuevos autorizados consumidos desde SDK cliente PC, ninguno adicional; herramientas de cierre solo analizan/leen y documentan. Se conservan todos los datos; sin limpieza, nuevo despliegue/renovación, reglas/Auth/Pages, migración, Deshacer/borrado, commit o push. Evidencia por escenario en `FASE8B7_ESTABILIDAD_SAFARI.md` y artefactos separados; analizador local ampliado con conectividad/errores esperados, sin tocar candidato publicado.

**A/B/C favorables, fase detenida para revisión.** Demostrada recepción Safari puntual sin recarga, no resolución definitiva del incidente original ni sincronización completa como emisor. Próxima recomendación, no ejecutada: fase autorizada con nuevos ficticios para Safari emisor online/offline/outbox/reapertura, concurrencia/cuentas; otro partido para Deshacer/borrados/lápidas; revisión separada de arranque, controles en horizontal/registro/estadísticas/CSV/histórico, modelo/iPadOS, visuales y seguridad antes de piloto limitado. No más registros ni activación pública bajo el permiso actual. Caducidad 18 de octubre 09:38 Madrid no elimina documentos/lápidas.



## 59. Fase 8C — Primera publicación interna con sincronización

El usuario autoriza preparar, commit, push y publicar Google/Sync en Pages sin otra ronda extensa. Se trabaja desde origin/main en publicacion/fase8c, checkout aislado, conservando develop pendiente. Diseño V4 ya publicado y funciones deportivas intactos, sin otro Dashboard. Se incluyen cuenta/cola/transporte/motor/almacenamiento y controles; se retiran trazas y módulos temporales de iPad. Corrección mínima de la carrera de arranque ya reproducida: no omitir render idéntico hasta aplicar el contexto actual; no pretende explicar el fallo remoto original.

Google opcional; activación explícita por proyecto/cuenta/navegador y selección de equipo, recordadas tras consentir. Desactivar aquí detiene el motor conservando cola/caché. Otra cuenta no hereda activación. No subir partidos antiguos al entrar; asistente solo después de revisar selección/destino y confirmar. IndexedDB sigue inmediato, con esquema v1→v2 aditivo ya probado, sin borrar/reescribir originales. Outbox y operaciones atómicas, lápidas e idempotencia; guardado local separado del acuse real de servidor. Rules validan permisos, no la bandera cliente.

Regresión acotada sobre candidato: 20 grupos SDK/Firestore/Auth Emulator, cero escrituras reales, incluyendo dos dispositivos/simultaneidad/offline/recarga/atomicidad/idempotencia/Deshacer/borrados/tardíos/importación/cuentas/equipos/pestañas/conflictos/estados. Cuatro smoke Chromium/WebKit: histórico v1 intacto tras v2, doble toque/recarga/CSV/estadísticas/Deshacer/borrado aislado/Firebase inaccesible; restauración durante CSV, controles activos y consentimiento/otra cuenta. Chromium 390×844 y WebKit 1024×768 sin overflow o errores JS. Captura horizontal revisada. Lectura real de configuración confirma Google habilitado, dominio Pages autorizado y reglas idénticas al ruleset 4bc70f67-e0ed-4fb0-b46e-7c2494eab227, sin modificarlo ni acceder a partidos para preflight.

Publicado código **403d252598940f13b066d8f667d4e4b8078ec81b**, versión **8C.0**; paquete Pages **2c49c4b8dce67de82e8d76682f760d88ce6c0d30**, build built sin error a 2026-10-17T18:27:24Z. Fuente **gh-pages/root**, misma URL https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/ y mismo origen. 35 assets más version.json público; sin herramientas, documentación interna, pruebas, perfiles, artefactos o credenciales privadas servidos. Main conserva código/documentación; commits documentales posteriores no cambian el paquete.

HTTPS a 18:28:03.146Z: **36/36 hashes**, **13 rutas excluidas 404**; SDK app/auth/firestore 12.11.0 HTTP 200. Chromium y WebKit con red/SDK reales en contextos vacíos: Google inicializa y habilita login sin errores JS; Solo local permite registrar y recargar, sin solicitudes Firestore. No se simula OAuth manual ni prueba física Safari emisor; quedan pendientes del usuario. Recibos locales fase8c excluidos de Git/Pages. Ocho archivos runtime 8C se reflejan en develop tras comprobar que sus fuentes no habían cambiado, preservando el resto del trabajo.

Referencia de reversión remota **respaldo/antes-fase8c-20261017 → 8c6667dd3f4ae7cdd93fa192ca9020e92bcb74a4**. Ante fallo grave detener Sync local y cambiar Settings → Pages a esa rama/root, confirmar build y recargar; sin force-push, borrar IndexedDB, Firestore, colas o lápidas. La versión anterior puede no mostrar copias de nube pero se conservan. Reglas y Hosting no modificados, ni fixture iPad o datos reales migrados/limpiados.

Comprobación de cinco minutos pendiente: Safari con cuenta exclusiva, activar Sync, equipo PRUEBA 8C y nuevo partido ficticio; ordenador mismo equipo/partido, un tiro desde iPad, recepción, Deshacer sincronizado y comprobar Solo local con anteriores intactos. No usar importación ni fixture de seis eventos; detener pruebas si es satisfactoria. Procedimiento detallado en FASE8C_PUBLICACION.md. No se declara causa/resolución definitiva del incidente original; primera versión interna, sin invitaciones. Publicación técnica completada y detenida para revisión, sin iniciar otra fase.

## 60. Fase 10 — Auditoría de datos y cuenta, inicio de sesión, sin indicador de guardado y vaciar partido

Tarea autorizada el 17 de octubre de 2026. Decisiones del usuario aplicadas: **«Continuar sin cuenta» se mantiene**; **datos locales al iniciar sesión por primera vez: preguntar una vez**; **al cerrar sesión, los datos de esa cuenta en el dispositivo se borran**. Referencia visual: lienzo «V4 · Actual», pantallas «Inicio de sesión» y «Menú de perfil». Copia previa: `.local-backups/fase10-cuenta-20261017-203554/` (archivo del proyecto, parche, estado Git, HEAD y hashes). Completada localmente y detenida para revisión. Sin commit, push ni despliegue.

### Parte A — Auditoría

Informe completo en [FASE10_AUDITORIA.md](FASE10_AUDITORIA.md): 0 críticos, 3 altos, 6 medios, 7 bajos. Corregidos: A1 (cerrar sesión dejaba los datos de la cuenta en el dispositivo), A2 (persistencia del navegador, mitigado con `navigator.storage.persist()`), M1 (tras un error al guardar el reintento quedaba desactivado; regresión de 8B.2 que hacía fallar la Fase 3), M2 (SDK de Google descargado siempre), M3 (respuesta remota materializada tras cambiar de cuenta), B1 (pruebas desfasadas respecto a 8C) y B2 (carrera de cierre del diálogo nuevo). Pendientes con propuesta: A3 (lecturas completas cada 5 s: cuota de Firestore), M4 (registro antes de restaurar la sesión), M5 (operación bloqueada detiene la recepción), M6 (panel sin sincronizar), B3–B7. `tools/firebase/local-browser.mjs` revelaba problemas reales (M1, M2) y además estaba desfasada (Fase 5 con versión 1 fija): se corrige el código y se adapta la prueba.

### Parte B — Inicio de sesión y perfil

- **Pantalla de inicio** (`index.html`, `cuenta.css`, `js/cuenta-ui.js`): tarjeta coral con media pista en line art, balón y «Cada tiro rival, en dos toques.»; a la derecha «Inicia sesión», «Continuar con Google» con el formato oficial de Google (blanco, borde #747775, texto #1F1F1F, «G» de cuatro colores) y «Continuar sin cuenta» con el aviso de que los datos se quedan en el dispositivo. En vertical y móvil la tarjeta pasa arriba y se reduce. El resto de la aplicación queda inerte mientras se muestra.
- **Cuándo aparece**: sin sesión ni elección previa (un script mínimo en `<head>` la muestra antes de pintar), al perder la sesión de Google o al pedirla desde el perfil. La elección se guarda en `localStorage` (`defensas-account-mode`: `google` | `local`); con «sin cuenta» no vuelve a aparecer y **no se carga el SDK ni hay peticiones externas**. El SDK solo se carga con la cuenta elegida o con la pantalla de inicio visible (el popup de Safari exige que esté cargado antes del toque). Sin Google configurado no hay pantalla de inicio.
- **Cabecera**: avatar a la derecha (foto de Google solo si es `https`, si no iniciales; sin cuenta, icono de persona). En tablet vertical el marcador, «⋯» y el avatar se agrupan a la derecha de la primera fila.
- **Menú de perfil**: avatar grande, nombre, correo, «Sesión iniciada con Google», sincronización (estado, Activar, Equipo, Crear equipo, Revisar partidos locales, Reintentar, Desactivar) y botón negro «Cerrar sesión». Sin cuenta: «Iniciar sesión con Google» (abre la pantalla de inicio). Cierra con Escape (devuelve el foco al avatar) o pulsando fuera. «⋯» queda solo con Editar panel, Exportar CSV, Vaciar partido y Eliminar partido.
- **Pregunta única** al iniciar sesión con partidos sin cuenta en el dispositivo: «Dejarlos solo aquí» o «Subir a mi cuenta» (activa la sincronización; sin equipo abre el perfil para crearlo o elegirlo; después abre la revisión con los partidos marcados, que se confirma). Se recuerda por proyecto y cuenta; si no hay partidos, no se pregunta.
- **Cerrar sesión**: `accountUnsynced` cuenta operaciones sin acuse y partidos creados con la cuenta solo aquí. Si no hay nada, se cierra directamente. Si hay algo, diálogo «Cambios sin subir» con «Salir igualmente», «Cancelar» y, si solo hay cola pendiente sin bloqueos, «Esperar» (sube y cierra al terminar). Tras `signOut` confirmado: se detiene el motor esperando su ciclo, `purgeAccountData` borra en una transacción las copias de la nube, la cola, la lista de equipos y los partidos de la cuenta sin subir, y se avisa a las demás pestañas para que repitan el borrado. Se conservan los partidos sin cuenta, los originales importados (copia de seguridad oculta) y la preferencia de equipo. Si el borrado falla, se reintenta al abrir. Volver a entrar recupera lo subido desde la nube.
- Sin pantalla de configuración.

### Parte C — Sin indicador «Guardado»

`#saveStatus` sigue siendo la región `role="status"` con «Guardado localmente» cuando termina la transacción, pero solo es visible con `is-error` («Error al guardar», cápsula coral). Los errores de guardado conservan el aviso con opción de repetir (corregido M1). Los cambios de la cuenta pendientes muestran un punto discreto en el avatar y el detalle en el perfil solo si hay un problema: bloqueados, sin conexión, con error o más de 8 s sin subir (`syncWarning`, `SYNC_GRACE_MS`). La etiqueta del avatar lo anuncia. La semántica «guardado = transacción completada» no cambia.

### Parte D — Vaciar partido

`clearGameEvents(gameId, ids)` (`js/persistencia.js`) y `clearCloudGame` (`js/sync-storage.js`): una transacción que comprueba que los tiros son exactamente los confirmados (si no, `GAME_CHANGED`, no borra nada y el diálogo se actualiza), borra todos los del partido y conserva el partido. Con cuenta, cada tiro recibe su lápida y una operación `undo` idempotente en la cola; las lápidas salen antes que las altas, de modo que un tiro vaciado que estaba en cola nunca llega al servidor. Diálogo con partido y número de tiros, «Exportar CSV antes», «Vaciar partido» y «Cancelar» destacado (foco inicial). Desactivado sin tiros. Después: Deshacer vacío, totales y marcador a cero y panel editable de nuevo. Los tiros que otro dispositivo registre sin que este los haya visto no se borran (no se confirmaron).

### Archivos

Producción: `index.html`, `styles.css`, `cuenta.css`, `app.js`, `js/cuenta.js`, `js/cuenta-ui.js` (reescrito), `js/sync-ui.js` (montado en el perfil, informa del estado, `quiesce`, `offerImport`), `js/sync-storage.js` (`clearCloudGame`, `accountUnsynced`, `purgeAccountData`, `listDeviceGames`, comprobación de cuenta en `mergeRemote`), `js/sync-engine.js` (`stop()` devuelve el ciclo en curso), `js/persistencia.js` (`clearGameEvents`), `js/interfaz.js`. Sin cambios en IndexedDB (versión y almacenes), reglas publicadas, `categorias.csv`, registro, CSV ni Estadísticas. Pruebas: nuevas `tests/fase10.html` y `tests/fase10-browser.mjs`; ampliadas `tools/firebase/cuenta.test.mjs`, `rules.test.mjs`, `sync.test.mjs`, `tests/diseno-v4/verificar.mjs` y `revision.html` (referencias del lienzo `referencia/v4-login-1180x820.png` y `v4-perfil-1180x340.png`); reescritas `local-browser.mjs`, `auth-browser.mjs` y `sync-ui.test.mjs`; adaptadas `tests/ui-fixture.mjs`, `fase3-browser.mjs`, `fase5-browser.mjs`, `config-page.html` (regenerada), `real-local.test.mjs`, `default-off.test.mjs`, `sync-auto-refresh.test.mjs`, `tools/playwright/visual.spec.mjs`, `distribucion.mjs`, `editor.mjs` y `rapido.mjs`; ayudantes `emulatorLogin` y `answerLocalData` en `browser-support.mjs`.

### Verificación

- Node: nueve suites deportivas y la de cuenta (elección recordada, pantalla de inicio, iniciales, avisos, resultado de cerrar sesión, foto solo https).
- Chromium, contextos efímeros y datos ficticios: regresiones Fase 2, 3, 5, 6 y la nueva 10 (indicador oculto con anuncio accesible; vaciar con diálogo, exportar antes, aborto real a mitad, cambio desde otra pestaña, doble toque, recarga y otro partido intacto).
- `local-browser.mjs`: primera apertura (solo hosts del SDK y Auth con la pantalla de inicio), «sin cuenta» recordado tras recargar con cero peticiones externas, siete tamaños sin peticiones externas, fallos del SDK con registro local operativo y subruta de Pages.
- Auth Emulator (`auth-browser.mjs`): inicio sin cuenta, inicio de sesión desde el perfil, pregunta única por cuenta, recarga con sesión, dos pestañas (cerrar en una cierra la otra), cambio de cuenta sin mezcla, cierre con partido de la cuenta sin subir (Cancelar conserva, Salir igualmente borra solo ese), ventana bloqueada y Deshacer local.
- Firestore Emulator: 62 comprobaciones de reglas (8 nuevas); 23 grupos de sincronización (3 nuevos: vaciado entre dos dispositivos con cola y reenvío idempotente, vaciado sin conexión con tiro en cola y recarga, borrado de datos de cuenta) más la interfaz completa con dos dispositivos: «Subir a mi cuenta» con creación de equipo, recarga con sesión, recepción, vaciado sincronizado sin recargar, sin conexión con punto en el avatar, cerrar sesión esperando la subida, cambio de cuenta, vuelta con datos recuperados de la nube y «Salir igualmente» con un cambio perdido que no llega al otro dispositivo. `review8b2`, parpadeo, recepción automática, bandera desactivada y SDK real sin sesión correctos. Cero escrituras reales.
- Medidas en 1180×740, 1133×670, 1366×1024, 820×1180 y 390×844: Registro sin desplazar en iPad (también con sesión y avatar), sin scroll horizontal, objetivos ≥ 44 px (avatar incluido), indicador de guardado oculto; pantalla de inicio sin desplazar en iPad, tarjeta a la izquierda en horizontal y arriba en vertical/móvil; menú de perfil dentro de la pantalla con y sin sesión. Distribución: 335 mediciones con los mismos pasos que 9E. Editor: 7 grupos. Playwright: 3/3.
- Consulta pública de solo lectura de Authentication: `itsasnehezkuntza.github.io` autorizado.

### Pendientes de revisión

1. Cargar el SDK de Google mientras se ve la pantalla de inicio (necesario para el popup de Safari) implica una descarga desde gstatic antes de elegir; la alternativa es exigir dos toques para iniciar sesión.
2. Al cerrar sesión se conservan ocultos los originales ya importados y la preferencia de equipo; confirmar si deben borrarse también.
3. A3 (cuota de Firestore por las lecturas completas cada 5 s): cerrado localmente en Fase 11 el 20 de octubre; pendiente de revisión y publicación (apartado 61).
4. M4 cerrado localmente en Fase 12 (apartado 62) y M5 en Fase 13 (apartado 63). Siguen pendientes M6, B4 (retirar el dominio de la vista previa tras su caducidad) y B7 (CSP).
5. Safari/iPad físico: popup de Google, persistencia, pantalla de inicio en vertical y aviso sin conexión.

## 61. Fase 11 — Lecturas de sincronización (A3)

Autorizada el 20 de octubre de 2026 al pedir empezar a cerrar los pendientes. Se aborda primero A3 y se detiene la fase para revisión antes de continuar con M4, M5, M6 o decisiones de cuenta. Copia previa de archivos principales y estado Git: `.local-backups/fase11-lecturas-20261020/`. Se conservan los cambios locales anteriores.

### Decisión e implementación

Sustituir descargas completas periódicas por `onSnapshot`: una escucha de partidos y dos por partido vivo (eventos y lápidas). `js/firestore-watch.js` mantiene en memoria lo recibido y entrega al motor solo los partidos cambiados. La primera entrega exige confirmación del servidor para partidos, eventos y lápidas; no se considera sincronizada una respuesta solo de caché o con escrituras pendientes. Los cambios despiertan el motor sin esperar cinco segundos. Los ciclos periódicos atienden cola, reintentos y arrendamiento sin descargar colecciones.

Las escuchas se cierran al detener el motor, cambiar de cuenta/equipo, desactivar Sync o abandonar la página sin caché de navegación. Al borrar un partido se cierran sus dos escuchas; si sus permisos desaparecen antes de recibir la lápida del padre, se confirma ese padre con una lectura puntual. El arrendamiento sigue protegiendo cada ciclo de envío/materialización y se libera al terminar, sin retenerlo entre ciclos. `stop()` espera tanto el ciclo en curso como la liberación. Un cierre abrupto conserva la caducidad anterior del arrendamiento (30 s).

Cada pestaña/dispositivo tiene su motor y escuchas; no se añade un líder permanente. Se mantienen las escuchas al ocultar una pestaña para evitar nuevas cargas completas al volver; se elimina el sondeo remoto completo en ambos estados. La lectura inicial, cambios, reconexiones y reglas pueden generar lecturas facturables: se elimina la repetición cada cinco segundos, sin prometer coste cero ni cuota ilimitada. Criterios contrastados con documentación oficial de [escuchas](https://firebase.google.com/docs/firestore/query-data/listen) y [facturación](https://firebase.google.com/docs/firestore/pricing).

No se modifican esquema local/remoto, reglas, históricos, IDs, configuración deportiva, guardado local, CSV ni interfaz. Compatible con clientes 8C/10, sin exigir campos o escrituras nuevos. `pull()` permanece como lectura puntual para herramientas/adaptadores previos; producción ofrece `watch()` y el motor lo elige. Módulo incluido en el paquete estático de Pages, sin publicar.

### Verificación

- **Node, 11/11 archivos de pruebas correctos:** nueve deportivos/UI existentes, cuenta y nueva suite de escuchas. Esta última verifica 30 partidos/2.100 tiros y 120 ciclos sin consultas ni suscripciones nuevas, lápidas iniciales, errores, cierres y respuestas tardías.
- **Auth/Firestore Emulator, 24 grupos correctos:** SDK oficial, dos dispositivos, simultaneidad, offline/recarga, acuse perdido, Deshacer, borrados, vaciado, importación, migración v1→v2, atomicidad, aislamiento, errores y UI completa. Temporada ficticia 30×70: 61 escuchas iniciales, 12 ciclos sin consultas/reaperturas, tiro remoto recibido y las 61 escuchas cerradas al parar. Tres comprobaciones automáticas de conectividad del SDK a una imagen de Google interceptadas y abortadas por la prueba de transporte; cero escrituras reales. Recibo: `.test-artifacts/firebase/sync.json`.
- **Batería local correcta:** regresiones de fases 2, 3, 5, 6 y 10, inicio de sesión, siete tamaños sin peticiones externas tras elegir «sin cuenta», fallos del SDK con registro local operativo, CSV y subruta de Pages. Recibo: `.test-artifacts/firebase/local.json`.
- **Paquete estático local correcto:** 36 archivos con el módulo nuevo. Sin publicación ni modificación de datos deportivos reales. `node --check` correcto en los módulos nuevos/modificados. Comprobación de espacios correcta en los documentos y empaquetador de esta fase; la revisión global conserva seis avisos previos de espacios en `app.js`, sin cambiar ese archivo.

Las pruebas se adaptan a la recepción asíncrona comprobando resultados persistidos con espera acotada, sin forzar lecturas. Recargas controladas esperan la parada; UI conserva recarga normal. El caso «vaciado en cola» detiene antes el motor para distinguir una operación todavía en cola de un envío ya en vuelo. Informe completo: [FASE11_LECTURAS.md](FASE11_LECTURAS.md).

**Cierre:** A3 corregido en el código local y verificado; Fase 11 detenida para revisión. La mejora no está publicada y no representa medición de una factura real. No se inicia M4 ni otra fase.

### Pendientes fuera de esta fase

M4 (restauración de sesión antes de registrar), M5 (cola bloqueada impide recepción), M6 (panel sin sincronizar), descarga inicial del SDK, originales importados/preferencia al salir, dominio temporal de Authentication y CSP. Safari/iPad físico, revisión de Fase 10/11, consolidación en Git y publicación siguen pendientes; esta fase no autoriza cambios reales de Auth, push o despliegue.

## 62. Fase 12 — Restauración de sesión y equipo antes de registrar (M4)

El 20 de octubre de 2026 el usuario indica «Continuamos» tras el cierre de Fase 11 y autoriza abordar M4. Copia previa de archivos principales y estado Git: `.local-backups/fase12-arranque-20261020/`. No se inicia M5. Trabajo local conservando fases anteriores y sin modificar datos deportivos reales.

### Decisiones e implementación

- Con elección recordada «Google» se muestra la pantalla existente desde el `<head>`, antes de cargar módulos. Durante la espera dice **«Recuperando tu sesión»**. CSS oculta la aplicación y los resultados antes de JavaScript; posteriormente quedan también inertes. `app.js` deshabilita los controles y comprueba el bloqueo tanto en los manejadores como antes de ejecutar una operación encolada. No se permiten tiros, Deshacer, cambios de partido, altas, vaciado, eliminación o CSV en un ámbito todavía no resuelto. Al cambiar el acceso se descarta la selección de tiro y se cierran los diálogos deportivos.
- El desbloqueo espera Auth **y la selección de equipo**. `sync-ui.js` informa `uid`, `restoring` y `restoreError`. Si hay equipo y lista verificados en caché, se permite el registro local de esa cuenta/equipo sin esperar red o descarga de tiros. Si no había equipo preferido o Sync estaba desactivada, se mantiene el ámbito local de la cuenta previsto por el modelo anterior. Si había preferencia pero falta la lista en caché, se espera a recuperarla del servidor. Un equipo ausente/sin acceso no provoca un salto silencioso a los partidos del dispositivo: se bloquea y se conserva la preferencia para reintentar.
- Error de cuenta/equipo o timeout mantienen el bloqueo, con **«Reintentar»** y **«Continuar sin cuenta»** disponibles. No se cambia automáticamente a modo local por un error. El timeout de Auth conserva el límite existente de 12 s; la vía local está disponible durante toda la espera.
- Elegir «Continuar sin cuenta» llama a `controller.suspend()`: invalida la generación pendiente, desuscribe los avisos de identidad y detiene Sync al cambiar a identidad local. Las respuestas tardías ya no cambian el modo elegido ni el destino de un tiro. No ejecuta `signOut`, no purga datos ni modifica la sesión persistida de Google; no sustituye la acción «Cerrar sesión». La elección se recuerda y en la próxima apertura no carga SDK ni hace peticiones externas. Los recursos que ya se habían empezado a cargar no se presentan como cancelados por esta elección.
- La pregunta única sobre los partidos locales se abre después de resolver el acceso, evitando un diálogo sobre la pantalla de restauración. Se mantiene el acceso con popup de Safari, sin esperas previas al toque de Google.

No cambian IndexedDB, reglas, esquema/protocolo remoto, IDs, histórico, configuración deportiva ni formato/cálculos del CSV. No se añade una dependencia ni una pantalla nueva. Informe: [FASE12_ARRANQUE.md](FASE12_ARRANQUE.md).

### Verificación

- **Arranque M4:** siete grupos correctos en `startup12.test.mjs`, con módulos/Auth/equipo retrasados, elección local y callbacks tardíos, error/reintento, equipo sin caché y servidor inaccesible, equipo ausente con/sin caché, timeout y elección local recordada. Ninguna petición externa ni escritura real. `arranque.json` y captura en `.test-artifacts/firebase/fase12/`.
- **Auth Emulator:** SDK oficial 12.11.0, restauración, dos pestañas, cuentas, pregunta única, cierre y popup bloqueado correctos. Cero solicitudes Firestore reales. Recibo `.test-artifacts/firebase/auth.json`.
- **Sincronización:** 24 grupos correctos en Auth/Firestore Emulator, incluida UI completa y temporada ficticia 30×70 de Fase 11; cero escrituras reales. Recibo `.test-artifacts/firebase/sync.json`. Recepción bidireccional automática con transporte ficticio también correcta, sin ciclos forzados ni recargas.
- **Batería local:** fases 2, 3, 5, 6 y 10, siete tamaños sin solicitudes externas en modo local, fallos SDK, CSV y subruta Pages correctos. Recibo `.test-artifacts/firebase/local.json`. **Node: 11/11 archivos correctos**, incluidos cuenta y escuchas.
- **Responsive:** restauración sin desbordamiento horizontal en 1180×740, 820×1180 y 390×844; botón local ≥44 px y sin desplazamiento en tamaños iPad. Captura 1024×768 inspeccionada. Paquete local de 36 archivos preparado y sintaxis de módulos comprobada. No se publica.

Las pruebas se adaptan al bloqueo deliberado: se distingue inicialización de desbloqueo; el DOM simulado incorpora `documentElement`; Fase 2 elige modo local. Fase 5 espera el refresco posterior al error de partido eliminado antes de exigir selección vacía y ninguna descarga, sin cambiar el comportamiento del CSV.

**Cierre:** M4 corregido y verificado localmente. Fase 12 completada y detenida para revisión. Se conservan los datos reales y el trabajo anterior; sin commit, push, despliegue ni cambios en Firebase real. Safari/iPad físico sigue pendiente.

### Siguiente fase, no iniciada

M5: apartar las operaciones bloqueadas para que no detengan la recepción. Continúan fuera M6, decisiones sobre SDK y originales/preferencia al cerrar sesión, dominio temporal de Authentication, CSP, iPad físico, consolidación Git y publicación. Detenerse para revisión al cerrar esta fase.

## 63. Fase 13 — Una operación bloqueada no detiene la recepción (M5)

Autorizada el 20 de octubre de 2026 por «Continua» tras el cierre de Fase 12. Copia previa del motor, almacenamiento, prueba de sincronización, documentos y estado Git: `.local-backups/fase13-cola-20261020/`. Se conservan fases y cambios anteriores; no se inicia M6.

### Decisiones e implementación

`sync-engine.js` deja de lanzar un error global ante una operación de cola bloqueada. Aparta las escrituras de ese partido y continúa con partidos independientes y con la recepción. También retiene el partido si una operación está en espera de reintento, para no adelantar un tiro a su alta ni a una lápida pendiente. Si el bloqueo se descubre durante el envío, se persiste antes de continuar; `failOperation()` devuelve el registro fallido únicamente al completar su transacción.

Los errores permanentes conservan la clasificación previa (`permission-denied`, `invalid-argument`, `SYNC_CONFLICT`). Un error transitorio detiene nuevos envíos de ese ciclo, evitando probar toda la cola sin red, pero se intenta recibir lo disponible. Los errores reales de lectura, cuenta, ámbito, IndexedDB o conflictos entrantes no identificados siguen notificándose y no se eluden.

Para un `SYNC_CONFLICT` ya identificado en la cola se aparta también la versión remota de ese ID antes de incorporar el lote: solo ese evento si el conflicto es de tiro; el partido entero si lo conflictivo es su alta o eliminación. La copia local y el documento remoto permanecen sin sobrescritura. Esto evita que la validación de identidad aborte todos los cambios compatibles. No se añade una resolución automática de conflictos. Las lápidas compatibles mantienen su tratamiento anterior.

La recepción correcta no borra la cola ni el aviso: con un bloqueo pendiente el estado final sigue siendo «Error de sincronización», el perfil conserva el punto y «Reintentar» mantiene su función. Las escuchas se reutilizan en vez de cerrarse y descargarse otra vez por un error de envío aislado. La cola y sus bloqueos sobreviven a la recarga; no se acusa una operación fallida ni se marca todo como sincronizado. Los tiros posteriores del partido bloqueado quedan locales hasta el reintento; otros partidos sí pueden subir.

No cambian interfaz, diseño, guardado de tiros, registro de dos toques, IndexedDB, esquema remoto, reglas, CSV, configuración deportiva o históricos. Archivos de producción: `js/sync-engine.js`, `js/sync-storage.js`. Prueba nueva: `tools/firebase/blocked13.test.mjs`, incorporada a `sync.test.mjs`. Informe: [FASE13_COLA.md](FASE13_COLA.md).

### Verificación

- **Auth/Firestore Emulator, SDK oficial e IndexedDB real: 30 grupos correctos**, seis nuevos M5. Conflictos reales de tiro y cabecera, envío de partidos independientes, recepción automática sin recarga/ciclos forzados, conservación de las dos versiones, bloqueo duradero/reintento, alta denegada individual con hijos retenidos y lápida en espera sin resurrección. La denegación individual se inyecta solo en el envío; no se modifican las reglas. Cero escrituras reales. Recibo `.test-artifacts/firebase/sync.json` con `ok: true`.
- **Regresiones completas de datos y UI incluidas:** concurrencia, offline/recarga, acuse perdido, idempotencia, atomicidad, Deshacer, borrados, vaciado, importación, equipos/cuentas/pestañas, migración v1→v2, respuesta tardía, autenticación/perfil/cierre y temporada 30×70 sin reconsultas durante reposo.
- **Regresiones adicionales correctas:** siete grupos M4 (`startup12.test.mjs`), escuchas (`watch.test.mjs`, incluidos 120 ciclos sin consultas nuevas) y cuenta (`cuenta.test.mjs`). Sintaxis comprobada y paquete estático local de 36 archivos preparado. No se cambia la interfaz; se conservan las verificaciones táctiles/responsive de las fases anteriores, sin repetirlas como prueba visual de esta fase.

**Cierre:** M5 corregido y verificado localmente. Fase 13 completada y detenida para revisión. Ningún dato deportivo real usado o modificado; sin commit, push, despliegue ni cambios de Firebase real. El contenido conflictivo sigue pendiente de resolución explícita; no se borra ni se sobrescribe para resolver el bloqueo.

### Siguiente fase, no iniciada

M6: sincronización de la configuración del panel. Permanecen pendientes las decisiones sobre descarga inicial de SDK y originales/preferencia al salir, dominio temporal de Authentication, CSP, iPad físico, revisión/consolidación en Git y publicación. Detenerse para revisión antes de continuar.

## 64. Fase 14 — M6: configuración del panel entre dispositivos

Fecha: 20 de octubre de 2026. Continuación autorizada por «Continua». **Implementada y verificada localmente; detenida para revisión.** Respaldo previo `.local-backups/fase14-panel-20261020/`. El apartado anterior conserva el cierre histórico de Fase 13. Informe completo: [FASE14_PANEL.md](FASE14_PANEL.md).

### Decisiones y cambios

La configuración de `settings` se separa por proyecto/cuenta/equipo. Cada partido sincronizado conserva un snapshot del panel y sus IDs usados; una edición actualiza también la plantilla compartida para partidos nuevos. Los demás partidos conservan sus versiones. `categorias.csv` sigue siendo el origen inicial. En nube el snapshot queda fijo también si procede del CSV y el partido está vacío; sin cuenta se conserva el seguimiento anterior del archivo en partidos sin tiros.

`panel-model.js` valida el contrato recibido y mezcla versiones inmutables, sin sobrescribir un ID existente ni incrementar revisión ante un eco idéntico. `configuracion-guardada.js`, `sync-storage.js`, `persistencia.js`, `editor.js` y `app.js` integran versiones, asociaciones y snapshot con el registro. Configuración, partido y outbox se guardan en una transacción; no cambia la versión de IndexedDB y no se reinicia ninguna base. Los eventos deportivos, nombres históricos, IDs y exportación CSV permanecen intactos.

Se añaden plantilla actual/versiones por equipo y versiones de panel por partido en Firestore. El snapshot y `panelClock` se guardan fuera del `payload` deportivo. La plantilla y el panel comparan la versión base antes de sustituirse; el transporte comprueba tiros vivos y reloj del padre para detectar registro concurrente. Los tiros bloquean la edición; vaciar o deshacer todos permite editar otra vez. Una edición incompatible conserva historial local y cola bloqueada, con aviso y sin sobrescritura. Si ya hay tiros remotos se muestra el panel remoto que los originó, manteniendo el borrador conflictivo. Resolver manualmente esos conflictos sigue fuera del alcance.

Las importaciones confirmadas incluyen la configuración asociada sin modificar los originales. Se recuperan asociaciones globales antiguas solo cuando este dispositivo ya las vinculaba a un partido conocido del equipo. No se puede reconstruir un panel personalizado nunca subido si el único dispositivo que lo conservaba perdió sus datos. Cerrar sesión elimina del dispositivo los paneles por ámbito de esa cuenta; lo sincronizado se recupera al volver a entrar.

La recepción añade una escucha de plantilla por equipo: 62 para 30 partidos, sin consultas periódicas. El reloj añade una escritura de padre por tiro/deshacer y la recepción de sus cambios; editar requiere consultar eventos/lápidas. La mejora no promete consumo cero ni cuota ilimitada.

### Verificación

- **40 grupos correctos de sincronización** con SDK oficial, IndexedDB real y emuladores `demo-defensas`, diez nuevos M6. Incluyen cambios/IDs en otro dispositivo, plantilla/recarga, tiros/concurrencia, vaciado/reintento, cuentas/equipos, aborto atómico, edición y tiro offline con recarga, conflictos simultáneos, importación personalizada y recuperación antigua. Interfaz completa: editar en A y recibir el nombre en B sin recargar; se mantienen las regresiones anteriores de datos, Auth y temporada 30×70. Recibo `.test-artifacts/firebase/sync.json`, `ok: true`, `realWrites: 0`.
- **85 comprobaciones de reglas correctas**, incluidas 23 nuevas sobre autoría, aislamiento, versiones inmutables, punteros, plantilla y reloj de tiro/deshacer. Reglas aplicadas exclusivamente al emulador.
- **10 archivos de pruebas Node correctos**, contrato/validación de panel incluidos; siete grupos M4 de arranque correctos, cero solicitudes externas. Escuchas: 120 ciclos sin nuevas consultas/suscripciones. Recepción automática A↔B e interfaz correctas sin recarga/ciclos forzados.
- Sintaxis comprobada y paquete local de 37 archivos preparado con rutas relativas; sin publicar. La batería UI conserva capturas en 1024, 390 y 320 px sin desbordamientos.
- `local-browser.mjs`: regresiones 2/3/5/6/10, inicio de sesión, siete tamaños sin peticiones externas en modo local, fallos Firebase, CSV y subruta correctos.

### Cierre y publicación pendiente

**M6 corregido localmente. Fase 14 completada y detenida para revisión.** Sin datos deportivos reales, commit, push, despliegue, cambios de Authentication o reglas reales.

Código y reglas nuevos requieren publicación coordinada y dispositivos actualizados: las reglas antiguas deniegan las nuevas rutas; las nuevas reglas rechazarían tiros/deshacer de clientes antiguos en partidos que ya tengan panel porque no envían `panelClock`. La cola/datos locales se conservan y el cliente actualizado puede reenviarlos. Los partidos antiguos sin panel mantienen el protocolo anterior hasta asociarlo. Este límite está documentado; no se ha realizado la publicación.

No se inicia la siguiente fase. Pendientes: decisiones sobre SDK inicial y originales/preferencia al salir, dominio temporal de Auth, CSP, prueba física Safari/iPad, revisión/consolidación en Git y publicación autorizada. A2 sigue mitigado con el límite de persistencia de Safari; los conflictos de contenido conservados no se resuelven automáticamente.

## 65. Fase 15 — B7: política de seguridad de contenido

Fecha: 20 de octubre de 2026. Autorizada por «Vamos allá» tras proponer cerrar la CSP. **Implementada y verificada localmente; detenida para revisión.** Respaldo `.local-backups/fase15-csp-20261020/`. Informe y referencias: [FASE15_CSP.md](FASE15_CSP.md). El apartado anterior conserva el cierre histórico de Fase 14; CSP deja de estar pendiente localmente.

### Cambios y decisiones

`index.html` añade la meta CSP después de `charset` y antes de recursos. El script incrustado que prepara el bloqueo de cuenta pasa a `js/inicio.js`, síncrono y previo a los módulos. El empaquetador incluye el archivo nuevo: 38 archivos estáticos. No hay scripts incrustados, permiso `unsafe-eval`, scripts `data:`/`blob:` ni orígenes HTTP/emuladores en el HTML de producción.

La política bloquea recursos por defecto. Permite scripts propios, SDK 12.11.0 de gstatic y auxiliares de apis.google.com; conexiones propias y servicios HTTPS de Auth/Firestore; fotos de Google, imágenes `data:` usadas en el flujo auxiliar y la sonda de conectividad del SDK; un único origen de iframe, el `authDomain` real. Fuentes propias, objetos/trabajadores/cambios de base bloqueados y formularios solo al propio origen. Los estilos incrustados conservan permiso explícito porque el panel, las barras y el editor los generan dinámicamente. No cambian configuración deportiva, eventos, estadísticas, CSV ni diseño.

La entrega por meta no incluye protección `frame-ancestors` ni informes de servidor. La lista corresponde al SDK/dominio actuales y se revisará al cambiarlos. El escape de textos y las reglas de Firestore siguen siendo necesarios. No se añaden backend, dependencias, nuevos proveedores ni cabeceras de alojamiento.

La regresión de arranque detectó una carrera de Fase 14: `assertContext()` dentro de callbacks IndexedDB podía producir una excepción global al cambiar de ámbito. Los tres callbacks afectados de `configuracion-guardada.js` ahora abortan expresamente con `SCOPE_CHANGED`; se conserva el rechazo gestionado y no se escribe en el ámbito anterior. Prueba determinista añadida a `startup12.test.mjs`, sin reiniciar ni cambiar esquema de bases.

Los emuladores necesitan endpoints locales. Solo su servidor loopback, bajo `DEFENSAS_TEST_EMULATOR_CSP=1` establecido por el lanzador de pruebas, los añade a conexiones/frames; no se modifica el archivo ni el paquete. La política restante sigue activa y Auth/interfaz exigen cero violaciones. Se sirve desde el servidor, sin reemplazar la navegación en Playwright ni desactivar el control de acceso a red local de Chromium.

### Verificación

- **Seis grupos CSP en Chromium y WebKit correctos**: política de producción en raíz y subruta, registro, recarga y estadísticas sin violaciones ni solicitudes externas en modo local. Bloqueos ejercitados de scripts incrustados, handlers, `eval`, script/conexión/imagen/frame externos, base y formulario. `object-src 'none'` declarado en ambos y bloqueo observable en Chromium; WebKit no inicia ese object. Recibo `.test-artifacts/firebase/csp15.json`.
- **Google real hasta OAuth, sin credenciales**: perfil efímero, SDK oficial sin modificar, política de producción, ventana llegada a `accounts.google.com` y cancelación recuperada. Sin completar autenticación, crear usuarios, acceder a datos deportivos o solicitar Firestore; cero errores y violaciones. Recibo `csp15-auth-smoke.json`.
- **Auth Emulator correcto**: inicio, pregunta única, recarga/restauración, cierre, cambio de cuenta, varias pestañas, popup bloqueado y originales conservados; cero violaciones CSP. Recibo `auth.json`.
- **40 grupos de sincronización correctos**, con interfaz completa y edición de panel entre dispositivos bajo CSP; cero escrituras reales, errores y violaciones CSP de interfaz. Recibo `sync.json`.
- **Ocho grupos de arranque correctos**, incluido cambio forzado de ámbito dentro del callback IndexedDB, sin excepción global ni cambios en originales; cero solicitudes externas. Diez archivos de pruebas Node correctos. Regresiones locales 2/3/5/6/10, siete tamaños, errores Firebase, CSV y subruta correctos. Sintaxis y paquete local de 38 archivos comprobados.

### Cierre

**B7 corregido localmente. Fase 15 terminada y detenida para revisión.** Ningún dato deportivo real utilizado o modificado, sin cambios de Authentication/reglas reales, commit, push ni despliegue. La única interacción real de esta fase fue el acceso público necesario para verificar la ventana de Google, sin credenciales ni sesión autenticada.

No se inicia otra fase. Quedan: decidir SDK inicial y originales/preferencia al salir, revisar y retirar con autorización el dominio temporal de Authentication, Safari/iPad físico y consolidación/publicación autorizada. Se mantiene la condición de Fase 14: publicar código y reglas de manera coordinada y actualizar dispositivos. A2 sigue mitigado; las versiones conflictivas conservadas requieren resolución explícita.

## 66. Decisión sobre originales importados y preferencia de equipo

El usuario acepta con «Perfecto» la explicación de conservar el comportamiento actual al cerrar sesión:

- Los originales de partidos importados se conservan en el dispositivo como respaldo oculto; se trabaja con la copia sincronizada.
- Se recuerda el equipo seleccionado para recuperarlo al volver a entrar.
- Se mantienen las reglas de cierre de sesión: borrar del dispositivo los datos propios de la cuenta, avisar si hay cambios sin subir y conservar los partidos sin cuenta. No se borran los partidos ya guardados en la nube.

**B6 cerrado por decisión del usuario.** El respaldo es la copia original de la importación, no una copia continuamente actualizada del partido sincronizado. No se añade acceso a ese respaldo desde la interfaz. Es un registro documental del comportamiento existente, sin cambios de código, pruebas nuevas, datos, Authentication, commit, push o publicación.

El «Perfecto» responde a la aclaración de este punto; no se interpreta como autorización para retirar dominios, publicar ni cambiar otros comportamientos. Pendientes actuales: confirmar la decisión sobre carga inicial del SDK; revisar y retirar con autorización el dominio temporal de Auth; Safari/iPad físico; consolidación y publicación coordinada de código/reglas con dispositivos actualizados. No se inicia otra fase.

## 67. Decisión sobre carga inicial del SDK

El usuario elige expresamente «Vamos con tu primera opción» tras explicar las dos alternativas. **Decisión cerrada:** mantener la carga del SDK de Google/Firebase mientras se muestra la pantalla de inicio, para que «Continuar con Google» abra el acceso con un solo toque. También se carga al recuperar una cuenta elegida. Con «Continuar sin cuenta» recordado no se carga el SDK ni se hacen solicitudes externas; si se solicita iniciar sesión desde el perfil, se prepara entonces el acceso.

Se conserva la implementación existente y las verificaciones de las fases 10–15. Solo se actualiza documentación; no se modifica código, datos ni configuración externa y no se necesitan pruebas nuevas para esta decisión. Sin commit, push o despliegue.

Las dos decisiones de cuenta quedan cerradas. Pendientes actuales: revisar y retirar con autorización el dominio temporal de Authentication (B4); prueba física Safari/iPad; consolidación en Git y publicación coordinada de código/reglas con dispositivos actualizados. No se interpreta esta elección como autorización para modificar Authentication o publicar. No se inicia otra fase.

## 68. Fase 16 — B4: retirar el dominio temporal de Authentication

Fecha: 20 de octubre de 2026. El usuario autoriza expresamente con «Vamos allá» la propuesta de revisar y retirar el dominio temporal. **Retirada aplicada en Authentication real, verificada y detenida para revisión.** Informe: [FASE16_DOMINIO.md](FASE16_DOMINIO.md). Respaldo previo de documentos y dominios `.local-backups/fase16-dominio-20261020/`.

La consulta administrativa comprueba que el canal `ipad-8b2` ya no existe, pero `registro-defensivo--ipad-8b2-40nbq9cf.web.app` seguía autorizado. `retirar-dominio16.mjs` prepara el plan sin cambios y, con `--apply`, relee la configuración, evita aplicar una lista obsoleta y actualiza solo `authorizedDomains` para retirar ese hostname. Verificación administrativa completada a las 17:00:01 UTC. Se conservan exactamente `localhost`, `registro-defensivo.firebaseapp.com`, `registro-defensivo.web.app` e `itsasnehezkuntza.github.io`.

Una consulta pública independiente a las 17:00:12 UTC devuelve HTTP 200, proyecto `760744900094` y la misma lista de cuatro dominios. Se contrasta automáticamente con el resultado administrativo y se comprueba la ausencia del temporal. Recibos en `.test-artifacts/firebase/fase16/`: plan, resultado y verificación pública. No se repite autenticación completa ni se presenta la consulta como prueba de sesión Google.

**B4 cerrado.** Esta es una modificación autorizada de configuración real de Authentication, distinta de las fases de aplicación aún locales. No se leen usuarios, partidos o eventos, ni se modifican proveedores, otros dominios, reglas de Firestore, Hosting o Pages. Sin commit, push o despliegue. No se cambia código runtime ni se requieren regresiones deportivas por esta retirada; sintaxis y resultado remoto comprobados.

Pendientes actuales: preparar y realizar la prueba física Safari/iPad; consolidar en Git y publicar con autorización, coordinando código/reglas de Fase 14 y dispositivos actualizados. SDK inicial y originales/preferencia al salir están aprobados; CSP está cerrada localmente. A2 conserva su límite de persistencia y los conflictos de contenido conservados requieren resolución explícita. No se inicia otra fase.

## 69. Fase 17A — preparar la prueba física Safari/iPad

El usuario solicita «Siguiente paso». Se prepara un candidato concreto y verificable para el iPad, sin interpretar la petición como permiso para desplegar o cambiar Authentication. **Preparación terminada; publicación pendiente de autorización.** Respaldo documental `.local-backups/fase17-ipad-20261020/`. Plan y recorrido en [FASE17_IPAD.md](FASE17_IPAD.md). El antiguo documento de prueba se marca histórico para evitar usar el enlace retirado.

Build `17-ff347879fc8976cc`, 39 archivos; candidato `.test-artifacts/firebase/fase17/candidate/public/`, manifiesto con hashes y configuración Hosting fuera del directorio público. Se propone canal nuevo `ipad17`, 24 horas desde creación, añadiendo solo el dominio verificado que devuelva Hosting a Authentication. No se ha creado ni publicado. Herramientas `prepare17-ipad.mjs` y `preview17.test.mjs`.

La copia conserva CSP y Google, pero bloquea Sync en dos capas: configuración OFF inmutable y transporte Firestore sustituido por rechazo explícito. No lee ni escribe partidos de la nube. Un bootstrap verifica HTTPS, origen del canal nuevo, build y ausencia de bases previas sin su marcador antes de importar aplicación/cuenta. Si hay datos previos se detiene sin abrirlos ni borrarlos. La prueba física propuesta usa únicamente datos ficticios y la cuenta exclusiva de pruebas.

Seis grupos correctos en Chromium/WebKit: uso local (editor, dos pulsaciones/doble toque, recarga, estadísticas y CSV), bloqueo ante datos previos y bloqueo de origen incorrecto. Semilla conservada, CSP sin violaciones en uso normal, hashes/dependencias completos, cero solicitudes externas y escrituras reales. Google se desactiva en estas comprobaciones automatizadas locales; no se presentan como validación física de Auth. Recibo `.test-artifacts/firebase/fase17/verificacion.json`.

Esta copia permite probar interfaz, acceso/sesión y persistencia local, pero no M6 entre dispositivos. La sincronización física requiere actualización coordinada de código/reglas con clientes actualizados o un entorno Firebase independiente expresamente autorizado. No se cambian reglas de producción para habilitar esta vista previa.

Se detiene conforme a `AGENTS.md`: «No publicar, desplegar ni hacer push sin autorización correspondiente». El usuario puede revisar el candidato y autorizar el canal temporal y su dominio como siguiente paso concreto. Esta fase no autoriza live, Pages, reglas, Firestore, importaciones, commit o push. La prueba física permanece pendiente y no se da por superada por WebKit de escritorio.

## 70. Fase 17B — publicación temporal autorizada para Safari/iPad

El usuario responde **«Sí»** a publicar el candidato exacto de Fase 17A en un canal temporal durante 24 horas y añadir únicamente su dominio a Authentication. **Publicación completada y verificada; detenida para la prueba física del usuario.** Respaldo `.local-backups/fase17b-publicacion-20261020/`. Plan, recorrido y resultados en [FASE17_IPAD.md](FASE17_IPAD.md).

- URL: `https://registro-defensivo--ipad17-ot4rlj0m.web.app`.
- Canal `ipad17`, sitio/proyecto `registro-defensivo`; build `17-ff347879fc8976cc`, versión Hosting `ef0aeab1a8e6c8db`.
- Creación el 20 de octubre; caducidad el **21 de octubre de 2026 a las 20:22:43 UTC / 22:22:43 de Madrid**, sin renovación.
- Google disponible, **Sync desactivado en configuración y transporte**, sin escrituras Firestore.

`publish17-ipad.mjs` verifica seis grupos locales, build, hashes de los 39 archivos del candidato, configuración limitada a Hosting, canal inexistente, referencia de reglas y estado live antes de publicar. Crea exclusivamente el nuevo canal de 24 horas. Antes de liberar, comprueba los hashes comprimidos del inventario remoto: 38 archivos de aplicación más dos recursos estándar de Firebase; `.nojekyll` queda excluido por la configuración Hosting. No ejecuta limpieza automática de dominios ni despliega reglas. Autoriza después únicamente el hostname recibido, con lista anterior conservada.

Referencia de reglas sin cambios: `projects/registro-defensivo/rulesets/4bc70f67-e0ed-4fb0-b46e-7c2494eab227`. Hosting live sin release antes/después; GitHub Pages no modificado. Otros dominios conservados: localhost, dos dominios Firebase y GitHub Pages. No se vuelve a añadir el antiguo dominio de Fase 16.

### Verificación de HTTPS

38 hashes y cabeceras no-store/nosniff/noindex correctos; documentación, pruebas, herramientas, reglas y Git no publicados (404). Chromium sobre la URL publicada: SDK oficial listo, Google llega a OAuth y se cancela sin credenciales ni sesión completada; tres tamaños sin desbordamiento, tiro único con doble toque, recarga y estadísticas correctos; cero errores, violaciones CSP y solicitudes Firestore. Contexto efímero con datos ficticios. Consulta pública de Auth confirma el proyecto y exactamente la lista previa más el hostname nuevo.

WebKit de escritorio falla la validación de cadena TLS en este entorno. No se ignora el certificado ni se da por superada esa comprobación HTTPS. Las pruebas locales anteriores Chromium/WebKit son correctas, pero Safari/iPad físico permanece pendiente. No se cambia el candidato por esta limitación del entorno.

Recibos en `.test-artifacts/firebase/fase17/`: `preflight.json`, `created-channel.json`, `uploaded-review.json`, `deployment.json`, `https-verification.json`. Publicación real autorizada solo del canal temporal y su dominio; sin datos deportivos reales, usuarios nuevos, reglas nuevas, commit, push o publicación habitual.

### Continuación

El usuario debe abrir el enlace en Safari/iPad y realizar el recorrido de FASE17_IPAD.md con cuenta exclusiva de pruebas y datos ficticios. No se verifica sincronización física en esta copia; requiere la actualización coordinada posterior. Al finalizar/caducar, revisar y retirar el dominio temporal de Authentication: su retirada no se presupone automática. No se amplía la caducidad ni se inicia otra publicación sin autorización.

## 71. Fase 18 — corregir inicio/Registro en la prueba física

El usuario informa de Registro visible debajo del inicio al desplazar y Google «Cargando» en un iPad antiguo. Mientras se investiga, confirma que en un iPad nuevo ha podido iniciar sesión. **Google manual confirmado en el nuevo para la copia 17; versión y causa del antiguo desconocidas.** No se interpreta el éxito como prueba de los demás recorridos. Respaldo `.local-backups/fase18-inicio-ipad-20261020/`; informe [FASE18_INICIO_IPAD.md](FASE18_INICIO_IPAD.md).

### Corrección y conservación

El inicio excluye Registro y barra del layout con `display:none`, manteniendo `visibility` e `inert`; cuerpo fijado al viewport y desplazamiento propio del inicio. No puede aparecer el Registro al desplazar. Se recalcula la distribución al volver a la aplicación.

El controlador de cuenta acota también la primera observación de Auth dentro de los 12 segundos totales y descarta callbacks tardíos tras error. El script clásico previo a módulos muestra un fallo y reintento si cuenta no se evalúa en 15 segundos; permite elegir modo local antes de que llegue esa interfaz. Usa sintaxis sencilla para poder avisar de módulos incompatibles; no acredita compatibilidad completa con Safari antiguo. El bootstrap inicia aplicación/cuenta en paralelo y admite el marcador anterior exacto del mismo canal sin borrar bases ni reescribir partidos.

### Verificación

Seis grupos de inicio en Chromium/WebKit: normal, observador atascado y módulo fallido; cuatro tamaños, Registro/barra sin layout y documento sin scroll de fondo, errores/reintento, salida local y registro correctos. Ocho grupos de candidato, incluida actualización desde build 17 con partido/tiros/selección idénticos. Cuenta y nueva prueba de observador tardío correctas; ocho grupos de arranque 12, diez archivos Node, Auth Emulator, regresiones locales 2/3/5/6/10 en siete tamaños y seis grupos CSP correctos. Solo datos ficticios/contextos efímeros; sin nuevas dependencias, cambios de esquema, datos deportivos o reglas.

### Actualización del canal de prueba y cierre

Se corrige la vista previa ya autorizada en respuesta al reporte del usuario, conservando exactamente canal, origen y caducidad. `publish18-ipad.mjs` exige la versión anterior, referencias protegidas y dominios iguales, revisa hashes antes de liberar e impide creación/renovación/limpieza de canales o Auth. Actualización el 20 de octubre a las 20:38:51 UTC, build `18-eda58c0c0461ab73`, versión Hosting `25de4d164a82c9ed`. URL intacta `https://registro-defensivo--ipad17-ot4rlj0m.web.app`, caduca el 21 de octubre a las 22:22:43 de Madrid. Sync OFF, reglas/Auth/live/Pages sin cambios; sin datos deportivos reales, commit o push.

HTTPS: 38 hashes/cabeceras correctos; Chromium verifica Google hasta OAuth sin credenciales, inicio sin layout de Registro ni scroll de documento, salida local, tiro único, recarga y estadísticas; cero errores/CSP/Firestore. Captura vertical revisada. WebKit de escritorio mantiene la limitación de cadena TLS del entorno; no se ignoran certificados. Recibos y capturas `.test-artifacts/firebase/fase18/`.

**Fase 18 terminada y detenida para repetición física.** Recargar el enlace y, si hay sesión recuperada, volver al inicio cerrando Google; no borrar datos. Pendiente confirmar desplazamiento en iPad, los demás pasos del recorrido, compatibilidad del antiguo y sincronización física posterior. Se conserva la misma caducidad y la obligación de revisar el dominio temporal al finalizar.

**Confirmación física posterior del usuario — 20 de octubre:** «Funciona perfecto!!», en respuesta a recargar y comprobar el inicio corregido en el iPad nuevo. Se registra como comprobación favorable de esa corrección y se cierra su repetición física. El acceso Google en el iPad nuevo ya se había confirmado. No se extiende esta respuesta a todo el recorrido: registro/recarga/CSV/offline físicos, persistencia prolongada, iPad antiguo y sincronización siguen sin confirmación específica. Solo actualización documental; sin nuevos despliegues, cambios de datos ni ampliación del canal. Detenido antes de iniciar otra fase.

**Siguiente comprobación física recibida:** «He recargado y se guardan», tras indicar crear un partido ficticio, registrar tiros y recargar. Registro y conservación local tras recarga quedan confirmados en el iPad nuevo. No se infieren número exacto de tiros, contenido del CSV, resultados estadísticos, prueba offline, retención durante días ni recepción en otro dispositivo. Quedan estos pasos sin confirmación específica; Sync continúa desactivado y la caducidad no cambia. Solo registro documental, sin nuevas acciones externas.

**CSV y Deshacer — confirmación posterior:** el usuario responde «Funciona perfecto» después de indicar exportar CSV, guardarlo desde Safari, pulsar Deshacer y recargar para comprobar un tiro menos. Se registran esos pasos como correctos en el iPad nuevo. No equivale a inspección del contenido del archivo en Excel ni prueba offline, estadísticas, retención prolongada o sincronización. Solo documentación, sin cambios de código, datos, canal o caducidad. Continúa el recorrido físico pendiente.

**Uso sin conexión — confirmación posterior:** el usuario indica «Está guardado» tras el recorrido de desconectar Wi-Fi/datos con la página ya cargada, registrar un tiro ficticio, recuperar conexión y recargar. Se confirma conservación local del tiro en ese recorrido en el iPad nuevo. No acredita arranque/recarga sin red, persistencia prolongada ni subida/recepción entre dispositivos (Sync OFF). Estadísticas y demás pasos físicos no confirmados siguen pendientes. Solo actualización documental; sin cambios de código, datos, permisos, despliegue o caducidad.

**Estadísticas y orientaciones — confirmación posterior:** «Funciona todo perfecto!!» al pedir comparar intentos/aciertos/puntos en Estadísticas y revisar vertical/horizontal en el iPad. Se registran ambos pasos físicos como favorables según el usuario, sin inventar recuentos ni mediciones. El usuario propone evitar el deslizamiento si no hay contenido debajo y pide anotarlo expresamente como extra no fundamental. Se registra MOP-001 en el apartado 72; no se implementa ni se publica otro cambio. No se extiende esta confirmación a sincronización, persistencia prolongada o iPad antiguo.

**Cerrar y reabrir Safari — confirmado posteriormente:** el usuario indica «He probado y funciona asi que la parte 1 la podemos dar por hecha» al paso de cerrar/reabrir Safari y recuperar sesión/partido. Se registra como favorable en el iPad nuevo. No demuestra retención durante días ni sincronización. Comunica además pérdida periódica del cursor al nombrar una defensa; corrección en Fase 19, apartado 73.

## 72. Mejoras opcionales, sin implementar

Lista vigente en [MEJORAS_OPCIONALES.md](../../MEJORAS_OPCIONALES.md).

**MOP-001 — bloquear el desplazamiento vacío:** el usuario solicita anotar, con prioridad baja y sin carácter fundamental, evitar deslizar/rebotar verticalmente cuando la pantalla ya cabe y no hay contenido debajo. Una revisión futura deberá mantener el desplazamiento necesario cuando sí haya contenido, también en móvil, al girar o ampliar texto. Es distinta de la separación inicio/Registro ya aceptada de Fase 18.

Solo registro documental. No bloquea el cierre funcional ni la publicación y no autoriza su implementación ahora. Sin cambios de código, datos, canal, permisos o caducidad; no se inicia otra fase.

## 73. Fase 19 — conservar el cursor al editar nombres

El usuario solicita corregir la pérdida periódica del cursor al añadir una defensa. Respaldo `.local-backups/fase19-editor-20261020/`. Reproducido con una prueba de navegador antes del cambio: el campo pierde foco 120 ms después de añadir, al terminar el cálculo diferido de capacidad. `renderParts()` reconstruía la cabecera aunque solo cambiaban los botones inferiores.

La actualización de capacidad conserva ahora la cabecera y su campo; actualiza únicamente la barra inferior. Se conservan foco, selección y teclado durante la escritura. No cambia la persistencia, IDs, eventos ni límites de capacidad. MOP-001 sigue sin implementar.

Prueba específica Chromium/WebKit correcta: escritura pausada, inserción en medio del nombre, cambio de altura disponible y nombre conservado tras guardar/recargar. Regresión completa del editor y diez archivos Node correctos. Diez grupos del candidato correctos en ambos motores, incluidos actualización desde 17/18 con partido/eventos idénticos, editor con escritura pausada, registro, doble toque, CSV y estadísticas; cero solicitudes externas/escrituras reales en estas comprobaciones locales.

**Publicado el 20 de octubre a las 21:11:18 UTC**, build `19-79f88c07bb7931b7`, versión Hosting `e06d1fb6d6a86f4a`, exclusivamente en el canal temporal existente. Enlace y caducidad original del 21 de octubre a las 22:22:43 de Madrid conservados; no se renueva el canal. Auth, reglas, live y Pages intactos; Sync sigue bloqueado. El reporte solicita corregir la prueba previamente autorizada, con el mismo alcance aplicado en Fase 18; no autoriza producción.

38 hashes HTTPS y cabeceras correctos; rutas internas no publicadas. Chromium sobre HTTPS verifica escritura pausada/cursor/nombre persistido, acceso hasta OAuth cancelado sin credenciales y registro/recarga/estadísticas, sin errores CSP ni Firestore. WebKit HTTPS sigue limitado por la cadena TLS del entorno; no se ignora el certificado. WebKit local correcto. La prueba de Safari físico de esta corrección queda pendiente del usuario.

Recibos en `.test-artifacts/firebase/fase19/`; detalles en [FASE19_CURSOR_EDITOR.md](FASE19_CURSOR_EDITOR.md). Sin datos reales manipulados, commit o push. **Fase 19 terminada y detenida para revisión; no se inicia otra fase.**

**Confirmación física posterior:** el usuario responde «Ya funciona perfecto!!». Se registra como favorable la corrección del cursor al editar en el iPad. No se extiende esta confirmación a sincronización, compatibilidad del iPad antiguo o persistencia durante días.

## 74. Pendientes del editor para retomar mañana

Solicitud expresa del usuario el 20 de octubre de 2026: anotar para mañana, 21 de octubre, sin implementar ahora.

1. **Cancelar o deshacer el cambio de nombre durante la edición de un elemento.** Añadir una opción visible para recuperar el nombre anterior cuando no se quiera aplicar lo escrito. Revisar el comportamiento al editar un elemento existente y al añadir uno nuevo; concretar el alcance de la cancelación al retomarlo. Es distinta de Deshacer el último tiro y de cancelar la edición completa del panel.
2. **Cambiar «Quitar» por «Eliminar».** Ajustar el texto del botón y revisar los mensajes asociados del editor para mantener el mismo término. Es un cambio de redacción; conservar las reglas actuales sobre históricos y eventos.

Ambos puntos quedan pendientes para la próxima sesión, sin clasificarlos como mejoras de prioridad baja. MOP-001 conserva por separado su carácter opcional. Solo documentación: sin código, datos, pruebas nuevas, publicación, renovación del canal, commit o push. No se inicia otra fase.

## 75. Fase 20 — publicación general de lo terminado

El usuario solicita subir lo hecho para todos los usuarios. Se publica 20.0 en `https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/`, con las funciones y correcciones terminadas hasta Fase 19 y la actualización coordinada de reglas de Fase 14. No se implementan los pendientes del apartado 74 ni MOP-001.

Desde una copia aislada de main, conservando develop y sus cambios: fuentes `86cf6177e380e6100b274d3c07c031ffc1bf6083`; Pages `647aeb55d8738e04dbb785e9ca652bcb64529cd0`, exclusivamente 38 archivos de aplicación y `version.json`. Respaldo remoto de main `d98bee5` y Pages `2c49c4b` en ramas `respaldo/antes-fase20-main-20261021` y `respaldo/antes-fase20-pages-20261021`. Reglas anteriores conservadas y respaldadas; nuevas `projects/registro-defensivo/rulesets/901339e9-c122-463f-98e2-a5a02d34439a`, publicadas a las 22:48:08 de Madrid. Auth y Hosting no cambian; no se renueva el temporal ni se leen/escriben datos deportivos reales.

Verificación: 40 grupos Sync y 85 comprobaciones de reglas en emuladores; diez archivos Node; regresiones locales, siete tamaños/subruta/CSV; seis grupos CSP y seis de inicio. Actualización desde los archivos exactos publicados 8C.0→20.0 en Chromium/WebKit conserva partido, selección e históricos, con Deshacer y editor correctos. Se ajustó la espera de una prueba de aborto para recibir antes el último evento remoto; la batería completa posterior pasó sin cambiar runtime.

Build Pages `built`, 39 hashes HTTPS y versión pública correctos; diez rutas internas 404. Chromium en la URL pública: SDK Google listo, inicio exclusivo, escritura/cursor/nombre persistido, doble toque, recarga y estadísticas correctos; sin errores, CSP o Firestore. WebKit HTTPS limitado por TLS del entorno, sin desactivar certificados; WebKit local correcto. Recibos `.test-artifacts/firebase/fase20/`.

Todos los dispositivos deben recargar. Los clientes antiguos no soportan el protocolo nuevo de paneles; sus operaciones locales pendientes se conservan para reenviarse con el cliente actualizado. La prueba física entre dispositivos con Sync nuevo queda pendiente; la prueba iPad anterior tenía Sync OFF y no la acredita. No se confunden pruebas de emulador con actividad real. **Publicación técnica completada y detenida para revisión; no se inicia otra fase.**


## 76. Fase 23 — Administración y supervisión de equipos

29 de octubre de 2026. Candidato **23.0-local**, implementado en copia independiente de las fuentes publicadas 22.0, HEAD base `6003a72`. Fases 21/22 y publicación se acreditan en FASE22_PUBLICACION.md. No se modifica develop ni se incorporan sus cambios acumulados. Decisiones, arquitectura y procedimiento en [FASE23_SUPERVISION.md](FASE23_SUPERVISION.md).

Autorización: un documento `supervision/{uid}/teams/{teamId}` con schemaVersion 1, role reader y status active, escrito solo por administración. El mismo documento sirve de ACL e índice de descubrimiento. Cada usuario consulta únicamente su subcolección; los equipos se recuperan por ID. Sin consulta global ni correo como permiso. Revocar status o eliminar la ACL bloquea nuevas lecturas sin cambiar tokens. Miembros/perfiles ajenos permanecen privados. Todas las 19 cláusulas de escritura anteriores se conservan idénticas.

Entrada `supervision.html` separada, enlazada en inicio/perfil. Solo carga Auth, lector y Dashboard; no abre IndexedDB deportivo, no carga motores de escritura y no ofrece mutaciones/exportaciones. Reutiliza Dashboard, estadísticas, identidad y estilos V4. Proyección pura de configuración extraída a `panel-configuration.js`, reexportada por el módulo anterior. Respeta panel/IDs históricos y lápidas, calcula solo del partido seleccionado; partidos antiguos sin panel indican el uso de ejes del CSV actual.

Una escucha de las ACL propias permite descubrimiento/revocación. Datos deportivos bajo consulta explícita, sin polling. Desconexión, ocultación, cambio de identidad y revocación invalidan la vista/respuestas pendientes; vuelta a primer plano requiere validación de servidor. Datos supervisados no se importan, sincronizan o guardan como copia deportiva local. No hay cambio de dependencias, índices compuestos, esquema local, configuración Firebase o permisos de escritura de propietarios.

Administración preparada: plan local por UID/equipo y procedimiento de consola Firebase/IAM, sin credenciales privilegiadas en navegador. Herramienta de aplicación solo para demo-defensas en emulador, con comprobación de propietario y commit atómico con precondiciones. No se han obtenido ni modificado UID, permisos o datos reales. Coste adicional: ACL pequeña, escrituras de asignación/revocación, lecturas de consulta y dependencias de Rules; sin infraestructura propia ni estadísticas duplicadas. Detalle y fuentes de facturación en el informe.

Verificación y cierre: ver resultados finales al final del informe. Únicamente cuentas ficticias, SDK oficial y emuladores; perfiles efímeros de Chromium/WebKit. Pendientes revisión del usuario, prueba física y autorización separada de publicación/asignaciones reales. **Se detiene al cerrar Fase 23; no se inicia otra fase. Sin commit, push ni despliegue.**

Resultado final de Fase 23: 101 comprobaciones/grupos específicos, 85 reglas, 40 Sync, 28 cuentas, 12 archivos unitarios, 2 actualizaciones Chromium/WebKit y 17 entradas locales/CSV correctas. Auditoría: 19 cláusulas de escritura idénticas y 23 archivos centrales intactos. Dataset real no consultado/modificado. Workspace original verificado por hashes sin cambios en sus 368 rutas. Capturas responsive revisadas. Fase cerrada localmente y detenida para revisión.

## 77. Fase 23.1 — Revisión de seguridad y preparación de publicación

29 de octubre de 2026. Autorización exclusivamente de revisión/preparación. **Publicable técnicamente, sin bloqueantes de seguridad detectados; no publicado.** Diff, reglas, lector, UI, separación de módulos y recibos de Fase 23 revisados. No se repiten baterías extensas. La comparación reconstruye las reglas completas anteriores retirando únicamente los añadidos de lectura: 19 cláusulas de escritura, funciones auxiliares y ámbitos idénticos. El grafo de supervisión excluye persistencia deportiva y motor de escritura; ACL solo por UID/equipo, sin autoconcesión o correo como permiso; revocación cubierta por denegación del servidor y limpieza/invalidez de respuestas de UI.

Única prueba funcional adicional: cliente exacto de Pages 22.0 (`3aed91f`), Auth/Firestore Emulator y datos ficticios; crear equipo/partido, registrar y confirmar un tiro en servidor, recuperar tras recarga, Deshacer y recargar sin resurrección. Terminada con código 0. Aplicación y reglas candidatas sin cambios. La preparación verifica las huellas de los 43 assets probados; solo transforma metadatos HTML a 23.0, conserva bytes públicos sin cambios y añade version.json (44 archivos). Reversión de 39 archivos exactos Pages 22.0 disponible localmente. Configuración de reglas explícita y separada para no heredar la de develop.

Informe y procedimientos en [FASE23_1_REVISION_PUBLICACION.md](FASE23_1_REVISION_PUBLICACION.md). Inventario, huellas, paquete, reversión y recibo cliente22 en `.test-artifacts/firebase/fase23-1/`, dentro de la copia aislada. La referencia local de reglas 22.0 no se confunde con un respaldo actual: al publicar se deberá obtener/verificar el ruleset vigente y detenerse si difiere. Orden: respaldo verificable → reglas → continuidad de entrenador de pruebas con cliente 22.0 → interfaz → una asignación ficticia autorizada → lectura/escritura denegada/revocación → retirada de ACL ficticia solo cuando se autorice. El agente no abrirá equipos reales para realizar estas comprobaciones.

Procedimiento Console por UID exacto y teamId exacto, propietario comprobado y tres campos schemaVersion/role/status; usuarios normales sin gestión de ACL. Costes acotados a asignaciones propias, cabeceras del equipo elegido y eventos/lápidas del partido seleccionado, sin polling global, estadísticas duplicadas o infraestructura nueva. Reversión limitada a código/reglas de esta fase, sin purgar IndexedDB, colas o datos deportivos. Prueba física y publicación/asignaciones quedan pendientes de autorización. Sin lectura o cambios de datos deportivos reales, cambios de reglas reales, permisos reales, commit, push o despliegue. **Fase cerrada y detenida para revisión.**


## 78. Fase 23.2 — Publicación controlada autorizada

31 de octubre de 2026. El usuario autoriza expresamente publicar 23.0, reglas y código, commits/push sin force y prueba temporal exclusivamente ficticia con revocación. Preflight remoto: main y Pages 22.0 esperados, 39 hashes HTTPS y reglas activas exactamente iguales a la base. Respaldo verificable conservado. Reglas nuevas publicadas: `projects/registro-defensivo/rulesets/f8b43ea9-7556-4ca3-9f76-96fbefec5734`, hash `e9f7a85f0dc5dcac07decdd7005f8ac9ddeb78991f47719ab16d50bd6d9a515d`; propietario existente y transporte 22.0 confirmados con tiro/Deshacer ficticios, acceso ajeno denegado. Interfaz y validación de ACL en curso; resultado final en FASE23_PUBLICACION.md. No tocar Authentication, datos reales o acumulado de develop.


**Cierre de Fase 23.2 — 31 de octubre:** publicación terminada y verificada. Propietario existente conserva permisos; registro/Deshacer ficticios confirmados. Chromium en HTTPS: Registro, Dashboard, Google, única asignación ficticia y escritura SDK denegada; revocación retira vista y deniega nuevas lecturas con misma sesión/recarga. Permiso conservado revoked, sin borrar equipos/partidos. Auth/Hosting/índices y datos deportivos reales intactos. Referencias y guía física/procedimiento administrativo en FASE23_PUBLICACION.md. No se requiere reversión ni se inicia otra fase.


## 79. Fase 24.1 — Entorno de desarrollo reproducible desde main 23.0

31 de octubre de 2026. Preparación local en clon independiente del main remoto 11cfed15f431b79c57f638a47fdedf3eaf9271eb, rama mantenimiento/fase24-1. Configuración de emuladores/Playwright, npm test/check y generación automática del paquete de subruta; sin dependencias nuevas. Guía vigente en [DESARROLLO.md](DESARROLLO-antes-de-24-2.md) y archivos/resultados/límites en [FASE24_1_ENTORNO.md](FASE24_1_ENTORNO.md).

Instalación reproducible correcta; 12 pruebas nativas, 63 scripts estáticos, tres tamaños de navegador, subruta sin red externa y 85 comprobaciones de reglas en emulador correctos. Pruebas históricas con commits/recibos o módulos retirados clasificadas sin cambiar producción. No se repite la campaña de seguridad completa. Los 43 archivos públicos, reglas y lockfile conservan sus bytes; develop conserva sus 368 rutas, estado Git y worktrees. Sin Firebase real, datos deportivos reales, cambios de producción, commits, push o despliegue. Fase cerrada localmente y detenida para revisión; no se inicia 24.2.
