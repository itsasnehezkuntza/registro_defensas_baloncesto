# Fase 19 — cursor estable al nombrar una defensa

El usuario confirma que cerrar y reabrir Safari recupera correctamente la sesión y el partido en el iPad nuevo. Ese paso físico queda terminado. Informa de que el cursor desaparece periódicamente al escribir el nombre de una defensa nueva.

## Causa y cambio

Fallo reproducido antes de corregir: 120 ms después de añadir o escribir, el cálculo de espacio llamaba a `renderParts()` y sustituía la cabecera completa, incluido el campo de texto. El manejador de escritura ya evitaba reconstruirla, pero esta actualización diferida la destruía igualmente.

`js/editor.js` conserva ahora la cabecera durante el recálculo de capacidad y actualiza solo la barra de añadir. Se mantiene el campo con su foco, selección y teclado. Las otras operaciones del editor siguen actualizando sus controles como antes. Sin cambios de IndexedDB, IDs, configuración deportiva, eventos o cálculo de límites.

Respaldo: `.local-backups/fase19-editor-20261020/`.

## Verificación

- `editor19.test.mjs`: fallo original observado; tras corregir, Chromium y WebKit permiten escribir despacio, esperar entre letras, insertar en medio del nombre, cambiar la altura disponible y guardar/recargar el nombre completo.
- `tests/diseno-v4/editor.mjs`: correctos migración conservadora, históricos, altas/bajas/renombrados, aislamiento por partido, bloqueo con tiros, conflicto entre pestañas, límites y tamaños táctiles.
- Diez archivos `node --test tests/*.test.mjs` correctos.
- Diez grupos del candidato temporal correctos en Chromium/WebKit: conservación íntegra de partido/eventos al actualizar desde 17 y 18, escritura pausada, recarga, CSV, estadísticas y bloqueos de origen/datos ajenos. Cero solicitudes externas en estas pruebas locales.

Solo perfiles efímeros y datos ficticios. La prueba física de esta corrección en el iPad queda pendiente del usuario. MOP-001 continúa como mejora opcional sin implementar.

## Vista previa

Candidato `19-79f88c07bb7931b7`, 39 archivos, Sync bloqueado en configuración y transporte. Acepta los marcadores de los builds 17 y 18 para conservar las pruebas ya guardadas. La corrección se limita al canal temporal existente, su mismo enlace y caducidad; no autoriza producción, Pages, reglas, Auth, renovación del canal, commit o push.

Publicado el 20 de octubre a las 21:11:18 UTC, versión Hosting `e06d1fb6d6a86f4a`, en https://registro-defensivo--ipad17-ot4rlj0m.web.app. Caducidad conservada exactamente: `2026-10-21T20:22:43.362904890Z` (21 de octubre, 22:22:43 Madrid). Auth, reglas, live y Pages intactos; sin renovación, commit ni push. El reporte se trata como corrección de la prueba ya autorizada, con el alcance de Fase 18.

Sobre HTTPS: 38 hashes/cabeceras correctos y rutas internas 404. Chromium verifica escritura pausada/cursor/recarga del nombre, Google hasta OAuth cancelado sin credenciales, registro/doble toque/recarga/estadísticas y ausencia de CSP/errores/Firestore. WebKit HTTPS mantiene la limitación TLS del entorno; no se omite la validación del certificado ni se confunde con la prueba física pendiente. Recibos en `.test-artifacts/firebase/fase19/` (`editor.json`, `verificacion.json`, `preflight.json`, `uploaded-review.json`, `deployment.json`, `https-verification.json`).

**Fase 19 terminada y detenida para revisión en el iPad.** Recargar el mismo enlace y probar la escritura; no borrar los datos del navegador. No se inicia otra fase.

**Confirmación posterior del usuario:** «Ya funciona perfecto!!». Corrección del cursor aceptada en la prueba física del iPad. Para retomar el 21 de octubre solicita anotar una opción de cancelar/deshacer el cambio de nombre al editar y sustituir «Quitar» por «Eliminar». Pendientes en el apartado 74 de `ESPECIFICACION.md`; sin implementación ni nueva publicación hoy.
