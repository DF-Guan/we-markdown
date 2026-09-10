export const orientalInkTheme = `/* ============================================
 * 东方青黛 (Oriental Ink) 新中式美学主题
 * 专为文化随笔、诗意散文、美学艺术与东方人文特稿打造
 * ============================================ */

#ahafair {
  padding: 12px 22px;
  max-width: 677px;
  margin: 0 auto;
  font-family: "Songti SC", "Source Han Serif SC", "Noto Serif CJK SC", "STSong", serif;
  color: #27272a;
  background-color: transparent;
  word-break: break-word;
  line-height: 2.0;
}

/* 正文段落 - 水墨呼吸感温润排版 */
#ahafair p {
  margin-top: 22px;
  margin-bottom: 22px;
  line-height: 2.0;
  letter-spacing: 0.8px;
  text-align: justify;
  color: #3f3f46;
  font-size: 16px;
}

/* 一级标题 - 东方印章对称大标 */
#ahafair h1 {
  margin-top: 56px;
  margin-bottom: 36px;
  text-align: center;
}

#ahafair h1 .content {
  font-size: 23px;
  font-weight: 700;
  color: #2c5e5d;
  display: inline-block;
  padding: 8px 24px;
  letter-spacing: 2px;
  border-bottom: 2px solid #2c5e5d;
  position: relative;
  line-height: 1.4;
}

#ahafair h1 .prefix,
#ahafair h1 .suffix {
  display: inline;
  color: #c2410c;
  font-size: 14px;
  margin: 0 6px;
}

/* 二级标题 - 青黛左侧竖线与朱砂微标 */
#ahafair h2 {
  margin-top: 46px;
  margin-bottom: 24px;
  text-align: left;
}

#ahafair h2 .content {
  font-size: 18px;
  font-weight: 700;
  color: #2c5e5d;
  display: inline-block;
  border-left: 3px solid #2c5e5d;
  padding-left: 10px;
  letter-spacing: 1px;
  line-height: 1.4;
}

#ahafair h2 .prefix {
  display: inline-block;
  color: #c2410c;
  margin-right: 4px;
}

#ahafair h2 .suffix {
  display: none;
}

/* 三级标题 - 古风小节 */
#ahafair h3 {
  margin-top: 32px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #2c5e5d;
  letter-spacing: 0.5px;
}

/* 引用块 - 宣纸雅致题跋 */
#ahafair blockquote {
  margin: 28px 0;
  padding: 16px 20px;
  background-color: #fbfaf5;
  border-left: 3px solid #2c5e5d;
  border-radius: 4px;
  color: #52525b;
  line-height: 1.9;
  letter-spacing: 0.5px;
}

#ahafair blockquote p {
  margin: 4px 0;
  color: #52525b;
  font-size: 15px;
}

/* 行内代码 - 雅淡宣纸微标 */
#ahafair code:not(pre code) {
  padding: 2px 6px;
  font-size: 14px;
  color: #2c5e5d;
  background-color: #f4f4f5;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* 代码块 */
#ahafair pre {
  margin: 24px 0;
  border-radius: 8px;
  background-color: #1f2937;
  border: 1px solid #374151;
}

#ahafair pre code {
  color: #f3f4f6;
  font-size: 14px;
  line-height: 1.6;
}

/* 表格 - 古朴素雅茶色 */
#ahafair table {
  width: 100%;
  margin: 28px 0;
  border-collapse: collapse;
  font-size: 14px;
  border-top: 1px solid #2c5e5d;
  border-bottom: 1px solid #2c5e5d;
}

#ahafair th {
  background-color: #f4f6f5;
  color: #2c5e5d;
  font-weight: 700;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #e4e4e7;
}

#ahafair td {
  padding: 10px 14px;
  color: #3f3f46;
  border-bottom: 1px solid #f4f4f5;
}

/* 列表排版 */
#ahafair ul,
#ahafair ol {
  margin-top: 14px;
  margin-bottom: 14px;
  padding-left: 24px;
  color: #3f3f46;
  line-height: 1.9;
}

#ahafair li {
  margin-top: 6px;
  margin-bottom: 6px;
}

/* 加粗着色 - 朱砂强调 */
#ahafair strong {
  font-weight: 700;
  color: #c2410c;
}

/* 分割线 - 极简文人留白 */
#ahafair hr {
  margin: 36px auto;
  border: none;
  border-top: 1px dashed #cbd5e1;
  width: 50%;
}
`;
