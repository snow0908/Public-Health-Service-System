const fs = require('fs');
const p = 'd:/AI_Project/Public-Health-Service-System/01-公共卫生服务系统产品文档/V1.0/02.需求设计/系统功能需求清单V2.html';
const s = fs.readFileSync(p, 'utf8');
const frDoc = fs.readFileSync('d:/AI_Project/Public-Health-Service-System/01-公共卫生服务系统产品文档/V1.0/02.需求设计/功能需求清单.html', 'utf8');
const frAnchors = new Set([...frDoc.matchAll(/id="(FR-\d{2}-\d{2})"/g)].map(m => m[1]));

// 1. 泄漏检查
const leaks = ['undefined', 'NaN', 'null<', '[object Object]'].filter(x => s.includes(x));
console.log('模板泄漏:', leaks.length ? leaks : '无');

// 2. 内部锚点完整性：所有 href="#xxx" 的目标都存在
const ids = new Set([...s.matchAll(/id="([a-zA-Z0-9_-]+)"/g)].map(m => m[1]));
const hrefs = [...s.matchAll(/href="#([a-zA-Z0-9_-]+)"/g)].map(m => m[1]);
const broken = [...new Set(hrefs.filter(h => !ids.has(h)))];
console.log('内部锚点:', hrefs.length, '个引用，断链:', broken.length ? broken : '无');

// 3. FR 跨文档链接：目标锚点在竞品清单中存在
const frLinks = [...new Set([...s.matchAll(/href="功能需求清单.html#(FR-\d{2}-\d{2})"/g)].map(m => m[1]))];
const badFR = frLinks.filter(f => !frAnchors.has(f));
console.log('FR 跨文档链接:', frLinks.length, '个，无效:', badFR.length ? badFR : '无');

// 4. 结构统计
const modSecs = (s.match(/class="mod-sec"/g) || []).length;
const reqItems = (s.match(/class="req-item"/g) || []).length;
const sysRows = (s.match(/id="SR-\d+"/g) || []).length;
console.log('模块区块:', modSecs, '| 功能项卡片:', reqItems, '| 系统级需求行:', sysRows);

// 5. 关键内容抽查：红线项、关键指标
['V2-06-02', '2 小时 / 24 小时', '家庭建档率 ≥85%', '电子预防接种证', '任务自动派发 ≥90%', '报表自动生成率 100%', '≥20 个', '平战切换', '红黄绿', '红线'].forEach(k => {
  console.log(s.includes(k) ? '✓' : '✗ 缺失:', k);
});

// 6. 范围外关键词反向检查（1.1/1.2 内容不应出现在模块明细的功能项中）
const modPart = s.slice(s.indexOf('id="sec-modules"'), s.indexOf('id="sec-out"'));
['AI 语音外呼随访', '全生命周期健康档案视图', '疫苗处方（', 'HIS 诊间医防融合'].forEach(k => {
  console.log(modPart.includes(k) ? '✗ 范围泄漏:' : '✓ 未泄漏:', k);
});
console.log('文件大小:', (fs.statSync(p).size / 1024).toFixed(1), 'KB');
