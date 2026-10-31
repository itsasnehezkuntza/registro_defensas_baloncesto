# Fase 24.1 — Entorno reproducible desde main 23.0

31 de octubre de 2026. Implementado localmente y detenido para revisión. Sin commit, push ni despliegue. No cambia producción, Firestore Rules ni datos reales.

## Base y aislamiento

Se consultó el main público remoto y se clonó con --branch main --single-branch en un directorio nuevo fuera de develop: `C:/Users/itsas/AppData/Local/Temp/registro-defensas-fase24-1-20261031`. Base: `11cfed15f431b79c57f638a47fdedf3eaf9271eb` (documenta la publicación 23.0). Rama local: `mantenimiento/fase24-1`. No existen node_modules en su carpeta padre. No se copiaron herramientas ni cachés de develop. Los archivos nuevos se redactaron tras revisar sus necesidades y las herramientas de main.

El workspace original develop continúa en `7c439c149ad2bbe4e71749260e8b9d10f45c0d83`. Sus 368 rutas inventariadas conservan los mismos hashes/ausencias; rama, HEAD, estado Git y lista de worktrees son idénticos. No se ejecutó limpieza ni se tocaron respaldos o artefactos originales. La comprobación de conservación cubre esas 368 rutas; no presupone un hash recursivo de todas las cachés ignoradas.

## Archivos exactos

Añadidos (10):

- AGENTS.md: instrucciones breves vigentes, seguridad y pruebas.
- DESARROLLO.md: instalación, comandos, requisitos, aislamiento y clasificación histórica.
- FASE24_1_ENTORNO.md: este informe de entrega.
- firebase.json: emuladores locales explícitos, sin Hosting o rutas al padre.
- playwright.config.mjs: tres tamaños, un trabajador y artefactos ignorados.
- tools/test.mjs: once pruebas nativas de tests más cuenta.test.mjs.
- tools/check.mjs: sintaxis, imports literales vigentes, archivos públicos, configuración y lockfile.
- tools/public-files.mjs: lista explícita de los 43 archivos públicos fuente de 23.0.
- tools/prepare-test-pages.mjs: paquete local de subruta regenerable, sin dependencia de preparadores históricos ni borrados.
- tools/playwright/auth-fixture.mjs: cuenta simulada exclusiva de prueba visual, sin Google/Firebase real.

Modificados (8):

- package.json: comandos test/check/test:browser/test:emulator/prepare:test-pages y type=module; mismas dependencias exactas.
- tools/firebase/emuladores.mjs: raíz propia, config explícita, demo-defensas, Java >=21, CLI/cachés/navegadores propios y credenciales heredadas descartadas. Solo modos vigentes; diagnóstico al solicitar modos históricos.
- tools/firebase/local-browser.mjs: prepara automáticamente el paquete de subruta antes de probar.
- tools/playwright/cli.mjs: activa el adaptador de prueba local en su servidor efímero.
- tools/playwright/servidor.mjs: respuestas de configuración/cuenta ficticias solo en el modo visual; fuentes públicas en disco intactas.
- tools/playwright/README.md: instrucciones portables y enlace a guía vigente.
- README.md: un enlace de desarrollo, sin reorganizar el histórico.
- ESPECIFICACION.md: entrada breve de continuidad de esta fase.

No se añadió firestore.indexes.json: no es necesario para ejecutar estas pruebas locales y no se valida ni despliega ningún índice real. No se añadieron dependencias, GitHub Actions ni configuración de Hosting. No se modificaron CONTINUIDAD.md ni las herramientas históricas de publicación.

## Verificación ejecutada realmente

| Comando/comprobación | Resultado |
|---|---|
| npm ci --cache .test-artifacts/npm-cache --no-audit --no-fund | Correcto desde lockfile; primera instalación con caché nueva. Repetida tras preparar package.json: 779 paquetes, salida 0. |
| npm ls --depth=0 | Las cuatro dependencias exactas instaladas. |
| npm test | 12 archivos correctos, cero fallos; ejecución final ~0,4 s en Node. |
| npm run check | 63 scripts, referencias públicas/subruta e imports vigentes correctos; configuración y lockfile coherentes. |
| npm run visual:instalar | Chromium descargado desde origen oficial en el clon. |
| npm run test:browser | 3/3 pruebas correctas, ~7,5 s: escritorio, móvil y móvil estrecho. Partido/tiro ficticios y recarga. |
| npm run prepare:test-pages | 43 archivos generados automáticamente desde fuentes locales. |
| Prueba efímera de subruta | 33 acciones cargadas bajo /registro_defensas_baloncesto/, sin errores ni peticiones externas; perfiles nuevos y red externa bloqueada. |
| npm run test:emulator -- rules | 85/85 comprobaciones correctas; demo-defensas y Firestore Emulator 1.20.4 descargado desde cero. |
| Java antiguo | La versión 8 del PATH se rechaza antes de arrancar. Para verificar se descargó Temurin JRE 21.0.13+9 nuevo, se comprobó SHA256 oficial y se indicó JAVA_HOME solo al proceso de prueba. No cambió el sistema. |
| git diff --check | Correcto; avisos de conversión CRLF de Git para archivos de desarrollo, sin errores de espacios. |
| Hashes de invariantes | 43 fuentes públicas, firestore.rules y package-lock.json: 45/45 idénticos a los bytes del clon inicial 23.0. |
| Conservación develop | 368 rutas iguales y mismo estado Git/worktrees. |

Requisitos: Node >=22 y npm (probados 24.21.0/11.19.0), red en la primera descarga, Java >=21 solo para emuladores; Chromium solo para visual y WebKit adicional para las baterías que lo usan. Véase [DESARROLLO.md](DESARROLLO.md) para comandos de cada batería. La instalación de npm 11 avisa de dependencias transitivas obsoletas y de scripts no autorizados por su política; no hizo falta aprobarlos para las comprobaciones realizadas. No se cambiaron versiones ni se aplicó npm audit fix. Es mantenimiento pendiente del lockfile, fuera de esta fase.

No se repitió la campaña completa de seguridad ni account22/sync/supervision23: sus imports vigentes se revisaron, sus comandos y requisitos quedaron preparados, pero esta entrega solo acredita la prueba representativa de reglas y la visual. WebKit no se instaló en este clon. No confundir revisión estática con ejecución de estas baterías.

Las herramientas históricas con módulos retirados, HEAD fijo, recibos ignorados o commits de Pages antiguos quedan identificadas individualmente en DESARROLLO.md. No se restauraron módulos antiguos para satisfacerlas. Las comprobaciones reales de Firebase y herramientas administrativas de publicación permanecen fuera del flujo habitual y no se ejecutaron.

## Producción, Git y revisión

Producción 23.0 permanece intacta: sin cambios de Registro, Dashboard, editor, CSV, Google, sincronización, Supervisión, configuración pública ni reglas. Solo se usó Firebase Emulator; no se inició sesión real ni se consultaron, modificaron o borraron datos deportivos reales. Sin cambios de Firebase remoto, IndexedDB de dispositivos, permisos o despliegues. La prueba visual simula Auth y no pretende validar Google real.

Estado esperado del clon: 8 archivos modificados y 10 nuevos sin seguimiento; índice vacío. HEAD y origin/main siguen en 11cfed1. Los artefactos regenerables están ignorados dentro del propio clon. Los recibos locales de conservación, hashes y subruta están en .test-artifacts/verificacion/. El clon está en Temp: conservarlo hasta revisar, sin limpieza automática; no es todavía una entrega confirmada en Git.

Reversión: mantener el clon para revisión y volver a trabajar en main sin aplicar sus cambios. No se requiere tocar datos, reglas o el workspace original. Si se acepta una parte, trasladar únicamente los archivos enumerados desde esta copia, con revisión de diff; nunca mezclar el acumulado de develop. No ejecutar reset, git clean ni borrar worktrees para revertir esta preparación.

Recomendación 24.2: revisar esta entrega y consolidar primero este entorno en main con autorización separada; después simplificar documentación vigente y archivar decisiones históricas por pasos pequeños. Mantener develop y respaldos. GitHub Actions y actualizaciones de dependencias se revisan aparte; no se han creado en esta fase.
