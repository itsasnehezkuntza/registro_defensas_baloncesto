# Fase 8A — Google y arquitectura de sincronización

Continuidad: [Fase 8B](FASE8B_SINCRONIZACION.md) implementa el diseño con cola y almacenes nuevos, únicamente probados en emulador. Las banderas reales permanecen desactivadas. Los apartados de esta guía describen el diseño y la entrega histórica de 8A; las decisiones finales de 8B se documentan en su guía.

Estado: infraestructura de autenticación implementada y verificada localmente; sincronización de partidos **desactivada**. Cierre: 15 de octubre de 2026. La continuación se realiza en `develop`, sobre el estado recibido `7c439c1`; ese estado ya incluía los módulos experimentales de cuenta de la primera parte de esta tarea. No se publica esta continuación ni se inicia 8B.

Seguimiento: la conexión al proyecto real se trata en [FASE8A1_VALIDACION_REAL.md](FASE8A1_VALIDACION_REAL.md). Configuración pública de `registro-defensivo` incorporada y Authentication habilitado localmente; respuesta real del servicio y llegada al formulario Google verificadas. El usuario confirma que ha podido entrar, recargar y cerrar sesión con el proyecto real. Esta prueba manual se distingue de las automatizadas y de los emuladores. Safari/iPad no se da por probado sin identificar el dispositivo. Firestore Sync sigue desactivado.

## 1. Auditoría del código real

Se leyeron `AGENTS.md`, `ESPECIFICACION.md`, README, HTML/CSS, `app.js` y los módulos de configuración, persistencia, identidad, registro, estadísticas, exportación, interfaz, vistas y Dashboard. Se conservó el trabajo existente, incluido el CSV vigente: 33 combinaciones, tres tipos de bloqueo y ocho defensas. No se recuperó una versión anterior.

| Punto | Comportamiento real | Consecuencia para 8B |
| --- | --- | --- |
| Base | `registro_defensivo_baloncesto`, versión 1; `games`, `events`, `settings` | Se mantiene íntegra en 8A. No hay outbox ni metadatos de cuenta todavía. |
| Partido | `id`, jornada/rival obligatorios, `createdAt`; creación y selección atómicas | Identidad de nube independiente de los textos; no deduplicar por rival/jornada. |
| IDs nuevos | `crypto.randomUUID()` o 16 bytes de `crypto.getRandomValues()` en `app.js` | Entropía criptográfica suficiente para registros nuevos; no demuestra el origen de IDs históricos. Nunca usar `Math.random`, fecha o `seq` como ID global. |
| Eventos | `seq` autoincremental; `byUuid` único sobre `id`; índices `byGameId` y `byGameSeq` | `seq` solo ordena esa base, no identifica un evento entre dispositivos. `byUuid` no sirve como clave de una caché con varias cuentas/orígenes. |
| Escrituras | `transact` resuelve en `tx.oncomplete`; comprueba existencia del partido dentro de la transacción | Conservar este contrato; outbox y cambio visible deben confirmarse juntos. |
| Reintento local | Mismo ID y contenido devuelve el `seq`; ID con otro contenido genera `EVENT_CONFLICT` | Repetir este contrato en nube; no hacer `addDoc` en cada intento. |
| Sesión deportiva | `settings.activeGame` compartido por pestañas; acción seleccionada/pendingShot solo en memoria | La selección deportiva no es la sesión de Google. El intento abortado no sobrevive al cierre; un evento confirmado sí. |
| Deshacer | Consulta inversa de `byGameSeq`, borra físicamente el último evento del activo | Una futura transacción debe guardar además una lápida y la operación pendiente. El objetivo será el ID capturado, nunca una consulta remota «borra el último». |
| Eliminar | Transacción sobre partido, sus eventos y selección activa; confirmación con ID capturado | Guardar lápida duradera y vínculo remoto antes de retirar datos visibles. No basta con borrar localmente. |
| Varias pestañas | Cola por pestaña, bloqueo inmediato, guardas IndexedDB; BroadcastChannel/storage avisa tras commit; relee al recuperar foco | Los avisos no son bloqueos de red. El futuro trabajador necesita un arrendamiento duradero y operaciones idempotentes. |
| Estadísticas | Derivadas exclusivamente de los eventos del activo; histórico por IDs o tabla fija v1 | Materializar primero el conjunto vivo del ámbito correcto; nunca mezclar snapshots de cuentas/equipos. |
| CSV | Snapshot atómico del partido capturado al pulsar, orden `seq`, BOM, `;`, CRLF y protección de fórmulas | Mantener IDs y nombres originales en el payload. Los IDs técnicos de nube no sustituyen los deportivos. |

No se modifican `app.js`, `categorias.csv`, persistencia, identidad deportiva, registro, estadísticas, Dashboard, exportación ni los estilos existentes. No hay migración de IndexedDB en esta fase.

## 2. Arquitectura implementada

La aplicación deportiva y la cuenta arrancan con scripts ES separados. `app.js` conserva su arranque local. `cuenta-ui.js` conecta controles de cabecera con el controlador `cuenta.js`; `firebase-auth.js` es el adaptador web y `firebase-config.js` contiene exclusivamente configuración pública. Ninguno de estos módulos de cuenta importa persistencia deportiva ni Firestore.

El SDK oficial modular se carga mediante imports dinámicos de `www.gstatic.com/firebasejs/12.11.0/`. Versión exacta **12.11.0**, también fijada para pruebas en npm. Se verificó su disponibilidad; no se presenta como la versión más reciente. `firebase`, `@firebase/rules-unit-testing` 5.0.0 y `firebase-tools` 15.11.0 son dependencias de desarrollo para el emulador. La web no necesita npm, compilación ni framework.

Con `enabled: false`, valor entregado, no se descarga Firebase. Con configuración válida, la autenticación carga en paralelo al uso local; tiene timeout de 12 segundos, reintento, errores legibles y opción de continuar sin cuenta. Un fallo de cuenta no toca `saveStatus`, que sigue dependiendo de IndexedDB. La identidad se inserta con `textContent`, sin exponer tokens ni credenciales.

El adaptador intenta persistencia propia del origen: IndexedDB, localStorage, sesión y finalmente memoria cuando el navegador no permite las anteriores. `authStateReady` y `onAuthStateChanged` restauran/observan identidad y cambios entre pestañas. Si solo existe memoria, la sesión puede perderse al recargar; no se promete persistencia en modo privado ni ante borrado/expulsión del almacenamiento. Cerrar sesión se confirma por el observador; un error no finge haber desconectado.

El controlador y la interfaz solo requieren `ready`, `observe`, `login` y `logout` del adaptador. Capacitor podrá sustituir el adaptador por una integración nativa de Google/Firebase. No se implementa ni se promete el popup web dentro de una WebView.

## 3. Google, Safari y GitHub Pages

Método elegido: **`signInWithPopup`**, llamado directamente desde el click. SDK, proveedor y persistencia están preparados antes de habilitar el botón; no hay import, `await` ni cambio de persistencia entre la pulsación y la apertura. Se evita perder la activación de usuario en Safari.

Firebase documenta que `signInWithRedirect` usa un iframe entre orígenes y requiere medidas específicas en navegadores que bloquean almacenamiento de terceros, incluidos Safari 16.1+. GitHub Pages no ofrece por sí solo el proxy de `/__/auth` necesario para servir ese mecanismo desde el mismo origen. Cambiar `authDomain` al dominio de Pages sin servir los helpers no lo soluciona. **No se implementa redirect ni fallback automático a redirect.**

El popup también puede ser bloqueado o cerrado y debe probarse en hardware real. `auth/popup-blocked` explica cómo permitir ventanas para el sitio y volver a pulsar; cerrar el popup deja una vía de reintento. También se distinguen errores de red, dominio no autorizado, proveedor deshabilitado y almacenamiento. No se vinculan proveedores automáticamente.

Pendiente en iPad físico: Safari normal/privado, popup permitido/bloqueado, cancelación, selección de otra cuenta, sesión tras cerrar Safari y recargar, red interrumpida, cuenta cambiada en otra pestaña y registro local mientras Google falla. El emulador verifica nuestro flujo con el SDK, pero no el consentimiento OAuth real, ITP ni la política de ventanas del dispositivo.

Fuentes oficiales: [Google en web](https://firebase.google.com/docs/auth/web/google-signin), [restricciones y alternativas de redirect](https://firebase.google.com/docs/auth/web/redirect-best-practices), [persistencia de sesión](https://firebase.google.com/docs/auth/web/auth-state-persistence), [notas del SDK](https://firebase.google.com/support/release-notes/js).

## 4. Configurar Firebase y probar el login real

1. Crear o elegir un proyecto de desarrollo en Firebase y registrar una aplicación **web**. No se ha creado/modificado un proyecto remoto desde esta tarea.
2. En Authentication → proveedores, habilitar Google y configurar el correo de soporte/pantalla de consentimiento que corresponda. No habilitar acceso anónimo para acceder a partidos.
3. En Authentication → dominios autorizados, añadir `itsasnehezkuntza.github.io` para Pages y `localhost`/`127.0.0.1` para las pruebas que se vayan a utilizar. Son nombres de host, sin ruta del repositorio. No asumir que localhost está autorizado automáticamente.
4. Copiar `apiKey`, `authDomain`, `projectId` y `appId` de la configuración **web pública** en `js/firebase-config.js`; poner `enabled: true` y mantener `authEmulator: false`. Mantener el `authDomain` suministrado por Firebase, normalmente `PROYECTO.firebaseapp.com`. Comprobar el handler OAuth de ese dominio si la consola lo solicita. La API key web no sustituye las reglas de seguridad.
5. Servir el proyecto por HTTP en localhost o HTTPS en Pages. Para desarrollo: `node tools/playwright/servidor.mjs`, y abrir `http://127.0.0.1:4173/`. No usar `file://`.
6. Con datos ficticios: crear partido/tiro sin cuenta; pulsar **Iniciar sesión con Google**; verificar correo, recargar, cerrar sesión y entrar con otra cuenta. El estado seguirá siendo **Solo local**. Comparar partidos, Deshacer y CSV antes/después: no debe haber adopción ni subida automática.

No introducir cuentas de servicio, claves privadas, secretos OAuth ni credenciales administrativas en archivos de la web. No se necesita autenticación de la CLI para las pruebas locales. El proyecto real/configuración pública no se han suministrado, por lo que el consentimiento Google real queda pendiente de esa configuración.

## 5. Contrato de Firestore preparado para 8B

```text
users/{uid}
teams/{teamId}
teams/{teamId}/members/{uid}
teams/{teamId}/games/{cloudGameId}
teams/{teamId}/games/{cloudGameId}/events/{cloudEventId}
teams/{teamId}/games/{cloudGameId}/eventDeletions/{cloudEventId}
```

| Documento | Campos/contrato |
| --- | --- |
| Usuario | `schemaVersion`, `displayName`, `createdAt` de servidor. Solo su usuario lo lee/crea. No almacena permisos editables. |
| Equipo | `schemaVersion`, `name`, `ownerUid` inmutable, `createdAt` de servidor. Se crea en batch junto a su propietario. |
| Miembro | `schemaVersion`, `uid`, `role: owner`, `status: active`, `createdAt`. La ruta admite futuros entrenadores; el cliente actual no puede añadirlos, activarse ni cambiar roles. |
| Partido | `schemaVersion`, `createdBy`, `createdAt` de servidor, `sourceId`, `payload` histórico, `deletedAt`, `deletedBy`. El payload conserva `id`, jornada, rival y fecha originales. |
| Evento | `schemaVersion`, `createdBy`, `createdAt` de servidor, `sourceId`, `payload`. Payload con ID/partido originales, nombres, IDs deportivos cuando existen, tiros permitidos y resultado original. Inmutable. |
| Lápida de evento | `schemaVersion`, `eventId` técnico, `deletedBy`, `deletedAt` de servidor y `operationId`. Independiente del alta y permanente. |

`teamId` y los IDs técnicos son UUID o hashes canónicos; los nombres deportivos nunca son rutas. La ruta completa `[uid de sesión, teamId, cloudGameId, cloudEventId]` es el ámbito de caché/operaciones. El `uid` no es necesario en la ruta de partido porque el equipo es el límite de autorización; sí es obligatorio en el almacenamiento local de la cuenta y en cada operación pendiente.

No se guarda un array de eventos en el partido ni contadores que puedan pisarse. La aplicación descargará eventos y lápidas, excluirá lo borrado y derivará estadísticas en memoria. No se consulta la colección de partidos de otro equipo ni un grupo global de eventos. La consulta inicial de equipos debe incluir `where('ownerUid', '==', uid)`; solo devuelve metadatos de equipos cuyo propietario inmutable es ese usuario. Lectura individual, miembros y datos deportivos exigen además membresía activa verificada por reglas.

Las reglas aceptan un histórico conocido sin IDs deportivos nuevos. No contrastan nombres ni acciones históricas con el CSV actual. Un registro antiguo con campos/tipos desconocidos se mostrará como incidencia en el asistente y se conservará localmente: no se trunca para forzar una subida. Ampliar un contrato histórico requiere un cambio de esquema/reglas probado.

## 6. Sincronización local-first: diseño, todavía sin ejecutar

### Transacciones y almacenamiento futuro

La versión 1 carece de outbox, vínculos y lápidas; no basta con un listener que suba cada cambio. En 8B se propondrá una **migración aditiva v2**, con pruebas de actualización desde bases ficticias v1 pobladas y de bloqueo por otra pestaña. No se ejecuta aquí.

Se conservan `games/events/settings` y sus claves/datos. Nuevos almacenes previstos: `syncBindings` (origen/local → cuenta/equipo/ID remoto), `syncOutbox`, `syncTombstones`, `syncMetadata` y cachés `remoteGames/remoteEvents/remoteEventDeletions` con claves compuestas por cuenta/equipo/ID técnico. Se evita insertar eventos de cuentas u orígenes distintos bajo el actual índice único `events.byUuid`. Un identificador de vista resuelve el ámbito sin cambiar el `payload.id` que se exporta.

Registrar en un partido vinculado debe confirmar en **una sola transacción IndexedDB**: evento local/materializado, secuencia/orden, vínculo si procede y operación outbox. Deshacer confirma eliminación visible, lápida y operación en la misma transacción. Eliminar confirma la retirada del partido activo, sus eventos visibles, lápida del partido y operación; conserva en metadatos el payload y las correspondencias necesarios para propagar el borrado. Un aborto revierte todo. Una lectura remota se materializa con deduplicación sin sustituir pendientes locales.

Cada operación lleva ID criptográfico, `uid`, `teamId`, entidad/ID remoto, tipo, payload inmutable o hash, dependencias, estado, intentos y fecha de siguiente intento. Reintentar conserva estos campos. La cuenta no se obtiene de una variable global justo al enviar: se comprueba contra el ámbito capturado. Los partidos sin vínculo siguen exclusivamente locales.

### Envío, concurrencia y confirmación

El trabajador procesa una cola duradera; nunca se espera a Internet para devolver «Guardado localmente». Alta de partido antes de sus eventos; lápidas tienen prioridad sobre altas pendientes. Reintentos exponenciales con variación aleatoria ante red; permisos/esquema requieren intervención y no se convierten en bucles ni en IDs nuevos.

Un arrendamiento en IndexedDB limita el trabajador a una pestaña por cuenta/equipo. La adquisición/renovación es transaccional y tiene vencimiento; Web Locks podrá optimizarlo donde exista. BroadcastChannel solo comunica invalidaciones. Expirar el arrendamiento no da unicidad por sí solo: los IDs fijos y las reglas inmutables hacen seguros los envíos simultáneos. Un reinicio recupera operaciones aún no confirmadas.

Cada alta usa ruta fija y transacción de servidor: si no existe se crea; si existe y el payload/procedencia coincide se reconoce como el mismo envío; si difiere se declara conflicto y se conserva la copia local. La comparación no exige repetir el timestamp de servidor original. Las lápidas equivalentes o un padre ya eliminado permiten reconocer un borrado reintentado. Perder la respuesta tras commit se resuelve consultando el mismo ID, sin crear otra entidad.

Solo después del acuse del servidor se confirma la outbox local. Un snapshot de caché o con `hasPendingWrites` no confirma nada; se requiere respuesta de commit o lectura explícita del servidor del documento esperado y de sus lápidas. «Sincronizado» requiere ausencia de pendientes/conflictos **y** una reconciliación remota completada, nunca solo estar online.

### Borrados y Deshacer

La lápida de partido domina sobre todos sus eventos. No se borra físicamente en Firestore; no se permite pasar de eliminado a vivo. Puede crearse directamente un documento de partido ya eliminado si el alta aún no llegó. Una subida tardía al mismo ID encuentra esa lápida y no puede reescribirla; tampoco puede crear eventos bajo ella.

Deshacer genera `eventDeletions/{cloudEventId}` incluso si el alta no existe aún. Es inmutable y hace que un alta posterior falle. Un evento ya guardado permanece como histórico remoto, pero nunca vuelve al conjunto vivo mientras su lápida exista. El cliente aplica lápidas antes de renderizar, también si el SDK entrega el evento primero. Si el partido está eliminado, su lápida subsume el Deshacer pendiente.

No compactar lápidas ni aplicar TTL en 8B: un iPad puede reconectar meses después. Recuperar un borrado requeriría una nueva entidad con ID distinto y autorización futura; no es una operación de esta fase. Al cancelar un alta no se descarta una lápida si alguna pestaña pudo haberla enviado: debe obtenerse confirmación remota del borrado.

### Orden y conflictos entre dispositivos

Los eventos son inmutables y se unen por ID técnico; nunca se hace un «último documento gana» sobre el array del partido. Mismo ID con distinto payload: conflicto explícito, se detiene esa operación y se conserva el original. La modificación de jornada/rival sigue fuera de alcance. Borrado frente a alta: gana el borrado.

`seq` mantiene su significado local; no se usa como orden global ni se reescribe en el payload histórico. Para el futuro conjunto sincronizado se propone ordenar eventos confirmados por `(createdAt del servidor, cloudEventId)` y pendientes por orden local persistido. Es orden de recepción del servidor, no hora real del tiro offline. El orden de materialización se guarda por separado del payload. Antes de 8B debe revisarse esta política con sus pruebas de reconexión: la confirmación remota puede cambiar la posición de pendientes.

Deshacer captura el ID del último evento vivo del partido **ya materializado en ese dispositivo** antes de esperar red. Una llegada concurrente no cambia ese objetivo. Dos dispositivos que deshacen el mismo ID producen una sola lápida; no se consulta remotamente «el último» para borrar otro evento inesperado. El comportamiento local actual por `byGameSeq` permanece íntegro en 8A.

### Cambio de cuenta y datos locales anteriores

En 8A no existe caché de partidos remotos ni se atribuyen partidos a una cuenta. El conjunto local anterior pertenece al navegador y continúa visible al entrar/salir de Google, identificado como Solo local. Iniciar sesión no lo convierte en datos privados de esa cuenta ni lo sube.

En 8B, al iniciar cierre/cambio: invalidar generación de sesión, detener trabajador y listeners, ocultar inmediatamente las cachés del ámbito anterior y limpiar selección remota. Las respuestas tardías verifican `uid/teamId/generación` antes de escribir o renderizar. La outbox de A se conserva ligada a A y solo puede reanudarse tras volver A; B jamás la adopta. Partidos/selección remotos se filtran por ámbito; ninguna credencial ni estado de Google se guarda en la base deportiva. Un envío ya aceptado bajo A puede completarse en A, sin aplicarse a B. Tras reentrar se verifica otra vez membresía en servidor.

## 7. Asistente de primera sincronización — diseño

No está implementado ni se ejecuta automáticamente. Flujo propuesto:

1. Verificar cuenta visible y elegir/crear equipo propio; mostrar que iPad y ordenador mantienen IndexedDB diferentes, incluso usando el mismo Google. Localhost y Pages también son orígenes distintos.
2. Leer snapshots locales coherentes; presentar lista con jornada, rival, fecha, volumen, vínculos ya existentes e incidencias. Nada seleccionado inicialmente. Ofrecer cancelar y seguir local.
3. Mostrar destino **cuenta + equipo**, partidos seleccionados y resumen antes de confirmar la primera subida. No borrar copias locales tras subir.
4. En la futura v2, generar una vez un `sourceId` criptográfico por base y persistirlo transaccionalmente; dos pestañas no pueden crear dos orígenes. Guardar un manifiesto de importación y los vínculos en la misma transacción que su outbox. No subir si esa transacción aborta.
5. IDs de importación deterministas: SHA-256 de JSON canónico tipado `[versión, sourceId, tipo, clave local]`; para eventos antiguos incluir clave de partido y `seq` original además del ID si existe. Prefijos distintos para partido/evento. Conservar IDs originales dentro del payload; nunca confiar en que `legacy` o un contador de otro dispositivo son globales.
6. Repetir el asistente reutiliza manifiesto/vínculo y la misma ruta; compara contenido confirmado en servidor y omite lo ya confirmado. Si el contenido cambió, no crea otra copia para ocultar el conflicto. Eventos nuevos usarán IDs criptográficos globales y conservarán el ID de un reintento local.
7. Descarga de otro dispositivo conserva los IDs técnicos recibidos y los vincula a su caché del mismo equipo: no se vuelve a importar como si fuera un partido local nuevo. Si dos navegadores poseen copias antiguas sin procedencia común verificable, no se unen por nombres. El asistente debe avisar de candidatos parecidos y permitir revisar/cancelar; la reconciliación manual de copias ambiguas queda para 8B.
8. Una importación grande se envía por fragmentos pequeños y reanudables, dentro de los límites de escrituras/accesos de reglas. Un manifiesto incompleto no se presenta como sincronizado. La revisión final de contenido/volumen del servidor precede al éxito.

Si se limpia el sitio antes de sincronizar se pierde también su identidad/manifiesto local; no puede prometerse recuperar deduplicación de datos no confirmados. No se introduce exportación/importación JSON ni se cambia CSV para resolverlo.

## 8. Reglas y pruebas reproducibles

`firestore.rules` deniega toda ruta no declarada. Autenticación anónima de Firebase y ausencia de sesión se rechazan. Autenticación Google por sí sola no da acceso a equipos ajenos. Equipo/propietario se crean juntos; los clientes no pueden modificar propietario, membresía ni roles. Escrituras validan claves permitidas/obligatorias, tipos y límites, autor y timestamp de servidor; los eventos validan valor 2/3, resultado y permisos históricos si existen. No hay regla general para usuarios autenticados.

Los eventos y lápidas son inmutables. Partido admite exclusivamente pasar a eliminado. El alta de evento consulta también el estado final del padre y sus lápidas con `getAfter`/`existsAfter`, para impedir combinaciones contradictorias en un batch. Las reglas están **preparadas, probadas y sin desplegar**; activarlas en un proyecto real requiere una autorización posterior. Los SDK administrativos evitan las reglas y no forman parte de la web.

Requisitos de pruebas: Node moderno (utilizado v24.21.0), npm y Java 21+. En este equipo se usó un JRE portátil dentro de `.test-artifacts/java21/`, sin modificar Java/PATH del sistema. El runner lo detecta si está disponible; en otro equipo se usa Java del PATH. Instalar dependencias con `npm ci`; Chromium con `npm run visual:instalar` si falta.

```text
npm run test:cuenta
npm run test:reglas
npm run test:auth
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
npm run test:fase8a
```

Los runners de emuladores fijan `demo-defensas`, loopback y puertos 8085/9099; no hacen login ni deploy, no reutilizan proyectos reales y fallan si no pueden arrancar. La configuración de emulador web solo se acepta con proyecto `demo-defensas` en localhost/127.0.0.1. En las pruebas se inyecta la configuración ficticia mediante Playwright sin editar `firebase-config.js`. Se sirven bytes oficiales del SDK sin modificar desde una caché de prueba; no se simula su implementación. Auth Emulator sustituye al proveedor OAuth.

Resultados y capturas: `.test-artifacts/firebase/`. La suite de reglas cubre propietario, externo, invitado, usuario anónimo, autoinclusión, escalada, campos inválidos, acceso entre equipos, histórico conocido, borrados, altas tardías y batches contradictorios. La suite Auth cubre restauración, cierre y cambio de cuenta entre pestañas y bloqueo real de `window.open`, sin modificar datos deportivos ni acceder a Firestore.

Fuentes: [pruebas oficiales de reglas](https://firebase.google.com/docs/rules/unit-tests), [condiciones y validación en servidor](https://firebase.google.com/docs/firestore/security/rules-conditions), [Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure).

## 9. Estados de cabecera

Se conserva el indicador de guardado local y se añade otro de nube. En **8A solo se muestra Solo local**, también con cuenta conectada, porque todavía no hay vínculos, cola ni confirmaciones de servidor.

| Texto propuesto para 8B | Condición real |
| --- | --- |
| Solo local | Partido sin vínculo o sincronización no activada. |
| Guardado localmente · Pendiente de sincronizar | Commit IndexedDB confirmado y outbox duradera para ese ámbito con operaciones pendientes. |
| Sincronizando | Trabajador del ámbito activo enviando/reconciliando; el guardado local conserva su indicador independiente. |
| Sincronizado | Cola del partido vacía, sin conflictos y reconciliación/confirmaciones del servidor verificadas. |
| Error de sincronización | Error de cuenta/permisos/red o conflicto de envío; no implica que haya fallado IndexedDB. |

Si falla IndexedDB se muestra Error al guardar; no puede ocultarse con un mensaje de Internet ni con el estado de cuenta. Un timeout o un snapshot offline no permite pasar a Sincronizado.

## 10. Pendientes de Fase 8B y límites de cierre

- Configuración pública del proyecto real y prueba de OAuth/Safari físico. Elegir región de Firestore antes de crear la base y revisar sus límites/costes para el uso previsto.
- Implementar y probar migración aditiva, cachés por ámbito, outbox atómica, manifiestos, arrendamientos, materialización y política de orden. La arquitectura descrita no equivale a un motor de sincronización ya operativo.
- Pruebas de red partida, respuesta perdida tras commit, caída entre commit remoto y acuse local, expiración del arrendamiento, dos dispositivos reales, cambio de cuenta durante envíos, permisos revocados, importación por fragmentos y conflicto de payload.
- Revisión del asistente y de copias históricas ambiguas entre dispositivos. No inferir equipos ni propietario a partir de nombres deportivos.
- Las reglas v1 son para propietario único. Añadir entrenadores/invitaciones requerirá un flujo autorizado y nuevas reglas/pruebas; no basta con cambiar un campo desde la consola cliente.
- Mantener lápidas mientras existan posibles clientes antiguos. Borrado definitivo/retención y recuperación de cuenta quedan fuera de esta entrega.

No se activa sincronización, no se suben partidos existentes y no se cambia el esquema IndexedDB. Se detiene para revisión de 8A.
