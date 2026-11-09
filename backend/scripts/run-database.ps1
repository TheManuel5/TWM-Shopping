param([string]$Database='shopping_verificacion_v2',[int]$Port=5157,[switch]$MigratePasswords,[switch]$TestAdmin)
$ErrorActionPreference='Stop'
$shoppingRoot=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location -LiteralPath $shoppingRoot
$shoppingLine=Get-Content backend/TWM.API/.env | Where-Object { $_ -like 'ConnectionStrings__PostgreConnection=*' } | Select-Object -First 1
$shoppingCs=[System.Data.Common.DbConnectionStringBuilder]::new();$shoppingCs.set_ConnectionString($shoppingLine.Substring($shoppingLine.IndexOf('=')+1));$shoppingCs['Database']=$Database
$env:ConnectionStrings__PostgreConnection=$shoppingCs.get_ConnectionString()
$env:ASPNETCORE_URLS='http://localhost:'+$Port
$env:ASPNETCORE_ENVIRONMENT='Development'
if($MigratePasswords){ & dotnet backend/build-check/TWM.API.dll --upgrade-imported-hashes; if($LASTEXITCODE -ne 0){throw 'Falló migración bcrypt.'}; exit }
if($TestAdmin){if($Database -ne 'shopping_verificacion_v2'){throw 'El administrador automático solo se permite en pruebas.'};& dotnet backend/build-check/TWM.API.dll --admin-rut 20000001-3;if($LASTEXITCODE -ne 0){throw 'Falló administrador aislado.'}}
& dotnet backend/build-check/TWM.API.dll
if($LASTEXITCODE -ne 0){throw 'Falló API.'}




