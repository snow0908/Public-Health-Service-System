/* ==========================================================================
 * 统一框架：顶部导航栏 + 左侧菜单栏（与 框架.css 配套使用）
 * --------------------------------------------------------------------------
 * 用法：页面 <body> 末尾、页面业务脚本之前引入（页面主体须为
 *       <div class="main-area">…</div>，框架会自动将其放入布局中）：
 *
 *   <script src="框架.js" data-page="tuomin" data-embed="auto"></script>
 *
 *   data-page     = 左侧菜单项的 key（用于当前页高亮），独立页面必填
 *   data-sysname  = 顶部系统名称（可选，默认「健康医疗应用中心」）
 *   data-org      = 顶部机构名称（可选，默认「温江区第一人民医院」）
 *   data-embed    = 嵌入模式（可选）："auto" 被框架壳子以 iframe 内嵌、或
 *                   URL 带 ?embed=1 时自动生效——不注入顶部导航栏 / 左侧
 *                   菜单栏，仅提供公共函数（toast / escapeHtml 等）与 Toast
 *                   容器；"true" 强制嵌入模式。独立打开时行为不变
 *   data-shell    = 壳子模式（可选）："true" 表示本页为框架壳子（index.html），
 *                   菜单点击不做整页跳转，转交 window.shellOpen(key) 由壳子
 *                   在右侧内容区装载对应页面
 *
 * 新增业务页面步骤：
 *   1. 在下方 MENU 中增加菜单项（key、label、url）
 *   2. 新页面引入 框架.css / 框架.js，传入对应 data-page 与 data-embed="auto"
 *      （页面既可独立打开，也可被 index.html 框架壳子内嵌装载）
 *   3. 页面文件尚未提供时不要配置 url：壳子会显示「功能建设中」占位页
 * ========================================================================== */
(function () {
  'use strict';

  /* ================= 菜单配置（改菜单只需改这里） ================= */
  var MENU = [
    { type: 'group', key: 'archives', label: '档案管理',
      icon: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="2" y1="11" x2="22" y2="11"/>',
      children: [
        { key: 'resident-archives',      label: '居民档案', url: '居民档案列表.html' },
        { key: 'family-archives',        label: '家庭档案', url: '家庭档案.html' },
        { key: 'disability-archives',    label: '残疾档案', url: '残疾档案.html' },
        { key: 'archive-migration',      label: '档案迁移' , url: '档案迁移.html'},
        { key: 'migration-review',       label: '迁移审核', url: '迁移审核.html' },
        { key: 'archive-recovery',       label: '档案恢复', url: '档案恢复.html' },
        { key: 'archive-access-records', label: '档案查阅记录', url: '档案查阅记录.html' },
        { key: 'health-checkup',         label: '健康体检' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'plan-reminder', label: '计划提醒',
      icon: '<path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/>',
      children: [
        { key: 'physical-exam-reminder', label: '随访计划提醒', url: '计划提醒.html' },
        { key: 'follow-poor-reminder',   label: '随访不佳提醒', url: '随访不佳提醒.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'chronic', label: '慢病管理',
      icon: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
      children: [
        { key: 'hypertension-management',   label: '高血压管理', url: '高血压管理.html' },
        { key: 'diabetes-management',       label: '糖尿病管理', url: '糖尿病管理.html' },
        { key: 'copd-management',           label: '慢阻肺管理', url: '慢阻肺管理.html' },
        { key: 'hyperlipidemia-management', label: '高血脂管理', url: '高血脂管理.html' },
        { key: 'cardio-cerebro-management', label: '心脑血管管理', url: '心脑血管管理.html' },
        { key: 'tumor-management',          label: '肿瘤管理', url: '肿瘤管理.html' },
        { key: 'highrisk-management',       label: '高危人群管理', url: '高危人群管理.html' },
        { key: 'psychosis-management',      label: '重精管理', url: '重精管理.html' },
        { key: 'tuberculosis-management',   label: '结核病管理', url: '结核病管理.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'tcm', label: '中医管理',
      icon: '<path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
      children: [
        { key: 'elderly-tcm-management', label: '老年人中医管理', url: '老年人中医管理.html' },
        { key: 'child-tcm-management',   label: '儿童中医管理',   url: '儿童中医管理.html' },
        { key: 'tcm-health-guidance',    label: '中医健康指导',   url: '中医健康指导.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'elderly', label: '老年人管理',
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      children: [
        { key: 'elderly-management', label: '老年人管理', url: '老年人管理.html' }
      ] },
    { type: 'group', key: 'women-child', label: '妇幼管理',
      icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
      children: [
        { key: 'women-management',                 label: '妇女管理', url: '妇女管理.html' },
        { key: 'maternal-management',              label: '孕产妇管理', url: '孕产妇管理.html' },
        { key: 'child-management',                 label: '儿童管理', url: '儿童管理.html' },
        { key: 'immunization-management',          label: '计免管理', url: '计免管理.html' },
        { key: 'cancer-screening',                 label: '两癌筛查',
          children: [
            { key: 'cervical-cancer-screening', label: '宫颈癌筛查', url: '宫颈癌筛查.html' },
            { key: 'breast-cancer-screening',   label: '乳腺癌筛查', url: '乳腺癌筛查.html' }
          ] },
        { key: 'pmtct',                            label: '母婴阻断' },
        { key: 'child-health-care',                 label: '儿童保健', url: '儿童保健.html' },
        { key: 'maternal-health-care',             label: '孕产妇保健', url: '孕产妇保健.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'jianjiao', label: '健教管理',
      icon: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/>',
      children: [
        { key: 'activity-management',       label: '活动管理', url: '活动管理.html' },
        { key: 'billboard-management',      label: '宣传栏管理', url: '宣传栏管理.html' },
        { key: 'audiovisual-management',    label: '音像管理', url: '音像管理.html' },
        { key: 'broadcast-management',      label: '广播管理', url: '广播管理.html' },
        { key: 'individual-education',      label: '个体教育管理' },
        { key: 'plan-management',           label: '计划管理', url: '计划管理.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'supervision', label: '卫生监督',
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
      children: [
        { key: 'location-maintenance', label: '地点维护' },
        { key: 'inspection-register',  label: '巡查登记' },
        { key: 'event-report',         label: '事件报告' }
      ] },
    { type: 'group', key: 'three-network', label: '三网监测',
      icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
      children: [
        { key: 'maternal-death-management', label: '孕产妇死亡管理', url: '孕产妇死亡管理.html' },
        { key: 'perinatal-death-management', label: '围产儿死亡管理', url: '围产儿死亡管理.html' },
        { key: 'neonatal-defect-management', label: '新生儿缺陷管理', url: '新生儿缺陷管理.html' },
        { key: 'child-death-management', label: '儿童死亡管理', url: '儿童死亡管理.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'reportcard', label: '疾病报卡',
      icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      children: [
        { key: 'infectious-report', label: '传染病报卡', url: '传染病报卡.html' },
        { key: 'early-preg-report', label: '早孕报告卡', url: '早孕报告卡.html' },
        { key: 'chronic-report', label: '慢病报告卡', url: '慢病报告卡.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'bizquery', label: '业务查询',
      icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      children: [
        { key: 'health-edu-track-query', label: '健教活动跟踪查询' },
        { key: 'report-indicator-query', label: '报表指标查询' },
        { key: 'duplicate-archive-screen', label: '重复档案筛查' },
        { key: 'personal-archive-query', label: '个人档案查询' },
        { key: 'chronic-disease-query',  label: '慢病查询' },
        { key: 'tb-query',               label: '肺结核查询' },
        { key: 'women-archive-query',    label: '妇女档案查询' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'syssetting', label: '系统设置',
      icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
      children: [
        { key: 'jurisdiction-management',  label: '辖区管理', url: '辖区管理.html' },
        { key: 'biz-template-management',  label: '业务模板管理',
          children: [
            { key: 'health-guidance-template',    label: '健康指导模板',       url: '健康指导模板.html' },
            { key: 'elderly-tcm-guide-template',  label: '老年人中医指导模板', url: '老年人中医指导模板.html' },
            { key: 'child-tcm-guide-template',    label: '儿童中医指导模板', url: '儿童中医指导模板.html' },
            { key: 'tcm-health-template',         label: '中医保健模板', url: '中医保健模板.html' }
          ] },
        { key: 'jurisdiction-stats-maintenance', label: '辖区统计维护', url: '辖区统计维护.html' },
        { key: 'sys-param-management',     label: '系统参数管理' },
        { key: 'subsidy-management',       label: '补助管理' },
        { key: 'disease-diagnosis-setting',label: '疾病诊疗设置' },
        { key: 'basic-param-maintenance',  label: '基本参数维护' },
        { key: 'grid-management',          label: '网格化管理' },
        { key: 'grid-permission-mgmt',     label: '网格权限管理' },
        { key: 'archive-transfer-record',  label: '档案传输记录' },
        { key: 'operation-log',            label: '操作日志', url: '档案操作日志.html' },
        { key: 'interface-address-mgmt',   label: '接口地址管理' },
        { key: 'form-maintenance',         label: '表单维护', url: '表单维护.html' }
      ] }
  ];

  /* ================= 页面参数 ================= */
  var scriptTag = document.currentScript || document.querySelector('script[src$="框架.js"]') || {};
  var pageKey = scriptTag.getAttribute('data-page') || '';
  // 壳子模式：index.html 框架壳子声明（data-shell="true"），菜单点击转交 window.shellOpen 装载页面
  var shellMode = scriptTag.getAttribute('data-shell') === 'true';
  // 嵌入模式：页面被壳子以 iframe 内嵌时的形态（不注入顶部导航栏 / 左侧菜单栏，仅提供公共函数）
  // data-embed="auto" 自动检测（iframe 内嵌或 URL 带 ?embed=1）；data-embed="true" 强制启用
  var embedAttr = scriptTag.getAttribute('data-embed') || '';
  var embedMode = embedAttr === 'true' ||
    (embedAttr === 'auto' && (window.self !== window.top ||
      new URLSearchParams(location.search).get('embed') === '1'));
  if (embedMode) document.documentElement.classList.add('embed-mode');
  // 框架所在目录：菜单 url 统一以此为基准解析，支持子文件夹内的页面（如 视图管理/）
  var frameSrc = scriptTag.getAttribute('src') || '';
  var FRAME_DIR = (frameSrc.match(/^(.*\/)?框架\.js$/) || ['', ''])[1] || '';
  var sysName = scriptTag.getAttribute('data-sysname') || '健康医疗应用中心';
  var orgName = scriptTag.getAttribute('data-org') || '温江区第一人民医院';

  /* ================= 顶部导航栏 ================= */
  /* 注意：此处是 topbar 容器的内部内容，外层 div.topbar 由 inject() 创建，勿重复包裹 */
  var TOPBAR_HTML = `
  <img class="tb-logo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='3' width='7' height='7' rx='1.5' fill='white'/%3E%3Crect x='14' y='3' width='7' height='7' rx='1.5' fill='white'/%3E%3Crect x='3' y='14' width='7' height='7' rx='1.5' fill='white'/%3E%3Crect x='14' y='14' width='7' height='7' rx='1.5' fill='white'/%3E%3C/svg%3E" alt="">
  <span class="tb-sysname">${sysName}</span>
  <span class="tb-org">${orgName}</span>
  <div class="spacer"></div>
  <div class="tb-badge">
    <svg viewBox="0 0 19 18" width="19" height="18" fill="none"><rect x="0.5" y="0.5" width="18" height="17" rx="3" stroke="rgba(255,255,255,0.6)" stroke-width="1"/></svg>
    <div class="badge-dot"><svg viewBox="0 0 6 9" width="6" height="9"><text x="0" y="8" font-size="9" fill="white" font-weight="700">2</text></svg></div>
  </div>
  <img class="tb-icon" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cpath d='M13.73 21a2 2 0 01-3.46 0' stroke='white' stroke-width='1.5' fill='none'/%3E%3C/svg%3E" alt="">
  <img class="tb-icon2" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8' r='4' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cpath d='M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5' stroke='white' stroke-width='1.5' fill='none'/%3E%3C/svg%3E" alt="">
  <img class="tb-avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 25 25'%3E%3Ccircle cx='12.5' cy='12.5' r='12.5' fill='rgba(255,255,255,0.25)'/%3E%3Ccircle cx='12.5' cy='10' r='4' fill='white'/%3E%3Cellipse cx='12.5' cy='21' rx='7' ry='4' fill='white'/%3E%3C/svg%3E" alt="">
  <span class="tb-user">admin</span>
  <svg class="tb-arrow" viewBox="0 0 10 5"><polygon points="0,0 5,5 10,0" fill="rgba(255,255,255,0.6)"/></svg>`;

  /* ================= 左侧菜单栏 ================= */
  function buildSidebar() {
    var html = '<aside class="sidebar"><div class="sidebar-menu">';
    MENU.forEach(function (it) {
      if (it.type === 'divider') { html += '<div class="menu-divider"></div>'; return; }
      var children = it.children || [];
      var isGroup = it.type === 'group';
      // 分组展开：pageKey 命中直接子项或三级孙项（如 妇幼管理 → 两癌筛查 → 宫颈癌筛查）
      var expanded = isGroup && children.some(function (c) {
        return c.key === pageKey || (c.children || []).some(function (s) { return s.key === pageKey; });
      });
      html += '<div class="menu-item' + (expanded ? ' expanded' : '') + '" data-key="' + it.key + '" onclick="' +
        (isGroup ? 'toggleMenu(this)' : "navigate('" + it.key + "')") + '">' +
        '<span class="menu-icon"><svg viewBox="0 0 24 24">' + it.icon + '</svg></span>' +
        '<span class="menu-label">' + it.label + '</span>' +
        (isGroup ? '<svg class="arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>' : '') +
        '</div>';
      if (isGroup) {
        html += '<div class="menu-sub' + (expanded ? ' open' : '') + '">' + children.map(function (c) {
          var subs = c.children || [];
          // 三级子分组（如：妇幼管理 → 两癌筛查 → 宫颈癌筛查）：点击仅展开/收起，不导航
          if (subs.length) {
            var subExpanded = expanded || subs.some(function (s) { return s.key === pageKey; });
            return '<div class="sub-item has-children' + (subExpanded ? ' expanded' : '') + '" data-key="' + c.key + '" onclick="event.stopPropagation();toggleSubMenu(this)">' +
              '<span class="sub-label">' + c.label + '</span>' +
              '<svg class="arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>' +
              '</div>' +
              '<div class="menu-sub sub2' + (subExpanded ? ' open' : '') + '">' + subs.map(function (s) {
                var act = s.key === pageKey ? ' active' : '';
                return '<div class="sub-item sub3' + act + '" data-key="' + s.key + '" onclick="event.stopPropagation();navigate(\'' + s.key + '\')">' + s.label + '</div>';
              }).join('') + '</div>';
          }
          var active = c.key === pageKey ? ' active' : '';
          return '<div class="sub-item' + active + '" data-key="' + c.key + '" onclick="event.stopPropagation();navigate(\'' + c.key + '\')">' + c.label + '</div>';
        }).join('') + '</div>';
      }
    });
    return html + '</div></aside>';
  }

  /* ================= 框架注入 ================= */
  function inject() {
    // Toast 容器（所有模式通用）
    var toastDiv = document.createElement('div');
    toastDiv.className = 'toast';
    toastDiv.id = 'toast';
    document.body.appendChild(toastDiv);
    // 嵌入模式：不注入顶部导航栏 / 左侧菜单栏 / 布局
    if (embedMode) return;
    var main = document.querySelector('.main-area');
    if (!main) return;
    // 创建布局并注入左侧菜单栏，把页面主内容区移入布局
    var layout = document.createElement('div');
    layout.className = 'layout';
    layout.innerHTML = buildSidebar();
    main.parentNode.insertBefore(layout, main);
    layout.appendChild(main);
    // 顶部导航栏插入 body 最前
    var topbar = document.createElement('div');
    topbar.className = 'topbar';
    topbar.innerHTML = TOPBAR_HTML;
    document.body.insertBefore(topbar, document.body.firstChild);
  }

  /* ================= 公共函数（页面可直接调用） ================= */
  function findMenuItem(key) {
    for (var i = 0; i < MENU.length; i++) {
      var it = MENU[i];
      if (it.key === key) return it;
      var children = it.children || [];
      for (var j = 0; j < children.length; j++) {
        if (children[j].key === key) return children[j];
        var subs = children[j].children || [];
        for (var k = 0; k < subs.length; k++) {
          if (subs[k].key === key) return subs[k];
        }
      }
    }
    return null;
  }

  /* 查菜单项（含子项）所属分组 key */
  function findGroupKeyOf(key) {
    for (var i = 0; i < MENU.length; i++) {
      var it = MENU[i];
      if (it.type !== 'group') continue;
      if (it.key === key) return it.key;
      var children = it.children || [];
      for (var j = 0; j < children.length; j++) {
        if (children[j].key === key) return it.key;
        var subs = children[j].children || [];
        for (var k = 0; k < subs.length; k++) {
          if (subs[k].key === key) return it.key;
        }
      }
    }
    return null;
  }

  window.toggleMenu = function (el) {
    var willExpand = !el.classList.contains('expanded');
    // 手风琴：展开某一第一层目录时，其余第一层目录全部收起
    if (willExpand) {
      var items = document.querySelectorAll('.menu-item');
      for (var i = 0; i < items.length; i++) {
        if (items[i] !== el) {
          items[i].classList.remove('expanded');
          var sb = items[i].nextElementSibling;
          if (sb && sb.classList.contains('menu-sub')) sb.classList.remove('open');
        }
      }
    }
    el.classList.toggle('expanded');
    var sub = el.nextElementSibling;
    if (sub) sub.classList.toggle('open');
  };

  /* 三级子分组展开/收起（如：两癌筛查、业务模板管理） */
  /* 手风琴：展开某一二级目录时，同级其他二级目录（含其三级子菜单）全部收起 */
  window.toggleSubMenu = function (el) {
    var willExpand = !el.classList.contains('expanded');
    if (willExpand) {
      var parent = el.parentElement;
      var sibs = parent.querySelectorAll(':scope > .sub-item.has-children');
      for (var i = 0; i < sibs.length; i++) {
        if (sibs[i] !== el) {
          sibs[i].classList.remove('expanded');
          var sb = sibs[i].nextElementSibling;
          if (sb && sb.classList.contains('menu-sub')) sb.classList.remove('open');
        }
      }
    }
    el.classList.toggle('expanded');
    var sub = el.nextElementSibling;
    if (sub && sub.classList.contains('menu-sub')) sub.classList.toggle('open');
  };

  window.navigate = function (key) {
    var item = findMenuItem(key);
    if (!item) return;
    // 壳子模式：菜单点击转交壳子（打开/激活标签页并在右侧装载页面），不做整页跳转
    if (shellMode && window.shellOpen) { window.shellOpen(key); return; }
    if (item.url) {
      if (item.key === pageKey) return; // 当前页
      window.location.href = FRAME_DIR + item.url;
    } else {
      toast('已切换到：' + item.label, 'info');
    }
  };

  /* ================= 壳子（index.html）可用导出 ================= */
  window.MENU_CONFIG = MENU;      // 菜单配置（壳子取标签页名称 / url / 所属分组图标）
  window.FRAME_DIR = FRAME_DIR;   // 框架目录（菜单 url 解析基准）
  window.findMenuItem = findMenuItem;
  // 判断菜单节点（含任意层级 children）是否包含指定 key
  function nodeContainsKey(node, key) {
    if (!node) return false;
    if (node.key === key) return true;
    var ch = node.children || [];
    for (var i = 0; i < ch.length; i++) {
      if (nodeContainsKey(ch[i], key)) return true;
    }
    return false;
  }

  // 菜单高亮：壳子切换标签页时同步左侧菜单选中态
  // 手风琴（accordion）：仅展开「包含当前 key 的分组链路」，其余分组全部收起
  window.setMenuActive = function (key) {
    // 1) 高亮当前选中项
    var subs = document.querySelectorAll('.menu-sub .sub-item');
    for (var i = 0; i < subs.length; i++) {
      subs[i].classList.toggle('active', subs[i].getAttribute('data-key') === key);
    }
    // 2) 一级分组：包含 key 的展开，其余收起
    var items = document.querySelectorAll('.menu-item');
    for (var g = 0; g < items.length; g++) {
      var gi = items[g];
      var gk = gi.getAttribute('data-key');
      var gnode = null;
      for (var m = 0; m < MENU.length; m++) { if (MENU[m].key === gk) { gnode = MENU[m]; break; } }
      var contains = gnode ? nodeContainsKey(gnode, key) : false;
      gi.classList.toggle('expanded', contains);
      var gsub = gi.nextElementSibling;
      if (gsub && gsub.classList.contains('menu-sub')) gsub.classList.toggle('open', contains);
    }
    // 3) 三级子分组（.menu-sub.sub2）：仅保留包含 key 的那个展开
    var subs2 = document.querySelectorAll('.menu-sub.sub2');
    for (var j = 0; j < subs2.length; j++) {
      var owner = subs2[j].previousElementSibling;
      if (owner && owner.classList.contains('has-children')) {
        var hasLeaf = !!subs2[j].querySelector('.sub-item[data-key="' + key + '"]');
        owner.classList.toggle('expanded', hasLeaf);
        subs2[j].classList.toggle('open', hasLeaf);
      }
    }
  };

  var _toastTimer;
  window.toast = function (msg, type) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2000);
  };

  window.escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  inject();
})();
