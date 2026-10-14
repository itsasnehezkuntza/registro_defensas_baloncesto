# Auditoría de primera publicación de prueba

Fecha: 12 de octubre de 2026.
Resultado: **preparación técnica verificada; pendiente de autorización para commit, push y publicación**.
No se cambian diseño, funcionalidades ni datos reales.

## Estado de Git

- Rama: main, seguimiento local origin/main.
- Remoto: https://github.com/itsasnehezkuntza/registro_defensas_baloncesto.git.
- HEAD: c1d0bf6091479667d6ee45739a5e4732586a016f (Add files via upload).
- Modificados: README.md, app.js, index.html, styles.css.
- Nuevos sin seguimiento: .gitignore, .nojekyll, AGENTS.md, ESPECIFICACION.md, categorias.csv, los siete módulos de js/ y este informe.
- El área de preparación está vacía. No se ha ejecutado git add, commit, push ni configuración de Pages.
- Antes de esta auditoría tests/ estaba sin seguimiento; ahora está explícitamente ignorado, conservándose localmente. .test-artifacts/ ya estaba ignorado. Se comprobó con git check-ignore.
- No se ha ejecutado fetch: el estado de origin/main corresponde a referencias locales; verificar el remoto antes del push autorizado.

## Archivos previstos

Estos **12 archivos de producción** están presentes en el proyecto y en .test-artifacts/pages/, idénticos byte a byte, incluidos los hashes SHA-256 verificados:

```text
index.html
styles.css
app.js
categorias.csv
.nojekyll
js/configuracion.js
js/estadisticas.js
js/exportacion.js
js/identidad.js
js/interfaz.js
js/persistencia.js
js/registro.js
```

El commit previsto añadiría además **README.md y .gitignore**, para un total de 14 rutas. README es documentación pública de uso/publicación. No se incluirán AGENTS.md, ESPECIFICACION.md ni este informe.

Exclusiones comprobadas: tests/, .test-artifacts/ (perfiles, capturas, descargas y paquete local), temporales y bases locales. No se encontraron ficheros de base de datos, capturas, logs, ZIP ni manifiestos npm fuera de los artefactos aislados. La lista explícita evita subir archivos ajenos. No se debe usar git add . ni git add -A.

## Pruebas repetidas en esta auditoría

| Tipo | Resultado |
| --- | --- |
| Configuración, ejecución Node | 26 pruebas superadas. |
| Registro, ejecución Node | 28 combinaciones y 90 resultados; permisos, estadísticas e histórico superados. |
| CSV, ejecución Node | Orden, aislamiento, BOM, escape, protección de fórmulas, cabeceras vacías, IDs y nombre portable superados. |
| Integración simulada | 5 escenarios superados, DOM/persistencia simulados. |
| Partidos/persistencia, Chrome real | Fase 2: 15 grupos, ok:true. |
| Registro/concurrencia, Chrome real | Fase 3: 13 grupos, ok:true; IndexedDB real y dos pestañas. |
| Exportación y subdirectorio, Chrome real | Fase 5: 8 grupos, ok:true; Blob analizado, archivo CSV descargado nativamente con BOM y lectura desde /registro_defensas_baloncesto/. |
| Responsive emulado en Chrome | Diez tamaños/ampliaciones, sin desbordamientos, controles recortados ni barra ocultando la última defensa. |
| Rutas y paquete | 11 referencias estáticas relativas resueltas y existentes; 12 archivos idénticos entre proyecto y paquete. |
| Higiene Git | git diff --check sin errores; índice sin archivos preparados; exclusiones comprobadas. |

Se utilizó un servidor estático loopback y perfiles nuevos con datos ficticios. No se utilizaron ni borraron registros reales. Los runners rechazan bases con partidos preexistentes.

Informes locales: .test-artifacts/fase2-result.json, fase3-result.json, fase5-result.json, fase4-auditoria.json y auditoria-manifiesto.json.

## Rutas, configuración y dependencias

- HTML usa ./styles.css y ./app.js; importaciones de módulos son relativas.
- categorias.csv se obtiene con new URL('../categorias.csv', import.meta.url) y cache:no-store.
- La aplicación y los 28 destinos cargaron correctamente desde el paquete bajo /registro_defensas_baloncesto/, incluida una descarga CSV nativa.
- No se necesita Node, Python, npm, backend, compilación, CDN ni librerías externas para ejecutar en Pages. Node/PowerShell/Chrome solo participan en pruebas locales.
- .nojekyll se ha preparado en la raíz de main; se ha alineado el empaquetador local para copiar el mismo marcador.
- No se ha comprobado el sitio remoto tras despliegue: todavía no se ha publicado.

## Actualizaciones e históricos

- IndexedDB mantiene registro_defensivo_baloncesto, versión 1, con games/events/settings e índices originales.
- Al cargar una base existente no se ejecuta upgrade, borrado ni reescritura de eventos. No hay deleteDatabase ni clear en el código de producción.
- La eliminación de datos sigue restringida a acciones explícitas: confirmar partido o Deshacer.
- Renombrar/retirar CSV no reescribe eventos históricos; los IDs conservan agrupación y los nombres originales se exportan.
- La prueba de legado y las recargas de las suites pasaron nuevamente.
- Conservar el mismo origen/navegador mantiene los datos durante esta actualización. Los datos de localhost o file:// no se copian automáticamente al origen de Pages.

## Instrucciones de publicación desde main

La secuencia exacta está en README.md, sección «Primera publicación de prueba desde main».
Resumen del plan autorizado futuro:
1. Comprobar main/remoto y fetch; detenerse si hay cambios remotos que integrar.
2. git add de las 14 rutas explícitas, comprobar git diff --cached --name-only y --check.
3. Commit y push origin main tras aprobación.
4. Settings → Pages → Deploy from a branch → main → /(root) → Save.
5. Validar la URL https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/ con datos de prueba aislados.

La configuración de Pages se contrastó con la documentación oficial enlazada en README. Si ya está configurado main como fuente, el push podría publicar automáticamente. Por eso se solicita autorización conjunta antes de subir cualquier cambio.

## Riesgos y pendientes

No se detectaron fallos funcionales bloqueantes en Chrome. Pendientes Safari/Firefox, dispositivos físicos, apertura en Excel, zonas seguras/teclados reales y validación del dominio público.

Esperar Guardado antes de cerrar o recargar: una transacción interrumpida antes del commit puede abortar. IndexedDB depende del navegador; limpiar sus datos elimina la base. CSV permite análisis, pero no restauración en la app. Las pestañas comparten partido activo.

La rama remota y la configuración actual de Pages no se han consultado/actualizado; verificarlas antes de ejecutar la publicación autorizada. No usar force push. No se han cambiado fuentes, estilos ni lógica en esta auditoría.

## Cambios locales de preparación

- .nojekyll añadido a la raíz.
- .gitignore ampliado para excluir tests/ en esta primera publicación.
- README actualizado para main en lugar de gh-pages.
- tests/preparar-pages.ps1 alineado con el marcador raíz; queda local e ignorado.
- ESPECIFICACION.md e informe de auditoría actualizados localmente.

**Detención:** sin stage, commit, push o despliegue. Se solicita autorización antes de publicar.

## Publicación de prueba autorizada — 12 de octubre de 2026

Publicación realizada tras autorización expresa del usuario. Commit: `611848aaad31b0330a1e5fa32a944cc0ca0538c6`, en `main` y `origin/main`, mediante push normal sin force. Se incluyeron exclusivamente las 14 rutas aprobadas. Los documentos internos, pruebas, capturas y perfiles siguen locales y no forman parte del commit.

GitHub Pages ya estaba configurado desde `main` → `/(root)`; no fue necesario cambiar sus ajustes. La API confirma el build `built`, sin errores, del mismo commit.

URL: https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/

Verificación remota ejecutada: HTML, CSS, CSV y los ocho archivos JavaScript (app y siete módulos) responden HTTP 200 y coinciden con los archivos locales, normalizando únicamente saltos de línea. Chrome headless real, con perfil nuevo aislado y datos ficticios, recupera las 28 combinaciones sin error de configuración; empieza sin partido y con resultados bloqueados; permite crear un partido; PR Roller / Blue habilita solo los dos resultados de 2 puntos; la barra inferior conserva posición fija. Estas comprobaciones complementan las regresiones anteriores; no son pruebas en dispositivos físicos.

Ramas local/remota sincronizadas (0 commits de diferencia). No se modificaron diseño ni lógica. Pendientes pruebas personales en móvil/tablet/ordenador, Safari/Firefox y Excel. El almacenamiento de localhost no se transfiere al origen público; los datos permanecen por navegador y origen. Se detiene esta entrega sin iniciar la Fase 6.