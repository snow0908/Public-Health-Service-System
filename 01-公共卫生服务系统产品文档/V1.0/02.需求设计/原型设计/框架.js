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
        { key: 'archive-migration',      label: '档案迁移' },
        { key: 'migration-review',       label: '迁移审核' },
        { key: 'archive-recovery',       label: '档案恢复' },
        { key: 'archive-access-records', label: '档案查阅记录' },
        { key: 'health-checkup',         label: '健康体检' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'chronic', label: '慢病管理',
      icon: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
      children: [
        { key: 'hypertension-management',   label: '高血压管理', url: '高血压管理.html' },
        { key: 'diabetes-management',       label: '糖尿病管理' },
        { key: 'copd-management',           label: '慢阻肺管理' },
        { key: 'hyperlipidemia-management', label: '高血脂管理' },
        { key: 'cardio-cerebro-management', label: '心脑血管管理' },
        { key: 'tumor-management',          label: '肿瘤管理' },
        { key: 'highrisk-management',       label: '高危人群管理' },
        { key: 'tcm-management',            label: '中医管理' },
        { key: 'elderly-management',        label: '老年人管理' },
        { key: 'psychosis-management',      label: '重精管理' },
        { key: 'tuberculosis-management',   label: '结核病管理' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'log', label: '日志管理',
      icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
      children: [
        { key: 'access-log', label: '访问日志' },
        { key: 'info-log',   label: '基本信息调阅日志' },
        { key: 'emr-log',    label: '电子病历调阅日志' },
        { key: 'hr-log',     label: '健康档案调阅日志' }
      ] },
    { type: 'divider' },
    { type: 'group', key: 'panorama', label: '全景配置',
      icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
      children: [
        { key: 'template',  label: '模板管理' },
        { key: 'scene',     label: '场景配置' },   // 页面文件就位后补回 url: '场景配置.html'
        { key: 'module',    label: '模块配置' },
        { key: 'view-list', label: '概况视图配置' }  // 页面文件就位后补回 url: '视图管理/视图列表.html'
      ] },
    { type: 'divider' },
    { type: 'group', key: 'system', label: '系统管理',
      icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
      children: [
        { key: 'common',    label: '通用设置' },
        { key: 'tuomin',    label: '脱敏设置',     url: '脱敏规则.html' },
        { key: 'watermark', label: '水印管理' },
        { key: 'msgpush',   label: '消息推送设置' }
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
      var expanded = isGroup && children.some(function (c) { return c.key === pageKey; });
      html += '<div class="menu-item' + (expanded ? ' expanded' : '') + '" data-key="' + it.key + '" onclick="' +
        (isGroup ? 'toggleMenu(this)' : "navigate('" + it.key + "')") + '">' +
        '<span class="menu-icon"><svg viewBox="0 0 24 24">' + it.icon + '</svg></span>' +
        '<span class="menu-label">' + it.label + '</span>' +
        (isGroup ? '<svg class="arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>' : '') +
        '</div>';
      if (isGroup) {
        html += '<div class="menu-sub' + (expanded ? ' open' : '') + '">' + children.map(function (c) {
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
      }
    }
    return null;
  }

  window.toggleMenu = function (el) {
    el.classList.toggle('expanded');
    var sub = el.nextElementSibling;
    if (sub) sub.classList.toggle('open');
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
  // 菜单高亮：壳子切换标签页时同步左侧菜单选中态（并展开所属分组）
  window.setMenuActive = function (key) {
    var subs = document.querySelectorAll('.menu-sub .sub-item');
    for (var i = 0; i < subs.length; i++) {
      subs[i].classList.toggle('active', subs[i].getAttribute('data-key') === key);
    }
    var gk = findGroupKeyOf(key);
    if (gk) {
      var mi = document.querySelector('.menu-item[data-key="' + gk + '"]');
      if (mi) {
        mi.classList.add('expanded');
        var sub = mi.nextElementSibling;
        if (sub) sub.classList.add('open');
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
