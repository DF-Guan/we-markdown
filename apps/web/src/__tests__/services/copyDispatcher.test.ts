import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  dispatchCopy,
  SUPPORTED_PLATFORMS,
} from "../../services/copy/copyDispatcher";
import * as wechatCopyService from "../../services/wechatCopyService";
import toast from "react-hot-toast";

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("copyDispatcher (多平台分发调度服务)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should define all supported target platforms", () => {
    const ids = SUPPORTED_PLATFORMS.map((p) => p.id);
    expect(ids).toContain("wechat");
    expect(ids).toContain("zhihu");
    expect(ids).toContain("juejin");
    expect(ids).toContain("markdown");
  });

  it("should prevent dispatching when markdown is empty", async () => {
    const spy = vi.spyOn(wechatCopyService, "copyToWechat");
    await dispatchCopy("wechat", "   ", "");
    expect(spy).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("正文内容为空，无法复制");
  });

  it("should dispatch wechat copy via copyToWechat", async () => {
    const spy = vi
      .spyOn(wechatCopyService, "copyToWechat")
      .mockResolvedValue(undefined);

    await dispatchCopy("wechat", "# Hello", "p { color: red; }", {
      showMacBar: true,
    });

    expect(spy).toHaveBeenCalledWith("# Hello", "p { color: red; }", {
      showMacBar: true,
    });
  });

  it("should dispatch zhihu copy and notify success", async () => {
    const spy = vi
      .spyOn(wechatCopyService, "copyToWechat")
      .mockResolvedValue(undefined);

    await dispatchCopy("zhihu", "# Zhihu Article", "");

    expect(spy).toHaveBeenCalledWith("# Zhihu Article", "", {
      showMacBar: undefined,
    });
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("知乎专栏"),
      expect.anything(),
    );
  });

  it("should dispatch juejin copy and notify success", async () => {
    const spy = vi
      .spyOn(wechatCopyService, "copyToWechat")
      .mockResolvedValue(undefined);

    await dispatchCopy("juejin", "# Tech Article", "");

    expect(spy).toHaveBeenCalledWith("# Tech Article", "", {
      showMacBar: undefined,
    });
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("掘金专栏"),
      expect.anything(),
    );
  });

  it("should dispatch pure markdown copy via clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await dispatchCopy("markdown", "# Raw Markdown", "");

    expect(writeTextMock).toHaveBeenCalledWith("# Raw Markdown");
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("纯净 Markdown"),
      expect.anything(),
    );
  });
});
