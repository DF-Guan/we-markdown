import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  detectUserOS,
  formatBytes,
  buildFallbackPlatforms,
  mergeAssetsWithPlatforms,
  fetchLatestReleaseInfo,
  resetReleaseCacheForTesting,
  LATEST_RELEASE_API,
} from "../../services/download/downloadService";

describe("downloadService", () => {
  beforeEach(() => {
    resetReleaseCacheForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    resetReleaseCacheForTesting();
  });

  describe("detectUserOS", () => {
    it("identifies Windows user agent correctly", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
      const result = detectUserOS(ua, "Win32");
      expect(result.os).toBe("windows");
      expect(result.label).toBe("Windows");
      expect(result.recommendedExt).toBe(".exe");
    });

    it("identifies macOS user agent correctly", () => {
      const ua =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
      const result = detectUserOS(ua, "MacIntel");
      expect(result.os).toBe("mac");
      expect(result.label).toBe("macOS");
      expect(result.recommendedExt).toBe(".dmg");
    });

    it("identifies Linux user agent correctly", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36";
      const result = detectUserOS(ua, "Linux x86_64");
      expect(result.os).toBe("linux");
      expect(result.label).toBe("Linux");
      expect(result.recommendedExt).toBe(".AppImage");
    });

    it("identifies mobile devices correctly", () => {
      const ua =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
      const result = detectUserOS(ua, "iPhone");
      expect(result.os).toBe("mobile");
      expect(result.label).toBe("移动设备");
    });
  });

  describe("formatBytes", () => {
    it("formats bytes to MB properly", () => {
      expect(formatBytes(0)).toBe("");
      expect(formatBytes(85 * 1024 * 1024)).toBe("85.0 MB");
      expect(formatBytes(92.45 * 1024 * 1024)).toBe("92.5 MB");
    });
  });

  describe("buildFallbackPlatforms", () => {
    it("generates structured categories with expected items for given version", () => {
      const platforms = buildFallbackPlatforms("1.3.0");
      expect(platforms).toHaveLength(3);

      const win = platforms.find((p) => p.os === "windows");
      expect(win).toBeDefined();
      expect(win?.items[0].downloadUrl).toContain("WeMarkdown-Setup-1.3.0.exe");

      const mac = platforms.find((p) => p.os === "mac");
      expect(mac).toBeDefined();
      expect(mac?.items[0].downloadUrl).toContain("WeMarkdown-1.3.0-arm64.dmg");

      const linux = platforms.find((p) => p.os === "linux");
      expect(linux).toBeDefined();
      expect(linux?.items[0].downloadUrl).toContain(
        "WeMarkdown-1.3.0.AppImage",
      );
    });
  });

  describe("mergeAssetsWithPlatforms", () => {
    it("merges raw GitHub assets into platform categories", () => {
      const initial = buildFallbackPlatforms("1.3.0");
      const mockAssets = [
        {
          name: "WeMarkdown-Setup-1.3.0.exe",
          browser_download_url:
            "https://github.com/downloads/WeMarkdown-Setup-1.3.0.exe",
          size: 85 * 1024 * 1024,
        },
        {
          name: "WeMarkdown-1.3.0-arm64.dmg",
          browser_download_url:
            "https://github.com/downloads/WeMarkdown-1.3.0-arm64.dmg",
          size: 90 * 1024 * 1024,
        },
      ];

      const merged = mergeAssetsWithPlatforms(initial, mockAssets);
      const winItem = merged
        .find((p) => p.os === "windows")
        ?.items.find((i) => i.id === "win-installer");
      expect(winItem?.downloadUrl).toBe(
        "https://github.com/downloads/WeMarkdown-Setup-1.3.0.exe",
      );
      expect(winItem?.fileSize).toBe("85.0 MB");

      const macArmItem = merged
        .find((p) => p.os === "mac")
        ?.items.find((i) => i.id === "mac-arm64");
      expect(macArmItem?.downloadUrl).toBe(
        "https://github.com/downloads/WeMarkdown-1.3.0-arm64.dmg",
      );
      expect(macArmItem?.fileSize).toBe("90.0 MB");
    });

    it("correctly prioritizes setup installer over elevate.exe and matches universal/x64 dmg", () => {
      const initial = buildFallbackPlatforms("1.3.0");
      const mockAssets = [
        {
          name: "elevate.exe",
          browser_download_url: "https://github.com/downloads/elevate.exe",
          size: 107520,
        },
        {
          name: "WeMarkdown.Setup.1.3.0.exe",
          browser_download_url:
            "https://github.com/downloads/WeMarkdown.Setup.1.3.0.exe",
          size: 85698519,
        },
        {
          name: "WeMarkdown-1.3.0-arm64.dmg",
          browser_download_url:
            "https://github.com/downloads/WeMarkdown-1.3.0-arm64.dmg",
          size: 107917127,
        },
        {
          name: "WeMarkdown-1.3.0.dmg",
          browser_download_url:
            "https://github.com/downloads/WeMarkdown-1.3.0.dmg",
          size: 109859055,
        },
      ];

      const merged = mergeAssetsWithPlatforms(initial, mockAssets);
      const winInstaller = merged
        .find((p) => p.os === "windows")
        ?.items.find((i) => i.id === "win-installer");
      expect(winInstaller?.fileName).toBe("WeMarkdown.Setup.1.3.0.exe");
      expect(winInstaller?.fileSize).toBe("81.7 MB");

      const macX64 = merged
        .find((p) => p.os === "mac")
        ?.items.find((i) => i.id === "mac-x64");
      expect(macX64?.fileName).toBe("WeMarkdown-1.3.0.dmg");
      expect(macX64?.fileSize).toBe("104.8 MB");
    });
  });

  describe("fetchLatestReleaseInfo", () => {
    it("fetches and parses release data from GitHub API successfully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tag_name: "v1.3.5",
          published_at: "2026-09-10T12:00:00Z",
          body: "### Features\n- New AI Copilot\n- Full download portal",
          assets: [
            {
              name: "WeMarkdown-Setup-1.3.5.exe",
              browser_download_url:
                "https://github.com/DF-Guan/we-markdown/releases/download/v1.3.5/WeMarkdown-Setup-1.3.5.exe",
              size: 88 * 1024 * 1024,
            },
          ],
        }),
      });
      globalThis.fetch = mockFetch;

      const releaseInfo = await fetchLatestReleaseInfo();
      expect(mockFetch).toHaveBeenCalledWith(
        LATEST_RELEASE_API,
        expect.any(Object),
      );
      expect(releaseInfo.version).toBe("1.3.5");
      expect(releaseInfo.publishedAt).toBe("2026-09-10");
      expect(releaseInfo.releaseNotes).toContain("New AI Copilot");
      expect(releaseInfo.platforms).toBeDefined();
    });

    it("falls back gracefully when GitHub API fails", async () => {
      globalThis.fetch = vi
        .fn()
        .mockRejectedValue(new Error("Network rate limit error"));

      const releaseInfo = await fetchLatestReleaseInfo();
      expect(releaseInfo.version).toBe("1.3.0");
      expect(releaseInfo.platforms).toHaveLength(3);
      expect(releaseInfo.recommendedItem).toBeDefined();
    });
  });
});
