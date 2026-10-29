# Fase 22 — Google, equipo y sincronización automática

29 de octubre de 2026. Implementación y verificación local terminadas sobre `develop`, detenidas para revisión. La versión pública sigue siendo 20.0. No incluye publicación de Fase 21 ni administración de equipos ajenos.

## Conservación y alcance

Antes de modificar: respaldo de las 363 rutas existentes versionadas/sin seguimiento, ausencias, SHA-256, estado Git y diff en `.local-backups/fase22-cuentas-20261029/`. HEAD inicial `7c439c149ad2bbe4e71749260e8b9d10f45c0d83`. No cambiar ramas, índice ni referencias. Separación de esta fase mediante comparación contra ese respaldo, no contra HEAD, que contiene trabajo acumulado anterior.

Se reutilizan IndexedDB v2, outbox, transporte Firestore y reglas existentes. No hay cambio de esquema, dependencias, Firebase real, migraciones reales, commits, push ni despliegues. `js/configuracion-guardada.js` conserva la corrección de integridad de Fase 21 byte por byte. No se modifica Registro ni Dashboard salvo el texto y el aviso de estado de almacenamiento.

## Flujo implementado

- **Sin cuenta:** IndexedDB, partidos, tiros, estadísticas y CSV. Con elección local recordada no se inicia Authentication ni Firestore. El aviso dice «Guardado en este dispositivo».
- **Google:** la sincronización se prepara automáticamente. El antiguo consentimiento de activación se deja intacto, pero deja de gobernar el flujo. No hay botones de activar/desactivar Sync ni selección «Solo local» dentro de una cuenta activa.
- **Sin equipos:** pantalla de equipo con nombre obligatorio, alta explícita y cuenta visible. No se crean nombres genéricos. No se puede registrar mientras falta el equipo, tampoco forzando eventos de los controles ocultos.
- **Un equipo:** selección automática tras comprobación de permisos. **Varios:** última selección válida, o elección explícita si falta. Un UID nunca utiliza la preferencia de otro UID.
- **Equipo configurado:** caché y preferencia permiten reanudar el registro offline antes de recibir la respuesta de Firestore. Las escrituras remotas siguen sujetas a las reglas. Un permiso revocado detectado no se trata como desconexión: se retira el ámbito y se pide equipo/reintento.
- **Primera configuración inaccesible:** salida identificada a modo local, disponible también durante la espera. Suspende el controlador y el motor de la aplicación sin borrar datos ni revocar por sorpresa la sesión persistida de Google. Para cambiar de identidad desde la preparación existe «Usar otra cuenta», con las mismas comprobaciones de cierre.
- **Recarga/reconexión/segundo plano:** se reutiliza la cola persistente. `online`, `pageshow` y regreso visible despiertan el motor; no abren suscripciones adicionales si ya existen. La lista de equipos se consulta al preparar/restaurar la cuenta, no en cada tiro ni en cada ciclo.

## Guardado, históricos y cierre

«Guardado en este dispositivo» depende de la transacción local completada. El aviso visible separa pendientes y errores de «Sincronizado», que sigue dependiendo del motor y de snapshots confirmados del servidor. No certifica todos los históricos del dispositivo ni constituye copia independiente.

Las lecturas de fondo sin cambios no hacen parpadear el aviso como pendiente: la confirmación visual se conserva únicamente para la misma referencia de ámbito, sin pendientes ni errores. Una nueva mutación, cambio de ámbito o error la invalida; nunca se utiliza para dar por enviados datos nuevos. Se evita reescribir el mismo anuncio accesible si el texto no cambia.

La selección de partido confirma también su guardado cuando un refresco de Sync ha invalidado el render capturado: se conserva la comprobación de revisión para aplicar la vista, pero «Guardado» depende de la transacción completada. Antes podía quedar un «Guardando» oculto indefinido tras seleccionar un partido sincronizado; el nuevo aviso hizo visible ese defecto y la prueba de selección/sincronización lo cubre.

Los históricos no se suben al entrar, crear equipo ni actualizar. Se ofrece revisión y confirmación, con destino y partidos visibles. También se detectan los partidos creados por usuarios de 20.0 con cuenta y sin equipo aunque ya exista la marca antigua de pregunta. El usuario puede conservarlos solo aquí y abrir la revisión posteriormente.

Los originales importados no se vuelven a ofrecer. La importación conserva originales, IDs deportivos y bindings; repetir el mismo plan en el mismo destino es idempotente. Un original ya incorporado no puede volver a importarse a otro equipo. Un plan vacío confirmado es una operación sin efectos. No se deduplica por rival/jornada ni se intenta fusionar automáticamente bases de dispositivos diferentes.

Se elimina «Salir igualmente». Con pendientes se permite esperar o cancelar; con históricos locales de la cuenta se solicita revisarlos/incorporarlos antes de cerrar. Un conflicto bloqueado necesita revisión; no se descartan datos para permitir el cierre.

La purga invocada por la UI tiene una comprobación **dentro de su transacción**: si existe cola o partido local no importado del UID, aborta íntegramente con `UNSYNCED_DATA`. Protege la carrera con otra pestaña y las purgas aplazadas de 20.0. Si la identidad cambia externamente o se pierde la sesión, la cola permanece vinculada al UID original, oculta a la otra cuenta y recuperable al volver. El borrado local habitual tras un cierre limpio conserva los originales importados y los partidos sin cuenta.

## Archivos de aplicación

`index.html`, `cuenta.css`, `app.js`, `js/cuenta.js`, `js/cuenta-ui.js`, `js/sync-ui.js`, `js/sync-storage.js`, `js/firestore-sync.js` y `js/sync-config.js`.

`firestore-sync.js` solo añade el código estable `permission-denied` a la validación fallida de membresía ya existente. No amplía permisos ni cambia rutas remotas.

Pruebas/herramientas adaptadas: `tests/fase10-browser.mjs`, `tools/firebase/auth-browser.mjs`, `tools/firebase/browser-support.mjs`, `tools/firebase/local-browser.mjs`, `tools/firebase/startup12.test.mjs`, `tools/firebase/sync-ui.test.mjs`, `tools/firebase/cuenta.test.mjs` y `tools/firebase/emuladores.mjs`. Nueva batería `tools/firebase/account22.test.mjs`. Documentación: este archivo, `ESPECIFICACION.md` y `README.md`. Son 21 rutas de esta fase; el resto del trabajo acumulado no forma parte de su diff.

## Pruebas y resultados

Verificación terminada. Los comandos siguientes usan perfiles efímeros y datos ficticios. La ejecución completa final de `account22` termina con código 0: 28 grupos correctos (14 por motor), sin errores inesperados, destinos de datos prohibidos ni escrituras reales. Los avisos esperados de transporte quedan contados y correlacionados en los recibos; no sustituyen las comprobaciones de datos.

| Comando | Cobertura |
| --- | --- |
| `node tools/firebase/emuladores.mjs account22` | Aplicación y SDK oficiales en Auth/Firestore Emulator; Chromium y WebKit, doce escenarios solicitados y compatibilidad 20.0. Recibo `fase22/cuentas.json`. |
| `node tools/firebase/emuladores.mjs sync` | Regresión del motor, reglas, concurrencia, importación, paneles y UI entre dispositivos. |
| `node --test tests/*.test.mjs tools/firebase/cuenta.test.mjs` | Once archivos: deporte, configuración, estadísticas, panel, CSV, integración y controlador. |
| `node tools/firebase/panel-local21.test.mjs` | 42 grupos de Fase 21 en Chromium/WebKit y esquemas v1/v2; atomicidad y carreras. |
| `node tools/firebase/startup12.test.mjs` | Módulos/Auth/equipo lentos, respuestas tardías, elección local y preservación de históricos. |
| `node tools/firebase/startup18.test.mjs` | Seis escenarios en Chromium/WebKit y cuatro tamaños, inicio exclusivo, errores y salida local. |
| `node tools/firebase/editor19.test.mjs` | Cursor, foco, teclado y nombre conservados tras guardar y recargar en Chromium/WebKit. |
| `node tools/firebase/local-browser.mjs` | Fases 2/3/5/6/10, siete tamaños, errores, CSV, persistencia y subruta Pages. Requiere paquete estático local actualizado. |

Resultados adicionales correctos: 40 grupos de Sync; 42 de integridad local Fase 21; 11 archivos de pruebas unitarias; 8 grupos de arranque Fase 12, 6 de Fase 18 y 2 de editor Fase 19; 17 entradas en el recibo local (pruebas funcionales, tamaños y subruta). Recibos en `.test-artifacts/firebase/{sync.json,local.json,fase12/arranque.json,fase18/inicio.json,fase19/editor.json,fase21/regresion.json,fase22/cuentas.json}` y log de unitarias en `fase22/unitarias.log`. Los chequeos de sintaxis de los módulos modificados son correctos.

Conservación final: 19 archivos previos modificados y 2 nuevos, exclusivamente los enumerados; los otros 343 archivos del respaldo conservan su SHA-256 y `premium.css` sigue ausente como al inicio. Rama `develop`, mismo HEAD, índice vacío. Reglas, configuración Firebase, dependencias, categorías y corrección de Fase 21 conservadas byte por byte. Diff exclusivo de esta fase frente al respaldo en `.test-artifacts/firebase/fase22/fase22.patch`, verificación en `conservacion.json` y estado final en `git-status-final.txt`; no utilizar el diff global contra HEAD para atribuir el trabajo de esta fase.

`npm run test:auth` pasa a ejecutar la batería de acceso automático, que requiere ambos emuladores. La batería antigua esperaba Google sin equipo y una salida que borraba pendientes; esos comportamientos ya no son el contrato vigente. La regresión de UI de Sync se adapta conservando sus pruebas de panel, CSV, vaciado, dos dispositivos y reconexión.

Durante la validación se ajustaron esperas de las pruebas: el vaciado rechaza y después actualiza el mensaje mediante una lectura asíncrona; la importación debe confirmar y cerrar su diálogo antes de contar operaciones. También se acotaron puertos distintos y se renovó la copia estática de subruta, que era anterior a esta fase. No se cambia la persistencia para satisfacer esas esperas. La política local de PowerShell no permite ejecutar el empaquetador `.ps1`: la copia de sus 38 archivos explícitos se realiza con Node, solo dentro de `.test-artifacts/pages`, sin cambiar esa política.

La primera ejecución de la regresión de cursor agotó la espera de recarga; al repetir con diagnóstico pasó en ambos motores, sin cambios en el editor ni en su persistencia. La instrumentación temporal de esa prueba se retiró y sus bytes originales quedaron conservados. No se identifica una causa concluyente para ese timeout aislado.

El SDK oficial y la interfaz del Auth Emulator pueden cargar recursos estáticos de Google y unpkg; las solicitudes de datos reales de Authentication/Firestore están bloqueadas en la batería nueva. Permisos revocados se simulan cambiando exclusivamente miembros ficticios dentro de `demo-defensas`, con reglas sin modificar.

El popup original del adaptador se ejercita en Chromium, incluido su bloqueo real. El WebKit de Windows devuelve `auth/internal-error` en el popup gapi del emulador: exclusivamente en la prueba se sustituye la acción de entrada por `signInWithCredential` del SDK oficial con una credencial Google ficticia aceptada por Auth Emulator. Authentication, observación, persistencia de sesión, cierre, Firestore y almacenamiento siguen siendo reales de emulador; no se modifica el adaptador de producción. El error de popup en WebKit se inyecta para comprobar la reacción de la interfaz. No se presenta esta batería como validación del popup de Safari físico.

Se liberan los canales de los dispositivos que dejan de intervenir antes de la siguiente matriz, como en la batería de Sync existente. Antes de la última prueba entre pestañas se devuelve el foco al emisor y se espera su restauración/selección antes de cortar la red: abrir la otra pestaña puede restaurar la selección compartida. WebKit informa algunas cancelaciones de WebChannel por cortes, recargas y cierres como errores de página de acceso a red. Solo se separan los mensajes del endpoint `127.0.0.1:8085/.../Firestore/(Listen|Write)/channel`, base `demo-defensas` y SID de un canal con petición fallida registrada por Playwright. La URL del reintento cambia de RID/zx y no coincide literalmente con la petición original; esa diferencia se conserva en el diagnóstico `transporte.json`. Su número se registra como `expectedOfflineTransportErrors`; cualquier otro error o destino de datos real hace fallar la prueba. Todas las verificaciones de acuses, datos, IDs y recuperación siguen siendo obligatorias.

## Límites y revisión

- WebKit automatizado no acredita un iPad físico, retención prolongada ni almacenamiento persistente concedido por Safari.
- La prueba de recarga offline mantiene disponible el servidor loopback de archivos y Auth Emulator, e interrumpe Firestore; no simula que el navegador pueda descargar la web desde cero sin red. La aplicación sigue sin service worker ni instalación offline nueva.
- Los dispositivos/bases distintos no se fusionan automáticamente. CSV conserva evidencia deportiva; no incorpora un importador ni es una copia completa de la base.
- Un cierre externo puede dejar datos de la cuenta conservados y ocultos por UID en IndexedDB para evitar pérdidas; ese aislamiento no cifra los datos frente a alguien con herramientas del navegador en el mismo dispositivo.
- La retirada del botón de activación implica que una cuenta existente prepara Sync al entrar aunque antes lo tuviera desactivado. Sus históricos permanecen sin subir hasta confirmación.
- No se recuperan ni manipulan partidos reales del entrenador. Esa intervención sigue siendo independiente y necesitaría autorización concreta.

Antes de publicar: revisar esta fase y hacer una prueba física con cuenta exclusiva y partidos ficticios en Safari/iPad: primer equipo, acuse en otro dispositivo, corte de red, regreso del segundo plano y cierre con pendientes. Esa prueba debe prepararse en un entorno aislado y requerirá autorización adicional si implica despliegue o escrituras en Firebase real, aunque los partidos sean ficticios. Preparar después un candidato y una publicación autorizados, conservando la Fase 21. No hace falta desplegar reglas nuevas por estos cambios. Detenerse para revisión.
