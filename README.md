# Registro defensivo de baloncesto

**Versión interna 8C.0:** Google opcional y sincronización activable en ⋯. Entrar no sube partidos antiguos. Consulta [FASE8C_PUBLICACION.md](FASE8C_PUBLICACION.md) para uso, prueba breve y reversión.

Aplicación estática en español para registrar tiros rivales durante un partido con dos pulsaciones. HTML, CSS, módulos JavaScript e IndexedDB, sin backend, dependencias de producción ni compilación. Los datos se guardan en el navegador del dispositivo.

**Diseño V4**: fondo gris claro, botones planos, negro para fallados y coral para aciertos del rival y selección. Barlow Condensed para nombres, títulos y cifras grandes; Manrope para controles y etiquetas, ambas incluidas localmente.

## Uso

1. Pulsa **+ Nuevo**, escribe jornada y rival obligatorios y confirma Crear partido. Cada partido tiene un ID propio. Sin partido activo, registro y exportación están bloqueados.
2. Selecciona una acción de Transición/Estático o directamente una celda (tipo × defensa) de Bloqueo directo. La celda se marca en coral y su fila y su columna con una píldora negra.
3. Pulsa **2✕, 3✕, 2✓ o 3✓**. ✓ significa anotado por el rival; ✕, fallado. Solo se habilitan los resultados permitidos. El tiro se guarda al instante.
4. **Deshacer** elimina el último tiro guardado del partido activo, incluso después de recargar.
5. En el menú **⋯** están **Editar panel**, **Exportar CSV** y **Eliminar partido**.
6. El selector **Registro / Estadísticas** cambia de vista. La dirección `#estadisticas` permite recargar esa vista y usar Atrás/Adelante.

**Cifras**: tanto el Registro como Estadísticas muestran **anotados/intentos** (veces que anota el rival sobre tiros registrados, por ejemplo **2/6**). El **marcador** de arriba muestra **puntos concedidos / puntos intentados** (suma de los valores 2/3). En Estadísticas, el **éxito defensivo** es fallados / intentos × 100; «Mejor» y «Peor» requieren al menos 5 intentos. Al pulsar una celda o un total de la matriz se abre su desglose: % de éxito, intentos, fallados, aciertos, puntos concedidos y puntos por tiro. Con más de 6 defensas, la tarjeta coral muestra las barras de las 3 mejores y las 3 peores.

**Distribución adaptable**: los botones se reparten en filas equilibradas que ocupan todo el ancho y la matriz llena el espacio hasta la barra de resultados. Si no cabe todo, se quitan los contadores, después se compacta (letra menor, nombres en dos líneas) y, en último caso, se recortan nombres con «…». En iPad no hay que deslizar; en móvil se desplaza en vertical.

**Guardado** aparece cuando la transacción del navegador ha terminado. Si un tiro falla, el aviso permite repetirlo sin duplicarlo. Las pestañas del mismo navegador comparten el partido activo y los cambios.

En Solo local los datos permanecen en ese navegador. Con Google y activación explícita de Sync se sincronizan los partidos del equipo seleccionado; los antiguos requieren revisión y confirmación de subida. Limpiar los datos del sitio elimina su almacenamiento local. El CSV es una descarga para análisis, no se puede importar.

## Editar el panel

Menú **⋯ → Editar panel** convierte el propio Registro en modo edición: cabecera «Editando panel» con el partido y los botones **Cancelar** y **Hecho**.

- **Un partido con tiros no puede cambiar su panel.** La opción aparece desactivada con la explicación: para cambiarlo, deshaz sus tiros, elimina el partido o crea uno nuevo.
- **Tocar un botón** (acción, tipo de bloqueo o cabecera de defensa) abre su editor arriba: nombre, tiros 2/3, mover antes/después, **Quitar** y **Listo**.
- **Añadir**: la barra inferior ofrece Transición, Estático, Tipo de bloqueo y Defensa. Se desactiva con «Máximo» (12 acciones por sección, 8 tipos de bloqueo, 12 defensas) o «No cabe sin deslizar» si el botón nuevo no cabría en iPad 1180×740, iPad mini 1133×670 o iPad vertical 820×1180.
- **Quitar**: el botón desaparece del panel y no se recupera. Los tiros que tuviera en otros partidos se conservan en esos partidos.
- **Hecho** guarda el panel para el partido activo y para los partidos nuevos. Cada partido conserva su propio panel: al volver a uno anterior se registra y se consulta con el suyo. **Cancelar** (o Atrás) con cambios pide confirmación.

Renombrar o quitar botones nunca modifica los tiros ya registrados ni el CSV de los partidos anteriores.

## Exportación CSV

Un evento por fila del partido activo, en orden de registro. Incluye ID del evento/partido, jornada, rival, categoría, acción, tipo de bloqueo, defensa, valor, resultado, intentos/anotados/fallados, puntos concedidos, fecha/hora UTC e IDs estables.

Formato UTF-8 con BOM, separador `;` y saltos CRLF. Los campos que pueden interpretarse como fórmulas se prefijan con apóstrofo. Excel en otras configuraciones regionales puede requerir **Datos → Desde texto/CSV**, eligiendo UTF-8 y punto y coma. Un partido vacío descarga cabeceras. No hay opciones JSON ni XLSX.

## categorias.csv

Es la **configuración inicial** del panel. Formato CSV UTF-8 separado por punto y coma:

```text
categoria_id;categoria;accion_id;accion;defensa_id;defensa;tiros
transicion;Transición;transicion_bajo_aro;Bajo aro;;;2
directo;Bloqueo directo;pr_manejador;PR Manejador;blue;Blue;2,3
```

`categoria_id` es transicion, estatico o directo; los IDs son estables (minúsculas, números y guion bajo) y no se reutilizan; `tiros` es 2, 3 o 2,3. Un partido sin tiros que use la configuración del archivo recoge sus cambios al recargar; un partido con tiros o con un panel editado conserva el suyo.

## Ejecutar localmente

Sirve la carpeta con cualquier servidor HTTP estático (abrir `index.html` con file:// no carga los módulos ni el CSV).

## Publicación

Web: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/

GitHub Pages publica desde **gh-pages / (root)**: 35 archivos de aplicación y version.json público. Main conserva fuentes/documentación; pruebas, herramientas, diagnósticos y privados no forman parte de Pages. Se conserva el mismo origen y IndexedDB.

Verificado en Chromium con perfiles efímeros y datos ficticios; Safari/iPad físico y Excel real están pendientes de comprobar en uso.
