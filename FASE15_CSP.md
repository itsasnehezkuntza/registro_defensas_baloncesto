# Fase 15 — B7: política de seguridad de contenido

Fecha: 20 de octubre de 2026. Rama local `develop`. **B7 corregido; Fase 15 completada localmente y detenida para revisión.** Autorizada por «Vamos allá» tras proponer cerrar la CSP. Respaldo previo: `.local-backups/fase15-csp-20261020/`. La versión publicada documentada sigue siendo 8C.0. Sin commit, push ni despliegue.

## Resultado

`index.html` incorpora una CSP mediante meta inmediatamente después de la codificación y antes de cargar recursos. El script que prepara la pantalla de inicio pasa a `js/inicio.js`, ejecutado de forma síncrona antes de los módulos; conserva el bloqueo previo a recuperar Google. El paquete de Pages incluye el archivo nuevo y suma 38 archivos.

La política permite los recursos propios y una lista explícita de servicios de Google/Firebase. No permite scripts incrustados, manejadores de eventos escritos como atributos, `eval`, scripts `data:`/`blob:` ni hosts arbitrarios. No cambia el registro en dos toques, las estadísticas, el CSV ni la apariencia.

| Directiva | Permisos y motivo |
|---|---|
| `default-src 'none'` | Bloqueo por defecto; los tipos utilizados tienen permiso explícito. |
| `script-src` | Archivos propios, SDK exacto `www.gstatic.com/firebasejs/12.11.0/` y auxiliares de acceso `apis.google.com`. Sin `unsafe-inline` ni `unsafe-eval`. |
| `script-src-attr 'none'` | Impide ejecutar código en atributos como `onclick`. |
| `style-src` | CSS propio y estilos incrustados: las barras, columnas, ajuste táctil y editor generan estilos dinámicos. `unsafe-inline` se admite solo para estilos. |
| `font-src 'self'` | Fuentes incluidas en la aplicación. |
| `img-src` | Recursos propios, imágenes `data:`, fotos en `*.googleusercontent.com` y el sondeo de conectividad del SDK en `www.google.com/images/cleardot.gif`. La prueba de Auth detectó la necesidad de imágenes `data:` en el flujo auxiliar; no se permite ese esquema para scripts. |
| `connect-src` | Origen propio, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `www.googleapis.com` y `firestore.googleapis.com`, siempre HTTPS para servicios externos. |
| `frame-src` | Solo el auxiliar de autenticación `registro-defensivo.firebaseapp.com`. La ventana emergente de Google se mantiene. |
| `object-src`, `base-uri`, `worker-src` | `none`: sin complementos, cambios de URL base ni trabajadores. |
| `form-action 'self'` | Impide enviar formularios a otros orígenes; los diálogos actuales siguen funcionando. |

La lista permitida autoriza recursos, no los carga por sí sola. Con «sin cuenta» recordado siguen sin salir solicitudes externas.

## Límite de la entrega por meta

La meta se usa en el sitio estático de Pages y se coloca antes de los recursos a los que protege. No añade `frame-ancestors`, `sandbox` ni informes por cabecera: esas capacidades tienen restricciones en la entrega por meta. Por tanto, esta fase no acredita protección contra que otra página incruste la aplicación. La lista de orígenes tampoco sustituye el escape de textos ni las reglas de Firestore. Véase la [especificación de CSP, entrega por meta](https://www.w3.org/TR/CSP3/#meta-element).

La política corresponde al SDK 12.11.0 y al `authDomain` actual. Cambiar versión, proveedor, dominio o alojamiento requiere revisar la lista y repetir estas pruebas. Se contrastaron los auxiliares del SDK local y los [dominios documentados por Firebase para autenticación](https://firebase.google.com/docs/auth/web/chrome-extension).

## Corrección detectada en la regresión

La batería de arranque reveló una carrera de la configuración incorporada en Fase 14: si el ámbito cambiaba mientras IndexedDB entregaba un callback, `assertContext()` podía lanzar una excepción global, además de abortar la transacción. En los tres callbacks afectados de `configuracion-guardada.js` ahora se aborta expresamente con `SCOPE_CHANGED`, conservando el rechazo gestionado por la aplicación.

Se añade a `startup12.test.mjs` una prueba que fuerza el cambio justo antes del callback, exige el rechazo esperado y comprueba que no haya excepción global ni alteración de los originales. No se reinicia ni modifica el esquema de la base.

## Entorno de pruebas

La CSP de los archivos y del paquete carece de permisos HTTP o loopback. Solo el servidor de pruebas, cuando lo lanza `emuladores.mjs` con `DEFENSAS_TEST_EMULATOR_CSP=1`, añade los dos endpoints locales de Auth/Firestore a conexiones y el de Auth a frames. Las restantes restricciones se conservan; la interfaz y Auth exigen cero violaciones CSP.

La excepción se sirve desde el servidor loopback. Interceptar y reemplazar la navegación con Playwright alteraba la clasificación de red de Chromium y bloqueaba el iframe local por su control de acceso a red local; se corrigió la preparación de la prueba sin desactivar esa protección del navegador. El servidor y las excepciones no entran en el paquete publicado.

## Verificación

- `csp15.test.mjs`: seis grupos correctos en Chromium y WebKit. Registro, recarga y estadísticas en raíz/subruta con política de producción idéntica al archivo, sin solicitudes externas ni violaciones durante uso normal. Intentos explícitos de script incrustado, atributo de evento, `eval`, script externo, conexión, imagen, iframe, cambio de base y envío de formulario externos bloqueados. `object-src 'none'` se comprueba en ambos; el bloqueo observable se ejercita en Chromium, mientras WebKit no inicia la carga de ese `object`. Recibo `csp15.json`.
- `csp15-auth-smoke.mjs`: política de producción, SDK oficial sin modificar y perfil efímero. Ventana llegada a `accounts.google.com`, cancelación y retorno correctos; cero violaciones, errores y solicitudes Firestore. Sin introducir credenciales, crear usuarios o completar OAuth. Solo acceso público a Auth/Google; recibo `csp15-auth-smoke.json`.
- Auth Emulator: acceso, recarga, cierre, cambio de cuenta, varias pestañas, copia local conservada y popup bloqueado correctos; cero violaciones CSP y solicitudes Firestore. Recibo `auth.json`.
- `startup12.test.mjs`: ocho grupos correctos, incluida la carrera de ámbito forzada, cero solicitudes externas.
- `node --test tests/*.test.mjs`: diez archivos correctos. `local-browser.mjs`: regresiones 2/3/5/6/10, siete tamaños, CSV, errores Firebase y subruta correctos.
- `emuladores.mjs sync`: 40 grupos correctos; incluye edición del panel entre dispositivos, cola offline, vaciado, Auth, cierre y cambios de cuenta. La interfaz exige cero violaciones CSP y errores. Recibo `sync.json`, `ok: true`, `realWrites: 0`.
- Sintaxis correcta y paquete estático preparado con 38 archivos, incluido `js/inicio.js`; sin permisos de emulador en el HTML del paquete.

## Continuación

No se retira el dominio temporal de Authentication ni se modifican las decisiones sobre SDK inicial u originales importados. Quedan para revisión posterior junto con Safari/iPad físico y consolidación/publicación autorizada. La condición de publicación coordinada de código/reglas de Fase 14 sigue vigente.
