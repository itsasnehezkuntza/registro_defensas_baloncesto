# Fase 7 — Matriz y auditoría de puntos

Abrir `revision.html` para revisar las capturas locales. No necesita servidor y no lee ni escribe IndexedDB. Decisiones y cierre en el apartado 33 de `../../ESPECIFICACION.md`.

## Reproducción

Node instalado en este equipo en `C:\Program Files\nodejs`. Playwright y Chromium ya están disponibles; ninguna dependencia nueva.

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
Get-ChildItem tests -Filter '*.test.mjs' | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
node tests/matriz-fase7/verificar.mjs
```

El preparador solo copia los 20 archivos runtime a un paquete local para probar la subruta de GitHub Pages. No publica. El runner abre y cierra su propio servidor loopback 4190; rechaza un puerto ocupado. Usa contextos nuevos de Chromium sin perfiles personales. `--headed` permite ver la ejecución; `--visual-only` omite regresiones de fases previas.

## Qué se comprueba

- `tests/matriz.test.mjs`: resultados 2✓/3✓/2✕/3✕, 36 canastas y 77 puntos en seis niveles, 57 agregaciones independientes, sumas de filas/columnas/celdas, tasas ponderadas, partido activo, vacíos, umbral 5, empates exactos y extremos, IDs y configuración histórica, sin mutar entradas.
- Siete suites Node completas. Navegador: Fase 2 (15 grupos), Fase 3 (13), Fase 5 (8), Fase 6 (9), más aislamiento/sincronización de partidos y subruta.
- Cinco viewports: 1180×820, 1024×768, 390×844, 320×740 y 844×390. Treinta celdas (20 combinaciones + 10 totales), selección de cada combinación, detalle y teclado, recarga, tiro triple con doble toque, Deshacer con detalle seleccionado y descarga CSV con BOM.
- Sin desbordamiento horizontal de página, matriz completa a lo ancho en ambos iPad, objetivos ≥44 px, cifras sin recorte, barras #444/#c17c4b y paleta neutra/cobre. Capturas de inicio, matriz, detalle, Dashboard completo y registro. No se comparan porcentajes redondeados para asignar distintivos.

Muestra determinista creada a partir de permisos y nombres del CSV: 128 intentos, 68 fallados, 60 anotados, 141 puntos. Incluye 88 intentos y 103 puntos de Bloqueo directo. Las capturas no reproducen la muestra anterior de 36/77; ese caso es una regresión numérica separada.

Informes: `verificacion.json`, `verificacion-visual.json` (última pasada tras asegurar la visibilidad completa de la celda móvil seleccionada), `integridad.json`. Capturas en `capturas/`. Pruebas/documentación internas excluidas de publicación por las reglas existentes. Emulación Chromium, sin comprobación de hardware físico o Safari/Firefox. Umbral de cinco intentos provisional; pendiente revisión final, sin iniciar otra fase.
