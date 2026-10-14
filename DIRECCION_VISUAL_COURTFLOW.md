# CourtFlow — Modern Basketball Performance, Fase 6E

Estado: dos prototipos terminados, revisados y pendientes de elección. Fecha: 12 de octubre de 2026. **No se aplica ningún diseño a producción.**

## Base y referencias

Se han leído las instrucciones, la especificación y los archivos locales de la aplicación y de los prototipos anteriores. Se conserva la funcionalidad aprobada de Fase 6A; GAME DAY se toma como antecedente de composición, no como lenguaje gráfico definitivo.

Las imágenes de aplicaciones mencionadas por el usuario **no estaban disponibles en el contexto ni en los adjuntos locales accesibles**. No se afirma haberlas analizado: esta propuesta interpreta los criterios escritos de modernidad, superficies claras, naranja deportivo, tipografía legible y radios moderados. Si esas imágenes se incorporan posteriormente, podrán contrastarse con esta dirección antes de implementar nada.

## 1. Lenguaje común CourtFlow

La identidad se desplaza del marcador a una aplicación de registro de rendimiento. Se retiran tipografías condensadas, pestañas diagonales, bandas naranjas grandes y divisores gruesos. Las tres secciones son áreas de trabajo, no tarjetas contenedoras que vuelven a envolver tarjetas.

- Tipografía sans contemporánea, con títulos cortos y pesos diferenciados. Se usa la familia local **Segoe UI Variable → Aptos → Segoe UI → system-ui → -apple-system → sans-serif**. No hay Impact, fuentes condensadas, archivos descargados ni servicios de fuentes.
- Cifras tabulares: proporción en peso 600–650 y porcentaje en 850, ligeramente mayor (1,08 veces). Las cifras de acción/defensa rondan 14–18 px según tamaño y variante; no se convierten en números gigantes de marcador.
- Radios de 8 px en resúmenes/encabezados de tipo, 9 px en herramientas y 10–12 px en botones. Sin sombras, degradados, vidrio o ilustraciones.
- Naranja para la creación de partido, foco/selección y pequeños anclajes estructurales. El naranja no se aplica a las estadísticas deportivas: verde significa fallo rival y rojo significa anotación rival.
- Selección con fondo cálido #FFF0E5, borde doble, franja y ✓. Sigue siendo reconocible sin depender solamente del color. Foco de teclado de 3 px y deshabilitados con fondo neutro y borde discontinuo.
- Resultados siempre **2✕, 3✕ | 2✓, 3✓**, con símbolos y texto, cuatro teclas compartidas de 56 px o más en las medidas solicitadas.
- Conservación exacta del texto **7–3 · 70%** y del guion vacío. El span de énfasis del porcentaje solo existe en el HTML de la maqueta; no se modifica el módulo estadístico.

### Paleta y contraste

| Rol | Valor |
| --- | --- |
| Naranja deportivo | #F46A2A |
| Grafito | #202C2A |
| Fondo Light | #F5F6F3 |
| Superficie Light | #FFFFFF |
| Fondo Contrast | #F0F3ED |
| Superficie Contrast | #FDFDF9 |
| Contador fallado | #147A55 |
| Contador anotado | #BE3548 |
| Naranja de texto/foco sobre claro | #A94412 |
| Selección cálida | #FFF0E5 |
| Contadores sobre grafito | #9DE4B8 / #FFB0B9 |

El naranja #F46A2A se conserva como color de identidad; el texto de su botón usa grafito, con contraste medido **4,77:1**. No se pone texto blanco pequeño sobre ese naranja. Sobre fondos oscuros los verdes/rojos se aclaran para mantener contraste, sin cambiar su significado deportivo.

## 2. CourtFlow Light

**Concepto:** una superficie de registro abierta, clara y tranquila, en la que los controles y las cifras llevan la jerarquía.

- Cabecera blanca compacta, título en caja de frase, acento naranja fino y selector de fondo neutro. Nuevo partido tiene presencia naranja; el resto de herramientas utiliza grafito o rojo contextual para Eliminar.
- Transición/Estático arriba, en proporción 1:2; Estático mantiene tres columnas en iPad horizontal y escritorio. Bloqueo directo sigue debajo con tipo a la izquierda y cinco defensas a la derecha.
- Encabezados ligeros, sin bandas oscuras: nombre de sección, pequeño anclaje naranja y resumen en una superficie neutra de radio 8 px.
- Acciones y defensas blancas con contorno fino, superficies pulsables y separaciones constantes. No existe una tarjeta exterior para cada sección.
- Los tipos de bloqueo se leen en un carril de texto estable, con su resumen debajo. Divisores suaves separan filas sin dibujar una tabla negra.
- Barra inferior blanca, resultados verdes/rojos suaves y texto oscuro de esos colores. Las cifras y el símbolo son más grandes que el rótulo, con proporciones moderadas.

**Ventajas:** preserva mejor la memoria espacial de Fase 6A, evita competencia entre bandas oscuras y cifras, mantiene la lectura horizontal de la matriz y reduce carga visual. Es la base recomendada para registrar acciones durante un partido.

**Límites:** el tratamiento suave requiere comprobar en el iPad que todos los botones se distinguen con brillo/reflejos reales. Los contornos secundarios no pretenden ser el único indicador de selección; esta dispone de un borde de mayor contraste, franja y símbolo.

## 3. CourtFlow Contrast

**Concepto:** la misma identidad moderna, con una zona de herramientas y una barra de registro más contundentes, mientras todo el trabajo estadístico permanece claro.

- Cabecera grafito de radio 12 px; selector claro y naranja focal en Nuevo partido. El área central sigue sobre un fondo claro: no se transforma toda la pantalla en un tema oscuro.
- En anchura/altura suficientes, Transición y Estático se agrupan a la izquierda; Bloqueo directo ocupa el tablero principal a la derecha. Transición tiene dos acciones lado a lado y Estático dos columnas/tres filas.
- Resúmenes grafito para un nivel de contraste superior; títulos con mayor peso y línea separadora suave, sin tipografía condensada.
- Cada tipo de bloqueo dispone de un encabezado claro compartido por sus cinco defensas. Tras revisar el primer pase, se extendió ese encabezado al ancho de su carril para eliminar la sensación de insignias flotantes y orientar mejor la lectura.
- Nombres y estadísticas de defensa alineados a la izquierda, con contornos algo más definidos. Esto cambia el tratamiento del componente respecto a Light, no solo el color.
- Barra grafito y resultados sólidos #147A55 / #BE3548 con texto blanco. Conserva radios moderados, símbolos, texto y orden.

En móvil las tres secciones se apilan en el orden habitual. El orden DOM de controles no cambia: herramientas → Transición → Estático → Bloqueo directo → resultados comunes; no hay navegación ni un paso adicional.

**Ventajas:** resultados muy reconocibles, distinción clara de herramientas frente al área estadística, y bloqueos tratados como grupos de trabajo propios.

**Límites:** la composición lateral reorganiza espacialmente Estático y puede exigir adaptación. El grafito de cabecera/barra atrae más atención que Light; es adecuado si se quiere una presencia de consola moderna más marcada, pero no hay evidencia de que acelere el registro.

## 4. Comparación y recomendación

| Criterio | CourtFlow Light | CourtFlow Contrast |
| --- | --- | --- |
| Composición amplia | Transición/Estático arriba y matriz debajo. | Situaciones a la izquierda y tablero de bloqueos a la derecha. |
| Jerarquía | Abierta, cifras sobre superficies claras y resúmenes neutros. | Resúmenes grafito y tipos agrupados en carriles claros. |
| Defensas | Nombre/cifra centrados; tipo en columna lateral. | Nombre/cifra alineados a la izquierda; tipo encima de sus cinco defensas. |
| Resultados | Superficies suaves y texto semántico oscuro. | Superficies sólidas semánticas y texto blanco. |
| Cabecera en 1180×820 | 96 px | ≈95 px |
| Barra en 1180×820 | ≈115 px | ≈116 px |
| Última defensa → barra en escritorio | 26 px | 20 px |

**Recomiendo CourtFlow Light como punto de partida.** Cumple la nueva intención de ligereza y modernidad, da protagonismo suficiente al porcentaje y mantiene más estable el recorrido aprendido. Contrast es una alternativa coherente si se prefiere reforzar la zona de resultados y el tablero de bloqueos. La recomendación es un juicio de diseño, no una ventaja de rapidez comprobada en partido.

No se plantea añadir un selector Light/Contrast, cambiar el flujo o mezclar automáticamente ambas. La elección de una variante precederá a cualquier implementación definitiva.

## 5. Verificación y límites

Maquetas HTML/CSS reales con un perfil Chrome headless nuevo y datos ficticios; ninguna base del usuario utilizada. Mismos **87 intentos · 51–36 · 59%** en ambas variantes, incluyendo 7–3 · 70%, 0–5 · 0%, 5–0 · 100% y —. Se comparan 36 campos estadísticos visibles, incluidos tipos de bloqueo y total.

**12 casos emulados:** 1180×820, 1440×900 y 390×844 pedidos; además 1024×768, 1194×834 y 1024×620 en cada variante.

- Sin scroll horizontal ni etiquetas/estadísticas/resultados recortados.
- Objetivos táctiles principales ≥44×44 px CSS. Cuatro filas completas por encima de la barra en los tres tamaños de iPad amplios.
- Tres secciones y veinte defensas presentes. Orden de resultados intacto. En móvil/altura reducida, última defensa accesible al desplazarse.
- Foco visible verificado enviando Tab y selección por borde/franja/✓. Se retira el foco programático antes de capturar la imagen final para mostrar la composición sin un anillo de prueba; su comprobación queda en el informe.
- Contraste de muestras de títulos, nombres, contadores, porcentajes, tipos, selector, herramientas, resultados, guardado, guardando/error y deshabilitados ≥4,5:1. Mínimo medido **4,77:1** en ambos diseños; verde/rojo sobre blanco de Light **5,32:1 / 5,54:1**, y verde sobre selección **4,78:1**. No constituye una auditoría WCAG completa de todos los estados.
- Todos los porcentajes medidos mantienen contraste. Radios, fondos y tamaño no ocultan el denominador deportivo ni cambian cálculos.
- Sin recursos externos, fuentes remotas ni dependencias. HTML estático disponible localmente sin red; esto no implementa soporte offline/PWA en producción.

**Dispositivos reales probados: ninguno.** Pendientes Safari en iPad físico, fuentes efectivas del sistema, zonas seguras no nulas, brillo/reflejos, texto ampliado/zoom nativo, rotación, teclados y lector de pantalla. No se asume que la emulación reproduzca esas condiciones.

La fuente de datos sigue siendo el CSV local actual para categorías; el generador usa los módulos puros existentes. Las páginas de vista previa no cargan app.js, persistencia, sincronización o exportación, no abren IndexedDB y no registran tiros. Guardado es una representación ficticia. El script de maqueta solo mide geometría/contraste y reserva espacio inferior.

Se comparan huellas SHA-256 de los 12 archivos runtime al inicio/final: producción intacta durante Fase 6E. No se repiten regresiones de IndexedDB/CSV al no modificar ni ejecutar la lógica funcional. Una implementación autorizada deberá consolidar CSS y repetir regresiones, ampliación de texto y datos/nombres largos sobre la aplicación real.

## 6. Entregables para revisar

- [Comparador CourtFlow](tests/diseno-fase6e/comparacion.html), con capturas equivalentes de iPad, escritorio y móvil; incluye móvil desplazado.
- Vistas estáticas a ancho real: [Light](tests/diseno-fase6e/light.html) y [Contrast](tests/diseno-fase6e/contrast.html).
- [Guía y archivos fuente](tests/diseno-fase6e/README.md). Hoja común courtflow.css y variantes light.css/contrast.css bajo tests/, sin editar styles.css.

| Tamaño | Light | Contrast |
| --- | --- | --- |
| iPad 1180×820 | [Captura](.test-artifacts/fase6e-light-1180-820.png) | [Captura](.test-artifacts/fase6e-contrast-1180-820.png) |
| Escritorio 1440×900 | [Captura](.test-artifacts/fase6e-light-1440-900.png) | [Captura](.test-artifacts/fase6e-contrast-1440-900.png) |
| Móvil 390×844 | [Captura](.test-artifacts/fase6e-light-390-844.png) | [Captura](.test-artifacts/fase6e-contrast-390-844.png) |

Capturas móviles al final de la matriz con sufijo -scroll.png. Informes: .test-artifacts/fase6e-geometria.json y fase6e-integridad.json. Pruebas y artefactos permanecen excluidos de publicación.

**Sin commit, push ni despliegue. La Fase 6E termina para revisión antes de aplicar una dirección definitiva.**
