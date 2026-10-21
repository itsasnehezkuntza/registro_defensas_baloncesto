# Fase 16 — B4: retirada del dominio temporal de Authentication

Fecha: 20 de octubre de 2026. **B4 cerrado y verificado; fase detenida para revisión.** El usuario autoriza con «Vamos allá» después de proponer revisar y retirar el dominio temporal. Esta fase sí realiza el cambio autorizado en Authentication real; no publica la aplicación ni cambia reglas o datos deportivos.

## Cambio realizado

Proyecto `registro-defensivo`. Se retira exclusivamente:

`registro-defensivo--ipad-8b2-40nbq9cf.web.app`

La consulta administrativa de Hosting devuelve que el canal `ipad-8b2` ya no existe. El registro del despliegue original indicaba caducidad el 18 de octubre de 2026 a las 07:38:46 UTC (09:38:46 de Madrid). Aunque el canal ya no estaba disponible, su dominio seguía en Authentication.

Tras la retirada permanecen exactamente los otros cuatro dominios, en el mismo orden:

- `localhost`
- `registro-defensivo.firebaseapp.com`
- `registro-defensivo.web.app`
- `itsasnehezkuntza.github.io`

## Ejecución y verificación

`tools/firebase/retirar-dominio16.mjs` consulta primero el canal y los dominios, comprueba el destino histórico y guarda el plan. Con `--apply`, compara de nuevo los dominios con el plan y hace una segunda lectura inmediatamente antes del cambio. Actualiza únicamente `authorizedDomains` mediante Firebase CLI y su máscara de campo, y exige que la lista final sea exactamente la anterior menos el hostname indicado. No inicia un login ni imprime credenciales. Referencia del método y de la máscara: [Identity Platform, updateConfig](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/projects/updateConfig).

La ejecución se realizó con la sesión administrativa existente de Firebase CLI. El acceso inicial a su configuración estaba fuera del sandbox; la escalación fue aprobada y permitió consultar y aplicar el cambio ya autorizado. No hubo rechazo de aprobación automática ni se solicitaron credenciales al usuario.

- Lectura administrativa inicial: 16:59:42 UTC; cinco dominios y canal ausente.
- Cambio y verificación administrativa: 17:00:01 UTC; dominio retirado, cuatro entradas restantes idénticas.
- Verificación pública independiente: 17:00:12 UTC, HTTP 200 y proyecto `760744900094`; misma lista de cuatro dominios. GitHub Pages y localhost siguen autorizados. No se ha repetido una autenticación de usuario ni se presenta esta lectura como prueba de acceso completo con Google.

Recibos en `.test-artifacts/firebase/fase16/`: `preflight.json`, `resultado.json` y `verificacion-publica.json`. Respaldo previo de documentación y lista anterior en `.local-backups/fase16-dominio-20261020/`. Sintaxis de la herramienta comprobada; ambas listas posteriores contrastadas automáticamente.

No se han consultado usuarios, partidos ni eventos, ni se han modificado proveedores, claves, otros dominios, reglas de Firestore, canales, releases, Pages o datos del navegador. No se hacen commit, push o despliegue. Las fases de aplicación 10–15 siguen en local; versión publicada documentada 8C.0.

## Pendientes actuales

Las decisiones sobre originales/preferencia y SDK están cerradas en los apartados 66–67 de la especificación. Quedan la preparación y prueba física en Safari/iPad y la consolidación/publicación autorizada de la aplicación. Se mantiene la necesidad de coordinar código y reglas de Fase 14 y actualizar los dispositivos. A2 sigue mitigado y los conflictos de contenido conservados no tienen resolución automática. No se inicia la fase siguiente.
