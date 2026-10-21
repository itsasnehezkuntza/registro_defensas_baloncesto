# Premium cristal — nueva prueba visual

Propuesta aislada, pendiente de revisión. La base es la composición recuperada en `tests/evolucion-premium/`, no las exploraciones estructurales anteriores. No se sustituye la aplicación ni la primera propuesta.

## Plan previo de diseño

Se continúa aplicando frontend-design. El nuevo encargo permite cambiar el fondo claro y exige un efecto cristal evidente. El anterior lienzo uniforme, paneles casi opacos y cabecera sin material no aportaban suficiente información detrás del vidrio para percibir la refracción.

Paleta: perla #DEDEDE, luz #FFFFFF, satén #BBBBBB, tinta #202020, texto secundario #555555, naranja cobre #C17C4B. Variantes del mismo naranja para borde/selección; ninguna otra familia cromática.

Tipografía: se mantienen títulos deportivos originales Barlow Condensed y Manrope local en controles/nombres/cifras tabulares, siempre en mayúsculas. No se reduce la tipografía de la propuesta anterior.

Distribución: exactamente la base premium, proporción 1:1,6 y alineaciones originales. El fondo y los reflejos son capas sin tamaño de layout; no agregan filas, columnas, navegación ni espacio decorativo.

```text
CABECERA COMPACTA DE CRISTAL / PARTIDO Y HERRAMIENTAS
┌ TRANSICIÓN ─────────┐ ┌ ESTÁTICO ───────────────────┐
│ ACCIÓN             │ │ ACCIÓN │ ACCIÓN │ ACCIÓN   │
│ ACCIÓN             │ │ ACCIÓN │ ACCIÓN │ ACCIÓN   │
└────────────────────┘ └─────────────────────────────┘
┌ BLOQUEO DIRECTO / MATRIZ HORIZONTAL ────────────────┐
│ TIPO        BLACK     WHITE    BLUE    RED    TUT   │
│ MANEJADOR     □         □       □      □      □    │
│ ROLLER        □         □       □      □      □    │
│ POP           □         □       □      □      □    │
│ SPAIN         □         □       □      □      □    │
└────────────────────────────────────────────────────┘
BARRA FIJA DE CRISTAL / SELECCIÓN Y CUATRO RESULTADOS
```

Sistema material: fondo perla con una banda satinada y halos grises; soporte de vidrio con blur real, borde iluminado y sombra separada; controles de lectura lechosos, ejes discretos y selección cobre con relieve. Cabecera y pie comparten vidrio pulido, pero el pie conserva contraste fuerte entre pares de resultados. Iconos lineales SVG locales, todos del mismo grosor, acompañan etiquetas. Sin iconos que dependan del color.

Autocrítica previa: un patrón demasiado contrastado detrás de 28 objetivos competiría con las cifras. Las formas se difuminan y los centros de botones conservan una capa blanca densa. Evitar destellos animados automáticos y texturas que parezcan suciedad; solo respuestas a hover/pulsación/selección y respeto a movimiento reducido. La nueva apariencia debe comprobarse con capturas reales del antes/después, idéntica muestra, selección y viewport.

## Aislamiento

Solo archivos nuevos en esta carpeta y actualización de ESPECIFICACION.md. El simulador en memoria y la muestra proceden de la propuesta anterior y se conservan sin cambios; no hay acceso a IndexedDB, partidos reales, CSV de salida ni app.js. Las etiquetas/permisos de la muestra se contrastan con el CSV local. Nuevo partido, eliminar y CSV son controles representados con aviso de maqueta, no operaciones reales. Recargar reinicia la muestra.

## Entrega y verificación

- `index.html`: nueva prueba. `antes.html`: reproducción de la evolución premium anterior. `revision.html`: comparador con capturas emparejadas a las mismas dimensiones y cuatro detalles ampliados.
- `cristal.css`: materiales y fondo, sobre una copia de la geometría anterior. `preparar.mjs`: genera los dos HTML y añade siete iconos SVG decorativos, sin modificar el simulador. Fuentes locales existentes, sin dependencias nuevas.
- Servidor: `node tests/premium-cristal/servir.mjs`, solo en `127.0.0.1:4185`. Comparador: `http://127.0.0.1:4185/tests/premium-cristal/revision.html`. Prueba: `http://127.0.0.1:4185/`.
- Abrir en Chromium visible con contexto efímero: `node tests/premium-cristal/abrir.mjs`. Cerrar la ventana termina ese proceso. No usa perfiles personales.
- Capturas: `node tests/premium-cristal/capturar.mjs` y variante `--headed`. Servidor temporal propio 4186, cerrado al terminar. Si Node no está en PATH, usar `& 'C:/Program Files/nodejs/node.exe'` en PowerShell.

Comprobaciones completadas en Chromium 156.0.8078.4, seis tamaños (1440×900, 1180×820, 1024×768, 768×1024, 390×844, 320×740), en headless y navegador visible. 28 objetivos, tres secciones, Estático 3×2, paneles superiores de igual altura y comparación de su geometría con el antes (tolerancia 2 px por redondeo). Sin desbordamiento horizontal, recortes de nombres/cifras ni controles menores de 44×44. Matriz completa sobre el pie en escritorio/tablet, última defensa alcanzable por scroll en móvil. Resultados fijos con signos y etiquetas.

Comprobados desenfoques efectivos de 22 px en cabecera/paneles y 26 px en pie, siete SVG, paleta calculada neutra/naranja, mayúsculas, foco Tab, microinteracciones de 180 ms y su desactivación con movimiento reducido. Dos pulsaciones simuladas, doble toque consumido una vez, Roller 2P, Deshacer y reinicio al recargar correctos. Ninguna base IndexedDB/entrada localStorage y cero errores de carga/JavaScript.

Revisión visual: antes/después emparejados y selección PR Manejador/Blue con 7–3 · 70%, datos idénticos. Inspeccionados escritorio, tablet compacta y móvil inicial/final. Se suavizó el reflejo de los resultados para evitar una división brillante abrupta. Se aclaró el extremo más oscuro del cobre a #BD7A4C: contraste conservador calculado 4,89:1 para texto #261A11 de Nuevo partido, y superior a 5:1 para texto #211810 de la selección. No es una auditoría WCAG completa sobre cada píxel del vidrio.

En paneles estrechos de tablet (761–1000 px) y móvil hasta 360 px se omiten los iconos decorativos de sección que provocarían salto de fila; nunca se ocultan títulos, cifras ni etiquetas. Los cuatro iconos de herramientas se mantienen. Sin animación ambiental automática ni recursos remotos.

Informes `verificacion.json` y `verificacion-visible.json`, capturas en `capturas/`, huellas iniciales de los 12 archivos runtime en `integridad-inicial.json`. Aplicación principal y propuesta anterior intactas. Pendiente: valoración estética, Safari/dispositivos físicos, tacto y reflejos reales. Sin integración, commit, push, fetch, despliegue o cambios remotos.
