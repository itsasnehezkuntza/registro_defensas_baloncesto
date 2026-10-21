# Mejoras opcionales

Estas mejoras no bloquean el cierre funcional ni la publicación. Quedan anotadas para valorar más adelante; su registro no autoriza implementarlas.

## MOP-001 — evitar desplazamiento cuando no hay contenido debajo

- **Solicitud:** al probar en el iPad, el usuario propone bloquear el deslizamiento vertical o rebote si toda la pantalla ya cabe y no hay más contenido que ver.
- **Prioridad:** baja, no fundamental. El usuario indica expresamente que puede dejarse para más adelante.
- **Estado:** anotada, sin implementar.
- **Criterio para una futura revisión:** evitar el desplazamiento vacío cuando todo cabe, conservando el desplazamiento necesario si hay contenido fuera de pantalla, especialmente en móvil, al girar el dispositivo o al ampliar texto. Comprobarlo en Safari/iPad real.
- **Distinción:** la corrección de Fase 18 que impide revelar el Registro debajo del inicio ya está implementada y aceptada. Esta propuesta es un refinamiento adicional del desplazamiento cuando no hay más contenido.

Registrada el 20 de octubre de 2026. Sin cambios de código, datos o despliegue.
