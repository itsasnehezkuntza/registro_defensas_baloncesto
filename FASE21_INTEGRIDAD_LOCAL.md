# Fase 21 — Integridad transaccional del panel local

29 de octubre de 2026. Implementada y verificada localmente; detenida para revisión. Sin commit, push ni publicación.

## Base y conservación del trabajo anterior

- Rama conservada: `develop`, HEAD `7c439c149ad2bbe4e71749260e8b9d10f45c0d83`. Ya tenía numerosos cambios y archivos sin seguimiento, incluidos los módulos del editor y de configuración guardada.
- Base de aplicación: fuentes 20.0 `86cf6177e380e6100b274d3c07c031ffc1bf6083` y referencia Pages `origin/gh-pages` `647aeb55d8738e04dbb785e9ca652bcb64529cd0`, disponibles localmente. Sus 37 archivos de aplicación, excluidos `.nojekyll` y `version.json`, coinciden byte por byte con la aplicación local previa a esta fase. Se contrastaron las referencias locales; no se consultó ni modificó el servicio publicado.
- `main` local sigue en `d98bee5`; no se usa como base ni se intenta resolver su divergencia.
- Procedimiento seguro sin cambiar ramas: respaldo previo de los 361 caminos versionados/sin seguimiento (incluida la ausencia previa de `premium.css`), hashes SHA-256, estado Git y diff binario en `.local-backups/fase21-integridad-20261029/`. Modificación puntual sobre esa copia verificada del estado de trabajo. Los resultados generados por pruebas en documentos anteriores se restituyen desde ese respaldo, conservando sus bytes originales.
- Git final: mismo HEAD y rama; 32 archivos modificados, una eliminación previa y 165 sin seguimiento (163 previos y los dos nuevos de esta fase), nada preparado para commit. La comparación SHA-256 contra el respaldo detecta únicamente `js/configuracion-guardada.js` y `ESPECIFICACION.md` modificados entre los caminos previos. Recibos y diff exclusivo de esta fase en `.test-artifacts/firebase/fase21/`, incluidos `conservacion.json`, `git-status-final.txt`, `aplicacion.patch` y `especificacion.patch`.

## Defecto y corrección

`saveButtonConfiguration()` comprobaba revisiones y guardaba el panel local usando solamente `settings`. La comprobación del editor no protegía a quien llamara directamente a persistencia ni la ventana entre comprobar y escribir. La comprobación transaccional existente solo se ejecutaba en el ámbito sincronizado.

Ahora, al guardar para un `gameId` local, la misma transacción IndexedDB `readwrite` incluye `games`, `events` y `settings`. Tras comprobar revisión e IDs:

1. Lee el partido y aplica `guardLegacyGame`, la protección ya utilizada por el resto de mutaciones locales. En bases v2, `transact()` añade automáticamente `syncMeta` para esa protección; no se introduce otro almacén ni esquema.
2. Rechaza la ausencia/eliminación con `GAME_NOT_FOUND` y cuenta los eventos mediante el índice existente `events.byGameId`. Si existen, aborta con `HAS_EVENTS`.
3. Solo sin tiros escribe versión, configuración vigente y asociación del partido. La promesa y la notificación de configuración se completan después de `tx.oncomplete`. Ante aborto o error se revierte todo.

Los registros y eliminaciones usan los mismos almacenes, por lo que IndexedDB serializa las operaciones concurrentes. Si el tiro o la eliminación van primero, el guardado se rechaza. Si la edición va primero sobre un partido vacío, se confirma y la operación posterior sigue el comportamiento vigente. Las comprobaciones previas de estadísticas permanecen fuera de la transacción; la decisión de permitir el cambio del panel utiliza la lectura de eventos dentro de ella. No se añaden esperas ajenas a IndexedDB dentro de la transacción.

Se conserva el guardado de plantilla sin `gameId`, el camino sincronizado, los eventos, los IDs, el CSV, Deshacer y la interfaz. `editor.js` ya presenta `error.message`, mantiene el borrador descartable y no ejecuta `onSaved` ante rechazo: la prueba del editor real confirma ese comportamiento sin modificar su código. El mensaje es «Este partido ya tiene tiros: su panel no se puede cambiar».

## Reproducción y pruebas nuevas

Desde la raíz, con las dependencias y navegadores de prueba ya disponibles:

```powershell
node tools/firebase/panel-local21.test.mjs --baseline
node tools/firebase/panel-local21.test.mjs
```

El primer comando sirve exclusivamente el módulo original `js/configuracion-guardada.js` del commit local `86cf617`; no sustituye ningún archivo. Reproduce en Chromium y WebKit:

```text
accepted=true, events=1, newPanel=CAMBIO CON TIRO
```

El segundo prueba el código corregido: `accepted=false`, `code=HAS_EVENTS`, versiones/asociaciones/eventos exactamente iguales al estado anterior. **42 grupos correctos** en Chromium y WebKit: diez por cada combinación de motor/esquema v1 o v2, y un grupo adicional de editor real por motor.

Se cubren guardado válido y recarga, partido con tiros, inexistente/eliminado, rollback por aborto explícito y por petición IndexedDB fallida (`ConstraintError` real), históricos intactos, Deshacer tras recargar, estadísticas y CSV con BOM idénticos ante rechazo. El editor recibe un tiro después de su comprobación previa, muestra el rechazo, permite descartar el borrador y recupera el original y el tiro al recargar. Cero errores JavaScript y cero solicitudes externas en estos contextos.

**Concurrencia:** dos páginas con conexiones independientes y la misma base IndexedDB del contexto efímero. Se fuerza la prelectura vacía del guardado, se encola el tiro/eliminación en la otra conexión y se libera la primera lectura; después se comprueba el rechazo. También se retiene la transacción de guardado ya creada, se encola la mutación contraria y se comprueba que el guardado sigue pendiente hasta liberar su transacción. Son cuatro órdenes por motor/esquema, **16 casos**, con almacenamiento real. Las barreras mantienen vivas únicamente transacciones de prueba mediante peticiones IDB; no sustituyen ni simulan la persistencia. No se necesita acertar una carrera manual.

Recibos: `.test-artifacts/firebase/fase21/baseline.json` y `regresion.json`.

## Regresiones ejecutadas

| Comando | Resultado |
| --- | --- |
| `node --test tests/*.test.mjs tools/firebase/cuenta.test.mjs` | 11 archivos correctos: configuración, panel, identidad/históricos, registro, estadísticas, matriz, dashboard, CSV, integración y cuenta. |
| `node tools/firebase/local-browser.mjs` | Fases 2, 3, 5, 6 y 10; persistencia, doble toque, aislamiento, fallos, inicio, siete tamaños, CSV y subruta Pages correctos. |
| `node tests/diseno-v4/editor.mjs` | Siete grupos correctos: migración conservadora, históricos v1, editor, bloqueo/Deshacer, panel por partido, conflictos entre pestañas, límites y responsive. |
| `node tools/firebase/editor19.test.mjs` | Cursor, foco, escritura pausada y guardado/recarga correctos en Chromium y WebKit. |
| `node tools/firebase/emuladores.mjs sync` | 40 grupos correctos en Auth/Firestore Emulator `demo-defensas`, incluidos los paneles M6 y la edición real desde la interfaz sincronizada con recepción en otro dispositivo; cero escrituras reales. |

No se observaron errores JavaScript inesperados. Node emite el aviso previo `MODULE_TYPELESS_PACKAGE_JSON`; no se cambia `package.json` para eliminarlo.

## Alcance y límites

- Único archivo de aplicación modificado en esta fase: `js/configuracion-guardada.js`. Se añaden la prueba anterior y este documento; se añade únicamente una nota vigente a `ESPECIFICACION.md`.
- Datos deportivos reales no abiertos, alterados ni borrados. Las comparaciones de históricos son sobre datos ficticios, incluidos registros heredados sin IDs de las regresiones existentes. No se ha inspeccionado la base del usuario para afirmar su contenido.
- Sin cambio de versión/esquema IndexedDB, migraciones, nuevas dependencias, diseño o reglas. Google y Firestore de producción no se ejercitan. Los clientes públicos todavía conservan el defecto hasta una futura publicación autorizada.
- No se repiten pruebas físicas Safari/iPad ni Firebase real: el cambio está localizado en persistencia local; WebKit real de pruebas, IndexedDB v1/v2 y regresiones de Sync en emuladores cubren el alcance técnico. No equivalen a una prueba física de Safari.
- No se limpian asociaciones históricas que pudiera dejar una eliminación ya existente ni se reparan paneles previamente incoherentes: esta fase impide nuevas escrituras inválidas. En el orden edición válida→eliminación posterior se conserva el comportamiento existente de eliminación y conservación de versiones.
- No se inicia la siguiente fase. Pendientes: revisión del usuario y, si se autoriza posteriormente, preparación de commit/publicación.
