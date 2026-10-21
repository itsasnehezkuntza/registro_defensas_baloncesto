# Fase 8B.7 — Validación de estabilidad en Safari físico

## Estado y límite de autorización

**Cierre: escenarios físicos A, B y C favorables en las ejecuciones aportadas; seis eventos conservados (tres iniciales y los tres nuevos autorizados), ambos dispositivos con seis IDs locales distintos y cola cero. No se permiten más registros bajo esta autorización. Build `8b7-834293ccb97ae892`, Hosting `c64f791bfdcd2552`, sin nuevos despliegues por el análisis. Causa original desconocida; producción no activada. Detenido para revisión.**

La respuesta posterior del usuario «Sí» autoriza la publicación del candidato exacto, solo en el canal vigente y sin ampliar su caducidad. El apartado final documenta esa ejecución; las secciones de preparación siguientes conservan las decisiones y límites anteriores a la autorización.

El usuario autoriza hasta tres eventos nuevos exclusivamente en el equipo/partido ficticios de iPad. Prohíbe migración, Deshacer, borrado, cambios de reglas/Pages/producción, commit/push y corrección especulativa. Su solicitud añade expresamente: **«si la versión de prueba ha caducado o es necesaria una nueva publicación, detenerse y solicitar permiso»**. Por eso los eventos autorizados no se ejecutan con un método alternativo para eludir la versión actual; se prepara un resultado revisable y se detiene antes de publicar.

## Entorno real contrastado, solo lectura

- Proyecto/sitio `registro-defensivo`, canal `ipad-8b2`, URL existente `https://registro-defensivo--ipad-8b2-40nbq9cf.web.app`.
- Comprobación inicial `2026-10-17T17:17:20.440Z`; cierre de preparación `17:26:53.165Z`: canal vigente, versión publicada **`66b5b0e84b947945`**, build 8B.6, sin sustitución.
- Caducidad exacta conservada **`2026-10-18T07:38:46.623547158Z`**, 18 de octubre a las **09:38 de Madrid**. No renovación ni creación de otro canal. Deberá comprobarse otra vez antes de cualquier publicación autorizada; si caduca, esta propuesta de publicar solo en canal vigente ya no basta.
- Reglas reales coincidentes con las previstas: ruleset `4bc70f67-e0ed-4fb0-b46e-7c2494eab227`, SHA256 `8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`. Live sin release, igual que antes. No se modifican reglas/Auth/dominos/Pages.
- Lectura exclusiva del fixture a `17:23:13.024Z`: equipo `PRUEBA 8B.2 IPAD`, partido vivo `0f901d0f-9885-499d-b40d-2e0234f51ad0`, tres eventos, cero lápidas de Deshacer. Sus IDs, payloadHash y fechas local/servidor coinciden exactamente con el cierre 8B.6, incluida su tercera acción. `baseline-verification.json` conserva esa comprobación sin red adicional.
- No se consulta ningún partido real ni equipo ajeno; no se manipulan los perfiles de navegador. La preparación usa la sesión administrativa únicamente para lecturas. Los futuros eventos deberán usar SDK cliente y la cuenta exclusiva, como en 8B.6.

## Por qué no sirve la publicación actual

El módulo 8B.6 fija el estado inicial en dos, admite como máximo el tercer ID reservado y mantiene consumido su único intento. Un cuarto evento sería una discrepancia y detendría el receptor. Tampoco conserva suficientes entradas para tres escenarios: su búfer circular de 500 descartó información anterior.

No se borra su marcador, cambia su almacenamiento o usa la consola para saltarse esos límites. Se necesita **una nueva publicación explícitamente autorizada**, aunque el canal siga vigente.

## Candidato concreto pendiente de autorización

- Directorio local `.test-artifacts/firebase/fase8b7/candidate/public/`.
- Build **`8b7-834293ccb97ae892`**, **39 archivos** auditados y con manifiesto de hashes fuera de public.
- Configuración separada `firebase.diagnostic8b7.preview.json`, solo Hosting, sitio `registro-defensivo`; cabeceras no-store/noindex/nosniff. No se ha invocado para desplegar.
- Comparado con 8B.6: 34 archivos idénticos, cuatro módulos/bootstrap existentes modificados y sustitución de `js/diagnostic8b6.js` por `js/diagnostic8b7.js`. Los cinco archivos nuevos/cambiados son bootstrap, motor, logger, exportador técnico y módulo de escenarios. CSS, categorías, persistencia, cálculos, CSV, render deportivo y autenticación base idénticos.
- Solo archivos de aplicación, fuentes y licencias; sin documentación interna, herramientas, pruebas, manifiestos, credenciales privadas o claves administrativas. La configuración pública Firebase sigue siendo pública. Fuentes generales Sync false/false/false, Pages intacto.
- Sin corrección candidata de arranque ni otro temporizador/recarga para ocultar el fallo. Se conserva el recorrido de consultas, merge, avisos, estado y render de la prueba anterior.

### Alcance de recepción y escritura

Safari sigue sin enviar cola, crear equipos, registrar acciones deportivas, deshacer, borrar, importar, reintentar manualmente o cambiar de ámbito. El transporte send/createTeam permanece bloqueado y el escritor adicional rechaza el modo receptor. Preflight de origen HTTPS exacto, cuenta exclusiva, activación previa, base IndexedDB v2 existente y cola global vacía; no se crea/migra/reinicia la base.

El candidato empieza en A con los tres IDs conservados. Cada preparación verifica mediante SDK cliente cuenta/equipo/membresía/partido, servidor/local/pantalla y cola cero; compara payloads sin el seq local. El merge solo admite el conjunto previsto, sin lápidas, cambios históricos, otros equipos/partidos/IDs o conflictos. Las Rules y la identidad dedicada son la autorización efectiva; la bandera/parámetro cliente no es una barrera de seguridad del servidor.

El ordenador dispondría de un único intento por escenario, consumido antes de enviar, persistente por ID y sin generar otro ID al recargar o fallar. SDK modular 12.11.0, transacción online `maxAttempts:1`, sin outbox general: solo set del nuevo documento tras leer padre, miembro, históricos, documento reservado y lápidas; nunca update/delete de los anteriores.

| Escenario | Inicial esperado | ID nuevo reservado | Final esperado |
| --- | --- | --- | --- |
| A | 3 eventos | `prueba8b7-a-3f994132-d7cc-4871-88fa-411fcbdf49cb` | 4 eventos distintos. |
| B | 4 eventos | `prueba8b7-b-6b18381b-47e3-4538-98e1-63c0d03ad103` | 5 eventos distintos. |
| C | 5 eventos | `prueba8b7-c-7d3416ea-71ad-4873-8a09-506dd311331a` | 6 eventos distintos. |

No hay avance automático. Verificar cierre exige servidor/local/pantalla en la cifra final, IDs locales distintos, payloads coherentes y cola cero. Solo después aparece avance manual, con confirmación de que la revisión de las trazas de ambos dispositivos permitió seguir. Si una comprobación falla, se bloquean registro/avance y se conservan datos. El control no coordina por servidor las decisiones de dos dispositivos: la revisión humana de ambos es obligatoria antes de avanzar. No se crea un documento de coordinación ajeno a los tres eventos autorizados.

### Conservación e instrumentación

- Inicio de cada escenario: snapshot preparado con cifra inicial, ámbito verificado y cola cero; traza nueva en memoria. No se inicia el escenario siguiente sin cerrar/revisar el anterior.
- **10.000 entradas por escenario, sin eliminar las iniciales**. Al llegar al límite se deja visible overflow; cualquier incorporación/escritura/cierre activo se detiene antes de continuar. Se conserva lo ya capturado; no se finge una traza completa ni se repite un evento para recuperarla.
- Al preparar B/C se archiva una copia del escenario anterior antes de abrir su nueva traza. La descarga incluye `savedScenarios` más el actual; hasta dos archivos históricos en memoria y el actual, todos acotados. No altera IndexedDB, no guarda logs deportivos ni los sube a servidor.
- Descarga explícita `diagnostico-sync-8b7.json`. Exporta estado del escenario/rol, cifra inicial, serverCreatedAt cuando se observa, consultas/resultados/metadata/códigos de error, merge/avisos/estado/render y ciclo de vida/conectividad; conteos visibles, locales, únicos y cola. Sin tokens, UID, correos, nombres reales, IDs deportivos/payloads, URLs o mensajes libres del SDK.
- El archivo debe descargarse tras **cada** escenario, no solo al terminar los tres. Safari puede desalojar la pestaña o finalizar el proceso en segundo plano: el registro en memoria no promete sobrevivir a ese cierre. No se exige borrar sus datos. Si hay recarga automática/evicción, se documenta y se detiene; no se interpreta como recuperación sin recarga.

## Pruebas locales ejecutadas

Firestore Emulator `demo-defensas`, SDK oficial, reglas previstas y dos IndexedDB/contextos independientes. Paquete candidato con sustitución de Auth/proyecto/origen de Emulator, sin servicios reales. Ejecución final:

| Recorrido local | Chromium | WebKit automatizado |
| --- | --- | --- |
| A: 3→4 sin recarga | 4827 ms. | 4598 ms. |
| B: 4→5 con cambio de visibilidad simulado | 3544 ms. | 6445 ms. |
| C: SDK del receptor desconectado, error observado, reconexión y 5→6 | 3759 ms. | 5651 ms. |

Estos intervalos van desde el clic de prueba hasta la cifra final del receptor, incluyendo el trabajo del emisor y la reconexión donde procede; **no son mediciones físicas de latencia desde confirmación de Firestore**. B no suspende un iPad durante 30 s: simula la señal de visibilidad. C deshabilita la red del SDK, no el Wi-Fi físico. No se confunden con los resultados solicitados de Safari real.

En ambos motores: originales ficticios conservados, un ID nuevo por escenario, cuatro/cinco/seis únicos, colas cero, ningún envío del motor receptor, clic repetido y recarga sin segunda escritura. Tras C no se habilita un cuarto evento. Cola pendiente bloquea el arranque. Una preparación con recuento inesperado bloquea registro/avance. Cada exportación conserva la preparación inicial, dropped=0, sin overflow, y cero/uno/dos escenarios anteriores archivados.

A/B sin errores en sus trazas de ensayo; C contiene el `unavailable` esperado al cortar SDK y recuperación posterior, sin errores Auth/permisos. Las cancelaciones al recargar/cerrar contextos son salida del harness; no se atribuyen al Safari físico. El emulador y sus documentos son ficticios y no tocan Firebase real.

Prueba Node adicional: se supera el límite de 10.000, la preparación inicial permanece, overflow es visible, no se filtran campos privados y reiniciar el logger no modifica el snapshot anterior. Auditoría de los 39 hashes/lista/ausencia de privados y banderas generales OFF correcta.

## Escenarios físicos previstos — NO ejecutar antes de autorizar/publicar

| Escenario | Estado real de 8B.7 | Tiempo real | Eventos reales actuales |
| --- | --- | --- | --- |
| A visible | Favorable: recepción, incorporación y render sin recarga. | ≈2396 ms desde ack PC; 357 ms internos respuesta→render. | 4 únicos; tres originales intactos. |
| B segundo plano | Favorable: oculto 29,780 s, evento confirmado mientras estaba detrás y recuperación sin recarga. | 3461 ms desde regreso visible; 336 ms respuesta→render. | 5 únicos; originales y A intactos. |
| C reconexión | Favorable: corte efectivo 26,123 s, consultas unavailable y recuperación automática sin recarga. | 416 ms desde señal online; 148 ms respuesta→render. | 6 únicos; originales y A/B intactos. |

### Preparación común posterior a una eventual publicación autorizada

Usar las mismas sesiones exclusivas y bases, cerrar otras pestañas de este origen sin borrar datos, comprobar el **nuevo** build exacto en ambos. Safari usaría la URL habitual y el ordenador `?fase8b7=ordenador`; hoy esa versión **no está servida**. Preparar el mismo escenario en ambos, con partido seleccionado, cifras iniciales 3/4/5 concordantes y cola cero. Cualquier cuenta, versión, cifra o permiso distinto: detenerse antes de registrar.

### A — Visible

1. Mantener Safari visible con el partido abierto, A preparado en ambos.
2. Un clic en el botón de A desde ordenador; esperar Servidor confirmó 4 eventos.
3. Sin recargar/forzar, observar hasta 60 s desde esa confirmación. Si aparece, verificar cierre en ambos; no pulsar el cierre antes de ver la cifra final.
4. Descargar ambos diagnósticos identificados A/IPAD y A/PC, registrar tiempo humano y comparar el conjunto servidor/local/render/IDs/colas. No continuar a B hasta revisar favorablemente ambos y el inventario del fixture.

### B — Segundo plano

1. Solo tras A favorable: avanzar manualmente y preparar B en ambos (cuatro eventos).
2. Dejar Safari en segundo plano unos 30 s manteniendo la pestaña. Con Safari aún detrás, registrar un único evento B desde el ordenador y esperar confirmación de cinco.
3. Volver enseguida a Safari, sin recargar. Registrar tiempo de regreso y aparición, con límite global de 60 s después de confirmar el servidor. Si el proceso fue desalojado o se recargó automáticamente, anotarlo y detenerse.
4. Si llega: verificar cierre y descargar B/IPAD y B/PC; revisar errores, visibilidad, IDs y colas antes de autorizar avance manual a C. Si no, descargar sin recargar/reintentar y detener todos los escenarios restantes.

### C — Desconexión/reconexión

1. Solo tras B favorable: preparar C en ambos con cinco y cola cero; mantener la página del iPad cargada.
2. Cortar únicamente la conexión del iPad (por ejemplo, modo avión), conservando conexión independiente en el ordenador. No apagar el router ni recargar la página. No usar el botón de corte simulado como sustituto de esta prueba física.
3. Registrar un único evento C desde ordenador y esperar confirmación de seis. Restablecer pronto la conexión del iPad, manteniendo el límite de 60 s desde la confirmación.
4. Debe recuperar automáticamente una sola alta; sin Reintentar ni recarga. Si llega, cierre/verificación/descargas; si falla, conservar y detenerse. `navigator.onLine` por sí solo no demuestra conexión efectiva: contrastar el gesto humano, consultas/error y recuperación SDK.

### Medición y verificación por escenario

- PC: `diagnostic7.single-write.confirmed`, comprobación del servidor y timestamp createdAt del nuevo documento. iPad: primera respuesta que contiene la cifra nueva, validación, commit, aviso, estado y render.
- Intervalos dentro de Safari usan el reloj monotónico. Confirmación del PC/createdAt servidor frente al render iPad requieren comparar relojes distintos; informar tiempo estimado y su limitación, sin fingir precisión. En B medir también regreso visible→render, y en C conexión observada→render, ambos en el mismo dispositivo.
- Inventarios posteriores separados: `preview-read-fixture.mjs --8b7 --after --scenario=A` (B/C análogos), sin sobrescribir baseline. `verify-fixture8b7.mjs A` compara tres originales, IDs previstos, payloadHash/timestamps y cero lápidas; B/C también conservan los eventos de escenarios previos. Ningún comando de limpieza o escritura administrativa.
- Máximo un intento por escenario y tres nuevos en total. Un fallo detiene; no repetir ni avanzar para comprobar si se arregla. No atribuir causas sin trazas.

## Recomendación condicionada a que A, B y C físicos pasen

Si las tres pruebas reales son favorables, todavía no activar producción automáticamente. Proponer una fase separada, con autorización y datos ficticios nuevos, que pruebe **Safari como emisor**: dos pulsaciones, guardado local inmediato, outbox duradero al perder red, recuperación tras recarga/reapertura compatible con disponibilidad de la web, simultaneidad entre dispositivos y pestañas, y restauración/cambio de cuenta sin filtración. El candidato actual mantiene esa escritura deportiva bloqueada.

En otra autorización específica verificar Deshacer y eliminación sobre un partido ficticio aparte, con lápidas y reconexiones tardías, sin tocar estos tres originales. Cerrar la carrera de arranque independiente ya reproducida mediante su revisión/pruebas específicas; no usar el éxito de recepción como prueba de que está solucionada. Completar ficha de modelo/iPadOS, controles en horizontal, estadísticas, histórico/CSV, errores de guardado frente a nube, sesión/autenticación y pruebas de permisos. Revisar después un piloto acotado y el mecanismo de desactivación antes de cualquier publicación general. Ninguno de esos pasos se ejecuta en 8B.7.

El fallo original de recepción sigue sin causa identificada. Ni el éxito 8B.6 ni estas simulaciones autorizan llamarlo corregido. Las pruebas físicas pendientes podrán ampliar la evidencia de estabilidad, con sus límites.

## Archivos/evidencias y permiso que falta

Nuevos: `tools/firebase/preflight8b7.mjs`, `diagnostic8b7-client.js`, `prepare8b7.mjs`, `receive8b7.test.mjs`, `audit8b7.mjs`, `retention8b7.test.mjs`, `verify-fixture8b7.mjs`, `firebase.diagnostic8b7.preview.json` y este informe. Modificados: modo receive8b7 en `emuladores.mjs`, salidas por fase/escenario en el lector readonly del fixture y especificación. No se modifican módulos deportivos raíz o reglas.

Artefactos locales separados en `.test-artifacts/firebase/fase8b7/`: preflight/closure, baseline de tres y comparación, candidato/manifiesto, auditoría, retención y resultados Emulator. No se sobrescribe evidencia 8B.6. Se han efectuado solo lecturas reales acotadas y pruebas ficticias locales; **no despliegue, evento real nuevo, borrado, limpieza de Safari/IndexedDB, renovación, commit o push**.

En el cierre de la preparación faltaba autorización **solo para publicar el candidato exacto `8b7-834293ccb97ae892` de 39 archivos en el mismo `ipad-8b2`, únicamente si sigue vigente y conservando exactamente su caducidad**, sin reglas/Pages/live. Ese permiso ya se recibió y se ejecutó como se detalla a continuación. Los hasta tres eventos están autorizados; se guiarán por etapas después de verificar ambos dispositivos. Si caduca, detenerse sin crear/renovar bajo este permiso. Los documentos y lápidas seguirán conservados cuando Hosting caduque.

## Publicación autorizada y verificación preliminar — 17 de octubre

- Respuesta del usuario «Sí» a la solicitud concreta de publicar el candidato exacto sin renovar. Preflight de solo lectura actualizado a `2026-10-17T17:35:20.298Z`: canal vigente, versión anterior 8B.6, reglas coincidentes, live sin release.
- Publicado a `2026-10-17T17:36:48.609Z`, exclusivamente `registro-defensivo / ipad-8b2`, build **`8b7-834293ccb97ae892`**, versión Hosting **`c64f791bfdcd2552`**. URL **https://registro-defensivo--ipad-8b2-40nbq9cf.web.app**.
- Caducidad antes/después exactamente `2026-10-18T07:38:46.623547158Z`, **18 de octubre a las 09:38 de Madrid**. Se usaron prepare/upload/release con canal explícito, bloqueando creación/renovación/borrado de canales y cambios de Auth/sitios; no el wrapper CLI que renueva TTL. Reglas contrastadas antes de release y después, sin cambio; live intacto. GitHub Pages intacto.
- Auditoría repetida del candidato exacto: 39 hashes correctos, 34 archivos idénticos a 8B.6 y cinco nuevos/cambiados ya aprobados; sin privados/docs/herramientas/pruebas. Inventario previo a release contrasta los 39 hashes comprimidos y los dos recursos públicos `/__/firebase/init.*` generados por Hosting, idénticos a la versión anterior.
- Verificación HTTPS posterior: **39/39 hashes**, no-store/nosniff/noindex; **11 rutas internas/privadas devuelven 404**. Chromium y WebKit nuevos sin activación quedan bloqueados antes de crear IndexedDB o pedir recursos Firebase; cero solicitudes Firebase en esos ensayos. No equivale a validación física Safari.
- Herramienta nueva `tools/firebase/deploy8b7.mjs`, limitada al build y resultados Emulator aprobados, con guardas de vigencia/versión/caducidad/reglas e inventario antes de release. Helper `verify-deployed8b5.mjs` ampliado con `--8b7`, sin sobrescribir verificaciones anteriores. Recibos en `deployment.json`, `uploaded-review.json`, `prepared-version.json`, `https-verification.json` dentro de los artefactos 8B.7.
- **Ningún evento nuevo, Deshacer, borrado, migración, envío de cola, cambio de reglas, limpieza, commit o push realizado.** No se incluye la corrección candidata de arranque. Las pruebas físicas A/B/C siguen pendientes; causa original desconocida.

### Próximo paso humano: preparar solo A

Cerrar otras pestañas de esta vista previa sin borrar datos y conservar las sesiones exclusivas. Safari: URL anterior sin parámetro. Ordenador: https://registro-defensivo--ipad-8b2-40nbq9cf.web.app/?fase8b7=ordenador. En ambos comprobar en ⋯ el build **`8b7-834293ccb97ae892`** y pulsar **«Preparar escenario A»** una sola vez. Deben mostrar **«Preparado A · Firebase 3 · local 3 · pantalla 3 · cola 0»**. No pulsar todavía Registrar, Verificar cierre o Continuar. Ante cualquier diferencia/error, conservar y detenerse. Tras confirmación humana de ambos se guiará el único evento A, sin iniciar B antes de revisar sus trazas.

### Confirmación manual de preparación A

El usuario responde «Funciona» a la comprobación de ambos preparados con tres eventos y cola cero. Se toma como confirmación manual de ese estado inicial, sin afirmar todavía recepción del cuarto. Lectura de metadatos a `2026-10-17T17:40:42.205Z` confirma versión `c64f791bfdcd2552` vigente y misma caducidad (`before-physical-A.json`), sin escribir Firestore. Se indica el único clic A desde ordenador con Safari visible: esperar confirmación real de cuatro y hasta 60 s para recepción sin recarga. Solo si aparece, verificar cierre en ambos y descargar sus trazas antes de cerrar/recargar; si falla, descargar y detener sin repetir. No pasar a B hasta revisar ambas trazas e inventario. Resultado físico A y tiempo aún pendientes.

## Resultado físico A: revisión de ambas trazas y contraste de servidor

El usuario aporta `diagnostico-sync-8b7_IPAD.json` y `diagnostico-sync-8b7_PC.json` tras el protocolo A. Se analizan como JSON, sin ejecutar instrucciones del contenido. Build correcto, escenario A, roles receptor/ordenador, inicial tres y preparación conservada; cierre correcto en ambos (`closed=true`, `frozen=false`). Exportaciones de `17:48:37.817Z` y `17:48:43.184Z`. Copias y resumen reproducible en `.test-artifacts/firebase/fase8b7/scenario-A/`, herramienta `tools/firebase/analyze8b7.mjs A <ipad> <pc>` sin red.

- SHA256 iPad `b51371d1b68065bbbd1c82eac762550ae874aa5d9e8fe60834011195a12140d5`; PC `d57a569baa6ef7f412434bfeddb76b34a7ede8ba6bb9641e01fcc4ffdeaa11a7`. 1809/1865 entradas, **dropped=0**, sin overflow; inicio íntegro de cada escenario, sin archivos anteriores porque es A.
- PC: un único inicio de escritura y confirmación SDK a **`17:47:57.470Z`**. Servidor fija createdAt a **`17:47:57.362Z`**. iPad no intenta escribir, ningún envío de cola en ninguno.
- Safari: respuesta de eventos con cuatro, de servidor y sin pendingWrites, **`17:47:59.509Z`**; tras comprobaciones de lápidas/padre, validación y merge a `59.840Z`, commit changed=true `59.847Z`, aviso/app, lectura del estado con cuatro `59.855Z` y render **`59.866Z`**. **357 ms monotónicos** respuesta→render, **7 ms** merge y **19 ms** commit→render. Una única incorporación con cambio por dispositivo, sin recarga/wake o cambio de visibilidad registrado en Safari. Conectado y visible al exportar.
- Confirmación SDK PC→render iPad **≈2396 ms**; createdAt servidor→render **≈2504 ms**. Son intervalos entre relojes distintos, no medidas exactas; los internos de Safari sí usan reloj monotónico. Dentro del máximo de 60 s.
- Ambos finales: un partido activo, **cuatro eventos locales y cuatro IDs distintos, pantalla cuatro, cola cero**. Sin errores SDK/motor/diagnóstico o permisos en las trazas completas. No hay consulta de caché ni pendingWrites en las respuestas registradas. PC tiene cambios de visibilidad ajenos al receptor; no se confunden con prueba B.
- Observación conservada: una lectura anterior en Safari tarda **30075 ms**, completada sin error y antes del nuevo evento; no explica el incidente original ni invalida la recepción A. Al exportar queda iniciada una lectura `tombs-after` desde `17:48:28.373Z` (unos 9,4 s aún sin respuesta en el archivo). El cierre y la recepción ya eran correctos; esa consulta incompleta no demuestra por sí sola atasco o fallo. B deberá conservar igualmente todos los tiempos/errores, sin ocultar estas observaciones.
- Inventario real de solo lectura a **`17:51:54.282Z`**: exactamente cuatro IDs previstos, partido vivo, cero lápidas; los tres originales conservan payloadHash y fechas local/servidor. Único nuevo: `prueba8b7-a-3f994132-d7cc-4871-88fa-411fcbdf49cb`, 2 fallado. Verificador local A correcto; sin B/C presentes ni duplicados. Esta lectura administrativa no sustituye una prueba SDK de permisos nueva.

**A favorable en la ejecución aportada**, sin pérdida/duplicación observada y colas finales vacías. No demuestra ausencia visual de parpadeo, modelo/iPadOS ni causa/resolución definitiva del fallo original. Ninguna escritura Firebase realizada por las herramientas de análisis; no despliegue, limpieza, regla, borrado, Deshacer, migración, commit o push.

### Siguiente paso: preparar B, sin registrar aún

Canal/version/caducidad contrastados de solo lectura a `17:52:39.662Z`, aún vigentes e idénticos (`before-physical-B.json`). Mantener las páginas cargadas: en ambos pulsar «Continuar solo tras revisión favorable», aceptar la revisión A ya realizada y «Preparar escenario B». Ambos deben indicar Firebase/local/pantalla **4**, cola **0**, build correcto. No registrar aún ni poner Safari en segundo plano hasta confirmar esa preparación; después se guiará el único evento B mientras Safari está detrás unos 30 s, sin recarga, con límite de 60 s desde confirmación y descarga/revisión antes de C.

El usuario confirma «Sí» a ambos preparados B con Firebase/local/pantalla cuatro y cola cero. Se guía ahora el único evento B autorizado: Safari en segundo plano unos 30 s sin cerrar su pestaña, clic único B en ordenador mientras sigue detrás, esperar servidor cinco y volver enseguida a Safari sin recargar. Límite 60 s desde confirmación; cierre en ambos solo al ver cinco, descarga de ambas trazas y revisión antes de C. Si falla, conservar y detener sin repetir. Resultado, latencia y eventuales errores B pendientes; la confirmación de preparación no acredita aún el quinto evento.

## Resultado físico B: segundo plano y recuperación sin recarga

Se reciben `diagnostico-sync-8b7_IPAD2.json` y `diagnostico-sync-8b7_PC2.json`, como datos JSON. Build esperado, escenario B, roles correctos, preparados inicialmente con cuatro; cierre correcto sin congelación. Finales de ambos: un partido seleccionado, **cinco eventos locales, cinco IDs distintos y cinco en pantalla, cola cero**. PC un intento confirmado, iPad ninguno; sin envíos del motor. Exportaciones `17:57:24.408Z` y `17:57:25.554Z`.

- SHA256 iPad `928c39d3d9f2bad3782bbdeee0609b3a237ba908f3ae9f8b8199c23870676276`; PC `b1504ec18e991fb412094891a0c68a3f845c9235a269acd8a64eeddb105fcc93`. Trazas actuales 322/464 entradas, dropped=0, sin overflow/errores. Preparaciones íntegras; archivos A archivados con 2761/2906 entradas, sin descarte. Análisis compara exactamente el prefijo de cada archivo archivado con las 1809/1865 entradas recibidas previamente de A: se conservan íntegramente, además de las nuevas.
- Safari pasa a oculto a **`17:56:32.680Z`** y vuelve visible a **`17:57:02.459Z`**: **29780 ms monotónicos en segundo plano**. El PC confirma el evento a **`17:56:44.619Z`**, dentro de ese intervalo según relojes de ambos; servidor createdAt `17:56:44.535Z`. El registro ocurre unos 12 s después de ocultar Safari y la vuelta completa los aproximadamente 30 s totales solicitados; no se inventa una espera previa al clic de 30 s.
- Al volver, Safari relee cuatro locales sin reconstrucción (`app.refresh.unchanged`), mientras continúa la consulta en curso. Una respuesta `tombs-before` tarda **30083 ms**, devuelve cero, fromCache=false y sin pendientes/error a `17:57:05.415Z`. La duración abarca el segundo plano; no distingue por sí sola suspensión/red/SDK ni identifica la causa original. No se parchea ni oculta.
- Respuesta servidor de cinco eventos **`17:57:05.584Z`**, validación/merge `05.902Z`, commit changed=true `05.907Z`, aviso/estado y render con cinco **`05.919Z`**. **3461 ms desde vuelta visible**, **336 ms respuesta→render**, 5 ms merge y 13 ms commit→render, todos monotónicos en Safari. Ack PC→render **≈21300 ms**, incluyendo la permanencia en segundo plano y con límite de relojes distintos; dentro de 60 s.
- Una única incorporación con cambio por dispositivo. Todas las respuestas registradas de servidor, sin pendingWrites. Sin pagehide/pageshow o reinicio de preparación en B; mismo proceso/traza conservado, sin recarga documentada. El archivo del PC termina con una lectura iniciada unos 42 ms antes de exportar, que no acredita fallo. Ausencia visual de parpadeo/modelo/iPadOS no certificada por JSON.
- Lectura real acotada **`17:58:41.455Z`** y verificador B: **exactamente cinco IDs previstos**, tres originales y A con payloadHash/fechas idénticos; solo nuevo B `prueba8b7-b-6b18381b-47e3-4538-98e1-63c0d03ad103`, 2 fallado. Partido vivo, cero lápidas, sin C. Dos de tres eventos autorizados consumidos, sin pérdida o duplicación observadas.

**B favorable en esta ejecución física.** Evidencia en `scenario-B/trace-analysis.json`, copias por dispositivo e inventario/verificador B; `analyze8b7.mjs` ampliado solo localmente con tiempos de visibilidad y conservación exacta de archivos anteriores. Sin tocar el candidato desplegado, datos reales, reglas, Hosting/Pages, limpiados, migraciones, Deshacer, borrados, commit o push. No constituye resolución definitiva de la incidencia original.

### Siguiente paso: preparar C, sin desconectar ni registrar aún

Metadatos de solo lectura a **`17:59:18.373Z`**: mismo canal vigente, misma versión y caducidad exactas (`before-physical-C.json`). En las mismas páginas, pulsar «Continuar solo tras revisión favorable», aceptar la revisión B completada y «Preparar escenario C» en ambos. Esperar **Firebase/local/pantalla cinco y cola cero**, sin registrar ni cortar red antes de confirmar la preparación. Después se guiará el tercer y último evento autorizado, cortando únicamente Internet del iPad; el ordenador debe conservar conexión independiente. No se autoriza un cuarto registro, renovación o nueva publicación.

El usuario responde «Funciona» a ambos preparados C con cinco y cola cero: confirmación manual de preparación, sin acreditar aún el sexto. Se guía corte solo del iPad (Wi-Fi y datos móviles si dispone), página conservada y Safari visible de nuevo; ordenador con conexión independiente. Un único clic C, esperar servidor seis y restablecer enseguida Internet del iPad, sin recargar/reintentar. Límite global 60 s desde confirmación; solo al ver seis verificar cierre en ambos y descargar trazas C/IPAD y C/PC. Un error temporal de conexión es esperable durante el corte; si no se recupera en plazo o aparece bloqueo diagnóstico/auth/permisos, descargar y detener sin repetir. Tercer y último intento autorizado; no cuarto evento, Deshacer o borrado. Resultado real C pendiente.

## Resultado físico C: desconexión y recuperación automática

Se reciben como datos `diagnostico-sync-8b7_IPAD_C.json` y `diagnostico-sync-8b7_PC_C.json`. Build/escenario/roles esperados, preparación con cinco íntegra, cierre correcto sin congelación. Ambos terminan con **un partido seleccionado, seis eventos locales, seis IDs distintos, pantalla seis y cola cero**; un intento confirmado solo en ordenador, ningún envío del motor ni intento del receptor.

- SHA256 iPad `955910ff6b6180adb1813e89cd47defdb0c4ff93fb5aeb14da13c90a68c7cb82`; PC `d313e2b722b0a2161bca41bf943a89ff3a101d9fb2ba8da6edb9e9dedbb4e42c`. Exportaciones `18:05:06.884Z` y `18:05:02.834Z`, 608/856 entradas actuales, **dropped=0**, sin overflow. A/B archivados y comparados con los prefijos completos de las exportaciones anteriores; sin pérdida de esos registros.
- iPad señal offline **`18:04:21.357Z`**, online **`18:04:47.481Z`**, ambos visible=true: **26123 ms** monotónicos. El PC confirma su único C a **`18:04:27.734Z`**, mientras el iPad está offline según relojes de ambos; createdAt servidor `18:04:27.641Z`.
- **Cuatro consultas fallidas** en Safari con código `unavailable` a `18:04:29.372Z`, `34.396Z`, `39.416Z`, `44.427Z`; cada una produce también el aviso de error de ciclo. Ocho entradas, no ocho intentos deportivos. Están dentro del corte, sin Auth/permisos, bloqueo de diagnóstico ni parada definitiva. Se conservan y clasifican como errores esperados de esta desconexión, no se ocultan ni se convierten en fallo de guardado. El PC no registra errores.
- Al llegar online, el motor reanuda automáticamente. Respuesta servidor de seis eventos **`18:04:47.748Z`**, validación/merge `47.873Z`, commit changed=true `47.882Z`, aviso/estado y render **`47.896Z`**. **416 ms desde señal online**, **148 ms respuesta→render**, 10 ms merge y 14 ms commit→render, monotónicos en Safari. No se deduce conectividad efectiva solo de navigator.onLine: las consultas exitosas posteriores la acreditan.
- Ack PC→render iPad **≈20162 ms**, incluyendo el periodo restante sin conexión; createdAt servidor→render ≈20255 ms. Intervalos entre relojes distintos, aproximados y dentro de 60 s. Un único merge con cambio por dispositivo, sin recarga/visibilidad o reinicio documentado durante C; recuperación mediante ciclo normal y wake online existente, sin nuevo parche/temporizador o botón manual.
- Todas las respuestas recibidas de servidor y sin pendingWrites. Errores inesperados: cero. Permanece una lectura larga completada en este escenario (máximo 29669 ms); la duración de una consulta no identifica por sí sola la causa del incidente original. No se afirma ausencia visual de parpadeo ni modelo/iPadOS desde el JSON.
- Lectura real acotada **`18:07:18.646Z`** y verificador C: exactamente **seis IDs previstos**; tres originales y eventos A/B con payloadHash y fechas intactos; único nuevo C `prueba8b7-c-7d3416ea-71ad-4873-8a09-506dd311331a`, 2 fallado. Partido vivo, cero lápidas de eventos. No se elimina ni limpia nada. Inventario administrativo de solo lectura, distinto de pruebas SDK de permisos.

Análisis reproducible en `scenario-C/trace-analysis.json`, copias por dispositivo, `read-fixture-after-C.json` y `server-verification-C.json`. `analyze8b7.mjs` incorpora únicamente comprobaciones locales de offline/online y clasificación explícita de errores unavailable durante el corte, conservando todas las entradas y cualquier inesperado. No modifica la versión publicada ni datos Firebase.

## Cierre de 8B.7 y límites antes de producción

| Escenario físico | Resultado | Respuesta servidor→render en iPad | Tiempo de recepción pertinente |
| --- | --- | --- | --- |
| A visible | Favorable, 3→4. | 357 ms. | ≈2,396 s desde ack PC; relojes distintos. |
| B segundo plano | Favorable, 4→5; 29,780 s oculto. | 336 ms. | 3,461 s desde volver visible; ≈21,300 s desde ack PC incluyendo segundo plano. |
| C reconexión | Favorable, 5→6; 26,123 s offline. | 148 ms. | 0,416 s desde online; ≈20,162 s desde ack PC incluyendo corte. |

Las tres ejecuciones muestran recepción remota→validación→IndexedDB→estado activo→render sin recarga manual; IDs/conteos coherentes, colas finales cero, ningún original modificado, pérdida o duplicación observada, ni fallo Auth/permisos. Tramos iniciales/archivos anteriores conservados y sin descartes. C incluye los fallos de red deliberados y recuperación acreditada. Se han consumido **exactamente los tres nuevos eventos ficticios autorizados** por SDK cliente desde ordenador; las herramientas solo analizaron JSON y leyeron el fixture. Se conservan los seis documentos, el equipo/partido y cualquier lápida previa; no se autorizan más registros.

Esto demuestra estabilidad puntual del **receptor Safari con el candidato diagnóstico**, no la corrección definitiva del fallo original ni la sincronización deportiva completa. El receptor tiene envío/cola/registro/Deshacer/borrado/migración bloqueados. No se han probado aquí Safari emisor, outbox deportivo duradero, restauración tras desalojo/reapertura, dos pulsaciones físicas en este modo, CSV/histórico, horizontal ni ausencia visual de parpadeo. Causa original y lecturas largas siguen sin explicación demostrada; carrera de arranque independiente no corregida. No se modifica Rules ni se vuelve a certificar toda la matriz de seguridad solo por este inventario.

Recomendar una fase separada y expresamente autorizada, con datos ficticios nuevos: Safari emisor online/offline y cola persistente, reapertura/recarga, concurrencia y cambio de cuenta; otro partido ficticio autorizado para Deshacer/eliminación y reconexiones tardías conservando lápidas. Revisar/testear por separado la carrera de arranque y cerrar comprobaciones deportivas/visuales/horizontales, modelo/iPadOS y permisos antes de un piloto acotado. No activar producción por estos tres éxitos ni iniciar esos trabajos ahora.

Documentación/especificación y analizador local actualizados; sin nuevo despliegue/renovación, reglas/Auth/Pages, migración, borrado, Deshacer, limpieza, commit o push por el cierre. Canal conserva la caducidad autorizada del **18 de octubre, 09:38 Madrid**; su vencimiento no elimina documentos o lápidas de Firestore. **Fase detenida para revisión.**
