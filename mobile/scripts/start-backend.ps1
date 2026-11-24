[CmdletBinding()]
param([int]$Port=5156,[int]$WebPort=8081)
$ErrorActionPreference='Stop'
$apiPath=Join-Path (Split-Path $PSScriptRoot -Parent) '../backend/TWM.API'
$keys=@('ASPNETCORE_URLS','Cors__Origins__0','Cors__Origins__1','Cors__Origins__2','Cors__Origins__3','Cors__Origins__4')
$previous=@{}
foreach($key in $keys){$previous[$key]=[Environment]::GetEnvironmentVariable($key,'Process')}
try {
  # Solo el proceso de desarrollo: no cambia appsettings ni la configuración privada del equipo.
  $env:ASPNETCORE_URLS="http://0.0.0.0:$Port"
  $env:Cors__Origins__0='http://localhost:5173'
  $env:Cors__Origins__1='http://127.0.0.1:5173'
  $env:Cors__Origins__2='http://localhost:5174'
  $env:Cors__Origins__3='http://127.0.0.1:5174'
  $env:Cors__Origins__4="http://localhost:$WebPort"
  Push-Location -LiteralPath $apiPath
  try { & dotnet run --no-launch-profile; if($LASTEXITCODE -ne 0){throw 'La API no pudo iniciarse. Revisa el puerto y la configuración PostgreSQL.'} }
  finally { Pop-Location }
} finally {foreach($key in $keys){[Environment]::SetEnvironmentVariable($key,$previous[$key],'Process')}}
