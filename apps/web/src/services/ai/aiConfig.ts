import CryptoJS from "crypto-js";

export type AIProvider =
  | "deepseek"
  | "siliconflow"
  | "openai"
  | "anthropic"
  | "custom";

export interface AIProviderMeta {
  id: AIProvider;
  name: string;
  baseUrl: string;
  defaultModel: string;
  availableModels: string[];
  description: string;
  isAnthropicFormat?: boolean;
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderMeta> = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek (深度求索)",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    availableModels: ["deepseek-chat", "deepseek-reasoner"],
    description: "中文理解极佳，文笔自媒体适应性极强，性价比极高",
  },
  siliconflow: {
    id: "siliconflow",
    name: "硅基流动 (SiliconFlow)",
    baseUrl: "https://api.siliconflow.cn/v1",
    defaultModel: "deepseek-ai/DeepSeek-V3",
    availableModels: [
      "deepseek-ai/DeepSeek-V3",
      "deepseek-ai/DeepSeek-R1",
      "Qwen/Qwen2.5-72B-Instruct",
      "Qwen/Qwen2.5-14B-Instruct",
    ],
    description: "国内超高速直连，全量部署 DeepSeek-V3 与 Qwen 开源王牌",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    availableModels: ["gpt-4o-mini", "gpt-4o", "chatgpt-4o-latest"],
    description: "全球通用基座大模型，标准兼容规范",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-haiku-20241022",
    availableModels: [
      "claude-3-5-haiku-20241022",
      "claude-3-5-sonnet-20241022",
    ],
    description: "文采斐然，文字逻辑细腻，极度擅长去 AI 味润色",
    isAnthropicFormat: true,
  },
  custom: {
    id: "custom",
    name: "自定义 / 本地私有模型",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3",
    availableModels: [],
    description: "兼容 Ollama / LMStudio / OneAPI 等任意 OpenAI 兼容网关",
  },
};

const STORAGE_KEY = "wemd-ai-config";
const LEGACY_STORAGE_KEY = "ahafair-ai-config";
const AES_SECRET = "wemd_secure_local_ai_secret_key_v1";

/**
 * 加密字符串
 */
export function encryptData(plainText: string): string {
  if (!plainText) return "";
  try {
    return CryptoJS.AES.encrypt(plainText, AES_SECRET).toString();
  } catch (error) {
    console.error("AI 凭据加密失败:", error);
    return plainText;
  }
}

/**
 * 解密字符串
 */
export function decryptData(cipherText: string): string {
  if (!cipherText) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, AES_SECRET);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || cipherText;
  } catch {
    // 若不是 AES 密文则优雅回退原文本
    return cipherText;
  }
}

/**
 * 获取默认初始配置
 */
export function getDefaultAIConfig(): AIConfig {
  const preset = AI_PROVIDERS.deepseek;
  return {
    provider: "deepseek",
    apiKey: "",
    baseUrl: preset.baseUrl,
    model: preset.defaultModel,
  };
}

/**
 * 读取本地存储的 AI 配置（支持解密）
 */
export function loadAIConfig(): AIConfig {
  if (typeof window === "undefined") {
    return getDefaultAIConfig();
  }

  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      return getDefaultAIConfig();
    }

    const parsed = JSON.parse(raw) as Partial<AIConfig>;
    const provider = parsed.provider || "deepseek";
    const preset = AI_PROVIDERS[provider] || AI_PROVIDERS.deepseek;

    return {
      provider,
      apiKey: parsed.apiKey ? decryptData(parsed.apiKey) : "",
      baseUrl: parsed.baseUrl || preset.baseUrl,
      model: parsed.model || preset.defaultModel,
    };
  } catch (error) {
    console.error("加载 AI 配置异常:", error);
    return getDefaultAIConfig();
  }
}

/**
 * 保存 AI 配置到本地存储（API Key 加密写入）
 */
export function saveAIConfig(config: AIConfig): void {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      provider: config.provider,
      baseUrl: config.baseUrl.trim(),
      model: config.model.trim(),
      apiKey: config.apiKey ? encryptData(config.apiKey.trim()) : "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("保存 AI 配置失败:", error);
  }
}

/**
 * 检查当前是否已配置好可用的 API Key
 */
export function isAIConfigured(): boolean {
  const config = loadAIConfig();
  return Boolean(config.apiKey && config.apiKey.trim().length > 0);
}
