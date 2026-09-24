# HTML→Video 确定性渲染管线配方

> 本包 `promo.html` + `render.js` 即最小可运行实例。
> 适用：品牌动画、发布会开场、任何"要逐帧可复现"的 HTML 动画出片。

## 契约（HTML 侧）
1. 固定画布：`html,body{width:1920px;height:1080px;overflow:hidden}`。
2. **确定性时间轴**：所有动画由 `render(t)` 纯函数驱动（t=秒），**禁止** CSS animation/
   transition 参与画面状态（opacity/transform 全部 JS 算）。
3. 对外暴露两个全局：
   - `window.DUR = 16`（总时长，秒）
   - `window.seek = t => { auto=false; render(t) }`（外部接管时关掉 rAF 循环）
4. 随机性必须种子化（如 mulberry32(42)），保证逐帧、逐次渲染一致。

## 渲染（Node 侧，playwright-core + 系统 Chrome，无需下载浏览器）
```js
const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://127.0.0.1:8123/promo.html');   // file:// 会被部分环境拒绝，走本地 http
for (let i = 0; i < 24 * DUR; i++) {
  await page.evaluate(t => window.seek(t), i / 24);
  await page.screenshot({ path: `frames/f_${String(i).padStart(4,'0')}.jpg`, type: 'jpeg', quality: 92 });
}
```

## 合成（ffmpeg 侧）
```bash
# 帧 → 无声视频
ffmpeg -framerate 24 -i frames/f_%04d.jpg -c:v libx264 -crf 17 -pix_fmt yuv420p -movflags +faststart out_silent.mp4
# 混 BGM（从歌曲第 24s 起截 16s，首尾淡入淡出）
ffmpeg -i out_silent.mp4 -ss 24 -t 16 -i bgm.mp3 -map 0:v -map 1:a -c:v copy \
  -af "afade=t=in:st=0:d=0.6,afade=t=out:st=15.0:d=1.0" -c:a aac -b:a 192k -shortest out.mp4
```

## 踩坑记录
- Playwright `browser_run_code_unsafe` 类工具若把代码包成单表达式再 eval，须传
  `async () => { ... }` **函数表达式**，而不是语句块。
- `file://` 导航可能被 MCP/浏览器策略拦截 → 本地 `python -m http.server` 绕行。
- **playwright-core 找不到模块（Cannot find module）**：隔离 Node 环境里包装在
  管理工作区（如 `~/.workbuddy/binaries/node/workspace/node_modules`），运行脚本必须显式
  `NODE_PATH=<该目录> node render.js`，裸 `node` 不解析该路径。
- 页面改版后必须带 cache-bust 参数重新 goto，否则 seek 到的是旧 DOM。
- BGM 可先把 16s 段预切为 wav（`pad.wav`），混流时直接 `-i pad.wav` + filter_complex
  `"[1:a]afade=..."`，比每次 `-ss 24 -t 16` 截 mp3 更稳（时长精确 16.000s）。
- BGM 用受版权保护音源（网易云 VIP 下载）仅限内部/预览；公开发布前换无版权曲或取得授权。

## 三幕编排配方（本包两条片共用）
1. **幕一 · 构造先现**：种子网格/构造圆以 `pathLength=1` + dashoffset 错峰描边，编织开始后交叉溶解。
2. **幕二 · 错峰编织**：每段子路径独立 `<path>`（⚠️ 必须自带空间变换，如 `scale(8.3333) translate(-12,-12)`），
   `stroke-dashoffset: 1-p(t)` 逐段画出，时序错峰 0.09~0.20s。百合版加「旋开」：g 上叠
   `rotate(-lean*(1-p)) scale(0.55+0.45p)`，收拢→绽放。
3. **幕三 · 实心收束**：完整 compound path 单独 fill 淡入（**孔洞语义必须由完整 compound 承担**，
   拆分段各自 fill 会用 nonzero 把孔填死）；文字逐字上浮 + 字距收拢。

## 42 砸地配方（lily_promo.html）
- 下落 easeInQuart（重力感），落地 0.95s 触发：双冲击环（r 扩散 + op 衰减）、地面线 dash 展开、
  4 条裂纹、14 粒种子化尘埃（mulberry32(4242)，抛物线）、全屏 flash 0.22 峰值、
  镜头震动 `A·e^(-7τ)·sin(46τ)`、42 squash 关键帧 1→0.80→1.07→1（体积守恒 sx=2-sy）。
- 1.70-2.50s 42 以 eio 缩升为顶冠（scale 0.34），叙事让位给花。
