const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const R = (p) => JSON.parse(fs.readFileSync(path.join(DIR, p), 'utf8'));

const batches = [];
for (let i = 1; i <= 10; i++) batches.push(...R(path.join('results', 'batch_' + i + '.json')));
const specialArr = R(path.join('results', 'batch_special.json'));
const special = {};
specialArr.forEach(s => { special[s.label] = s.data; });

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MODULES = [
  { name: '消息', pri: 'P1', desc: '系统消息中心，统一聚合任务提醒与系统通知，支持未读管理与任务跳转处理。' },
  { name: '工作台', pri: 'P1', desc: '个人工作首页与数据可视化大屏，快速掌握辖区建档、疾病分布与公卫项目完成情况。' },
  { name: '计划提醒', pri: 'P0', desc: '面向随访与服务的计划管理，按人群/项目分类跟踪待执行服务计划与各类档案提醒。' },
  { name: '档案管理', pri: 'P0', desc: '居民健康档案核心模块，覆盖个人档案、家庭档案、健康体检、残疾档案以及档案迁移/审核/恢复/查阅的全生命周期管理。' },
  { name: '系统设置', pri: 'P2', desc: '系统级基础数据与参数配置，包括辖区管理、业务模板、随访/指标参数、补助、疾病诊疗设置与运行日志。' },
  { name: '中医管理', pri: 'P1', desc: '老年人与儿童中医药健康管理及中医健康指导服务记录。' },
  { name: '健教管理', pri: 'P1', desc: '健康教育活动、宣传栏、音像资料、广播、个体化健康教育与健教计划的登记管理。' },
  { name: '业务查询', pri: 'P1', desc: '面向业务人员的综合查询入口，内嵌通用SQL自助查询平台，支持个人档案及各类重点人群档案的即席查询。' },
  { name: '卫生监督', pri: 'P1', desc: '卫生监督协管工作管理，包括监督地点维护、巡查登记与事件报告。' },
  { name: '疾病报卡', pri: 'P0', desc: '传染病、早孕、慢病报告卡的登记、订正与管理。' },
  { name: '突发公卫事件', pri: 'P1', desc: '突发公共卫生事件的报告与处置记录管理。' },
  { name: '三网监测', pri: 'P1', desc: '妇幼三网监测，覆盖孕产妇死亡、围产儿死亡、新生儿缺陷与儿童死亡的报告管理。' },
  { name: '慢病管理', pri: 'P0', desc: '高血压、糖尿病、高血脂、肿瘤、心脑血管、慢阻肺等慢性病的专项档案与随访服务管理。' },
  { name: '重精管理', pri: 'P1', desc: '严重精神障碍患者的专项档案与随访服务管理。' },
  { name: '结核管理', pri: 'P1', desc: '肺结核患者的专项档案与随访服务管理。' },
  { name: '老年人管理', pri: 'P1', desc: '65岁及以上老年人健康管理，包括健康档案维护与健康评估。' },
  { name: '妇幼管理', pri: 'P0', desc: '妇女、孕产妇、儿童保健管理，预防接种管理，两癌筛查与母婴阻断（乙肝/梅毒/艾滋）管理。' },
  { name: '辖区统计', pri: 'P2', desc: '以行政区划（社区居委会）维度组织的辖区统计信息展示。' },
  { name: '业务报表', pri: 'P1', desc: '居民、老年人、高血压、肺结核、糖尿病、精神障碍、中医药等国家基本公共卫生服务报表的统计查询与导出。' }
];

const FEATURE_MAP = {
  '查询': '组合条件查询', '重置': '条件重置', '展开': '查询条件展开收起',
  '新建': '新建登记', '新建专项': '新建专项档案', '新增': '新增', '+ 添加': '添加配置项',
  '新建活动记录': '新建活动记录', '新建宣传栏记录': '新建宣传栏记录', '新建资料记录': '新建资料记录',
  '新建广播记录': '新建广播记录', '新建计划': '新建健教计划', '申请个档迁移': '发起个档迁移申请',
  '申请儿童迁移': '发起儿童迁移申请', '新建随访': '新建随访记录', '新建服务': '新建服务记录',
  '导出': '列表导出', '打印': '打印输出', '查看': '详情查看', '编辑': '编辑修改',
  '删除': '删除', '注销': '档案注销', '订正': '报卡订正', '评估': '健康评估',
  '关联个档': '关联个人档案', '身份证读卡': '身份证读卡器建档', '上移': '排序上移', '下移': '排序下移',
  '保存': '配置保存', '详情': '传输详情查看', '更多': '更多行级操作'
};

const OVERRIDES = {
  '居民档案': { desc: '居民个人健康档案管理，全系统的核心档案入口：支持按管理机构、姓名、证件号、档案状态等22项条件组合检索，列表展示性别、年龄、证件号、档案编号等25项字段；支持身份证读卡快速建档、新建档案、查看、编辑及更多行级操作。' },
  '家庭档案': { desc: '家庭健康档案管理，以户为单位建档：含家庭基本信息、家庭成员、精准扶贫（收入信息与帮扶项目）三个页签；支持按家庭状态、扶贫状态等9项条件查询，提供新建、导出操作。' },
  '服务计划': { desc: '公卫服务计划管理：按健康体检、高血压、糖尿病、肺结核、严重精神障碍、儿童、妇女、孕产妇等服务项目分类查看待执行服务计划，支持按机构、医生、计划时间等10项条件检索与导出。' },
  '提醒管理': { desc: '档案提醒管理：含居民建档提醒、档案更新提醒、慢病档案提醒、居民死亡提醒、家庭成员提醒五类提醒页签，按提醒类型跟踪待处理提醒及处理状态。' },
  '档案迁移': { desc: '档案迁移申请管理：支持发起个人档案迁移与儿童档案迁移申请，配合迁入审核、迁出审核形成迁移闭环流程。' },
  '迁入审核': { desc: '档案迁入审核：对迁入本辖区的档案迁移申请进行审核处理，支持查询、查看与导出。' },
  '迁出审核': { desc: '档案迁出审核：对迁出本辖区的档案迁移申请进行审核处理，支持查询与导出。' },
  '老年人管理': { desc: '老年人健康管理：65岁及以上老年人健康档案列表管理，支持健康评估操作与随访服务入口，按管理状态、人群分类等12项条件检索。' },
  '计免管理': { desc: '预防接种管理：儿童预防接种记录管理，支持新建接种记录与按接种状态检索、导出。' },
  '高血压管理': { desc: '高血压患者专项档案与随访管理：支持25项条件组合检索患者列表（含管理状态、随访状态、血压分级等），提供新建专项、新建随访、查看、编辑等操作，按规范随访周期跟踪血压控制情况。' },
  '孕产妇查询': { desc: '孕产妇专项查询：按条件查询孕产妇档案信息（实测环境页面数据未加载，上线前需确认查询配置）。', query: [], cols: [], ops: ['查询', '重置'] },
  '辖区统计': { desc: '行政区划信息展示：以社区居委会列表形式展示辖区行政区划结构，作为辖区维度统计的入口。', query: [], cols: ['社区居委会名称'], ops: [] }
};

const SPECIAL_PAGES = {
  '所有消息': { desc: '消息中心：聚合展示未读通知数与待处理任务数，提供任务通知、待处理任务、未读通知三个信息区，支持全部标记已读与消息跳转处理。', tabs: ['任务', '通知'], ops: ['全部标记已读', '消息跳转处理'] },
  '任务详情': { desc: '任务消息列表：按类型（如待处理）筛选查看任务消息，点击可跳转对应业务页面处理（实测环境暂无待处理任务）。', tabs: ['待处理'], ops: ['类型筛选', '任务跳转'] },
  '通知详情': { desc: '系统通知列表：按已读/未读/全部状态筛选，分页浏览系统通知（如异常登录提醒），支持标记已读。', tabs: ['已读', '未读', '全部'], ops: ['状态筛选', '分页浏览', '标记已读'] },
  '首页': { desc: '工作台仪表盘：展示辖区建档总数、疾病情况TOP10排行（高血压、糖尿病、结核病等）与各公卫项目（高血压/糖尿病/老年人/孕产妇/儿童/精神病）完成进度。', ops: [] },
  '大屏': { desc: '数据可视化大屏：外嵌第三方BI平台（de-bi-container 模板大屏），用于辖区公卫数据的大屏展示。', external: true, ops: [] }
};

const EXT_QUERY_PAGES = [
  { name: '个人档案查询' },
  { name: '高血压患者查询' },
  { name: '糖尿病患者查询' },
  { name: '严重精神障碍患者查询' },
  { name: '肺结核患者查询' },
  { name: '老年人查询' },
  { name: '高危档案查询' },
  { name: '老年人中医药管理查询' }
];
const EXT_QUERY_DESC = '通用自助查询：外嵌SQL自助查询平台（currentQsService）查询视图，系统通过iframe携带用户令牌（token）按queryId加载对应数据集，支持自助配置查询条件、执行查询与结果导出。';

function mergeTables(d) {
  const map = new Map();
  (d.tables || []).forEach(t => {
    const key = t.tab || '';
    if (!map.has(key)) map.set(key, []);
    t.columns.forEach(c => { if (!map.get(key).includes(c)) map.get(key).push(c); });
  });
  let arr = Array.from(map.entries()).map(([tab, columns]) => ({ tab, columns }));
  if (!arr.length && (d.tableColumns || []).length) arr = [{ tab: '', columns: d.tableColumns }];
  arr.sort((a, b) => {
    if (a.tab === '' && b.tab !== '') return -1;
    if (b.tab === '' && a.tab !== '') return 1;
    return b.columns.length - a.columns.length;
  });
  return arr;
}

function makeDesc(p, d) {
  const q = d.queryFields || [];
  const cols = d.tableColumns || [];
  const btns = d.buttons || [];
  const parts = [];
  if (q.length >= 3) parts.push('支持按' + q.slice(0, 3).join('、') + '等' + q.length + '项条件组合查询');
  else if (q.length > 0) parts.push('支持按' + q.join('、') + '条件查询');
  if (cols.length >= 3) parts.push('列表展示' + cols.slice(0, 3).join('、') + '等' + cols.length + '项字段');
  else if (cols.length > 0) parts.push('列表展示' + cols.join('、') + '字段');
  const feats = btns.map(b => FEATURE_MAP[b]).filter(Boolean);
  const uniqFeats = [...new Set(feats)];
  if (uniqFeats.length) parts.push('提供' + uniqFeats.slice(0, 6).join('、') + '功能');
  if (!parts.length) return p.label + '功能页面。';
  return parts.join('，') + '。';
}

const byModule = new Map();
MODULES.forEach(m => byModule.set(m.name, []));
batches.forEach(b => {
  if (!byModule.has(b.module)) byModule.set(b.module, []);
  byModule.get(b.module).push(b);
});

const entries = [];
MODULES.forEach((m, mi) => {
  const code = 'FR-' + String(mi + 1).padStart(2, '0');
  m.code = code;
  const list = byModule.get(m.name) || [];
  const items = [];
  if (m.name === '消息') {
    items.push({ label: '所有消息', group: '', href: '#/messages/more-message', data: { title: '所有消息', tabs: SPECIAL_PAGES['所有消息'].tabs, queryFields: [], placeholders: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
    items.push({ label: '任务详情', group: '', href: '#/messages/task-info', data: { title: '任务详情', tabs: SPECIAL_PAGES['任务详情'].tabs, queryFields: [], placeholders: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
    items.push({ label: '通知详情', group: '', href: '#/messages/notice-info', data: { title: '通知详情', tabs: SPECIAL_PAGES['通知详情'].tabs, queryFields: [], placeholders: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
  }
  if (m.name === '工作台') {
    items.push({ label: '首页', group: '', href: '#/home', data: { title: '首页', queryFields: [], placeholders: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
    items.push({ label: '大屏', group: '', href: '#/daping?external=1', data: { title: '大屏', queryFields: [], placeholders: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
  }
  list.forEach(p => { if (!items.some(x => x.label === p.label)) items.push(p); });
  if (m.name === '业务查询') {
    const extItems = EXT_QUERY_PAGES.map(e => ({ label: e.name, group: '外嵌查询', href: 'external', data: { title: e.name, queryFields: [], placeholders: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } }));
    const idx = items.findIndex(x => x.label === '孕产妇查询');
    const internal = items.splice(idx, 1);
    items.unshift(...internal, ...extItems);
  }
  items.forEach((p, pi) => {
    const frCode = code + '-' + String(pi + 1).padStart(2, '0');
    const ov = OVERRIDES[p.label] || {};
    const sp = SPECIAL_PAGES[p.label] || {};
    const isExternal = p.href === 'external' || p.label === '大屏';
    let desc, query, tables, ops, tabs;
    if (isExternal) {
      desc = p.label === '大屏' ? sp.desc : EXT_QUERY_DESC;
      query = []; tables = []; ops = p.label === '大屏' ? [] : ['自助查询配置', '查询执行', '结果导出'];
      tabs = [];
    } else if (sp.desc) {
      desc = sp.desc;
      query = p.data ? (p.data.queryFields || []) : [];
      tables = p.data ? mergeTables(p.data) : [];
      ops = sp.ops || [];
      tabs = sp.tabs || [];
    } else {
      desc = ov.desc || makeDesc(p, p.data || {});
      query = ov.query || (p.data ? (p.data.queryFields || []) : []);
      tables = ov.cols ? ov.cols.map(c => ({ tab: '', columns: [c] })) : mergeTables(p.data || {});
      ops = ov.ops || (p.data ? (p.data.buttons || []) : []);
      tabs = p.data ? (p.data.tabs || []) : [];
    }
    let pri = m.pri;
    if (['操作日志', '档案传输记录', '大屏'].includes(p.label)) pri = 'P2';
    entries.push({
      code: frCode, module: m.name, group: p.group || '', name: p.label,
      route: isExternal ? (p.label === '大屏' ? '外部BI平台嵌入' : '外部查询平台嵌入') : p.href.replace('#', ''),
      desc, query, tables, ops, tabs, pri, external: isExternal
    });
  });
});

const statMenus = entries.length;
const statPages = entries.filter(e => !e.external).length;
const statQuery = entries.reduce((s, e) => s + e.query.length, 0);
const statCols = entries.reduce((s, e) => s + e.tables.reduce((x, t) => x + t.columns.length, 0), 0);
const opSet = new Set();
entries.forEach(e => e.ops.forEach(o => opSet.add(o)));

const menuCount = {};
MODULES.forEach(m => menuCount[m.name] = 0);
entries.forEach(e => menuCount[e.module]++);

function chips(arr) {
  return arr.map(a => '<span class="chip">' + esc(a) + '</span>').join('');
}

function tableText(tables) {
  if (!tables.length) return '<span class="none">—</span>';
  return tables.map(t => {
    const label = t.tab ? '<b>' + esc(t.tab) + '</b>：' : '';
    return label + esc(t.columns.join('、'));
  }).join('；');
}

const priTag = (p) => '<span class="tag tag-' + p.toLowerCase() + '">' + p + '</span>';

let moduleSections = '';
MODULES.forEach((m, mi) => {
  const mes = entries.filter(e => e.module === m.name);
  let pagesHtml = '';
  mes.forEach(e => {
    pagesHtml += `
    <article class="page-item" id="${e.code}">
      <div class="page-head">
        <span class="fr-code">${e.code}</span>
        <h4>${esc(e.name)}${e.group ? '<span class="group-badge">' + esc(e.group) + '</span>' : ''}</h4>
        ${priTag(e.pri)}
        <span class="route">${esc(e.route)}</span>
      </div>
      <p class="page-desc">${esc(e.desc)}</p>
      <dl class="page-detail">
        <div class="row"><dt>查询条件</dt><dd>${e.query.length ? esc(e.query.join('、')) : '<span class="none">—</span>'}</dd></div>
        <div class="row"><dt>列表字段</dt><dd>${tableText(e.tables)}</dd></div>
        <div class="row"><dt>操作功能</dt><dd>${e.ops.length ? chips(e.ops) : '<span class="none">—</span>'}</dd></div>
        ${e.tabs.length ? '<div class="row"><dt>页面页签</dt><dd>' + chips(e.tabs) + '</dd></div>' : ''}
      </dl>
    </article>`;
  });
  moduleSections += `
  <section class="module-sec" id="mod-${String(mi + 1).padStart(2, '0')}">
    <div class="module-head">
      <span class="mod-code">${m.code}</span>
      <h3>${esc(m.name)}</h3>
      ${priTag(m.pri)}
      <span class="mod-count">${menuCount[m.name]} 个功能菜单</span>
    </div>
    <p class="module-desc">${esc(m.desc)}</p>
    ${pagesHtml}
  </section>`;
});

const tocLinks = MODULES.map((m, mi) => '<a href="#mod-' + String(mi + 1).padStart(2, '0') + '">' + m.code + ' ' + esc(m.name) + '</a>').join('');

const archRows = MODULES.map((m, mi) => {
  const count = menuCount[m.name];
  const width = Math.max(4, Math.round(count / 13 * 100));
  return '<tr><th scope="row"><a href="#mod-' + String(mi + 1).padStart(2, '0') + '">' + m.code + ' ' + esc(m.name) + '</a></th><td>' + count + '</td><td><span class="bar"><i style="width:' + width + '%"></i></span></td><td>' + priTag(m.pri) + '</td><td class="arch-desc">' + esc(m.desc) + '</td></tr>';
}).join('');

const summaryRows = entries.map(e => {
  const ops = e.ops.slice(0, 5).map(o => FEATURE_MAP[o] || o).join('、') + (e.ops.length > 5 ? ' 等' : '');
  return '<tr><td class="mono">' + e.code + '</td><td>' + esc(e.module) + '</td><td>' + esc(e.name) + '</td><td>' + priTag(e.pri) + '</td><td>' + esc(ops || '—') + '</td></tr>';
}).join('');

const NFR = [
  ['硬件集成', '多个建档/报卡页面提供"身份证读卡"入口，需集成身份证读卡器硬件接口，读取身份信息自动填充建档表单。'],
  ['外嵌BI大屏', '工作台"大屏"菜单外嵌第三方BI平台（de-bi-container 模板），需评估自研可视化或采购对接方案。'],
  ['外嵌查询平台', '业务查询模块8个菜单外嵌SQL自助查询平台（currentQsService），通过iframe携带用户token按queryId加载数据集，需决策自研报表查询引擎或延续外采。'],
  ['数据导出', '绝大多数列表页面提供"导出"操作，需统一实现列表数据导出（Excel）能力，并考虑大数据量的异步导出。'],
  ['单据打印', '卫生监督巡查登记、事件报告等页面支持"打印"操作，需提供打印模板能力。'],
  ['消息通知', '系统内置消息中心（任务/通知），支持异常登录提醒等系统级通知与全部标记已读，需设计站内消息机制。'],
  ['行政区划与机构权限', '查询条件普遍包含管理机构、管辖行政区、管辖网格三级筛选，数据按机构/部门隔离（登录令牌含部门与机构信息），需设计组织机构与数据权限模型。'],
  ['档案迁移工作流', '档案迁移遵循"迁移申请→迁入/迁出审核→档案恢复"的流转闭环，需设计对应的审批工作流。'],
  ['随访计划引擎', '计划提醒与各病种"新建随访"功能依赖随访计划规则（随访参数维护、指标参数维护），需设计可配置的随访计划引擎。'],
  ['操作审计', '系统提供操作日志与档案传输记录查询，需记录关键操作审计轨迹。']
];
const nfrRows = NFR.map((n, i) => '<div class="feat-row"><div class="feat-title"><span class="feat-no">NFR-' + String(i + 1).padStart(2, '0') + '</span>' + esc(n[0]) + '</div><p>' + esc(n[1]) + '</p></div>').join('');

const RECS = [
  { title: '以本清单作为V1.0功能基线组织需求评审', reason: '清单覆盖竞品全部19个一级模块、86个功能菜单，来源于逐页实测，完整度高。', impact: '快速锁定V1.0功能范围，避免需求遗漏。', next: '组织产品/研发/测试三方评审，输出需求跟踪矩阵（RTM）。' },
  { title: '对P0模块开展字段级需求细化', reason: '本清单采集到页面级查询条件与列表字段，新建/编辑弹窗内的表单字段尚未逐项展开。', impact: '表单字段是开发建表与接口设计的关键输入。', next: '按模块逐一打开新建/编辑/查看弹窗，补充字段级FRD文档。' },
  { title: '结合原型与网络请求梳理接口清单', reason: '重建系统需要完整的接口契约，当前仅掌握页面结构与菜单路由。', impact: '支撑技术架构与工作量评估。', next: '参考《00.产品规划输入/竞品内容》中的原型与售前资料，梳理接口与数据模型。' },
  { title: '明确外嵌能力的技术选型', reason: '竞品的大屏（BI平台）与业务查询（SQL自助查询平台）均为外嵌第三方系统。', impact: '选型决策直接影响架构设计、采购成本与交付周期。', next: '对比自研可视化/查询引擎与外采方案，输出技术选型评审结论。' }
];
const recHtml = RECS.map(r => '<div class="rec-block"><h4>' + esc(r.title) + '</h4><dl><div><dt>原因</dt><dd>' + esc(r.reason) + '</dd></div><div><dt>影响</dt><dd>' + esc(r.impact) + '</dd></div><div><dt>下一步</dt><dd>' + esc(r.next) + '</dd></div></dl></div>').join('');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>公共卫生服务系统功能需求清单 V1.0</title>
<style>
:root {
  --page-bg: #FFFFFF;
  --page-surface: #F7F9FC;
  --page-surface-muted: #EFF3F8;
  --page-text: #1B2733;
  --page-text-secondary: #3E4C59;
  --page-text-muted: #64748B;
  --page-border: #DDE4EC;
  --page-brand: #0969DA;
  --page-brand-hover: #0757B5;
  --page-brand-soft: #EAF2FC;
  --page-brand-soft-strong: #D8E7F8;
  --bg: #FFFFFF; --bg2: #F7F9FC; --rule: #DDE4EC; --ink: #1B2733; --muted: #64748B;
  --accent: #0969DA; --accent-hover: #0757B5; --accent-soft: #EAF2FC; --accent2: #8250DF;
  --chart-series-1: #0969DA; --chart-series-2: #8250DF; --chart-series-3: #06B6D4; --chart-series-4: #BF3989;
  --chart-grid: rgba(27, 39, 51, 0.12); --chart-axis: #64748B; --chart-label: #64748B;
  --success: #52C41A; --info: #0969DA; --reminder: #FF7A45; --warning: #FAAD14; --danger: #FF4D4F;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", system-ui, sans-serif; font-size: 14px; line-height: 20px; color: var(--ink); background: var(--page-bg); }
.mono, .fr-code, .route { font-family: "JetBrains Mono", Consolas, "Courier New", monospace; }
a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-hover); text-decoration: underline; }

.report-intro { background: var(--page-brand-soft); border-bottom: 1px solid var(--page-border); }
.report-intro__content { max-width: 1040px; margin: 0 auto; padding: 56px 32px 44px; }
.intro-kicker { font-size: 13px; letter-spacing: 2px; color: var(--page-brand); font-weight: 600; margin-bottom: 14px; }
.report-intro h1 { font-size: 34px; line-height: 44px; font-weight: 700; letter-spacing: 1px; margin-bottom: 18px; }
.intro-summary { max-width: 780px; font-size: 15px; line-height: 26px; color: var(--page-text-secondary); margin-bottom: 24px; }
.intro-meta { display: flex; flex-wrap: wrap; gap: 10px 28px; font-size: 13px; color: var(--page-text-muted); }
.intro-meta span::before { content: "◆"; font-size: 8px; margin-right: 6px; color: var(--page-brand); vertical-align: 2px; }

main { max-width: 1040px; margin: 0 auto; padding: 8px 32px 32px; }
section.top-sec { padding: 44px 0 8px; }
h2.sec-title { font-size: 22px; line-height: 30px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
h2.sec-title .sec-no { font-size: 12px; font-weight: 600; color: var(--page-brand); background: var(--page-brand-soft); border: 1px solid var(--page-brand-soft-strong); border-radius: 6px; padding: 2px 8px; letter-spacing: 1px; }
.sec-sub { color: var(--page-text-muted); font-size: 13.5px; margin-bottom: 22px; }

.metric-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 26px; }
.metric-card { background: var(--page-bg); border: 1px solid var(--page-border); border-radius: 12px; padding: 18px 20px; }
.metric-card .m-label { font-size: 12.5px; color: var(--page-text-muted); margin-bottom: 8px; }
.metric-card .m-value { font-size: 28px; line-height: 32px; font-weight: 700; font-variant-numeric: tabular-nums; }
.metric-card .m-value em { font-style: normal; font-size: 13px; font-weight: 400; color: var(--page-text-muted); margin-left: 4px; }
.metric-card .m-note { font-size: 12px; color: var(--page-text-muted); margin-top: 6px; }

.toc-card { background: var(--page-surface); border: 1px solid var(--page-border); border-radius: 12px; padding: 18px 20px; margin-bottom: 26px; }
.toc-card .toc-title { font-size: 13px; font-weight: 600; color: var(--page-text-secondary); margin-bottom: 10px; }
.toc-card .toc-links { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 13px; }

table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 18px; }
caption { caption-side: top; text-align: left; font-size: 13px; color: var(--page-text-muted); padding-bottom: 8px; }
th, td { border: 1px solid var(--page-border); padding: 8px 10px; text-align: left; vertical-align: top; line-height: 19px; }
thead th { background: var(--page-surface); font-weight: 600; color: var(--page-text-secondary); white-space: nowrap; }
tbody tr:nth-child(even) { background: #FAFCFE; }
td.mono, th.mono { font-family: Consolas, monospace; white-space: nowrap; }
.arch-desc { color: var(--page-text-secondary); }
.bar { display: inline-block; width: 120px; height: 8px; background: var(--page-surface-muted); border-radius: 4px; overflow: hidden; vertical-align: middle; }
.bar i { display: block; height: 100%; background: var(--chart-series-1); border-radius: 4px; }

.module-sec { padding: 40px 0 6px; border-top: 1px solid var(--page-border); }
.module-sec:first-of-type { border-top: none; }
.module-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.mod-code { font-family: Consolas, monospace; font-size: 13px; font-weight: 600; color: var(--page-brand); background: var(--page-brand-soft); border-radius: 6px; padding: 3px 8px; }
.module-head h3 { font-size: 19px; font-weight: 700; }
.mod-count { font-size: 12.5px; color: var(--page-text-muted); }
.module-desc { color: var(--page-text-secondary); margin-bottom: 18px; max-width: 860px; }

.page-item { border: 1px solid var(--page-border); border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; background: var(--page-bg); }
.page-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.fr-code { font-size: 12.5px; font-weight: 600; color: var(--page-brand); }
.page-head h4 { font-size: 15px; font-weight: 600; }
.group-badge { font-size: 11px; font-weight: 400; color: var(--page-text-muted); border: 1px solid var(--page-border); border-radius: 999px; padding: 1px 8px; margin-left: 6px; vertical-align: 1px; }
.route { margin-left: auto; font-size: 11.5px; color: var(--page-text-muted); }
.page-desc { color: var(--page-text-secondary); margin-bottom: 10px; }
.page-detail .row { display: flex; gap: 12px; padding: 7px 0; border-top: 1px dashed var(--page-border); }
.page-detail .row:first-child { border-top: none; }
.page-detail dt { flex: 0 0 72px; font-size: 12.5px; color: var(--page-text-muted); padding-top: 2px; }
.page-detail dd { flex: 1; font-size: 13px; line-height: 22px; color: var(--page-text-secondary); word-break: break-all; }
.page-detail dd b { color: var(--page-text); font-weight: 600; }
.none { color: var(--page-text-muted); }

.tag { display: inline-block; font-size: 11.5px; font-weight: 600; border-radius: 999px; padding: 1px 9px; line-height: 17px; }
.tag-p0 { color: #C2410C; background: #FEF0E6; border: 1px solid #F8D8BE; }
.tag-p1 { color: #8A5B00; background: #FDF3D8; border: 1px solid #F0E0B0; }
.tag-p2 { color: #4A5568; background: #EDF1F5; border: 1px solid #D9E0E8; }

.chip { display: inline-block; font-size: 12px; line-height: 18px; color: var(--page-text-secondary); background: var(--page-surface); border: 1px solid var(--page-border); border-radius: 6px; padding: 1px 8px; margin: 2px 4px 2px 0; }

.feat-row { padding: 12px 0; border-bottom: 1px solid var(--page-border); }
.feat-row:last-child { border-bottom: none; }
.feat-title { font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
.feat-no { font-family: Consolas, monospace; font-size: 12px; color: var(--page-brand); }
.feat-row p { color: var(--page-text-secondary); }

.rec-block { border: 1px solid var(--page-border); border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; }
.rec-block h4 { font-size: 15px; margin-bottom: 8px; }
.rec-block dl div { display: flex; gap: 10px; padding: 4px 0; }
.rec-block dt { flex: 0 0 48px; font-size: 12.5px; color: var(--page-brand); font-weight: 600; padding-top: 1px; }
.rec-block dd { font-size: 13.5px; color: var(--page-text-secondary); }

.callout { background: var(--page-surface); border: 1px solid var(--page-border); border-radius: 12px; padding: 14px 18px; margin: 18px 0; font-size: 13.5px; color: var(--page-text-secondary); }
.callout b { color: var(--page-text); }

footer { border-top: 1px solid var(--page-border); margin-top: 40px; }
.footer-inner { max-width: 1040px; margin: 0 auto; padding: 26px 32px 44px; font-size: 12.5px; color: var(--page-text-muted); line-height: 21px; }
.footer-inner p { margin-bottom: 6px; }

@media (max-width: 760px) {
  .report-intro__content, main, .footer-inner { padding-left: 18px; padding-right: 18px; }
  .report-intro h1 { font-size: 26px; line-height: 36px; }
  .metric-row { grid-template-columns: repeat(2, 1fr); }
  .page-detail .row { flex-direction: column; gap: 4px; }
  .route { margin-left: 0; width: 100%; }
  table { font-size: 12.5px; }
  th, td { padding: 6px 7px; }
}
</style>
</head>
<body>

<header class="report-intro">
  <div class="report-intro__content">
    <div class="intro-kicker">公共卫生服务系统 · 产品需求文档 · V1.0</div>
    <h1>公共卫生服务系统功能需求清单</h1>
    <p class="intro-summary">本清单基于对竞品系统全部 19 个一级模块、86 个功能菜单的逐页实测遍历整理而成，完整记录各功能页面的查询条件、列表字段与操作功能，并补充非功能与集成需求，可直接作为同类公共卫生服务系统建设的功能基线与需求输入。</p>
    <div class="intro-meta">
      <span>文档版本 V1.0</span>
      <span>编制日期 2026-09-11</span>
      <span>编制方式 竞品系统实测遍历</span>
      <span>文档状态 待评审</span>
    </div>
  </div>
</header>

<main>

<section class="top-sec" id="report-overview">
  <h2 class="sec-title"><span class="sec-no">01</span>调研说明</h2>
  <p class="sec-sub">调研对象、方法与整体规模</p>
  <div class="metric-row">
    <div class="metric-card"><div class="m-label">一级功能模块</div><div class="m-value">19<em>个</em></div><div class="m-note">按左侧导航菜单划分</div></div>
    <div class="metric-card"><div class="m-label">功能菜单</div><div class="m-value">${statMenus}<em>个</em></div><div class="m-note">含外嵌大屏与8个外嵌查询页</div></div>
    <div class="metric-card"><div class="m-label">实测页面</div><div class="m-value">${statPages}<em>个</em></div><div class="m-note">系统内页面逐页采集元素</div></div>
    <div class="metric-card"><div class="m-label">查询条件字段</div><div class="m-value">${statQuery}<em>项</em></div><div class="m-note">各页面检索条件累计</div></div>
    <div class="metric-card"><div class="m-label">列表字段</div><div class="m-value">${statCols}<em>项</em></div><div class="m-note">各页面表格列累计（含页签）</div></div>
    <div class="metric-card"><div class="m-label">操作功能类型</div><div class="m-value">${opSet.size}<em>种</em></div><div class="m-note">如查询、新建、导出、随访等</div></div>
  </div>
  <p style="color: var(--page-text-secondary); line-height: 24px; margin-bottom: 10px;">调研以测试人员视角开展：登录竞品系统（青羊人民医院部署环境，账号 lvxue），按菜单顺序访问全部功能菜单，其中系统内页面逐一采集<b>页面标题、查询条件（表单项）、列表字段（表格列头）、操作按钮、页签结构</b>；外嵌页面（BI大屏、通用查询平台）抽样确认其嵌入机制。随后由需求分析师视角将采集结果归纳为功能需求条目，并补充非功能与集成需求。</p>
  <div class="callout"><b>优先级说明：</b>P0 = 核心业务功能，V1.0 必须实现；P1 = 重要业务功能，V1.0 应实现；P2 = 支撑配置功能，可延后实现。优先级为编制建议，最终以需求评审结论为准。</div>
  <div class="toc-card">
    <div class="toc-title">模块导航（点击跳转）</div>
    <div class="toc-links">${tocLinks}</div>
  </div>
</section>

<section class="top-sec" id="framework">
  <h2 class="sec-title"><span class="sec-no">02</span>功能架构总览</h2>
  <p class="sec-sub">19 个一级模块的规模、优先级与定位</p>
  <p style="color: var(--page-text-secondary); line-height: 24px; margin-bottom: 14px;">按业务域划分：<b>档案域</b>（档案管理）是系统底座；<b>重点人群服务域</b>（慢病管理、重精管理、结核管理、老年人管理、妇幼管理、中医管理）承载随访与健康服务；<b>监测报告域</b>（疾病报卡、三网监测、突发公卫事件、卫生监督、业务报表、辖区统计）负责法定报告与统计；<b>服务运营域</b>（计划提醒、健教管理、消息、工作台）支撑日常工作协同；<b>查询支撑域</b>（业务查询）提供即席查询；<b>平台配置域</b>（系统设置）管理系统参数。</p>
  <table>
    <caption>表1 一级模块清单（按导航顺序）</caption>
    <thead><tr><th>模块</th><th>菜单数</th><th>规模</th><th>优先级</th><th>模块定位</th></tr></thead>
    <tbody>${archRows}</tbody>
  </table>
</section>

<section class="top-sec" id="modules">
  <h2 class="sec-title"><span class="sec-no">03</span>模块功能需求明细</h2>
  <p class="sec-sub">每个功能菜单一条需求条目：功能描述、查询条件、列表字段、操作功能</p>
  ${moduleSections}
</section>

<section class="top-sec" id="summary-list">
  <h2 class="sec-title"><span class="sec-no">04</span>功能需求汇总清单</h2>
  <p class="sec-sub">共 ${statMenus} 条功能需求，可直接作为需求跟踪矩阵（RTM）的初始输入</p>
  <table>
    <caption>表2 功能需求汇总（FR 编号规则：FR-模块号-序号）</caption>
    <thead><tr><th>编号</th><th>模块</th><th>功能名称</th><th>优先级</th><th>核心操作</th></tr></thead>
    <tbody>${summaryRows}</tbody>
  </table>
</section>

<section class="top-sec" id="nfr">
  <h2 class="sec-title"><span class="sec-no">05</span>非功能与集成需求</h2>
  <p class="sec-sub">由实测页面行为推导的系统级需求</p>
  ${nfrRows}
</section>

<section class="top-sec" id="usage">
  <h2 class="sec-title"><span class="sec-no">06</span>后续工作建议</h2>
  <p class="sec-sub">从功能清单到可开发需求文档的路径</p>
  ${recHtml}
</section>

</main>

<footer>
  <div class="footer-inner">
    <p><b>数据来源：</b>2026-09-11 对竞品系统 http://192.168.200.83/phService（青羊人民医院部署环境，测试账号 lvxue）的全菜单实测遍历；页面元素（标题、查询条件、表格列、按钮、页签）由自动化脚本逐页采集。</p>
    <p><b>局限性说明：</b>① 新建/编辑弹窗内的表单字段尚未逐项展开采集；② BI大屏与8个外嵌查询页为第三方平台，仅确认嵌入机制；③ 菜单可见性受当前账号权限影响，实际部署可能存在差异；④ 部分页面在实测环境无业务数据，空数据页面的行级操作可能未完整暴露。</p>
    <p><b>文档归属：</b>01-公共卫生服务系统产品文档 / V1.0 / 02.需求设计</p>
  </div>
</footer>

</body>
</html>`;

const target = 'D:\\AI_Project\\Public-Health-Service-System\\01-公共卫生服务系统产品文档\\V1.0\\02.需求设计\\功能需求清单.html';
fs.writeFileSync(target, html, 'utf8');
console.log('written:', target);
console.log('size:', (fs.statSync(target).size / 1024).toFixed(1), 'KB');
console.log('modules:', MODULES.length, '| menus:', statMenus, '| internal pages:', statPages, '| ext pages:', statMenus - statPages);
console.log('query fields:', statQuery, '| table columns:', statCols, '| op types:', opSet.size);
console.log('menu counts:', JSON.stringify(menuCount));
const missing = batches.filter(b => b.data && b.data.error);
console.log('pages with errors:', missing.length);
