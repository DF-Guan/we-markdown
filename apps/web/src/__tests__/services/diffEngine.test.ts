import { describe, expect, it } from "vitest";
import { computeTextDiff } from "../../services/diff/diffEngine";

describe("diffEngine (纯文本差异比对引擎)", () => {
  it("should return hasChanges false for identical content", () => {
    const text = "行 1\n行 2\n行 3";
    const report = computeTextDiff(text, text);

    expect(report.hasChanges).toBe(false);
    expect(report.stats.addedCount).toBe(0);
    expect(report.stats.removedCount).toBe(0);
    expect(report.stats.unchangedCount).toBe(3);
    expect(report.lines.every((l) => l.type === "unchanged")).toBe(true);
  });

  it("should detect added lines accurately", () => {
    const oldText = "基础排版";
    const newText = "基础排版\n新增第一行\n新增第二行";

    const report = computeTextDiff(oldText, newText);

    expect(report.hasChanges).toBe(true);
    expect(report.stats.addedCount).toBe(2);
    expect(report.stats.removedCount).toBe(0);
    expect(report.stats.unchangedCount).toBe(1);
  });

  it("should detect removed lines accurately", () => {
    const oldText = "标题\n将被删除的段落\n结尾";
    const newText = "标题\n结尾";

    const report = computeTextDiff(oldText, newText);

    expect(report.hasChanges).toBe(true);
    expect(report.stats.removedCount).toBe(1);
    expect(report.stats.addedCount).toBe(0);
    expect(report.stats.unchangedCount).toBe(2);
    expect(
      report.lines.some(
        (l) => l.type === "removed" && l.value === "将被删除的段落",
      ),
    ).toBe(true);
  });

  it("should detect mixed additions and deletions", () => {
    const oldText = "第一段\n旧第二段\n第三段";
    const newText = "第一段\n新第二段\n第三段\n第四段";

    const report = computeTextDiff(oldText, newText);

    expect(report.hasChanges).toBe(true);
    expect(report.stats.removedCount).toBe(1);
    expect(report.stats.addedCount).toBe(2);
  });

  it("should handle empty strings safely", () => {
    const report = computeTextDiff("", "");
    expect(report.hasChanges).toBe(false);
  });
});
