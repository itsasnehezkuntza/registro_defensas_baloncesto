# Fase 7 · maqueta para revisión

13 de octubre de 2026. Maqueta HTML/CSS aislada, exclusivamente de consulta. No carga JavaScript en el navegador, no abre IndexedDB ni importa la aplicación. No implementa navegación o conexión al partido activo. Los datos son ficticios y nunca se insertan en almacenamiento.

Abrir `index.html` para explorar la distribución responsive. Abrir `revision.html` para comparar las capturas. Ambos permiten apertura directa desde archivos; todos sus recursos tienen rutas relativas y no requieren internet.

## Propuesta visual

- A: resumen de Transición, Estático y Bloqueo directo con barras; éxito global y puntos en una única banda grafito.
- B y C: acciones de Transición y ranking de Estático a la izquierda.
- D: ranking de estrategias de Bloqueo directo a la derecha, con más espacio, barras gruesas y porcentajes mayores. En móvil: A → B → C → D, con desplazamiento vertical.
- Barras apiladas al 100%: verde = fallados rival; rojo = anotados rival. Sus segmentos representan fallados/intentos y anotados/intentos. La anchura total común permite comparar eficacia; el número de intentos expresa el volumen y nunca se oculta.
- Valores accesibles en texto, sin hover, sin depender solo del color, sin gráficos circulares, animaciones, tablas ni controles ficticios de guardado.

## Datos y decisiones propuestas

Los nombres e IDs se leen del `categorias.csv` actual al generar. `generar.mjs` emplea el resumen puro existente y crea eventos exclusivamente en memoria; `muestra.json` documenta esos eventos ficticios para poder comprobar el origen de las cifras. No es una opción de exportación del producto.

Muestra: **69 intentos · 37–32 · 54% · 71 puntos concedidos**. El total global se calcula desde los eventos, sin promediar porcentajes de grupos. Todos los tipos de bloqueo contribuyen a las estrategias mediante `defensa_id`.

- Rankings ascendentes por fracción exacta fallados/intentos; porcentaje presentado como entero. Cero intentos al final, guion y barra vacía.
- Transición conserva el orden del CSV. Empates de ranking conservan el orden de configuración.
- Distintivos solo entre filas del mismo grupo con ≥5 intentos. Se necesitan al menos dos filas elegibles con porcentajes distintos para mostrar mejor/peor. Empates en los extremos comparten distintivo; si todas las elegibles empatan, no hay distintivos. Esta política queda propuesta para revisión.
- Las filas con 1–4 intentos conservan porcentaje y posición de ranking, acompañados de «Muestra pequeña», sin distintivos. Blue tiene 100% con un intento: White, con 70% y diez intentos, es la mejor **entre las muestras elegibles**.
- Muestras sin intentos: Tut y Bajo aro de Estático. Siempre muestran 0 intentos y —.

## Verificación

Capturas reales de Chrome headless con perfil nuevo, mediante emulación de viewport, sin dispositivos físicos:

| Tamaño | Resultado |
| --- | --- |
| 1180×820 y 1024×768 | Las cuatro zonas y el pie caben sin desplazamiento; sin desbordamiento horizontal. |
| 390×844 y 320×740 | Secciones apiladas, sin desbordamiento horizontal; acceso al ranking por desplazamiento. |

Capturas en `../../.test-artifacts/fase7/`: `dashboard-1180-820.png`, `dashboard-1024-768.png`, `dashboard-390-844.png`, `dashboard-320-740.png`, `dashboard-movil-completo.png` y `dashboard-movil-bloqueo.png`. Revisión visual realizada en iPad y móvil. Informe de geometría, orden, valores y recursos: `verificacion.json`. Comprobación de segmentos, proporciones, vacíos, muestras pequeñas y orden: sin incidencias. Huellas SHA-256 de los 12 archivos de producción idénticas al inicio, en `integridad.json`.

No se ejecutan regresiones de persistencia o CSV: no se han cambiado ni cargado sus módulos desde la maqueta. Pendiente validar la dirección en Safari/iPad físico y decidir si el tamaño de texto secundario es suficiente en uso real; no se afirma una mejora de tiempo de lectura medida.

## Reproducción

Con Node moderno, desde la raíz del proyecto:

```text
node tests/dashboard-fase7/generar.mjs
node tests/servidor.mjs 8087
```

En otra terminal, con Chrome instalado en la ruta del script:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tests/dashboard-fase7/capturar.ps1
```

Los archivos de esta carpeta y las capturas están excluidos de Git/publicación por las reglas existentes. No se han realizado commit, push ni despliegue. La siguiente tarea requiere revisión de esta maqueta y autorización de implementación. La integración posterior deberá respetar partido activo, configuración e histórico sin escribir ni modificar eventos.
