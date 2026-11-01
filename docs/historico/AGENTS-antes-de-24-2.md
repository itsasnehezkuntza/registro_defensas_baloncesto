# Instrucciones vigentes

- Responder y documentar en español. Leer ESPECIFICACION.md y DESARROLLO.md antes de cambiar código.
- Base funcional: main 23.0. Trabajar por fases, limitarse al encargo y detenerse para revisión. No hacer commit, push ni despliegue sin autorización.
- HTML, CSS y JavaScript puro; rutas relativas compatibles con GitHub Pages. Sin frameworks ni dependencias innecesarias.
- Conservar IDs y datos históricos. No reiniciar IndexedDB; usar migraciones conservadoras, transacciones atómicas y controles de concurrencia. Guardado significa transacción completada.
- Registro en dos pulsaciones y partido activo obligatorio. Deshacer y CSV afectan solo al partido seleccionado; éxito = fallados/intentos × 100.
- Supervisión separada del motor de escritura, con permisos por UID/equipo en Firestore Rules. No ampliar permisos de propietarios.
- Usar datos ficticios y emuladores demo-defensas. No probar contra Firebase real ni almacenamiento de dispositivos del usuario.
- Ejecutar npm test y npm run check; navegador/emuladores según el cambio. Documentar resultado, límites y decisiones en la especificación.
- develop, worktrees, respaldos y archivos sin seguimiento se conservan. No limpiar ni importar herramientas históricas indiscriminadamente.
