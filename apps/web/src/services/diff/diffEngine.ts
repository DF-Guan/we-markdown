/**
 * 极简纯净纯文本 Diff 引擎 (diffEngine.ts)
 * 基于最长公共子序列 (LCS) 的行级差异比较，零外部重型依赖
 */

export type DiffChangeType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffChangeType;
  value: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffReport {
  lines: DiffLine[];
  stats: {
    addedCount: number;
    removedCount: number;
    unchangedCount: number;
  };
  hasChanges: boolean;
}

/**
 * 计算两个字符串数组的最长公共子序列矩阵
 */
function computeLCSMatrix(oldLines: string[], newLines: string[]): number[][] {
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * 比较两段 Markdown 纯文本并输出差异报表
 * @param oldText 历史快照版本
 * @param newText 当前编辑器草稿版本
 */
export function computeTextDiff(oldText: string, newText: string): DiffReport {
  const oldLines = (oldText || "").split("\n");
  const newLines = (newText || "").split("\n");

  const lines: DiffLine[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  // 1. 快速提取公共前缀
  let start = 0;
  while (
    start < oldLines.length &&
    start < newLines.length &&
    oldLines[start] === newLines[start]
  ) {
    lines.push({
      type: "unchanged",
      value: oldLines[start],
      oldLineNumber: start + 1,
      newLineNumber: start + 1,
    });
    unchangedCount++;
    start++;
  }

  // 2. 快速提取公共后缀
  let oldEnd = oldLines.length - 1;
  let newEnd = newLines.length - 1;
  const suffixLines: DiffLine[] = [];

  while (
    oldEnd >= start &&
    newEnd >= start &&
    oldLines[oldEnd] === newLines[newEnd]
  ) {
    suffixLines.push({
      type: "unchanged",
      value: oldLines[oldEnd],
      oldLineNumber: oldEnd + 1,
      newLineNumber: newEnd + 1,
    });
    unchangedCount++;
    oldEnd--;
    newEnd--;
  }
  suffixLines.reverse();

  // 3. 对中间真正变动的行块进行 LCS 矩阵计算
  const middleOld = oldLines.slice(start, oldEnd + 1);
  const middleNew = newLines.slice(start, newEnd + 1);

  if (middleOld.length > 0 || middleNew.length > 0) {
    // 安全熔断：如果变动行数乘积极大（> 500,000），降级为直接块替换，防止阻塞主线程
    if (middleOld.length * middleNew.length > 500000) {
      for (let idx = 0; idx < middleOld.length; idx++) {
        lines.push({
          type: "removed",
          value: middleOld[idx],
          oldLineNumber: start + idx + 1,
        });
        removedCount++;
      }
      for (let idx = 0; idx < middleNew.length; idx++) {
        lines.push({
          type: "added",
          value: middleNew[idx],
          newLineNumber: start + idx + 1,
        });
        addedCount++;
      }
    } else {
      const dp = computeLCSMatrix(middleOld, middleNew);
      let i = middleOld.length;
      let j = middleNew.length;
      const middleReversed: DiffLine[] = [];

      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && middleOld[i - 1] === middleNew[j - 1]) {
          middleReversed.push({
            type: "unchanged",
            value: middleOld[i - 1],
            oldLineNumber: start + i,
            newLineNumber: start + j,
          });
          unchangedCount++;
          i--;
          j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
          middleReversed.push({
            type: "added",
            value: middleNew[j - 1],
            newLineNumber: start + j,
          });
          addedCount++;
          j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
          middleReversed.push({
            type: "removed",
            value: middleOld[i - 1],
            oldLineNumber: start + i,
          });
          removedCount++;
          i--;
        }
      }
      lines.push(...middleReversed.reverse());
    }
  }

  // 4. 追加公共后缀
  lines.push(...suffixLines);

  const hasChanges = addedCount > 0 || removedCount > 0;

  return {
    lines,
    stats: {
      addedCount,
      removedCount,
      unchangedCount,
    },
    hasChanges,
  };
}
