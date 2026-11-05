# Correspondencia del contrato con las filas de IndexedDB de 23.0

Revisión estática de b0bc47ec848d68977c52b9b3206d11cbee66a94e. No se abren bases, perfiles o servicios. Las filas del JSON son representaciones normalizadas; no se presentan como filas literales reinsertables. Los ejemplos de [compatibility.test.mjs](compatibility.test.mjs) son inventados, sin lector ni adaptador de captura.

Fuentes: [persistencia.js](../../js/persistencia.js), [sync-storage.js](../../js/sync-storage.js), [configuracion-guardada.js](../../js/configuracion-guardada.js), [panel-model.js](../../js/panel-model.js) y [registro.js](../../js/registro.js). Consultar creación de esquema, enqueue, failOperation, retryOperations, mergeRemote, purgeAccountData e importLegacy. No se importan ni ejecutan esos módulos en las pruebas nuevas.

## Reglas de normalización propuestas

«Literal» conserva el valor deportivo o metadato semántico de una fila. «Derivado» designa un campo del contrato calculado a partir de claves/otras filas o una constante explícita. Ninguna derivación modifica la fuente. Un campo fuente inesperado, inválido o irrepresentable no se descarta ni se corrige: una captura futura deberá rechazarlo o declarar la omisión y dejar de ser completa.

Los nueve almacenes solo se conocerían por una futura captura consistente. Aquí se valida un documento ficticio ya construido: no se presupone un snapshot real ni un recibo de nube.

| Origen / clave e índices reales | Campos de origen conservados | Representación y campos derivados |
|---|---|---|
| games; keyPath id | id, jornada, rival, createdAt. | localGames conserva esos cuatro campos. No se añade equipo o propietario desde la sesión actual; la propiedad histórica se obtiene de syncMeta cuando existe. |
| events; keyPath seq autoincremental; byUuid(id), byGameId(gameId), byGameSeq([gameId,seq]) | seq y todos los campos deportivos del evento. | localEvents.sourceSeq = fila.seq; payload conserva la fila deportiva, incluido payload.seq = fila.seq. La envoltura es derivada, ambos valores del orden proceden de la misma clave fuente. |
| settings; keyPath key | value del registro de panel, asociaciones y selección según la familia de key. | kind y scope estructurado se derivan de la clave, nunca del equipo actualmente abierto. El puntero de selección se representa como preferencia inactiva. Desglose debajo. |
| cloudGames; keyPath key=[scopeJSON,gameId]; byScope(scope) | gameId remoto, payload completo, deleted; sourceId y panel cuando existen. | scope se decodifica de la tupla JSON y debe coincidir con key[0]; gameId con key[1]. No se copia key porque es reconstruible. cloudState se deriva de intenciones, no del nombre cloudGames. |
| cloudEvents; keyPath seq; byCloud([scope,gameId,eventId]) único, byGame([scope,gameId]) | gameId/eventId remotos, payload completo, deleted y sourceId cuando existe. | sourceSeq = fila.seq; scope es la tupla decodificada. payload.seq, si existe, se conserva sin sustituirlo con fila.seq. La identidad lógica remota y la clave técnica de origen son distintas. |
| cloudTombs; keyPath key; byScope(scope) | gameId y eventId cuando existe. | scope se decodifica; lápida de partido key=[scopeJSON,gameId,""] se representa sin eventId; lápida de evento key=[scopeJSON,gameId,eventId] sí lo conserva. Se contrasta redundancia entre clave y valores antes de normalizar. No es una orden de borrado. |
| syncQueue; keyPath key=[scopeJSON,opId]; byScope(scope) | opId, type, gameId, eventId, payload, sourceId, createdAt y, si existen, baseId, panelVersionId, blocked, error. | scope se decodifica y se contrasta con key, projectId, uid y teamId de la fila. Esos tres últimos campos son redundantes con la tupla y no se duplican. blocked ausente se representa explícitamente como false. executable=false es una constante nueva de seguridad del contrato. Se excluyen attempts/nextAttempt; no se genera cola ejecutable. |
| syncMeta; keyPath key | source.value; legacy-owner.uid/imported si existe; teams.value con id/name; preferred-team.value; active.value. | kind y IDs de cuenta/partido/ámbito se obtienen de cada familia de key. imported ausente permanece ausente; no se confunde con un original ya incorporado. lease:<scopeJSON>, worker y until se excluyen y solo contribuyen al conteo transientRows. |
| syncBindings; keyPath key=[scopeJSON,idLocalOriginal] | scopeJSON, gameId remoto y source. | scope se decodifica y debe coincidir con key[0]. **localGameId se obtiene de key[1]**: no existe como propiedad separada en la fila escrita por importLegacy. gameId no sirve para recuperarlo. La unicidad física es [scope,localGameId]; aparte se comprueba el invariante lógico de una sola incorporación por original y la unicidad del destino. |

## Campos deportivos y de panel

PayloadPartido obligatorio en el contrato: id, jornada, rival, createdAt, conservados literalmente. Es el mismo payload de alta, fila cloud e intención game/delete. No se copian createdAt/createdBy de un sobre Firestore no conservado localmente como si fueran parte de este payload.

PayloadTiro obligatorio: id, gameId, categoria, accion, valor_tiro, resultado, fecha_hora. Los eventos nuevos de makeShotEvent añaden jornada, rival, categoria_id, accion_id, defensa_id, estrategia, tipo_bloqueo y tiros_permitidos. Los históricos pueden carecer de estos últimos; son opcionales en JSON. seq es un orden persistente añadido por IndexedDB a events; importLegacy conserva ese seq dentro del payload importado. addCloudEvent, en cambio, elimina seq de su payload nuevo y usa cloudEvents.seq como clave técnica. El contrato conserva ambas situaciones.

settings se divide de forma 1:1 por fila fuente:

- activeGame → {kind:"active-local",gameId:value}. Es preferencia; no cambia una selección al validar.
- configuracionBotones o configuracionBotones:<scopeJSON> → {kind:"panel-record",scope,record:value}.
- configuracionPorPartido o su variante por scopeJSON → {kind:"game-usage",scope,games:[{gameId,versionIds},…]}. El array exterior reemplaza al mapa; los IDs de sus claves y el orden de cada lista de versiones se conservan.

El RegistroPanel conserva schema, revision, currentId, baselineId, usedIds, versions, updatedAt, origin y syncHead cuando existe. La Versión conserva id, createdAt, source, basedOn, csvHash y doc. DocumentoPanel conserva schema, categorías, acciones/tipos/defensas, nombres, tiros, retired y cells. Los snapshots conservan version y usedIds. No se sintetiza una versión a partir del CSV actual, ni se renombra una versión histórica, ni se interpreta csvHash (FNV en origen) como la huella SHA-256 de respaldo.

Los campos técnicos opcionales sourceId de cloudGames/cloudEvents pueden quedar presentes con valor undefined después de mergeRemote. Al ser ausencia semántica conocida de ese campo, su representación JSON propuesta es propiedad opcional ausente, expresamente documentada. No se generaliza esa regla a payloads deportivos desconocidos ni se convierte undefined en null.

## Operaciones nuevas, errores y bloqueos

enqueue crea attempts=0 y nextAttempt=0, pero **no escribe blocked ni error**. Por eso el requisito blocked:B del JSON no puede describirse como copia literal: el falso de una fila nueva sería derivado por ausencia. El validador sigue exigiendo ese booleano en la representación normalizada; no debe recibir un volcado de syncQueue.

failOperation conserva el payload y persiste attempts, error, blocked y nextAttempt. Un fallo transitorio puede tener error="network" y blocked=false; los códigos permission-denied, invalid-argument o SYNC_CONFLICT producen bloqueo. retryOperations puede dejar blocked=false y error=null. El contrato conserva el código y booleano cuando están presentes, sin ejecutar reintentos. Un blocked presente de tipo no booleano o un código ajeno al perfil no se convierte por coerción: requeriría diagnóstico.

baseId lo añade queuePanel incluso cuando es null. panelVersionId puede existir en eventos nuevos; puede faltar en eventos procedentes de importLegacy. sourceId puede ser cadena vacía para undo; no se inventa una procedencia distinta para hacer que un envío parezca idempotente. createdAt de la operación es un entero de milisegundos, no la fecha del tiro ni una confirmación del servidor.

cloudState se deriva agrupando por [scope,gameId] y por [scope,gameId,eventId]: blocked si alguna intención correspondiente está bloqueada, pending-local-ack si hay intenciones sin bloqueo, cloud-status-unknown si no hay ninguna. La ausencia de blocked en una fila fuente no es estado remoto confirmado; la ausencia de toda la cola tampoco.

## Originales tras cierre y paneles incompletos

purgeAccountData elimina copias cloud, queue, bindings y settings propios del UID; conserva games/events originales marked imported, su legacy-owner y el source global. Es legítimo conservar un original sin binding o destino local. unresolvedImportedOriginals se calcula sobre las filas realmente incluidas y mantiene la incertidumbre; no se utiliza para ofrecer automáticamente otra importación ni para borrar el original.

Los paneles remotos actuales pueden existir sin toda su cadena ancestral local. basedOn/baseId sin documento se declaran en externalBaseVersions; los snapshots íntegros que sí están presentes se conservan. Un partido antiguo sin snapshot puede declararse en missingHistoricalPanels y generar una advertencia. Un uso de un partido ya retirado puede quedar en detachedGameUsage.

Esto no autoriza ocultar una versión obligatoria que falta. currentId, baselineId, syncHead, versiones de uso y panelVersionId necesitan documentos completos, y un conflicto del mismo ID no se resuelve usando otra versión. Una ausencia histórica reconocida es distinta de omitir una fila/versión presente en origen. La validación solo demuestra la coherencia de la declaración, nunca prueba por sí sola que un productor incluyó todo lo que existía.

Las pruebas conservan la aceptación de históricos sin IDs modernos, sin snapshot, con bases externas declaradas y con originales sin copia actual. No cambia el perfil de fechas o límites del parser. Un histórico ajeno a esos tipos sigue requiriendo diagnóstico, no conversión silenciosa.

## Campos que no proceden de un almacén

format/formatVersion, backupId, exportedAt, producer y las versiones conocidas del protocolo describirían al productor y al formato. La aplicación, IndexedDB y contrato son ejes independientes. El prototipo actual solo admite producer.appVersion="23.0"; ampliar la lista de productores compatibles en una revisión futura no exige necesariamente subir el formato 1.0 si la semántica permanece idéntica. No se acepta automáticamente ninguna versión futura.

webOrigin, cobertura seleccionada, exclusiones agregadas, conteos, longitudes canónicas, SHA-256, relaciones ausentes declaradas, kind y executable son metadatos derivados de una futura captura y de decisiones autorizadas. No son un snapshot real en esta fase. lineageId es el source existente o null; no se genera un origen nuevo, no se escribe backupOriginId y no se usa backupId como origen. Permisos, sesiones, leases y órdenes de purga quedan excluidos.

Esta correspondencia resuelve la ambigüedad entre campos fuente y derivados; **no implementa el mapeo de una base real** ni amplía las decisiones funcionales sobre selección, cifrado o recuperación.
