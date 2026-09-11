import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Copy,
  Check,
  Smartphone,
  FileText,
  Quote,
  Sparkles,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  type CardFormat,
  type CardBackgroundTheme,
  CARD_THEMES,
  buildCardMarkup,
  renderCardToCanvas,
  renderCardToBlob,
  downloadCardImage,
} from "../../services/export/cardImageExporter";
import "./CardImageExportModal.css";

interface CardImageExportModalProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
  renderedHtml: string;
  initialFormat?: CardFormat;
  initialContent?: string;
}

export function CardImageExportModal({
  open,
  onClose,
  markdown,
  renderedHtml,
  initialFormat,
  initialContent,
}: CardImageExportModalProps) {
  const [format, setFormat] = useState<CardFormat>(initialFormat || "card");
  const [theme, setTheme] = useState<CardBackgroundTheme>("classic-white");
  const [authorName, setAuthorName] = useState("WeMarkdown 创作者");
  const [showWatermark, setShowWatermark] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialFormat) {
      setFormat(initialFormat);
    }
  }, [initialFormat]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const currentOptions = {
    markdown,
    renderedHtml,
    format,
    theme,
    authorName,
    showWatermark,
    customContent: initialContent,
  };

  const { html: cardInnerHtml } = buildCardMarkup(currentOptions);

  const handleDownload = async () => {
    try {
      setExporting(true);
      await downloadCardImage(
        currentOptions,
        `wemarkdown-${format}-${Date.now()}.png`,
      );
      toast.success("高清图片已保存至本地", { icon: "📥" });
    } catch (e) {
      console.error(e);
      toast.error("导出图片失败，请重试");
    } finally {
      setExporting(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      setExporting(true);
      const blob = await renderCardToBlob(currentOptions);
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("图片已成功复制到剪贴板！", { icon: "📋" });
      } else {
        toast.error("当前浏览器环境不支持直接复制图片，请使用下载");
      }
    } catch (e) {
      console.error(e);
      toast.error("复制图片失败，请尝试直接下载");
    } finally {
      setExporting(false);
    }
  };

  const modalNode = (
    <div className="card-export-modal-backdrop" onClick={onClose}>
      <div
        className="card-export-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与关闭 */}
        <div className="card-export-header">
          <div className="card-export-title">
            <Sparkles size={18} className="title-icon" />
            <span>导出高清海报与卡片</span>
          </div>
          <button
            type="button"
            className="card-export-close-btn"
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* 格式选择栏 */}
        <div className="card-export-tabs">
          <button
            type="button"
            className={`tab-btn ${format === "card" ? "active" : ""}`}
            onClick={() => setFormat("card")}
          >
            <Smartphone size={15} />
            <span>小红书卡片 (3:4)</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${format === "poster" ? "active" : ""}`}
            onClick={() => setFormat("poster")}
          >
            <FileText size={15} />
            <span>长图海报</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${format === "quote" ? "active" : ""}`}
            onClick={() => setFormat("quote")}
          >
            <Quote size={15} />
            <span>金句微卡</span>
          </button>
        </div>

        {/* 主体区域：左/上预览，右/下控制项 */}
        <div className="card-export-body">
          {/* 实时微缩预览视窗 */}
          <div
            className="card-export-preview-wrapper"
            ref={previewContainerRef}
          >
            <div
              className="card-export-preview-scale"
              dangerouslySetInnerHTML={{ __html: cardInnerHtml }}
            />
          </div>

          {/* 控制面板 */}
          <div className="card-export-controls">
            {/* 主题底色选择 */}
            <div className="control-group">
              <label className="control-label">背景风格</label>
              <div className="theme-palette-list">
                {(Object.keys(CARD_THEMES) as CardBackgroundTheme[]).map(
                  (k) => (
                    <button
                      key={k}
                      type="button"
                      className={`theme-chip ${theme === k ? "active" : ""}`}
                      onClick={() => setTheme(k)}
                    >
                      <span
                        className="theme-dot"
                        style={{ background: CARD_THEMES[k].accent }}
                      />
                      <span>{CARD_THEMES[k].name}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* 作者署名 */}
            <div className="control-group">
              <label className="control-label">作者署名</label>
              <input
                type="text"
                className="control-input"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="填写作者或公众号名"
                maxLength={30}
              />
            </div>

            {/* 水印与细节设置 */}
            <div className="control-group">
              <label className="control-checkbox-label">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                />
                <span>显示底部 WeMarkdown 排版水印</span>
              </label>
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="card-export-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyImage}
            disabled={exporting}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "已复制图片" : "复制图片到剪贴板"}</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            disabled={exporting}
          >
            <Download size={16} />
            <span>{exporting ? "生成中..." : "下载高清 PNG (Retina)"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalNode, document.body)
    : modalNode;
}
