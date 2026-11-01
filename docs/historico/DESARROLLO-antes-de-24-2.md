# Entorno de desarrollo vigente (Fase 24.1)

Base: main remoto, commit `11cfed15f431b79c57f638a47fdedf3eaf9271eb`, versión pública 23.0. Este cambio prepara herramientas locales; no publica ni modifica la aplicación o las reglas. `develop` se conserva como referencia histórica.

## Requisitos e instalación

- Git para clonar. Node.js 22 o superior con npm; verificado con Node 24.21.0 y npm 11.19.0 en Windows. Usar `npm.cmd` si PowerShell bloquea `npm.ps1`.
- Desde la raíz del clon: `npm ci`. No instalar Firebase CLI ni Playwright globalmente. Se conservan las cuatro dependencias de desarrollo exactas del lockfile: @firebase/rules-unit-testing 5.0.0, @playwright/test 1.64.0, firebase 12.11.0 y firebase-tools 15.11.0. Sin dependencias nuevas ni de producción.
- Red para la primera instalación y descarga de navegadores/emulador/SDK oficial. No se requiere login de Firebase, credenciales, recibos antiguos, otro workspace ni caché preexistente.
- Navegador: `npm run visual:instalar` descarga Chromium en este clon. Para cuentas y supervisión con ambos motores: `node tools/playwright/cli.mjs install chromium webkit`. En Linux pueden hacer falta las bibliotecas del sistema que indica [Playwright](https://playwright.dev/docs/browsers#install-system-dependencies); no se instalan automáticamente con permisos de administrador.
- Emuladores: Java 21 o superior en PATH o JAVA_HOME. El lanzador comprueba la versión antes de arrancar; no busca un Java oculto de otra copia. [Requisito oficial de Firestore Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore). Puertos locales 8085 (Firestore), 9099 (Auth), y puertos auxiliares libres. Navegador visual: 4173; baterías Firebase de navegador: 4198.

## Comandos habituales

| Comando | Alcance |
|---|---|
| `npm test` | Los once archivos tests/*.test.mjs de primer nivel y cuenta.test.mjs. Pruebas nativas, sin Firebase ni navegador. |
| `npm run check` | Sintaxis e imports de producción y herramientas vigentes; referencias públicas y subruta; configuración de emuladores y dependencias coherentes con lockfile. No ejecuta módulos deportivos. |
| `npm run test:browser` | Prueba visual existente en escritorio y dos móviles; creación de partido/tiro ficticios y conservación tras recargar. Alias: npm run visual. |
| `npm run prepare:test-pages` | Genera los 43 archivos de prueba de subruta, sin material interno. También se genera automáticamente al iniciar test:fase8a. |
| `npm run test:emulator -- rules` | 85 comprobaciones de Firestore Rules con datos ficticios. Alias: npm run test:reglas. |
| `npm run test:emulator -- account22` | Cuenta, equipos y continuidad de registro en Chromium/WebKit. Alias: test:auth. |
| `npm run test:emulator -- sync` | Batería de sincronización, solo emuladores. Alias: test:sync. |
| `npm run test:emulator -- supervision23` | Batería específica de supervisión, solo emuladores. Alias: test:supervision. |
| `npm run test:emulator -- suite23` | Campaña completa de reglas, supervisión, sync y cuentas. Reservar para cambios que lo requieran. |
| `npm run test:fase8a` | Regresiones locales de navegador, fallos de acceso, CSV y subruta; SDK oficial en las comprobaciones de carga de Auth, sin iniciar sesión real. |

Ejecutar los comandos npm desde la raíz del clon. El lanzador nativo, el de Playwright, el de emuladores y el generador calculan su raíz desde su propio archivo. Las baterías Firebase heredan esa raíz como cwd.

`package.json` declara type=module porque los .js propios son módulos ES. Evita la autodetección repetida de Node; no modifica los módulos que recibe el navegador. `package-lock.json` permanece idéntico.

## Aislamiento y archivos regenerables

`firebase.json` contiene únicamente las reglas locales y emuladores en 127.0.0.1; sin Hosting, carpeta padre ni alias de proyecto real. El lanzador pasa este archivo explícitamente, fija demo-defensas y descarta tokens y credenciales administrativas heredadas. No usar `firebase deploy` ni herramientas de validación real para estas pruebas. No se necesita firestore.indexes.json: estas pruebas no despliegan índices y el emulador no acredita la disponibilidad de índices reales.

La prueba visual sirve una configuración demo y un adaptador Auth simulado exclusivo de herramientas. Mantiene la pantalla de inicio sin llamar a Google/Firebase; no acredita Google real ni sincronización. Usa perfiles efímeros y datos ficticios; nunca el perfil o IndexedDB del usuario. Las baterías account22/sync/supervision23 utilizan SDK y emuladores reales locales. La aplicación publicada conserva sus archivos y configuración.

Solo son ignorados/regenerables node_modules y .test-artifacts (npm-cache opcional, navegadores, SDK oficial, emulador, paquete de subruta, informes y capturas). El primer arranque crea lo necesario; no se copia nada desde develop. El paquete de subruta usa una lista explícita en tools/public-files.mjs, no importa preparadores de publicaciones antiguas y se niega a borrar un archivo ajeno si lo encuentra. No incluye version.json: este último pertenece al proceso de publicación; estas son pruebas locales.

`npm run check` comprueba referencias literales; no sustituye una prueba de ejecución ni una auditoría de seguridad. No descarga ni ejecuta SDK remoto. Las rutas construidas por código se validan con las pruebas de navegador/emuladores correspondientes.

## Herramientas históricas: conservar, no ejecutar como prueba general

| Archivos o familias | Motivo |
|---|---|
| tools/firebase/preview-account.test.mjs | Importa js/preview-account.js, ausente en main 23.0; prototipo retirado. |
| tools/firebase/diagnostics8b4.test.mjs | Importa js/sync-diagnostics.js, ausente en main 23.0; diagnóstico de una fase antigua. |
| tools/firebase/audit23-local.mjs | Exige HEAD 6003a72 y el estado exacto de aquel candidato. |
| tools/firebase/prepare23-1-review.mjs | Requiere recibos ignorados de entrega/paquete y referencias históricas; es preparación de una publicación concreta. |
| tools/firebase/revision23-1.test.mjs | Usa fuentes/Pages 22.0 por hashes fijos; el commit de la rama Pages no está garantizado en un clon de main. |
| tools/firebase/supervision23-upgrade.test.mjs | Modela HEAD como cliente 22.0 y compara con el candidato 23.0-local; ya no describe HEAD 23.0. |
| Herramientas de candidatos/publicaciones/recepción 8B–23 | Conservan contratos, copias y recibos específicos. No se incluyen recursivamente en npm test/check. Los modos antiguos review8b2, preview8b3 y receive8b* no forman parte del lanzador vigente; test:revision-sync queda como alias histórico con diagnóstico explícito. |

No restaurar módulos deportivos antiguos ni inventar recibos para que estas herramientas pasen. No borrar archivos en esta fase. tests/diseno-v4/servidor.mjs y vacia.html siguen siendo fixtures de editor19/panel-local21; su nombre no basta para declararlos obsoletos. Los comandos firebase:* y test:*real* existentes son administrativos/históricos, quedan fuera de este flujo y no se ejecutaron.

## Verificación de Fase 24.1

Clon nuevo independiente, fuera del workspace develop y sin node_modules en su directorio padre. Instalación desde el lockfile con caché propia nueva. Resultados detallados y estado de revisión en [FASE24_1_ENTORNO.md](FASE24_1_ENTORNO.md). No se exige repetir la campaña de seguridad completa para cambios documentales.
