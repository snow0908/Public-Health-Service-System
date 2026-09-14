$env:Path = 'c:\Users\pleas\.trae-cn\plugins\trae-remote-official\lark\1.0.5\bin;' + $env:Path
Write-Output "=== auth status ==="
lark-cli auth status --format json 2>&1 | Out-String
Write-Output "=== drive list test ==="
lark-cli drive files list --params '{\"folder_token\":\"MgCNfIeqGlUnPjdwe1lcz903n9d\",\"page_size\":10}' --format json --as user 2>&1 | Out-String
