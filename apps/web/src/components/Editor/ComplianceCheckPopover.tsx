import { useRef, useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  checkCompliance,
  type ComplianceIssue,
} from "../../services/compliance/complianceChecker";
import "./ComplianceCheckPopover.css";

interface ComplianceCheckPopoverProps {
  content: string;
  onReplaceWord?: (oldWord: string, newWord: string, index: number) => void;
}

export function ComplianceCheckPopover({
  content,
  onReplaceWord,
}: ComplianceCheckPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 毫秒级本地分析
  const report = useMemo(() => checkCompliance(content), [content]);

  // 点击外部自动关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleApplyReplacement = (issue: ComplianceIssue) => {
    // 提取首选替换词（若有斜杠分隔则取第一个）
    const firstChoice = issue.suggestion.split("/")[0].trim();
    if (onReplaceWord) {
      onReplaceWord(issue.word, firstChoice, issue.index);
      toast.success(`已将「${issue.word}」替换为「${firstChoice}」`);
    } else {
      navigator.clipboard.writeText(firstChoice);
      toast.success(`已复制建议词「${firstChoice}」`);
    }
  };

  const hasIssues = !report.clean;

  return (
    <div className="md-toolbar-dropdown-container" ref={containerRef}>
      <button
        type="button"
        className={`md-toolbar-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        data-tooltip="内容合规体检 (广告法极限词)"
        aria-label="广告法极限词与内容合规自检"
        aria-expanded={isOpen}
      >
        {hasIssues ? (
          <ShieldAlert size={16} style={{ color: "#ef4444" }} />
        ) : (
          <ShieldCheck size={16} />
        )}
        {hasIssues && <span className="md-toolbar-badge-dot" />}
      </button>

      {isOpen && (
        <div
          className="compliance-popover"
          role="dialog"
          aria-label="内容合规体检结果"
        >
          <div className="compliance-popover-header">
            <div className="compliance-title-wrap">
              <span className="compliance-title">
                <ShieldCheck size={16} style={{ color: "#07c160" }} />
                微信内容合规体检
              </span>
              <span className="compliance-subtitle">
                已扫描 {report.scannedChars} 字符 · 纯本地离线计算
              </span>
            </div>
            <button
              type="button"
              className="md-toolbar-btn"
              style={{ width: "24px", height: "24px" }}
              onClick={() => setIsOpen(false)}
              aria-label="关闭"
            >
              <X size={14} />
            </button>
          </div>

          <div className="compliance-body">
            {report.clean ? (
              <div className="compliance-clean-card">
                <div className="compliance-clean-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div className="compliance-clean-title">未检测到合规风险</div>
                <div className="compliance-clean-desc">
                  文章中未发现广告法明令禁止的绝对化极限词或常见过度夸大承诺，符合公众号常规发文规范。
                </div>
              </div>
            ) : (
              <div>
                <div
                  className={`compliance-summary-bar ${
                    report.dangerCount > 0 ? "has-danger" : ""
                  }`}
                >
                  <span className="compliance-summary-text">
                    发现 {report.totalIssues} 处潜在合规风险项
                  </span>
                  <span
                    style={{ fontSize: "11px", color: "var(--text-tertiary)" }}
                  >
                    {report.dangerCount} 处高危 · {report.warningCount} 处建议
                  </span>
                </div>

                <div className="compliance-issues-list">
                  {report.issues.map((issue) => (
                    <div key={issue.id} className="compliance-issue-item">
                      <div className="compliance-issue-top">
                        <span
                          className={`compliance-issue-badge ${issue.severity}`}
                        >
                          {issue.categoryName}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          {issue.description}
                        </span>
                      </div>

                      <div className="compliance-issue-context">
                        {issue.context}
                      </div>

                      <div className="compliance-issue-suggestion">
                        <span className="compliance-suggest-text">
                          建议替换为：
                          <span className="compliance-suggest-val">
                            {issue.suggestion}
                          </span>
                        </span>

                        <button
                          type="button"
                          className="compliance-replace-btn"
                          onClick={() => handleApplyReplacement(issue)}
                          title="点击一键替换为推荐词汇"
                        >
                          替换
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="compliance-popover-footer">
            <Lock size={12} />
            <span>纯本地隐私沙箱验证 · 数据绝不上报第三方</span>
          </div>
        </div>
      )}
    </div>
  );
}
