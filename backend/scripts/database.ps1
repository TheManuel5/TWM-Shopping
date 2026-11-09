param([string]$Sql,[string]$File,[string]$Database,[string]$Backup,[switch]$CreateTestCopy,[string]$Restore)
$ErrorActionPreference='Stop'
$shoppingRoot=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$line=Get-Content -LiteralPath (Join-Path $shoppingRoot 'backend/TWM.API/.env') | Where-Object { $_ -like 'ConnectionStrings__PostgreConnection=*' } | Select-Object -First 1
$cs=[System.Data.Common.DbConnectionStringBuilder]::new();$cs.set_ConnectionString($line.Substring($line.IndexOf('=')+1).Trim().Trim('"'))
$previousPassword=$env:PGPASSWORD;$env:PGPASSWORD=[string]$cs['Password'];$env:PGCLIENTENCODING='UTF8'
$db=if($Database){$Database}else{[string]$cs['Database']}
$pgArgs=@('-h',[string]$cs['Host'],'-p',$(if($cs.ContainsKey('Port')){[string]$cs['Port']}else{'5432'}),'-U',[string]$cs['Username'])
try {
 if($Restore){& pg_restore @pgArgs '-d' $db '--schema=public' '--no-owner' $Restore;if($LASTEXITCODE -ne 0){throw 'Falló la restauración aislada.'};return}
 if($Backup){& pg_dump @pgArgs '-d' $db '--format=custom' '--file' $Backup;if($LASTEXITCODE -ne 0){throw 'Falló el respaldo.'};return}
 if($CreateTestCopy){if($db -ne 'shopping_verificacion'){throw 'La copia de pruebas debe llamarse shopping_verificacion.'};& psql @pgArgs '-d' 'postgres' '-v' 'ON_ERROR_STOP=1' '-c' 'CREATE DATABASE shopping_verificacion';if($LASTEXITCODE -ne 0){throw 'No se creó la base aislada.'};return}
 $argsQuery=@('-d',$db,'-X','--no-password','-v','ON_ERROR_STOP=1','--pset','pager=off')
 if($File){& psql @pgArgs @argsQuery '-f' $File}else{$queryFile=Join-Path ([IO.Path]::GetTempPath()) ('shopping-query-'+[guid]::NewGuid().ToString('N')+'.sql');try{[IO.File]::WriteAllText($queryFile,$Sql,[Text.UTF8Encoding]::new($false));& psql @pgArgs @argsQuery '-f' $queryFile}finally{Remove-Item -LiteralPath $queryFile -ErrorAction SilentlyContinue}}
 if($LASTEXITCODE -ne 0){throw 'La consulta PostgreSQL falló.'}
}finally{$env:PGPASSWORD=$previousPassword}
