import { useRef, useState, useEffect } from "react";
import { Sparkles, Check, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import {
  CREATOR_SNIPPET_TEMPLATES,
  type SnippetTemplate,
} from "./snippetTemplates";
import "./ComponentPickerPopover.css";

interface ComponentPickerPopoverProps {
  onInsert: (prefix: string, suffix: string, placeholder: string) => void;
}

export function ComponentPickerPopover({
  onInsert,
}: ComponentPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
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
          role="dialog"
          aria-label="自媒体排版组件选择器"
        >
          <div className="component-picker-header">
            <div className="component-picker-title">
              <span className="title-text">排版组件库</span>
              <span className="title-badge">
                {CREATOR_SNIPPET_TEMPLATES.length} 款
              </span>
            </div>
            <p className="component-picker-desc">
              极简内联样式，复制微信不丢格式
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
