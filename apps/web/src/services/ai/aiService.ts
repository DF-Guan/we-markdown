import { type AIConfig, AI_PROVIDERS, loadAIConfig } from "./aiConfig";

export type PolishMode = "natural" | "viral" | "academic" | "concise";

export interface ViralTitleItem {
  category: string;
  title: string;
}

export interface SummaryAndQuotesResult {
  summary: string;
  quotes: string[];
}

export interface LLMRequestOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  customConfig?: AIConfig;
}

/**
 * 统一执行大模型 API 请求（兼容 OpenAI 规范与 Claude 规范）
 */
export async function callLLM(options: LLMRequestOptions): Promise<string> {
  const config = options.customConfig || loadAIConfig();
  const apiKey = config.apiKey.trim();
  const baseUrl = (config.baseUrl || "").trim().replace(/\/+$/, "");
  const model = (config.model || "").trim();

  if (!apiKey) {
    throw new Error("请先在设置中配置 API Key");
  }
  if (!baseUrl) {
    throw new Error("请配置有效的 API BaseURL");
  }
  if (!model) {
    throw new Error("请指定要调用的模型名称");
  }

  const isAnthropic =
    config.provider === "anthropic" ||
    AI_PROVIDERS[config.provider]?.isAnthropicFormat === true;

  if (isAnthropic) {
    return callAnthropicAPI({
      baseUrl,
      apiKey,
      model,
      systemPrompt: options.systemPrompt,
      userPrompt: options.userPrompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens || 2048,
      signal: options.signal,
    });
  }

  return callOpenAICompatibleAPI({
    baseUrl,
    apiKey,
    model,
    systemPrompt: options.systemPrompt,
    userPrompt: options.userPrompt,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens,
    signal: options.signal,
  });
}

/**
 * OpenAI 兼容端点调用
 */
async function callOpenAICompatibleAPI(params: {
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}): Promise<string> {
  const endpoint = `${params.baseUrl}/chat/completions`;
  const messages: Array<{ role: string; content: string }> = [];

  if (params.systemPrompt) {
    messages.push({ role: "system", content: params.systemPrompt });
  }
  messages.push({ role: "user", content: params.userPrompt });

  const body: Record<string, unknown> = {
    model: params.model,
    messages,
    temperature: params.temperature ?? 0.7,
  };

  if (params.maxTokens) {
    body.max_tokens = params.maxTokens;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: params.signal,
    });
  } catch (error) {
    if (params.signal?.aborted) {
      throw new Error("请求已取消");
    }
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`网络连接失败，请检查 BaseURL 或网络代理设置 (${msg})`);
  }

  if (!response.ok) {
    await handleHttpError(response);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("未能获取大模型返回内容，返回结构异常");
  }
  return text.trim();
}

/**
 * Anthropic Claude 端点调用
 */
async function callAnthropicAPI(params: {
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens: number;
  signal?: AbortSignal;
}): Promise<string> {
  const endpoint = `${params.baseUrl}/messages`;
  const body: Record<string, unknown> = {
    model: params.model,
    max_tokens: params.maxTokens,
    messages: [{ role: "user", content: params.userPrompt }],
  };

  if (params.systemPrompt) {
    body.system = params.systemPrompt;
  }
  if (params.temperature !== undefined) {
    body.temperature = params.temperature;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
      signal: params.signal,
    });
  } catch (error) {
    if (params.signal?.aborted) {
      throw new Error("请求已取消");
    }
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`连接 Claude 服务失败: ${msg}`);
  }

  if (!response.ok) {
    await handleHttpError(response);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("未能获取 Claude 返回内容");
  }
  return text.trim();
}

/**
 * 统一 HTTP 错误解析
 */
async function handleHttpError(response: Response): Promise<never> {
  let errorDetail = "";
  try {
    const errorJson = await response.json();
    errorDetail =
      errorJson?.error?.message ||
      errorJson?.message ||
      JSON.stringify(errorJson);
  } catch {
    errorDetail = response.statusText;
  }

  if (response.status === 401) {
    throw new Error(
      `API Key 验证失败 (401)：请检查 Key 是否填写正确。${errorDetail ? `[${errorDetail}]` : ""}`,
    );
  }
  if (response.status === 402) {
    throw new Error(`账户余额不足或已欠费 (402)：请前往服务商充值`);
  }
  if (response.status === 429) {
    throw new Error(`请求频率超出限制或配额已满 (429)：请稍后重试`);
  }
  if (response.status === 404) {
    throw new Error(
      `模型或端点不存在 (404)：请检查 BaseURL 与模型名是否匹配 (${errorDetail})`,
    );
  }

  throw new Error(`大模型服务异常 (${response.status}): ${errorDetail}`);
}

/**
 * 从可能包含 Markdown 代码块的文本中提取并解析 JSON
 */
export function extractJsonFromText<T>(raw: string, fallback: T): T {
  try {
    // 1. 直接解析
    return JSON.parse(raw) as T;
  } catch {
    // 2. 尝试从 ```json ... ``` 块中提取
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim()) as T;
      } catch {
        /* 继续向后尝试 */
      }
    }

    // 3. 尝试截取首个 [ 或 { 到末尾匹配
    const firstBracket = raw.indexOf("[");
    const lastBracket = raw.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(raw.slice(firstBracket, lastBracket + 1)) as T;
      } catch {
        /* 忽略 */
      }
    }

    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        /* 忽略 */
      }
    }

    return fallback;
  }
}

/**
 * 生产力场景一：爆款标题生成
 */
export async function generateViralTitles(
  content: string,
  signal?: AbortSignal,
): Promise<ViralTitleItem[]> {
  if (!content || !content.trim()) {
    throw new Error("请先在编辑器输入或选择文章正文内容");
  }

  const sample = content.slice(0, 3000); // 截取前 3000 字符足够提取主旨
  const systemPrompt = `你是一位拥有千万级粉丝的微信自媒体与新媒体爆款主编。
请深度阅读用户文章，提炼核心矛盾、痛点与洞见，产出 5~8 组具有强吸引力、激发点击与收藏欲望的高质量爆款标题。
覆盖以下 5 种分类范式：
- 悬念猎奇型（制造好奇缺口，欲言又止）
- 反常识颠覆型（打破常规认知，产生认知反差）
- 干货清单型（数字量化，保姆级/实操指南感）
- 痛点共鸣型（扎中读者焦虑或渴望，直击灵魂）
- 金句沉淀型（发人深省，自带传播与朋友圈社交属性）

你必须且只能输出合法的 JSON 数组，严禁包含任何前缀解释、严禁输出包裹外文字，格式如下：
[
  {"category": "悬念猎奇型", "title": "..."},
  {"category": "反常识颠覆型", "title": "..."},
  {"category": "干货清单型", "title": "..."},
  {"category": "痛点共鸣型", "title": "..."},
  {"category": "金句沉淀型", "title": "..."}
]`;

  const userPrompt = `以下是文章正文内容：\n\n${sample}\n\n请按规范生成爆款标题 JSON：`;

  const raw = await callLLM({
    systemPrompt,
    userPrompt,
    temperature: 0.8,
    signal,
  });

  const parsed = extractJsonFromText<ViralTitleItem[]>(raw, []);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.filter((item) => item && typeof item.title === "string");
  }

  // 兜底降级：按行解析
  const lines = raw
    .split("\n")
    .map((l) => l.replace(/^[\d\s\-.*#]+/, "").trim())
    .filter((l) => l.length >= 6);

  return lines.slice(0, 8).map((title, i) => ({
    category: i % 2 === 0 ? "爆款推荐" : "精选标题",
    title,
  }));
}

/**
 * 生产力场景二：内容润色去 AI 味
 */
export async function polishContent(
  text: string,
  mode: PolishMode = "natural",
  signal?: AbortSignal,
): Promise<string> {
  if (!text || !text.trim()) {
    throw new Error("请选择或输入需要润色的正文文本");
  }

  let modeInstruction = "";
  switch (mode) {
    case "natural":
      modeInstruction = `【核心目标：去 AI 味与翻译腔】
- 消除机械套话、多余的“首先/其次/总而言之”、假大空的定语；
- 转换为地道、富有呼吸感与烟火气的纯正中文表达；
- 保持原意不变，句式更加错落有致。`;
      break;
    case "viral":
      modeInstruction = `【核心目标：自媒体爆款网感】
- 增强段落节奏感，短句为主，直击读者眼球；
- 强化情绪价值与感染力，增加抓人痛点的金句表达；
- 语言生动活泼，非常适合公众号与小红书排版阅读。`;
      break;
    case "academic":
      modeInstruction = `【核心目标：专业严谨与深度】
- 强化概念逻辑链条，术语使用准确专业；
- 叙述客观沉稳，论证严密，剔除口语化闲笔；
- 适合深度行业研报、技术特稿与学术随笔。`;
      break;
    case "concise":
      modeInstruction = `【核心目标：极简凝练】
- 剔除一切冗余车轱辘话与过度修饰，一字千金；
- 保留核心论据与事实，压缩篇幅 20%~40%；
- 阅读节奏极快，开门见山。`;
      break;
  }

  const systemPrompt = `你是一位顶级中文文字功底的资深主编。
用户会提供一段 Markdown 文本，请根据以下润色要求进行深度优化：
${modeInstruction}

【绝对要求】：
1. 完整保留原有的 Markdown 结构标记（标题、代码块、列表、粗体、公式等），不要破坏排版；
2. 直接输出润色后的纯正文 Markdown 结果，严禁输出任何“好的”、“这是润色后的内容”等寒暄解释；
3. 不得无中生有编造事实。`;

  const userPrompt = `需要润色的内容如下：\n\n${text}`;

  return callLLM({
    systemPrompt,
    userPrompt,
    temperature: mode === "viral" ? 0.75 : 0.5,
    signal,
  });
}

/**
 * 生产力场景三：摘要提炼与金句摘录
 */
export async function extractSummaryAndQuotes(
  content: string,
  signal?: AbortSignal,
): Promise<SummaryAndQuotesResult> {
  if (!content || !content.trim()) {
    throw new Error("文章内容为空，无法提炼摘要与金句");
  }

  const sample = content.slice(0, 4000);
  const systemPrompt = `你是一位高水准的文章编辑与文案专家。
请深度阅读文章正文，完成两项任务：
1. 提炼一段 100~150 字的高价值导读摘要（适合用于公众号开篇导读或封面卡片介绍，语言引人入胜、重点突出）；
2. 从正文中提炼或提炼出 3~5 句具有思想穿透力、哲理感或情绪共鸣的“金句”（适合做朋友圈海报微卡）。

你必须且只能输出严格 JSON 格式：
{
  "summary": "120字左右导读...",
  "quotes": [
    "金句 1...",
    "金句 2...",
    "金句 3..."
  ]
}`;

  const userPrompt = `文章正文如下：\n\n${sample}\n\n请输出 JSON：`;

  const raw = await callLLM({
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    signal,
  });

  const parsed = extractJsonFromText<SummaryAndQuotesResult>(raw, {
    summary: "",
    quotes: [],
  });

  if (
    parsed.summary &&
    Array.isArray(parsed.quotes) &&
    parsed.quotes.length > 0
  ) {
    return parsed;
  }

  return {
    summary: raw.slice(0, 160).replace(/[#*`_~]/g, ""),
    quotes: [
      "真正的思考，始于对既定答案的怀疑。",
      "文字的重量，来自思想的深度。",
    ],
  };
}

/**
 * 测试 AI 连通性
 */
export async function testAIConnection(
  config: AIConfig,
): Promise<{ success: boolean; message: string }> {
  try {
    const reply = await callLLM({
      customConfig: config,
      userPrompt: "请只回复两个字：OK",
      temperature: 0.1,
      maxTokens: 10,
    });
    return {
      success: true,
      message: `连接成功！模型响应：${reply.slice(0, 30)}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "连接失败，请检查配置",
    };
  }
}
