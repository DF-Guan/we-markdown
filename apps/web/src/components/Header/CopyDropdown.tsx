import { useState, useRef, useEffect } from "react";
import {
  Send,
  ChevronDown,
  Image as ImageIcon,
  Check,
  Globe,
  FileCode,
  FileText,
} from "lucide-react";
import {
  type TargetPlatform,
  SUPPORTED_PLATFORMS,
} from "../../services/copy/copyDispatcher";
import "./CopyDropdown.css";

interface CopyDropdownProps {
  onCopyPlatform: (platform: TargetPlatform) => void;
  onOpenCardExport: () => void;
  disabled?: boolean;
}

export function CopyDropdown({
  onCopyPlatform,
  onOpenCardExport,
  disabled = false,
}: CopyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部或按 Esc 键关闭
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

  const handleSelectPlatform = (platform: TargetPlatform) => {
    setIsOpen(false);
    onCopyPlatform(platform);
  };

  const getPlatformIcon = (id: TargetPlatform) => {
    switch (id) {
      case "wechat":
        return <Send size={14} />;
      case "zhihu":
        return <Globe size={14} />;
      case "juejin":
        return <FileCode size={14} />;
      case "markdown":
        return <FileText size={14} />;
    }
  };

  return (
    <div className="copy-split-container" ref={containerRef}>
      {/* 主按钮：默认一键复制到公众号 */}
      <button
        type="button"
        className="copy-main-btn btn-primary"
        onClick={() => onCopyPlatform("wechat")}
        disabled={disabled}
        title="直接复制到微信公众号"
      >
        <Send size={16} strokeWidth={2} />
        <span>复制到公众号</span>
      </button>

      {/* 展开更多分发选项下拉按钮 */}
      <button
        type="button"
        className={`copy-arrow-btn btn-primary ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-label="展开更多分发与导出选项"
        aria-expanded={isOpen}
        title="选择知乎、掘金、Markdown 或导出长图"
      >
        <ChevronDown size={14} strokeWidth={2.5} />
      </button>

      {/* 浮层下拉面板 */}
      {isOpen && (
        <div className="copy-dropdown-menu">
          <div className="dropdown-section-title">分发至平台</div>
          <div className="dropdown-platform-list">
            {SUPPORTED_PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="dropdown-item"
                onClick={() => handleSelectPlatform(p.id)}
              >
                <span className={`item-icon icon-${p.id}`}>
                  {getPlatformIcon(p.id)}
                </span>
                <div className="item-content">
                  <div className="item-title-row">
                    <span className="item-name">{p.name}</span>
                    <span className="item-badge">{p.badge}</span>
                  </div>
                  <span className="item-desc">{p.description}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="dropdown-divider" />

          {/* 导出高清卡片/海报入口 */}
          <button
            type="button"
            className="dropdown-item dropdown-item-export"
            onClick={() => {
              setIsOpen(false);
              onOpenCardExport();
            }}
          >
            <span className="item-icon icon-export">
              <ImageIcon size={14} />
            </span>
            <div className="item-content">
              <div className="item-title-row">
                <span className="item-name">导出高清海报 / 卡片</span>
                <span className="item-badge badge-pro">高清海报</span>
              </div>
              <span className="item-desc">
                小红书 3:4 卡片、朋友圈长图海报与金句微卡
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
