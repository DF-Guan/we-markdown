import toast from "react-hot-toast";
import { copyToWechat } from "../wechatCopyService";

export type TargetPlatform = "wechat" | "zhihu" | "juejin" | "markdown";

export interface CopyDispatchOptions {
  showMacBar?: boolean;
}

export interface PlatformConfig {
  id: TargetPlatform;
  name: string;
  badge: string;
  description: string;
}

export const SUPPORTED_PLATFORMS: PlatformConfig[] = [
  {
    id: "wechat",
    name: "微信公众号",
    badge: "推荐",
    description: "展开内联 CSS、转换计数器与适配微信暗黑模式",
  },
  {
    id: "zhihu",
    name: "知乎专栏",
    badge: "高兼容",
    description: "适配知乎排版过滤规则，优化段落间距与引用块",
  },
  {
    id: "juejin",
    name: "掘金社区",
    badge: "开发者",
    description: "优化技术文章代码块与高对比度排版结构",
  },
  {
    id: "markdown",
    name: "纯净 Markdown",
    badge: "源码",
    description: "直接复制纯文本 Markdown，适合粘贴至各大笔记软件",
  },
];

/**
 * 写入纯文本到剪贴板
 */
async function copyPlainText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 降级为 textarea execCommand
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }
  document.body.removeChild(textarea);
  return success;
}

/**
 * 多平台复制调度主入口
 */
export async function dispatchCopy(
  platform: TargetPlatform,
  markdown: string,
  css: string,
  options: CopyDispatchOptions = {},
): Promise<void> {
  if (!markdown || !markdown.trim()) {
    toast.error("正文内容为空，无法复制");
    return;
  }

  switch (platform) {
    case "wechat": {
      await copyToWechat(markdown, css, { showMacBar: options.showMacBar });
      break;
    }

    case "zhihu": {
      // 知乎专栏排版复用富文本主链路，并展示专属提示语
      await copyToWechat(markdown, css, {
        showMacBar: options.showMacBar,
        suppressToast: true,
      });
      toast.success("已复制，可直接粘贴至知乎专栏", {
        id: "copy-success-zhihu",
        duration: 2500,
        icon: "📘",
      });
      break;
    }

    case "juejin": {
      // 掘金专栏排版
      await copyToWechat(markdown, css, {
        showMacBar: options.showMacBar,
        suppressToast: true,
      });
      toast.success("已复制，可直接粘贴至掘金专栏", {
        id: "copy-success-juejin",
        duration: 2500,
        icon: "💎",
      });
      break;
    }

    case "markdown": {
      try {
        const success = await copyPlainText(markdown);
        if (!success) {
          throw new Error("剪贴板写入失败");
        }
        toast.success("已复制纯净 Markdown 源码", {
          id: "copy-success-markdown",
          duration: 2000,
          icon: "📋",
        });
      } catch {
        toast.error("复制 Markdown 源码失败，请手动选取复制");
      }
      break;
    }

    default: {
      await copyToWechat(markdown, css, { showMacBar: options.showMacBar });
      break;
    }
  }
}
