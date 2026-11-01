# GitHub Actions básico — propuesta de Fase 24.3

1 de noviembre de 2026. Base: main `02a069b7dadf75f8924545b174b2d598f9fcc38c`, aplicación pública 23.0. Clon independiente y rama mantenimiento/fase24-3. Solo preparación local: sin commit, push, PR, fusión, ejecución remota ni despliegue.

**No hay una ejecución de este workflow acreditada en GitHub.** Los resultados locales no prueban que haya pasado en ubuntu-latest. La primera evidencia efectiva será la ejecución activada por una PR posterior, si se autoriza publicarla.

## Estado previo y archivo propuesto

La base no contiene archivos en .github/workflows. La consulta pública GET del catálogo Actions devuelve solo pages-build-deployment, activo, con ruta dinámica interna de Pages. Ese workflow y gh-pages no se modifican.

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

## Validación local

| Comprobación | Resultado |
|---|---|
| Clon y rama | Base 02a069b y mantenimiento/fase24-3; sin commits nuevos. |
| Instalación local desde lockfile | npm ci correcto, 779 paquetes; caché nueva y sin actualizar dependencias. |
| YAML | Parser yaml 2.9.1 ya incluido en el árbol del lockfile, YAML 1.2 estricto y claves únicas; sin errores de sintaxis. No se añadió dependencia. |
| Contrato del workflow | Solo los dos eventos previstos, una rama destino, un job y cinco pasos; permisos, tiempo, concurrencia, inputs y comandos correctos. |
| Acciones | SHAs completos contrastados con releases, etiquetas Git y action.yml oficiales; firmas verificadas según GitHub. |
| npm run check | 63 scripts y referencias correctos, salida 0. |
| npm test | 12 archivos correctos, cero fallos, salida 0. |
| Conservación | Los 43 archivos públicos, firestore.rules, package-lock.json y package.json conservan sus bytes; ningún archivo de aplicación o pruebas cambia. |
| Formato | Diff completo comprobado, incluidos los archivos nuevos, con índice temporal de revisión; el índice real permanece vacío. |
| GitHub Actions real | No ejecutado ni acreditado: no hay commit, push, PR o dispatch en esta fase. |


La validación del YAML se realizó por separado: npm run check no valida el propio workflow ni el planificador de GitHub.

No se ejecutan navegador, Java o Emulator para validar esta propuesta. No se ha accedido a Firebase, Authentication, permisos o datos deportivos reales. La identidad Git configurada sigue siendo itsasnehezkuntza, sin cambios ni atribuciones automáticas; no se crea ninguna contribución remota en esta fase.

## Prueba posterior mediante PR

1. Revisar estos tres archivos y autorizar por separado el commit/push de mantenimiento/fase24-3 y la apertura de una PR hacia main.
2. En la PR, comprobar que Comprobaciones de PR se activa y muestra el job Sintaxis y pruebas nativas, Node 24 y los tres comandos previstos. Verificar el SHA de la ejecución y el resultado real; solo entonces declarar que Actions ha pasado.
3. Si el código de la PR se actualiza, confirmar que el run anterior de esa PR se cancela cuando aún esté en curso. No realizar cambios deportivos para provocar esta prueba.
4. No fusionar ni desplegar por el mero resultado verde. Tras una integración futura autorizada, GitHub permite usar Run workflow: workflow_dispatch necesita que el archivo exista en la rama por defecto. [Condiciones de eventos](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch).

La primera ejecución puede requerir aprobación de GitHub o verse afectada por las políticas del repositorio; no se alteran aquí. No se configura una comprobación obligatoria de rama.

## Riesgos y límites

Instalar paquetes requiere red y ejecuta los scripts de instalación previstos en las dependencias actuales; npm mantiene sus avisos transitivos ya conocidos. No se aplicó audit fix ni se aprobó almacenamiento inseguro o un secreto para resolverlos. El runner es efímero y no dispone de credenciales de Firebase; los comandos revisados no inicializan la aplicación ni consultan datos reales.

Una PR ejecuta código de sus scripts/dependencias: por eso se mantiene pull_request, lectura mínima, sin secretos, credenciales persistentes o acciones de publicación. No se ofrece una garantía sobre cambios maliciosos futuros que modifiquen deliberadamente esos scripts.

ubuntu-latest y la revisión menor de Node 24 pueden cambiar. Los pines SHA fijan las acciones, no la imagen completa o la disponibilidad de npm. La ejecución local Windows no sustituye la primera ejecución real Linux. El job único, la cancelación por PR y la ausencia de cachés/artefactos limitan trabajo y almacenamiento, sin prometer un coste de plataforma fijo.

Ante un fallo posterior de CI, revisar los logs y la PR; no añadir credenciales reales, desactivar TLS ni cambiar el lockfile a ciegas. La propuesta se revierte retirando únicamente este workflow y sus referencias mediante revisión; no hay datos deportivos o Firebase que revertir.
