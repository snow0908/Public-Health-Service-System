// 在目标 Drive 目录补全参照目录结构：创建缺失文件夹 + 复制占位文档
const { execFileSync } = require('child_process');

const DST_ROOT = 'MgCNfIeqGlUnPjdwe1lcz903n9d';
const srcTree = require('./tree_src.json');
const dstTree = require('./tree_dst.json');

const LARK = 'c:\\Users\\pleas\\.trae-cn\\plugins\\trae-remote-official\\lark\\1.0.5\\bin\\lark-cli.exe';

function cli(args) {
  const out = execFileSync(LARK, args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  // stdout-only JSON；忽略 stderr
  return JSON.parse(out);
}
function createFolder(parentToken, name) {
  const j = cli(['drive', '+create-folder', '--folder-token', parentToken, '--name', name, '--as', 'user', '--format', 'json']);
  if (!j.ok) throw new Error('create-folder failed: ' + name + ' → ' + JSON.stringify(j.error));
  return j.data;
}
function copyFile(srcToken, name, dstFolderToken) {
  const j = cli(['drive', '+copy', '--token', srcToken, '--type', 'file', '--name', name, '--folder-token', dstFolderToken, '--as', 'user', '--format', 'json']);
  if (!j.ok) throw new Error('copy failed: ' + name + ' → ' + JSON.stringify(j.error));
  return j.data;
}

// 目标目录已有的文件夹名（防重复创建）
const dstFoldersByParent = {};
dstTree.filter(x => x.type === 'folder').forEach(f => {
  (dstFoldersByParent[f.parentToken] = dstFoldersByParent[f.parentToken] || new Set()).add(f.name);
});

// 步骤 1：创建文件夹（映射：源文件夹token → 目标新建token）
const folderMap = {}; // srcFolderToken -> dstFolderToken
folderMap['RDi1f1AJ9lPnvUdnfbccUptrnQc'] = DST_ROOT; // 源根 → 目标根

const foldersToCreate = srcTree.filter(x => x.type === 'folder' && x.path !== 'ROOT/00.产品规划输入'); // 00.产品规划输入目标已有
for (const f of foldersToCreate) {
  const parentDst = folderMap[f.parentToken];
  if (!parentDst) throw new Error('parent not created yet: ' + f.path);
  const existing = (dstFoldersByParent[parentDst] || new Set());
  if (existing.has(f.name)) { console.log('跳过（已存在）:', f.path); continue; }
  const d = createFolder(parentDst, f.name);
  folderMap[f.token] = d.token || d.folder_token;
  console.log('创建文件夹:', f.path, '→', folderMap[f.token]);
}

// 步骤 2：复制占位文件（排除 00.产品规划输入 下的 4 个——目标已有实际文档）
const filesToCopy = srcTree.filter(x => x.type === 'file' && !x.path.startsWith('ROOT/00.产品规划输入'));
let ok = 0, fail = [];
for (const f of filesToCopy) {
  const dstFolder = folderMap[f.parentToken];
  if (!dstFolder) { fail.push(f.path + ' (无目标文件夹)'); continue; }
  try {
    copyFile(f.token, f.name, dstFolder);
    ok++;
    console.log('复制:', f.path);
  } catch (e) {
    fail.push(f.path + ' :: ' + e.message.slice(0, 120));
    console.log('失败:', f.path, e.message.slice(0, 120));
  }
}
console.log('\n=== 完成 ===');
console.log('文件夹创建:', foldersToCreate.length, '| 文件复制成功:', ok, '/', filesToCopy.length);
if (fail.length) { console.log('失败清单:'); fail.forEach(x => console.log(' -', x)); }
