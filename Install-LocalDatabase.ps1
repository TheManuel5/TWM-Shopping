[CmdletBinding()]
param([ValidatePattern('^[a-z][a-z0-9_]{2,50}$')][string]$Database='shopping_twm_local',[string]$AdministratorRut)
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$shoppingEnv=Join-Path $PSScriptRoot 'backend/TWM.API/.env'
if(!(Test-Path -LiteralPath $shoppingEnv)){throw 'Copia backend/TWM.API/.env.example a .env y configura la conexión a PostgreSQL.'}
$shoppingLine=Get-Content -LiteralPath $shoppingEnv | Where-Object { $_ -like 'ConnectionStrings__PostgreConnection=*' } | Select-Object -First 1
$shoppingCs=[System.Data.Common.DbConnectionStringBuilder]::new();$shoppingCs.set_ConnectionString($shoppingLine.Substring($shoppingLine.IndexOf('=')+1))
& ./backend/scripts/database.ps1 -Database postgres -Sql ('CREATE DATABASE "'+$Database+'";')
if(!$?){throw 'No se creó la base nueva; no se reemplazan bases existentes.'}
New-Item -ItemType Directory -Force -Path .local-logs | Out-Null
foreach($shoppingFile in @('create_tables','funciones','triggers','inserts')){
 Write-Host ('Importando '+$shoppingFile+' en '+$Database+'...')
 & ./backend/scripts/database.ps1 -Database $Database -File (Join-Path $PSScriptRoot ('database/'+$shoppingFile+'.sql')) *> ('.local-logs/import-'+$shoppingFile+'.log')
 if(!$?){throw ('Falló la importación. Revisa .local-logs/import-'+$shoppingFile+'.log')}
}
$shoppingCs['Database']=$Database
$shoppingPrevious=$env:ConnectionStrings__PostgreConnection
try{
 $env:ConnectionStrings__PostgreConnection=$shoppingCs.get_ConnectionString()
 Write-Host 'Convirtiendo las contraseñas importadas a bcrypt; puede tardar varios minutos.'
 & dotnet run --project backend/TWM.API --configuration Release --no-launch-profile -- --upgrade-imported-hashes
 if($LASTEXITCODE -ne 0){throw 'Falló la conversión bcrypt.'}
 if($AdministratorRut){& dotnet run --project backend/TWM.API --configuration Release --no-launch-profile -- --admin-rut $AdministratorRut;if($LASTEXITCODE -ne 0){throw 'El RUT administrador debe existir en los datos importados.'}}
 $shoppingContent=Get-Content -LiteralPath $shoppingEnv
 $shoppingContent | ForEach-Object {if($_ -like 'ConnectionStrings__PostgreConnection=*'){'ConnectionStrings__PostgreConnection='+$shoppingCs.get_ConnectionString()}else{$_}} | Set-Content -LiteralPath $shoppingEnv -Encoding utf8
}finally{$env:ConnectionStrings__PostgreConnection=$shoppingPrevious}
Write-Host 'Instalación completa. Ejecuta .\Start-Local.ps1.'
