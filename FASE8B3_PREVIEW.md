# Fase 8B.3 — Vista previa temporal para Safari/iPad

17 de octubre de 2026. Autorización limitada al canal `ipad-8b2`, proyecto `registro-defensivo`, caducidad 24 horas. No incluye canal live, GitHub Pages, reglas nuevas, migraciones, commit o push.

## Resultado del despliegue y verificaciones preliminares

- **Confirmación manual en Safari/iPad:** tras indicar abrir el enlace en horizontal, iniciar Google con la cuenta exclusiva y recargar conservando sesión/«Solo local», el usuario responde «Funciona». Se registra acceso y persistencia tras recarga como correctos por confirmación manual; no equivale a sincronización, cierre/reapertura tras suspensión ni medición completa responsive. Modelo de iPad y versión de iPadOS no registrados todavía.
- **URL real:** https://registro-defensivo--ipad-8b2-40nbq9cf.web.app
- **Hostname autorizado:** `registro-defensivo--ipad-8b2-40nbq9cf.web.app`. Añadido mediante API de configuración de Authentication; lectura posterior confirma que está presente y que se conservan todos los dominios anteriores. No hace falta añadirlo manualmente.
- **Canal:** `projects/registro-defensivo/sites/registro-defensivo/channels/ipad-8b2`.
- **Versión vigente:** `f0a4971d2c312bef`, actualizada en el mismo canal para ofrecer activación manual. La primera versión OFF, `b719302881e4018e`, se conserva en el registro de evidencia.
- **Caducidad vigente:** 18 de octubre de 2026 a las **09:38 CEST**, hora de Madrid; `2026-10-18T07:38:46.623547158Z`. No se ha prolongado más allá de las 24h iniciales; se acortó unos dos minutos para mantener ese límite al actualizar.
- **Sync inicialmente desactivado.** La copia ofrece activación manual, cuya comprobación SDK en Safari ya confirma el usuario. La aceptación se guarda en ese origen/navegador y se conserva al recargar. El usuario confirma también creación del equipo/partido ficticio y primer tiro, con un intento y «Sincronizado». Recuperación desde el ordenador pendiente.
- Verificados por HTTPS los hashes de los **35 archivos** frente al manifiesto local, las cabeceras `no-store`/`noindex` y 404 para documentación, reglas, herramientas, `.env` y manifiesto. Sin OAuth automatizado.
- Chromium sobre la **URL real**, contextos nuevos efímeros a 1024×768 y 1180×740: base deportiva inicialmente vacía, registro de un tiro ficticio en dos pulsaciones, conservación al recargar, Solo local, sin error de página/guardado ni desbordamiento horizontal, botón Google disponible. **Cero solicitudes SDK/servicio Firestore.** Los datos de estas comprobaciones solo estuvieron en IndexedDB efímero; contextos cerrados.
- Firebase CLI confirma que live sigue sin release, con fecha de actualización del 15 de octubre. No se ha publicado en live ni GitHub Pages. Sin commit o push.

Evidencia local: `.test-artifacts/firebase/fase8b3/preflight.json`, `deployment.json`, `deployment-first.json`, `auth-domain.json`, `https-smoke.json`, `test-identity.json`, `account-emulator.json`, `package-verification.json`; manifiesto en `.test-artifacts/firebase/ipad-preview/manifest.json`. Ninguno forma parte del paquete público.

## Cuenta exclusiva y activación manual

El usuario facilita la identidad exclusiva. Se consulta únicamente ese correo mediante Authentication, sin listar cuentas: proveedor Google, huella `7e6e354a4f4deb94`, distinta de la propietaria anterior. Consulta administrativa acotada por `ownerUid`, seleccionando solo metadatos de equipo: **cero equipos**. No se leen partidos ni se crean documentos. El correo y UID en claro no se añaden al plan público ni a la evidencia; se usa la huella, que no es una credencial.

La barrera de seguridad es la identidad dedicada y las reglas de propietario/membresía en servidor: no es propietaria de equipos deportivos reales. El filtro del transporte a `PRUEBA 8B.2 IPAD` es protección adicional frente a errores de destino. No se presenta una bandera o el canal Hosting como aislamiento de Firestore.

Cambios de la actualización:

- `ipad-preview-plan.json`: sustituye la huella anterior por la identidad exclusiva verificada. `ipad-preview.mjs` exige la evidencia de esa verificación antes de generar una copia con capacidad de activación.
- `js/preview-account.js`: antes de aceptar, comprueba proyecto, identidad, sesión estable, consulta de equipos propios limitada al fixture y, si existe, propietario/miembro activo. Exige `permission-denied` al leer exclusivamente el equipo ficticio ajeno de seguridad 8B.2; red u otro resultado no cuentan como éxito. Ninguna escritura.
- Bootstrap: botón explícito en «⋯», rechaza partidos locales previos sin importarlos, guarda prueba mínima local y recarga solo si pasan los controles. Un error deja la prueba desactivada y pide detenerse. No se borran datos. Tras activar, crear equipo requiere otra acción explícita; no crea partidos ni sube eventos por sí solo.
- Configuración generada: `syncAvailable: true`, **`syncEnabled: false` de inicio**. Solo la marca local posterior a las comprobaciones activa el módulo al recargar. El archivo fuente `js/sync-config.js` sigue false/false/false y Pages/live siguen excluidos. Cerrar sesión usa el aislamiento habitual; otro UID es rechazado antes de cargar transporte.
- El paquete vigente contiene **36 archivos** (se añade el módulo de comprobación), todos verificados de nuevo por hash a través de HTTPS. Herramientas, pruebas, documentación e informes siguen fuera del paquete.
- Nueve comprobaciones nuevas en Emulator correctas: cuenta vacía, cuenta errónea, sin sesión, red, permiso inesperado, cambio de cuenta durante lectura, equipo único/miembro activo, acceso externo denegado y segundo equipo propio que detiene. Dos pruebas de empaquetado/arranque correctas, incluidas marca ausente y persistencia de aceptación.
- Verificación sobre HTTPS real en dos tamaños: botón disponible; intentar activar sin sesión se rechaza sin guardar aceptación ni hacer solicitudes Firestore; registro local de dos pulsaciones y recarga correctos. Se corrigió la automatización para abrir antes el menú; no fue un fallo de la aplicación. No se simuló una sesión Google para dar por superado el control SDK real.

**Resultado manual de la activación en Safari:** el usuario confirma «Veo la prueba activada, Equipo y Crear equipo». Esa pantalla posterior a la recarga solo se alcanza al superar el control SDK cliente, que valida identidad/proyecto/sesión, consulta de equipos propios y `permission-denied` del fixture ajeno; se registra como superado por confirmación manual, no como informe extraído automáticamente del dispositivo. La evidencia mínima de ese control queda en el almacenamiento del origen de pruebas. No se han creado documentos por la activación.

**Primera escritura real desde Safari confirmada:** ante la instrucción de crear una sola vez `PRUEBA 8B.2 IPAD`, crear `IPAD-8B2 / Rival ficticio` y registrar Bajo aro → 2 fallado, el usuario responde «Un intento y Sincronizado». Se acredita manualmente el registro de dos pulsaciones y confirmación del servidor. Las operaciones implican equipo, miembro propietario, partido y un evento ficticios en el equipo reservado; no se ha obtenido aún inventario administrativo de sus IDs. No se han creado otros datos ni lápidas en esta prueba por automatización.

**Recuperación iPad → ordenador confirmada:** el usuario responde «Veo el mismo partido, un intento y Sincronizado», tras iniciar la cuenta exclusiva, activar y seleccionar el equipo/partido existentes. Un intento en ambos, sin duplicados visibles. Confirmación manual, sin inspección automática del dispositivo.

**Incidencia al comprobar ordenador → iPad:** tras el tiro Bajo aro → 2 anotado, el ordenador mostraba dos intentos y el iPad uno; el usuario solo observó ambos actualizados después de recargar el ordenador. Confirma después dos intentos y Sincronizado en ambos. No se da por superada la propagación automática. Se detienen nuevas escrituras, Deshacer y borrados hasta aclarar si hubo espera insuficiente, suspensión de Safari o fallo de refresco.

Lectura administrativa acotada al fixture (sin modificar datos): partido `0f901d0f-9885-499d-b40d-2e0234f51ad0`, no eliminado, exactamente dos eventos y cero lápidas. Evento fallado `0ad91a0a-5b4b-4bf2-8c38-fe975e43e090`; anotado `f5270206-1f1a-41c1-a98f-b4467891f125`. Segundo evento: payload local `07:59:47.014Z`, creación del servidor `07:59:47.301Z`, diferencia 287 ms. No indica retraso importante en el envío; el momento exacto de la recarga no está registrado. El primer evento difiere 29,438 s entre reloj local del iPad y servidor, lo que puede incluir desfase de reloj además de latencia y no se usa como medida concluyente. Evidencia `read-fixture.json`; no es una prueba de Rules mediante SDK cliente.

El usuario concreta que **Safari estaba visible y esperó al menos 15 segundos**. No se descarta como una espera insuficiente ni se considera superado el refresco automático. Tampoco se atribuye a segundo plano sin evidencia. El resto de la prueba física queda pausado, con los dos eventos conservados.

Revisión local: el motor programa un sondeo cada 5000 ms al terminar cada ciclo; `wake` reacciona a escritura local/online. Los eventos focus/visibility de la aplicación releen IndexedDB, pero no piden expresamente una lectura remota. Esa diferencia es una línea de investigación, no prueba de causalidad en Safari visible. No se ha desplegado una corrección ni forzado un reintento real.

Nueva prueba `tools/firebase/sync-auto-refresh.test.mjs`: dos contextos aislados con aplicación, IndexedDB y motor reales, identidad/transporte compartido ficticios, sin Firebase/OAuth. Espera un sondeo periódico de A antes de registrar desde B; **A actualiza datos y marcador tras 5006 ms**, ambos quedan con dos eventos/Sincronizado, sin recargar ni llamar manualmente a start/wake/retry. Evidencia `auto-refresh.json`. Es una comprobación positiva local del sondeo/UI, no una validación del transporte Firestore real en Safari.

Durante la preparación, el doble de autenticación inicialmente restauraba una cuenta de manera síncrona antes de completar el arranque y dejó controles deshabilitados; se detectó una posible carrera de inicialización con cambio de ámbito y snapshot inicial, separada de este caso (el ordenador sí registraba y Safari ya funcionaba). El diagnóstico de sondeo se ajustó para simular un inicio de sesión después del arranque, como en esta secuencia manual. Esa carrera de restauración queda pendiente de una regresión específica; no se parchea ni se presenta como causa demostrada de los 15 segundos.

**Cierre provisional de esta comprobación:** datos coherentes y sin duplicados en el servidor, propagación inicial correcta y actualización inversa observada solo tras recarga. Falta instrumentar/contrastar el ciclo remoto y la aplicación del resultado en el Safari físico antes de nuevas escrituras o de dar por aprobada la sincronización. No se publica otro paquete ni se cambia una regla por esta incidencia.

## Configuración revisada

- Paquete regenerado con **Sync OFF**. Las dos pruebas de empaquetado/arranque pasan. Lista explícita de 35 archivos de aplicación, fuentes/licencias y bootstrap; manifiesto fuera del directorio público. Sin documentación interna, herramientas, informes, pruebas, archivos de configuración administrativa ni credenciales privadas.
- Configuración pública de Authentication: proyecto `registro-defensivo`, aplicación `1:760744900094:web:56f037728d252c22fcfcaf`, SDK 12.11.0. `firebase.preview.json` solo contiene Hosting y apunta al directorio generado, nunca a la raíz.
- Las reglas contrastadas en 8B.2 exigen propietario y miembro activo para acceder a partidos; la matriz real confirmó 25 decisiones esperadas. En 8B.3 se ha hecho **lectura administrativa actual** del release `cloud.firestore`, ruleset `4bc70f67-e0ed-4fb0-b46e-7c2494eab227`: coincidencia exacta normalizada con `firestore.rules`, hash `8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`. No se cambian reglas ni se repite la matriz SDK real en esta fase.
- **Límite de aislamiento detectado:** la cuenta propietaria anterior está autorizada en servidor para todos sus equipos. Restringir un ID en JavaScript no elimina esos permisos. Antes de habilitar Sync se necesita una cuenta dedicada sin equipos/datos reales o una alternativa de aislamiento en servidor revisada por separado. Una bandera cliente no constituye esa barrera.
- Firebase CLI no tenía sesión al comenzar. El usuario completó `firebase login`; se verificó el sitio mediante consulta. La sesión se usa mediante el CLI, sin copiar credenciales al repositorio. El usuario confirma que usará una cuenta Google exclusiva de pruebas para la aplicación, distinta de la función administrativa del CLI.

## Despliegue realizado

Con sesión CLI se comprobaron sitio/proyecto/reglas y lista/hashes; se ejecutó exclusivamente:

```powershell
& "C:\Program Files\nodejs\node.exe" tools/firebase/ipad-preview.mjs
& "C:\Program Files\nodejs\node.exe" node_modules/firebase-tools/lib/bin/firebase.js hosting:channel:deploy ipad-8b2 --project registro-defensivo --config firebase.preview.json --expires 24h --no-authorized-domains
```

Esos comandos describen la primera publicación OFF. Tras verificar la cuenta, se generó la actualización con `--enable-sync`: ahora esa opción significa **ofrecer activación manual**, manteniendo OFF en el primer acceso. Se publicó en el mismo canal con duración restante calculada, no con otras 24h adicionales. URL y dominio no cambiaron. No hubo nuevo cambio de Authentication.

`--no-authorized-domains` evitó cambios automáticos del CLI. Posteriormente `preview-authorize-domain.mjs` añadió solo el hostname real y verificó que no se retiraba ningún dominio. También se crearon las herramientas locales `preview-preflight.mjs` (solo lectura) y `preview-live-smoke.mjs` (contextos efímeros, sin login ni Firestore), excluidas del paquete. Los despliegues y verificaciones administrativas no crearon documentos Firestore; posteriormente el usuario confirmó la creación ficticia mediante SDK desde Safari, descrita arriba.

## Prueba física y retirada

Procedimiento en `PRUEBA_SAFARI_IPAD.md`. Mientras Sync esté desactivado solo se pueden acreditar acceso HTTPS, login/persistencia y uso local con datos ficticios; recuperación remota, Deshacer entre dispositivos y borrado sincronizado seguirán pendientes.

**Pausa de nuevas operaciones:** conservar dos intentos/Sincronizado en ambos; no añadir ni deshacer tiros, no borrar, no repetir el envío ni forzar Reintentar. Tiempo de espera y visibilidad ya aclarados; pendiente diagnóstico del transporte/recepción en el dispositivo. La autorización limitada de 8B.3 queda registrada, sin ampliarla a reglas o datos reales.

Para retirar, confirmar primero el estado de las operaciones, cerrar las páginas y eliminar únicamente el canal autorizado:

```powershell
& "C:\Program Files\nodejs\node.exe" node_modules/firebase-tools/lib/bin/firebase.js hosting:channel:delete ipad-8b2 --site registro-defensivo --project registro-defensivo --config firebase.preview.json
```

Verificar que el canal ya no aparece y la URL queda inactiva. Retirar solo su hostname de Authentication si sigue presente. **La caducidad o eliminación del canal Hosting no elimina los documentos ficticios de Firestore ni sus lápidas.** No se borra ningún dato ni almacenamiento de Safari como parte de esta operación.

Las vistas previas tienen URL pública y utilizan los recursos reales del proyecto. Fuentes oficiales: [preview de Hosting](https://firebase.google.com/docs/hosting/test-preview-deploy), [caducidad y gestión de canales](https://firebase.google.com/docs/hosting/manage-hosting-resources), [autorización mediante reglas](https://firebase.google.com/docs/firestore/security/rules-conditions).
