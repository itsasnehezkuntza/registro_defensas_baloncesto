# CourtFlow — Prototipos aislados de Fase 6E

Abrir comparacion.html para revisar capturas reales comparables o light.html / contrast.html para ver las maquetas a ancho real. Se pueden abrir como archivos locales sin conexión.

Las páginas no cargan app.js, IndexedDB, sincronización o exportación. No registran tiros ni modifican partidos. Guardado es un estado visual ficticio. vista.js únicamente reserva geometría y expone mediciones de auditoría.

El generador lee el categorias.csv actual y usa los módulos puros existentes para las cifras; añade un span al porcentaje del HTML estático sin cambiar cálculos. La muestra determinista es la misma de las fases anteriores: 87 eventos ficticios, 51 fallados, 36 anotados.

~~~text
node tests/diseno-fase6e/generar.mjs
node tests/servidor.mjs 8080
powershell -NoProfile -ExecutionPolicy Bypass -File tests/diseno-fase6e/capturar.ps1 -Port 8080
~~~

En la sesión se utilizó el runtime Node de la herramienta y loopback 8083, porque node no estaba en PATH. El runner crea un perfil Chrome nuevo.

CSS común: courtflow.css; variantes: light.css y contrast.css. base-6a.css es una copia de la base local para comparar sin tocar producción; una versión definitiva deberá consolidar estilos. Fuentes locales, sin dependencias ni recursos externos.

Capturas ../../.test-artifacts/fase6e-*.png; informe fase6e-geometria.json; protección de runtime fase6e-integridad.json. Directorios tests/ y .test-artifacts/ excluidos de publicación. No copiar estilos a producción antes de elección/autorización.
