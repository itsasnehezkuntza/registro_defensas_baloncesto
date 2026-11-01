# Fase 11 — Cierre de A3: lecturas de sincronización

Fecha: 20 de octubre de 2026. Trabajo local sobre `develop`, conservando Fase 10 y cambios previos. **Completada y detenida para revisión**, sin commit, push ni publicación (apartado 61 de `ESPECIFICACION.md`). A3 corregido localmente.

## Cambio

El motor deja de descargar todos los datos cada cinco segundos. Una escucha de partidos y dos por partido vivo reciben eventos y lápidas; `firestore-watch.js` entrega solo los partidos modificados. La cola y sus transacciones conservan su funcionamiento.

Se exige confirmación de servidor en las primeras consultas; se cierran escuchas al detener el motor y al borrar un padre; se descartan callbacks posteriores al cierre y se comprueba la cuenta antes de materializar. Si se deniega acceso a eventos por borrado del padre, se confirma su lápida.

No cambia el esquema, las reglas ni el protocolo de escritura; clientes anteriores compatibles. Se conserva `pull()` para herramientas y transportes de prueba antiguos; el motor de aplicación usa `watch()`.

## Pruebas y evidencias

- `node tools/firebase/watch.test.mjs`: 30 partidos/2.100 tiros; 61 escuchas abiertas una vez; 120 ciclos sin consultas. Lápidas iniciales obligatorias, entrega de partidos cambiados, cierre, callbacks tardíos, cambio de cuenta, errores y carrera permisos/borrado.
- `node tools/firebase/emuladores.mjs sync`: SDK oficial con dos dispositivos, concurrencia, desconexión, recarga, respuesta perdida, Deshacer, borrados, vaciado, importación, aislamiento, errores, migración y UI. Temporada adicional 30×70, 12 ciclos sin reconsultas/reaperturas, tiro remoto y cierre de 61 escuchas.
- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1`: paquete local de 36 archivos con el módulo nuevo, sin publicar. La opción de ejecución solo afecta a ese proceso.
- **Resultado final:** 24 grupos de sincronización correctos, recibo `.test-artifacts/firebase/sync.json` con `ok: true`, tres sondas de conectividad interceptadas y `realWrites: 0`.
- `node tools/firebase/local-browser.mjs`: batería completa correcta (fases 2, 3, 5, 6 y 10, login, siete tamaños sin peticiones externas en modo local, fallos del SDK, CSV y subruta de Pages); recibo `.test-artifacts/firebase/local.json`.
- `node --test` sobre los nueve archivos deportivos/UI, cuenta y escuchas: **11/11 archivos correctos**. Sintaxis de módulos correcta. Revisión de espacios de documentos/empaquetador correcta; los seis avisos globales de espacios en `app.js` son previos y ese archivo no se modifica.

Las pruebas esperan el resultado persistido de la recepción asíncrona con un límite de tiempo; no fuerzan consultas para recibir cambios. Las recargas controladas esperan la parada del motor y mantienen la cola sin acuse. La prueba UI conserva una recarga normal con sesión. La prueba de respuesta tardía detiene la escucha antes de crear el remoto para controlar la entrega. Para probar un tiro vaciado estando en cola se detiene el motor antes del lote offline: se distingue cola de envío en vuelo; ambos convergen por lápidas, pero no se exige que un envío ya iniciado nunca llegue al servidor.

WebChannel puede intentar una imagen de Google para diagnosticar desconexiones. La prueba de transporte intercepta y aborta exclusivamente `https://www.google.com/images/cleardot.gif*`, sin salida a ese servidor. Las pruebas de sincronización no permiten peticiones a Firestore/Auth reales. Perfiles y datos ficticios efímeros; no se han usado datos deportivos reales.

## Límites y pendientes

Se elimina la repetición periódica de la temporada; sigue habiendo lecturas iniciales, de cambios, posibles reconexiones y reglas. Los contadores miden llamadas de API y aperturas, no una factura. Véanse [escuchas de Firebase](https://firebase.google.com/docs/firestore/query-data/listen) y [facturación](https://firebase.google.com/docs/firestore/pricing).

Cada pestaña/dispositivo mantiene sus escuchas y comparte la exclusión por ciclo, sin líder permanente. Se conservan las escuchas al ocultar la pestaña. Un cierre abrupto sin liberación conserva el arrendamiento previo de hasta 30 s.

Fuera de esta fase: M4, M5, M6, decisiones de cuenta, limpieza de Authentication, CSP, Safari/iPad físico y consolidación/publicación. Detenerse para revisión antes de iniciar el siguiente punto.
