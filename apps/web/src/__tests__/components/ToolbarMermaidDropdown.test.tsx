import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toolbar } from "../../components/Editor/Toolbar";

describe("Toolbar Mermaid Dropdown & 查看更多 (图表下拉菜单与二级子菜单)", () => {
  it("renders the diagram insert trigger button", () => {
    render(<Toolbar onInsert={() => {}} />);
    const trigger = screen.getByRole("button", { name: /插入图表/i });
    expect(trigger).toBeDefined();
  });

  it("opens diagram menu on click and renders all primary diagram options plus '查看更多'", () => {
    render(<Toolbar onInsert={() => {}} />);
    const trigger = screen.getByRole("button", { name: /插入图表/i });

    fireEvent.click(trigger);

    expect(screen.getByText("流程图")).toBeDefined();
    expect(screen.getByText("时序图")).toBeDefined();
    expect(screen.getByText("类图")).toBeDefined();
    expect(screen.getByText("甘特图")).toBeDefined();
    expect(screen.getByText("思维导图")).toBeDefined();
    expect(screen.getByText("饼图")).toBeDefined();
    expect(screen.getByText("查看更多")).toBeDefined();
  });

  it("opens submenu and renders secondary templates when '查看更多' is clicked", () => {
    render(<Toolbar onInsert={() => {}} />);
    const trigger = screen.getByRole("button", { name: /插入图表/i });
    fireEvent.click(trigger);

    const moreBtn = screen.getByText("查看更多");
    fireEvent.click(moreBtn);

    expect(screen.getByText("状态图")).toBeDefined();
    expect(screen.getByText("ER 图")).toBeDefined();
    expect(screen.getByText("时间线")).toBeDefined();
    expect(screen.getByText("用户旅程")).toBeDefined();
  });

  it("inserts mermaid diagram template and closes menu when a submenu item is clicked", () => {
    const handleInsert = vi.fn();
    render(<Toolbar onInsert={handleInsert} />);
    const trigger = screen.getByRole("button", { name: /插入图表/i });
    fireEvent.click(trigger);

    const moreBtn = screen.getByText("查看更多");
    fireEvent.click(moreBtn);

    const stateDiagramBtn = screen.getByText("状态图");
    fireEvent.click(stateDiagramBtn);

    expect(handleInsert).toHaveBeenCalledWith(
      "```mermaid\n",
      "\n```",
      expect.stringContaining("stateDiagram-v2"),
    );
    // Menu should close
    expect(screen.queryByText("流程图")).toBeNull();
    expect(screen.queryByText("状态图")).toBeNull();
  });

  it("supports hovering '查看更多' to open submenu and hovering primary items to close submenu", () => {
    render(<Toolbar onInsert={() => {}} />);
    const trigger = screen.getByRole("button", { name: /插入图表/i });
    fireEvent.click(trigger);

    expect(screen.queryByText("状态图")).toBeNull();

    // Hover more container
    const moreWrapper = screen
      .getByText("查看更多")
      .closest(".md-toolbar-dropdown-more");
    expect(moreWrapper).not.toBeNull();
    fireEvent.mouseEnter(moreWrapper!);

    expect(screen.getByText("状态图")).toBeDefined();

    // Hover back to a primary item like 流程图
    const flowchartBtn = screen.getByText("流程图");
    fireEvent.mouseEnter(flowchartBtn);

    expect(screen.queryByText("状态图")).toBeNull();
  });
});
