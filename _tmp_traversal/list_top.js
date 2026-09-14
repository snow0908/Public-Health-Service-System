const { execFileSync } = require('child_process');

function listFolder(token) {
  const out = execFileSync('lark-cli', ['drive', 'files', 'list', '--params', JSON.stringify({ folder_token: token, page_size: 200 }), '--format', 'json', '--as', 'user'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  const j = JSON.parse(out);
  if (!j.ok) throw new Error(JSON.stringify(j.error));
  return j.data;
}

const [srcToken, dstToken] = ['RDi1f1AJ9lPnvUdnfbccUptrnQc', 'MgCNfIeqGlUnPjdwe1lcz903n9d'];
const src = listFolder(srcToken);
const dst = listFolder(dstToken);
console.log('=== 源目录（参照）顶层 ===');
(src.files || []).forEach(f => console.log(f.type.padEnd(10), f.name, f.token));
console.log('\n=== 目标目录（待补全）顶层 ===');
(dst.files || []).forEach(f => console.log(f.type.padEnd(10), f.name, f.token));
