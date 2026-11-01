# Fases 17A–17B — prueba física en Safari/iPad

**Última corrección:** mismo enlace y caducidad, build `19-79f88c07bb7931b7` para conservar el cursor al escribir nombres. Datos previos conservados; véase [FASE19_CURSOR_EDITOR.md](FASE19_CURSOR_EDITOR.md). Los builds 17 y 18 siguientes son históricos.

Fecha: 20 de octubre de 2026. **Candidato publicado con autorización y verificado; Fase 17B terminada, prueba física pendiente del usuario.** Preparación tras «Siguiente paso» y autorización expresa «Sí» al enlace de 24h y su único dominio. Respaldo de preparación `.local-backups/fase17-ipad-20261020/` y previo a publicación `.local-backups/fase17b-publicacion-20261020/`. La preparación histórica y su límite de permiso se conservan al final.

**Enlace actual:** https://registro-defensivo--ipad17-ot4rlj0m.web.app. Caduca el **21 de octubre de 2026 a las 22:22:43 de Madrid** (20:22:43 UTC). Google disponible; sincronización desactivada. No es la aplicación habitual de GitHub Pages.

**Actualización correctiva Fase 18:** el mismo enlace sirve ahora el build `18-eda58c0c0461ab73`, con inicio/Registro excluyentes y cargas acotadas; conserva los datos y la caducidad. El usuario confirma Google en un iPad nuevo; el antiguo queda sin compatibilidad confirmada. Véase [FASE18_INICIO_IPAD.md](FASE18_INICIO_IPAD.md). Los datos de build/publicación 17 siguientes son históricos.

## Candidato revisable

Build `17-ff347879fc8976cc`, 39 archivos. Carpeta `.test-artifacts/firebase/fase17/candidate/public/`, manifiesto con hashes en `candidate/manifest.json`, configuración Hosting en `candidate/firebase.preview.json` y recibo de pruebas en `verificacion.json`. Herramientas reproducibles: `tools/firebase/prepare17-ipad.mjs` y `tools/firebase/preview17.test.mjs`.

Se ha publicado exclusivamente en un canal HTTPS nuevo `ipad17` del sitio `registro-defensivo`, con caducidad de 24 horas desde su creación. Se ha añadido únicamente su hostname verificado a Authentication; los cuatro dominios previos permanecen idénticos. No se reutiliza ni se vuelve a autorizar el antiguo dominio `ipad-8b2`. El canal no es GitHub Pages ni Hosting live.

La copia usa las fuentes locales actuales y conserva la CSP de producción. Añade una guarda de origen HTTPS, identificación de build y comprobación de IndexedDB antes de cargar aplicación/cuenta. Si encuentra bases previas sin la marca de esta prueba, se detiene sin abrirlas ni borrarlas. No se cargan herramientas, pruebas, credenciales o documentación interna en el sitio.

**Google disponible; sincronización desactivada en toda la copia.** Se sustituye `sync-config.js` por banderas inmutables OFF y el adaptador Firestore por funciones que rechazan cualquier intento de crear transporte. Los partidos se guardan solo en el navegador de ese dominio. No se importan partidos ni se usan datos deportivos reales. El inicio de Google lo realiza el usuario, únicamente con su cuenta exclusiva de pruebas, sin enviar contraseñas o códigos al agente.

## Qué permite cerrar esta prueba

Interfaz táctil, orientación, pantalla de inicio, popup Google con un toque, recuperación/cierre de sesión, edición del panel, registro local, conservación tras recargar, estadísticas, CSV y aviso de errores en el iPad real.

**No verifica sincronización ni recuperación del panel desde la nube.** M6 necesita el nuevo protocolo de reglas. Publicarlo ahora en el proyecto habitual afectaría a los clientes antiguos, como explica Fase 14. La prueba entre dispositivos queda para una actualización coordinada autorizada, o para un entorno Firebase aparte que se configure y autorice expresamente. Esta preparación no crea ese entorno ni cambia reglas.

La sincronización ya pasó 40 grupos de emulador; las seis comprobaciones de este candidato usan Google desactivado mediante configuración de pruebas para ejercitar exclusivamente el funcionamiento local y las guardas. No se presentan como prueba del popup en el iPad. El smoke real de Google de Fase 15 sigue siendo evidencia separada, en escritorio.

## Recorrido físico previsto, todavía sin ejecutar

Primero anotar modelo de iPad, versión de iPadOS y si se abre Safari normal o la app añadida a inicio. Usar únicamente el enlace actual indicado al principio y la cuenta exclusiva de pruebas.

1. Abrir la URL nueva en Safari. Debe identificarse como «PRUEBA iPad 17». Si aparece un aviso de datos previos, detenerse sin borrar nada. No abrir el antiguo enlace.
2. Comprobar la pantalla de inicio en vertical y horizontal: sin recortes, solapamientos ni desplazamiento horizontal; botones cómodos.
3. Pulsar Google una vez y completar manualmente el acceso con la cuenta exclusiva de pruebas. Anotar bloqueo de popup o errores. Recargar y comprobar que se recupera la sesión. La sincronización debe seguir desactivada y no deben aparecer partidos de la nube.
4. Crear un único partido ficticio, jornada `IPAD17` y rival `Ficticio`. Antes de registrar tiros, renombrar una acción como `Panel iPad17` y guardar. Recargar: nombre, partido y selección activa recuperados.
5. Registrar un fallo de dos puntos y un acierto de dos puntos, cada uno con acción y resultado. Deben aparecer dos intentos, un acierto y dos puntos concedidos. Revisar Estadísticas y volver a Registro. Probar un doble toque rápido de resultado: debe añadir solo un tiro. Anotar el recuento para comprobarlo después.
6. Con la página ya cargada, desconectar Wi-Fi/datos, registrar un tiro ficticio y volver a conectar. Debe permanecer al recargar con conexión recuperada. No se promete recargar/arrancar toda la página sin red: no hay service worker.
7. Exportar el CSV y comprobar que Safari permite guardarlo. Deshacer una vez, recargar y comprobar el recuento esperado. Cambiar de pestaña, volver, cerrar y reabrir; anotar si recupera sesión y partido. La prueba corta no garantiza persistencia durante días.
8. Exportar antes de cerrar sesión. Cerrar Google y elegir «Continuar sin cuenta»: en esta copia con Sync OFF el partido se guarda en el ámbito local y debe conservarse. Este paso prueba la salida de Google, no la purga de copias/cola de una cuenta sincronizada ni el diálogo «Esperar/Salir igualmente», que requieren otra prueba con Sync activo. No borrar otros datos del dispositivo.

Registrar por paso «correcto», «falló» o «no probado», mensaje exacto y recuento de tiros. Si se observa pérdida, duplicado, datos ajenos o un error inesperado, detener el recorrido y conservar el estado. La caducidad del canal no es una copia de seguridad ni una prueba de persistencia del navegador.

## Verificación local completada

Seis grupos correctos: Chromium y WebKit × uso local, datos previos y origen incorrecto. Edición del panel, doble toque, recarga, CSV con BOM, estadísticas y estado Solo local correctos. Las guardas impiden cargar la aplicación ante datos previos/origen incorrecto y conservan la semilla ficticia. Política CSP idéntica a producción; sin violaciones en uso normal, solicitudes externas, Firestore o escrituras reales. Hashes, lista de 39 archivos y dependencias relativas completos.

## Autorización de la preparación, después concedida

El siguiente paso requiere publicar este candidato exacto en `ipad17` durante 24 horas y añadir únicamente su dominio a Authentication. La instrucción de `AGENTS.md` es: «No publicar, desplegar ni hacer push sin autorización correspondiente». Por ello esta preparación se detiene con candidato y alcance listos para aprobación. No incluye reglas nuevas, publicación live/Pages, commit/push, importaciones o escrituras Firestore.

El usuario concede esa autorización con «Sí». `publish17-ipad.mjs` comprueba candidato/build/hashes, seis grupos locales, canal inexistente y estado anterior de reglas/Hosting/Auth antes de crear el canal de 24 horas. No usa la limpieza automática de dominios de la CLI. Se revisan los hashes comprimidos del inventario remoto antes de liberar únicamente `ipad17`. El archivo `.nojekyll`, presente entre los 39 archivos del paquete, queda excluido por la configuración Hosting: se publican 38 archivos de aplicación y dos recursos estándar que genera Firebase.

Recibos administrativos en `.test-artifacts/firebase/fase17/`: `preflight.json`, `created-channel.json`, `uploaded-review.json`, `deployment.json`. Versión Hosting `ef0aeab1a8e6c8db`; caducidad sin renovar. Hosting live sin release antes y después; referencia de reglas conservada `projects/registro-defensivo/rulesets/4bc70f67-e0ed-4fb0-b46e-7c2494eab227`. No hay commit/push, publicación Pages, reglas nuevas ni acceso a documentos deportivos.

La caducidad del canal no garantiza que Authentication retire automáticamente su dominio: al terminar la prueba/caducar queda pendiente revisar y retirar únicamente este hostname. No se renueva el enlace por esta publicación.

## Verificación de la publicación

`verify17-live.mjs` confirma los 38 hashes de aplicación por HTTPS y las cabeceras `no-store`, `nosniff` y `noindex`. Documentación, herramientas, pruebas, reglas y `.git/config` devuelven 404. La consulta pública independiente de Auth confirma el proyecto y la lista anterior más el único dominio nuevo.

En Chromium, sobre el HTTPS publicado: SDK oficial 12.11.0 listo, Google llega a `accounts.google.com` y la cancelación devuelve el control; sin credenciales, usuarios nuevos ni sesión autenticada. Pantalla de inicio sin desbordamiento en 820×1180, 1180×820 y 390×844; registro local, doble toque sin duplicado, recarga y estadísticas correctos, sin errores, violaciones CSP o solicitudes Firestore. Contexto efímero y tiros ficticios eliminados al cerrar el contexto.

WebKit de escritorio no acepta la cadena TLS del dominio en este entorno; no se desactiva la validación de certificados. Esto limita esa comprobación HTTPS concreta. Las seis pruebas locales Chromium/WebKit anteriores siguen correctas, pero ninguna equivale a la prueba física de Safari/iPad. Recibo `.test-artifacts/firebase/fase17/https-verification.json`, con la limitación explícita y prueba física pendiente.

Fase 17B detenida para la revisión/prueba del usuario. La aplicación habitual, las reglas y los datos deportivos reales siguen intactos; sin commit o push. No se amplía el canal ni se inicia otra publicación.
