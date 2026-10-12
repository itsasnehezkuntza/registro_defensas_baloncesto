# Registro defensivo de baloncesto

Aplicación web estática, sin cuentas, backend, bibliotecas externas ni bases de datos remotas. La interfaz de registro está completa en una sola página.

## Uso durante un partido

1. Antes de comenzar, escribe la **Jornada** y el **Rival** en la cabecera (no hace falta utilizar el teclado durante el juego).
2. Pulsa una acción de **Transición** o **Estático**; en **Bloqueo directo**, pulsa la defensa (`Black`, `White`, `Blue`, `Red` o `Tut`) dentro del tipo de bloqueo correspondiente.
3. Pulsa uno de los cuatro resultados comunes inferiores (`2✓`, `2✕`, `3✓`, `3✕`). Solo se activan los tiros válidos para la selección. La jugada se registra automáticamente y la selección se limpia.
4. **Deshacer** elimina únicamente la última acción registrada del partido activo.

Un tiro fallado es un intento, no puntos concedidos. **Éxito defensivo = fallados / intentos × 100**. Cada acción, defensa y grupo muestra `fallados/intentos — porcentaje`; sin intentos, `—`.

## Partidos y guardado

- **+ Partido** abre otro partido, sin borrar los anteriores.
- El desplegable **Partido** permite volver a un encuentro guardado. Cada encuentro tiene su propia historia de eventos y su propio Deshacer.
- Puedes corregir la jornada o el rival. La corrección se aplica también a los registros de ese encuentro.
- Los partidos y los eventos se almacenan en **IndexedDB** dentro del navegador. El guardado es automático y el indicador de la cabecera refleja su estado.
- **El almacenamiento no se sincroniza entre dispositivos o navegadores**. Limpiar los datos del sitio o usar el modo privado puede hacer que se pierdan. Descarga copias JSON al terminar los partidos.

## Descargas

- **↓ CSV Excel** descarga **todas las jugadas de todos los partidos** en CSV con UTF-8 BOM y `;` como separador, habitualmente reconocido por Excel en español. Cada fila incluye: ID, jornada, rival, categoría, acción, tipo de bloqueo, estrategia, tiro, resultado, indicadores de intentos/anotados/fallados, puntos realmente concedidos y fecha UTC.
- **↓ JSON** genera una copia de seguridad completa de los partidos y eventos.
- **↑ Importar** incorpora una copia JSON generada por esta aplicación. Es una importación *acumulativa*: no elimina lo existente y evita importar de nuevo los eventos con el mismo ID.

**Nota:** CSV es compatible con Excel, pero no es un fichero `.xlsx` nativo.

## Publicar gratis en GitHub Pages

1. Crea un repositorio de GitHub, por ejemplo `registro-defensivo`.
2. Sube a la **raíz** del repositorio los archivos `index.html`, `styles.css` y `app.js`.
3. Abre **Settings → Pages**, selecciona **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`, y guarda.
4. GitHub mostrará una dirección similar a `https://TU-USUARIO.github.io/registro-defensivo/`. Ábrela en ordenador, tablet o móvil.

No se necesita servidor ni compilación. También es posible abrir `index.html` localmente, aunque para una persistencia más fiable y una misma dirección de acceso conviene usar la URL HTTPS de GitHub Pages.

## Editar categorías y tiros

Abre `app.js` y modifica únicamente el objeto `DEFENSE_CONFIG` al principio del archivo. Las propiedades `shots` aceptan `[2]`, `[3]` o `[2, 3]`.

Configuración inicial confirmada:

- **Transición:** Bajo aro `[2]`; Spot up 3 `[3]`.
- **Estático:** 1c1 exterior `[2,3]`; 1c1 interior `[2]`; Pin down `[2,3]`; Cortes `[2]`; Spot up 3 `[3]`; Bajo aro `[2]`.
- **Bloqueo directo:** PR Manejador `[2,3]`; PR Roller `[2]`; PR Pop `[2,3]`; Spain `[2,3]`. Estrategias comunes: Black, White, Blue, Red, Tut.

Si modificas categorías tras registrar partidos, conserva sus nombres anteriores si deseas importar copias antiguas; la importación valida las categorías existentes.

## Privacidad y uso sin conexión

Ninguna información se envía a terceros. El sitio utiliza solo HTML, CSS, JavaScript e IndexedDB, sin dependencias externas. Tras cargar la página se pueden registrar acciones sin comunicación con ningún servidor mientras el documento permanezca abierto. **Esta primera versión no instala un service worker ni garantiza abrir de nuevo la URL sin conexión.**
