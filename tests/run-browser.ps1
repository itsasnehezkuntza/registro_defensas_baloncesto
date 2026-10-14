param([Parameter(Mandatory=$true)][int]$Port, [ValidateSet(2,3,5,6)][int]$Phase = 2)
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
    try { $version = Invoke-RestMethod -TimeoutSec 1 "http://127.0.0.1:$debugPort/json/version"; break }
    catch { Start-Sleep -Milliseconds 200 }
  }
  if (!$version) { Get-Content (Join-Path $workspace ".test-artifacts/chrome-error.log"); throw "Chrome no abrió el puerto de pruebas." }
  $target = Invoke-RestMethod -TimeoutSec 3 -Method Put -Uri "http://127.0.0.1:$debugPort/json/new?http://127.0.0.1:$Port/tests/fase$Phase.html?isolated=1"
  $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  if ($Phase -eq 5) {
    $downloadPath=Join-Path $testProfile 'downloads'
    New-Item -ItemType Directory -Path $downloadPath -Force | Out-Null
    Invoke-Cdp 'Browser.setDownloadBehavior' @{behavior='allow';downloadPath=$downloadPath} | Out-Null
  }
  for ($attempt=0;$attempt -lt 200;$attempt++) {
    $result = Invoke-Cdp 'Runtime.evaluate' @{expression="window.phase${Phase}Result";returnByValue=$true}
    if ($result.result.result.value) {
      $report = $result.result.result.value | ConvertTo-Json -Depth 15
      $report | Set-Content -LiteralPath (Join-Path $workspace ".test-artifacts\fase$Phase-result.json") -Encoding UTF8
      $report
      break
    }
    Start-Sleep -Milliseconds 250
  }
  if (!$result.result.result.value) {
    Invoke-Cdp 'Runtime.evaluate' @{expression='document.body.innerText';returnByValue=$true} | ConvertTo-Json -Depth 15
    throw 'Las pruebas no finalizaron.'
  }
  if ($Phase -eq 5 -and $result.result.result.value.ok) {
    for ($attempt=0;$attempt -lt 20;$attempt++) {
      $csvFiles=@(Get-ChildItem -LiteralPath $downloadPath -Filter '*.csv' -File)
      if ($csvFiles.Count) { break }
      Start-Sleep -Milliseconds 100
    }
    if (!$csvFiles.Count) { throw 'Chrome no materializo la descarga CSV.' }
    $bytes=[IO.File]::ReadAllBytes($csvFiles[0].FullName)
    if ($bytes[0] -ne 239 -or $bytes[1] -ne 187 -or $bytes[2] -ne 191) { throw 'Descarga nativa sin BOM.' }
    Write-Output ('Descarga nativa verificada: ' + $csvFiles[0].Name)
  }
  if (!$result.result.result.value.ok) { throw "Pruebas de navegador fallidas." }
} finally {
  if ($socket.State -eq [System.Net.WebSockets.WebSocketState]::Open) { try { Invoke-Cdp 'Browser.close' @{} | Out-Null } catch {} }
  $socket.Dispose()
}
