# Fase 22.1 — Validación física previa a publicación

29 de octubre de 2026. Candidato `22.1-3cd65834dc6e9da4`, con Fases 21 y 22. Validación física confirmada globalmente por el usuario; publicación definitiva pendiente de autorización.

## Revisión previa

- Los hashes de los 365 archivos/rutas de cierre de Fase 22 y los recibos de 28 grupos de acceso, 42 de integridad y 40 de Sync se han contrastado sin repetir las baterías. Fase 21 conserva su transacción sobre games/events/settings y los rechazos HAS_EVENTS/GAME_NOT_FOUND.
- Revisado Google → equipo → motor automático; históricos solo por revisión/confirmación; cierre Esperar/Cancelar y purga transaccional con protectUnsynced. No hay cambios de código de aplicación en esta intervención.
- Respaldo íntegro del estado previo en `.local-backups/fase22-1-20261029/`: archivos, SHA-256, ausencias, estado y diff. develop y HEAD `7c439c149ad2bbe4e71749260e8b9d10f45c0d83` conservados; índice vacío.
- Paquete cerrado: 37 archivos de aplicación y version.json, sin diagnósticos, pruebas, documentación, credenciales privadas, perfiles o configuración administrativa. Firebase web config es pública. Únicas diferencias del paquete: título y meta de versión de prueba en index.html, más version.json; módulos idénticos al cierre probado.
- Importaciones locales cerradas sobre esa lista y sintaxis comprobadas. Único smoke de empaquetado: arranque en modo local, perfil efímero, sin crear partidos, cero errores y cero solicitudes externas. No sustituye Safari físico.
- Revisión remota limitada a configuración, dominios, reglas y metadatos de Hosting, sin consultar usuarios ni documentos deportivos. Google habilitado. Reglas activas coinciden con el archivo local; ruleset `901339e9-c122-463f-98e2-a5a02d34439a`. Hosting live sin release al revisar. Ninguna regla modificada.

## Candidato publicado exclusivamente en canal temporal

- Canal nuevo: `fase22-1`, proyecto/sitio `registro-defensivo`.
- URL de pruebas: https://registro-defensivo--fase22-1-bsovr4vx.web.app . Candidato `22.1-3cd65834dc6e9da4`, versión de Hosting `7746df95101a2bd6`.
- TTL solicitado: 86400 segundos. Caducidad devuelta: `2026-10-30T16:09:03.901838762Z`, **30 de octubre a las 17:09 de Madrid**. No renovada.
- Creación verificada sin cambiar dominios Auth, reglas o Hosting live; sin commit, push ni GitHub Pages.
- El dominio nuevo no figuraba en Authentication. Se comunicó el hostname exacto y se detuvo la publicación hasta recibir la respuesta expresa: «Sí, añadir solo ese dominio y continuar con el preview». Añadido únicamente `registro-defensivo--fase22-1-bsovr4vx.web.app`, conservando la lista previa y los demás campos de configuración. No se modificaron proveedores, usuarios ni sesiones.
- Publicación terminada con guardas de proyecto/sitio/canal y hashes remotos antes del release. Se contrastaron los 38 archivos propios más los 2 archivos públicos de inicialización generados por Firebase. Auth/Rules/live y caducidad se conservaron durante el despliegue. No se usó el comando CLI que puede añadir dominios automáticamente.
- Verificación posterior: 38 hashes HTTPS correctos; Cache-Control no-store y noindex; ocho rutas internas 404; Chromium efímero abre el inicio exclusivo con botón Google disponible, sin abrir popup, cero errores JavaScript/CSP y cero solicitudes Firestore. No se ha iniciado sesión ni creado equipo/partido mediante automatización. La confirmación física posterior se registra debajo.

Artefactos privados locales (fuera del public): `.test-artifacts/firebase/fase22-1/`, con scripts de preparación/publicación y `local-review.json`, `smoke-local.json`, `preflight.json`, `channel.json`, `auth-domain.json`, `uploaded-review.json`, `deployment.json`, `https-verification.json`, `https-smoke.json`, `conservacion.json` y `candidate/manifest.json`.

## Guía breve una vez publicado

Usar Safari normal y una cuenta exclusiva de pruebas; abrir **el mismo enlace temporal** en el ordenador. No usar la aplicación habitual ni equipos con datos reales.

1. Para comprobar históricos sin tocar los reales, entrar primero sin cuenta y crear aquí `LOCAL 22.1`, jornada `PRUEBA`; conservarlo. Desde perfil, entrar después con Google.
2. Crear un equipo nuevo `PRUEBA 22.1` (desde perfil si ya se seleccionó otro equipo ficticio). Si ofrece incorporar el partido local, elegir conservarlo solo aquí. Crear `SYNC 22.1`, jornada `PRUEBA`, y registrar **un** tiro. Esperar «Sincronizado», sin pulsar Activar Sync.
3. En ordenador: misma cuenta, elegir ese equipo y partido; esperar «Sincronizado». Debe haber un único partido de ese nombre y un tiro, sin aviso de pendientes. La confirmación del motor exige cola del equipo vacía y respuesta de servidor.
4. En iPad: desconectar Internet sin cerrar ni recargar la página, registrar **un** tiro más y comprobar el guardado local/pendiente. Recuperar Internet; esperar «Sincronizado» en ambos. Deben verse exactamente dos tiros. Si se intenta cerrar sesión durante el corte, cancelar el aviso: no hay salida que descarte pendientes.
5. Tras confirmar el acuse, comprobar salida al modo sin cuenta y que `LOCAL 22.1` sigue aquí. Volver a la cuenta solo si hace falta: ese histórico no debe figurar en el equipo ni subir por sí solo. Conservar todos los datos ficticios al acabar.

Si algo falla: detenerse, anotar bloque A/B/C/D, dispositivo, texto visible, número de tiros y hora; conservar captura si es posible. No repetir registros para compensar, no limpiar datos, no improvisar correcciones ni renovar el canal.

## Resultado y decisión

Revisión previa, paquete y publicación temporal: correctos. Dominio nuevo: autorizado expresamente y comprobado.

**Confirmación física del usuario, 29 de octubre de 2026:** «Acabo de hacer lo que me has pedido y funciona». Se recibe después de entregar la guía A–D y se registra como resultado global favorable de esos pasos en Safari/iPad: acceso Google, equipo y sincronización automática; recepción del partido y tiro en ordenador; guardado sin conexión y envío tras reconectar; modo local e histórico ficticio conservado sin importación automática. No se comunican fallos, pérdidas ni duplicados.

La fuente de esta evidencia es el usuario que realizó la prueba física. No es una nueva comprobación automatizada ni una lectura independiente de IndexedDB/Firestore por el agente; no se recibieron IDs, capturas o trazas. No se infieren pasos opcionales adicionales, cifras instrumentadas ni garantías de persistencia prolongada de Safari. Se conserva el recibo histórico del despliegue (que indicaba pendiente en ese momento) y se añade `physical-result.json` con esta confirmación. No se repiten registros ni se modifican datos para verificarla.

El origen temporal tiene IndexedDB distinta de GitHub Pages: no muestra ni migra los históricos del enlace habitual. La caducidad retira el acceso al canal, no es una orden de borrar datos de Firestore ni de retirar automáticamente su dominio autorizado en Authentication; conservar los ficticios y anotar el equipo. Cualquier retirada del dominio se revisará por separado, sin borrar datos. Sin service worker, no probar una recarga de la web desde cero sin conexión. Sync tampoco es una copia independiente frente a borrados sincronizados.

**Recomendación favorable a publicar juntas las Fases 21 y 22**, sustentada en las pruebas locales existentes, la verificación del paquete y la confirmación física del usuario. Detenerse para revisión: esta confirmación funcional no se interpreta como autorización de publicación definitiva. La aplicación habitual sigue en 20.0. No se realizaron commits, push, cambios de ramas/índice, reglas o datos deportivos reales por el agente. Únicos cambios del árbol de fuentes en esta fase: esta documentación nueva y la nota de ESPECIFICACION.md.
