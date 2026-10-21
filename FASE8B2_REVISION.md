# Fase 8B.2 — Parpadeo, seguridad y preparación de Safari/iPad

17 de octubre de 2026. Trabajo local para revisión; **ningún Hosting desplegado**, reglas sin modificar y sincronización de GitHub Pages desactivada. Pruebas reales limitadas a documentos ficticios nuevos de seguridad. Procedimiento de iPad en [PRUEBA_SAFARI_IPAD.md](PRUEBA_SAFARI_IPAD.md).

## Diagnóstico y corrección del parpadeo

Se reproduce con la aplicación e IndexedDB reales, Auth desactivado y transporte ficticio: tres ciclos del motor con la misma respuesta remota. A 1024×768 y 390×844 se observan **252 retiradas de botones del DOM, tres transiciones de Guardando y 303 altas transitorias del atributo disabled**. Son medidas de mutaciones, no 303 pulsaciones ni errores de guardado. El botón seleccionado se desconecta y pierde el foco.

Secuencia identificada: consulta del motor → `mergeRemote` notifica siempre, aunque nada cambie → `refreshState` trata la lectura como escritura → Guardando/busy deshabilitan controles → `applyState` reconstruye Registro y borra selección → otra reconstrucción restaura selección. También se propaga el aviso entre pestañas. Los estados de nube cambian durante consultas reales; son distintos de esta reconstrucción innecesaria.

Componentes afectados: botones de acciones/defensas, selección, foco, indicador local y selector de partido. Una pulsación puede perderse si el objetivo se reemplaza o deshabilita entre pointerdown y click. La lectura también puede hacer interpretar que hay una escritura local en curso.

Corrección:

- `mergeRemote` notifica solo cambios visibles confirmados en su transacción; conserva altas, conflictos y lápidas, sin cambiar el esquema ni IDs.
- Las lecturas se serializan con las escrituras sin marcar Guardando ni bloquear controles. Un estado idéntico no se vuelve a aplicar. Un fallo de lectura sigue mostrando error; una lectura correcta no oculta un error local previo.
- Una actualización remota de contadores con la misma configuración conserva los botones existentes, su selección y foco. Si cambia realmente la estructura se usa el render normal.
- El selector conserva sus opciones cuando no cambian. Los commits locales, incluido el asistente, notifican directamente; ya no dependen de que una consulta remota sin cambios fuerce un refresco.
- No se retrasa ni oculta Sincronizando/Error de sincronización y no se adelanta Sincronizado. No se cambia la ubicación de esos estados en esta fase.

Después: **cero retiradas de botones, cero transiciones falsas de Guardando, cero deshabilitaciones** en los tres ciclos idénticos; foco y botón conservados en ambos tamaños. Se prueba además una llegada remota entre acción y resultado: selección conservada y un solo registro posterior. Una caída de red muestra Error de sincronización; una escritura local fallida conserva Error al guardar pese a lecturas/sincronización correctas. Ninguna petición a Google en esta reproducción.

Evidencia: `.test-artifacts/firebase/fase8b2/flicker-before.json` y `flicker-after.json`. Es una reproducción de escritorio del mecanismo, pendiente de confirmar visualmente en Safari físico. La regresión detectó primero que el asistente no se refrescaba al suprimir avisos remotos vacíos; se corrigió su notificación local y la suite completa pasó después.

## Reglas y comprobación adicional

La propietaria pegó una copia actual de las reglas publicadas. Coincide exactamente al normalizar BOM/saltos/extremos con `firestore.rules`:

`8762a6a3c3e480dee45beed647e14088b4d9a3758e837eb4c921ca466ca07418`

No hay sesión administrativa de Firebase CLI; esta es evidencia de la copia actual facilitada por la propietaria, no una lectura administrativa del ruleset remoto. No se ha cambiado ni publicado ninguna regla.

La nueva matriz usa el mismo módulo `security-checks.mjs` con SDK cliente en Emulator y en el control real, sin Admin SDK ni credenciales administrativas. La página real es independiente de la aplicación y no abre IndexedDB deportivo. Cada denegación solo pasa si el código es exactamente `permission-denied`; red/no encontrado no cuentan como éxito. Ante una decisión inesperada se detiene sin forzar permisos ni limpiar datos.

Equipo nuevo reservado y creado exclusivamente para esta revisión:

`PRUEBA 8B.2 SEGURIDAD` — `prueba8b2-seguridad-9941b41c-9837-419c-8385-3407bd4f897f`.

| Caso real | Estado |
| --- | --- |
| Propietaria | 14 resultados esperados: seis permitidos y ocho denegados; informe recibido y confirmación manual. |
| Sin sesión | Tres lecturas denegadas con `permission-denied`; informe recibido y confirmación manual. |
| Segunda cuenta propia | Ocho operaciones denegadas con `permission-denied`; cuenta distinta de la propietaria, informe recibido y confirmación manual. |

**25/25 resultados reales esperados: seis operaciones permitidas y 19 denegadas.** Las tres ejecuciones terminaron sin inconsistencias. Son pruebas reales mediante SDK cliente en el proyecto `registro-defensivo`, distintas de la matriz ejecutada en Emulator. No constituyen una demostración exhaustiva de todas las combinaciones posibles de reglas.

Los casos cubren creación atómica equipo/miembro, histórico ficticio conservado, inmutabilidad de eventos, borrado físico de evento denegado, escalada de rol, modificación de equipo, alta tardía tras Deshacer, partido eliminado irreversible y escritura bajo él, campos extra, lectura privada sin sesión/ajena, autoinclusión y escrituras/borrado lógico por cuenta externa. Los intentos de modificación se dirigen solo al fixture nuevo; no se intenta borrar las lápidas conservadas de 8B.1 ni ningún dato real.

Permanecen las seis creaciones previstas del caso propietario: equipo, miembro, partido vivo, evento histórico ficticio, lápida nueva de Deshacer y otro partido creado como eliminado. Los intentos denegados no deben crear registros. Sin limpieza física. Informes mínimos y copia de reglas en `.test-artifacts/firebase/fase8b2/`; sin tokens, correos ni UID en claro.

El servidor local de seguridad quedó detenido al terminar y se comprobó que `localhost:4197` ya no responde. No hay tareas automáticas de escritura pendientes. Se verificaron también rutas privadas no servidas, rechazo de informes con campos imprevistos y de POST desde otro origen. Resumen verificable en `closure-checks.json`: 25 decisiones esperadas, reglas coincidentes y los 35 archivos del paquete revisados por hash, Sync OFF y copias de los tres módulos corregidos idénticas a sus fuentes.

## Comprobaciones locales

- Nueve suites Node deportivas correctas; registro/estadísticas/configuración/CSV históricos conservados.
- 54 comprobaciones de reglas en Emulator correctas.
- 25 comprobaciones SDK adicionales en Emulator correctas (14 propietaria, tres sin sesión, ocho externa).
- 20 grupos de sincronización en Emulator correctos tras la corrección, incluido asistente, Deshacer, respuesta perdida/idempotencia, borrado tardío, aislamiento y concurrencia.
- Reproducción antes/después del parpadeo en dos tamaños, sin OAuth/Firestore real.
- Siete pruebas del coordinador manual correctas, separadas de reglas reales.
- Dos pruebas de empaquetado/arranque de preview correctas: lista de archivos, dependencias, banderas por origen, pausa duradera y rechazo de Pages/bases anteriores sin borrar nada. HTTPS y Auth están simulados en esas pruebas; no es una prueba Safari ni un despliegue.
- Bandera OFF: raíz/subruta Pages, registro/recarga, esquema v1 en perfil nuevo y cero Firestore, correctos.

## Archivos de esta revisión

- Corrección: `app.js`, `js/sync-storage.js`, `js/registro-vista.js`.
- Seguridad/pruebas: `tools/firebase/security-checks.mjs`, `security-8b2.html`, `security-8b2.mjs`, `security-8b2-server.mjs`, `review8b2.test.mjs`, `sync-flicker.test.mjs`; modo adicional en `tools/firebase/emuladores.mjs`.
- Preview: `firebase.preview.json`, `tools/firebase/ipad-preview-plan.json`, `ipad-preview.mjs`, `ipad-preview.test.mjs` y scripts en `package.json`.
- Documentación: este informe, `PRUEBA_SAFARI_IPAD.md` y apartado 53 de `ESPECIFICACION.md`.

El árbol compartido contiene además cambios de fases anteriores y del diseño V4; esta lista delimita 8B.2 y no atribuye a esta fase todos los cambios pendientes de Git. `firestore.rules` no se modificó durante esta revisión: sus diferencias frente a Git son anteriores y la copia publicada coincidente se conserva como evidencia.

## Propuesta exacta de HTTPS

Canal **`ipad-8b2`**, sitio/proyecto **`registro-defensivo`**, caducidad **24 horas**. URL con formato `https://registro-defensivo--ipad-8b2-<hash>.web.app`; el hash real solo se conocerá al crear/desplegar el canal. No se modifica el canal live ni GitHub Pages. La existencia/configuración del sitio Hosting debe comprobarse al tener sesión CLI; no se ha creado un sitio ni canal ahora.

Las URLs de preview son públicas y usan los recursos reales del proyecto; el canal separa el frontend, no crea otra base Firestore. Se limita por eso a un equipo de prueba y a sus reglas. [Documentación de Firebase Hosting](https://firebase.google.com/docs/hosting/test-preview-deploy).

Configuración preparada:

- `firebase.preview.json`: solo Hosting; no incluye sección de reglas, Functions ni rewrites. Publica únicamente `.test-artifacts/firebase/ipad-preview/public`.
- `ipad-preview.mjs`: copia una lista explícita de HTML/CSS/JS/CSV/fuentes y sus licencias. No copia documentación, pruebas, herramientas, `.git`, `.env`, cuentas de servicio, logs, mapas o informes. Rechaza enlaces simbólicos y archivos imprevistos, conservándolos para revisión.
- Manifiesto con tamaños/hashes fuera de public. La raíz del repositorio nunca es el directorio a publicar.
- Banderas desactivadas por defecto. Solo `--enable-sync` activa la copia generada y únicamente en el hostname HTTPS del canal previsto. Pages, canal live y otros hosts quedan excluidos también en runtime. El archivo fuente `js/sync-config.js` sigue false/false/false.
- Equipo iPad reservado, aún **no creado**: **PRUEBA 8B.2 IPAD**, ID `prueba8b2-ipad-3cb38b2d-e00c-4597-bdd6-133f01202778`. La cuenta es la propietaria de las pruebas 8B.1; la copia verifica su huella antes de habilitar el transporte. Una cuenta Google dedicada distinta necesitaría actualizar/revisar esa configuración, sin crear cuentas automáticamente.
- El transporte solo lista/verifica/envía/recibe ese equipo. No se importa histórico. La prevención cliente evita errores de destino; la autorización efectiva sigue en Firestore Rules.
- Preflight antes de app/Auth: origen de preview, marca de prueba e inventario de bases vacío en el primer acceso. Si encuentra datos previos sin marca o Safari no permite verificarlo, se detiene sin abrir/borrar bases. El dominio nuevo evita usar el almacenamiento de Pages/Safari habitual.
- Botón de prueba dentro de «⋯» para simular corte del transporte; persiste al recargar, sin fingir pérdida total de Internet ni ocultar el estado pendiente/error.

Preparación local ya ejecutada, sin desplegar:

```powershell
& "C:\Program Files\nodejs\node.exe" tools/firebase/ipad-preview.mjs
```

### Acciones futuras, solo después de autorización

Autenticar Firebase CLI con la cuenta autorizada; comprobar el sitio `registro-defensivo` mediante `hosting:sites:list --project registro-defensivo`. Si no existe, revisar su creación antes de continuar. Rehacer el paquete final, revisar manifiesto y ejecutar exclusivamente:

```powershell
& "C:\Program Files\nodejs\node.exe" tools/firebase/ipad-preview.mjs --enable-sync
& "C:\Program Files\nodejs\node.exe" node_modules/firebase-tools/lib/bin/firebase.js hosting:channel:deploy ipad-8b2 --project registro-defensivo --config firebase.preview.json --expires 24h --no-authorized-domains
```

No ejecutar `firebase deploy`, despliegue de reglas ni clonación a live. `--no-authorized-domains` evita que el CLI cambie automáticamente Authentication. Una vez devuelta la URL, añadir únicamente su hostname exacto, sin protocolo/ruta, a Authentication → Configuración → Dominios autorizados; verificar Google habilitado y conservar los dominios existentes. Registrar el hostname añadido para retirarlo al terminar. SDK/CLI permanecen en las versiones fijadas del proyecto.

Se mantiene **signInWithPopup**, invocado directamente desde el gesto del usuario, y el authDomain actual `registro-defensivo.firebaseapp.com`. No se introduce signInWithRedirect: depende de resolver el almacenamiento entre orígenes en Safari. Si el popup falla se registra el error y se revisa; no se pide desactivar las protecciones de seguimiento ni se improvisa redirect. [Buenas prácticas oficiales para redirect](https://firebase.google.com/docs/auth/web/redirect-best-practices).

Después de autorizar el preview se preparará el partido IPAD-8B2 / Rival ficticio en el ordenador, en el equipo reservado. El iPad lo recuperará desde ese mismo enlace. No se usa el equipo de seguridad ni se alteran fixtures de 8B.1.

### Retirar el entorno

Finalizar/confirmar pendientes, cerrar sesión y cerrar las páginas de preview. Después, con autorización de retirada, borrar **solo el canal temporal**:

```powershell
& "C:\Program Files\nodejs\node.exe" node_modules/firebase-tools/lib/bin/firebase.js hosting:channel:delete ipad-8b2 --site registro-defensivo --project registro-defensivo --config firebase.preview.json
```

Comprobar que el enlace queda inactivo y el canal ya no aparece. Revisar/retirar solo su hostname de Authentication si permanece; nunca los dominios del proyecto o Pages. La caducidad también desactiva la URL; los recursos del canal se programan para retirada, sin implicar borrado Firestore. [Gestión de canales y caducidad](https://firebase.google.com/docs/hosting/manage-hosting-resources).

No borrar equipos, eventos ni lápidas como parte de retirar Hosting. Tampoco borrar Safari. Volver a generar el paquete con banderas OFF; las copias ya abiertas requieren cerrarse para detener sus trabajadores.

## Autorización que falta

Se necesita permiso explícito para **publicar el paquete revisado en el canal temporal `ipad-8b2`, por 24 horas**, habilitar solo allí Auth/Sync real, añadir su dominio exacto a Authentication y preparar/usar exclusivamente el equipo y partido ficticios de iPad. Si Hosting aún no tiene el sitio previsto, su creación debe incluirse en la revisión. La retirada del canal/dominio se delimitará al mismo entorno. Esa autorización no incluye reglas nuevas, producción, GitHub Pages, migraciones, commit o push.

No se ha ejecutado ninguno de los comandos de despliegue/retirada ni cambiado dominios. Safari/iPad y HTTPS real siguen pendientes. Detenerse para revisión.
