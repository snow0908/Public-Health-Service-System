const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const R = (p) => JSON.parse(fs.readFileSync(path.join(DIR, p), 'utf8'));

const batches = [];
for (let i = 1; i <= 10; i++) batches.push(...R(path.join('results', 'batch_' + i + '.json')));
const specialArr = R(path.join('results', 'batch_special.json'));
const special = {};
specialArr.forEach(s => { special[s.label] = s.data; });

// Round-2 deep exploration: op_*.json
const opMap = new Map();
fs.readdirSync(path.join(DIR, 'results')).filter(f => f.startsWith('op_') && f.endsWith('.json')).forEach(f => {
  try {
    const d = R(path.join('results', f));
    if (d && d.label) opMap.set(d.label, d);
  } catch (e) { console.error('skip', f, e.message); }
});

// Round-3 scale forms
const loadForm = (f) => { const p = path.join(DIR, 'results', f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
const tcmHabitus = loadForm('form_tcm_habitus.json');
const tcmQs = loadForm('form_tcm_questions.json');
const oldAssess = loadForm('form_oldman_assess.json');

// Round-4 tab-level traversal: tab_*.json
const tabMap = new Map();
fs.readdirSync(path.join(DIR, 'results')).filter(f => f.startsWith('tab_') && f.endsWith('.json') && !f.startsWith('tab_supplement')).forEach(f => {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, 'results', f), 'utf8'));
    if (d && d.label) tabMap.set(d.label, d);
  } catch (e) { console.error('skip tab', f, e.message); }
});
const familySupplement = loadForm('tab_supplement_家庭档案.json');

// 菜单label -> tab数据label 映射（页签遍历目标与菜单名的差异）
const MENU_TO_TAB = {
  '重精管理': '重精随访', '高危人群管理': '高危随访', '高血脂管理': '高血脂随访',
  '心脑血管管理': '心脑血管随访', '慢阻肺管理': '慢阻肺随访', '肿瘤管理': '肿瘤随访',
  '老年人管理': '老年人编辑'
};

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MODULES = [
  { name: '消息', pri: 'P1', desc: '系统消息中心，统一聚合任务提醒与系统通知，支持未读管理与任务跳转处理。' },
  { name: '工作台', pri: 'P1', desc: '个人工作首页与数据可视化大屏，快速掌握辖区建档、疾病分布与公卫项目完成情况。' },
  { name: '计划提醒', pri: 'P0', desc: '面向随访与服务的计划管理，按人群/项目分类跟踪待执行服务计划与各类档案提醒。' },
  { name: '档案管理', pri: 'P0', desc: '居民健康档案核心模块，覆盖个人档案（含患者360视图）、家庭档案、健康体检、残疾档案以及档案迁移/审核/恢复/查阅的全生命周期管理。' },
  { name: '系统设置', pri: 'P2', desc: '系统级基础数据与参数配置，包括辖区管理、业务模板、随访/指标参数、补助、疾病诊疗设置与运行日志。' },
  { name: '中医管理', pri: 'P1', desc: '老年人中医药健康管理（含33题体质辨识量表与9种体质保健指导）、儿童中医药健康管理及中医健康指导服务记录。' },
  { name: '健教管理', pri: 'P1', desc: '健康教育活动、宣传栏、音像资料、广播、个体化健康教育与健教计划的登记管理。' },
  { name: '业务查询', pri: 'P1', desc: '面向业务人员的综合查询入口，内嵌通用SQL自助查询平台，支持个人档案及各类重点人群档案的即席查询。' },
  { name: '卫生监督', pri: 'P1', desc: '卫生监督协管工作管理，包括监督地点维护、巡查登记与事件报告。' },
  { name: '疾病报卡', pri: 'P0', desc: '传染病（含31项字段报告卡）、早孕、慢病报告卡的登记、订正与管理。' },
  { name: '突发公卫事件', pri: 'P1', desc: '突发公共卫生事件的报告与处置记录管理。' },
  { name: '三网监测', pri: 'P1', desc: '妇幼三网监测，覆盖孕产妇死亡、围产儿死亡、新生儿缺陷与儿童死亡的报告管理。' },
  { name: '慢病管理', pri: 'P0', desc: '高血压、糖尿病、高血脂、肿瘤、心脑血管、慢阻肺等慢性病的专项档案与随访服务管理，随访表单按病种差异化（高血压35项/糖尿病41项/高危人群31项字段）。' },
  { name: '重精管理', pri: 'P1', desc: '严重精神障碍患者的专项档案（含个人信息补充表）与随访服务管理（37项字段随访表单）。' },
  { name: '结核管理', pri: 'P1', desc: '肺结核患者的专项档案与随访服务管理。' },
  { name: '老年人管理', pri: 'P1', desc: '65岁及以上老年人健康管理，包括健康档案维护、自理能力评估（5项4级量表）与随访服务入口。' },
  { name: '妇幼管理', pri: 'P0', desc: '妇女、孕产妇、儿童保健管理，预防接种管理，两癌筛查（含59字段个案记录）与母婴阻断（乙肝/梅毒/艾滋）管理。' },
  { name: '辖区统计', pri: 'P2', desc: '以行政区划（社区居委会）维度组织的辖区统计信息展示。' },
  { name: '业务报表', pri: 'P1', desc: '居民、老年人、高血压、肺结核、糖尿病、精神障碍、中医药等国家基本公共卫生服务报表的统计查询与导出。' }
];

const FEATURE_MAP = {
  '查询': '组合条件查询', '重置': '条件重置', '展开': '查询条件展开收起',
  '新建': '新建登记', '新建专项': '新建专项档案', '新增': '新增', '+ 添加': '添加配置项',
  '新建活动记录': '新建活动记录', '新建宣传栏记录': '新建宣传栏记录', '新建资料记录': '新建资料记录',
  '新建广播记录': '新建广播记录', '新建计划': '新建健教计划', '申请个档迁移': '发起个档迁移申请',
  '申请儿童迁移': '发起儿童档案迁移申请', '新建随访': '新建随访记录', '新建服务': '新建服务记录',
  '导出': '列表导出', '打印': '打印输出', '查看': '详情查看', '编辑': '编辑修改',
  '删除': '删除', '注销': '档案注销', '订正': '报卡订正', '评估': '健康评估',
  '关联个档': '关联个人档案', '身份证读卡': '身份证读卡器建档', '上移': '排序上移', '下移': '排序下移',
  '保存': '配置保存', '详情': '传输详情查看', '更多': '更多行级操作',
  '暂不管理': '设置暂不管理', '上锁': '档案上锁', '分层评估': '慢病分层评估', '新增个案': '新增筛查个案'
};

const TYPE_CN = { input: '文本框', textarea: '多行文本', number: '数字输入', select: '下拉选择', radio: '单选组', checkbox: '复选组', date: '日期选择', cascader: '级联选择', switch: '开关', upload: '附件上传', rate: '评分', display: '只读显示' };

const OVERRIDES = {
  '居民档案': { desc: '居民个人健康档案管理，全系统核心档案入口：支持身份证读卡快速建档与手工建档（新建时先弹居民查重弹窗，按身份证/姓名/出生日期/管理机构/档案编号检索，防重复建档，选定居民后进入多步建档表单）；档案查看/编辑进入患者360视图（#/personalInfo，56项字段，含既往史/家族史/遗传病史/残疾情况/生活环境/家庭信息等分组）。列表支持22项条件组合检索、25项列表字段，行级操作含查看、编辑及更多菜单（暂不管理、上锁、注销）——档案上锁后编辑受限（编辑页字段只读），形成档案保护机制。' },
  '家庭档案': { desc: '家庭健康档案管理，以户为单位建档：含家庭基本信息、家庭成员、精准扶贫（收入信息与帮扶项目）三个页签；支持按家庭状态、扶贫状态等9项条件查询，提供新建（23字段表单）、导出操作。' },
  '服务计划': { desc: '公卫服务计划管理：按健康体检、高血压、糖尿病、肺结核、严重精神障碍、儿童、妇女、孕产妇等服务项目分类查看待执行服务计划，支持按机构、医生、计划时间等10项条件检索与导出。' },
  '提醒管理': { desc: '档案提醒管理：含居民建档提醒、档案更新提醒、慢病档案提醒、居民死亡提醒、家庭成员提醒五类提醒页签，按提醒类型跟踪待处理提醒及处理状态。' },
  '档案迁移': { desc: '档案迁移申请管理：支持发起个人档案迁移申请与儿童档案迁移申请，配合迁入审核、迁出审核形成迁移闭环流程。' },
  '迁入审核': { desc: '档案迁入审核：对迁入本辖区的档案迁移申请进行审核处理，支持查询、查看与导出。' },
  '迁出审核': { desc: '档案迁出审核：对迁出本辖区的档案迁移申请进行审核处理，支持查询与导出。' },
  '体检登记': { desc: '健康体检登记入口：列出待检/已检居民（60条/页），支持身份证读卡、导出与按居民查看体检表单；体检表单为3页分步表单（第一页：基本信息、症状与一般情况、生活方式、脏器功能检查；第二页：查体、辅助检查、现存主要健康问题；第三页：主要药物情况、非免疫规划预防接种史、健康评价、健康指导），共51项以上字段。' },
  '体检管理': { desc: '健康体检记录管理：对已完成的体检记录进行查看、编辑与注销，操作列提供查看/编辑/注销，支持身份证读卡与导出。' },
  '老年人管理': { desc: '老年人健康管理：65岁及以上老年人健康档案列表管理（编辑表单56字段），行操作含编辑、评估（进入老年人自理能力评估表：进餐/梳洗/穿衣/如厕/活动5项×4级评分量表，自动合计得分）及更多菜单（查看、中医干预），按管理状态、人群分类等12项条件检索。' },
  '老年人中医管理': { desc: '老年人中医药健康管理：新建记录时弹出居民选择器（支持姓名/出生日期/身份证号/管理机构/档案编号组合查询，列表勾选，行内"新建服务/查看"操作），进入服务记录表单后包含33题体质辨识问卷（每题按"没有/很少/有时/经常/总是"5级作答，含BMI、感冒频次等特殊计分题）、体质辨识结果（平和质/气虚质/阳虚质/阴虚质/痰湿质/湿热质/血瘀质/气郁质/特禀质9类，自动计算得分与体质类型）及9类体质×6项中医药保健指导（情致调摄/饮食调养/起居调摄/运动保健/穴位保健/其他）。' },
  '儿童中医管理': { desc: '0-36个月儿童中医药健康管理：按月龄段记录中医健康指导服务，支持新建记录（居民选择弹窗）与查询。' },
  '中医健康指导': { desc: '中医健康指导记录管理：对居民开展中医药健康指导的记录登记，支持新建、查看、编辑、注销，按条件检索居民指导记录。' },
  '高血压管理': { desc: '高血压患者专项档案与随访管理：支持25项条件组合检索（含管理状态、随访状态、血压分级等），提供新建专项（6字段居民选择弹窗）、查看、编辑（14字段）、新建随访（35字段随访表单：症状复选、血压值、服药依从性、生活方式指导等，含随访记录与健康教育页签）及更多菜单（查看、分层评估——25字段心血管风险分层评估表）。' },
  '糖尿病管理': { desc: '糖尿病患者专项档案与随访管理：与高血压管理同构，随访表单为41字段（增加血糖控制、并发症筛查等糖尿病特有指标），支持新建专项、查看、编辑（20字段）、新建随访、分层评估。' },
  '乳腺癌筛查': { desc: '乳腺癌筛查管理：支持新建筛查登记、编辑（12字段）、新增个案（59字段完整个案记录：筛查信息、临床检查、超声/钼靶检查结果、病理诊断与随访处理等）。' },
  '孕产妇管理': { desc: '孕产妇专项健康管理：支持新建（居民选择弹窗）、编辑（31字段孕产妇档案：孕产史、本次妊娠信息、产前检查等）、新建服务（13字段服务记录）与注销操作。' },
  '妇女管理': { desc: '妇女（育龄期/更年期）健康管理：支持新建（8字段）、编辑/查看（29字段妇女档案）、新建服务（12字段）、关联个档与注销操作。' },
  '传染病报卡': { desc: '传染病报告卡登记与管理：新建报卡为31字段表单（报告卡类型、患者信息、证件、现住址、疾病名称、发病/诊断日期、报卡分类等），支持订正、查看、删除与导出、身份证读卡。' },
  '孕产妇查询': { desc: '孕产妇专项查询：按条件查询孕产妇档案信息（实测环境页面数据未加载，上线前需确认查询配置）。', query: [], cols: [], ops: ['查询', '重置'] },
  '辖区统计': { desc: '行政区划信息展示：以社区居委会列表形式展示辖区行政区划结构，作为辖区维度统计的入口。', query: [], cols: ['社区居委会名称'], ops: [] }
};

const SPECIAL_PAGES = {
  '所有消息': { desc: '消息中心：聚合展示未读通知数与待处理任务数，提供任务通知、待处理任务、未读通知三个信息区，支持全部标记已读与消息跳转处理。', tabs: ['任务', '通知'], ops: ['全部标记已读', '消息跳转处理'] },
  '任务详情': { desc: '任务消息列表：按类型（如待处理）筛选查看任务消息，点击可跳转对应业务页面处理。', tabs: ['待处理'], ops: ['类型筛选', '任务跳转'] },
  '通知详情': { desc: '系统通知列表：按已读/未读/全部状态筛选，分页浏览系统通知（如异常登录提醒），支持标记已读。', tabs: ['已读', '未读', '全部'], ops: ['状态筛选', '分页浏览', '标记已读'] },
  '首页': { desc: '工作台仪表盘：展示辖区建档总数、疾病情况TOP10排行（高血压、糖尿病、结核病等）与各公卫项目（高血压/糖尿病/老年人/孕产妇/儿童/精神病）完成进度。', ops: [] },
  '大屏': { desc: '数据可视化大屏：外嵌第三方BI平台（de-bi-container 模板大屏），用于辖区公卫数据的大屏展示。', external: true, ops: [] }
};

const EXT_QUERY_PAGES = [
  { name: '个人档案查询' }, { name: '高血压患者查询' }, { name: '糖尿病患者查询' },
  { name: '严重精神障碍患者查询' }, { name: '肺结核患者查询' }, { name: '老年人查询' },
  { name: '高危档案查询' }, { name: '老年人中医药管理查询' }
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
    items.push({ label: '所有消息', group: '', href: '#/messages/more-message', data: { title: '所有消息', tabs: SPECIAL_PAGES['所有消息'].tabs, queryFields: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
    items.push({ label: '任务详情', group: '', href: '#/messages/task-info', data: { title: '任务详情', tabs: SPECIAL_PAGES['任务详情'].tabs, queryFields: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
    items.push({ label: '通知详情', group: '', href: '#/messages/notice-info', data: { title: '通知详情', tabs: SPECIAL_PAGES['通知详情'].tabs, queryFields: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
  }
  if (m.name === '工作台') {
    items.push({ label: '首页', group: '', href: '#/home', data: { title: '首页', queryFields: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
    items.push({ label: '大屏', group: '', href: '#/daping?external=1', data: { title: '大屏', queryFields: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } });
  }
  list.forEach(p => { if (!items.some(x => x.label === p.label)) items.push(p); });
  if (m.name === '业务查询') {
    const extItems = EXT_QUERY_PAGES.map(e => ({ label: e.name, group: '外嵌查询', href: 'external', data: { title: e.name, queryFields: [], buttons: [], rowActions: [], tables: [], tableColumns: [] } }));
    const idx = items.findIndex(x => x.label === '孕产妇查询');
    if (idx >= 0) { const internal = items.splice(idx, 1); items.unshift(...internal, ...extItems); }
  }
  items.forEach((p, pi) => {
    const frCode = code + '-' + String(pi + 1).padStart(2, '0');
    const ov = OVERRIDES[p.label] || {};
    const sp = SPECIAL_PAGES[p.label] || {};
    const isExternal = p.href === 'external' || p.label === '大屏';
    const opData = opMap.get(p.label);
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
    if (opData) {
      const opBtns = [];
      (opData.ops || []).forEach(o => { const nm = o.op.split('>').pop(); if (!opBtns.includes(nm)) opBtns.push(nm); });
      if (opData.moreMenu && opData.moreMenu.items) opData.moreMenu.items.forEach(nm => { if (!opBtns.includes(nm)) opBtns.push(nm); });
      (opData.pageOps && opData.pageOps.headerBtns || []).forEach(nm => { if (!ops.includes(nm) && !opBtns.includes(nm)) opBtns.push(nm); });
      opBtns.forEach(nm => { if (!ops.includes(nm)) ops.push(nm); });
    }
    let pri = m.pri;
    if (['操作日志', '档案传输记录', '大屏'].includes(p.label)) pri = 'P2';
    const tKey = MENU_TO_TAB[p.label] && tabMap.has(MENU_TO_TAB[p.label]) ? MENU_TO_TAB[p.label] : (tabMap.has(p.label) ? p.label : null);
    let tabData = tKey ? tabMap.get(tKey) : null;
    if (tabData) {
      // 无真页签的整页表单：若操作级数据已采集到同等字段则视为重复，跳过；有增量（如重精随访44>37）才保留
      const realTabs = (tabData.tabs || []).filter(tb => tb.name && !tb.name.startsWith('(无页签'));
      if (!realTabs.length) {
        const tabFieldCount = (tabData.tabs || []).reduce((s, tb) => {
          const st = (tb.state || [])[0];
          return s + (st && st.fields ? st.fields.length : 0);
        }, 0);
        const opMax = (opData && opData.ops || []).reduce((mx, o) => {
          const st = o.state && o.state[0];
          return Math.max(mx, st && st.fields ? st.fields.length : 0);
        }, 0);
        if (tabFieldCount <= opMax) tabData = null;
      }
    }
    entries.push({
      code: frCode, module: m.name, group: p.group || '', name: p.label,
      route: isExternal ? (p.label === '大屏' ? '外部BI平台嵌入' : '外部查询平台嵌入') : p.href.replace('#', ''),
      desc, query, tables, ops, tabs, pri, external: isExternal, opData: opData || null, tabData: tabData
    });
  });
});

const statMenus = entries.length;
const statPages = entries.filter(e => !e.external).length;
const statQuery = entries.reduce((s, e) => s + e.query.length, 0);
const statCols = entries.reduce((s, e) => s + e.tables.reduce((x, t) => x + t.columns.length, 0), 0);

// form-field stats from round-2/3
let statForms = 0, statFields = 0;
entries.forEach(e => {
  if (!e.opData) return;
  (e.opData.ops || []).forEach(o => {
    if (o.state && Array.isArray(o.state) && o.state[0] && o.state[0].fields && o.state[0].fields.length) { statForms++; statFields += o.state[0].fields.length; }
  });
});

const opSet = new Set();
entries.forEach(e => e.ops.forEach(o => opSet.add(o)));

// tab-level stats（页签面板与页签字段仅统计真实页签；整页表单补充数据不计入页签口径）
let statTabPanels = 0, statTabFields = 0, statTabEntries = 0;
entries.forEach(e => {
  if (!e.tabData || !e.tabData.tabs) return;
  statTabEntries++;
  e.tabData.tabs.forEach(tb => {
    if (!tb.name || tb.name.startsWith('(无页签')) return;
    statTabPanels++;
    const st = (tb.state || [])[0];
    if (st && st.fields && st.fields.length) statTabFields += st.fields.length;
  });
});

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

function routeShort(h) {
  if (!h) return '';
  return h.split('?')[0];
}

function fieldTable(fields, limit) {
  const arr = limit ? fields.slice(0, limit) : fields;
  const rows = arr.map(f => {
    const req = f.required ? '<span class="req">必填</span>' : '<span class="opt">选填</span>';
    const type = TYPE_CN[f.type] || esc(f.type || '—');
    let extra = '';
    if (f.options && f.options.length) extra = '选项：' + esc(f.options.slice(0, 12).join(' / ')) + (f.options.length > 12 ? ' 等' + f.options.length + '项' : '');
    else if (f.placeholder) extra = '提示：' + esc(f.placeholder);
    return '<tr><td class="fd-name">' + esc(f.label) + (f.required ? ' <span class="req-star">*</span>' : '') + '</td><td>' + type + '</td><td>' + req + '</td><td class="fd-extra">' + extra + '</td></tr>';
  }).join('');
  const more = limit && fields.length > limit ? '<tr><td colspan="4" class="fd-more">… 其余 ' + (fields.length - limit) + ' 项字段见核心表单明细章节或原始采集数据</td></tr>' : '';
  return '<table class="field-table"><thead><tr><th style="width:22%">字段</th><th style="width:12%">控件</th><th style="width:10%">必填</th><th>选项/说明</th></tr></thead><tbody>' + rows + more + '</tbody></table>';
}

function renderOpDetail(e) {
  const od = e.opData;
  if (!od || !od.ops || !od.ops.length) return '';
  const items = od.ops.map(o => {
    let target = '';
    let formHtml = '';
    const st = o.state && o.state[0];
    if (o.note === 'SKIP-destructive') {
      target = '<span class="op-mode mode-safe">破坏性操作（未实测）</span>';
    } else if (o.note) {
      target = '<span class="op-mode mode-none">' + esc(o.note) + '</span>';
    } else if (st) {
      if (st.kind === 'dialog' || st.kind === 'drawer') {
        target = '<span class="op-mode mode-dialog">弹窗</span>';
        if (st.title) target += ' <b>' + esc(st.title) + '</b>';
      } else if (st.kind === 'page') {
        target = '<span class="op-mode mode-page">跳转页面</span> <span class="route">' + esc(routeShort(o.hash || '')) + '</span>';
      } else if (st.kind === 'popup') {
        target = '<span class="op-mode mode-dialog">弹出菜单</span>';
      } else {
        target = '<span class="op-mode mode-none">无表单数据</span>';
      }
      const bits = [];
      if (st.tabs && st.tabs.length) bits.push('页签：' + st.tabs.join(' / '));
      if (st.steps && st.steps.length) bits.push('步骤：' + st.steps.join(' → '));
      if (st.sections && st.sections.length) bits.push('分组：' + st.sections.slice(0, 6).join('、'));
      if (st.footerButtons && st.footerButtons.length) bits.push('底部按钮：' + st.footerButtons.join('、'));
      else if (st.pageBtns && st.pageBtns.length) bits.push('页面按钮：' + st.pageBtns.slice(0, 8).join('、'));
      if (st.fields && st.fields.length) {
        bits.push('<details class="fd-details"><summary>' + st.fields.length + ' 项字段（点击展开）</summary>' + fieldTable(st.fields) + '</details>');
      }
      if (bits.length) formHtml = '<div class="op-form">' + bits.map(b => '<div class="op-bit">' + b + '</div>').join('') + '</div>';
    }
    const fromTxt = o.from === 'header' ? '页头按钮' : (o.from === 'more' ? '更多菜单' : '行操作');
    return '<div class="op-item"><div class="op-line"><span class="op-btn">' + esc(o.op.replace('更多>', '更多 ▸ ')) + '</span><span class="op-from">' + fromTxt + '</span>' + target + '</div>' + formHtml + '</div>';
  }).join('');
  return '<div class="op-block"><div class="op-block-title">操作明细与表单结构（实测采集）</div>' + items + '</div>';
}

function renderTabDetail(e) {
  const td = e.tabData;
  if (!td || !td.tabs || !td.tabs.length) return '';
  const hasRealTabs = td.tabs.some(tb => tb.name && !tb.name.startsWith('(无页签'));
  const blockTitle = hasRealTabs ? '页签级明细（逐页签实测采集）' : '表单级明细（整页表单补充实测，含操作级未覆盖字段）';
  const items = td.tabs.map(tb => {
    const noTab = tb.name && tb.name.startsWith('(无页签');
    const tbName = noTab ? '整页表单' : tb.name;
    const modeTag = noTab ? '<span class="op-mode mode-none">整页表单</span>' : '<span class="op-mode mode-tab">页签内容</span>';
    const st = (tb.state || [])[0] || {};
    const bits = [];
    if (st.sections && st.sections.length) bits.push('<span class="chip chip-sec">' + esc(st.sections.join('、')) + '</span>');
    if (st.tables && st.tables.length) {
      st.tables.filter(t => t.columns && t.columns.length).forEach(t => {
        bits.push('<div class="op-bit"><b>表格' + (t.tab ? '（' + esc(t.tab) + '）' : '') + '：</b>' + esc(t.columns.join('、')) + '</div>');
      });
    }
    if (st.footerButtons && st.footerButtons.length) bits.push('底部按钮：' + st.footerButtons.join('、'));
    if (st.pageBtns && st.pageBtns.length) bits.push('页面按钮：' + st.pageBtns.slice(0, 10).join('、'));
    let formHtml = '';
    if (st.fields && st.fields.length) {
      formHtml = '<details class="fd-details" open><summary>' + st.fields.length + ' 项字段（点击收起）</summary>' + fieldTable(st.fields) + '</details>';
    }
    const inner = bits.length ? '<div class="op-form">' + bits.map(b => '<div class="op-bit">' + b + '</div>').join('') + '</div>' : '';
    return '<div class="op-item"><div class="op-line"><span class="op-btn">' + esc(tbName) + '</span>' + modeTag + '</div>' + inner + formHtml + '</div>';
  }).join('');
  const noteBits = (td.notes || []).length
    ? '<div class="op-form">' + td.notes.map(n => '<div class="op-bit">· ' + esc(n) + '</div>').join('') + '</div>'
    : '';
  return '<div class="op-block tab-block"><div class="op-block-title">' + blockTitle + '</div>' + items + noteBits + '</div>';
}

function renderFamilySupplement() {
  if (!familySupplement || !familySupplement.addMemberDialog) return '';
  const d = familySupplement;
  const amd = d.addMemberDialog;
  const pif = amd.personInfoForm;
  const memberTable = d.memberTab && d.memberTab.tableColumns ? '<div class="op-bit"><b>成员列表表格列：</b>' + esc(d.memberTab.tableColumns.join('、')) + '</div>' : '';
  const rules = (d.memberTab && d.memberTab.businessRules || []).map(r => '<div class="op-bit">⚠ ' + esc(r) + '</div>').join('');
  const qf = (amd.queryFields || []).map(f => esc(f.label) + '(' + (TYPE_CN[f.type] || f.type) + ')').join('、');
  const inputFields = (pif.inputFields || []).map(f => {
    return '<tr><td class="fd-name">' + esc(f.label) + ' <span class="req-star">*</span></td><td>下拉选择</td><td><span class="req">必填</span></td><td class="fd-extra">选项：' + esc(f.options.join(' / ')) + '</td></tr>';
  }).join('');
  return '<div class="op-block tab-block"><div class="op-block-title">家庭档案 · 家庭成员页签 · 添加家庭成员弹窗（深度实测）</div>' +
    '<div class="op-item"><div class="op-line"><span class="op-btn">添加家庭成员</span><span class="op-mode mode-dialog">弹窗</span> <b>居民选择器</b></div>' +
    '<div class="op-form">' +
    '<div class="op-bit"><b>查询条件：</b>' + qf + '；按钮：' + esc((amd.queryButtons || []).join('、')) + '</div>' +
    '<div class="op-bit"><b>结果表格列：</b>' + esc((amd.tableColumns || []).join('、')) + '</div>' +
    '<div class="op-bit"><b>选择方式：</b>' + esc(amd.selectMode || '') + '；' + esc(amd.pagination || '') + '</div>' +
    '<div class="op-bit"><b>辅助功能：</b>' + esc((amd.toolbarFeatures || []).join('、')) + '</div>' +
    (amd.personTypeFilter ? '<div class="op-bit"><b>人群分类筛选：</b>' + esc(amd.personTypeFilter.join('、')) + '</div>' : '') +
    '</div></div>' +
    '<div class="op-item"><div class="op-line"><span class="op-btn">成员信息确认表单</span><span class="op-mode mode-dialog">选中居民后</span></div>' +
    '<div class="op-form"><div class="op-bit"><b>只读回显：</b>' + esc((pif.displayFields || []).join('、')) + '</div>' +
    '<table class="field-table"><thead><tr><th style="width:22%">字段</th><th style="width:12%">控件</th><th style="width:10%">必填</th><th>选项/说明</th></tr></thead><tbody>' + inputFields + '</tbody></table>' +
    '<div class="op-bit">底部按钮：' + esc((pif.buttons || []).join('、')) + '</div></div></div>' +
    (memberTable || rules ? '<div class="op-item"><div class="op-line"><span class="op-btn">家庭成员列表</span><span class="op-mode mode-tab">页签主表格</span></div><div class="op-form">' + memberTable + rules + '</div></div>' : '') +
    '</div>';
}

let moduleSections = '';
MODULES.forEach((m, mi) => {
  const mes = entries.filter(e => e.module === m.name);
  let pagesHtml = '';
  mes.forEach(e => {
    const opDetail = e.external ? '' : renderOpDetail(e);
    const tabDetail = e.external ? '' : renderTabDetail(e);
    const familySup = e.module === '档案管理' && e.name === '家庭档案' ? renderFamilySupplement() : '';
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
      ${opDetail}
      ${tabDetail}
      ${familySup}
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
  const ops = e.ops.slice(0, 6).map(o => FEATURE_MAP[o] || o).join('、') + (e.ops.length > 6 ? ' 等' + e.ops.length + '项' : '');
  return '<tr><td class="mono">' + e.code + '</td><td>' + esc(e.module) + '</td><td>' + esc(e.name) + '</td><td>' + priTag(e.pri) + '</td><td>' + esc(ops || '—') + '</td></tr>';
}).join('');

module.exports = { entries, MODULES, menuCount, statMenus, statPages, statQuery, statCols, statForms, statFields, statTabPanels, statTabFields, statTabEntries, opSet, chips, tableText, priTag, fieldTable, tocLinks, archRows, summaryRows, moduleSections, esc, tcmHabitus, tcmQs, oldAssess, opMap, TYPE_CN };
