# Fase 7 — Porcentajes y desglose al pulsar

Revisión vigente en `revision.html`. Resumen general y matriz muestran fallados/aciertos y porcentaje de éxito defensivo (4/2 → 67%). El detalle de seis métricas permanece oculto hasta pulsar una celda o total. Registro conserva su presentación anterior.

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
Get-ChildItem tests -Filter '*.test.mjs' | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
node tests/detalle-fase7/verificar.mjs
```

Servidor efímero en loopback 4190; contextos nuevos sin perfiles personales ni datos reales. `--visual-only` omite regresiones de fases previas; `--headed` muestra el navegador. No instala ni publica.

Verifica regresiones de fases 2/3/5/6, partidos y subruta Pages; cinco tamaños, las 36 celdas actuales (24 combinaciones y 12 totales), seis métricas, porcentajes, datos vacíos, detalle oculto al inicio/foco/hover, activación por teclado, cierre al recargar/cambiar partido, actualización al deshacer, doble toque y CSV. Comprueba tamaños táctiles, scroll interno de la matriz, ausencia de desbordamiento horizontal de página y paleta gris/naranja. Los eventos de prueba incluyen dobles y triples.

Informes `verificacion.json` y `verificacion-visual.json`; capturas antes de seleccionar, tras seleccionar el total y el ejemplo 4/2, además de Registro. Revisiones anteriores en `resultados-fase7`, `puntos-fase7` y `matriz-fase7` son históricas. Emulación Chromium; pendiente Safari/iPad físico.
