export const bloombergEditorialTheme = `/* ============================================
 * 彭博周刊 (Bloomberg Editorial) 深度特稿主题
 * 专为财经特稿、商业洞察与长篇深度分析打造的经典报刊排版
 * ============================================ */

#ahafair {
  padding: 12px 24px;
  max-width: 677px;
  margin: 0 auto;
  font-family: Georgia, Cambria, "Songti SC", "Source Han Serif SC", "Noto Serif CJK SC", serif;
  color: #1c1917;
  background-color: transparent;
  word-break: break-word;
  line-height: 1.9;
}

/* 正文段落 - 严谨经典的报章版式 */
#ahafair p {
  margin-top: 22px;
  margin-bottom: 22px;
  line-height: 1.9;
  letter-spacing: 0.2px;
  text-align: justify;
  color: #292524;
  font-size: 16px;
}

/* 一级标题 - 权威报刊双横线大标 */
#ahafair h1 {
  margin-top: 54px;
  margin-bottom: 36px;
  text-align: center;
  border-top: 3px double #1c1917;
  border-bottom: 1px solid #1c1917;
  padding: 16px 0;
}

#ahafair h1 .content {
  font-size: 25px;
  font-weight: 800;
  color: #0c0a09;
  display: block;
  letter-spacing: 1px;
  line-height: 1.35;
}

#ahafair h1 .prefix,
#ahafair h1 .suffix {
  display: none;
}

/* 二级标题 - 典雅暗金眉题 */
#ahafair h2 {
  margin-top: 48px;
  margin-bottom: 22px;
  text-align: left;
  border-bottom: 1px solid #e7e5e4;
  padding-bottom: 8px;
}

#ahafair h2 .content {
  font-size: 19px;
  font-weight: 700;
  color: #1c1917;
  display: inline-block;
  border-left: 4px solid #b45309;
  padding-left: 12px;
  line-height: 1.35;
}

#ahafair h2 .prefix,
#ahafair h2 .suffix {
  display: none;
}

/* 三级标题 - 细黑加粗 */
#ahafair h3 {
  margin-top: 36px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #292524;
}

#ahafair h3 .content {
  color: #b45309;
}

/* 引用块 - 华尔街特稿引言 */
#ahafair blockquote {
  margin: 28px 0;
  padding: 18px 22px;
  background-color: #fafaf9;
  border-left: 3px solid #1c1917;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #44403c;
  line-height: 1.85;
}

#ahafair blockquote p {
  margin: 6px 0;
  color: #44403c;
  font-size: 15px;
}

/* 代码与行内高亮 */
#ahafair code:not(pre code) {
  padding: 2px 6px;
  font-size: 14px;
  color: #b45309;
  background-color: #f5f5f4;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

#ahafair pre {
  margin: 24px 0;
  border-radius: 8px;
  background-color: #1c1917;
  border: 1px solid #292524;
}

#ahafair pre code {
  color: #f5f5f4;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* 表格样式 - 精准财务研报网格 */
#ahafair table {
  width: 100%;
  margin: 28px 0;
  border-collapse: collapse;
  font-size: 14px;
  border-top: 2px solid #1c1917;
  border-bottom: 2px solid #1c1917;
}

#ahafair th {
  background-color: #f5f5f4;
  color: #1c1917;
  font-weight: 700;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #d6d3d1;
}

#ahafair td {
  padding: 10px 14px;
  color: #292524;
  border-bottom: 1px solid #e7e5e4;
}

/* 列表排版 */
#ahafair ul,
#ahafair ol {
  margin-top: 14px;
  margin-bottom: 14px;
  padding-left: 24px;
  color: #292524;
  line-height: 1.85;
}

#ahafair li {
  margin-top: 6px;
  margin-bottom: 6px;
}

/* 加粗强调与着色 */
#ahafair strong {
  font-weight: 700;
  color: #0c0a09;
}

/* 分割线 - 报章极细刻度 */
#ahafair hr {
  margin: 40px auto;
  border: none;
  border-top: 1px solid #d6d3d1;
  width: 60%;
}
`;
