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

### 2. 暗图极客专属主题 (`darktu-cyber`)

- **User POV (用户视角)**:
  - 用户在主题面板中点击「暗图极客」，编辑器与预览实时呈现高质感黑曜石科技排版与电光紫/青微光样式。
- **Agent Drive (机器驱动)**:
  - `builtInThemes` 列表中注册 `darktu-cyber`，通过 `ThemeProcessor.processHtml(html, css)` 进行内联编译。
- **Observable State (物理可观测)**:
  - `@we-markdown/core/themes/darktu-cyber` 样式导出正常，富文本中生成包含 `#6366f1` / `#06b6d4` 的内联样式，深色模式转换安全通过。

### 3. 暗图生态矩阵快捷通道 (`darktu-portal-btn`)

- **User POV (用户视角)**:
  - 用户在顶部标题栏或浮动工具栏点击「暗图生态」，新标签页秒开直达 `https://darktu.com` 主站。
- **Agent Drive (机器驱动)**:
  - Header 组件渲染带 `Sparkles` 图标的 `.darktu-portal-btn`，并绑定外部导航。
- **Observable State (物理可观测)**:
  - DOM 树中存在目标链接且具有 `noopener noreferrer` 安全属性。

---

## 🛠️ 机械校验指令 (Verification Command)

```bash
node test/verify_feature_map.js
```
