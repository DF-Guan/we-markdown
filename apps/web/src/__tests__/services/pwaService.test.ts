import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isOnline,
  onNetworkStatusChange,
  isPWAInstallable,
  promptPWAInstall,
  onPWAInstallableChange,
  registerServiceWorker,
} from "../../services/pwa/pwaService";

describe("pwaService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should report online status correctly", () => {
    expect(typeof isOnline()).toBe("boolean");
  });

  it("should handle network status listener and cleanup", () => {
    const callback = vi.fn();
    const cleanup = onNetworkStatusChange(callback);

    window.dispatchEvent(new Event("online"));
    expect(callback).toHaveBeenCalledWith(true);

    window.dispatchEvent(new Event("offline"));
    expect(callback).toHaveBeenCalledWith(false);

    cleanup();
  });

  it("should report installable false initially", () => {
    expect(isPWAInstallable()).toBe(false);
  });

  it("should subscribe to installable changes", () => {
    const callback = vi.fn();
    const unsubscribe = onPWAInstallableChange(callback);
    expect(callback).toHaveBeenCalledWith(false);
    unsubscribe();
  });

  it("should safely return false when promptPWAInstall is called without prompt event", async () => {
    const installed = await promptPWAInstall();
    expect(installed).toBe(false);
  });

  it("should register service worker when supported", async () => {
    const mockRegister = vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
    });

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: mockRegister,
      },
      writable: true,
      configurable: true,
    });

    const reg = await registerServiceWorker();
    expect(mockRegister).toHaveBeenCalledWith("./sw.js", { scope: "./" });
    expect(reg).toBeTruthy();
  });
});
