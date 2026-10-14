# Vistas previas aisladas — Fase 6B

Estas páginas son maquetas HTML/CSS estáticas de Basketball Scout (A) y Courtside Pro (B), generadas desde la versión local de Fase 6A y el categorias.csv actual. No cargan app.js, persistencia ni exportación. Los controles y el estado Guardado son una representación visual; no registran tiros ni guardan partidos.

Abrir scout.html o courtside.html directamente en el navegador permite revisar la composición sin conexión, sin servidor y sin dependencias externas. Para reproducir las capturas con Chrome en Windows:

~~~text
node tests/diseno-fase6b/generar.mjs
node tests/servidor.mjs 8080
powershell -NoProfile -ExecutionPolicy Bypass -File tests/diseno-fase6b/capturar.ps1 -Port 8080
~~~

En la sesión de auditoría se utilizó el runtime Node de la herramienta y un servidor loopback en 8081 porque node no estaba en PATH. El runner siempre crea un perfil Chrome nuevo y trabaja solo en loopback.

- generar.mjs: construye ambas páginas con el mismo snapshot y copia base-6a.css.
- scout.css / courtside.css: estilos aislados y variables de identidad.
- vista.js: solo reserva el espacio real de la barra y mide geometría/contraste; sin almacenamiento ni lógica de registro.
- datos-ficticios.json: 87 eventos simulados, 51 fallados, 36 anotados; muestra estable compartida.
- capturar.ps1: capturas en 1180×820, 1440×900, 390×844, 1024×768, 1194×834 y 1024×620; incluye móvil desplazado. Envía Tab para comprobar el foco de teclado.

Capturas e informes: ../../.test-artifacts/fase6b-*.png y fase6b-geometria.json. AUDITORIA_DISENO.md contiene el análisis y las paletas.

Este directorio permanece bajo tests/, excluido de Git/publicación según la política actual del proyecto. No copiar estas maquetas a los archivos de producción antes de que el usuario elija una propuesta.
