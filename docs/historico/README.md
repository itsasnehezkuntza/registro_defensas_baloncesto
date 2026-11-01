# Histórico técnico y documental

Archivo de la documentación existente en main `4a9e639d26533e475c03b83a537d0aad2657de73`, separado durante Fase 24.2. **Sus estados de candidato, publicación pendiente y autorizaciones son históricos.** No ejecutar instrucciones administrativas antiguas como si fueran actuales. Volver a [README vigente](../../README.md), [especificación](../../ESPECIFICACION.md) o [continuidad](../../CONTINUIDAD.md).

## Conservación y originales

Se conservan completos 31 informes de fase y los cinco documentos principales anteriores. Solo se adaptaron rutas relativas de enlaces. Tres enlaces ya ausentes en un clon limpio se muestran como código literal, sin simular que el documento o recibo exista. [Inventario y excepciones](../inventario-documental.md).

[trazabilidad.json](trazabilidad.json) registra origen, destino, hashes SHA256 de texto normalizado a LF y sustituciones reversibles. Al invertir únicamente esas sustituciones se recupera el contenido exacto del blob original de Git; la normalización de finales de línea hace la comprobación portable entre Windows y Linux. El respaldo local de los 51 Markdown originales está fuera del repositorio, en las evidencias ignoradas de esta fase; no es requisito para usar las herramientas vigentes.

## Documentos principales anteriores

| Documento original | Copia íntegra con enlaces adaptados |
|---|---|
| README.md | [README-antes-de-24-2.md](README-antes-de-24-2.md) |
| AGENTS.md | [AGENTS-antes-de-24-2.md](AGENTS-antes-de-24-2.md) |
| ESPECIFICACION.md | [ESPECIFICACION-antes-de-24-2.md](ESPECIFICACION-antes-de-24-2.md) |
| CONTINUIDAD.md | [CONTINUIDAD-antes-de-24-2.md](CONTINUIDAD-antes-de-24-2.md) |
| DESARROLLO.md | [DESARROLLO-antes-de-24-2.md](DESARROLLO-antes-de-24-2.md) |

AGENTS-antes-de-24-2.md se conserva como evidencia; las instrucciones aplicables son las de la raíz vigente. La especificación anterior contiene los 79 apartados y la cronología completa, incluidos prototipos y decisiones sustituidas.

## Decisiones que siguen vigentes

| Tema | Dónde localizar la decisión original | Contrato actual |
|---|---|---|
| IDs estables, eventos históricos y CSV | Especificación anterior, apartados 4–9, 20 y 33–38 | [Especificación](../../ESPECIFICACION.md) |
| Panel por partido, bloqueo con tiros y seguimiento del CSV | Apartados 46–52; Fases 14 y 21 | [Panel y atomicidad](../arquitectura.md) |
| Transacciones, migración v1→v2, cola, lápidas y conflictos | Apartados 14–17, 42 y 60–64 | [Almacenamiento y Sync](../arquitectura.md) |
| Originales importados como respaldo oculto y preferencia de equipo | Apartado 66, decisión aceptada; cierre protegido posterior en Fase 22 | [Cuenta e importación](../../ESPECIFICACION.md) |
| SDK en inicio y cero red con elección local recordada | Apartado 67, decisión aceptada | [Cuenta](../../ESPECIFICACION.md) |
| Supervisión por UID/equipo, sin ampliar escrituras | Apartados 76–78 y documentos Fase 23 | [Supervisión vigente](../supervision.md) |
| Cancelación individual de nombre, Quitar/Eliminar y MOP-001 | Apartados 72 y 74; documento de mejoras opcionales | [Pendientes](../pendientes.md) |

## Informes de fase

- [Fase 8A — Google y arquitectura de sincronización](FASE8A_FIREBASE.md).
- [Fase 8A.1 — Conexión y validación de Firebase real](FASE8A1_VALIDACION_REAL.md).
- [Fase 8B — Sincronización segura entre dispositivos](FASE8B_SINCRONIZACION.md).
- [Fase 8B.1 — Resultados de la validación real](FASE8B1_RESULTADOS.md).
- [Fase 8B.1 — Validación controlada con Firebase real](FASE8B1_VALIDACION_REAL.md).
- [Fase 8B.2 — Parpadeo, seguridad y preparación de Safari/iPad](FASE8B2_REVISION.md).
- [Fase 8B.3 — Vista previa temporal para Safari/iPad](FASE8B3_PREVIEW.md).
- [Fase 8B.4 — Diagnóstico de actualización automática en Safari/iPad](FASE8B4_DIAGNOSTICO.md).
- [Fase 8B.5 — Diagnóstico controlado en Safari físico](FASE8B5_DIAGNOSTICO_FISICO.md).
- [Fase 8B.6 — Incorporación remota controlada en Safari/iPad](FASE8B6_INCORPORACION_REMOTA.md).
- [Fase 8B.7 — Validación de estabilidad en Safari físico](FASE8B7_ESTABILIDAD_SAFARI.md).
- [Fase 8C — Primera versión interna con sincronización](FASE8C_PUBLICACION.md).
- [Fase 10 — Auditoría de datos y cuenta](FASE10_AUDITORIA.md).
- [Fase 11 — Cierre de A3: lecturas de sincronización](FASE11_LECTURAS.md).
- [Fase 12 — M4: restaurar la sesión antes de registrar](FASE12_ARRANQUE.md).
- [Fase 13 — M5: aislar la cola bloqueada y seguir recibiendo](FASE13_COLA.md).
- [Fase 14 — M6: panel sincronizado entre dispositivos](FASE14_PANEL.md).
- [Fase 15 — B7: política de seguridad de contenido](FASE15_CSP.md).
- [Fase 16 — B4: retirada del dominio temporal de Authentication](FASE16_DOMINIO.md).
- [Fases 17A–17B — prueba física en Safari/iPad](FASE17_IPAD.md).
- [Fase 18 — inicio independiente y carga de Google acotada](FASE18_INICIO_IPAD.md).
- [Fase 19 — cursor estable al nombrar una defensa](FASE19_CURSOR_EDITOR.md).
- [Fase 20 — publicación general de lo terminado](FASE20_PUBLICACION.md).
- [Fase 21 — Integridad transaccional del panel local](FASE21_INTEGRIDAD_LOCAL.md).
- [Fase 22.1 — Validación física previa a publicación](FASE22_1_VALIDACION_IPAD.md).
- [Fase 22 — Google, equipo y sincronización automática](FASE22_CUENTAS.md).
- [Publicación conjunta de Fases 21 y 22 — versión 22.0](FASE22_PUBLICACION.md).
- [Fase 23.1 — Revisión final y preparación de publicación](FASE23_1_REVISION_PUBLICACION.md).
- [Fase 23.2 — Publicación controlada de supervisión 23.0](FASE23_PUBLICACION.md).
- [Fase 23 — Administración y supervisión de equipos](FASE23_SUPERVISION.md).
- [Fase 24.1 — Entorno reproducible desde main 23.0](FASE24_1_ENTORNO.md).

## Reproducción histórica

Los documentos registran la evidencia disponible entonces, incluidos fallos y límites. Un recibo local no versionado no se vuelve a generar para aparentar una prueba antigua. Las herramientas que fijan un HEAD, una rama Pages, una ruta de candidato o un protocolo retirado deben estudiarse en su referencia histórica, no ejecutarse contra la base actual o Firebase real. [DESARROLLO.md](../../DESARROLLO.md) delimita el flujo de pruebas vigente.
