const main = document.querySelector('.app-main');
if (!main) return JSON.stringify({error: 'no app-main'});
const vis = (el) => el.offsetWidth > 0 || el.offsetHeight > 0;
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
let title = '';
const ht = main.querySelector('.header-title');
if (ht) title = clean(ht.innerText);
if (!title) {
  const bc = main.querySelector('.yh-breadcrumb, .el-breadcrumb, .breadcrumb');
  if (bc) title = clean(bc.innerText);
}
if (!title) {
  const h = main.querySelector('h1, h2, h3');
  if (h) title = clean(h.innerText);
}
const tabs = [];
main.querySelectorAll('.yh-tabs__item, .el-tabs__item').forEach(t => { const v = clean(t.innerText); if (v && v.length <= 20 && !tabs.includes(v)) tabs.push(v); });
const labels = [];
main.querySelectorAll('.yh-form-item__label, .el-form-item__label').forEach(l => { if (!vis(l)) return; const v = clean(l.innerText).replace(/[:：]$/, ''); if (v && v.length <= 20 && !labels.includes(v)) labels.push(v); });
const phs = [];
main.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(i => { if (!vis(i)) return; const p = clean(i.placeholder); if (p && p.length <= 30 && !phs.includes(p)) phs.push(p); });
const btns = [];
main.querySelectorAll('button').forEach(b => { if (!vis(b)) return; const v = clean(b.innerText); if (v && v.length <= 12 && !btns.includes(v)) btns.push(v); });
const rowActs = [];
main.querySelectorAll('table a, .cell a').forEach(a => { if (!vis(a)) return; const v = clean(a.innerText); if (v && v.length <= 8 && !rowActs.includes(v)) rowActs.push(v); });
const tables = [];
const seen = new Set();
main.querySelectorAll('table').forEach(tb => {
  const ths = [];
  tb.querySelectorAll('th').forEach(th => { const v = clean(th.innerText); if (v && v.length <= 25 && !ths.includes(v)) ths.push(v); });
  if (!ths.length) return;
  let tab = '';
  const panel = tb.closest('[role=tabpanel]');
  if (panel && panel.id) {
    const tid = panel.id.replace(/^pane-/, '');
    const item = main.querySelector('[aria-controls="' + panel.id + '"], [aria-controls="' + tid + '"]');
    if (item) tab = clean(item.innerText);
  }
  const key = tab + '|' + ths.join(',');
  if (seen.has(key)) return;
  seen.add(key);
  tables.push({tab, columns: ths});
});
const allCols = [];
tables.forEach(t => t.columns.forEach(c => { if (!allCols.includes(c)) allCols.push(c); }));
return JSON.stringify({title, tabs, queryFields: labels, placeholders: phs, buttons: btns, rowActions: rowActs, tables, tableColumns: allCols});
