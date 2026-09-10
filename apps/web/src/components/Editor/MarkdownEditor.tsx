import { useEffect, useRef, useState } from "react";
import { EditorView, minimalSetup } from "codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { githubLight } from "@uiw/codemirror-theme-github";
import {
  wechatMarkdownHighlighting,
  wechatMarkdownHighlightingDark,
} from "./markdownTheme";
import { underlineExtension } from "./markdownUnderline";
import { useUITheme } from "../../hooks/useUITheme";
import { useEditorStore } from "../../store/editorStore";
import { getArticleStats } from "../../utils/wordCount";
import { formatPanguMarkdown } from "../../utils/panguFormatter";
import { Toolbar } from "./Toolbar";
import { SearchPanel } from "./SearchPanel";
import { SaveIndicator } from "./SaveIndicator";
import toast from "react-hot-toast";
import "./MarkdownEditor.css";
import { customKeymap } from "./editorShortcuts";
import { paragraphSelectionStyle } from "./mouseSelectionStyle";
import {
  WECHAT_IMAGE_MAX_SIZE_BYTES,
  formatImageSize,
} from "../../services/image/autoCompressImage";
import { uploadEditorImage } from "../../services/image/imageUploadFlow";

const SYNC_SCROLL_EVENT = "ahafair-sync-scroll";

interface SyncScrollDetail {
  source: "editor" | "preview";
  ratio: number;
}

export function MarkdownEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { markdown: content, setMarkdown } = useEditorStore();
  const uiTheme = useUITheme((state) => state.theme);
  const isSyncingRef = useRef(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const currentContent = viewRef.current
      ? viewRef.current.state.doc.toString()
      : content;

    const startState = EditorState.create({
      doc: currentContent,
      extensions: [
        minimalSetup,
        customKeymap,
        markdown({ base: markdownLanguage, extensions: [underlineExtension] }),
        uiTheme === "dark"
          ? wechatMarkdownHighlightingDark
          : wechatMarkdownHighlighting,
        githubLight,
        EditorView.lineWrapping,
        paragraphSelectionStyle,
        EditorView.domEventHandlers({
          paste: (event, view) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
              if (item.type.startsWith("image/")) {
                event.preventDefault();
                const file = item.getAsFile();
                if (!file) continue;

                const needAutoCompress =
                  file.size > WECHAT_IMAGE_MAX_SIZE_BYTES;

                // 使用统一流程自动压缩并上传
                const uploadPromise = (async () => {
                  const result = await uploadEditorImage(file, {
                    compressionOptions: {
                      maxSizeBytes: WECHAT_IMAGE_MAX_SIZE_BYTES,
                    },
                  });
                  return result;
                })();

                const loadingToken = `ahafair-upload-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`;
                const loadingText = `![上传中... ${file.name}](${loadingToken})`;
                const range = view.state.selection.main;
                view.dispatch({
                  changes: {
                    from: range.from,
                    to: range.to,
                    insert: loadingText,
                  },
                });

                toast.promise(uploadPromise, {
                  loading: needAutoCompress
                    ? "正在压缩并上传图片..."
                    : "正在上传图片...",
                  success: (result) => {
                    const imageText = `![](${result.url})`;
                    const currentDoc = view.state.doc.toString();
                    const index = currentDoc.indexOf(loadingText);

                    if (index !== -1) {
                      view.dispatch({
                        changes: {
                          from: index,
                          to: index + loadingText.length,
                          insert: imageText,
                        },
                      });
                    }
                    return result.compressed
                      ? `图片上传成功（已自动压缩 ${formatImageSize(
                          result.originalSize,
                        )} -> ${formatImageSize(result.finalSize)}）`
                      : "图片上传成功";
                  },
                  error: (err) => {
                    const currentDoc = view.state.doc.toString();
                    const index = currentDoc.indexOf(loadingText);
                    if (index !== -1) {
                      view.dispatch({
                        changes: {
                          from: index,
                          to: index + loadingText.length,
                          insert: "",
                        },
                      });
                    }
                    return `上传失败: ${err.message}`;
                  },
                });
              }
            }
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            setMarkdown(newContent);
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "15px",
          },
          ".cm-scroller": {
            fontFamily:
              "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
            lineHeight: "1.6",
          },
          ".cm-content": {
            padding: "16px",
          },
          ".cm-gutters": {
            backgroundColor: "#f8f9fa",
            border: "none",
          },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    const scrollDOM = view.scrollDOM;
    const handleEditorScroll = () => {
      if (isSyncingRef.current) {
        isSyncingRef.current = false;
        return;
      }
      const max = scrollDOM.scrollHeight - scrollDOM.clientHeight;
      if (max <= 0) return;
      const ratio = scrollDOM.scrollTop / max;
      window.dispatchEvent(
        new CustomEvent<SyncScrollDetail>(SYNC_SCROLL_EVENT, {
          detail: { source: "editor", ratio },
        }),
      );
    };

    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<SyncScrollDetail>;
      const detail = customEvent.detail;
      if (!detail || detail.source === "editor") return;
      const max = scrollDOM.scrollHeight - scrollDOM.clientHeight;
      if (max <= 0) return;
      isSyncingRef.current = true;
      scrollDOM.scrollTo({ top: detail.ratio * max });
    };

    scrollDOM.addEventListener("scroll", handleEditorScroll);
    window.addEventListener(SYNC_SCROLL_EVENT, handleSync as EventListener);

    viewRef.current = view;

    return () => {
      scrollDOM.removeEventListener("scroll", handleEditorScroll);
      window.removeEventListener(
        SYNC_SCROLL_EVENT,
        handleSync as EventListener,
      );
      view.destroy();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMarkdown, uiTheme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc === content) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    });
  }, [content]);

  const articleStats = getArticleStats(content);

  const handleFormatPangu = () => {
    const view = viewRef.current;
    if (!view) return;

    const selection = view.state.selection.main;
    const hasSelection = !selection.empty;

    if (hasSelection) {
      const selectedText = view.state.doc.sliceString(
        selection.from,
        selection.to,
      );
      const result = formatPanguMarkdown(selectedText);
      if (result.changedCount > 0) {
        view.dispatch({
          changes: {
            from: selection.from,
            to: selection.to,
            insert: result.text,
          },
          selection: {
            anchor: selection.from,
            head: selection.from + result.text.length,
          },
        });
        toast.success(`已优化选中排版 (${result.changedCount} 处规范化)`);
      } else {
        toast("选中区域排版已符合中英文空格规范", { icon: "✨" });
      }
    } else {
      const fullText = view.state.doc.toString();
      const result = formatPanguMarkdown(fullText);
      if (result.changedCount > 0) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: result.text,
          },
        });
        toast.success(`已完成全文排版美化 (${result.changedCount} 处规范化)`);
      } else {
        toast("全文排版已符合中英文空格规范", { icon: "✨" });
      }
    }
    view.focus();
  };

  const handleInsert = (
    prefix: string,
    suffix: string,
    placeholder: string,
  ) => {
    const view = viewRef.current;
    if (!view) return;

    const selection = view.state.selection.main;
    const selectedText = view.state.doc.sliceString(
      selection.from,
      selection.to,
    );
    const textToInsert = selectedText || placeholder;
    const fullText = prefix + textToInsert + suffix;

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: fullText,
      },
      selection: {
        anchor: selection.from + prefix.length,
        head: selection.from + prefix.length + textToInsert.length,
      },
    });

    view.focus();
  };

  const handleReplaceWord = (
    oldWord: string,
    newWord: string,
    index: number,
  ) => {
    const view = viewRef.current;
    if (!view) return;

    const docLength = view.state.doc.length;
    let from = index;
    let to = index + oldWord.length;

    if (from < docLength && view.state.doc.sliceString(from, to) === oldWord) {
      view.dispatch({
        changes: { from, to, insert: newWord },
        selection: { anchor: from, head: from + newWord.length },
      });
    } else {
      const fullText = view.state.doc.toString();
      const actualIdx = fullText.indexOf(oldWord);
      if (actualIdx !== -1) {
        from = actualIdx;
        to = actualIdx + oldWord.length;
        view.dispatch({
          changes: { from, to, insert: newWord },
          selection: { anchor: from, head: from + newWord.length },
        });
      }
    }
    view.focus();
  };

  const handleReplaceContent = (newContent: string) => {
    const view = viewRef.current;
    if (!view) {
      setMarkdown(newContent);
      return;
    }
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newContent },
      selection: { anchor: 0 },
    });
    view.focus();
  };

  const handleReplaceSelection = (newText: string) => {
    const view = viewRef.current;
    if (!view) return;
    const sel = view.state.selection.main;
    if (sel.from === sel.to) {
      view.dispatch({
        changes: { from: sel.from, insert: newText },
        selection: { anchor: sel.from + newText.length },
      });
    } else {
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert: newText },
        selection: { anchor: sel.from + newText.length },
      });
    }
    view.focus();
  };

  const handleGetSelectedText = () => {
    const view = viewRef.current;
    if (!view) return "";
    const sel = view.state.selection.main;
    if (sel.from === sel.to) return "";
    return view.state.sliceDoc(sel.from, sel.to);
  };

  return (
    <div className="markdown-editor">
      <div className="editor-header">
        <span className="editor-title">Markdown 编辑器</span>
      </div>
      <Toolbar
        onInsert={handleInsert}
        onFormatPangu={handleFormatPangu}
        content={content}
        onReplaceWord={handleReplaceWord}
        onReplaceContent={handleReplaceContent}
        onReplaceSelection={handleReplaceSelection}
        getSelectedText={handleGetSelectedText}
      />
      {showSearch && viewRef.current && (
        <SearchPanel
          view={viewRef.current}
          onClose={() => setShowSearch(false)}
        />
      )}
      <div className="editor-body-wrapper">
        <div ref={editorRef} className="editor-container" />
      </div>
      <div className="editor-footer">
        <div className="editor-stats">
          <span className="editor-stat">行数: {articleStats.lines}</span>
          <span className="editor-stat">字数: {articleStats.words}</span>
          <span className="editor-stat">
            字符(不含空格): {articleStats.charsNoSpaces}
          </span>
          <span
            className="editor-stat editor-stat-reading"
            title="以微信公众号常规阅读速率 (350字/分钟) 估算"
          >
            预计阅读: {articleStats.readingTimeString}
          </span>
        </div>
        <SaveIndicator />
      </div>
    </div>
  );
}
