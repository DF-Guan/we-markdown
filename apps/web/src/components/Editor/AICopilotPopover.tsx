import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  Loader2,
  X,
  Flame,
  Wand2,
  Quote,
  Settings,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Image,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  type AIConfig,
  type AIProvider,
  AI_PROVIDERS,
  loadAIConfig,
  saveAIConfig,
  isAIConfigured,
} from "../../services/ai/aiConfig";
import {
  type PolishMode,
  type ViralTitleItem,
  generateViralTitles,
  polishContent,
  extractSummaryAndQuotes,
  testAIConnection,
} from "../../services/ai/aiService";
import { CardImageExportModal } from "../Export/CardImageExportModal";
import { createMarkdownParser } from "@we-markdown/core";
import "./AICopilotPopover.css";

export interface AICopilotPopoverProps {
  content?: string;
  onInsert?: (prefix: string, suffix: string, placeholder: string) => void;
  onReplaceContent?: (newContent: string) => void;
  onReplaceSelection?: (newText: string) => void;
  getSelectedText?: () => string;
}

type CopilotTab = "titles" | "polish" | "summary" | "settings";

export function AICopilotPopover({
  content = "",
  onInsert,
  onReplaceContent,
  onReplaceSelection,
  getSelectedText,
}: AICopilotPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CopilotTab>("titles");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 1. 爆款标题状态
  const [titles, setTitles] = useState<ViralTitleItem[]>([]);

  // 2. 润色状态
  const [polishMode, setPolishMode] = useState<PolishMode>("natural");
  const [polishedResult, setPolishedResult] = useState<string>("");

  // 3. 摘要与金句状态
  const [summary, setSummary] = useState<string>("");
  const [quotes, setQuotes] = useState<string[]>([]);

  // 4. 卡片模态框联动状态
  const [cardModal, setCardModal] = useState<{
    open: boolean;
    content: string;
    format: "card" | "quote" | "poster";
  }>({
    open: false,
    content: "",
    format: "quote",
  });

  // 5. 设置表单状态
  const [config, setConfig] = useState<AIConfig>(() => loadAIConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // 6. 弹窗自适应边界约束样式
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 动态计算弹窗位置与边界约束，彻底防止右侧或底部溢出截断
  useEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      if (!containerRef.current) return;
      // 移动端由全屏 Fixed CSS 统领
      if (window.innerWidth < 768) {
        setDropdownStyle({});
        return;
      }

      const triggerRect = containerRef.current.getBoundingClientRect();
      const editorEl =
        containerRef.current.closest(".editor-pane") ||
        containerRef.current.closest(".markdown-editor");

      const editorRect = editorEl
        ? editorEl.getBoundingClientRect()
        : {
            left: 0,
            right: window.innerWidth,
            top: 0,
            bottom: window.innerHeight,
            width: window.innerWidth,
          };

      // 弹窗宽度：320px ~ 420px，且留出左右至少 24px 边距
      const popoverWidth = Math.max(320, Math.min(420, editorRect.width - 24));

      // 以按钮中心为理想中轴
      const btnCenter = triggerRect.left + triggerRect.width / 2;
      const idealGlobalLeft = btnCenter - popoverWidth / 2;

      // 严格夹紧在 editorRect 内部 [editorRect.left + 12, editorRect.right - popoverWidth - 12]
      const clampedGlobalLeft = Math.max(
        editorRect.left + 12,
        Math.min(idealGlobalLeft, editorRect.right - popoverWidth - 12),
      );

      const relativeLeft = clampedGlobalLeft - triggerRect.left;
      const availableHeight = editorRect.bottom - triggerRect.bottom - 20;
      const maxHeight = Math.max(320, Math.min(540, availableHeight));

      setDropdownStyle({
        position: "absolute",
        left: `${relativeLeft}px`,
        right: "auto",
        width: `${popoverWidth}px`,
        maxHeight: `${maxHeight}px`,
        maxWidth: `calc(100vw - 24px)`,
        boxSizing: "border-box",
      });
    };

    updatePlacement();
    const rafId = requestAnimationFrame(updatePlacement);
    window.addEventListener("resize", updatePlacement);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePlacement);
    };
  }, [isOpen, activeTab]);

  // 快捷键 (Alt+A 切换, Escape 关闭)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.key.toLowerCase() === "a") ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a")
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // 监听移动端或全局自定义唤起事件
  useEffect(() => {
    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener("wemd-open-ai-copilot", handleCustomOpen);
    return () =>
      window.removeEventListener("wemd-open-ai-copilot", handleCustomOpen);
  }, []);

  // 点击外部关闭 (豁免海报卡片弹窗)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardModal.open) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest?.(
          ".card-export-modal-backdrop, .card-export-modal-dialog",
        )
      ) {
        return;
      }
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, cardModal.open]);

  // 面板关闭时中断未完成的请求，节约用户 token
  useEffect(() => {
    if (!isOpen) {
      abortCurrentRequest();
    }
    return () => {
      abortCurrentRequest();
    };
  }, [isOpen]);

  // 取消尚未完成的请求
  const abortCurrentRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const ensureConfigured = () => {
    if (!isAIConfigured()) {
      setActiveTab("settings");
      toast("请先配置并保存 AI API Key", { icon: "🔑" });
      return false;
    }
    return true;
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  // 生成爆款标题
  const handleGenerateTitles = async () => {
    if (!ensureConfigured()) return;
    if (!content.trim()) {
      toast.error("编辑器内容为空，无法分析生成标题");
      return;
    }

    abortCurrentRequest();
    const ac = new AbortController();
    abortControllerRef.current = ac;

    setLoading(true);
    try {
      const items = await generateViralTitles(content, ac.signal);
      setTitles(items);
      toast.success(`成功生成 ${items.length} 组爆款标题！`);
    } catch (error) {
      if (!ac.signal.aborted) {
        toast.error(error instanceof Error ? error.message : "生成标题失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 设置为主标题
  const handleApplyTitle = (newTitle: string) => {
    if (!content) {
      onInsert?.("# ", "\n\n", newTitle);
      setIsOpen(false);
      return;
    }

    // 检查是否有现有 # 标题
    if (/^#\s+[^\n]+/m.test(content)) {
      const replaced = content.replace(/^#\s+[^\n]+/m, `# ${newTitle}`);
      onReplaceContent?.(replaced);
    } else {
      onReplaceContent?.(`# ${newTitle}\n\n${content}`);
    }
    toast.success("已成功设为文章主标题！");
    setIsOpen(false);
  };

  // 执行润色
  const handlePolish = async () => {
    if (!ensureConfigured()) return;

    const sel = getSelectedText?.() || "";
    const targetText = sel.trim() ? sel : content;

    if (!targetText.trim()) {
      toast.error("无可供润色的文本内容");
      return;
    }

    abortCurrentRequest();
    const ac = new AbortController();
    abortControllerRef.current = ac;

    setLoading(true);
    try {
      const res = await polishContent(targetText, polishMode, ac.signal);
      setPolishedResult(res);
      toast.success("内容润色已完成！");
    } catch (error) {
      if (!ac.signal.aborted) {
        toast.error(error instanceof Error ? error.message : "润色失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 应用润色替换
  const handleApplyPolish = () => {
    if (!polishedResult) return;
    const sel = getSelectedText?.() || "";
    if (sel.trim()) {
      onReplaceSelection?.(polishedResult);
      toast.success("已替换选中文本");
    } else {
      onReplaceContent?.(polishedResult);
      toast.success("已应用全篇润色");
    }
    setIsOpen(false);
  };

  // 提炼摘要与金句
  const handleExtractSummary = async () => {
    if (!ensureConfigured()) return;
    if (!content.trim()) {
      toast.error("编辑器内容为空");
      return;
    }

    abortCurrentRequest();
    const ac = new AbortController();
    abortControllerRef.current = ac;

    setLoading(true);
    try {
      const result = await extractSummaryAndQuotes(content, ac.signal);
      setSummary(result.summary);
      setQuotes(result.quotes);
      toast.success("摘要与金句提炼完成！");
    } catch (error) {
      if (!ac.signal.aborted) {
        toast.error(error instanceof Error ? error.message : "提炼失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 插入导读引言
  const handleInsertSummary = () => {
    if (!summary) return;
    const block = `> 📌 **导读**：${summary}\n\n`;
    onReplaceContent?.(`${block}${content}`);
    toast.success("已插入导读引言至文章开篇！");
    setIsOpen(false);
  };

  // 切换服务商设置
  const handleProviderChange = (provider: AIProvider) => {
    const meta = AI_PROVIDERS[provider];
    setConfig((prev) => ({
      ...prev,
      provider,
      baseUrl: meta.baseUrl,
      model: meta.defaultModel,
    }));
  };

  // 保存设置
  const handleSaveConfig = () => {
    saveAIConfig(config);
    toast.success("AI 配置已安全加密保存");
  };

  // 测试连接
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await testAIConnection(config);
      if (res.success) {
        toast.success(res.message, { duration: 3000 });
      } else {
        toast.error(res.message, { duration: 4000 });
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const currentSelection = getSelectedText?.() || "";

  const markdownParser = useMemo(() => createMarkdownParser(), []);

  return (
    <div className="ai-copilot-popover-container" ref={containerRef}>
      <button
        className={`md-toolbar-btn ai-copilot-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        data-tooltip="AI 创作副驾驶 (Alt+A)"
        aria-label="AI 创作副驾驶"
        type="button"
      >
        <Sparkles size={16} />
        <span className="ai-copilot-badge">AI</span>
      </button>

      {isOpen && (
        <div className="ai-copilot-dropdown" style={dropdownStyle}>
          {/* 头部标题与关闭 */}
          <div className="ai-copilot-header">
            <div className="ai-copilot-title-row">
              <Sparkles size={16} color="#6366f1" />
              <span>AI 创作副驾驶</span>
            </div>
            <div className="ai-copilot-header-actions">
              <button
                className="ai-copilot-icon-btn"
                onClick={() => setIsOpen(false)}
                aria-label="关闭"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 标签栏 */}
          <div className="ai-copilot-tabs">
            <button
              type="button"
              className={`ai-copilot-tab-btn ${activeTab === "titles" ? "active" : ""}`}
              onClick={() => setActiveTab("titles")}
            >
              <Flame size={14} />
              <span>爆款标题</span>
            </button>
            <button
              type="button"
              className={`ai-copilot-tab-btn ${activeTab === "polish" ? "active" : ""}`}
              onClick={() => setActiveTab("polish")}
            >
              <Wand2 size={14} />
              <span>智能润色</span>
            </button>
            <button
              type="button"
              className={`ai-copilot-tab-btn ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              <Quote size={14} />
              <span>摘要金句</span>
            </button>
            <button
              type="button"
              className={`ai-copilot-tab-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={14} />
              <span>设置</span>
            </button>
          </div>

          {/* 标签 1: 爆款标题 */}
          {activeTab === "titles" && (
            <div className="ai-copilot-body">
              <p className="ai-copilot-desc">
                根据文章核心主旨，一键生成涵盖悬念、反常识、干货盘点等 5
                大派系的爆款标题。
              </p>
              <button
                type="button"
                className="ai-btn-primary"
                onClick={handleGenerateTitles}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>正在深度构思爆款标题...</span>
                  </>
                ) : (
                  <>
                    <Flame size={16} />
                    <span>开始生成爆款标题</span>
                  </>
                )}
              </button>

              {titles.length > 0 && (
                <div className="ai-titles-list">
                  {titles.map((item, idx) => (
                    <div key={idx} className="ai-title-card">
                      <div className="ai-title-header">
                        <span className="ai-category-tag">{item.category}</span>
                      </div>
                      <p className="ai-title-text">{item.title}</p>
                      <div className="ai-title-actions">
                        <button
                          type="button"
                          className="ai-btn-secondary"
                          onClick={() => handleApplyTitle(item.title)}
                          title="替换文章 # 主标题或插入到顶部"
                        >
                          <CheckCircle2 size={13} />
                          <span>设为主标题</span>
                        </button>
                        <button
                          type="button"
                          className="ai-btn-secondary"
                          onClick={() => copyText(item.title, `t-${idx}`)}
                        >
                          {copiedKey === `t-${idx}` ? (
                            <Check size={13} />
                          ) : (
                            <Copy size={13} />
                          )}
                          <span>复制</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 标签 2: 智能润色 */}
          {activeTab === "polish" && (
            <div className="ai-copilot-body">
              <div className="ai-scope-info">
                <span>
                  当前范围:{" "}
                  <strong>
                    {currentSelection.trim()
                      ? `选中文本 (${currentSelection.length} 字)`
                      : `全文 (${content.length} 字)`}
                  </strong>
                </span>
              </div>

              <div className="ai-polish-modes">
                <button
                  type="button"
                  className={`ai-mode-card ${polishMode === "natural" ? "active" : ""}`}
                  onClick={() => setPolishMode("natural")}
                >
                  <span className="ai-mode-title">🍃 去 AI 味</span>
                  <span className="ai-mode-sub">消除翻译腔，自然通顺</span>
                </button>
                <button
                  type="button"
                  className={`ai-mode-card ${polishMode === "viral" ? "active" : ""}`}
                  onClick={() => setPolishMode("viral")}
                >
                  <span className="ai-mode-title">🔥 爆款网感</span>
                  <span className="ai-mode-sub">增强情绪，节奏短快</span>
                </button>
                <button
                  type="button"
                  className={`ai-mode-card ${polishMode === "academic" ? "active" : ""}`}
                  onClick={() => setPolishMode("academic")}
                >
                  <span className="ai-mode-title">🎓 严谨学术</span>
                  <span className="ai-mode-sub">逻辑紧密，专业特稿</span>
                </button>
                <button
                  type="button"
                  className={`ai-mode-card ${polishMode === "concise" ? "active" : ""}`}
                  onClick={() => setPolishMode("concise")}
                >
                  <span className="ai-mode-title">⚡ 极简凝练</span>
                  <span className="ai-mode-sub">剔除废话，开门见山</span>
                </button>
              </div>

              <button
                type="button"
                className="ai-btn-primary"
                onClick={handlePolish}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>正在字句推敲与润色...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>执行智能润色</span>
                  </>
                )}
              </button>

              {polishedResult && (
                <div className="ai-result-box">
                  <div className="ai-result-content">{polishedResult}</div>
                  <div className="ai-result-actions">
                    <button
                      type="button"
                      className="ai-btn-secondary"
                      onClick={() => copyText(polishedResult, "polish")}
                    >
                      {copiedKey === "polish" ? (
                        <Check size={13} />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span>复制</span>
                    </button>
                    <button
                      type="button"
                      className="ai-btn-primary"
                      style={{ padding: "5px 12px", fontSize: "12px" }}
                      onClick={handleApplyPolish}
                    >
                      <ArrowRight size={13} />
                      <span>
                        {currentSelection.trim()
                          ? "替换选中段落"
                          : "应用替换全文"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 标签 3: 摘要与金句 */}
          {activeTab === "summary" && (
            <div className="ai-copilot-body">
              <p className="ai-copilot-desc">
                提炼 150
                字前言导读摘要，捕捉穿透力金句，并支持一键做成小红书/金句海报。
              </p>
              <button
                type="button"
                className="ai-btn-primary"
                onClick={handleExtractSummary}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>正在凝练核心摘要与金句...</span>
                  </>
                ) : (
                  <>
                    <Quote size={16} />
                    <span>提炼精华导读与金句</span>
                  </>
                )}
              </button>

              {summary && (
                <div className="ai-summary-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <strong>📌 150 字导读摘要</strong>
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>
                      {summary.length} 字
                    </span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{summary}</p>
                  <div
                    style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                  >
                    <button
                      type="button"
                      className="ai-btn-secondary"
                      onClick={handleInsertSummary}
                    >
                      <CheckCircle2 size={13} />
                      <span>插入到开篇导读</span>
                    </button>
                    <button
                      type="button"
                      className="ai-btn-secondary"
                      onClick={() => {
                        setIsOpen(false);
                        setCardModal({
                          open: true,
                          content: summary,
                          format: "card",
                        });
                      }}
                    >
                      <Image size={13} />
                      <span>制作导读卡片</span>
                    </button>
                    <button
                      type="button"
                      className="ai-btn-secondary"
                      onClick={() => copyText(summary, "sum")}
                    >
                      {copiedKey === "sum" ? (
                        <Check size={13} />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span>复制</span>
                    </button>
                  </div>
                </div>
              )}

              {quotes.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <strong>✨ 穿透力金句</strong>
                  {quotes.map((q, idx) => (
                    <div key={idx} className="ai-quote-card">
                      <p className="ai-quote-text">“{q}”</p>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="ai-btn-secondary"
                          onClick={() => {
                            setIsOpen(false);
                            setCardModal({
                              open: true,
                              content: q,
                              format: "quote",
                            });
                          }}
                        >
                          <Image size={13} />
                          <span>做成金句微卡</span>
                        </button>
                        <button
                          type="button"
                          className="ai-btn-secondary"
                          onClick={() => copyText(q, `q-${idx}`)}
                        >
                          {copiedKey === `q-${idx}` ? (
                            <Check size={13} />
                          ) : (
                            <Copy size={13} />
                          )}
                          <span>复制</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 标签 4: 设置 */}
          {activeTab === "settings" && (
            <div className="ai-copilot-body">
              <form
                className="ai-settings-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveConfig();
                }}
              >
                <div className="ai-form-group">
                  <label>服务商 (Provider)</label>
                  <select
                    value={config.provider}
                    onChange={(e) =>
                      handleProviderChange(e.target.value as AIProvider)
                    }
                  >
                    {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((p) => (
                      <option key={p} value={p}>
                        {AI_PROVIDERS[p].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ai-form-group">
                  <label>Base URL</label>
                  <input
                    type="text"
                    value={config.baseUrl}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        baseUrl: e.target.value,
                      }))
                    }
                    placeholder="https://api.deepseek.com/v1"
                    required
                  />
                </div>

                <div className="ai-form-group">
                  <label>模型名称 (Model)</label>
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    placeholder="如 deepseek-chat 或 gpt-4o-mini"
                    required
                  />
                </div>

                <div className="ai-form-group">
                  <label>API Key</label>
                  <div className="ai-input-with-btn">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={config.apiKey}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          apiKey: e.target.value,
                        }))
                      }
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      className="ai-btn-secondary"
                      onClick={() => setShowApiKey((prev) => !prev)}
                      title={showApiKey ? "隐藏 API Key" : "显示 API Key"}
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="ai-privacy-note">
                  <ShieldCheck size={14} />
                  <span>
                    API Key 经 AES-256
                    本地加密直连，纯浏览器端运行，绝不上报云端
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "6px",
                  }}
                >
                  <button
                    type="button"
                    className="ai-btn-secondary"
                    style={{ flex: 1 }}
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null}
                    <span>测试连通性</span>
                  </button>
                  <button
                    type="submit"
                    className="ai-btn-primary"
                    style={{ flex: 1 }}
                  >
                    <span>保存配置</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 联动卡片海报生成器 */}
      {cardModal.open && (
        <CardImageExportModal
          open={cardModal.open}
          onClose={() => setCardModal((prev) => ({ ...prev, open: false }))}
          markdown={content}
          renderedHtml={markdownParser.render(content)}
          initialFormat={cardModal.format}
          initialContent={cardModal.content}
        />
      )}
    </div>
  );
}
