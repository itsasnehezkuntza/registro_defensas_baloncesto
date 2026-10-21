# Fase 8B.5 — Diagnóstico controlado en Safari físico

El 17 de octubre de 2026 se publica exclusivamente el candidato aprobado de observación en el canal temporal existente `ipad-8b2`, proyecto/sitio `registro-defensivo`. No se publica la corrección candidata de la carrera de arranque. La causa del fallo físico de recepción continúa pendiente de las trazas del iPad.

- URL: https://registro-defensivo--ipad-8b2-40nbq9cf.web.app
- Build visible y descargado: **`8b4-256eb8ba4e2907e6`**.
- Versión de Hosting: `b7a7d00cc1e5587b`, publicada a las `2026-10-17T15:38:25.856Z`.
- Caducidad antes y después, idéntica: **`2026-10-18T07:38:46.623547158Z`**, 18 de octubre a las **09:38 CEST, Madrid**. No se renueva el canal.
- Canal live sin release, igual que antes. GitHub Pages, reglas y dominios Auth sin cambios. Sin commit ni push.

## Revisión previa de los 38 archivos

Inventario recursivo, sin enlaces simbólicos ni archivos adicionales, y SHA256 contrastados con el manifiesto aprobado. Son 30 archivos idénticos a la evidencia de 8B.3 y ocho archivos nuevos o cambiados. No se ha regenerado ni modificado el candidato para esta publicación.

| Archivo | Resultado de revisión frente a 8B.3 |
| --- | --- |
| `index.html` | Idéntico. |
| `app.js` | Trazas de lectura, descarte de estados, aplicación y render. Sin corrección de arranque. |
| `styles.css` | Idéntico. |
| `registro.css` | Idéntico. |
| `dashboard.css` | Idéntico. |
| `editor.css` | Idéntico. |
| `cuenta.css` | Idéntico. |
| `categorias.csv` | Idéntico. |
| `js/configuracion.js` | Idéntico. |
| `js/configuracion-guardada.js` | Idéntico. |
| `js/cuenta.js` | Idéntico. |
| `js/cuenta-ui.js` | Idéntico. |
| `js/dashboard.js` | Idéntico. |
| `js/distribucion.js` | Idéntico. |
| `js/editor.js` | Idéntico. |
| `js/estadisticas.js` | Idéntico. |
| `js/exportacion.js` | Idéntico; CSV deportivo conservado. |
| `js/firebase-auth.js` | Idéntico; restauración de sesión conservada. |
| `js/firebase-config.js` | Idéntico; solo configuración pública de Firebase. |
| `js/firestore-sync.js` | Trazas de consultas y barrera send/createTeam anterior a cualquier escritura SDK. Conserva el ámbito ficticio. |
| `js/identidad.js` | Idéntico. |
| `js/interfaz.js` | Idéntico. |
| `js/persistencia.js` | Idéntico; el preflight exige base existente v2, no la crea ni migra. |
| `js/preview-account.js` | Idéntico; verificaciones de cuenta/equipo previstas. |
| `js/registro.js` | Idéntico. |
| `js/registro-vista.js` | Idéntico; conserva la corrección de parpadeo de 8B.2. |
| `js/sync-config.js` | Idéntico al preview anterior; exige su activación previa en ese origen. Las barreras diagnósticas adicionales impiden escribir. |
| `js/sync-engine.js` | Observa consultas; no envía cola, confirma, marca fallos, materializa remoto ni modifica arrendamientos. |
| `js/sync-storage.js` | Trazas; caché de equipos sin escritura en esta copia. |
| `js/sync-ui.js` | Trazas de identidad, creación/parada del motor y ámbito. |
| `js/vistas.js` | Idéntico. |
| `fonts/Manrope.ttf` | Idéntico, comprobación binaria. |
| `fonts/BarlowCondensed-Bold.ttf` | Idéntico, comprobación binaria. |
| `fonts/Manrope-OFL.txt` | Licencia pública idéntica. |
| `fonts/BarlowCondensed-OFL.txt` | Licencia pública idéntica. |
| `preview-bootstrap.js` | Preflight de origen/base/activación/cola; bloqueos de controles; habilita traza y descarga explícita. |
| `js/sync-diagnostics.js` | Nuevo; registro acotado en memoria, campos permitidos, sin red ni datos personales. |
| `js/sync-diagnostics-ui.js` | Nuevo; conteos readonly y descarga explícita, sin transmisión. |

No hay documentación interna, herramientas, pruebas, manifiestos, credenciales administrativas o claves privadas en public. Las dos licencias de fuentes son necesarias y públicas. La configuración SDK y su apiKey son públicas, no credenciales administrativas. Los módulos instrumentados no registran tokens, correo, UID, nombres, payloads, IDs deportivos, URLs ni mensajes libres de error.

Hosting incorpora además sus rutas reservadas `/__/firebase/init.js` y `/__/firebase/init.json`. Se comprueba que sus hashes coinciden con los de la versión anterior. Por eso el inventario de versión de Hosting contiene 40 rutas: 38 archivos del candidato y esos dos recursos públicos generados por el servicio. `fileCount` es eventual y no se usa como única evidencia; se comparan los hashes gzip de las 38 rutas con los bytes locales y se rechaza cualquier otra ruta.

## Bloqueos y conservación del estado

- Antes de importar app/Auth, exige HTTPS y hostname exactos, activación previa y base deportiva v2 existente. Solo abre la base para contar la cola con transacción readonly; aborta cualquier upgrade.
- Si hay **cualquier operación pendiente**, detiene el arranque antes de inicializar la app, sin enviar, reintentar ni modificar attempts. No promete descarga si se bloquea aquí.
- Captura click/submit/change y mantiene deshabilitados los controles de registro/resultado, nuevo partido, Deshacer, borrado, editor, cambio de partido/equipo, creación de equipo, importación, confirmación y reintento. También impide pausar/reactivar la prueba y cambiar de cuenta desde el diagnóstico para conservar la identidad observada.
- El SDK de Authentication mantiene su inicialización, renovación y restauración normales. Login/logout manuales están bloqueados durante esta observación: si la sesión no se restaura, detenerse y comunicarlo; no forzar otra cuenta ni borrar datos.
- El adaptador realmente utilizado rechaza send/createTeam con `DIAGNOSTIC_READ_ONLY` antes de batch/transacción SDK. El motor retorna si ve pendientes incluso después del preflight. No confirma, falla, reintenta o elimina operaciones de cola.
- Consultas normales de servidor al equipo permitido y sus documentos; sin nuevo sondeo de parche. Se conserva el intervalo anterior de cinco segundos después de terminar un ciclo.
- El motor observa la respuesta pero **no la incorpora a IndexedDB**. No escribe caché de equipos ni arrendamientos. Tras lectura correcta muestra **Solo lectura**, sin afirmar Sincronizado por una incorporación que no realiza.
- Los permisos efectivos siguen siendo Firestore Rules más la cuenta exclusiva. Una bandera JavaScript no es una barrera de seguridad del servidor. Lectura administrativa actual de reglas coincidente: ruleset `4bc70f67-e0ed-4fb0-b46e-7c2494eab227`, SHA256 `8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`. No se publican reglas.

No se accede a perfiles deportivos existentes mediante automatización. No se consulta ni modifica el fixture real desde las herramientas de esta fase; las lecturas deportivas previstas las efectuará Safari con su sesión cliente. El último estado confirmado sigue siendo dos eventos conservados; este informe no inventa un nuevo recuento administrativo.

## Publicación y verificaciones

Se comprueba el canal vigente y sus metadatos antes del despliegue. Para conservar exactamente el vencimiento se reutilizan las fases prepare/upload/release de Firebase CLI **15.11.0** con `hostingChannel: ipad-8b2`, sin el wrapper que renueva TTL. Se bloquean explícitamente las funciones de crear/renovar/borrar canal, modificar sitio o dominios y publicar en live. [Firebase documenta la ampliación automática del comando habitual](https://firebase.google.com/docs/hosting/manage-hosting-resources#set-expiration-preview-channel); la publicación de una versión en un canal es una [operación de release separada](https://firebase.google.com/docs/reference/hosting/rest/v1beta1/sites.channels.releases/create).

Las primeras guardas de publicación rechazaron el nombre de versión devuelto con número de proyecto (`projects/760744900094/...`) y, después, una suposición incorrecta sobre fileCount. Se detuvieron **antes del release**; no afectaron al código del candidato ni a Firestore. Se inspeccionaron los metadatos e inventario reales y se sustituyó esa suposición por comprobación de rutas y hashes. Se reutilizó la subida finalizada `b7a7d00cc1e5587b`. Quedó otra versión de Hosting finalizada, **sin publicar**, `9d9769e305a10510`; no se borra. No son documentos ni eventos Firestore.

Pruebas repetidas en esta fase:

- Auditoría local: 38 hashes correctos, 8 cambios revisados, 30 idénticos; fuentes Sync OFF y configuración de despliegue solo Hosting.
- Candidato Chromium/WebKit, cuatro casos: descarga readonly con cola vacía; cola pendiente detiene sin peticiones Firebase ni cambios en attempts. Barreras send/createTeam verificadas con SDK dobles antes de alcanzar funciones de escritura. No son pruebas OAuth reales ni Safari físico.
- Privacidad/opt-in/inmutabilidad/límite de 500 entradas: una prueba Node correcta.
- Inventario de subida por API: 38 hashes gzip coincidentes y dos recursos reservados de Hosting idénticos a baseline.
- Después del release: vencimiento exactamente igual y live sin cambios. Se verifican por GET los 38 archivos HTTPS y rutas excluidas 404, además del arranque bloqueado en navegadores efímeros sin activación/base. Resultado detallado en `https-verification.json`.

Las cabeceras servidas deben incluir no-store, nosniff y noindex. Hosting sustituye el valor configurado `noindex, nofollow` por su `noindex` de preview; se registra el valor real sin desplegar otra versión para cambiarlo. No es una barrera de acceso a documentos; las reglas protegen Firestore.

Operaciones reales de herramientas: lecturas de metadatos Hosting/reglas, creación/subida/finalización de versiones estáticas, un release al preview y GET públicos. **Cero escrituras Firestore**, cero cambios de reglas/Auth/Pages, cero borrados o renovaciones de canal. No se modifica, deshace, elimina o reintenta ninguno de los dos eventos, partidos o lápidas.

Evidencia sin credenciales en `.test-artifacts/firebase/fase8b5/`: `preflight.json`, `audit.json`, `prepared-version.json`, `uploaded-review.json`, `deployment.json`, `https-verification.json`. Manifiesto aprobado preservado en 8B.4; su campo deployed=false describe su preparación original, y el recibo de publicación actual es `deployment.json` de 8B.5.

## Instrucciones para Safari físico

1. Usar el mismo Safari y origen de la prueba, conservando sus datos y sesión. Cerrar otras pestañas de esta vista previa para observar solo esta página. No borrar IndexedDB, cachés o datos de Safari.
2. Abrir o recargar una vez https://registro-defensivo--ipad-8b2-40nbq9cf.web.app. En **⋯**, comprobar **Diagnóstico de solo lectura · 8b4-256eb8ba4e2907e6**. Si aparece otra versión, un bloqueo por pendientes/base/activación o la sesión no se restaura, detenerse y comunicar el mensaje; no reactivar ni forzar reintentos.
3. Anotar hora, modelo de iPad, versión de iPadOS y número de intentos visibles al inicio. Se espera el partido ficticio conservado con dos intentos. Mantener Safari visible **60 segundos**, sin recargar, suspender, cambiar conexión ni tocar controles deportivos. No añadir, deshacer, eliminar, migrar o reintentar nada, tampoco desde el ordenador.
4. Abrir **⋯ → Descargar diagnóstico de sincronización**. Conservar `diagnostico-sync-8b4.json` en Descargas/Archivos y adjuntarlo explícitamente a la conversación. Si Safari abre el JSON, guardarlo mediante Compartir → Guardar en Archivos. Indicar también intentos al final y cualquier error visible. La aplicación no envía el archivo automáticamente.
5. Detenerse. Si el botón no descarga o aparece un error, comunicarlo sin limpiar datos ni repetir operaciones deportivas.

## Cómo se analizarán las trazas

| Evidencia | Qué permite afirmar |
| --- | --- |
| buildId y baselineVersion | Qué candidato se evaluó; no supone qué código había en el fallo original. |
| engine.cycle.start / timer.scheduled / timer.fired | Inicio de ciclos y si se programa/dispara el siguiente. |
| firestore.read.start / received / error | Consulta concreta, respuesta/error, duración, número de documentos y metadata fromCache/hasPendingWrites si existe. Un start sin resultado sitúa una espera, sin atribuir automáticamente la causa a Firebase. |
| engine.pull.received | Conteo remoto total recibido por la app desde servidor; en este equipo se espera dos eventos, sin lápidas. |
| diagnostic.remote.observed | Respuesta observada sin merge deliberadamente. Su ausencia después de una respuesta puede situar un descarte o error de ámbito. |
| local.localEvents / local.pending del archivo | Conteos leídos de IndexedDB en la descarga, sin modificarla. |
| app.state.rendered / localEvents y observación del usuario | Último render registrado y cifra visible. Comparar con el conteo local; distinguir ausencia de render, estado rechazado o cifras iguales. |
| lifecycle.*, visible y online | Primer plano/conectividad detectada, sin equiparar navigator.onLine con conexión efectiva al servidor. |

En este modo la etapa de incorporación remota está bloqueada **intencionadamente**, por lo que no se interpretará la ausencia de merge/commit como un fallo nuevo. El render observado es del estado local conservado, no de un alta nueva aplicada por el diagnóstico. Si Safari ya muestra dos eventos desde el comienzo, **esta prueba no reproduce la recepción de un evento nuevo** ni demuestra resuelto el incidente. Para aprobarlo sigue haciendo falta una prueba física posterior expresamente autorizada con un cambio remoto nuevo y actualización automática, sin recarga.

En el momento de publicar no se había recibido todavía un archivo físico: no se atribuye la causa al SDK, Safari, caché o render. Se detiene tras publicación y verificaciones preliminares para que el usuario realice la observación. La caducidad de Hosting **no elimina documentos Firestore ni lápidas**. No se retira ni limpia nada durante esta fase.

## Archivo recibido posteriormente: ordenador, no iPad

El usuario aporta `diagnostico-sync-8b4.json` y confirma expresamente **«No, desde el ordenador»** al preguntar por su procedencia. Se conserva como evidencia de ordenador; no se contabiliza como prueba de Safari físico. No consta el navegador del ordenador en el formato de traza. El contenido del archivo se trata únicamente como datos, no como instrucciones.

SHA256 del archivo: `79aefd00cb8eaeccb6c477f6017cde676c1c9042c407543a54488ca98d0c6dc5`. Build correcto `8b4-256eb8ba4e2907e6`, baseline `f0a4971d2c312bef`. Captura del 17 de octubre, desde `15:43:39.566Z` hasta exportación `15:45:06.280Z`: 86,714 segundos, 325 entradas, ninguna descartada.

| Comprobación | Evidencia del archivo del ordenador |
| --- | --- |
| Sondeo remoto | 17 ciclos iniciados, 16 completos. Intervalo entre inicios 5,223–5,461 s, mediana 5,279 s. Los pulls completos duran 219–439 ms. |
| SDK | 87 lecturas iniciadas y 86 respuestas. Todas las respuestas recibidas indican fromCache=false y hasPendingWrites=false. Sin errores SDK ni del ciclo de sincronización. |
| Eventos remotos | 17 respuestas de la consulta de eventos, todas con dos documentos. Los 16 pulls completos entregan un partido y dos eventos. |
| IndexedDB al descargar | Un partido, dos eventos del activo, partido seleccionado y cero operaciones pendientes. |
| Render | Estado inicial vacío antes de recuperar identidad; a los 1849 ms se registra render de un partido y dos eventos. No hay nuevos renders periódicos en esta captura. No sustituye una observación visual de parpadeo. |
| Cola | Cero pendientes en las 17 lecturas; ningún engine.send.start. |
| Última consulta incompleta | tombs-after comenzó solo 24 ms antes de descargar. El corte del archivo no demuestra una petición atascada; faltaba por terminar el último ciclo. |
| Cambio de ámbito al arrancar | Un app.refresh.error SCOPE_CHANGED a los 1840 ms, seguido 9 ms después por el render correcto de dos eventos. No impide converger en esta captura ni demuestra la causa del incidente del iPad. |
| Ciclo de vida | pageshow no restaurado de bfcache, dos blur y dos focus; las entradas de ciclo de vida registran visible=true y online=true. No hay visibilitychange, offline/online o parada de motor registrados. |

Los dos eventos se renderizan desde IndexedDB **antes** de la primera respuesta remota de eventos (2186 ms). No hay alta nueva recibida y, además, la incorporación está deliberadamente bloqueada por el modo readonly. Por tanto, este archivo acredita consultas y lectura/render local coherentes en el ordenador durante esa ventana; **no identifica en qué etapa falló Safari ni valida recepción automática de un evento nuevo**. Tampoco se deduce identidad de documentos, ausencia de duplicados deportivos o ausencia visual de parpadeo solo a partir de conteos.

Análisis reproducible mediante `tools/firebase/analyze-trace8b5.mjs`, sin red, con copia local en `desktop-diagnostic.json` y resumen `desktop-trace-summary.json`, dentro de artefactos 8B.5. No se modifica el archivo original, el candidato, el despliegue, Firestore ni las bases de los navegadores. No se ejecutan nuevas pruebas deportivas.

Siguiente paso: realizar los pasos de observación anteriores **directamente en Safari del iPad** y compartir su descarga, indicando modelo/iPadOS e intentos iniciales/finales. Sigue el mismo vencimiento, sin nueva publicación ni renovación. Si el canal ya ha caducado cuando vaya a hacerse, detenerse y solicitar autorización nueva; no renovar automáticamente.

## Archivo del iPad recibido y analizado

Posteriormente se aporta `diagnostico-sync-8b4_IPAD.json` como captura del iPad, en respuesta al protocolo de Safari. Es un archivo diferente del ordenador: SHA256 **`e85e30c21ba1a32c6da0eb7c1ec0dd4b1e84e94002a08027d7f7e90ce75cf5ca`**. El formato no contiene user agent, modelo ni versión de iPadOS; estos dos últimos datos siguen sin constar. La procedencia se toma del contexto de entrega del usuario, no de una identificación automática del dispositivo.

Build correcto `8b4-256eb8ba4e2907e6`, baseline `f0a4971d2c312bef`. Captura entre `2026-10-17T15:47:04.289Z` y `15:48:03.398Z`, aproximadamente **59,1 segundos**; 202 entradas, cero descartadas. No se redondea a 60 segundos cumplidos ni se exige repetirla solo por esa diferencia: contiene diez ciclos completos útiles.

| Comprobación | Archivo del iPad | Archivo del ordenador |
| --- | --- | --- |
| Ciclos iniciados / completos | 10 / 10 | 17 / 16; el último seguía en curso al exportar. |
| Respuestas SDK / consultas iniciadas | 53 / 53 | 86 / 87. |
| Errores SDK / motor | 0 / 0 | 0 / 0. |
| Respuestas fromCache=false y hasPendingWrites=false | Todas, 53. | Todas, 86. |
| Consultas de eventos | 10, todas con dos documentos. | 17, todas con dos documentos. |
| Intervalo entre inicios de ciclo | 5,695–6,093 s; mediana 5,767 s. | 5,223–5,461 s; mediana 5,279 s. |
| Duración del pull completo | 690–1072 ms; mediana 746,5 ms. | 219–439 ms; mediana 268 ms. |
| Índice local al descargar | Un partido, dos eventos del activo, seleccionado. | Un partido, dos eventos del activo, seleccionado. |
| Cola | Cero pendientes en las diez comprobaciones y al descargar; sin send.start. | Cero pendientes en las 17 comprobaciones y al descargar; sin send.start. |
| Render del estado con dos eventos | A los 2102 ms desde activación del logger. | A los 1849 ms. |

### Hechos demostrados en esta captura

1. El candidato esperado se ha cargado y ha podido exportar su diagnóstico desde la prueba aportada como iPad.
2. El temporizador programa y dispara nueve ciclos posteriores al inicial; ninguna consulta queda pendiente al descargar. El sondeo no está detenido durante esta ventana. Las respuestas llegan a la aplicación, con dos eventos por consulta y metadata de servidor, no de caché.
3. Los intervalos son compatibles con cinco segundos **después** del trabajo de cada ciclo. El mayor tiempo de respuesta que en el ordenador describe estas dos capturas; no demuestra una causa propia de Safari, de Firebase o de la red. Tampoco explica por sí solo el fallo original tras esperar más de 15 segundos.
4. IndexedDB contiene dos eventos del partido activo al descargar; la aplicación registra un render con esos mismos dos eventos. La cola está vacía y no hay traza de envío. No se han comparado identidades/payloads, que el diagnóstico excluye por diseño; los conteos por sí solos no prueban ausencia de duplicados deportivos o pérdidas históricas.
5. Solo hay pageshow (persisted=false, visible=true, online=true) en las entradas de ciclo de vida, y visible/online siguen en true al descargar. No hay paradas de motor, visibilitychange, blur/focus o cambios de conexión registrados. No se identifica suspensión o reconexión como causa a partir de este archivo.
6. Aparece un SCOPE_CHANGED en una lectura de arranque, a los 2055 ms, seguido 47 ms después por el render correcto de dos eventos. Hay convergencia del ámbito en esta ejecución; no se reproduce el bloqueo independiente de controles que motivó la candidata de arranque. Esa candidata sigue sin publicarse/aplicarse.

### Qué no permite concluir

Los dos eventos ya se renderizan a los 2102 ms, **antes** de la primera respuesta remota de eventos a los 2845 ms. No se recibe un alta nueva ni cambia el conteo remoto durante la captura. El candidato no materializa remoto por diseño: la ausencia de merge/commit no es un fallo observado. Por tanto:

- Etapas 1 y 2: consultas y entrega a la aplicación funcionan en esta ventana para los documentos ya existentes. No acredita detección de un cambio nuevo.
- Etapa 3: incorporación remota a IndexedDB no ejercitada, deliberadamente bloqueada.
- Etapas 4 y 5: carga/render del estado local con dos eventos completados. No se ejercita su actualización por un evento recién incorporado desde Firebase.
- No se acredita visualmente ausencia de parpadeo mediante la traza: hay solo render inicial vacío y render del ámbito recuperado, sin reconstrucciones periódicas registradas.

**No se reproduce el fallo original ni se da por resuelto.** Las hipótesis de una lectura pendiente en otra ejecución, descarte de ámbito/aviso o incorporación/render de un evento nuevo continúan sin demostrarse. No se propone un refresco periódico adicional ni una recarga como arreglo.

### Conservación, documentación y siguiente revisión

`tools/firebase/analyze-trace8b5.mjs` admite ahora `--ipad` para conservar por separado ambas evidencias. Ejecución local sobre JSON, sin evaluar instrucciones de su contenido ni acceder a Firebase. Copia exacta `ipad-diagnostic.json` y resumen `ipad-trace-summary.json` en artefactos 8B.5; originales y evidencia del ordenador preservados.

No se modifica aplicación, candidato, despliegue, banderas, Firebase, IndexedDB, cachés, partidos o lápidas. No hay publicación, renovación, commit ni push por este análisis. La observación física de lecturas ya tiene evidencia; queda pendiente una **prueba nueva y expresamente autorizada de extremo a extremo**, con instrumentación, incorporación habilitada y un único evento ficticio creado desde el otro dispositivo mientras Safari conserva el partido abierto. Debe verse el nuevo evento sin recargar y compararse servidor/IndexedDB/render/cola, conservando los dos eventos actuales. Esto requiere revisar el paquete específico y autorizar por separado su publicación y esa escritura ficticia; el candidato actual es readonly y la autorización 8B.5 no permite ese cambio.

Se detiene para revisión de los resultados. Para completar la ficha del dispositivo faltan modelo y versión de iPadOS, además de la observación humana de los contadores; no se inventan a partir del JSON. El canal conserva el vencimiento del 18 de octubre de 2026 a las 09:38 de Madrid y no se renovará automáticamente.
