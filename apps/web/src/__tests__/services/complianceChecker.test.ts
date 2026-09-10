import { describe, expect, it } from "vitest";
import { checkCompliance } from "../../services/compliance/complianceChecker";

describe("complianceChecker", () => {
  it("detects advertising extreme words accurately", () => {
    const text = "本产品是业内顶级的解决方案，能提供最佳的用户体验。";
    const report = checkCompliance(text);

    expect(report.clean).toBe(false);
    expect(report.totalIssues).toBe(2);
    expect(report.issues[0].word).toBe("顶级");
    expect(report.issues[0].suggestion).toContain("高品质");
    expect(report.issues[1].word).toBe("最佳");
  });

  it("detects false promise and inducement terms", () => {
    const text = "保证100%有效，回复领取独家资料，绝对稳赚不赔！";
    const report = checkCompliance(text);

    expect(report.clean).toBe(false);
    const words = report.issues.map((i) => i.word);
    expect(words).toContain("100%有效");
    expect(words).toContain("回复领取");
    expect(words).toContain("绝对");
    expect(words).toContain("稳赚不赔");
  });

  it("ignores extreme words occurring inside code blocks", () => {
    const text = [
      "这是正文中的普通说明。",
      "```javascript",
      "const best = '最佳'; // 这里在代码块内不应被检测出来",
      "const top = '顶级'; ",
      "```",
      "代码块结束，但这里是真实的顶级产品介绍。",
    ].join("\n");

    const report = checkCompliance(text);
    expect(report.totalIssues).toBe(1);
    expect(report.issues[0].word).toBe("顶级");
  });

  it("ignores extreme words occurring inside inline code", () => {
    const text = "请查看 `const isBest = true; 最佳配置` 参数定义。";
    const report = checkCompliance(text);
    expect(report.clean).toBe(true);
    expect(report.totalIssues).toBe(0);
  });

  it("returns clean true for compliant text", () => {
    const text = "这是一篇探讨软件工程解耦与前端架构演进的技术文章。";
    const report = checkCompliance(text);
    expect(report.clean).toBe(true);
    expect(report.totalIssues).toBe(0);
  });

  it("handles empty input gracefully", () => {
    expect(checkCompliance("").clean).toBe(true);
    expect(checkCompliance("   ").clean).toBe(true);
  });
});
