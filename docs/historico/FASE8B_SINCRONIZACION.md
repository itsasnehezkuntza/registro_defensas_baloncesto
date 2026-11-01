# Fase 8B — Sincronización segura entre dispositivos

Continuidad, 17 de octubre: la prueba ficticia real autorizada de Fase 8B.1 está documentada en [FASE8B1_RESULTADOS.md](FASE8B1_RESULTADOS.md), con casos superados y límites. Este documento conserva el cierre histórico de 8B en Emulator; sus referencias a validación real pendiente describen aquel cierre. La sincronización de producción sigue desactivada.

Estado al 15 de octubre de 2026: implementación local terminada para revisión; **sincronización real desactivada**. Las pruebas utilizan Firestore/Auth Emulator y datos ficticios. No se ha escrito en Firestore real, hecho commit/push ni desplegado la aplicación.

El propietario confirma que Google real entra/restaura/cierra, Pages está autorizado, Firestore existe y las reglas preparadas están publicadas. Son confirmaciones del propietario, no una lectura administrativa ni una validación automática de la versión remota de reglas.

## Arquitectura y activación

`js/sync-config.js` entrega tres barreras explícitas:

```javascript
export const syncSettings = Object.freeze({
  enabled: false,
  emulator: false,
  allowRealWrites: false
});
```

Con `enabled: false` no se importa la interfaz/transporte Firestore, no hay consultas ni envíos y una base v1 no se actualiza. Authentication sigue funcionando y registrar sin cuenta mantiene el comportamiento local. Activar solo `enabled` tampoco permite crear el transporte real: exige `allowRealWrites: true`. La opción de emulador exige además `demo-defensas`, Auth Emulator y localhost/127.0.0.1; una combinación con el proyecto real se rechaza antes de inicializar Firestore.

El SDK modular oficial sigue fijado en **12.11.0**. Firestore usa su caché de memoria y lecturas explícitas del servidor. IndexedDB de la aplicación es el almacenamiento duradero; la cola no se delega a la persistencia interna del SDK.

| Módulo | Responsabilidad |
| --- | --- |
| `sync-config.js` | Activación y bloqueo de Firebase real. |
| `sync-storage.js` | Ámbitos, almacenes, outbox atómica, lápidas, importación, materialización y arrendamiento. |
| `firestore-sync.js` | Adaptador de Firestore: equipos, transacciones idempotentes y recuperación del servidor. |
| `sync-engine.js` | Trabajador, reintentos, exclusión entre pestañas y estados confirmados. |
| `sync-ui.js` | Equipo explícito, creación como propietario y asistente de importación confirmado. |
| `persistencia.js` | Conserva la API deportiva y dirige operaciones a almacenamiento local o al ámbito seleccionado. |
| `app.js` | Mantiene las dos pulsaciones; invalida vistas/tareas antiguas al cambiar de ámbito. |

La cuenta inicia el coordinador únicamente con la bandera activa. El menú «Más opciones» ofrece elegir **Solo local** o un equipo, crear un equipo y revisar partidos locales. Crear equipo es una acción explícita con nombre, confirmada por el servidor mediante un batch equipo/miembro propietario. No hay invitaciones, permisos avanzados ni creación automática de equipos. La selección de equipo se conserva por proyecto/cuenta para recuperar la cola tras recarga.

## IndexedDB y conservación

La base sigue llamándose `registro_defensivo_baloncesto`. Si se activa la bandera, el esquema **v2** añade almacenes sin borrar ni reescribir `games`, `events` o `settings`:

| Almacén nuevo | Claves y uso |
| --- | --- |
| `cloudGames` | `[ámbito, cloudGameId]`; payload original y marca de eliminación. |
| `cloudEvents` | `seq` técnico autoincremental; índice único `[ámbito, cloudGameId, cloudEventId]`; payload original separado. |
| `cloudTombs` | `[ámbito, partido, evento]`; evento vacío identifica la lápida del partido. Permanentes. |
| `syncQueue` | `[ámbito, operationId]`; tipo, destino, payload, procedencia, intentos y próximo envío. |
| `syncMeta` | Identidad de origen, selección, equipos verificados, propietario de copias locales y arrendamientos. |
| `syncBindings` | Correspondencia de importación local → partido remoto dentro de su ámbito. |

**Ámbito = proyecto + UID + equipo.** Cambiar de proyecto no reutiliza cachés, equipos ni operaciones del emulador. El índice único antiguo `events.byUuid` conserva su definición; las copias de otros dispositivos/cuentas viven en los almacenes nuevos para evitar colisiones con IDs antiguos.

La actualización de esquema no es una subida ni una importación de partidos. Con la configuración entregada no se ejecuta sobre la base del usuario. Si otra pestaña bloquea la actualización se informa del bloqueo; nunca se borra la base. Abrir posteriormente una base v2 con la bandera desactivada no intenta rebajar su versión. Desactivar la bandera no elimina sus copias sincronizadas, aunque la interfaz deja de abrir sus ámbitos de nube.

Al importar se conservan íntegros los registros originales v1. Una marca lateral los vincula al propietario y los retira del selector local editable: se continúa desde el equipo sincronizado para que las nuevas acciones lleven outbox. No queda una segunda copia editable sin cola. El asistente puede revisar/repetir la importación de la misma cuenta; nunca reimporta un evento deshecho. Las copias vinculadas se ocultan a otras cuentas y al cerrar sesión. Partidos anteriores todavía sin propietario permanecen como datos locales de ese navegador hasta una selección/confirmación explícita.

## Guardado, envío y confirmación

Cada registro del ámbito sincronizado confirma **evento + operación pendiente** en una misma transacción IndexedDB. Si falla la outbox se revierte el evento. Deshacer confirma la retirada visible del evento, su lápida y su operación juntos. Eliminar confirma partido marcado, lápida y operación juntos; sus eventos dejan de ser visibles y se conserva el payload necesario para enviar el borrado.

No hay transacción IndexedDB abierta esperando Internet. Los controles deportivos solo esperan el guardado local. Una operación abortada no produce «Guardado»; un error de red no cambia ese indicador ni bloquea el registro. El original local no vinculado sigue siendo Solo local y no se añade automáticamente a una cuenta.

El trabajador adquiere un arrendamiento transaccional por ámbito (30 segundos, renovado antes de cada envío). Otra pestaña espera; una pestaña caída deja caducar el arrendamiento. La seguridad no depende solo del arrendamiento: los IDs fijos y las transacciones idempotentes hacen seguros los reenvíos e incluso dos trabajadores tras una suspensión prolongada.

Cada documento usa una ruta fija. Una transacción Firestore comprueba si ya existe, compara payload/procedencia y reconoce el reintento; nunca usa `addDoc` para repetir una operación. Un ID con otro contenido produce `SYNC_CONFLICT` y no sobrescribe el servidor. Si se pierde la respuesta tras el commit, la operación queda en outbox y se reconoce en el siguiente intento. Una respuesta antigua tras cambiar de cuenta no confirma ni materializa datos en el nuevo ámbito.

Ante fallos de red se conservan las operaciones y se aplica retroceso exponencial con variación, hasta aproximadamente un minuto. Permisos, esquema y conflictos quedan bloqueados para intervención; «Reintentar sincronización» puede rearmarlos tras corregir la causa. No se inventa un ID nuevo para ocultar un conflicto. Un conflicto bloquea el avance del ámbito hasta su resolución; la copia local y el CSV siguen disponibles.

La recepción consulta el servidor cada cinco segundos mientras hay equipo activo. Recupera partidos, eventos y lápidas; repite la lectura de lápidas y verifica el padre antes de materializar. Une eventos por ID sin reemplazar pendientes locales. Si un partido se elimina durante la lectura, aplica su lápida en lugar de interpretar la denegación de sus eventos como un partido vacío. No se eliminan eventos locales por faltar en una respuesta parcial.

### Estados

| Estado | Condición |
| --- | --- |
| Solo local | Bandera inactiva, sin cuenta/equipo o partido local no importado. |
| Pendiente de sincronizar | Outbox confirmada localmente, espera/reintento u otra pestaña trabajando. |
| Sincronizando | Trabajador enviando operaciones o reconciliando con el servidor. |
| Sincronizado | Outbox del ámbito vacía, sin cambios locales nuevos durante el ciclo y recuperación completa confirmada por el servidor. |
| Error de sincronización | Fallo remoto, permisos o conflicto; no equivale a Error al guardar en IndexedDB. |

El estado es del ámbito seleccionado, por lo que pendientes de otro partido del mismo equipo mantienen el estado pendiente. Estar online, ver una cuenta o recibir un snapshot de caché no produce Sincronizado. Se mantiene separado el indicador de guardado local.

## Política de conflictos y borrados

- **Dos dispositivos registran:** unión por IDs criptográficos; cada evento es un documento inmutable. No se sincroniza un array completo ni estadísticas almacenadas.
- **Mismo ID y contenido:** reintento reconocido. **Mismo ID y otro contenido:** conflicto visible, sin sobrescritura.
- **Deshacer:** afecta al último evento vivo ya persistido/materializado en ese dispositivo, por orden técnico local. Captura el ID en la transacción; un evento remoto que llegue después no cambia el objetivo. Dos dispositivos que deshacen el mismo ID producen una sola lápida.
- **Orden:** se conserva el significado local de Deshacer. Los eventos recibidos nuevos se incorporan ordenados por fecha de aceptación del servidor e ID, y reciben orden técnico local una vez. El acuse no reordena eventos ya materializados. No se usa la hora de los dispositivos para resolver conflictos; el payload/seq histórico se conserva para CSV. Esta decisión sustituye la propuesta provisional de reordenar todo el conjunto en 8A.
- **Borrado frente a alta tardía:** domina la lápida. Puede crearse antes del alta de partido/evento. El servidor deniega reactivar el documento o escribir eventos bajo un partido eliminado. El cliente conserva además las lápidas y no reactiva una copia local borrada al recibir datos anteriores.
- **Cambiar de cuenta/equipo:** invalida generación, tareas y selección; detiene trabajador y vacía la vista. La outbox antigua permanece ligada a su proyecto/UID/equipo. Una respuesta en vuelo puede haber sido aceptada bajo la cuenta anterior, pero no se aplica a la cuenta nueva; el reintento posterior reconocerá el commit.
- **Copias locales importadas:** quedan como originales conservados, no como una vía alternativa para registrar sin cola. Los registros desconocidos/incompatibles se señalan y no se importan recortando campos.

Las lápidas no tienen TTL ni se eliminan. No se ofrece restaurar un borrado ni editar jornada/rival; esos comportamientos no existían en el flujo deportivo. Las estadísticas se calculan con los eventos vivos del partido activo. El CSV conserva los IDs deportivos originales, también cuando el identificador técnico del partido se ha transformado para importar un histórico.

## Asistente de importación

1. Iniciar sesión y seleccionar o crear equipo. Los datos sin vínculo no se suben al iniciar sesión.
2. Pulsar **Revisar partidos locales**. Se muestran cuenta, equipo, proyecto, jornada, rival y volumen de eventos. No hay casillas seleccionadas inicialmente.
3. Revisar incidencias de formato histórico; los registros incompatibles no se seleccionan ni se reescriben para forzar el contrato remoto.
4. Elegir partidos y pulsar **Confirmar subida de los seleccionados**, o cancelar sin cambiar vínculos/cola.
5. El manifiesto/vínculo y sus operaciones se crean atómicamente después de releer y comprobar que los datos revisados no han cambiado. Si cambia la cuenta o el conjunto, se requiere revisar otra vez.

La identidad de origen se genera una vez con criptografía y se guarda transaccionalmente. Los IDs importados son SHA-256 de una representación canónica con origen, tipo y claves locales, incluyendo partido/ID/seq para eventos. Repetir la importación utiliza el mismo vínculo y no vuelve a enviar eventos eliminados. Otro navegador con una copia histórica de procedencia desconocida no se une por rival/jornada: tiene otro origen y se revisa como copia distinta. Una descarga de nube conserva sus IDs remotos, no pasa por este asistente.

## Seguridad y pruebas

El contrato de Firestore es el de `firestore.rules`: equipos/miembros/partidos/eventos/eventDeletions, versión 1. Se usa creación atómica de equipo + propietario; los eventos solo se envían después de su partido; cada transacción remota modifica un documento. No se necesitan reglas públicas, permisos adicionales, índices nuevos ni cambio de las reglas publicadas. Ningún control de acceso depende solo del cliente.

La afirmación del propietario de que las reglas están publicadas no se toma como prueba de su comportamiento. Se ha contrastado el archivo local contra Firestore Emulator con la matriz de permisos y con los envíos reales del adaptador. La versión desplegada y su comportamiento real siguen requiriendo la validación delimitada y autorizada descrita abajo. No se escribe en el proyecto real para comprobarlos sin permiso.

```text
npm run test:reglas
npm run test:sync
node tools/firebase/default-off.test.mjs
```

`test:sync` arranca Auth y Firestore Emulator para `demo-defensas`, loopback y sin credenciales reales. Usa SDK oficial 12.11.0 y perfiles Chromium efímeros; A/B tienen IndexedDB diferentes y las pestañas comparten almacenamiento solo cuando se prueba esa condición. La configuración ficticia se inyecta en pruebas; `sync-config.js` no se activa en disco.

Resultados: `.test-artifacts/firebase/sync.json`, `sync.txt` y capturas `sync-review-*.png`/`sync-ui-*.png`. Veinte grupos correctos: recuperación A→B, registro simultáneo, offline/recarga, Deshacer, borrado tardío, reenvío tras perder acuse, aborto de outbox, importación repetida/histórico, aislamiento de cuenta/equipo/proyecto, arrendamiento, actualización aditiva v1→v2, reintento/backoff, conflicto de payload, confirmación no anticipada, respuesta tardía tras cambio de cuenta y asistente/UI completos.

Las siete suites Node deportivas pasan. La prueba local con configuración de Authentication real conserva registro, doble toque, recarga, Deshacer y CSV ante SDK disponible, bloqueado y detenido; no utiliza Firestore. Bandera OFF verificada en raíz y subruta Pages: esquema v1, sin controles de sincronización ni importación/consulta Firestore. Capturas del asistente inspeccionadas a 1024 y 320 px; tres anchos comprobados, sin desbordamiento horizontal. El rojo de las capturas es el aviso del SDK de emulador, no un estilo nuevo de la aplicación.

## Validación real con dos dispositivos — preparada, sin ejecutar

**Autorización necesaria:** permiso explícito para crear un equipo nuevo llamado `PRUEBA 8B` en `registro-defensivo`, su miembro propietario y exclusivamente partidos/eventos ficticios de esa prueba, incluidas sus lápidas. No autoriza importar partidos reales ni activar la sincronización publicada. Se usarán perfiles/orígenes de prueba vacíos y se anotará el ID del equipo creado para no tocar otro.

1. Confirmar en consola el proyecto/base `(default)` y que las reglas desplegadas coinciden con el archivo validado; conservar copia/hash y fecha. No modificar las reglas para facilitar la prueba.
2. Preparar dos navegadores/dispositivos de prueba, sin registros deportivos reales. Para iPad hace falta un origen HTTPS accesible y autorizado: localhost del iPad no es el ordenador. Publicar un entorno de prueba o exponerlo requiere su autorización separada; no se crea un túnel automáticamente.
3. En esa copia de desarrollo, y solo después del permiso de escrituras, usar `enabled: true`, `emulator: false`, `allowRealWrites: true`. La configuración entregada permanece en false/false/false.
4. Iniciar sesión con el mismo propietario en A/B. A crea `PRUEBA 8B`; B selecciona su mismo ID. Crear en A un partido `PRUEBA-A` contra `Rival ficticio`, registrar un tiro y esperar Sincronizado. B lo selecciona y verifica el mismo evento y metadatos.
5. Registrar desde ambos; interrumpir conexión de B, registrar, recargar con cola pendiente y reconectar. Verificar unión sin duplicados y no declarar sincronizado mientras falte acuse.
6. Deshacer un evento y verificar su desaparición en B. Después dejar B con un tiro pendiente y eliminar el partido desde A; reconectar B y verificar que el padre y el tiro no reaparecen.
7. Con una cuenta externa de prueba, comprobar que no aparecen ni pueden leerse los datos de ese equipo. No concederle membresía ni elevar permisos para realizar la comprobación. Contrastar también las denegaciones sin sesión.
8. Importar solo otro partido ficticio del perfil de prueba, cancelar primero y confirmar después; repetir y comparar IDs/volumen. Conservar sus originales y revisar que otra cuenta no los recibe.
9. Documentar equipo/IDs, navegadores, fechas, cada resultado y la versión de reglas. Volver a desactivar las banderas al terminar. No borrar físicamente las lápidas de prueba: una limpieza definitiva necesitaría autorización y podría invalidar la prueba de no resurrección.

## Riesgos y límites

- La validación real de reglas y la prueba de dos dispositivos físicos/Safari están pendientes; Emulator/Chromium no las sustituyen.
- Solo propietario. Invitaciones/entrenadores adicionales siguen denegados por servidor.
- Se consulta el conjunto del equipo cada cinco segundos, sin paginación ni worker en segundo plano. Adecuado para validar esta fase; equipos grandes requieren revisar consumo/latencia. Al cerrar la web no se promete seguir enviando; la cola se reanuda al abrir.
- Un conflicto de contenido o permiso bloquea la cola del ámbito y requiere revisar su causa. No existe una interfaz para sobrescribir, fusionar manualmente o descartar datos en conflicto.
- IndexedDB depende de cuota/retención del navegador. Borrar el sitio elimina pendientes aún no enviados. CSV no es importación ni restauración del motor.
- Copias antiguas de distintos navegadores sin procedencia común no se deduplican por nombres; el asistente conserva esa distinción para evitar unir partidos diferentes.
- Las lápidas se conservan indefinidamente. Su compactación, borrado definitivo y política de retención requieren otra decisión.

Se detiene para revisión. Ni el despliegue de reglas confirmado por el propietario ni esta entrega activan Firebase real o autorizan publicar la aplicación.
