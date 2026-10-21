# Fase 8B.4 — Diagnóstico de actualización automática en Safari/iPad

17 de octubre de 2026. **La causa del incidente físico sigue sin identificar y la prueba no está aprobada.** No se han escrito/reintentado operaciones en Firebase real, abierto los perfiles deportivos del usuario, limpiado bases/cachés, publicado versiones, renovado el canal, modificado reglas, hecho commit o push.

## Evidencia conservada y contraste de versiones

Se conserva el punto de partida de 8B.3: Safari visible más de 15 segundos; ordenador con dos intentos e iPad con uno hasta la recarga del ordenador; después ambos con dos y Sincronizado. El inventario administrativo de 8B.3 registró exactamente dos eventos, partido vivo y cero lápidas. **No se vuelve a consultar ni modificar ese equipo en 8B.4**; el inventario citado es la evidencia previa, no una lectura nueva.

En 8B.4 solo se hicieron GET de los archivos estáticos públicos. Los **36 recursos** coinciden por SHA256 con la versión documentada `f0a4971d2c312bef`. Al comenzar, los módulos fuente no generados también coincidían con lo publicado. Se guardaron los bytes originales y manifiesto en `.test-artifacts/firebase/fase8b4/deployed/` y `deployed-manifest.json` antes de instrumentar el código local. No se regeneró el staging publicado de 8B.3. Los recursos responden `Cache-Control: no-store`; no hay service worker ni uso de Cache API en la aplicación.

Esto descarta una diferencia observada entre la copia local inicial y los archivos que sirve Hosting. **No acredita qué recursos tenía ya evaluados en memoria el Safari físico durante el incidente**, ni demuestra un fallo de caché. La primera vista previa carecía de activación; la segunda mantuvo los mismos módulos deportivos. No se pide borrar caché para probar una hipótesis.

## Recorrido real, distinto de un listener realtime

La aplicación **no llama a `onSnapshot`**. Usa lecturas `getDocsFromServer`/`getDocFromServer` y un ciclo que programa la siguiente consulta 5000 ms después de completar el anterior. **No es una garantía de recepción en cinco segundos:** se suma el tiempo de las lecturas secuenciales y no hay un límite propio para una promesa pendiente. El aviso a la aplicación es un evento DOM propio. Por ello, no existe una suscripción realtime de aplicación que esté perdiendo snapshots ni un unsubscribe de Firestore que podamos inspeccionar en este código.

`getDocsFromServer` exige respuesta de servidor y rechaza cuando no puede obtenerla; no es un fallback deliberado a caché. El SDK gestiona internamente sus conexiones y escuchas para estas lecturas. Las trazas registran la metadata que devuelve, sin sustituirla ni inferir confirmación. [Referencia oficial de lecturas Firestore](https://firebase.google.com/docs/reference/js/firestore), [diferencia con `onSnapshot`](https://firebase.google.com/docs/firestore/query-data/listen).

| Etapa | Código y comportamiento | Qué podría interrumpirla / evidencia disponible |
| --- | --- | --- |
| 1. Obtener datos del servidor | `firestore-sync.js`: partidos → lápidas → eventos → lápidas finales → relectura del padre. Lecturas secuenciales con guardas de cuenta. | Una promesa que no resuelve mantiene el ciclo ocupado y no se programa el siguiente hasta llegar a finally. Un rechazo sí llega al estado Error. No hay registro de esa promesa en el Safari del incidente. |
| 2. Avisar al consumidor | `sync-engine.js` recibe el array; después de materializar se emite `defensas-sync-remote`. `app.js` lo escucha tras completar el arranque. | Falta de listener en el arranque o un aviso recibido cuando storageReady es false. La entrega DOM es síncrona en la misma página, no un mensaje enviado por Firebase. No se ha demostrado un aviso perdido en el dispositivo. |
| 3. Incorporar a IndexedDB | `mergeRemote` verifica ámbito/IDs, unión de eventos y lápidas en una transacción; avisa solo después del commit si hubo cambio visible. | Abortos/conflictos rechazan la operación. Lecturas remotas anteriores a un cambio de cuenta se descartan. El caso de partido ya seleccionado y cola vacía pasa en Emulator/Chromium/WebKit. |
| 4. Actualizar el estado activo | `refreshState` serializa una lectura local; comprueba ámbito/revisión y compara games/currentGameId/events. | Un estado puede descartarse por revisión/ámbito; un fallo local deja storageReady false y se muestra error. La comparación de estado idéntico puede impedir un render inicial que nunca se aplicó: carrera de arranque reproducida, separada del incidente. |
| 5. Renderizar | `applyState` actualiza eventos del activo; renderiza contadores/estadísticas y conserva botones si la configuración coincide. | Es posible distinguir IndexedDB actualizado y DOM atrasado. La instrumentación registra ambas cifras sin guardar eventos. La actualización automática normal pasa en ambos motores automatizados. |

### Suscripciones, cancelaciones y ciclo de vida

- `sync-ui.js` crea/detiene el motor al cambiar cuenta/equipo y cuando se reinicializa. Stop cancela el temporizador; no aborta una lectura SDK ya iniciada. Las guardas evitan materializar su resultado si el ámbito ha cambiado.
- El controlador Auth sí tiene una suscripción propia, que cancela en start/dispose. El cambio real de identidad invalida el ámbito. No se observa una cancelación periódica de motores por cada notificación de la misma cuenta.
- Los rechazos de lecturas no se silencian: el ciclo muestra Error de sincronización; la relectura del padre en el catch distingue una eliminación concurrente. Una petición que queda pendiente no produce por sí sola un error visible; se necesita la traza begin/end.
- Online despierta el motor. Focus/visibility vuelven a leer IndexedDB, **no** solicitan directamente una lectura remota. Safari puede suspender trabajo fuera de primer plano, pero aquí el usuario confirma que estaba visible: no se usa esa explicación como causa.
- No se ha añadido otro temporizador, watchdog, recarga o sondeo como parche. El intervalo normal sigue en 5000 ms.

## Consecuencias comprobables de la corrección del parpadeo

La corrección 8B.2 evita avisos/remontajes cuando el remoto no cambia. Es correcta para evitar reconstrucciones periódicas, pero elimina ese refresco redundante como recuperación accidental si se perdió el aviso anterior.

Con un fallo **inyectado** que descarta solo el evento DOM: IndexedDB pasa de uno a dos eventos y la interfaz permanece con uno; otro merge idéntico ya no avisa. Focus recupera la vista desde IndexedDB. Se reproduce en Chromium y WebKit. **Demuestra una posible forma del síntoma, no que Safari haya descartado el evento real.** No se restablecen avisos periódicos para ocultarlo.

Con una lectura **inyectada** que no resuelve: se ve read.start sin read.received/error y no se agenda otro ciclo; el guardado local sigue funcionando. También pasa en ambos motores. Esto demuestra cómo detectar una interrupción en la etapa 1, sin atribuirla al SDK o la red reales.

### Carrera de arranque independiente y corrección candidata

Se reproduce otro defecto al restaurar una cuenta durante la carga del CSV: el snapshot inicial pertenece a un scopeVersion anterior y applyState lo rechaza; la relectura contiene el mismo conjunto vacío y la comparación evita renderizar. Pueden quedar controles deshabilitados pese a Guardado. Reproducción determinista en Chromium y WebKit.

Una candidata mínima recuerda el contexto del último estado **realmente aplicado** y solo omite un estado idéntico si ese contexto coincide. Corrige el caso en ambos motores. Se probó únicamente mediante una transformación del código publicado en memoria y quedó guardada en `startup-candidate-app.js`, dentro de artefactos. **No está aplicada al app.js fuente ni incluida en el paquete diagnóstico y no se presenta como arreglo del incidente del partido ya abierto.** Requiere revisión separada para evitar mezclar causas.

## Instrumentación local preparada

`sync-diagnostics.js` está desactivado por defecto. Al habilitarlo explícitamente, mantiene como máximo 500 entradas en memoria:

- Identificador de build/baseline, hora y tiempo monotónico transcurrido.
- Creación/reset/parada del motor, programación/disparo del temporizador y tamaño de cola.
- Inicio/fin/error de cada lectura SDK, cantidad de documentos, fromCache y hasPendingWrites.
- Recepción del resultado remoto, commit/aviso de IndexedDB, recepción DOM, lectura de estado, descarte por revisión/ámbito y final del render.
- Visibilidad, online/offline, focus/blur y pageshow/pagehide con persisted.

No registra tokens, UID, correos, nombres de equipos/rivales, IDs deportivos, payloads, URLs ni mensajes de error del SDK. Los campos están limitados por lista; los errores conservan únicamente códigos. No envía telemetría ni escribe logs en IndexedDB/localStorage.

`sync-diagnostics-ui.js` prepara un botón **Descargar diagnóstico de sincronización** y un JSON técnico. El botón toma solo conteos de la copia local/cola mediante transacciones readonly y no provoca consultas a Firebase, merges, envíos o reintentos. No es una exportación JSON de partidos; el CSV deportivo permanece sin cambios. Se comprobó que estado/cola antes y después de descargar coinciden, y que el archivo no contiene el ID del partido.

### Candidato concreto para una futura prueba física

- Preparado únicamente en `.test-artifacts/firebase/fase8b4/diagnostic-candidate/public/`: **38 archivos**, build **`8b4-256eb8ba4e2907e6`**; manifiesto fuera del directorio público.
- `firebase.diagnostic.preview.json` apunta exclusivamente a ese directorio y al sitio `registro-defensivo`. Solo contiene Hosting y cabeceras no-store/noindex/nosniff. No se ha ejecutado con Firebase CLI.
- Exige el mismo origen HTTPS y la base de pruebas v2 ya existente, sin crearla o migrarla, más la activación existente de la cuenta exclusiva. Si hay operaciones pendientes, se detiene antes de arrancar la app y las conserva.
- La copia diagnóstica bloquea los controles de escritura y reintento. El adaptador impide send/createTeam. El motor generado tampoco envía, confirma, marca fallos, materializa remoto ni modifica arrendamientos; solo observa las lecturas. Conserva la caché de equipos. Tras una respuesta satisfactoria muestra **Solo lectura**, nunca Sincronizado por una copia que no acaba de incorporar.
- Estas restricciones son operativas para la observación, no sustituyen Firestore Rules. La identidad dedicada y las reglas de propietario/membresía siguen siendo la autorización real.
- Este modo físico puede comprobar recepción y comparar remoto/IndexedDB/vista **sin alterar los dos eventos**. Al no aplicar cambios ni crear un evento nuevo, no permite afirmar que se haya reproducido o resuelto el recorrido completo de un alta remota; ese recorrido se prueba en Emulator. Se declara esta limitación en el protocolo.
- El staging y la configuración originales de 8B.3 no se sustituyeron. No se ha publicado este candidato ni cambiado la caducidad del canal.

## Resultados de pruebas

| Prueba | Resultado |
| --- | --- |
| SDK Firestore Emulator, dos contextos, receptor con partido activo y cola vacía; código publicado | Chromium 5230 ms, WebKit 5557 ms; dos eventos y marcador correctos sin recarga, ciclos forzados o duplicados. |
| Mismo caso con instrumentación | Chromium 5214 ms, WebKit 5542 ms; trazas de las cinco etapas presentes, fromCache false. |
| Corte/recuperación de red SDK en receptor sin escrituras | Error visible, conserva dos eventos; tras restaurar recibe el tercero ficticio de Emulator sin recarga, cola del receptor vacía. Ambos motores. |
| Aviso DOM perdido / consulta pendiente, fallos inyectados | Diagnóstico distingue IDB actualizado-vista atrasada y lectura sin respuesta. Guardado local funciona mientras la lectura queda pendiente. Ambos motores. |
| Carrera de restauración durante CSV | Fallo reproducido con publicado; candidata en memoria corrige controles en ambos motores. No es la causa física demostrada. |
| Exportación diagnóstica y protección del candidato | Chromium/WebKit: descarga readonly; cola ficticia pendiente detiene el arranque y conserva attempts=0; createTeam/send rechazados antes de alcanzar funciones de escritura de un SDK doble. Cero solicitudes a servicios Firebase reales en estas pruebas del paquete. |
| Privacidad/opt-in/límite del registro | Una prueba Node correcta; sin campos privados, snapshots copiados y 500 entradas máximas. |
| Parpadeo 1024×768 y 390×844 | Cero retiradas de botones, falsos Guardando y deshabilitaciones; selección/foco conservados y error local no ocultado. |
| Regresión de sincronización en Emulator | 20 grupos correctos: Deshacer, borrado tardío, idempotencia, concurrencia, cambio de cuenta/equipo, aislamiento, outbox atómico, histórico/CSV y guardado offline. |
| Suites deportivas Node | 9/9 correctas. |
| Empaquetado habitual | 2/2 correctas; se incluye la dependencia diagnóstica inactiva en futuras generaciones, sin regenerar el staging publicado. |

Los primeros intentos del harness instrumentado con carga inline del módulo produjeron unavailable en la conexión de Emulator. Se corrigió el harness para conservar el HTML normal y servir el módulo instrumentado externamente, sin cambiar el adaptador para ocultar el error. Los resultados anteriores corresponden a la ejecución final completa. No se extrapola ese error del harness al Safari físico.

WebKit automatizado usa el motor de Playwright instalado localmente, **no Safari del iPad**. [Alcance de WebKit en Playwright](https://playwright.dev/docs/browsers#webkit).

Evidencias: `emulator-receive.json`, `probes.json`, `startup.json`, `candidate-tests.json`, `flicker-after.json`, `sync-after.json`, `deployed-manifest.json` y `closure.json` en `.test-artifacts/firebase/fase8b4/`. Las pruebas usan únicamente datos ficticios y proyectos demo locales. La comprobación de cierre vuelve a contrastar por GET los módulos publicados y confirma que siguen con el hash de 8B.3; el candidato de 38 archivos conserva sus hashes y no está desplegado.

## Archivos afectados

- Observación: `app.js`, `js/firestore-sync.js`, `js/sync-engine.js`, `js/sync-storage.js`, `js/sync-ui.js`; nuevos `js/sync-diagnostics.js` y `js/sync-diagnostics-ui.js`.
- Herramientas: nuevos `compare8b4.mjs`, `receive8b4.test.mjs`, `probes8b4.test.mjs`, `startup8b4.test.mjs`, `diagnostics8b4.test.mjs`, `prepare8b4-diagnostic.mjs`, `candidate8b4.test.mjs` en `tools/firebase/`; modo receive8b4 en `emuladores.mjs` y salida separada 8B.4 en `sync-flicker.test.mjs`.
- Preparación: dependencia inactiva en la lista de `ipad-preview.mjs`; nueva configuración `firebase.diagnostic.preview.json`.
- Documentación: este informe y apartado 55 de `ESPECIFICACION.md`. Ningún cambio en reglas, categorías, registros históricos, cálculos o CSV.

## Prueba física que falta y autorización

Para conseguir trazas del dispositivo hace falta **autorización nueva y específica para publicar el candidato diagnóstico de 38 archivos en el mismo canal/origen temporal**, sin canal live/Pages, sin nuevas operaciones Firestore y sin prolongar la caducidad vigente del 18 de octubre de 2026 a las 09:38 de Madrid. Si el canal ha caducado, no se renovará sin permiso adicional. No se vuelve a pedir autorización para acciones ya realizadas en 8B.3; esta publicación está expresamente excluida de la autorización actual de 8B.4.

Después de esa eventual autorización, el procedimiento propuesto es:

1. Conservar el estado actual y cerrar las otras pestañas de preview. No limpiar datos. Anotar modelo de iPad, versión de iPadOS y hora; actualmente no constan.
2. Abrir el mismo origen con la versión diagnóstica; no crear un perfil/base nuevos ni reactivar Sync. Si detecta pendientes o base distinta, el arranque se bloquea: comunicar el mensaje exacto y no reintentar. No se promete un botón de descarga en un arranque bloqueado.
3. Comprobar el identificador `8b4-256eb8ba4e2907e6`, partido conservado y dos intentos. Mantener Safari visible 60 segundos, sin registrar/deshacer/borrar y sin recargar; anotar estado y hora.
4. Descargar el diagnóstico. El archivo permitirá comprobar timer → lectura SDK → metadata/count remoto, junto a conteos de la copia local y render inicial, sin información personal.
5. Solo si se acuerda expresamente dentro de esa prueba: suspender y volver a Safari sin cortar/borrar datos; descargar un segundo diagnóstico para observar el ciclo de vida. No generar un nuevo evento remoto.
6. Si todo fluye con los dos eventos existentes, **no declarar resuelto el incidente**: para reproducir un alta nueva en el recorrido completo haría falta otra prueba autorizada con datos ficticios. No usar el equipo conservado como parche ni reiniciar su base.

Se detiene para revisión. No se atribuye el fallo a Firebase, Safari, caché o renderizado sin una traza física que lo sitúe.
