# GAME DAY — Prototipos de Fase 6D

Abrir comparacion.html para ver Broadcast Desk, Tactical Board y la referencia Basketball Scout en paralelo. Abrir broadcast.html o tactical.html para revisar sus interfaces estáticas con ancho real; pueden abrirse como archivos locales, sin red.

Las maquetas no cargan app.js, persistencia, sincronización ni exportación, y no abren IndexedDB. Los controles y Guardado son estados visuales simulados. El único JavaScript del navegador mide/reserva la geometría y sirve a la auditoría; no registra tiros.

Los datos ficticios se conservan de Fase 6B y las categorías de los dos prototipos se generan leyendo el CSV local actual con los módulos puros existentes. La referencia Scout conserva su HTML/CSS anterior; la identidad y textos se verifican contra los nuevos prototipos.

~~~text
node tests/diseno-fase6d/generar.mjs
node tests/servidor.mjs 8080
powershell -NoProfile -ExecutionPolicy Bypass -File tests/diseno-fase6d/capturar.ps1 -Port 8080
~~~

En la sesión se utilizó el runtime Node de la herramienta y un servidor loopback en 8082, porque node no estaba en PATH. El runner usa perfiles Chrome nuevos, sin navegar fuera de loopback. Las capturas se guardan en ../../.test-artifacts/fase6d-*.png, el informe en fase6d-geometria.json y las huellas de producción en fase6d-integridad.json.

El directorio tests/ y .test-artifacts/ permanecen excluidos de publicación. El CSS se superpone a una copia local de Fase 6A para permitir comparación; una implementación definitiva requerirá consolidar estilos y repetir regresiones después de elección/autorización.
