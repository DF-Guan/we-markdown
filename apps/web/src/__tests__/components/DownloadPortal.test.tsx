import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DownloadPortal } from "../../components/DownloadPortal/DownloadPortal";
import * as downloadService from "../../services/download/downloadService";

describe("DownloadPortal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    downloadService.resetReleaseCacheForTesting();
  });

  afterEach(() => {
    downloadService.resetReleaseCacheForTesting();
  });

  it("renders brand, hero title, and platform categories correctly", async () => {
    vi.spyOn(downloadService, "fetchLatestReleaseInfo").mockResolvedValue({
      version: "1.3.0",
      platforms: downloadService.buildFallbackPlatforms("1.3.0"),
      detectedOS: {
        os: "windows",
        label: "Windows",
        recommendedExt: ".exe",
      },
    });

    render(<DownloadPortal onClose={vi.fn()} />);

    expect(screen.getByText("自由沉浸写作，从桌面开始")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("全平台安装包下载")).toBeInTheDocument();
    });

    expect(screen.getByText("Windows")).toBeInTheDocument();
    expect(screen.getByText("macOS")).toBeInTheDocument();
    expect(screen.getByText("Linux")).toBeInTheDocument();
  });

  it("calls onClose callback when close button is clicked", async () => {
    const handleClose = vi.fn();
    render(<DownloadPortal onClose={handleClose} />);

    const closeBtn = screen.getByTitle("返回编辑器");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("toggles mac chip architecture between Apple Silicon and Intel", async () => {
    vi.spyOn(downloadService, "fetchLatestReleaseInfo").mockResolvedValue({
      version: "1.3.0",
      platforms: downloadService.buildFallbackPlatforms("1.3.0"),
      detectedOS: {
        os: "mac",
        arch: "arm64",
        label: "macOS",
        recommendedExt: ".dmg",
      },
    });

    render(<DownloadPortal onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Apple 芯片/)).toBeInTheDocument();
    });

    const intelBtn = screen.getByText("Intel 处理器版");
    fireEvent.click(intelBtn);

    expect(screen.getByText(/立即下载 macOS 版 \(Intel\)/)).toBeInTheDocument();
  });

  it("displays client exclusive feature highlights", async () => {
    render(<DownloadPortal />);

    expect(screen.getByText("本地文件秒开秒存")).toBeInTheDocument();
    expect(screen.getByText("100% 离线脱网运行")).toBeInTheDocument();
    expect(screen.getByText("系统原生极致性能")).toBeInTheDocument();
    expect(screen.getByText("原生快捷键与沉浸窗口")).toBeInTheDocument();
  });
});
