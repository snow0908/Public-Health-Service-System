/* 校验：中医健康指导（viewTcmGuide）结构与 wiring */
const fs = require('fs');
const src = fs.readFileSync('档案维护.html', 'utf8');

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (extra ? '  ' + extra : ''));
  cond ? pass++ : fail++;
}

/* --- 1. 视图容器存在 --- */
chk('viewTcmGuide 容器存在', src.includes('<div class="pv-view hidden" id="viewTcmGuide">'));

/* --- 2. 导航项存在且挂在 navTcmGroup 内 --- */
chk('导航项 navTcmGuide 存在', src.includes('id="navTcmGuide"') && src.includes("switchView('tcmGuide')"));
const tcmGroup = src.slice(src.indexOf('id="navTcmGroup"'), src.indexOf('id="navTbGroup"'));
chk('导航项位于中医管理目录内', tcmGroup.includes('navTcmGuide') && tcmGroup.includes('中医健康指导'));

/* --- 3. switchView 三处 wiring --- */
chk('isTcg 判定声明', src.includes("var isTcg = name === 'tcmGuide';"));
chk('viewTcmGuide hidden 切换', src.includes("$('viewTcmGuide').classList.toggle('hidden', !isTcg);"));
chk('navTcmGuide active 切换', src.includes("$('navTcmGuide').classList.toggle('active', isTcg);"));
chk('isTcg 分组展开分支', /}\s*else if \(isTcg\) \{\s*\$\('navTcmGroup'\)\.classList\.add\('open'\);/.test(src));

/* --- 4. init / edit 分派 --- */
chk('initView 分派 tcmGuide', src.includes("initView === 'tcmGuide'") && src.includes('tcgFillHead();'));
chk('edit 分支 mockTcmGuide', src.includes("initView === 'tcmGuide') { mockTcmGuide(); }"));

/* --- 5. JS 函数定义齐全 --- */
['tcgFillHead', 'tcgCount', 'tcgChecked', 'saveTcmGuide', 'mockTcmGuide'].forEach(f => {
  chk('函数 ' + f + ' 已定义', new RegExp('function ' + f + '\\s*\\(').test(src));
});

/* --- 6. 视图块内部标签平衡 --- */
const a = src.indexOf('<!-- ===== 视图：中医健康指导（中医管理） =====');
const b = src.indexOf('<!-- ===== 视图：残疾人基本信息');
const seg = src.slice(a, b);
const cnt = (re) => (seg.match(re) || []).length;
chk('块内 <td> 平衡', cnt(/<td[\s>]/g) === cnt(/<\/td>/g), cnt(/<td[\s>]/g) + '/' + cnt(/<\/td>/g));
chk('块内 <tr> 平衡', cnt(/<tr[\s>]/g) === cnt(/<\/tr>/g), cnt(/<tr[\s>]/g) + '/' + cnt(/<\/tr>/g));
chk('块内 <div> 平衡', cnt(/<div[\s>]/g) === cnt(/<\/div>/g), cnt(/<div[\s>]/g) + '/' + cnt(/<\/div>/g));
chk('块内 <table>/<tbody> 平衡', cnt(/<table/g) === cnt(/<\/table>/g) && cnt(/<tbody/g) === cnt(/<\/tbody>/g));

/* --- 7. 各字段与选项组 --- */
const needR = {
  tcgGroup: 5, tcgOldMind: 9, tcgOldUrine: 5, tcgOldShape: 8, tcgOldWaist: 7,
  tcgOldSleep: 6, tcgOldEar: 4, tcgBpMain: 6, tcgBpSub: 22, tcgBpTongue: 7,
  tcgDmMain: 6, tcgDmSub: 11, tcgDmTongue: 3, tcgType: 10, tcgBpType: 6,
  tcgDmType: 4, tcgHealth: 9
};
Object.keys(needR).forEach(n => {
  const c = (seg.match(new RegExp('name="' + n + '"', 'g')) || []).length;
  chk('选项组 ' + n + ' = ' + needR[n], c === needR[n], '实际 ' + c);
});

/* --- 8. 关键 DOM id --- */
['tcgNameTxt', 'tcgArchNo', 'tcgGenderTxt', 'tcgBirthTxt', 'tcgIdcardTxt', 'tcgPhoneTxt',
 'tcgSummary', 'tcgSummaryCnt', 'tcgDoctor', 'tcgDate'].forEach(id => {
  chk('id ' + id, seg.includes('id="' + id + '"'));
});

/* --- 9. 关键标签行 --- */
['姓名', '性别', '出生年月', '证件号', '联系电话', '人群分类', '心理', '小便', '形体',
 '腰腿痛', '睡眠', '听力', '主症', '次症', '舌脉', '健康判定', '指导医师', '评估日期',
 '中医体质判定', '高血压辨证', '糖尿病辨证', '健康状况'].forEach(t => {
  chk('标签「' + t + '」', seg.includes('>' + t + '<') || seg.includes(t + '</td>'));
});

/* --- 10. 分组行 rowspan --- */
chk('老年人 rowspan=6', seg.includes('rowspan="6"'));
chk('高血压 rowspan=3', seg.includes('>高血压</td>') || (seg.match(/rowspan="3"/g) || []).length >= 2);

console.log('\n汇总: PASS=' + pass + '  FAIL=' + fail);
process.exit(fail ? 1 : 0);
