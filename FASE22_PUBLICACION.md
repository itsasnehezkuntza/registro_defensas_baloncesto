# Publicación conjunta de Fases 21 y 22 — versión 22.0

29 de octubre de 2026. Autorización expresa del usuario: «Autorizo su publicación dame lo que hemos hecho para luego continuar». Publicación general en la URL habitual https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/ . Preparación en curso; no declararla publicada hasta verificar Pages y HTTPS.

## Alcance y base validada

- Fase 21: integridad transaccional del panel local. Existencia del partido y ausencia de tiros se comprueban dentro de la transacción de guardado; rechazo sin escrituras parciales. Sin cambio de esquema IndexedDB.
- Fase 22: sin cuenta, guardado local; con Google, equipo requerido y sincronización automática. Equipo único automático, selección válida recordada o elección. Registro offline tras configurar equipo. Históricos solo por revisión/confirmación, originales conservados e importación idempotente. Colas persistentes y cierre protegido sin «Salir igualmente».
- No se rediseña Registro/Dashboard ni se añaden dependencias, roles administrativos, importaciones automáticas o migraciones reales.
- Candidato físico `22.1-3cd65834dc6e9da4`, versión temporal `7746df95101a2bd6`. Confirmación del usuario tras guía A–D: «Acabo de hacer lo que me has pedido y funciona». Evidencia reportada, sin inspección independiente de sus documentos.
- Pruebas existentes: acceso/cuentas 28 grupos, Sync 40, integridad 42, unitarias 11 archivos, arranque 8/6, editor 2 y regresiones locales/CSV/subruta correctas. No se repiten baterías extensas para publicar.

## Conservación y publicación

Respaldo previo de las 366 rutas del workspace, hashes/ausencias/estado/diff en `.local-backups/publicacion22-20261029/`. Rama develop y HEAD `7c439c149ad2bbe4e71749260e8b9d10f45c0d83` conservados; índice vacío. Única modificación funcional de preparación posterior al candidato: ninguna; index.html solo cambia el metadato de versión de 20.0 a 22.0. Se añade documentación de publicación y continuidad.

Se usa la copia aislada `.test-artifacts/publicacion22-repo`, basada en main remoto `8250750026879dc1a0aaba2145eb28d497c49fa4`. Pages previo `647aeb55d8738e04dbb785e9ca652bcb64529cd0`. Se copiarán únicamente los archivos propios de Fases 21/22 y sus pruebas/documentos: no se hace commit masivo del workspace acumulado. La publicación autoriza los commits/push necesarios en esa copia, sin resets ni cambios de rama en develop.

Pages contiene únicamente los 38 archivos públicos de aplicación, incluida .nojekyll, más version.json. Ningún perfil, copia de datos, credencial privada, herramienta de diagnóstico, prueba, regla o documento interno. Los módulos/CSS/CSV/fuentes coinciden con el candidato físico; HTML solo recupera el título normal y lleva el metadato 22.0. La configuración web de Firebase es pública; no es una clave de servicio.

Preflight remoto correcto: Pages gh-pages/root en 20.0, Google habilitado, dominio habitual autorizado, reglas activas iguales a las probadas (`901339e9-c122-463f-98e2-a5a02d34439a`). No se modifica Firebase, ni se renueva el preview, ni se consultan/escriben partidos reales. El conector GitHub se utiliza para inspección; Git y la API de Pages permiten el push atómico y la verificación de build que no ofrece el conector.

Plan: respaldo remoto de main y Pages; commits pequeños en copia aislada; push atómico de ambas ramas; comprobar build, versión normal sin query, hashes HTTPS y rutas internas 404. Verificación breve 20→22 con datos ficticios en perfiles efímeros; arranque público sin login y sin Firestore. Recibos en `.test-artifacts/firebase/publicacion22/`.

## Estado y reversión

Pendiente de ejecución/verificación definitiva. No borrar datos para resolver incidencias. Ante un fallo, conservar colas, originales y evidencia; detener nuevas escrituras de prueba. El respaldo de código no es una copia de datos. Volver a 20.0 reintroduciría sus defectos y su cierre destructivo; valorar cada reversión sin modificar reglas ni reiniciar IndexedDB.

Tras publicar, recargar la dirección habitual en todos los dispositivos con conexión. Los históricos del preview pertenecen a otro origen y no se migran al almacenamiento de Pages. Los datos ficticios de Firestore se conservan al caducar el canal.

## Pendientes conservados

Localizar los partidos reales del entrenador y recuperarlos requiere una intervención aparte, empezando por metadatos/recuentos autorizados y su dispositivo; esta publicación no los localiza ni los importa. Administración de lectura, respaldo independiente, Cancelar/Deshacer al nombrar en el editor, texto «Eliminar» y MOP-001 siguen sin implementar. Véase CONTINUIDAD.md.
