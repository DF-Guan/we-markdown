# 🟣 [Tier-2 · 核心图谱] we-markdown 全系统功能图谱 (Feature Map)

> 🛡️ **重要程度：Tier-2（核心功能图谱 · 架构与测试基线）**  
> **设计思想**：源自 Lauren Tan 编译器级 Agent 工程学规范。建立 **User POV ➔ Agent Drive ➔ Observable State** 三维刚性契约。

---

## 🗺️ 核心功能三维锚定矩阵 (Core Feature Matrix)

### 1. 核心业务主入口 (`src/index.js`)
* **User POV (用户入口)**:
  - 用户调用主要 API 或通过命令行/UI 触发入口动作。
* **Agent Drive (机器驱动 API)**:
  - `main()` 或核心导出的主函数接口。
* **Observable State (物理可观测证明状态)**:
  - 主入口导出类型完整，执行返回状态码为 0 或有效数据对象。

---

## 🛠️ 机械校验指令 (Verification Command)
```bash
node test/verify_feature_map.js
```
