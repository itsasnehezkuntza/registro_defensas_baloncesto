# Fase 23.2 — Publicación controlada de supervisión 23.0

31 de octubre de 2026. **Publicación terminada y verificada**, con autorización expresa del usuario. Interfaz: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/ ; supervisión: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/supervision.html . Candidato exacto de Fases 23/23.1; no se incorporan cambios acumulados de develop.

## Referencias y conservación

- Commit funcional de fuentes: `8fbca8e80adaf99adc99089c362766beb80de82d`.
- Commit Pages: `062343707cdfc54a764ca7ae18f98fd5aedfe750`.
- Build público: `23.0-3c1018ebaed68c92`; versión 23.0, 44 archivos públicos.
- Main anterior: `6003a72abae880f225669d0a4d4cf27b97093fd2`; Pages anterior: `3aed91f329ed00b672b16ae6002a41e9acf68001`.
- Respaldos remotos: `respaldo/antes-fase23-main-20261031` y `respaldo/antes-fase23-pages-20261031`, apuntando respectivamente a esas referencias anteriores. Push atómico, sin force.
- Ruleset anterior: `projects/registro-defensivo/rulesets/901339e9-c122-463f-98e2-a5a02d34439a`; fuentes previas exactamente iguales a la base revisada y preservadas antes de publicar.
- Ruleset activo nuevo: `projects/registro-defensivo/rulesets/f8b43ea9-7556-4ca3-9f76-96fbefec5734`.
- SHA-256 de reglas activas: `e9f7a85f0dc5dcac07decdd7005f8ac9ddeb78991f47719ab16d50bd6d9a515d`.

Recibos privados en `.test-artifacts/firebase/fase23-2/`, dentro de esta copia: preflight, previous-rules, rules-deployment, owner-check, package, push, public-verification, acl-created, acl-revoked y live-validation. Contienen referencias y resultados, nunca credenciales. El commit posterior de cierre documental queda identificado en package.json privado; no cambia Pages ni sus hashes. El manifiesto público completo con SHA-256 se conserva en `.test-artifacts/firebase/fase23-1/revision.json`.

El workspace original continúa en develop, mismo HEAD, índice y 368 rutas conservadas por SHA-256. Solo esta copia aislada contiene los commits. No se hace reset, limpieza o cambio de rama en el original. Reglas/IAM/servidor se han usado únicamente con los alcances autorizados; no se modifican Authentication, proveedor Google, dominios, Hosting o índices.

## Verificaciones ejecutadas

Preflight del 31 de octubre: Pages aún en 22.0 y 39 hashes correctos, main previsto y reglas activas exactamente iguales a la base revisada. Se conservaron las fuentes y referencia de release anteriores. Reglas nuevas publicadas antes de la interfaz y comprobadas contra su fuente/hash.

Cuenta de pruebas existente `K7mMAmwEbxbYkkXnFdfZmxPppe22`: mantiene lectura y escritura sobre el equipo ficticio `prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778`. Se añadió un tiro ficticio nuevo al partido previamente verificado y se confirmó su Deshacer mediante lápida, sin borrado físico ni alteración de sus tiros originales. Transporte de aplicación idéntico al de 22.0; lectura del otro equipo ficticio denegada antes de asignar supervisión. La prueba exacta del cliente 22.0 en Emulator ya quedó acreditada en Fase 23.1; no se repiten baterías extensas.

Pages: build built en el commit esperado, 44 hashes HTTPS exactos y 13 rutas internas con 404. Chromium con perfiles efímeros verifica Google listo, Registro en dos pulsaciones, Dashboard local y conservación tras recargar; cero peticiones Firestore desde el perfil local. Prueba de supervisión sobre la página HTTPS publicada sin modificar módulos de aplicación: sesión Google de la cuenta exclusiva, selección y Dashboard correctos; cero errores JavaScript y CSP. No equivale a prueba física Safari/iPad.

## Única asignación ficticia y revocación

- Supervisor de prueba: `K7mMAmwEbxbYkkXnFdfZmxPppe22`.
- Equipo: `prueba8b2-seguridad-9941b41c-9837-419c-8385-3407bd4f897f` (PRUEBA 8B.2 SEGURIDAD).
- Propietario verificado del equipo: `GqT27kFnNEPO1zD4ni5uWygDJu82`.
- Ruta única: `supervision/K7mMAmwEbxbYkkXnFdfZmxPppe22/teams/prueba8b2-seguridad-9941b41c-9837-419c-8385-3407bd4f897f`.
- Campos: schemaVersion número 1, role texto reader, status inicialmente active y **finalmente revoked**.

El equipo existente coincide con el fixture histórico y contiene únicamente los dos partidos ficticios documentados. El permiso se creó solo si no existía previamente, verificando propietario y precondiciones. No se concedió acceso a equipos reales o globales.

La web mostró únicamente esa asignación, permitió abrir el partido ficticio y no incluyó controles de escritura. Una creación válida de partido intentada con SDK cliente y esa misma sesión fue denegada con permission-denied. Se revocó solo status; la interfaz retiró el Dashboard y vació su contenido. Una lectura nueva del servidor quedó denegada con la misma sesión y la recarga mantuvo el equipo inaccesible. La ACL se conserva como revoked; no se ha borrado. Ningún equipo o partido ficticio se eliminó.

Revocar acceso en servidor no elimina retrospectivamente información que ya se descargó o capturó. Puede permanecer temporalmente en memoria de sesión; la prueba no confunde este límite con una nueva lectura autorizada.

## Comprobación personal breve en iPad

1. Con conexión, recargar la dirección habitual y comprobar entrada, Registro y Dashboard. Para un ensayo de registro, usar exclusivamente un equipo de pruebas, no introducir tiros ficticios en equipos reales.
2. Abrir Supervisión. Con la cuenta de prueba anterior debe aparecer **sin equipos asignados**, porque su permiso ya está revocado. Revisar vertical/horizontal y vuelta al Registro.
3. No esperar que el Dashboard supervisado siga disponible tras la revocación. Repetir esa parte físicamente requeriría una reactivación temporal expresamente autorizada; no se ha dejado un permiso activo para ello.

## Asignación posterior de tu cuenta real

Todavía no se ha concedido permiso sobre ningún equipo real. En Firebase Console, proyecto registro-defensivo, Authentication → Users: localizar tu cuenta Google y copiar su UID exacto. Obtener teamId exacto y comprobar ownerUid contra el propietario esperado. Solo entonces, con autorización administrativa para ese equipo, crear `supervision/{UID}/teams/{teamId}` con schemaVersion 1 (number), role reader (string), status active (string). No cambiar miembros, ownerUid ni perfil. Revocar cambiando status a revoked; no es necesario renovar tokens ni cambiar el correo. Procedimiento detallado y límites en FASE23_1_REVISION_PUBLICACION.md.

## Reversión y pendientes

Si hubiera una incidencia, conservar datos/colas y evidencia. Restaurar la interfaz exacta 22.0 desde su respaldo cuando corresponda, retirando las cinco rutas nuevas; si es necesario, restaurar las reglas previas verificadas para cerrar también el acceso de servidor. No basta ocultar enlaces. No borrar IndexedDB ni documentos deportivos para revertir código. Revisar cambios posteriores antes de reemplazar reglas o ramas; no usar force push.

Sin incidencias graves que requieran reversión en esta publicación. Pendientes: comprobación física del iPad, asignaciones reales autorizadas y cualquier recuperación de partidos/respaldos/editor/MOP de otra fase. Consulta deportiva puntual, no directo continuo. Coste incremental de ACL y lecturas/escrituras Firestore, sin servidores o dependencias nuevos. El preview anterior 22.1 ha caducado; no se renueva ni se retiran sus dominios de Auth en esta fase. **Detenido para revisión final; no se inicia otra fase.**
