import { describe, expect, it } from "vitest";
import {
  buildCardMarkup,
  extractArticleMeta,
  CARD_THEMES,
} from "../../services/export/cardImageExporter";

describe("cardImageExporter (卡片与长图海报导出引擎)", () => {
  it("should extract title and excerpt from markdown correctly", () => {
    const md =
      "# 深度思考的艺术\n\n在这个信息爆炸的时代，深度思考是唯一的护城河。";
    const { title, excerpt } = extractArticleMeta(md);
    expect(title).toBe("深度思考的艺术");
    expect(excerpt).toContain("在这个信息爆炸的时代");
  });

  it("should fallback to default title if no h1 is present", () => {
    const md = "没有标题，只有一段普通文字。";
    const { title, excerpt } = extractArticleMeta(md);
    expect(title).toBe("WeMarkdown 随笔");
    expect(excerpt).toBe("没有标题，只有一段普通文字。");
  });

  it("should build card markup for xiaohongshu 3:4 card format", () => {
    const { html, width, minHeight } = buildCardMarkup({
      markdown: "# 测试卡片\n正文内容",
      renderedHtml: "<p>正文内容</p>",
      format: "card",
      theme: "classic-white",
      authorName: "测试作者",
    });

    expect(width).toBe(720);
    expect(minHeight).toBe(960);
    expect(html).toContain("测试卡片");
    expect(html).toContain("测试作者");
    expect(html).toContain("排版引擎 · WeMarkdown");
  });

  it("should support dark-slate tech theme and hide watermark when configured", () => {
    const { html } = buildCardMarkup({
      markdown: "# 黑曜科技\n全栈开发",
      renderedHtml: "<p>全栈开发</p>",
      format: "poster",
      theme: "dark-slate",
      showWatermark: false,
    });

    expect(html).toContain(CARD_THEMES["dark-slate"].bg);
    expect(html).not.toContain("排版引擎 · WeMarkdown");
  });

  it("should fallback to classic-white theme for unknown theme keys", () => {
    const { html } = buildCardMarkup({
      markdown: "# 容错测试",
      renderedHtml: "",
      // @ts-expect-error test fallback
      theme: "unknown-theme-xyz",
    });

    expect(html).toContain(CARD_THEMES["classic-white"].cardBg);
  });

  it("should sanitize void tags and escape special XML characters in title and author", () => {
    const { html } = buildCardMarkup({
      markdown: "# 测试 & 验证 <Foo>",
      renderedHtml: '<p>文本</p><hr><img src="test.jpg" alt="pic"><br>',
      format: "quote",
      authorName: "Author & Co <Lead>",
    });

    expect(html).toContain("测试 &amp; 验证 &lt;Foo&gt;");
    expect(html).toContain("Author &amp; Co &lt;Lead&gt;");
    expect(html).toContain("<hr />");
    expect(html).toContain('<img src="test.jpg" alt="pic" />');
    expect(html).toContain("<br />");
  });

  it("should safely escape XML and preserve newlines as br tags in customContent", () => {
    const { html } = buildCardMarkup({
      markdown: "# 主题文章",
      renderedHtml: "<p>原文</p>",
      format: "quote",
      customContent: "“代码是逻辑的写照 <AI & Logic>”\n\n专注深度排版。",
    });

    expect(html).toContain("&lt;AI &amp; Logic&gt;");
    expect(html).toContain("<br />");
    expect(html).not.toContain("<AI & Logic>");
  });
});
