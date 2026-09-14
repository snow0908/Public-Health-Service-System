const fs = require('fs');
const path = require('path');
const D = require('./build_report_v2_data.js');
const { entries, MODULES, statMenus, statPages, statQuery, statCols, statForms, statFields, statTabPanels, statTabFields, statTabEntries, opSet, priTag, fieldTable, tocLinks, archRows, summaryRows, moduleSections, esc, opMap, tcmHabitus, tcmQs, oldAssess } = D;

const DIR = __dirname;

function getOpForm(label, opName) {
  const od = opMap.get(label);
  if (!od) return null;
  const o = (od.ops || []).find(x => x.op === opName || x.op.endsWith('>' + opName));
  if (!o || !o.state || !o.state[0] || !o.state[0].fields) return null;
  return { op: o, st: o.state[0] };
}

// ---------- Key forms chapter ----------
const KEY_FORMS = [];

const residentView = getOpForm('居民档案', '查看');
if (residentView) {
  KEY_FORMS.push({
    code: 'KF-01', name: '居民个人健康档案表（患者360视图）', src: '档案管理 › 居民档案 › 查看/编辑（#/personalInfo）',
    intro: '全屏档案视图，顶部为居民信息横幅（姓名/年龄/证件号/出生日期/血型/联系电话/药物过敏史/住址），左侧为患者360模块导航：个人首页、个人档案（封面、个人基本信息、健康信息卡、死亡登记表、卫生健康服务活动）、家庭管理、妇女管理、转诊跟踪、健康体检、高血压/糖尿病/高血脂管理、中医管理、结核病管理、重精管理、肿瘤管理、慢阻肺管理、心脑血管管理、高危管理、残疾人管理；页面操作：返回、编辑、查看患者360、打印。编辑模式与查看模式字段结构一致，档案上锁或权限受限时字段为只读（disabled），形成档案保护机制。',
    fields: residentView.st.fields, hash: residentView.op.hash
  });
}

const htnFollow = getOpForm('高血压管理', '新建随访');
if (htnFollow) {
  KEY_FORMS.push({
    code: 'KF-02', name: '高血压随访服务记录表', src: '慢病管理 › 高血压管理 › 新建随访',
    intro: '随访表单含"高血压随访记录表"与"健康教育"页签，共35项字段：症状复选组、血压测量值、体重/体质指数、服药依从性、药物不良反应、生活方式（吸烟/饮酒/运动/摄盐/心理调整）单选组及健康指导等。',
    fields: htnFollow.st.fields, tabs: htnFollow.st.tabs
  });
}

const dmFollow = getOpForm('糖尿病管理', '新建随访');
if (dmFollow) {
  KEY_FORMS.push({
    code: 'KF-03', name: '糖尿病随访服务记录表', src: '慢病管理 › 糖尿病管理 › 新建随访',
    intro: '随访表单含"糖尿病随访记录表"与"健康教育"页签，共41项字段，在高血压随访基础上增加空腹血糖、糖化血红蛋白等糖尿病特有指标。',
    fields: dmFollow.st.fields, tabs: dmFollow.st.tabs
  });
}

const mentalFollow = getOpForm('重精管理', '新建随访');
if (mentalFollow) {
  KEY_FORMS.push({
    code: 'KF-04', name: '严重精神障碍患者随访服务记录表', src: '重精管理 › 新建随访',
    intro: '共37项字段，随访内容涵盖危险性评估、服药情况、康复措施等精神卫生特有项目；档案编辑页另有"严重精神障碍患者个人信息补充表"。',
    fields: mentalFollow.st.fields
  });
}

const contagion = getOpForm('传染病报卡', '新建');
if (contagion) {
  KEY_FORMS.push({
    code: 'KF-05', name: '传染病报告卡', src: '疾病报卡 › 传染病报卡 › 新建',
    intro: '页面内嵌新建报卡表单（31项字段）：报告卡类型、患者信息（支持级联选择已有档案自动带入）、证件信息、现住址、疾病名称、发病日期、诊断日期、报卡分类等；列表行操作支持订正（修改已报卡卡）、查看、删除，页头支持身份证读卡建档。',
    fields: contagion.st.fields
  });
}

const exam = getOpForm('体检登记', '查看');
if (exam) {
  KEY_FORMS.push({
    code: 'KF-06', name: '健康体检表单（分页式）', src: '档案管理 › 体检登记/体检管理 › 查看/编辑（#/health-check）',
    intro: '3页分步表单：第一页——基本信息、症状与一般情况、生活方式、脏器功能检查；第二页——查体（一般状况、脏器检查）、辅助检查（血常规/尿常规/血糖血脂/肝肾功能/心电图/B超等）、现存主要健康问题；第三页——主要药物情况、非免疫规划预防接种史、健康评价、健康指导。页面操作：返回、编辑、打印。',
    fields: exam.st.fields, tabs: exam.st.tabs
  });
}

if (tcmHabitus && tcmHabitus.state && tcmHabitus.state[0] && tcmQs && tcmQs.qs) {
  KEY_FORMS.push({
    code: 'KF-07', name: '老年人中医药健康管理服务记录表（体质辨识量表）', src: '中医管理 › 老年人中医管理 › 新建 ▸ 选择居民 ▸ 新建服务（#/elderlyHealthRecord）',
    intro: '入口流程：新建 → 居民选择弹窗（姓名/出生日期范围/身份证号/管理机构/档案编号组合查询，居民列表含锁定状态，行内"新建服务/查看"）→ 量表页。量表结构：33道中医体质辨识问题，每题按"没有（根本不/从来没有）/很少（有一点/偶尔）/有时（有些/少数时间）/经常（相当/多数时间）/总是（非常/每天）"5级作答，第9题按BMI分段计分、第14题按感冒频次计分；系统自动计算9种体质得分并给出体质类型；"体质辨识结果"区按平和质/气虚质/阳虚质/阴虚质/痰湿质/湿热质/血瘀质/气郁质/特禀质判定；"中医药保健指导"区对每种体质提供情致调摄/饮食调养/起居调摄/运动保健/穴位保健/其他6类指导项复选。表头信息：测评医师、评估日期；操作：返回、预览、保存、查看患者360。',
    questionnaire: tcmQs.qs,
    fields: (tcmHabitus.state[0].fields || []).filter(f => !/^(（|\d)/.test(f.label)),
    qScale: { count: 33, levels: 5 }
  });
}

if (oldAssess && oldAssess.qs) {
  KEY_FORMS.push({
    code: 'KF-08', name: '老年人自理能力评估表', src: '老年人管理 › 评估（#/oldManage）',
    intro: '表头：评估医师、评估日期；量表共5个评估事项，每项按"可自理/轻度依赖/中度依赖/不可自理"4级评分，系统自动合计总分：进餐（0/1/3/5分）、梳洗（0/1/3/7分）、穿衣（0/1/3/5分）、如厕（0/1/5/10分）、活动（0/1/5/10分）。操作：返回、预览、新建、保存、查看患者360。',
    scale: oldAssess.qs,
    fields: (oldAssess.formItems || []).map(f => ({ label: f.label, type: 'select', required: f.required, options: [], placeholder: '' }))
  });
}

const cancer = getOpForm('乳腺癌筛查', '新增个案');
if (cancer) {
  KEY_FORMS.push({
    code: 'KF-09', name: '乳腺癌筛查个案记录表', src: '妇幼管理 › 两癌筛查 › 乳腺癌筛查 › 新增个案',
    intro: '完整个案表单共59项字段，覆盖筛查基本信息、临床检查、超声/钼靶影像检查结果、病理诊断与后续处理建议。',
    fields: cancer.st.fields
  });
}

const maternal = getOpForm('孕产妇管理', '编辑');
if (maternal) {
  KEY_FORMS.push({
    code: 'KF-10', name: '孕产妇专项健康档案表', src: '妇幼管理 › 孕产妇管理 › 编辑',
    intro: '共31项字段，覆盖孕产史（孕次/产次/既往分娩方式）、本次妊娠信息（末次月经/预产期/孕周）、高危评估与产前检查等。',
    fields: maternal.st.fields
  });
}

const woman = getOpForm('妇女管理', '编辑');
if (woman) {
  KEY_FORMS.push({
    code: 'KF-11', name: '妇女健康档案表', src: '妇幼管理 › 妇女管理 › 编辑/查看',
    intro: '共29项字段，覆盖妇女基本健康信息与保健服务记录；行操作含关联个档（将妇女档案与居民个人档案关联）。',
    fields: woman.st.fields
  });
}

const familyNew = getOpForm('家庭档案', '新建');
if (familyNew) {
  KEY_FORMS.push({
    code: 'KF-12', name: '家庭档案新建表单', src: '档案管理 › 家庭档案 › 新建',
    intro: '23项字段，含家庭基本信息、家庭成员与精准扶贫信息（家庭收入、帮扶项目）。',
    fields: familyNew.st.fields
  });
}

const riskFollow = getOpForm('高危人群管理', '新建随访');
if (riskFollow) {
  KEY_FORMS.push({
    code: 'KF-13', name: '高危人群随访服务记录表', src: '慢病管理 › 高危人群管理 › 新建随访',
    intro: '31项字段的高危人群随访表单，覆盖危险因素监测与干预指导。',
    fields: riskFollow.st.fields
  });
}

function keyFormHtml(kf) {
  let body = '';
  if (kf.intro) body += '<p class="kf-intro">' + esc(kf.intro) + '</p>';
  if (kf.tabs && kf.tabs.length) body += '<div class="kf-bit"><b>页签：</b>' + esc(kf.tabs.join(' / ')) + '</div>';
  if (kf.qScale) body += '<div class="kf-bit"><b>量表规模：</b>' + kf.qScale.count + ' 题 × ' + kf.qScale.levels + ' 级评分（单选）</div>';
  if (kf.questionnaire) {
    body += '<details class="fd-details" open><summary>33道辨识问题全文（实测采集）</summary><div class="q-list">' + esc(kf.questionnaire)
      .replace(/（(\d{1,2})）/g, '<br><b>（$1）</b>') + '</div></details>';
  }
  if (kf.scale) {
    body += '<details class="fd-details" open><summary>评估量表全文（实测采集）</summary><div class="q-list">' + esc(kf.scale)
      .replace(/进餐：/g, '<b>① 进餐：</b>').replace(/梳洗：/g, '<br><b>② 梳洗：</b>').replace(/穿衣：/g, '<br><b>③ 穿衣：</b>').replace(/如厕：/g, '<br><b>④ 如厕：</b>').replace(/活动：/g, '<br><b>⑤ 活动：</b>') + '</div></details>';
  }
  if (kf.fields && kf.fields.length) {
    body += '<details class="fd-details" open><summary>字段明细（' + kf.fields.length + ' 项，含控件类型与选项）</summary>' + fieldTable(kf.fields) + '</details>';
  }
  return '<article class="kf-item" id="' + kf.code + '"><div class="kf-head"><span class="kf-code">' + kf.code + '</span><h4>' + esc(kf.name) + '</h4></div><div class="kf-src">' + esc(kf.src) + '</div>' + body + '</article>';
}
const keyFormsHtml = KEY_FORMS.map(keyFormHtml).join('');

// ---------- Patient 360 section ----------
const p360 = `
<section class="module-sec" id="sec-p360">
  <div class="module-head"><span class="mod-code">SYS-01</span><h3>患者360视图（贯穿全系统的居民档案总视图）</h3></div>
  <p class="module-desc">从任一业务模块进入某居民的"查看/编辑"或"查看患者360"后，系统进入统一的全屏居民档案视图（#/personalInfo），左侧为模块化导航，实现"一人一档、全程健康服务视图"。这是本系统最具特色的交互设计，重建系统时应作为核心架构需求。</p>
  <div class="p360-grid">
    <div class="p360-card"><h5>顶部居民信息横幅</h5><p>姓名/年龄、证件号、出生日期、血型、联系电话、药物过敏史、住址</p></div>
    <div class="p360-card"><h5>个人首页</h5><p>居民健康全景首页</p></div>
    <div class="p360-card"><h5>个人档案</h5><p>封面、个人基本信息（既往史/家族史/遗传病史/残疾情况/生活环境/家庭信息等56项字段）、健康信息卡、死亡登记表、卫生健康服务活动</p></div>
    <div class="p360-card"><h5>家庭管理</h5><p>家庭档案与成员关系</p></div>
    <div class="p360-card"><h5>妇女管理</h5><p>妇女保健记录（女性居民可见）</p></div>
    <div class="p360-card"><h5>转诊跟踪</h5><p>转诊记录跟踪</p></div>
    <div class="p360-card"><h5>健康体检</h5><p>历年体检记录</p></div>
    <div class="p360-card"><h5>慢病管理组</h5><p>高血压、糖尿病、高血脂、肿瘤、慢阻肺、心脑血管、高危人群管理</p></div>
    <div class="p360-card"><h5>专项管理组</h5><p>中医管理、结核病管理、重精管理、残疾人管理</p></div>
    <div class="p360-card"><h5>页面操作</h5><p>返回、编辑（受档案锁定/权限控制）、查看患者360、打印</p></div>
  </div>
</section>`;

// ---------- Workthrough section ----------
const walkthrough = `
<section class="module-sec" id="sec-walkthrough">
  <div class="module-head"><span class="mod-code">SYS-02</span><h3>管理员建档实操路径（实测验证）</h3></div>
  <p class="module-desc">以管理员身份实测完成的居民建档全流程，验证了关键业务链路：</p>
  <div class="steps-bar"><span class="step done">① 登录系统（账号鉴权，携带机构/部门信息）</span><span class="step-arrow">→</span><span class="step done">② 档案管理 › 居民档案 › 新建</span><span class="step-arrow">→</span><span class="step done">③ 居民查重弹窗（身份证/姓名/出生日期检索，防重复建档）</span><span class="step-arrow">→</span><span class="step done">④ 建档表单：封面（个人档案编号、姓名、现住址、户籍地址、建档单位/人、责任医生、建档日期等）</span><span class="step-arrow">→</span><span class="step done">⑤ 个人基本信息表（性别、证件、民族、血型、文化程度、职业、婚姻、医保支付方式、药物过敏史、暴露史、既往史、家族史、生活环境等）</span><span class="step-arrow">→</span><span class="step done">⑥ 保存生成档案（系统分配档案编号）</span><span class="step-arrow">→</span><span class="step done">⑦ 进入患者360视图继续完善/开展服务</span></div>
  <p class="module-desc">同时验证：档案列表行操作"查看/编辑"进入同一表单（viewStatus 区分模式）；"更多"菜单提供暂不管理、上锁、注销等档案治理操作；档案上锁后编辑字段转为只读。</p>
</section>`;

const NFR = [
  ['硬件集成', '多个建档/报卡页面提供"身份证读卡"入口，需集成身份证读卡器硬件接口，读取身份信息自动填充建档表单。'],
  ['患者360视图', '全屏居民档案视图贯穿各业务模块，左侧导航聚合个人档案、家庭、体检、各慢病/专项管理，需作为核心信息架构设计（一人一档、全程健康服务视图）。'],
  ['档案锁定与编辑权限', '档案列表含"锁定状态"列，"更多"菜单支持"上锁"操作；档案上锁或权限不足时编辑页字段只读（disabled），需设计档案锁与数据权限控制模型。'],
  ['量表引擎', '中医体质辨识（33题×5级+9体质自动判定）、老年人自理能力评估（5项×4级自动合计）、各病种分层评估等标准化量表，需设计可配置的量表引擎（题目、计分规则、结果判定）。'],
  ['外嵌BI大屏', '工作台"大屏"菜单外嵌第三方BI平台（de-bi-container 模板），需评估自研可视化或采购对接方案。'],
  ['外嵌查询平台', '业务查询模块8个菜单外嵌SQL自助查询平台（currentQsService），通过iframe携带用户token按queryId加载数据集，需决策自研报表查询引擎或延续外采。'],
  ['数据导出', '绝大多数列表页面提供"导出"操作，需统一实现列表数据导出（Excel）能力，并考虑大数据量的异步导出。'],
  ['单据打印', '体检表单、评估量表、随访表单、患者360等页面提供"打印/预览"操作，需提供符合国家基本公共卫生服务规范的打印模板能力。'],
  ['消息通知', '系统内置消息中心（任务/通知），支持异常登录提醒等系统级通知与全部标记已读，需设计站内消息机制。'],
  ['行政区划与机构权限', '查询条件普遍包含管理机构、管辖行政区、管辖网格三级筛选，数据按机构/部门隔离（登录令牌含部门与机构信息），需设计组织机构与数据权限模型。'],
  ['档案迁移工作流', '档案迁移遵循"迁移申请→迁入/迁出审核→档案恢复"的流转闭环，需设计对应的审批工作流。'],
  ['随访计划引擎', '计划提醒与各病种"新建随访"功能依赖随访计划规则（随访参数维护、指标参数维护），需设计可配置的随访计划引擎。'],
  ['操作审计', '系统提供操作日志与档案传输记录查询，需记录关键操作审计轨迹。']
];
const nfrRows = NFR.map((n, i) => '<div class="feat-row"><div class="feat-title"><span class="feat-no">NFR-' + String(i + 1).padStart(2, '0') + '</span>' + esc(n[0]) + '</div><p>' + esc(n[1]) + '</p></div>').join('');

const RECS = [
  { title: '以本清单作为V1.0功能基线与FRD输入组织需求评审', reason: '清单已覆盖19个一级模块、86个功能菜单的查询条件、列表字段、操作按钮、核心表单字段级明细与页签级明细，来源于四轮实测（菜单遍历 → 操作级深挖 → 量表级与建档实操 → 页签级遍历）。', impact: '可直接支撑产品需求文档（PRD）编写、数据字典设计与测试用例设计。', next: '组织产品/研发/测试三方评审，输出需求跟踪矩阵（RTM）与数据字典。' },
  { title: '对量表与随访表单建立标准模板库', reason: '中医体质辨识（33题）、老年人自理能力评估、各病种随访表单均源自国家基本公共卫生服务规范（第三版），表单结构标准且全国统一。', impact: '模板化设计可显著降低多病种随访表单的开发与维护成本。', next: '梳理国家规范全部服务表单，建立表单模板库与字段数据字典。' },
  { title: '患者360视图先行架构设计', reason: '患者360是全系统的信息架构核心，各业务模块的查看/编辑均汇聚于此。', impact: '架构决策影响前后端数据模型与路由设计，宜先行。', next: '输出患者360视图的原型设计与接口契约（聚合查询网关）。' },
  { title: '明确外嵌能力的技术选型', reason: '竞品的大屏（BI平台）与业务查询（SQL自助查询平台）均为外嵌第三方系统。', impact: '选型决策直接影响架构设计、采购成本与交付周期。', next: '对比自研可视化/查询引擎与外采方案，输出技术选型评审结论。' }
];
const recHtml = RECS.map(r => '<div class="rec-block"><h4>' + esc(r.title) + '</h4><dl><div><dt>原因</dt><dd>' + esc(r.reason) + '</dd></div><div><dt>影响</dt><dd>' + esc(r.impact) + '</dd></div><div><dt>下一步</dt><dd>' + esc(r.next) + '</dd></div></dl></div>').join('');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>公共卫生服务系统功能需求清单 V2.0（字段级明细版）</title>
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
  --success: #52C41A; --info: #0969DA; --reminder: #FF7A45; --warning: #FAAD14; --danger: #FF4D4F;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", system-ui, sans-serif; font-size: 14px; line-height: 20px; color: var(--page-text); background: var(--page-bg); }
.mono, .fr-code, .route { font-family: "JetBrains Mono", Consolas, "Courier New", monospace; }
a { color: var(--page-brand); text-decoration: none; }
a:hover { color: var(--page-brand-hover); text-decoration: underline; }

.report-intro { background: var(--page-brand-soft); border-bottom: 1px solid var(--page-border); }
.report-intro__content { max-width: 1080px; margin: 0 auto; padding: 56px 32px 44px; }
.intro-kicker { font-size: 13px; letter-spacing: 2px; color: var(--page-brand); font-weight: 600; margin-bottom: 14px; }
.report-intro h1 { font-size: 33px; line-height: 44px; font-weight: 700; letter-spacing: 1px; margin-bottom: 18px; }
.intro-summary { max-width: 820px; font-size: 15px; line-height: 26px; color: var(--page-text-secondary); margin-bottom: 24px; }
.intro-meta { display: flex; flex-wrap: wrap; gap: 10px 28px; font-size: 13px; color: var(--page-text-muted); }
.intro-meta span::before { content: "◆"; font-size: 8px; margin-right: 6px; color: var(--page-brand); vertical-align: 2px; }

main { max-width: 1080px; margin: 0 auto; padding: 8px 32px 32px; }
section.top-sec { padding: 44px 0 8px; }
h2.sec-title { font-size: 22px; line-height: 30px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
h2.sec-title .sec-no { font-size: 12px; font-weight: 600; color: var(--page-brand); background: var(--page-brand-soft); border: 1px solid var(--page-brand-soft-strong); border-radius: 6px; padding: 2px 8px; letter-spacing: 1px; }
.sec-sub { color: var(--page-text-muted); font-size: 13.5px; margin-bottom: 22px; }

.metric-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 26px; }
.metric-card { background: var(--page-bg); border: 1px solid var(--page-border); border-radius: 12px; padding: 18px 20px; }
.metric-card .m-label { font-size: 12.5px; color: var(--page-text-muted); margin-bottom: 8px; }
.metric-card .m-value { font-size: 27px; line-height: 32px; font-weight: 700; font-variant-numeric: tabular-nums; }
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
.bar i { display: block; height: 100%; background: var(--page-brand); border-radius: 4px; }

.module-sec { padding: 40px 0 6px; border-top: 1px solid var(--page-border); }
.module-sec:first-of-type { border-top: none; }
.module-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.mod-code { font-family: Consolas, monospace; font-size: 13px; font-weight: 600; color: var(--page-brand); background: var(--page-brand-soft); border-radius: 6px; padding: 3px 8px; }
.module-head h3 { font-size: 19px; font-weight: 700; }
.mod-count { font-size: 12.5px; color: var(--page-text-muted); }
.module-desc { color: var(--page-text-secondary); margin-bottom: 18px; max-width: 900px; }

.page-item { border: 1px solid var(--page-border); border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; background: var(--page-bg); }
.page-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.fr-code { font-size: 12.5px; font-weight: 600; color: var(--page-brand); }
.page-head h4 { font-size: 16px; font-weight: 700; }
.group-badge { font-size: 11.5px; font-weight: 500; color: var(--page-text-muted); background: var(--page-surface-muted); border-radius: 4px; padding: 2px 7px; margin-left: 4px; vertical-align: 2px; }
.route { font-size: 12px; color: var(--page-text-muted); margin-left: auto; }
.page-desc { color: var(--page-text-secondary); margin-bottom: 12px; line-height: 21px; }
.page-detail .row { display: flex; gap: 10px; padding: 5px 0; border-top: 1px dashed var(--page-border); }
.page-detail .row:first-child { border-top: none; }
.page-detail dt { flex: 0 0 76px; font-size: 12.5px; color: var(--page-text-muted); font-weight: 600; padding-top: 1px; }
.page-detail dd { flex: 1; font-size: 13px; line-height: 22px; }
.none { color: var(--page-text-muted); }
.chip { display: inline-block; font-size: 12px; background: var(--page-surface-muted); border: 1px solid var(--page-border); border-radius: 4px; padding: 1px 7px; margin: 2px 4px 2px 0; }
.tag { display: inline-block; font-size: 11.5px; font-weight: 600; border-radius: 4px; padding: 1px 7px; }
.tag-p0 { color: #C4320F; background: #FFECE6; }
.tag-p1 { color: #9A6700; background: #FFF8E1; }
.tag-p2 { color: #57606A; background: #EFF2F5; }

.op-block { margin-top: 12px; border: 1px solid var(--page-brand-soft-strong); background: #FDFEFF; border-radius: 8px; padding: 12px 14px; }
.op-block-title { font-size: 12.5px; font-weight: 600; color: var(--page-brand); margin-bottom: 8px; letter-spacing: .5px; }
.op-item { border-top: 1px dashed var(--page-border); padding: 8px 0 2px; }
.op-item:first-of-type { border-top: none; }
.op-line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.op-btn { font-size: 13px; font-weight: 600; color: var(--page-text); background: var(--page-brand-soft); border-radius: 4px; padding: 1px 8px; }
.op-from { font-size: 11.5px; color: var(--page-text-muted); }
.op-mode { font-size: 11.5px; border-radius: 4px; padding: 1px 6px; }
.mode-dialog { color: #1F6FEB; background: #EAF2FC; }
.mode-page { color: #8250DF; background: #F3EEFB; }
.mode-tab { color: #0E7A5F; background: #E9F7F1; }
.mode-none { color: #57606A; background: #EFF2F5; }
.mode-safe { color: #C4320F; background: #FFECE6; }
.tab-block { border-color: #BFE5D6; background: #FBFEFC; }
.op-form { margin: 6px 0 4px 8px; }
.op-bit { font-size: 12.5px; color: var(--page-text-secondary); line-height: 20px; }

.field-table { font-size: 12.5px; margin: 6px 0; }
.field-table th { padding: 5px 8px; }
.field-table td { padding: 4px 8px; }
.fd-name { font-weight: 500; }
.req-star { color: var(--danger); font-weight: 700; }
.req { color: #C4320F; font-size: 11.5px; }
.opt { color: var(--page-text-muted); font-size: 11.5px; }
.fd-extra { color: var(--page-text-secondary); font-size: 12px; }
.fd-more { color: var(--page-text-muted); font-size: 12px; text-align: center; }
.fd-details { margin: 4px 0; }
.fd-details summary { cursor: pointer; font-size: 12.5px; color: var(--page-brand); user-select: none; padding: 2px 0; }
.fd-details summary:hover { text-decoration: underline; }

.kf-item { border: 1px solid var(--page-border); border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; }
.kf-head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.kf-code { font-family: Consolas, monospace; font-size: 12.5px; font-weight: 600; color: var(--page-brand); background: var(--page-brand-soft); border-radius: 6px; padding: 3px 8px; }
.kf-head h4 { font-size: 16px; font-weight: 700; }
.kf-src { font-size: 12.5px; color: var(--page-text-muted); margin-bottom: 10px; }
.kf-intro { color: var(--page-text-secondary); line-height: 21px; margin-bottom: 10px; }
.kf-bit { font-size: 13px; color: var(--page-text-secondary); margin-bottom: 6px; }
.q-list { font-size: 13px; line-height: 22px; color: var(--page-text); background: var(--page-surface); border: 1px solid var(--page-border); border-radius: 8px; padding: 12px 16px; margin: 6px 0; }

.p360-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 14px 0; }
.p360-card { border: 1px solid var(--page-border); border-radius: 10px; padding: 12px 14px; background: var(--page-surface); }
.p360-card h5 { font-size: 13.5px; font-weight: 600; margin-bottom: 6px; color: var(--page-brand); }
.p360-card p { font-size: 12.5px; color: var(--page-text-secondary); line-height: 19px; }

.steps-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 14px 0; }
.step { font-size: 12.5px; background: var(--page-surface); border: 1px solid var(--page-border); border-radius: 8px; padding: 6px 10px; line-height: 18px; }
.step.done { border-color: var(--page-brand-soft-strong); background: #F6FAFF; }
.step-arrow { color: var(--page-text-muted); font-size: 14px; }

.feat-row { border-bottom: 1px solid var(--page-border); padding: 12px 0; }
.feat-row:last-child { border-bottom: none; }
.feat-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.feat-no { display: inline-block; font-family: Consolas, monospace; font-size: 12px; color: var(--page-brand); background: var(--page-brand-soft); border-radius: 4px; padding: 1px 6px; margin-right: 8px; }
.feat-row p { color: var(--page-text-secondary); font-size: 13px; line-height: 20px; }

.rec-block { border: 1px solid var(--page-border); border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; }
.rec-block h4 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
.rec-block dl { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.rec-block dt { font-size: 12px; font-weight: 600; color: var(--page-text-muted); margin-bottom: 4px; }
.rec-block dd { font-size: 13px; color: var(--page-text-secondary); line-height: 20px; }

footer { border-top: 1px solid var(--page-border); margin-top: 40px; padding: 20px 32px 36px; text-align: center; font-size: 12.5px; color: var(--page-text-muted); }

@media (max-width: 900px) {
  .metric-row { grid-template-columns: repeat(2, 1fr); }
  .p360-grid { grid-template-columns: 1fr; }
  .rec-block dl { grid-template-columns: 1fr; }
  main { padding: 8px 16px 24px; }
  .report-intro__content { padding: 40px 16px 32px; }
}
@media print {
  .op-block, .kf-item, .page-item, .rec-block { break-inside: avoid; }
}
</style>
</head>
<body>

<header class="report-intro">
  <div class="report-intro__content">
    <div class="intro-kicker">公共卫生服务系统 · 竞品逆向需求调研</div>
    <h1>功能需求清单 V2.0<br><span style="font-size:20px;font-weight:600;color:var(--page-text-secondary)">——含操作明细与表单字段级清单</span></h1>
    <p class="intro-summary">本清单基于对竞品系统的四轮深度实测调研：①19个一级模块、86个功能菜单的页面级遍历（查询条件、列表字段、页签）；②40+核心页面的操作级深挖（页头按钮、行操作、"更多"下拉菜单及每个操作打开的弹窗/跳转页表单结构）；③关键业务实操与量表级采集（管理员建档全流程、患者360视图、中医体质辨识33题量表、老年人自理能力评估量表、体检分页表单、各病种随访表单、传染病报卡等）；④页签级遍历——对${statTabEntries}个核心表单页面逐个点击每个页签，采集页签内的字段、表格、按钮及子表单（如家庭档案"家庭成员"页签的添加成员弹窗、精准扶贫页签44项字段、随访表单的"健康教育"页签）。共采集${statQuery}项查询条件、${statCols}项列表字段、${statForms}个业务表单、${statFields}项表单字段、${statTabPanels}个页签面板与${statTabFields}项页签字段，可直接作为产品需求文档（PRD）与数据字典设计输入。</p>
    <div class="intro-meta">
      <span>调研对象：竞品生产系统（192.168.200.83/phService）</span>
      <span>调研方式：自动化遍历 + 管理员实操验证</span>
      <span>调研时间：2026年9月</span>
      <span>文档版本：V2.0（字段级明细版）</span>
    </div>
  </div>
</header>

<main>

<section class="top-sec" id="report-overview">
  <h2 class="sec-title"><span class="sec-no">01</span>调研范围与统计总览</h2>
  <p class="sec-sub">四轮实测调研覆盖系统全部一级模块与功能菜单，统计口径为实测采集的去重明细项。</p>
  <div class="metric-row">
    <div class="metric-card"><div class="m-label">一级模块 / 功能菜单</div><div class="m-value">${MODULES.length}<em>个模块</em></div><div class="m-note">${statMenus} 个功能菜单（含外嵌页面）</div></div>
    <div class="metric-card"><div class="m-label">查询条件 / 列表字段</div><div class="m-value">${statQuery}<em>项条件</em></div><div class="m-note">${statCols} 项列表字段</div></div>
    <div class="metric-card"><div class="m-label">实测业务表单</div><div class="m-value">${statForms}<em>个表单</em></div><div class="m-note">${statFields} 项表单字段（字段级明细）</div></div>
    <div class="metric-card"><div class="m-label">页签级明细</div><div class="m-value">${statTabPanels}<em>个页签</em></div><div class="m-note">${statTabEntries} 个页面逐页签采集 · ${statTabFields} 项页签字段</div></div>
    <div class="metric-card"><div class="m-label">操作类型</div><div class="m-value">${opSet.size}<em>种</em></div><div class="m-note">页头按钮 / 行操作 / 更多菜单</div></div>
  </div>
  <div class="toc-card">
    <div class="toc-title">模块导航</div>
    <div class="toc-links">${tocLinks} <a href="#sec-p360">SYS-01 患者360视图</a> <a href="#sec-walkthrough">SYS-02 建档实操路径</a> <a href="#sec-keyforms">05 核心表单明细</a></div>
  </div>
</section>

<section id="report-arch">
  <h2 class="sec-title"><span class="sec-no">02</span>模块架构与优先级</h2>
  <p class="sec-sub">按业务优先级（P0 核心业务 / P1 重点业务 / P2 支撑业务）梳理的模块架构。</p>
  <table>
    <caption>表1 · 模块架构总览（19个一级模块，${statMenus}个功能菜单）</caption>
    <thead><tr><th style="width:18%">模块</th><th style="width:7%">菜单数</th><th style="width:18%">规模</th><th style="width:8%">优先级</th><th>模块说明</th></tr></thead>
    <tbody>${archRows}</tbody>
  </table>
</section>

<section id="report-summary">
  <h2 class="sec-title"><span class="sec-no">03</span>功能需求总表</h2>
  <p class="sec-sub">86个功能菜单的需求条目索引，FR编码规则：模块号-菜单号。</p>
  <table>
    <caption>表2 · 功能需求总表（${statMenus}项）</caption>
    <thead><tr><th style="width:9%">编号</th><th style="width:11%">模块</th><th style="width:16%">功能菜单</th><th style="width:8%">优先级</th><th>操作功能</th></tr></thead>
    <tbody>${summaryRows}</tbody>
  </table>
</section>

<section id="report-modules">
  <h2 class="sec-title"><span class="sec-no">04</span>模块功能需求明细</h2>
  <p class="sec-sub">每个功能菜单的查询条件、列表字段、操作功能，以及实测采集的操作明细（每个按钮打开的弹窗/页面表单结构）与页签级明细（逐个点击页签采集页签内的字段、表格与按钮，字段表可点击展开）。</p>
  ${moduleSections}
</section>

${p360}
${walkthrough}

<section class="module-sec" id="sec-keyforms">
  <div class="module-head"><span class="mod-code">05</span><h3>核心表单字段级明细（实测采集）</h3></div>
  <p class="module-desc">对建档、随访、报卡、量表、体检、筛查等核心业务表单的字段级明细。字段表包含字段名、控件类型、必填性与选项（如单选/复选的候选项），可直接作为数据字典与表单原型设计输入。</p>
  ${keyFormsHtml}
</section>

<section class="module-sec" id="sec-nfr">
  <div class="module-head"><span class="mod-code">06</span><h3>系统级与非功能需求</h3></div>
  <p class="module-desc">跨模块的系统级能力与技术需求。</p>
  ${nfrRows}
</section>

<section class="module-sec" id="sec-recs">
  <div class="module-head"><span class="mod-code">07</span><h3>后续工作建议</h3></div>
  ${recHtml}
</section>

</main>

<footer>公共卫生服务系统功能需求清单 V2.0 · 基于竞品系统四轮实测调研（菜单遍历 → 操作级深挖 → 量表级与实操验证 → 页签级遍历）· 2026年9月</footer>

</body>
</html>`;

const OUT = path.join(DIR, '..', '01-公共卫生服务系统产品文档', 'V1.0', '02.需求设计', '功能需求清单.html');
fs.writeFileSync(OUT, html, 'utf8');
console.log('written:', OUT, (fs.statSync(OUT).size / 1024).toFixed(1) + ' KB');
console.log('stats: menus=' + statMenus, 'query=' + statQuery, 'cols=' + statCols, 'forms=' + statForms, 'fields=' + statFields, 'opTypes=' + opSet.size, 'keyForms=' + KEY_FORMS.length);
