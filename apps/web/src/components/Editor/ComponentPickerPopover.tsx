import { useRef, useState, useEffect } from "react";
import { Sparkles, Check, ChevronRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import {
  CREATOR_SNIPPET_TEMPLATES,
  type SnippetTemplate,
} from "./snippetTemplates";
import { resolveAppAssetPath } from "../../utils/assetPath";
import "./ComponentPickerPopover.css";

interface ComponentPickerPopoverProps {
  onInsert: (prefix: string, suffix: string, placeholder: string) => void;
}

export function ComponentPickerPopover({
  onInsert,
}: ComponentPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showVisualPreview, setShowVisualPreview] = useState(true);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 动态计算弹窗位置与边界约束，彻底防止右侧或底部溢出截断
  useEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      if (!containerRef.current) return;
      // 移动端由全屏 Fixed CSS 统领
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

      // 弹窗宽度：300px ~ 390px，且留出左右至少 24px 边距
      const popoverWidth = Math.max(300, Math.min(390, editorRect.width - 24));

      // 以按钮中心为理想中轴
      const btnCenter = triggerRect.left + triggerRect.width / 2;
      const idealGlobalLeft = btnCenter - popoverWidth / 2;

      // 严格夹紧在 editorRect 内部 [editorRect.left + 12, editorRect.right - popoverWidth - 12]
      const clampedGlobalLeft = Math.max(
        editorRect.left + 12,
        Math.min(idealGlobalLeft, editorRect.right - popoverWidth - 12),
      );

      const relativeLeft = clampedGlobalLeft - triggerRect.left;
      const availableHeight = Math.min(
        editorRect.bottom - triggerRect.bottom - 20,
        window.innerHeight - triggerRect.bottom - 20,
      );
      const maxHeight = Math.max(300, Math.min(560, availableHeight));

      setDropdownStyle({
        position: "absolute",
        left: `${relativeLeft}px`,
        right: "auto",
        width: `${popoverWidth}px`,
        maxHeight: `${maxHeight}px`,
        maxWidth: `calc(100vw - 24px)`,
        boxSizing: "border-box",
      });
    };

    updatePlacement();
    const rafId = requestAnimationFrame(updatePlacement);
    window.addEventListener("resize", updatePlacement);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePlacement);
    };
  }, [isOpen, selectedCategory]);

  // 监听移动端或全局自定义唤起事件
  useEffect(() => {
    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener("wemd-open-component-picker", handleCustomOpen);
    return () =>
      window.removeEventListener(
        "wemd-open-component-picker",
        handleCustomOpen,
      );
  }, []);

  // 点击外部与 Escape 键关闭
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

  const handleSelectTemplate = (template: SnippetTemplate) => {
    // 注入自包含内联 HTML，带有清晰的上下文换行
    onInsert("", "", `\n\n${template.html}\n\n`);
    toast.success(`已插入：${template.name}`, {
      duration: 1500,
      icon: "✨",
    });
    setIsOpen(false);
  };

  const categories = [
    { id: "all", label: "全部" },
    { id: "callout", label: "要点" },
    { id: "quote", label: "金句" },
    { id: "list", label: "清单" },
    { id: "comparison", label: "对比" },
    { id: "layout", label: "图组" },
    { id: "signature", label: "名片" },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? CREATOR_SNIPPET_TEMPLATES
      : CREATOR_SNIPPET_TEMPLATES.filter(
          (t) => t.category === selectedCategory,
        );

  return (
    <div className="md-toolbar-dropdown-container" ref={containerRef}>
      <button
        type="button"
        className={`md-toolbar-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        data-tooltip="排版组件"
        aria-label="插入自媒体特色排版组件"
        aria-expanded={isOpen}
      >
        <Sparkles size={16} />
      </button>

      {isOpen && (
        <div
          className="component-picker-popover"
          style={dropdownStyle}
          role="dialog"
          aria-label="自媒体排版组件选择器"
        >
          <div className="component-picker-header">
            <div className="component-picker-title">
              <span className="title-text">排版组件库</span>
              <div className="picker-header-actions">
                <button
                  type="button"
                  className="preview-toggle-btn"
                  onClick={() => setShowVisualPreview((prev) => !prev)}
                  title={
                    showVisualPreview
                      ? "切换为紧凑文字视图"
                      : "切换为实景视觉预览"
                  }
                >
                  {showVisualPreview ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{showVisualPreview ? "实景预览" : "紧凑列表"}</span>
                </button>
                <span className="title-badge">
                  {CREATOR_SNIPPET_TEMPLATES.length} 款
                </span>
              </div>
            </div>
            <p className="component-picker-desc">
              真实渲染效果即时预览，点击直接插入正文
            </p>
          </div>

          <div className="component-picker-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`picker-tab-btn ${
                  selectedCategory === cat.id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="component-picker-list">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="component-card"
                onClick={() => handleSelectTemplate(template)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectTemplate(template);
                  }
                }}
              >
                <div className="component-card-top">
                  <span className="component-card-name">{template.name}</span>
                  <span className="component-card-badge">{template.badge}</span>
                </div>

                {/* 真实效果实景预览 */}
                {showVisualPreview && (
                  <div className="component-card-preview">
                    <div
                      className="component-card-preview-inner"
                      dangerouslySetInnerHTML={{
                        __html: template.html.replaceAll(
                          "https://we-markdown.pages.dev/snippets/",
                          resolveAppAssetPath("snippets/"),
                        ),
                      }}
                    />
                  </div>
                )}

                <div className="component-card-desc">
                  {template.description}
                </div>
                <div className="component-card-action">
                  <span className="action-text">点击插入</span>
                  <ChevronRight size={12} className="action-icon" />
                </div>
              </div>
            ))}
          </div>

          <div className="component-picker-footer">
            <Check size={12} className="footer-check" />
            <span>自包含行内 CSS，支持微信公众号、知乎与邮件</span>
          </div>
        </div>
      )}
    </div>
  );
}
