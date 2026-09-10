<p align="center">
  <a href="https://md.darktu.com" target="_blank" rel="noopener noreferrer">
    <img src="apps/web/public/logo.png" width="100" height="100" alt="WeMarkdown Logo" style="border-radius: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
  </a>
</p>

<h1 align="center">WeMarkdown</h1>

<p align="center">
  <strong>优雅、极速、本地优先的现代微信公众号 Markdown 排版编辑器</strong>
</p>

<p align="center">
  专为微信自媒体创作者与技术写作者打造。<br>
  Markdown 沉浸写作，一键无损复制到公众号后台。内置微信深色模式色彩语义保全、十余套精美主题与本地优先隐私存储。
</p>

<p align="center">
  <a href="https://md.darktu.com">🌐 立即在线使用</a> •
  <a href="https://github.com/DF-Guan/we-markdown/releases">📦 下载桌面版客户端</a> •
  <a href="https://darktu.com">🚀 Darktu 官网</a> •
  <a href="#-核心技术亮点">💡 核心技术亮点</a> •
  <a href="#-快速上手">⚡ 快速上手</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-07c160?style=flat-square" alt="License: MIT" /></a>
  <a href="https://github.com/DF-Guan/we-markdown/releases"><img src="https://img.shields.io/badge/Version-v1.2.9-6366f1?style=flat-square" alt="Version 1.2.9" /></a>
  <a href="https://darktu.com"><img src="https://img.shields.io/badge/Ecosystem-Darktu-06b6d4?style=flat-square" alt="Darktu Ecosystem" /></a>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Electron-28-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron 28" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20macOS%20%7C%20Windows%20%7C%20Linux-4b5563?style=flat-square" alt="Platforms" />
</p>

---

## 🌟 为什么选择 WeMarkdown？

排版微信公众号文章往往充满痛点：排版格式在微信后台容易错位、深色模式下文字对比度崩塌、第三方排版工具依赖云端账号存在草稿泄露风险。

**WeMarkdown** 提供了一整套专为公众号创作者定制的现代化解决方案：

- 🎯 **一键无损复制**：自研内联 CSS 渲染引擎，排版、间距、字号与段落高度完美适配微信后台富文本标准，粘入即发布。
- 🌙 **微信深色模式真机还原**：市面上首款集成色彩语义保全转换算法的开源编辑器，深色模式渲染还原度高达 **98%+**。
- 🎨 **十余套大师级排版主题**：涵盖简约清爽、**Darktu 极客**、极光玻璃、学术论文、复古衬线等，更支持无代码可视化微调与自由 CSS 定制。
- 🔒 **纯粹本地优先 (Local-First)**：文章草稿全程存储在本地 IndexedDB / 本地文件系统中，无需注册登录，数据完全私密。
- 🖼️ **全功能多图床矩阵**：原生集成七牛云、阿里云 OSS、腾讯云 COS、AWS S3 兼容协议，支持截图粘贴自动压缩与极速上传。
- 📊 **丰富自媒体排版组件**：KaTeX 优雅数学公式、Mermaid 架构图/时序图、Mac 风格三色圆点代码窗口、滑动轮播多图卡片。
- 💻 **全平台自由体验**：浏览器免安装秒开、提供 macOS（Intel / Apple Silicon）、Windows、Linux 原生桌面应用以及 Docker 私有化容器。

---

## ✨ 功能特性矩阵

| 分类         | 特性                 | 详细说明                                                                  |
| :----------- | :------------------- | :------------------------------------------------------------------------ |
| **写作排版** | **标准与扩展语法**   | 完美支持 GFM 规范、多级标题、任务清单、表格、注音与自动生成脚注           |
| **代码表现** | **Mac 风格代码块**   | 内置 Prism / Highlight.js 语法高亮，可选 Mac 经典红黄绿控制台标题栏       |
| **图表公式** | **公式与图表引擎**   | 内置 KaTeX 数学公式（$E=mc^2$）、Mermaid 流程图/甘特图/类图/架构图        |
| **视觉主题** | **主题体系与设计器** | 内置默认主题、Darktu 极客、学术风、极光等十余款主题，提供可视化滑块设计器 |
| **深色适配** | **色彩保全算法**     | 模拟微信官方移动端深色模式滤镜，实时预览深色效果，告别文字发白或变灰      |
| **数据安全** | **多重持久化模式**   | IndexedDB 历史版本回溯 + 文件系统（File System Access API）本地直接保存   |
| **图床管理** | **多云厂商图床**     | 阿里云 OSS、腾讯云 COS、七牛云、S3 兼容协议，支持客户端智能压缩降体积     |
| **交互体验** | **自媒体增强排版**   | 支持横向滑动多图组、Callout 多色提示块（Tip / Note / Warning / Danger）   |

---

## 💡 核心技术亮点

### 微信深色模式色彩语义保全算法

微信移动端在开启深色模式时，会对网页文章执行一套私有的动态色彩反转与滤镜处理。常规排版工具在深色模式下经常出现正文文字看不清、背景色彩脏灰、代码块与边框刺眼等问题。

WeMarkdown 引入了**色彩语义保全与 HSL 空间动态转换算法**：

```
[原始前景色 / 背景色] ➔ [RGB 转 HSL 语义色域] ➔ [色相保全 + 亮度自适应重映射] ➔ [微信深色环境 1:1 仿真]
```

1. **色相无损保全**：维持品牌强调色（如品牌绿、极客蓝、珊瑚橙）的视觉感受，不发生色彩偏位；
2. **文本对比度刚性兜底**：严格遵循 WCAG AA 对比度标准，深色背景下确保字体对比度恒定大于 4.5:1；
3. **元素级分层处理**：针对代码块背景、表格隔行变色、引用块与高亮文本分别匹配对应阶梯的暗色调。

> 源码参考：[`packages/core/src/wechatDarkMode.ts`](packages/core/src/wechatDarkMode.ts)

---

## 🚀 快速上手

### 1. Web 在线使用（推荐）

直接通过浏览器访问官方生产节点，无需安装任何客户端：

👉 **[https://md.darktu.com](https://md.darktu.com)**

_(由 Cloudflare Pages 全球 CDN 加速部署，随时随地打开即用)_

### 2. 原生桌面客户端下载

前往 GitHub [Releases 发行版页面](https://github.com/DF-Guan/we-markdown/releases) 下载最新安装包：

- **macOS**: `WeMarkdown-x.x.x.dmg` (Intel) / `WeMarkdown-x.x.x-arm64.dmg` (Apple Silicon M系列)
- **Windows**: `WeMarkdown-Setup-x.x.x.exe` (支持一键安装或便携免安装)
- **Linux**: `WeMarkdown-x.x.x.AppImage`

> 💡 **系统安全提示**：
>
> - **macOS** 首次打开提示“无法打开，因为无法验证开发者”：请在终端执行 `xattr -cr /Applications/WeMarkdown.app` 或在「系统设置 - 隐私与安全性」中点击「仍要打开」。
> - **Windows** 触发 SmartScreen 拦截：点击「更多信息」→「仍要运行」即可正常启动。

### 3. Docker 私有化部署

如果您希望在企业内网或个人私有 NAS（如绿联云、群晖）中私密托管：

```bash
# 拉取并后台启动容器
docker run -d \
  --name we-markdown \
  -p 8080:80 \
  --restart unless-stopped \
  ghcr.io/df-guan/we-markdown-web:latest
```

启动完成后，直接在局域网浏览器中访问 `http://<NAS-IP>:8080` 即可开始创作。

---

## 🛠️ 本地开发与源码构建

### 环境要求

- **Node.js**: ≥ 18.0.0
- **包管理器**: `pnpm` ≥ 9.0.0 (`npm i -g pnpm`)

### 快速启动

```bash
# 1. 克隆代码仓库
git clone https://github.com/DF-Guan/we-markdown.git
cd we-markdown

# 2. 安装所有工作区依赖
pnpm install

# 3. 启动 Web 开发服务器 (带 HMR 热重载)
pnpm dev:web

# 4. 运行全量自动化测试套件
npm test
```

### 项目构建

```bash
# 编译 Web 生产静态包 (输出至 apps/web/dist)
pnpm --filter @we-markdown/web build

# 打包 Electron 原生桌面应用
pnpm --filter we-markdown-electron run build:mac   # macOS
pnpm --filter we-markdown-electron run build:win   # Windows
pnpm --filter we-markdown-electron run build:linux # Linux
```

---

## 📁 架构与目录结构

```
we-markdown/
├── apps/
│   ├── web/               # React 18 + Vite Web 端主程序
│   │   ├── public/        # Darktu 品牌 Favicon、Logo 与静态资源
│   │   └── src/
│   │       ├── components/# 编辑器、实时预览、主题面板、历史记录组件
│   │       ├── services/  # 剪贴板富文本复制、图床上传、DOM 规范化服务
│   │       └── store/     # 基于 Zustand 的编辑器、主题与 IndexedDB 状态管理
│   ├── electron/          # Electron 28 桌面应用外壳
│   │   ├── assets/        # 桌面端原生应用图标 (icon.ico, icon.png, icon.icns)
│   │   └── src/           # 主进程生命周期与本地工作区原生 IPC 桥接
│   └── server/            # NestJS 可选轻量图片中转后端
├── packages/
│   └── core/              # 跨端核心算法库 (Markdown 编译器、深色模式保全、主题库)
├── templates/             # 预置排版 CSS 样式模板
├── test/                  # 编译器级功能图谱 (Feature Map) 与架构回归测试
└── DEPLOYMENT.md          # 双轨分支运维与 Cloudflare Pages 部署手册
```

---

## 🌐 生态矩阵与友情链接

- **Darktu 官网**: [https://darktu.com](https://darktu.com) — 极客科技与生产力工具矩阵
- **WeMarkdown 线上编辑器**: [https://md.darktu.com](https://md.darktu.com)

---

## 🤝 致谢与致敬

- **微信开源团队**：微信深色模式预览算法深度参考并优化了微信官方开源的 [wechatjs/mp-darkmode](https://github.com/wechatjs/mp-darkmode) 色彩计算模型。
- **CodeMirror** & **KaTeX** & **Mermaid**：为我们提供了坚若磐石的富文本编辑与可视化图表基础设施。

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源授权。
欢迎自由使用、分发、二次开发或用于公众号商业自媒体创作。
