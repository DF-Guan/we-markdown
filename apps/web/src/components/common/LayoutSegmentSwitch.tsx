import { Columns, PenTool, Eye } from "lucide-react";
import { useEditorStore } from "../../store/editorStore";
import "./LayoutSegmentSwitch.css";

export function LayoutSegmentSwitch() {
  const { desktopLayoutMode, setDesktopLayoutMode } = useEditorStore();

  return (
    <div
      className="layout-segment-switch"
      role="group"
      aria-label="布局分栏模式切换"
    >
      <button
        type="button"
        className={`layout-segment-btn ${desktopLayoutMode === "split" ? "is-active" : ""}`}
        onClick={() => setDesktopLayoutMode("split")}
        title="对照模式：双栏 1:1 左右对照"
        aria-label="对照双栏模式"
      >
        <Columns size={13} />
        <span className="layout-segment-label">对照</span>
      </button>
      <button
        type="button"
        className={`layout-segment-btn ${desktopLayoutMode === "editor" ? "is-active" : ""}`}
        onClick={() => setDesktopLayoutMode("editor")}
        title="专注模式：全宽沉浸式 Markdown 编辑"
        aria-label="专注编辑模式"
      >
        <PenTool size={13} />
        <span className="layout-segment-label">专注</span>
      </button>
      <button
        type="button"
        className={`layout-segment-btn ${desktopLayoutMode === "preview" ? "is-active" : ""}`}
        onClick={() => setDesktopLayoutMode("preview")}
        title="预览模式：全宽排版审校视窗"
        aria-label="纯净预览模式"
      >
        <Eye size={13} />
        <span className="layout-segment-label">预览</span>
      </button>
    </div>
  );
}
