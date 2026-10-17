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
/* ==========================================================================
 * 来源页记录（供各页面「返回」按钮回到跳转进来的界面）
 * --------------------------------------------------------------------------
 * file:// 协议下 document.referrer 为空，故用 sessionStorage 记录「上一次
 * 访问过的原型页文件名」，页面脚本可直接读 window.__prevPage。
 * 由本文件统一注入，业务页面无需改造。
 * ========================================================================== */
(function () {
  var KEY = 'hps.navPrev';
  var raw = (location.pathname.split('/').pop() || '');
  var cur = raw;
  try { cur = decodeURIComponent(raw); } catch (e) {}
  try {
    var prev = sessionStorage.getItem(KEY) || '';
    sessionStorage.setItem(KEY, cur);
    window.__prevPage = (prev && prev !== cur) ? prev : '';
  } catch (e) {
    window.__prevPage = '';
  }
})();

(function () {
  'use strict';

  /* ================= 菜单配置（改菜单只需改这里） ================= */
  var MENU = [
    { key: 'dashboard', label: '首页', url: '首页.html',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { type: 'divider' },
    { type: 'group', key: 'archives', label: '档案管理',
      icon: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="2" y1="11" x2="22" y2="11"/>',
      children: [
        { key: 'resident-archives',      label: '居民档案', url: '居民档案列表.html' },
        { key: 'family-archives',        label: '家庭档案', url: '家庭档案.html' },
        { key: 'health-checkup',         label: '健康体检', url: '体检管理.html',
          children: [
        { key: 'exam-registration',      label: '体检登记', url: '体检登记.html' },
        { key: 'exam-management',        label: '体检管理', url: '体检管理.html' }
      ]
         },
        // { key: 'visit-tracking',         label: '就诊跟踪' },
        { key: 'disability-archives',    label: '残疾档案', url: '残疾档案.html' },
        { key: 'archive-migration',      label: '档案迁移' , url: '档案迁移.html'},
        { key: 'migration-in',           label: '迁入审核', url: '迁入审核.html' },
        { key: 'migration-out',          label: '迁出审核', url: '迁出审核.html' },
        { key: 'archive-recovery',       label: '档案恢复', url: '档案恢复.html' },
        { key: 'archive-access-records', label: '档案查阅记录', url: '档案查阅记录.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'plan-reminder', label: '计划提醒',
      icon: '<path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/>',
      children: [
        { key: 'physical-exam-reminder', label: '计划提醒', url: '计划提醒.html' },
        { key: 'follow-poor-reminder',   label: '不佳提醒', url: '随访不佳提醒.html' },
        { key: 'reminder-management', label: '更新提醒', url: '提醒管理.html'}
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
      ] },
    { type: 'divider' },
    { key: 'psychosis-management', label: '重精管理', url: '重精管理.html',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { type: 'divider' },
    { key: 'tuberculosis-management', label: '结核病管理', url: '结核病管理.html',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { type: 'divider' },
    { key: 'elderly-management', label: '老年人管理', url: '老年人管理.html',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { type: 'divider' },
    
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
        { key: 'pmtct',                            label: '母婴阻断',
          children: [
            { key: 'hepatitis-b-management', label: '乙肝管理', url: '乙肝管理.html' },
            { key: 'syphilis-management',    label: '梅毒管理', url: '梅毒管理.html' },
            { key: 'aids-management',        label: '艾滋管理', url: '艾滋管理.html' },
          ] 
         },
        { key: 'child-health-care',                 label: '儿童保健', url: '儿童保健.html' },
        { key: 'maternal-health-care',             label: '孕产妇保健', url: '孕产妇保健.html' }
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
    { type: 'group', key: 'jianjiao', label: '健教管理',
      icon: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/>',
      children: [
        { key: 'activity-management',       label: '活动管理', url: '活动管理.html' },
        { key: 'billboard-management',      label: '宣传栏管理', url: '宣传栏管理.html' },
        { key: 'audiovisual-management',    label: '音像管理', url: '音像管理.html' },
        { key: 'broadcast-management',      label: '广播管理', url: '广播管理.html' },
        { key: 'individual-education',      label: '个体教育管理', url: '个体化健康教育管理.html' },
        { key: 'plan-management',           label: '计划管理', url: '计划管理.html' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'supervision', label: '卫生监督',
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
      children: [
        { key: 'location-maintenance', label: '地点维护', url: '地点维护.html' },
        { key: 'inspection-register',  label: '巡查登记', url: '巡查登记.html' },
        { key: 'event-report',         label: '事件报告', url: '事件报告.html' }
      ] },
    { type: 'divider' },
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
    { type: 'group', key: 'bizstats', label: '业务统计',
      icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>',
      children: [
        { key: 'personal-archive-stat',  label: '个人档案统计' },
        { key: 'health-edu-stat',        label: '健康宣教统计', url: '健康宣教统计.html' },
        { key: 'doctor-workload-stat',   label: '医生工作量统计', url: '医生工作量统计.html' },
      ] },
    { type: 'divider' },
    { type: 'group', key: 'syssetting', label: '系统设置',
      icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
      children: [
        { key: 'jurisdiction-management',  label: '辖区管理', url: '辖区管理.html' },
        { key: 'area-grid-management',    label: '网格化管理', url: '区域网格化管理.html' },
        { key: 'area-grid-permission',    label: '网格化权限管理', url: '区域网格化权限管理.html' },
        { key: 'biz-template-management',  label: '业务模板管理',
          children: [
            { key: 'health-guidance-template',    label: '健康指导模板',       url: '健康指导模板.html' },
            { key: 'elderly-tcm-guide-template',  label: '老年人中医指导模板', url: '老年人中医指导模板.html' },
            { key: 'child-tcm-guide-template',    label: '儿童中医指导模板', url: '儿童中医指导模板.html' },
            { key: 'tcm-health-template',         label: '中医保健模板', url: '中医保健模板.html' }
          ] },
        
        { key: 'sys-param-management',     label: '系统参数管理' ,
          children: [
            { key: 'jurisdiction-stats-maintenance', label: '辖区统计维护', url: '辖区统计维护.html' },
            { key: 'form-maintenance',            label: '表单维护', url: '表单维护.html' },
            { key: 'basic-param-maintenance',  label: '基本参数维护', url: '基本参数维护.html' },
          ]
        },
        // { key: 'subsidy-management',       label: '补助管理' },
        { key: 'disease-diagnosis-setting',label: '疾病诊疗设置', url: '疾病诊疗设置.html' },
        { key: 'operation-log',            label: '操作日志', url: '档案操作日志.html' },
        { key: 'des-log',            label: '脱敏设置', url: '脱敏规则.html' }
       
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

/* ==========================================================================
   统一筛选复合控件：管理机构(多选) / 管辖行政区(级联) / 管辖网格(树形)
   样式与交互对齐「居民档案列表.html」中这三个条件
   页面只需放置带 data-fcp 的容器 + 隐藏域，本模块自动渲染面板与交互
   ========================================================================== */
(function () {
  if (window.__FCP_INITED__) return;
  window.__FCP_INITED__ = true;

  /* ---- 演示数据（与 居民档案列表.html 保持一致） ---- */
  var ORG_LIST = ['**大学淮河医院', '温江区华西医院', '成都市新都区妇幼保健院', '江都区大桥镇', '山东大学齐鲁医院'];

  var REGION_TREE = {
    '江苏省': {
      '南京市': {
        '玄武区': ['梅园新村街道', '新街口街道', '玄武门街道', '锁金村街道', '红山街道', '孝陵卫街道'],
        '秦淮区': ['夫子庙街道', '朝天宫街道', '双塘街道', '中华门街道'],
        '建邺区': ['莫愁湖街道', '南苑街道', '兴隆街道', '沙洲街道'],
        '鼓楼区': ['华侨路街道', '宁海路街道', '湖南路街道', '中央门街道'],
        '浦口区': ['泰山街道', '顶山街道', '江浦街道', '沿江街道'],
        '栖霞区': ['尧化街道', '马群街道', '迈皋桥街道', '燕子矶街道']
      },
      '无锡市': { '梁溪区': ['崇安寺街道', '清名桥街道'], '滨湖区': ['河埒街道', '蠡湖街道'] },
      '徐州市': { '云龙区': ['彭城街道', '子房街道'], '鼓楼区': ['黄楼街道', '牌楼街道'] },
      '常州市': { '天宁区': ['雕庄街道', '青龙街道'], '钟楼区': ['南大街街道', '荷花池街道'] },
      '苏州市': { '姑苏区': ['观前街道', '平江街道'], '吴中区': ['长桥街道', '木渎镇'] },
      '南通市': { '崇川区': ['城东街道', '和平桥街道'], '通州区': ['金沙街道', '金新街道'] }
    }
  };

  var GRID_TREE = [{
    name: '江都区',
    children: [{ name: '郭村镇', children: ['郭村村', '韩阳村', '庄桥村', '东进村', '前巷村', '南荀村', '张倪村'] }]
  }];

  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function closeAll(except) {
    all('.fcp-ms.open,.fcp-cas.open,.fcp-tree.open,.fcp-mst.open').forEach(function (el) {
      if (el !== except) el.classList.remove('open');
    });
  }
  function setText(el, text, hasVal) {
    var t = el.querySelector('.fcp-text');
    if (t) { t.textContent = text; t.classList.toggle('is-ph', !hasVal); }
    el.classList.toggle('has-val', !!hasVal);
  }
  /* 写回隐藏域；劫持后走原生 setter，避免递归 */
  function writeVal(el, v) {
    var inp = el.querySelector('.fcp-val');
    if (!inp) return;
    if (el.__rawSet) { el.__rawSet(v); return; }
    inp.value = v;
  }

  /* ---------------- 数据源：页面可用 data-options / data-tree 覆盖默认值 ---------------- */
  function optsOf(el) {
    var s = el.getAttribute('data-options');
    return s ? s.split('|') : ORG_LIST;
  }
  function treeOf(el) {
    var s = el.getAttribute('data-tree');
    if (!s) return GRID_TREE;
    try {
      var conv = function (n) {
        return (typeof n === 'string')
          ? { name: n, children: [] }
          : { name: n.n, children: (n.c || []).map(conv) };
      };
      return JSON.parse(s).map(conv);
    } catch (e) { return GRID_TREE; }
  }

  /* ---------------- 管理机构 / 专项建档机构：多选（复选框） ---------------- */
  function renderMs(el) {
    var sel = el._sel || [];
    el.querySelector('.fcp-panel').innerHTML = optsOf(el).map(function (n) {
      var on = sel.indexOf(n) !== -1;
      return '<label class="fcp-opt' + (on ? ' on' : '') + '"><input type="checkbox" value="' + n + '"'
        + (on ? ' checked' : '') + '><span>' + n + '</span></label>';
    }).join('');
    setText(el, sel.length ? '已选择（' + sel.length + '）' : '请选择', sel.length > 0);
    writeVal(el, sel.join(','));
  }

  /* ---------------- 随访类型：多选（无复选框，选中右侧对勾） ---------------- */
  function renderMst(el) {
    var sel = el._sel || [];
    el.querySelector('.fcp-panel').innerHTML = optsOf(el).map(function (n) {
      var on = sel.indexOf(n) !== -1;
      return '<div class="fcp-opt tick' + (on ? ' on' : '') + '" data-v="' + n + '">'
        + '<span class="fcp-lab">' + n + '</span><span class="fcp-ck">✓</span></div>';
    }).join('');
    setText(el, sel.length ? '已选择（' + sel.length + '）' : '请选择', sel.length > 0);
    writeVal(el, sel.join(','));
  }

  /* ---------------- 管辖行政区：级联 ---------------- */
  function casNames(path) {
    var node = REGION_TREE;
    for (var i = 0; i < path.length; i++) node = node ? node[path[i]] : null;
    if (Array.isArray(node)) return node;
    return node ? Object.keys(node) : [];
  }
  function casColHtml(el, level, names) {
    var drill = el._drill || [], sel = el._selPath || [];
    var parents = drill.slice(0, level), active = drill[level], selKey = sel.join('/');
    return '<div class="fcp-col">' + names.map(function (n) {
      var path = parents.concat([n]), key = path.join('/');
      return '<div class="fcp-n' + (n === active ? ' on' : '') + (key === selKey ? ' sel' : '')
        + '" data-lv="' + level + '" data-nm="' + n + '">'
        + '<input type="checkbox"' + (key === selKey ? ' checked' : '') + '>'
        + '<span>' + n + '</span>'
        + (casNames(path).length ? '<span class="fcp-arrow">›</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function renderCas(el) {
    var drill = el._drill || [], sel = el._selPath || [];
    var html = casColHtml(el, 0, Object.keys(REGION_TREE));
    for (var k = 0; k < drill.length; k++) {
      var names = casNames(drill.slice(0, k + 1));
      if (!names.length) break;
      html += casColHtml(el, k + 1, names);
    }
    el.querySelector('.fcp-panel').innerHTML = html;
    setText(el, sel.length ? sel.join(' / ') : '请选择', sel.length > 0);
    writeVal(el, sel.length ? sel[sel.length - 1] : '');
    positionCas(el);
  }
  /* 级联列数增加后面板变宽，可能被内容容器 overflow 裁掉，按需整体左移 */
  function positionCas(el) {
    if (!el.classList.contains('open')) return;
    var panel = el.querySelector('.fcp-panel');
    var host = el.closest('.content-card,.content,.modal,.modal-body,.filter-panel') || document.documentElement;
    var hr = host.getBoundingClientRect(), br = el.getBoundingClientRect();
    var maxRight = Math.min(hr.right, window.innerWidth) - 8;
    var minLeft = Math.max(hr.left, 0) + 8;
    var left = 0;
    if (br.left + panel.offsetWidth > maxRight) left -= (br.left + panel.offsetWidth - maxRight);
    if (br.left + left < minLeft) left = minLeft - br.left;
    panel.style.left = Math.round(left) + 'px';
  }

  /* ---------------- 管辖网格：树形 ---------------- */
  function treeRowHtml(el, name, depth, hasKids, expanded) {
    var sel = el._selT || [];
    return '<div class="fcp-n" style="padding-left:' + (6 + depth * 18) + 'px" data-nm="' + name
      + '" data-kids="' + (hasKids ? 1 : 0) + '">'
      + '<span class="fcp-tgl">' + (hasKids ? (expanded ? '▾' : '▸') : '') + '</span>'
      + '<input type="checkbox"' + (sel.indexOf(name) !== -1 ? ' checked' : '') + '>'
      + '<span>' + name + '</span></div>';
  }
  /* 树节点名：默认 GRID_TREE 的子节点是字符串，data-tree 经 treeOf() 归一为 {name} 对象，两种都要兼容 */
  function nodeName(n) { return (typeof n === 'string') ? n : (n && n.name); }
  function renderTree(el) {
    var open = el._openT || {}, html = '';
    treeOf(el).forEach(function (n1) {
      var n1n = nodeName(n1), kids1 = !!(n1.children && n1.children.length);
      html += treeRowHtml(el, n1n, 0, kids1, !!open[n1n]);
      if (!kids1 || !open[n1n]) return;
      n1.children.forEach(function (n2) {
        /* 第 2/3 层是否有下级决定展开三角，避免叶子节点出现无效三角 */
        var n2n = nodeName(n2), kids2 = !!(n2.children && n2.children.length);
        html += treeRowHtml(el, n2n, 1, kids2, !!open[n2n]);
        if (!kids2 || !open[n2n]) return;
        n2.children.forEach(function (n3) {
          var n3n = nodeName(n3), kids3 = !!(n3.children && n3.children.length);
          html += treeRowHtml(el, n3n, 2, kids3, !!open[n3n]);
          if (!kids3 || !open[n3n]) return;
          n3.children.forEach(function (n4) { html += treeRowHtml(el, nodeName(n4), 3, false, false); });
        });
      });
    });
    el.querySelector('.fcp-panel').innerHTML = html;
    var sel = el._selT || [];
    setText(el, sel.length ? '已选择（' + sel.length + '）' : '请选择', sel.length > 0);
    writeVal(el, sel.join(','));
  }

  /* ---------------- 初始化 ---------------- */
  /* 劫持隐藏域 value，使页面脚本 $('fOrg').value='' 时视图同步回「请选择」 */
  function hookVal(el, sync) {
    var inp = el.querySelector('.fcp-val');
    if (!inp || inp.__fcpHooked) return;
    inp.__fcpHooked = true;
    var v = inp.value || '', internal = false;
    el.__rawSet = function (nv) { internal = true; inp.value = nv; v = nv == null ? '' : String(nv); internal = false; };
    try {
      Object.defineProperty(inp, 'value', {
        configurable: true,
        get: function () { return v; },
        set: function (nv) { v = nv == null ? '' : String(nv); if (!internal) sync(v); }
      });
    } catch (e) { }
  }
  function initEl(el) {
    var kind = el.getAttribute('data-fcp');
    /* 可选：框右侧显示下拉箭头 */
    if (el.hasAttribute('data-caret') && !el.querySelector('.fcp-caret')) {
      el.querySelector('.fcp-box').insertAdjacentHTML('beforeend', '<span class="fcp-caret"></span>');
    }
    if (kind === 'ms' || kind === 'mst') {
      el._sel = [];
      if (kind === 'ms') {
        renderMs(el);
        hookVal(el, function (v) { el._sel = v ? v.split(',') : []; renderMs(el); });
      } else {
        renderMst(el);
        hookVal(el, function (v) { el._sel = v ? v.split(',') : []; renderMst(el); });
      }
    } else if (kind === 'cas') {
      el._drill = []; el._selPath = [];
      renderCas(el);
      hookVal(el, function (v) { el._drill = []; el._selPath = v ? [v] : []; renderCas(el); });
    } else if (kind === 'tree') {
      /* 默认展开根节点与其第一个子节点（与「居民档案列表」观感一致） */
      var t = treeOf(el); el._openT = {};
      if (t[0]) {
        el._openT[t[0].name] = true;
        if (t[0].children && t[0].children[0]) el._openT[t[0].children[0].name] = true;
      }
      el._selT = [];
      renderTree(el);
      hookVal(el, function (v) { el._selT = v ? v.split(',') : []; renderTree(el); });
    }
  }
  function initAll() { all('[data-fcp]').forEach(initEl); }
  window.fcpInit = initAll;

  /* ---------------- 事件委托 ---------------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var clear = t.closest('.fcp-clear');
    if (clear) {
      e.preventDefault();
      var hi = clear.closest('[data-fcp]');
      if (hi) {
        var kd = hi.getAttribute('data-fcp');
        if (kd === 'ms') { hi._sel = []; renderMs(hi); }
        else if (kd === 'mst') { hi._sel = []; renderMst(hi); }
        else if (kd === 'cas') { hi._drill = []; hi._selPath = []; renderCas(hi); }
        else { hi._selT = []; renderTree(hi); }
      }
      return;
    }
    /* 随访类型：多选项无复选框，点击整行切换选中（右侧显示对勾） */
    var tickOpt = t.closest('.fcp-opt.tick');
    if (tickOpt) {
      var tickHost = tickOpt.closest('[data-fcp]');
      if (tickHost) {
        var tv = tickOpt.getAttribute('data-v'), ti = tickHost._sel.indexOf(tv);
        if (ti === -1) tickHost._sel.push(tv); else tickHost._sel.splice(ti, 1);
        renderMst(tickHost);
      }
      return;
    }
    var box = t.closest('.fcp-box');
    if (box) {
      var el = box.closest('[data-fcp]');
      if (!el) return;
      var was = el.classList.contains('open');
      closeAll(el);
      el.classList.toggle('open', !was);
      if (!was && el.getAttribute('data-fcp') === 'cas') positionCas(el);
      return;
    }
    var node = t.closest('.fcp-n');
    if (node) {
      var host = node.closest('[data-fcp]');
      if (!host) return;
      var name = node.getAttribute('data-nm'), lv = parseInt(node.getAttribute('data-lv'), 10);
      if (host.getAttribute('data-fcp') === 'cas') {
        var path = (host._drill || []).slice(0, lv).concat([name]);
        if (casNames(path).length) host._drill = path;   /* 有下级：仅下钻 */
        else host._selPath = path;                        /* 末级：选中 */
        renderCas(host);
      } else {
        if (node.getAttribute('data-kids') === '1') host._openT[name] = !host._openT[name];
        else {
          var i = host._selT.indexOf(name);
          if (i === -1) host._selT.push(name); else host._selT.splice(i, 1);
        }
        renderTree(host);
      }
      return;
    }
    if (t.closest('.fcp-panel')) return;      /* 面板内其它点击不关闭 */
    if (t.closest('[data-fcp]')) return;
    closeAll(null);
  });

  /* 多选项勾选（label 内 checkbox） */
  document.addEventListener('change', function (e) {
    var inp = e.target;
    if (!inp || inp.tagName !== 'INPUT' || inp.type !== 'checkbox') return;
    var opt = inp.closest('.fcp-opt');
    if (!opt) return;
    var host = opt.closest('[data-fcp]');
    if (!host) return;
    var v = inp.value, i = host._sel.indexOf(v);
    if (inp.checked) { if (i === -1) host._sel.push(v); }
    else if (i !== -1) host._sel.splice(i, 1);
    if (host.getAttribute('data-fcp') === 'mst') renderMst(host); else renderMs(host);
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(null); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
