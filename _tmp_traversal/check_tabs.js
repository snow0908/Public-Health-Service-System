const fs = require('fs');
const dir = 'd:/AI_Project/Public-Health-Service-System/_tmp_traversal/results/';
const files = fs.readdirSync(dir).filter(f => f.startsWith('tab_'));
files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(dir + f, 'utf8'));
  console.log('====', d.label, '| scope:', d.scope, '| open:', d.openAction, '| openResult:', d.openResult);
  console.log('  formHash:', d.formHash);
  (d.tabs || []).forEach(tb => {
    const s = tb.state && tb.state[0];
    const info = s ? (s.kind + ' ' + s.fieldCount + 'f title:' + (s.title || '').slice(0, 40)) : '-';
    console.log('  tab:', tb.name, '| click:', tb.click, '|', info);
  });
  (d.subForms || []).forEach(sf => {
    const s = sf.state && sf.state[0];
    console.log('  SUB:', sf.tab, '>', sf.btn, '|', s ? (s.kind + ' ' + (s.title || '') + ' ' + s.fieldCount + 'f') : JSON.stringify(sf.state).slice(0, 80));
  });
  (d.notes || []).forEach(n => console.log('  note:', n));
  if (d.error) console.log('  ERROR:', d.error);
});
