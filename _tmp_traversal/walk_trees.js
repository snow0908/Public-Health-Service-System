const { execFileSync } = require('child_process');
const fs = require('fs');

function listFolder(token) {
  const out = execFileSync('lark-cli', ['drive', 'files', 'list', '--params', JSON.stringify({ folder_token: token, page_size: 200 }), '--format', 'json', '--as', 'user'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  const j = JSON.parse(out);
  if (!j.ok) throw new Error(JSON.stringify(j.error));
  return j.data;
}

// 递归盘点：返回 [{path, type, token, parentToken}]
function walk(rootToken, rootName) {
  const result = [];
  const queue = [{ token: rootToken, path: rootName }];
  const visitedPages = new Set();
  while (queue.length) {
    const { token, path } = queue.shift();
    let pageToken = '';
    while (true) {
      const key = token + '|' + (pageToken || 'first');
      if (visitedPages.has(key)) break;
      const data = listFolder(token + (pageToken ? '' : ''), pageToken ? undefined : undefined);
      visitedPages.add(key);
      (data.files || []).forEach(f => {
        const p = path + '/' + f.name;
        result.push({ path: p, type: f.type, token: f.token, parentToken: token, name: f.name });
        if (f.type === 'folder') queue.push({ token: f.token, path: p });
      });
      if (!data.has_more) break;
      pageToken = data.next_page_token || '';
      if (!pageToken) break;
    }
  }
  return result;
}

// 修正版：翻页支持
function walk2(rootToken, rootName) {
  const result = [];
  const queue = [{ token: rootToken, path: rootName }];
  while (queue.length) {
    const { token, path } = queue.shift();
    let pageToken = null;
    while (true) {
      const params = { folder_token: token, page_size: 200 };
      if (pageToken) params.page_token = pageToken;
      const out = execFileSync('lark-cli', ['drive', 'files', 'list', '--params', JSON.stringify(params), '--format', 'json', '--as', 'user'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
      const j = JSON.parse(out);
      if (!j.ok) throw new Error(JSON.stringify(j.error));
      const data = j.data;
      (data.files || []).forEach(f => {
        const p = path + '/' + f.name;
        result.push({ path: p, type: f.type, token: f.token, parentToken: token, name: f.name });
        if (f.type === 'folder') queue.push({ token: f.token, path: p });
      });
      if (!data.has_more || !data.next_page_token) break;
      pageToken = data.next_page_token;
    }
  }
  return result;
}

const srcTree = walk2('RDi1f1AJ9lPnvUdnfbccUptrnQc', 'ROOT');
const dstTree = walk2('MgCNfIeqGlUnPjdwe1lcz903n9d', 'ROOT');
fs.writeFileSync(__dirname + '/tree_src.json', JSON.stringify(srcTree, null, 1), 'utf8');
fs.writeFileSync(__dirname + '/tree_dst.json', JSON.stringify(dstTree, null, 1), 'utf8');
console.log('源目录条目:', srcTree.length, '(folder:', srcTree.filter(x=>x.type==='folder').length, ', file:', srcTree.filter(x=>x.type!=='folder').length, ')');
console.log('目标目录条目:', dstTree.length, '(folder:', dstTree.filter(x=>x.type==='folder').length, ', file:', dstTree.filter(x=>x.type!=='folder').length, ')');
console.log('\n=== 源目录树 ===');
srcTree.forEach(x => console.log('  '.repeat((x.path.match(/\//g)||[]).length - 1) + (x.type==='folder'?'[D] ':'[F] ') + x.name));
console.log('\n=== 目标目录树 ===');
dstTree.forEach(x => console.log('  '.repeat((x.path.match(/\//g)||[]).length - 1) + (x.type==='folder'?'[D] ':'[F] ') + x.name));
