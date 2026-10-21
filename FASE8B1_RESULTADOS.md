# Fase 8B.1 — Resultados de la validación real

Fecha de cierre: **17 de octubre de 2026**. Prueba ficticia autorizada en Firebase `registro-defensivo`, detenida para revisión. Los casos descritos han pasado; no equivalen a aprobación de producción ni a una validación completa de Safari o de todas las reglas reales.

## Alcance y evidencia

- Sesión: `2026-10-15T22-17-01-344Z-045994f9`.
- Equipo: **PRUEBA 8B**, ID `prueba8b-07d8d701-cb78-485f-8bd3-b190fde0f5f5`.
- Origen de desarrollo: `http://localhost:4197`, servidor restringido a loopback.
- Dos perfiles normales de Chrome abiertos manualmente, con almacenamiento separado y comprobación previa de IndexedDB vacío. La etiqueta de URL A/B por sí sola no crea aislamiento. No son dos dispositivos físicos ni Safari.
- Evidencia local en `.test-artifacts/firebase/real-sync/2026-10-15T22-17-01-344Z-045994f9/`: `session.json`, `revision-agente.json`, `unauthenticated-preflight.json`, `unauthenticated-game.json`. Informes sin tokens, contraseñas, correo ni UID en claro.

La evidencia combina confirmaciones manuales de la propietaria, conjuntos de IDs y tamaños de cola leídos en sus perfiles, resultados del SDK oficial contra servidor y denegaciones REST sin sesión. No se ha usado una cuenta administrativa para inventariar documentos o leer el ruleset desplegado.

## Operaciones realizadas realmente contra Firebase

La propietaria completó Google manualmente, creó el equipo y su miembro propietario, y creó dos partidos ficticios. Registró eventos desde A/B, ejecutó Deshacer y eliminó lógicamente el primer partido mientras B tenía un evento pendiente. Los reintentos, lecturas, marcas de borrado y confirmaciones se tramitaron mediante el adaptador de sincronización real.

Se cerró sesión en B, se entró con otra cuenta Google propia y se volvió a la propietaria. Las comprobaciones de acceso consultaron exclusivamente el equipo ficticio conocido y la membresía de la cuenta conectada. No se consultaron equipos reales de terceros ni se intentó conceder permisos a la segunda cuenta.

No se importaron partidos antiguos, ejecutaron migraciones sobre bases deportivas reales ni eliminaron documentos físicamente. Tampoco se publicaron reglas o aplicación, ni se hizo commit o push en esta validación.

## Resultados reales

| Caso | Resultado y límite |
| --- | --- |
| Crear en A y recuperar en B | Mismos IDs de partido y tres eventos iniciales; Sincronizado y cola vacía. |
| Registrar desde A/B sin esperar el primer envío | Cinco IDs únicos iguales en ambos; no se pierden ni duplican las dos altas. Registro manual cercano, sin prueba de estrés simultánea garantizada. |
| Perfiles recuperados al día siguiente | Se conservan nueve IDs coincidentes. A se recuperó en un perfil nuevo al no localizar el original; esto no demuestra continuidad de la cola del A original. |
| Caída de Firestore y guardado local | B guarda un tiro y muestra diez frente a nueve en A. Guardado local correcto y una operación pendiente. |
| Recarga con pendiente | El mismo ID y el pendiente sobreviven; B no informa Sincronizado mientras falta confirmación. |
| Reconexión | Diez IDs únicos iguales, cola vacía en ambos; el tiro pendiente llega una sola vez en el conjunto observado. |
| Deshacer ya sincronizado | El mismo evento desaparece en A/B. Una acción manual adicional posterior explica volver a diez; tiene otro ID y fue confirmada por la propietaria. |
| Alta y Deshacer antes de reconectar | B pasa a once y vuelve a diez, conserva dos operaciones pendientes tras recargar; después de reconectar y recargar A/B conserva los diez anteriores, sin reaparición del tiro. |
| Eliminar con B desconectado y un tiro pendiente | A confirma el borrado; B conserva temporalmente once tiros. Al reconectar, el partido desaparece en B y no reaparece tras recargar; cola vacía. |
| Cerrar sesión con datos privados | B recibió el segundo partido y su tiro; al salir deja de mostrarlos. A los conserva. |
| Otra cuenta Google | Huella distinta, sin equipo ni datos privados. SDK devuelve `permission-denied` al leer el equipo ficticio. |
| Volver a propietaria | B recupera exactamente el segundo partido y su tiro, Sincronizado; mismo conjunto en A y cola vacía. El primer partido sigue ausente. |

No se observaron duplicados, pérdidas inesperadas ni conflictos de contenido en estos casos. Las desapariciones esperadas corresponden a Deshacer y al borrado explícito. No se ha forzado una repetición del mismo envío tras perder su acuse en Firebase real: ese caso está probado en Emulator. Tampoco se han hecho pruebas reales de carga, edición concurrente conflictiva, importación o múltiples pestañas compartiendo una base en esta sesión.

La caída simulada bloqueó solo `https://firestore.googleapis.com/*`, manteniendo DevTools abierto. Localhost siguió disponible para recargar. No prueba cargar toda la aplicación sin Internet: no hay service worker.

Los informes capturaron Pendiente, Sincronizando, Error de sincronización y Sincronizado separados del guardado local. En uso visual, Sincronizando puede pasar muy rápido y actualmente está dentro de «⋯». No se ha inspeccionado administrativamente cada timestamp remoto; la confirmación observada procede de los envíos y lecturas de servidor del motor.

## Reglas de seguridad

La copia publicada facilitada por la propietaria coincide con `firestore.rules` tras normalizar BOM, saltos y extremos. SHA-256:

`8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`

El contrato de equipo/miembro propietario, payload histórico, eventos inmutables y lápidas es compatible con el adaptador utilizado. Publicar las reglas no se tomó como validación suficiente.

Resultados reales concretos:

- REST sin token: **403 PERMISSION_DENIED**, también sobre el partido ficticio cuando ya existía.
- Propietaria: lecturas del equipo permitidas; creaciones, Deshacer y eliminación ficticios aceptados mediante el motor real.
- Segunda cuenta propia: **permission-denied**, obtenido por `verifyTeam` con `getDocFromServer`, además de la ausencia de datos en pantalla.
- Regreso de B a la propietaria: **allowed** y recuperación del partido/tiro originales.

La huella de la propietaria coincide en A y B y difiere de la segunda cuenta. El diagnóstico se comunica desde el navegador al auditor local; no es una atestación administrativa independiente.

No se ha ejecutado en Firebase real la matriz completa de creación malformada, escalada de roles, membresía ilegítima, invitado/Authentication anónimo ni cada ruta/subcolección. Las **54 comprobaciones de reglas de Emulator de la Fase 8B** son evidencia separada; no se presentan como resultados reales.

## Datos ficticios que permanecen

| Registro | Estado al cierre |
| --- | --- |
| Equipo PRUEBA 8B y miembro propietario | Conservados. No se añade a la segunda cuenta. |
| PRUEBA-8B.1 / Rival ficticio — `269e49af-bae7-4ae1-8316-5f50dfb36d58` | Eliminado lógicamente; ausente en ambas vistas. Se conservan el documento marcado como eliminado, eventos inmutables previos y lápidas que correspondan. |
| PRUEBA-8B.1-AISLAMIENTO / Rival ficticio — `ed3c53fa-b7a3-403e-ac0c-2f47f5b3c0b4` | Vivo, un tiro, visible en A/B con la propietaria. |
| Tiro `57dce4f7-7d5a-484f-8522-db3fb68b5c6b` | Mismo ID en ambos perfiles, sin pendientes. |

No se ha realizado limpieza física. El inventario de documentos conservados del partido eliminado se describe según el protocolo y sus operaciones confirmadas; no se afirma un recuento administrativo de sus subcolecciones. Los eventos pendientes que encuentran una lápida no deben tratarse como nuevas altas remotas.

## Cambios y comprobaciones de desarrollo de esta validación

- `tools/firebase/sync-real-session.mjs`, `sync-real-manual.mjs`, `sync-real-manual-browser.mjs`: servidor manual, preflight, destino fijo, reanudación conservando IDs y diagnóstico mínimo de acceso real. Importación oculta y clics de revisión/confirmación bloqueados en este entorno.
- `tools/firebase/sync-real-manual-browser.test.mjs`: **siete pruebas locales correctas**, incluidos aislamiento, conservación de bases rechazadas, arranque real diferido, reanudación, bloqueo del asistente y diagnóstico pasando por la envoltura del transporte. OAuth desactivado y SDK simulado en los casos de permisos; sin Firestore real. Los arranques del servidor solo verifican configuración pública real.
- `tools/firebase/sync-real-login.mjs` y su prueba: preparación histórica del acceso secuencial; cuatro pruebas locales. El coordinador Playwright, sus controles y pasos quedan como preparación histórica, sin automatizar el acceso Google vigente.
- `app.js`: ajuste mínimo de arranque con `document.readyState`, necesario para importar después del preflight sin quedar esperando un DOMContentLoaded ya ocurrido. No altera el registro deportivo.
- `tests/integracion.test.mjs`: DOM simulado declara el estado de carga. Las nueve suites Node y la prueba de bandera OFF en raíz/subruta Pages pasaron durante la corrección de arranque; no se presentan como pruebas reales de OAuth o reglas.
- Documentación: este informe, `FASE8B1_VALIDACION_REAL.md` como bitácora y `ESPECIFICACION.md`.

Antecedentes separados de 8B: veinte grupos de sincronización en Emulator, incluidos atomicidad, reenvío idempotente, múltiples pestañas, conflictos, importación repetida e histórico. Las comprobaciones responsive de esa fase tampoco sustituyen una prueba física actual en iPad.

Incidencias: Google bloqueó el navegador automatizado; se utilizó Chrome normal sin evadir el bloqueo. Se corrigió el arranque tardío y se reforzó el bloqueo del asistente tras observarlo visible. El aviso al abrir A en el almacenamiento B se resolvió conservando datos. El diagnóstico real llegó al navegar explícitamente a las URLs; no se demuestra la causa original de su ausencia.

## Pendientes y activación

1. **Parpadeo:** cada consulta remota puede provocar redibujado aunque no cambie contenido. Causa plausible identificada en el código; sin corrección ni reproducción visual controlada en esta fase. Evitar también interrupciones de la selección táctil antes de producción.
2. **Cabecera:** petición futura de estado/control de nube junto a Guardado, manteniendo distinta la confirmación local y la del servidor. No implementada ahora.
3. **Safari/iPad físico:** un origen HTTPS de pruebas accesible y autorizado, con almacenamiento vacío y solo datos ficticios. Revisar popup Google, bloqueo de ventanas, restauración/cierre, suspensión de Safari, cola tras recarga/reapertura, Deshacer/borrado y diseño táctil. No se ha publicado ni expuesto ese entorno; necesita autorización separada. Localhost del iPad no es el ordenador.
4. **Cobertura real adicional:** matriz ampliada de reglas, reenvío forzado tras perder acuse, dos dispositivos físicos y escala/coste de las consultas. Invitaciones y entrenadores adicionales siguen fuera de alcance.
5. **Migración:** no se ha usado con datos reales; permanece prohibida sin revisión/confirmación separada. Pruebas de importación idempotente realizadas en Emulator.

`js/sync-config.js` conserva `enabled: false`, `emulator: false`, `allowRealWrites: false`. Solo el servidor de prueba servía banderas activas a su origen. No se autoriza activación automática en producción, migración ni despliegue por superar estos casos. Para ampliar pruebas reales o publicar un entorno HTTPS se requiere revisar el alcance y obtener la autorización correspondiente.

Servidor local de pruebas detenido al cierre y sesión marcada para revisión, sin reanudación automática. Las páginas ya cargadas mantienen su código en memoria: cerrar A/B detiene sus trabajadores; no borra sus datos IndexedDB. No se pide borrar almacenamiento para terminar la prueba. Una recarga posterior sin reanudar el servidor dará un error de conexión local, no indicará pérdida de datos.
