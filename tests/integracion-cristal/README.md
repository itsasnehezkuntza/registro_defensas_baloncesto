# Premium cristal integrado · revisión local

Integra la propuesta aprobada y conecta el Dashboard Fase 7 al partido activo, con el mismo material y paleta. No hay migraciones ni escrituras nuevas de datos. Plan y decisiones en PLAN.md y ESPECIFICACION.md, apartado 31.

## Abrir

Desde la raíz, con Node disponible:

```text
node tests/integracion-cristal/servidor.mjs
node tests/integracion-cristal/abrir.mjs
```

Aplicación: http://127.0.0.1:4191/ . Comparador: http://127.0.0.1:4191/tests/integracion-cristal/revision.html . El segundo comando utiliza Chromium de Playwright ya instalado, visible y con un perfil efímero, sin datos personales. También puedes abrir las direcciones en tu navegador habitual. Los datos se guardan por origen; otro puerto no comparte el almacenamiento del servidor que usabas antes. El servidor escucha solo en loopback y restringe los archivos que sirve.

## Verificación

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tests/preparar-pages.ps1
node tests/dashboard.test.mjs
node tests/integracion-cristal/verificar.mjs --headed
```

El verificador crea contextos aislados y partidos ficticios: nunca abre el perfil personal. Comprueba navegación, persistencia, sincronización entre pestañas, selección, registro/doble toque, Deshacer, CSV, borrado aislado y subruta estática. Ejecuta además las suites de navegador de fases 2, 3, 5 y 6. Genera capturas a seis dimensiones y compara geometría/materiales con la demo aprobada. Las barras nativas de scroll se descuentan al comparar ancho útil. La navegación añadida requiere 44 px de alto y puede aumentar 12 px la primera fila de cabecera en escritorio compacto.

`verificacion-visible.json` contiene el resultado final con navegador visible; `verificacion.json` conserva la primera comprobación sin ventana. `capturas/` contiene propuesta e integración con muestra idéntica. Las capturas completas de Estadísticas son de una vista con scroll; las de registro final muestran que la última defensa queda accesible sobre el pie fijo.

## Copias e integridad

Antes de editar se guardaron fuente, documentación y pruebas en `.local-backups/integracion-cristal-20261014-063235/proyecto-previo.tar.gz`, además de parche Git, HEAD, estado y hashes. `propuesta-aprobada/` es una copia independiente de toda la demo. No extraer encima del proyecto sin revisar los cambios posteriores. `integridad-final.json` verifica conservación de módulos centrales y de la propuesta, así como igualdad de las dos capas CSS aprobadas integradas en premium.css (solo cambian rutas de fuentes).

Pendiente de revisión del usuario. Safari, rendimiento de blur y tacto en dispositivos físicos no comprobados. Sin commit, push ni publicación.
