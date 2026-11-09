[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$shoppingRoot = $PSScriptRoot
$shoppingApi = Join-Path $shoppingRoot 'backend\TWM.API'
$shoppingFrontend = Join-Path $shoppingRoot 'frontend'
$shoppingLogs = Join-Path $shoppingRoot '.local-logs'
$shoppingOutput = Join-Path $shoppingRoot 'backend\.local-run'
if (!(Test-Path -LiteralPath (Join-Path $shoppingApi '.env'))) { throw 'Copia backend/TWM.API/.env.example a .env y configura PostgreSQL. Consulta README.md.' }
if (!(Test-Path -LiteralPath (Join-Path $shoppingFrontend '.env'))) { Copy-Item -LiteralPath (Join-Path $shoppingFrontend '.env.example') -Destination (Join-Path $shoppingFrontend '.env') }
New-Item -ItemType Directory -Force -Path $shoppingLogs | Out-Null
$shoppingProcesses = @()
function Test-ShoppingApi {
    try { $health = Invoke-RestMethod 'http://localhost:5156/api/health' -TimeoutSec 2; return ($health.apiVersion -eq 4) } catch { return $false }
}
if (!(Test-ShoppingApi)) {
    if (Get-NetTCPConnection -State Listen -LocalPort 5156 -ErrorAction SilentlyContinue) { throw 'El puerto 5156 está ocupado por otra versión. Detén esa API antes de iniciar.' }
    & dotnet build (Join-Path $shoppingApi 'TWM.API.csproj') --configuration Release --output $shoppingOutput -p:UseSharedCompilation=false
    if ($LASTEXITCODE -ne 0) { throw 'La compilación de .NET falló.' }
    $oldEnvironment = $env:ASPNETCORE_ENVIRONMENT
    try {
        $env:ASPNETCORE_ENVIRONMENT = 'Development'
        $apiProcess = Start-Process -FilePath 'dotnet' -ArgumentList @(('"' + (Join-Path $shoppingOutput 'TWM.API.dll') + '"')) -WorkingDirectory $shoppingRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $shoppingLogs 'api.log') -RedirectStandardError (Join-Path $shoppingLogs 'api-error.log') -PassThru
        $shoppingProcesses += @{ id = $apiProcess.Id; command = (Join-Path $shoppingOutput 'TWM.API.dll') }
    } finally { $env:ASPNETCORE_ENVIRONMENT = $oldEnvironment }
    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) { if (Test-ShoppingApi) { $ready = $true; break }; Start-Sleep -Milliseconds 250 }
    if (!$ready) { throw 'La API no arrancó. Revisa .local-logs/api-error.log y la conexión PostgreSQL del .env.' }
}
Invoke-RestMethod 'http://localhost:5156/api/health/database' -TimeoutSec 10 | Out-Null
if (!(Get-NetTCPConnection -State Listen -LocalPort 5173 -ErrorAction SilentlyContinue)) {
    if (!(Test-Path -LiteralPath (Join-Path $shoppingFrontend 'node_modules\vite\bin\vite.js'))) {
        Push-Location $shoppingFrontend
        try { & npm ci; if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias del frontend.' } } finally { Pop-Location }
    }
    $viteScript = Join-Path $shoppingFrontend 'node_modules\vite\bin\vite.js'
    $webProcess = Start-Process -FilePath 'node' -ArgumentList @(('"' + $viteScript + '"'), '--host', 'localhost', '--port', '5173', '--strictPort') -WorkingDirectory $shoppingFrontend -WindowStyle Hidden -RedirectStandardOutput (Join-Path $shoppingLogs 'frontend.log') -RedirectStandardError (Join-Path $shoppingLogs 'frontend-error.log') -PassThru
    $shoppingProcesses += @{ id = $webProcess.Id; command = $viteScript }
}
$statePath = Join-Path $shoppingRoot '.local-processes.json'
if (Test-Path -LiteralPath $statePath) { $shoppingProcesses += @(Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json) }
ConvertTo-Json -InputObject @($shoppingProcesses) | Set-Content -LiteralPath $statePath -Encoding utf8
Write-Host 'Shopping: http://localhost:5173'
Write-Host 'API:      http://localhost:5156/api/health'
Write-Host 'Los procesos iniciados por este script se detienen con .\Stop-Local.ps1.'
