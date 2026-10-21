# Fase 10 — Auditoría de datos y cuenta

Fecha: 17 de octubre de 2026. Base auditada: árbol de `develop` idéntico a la versión publicada 8C.0 (`origin/main`), salvo `firestore.rules`, que no se publica en `main`. Copia previa: `.local-backups/fase10-cuenta-20261017-203554/`.

Método: lectura de todo el código de datos, cuenta y sincronización; suites existentes como línea base; reproducciones en Chromium con perfiles efímeros y datos ficticios; Firestore y Auth Emulator (`demo-defensas`); una única consulta pública de solo lectura a la configuración de Authentication del proyecto real (sin sesión ni Firestore). No se ha leído ni escrito ningún dato real.

Según lo pedido, en esta fase solo se corrige lo crítico y lo alto que afecta a pérdida o duplicación de datos o a la seguridad. El resto queda como pendiente con propuesta.

## Resumen

| Gravedad | Hallazgos | Corregidos en Fase 10 |
|---|---|---|
| Crítico | 0 | — |
| Alto | 3 | 2 (A1, A2) |
| Medio | 6 | 3 (M1, M2, M3) |
| Bajo | 7 | 2 (B1, B2) |

No hay ningún camino encontrado que borre o duplique tiros en el uso normal. Las protecciones de base (transacciones atómicas, IDs estables, lápidas e idempotencia) son correctas y están probadas.

## Alto

### A1. Cerrar sesión dejaba en el dispositivo los datos de la cuenta — **corregido**

- **Evidencia**: `js/sync-ui.js` (8C) solo cambiaba el ámbito al cerrar sesión; `cloudGames`, `cloudEvents`, `cloudTombs`, `syncQueue`, la lista de equipos y los partidos creados con la cuenta seguían en IndexedDB, ocultos por el filtro de `filterLegacyGames` (`js/sync-storage.js:40-51`) pero legibles con las herramientas del navegador. Además, una transacción de `mergeRemote` iniciada antes del cambio de cuenta podía confirmarse después.
- **Riesgo real**: en un iPad compartido, otra persona puede leer partidos de la cuenta anterior. Si se borrara sin avisar, se perderían los cambios todavía en cola.
- **Corrección** (decisión: se borran): `purgeAccountData` (una transacción, idempotente) borra copias de la nube, cola, lista de equipos y partidos creados con la cuenta sin subir. Antes, `accountUnsynced` cuenta lo no subido y, si hay algo, se avisa con «Esperar» o «Salir igualmente». El borrado solo ocurre si `signOut` se completa; si falla el borrado, se reintenta al abrir. El motor se detiene y se espera su ciclo (`stop()` devuelve el ciclo en curso), `mergeRemote` aborta si la cuenta cambia dentro de la transacción y las demás pestañas repiten el borrado al recibir el aviso. Se conservan los partidos sin cuenta, los originales ya importados y la preferencia de equipo.
- **Prueba**: grupo nuevo en `sync.test.mjs` (recuentos, borrado solo de esa cuenta, sin cuenta y otra cuenta intactos, lo subido vuelve al entrar) e interfaz en `sync-ui.test.mjs` y `auth-browser.mjs`.

### A2. Safari puede borrar el almacenamiento y no se pedía persistencia — **mitigado**

- **Evidencia**: ninguna llamada a `navigator.storage.persist()` en el código. Safari aplica la política de ITP (borrado del almacenamiento escribible por script tras 7 días de uso del navegador sin visitar el sitio), salvo en apps añadidas a la pantalla de inicio.
- **Riesgo real**: sin cuenta, pérdida total de partidos si el iPad pasa una semana sin abrir la app. Con cuenta, se pierden la cola pendiente y la configuración del panel (no se sincroniza); los partidos subidos se recuperan al entrar.
- **Corrección**: `requestPersistentStorage()` en `app.js` pide persistencia en cada arranque (mejor esfuerzo; el resultado queda en `data-storage-persisted`). No bloquea ni cambia el guardado.
- **Pendiente**: Safari puede negarla en una pestaña normal. Recomendación: añadir la app a la pantalla de inicio del iPad y exportar el CSV al terminar cada partido. Valorar un aviso en el perfil cuando la persistencia se deniegue (no añadido: no se ha pedido).

### A3. La sincronización lee colecciones completas cada 5 segundos — **corregido localmente en Fase 11**

**Actualización del 20 de octubre de 2026:** sustituido el sondeo completo por escuchas; 24 grupos Emulator correctos, incluida temporada ficticia 30×70 sin reconsultas durante 12 ciclos. Detenido para revisión y sin publicar. Véase [FASE11_LECTURAS.md](FASE11_LECTURAS.md). La evidencia y propuesta siguientes describen el hallazgo original del 17 de octubre; los recuentos del resumen corresponden al cierre de Fase 10.

- **Evidencia**: `js/firestore-sync.js:68-93` lee en cada ciclo todos los partidos y, por cada uno vivo, lápidas (dos veces), eventos y el padre; `js/sync-engine.js:3` repite cada 5 s.
- **Riesgo real**: con una temporada (unos 30 partidos de 70 tiros) son unas 2.200 lecturas por ciclo, unas 26.000 por minuto y dispositivo. En el plan gratuito (50.000 lecturas al día) la cuota se agota en minutos y la sincronización se detiene hasta el día siguiente. No hay pérdida ni duplicación (todo queda en la cola local), pero los cambios dejan de llegar a otros dispositivos.
- **Propuesta**: leer solo el partido activo y la lista de partidos, o consultas incrementales por fecha de servidor, o escuchas `onSnapshot`; pausar el sondeo con la pestaña oculta. Requiere una fase propia con pruebas de recepción.

## Medio

### M1. Tras un error al guardar, el reintento no se habilitaba — **corregido**

- **Evidencia**: `tests/fase3-browser.mjs:115` fallaba («Fallo sin reintento o falso Guardado»). Desde 8B.2, `refreshState` omite estados idénticos (`app.js:130`), y `recordResult` restauraba la selección sin volver a pintar.
- **Riesgo real**: tras un fallo, el mensaje pide volver a pulsar el resultado, pero el botón seguía desactivado; había que volver a elegir la acción. No duplicaba (el ID se conserva), pero rompía «error con opción de repetir».
- **Corrección**: `renderSelection()` tras restaurar la selección (`app.js:573`).

### M2. El SDK de Google se descargaba siempre, también sin cuenta — **corregido**

- **Evidencia**: `js/cuenta-ui.js` (8C) llamaba a `controller.start()` en cada carga; `tools/firebase/local-browser.mjs` fallaba al exigir cero peticiones externas.
- **Riesgo real**: privacidad (la IP llega a Google sin haber elegido cuenta) y dependencia de red innecesaria.
- **Corrección**: con «sin cuenta» elegido no se carga el SDK ni hay peticiones externas. Solo se carga con la cuenta elegida o mientras se muestra la pantalla de inicio (necesario para que el popup de Google se abra con un solo toque en Safari).
- **Decisión cerrada por el usuario**: se mantiene la carga del SDK en la pantalla de inicio para abrir Google con un toque, conservando cero solicitudes externas con «sin cuenta» recordado. Especificación, apartado 67; sin cambios de código ni publicación.

### M3. Una respuesta remota podía materializarse tras cambiar de cuenta — **corregido**

- **Evidencia**: `mergeRemote` comprobaba la cuenta solo al empezar (`js/sync-storage.js`, 8C).
- **Riesgo real**: filas de la cuenta anterior escritas justo después de cerrar sesión (ocultas, pero en el dispositivo).
- **Corrección**: comprobación dentro de la transacción (aborta con `SCOPE_CHANGED`) y espera del ciclo del motor antes de borrar (A1).

### M4. Con cuenta, mientras Google restaura la sesión se ven los partidos sin cuenta — **corregido localmente en Fase 12**

**Actualización del 20 de octubre de 2026:** bloqueo desde el arranque hasta resolver cuenta y equipo, con reintento o elección local explícita e invalidación de respuestas tardías. Siete grupos específicos, Auth Emulator, 24 grupos de sincronización y batería local correctos; originales conservados, sin datos reales de prueba ni publicación. Fase detenida para revisión. Véase [FASE12_ARRANQUE.md](FASE12_ARRANQUE.md). La evidencia/propuesta siguiente conserva el hallazgo original de Fase 10.

- **Evidencia**: hasta que llega la identidad, el ámbito es local (`js/sync-storage.js:18`).
- **Riesgo real**: durante 1–2 s (o más con mala red) se puede registrar en un partido del dispositivo en lugar del de la cuenta. No se pierde (queda en ese partido), pero queda en otro sitio.
- **Propuesta**: recordar el último ámbito verificado y aplicarlo al arrancar, o bloquear el registro con «Conectando…» hasta que Auth responda o caduque.

### M5. Una operación bloqueada detiene también la recepción — **corregido localmente en Fase 13**

**Actualización del 20 de octubre de 2026:** se aísla el partido para envíos y el ID conflictivo conocido para recepción, conservando ambas versiones y la cola. Se siguen recibiendo cambios compatibles y enviando otros partidos, sin retirar el aviso ni marcar la operación fallida como sincronizada. 30 grupos Emulator correctos (seis nuevos M5), más regresiones de arranque, cuenta y escuchas; cero escrituras reales. Detenido para revisión y sin publicar. Véase [FASE13_COLA.md](FASE13_COLA.md). Evidencia y propuesta siguientes conservan el hallazgo original.

- **Evidencia**: `js/sync-engine.js:28` lanza el error antes de `pull`.
- **Riesgo real**: un conflicto o permiso denegado impide recibir cambios de otros dispositivos hasta «Reintentar». Ahora el usuario lo ve (punto en el avatar y detalle en el perfil).
- **Propuesta**: apartar la operación bloqueada y seguir enviando el resto y recibiendo.

### M6. La configuración del panel no se sincroniza — **corregido localmente en Fase 14, sin publicar**

- **Evidencia**: `configuracionBotones` y `configuracionPorPartido` viven solo en `settings`; «borrar del todo» comprueba solo tiros locales (`js/configuracion-guardada.js:154`).
- **Riesgo real**: otro dispositivo o una restauración tras borrado de Safari muestra el panel del CSV; los tiros con IDs editados aparecen como filas históricas. No se pierden tiros.
- **Corrección**: versiones inmutables por partido y plantilla del equipo, almacenamiento por ámbito, outbox atómica y recepción por escuchas. Se conservan IDs, eventos, paneles históricos y conflictos sin sobrescribir. Se incluyen las configuraciones de importaciones confirmadas y asociaciones antiguas verificables; no se puede recuperar una configuración que nunca se subió y ya desapareció del dispositivo.
- **Publicación pendiente**: requiere coordinación de código/reglas y actualización de dispositivos; los clientes anteriores no envían el reloj exigido para partidos con panel. Pruebas y límites en [FASE14_PANEL.md](FASE14_PANEL.md), especificación apartado 64. Firebase real permanece intacto.

## Bajo

### B1. Pruebas desfasadas respecto a 8C — **corregido**

`tests/fase3-browser.mjs` y `tests/fase5-browser.mjs` abrían IndexedDB con versión 1 fija (la base es v2 desde 8C: la Fase 5 se quedaba colgada); `tools/firebase/default-off.test.mjs` exigía que el archivo fuente tuviera la sincronización desactivada; `sync-auto-refresh.test.mjs` no activaba el consentimiento de 8C. Se adaptan sin rebajar lo que comprueban.

### B2. Carrera en el cierre de diálogos al reabrirlos rápido — **corregido (código nuevo)**

El evento `close` llega en otra tarea; si se reabre «Vaciar partido» antes, anulaba el objetivo. Detectado por la prueba nueva; corregido antes de entregar.

### B3. Sin respaldo por redirección en Safari — **se mantiene el popup**

`signInWithPopup` (`js/firebase-auth.js:36`) desde el clic, sin esperas previas. `signInWithRedirect` no sirve en GitHub Pages: el `authDomain` (`registro-defensivo.firebaseapp.com`) es otro dominio y Safari bloquea su almacenamiento; la alternativa oficial exige servir `/__/auth/` desde el propio dominio, que Pages no permite en esta subruta. Respaldo actual: mensaje claro si se bloquea la ventana, «Reintentar» y «Continuar sin cuenta» siempre disponibles.

### B4. Dominio de la vista previa todavía autorizado — **retirado y verificado en Fase 16**

Hallazgo original: el dominio temporal `registro-defensivo--ipad-8b2-40nbq9cf.web.app` seguía autorizado, aunque el canal caducaba el 18 de octubre a las 09:38. Con autorización expresa del usuario, el 20 de octubre se comprueba que el canal ya no existe y se retira exclusivamente ese dominio en Authentication real. Los otros cuatro (`localhost`, Firebase y GitHub Pages) permanecen idénticos. Lectura administrativa y consulta pública HTTP 200 coincidentes; sin usuarios, Firestore, reglas ni despliegues. Véase [FASE16_DOMINIO.md](FASE16_DOMINIO.md) y especificación apartado 68.

### B5. Deshacer con cuenta deshace el último en orden local — **documentado**

`js/sync-storage.js:146`: si llega un tiro de otro dispositivo después del propio, «Deshacer» quita ese. Es la política de 8B; afecta solo al último evento del partido.

### B6. Los originales importados quedan ocultos para siempre — **cerrado por decisión del usuario**

Tras «Subir a mi cuenta», el original local se conserva oculto como copia de seguridad (no se borra al cerrar sesión). Ocupa poco, pero no hay forma de verlo desde la app.

El usuario acepta conservar este respaldo y la preferencia de equipo al cerrar sesión, tras aclarar su funcionamiento. Se mantiene el comportamiento existente, sin añadir interfaz para recuperar originales. El respaldo corresponde a la importación, no se actualiza con los tiros posteriores de la copia sincronizada. Decisión registrada en la especificación, apartado 66; sin cambios de código ni publicación.

### B7. Sin política de seguridad de contenido (CSP) — **corregido localmente en Fase 15, sin publicar**

Se añade una meta CSP antes de cargar recursos. Scripts propios, SDK exacto y auxiliares de Google permitidos; sin scripts incrustados ni `eval`. Se limitan conexiones, fotos y frames a sus servicios y se bloquean cambios de base, objetos y formularios externos. Los estilos dinámicos mantienen permiso explícito. El arranque pasa a `js/inicio.js`. Pruebas de bloqueo en Chromium/WebKit, Google hasta OAuth sin credenciales, Auth Emulator y 40 grupos de sincronización correctos. La entrega por meta no aporta `frame-ancestors`; Safari/iPad físico sigue pendiente. Véase [FASE15_CSP.md](FASE15_CSP.md) y especificación apartado 65. Sin publicación ni cambios de Firebase real.

## Comprobaciones sin hallazgos

- **IndexedDB**: esquema v1 (`games`, `events`, `settings`) y v2 aditiva con almacenes de sincronización (`js/persistencia.js:16-27`); ninguna migración reinicia o rebaja la base, ninguna llamada a `deleteDatabase`. Todas las operaciones resuelven en `oncomplete` (`js/persistencia.js:61`): «guardado» es transacción completada. Doble toque: la selección se consume antes de esperar y el ID del evento es idempotente. Deshacer por `seq`, persistente tras recargar. Varias pestañas: `BroadcastChannel`, cola de mutaciones y arrendamiento del motor. Eliminar partido: una transacción, solo sus eventos; con cuenta, lápida prioritaria.
- **Cuota**: unos 400 bytes por tiro; un error de cuota aparece como «Error al guardar» y no se marca nada como guardado.
- **Auth**: persistencia en IndexedDB del SDK; la sesión se restaura al recargar. `itsasnehezkuntza.github.io` está autorizado (consulta pública del 17 de octubre, 18:50 UTC).
- **Modelo Firestore**: `teams/{id}` (propietario), `members/{uid}`, `games/{id}` con sobre (`payload`, `deletedAt`), `events/{id}` y `eventDeletions/{id}`. Sin datos personales salvo el UID en `createdBy`; la nube guarda jornada, rival y los tiros.
- **Reglas**: cada cuenta solo lee y escribe lo suyo. 62 comprobaciones en el emulador (8 nuevas de esta fase: vaciado propio permitido; lápidas ajenas, suplantación, lectura de eventos y lápidas y listados de partidos ajenos denegados).
- **Idempotencia y conflictos**: ID del evento como ID del documento, transacción que compara contenido; mismo ID con otro contenido = conflicto sin sobrescribir. Unión de eventos entre dispositivos.
- **Sin conexión y cierre con cambios sin subir**: la cola es duradera, sobrevive a recargas y cierres, y se reintenta con espera creciente. Al reabrir con la cuenta se sube.
- **Borrados**: lápidas locales y remotas; las reglas impiden recrear un evento con lápida o resucitar un partido.
- **Secretos**: ninguno en el repositorio ni en el historial revisado (solo los detectores de las herramientas). La `apiKey` web es pública por diseño.

## La prueba `tools/firebase/local-browser.mjs`

Fallaba por tres causas distintas: una regresión real (M1), una prueba desfasada (B1, Fase 5 colgada) y la petición del SDK en cada carga (M2). Conclusión: revelaba problemas reales y además había que adaptarla. Ahora exige cero peticiones externas con «sin cuenta» (siete tamaños, recargas incluidas) y, en la primera apertura, solo permite los hosts del SDK y de Auth mientras se ve la pantalla de inicio. Pasa entera.
