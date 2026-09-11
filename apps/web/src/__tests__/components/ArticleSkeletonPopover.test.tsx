import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArticleSkeletonPopover } from "../../components/Editor/ArticleSkeletonPopover";
import { ARTICLE_SKELETONS } from "../../components/Editor/articleSkeletons";

describe("ArticleSkeletonPopover (文章起手式模板弹窗)", () => {
  it("renders trigger button with aria-label", () => {
    render(<ArticleSkeletonPopover onInsertContent={() => {}} />);
    const trigger = screen.getByLabelText("自媒体起手式文章骨架模板");
    expect(trigger).toBeDefined();
  });

  it("opens popover on click and lists all skeleton cards", () => {
    render(<ArticleSkeletonPopover onInsertContent={() => {}} />);
    const trigger = screen.getByLabelText("自媒体起手式文章骨架模板");

    fireEvent.click(trigger);

    expect(screen.getByText("自媒体文章起手式模板")).toBeDefined();
    ARTICLE_SKELETONS.forEach((skeleton) => {
      expect(screen.getByText(skeleton.name)).toBeDefined();
      expect(screen.getByText(skeleton.badge)).toBeDefined();
    });
  });

  it("calls onInsertContent when clicking insert button", () => {
    const onInsertContent = vi.fn();
    render(<ArticleSkeletonPopover onInsertContent={onInsertContent} />);
    const trigger = screen.getByLabelText("自媒体起手式文章骨架模板");

    fireEvent.click(trigger);

    const insertBtns = screen.getAllByRole("button", { name: /光标插入/i });
    expect(insertBtns.length).toBeGreaterThan(0);
    fireEvent.click(insertBtns[0]);

    expect(onInsertContent).toHaveBeenCalledTimes(1);
    expect(onInsertContent).toHaveBeenCalledWith(ARTICLE_SKELETONS[0].content);
  });

  it("calls onReplaceContent when clicking replace button", () => {
    const onReplaceContent = vi.fn();
    render(
      <ArticleSkeletonPopover
        onInsertContent={() => {}}
        onReplaceContent={onReplaceContent}
        currentContentLength={10}
      />,
    );
    const trigger = screen.getByLabelText("自媒体起手式文章骨架模板");

    fireEvent.click(trigger);

    const replaceBtns = screen.getAllByRole("button", { name: /应用全文/i });
    expect(replaceBtns.length).toBeGreaterThan(0);
    fireEvent.click(replaceBtns[0]);

    expect(onReplaceContent).toHaveBeenCalledTimes(1);
    expect(onReplaceContent).toHaveBeenCalledWith(ARTICLE_SKELETONS[0].content);
  });
});
