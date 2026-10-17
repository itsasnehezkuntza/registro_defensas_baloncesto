# Fase 8C — Primera versión interna con sincronización

Versión **8C.0**, proyecto Firebase `registro-defensivo`, SDK modular oficial **12.11.0**.
URL: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/

## Alcance de la publicación autorizada

Se prepara desde `origin/main` en `publicacion/fase8c`, mediante checkout aislado `.test-artifacts/publicacion8c-repo`, conservando el trabajo pendiente de develop. Referencia anterior: **`8c6667dd3f4ae7cdd93fa192ca9020e92bcb74a4`**, rama de respaldo `respaldo/antes-fase8c-20261017`.

Google opcional y Firestore Sync disponibles; se conserva el diseño V4 ya publicado, sin incorporar otro Dashboard. Se incluyen los módulos de cuenta, persistencia, cola, motor, transporte y controles. Se retiran instrumentación/descarga de diagnóstico y módulos temporales de iPad. La corrección mínima de arranque ya reproducida exige aplicar el estado del contexto actual antes de omitir un render idéntico; no pretende identificar o corregir por conjetura el fallo original del iPad.

La fuente de GitHub Pages pasa de main/root a **gh-pages/root**, manteniendo exactamente URL y origen. Esa rama solo contiene **35 archivos de aplicación más `version.json` público** con versión y commit de origen. No se sirven README, especificación, herramientas, pruebas, reglas, configuraciones CLI, trazas, perfiles, artefactos ni credenciales privadas. Main conserva código y documentación del proyecto; ningún archivo interno nuevo de pruebas se incluye en el commit de publicación. No se publica Firebase Hosting ni se modifican reglas/Auth/dominos en esta fase.

## Activación y datos

- Abrir sin cuenta permite crear partidos y registrar en dos pulsaciones inmediatamente.
- Entrar con Google **no activa Sync ni sube los partidos antiguos**. Menú ⋯ → **Activar sincronización**, por cuenta/proyecto/navegador, y seleccionar o crear equipo. Una activación y selección previamente realizadas se recuerdan para recuperar su cola tras recarga.
- **Solo local** conserva el trabajo local; **Desactivar sincronización aquí** detiene el motor y conserva cachés/cola/selección recordada. Otra cuenta no hereda el consentimiento. El cierre/cambio de cuenta invalida el ámbito y no entrega sus copias a la nueva cuenta. Las Rules, no el consentimiento del cliente, validan acceso real a equipo/miembro.
- Los partidos antiguos solo entran en la nube mediante **Revisar partidos locales**, selección inicialmente vacía, destino visible y **Confirmar subida de los seleccionados**. No ejecutar el asistente durante la comprobación breve de publicación.
- IndexedDB sigue siendo el guardado inmediato. Esquema v1→v2 aditivo ya probado: añade almacenes de nube/cola, sin borrar ni reescribir games/events/settings existentes. No es migración de partidos a Firebase. Ningún perfil deportivo real se abre o modifica para publicar.
- Evento y outbox, Deshacer y su lápida, borrado y su operación se guardan atómicamente. IDs estables, reintentos idempotentes, aislamiento por proyecto/cuenta/equipo, lápidas permanentes. CSV/estadísticas siguen derivando del partido activo.
- «Guardado» corresponde al commit local. Estado de nube independiente en ⋯; «Sincronizado» exige acuse y lectura completa del servidor, nunca solo navigator.onLine/caché. Fallos de Firebase/red conservan la cola y no bloquean el registro local.

La aplicación no incorpora service worker: el registro sin conexión está disponible con la página ya cargada; no se promete abrir desde cero sin Internet. No se borran los seis eventos del fixture iPad ni lápidas previas.

## Comprobaciones previas ejecutadas

- Firestore/Auth Emulator, datos ficticios, **20 grupos correctos** sobre el código candidato: A/B, simultaneidad, offline/recarga/cola, atomicidad/aborto, respuesta perdida/idempotencia, Deshacer, eliminación/alta tardía, importación confirmada/repetida/históricos/CSV, cuentas/equipos/proyectos, múltiples pestañas, esquema aditivo, conflictos, estados y UI completa con activación explícita. Cero escrituras reales.
- Chromium 390×844 y WebKit 1024×768: base v1 ficticia→v2 con histórico exacto, doble toque, recarga, CSV BOM, estadísticas, Deshacer tras recarga, borrado aislado, modo local con SDK inaccesible, sin overflow o errores JS. Capturas revisadas.
- Chromium/WebKit: cuenta restaurada mientras CSV se retrasa, controles habilitados, cero cargas Firestore antes del consentimiento, activar/desactivar y otra cuenta sin heredar activación. Cuatro grupos de smoke correctos.
- Lectura actual de Firebase: Google habilitado, `itsasnehezkuntza.github.io` autorizado, reglas coincidentes con ruleset `4bc70f67-e0ed-4fb0-b46e-7c2494eab227`, hash `8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`. Sin nuevas reglas ni acceso a partidos para esa comprobación.
- Las pruebas WebKit no sustituyen Safari físico; las fases 8B anteriores documentan el receptor físico. La comprobación breve del emisor en la URL pública queda para el usuario.

Recibos locales de preparación/despliegue/verificación: `.test-artifacts/firebase/fase8c/`, excluidos de Git y Pages. Estado exacto publicado/commit consultable en `version.json` y en la entrega final, sin afirmar un OAuth físico ejecutado automáticamente.

## Comprobación manual de cinco minutos en Safari

1. Abrir la URL publicada y recargar. En ⋯ entrar con la cuenta exclusiva de pruebas; pulsar **Activar sincronización**.
2. En iPad crear una sola vez el equipo **PRUEBA 8C** y partido jornada **8C**, rival **Rival ficticio**. No importar partidos anteriores ni usar el fixture iPad de seis eventos.
3. En ordenador abrir la misma URL, entrar con esa misma cuenta, activar Sync y seleccionar **ese mismo equipo y partido**, sin crear otro equipo.
4. Desde iPad registrar **Bajo aro → 2 fallado**. Esperar guardado local y luego «Sincronizado»; el ordenador debe mostrar un intento sin recargar, normalmente en el siguiente ciclo de unos cinco segundos más red.
5. Pulsar **Deshacer** en iPad; esperar «Sincronizado» y cero intentos también en ordenador. Si falla, conservar datos/cola y anotar el mensaje; no repetir registros para compensar.
6. Seleccionar **Solo local** y comprobar que los partidos antiguos del navegador siguen disponibles. No ejecutar importación ni borrar datos de Safari.

Si la comprobación es correcta, detener las pruebas. No limpiar automáticamente documentos ficticios/lápidas.

## Reversión

Ante problema grave, primero elegir **Solo local** o **Desactivar sincronización aquí** para detener nuevas operaciones de nube, sin borrar colas. Reversión de publicación: GitHub → repositorio → Settings → Pages → Deploy from a branch → rama **respaldo/antes-fase8c-20261017**, carpeta `/ (root)` → Save. Confirmar build correcto y recargar la misma URL. La rama apunta al commit anterior inmutable indicado arriba, sin force-push ni reset de datos.

La versión anterior puede no mostrar copias del ámbito de nube; no significa que se hayan borrado. Conservar IndexedDB, Firebase y sus lápidas; no eliminar ni reiniciar para revertir. Para volver a 8C, seleccionar gh-pages/root después de resolver la incidencia. La reversión no elimina documentos de Firestore ni exige nuevas reglas.

## Límites conocidos

Primera versión interna, no certificación definitiva. Causa del fallo original Safari desconocida; lecturas largas observadas, recuperación favorable en A/B/C. Registro físico completo como emisor pendiente de la prueba breve anterior. No hay invitaciones ni entrenadores adicionales. Se detiene para revisión al completar publicación y verificación técnica.
