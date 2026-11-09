$shoppingScript=Get-Content backend/scripts/start-verification.ps1 -Raw
Invoke-Expression ($shoppingScript.Replace('backend/build-next/','backend/build-check/'))
