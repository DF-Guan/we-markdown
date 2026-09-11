import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayoutSegmentSwitch } from "../../components/common/LayoutSegmentSwitch";
import { useEditorStore } from "../../store/editorStore";

describe("LayoutSegmentSwitch (桌面端三分栏与专注模式切换)", () => {
  beforeEach(() => {
    useEditorStore.getState().setDesktopLayoutMode("split");
  });

  it("renders 3 mode buttons correctly", () => {
    render(<LayoutSegmentSwitch />);
    expect(screen.getByRole("button", { name: "对照双栏模式" })).toBeDefined();
    expect(screen.getByRole("button", { name: "专注编辑模式" })).toBeDefined();
    expect(screen.getByRole("button", { name: "纯净预览模式" })).toBeDefined();
  });

  it("defaults to split mode and toggles to editor-only mode", () => {
    render(<LayoutSegmentSwitch />);
    expect(useEditorStore.getState().desktopLayoutMode).toBe("split");

    const editorBtn = screen.getByRole("button", { name: "专注编辑模式" });
    fireEvent.click(editorBtn);

    expect(useEditorStore.getState().desktopLayoutMode).toBe("editor");
    expect(editorBtn.classList.contains("is-active")).toBe(true);
  });

  it("toggles to preview-only mode on click", () => {
    render(<LayoutSegmentSwitch />);
    const previewBtn = screen.getByRole("button", { name: "纯净预览模式" });
    fireEvent.click(previewBtn);

    expect(useEditorStore.getState().desktopLayoutMode).toBe("preview");
    expect(previewBtn.classList.contains("is-active")).toBe(true);
  });
});
