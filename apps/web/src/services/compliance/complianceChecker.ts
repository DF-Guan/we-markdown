/**
 * 离线合规与广告法极限词自检引擎 (Offline Compliance & Extreme Words Checker)
 * 纯本地运行，排除代码块与公式干扰，极速秒检
 */

import { COMPLIANCE_RULES, type ComplianceRule } from "./complianceRules";

export interface ComplianceIssue {
  id: string;
  ruleId: string;
  word: string;
  category: "extreme" | "promise" | "inducement";
  categoryName: string;
  severity: "warning" | "danger";
  suggestion: string;
  description: string;
  context: string;
  index: number;
}

export interface ComplianceReport {
  clean: boolean;
  totalIssues: number;
  dangerCount: number;
  warningCount: number;
  issues: ComplianceIssue[];
  scannedChars: number;
}

/**
 * 遮盖文本中的 Markdown 语法干扰区（代码块、行内代码、数学公式、HTML 标签等）
 * 将被保护的字符替换为等长空格，以完全保全字符的原始下标偏移量 (index)
 */
function maskProtectedRegions(markdown: string): string {
  if (!markdown) return "";

  const replacer = (match: string) => " ".repeat(match.length);

  let masked = markdown;

  // 1. 屏蔽代码块 (``` 或 ~~~)
  masked = masked.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, replacer);

  // 2. 屏蔽数学块公式 ($$...$$)
  masked = masked.replace(/\$\$[\s\S]*?\$\$/g, replacer);

  // 3. 屏蔽行内数学公式 ($...$)
  masked = masked.replace(/\$[^$\n]+\$/g, replacer);

  // 4. 屏蔽行内代码 (`...`)
  masked = masked.replace(/`[^`\n]+`/g, replacer);

  // 5. 屏蔽 HTML 标签 (<...>)
  masked = masked.replace(/<[^>]+>/g, replacer);

  // 6. 屏蔽 Markdown 链接中的 URL 部分 [text](url) 以及图片
  masked = masked.replace(/(!?\[[^\]]*?\]\()([^)]+?)(\))/g, (_, p1, p2, p3) => {
    return p1 + " ".repeat(p2.length) + p3;
  });

  return masked;
}

/**
 * 截取违规词的前后上下文供创作者快速辨析
 */
function extractContext(
  text: string,
  index: number,
  wordLength: number,
  padding = 14,
): string {
  const start = Math.max(0, index - padding);
  const end = Math.min(text.length, index + wordLength + padding);

  let before = text.slice(start, index).replace(/\s+/g, " ");
  let after = text.slice(index + wordLength, end).replace(/\s+/g, " ");

  if (start > 0) before = "..." + before;
  if (end < text.length) after = after + "...";

  const matched = text.slice(index, index + wordLength);
  return `${before}【${matched}】${after}`;
}

/**
 * 执行离线合规自检
 */
export function checkCompliance(markdown: string): ComplianceReport {
  if (!markdown || typeof markdown !== "string" || markdown.trim() === "") {
    return {
      clean: true,
      totalIssues: 0,
      dangerCount: 0,
      warningCount: 0,
      issues: [],
      scannedChars: 0,
    };
  }

  const maskedText = maskProtectedRegions(markdown);
  const issues: ComplianceIssue[] = [];

  for (const rule of COMPLIANCE_RULES) {
    // 重置全局正则位置游标
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = rule.pattern.exec(maskedText)) !== null) {
      const idx = match.index;
      const matchedWord = match[0];
      const context = extractContext(markdown, idx, matchedWord.length);

      issues.push({
        id: `${rule.id}-${idx}`,
        ruleId: rule.id,
        word: matchedWord,
        category: rule.category,
        categoryName: rule.categoryName,
        severity: rule.severity,
        suggestion: rule.suggestion,
        description: rule.description,
        context,
        index: idx,
      });
    }
  }

  // 按照在正文中出现的物理先后顺序排序
  issues.sort((a, b) => a.index - b.index);

  const dangerCount = issues.filter((i) => i.severity === "danger").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return {
    clean: issues.length === 0,
    totalIssues: issues.length,
    dangerCount,
    warningCount,
    issues,
    scannedChars: markdown.length,
  };
}
