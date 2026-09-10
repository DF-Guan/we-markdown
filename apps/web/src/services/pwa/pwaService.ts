/**
 * WeMarkdown PWA 服务管理器 (pwaService.ts)
 * 负责注册 Service Worker、监听离线状态感知与「添加到桌面 / 安装应用」原生引导
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const installableListeners = new Set<(installable: boolean) => void>();

/**
 * 注册 PWA Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  // 若处于 Electron 桌面端，则无需注册 PWA
  const isElectron =
    typeof window !== "undefined" &&
    Boolean((window as unknown as { electron?: unknown }).electron);
  if (isElectron) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("./sw.js", {
      scope: "./",
    });

    // 监听 Service Worker 更新
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log(
              "[WeMarkdown PWA] 发现新版本 Service Worker，将在下一次启动时自动生效",
            );
          }
        });
      }
    });

    // 捕获安装提示事件
    window.addEventListener("beforeinstallprompt", (e: Event) => {
      e.preventDefault();
      deferredInstallPrompt = e as BeforeInstallPromptEvent;
      notifyInstallable(true);
    });

    // 捕获已安装事件
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      notifyInstallable(false);
      console.log("[WeMarkdown PWA] 应用程序已成功安装至本地桌面");
    });

    return registration;
  } catch (error) {
    console.warn("[WeMarkdown PWA] Service Worker 注册失败:", error);
    return null;
  }
}

function notifyInstallable(installable: boolean) {
  installableListeners.forEach((fn) => {
    try {
      fn(installable);
    } catch {
      /* 忽略回调内异常 */
    }
  });
}

/**
 * 检查当前是否可唤起原生 PWA 安装面板
 */
export function isPWAInstallable(): boolean {
  return deferredInstallPrompt !== null;
}

/**
 * 触发原生 PWA 安装引导
 */
export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) {
    return false;
  }

  try {
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    notifyInstallable(false);
    return choice.outcome === "accepted";
  } catch (error) {
    console.warn("[WeMarkdown PWA] 唤起安装提示失败:", error);
    return false;
  }
}

/**
 * 订阅 PWA 是否可安装状态变更
 */
export function onPWAInstallableChange(
  callback: (installable: boolean) => void,
): () => void {
  installableListeners.add(callback);
  callback(isPWAInstallable());
  return () => {
    installableListeners.delete(callback);
  };
}

/**
 * 获取当前网络在线状态
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined" || !("onLine" in navigator)) {
    return true;
  }
  return navigator.onLine;
}

/**
 * 监听网络在线/离线状态
 */
export function onNetworkStatusChange(
  callback: (online: boolean) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
