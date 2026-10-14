# Registro defensivo de baloncesto

Aplicación estática en español para registrar tiros rivales durante un partido con dos pulsaciones. HTML, CSS, módulos JavaScript e IndexedDB, sin backend, dependencias de producción ni compilación.

**Premium Glass (Premium cristal)** es el diseño aprobado de la versión oficial, con vistas de Registro y Estadísticas del partido activo. Barlow Condensed y Manrope se incluyen localmente; las mayúsculas son visuales por CSS y conservan los datos y el CSV.

## Uso

1. Pulsa **+ Nuevo partido**, escribe jornada y rival obligatorios y confirma Crear partido. Los nombres pueden repetirse; cada partido tiene un ID propio. Sin partido activo, registro y exportación están bloqueados.
2. Selecciona una acción de Transición/Estático o directamente una defensa dentro de su tipo de Bloqueo directo.
3. Pulsa **2✕, 3✕, 2✓ o 3✓**. ✓ significa anotado por el rival; ✕, fallado. Solo se habilitan los resultados permitidos. La selección se consume y el tiro se guarda automáticamente.
4. **Deshacer** elimina el último tiro persistido del partido activo, incluso después de recargar.
5. **Exportar CSV** descarga solo el partido seleccionado al iniciar la operación.
6. **Estadísticas / Registro** cambia de vista conservando partido y selección. La consulta muestra éxito, volumen y puntos concedidos exclusivamente del partido activo. Puedes cambiar de partido, deshacer y exportar desde ambas vistas. La dirección `#estadisticas` permite recargar esa vista y usar Atrás/Adelante.

Al recargar se restaura el último partido activo válido. El selector permite continuar encuentros anteriores. Jornada y rival no se editan después de crear. **Eliminar partido** identifica el encuentro y requiere confirmación; Cancelar no cambia nada y Eliminar definitivamente borra solo ese partido y sus tiros.

Las pestañas del mismo origen comparten selección activa y reciben los cambios confirmados. Una actualización del mismo partido conserva la selección en curso.

**Guardado localmente** indica transacción confirmada. Si un tiro aborta, el aviso permite repetir el resultado sin duplicar su ID. Si se confirma pero falla el refresco, el aviso distingue ese caso. Antes de cerrar o recargar espera la confirmación de guardado.

Éxito defensivo = fallados / intentos × 100, redondeado al entero. Se presenta como **7–3 · 70%**: 7 fallados, 3 anotados y porcentaje de éxito. La interfaz usa blanco, negro, grises y naranja cobrizo; los resultados fallados tienen botones oscuros y los anotados claros, con símbolos y etiquetas. Sin intentos se muestra un guion. Los datos permanecen en ese navegador/origen; no se sincronizan entre dispositivos. Limpiar datos del sitio elimina ese almacenamiento. CSV es una descarga para análisis, no una copia que la aplicación pueda importar.

## Exportación CSV

Un evento por fila, ordenado por seq persistente. Incluye ID del evento/partido, jornada, rival, categoría, acción, tipo de bloqueo, defensa, valor, resultado, intentos/anotados/fallados, puntos realmente concedidos, fecha/hora UTC, IDs estables y orden.

Formato UTF-8 con BOM, separador `;` y saltos CRLF. Campos entre comillas con escape de comillas, separadores y saltos. Los campos que pueden interpretarse como fórmulas se prefijan con apóstrofo al exportar; IndexedDB no se modifica. Excel en otras configuraciones regionales puede requerir importar mediante **Datos → Desde texto/CSV**, eligiendo UTF-8 y punto y coma.

El archivo identifica jornada, rival e ID del partido, con caracteres y longitud saneados. Un partido vacío descarga cabeceras. Las acciones retiradas y nombres originales siguen exportándose; los IDs de eventos v1 conocidos se deducen mediante la tabla fija de lectura. Si no se puede identificar un evento antiguo, esos IDs se dejan vacíos.

No hay opciones JSON ni XLSX nativo.

## Editar categorias.csv

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

PR Roller inicialmente permite únicamente 2 en sus cinco defensas. Los permisos proceden del CSV; editarlo cambia solo los registros futuros. Nombres con `;`, salto o comillas deben encerrarse entre comillas dobles, duplicando comillas interiores.

Después de editar, vuelve a preparar los archivos de publicación y, cuando se autorice, actualiza la rama de publicación. Recarga la aplicación después de publicarlo; CSV se solicita sin caché. Un error de configuración bloquea registro, conservando almacenamiento y exportación del activo si IndexedDB funciona.

## Ejecutar localmente

Sirve la carpeta del proyecto con cualquier servidor HTTP estático. Abrir index.html mediante file:// no carga correctamente módulos y CSV. La aplicación no necesita compilación ni dependencias de producción.

## Publicación oficial

Web: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/

GitHub Pages publica desde **main / (root)**. El proyecto incluye 20 archivos de aplicación: HTML, tres hojas CSS, app.js, categorias.csv, .nojekyll, nueve módulos JavaScript y dos fuentes con sus licencias OFL. README.md y .gitignore completan los archivos públicos.

Las pruebas, dependencias de desarrollo, copias de seguridad, perfiles y documentos internos permanecen locales. Para futuras actualizaciones, revisar los cambios, ejecutar las pruebas, conservar una copia de respaldo y publicar mediante push normal, sin forzar.

Una actualización en el mismo origen y navegador conserva IndexedDB. Los datos de localhost no se trasladan automáticamente a Pages. No cambiar el nombre de la base ni borrarla durante una actualización.

## Verificación

Se dispone localmente de pruebas de configuración, registro, estadísticas, CSV, integración y Dashboard, además de suites de navegador para partidos, persistencia, concurrencia, recargas, errores, histórico y diseño responsive. Se ejecutan con perfiles efímeros y datos ficticios.

La emulación de Chromium no sustituye pruebas en dispositivos físicos, Safari/Firefox ni apertura real en Excel.