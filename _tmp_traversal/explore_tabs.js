// 页签级遍历脚本（Exec中直接执行，TARGETS内联替换）
// 目标类型：directForm=true 直接导航到表单hash采集页签；false 列表页（先清理残留表单再按open打开）
// 用法：将文件内容发给integrated_code_mode Exec，替换TARGETS数组

const BASE = 'http://192.168.200.83/phService/';
const OUTDIR = 'd:\\AI_Project\\Public-Health-Service-System\\_tmp_traversal\\results\\';

const deepParse = (x) => { let d = x; for (let i = 0; i < 5; i++) { if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { break; } } else break; } return d; };
const ev = async (script) => {
  const r = await tools.browser_evaluate({ script });
  const raw = typeof r === 'string' ? r : (r.content ? r.content.map(c => c.text).join('') : JSON.stringify(r));
  return deepParse(raw);
};
const sleep = (t) => tools.browser_wait_for({ time: t });

const vf = await tools.view_files({ files: [{ file_path: 'd:\\AI_Project\\Public-Health-Service-System\\_tmp_traversal\\dialog_extractor.js', read_entire_file: true }] });
const EXTRACTOR = vf.contents[0].content;

const COMMON = `
  const clean = s => (s || '').replace(/\\s+/g, ' ').trim();
  const vis = el => el && (el.offsetWidth > 0 || el.offsetHeight > 0);
  const ws = () => Array.from(document.querySelectorAll('.yh-dialog__wrapper, .el-dialog__wrapper')).filter(w => getComputedStyle(w).display !== 'none');
  const scopeOf = () => { const w = ws(); return w.length ? (w[w.length - 1].querySelector('.yh-dialog, .el-dialog') || w[w.length - 1]) : (document.querySelector('.app-main') || document.body); };
`;

async function extract() {
  try { return await ev(EXTRACTOR); } catch (e) { return [{ kind: 'error', title: String(e) }]; }
}

async function scopeInfo() {
  return ev(`return (function () { ${COMMON}
    const scope = scopeOf();
    const tabs = [];
    scope.querySelectorAll('.yh-tabs__item, .el-tabs__item').forEach(t => { if (vis(t)) { const v = clean(t.innerText); if (v && v.length <= 30 && !tabs.includes(v)) tabs.push(v); } });
    return JSON.stringify({ hasDialog: ws().length > 0, dialogCount: ws().length, tabs, hash: location.hash });
  })()`);
}

async function confirmBox() {
  const cf = await ev(`return (function () {
    const mbs = Array.from(document.querySelectorAll('.yh-message-box__wrapper, .el-message-box__wrapper')).filter(w => w.offsetWidth > 0);
    if (!mbs.length) return 'NO_BOX';
    const mb = mbs[mbs.length - 1].querySelector('.yh-message-box, .el-message-box') || mbs[mbs.length - 1];
    if (mb.offsetWidth === 0) return 'NO_BOX';
    const btns = Array.from(mb.querySelectorAll('button'));
    const yes = btns.find(b => ['是', '确定'].includes(clean(b.innerText)));
    if (yes) { yes.click(); return 'YES'; }
    return 'NO_YES';
  })()`);
  if (cf !== 'NO_BOX') await sleep(1.2);
  return cf;
}

async function cleanupFullscreen() {
  for (let i = 0; i < 3; i++) {
    const r = await ev(`return (function () { ${COMMON}
      const b = Array.from(document.querySelectorAll('button')).find(x => vis(x) && clean(x.innerText) === '返回');
      if (!b) return 'NO_BACK';
      b.click();
      return 'BACK';
    })()`);
    if (r === 'NO_BACK') return 'clean';
    await sleep(1.5);
    await confirmBox();
  }
  return 'clean-max';
}

async function closeTop() {
  const r = await ev(`return (function () { ${COMMON}
    const w = ws();
    if (!w.length) return 'none';
    const dlg = w[w.length - 1];
    const footer = dlg.querySelector('.yh-dialog__footer, .el-dialog__footer') || dlg;
    const cancel = Array.from(footer.querySelectorAll('button')).find(b => ['取消', '关闭', '关 闭', '返回', '返 回'].includes(clean(b.innerText).replace(/\\s/g, '')));
    if (cancel) { cancel.click(); return 'cancel'; }
    const x = dlg.querySelector('.yh-dialog__headerbtn, .el-dialog__headerbtn');
    if (x) { x.click(); return 'x'; }
    return 'no-close';
  })()`);
  await sleep(0.8);
  return r;
}

async function clickTab(idx) {
  return ev(`return (function () { ${COMMON}
    const scope = scopeOf();
    const tabs = Array.from(scope.querySelectorAll('.yh-tabs__item, .el-tabs__item')).filter(vis);
    if (tabs.length <= ${idx}) return 'NO_TAB';
    const t = tabs[${idx}];
    t.click();
    return 'CLICKED:' + clean(t.innerText);
  })()`);
}

async function clickBtnInScope(name) {
  return ev(`return (function () { ${COMMON}
    const scope = scopeOf();
    const b = Array.from(scope.querySelectorAll('button')).find(x => vis(x) && clean(x.innerText) === '${name}');
    if (!b) return 'NOT_FOUND';
    b.click();
    return 'CLICKED';
  })()`);
}

// === TARGETS（每次执行前替换） ===
const TARGETS = [
  /*TARGETS*/
];

const summary = [];
for (const t of TARGETS) {
  const item = { module: t.module, label: t.label, url: BASE + t.url, mode: t.directForm ? 'directForm' : (t.open ? 'list+open' : 'list'), tabs: [], subForms: [], notes: [] };
  try {
    await tools.browser_navigate({ url: BASE + t.url });
    await sleep(3.5);
    if (!t.directForm) {
      await cleanupFullscreen();
      if (t.open) {
        const openRes = await ev(t.open.type === 'header' ? `return (function () { ${COMMON}
          const main = document.querySelector('.app-main');
          const btns = Array.from((main || document).querySelectorAll('button')).filter(b => vis(b));
          const b = btns.find(x => clean(x.innerText).includes('${t.open.btn}'));
          if (b) { b.click(); return 'CLICKED'; }
          return 'NOT_FOUND';
        })()` : `return (function () { ${COMMON}
          const main = document.querySelector('.app-main');
          const rows = Array.from((main || document).querySelectorAll('tbody tr')).filter(r => vis(r) && clean(r.innerText));
          for (const row of rows) {
            const b = Array.from(row.querySelectorAll('button')).find(x => vis(x) && clean(x.innerText) === '${t.open.btn}');
            if (b) { b.click(); return 'CLICKED'; }
          }
          return 'NOT_FOUND';
        })()`);
        item.openResult = openRes;
        await sleep(3);
        await confirmBox();
      }
    }
    const info = await scopeInfo();
    item.scope = info.hasDialog ? 'dialog' : 'page';
    item.formHash = info.hash;
    const tabNames = info.tabs || [];

    for (let i = 0; i < Math.min(tabNames.length, 8); i++) {
      const c = await clickTab(i);
      await sleep(2);
      const st = await extract();
      item.tabs.push({ name: tabNames[i], click: c, state: st });
    }

    if (!tabNames.length) {
      const st0 = await extract();
      item.tabs.push({ name: '(无页签-整页表单)', state: st0 });
      for (let s = 0; s < 4; s++) {
        const nc = await ev(`return (function () { ${COMMON}
          const scope = scopeOf();
          const b = Array.from(scope.querySelectorAll('button')).find(x => vis(x) && /下一页|下一步/.test(clean(x.innerText)));
          if (!b) return 'NO_NEXT';
          b.click(); return 'CLICKED';
        })()`);
        if (nc !== 'CLICKED') break;
        await sleep(2);
        const st = await extract();
        item.tabs.push({ name: '第' + (s + 2) + '页(下一步)', state: st });
      }
    }
  } catch (e) { item.error = String(e); }

  const fname = 'tab_' + t.module.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '') + '_' + t.label.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '') + '.json';
  try { await tools.delete_file({ file_paths: [OUTDIR + fname] }); } catch (e) {}
  try { await tools.Write({ file_path: OUTDIR + fname, content: JSON.stringify(item) }); }
  catch (e) { item._saveErr = String(e); }
  const tabNames2 = (item.tabs || []).map(x => x.name).join('/');
  summary.push(t.label + '[' + item.tabs.length + 'tabs' + (item.error ? ' ERR:' + String(item.error).slice(0, 40) : '') + ':' + tabNames2.slice(0, 60) + ']');
}
text('TABS_DONE: ' + summary.join(' | '));
