export interface SnippetTemplate {
  id: string;
  name: string;
  category:
    | "callout"
    | "quote"
    | "list"
    | "comparison"
    | "layout"
    | "signature";
  badge: string;
  description: string;
  html: string;
}

export const CREATOR_SNIPPET_TEMPLATES: SnippetTemplate[] = [
  {
    id: "insight-callout",
    name: "灵感提示卡片",
    category: "callout",
    badge: "要点洞察",
    description: "极简微边框带品牌强调色条，适合呈现关键见解与作者注记",
    html: `<section style="margin: 20px 0; padding: 16px 20px; background-color: #f8fafc; border-left: 4px solid #07c160; border-radius: 4px 10px 10px 4px; box-sizing: border-box;">
  <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.6;">
    💡 <strong>核心要点与洞见</strong>
  </p>
  <p style="margin: 8px 0 0 0; font-size: 14px; color: #475569; line-height: 1.7;">
    在这里输入您的关键结论、背景说明或重点补充。在微信后台复制时将 100% 保持圆角与主题微色块。
  </p>
</section>`,
  },
  {
    id: "punchline-quote",
    name: "杂志风金句卡片",
    category: "quote",
    badge: "重点摘录",
    description: "居中优雅大双引号排版，舒适字距与微渐变底色，提炼文章灵魂",
    html: `<section style="margin: 28px 0; padding: 22px 26px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; text-align: center; box-sizing: border-box;">
  <div style="font-size: 30px; line-height: 1; color: #94a3b8; font-family: Georgia, serif; margin-bottom: 6px;">“</div>
  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b; line-height: 1.8; letter-spacing: 0.5px;">
    真正优秀的技术工具，应当像空气一样自然存在，在需要时默默赋能，在平时隐于无形。
  </p>
  <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b; font-style: italic;">
    —— 提炼您的文章核心观点 / 引言出处
  </p>
</section>`,
  },
  {
    id: "step-badge-list",
    name: "序号步骤清单",
    category: "list",
    badge: "逻辑拆解",
    description: "带圆标数字的流程与指南卡片，技术与干货自媒体必备",
    html: `<section style="margin: 24px 0; padding: 18px 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-sizing: border-box;">
  <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
    <span style="display: inline-block; min-width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #07c160; color: #ffffff; font-size: 12px; font-weight: 700; border-radius: 50%; margin-right: 12px; margin-top: 2px;">01</span>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.5;">第一步：明确核心目标</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6;">明确读者痛点与交付价值，搭好清晰的推演结构。</p>
    </div>
  </div>
  <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
    <span style="display: inline-block; min-width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #07c160; color: #ffffff; font-size: 12px; font-weight: 700; border-radius: 50%; margin-right: 12px; margin-top: 2px;">02</span>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.5;">第二步：沉浸式专注写作</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6;">专注于纯文本表达与逻辑论证，排版细节交由系统自动保障。</p>
    </div>
  </div>
  <div style="display: flex; align-items: flex-start;">
    <span style="display: inline-block; min-width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #07c160; color: #ffffff; font-size: 12px; font-weight: 700; border-radius: 50%; margin-right: 12px; margin-top: 2px;">03</span>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.5;">第三步：一键美化与排查</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6;">使用盘古规范优化字距，检查合规极限词后安心发文。</p>
    </div>
  </div>
</section>`,
  },
  {
    id: "comparison-card",
    name: "红绿双栏对比",
    category: "comparison",
    badge: "方案对比",
    description: "左右双列红绿对比卡片，适合推荐实践与避坑指南",
    html: `<section style="margin: 24px 0; display: flex; gap: 12px; box-sizing: border-box;">
  <div style="flex: 1; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; box-sizing: border-box;">
    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #166534;">✅ 推荐做法</p>
    <p style="margin: 0; font-size: 13px; color: #15803d; line-height: 1.6;">• 本地优先存储保护隐私安全<br>• 语义化排版让移动端更易读<br>• 适度留白增加页面高级感</p>
  </div>
  <div style="flex: 1; padding: 16px; background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; box-sizing: border-box;">
    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #9a3412;">⚠️ 避坑提醒</p>
    <p style="margin: 0; font-size: 13px; color: #c2410c; line-height: 1.6;">• 避免高饱和度大花边干扰内容<br>• 避免外链依赖导致图片失效<br>• 避免大段无间距挤占视觉</p>
  </div>
</section>`,
  },
  {
    id: "dual-image-grid",
    name: "双图并排对比",
    category: "layout",
    badge: "画廊并列",
    description: "左右等宽双图排版，优雅微间距与图注，解决垂直堆叠单调问题",
    html: `<section style="margin: 24px 0; display: flex; gap: 12px; box-sizing: border-box;">
  <div style="flex: 1; text-align: center; box-sizing: border-box;">
    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80" style="width: 100%; border-radius: 8px; display: block; object-fit: cover;" alt="对比图 A" />
    <span style="display: block; margin-top: 6px; font-size: 12px; color: #888888;">图 1 说明 (支持替换图片链接)</span>
  </div>
  <div style="flex: 1; text-align: center; box-sizing: border-box;">
    <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80" style="width: 100%; border-radius: 8px; display: block; object-fit: cover;" alt="对比图 B" />
    <span style="display: block; margin-top: 6px; font-size: 12px; color: #888888;">图 2 说明 (支持替换图片链接)</span>
  </div>
</section>`,
  },
  {
    id: "trio-image-grid",
    name: "三图画廊组合",
    category: "layout",
    badge: "画廊组合",
    description: "横向三图画廊，移动端自适应平铺，适合展示多维度细节",
    html: `<section style="margin: 24px 0; display: flex; gap: 8px; box-sizing: border-box;">
  <div style="flex: 1; text-align: center; box-sizing: border-box;">
    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80" style="width: 100%; border-radius: 6px; display: block; object-fit: cover;" alt="视角 A" />
    <span style="display: block; margin-top: 4px; font-size: 11px; color: #888888;">视角 1</span>
  </div>
  <div style="flex: 1; text-align: center; box-sizing: border-box;">
    <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80" style="width: 100%; border-radius: 6px; display: block; object-fit: cover;" alt="视角 B" />
    <span style="display: block; margin-top: 4px; font-size: 11px; color: #888888;">视角 2</span>
  </div>
  <div style="flex: 1; text-align: center; box-sizing: border-box;">
    <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80" style="width: 100%; border-radius: 6px; display: block; object-fit: cover;" alt="视角 C" />
    <span style="display: block; margin-top: 4px; font-size: 11px; color: #888888;">视角 3</span>
  </div>
</section>`,
  },
  {
    id: "author-signature",
    name: "极简文末作者名片",
    category: "signature",
    badge: "文末引流",
    description: "圆形头像框与作者介绍，自带雅致的在看与致谢导语",
    html: `<section style="margin: 32px 0 16px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; box-sizing: border-box;">
  <div style="display: flex; align-items: center; gap: 14px;">
    <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #07c160 0%, #10b981 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; font-weight: 700; flex-shrink: 0;">
      ✍️
    </div>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.4;">关于作者 / 公众号名</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">专注于深度思考与前沿工具洞察，定期分享自媒体实战经验。</p>
    </div>
  </div>
  <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #94a3b8;">
    <span>感谢您的阅读与支持</span>
    <span>✨ 点击右下角「在看」与「分享」</span>
  </div>
</section>`,
  },
];
