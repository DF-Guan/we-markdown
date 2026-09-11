import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SyntaxHelpPopover } from "../../components/Editor/SyntaxHelpPopover";

describe("SyntaxHelpPopover", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("opens popover on click and renders syntax rows", () => {
    render(<SyntaxHelpPopover />);

    const triggerBtn = screen.getByRole("button", { name: "" });
    fireEvent.click(triggerBtn);

    expect(screen.getByText("Markdown 语法速查")).toBeInTheDocument();
    expect(screen.getByText("粗体")).toBeInTheDocument();
    expect(screen.getByText("行内公式")).toBeInTheDocument();
    expect(screen.getByText("查看完整文档")).toBeInTheDocument();
    expect(screen.getByText("下载桌面客户端")).toBeInTheDocument();
  });

  it("opens documentation URL when '查看完整文档' is clicked", () => {
    const mockOpen = vi.fn();
    vi.stubGlobal("open", mockOpen);

    render(<SyntaxHelpPopover />);
    fireEvent.click(screen.getByRole("button", { name: "" }));

    const docsBtn = screen.getByText("查看完整文档");
    fireEvent.click(docsBtn);

    expect(mockOpen).toHaveBeenCalledWith(
      "https://docs.darktu.com/#/syntax",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("sets window.location.hash to #/download when '下载桌面客户端' is clicked", () => {
    render(<SyntaxHelpPopover />);
    fireEvent.click(screen.getByRole("button", { name: "" }));

    const downloadBtn = screen.getByText("下载桌面客户端");
    fireEvent.click(downloadBtn);

    expect(window.location.hash).toBe("#/download");
  });
});
