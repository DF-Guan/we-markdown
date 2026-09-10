import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryDiffModal } from "../../components/History/HistoryDiffModal";

describe("HistoryDiffModal (版本差异对比弹窗)", () => {
  it("does not render when open is false", () => {
    const { container } = render(
      <HistoryDiffModal
        open={false}
        onClose={() => {}}
        historyTitle="测试文章"
        historyMarkdown="旧文本"
        currentMarkdown="新文本"
        onRestore={() => {}}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders diff modal with badges and diff lines when open", () => {
    const oldMd = "标题\n第一段\n被删除的段落";
    const newMd = "标题\n第一段\n新增的段落";

    render(
      <HistoryDiffModal
        open={true}
        onClose={() => {}}
        historyTitle="我的历史草稿"
        historyTimestamp={1720000000000}
        historyMarkdown={oldMd}
        currentMarkdown={newMd}
        onRestore={() => {}}
      />,
    );

    expect(screen.getByText("版本差异对比")).toBeDefined();
    expect(screen.getByText("我的历史草稿")).toBeDefined();
    expect(screen.getByText(/1 行新增/i)).toBeDefined();
    expect(screen.getByText(/1 行已修改/i)).toBeDefined();
  });

  it("calls onRestore and onClose when clicking restore button", () => {
    const handleRestore = vi.fn();
    const handleClose = vi.fn();

    render(
      <HistoryDiffModal
        open={true}
        onClose={handleClose}
        historyTitle="可回退版本"
        historyMarkdown="旧文本"
        currentMarkdown="新文本"
        onRestore={handleRestore}
      />,
    );

    const restoreBtn = screen.getByRole("button", {
      name: /还原为该历史版本/i,
    });
    fireEvent.click(restoreBtn);

    expect(handleRestore).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking close button", () => {
    const handleClose = vi.fn();

    render(
      <HistoryDiffModal
        open={true}
        onClose={handleClose}
        historyTitle="测试版本"
        historyMarkdown="文本"
        currentMarkdown="文本"
        onRestore={() => {}}
      />,
    );

    const closeButtons = screen.getAllByRole("button", { name: "关闭" });
    fireEvent.click(closeButtons[0]);

    expect(handleClose).toHaveBeenCalled();
  });

  it("handles invalid historyTimestamp gracefully without crashing", () => {
    render(
      <HistoryDiffModal
        open={true}
        onClose={() => {}}
        historyTitle="测试异常时间戳"
        historyTimestamp="invalid-date-string"
        historyMarkdown="文本"
        currentMarkdown="文本"
        onRestore={() => {}}
      />,
    );

    expect(screen.getByText("(历史存档)")).toBeDefined();
  });

  it("calls onClose when pressing Escape key", () => {
    const handleClose = vi.fn();

    render(
      <HistoryDiffModal
        open={true}
        onClose={handleClose}
        historyTitle="测试按键关闭"
        historyMarkdown="文本"
        currentMarkdown="文本"
        onRestore={() => {}}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
});
