# Supervisión vigente y administración de permisos

Disponible en la [versión pública 23.0](https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/supervision.html). Consulta de equipos asignados y Dashboard de un partido, de solo lectura. [Arquitectura](arquitectura.md) y [contrato funcional](../ESPECIFICACION.md). No se realizan asignaciones ni consultas de datos reales durante esta consolidación documental.

## Permiso por UID y equipo

Un único documento sirve como autorización y descubrimiento privado:

`supervision/{UID_SUPERVISOR}/teams/{ID_EQUIPO}`

```json
{ "schemaVersion": 1, "role": "reader", "status": "active" }
```

No duplicarlo en miembros, perfil, arrays de equipos o estadísticas. El correo ayuda a reconocer la sesión, pero no concede permisos. Las Rules permiten al usuario leer solo sus propias asignaciones y deniegan toda escritura cliente en ellas. La ACL amplía lectura por equipo; no transforma al lector en propietario. [Reglas](../firestore.rules) y [herramienta administrativa local](../tools/firebase/supervision-admin.mjs).

## Asignar desde Firebase Console

Procedimiento para una actuación administrativa futura, con autorización y cuenta IAM adecuadas:

1. Verificar el proyecto correcto. En Authentication identificar cuenta/proveedor y copiar el **UID exacto** del supervisor; no inferirlo del correo.
2. Obtener el **ID exacto del equipo** desde una referencia fiable del entrenador. Con autorización administrativa, comprobar teams/{ID_EQUIPO}, su ownerUid y la membresía propietaria esperada. No enumerar toda la base ni copiar partidos para averiguarlo.
3. Registrar privadamente quién autoriza el acceso, UID, equipo, proyecto y propietario esperado. Revisar cualquier permiso previo, en especial una revocación; no sobrescribirla a ciegas.
4. Crear únicamente el documento de permiso indicado arriba con esos tres campos y tipos. No cambiar ownerUid, miembros, perfiles, documentos deportivos ni Rules. No introducir credenciales IAM en el navegador o repositorio.
5. Entrar en Supervisión con esa cuenta, actualizar equipos y comprobar que el equipo esperado aparece. La validación funcional de datos se limita al alcance autorizado. Las pruebas de escritura denegada se realizan con datos ficticios, preferentemente en Emulator.

Puede prepararse sin red un plan con `node tools/firebase/supervision-admin.mjs asignar UID_SUPERVISOR ID_EQUIPO`. La herramienta no tiene modo de aplicación real; no sustituye la revisión administrativa de Console.

## Revocar y comprobar

Cambiar únicamente status a `revoked` en ese permiso, o eliminar solo el permiso si se ha autorizado expresamente. Conservar revoked mantiene una marca administrativa sin datos deportivos. No borrar el equipo ni miembros.

Las Rules deniegan nuevas lecturas aunque la sesión permanezca abierta. La escucha de asignaciones limpia el Dashboard al detectar el cambio; una lectura pendiente pierde validez. Recargar exige verificar de nuevo. No hace falta cambiar el correo ni esperar una renovación de Custom Claims. Ningún mecanismo retira una captura o información ya recibida legítimamente.

Para reactivar, repetir la identificación y comprobación del propietario y cambiar a active deliberadamente. Los usuarios normales no gestionan estos documentos desde la aplicación.

## Comprobación física pendiente

Con un permiso y equipo ficticios previamente autorizados: abrir Supervisión en Safari/iPad, elegir equipo y partido, revisar el Dashboard y volver a Registro sin alterar datos del entrenador. Desde administración revocar ese permiso y comprobar limpieza de la vista y denegación al recargar. Las escrituras denegadas se acreditan con SDK en Emulator, no pulsando botones inexistentes. Mantener o retirar el permiso ficticio solo según la autorización recibida.

La página no registra, edita, deshace, vacía, elimina ni exporta. No cierra Google ni purga la cola del entrenador; el cierre sigue el flujo protegido de Registro. No se puede demostrar ausencia de escrituras solo por la apariencia de la UI.

## Evidencia disponible

El [informe de implementación](historico/FASE23_SUPERVISION.md), la [revisión de seguridad](historico/FASE23_1_REVISION_PUBLICACION.md) y el [cierre de publicación](historico/FASE23_PUBLICACION.md) conservan resultados y límites. Sus candidatos y autorizaciones son históricos, no órdenes para volver a publicar. El permiso ficticio de aquella publicación fue revocado; no se deducen de él permisos reales actuales.

Reproducción segura vigente: `npm run test:emulator -- supervision23` o `npm run test:emulator -- rules`; requisitos en [DESARROLLO.md](../DESARROLLO.md). Esta fase no repite esas campañas ni toca Firebase real.
