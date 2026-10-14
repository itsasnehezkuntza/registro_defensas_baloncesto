# Auditoría de identidad visual deportiva — Fase 6B

**Actualización — Fase 6D:** Basketball Scout ha sido rechazada estéticamente por el usuario. La recomendación de este informe se conserva como histórico; la dirección vigente está en [DIRECCION_ARTISTICA_GAME_DAY.md](DIRECCION_ARTISTICA_GAME_DAY.md).

Fecha: 12 de octubre de 2026. Estado: auditoría y dos propuestas terminadas; elección pendiente. **No se ha aplicado ninguna propuesta a producción.**

## 1. Base auditada y método

Se revisaron AGENTS.md, ESPECIFICACION.md, index.html, styles.css, app.js y los módulos locales de configuración, registro, estadísticas, identidad, interfaz, persistencia y exportación. La base es la **versión local posterior a Fase 6A**, no la publicación anterior de GitHub Pages. Se inspeccionaron las capturas fase6a de iPad 1180×820, escritorio 1440×900 y móvil 390×844, tanto al inicio como tras desplazarse.

El trabajo compara dos sistemas visuales de una planilla de registro: jerarquía, lectura de cifras, reconocimiento de controles y ocupación vertical. No requiere gráficos nuevos, imágenes de pistas ni ilustraciones. Las vistas se renderizan como HTML/CSS real en Chrome. Se priorizó este formato, solicitado por el usuario, frente a conceptos raster generados: permite comparar valores exactos y medir objetivos táctiles.

Las maquetas parten del HTML local, una copia congelada de styles.css y las categorías leídas de categorias.csv. Se generan con los módulos puros de configuración y estadísticas. **No cargan app.js ni persistencia; no abren IndexedDB ni registran, borran o exportan datos.** El script de vista únicamente mide geometría, contraste y reserva inferior. El estado Guardado es simulado, igual que el partido y los eventos.

## 2. Diagnóstico de la interfaz actual

| Aspecto | Observación de la versión 6A | Consecuencia | Mejora propuesta |
| --- | --- | --- | --- |
| Superficies | Paneles blancos con radios de 14 px y botones interiores con radios de 10 px. | Repetición de tarjeta dentro de tarjeta; recuerda a un panel administrativo. | Planilla continua en A; módulos de control sin panel exterior en B. |
| Color | Cabecera azul marino, selección azul, resúmenes azules y fondos azulados. | El azul ocupa varias jerarquías y aporta poca identidad específica del baloncesto. | Grafito y naranja con roles limitados; verde/rojo reservados a resultados y estados semánticos. |
| Jerarquía | Títulos en mayúsculas y peso 900; nombres de acción muy pesados; estadísticas de 12 px, resúmenes de 13 px. | Compiten los rótulos mientras las cifras quedan pequeñas para consultarlas de un vistazo. | Reducir el peso relativo de las etiquetas y aumentar cifras a 14–18 px según nivel/dispositivo. |
| Componentes | Contornos suaves, fondos pálidos y pequeñas sombras en muchos elementos. | Sensación de colección de componentes genéricos. | Radios 0–4 px, divisores precisos, superficies sólidas y sin sombras. |
| Bloqueo directo | La alineación por tipo/defensa funciona, pero cada botón vuelve a parecer una tarjeta. | La matriz deportiva pierde continuidad visual. | A enfatiza la matriz; B distingue filas mediante rótulos laterales y controles separados. |
| Estadísticas | 7–3 · 70% ya comunica éxitos y fallos, con contadores de color. | Decisión correcta que debe conservarse; el porcentaje requiere mayor presencia tipográfica. | Dígitos tabulares, tamaño coherente y contraste específico también en selección. |
| Cabecera | Dos filas compactas y selector flexible tras Fase 6A. | Buena eficiencia; no necesita un hero ni una nueva marca gráfica. | Mantener controles y usar título, tipografía y una línea naranja como identidad. |
| Barra inferior | Resultados agrupados, altura reducida y reserva dinámica. | Buena separación entre elegir acción y registrar resultado. | Mantener orden y tamaño; cambiar únicamente el tratamiento visual. |
| Espacio libre | En escritorio queda una franja amplia entre la matriz y la barra fija. | Parte responde a que el contenido es finito y la barra está anclada al borde inferior. | No añadir tarjetas, gráficos o texturas para rellenarla; mantener el contenido arriba y la barra accesible. |
| CSS | Varias reglas y media queries vuelven a definir los mismos componentes al final del archivo. | Afinar estilos mediante más sobrescrituras puede causar regresiones difíciles de detectar. | Tras elegir una propuesta, consolidar variables y reglas en una sola hoja; no trasladar la cascada de la maqueta tal cual. |

### Decisiones que funcionan y se conservan

- Tres secciones desplegadas, sin navegación adicional: Transición/Estático arriba y Bloqueo directo debajo; en móvil se apilan.
- Estático en tres columnas desde 1000 px. Cuatro tipos de bloqueo y cinco defensas por tipo, directamente seleccionables.
- Selector de partido, creación, eliminación, Deshacer, CSV y estado de guardado en una cabecera compacta.
- Cuatro resultados compartidos, **2✕, 3✕ | 2✓, 3✓**. Símbolos y texto refuerzan verde para fallado y rojo para anotado.
- Selección con aria-pressed, borde doble, franja lateral y ✓: no depende únicamente del color.
- Guion cuando no hay eventos, proporción **7–3 · 70%** y porcentaje entero.
- Reserva inferior medida, safe-area-inset y desplazamiento vertical; ninguna defensa inaccesible tras la barra.
- Sin texturas de parqué, iconos ornamentales, gráficos decorativos, degradados ni fuentes remotas.

## 3. A — Basketball Scout

### Concepto y composición

Una planilla técnica de cuerpo técnico: papel cálido, tinta grafito y un acento naranja asociado al balón. La referencia al parqué se expresa en la temperatura del fondo, sin dibujar madera ni líneas de pista.

Transición y Estático forman una superficie continua con un divisor vertical. Las acciones son celdas con nombre y estadística debajo. Los encabezados tienen una banda neutra y su resumen alineado a la derecha. Bloqueo directo es una matriz de celdas contiguas: el tipo funciona como encabezado de fila y las cinco defensas mantienen el mismo eje de lectura. En móvil las defensas recuperan separación y contorno individual para tocar con comodidad.

### Paleta y roles

| Rol | HEX | Uso |
| --- | --- | --- |
| Fondo cálido | #EEE9DF | Entorno de la planilla. |
| Papel | #FAF8F2 | Acciones, matriz y barra. |
| Grafito | #262724 | Textos, cifras y divisores principales. |
| Banda neutra | #E6E1D5 | Encabezados y tipos de bloqueo. |
| Divisor | #B9B7AA | Cuadrícula secundaria, sin depender de ella para indicar selección. |
| Naranja balón | #D8661C | Franja de identidad, sin texto pequeño encima. |
| Naranja de interacción | #A9470B | Foco, selección y ✓. |
| Selección clara | #FFF0DB | Fondo de la acción seleccionada. |
| Éxito defensivo | #116541 | Fallados y estado guardado. |
| Rival anota / error | #A5283A | Anotados y mensajes de error, distinguibles por contexto y texto. |
| Texto secundario | #5C5D54 | Ayuda breve. |

### Tipografía

- Títulos: **Arial** en peso alto, 20 px en cabecera y 16 px en secciones; alternativas locales Helvetica Neue y sans-serif.
- Acciones: la misma familia, 15 px y peso 700; 14 px en móvil. Sobriedad de documentación técnica, sin tipografía de cartel.
- Cifras: Arial, números tabulares y peso 700; 15 px en acciones/defensas, 13–15 px en resúmenes y 14 px en total. En móvil, 14 px en las cifras de acción.
- La identidad depende también de la matriz y los divisores; no requiere una fuente descargada para ser reconocible.

### Componentes y estados

- Botones/celdas sólidos y planos; radios 0 px en matriz, 2 px en herramientas y resultados. Sin sombras.
- Selección crema/naranja con borde doble, franja y ✓. Los contadores siguen verdes y rojos.
- Cabecera clara, título con franja naranja y una línea grafito inferior. Nuevo partido es el control sólido grafito; Eliminar conserva texto rojo.
- Resultados con superficies suaves verdes/rojas y texto oscuro de esos colores. Mantienen símbolos, rótulos y 56 px de altura habitual.
- Deshabilitados: fondo #E1DED3, texto #56574F y borde discontinuo. Guardando usa #865108; error usa #A5283A. Los textos de estado se conservan.
- Foco naranja oscuro de 3 px; en resultados, grafito. La respuesta de estado es inmediata, sin animaciones.

### Ventajas y límites en partido

**Ventajas:** alineación uniforme para recorrer defensas por filas, menos superficies competidoras, buena lectura de etiquetas y cifras, continuidad con una planilla de entrenador. El contenido ocupa menos altura que B en la muestra comparable.

**Inconvenientes:** la cuadrícula transmite menos separación física entre controles que B. Se debe comprobar que la matriz se reconoce como táctil con entrenadores; no se deben suavizar aún más sus límites. La superficie clara puede resultar demasiado luminosa en un pabellón oscuro con brillo alto. Son hipótesis de uso que requieren prueba real.

## 4. B — Courtside Pro

### Concepto y composición

Una consola de mesa de anotadores: grafito, lectura numérica y acento naranja. Aspecto tecnológico sobrio, sin neón, efectos de vidrio ni estética futurista.

Los títulos de sección quedan fuera de los controles y los resúmenes se sitúan junto al título, creando una línea de lectura próxima a un marcador. Se retiran las tarjetas exteriores: cada acción es un módulo independiente, con cifras monoespaciadas. En Bloqueo directo cada tipo tiene una marca lateral naranja y las defensas son controles separados. Sus nombres se alinean a la izquierda y las cifras ganan protagonismo debajo. El total del partido recibe mayor peso en la barra inferior.

### Paleta y roles

| Rol | HEX | Uso |
| --- | --- | --- |
| Grafito de fondo | #151718 | Entorno y campo del selector. |
| Superficie de control | #222629 | Cabecera, acciones, defensas y barra. |
| Texto principal | #F2F2E9 | Nombres y porcentajes. |
| Texto secundario | #C0C4C1 | Ayuda y nombres de defensa. |
| Contornos | #68726E | Límites de controles y filas. |
| Naranja | #FF9C4A | Títulos estructurales mediante líneas, selección y foco. |
| Selección | #34312B | Fondo cálido que separa la selección del resultado deportivo. |
| Fallados | #76DDA7 | Contadores, borde de resultado y guardado. |
| Anotados / error | #FF98A2 | Contadores, borde de resultado y error. |
| Botón fallado | #155C3F | Fondo sólido verde con texto blanco. |
| Botón anotado | #923142 | Fondo sólido rojo con texto blanco. |

### Tipografía

- Títulos: **Impact**, 24 px en cabecera y 21 px en secciones, peso normal; alternativas locales Arial Narrow y Arial. La condensación se limita a títulos cortos.
- Acciones y herramientas: **Segoe UI**, alternativa local Arial y sans-serif, 13–15 px según el componente. Los nombres no se condensan.
- Cifras: **Consolas**, alternativas Menlo, ui-monospace y monospace; 16 px en acciones/defensas, 18 px en resúmenes y 16 px en total. En móvil se reducen a 14–15 px.
- Las fuentes presentes cambian según el sistema. La disponibilidad de Impact/Consolas en el iPad no se presupone: sus alternativas locales deben revisarse en Safari antes de aprobar una versión definitiva.

### Componentes y estados

- Controles separados, radios 4 px, borde visible y fondos sólidos. No hay tarjetas exteriores ni sombras.
- Selección con borde doble naranja, franja y ✓; los contadores verdes/rojos mantienen su significado.
- Cabecera grafito con una marca lateral naranja y título compacto. Selector oscuro; Nuevo partido tiene acento naranja.
- Resultados sólidos verdes/rojos con texto blanco y símbolos. Se mantienen la pareja izquierda/derecha y los 56 px de altura.
- Deshabilitados: fondo #282D2F, texto #B3B8B3 y borde discontinuo. Guardando usa #F5C96C; error usa #FF98A2. El texto y el contexto separan error de tiro anotado.
- Foco naranja de 3 px en todas las herramientas. No hay animaciones que retrasen la percepción de un bloqueo.

### Ventajas y límites en partido

**Ventajas:** controles individualizados, fuerte separación entre superficies y fondo, cifras destacadas y resultados muy reconocibles. Puede resultar cómoda con iluminación tenue y brillo moderado.

**Inconvenientes:** hay más marcas naranjas y contornos simultáneos. La condensación de títulos y las cifras monoespaciadas pueden exigir más atención a algunos usuarios; los verdes/rojos claros deben comprobarse con brillo bajo y visión cromática diversa. Bajo reflejos intensos, el tema oscuro puede perder legibilidad. No se ha ensayado físicamente ninguno de estos escenarios.

## 5. Comparación y recomendación

| Criterio | Basketball Scout | Courtside Pro |
| --- | --- | --- |
| Composición | Planilla integrada y matriz continua. | Módulos independientes, títulos y resúmenes en línea. |
| Prioridad de lectura | Nombre → proporción → siguiente defensa de la fila. | Nombre → cifra destacada → control siguiente. |
| Jerarquía | Resumen a la derecha; datos con tamaño homogéneo. | Resumen junto al título; cifras mayores que sus etiquetas. |
| Tipografía | Sans sobria, cifras tabulares. | Títulos condensados y cifras monoespaciadas. |
| Resultados | Contorno y fondo suave. | Botón sólido y texto blanco. |
| Ocupación en 1180×820 | Cabecera 88 px; barra ≈115 px. | Cabecera 93 px; barra ≈117 px. |
| Cuatro filas en iPad | Visibles en los tres tamaños comprobados. | Visibles en los tres tamaños comprobados. |
| Riesgo principal | Reconocer las celdas continuas como botones. | Competencia de acentos y variación tipográfica entre sistemas. |

**Recomiendo A — Basketball Scout para la interfaz definitiva.** La prioridad del trabajo es identificar una defensa y registrar el resultado, no inspeccionar un dashboard. La matriz continua y la jerarquía homogénea apoyan ese recorrido; además, ocupa menos altura y evita depender de títulos condensados. La identidad surge de la organización de una planilla de baloncesto, no únicamente del naranja.

B es una alternativa válida si se prefiere enfatizar el uso en mesa de anotadores y la separación de botones. La recomendación de A es un juicio de diseño apoyado en geometría y lectura, **no una mejora de velocidad demostrada**. Antes de cerrar un rediseño, conviene contrastar ambas en el iPad con una secuencia idéntica de tiros simulados y observar tiempo, errores y facilidad para identificar la selección. No se añaden pruebas con datos reales ni nuevas funciones a la aplicación.

## 6. Legibilidad, accesibilidad y rendimiento

- Mantener objetivos ≥44×44 px CSS; en las maquetas, acciones 60–62 px, defensas 56–58 px y resultados 56 px en los tamaños prioritarios. Ningún objetivo principal medido incumple el mínimo.
- Contraste de texto de al menos 4,5:1 como criterio de diseño, incluido texto pequeño. Se midieron nombres, cifras, verde/rojo normales y seleccionados, selector, resultados, guardado, guardando, error, ayuda y resultado deshabilitado. Los mínimos medidos finales fueron **5,43:1 en A** y **6,34:1 en B**. No es una auditoría WCAG completa.
- Contraste verde/rojo de cifras: A 6,68:1 / 6,67:1 en superficie normal y 6,33:1 / 6,32:1 seleccionada; B 9,20:1 / 7,45:1 normal y 7,82:1 / 6,34:1 seleccionada.
- Mantener símbolos ✕/✓, texto FALLADO/ANOTADO y orden fijo. Selección por borde/franja/✓ y foco visible con Tab; no introducir equivalencias deportivas basadas solo en colores.
- No volver a recortar estadísticas ni ocultar el total en móvil. Etiquetas largas deben envolver sin reducir el área táctil ni alterar el orden de lectura.
- Naranja solo para identidad/interacción/estructura; nunca como tercer resultado deportivo. Negro, White, Blue y Red siguen siendo nombres deportivos, no colores que cambien permisos.
- Fuentes del sistema, sin peticiones a Google Fonts, CDN, imágenes o paquetes. Las vistas HTML, CSS y JavaScript funcionan localmente sin conexión. Esto no constituye una implementación offline/PWA de producción.
- Una implementación futura debe conservar CSS sencillo, variables por rol y reglas responsive consolidadas. La hoja base más los overrides es un mecanismo de comparación, no la arquitectura recomendada para el CSS definitivo.
- No añadir filtros visuales, grandes sombras, efectos blur ni animaciones. Conservar el módulo existente que reserva la altura real de la barra.

## 7. Verificación y riesgos de distribución

Se ejecutó Chrome headless con **perfil nuevo aislado**, sin datos del usuario. Cada propuesta se verificó en 1180×820, 1440×900, 390×844, 1024×768, 1194×834 y 1024×620: **12 casos en total**.

- Sin desplazamiento horizontal, recortes de etiquetas/estadísticas ni objetivos principales menores de 44×44 px.
- Tres secciones y veinte defensas presentes; orden de los cuatro resultados correcto.
- Las cuatro filas caben sin scroll en 1024×768, 1180×820 y 1194×834 en ambas propuestas, con los datos de muestra y texto normal.
- En móvil y 1024×620 se permite scroll; la última defensa queda por encima de la barra al llegar al final.
- Foco de teclado verificado enviando Tab real mediante CDP; la selección mantiene el símbolo y el borde.
- Estadísticas idénticas entre A y B: **87 intentos · 51–36 · 59%**; muestras de 7–3 · 70%, 0–5 · 0%, 5–0 · 100% y — vacío distribuidas en la planilla.
- Sin recursos externos. Se revisaron las capturas principales de escritorio/iPad/móvil y las capturas móviles desplazadas.
- SHA-256 de los 11 archivos HTML/CSS/CSV/JavaScript de producción comparado antes y después de Fase 6B: sin cambios. Los cambios previos de Fase 6A siguen intactos.

**Dispositivos reales probados: ninguno.** Las resoluciones son emuladas; no reproducen las barras dinámicas de Safari, zonas seguras no nulas, reflejos, brillo, rotación o teclado físico/virtual del iPad. Tampoco se ha realizado una prueba completa con lector de pantalla, zoom nativo ni daltonismo. No se han repetido regresiones de persistencia/CSV: no se cambia código funcional ni estas vistas lo cargan.

Riesgos de una implementación posterior: tamaños distintos de fuentes locales pueden aumentar filas; nombres largos o porcentajes con contadores grandes pueden envolver; una regla global de padding/borde puede cambiar los objetivos o la marca de selección; nuevos mensajes de estado pueden aumentar la barra; cambiar el orden DOM comprometería la familiaridad. Las comprobaciones de Fase 6A deben volver a ejecutarse sobre la interfaz definitiva, incluyendo ampliación de texto y regresiones funcionales, tras una elección autorizada.

## 8. Entregables y elección pendiente

- [Comparador de capturas reales](tests/diseno-fase6b/comparacion.html).
- Vistas HTML estáticas: [Basketball Scout](tests/diseno-fase6b/scout.html) y [Courtside Pro](tests/diseno-fase6b/courtside.html). Los controles representan estados visuales y no realizan operaciones.
- [Guía de reproducción](tests/diseno-fase6b/README.md); generador, CSS y runner quedan en el mismo directorio, bajo tests/ excluido de publicación.
- Informe de medidas y contrastes: [.test-artifacts/fase6b-geometria.json](.test-artifacts/fase6b-geometria.json).

| Tamaño | A — Basketball Scout | B — Courtside Pro |
| --- | --- | --- |
| iPad 1180×820 | [Captura A](.test-artifacts/fase6b-scout-1180-820.png) | [Captura B](.test-artifacts/fase6b-courtside-1180-820.png) |
| Escritorio 1440×900 | [Captura A](.test-artifacts/fase6b-scout-1440-900.png) | [Captura B](.test-artifacts/fase6b-courtside-1440-900.png) |
| Móvil 390×844 | [Captura A](.test-artifacts/fase6b-scout-390-844.png) | [Captura B](.test-artifacts/fase6b-courtside-390-844.png) |
| Móvil desplazado | [Captura A](.test-artifacts/fase6b-scout-390-844-scroll.png) | [Captura B](.test-artifacts/fase6b-courtside-390-844-scroll.png) |

También se guardaron capturas de ambas alternativas en los otros tres tamaños verificados, con nombres fase6b-scout/courtside-ancho-alto.png.

La Fase 6B termina con las propuestas **pendientes de elección**. Se puede elegir A, B o solicitar una revisión concreta. La elección visual y la autorización para aplicar esa dirección precederán a cualquier modificación de producción. No se ha realizado commit, push ni publicación.
