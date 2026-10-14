# Evolución del premium — propuesta aislada

Estado: propuesta única terminada y verificada, pendiente de revisión antes de integrar. 13/10/2026.

## Diagnóstico y plan previo

Referencia comprobada: `origin/design/premium-ui`, c41774782bc216ca069fbf309c1a1274c0ae2398, y captura local `.test-artifacts/premium-ui-1180-820-1.png`. Los cuatro adjuntos actuales son referentes de materiales/aplicaciones; no se identifica entre ellos una captura del registro. No se presenta esa captura local como adjunto del usuario.

La rama contiene varias capas CSS sucesivas: se evalúa el resultado final, no su primer bloque. La integración conservó el orden local de resultados, estadísticas, objetivos táctiles de 44 px, ejes condicionales según CSV y adaptación móvil sin matriz desbordante. Esas correcciones funcionales no deben revertirse. Posteriormente se incorporaron fuentes locales y mayúsculas.

Copper Court cambió la proporción superior de 1:1,6 a 1:2, el fondo blanco a gris, los paneles superiores grises a blancos y el pie claro a una cápsula negra. Eliminó el plano interior de la matriz y redujo la distinción entre superficie y controles. Pulse/Bench/Switch, que permanecen aislados, cambiaron la distribución y no son la base de esta evolución.

Dirección: conservar la geometría premium, enriquecer sus materiales. De las referencias se toman reflejos finos, capas translúcidas y controles con volumen; no sus fotografías, navegación, colores adicionales ni grandes espacios vacíos.

Tokens: blanco #FFFFFF, lienzo #F7F7F7, panel #E9E9E9, tinta #202020, secundario #606060, cobre #C38053. Variantes del cobre solo para contraste/selección. Barlow Condensed local para títulos deportivos originales; Manrope local en acciones, controles y cifras tabulares. Todo visible en mayúsculas.

```text
TÍTULO                                    ESTADO
PARTIDO          NUEVO  ELIMINAR  DESHACER  CSV
┌ TRANSICIÓN ──────────┐ ┌ ESTÁTICO ───────────────────┐
│ ACCIÓN              │ │ ACCIÓN │ ACCIÓN │ ACCIÓN   │
│ ACCIÓN              │ │ ACCIÓN │ ACCIÓN │ ACCIÓN   │
└─────────────────────┘ └─────────────────────────────┘
┌ BLOQUEO DIRECTO ────────────────────────────────────┐
│ SITUACIÓN         BLACK  WHITE  BLUE  RED  TUT      │
│ MANEJADOR          □      □      □     □    □       │
│ ROLLER             □      □      □     □    □       │
│ POP                □      □      □     □    □       │
│ SPAIN              □      □      □     □    □       │
└────────────────────────────────────────────────────┘
SELECCIÓN                                      TOTAL
       2✕          3✕          2✓          3✓
```

Títulos y acciones alineados a izquierda; defensas centradas. Paneles superiores 1:1,6 y misma altura; Estático 3×2. Móvil apila paneles y mantiene todas las defensas desplegadas. No se estrechan los objetivos para forzar todo el registro en una pantalla.

Autocrítica previa: repetir glassmorphism en 28 botones difuminaría la jerarquía. Se reserva al soporte de paneles y barra; los botones son blancos opacos y los ejes más planos. El cobre sólido se concentra en selección y Nuevo partido; no se colorea cada grupo. Se descartan círculos decorativos, nuevas tarjetas, navegación y cambios de estructura. La barra vuelve a ser clara, con dos pares diferenciados por luminancia y etiquetas.

## Aislamiento

Se reproduce el HTML real, incluyendo IDs/clases, y las envolturas de `buildDirectActions`. El generador lee `categorias.csv` y el parser puro local; el navegador carga únicamente una muestra ficticia y un simulador en memoria. No carga app.js ni módulos de persistencia/exportación. Los controles de partidos y CSV muestran un aviso de maqueta; no se hacen pasar por funcionalidad real. Recargar reinicia la muestra.

Los archivos principales se verifican por SHA-256. `actual.css` y `base.css` son instantáneas para comparación; no se editan sus originales. La referencia remota se guarda solo dentro de esta carpeta, sin checkout/fetch ni cambios de rama.

## Resultado y reproducción

- `index.html`: propuesta interactiva. `revision.html`: capturas comparables, tablet y móvil. `actual.html` y `referencia.html` son referencias de diagnóstico, no alternativas de diseño.
- `node tests/evolucion-premium/servir.mjs`: servidor local exclusivo en http://127.0.0.1:4183/. `node tests/evolucion-premium/abrir.mjs`: abre el comparador con Chromium visible en un perfil efímero; cerrar su ventana termina el proceso.
- `node tests/evolucion-premium/capturar.mjs`: capturas y comprobaciones, con servidor temporal propio en 4184. Añadir `--headed` para repetir en navegador visible. Usa Playwright y Chromium ya instalados, sin dependencias nuevas.
- En PowerShell sin Node en PATH, sustituir `node` por `& 'C:/Program Files/nodejs/node.exe'`.

Verificados seis tamaños (1440×900, 1180×820, 1024×768, 768×1024, 390×844 y 320×740), tanto headless como en navegador visible: 28 objetivos, tres secciones, Estático 3×2, alturas iguales cuando están en paralelo, matriz completa sobre el pie en escritorio/tablet, ausencia de recortes horizontales, botones ≥44×44, resultados fijos y última defensa accesible por scroll. Mayúsculas y paleta neutra/naranja comprobadas mediante estilos calculados, incluidos gradientes. Foco de teclado, dos pulsaciones simuladas, consumo único ante doble toque, Roller 2P, Deshacer y reinicio de muestra al recargar comprobados. Ninguna base IndexedDB ni entrada localStorage; cero errores de carga/JavaScript.

Refinamientos tras capturas: densidad en 1024×768 para evitar solapamiento del pie; prioridad CSS de selección frente a hover; cifras de defensas a 11 px; textos FALLADO/ANOTADO conservados incluso a 320 px. Capturas completas en móvil incluyen el pie fijo a la altura del viewport: para evaluar desplazamiento usar las capturas de inicio y final del comparador.

`verificacion.json` y `verificacion-visible.json` contienen resultados y geometría; 12 archivos runtime mantienen sus SHA-256 iniciales. Capturas inspeccionadas de escritorio, tablet y móvil. Pendientes: aprobación estética, tacto/Safari y brillo/reflejos en dispositivo físico. No se afirma auditoría completa de accesibilidad, zoom nativo ni mejora de velocidad medida. No se repiten suites de persistencia/CSV porque la aplicación funcional no cambia ni se ejecuta. Sin commit, push, fetch o publicación.
