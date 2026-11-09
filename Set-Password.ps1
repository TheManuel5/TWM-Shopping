param([Parameter(Mandatory=$true)][string]$Rut)
$ErrorActionPreference='Stop'
$shoppingPassword=Read-Host 'Nueva contraseña (8 a 72 bytes)' -AsSecureString
$shoppingConfirm=Read-Host 'Repite la contraseña' -AsSecureString
$shoppingFirst=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($shoppingPassword)
$shoppingSecond=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($shoppingConfirm)
$shoppingPrevious=$env:SHOPPING_SETUP_PASSWORD
try {
 $first=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($shoppingFirst)
 $second=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($shoppingSecond)
 if($first -cne $second){throw 'Las contraseñas no coinciden.'}
 $env:SHOPPING_SETUP_PASSWORD=$first
 & dotnet run --project (Join-Path $PSScriptRoot 'backend/TWM.API/TWM.API.csproj') --configuration Release --no-launch-profile -- --set-password $Rut
 if($LASTEXITCODE -ne 0){throw 'No se pudo configurar la contraseña.'}
}finally{
 $env:SHOPPING_SETUP_PASSWORD=$shoppingPrevious
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($shoppingFirst)
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($shoppingSecond)
 $first=$null;$second=$null
}
