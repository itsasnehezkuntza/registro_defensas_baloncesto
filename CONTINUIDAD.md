# Continuidad — estado presente

Actualizado el 1 de noviembre de 2026. **Aplicación pública 23.0**, build `23.0-3c1018ebaed68c92`. [Registro](https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/) · [Supervisión](https://itsasnehezkuntza.github.io/registro_defensas_baloncesto/supervision.html).

## Referencias y trabajo actual

- Rama principal vigente: `main`. Su HEAD remoto se consulta con `git ls-remote origin refs/heads/main`; no debe deducirse del commit que sirvió de base a una fase.
- Base de partida de Fase 24.2: `4a9e639d26533e475c03b83a537d0aad2657de73`, merge de Fase 24.1; conserva `ed42d882c0ef6dc7a9433eedfbc8f1d3175fceca`. Es una referencia histórica de la consolidación, no un HEAD permanente de main. El entorno reproducible no cambia la versión de la aplicación.
- Fuentes funcionales 23.0: `8fbca8e80adaf99adc99089c362766beb80de82d`; Pages: `062343707cdfc54a764ca7ae18f98fd5aedfe750`. Publicación con 44 archivos: 43 fuentes y version.json. [Recibo histórico](docs/historico/FASE23_PUBLICACION.md).
- Fase 24.2: consolidación de documentación vigente, arquitectura y pendientes, con el histórico conservado por separado. Sin cambios funcionales ni publicación de la aplicación. [Entrega y verificaciones](docs/revision-fase24-2.md).
- develop sigue siendo histórico. No cambiarlo ni mezclar sus 368 rutas/acumulado con main. Conservar ramas, worktrees, respaldos y archivos sin seguimiento.

## Funciones terminadas

Registro de dos pulsaciones, partidos aislados, IndexedDB conservadora, Deshacer/vaciado, CSV por partido, Dashboard y panel versionado por partido. Google exige equipo y activa Sync automáticamente; importación de históricos confirmada y cierre protegido. Supervisión por UID/equipo, solo lectura, con revocación efectiva. [Contrato funcional](ESPECIFICACION.md) y [arquitectura](docs/arquitectura.md).

## Comandos y límites

`npm ci`, `npm test` y `npm run check`. Ver [DESARROLLO.md](DESARROLLO.md) para Node, Java, navegadores y emuladores. En cambios documentales comprobar enlaces y reutilizar evidencia; no repetir campañas completas sin motivo.

El almacenamiento del navegador puede perderse; el respaldo oculto de importación no se actualiza continuamente y CSV no se importa. Sync no sustituye un respaldo independiente. No borrar IndexedDB para diagnosticar. Los conflictos se conservan y requieren revisión, sin resolución automática por sobrescritura. La prueba visual usa Auth simulado; no acredita Google real ni Safari físico.

## Pendientes priorizados

1. Diagnóstico/recuperación y respaldo independiente si siguen siendo necesarios: requieren alcance y autorización sobre datos reales; esta fase no confirma una pérdida actual.
2. Prueba física de Supervisión en Safari/iPad y límites del dispositivo antiguo/persistencia prolongada que no quedaron acreditados. Cualquier permiso temporal exige autorización propia.
3. Editor: cancelar/deshacer el nombre de un elemento y sustituir Quitar por Eliminar. Peticiones expresas pendientes; distintas de Deshacer un tiro o cancelar el panel completo.
4. MOP-001: desplazamiento vacío, opcional y de prioridad baja.

Detalles, límites de evidencia y mantenimiento futuro en [pendientes](docs/pendientes.md). No iniciar ninguno de estos trabajos por estar anotado. Los candidatos temporales y anuncios anteriores pertenecen al [histórico](docs/historico/README.md), no al flujo vigente.
