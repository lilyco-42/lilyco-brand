// lilyco 标识生成器 v4 —— 官方 Blossom 路径 + 三幕动效拆解
// v3：官方 24×24 路径作为几何真值（8 子路径 compound）。
// v4：为动效服务——把 8 个子路径拆成独立绝对坐标 d（相对 moveto 绝对化，
//     子路径内部命令的相对基准都在本段内，拆分不受影响），
//     供 promo 做「种子网格 → 错峰编织 → 逐瓣点亮」三幕编排。
const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/liuqi/WorkBuddy/2026-09-24-16-58-21';
const ART = path.join(ROOT, 'artifacts');

// OpenAI Blossom 官方路径（24×24，nonzero 填充，8 个子路径）
const D = "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";

const INK = '#1B1B1F';
const S = (200 / 24).toFixed(4); // 8.3333：24 盒 → 200 直径，(12,12)→(0,0)

// ---- 子路径拆解：相对 moveto → 绝对 M（内部命令原样保留） ----
function splitSubpaths(d) {
  const parts = d.split(/(?=[mM])/).filter(Boolean);
  const out = [];
  let cur = [0, 0];
  for (const seg of parts) {
    const type = seg[0];
    const body = seg.slice(1);
    const nm = body.match(/^(-?[\d.]+(?:[eE][-+]?\d+)?)\s*,?\s*(-?[\d.]+(?:[eE][-+]?\d+)?)/);
    if (type === 'M' || type === 'm') {
      if (!nm) throw new Error('bad moveto: ' + seg.slice(0, 40));
      let x = parseFloat(nm[1]), y = parseFloat(nm[2]);
      if (type === 'm') { x += cur[0]; y += cur[1]; }
      out.push('M' + x + ' ' + y + body.slice(nm[0].length));
      cur = [x, y];
    } else {
      throw new Error('segment does not start with moveto: ' + seg.slice(0, 40));
    }
  }
  return out;
}

const SUBS = splitSubpaths(D);
if (SUBS.length !== 8) throw new Error('expect 8 subpaths, got ' + SUBS.length);

// ---- 三幕动效时序（秒） ----
// seg0 外轮廓 → seg1..6 内部结构（错峰 0.12s）→ seg7 中心六边形
const T = [
  { t0: 1.35, t1: 2.60 },                                           // 外轮廓
  ...[0, 1, 2, 3, 4, 5].map(i => { const t0 = 2.00 + i * 0.12; return { t0, t1: t0 + 0.78 }; }),
  { t0: 3.30, t1: 3.90 },                                           // 六边形
];
T.forEach((s, i) => { s.f0 = i === 0 ? 2.45 : s.t1 - 0.15; });

fs.mkdirSync(ART, { recursive: true });

// 1) 最终标识：实心花结（不变）
fs.writeFileSync(path.join(ART, 'lilyco-mark.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-120 -120 240 240" role="img" aria-label="lilyco mark">
  <!-- v3+：几何基线 = OpenAI Blossom 官方路径（simple-icons openai.svg, 24x24），6 缎带编织 + 中心六边形留空 -->
  <path transform="scale(${S}) translate(-12,-12)" d="${D}" fill="${INK}"/>
</svg>
`);

// 2) 构造参考（三幕语义化）：种子网格 + 线稿
const seedCircles = [
  '    <circle cx="0" cy="0" r="96" fill="none" stroke="#1B1B1F" stroke-width="2" opacity="0.5"/>',
  ...[0, 1, 2, 3, 4, 5].map(k =>
    `    <circle cx="0" cy="-48" r="48" transform="rotate(${60 * k})" fill="none" stroke="#1B1B1F" stroke-width="2" opacity="0.5"/>`
  ),
].join('\n');
fs.writeFileSync(path.join(ART, 'lilyco-mark-construction.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-120 -120 240 240">
  <rect x="-120" y="-120" width="240" height="240" fill="#F5EDE2"/>
  <!-- 第一幕种子网格：外圆 R + 6 等圆 R/2（玫瑰窗相交） -->
${seedCircles}
  <!-- 第二幕线稿：官方花结路径 -->
  <path transform="scale(${S}) translate(-12,-12)" d="${D}" fill="none" stroke="${INK}" stroke-width="0.5" stroke-linejoin="round"/>
</svg>
`);

// 3) promo 编织段片段：8 个绝对子路径 <path>（时序内联；⚠️ 必须带 24→240 空间变换）
const lines = SUBS.map((d, i) =>
  `    <path class="k" transform="scale(${S}) translate(-12,-12)" d="${d}" pathLength="1" fill="${INK}" fill-opacity="0" data-t0="${T[i].t0.toFixed(2)}" data-t1="${T[i].t1.toFixed(2)}" data-f0="${T[i].f0.toFixed(2)}" style="stroke:${INK};stroke-width:0.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1"/>`
);
fs.writeFileSync(path.join(ART, 'knot-paths.html'), lines.join('\n') + '\n');

console.log('subpaths:', SUBS.length);
SUBS.forEach((d, i) => console.log('  seg' + i, 'len=' + d.length, 't0=' + T[i].t0, 't1=' + T[i].t1, 'f0=' + T[i].f0));
console.log('wrote lilyco-mark.svg / lilyco-mark-construction.svg / knot-paths.html');
