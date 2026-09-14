const fs = require('fs');
const f = process.argv[2];
const d = JSON.parse(fs.readFileSync(f, 'utf8'));
(d.tabs || []).forEach(tb => {
  const s = (tb.state || [])[0] || {};
  console.log('==== tab:', tb.name, '| click:', tb.click, '====');
  console.log(' kind:', s.kind, '| fieldCount:', s.fieldCount, '| title:', (s.title || '').slice(0, 60));
  console.log(' tabs:', JSON.stringify(s.tabs || []));
  console.log(' sections:', JSON.stringify(s.sections || []));
  console.log(' tables:', JSON.stringify(s.tables || []).slice(0, 600));
  console.log(' bodyBtns:', JSON.stringify(s.bodyButtons || []));
  console.log(' footerBtns:', JSON.stringify(s.footerButtons || []));
  console.log(' pageBtns:', JSON.stringify((s.pageBtns || []).slice(0, 20)));
  console.log(' descriptions:', JSON.stringify((s.descriptions || []).slice(0, 25)));
  console.log(' field labels:', JSON.stringify((s.fields || []).map(x => x.label)).slice(0, 900));
});
(d.subForms || []).forEach(sf => {
  const s = (sf.state || [])[0] || {};
  console.log('==== SUBFORM:', sf.tab, '>', sf.btn, '====');
  console.log(' kind:', s.kind, '| title:', s.title, '| fieldCount:', s.fieldCount);
  console.log(' fields:', JSON.stringify((s.fields || []).map(x => x.label + '(' + x.type + ')')).slice(0, 900));
});
(d.notes || []).forEach(n => console.log('note:', n));
