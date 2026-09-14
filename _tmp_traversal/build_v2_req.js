// 生成《公共卫生服务系统 · 系统功能需求清单 V2（1.0 规范补齐与平战结合版）》HTML
const fs = require('fs');
const path = require('path');
const D = require('./v2_req_data.js');
const { META, MODULES, SYS_REQS, OUT_OF_SCOPE, MILESTONES, GATES, REDLINE, BUILD_TYPES } = D;

const OUT = path.resolve(__dirname, '../01-公共卫生服务系统产品文档/V1.0/02.需求设计/系统功能需求清单V2.html');
const FR_DOC = '功能需求清单.html';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// FR 引用渲染：FR-04-01 → 链接到竞品清单锚点；范围引用（~）拆两端；"—" 无引用
function frLink(ref) {
  if (!ref || ref === '—') return '<span class="fr-none">—</span>';
  return ref.split('/').map(seg => {
    const t = seg.trim();
    const m = t.match(/^FR-\d{2}-\d{2}$/);
    if (m) return `<a class="fr-code" href="${FR_DOC}#${esc(t)}" title="跳转竞品功能需求清单 · ${esc(t)}" target="_blank">${esc(t)}</a>`;
    return `<span class="fr-code fr-range">${esc(t)}</span>`;
  }).join('<span class="fr-sep">/</span>');
}

const priBadge = p => ({ P0: 'pri-0', P1: 'pri-1', P2: 'pri-2' }[p] || 'pri-1');
const buildBadge = b => `<span class="badge build-${b}">${BUILD_TYPES[b].label}</span>`;
const tierBadge = (t, note) => `<span class="badge tier">${esc(t)}</span>${note ? `<span class="tier-note">${esc(note)}</span>` : ''}`;

// ---------- 统计 ----------
const stats = { total: 0, pri: { P0: 0, P1: 0, P2: 0 }, build: { reuse: 0, adapt: 0, new: 0 }, tierAll: 0, tierAB: 0, tierABC: 0 };
MODULES.forEach(m => m.items.forEach(it => {
  stats.total++; stats.pri[m.pri]++; stats.build[it.build]++;
}));
MODULES.forEach(m => {
  if (m.tier.includes('A/B/C')) stats.tierABC++; else if (m.tier.includes('B')) stats.tierAB++; else stats.tierAll++;
});
const frUsed = new Set();
MODULES.forEach(m => m.items.forEach(it => (it.frRef.match(/FR-\d{2}-\d{2}/g) || []).forEach(f => frUsed.add(f))));

// ---------- 章节 ----------
const tocChapters = [
  { id: 'sec-basis', name: '一、编制依据与范围声明' },
  { id: 'sec-overview', name: '二、范围总览' },
  { id: 'sec-reuse', name: '三、竞品复用策略' },
  { id: 'sec-modules', name: '四、模块功能需求明细（17 模块 · 70 项）' },
  { id: 'sec-sys', name: '五、系统级需求' },
  { id: 'sec-out', name: '六、范围外说明' },
  { id: 'sec-milestones', name: '七、里程碑映射' },
  { id: 'sec-gates', name: '八、风险门与红线项' },
  { id: 'sec-index', name: '附录：功能项编号索引' },
];

// ---------- 模块明细 ----------
function itemCard(it, mod) {
  return `
      <div class="req-item" id="${it.id}">
        <div class="req-head">
          <span class="req-id mono">${it.id}</span>
          <span class="req-name">${esc(it.name)}</span>
          <span class="badge ${priBadge(mod.pri)}">${mod.pri}</span>
          ${buildBadge(it.build)}
        </div>
        <div class="req-meta">
          <span class="meta-k">档位</span>${tierBadge(it.tierNote ? m2Tier(mod, it) : mod.tier, it.tierNote)}
          <span class="meta-k">竞品参考</span>${frLink(it.frRef)}
          <span class="meta-k">业务流程</span><span class="flow-ref">${esc(it.flow)}</span>
        </div>
        <p class="req-desc">${esc(it.desc)}</p>
        <div class="req-accept"><span class="acc-k">验收标准</span>${esc(it.accept)}</div>
        ${it.note ? `<div class="req-note"><span class="note-k">风险提示</span>${esc(it.note)}</div>` : ''}
      </div>`;
}
function m2Tier(mod, it) { return it.tierNote ? mod.tier : mod.tier; }

function moduleSection(m, idx) {
  const no = String(idx + 1).padStart(2, '0');
  const newN = m.items.filter(i => i.build === 'new').length;
  const reuseN = m.items.filter(i => i.build === 'reuse').length;
  const adaptN = m.items.filter(i => i.build === 'adapt').length;
  return `
  <section class="mod-sec" id="mod-${no}">
    <div class="mod-head">
      <div class="mod-title">
        <span class="mod-no mono">${m.id}</span>
        <h3>${esc(m.name)}</h3>
        <span class="badge ${priBadge(m.pri)}">${m.pri}</span>
        <span class="badge tier">${esc(m.tier)}</span>
      </div>
      <div class="mod-stat mono">${m.items.length} 项 · <span class="c-green">复用 ${reuseN}</span> / <span class="c-blue">改造 ${adaptN}</span> / <span class="c-orange">新建 ${newN}</span></div>
    </div>
    <div class="mod-info">
      <div><span class="info-k">版本范围</span>${esc(m.scope)}</div>
      <div><span class="info-k">版本目标</span>${esc(m.goal)}</div>
      <div><span class="info-k">流程闭环</span><span class="flow-ref">${esc(m.flow)}</span>　<span class="info-k">竞品基础</span>${frLink(m.frBase)}</div>
    </div>
    <div class="mod-items">
${m.items.map(it => itemCard(it, m)).join('\n')}
    </div>
  </section>`;
}

// ---------- 范围总览矩阵 ----------
function overviewMatrix() {
  const rows = MODULES.map((m, i) => {
    const no = String(i + 1).padStart(2, '0');
    const b = m.items.reduce((a, it) => { a[it.build]++; return a; }, { reuse: 0, adapt: 0, new: 0 });
    return `<tr>
      <td class="mono"><a href="#mod-${no}">${m.id}</a></td>
      <td><a href="#mod-${no}">${esc(m.name)}</a></td>
      <td class="arch-desc">${esc(m.scope)}</td>
      <td class="center"><span class="badge ${priBadge(m.pri)}">${m.pri}</span></td>
      <td class="center">${esc(m.tier)}</td>
      <td class="center mono">${m.items.length}</td>
      <td class="center mono c-green">${b.reuse}</td>
      <td class="center mono c-blue">${b.adapt}</td>
      <td class="center mono c-orange">${b.new}</td>
      <td class="center flow-ref">${esc(m.flow.split('·')[0].trim())}</td>
    </tr>`;
  }).join('\n');
  return `<table>
  <caption>17 模块范围矩阵（范围与优先级 / 档位口径严格对齐产品路线图 V1.5「2.2 范围」表）</caption>
  <thead><tr><th>编号</th><th>模块</th><th>版本范围（路线图 1.0）</th><th>优先级</th><th>档位</th><th>功能项</th><th>复用</th><th>改造</th><th>新建</th><th>业务域</th></tr></thead>
  <tbody>
${rows}
  </tbody>
  <tfoot><tr><th colspan="5">合计（17 模块）</th><th>${stats.total}</th><th class="c-green">${stats.build.reuse}</th><th class="c-blue">${stats.build.adapt}</th><th class="c-orange">${stats.build.new}</th><th></th></tr></tfoot>
</table>`;
}

// ---------- 复用策略 ----------
function reuseSection() {
  const frByModule = {};
  MODULES.forEach(m => m.items.forEach(it => {
    (it.frRef.match(/FR-\d{2}-\d{2}/g) || []).forEach(f => {
      const pref = f.slice(0, 5);
      (frByModule[pref] = frByModule[pref] || { items: [], mods: new Set(), kinds: new Set() });
      frByModule[pref].items.push({ fr: f, mod: m.id + ' ' + m.name, kind: it.build, req: it.id, reqName: it.name });
      frByModule[pref].mods.add(m.name); frByModule[pref].kinds.add(it.build);
    });
  }));
  const v2 = require('./build_report_v2_data.js');
  const modName = {}; v2.MODULES.forEach(m => { if (m.id) modName[m.id] = m.name; });
  const rows = Object.keys(frByModule).sort().map(k => {
    const g = frByModule[k];
    const kinds = [...g.kinds].map(x => `<span class="badge build-${x}">${BUILD_TYPES[x].label}</span>`).join(' ');
    const frs = [...new Set(g.items.map(i => i.fr))].sort();
    return `<tr>
      <td class="mono">${k}</td><td>${esc(modName[k] || '')}</td>
      <td class="mono fr-cell">${frs.map(f => `<a class="fr-code" href="${FR_DOC}#${f}" target="_blank">${f}</a>`).join(' ')}</td>
      <td>${kinds}</td>
      <td class="arch-desc">${[...g.mods].join('、')}</td>
    </tr>`;
  }).join('\n');
  return `
<table>
  <caption>竞品 FR 引用全景：${frUsed.size} / 86 个竞品功能菜单被 1.0 范围引用（点击编号跳转《功能需求清单 V2.0（字段级明细版）》对应明细）</caption>
  <thead><tr><th>竞品模块</th><th>模块名</th><th>被引用的功能菜单（FR）</th><th>复用方式</th><th>进入本清单的模块</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table>
<div class="callout">
  <div class="callout-t">复用口径说明</div>
  <p><b>复用竞品（${stats.build.reuse} 项）</b>：直接按字段级明细复刻竞品成熟形态——这批功能是"规范补齐"的主体，竞品已按国家规范实现到位，重点是把字段、页签、量表、操作项原样承接（含 558 项查询条件、988 项列表字段、118 个业务表单、2030 项表单字段、371 项页签字段中对应部分）。</p>
  <p><b>参照改造（${stats.build.adapt} 项）</b>：复刻竞品基础形态 + 按路线图 1.0 目标增强，典型如居民建档（+EMPI 绑定）、计免管理（+预检核验留观全流程）、服务计划（+自动生成引擎）、大屏（→驾驶舱）。</p>
  <p><b>全新建设（${stats.build.new} 项）</b>：竞品无对应能力的路线图新增项——平战结合（驾驶舱 / 突发公卫 / 平战切换）、电子预防接种证、多病原监测、红黄绿分级、法定时限直报、档案开放授权、质控闭环、平台接入等，占功能项 ${Math.round(stats.build.new / stats.total * 100)}%，是 1.0 投入（42 人月）的主要去向。</p>
</div>`;
}

// ---------- 里程碑 ----------
function milestoneSection() {
  const m3Mods = ['V2-01', 'V2-02', 'V2-03', 'V2-04', 'V2-05', 'V2-06', 'V2-08', 'V2-09', 'V2-14', 'V2-15'];
  const rows = MODULES.map((m, i) => {
    const no = String(i + 1).padStart(2, '0');
    const cell = (on, label) => on ? `<td class="center ms-on">${label || '✓'}</td>` : `<td class="center ms-off">·</td>`;
    const m3 = m3Mods.includes(m.id);
    return `<tr><td class="mono"><a href="#mod-${no}">${m.id}</a></td><td>${esc(m.name)}</td>${cell(true, '基线')}${cell(true, '原型')}${m3 ? cell(true, '<b>核心</b>') : cell(true, '并行开发')}${cell(true, '集成')}${cell(true, '发布')}</tr>`;
  }).join('\n');
  return `
<table>
  <caption>里程碑总表（路线图 V1.5「2.3 里程碑」）</caption>
  <thead><tr><th>节点</th><th>时间</th><th>交付物</th><th>判据</th><th>责任角色</th><th>涉及模块</th></tr></thead>
  <tbody>
${MILESTONES.map(m => `<tr><td class="mono"><b>${m.id}</b> ${esc(m.name)}</td><td class="mono">${m.date}</td><td class="arch-desc">${esc(m.deliver)}</td><td class="arch-desc">${esc(m.judge)}</td><td>${esc(m.role)}</td><td class="arch-desc">${esc(m.mods)}</td></tr>`).join('\n')}
  </tbody>
</table>
<table>
  <caption>模块 × 里程碑映射（M3 判据聚焦核心模块：档案 / 家庭档案 / 重点人群 / 接种 / 传染病 / 任务 / 报表 / 驾驶舱与应急）</caption>
  <thead><tr><th>编号</th><th>模块</th><th>M1 基线冻结<br>09-20</th><th>M2 原型评审<br>10-15</th><th>M3 核心开发<br>11-15</th><th>M4 验证演练<br>11-30</th><th>M5 内部发布<br>12-01</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table>`;
}

// ---------- 索引 ----------
function indexSection() {
  return `<table class="idx-table">
  <caption>70 个功能项编号索引（点击跳转明细）</caption>
  <tbody><tr><td class="idx-td">
${MODULES.map((m, i) => {
    const no = String(i + 1).padStart(2, '0');
    return `<div class="idx-group"><span class="idx-mod"><a href="#mod-${no}">${m.id} ${esc(m.name)}</a></span> ` +
      m.items.map(it => `<a class="idx-item mono" href="#${it.id}" title="${esc(it.name)}">${it.id.slice(6)}</a>`).join('') +
      `</div>`;
  }).join('\n')}
  </td></tr></tbody>
</table>`;
}

// ---------- 组装 ----------
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(META.product)} · ${esc(META.docTitle)}（${esc(META.docSub)}）</title>
<style>
:root {
  --page-bg: #FFFFFF; --page-surface: #F7F9FC; --page-surface-muted: #EFF3F8;
  --page-text: #1B2733; --page-text-secondary: #3E4C59; --page-text-muted: #64748B;
  --page-border: #DDE4EC; --page-brand: #0969DA; --page-brand-hover: #0757B5;
  --page-brand-soft: #EAF2FC; --page-brand-soft-strong: #D8E7F8;
  --success: #389E0D; --success-soft: #F6FFED; --info: #0969DA; --info-soft: #EAF2FC;
  --warning: #D46B08; --warning-soft: #FFF7E6; --danger: #CF1322; --danger-soft: #FFF1F0;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", system-ui, sans-serif; font-size: 14px; line-height: 20px; color: var(--page-text); background: var(--page-bg); }
.mono, .fr-code, .req-id { font-family: "JetBrains Mono", Consolas, "Courier New", monospace; }
a { color: var(--page-brand); text-decoration: none; }
a:hover { color: var(--page-brand-hover); text-decoration: underline; }

.report-intro { background: linear-gradient(135deg, #EAF2FC 0%, #F7F9FC 70%); border-bottom: 1px solid var(--page-border); }
.report-intro__content { max-width: 1080px; margin: 0 auto; padding: 52px 32px 42px; }
.intro-kicker { font-size: 13px; letter-spacing: 2px; color: var(--page-brand); font-weight: 600; margin-bottom: 14px; }
.report-intro h1 { font-size: 32px; line-height: 42px; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px; }
.intro-sub { font-size: 17px; color: var(--page-text-secondary); font-weight: 600; margin-bottom: 16px; }
.intro-summary { max-width: 860px; font-size: 14.5px; line-height: 25px; color: var(--page-text-secondary); margin-bottom: 20px; }
.intro-meta { display: flex; flex-wrap: wrap; gap: 8px 28px; font-size: 13px; color: var(--page-text-muted); }
.intro-meta span::before { content: "◆"; font-size: 8px; margin-right: 6px; color: var(--page-brand); vertical-align: 2px; }

main { max-width: 1080px; margin: 0 auto; padding: 8px 32px 40px; }
section.top-sec { padding: 42px 0 6px; }
h2.sec-title { font-size: 21px; line-height: 30px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
h2.sec-title .sec-no { font-size: 12px; font-weight: 600; color: var(--page-brand); background: var(--page-brand-soft); border: 1px solid var(--page-brand-soft-strong); border-radius: 6px; padding: 2px 8px; letter-spacing: 1px; }
.sec-sub { color: var(--page-text-muted); font-size: 13.5px; margin-bottom: 20px; }

.metric-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 24px; }
.metric-card { background: var(--page-bg); border: 1px solid var(--page-border); border-radius: 12px; padding: 16px 16px; }
.metric-card .m-label { font-size: 12px; color: var(--page-text-muted); margin-bottom: 6px; }
.metric-card .m-value { font-size: 25px; line-height: 30px; font-weight: 700; font-variant-numeric: tabular-nums; }
.metric-card .m-value em { font-style: normal; font-size: 12.5px; font-weight: 400; color: var(--page-text-muted); margin-left: 3px; }
.metric-card .m-note { font-size: 11.5px; color: var(--page-text-muted); margin-top: 5px; line-height: 16px; }

.toc-card { background: var(--page-surface); border: 1px solid var(--page-border); border-radius: 12px; padding: 16px 20px; margin-bottom: 22px; }
.toc-card .toc-title { font-size: 13px; font-weight: 600; color: var(--page-text-secondary); margin-bottom: 8px; }
.toc-card .toc-links { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; }

table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 6px 0 18px; }
caption { caption-side: top; text-align: left; font-size: 12.5px; color: var(--page-text-muted); padding-bottom: 7px; }
th, td { border: 1px solid var(--page-border); padding: 7px 9px; text-align: left; vertical-align: top; line-height: 19px; }
thead th { background: var(--page-surface); font-weight: 600; color: var(--page-text-secondary); white-space: nowrap; }
tbody tr:nth-child(even) { background: #FAFCFE; }
tfoot th { background: var(--page-surface); }
td.center, th.center { text-align: center; }
.arch-desc { color: var(--page-text-secondary); }
.c-green { color: var(--success); } .c-blue { color: var(--info); } .c-orange { color: var(--warning); }
.ms-on { color: var(--page-brand); font-weight: 600; background: var(--page-brand-soft); }
.ms-off { color: #C0C8D2; }
.fr-cell { line-height: 22px; }
.fr-code { display: inline-block; font-size: 12px; color: var(--page-brand); background: var(--page-brand-soft); border-radius: 4px; padding: 0 5px; margin: 1px 2px 1px 0; white-space: nowrap; }
.fr-range { color: var(--page-text-secondary); background: var(--page-surface-muted); }
.fr-none { color: #C0C8D2; }
.fr-sep { color: var(--page-text-muted); margin: 0 2px; }
.flow-ref { font-size: 12px; color: #0E7490; background: #ECFEFF; border: 1px solid #CFFAFE; border-radius: 4px; padding: 0 5px; white-space: nowrap; }

.badge { display: inline-block; font-size: 11.5px; font-weight: 600; border-radius: 10px; padding: 1px 9px; line-height: 17px; white-space: nowrap; }
.pri-0 { background: var(--danger-soft); color: var(--danger); border: 1px solid #FFCCC7; }
.pri-1 { background: var(--warning-soft); color: var(--warning); border: 1px solid #FFD591; }
.pri-2 { background: var(--info-soft); color: var(--info); border: 1px solid #91CAFF; }
.build-reuse { background: var(--success-soft); color: var(--success); border: 1px solid #B7EB8F; }
.build-adapt { background: var(--info-soft); color: var(--info); border: 1px solid #91CAFF; }
.build-new { background: var(--warning-soft); color: var(--warning); border: 1px solid #FFD591; }
.tier { background: var(--page-surface); color: var(--page-text-secondary); border: 1px solid var(--page-border); }
.tier-note { font-size: 11.5px; color: var(--page-text-muted); margin-left: 4px; }

/* 模块区块 */
.mod-sec { border: 1px solid var(--page-border); border-radius: 14px; margin: 0 0 26px; overflow: hidden; background: var(--page-bg); }
.mod-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 15px 20px; background: linear-gradient(90deg, var(--page-brand-soft), #F7FBFF); border-bottom: 1px solid var(--page-border); }
.mod-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mod-no { font-size: 13px; font-weight: 700; color: var(--page-brand); }
.mod-title h3 { font-size: 18px; font-weight: 700; }
.mod-stat { font-size: 12.5px; color: var(--page-text-muted); }
.mod-info { padding: 12px 20px; border-bottom: 1px solid var(--page-border); background: #FBFCFE; display: grid; gap: 5px; font-size: 13px; }
.info-k { display: inline-block; font-size: 11.5px; font-weight: 600; color: var(--page-text-muted); background: var(--page-surface-muted); border-radius: 4px; padding: 0 6px; margin-right: 8px; vertical-align: 1px; }
.mod-items { padding: 14px 16px 6px; display: grid; gap: 12px; background: var(--page-surface); }

.req-item { background: var(--page-bg); border: 1px solid var(--page-border); border-left: 3px solid var(--page-brand); border-radius: 10px; padding: 13px 16px 12px; }
.req-item:target { outline: 2px solid var(--page-brand); outline-offset: 2px; }
.req-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.req-id { font-size: 12.5px; font-weight: 700; color: var(--page-brand); }
.req-name { font-size: 15px; font-weight: 700; }
.req-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 12px; margin-bottom: 9px; padding-bottom: 8px; border-bottom: 1px dashed var(--page-border); }
.meta-k { font-size: 11.5px; font-weight: 600; color: var(--page-text-muted); margin-left: 8px; }
.meta-k:first-child { margin-left: 0; }
.req-desc { font-size: 13.5px; line-height: 22px; color: var(--page-text-secondary); margin-bottom: 9px; }
.req-accept { font-size: 12.5px; line-height: 19px; color: #1D6A2E; background: var(--success-soft); border: 1px solid #D3F3C1; border-radius: 6px; padding: 6px 10px; }
.acc-k { font-weight: 700; margin-right: 8px; }
.req-note { font-size: 12.5px; line-height: 19px; color: #A2610A; background: var(--warning-soft); border: 1px solid #FFE3B3; border-radius: 6px; padding: 6px 10px; margin-top: 7px; }
.note-k { font-weight: 700; margin-right: 8px; }

.callout { background: var(--page-brand-soft); border: 1px solid var(--page-brand-soft-strong); border-radius: 12px; padding: 16px 20px; margin: 8px 0 20px; }
.callout-t { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.callout p { font-size: 13px; line-height: 21px; color: var(--page-text-secondary); margin-bottom: 7px; }
.callout p:last-child { margin-bottom: 0; }

.redline { background: var(--danger-soft); border: 1px solid #FFA39E; border-left: 4px solid var(--danger); border-radius: 12px; padding: 16px 20px; margin: 8px 0 20px; }
.redline-t { font-size: 14.5px; font-weight: 700; color: var(--danger); margin-bottom: 7px; }
.redline p { font-size: 13px; line-height: 21px; color: #7C1D1D; }

.idx-table td.idx-td { padding: 14px 18px; }
.idx-group { margin-bottom: 7px; line-height: 24px; }
.idx-mod { font-weight: 600; margin-right: 8px; }
.idx-item { display: inline-block; font-size: 12px; color: var(--page-brand); background: var(--page-brand-soft); border-radius: 4px; padding: 0 6px; margin: 0 3px 2px 0; }

.doc-foot { border-top: 1px solid var(--page-border); margin-top: 40px; padding: 18px 0 6px; font-size: 12.5px; color: var(--page-text-muted); line-height: 20px; }
@media print { .report-intro { background: none; } .mod-sec { break-inside: avoid-page; } }
@media (max-width: 900px) { .metric-row { grid-template-columns: repeat(3, 1fr); } }
</style>
</head>
<body>

<header class="report-intro">
  <div class="report-intro__content">
    <div class="intro-kicker">FKB-JC-AIAS · 02.需求设计 · 需求基线文档（M1 输入）</div>
    <h1>${esc(META.product)}<br>${esc(META.docTitle)} — ${esc(META.docSub)}</h1>
    <div class="intro-sub">范围口径：产品路线图 V1.5「1.0 · 规范补齐与平战结合版（2026-09 ~ 2026-12）」</div>
    <p class="intro-summary">${esc(META.scope)}</p>
    <div class="intro-meta">
      <span>文档版本 ${META.version}</span><span>编制日期 ${META.date}</span><span>责任部门 ${esc(META.owner)}</span>
      <span>功能项 ${stats.total} 项（P0 ${stats.pri.P0} / P1 ${stats.pri.P1} / P2 ${stats.pri.P2}）</span><span>建设方式 复用 ${stats.build.reuse} / 改造 ${stats.build.adapt} / 新建 ${stats.build.new}</span>
    </div>
  </div>
</header>

<main>

<div class="toc-card">
  <div class="toc-title">目 录</div>
  <div class="toc-links">${tocChapters.map(c => `<a href="#${c.id}">${esc(c.name)}</a>`).join('')}</div>
</div>

<!-- 一、编制依据 -->
<section class="top-sec" id="sec-basis">
  <h2 class="sec-title"><span class="sec-no">01</span>编制依据与范围声明</h2>
  <p class="sec-sub">本清单由三份输入文档交叉整理而成：以产品路线图 1.0 章节定范围与优先级，以竞品功能需求清单定复用基线，以业务流程说明定闭环要求。</p>
  <table>
    <caption>输入文档</caption>
    <thead><tr><th style="width:240px">文档</th><th>对本清单的作用</th></tr></thead>
    <tbody>
${META.sources.map(s => `<tr><td>${esc(s.name)}</td><td class="arch-desc">${esc(s.ref)}</td></tr>`).join('\n')}
    </tbody>
  </table>
  <table>
    <caption>规范依据（红线与指标来源）</caption>
    <tbody>
${META.norms.map(n => `<tr><td>${esc(n)}</td></tr>`).join('\n')}
    </tbody>
  </table>
  <div class="callout">
    <div class="callout-t">阅读约定</div>
    <p><b>功能项编号</b>：V2-{模块 2 位}-{功能项 2 位}（如 V2-06-02 = 模块 06 传染病第 2 项），与竞品 FR 编号（FR-xx-yy）一一对应关系见各项"竞品参考"列，点击可跳转《功能需求清单 V2.0（字段级明细版）》。</p>
    <p><b>优先级</b>：${'<span class="badge pri-0">P0</span>'} 合规必做（${stats.pri.P0} 项）｜${'<span class="badge pri-1">P1</span>'} 重要（${stats.pri.P1} 项）｜${'<span class="badge pri-2">P2</span>'} 可裁剪（${stats.pri.P2} 项，G7 风险下优先顺延）。</p>
    <p><b>档位</b>：A 档（中心卫生院 / 县级）· B 档（普通乡镇）· C 档（村卫生室，1.0 以 B 档简化权限临时承载）；个别功能项的三档细化口径在条目内注明。</p>
    <p><b>建设方式</b>：${buildBadge('reuse')} ${esc(BUILD_TYPES.reuse.desc)}；${buildBadge('adapt')} ${esc(BUILD_TYPES.adapt.desc)}；${buildBadge('new')} ${esc(BUILD_TYPES.new.desc)}。</p>
    <p><b>发布口径</b>：本清单所有"上线 / 发布"均指<b>公司内部发布</b>（内部验证与演示环境部署、发布评审与版本归档），客户现场试点与实施另行排期（全产品线统一口径，路线图 V1.5）。</p>
  </div>
</section>

<!-- 二、范围总览 -->
<section class="top-sec" id="sec-overview">
  <h2 class="sec-title"><span class="sec-no">02</span>范围总览</h2>
  <p class="sec-sub">17 个模块 · ${stats.total} 个功能项，覆盖路线图 1.0 全部范围行（含原 3.0 平战结合内容提前项：公卫驾驶舱、突发公卫事件、预测预警、满意度调查）。</p>
  <div class="metric-row">
    <div class="metric-card"><div class="m-label">模块</div><div class="m-value">${MODULES.length}<em>个</em></div><div class="m-note">路线图 2.2 范围表全项承载</div></div>
    <div class="metric-card"><div class="m-label">功能项</div><div class="m-value">${stats.total}<em>项</em></div><div class="m-note">P0 ${stats.pri.P0} / P1 ${stats.pri.P1} / P2 ${stats.pri.P2}</div></div>
    <div class="metric-card"><div class="m-label">复用竞品</div><div class="m-value c-green">${stats.build.reuse}<em>项</em></div><div class="m-note">按字段级明细直接复刻</div></div>
    <div class="metric-card"><div class="m-label">参照改造</div><div class="m-value c-blue">${stats.build.adapt}<em>项</em></div><div class="m-note">复刻基础 + 1.0 目标增强</div></div>
    <div class="metric-card"><div class="m-label">全新建设</div><div class="m-value c-orange">${stats.build.new}<em>项</em></div><div class="m-note">占 ${Math.round(stats.build.new / stats.total * 100)}%，平战结合等新增项</div></div>
    <div class="metric-card"><div class="m-label">竞品 FR 引用</div><div class="m-value">${frUsed.size}<em>/ 86</em></div><div class="m-note">跨文档可跳转明细</div></div>
  </div>
  ${overviewMatrix()}
</section>

<!-- 三、复用策略 -->
<section class="top-sec" id="sec-reuse">
  <h2 class="sec-title"><span class="sec-no">03</span>竞品复用策略</h2>
  <p class="sec-sub">"同竞品一样的系统"的落地路径：先复刻竞品规范项底盘（复用 + 改造 ${stats.build.reuse + stats.build.adapt} 项，${Math.round((stats.build.reuse + stats.build.adapt) / stats.total * 100)}%），再叠加路线图 1.0 新增能力（新建 ${stats.build.new} 项）。</p>
  ${reuseSection()}
</section>

<!-- 四、模块明细 -->
<section class="top-sec" id="sec-modules">
  <h2 class="sec-title"><span class="sec-no">04</span>模块功能需求明细</h2>
  <p class="sec-sub">每个功能项含：功能描述、优先级、档位、建设方式、竞品 FR 参考（可跳转字段级明细）、业务流程关联、验收标准（含 1.0 关键指标）。</p>
  <div class="toc-card">
    <div class="toc-title">模块导航</div>
    <div class="toc-links">${MODULES.map((m, i) => `<a href="#mod-${String(i + 1).padStart(2, '0')}">${m.id} ${esc(m.name)}</a>`).join('')}</div>
  </div>
${MODULES.map((m, i) => moduleSection(m, i)).join('\n')}
</section>

<!-- 五、系统级需求 -->
<section class="top-sec" id="sec-sys">
  <h2 class="sec-title"><span class="sec-no">05</span>系统级需求</h2>
  <p class="sec-sub">跨模块的非功能性需求与基础支撑能力，编号 SR-01 ~ SR-10。</p>
  <table>
    <caption>系统级需求（SR）</caption>
    <thead><tr><th style="width:66px">编号</th><th style="width:190px">名称</th><th>需求描述</th><th style="width:260px">验收标准</th><th style="width:150px">竞品参考</th></tr></thead>
    <tbody>
${SYS_REQS.map(r => `<tr id="${r.id}"><td class="mono"><b>${r.id}</b></td><td>${esc(r.name)}</td><td class="arch-desc">${esc(r.desc)}</td><td>${esc(r.accept)}</td><td>${frLink(r.frRef)}</td></tr>`).join('\n')}
    </tbody>
  </table>
</section>

<!-- 六、范围外 -->
<section class="top-sec" id="sec-out">
  <h2 class="sec-title"><span class="sec-no">06</span>范围外说明</h2>
  <p class="sec-sub">以下内容<b>明确不在 1.0 范围内</b>（避免范围蔓延），承接版本见路线图 1.1（AI 减负版）/ 1.2（医防融合版）。</p>
  <table>
    <caption>范围外事项</caption>
    <thead><tr><th style="width:420px">事项</th><th style="width:90px">承接版本</th><th>排除原因</th></tr></thead>
    <tbody>
${OUT_OF_SCOPE.map(o => `<tr><td>${esc(o.item)}</td><td class="center"><span class="badge pri-1">${esc(o.to)}</span></td><td class="arch-desc">${esc(o.reason)}</td></tr>`).join('\n')}
    </tbody>
  </table>
</section>

<!-- 七、里程碑 -->
<section class="top-sec" id="sec-milestones">
  <h2 class="sec-title"><span class="sec-no">07</span>里程碑映射</h2>
  <p class="sec-sub">本清单功能项与路线图 M1 ~ M5 里程碑的对应关系（M1 2026-09-20 需求基线冻结，本清单即 M1 输入）。</p>
  ${milestoneSection()}
</section>

<!-- 八、风险门 -->
<section class="top-sec" id="sec-gates">
  <h2 class="sec-title"><span class="sec-no">08</span>风险门与红线项</h2>
  <p class="sec-sub">影响 1.0 范围交付的风险门（路线图第 8 节）；任何风险门不通过时优先保合规项（P0）与 A 档交付。</p>
  <table>
    <caption>风险门</caption>
    <thead><tr><th style="width:180px">风险门</th><th style="width:80px">时点</th><th>判断标准</th><th>不通过时的降级方案</th><th style="width:170px">影响范围</th></tr></thead>
    <tbody>
${GATES.map(g => `<tr><td><b>${g.id}</b> ${esc(g.name)}</td><td class="mono">${esc(g.date)}</td><td class="arch-desc">${esc(g.judge)}</td><td class="arch-desc">${esc(g.fallback)}</td><td class="mono">${esc(g.affects)}</td></tr>`).join('\n')}
    </tbody>
  </table>
  <div class="redline">
    <div class="redline-t">⛔ ${esc(REDLINE.title)}</div>
    <p>${esc(REDLINE.desc)}</p>
  </div>
</section>

<!-- 附录：索引 -->
<section class="top-sec" id="sec-index">
  <h2 class="sec-title"><span class="sec-no">09</span>附录 · 功能项编号索引</h2>
  <p class="sec-sub">70 个功能项快速跳转索引。</p>
  ${indexSection()}
</section>

<div class="doc-foot">
  <p><b>${esc(META.product)} · ${esc(META.docTitle)}（${esc(META.docSub)}）</b>｜文档版本 ${META.version}｜编制日期 ${META.date}｜责任部门 ${esc(META.owner)}</p>
  <p>输入文档：《03.产品路线图-20260910》（V1.5）｜《公共卫生服务系统功能需求清单 V2.0（字段级明细版）》｜《04.业务流程说明-公共卫生服务系统-20260908》（V1.2）｜归档位置：产品资产 / FKB-JC-AIAS 公共卫生服务系统 / V1.0 / 02.需求设计 /</p>
  <p>维护约定：年度规范调整或路线图修订时，同步复核"规范条目—功能项"映射与范围外清单（责任：产品负责人 + 业务科室）。</p>
</div>

</main>
</body>
</html>`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('written:', OUT, (fs.statSync(OUT).size / 1024).toFixed(1) + ' KB');
console.log('modules:', MODULES.length, 'items:', stats.total, 'sysReqs:', SYS_REQS.length, 'outOfScope:', OUT_OF_SCOPE.length);
