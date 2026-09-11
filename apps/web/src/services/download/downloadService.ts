/**
 * WeMarkdown 客户端下载中心服务
 * 提供操作系统智能嗅探、GitHub Releases API 动态直链解析与智能离线/限流降级
 */

export type SupportedOS = "windows" | "mac" | "linux" | "mobile" | "unknown";
export type MacArchitecture = "arm64" | "x64";

export interface OSDetectionResult {
  os: SupportedOS;
  arch?: MacArchitecture;
  label: string;
  recommendedExt: string;
}

export interface PlatformDownloadItem {
  id: string;
  name: string;
  description: string;
  fileName: string;
  downloadUrl: string;
  fileSize?: string;
  recommended?: boolean;
}

export interface PlatformCategory {
  os: "windows" | "mac" | "linux";
  title: string;
  badge: string;
  minRequirement: string;
  items: PlatformDownloadItem[];
}

export interface ReleaseInfo {
  version: string;
  publishedAt?: string;
  releaseNotes?: string;
  platforms: PlatformCategory[];
  recommendedItem?: PlatformDownloadItem;
  detectedOS: OSDetectionResult;
}

const GITHUB_REPO = "DF-Guan/we-markdown";
export const LATEST_RELEASE_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const GITHUB_RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases`;
export const FALLBACK_VERSION = "1.3.0";

/**
 * 智能探测当前用户的操作系统与芯片架构
 */
export function detectUserOS(
  userAgent?: string,
  platform?: string,
): OSDetectionResult {
  const ua = (
    userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "")
  ).toLowerCase();
  const plat = (
    platform || (typeof navigator !== "undefined" ? navigator.platform : "")
  ).toLowerCase();

  // 移动端排查
  if (/android|iphone|ipad|ipod|mobile/i.test(ua)) {
    return {
      os: "mobile",
      label: "移动设备",
      recommendedExt: "web",
    };
  }

  // Windows 系统检测
  if (/win/i.test(ua) || /win/i.test(plat)) {
    return {
      os: "windows",
      label: "Windows",
      recommendedExt: ".exe",
    };
  }

  // macOS 系统与芯片架构检测
  if (/mac/i.test(ua) || /mac/i.test(plat)) {
    const isArm64 = /arm64|aarch64/i.test(ua);
    return {
      os: "mac",
      arch: isArm64 ? "arm64" : "arm64", // 默认优先推荐现代主流 Apple Silicon
      label: "macOS",
      recommendedExt: ".dmg",
    };
  }

  // Linux 系统检测
  if (/linux/i.test(ua) || /linux/i.test(plat)) {
    return {
      os: "linux",
      label: "Linux",
      recommendedExt: ".AppImage",
    };
  }

  return {
    os: "unknown",
    label: "其他操作系统",
    recommendedExt: ".zip",
  };
}

/**
 * 格式化字节大小为 MB 文本
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

interface RawGithubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

/**
 * 构建静态兜底的平台安装包列表（当 GitHub API 离线或受限时使用）
 */
export function buildFallbackPlatforms(version: string): PlatformCategory[] {
  const cleanVersion = version.replace(/^v/, "");
  const baseDownloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${cleanVersion}`;

  return [
    {
      os: "windows",
      title: "Windows",
      badge: "64-bit",
      minRequirement: "Windows 10 / 11 (64位)",
      items: [
        {
          id: "win-installer",
          name: "安装程序 (推荐)",
          description: "一键安装，支持自动创建桌面快捷方式与后续无感更新",
          fileName: `WeMarkdown-Setup-${cleanVersion}.exe`,
          downloadUrl: `${baseDownloadUrl}/WeMarkdown-Setup-${cleanVersion}.exe`,
          recommended: true,
        },
        {
          id: "win-portable",
          name: "免安装便携版 (.zip)",
          description: "解压即用，不写系统注册表，随身 U 盘携带方便",
          fileName: `WeMarkdown-${cleanVersion}-win.zip`,
          downloadUrl: `${baseDownloadUrl}/WeMarkdown-${cleanVersion}-win.zip`,
        },
      ],
    },
    {
      os: "mac",
      title: "macOS",
      badge: "Universal",
      minRequirement: "macOS 11.0 (Big Sur) 或更高版本",
      items: [
        {
          id: "mac-arm64",
          name: "Apple Silicon (推荐)",
          description: "原生适配 Apple Silicon 全系芯片，冷启动极速，超低功耗",
          fileName: `WeMarkdown-${cleanVersion}-arm64.dmg`,
          downloadUrl: `${baseDownloadUrl}/WeMarkdown-${cleanVersion}-arm64.dmg`,
          recommended: true,
        },
        {
          id: "mac-x64",
          name: "Intel 芯片版 (.dmg)",
          description: "适用于采用传统 Intel 酷睿处理器的 Mac 电脑",
          fileName: `WeMarkdown-${cleanVersion}-x64.dmg`,
          downloadUrl: `${baseDownloadUrl}/WeMarkdown-${cleanVersion}-x64.dmg`,
        },
        {
          id: "mac-zip",
          name: "通用免安装压缩包 (.zip)",
          description: "便携式 macOS 应用归档，解压即可直接拖移运行",
          fileName: `WeMarkdown-${cleanVersion}-mac.zip`,
          downloadUrl: `${baseDownloadUrl}/WeMarkdown-${cleanVersion}-mac.zip`,
        },
      ],
    },
    {
      os: "linux",
      title: "Linux",
      badge: "x64",
      minRequirement: "Ubuntu 20.04+ / Debian 11+ / Fedora / Arch",
      items: [
        {
          id: "linux-appimage",
          name: "AppImage (推荐)",
          description: "免安装通用独立二进制包，赋予执行权限后双击即用",
          fileName: `WeMarkdown-${cleanVersion}.AppImage`,
          downloadUrl: `${baseDownloadUrl}/WeMarkdown-${cleanVersion}.AppImage`,
          recommended: true,
        },
        {
          id: "linux-deb",
          name: "Debian / Ubuntu 软件包 (.deb)",
          description: "适用于 APT 生态的原生 deb 软件分发包",
          fileName: `WeMarkdown-${cleanVersion}_amd64.deb`,
          downloadUrl: `${baseDownloadUrl}/WeMarkdown-${cleanVersion}_amd64.deb`,
        },
      ],
    },
  ];
}

/**
 * 将 GitHub API 返回的真实 assets 合并到标准平台模型中
 */
export function mergeAssetsWithPlatforms(
  categories: PlatformCategory[],
  assets: RawGithubAsset[],
): PlatformCategory[] {
  if (!assets || assets.length === 0) return categories;

  return categories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => {
      // 模糊匹配 assets 中的同类安装包
      const matched = assets.find((a) => {
        const name = a.name.toLowerCase();
        if (item.id === "win-installer") return name.endsWith(".exe");
        if (item.id === "win-portable")
          return (
            name.endsWith("win.zip") ||
            (name.includes("win") && name.endsWith(".zip"))
          );
        if (item.id === "mac-arm64")
          return name.includes("arm64") && name.endsWith(".dmg");
        if (item.id === "mac-x64")
          return (
            (name.includes("x64") || name.includes("intel")) &&
            name.endsWith(".dmg")
          );
        if (item.id === "mac-zip")
          return name.includes("mac") && name.endsWith(".zip");
        if (item.id === "linux-appimage") return name.endsWith(".appimage");
        if (item.id === "linux-deb") return name.endsWith(".deb");
        return false;
      });

      if (matched) {
        return {
          ...item,
          fileName: matched.name,
          downloadUrl: matched.browser_download_url,
          fileSize: formatBytes(matched.size),
        };
      }
      return item;
    }),
  }));
}

/**
 * 获取最新客户端发布信息（带内存缓存与静态降级）
 */
let cachedReleaseInfo: ReleaseInfo | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10分钟缓存

export async function fetchLatestReleaseInfo(): Promise<ReleaseInfo> {
  const detectedOS = detectUserOS();
  const now = Date.now();

  if (cachedReleaseInfo && now - lastFetchTime < CACHE_TTL_MS) {
    return {
      ...cachedReleaseInfo,
      detectedOS,
    };
  }

  let version = FALLBACK_VERSION;
  let publishedAt: string | undefined;
  let releaseNotes: string | undefined;
  let platforms = buildFallbackPlatforms(version);

  try {
    const response = await fetch(LATEST_RELEASE_API, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.tag_name) {
        version = data.tag_name.replace(/^v/, "");
      }
      publishedAt = data.published_at
        ? data.published_at.slice(0, 10)
        : undefined;
      releaseNotes = data.body || "";

      // 重新根据最新 version 构造平台
      platforms = buildFallbackPlatforms(version);
      if (Array.isArray(data.assets)) {
        platforms = mergeAssetsWithPlatforms(platforms, data.assets);
      }
    }
  } catch (err) {
    console.warn(
      "[downloadService] Failed to fetch release from GitHub API, using fallback",
      err,
    );
  }

  // 计算当前用户的推荐安装项
  let recommendedItem: PlatformDownloadItem | undefined;
  const targetCategory = platforms.find((p) => p.os === detectedOS.os);
  if (targetCategory) {
    recommendedItem =
      targetCategory.items.find((i) => i.recommended) ||
      targetCategory.items[0];
  } else {
    // 默认回退到 Windows 安装程序
    const winCategory = platforms.find((p) => p.os === "windows");
    recommendedItem = winCategory?.items[0];
  }

  cachedReleaseInfo = {
    version,
    publishedAt,
    releaseNotes,
    platforms,
    recommendedItem,
    detectedOS,
  };
  lastFetchTime = now;

  return cachedReleaseInfo;
}

/**
 * 清除缓存（主要用于测试）
 */
export function resetReleaseCacheForTesting(): void {
  cachedReleaseInfo = null;
  lastFetchTime = 0;
}
