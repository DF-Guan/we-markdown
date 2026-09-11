import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AICopilotPopover } from "../../components/Editor/AICopilotPopover";
import { saveAIConfig } from "../../services/ai/aiConfig";

describe("AICopilotPopover", () => {
  beforeEach(() => {
    localStorage.clear();
    saveAIConfig({
      provider: "deepseek",
      apiKey: "sk-mock-for-component-test",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
    });
  });

  it("should render the AI trigger button in toolbar", () => {
    render(<AICopilotPopover content="# 标题" />);
    const triggerBtn = screen.getByRole("button", { name: /AI 创作副驾驶/i });
    expect(triggerBtn).toBeInTheDocument();
  });

  it("should open popover on trigger button click and display tabs", () => {
    render(<AICopilotPopover content="# 标题" />);
    const triggerBtn = screen.getByRole("button", { name: /AI 创作副驾驶/i });
    fireEvent.click(triggerBtn);

    expect(screen.getByText("AI 创作副驾驶")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^爆款标题$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^智能润色$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^摘要金句$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^设置$/i })).toBeInTheDocument();
  });

  it("should switch between tabs properly", () => {
    render(<AICopilotPopover content="# 标题" />);
    const triggerBtn = screen.getByRole("button", { name: /AI 创作副驾驶/i });
    fireEvent.click(triggerBtn);

    // Switch to Settings
    fireEvent.click(screen.getByRole("button", { name: /^设置$/i }));
    expect(screen.getByText("服务商 (Provider)")).toBeInTheDocument();
    expect(screen.getByText("Base URL")).toBeInTheDocument();
    expect(screen.getByText("模型名称 (Model)")).toBeInTheDocument();

    // Switch to Polish
    fireEvent.click(screen.getByRole("button", { name: /^智能润色$/i }));
    expect(screen.getByText(/去 AI 味/)).toBeInTheDocument();
    expect(screen.getByText(/爆款网感/)).toBeInTheDocument();

    // Switch to Summary
    fireEvent.click(screen.getByRole("button", { name: /^摘要金句$/i }));
    expect(
      screen.getByRole("button", { name: /提炼精华导读与金句/i }),
    ).toBeInTheDocument();
  });

  it("should close popover when close icon is clicked", () => {
    render(<AICopilotPopover content="# 标题" />);
    const triggerBtn = screen.getByRole("button", { name: /AI 创作副驾驶/i });
    fireEvent.click(triggerBtn);

    const closeBtn = screen.getByRole("button", { name: /关闭/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText("AI 创作副驾驶")).not.toBeInTheDocument();
  });

  it("should close popover when Escape key is pressed", () => {
    render(<AICopilotPopover content="# 标题" />);
    const triggerBtn = screen.getByRole("button", { name: /AI 创作副驾驶/i });
    fireEvent.click(triggerBtn);
    expect(screen.getByText("AI 创作副驾驶")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("AI 创作副驾驶")).not.toBeInTheDocument();
  });
});
