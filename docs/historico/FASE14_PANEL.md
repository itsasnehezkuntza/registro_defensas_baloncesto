# Fase 14 — M6: panel sincronizado entre dispositivos

Fecha: 20 de octubre de 2026. Rama local `develop`. **M6 corregido; Fase 14 completada localmente y detenida para revisión.** No cambia la versión publicada 8C.0. Copia previa en `.local-backups/fase14-panel-20261020/`. Sin commit, push, despliegue ni cambios en Firebase real.

## Comportamiento

La configuración se separa por proyecto, cuenta y equipo. Cada partido sincronizado conserva una versión de su panel; la última edición confirmada en la nube es también la plantilla para partidos nuevos del equipo. El otro dispositivo recibe ambos cambios por las escuchas de servidor, sin recargar. `categorias.csv` sigue proporcionando los valores iniciales.

Un partido sincronizado conserva su snapshot aunque proceda del CSV y todavía esté vacío. Así dos dispositivos con distintas copias del archivo no alteran su panel al abrirlo. Sin cuenta se mantiene el comportamiento anterior: los paneles procedentes del CSV siguen sus cambios mientras no tengan tiros. Una edición no cambia los paneles de otros partidos existentes.

Los tiros bloquean la edición del panel de su partido. El guardado vuelve a comprobar los tiros dentro de la transacción local. Antes de sustituir un panel remoto, el transporte comprueba eventos, lápidas y versión base; un reloj de cambios en el padre detecta tiros concurrentes. Vaciar o deshacer todos los tiros permite editar de nuevo. Los eventos originales, sus IDs y sus nombres nunca se reescriben.

Sin conexión se guardan versión, asociación, snapshot y operaciones de cola en una única transacción de IndexedDB. Tras recargar, los cambios siguen pendientes. Se envían alta del partido, panel y después tiros. El acuse de servidor retira la operación; el guardado local no equivale a «Sincronizado».

Las ediciones simultáneas comparan su versión base; no gana silenciosamente la última escritura. Un conflicto conserva la versión local y su cola con aviso de error. Los paneles de otros partidos pueden seguir subiendo y los cambios compatibles siguen llegando (Fase 13). Si una edición atrasada entra en conflicto con tiros ya remotos, esos tiros se muestran con el panel remoto que los originó; la edición local permanece en el historial y la cola. Reintentar no fuerza una sobrescritura. No se añade una pantalla para elegir entre versiones conflictivas.

## Conservación de configuraciones anteriores

- La importación confirmada de partidos locales incluye el panel asociado y sus IDs usados. Los originales locales, su configuración global y sus eventos permanecen idénticos.
- Para partidos de nube anteriores a esta fase se recuperan únicamente las versiones que este dispositivo ya vinculaba a ese partido en `configuracionPorPartido`. Se copian al ámbito del equipo y se encolan; no se atribuye todo el panel global a cualquier cuenta o equipo.
- Si la configuración personalizada ya desapareció del único dispositivo que la guardaba y nunca llegó a la nube, no se puede reconstruir a partir de los tiros. Sus nombres e IDs históricos siguen disponibles en los eventos y el CSV.
- Al cerrar sesión se elimina del dispositivo la configuración propia de esa cuenta, junto con sus copias y cola. Los originales sin cuenta se conservan según la decisión de Fase 10. Al volver a entrar, la configuración sincronizada se recupera de la nube.

## Implementación

`js/panel-model.js` define el contrato y valida los documentos recibidos, tamaño, secciones, tiros e IDs. La mezcla añade versiones inmutables; un ID ya existente con contenido distinto produce conflicto. Un eco idéntico no incrementa la revisión ni interrumpe la selección del tiro.

`configuracion-guardada.js` guarda configuración y asociaciones con claves por ámbito en el almacén `settings` existente. `sync-storage.js` incluye ese almacén en las transacciones de nube y añade las operaciones `panel` y `default-panel`. No cambia la versión de IndexedDB, no elimina almacenes y no reinicia bases.

Modelo remoto añadido, sin modificar el contenido deportivo de partidos o eventos:

- `teams/{equipo}/configuration/current`: plantilla y versión base.
- `teams/{equipo}/configurationVersions/{version}`: versiones inmutables de plantilla.
- `teams/{equipo}/games/{partido}`: snapshot `panel` y reloj `panelClock` fuera de `payload`.
- `teams/{equipo}/games/{partido}/panelVersions/{version}`: versiones inmutables por partido.

Las reglas locales restringen estas rutas al propietario activo del equipo, impiden modificar/borrar versiones y exigen que el puntero tenga una versión conservada. Las reglas validan el sobre y la forma superior; el cliente valida el documento completo. La protección frente a editar un partido con tiros la aplica el transporte cooperativo, con el reloj exigido por las reglas para nuevas altas y lápidas en partidos con panel.

La recepción añade una escucha de plantilla por equipo. La batería 30 partidos × 70 tiros mantiene cero consultas periódicas: 62 escuchas iniciales, todas cerradas al detenerse. Los tiros y deshacer actualizan además el reloj del padre; eso añade una escritura del padre por operación y lecturas de sus cambios en los otros dispositivos. Las ediciones consultan eventos/lápidas para comprobar que no haya tiros vivos. No se presenta esta ampliación como gratuita ni como límite de cuota garantizado.

## Publicación pendiente

**El código y las reglas de esta fase deben publicarse de forma coordinada, con los dispositivos actualizados.** Los clientes publicados antiguos no envían el reloj del padre: bajo las reglas nuevas sus tiros y deshacer serían rechazados en partidos que ya tengan panel. Sus datos locales y operaciones pendientes permanecen conservados; el cliente nuevo puede reenviarlos con el protocolo actualizado. Los partidos antiguos sin panel mantienen el protocolo anterior hasta asociarles uno.

Publicar solo el código tampoco sirve: las reglas publicadas anteriores deniegan las nuevas rutas de configuración. Esta fase no ha desplegado ninguna de las dos partes. La actualización coordinada y la comprobación física en Safari/iPad quedan para una fase de publicación autorizada.

## Verificación

Las pruebas usan exclusivamente contextos de navegador efímeros, IndexedDB aislada, SDK oficial y emuladores `demo-defensas`. Los recibos quedan en `.test-artifacts/firebase/`; no se utilizan partidos reales.

- `node tools/firebase/emuladores.mjs sync`: **40 grupos correctos**, diez nuevos M6. Panel editado e IDs nuevos en B, plantilla compartida y recarga, protección con tiros y edición atrasada, vaciado/reintento, recuperación tras purgar cuenta y aislamiento entre cuentas/equipos, aborto atómico, edición/tiro offline y recarga, ediciones simultáneas, importación personalizada y recuperación de asociación antigua. Incluye la interfaz real editando en A y recibiendo el nombre en B sin recargar, además de las regresiones previas. Recibo `sync.json`: `ok: true`, `realWrites: 0`.
- `node tools/firebase/emuladores.mjs rules`: **85 comprobaciones correctas**, 23 nuevas sobre versiones, punteros, autoría, aislamiento, plantilla y reloj de tiro/deshacer.
- `node --test tests/*.test.mjs`: **10 archivos correctos**, incluido el contrato de panel, rechazo de datos malformados, inmutabilidad y eco idempotente.
- `startup12.test.mjs`: siete grupos de arranque/sesión correctos, cero solicitudes externas. `watch.test.mjs`: 120 ciclos sin consultas ni nuevas escuchas, cierres y callbacks tardíos correctos. `sync-auto-refresh.test.mjs`: recepción e interfaz bidireccionales correctas, sin ciclos ni recargas forzados y cero escrituras reales.
- Sintaxis de los módulos modificados correcta; paquete estático local preparado con 37 archivos y rutas relativas, sin publicar.
- `local-browser.mjs`: regresiones de Fases 2, 3, 5, 6 y 10 correctas; inicio de sesión, siete tamaños sin peticiones externas en modo local, fallos Firebase, CSV y funcionamiento en subruta correctos.

Durante la ampliación se corrigió la preparación de una prueba que intentaba reiniciar un motor ya detenido. También se cerraron los contextos efímeros al terminar cada matriz para evitar el agotamiento de conexiones del navegador (`ERR_NO_BUFFER_SPACE`). La batería completa posterior pasó; no se ocultaron conflictos ni errores de la aplicación para hacerla pasar.

## Continuación

Fase detenida para revisión, sin iniciar otra. Siguen pendientes decisiones sobre descarga inicial del SDK y originales/preferencia al salir, retirar el dominio temporal de Authentication, CSP, Safari/iPad físico y consolidación/publicación autorizada. A2 conserva su límite conocido de persistencia en Safari; los conflictos de contenido requieren resolución explícita.
