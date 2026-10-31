# Contexto para continuar — Registro defensivo

**Fase 23.1 terminada: revisión y preparación, sin publicar.** Sin bloqueantes de seguridad detectados. Cliente exacto Pages 22.0 probado bajo reglas nuevas en emuladores; 19 cláusulas, funciones auxiliares y ámbitos originales conservados. Paquete revisado de 44 archivos públicos, reglas/configuración dedicadas fuera de Pages y reversión exacta de 39 archivos 22.0 en `.test-artifacts/firebase/fase23-1/`. Las reglas activas se respaldarán y compararán al ejecutar una publicación autorizada; no se han consultado ahora. [Plan, asignación desde Console y prueba física](FASE23_1_REVISION_PUBLICACION.md). Sin commit, push, despliegue, permisos reales o acceso a datos deportivos reales. Detenido para revisión.

**Fase 23 local, pendiente de revisión.** Esta copia aislada añade supervisión por UID/equipo, descubrimiento por ACL privada y Dashboard de solo lectura fuera del motor de escritura. No se ha publicado ni asignado acceso real. Detalle y procedimiento en [FASE23_SUPERVISION.md](FASE23_SUPERVISION.md). La información de 22.0 siguiente identifica la base publicada.

Actualizado el 29 de octubre de 2026. **Versión 22.0 publicada y verificada para todos**, con Fases 21 y 22. URL habitual: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/ . Recargar con conexión en todos los dispositivos, sin borrar datos. Fuentes `6bfe942d32de8b4fe6efef8cafd48f533acbd339`, Pages `3aed91f329ed00b672b16ae6002a41e9acf68001`, build `22.0-568698c631fa8c1b`. Detalle en FASE22_PUBLICACION.md.

## Trabajo terminado

1. **Fase 21:** corregido el guardado del panel local: no permite editar un partido con tiros ni un partido eliminado, con comprobación atómica y sin escrituras parciales. Eventos, IDs y esquema IndexedDB conservados.
2. **Fase 22:** dos modos claros. Sin cuenta, todo deportivo local en IndexedDB. Google activa Sync automáticamente y exige equipo; único automático, último válido o elección entre varios. Sin segundo botón de activación. Trabajo offline cuando el equipo está configurado, cola persistente y reintentos.
3. **Históricos y cierre:** nunca se importan automáticamente; requieren selección y confirmación. Originales conservados e importación idempotente. Pendientes protegidos al cerrar/cambiar de cuenta; sin salida que descarte silenciosamente la cola. Estados visibles de guardado local, pendiente, confirmado y error/conflicto.
4. **Fase 22.1:** preview de 24 horas, candidato `22.1-3cd65834dc6e9da4`; paquete/hashes HTTPS comprobados. El usuario confirma la guía física A–D en Safari/iPad: Google/equipo, recepción en ordenador, offline/reconexión y modo local/históricos. No se añaden pruebas no comunicadas a esa confirmación.
5. **Publicación 22.0:** autorizada y terminada desde copia aislada, conservando el trabajo acumulado de develop. Módulos idénticos al candidato físico; build Pages correcto, 39 hashes HTTPS y 12 rutas internas 404. Comprobación breve de actualización 20→22 en Chromium/WebKit correcta. Arranque público sin errores/CSP/Firestore. Reglas, Auth, Hosting y datos reales intactos durante la publicación; sin nueva campaña de registros.

## Evidencia disponible

- 28 grupos de cuentas/equipos en Chromium/WebKit con Auth/Firestore Emulator.
- 40 grupos de Sync, 42 de integridad local, 11 archivos unitarios, arranque/editor/CSV y regresiones locales correctas.
- FASE21_INTEGRIDAD_LOCAL.md, FASE22_CUENTAS.md y FASE22_1_VALIDACION_IPAD.md contienen alcance y límites. Recibos privados en `.test-artifacts/firebase/` y respaldos en `.local-backups/`.

## Git y datos: conservar antes de continuar

develop sigue en `7c439c149ad2bbe4e71749260e8b9d10f45c0d83`, con numerosos cambios previos y archivos sin seguimiento. No hacer reset, limpieza, cambio de rama ni commit masivo para igualarlo con main. La publicación se hizo en `.test-artifacts/publicacion22-repo`; sus referencias remotas están actualizadas, pero las del workspace pueden seguir antiguas. Comparar contra el respaldo y las referencias remotas reales antes de integrar otra fase. Respaldos remotos: `respaldo/antes-fase22-main-20261029` y `respaldo/antes-fase22-pages-20261029`; respaldo completo previo del workspace en `.local-backups/publicacion22-20261029/`.

No borrar IndexedDB, cachés, sesiones o documentos para diagnosticar sincronización. No hacer migraciones reales ni importaciones de históricos sin confirmación. «Sincronizado» no equivale a copia independiente: un borrado autorizado puede propagarse.

El preview `https://registro-defensivo--fase22-1-bsovr4vx.web.app` caduca el **30 de octubre de 2026 a las 17:09 de Madrid**, sin renovación. Su IndexedDB es distinta de Pages. Se añadió solo su dominio Auth con autorización expresa; la caducidad no borra los datos ficticios ni retira ese dominio. Cualquier limpieza se revisará aparte, sin eliminar partidos.

## Pendientes para una próxima fase, sin autorización de implementación todavía

1. **Partidos reales del entrenador:** el problema inicial no se ha diagnosticado sobre sus datos. Podrían estar solo en su dispositivo, pendientes, en otro equipo/cuenta o fuera de los permisos del propietario. Empezar por identificar dispositivo/origen/cuenta/equipo/estado y por metadatos/recuentos autorizados. No confundir registro de Authentication con respaldo de partidos. Conservar y revisar antes de importar; no duplicar ni sobrescribir.
2. **Administración de lectura:** implementada localmente en Fase 23, exclusivamente por UID/equipo y con ACL administrativa. Pendientes revisión, publicación coordinada y asignaciones concretas autorizadas; ver FASE23_SUPERVISION.md.
3. **Respaldo independiente de bajo coste:** pendiente de definir; no añadir infraestructura ni nuevos formatos de exportación deportivos sin solicitud. La aplicación continúa exportando CSV del partido activo.
4. **Editor:** Cancelar/Deshacer al nombrar y cambiar «Quitar» por «Eliminar», pendientes del apartado 74 de ESPECIFICACION.md.
5. **MOP-001:** refinamiento opcional del desplazamiento vacío en Safari; pendiente, prioridad baja.

Ningún resultado de la prueba breve garantiza retención prolongada de Safari ni apertura de la web desde cero sin conexión: no hay nuevo service worker. No retomar campañas de escrituras ni ampliar el alcance sin nueva instrucción.
