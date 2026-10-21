# Fase 8B.6 — Incorporación remota controlada en Safari/iPad

## Alcance y estado actual

Autorización expresa: actualizar solo el canal temporal vigente `ipad-8b2`, permitir incorporación remota en Safari, crear **exactamente un** evento ficticio desde el ordenador en el partido iPad conservado y efectuar las lecturas de verificación. No incluye segundo registro, Deshacer, borrado, migración, renovación de canal, reglas, producción, Pages, commit o push.

**Prueba controlada real completada con resultado favorable y trazas analizadas.** Safari recibe el tercer evento, lo incorpora y renderiza sin recargar; ambos dispositivos terminan con tres IDs locales distintos y cola cero. Firebase conserva exactamente el único nuevo y los dos originales intactos. El iPad conserva la secuencia crítica completa; el búfer circular ha descartado parte anterior, incluida la confirmación inicial del PC. Una ejecución favorable no demuestra resuelto definitivamente el fallo original. Se detiene para revisión, sin nuevas escrituras o despliegues.

- Proyecto/sitio: `registro-defensivo`.
- Receptor Safari: https://registro-defensivo--ipad-8b2-40nbq9cf.web.app
- Emisor ordenador: https://registro-defensivo--ipad-8b2-40nbq9cf.web.app/?fase8b6=ordenador
- Build: **`8b6-7e84948603a7340a`**.
- Versión Hosting: **`66b5b0e84b947945`**, publicada `2026-10-17T16:11:06.860Z`.
- Vencimiento antes/después idéntico: `2026-10-18T07:38:46.623547158Z`, **18 de octubre, 09:38 de Madrid**. No se renueva.
- Las URLs comparten origen y datos de cada navegador, sin requerir borrar Safari ni abrir una base nueva. El parámetro distingue controles de prueba; no es una autorización de seguridad del servidor.

## Verificaciones previas y conservación

1. Se releen AGENTS, especificación y código real del candidato anterior, transporte, motor, IndexedDB y render. No se aplica la corrección candidata de arranque de 8B.4 ni se añade otro sondeo/recarga.
2. Lectura administrativa de metadatos: canal vigente, versión anterior `b7a7d00cc1e5587b`, live sin release; reglas coincidentes con `firestore.rules`, mismo ruleset `4bc70f67-e0ed-4fb0-b46e-7c2494eab227` y SHA256 `8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`. Sin publicar reglas.
3. Lectura acotada al equipo ficticio `PRUEBA 8B.2 IPAD`, ID `prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778`: propietario corresponde a la huella de cuenta exclusiva, un partido vivo `0f901d0f-9885-499d-b40d-2e0234f51ad0`, jornada `IPAD-8B2`, rival `Rival ficticio`, dos eventos originales, cero lápidas de Deshacer. No se listan usuarios/equipos ajenos ni datos de producción.
4. IDs originales: `0ad91a0a-5b4b-4bf2-8c38-fe975e43e090` y `f5270206-1f1a-41c1-a98f-b4467891f125`. Huellas de payload guardadas antes del registro, respectivamente `0b36b7ececd95d34bc3ad7f4c32f50bf65861e5a4e5c15a9806981eae4314e92` y `6fa654a2f79636658e941ac25b8b480b16ece72c4df344a71352e9fec9199b9e`. El informe no almacena credenciales ni el UID real.
5. Las capturas 8B.5 acreditan dos eventos locales/renderizados en ambos dispositivos en su momento; se exige una comprobación **nueva** en cada navegador antes de esta prueba. No se considera el dato antiguo suficiente.

## Cambios limitados del candidato

39 archivos por lista explícita, manifiesto fuera de public. **35 idénticos al diagnóstico 8B.5 y cuatro nuevos/cambiados**:

| Archivo público | Función y límite |
| --- | --- |
| `preview-bootstrap.js` | Nuevo build y montaje de los controles específicos. Conserva preflight HTTPS/origen/activación/base v2/cola global vacía y bloqueo de todos los controles deportivos, Deshacer, borrado, importación, reintento y cambio de identidad/equipo/partido. |
| `js/sync-engine.js` | Incorpora con el merge habitual únicamente después de preparar la recepción y validar el fixture. Mantiene cola sin envío, transporte bloqueado, sin arrendamientos ni reintento manual. Conflictos o discrepancias detienen el motor. Mismo intervalo de cinco segundos después del ciclo. |
| `js/sync-diagnostics-ui.js` | Descarga `diagnostico-sync-8b6.json`; añade estado de preparación, conteo visible y número de IDs locales distintos, sin exportar IDs/payloads/cuentas. Lecturas readonly; sin envío automático del archivo. |
| `js/diagnostic8b6.js` | Nuevo módulo temporal: comprobación de preparación, guarda anterior al merge y botón del único evento ficticio en modo ordenador. |

No se publican herramientas, pruebas, informes, credenciales privadas o manifiestos. Se revisan los 39 hashes locales y subidos, y las dos rutas públicas de configuración que genera Hosting, idénticas a las anteriores. Configuración separada `firebase.diagnostic8b6.preview.json`, solo Hosting; root Sync false/false/false y GitHub Pages sin cambios.

### Safari: recepción sin envío

- El preflight exige IndexedDB v2 existente y cero operaciones pendientes globales; aborta creación/upgrade. Si hay pendientes, se conservan sin procesar.
- El transporte anterior mantiene send/createTeam rechazados antes de batch/transacción SDK. El motor no envía, confirma, marca fallos o reintenta cola. El módulo de escritura adicional rechaza su entrada si la URL no es el modo ordenador.
- Todos los controles deportivos normales continúan bloqueados, incluidos nuevo partido, Deshacer, eliminar, asistente, reintento y editor. No se modifica la aplicación normal ni su guardado local-first para esta instrumentación.
- Antes de pulsar Preparar, el sondeo solo observa. Preparar verifica mediante SDK cliente propiedad/membresía, proyecto/cuenta exclusiva/equipo, partido seleccionado, exactamente los dos IDs esperados, igualdad de payloads local/remoto (sin comparar el seq local), pantalla con dos y cola vacía. Un error bloquea, sin intentar corregir.
- Solo después se permite merge remoto al IndexedDB propio. Se rechazan partidos adicionales, cambio de jornada/rival/IDs, lápidas, evento desconocido, originales cambiados, duplicados de payload.id o cualquier cuenta/ámbito distinto. Solo se admite el tercer ID reservado. El merge conserva los eventos existentes y notifica después del commit; el estado y la pantalla siguen su recorrido habitual.
- Muestra Recepción activa y detalla los envíos bloqueados; no equivale a una validación completa ni habilita registro en Safari.

### Ordenador: un único evento, sin cola general

El modo ordenador usa el mismo receptor y bloqueos deportivos. Añade un botón separado **Registrar el ÚNICO tiro ficticio (2 fallado)**, disponible solo tras su preparación. El usuario debe confirmar también la preparación del iPad antes de pulsarlo.

- ID reservado y estable para toda la prueba: `prueba8b6-95424bdd-8861-43b2-a547-a7afab568e64`. No se genera otro ID al recargar o ante error.
- Un marcador de intento se guarda **antes** de consultar/escribir; se consume incluso si hay error. Doble toque, clic repetido o recarga no autorizan un segundo intento. No hay botón de reintento.
- Se comprueban de nuevo cuenta/contexto, servidor/local/pantalla en dos y cola vacía. El SDK modular oficial, con la sesión de la cuenta de pruebas, ejecuta una transacción online con `maxAttempts:1`. No se usa credencial administrativa para escribir.
- La transacción lee partido, miembro, evento reservado, originales y lápidas relevantes. Debe conservarse el partido, la membresía y los payloads originales; evento reservado/lápidas deben estar ausentes. Solo hace **un set** del evento reservado, nunca update/delete de documentos existentes.
- Payload basado en la acción ficticia original, ID nuevo reservado, 2 fallado, fecha nueva, sin copiar seq. Conserva IDs/configuración deportivos. createdAt es serverTimestamp y sourceId estable. Firestore Rules siguen validando dueño/membresía y campos.
- Tras confirmación de transacción, una nueva consulta de servidor debe devolver exactamente los tres IDs previstos y originales sin cambios. Solo entonces muestra **Servidor confirmó 3 eventos**. Ante resultado incierto se detiene: no se registra otro tiro para probar.

Este emisor es una operación de diagnóstico online específica, no habilita la cola deportiva de la aplicación ni pretende volver a probar el guardado local-first de 8B. La prueba actual se concentra en recepción → commit IndexedDB → estado → render de Safari. Las banderas/parametrización cliente no sustituyen Rules; la cuenta exclusiva carece de datos reales conocidos y las operaciones del módulo están acotadas al fixture.

## Pruebas ejecutadas

Prueba final con SDK oficial/Firestore Emulator `demo-defensas`, reglas previstas, dos contextos e IndexedDB independientes, paquete candidato (inyectando únicamente conexión Auth/proyecto/origen de Emulator):

| Caso | Chromium | WebKit automatizado |
| --- | --- | --- |
| Preparación en ambos con dos eventos | Correcta. | Correcta. |
| Un clic en emisor y recepción sin recarga ni ciclo forzado | 4120 ms hasta tres visibles. | 4690 ms hasta tres visibles. |
| Servidor y receptor | Tres eventos, tres IDs distintos. | Tres eventos, tres IDs distintos. |
| Cola del receptor / envío de motor | Cero / ninguno. | Cero / ninguno. |
| Trazas de validación, merge confirmado, aviso DOM y render | Presentes. | Presentes. |
| Borrado/Deshacer/importación/reintento/nuevo partido | Controles bloqueados. | Controles bloqueados. |
| Doble clic y recarga del emisor | No duplican ni vuelven a habilitar el registro. | No duplican ni vuelven a habilitar el registro. |
| Acceso al escritor en modo receptor | Rechazado antes del SDK. | Rechazado antes del SDK. |
| Cola pendiente al arrancar | Se detiene; attempts=0 conservado. | Se detiene; attempts=0 conservado. |
| Descarga | Cola cero, tres locales/visibles/distintos; sin ID de partido en JSON. | Igual. |

El harness inicial necesitó esperar la disponibilidad efectiva de Auth simulado. Su documento servido solo mediante interceptación causaba un bloqueo CORS de acceso al espacio loopback, confirmado en la consola del navegador. Se pasó a servir el HTML desde un servidor HTTP loopback real, sin cambiar el producto para ocultar errores. También se reutilizó una sola instancia SDK por navegador, como hace el candidato, en lugar de abrir varias por comprobación. Los tiempos anteriores corresponden a la ejecución final completa. Cancelaciones de canales al recargar/cerrar contextos y el bloqueo intencionado con pendientes quedan en la salida de pruebas; no se extrapolan al fallo físico.

WebKit automatizado **no es Safari físico**. En estas pruebas no se usan cuentas reales ni se escribe en Firebase real. El candidato no incluye la corrección independiente de arranque.

## Publicación autorizada y verificaciones HTTPS

Se reutiliza upload/finalización/release de Firebase CLI 15.11.0, sin wrapper que renueva TTL. Guardas impiden crear/renovar/borrar canal, tocar live/sitio/Auth y publicar reglas. Se comprueban versión anterior, canal aún vigente y caducidad antes de subir y antes del release.

Recibo: 39 archivos, versión `66b5b0e84b947945`, build `8b6-7e84948603a7340a`. Caducidad exacta conservada y live sin cambios. HTTPS: **39 hashes correctos**, no-store/nosniff/noindex, **10 rutas privadas/internas 404**. En navegadores efímeros Chromium/WebKit sin activación/base, bloquea antes de app: cero bases creadas y cero solicitudes Firebase. No se usan perfiles deportivos para esta comprobación.

Operaciones reales hasta terminar la publicación: lecturas administrativas acotadas de reglas/Hosting/fixture ficticio, publicación de archivos estáticos al canal autorizado y GET públicos. Cero eventos nuevos en esa preparación. Después el usuario ejecuta el paso humano autorizado y queda confirmado el único evento nuevo, según la evidencia posterior. No se modifican los dos originales ni sus lápidas. Ningún commit, push, cambio de Pages/reglas/Auth o renovación.

## Protocolo físico, por etapas

### A. Preparación confirmada por el usuario

1. Cerrar otras pestañas de este preview, sin borrar datos. Usar las mismas sesiones y cuenta exclusiva de pruebas.
2. En iPad, abrir la URL receptora, comprobar build en ⋯ y pulsar **Comprobar y preparar recepción**.
3. En ordenador, abrir URL con `?fase8b6=ordenador`, comprobar mismo build y pulsar **Comprobar y preparar ordenador**.
4. Ambos deben decir **Preparado · Firebase 2 · local 2 · pantalla 2 · cola 0** y cuenta/equipo/partido verificados. Si no, detenerse y descargar/copiar el mensaje, sin registrar ni recargar para resolverlo.
5. Comunicar la preparación de ambos antes de dar el paso de registro. Esto acredita el estado físico actual, no es una nueva solicitud de permiso para la escritura ya autorizada.

Resultado recibido: **«Ambos preparados: 2 / 2 / 2 y cola 0»**, en respuesta a la comprobación de build `8b6-7e84948603a7340a`, sesiones, cuenta/equipo/partido y botones de preparación de ambos. Confirmación manual diferenciada de los informes descargables; permite pasar al único registro ya autorizado. No acredita todavía creación/recepción del tercero. No se pide volver a preparar ni recargar Safari.

### B. Solo después de confirmar A

1. Mantener Safari visible en el partido y sin cambiar pestaña/conectividad.
2. Desde el ordenador pulsar **una sola vez** Registrar el ÚNICO tiro ficticio. Esperar **Servidor confirmó 3 eventos**; si no llega o da error, detenerse y no repetir.
3. Sin recargar Safari, observar como máximo 60 segundos. Debe pasar a tres intentos. No registrar desde Safari, deshacer, borrar, migrar o reintentar.
4. Tanto si llega como si no, descargar **antes de recargar/cerrar**: ⋯ → Descargar diagnóstico de sincronización. Archivo `diagnostico-sync-8b6.json`; identificarlo como iPad al compartirlo. Descargar también el del ordenador para conservar el instante de confirmación; archivos separados.
5. Comunicar conteos visibles finales, mensaje del ordenador, modelo/iPadOS y compartir archivos. No repetir con otro evento.

## Criterios de interpretación de la prueba real

- Reconstruir consulta servidor → primera respuesta con tres → validación de IDs/ámbito → storage.merge.start/committed → storage.remote.notify → app.remote.received → refresh.read → state.rendered con tres. Comparar conteo local y visible/uniqueEvents del archivo; cola debe seguir cero.
- Diferenciar fallo de lectura, espera SDK, validación detenida, transacción IDB abortada, aviso no recibido, estado descartado o render atrasado. No aplicar correcciones sin traza que lo sostenga.
- Para tiempo desde confirmación del ordenador, contrastar las dos capturas con prudencia: sus relojes pueden diferir. Los intervalos dentro de Safari son monotónicos. Leer después el timestamp real de creación del tercer documento y confirmar que los originales conservan huellas/timestamps, que hay tres IDs distintos y ninguna lápida nueva. Usar `preview-read-fixture.mjs --8b6 --after` para no sobrescribir baseline.
- Una única ejecución satisfactoria no demuestra que el fallo original esté definitivamente resuelto. Si falla, conservar los tres eventos y las trazas; no recargar o reintentar antes de descargarlas, no forzar resolución.

## Archivos y evidencia

### Resultado real preliminar posterior al registro único

Tras confirmar preparación en ambos y recibir el paso de un único clic, el usuario comunica **«Tardó poco un par d esegundos»**, en respuesta a comprobar aparición de tres intentos en Safari sin recargar. Se registra como confirmación manual de recepción automática, tiempo aproximado, no medición extraída de una traza.

Lectura administrativa limitada al mismo fixture a `2026-10-17T16:20:18.616Z`: **tres documentos de evento**, exactamente los dos IDs originales y el ID reservado `prueba8b6-95424bdd-8861-43b2-a547-a7afab568e64`; ningún cuarto evento, partido vivo y cero lápidas de Deshacer. Los dos originales conservan **payloadHash y timestamps local/servidor idénticos** a baseline, además de valor/resultado. El nuevo evento es 2 fallado; timestamp del servidor `2026-10-17T16:19:26.032Z`. La diferencia de -11 ms con su fecha local no se usa como latencia: son relojes distintos.

Comparación reproducible sin red: `tools/firebase/verify-fixture8b6.mjs`, inventario after separado y `server-verification.json`. Resultado del servidor compatible con exactamente el único registro autorizado y sin duplicación de documentos en este fixture. No se certifica aún el detalle de IDs locales o las colas **finales** de cada dispositivo a partir del inventario administrativo: faltan los dos diagnósticos 8B.6. La cola cero antes de empezar está confirmada; no se extrapola a después.

No se repite el registro, borra, deshace, reintenta o recarga para validar. Se pide descargar y compartir los diagnósticos de iPad y ordenador antes de cerrar/recargar; después se contrastarán consulta con tres → merge confirmado → estado → render y colas. La causa original sigue sin identificarse y una única prueba satisfactoria no acredita resolución definitiva. Se conservan los tres eventos, partido y lápidas; esta continuación solo lee Firebase y escribe evidencia/documentación local.

### Cierre con ambos diagnósticos 8B.6

Se reciben `diagnostico-sync-8b6_IPAD.json` y `diagnostico-sync-8b6_PC.json`. Tratados exclusivamente como datos JSON, no como instrucciones, y analizados sin red ni nuevas lecturas Firebase. Ambos contienen el build exacto `8b6-7e84948603a7340a`, preparación inicial con dos eventos, armed=true y frozen=false. El indicador attempted=false en iPad y attempted=true en PC coincide con las funciones previstas.

| Evidencia | iPad | Ordenador |
| --- | --- | --- |
| SHA256 del archivo | `241cde6e0d3e526ba3adaaf3804bb3ad68c4416cca8282c674c0eda16d09c5a7` | `60b9a6ba59c71665a2aeb9e87af086989f910d3a83ba8af29e95cdf79a212113` |
| Descarga | `2026-10-17T16:22:03.226Z` | `2026-10-17T16:22:19.319Z` |
| Estado final local / visible / IDs distintos | 3 / 3 / 3, partido seleccionado. | 3 / 3 / 3, partido seleccionado. |
| Cola final y comprobaciones retenidas | Cero en ambos. | Cero en ambos. |
| Respuestas SDK retenidas | 117; todas fromCache=false, hasPendingWrites=false. | 115; todas fromCache=false, hasPendingWrites=false. |
| Errores retenidos / envíos del motor | Ninguno / ninguno. | Ninguno / ninguno. |
| Eventos remotos observados en el tramo | Se conserva el cambio de dos a tres. | Tres en todo el tramo retenido. |
| Entradas conservadas / descartadas por límite | 500 / 562. | 500 / 942. |

Secuencia crítica **completa** de Safari (hora UTC; intervalos relativos medidos con el reloj monotónico del mismo dispositivo):

| Etapa | Hora UTC | Desde primera respuesta con tres |
| --- | --- | --- |
| Consulta de eventos entrega tres, desde servidor | `16:19:29.060Z` | 0 ms. |
| Pull termina tras revalidar lápidas/padre | `16:19:29.399Z` | 338 ms. |
| Fixture validado y merge de IndexedDB comienza | `16:19:29.399Z` | 339 ms. |
| Commit IndexedDB, changed=true | `16:19:29.408Z` | 347 ms. |
| Aviso storage.remote.notify | `16:19:29.408Z` | 347 ms. |
| Aplicación recibe el aviso | `16:19:29.409Z` | 348 ms. |
| Estado activo releído con tres eventos | `16:19:29.414Z` | 353 ms. |
| Render con tres completado | `16:19:29.429Z` | **368 ms**. |

El merge tarda 8 ms y desde commit hasta render pasan 21 ms, según el logger monotónico. Los primeros 338 ms incluyen las lecturas de seguridad finales del pull, no una espera de IndexedDB. La pequeña diferencia entre milisegundos civiles y monotónicos refleja relojes/muestreo distintos; no se fuerzan para hacerlos idénticos.

Se conserva una consulta con dos eventos a `16:19:23.276Z` y la posterior con tres a `16:19:29.060Z`, junto con un solo commit visible y un solo render de tres en ese tramo. No hay recarga, online/focus que fuerce lectura ni parada de motor registrada en el tramo de Safari. Se concilia con la confirmación del usuario de recepción automática sin recargar. La captura se mantiene visible/online al descargar. La ventana inicial de ciclo de vida fue descartada: no se extrapola al arranque completo.

El timestamp real de creación del evento es `16:19:26.032Z`; la resta civil hasta render es 3397 ms. **Es una referencia aproximada entre relojes distintos, no una latencia exacta.** La observación humana de «un par de segundos» sigue siendo aproximada. No se inventa un instante de confirmación del PC: su entrada single-write.confirmed y su primer merge/render de tres ya no están en el búfer.

### Conclusión, límites y conservación final

- Esta ejecución acredita las cinco etapas en Safari físico aportado: lectura de un cambio nuevo, recepción por el motor, incorporación atómica local, actualización de estado y render, sin recarga. No se observa interrupción en ninguna de ellas.
- Servidor: tres documentos distintos con exactamente el ID nuevo reservado, originales con hashes/timestamps intactos y cero lápidas. Cada archivo cliente termina con tres IDs deportivos distintos, tres visibles y cola cero. No se observa duplicación o pérdida en la prueba controlada. El formato excluye IDs/payloads finales por privacidad: la coincidencia exacta del fixture se basa también en las guardas antes de merge, no en una exportación completa de datos deportivos.
- La única escritura autorizada queda consumida. No se repite para conseguir más logs. El PC sí conserva estado final y marcador de intento, pero no toda la secuencia de envío; la lectura independiente del servidor confirma el documento persistido. El límite de 500 entradas descarta por diseño 562 y 942 antiguas, respectivamente. No es prueba de pérdida deportiva; es una limitación del diagnóstico.
- No se certifica ausencia de errores fuera del tramo conservado ni ausencia visual de parpadeo solo con logs. Modelo/iPadOS siguen sin constar. No se atribuye causa al fallo original ni se declara corregido definitivamente por una sola ejecución.
- No se aplica la candidata de arranque, otro refresco periódico o corrección adicional. No se habilita producción, migración, borrado, Deshacer, regla nueva ni segundo evento. No hay commit/push o nuevo despliegue/renovación por el análisis.
- Se conservan los tres eventos ficticios, partido y lápidas. La versión temporal queda en su caducidad ya establecida; su expiración no elimina datos Firestore. Se detiene la Fase 8B.6 para revisión, sin iniciar otra.

Análisis reproducible: `tools/firebase/analyze8b6.mjs` sobre ambos archivos originales. Copias exactas `ipad-diagnostic.json`/`pc-diagnostic.json` y `trace-analysis.json` en artefactos 8B.6, sin sobrescribir las evidencias 8B.5. `server-verification.json` se conserva como recibo anterior (su campo pending describe el estado previo a recibir trazas); el informe consolidado actual es `trace-analysis.json`.

Nuevos: `tools/firebase/preflight8b6.mjs`, `diagnostic8b6-client.js`, `prepare8b6.mjs`, `audit8b6.mjs`, `receive8b6.test.mjs`, `deploy8b6.mjs`; `firebase.diagnostic8b6.preview.json`; este informe. Modificados: modo receive8b6 en `emuladores.mjs`, lectura acotada con salida separada/huellas en `preview-read-fixture.mjs`, verificación HTTPS con salida 8B.6 en `verify-deployed8b5.mjs`, especificación. Sin cambios en módulos deportivos normales o reglas.

Posteriormente se añaden las herramientas locales de comparación `verify-fixture8b6.mjs` y `analyze8b6.mjs`; no forman parte del paquete publicado.

Evidencia local `.test-artifacts/firebase/fase8b6/`: preflight, read-fixture, candidate/manifest, audit, emulator, prepared-version, uploaded-review, deployment y https-verification. Diagnósticos técnicos sin PII; ninguna credencial en los informes. El origen y documentos ficticios se conservan. La caducidad de Hosting no elimina Firestore ni sus lápidas.
