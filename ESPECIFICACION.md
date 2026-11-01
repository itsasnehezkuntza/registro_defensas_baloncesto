# Especificación vigente — versión 23.0

Se describe el comportamiento de la versión pública 23.0, sin implementar funciones nuevas. El commit `4a9e639d26533e475c03b83a537d0aad2657de73` es la referencia de partida de la consolidación documental 24.2, no un HEAD permanente de main. La cronología completa se conserva en la [especificación anterior](docs/historico/ESPECIFICACION-antes-de-24-2.md).

## Alcance y experiencias

Aplicación estática para registrar tiros del rival en dos pulsaciones: acción/defensa y resultado. Transición, Estático y Bloqueo directo comparten una página; Estadísticas consulta el partido activo. No hay estadísticas de temporada ni exportación JSON/XLSX.

El entrenador registra sin cuenta o con Google y equipo propio. El supervisor consulta equipos asignados desde supervision.html, sin motor de escritura. Una misma cuenta puede ser propietaria de unos equipos y lectora de otros; cada permiso se evalúa por equipo.

## Partidos, registro y guardado

- Crear exige jornada y rival, genera un ID único y selecciona el partido. Los nombres pueden repetirse; jornada y rival no se editan después. Se restaura la última selección válida.
- Sin partido activo no se registra. Cada combinación admite solo sus tiros configurados de 2/3 puntos. La selección se consume al registrar para impedir dobles toques; un fallo previo a confirmar conserva el reintento del tiro.
- Deshacer afecta exclusivamente al último evento persistido del partido activo, también tras recargar. El orden persistente no depende de la hora del dispositivo.
- Eliminar pide confirmación e identifica el partido; solo elimina ese partido y sus eventos del ámbito correspondiente. Vaciar conserva el partido y quita sus tiros, con confirmación y opción de exportar antes.
- Vaciar compara los eventos revisados dentro de la transacción; si otra pestaña o dispositivo los cambia, no borra parcialmente. En nube, eliminaciones y Deshacer usan lápidas para evitar resurrecciones.
- Guardado local significa transacción completada. Ante fallo no se anuncia éxito; el reintento conserva la identidad del tiro para evitar duplicados. Guardado local y Sincronizado son estados distintos.

Fuentes: [persistencia](js/persistencia.js), [registro](js/registro.js), [almacenamiento sincronizado](js/sync-storage.js); [pruebas de registro](tests/registro.test.mjs) e [integración](tests/integracion.test.mjs).

## Configuración, paneles e identidad histórica

`categorias.csv` define la configuración inicial: `categoria_id;categoria;accion_id;accion;defensa_id;defensa;tiros`. IDs estables, nombres coherentes por ID y combinaciones únicas; defensa vacía en acciones simples y obligatoria en directo. Renombrar o retirar una opción nunca reescribe ni elimina eventos existentes. Los IDs retirados no se reutilizan.

Cada partido conserva su panel. El editor se abre sobre Registro; Hecho guarda una versión inmutable y actualiza la plantilla para partidos nuevos. Cancelar protege los cambios no guardados; no equivale a una cancelación individual del nombre. Quitar retira el botón, manteniendo sus tiros históricos. El nombre admite hasta 40 caracteres; los límites actuales son 12 acciones por sección simple, 8 tipos y 12 defensas. Cada lista mantiene al menos un elemento y añadir también depende de que el panel quepa en los tamaños de referencia. Los [ajustes de nombres pendientes](docs/pendientes.md) no están implementados.

Un partido con tiros no admite cambio de panel. Se comprueba dentro de la transacción, junto con la existencia del partido y la revisión base. Vaciar o deshacer todos los tiros permite editar de nuevo. La edición no cambia paneles de otros partidos ya existentes.

Sin cuenta, un partido vacío que sigue el CSV recoge cambios del archivo; un panel editado queda fijo. En equipo sincronizado, el snapshot del partido queda fijo también si procede del CSV y aún no tiene tiros. Una configuración inválida bloquea el registro y conserva los datos; la exportación del activo sigue disponible si funciona el almacenamiento.

Fuente: [configuración guardada](js/configuracion-guardada.js), especialmente versionForGame y saveButtonConfiguration; [editor](js/editor.js), [validación de CSV](js/configuracion.js), [pruebas del panel](tests/configuracion-guardada.test.mjs). Límites y concurrencia: [arquitectura](docs/arquitectura.md).

## Estadísticas y presentación

Los totales, matrices, rankings y desglose usan solo eventos del partido activo, incluidos históricos retirados o desconocidos. Registro y Dashboard muestran **anotados/intentos**; el éxito defensivo es **fallados/intentos × 100**, redondeado para mostrarlo. Por ejemplo, cuatro fallados y dos anotados son 2/6 y 67 % de éxito. Sin intentos se muestra un guion.

Puntos concedidos = suma del valor real de los tiros anotados; puntos intentados = suma del valor real de todos los tiros. No mezclar estos puntos con el número de aciertos/intentos. El desglose muestra intentos, fallados, aciertos y puntos. Mejor/A mejorar requieren al menos cinco intentos; los empates conservan las reglas del modelo y el orden de configuración.

El Dashboard conserva ejes históricos y no escribe datos deportivos. La utilidad outcomeText aún representa fallados/aciertos para sus consumidores; no define el marcador visible actual. La selección de desglose se limpia al cambiar de partido o recargar. El diseño táctil se adapta al tamaño; la emulación no acredita todos los dispositivos físicos.

Fuente: [Dashboard](js/dashboard.js), [render del Registro](app.js), [estadísticas](js/estadisticas.js); [pruebas de Dashboard](tests/dashboard.test.mjs), [matriz](tests/matriz.test.mjs) y [presentación V4](tests/diseno-v4.test.mjs).

## Exportación CSV

Solo se exporta el partido seleccionado al iniciar la operación, con lectura coherente de partido/eventos y orden por seq. Un partido vacío produce cabeceras. Incluye IDs, contexto del partido, nombres originales, resultado, valor del tiro y datos para análisis; los IDs conocidos de eventos antiguos se deducen sin reescribirlos.

UTF-8 con BOM, separador punto y coma, filas CRLF, campos entre comillas y comillas interiores duplicadas. Se neutralizan fórmulas en campos editables al exportar. El nombre del archivo sanea jornada, rival e ID. CSV sirve para análisis: la aplicación no lo importa para restaurar una base.

Fuente: [exportación](js/exportacion.js), [identidad histórica](js/identidad.js) y [pruebas de CSV](tests/exportacion.test.mjs).

## Cuenta, equipos y sincronización

Sin cuenta se trabaja con IndexedDB del navegador. Con esa elección recordada no se carga Auth ni Firestore. La pantalla de inicio sí prepara el SDK para abrir Google desde un toque; al restaurar una cuenta también se carga. Son contextos distintos, no una promesa de cero red en todo arranque.

Con Google se prepara Sync automáticamente y se exige equipo antes de registrar. Sin equipos se pide nombre y alta explícita; con uno se selecciona tras validar; con varios se recupera la preferencia válida del UID o se solicita elección. La caché de un equipo previamente configurado permite reanudar offline; no concede permisos remotos ni oculta una revocación detectada.

Entrar, crear equipo o actualizar no sube históricos automáticamente. Revisar partidos locales presenta destino y partidos antes de confirmar. Importar es idempotente para ese plan/destino, conserva IDs, paneles y originales como respaldo oculto. Un original ya incorporado no se importa a otro equipo. No se deduplica por rival/jornada ni se fusionan bases de dispositivos automáticamente.

Cerrar sesión no ofrece Salir igualmente. Con cambios pendientes permite esperar o cancelar según el estado; con históricos locales de la cuenta pide revisión. La purga protegida vuelve a comprobar dentro de su transacción que no queden datos sin sincronizar. Si la identidad cambia externamente, los pendientes permanecen vinculados al UID original y no se atribuyen a otra cuenta. Tras cierre limpio se retiran copias locales propias de la cuenta, conservando originales importados, partidos sin cuenta y la preferencia de equipo. No se borra la nube.

La cola persiste con el cambio deportivo en una misma transacción. Reintenta al recuperar conexión; un conflicto conserva los datos y bloquea el partido afectado sin detener toda la recepción. Reintentar no fuerza una sobrescritura. Detalle: [arquitectura](docs/arquitectura.md).

Fuente: [UI de cuenta](js/cuenta-ui.js), [UI de Sync](js/sync-ui.js), [almacenamiento](js/sync-storage.js); escenarios existentes en [cuentas/equipos](tools/firebase/account22.test.mjs) y [sincronización](tools/firebase/sync.test.mjs).

## Supervisión y seguridad

El acceso exige UID autenticado no anónimo y permiso activo por equipo. Un supervisor descubre exclusivamente su subcolección de asignaciones; obtiene cabeceras de esos equipos y partidos del equipo elegido. Los eventos consultados son los del partido seleccionado. No enumera globalmente todos los equipos.

La entrada de supervisión reutiliza Dashboard y proyecciones puras, sin IndexedDB deportivo, outbox ni transporte de escritura. No permite registrar, editar, deshacer, vaciar, eliminar o exportar desde esa vista. Firestore Rules impide escrituras deportivas por el mero permiso de lector; ocultar botones no es la autorización.

Revocar impide nuevas lecturas autorizadas; cuando se detecta, la UI limpia la selección y el Dashboard. Cambios de identidad, desconexión o página oculta invalidan respuestas pendientes y exigen revalidar. No se puede retirar una captura o información ya recibida legítimamente.

Contrato, asignación y revocación: [supervisión](docs/supervision.md). Reglas efectivas: [firestore.rules](firestore.rules); [lector](js/supervision-reader.js), [UI](js/supervision-ui.js), [pruebas unitarias](tests/supervision-reader.test.mjs) y [batería específica](tools/firebase/supervision23.test.mjs).

## Mantenimiento documental

Instalación y comandos: [DESARROLLO.md](DESARROLLO.md). Estado y límites: [CONTINUIDAD.md](CONTINUIDAD.md). La [revisión de Fase 24.2](docs/revision-fase24-2.md) registra inventario, contradicciones resueltas con evidencia y conservación. La organización documental conserva los contratos de 23.0 y no modifica código, reglas, dependencias o comportamiento. Los cambios reales y los despliegues requieren su autorización específica.

La [CI básica de Fase 24.3](docs/ci-github-actions.md) documenta el workflow, su alcance y sus límites. Los resultados de Actions deben corresponder a ejecuciones verificables; la validación local no acredita una ejecución remota.
