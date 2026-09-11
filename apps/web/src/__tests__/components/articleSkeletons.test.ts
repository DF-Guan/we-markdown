import { describe, expect, it } from "vitest";
import { ARTICLE_SKELETONS } from "../../components/Editor/articleSkeletons";

describe("articleSkeletons (自媒体文章起手式模板数据)", () => {
  it("exports at least 4 well-structured skeletons", () => {
    expect(ARTICLE_SKELETONS.length).toBeGreaterThanOrEqual(4);
  });

  it("each skeleton contains required metadata and substantial markdown content", () => {
    ARTICLE_SKELETONS.forEach((skeleton) => {
      expect(skeleton.id).toBeTruthy();
      expect(skeleton.name).toBeTruthy();
      expect(skeleton.badge).toBeTruthy();
      expect(skeleton.desc).toBeTruthy();
      expect(skeleton.content.length).toBeGreaterThan(150);
      expect(skeleton.content).toContain("# ");
      expect(skeleton.content).toContain("## ");
    });
  });

  it("includes classic skeletons for tech weekly, deep guide, book notes and product review", () => {
    const ids = ARTICLE_SKELETONS.map((s) => s.id);
    expect(ids).toContain("tech-weekly");
    expect(ids).toContain("deep-guide");
    expect(ids).toContain("book-notes");
    expect(ids).toContain("product-review");
  });
});
