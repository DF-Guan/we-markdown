<!-- 🔒 本地私密技术架构档案 · 严禁公网上传 · 严禁发布泄露 -->

# 🟣 [Tier-2 · 深度技术规格] we-markdown 深度技术规格与架构设计 (tech_spec.md)

> 🛡️ **重要程度：Tier-2（深度架构规格 · 核心开发与审计基线）**  
> **关联图谱**：详细三维可观测契约参见 [`docs/feature_map.md`](file:///./feature_map.md)；全局宪法约束参见工作区根目录 [`GEMINI.md`](file:///../../GEMINI.md)。

---

## 📌 一、系统全景架构 (System Architecture)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       1. 表现与入口层 (Presentation/CLI)                 │
│                       • `src/index.js` (轻量装配控制器)                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                       2. 核心业务服务层 (Domain Services)                │
│                       • `src/services/` (独立文件隔离扩展)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                       3. 通用工具与驱动层 (Utils/Drivers)                │
│                       • `src/utils/` (纯函数工具库)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 二、AI 创作副驾驶 (BYOK AI Copilot) 架构设计

### 1. 架构拓扑与隐私安全模型 (Zero-Leakage BYOK Topology)

```mermaid
flowchart LR
    User["创作者 (User)"] --> UI["AICopilotPopover 交互面板"]
    UI --> Service["aiService 统一调度器"]
    Service --> Config["aiConfig 本地凭证中心"]
    Config <--> Storage[("LocalStorage (AES-256 加密)")]

    Service -- "纯前端直连 (Direct Fetch)" --> Endpoints{"主流大模型服务商"}
    Endpoints --> E1["DeepSeek (/v1/chat/completions)"]
    Endpoints --> E2["硅基流动 SiliconFlow (/v1)"]
    Endpoints --> E3["OpenAI (/v1)"]
    Endpoints --> E4["Anthropic Claude (/v1/messages)"]
    Endpoints --> E5["本地 Ollama / LMStudio (/v1)"]
```

- **零数据上云原则**：请求直接从用户本地浏览器发送至对应 LLM 端点，无任何中间服务器，绝对杜绝内容泄露；
- **AES-256 本地加密**：API Key 在写入 `LocalStorage` (`wemd-ai-config`) 前经 AES 混淆加密，避免 XSS 静态明文提取。

### 2. 结构化解析与容错降级状态机

````mermaid
flowchart TD
    Raw["LLM 原始响应字符流"] --> Check{"直接 JSON.parse() ?"}
    Check -- "成功" --> Valid["返回结构化结果 (Titles / Quotes)"]
    Check -- "失败" --> CodeBlock{"从 ```json 代码块提取 ?"}
    CodeBlock -- "成功" --> Valid
    CodeBlock -- "失败" --> Substring{"截取首个 [ / { 与末尾 ?"}
    Substring -- "成功" --> Valid
    Substring -- "失败" --> Fallback["行正则解析降级容错"]
````

---

## 📱 三、PWA 离线运行与移动端触控架构

### 1. Service Worker 离线拦截策略 (Cache-First + SWR)

```mermaid
sequenceDiagram
    participant Browser as 浏览器视窗
    participant SW as Service Worker (sw.js)
    participant Cache as 本地 CacheStorage
    participant Network as 远程网络 / CDN

    Browser->>SW: 资源请求 (Navigation / Assets)
    alt 主页导航请求 (Navigate / text-html)
        SW->>Network: 优先请求远程网络 (Network-First)
        alt 网络正常
            Network-->>SW: 返回最新页面并写入 Cache
            SW-->>Browser: 渲染页面
        else 离线无网
            SW->>Cache: 读取缓存的 index.html
            Cache-->>SW: 返回离线快照
            SW-->>Browser: 零白屏启动
        end
    else 静态资源请求 (JS / CSS / Fonts / WOFF2)
        SW->>Cache: 优先读取本地缓存 (Cache-First)
        Cache-->>SW: 命中即刻返回
        SW-->>Browser: 极速渲染
        SW->>Network: 后台静默重验证 (Stale-While-Revalidate)
    end
```

### 2. 移动端触控滑屏数学判据 (Touch Swipe Vector Equation)

当触控结束时，计算位移向量 $\Delta \mathbf{P} = (\Delta x, \Delta y)$：

$$
\begin{cases}
|\Delta x| \ge 55\text{px} \\
|\Delta x| > 1.5 \times |\Delta y|
\end{cases}
$$

- 当满足上述条件且 $\Delta x < 0$ 时，触发状态迁移：$\text{activeView} \gets \text{'preview'}$；
- 当满足上述条件且 $\Delta x > 0$ 时，触发状态迁移：$\text{activeView} \gets \text{'editor'}$。
