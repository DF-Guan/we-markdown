import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComponentPickerPopover } from "../../components/Editor/ComponentPickerPopover";
import { CREATOR_SNIPPET_TEMPLATES } from "../../components/Editor/snippetTemplates";

describe("ComponentPickerPopover (排版组件弹窗与实景预览)", () => {
  it("renders trigger button correctly", () => {
    render(<ComponentPickerPopover onInsert={() => {}} />);
    const trigger = screen.getByRole("button", { name: /排版组件/i });
    expect(trigger).toBeDefined();
  });

  it("opens popover on click and renders all snippet cards with visual preview by default", () => {
    const { container } = render(
      <ComponentPickerPopover onInsert={() => {}} />,
    );
    const trigger = screen.getByRole("button", { name: /排版组件/i });

    fireEvent.click(trigger);

    // 检查标题与条目
    expect(screen.getByText("排版组件库")).toBeDefined();
    expect(
      screen.getByText("真实渲染效果即时预览，点击直接插入正文"),
    ).toBeDefined();

    // 检查默认展示实景预览视窗
    const previewBoxes = container.querySelectorAll(".component-card-preview");
    expect(previewBoxes.length).toBe(CREATOR_SNIPPET_TEMPLATES.length);
  });

  it("toggles between visual preview and compact list view", () => {
    const { container } = render(
      <ComponentPickerPopover onInsert={() => {}} />,
    );
    const trigger = screen.getByRole("button", { name: /排版组件/i });

    fireEvent.click(trigger);

    // 初始状态下有预览切换按钮「实景预览」
    const toggleBtn = screen.getByRole("button", { name: /实景预览/i });
    expect(toggleBtn).toBeDefined();

    // 点击切换为紧凑列表
    fireEvent.click(toggleBtn);

    // 预览框应被隐藏
    const hiddenPreviews = container.querySelectorAll(
      ".component-card-preview",
    );
    expect(hiddenPreviews.length).toBe(0);

    // 按钮文案更新为「紧凑列表」
    expect(screen.getByRole("button", { name: /紧凑列表/i })).toBeDefined();

    // 再次点击切回实景预览
    const compactBtn = screen.getByRole("button", { name: /紧凑列表/i });
    fireEvent.click(compactBtn);
    const restoredPreviews = container.querySelectorAll(
      ".component-card-preview",
    );
    expect(restoredPreviews.length).toBe(CREATOR_SNIPPET_TEMPLATES.length);
  });

  it("calls onInsert with template html when a card is clicked", () => {
    const handleInsert = vi.fn();
    render(<ComponentPickerPopover onInsert={handleInsert} />);
    const trigger = screen.getByRole("button", { name: /排版组件/i });

    fireEvent.click(trigger);

    // 点击第一张卡片
    const firstTemplate = CREATOR_SNIPPET_TEMPLATES[0];
    const cardTitle = screen.getByText(firstTemplate.name);
    fireEvent.click(cardTitle);

    expect(handleInsert).toHaveBeenCalledWith(
      "",
      "",
      expect.stringContaining(firstTemplate.html),
    );
  });
});
