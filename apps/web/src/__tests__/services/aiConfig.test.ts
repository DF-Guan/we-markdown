import { describe, it, expect, beforeEach } from "vitest";
import {
  encryptData,
  decryptData,
  loadAIConfig,
  saveAIConfig,
  isAIConfigured,
  getDefaultAIConfig,
  AI_PROVIDERS,
} from "../../services/ai/aiConfig";

describe("aiConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should encrypt and decrypt string accurately", () => {
    const raw = "sk-test-secret-api-key-123456";
    const cipher = encryptData(raw);
    expect(cipher).not.toBe(raw);
    expect(cipher.length).toBeGreaterThan(0);

    const decrypted = decryptData(cipher);
    expect(decrypted).toBe(raw);
  });

  it("should return empty string when encrypting empty data", () => {
    expect(encryptData("")).toBe("");
    expect(decryptData("")).toBe("");
  });

  it("should load default config when localStorage is empty", () => {
    const config = loadAIConfig();
    expect(config.provider).toBe("deepseek");
    expect(config.apiKey).toBe("");
    expect(config.baseUrl).toBe(AI_PROVIDERS.deepseek.baseUrl);
    expect(config.model).toBe(AI_PROVIDERS.deepseek.defaultModel);
    expect(isAIConfigured()).toBe(false);
  });

  it("should save and load encrypted AI config", () => {
    saveAIConfig({
      provider: "siliconflow",
      apiKey: "sk-silicon-test-key",
      baseUrl: "https://api.siliconflow.cn/v1",
      model: "deepseek-ai/DeepSeek-V3",
    });

    expect(isAIConfigured()).toBe(true);

    const storedRaw = localStorage.getItem("wemd-ai-config");
    expect(storedRaw).toBeTruthy();
    const parsedStored = JSON.parse(storedRaw!);
    expect(parsedStored.apiKey).not.toBe("sk-silicon-test-key"); // must be encrypted

    const loaded = loadAIConfig();
    expect(loaded.provider).toBe("siliconflow");
    expect(loaded.apiKey).toBe("sk-silicon-test-key");
    expect(loaded.model).toBe("deepseek-ai/DeepSeek-V3");
  });

  it("should provide presets for deepseek, siliconflow, openai, and anthropic", () => {
    expect(AI_PROVIDERS.deepseek.defaultModel).toBe("deepseek-chat");
    expect(AI_PROVIDERS.siliconflow.baseUrl).toContain("siliconflow.cn");
    expect(AI_PROVIDERS.openai.defaultModel).toBe("gpt-4o-mini");
    expect(AI_PROVIDERS.anthropic.isAnthropicFormat).toBe(true);
    expect(getDefaultAIConfig().provider).toBe("deepseek");
  });
});
