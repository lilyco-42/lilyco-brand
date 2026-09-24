# lilyco 品牌四原则与视觉逻辑

> 溯源：对 OpenAI 品牌指南视频逐帧 OCR（tesseract chi_sim+eng，52 帧）+ 关键段逐帧抽帧
> （bloss_raw @1fps / bloss_fine @4fps）读出的设计语言，提炼后适配 lilyco。
> 视频无旁白（faster-whisper ASR 仅得水印字幕），内容全部为烧录字幕。

## 四原则（与 OpenAI 同构）
1. **Simplicity** — 单一视觉主体，无多余装饰。lilyco 对应：风车结 mark 是唯一主角。
2. **Space** — 大量留白即高级感。落版排版间距 ≥14px letter-spacing，元素少而大。
3. **Imperfection** — 克制的呼吸浮动（sin 微幅）代替弹跳/抖动，保留"人味"。
4. **Vivid** — 全画面仅一个强调色 `accent #7E92C6`，用在 42 monogram 与 "co" 字标上。

## Blossom 构造真相（v3 定版，2026-09-24）
OpenAI Blossom = **6 条缎带互扣的花结，中心留小六边形孔**。三版迭代结论：
- v1/v2 参数化 6 钩（种子网格 → 120° 瓣弧 + 内旋螺旋贝塞尔）在拓扑上就不是真花结，
  内旋质感始终差一口气（用户两轮否决：「太黑」/「没到那种感觉」）；
- v3 定版：**直接采用官方 24×24 路径作为几何真值**（simple-icons `openai.svg`，
  8 子路径 compound path = 外编织轮廓 + 6 片内瓣边界 + 中心六边形），
  `gen_blossom.js` 内嵌该路径，产出 `lilyco-mark.svg`（实心）/ `lilyco-mark-construction.svg`（线稿）；
- promo 动画：整卷顺序描边（dashoffset 扫过 8 子路径，0.70→3.65s cubic-out）→ 实心收束（3.55→4.05s）。
- ⚠️ 商用提示：该路径与 OpenAI 商标图形一致；lilyco 对外商用前需做差异化重参数化（旋转/端头/比例）。

lilyco 移植：**花结 = 人的温度**（百合花结意象），**60° 等分互扣 = 技术精确**。

## ⚠️ 「42」纪律（2026-09-24 用户裁决）
**绝不把 42 放进标识中心**——第一次版本把 42 挤在花心，用户判"突兀"。
正确用法：42 以独立 accent monogram 出现在标识**右外侧**（promo 落版）或字标**上标**
（lockup `lilyco⁴²`），mark 中心永远纯净。

## 命名纪律
- 主标识：**lilyco**（个人技术品牌）；业务落版：云枢智创 · lain42.top。
- ⚠️ 「云枢」与奥哲公司同名平台冲突（见 brand-brief.md §5），视觉上永远以 lilyco mark 为锚点区分。

## 应用规则
- 画布底色可用 `cream #F5EDE2`（暖）或纯白（冷）；mark 单色 ink 适配任意底。
- 动效时长节奏：整卷描边 0.70→3.65s（cubic-out）→ 实心收束 3.55→4.05s；无回弹 easing（cubic-out / cubic-inout）。
