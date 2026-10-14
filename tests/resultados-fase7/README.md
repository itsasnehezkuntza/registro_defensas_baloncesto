# Fase 7 — Fallados/aciertos

Revisión vigente en `revision.html`: formato 4/2 (cuatro fallados, dos aciertos) en Registro y Estadísticas. Sin datos: guion. Mezcla de tiros de dos y tres, contando cada evento una vez; puntos concedidos y CSV se conservan internamente.

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
Get-ChildItem tests -Filter '*.test.mjs' | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
node tests/resultados-fase7/verificar.mjs
```

Servidor efímero loopback 4190, contextos nuevos de Chromium sin perfiles personales ni datos reales. `--headed` muestra el navegador; `--visual-only` omite las regresiones previas. Sin instalación, publicación ni cambios de almacenamiento.

Se comprueban fases 2, 3, 5 y 6, aislamiento/sincronización, subruta Pages, cinco tamaños, veinte combinaciones y sus totales, detalle por celda, ausencia de porcentajes/métricas extra, teclado, recarga, doble toque, Deshacer y CSV. La muestra presenta 68/60 global, 44/44 en Bloqueo directo y 4/2 en PR Pop/White.

Informe: `verificacion.json`. Capturas en `capturas/`. Las carpetas `puntos-fase7` y `matriz-fase7` conservan estados anteriores. Emulación Chromium, sin comprobación física de Safari/iPad.
