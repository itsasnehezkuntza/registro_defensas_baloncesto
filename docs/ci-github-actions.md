# GitHub Actions básico — Fase 24.3

1 de noviembre de 2026. Base de preparación: main `02a069b7dadf75f8924545b174b2d598f9fcc38c`, aplicación pública 23.0. Se trabajó en un clon independiente y en la rama mantenimiento/fase24-3; esa base es una referencia histórica, no un HEAD permanente de main.

La preparación local y la primera ejecución real se documentan por separado. La [PR #3](https://github.com/itsasnehezkuntza/registro_defensas_baloncesto/pull/3) activó el workflow mediante pull_request; el resultado verificado se recoge más abajo. Cada actualización de una PR necesita su propia ejecución correcta.

## Estado previo y workflow

La base de preparación no contenía archivos en .github/workflows. La consulta pública GET inicial del catálogo Actions devolvió solo pages-build-deployment, activo, con ruta dinámica interna de Pages. Ese workflow y gh-pages no se modifican.

Se añade únicamente [comprobaciones-pr.yml](../.github/workflows/comprobaciones-pr.yml), con nombre Comprobaciones de PR. Los scripts existentes se conservan: npm run check analiza sintaxis, imports, referencias públicas y configuración; npm test ejecuta los once tests nativos de primer nivel más cuenta.test.mjs. No se invocan comandos administrativos o reales de Firebase.

## Alcance y permisos

- Eventos: pull_request dirigido a main y workflow_dispatch. Sin push, pull_request_target, schedule o workflow_run. Los tipos predeterminados de PR incluyen apertura, reapertura y actualización de su código. Un push sin PR no lo activa; actualizar una PR sí puede producir una nueva ejecución mediante synchronize.
- Un job, ubuntu-latest, Node.js 24 y límite de 10 minutos. Sin matriz, servicios, navegador, Java, Firebase Emulator o instaladores adicionales. PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 evita descargas de navegadores durante la instalación npm.
- Pasos: checkout, setup-node, npm ci, npm run check y npm test. Se conserva el lockfile y no se actualizan dependencias.
- Permisos del workflow: contents: read; sin permisos adicionales de escritura. Checkout con persist-credentials: false. No se introducen secretos, tokens propios, credenciales Firebase ni autenticación npm. Las acciones usan el token efímero de lectura que GitHub suministra por defecto para sus operaciones normales.
- Caché automática de setup-node desactivada explícitamente. Sin upload-artifact, publicación, commit, push o despliegue. Los logs y comprobaciones estándar de GitHub no son artefactos publicados por el workflow.
- Concurrencia agrupada por workflow y número de PR; se cancela la ejecución anterior de esa misma PR. Las ejecuciones manuales se agrupan por referencia, con respaldo cuando no hay número de PR. No se comparte grupo con Pages.

La configuración sigue la [sintaxis oficial de workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) y el [control de concurrencia](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency). No se modifican políticas de Actions, reglas de protección, secretos o permisos del repositorio.

## Referencias oficiales verificadas

| Acción | Release publicada | SHA completo fijado |
|---|---|---|
| actions/checkout | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| actions/setup-node | [v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) | `949feb2413d6458794dcd2491c4babbbce0c15c1` |

Se contrastaron releases estables, referencias de etiquetas obtenidas por la API pública y git ls-remote, y action.yml del commit exacto. Ambos commits tienen firma verificada según GitHub. Se comprobaron los inputs persist-credentials, node-version y package-manager-cache, y el runtime node24 de las acciones. Los SHAs no proceden de memoria ni de una etiqueta de versión mayor móvil. Para actualizarlos, volver a contrastar una release publicada y revisar el cambio.

## Preparación y validación local inicial

| Comprobación | Resultado |
|---|---|
| Clon y rama | Base 02a069b y mantenimiento/fase24-3, antes de crear el primer commit. |
| Instalación local desde lockfile | npm ci correcto, 779 paquetes; caché nueva y sin actualizar dependencias. |
| YAML | Parser yaml 2.9.1 ya incluido en el árbol del lockfile, YAML 1.2 estricto y claves únicas; sin errores de sintaxis. No se añadió dependencia. |
| Contrato del workflow | Solo los dos eventos previstos, una rama destino, un job y cinco pasos; permisos, tiempo, concurrencia, inputs y comandos correctos. |
| Acciones | SHAs completos contrastados con releases, etiquetas Git y action.yml oficiales; firmas verificadas según GitHub. |
| npm run check | 63 scripts y referencias correctos, salida 0. |
| npm test | 12 archivos correctos, cero fallos, salida 0. |
| Conservación | Los 43 archivos públicos, firestore.rules, package-lock.json y package.json conservan sus bytes; ningún archivo de aplicación o pruebas cambia. |
| Formato | Diff completo comprobado, incluidos los archivos nuevos, con índice temporal de revisión; el índice real estaba vacío durante esa preparación. |
| GitHub Actions durante la preparación local | Todavía no ejecutado; la evidencia remota posterior figura en la siguiente sección. |


La validación del YAML se realizó por separado: npm run check no valida el propio workflow ni el planificador de GitHub.

No se ejecutaron navegador, Java o Emulator para validar el workflow. No se ha accedido a Firebase, Authentication, permisos o datos deportivos reales. Las contribuciones de la fase utilizan la identidad Git habitual itsasnehezkuntza, sin coautorías ni atribuciones automáticas.

## Primera ejecución real verificada

La [ejecución 41337881985](https://github.com/itsasnehezkuntza/registro_defensas_baloncesto/actions/runs/41337881985), activada por pull_request para el commit `d681a14f433ce01e8d813f6534d495405b7f29e5`, terminó con estado completed y conclusión **success**. El job Sintaxis y pruebas nativas utilizó el YAML revisado y las acciones con los SHA indicados arriba.

| Paso | Resultado acreditado en los logs |
|---|---|
| Checkout | Correcto, sin persistir credenciales. |
| Node.js 24 | Correcto: v24.22.1 y npm 11.19.1. |
| npm ci | Correcto: 779 paquetes instalados. |
| npm run check | Correcto: 63 scripts y sus referencias. |
| npm test | Correcto: 12 archivos de pruebas, cero fallos. |

No se subieron artefactos ni se realizaron despliegues. GitHub probó su referencia temporal de integración de la PR; esa comprobación no fusiona main. No se utilizó workflow_dispatch. El resultado verde acredita estos comandos para ese commit; **no acredita una auditoría de vulnerabilidades** ni sustituye la revisión de seguridad.

## Comprobación de futuras PR y ejecución manual

1. Revisar los cambios y contar con autorización para publicar la rama y abrir la PR hacia main.
2. En la PR, comprobar que Comprobaciones de PR se activa y muestra el job Sintaxis y pruebas nativas, Node 24 y los tres comandos previstos. Verificar el SHA de la ejecución y el resultado real; solo entonces declarar que Actions ha pasado.
3. Si el código de la PR se actualiza, confirmar que el run anterior de esa PR se cancela cuando aún esté en curso. No realizar cambios deportivos para provocar esta prueba.
4. No fusionar ni desplegar por el mero resultado verde. GitHub permite usar Run workflow cuando el archivo existe en la rama por defecto: ese es un requisito de workflow_dispatch. [Condiciones de eventos](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch).

Una ejecución puede requerir aprobación de GitHub o verse afectada por las políticas del repositorio; no se alteran aquí. No se configura una comprobación obligatoria de rama.

## Advertencias de dependencias pendientes

En la primera ejecución, npm informó de **32 vulnerabilidades: 19 moderadas y 13 altas**, además de avisos de paquetes obsoletos (node-domexception, json-ptr, uuid y glob). También advirtió de scripts de instalación pendientes de aprobación para **@firebase/util, protobufjs y re2**. El job terminó correctamente pese a esos avisos; no se aprobaron scripts ni se ejecutó audit fix.

Su alcance, las dependencias afectadas, la exposición y las posibles mitigaciones requieren una tarea de seguridad independiente. El número corresponde a esa ejecución y no constituye una evaluación de su impacto en la aplicación publicada. No se modifican package.json ni package-lock.json ni se aplican actualizaciones automáticas como parte de esta fase.

## Riesgos y límites

Instalar paquetes requiere red; la ejecución de scripts de instalación depende de la política de aprobación de npm. Los tres avisos anteriores permanecen pendientes. No se aplicó audit fix ni se aprobó almacenamiento inseguro o un secreto para resolverlos. El runner es efímero y no dispone de credenciales de Firebase; los comandos revisados no inicializan la aplicación ni consultan datos reales.

Una PR ejecuta código de sus scripts/dependencias: por eso se mantiene pull_request, lectura mínima, sin secretos, credenciales persistentes o acciones de publicación. No se ofrece una garantía sobre cambios maliciosos futuros que modifiquen deliberadamente esos scripts.

ubuntu-latest y la revisión menor de Node 24 pueden cambiar. Los pines SHA fijan las acciones, no la imagen completa o la disponibilidad de npm. La ejecución local Windows no sustituye la primera ejecución real Linux. El job único, la cancelación por PR y la ausencia de cachés/artefactos limitan trabajo y almacenamiento, sin prometer un coste de plataforma fijo.

Ante un fallo posterior de CI, revisar los logs y la PR; no añadir credenciales reales, desactivar TLS ni cambiar el lockfile a ciegas. La incorporación se revierte retirando únicamente este workflow y sus referencias mediante revisión; no hay datos deportivos o Firebase que revertir.
