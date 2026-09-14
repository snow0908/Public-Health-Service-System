$ports = 4709,5283,9097,10000,18488,21690,24380,33331,35600,37600,39099,44950,50390,51000,51531,51751,54360,55853,57968,63802
foreach ($p in $ports) {
  $out = & curl.exe -s -x "http://127.0.0.1:$p" -m 3 -o NUL -w "%{http_code}" "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" -X POST -d "{}" 2>$null
  if ($out -and $out -ne '000') { Write-Output "PORT ${p}: HTTP $out" }
}
Write-Output "--- direct test ---"
& curl.exe -s -m 5 -o NUL -w "direct: %{http_code}" "https://www.baidu.com" 2>$null
Write-Output ""
Write-Output "probe done"
