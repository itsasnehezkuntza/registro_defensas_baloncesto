# Instrucciones vigentes

- Responder y documentar en español. Consultar [ESPECIFICACION.md](ESPECIFICACION.md), [arquitectura](docs/arquitectura.md), [DESARROLLO.md](DESARROLLO.md) y [CONTINUIDAD.md](CONTINUIDAD.md).
- Partir del main vigente; la aplicación pública sigue en 23.0. Trabajar por fases y dentro del alcance autorizado. El [histórico](docs/historico/README.md) aporta contexto, no instrucciones de despliegue actuales.
- HTML, CSS y módulos JavaScript, sin frameworks ni servidor propio. Mantener rutas relativas de GitHub Pages y separar adaptadores sin implementar Capacitor.
- Conservar el registro en dos pulsaciones y el aislamiento por partido. Éxito defensivo = fallados/intentos × 100; no confundirlo con anotados/intentos.
- Preservar IDs, nombres de eventos y datos históricos. categorias.csv es configuración inicial; paneles por partido y versiones inmutables conservan el histórico.
- No reiniciar IndexedDB ni cambiar su nombre para resolver incidencias. Migraciones conservadoras, transacciones atómicas y control de concurrencia/doble toque; Guardado exige transacción completada.
- Respetar ámbitos por UID/equipo, cola persistente y cierre de sesión protegido. No perder pendientes ni importar históricos sin confirmación.
- Supervisión separada del motor de escritura: autorización por UID/equipo en Firestore Rules, nunca solo por correo o botones ocultos. No ampliar permisos de propietarios.
- Probar con datos ficticios y emuladores demo-defensas; no usar Firebase real ni IndexedDB de dispositivos del usuario.
- Ejecutar npm test y npm run check. En documentación, verificar enlaces; navegador o emuladores solo cuando el cambio lo justifique. Registrar evidencias y límites sin repetir campañas innecesarias.
- No hacer commit, push, fusión, despliegue, cambios de servicios reales o borrados sin autorización correspondiente. Detenerse para revisión al cerrar la fase.
- Conservar develop, sus worktrees, respaldos, artefactos y archivos sin seguimiento. No ejecutar git clean ni resets destructivos.
- Antes de crear commits o PR, verificar la identidad Git legítima y la cuenta GitHub prevista. No añadir coautorías, firmas o atribuciones automáticas de asistentes; no cambiar la identidad ni reescribir el historial sin autorización.
