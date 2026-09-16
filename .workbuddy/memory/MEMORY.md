# 项目长期备忘

## 原型设计（01-公共卫生服务系统产品文档/V1.0/02.需求设计/原型设计/）
- **index.html = 系统框架壳子**：顶栏 + 左侧菜单（框架.js 注入）+ 动态标签栏 + iframe 内容区；点击左侧菜单在右侧装载页面；默认落地页「脱敏设置」（初始化项 key 硬编码为 `tuomin`）。
- **业务页面双模式约定**：页面引入 框架.css/框架.js 时传 `data-page="key" data-embed="auto"`——独立打开带完整框架；被壳子内嵌（URL 带 ?embed=1 或处于 iframe 中）时自动进入嵌入模式（html.embed-mode），只渲染内容区，不注入顶栏/侧栏/标签栏。
- **框架.js 导出**：`MENU_CONFIG / findMenuItem / setMenuActive / FRAME_DIR` 供壳子使用；壳子以 `data-shell="true"` 声明，菜单点击转交 `window.shellOpen(key)`。
- **新增页面流程**：写好页面 HTML（按双模式约定引入框架）→ 在 框架.js MENU 中配置 url → 壳子即可装载；无 url 的菜单项显示「功能建设中」占位页。场景配置/概况视图配置的 url 已摘除（页面未就位），就位后补回。
- **已就位页面**：脱敏规则.html（系统管理/脱敏设置，key `tuomin`）、居民档案列表.html（档案管理/居民档案，key `resident-archives`；分组 key 已由遗留的 `statistics` 改为 `archives`；页面含筛选/15列表格/重点人群绿色徽标/操作下拉/分页，20 行自洽模拟数据）。
- **框架.css**：设计 token 与公共组件样式（主色 #007AFF）；页面特有样式写在各页 `<style>`。
- 每个 URL 标签页一个独立 iframe：切换标签保留各页状态，关闭标签销毁对应 iframe。
- **浏览器验证环境经验**：agent-browser 需 PowerShell 直调 node + 其 bin/agent-browser.js（bash shim 损坏）；PowerShell 传参会剥引号 → eval JS 代码内禁用引号字符；`click text X` 无效、`find text X click` 有效；展开分组后立即点子项会落在 250ms 展开动画内无效，验证装载用 `eval window.shellOpen(k)` 直调绕过；`*>` 重定向文件为 UTF-16 需转码后 Read。
