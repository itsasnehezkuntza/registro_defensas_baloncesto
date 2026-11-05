# Contrato técnico candidato de respaldo JSON 1.0 — Fase 26.2

Fecha: 5 de noviembre de 2026. Base exacta: b0bc47ec848d68977c52b9b3206d11cbee66a94e. Datos de referencia: aplicación 23.0. Estado: contrato y prototipo locales, pendientes de revisión e integración.

Este documento define qué acepta el prototipo. No implementa exportación, lectura de IndexedDB, restauración, recuperación persistente, cifrado ni sincronización. «complete» significa coherencia de un documento según este contrato y su alcance declarado; no demuestra exhaustividad de una base real ni capacidad de restauración. El contenido y la autorización declarados por un archivo no se autentican.

El esquema cerrado legible por máquina está en [schema.mjs](schema.mjs), constante BACKUP_SCHEMA. Sus reglas se aplican en [validate.mjs](validate.mjs). Este documento y ambas fuentes forman el contrato: cualquier contradicción bloquea su integración. No hay JSON Schema de terceros ni dependencias añadidas.

La [correspondencia con los nueve almacenes de 23.0](CORRESPONDENCIA_23_0.md) distingue campos literales y derivados. El prototipo recibe la representación normalizada, no un volcado de filas de IndexedDB. No existe adaptador de captura.

## Versiones independientes

La aplicación productora, IndexedDB y contrato JSON tienen versiones independientes: producer.appVersion identifica comportamiento del productor; schemas.indexedDb/origin.databaseVersion identifica la estructura local (1 o 2); formatVersion y producer.contractVersion identifican este contrato (1.0). PanelRecord/PanelDoc y el sobre remoto conocido conservan sus versiones propias.

El lector actual admite solo archivos declarados como producidos por **23.0**, mediante la lista explícita SUPPORTED_APP_VERSIONS. No se aceptan automáticamente versiones futuras de aplicación, IndexedDB, paneles o formato. El formato 1.0 no queda reservado a 23.0 para siempre: una revisión futura podría ampliar los productores compatibles con evidencia y pruebas, conservando 1.0 si su semántica permanece idéntica. Si la estructura o significado cambian, se necesitará evolucionar el contrato, sin aceptar silenciosamente una versión desconocida.

## 1. Entrada y tipos comunes

Entrada del validador: texto JSON en memoria, mediante validateBackup(text). No acepta un objeto ya parseado, porque ya podría haber perdido claves repetidas. Un futuro lector de archivos deberá decodificar UTF-8 con errores fatales; aquí no se leen archivos del usuario ni se detectan errores de bytes previos a recibir un string.

- UTF-8, sin BOM, sin comentarios, claves repetidas, comas finales ni valores adicionales tras el documento.
- Objetos cerrados: cada campo enumerado es obligatorio salvo que aparezca con «?». Campos adicionales se rechazan en cualquier nivel; no se eliminan silenciosamente.
- S: string Unicode bien formado, longitud en unidades UTF-16. ID: S de 1 a 256. No son rutas de disco ni permisos. null significa ausencia conocida; un campo opcional ausente se conserva ausente.
- N: entero seguro no negativo, de 0 a 9007199254740991. N+: de 1 al mismo máximo. En el **texto del contrato** se exige notación decimal simple 0 o [1-9][0-9]*: no exponentes, decimales, signo ni -0. Así se rechaza antes de perder precisión, incluso 9007199254740993 o 1e-9999. Este perfil de la aplicación es deliberadamente más restrictivo que JCS general.
- B: booleano, sin conversión desde texto o números. UTC: string exactamente YYYY-MM-DDTHH:mm:ss.sssZ y fecha calendárica válida. No se normalizan ni sustituyen valores originales.
- Cuenta: [projectId,uid], dos ID. Ámbito: [projectId,uid,teamId], tres ID; ámbito local: null. No se concatenan strings con separadores ambiguos.
- V: ID de versión de 1 a 128, patrón cfg-[a-zA-Z0-9-]+. H: 64 dígitos hexadecimales minúsculos.
- Los arrays de filas admiten hasta 100000 elementos salvo límites particulares. También rigen límites globales del prototipo: 8 MiB de texto UTF-8, profundidad 64, 200000 valores y 262144 unidades UTF-16 por string. No son una garantía de rendimiento en Safari; se deben medir antes de integrar.
- El texto de rival, acción, categoría o nombre permanece texto. El validador no hace HTML, eval, Function, revivers ni ejecución de expresiones. No invoca getters, toJSON ni proxies al canonicalizar objetos de pruebas.

## 2. Encabezado completo

| Campo de raíz | Forma obligatoria |
|---|---|
| format | String fijo registro-defensivo-backup. |
| formatVersion | {major:1,minor:0}. Solo 1.0 admitido; no se acepta automáticamente un minor futuro. |
| backupId | UUID v4 minúsculo; identifica esta copia, no el origen ni sus entidades. |
| exportedAt | UTC declarada por el productor, no fecha certificada. |
| producer | {appVersion:"23.0",buildId:S(1..128) o null,sourceCommit:S hexadecimal minúsculo de 40,contractVersion:"1.0"}. Es procedencia declarada, no prueba de que se ejecutó ese código. |
| origin | {webOrigin:S(1..2048) o null,databaseName:"registro_defensivo_baloncesto",databaseVersion:1 o 2,lineageKind:"sync-source" o "unresolved",lineageId:ID o null}. |
| schemas | {indexedDb:1 o 2,panelRecord:1,panelDoc:1,remoteEnvelope:1}. indexedDb debe igualar origin.databaseVersion. remoteEnvelope indica el contrato conocido; no afirma poseer sobres remotos completos. |
| coverage | Objeto del apartado 3. |
| manifest | Objeto del apartado 4. |
| data | Exactamente las nueve secciones del apartado 5; todas arrays, incluidas las vacías. |
| integrity | {algorithm:"SHA-256",canonicalization:"RFC8785",digest:H}. |

webOrigin solo admite un origin HTTP(S) exacto, sin credenciales, ruta, query, fragmento ni barra final. null se admite si se desconoce. No se guarda URL completa, huella del dispositivo, correo, avatar ni configuración Firebase. Tampoco se guarda el texto fuente de categorias.csv: no forma parte de IndexedDB. Se conserva csvHash original de las versiones y el contexto de build. Un futuro recurso de evidencia de CSV necesitaría una extensión expresa del contrato.

Si metadata contiene source, lineageKind debe ser sync-source y lineageId exactamente ese valor. Si no lo contiene, ambos son unresolved y null. El validador no genera identificadores de origen, no escribe backupOriginId y no usa backupId como sustituto. Una base histórica v1 sin source puede ser una captura local completa con advertencia ORIGIN_UNRESOLVED; **no se acredita identidad portable entre diferentes archivos**. Resolver origen persistente antes de integrar deduplicación entre copias requiere decisión funcional; jamás introducir esa escritura dentro de una operación anunciada como readonly.

## 3. Cobertura y límites explícitos

Campos obligatorios de coverage:

| Campo | Tipo y regla |
|---|---|
| account | Cuenta o null. Es una declaración; el prototipo no autentica ni verifica autorización real. |
| includedScopes | Array no vacío, sin duplicados, máximo 1024; cada ámbito no nulo debe coincidir en proyecto/UID con account. v1 solo admite null. Los datos locales requieren null incluido. |
| excluded | Hasta dos objetos {reason:"other-account" o "not-selected",scopeCount:N+}; cada motivo aparece una vez. No incluye UID, nombre, equipo ni datos de los excluidos. |
| localSnapshotComplete | B. false siempre impide estado complete. true no sustituye verificaciones ni prueba exhaustividad externa. |
| remoteInventory | String fijo not-performed. No se afirma copia de Firestore ni de todos los equipos/dispositivos. |
| omissions | Array de {section:nombre de sección,count:N+,reason:"read-error" o "unsupported-row" o "not-captured"}. Sin duplicar sección/motivo. Cualquier omisión impide complete. |
| missingHistoricalPanels | Array sin duplicados de {store:"games" o "cloudGames",scope:ámbito local o remoto,gameId:ID}. Debe coincidir exactamente con partidos sin panel disponible en los datos locales descritos. |
| unresolvedImportedOriginals | Array de ID sin duplicados: originales marcados imported que carecen de binding local. Coincidencia exacta con el documento. |
| detachedGameUsage | Array sin duplicados de {scope,gameId}: entradas de uso de panel cuyo partido ya no está en la captura. Coincidencia exacta. |
| externalBaseVersions | Array sin duplicados de {scope,versionId:V}: basedOn o baseId necesarios pero no materializados localmente. No sustituye una versión obligatoria de currentId/baselineId/syncHead, un uso de partido o panelVersionId de tiro. |

Los cuatro últimos campos describen limitaciones históricas conocidas. Una captura puede incluir todos los datos locales y conservar un original cuya copia actual fue purgada, usos residuales de partidos borrados o ancestros de panel nunca descargados. Esa captura puede ser complete con advertencias; no se inventan los datos ausentes y no se afirma restauración íntegra del pasado.

En cambio, un evento cuyo padre debería estar incluido, un puntero a una versión usada sin documento, una lápida omitida o una relación rota no se justifican añadiéndolos a estos campos: se rechazan como incomplete. El validador contrasta cada declaración contra su función concreta.

La propuesta funcional es limitar copias a ámbitos locales autorizados y declarar otras cuentas sin exponerlas. No está aprobada la política de selección ni el rescate de una cuenta inaccesible. Este módulo valida declaraciones ficticias y coherencia; no implementa acceso por UID.

## 4. Manifiesto e integridad

manifest tiene exactamente requiredFeatures, stores, sections y totals.

requiredFeatures es el array exacto y ordenado: ["inactive-intents","local-snapshot","panel-history","source-seq","tombstones"]. Una capacidad desconocida produce incompatible; quitar una obligatoria produce incomplete. No se ignoran extensiones por tener un minor mayor.

stores tiene exactamente los nueve nombres de almacén de origen. Cada valor es {present:B,read:"complete"|"incomplete"|"absent",sourceRows:N,excludedRows:N,transientRows:N,omittedRows:N}. La correspondencia de una fila normalizada a una fila fuente es 1:1, también para settings y metadata; no se expanden equipos ni versiones en filas nuevas del manifiesto.

Para cada almacén:

sourceRows = filas de la sección + excludedRows + transientRows + omittedRows.

omittedRows debe ser la suma de omissions.count de esa sección. excludedRows positivo exige excluded no vacío. Solo syncMeta puede declarar transientRows (concesiones lease que no se copian). Otros campos desconocidos no se clasifican como temporales por conveniencia: generan captura incompleta/no compatible hasta disponer de un adaptador aprobado.

En v1 solo games/events/settings están presentes y leídos; los otros seis descriptores deben ser absent, present=false y todos sus conteos/secciones cero. En v2 los nueve deben estar presentes con read=complete para aceptar complete. No se ejecuta ninguna apertura ni migración para comprobarlo: es el contrato del documento.

sections tiene exactamente los nueve nombres de sección. Cada valor es {count:N,bytes:N,sha256:H}: número de filas, bytes de UTF-8(JCS(array)) y SHA-256 de esos bytes. Incluye arrays vacíos. El hash no incluye separadores de archivo, BOM ni formato visual.

totals tiene todos y solo estos campos N:

| Total | Definición |
|---|---|
| representations | localGames.length + cloudGames.length, incluidos padres borrados y originales. |
| logicalGames | representations - bindings.length; solo se agrupan representaciones con vínculo explícito validado. Un original sin binding cuenta separado, sin inferir coincidencia por nombre. |
| originals | localGames marcados imported=true por legacy-owner. |
| localEvents / cloudEvents | Filas físicas de cada sección. |
| originalEvents | Tiros locales de originales imported, contados como archivo histórico, no vivos dos veces. |
| deletedEvents | Tiros cloud con deleted=true o padre deleted=true; cada fila cuenta una vez. |
| liveEvents | localEvents - originalEvents + cloudEvents - deletedEvents. No representa estadísticas de temporada. |
| tombstones | Filas de lápidas, incluso una lápida cuyo tiro aún no se recibió. |
| teams | Equipos distintos por [proyecto,UID,equipo] en ámbitos incluidos o cachés de equipos del documento. Un equipo sin nombre se conserva por referencia; la caché no concede permiso. |
| versions | Versiones distintas por [scope,version.id] en registros completos, snapshots o intenciones de panel. Repeticiones idénticas no suman otra versión; contenidos diferentes con igual ID se rechazan. |
| pending / blocked | Número de intenciones y subconjunto blocked=true. |

Hash global: SHA-256 de UTF-8(JCS(documento completo **sin la propiedad raíz integrity**)). Se incluyen el manifiesto, origen, cobertura y datos. No hay autorreferencia. Se comprueba global, hashes/conteos por sección y totales semánticos, sin recalcular y sustituir las huellas recibidas.

Un SHA correcto no acredita autenticidad, permisos, fecha ni completitud de una fuente externa. Quien cambia datos y todos sus indicadores puede recalcular las huellas. Tampoco se detectan filas que el productor omitió y contabilizó coherentemente como inexistentes. No se firma ni cifra en este prototipo.

## 5. Nueve almacenes y nueve secciones cerradas

Se concreta la propuesta normalizada de 26.1 en nueve arrays, uno por almacén: mejora el balance de filas fuente y evita duplicar metadatos entre secciones. No es un volcado literal ejecutable ni una promesa de poder reinsertar sus filas.

| Origen | Sección | Fila admitida y orden estricto |
|---|---|---|
| games | localGames | PayloadPartido; identidad id; orden por JCS([id]). |
| events | localEvents | {sourceSeq:N+,payload:PayloadTiro}; identidad UUID deportivo global; orden sourceSeq creciente sin repetir. payload.seq debe existir e igualar sourceSeq. |
| settings | settings | Unión discriminada del apartado 7; identidad/orden JCS([kind,scope o null]). |
| cloudGames | cloudGames | {scope,gameId:ID,payload:PayloadPartido,deleted:B,sourceId?:S(0..256),panel?:Panel,cloudState:Estado}; identidad/orden JCS([scope,gameId]). |
| cloudEvents | cloudEvents | {sourceSeq:N+,scope,gameId:ID,eventId:ID,payload:PayloadTiro,deleted:B,sourceId?:S(0..256),cloudState:Estado}; identidad [scope,gameId,eventId]; orden sourceSeq global creciente sin repetir. |
| cloudTombs | tombstones | {scope,gameId:ID,eventId?:ID}; ausencia de eventId = lápida de partido; identidad/orden JCS([scope,gameId,eventId o null]). |
| syncQueue | pendingIntents | Unión del apartado 8; identidad/orden JCS([scope,opId]). No es una cola activable. |
| syncMeta | metadata | Unión del apartado 9; identidad/orden JCS([kind,gameId o scope o account o null]), según variante. |
| syncBindings | bindings | {scope,localGameId:ID,gameId:ID,source:ID}; identidad fuente compuesta [scope,localGameId], orden JCS de esa tupla. localGameId se deriva de key[1] de la fila fuente, no de gameId remoto. Se comprueban aparte los invariantes de un solo destino por original y destino [scope,gameId] único. |

Comparación de claves de orden: lexicográfica por unidades UTF-16, sin localeCompare. Los arrays superiores se presentan ya ordenados; el validador rechaza reordenaciones incluso si se recalculan todos los hashes. Arrays internos (versiones, uso, equipos, acciones, etc.) conservan su orden; no se ordenan como efecto de JCS. requiredFeatures tiene su orden fijo propio.

No se exportan los índices ni generadores de claves: son estructura de la base, no contenido deportivo. Las claves fuente compuestas se derivan de los campos de fila y ámbito, usando la serialización de scope del código 23.0; no se copian claves arbitrarias.

### 5.1 PayloadPartido

Exactamente {id:ID,jornada:S(1..256),rival:S(1..1024),createdAt:UTC}. Jornada y rival deben contener texto no vacío tras trim. Los originales se preservan sin renombrar ni modificar IDs o fecha.

### 5.2 PayloadTiro

Obligatorios: id:ID, gameId:ID, categoria:S(1..256), accion:S(1..256), valor_tiro:2 o 3, resultado:"anotado" o "fallado", fecha_hora:UTC. Categoría/acción no pueden ser solo espacios.

Opcionales: jornada:S(1..256), rival:S(1..1024); categoria_id, accion_id, defensa_id, estrategia, tipo_bloqueo: ID o null; tiros_permitidos: array de 2/3 sin repetidos, de longitud 1..2 e incluyendo valor_tiro; seq:N+.

No se exige que los IDs/nombres históricos sigan presentes en el panel actual. Retirar o renombrar acciones no invalida sus tiros. Los campos ausentes se conservan ausentes; no se infieren IDs ni se reescriben nombres. Este prototipo exige fechas UTC válidas; un histórico con fechas u otros tipos ajenos a este perfil no se transforma en silencio y necesitaría un adaptador/salvamento futuro aprobado.

sourceSeq es la clave técnica local capturada. En cloudEvents, payload.seq puede ser el orden del original importado y **no tiene que igualar sourceSeq**. Ninguna de las dos es una clave de destino; este módulo no asigna claves nuevas ni define Deshacer tras unir dispositivos.

## 6. Identidad remota, linaje, lápidas y estados

Los IDs de ruta remota se guardan separados de payload.id y payload.gameId. Cada tiro cloud debe referenciar un padre por [scope,gameId], y payload.gameId debe igualar el payload.id de ese padre. No se exige que gameId remoto iguale payload.id, ni que eventId remoto iguale payload.id.

Un binding exige original local existente, legacy-owner con imported=true y copia cloud existente con payload idéntico a la cabecera original. source debe igualar metadata.source. Se verifican las identidades de la importación 23.0:

- gameId remoto = "g_" + SHA-256(JCS([1,source,"game",localGameId])).
- eventId remoto del original = "e_" + SHA-256(JCS([1,source,"event",localGameId,idOriginal,sourceSeqOriginal])).

En estas listas de primitivas, JCS produce el mismo texto que la canonicalización actual de Sync. Cada evento del original vinculado necesita copia actual con payload idéntico o lápida para esa ruta. Puede haber tiros posteriores en la copia actual; no se sustituye con el original ni se fusiona automáticamente. Una coincidencia de nombre, jornada, hora o resultado no demuestra identidad.

deleted de cada fila cloud debe coincidir con su propia lápida conocida. Un padre eliminado conserva su lápida de partido; no hace falta crear lápidas por cada hijo. Un tiro marcado deleted exige lápida de tiro. La lápida puede existir sin una fila de evento, pero no sin el padre del ámbito. Son marcas inactivas: no activan borrado ni reactivación.

Estado solo admite:

| Valor | Criterio verificable en el archivo |
|---|---|
| blocked | Hay intención blocked=true de esa entidad. |
| pending-local-ack | Hay intención de esa entidad y ninguna bloqueada. Puede haber sido aceptada por servidor sin acuse local. |
| cloud-status-unknown | No hay intención local correspondiente. No significa sincronizado. |

Para padre se consideran todas las intenciones de su scope/gameId; para tiro solo las que además coinciden en eventId. La plantilla @configuration no es un partido. No se acepta cloud-verified-at ni otro estado de confirmación: 23.0 no conserva una prueba duradera suficiente por fila y este prototipo no consulta el servidor. syncHead es un puntero de protocolo y puede estar pendiente.

## 7. Settings y paneles completos

Variantes exactas de settings:

- {kind:"active-local",gameId:ID}: corresponde a settings.activeGame. Debe existir el partido local. Es preferencia, nunca selección automática en destino.
- {kind:"panel-record",scope:ámbito o null,record:RegistroPanel}: corresponde a configuracionBotones o configuracionBotones:<scope>.
- {kind:"game-usage",scope:ámbito o null,games:[{gameId:ID,versionIds:[V,...]}]}: corresponde a configuracionPorPartido o su variante por scope. IDs de partido y listas sin repetidos; cada lista no vacía. Toda versión usada debe estar completa en el RegistroPanel de ese ámbito. Uso cuyo partido ya no existe requiere detachedGameUsage.

RegistroPanel tiene schema:1, revision:N+, currentId:V, baselineId:V, usedIds:IdsUsados, versions:[Versión,...] (máximo 4096), updatedAt:UTC, origin:"local"|"cloud", syncHead?:V|null. No se repiten IDs de versión y todos los punteros no nulos deben apuntar a versions.

Panel = {version:Versión,usedIds:IdsUsados}. Cada snapshot y cada intención de panel lleva su versión completa, no solo el ID. La misma identidad [scope,version.id] solo admite contenido idéntico. Se preservan todos los elementos de versions, incluidos los retirados; no solo currentId.

Versión = {id:V,createdAt:UTC,source:"csv"|"editor"|"restore",basedOn:V|null,csvHash:S(1..128)|null,doc:DocumentoPanel}. csvHash se conserva como dato de origen (en 23.0 puede ser FNV de 32 bits), nunca como hash de integridad del respaldo. Los ancestros ausentes deben declararse exactamente como externalBaseVersions. Ciclos entre versiones disponibles se rechazan.

IdsUsados = {actions:[I,...],defenses:[I,...]}, cada lista única, máximo 4096. I es string 1..128 con patrón [a-z][a-z0-9_-]*. No se reutilizan identidades de acciones/tipos entre secciones ni IDs dentro de cada lista. Cada elemento del panel debe aparecer en usedIds de su clase.

DocumentoPanel = {schema:1,categories:[Transición,Estático,Directo]} con ese orden exacto:

- Transición = {id:"transicion",name:S(1..80),items:[Elemento,...]}.
- Estático = {id:"estatico",name:S(1..80),items:[Elemento,...]}.
- Directo = {id:"directo",name:S(1..80),types:[Elemento,...],defenses:[Elemento,...],cells:{"tipoId/defensaId":[2,3],...}}.
- Elemento = {id:I,name:S(1..40),shots:[2 y/o 3],retired:B}. name no puede ser solo espacios; shots no vacío, sin repetidos. Cada lista hasta 128; se conserva su orden, aunque no sea un panel editable en el dispositivo destino.
- cells admite solo claves de dos I separados por / y tiros 2/3 sin repetidos; [] es una excepción que deshabilita combinación. Tipo y defensa deben existir. No se aceptan campos extra en categorías o elementos.

La envoltura Panel no puede superar 131072 bytes canónicos en este contrato. El prototipo verifica estructura histórica y referencias, no calcula espacio táctil ni permite editarlo. Tampoco exige acciones activas en paneles archivados ni compara tiros antiguos contra el CSV actual. Las futuras comprobaciones de edición pueden ser más restrictivas sin reescribir históricos.

Para la cobertura de paneles locales se aplica uso[partido].at(-1), o baselineId si hay tiros, o currentId si no los hay. Un partido cloud se considera con panel disponible solo si contiene su snapshot íntegro. Un panel histórico genuinamente ausente se declara, sin suplirlo con CSV actual ni afirmar reconstrucción.

## 8. Intenciones pendientes inactivas

Campos comunes obligatorios: opId:ID, scope, type, gameId:ID, eventId:ID|null, payload, sourceId:S(0..256), createdAt:N (milisegundos originales), blocked:B y executable:false. Opcional error:S(1..128) de patrón [a-zA-Z0-9_./-]+ o null; una intención bloqueada exige un código no vacío. No se incluyen mensajes arbitrarios de excepción.

blocked obligatorio describe el JSON normalizado: enqueue de 23.0 no escribe ese campo en operaciones nuevas. Su ausencia fuente se representaría explícitamente como false; si existe, se conserva el booleano. error puede faltar, existir con bloqueo o contener un fallo transitorio con blocked=false; tras un reintento puede ser null. No se introducen esas propiedades en la fila fuente ni se añade una cola ejecutable. executable=false es una constante del contrato, no un dato persistido por 23.0.

| type | payload y campos específicos |
|---|---|
| game | PayloadPartido idéntico al padre local cloud; eventId=null. |
| delete | PayloadPartido idéntico al padre, que debe estar eliminado; eventId=null. |
| event | PayloadTiro idéntico a la fila cloud del eventId; panelVersionId?:V|null. Si no es null debe estar disponible como versión completa. |
| undo | payload=null, eventId obligatorio y lápida de tiro existente, aunque aún no exista el evento. |
| panel | Panel completo; baseId:V|null obligatorio, eventId=null; padre existente. sourceId=version.id. |
| default-panel | Panel completo; baseId:V|null obligatorio, eventId=null; gameId exactamente @configuration. sourceId=version.id. |

Otras operaciones no pueden usar @configuration como partido. baseId externo requiere declaración. Se rechazan ciclos entre dependencias de intenciones de igual tipo/ámbito/partido y una misma versión pendiente con bases incompatibles. No se obliga a que basedOn y baseId sean iguales: son referencias con funciones diferentes en el protocolo vigente.

sourceId se conserva: el transporte actual lo compara junto con payload. Para altas/tiros, si la fila cloud ya tiene sourceId, debe coincidir con el de su intención. Mantener identidad no significa dar permiso para reenviar. attempts, nextAttempt, leases, worker y programación de reintentos son campos prohibidos; no hay transporte ni función de envío en este módulo. No se elimina ni desbloquea nada al validar.

## 9. Metadata y preferencias, sin órdenes operativas

Cada fila corresponde a una clave fuente, reconstruible de la variante:

| kind | Campos exactos además de kind | Clave fuente |
|---|---|---|
| source | value:ID | source. Única y estable si existe; no se aprovisiona. |
| legacy-owner | gameId:ID,uid:ID,imported?:B | legacy-owner:<JSON idPartido>. Partido local existente y UID igual a coverage.account[1]. |
| teams | account:Cuenta,teams:[{id:ID,name:S(1..120)},...] | teams:<JSON Cuenta>. IDs de equipo sin duplicados; cuenta declarada. |
| preferred-team | account:Cuenta,teamId:ID | preferred-team:<JSON Cuenta>. Puede ser una preferencia antigua; no acredita permiso ni presencia en caché. |
| active-team | scope,gameId:ID | active:<scope>. Partido cloud existente; preferencia inactiva en la copia. |

source es metadata global de procedencia; se trata como privado. No se incluyen leases. Los registros originales conservados tras cierre pueden seguir teniendo imported=true aunque syncBindings se haya purgado; se exige declararlos en unresolvedImportedOriginals, no inventar destino ni tratarlos como nuevos partidos para subir.

No hay sección de localStorage: modo de cuenta, ofertas ya vistas, avisos entre pestañas y purgas pendientes quedan fuera del contrato. No se enumeran bases ajenas. No se copian sesiones de Auth, ACL, membresías, roles, perfiles o asignaciones de supervisión. Las preferencias admitidas aquí no son acciones de restauración.

## 10. Canonicalización y rechazo

[RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.txt): el prototipo emite claves de objetos en orden UTF-16, conserva arrays, usa la serialización de primitivas ECMAScript y rechaza Unicode no válido, NaN, infinitos y objetos ajenos a JSON. No normaliza Unicode. Emite los pares clave/valor directamente: reconstruir un objeto ordenado y pasarlo a JSON.stringify volvería a ordenar claves enteras de otra manera.

Las pruebas usan los 24 valores finitos del apéndice B, casos no finitos, el orden de propiedades de 3.2.3 y los bytes esperados de 3.2.4. La canonicalización genérica permite números binarios64 que el perfil deportivo rechaza; ambas capas se prueban separadamente. Es evidencia por vectores conocidos, no certificación formal ni auditoría de seguridad.

El parser realiza descenso recursivo y registra las claves decodificadas antes de crear cada objeto; a y \\u0061 son la misma clave. JSON.parse solo se emplea para decodificar un literal string ya delimitado, y para claves internas generadas por el propio código, nunca para descartar duplicados del documento de entrada. El canonicalizador no invoca hooks de objetos.

Además de objetos cerrados, se detectan campos de credenciales/ejecución conocidos en cualquier nivel: id/access/refresh token, credentials, password, secret, privateKey, apiKey, auth, cookie, permissions, roles, ownerUid, members, lease, worker, until, attempts, nextAttempt y purgas. Se prohíben las claves __proto__, constructor, prototype y toJSON. Los nombres equivalentes con guiones/guiones bajos se detectan. **No se puede detectar con certeza un secreto camuflado como texto de rival**; esto no sustituye a un productor que use listas explícitas de campos.

validateBackup devuelve un resultado sin incluir los datos completos: status, issues, warnings, summary si completo, restorationImplemented:false y authenticityVerified:false. No escribe ni repara el documento. El prototipo comunica el primer error preciso (code,path,message); no hace una campaña exhaustiva de todos los errores de un archivo ya inválido.

| status | Significado y ejemplos |
|---|---|
| complete | Estructura, versiones, hashes, conteos y relaciones coherentes, sin omisiones declaradas dentro del alcance. Puede tener advertencias históricas precisas. |
| incomplete | Captura parcial, almacén v2 ausente, sección/campo obligatorio ausente, conteo incoherente o referencia/versionado obligatorio faltante. No se acepta como copia completa. |
| incompatible | Formato raíz desconocido, versión major/minor, esquema, appVersion o feature obligatoria futura no soportados. No se hace downgrade. |
| invalid | Sintaxis/duplicados/tipos/números, campo no contemplado/prohibido, hash incorrecto, IDs en conflicto, estado o linaje contradictorio, ciclos u orden incorrectos. |

Precedencia: parseo/límites → datos prohibidos → identificación de formato/versiones → forma cerrada → origen y hash global → manifiesto/hashes por sección → relaciones → totales → complete/incomplete por captura. Por ello un archivo con varios defectos informa del primero. Un texto truncado es invalid/JSON_SYNTAX; sin formato reconocible no se presume que fuera una copia y se responde incompatible/FORMAT. Los errores no acreditan corrupción de una base real.

## 11. Decisiones funcionales abiertas y autorizaciones

Las siguientes son propuestas conservadas para revisión, **no funciones aprobadas para integrar**:

| Propuesta | Decisión y autorización necesarias antes de integrar |
|---|---|
| Copia de todos los ámbitos locales autorizados | Aprobar selección, tratamiento de sin cuenta y exclusiones; definir rescate de otros UID sin exposición automática. El JSON no demuestra autorización. |
| Origen persistente si no hay source | Elegir procedimiento sin generar un UUID por descarga. Cualquier aprovisionamiento supone escritura separada y requiere autorización propia; alternativa actual: unresolved explícito. |
| Primera recuperación local aislada | Aprobar UX y almacenamiento/migración conservadora antes de implementar. Esta fase no crea un área de recuperación. |
| Conservar variantes, sin reemplazo ni fusión automática | Aprobar resolución de conflictos, nuevos IDs técnicos y orden/Deshacer cuando se unan dispositivos. No se toman decisiones por el usuario. |
| Conservar lápidas, originales y linaje | Aprobar alcance histórico y qué datos eliminados serían visibles en una futura recuperación. Nada se reactiva aquí. |
| No restaurar credenciales, permisos, leases o purgas | Restricción técnica de este prototipo y recomendación de seguridad para integración; no se ha implementado un restaurador al que atribuirla. |
| Cola vacía = confirmación desconocida | Hecho del código 23.0 reflejado en contrato; añadir evidencia durable de servidor sería otra capacidad y necesitaría diseño/autorización. |
| Cifrado del archivo | **Política expresamente abierta**: si será obligatorio/opcional, cuándo se implementará, contraseña/custodia/recuperación y compatibilidad. El fixture JSON legible no aprueba distribuir respaldos reales sin cifrar. Un contenedor futuro necesita contrato separado y revisión. |
| Función readonly | Autorización futura para crear adaptador y probarlo solo con bases ficticias; después autorización específica para cualquier acceso a datos reales. |

No hay sustitución destructiva, fusión, resolución automática, permisos restaurados, envío a Firestore ni claves técnicas de destino en el prototipo. La restricción de no ejecutar estas acciones está autorizada en esta fase; las políticas de producto de la futura función siguen pendientes.

## 12. Ejemplos y siguiente paso

Los [ejemplos ficticios](examples/) son documentos estáticos verificables. [fixtures.mjs](fixtures.mjs) solo construye datos inventados y sus huellas en memoria; no es un exportador de la aplicación. [validator.test.mjs](validator.test.mjs) comprueba válidos, incompletos, incompatibles e inválidos, también ataques con hashes recalculados. [jcs.test.mjs](jcs.test.mjs) usa valores esperados independientes.

Comando desde la raíz del clon, sin npm ci:

~~~text
node --test --test-concurrency=1 tests/backup-contract.test.mjs
~~~

Tras revisión, se recomienda otra fase limitada a un adaptador exclusivamente readonly probado con bases ficticias: captura coherente de almacenes presentes, mapeo a estas secciones y diagnóstico de cobertura. No incluir escritura de origen, restauración ni red en ese adaptador. Antes de conectar datos reales deben resolverse alcance/origen/cifrado y obtener la autorización correspondiente. Esta fase se detiene antes de cualquier integración.

La entrada nueva de tests permite que el lanzador nativo existente descubra la batería sin modificar scripts o workflows. Las 147 pruebas originales no cambian; se añaden casos de compatibilidad y volumen. Las mediciones son explícitas y separadas: node tools/backup-contract/benchmark.mjs imprime JSON a stdout con 25/75/225 partidos locales y el mismo número de partidos cloud, tres muestras por caso, sin umbrales de aprobación de tiempo o memoria. La comparación opcional --baseline requiere la ruta a un candidato anterior conservado fuera del repositorio. No se escriben resultados dentro del árbol; logs, medidas y hashes de entrega se conservan externamente. No existen exportación desde IndexedDB, descarga real de respaldo, restauración, cifrado ni reconciliación remota.
