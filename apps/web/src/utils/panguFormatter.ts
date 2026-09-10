/**
 * 盘古排版规范格式化工具 (Pangu Markdown Formatter)
 * 自动为中文字符与英文、数字之间增加标准空格，并保证 Markdown 特殊语法不受破坏
 */

export interface FormatResult {
  text: string;
  changedCount: number;
}

const CJK_REGEX =
  "[\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]";

/**
 * 对 Markdown 文本执行安全的盘古中英文空格排版美化
 * 严格保护代码块、行内代码、数学公式、HTML 标签及 Markdown 链接不被破坏
 */
export function formatPanguMarkdown(content: string): FormatResult {
  if (!content || typeof content !== "string") {
    return { text: content || "", changedCount: 0 };
  }

  const original = content;
  const protectedTokens: string[] = [];

  const stash = (match: string): string => {
    const index = protectedTokens.length;
    protectedTokens.push(match);
    return `__WEMD_PANGU_PROTECT_${index}__`;
  };

  // 1. 保护多行代码块 (``` 或 ~~~)
  let text = content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, stash);

  // 2. 保护数学块公式 ($$...$$)
  text = text.replace(/\$\$[\s\S]*?\$\$/g, stash);

  // 3. 保护行内数学公式 ($...$)
  text = text.replace(/\$[^$\n]+\$/g, stash);

  // 4. 保护行内代码 (`...`)
  text = text.replace(/`[^`\n]+`/g, stash);

  // 5. 保护 HTML 标签 (<...>)
  text = text.replace(/<[^>]+>/g, stash);

  // 6. 保护 Markdown 链接中的 URL 部分 [text](url) 以及图片 ![alt](url)
  text = text.replace(/(!?\[[^\]]*?\]\()([^)]+?)(\))/g, (m, p1, p2, p3) => {
    return `${p1}${stash(p2)}${p3}`;
  });

  // 7. 执行盘古中英文间距美化
  // CJK 与 英文/数字之间插入空格
  const cjkBeforeLatin = new RegExp(`(${CJK_REGEX})([a-zA-Z0-9])`, "g");
  const latinBeforeCjk = new RegExp(`([a-zA-Z0-9])(${CJK_REGEX})`, "g");

  text = text.replace(cjkBeforeLatin, "$1 $2");
  text = text.replace(latinBeforeCjk, "$1 $2");

  // CJK 与半角货币/百分号符号之间的合理间隔
  const cjkBeforeSymbol = new RegExp(`(${CJK_REGEX})([$#+])`, "g");
  const symbolBeforeCjk = new RegExp(`([%+])(${CJK_REGEX})`, "g");
  text = text.replace(cjkBeforeSymbol, "$1 $2");
  text = text.replace(symbolBeforeCjk, "$1 $2");

  // 避免在段首缩进之外产生不小心引入的双空格
  text = text.replace(/([^\s]) {2,}([^\s])/g, "$1 $2");

  // 8. 还原受保护的区块
  text = text.replace(/__WEMD_PANGU_PROTECT_(\d+)__/g, (_, idx) => {
    const i = parseInt(idx, 10);
    return protectedTokens[i] !== undefined ? protectedTokens[i] : "";
  });

  // 计算变更处数 (粗略按长度差或字符差异)
  let changedCount = 0;
  if (text !== original) {
    // 粗略计算新增的空格数量
    changedCount = Math.abs(text.length - original.length) || 1;
  }

  return {
    text,
    changedCount,
  };
}
