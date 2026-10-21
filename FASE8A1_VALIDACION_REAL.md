# Fase 8A.1 — Conexión y validación de Firebase real

Actualización al iniciar 8B: el propietario confirma sesión persistente, cierre, dominio Pages autorizado, Firestore creado y reglas publicadas. Esta confirmación actualiza los pendientes administrativos anteriores, pero no sustituye la prueba del comportamiento de reglas remotas. La sincronización está implementada en [FASE8B_SINCRONIZACION.md](FASE8B_SINCRONIZACION.md), con sus banderas desactivadas y sin escrituras reales.

Estado al 15 de octubre de 2026: **configuración real incorporada y acceso, recarga y cierre de sesión confirmados por el usuario** para `registro-defensivo`. Se distinguen esta prueba manual real de las pruebas automatizadas de conexión y de los emuladores. El agente no ha introducido credenciales ni inspeccionado tokens de la sesión del usuario. No se han leído/desplegado reglas remotas.

La Fase 8A está aprobada provisionalmente. Esta fase comprueba exclusivamente cuentas y seguridad; Firestore Sync sigue desactivado. Los cambios locales de interfaz presentes al empezar se conservan.

## 1. Configuración pública incorporada

El usuario proporcionó los seis campos públicos de su aplicación web. `js/firebase-config.js` conserva su exportación `firebaseSettings` y ambos `Object.freeze`; ahora tiene `enabled: true`, `authEmulator: false`, proyecto `registro-defensivo`, appId `1:760744900094:web:56f037728d252c22fcfcaf` y authDomain `registro-defensivo.firebaseapp.com`. También se conservan `storageBucket` y `messagingSenderId`; incluir sus identificadores no inicializa Storage ni Messaging. No se añade Analytics ni `measurementId`. Solo se importan App y Authentication.

La consulta pública ha aceptado API key y appId (HTTP 200), devolviendo el número de proyecto `760744900094`, coincidente con la configuración recibida. El archivo contiene configuración web pública, sin credenciales administrativas.

Para localizar esos valores o revisarlos en consola:

En [Firebase Console](https://console.firebase.google.com/): seleccionar el proyecto correcto → Configuración del proyecto → General → Tus aplicaciones → aplicación web → Configuración del SDK → Configuración.

Si todavía no hay aplicación web, registrar una en ese proyecto. No es necesario activar Firebase Hosting ni Analytics para estas pruebas. No se crea otro proyecto ni se cambia de aplicación por deducción a partir del nombre del repositorio.

Copiar del objeto público `firebaseConfig` estos cuatro valores a `js/firebase-config.js`:

```javascript
export const firebaseSettings = Object.freeze({
  enabled: true,
  config: Object.freeze({
    apiKey: "VALOR_PUBLICO_DE_FIREBASE",
    authDomain: "VALOR_DE_LA_APP_WEB.firebaseapp.com",
    projectId: "ID_REAL_DEL_PROYECTO",
    appId: "ID_PUBLICO_DE_LA_APP_WEB"
  }),
  authEmulator: false
});
```

Los textos anteriores son ejemplos, no valores utilizables. Conservar `authDomain` exactamente como lo suministre Firebase; no sustituirlo por el host de Pages. El objeto público se puede facilitar en el chat para incorporarlo. No incluir contraseñas, cuentas de servicio, `private_key`, secretos del cliente OAuth ni credenciales administrativas. La API key web identifica el proyecto; la autorización de los datos corresponde a las reglas.

El ejemplo anterior sirve como referencia de estructura; el archivo real ya contiene los valores proporcionados por el usuario y está activado. No se sustituyen por valores ficticios para declarar superada una prueba real.

## 2. Verificar Google y dominios

En Authentication → Método de inicio de sesión/Proveedores → Google, comprobar que está **habilitado**. Verificar el correo de soporte y guardar los cambios necesarios desde consola. No habilitar acceso anónimo ni cambiar otros proveedores para superar la prueba. Anotar proyecto, proveedor y fecha; no copiar el secreto OAuth.

En Authentication → Configuración → Dominios autorizados, revisar:

| Host | Resultado de la consulta real |
| --- | --- |
| `localhost` | **Autorizado**; utilizado en las pruebas reales de esta fase. |
| `127.0.0.1` | **No autorizado** actualmente. No utilizarlo para OAuth hasta añadirlo expresamente si se necesita. |
| `itsasnehezkuntza.github.io` | **No autorizado** actualmente; añadirlo antes de una futura publicación autorizada de la autenticación. |
| `registro-defensivo.firebaseapp.com` | Autorizado. |
| `registro-defensivo.web.app` | Autorizado. |

Introducir hosts, sin protocolo, puerto ni `/registro_defensas_baloncesto/`. No añadir comodines. Los proyectos creados después del 28 de abril de 2025 no incluyen necesariamente localhost automáticamente. Si la API key tiene restricciones por referente, revisar que admitan el origen de prueba previsto sin abrirla indiscriminadamente.

La página aislada permite consultar la configuración pública de Identity Toolkit con la API key y el appId. La consulta ha funcionado en Node y en el navegador real. La respuesta pública no incluye una comprobación concluyente de proveedores. El flujo OAuth sí ha llegado a Google, por lo que su inicio está operativo; la consola no se ha inspeccionado y no se certifica todavía un acceso con cuenta completado.

Fuentes oficiales: [Google en web](https://firebase.google.com/docs/auth/web/google-signin), [dominios y localhost](https://firebase.google.com/docs/auth/faq-and-troubleshooting), [consulta pública del proyecto](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/TopLevel/getProjects).

## 3. Prueba real aislada, sin base deportiva

```text
npm run firebase:validar-real
```

Abrir `http://localhost:4199/tools/firebase/validacion-real.html` en el navegador. Usar **localhost**, que ya está autorizado, y no `127.0.0.1`. El servidor escucha solo en loopback; no publica una web ni expone la carpeta a la red. En este equipo Node está instalado en `C:\Program Files\nodejs`; si no aparece en PATH se puede ejecutar directamente `node.exe tools/firebase/servir-real.mjs` desde esa instalación.

La página carga los mismos módulos de cuenta y SDK oficial 12.11.0. No carga `app.js` ni persistencia deportiva, no importa Firestore ni crea equipos/partidos. Puede crear/restaurar exclusivamente el almacenamiento de sesión propio de Firebase Authentication. Rechaza el proyecto ficticio/emulador y la configuración incompleta. No se cambian las funciones ni el diseño de la aplicación.

La primera entrada con Google puede crear el usuario en **Firebase Authentication** del proyecto real: es parte del acceso solicitado. El propietario de la cuenta introduce sus credenciales y resuelve MFA en Google, nunca en el chat, en la terminal ni en archivos.

| Paso | Acción | Evidencia requerida |
| --- | --- | --- |
| 1 | Comprobar proyecto/origen en la página y consultar dominios. | Proyecto esperado y host autorizado, o comprobación equivalente en consola. |
| 2 | Pulsar Iniciar sesión con Google y completar el popup. | Cuenta visible, sin error de dominio/proveedor; todavía no basta un dato de sesión antiguo. |
| 3 | Pulsar Verificar sesión con Firebase real. | Renovación forzada con servidor, proveedor `google.com`, audiencia/emisor del proyecto correcto y emulador ausente. Solo se muestra el resultado; no tokens. |
| 4 | Pulsar Recargar para probar restauración y volver a verificar. | Identidad restaurada y nueva renovación de servidor correctas. No se borra almacenamiento para probar. |
| 5 | Pulsar Cerrar sesión. | Identidad desaparece; recargar y comprobar que continúa sin cuenta. `signOut` cierra la sesión local, no revoca todos los dispositivos. |
| 6 | Cerrar/cancelar popup y probar una ventana bloqueada si es posible. | Error legible y reintento disponible; ningún acceso a datos deportivos. |
| 7 | Abrir aplicación normal y comprobar sus controles sin registrar/modificar partidos reales. | Error de cuenta independiente del estado local. Para registrar tiros de prueba usar únicamente un perfil/origen de pruebas con datos ficticios. |

No marcar una prueba como correcta solo porque reaparezca el correo: puede proceder de persistencia local. La renovación forzada distingue esta comprobación del uso de una sesión en caché. No hay exportación de tokens, HAR ni estado de autenticación a archivos de proyecto.

## 4. Firestore: seguridad y despliegue de reglas

Las 54 comprobaciones de `tools/firebase/rules.test.mjs` se han repetido correctamente en Firestore Emulator para esta fase. Cubren propietario, externo, invitado, sin sesión/anónimo, acceso entre equipos, escalada, validación de escrituras, inmutabilidad, Deshacer y borrados/altas tardías. Son pruebas del archivo local `firestore.rules`; **no certifican las reglas que estén actualmente desplegadas**.

No se necesita desplegar Firestore ni sus reglas para probar Google Authentication. Antes de cualquier despliegue, verificar proyecto/base de destino y leer/exportar las reglas remotas actuales para comparación y recuperación. Si el proyecto comparte Firestore con otra aplicación, no reemplazar reglas sin revisar ese alcance. Crear Firestore, elegir región y desplegar reglas son pasos distintos de activar el proveedor Google; no se ejecutan automáticamente en esta fase.

Procedimiento preparado, sin ejecutar:

1. Seleccionar explícitamente proyecto real y base `(default)` —la actual configuración local apunta a la base por defecto—; verificar que son los de esta aplicación.
2. Guardar una copia de las reglas remotas vigentes y anotar fecha/proyecto/hash del archivo revisado.
3. Ejecutar `npm run test:reglas`. No se cambian por reglas públicas para facilitar las pruebas.
4. Revisar `firestore.rules` y `firebase.json` contra la copia remota. Solicitar el despliegue concreto cuando el contenido/destino estén confirmados.
5. Desde una sesión CLI autorizada en el equipo, desplegar **solo reglas** indicando el proyecto explícitamente:

```text
node node_modules/firebase-tools/lib/bin/firebase.js deploy --only firestore:rules --project ID_REAL_VERIFICADO --config firebase.json
```

No ejecutar `firebase deploy` sin filtros ni desplegar hosting, índices o funciones como parte de esta comprobación. No guardar tokens de CLI ni cuentas de servicio en el repositorio. La autenticación de la CLI se gestiona en el equipo del usuario.

Después de un despliegue autorizado, verificar en consola versión/contenido/fecha. Comprobar denegación sin sesión y de una cuenta ajena contra datos ficticios destinados a esa prueba, sin alterar partidos existentes. Un 403 aislado puede proceder también de App Check/API/restricciones; no sustituye la matriz de permisos ni la comprobación de la versión de reglas publicada. Las pruebas de creación y borrado se mantienen en emulador hasta disponer de un entorno real de prueba delimitado.

La autorización actual solicita explicar el despliegue seguro; **no se ha ejecutado el despliegue de reglas**. Referencia: [gestión y despliegue de reglas](https://firebase.google.com/docs/rules/manage-deploy).

## 5. Protocolo Safari/iPad

Preparación: anotar modelo, versión de iPadOS/Safari, modo normal/privado y URL. La URL necesita un origen accesible desde el iPad y adecuado para OAuth, preferiblemente HTTPS, autorizado en Firebase. `localhost` del iPad no es el ordenador. El servidor loopback anterior no es accesible desde el iPad. No se crea un túnel ni se publica la aplicación sin autorización; hace falta acordar una URL de prueba HTTPS antes de ejecutar esta parte.

| Caso | Resultado esperado | Estado actual |
| --- | --- | --- |
| Acceso normal con popup | Se abre desde pulsación directa; cuenta correcta y verificación real del servidor. | Pendiente físico. |
| Cancelar el popup | No se declara acceso; error legible/reintento. | Pendiente físico. |
| Popup bloqueado | Aviso y posibilidad de seguir local; no se inicia redirect automático. | Pendiente físico. |
| Recarga | Identidad restaurada y verificación de servidor correcta. | Pendiente físico. |
| Cerrar Safari/reabrir | Comportamiento de persistencia observado y anotado, sin asumir conservación en privado. | Pendiente físico. |
| Cerrar sesión/recargar | No reaparece la cuenta. | Pendiente físico. |
| Red interrumpida al acceder/verificar | Error de cuenta; la aplicación conserva la vía local. | Pendiente físico. |
| Modo privado | Anotar si la sesión es persistente, de sesión o de memoria; no prometer persistencia tras cerrar. | Pendiente físico. |
| Rotación y teclado | Botones visibles/táctiles, correo sin desbordar; popup usable. | Pendiente físico. |

No desactivar globalmente las protecciones de privacidad de Safari para declarar éxito. Si el popup falla, registrar mensaje/código y contexto antes de cambiar la arquitectura. Se mantiene el método de 8A: popup; ninguna redirección depende de almacenamiento de terceros bloqueado. Referencia: [requisitos oficiales de redirect](https://firebase.google.com/docs/auth/web/redirect-best-practices).

## 6. Registro de pruebas y siguiente paso

| Comprobación | Tipo | Resultado en esta fase |
| --- | --- | --- |
| Reglas locales, 54 casos | Firestore Emulator | Correcto; informe `.test-artifacts/firebase/reglas-8a1.txt`. |
| Controlador de cuenta | Simulación de adaptador | Correcto: doble toque, errores, timeout, cambios de cuenta. No es OAuth real. |
| Página de validación | Chromium, guardas de configuración | Correcto: bloquea configuración ausente y emulador; no importa SDK/Firestore ni abre IndexedDB. |
| Login/restauración/cierre de 8A | Auth Emulator, fase anterior | Correctos en 8A; no equivalen a Google real. |
| Configuración pública real | Servicio real, sin credenciales | HTTP 200; API key y appId aceptados, número de proyecto correcto. |
| Proveedor/flujo Google | Popup real con SDK oficial y prueba manual del usuario | Inicio del flujo automatizado correcto; el usuario confirma que ha podido entrar. Consola administrativa no inspeccionada. |
| Dominios autorizados | Servicio real, Node y navegador | localhost y los dos hosts Firebase presentes; 127.0.0.1 y Pages ausentes. |
| Cancelación de OAuth | Popup real | Correcta: se cierra sin cuenta, aviso y reintento disponibles. |
| Acceso, recarga y cierre reales | Prueba manual del usuario con Firebase real | Confirmados por el usuario: «He podido entrar, recargar y cerrar sesión». Sin observación automática de su sesión. |
| Renovación forzada y recarga posterior al cierre | Prueba adicional de la página aislada | No confirmadas expresamente; no se deducen del mensaje anterior. |
| SDK real + funcionamiento sin cuenta | Aplicación actual, datos ficticios aislados | Correctos registro, doble toque, recarga, Deshacer y CSV; cero solicitudes a Firestore. |
| SDK bloqueado o detenido | Fallos inyectados con configuración real | Guardado local, recarga, Deshacer y CSV correctos; timeout independiente del guardado. |
| Registro sin Internet | SDK real ya cargado, contexto offline | Correcto; evento confirmado en IndexedDB. |
| Reglas remotas | Proyecto real | No leídas ni desplegadas. |
| Safari/iPad | Dispositivo físico | Protocolo preparado; no ejecutado. |

Informes actuales: `.test-artifacts/firebase/proyecto-real.json`, `real-smoke.json` y `real-local.json`. `real-smoke` usa el SDK desde Google sin interceptarlo y no proporciona credenciales. La prueba local usa perfiles efímeros independientes y partidos ficticios: no abre el perfil del usuario. Se verificó que los archivos deportivos y el esquema de persistencia conservan sus hashes.

Reproducir consultas y comprobaciones sin introducir credenciales:

```text
npm run firebase:comprobar-proyecto
npm run test:auth-real-inicio
npm run test:auth-real-local
```

Para completar OAuth: iniciar el servidor de validación, abrir la URL localhost anterior en el navegador habitual y completar manualmente los pasos 2–5 de la tabla. El usuario introduce sus credenciales únicamente en Google. Verificar sesión con Firebase real, recargar/verificar otra vez, cerrar sesión y recargar para comprobar que no reaparece. En la aplicación actual los controles de cuenta se encuentran en el menú «Más opciones»; no se modifica ese diseño en esta fase.

El usuario confirma el acceso, la recarga y el cierre reales. No especifica dispositivo/navegador, por lo que no se da por realizada la prueba física Safari/iPad. Tampoco se atribuye una comprobación explícita de renovación forzada del token o de recarga posterior al cierre. Antes de 8B quedan la revisión de esos puntos, Safari y la implementación/pruebas de la cola, migración aditiva y aislamiento de datos diseñados en 8A. Pages necesita añadir su host antes de la publicación posterior, que no está autorizada aquí.

Conexión implementada y validación básica real confirmada por el usuario; se detiene para revisión sin iniciar 8B. No se han sincronizado partidos, ejecutado migraciones, modificado registros defensivos existentes, habilitado subidas automáticas, publicado reglas, hecho commit/push ni desplegado la aplicación.
