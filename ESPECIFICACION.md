# Registro defensivo de baloncesto — especificación

Estado vigente, Fase 7 ampliada — 14 de octubre de 2026: panel y matriz publicados con el commit `e27d320`. Presentación **fallados/aciertos**, por ejemplo **4/2**, en ambas vistas. Estadísticas añade porcentaje de éxito en resumen general y matriz, con desglose completo solo al pulsar una celda o total. Registro mantiene su formato compacto. El apartado 36 actualiza el 35.

Estado: Fases 1–5 completadas y publicación de prueba realizada. Fase 6A completada. Fase 6B auditada; Basketball Scout rechazada estéticamente. Fase 6D GAME DAY revisada; se pide una dirección más moderna. Fase 6E CourtFlow Light/Contrast prototipada y verificada, pendiente de elección antes de modificar producción.
Fecha: 13 de octubre de 2026. Fase 7: maqueta visual de Dashboard terminada, pendiente de revisión; sin integración funcional.

Actualización: integración visual de `origin/design/premium-ui` terminada localmente el 13 de octubre de 2026, pendiente de revisión. Véase apartado 24. No implica integrar el Dashboard ni publicar.

Estado vigente, 14 de octubre de 2026: el usuario aprueba **Premium cristal** y autoriza su integración local, incluida la vista funcional de Estadísticas y navegación entre ambas vistas. Integración realizada para revisión, sin publicar. Véase apartado 31. Los apartados anteriores conservan el histórico de propuestas; Copper Court y la exploración Pulse, Bench y Switch quedan descartados como dirección de trabajo.

## 1. Alcance y prioridad

Aplicación estática en español, con HTML, CSS y JavaScript puro, sin backend ni frameworks, destinada a GitHub Pages. La prioridad absoluta es registrar un tiro rival con dos pulsaciones: acción (o defensa dentro de un bloqueo) y resultado. No hay confirmación adicional al registrar.

La Fase 0 comprendió inspección, especificación, instrucciones permanentes y propuesta de fases. La Fase 1 implementó configuración e identidad. La Fase 2 implementó gestión de partidos y persistencia. La Fase 3 completó registro, estadísticas y Deshacer. La Fase 4 ajustó UX/UI y responsive. La Fase 5 implementa CSV por partido, verificación integral y preparación estática para Pages. La Fase 6A realiza ajustes concretos de usabilidad y presentación de estadísticas; la Fase 6B queda reservada para la auditoría estética deportiva. No se implementan estadísticas de temporada, opciones JSON, cuentas, sincronización, funcionalidades deportivas adicionales ni Capacitor.

## 2. Inspección de la base disponible

El repositorio local no está vacío. Su remoto `origin` corresponde a `https://github.com/itsasnehezkuntza/registro_defensas_baloncesto.git`. Al comenzar, el árbol de trabajo estaba limpio. Se han inspeccionado los cuatro archivos disponibles:

| Archivo | Situación actual |
| --- | --- |
| `index.html` | Una página con las tres secciones y resultados comunes fijos abajo. Falta eliminar partido. Contiene textos explicativos que se simplificarán. |
| `styles.css` | Diseño responsive, cuadrícula superior, bloqueos debajo y barra de resultados fija. En móvil las secciones se apilan. |
| `app.js` | Configuración deportiva embebida; IndexedDB; selección, registro, estadísticas, deshacer y CSV. Crea un partido automáticamente y utiliza jornada/rival de ejemplo. Exporta todos los partidos. |
| `README.md` | Describe configuración en JavaScript, exportación global y opciones JSON ausentes en la interfaz y el código. Necesita alinearse con el resultado futuro. |

No existen `categorias.csv`, módulos separados ni pruebas en los archivos inspeccionados. Se reutilizará la base disponible; no se dependerá de versiones anteriores.

IndexedDB actual: base `registro_defensivo_baloncesto`, versión 1; almacenes `games`, `events` y `settings`. Los eventos tienen clave secuencial `seq`, índice único `byUuid` para `id`, e índices por partido. Hay cola de mutaciones y bloqueo durante operaciones, pero todavía no se ha verificado su comportamiento en navegador bajo recargas o concurrencia.

Los registros actuales identifican categorías/acciones/defensas por nombres. Cambiar esos nombres puede dejar fuera estadísticas por acción. La evolución debe conservar los eventos existentes y añadir identidad estable sin reiniciar la base.

## 3. Interfaz y flujo

- Cabecera compacta: selector de partidos, creación con jornada y rival obligatorios, eliminar con confirmación explícita, deshacer, exportar CSV del partido activo e indicador de guardado.
- Tres secciones presentes en la misma página, sin pestañas, acordeones ni pasos para mostrar defensas: Transición y Estático arriba; Bloqueo directo debajo.
- Cuatro resultados grandes comunes, preferentemente fijos abajo: `2✕`, `3✕` a la izquierda (verde) y `2✓`, `3✓` a la derecha (rojo). ✓ significa tiro anotado por el rival; ✕ significa tiro fallado por el rival.
- Primera pulsación: seleccionar acción, o defensa dentro del tipo de bloqueo. Seleccionar una defensa selecciona también su tipo.
- Solo se habilitan resultados compatibles con la selección. Segunda pulsación: guardar un único evento; tras confirmar la transacción, actualizar estadísticas y limpiar selección.
- Ejemplo: `PR Manejador > Blue` y `3✕` requiere exactamente dos pulsaciones.
- Debajo del nombre de cada acción/defensa solo se muestra `fallados–anotados · porcentaje`, por ejemplo `7–3 · 70%` (fallados en verde y anotados en rojo), o `—` sin intentos. No se muestran etiquetas 2P/3P.
- Diseño deportivo, profesional y compacto, con objetivos táctiles adecuados, foco de teclado visible y selección inequívoca. La barra fija no debe ocultar contenido.
- Eliminar explicaciones redundantes. Mantener únicamente estados y errores necesarios para operar.

## 4. Configuración deportiva inicial

| Categoría | Acción / tipo | Tiros permitidos | Defensas |
| --- | --- | --- | --- |
| Transición | Bajo aro | 2 | — |
| Transición | Spot up 3 | 3 | — |
| Estático | 1c1 exterior | 2, 3 | — |
| Estático | 1c1 interior | 2 | — |
| Estático | Pin down | 2, 3 | — |
| Estático | Cortes | 2 | — |
| Estático | Spot up 3 | 3 | — |
| Estático | Bajo aro | 2 | — |
| Bloqueo directo | PR Manejador | 2, 3 | Black, White, Blue, Red, Tut |
| Bloqueo directo | PR Roller | 2 | Black, White, Blue, Red, Tut |
| Bloqueo directo | PR Pop | 2, 3 | Black, White, Blue, Red, Tut |
| Bloqueo directo | Spain | 2, 3 | Black, White, Blue, Red, Tut |

Todas las defensas aparecen directamente dentro de su tipo. No se requiere pulsar previamente el nombre del tipo.

## 5. Partidos

- Es obligatorio crear o seleccionar un partido antes de registrar. No crear partidos automáticamente ni usar campos ficticios para superar validaciones.
- Jornada y rival son textos obligatorios, no vacíos tras quitar espacios. La jornada no se limita a números sin un requisito posterior.
- Cada partido tiene un ID único y fecha de creación. El selector permite recuperar encuentros anteriores y continuar registrándolos.
- Sin partido activo: acciones y resultados deshabilitados; también deshacer, eliminar y exportar.
- Al cambiar de partido, limpiar selección y recuperar exclusivamente sus eventos y estadísticas.
- Eliminar requiere una confirmación que identifique jornada y rival. Cancelar no modifica nada. Confirmar elimina ese partido y únicamente sus eventos, en una transacción atómica.
- Decisión aprobada: después de eliminar el partido activo, quedar sin partido activo hasta una nueva selección o creación explícita.
- Al recargar, restaurar el ID activo si sigue existiendo; si no existe o no hay selección guardada, quedar sin partido activo.

## 6. Estadísticas y eventos

Las estadísticas se calculan exclusivamente con los eventos del partido activo:

- Intentos = número de tiros registrados.
- Anotados = tiros con resultado anotado.
- Fallados = tiros con resultado fallado.
- Puntos concedidos = suma del valor de los tiros anotados; los fallados aportan cero.
- Éxito defensivo = fallados / intentos × 100. Presentación aprobada: porcentaje redondeado al entero.

Cada evento conserva su ID único, ID del partido, categoría, acción, defensa (nula fuera de bloqueo directo), valor 2 o 3, resultado y fecha/hora ISO en UTC. Conservar además orden persistente para determinar el último evento, e indicadores de intento, anotado, fallado y puntos concedidos. Los totales se derivan de eventos; no mantener contadores independientes que puedan desajustarse.

Los eventos nuevos incluirán IDs estables de configuración y una copia de los nombres y tiros permitidos al registrar. Una edición futura del CSV no reescribe, revalida ni elimina tiros históricos. Los eventos antiguos conservarán sus campos y valores; cualquier asociación con IDs deberá ser determinista y no inventar equivalencias ambiguas.

Deshacer elimina solamente el último evento persistido del partido activo, también tras recargar. Actualiza las estadísticas después de confirmar la eliminación. No incluye rehacer ni historial visual de movimientos.

## 7. Persistencia y fiabilidad

- IndexedDB es la fuente de verdad para partidos, eventos y partido activo.
- Mantener el nombre de la base actual y aplicar migraciones versionadas si cambia el esquema. Nunca resolver una migración borrando la base.
- Guardar creación y selección del nuevo partido de forma atómica. Lo mismo para eliminar partido, sus eventos y su selección activa.
- Serializar operaciones incompatibles. Capturar partido y selección al iniciar una operación para impedir cruces al cambiar de partido.
- Bloquear resultados inmediatamente al registrar; consumir una selección una sola vez. El índice único del ID complementa, pero no sustituye, la prevención del doble toque.
- Mostrar «Guardado» solo al completar la transacción. Ante un fallo, no mostrar estadísticas ficticias ni éxito; conservar una vía de reintento sin duplicar.
- Iniciar con registro deshabilitado hasta recuperar base, configuración y partido. Manejar indisponibilidad de IndexedDB y actualizaciones bloqueadas por otra pestaña.
- Verificar recarga después de crear, seleccionar, registrar, deshacer y eliminar; incluir recarga inmediata y fallos de transacción. Solo una transacción confirmada puede considerarse guardada; no depender de guardar en el cierre de la página.
- Verificar operaciones desde dos pestañas para evitar estado obsoleto, deshacer incorrecto o registro en un partido eliminado. El mecanismo concreto se decide en la fase de persistencia.

## 8. `categorias.csv` editable

El archivo será la fuente de configuración deportiva; nombres, acciones, defensas y tiros permitidos no estarán duplicados como configuración en JavaScript.

Formato aprobado: CSV UTF-8, separador `;`, una fila por acción simple o combinación de tipo y defensa. Columnas:

```text
categoria_id;categoria;accion_id;accion;defensa_id;defensa;tiros
transicion;Transición;transicion_bajo_aro;Bajo aro;;;2
directo;Bloqueo directo;pr_manejador;PR Manejador;blue;Blue;2,3
```

Los IDs no cambian al renombrar. Las filas de un mismo tipo comparten `accion_id`. Las acciones simples dejan defensa vacía. El orden de las filas establece el orden de presentación. El README explicará con ejemplos cómo editar y añadir filas sin programar; el archivo completo inicial tendrá 28 filas de datos.

Validar cabeceras, campos obligatorios, IDs coherentes, combinaciones duplicadas, comillas, caracteres españoles y tiros admitidos. Ante configuración inválida o inaccesible, mostrar un error útil y bloquear nuevos registros, conservando los datos guardados y su exportación cuando puedan recuperarse. Cargar mediante rutas relativas compatibles con la subcarpeta del repositorio en GitHub Pages. El desarrollo local se probará con un servidor estático.

## 9. Exportación

- Única opción: CSV del partido activo, una fila por evento y orden de registro.
- UTF-8 con BOM, separador `;`, saltos CRLF y escape correcto de comillas, separadores y saltos dentro de campos.
- Incluir IDs, jornada, rival, categoría, acción, defensa/tipo, valor, resultado, intento, anotado, fallado, puntos concedidos y fecha/hora UTC.
- Conservar la protección existente frente a fórmulas en campos editables al abrir el CSV en Excel.
- Incluir también eventos históricos cuya acción ya no esté en la configuración actual.
- Decisión aprobada: un partido sin tiros exporta cabeceras. Nombre del archivo identificable por jornada y rival, saneado.
- No mostrar exportación ni importación JSON. Corregir sus referencias en README durante la fase correspondiente.

## 10. Estructura propuesta

Mantener los archivos actuales y separar responsabilidades mediante módulos ES nativos, sin compilación ni dependencias de producción:

```text
index.html             Página y estructura accesible
styles.css             Diseño y adaptación responsive
app.js                 Inicio y coordinación de estado/interfaz
categorias.csv         Configuración deportiva editable
js/configuracion.js    Lectura y validación del CSV
js/persistencia.js     IndexedDB, migraciones y operaciones atómicas
js/estadisticas.js     Cálculos puros a partir de eventos
js/exportacion.js      Construcción y descarga del CSV
README.md              Uso, edición de configuración y publicación
ESPECIFICACION.md      Requisitos, decisiones y avance
AGENTS.md              Instrucciones permanentes
```

La estructura modular se ha implementado en la Fase 1. Se añade también js/identidad.js para compatibilidad de lectura con eventos anteriores y tests/ para pruebas sin dependencias. La interfaz usará operaciones de persistencia encapsuladas; los cálculos no dependerán del DOM. Esa separación permite integrar Capacitor posteriormente sin implementar ahora proyectos nativos, plugins, empaquetado, service worker ni instalación.

## 11. Plan por fases y criterios de cierre

| Fase | Trabajo | Verificación para revisar el resultado |
| --- | --- | --- |
| 0 — Especificación (esta tarea) | Inspección, documentación y propuesta de estructura. | Solo se crean los dos documentos; aplicación intacta. |
| 1 — Configuración e identidad | Crear CSV completo, lector/validador, módulos y estrategia compatible con eventos existentes. | Los 28 destinos seleccionables coinciden con requisitos; renombrar o retirar una fila no modifica el histórico; errores de CSV controlados. |
| 2 — Partidos y persistencia | Creación obligatoria, selección, estado sin partido, eliminación confirmada, migración necesaria y operaciones atómicas. | Dos partidos aislados; cancelar eliminación sin efecto; recargas recuperan datos y selección; registros anteriores conservados. |
| 3 — Registro y estadísticas | Conectar selección y resultados, guardas de tiros, doble toque, estadísticas y deshacer persistente. | Todos los destinos registran en dos pulsaciones; Roller no admite 3; sin partido no se registra; deshacer tras recarga afecta solo al activo. |
| 4 — Diseño de una página | Afinar cabecera, disposición, barra fija, textos, accesibilidad y uso táctil. | Sin pestañas ni defensas ocultas; ratón/táctil/teclado; móvil, tablet y escritorio sin solapamientos. |
| 5 — CSV y validación final | Exportación activa, README coherente y comprobación de rutas para GitHub Pages. | CSV con acentos/comillas y sin eventos ajenos; pruebas de recarga, fallos, doble toque, varias pestañas e histórico; instrucciones reproducibles. |

Se avanza por tareas delimitadas, dejando en este documento decisiones y estado de cada fase. Esta primera entrega se detiene para revisión de estructura y fases, tal como se ha solicitado. La implementación posterior no implica publicar, hacer push ni desplegar sin una instrucción para ello.

## 12. Decisiones aprobadas

- Fase 0: estructura y plan aprobados por el usuario.
- En móvil, las tres secciones permanecen desplegadas y se permite desplazamiento vertical.
- Porcentajes redondeados al entero; jornada como texto obligatorio.
- Tras eliminar el partido activo, quedar sin selección.
- Exportar cabeceras si el partido no tiene tiros.
- No implementar edición de jornada/rival. El flujo heredado de edición se ha retirado en Fase 2; jornada y rival solo se introducen al crear.
- Las filas/categorías retiradas no generan botones; los eventos siguen almacenados, cuentan en el total del partido y se exportan.
- Renombrar conserva IDs. Los eventos conservan los nombres originales y no se reescriben.
- Los tres IDs estructurales de sección son transicion, estatico y directo; sus nombres visibles son editables. No se añaden secciones nuevas fuera del alcance.
- Una defensa puede tener tiros propios en su fila; PR Roller viene configurado con 2 en las cinco filas. No se impone una regla deportiva duplicada en JavaScript: cambiar tiros en CSV cambia los permisos futuros.

## 13. Estado de avance y verificación de Fase 1

Fase 1 aprobada. Este apartado conserva los resultados de su entrega; la situación actual se recoge en el apartado 14.

### Cambios

- `categorias.csv`: 28 filas, con IDs estables, nombres y tiros permitidos. Lectura sin caché al arrancar; los cambios se aplican al recargar.
- `js/configuracion.js`: lector CSV con BOM, CRLF, comillas escapadas, separadores y saltos dentro de campos; validación de cabecera, columnas, IDs, nombres coherentes, defensa, tiros y duplicados. Los errores indican archivo y línea cuando corresponde.
- `app.js`: módulos ES, selección por IDs, etiquetas obtenidas del CSV, defensas por tipo y permisos por combinación. Eventos nuevos añaden categoria_id, accion_id, defensa_id y tiros_permitidos sin quitar los campos originales.
- `js/identidad.js`: tabla fija para interpretar eventos de la versión original. Solo lectura, independiente del CSV; sin migración ni escritura de eventos. Eventos con nombres antiguos desconocidos no reciben una identidad inventada: siguen en total y exportación, aunque no se agrupen bajo un botón.
- `js/persistencia.js`: extracción del código existente manteniendo nombre, versión 1, almacenes e índices. No se ha borrado, reiniciado ni migrado ninguna base real.
- `js/estadisticas.js` y `js/exportacion.js`: cálculos y construcción del CSV separados del coordinador. El alcance global heredado de descarga todavía se conserva hasta la Fase 5.
- Error de configuración visible en la página. Impide registrar y deja disponible la recuperación de partidos y CSV si IndexedDB se pudo abrir.
- Diseño conservado, con un estilo mínimo para el aviso de error. README actualizado para explicar edición del CSV y estado por fases.

### Pruebas realizadas

Ejecutadas mediante el runtime Node disponible en la herramienta, sin instalar dependencias:

| Prueba | Resultado |
| --- | --- |
| `tests/configuracion.test.mjs` | 26 pruebas superadas: estructura 2+6+20, Roller solo 2P, lectura CSV, validación, nombres/tiros editables, IDs, histórico, estadísticas, CSV y fallos de carga. |
| `tests/integracion.test.mjs` | 5 escenarios superados con DOM y persistencia simulados: inicio/registro, renombrado, retirada, CSV inválido y fallo de carga. Comprueba selección consumida, eventos nuevos con IDs y eventos anteriores intactos. |
| `tests/persistencia.test.mjs` | Contrato de lectura superado con IndexedDB simulado: misma base/versión, recuperación y ninguna escritura de eventos al leer. |

Comandos reproducibles con Node moderno instalado:

```text
node tests/configuracion.test.mjs
node tests/integracion.test.mjs
node tests/persistencia.test.mjs
```

Limitaciones: Node/Python no están disponibles como ejecutables en PATH; se utilizó el runtime de la herramienta. Playwright no pudo cargarse. No se han ejecutado pruebas en navegador real, de IndexedDB real, recarga, concurrencia entre pestañas ni QA visual. Las pruebas usan datos ficticios; no se han modificado datos reales del navegador. Esas verificaciones siguen pendientes, especialmente en las fases de persistencia y validación final.

Al cerrar Fase 1 se conservaban la gestión heredada y la exportación global. La gestión se ha sustituido en Fase 2; la exportación global sigue pendiente de Fase 5.

## 14. Fase 2 — Gestión de partidos y persistencia

Estado: completada y revisada antes de iniciar Fase 3. Este apartado conserva el informe de Fase 2.

### Cambios implementados

- Selector con «Selecciona o crea un partido». Recupera solo un ID activo persistido que siga existiendo; no crea ejemplos ni elige el primero.
- Sin partido válido: acciones/defensas, resultados, Deshacer, Eliminar y CSV deshabilitados, con aviso discreto.
- «+ Nuevo partido» abre un formulario compacto: jornada y rival obligatorios, trim, límites existentes de 32/80 caracteres e ID único independiente de nombres. Se permiten nombres iguales. Creación y selección atómicas.
- Se retira la edición de jornada/rival y la reescritura de metadatos históricos.
- Cambiar de partido persiste la selección, limpia la acción y recupera un snapshot coherente de eventos y estadísticas.
- Borrado confirmado con jornada/rival, foco inicial en Cancelar y botón «Eliminar definitivamente». Se captura el ID confirmado. Transacción atómica: partido, exclusivamente sus eventos y referencia activa si corresponde. La interfaz queda sin selección.
- Registro y deshacer verifican existencia del partido en la misma transacción que modifica sus eventos. Capturan el ID antes de esperar operaciones.
- Guardado aparece solo tras completar transacciones. Los fallos dejan errores visibles y formularios recuperables. Una actualización ajena no oculta un fallo local.

### Decisiones técnicas

- Se mantiene `registro_defensivo_baloncesto`, versión 1, almacenes e índices; no se necesita migración. No se cambian partidos, IDs ni eventos antiguos al abrir.
- Lecturas coherentes mediante una sola transacción. Mutaciones resueltas en `tx.oncomplete`; abortos rechazan la operación y revierten escrituras.
- Cola local y bloqueo inmediato de controles. Las selecciones tienen un número de revisión: respuestas y errores antiguos no sustituyen intenciones posteriores.
- games y events comparten las transacciones de registro/deshacer, evitando carreras con eliminación. byGameSeq conserva el orden persistente.
- BroadcastChannel avisa solo tras confirmar cambios. Otras pestañas releen IndexedDB; un partido eliminado se invalida inmediatamente. La selección activa es compartida entre pestañas del mismo origen: la última selección confirmada se refleja en todas.
- Fallback mediante el evento storage; localStorage solo transporta avisos, no datos deportivos. Relectura al recuperar foco/visibilidad.
- Un cambio externo de versión cierra la conexión y bloquea registro hasta recargar.
- Si confirma un tiro pero falla la lectura posterior, se limpia la selección y se muestra error de confirmación, evitando un reintento duplicado.
- La exportación conserva su alcance global heredado; solo se añade la guarda de partido válido. Limitarla al activo corresponde a Fase 5.

### Pruebas ejecutadas realmente

Chrome 154 headless, servidor loopback y perfil nuevo aislado dentro de `.test-artifacts/`. IndexedDB real y dos pestañas reales. No se ha utilizado el perfil del usuario ni borrado ninguna base; el runner aborta si encuentra partidos preexistentes.

`tests/fase2-browser.mjs`: resultado `ok: true`, 15 grupos que cubren las 14 pruebas obligatorias:

| Requisitos | Resultado |
| --- | --- |
| 1/12/13 | Inicio sin partidos: 28 combinaciones presentes, sin creación ficticia, herramientas bloqueadas y ningún evento al intentar registrar. Roller no habilita 3P. |
| 2/3 | Campos vacíos rechazados; trim, ID y selección persistidos; estadísticas vacías; doble envío rápido crea solo un partido; recarga recupera activo. |
| 4/5 | Dos partidos con mismos nombres e IDs distintos; eventos aislados; cambios rápidos conservan la última intención. |
| 6/7 | Eventos sobreviven a recarga; deshacer después de recargar elimina únicamente el último. |
| 8 | Cancelar eliminación no modifica partidos ni eventos. |
| 9/10/11 | Borrado exclusivo, sin selección posterior, no reaparece al recargar y el partido restante conserva su evento. Segunda pestaña se invalida. |
| 14 | Registro en partido eliminado rechazado; DataCloneError y abortos de creación, selección y borrado, incluyendo cascada de eventos, revierten cambios. Errores de UI sin falso Guardado; fallo antiguo no pisa selección posterior; dos eliminaciones simultáneas solo confirman una. |
| Compatibilidad | Partido de ejemplo y evento v1 recuperados conservando IDs/campos y estadísticas, sin migración. |

También pasaron las 26 pruebas de `tests/configuracion.test.mjs` y los 5 escenarios de `tests/integracion.test.mjs`, adaptados al nuevo contrato. La prueba simulada `tests/persistencia.test.mjs` se sustituyó por las pruebas reales. `git diff --check` sin errores de espacios.

Reproducir con Node 22.7 o posterior y Chrome en Windows:

```text
node tests/configuracion.test.mjs
node tests/integracion.test.mjs
node tests/servidor.mjs 8080
```

Manteniendo el servidor abierto, en otra consola:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080
```

El runner crea un perfil nuevo y guarda `.test-artifacts/fase2-result.json`, excluido de Git. Los flags de Chrome incluyen desactivar su sandbox interno para este entorno restringido: utilizar solo contra el servidor de pruebas local, nunca para navegación habitual. No se cambia la política de ejecución de PowerShell del sistema.

### Limitaciones y pendientes

- Pendientes otros navegadores, dispositivos móviles y QA visual/táctil. No se implementan PWA ni apps nativas.
- Recargas verificadas después de transacciones confirmadas; una escritura interrumpida antes de confirmar no se considera guardada. No se prueba corte eléctrico ni limpieza del almacenamiento.
- Fallback sin BroadcastChannel y cambio externo de versión no ejercitados; las guardas transaccionales no dependen de los avisos.
- Fase 3: revisión específica de dobles toques y reintentos bajo latencia/fallos, flujo en dos pulsaciones y estadísticas activas. Se conserva el registro actual sin nuevas métricas.
- Fase 5: CSV exclusivo del activo y revisión de nombre/columnas.
- No hay push ni publicación. Se detiene para revisión de Fase 2.

## 15. Fase 3 — Registro defensivo, estadísticas y Deshacer

Estado: completada antes de iniciar Fase 4. Se conserva este informe de Fase 3.

### Inspección y reutilización

Ya existían selección de acción/defensa, botones comunes, estadísticas derivadas de eventos del activo y Deshacer por byGameSeq en IndexedDB. Se conservan el diseño, configuración CSV, gestión de partidos, esquema de base e identificación histórica. No se modifica la exportación global.

Se encontraron tres puntos a corregir: permisos confiados a la selección en memoria, pérdida de la vía de reintento al abortar y pérdida de una selección al refrescar desde otra pestaña del mismo partido.

### Cambios y decisiones

- `js/registro.js` resuelve los IDs contra la configuración cargada del CSV y construye eventos completos. Selecciones y permisos resueltos son inmutables. Los textos y permisos manipulados en el DOM o en una copia de selección no sustituyen los del CSV.
- Primera pulsación: acción simple o defensa directamente dentro de su tipo. Segunda: resultado compatible. Se consume la selección inmediatamente antes de esperar IndexedDB y se bloquean resultados mientras guarda.
- Cada nuevo evento contiene ID, partido, IDs/nombres de categoría/acción/defensa, valor, resultado, fecha y copia de permisos. IndexedDB asigna seq como orden persistente. No hay pasos ni confirmaciones nuevas.
- Al abortar, se muestra que el tiro no está guardado, se recupera la selección si el partido sigue activo y se puede repetir el resultado. El mismo intento conserva su ID y fecha. Elegir otra acción cancela ese intento no guardado.
- `addEvent` valida valor/resultado/permisos y comprueba byUuid dentro de la transacción. Si el mismo ID ya contiene el mismo evento devuelve su seq, sin duplicar. Si corresponde a otro contenido, rechaza con EVENT_CONFLICT sin sobrescribir.
- Un fallo de lectura después de confirmar un tiro informa que el tiro sí está guardado y mantiene la selección consumida. Deshacer distingue igualmente aborto y fallo posterior a la eliminación confirmada.
- Las notificaciones a otras pestañas se emiten tras confirmar la mutación, incluso si falla el refresco posterior.
- Refrescar conserva la selección si el ID del partido no cambia, incluso con varios avisos simultáneos. Cambiar/eliminar el partido la limpia. Los IDs capturados evitan cruzar un tiro pendiente con la nueva selección global.
- `js/estadisticas.js` cuenta anotados explícitamente por resultado. Intentos, fallados y puntos concedidos siguen derivados de los eventos persistidos del activo. No se añaden paneles, métricas ni estadísticas de temporada.
- Deshacer conserva la consulta inversa del índice byGameSeq y transacción exclusiva del partido. No usa una pila en memoria ni fecha como criterio de orden.
- Ninguna migración ni reescritura histórica. Las filas retiradas no producen botones; sus eventos siguen en totales y CSV. La tabla fija de compatibilidad continúa interpretando eventos v1 sin IDs.

### Pruebas realmente ejecutadas

Chrome 154 headless, IndexedDB real, perfil nuevo aislado y servidor loopback. Dos pestañas reales, fallos inyectados y datos ficticios. El runner rechaza una base con partidos previos. Resultado final de `tests/fase3-browser.mjs`: `ok: true`, 13 grupos de comprobaciones.

| Pruebas solicitadas | Resultado |
| --- | --- |
| 1–4 y 7 | Se recorren las 28 combinaciones y sus 90 resultados válidos. Cada registro usa dos clicks, crea una fila completa y consume selección; comprobación de permisos y estadística después de cada evento. |
| 5 y 6 | Doble click y dos resultados diferentes, también forzando botones desde código: una sola fila. Cambio de acción registra la última selección. |
| 8–10 | Muestra de 90 intentos, 45 anotados, 45 fallados y 109 puntos; fallado/intentos, porcentajes enteros y guion sin intentos. |
| 11 y 12 | Deshacer actualiza estadísticas, funciona tras recarga y elimina por seq con fechas invertidas. Aborto conserva datos; fallo de refresco distingue eliminación confirmada. |
| 13 | Eventos de partidos distintos aislados; Blue de Manejador y Roller independientes. |
| 14 y 18 | Eventos con IDs y v1; variantes de CSV solo en páginas de prueba: renombrar, retirar Transición y cambiar 2 a 3 modifican interfaz/permisos sin reescribir históricos. |
| 15 | Dos pestañas registran y actualizan estadísticas; se conserva selección frente a avisos simultáneos; escritura retenida por una transacción larga, cambio de partido y borrado concurrente no cruzan ni duplican eventos. |
| 16 | Aborto real de tiro y reintento con mismo ID; lectura fallida tras commit; abortos/lectura fallida de Deshacer; reintentos simultáneos del mismo ID idempotentes; conflicto rechazado sin sobrescribir. |
| 17 | Sin partido activo, ni habilitar un resultado desde código genera un evento. |

Regresiones adicionales ejecutadas:
- Fase 2: sus 15 grupos en navegador real pasaron tras integrar los cambios.
- `tests/configuracion.test.mjs`: 26 pruebas superadas.
- `tests/integracion.test.mjs`: sus 5 escenarios simulados superados.
- `tests/registro.test.mjs`: 28 combinaciones y 90 resultados, validación canónica/inmutabilidad, fórmulas, porcentaje entero e histórico.
- `git diff --check` sin errores de espacios.

Reproducción: las instrucciones de Fase 2 siguen vigentes. Añadir:

```text
node tests/registro.test.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 3
```

El servidor `node tests/servidor.mjs 8080` debe estar abierto. El runner acepta -Phase 2 o 3 y deja informes separados en `.test-artifacts/`, excluidos de Git. Las variantes de CSV están en `tests/config-page.html` y no modifican `categorias.csv`.

### Archivos de esta fase y límites

Producción: `app.js`, `js/persistencia.js`, `js/estadisticas.js` y nuevo `js/registro.js`. Pruebas: nuevo `tests/registro.test.mjs`, `tests/fase3.html`, `tests/fase3-browser.mjs`, `tests/ui-fixture.mjs`, `tests/config-page.html` y adaptación de `tests/run-browser.ps1`. Documentación: especificación y README. No se modifican el CSV deportivo, HTML/CSS de producción, identidad histórica ni exportación.

Pendientes: Safari/Firefox y dispositivos táctiles reales, cierre forzado durante una transacción, cortes de energía y disponibilidad/cuota de almacenamiento. Un intento abortado no es un evento guardado; su selección de reintento se conserva durante la sesión, no tras cerrar/recargar. No se promete impedir escrituras deliberadas directamente en IndexedDB desde herramientas del navegador: es una aplicación local sin backend. Se validan las interacciones y el registro normal aunque se alteren botones o copias de selección.

No se ha iniciado Fase 4, hecho push ni publicado.

## 16. Fase 4 — UX/UI y adaptación responsive

Estado: completada antes de iniciar Fase 5. Se conserva este informe de Fase 4.

### Revisión inicial en navegador

Se revisaron HTML, CSS, JavaScript y capturas iniciales con Chrome headless en perfil aislado. Se conservaron estética, composición y funcionalidades existentes.

Problemas observados:
- A 320 px, el ancho mínimo de html producía desplazamiento horizontal cuando el navegador reservaba espacio para su barra de desplazamiento.
- Selector y herramientas de cabecera tenían 38 px de altura, por debajo del objetivo táctil de 44 px.
- Reglas antiguas de tablet forzaban una fila adicional para exportar y desaprovechaban ancho.
- La reserva de espacio inferior era fija, sin seguir el crecimiento del texto ni el tamaño real de la barra.
- La ampliación de texto al 200% podía solapar marca y estado de guardado.

### Cambios implementados

- `styles.css`: se elimina el ancho mínimo rígido, se mantienen Transición/Estático en columnas para escritorio y tablet desde 700 px, y se apilan en móvil. Bloqueo directo permanece debajo, con todas sus defensas visibles y adaptadas en varias filas en pantallas estrechas.
- Cabecera: objetivos de al menos 44 × 44 px, selector de ancho flexible, herramientas en una sola fila cuando caben y cuadrícula compacta de dos columnas en móvil. Marca/guardado pueden envolver texto al ampliar.
- Barra inferior: cuatro botones comunes, separación mínima de 8 px en móvil, tamaños adaptables de símbolos, texto que puede envolver y estado deshabilitado con borde discontinuo. Se conservan colores rojo para anotado y verde para fallado.
- Selección: borde doble, franja lateral y ✓ además del color. Se conserva aria-pressed y la descripción inmediata de selección.
- Foco visible con contraste en superficies claras y cabecera oscura. Nombres y estadísticas permiten reflujo; tamaños de texto principales expresados en rem. El texto de estadísticas sigue exclusivamente como cifra o guion.
- Se consideran env(safe-area-inset-top/right/bottom/left), viewport-fit=cover y altura dinámica del viewport en diálogos. No se implementa empaquetado móvil.
- Diálogos: campos de al menos 44 px, anchura adaptable, altura máxima según viewport, scroll vertical interno si hace falta y botones que envuelven sus etiquetas.
- `index.html`: se eliminan los rótulos redundantes «SITUACIÓN» y la explicación de la fórmula en la página; la fórmula permanece documentada. Los resultados tienen nombres accesibles completos; en pantallas de hasta 360 px se ocultan solo sus subtítulos visuales, conservando 2✓, 2✕, 3✓ y 3✕. Se añade anuncio accesible de selección y enterkeyhint en campos de creación.
- `js/interfaz.js`: único módulo nuevo de producción, dedicado a medir la barra mediante ResizeObserver y actualizar --dock-height. La reserva inferior sigue la altura real por cambios de texto, pantalla u orientación. Fallback a resize.
- `app.js`: únicamente importación y llamada inicial a initializeLayout. No cambian registro, permisos, estadísticas, IDs, eventos, partidos, IndexedDB, Deshacer ni exportación.
- Sin cambios en categorias.csv ni en los módulos deportivos y de persistencia. Sin nuevas pantallas, pasos de registro, gráficos, PWA o dependencias.

### Pruebas realizadas

Emulación en Chrome 154 headless con IndexedDB real, servidor loopback y perfil de pruebas aislado. No se han utilizado dispositivos físicos ni datos reales.

`tests/revisar-responsive.ps1` y `tests/fase4-browser.mjs` verifican:
- 320×640, 360×740, 390×844, 768×1024, 1024×768, 1440×900.
- Horizontal: 844×390 y 640×360; 1024×768 cubre también tablet horizontal.
- Escalado CSS al 200% en 640×960 y ampliación de texto raíz al 200% en 320×800. Estas pruebas emulan ampliación; no equivalen a una prueba del zoom del navegador o de ajustes de accesibilidad de iOS/Android.
- En los diez casos: sin scroll horizontal, sin recortes de nombres/estadísticas, todos los objetivos táctiles principales de al menos 44 × 44 px, tres secciones y veinte defensas presentes, cuatro resultados en pantalla, y última defensa accesible por scroll sin quedar bajo la barra.
- Selección con borde doble y ✓, foco programático con contorno visible, y estadística de muestra 7/10 — 70%.
- Diálogos de crear/eliminar revisados a 320 px, horizontal 844 px, escalado CSS y texto ampliado: sin desbordar el viewport ni tener scroll horizontal.
- Registro en dos pulsaciones de Roller, restricción 2P, estadística inmediata y Deshacer desde la interfaz responsive.
- Contraste calculado de pares principales: estadísticas 6,04:1, anotado 5,17:1, fallado 5,59:1 y texto de acciones 14,20:1. No constituye una auditoría WCAG completa.

Regresiones ejecutadas:
- Fase 2 en navegador real: 15 grupos, ok:true.
- Fase 3 en navegador real: 13 grupos, ok:true; incluye 28 combinaciones, 90 resultados, concurrencia e históricos.
- Configuración: 26 pruebas superadas.
- Registro: 28 combinaciones y 90 resultados, permisos, fórmulas e histórico.
- Integración simulada: 5 escenarios superados.
- git diff --check sin errores de espacios.

### Capturas y reproducción

Capturas generadas y revisadas:
- `.test-artifacts/final-1440-900-1.png` — escritorio.
- `.test-artifacts/final-768-1024-1.png` — tablet vertical.
- `.test-artifacts/final-390-844-1.png` — móvil.
- `.test-artifacts/final-320-640-1.png` — móvil pequeño.
- `.test-artifacts/final-844-390-1.png` — móvil horizontal.
- `.test-artifacts/final-320-800-2.png` — texto al 200%.

Medidas e informes en `.test-artifacts/fase4-final.json`; revisión inicial en fase4-antes.json. Artifacts excluidos de Git. Todas las imágenes muestran datos ficticios.

Con el servidor `node tests/servidor.mjs 8080` abierto:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tests/revisar-responsive.ps1 -Port 8080 -Label final
```

Las órdenes de regresión de fases anteriores siguen vigentes. El runner visual tiene las mismas restricciones de perfil/loopback que el funcional; no utilizar su Chrome de pruebas para navegación habitual.

### Archivos y pendientes

Modificados: styles.css, index.html, app.js, ESPECIFICACION.md y README.md. Añadidos: js/interfaz.js, tests/fase4.html, tests/fase4-browser.mjs y tests/revisar-responsive.ps1.

Pendientes de verificación física: notch y zonas seguras reales de iPhone/Android, teclados virtuales, rotación real, navegadores Safari/Firefox y ajustes de texto/zoom del sistema. El foco se verificó mediante programación; no se ha realizado auditoría completa con lector de pantalla o teclado físico.

No se han modificado el alcance global de CSV ni funcionalidades de Fase 5. Sin push ni publicación; se detiene al cerrar Fase 4.

## 17. Fase 5 — CSV por partido, pruebas finales y preparación Pages

Estado: implementada, pendiente de revisión funcional. No se inicia la futura Fase 6 ni se publica.

### Cambios implementados

- app.js captura currentGameId sin esperar antes de exportar. No sustituye ese ID por una selección más reciente ni carga allEvents para descargar.
- readExportSnapshot(gameId) lee el partido y su índice byGameSeq en una sola transacción readonly de games/events. Devuelve un snapshot confirmado, ordenado y exclusivo; rechaza IDs vacíos o partidos eliminados.
- buildCsv comprueba que todas las filas pertenecen al partido recibido, no muta entradas y conserva orden seq. Los nombres provienen de eventos históricos; solo jornada/rival ausentes recurren a metadatos del snapshot.
- CSV: una fila por evento, BOM UTF-8, separador ;, CRLF y campos escapados. Incluye identificadores de evento/partido, nombres, valor, resultado, intentos/anotados/fallados, puntos concedidos, UTC, IDs de configuración y orden persistente.
- IDs históricos conocidos se deducen con la tabla fija de identidad, sin escribir eventos ni validar contra el CSV actual. Los desconocidos se dejan vacíos; la fila se conserva.
- Nombre de archivo con jornada, rival e ID, normalización y saneamiento de caracteres. Componentes limitados por bytes UTF-8 para respetar límites de sistemas operativos, también con emojis. No se sobrescribe un partido distinto por compartir nombres.
- Sin eventos: cabeceras. Sin activo: botón y operación bloqueados. Fallo: mensaje y ninguna descarga parcial. Un partido eliminado no provoca exportar el siguiente.
- Sin cambios de estética, CSV deportivo, reglas, eventos o esquema IndexedDB. La lectura global allEvents se conserva para pruebas, pero la descarga ya no la utiliza.
- tests/preparar-pages.ps1 copia una lista explícita de 12 archivos a .test-artifacts/pages y valida ausencia de archivos ajenos. No compila, borra datos, hace git/push o despliega. Incluye .nojekyll; excluye tests, perfiles, informes y documentos internos.
- El servidor local sirve ese paquete bajo /registro_defensas_baloncesto/. README documenta publicación manual desde gh-pages y actualización del CSV, según documentación oficial de GitHub.

### Verificación ejecutada

| Tipo | Pruebas y resultados |
| --- | --- |
| Chrome 154, IndexedDB real, perfil aislado | Fase 5: 8 grupos, ok:true. Exportación exclusiva y ordenada, BOM binario, escape/fórmulas, nombres originales, IDs/puntos, vacío/sin activo, renombrado/retirada, cambio concurrente, abortos de lectura, partido eliminado y recarga inmediata tras commit. |
| Descarga nativa de Chrome | Archivo CSV materializado en el perfil aislado y BOM verificado leyendo los bytes del archivo. Las comprobaciones de contenido anteriores capturan el Blob real generado por la interfaz para analizarlo sin depender del diálogo del sistema. |
| Persistencia y partidos | Fase 2: 15 grupos en navegador real, ok:true. Creación, selección, borrado, aislamiento, recargas, rollback y concurrencia. |
| Registro integral | Fase 3: 13 grupos en navegador real, ok:true. 28 combinaciones y 90 resultados, Roller 2P, duplicados, estadísticas, históricos y Deshacer tras recarga. |
| Responsive emulado | Diez tamaños/ampliaciones de Fase 4, sin errores. Cabecera, selector, diálogos y barra mantienen geometría y accesibilidad de objetivos. Informe fase4-fase5.json. |
| Pruebas puras/simuladas | Configuración: 26 pruebas. Registro: 28 combinaciones/90 resultados. Integración: 5 escenarios simulados. Exportación: aislamiento, orden, escape, fórmulas, histórico, encabezados, longitud Unicode y nombres. Todas superadas. |
| Preparación estática | Paquete de 12 archivos verificado y cargado en Chrome bajo /registro_defensas_baloncesto/: módulos, estilos y 28 destinos de CSV. Descarga nativa desde el paquete también funciona. Sin compilación. |

La recarga inmediata se dispara al observar la confirmación del tiro, sin temporizador de guardado, y recupera su evento y estadísticas. No se afirma que una transacción abortada por recargar antes del commit quede guardada. El indicador Guardado se mantiene vinculado a transacciones completas.

Se utilizaron perfiles nuevos y datos ficticios. No se abrió, reinició ni borró la base del usuario. Los cambios de CSV fueron variantes en páginas de prueba; categorias.csv original se conserva.

### Preparación, archivos y entrega

Producción modificada: app.js, js/persistencia.js y js/exportacion.js. Sin cambios en HTML/CSS de producción ni en categorías o registro. Documentación actualizada: README.md y ESPECIFICACION.md.

Pruebas nuevas: exportacion.test.mjs, fase5.html, fase5-browser.mjs y preparar-pages.ps1. Adaptados: run-browser.ps1 (Phase 5 y descarga nativa), servidor.mjs (subdirectorio del paquete) e integracion.test.mjs (nuevo contrato de snapshot).

Informes y paquete están en .test-artifacts/, excluidos de Git. El contenido de pages está limitado a runtime y .nojekyll; no hay temporales ni pruebas preparados para publicación. No se han creado ramas, workflows automáticos ni configurado GitHub Pages.

### Limitaciones y uso en partido

No se detectaron fallos bloqueantes en las pruebas realizadas con Chrome. La validez del CSV se comprobó por bytes y parseo; Excel no se abrió realmente. Firefox no se encontró en las rutas de instalación consultadas; no hay entorno Safari disponible. Pendientes dispositivos físicos, lectores de pantalla completos, zonas seguras y teclados reales, y el dominio remoto después de autorizar publicación.

El almacenamiento es local y depende del navegador. Esperar Guardado antes de cerrar/recargar; una escritura interrumpida antes de confirmar puede abortar. CSV no ofrece restauración/importación. Las pestañas comparten selección activa; esta conducta ya definida en Fase 2 se mantiene.

Se detiene al finalizar Fase 5. Sin push, publicación, rediseño ni nuevas funciones deportivas.

## 18. Auditoría para primera publicación desde main

Auditoría completada sin modificar diseño ni funcionalidades. Se añade .nojekyll en la raíz, se excluye tests/ mediante .gitignore y se actualiza README para main/(root). El empaquetador local copia el mismo marcador. Informe completo en AUDITORIA_PUBLICACION.md.

Repetidas y superadas las pruebas Node/simuladas, Fase 2 (15 grupos), Fase 3 (13 grupos), Fase 5 (8 grupos y descarga nativa) y diez casos responsive emulados. Doce archivos runtime verificados byte a byte; once referencias relativas comprobadas. No hay dependencias de desarrollo para ejecutar en Pages. Base/version1 e históricos conservados.

Plan: subir solo los 12 archivos de aplicación más README.md y .gitignore. Pruebas, artefactos y documentos internos permanecen locales. Índice vacío: no se ha ejecutado stage, commit, push ni despliegue. Revisar referencias remotas y permisos/configuración Pages antes de la publicación autorizada.

## Publicación de prueba autorizada — 12 de octubre de 2026

Publicación realizada tras autorización expresa del usuario. Commit: `611848aaad31b0330a1e5fa32a944cc0ca0538c6`, en `main` y `origin/main`, mediante push normal sin force. Se incluyeron exclusivamente las 14 rutas aprobadas. Los documentos internos, pruebas, capturas y perfiles siguen locales y no forman parte del commit.

GitHub Pages ya estaba configurado desde `main` → `/(root)`; no fue necesario cambiar sus ajustes. La API confirma el build `built`, sin errores, del mismo commit.

URL: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/

Verificación remota ejecutada: HTML, CSS, CSV y los ocho archivos JavaScript (app y siete módulos) responden HTTP 200 y coinciden con los archivos locales, normalizando únicamente saltos de línea. Chrome headless real, con perfil nuevo aislado y datos ficticios, recupera las 28 combinaciones sin error de configuración; empieza sin partido y con resultados bloqueados; permite crear un partido; PR Roller / Blue habilita solo los dos resultados de 2 puntos; la barra inferior conserva posición fija. Estas comprobaciones complementan las regresiones anteriores; no son pruebas en dispositivos físicos.

Ramas local/remota sincronizadas (0 commits de diferencia). No se modificaron diseño ni lógica. Pendientes pruebas personales en móvil/tablet/ordenador, Safari/Firefox y Excel. El almacenamiento de localhost no se transfiere al origen público; los datos permanecen por navegador y origen. Se detiene esta entrega sin iniciar la Fase 6.
## 19. Fase 6A — Usabilidad y presentación de estadísticas

Estado: implementada y verificada localmente el 12 de octubre de 2026; pendiente de revisión del usuario. Se detiene aquí. Fase 6B no iniciada; sin commit, push ni despliegue de estos cambios. La publicación de prueba anterior sigue con su versión anterior.

### Cambios y decisiones

- Cabecera: se retiran logotipo D/flecha y subtítulo. Solo queda REGISTRO DEFENSIVO; debajo, selector flexible y Nuevo partido, Eliminar, Deshacer y Exportar CSV en una fila cuando caben. Guardado conserva su estado transaccional. El rótulo Partido sigue disponible para accesibilidad, sin consumir altura visible.
- Resultados: orden DOM y visual 2✕, 3✕, 2✓, 3✓; parejas fallado verde a la izquierda y anotado rojo a la derecha, con separación central adicional. Permanecen los cuatro resultados compartidos y el flujo de dos pulsaciones. Altura habitual de botones reducida de 72 a 56 px; en pantallas pequeñas se conserva reflujo de textos y símbolos.
- Desde 1000 px, Estático usa tres columnas y dos filas; Transición permanece al lado. Bloqueo directo conserva cuatro filas y cinco defensas por fila. Se compactan márgenes/padding sin ocultar categorías ni reducir objetivos táctiles por debajo de 44 × 44 px.
- Se conserva viewport-fit=cover, env(safe-area-inset-*) y la medición real de la barra mediante ResizeObserver en js/interfaz.js, sin modificar ese módulo. El espacio inferior reservado sigue su altura, incluido el texto ampliado y las zonas seguras. Se permite scroll vertical.
- Todas las estadísticas visibles usan fallados–anotados · porcentaje: acciones, defensas, tipos de bloqueo, secciones y total del partido. Total conserva el número de intentos; ahora también es visible en móvil. Con cero eventos la cifra es —; el porcentaje sigue redondeado al entero.
- JavaScript de producción limitado a statText/statMarkup en js/estadisticas.js y las llamadas de presentación en app.js. statMarkup solo introduce spans de color alrededor de los contadores numéricos calculados; nombres editables siguen escapados. summarize y puntos concedidos quedan intactos.
- Sin cambios en categorias.csv, eventos, IDs, IndexedDB (nombre/versión/esquema), gestión de partidos, persistencia, permisos, registro, Deshacer o exportación. No hay nuevas dependencias.

### Pruebas y evidencias

Perfiles nuevos aislados, servidor loopback y datos ficticios; ninguna base o partido real del usuario se ha modificado. Emulación de viewport en Chrome headless, no Safari ni hardware iPad.

| Verificación | Resultado |
| --- | --- |
| Pruebas puras/simuladas | Configuración: 26; registro: 28 combinaciones/90 resultados; integración: 5 escenarios; exportación: todas sus comprobaciones. Superadas. |
| Nuevo tests/estadisticas.test.mjs | 7–3 · 70%, 0–5 · 0%, 5–0 · 100%, — vacío y 1–2 · 33%; markup/texto equivalentes, contadores con clases de color, entradas inmutables y puntos originales. Superadas. |
| Nuevo tests/fase6-browser.mjs | Nueve escenarios: los tres casos con eventos en Transición, Estático y Bloqueo directo. Verifica dos pulsaciones, valor/resultado de cada botón reorganizado, vacío, acción/defensa/tipo/sección/total, recarga, Deshacer y aislamiento entre partidos. ok:true. |
| Regresión Fase 2 | 15 grupos: partidos, recargas, histórico v1, abortos, borrado exclusivo y concurrencia. ok:true. |
| Regresión Fase 3 | 13 grupos: 28 combinaciones/90 resultados, doble toque, restricciones CSV, 109 puntos, fallos reales, reintentos, dos pestañas e históricos. ok:true. |
| Regresión Fase 5 | 8 grupos y descarga nativa CSV con BOM. Paquete regenerado con los cambios de 6A (12 archivos) y probado bajo /registro_defensas_baloncesto/, sin publicar. ok:true. |
| Responsive | 13 casos, sin scroll horizontal ni recortes de nombres/estadísticas/resultados, objetivos ≥44 × 44, tres secciones/20 defensas presentes, foco y selección visibles. Diálogos dentro del viewport; última defensa accesible por scroll sobre la barra. Superados. |

Tamaños probados **mediante emulación**:
- Móvil: 320×640, 360×740, 390×844; horizontales 844×390 y 640×360.
- Tablet vertical: 768×1024.
- iPad horizontal: 1024×768, 1180×820 y 1194×834. Las cuatro filas completas quedan por encima de la barra sin scroll con la configuración inicial y texto normal.
- Altura útil reducida: 1024×620; requiere scroll y permite llegar a la última defensa sin ocultarla tras la barra. Es una aproximación a menos altura disponible, no una reproducción de la interfaz de Safari.
- Escritorio: 1440×900.
- Ampliación: zoom CSS 200% en 640×960 y texto raíz 200% en 320×800. No equivalen a zoom/ajustes de iPadOS. Se corrigió un recorte inicial de símbolos de resultados en texto ampliado; el informe final pasa.

Medidas finales con muestra ficticia y selección PR Manejador/Blue: cabecera ≈89 px en 1024 y 91 px en 1180/1194; barra ≈117 px. Los mensajes/selecciones extensos pueden aumentar esa altura y el espacio reservado se actualiza.

**Dispositivos reales probados en esta fase: ninguno.** Pendiente verificar Safari en iPad físico, sus barras dinámicas, zonas seguras no nulas, rotación, teclado virtual y interacción táctil real. No se afirma haber validado esos aspectos físicamente.

### Capturas revisadas y reproducción

Todas las capturas contienen datos ficticios y permanecen locales en .test-artifacts/, excluido de Git:
- fase6a-1024-768-1.png, fase6a-1180-820-1.png y fase6a-1194-834-1.png: iPad horizontal.
- fase6a-1440-900-1.png: escritorio.
- fase6a-390-844-1.png y fase6a-390-844-scroll.png: móvil al inicio y con las defensas accesibles al final.
- fase6a-1024-620-scroll.png: altura reducida con última fila sobre la barra.
- También generadas capturas 320×640, 768×1024, 844×390 y texto 200% (320×800).

Informes: .test-artifacts/fase4-fase6a.json (geometría), fase6-result.json (estadísticas/interfaz), fase2-result.json, fase3-result.json y fase5-result.json. Los tests y documentos internos mantienen su exclusión de publicación.

Con Node moderno y el servidor node tests/servidor.mjs 8080 abierto:

~~~text
node tests/configuracion.test.mjs
node tests/registro.test.mjs
node tests/integracion.test.mjs
node tests/exportacion.test.mjs
node tests/estadisticas.test.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 2
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 3
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 5
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 6
powershell -NoProfile -ExecutionPolicy Bypass -File tests/revisar-responsive.ps1 -Port 8080 -Label fase6a
~~~

En esta sesión se usó el runtime Node de la herramienta para las pruebas puras y el servidor, porque node no está en PATH; los runners PowerShell y Chrome se ejecutaron directamente. git diff --check sin errores de espacios.

Producción modificada: index.html, styles.css, app.js y js/estadisticas.js. Documentación: ESPECIFICACION.md y README.md. Pruebas: casos nuevos de estadísticas/Fase 6A y adaptación de expectativas de formato, runner de Phase 6 y revisión responsive. La decisión pendiente es aprobar la distribución tras revisar capturas y contrastarla en el iPad; cualquier Fase 6B o publicación requerirá su propia autorización.

## 20. Fase 6B — Auditoría deportiva e identidad visual

Estado: auditoría completada el 12 de octubre de 2026, pendiente de elección de propuesta. El usuario ha confirmado completada la Fase 6A al solicitar esta fase. La interfaz de producción conserva esa versión; no se aplica aún ningún rediseño.

Entregables: AUDITORIA_DISENO.md con diagnóstico, decisiones a conservar, paletas HEX, fuentes locales, componentes, accesibilidad, riesgos y recomendación; vistas estáticas Basketball Scout (A) y Courtside Pro (B) en tests/diseno-fase6b/; comparacion.html reúne capturas reales comparables.

- A: planilla clara cálida, matriz continua, grafito y naranja, resúmenes a la derecha, cifras tabulares y controles planos.
- B: módulos oscuros sin tarjetas exteriores, títulos condensados, cifras monoespaciadas, resúmenes junto a títulos y resultados sólidos verdes/rojos.
- Recomendación: A por continuidad de lectura y menor ocupación; juicio de diseño sin medición de velocidad en partido. B sigue disponible como alternativa.
- Ambas usan el mismo snapshot: 87 intentos, 51 fallados y 36 anotados (51–36 · 59%); incluyen 7–3 · 70%, 0–5 · 0%, 5–0 · 100% y guiones. Categorías y IDs proceden del CSV local actual.
- Las vistas no cargan app.js, persistencia o exportación ni abren IndexedDB; son maquetas sin registro. El estado Guardado es simulado. Generación con módulos puros, sin modificar lógica de producción.
- Emulación Chrome headless, perfil nuevo aislado: 1180×820, 1440×900, 390×844, 1024×768, 1194×834 y 1024×620 por propuesta (12 casos). Tres secciones y veinte defensas, orden correcto, sin scroll horizontal ni recortes y objetivos ≥44×44 px. Cuatro filas visibles sin scroll en los tres tamaños de iPad. Móvil/altura reducida permiten alcanzar la última defensa sobre la barra mediante scroll.
- Foco verificado con Tab, selección por símbolo/borde y muestras de contraste normales/seleccionadas/guardando/error/deshabilitadas ≥4,5:1. Mínimos medidos finales: A 5,43:1, B 6,34:1. No constituye auditoría WCAG completa. Cabecera/barra en 1180×820: A 88/≈115 px; B 93/≈117 px.
- Dispositivos reales: ninguno. Pendientes Safari/iPad, zonas seguras no nulas, reflejos/brillo, fuentes locales, rotación, teclado, ampliación nativa y lector de pantalla.
- Capturas en .test-artifacts/fase6b-scout/courtside-1180-820.png, -1440-900.png y -390-844.png; móvil desplazado con sufijo -scroll. También capturas de los otros tamaños. Informe: fase6b-geometria.json. Fuentes y guía de reproducción en tests/diseno-fase6b/.
- Verificación SHA-256 de los 11 archivos HTML/CSS/CSV/JavaScript runtime al inicio/final: intactos respecto a la Fase 6A. No se repitieron regresiones funcionales, al no editar producción ni ejecutar la aplicación desde las maquetas.

Los artefactos de pruebas permanecen excluidos de publicación. Sin cambios en categorías, registros, IndexedDB, lógica, README o estilos de producción durante esta fase. Sin commit, push ni despliegue. Se detiene para elegir A/B o pedir una revisión; elegir y autorizar una dirección es el paso anterior a implementar la interfaz definitiva y repetir las regresiones de Fase 6A.

## 21. Fase 6D — Replanteamiento creativo GAME DAY

Estado: dos prototipos aislados terminados y refinados, pendientes de revisión del usuario. El resultado estético de Basketball Scout ha sido rechazado; su recomendación anterior se conserva como histórico y deja de ser la dirección vigente. No se inventa ni se ejecuta una fase intermedia no solicitada.

- Broadcast Desk: composición de marcador/retransmisión, bandas naranja-grafito, porcentajes protagonistas y matriz horizontal con tipos en carril oscuro. Mantiene el recorrido espacial de Transición/Estático arriba y Bloqueo directo debajo.
- Tactical Board: pizarra moderna, banda lateral de Transición/Estático y área principal de bloqueos en pantallas amplias; cuatro carriles con encabezado de tipo y cinco defensas. En móvil se apilan todas las secciones.
- Ambos aprovechan la altura disponible en escritorio con CSS Grid y celdas adaptativas. No añaden contenido decorativo. Separación última defensa/barra a 1440×900: Scout 221 px; Broadcast 18 px; Tactical 28 px. Cabecera/barra a 1180×820: Broadcast ≈96/119 px; Tactical 101/119 px.
- Mantienen categorías y veinte defensas, cuatro resultados compartidos 2✕, 3✕ | 2✓, 3✓, símbolos/texto, verde/rojo semánticos y estadísticas originales. Envoltura de porcentaje añadida únicamente al HTML de la maqueta para dar jerarquía; cálculos y JavaScript de producción intactos.
- Datos ficticios idénticos a Scout: 87 intentos · 51–36 · 59%. Las vistas no cargan app.js, IndexedDB, sincronización ni exportación, y no registran tiros. Guardado es un estado visual ficticio.
- Capturas comparables reales de Chrome headless y perfil nuevo aislado: 1180×820, 1440×900, 390×844; además 1024×768, 1194×834 y 1024×620 para cada nuevo prototipo y Scout (18 casos). Sin desbordamiento horizontal, recortes o objetivos menores de 44×44. Cuatro filas visibles en los tres tamaños de iPad amplios. Scroll permite llegar al final de la matriz en móvil/altura reducida.
- Revisión y refinamiento de capturas: porcentaje de tipos de bloqueo corregido sobre fondo oscuro, cabecera/barra compactadas y espacio inferior contrastado. Foco mediante Tab, selección por símbolo/borde y contraste de todos los porcentajes/muestras de controles/estados. Mínimos de texto medidos: Broadcast 5,51:1, Tactical 5,75:1; no es auditoría WCAG completa.
- Emulación únicamente; no probados Safari/iPad físico, reflejos, fuentes reales del dispositivo, zonas seguras no nulas, teclado, zoom/texto ampliado o rotación. No se afirma mejora de velocidad medida en partido.

Informe: DIRECCION_ARTISTICA_GAME_DAY.md. Comparador: tests/diseno-fase6d/comparacion.html; fuentes y reproducción en ese directorio. Capturas .test-artifacts/fase6d-broadcast/tactical/scout-ancho-alto.png, con -scroll para móvil desplazado. Informes: fase6d-geometria.json y fase6d-integridad.json. Se verifican las huellas de 12 archivos runtime contra el inicio de fase para conservar producción.

Producción y configuración no modificadas. No se ejecuta una nueva implementación funcional ni se repiten regresiones de IndexedDB/CSV al no tocar el código real. Una propuesta definitiva requerirá elección/autorización y posterior verificación de funcionalidad y responsive. Sin commit, push o publicación. Se detiene para revisión.

## 22. Fase 6E — CourtFlow / Modern Basketball Performance

Estado: dos prototipos aislados refinados, terminados y pendientes de elección. GAME DAY se conserva como antecedente; el usuario solicita ahora una identidad contemporánea sin Impact, tipografía condensada, bloques agresivos ni divisores negros gruesos.

- CourtFlow Light: base clara, cabecera blanca, tipografía sans local contemporánea, radios 8–12 px y cifras tabulares; Transición/Estático arriba, matriz debajo, resultados suaves.
- CourtFlow Contrast: misma identidad, cabecera/barra grafito y registro central claro; situaciones a la izquierda y bloqueos a la derecha en pantallas amplias, encabezados de tipo ligeros y resultados sólidos. En móvil se apilan las tres secciones.
- Paleta base #F46A2A / #202C2A / #F5F6F3 / #147A55 / #BE3548. Textos/foco sobre claro y verdes/rojos sobre grafito ajustados por contraste. Sin fuentes externas, sombras/degradados o ilustraciones.
- Las imágenes de referencia mencionadas no estaban accesibles en el hilo ni en adjuntos locales. Las decisiones responden a los criterios escritos; no se afirma haber analizado esas imágenes.
- Recomendación: Light por continuidad espacial y menor carga visual; sin afirmar una mejora de rapidez medida. La elección sigue pendiente.
- Capturas HTML/CSS reales: 1180×820, 1440×900 y 390×844, además 1024×768, 1194×834 y 1024×620 para cada variante (12 casos emulados Chrome). Sin recortes/scroll horizontal ni objetivos menores de 44×44, tres secciones/veinte defensas y cuatro resultados en orden. Cuatro filas completas en los tres tamaños amplios de iPad; scroll permite acceder al final en móvil/altura reducida.
- Mismos datos ficticios: 87 intentos · 51–36 · 59%; 36 campos estadísticos visibles idénticos, con 7–3 · 70%, 0–5 · 0%, 5–0 · 100% y —. No se cambian cálculos, CSV, eventos o lógica de registro.
- Cabecera/barra en 1180×820: Light 96/≈115 px; Contrast ≈95/116 px. Última defensa/barra en escritorio: 26/20 px. Celdas adaptativas sin rellenar con contenido decorativo.
- Foco Tab verificado, selección por borde/franja/✓ y muestras de contraste de controles/tipos/estados y todos los porcentajes ≥4,5:1; mínimo 4,77:1. No es auditoría WCAG completa. Las capturas finales retiran el anillo de foco de la prueba.
- Fuentes de ambas vistas en tests/diseno-fase6e/: hoja común courtflow.css y variantes light.css/contrast.css. No cargan app.js ni módulos funcionales en navegador, no abren IndexedDB, no registran datos; Guardado es ficticio. El generador usa módulos puros existentes y el CSV local.
- Huellas de 12 archivos runtime conservadas respecto al inicio de fase; producción intacta. Sin nuevas regresiones funcionales al no cambiar código real.
- Emulación solamente: pendientes Safari/iPad físico, fuentes efectivas, brillo/reflejos, zonas seguras no nulas, zoom/texto ampliado, teclado, rotación y lector de pantalla.

Informe: DIRECCION_VISUAL_COURTFLOW.md. Comparador: tests/diseno-fase6e/comparacion.html. Capturas .test-artifacts/fase6e-light/contrast-ancho-alto.png y -scroll.png para móvil desplazado; informes fase6e-geometria.json y fase6e-integridad.json. Pruebas/artefactos excluidos de publicación.

Sin implementación definitiva, commit, push o despliegue. Se detiene para elegir variante o solicitar revisión antes de autorizar cualquier aplicación a producción.

## 23. Fase 7 — Dashboard visual de rendimiento: maqueta

Estado: maqueta de consulta terminada el 13 de octubre de 2026; **se detiene para revisión**. El requisito adicional autoriza el diseño con datos ficticios y sus capturas; no autoriza todavía toda la funcionalidad ni publicación. Las elecciones de Fase 6E siguen pendientes; esta propuesta toma CourtFlow claro como punto de partida sin aplicarlo al registro.

### Distribución y codificación

- A: resumen de los tres grupos con barras y volúmenes; banda única de éxito global y puntos concedidos. B: Transición. C: Estático. D: Bloqueo directo con mayor anchura, barras y porcentajes mayores. En iPad B/C quedan a la izquierda y D a la derecha; en móvil se apilan A–D.
- Barras horizontales apiladas al 100%, verde para fallados rival y rojo para anotados rival. Segmentos proporcionales a los recuentos de cada fila; ancho total común para comparar porcentajes. Nombre, fallados–anotados, porcentaje e intentos visibles, sin hover ni dependencia exclusiva del color. Sin tablas, librerías, gráficos circulares ni animaciones.
- Estático y Bloqueo directo ordenados por éxito ascendente (fracción exacta), dejando cero intentos al final. Empates mantienen el orden del CSV. Transición conserva el orden de configuración.
- Estrategias agrupadas por ID de defensa entre PR Manejador, PR Roller, PR Pop y Spain. Nombres e IDs proceden del CSV local durante la generación, sin configuración deportiva duplicada en producción.
- Propuesta: distintivos «Mejor rendimiento» y «A revisar» dentro de cada grupo, únicamente entre filas con ≥5 intentos. Se requieren dos elegibles con rendimientos distintos; extremos empatados comparten distintivo, todas empatadas no se destacan. Las muestras menores conservan porcentaje y ranking con aviso discreto, sin distintivo. Umbral y política pendientes de revisión.
- Sin intentos: —, barra vacía y 0 intentos. El porcentaje global deriva del total de eventos, no de promediar porcentajes.

### Entregables y verificación

- `tests/dashboard-fase7/index.html` y `maqueta.css`: maqueta estática sin JavaScript en navegador, sin carga de app.js, IndexedDB ni exportación. `generar.mjs` crea eventos ficticios solo en memoria y usa módulos puros existentes; `muestra.json` documenta la muestra de desarrollo, sin añadir exportación JSON al producto.
- Muestra coherente: 69 intentos, 37 fallados, 32 anotados, 54% global y 71 puntos. Incluye White 7–3 · 70% · 10 intentos; Blue 1–0 · 100% con muestra pequeña y sin distintivo; Tut y Bajo aro de Estático vacíos.
- `revision.html`: comparación de capturas; `README.md`: decisiones, casos, limitaciones y reproducción; `capturar.ps1`: Chrome headless con perfil aislado.
- Capturas en `.test-artifacts/fase7/`: iPad 1180×820 y 1024×768, móvil 390×844 y 320×740, móvil completo y detalle de bloqueos. En ambos iPad las cuatro zonas y el pie caben sin scroll; móvil permite consulta completa mediante desplazamiento. Sin desbordamiento horizontal.
- Capturas inspeccionadas y compactación refinada. Verificados 13 registros visuales, segmentos proporcionales, recuentos, vacíos, ausencia de distintivos con muestras pequeñas y rankings. `verificacion.json` contiene geometría/valores/orden; `integridad.json` confirma SHA-256 idéntico de los 12 archivos de producción respecto al inicio.
- Ningún dato real creado o modificado. Registro en dos pulsaciones, IndexedDB, Deshacer, configuración y CSV intactos. No se repiten pruebas funcionales al no modificar o ejecutar la aplicación. No se han usado versiones locales ausentes.
- Solo emulación Chrome; pendientes Safari/iPad físico, lectura con brillo/reflejos y valoración del texto secundario compacto. No se afirma una rapidez de lectura medida en partido.

Artefactos locales excluidos de Git/publicación por reglas existentes. Sin commit, push o despliegue. Pendiente revisar distribución, protagonismo, ranking, umbral/empates y legibilidad antes de autorizar integración. La implementación posterior debe consultar exclusivamente el partido activo, conservar históricos por IDs y no escribir en eventos desde el Dashboard.

## 24. Integración local del diseño premium-ui

Estado: tarea autorizada completada el 13 de octubre de 2026; se detiene para revisión, sin iniciar otra fase.

### Origen y recuperación

- Rama local al inicio y al cierre: `main`. HEAD no modificado. Cinco archivos con cambios sin commit (README.md, app.js, index.html, js/estadisticas.js, styles.css) y seis documentos nuevos conservados.
- Ejecutado `git fetch origin` sin checkout, merge, reset, stash, commit ni push. Origen del diseño: `origin/design/premium-ui`, commit `c41774782bc216ca069fbf309c1a1274c0ae2398`. No se modifica ninguna rama remota.
- Copia anterior a las modificaciones en `.local-backups/premium-ui-20261013-173656/`: `fuentes.tar.gz` incluye fuentes, pruebas, documentos sin seguimiento y artefactos locales; `repositorio.bundle` conserva las referencias Git previas al fetch; `cambios.patch`, `estado.txt` y `HEAD.txt` documentan el estado inicial.
- Un primer intento de copia completa encontró un archivo bloqueado de un perfil temporal de Chrome. `workspace.tar.gz` es ese intento parcial; la copia válida es `fuentes.tar.gz`, verificada y completada excluyendo únicamente `.git`, la propia carpeta de copias y `.test-artifacts/chrome-*`. Los perfiles permanecen intactos en su ubicación. No se han borrado archivos ni datos reales.
- Para recuperar, extraer `fuentes.tar.gz` en una carpeta nueva y comparar antes de restaurar archivos selectivamente; no extraer encima del proyecto a ciegas. El bundle permite reconstruir el historial y el parche documenta los cambios previos sin depender de un commit nuevo.
- `.local-backups/` se añade a `.gitignore` para mantener la recuperación fuera de futuros commits.

### Integración selectiva y diferencias resueltas

- Nuevo `premium.css`: capa visual procedente del remoto (lienzo blanco, módulos grises, naranja de selección, matriz con ejes y resultados verdes/rojos). Ajustes finales locales para controles ≥44 px, foco/selección visibles, colores de estadísticas y espacio reservado a la barra. Se utilizan fuentes disponibles localmente y alternativas del sistema, sin importar Google Fonts; los tipos exactos del remoto solo se mostrarán si están instalados.
- `index.html`: enlace relativo a premium.css y color de tema claro. Conserva todos los IDs, formularios, accesibilidad y el orden local 2✕, 3✕, 2✓, 3✓.
- `app.js`: solo cambia `buildDirectActions`, incorporando envolturas de matriz y clases de selección de fila/columna. Se conserva statMarkup, filtros por ID, botones/atributos y la lógica local. Encabezados compartidos solo si todas las filas tienen las mismas defensas y orden; un CSV diferente mantiene sus botones y etiquetas sin ejes engañosos.
- Transición y Estático: dos filas, misma altura en tamaños normales; Estático mantiene tres columnas incluso a 320 px. En móvil los paneles se apilan y las defensas se reorganizan sin desplazamiento horizontal ni ocultar combinaciones.
- Se desactiva el desplazamiento suave del remoto para que el acceso a la última defensa y la reserva del pie sean inmediatos. Densidad de escritorio ajustada para que las cuatro filas estén sobre la barra en los tres tamaños de iPad horizontal comprobados.
- `styles.css`, categorias.csv y todos los módulos js/ permanecen idénticos a la copia inicial, incluidos los cambios locales previos de estadísticas. La comparación de app.js fuera de buildDirectActions también es idéntica. Informe: `.test-artifacts/premium-ui-integridad.json`.
- Diferencias resueltas sin merge automático: estadísticas coloreadas y resumen local; orden/significado de botones; densidad táctil y móvil; configuración editable frente a encabezados asumidos por el remoto. No se encontró un conflicto que exigiera perder datos o funcionalidad.
- README.md actualizado conservando el resto del documento. Preparación estática y prueba de subruta incorporan premium.css: 13 archivos runtime. Tests modificados: preparar-pages.ps1, fase5-browser.mjs, fase4-browser.mjs y revisar-responsive.ps1. Los dos últimos verifican alturas/cuadrícula y capturan excepciones JavaScript mediante CDP; emulan foco y envían Tab para comprobar modalidad de teclado en headless.

### Verificación ejecutada

- Cinco suites Node: configuración (26 casos), registro (28 combinaciones/90 resultados), integración simulada, CSV y estadísticas. Todas superadas, sin instalar paquetes.
- Chrome headless con perfiles nuevos aislados y servidor loopback: Fase 2 (15 grupos), Fase 3 (13 grupos), Fase 5 (8 grupos y descarga nativa CSV con BOM) y Fase 6 (9 escenarios de estadísticas, recarga, Deshacer y aislamiento). Todos ok:true.
- Responsive: 13 escenarios de tamaño/ampliación, sin scroll horizontal, botones inferiores fuera de pantalla, nombres/cifras recortados ni controles por debajo de 44 px. La última defensa queda accesible sobre el pie al desplazar. Tres secciones y veinte defensas presentes; foco, selección y diálogos verificados.
- Medición explícita de igualdad de altura y cuadrícula 3×2 en los 11 tamaños sin ampliación, incluido 320×640. A 200% se verifica accesibilidad y ausencia de recortes, sin exigir alturas iguales si el texto necesita crecer.
- iPad emulado 1024×768, 1180×820 y 1194×834: las cuatro filas de Bloqueo directo visibles sobre los resultados sin scroll. Móvil y altura reducida utilizan scroll vertical.
- `.test-artifacts/premium-ui-javascript.json`: cero excepciones JavaScript sin capturar durante carga y auditoría responsive; operación Roller 2P, estadística y Deshacer correctos. Las suites funcionales comprueban también fallos esperados de almacenamiento.
- Capturas finales inspeccionadas en 1180×820 y 390×844. Informes/capturas adicionales en `.test-artifacts/fase4-premium-ui.json` y `premium-ui-*.png`. Paquete bajo /registro_defensas_baloncesto/ probado con CSS premium cargado; generado sin publicación.
- git diff --check sin errores de espacios. No se han utilizado perfiles ni datos reales para probar.

Pendiente: revisión visual del usuario, Safari/iPad físico, teclado virtual, zonas seguras reales y apertura del CSV en Excel. Las fuentes del sistema pueden diferir del diseño remoto. No se afirma auditoría completa de contraste o accesibilidad. Dashboard sigue como maqueta aislada; no implementado en esta tarea. Sin commit, push, despliegue ni modificación de main remoto.

## 25. Ajuste tipográfico final del diseño premium

Estado: completado el 13 de octubre de 2026, pendiente de revisión del usuario; sin commit, push ni publicación.

- Fuentes oficiales descargadas del repositorio google/fonts e incluidas en `fonts/`: Barlow Condensed Bold (títulos, categorías, acciones, defensas y situaciones de bloqueo) y Manrope variable (cifras, estadísticas, controles, formularios y mensajes), con ambas licencias OFL. Carga mediante rutas relativas desde premium.css; ninguna petición externa al utilizar la aplicación. Sustituye las alternativas del sistema como tipografía principal del apartado 24.
- `body, body * { text-transform: uppercase; }` y transformación de placeholders por CSS. Cubre estados dinámicos, opciones del selector, diálogos y valores visibles de los campos. No convierte el contenido de los nodos ni los valores de los inputs. La capitalización original se conserva al guardar y al exportar CSV. Los avisos y tooltips nativos del navegador no son elementos estilables por CSS y conservan su presentación nativa.
- Ajustados únicamente familia, peso, espaciado, tamaño e interlineado tipográficos. Nombres en 16 px, situaciones de bloqueo en 17 px; Estático a 14 px hasta 360 px para mantener legibilidad sin recortar o alterar su cuadrícula. Manrope y cifras tabulares en estadísticas. Colores, grids, espaciados de distribución y funcionalidades intactos; no se han editado app.js, index.html, styles.css, categorias.csv ni módulos js/ durante esta tarea.
- Copia previa de los archivos afectados en `.local-backups/` dentro de la carpeta `tipografia-*` de esta sesión. Se conservan todas las modificaciones locales anteriores.
- Preparador de paquete, prueba de subruta y README actualizados para incluir fuentes/licencias: 17 archivos. Cambios de prueba en fase4-browser.mjs y revisar-responsive.ps1 para esperar document.fonts.ready, confirmar ambas fuentes realmente cargadas, revisar mayúsculas de texto dinámico y diálogos y verificar valores mixtos de formulario intactos.
- Responsive Chrome headless, perfil aislado: 13 escenarios superados, desde 320 px, iPad, escritorio, horizontal, altura reducida y ampliación de texto/zoom CSS al 200%. Sin textos recortados ni scroll horizontal; objetivos táctiles ≥44 px; tres secciones y veinte defensas presentes. Misma altura Transición/Estático y cuadrícula 3×2 en tamaños sin ampliación. Cuatro filas de bloqueo sobre el pie en los tres iPad horizontales comprobados. Registro Roller 2P y Deshacer correctos.
- Cero excepciones JavaScript sin capturar. Fase 5: ocho grupos superados; descarga nativa CSV con BOM, capitalización original, recargas, históricos, fallos, aislamiento y carga real de fuentes bajo /registro_defensas_baloncesto/. No se repiten otras suites de lógica porque la implementación JavaScript no cambia.
- Capturas inspeccionadas: 1180×820, 390×844 inicial y final de la matriz, y 320×640. Informes `.test-artifacts/fase4-tipografia.json`, `tipografia-javascript.json`; capturas `tipografia-*.png`. `git diff --check` sin errores.

Pendiente: revisión estética del usuario y prueba en Safari/iPad físico (teclado, selector nativo, interacción táctil y zonas seguras). Dashboard permanece aislado como maqueta. No se modifica ni publica ninguna rama remota.

## 26. Copper Court — evolución funcional desde las dos referencias adjuntas

Estado: propuesta terminada y funcional el 13 de octubre de 2026; se detiene para valoración del usuario. Una dirección coherente aplicada al registro local, sin integrar el Dashboard ni iniciar otra fase.

### Lectura de las referencias y criterio

- Primera imagen: tarjetas suaves con volumen discreto, blancos/grises superpuestos, esquinas amplias, controles agrupados y una acción principal reconocible. Se adapta esa profundidad mediante gradientes estrictamente neutros, sombras negras de baja opacidad y tarjetas táctiles; no se copia la ilustración ciclista, el azul ni el recorrido de navegación.
- Segunda imagen: títulos condensados deportivos, métricas sans legibles, contraste fuerte y módulos simples con radios cuidados. Se adapta la jerarquía con Barlow Condensed Bold en cabecera/categorías/acciones/situaciones y Manrope en cifras, estadísticas y controles; ambas fuentes locales existentes se conservan. Sin fotografías decorativas que resten espacio al registro.
- Identidad Copper Court: blanco, negro y grises neutros. Único acento cromático #B87145, naranja cobrizo desaturado; variaciones claras/oscuras del mismo naranja para selección, foco y errores. Sustituye la semántica verde/roja de las fases anteriores por contraste y etiquetas/símbolos, conforme a la nueva instrucción del usuario.
- La barra inferior pasa a ser una superficie negra redondeada con controles fallados oscuros y anotados blancos. Orden 2✕, 3✕, 2✓, 3✓ y significado intactos. La selección se comunica también con borde doble, franja y ✓; los estados siguen descritos mediante mensajes, sin depender del color.
- Transición y Estático sobre tarjetas blancas; Estático conserva 3×2 y ambos tienen igual altura en tamaños normales. Bloqueo directo sobre plano gris suave, ejes discretos y defensas blancas. En móvil se compacta el espacio de encabezados respecto al diseño anterior y todas las defensas siguen desplegadas, accesibles por scroll vertical.

### Cambios y conservación

- `premium.css` reconstruido como una sola dirección visual, retirando la acumulación de correcciones visuales anteriores. Conserva mayúsculas CSS y fuentes locales, añade superficies, contrastes, estados y ajustes de altura/ampliación. Nombres pequeños mantienen al menos 14 px; objetivos táctiles ≥44 px.
- `index.html`: únicamente theme-color de #f8f8f6 a gris neutro #f5f5f5. Ningún cambio de estructura, IDs o flujo.
- README.md y esta especificación actualizados para explicar la identidad y la nueva semántica visual; pruebas responsive ampliadas con auditoría de colores calculados, selección, estados, mayúsculas y fuentes. Capturas editoriales sin anillo de foco, después de verificarlo en las mediciones.
- Nuevo comparador `tests/diseno-copper-court/revision.html`: antes/después con capturas equivalentes y móvil inicial/final, enlace a la aplicación real. Solo muestra imágenes, sin abrir IndexedDB; excluido de publicación por las reglas existentes.
- Copia previa `.local-backups/copper-court-20261013-215941/fuentes.tar.gz`: incluye código, fuentes, pruebas y documentación; excluye .git, copias previas y artefactos de pruebas. Conserva el diseño anterior completo para recuperación selectiva en una carpeta nueva.
- Comparación binaria frente a la copia: app.js, styles.css, categorias.csv y los siete módulos funcionales idénticos. index.html cambia únicamente metadatos de color. Informe `.test-artifacts/copper-court-integridad.json`. Sin reescritura de configuración, registros o contenido CSV. El paquete se regenera localmente con sus 17 archivos, sin publicar.

### Comprobaciones realmente ejecutadas

- Cinco suites Node superadas: configuración (26 casos), registro (28 combinaciones/90 resultados), integración simulada, CSV y estadísticas.
- Fase 3 Chrome: 13 grupos superados, incluidas las 90 combinaciones válidas en dos pulsaciones, doble toque, Deshacer, recargas, históricos, fallos y concurrencia entre dos pestañas.
- Fase 5 Chrome: ocho grupos superados, CSV con BOM y capitalización original, aislamiento, configuración/histórico, fallos de lectura, recarga inmediata, descarga nativa y rutas/fuentes bajo /registro_defensas_baloncesto/.
- Responsive: 13 escenarios emulados de 320–1440 px, horizontal, altura reducida y ampliación de texto/zoom CSS 200%. Sin scroll horizontal, nombres/cifras/resultados recortados o controles menores de 44 px. Última defensa accesible sobre la barra mediante scroll, diálogos contenidos incluso con texto ampliado; alturas superiores iguales y Estático 3×2 en tamaños normales.
- iPad 1024×768, 1180×820, 1194×834: las cuatro filas sobre la barra sin desplazarse. Móvil y altura reducida permiten scroll vertical. Se afinaron interlineados, altura compacta y ajuste del diálogo de eliminación al 200%, manteniendo su lógica.
- Cero excepciones JavaScript sin capturar. Paleta de colores calculados (texto, fondos/gradientes, bordes, foco y sombras), incluida selección y estados guardando/error/éxito: ningún color fuera de grises/neutros y naranja. No se cambia el color de nombres de defensas como Blue, Red o White: son etiquetas de configuración, mostradas en texto neutro.
- Capturas finales inspeccionadas de iPad 1180×820 y móvil 390×844 inicial/final; también durante la iteración 1024×768. Informes `.test-artifacts/fase4-copper-court.json`, `copper-court-paleta.json`, `copper-court-javascript.json`; capturas `copper-court-*.png`. `git diff --check` sin errores.
- Solo datos ficticios y perfiles Chrome nuevos aislados. No se ha navegado con el perfil del usuario ni alterado datos reales.

Pendiente: valoración estética y uso táctil/Safari en iPad físico, zonas seguras reales, reflejos/brillo, selector/avisos nativos y apertura real en Excel. No se afirma auditoría WCAG completa ni mejora de velocidad medida en partido. Las imágenes son referentes visuales, no activos añadidos al producto. Sin commit, push, fetch, cambio de rama ni modificación remota.

## 27. Herramientas de revisión visual — Playwright

Estado: tarea autorizada completada el 13 de octubre de 2026; se cierra para revisión, sin iniciar otra fase de diseño ni publicar.

- Instalado @playwright/test 1.64.0 como dependencia de desarrollo, fijada con package-lock.json. Node v24.21.0 ya estaba instalado en C:\Program Files\nodejs; se añade al PATH únicamente durante las ejecuciones, sin cambiar la configuración del sistema.
- Chromium, Headless Shell y componentes auxiliares descargados en .test-artifacts/playwright/browsers/. node_modules y artefactos excluidos de Git. Sin dependencias nuevas de producción ni cambios en HTML/CSS/JavaScript de la aplicación.
- playwright.config.mjs define escritorio 1440×900, móvil táctil 390×844 y móvil estrecho 320×740. tools/playwright/ contiene runner, servidor estático loopback con lista de archivos permitidos, prueba y guía. El runner inicia/detiene su propio servidor en 127.0.0.1:4173 y rechaza puertos ocupados; no reutiliza servidores ajenos. Se usa gestión directa del proceso Node para evitar el bloqueo observado en el cierre del webServer de Playwright en este entorno Windows.
- Comandos: npm run visual (capturas), npm run visual:abrir (navegador visible), npm run visual:informe (informe HTML), npm run visual:instalar (instalar Chromium). Para explorar con Inspector: npm run visual -- --debug --project=movil. README enlaza la guía reproducible.
- Cada prueba abre un contexto efímero independiente sin perfil personal ni storageState; solo crea un partido ficticio y un tiro. No borra bases ni modifica datos reales. Sin cambios en IndexedDB, configuración deportiva, lógica de registro o exportación.
- Verificación: tres proyectos superados en headless y escritorio superado adicionalmente con navegador visible. Registro en dos pulsaciones y recarga correctos; 28 destinos, sin errores JavaScript/carga, sin desbordamiento horizontal y botones de resultado visibles de al menos 44×44 px.
- Se generan 18 PNG (seis por tamaño) con estado inicial, formulario, partido activo, selección, registro recargado y final de página. Capturas de página completa y viewport adjuntas al informe en .test-artifacts/playwright/report/. Las ejecuciones sustituyen los resultados anteriores; conservar copias para comparar iteraciones.
- Inspección visual realizada de las capturas completas con registro en los tres tamaños: módulos legibles, secciones desplegadas y sin recortes horizontales; móvil usa scroll vertical y todas las defensas aparecen. Las comprobaciones automáticas no sustituyen el juicio estético.

Pendiente: valoración del usuario y pruebas en Safari/dispositivos físicos. No se establecen referencias de píxeles aprobadas ni se cambia el diseño durante esta tarea. Sin commit, push o despliegue; cambios locales previos conservados.

## 28. Exploración independiente con frontend-design — Pulse / Bench / Switch

Estado: tres propuestas visuales terminadas el 13 de octubre de 2026. Se cierra para elección de dirección artística; no se integra ninguna en la aplicación principal. Copper Court queda descartada como propuesta estética, aunque sus archivos runtime se conservan intactos hasta autorizar un reemplazo.

- Habilidad leída y aplicada: `.agents/skills/frontend-design/SKILL.md`. Plan previo con tokens, tipografía, diagramas ASCII y autocrítica en `tests/exploracion-frontend/README.md`. Las mayúsculas solicitadas tienen prioridad sobre la preferencia genérica de la habilidad por sentence case.
- Las dos imágenes adjuntas se analizan como referentes de superficies suaves, agrupación de controles, proporción tipográfica y contraste deportivo. Se evitan fotografías y navegación decorativa que resten espacio a las defensas. Las tres opciones cambian estructura y manejo espacial, no solo color/bordes.
- Pulse: Manrope con títulos compactos, superficies claras suaves, situaciones a la izquierda y cuatro columnas de tipos de bloqueo, resultados circulares en una cápsula flotante. Naranja #B8815D. En móvil, tipos de bloqueo en dos columnas; requiere más scroll que una matriz horizontal.
- Bench: Manrope fuerte en fondo negro, herramientas a la izquierda, situaciones y matriz central, cuatro resultados grandes en columna derecha en escritorio. Naranja #B8825E. En móvil pasa a matriz compacta y resultados inferiores; hay que valorar la nueva ubicación lateral de los resultados en escritorio.
- Switch: Manrope con nombres grandes y proporciones asimétricas en un lienzo blanco sin tarjetas exteriores. Dos objetivos grandes de Transición, seis filas de Estático, bloqueos a la derecha y controles inferiores alargados. Naranja #C08C65. En móvil conserva objetivos protagonistas y necesita más desplazamiento que Bench.
- Solo blanco, negro, grises neutros y un naranja desaturado por propuesta. Valores y texto originales conservados; presentación en mayúsculas por CSS. Las tres utilizan la misma muestra ficticia: 114 intentos, 78 fallados, 36 anotados, 68%; PR Manejador/Blue 7–3 · 70%.
- Entregables nuevos únicamente en `tests/exploracion-frontend/`: tres HTML y sus hojas CSS, base accesible, generador, muestra JS, simulador en memoria, comparador, scripts de captura/servidor, informes y capturas. Las etiquetas y permisos se obtienen del CSV local durante generación. Ninguna demo importa app.js, abre IndexedDB, usa localStorage, exporta datos o consulta partidos reales.
- Se puede seleccionar una acción/defensa y pulsar resultado para simular un tiro; Deshacer y Reiniciar muestra afectan solo a memoria. Doble toque consume una selección una sola vez; Roller bloquea 3P según permisos del snapshot CSV. Recargar reinicia la muestra.
- Playwright existente, sin nuevas instalaciones ni cambios de package.json/configuración: Chromium real en 12 escenarios headless (tres propuestas × 1440×900, 390×844 táctil, 320×740 táctil, 1180×820) y seis escenarios adicionales con navegador visible (--headed --primary). Todas las verificaciones superadas. Las comprobaciones con contextos independientes no utilizan el perfil personal.
- 38 PNG finales: viewport, página completa y final por variante/tamaño, más comparaciones escritorio/móvil. Capturas visualmente revisadas de las tres propuestas en escritorio y móvil; refinados tipografía de cifras, espaciado del título y compactación de Switch en móvil. Comparador verificado en navegador, con sus nueve imágenes cargadas y tres vistas CSS seleccionables.
- Verificado: 28 destinos, 20 defensas, tres secciones desplegadas, resultados dentro del viewport, objetivos ≥44×44, ausencia de scroll horizontal/recortes, paleta permitida, mayúsculas, simulación de dos pulsaciones/Deshacer/permiso Roller, selección visible, foco de teclado y cero errores JavaScript/carga. La última defensa queda accesible por scroll sin quedar tapada por el pie fijo. Contextos con localStorage vacío y ninguna base IndexedDB.
- SHA-256 de 12 archivos runtime al inicio y al cierre: iguales, incluyendo index.html, app.js, styles.css, premium.css, categorias.csv y siete módulos js/. `integridad-inicial.json`, `verificacion.json` y `verificacion-visible.json` documentan las comprobaciones. No se repiten las regresiones de la aplicación real porque no se modifica ni se ejecuta desde estas demos.
- Comparador: `tests/exploracion-frontend/comparacion.html`; puede abrirse con el servidor de revisión en http://127.0.0.1:4182/. El servidor de capturas usa 4181 y se cierra al finalizar. El de revisión solo permite demos/capturas/fuente; no sirve la aplicación principal. Ambas rutas son locales, no despliegues.
- Se conserva copia previa de ESPECIFICACION.md en `.local-backups/exploracion-*/`; todos los cambios locales anteriores permanecen. Nuevos archivos de exploración excluidos de Git/publicación por la regla tests/ existente. Sin commit, push, fetch ni cambios remotos.

Pendiente: elección del usuario, evaluación táctil en dispositivo físico/Safari y autorización de una integración posterior. No se afirma auditoría WCAG completa, zoom nativo validado o rapidez de registro medida en partido. Las diferencias de densidad, disposición de defensas y posición de resultados son parte de la exploración y deberán revisarse antes de incorporarlas al registro real.

## 29. Evolución visual del premium original — propuesta aislada

Estado: propuesta única completada el 13 de octubre de 2026 y detenida para revisión, conforme a la petición del usuario de verla antes de aplicar cambios a la aplicación principal. No se inicia integración.

### Base y diagnóstico

- Leída la habilidad local frontend-design y documentado el plan antes de construir. La distribución solicitada y las mayúsculas prevalecen sobre preferencias genéricas de la habilidad.
- Comparados archivos locales, estilos finales de origin/design/premium-ui (c41774782bc216ca069fbf309c1a1274c0ae2398), diferencias HTML y capturas locales de la integración. No se hace fetch ni se cambia de rama.
- Los cuatro adjuntos visibles son referentes de superficies/aplicaciones; no contienen una captura identificable del registro original. Se utiliza como evidencia complementaria la captura local .test-artifacts/premium-ui-1180-820-1.png, sin presentarla como el adjunto del usuario.
- La integración preservó controles táctiles, orden local de resultados, estadísticas, ejes condicionales según CSV y reflujo móvil. Copper Court cambió posteriormente proporción superior 1:1,6 a 1:2, paneles grises a blancos, pie claro a negro y retiró el soporte interior de la matriz. Las demos Pulse/Bench/Switch alteraban la distribución y quedan descartadas como dirección vigente.

### Propuesta entregada

- tests/evolucion-premium/: HTML basado en index.html y reproducción de clases/envolturas reales de las acciones y buildDirectActions. Generación de etiquetas/permisos desde categorias.csv mediante el parser puro existente. Misma muestra ficticia en propuesta, reproducción actual y referencia remota.
- Recupera Transición izquierda / Estático derecha 1:1,6, igual altura, Estático 3×2, módulos grises, botones blancos, matriz horizontal con su plano interior y barra inferior clara fija. Móvil apila secciones y mantiene todas las defensas desplegadas; desplazamiento vertical permitido.
- Naranja cobre #C38053 con variantes del mismo tono. Grises estrictamente neutros, sombras negras suaves, bordes iluminados, gradientes contenidos y translucidez reservada a soportes y pie. Botones opacos para conservar lectura. Selección sólida con marca, fila/columna resaltadas, foco y respuesta de pulsación; reducción de movimiento respetada.
- Barlow Condensed local conserva los títulos originales; Manrope en nombres, herramientas y cifras. Todos los textos visibles de la maqueta en mayúsculas. Símbolos y etiquetas distinguen fallado/anotado por luminancia, sin colores adicionales; etiquetas de resultado visibles también a 320 px.
- demo.js simula selección, tiro y deshacer exclusivamente en memoria; recargar restablece la muestra. Gestión de partidos/CSV muestra un aviso de maqueta. No se importa app.js, no se abre almacenamiento, no se registra ni exporta dato real. El estado dice DEMO · EN MEMORIA, sin fingir transacciones guardadas.

### Verificación y revisión

- Chromium 156.0.8078.4 de Playwright existente, seis tamaños tanto headless como navegador visible: 1440×900, 1180×820, 1024×768, 768×1024, 390×844, 320×740. Versión exacta registrada en los informes; sin instalar dependencias.
- 28 objetivos / 20 defensas / tres secciones; Estático 3×2, paneles paralelos de igual altura; sin scroll horizontal ni recortes de nombres/cifras; controles ≥44×44 px; cuatro resultados en viewport y última defensa accesible sobre el pie al desplazar. Toda la matriz cabe sobre el pie en los cuatro tamaños de escritorio/tablet probados.
- Refinamientos derivados de capturas: compactación en 1024×768, selección que prevalece sobre hover y cifras de defensas a 11 px. Paleta calculada verificada incluyendo gradientes, mayúsculas, foco mediante Tab, simulación de dos pulsaciones, doble toque consumido una vez, Roller 2P, Deshacer y recarga. Cero errores de JavaScript/carga; IndexedDB sin bases y localStorage vacío en todos los contextos efímeros.
- 26 capturas de propuesta/referencias más captura del comparador. Inspeccionadas imágenes de escritorio, tablet y móvil; comparador abierto y verificado en Chromium visible con las tres vistas y todas sus imágenes cargadas. Las capturas completas móviles contienen el pie fijo a la altura del viewport; el comparador usa capturas de inicio y final para evitar confundir ese comportamiento de captura con una superposición permanente.
- Informes: tests/evolucion-premium/verificacion.json, verificacion-visible.json e integridad-inicial.json. SHA-256 de los 12 archivos runtime idéntico al inicio: HTML/CSS/JS/configuración intactos, incluidos cambios locales previos. Copia previa de especificación en .local-backups/evolucion-premium-20261013/.
- Revisión local: http://127.0.0.1:4183/tests/evolucion-premium/revision.html. Demo: http://127.0.0.1:4183/. Scripts servir.mjs, abrir.mjs y capturar.mjs documentados en el README de la propuesta. Servidor loopback limitado a maqueta, capturas y fuentes; nunca sirve la aplicación funcional.

Pendiente: valoración estética del usuario antes de integrar, Safari/dispositivo físico, brillo/reflejos y tacto real. No se afirma auditoría WCAG completa, zoom nativo validado o mejora de rapidez medida. No se repiten regresiones de persistencia/CSV al no modificar ni ejecutar la aplicación real. Sin commit, push, publicación o cambios en ramas remotas.

## 30. Premium cristal — nueva evolución visual aislada

Estado: propuesta terminada el 13 de octubre de 2026, pendiente de valoración antes de integrar. El usuario autoriza cambiar completamente el fondo siempre que siga claro, y exige un cambio perceptible en cristal, profundidad, materiales e iconografía, conservando la distribución premium. Se cierra esta tarea sin iniciar integración.

### Decisión visual y alcance

- Base: propuesta recuperada del apartado 29. Se revisan especificación, CSS/HTML local y herramientas existentes. Se continúa aplicando frontend-design; plan previo, esquema y autocrítica en tests/premium-cristal/README.md. El fondo casi uniforme y los paneles poco transparentes de la propuesta anterior limitaban el efecto vidrio; la cabecera carecía de un material propio.
- Nueva prueba en tests/premium-cristal/, sin sustituir tests/evolucion-premium/ ni archivos principales. premium-anterior.css conserva la geometría; cristal.css introduce únicamente materiales, fondo e iconos añadidos al HTML de prueba.
- Fondo perla con bandas de luz satinadas, halo circular y luz ambiental, hecho con CSS, sin imágenes generadas ni descargas. Blanco, negro, grises neutros y variaciones de un único naranja cobre #C17C4B. Las formas viven en una capa fija decorativa sin ocupar espacio ni captar eventos.
- Cabecera y pie de vidrio: bordes blancos, reflejos, sombras y backdrop-filter real de 22/26 px. Paneles con blur de 22 px y transparencia suficiente para ver la iluminación de fondo. Botones lechosos más densos mantienen la lectura; ejes de matriz más planos; selección cobre con relieve y marca. Resultados grafito/plata con reflejos suaves y signos/etiquetas originales.
- Siete iconos SVG lineales coherentes, locales y decorativos (aria-hidden). Acompañan etiquetas, nunca las sustituyen. Los iconos de sección se omiten cuando provocarían una fila extra: paneles superiores entre 761–1000 px y secciones móviles hasta 360 px. Se conservan todos los textos y los cuatro iconos de herramientas.
- Se mantienen fuentes locales: Barlow Condensed en títulos deportivos originales y Manrope en acciones, controles y cifras. Todos los textos visibles en mayúsculas. Transición/Estático 1:1,6 alineados; Estático 3×2; matriz horizontal; cuatro resultados fijos. No se cambian tamaños tipográficos ni se reducen objetivos táctiles respecto a la propuesta anterior.
- Microinteracciones de 180 ms responden a hover/pulsación/selección; no hay animación ambiental continua y se respeta prefers-reduced-motion. Fallback opaco claro si backdrop-filter no está disponible.

### Aislamiento y evidencia

- antes.html e index.html comparten muestra ficticia, selección, clases/IDs, simulador y distribución. La muestra se contrasta por IDs y permisos contra categorias.csv local mediante el parser puro existente. demo.js y muestra.js son copias sin cambios de la prueba anterior.
- La demo simula tiros y Deshacer solo en memoria; reinicia al recargar. Partidos y CSV se representan con aviso de maqueta; no se presenta como funcionalidad de producción. No importa app.js, no abre IndexedDB/localStorage ni consulta o modifica datos reales.
- Capturas antes/después a dimensiones idénticas en seis tamaños: 1440×900, 1180×820, 1024×768, 768×1024, 390×844 y 320×740. Inspección visual de escritorio, tablet compacta y móvil inicial/final. El nuevo fondo se transmite a los soportes, la cabecera gana un borde de vidrio visible, los paneles proyectan sombras, los controles tienen materiales distintos y los iconos quedan integrados.
- Tras inspección se suaviza el reflejo de los resultados y se aclara el extremo oscuro del cobre a #BD7A4C. Contraste conservador calculado para ese extremo: 4,89:1 con texto #261A11 en Nuevo partido y superior a 5:1 con #211810 en selección. No constituye una auditoría completa WCAG ni una medición de todos los fondos translúcidos.
- Playwright/Chromium 156.0.8078.4 ya instalado, sin nuevas dependencias: seis escenarios headless y los seis repetidos con navegador visible. 28 objetivos, tres secciones, 20 defensas, Estático 3×2, altura de paneles iguales y geometría superior comparada con el antes (tolerancia 2 px). Sin desbordamiento horizontal, nombres/cifras recortados ni controles menores de 44×44. Matriz completa sobre el pie en escritorio/tablet y última defensa accesible por scroll en móvil.
- Comprobados estilos efectivos de blur en cabecera/paneles/pie, iconos, paleta, mayúsculas, foco Tab, transiciones y movimiento reducido. Simulación de dos pulsaciones, consumo único en doble toque, Roller 2P, Deshacer y recarga correctos. Cero errores JavaScript/carga, ninguna base IndexedDB ni entrada localStorage en contextos efímeros sin perfil personal.
- Comparador revision.html con alternancia antes/después en seis tamaños y vista móvil desplazada; cuatro capturas de detalle para cabecera, paneles, matriz y barra. Abierto en Chromium visible y verificada la carga de todas las vistas. Hay 40 capturas de aplicación y detalles, más una del comparador. Las capturas completas de móvil incluyen el pie fijo a la altura del viewport; el comparador usa inicio/final para evaluar el desplazamiento.
- Informes: tests/premium-cristal/verificacion.json, verificacion-visible.json e integridad-inicial.json. 12 archivos runtime conservan SHA-256 inicial, incluida toda la lógica/configuración y los cambios locales. Copia previa de especificación en .local-backups/premium-cristal/ESPECIFICACION.md.

Revisión: http://127.0.0.1:4185/tests/premium-cristal/revision.html. Prueba: http://127.0.0.1:4185/. Scripts servir.mjs y abrir.mjs para revisión, capturar.mjs para reproducción (servidor efímero 4186). Servidores solo loopback y lista permitida de maqueta/capturas/fuentes; no sirven la aplicación funcional.

Pendiente: aceptación visual del usuario, Safari/dispositivos físicos, tacto, reflejos y rendimiento real del blur en tablet. No se afirma mejora de rapidez de registro medida ni auditoría completa de accesibilidad. Sin integración, commit, push, fetch, publicación o modificaciones remotas. La aplicación funcional y la propuesta anterior se conservan intactas.

## 31. Integración autorizada de Premium cristal y Estadísticas

Estado: completada localmente el 14 de octubre de 2026, pendiente de revisión del usuario. La aprobación explícita de la propuesta del apartado 30 autoriza integrar su diseño, conectar Estadísticas y añadir navegación. Se cierra esta fase sin commit, push, fetch, despliegue ni cambios remotos.

### Protección y alcance

- Antes de editar: `.local-backups/integracion-cristal-20261014-063235/` contiene proyecto-previo.tar.gz (277 entradas de fuentes, pruebas, documentos y fuentes tipográficas), parche de cambios locales, estado Git, HEAD y hashes iniciales. Excluye .git, dependencias instaladas, artefactos temporales y copias anteriores. Se verificó el listado del archivo. `propuesta-aprobada/` conserva una copia independiente de toda la demo; sus 57 archivos coinciden por SHA-256 con la propuesta original al finalizar.
- premium.css contiene exactamente las dos capas aprobadas, premium-anterior.css + cristal.css; solo se ajustan rutas de fuentes. HTML recibe ambiente e iconos de la demo conservando IDs, diálogos y lógica real. No se restauran archivos de una rama ni se reemplaza app.js. styles.css, categorias.csv y los siete módulos centrales conservan sus hashes iniciales, incluidos cambios locales anteriores.
- Se añade dashboard.css para navegación y la adaptación del Dashboard existente al mismo material. Botón Estadísticas / Registro con texto, icono y objetivo de 44 px, controles de partido compartidos, rutas hash y navegación Atrás/Adelante. Conserva selección en curso al alternar; resultados ocultos y deshabilitados durante consulta. En escritorio compacto, el botón requiere una primera fila 12 px más alta; la matriz sigue visible sobre el pie. La comparación de anchos descuenta el espacio de las barras nativas de scroll.
- Estadísticas reutiliza la composición de Fase 7: tres resúmenes, éxito global y puntos, Transición/Estático y defensas agrupadas de Bloqueo directo. Se conectan datos reales del partido activo, sin modificar eventos, esquema o cálculos existentes. Barras grafito/naranja con leyenda, cifras y volúmenes visibles. Sin intentos: guion. Ranking de Estático/Directo ascendente por tasa exacta, vacío al final. No se añaden distintivos ni umbrales de muestra que permanecían pendientes en la maqueta.
- Nuevos módulos js/vistas.js y js/dashboard.js. Modelo de solo lectura con filtro redundante por gameId, identidades estables y conservación de filas históricas retiradas. Eventos no clasificables siguen en total global/CSV y se informa su volumen. No se añade exportación ni persistencia. Avisos de operación/error disponibles también en Estadísticas; los avisos para elegir resultado solo aparecen en Registro.

### Verificación realizada

- Pruebas unitarias de configuración, registro, estadísticas, CSV e integración existentes correctas; nueva prueba dashboard.test.mjs para aislamiento, agrupación, ranking, vacíos, legado v1, renombrados, retirados y desconocidos, sin mutar entradas.
- Chromium 156.0.8078.4 visible, perfiles efímeros aislados: suites de navegador Fase 2 (15 grupos), Fase 3 (13), Fase 5 (8) y Fase 6 (9) correctas. Cubren persistencia/migración, concurrencia, abortos, doble toque, permisos de tiro, histórico, recarga, Deshacer y CSV. Prueba adicional de dos partidos/dos pestañas verifica aislamiento de Estadísticas, sincronización, Deshacer remoto, cancelar/eliminar solo el seleccionado, recarga de la vista y navegación en subruta Pages.
- Comparaciones a 1440×900, 1180×820, 1024×768, 768×1024, 390×844 y 320×740, con los mismos 114 tiros ficticios y defensa seleccionada que la demo. Registro real, selección mantenida al alternar, un solo tiro ante doble toque, actualización de Estadísticas, Deshacer y descarga CSV con BOM correctos en cada tamaño. Cero errores de JavaScript en esos recorridos.
- Capturas inspeccionadas de registro, estadísticas y diálogo. Misma altura y anchura útil de paneles superiores; mismo fondo, sombra, blur y radio computados que la propuesta. Estático 3×2, paneles alineados, matriz accesible y cuatro resultados en viewport. Sin scroll horizontal, nombres/cifras recortados ni objetivos menores de 44×44. Paleta calculada exclusivamente neutra/naranja, incluidos gradientes. Reflejos y transparencia mantienen lectura de etiquetas y cifras en las capturas; no se alteran sus materiales aprobados.
- Preparación estática actualizada a 20 archivos y verificada bajo /registro_defensas_baloncesto/, sin publicar. Comparador y aplicación abiertos en Chromium visible; verificadas todas las imágenes del comparador. Servidor local restringido: http://127.0.0.1:4191/ . Comparador: http://127.0.0.1:4191/tests/integracion-cristal/revision.html . Reproducción en tests/integracion-cristal/README.md.
- Informes: tests/integracion-cristal/verificacion-visible.json, integridad-final.json y capturas/. El informe verificacion.json corresponde a la primera pasada sin ventana; el visible es la comprobación final. Copias de seguridad y propuesta aprobada conservadas. Ningún perfil personal ni dato real se usó para probar.

Pendiente exclusivamente de revisión de la integración local. No se inicia otra fase. Safari, dispositivos físicos, tacto y rendimiento de blur en hardware real siguen sin comprobarse; no se afirma auditoría completa de accesibilidad ni mejora de rapidez medida. El almacenamiento depende del origen: el puerto de revisión puede aparecer vacío aunque otro servidor local conserve partidos; no se migran datos entre orígenes.

## 32. Publicación oficial autorizada — 14 de octubre de 2026

El usuario aprueba la integración Premium Glass y autoriza commit, integración segura en main, push normal y verificación pública. Se conserva el diseño y la funcionalidad local, sin añadir características. Copia integral y parche en .local-backups/publicacion-premium-20261014/; rama respaldo/antes-premium-glass-20261014 conserva HEAD previo. Publicación limitada a los 20 archivos runtime, README y .gitignore; se excluyen documentos internos, pruebas, herramientas, dependencias, copias y perfiles. Identidad Git del usuario sin coautoría. Seis suites Node superadas; navegador en curso.

### Cierre de publicación

Commit oficial: 7a3557bcff3ba4e022c92a57740da8495f652380, autor y committer itsasnehezkuntza, sin coautoría. Push normal completado; main y origin/main sincronizados (0/0). Fetch previo confirmó que no había cambios remotos nuevos; no fue necesaria una fusión. Ramas anteriores conservadas; respaldo/premium-glass-aprobado-20261014 apunta a la versión aprobada y respaldo/antes-premium-glass-20261014 al commit anterior.

GitHub Pages confirmado por API: main, raíz /, build built del commit oficial sin errores. URL: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/ . Los 20 archivos runtime públicos responden 200 y coinciden con local (texto normalizado solo en saltos CRLF; fuentes comparadas byte a byte). Licencias OFL originales conservadas, incluidos sus espacios finales, sin alterar contenido.

Pruebas: seis suites Node correctas; suites Chromium fases 2, 3, 5 y 6 correctas; comparación contra propuesta aprobada a 1440×900, 1180×820, 1024×768, 768×1024, 390×844 y 320×740 correcta. Sobre Pages: dos partidos, aislamiento, sincronización entre pestañas, Deshacer remoto, cancelar/eliminar solo seleccionado y recarga de vista correctos. En seis tamaños: 28 destinos, requisito de partido, Roller solo 2P, registro 2P/3P, doble toque único, estadísticas 50%/100% y puntos, recarga, CSV con BOM y dos eventos, controles ≥44 px, blur 22 px y sin desbordamiento. Cero errores JavaScript en esos recorridos. Captura de escritorio publicada inspeccionada y diseño conservado. Informes y capturas locales en .test-artifacts/publicacion-verificada.json y publicada-*.png; runner verificar-publicacion.mjs. Se usaron contextos efímeros sin datos reales.

No se modificaron diseño ni funcionalidades para publicar. README público actualizado para la versión oficial y retirados enlaces a archivos internos no publicados. No se publica documentación interna, dependencias ni herramientas. Pendientes únicamente comprobaciones que requieren otros entornos: Safari/Firefox, dispositivos físicos, tacto/rendimiento real de blur y apertura real del CSV en Excel. Publicación terminada; no se inicia otra fase.

## 33. Fase 7 — Auditoría de puntos y matriz de Bloqueo directo

Solicitud autorizada el 14 de octubre de 2026. Trabajo local; detenerse para revisión final, sin push ni despliegue. La paleta y los materiales Premium cristal aprobados son obligatorios.

### Auditoría previa (antes de editar código)

`summarize` cuenta un intento por evento, un anotado/fallado según resultado y suma el valor 2/3 únicamente al anotar. La persistencia valida valores numéricos 2/3 y resultados. El Dashboard filtra por partido activo y usa ese mismo resumen para global, categorías, acciones y estrategias. Las combinaciones del registro también usan `summarize`. No se encontró un error aritmético: comprobación independiente de 45 agregaciones con los 90 resultados permitidos (45 anotados, 45 fallados, 109 puntos), más las suites previas de registro y Dashboard, correcta.

36 canastas y 77 puntos son compatibles con 31 dobles y 5 triples. Es una comprobación de coherencia, no una inspección de los eventos reales de la captura. No se ha accedido a datos personales. Falta mostrar puntos por acción/combinación y puntos por tiro; el ranking anterior compara éxito defensivo, no eficiencia en puntos.

### Contrato de implementación y comparación

- Una tabla HTML semántica de 20 combinaciones, cuatro totales por tipo, cinco por defensa y total general. Ejes derivados del CSV, con identidades históricas retiradas añadidas y señaladas para no perder eventos. Ninguna escritura ni contador derivado persistido.
- Porcentaje y puntos destacados; puntos/tiro visibles, seis métricas completas al pulsar o activar con teclado. Un panel de detalle; selección solo en memoria, conservada en refrescos del mismo partido y restablecida al cambiar de partido. Sin nueva URL ni almacenamiento.
- Matriz a todo el ancho del Dashboard, ranking complementario de estrategias, Transición/Estático conservados con puntos y cociente. Solo DOM/CSS nativos; unas 30 celdas, actualizadas desde el snapshot confirmado por el flujo existente, sin bucles de animación ni dependencias.
- En tablet horizontal se aprovecha todo el ancho; móvil usa scroll interno con cabecera de fila fija y nombres accesibles completos. Tamaños legibles y objetivos ≥44 px. Sin alterar estilos del registro ni la cabecera.
- Comparar puntos/tiro exactos, menor es mejor, mínimo provisional 5 intentos. Tres conjuntos independientes: combinaciones, tipos y estrategias. Se requieren al menos dos candidatos con tasas diferentes; empates en extremos comparten etiqueta. Sin datos: guion y texto explícito; 1–4 intentos: muestra pequeña, sin distintivo. El total general no compite. Ranking ascendente por puntos/tiro; vacíos al final, empates mantienen orden de configuración.
- Paleta existente: barras grafito/naranja intactas; etiquetas y bordes neutros/cobre para extremos y selección. No introducir verde/rojo ni modificar fondos, fuentes o materiales generales.

### Implementación y cierre

Completada localmente. Producción modificada únicamente en `js/dashboard.js` y `dashboard.css`. El cálculo original de `js/estadisticas.js` no necesita corrección y permanece intacto. Los cocientes y distintivos se derivan en memoria de cada snapshot; no se guardan en eventos ni en IndexedDB. El porcentaje se presenta redondeado al entero y puntos/tiro a dos decimales con coma; las comparaciones utilizan productos cruzados sin redondear.

La matriz presenta 20 combinaciones y 10 totales. El ranking complementario permanece siempre desplegado. El detalle muestra intentos, fallados, anotados, éxito, puntos y puntos/tiro y se actualiza al Deshacer o recibir nuevos datos del mismo partido. En móvil la columna de tipos es fija; al activar una celda se ajusta el scroll interno para verla completa y se muestra su detalle. Se conservan todas las estadísticas de Transición/Estático y el resumen de las tres categorías.

Las filas/columnas históricas se añaden cuando existen eventos con identidades retiradas; una defensa ausente con identidad de categoría/acción se muestra en un eje histórico explícito. Eventos que no permiten identificar categoría continúan en total global y CSV con aviso de volumen, como antes. Nunca se inventa una equivalencia por nombres ni se reescriben eventos.

### Verificación realizada

- Siete suites Node correctas: configuración (26 pruebas), registro (28 destinos/90 resultados), integración, estadísticas, exportación, Dashboard y nueva matriz. La nueva suite comprueba 57 agregaciones por expectativas independientes, las cuatro reglas de resultado, 36 canastas/77 puntos en seis niveles, sumas de celdas/filas/columnas, cocientes ponderados, mínimo 5, empates y tasas que redondean igual, vacíos, aislamiento, legado v1, renombrados, retirados y entradas inmutables.
- Chromium 156.0.8078.4, contextos efímeros: regresiones Fase 2 (15 grupos), Fase 3 (13), Fase 5 (8, incluida descarga) y Fase 6 (9) correctas. Partidos, sincronización entre pestañas, Deshacer remoto, eliminar solo seleccionado, recarga y carga desde paquete bajo `/registro_defensas_baloncesto/` correctos. Paquete local de 20 archivos, sin publicar.
- Cinco tamaños: 1180×820, 1024×768, 390×844, 320×740 y 844×390. Treinta celdas, las veinte combinaciones activadas y seis métricas accesibles, foco de teclado visible, recarga, triple registrado con doble toque que genera un solo evento, Deshacer conservando el detalle seleccionado y CSV con BOM y filas del activo correctos. Cero errores de JavaScript/carga en estos recorridos.
- Cero desbordamiento horizontal de página; matriz completa a lo ancho en ambos iPad. En móvil, scroll interno y celda seleccionada íntegra junto al eje fijo. Objetivos ≥44 px y textos/cifras sin recorte dentro de sus celdas. Barras calculadas #444 y #c17c4b; auditoría de estilos del Dashboard sin colores ajenos a neutros/cobre. Inspeccionadas capturas completas, matriz y detalle en tablet/móvil. Afinada alineación vertical de celdas sin cambiar tamaños de texto.
- Muestra ficticia de capturas: 128 intentos, 68 fallados, 60 anotados y 141 puntos (53% y 1,10 pts/tiro); Bloqueo directo: 88 intentos, 44 fallados, 44 anotados y 103 puntos (50% y 1,17 pts/tiro). Incluye triples/dobles, sin datos, muestras de un intento al 100% sin distintivo, y empates. Es distinta de la comprobación aislada de 36/77.
- SHA-256 idéntico al inicio en diez archivos protegidos: index.html, premium.css, styles.css, app.js, categorias.csv, estadisticas.js, registro.js, persistencia.js, exportacion.js e identidad.js. La pantalla de registro y sus reglas no se modifican. Copia previa en `.local-backups/fase7-matriz-20261014/`. `git diff --check` sin errores.

### Entrega y pendientes

Revisión con capturas: `tests/matriz-fase7/revision.html` (se abre localmente sin servidor ni acceso a IndexedDB; todas sus imágenes verificadas). Reproducción en `tests/matriz-fase7/README.md`; informes `verificacion.json`, `verificacion-visual.json` (última pasada tras el ajuste de visibilidad móvil) e `integridad.json`; 26 capturas en `capturas/`. Pruebas y documentos internos mantienen su exclusión de publicación.

Pendiente revisión visual/funcional del usuario y confirmar o ajustar el umbral provisional de cinco intentos. Las comprobaciones de tablet/móvil son emulación Chromium; Safari/iPad físico, tacto, lector de pantalla completo y Excel real siguen pendientes. No se han usado datos ni perfiles reales, añadido Firebase/Capacitor, cambiado el esquema o instalado dependencias. Sin commit, push, despliegue ni cambios remotos. Fase cerrada para revisión; no se inicia la siguiente.

## 34. Ajuste solicitado — Solo puntos en Registro y Estadísticas

El usuario precisa durante la revisión: «No quiero que me contabilices el número de tiros en ninguna, solo el número de puntos, tanto en registro como en estadística». Esta instrucción sustituye la presentación de recuentos y métricas del apartado 33. Se planteó opcionalmente si conservar porcentajes/cocientes; sin respuesta adicional se aplicó la interpretación literal, comunicada antes de editar: únicamente puntos concedidos.

- Registro: cada acción, defensa, tipo, categoría y total muestra puntos concedidos. Bajo los botones se conserva solo una cifra o un guion; el total se etiqueta «Puntos concedidos». 2✓ aporta 2, 3✓ aporta 3, ambos fallos aportan 0. Sin datos: —; datos con cero puntos concedidos: 0.
- Dashboard: resumen global y por categorías, 20 combinaciones, totales de filas/columnas, detalle seleccionado, estrategias, Transición y Estático muestran únicamente puntos. Se retiran recuentos de intentos/fallados/anotados, porcentajes, puntos/tiro y distintivos. Las etiquetas accesibles tampoco muestran recuentos. El resumen de estrategias se ordena por puntos totales, sin calificarlo como mejor/peor eficacia.
- Barras con los mismos colores: naranja representa puntos concedidos, grafito completa la escala común explícita del grupo. No representan porcentajes de tiros. Superficies, fuentes, fondos, cabecera y pantalla de registro conservan sus estilos; solo cambian los valores presentados. La matriz se compacta al mostrar una única cifra por celda.
- Los eventos se conservan íntegros. Se mantienen cálculos internos de auditoría y detección de ausencia de datos; no se almacenan contadores nuevos. IndexedDB, IDs, CSV, Deshacer y registro en dos pulsaciones conservan el contrato previo. CSV sigue siendo un evento por fila con sus columnas originales, como se había solicitado preservar.

### Verificación y entrega vigentes

Siete suites Node superadas. Regresiones de navegador Fases 2/3/5/6 correctas, con expectativas de presentación actualizadas y controles de número de eventos mantenidos sobre almacenamiento. Conservan comprobaciones de recarga, concurrencia, doble toque, fallos, histórico, partidos, CSV y rutas relativas. Las pruebas internas siguen contando eventos para detectar pérdidas/duplicados; ese dato no se muestra en la aplicación.

Nuevo runner `tests/puntos-fase7/verificar.mjs`: cinco tamaños (1180×820, 1024×768, 390×844, 320×740, 844×390), treinta celdas y detalle de puntos correcto en las veinte combinaciones; ausencia de recuentos/porcentajes/cocientes en ambas vistas; teclado, celda visible, recarga, doble toque, Deshacer, CSV y paleta correctos. Capturas inspeccionadas de registro y Dashboard en tablet/móvil, sin desbordamiento horizontal de página. Cero errores JavaScript/carga. La muestra concede 141 puntos globales y 103 en Bloqueo directo.

Capturas e informe actualizados en `tests/puntos-fase7/`; revisión vigente: `tests/puntos-fase7/revision.html`. La carpeta anterior `tests/matriz-fase7/` conserva la revisión previa con métricas; sus capturas ya no describen la interfaz vigente. Copia anterior al ajuste en `.local-backups/fase7-presentacion-puntos-20261014/`. README actualizado; sin nuevas dependencias.

Trabajo local terminado y detenido para revisión final. Sin commit, push ni despliegue. Pendientes únicamente la revisión del usuario y las comprobaciones físicas de Safari/iPad ya señaladas; no se inicia otra fase.

## 35. Presentación final solicitada — Fallados/aciertos

El usuario concreta «queremos que ponga 4/2 (fallados)/(aciertos)» y reitera «fallados/aciertos». Se aplica ese formato en ambas vistas, interpretado y comunicado antes de editar como resultados de tiros: cuatro fallados y dos aciertos = 4/2. Cada evento cuenta una vez, con independencia de si su valor es 2 o 3. Esta presentación sustituye la versión de solo puntos del apartado 34. No se afirma una confirmación explícita adicional de las unidades más allá del formato reiterado por el usuario.

- `outcomeText` centraliza el formato: fallados/aciertos, sin espacios alrededor de la barra. Sin datos: —; todos fallados/aciertos: 4/0 o 0/2, sin perder los ceros.
- Aplicado a cada acción, defensa, tipo, categoría, total del partido, resumen global, 20 combinaciones, totales de filas/columnas, detalle y resumen de estrategias. Etiquetas «Fallados/aciertos», sin sufijos pts ni porcentajes/cocientes/distintivos.
- Barras originales gris oscuro = fallados y naranja = aciertos; proporciones derivadas de los mismos resultados, sin porcentaje numérico. El resumen conserva orden de configuración Black, White, Blue, Red, Tut; no se ordena por una métrica oculta. No cambian fondos, superficies, fuentes o materiales.
- Eventos, valores 2/3, puntos concedidos internos y CSV intactos. No hay migraciones, reescrituras ni contadores persistidos. El registro sigue en dos pulsaciones y Deshacer afecta solo al último evento del activo.

Verificación completada: siete suites Node superadas, incluida prueba exacta de 4/2 con mezcla de tiros 2/3. Runner vigente `tests/resultados-fase7/verificar.mjs`: fases 2, 3, 5 y 6 correctas, junto con aislamiento/sincronización de partidos y subruta Pages. Cinco tamaños (1180×820, 1024×768, 390×844, 320×740 y 844×390), las veinte combinaciones y sus totales, detalle, teclado, recarga, doble toque, Deshacer, CSV y paleta correctos. Sin errores JavaScript/carga ni desbordamiento horizontal de página. Se ajustó el salto de línea de «Fallados/aciertos» en el detalle móvil para evitar recorte.

Capturas inspeccionadas de Registro y Estadísticas en tablet/móvil. Revisión actual: `tests/resultados-fase7/revision.html`; informe `verificacion.json` y capturas en esa carpeta. Revisiones de `tests/puntos-fase7/` y `tests/matriz-fase7/` son históricas y ya no reflejan la presentación vigente. Copia previa en `.local-backups/fase7-fallados-aciertos-20261014/`.

Trabajo terminado localmente, detenido para revisión final. Sin commit, push ni despliegue. Datos reales no utilizados ni modificados. La comprobación de dispositivos es emulación Chromium; Safari/iPad físico sigue pendiente. No se inicia otra fase.

## 36. Porcentajes visibles y desglose solo al pulsar

El usuario solicita porcentaje en el resumen general y la tabla de Bloqueo directo, con detalle debajo únicamente al pulsar. Se mantiene el formato fallados/aciertos del apartado 35 y se amplía solo la vista de Estadísticas.

- Resumen general: cada categoría y el total muestran también éxito defensivo, calculado como fallados / intentos × 100 y redondeado al entero. Matriz: las veinte combinaciones y diez totales conservan fallados/aciertos y añaden porcentaje; ejemplo 4/2 y 67%. Sin datos se muestra guion y «Sin datos», sin inventar 0%.
- El desglose comienza oculto y sin selección. Pulsar una combinación o total muestra debajo intentos, fallados, aciertos, éxito defensivo, puntos concedidos y puntos por tiro (dos decimales con coma). Foco y hover no lo abren; Enter/Espacio activan los botones nativos. Las etiquetas accesibles incluyen porcentaje y propósito del botón.
- La selección vive únicamente en memoria y se conserva al actualizar datos del mismo partido, incluido Deshacer. Se cierra al recargar o cambiar de partido. No se guardan contadores ni preferencias nuevas. La matriz sigue teniendo scroll interno móvil, encabezado de tipos fijo y foco visible.
- Se mantienen el resumen compacto de estrategias, Transición y Estático. No se reintroducen distintivos. Registro conserva exactamente su presentación fallados/aciertos, sus controles y sus dos pulsaciones. La paleta, barras gris/naranja, materiales, fuentes y cabecera siguen intactos.

### Verificación y entrega

Siete suites Node correctas, incluida auditoría de 57 agregaciones, mezcla de dobles/triples y 36 aciertos/77 puntos. Regresiones de navegador de fases 2/3/5/6 correctas, aislamiento/sincronización de partidos y paquete bajo subruta Pages comprobados. Sin cambios en las fórmulas de agregación.

Runner `tests/detalle-fase7/verificar.mjs`: cinco tamaños (1180×820, 1024×768, 390×844, 320×740, 844×390). Se activan y verifican las treinta celdas con seis métricas, porcentajes exactos según redondeo, datos vacíos, detalle inicialmente oculto incluso con foco/hover, teclado, recarga, cambio de partido, doble toque, Deshacer y CSV. Ejemplo PR Pop/White: seis intentos, cuatro fallados, dos aciertos, 67%, cinco puntos concedidos, 0,83 puntos por tiro. Cero errores de carga/JavaScript, objetivos táctiles de al menos 44 px, sin recorte de cifras/etiquetas ni desbordamiento horizontal de página; matriz completa a lo ancho en ambos iPad. Auditoría de colores conserva neutros/cobre y barras #444/#c17c4b.

Capturas inspeccionadas en tablet/móvil, antes y después de pulsar. Revisión vigente: `tests/detalle-fase7/revision.html`; reproducción en su README, informes `verificacion.json` y `verificacion-visual.json`, treinta capturas. Las revisiones anteriores son históricas. Copia previa e integridad en `.local-backups/fase7-detalle-click-20261014/`: SHA-256 idéntico para app.js, index.html, premium.css, styles.css, persistencia.js, registro.js, exportacion.js y categorias.csv. Producción modificada en este ajuste únicamente en js/dashboard.js y dashboard.css; documentación actualizada.

Completado y publicado. Commit `e27d320` contiene el panel y la matriz aprobados. Los archivos de cuentas/Firebase permanecen fuera del commit y pendientes de decisión. No se usaron nuevas dependencias ni datos reales. Safari/iPad físico queda pendiente; las capturas son emulación Chromium. No se inicia la siguiente fase.

## 37. Actualización de categorías publicada

El usuario autoriza actualizar las categorías en la página web a partir del CSV local. Se valida y corrige su configuración antes de publicar:

- Estático renombra «Bajo aro» a «Of. Screen» conservando `estatico_bajo_aro`.
- «Spain» se añade como acción estática con ID nuevo `estatico_spain` para evitar reutilizar el ID histórico `spain`, que permanece en Bloqueo directo.
- Los cuatro tipos de bloqueo mantienen las defensas Black, White, Blue, Red y Tut, y añaden Next, Dance y Quick+Under. PR Roller conserva únicamente tiros de 2; los otros tipos permiten 2 y 3.
- Total actualizado: 41 combinaciones (2 Transición, 7 Estático y 32 Bloqueo directo). No se cambia IndexedDB ni se reescriben eventos históricos.

Se corrigen pruebas locales ignoradas por Git para expectativas de la configuración nueva; no se publican. Siete suites Node superadas, con 26 pruebas de CSV/configuración, registro de 136 resultados y 165 puntos, estadísticas, exportación, integración, Dashboard y 76 agregaciones de matriz. Regresiones Chromium Fase 2 y Fase 3 superadas; sin datos reales. Cambio de producción limitado a `categorias.csv`; README actualizado. Commit `ed38617` publicado en `main`; GitHub Pages ejecutó correctamente build y deploy. Se recargó la página publicada con caché nueva y se verificaron las ocho defensas en matriz y las acciones actualizadas Of. Screen y Spain en Estático.

## 38. Publicar configuración CSV vigente sin editar el archivo

El usuario solicita actualizar la página usando las categorías actuales «sin cambiar el csv». Se conserva byte por byte el archivo `categorias.csv` que ya estaba en el árbol de trabajo al iniciar esta solicitud: 33 filas de datos, con 2 combinaciones de Transición, 7 de Estático y 24 de Bloqueo directo (tres tipos, ocho defensas). No se modifica ni regenera el CSV. Su configuración se valida con `parseConfiguration` y se visualiza en Chromium local: aparecen Of. Screen y Spain en Estático, y Next, Dance y Quick+Under en los tres tipos de bloqueo configurados. Publicación autorizada por la solicitud. El commit `b95653e` contiene exclusivamente el estado vigente de `categorias.csv`, sin editar el archivo durante esta tarea; `main` recibió el commit y GitHub Pages completó build y deploy correctamente. Se verificó el CSV remoto y la matriz publicada. Para cargarla en el navegador, recargar la página (Ctrl+F5 si mantiene caché). No se publica esta especificación ni se incluyen los demás archivos locales pendientes.

## 39. Rama remota de desarrollo

El usuario autoriza crear una rama para trabajar desde otro dispositivo con el estado local completo, incluidos materiales aún en desarrollo. Rama `develop`, creada desde `main` (`b95653e`), sin cambiar `main` ni su publicación de GitHub Pages. Se incluyen especificación/instrucciones, código experimental de cuentas/Firebase, dependencias/herramientas y pruebas locales. Se excluyen capturas PNG, node_modules, logs, `.test-artifacts` y copias locales `.local-backups`. Se actualizan expectativas de pruebas a las 33 combinaciones del CSV local vigente.

Verificación: siete suites Node correctas; regresiones Chromium de fases 2, 3 y 5 correctas; runner integral de Fase 7 superado en cinco tamaños (matriz 36 celdas, 24 combinaciones y 12 totales). El servidor de pruebas sirve cuenta.css en raíz, sin alterar el paquete de publicación desde main. Commit y push pendientes.
