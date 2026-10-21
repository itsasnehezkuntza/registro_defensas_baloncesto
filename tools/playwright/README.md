# Revisión visual local con Playwright

Dependencia exclusiva de desarrollo; la aplicación sigue siendo HTML/CSS/JavaScript puro. Node 20 o superior y npm son necesarios. La versión queda fijada en package-lock.json.

## Uso

Desde la raíz del proyecto:

```powershell
npm ci --cache .test-artifacts/npm-cache
npm run visual:instalar
npm run visual
npm run visual:abrir
npm run visual:informe
```

En este equipo Node está instalado en `C:\Program Files\nodejs`, pero no figura en el PATH de la terminal. Si npm no se reconoce, ejecutar antes:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
```

`visual` inicia y detiene un servidor estático en http://127.0.0.1:4173. Rechaza un servidor preexistente en ese puerto. `visual:abrir` ejecuta las mismas comprobaciones con ventanas de Chromium visibles. Para una exploración pausada puede usarse `npm run visual -- --debug --project=movil` (Playwright Inspector).

## Capturas y evaluación

- Escritorio 1440×900, móvil 390×844 y móvil estrecho 320×740, Chromium con emulación táctil para móvil.
- Seis PNG por tamaño: sin partido, formulario, partido activo, selección, registro tras recarga y final de página. Capturas completas y de viewport para evaluar también el pie fijo.
- Informe navegable en `.test-artifacts/playwright/report/index.html`; PNG y trazas de fallos en `.test-artifacts/playwright/results/`. Cada ejecución sustituye los resultados anteriores: copiar los PNG antes de comparar dos versiones.
- El runner espera la carga de configuración y fuentes. Comprueba 33 destinos, recarga del registro, errores de carga/JavaScript, ausencia de desbordamiento horizontal de página y resultados visibles con objetivos ≥44 px.
- La valoración estética requiere abrir los PNG o el informe: el éxito del runner solo acredita las comprobaciones indicadas. No se han creado referencias aprobadas ni comparaciones automáticas de píxeles. La emulación no equivale a probar Safari o dispositivos físicos.

Cada prueba usa un contexto nuevo y efímero, sin perfil personal ni storageState. Solo crea «Prueba visual / Equipo ficticio». No borra bases existentes ni cambia datos reales. Chromium se descarga dentro de `.test-artifacts/playwright/browsers/`; node_modules y artefactos quedan excluidos de Git. Los archivos de herramientas no forman parte del paquete estático de la aplicación.

Configuración basada en la [documentación oficial de Playwright](https://playwright.dev/docs/test-configuration). Para futuras referencias de comparación, seguir [Visual comparisons](https://playwright.dev/docs/test-snapshots) y aprobar las imágenes antes de usarlas como criterio.
