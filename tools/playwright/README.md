# Prueba visual local

La guía vigente de instalación, navegadores y emuladores está en [DESARROLLO.md](../../DESARROLLO.md).

Desde la raíz del clon:

```sh
npm ci
npm run visual:instalar
npm run test:browser
```

Se inicia un servidor efímero en 127.0.0.1:4173. Chromium prueba escritorio (1440×900), móvil (390×844) y móvil estrecho (320×740), con un perfil nuevo por prueba. Verifica inicio, partido/tiro ficticios, persistencia tras recargar, ausencia de desbordamiento y tamaño de controles. El adaptador Auth servido solo en esta prueba es simulado; no inicia Google ni Firebase real.

Informes: .test-artifacts/playwright/report/index.html; capturas y trazas: .test-artifacts/playwright/results/. `npm run visual:informe` abre el informe; `npm run visual:abrir` muestra el navegador. Las siguientes ejecuciones reutilizan las carpetas de resultados: conservar una copia si se necesita comparar informes. Navegadores, informes y node_modules quedan fuera de Git y del paquete público.

En PowerShell con scripts bloqueados, usar npm.cmd. No se requieren rutas personales ni instalaciones globales.
