# 🟣 [Tier-2 · 核心图谱] we-markdown 全系统功能图谱 (Feature Map)

> 🛡️ **重要程度：Tier-2（核心功能图谱 · 架构与测试基线）**  
> **设计思想**：源自 Lauren Tan 编译器级 Agent 工程学规范。建立 **User POV ➔ Agent Drive ➔ Observable State** 三维刚性契约。

---

## 🗺️ 核心功能三维锚定矩阵 (Core Feature Matrix)

### 1. 核心业务主入口 (`src/index.js`)

- **User POV (用户入口)**:
  - 用户调用主要 API 或通过命令行/UI 触发入口动作。
- **Agent Drive (机器驱动 API)**:
  - `main()` 或核心导出的主函数接口。
- **Observable State (物理可观测证明状态)**:
  - 主入口导出类型完整，执行返回状态码为 0 或有效数据对象。

### 2. Darktu 极客专属主题 (`darktu-cyber`)

- **User POV (用户视角)**:
  - 用户在主题面板中点击「Darktu 极客」，编辑器与预览实时呈现高质感黑曜石科技排版与电光紫/青微光样式。
- **Agent Drive (机器驱动)**:
  - `builtInThemes` 列表中注册 `darktu-cyber`，通过 `ThemeProcessor.processHtml(html, css)` 进行内联编译。
- **Observable State (物理可观测)**:
  - `@we-markdown/core/themes/darktu-cyber` 样式导出正常，富文本中生成包含 `#6366f1` / `#06b6d4` 的内联样式，深色模式转换安全通过。

### 3. Darktu 官网快捷通道 (`darktu-portal-btn`)

- **User POV (用户视角)**:
  - 用户在顶部标题栏或浮动工具栏点击「Darktu 官网」，新标签页秒开直达 `https://darktu.com` 主站。
- **Agent Drive (机器驱动)**:
  - Header 组件渲染带 `Sparkles` 图标的 `.darktu-portal-btn`，并绑定外部导航。
- **Observable State (物理可观测)**:
  - DOM 树中存在目标链接且具有 `noopener noreferrer` 安全属性。

### 4. 自媒体内联排版组件库 (`creator-typography-snippets`)

- **User POV (用户视角)**:
  - 用户在编辑器工具栏点击「排版组件」按钮（Sparkles 图标），唤起组件选择器（支持实景视觉渲染预览与紧凑列表一键切换，包含灵感提示、杂志金句、步骤清单、核心对比、作者名片、双图并排、三图画廊 7 款精选模板），点击即插入光标处；真实效果一目了然，复制到微信公众号后台完美保全样式；
  - 无论在桌面分栏宽度如何变化，弹窗均能动态自适应居中夹紧，杜绝右侧与底部截断；移动端提供全屏浮层响应与底部快捷菜单一键直达。
- **Agent Drive (机器驱动)**:
  - `CREATOR_SNIPPET_TEMPLATES` 导出高质感、自包含内联 CSS 组件，`ComponentPickerPopover` 提供动态边界约束夹紧（`clampedGlobalLeft` 与自适应高度）、真实渲染视窗、视图模式切换、分类过滤、Esc 键与移动端事件响应。
- **Observable State (物理可观测)**:
  - `apps/web/src/__tests__/components/snippetTemplates.test.ts` 与 `ComponentPickerPopover.test.tsx` 100% 全绿，组件弹窗支持 `.component-card-preview` 真实渲染视窗与 `.preview-toggle-btn` 模式切换；CSS 具备移动端适配与容器溢出防护；插入的 HTML 均由 `<section style="...">` 封装且具备 `box-sizing: border-box`，不含任何外部 JavaScript 或侵入式外部依赖。

### 5. 盘古中英文排版美化与实时阅读时长统计 (`pangu-formatter-and-reading-stats`)

- **User POV (用户视角)**:
  - 用户在编辑器工具栏点击「排版美化」按钮（Wand2 魔法棒图标），可一键对全文或当前高亮选中区域执行盘古规范排版美化（在中英文、数字、符号之间智能安全插入空格）；
  - 编辑器底部状态栏实时显示当前文章的「行数」、「字数」、「字符(不含空格)」以及基于公众号常规阅读速率换算的「预计阅读时长」（如 `预计阅读: 约 3 分钟`）。
- **Agent Drive (机器驱动)**:
  - `formatPanguMarkdown` 执行严格的 Token 暂存保护机制（全面隔离多行代码块、行内代码、LaTeX 块/行内数学公式、HTML 标签及 Markdown 链接/图片目标），通过 CodeMirror 6 事务原子分发，原生保留撤销重做（Ctrl+Z）历史栈；
  - `getArticleStats` 提供纯文本解析与多维字数指标计算。
- **Observable State (物理可观测)**:
  - `apps/web/src/__tests__/utils/panguFormatter.test.ts` 与 `apps/web/src/__tests__/utils/wordCount.test.ts` 均通过回归测试；工具栏渲染含 `Wand2` 的美化按钮，底部状态栏包含 `.editor-stat-reading` 元素。

### 6. 微信内容合规自检与多图画廊排版 (`content-compliance-and-image-grid`)

- **User POV (用户视角)**:
  - 用户在编辑器工具栏点击「合规体检」盾牌图标按钮，展开纯本地轻量悬浮卡片，一键毫秒级检测广告法极限词（如“顶级”、“最佳”、“最先进”）、虚假夸大承诺与平台诱导词，并支持一键替换为合规推荐词；若文章无违规，显示安全绿色徽章；
  - 用户在「自媒体排版组件」菜单中可一键插入「双图并排对比」与「三图画廊组合」，自动生成兼顾移动端适配与公众号后台内联 CSS 的优雅多图网格。
- **Agent Drive (机器驱动)**:
  - `checkCompliance` 自动遮盖屏蔽代码块与公式，执行纯本地安全正则比对并精准定位字符坐标；
  - `CREATOR_SNIPPET_TEMPLATES` 导出高质感 `dual-image-grid` 与 `trio-image-grid` 内联 HTML。
- **Observable State (物理可观测)**:
  - `apps/web/src/__tests__/services/complianceChecker.test.ts` 与 `apps/web/src/__tests__/components/snippetTemplates.test.ts` 全部通过；工具栏渲染 `ComplianceCheckPopover`。

### 7. 多平台复制分发与高清长图海报导出 (`multi-channel-copy-and-card-export`)

- **User POV (用户视角)**:
  - 顶部导航栏提供智能分发组合按钮：点击主按钮一键复制到微信公众号，展开微型下拉菜单可分发至知乎专栏、掘金社区、纯净 Markdown，或呼出「导出高清海报与卡片」；
  - 海报模态框支持小红书 3:4 比例卡片、长图海报、金句微卡等 3 种格式，实时切换 4 款主题配色并一键下载 2x/3x Retina 高清 PNG 或复制到剪贴板。
- **Agent Drive (机器驱动)**:
  - `dispatchCopy` 执行目标平台专用清洗与剪贴板写入；`cardImageExporter` 执行纯前端 SVG/Canvas 光栅化渲染。
- **Observable State (物理可观测)**:
  - `apps/web/src/__tests__/services/copyDispatcher.test.ts`、`cardImageExporter.test.ts` 与 `CopyDropdown.test.tsx` 100% 全绿；Header 渲染 `CopyDropdown`。

### 8. 文档历史版本时间胶囊与可视化 Diff 对比 (`history-diff-time-capsule`)

- **User POV (用户视角)**:
  - 用户在历史记录面板（IndexedDB / 本地文件）中点击任一快照的菜单选项「对比版本差异」，呼出全屏/半屏红绿双栏差异对比视窗；
  - 清晰呈现被删改红底字符与新增绿底字符，展示新增/修改行数统计，并支持一键安全还原（还原前自动暂存当前草稿）。
- **Agent Drive (机器驱动)**:
  - `computeTextDiff` LCS 差异引擎输出精确的 `added` / `removed` / `unchanged` 行流。
- **Observable State (物理可观测)**:
  - `apps/web/src/__tests__/services/diffEngine.test.ts` 与 `HistoryDiffModal.test.tsx` 100% 全绿通过。

### 9. 彭博特稿与东方青黛高级自媒体主题 (`bloomberg-and-oriental-themes`)

- **User POV (用户视角)**:
  - 用户在主题管理面板或快捷菜单中可一键选用「彭博特稿」（权威双横线大标、沉稳炭黑与暗金眉题）与「东方青黛」（水墨云纹居中大标、青黛朱砂古典配色与宣纸雅白题跋）。
- **Agent Drive (机器驱动)**:
  - `@we-markdown/core` 导出 `bloombergEditorialTheme` 与 `orientalInkTheme`，并在 `builtInThemes` 中注册。
- **Observable State (物理可观测)**:
  - `packages/core/src/__tests__/themes/newThemes.test.ts` 100% 全绿通过。

### 10. 纯前端轻量化 AI 创作副驾驶 (`byok-ai-copilot`)

- **User POV (用户视角)**:
  - 用户在编辑器工具栏点击「AI 创作副驾驶」按钮（或使用快捷键 `Alt+A`），展开轻量微型悬浮面板；支持 `Escape` 键极速退出；
  - **爆款标题工坊**：一键生成 5~8 组涵盖悬念、反常识、干货清单、痛点共鸣与金句沉淀的自媒体爆款标题，支持一键设为主标题；
  - **内容润色去 AI 味**：对全文或选中文本执行自然流畅 (去 AI 味)、自媒体爆款网感、严谨学术深度与极简凝练等多维度调优；
  - **摘要金句与海报联动**：提炼 150 字精华导读与穿透力金句，支持一键做成小红书 3:4 卡片或金句微卡（直通 `CardImageExportModal`，自动关闭主浮层并将模态框以 `createPortal` 独立挂载至顶层）；
  - **BYOK 隐私安全**：本地配置 DeepSeek / 硅基流动 / OpenAI / Claude API Key 与 BaseURL，AES-256 加密持久化存储，绝不上报第三方服务器；关闭浮层时主动中断请求节约配额。
- **Agent Drive (机器驱动)**:
  - `aiConfig.ts` 负责凭证加密持久化与服务商预置；`aiService.ts` 统一调度 OpenAI 兼容与 Claude 规范，并执行结构化 JSON 提取与容错降级；`AICopilotPopover.tsx` 提供动态视口夹紧（`clampedGlobalLeft`）、CodeMirror 原子事务替换与 Esc 响应。
- **Observable State (物理可观测)**:
  - `apps/web/src/__tests__/services/aiConfig.test.ts`、`apps/web/src/__tests__/services/aiService.test.ts` 与 `apps/web/src/__tests__/components/AICopilotPopover.test.tsx` 100% 全绿通过；工具栏渲染 `.ai-copilot-trigger-btn` 且支持全局 `wemd-open-ai-copilot` 事件。

### 11. PWA 原生离线应用与移动端触控优化 (`pwa-offline-and-mobile-touch`)

- **User POV (用户视角)**:
  - 用户在移动端设备（屏幕宽度 < 768px）可使用平滑左右滑屏手势（向左轻滑切至预览，向右轻滑切至编辑）或底部 Tab 栏顺畅切换；
  - 具备文本编辑与交互防冲突保护：在编辑器文字选区、拖拽光标或浏览宽代码块/表格时，自动豁免滑动手势，防止意外切屏；
  - 在 Chrome / Safari / Edge 浏览器中支持点击「添加到桌面」，即可作为独立原生 Web 应用离线脱机运行，无网环境下照常排版写作与本地暂存；底部更多菜单支持一键呼出排版组件库。
- **Agent Drive (机器驱动)**:
  - `public/manifest.webmanifest` 声明应用独立窗口标识与操作快捷方式；`public/sw.js` 部署 Cache-First 离线缓存拦截策略；`pwaService.ts` 接管 Service Worker 注册、更新检测与安装事件分发；`App.tsx` 实现基于位移矢量与 DOM 目标排查的触控滑屏响应。
- **Observable State (物理可观测)**:
  - `apps/web/src/__tests__/services/pwaService.test.ts` 100% 全绿通过；`sw.js` 与 `manifest.webmanifest` 资源就绪；`App.css` 包含移动端 `@keyframes mobilePaneFadeIn` 与手势触控样式。

---

## 🛠️ 机械校验指令 (Verification Command)

```bash
node test/verify_feature_map.js
```
