/**
 * 纯前端高保真长图与卡片导出引擎 (cardImageExporter.ts)
 * 支持 2x/3x Retina 视网膜高清离线光栅化导出为 PNG
 */

export type CardFormat = "card" | "poster" | "quote";
export type CardBackgroundTheme =
  | "classic-white"
  | "dark-slate"
  | "sunset"
  | "mint";

export interface CardExportOptions {
  markdown: string;
  renderedHtml: string;
  format?: CardFormat;
  theme?: CardBackgroundTheme;
  authorName?: string;
  showWatermark?: boolean;
  scale?: number;
  customContent?: string;
}

export interface CardThemeConfig {
  id: CardBackgroundTheme;
  name: string;
  bg: string;
  text: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
}

export const CARD_THEMES: Record<CardBackgroundTheme, CardThemeConfig> = {
  "classic-white": {
    id: "classic-white",
    name: "雅白经典",
    bg: "#f8fafc",
    text: "#0f172a",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    accent: "#07c160",
  },
  "dark-slate": {
    id: "dark-slate",
    name: "黑曜科技",
    bg: "#09090b",
    text: "#f8fafc",
    cardBg: "#18181b",
    cardBorder: "#27272a",
    accent: "#6366f1",
  },
  sunset: {
    id: "sunset",
    name: "落日余晖",
    bg: "linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)",
    text: "#1e293b",
    cardBg: "rgba(255, 255, 255, 0.92)",
    cardBorder: "rgba(255, 255, 255, 0.8)",
    accent: "#f97316",
  },
  mint: {
    id: "mint",
    name: "薄荷轻柔",
    bg: "linear-gradient(135deg, #e0f2fe 0%, #dcfce7 100%)",
    text: "#1e293b",
    cardBg: "rgba(255, 255, 255, 0.95)",
    cardBorder: "rgba(255, 255, 255, 0.9)",
    accent: "#10b981",
  },
};

/**
 * 提取文章主标题与纯文本摘要
 */
export function extractArticleMeta(markdown: string) {
  const lines = markdown.split("\n");
  let title = "WeMarkdown 随笔";
  const bodyLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ") && title === "WeMarkdown 随笔") {
      title = trimmed.replace(/^#\s+/, "");
    } else if (trimmed) {
      bodyLines.push(trimmed.replace(/^#+\s+/, "").replace(/[*`_~]/g, ""));
    }
  }

  const excerpt =
    bodyLines.slice(0, 5).join(" ").slice(0, 160) ||
    "专注深度思考与高质量排版写作。";
  return { title, excerpt };
}

/**
 * 转义 XML/SVG 特殊字符
 */
export function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * 清洗并补全 HTML 使其符合 XHTML/XML 解析规范（SVG ForeignObject 必备）
 */
export function sanitizeHtmlForXml(html: string): string {
  if (!html) return "";
  // 1. 将非自闭合的 HTML void 标签转换为 XHTML 自闭合形式 (<hr>, <br>, <img> 等)
  let xml = html.replace(
    /<(img|br|hr|input|source|wbr)([^>]*?)>/gi,
    (match, tag, rest) => {
      const trimmedRest = rest.trimEnd();
      return trimmedRest.endsWith("/") ? match : `<${tag}${rest} />`;
    },
  );
  // 2. 将非实体引用的裸 & 转换为 &amp;
  xml = xml.replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;");
  return xml;
}

/**
 * 构建用于 SVG ForeignObject 的独立自包含 HTML 片段
 */
export function buildCardMarkup(options: CardExportOptions): {
  html: string;
  width: number;
  minHeight: number;
} {
  const format = options.format || "card";
  const themeKey = options.theme || "classic-white";
  const theme = CARD_THEMES[themeKey] || CARD_THEMES["classic-white"];
  const authorName = options.authorName || "WeMarkdown 创作者";
  const showWatermark = options.showWatermark !== false;
  const { title } = extractArticleMeta(options.markdown);

  const width = format === "quote" ? 640 : format === "card" ? 720 : 800;
  const minHeight = format === "card" ? 960 : 480;

  const rawContentHtml =
    options.customContent && options.customContent.trim()
      ? `<div style="font-size: 18px; line-height: 1.85; color: ${theme.text}; font-weight: 500; padding: 12px 0;">${options.customContent}</div>`
      : options.renderedHtml && options.renderedHtml.trim()
        ? options.renderedHtml
        : `<p style="font-size: 16px; line-height: 1.8; color: ${theme.text};">${extractArticleMeta(options.markdown).excerpt}</p>`;

  const safeTitle = escapeXml(title);
  const safeAuthorName = escapeXml(authorName);
  const safeContentHtml = sanitizeHtmlForXml(rawContentHtml);

  const html = `
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      width: ${width}px;
      min-height: ${minHeight}px;
      padding: 40px;
      box-sizing: border-box;
      background: ${theme.bg};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    ">
      <div style="
        background: ${theme.cardBg};
        border: 1px solid ${theme.cardBorder};
        border-radius: 16px;
        padding: 36px 32px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
        box-sizing: border-box;
        flex: 1;
        display: flex;
        flex-direction: column;
      ">
        <!-- 头部作者信息栏 -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid ${theme.cardBorder};">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${theme.accent}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: bold;">
              ✍️
            </div>
            <span style="font-size: 14px; font-weight: 600; color: ${theme.text};">${safeAuthorName}</span>
          </div>
          <span style="font-size: 12px; color: #888888;">${new Date().toLocaleDateString("zh-CN")}</span>
        </div>

        <!-- 标题 -->
        <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: ${theme.text}; line-height: 1.4;">
          ${safeTitle}
        </h1>

        <!-- 正文内容渲染 -->
        <div style="font-size: 15px; line-height: 1.8; color: ${theme.text}; flex: 1;">
          ${safeContentHtml}
        </div>

        <!-- 底部水印声明 -->
        ${
          showWatermark
            ? `
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed ${theme.cardBorder}; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #888888;">
            <span>排版引擎 · WeMarkdown</span>
            <span>✨ 沉浸式极简排版</span>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `.trim();

  return { html, width, minHeight };
}

/**
 * 渲染卡片为 HTML Canvas 元素
 */
export async function renderCardToCanvas(
  options: CardExportOptions,
): Promise<HTMLCanvasElement> {
  const { html, width, minHeight } = buildCardMarkup(options);
  const scale = options.scale || 2; // 默认 2x 视网膜高清

  const svgXml = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${minHeight}">
      <foreignObject width="100%" height="100%">
        ${html}
      </foreignObject>
    </svg>
  `.trim();

  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = (img.naturalHeight || minHeight) * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("无法创建 Canvas 2D 上下文"));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, img.naturalHeight || minHeight);
      resolve(canvas);
    };
    img.onerror = (e) => {
      reject(new Error("卡片 SVG 光栅化失败: " + String(e)));
    };
    img.src = svgUrl;
  });
}

/**
 * 渲染卡片为 PNG Data URL
 */
export async function renderCardToDataUrl(
  options: CardExportOptions,
): Promise<string> {
  const canvas = await renderCardToCanvas(options);
  return canvas.toDataURL("image/png");
}

/**
 * 渲染卡片为 Blob
 */
export async function renderCardToBlob(
  options: CardExportOptions,
): Promise<Blob> {
  const canvas = await renderCardToCanvas(options);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas 转 Blob 失败"));
      }
    }, "image/png");
  });
}

/**
 * 触发本地文件下载
 */
export async function downloadCardImage(
  options: CardExportOptions,
  filename = "wemarkdown-card.png",
): Promise<void> {
  const dataUrl = await renderCardToDataUrl(options);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
