export const darktuCyberTheme = `/* ============================================
 * Darktu 极客 (Darktu Cyber) 专属主题
 * 专为现代科技、极客开发者与自媒体打造的硬核高质感排版
 * ============================================ */

#ahafair {
  padding: 8px 20px;
  max-width: 677px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  color: #1e293b;
  background-color: transparent;
  word-break: break-word;
  line-height: 1.85;
}

/* 正文段落 - 极客呼吸感排版 */
#ahafair p {
  margin-top: 20px;
  margin-bottom: 20px;
  line-height: 1.85;
  letter-spacing: 0.3px;
  text-align: justify;
  color: #334155;
  font-size: 16px;
}

/* 一级标题 - 赛博光带科技徽章 */
#ahafair h1 {
  margin-top: 56px;
  margin-bottom: 36px;
  text-align: center;
}

#ahafair h1 .content {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  display: inline-block;
  padding: 10px 24px;
  letter-spacing: 1.2px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%);
  border: 1px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.12);
  line-height: 1.4;
}

#ahafair h1 .prefix,
#ahafair h1 .suffix {
  display: none;
}

/* 二级标题 - 极客左侧能量条 */
#ahafair h2 {
  margin-top: 48px;
  margin-bottom: 24px;
  text-align: left;
}

#ahafair h2 .content {
  display: inline-block;
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
  padding: 6px 16px;
  border-left: 4px solid #6366f1;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.10) 0%, rgba(6, 182, 212, 0.02) 100%);
  border-radius: 0 6px 6px 0;
  letter-spacing: 0.5px;
  line-height: 1.35;
}

#ahafair h2 .prefix,
#ahafair h2 .suffix {
  display: none;
}

/* 三级标题 - 赛博青微标 */
#ahafair h3 {
  margin-top: 32px;
  margin-bottom: 16px;
}

#ahafair h3 .content {
  font-size: 17px;
  font-weight: 700;
  color: #4f46e5;
  display: inline-block;
  padding-left: 10px;
  border-left: 3px solid #06b6d4;
  letter-spacing: 0.3px;
}

#ahafair h3 .prefix,
#ahafair h3 .suffix {
  display: none;
}

/* 四级标题 */
#ahafair h4 {
  margin-top: 24px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.2px;
}

#ahafair h4 .content {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
}

/* 引用块 - 黑曜石玻璃感卡片 */
#ahafair blockquote {
  margin: 24px 0;
  padding: 16px 20px;
  background: #f8fafc;
  border-left: 4px solid #6366f1;
  border-radius: 0 8px 8px 0;
  color: #475569;
  font-size: 15px;
  line-height: 1.75;
  border-top: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

#ahafair blockquote p {
  margin: 6px 0;
  color: #475569;
  font-size: 15px;
  line-height: 1.75;
}

/* 多级嵌套引用 */
#ahafair .multiquote-1 {
  margin: 24px 0;
  padding: 16px 20px;
  background: #f8fafc;
  border-left: 4px solid #6366f1;
  border-radius: 0 8px 8px 0;
}

#ahafair .multiquote-1 p {
  margin: 6px 0;
  color: #475569;
  font-size: 15px;
  line-height: 1.75;
}

#ahafair .multiquote-2 {
  margin: 12px 0;
  padding: 12px 16px;
  background: rgba(99, 102, 241, 0.05);
  border-left: 3px solid #06b6d4;
  border-radius: 0 6px 6px 0;
}

#ahafair .multiquote-2 p {
  margin: 4px 0;
  color: #334155;
  font-size: 14px;
}

#ahafair .multiquote-3 {
  margin: 10px 0;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.05);
  border-left: 3px solid #10b981;
  border-radius: 0 4px 4px 0;
}

#ahafair .multiquote-3 p {
  margin: 2px 0;
  color: #475569;
  font-size: 13.5px;
}

/* 列表系统 */
#ahafair ul,
#ahafair ol {
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  color: #334155;
}

#ahafair li {
  margin-top: 8px;
  margin-bottom: 8px;
  line-height: 1.8;
  font-size: 15.5px;
}

#ahafair li section {
  margin-top: 0;
  margin-bottom: 0;
}

#ahafair ul {
  list-style-type: square;
}

#ahafair ol {
  list-style-type: decimal;
}

#ahafair ul ul,
#ahafair ol ol,
#ahafair ul ol,
#ahafair ol ul {
  margin-top: 6px;
  margin-bottom: 6px;
}

/* 超链接 - 赛博微霓虹 */
#ahafair a {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px dashed #6366f1;
  padding-bottom: 1px;
}

/* 强调与加粗 */
#ahafair strong {
  color: #0f172a;
  font-weight: 700;
}

#ahafair em {
  color: #6366f1;
  font-style: italic;
}

#ahafair em strong,
#ahafair strong em {
  color: #0f172a;
  font-weight: 800;
}

/* 高亮标记 - 极客发光笔 */
#ahafair mark {
  background: rgba(99, 102, 241, 0.16);
  color: #1e1b4b;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

/* 删除线 */
#ahafair del {
  color: #94a3b8;
  text-decoration: line-through;
}

/* 行内代码 - 芯片标签感 */
#ahafair p code,
#ahafair li code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 14px;
  color: #4338ca;
  background-color: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  margin: 0 3px;
}

/* 分割线 - 渐变能量光束 */
#ahafair hr {
  margin: 44px 0;
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #6366f1 50%, transparent 100%);
  opacity: 0.8;
}

/* 图片与图注 */
#ahafair figure {
  margin: 28px 0;
  text-align: center;
}

#ahafair img {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.1);
  display: block;
  margin: 0 auto;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

#ahafair figcaption {
  font-size: 13.5px;
  color: #64748b;
  margin-top: 10px;
  text-align: center;
  letter-spacing: 0.3px;
}

/* 表格系统 - 现代黑曜石科技网格 */
#ahafair table {
  width: 100%;
  margin: 24px 0;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  font-size: 14.5px;
}

#ahafair th {
  background: #0f172a;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 14px;
  text-align: left;
  border-bottom: 2px solid #6366f1;
  letter-spacing: 0.4px;
}

#ahafair td {
  padding: 10px 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

#ahafair tr:nth-child(even) td {
  background-color: #f8fafc;
}

#ahafair tr:last-child td {
  border-bottom: none;
}

/* 文末脚注 */
#ahafair .footnotes {
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  font-size: 13.5px;
  color: #64748b;
}

#ahafair .footnotes ol {
  padding-left: 20px;
}

#ahafair .footnotes li {
  margin-bottom: 6px;
  line-height: 1.6;
}

/* 微信深色模式优化 */
@media (prefers-color-scheme: dark) {
  #ahafair {
    color: #e2e8f0;
  }
  #ahafair p {
    color: #cbd5e1;
  }
  #ahafair h1 .content {
    color: #f8fafc;
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.5);
  }
  #ahafair h2 .content {
    color: #f8fafc;
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, transparent 100%);
  }
  #ahafair blockquote {
    background: #1e293b;
    border-color: #6366f1;
    color: #94a3b8;
  }
  #ahafair blockquote p {
    color: #94a3b8;
  }
  #ahafair p code,
  #ahafair li code {
    color: #818cf8;
    background-color: rgba(99, 102, 241, 0.18);
    border-color: rgba(99, 102, 241, 0.4);
  }
  #ahafair table {
    border-color: #334155;
  }
  #ahafair td {
    color: #cbd5e1;
    border-bottom-color: #334155;
  }
  #ahafair tr:nth-child(even) td {
    background-color: #1e293b;
  }
}
`;
