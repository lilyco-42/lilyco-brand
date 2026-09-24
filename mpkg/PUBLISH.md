# 发布 lilyco-brand.mpkg 到 mpkg-registry（手动执行）

包已按 registry 契约打好（zip + sha256 命名），**未自动推送公开 repo**。发布步骤：

```bash
ID=eb687f0bdba064161502d175392e8e3ad8eb673e1706b883e8ac453f08564e6b
PKG=lilyco-brand-0.2.0-eb687f0bdba0.mpkg

# 1. clone registry
gh repo clone lilyco-42/mpkg-registry /tmp/mpkg-registry && cd /tmp/mpkg-registry

# 2. 放入包
cp <本目录>/$PKG packages/

# 3. 合并索引（把 index-entry.json 的对象 append 进 index.json 的 packages[]）
node -e "
const fs=require('fs');
const idx=JSON.parse(fs.readFileSync('index.json','utf8'));
const entry=JSON.parse(fs.readFileSync('<本目录>/index-entry.json','utf8'));
// 0.1.0 旧条目（090f0731…）如存在则移除，只保留 0.2.0
idx.packages=idx.packages.filter(p=>p.name!=='lilyco-brand');
idx.packages.push(entry);
fs.writeFileSync('index.json',JSON.stringify(idx,null,2)+'\n');"

# 4. 提交推送
git add packages/$PKG index.json
git commit -m "publish lilyco-brand 0.2.0 ($PKG) — canonical OpenAI Blossom path as geometry baseline"
git push
```

注意：这是公开 repo，推送前确认 `atoms/` 与 `brand-spec.json` 内容可公开。

## 0.2.0 变更记录
- mark 重构：由「6 瓣放射百合」改为「风车结」，逐帧复刻 OpenAI Blossom 构造
  （种子网格 → 120° 瓣弧 + 60° 内旋螺旋 → 6 钩叠套），参数化生成器 `gen_blossom.js` 入包。
- **42 移出标识中心**（用户裁决：突兀），改为标识右外侧 monogram / 字标上标。
- lockup 同步更新为 `lilyco⁴²` 形式。

## v3（eb687f0bdba0，2026-09-24 19:50）
- mark 几何基线切换：**官方 OpenAI Blossom 24×24 路径**（simple-icons `openai.svg`，8 子路径）直接作为真值，
  替代 v1/v2 参数化 6 钩（用户两轮否决：内旋质感「太黑」「没到那种感觉」——根因是拓扑不是真花结）。
- promo 动画改整卷顺序描边（0.70→3.65s）→ 实心收束（3.55→4.05s）；lockup / 构造图同步。
- ⚠️ 该路径与 OpenAI 商标图形一致，对外商用前需差异化重参数化。

## 0.3.0 变更记录
- **promo v4 动效丰富化**：单卷描边 → 官方三幕编排（种子网格构造线 → 8 段错峰编织 → compound 实心淡入），
  复刻官方 Blossom 动画的丰富度（用户验收：「0-6s 非常酷」）。
- 修复两个关键坑：① 拆分 path 必须自带 `scale(8.3333) translate(-12,-12)`（丢了整花缩成小点）；
  ② 孔洞 fill 必须用完整 compound path 承担（拆分段各自 fill 会把中心六边形填死）。
- **新增 14s「42 砸地生百合」动画**（lily_promo.html + gen_lily.js + render2.js）：
  42 重力砸落 → 冲击环/裂纹/尘埃/镜头震动/squash → 升为顶冠 → 地面裂缝长出百合
  （参数化 3+3 花被片错峰旋开编织 + 6 雄蕊 1 雌蕊点亮）→ 缓缓浮现 lyco brain · 云枢智创。
- 像素统计验收：空场 0.02% / 42 落地 41.1% / 绽放 3.7%→5.4% / 文字 22.9% / 顶冠 13.2%。
