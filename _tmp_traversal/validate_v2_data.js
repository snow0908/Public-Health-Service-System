const d = require('d:/AI_Project/Public-Health-Service-System/_tmp_traversal/v2_req_data.js');
const v2 = require('d:/AI_Project/Public-Health-Service-System/_tmp_traversal/build_report_v2_data.js');
const validFR = new Set(v2.entries.map(e => e.code));
let total = 0, byBuild = { reuse: 0, adapt: 0, new: 0 }, byPri = { P0: 0, P1: 0, P2: 0 }, badFR = [], ids = new Set(), dupIds = [];
d.MODULES.forEach(m => {
  m.items.forEach(it => {
    total++; byBuild[it.build]++; byPri[m.pri]++;
    if (ids.has(it.id)) dupIds.push(it.id); ids.add(it.id);
    (it.frRef.match(/FR-\d{2}-\d{2}/g) || []).forEach(f => { if (!validFR.has(f)) badFR.push(it.id + ':' + f); });
    if (!it.desc || !it.accept) badFR.push(it.id + ':missing desc/accept');
  });
});
console.log('模块数:', d.MODULES.length, '| 功能项总数:', total);
console.log('建设方式:', JSON.stringify(byBuild), '| 优先级:', JSON.stringify(byPri));
console.log('重复ID:', dupIds.length ? dupIds : '无', '| 异常:', badFR.length ? badFR : '无');
console.log('系统级需求:', d.SYS_REQS.length, '| 范围外:', d.OUT_OF_SCOPE.length, '| 里程碑:', d.MILESTONES.length, '| 风险门:', d.GATES.length);
const frUsed = new Set();
d.MODULES.forEach(m => m.items.forEach(it => (it.frRef.match(/FR-\d{2}-\d{2}/g) || []).forEach(f => frUsed.add(f))));
console.log('引用竞品FR数量:', frUsed.size, '/86 →', [...frUsed].sort().join(', '));
