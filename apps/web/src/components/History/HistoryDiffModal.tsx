import { useMemo } from "react";
import { GitCompare, X, RotateCcw, Plus, Minus } from "lucide-react";
import { computeTextDiff } from "../../services/diff/diffEngine";
import "./HistoryDiffModal.css";

interface HistoryDiffModalProps {
  open: boolean;
  onClose: () => void;
  historyTitle: string;
  historyTimestamp?: number | string;
  historyMarkdown: string;
  currentMarkdown: string;
  onRestore: () => void;
}

export function HistoryDiffModal({
  open,
  onClose,
  historyTitle,
  historyTimestamp,
  historyMarkdown,
  currentMarkdown,
  onRestore,
}: HistoryDiffModalProps) {
  const diffReport = useMemo(() => {
    if (!open)
      return {
        lines: [],
        stats: { addedCount: 0, removedCount: 0, unchangedCount: 0 },
        hasChanges: false,
      };
    return computeTextDiff(historyMarkdown, currentMarkdown);
  }, [open, historyMarkdown, currentMarkdown]);

  if (!open) return null;

  const formattedTime = historyTimestamp
    ? new Date(historyTimestamp).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "历史存档";

  return (
    <div className="diff-modal-backdrop" onClick={onClose}>
      <div className="diff-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* 头部标题与统计指标 */}
        <div className="diff-modal-header">
          <div className="diff-modal-title">
            <GitCompare size={18} className="title-icon" />
            <span>版本差异对比</span>
            <span className="diff-history-name">{historyTitle}</span>
            <span className="diff-time-tag">({formattedTime})</span>
          </div>

          <div className="diff-header-actions">
            <div className="diff-stats-badges">
              {diffReport.stats.addedCount > 0 && (
                <span className="badge-added">
                  <Plus size={11} />
                  {diffReport.stats.addedCount} 行新增
                </span>
              )}
              {diffReport.stats.removedCount > 0 && (
                <span className="badge-removed">
                  <Minus size={11} />
                  {diffReport.stats.removedCount} 行已修改
                </span>
              )}
              {!diffReport.hasChanges && (
                <span className="badge-identical">与当前草稿内容完全一致</span>
              )}
            </div>
            <button
              type="button"
              className="diff-close-btn"
              onClick={onClose}
              aria-label="关闭"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 差异行视图 */}
        <div className="diff-content-view">
          {diffReport.lines.map((line, idx) => {
            const lineClass =
              line.type === "added"
                ? "diff-line diff-added"
                : line.type === "removed"
                  ? "diff-line diff-removed"
                  : "diff-line diff-unchanged";

            const symbol =
              line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

            return (
              <div key={idx} className={lineClass}>
                <span className="line-num-old">{line.oldLineNumber ?? ""}</span>
                <span className="line-num-new">{line.newLineNumber ?? ""}</span>
                <span className="line-marker">{symbol}</span>
                <span className="line-text">{line.value || " "}</span>
              </div>
            );
          })}
        </div>

        {/* 底部操作与安全提示 */}
        <div className="diff-modal-footer">
          <span className="diff-safety-tip">
            💡 还原后将把当前草稿自动保存为安全快照，文字安全无损。
          </span>
          <div className="diff-footer-buttons">
            <button type="button" className="btn-secondary" onClick={onClose}>
              关闭
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onRestore();
                onClose();
              }}
            >
              <RotateCcw size={15} />
              <span>还原为该历史版本</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
