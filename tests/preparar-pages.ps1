# Solo empaqueta archivos estáticos. No ejecuta git, push ni despliegue.
$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $workspace '.test-artifacts\pages'
# Sin borrados: se conserva cualquier salida anterior y se sobrescriben solo
# los archivos de la lista explícita. La lista final se valida después.
New-Item -ItemType Directory -Path $destination -Force | Out-Null
foreach ($name in @('index.html','styles.css','registro.css','dashboard.css','editor.css','cuenta.css','app.js','categorias.csv','.nojekyll')) {
  Copy-Item -LiteralPath (Join-Path $workspace $name) -Destination $destination
}
New-Item -ItemType Directory -Path (Join-Path $destination 'js') -Force | Out-Null
foreach ($name in @('inicio.js','configuracion.js','exportacion.js','identidad.js','interfaz.js','persistencia.js','registro.js','estadisticas.js','dashboard.js','vistas.js','cuenta.js','cuenta-ui.js','firebase-auth.js','firebase-config.js','sync-config.js','sync-storage.js','sync-engine.js','sync-ui.js','firestore-sync.js','firestore-watch.js','panel-model.js','registro-vista.js','distribucion.js','configuracion-guardada.js','editor.js')) {
  Copy-Item -LiteralPath (Join-Path $workspace "js\$name") -Destination (Join-Path $destination 'js')
}
New-Item -ItemType Directory -Path (Join-Path $destination 'fonts') -Force | Out-Null
foreach ($name in @('BarlowCondensed-Bold.ttf','Manrope.ttf','BarlowCondensed-OFL.txt','Manrope-OFL.txt')) {
  Copy-Item -LiteralPath (Join-Path $workspace "fonts\$name") -Destination (Join-Path $destination 'fonts')
}
$expected=@('index.html','styles.css','registro.css','dashboard.css','editor.css','cuenta.css','app.js','categorias.csv','.nojekyll',
  'fonts\BarlowCondensed-Bold.ttf','fonts\Manrope.ttf','fonts\BarlowCondensed-OFL.txt','fonts\Manrope-OFL.txt',
  'js\inicio.js','js\configuracion.js','js\exportacion.js','js\identidad.js','js\interfaz.js','js\persistencia.js','js\registro.js','js\estadisticas.js','js\dashboard.js','js\vistas.js',
  'js\cuenta.js','js\cuenta-ui.js','js\firebase-auth.js','js\firebase-config.js',
  'js\sync-config.js','js\sync-storage.js','js\sync-engine.js','js\sync-ui.js','js\firestore-sync.js','js\firestore-watch.js','js\panel-model.js',
  'js\registro-vista.js','js\distribucion.js','js\configuracion-guardada.js','js\editor.js')
$actual=Get-ChildItem -LiteralPath $destination -File -Recurse | ForEach-Object { $_.FullName.Substring($destination.Length+1) }
if (Compare-Object $expected $actual) { throw 'La carpeta contiene archivos ajenos a la publicación; revisarla antes de usarla.' }
Write-Output "Preparado sin publicar: $destination ($($expected.Count) archivos, incluidas fuentes y licencias; sin pruebas ni perfiles)"
