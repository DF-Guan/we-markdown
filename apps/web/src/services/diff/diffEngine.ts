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

  const dp = computeLCSMatrix(oldLines, newLines);

  let i = oldLines.length;
  let j = newLines.length;

  const resultReversed: DiffLine[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      resultReversed.push({
        type: "unchanged",
        value: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      unchangedCount++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      resultReversed.push({
        type: "added",
        value: newLines[j - 1],
        newLineNumber: j,
      });
      addedCount++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      resultReversed.push({
        type: "removed",
        value: oldLines[i - 1],
        oldLineNumber: i,
      });
      removedCount++;
      i--;
    }
  }

  const lines = resultReversed.reverse();
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
