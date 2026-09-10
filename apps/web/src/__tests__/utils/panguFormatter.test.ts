import { describe, expect, it } from "vitest";
import { formatPanguMarkdown } from "../../utils/panguFormatter";

describe("panguFormatter", () => {
  it("formats mixed CJK and English text correctly", () => {
    const input = "使用React构建现代化Web应用";
    const result = formatPanguMarkdown(input);
    expect(result.text).toBe("使用 React 构建现代化 Web 应用");
    expect(result.changedCount).toBeGreaterThan(0);
  });

  it("formats mixed CJK and numbers correctly", () => {
    const input = "今天共有100个待办事项，完成率达到了98.5%以上";
    const result = formatPanguMarkdown(input);
    expect(result.text).toBe(
      "今天共有 100 个待办事项，完成率达到了 98.5% 以上",
    );
  });

  it("is idempotent when run repeatedly", () => {
    const input = "使用 React 构建现代化 Web 应用";
    const result1 = formatPanguMarkdown(input);
    expect(result1.text).toBe(input);
    expect(result1.changedCount).toBe(0);

    const result2 = formatPanguMarkdown(result1.text);
    expect(result2.text).toBe(input);
    expect(result2.changedCount).toBe(0);
  });

  it("protects fenced code blocks from modification", () => {
    const input = [
      "这是代码块外部的中英文React测试：",
      "```javascript",
      "const str = '中文与English不应加空格';",
      "const count = 123;",
      "```",
      "代码块结束后的Vue测试。",
    ].join("\n");

    const result = formatPanguMarkdown(input);
    expect(result.text).toContain("React 测试");
    expect(result.text).toContain("const str = '中文与English不应加空格';");
    expect(result.text).toContain("Vue 测试");
  });

  it("protects inline code from modification", () => {
    const input = "请执行 `npm run dev` 或者 `pnpm install` 安装依赖。";
    const result = formatPanguMarkdown(input);
    expect(result.text).toBe(
      "请执行 `npm run dev` 或者 `pnpm install` 安装依赖。",
    );
  });

  it("protects inline and block math formulas", () => {
    const input = [
      "根据公式 $E=mc^2$ 计算质能方程：",
      "$$",
      "f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)e^{2\\pi i \\xi x} d\\xi",
      "$$",
      "以上是数学积分公式LaTeX展示。",
    ].join("\n");

    const result = formatPanguMarkdown(input);
    expect(result.text).toContain("$E=mc^2$");
    expect(result.text).toContain("$$");
    expect(result.text).toContain("LaTeX 展示");
  });

  it("protects markdown links and image URLs", () => {
    const input =
      "参考链接：[React官方文档](https://react.dev/learn?q=中文测试) 以及图片 ![封面图Logo](https://example.com/logo123.png)。";
    const result = formatPanguMarkdown(input);
    expect(result.text).toContain(
      "[React 官方文档](https://react.dev/learn?q=中文测试)",
    );
    expect(result.text).toContain("(https://example.com/logo123.png)");
  });

  it("handles empty or falsy inputs gracefully", () => {
    expect(formatPanguMarkdown("").text).toBe("");
    expect(formatPanguMarkdown("").changedCount).toBe(0);
  });
});
