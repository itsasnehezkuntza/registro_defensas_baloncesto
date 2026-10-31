# Fase 23 — Administración y supervisión de equipos

**Revisión posterior Fase 23.1 terminada, sin publicar:** ver [revisión de seguridad, inventario exacto, despliegue, reversión y guía física](FASE23_1_REVISION_PUBLICACION.md). Veredicto técnico favorable; se reutiliza esta evidencia y se añade únicamente un recorrido del cliente exacto 22.0 bajo reglas candidatas en Emulator. Aplicación y reglas de este informe conservadas.

29 de octubre de 2026. Candidato **23.0-local**, exclusivamente local, pendiente de revisión. No se ha publicado, hecho commit/push ni cambiado Firebase real, usuarios o datos deportivos.

## Base y aislamiento

Copia independiente en `.test-artifacts/fase23-repo/`, creada desde la copia limpia de publicación 22.0. HEAD base `6003a72abae880f225669d0a4d4cf27b97093fd2` (documentación posterior a la publicación); fuentes publicadas `6bfe942d32de8b4fe6efef8cafd48f533acbd339`. No se parte del diff acumulado de develop.

El workspace original continúa en develop, HEAD `7c439c149ad2bbe4e71749260e8b9d10f45c0d83`. Inventario previo con SHA-256, ausencias y estado de sus 368 rutas en `.test-artifacts/fase23-conservacion-antes.json`, fuera de esta copia. No se cambian su rama, índice ni archivos existentes. Los resultados y herramientas auxiliares de esta fase están en carpetas nuevas ignoradas.

## Arquitectura

Un único documento administrativo por relación UID/equipo:

```text
supervision/{uidSupervisor}/teams/{teamId}
  schemaVersion: 1        (número)
  role: "reader"         (texto)
  status: "active"       (texto; "revoked" revoca)
```

Es simultáneamente la autorización y el índice de descubrimiento. No se duplica en `members`, ni en un array del equipo, ni en un perfil, ni en estadísticas. No se conceden privilegios globales o por correo. El correo solo se muestra para reconocer la sesión.

| Operación | Propietario | Supervisor con ACL activa |
| --- | --- | --- |
| Consultar equipo concreto y datos deportivos | Como en 22.0 | Solo equipos asignados |
| Descubrir equipos | Consulta existente por ownerUid | Solo su subcolección de ACL; después obtiene esos equipos por ID |
| Leer miembros/perfiles de otra persona | Como en 22.0 | Denegado |
| Crear, registrar, editar panel, Deshacer, vaciar, eliminar | Como en 22.0 | Denegado en equipos supervisados |
| Asignar, modificar o revocar ACL | Denegado desde cliente | Denegado desde cliente |
| Consultas globales/collectionGroup deportivas | Denegadas como en 22.0 | Denegadas |

`firestore.rules` añade `reader(teamId)` exclusivamente en permisos de lectura de equipo y documentos deportivos. Los predicados de escritura `owner(teamId)` y todas las validaciones existentes se conservan. La lectura de membresías sigue exigiendo propietario. Un UID puede ser propietario de sus propios equipos y lector de otros: la autorización se evalúa por equipo. Una ACL no convierte al supervisor en propietario.

No hay índices compuestos nuevos ni cambios de esquema IndexedDB. No se usa Custom Claims, correo, lista global de administradores o credencial privilegiada en el navegador. Un administrador de Firebase con permisos IAM sigue siendo una identidad administrativa distinta del usuario supervisor de la aplicación.

## Experiencia y módulos

- Acceso discreto «Consultar equipos supervisados» en inicio y perfil. No se añade una consulta al inicio habitual del entrenador ni se cambia su selección/equipo activo.
- `supervision.html` es una entrada independiente, accesible incluso si esa cuenta no tiene equipo propio. Inicia solo Auth, lector y Dashboard; no carga `app.js`, cuenta UI, persistencia, outbox o transporte de escritura.
- `js/supervision-reader.js` expone solo `watchAccess`, `team`, `games`, `game`, `close`. Lee del servidor y usa la caché de memoria predeterminada de Firestore; no activa caché deportiva persistente ni materializa datos ajenos en IndexedDB.
- `js/supervision-ui.js` permite seleccionar equipo y partido. Reutiliza `dashboard.js`, `estadisticas.js`, identidades históricas y sus estilos sin cambiarlos. `panel-configuration.js` extrae la proyección pura ya existente de `configuracion-guardada.js`, que la importa/reexporta para conservar su contrato.
- Se utilizan los IDs remotos al pedir documentos y los IDs deportivos originales al calcular. Se excluyen partidos borrados y eventos con lápida. Panel del partido conservado; si un partido antiguo no lleva panel, se indican ejes del CSV actual y el Dashboard conserva los datos históricos.
- No se añaden exportaciones, estadísticas de temporada, edición, administración desde la web ni cambios al flujo de dos pulsaciones.
- Estilo: tokens V4 existentes (`#E7E7E4`, `#F5F5F3`, `#FFFFFF`, `#161616`, `#5E5E5A`, `#DA5A35`), Manrope y Barlow Condensed locales. Cabecera de consulta, distintivo «Solo lectura», dos selectores y Dashboard debajo; se apilan en móvil. No se rediseña el Dashboard validado.

La única escucha es la subcolección de autorizaciones del UID conectado. Descubre nuevas asignaciones y retira la selección/Dashboard al revocar. Las estadísticas son una consulta puntual explícita; para actualizar un partido se vuelve a seleccionarlo. No hay polling ni escuchas deportivas de todos los equipos.

Al desconectar, ocultar la pestaña, abandonar la página o cambiar de identidad se limpia la vista y se invalida cualquier respuesta pendiente. Al regresar se revalida el acceso. Las respuestas de caché sin confirmación del servidor no autorizan. Al cambiar el permiso durante una lectura, el lector descarta su respuesta. El reloj del panel permite reintentar hasta tres veces un partido que cambia durante la consulta; se leen lápidas antes y después de eventos. Los históricos sin reloj se presentan como lectura puntual, no como snapshot transaccional de todo el partido.

La página no cierra Google ni purga datos del entrenador: volver al registro permite usar su cierre protegido existente. Revocar bloquea las nuevas lecturas en servidor y retira la vista conectada al llegar el cambio. Ningún sistema puede retirar una captura o información que alguien ya haya recibido legítimamente; no se promete borrado retrospectivo del dispositivo.

## Procedimiento administrativo para asignar equipos

**Preparado, sin ejecutar sobre producción.** Primero revisar y autorizar la futura publicación de código/reglas. No basta con subir HTML: las reglas candidatas deberán publicarse coordinadamente antes de activar asignaciones reales.

1. En Firebase Authentication del proyecto correcto, identificar tu cuenta de Google y copiar su **UID exacto**. Comprobar proveedor y cuenta; no inferir el UID a partir de un correo ni escribir el correo como ID.
2. Obtener del entrenador/administración el **ID exacto del equipo** que se desea supervisar. En administración, revisar únicamente `teams/{teamId}` y su `ownerUid` contra el propietario esperado; no enumerar toda la base ni copiar partidos. Dejar constancia privada de quién autoriza la asociación, proyecto, UID, equipo y propietario.
3. Generar un plan local sin red:

   ```text
   node tools/firebase/supervision-admin.mjs asignar UID_SUPERVISOR ID_EQUIPO
   ```

4. Revisar el plan. Con una identidad administrativa de Firebase/IAM, desde la consola Firestore crear exclusivamente `supervision/{UID_SUPERVISOR}/teams/{ID_EQUIPO}` con los tres campos/tipos del contrato anterior. Si ya existe, revisar su estado antes de actualizar: no sobrescribir a ciegas una revocación. No crear un miembro ni cambiar `ownerUid`, documentos deportivos o perfil de usuario.
5. Abrir Supervisión con tu cuenta, actualizar equipos y comprobar el destino antes de seleccionar un partido. Registrar la asignación en el control administrativo privado. La consola y las credenciales IAM nunca se incluyen en los archivos públicos.

Revocar: cambiar únicamente `status` a `"revoked"` en ese documento, o eliminar **solo ese permiso**. Mantener `revoked` permite conservar la marca administrativa sin nombres/datos deportivos. No borrar el equipo ni miembros. El cambio es suficiente para las Rules aunque el usuario conserve su sesión/token; no hace falta cambiar el correo o esperar a renovar Custom Claims. Para reasignar, repetir la verificación administrativa y cambiar a `active` deliberadamente.

La herramienta permite aplicar planes **exclusivamente en el emulador**:

```text
node tools/firebase/supervision-admin.mjs asignar UID_FICTICIO EQUIPO_FICTICIO --aplicar-emulador UID_PROPIETARIO_FICTICIO
node tools/firebase/supervision-admin.mjs revocar UID_FICTICIO EQUIPO_FICTICIO --aplicar-emulador UID_PROPIETARIO_FICTICIO
```

Exige `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`, fija `demo-defensas`, comprueba el propietario y usa commit atómico con precondiciones sobre equipo/permiso previo. Una carrera aborta sin sobrescribir. No tiene modo de aplicación real, no lee tokens reales y no forma parte del paquete público. Así se prueba el procedimiento sin introducir un servidor propio ni un Admin SDK como nueva dependencia.

## Pruebas y reproducción

Todos los perfiles son efímeros y todos los datos ficticios. La batería específica configura Auth/Firestore Emulator, SDK oficial y bloquea destinos de datos reales. Incluye propietario, supervisor autorizado, supervisor revocado, externo con el mismo correo y claim inventado, sesión ausente y cuenta anónima con ACL.

```text
node --test tests/*.test.mjs tools/firebase/cuenta.test.mjs
node tools/firebase/emuladores.mjs supervision23
node tools/firebase/emuladores.mjs suite23
node tools/firebase/prepare23-local.mjs
node tools/firebase/supervision23-upgrade.test.mjs
node tools/firebase/local-browser.mjs
```

Para esta copia aislada, las dependencias de desarrollo se resuelven desde `node_modules` del workspace original, sin instalar otras. Los emuladores y los navegadores ya disponibles se reutilizan mediante variables de entorno de las herramientas. Desde el workspace original, `node .test-artifacts/fase23-ejecutar.mjs supervision23` configura esas rutas. `suite23` ejecuta reglas, supervisión, sincronización y cuentas en el mismo proyecto ficticio.

**Verificación final terminada.** Baterías finalizadas con código 0:

| Batería | Resultado | Recibo dentro de esta copia |
| --- | --- | --- |
| Fase 23: seguridad, administración y UI | 101 comprobaciones y grupos | `fase23/resultados.json` |
| Reglas anteriores con reglas candidatas | 85 comprobaciones | `fase23/rules.log` |
| Regresión de sincronización | 40 grupos | `sync.json` |
| Cuenta/equipos 22.0 | 28 grupos Chromium/WebKit | `fase22/cuentas.json` |
| Unitarias, incluido lector y carreras | 12 archivos correctos | `fase23/unitarias.log` |
| Actualización 22→23 en subruta | 2 grupos Chromium/WebKit | `fase23/upgrade.json` |
| Local, CSV, recarga, doble toque y responsive | 17 entradas, fases 2/3/5/6/10 | `local.json` |
| Auditoría estática | 19 cláusulas de escritura idénticas, 23 archivos centrales intactos, dependencias conservadas | `fase23/auditoria.json` |

Los recibos anteriores son relativos a `.test-artifacts/firebase/`. La batería de supervisión registra 3 avisos de transporte WebKit correlacionados con canales fallidos; cero errores inesperados, infracciones CSP, destinos de datos reales, escrituras deportivas o módulos de escritura cargados en la vista de supervisión. La suite conjunta se detuvo en el intento previo de la espera del hijo; tras corregir exclusivamente esa espera, Sync y Cuentas terminaron individualmente con código 0. El log fallido se conserva como `fase23/sync-intento-previo.log`; el resultado final de Sync es `sync.json`.

 Capturas de Chromium/WebKit a 1180×820, 820×1180, 390×844 y 320×740 en `.test-artifacts/firebase/fase23/`, dentro de esta copia. No equivalen a Safari en iPad físico.

Incidencias de prueba resueltas: el adaptador HTTP del emulador 1.20.4 no interpreta un parámetro binario de transacción REST. La herramienta administrativa usa en su lugar commit atómico con `verify` y precondiciones, sin tocar runtime deportivo. WebKit informa canales locales interrumpidos como errores de acceso; solo se clasifican como esperados si son del proyecto ficticio y coinciden con un `requestfailed` del mismo SID. Las sondas estáticas de gapi se registran y bloquean. No se ignoran errores de aplicación ni violaciones CSP. La regresión de cola bloqueada esperaba eventos inmediatamente tras recibir el padre: se añade espera explícita por el hijo antes de comprobar el contenido exacto, sin modificar el motor.

## Recursos y coste previsto

Sin servidor, Cloud Functions, React, dependencias nuevas, estadísticas almacenadas o duplicación de documentos deportivos. Por relación UID/equipo se almacena un pequeño documento ACL, con sus índices automáticos. Asignar/revocar añade una escritura administrativa; eliminar el permiso añade un borrado.

Al abrir/actualizar la consulta: lectura de las ACL propias y una cabecera por equipo autorizado. Al elegir equipo: documentos de sus partidos, incluidas lápidas necesarias para excluir borrados. Al elegir partido: dos lecturas de cabecera, una consulta de eventos y dos de lápidas; aproximadamente `2 + E + 2D` lecturas de documentos, antes de mínimos de consultas vacías y lecturas de reglas. Puede repetirse hasta tres veces si cambia el reloj durante la lectura. Solo se lee el partido elegido, sin descargar tiros de todos los partidos.

Las Rules pueden facturar lecturas adicionales de documentos dependientes (equipo, miembro propietario y ACL; también padre del evento según operación), incluso cuando deniegan una petición. Una misma dependencia referida varias veces no implica cobrarla varias veces por petición. Reconectar la escucha de ACL sin persistencia puede volver a facturar su resultado. No se promete coste cero ni se calcula una factura sin conocer región, uso y cuota. Véanse [tarificación oficial](https://firebase.google.com/docs/firestore/pricing) y [condiciones de reglas](https://firebase.google.com/docs/firestore/security/rules-conditions).

El entrenador no hace nuevas consultas de descubrimiento de supervisión: los dos enlaces son estáticos. Sus permisos de escritura permanecen idénticos. La infraestructura administrativa que pueda tener el propietario del proyecto y sus costes no se modifica.

## Pendiente de revisión

Revisar arquitectura, interfaz y procedimiento; después, si se autoriza expresamente, preparar publicación coordinada de reglas/archivos públicos y asignación de UID/equipos concretos. No se han solicitado ni inferido esos identificadores reales. Verificación física en iPad y asignaciones reales pendientes. Esta fase no incluye publicar, recuperar partidos reales, respaldo independiente, cambios pendientes del editor ni MOP-001.
