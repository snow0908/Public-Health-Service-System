async (tools, text, PAGES) => {
  const BASE = 'http://192.168.200.83/phService/';
  const OUTDIR = 'd:\\AI_Project\\Public-Health-Service-System\\_tmp_traversal\\results\\';

  function parseR(r) {
    let raw = typeof r === 'string' ? r : (r.content ? r.content.map(c => c.text).join('') : JSON.stringify(r));
    let d = raw;
    for (let i = 0; i < 3; i++) { if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { break; } } }
    return d;
  }

  const vf = await tools.view_files({ files: [{ file_path: 'd:\\AI_Project\\Public-Health-Service-System\\_tmp_traversal\\dialog_extractor.js', read_entire_file: true }] });
  const EXTRACTOR = vf.contents[0].content;

  async function extractState() {
    try { return parseR(await tools.browser_evaluate({ script: EXTRACTOR })); }
    catch (e) { return [{ kind: 'error', title: String(e) }]; }
  }

  async function getHash() {
    try { return parseR(await tools.browser_evaluate({ script: 'return location.hash;' })); }
    catch (e) { return ''; }
  }

  async function closeAll() {
    await tools.browser_evaluate({ script: `
      const log = [];
      for (let round = 0; round < 4; round++) {
        const dlgs = Array.from(document.querySelectorAll('.yh-dialog__wrapper, .el-dialog__wrapper')).filter(w => getComputedStyle(w).display !== 'none');
        if (!dlgs.length) break;
        const dlg = dlgs[dlgs.length - 1];
        const footer = dlg.querySelector('.yh-dialog__footer, .el-dialog__footer') || dlg;
        const cancel = Array.from(footer.querySelectorAll('button')).find(b => ['取消', '关 闭', '关闭', '返 回'].includes((b.innerText || '').replace(/\\s/g, '')));
        if (cancel) { cancel.click(); log.push('cancel'); }
        else { const x = dlg.querySelector('.yh-dialog__headerbtn, .el-dialog__headerbtn'); if (x) { x.click(); log.push('x'); } else break; }
        await new Promise(r => setTimeout(r, 350));
      }
      return log.join(',');
    ` }).catch(() => 'esc');
    await tools.browser_wait_for({ time: 0.7 });
  }

  async function collectPageOps() {
    return parseR(await tools.browser_evaluate({ script: `
      const main = document.querySelector('.app-main');
      if (!main) return JSON.stringify({error: 'no app-main'});
      const clean = s => (s || '').replace(/\\s+/g, ' ').trim();
      const headerBtns = [];
      main.querySelectorAll('.header-btn button, .header-box button, .toolbar button, .table-header button, .top-btn button').forEach(b => { if (b.offsetWidth > 0) { const v = clean(b.innerText); if (v && v.length <= 12 && !headerBtns.includes(v)) headerBtns.push(v); } });
      const rows = Array.from(main.querySelectorAll('tbody tr')).filter(r => r.offsetWidth > 0 && clean(r.innerText));
      const rowPatterns = [];
      const seen = new Set();
      for (const row of rows) {
        const btns = Array.from(row.querySelectorAll('button')).filter(b => clean(b.innerText) && b.getBoundingClientRect().width > 0);
        const t = btns.map(b => clean(b.innerText)).join(',');
        if (t && !seen.has(t)) { seen.add(t); rowPatterns.push(t); }
      }
      const links = [];
      main.querySelectorAll('.header-btn a, .toolbar a').forEach(a => { if (a.offsetWidth > 0) { const v = clean(a.innerText); if (v && v.length <= 12 && !links.includes(v)) links.push(v); } });
      return JSON.stringify({headerBtns, links, rowPatterns: rowPatterns.slice(0, 8), rowCount: rows.length});
    ` }));
  }

  async function clickHeaderBtn(name) {
    return parseR(await tools.browser_evaluate({ script: `
      const main = document.querySelector('.app-main');
      const btns = Array.from(main.querySelectorAll('button')).filter(b => b.offsetWidth > 0);
      const b = btns.find(x => (x.innerText || '').replace(/\\s+/g, '').includes('${name}'.replace(/\\s+/g, '')));
      if (b) { b.click(); return 'CLICKED'; }
      return 'NOT_FOUND';
    ` }));
  }

  async function clickRowBtn(name) {
    return parseR(await tools.browser_evaluate({ script: `
      const main = document.querySelector('.app-main');
      const rows = Array.from(main.querySelectorAll('tbody tr')).filter(r => r.offsetWidth > 0 && (r.innerText || '').trim());
      for (const row of rows) {
        const btns = Array.from(row.querySelectorAll('button')).filter(b => (b.innerText || '').replace(/\\s+/g, '') === '${name}' && b.getBoundingClientRect().width > 0);
        if (btns.length) { btns[0].click(); return 'CLICKED'; }
      }
      return 'NOT_FOUND';
    ` }));
  }

  async function clickMoreAndCollect() {
    const clicked = parseR(await tools.browser_evaluate({ script: `
      const clean = s => (s || '').replace(/\\s+/g, ' ').trim();
      const main = document.querySelector('.app-main');
      const rows = Array.from(main.querySelectorAll('tbody tr')).filter(r => r.offsetWidth > 0 && (r.innerText || '').trim());
      for (const row of rows) {
        for (const e of row.querySelectorAll('.yh-dropdown, .el-dropdown')) {
          if (/^更多$/.test(clean(e.innerText)) && e.getBoundingClientRect().width > 0) {
            const link = e.querySelector('.yh-dropdown-link, .el-dropdown-selfdefine') || e.querySelector('button, span') || e;
            link.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true, view: window}));
            link.dispatchEvent(new MouseEvent('mouseover', {bubbles: true, view: window}));
            return 'HOVERED';
          }
        }
      }
      return 'NOT_FOUND';
    ` }));
    if (clicked !== 'HOVERED') return null;
    await tools.browser_wait_for({ time: 1.2 });
    return parseR(await tools.browser_evaluate({ script: `
      const dds = Array.from(document.querySelectorAll('.yh-dropdown-menu, .el-dropdown-menu')).filter(d => d.offsetWidth > 0);
      if (!dds.length) return JSON.stringify({items: []});
      const dd = dds[dds.length - 1];
      const items = Array.from(dd.querySelectorAll('li')).filter(l => l.offsetWidth > 0).map(l => (l.innerText || '').replace(/\\s+/g, ' ').trim()).filter(v => v);
      return JSON.stringify({items});
    ` }));
  }

  async function closeMoreMenu() {
    await tools.browser_evaluate({ script: `
      const dds = Array.from(document.querySelectorAll('.yh-dropdown-menu, .el-dropdown-menu')).filter(d => d.offsetWidth > 0);
      dds.forEach(d => { d.style.display = 'none'; });
      document.body.click();
    ` }).catch(() => {});
    await tools.browser_wait_for({ time: 0.5 });
  }

  async function clickDropdownItem(idx) {
    return parseR(await tools.browser_evaluate({ script: `
      const dds = Array.from(document.querySelectorAll('.yh-dropdown-menu, .el-dropdown-menu')).filter(d => d.offsetWidth > 0);
      if (!dds.length) return 'NO_MENU';
      const items = Array.from(dds[dds.length - 1].querySelectorAll('li')).filter(l => l.offsetWidth > 0);
      if (items.length <= ${idx}) return 'NO_ITEM';
      items[${idx}].click();
      return 'CLICKED';
    ` }));
  }

  const DESTRUCTIVE = /删除|作废|注销|移除|清空|终止|停用|禁用/;
  const summary = [];

  for (const p of PAGES) {
    const URL = BASE + p.href;
    const originHash = p.href;
    const item = { module: p.module, group: p.group || '', label: p.label, url: URL, ops: [] };
    try {
    await tools.browser_navigate({ url: URL });
    await tools.browser_wait_for({ time: 3.2 });
    const pageOps = await collectPageOps();
    item.pageOps = pageOps;

      const headerTargets = ((pageOps && pageOps.headerBtns) || []).filter(b => /新建|新增|申请|添加|登记|导入/.test(b));
      for (const btnName of headerTargets.slice(0, 2)) {
        const c = await clickHeaderBtn(btnName);
        if (c !== 'CLICKED') { item.ops.push({ op: btnName, from: 'header', note: c }); continue; }
        await tools.browser_wait_for({ time: 2.5 });
        const state = await extractState();
        const hash = await getHash();
        item.ops.push({ op: btnName, from: 'header', hash, state });
        if (hash && hash !== originHash) { await tools.browser_navigate({ url: URL }); await tools.browser_wait_for({ time: 2.6 }); }
        else { await closeAll(); }
      }

      const rowTargets = [];
      for (const pat of ((pageOps && pageOps.rowPatterns) || [])) {
        for (const op of pat.split(',')) { if (op && !rowTargets.includes(op) && op !== '更多') rowTargets.push(op); }
      }
      for (const btnName of rowTargets.slice(0, 5)) {
        if (DESTRUCTIVE.test(btnName)) { item.ops.push({ op: btnName, from: 'row', note: 'SKIP-destructive' }); continue; }
        const c = await clickRowBtn(btnName);
        if (c !== 'CLICKED') { item.ops.push({ op: btnName, from: 'row', note: c }); continue; }
        await tools.browser_wait_for({ time: 3.0 });
        const state = await extractState();
        const hash = await getHash();
        item.ops.push({ op: btnName, from: 'row', hash, state });
        if (hash && hash !== originHash) { await tools.browser_navigate({ url: URL }); await tools.browser_wait_for({ time: 2.6 }); }
        else { await closeAll(); }
      }

      const moreInfo = await clickMoreAndCollect();
      if (moreInfo && moreInfo.items && moreInfo.items.length) {
        item.moreMenu = { items: moreInfo.items };
        const safeItems = moreInfo.items.map((v, i) => ({ v, i })).filter(o => !DESTRUCTIVE.test(o.v));
        for (const o of safeItems.slice(0, 4)) {
          const reOpen = await clickMoreAndCollect();
          if (!reOpen || !reOpen.items || !reOpen.items.length) { await closeMoreMenu(); break; }
          const c = await clickDropdownItem(o.i);
          if (c !== 'CLICKED') { item.ops.push({ op: '更多>' + o.v, note: c }); await closeMoreMenu(); continue; }
          await tools.browser_wait_for({ time: 3.0 });
          const state = await extractState();
          const hash = await getHash();
          item.ops.push({ op: '更多>' + o.v, from: 'more', hash, state });
          if (hash && hash !== originHash) { await tools.browser_navigate({ url: URL }); await tools.browser_wait_for({ time: 2.6 }); }
          else { await closeMoreMenu(); await closeAll(); }
        }
      }
    } catch (e) {
      item.error = String(e);
    }
    const fname = 'op_' + p.module.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '') + '_' + p.label.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '') + '.json';
    try { await tools.delete_file({ file_paths: [OUTDIR + fname] }); } catch (e) {}
    try { await tools.Write({ file_path: OUTDIR + fname, content: JSON.stringify(item) }); }
    catch (e) { await tools.write_to_file({ rewrite: false, file_path: OUTDIR + 'op_' + Date.now() + '.json', content: JSON.stringify(item).slice(0, 4900) }); }
    const opNames = item.ops.map(o => o.op + (o.note ? '(' + o.note + ')' : '')).join('/');
    summary.push(p.label + '[' + (item.ops.length) + ':' + opNames.slice(0, 80) + ']');
  }
  text('BATCH_DONE: ' + summary.join(' | '));
}
