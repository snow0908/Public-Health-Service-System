return (function () {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const vis = (el) => el && (el.offsetWidth > 0 || el.offsetHeight > 0);

  function findTopDialogs() {
    const dlgs = Array.from(document.querySelectorAll('.yh-dialog__wrapper, .el-dialog__wrapper, .yh-drawer__wrapper, .el-drawer__wrapper'))
      .filter(w => {
        const st = getComputedStyle(w);
        return st.display !== 'none' && st.visibility !== 'hidden';
      });
    const out = [];
    dlgs.forEach(w => {
      const dlg = w.querySelector('.yh-dialog, .el-dialog, .yh-drawer, .el-drawer') || w;
      if (vis(dlg)) out.push(dlg);
    });
    return out;
  }

  function controlType(item) {
    if (item.querySelector('.yh-cascader, .el-cascader')) return 'cascader';
    if (item.querySelector('textarea, .yh-textarea, .el-textarea')) return 'textarea';
    if (item.querySelector('.yh-input-number, .el-input-number')) return 'number';
    if (item.querySelector('.yh-radio-group, .el-radio-group')) return 'radio';
    if (item.querySelector('.yh-checkbox-group, .el-checkbox-group, .yh-checkbox, .el-checkbox')) return 'checkbox';
    if (item.querySelector('.yh-select, .el-select')) return 'select';
    if (item.querySelector('.yh-date-editor, .el-date-editor, .yh-range-editor, .el-range-editor')) return 'date';
    if (item.querySelector('.yh-switch, .el-switch')) return 'switch';
    if (item.querySelector('.yh-upload, .el-upload')) return 'upload';
    if (item.querySelector('.yh-rate, .el-rate')) return 'rate';
    if (item.querySelector('input, .yh-input, .el-input')) return 'input';
    return 'display';
  }

  function fieldInfo(item) {
    const labelEl = item.querySelector('.yh-form-item__label, .el-form-item__label');
    const label = clean(labelEl ? labelEl.innerText : '').replace(/[:：]$/, '');
    const content = item.querySelector('.yh-form-item__content, .el-form-item__content');
    const required = item.classList.contains('is-required');
    const type = controlType(item);
    let options = [];
    if (type === 'radio') {
      item.querySelectorAll('.yh-radio__label, .el-radio__label').forEach(o => { const v = clean(o.innerText); if (v && !options.includes(v)) options.push(v); });
    }
    if (type === 'checkbox') {
      item.querySelectorAll('.yh-checkbox__label, .el-checkbox__label').forEach(o => { const v = clean(o.innerText); if (v && !options.includes(v)) options.push(v); });
    }
    let placeholder = '';
    const phEl = item.querySelector('input[placeholder], textarea[placeholder]');
    if (phEl) placeholder = clean(phEl.placeholder);
    let value = '';
    const valEl = item.querySelector('.yh-input__inner, .el-input__inner, textarea');
    if (valEl && valEl.value !== undefined) value = clean(String(valEl.value));
    return { label, type, required, options, placeholder, value };
  }

  function extractContainer(dlg, kind) {
    const titleEl = dlg.querySelector('.yh-dialog__title, .el-dialog__title, .yh-drawer__title, .el-drawer__title, .yh-drawer__header__title');
    const title = clean(titleEl ? titleEl.innerText : '');
    const body = dlg.querySelector('.yh-dialog__body, .el-dialog__body, .yh-drawer__body, .el-drawer__body') || dlg;
    const tabs = [];
    body.querySelectorAll('.yh-tabs__item, .el-tabs__item').forEach(t => { if (vis(t)) { const v = clean(t.innerText); if (v && v.length <= 25 && !tabs.includes(v)) tabs.push(v); } });
    const sections = [];
    body.querySelectorAll('.yh-divider__text, .el-divider__text, .yh-collapse-item__header, .el-collapse-item__header').forEach(s => { if (vis(s)) { const v = clean(s.innerText); if (v && v.length <= 30 && !sections.includes(v)) sections.push(v); } });
    const fields = [];
    const seen = new Set();
    body.querySelectorAll('.yh-form-item, .el-form-item').forEach(item => {
      if (!vis(item)) return;
      const f = fieldInfo(item);
      if (!f.label) return;
      const key = f.label + '|' + f.type;
      if (seen.has(key)) return;
      seen.add(key);
      fields.push(f);
    });
    const descriptions = [];
    body.querySelectorAll('.yh-descriptions-item, .el-descriptions-item').forEach(d => {
      if (!vis(d)) return;
      const lb = clean(d.querySelector('.yh-descriptions-item__label, .el-descriptions-item__label') ? d.querySelector('.yh-descriptions-item__label, .el-descriptions-item__label').innerText : '');
      if (lb && lb.length <= 25 && !descriptions.includes(lb)) descriptions.push(lb);
    });
    const tables = [];
    body.querySelectorAll('table').forEach(tb => {
      const ths = [];
      tb.querySelectorAll('th').forEach(th => { const v = clean(th.innerText); if (v && v.length <= 25 && !ths.includes(v)) ths.push(v); });
      if (ths.length) tables.push(ths);
    });
    const btns = [];
    (dlg.querySelector('.yh-dialog__footer, .el-dialog__footer, .yh-drawer__footer') || dlg).querySelectorAll('button, .yh-button, .el-button').forEach(b => {
      if (!vis(b)) return;
      const v = clean(b.innerText);
      if (v && v.length <= 12 && !btns.includes(v)) btns.push(v);
    });
    const bodyBtns = [];
    body.querySelectorAll('button').forEach(b => { if (vis(b)) { const v = clean(b.innerText); if (v && v.length <= 12 && !btns.includes(v) && !bodyBtns.includes(v)) bodyBtns.push(v); } });
    return { kind, title, tabs, sections, fields, descriptions, tables, footerButtons: btns, bodyButtons: bodyBtns, fieldCount: fields.length };
  }

  const dlgs = findTopDialogs();
  if (dlgs.length) {
    return JSON.stringify(dlgs.map(d => extractContainer(d, 'dialog')));
  }
  const drawer = document.querySelector('.yh-drawer__container:not([style*="display: none"]), .el-drawer__container');
  if (drawer) return JSON.stringify([extractContainer(drawer, 'drawer')]);
  const pop = document.querySelector('.yh-dropdown-menu, .el-dropdown-menu, .yh-select-dropdown, .yh-popover, .el-popover');
  const main = document.querySelector('.app-main') || document.body;
  if (pop && vis(pop)) {
    const items = [];
    pop.querySelectorAll('.yh-dropdown-menu__item, .el-dropdown-menu__item, .yh-select-dropdown__item, .el-select-dropdown__item').forEach(i => { if (vis(i)) { const v = clean(i.innerText); if (v && !items.includes(v)) items.push(v); } });
    if (items.length) return JSON.stringify([{ kind: 'popup', title: '下拉/弹出菜单', items, fieldCount: 0 }]);
  }
  if (main) {
    const fields = [];
    const seen = new Set();
    main.querySelectorAll('.yh-form-item, .el-form-item').forEach(item => {
      if (!vis(item)) return;
      const f = fieldInfo(item);
      if (!f.label) return;
      const key = f.label + '|' + f.type;
      if (seen.has(key)) return;
      seen.add(key);
      fields.push(f);
    });
    const tabs = [];
    main.querySelectorAll('.yh-tabs__item, .el-tabs__item').forEach(t => { if (vis(t)) { const v = clean(t.innerText); if (v && v.length <= 25 && !tabs.includes(v)) tabs.push(v); } });
    const steps = [];
    main.querySelectorAll('.yh-step__title, .el-step__title, .yh-steps .step-text').forEach(s => { if (vis(s)) { const v = clean(s.innerText); if (v && v.length <= 20 && !steps.includes(v)) steps.push(v); } });
    const sections = [];
    main.querySelectorAll('.yh-divider__text, .el-divider__text, .yh-collapse-item__header, .el-collapse-item__header, .form-title, .page-title, .yh-card__header, .el-card__header').forEach(s => { if (vis(s)) { const v = clean(s.innerText); if (v && v.length <= 30 && !sections.includes(v)) sections.push(v); } });
    const pageBtns = [];
    main.querySelectorAll('button').forEach(b => { if (vis(b)) { const v = clean(b.innerText); if (v && v.length <= 12 && !pageBtns.includes(v)) pageBtns.push(v); } });
    return JSON.stringify([{ kind: 'page', title: document.title + ' | ' + location.hash, tabs, steps, sections, pageBtns, fields, fieldCount: fields.length }]);
  }
  return JSON.stringify([{ kind: 'none', title: '', fieldCount: 0 }]);
})()
