import { useState, useEffect, useId } from "react";
import {
  Download,
  Monitor,
  Apple,
  Terminal,
  HardDrive,
  ShieldCheck,
  Zap,
  Command,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  X,
  FileCode,
  Package,
} from "lucide-react";
import darktuLogo from "../../assets/logo-128.png";
import {
  fetchLatestReleaseInfo,
  detectUserOS,
  GITHUB_RELEASES_PAGE,
  type ReleaseInfo,
  type PlatformDownloadItem,
  type MacArchitecture,
} from "../../services/download/downloadService";
import "./DownloadPortal.css";

interface DownloadPortalProps {
  onClose?: () => void;
  isStandaloneRoute?: boolean;
}

export function DownloadPortal({
  onClose,
  isStandaloneRoute = false,
}: DownloadPortalProps) {
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMacArch, setSelectedMacArch] =
    useState<MacArchitecture>("arm64");
  const winHeadingId = useId();
  const macHeadingId = useId();
  const linuxHeadingId = useId();

  useEffect(() => {
    let isMounted = true;
    fetchLatestReleaseInfo().then((info) => {
      if (isMounted) {
        setReleaseInfo(info);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const detected = releaseInfo?.detectedOS || detectUserOS();
  const version = releaseInfo?.version || "1.3.0";

  // 快捷获取当前 Mac 选中架构的安装包
  const getMacItem = (arch: MacArchitecture) => {
    const macCat = releaseInfo?.platforms.find((p) => p.os === "mac");
    if (!macCat) return null;
    return macCat.items.find((i) => i.id === `mac-${arch}`) || macCat.items[0];
  };

  // 渲染主推荐大按钮
  const renderPrimaryRecommendation = () => {
    if (loading) {
      return (
        <div className="download-hero-loading">
          <div className="download-spinner" />
          <span>正在智能识别您的操作系统并同步最新客户端...</span>
        </div>
      );
    }

    if (detected.os === "mac") {
      const activeMacItem = getMacItem(selectedMacArch);
      return (
        <div className="download-primary-box">
          <div className="mac-arch-toggle">
            <button
              className={`mac-arch-btn ${selectedMacArch === "arm64" ? "active" : ""}`}
              onClick={() => setSelectedMacArch("arm64")}
            >
              <Apple size={16} />
              <span>Apple 芯片 (M1/M2/M3/M4)</span>
              <span className="arch-badge">推荐</span>
            </button>
            <button
              className={`mac-arch-btn ${selectedMacArch === "x64" ? "active" : ""}`}
              onClick={() => setSelectedMacArch("x64")}
            >
              <Apple size={16} />
              <span>Intel 处理器版</span>
            </button>
          </div>

          <a
            href={activeMacItem?.downloadUrl}
            className="download-cta-primary"
            download
          >
            <Download size={22} strokeWidth={2.2} />
            <div className="download-cta-text">
              <div className="download-cta-title">
                立即下载 macOS 版 (
                {selectedMacArch === "arm64" ? "Apple Silicon" : "Intel"})
              </div>
              <div className="download-cta-sub">
                WeMarkdown {version} · {activeMacItem?.fileSize || "通用 .dmg"}{" "}
                · 原生适配 macOS
              </div>
            </div>
          </a>
        </div>
      );
    }

    if (detected.os === "windows") {
      const winCat = releaseInfo?.platforms.find((p) => p.os === "windows");
      const installerItem = winCat?.items.find((i) => i.id === "win-installer");
      const portableItem = winCat?.items.find((i) => i.id === "win-portable");

      return (
        <div className="download-primary-box">
          <a
            href={installerItem?.downloadUrl}
            className="download-cta-primary"
            download
          >
            <Download size={22} strokeWidth={2.2} />
            <div className="download-cta-text">
              <div className="download-cta-title">
                立即下载 Windows 客户端 (.exe)
              </div>
              <div className="download-cta-sub">
                WeMarkdown {version} · 64位安装包{" "}
                {installerItem?.fileSize ? `(${installerItem.fileSize})` : ""} ·
                自动配置快捷方式
              </div>
            </div>
          </a>

          {portableItem && (
            <div className="download-alt-link">
              <span>或下载：</span>
              <a href={portableItem.downloadUrl} download>
                免安装便携版 (.zip)
              </a>
              <span className="download-alt-tip">（无需安装，解压即用）</span>
            </div>
          )}
        </div>
      );
    }

    if (detected.os === "linux") {
      const linuxCat = releaseInfo?.platforms.find((p) => p.os === "linux");
      const appImageItem = linuxCat?.items.find(
        (i) => i.id === "linux-appimage",
      );
      const debItem = linuxCat?.items.find((i) => i.id === "linux-deb");

      return (
        <div className="download-primary-box">
          <a
            href={appImageItem?.downloadUrl}
            className="download-cta-primary"
            download
          >
            <Download size={22} strokeWidth={2.2} />
            <div className="download-cta-text">
              <div className="download-cta-title">
                下载 Linux 独立运行包 (.AppImage)
              </div>
              <div className="download-cta-sub">
                WeMarkdown {version} · 通用 x64 架构 · 双击赋予权限即可运行
              </div>
            </div>
          </a>

          {debItem && (
            <div className="download-alt-link">
              <span>或下载：</span>
              <a href={debItem.downloadUrl} download>
                Debian / Ubuntu 软件包 (.deb)
              </a>
            </div>
          )}
        </div>
      );
    }

    // 默认或移动端访客
    return (
      <div className="download-primary-box">
        <a
          href={releaseInfo?.platforms[0]?.items[0]?.downloadUrl}
          className="download-cta-primary"
          download
        >
          <Download size={22} strokeWidth={2.2} />
          <div className="download-cta-text">
            <div className="download-cta-title">下载 WeMarkdown 桌面客户端</div>
            <div className="download-cta-sub">
              最新版本 {version} · 点击获取全平台安装包
            </div>
          </div>
        </a>
      </div>
    );
  };

  return (
    <div
      className={`download-portal-container ${isStandaloneRoute ? "standalone" : "modal-overlay"}`}
    >
      <div className="download-portal-inner">
        {/* 顶部导航 */}
        <header className="download-header">
          <div className="download-brand">
            <img
              src={darktuLogo}
              alt="WeMarkdown Logo"
              width={38}
              height={38}
              className="download-brand-logo"
            />
            <div className="download-brand-meta">
              <div className="download-brand-name">
                WeMarkdown
                <span className="download-version-pill">v{version}</span>
              </div>
              <div className="download-brand-desc">
                优雅全能的跨端写作工作台
              </div>
            </div>
          </div>

          <div className="download-header-actions">
            <a
              href={GITHUB_RELEASES_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="download-ghost-btn"
              title="查看 GitHub Releases 发行记录"
            >
              <ExternalLink size={16} />
              <span>GitHub 发行记录</span>
            </a>

            {onClose && (
              <button
                className="download-close-btn"
                onClick={onClose}
                aria-label="返回编辑器"
                title="返回编辑器"
              >
                {isStandaloneRoute ? (
                  <>
                    <ArrowLeft size={16} />
                    <span>返回在线编辑器</span>
                  </>
                ) : (
                  <X size={20} />
                )}
              </button>
            )}
          </div>
        </header>

        {/* 首屏 Hero */}
        <section className="download-hero">
          <div className="download-hero-badge">
            <Sparkles size={14} />
            <span>全新桌面端 v{version} 现已发布</span>
          </div>
          <h1 className="download-hero-title">自由沉浸写作，从桌面开始</h1>
          <p className="download-hero-subtitle">
            更迅捷的本地文件互通、100%
            脱网离线运行与原生系统级性能。为创作者量身定制。
          </p>

          {/* 智能推荐主下载入口 */}
          {renderPrimaryRecommendation()}
        </section>

        {/* 全平台矩阵卡片 */}
        <section className="download-matrix-section">
          <div className="download-section-header">
            <h2 className="download-section-title">全平台安装包下载</h2>
            <p className="download-section-subtitle">
              针对不同操作系统提供优化编译包与免安装便携版
            </p>
          </div>

          <div className="download-cards-grid">
            {/* Windows 卡片 */}
            <div
              className={`platform-card ${detected.os === "windows" ? "highlighted" : ""}`}
            >
              <div className="platform-card-header">
                <div className="platform-card-icon win">
                  <Monitor size={24} />
                </div>
                <div>
                  <h3 id={winHeadingId} className="platform-card-title">
                    Windows
                  </h3>
                  <div className="platform-card-requirement">
                    Windows 10 / 11 (64位)
                  </div>
                </div>
                {detected.os === "windows" && (
                  <span className="platform-curr-tag">当前系统</span>
                )}
              </div>

              <div
                className="platform-items-list"
                aria-labelledby={winHeadingId}
              >
                {releaseInfo?.platforms
                  .find((p) => p.os === "windows")
                  ?.items.map((item) => (
                    <div key={item.id} className="platform-item-row">
                      <div className="platform-item-info">
                        <div className="platform-item-name">
                          <Package size={15} />
                          <span>{item.name}</span>
                          {item.fileSize && (
                            <span className="item-size-pill">
                              {item.fileSize}
                            </span>
                          )}
                        </div>
                        <div className="platform-item-desc">
                          {item.description}
                        </div>
                      </div>
                      <a
                        href={item.downloadUrl}
                        className="platform-download-action"
                        download
                        title={`下载 ${item.fileName}`}
                      >
                        <Download size={15} />
                        <span>下载</span>
                      </a>
                    </div>
                  ))}
              </div>
            </div>

            {/* macOS 卡片 */}
            <div
              className={`platform-card ${detected.os === "mac" ? "highlighted" : ""}`}
            >
              <div className="platform-card-header">
                <div className="platform-card-icon mac">
                  <Apple size={24} />
                </div>
                <div>
                  <h3 id={macHeadingId} className="platform-card-title">
                    macOS
                  </h3>
                  <div className="platform-card-requirement">
                    macOS 11.0 (Big Sur) 及以上
                  </div>
                </div>
                {detected.os === "mac" && (
                  <span className="platform-curr-tag">当前系统</span>
                )}
              </div>

              <div
                className="platform-items-list"
                aria-labelledby={macHeadingId}
              >
                {releaseInfo?.platforms
                  .find((p) => p.os === "mac")
                  ?.items.map((item) => (
                    <div key={item.id} className="platform-item-row">
                      <div className="platform-item-info">
                        <div className="platform-item-name">
                          <Package size={15} />
                          <span>{item.name}</span>
                          {item.fileSize && (
                            <span className="item-size-pill">
                              {item.fileSize}
                            </span>
                          )}
                        </div>
                        <div className="platform-item-desc">
                          {item.description}
                        </div>
                      </div>
                      <a
                        href={item.downloadUrl}
                        className="platform-download-action"
                        download
                        title={`下载 ${item.fileName}`}
                      >
                        <Download size={15} />
                        <span>下载</span>
                      </a>
                    </div>
                  ))}
              </div>
            </div>

            {/* Linux 卡片 */}
            <div
              className={`platform-card ${detected.os === "linux" ? "highlighted" : ""}`}
            >
              <div className="platform-card-header">
                <div className="platform-card-icon linux">
                  <Terminal size={24} />
                </div>
                <div>
                  <h3 id={linuxHeadingId} className="platform-card-title">
                    Linux
                  </h3>
                  <div className="platform-card-requirement">
                    Ubuntu / Debian / Arch / Fedora
                  </div>
                </div>
                {detected.os === "linux" && (
                  <span className="platform-curr-tag">当前系统</span>
                )}
              </div>

              <div
                className="platform-items-list"
                aria-labelledby={linuxHeadingId}
              >
                {releaseInfo?.platforms
                  .find((p) => p.os === "linux")
                  ?.items.map((item) => (
                    <div key={item.id} className="platform-item-row">
                      <div className="platform-item-info">
                        <div className="platform-item-name">
                          <Package size={15} />
                          <span>{item.name}</span>
                          {item.fileSize && (
                            <span className="item-size-pill">
                              {item.fileSize}
                            </span>
                          )}
                        </div>
                        <div className="platform-item-desc">
                          {item.description}
                        </div>
                      </div>
                      <a
                        href={item.downloadUrl}
                        className="platform-download-action"
                        download
                        title={`下载 ${item.fileName}`}
                      >
                        <Download size={15} />
                        <span>下载</span>
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* 客户端专属核心优势 */}
        <section className="download-features-section">
          <div className="download-section-header">
            <h2 className="download-section-title">
              为什么创作者更青睐客户端？
            </h2>
            <p className="download-section-subtitle">
              摆脱浏览器约束，享受无延迟、不受限的创作掌控感
            </p>
          </div>

          <div className="download-features-grid">
            <div className="feature-item-card">
              <div className="feature-icon-wrapper">
                <HardDrive size={22} />
              </div>
              <h4 className="feature-card-title">本地文件秒开秒存</h4>
              <p className="feature-card-text">
                原生接入系统文件管理器。支持直接打开和实时保存本地任意 Markdown
                目录，再也无需每次手动上传或导出。
              </p>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={22} />
              </div>
              <h4 className="feature-card-title">100% 离线脱网运行</h4>
              <p className="feature-card-text">
                高铁、长途航班或户外断网环境均可无缝使用。数据全部保存在本地硬盘，隐私零外泄，文章安全高枕无忧。
              </p>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-wrapper">
                <Zap size={22} />
              </div>
              <h4 className="feature-card-title">系统原生极致性能</h4>
              <p className="feature-card-text">
                独占原生渲染引擎与独立内存空间，打破浏览器单个网页标签 4GB
                内存与垃圾回收卡顿限制，万字长文丝滑如飞。
              </p>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-wrapper">
                <Command size={22} />
              </div>
              <h4 className="feature-card-title">原生快捷键与沉浸窗口</h4>
              <p className="feature-card-text">
                深度整合系统级快捷键与毛玻璃透明标题栏，支持开机常驻、系统深色模式自适应跟随与原生剪贴板直写。
              </p>
            </div>
          </div>
        </section>

        {/* 首次安装指南与安全声明 */}
        <section className="download-faq-section">
          <div className="faq-notice-card">
            <div className="faq-notice-header">
              <CheckCircle2 size={20} className="faq-icon-success" />
              <span>100% 开源安全与官方构建</span>
            </div>
            <p className="faq-notice-body">
              WeMarkdown 由 GitHub Actions 自动化流水线公开构建，代码 100%
              开源透明且无任何恶意追踪。
              <br />• <strong>Windows 提示</strong>：首次启动如弹出 SmartScreen
              拦截蓝窗，点击 <em>“更多信息”</em> ➜ <em>“仍要运行”</em> 即可。
              <br />• <strong>macOS 提示</strong>
              ：首次打开若提示“无法验证开发者”，请进入系统{" "}
              <em>“设置 ➜ 隐私与安全性”</em>，点击底部的 <em>“仍要打开”</em>{" "}
              即可信任运行。
            </p>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="download-footer">
          <div className="footer-links">
            <a
              href="https://github.com/DF-Guan/we-markdown"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileCode size={14} />
              <span>GitHub 源码</span>
            </a>
            <span className="footer-dot">·</span>
            <a
              href="https://github.com/DF-Guan/we-markdown/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>历史发行版本</span>
            </a>
            <span className="footer-dot">·</span>
            <a
              href="https://darktu.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Darktu 旗下产品</span>
            </a>
          </div>
          <p className="footer-copyright">
            © {new Date().getFullYear()} WeMarkdown Team. Released under the
            MIT License.
          </p>
        </footer>
      </div>
    </div>
  );
}
