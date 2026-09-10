import { describe, expect, it } from "vitest";
import {
  CREATOR_SNIPPET_TEMPLATES,
  type SnippetTemplate,
} from "../../components/Editor/snippetTemplates";

describe("CREATOR_SNIPPET_TEMPLATES (自媒体排版组件库)", () => {
  it("should provide 5 high-quality, restrained templates", () => {
    expect(CREATOR_SNIPPET_TEMPLATES.length).toBe(5);
  });

  it("should ensure every template has unique IDs and valid fields", () => {
    const ids = new Set<string>();
    const validCategories: SnippetTemplate["category"][] = [
      "callout",
      "quote",
      "list",
      "comparison",
      "signature",
    ];

    for (const item of CREATOR_SNIPPET_TEMPLATES) {
      expect(item.id).toBeTruthy();
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(item.name).toBeTruthy();
      expect(item.badge).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(validCategories).toContain(item.category);
    }
  });

  it("should ensure HTML is clean, WeChat MP compliant, and uses inline CSS", () => {
    for (const item of CREATOR_SNIPPET_TEMPLATES) {
      const html = item.html.trim();

      // 必须是自包含的 section 容器
      expect(html.startsWith("<section")).toBe(true);
      expect(html.endsWith("</section>")).toBe(true);

      // 必须使用行内样式以防止微信公众号后台滤除样式
      expect(html).toContain("style=");
      expect(html).toContain("box-sizing: border-box");

      // 绝不允许包含危险的脚本或外链破坏排版
      expect(html.toLowerCase()).not.toContain("<script");
      expect(html.toLowerCase()).not.toContain("javascript:");
    }
  });

  it("should provide the expected specific templates for content creators", () => {
    const templateIds = CREATOR_SNIPPET_TEMPLATES.map((t) => t.id);
    expect(templateIds).toContain("insight-callout");
    expect(templateIds).toContain("punchline-quote");
    expect(templateIds).toContain("step-badge-list");
    expect(templateIds).toContain("comparison-card");
    expect(templateIds).toContain("author-signature");
  });
});
