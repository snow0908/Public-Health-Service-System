Write-Output "=== DNS tests ==="
foreach ($h in 'www.baidu.com','open.feishu.cn','gqyknxudbpx.feishu.cn','npmjs.com') {
  $r = Resolve-DnsName $h -DnsOnly -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty IPAddress -ErrorAction SilentlyContinue
  Write-Output "$h -> $r"
}
Write-Output "=== probe HTTP proxy ports ==="
foreach ($p in 4709,5283,9097,10000,18488,21690,24380,33331,35600,37600,39099,44950,50390,51000,51531,51751,54360,55853,57968,63802) {
  try {
    $resp = Invoke-WebRequest -Uri 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal' -Method Post -Body '{}' -Proxy "http://127.0.0.1:$p" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Output "PORT $p WORKS: $($resp.StatusCode)"
  } catch {
    $msg = $_.Exception.Message
    if ($msg -match '407|proxy|Proxy') { Write-Output "PORT $p is proxy but auth-failed: $msg" }
    elseif ($msg.Length -lt 80 -and $msg -notmatch 'Unable to connect|超时|timed out|超时|拒绝') { Write-Output "PORT $p -> $msg" }
  }
}
Write-Output "done"
