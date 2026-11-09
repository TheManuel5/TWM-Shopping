$ErrorActionPreference='Stop'
$shoppingLine=Get-Content backend/TWM.API/.env | Where-Object { $_ -like 'ConnectionStrings__PostgreConnection=*' } | Select-Object -First 1
$shoppingCs=[System.Data.Common.DbConnectionStringBuilder]::new();$shoppingCs.set_ConnectionString($shoppingLine.Substring($shoppingLine.IndexOf('=')+1));$shoppingCs['Database']='shopping_verificacion_v2'
$env:ConnectionStrings__PostgreConnection=$shoppingCs.get_ConnectionString()
$env:ASPNETCORE_URLS='http://localhost:5157'
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet backend/build-next/TWM.API.dll --admin-rut 20000001-3
if($LASTEXITCODE -ne 0){throw 'No se configuró el administrador aislado.'}
dotnet backend/build-next/TWM.API.dll
