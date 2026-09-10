import { describe, expect, it } from "vitest";
import {
  cleanMarkdownText,
  countWords,
  countLines,
  countCharsNoSpaces,
  calculateReadingTime,
  getArticleStats,
} from "../../utils/wordCount";

describe("wordCount utils", () => {
  it("cleans markdown syntax accurately", () => {
    const md =
      "# 标题1\n\n**加粗内容** 与 *斜体内容*，还有 [链接文字](https://example.com)。";
    const cleaned = cleanMarkdownText(md);
    expect(cleaned).toBe("标题1 加粗内容 与 斜体内容，还有 链接文字。");
  });

  it("calculates lines count correctly", () => {
    expect(countLines("")).toBe(0);
    expect(countLines("   ")).toBe(0);
    expect(countLines("第一行\n第二行\n第三行")).toBe(3);
  });

  it("calculates words and characters without spaces", () => {
    const md = "Hello 世界 123";
    const words = countWords(md);
    const charsNoSpaces = countCharsNoSpaces(md);

    expect(words).toBe(12); // "Hello 世界 123".length === 12
    expect(charsNoSpaces).toBe(10); // "Hello世界123".length === 10
  });

  it("estimates reading time correctly", () => {
    expect(calculateReadingTime("").minutes).toBe(0);
    expect(calculateReadingTime("").text).toBe("0 分钟");

    expect(calculateReadingTime("一段简短的文字").minutes).toBe(1);
    expect(calculateReadingTime("一段简短的文字").text).toBe("约 1 分钟");

    // 700 字应当约为 2 分钟
    const longText = "字".repeat(700);
    const stats = calculateReadingTime(longText);
    expect(stats.minutes).toBe(2);
    expect(stats.text).toBe("约 2 分钟");
  });

  it("returns complete ArticleStats struct", () => {
    const md = "# 标题\n这是第一段内容。\n这是第二段内容。";
    const stats = getArticleStats(md);

    expect(stats.lines).toBe(3);
    expect(stats.words).toBeGreaterThan(0);
    expect(stats.charsNoSpaces).toBeGreaterThan(0);
    expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    expect(typeof stats.readingTimeString).toBe("string");
  });
});
