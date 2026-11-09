param([Parameter(Mandatory=$true)][string]$Rut)
$ErrorActionPreference='Stop'
$shoppingProject=Join-Path $PSScriptRoot 'backend/TWM.API/TWM.API.csproj'
& dotnet run --project $shoppingProject --configuration Release --no-launch-profile -- --admin-rut $Rut
if($LASTEXITCODE -ne 0){throw 'No se asignó el administrador.'}
Write-Host 'Recarga la aplicación o vuelve a iniciar sesión con ese RUT.'
