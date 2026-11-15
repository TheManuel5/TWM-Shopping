[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$shoppingState = Join-Path $PSScriptRoot '.local-processes.json'
if (!(Test-Path -LiteralPath $shoppingState)) { Write-Host 'No hay procesos registrados por Start-Local.ps1.'; return }
# En Windows PowerShell 5.1 ConvertFrom-Json entrega el arreglo como un solo objeto: se enumera explícitamente.
$shoppingRecorded = @((Get-Content -LiteralPath $shoppingState -Raw | ConvertFrom-Json) | ForEach-Object { $_ } | Where-Object { $_.id -is [ValueType] })
foreach ($entry in $shoppingRecorded) {
    $shoppingProcess = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$entry.id) -ErrorAction SilentlyContinue
    if ($shoppingProcess -and $shoppingProcess.CommandLine -and $shoppingProcess.CommandLine.Contains([string]$entry.command) -and ([string]$entry.command).StartsWith($PSScriptRoot, [StringComparison]::OrdinalIgnoreCase)) { Stop-Process -Id ([int]$entry.id) }
}
Remove-Item -LiteralPath $shoppingState
Write-Host 'Procesos locales registrados detenidos.'
