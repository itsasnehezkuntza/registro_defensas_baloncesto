# Arquitectura vigente

Aplicación 23.0, base main 4a9e639. Este documento complementa la [especificación funcional](../ESPECIFICACION.md); los detalles de fases están en el [histórico](historico/README.md). No propone cambios de arquitectura.

## Entradas y módulos

| Capa | Archivos | Responsabilidad |
|---|---|---|
| Entrenador | [index.html](../index.html), [app.js](../app.js), [inicio](../js/inicio.js), [vistas](../js/vistas.js) | Inicio, selección de partido, Registro y cambio a Estadísticas. |
| Deporte y presentación | [configuración](../js/configuracion.js), [registro](../js/registro.js), [estadísticas](../js/estadisticas.js), [Dashboard](../js/dashboard.js), [identidad](../js/identidad.js) | Validación de CSV, tiros válidos, agregación por partido e identidades históricas. |
| Datos locales y panel | [persistencia](../js/persistencia.js), [configuración guardada](../js/configuracion-guardada.js), [editor](../js/editor.js) | Transacciones, selección, eventos, versiones del panel y edición. |
| Cuenta | [controlador](../js/cuenta.js), [UI](../js/cuenta-ui.js), [adaptador Auth](../js/firebase-auth.js) | Sesión, restauración y cierre protegido; popup de Google desde el gesto del usuario. |
| Sync | [almacenamiento](../js/sync-storage.js), [motor](../js/sync-engine.js), [transporte](../js/firestore-sync.js), [escuchas](../js/firestore-watch.js), [UI](../js/sync-ui.js) | Ámbitos, cola, acuses, reintentos, recepción y equipos. |
| Supervisor | [supervision.html](../supervision.html), [lector](../js/supervision-reader.js), [UI](../js/supervision-ui.js), [proyección pura](../js/panel-configuration.js) | Consulta autorizada y Dashboard sin almacenamiento deportivo ni escritura. |

HTML/CSS/módulos JavaScript, sin React, Vite, servidor propio ni compilación. SDK modular de Firebase 12.11.0 desde CDN oficial; dependencias npm exclusivamente de desarrollo. Las fuentes y licencias tipográficas son locales. Rutas relativas para GitHub Pages. Los adaptadores mantienen una separación útil para una posible envoltura Capacitor, no implementada.

## IndexedDB y atomicidad

Nombre estable: `registro_defensivo_baloncesto`. Esquema local v1: games, events y settings. La capacidad Sync añade conservadoramente el esquema v2: cloudGames, cloudEvents, cloudTombs, syncQueue, syncMeta y syncBindings; settings se reutiliza. No se elimina ni recrea la base.

Los eventos tienen UUID estable y seq persistente; el índice por UUID evita duplicados. Las transacciones resuelven al completarse, no al éxito de una petición individual. Partido activo, existencia del partido, evento y cambios relacionados se comprueban en la transacción correspondiente. Un fallo aborta el conjunto y conserva la posibilidad de reintento.

Guardado deportivo y alta de operación en la cola son atómicos en el ámbito sincronizado. Contexto y revisión se vuelven a validar dentro de las operaciones; una respuesta tardía de otro UID/equipo no puede materializarse en el actual. La selección, las notificaciones entre pestañas y las revisiones evitan pintar una respuesta obsoleta.

El guardado del panel comparte transacción con las comprobaciones de partido y tiros. Una edición concurrente no pisa otra revisión y un tiro concurrente impide cambiar el panel. La retirada de una acción conserva sus eventos y nombres originales. [Prueba de concurrencia local](../tools/firebase/panel-local21.test.mjs), [pruebas del modelo](../tests/panel-model.test.mjs).

## Cuenta, ámbitos e importación

La identidad y el equipo delimitan el ámbito; el proyecto forma parte de su configuración. Las preferencias y cachés no mezclan UIDs. La restauración distingue equipo previamente configurado de primera preparación sin conexión. La caché puede permitir trabajar offline; el servidor sigue validando cada escritura. Un permission-denied detectado no se convierte en simple desconexión.

Los originales de una importación confirmada se conservan ocultos y vinculados a su destino. No son una copia actualizada de la versión sincronizada. Las asociaciones evitan ofrecerlos/importarlos de nuevo; no se deduplica por nombres. Se preserva el panel asociado y los IDs deportivos.

La UI cierra solo tras comprobar pendientes e históricos locales de la cuenta. La purga protegida vuelve a verificar esa condición dentro de su transacción y aborta con UNSYNCED_DATA si aparece una carrera. Una pérdida externa de sesión conserva la cola del UID original. [Cuenta](../js/cuenta-ui.js), [purga e importación](../js/sync-storage.js).

## Cola, recepción y conflictos

La cola distingue altas, paneles, eventos y eliminaciones. Respeta dependencias y lápidas; solo un acuse retira una operación. Una concesión temporal de trabajo por ámbito evita que dos pestañas envíen el mismo lote sin coordinación. Los errores transitorios retrasan reintentos; los conflictos conservan la operación y el dato local.

Bloquear un partido no bloquea automáticamente los demás ni la recepción compatible. Reintentar no fuerza la resolución del conflicto. No existe una interfaz general para elegir entre versiones incompatibles. La parada del motor espera su trabajo y cierra las escuchas.

El entrenador utiliza escuchas de partidos del equipo seleccionado, sus eventos/lápidas y la plantilla de panel. Puede recibir datos de todos los partidos de ese equipo; **no se limita al partido visible**. Se conservan ciclos del motor para cola/reintentos, pero sin volver a descargar colecciones completas periódicamente si nada cambia. El coste crece con los documentos y cambios del equipo. [Escuchas](../js/firestore-watch.js), [motor](../js/sync-engine.js), [prueba sin sondeo](../tools/firebase/watch.test.mjs).

## Paneles remotos

| Ruta Firestore | Contrato |
|---|---|
| teams/{teamId} y members/{uid} | Equipo y membresía propietaria activa; alta atómica. |
| games/{gameId}, bajo el equipo | Payload deportivo, borrado lógico, snapshot de panel y panelClock. |
| events y eventDeletions, bajo el partido | Eventos inmutables y lápidas; no resucitar altas ya eliminadas. |
| panelVersions/{versionId}, bajo el partido | Versiones inmutables del panel del partido. |
| configuration/current y configurationVersions/{versionId}, bajo el equipo | Puntero de plantilla y versiones inmutables. |
| supervision/{uid}/teams/{teamId} | Único permiso administrativo e índice privado de descubrimiento para lectores. |

Los IDs remotos y deportivos cumplen funciones distintas; el lector utiliza el remoto al consultar y el histórico deportivo al calcular. Panel y versión base se validan en el cliente; el transporte coopera con consultas y reloj del padre para detectar tiros concurrentes. Las Rules exigen el protocolo de reloj cuando hay panel, validan sobres/autores/rutas e inmutabilidad; no se atribuye a las Rules toda la validación profunda del panel o la lógica de edición. [Modelo](../js/panel-model.js), [transporte](../js/firestore-sync.js), [reglas](../firestore.rules).

## Límites de seguridad y supervisión

La UI ofrece Google; las Rules evalúan identidad autenticada no anónima y las relaciones por UID, sin confiar solo en correo. El propietario necesita ownerUid coincidente y membresía owner/active. Las escrituras deportivas siguen exigiendo propietario y sus validaciones existentes.

Un permiso reader/active con schemaVersion 1 permite lectura del equipo y documentos deportivos, no de miembros ajenos ni escritura deportiva. Los clientes no pueden crear, modificar o revocar permisos de supervisión. El usuario supervisor no equivale a un administrador IAM. No hay Custom Claims ni administradores globales en el navegador. [Contrato y procedimiento](supervision.md).

El supervisor mantiene una escucha solo de sus asignaciones. Obtiene cabeceras de los equipos autorizados, lista de partidos del equipo elegido y datos del partido seleccionado. Las estadísticas son consulta puntual; no hay polling ni escucha deportiva global. Cambiar de partido/equipo o permisos invalida respuestas antiguas.

Si un partido histórico no lleva panel, Supervisión usa e indica los ejes del CSV actual, conservando los datos históricos en el cálculo. La lectura contrasta panelClock antes/después y lápidas antes/después de los eventos; puede reintentar hasta tres veces si cambia el reloj. Un partido histórico sin reloj no se presenta como snapshot transaccional de todo su contenido. Desconexión, pestaña oculta, salida o cambio de identidad limpian la vista; al regresar se revalida en servidor. Auth puede persistir la sesión: eso no activa IndexedDB deportivo en Supervisión.

CSP en los HTML limita recursos, scripts y destinos. No hay secretos administrativos en el cliente, servidor propio, estadísticas deportivas duplicadas ni nuevos índices compuestos. El mínimo de lecturas por consultas vacías, las lecturas de Rules, las escuchas, las reconexiones y los cambios del padre pueden tener coste; no se promete coste cero.

## Pruebas y trazabilidad

[DESARROLLO.md](../DESARROLLO.md) distingue pruebas nativas rápidas, estáticas, navegador y emuladores, y herramientas históricas. Las pruebas actuales no dependen de recibos privados. [Inventario documental](inventario-documental.md), [decisiones originales](historico/README.md) y [pendientes](pendientes.md).
