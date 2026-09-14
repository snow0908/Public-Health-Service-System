const fs = require('fs');
const h = fs.readFileSync('d:/AI_Project/Public-Health-Service-System/_tmp_traversal/业务流程说明-20260908.html', 'utf8');
// 去掉style/script/svg，转文本
let t = h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '[SVG图]');
t = t.replace(/<\/(h[1-6]|p|tr|li|div)>/g, '\n').replace(/<br\s*\/?>/g, '\n').replace(/<\/(td|th)>/g, ' | ');
t = t.replace(/<[^>]+>/g, '');
t = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
t = t.split('\n').map(l => l.trim()).filter(l => l).join('\n');
fs.writeFileSync('d:/AI_Project/Public-Health-Service-System/_tmp_traversal/业务流程说明-文本版.txt', t, 'utf8');
console.log('text lines:', t.split('\n').length, 'chars:', t.length);
