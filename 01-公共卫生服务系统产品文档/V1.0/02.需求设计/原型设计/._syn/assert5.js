/* 校验：体质辨识结果自动计算是否符合《体质判定标准表》 */
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('档案维护.html', 'utf8');
const i0 = src.indexOf('  var ETS_ITEMS = [');
const i1 = src.indexOf('  /* ================= 残疾人管理');
const code = src.slice(i0, i1);

/* 可作答的 DOM 桩：记录每道题的选中值 */
const answers = {};   // { 1: 4, ... }
const store = {};
function mk(id) {
  return { id, textContent: '', style: {}, _html: '',
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    classList: { add(){}, remove(){}, toggle(){} } };
}
global.document = {
  getElementById: (id) => (store[id] || (store[id] = mk(id))),
  querySelector: (sel) => {
    const m = /etsQ(\d+)/.exec(sel);
    if (m && answers[+m[1]] != null) return { value: String(answers[+m[1]]) };
    return null;
  },
  querySelectorAll: () => [],
  execCommand: () => true
};
global.$ = (id) => document.getElementById(id);
global.QS = { get: () => null };
global.P = { name: '测试', birth: '1950-01-01' };
global.toast = () => {};
global.wmToastSaved = () => {};
global.wmMissing = () => [];
global.setVal = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
global.msCount = () => {};

const ctx = vm.createContext(global);
vm.runInContext(code, ctx);

function setAns(obj) { for (const k in answers) delete answers[k]; Object.assign(answers, obj); }
function judge() { return vm.runInContext('etsJudgeAll()', ctx); }
function fillAll(v) { const o = {}; for (let i = 1; i <= 33; i++) o[i] = v; return o; }

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + name + ' => ' + JSON.stringify(got) + (ok ? '' : '  期望 ' + JSON.stringify(want)));
  ok ? pass++ : fail++;
}

/* ---- 用例 1：全部选「没有」（1 分）----
   各偏颇体质原始分 = 4（4题×1分）→ ≤8 → 否
   平和质 = (1)+(6-2)+(6-4)+(6-5)+(6-13) 代入每题 1 分：
     题1=1、题2反→5、题4反→5、题5反→5、题13反→5 = 21 分 ≥17 且其他 8 种均 4 分 <8 → 是 */
setAns(fillAll(1));
let r = judge();
eq('全选1分｜体质辨识结果均为「否」', r['气虚质'].result + r['阳虚质'].result + r['阴虚质'].result + r['痰湿质'].result + r['湿热质'].result + r['血瘀质'].result + r['气郁质'].result + r['特禀质'].result, '否否否否否否否否');
eq('全选1分｜偏颇体质得分=4', [r['气虚质'].score, r['阳虚质'].score, r['阴虚质'].score, r['痰湿质'].score, r['湿热质'].score, r['血瘀质'].score, r['气郁质'].score, r['特禀质'].score], [4,4,4,4,4,4,4,4]);
eq('全选1分｜平和质得分=21 判定=是', [r['平和质'].score, r['平和质'].result], [21, '是']);

/* ---- 用例 2：全部选「总是」（5 分）----
   偏颇体质 = 20 分 ≥11 → 是；平和质 = 5+(1)+(1)+(1)+(1)=9 <17 → 否 */
setAns(fillAll(5));
r = judge();
eq('全选5分｜8种偏颇体质均「是」', r['气虚质'].result + r['阳虚质'].result + r['阴虚质'].result + r['痰湿质'].result + r['湿热质'].result + r['血瘀质'].result + r['气郁质'].result + r['特禀质'].result, '是是是是是是是是');
eq('全选5分｜偏颇体质得分=20', r['气虚质'].score, 20);
eq('全选5分｜平和质=否', [r['平和质'].score, r['平和质'].result], [9, '否']);

/* ---- 用例 3：气虚质组（题 2/3/4/14）合计 10 分 → 倾向是 ---- */
setAns(fillAll(1));
answers[3] = 4; answers[4] = 4; answers[14] = 3;  // 2:1 + 3:4 + 4:4 + 14:3 = 12? 逐项验算
r = judge();
console.log('  [调试] 题2=' + answers[2] + ' 题3=' + answers[3] + ' 题4=' + answers[4] + ' 题14=' + answers[14] + ' → 气虚质=' + r['气虚质'].score);
eq('边界｜气虚质 12 分 ≥11 →「是」', r['气虚质'].result, '是');

setAns(fillAll(1));
answers[3] = 4; answers[4] = 4; answers[14] = 2;  // 1+4+4+2 = 11
r = judge();
eq('边界｜气虚质 11 分 →「是」', [r['气虚质'].score, r['气虚质'].result], [11, '是']);

setAns(fillAll(1));
answers[3] = 4; answers[4] = 4; answers[14] = 1;  // 1+4+4+1 = 10
r = judge();
eq('边界｜气虚质 10 分 →「倾向是」', [r['气虚质'].score, r['气虚质'].result], [10, '倾向是']);

setAns(fillAll(1));
answers[3] = 3; answers[4] = 3; answers[14] = 1;  // 1+3+3+1 = 8
r = judge();
eq('边界｜气虚质 8 分 →「否」', [r['气虚质'].score, r['气虚质'].result], [8, '否']);

setAns(fillAll(1));
answers[3] = 3; answers[4] = 3; answers[14] = 2;  // 1+3+3+2 = 9
r = judge();
eq('边界｜气虚质 9 分 →「倾向是」', [r['气虚质'].score, r['气虚质'].result], [9, '倾向是']);

/* ---- 用例 4：平和质边界 ----
   平和质原始分 17，其他 8 种最大 7 →「是」 */
setAns(fillAll(1));
answers[1] = 5;  // 题1=5；题2反(1)=5、题4反(1)=5、题5反(1)=5、题13反(1)=5 → 5+5+5+5+5=25 ≥17
r = judge();
eq('平和质｜得分25 且偏颇均为4(<8) →「是」', [r['平和质'].score, r['平和质'].result], [25, '是']);

/* 让某偏颇体质 = 9 分（<10 但 ≥8）→ 平和质应降级为「基本是」
   注意：气虚质组含题 2/4，会同时影响平和质反向分，故只动题 3/14 并另调题 1 补偿。
   目标：气虚质 9 分、平和质仍 ≥17。
   基线全 1：气虚质 = 1+1+1+1 = 4；平和质 = 1+5+5+5+5 = 21。
   取 题3=5, 题14=2 → 气虚质 = 1+5+1+2 = 9；平和质不变 = 21 */
setAns(fillAll(1));
answers[3] = 5; answers[14] = 2;
r = judge();
eq('平和质｜某偏颇=9 分(<10) →「基本是」', [r['平和质'].score, r['气虚质'].score, r['平和质'].result], [21, 9, '基本是']);

/* 让某偏颇体质 = 10 分（≥10）→ 平和质应降为「否」
   基线全 1：取 题3=5, 题14=3 → 气虚质 = 1+5+1+3 = 10；平和质不变 = 21 */
setAns(fillAll(1));
answers[3] = 5; answers[14] = 3;
r = judge();
eq('平和质｜某偏颇=10 分(≥10) →「否」', [r['平和质'].score, r['气虚质'].score, r['平和质'].result], [21, 10, '否']);

/* 平和质原始分 16（<17）→「否」
   全 1 时平和质 = 21；把题 1 从 1 降到 0 不可行，改为抬高反向题：
   题2=5(反1)、题4=5(反1)、题5=5(反1)、题13=5(反1)、题1=1 → 平和质 = 5 <17 */
setAns(fillAll(1));
answers[1] = 1; answers[2] = 5; answers[4] = 5; answers[5] = 5; answers[13] = 5;
r = judge();
eq('平和质｜原始分<17 →「否」', [r['平和质'].score, r['平和质'].result], [5, '否']);

/* ---- 用例 5：未作答 ---- */
setAns({});
r = judge();
eq('未作答｜ready=false 且判定均为「否」', [r._ready, r['平和质'].result, r['气虚质'].ready], [false, '否', false]);

/* ---- 用例 6：反向计分单调性 ---- */
setAns(fillAll(1)); answers[2] = 5; const p5 = judge()['平和质'].score;
setAns(fillAll(1)); answers[2] = 1; const p1 = judge()['平和质'].score;
eq('反向计分｜题2 选5 的平和质得分 应低于 选1', p5 < p1, true);
console.log('  平和质: 题2=5 → ' + p5 + ' ; 题2=1 → ' + p1);

/* ---- 用例 7：官方示例1 复原 ----
   平和质75分、气虚质56、阳虚质27、阴虚质25、痰湿质12、湿热质15、血瘀质20、气郁质18、特禀质10
   规范：转化分≥60 才可能为平和质，但这里用「原始分」标准，仅验证偏颇体质阈值逻辑 */
setAns(fillAll(1));
answers[3] = 4; answers[4] = 5; answers[2] = 5; answers[14] = 4;  // 气虚质 = 5+4+5+4 = 18 ≥11 → 是
r = judge();
eq('偏颇体质｜气虚质 18 分 →「是」', [r['气虚质'].score, r['气虚质'].result], [18, '是']);

console.log('\n汇总: PASS=' + pass + '  FAIL=' + fail);
process.exit(fail ? 1 : 0);
