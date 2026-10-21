# Fase 12 — M4: restaurar la sesión antes de registrar

Fecha: 20 de octubre de 2026. Rama local `develop`, con las fases anteriores conservadas. **M4 corregido; Fase 12 completada y detenida para revisión.** Sin commit, push, despliegue, reglas nuevas ni datos deportivos reales usados en las pruebas.

## Resultado

La elección recordada de Google mantiene visible la pantalla existente durante la recuperación de la cuenta y del equipo. No se puede registrar transitoriamente en los partidos sin cuenta. El bloqueo empieza antes de los módulos y se refuerza con `inert`, controles deshabilitados y guardas en las operaciones de la aplicación.

El equipo recordado en caché permite continuar offline dentro del ámbito correcto, sin esperar al servidor. Sin caché se espera a resolver la selección. Si falla la cuenta/equipo, se agota el tiempo de Auth o el equipo ya no está disponible, se ofrecen reintento y elección local; no se cambia automáticamente al ámbito del dispositivo. La preferencia de equipo se conserva para reintentar.

Elegir «Continuar sin cuenta» cancela la restauración de la aplicación y descarta sus callbacks tardíos. No cierra la sesión persistida de Google ni borra sus copias locales; para eso permanece «Cerrar sesión». En aperturas posteriores con modo local no se inicia Auth ni Sync. No se afirma que se cancelen las descargas ya iniciadas antes de elegir.

No cambia el registro de dos toques tras resolver el acceso, ni el guardado confirmado por transacción. Se conservan IndexedDB, histórico, IDs, reglas, configuración deportiva, cálculos y CSV.

## Archivos

Producción: `index.html`, `cuenta.css`, `app.js`, `js/cuenta.js`, `js/cuenta-ui.js`, `js/sync-ui.js`.

Prueba nueva: `tools/firebase/startup12.test.mjs`. Ampliación: `tools/firebase/cuenta.test.mjs`. Ayudantes y regresiones adaptados: `browser-support.mjs`, `auth-browser.mjs`, `sync-ui.test.mjs`, `local-browser.mjs`, `real-local.test.mjs`, `sync-auto-refresh.test.mjs`, `tests/integracion.test.mjs`, `tests/fase2-browser.mjs`, `tests/fase5-browser.mjs` y `tests/diseno-v4/verificar.mjs`.

Las pruebas distinguen «aplicación inicializada» de «registro desbloqueado». El DOM simulado incorpora `documentElement`; Fase 2 elige explícitamente modo local antes de sus pruebas deportivas. Las pruebas de SDK suspendido comprueban que sus respuestas tardías no reabren la cuenta. Fase 5 espera también el refresco posterior al error de partido eliminado, manteniendo la exigencia de cero descargas ajenas; antes se comprobaba inmediatamente tras liberarse el bloqueo de la operación, antes de terminar ese refresco.

## Verificación

- `node tools/firebase/startup12.test.mjs`: siete grupos con app, controlador, ámbito e IndexedDB reales y adaptadores controlados, sin peticiones externas. Retraso de módulos/Auth/equipo, registro y doble toque solo en el equipo correcto; elección local y respuesta tardía; error y reintento; equipo sin caché y red fallida; equipo ausente con/sin caché; timeout (80 ms únicamente en el contexto de prueba, producción mantiene 12 s); elección local recordada. Originales del dispositivo comprobados sin reescribirlos. Recibo: `.test-artifacts/firebase/fase12/arranque.json`.
- Pantalla de restauración en 1180×740, 820×1180 y 390×844: sin desbordamiento horizontal, objetivo local ≥44 px y sin desplazamiento en tamaños iPad. Captura 1024×768 inspeccionada: `.test-artifacts/firebase/fase12/restaurando.png`.
- `node tools/firebase/emuladores.mjs auth`: SDK oficial 12.11.0, cuenta/recarga, dos pestañas, elección local, pregunta única, cambio de cuenta, cierre cancelado/forzado, borrado solo de esa cuenta y popup bloqueado correctos. Cero solicitudes Firestore reales. Recibo `.test-artifacts/firebase/auth.json`.
- `node tools/firebase/emuladores.mjs sync`: **24 grupos correctos**, incluida UI completa y temporada ficticia de Fase 11; cero escrituras reales. Recibo `.test-artifacts/firebase/sync.json`.
- `node tools/firebase/local-browser.mjs`: correcto; fases 2, 3, 5, 6 y 10, siete tamaños en modo local sin solicitudes externas, fallos SDK, CSV y subruta de Pages. Recibo `.test-artifacts/firebase/local.json`.
- `node tools/firebase/sync-auto-refresh.test.mjs`: recepción bidireccional automática con transporte ficticio correcta, sin recargas ni ciclos forzados; conserva la prueba del adaptador puntual antiguo. No mide las escuchas de producción, cubiertas por Emulator/Fase 11.
- `node --test` sobre nueve archivos deportivos/UI, cuenta y escuchas: 11/11 archivos correctos.
- Paquete estático local preparado con 36 archivos. No publicado.

## Límites y siguiente paso

Safari/iPad físico sigue pendiente; las medidas automatizadas no sustituyen la validación real de Google o persistencia. La descarga inicial del SDK, los originales ocultos y la preferencia al cerrar sesión conservan sus decisiones pendientes. No se cambia Auth real ni se publica.

Tras revisión, el siguiente punto es M5 (cola bloqueada que detiene recepción). No se inicia en esta fase.
