# Registro defensivo de baloncesto

Aplicación para registrar los tiros del rival en dos pulsaciones y consultar las estadísticas del partido. HTML, CSS y JavaScript puro, con guardado local en IndexedDB y servicios administrados de Firebase para las cuentas.

**Versión pública: 23.0.** [Abrir Registro](https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/) · [Abrir Supervisión](https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/supervision.html). La consolidación de documentación no cambia la versión ni publica la aplicación.

## Uso habitual

1. Crea o selecciona un partido. Jornada y rival son obligatorios.
2. Toca la acción o defensa y después el resultado de 2 o 3 puntos.
3. Consulta Estadísticas, deshaz el último tiro o exporta el CSV del partido activo.

El Registro y el Dashboard muestran anotados/intentos del rival; el éxito defensivo se calcula como fallados/intentos × 100. Cada partido conserva su panel y sus datos históricos.

## Sin cuenta, con Google y supervisión

- **Sin cuenta:** los partidos se guardan en ese navegador y dispositivo. Con esa elección recordada no se inicia Google ni Firestore. Exportar CSV permite analizar datos; no existe importación de CSV como restauración.
- **Con Google:** se exige crear o seleccionar un equipo antes de registrar. La sincronización es automática, también al recuperar conexión. Los partidos anteriores solo se incorporan tras revisión y confirmación. El cierre de sesión protege los cambios pendientes.
- **Supervisor:** consulta únicamente los equipos asignados a su UID y el Dashboard del partido seleccionado. Es una entrada independiente de solo lectura, protegida por Firestore Rules. Los permisos se asignan y revocan administrativamente; no se gestionan desde la aplicación.

La sincronización y los originales de una importación no sustituyen un respaldo independiente. No borrar el almacenamiento para resolver incidencias.

## Desarrollo y documentación

Para instalar las dependencias de desarrollo y ejecutar las comprobaciones, consulta [DESARROLLO.md](DESARROLLO.md): `npm ci`, `npm test` y `npm run check`. Navegador y emuladores se ejecutan por separado según el cambio. La aplicación no necesita compilación ni dependencias npm de producción; servirla mediante HTTP, no con file://.

- [Especificación vigente](ESPECIFICACION.md): comportamiento funcional y contratos que deben conservarse.
- [Arquitectura](docs/arquitectura.md): almacenamiento, transacciones, sincronización y permisos.
- [Supervisión y procedimiento administrativo](docs/supervision.md).
- [Continuidad](CONTINUIDAD.md): estado presente, límites y próximos trabajos.
- [Pendientes priorizados](docs/pendientes.md).
- [Histórico técnico](docs/historico/README.md): fases, decisiones y auditorías completas.

No publicar, modificar servicios reales ni borrar datos o respaldos sin autorización expresa.
