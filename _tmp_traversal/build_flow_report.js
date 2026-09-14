// 业务流程闭环蓝图生成器：SVG闭环流程图（阶段卡+节点FR徽标+闭环回路）+ 业务全景地图 + HTML
const fs = require('fs');
const path = require('path');
const D = require('./build_report_v2_data.js');
const { FLOWS } = require('./flow_data.js');
const { esc } = D;

const DIR = __dirname;
const NORM_DIR = path.join(DIR, '..', '01-公共卫生服务系统产品文档', 'V1.0', '02.需求设计', '规范文档');

// FR码解析：菜单名 -> FR码
const frMap = new Map();
D.entries.forEach(e => { if (!frMap.has(e.name)) frMap.set(e.name, e.code); });
const frCode = (name) => frMap.get(name) || 'FR-??';
let missFr = new Set();
FLOWS.forEach(f => f.phases.forEach(p => p.nodes.forEach(nd => { if (!frMap.has(nd.fr)) missFr.add(f.code + ':' + nd.fr); })));

// ---------- 规范文档库（本地已下载至 02.需求设计/规范文档/）----------
const NORMS = {
  v3: { short: '国家基本公共卫生服务规范（第三版）', label: '国家基本公共卫生服务规范（第三版）· 国卫基层发〔2017〕13号', doc: '国家基本公共卫生服务规范（第三版）·国卫基层发2017-13号.pdf', docNo: '国卫基层发〔2017〕13号', online: 'https://www.nhc.gov.cn/jws/s3578/201703/d20c37e23e1f4c7db7b8e25f34473e1b.shtml', src: '国家卫生健康委官网' },
  familyDoc: { short: '家庭医生签约服务管理指导意见', label: '关于规范家庭医生签约服务管理的指导意见 · 国卫基层发〔2018〕35号', doc: '关于规范家庭医生签约服务管理的指导意见·国卫基层发2018-35号.pdf', docNo: '国卫基层发〔2018〕35号', online: 'https://www.gov.cn/zhengce/zhengceku/2018-12/31/content_5435461.htm', src: '中国政府网（上海市卫健委PDF镜像）' },
  law: { short: '传染病防治法（2025修订）', label: '中华人民共和国传染病防治法（2025年修订）', doc: '中华人民共和国传染病防治法（2025修订全文）·中国人大网.html', docNo: '2025年4月30日修订通过', online: 'http://www.npc.gov.cn/npc/c2/c30834/202504/t20250430_445085.html', src: '中国人大网（人民日报刊发PDF同存）' },
  report37: { short: '疫情监测信息报告管理办法', label: '突发公共卫生事件与传染病疫情监测信息报告管理办法 · 卫生部令第37号', doc: '突发公共卫生事件与传染病疫情监测信息报告管理办法·卫生部令第37号.pdf', docNo: '卫生部令第37号', online: 'http://www.nhc.gov.cn/bgt/pw10305/200710/c9c2e54129c847c88b0136479fe72279.shtml', src: '国家卫生健康委官网' },
  mch: { short: '妇幼卫生调查制度（三网监测）', label: '全国妇幼卫生调查制度（孕产妇死亡/5岁以下儿童死亡/出生缺陷三网监测）', doc: '全国妇幼卫生调查制度（妇幼三网监测）.pdf', docNo: '卫统42-44表系列', online: 'http://www.nhc.gov.cn/wjw/gfxwj/201002/a67ab3c712e1486f8314eb1e566f7867.shtml', src: '全国妇幼卫生监测办公室' },
  cervical: { short: '宫颈癌筛查工作方案', label: '宫颈癌筛查工作方案 · 国卫办妇幼函〔2021〕635号', doc: '宫颈癌筛查工作方案·国卫办妇幼函2021-635号.pdf', docNo: '国卫办妇幼函〔2021〕635号', online: 'https://www.nhc.gov.cn/fys/c100078/202201/e4209b0a6e604f6aba3e793d8eddebf3.shtml', src: '国家卫生健康委官网（妇幼健康司）' },
  breast: { short: '乳腺癌筛查工作方案', label: '乳腺癌筛查工作方案 · 国卫办妇幼函〔2021〕635号', doc: '乳腺癌筛查工作方案·国卫办妇幼函2021-635号.pdf', docNo: '国卫办妇幼函〔2021〕635号', online: 'https://www.nhc.gov.cn/fys/c100078/202201/e4209b0a6e604f6aba3e793d8eddebf3.shtml', src: '国家卫生健康委官网（妇幼健康司）' },
  eMTCT: { short: '消除艾梅乙母婴传播行动计划', label: '消除艾滋病、梅毒和乙肝母婴传播行动计划（2022—2025年）· 国卫妇幼发〔2022〕32号', doc: '消除艾滋病梅毒和乙肝母婴传播行动计划2022-2025·国卫妇幼发2022-32号.html', docNo: '国卫妇幼发〔2022〕32号', online: 'https://www.gov.cn/gongbao/content/2023/content_5741260.htm', src: '中国政府网·国务院公报2023年第4号' },
  stat2025: { short: '公卫项目与家庭医生签约统计调查制度', label: '国家基本公共卫生服务项目和家庭医生签约统计调查制度', doc: '国家基本公共卫生服务项目和家庭医生签约统计调查制度·国家统计局.html', docNo: '国家统计局部门统计调查项目', online: 'https://www.stats.gov.cn/fw/bmdcxmsp/bmzd/202506/t20250605_1960054.html', src: '国家统计局官网' },
  notice2025: { short: '2025年基本公卫服务工作通知', label: '关于做好2025年基本公共卫生服务工作的通知 · 国卫基层发〔2025〕7号', doc: '关于做好2025年基本公共卫生服务工作的通知·国卫基层发2025-7号.html', docNo: '国卫基层发〔2025〕7号', online: 'https://www.nhc.gov.cn/jws/c100073/202506/14a23782324542f59137bbf24a1c988f.shtml', src: '国家卫生健康委官网（基层卫生健康司）' },
};

// 业务域 -> 规范文档映射
const BUS_NORM_LINKS = {
  'BZ-01': ['v3'],
  'BZ-02': ['familyDoc', 'v3'],
  'BZ-03': ['v3', 'notice2025'],
  'BZ-04': ['v3', 'notice2025'],
  'BZ-05': ['v3', 'notice2025'],
  'BZ-06': ['v3', 'notice2025'],
  'BZ-07': ['v3'],
  'BZ-08': ['v3'],
  'BZ-09': ['v3'],
  'BZ-10': ['v3'],
  'BZ-11': ['cervical', 'breast', 'eMTCT'],
  'BZ-12': ['v3'],
  'BZ-13': ['law', 'report37'],
  'BZ-14': ['mch'],
  'BZ-15': ['v3'],
  'BZ-16': ['v3'],
  'BZ-17': ['v3'],
  'BZ-18': ['v3', 'notice2025'],
  'BZ-19': ['stat2025', 'notice2025', 'v3'],
};

// 校验本地规范文档是否已下载
const normMissing = [];
Object.entries(NORMS).forEach(([k, n]) => {
  n.exists = fs.existsSync(path.join(NORM_DIR, n.doc));
  if (!n.exists) normMissing.push(k + ':' + n.doc);
});

const normChips = (f) => (BUS_NORM_LINKS[f.code] || []).map(k => {
  const n = NORMS[k];
  const localHref = n.exists ? encodeURI('规范文档/' + n.doc) : n.online;
  const localTag = n.exists
    ? `<a class="norm-chip" href="${localHref}" target="_blank" title="${esc(n.label)}（打开本地文档）">📄 ${esc(n.short)}</a>`
    : `<a class="norm-chip norm-miss" href="${localHref}" target="_blank" title="${esc(n.label)}">⚠ ${esc(n.short)}（在线版）</a>`;
  return localTag + `<a class="norm-online" href="${n.online}" target="_blank" title="查看官方在线原文：${esc(n.label)}">↗</a>`;
}).join('');

// ---------- 通用SVG工具 ----------
const escSvg = (s) => esc(s);
const COLORS = ['#0B5FAE', '#1366BE', '#1F71CF', '#3580DA', '#5391E3', '#75A5EB', '#93B6F1'];

function flowSvg(flow) {
  const PW = 178, GAP = 26, PAD = 22, NODE_H = 40, NODE_GAP = 6;
  const n = flow.phases.length;
  const maxNodes = Math.max(...flow.phases.map(p => p.nodes.length));
  const cardH = 46 + maxNodes * (NODE_H + NODE_GAP) + 8;
  const W = PAD * 2 + n * PW + (n - 1) * GAP;
  const cardTop = 14;
  const cardBottom = cardTop + cardH;
  const loopY = cardBottom + 44;
  const loopTexts = splitText(flow.loop, 46);
  const H = loopY + 22 + loopTexts.length * 17 + 10;

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escSvg(flow.name)}业务闭环流程图">`;
  s += `<defs><marker id="arw-${flow.code}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7A93AB"/></marker>`;
  s += `<marker id="arwo-${flow.code}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#FF7A45"/></marker></defs>`;

  flow.phases.forEach((p, i) => {
    const x = PAD + i * (PW + GAP);
    // 卡片主体
    s += `<rect x="${x}" y="${cardTop}" width="${PW}" height="${cardH}" rx="10" fill="#FFFFFF" stroke="#D8E4F2" stroke-width="1.2"/>`;
    // 卡头
    s += `<path d="M ${x} ${cardTop + 10} Q ${x} ${cardTop} ${x + 10} ${cardTop} L ${x + PW - 10} ${cardTop} Q ${x + PW} ${cardTop} ${x + PW} ${cardTop + 10} L ${x + PW} ${cardTop + 34} L ${x} ${cardTop + 34} Z" fill="${COLORS[Math.min(i, COLORS.length - 1)]}"/>`;
    s += `<text x="${x + PW / 2}" y="${cardTop + 23}" text-anchor="middle" font-size="14" font-weight="600" fill="#FFFFFF">${escSvg(p.title)}</text>`;
    // 节点
    p.nodes.forEach((nd, j) => {
      const ny = cardTop + 46 + j * (NODE_H + NODE_GAP);
      s += `<rect x="${x + 10}" y="${ny}" width="${PW - 20}" height="${NODE_H}" rx="6" fill="#F4F8FD" stroke="#DCE7F4" stroke-width="1"/>`;
      const nm = nd.n.length > 11 ? nd.n.slice(0, 10) + '…' : nd.n;
      s += `<text x="${x + PW / 2}" y="${ny + 17}" text-anchor="middle" font-size="13" font-weight="500" fill="#1B2733">${escSvg(nm)}</text>`;
      s += `<text x="${x + PW / 2}" y="${ny + 32}" text-anchor="middle" font-size="10.5" font-family="Consolas,monospace" fill="#0969DA">${escSvg(frCode(nd.fr))}</text>`;
    });
    // 阶段间箭头
    if (i < n - 1) {
      const ax = x + PW, ay = cardTop + cardH / 2;
      s += `<line x1="${ax + 3}" y1="${ay}" x2="${ax + GAP - 4}" y2="${ay}" stroke="#7A93AB" stroke-width="1.6" marker-end="url(#arw-${flow.code})"/>`;
    }
  });

  // 底部闭环回路：末阶段底部 → 下 → 左 → 上 → 首阶段底部
  const firstCx = PAD + PW / 2, lastCx = PAD + (n - 1) * (PW + GAP) + PW / 2;
  s += `<path d="M ${lastCx} ${cardBottom + 2} L ${lastCx} ${loopY} L ${firstCx} ${loopY} L ${firstCx} ${cardBottom + 13}" fill="none" stroke="#FF7A45" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#arwo-${flow.code})"/>`;
  const badgeCx = W / 2;
  s += `<circle cx="${badgeCx}" cy="${loopY}" r="13" fill="#FFF3EC" stroke="#FF7A45" stroke-width="1.5"/><text x="${badgeCx}" y="${loopY + 5}" text-anchor="middle" font-size="14" fill="#E05E2B" font-weight="700">↻</text>`;
  loopTexts.forEach((t, i) => {
    s += `<text x="${W / 2}" y="${loopY + 24 + i * 17}" text-anchor="middle" font-size="13" fill="#C2531F" font-weight="500">${escSvg(t)}</text>`;
  });
  s += '</svg>';
  return s;
}

function splitText(t, max) {
  const arr = [];
  let rest = t;
  while (rest.length > max && arr.length < 2) { arr.push(rest.slice(0, max)); rest = rest.slice(max); }
  arr.push(rest);
  return arr;
}

// ---------- 业务全景地图 ----------
function panoramaSvg() {
  const W = 1180;
  let s = `<svg viewBox="0 0 ${W} 836" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="公共卫生服务系统业务全景地图">`;
  s += `<defs><marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7A93AB"/></marker><marker id="po" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#FF7A45"/></marker></defs>`;

  const card = (x, y, w, h, fill, stroke, rx = 10) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
  const txt = (x, y, t, size, fill, weight = '500', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}">${escSvg(t)}</text>`;
  const varrow = (x, y1, y2, label, dash = false) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - 3}" stroke="#7A93AB" stroke-width="1.6" ${dash ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#pa)"/>` + (label ? txt(x + 8, (y1 + y2) / 2 + 4, label, 12, '#64748B', '500', 'start') : '');

  // 第1层：驱动引擎层
  s += txt(30, 30, '驱动层', 13, '#0969DA', '700', 'start');
  s += card(250, 16, 430, 78, '#EAF2FC', '#B7D4F0');
  s += txt(465, 44, '计划提醒引擎（BZ-18）', 15, '#0B5FAE', '700');
  s += txt(465, 64, '服务计划8类 · 档案提醒5类 · 随访/指标参数驱动', 12, '#3E4C59');
  s += txt(465, 80, 'FR-03 服务计划 / FR-03 提醒管理 / FR-05-06·07', 10.5, '#64748B', '400');
  s += card(720, 16, 230, 78, '#EAF2FC', '#B7D4F0');
  s += txt(835, 44, '消息中心', 15, '#0B5FAE', '700');
  s += txt(835, 64, '任务/通知 · 跳转处理', 12, '#3E4C59');
  s += txt(835, 80, 'FR-01 消息', 10.5, '#64748B', '400');

  // 引擎→服务层 驱动箭头（右侧绕行，虚线）
  s += `<path d="M 950 94 L 950 124 L 1165 124 L 1165 458 L 1130 458" fill="none" stroke="#5391E3" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#pa)"/>`;
  s += txt(1050, 118, '计划任务驱动', 12, '#3580DA', '600', 'middle');

  // 第2层：入口层
  s += txt(30, 150, '入口层', 13, '#0969DA', '700', 'start');
  s += card(350, 136, 300, 92, '#F0FDF6', '#BCE3CD');
  s += txt(500, 162, '辖区居民', 16, '#0E7A5F', '700');
  s += txt(500, 183, '常住≥6个月 · 户为单位 · 全生命周期', 12, '#3E4C59');
  s += txt(500, 201, '发现渠道：门诊就诊 / 随访服务 / 报告卡 / 主动筛查', 11, '#64748B', '400');

  s += varrow(500, 228, 288, '建档（查重防重复）');

  // 第3层：档案核心层
  s += txt(30, 310, '档案层', 13, '#0969DA', '700', 'start');
  s += card(240, 296, 300, 96, '#EAF2FC', '#B7D4F0');
  s += txt(390, 322, '居民健康档案 · 患者360视图', 15, '#0B5FAE', '700');
  s += txt(390, 343, '一人一档 · 56字段基本信息 · 18模块汇聚', 12, '#3E4C59');
  s += txt(390, 361, '档案治理：上锁 / 注销 / 查阅审计', 11.5, '#3E4C59');
  s += txt(390, 378, 'FR-04-01', 10.5, '#64748B', '400');
  s += card(580, 296, 170, 96, '#EAF2FC', '#B7D4F0');
  s += txt(665, 330, '家庭档案', 15, '#0B5FAE', '700');
  s += txt(665, 351, '户建档·成员关联', 12, '#3E4C59');
  s += txt(665, 369, '精准扶贫44字段', 11.5, '#3E4C59');
  s += txt(665, 386, 'FR-04-02', 10.5, '#64748B', '400');
  s += card(790, 296, 170, 96, '#EAF2FC', '#B7D4F0');
  s += txt(875, 330, '健康体检档案', 15, '#0B5FAE', '700');
  s += txt(875, 351, '3页87字段体检表', 12, '#3E4C59');
  s += txt(875, 369, '体检登记/管理', 11.5, '#3E4C59');
  s += txt(875, 386, 'FR-04-03·04', 10.5, '#64748B', '400');

  // 档案→服务
  s += varrow(500, 392, 452, '按人群分类进入专项服务');

  // 第4层：服务层（8卡 2行×4列）
  s += txt(30, 474, '服务层', 13, '#0969DA', '700', 'start');
  const svcs = [
    ['高血压管理 BZ-04', '≥4次随访/年 · 35字段', 'FR-13-01'],
    ['糖尿病管理 BZ-05', '≥4次随访/年 · 41字段', 'FR-13-02'],
    ['其他慢病+高危 BZ-06', '5病种 · 高危转化', 'FR-13-03~07'],
    ['孕产妇管理 BZ-09', '建册·产检·访视·42天', 'FR-17-02'],
    ['0-6岁儿童+计免 BZ-10', '8次体检 · 预防接种', 'FR-17-03·04'],
    ['两癌筛查+母婴阻断 BZ-11', '59字段个案 · 三病阻断', 'FR-17-05~09'],
    ['重精+结核管理 BZ-07/08', '44字段随访 · DOTS督导', 'FR-14-01·15-01'],
    ['老年人+中医药 BZ-03/12', '年检 · 33题辨识 · 评估', 'FR-16-01·06-01'],
  ];
  const SW = 254, SH = 64, SX = 56, SY = 460, SGX = 16, SGY = 14;
  svcs.forEach((v, i) => {
    const cx = SX + (i % 4) * (SW + SGX), cy = SY + Math.floor(i / 4) * (SH + SGY);
    s += card(cx, cy, SW, SH, '#FFFFFF', '#C9DCF0');
    s += `<rect x="${cx}" y="${cy}" width="4" height="${SH}" rx="2" fill="${COLORS[i % COLORS.length]}"/>`;
    s += txt(cx + 16, cy + 22, v[0], 13.5, '#1B2733', '600', 'start');
    s += txt(cx + 16, cy + 41, v[1], 11.5, '#3E4C59', '400', 'start');
    s += txt(cx + 16, cy + 56, v[2], 10, '#0969DA', '400', 'start');
  });

  // 服务层→档案层回写（虚线，向上）
  s += `<path d="M 875 460 L 875 400" fill="none" stroke="#0E7A5F" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#pa)"/>`;
  s += txt(886, 436, '服务记录写回360档案', 12, '#0E7A5F', '600', 'start');

  // 服务→出口
  s += varrow(500, 606, 664, '业务数据沉淀');

  // 第5层：出口层
  s += txt(30, 686, '出口层', 13, '#0969DA', '700', 'start');
  const outs = [
    ['业务报表（7张国家报表）', 'FR-19-01~07'],
    ['辖区统计', 'FR-18-01'],
    ['外嵌自助查询（8类）', 'FR-08-02~09'],
    ['工作台 · BI大屏', 'FR-02-01·02'],
  ];
  const OW = 254, OH = 56, OX = 56, OY = 672;
  outs.forEach((v, i) => {
    const cx = OX + i * (OW + SGX);
    s += card(cx, OY, OW, OH, '#FFF8EF', '#F0D9B8');
    s += txt(cx + SW / 2, OY + 24, v[0], 13.5, '#9A6700', '600');
    s += txt(cx + SW / 2, OY + 43, v[1], 10, '#9A6700', '400');
  });

  // 总闭环：出口层右侧 → 右侧大弧 → 引擎层右侧（橙色虚线）
  s += `<path d="M ${OX + 4 * (OW + SGX) - SGX - 4} ${OY + 28} C 1168 ${OY + 28}, 1168 55, 954 55" fill="none" stroke="#FF7A45" stroke-width="2.2" stroke-dasharray="8 5" marker-end="url(#po)"/>`;
  s += `<rect x="952" y="232" width="200" height="64" rx="10" fill="#FFF3EC" stroke="#FF7A45" stroke-width="1.5"/>`;
  s += txt(1052, 256, '数据反馈 · 业务闭环', 14, '#C2531F', '700');
  s += txt(1052, 277, '报表指标 → 催办提醒', 12, '#C2531F', '500');
  s += txt(1052, 292, '→ 参数调优 → 服务再生成', 12, '#C2531F', '500');

  // 支撑底座说明
  s += card(56, 762, 1068, 56, '#F7F9FC', '#DDE4EC');
  s += txt(590, 786, '系统支撑底座：身份证读卡器集成 · 量表引擎（体质辨识33题/自理评估/分层评估）· 表单模板库 · 数据导出/单据打印 · 组织机构与数据权限 · 操作审计', 13, '#3E4C59', '500');
  s += txt(590, 807, '贯穿性业务域：BZ-13 传染病报告 · BZ-14 三网监测 · BZ-15 健康教育 · BZ-16 卫生监督协管 · BZ-17 档案迁移 · BZ-18 计划提醒引擎 · BZ-19 统计上报', 12, '#64748B', '400');

  s += '</svg>';
  return s;
}

// ---------- HTML组装 ----------
const priTag = (p) => '<span class="tag tag-' + p.toLowerCase() + '">' + p + '</span>';

const totalNodes = FLOWS.reduce((s, f) => s + f.phases.reduce((x, p) => x + p.nodes.length, 0), 0);
const totalPhases = FLOWS.reduce((s, f) => s + f.phases.length, 0);
const usedFr = new Set();
FLOWS.forEach(f => f.phases.forEach(p => p.nodes.forEach(nd => usedFr.add(frCode(nd.fr)))));

const flowSections = FLOWS.map(f => {
  const nodeCount = f.phases.reduce((x, p) => x + p.nodes.length, 0);
  const ruleItems = f.rules.map(r => '<li>' + esc(r) + '</li>').join('');
  const riskItems = f.risks.map(r => '<li>' + esc(r) + '</li>').join('');
  const frChips = [...new Set(f.phases.flatMap(p => p.nodes.map(nd => frCode(nd.fr))))].map(c => '<span class="chip chip-fr">' + c + '</span>').join('');
  return `
  <section class="biz-sec" id="${f.code}">
    <div class="biz-head">
      <span class="biz-code">${f.code}</span>
      <h3>${esc(f.name)}</h3>
      ${priTag(f.pri)}
      <div class="biz-norms">
        <span class="norm-cap">规范依据</span>
        ${normChips(f)}
      </div>
    </div>
    <div class="biz-cards">
      <div class="bcard"><i>服务对象</i><b>${esc(f.target)}</b></div>
      <div class="bcard"><i>服务频次</i><b>${esc(f.freq)}</b></div>
      <div class="bcard"><i>关键指标</i><b>${esc(f.kpi)}</b></div>
      <div class="bcard"><i>系统入口</i><b>${esc(f.entry)}</b></div>
    </div>
    <div class="flow-box">
      <div class="flow-title">业务闭环流程图<span class="flow-note">${f.phases.length} 个阶段 · ${nodeCount} 个流程节点 · 节点标注对应功能需求编号</span></div>
      ${flowSvg(f)}
    </div>
    <div class="biz-grid">
      <div class="biz-col">
        <h4>关键业务规则（实测提炼）</h4>
        <ul class="rule-list">${ruleItems}</ul>
      </div>
      <div class="biz-col">
        <h4>闭环机制与断点风险</h4>
        <div class="loop-line">闭环路径：${esc(f.loop)}</div>
        <ul class="risk-list">${riskItems}</ul>
        <div class="fr-line">涉及功能项：${frChips}</div>
      </div>
    </div>
  </section>`;
}).join('');

const bizTableRows = FLOWS.map(f => {
  const nodeCount = f.phases.reduce((x, p) => x + p.nodes.length, 0);
  return '<tr><td class="mono">' + f.code + '</td><td><a href="#' + f.code + '">' + esc(f.name) + '</a></td><td>' + priTag(f.pri) + '</td><td>' + esc(f.target) + '</td><td>' + esc(f.freq) + '</td><td>' + f.phases.length + ' 阶段 / ' + nodeCount + ' 节点</td><td>' + esc(f.kpi) + '</td></tr>';
}).join('');

const CLOSED_LOOP_MECH = [
  ['查重防重复建档', '新建居民档案必经居民查重弹窗（身份证/姓名/出生日期/机构/档案编号5项检索），从源头保证"一人一档"；家庭档案同理调用家庭唯一性校验接口。', 'BZ-01 / BZ-02'],
  ['档案锁与权限保护', '档案上锁后编辑页字段全部只读，配合机构/部门数据权限，防止越权篡改档案。', 'BZ-01'],
  ['计划任务驱动', '随访/指标参数配置 → 自动生成8类服务计划 → 消息推送 → 执行销项，未完成项持续提醒，是所有服务业务闭环的总发动机。', 'BZ-18'],
  ['消息闭环流转', '任务消息支持跳转业务页面直接处理，处理完成即销项；系统通知支持已读管理，形成"推送-处理-反馈"的消息闭环。', 'BZ-18'],
  ['患者360汇聚', '所有业务模块的服务记录（随访/体检/报卡/评估）统一写回患者360视图，实现服务过程可追溯、健康信息全汇聚。', 'BZ-01'],
  ['量表自动判定', '中医体质辨识（33题自动计分判9体质）、自理能力评估（自动合计）、心血管分层评估等量表引擎自动输出结论，保证评估标准化。', 'BZ-03 / BZ-12'],
  ['转化衔接机制', '高危人群→确诊慢病专项、老年体检异常→慢病管理、产后42天→妇女保健、新生儿→儿童档案，业务域之间通过人群状态转化衔接成全程服务链。', 'BZ-06 / BZ-03 / BZ-09'],
  ['统计反馈催办', '7张国家报表+工作台进度大屏量化呈现服务完成情况，指标未达标触发催办提醒，最终形成"数据反哺业务"的管理闭环。', 'BZ-19'],
  ['审计追溯', '档案查阅记录、操作日志、档案传输记录三类审计日志，保证业务过程可追溯、责任可认定。', 'BZ-01 / BZ-19'],
];
const mechHtml = CLOSED_LOOP_MECH.map((m, i) => '<div class="feat-row"><div class="feat-title"><span class="feat-no">CL-' + String(i + 1).padStart(2, '0') + '</span>' + esc(m[0]) + '</div><p>' + esc(m[1]) + '</p><div class="feat-biz">关联业务域：' + esc(m[2]) + '</div></div>').join('');

const MVP = [
  { phase: 'MVP · P0 先行（建议 3-4 个月）', color: 'p0', items: [
    '档案底座：居民档案（查重/建档/360视图/档案治理）+ 家庭档案（BZ-01/02）',
    '驱动引擎：计划提醒引擎 + 消息中心（BZ-18）',
    '规范主线：高血压 + 糖尿病管理（随访4次/年）（BZ-04/05）',
    '法定报告：传染病报卡 + 突发公卫事件（BZ-13）',
    '妇幼主线：孕产妇 + 0-6岁儿童管理（BZ-09/10）',
  ], reason: '覆盖国家规范考核权重最高的服务项目，且档案与引擎是全系统地基，先行交付即可支撑基本公卫考核。' },
  { phase: '二期 · P1 重点（建议 +3 个月）', color: 'p1', items: [
    '老年人健康管理（体检/评估/中医药辨识）（BZ-03/12）',
    '重精 + 肺结核管理（BZ-07/08）',
    '其他慢病 + 高危人群管理（BZ-06）',
    '妇女保健 + 两癌筛查 + 母婴阻断（BZ-11）',
    '健康教育服务（BZ-15）',
    '业务报表 + 统计上报（BZ-19）',
  ], reason: '补齐国家规范全部服务项目与报表上报能力，形成完整公卫服务产品。' },
  { phase: '三期 · P2 完善（建议 +2 个月）', color: 'p2', items: [
    '卫生监督协管（BZ-16）',
    '三网监测（BZ-14）',
    '档案迁移流转（BZ-17）',
    '外嵌能力替代决策：BI大屏/自助查询 自研 vs 外采',
    '闭环增强：高危一键转化、报卡时效倒计时、服药提醒等增强项',
  ], reason: '支撑性与边缘业务，同时决策第三方依赖的替代方案，完成产品闭环增强。' },
];
const mvpHtml = MVP.map(m => '<div class="mvp-block mvp-' + m.color + '"><h4>' + esc(m.phase) + '</h4><ul>' + m.items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul><p class="mvp-reason">' + esc(m.reason) + '</p></div>').join('');

// ---------- 规范文档索引 ----------
const lawPdf = '中华人民共和国传染病防治法（2025修订）·人民日报刊发版.pdf';
const lawPdfExists = fs.existsSync(path.join(NORM_DIR, lawPdf));
const normTableRows = Object.entries(NORMS).map(([k, n]) => {
  const docLink = n.exists
    ? '<a class="doc-link" href="' + encodeURI('规范文档/' + n.doc) + '" target="_blank">📄 ' + esc(n.doc.replace(/·/g, ' · ')) + '</a>'
    : '<span style="color:#9A6700">⚠ 未下载，点击在线查看</span>';
  const extra = k === 'law' && lawPdfExists
    ? '<br><a class="doc-link" href="' + encodeURI('规范文档/' + lawPdf) + '" target="_blank">📄 ' + esc(lawPdf) + '</a>'
    : (k === 'cervical' ? '<br><a class="doc-link" href="' + encodeURI('规范文档/宫颈癌筛查工作方案和乳腺癌筛查工作方案·印发通知.html') + '" target="_blank">📄 宫颈癌筛查工作方案和乳腺癌筛查工作方案·印发通知.html</a>' : '');
  const bizList = Object.entries(BUS_NORM_LINKS).filter(([, arr]) => arr.includes(k)).map(([c]) => c).join('、');
  return '<tr><td class="mono">NORM-' + String(Object.keys(NORMS).indexOf(k) + 1).padStart(2, '0') + '</td><td><b>' + esc(n.short) + '</b><br><span style="font-size:12px;color:#64748B">' + esc(n.label) + '</span></td><td>' + esc(n.docNo) + '</td><td>' + esc(n.src) + '</td><td>' + docLink + extra + '</td><td><a class="online-link" href="' + n.online + '" target="_blank">在线原文 ↗</a></td><td class="mono" style="font-size:12px">' + bizList + '</td></tr>';
}).join('');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>公共卫生服务系统 · 业务流程闭环蓝图 V1.0</title>
<style>
:root {
  --page-bg: #FFFFFF; --page-surface: #F7F9FC; --page-surface-muted: #EFF3F8;
  --page-text: #1B2733; --page-text-secondary: #3E4C59; --page-text-muted: #64748B;
  --page-border: #DDE4EC; --page-brand: #0969DA; --page-brand-hover: #0757B5;
  --page-brand-soft: #EAF2FC; --page-brand-soft-strong: #D8E7F8;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", system-ui, sans-serif; font-size: 14px; line-height: 20px; color: var(--page-text); background: var(--page-bg); }
.mono { font-family: Consolas, monospace; }
a { color: var(--page-brand); text-decoration: none; }
a:hover { color: var(--page-brand-hover); text-decoration: underline; }

.report-intro { background: linear-gradient(135deg, #0B3D73 0%, #0B5FAE 55%, #1366BE 100%); color: #FFFFFF; }
.report-intro__content { max-width: 1200px; margin: 0 auto; padding: 60px 32px 48px; }
.intro-kicker { font-size: 13px; letter-spacing: 3px; color: #9ECBF7; font-weight: 600; margin-bottom: 14px; }
.report-intro h1 { font-size: 34px; line-height: 46px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; }
.intro-sub { font-size: 17px; color: #CFE3F8; font-weight: 500; margin-bottom: 20px; }
.intro-summary { max-width: 900px; font-size: 14.5px; line-height: 26px; color: #DDEBFA; margin-bottom: 24px; }
.intro-meta { display: flex; flex-wrap: wrap; gap: 10px 28px; font-size: 13px; color: #9ECBF7; }
.intro-meta span::before { content: "◆"; font-size: 8px; margin-right: 6px; color: #5FB0F5; vertical-align: 2px; }

main { max-width: 1200px; margin: 0 auto; padding: 8px 32px 32px; }
section.top-sec { padding: 44px 0 8px; }
h2.sec-title { font-size: 23px; line-height: 30px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
h2.sec-title .sec-no { font-size: 12px; font-weight: 600; color: var(--page-brand); background: var(--page-brand-soft); border: 1px solid var(--page-brand-soft-strong); border-radius: 6px; padding: 2px 8px; letter-spacing: 1px; }
.sec-sub { color: var(--page-text-muted); font-size: 13.5px; margin-bottom: 22px; }

.metric-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 26px; }
.metric-card { background: var(--page-bg); border: 1px solid var(--page-border); border-radius: 12px; padding: 18px 20px; }
.metric-card .m-label { font-size: 12.5px; color: var(--page-text-muted); margin-bottom: 8px; }
.metric-card .m-value { font-size: 27px; line-height: 32px; font-weight: 700; font-variant-numeric: tabular-nums; }
.metric-card .m-value em { font-style: normal; font-size: 13px; font-weight: 400; color: var(--page-text-muted); margin-left: 4px; }
.metric-card .m-note { font-size: 12px; color: var(--page-text-muted); margin-top: 6px; }

.model-bar { display: flex; align-items: stretch; gap: 0; margin: 6px 0 30px; flex-wrap: wrap; }
.model-step { flex: 1; min-width: 150px; background: var(--page-brand-soft); border: 1px solid var(--page-brand-soft-strong); border-radius: 10px; padding: 12px 16px; position: relative; }
.model-step + .model-step { margin-left: 26px; }
.model-step + .model-step::before { content: "→"; position: absolute; left: -23px; top: 50%; transform: translateY(-50%); color: var(--page-brand); font-size: 18px; font-weight: 700; }
.model-step h5 { font-size: 14px; color: #0B5FAE; margin-bottom: 4px; }
.model-step p { font-size: 12px; color: var(--page-text-secondary); line-height: 18px; }
.model-loop { width: 100%; text-align: center; margin-top: 14px; font-size: 13.5px; color: #C2531F; font-weight: 600; }
.model-loop::before { content: "↻ "; font-size: 16px; }

.pano-box { border: 1px solid var(--page-border); border-radius: 14px; padding: 20px 18px; margin-bottom: 30px; background: var(--page-surface); overflow-x: auto; }
.pano-box svg { width: 100%; height: auto; display: block; min-width: 900px; }

table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 18px; }
th, td { border: 1px solid var(--page-border); padding: 8px 10px; text-align: left; vertical-align: top; line-height: 19px; }
thead th { background: var(--page-surface); font-weight: 600; color: var(--page-text-secondary); white-space: nowrap; }
tbody tr:nth-child(even) { background: #FAFCFE; }
td.mono, th.mono { font-family: Consolas, monospace; white-space: nowrap; }

.biz-sec { padding: 38px 0 8px; border-top: 1px solid var(--page-border); }
.biz-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.biz-code { font-family: Consolas, monospace; font-size: 13px; font-weight: 600; color: #FFFFFF; background: #0B5FAE; border-radius: 6px; padding: 3px 9px; }
.biz-head h3 { font-size: 20px; font-weight: 700; }
.biz-meta { font-size: 12.5px; color: var(--page-text-muted); margin-left: auto; }
.biz-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.bcard { background: var(--page-surface); border: 1px solid var(--page-border); border-radius: 10px; padding: 10px 14px; }
.bcard i { display: block; font-style: normal; font-size: 11.5px; color: var(--page-text-muted); margin-bottom: 4px; font-weight: 600; }
.bcard b { font-weight: 500; font-size: 12.5px; color: var(--page-text-secondary); line-height: 18px; display: block; }
.flow-box { border: 1px solid var(--page-brand-soft-strong); background: #FDFEFF; border-radius: 12px; padding: 14px 16px 8px; margin-bottom: 16px; overflow-x: auto; }
.flow-title { font-size: 13.5px; font-weight: 700; color: var(--page-brand); margin-bottom: 10px; letter-spacing: .5px; }
.flow-note { font-size: 12px; font-weight: 400; color: var(--page-text-muted); margin-left: 12px; }
.flow-box svg { width: 100%; height: auto; display: block; min-width: 760px; }
.biz-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 8px; }
.biz-col { border: 1px solid var(--page-border); border-radius: 12px; padding: 14px 16px; background: var(--page-bg); }
.biz-col h4 { font-size: 13.5px; font-weight: 700; color: var(--page-text-secondary); margin-bottom: 8px; }
.rule-list, .risk-list { padding-left: 18px; }
.rule-list li, .risk-list li { font-size: 12.5px; color: var(--page-text-secondary); line-height: 20px; margin-bottom: 6px; }
.rule-list li::marker { color: var(--page-brand); }
.risk-list li::marker { color: #E07040; }
.loop-line { font-size: 12.5px; color: #C2531F; background: #FFF6F1; border: 1px dashed #F3C4A8; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; line-height: 19px; }
.fr-line { font-size: 12px; color: var(--page-text-muted); margin-top: 10px; line-height: 24px; }
.chip { display: inline-block; font-size: 11.5px; background: var(--page-surface-muted); border: 1px solid var(--page-border); border-radius: 4px; padding: 1px 7px; margin: 2px 4px 2px 0; }
.chip-fr { font-family: Consolas, monospace; color: var(--page-brand); background: var(--page-brand-soft); border-color: var(--page-brand-soft-strong); }
.tag { display: inline-block; font-size: 11.5px; font-weight: 600; border-radius: 4px; padding: 1px 7px; }
.tag-p0 { color: #C4320F; background: #FFECE6; }
.tag-p1 { color: #9A6700; background: #FFF8E1; }
.tag-p2 { color: #57606A; background: #EFF2F5; }
.biz-norms { margin-left: auto; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; max-width: 100%; }
.norm-cap { font-size: 12px; color: var(--page-text-muted); font-weight: 600; margin-right: 4px; }
.norm-chip { display: inline-block; font-size: 12px; color: #0E7A5F; background: #E9F7F1; border: 1px solid #BFE5D6; border-radius: 14px; padding: 1px 10px; white-space: nowrap; }
.norm-chip:hover { background: #D8F0E7; text-decoration: none; }
.norm-chip.norm-miss { color: #9A6700; background: #FFF8E1; border-color: #F0D9B8; }
.norm-online { display: inline-block; font-size: 11.5px; color: #3580DA; margin-left: -2px; padding: 1px 5px; }
.norm-online:hover { color: #0B5FAE; text-decoration: underline; }
.norm-tbl a.doc-link { color: #0E7A5F; font-weight: 500; }
.norm-tbl a.online-link { color: #3580DA; font-size: 12.5px; white-space: nowrap; }

.feat-row { border-bottom: 1px solid var(--page-border); padding: 12px 0; }
.feat-row:last-child { border-bottom: none; }
.feat-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.feat-no { display: inline-block; font-family: Consolas, monospace; font-size: 12px; color: var(--page-brand); background: var(--page-brand-soft); border-radius: 4px; padding: 1px 6px; margin-right: 8px; }
.feat-row p { color: var(--page-text-secondary); font-size: 13px; line-height: 20px; }
.feat-biz { font-size: 12px; color: var(--page-text-muted); margin-top: 4px; }

.mvp-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 10px 0; }
.mvp-block { border: 1px solid var(--page-border); border-radius: 12px; padding: 16px 18px; background: var(--page-bg); }
.mvp-block h4 { font-size: 14.5px; font-weight: 700; margin-bottom: 10px; }
.mvp-p0 h4 { color: #C4320F; } .mvp-p1 h4 { color: #9A6700; } .mvp-p2 h4 { color: #57606A; }
.mvp-block ul { padding-left: 18px; margin-bottom: 10px; }
.mvp-block li { font-size: 12.5px; color: var(--page-text-secondary); line-height: 20px; margin-bottom: 5px; }
.mvp-reason { font-size: 12px; color: var(--page-text-muted); background: var(--page-surface); border-radius: 8px; padding: 8px 10px; line-height: 18px; }

footer { border-top: 1px solid var(--page-border); margin-top: 40px; padding: 20px 32px 36px; text-align: center; font-size: 12.5px; color: var(--page-text-muted); }

@media (max-width: 960px) {
  .metric-row { grid-template-columns: repeat(2, 1fr); }
  .biz-cards { grid-template-columns: repeat(2, 1fr); }
  .biz-grid { grid-template-columns: 1fr; }
  .mvp-row { grid-template-columns: 1fr; }
  main { padding: 8px 16px 24px; }
  .report-intro__content { padding: 40px 16px 32px; }
  .model-step + .model-step { margin-left: 0; margin-top: 26px; }
  .model-step + .model-step::before { left: 50%; top: -24px; transform: translateX(-50%) rotate(90deg); }
}
@media print {
  .flow-box, .biz-sec, .bcard, .mvp-block { break-inside: avoid; }
}
</style>
</head>
<body>

<header class="report-intro">
  <div class="report-intro__content">
    <div class="intro-kicker">公共卫生服务系统 · 产品经理视角</div>
    <h1>业务流程闭环蓝图 V1.0</h1>
    <div class="intro-sub">—— 从"功能清单"到"业务闭环"：每个公卫服务的全流程地图与功能映射</div>
    <p class="intro-summary">本文档站在产品经理视角，将竞品实测采集的 19 个模块、86 个功能菜单，重新组织为 19 个业务域。每个业务域回答五个问题：服务谁（对象）、多久服务一次（频次）、怎么服务（闭环流程图）、流程节点对应哪些系统功能（FR映射）、哪里容易断（断点风险）。所有业务通过"人群发现 → 建档管理 → 服务执行 → 效果评估 → 数据反馈"五环模型形成闭环，由计划提醒引擎统一驱动，最终以报表指标反哺业务改进。</p>
    <div class="intro-meta">
      <span>分析基础：功能需求清单 V2.0（四轮实测）</span>
      <span>业务域：19 个</span>
      <span>流程节点：${totalNodes} 个</span>
      <span>文档版本：V1.0</span>
      <span>编制时间：2026年9月</span>
    </div>
  </div>
</header>

<main>

<section class="top-sec" id="sec-model">
  <h2 class="sec-title"><span class="sec-no">01</span>产品视角：五环闭环模型与业务全景</h2>
  <p class="sec-sub">所有公卫服务业务共享同一个闭环骨架——五个环节缺一不可，缺环即业务断点。</p>
  <div class="metric-row">
    <div class="metric-card"><div class="m-label">业务域</div><div class="m-value">${FLOWS.length}<em>个</em></div><div class="m-note">覆盖全部公卫服务与支撑能力</div></div>
    <div class="metric-card"><div class="m-label">闭环流程阶段</div><div class="m-value">${totalPhases}<em>个</em></div><div class="m-note">平均每业务 ${Math.round(totalPhases / FLOWS.length * 10) / 10} 个阶段</div></div>
    <div class="metric-card"><div class="m-label">流程节点</div><div class="m-value">${totalNodes}<em>个</em></div><div class="m-note">节点全部标注对应 FR 功能编号</div></div>
    <div class="metric-card"><div class="m-label">映射功能项</div><div class="m-value">${usedFr.size}<em>项</em></div><div class="m-note">占功能清单 86 个菜单的 ${Math.round(usedFr.size / 86 * 100)}%</div></div>
    <div class="metric-card"><div class="m-label">关键业务规则</div><div class="m-value">${FLOWS.reduce((s, f) => s + f.rules.length, 0)}<em>条</em></div><div class="m-note">实测提炼 + 国家规范</div></div>
  </div>
  <div class="model-bar">
    <div class="model-step"><h5>① 人群发现</h5><p>门诊就诊、主动筛查、报告卡、体检异常、高危转化——圈定服务对象</p></div>
    <div class="model-step"><h5>② 建档管理</h5><p>查重建档、专项档案、家庭关联——对象进入管理体系</p></div>
    <div class="model-step"><h5>③ 服务执行</h5><p>随访、体检、评估、指导——按规范频次提供服务并记录</p></div>
    <div class="model-step"><h5>④ 效果评估</h5><p>控制率、治愈、结案、转化——衡量服务效果与转归</p></div>
    <div class="model-step"><h5>⑤ 数据反馈</h5><p>报表统计、指标催办、参数调优——数据反哺驱动下一轮服务</p></div>
    <div class="model-loop">评估与反馈结果回流"人群发现"与"服务执行"——形成周期性服务闭环（年度循环 / 事件触发）</div>
  </div>
  <div class="pano-box">
    <div class="flow-title">公共卫生服务系统 · 业务全景地图（五层架构：驱动层 → 入口层 → 档案层 → 服务层 → 出口层 + 业务大闭环）</div>
    ${panoramaSvg()}
  </div>
</section>

<section id="sec-biztable">
  <h2 class="sec-title"><span class="sec-no">02</span>业务域总表（19个业务域）</h2>
  <p class="sec-sub">每个业务域的服务对象、频次、关键指标与流程规模一览，点击名称跳转至该业务的闭环流程详解。</p>
  <table>
    <caption>表1 · 业务域总表</caption>
    <thead><tr><th style="width:7%">编号</th><th style="width:16%">业务域</th><th style="width:6%">优先级</th><th style="width:22%">服务对象</th><th style="width:20%">服务频次</th><th style="width:12%">流程规模</th><th>关键指标</th></tr></thead>
    <tbody>${bizTableRows}</tbody>
  </table>
</section>

<section id="sec-flows">
  <h2 class="sec-title"><span class="sec-no">03</span>业务域闭环流程详解</h2>
  <p class="sec-sub">每个业务域一张闭环流程图：阶段卡按序流转，节点标注对应功能需求编号（FR），橙色虚线为闭环回路（年度循环或事件触发的再进入机制）。</p>
  ${flowSections}
</section>

<section class="top-sec" id="sec-mech">
  <h2 class="sec-title"><span class="sec-no">04</span>闭环保障机制（产品视角）</h2>
  <p class="sec-sub">流程图描述"应该怎么走"，以下 9 项机制保证"实际走成闭环"——它们是竞品实现闭环的产品抓手，也是重建系统的架构重点。</p>
  ${mechHtml}
</section>

<section class="top-sec" id="sec-mvp">
  <h2 class="sec-title"><span class="sec-no">05</span>建设路线建议（MVP 分期）</h2>
  <p class="sec-sub">按业务优先级与依赖关系建议的三期建设路线：档案底座与驱动引擎先行，规范主线保考核，支撑业务与增强项收尾。</p>
  <div class="mvp-row">
    ${mvpHtml}
  </div>
</section>

<section class="top-sec" id="sec-norms">
  <h2 class="sec-title"><span class="sec-no">06</span>规范文档库（依据原文 · 已下载）</h2>
  <p class="sec-sub">各业务域规范依据的官方原文文档已全部下载至本文件夹 <b>规范文档/</b> 子目录（与蓝图同级的 02.需求设计文件夹下）。下表为文档索引：点击"本地文档"直接打开已下载的 PDF/全文，点击"在线原文"跳转官方网站原始发布页。各业务域章节头部的"规范依据"标签同样支持双链接跳转。</p>
  <table class="norm-tbl">
    <caption>表2 · 规范文档索引（${Object.keys(NORMS).length} 项国家规范/法规依据）</caption>
    <thead><tr><th style="width:7%">编号</th><th style="width:24%">规范/法规名称</th><th style="width:12%">文号</th><th style="width:14%">发布来源</th><th style="width:28%">本地文档（规范文档/文件夹）</th><th style="width:9%">在线原文</th><th>适用业务域</th></tr></thead>
    <tbody>${normTableRows}</tbody>
  </table>
  <p style="font-size:12.5px;color:#64748B">说明：①《国家基本公共卫生服务规范（第三版）》为国卫基层发〔2017〕13号印发，涵盖居民健康档案、健康教育、0-6岁儿童、孕产妇、老年人、高血压、2型糖尿病、严重精神障碍、肺结核、中医药、传染病及突发公卫事件报告、卫生监督协管共12项服务规范，是本系统 ${FLOWS.filter(f => (BUS_NORM_LINKS[f.code] || []).includes('v3')).length} 个业务域的核心依据；②传染病防治法为2025年4月30日十四届全国人大常委会第十五次会议修订版（2025年9月1日起施行）；③2025年通知明确当年公卫经费人均99元、老年人体检新增DR胸片与糖化血红蛋白检测、电子健康档案向居民个人开放比例达70%等最新要求，实施时应以最新通知对齐服务内容。</p>
</section>

</main>

<footer>公共卫生服务系统 · 业务流程闭环蓝图 V1.1 · 基于《功能需求清单 V2.0》四轮实测数据编制 · 规范依据原文已下载至同目录"规范文档"文件夹 · 2026年9月</footer>

</body>
</html>`;

if (missFr.size) console.warn('WARN unmatched FR refs:', [...missFr].join(' | '));
if (normMissing.length) console.warn('WARN missing local norm docs:', normMissing.join(' | '));

const OUT = path.join(DIR, '..', '01-公共卫生服务系统产品文档', 'V1.0', '02.需求设计', '业务流程闭环蓝图.html');
fs.writeFileSync(OUT, html, 'utf8');
console.log('written:', OUT, (fs.statSync(OUT).size / 1024).toFixed(1) + ' KB');
console.log('flows=' + FLOWS.length, 'phases=' + totalPhases, 'nodes=' + totalNodes, 'usedFR=' + usedFr.size, 'rules=' + FLOWS.reduce((s, f) => s + f.rules.length, 0));
