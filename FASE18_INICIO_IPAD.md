# Fase 18 — inicio independiente y carga de Google acotada

**Actualización posterior:** el mismo enlace sirve ahora la corrección del cursor de [Fase 19](FASE19_CURSOR_EDITOR.md), con los datos y la caducidad conservados. El usuario confirma además cerrar y reabrir Safari recuperando sesión/partido; ese paso físico queda terminado. Los builds y verificaciones 18 siguientes conservan el histórico.

Fecha: 20 de octubre de 2026. **Corrección verificada, publicada en el mismo canal temporal y confirmada físicamente por el usuario.** El usuario comunica que al desplazar el inicio aparece el Registro y que Google queda «Cargando» en un iPad antiguo. Después confirma que ha probado un iPad nuevo y ha podido iniciar sesión; tras la corrección responde «Funciona perfecto!!». No se conoce la versión del antiguo; no se atribuye una causa técnica concreta ni se promete compatibilidad con él.

Respaldo `.local-backups/fase18-inicio-ipad-20261020/`. Se mantiene el alcance de la prueba autorizada `ipad17`: mismo enlace, misma caducidad y Sync OFF; sin publicar en live/Pages o cambiar reglas/dominios. No se usan datos deportivos reales.

## Cambios

El inicio pasa a ocupar el único espacio de página visible. Mientras está activo, Registro y barra de resultados tienen `display: none`; dejan de reservar espacio y no se pueden revelar al desplazar. Se fija el cuerpo al viewport y el contenido del inicio tiene su propio desplazamiento. Se mantienen `visibility` e `inert` como guardas adicionales. Al salir del inicio se recalcula la distribución táctil.

La carga inicial mantiene el límite total de 12 segundos también hasta la primera observación de Auth. Antes el temporizador se retiraba después de preparar el adaptador, aunque la primera observación todavía podía no haber llegado. Ahora un bloqueo produce error y Reintentar, detiene la suscripción e ignora respuestas tardías. Se comprueba con un adaptador ficticio que nunca entrega su primera observación; esto no demuestra que sea la causa del iPad antiguo.

El script clásico `inicio.js` añade una salida previa a los módulos: si la interfaz de cuenta no ha terminado de cargar en 15 segundos, muestra un mensaje y Reintentar; permite elegir sin cuenta y recargar en modo local. Este script evita sintaxis moderna innecesaria para poder mostrar el fallo incluso si los módulos no se evalúan. No convierte el SDK o el resto de la app en compatibles con cualquier Safari antiguo.

El bootstrap de la copia empieza aplicación y cuenta en paralelo. El nuevo candidato acepta exclusivamente el marcador del build anterior de esta misma prueba; no abre/borrar bases ajenas ni reinicia los datos. Se prueba la actualización de un contexto con partido y tiro anteriores, conservando contenido y selección activa.

## Candidato y verificaciones

Build `18-eda58c0c0461ab73`, 39 archivos; `.test-artifacts/firebase/fase18/candidate/`. Mantiene CSP y bloqueo de Sync en configuración/transporte. Las herramientas de publicación permiten solo actualizar el canal existente sin cambiar caducidad, dominios, reglas o live.

- Seis grupos `startup18.test.mjs`: Chromium/WebKit × carga normal, primera observación bloqueada y módulo de cuenta fallido. En cuatro tamaños (820×1180, 1180×820, 390×844, 844×390), Registro/barra sin rectángulos durante inicio, documento sin desplazamiento de fondo, sin desbordamiento horizontal, error/reintento y salida local con registro correctos. Cero solicitudes externas/escrituras reales.
- Ocho grupos del candidato: uso local, origen incorrecto, datos ajenos previos y actualización desde la copia 17, en ambos motores. Panel, doble toque, recarga, CSV y estadísticas correctos; partido y eventos previos idénticos.
- Ocho grupos de arranque Fase 12 y cuenta correctos; prueba unitaria nueva para observador bloqueado/respuesta tardía. Diez archivos Node correctos.
- Auth Emulator correcto: inicio, popup, recarga, cierre, cuentas, pestañas y datos locales; sin errores CSP o solicitudes Firestore.

Los resultados físicos del usuario corresponden a la copia 17: Google correcto en iPad nuevo; «Cargando» en antiguo. La corrección de desplazamiento necesita repetirse en el iPad después de actualizar. No se considera resuelta definitivamente la compatibilidad del antiguo.

## Actualización de la vista previa

El reporte de fallos se trata como petición de corregir la prueba ya autorizada, limitada a su mismo enlace y caducidad. `publish18-ipad.mjs` comprueba la versión anterior, referencias de reglas/live y dominios; impide crear/renovar canales o cambiar Auth. Revisa los hashes remotos antes de liberar solo `ipad17`.

Actualizado el 20 de octubre a las 20:38:51 UTC: versión `25de4d164a82c9ed`, build `18-eda58c0c0461ab73`. URL https://registro-defensivo--ipad17-ot4rlj0m.web.app. Caducidad exacta conservada: **21 de octubre, 22:22:43 de Madrid**. Dominios, reglas, Hosting live y GitHub Pages intactos; Sync OFF; sin acceso a datos deportivos reales ni commit/push.

`verify17-live.mjs --fase18` confirma 38 hashes HTTPS y cabeceras, ausencia de archivos privados, dominios iguales, SDK/Google hasta OAuth sin credenciales y funcionamiento local en Chromium. En el inicio publicado, Registro carece de rectángulos de layout y el documento no se desplaza; tras elegir sin cuenta, registro, doble toque, recarga y estadísticas correctos. Cero errores/CSP/Firestore. Captura vertical revisada. WebKit HTTPS conserva la limitación TLS del entorno de Fase 17, sin ignorar certificados; pruebas locales WebKit correctas.

Regresiones adicionales: batería local 2/3/5/6/10 en siete tamaños y seis grupos CSP en raíz/subruta correctos; paquete de aplicación habitual solo preparado, sin publicarlo. Recibos en `.test-artifacts/firebase/fase18/`: `inicio.json`, `verificacion.json`, `preflight.json`, `uploaded-review.json`, `deployment.json`, `https-verification.json`.

Fase detenida para revisar en el iPad: recargar el mismo enlace y volver al inicio desde cierre de sesión si se entra directamente al Registro. No borrar datos del sitio. El acceso manual de Google en iPad nuevo queda confirmado para la copia anterior; no se dan por probados aún los restantes pasos físicos, persistencia prolongada, iPad antiguo o sincronización.

**Resultado físico recibido:** el usuario confirma «Funciona perfecto!!» después de pedirle comprobar el inicio actualizado en el iPad nuevo. Corrección de inicio/Registro aceptada y repetición física cerrada. No se considera una confirmación de los pasos aún no descritos por el usuario (registro, recarga, CSV, offline, persistencia prolongada o sincronización), ni del iPad antiguo. No se inicia otra fase ni se renueva el enlace.

**Registro y recarga confirmados después:** el usuario indica «He recargado y se guardan», tras pedirle crear un partido ficticio y registrar tiros. Se confirma que el registro local conserva los tiros al recargar en el iPad nuevo. No se acredita un recuento exacto, CSV, estadísticas, uso offline, persistencia prolongada ni sincronización. Sin cambios de código, datos, canal o caducidad por esta anotación.

**CSV y Deshacer confirmados posteriormente:** «Funciona perfecto» en respuesta a exportar/guardar CSV desde Safari, deshacer un tiro y recargar comprobando uno menos. Ambos pasos quedan correctos según la prueba manual del usuario en el iPad nuevo. No se acredita apertura/revisión del CSV en Excel. Siguen pendientes offline, estadísticas y demás pasos no confirmados; no se renueva el enlace ni se activa Sync.

**Uso sin conexión confirmado después:** «Está guardado», en respuesta a desconectar Wi-Fi/datos con la página abierta, registrar un tiro ficticio, reconectar y recargar. El tiro se conserva en el iPad nuevo. No se prueba arranque/recarga completamente sin red, retención prolongada ni sincronización. Quedan estadísticas y demás pasos no confirmados. Esta anotación no cambia código, datos, permisos, despliegue o caducidad.

**Estadísticas y orientaciones confirmadas después:** el usuario responde «Funciona todo perfecto!!» al paso de revisar intentos/aciertos/puntos y girar entre vertical/horizontal. Ambos quedan favorables según su prueba en el iPad nuevo. Pide anotar el bloqueo del deslizamiento sin contenido como mejora no fundamental: [MOP-001](MEJORAS_OPCIONALES.md), prioridad baja, sin implementar. No cambia código, despliegue o caducidad y no bloquea el cierre funcional. Sincronización, persistencia prolongada y compatibilidad del antiguo siguen sin confirmación.
