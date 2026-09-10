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
  - 用户在编辑器工具栏点击「排版组件」按钮（Sparkles 图标），唤起轻量组件选择器（含灵感提示、杂志金句、步骤清单、核心对比、作者名片 5 款精选模板），点击即插入光标处；复制到微信公众号后台完美保全样式。
- **Agent Drive (机器驱动)**:
  - `CREATOR_SNIPPET_TEMPLATES` 导出高质感、自包含内联 CSS 组件，`ComponentPickerPopover` 提供分类过滤、无障碍键盘响应与平滑交互。
- **Observable State (物理可观测)**:
  - `apps/web/src/__tests__/components/snippetTemplates.test.ts` 100% 全绿，插入的 HTML 均由 `<section style="...">` 封装且具备 `box-sizing: border-box`，不含任何外部 JavaScript 或侵入式外部依赖。

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

---

## 🛠️ 机械校验指令 (Verification Command)

```bash
node test/verify_feature_map.js
```
