import { useRef, useState, useEffect } from "react";
import {
  LayoutTemplate,
  ArrowDownToLine,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { ARTICLE_SKELETONS, type ArticleSkeleton } from "./articleSkeletons";
import "./ArticleSkeletonPopover.css";

interface ArticleSkeletonPopoverProps {
  onInsertContent: (content: string) => void;
  onReplaceContent?: (content: string) => void;
  currentContentLength?: number;
}

export function ArticleSkeletonPopover({
  onInsertContent,
  onReplaceContent,
  currentContentLength = 0,
}: ArticleSkeletonPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkeleton, setSelectedSkeleton] = useState<ArticleSkeleton>(
    ARTICLE_SKELETONS[0],
  );
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 动态夹紧定位
  useEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      if (!containerRef.current) return;
      if (window.innerWidth < 768) {
        setDropdownStyle({});
        return;
      }

      const triggerRect = containerRef.current.getBoundingClientRect();
      const editorEl =
        containerRef.current.closest(".editor-pane") ||
        containerRef.current.closest(".markdown-editor");

      const editorRect = editorEl
        ? editorEl.getBoundingClientRect()
        : {
            left: 0,
            right: window.innerWidth,
            top: 0,
            bottom: window.innerHeight,
            width: window.innerWidth,
          };

      const popoverWidth = Math.max(320, Math.min(460, editorRect.width - 24));
      const btnCenter = triggerRect.left + triggerRect.width / 2;
      const idealGlobalLeft = btnCenter - popoverWidth / 2;

      const clampedGlobalLeft = Math.max(
        editorRect.left + 12,
        Math.min(idealGlobalLeft, editorRect.right - popoverWidth - 12),
      );

      const offsetFromTrigger = clampedGlobalLeft - triggerRect.left;
      const maxAvailableHeight = window.innerHeight - triggerRect.bottom - 24;
      const clampedMaxHeight = Math.max(340, Math.min(560, maxAvailableHeight));

      setDropdownStyle({
        position: "absolute",
        top: "100%",
        left: `${offsetFromTrigger}px`,
        width: `${popoverWidth}px`,
        maxHeight: `${clampedMaxHeight}px`,
        transform: "none",
      });
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    return () => window.removeEventListener("resize", updatePlacement);
  }, [isOpen]);

  // 点击外部关闭与 Esc 监听
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
      if (event.key === "Escape" && isOpen) {
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

  const handleApply = (
    mode: "replace" | "insert",
    skeleton: ArticleSkeleton,
  ) => {
    if (mode === "replace") {
      if (currentContentLength > 50) {
        const confirmed = window.confirm(
          `当前文章已编写较多内容（约 ${currentContentLength} 字符），应用模板将替换当前草稿，是否继续？\n（可随时按 Ctrl+Z / Cmd+Z 撤销）`,
        );
        if (!confirmed) return;
      }
      if (onReplaceContent) {
        onReplaceContent(skeleton.content);
      } else {
        onInsertContent(skeleton.content);
      }
      toast.success(`已应用「${skeleton.name}」骨架模板`);
    } else {
      onInsertContent(skeleton.content);
      toast.success(`已在光标处插入「${skeleton.name}」骨架`);
    }
    setIsOpen(false);
  };

  return (
    <div className="md-toolbar-dropdown-container" ref={containerRef}>
      <button
        type="button"
        className={`md-toolbar-btn skeleton-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        data-tooltip="起手模板"
        aria-label="自媒体起手式文章骨架模板"
      >
        <LayoutTemplate size={16} />
      </button>

      {isOpen && (
        <div className="article-skeleton-popover" style={dropdownStyle}>
          <div className="skeleton-popover-header">
            <div className="skeleton-header-title">
              <Sparkles size={15} className="skeleton-title-icon" />
              <span>自媒体文章起手式模板</span>
            </div>
            <button
              type="button"
              className="skeleton-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="关闭"
            >
              <X size={15} />
            </button>
          </div>

          <p className="skeleton-popover-subtitle">
            预设符合中文自媒体高转化阅读习惯的文章框架，结构清晰、层层递进。
          </p>

          <div className="skeleton-cards-container">
            {ARTICLE_SKELETONS.map((skeleton) => {
              const isSelected = selectedSkeleton.id === skeleton.id;
              return (
                <div
                  key={skeleton.id}
                  className={`skeleton-item-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedSkeleton(skeleton)}
                >
                  <div className="skeleton-card-top">
                    <span className="skeleton-card-badge">
                      {skeleton.badge}
                    </span>
                    <span className="skeleton-card-name">{skeleton.name}</span>
                  </div>
                  <p className="skeleton-card-desc">{skeleton.desc}</p>
                  <div className="skeleton-card-actions">
                    <button
                      type="button"
                      className="skeleton-action-btn replace-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply("replace", skeleton);
                      }}
                      title="替换当前文章全文"
                    >
                      <RefreshCw size={12} />
                      <span>应用全文</span>
                    </button>
                    <button
                      type="button"
                      className="skeleton-action-btn insert-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply("insert", skeleton);
                      }}
                      title="在当前光标处追加"
                    >
                      <ArrowDownToLine size={12} />
                      <span>光标插入</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="skeleton-popover-footer">
            <span className="skeleton-footer-hint">
              💡 提示：插入后随时可按 <kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd> 撤销
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
