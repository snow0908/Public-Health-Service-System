const fs = require('fs');
const h = fs.readFileSync('d:/AI_Project/Public-Health-Service-System/_tmp_traversal/业务流程说明-20260908.html', 'utf8');
// 提取标题层级
const titles = [...h.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map(m => {
  const level = +m[1];
  const text = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return '  '.repeat(level - 1) + 'H' + level + ' ' + text;
});
console.log('== titles ==');
console.log(titles.join('\n'));
console.log('\n== stats ==');
console.log('tables:', (h.match(/<table/g) || []).length);
console.log('total size KB:', (h.length / 1024).toFixed(1));
// 是否有标题以外结构化数据如表格行数
const rows = (h.match(/<tr/g) || []).length;
console.log('table rows:', rows);
