# lilyco brand

lilyco 品牌资产仓：风车结 mark（几何基线 = 官方 OpenAI Blossom 路径）、双色字标锁定组合、色彩/字型规范、确定性 HTML→Video 渲染管线，以及 **mpkg 0.3.0** 品牌资产包。

## 动画

| 片 | 文件 | 定位 |
|---|---|---|
| **Blossom 三幕编织（16s，主打）** | `promo.html` → `lilyco_promo_16s.mp4` | 官方 Blossom 8 子路径：种子网格构造线 → 错峰编织 → compound 实心收束 |
| 42 砸地生百合（14s，实验支线） | `lily_promo.html` → `lily_promo_14s.mp4` | 42 重力砸落（冲击环/裂纹/尘埃/震动/squash）→ 参数化 3+3 花被片旋开绽放 → lyco brain · 云枢智创 |

主推片为 Blossom 三幕版；百合片保留作为叙事实验与手法储备。

## 渲染管线

```
gen_blossom.js / gen_lily.js     # 参数化几何 + 三幕时序 → 生成动画 HTML
promo.html / lily_promo.html     # render(t) 纯函数 + window.seek 契约（DUR=16 / 14）
render.js / render2.js           # playwright-core + Chrome 逐帧确定性截帧（24fps）
ffmpeg                           # x264 crf18 + BGM 混流
repack.py                        # mpkg 打包（zip + sha256 前 12 位命名）
```

要点：所有画面状态由 JS 纯函数驱动（禁 CSS animation）、随机性种子化（mulberry32）、
拆分子路径必须自带空间变换、孔洞 fill 由完整 compound path 承担——详见
`mpkg/lilyco-brand/atoms/render-pipeline.md`。

## 安装使用（mpkg）

```bash
# 从 mpkg-registry 取 lilyco-brand@0.3.0（sha256:2591fc9bddf4…）
# 或直接使用本仓 mpkg/lilyco-brand/ 目录；mpkg.json 内含 steps/verify 契约
```

## ⚠️ 商用警示

- mark 几何与 OpenAI 商标图形一致（官方路径真值），**对外商用前需差异化重参数化**；
- 成片音轨为 KID《回到以后》，仅限内部演示，公开分发请自备授权 BGM。

© 2026 lilyco · 云枢智创 lain42.top
