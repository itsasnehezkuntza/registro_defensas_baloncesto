# Exploración artística independiente

13 de octubre de 2026. Habilidad aplicada: `.agents/skills/frontend-design/SKILL.md`.

Las referencias muestran superficies suaves, controles integrados y jerarquía deportiva con contraste. Se interpretan como herramientas de banquillo: se evita añadir fotos, navegación ficticia o decoración que quite espacio a las defensas. Las mayúsculas responden al requisito explícito del usuario, por encima de la preferencia general de la habilidad por sentence case.

## Plan revisado antes de construir

| Dirección | Tokens | Tipografía | Composición y gesto memorable |
| --- | --- | --- | --- |
| Pulse | blanco #FFFFFF, gris #F0F0F0, tinta #171717, secundario #626262, naranja #B8815D | Manrope 500–800; títulos compactos y cifras suaves | Situaciones a la izquierda, cuatro columnas verticales de bloqueo a la derecha. Resultados redondos dentro de un control continuo. |
| Bench | negro #0A0A0A, grafito #242424, blanco #FAFAFA, gris #AAAAAA, naranja #B8825E | Manrope 600–800; títulos fuertes, nombres precisos | Herramientas en banda lateral, matriz central, resultados en columna derecha. Todo el espacio funciona como consola de partido. |
| Switch | blanco #FFFFFF, gris #F3F3F3, tinta #1F1F1F, secundario #666666, naranja #C08C65 | Manrope 500–800; nombres grandes y lectura horizontal | Tres carriles asimétricos; dos grandes objetivos de transición, seis filas de estático, cuatro filas de bloqueo. Resultados alargados en una pista inferior. |

```text
PULSE   [CABECERA                         ]
        [TRANSICIÓN][TIPO][TIPO][TIPO][TIPO]
        [ESTÁTICO  ][  DEFENSAS VERTICALES ]
        [             ○ ○ ○ ○            ]

BENCH   [HERRAMIENTAS][SITUACIONES][2✕]
        [           ][MATRIZ    ][3✕]
        [           ][          ][2✓]
        [           ][          ][3✓]

SWITCH  [CABECERA                       ]
        [TRANSICIÓN][ESTÁTICO][BLOQUEOS ]
        [   2      ][   6    ][4 FILAS  ]
        [2✕          3✕          2✓  3✓]
```

Autocrítica: se rechaza hacer tres skins de las mismas tarjetas. Pulse se reconoce por sus columnas y control circular; Bench por el espacio oscuro y resultados laterales; Switch por las proporciones y botones de lectura horizontal sin tarjetas exteriores. Un acento desaturado por alternativa; ningún verde, rojo o azul. Se conserva el contenido deportivo real del CSV.

## Uso y límites

Abrir `comparacion.html` para ver capturas reales y acceder a las tres demos. `pulse.html`, `bench.html` y `switch.html` son páginas independientes, con hojas de estilo propias y una base de accesibilidad compartida. `demo.js` simula selección, registro en dos pulsaciones y deshacer exclusivamente en memoria. Recargar o reiniciar vuelve a la muestra ficticia; no se abre IndexedDB, no hay exportación y no se carga app.js.

Generar HTML con `node tests/exploracion-frontend/generar.mjs`. Capturar y verificar con `node tests/exploracion-frontend/capturar.mjs`; añadir `--headed` para navegador visible. Playwright y Chromium ya instalados se reutilizan. El servidor temporal de capturas se cierra al finalizar; resultados en `capturas/` y `verificacion.json`.

Abrir el comparador con `node tests/exploracion-frontend/servir.mjs` y visitar http://127.0.0.1:4182/. Este servidor solo sirve las demos, capturas y fuente; no sirve la aplicación principal. Con Node fuera del PATH, en PowerShell: `& 'C:/Program Files/nodejs/node.exe' tests/exploracion-frontend/servir.mjs`.

Se han superado 12 escenarios headless y 6 adicionales con Chromium visible (`--headed --primary`), además de verificar el comparador y sus imágenes. Informes en verificacion.json y verificacion-visible.json. Se conservan 38 PNG: viewport, página completa y final para cada diseño/tamaño, y dos comparaciones. Muestra común: 114 intentos, 78 fallados, 36 anotados, 68%; PR Manejador/Blue 7–3 · 70%.

Crítica posterior a las capturas: Pulse ofrece más suavidad y separación entre tipos, a cambio de mayor scroll móvil; Bench concentra más información y cambia los resultados a una columna en escritorio, exigiendo evaluar esa nueva posición; Switch da prioridad a objetivos grandes de Transición y lectura por carriles, con más altura móvil que Bench. Ninguna dirección se declara aprobada ni más rápida sin probarla durante un partido.

Nada de esta exploración se incorpora a producción hasta elegir y autorizar una dirección.
