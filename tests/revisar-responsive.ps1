param([Parameter(Mandatory=$true)][int]$Port, [string]$Label = "antes")
$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$testProfile = Join-Path $workspace ('.test-artifacts\chrome-' + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $testProfile -Force | Out-Null
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$debugPort = 9337
$arguments = @('--headless=new','--disable-popup-blocking','--disable-gpu','--disable-software-rasterizer','--in-process-gpu','--no-sandbox','--no-first-run','--no-default-browser-check',"--remote-debugging-port=$debugPort", "--user-data-dir=$testProfile",'about:blank')
$browserProcess = Start-Process -FilePath $chrome -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardError (Join-Path $workspace ".test-artifacts/chrome-error.log")
$socket = New-Object System.Net.WebSockets.ClientWebSocket
$script:messageId = 0
$script:jsErrors = @()
function Invoke-Cdp([string]$Method, $Parameters) {
  $script:messageId++
  $payload = @{id=$script:messageId;method=$Method;params=$Parameters} | ConvertTo-Json -Depth 15 -Compress
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
  $segment = New-Object 'System.ArraySegment[byte]' -ArgumentList @(,$bytes)
  $socket.SendAsync($segment,[System.Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  while ($true) {
    $buffer = New-Object byte[] 1048576
    $receiveSegment = New-Object 'System.ArraySegment[byte]' -ArgumentList @(,$buffer)
    $responseText = ''
    do {
      $received = $socket.ReceiveAsync($receiveSegment,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
      if ($received.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) { throw "Chrome cerró la conexión." }
      $responseText += [System.Text.Encoding]::UTF8.GetString($buffer,0,$received.Count)
    } while (!$received.EndOfMessage)
    $response = $responseText | ConvertFrom-Json
    if ($response.method -eq 'Runtime.exceptionThrown') { $script:jsErrors += $response.params.exceptionDetails }
    if ($response.id -eq $script:messageId) { return $response }
  }
}
try {
  for ($attempt=0;$attempt -lt 25;$attempt++) {
    try { $version = Invoke-RestMethod -TimeoutSec 1 "http://127.0.0.1:$debugPort/json/version"; break }
    catch { Start-Sleep -Milliseconds 200 }
  }
  if (!$version) { throw "Chrome no abrió el puerto." }
  $target = Invoke-RestMethod -TimeoutSec 3 -Method Put -Uri "http://127.0.0.1:$debugPort/json/new?about:blank"
  $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  Invoke-Cdp 'Runtime.enable' @{} | Out-Null
  Invoke-Cdp 'Emulation.setFocusEmulationEnabled' @{enabled=$true} | Out-Null
  Invoke-Cdp 'Page.navigate' @{url="http://127.0.0.1:$Port/tests/fase4.html?isolated=1"} | Out-Null
  for ($attempt=0;$attempt -lt 100;$attempt++) {
    $ready=Invoke-Cdp 'Runtime.evaluate' @{expression='window.auditReady || window.auditFailure';returnByValue=$true}
    if ($ready.result.result.value) { break }
    Start-Sleep -Milliseconds 200
  }
  if ($ready.result.result.value -ne $true) { throw ($ready.result.result.value | Out-String) }
  # Activar modalidad de teclado real antes de comprobar :focus-visible.
  Invoke-Cdp 'Page.bringToFront' @{} | Out-Null
  Invoke-Cdp 'Input.dispatchKeyEvent' @{type='keyDown';key='Tab';code='Tab';windowsVirtualKeyCode=9} | Out-Null
  Invoke-Cdp 'Input.dispatchKeyEvent' @{type='keyUp';key='Tab';code='Tab';windowsVirtualKeyCode=9} | Out-Null
  $reports=@()
  $cases=@(@(320,640,1,1),@(360,740,1,1),@(390,844,1,1),@(768,1024,1,1),@(1024,768,1,1),@(1180,820,1,1),@(1194,834,1,1),@(1024,620,1,1),@(1440,900,1,1),@(844,390,1,1),@(640,360,1,1),@(640,960,2,1),@(320,800,1,2))
  foreach ($case in $cases) {
    $w=$case[0];$h=$case[1];$scale=$case[2];$textScale=$case[3]
    Invoke-Cdp 'Emulation.setDeviceMetricsOverride' @{width=$w;height=$h;deviceScaleFactor=1;mobile=$false} | Out-Null
    $report=Invoke-Cdp 'Runtime.evaluate' @{expression="window.auditSize($w,$h,$scale,$textScale)";awaitPromise=$true;returnByValue=$true}
    if ($report.result.exceptionDetails) { throw ($report.result.exceptionDetails | ConvertTo-Json -Depth 10) }
    $metrics=$report.result.result.value
    $reports+=$metrics
    if ($Label -eq "copper-court") {
      # La medida anterior verifica el foco; la captura editorial muestra reposo.
      Invoke-Cdp 'Runtime.evaluate' @{expression="document.querySelector('iframe').contentDocument.activeElement.blur()"} | Out-Null
    }
    if ($w -in @(320,390,768,1024,1180,1194,1440,844)) {
      $shot=Invoke-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
      [IO.File]::WriteAllBytes((Join-Path $workspace ".test-artifacts/$Label-$w-$h-$textScale.png"),[Convert]::FromBase64String($shot.result.data))
    }
    if ($w -eq 390 -or ($w -eq 1024 -and $h -eq 620)) {
      Invoke-Cdp 'Runtime.evaluate' @{expression='window.auditScroll()';awaitPromise=$true} | Out-Null
      $shot=Invoke-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
      [IO.File]::WriteAllBytes((Join-Path $workspace ".test-artifacts/$Label-$w-$h-scroll.png"),[Convert]::FromBase64String($shot.result.data))
    }
    if ($w -eq 320 -or $w -eq 844 -or $scale -eq 2) {
      foreach ($kind in @("new","delete")) {
        $dialog=Invoke-Cdp 'Runtime.evaluate' @{expression="window.auditDialog('$kind')";awaitPromise=$true;returnByValue=$true}
        $reports+=$dialog.result.result.value
      }
    }
  }
  $functional=Invoke-Cdp 'Runtime.evaluate' @{expression='window.auditFunctional()';awaitPromise=$true;returnByValue=$true}
  if ($functional.result.exceptionDetails) { throw ($functional.result.exceptionDetails | ConvertTo-Json -Depth 10) }
  @{errors=$script:jsErrors;functional=$functional.result.result.value} | ConvertTo-Json -Depth 15 | Set-Content -LiteralPath (Join-Path $workspace ".test-artifacts/$Label-javascript.json") -Encoding UTF8
  if ($script:jsErrors.Count -gt 0) { throw ($script:jsErrors | ConvertTo-Json -Depth 15) }
  if ($Label -eq "copper-court") {
    $palette=Invoke-Cdp 'Runtime.evaluate' @{expression='window.auditPalette()';returnByValue=$true}
    $palette.result.result.value | ConvertTo-Json -Depth 15 | Set-Content -LiteralPath (Join-Path $workspace '.test-artifacts/copper-court-paleta.json') -Encoding UTF8
    if ($palette.result.exceptionDetails -or $palette.result.result.value.outside.Count -gt 0) { throw 'Colores ajenos a la paleta blanco/gris/negro/naranja.' }
  }
  $reports | ConvertTo-Json -Depth 15 | Set-Content -LiteralPath (Join-Path $workspace ".test-artifacts/fase4-$Label.json") -Encoding UTF8
  $reports | Select-Object width,height,scale,textScale,horizontal,dockCoversLast,small,clipped | Format-Table -AutoSize
  if ($Label -ne "antes") {
    foreach ($metric in ($reports | Where-Object { $_.width })) {
      if ($metric.horizontal -or $metric.headerClipped -or $metric.dockCoversLast -or $metric.small.Count -gt 0 -or $metric.clipped.Count -gt 0) { throw "Fallo de geometría responsive." }
      if (($metric.results | Where-Object { $_.clipped -or $_.bottom -gt $metric.height+1 }).Count -gt 0) { throw "Resultados fuera del área visible o recortados." }
      if (!$metric.focusVisible -or $metric.selectionBorder -ne "double" -or $metric.marker -notmatch "✓") { throw "Foco o selección visual ausentes." }
      if ($metric.stats -ne "7–3 · 70%") { throw "Estadística visual incorrecta." }
      if ($Label -in @("premium-ui","tipografia","copper-court") -and $metric.scale -eq 1 -and $metric.textScale -eq 1) {
        if ($metric.staticColumns -ne 3 -or $metric.staticRows -ne 2) { throw "Estático no tiene tres columnas y dos filas." }
        if ([Math]::Abs($metric.topPanels[0] - $metric.topPanels[1]) -gt 1) { throw "Transición y Estático tienen distinta altura." }
      }
      if ($metric.width -in @(1024,1180,1194) -and $metric.height -ge 768 -and !$metric.fitsWithoutScroll) { throw "Bloqueo directo no cabe en iPad horizontal." }
      if ($metric.sections -ne 3 -or $metric.defenses -ne 20) { throw "Secciones o defensas ausentes." }
      if ($Label -in @("tipografia","copper-court")) {
        if ($metric.typography.notUppercase.Count -gt 0 -or
            'Barlow Condensed' -notin $metric.typography.loaded -or 'Manrope' -notin $metric.typography.loaded -or
            $metric.typography.actionFont -notmatch 'Barlow Condensed' -or $metric.typography.statFont -notmatch 'Manrope') { throw "Mayúsculas o fuentes incorrectas." }
      }
    }
    foreach ($dialog in ($reports | Where-Object { $_.kind })) {
      if ($Label -in @("tipografia","copper-court") -and (!$dialog.uppercase -or !$dialog.unchangedValues)) { throw "Tipografía o valores del formulario alterados." }
      if (!$dialog.visible -or $dialog.scrollWidth -gt $dialog.clientWidth+1 -or $dialog.bounds.x -lt 0 -or $dialog.bounds.y -lt 0 -or $dialog.bounds.right -gt $dialog.viewport.width+1 -or $dialog.bounds.bottom -gt $dialog.viewport.height+1) { throw "Diálogo fuera de pantalla." }
    }
  }
} finally {
  if ($socket.State -eq [System.Net.WebSockets.WebSocketState]::Open) { try { Invoke-Cdp 'Browser.close' @{} | Out-Null } catch {} }
  $socket.Dispose()
}
