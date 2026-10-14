$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$testProfile = Join-Path $workspace ('.test-artifacts\chrome-' + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $testProfile -Force | Out-Null
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$debugPort = 9347
$arguments = @('--headless=new','--disable-popup-blocking','--disable-gpu','--disable-software-rasterizer','--in-process-gpu','--no-sandbox','--no-first-run','--no-default-browser-check',"--remote-debugging-port=$debugPort", "--user-data-dir=$testProfile",'about:blank')
$browserProcess = Start-Process -FilePath $chrome -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardError (Join-Path $workspace ".test-artifacts/fase7/chrome-error.log")
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
    try { $version=Invoke-RestMethod -TimeoutSec 1 "http://127.0.0.1:$debugPort/json/version"; break } catch {Start-Sleep -Milliseconds 200}
  }
  if (!$version) {throw 'Chrome no abrió el puerto'}
  $target=Invoke-RestMethod -TimeoutSec 3 -Method Put -Uri 'http://127.0.0.1:9347/json/new?http://127.0.0.1:8087/tests/dashboard-fase7/index.html'
  $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  for ($attempt=0;$attempt -lt 40;$attempt++) {
    $ready=Invoke-Cdp 'Runtime.evaluate' @{expression="document.querySelectorAll('.performance').length === 13 && document.styleSheets.length === 1";returnByValue=$true}
    if ($ready.result.result.value -eq $true) {break}
    Start-Sleep -Milliseconds 100
  }
  if ($ready.result.result.value -ne $true) {throw 'Maqueta no disponible'}
  $reports=@()
  foreach ($case in @(@(1180,820),@(1024,768),@(390,844),@(320,740))) {
    $w=$case[0];$h=$case[1]
    Invoke-Cdp 'Emulation.setDeviceMetricsOverride' @{width=$w;height=$h;deviceScaleFactor=1;mobile=$false} | Out-Null
    Invoke-Cdp 'Runtime.evaluate' @{expression='window.scrollTo(0,0)'} | Out-Null
    Start-Sleep -Milliseconds 200
    $result=Invoke-Cdp 'Runtime.evaluate' @{expression='(() => { const all=[...document.querySelectorAll(''.performance'')];return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,contentHeight:document.documentElement.scrollHeight,bottom:document.querySelector(''footer'').getBoundingClientRect().bottom,sections:document.querySelectorAll(''section'').length,orders:{static:[...document.querySelectorAll(''.static .performance'')].map(x=>x.dataset.id),direct:[...document.querySelectorAll(''.direct .performance'')].map(x=>x.dataset.id)},rows:all.map(x=>({id:x.dataset.id,n:+x.dataset.attempts,missed:+x.dataset.missed,made:+x.dataset.made,badge:x.querySelector(''.badge'')?.textContent??'''',percent:x.querySelector(''.percentage'').textContent,green:x.querySelector(''.bar .missed'')?.style.width??null,overflow:x.scrollWidth>x.clientWidth})),resources:performance.getEntriesByType(''resource'').map(x=>x.name)} })()';returnByValue=$true}
    $report=$result.result.result.value
    $reports+=$report
    if ($report.scrollWidth -gt $w) {throw "Desbordamiento horizontal en $w"}
    $shot=Invoke-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
    [IO.File]::WriteAllBytes((Join-Path $workspace ".test-artifacts/fase7/dashboard-$w-$h.png"),[Convert]::FromBase64String($shot.result.data))
    if ($w -eq 390) {
      $shot=Invoke-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$true;clip=@{x=0;y=0;width=$w;height=$report.contentHeight;scale=1}}
      [IO.File]::WriteAllBytes((Join-Path $workspace '.test-artifacts/fase7/dashboard-movil-completo.png'),[Convert]::FromBase64String($shot.result.data))
      Invoke-Cdp 'Runtime.evaluate' @{expression="document.querySelector('.direct').scrollIntoView()"} | Out-Null
      $shot=Invoke-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
      [IO.File]::WriteAllBytes((Join-Path $workspace '.test-artifacts/fase7/dashboard-movil-bloqueo.png'),[Convert]::FromBase64String($shot.result.data))
    }
  }
  $reports | ConvertTo-Json -Depth 15 | Set-Content -LiteralPath (Join-Path $workspace '.test-artifacts/fase7/verificacion.json') -Encoding UTF8
  $reports | Select-Object width,height,scrollWidth,contentHeight,bottom | ConvertTo-Json
} finally {
  if ($socket.State -eq [System.Net.WebSockets.WebSocketState]::Open) {try {Invoke-Cdp 'Browser.close' @{} | Out-Null}catch{}}
  $socket.Dispose()
}
