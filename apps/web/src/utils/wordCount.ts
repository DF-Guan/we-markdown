/**
 * 文本字数统计与阅读时长估算工具 (Article Word Count & Reading Time Estimator)
 */

export interface ArticleStats {
  lines: number;
  words: number;
  charsNoSpaces: number;
  readingTimeMinutes: number;
  readingTimeString: string;
}

/**
 * 清除 Markdown 语法标记，提取纯文本内容
 */
export function cleanMarkdownText(markdown: string): string {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  let text = markdown;

  // 移除代码块
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`[^`]+`/g, "");

  // 移除图片
  text = text.replace(/!\[.*?\]\(.*?\)/g, "");

  // 移除链接，保留链接文本
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 移除标题标记
  text = text.replace(/^#{1,6}\s+/gm, "");

  // 移除加粗、斜体、删除线、高亮等格式标记
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/~~(.*?)~~/g, "$1");
  text = text.replace(/==(.*?)==/g, "$1");

  // 移除引用标记
  text = text.replace(/^>\s+/gm, "");

  // 移除列表标记
  text = text.replace(/^[\s]*[-*+]\s+/gm, "");
  text = text.replace(/^[\s]*\d+\.\s+/gm, "");

  // 移除分割线
  text = text.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, "");

  // 移除 HTML 标签
  text = text.replace(/<[^>]+>/g, "");

  // 移除多余空白字符
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * 计算 Markdown 文本的纯文本字数（不包含语法字符）
 */
export function countWords(markdown: string): number {
  const text = cleanMarkdownText(markdown);
  return text.length;
}

/**
 * 计算不计空格与换行的纯字符数
 */
export function countCharsNoSpaces(markdown: string): number {
  const text = cleanMarkdownText(markdown);
  return text.replace(/\s/g, "").length;
}

/**
 * 计算行数
 */
export function countLines(markdown: string): number {
  if (!markdown || markdown.trim() === "") {
    return 0;
  }
  return markdown.split("\n").length;
}

/**
 * 估算阅读时长（分钟）
 * 中文字符常规阅读速度约为 350-400 字/分钟
 */
export function calculateReadingTime(markdown: string): {
  minutes: number;
  text: string;
} {
  const chars = countWords(markdown);
  if (chars === 0) {
    return { minutes: 0, text: "0 分钟" };
  }

  // 计算估算分钟数，不足 1 分钟算 1 分钟
  const minutes = Math.max(1, Math.ceil(chars / 350));
  return {
    minutes,
    text: minutes <= 1 ? "约 1 分钟" : `约 ${minutes} 分钟`,
  };
}

/**
 * 获取文章综合指标数据
 */
export function getArticleStats(markdown: string): ArticleStats {
  const lines = countLines(markdown);
  const words = countWords(markdown);
  const charsNoSpaces = countCharsNoSpaces(markdown);
  const reading = calculateReadingTime(markdown);

  return {
    lines,
    words,
    charsNoSpaces,
    readingTimeMinutes: reading.minutes,
    readingTimeString: reading.text,
  };
}
