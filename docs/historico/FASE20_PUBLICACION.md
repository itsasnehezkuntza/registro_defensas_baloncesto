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

Comprobaciones previas correctas: 40 grupos de sincronización en emuladores, 85 comprobaciones de reglas, diez archivos Node, regresiones locales 2/3/5/6/10 con siete tamaños/subruta/CSV, seis grupos CSP, seis de arranque/inicio y cursor estable en Chromium/WebKit. La actualización simulada desde los archivos exactos de Pages 8C.0 a 20.0 conserva partido, selección e históricos en ambos motores; Deshacer y editor/recarga correctos.

La primera ejecución de Sync detectó una comparación prematura del estado de A mientras aún recibía un tiro de B. Se corrigió únicamente la preparación de esa prueba: esperar la convergencia antes de tomar la referencia de un aborto local. La batería completa posterior de 40 grupos pasó. No se cambió el runtime para ocultar el resultado.

Solo contextos efímeros y datos ficticios para las comprobaciones. La prueba física previa del usuario cubre interfaz, sesión y persistencia local en iPad nuevo; el enlace temporal tenía Sync OFF y no acredita la sincronización física del protocolo de paneles nuevo.

Recibos y candidato en `.test-artifacts/firebase/fase20/`. Build de Pages, hashes HTTPS, configuración/reglas y funcionamiento del candidato comprobados.

## Publicación ejecutada

- Fuentes 20.0: `86cf6177e380e6100b274d3c07c031ffc1bf6083`, main, con código/documentación y herramientas/pruebas de desarrollo; ninguna de estas últimas se sirve en Pages.
- Pages: `647aeb55d8738e04dbb785e9ca652bcb64529cd0`, 38 archivos de aplicación más `version.json`. Mismo origen y configuración gh-pages/root, sin cambiar el almacenamiento de los usuarios.
- Respaldos remotos: `respaldo/antes-fase20-main-20261021` → `d98bee549303a179e642d60e4a7986e1ef1b267d`; `respaldo/antes-fase20-pages-20261021` → `2c49c4b8dce67de82e8d76682f760d88ce6c0d30`.
- Reglas publicadas el 21 de octubre a las 20:48:08 UTC / 22:48:08 de Madrid: `projects/registro-defensivo/rulesets/901339e9-c122-463f-98e2-a5a02d34439a`. SHA-256 `6e5a973736ecd4c99656698c5ba9a909619bde95c6eaf3e0b18c58fd6e78d9ba`. Compilación remota y contenido verificados; ruleset anterior y copia local conservados.
- Push atómico de main y Pages tras las reglas. La primera llamada a Git desde el contexto elevado se detuvo por la propiedad de la copia aislada; se resolvió indicando `safe.directory` exclusivamente en ese comando, sin cambiar configuración global.
- Authentication y Hosting conservados; sin leer/escribir partidos reales, sin borrar colas ni originales. Rama develop y sus cambios locales conservados.

39 hashes HTTPS y versión pública contrastados; diez rutas internas devuelven 404. Pages `built` en el commit esperado; reglas activas y contenido contrastados, dominios de Auth y Hosting intactos. Chromium en la URL pública verifica 20.0, Google listo con SDK oficial, inicio excluyente, escritura pausada/cursor/nombre guardado, doble toque, recarga y estadísticas; sin errores, violaciones CSP o solicitudes Firestore. WebKit HTTPS limitado por la cadena TLS del entorno, sin ignorar certificados. WebKit local y actualización 8C→20 correctos. Recibos `deployed-verification.json` y `remote-verification.json`.

**Publicación técnica terminada y detenida para revisión del usuario.** No se inicia otra fase. Un commit posterior solo consolida esta documentación y las herramientas de publicación; no modifica el paquete público ni sus hashes.

## Comprobación física después de actualizar

Recargar la URL habitual en todos los dispositivos. Para comprobar el protocolo nuevo entre dispositivos, usar un partido ficticio y la cuenta exclusiva de pruebas: mismo equipo y partido en ambos; registrar y Deshacer en uno, esperar «Sincronizado» y comprobar recepción sin recargar en el otro. Probar el panel en otro partido ficticio sin tiros. Conservar cualquier cola o aviso; no usar datos reales para probar ni repetir registros para compensar. Esta prueba física queda pendiente y no se presenta como ejecutada por la automatización.
