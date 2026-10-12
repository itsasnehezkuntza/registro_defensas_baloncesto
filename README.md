# Registro defensivo de baloncesto

Aplicación estática en español para registrar tiros rivales durante un partido con dos pulsaciones. HTML, CSS, módulos JavaScript e IndexedDB, sin backend, dependencias de producción ni compilación.

Fases 1–5 aprobadas provisionalmente. Auditoría de primera publicación preparada; pendiente de autorización. La futura Fase 6 abordará exclusivamente identidad visual y diseño deportivo. No se ha publicado ni hecho push. Requisitos, resultados y límites en [ESPECIFICACION.md](ESPECIFICACION.md).

## Uso

1. Pulsa **+ Nuevo partido**, escribe jornada y rival obligatorios y confirma Crear partido. Los nombres pueden repetirse; cada partido tiene un ID propio. Sin partido activo, registro y exportación están bloqueados.
2. Selecciona una acción de Transición/Estático o directamente una defensa dentro de su tipo de Bloqueo directo.
3. Pulsa **2✓, 2✕, 3✓ o 3✕**. ✓ significa anotado por el rival; ✕, fallado. Solo se habilitan los resultados permitidos. La selección se consume y el tiro se guarda automáticamente.
4. **Deshacer** elimina el último tiro persistido del partido activo, incluso después de recargar.
5. **CSV Excel** descarga solo el partido seleccionado al iniciar la operación.

Al recargar se restaura el último partido activo válido. El selector permite continuar encuentros anteriores. Jornada y rival no se editan después de crear. **Eliminar partido** identifica el encuentro y requiere confirmación; Cancelar no cambia nada y Eliminar definitivamente borra solo ese partido y sus tiros.

Las pestañas del mismo origen comparten selección activa y reciben los cambios confirmados. Una actualización del mismo partido conserva la selección en curso.

**Guardado localmente** indica transacción confirmada. Si un tiro aborta, el aviso permite repetir el resultado sin duplicar su ID. Si se confirma pero falla el refresco, el aviso distingue ese caso. Antes de cerrar o recargar espera la confirmación de guardado.

Éxito defensivo = fallados / intentos × 100, redondeado al entero. Sin intentos se muestra un guion. Los datos permanecen en ese navegador/origen; no se sincronizan entre dispositivos. Limpiar datos del sitio elimina ese almacenamiento. CSV es una descarga para análisis, no una copia que la aplicación pueda importar.

## Exportación CSV

Un evento por fila, ordenado por seq persistente. Incluye ID del evento/partido, jornada, rival, categoría, acción, tipo de bloqueo, defensa, valor, resultado, intentos/anotados/fallados, puntos realmente concedidos, fecha/hora UTC, IDs estables y orden.

Formato UTF-8 con BOM, separador `;` y saltos CRLF. Campos entre comillas con escape de comillas, separadores y saltos. Los campos que pueden interpretarse como fórmulas se prefijan con apóstrofo al exportar; IndexedDB no se modifica. Excel en otras configuraciones regionales puede requerir importar mediante **Datos → Desde texto/CSV**, eligiendo UTF-8 y punto y coma.

El archivo identifica jornada, rival e ID del partido, con caracteres y longitud saneados. Un partido vacío descarga cabeceras. Las acciones retiradas y nombres originales siguen exportándose; los IDs de eventos v1 conocidos se deducen mediante la tabla fija de lectura. Si no se puede identificar un evento antiguo, esos IDs se dejan vacíos.

No hay opciones JSON ni XLSX nativo.

## Editar categorias.csv

Guarda como CSV UTF-8 separado por punto y coma, con la cabecera:

```text
categoria_id;categoria;accion_id;accion;defensa_id;defensa;tiros
```

- `categoria_id`: transicion, estatico o directo; sus nombres visibles son editables.
- `accion_id`: estable y único entre acciones. Minúsculas, números y guion bajo, comenzando por letra.
- `categoria` y `accion`: nombres coherentes en todas las filas del mismo ID.
- `defensa_id` y `defensa`: vacíos en acciones simples; obligatorios en directo. El mismo ID de defensa mantiene el mismo nombre.
- `tiros`: 2, 3 o 2,3, aplicado a esa combinación.

```text
transicion;Transición;transicion_bajo_aro;Bajo aro;;;2
directo;Bloqueo directo;pr_manejador;PR Manejador;blue;Blue;2,3
```

Renombra solo los nombres, conservando IDs. Añade acciones con IDs nuevos; no reutilices uno retirado para otra acción. En directo, una fila por defensa y el mismo accion_id para cada tipo. El orden de filas determina el orden de botones. Retira acciones borrando sus filas, sin perder tiros anteriores. Mantén al menos una fila.

PR Roller inicialmente permite únicamente 2 en sus cinco defensas. Los permisos proceden del CSV; editarlo cambia solo los registros futuros. Nombres con `;`, salto o comillas deben encerrarse entre comillas dobles, duplicando comillas interiores.

Después de editar, vuelve a preparar los archivos de publicación y, cuando se autorice, actualiza la rama de publicación. Recarga la aplicación después de publicarlo; CSV se solicita sin caché. Un error de configuración bloquea registro, conservando almacenamiento y exportación del activo si IndexedDB funciona.

## Ejecutar localmente

Abrir `index.html` mediante `file://` no carga correctamente módulos/CSV. Utiliza cualquier servidor estático. Con Node 22.7 o posterior:

```text
node tests/servidor.mjs 8080
```

Abre `http://127.0.0.1:8080/`. Node solo sirve para pruebas/desarrollo; la aplicación publicada no lo necesita.

## Preparar GitHub Pages sin publicar

En Windows, desde el repositorio:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
```

Genera `.test-artifacts/pages/` con exactamente 12 archivos: index.html, styles.css, app.js, categorias.csv, .nojekyll y los siete módulos de js/. No copia pruebas, perfiles, informes ni documentación interna. Solo copia archivos; no compila, no ejecuta git ni publica. Los artefactos están excluidos de Git.

Con el servidor local abierto, verifica `http://127.0.0.1:8080/registro_defensas_baloncesto/`. Esa ruta sirve el paquete preparado para comprobar el mismo subdirectorio que Pages.

## Primera publicación de prueba desde main (pendiente de autorización)

La fuente prevista es **main / (root)**. Los 12 archivos de aplicación ya están en la raíz y js/. .nojekyll está preparado en la raíz. README.md y .gitignore son los dos archivos adicionales de soporte previstos en el commit. No se suben tests/, .test-artifacts/, AGENTS.md, ESPECIFICACION.md ni el informe de auditoría.

El estado de la revisión y los riesgos están en AUDITORIA_PUBLICACION.md. Las siguientes órdenes son instrucciones futuras; no se han ejecutado:

1. Después de autorizar, confirmar rama/remoto y actualizar solo las referencias remotas:

```powershell
git branch --show-current
git remote -v
git fetch origin
git log --oneline main..origin/main
```

Si aparecen commits remotos nuevos, detener el proceso y revisar/integrar sin force push antes de continuar. La auditoría solo comparó las referencias locales.

2. Preparar exclusivamente esta lista:

```powershell
git add -- index.html styles.css app.js categorias.csv .nojekyll js/configuracion.js js/estadisticas.js js/exportacion.js js/identidad.js js/interfaz.js js/persistencia.js js/registro.js README.md .gitignore
git diff --cached --name-only
git diff --cached --check
```

Verificar **14 rutas**: los 12 archivos runtime más README.md y .gitignore. No usar git add . ni git add -A. Las pruebas y artefactos están ignorados; los documentos internos permanecen locales y no forman parte de esta lista.

3. Solo después de revisar el índice y recibir autorización:

```powershell
git commit -m "Primera version funcional para prueba en GitHub Pages"
git push origin main
```

4. En GitHub: **Settings → Pages → Build and deployment → Source → Deploy from a branch**, seleccionar **main** y **/(root)**, y guardar. Esta operación inicia publicación y también requiere autorización. Si Pages ya está configurado para main, el push puede iniciar el despliegue automáticamente.

5. Revisar el resultado de Pages y abrir `https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/`. Verificar carga de categorías, creación de un partido de prueba, registro 2P/3P, recarga, Deshacer y CSV. No borrar partidos históricos para probar.

Pasos de configuración contrastados con la [documentación oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). No se ha cambiado la configuración remota ni publicado nada.

Para actualizaciones futuras desde main, mantener esa lista explícita y comprobar cambios antes de subir. No cambiar el nombre/versión de IndexedDB ni ejecutar borrados al actualizar. Pasar de localhost a Pages cambia el origen: los datos locales no se trasladan automáticamente. Una actualización en el mismo origen/navegador conserva la base actual.

## Pruebas

Sin paquetes adicionales:

```text
node tests/configuracion.test.mjs
node tests/registro.test.mjs
node tests/exportacion.test.mjs
node tests/integracion.test.mjs
```

Con el servidor abierto y Chrome instalado en Windows, perfiles aislados:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 2
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 3
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Port 8080 -Phase 5
powershell -NoProfile -ExecutionPolicy Bypass -File tests/revisar-responsive.ps1 -Port 8080 -Label fase5
```

Los runners rechazan partidos preexistentes y usan datos ficticios. Informes, capturas y descargas en .test-artifacts/, fuera del paquete. Sus flags de Chrome están adaptados al entorno restringido y solo deben utilizarse contra loopback.

Se verificó IndexedDB real, dos pestañas, descargas nativas y responsive emulado. Pendientes dispositivos físicos, Safari/Firefox, apertura real en Excel y comprobación del dominio publicado después de autorizar su despliegue.
