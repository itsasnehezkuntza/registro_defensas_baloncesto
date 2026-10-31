# Fase 23.1 — Revisión final y preparación de publicación

29 de octubre de 2026. **Veredicto: publicable técnicamente; sin bloqueantes de seguridad detectados.** La publicación y las asignaciones siguen pendientes de autorización. Esta revisión no ha accedido a reglas activas ni a datos deportivos reales y no ha realizado commit, push o despliegue.

La copia revisada sigue en `.test-artifacts/fase23-repo`, base `6003a72` sobre las fuentes publicadas 22.0 `6bfe942d32de8b4fe6efef8cafd48f533acbd339`. No se usa el diff acumulado de develop. No se cambia código de aplicación ni reglas en esta fase: solo documentación, una prueba adicional acotada y preparación de archivos.

## Revisión de seguridad

| Punto | Conclusión y evidencia |
| --- | --- |
| Escrituras del propietario | Las 19 cláusulas son idénticas a 22.0. Además se ha reconstruido el archivo anterior quitando solo los añadidos de lectura: coinciden también todas sus funciones auxiliares y ámbitos. No hay un permiso solapado nuevo que permita escribir. |
| Supervisor sin escrituras deportivas | `reader()` aparece solo en lectura. Crear, panel, evento, Deshacer y eliminación siguen sujetos a `owner()`. Ataques directos por SDK y por transporte rechazados en las 101 comprobaciones existentes. Un supervisor conserva sus derechos de propietario únicamente en sus propios equipos. |
| Autoconcesión | `supervision/{uid}/teams/{teamId}` tiene `allow write: if false`. Propietarios, supervisores y externos no pueden crear, cambiar o borrar esos permisos. No existe interfaz administrativa cliente. |
| Aislamiento | ACL por UID/ruta de equipo, schemaVersion 1, role reader y status active. Sin ACL activa, lectura de equipo/partidos/eventos denegada. Correo coincidente, claim inventado y cuenta anónima no conceden acceso. Miembros y perfiles ajenos siguen privados. |
| Descubrimiento | Consulta exactamente `supervision/{uidAutenticado}/teams`; las Rules exigen ese mismo UID. Después obtiene por ID solo los equipos con permiso activo. Enumeración global y collectionGroup denegados en las pruebas existentes. |
| Revocación | Estado revoked, ausencia de ACL o ACL inválida deniegan nuevas lecturas del servidor. La escucha privada limpia selectores/Dashboard e invalida respuestas pendientes al detectar el cambio. Offline, ocultación y cambio de UID también retiran la vista; no se promete retirar información ya recibida. |
| Autorización efectiva | Firestore Rules, sin confianza en correo ni controles visuales. El distintivo «Solo lectura» explica el modo; no es la barrera de seguridad. |
| Separación del motor | Grafo de 10 módulos de supervisión, sin persistencia deportiva, outbox, sync-engine, firestore-sync o cuenta-ui. La persistencia de Firebase Auth es solo de sesión: no equivale a IndexedDB deportivo. Módulos/red y base deportiva ya comprobados en Chromium/WebKit. |
| Cliente 22.0 bajo reglas nuevas | Comprobación adicional terminada con código 0: archivos exactos de Pages 22.0, cuenta ficticia y emuladores; crear equipo/partido, confirmar tiro en servidor, recargar, Deshacer y recargar sin resurrección. Solo se sustituyen configuración de emulador y CSP loopback de prueba. |

Evidencia reutilizada sin repetir baterías: 101 comprobaciones/grupos específicos, 85 de reglas, 40 de Sync, 28 de cuentas, 12 archivos unitarios, 17 entradas locales/CSV y dos recorridos de actualización. Los avisos WebKit documentados son canales interrumpidos correlacionados, no errores de autorización ignorados.

Nueva evidencia en `.test-artifacts/firebase/fase23-1/`: `cliente22.json` (único recorrido funcional nuevo) y `revision.json` (comparación completa, grafo, huellas y manifiestos). Se comprueba que los 43 assets y las reglas siguen coincidiendo con las huellas de la entrega probada. No se han vuelto a ejecutar las baterías extensas.

## Archivos exactos de publicación

Todo lo preparado está dentro de **esta copia aislada**, en `.test-artifacts/firebase/fase23-1/`:

- `candidato/public/`: **44 archivos públicos**. Lista completa en [ARCHIVOS_PUBLICACION.txt](.test-artifacts/firebase/fase23-1/ARCHIVOS_PUBLICACION.txt); SHA-256 por archivo en [revision.json](.test-artifacts/firebase/fase23-1/revision.json).
- `candidato/reglas/firestore.rules`: único archivo de reglas que se propone publicar en Firestore, fuera de Pages.
- `candidato/reglas/firebase.rules-only.json`: configuración local explícita, solo reglas, sin Hosting, Authentication o índices. Evita heredar configuración de develop.
- `reversion/pages22/`: **39 archivos exactos** del commit Pages 22.0 `3aed91f329ed00b672b16ae6002a41e9acf68001`.
- `reversion/reglas22-base.rules`: referencia de reglas de las fuentes 22.0; **no se presenta como copia recién verificada de las reglas activas**.

Respecto a Pages 22.0: cinco archivos nuevos (`supervision.html`, `supervision.css`, `js/supervision-ui.js`, `js/supervision-reader.js`, `js/panel-configuration.js`) y tres modificados (`index.html`, `js/configuracion-guardada.js`, `version.json`). Los otros 36 conservan exactamente los bytes publicados. La extracción de configuración conserva sus exportaciones y comportamiento. El paquete transforma únicamente el metadato 23.0-local→23.0 en ambos HTML y añade metadatos de build, sin cambios funcionales posteriores a las pruebas. No se inventa un commit de Fase 23: `version.json` identifica la base y la huella del código revisado.

No publicar herramientas, pruebas, documentación interna, reglas/configuración Firebase, `.git`, `.agents`, perfiles, recibos o copias de reversión en Pages. No copiar toda la raíz ni usar el empaquetador histórico de otra fase. En un futuro commit de fuentes se incluirán solo las rutas revisadas de esta copia; ese commit no está autorizado ahora.

## Orden seguro de despliegue — plan, no ejecutado

Los pasos siguientes requieren una autorización posterior de publicación y prueba ficticia. Una anomalía detiene el siguiente paso.

1. **Respaldar y verificar el estado vigente.** Comprobar proyecto `registro-defensivo`, base `(default)` y sitio Pages habitual. Obtener exclusivamente metadatos de release y fuentes del ruleset activo; guardarlos completos, con nombre de release/ruleset, fecha y SHA-256, fuera del paquete público. Comparar las fuentes normalizadas con `reglas22-base.rules`. Si difieren, detenerse y revisar: no sobrescribir cambios ajenos. Comprobar también que el Pages vigente coincide con las 39 huellas de reversión. La captura vigente se realizará al publicar, no se presupone por el informe histórico. No consultar colecciones deportivas para este respaldo.
2. **Publicar únicamente las reglas candidatas.** Verificar su SHA-256 y la configuración dedicada. Usar proyecto y configuración explícitos, alcance `firestore:rules`; nunca `deploy` general ni la configuración de develop. Registrar el nuevo ruleset/release y volver a obtener sus fuentes para verificar la huella. Esperar propagación antes de validar permisos; no asumir efecto instantáneo en todas las escuchas. No cambiar índices, Auth, dominios o Hosting.
3. **Comprobar continuidad antes de la interfaz.** Con el cliente público 22.0 y una cuenta entrenadora de pruebas ya existente, usar exclusivamente su equipo/partido ficticio autorizado: abrir sesión/equipo y comprobar un registro/recarga/Deshacer. Las reglas de propietarios son idénticas y el recorrido exacto 22.0 ya pasa en Emulator. Si se solicita confirmación de entrenadores reales, ellos comprobarán su acceso desde su dispositivo y comunicarán el resultado; el agente no abrirá, leerá ni hará pruebas sobre sus datos reales. Si falla el acceso normal, no publicar la interfaz y restaurar las reglas verificadas del paso 1.
4. **Publicar la interfaz.** Partir únicamente de esta copia y de `candidato/public/`, con manifiesto exacto. Publicar las 44 rutas en la misma raíz/subruta de Pages, sin configurar otro origen. No mezclar un HTML nuevo con módulos anteriores: incluir juntos configuración extraída y su dependencia. Confirmar build, versión 23.0, hashes HTTPS y ausencia de rutas internas públicas; conservar los IDs/huellas anteriores. El usuario recargará con conexión, sin borrar almacenamiento.
5. **Asignar una sola relación ficticia.** Con autorización específica, identificar una cuenta supervisora autorizada y un equipo de prueba aislado, con propietario de pruebas y contenido enteramente ficticio. Aplicar únicamente su ACL administrativa; registrar proyecto, UID, equipo, ownerUid y estado anterior. No asignar aún un equipo real. Si hace falta crear el equipo/partido ficticio, debe autorizarse expresamente; no reutilizar uno dudoso por su nombre.
6. **Validar el permiso.** En Safari/iPad y, si está disponible, otro navegador: lectura del equipo/partido ficticio, Dashboard y ausencia de mutaciones. El verificador técnico intentará una creación válida por SDK cliente dentro de ese equipo ficticio y exigirá `permission-denied`; ocultar botones o probar como administrador en Firebase Console no demuestra una denegación. Revocar cambiando solo `status` a `revoked`, según la autorización de esta prueba, y comprobar limpieza de vista y nueva lectura de servidor denegada con la misma sesión. Si alguna escritura resulta permitida, detener el proceso, conservar evidencia y restaurar las reglas; no limpiar automáticamente el documento ficticio inesperado.
7. **Retirar el permiso ficticio cuando se autorice.** La revocación del paso 6 puede dejar el documento como revoked para revisión. Eliminar después únicamente esa ACL si se autoriza, comprobando UID/equipo otra vez. No borrar equipo, partidos, usuarios ni otras asignaciones. Si ya se había eliminado la ACL como forma de revocar, documentar su ausencia y no repetir un borrado. Registrar el cierre de la prueba.

Las actualizaciones de reglas tienen propagación: Firebase indica hasta un minuto para nuevas consultas/escuchas y hasta diez para escuchas activas. Los cambios de ACL son cambios de datos; la prueba de revocación usa además una **lectura nueva de servidor** y no depende de renovar un token. [Documentación oficial de despliegue](https://firebase.google.com/docs/firestore/security/get-started).

## Reversión limitada a esta fase

- **Incidencia de reglas antes de publicar UI:** restaurar exactamente el ruleset/source vigente respaldado en el paso 1, volver a verificar su huella y esperar propagación. La copia local 22.0 solo sustituye al respaldo si su igualdad se había verificado. No desplegar ciegamente reglas desde develop o desde otra fase.
- **Incidencia de interfaz:** restaurar el paquete exacto de 39 archivos Pages 22.0. Quitar del despliegue únicamente las cinco rutas nuevas de Fase 23 para no dejar la página de supervisión accesible por URL directa; retirar solo enlaces no revoca acceso. No hacer resets o force-push de ramas compartidas.
- **Incidencia de acceso de supervisión:** restaurar las reglas verificadas previas para cerrar el acceso añadido, aunque queden pestañas 23 abiertas; restaurar también la interfaz 22.0 si se revierte toda la fase. Una interfaz antigua por sí sola no elimina autorizaciones de servidor.
- Revertir/revocar exclusivamente las ACL que se hayan creado en esta publicación, según el registro y autorización correspondiente. No borrar asignaciones ajenas ni datos deportivos. Las ACL residuales no conceden acceso bajo las reglas 22.0, pero se revisarán antes de una futura reactivación de supervisión.
- Conservar IndexedDB, eventos, colas e históricos. Fase 23 no cambia esquema ni formato deportivo y no necesita una migración inversa. No borrar datos para revertir código.
- Si al revertir las reglas han cambiado nuevamente por otra intervención, detenerse y comparar antes de reemplazarlas. No deshacer cambios posteriores ajenos a esta fase.

## Asignar tu cuenta desde Firebase Console

Procedimiento manual sencillo, siempre después de la autorización de asignación; **no ejecutado**:

1. Abrir **Firebase Console → proyecto `registro-defensivo` → Authentication → Users**. Identificar tu cuenta por proveedor Google/correo para localizarla y copiar su **UID exacto**. Revisar que es la cuenta correcta; el correo no se guarda como autorización.
2. Obtener el **ID exacto del equipo**, no su nombre visible. En **Firestore Database → Data**, base `(default)`, abrir únicamente `teams/{teamId}` y comprobar su `ownerUid` contra el UID esperado del entrenador. No copiar ni abrir sus partidos para preparar el permiso. Si hay duda de UID/equipo/propietario, no asignar.
3. Ir a `supervision/{UID_SUPERVISOR}/teams/{ID_EQUIPO}` y crear ese documento con estos campos:

   | Campo | Tipo de Console | Valor |
   | --- | --- | --- |
   | schemaVersion | number | 1 |
   | role | string | reader |
   | status | string | active |

   El documento padre `supervision/{UID_SUPERVISOR}` puede no existir; no requiere campos ni permisos de rol. Console puede mostrarlo como padre sin documento. No añadir membresías, no cambiar ownerUid y no crear un perfil admin. Si el permiso ya existe o está revocado, comprobar su estado y el registro administrativo antes de activarlo de nuevo.
4. Registrar privadamente quién autorizó, proyecto, UID, equipo, ownerUid comprobado y fecha. Abrir Supervisión con **esa misma cuenta de aplicación** y actualizar equipos. En la primera validación usar solo el equipo ficticio autorizado; no abrir equipos reales en esta revisión.
5. Para revocar, en ese mismo documento cambiar únicamente `status` a `revoked`; guardar y comprobar limpieza/denegación de nuevas lecturas. Alternativa: eliminar solo el documento de permiso, con autorización. Para reasignar, repetir la comprobación de propietario y volver a active deliberadamente.

La identidad que usa Console necesita permisos administrativos IAM adecuados. Ser supervisor de lectura en la aplicación no otorga IAM y los usuarios normales no pueden gestionar ACL mediante el SDK. No se debe entregar acceso a Firebase Console al supervisor para utilizar esta función.

## Prueba física breve — pendiente, solo ficción

1. En Safari/iPad con conexión, recargar la URL habitual y entrar en «Consultar equipos supervisados». Confirmar cuenta y distintivo Solo lectura.
2. Con el único permiso ficticio activo, seleccionar ese equipo y su partido. Comparar intentos/éxito con una muestra ficticia conocida y abrir un desglose; comprobar vertical/horizontal. No crear ni modificar desde Supervisión.
3. Volver al registro con la cuenta entrenadora de pruebas y confirmar su funcionamiento habitual sobre su equipo ficticio. No cerrar una sesión real con pendientes para cambiar de cuenta; utilizar perfiles/dispositivos de prueba separados.
4. El administrador/verificador realiza la prueba SDK de escritura denegada, exclusivamente en el equipo ficticio. Después revoca su ACL: el Dashboard debe desaparecer cuando se reciba el cambio. Recargar y confirmar que ya no puede consultarse. Una página sin conexión con datos vistos anteriormente no sustituye a comprobar una nueva lectura de servidor.
5. Comunicar resultado y dispositivo. Dejar la ACL revoked hasta que se autorice retirarla; conservar los datos ficticios. No atribuir a esta prueba retención prolongada de Safari ni validación de equipos reales.

## Costes y riesgos nuevos

Una escucha de las asignaciones del **UID conectado**, metadatos de sus equipos y lista de partidos del equipo seleccionado; tiros/lápidas solo del **partido seleccionado**. No se leen eventos de todos sus partidos, no hay polling global ni escucha de todos los equipos. Dashboard y estadísticas se calculan en memoria, sin documentos estadísticos duplicados, servidores o dependencias nuevas.

Coste incremental: una ACL pequeña por UID/equipo, sus escrituras administrativas y lecturas de consulta/dependencias de Rules. Elegir un equipo sí lee su lista de cabeceras, incluidos partidos borrados para filtrarlos; elegir partido lee dos cabeceras, eventos y dos veces lápidas, con hasta tres intentos si cambia el reloj. Actualizar equipos o volver a primer plano puede reabrir la escucha y repetir lecturas. No se promete coste cero: [tarificación oficial](https://firebase.google.com/docs/firestore/pricing).

Riesgos prácticos: asignar un UID/equipo equivocado desde Console (mitigado comprobando proveedor/ownerUid); publicar desde la carpeta/configuración errónea (mitigado por manifiesto y configuración aislada); mezcla de módulos durante actualización; reglas vigentes distintas de la base; y dar por revocado un acceso mirando solo botones o una caché. Los datos ya recibidos/capturados no se pueden retirar retrospectivamente. La consulta deportiva es puntual y requiere volver a seleccionar para actualizar; no muestra un directo continuo.

**Cierre:** revisión y preparación terminadas. Sin bloqueantes de implementación detectados; quedan como condiciones de ejecución verificar el respaldo vigente, autorizar la publicación/prueba ficticia y completar la prueba física. Sin asignaciones reales, cambios de reglas reales, acceso a datos deportivos reales, commit, push o despliegue. Detenido para revisión.
