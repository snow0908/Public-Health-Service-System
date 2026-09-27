/* 校验：体质辨识结果表 9 列 + 保健指导 9 行 + 保健方法工具栏 */
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('档案维护.html', 'utf8');
const i0 = src.indexOf('  var ETS_ITEMS = [');
const i1 = src.indexOf('  /* ================= 残疾人管理');
if (i0 < 0 || i1 < 0) { console.log('ANCHOR FAIL', i0, i1); process.exit(1); }
const code = src.slice(i0, i1);

/* 最小 DOM 桩 */
const store = {};
function mk(id) {
  return { id, _html: '', textContent: '', innerHTML: '', style: {},
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html; },
    classList: { add(){}, remove(){}, toggle(){} } };
}
global.document = {
  getElementById: (id) => (store[id] || (store[id] = mk(id))),
  querySelector: () => null,
  querySelectorAll: () => [],
  execCommand: () => true
};
global.$ = (id) => document.getElementById(id);
global.QS = { get: () => null };
global.P = { name: '张三', birth: '1955-03-08' };
global.toast = () => {};
global.wmToastSaved = () => {};
global.wmMissing = () => [];
global.setVal = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
global.msCount = () => {};

const ctx = vm.createContext(global);
vm.runInContext(code, ctx);
vm.runInContext('etsBuild();', ctx);

/* 1. 表格列头 */
const cols = ['气虚质','阳虚质','阴虚质','痰湿质','湿热质','血瘀质','气郁质','特禀质','平和质'];
let ok = 0;
cols.forEach((c, i) => { if (store['etsJtH' + i] && store['etsJtH' + i].textContent === c) ok++; });
console.log('列头 9 列:', ok + '/9', ok === 9 ? 'PASS' : 'FAIL');

/* 2. 得分 / 判定单元格：未作答时按设计稿均为 0 / 否 */
let scOk = 0, rsOk = 0;
cols.forEach((c, i) => {
  if (store['etsJtS' + i] && store['etsJtS' + i].textContent + '' === '0') scOk++;
  if (store['etsJtR' + i] && store['etsJtR' + i].textContent + '' === '否') rsOk++;
});
console.log('得分单元格 9 个（未作答=0）:', scOk + '/9', scOk === 9 ? 'PASS' : 'FAIL');
console.log('判定单元格 9 个（未作答=否）:', rsOk + '/9', rsOk === 9 ? 'PASS' : 'FAIL');

/* 4. 保健指导 9 行 × 6 选 */
const gb = store['etsGuideBody'] ? store['etsGuideBody'].innerHTML : '';
const rows = (gb.match(/<tr>/g) || []).length;
const chks = (gb.match(/type="checkbox"/g) || []).length;
console.log('保健指导行数:', rows, rows === 9 ? 'PASS' : 'FAIL', '| 复选框:', chks, chks === 54 ? 'PASS' : 'FAIL');

/* 5. 题目 33 × 5 */
const list = store['etsList'] ? store['etsList'].innerHTML : '';
const q = (list.match(/class="ets-q"/g) || []).length;
const r = (list.match(/type="radio"/g) || []).length;
console.log('题目块:', q, q === 33 ? 'PASS' : 'FAIL', '| 单选:', r, r === 165 ? 'PASS' : 'FAIL');

/* 6. 保健方法工具栏 */
const bar = store['etsEditBar'] ? store['etsEditBar'].innerHTML : '';
const btns = (bar.match(/class="ets-edit-btn"/g) || []).length;
console.log('工具栏按钮:', btns, btns === 9 ? 'PASS' : 'FAIL');

/* 7. 备注框已移除 */
const srcRaw = fs.readFileSync('档案维护.html', 'utf8');
console.log('备注框已移除:', !srcRaw.includes('etsRemark') ? 'PASS' : 'FAIL');
console.log('编辑器高度 150px:', srcRaw.includes('.ets-edit{min-height:150px') ? 'PASS' : 'FAIL');
console.log('旧下拉样式已清理:', !srcRaw.includes('ets-jt-sel') ? 'PASS' : 'FAIL');
