# Fase 20 — publicación general de lo terminado

Fecha: 21 de octubre de 2026. Solicitud: «Se puede subir lo que está hecho ya para que lo vean todos los usuarios?». Se interpreta como autorización para publicar lo terminado hasta Fase 19 en la dirección habitual, manteniendo pendientes Cancelar/Deshacer el nombre, cambiar «Quitar» por «Eliminar» y MOP-001.

## Alcance

Versión 20.0: inicio/perfil y vaciado de partido; sincronización por escuchas; recuperación de sesión; aislamiento de operaciones bloqueadas; paneles por cuenta/equipo y versiones por partido; CSP; inicio independiente; tiempos de espera de Google; cursor estable al editar. Diseño, estadísticas, CSV, guardado local e históricos conservados.

Se publica en https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/, mismo origen y almacenamiento. La rama `gh-pages` contendrá exclusivamente archivos públicos y `version.json`; `main` conservará las fuentes y documentación de entrega. Se trabaja en una copia aislada sin alterar la rama de trabajo develop ni incluir perfiles, credenciales, pruebas o diagnósticos en Pages.

Las reglas de Fase 14 y el código se actualizan en la misma intervención. Los clientes antiguos pueden recibir rechazos de sincronización en partidos con panel nuevo: deben recargar la página en todos los dispositivos. Las operaciones locales pendientes permanecen conservadas para reenviarse con el cliente actualizado. No se borran ni migran manualmente datos reales. Entrar con Google no sube partidos antiguos automáticamente; la activación de Sync sigue siendo explícita.

## Respaldo y reversión

Antes de modificar referencias remotas, guardar commits anteriores de main y Pages y contenido/referencia de reglas. Crear ramas remotas de respaldo. Conservar las reglas anteriores sin eliminarlas. La reversión debe evaluarse conjuntamente para código/reglas; si ya existen paneles nuevos no basta con volver al cliente antiguo. Ante un problema, detener Sync y conservar colas/datos; no reiniciar IndexedDB ni borrar documentos para resolverlo.

No se modifica Authentication, Firebase Hosting ni el canal temporal, ni se renueva su caducidad. No se publican las mejoras pendientes del editor.

## Verificación y estado

Preparación y pruebas en curso. Solo contextos efímeros y datos ficticios para las comprobaciones. La prueba física previa del usuario cubre interfaz, sesión y persistencia local en iPad nuevo; el enlace temporal tenía Sync OFF y no acredita la sincronización física del protocolo de paneles nuevo.

Recibos y candidato en `.test-artifacts/firebase/fase20/`. No se dará la publicación por terminada hasta comprobar build de Pages, hashes HTTPS, configuración/reglas y funcionamiento del candidato.
