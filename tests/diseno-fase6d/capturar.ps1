param([int]$Port=8082)
$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$testProfile = Join-Path $workspace ('.test-artifacts\chrome-' + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $testProfile -Force | Out-Null
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$debugPort = 9343
$arguments = @('--headless=new','--disable-popup-blocking','--disable-gpu','--disable-software-rasterizer','--in-process-gpu','--no-sandbox','--no-first-run','--no-default-browser-check',"--remote-debugging-port=$debugPort", "--user-data-dir=$testProfile",'about:blank')
$browserProcess = Start-Process -FilePath $chrome -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardError (Join-Path $workspace ".test-artifacts/fase6d-chrome-error.log")
$socket = New-Object System.Net.WebSockets.ClientWebSocket
$script:messageId = 0
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
    if ($response.id -eq $script:messageId) { return $response }
  }
}
try {
  for ($attempt=0;$attempt -lt 25;$attempt++) {
    try { $version=Invoke-RestMethod -TimeoutSec 1 "http://127.0.0.1:$debugPort/json/version"; break } catch { Start-Sleep -Milliseconds 200 }
  }
  if (!$version) { throw "Chrome no abrió el puerto." }
  $target=Invoke-RestMethod -TimeoutSec 3 -Method Put -Uri "http://127.0.0.1:$debugPort/json/new?about:blank"
  $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  $reports=@()
  foreach ($theme in @('broadcast','tactical','scout')) {
    Invoke-Cdp 'Page.navigate' @{url="http://127.0.0.1:$Port/tests/diseno-fase6d/$theme.html"} | Out-Null
    for ($attempt=0;$attempt -lt 50;$attempt++) {
      $ready=Invoke-Cdp 'Runtime.evaluate' @{expression="location.pathname.endsWith('/$theme.html') && typeof window.auditPreview==='function'";returnByValue=$true}
      if ($ready.result.result.value) { break }; Start-Sleep -Milliseconds 100
    }
    if (!$ready.result.result.value) { throw "Vista previa no disponible." }
    Invoke-Cdp 'Page.bringToFront' @{} | Out-Null
    Invoke-Cdp 'Input.dispatchKeyEvent' @{type='keyDown';key='Tab';code='Tab';windowsVirtualKeyCode=9} | Out-Null
    Invoke-Cdp 'Input.dispatchKeyEvent' @{type='keyUp';key='Tab';code='Tab';windowsVirtualKeyCode=9} | Out-Null
    foreach ($case in @(@(1180,820),@(1440,900),@(390,844),@(1024,768),@(1194,834),@(1024,620))) {
      $w=$case[0];$h=$case[1]
      Invoke-Cdp 'Emulation.setDeviceMetricsOverride' @{width=$w;height=$h;deviceScaleFactor=1;mobile=$false} | Out-Null
      $report=Invoke-Cdp 'Runtime.evaluate' @{expression='window.auditPreview()';awaitPromise=$true;returnByValue=$true}
      if ($report.result.exceptionDetails) { throw ($report.result.exceptionDetails | ConvertTo-Json -Depth 10) }
      $metric=$report.result.result.value
      $metric | Add-Member -NotePropertyName theme -NotePropertyValue $theme
      $reports+=$metric
      $shot=Invoke-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
      [IO.File]::WriteAllBytes((Join-Path $workspace ".test-artifacts/fase6d-$theme-$w-$h.png"),[Convert]::FromBase64String($shot.result.data))
      if ($w -eq 390) {
        Invoke-Cdp 'Runtime.evaluate' @{expression='window.scrollTo(0,document.documentElement.scrollHeight)';returnByValue=$true} | Out-Null
        $shot=Invoke-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
        [IO.File]::WriteAllBytes((Join-Path $workspace ".test-artifacts/fase6d-$theme-$w-$h-scroll.png"),[Convert]::FromBase64String($shot.result.data))
      }
    }
  }
  $reports | ConvertTo-Json -Depth 15 | Set-Content -LiteralPath (Join-Path $workspace '.test-artifacts/fase6d-geometria.json') -Encoding UTF8
  $reports | Select-Object theme,width,height,initialFits,scrollAccessible,horizontal,small,clipped | Format-Table -AutoSize
  foreach ($metric in $reports) {
    if ($metric.horizontal -or !$metric.scrollAccessible -or $metric.small.Count -gt 0 -or $metric.clipped.Count -gt 0) { throw "Fallo de geometría: $($metric.theme) $($metric.width)" }
    if ($metric.width -ge 1000 -and $metric.height -ge 768 -and !$metric.initialFits) { throw "Se perdió la distribución iPad horizontal." }
    if ($metric.sections -ne 3 -or $metric.defenses -ne 20 -or $metric.externalResources.Count -ne 0) { throw "Categorías o aislamiento incorrectos." }
    if (($metric.resultOrder -join ',') -ne '2:fallado,3:fallado,2:anotado,3:anotado') { throw "Orden de resultados alterado." }
    foreach ($contrast in $metric.contrasts.PSObject.Properties) { if ($contrast.Value.ratio -lt 4.5) { throw "Contraste insuficiente: $($metric.theme) $($contrast.Name)" } }
    if ($metric.focusOutline -ne 'solid' -or $metric.selectionMarker -notmatch '✓') { throw "Foco/selección ausentes." }
  }
  Write-Output 'GAME DAY y Scout verificados; capturas e informe guardados.'
} finally {
  if ($socket.State -eq [System.Net.WebSockets.WebSocketState]::Open) { try { Invoke-Cdp 'Browser.close' @{} | Out-Null } catch {} }
  $socket.Dispose()
}
