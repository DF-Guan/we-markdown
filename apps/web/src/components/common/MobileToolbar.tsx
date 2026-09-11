import {
  Pencil,
  Eye,
  Copy,
  MoreHorizontal,
  Palette,
  X,
  Sparkles,
  Download,
  LayoutGrid,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { MobileViewType } from "../../hooks/useMobileView";
import {
  promptPWAInstall,
  onPWAInstallableChange,
} from "../../services/pwa/pwaService";
import "./MobileToolbar.css";

interface MobileToolbarProps {
  activeView: MobileViewType;
  onViewChange: (view: MobileViewType) => void;
  onCopyToWechat: () => void;
  onOpenTheme: () => void;
  onOpenAICopilot?: () => void;
  onOpenComponentPicker?: () => void;
}

/**
 * 移动端底部工具栏
 */
export function MobileToolbar({
  activeView,
  onViewChange,
  onCopyToWechat,
  onOpenTheme,
  onOpenAICopilot,
  onOpenComponentPicker,
}: MobileToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    return onPWAInstallableChange(setCanInstall);
  }, []);

  return (
    <>
      {/* 更多菜单弹窗 */}
      {showMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMenu(false)}>
          <div
            className="mobile-menu-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <span>更多功能</span>
              <button
                className="mobile-menu-close"
                onClick={() => setShowMenu(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="mobile-menu-list">
              {onOpenAICopilot && (
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    onOpenAICopilot();
                    setShowMenu(false);
                  }}
                >
                  <Sparkles size={20} color="#6366f1" />
                  <span>AI 创作副驾驶</span>
                </button>
              )}
              {onOpenComponentPicker && (
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    onOpenComponentPicker();
                    setShowMenu(false);
                  }}
                >
                  <LayoutGrid size={20} color="#07c160" />
                  <span>自媒体排版组件</span>
                </button>
              )}
              <button
                className="mobile-menu-item"
                onClick={() => {
                  onOpenTheme();
                  setShowMenu(false);
                }}
              >
                <Palette size={20} />
                <span>主题管理</span>
              </button>
              {canInstall && (
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    promptPWAInstall();
                    setShowMenu(false);
                  }}
                >
                  <Download size={20} color="#07c160" />
                  <span>添加到手机桌面 (PWA)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 底部工具栏 */}
      <div className="mobile-toolbar">
        <div className="mobile-toolbar-tabs">
          <button
            className={`mobile-tab ${activeView === "editor" ? "active" : ""}`}
            onClick={() => onViewChange("editor")}
          >
            <Pencil size={18} />
            <span>编辑</span>
          </button>
          <button
            className={`mobile-tab ${activeView === "preview" ? "active" : ""}`}
            onClick={() => onViewChange("preview")}
          >
            <Eye size={18} />
            <span>预览</span>
          </button>
        </div>

        <div className="mobile-toolbar-actions">
          <button
            className="mobile-action-btn primary"
            onClick={onCopyToWechat}
          >
            <Copy size={18} />
          </button>
          <button
            className="mobile-action-btn"
            onClick={() => setShowMenu(true)}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
