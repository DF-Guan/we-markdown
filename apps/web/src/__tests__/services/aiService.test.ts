import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  callLLM,
  extractJsonFromText,
  generateViralTitles,
  polishContent,
  extractSummaryAndQuotes,
  testAIConnection,
} from "../../services/ai/aiService";
import { saveAIConfig } from "../../services/ai/aiConfig";

describe("aiService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    saveAIConfig({
      provider: "deepseek",
      apiKey: "sk-test-mock-key",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("should extract JSON correctly from raw, markdown block or substring", () => {
    // 1. Raw JSON
    const raw = '{"name": "test"}';
    expect(extractJsonFromText(raw, {})).toEqual({ name: "test" });

    // 2. Markdown block
    const md =
      'Here is JSON:\n```json\n[{"title": "abc"}]\n```\nHope you like it';
    expect(extractJsonFromText(md, [])).toEqual([{ title: "abc" }]);

    // 3. Substring
    const messy = "Some text before [1, 2, 3] some text after";
    expect(extractJsonFromText(messy, [])).toEqual([1, 2, 3]);

    // 4. Fallback on invalid
    expect(extractJsonFromText("completely invalid", "fallback")).toBe(
      "fallback",
    );
  });

  it("should call OpenAI compatible API with authorization header and model", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: "模拟大模型回复内容",
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await callLLM({
      userPrompt: "你好",
      systemPrompt: "系统设定",
    });

    expect(result).toBe("模拟大模型回复内容");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("https://api.deepseek.com/v1/chat/completions");
    expect(init.headers["Authorization"]).toBe("Bearer sk-test-mock-key");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("deepseek-chat");
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
  });

  it("should call Anthropic API format when provider is anthropic", async () => {
    saveAIConfig({
      provider: "anthropic",
      apiKey: "sk-ant-test-key",
      baseUrl: "https://api.anthropic.com/v1",
      model: "claude-3-5-haiku-20241022",
    });

    const mockResponse = {
      content: [
        {
          type: "text",
          text: "Claude 模拟回复",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await callLLM({
      userPrompt: "分析文章",
    });

    expect(result).toBe("Claude 模拟回复");
    const [url, init] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers["x-api-key"]).toBe("sk-ant-test-key");
    expect(init.headers["anthropic-version"]).toBe("2023-06-01");
  });

  it("should throw informative error on HTTP 401 unauthorized", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ error: { message: "Invalid API Key" } }),
    });

    await expect(callLLM({ userPrompt: "test" })).rejects.toThrow(
      /API Key 验证失败/,
    );
  });

  it("should generate viral titles successfully", async () => {
    const titlesData = [
      { category: "悬念猎奇型", title: "为什么顶级高手都在用这个排版秘诀？" },
      { category: "干货清单型", title: "微信排版必须掌握的 5 大核心法则" },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify(titlesData),
            },
          },
        ],
      }),
    });

    const items = await generateViralTitles(
      "这是一篇关于公众号排版技巧的深度文章。",
    );
    expect(items).toHaveLength(2);
    expect(items[0].category).toBe("悬念猎奇型");
    expect(items[0].title).toContain("排版秘诀");
  });

  it("should polish content with natural mode", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: "这是润色后的自然流畅文字。",
            },
          },
        ],
      }),
    });

    const res = await polishContent("原始文本内容", "natural");
    expect(res).toBe("这是润色后的自然流畅文字。");
  });

  it("should extract summary and quotes", async () => {
    const mockData = {
      summary: "这是 150 字的核心导读摘要内容，言简意赅。",
      quotes: ["思想产生力量", "细节决定排版质感"],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify(mockData),
            },
          },
        ],
      }),
    });

    const result = await extractSummaryAndQuotes("全文测试文本...");
    expect(result.summary).toContain("导读摘要");
    expect(result.quotes).toHaveLength(2);
  });

  it("should test connection and report status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    const testRes = await testAIConnection({
      provider: "deepseek",
      apiKey: "sk-test",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
    });

    expect(testRes.success).toBe(true);
    expect(testRes.message).toContain("连接成功");
  });
});
