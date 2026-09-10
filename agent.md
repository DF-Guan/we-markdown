# 🟣 [Tier-2 · 子项目核心契约] we-markdown (子 Agent 行为守则与架构基线)

> 🛡️ **重要程度：Tier-2（子项目核心契约 · 专属业务基线）**  
> **适用范围**：仅限 `projects/we-markdown/` 目录下的所有业务开发、UI 重构与测试执行。  
> **纯洁性铁律**：本文件为顶层设计契约，严格禁止追加过程审计日志或临时流水。

---

## 1. 项目目标 (Project Goals)

- **项目代号**: we-markdown
- **品牌名称**: WeMarkdown
- **主站生态**: Darktu (https://darktu.com)
- **独立子域名**: `md.darktu.com`
- **核心定位**: 专为微信公众号创作者打造的优雅、轻量、本地优先的 Markdown 排版与富文本一键复制工具。
- **交付目标**: 打造极致排版预览、深色模式保全转换、十余套精美主题、与 Darktu 图片生态深度联动的自媒体图文生产力神器。

---

## 2. 技术栈与架构 (Tech Stack & Architecture)

遵循 **Dune 5 大架构公理**（单点写入、隔离扩展、机械报错），全项目严格划分为解耦模块：

1. `src/index.js`: 轻量入口控制器（行数 <= 250 行）；
2. `src/services/`: 业务领域独立 Service，新功能以独立文件隔离扩展；
3. `src/utils/`: 纯函数通用工具库；
4. `test/`: 包含 Feature Map、Dune AST 拦截器与可逆性门禁的三大测试套件。

---

## 3. 运行与测试指令 (Runbook & Commands)

- **全量自动化测试**: `npm test`
- **功能图谱校验**: `node test/verify_feature_map.js`
- **Dune 架构 AST 扫描**: `node test/verify_dune_architecture.js`
- **可逆性红线门禁**: `node test/verify_reversibility_gate.js`

---

## 4. 专属开发规则与约束 (Project Rules & Constraints)

1. **Feature Map 三维对齐**: 所有功能变更必须与 `docs/feature_map.md` 的可观测状态（Observable States）100% 对齐，杜绝代码漂移；
2. **状态单点写入契约**: 持久化状态与快照仅限指定 Service 写入，严禁多处并发篡改；
3. **子项目物理隔离**: 临时测试脚本放入 `scratch/`，快照存放在 `docs/snapshots/`，严禁污染工作区根目录；
4. **可逆性审批红线**: 本地开发全自主；不可逆发布必须携带用户显式授权；
5. **双轨分支隔离铁律**: `main` 分支作为日常草稿箱（Preview 预览），`release` 分支作为正式定稿箱（绑定 `md.darktu.com`），严防 Cloudflare Pages 误将草稿认作生产。
