# Registro defensivo de baloncesto

**Desarrollo local desde main 23.0:** [requisitos, instalación y comandos de pruebas vigentes](DESARROLLO-antes-de-24-2.md). Fase 24.1 preparada localmente, pendiente de revisión; no cambia la versión pública.

**Versión pública actual: 23.0**, publicada y verificada el 31 de octubre de 2026. Supervisión por UID/equipo, vista independiente de solo lectura y reglas efectivas sin ampliar escrituras. [Publicación y prueba ficticia revocada](FASE23_PUBLICACION.md). [Abrir supervisión](https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/supervision.html). Recargar con conexión, sin borrar almacenamiento. Las notas de versiones y candidatos que siguen conservan su carácter histórico.

**Candidato local — Fase 23: supervisión por UID/equipo.** Implementado en copia aislada desde las fuentes publicadas 22.0, sin commit/push/despliegue. Consulta independiente de solo lectura, protegida en Firestore Rules, con asignación/revocación administrativa e índice privado de equipos. [Arquitectura, pruebas, costes y procedimiento administrativo](FASE23_SUPERVISION.md). La versión pública continúa siendo 22.0.

**Versión pública actual: 22.0**, publicada y verificada el 29 de octubre de 2026 en [la dirección habitual](https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/). Incluye las Fases 21 y 22: sincronización automática con Google, equipo obligatorio, históricos por confirmación y protección de pendientes e integridad del panel local. El candidato pasó las pruebas locales y la validación física comunicada por el usuario; 39 hashes HTTPS y build Pages correctos. **Recargar con conexión en todos los dispositivos, sin borrar datos.** Publicación en [FASE22_PUBLICACION.md](FASE22_PUBLICACION.md), resumen y pendientes en [CONTINUIDAD.md](CONTINUIDAD-antes-de-24-2.md). Las notas de versiones anteriores siguientes son históricas.

**Histórico — Fase 22, posteriormente publicada en 22.0:** Google activa la sincronización y exige crear o seleccionar equipo antes de registrar. Un equipo se selecciona automáticamente; con varios se recupera la selección válida o se pide elegir. Sin cuenta se registra solo en este dispositivo. Los históricos se incorporan únicamente tras revisión y confirmación. Se elimina «Activar sincronización» y la salida destructiva con pendientes. Ver flujo, pruebas y límites en [FASE22_CUENTAS.md](FASE22_CUENTAS.md). Las instrucciones de activación manual de los apartados históricos siguientes corresponden a versiones anteriores. La corrección local de Fase 21 se conserva.

**Versión pública actual: 20.0**, publicada y verificada el 21 de octubre de 2026 en [la dirección habitual](https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/). Incluye las funciones y correcciones terminadas hasta Fase 19, con actualización coordinada de reglas del panel sincronizado. **Recargar en todos los dispositivos** para usar el protocolo actualizado. Partidos e históricos conservados; respaldos remotos disponibles. Detalles, pruebas y límites en [FASE20_PUBLICACION.md](FASE20_PUBLICACION.md). Cancelar/Deshacer el nombre, «Eliminar» y MOP-001 siguen pendientes. Las notas de versiones previas siguientes conservan el histórico.

Aplicación estática en español para registrar tiros rivales durante un partido con dos pulsaciones. HTML, CSS, módulos JavaScript e IndexedDB, sin compilación ni framework. **8C.0 publicada**: Google opcional y sincronización disponible con activación explícita por cuenta/navegador. Entrar no sube partidos antiguos. Uso, prueba breve y reversión en [FASE8C_PUBLICACION.md](FASE8C_PUBLICACION.md). **Fase 10 (local, sin publicar)**: pantalla de inicio de sesión, menú de perfil, aviso solo ante problemas y «Vaciar partido»; auditoría en [FASE10_AUDITORIA.md](FASE10_AUDITORIA.md).

**Diseño V4 ya publicado, conservado en 8C**: fondo gris claro, botones planos, tinta negra para fallados y coral para aciertos del rival y selección. Barlow Condensed para nombres, títulos y cifras grandes; Manrope para controles y etiquetas, ambas incluidas localmente. No se introduce un Dashboard nuevo.

**Fase 19, corrección del cursor:** el mismo enlace temporal recibe `19-79f88c07bb7931b7`. El recálculo de espacio conserva el campo donde se escribe el nombre. Escritura pausada y posición del cursor verificadas en Chromium/WebKit; datos de las copias 17/18 conservados. Cerrar y reabrir Safari ya está confirmado por el usuario; la corrección del editor necesita su comprobación en el iPad. Véase [FASE19_CURSOR_EDITOR.md](FASE19_CURSOR_EDITOR.md).

## Uso

**Fase 11 local, sin publicar:** sincronización por escuchas de cambios para eliminar las descargas completas cada cinco segundos. Alcance, pruebas y límites en [FASE11_LECTURAS.md](FASE11_LECTURAS.md). La versión publicada documentada sigue siendo 8C.0.

**Fase 12 local, sin publicar:** con Google recordado, el registro espera a recuperar la sesión y el equipo. Ante error se puede reintentar o continuar sin cuenta; la elección local descarta la restauración tardía. Véase [FASE12_ARRANQUE.md](FASE12_ARRANQUE.md).

**Fase 13 local, sin publicar:** una operación bloqueada conserva su aviso y sus datos, mientras se reciben cambios y se envían los de otros partidos. Las escrituras del partido afectado esperan al reintento. Véase [FASE13_COLA.md](FASE13_COLA.md).

**Fase 14 local, sin publicar:** el panel se sincroniza por cuenta/equipo, con versiones por partido y plantilla compartida para los nuevos. Los tiros históricos no se reescriben; las ediciones incompatibles quedan pendientes con aviso. Requiere publicar código y reglas de forma coordinada y actualizar los dispositivos; los clientes antiguos no admiten el protocolo de panel. Véase [FASE14_PANEL.md](FASE14_PANEL.md).

**Fase 15 local, sin publicar:** política CSP activa por meta, con scripts y conexiones limitados a los recursos propios y servicios necesarios de Google/Firebase. Registro, acceso y sincronización verificados; incluye una corrección de la carrera al cambiar de ámbito durante una lectura de configuración. Véase [FASE15_CSP.md](FASE15_CSP.md).

**Fase 16 administrativa, terminada:** retirado con autorización el dominio temporal del canal de pruebas ya inexistente. Los dominios de acceso habituales permanecen autorizados; no se ha publicado la aplicación ni cambiado reglas o datos deportivos. Véase [FASE16_DOMINIO.md](FASE16_DOMINIO.md).

**Fase 17A preparada, sin publicar:** candidato HTTPS para la prueba física de Safari/iPad, con Google disponible y sincronización bloqueada para no cambiar las reglas del servicio publicado. Seis grupos locales Chromium/WebKit correctos; recorrido y autorización pendiente en [FASE17_IPAD.md](FASE17_IPAD.md).

**Fase 17B publicada con autorización:** [prueba temporal de iPad](https://registro-defensivo--ipad17-ot4rlj0m.web.app), hasta el 21 de octubre de 2026 a las 22:22 de Madrid. Google disponible y Sync desactivado. Verificados archivos HTTPS y uso en Chromium; Safari/iPad físico pendiente. La aplicación habitual y las reglas no cambian. Recorrido y límites en [FASE17_IPAD.md](FASE17_IPAD.md).

**Fase 18, corrección en ese mismo enlace:** inicio y Registro son pantallas excluyentes y las cargas atascadas muestran reintento. Datos de la copia 17 y caducidad conservados. El usuario confirma en el iPad nuevo Google, inicio, registro/recarga, CSV, Deshacer, uso sin conexión, estadísticas y vertical/horizontal. Sincronización, persistencia prolongada y compatibilidad del antiguo siguen sin confirmación. Véase [FASE18_INICIO_IPAD.md](FASE18_INICIO_IPAD.md).

Las propuestas no fundamentales quedan en [MEJORAS_OPCIONALES.md](../../MEJORAS_OPCIONALES.md): MOP-001, evitar desplazamiento vacío cuando no hay contenido debajo, anotada sin implementar.

0. **Inicio de sesión** (al abrir sin sesión ni elección previa): «Continuar con Google» o «Continuar sin cuenta» (los partidos se quedan solo en este dispositivo). La elección se recuerda; sin cuenta no se vuelve a mostrar y se puede iniciar sesión más tarde desde el avatar. Con «sin cuenta» la aplicación no hace ninguna petición externa.

1. Pulsa **+ Nuevo** (botón coral de la cabecera), escribe jornada y rival obligatorios y confirma Crear partido. Los nombres pueden repetirse; cada partido tiene un ID propio. Sin partido activo, registro y exportación están bloqueados.
2. Selecciona una acción de Transición/Estático o directamente una defensa dentro de su tipo de Bloqueo directo.
3. Pulsa **2✕, 3✕, 2✓ o 3✓**. ✓ significa anotado por el rival; ✕, fallado. Solo se habilitan los resultados permitidos. La selección se consume y el tiro se guarda automáticamente.
4. **Deshacer** elimina el último tiro persistido del partido activo, incluso después de recargar.
5. **Editar panel**, **Exportar CSV**, **Vaciar partido** y **Eliminar partido** están en el menú **⋯** (solo acciones del partido). Exportar descarga solo el partido seleccionado al iniciar la operación. **Vaciar partido** borra todos sus tiros y conserva el partido (ID, jornada y rival) para empezar de cero: el diálogo indica el partido y el número de tiros, ofrece «Exportar CSV antes» y destaca «Cancelar»; está desactivado si no hay tiros. Es una sola transacción; si el partido cambia mientras confirmas (otra pestaña u otro dispositivo), no borra nada y actualiza el recuento. Con cuenta, el vaciado se sincroniza y los tiros borrados no reaparecen.
6. El **avatar** (foto de Google, iniciales o, sin cuenta, un icono de persona) abre el **perfil**: nombre, correo, «Sesión iniciada con Google», la sincronización (activar, equipo, revisar partidos locales, reintentar) y **Cerrar sesión**. Sin cuenta: «Iniciar sesión con Google».
7. El selector **Registro / Estadísticas** cambia de vista conservando partido y selección. **Registro** muestra en cada botón **anotados/intentos** (veces que anota el rival sobre tiros registrados, por ejemplo **2/6**) y arriba un **marcador de puntos concedidos / puntos intentados** (suma de los valores 2/3). **Estadísticas** usa también **anotados/intentos**, con el marcador de puntos en la tarjeta coral: tarjeta coral con el total y barras de fallados por defensa, situaciones con anillo y % de éxito, matriz con totales y «Mejor»/«A mejorar», Transición y Estático de mejor a peor. Al pulsar una celda o total, el desglose se abre debajo de su fila (% de éxito, intentos, fallados, aciertos, puntos concedidos, puntos por tiro). «Mejor»/«Peor» requieren al menos 5 intentos (`MIN_COMPARISON_ATTEMPTS` en `js/dashboard.js`). La dirección `#estadisticas` permite recargar esa vista y usar Atrás/Adelante.

**Distribución adaptable**: Transición y Estático se reparten en filas equilibradas (5 → 3+2, 7 → 4+3) que ocupan todo el ancho, sin huecos; el ancho de cada sección es proporcional a sus columnas y la matriz de Bloqueo directo llena el resto del alto y del ancho. Si no cabe todo, en este orden: se quitan los contadores (siguen en Estadísticas), se reducen márgenes y letra, y se recortan nombres largos con «…» (nombre completo en `title` y `aria-label`). En iPad no hay desplazamiento ni objetivos menores de 44 px; en móvil se permite desplazamiento vertical y la matriz se desliza en horizontal. Se recalcula al girar el iPad, cambiar el tamaño de la ventana o la configuración.

Al recargar se restaura el último partido activo válido. El selector permite continuar encuentros anteriores. Jornada y rival no se editan después de crear. **Eliminar partido** identifica el encuentro y requiere confirmación; Cancelar no cambia nada y Eliminar definitivamente borra solo ese partido y sus tiros.

Las pestañas del mismo origen comparten selección activa y reciben los cambios confirmados. Una actualización del mismo partido conserva la selección en curso. El desglose estadístico seleccionado se actualiza al registrar o deshacer; se oculta al recargar o cambiar de partido. El porcentaje de éxito es fallados / intentos × 100, redondeado al entero: **4/2 equivale a 67%**. Sin intentos, los porcentajes y puntos por tiro muestran un guion.

**Sin indicador permanente de guardado** (Fase 10): cada tiro se anuncia a lectores de pantalla como «Guardado localmente» cuando termina la transacción de IndexedDB, pero en pantalla solo aparece algo si hay un problema: un error al guardar (aviso con opción de repetir y estado «Error al guardar» en la cabecera) o cambios de la cuenta pendientes de subir sin conexión, con error o bloqueados (punto en el avatar y detalle en el perfil). Si un tiro aborta, el aviso permite repetir el resultado sin duplicar su ID. Si se confirma pero falla el refresco, el aviso distingue ese caso. Antes de cerrar o recargar espera la confirmación de guardado.

En Estadísticas, **4/2** significa cuatro tiros fallados y dos aciertos del rival; en el Registro el mismo caso se ve como **2/6** (anotados/intentos). Cada tiro cuenta una vez, sea de dos o de tres puntos. Si no hay datos se muestra un guion; con solo fallos, **4/0**, y con solo aciertos, **0/2**. Las barras del Dashboard usan gris oscuro para fallados y naranja para aciertos. Las acciones y estrategias mantienen el orden de configuración, sin distintivos. El valor real de cada tiro se conserva en los eventos y el CSV, con los puntos concedidos calculados correctamente. La interfaz conserva blanco, negro, grises y naranja cobrizo; los resultados fallados tienen botones oscuros y los anotados claros, con símbolos y etiquetas. Sin cuenta, los datos permanecen en ese navegador/origen; limpiar datos del sitio los elimina. La aplicación pide almacenamiento persistente, pero Safari puede borrar los datos de un sitio que no se abre en 7 días: en iPad conviene añadirla a la pantalla de inicio y exportar el CSV al terminar cada partido. CSV es una descarga para análisis, no una copia que la aplicación pueda importar.

## Exportación CSV

Un evento por fila, ordenado por seq persistente. Incluye ID del evento/partido, jornada, rival, categoría, acción, tipo de bloqueo, defensa, valor, resultado, intentos/anotados/fallados, puntos realmente concedidos, fecha/hora UTC, IDs estables y orden.

Formato UTF-8 con BOM, separador `;` y saltos CRLF. Campos entre comillas con escape de comillas, separadores y saltos. Los campos que pueden interpretarse como fórmulas se prefijan con apóstrofo al exportar; IndexedDB no se modifica. Excel en otras configuraciones regionales puede requerir importar mediante **Datos → Desde texto/CSV**, eligiendo UTF-8 y punto y coma.

El archivo identifica jornada, rival e ID del partido, con caracteres y longitud saneados. Un partido vacío descarga cabeceras. Las acciones retiradas y nombres originales siguen exportándose; los IDs de eventos v1 conocidos se deducen mediante la tabla fija de lectura. Si no se puede identificar un evento antiguo, esos IDs se dejan vacíos.

No hay opciones JSON ni XLSX nativo.

## Editar el panel

Menú **⋯ → Editar panel** convierte el propio Registro en modo edición (como el lienzo V4): cabecera «Editando panel» con el partido y los botones **Cancelar** y **Hecho**. **Un partido con tiros no puede cambiar su panel**: la opción aparece desactivada con la explicación; para cambiarlo hay que deshacer sus tiros, eliminar el partido o crear uno nuevo. Los botones muestran sus tiros (2, 3) y las celdas de la matriz, atenuadas, sus datos.

- **Tocar un botón** (acción, tipo de bloqueo o cabecera de defensa) abre su editor arriba: nombre, tiros 2/3, mover antes/después, **Quitar** y **Listo** (Intro o Escape también cierran).
- **Añadir**: la barra inferior ofrece Transición, Estático, Tipo de bloqueo y Defensa. Se desactiva con «Máximo» (12 acciones por sección, 8 tipos, 12 defensas) o «No cabe sin deslizar» si el botón nuevo ya no cabría en iPad 1180×740, iPad mini 1133×670 o iPad vertical 820×1180.
- **Quitar**: el botón desaparece del panel y no se puede recuperar. Si tenía tiros en otros partidos, esos datos se conservan en esos partidos; su ID nunca se reutiliza. Cada sección necesita al menos un botón.
- IDs estables asignados al pulsar Hecho a partir del nombre final; renombrar no reescribe tiros; en Bloqueo directo cada celda permite los tiros comunes a su tipo y su defensa.
- **Hecho** guarda una versión nueva en una sola transacción; **Cancelar** (o Atrás) con cambios pide confirmación. Si otra pestaña guardó antes, se avisa y no se pisa.
- **Cada partido tiene su panel**: Hecho lo aplica al partido activo (sin tiros) y lo convierte en el de los partidos nuevos. Al volver a un partido anterior se registra y se consulta con su propio panel. Si otra pestaña registra un tiro mientras se edita, Hecho se rechaza.

La configuración se guarda en IndexedDB (almacén `settings`, sin cambiar la versión de la base) como versiones inmutables con ID, fecha y origen, preparadas para sincronizarse más adelante con la cuenta (no implementado).

## Editar categorias.csv

`categorias.csv` es la **configuración inicial**. Un partido **sin tiros** que use la configuración del archivo recoge sus cambios al recargar; un partido con tiros nunca cambia de panel, y un panel editado queda fijo.

Guarda como CSV UTF-8 separado por punto y coma, con la cabecera:

```text
categoria_id;categoria;accion_id;accion;defensa_id;defensa;tiros
```

- `categoria_id`: transicion, estatico o directo; sus nombres visibles son editables.
- `accion_id`: estable y único entre acciones. Minúsculas, números y guion bajo, comenzando por letra.
- `categoria` y `accion`: nombres coherentes en todas las filas del mismo ID.
- `defensa_id` y `defensa`: vacíos en acciones simples; obligatorios en directo. El mismo ID de defensa mantiene el mismo nombre.
- `tiros`: 2, 3 o 2,3, aplicado a esa combinación.

```text
transicion;Transición;transicion_bajo_aro;Bajo aro;;;2
directo;Bloqueo directo;pr_manejador;PR Manejador;blue;Blue;2,3
```

Renombra solo los nombres, conservando IDs. Añade acciones con IDs nuevos; no reutilices uno retirado para otra acción. En directo, una fila por defensa y el mismo accion_id para cada tipo. El orden de filas determina el orden de botones. Retira acciones borrando sus filas, sin perder tiros anteriores. Mantén al menos una fila.

PR Roller inicialmente permite únicamente 2 en sus ocho defensas. Las defensas son Black, White, Blue, Red, Tut, Next, Dance y Quick+Under; los otros tipos de bloqueo permiten 2 y 3. En Estático también están Spain (2 y 3 puntos) y Of. Screen (2 puntos). Los permisos proceden del CSV; editarlo cambia solo los registros futuros. Nombres con `;`, salto o comillas deben encerrarse entre comillas dobles, duplicando comillas interiores.

Después de editar, vuelve a preparar los archivos de publicación y, cuando se autorice, actualiza la rama de publicación. Recarga la aplicación después de publicarlo; CSV se solicita sin caché. Un error de configuración bloquea registro, conservando almacenamiento y exportación del activo si IndexedDB funciona.

## Ejecutar localmente

Sirve la carpeta del proyecto con cualquier servidor HTTP estático. Abrir index.html mediante file:// no carga correctamente módulos y CSV. La aplicación no necesita compilación ni dependencias de producción.

## Cuenta de Google — Fases 8A y 10

**Al iniciar sesión por primera vez** en un dispositivo con partidos sin cuenta, se pregunta una vez si subirlos a la cuenta o dejarlos solo aquí (después, «Revisar partidos locales» en el perfil). **Al cerrar sesión se borran de este dispositivo los datos de esa cuenta** (copias de la nube, cola, lista de equipos y partidos creados con la cuenta sin subir); los partidos sin cuenta no se tocan. Si hay cambios sin subir, se avisa y se ofrece **Esperar** (sube y cierra la sesión al terminar) o **Salir igualmente** (se pierden en este dispositivo). Cambiar de cuenta no mezcla datos.

El guardado inmediato sigue en IndexedDB. **Solo local** significa que los partidos permanecen en este navegador, también con una cuenta conectada. Iniciar/cerrar sesión no sube, elimina ni atribuye automáticamente partidos a una cuenta. El uso sin cuenta sigue disponible.

La configuración web pública de `registro-defensivo` está incorporada en `js/firebase-config.js`, con Authentication activado y emulador desactivado. El SDK oficial modular 12.11.0 se carga por separado del registro local. El usuario ha confirmado acceso, recarga y cierre de sesión reales. Safari/iPad sigue pendiente de comprobación específica. Se usa ventana emergente desde el propio toque, sin redirección: en GitHub Pages la redirección no funciona en Safari (el dominio de Auth es otro); si se bloquea la ventana, se explica y se puede reintentar o seguir sin cuenta.

Prueba aislada de Authentication: `npm run firebase:validar-real` y abrir `http://localhost:4199/tools/firebase/validacion-real.html`. El dominio `itsasnehezkuntza.github.io` está autorizado, contrastado en 8C. El servidor de validación no publica cambios. [FASE8A1_VALIDACION_REAL.md](FASE8A1_VALIDACION_REAL.md) conserva el resultado histórico de aquella fase; la situación publicada actual está en el informe 8C.

Diseño inicial y decisiones de Authentication: [FASE8A_FIREBASE.md](FASE8A_FIREBASE.md). Las reglas ya están desplegadas y contrastadas; 8C no las modifica. Para desarrollo: `npm ci`, `npm run test:cuenta`, `npm run test:reglas` y `npm run test:auth` (emuladores ficticios; Java 21+ para Firestore). No se necesitan credenciales administrativas para esas pruebas.

## Publicación oficial

La Fase 8B incorpora cola atómica, ámbitos por cuenta/equipo y asistente de importación confirmado. En 8C `js/sync-config.js` habilita la capacidad real; cada cuenta debe activarla explícitamente en el menú. El esquema v1→v2 se actualiza de forma aditiva sin reescribir históricos; no es subida de partidos. Pruebas: `npm run test:sync` (solo Auth/Firestore Emulator). [FASE8B_SINCRONIZACION.md](FASE8B_SINCRONIZACION.md) conserva la arquitectura y el cierre histórico; [FASE8C_PUBLICACION.md](FASE8C_PUBLICACION.md) describe activación actual.

Web: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/

GitHub Pages publica desde **gh-pages / (root)**: 35 archivos de aplicación y version.json público, sin herramientas, documentación interna, pruebas, diagnósticos o privados. Código publicado 403d252, Pages 2c49c4b, misma URL/origen; main conserva fuentes/documentación. El trabajo pendiente de develop permanece conservado y sus archivos runtime reflejan 8C. La referencia remota respaldo/antes-fase8c-20261017 permite volver a 8c6667d sin borrar datos.

Las pruebas, dependencias de desarrollo, copias de seguridad, perfiles y documentos internos permanecen locales. Para futuras actualizaciones, revisar los cambios, ejecutar las pruebas, conservar una copia de respaldo y publicar mediante push normal, sin forzar.

Una actualización en el mismo origen y navegador conserva IndexedDB. Los datos de localhost no se trasladan automáticamente a Pages. No cambiar el nombre de la base ni borrarla durante una actualización.

## Verificación

Se dispone localmente de pruebas de configuración, registro, estadísticas, CSV, integración y Dashboard, además de suites de navegador para partidos, persistencia, concurrencia, recargas, errores, histórico y diseño responsive. Se ejecutan con perfiles efímeros y datos ficticios. Editor y distribución: `node tests/configuracion-guardada.test.mjs`, `node tests/diseno-v4/distribucion.mjs` y `node tests/diseno-v4/editor.mjs`. Diseño V4: `node tests/diseno-v4.test.mjs` y `node tests/diseno-v4/verificar.mjs` (regresiones 2/3/5/6/10, partidos, inicio de sesión, perfil y vaciar, con medición en 1180×740, 1133×670, 1366×1024, 820×1180 y 390×844); comparación visual en `tests/diseno-v4/revision.html`. Cuenta y sincronización: `npm run test:cuenta`, `npm run test:fase8a` (sin cuenta: cero peticiones externas), `npm run test:auth`, `npm run test:reglas` y `npm run test:sync` (Auth y Firestore Emulator, datos ficticios).

La emulación de Chromium no sustituye pruebas en dispositivos físicos, Safari/Firefox ni apertura real en Excel.
