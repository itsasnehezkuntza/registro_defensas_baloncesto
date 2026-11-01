# Fase 13 — M5: aislar la cola bloqueada y seguir recibiendo

Fecha: 20 de octubre de 2026. Rama local `develop`. **M5 corregido; Fase 13 completada y detenida para revisión.** Fases anteriores conservadas; sin commit, push o despliegue. Copia previa: `.local-backups/fase13-cola-20261020/`.

## Resultado

Una operación bloqueada ya no impide recibir cambios ni enviar los de otros partidos. Se conservan la operación, su error, número de intentos y datos locales; no se simula un acuse. El aviso permanece hasta que realmente se resuelva.

Se retienen todas las escrituras del partido afectado, incluidas las que dependan de una operación en espera de reintento. Esta decisión conserva el orden de alta del partido→tiros y lápidas→altas. No se promete que los tiros posteriores del mismo partido suban mientras exista el bloqueo; siguen guardados localmente. Un fallo transitorio pausa los demás envíos del ciclo, pero permite intentar la recepción.

Si el bloqueo es un conflicto de identidad ya conocido, incorporar la versión remota de ese ID también abortaría el lote entero. Ahora se aparta ese tiro remoto o, si el conflicto es de cabecera/alta/eliminación, ese partido remoto. Se conservan ambas versiones sin elegir ni sobrescribir una, y se incorporan los cambios compatibles. Los conflictos entrantes desconocidos y errores reales de lectura/autorización siguen siendo errores; esta mejora no concede permisos ni resuelve conflictos automáticamente.

Las escuchas de Fase 11 se mantienen ante errores individuales de escritura. Una recepción correcta con cola bloqueada conserva «Error de sincronización» y el aviso del perfil. «Reintentar» vuelve a intentar las operaciones; si el conflicto persiste vuelve a quedar bloqueado.

## Cambios

- `js/sync-engine.js`: aislamiento por partido, recepción después de fallos de envío, filtrado de identidades con conflicto conocido y estado final fiel a la cola.
- `js/sync-storage.js`: `failOperation()` devuelve el registro fallido tras completarse la transacción, reutilizando la clasificación de errores anterior. Ningún cambio de esquema o campos guardados.
- `tools/firebase/blocked13.test.mjs`: nueva matriz de pruebas invocada desde `sync.test.mjs`.

No cambian interfaz, diseño, estadísticas, dos pulsaciones, configuración deportiva, CSV, ID de eventos ni documentos remotos. No se modifican reglas ni datos reales.

## Verificación

Comando principal: `node tools/firebase/emuladores.mjs sync`. SDK oficial, IndexedDB real y dos contextos efímeros en `demo-defensas`. Se amplía la batería existente con seis grupos:

1. Conflicto real de tiro: local/remoto conservados; otro partido se envía y el tiro posterior del partido conflictivo espera.
2. Recepción automática en el mismo partido bloqueado, sin forzar ciclos/recarga; aviso persistente, sin más intentos ni reapertura de escuchas.
3. Recarga y «Reintentar»: bloqueo duradero, sin sobrescribir ni marcar falsamente sincronizado.
4. Denegación individual inyectada únicamente en el envío: alta bloqueada retiene al hijo; otros envíos y recepciones continúan; al retirar el fallo y reintentar llegan padre e hijo una vez. No se presenta como prueba de revocación de reglas de lectura: las reglas del emulador permanecen intactas.
5. Lápida en espera retiene el alta del tiro, que no llega a crearse ni resucita al reintentar.
6. Conflicto real de cabecera de partido: se conservan las dos versiones, esperan sus hijos y se siguen recibiendo otros partidos.

**Resultado final: 30 grupos correctos**, incluidos los seis nuevos. Recibo `.test-artifacts/firebase/sync.json` con `ok: true` y `realWrites: 0`. La batería conserva las regresiones de datos, cuentas, UI y temporada 30×70 de las fases anteriores.

Regresiones adicionales correctas: `startup12.test.mjs` (siete grupos M4, sin solicitudes externas), `watch.test.mjs` (incluida temporada 30×70 y 120 ciclos sin consultas), `cuenta.test.mjs`, sintaxis del motor/almacenamiento y empaquetado estático local con 36 archivos, sin publicar.

## Límites y continuación

La operación conflictiva no se elimina automáticamente ni se descarta el dato local. La resolución del contenido conflictivo y una interfaz para elegir versiones no forman parte de M5. Si el servidor deniega realmente la lectura, no se puede recibir hasta recuperar permisos. Un partido cuya cabecera esté en conflicto no se incorpora desde remoto mientras dure ese conflicto.

Siguiente punto propuesto tras revisión: M6 (configuración del panel entre dispositivos). No se inicia aquí. Siguen pendientes las decisiones de cuenta, CSP, dominio temporal, Safari/iPad físico, consolidación y publicación.
