await (async () => {
  const URL = '__URL__';
  const MODULE = '__MODULE__';
  const LABEL = '__LABEL__';
  const result = { module: MODULE, label: LABEL, url: URL, ops: [] };

  function parseR(r) { let raw = typeof r === 'string' ? r : (r.content ? r.content.map(c=>c.text).join('') : JSON.stringify(r)); let d = raw; for (let i=0;i<3;i++){ if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e){ break; } } } return d; }

  async function extractState() {
    const vf = await tools.view_files({files: [{file_path: 'd:\\AI_Project\\Public-Health-Service-System\\_tmp_traversal\\dialog_extractor.js', read_entire_file: true}]});
    let d;
    try { d = parseR(await tools.browser_evaluate({script: vf.contents[0].content})); } catch (e) { d = [{kind: 'error', title: String(e)}]; }
    return d;
  }

  async function closeAll() {
    const closed = await tools.browser_evaluate({script: `
      const log = [];
      for (let round = 0; round < 3; round++) {
        const dlgs = Array.from(document.querySelectorAll('.yh-dialog__wrapper, .el-dialog__wrapper')).filter(w => getComputedStyle(w).display !== 'none');
        if (!dlgs.length) break;
        const dlg = dlgs[dlgs.length - 1];
        const footer = dlg.querySelector('.yh-dialog__footer, .el-dialog__footer') || dlg;
        const cancel = Array.from(footer.querySelectorAll('button')).find(b => ['取消', '关 闭', '关闭', '返 回'].includes((b.innerText || '').replace(/\\s/g, '')));
        if (cancel) { cancel.click(); log.push('cancel'); }
        else {
          const x = dlg.querySelector('.yh-dialog__headerbtn, .el-dialog__headerbtn');
          if (x) { x.click(); log.push('x'); } else break;
        }
        await new Promise(r => setTimeout(r, 400));
      }
      return log.join(',');
    `}).catch(() => 'esc');
    await tools.browser_wait_for({time: 0.8});
    return closed;
  }

  await tools.browser_navigate({url: URL});
  await tools.browser_wait_for({time: 2.8});

  const pageOps = parseR(await tools.browser_evaluate({script: `
    const main = document.querySelector('.app-main');
    if (!main) return JSON.stringify({error: 'no app-main'});
    const clean = s => (s || '').replace(/\\s+/g, ' ').trim();
    const headerBtns = [];
    main.querySelectorAll('.header-btn button, .header-box button, .toolbar button').forEach(b => { if (b.offsetWidth > 0) { const v = clean(b.innerText); if (v && v.length <= 12 && !headerBtns.includes(v)) headerBtns.push(v); } });
    const rows = Array.from(main.querySelectorAll('tbody tr')).filter(r => r.offsetWidth > 0 && clean(r.innerText));
    const rowPatterns = [];
    const seen = new Set();
    for (const row of rows) {
      const btns = Array.from(row.querySelectorAll('button')).filter(b => clean(b.innerText) && b.getBoundingClientRect().width > 0);
      const t = btns.map(b => clean(b.innerText)).join(',');
      if (t && !seen.has(t)) { seen.add(t); rowPatterns.push(t); }
    }
    return JSON.stringify({headerBtns, rowPatterns: rowPatterns.slice(0, 8)});
  `}));
  result.pageOps = pageOps;

  const headerTargets = (pageOps.headerBtns || []).filter(b => /新建|新增|申请|添加/.test(b));
  for (const btnName of headerTargets.slice(0, 3)) {
    await tools.browser_evaluate({script: `
      const main = document.querySelector('.app-main');
      const btns = Array.from(main.querySelectorAll('button')).filter(b => b.offsetWidth > 0);
      const b = btns.find(x => (x.innerText || '').trim().includes('${btnName}'));
      if (b) b.click();
    `});
    await tools.browser_wait_for({time: 2.5});
    const state = await extractState();
    const hash = parseR(await tools.browser_evaluate({script: 'return location.hash;'}));
    result.ops.push({op: btnName, type: 'new', hashChanged: hash, state});
    if (hash && hash !== URL.replace('http://192.168.200.83/phService', '')) {
      await tools.browser_navigate({url: URL});
      await tools.browser_wait_for({time: 2.2});
    } else {
      await closeAll();
    }
  }

  const rowTargets = [];
  for (const pat of (pageOps.rowPatterns || [])) {
    for (const op of pat.split(',')) {
      if (!rowTargets.includes(op) && op !== '更多') rowTargets.push(op);
    }
  }
  for (const btnName of rowTargets.slice(0, 4)) {
    const clicked = parseR(await tools.browser_evaluate({script: `
      const main = document.querySelector('.app-main');
      const rows = Array.from(main.querySelectorAll('tbody tr')).filter(r => r.offsetWidth > 0 && (r.innerText || '').trim());
      for (const row of rows) {
        const btns = Array.from(row.querySelectorAll('button')).filter(b => (b.innerText || '').trim() === '${btnName}' && b.getBoundingClientRect().width > 0);
        if (btns.length) { btns[0].click(); return 'CLICKED'; }
      }
      return 'NOT_FOUND';
    `}));
    if (clicked !== 'CLICKED') { result.ops.push({op: btnName, type: 'row', note: clicked}); continue; }
    await tools.browser_wait_for({time: 2.5});
    const state = await extractState();
    const hash = parseR(await tools.browser_evaluate({script: 'return location.hash;'}));
    result.ops.push({op: btnName, type: 'row', hashChanged: hash, state});
    if (hash && !hash.includes('hypertensionPublic') && hash !== URL.replace('http://192.168.200.83/phService', '') && !hash.startsWith('#/diseaseManagement') || (hash && hash.includes('Follow') || hash.includes('Table') || hash.includes('Detail'))) {
      await tools.browser_navigate({url: URL});
      await tools.browser_wait_for({time: 2.2});
    } else {
      await closeAll();
    }
  }

  const hasMore = (pageOps.rowPatterns || []).some(p => p.includes('更多'));
  if (hasMore) {
    await tools.browser_evaluate({script: `
      const main = document.querySelector('.app-main');
      const rows = Array.from(main.querySelectorAll('tbody tr')).filter(r => r.offsetWidth > 0 && (r.innerText || '').trim());
      for (const row of rows) {
        const btns = Array.from(row.querySelectorAll('button')).filter(b => (b.innerText || '').trim() === '更多' && b.getBoundingClientRect().width > 0);
        if (btns.length) { btns[0].click(); return 'CLICKED'; }
      }
      return 'NOT_FOUND';
    `});
    await tools.browser_wait_for({time: 1.5});
    const dd = parseR(await tools.browser_evaluate({script: `
      const dds = Array.from(document.querySelectorAll('.yh-dropdown-menu, .el-dropdown-menu')).filter(d => d.offsetWidth > 0);
      if (!dds.length) return JSON.stringify({items: []});
      return JSON.stringify({items: Array.from(dds[dds.length-1].querySelectorAll('li')).filter(l => l.offsetWidth > 0).map(l => l.innerText.trim()).filter(v => v)});
    `}));
    result.moreMenu = dd;
    await tools.browser_evaluate({script: 'document.body.click();'});
    await tools.browser_wait_for({time: 0.6});
  }

  await tools.write_to_file({rewrite: false, file_path: 'd:\\AI_Project\\Public-Health-Service-System\\_tmp_traversal\\results\\ops_' + MODULE.replace(/[^a-zA-Z0-9]/g, '') + '_' + LABEL.replace(/[^a-zA-Z0-9]/g, '') + '.json', content: JSON.stringify(result)});
  text('DONE ' + MODULE + '/' + LABEL + ' | headerOps: ' + JSON.stringify(headerTargets) + ' | rowOps: ' + JSON.stringify(rowTargets.slice(0,6)) + ' | more: ' + JSON.stringify(result.moreMenu || null));
})()
