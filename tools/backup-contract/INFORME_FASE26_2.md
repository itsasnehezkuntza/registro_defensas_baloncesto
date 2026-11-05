# Fase 26.2 — Ajustes finales del contrato y validador puro

Fecha: 5 de noviembre de 2026. Base exacta: b0bc47ec848d68977c52b9b3206d11cbee66a94e. Rama local: mantenimiento/fase26-2. Estado: ajustes terminados para revisión; sin commit, push, PR, fusión o despliegue.

## Resultado y alcance

Se mantienen las 147 pruebas originales, sin modificar sus archivos, y se añaden 14 pruebas de correspondencia y volumen: **161 pruebas puras correctas, cero fallidas u omitidas**, con Node v24.21.0. El usuario confirmó por separado la reproducción de las 147 originales con Node 22; esta ejecución ampliada no se presenta como una comprobación propia de Node 22.

El prototipo admite documentos declarados como producidos por 23.0. Valida formato, estructura, versiones, hashes, conteos y relaciones de una representación normalizada ficticia. No existen exportación desde IndexedDB, descarga real de respaldo, restauración, cifrado ni reconciliación remota. Validar un documento no acredita su autenticidad, exhaustividad de una base real ni capacidad de restaurarlo.

Referencias: [contrato JSON 1.0](CONTRATO_JSON_1_0.md), [correspondencia con 23.0](CORRESPONDENCIA_23_0.md), [validador](validate.mjs), [esquema](schema.mjs) y [entrada de pruebas](../../tests/backup-contract.test.mjs). No se modifica código de producción, dependencias, lockfile, Firebase, SDK, CLI, Rules o workflows. La nota de ESPECIFICACION.md describe la herramienta técnica de manera válida también después de una eventual integración; no anuncia una función pública de respaldo.

## 1. Evidencias conservadas fuera de la entrega versionable

check-general.log, pruebas.tap y verificacion.json se trasladaron fuera del repositorio, sin alterar sus bytes y contrastando SHA-256 antes y después. También se conserva una copia externa del candidato anterior para comparar código y rendimiento. No se borra ninguna evidencia original ni se modifica el parche anterior, que sigue siendo un artefacto privado obsoleto para publicación porque incluye esas evidencias.

Los recibos de conservación, registros originales/nuevos, mediciones, inventario con hashes y parches completos se entregan externamente. Ninguno se propone para Git. El informe versionable no enlaza logs externos ni incorpora rutas absolutas del ordenador. El directorio resultados no contiene archivos para versionar. No se ha usado git add.

El diff actualizado es FASE26_2_DIFF_AJUSTES_FINALES_2026-11-05.patch, entregado por separado. Contiene todos los archivos propuestos contra la base autorizada, incluidos los nuevos sin seguimiento; excluye las evidencias de ejecución. El inventario externo detalla sus huellas. El diff anterior se conserva como evidencia, pero no debe usarse para preparar la futura PR.

## 2. Ajustes de rendimiento

Se sustituyeron los recorridos repetidos por índices de memoria creados en cada validación:

| Recorrido anterior | Índice o cambio actual |
|---|---|
| Buscar todos los eventos locales para cada partido y para cada original vinculado | Map gameId → lista de eventos locales. Consulta por clave para existencia y comprobación de originales. |
| Filtrar toda la cola para cada cloudGame | Map [scope,gameId] → estado agregado. Se construye una vez y conserva prioridad de blocked. |
| Filtrar toda la cola para cada cloudEvent | Map [scope,gameId,eventId] → estado agregado. No mezcla ámbitos ni partidos que compartan eventId. |
| Buscar una versión en arrays para cada referencia/uso | Set de IDs de versión por ámbito, con comprobación de la lista concreta de RegistroPanel. |
| includes repetido de usedIds y búsqueda de tipos/defensas por celda | Sets de identidad y WeakMap local para reutilizar usedIds del mismo registro entre versiones. |
| Serializar las claves de cobertura repetidamente desde el comparador de orden | Clave canónica calculada una vez por elemento distinto, ordenación de claves y consulta del Map. |

La parte de agrupación deja de depender de productos entre número de partidos/eventos y longitud de la cola. Los índices ocupan memoria adicional proporcional a sus entradas y contienen referencias/estados, sin clonar payloads. Su vida termina con la llamada; no hay caché persistente ni escritura.

Se mantienen pasadas lineales para totales y metadatos, inspección de cada aparición de un panel y ordenaciones de claves/cobertura. La comprobación de omisiones recorre la lista una vez por cada uno de los nueve almacenes fijos. No se promete tiempo total estrictamente lineal: siguen existiendo parseo, comprobaciones de Unicode, canonicalización, hashes, ordenaciones y comparación íntegra de contenidos con IDs repetidos.

Los límites de seguridad del parser y su implementación no cambian. No se amplía el tamaño permitido ni se evita una validación para acelerar. Las 147 pruebas originales se mantienen byte a byte.

## 3. Mediciones puras con volumen creciente

[volume-fixtures.mjs](volume-fixtures.mjs) construye datos ficticios acotados; [volume.test.mjs](volume.test.mjs) comprueba su aceptación y conteos. [benchmark.mjs](benchmark.mjs) mide de forma explícita el validador completo, no solo los Maps, y emite JSON a stdout. No escribe resultados en el repositorio ni inicia servicios.

La campaña usa 25, 75 y 225 partidos locales más el mismo número de partidos cloud; cuatro tiros por partido, dos equipos y cinco intenciones por partido cloud. Incluye bloqueos y hasta 16 versiones de panel por ámbito. Los JSON son los mismos para el candidato anterior y el ajustado; se comprobaron su huella y sus resultados antes de compararlos.

Node v24.21.0, Windows x64. Cada caso/variante se ejecutó en un proceso secuencial independiente, con un calentamiento y tres muestras, GC explícito antes de cada muestra. No hay ejecución concurrente. Se limita el old-space del proceso de medición a 256 MiB y se usa una guardia de 45 segundos por caso como protección operativa, no como umbral para aprobar rendimiento. No se buscan tamaños extremos ni el punto de agotamiento.

| Representaciones de partido | Eventos físicos | Intenciones | Bytes JSON | Mediana anterior ms | Mediana ajustada ms | Máximo RSS anterior/ajustado MiB | Máximo heap al terminar muestra anterior/ajustado MiB |
|---|---|---|---|---|---|---|---|
| 50 | 200 | 125 | 241083 | 182.287 | 86.820 | 80.297 / 79.008 | 20.595 / 20.635 |
| 150 | 600 | 375 | 651475 | 1033.019 | 197.878 | 119.496 / 119.402 | 41.032 / 32.026 |
| 450 | 1800 | 1125 | 1882640 | 8165.740 | 549.006 | 197.578 / 198.164 | 49.624 / 65.183 |

Interpretación limitada: se observa una reducción del tiempo en los tres casos; no se acredita una reducción de memoria. heap se muestrea antes/después y no es un pico. maxRSS es el máximo del proceso desde su arranque e incluye preparación de fixtures, calentamiento y GC; no es memoria atribuible exclusivamente a validateBackup. Las muestras y deltas completos quedan en la evidencia externa, sin rutas personales en la tabla publicada.

No se imponen umbrales arbitrarios de tiempo o memoria, ni se extrapolan estos números a Safari, móviles o todos los equipos Windows. El constructor rechaza tamaños fuera de su campaña acotada. Los casos mayores permanecen por debajo de los límites del parser; no se ha ejecutado una prueba de agotamiento.

Reproducción desde la raíz, sin instalar nada:

~~~text
node --test --test-concurrency=1 tests/backup-contract.test.mjs
node tools/backup-contract/benchmark.mjs
~~~

Para comparar con una copia conservada del candidato anterior, se admite --baseline seguido de la ruta a su validate.mjs. El benchmark es separado de los tests y no se ejecuta por importar el módulo. Su salida debe conservarse fuera del repositorio.

## 4. Correspondencia con los nueve almacenes

La revisión se basa en lectura estática del código 23.0 de la base exacta. La matriz completa y sus reglas están en [CORRESPONDENCIA_23_0.md](CORRESPONDENCIA_23_0.md); no se ha implementado el adaptador de captura.

- **blocked:** enqueue no lo escribe en nuevas filas de syncQueue. El JSON normalizado sigue exigiendo un booleano, derivado false si falta en origen. Un booleano existente y un error persistido se conservan; un fallo transitorio con blocked=false también es válido. executable=false es una constante del contrato, no una propiedad fuente. No se modifican filas ni se ejecutan reintentos.
- **syncBindings:** la clave real es [scopeJSON,idLocalOriginal]. localGameId se obtiene de key[1], no del gameId remoto. El validador usa la identidad física compuesta y comprueba aparte el invariante lógico de una incorporación por original. scope se decodificaría y contrastaría con key[0].
- **Órdenes:** sourceSeq procede de la clave técnica seq. En cloudEvents, payload.seq puede ser el seq de un original importado y ser diferente, o faltar en un tiro nuevo. No se sustituye uno por otro.
- **Originales tras cierre:** se conservan games/events y legacy-owner imported aunque se purguen bindings/copias cloud. Se mantiene la declaración de originales sin vínculo sin ofrecerlos automáticamente como nuevas importaciones.
- **Paneles históricos:** se conservan snapshots/documentos existentes y se declaran ausencias históricas y bases externas conocidas. Una versión obligatoria usada sin documento sigue produciendo incomplete; no se suple con CSV actual ni se oculta una omisión.
- **Campos derivados:** scope estructurado, kind, cloudState, localGameId, cobertura/conteos/hashes y los metadatos del productor son distintos de los valores deportivos literales. Un sourceId técnico presente como undefined en una fila cloud se representa como propiedad opcional ausente, de forma expresa y limitada a ese campo; no se generaliza a payloads desconocidos.

No se detectó necesidad de cambiar la estructura JSON de las nueve secciones para estos casos. Se corrigió la descripción de identidad de bindings y se hizo explícita la normalización de blocked; el validador no se convierte en un importador de filas crudas. Los datos fuente legítimos ajenos al perfil del contrato necesitarían diagnóstico o un adaptador revisado, nunca coerción silenciosa.

## 5. Versiones y documentación

SUPPORTED_APP_VERSIONS contiene solo 23.0. Es una lista revisable de compatibilidad del lector, separada de las versiones de IndexedDB (1/2), contrato JSON (1.0), paneles y sobres conocidos. Se mantiene el rechazo seguro de aplicación, esquema, contrato o capacidades futuras desconocidas.

El formato 1.0 no se define como exclusivo de 23.0 para siempre: una revisión futura podría admitir otro productor bajo el mismo contrato si se demuestra equivalencia semántica y se añaden pruebas. No hay aceptación automática ni compromiso de que eso vaya a suceder.

ESPECIFICACION.md describe el contrato y la herramienta técnica sin decir que ya haya exportador. Declara expresamente que no existen exportación desde IndexedDB, descarga real de respaldo, restauración, cifrado o reconciliación remota, y que integrar el prototipo no autorizaría esas capacidades o datos reales.

## 6. Pruebas y check general

Se ejecuta solo la batería pura nueva mediante tests/backup-contract.test.mjs: 147 pruebas originales sin cambios, 7 de correspondencia/versiones y 7 de volumen/aislamiento de índices; total 161 correctas. Los nueve ejemplos estáticos siguen verificándose sin regenerarlos. Se mantienen vectores conocidos de JCS, duplicados previos al parser convencional, restricciones numéricas, límites, hashes, tipos, unicidad, conflictos, referencias y datos prohibidos.

La nueva entrada de tests hace que el lanzador nativo existente descubra la batería en una futura CI, sin cambiar scripts, package.json o workflows. En este ajuste no se ejecuta npm test general ni baterías de cuentas, supervisión, navegador o emuladores. El benchmark tampoco entra en la batería automática.

El check general anterior **no pasó** por ausencia de @playwright/test en el clon sin node_modules. No se repite ni se declara satisfactorio en este ajuste, y no se instalan dependencias. Su validación en CI queda pendiente para cuando se autorice publicar una PR. Las verificaciones locales acotadas incluyen sintaxis de los módulos nuevos, enlaces locales, ausencia de evidencias/rutas personales en el conjunto propuesto, integridad de originales y validación del diff completo.

## 7. Archivos que se propondría versionar

Un archivo existente modificado: ESPECIFICACION.md, únicamente su nota técnica de Fase 26.2.

Archivos nuevos:

| Grupo | Archivos |
|---|---|
| Contrato y revisión | tools/backup-contract/CONTRATO_JSON_1_0.md; CORRESPONDENCIA_23_0.md; INFORME_FASE26_2.md. |
| Prototipo aislado | tools/backup-contract/json.mjs; schema.mjs; validate.mjs; fixtures.mjs. |
| Pruebas originales intactas | tools/backup-contract/jcs.test.mjs; validator.test.mjs. |
| Pruebas y medición añadidas | tools/backup-contract/compatibility.test.mjs; volume-fixtures.mjs; volume.test.mjs; benchmark.mjs. |
| Entrada nativa para futura CI | tests/backup-contract.test.mjs. |
| Ejemplos estáticos | Los nueve JSON ya revisados de tools/backup-contract/examples: cuatro válidos, dos incompletos, uno incompatible y dos inválidos. No se modifican. |

El conjunto consta de 24 archivos: la nota existente más 23 nuevos. No incluye resultados/check-general.log, resultados/pruebas.tap, resultados/verificacion.json, tiempos crudos, manifiestos de entrega, rutas locales o parches. La copia externa de evidencias conserva sus hashes; la entrega anterior sigue disponible de forma privada.

## 8. Decisiones abiertas y recomendación

Cifrado permanece especialmente abierto: obligatoriedad/opcionalidad, contenedor, contraseña/custodia y compatibilidad. También quedan por decidir alcance por cuenta/UID, origen persistente ausente, acceso a datos reales, recuperación aislada, resolución de variantes, orden/Deshacer y eventual reconciliación remota. Las pruebas de volumen no aprueban un presupuesto de memoria/rendimiento para otros dispositivos ni justifican cambiar los límites.

La identidad Git consultada sigue siendo itsasnehezkuntza. No se cambia la identidad, no se añaden atribuciones automáticas y no se crea ningún commit o PR.

**Recomendación favorable a abrir una PR en borrador del prototipo técnico cuando se autorice**, con CI general pendiente y límites explícitos. Esa PR podría revisar contrato, correspondencia, pruebas y rendimiento sin implementar funciones de respaldo reales. No es autorización para el siguiente adaptador ni para publicar la aplicación.

No se han modificado archivos de producción ni accedido a datos deportivos reales, perfiles, IndexedDB o Firestore. No se toca develop, sus rutas, worktrees, respaldos o históricos, ni se integra la candidata 25.3. Se conserva el trabajo local y se detiene para revisión.
