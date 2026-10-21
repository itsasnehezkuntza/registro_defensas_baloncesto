# Fase 7 — Presentación vigente: solo puntos

Abrir `revision.html` para ver las capturas actualizadas de Registro y Estadísticas. Sustituye la revisión visual anterior de `../matriz-fase7/`, que queda como histórico.

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
Get-ChildItem tests -Filter '*.test.mjs' | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
node tests/puntos-fase7/verificar.mjs
```

El runner inicia y cierra un servidor loopback 4190 y usa contextos efímeros de Chromium. Datos ficticios creados según permisos de categorias.csv. No accede a perfiles personales, no borra bases y no publica. `--headed` permite ver el navegador; `--visual-only` omite las suites anteriores.

Se comprueban fases 2, 3, 5 y 6, partidos y sincronización, subruta Pages y cinco tamaños. Las veinte combinaciones y sus totales muestran puntos; se verifica la ausencia de recuentos de tiros y porcentajes en las dos vistas, el detalle de cada celda, recarga, registro de un triple con doble toque, Deshacer, descarga CSV, objetivos táctiles y paleta. Los tests cuentan eventos internamente para detectar duplicados o pérdidas.

Informe: `verificacion.json`. Capturas: `capturas/`. Muestra: 141 puntos globales y 103 en Bloqueo directo. Sin datos: guion; datos con cero puntos concedidos: 0. No se cambian CSV, eventos, IndexedDB, IDs o reglas deportivas. Solo emulación Chromium, sin Safari/iPad físico.
