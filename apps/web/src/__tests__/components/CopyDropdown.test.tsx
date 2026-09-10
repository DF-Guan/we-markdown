import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CopyDropdown } from "../../components/Header/CopyDropdown";

describe("CopyDropdown (多平台分发与导出菜单)", () => {
  it("renders default primary button for WeChat copy", () => {
    const handleCopy = vi.fn();
    render(
      <CopyDropdown onCopyPlatform={handleCopy} onOpenCardExport={() => {}} />,
    );

    const mainBtn = screen.getByRole("button", { name: /复制到公众号/i });
    expect(mainBtn).toBeDefined();

    fireEvent.click(mainBtn);
    expect(handleCopy).toHaveBeenCalledWith("wechat");
  });

  it("opens dropdown and dispatches other platforms", () => {
    const handleCopy = vi.fn();
    const handleExport = vi.fn();
    render(
      <CopyDropdown
        onCopyPlatform={handleCopy}
        onOpenCardExport={handleExport}
      />,
    );

    const arrowBtn = screen.getByRole("button", {
      name: /展开更多分发与导出选项/i,
    });
    fireEvent.click(arrowBtn);

    // 检查下拉条目
    expect(screen.getByText("知乎专栏")).toBeDefined();
    expect(screen.getByText("掘金社区")).toBeDefined();
    expect(screen.getByText("纯净 Markdown")).toBeDefined();
    expect(screen.getByText("导出高清海报 / 卡片")).toBeDefined();

    // 点击知乎
    fireEvent.click(screen.getByText("知乎专栏"));
    expect(handleCopy).toHaveBeenCalledWith("zhihu");
  });

  it("calls onOpenCardExport when clicking export item", () => {
    const handleExport = vi.fn();
    render(
      <CopyDropdown
        onCopyPlatform={() => {}}
        onOpenCardExport={handleExport}
      />,
    );

    const arrowBtn = screen.getByRole("button", {
      name: /展开更多分发与导出选项/i,
    });
    fireEvent.click(arrowBtn);

    const exportItem = screen.getByText("导出高清海报 / 卡片");
    fireEvent.click(exportItem);
    expect(handleExport).toHaveBeenCalled();
  });
});
