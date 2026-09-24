// lilyco brain 生成器 —— 42 砸地 → 百合绽放 → lyco brain · 云枢智创
// 手法复用 lilyco promo v4（Blossom 三幕）：pathLength=1 dash 编织 + 错峰时序 + 旋开绽放
// 几何：3+3 花被片（外大内小错开 60°，真百合花式）+ 6 雄蕊 1 雌蕊 + 茎叶
// 输出：artifacts/lily-paths.html（片段存档）+ 根目录 lily_promo.html（完整渲染页）
const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/liuqi/WorkBuddy/2026-09-24-16-58-21';
const ART = path.join(ROOT, 'artifacts');
const INK = '#1B1B1F';
const BLUE = '#7E92C6';

// ---------- 几何（花心为原点，瓣沿 -y 方向） ----------
// 外层花被片 L=152 W=56（尖端微勾）
const PETAL_OUT = 'M 0,-12 C -34,-50 -38,-98 -18,-130 C -10,-144 -4,-152 2,-150 C 14,-138 30,-100 29,-44 C 28,-22 14,-8 0,-12 Z';
// 内层花被片 L=126 W=42
const PETAL_IN = 'M 0,-12 C -25,-42 -28,-80 -13,-106 C -8,-118 -3,-124 2,-122 C 11,-112 23,-82 23,-36 C 22,-18 11,-7 0,-12 Z';
// 披针形叶 L=92
const LEAF = 'M 0,0 C -10,-22 -12,-52 -4,-84 C -2,-90 1,-92 2,-88 C 8,-56 8,-24 0,0 Z';
// 茎：地面(4,620) → 花底(-2,58)，S 形（起点在地面 ⇒ dash 自下而上生长）
const STEM = 'M 4,620 C -22,470 12,250 -2,58';

const sin = a => Math.sin(a * Math.PI / 180);
const cos = a => Math.cos(a * Math.PI / 180);
const f1 = n => (Math.round(n * 10) / 10).toString();

// 雄蕊 k：角度 θ=30+60k，Q 曲线 + 花药椭圆（长轴沿径向）
function stamen(k) {
  const th = 30 + 60 * k;
  const px = f1(62 * sin(th)), py = f1(6 - 62 * cos(th));
  const cx = f1(31 * sin(th) + 6 * cos(th)), cy = f1(6 - 31 * cos(th) + 6 * sin(th));
  const d = `M 0,6 Q ${cx},${cy} ${px},${py}`;
  const ax = f1(73 * sin(th)), ay = f1(6 - 73 * cos(th));
  const anther = `<ellipse cx="0" cy="-10" rx="4.5" ry="11" transform="translate(${ax},${ay}) rotate(${th})"/>`;
  return { d, anther };
}

// ---------- 时序（秒，DUR=14） ----------
const T = {
  stem: { t0: 2.20, t1: 3.10 },
  leaf1: { t0: 2.55, t1: 3.30 },
  leaf2: { t0: 2.80, t1: 3.55 },
  guides: [3.05, 3.20, 3.35],           // 构造圆 + 2 放射线
  outer: [3.50, 3.70, 3.90].map(t0 => ({ t0, t1: t0 + 0.90 })),
  inner: [4.60, 4.75, 4.90].map(t0 => ({ t0, t1: t0 + 0.75 })),
  outerLean: [-20, 20, -20],
  innerLean: [26, -26, 26],
  outerFo: 0.05, innerFo: 0.09,
  stamens: [0, 1, 2, 3, 4, 5].map(i => 5.55 + i * 0.09),
  pistil: 6.10,
};

// ---------- SVG 片段 ----------
const S = [];

// 构造逻辑（幕二前奏）：花心圆 + 3 条放射线（外瓣方向）
S.push(`    <g id="guides" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0">`);
S.push(`      <circle cx="0" cy="0" r="160" pathLength="1" data-t0="${T.guides[0]}" style="stroke-dasharray:1;stroke-dashoffset:1"/>`);
for (let k = 1; k <= 2; k++) {
  const th = 120 * k;
  S.push(`      <line x1="0" y1="0" x2="${f1(160 * sin(th))}" y2="${f1(-160 * cos(th))}" transform="rotate(0)" pathLength="1" data-t0="${T.guides[k]}" style="stroke-dasharray:1;stroke-dashoffset:1"/>`);
}
S.push(`    </g>`);

// 茎 + 叶
S.push(`    <path id="stem" d="${STEM}" pathLength="1" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" style="stroke-dasharray:1;stroke-dashoffset:1"/>`);
S.push(`    <g transform="translate(-8,250) rotate(-52)"><path id="leaf1" d="${LEAF}" pathLength="1" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" style="stroke-dasharray:1;stroke-dashoffset:1"/></g>`);
S.push(`    <g transform="translate(6,315) rotate(46)"><path id="leaf2" d="${LEAF}" pathLength="1" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" style="stroke-dasharray:1;stroke-dashoffset:1"/></g>`);

// 花被片：g.pw（旋开 + 缩放）> path.k（dash 编织 + 淡填充）
const petal = (d, rot, tm, lean, fo) =>
`    <g class="pw" data-lean="${lean}" data-rot="${rot}" transform="rotate(${rot})">
      <path class="k" d="${d}" pathLength="1" fill="${INK}" fill-opacity="0" data-t0="${tm.t0.toFixed(2)}" data-t1="${tm.t1.toFixed(2)}" data-f0="${(tm.t1 - 0.15).toFixed(2)}" data-fo="${fo}" style="stroke:${INK};stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1"/>
    </g>`;
for (let k = 0; k < 3; k++) S.push(petal(PETAL_OUT, 120 * k, T.outer[k], T.outerLean[k], T.outerFo));
for (let k = 0; k < 3; k++) S.push(petal(PETAL_IN, 60 + 120 * k, T.inner[k], T.innerLean[k], T.innerFo));

// 雄蕊 ×6 + 雌蕊 ×1
S.push(`    <g id="stamens" stroke="${INK}" stroke-width="2.5" fill="${INK}" stroke-linecap="round">`);
for (let k = 0; k < 6; k++) {
  const st = stamen(k);
  S.push(`      <g class="st" data-t0="${T.stamens[k].toFixed(2)}" opacity="0"><path d="${st.d}" fill="none"/>${st.anther}</g>`);
}
S.push(`    </g>`);
S.push(`    <g class="st" id="pistil" data-t0="${T.pistil.toFixed(2)}" opacity="0" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M 0,6 Q 4,-28 0,-60 M -9,-73 L 0,-60 L 9,-73 M 0,-60 L 0,-77"/>
    </g>`);

const LILY_SVG = S.join('\n');

// ---------- 完整 promo ----------
// 注意：模板内 </script> 必须转义为 <\/script>
const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>lilyco brain — 42 落地生花 · 云枢智创</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1920px;height:1080px;overflow:hidden;background:#F5EDE2}
  #stage{position:relative;width:1920px;height:1080px;overflow:hidden;
    font-family:"Century Gothic","Futura","Trebuchet MS","PingFang SC","Microsoft YaHei",sans-serif;
    -webkit-font-smoothing:antialiased}
  .layer{position:absolute;inset:0;pointer-events:none}
  #glow{position:absolute;left:50%;top:42%;width:1150px;height:1150px;transform:translate(-50%,-50%);
    border-radius:50%;background:radial-gradient(circle,rgba(126,146,198,.15),rgba(227,169,188,.06) 45%,transparent 70%);opacity:0}
  #flash{position:absolute;inset:0;background:#FFFDF8;opacity:0}
  .fl{position:absolute;left:0;top:0;will-change:transform,opacity}
  /* 幕一：42 砸落 */
  #big42{left:0;top:0;font-family:"Century Gothic","Futura","Trebuchet MS",sans-serif;
    font-size:264px;line-height:1;font-weight:700;letter-spacing:6px;color:${INK};opacity:0;white-space:nowrap}
  #ground{position:absolute;left:0;top:0;opacity:0}
  #cracks line{stroke:${INK};stroke-width:2.5;stroke-linecap:round}
  .dust{position:absolute;border-radius:50%;background:${INK};opacity:0;will-change:transform,opacity}
  /* 幕二：百合 */
  #lily{left:750px;top:140px}
  /* 幕三：文字 */
  #lyco{left:960px;top:878px;font-family:"Century Gothic","Futura","Trebuchet MS",sans-serif;
    font-size:132px;line-height:1;font-weight:700;letter-spacing:3px;color:${INK};white-space:nowrap;transform:translate(-50%,-50%)}
  #lyco span{display:inline-block;opacity:0}
  #lyco .sp{width:38px}
  #slogan{left:960px;top:962px;font-family:"PingFang SC","Microsoft YaHei",sans-serif;font-size:52px;
    font-weight:700;color:${BLUE};opacity:0;transform:translate(-50%,-50%);white-space:nowrap}
  #wm{position:absolute;left:44px;top:1030px;font-size:24px;color:#8A7580;opacity:0;letter-spacing:2px}
  .pt{position:absolute;left:0;top:0;opacity:0;will-change:transform,opacity}
</style>
</head>
<body>
<div id="stage">
  <div id="glow" class="layer"></div>

  <!-- 幕一：地面线 / 裂纹 / 冲击环 / 42 -->
  <svg id="ground" class="fl" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" stroke="${INK}">
    <path id="groundline" d="M 480,760 H 1440" pathLength="1" stroke-width="3" stroke-linecap="round" style="stroke-dasharray:1;stroke-dashoffset:1"/>
    <g id="cracks" opacity="0">
      <line x1="958" y1="762" x2="902" y2="810" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1"/>
      <line x1="962" y1="762" x2="1032" y2="804" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1"/>
      <line x1="952" y1="762" x2="878" y2="788" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1"/>
      <line x1="968" y1="762" x2="1058" y2="786" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1"/>
    </g>
    <circle id="ring1" cx="960" cy="758" r="26" stroke-width="5" opacity="0"/>
    <circle id="ring2" cx="960" cy="758" r="26" stroke-width="3" opacity="0"/>
  </svg>
  <div id="big42" class="fl">42</div>

  <!-- 幕二：百合（花心页面坐标 960,330；茎底 960,760 落于地面线） -->
  <svg id="lily" class="fl" width="420" height="820" viewBox="-210 -190 420 820">
    <g id="bloom">
${LILY_SVG}
    </g>
  </svg>

  <!-- 幕三：文字 -->
  <h1 id="lyco" class="fl"><span>l</span><span>y</span><span>c</span><span>o</span><span class="sp"> </span><span>b</span><span>r</span><span>a</span><span>i</span><span>n</span></h1>
  <div id="slogan" class="fl">云枢智创</div>

  <div id="wm">© 2026 lilyco brain · 云枢智创 lain42.top</div>
  <div id="pts" class="layer"></div>
  <div id="flash" class="layer"></div>
</div>

<script>
const DUR=14;
const $=id=>document.getElementById(id);
const stage=$('stage'),glow=$('glow'),flash=$('flash'),big42=$('big42'),ground=$('ground'),
      groundline=$('groundline'),cracks=$('cracks'),ring1=$('ring1'),ring2=$('ring2'),
      bloom=$('bloom'),guides=$('guides'),stem=$('stem'),leaf1=$('leaf1'),leaf2=$('leaf2'),
      lyco=$('lyco'),slogan=$('slogan'),wm=$('wm'),pts=$('pts');
const letters=[...lyco.querySelectorAll('span')];
const petals=[...document.querySelectorAll('g.pw')].map(g=>({g,p:g.querySelector('path.k')}));
const stams=[...document.querySelectorAll('g.st')];
const guideEls=[...guides.querySelectorAll('circle,line')];
const crackEls=[...cracks.querySelectorAll('line')];

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const eoc=p=>1-Math.pow(1-p,3);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const lerp=(a,b,p)=>a+(b-a)*p;

/* 品牌星点（种子 42，同 lilyco promo）+ 尘埃（种子 4242）均确定性 */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd=mulberry32(42);
const star='M0,-12 C1.2,-3.5 3.5,-1.2 12,0 C3.5,1.2 1.2,3.5 0,12 C-1.2,3.5 -3.5,1.2 -12,0 C-3.5,-1.2 -1.2,-3.5 0,-12 Z';
const cols=['#7E92C6','#E3A9BC','#8A93A8'];
const P=[];
for(let i=0;i<6;i++){
  const c=cols[i%3], s=.5+rnd()*.5;
  const el=document.createElement('div'); el.className='pt';
  el.innerHTML='<svg width="40" height="40" viewBox="-20 -20 40 40"><path d="'+star+'" fill="'+c+'"/></svg>';
  pts.appendChild(el);
  P.push({el,x:120+rnd()*1680,y:rnd()*1080,vy:8+rnd()*12,vx:(rnd()-.5)*6,ph:rnd()*6.28,s});
}
const rd=mulberry32(4242);
const DUST=[];
for(let i=0;i<14;i++){
  const el=document.createElement('div'); el.className='dust'; pts.appendChild(el);
  DUST.push({el,vx:(rd()*2-1)*190,vy:-(50+rd()*160),life:.6+rd()*.35,r:2.5+rd()*3.5,dx:(rd()*2-1)*40});
}
const easeInQuart=p=>p*p*p*p;
/* 42 squash 关键帧（落地 0.95） */
function squash(t){
  if(t<0.95) return 1;
  if(t<1.03) return lerp(1,0.80,seg(t,0.95,1.03));
  if(t<1.20) return lerp(0.80,1.07,seg(t,1.03,1.20));
  if(t<1.50) return lerp(1.07,1,seg(t,1.20,1.50));
  return 1;
}

function render(t){
  stage.style.opacity=eoc(seg(t,0,.4)).toFixed(3);
  glow.style.opacity=(.9*eoc(seg(t,4.6,6.6))*(1-.25*seg(t,12.8,14))).toFixed(3);

  /* 幕一：42 砸落 → squash → 升为顶冠 */
  const dropP=easeInQuart(seg(t,0.15,0.95));
  big42.style.opacity=eoc(seg(t,0.10,0.22)).toFixed(3);
  const lift=eio(seg(t,1.70,2.50));
  const y=lerp(655-460*(1-dropP),118,lift);
  const sc=lerp(1,0.34,lift);
  const sy=squash(t), sx=lerp(1,2-sy,seg(t,0.95,1.5));
  big42.style.transform='translate(-50%,-50%) translate(960px,'+y.toFixed(1)+'px) scale('+(sc*sx).toFixed(3)+','+(sc*sy).toFixed(3)+')';

  /* 地面 / 裂纹 / 冲击环 / 尘埃 / 闪光 / 镜头震动 */
  ground.style.opacity='1';
  const gl=eoc(seg(t,0.95,1.45));
  groundline.style.strokeDashoffset=(1-gl).toFixed(4);
  groundline.style.opacity=(0.85-0.55*seg(t,2.0,3.5)).toFixed(3);
  cracks.style.opacity=(0.75*(1-0.6*seg(t,2.0,3.5))).toFixed(3);
  for(const c of crackEls){const p=eoc(seg(t,0.97,1.35));c.style.strokeDashoffset=(1-p).toFixed(4);}
  const r1=seg(t,0.95,1.50), r2=seg(t,1.03,1.42);
  ring1.setAttribute('r',(26+142*eoc(r1)).toFixed(1)); ring1.style.opacity=(0.75*(1-r1)).toFixed(3);
  ring2.setAttribute('r',(26+84*eoc(r2)).toFixed(1)); ring2.style.opacity=(0.5*(1-r2)).toFixed(3);
  flash.style.opacity=(0.22*(seg(t,0.95,1.02)-seg(t,1.02,1.35))).toFixed(3);
  if(t>0.95&&t<1.45){const tau=t-0.95,A=13*Math.exp(-7*tau);
    stage.style.transform='translate('+(A*Math.sin(46*tau)).toFixed(2)+'px,'+(A*0.6*Math.cos(38*tau)).toFixed(2)+'px)';}
  else stage.style.transform='none';
  for(const o of DUST){
    const q=seg(t,0.97,0.97+o.life);
    const x=960+o.dx+o.vx*q, yy=752+o.vy*q+260*q*q;
    o.el.style.opacity=(0.55*(1-q)*seg(t,0.95,1.0)).toFixed(3);
    o.el.style.transform='translate('+(x-o.r)+'px,'+(yy-o.r)+'px)';
    o.el.style.width=o.el.style.height=(o.r*2)+'px';
  }

  /* 幕二：百合三幕 —— 构造线 → 花被片错峰旋开编织 → 蕊点亮 */
  const grow=eoc(seg(t,2.20,3.10));
  stem.style.strokeDashoffset=(1-grow).toFixed(4);
  leaf1.style.strokeDashoffset=(1-eoc(seg(t,2.55,3.30))).toFixed(4);
  leaf2.style.strokeDashoffset=(1-eoc(seg(t,2.80,3.55))).toFixed(4);
  for(const gEl of guideEls){
    const p=eoc(seg(t,+gEl.dataset.t0,+gEl.dataset.t0+0.5));
    gEl.style.strokeDashoffset=(1-p).toFixed(4);
  }
  guides.style.opacity=(0.4*eoc(seg(t,3.05,3.6))*(1-seg(t,4.0,4.5))).toFixed(3);

  /* 幕二：百合三幕 —— 构造线 → 花被片错峰旋开编织 → 蕊点亮（绽放全程缓旋归位 + 定格后微摆） */
  const baseRot = -9*(1-eio(seg(t,3.5,6.9))) + (t>7 ? Math.sin(t*.8)*1.2 : 0);
  bloom.setAttribute('transform','rotate('+baseRot.toFixed(2)+')');
  for(const {g,p} of petals){
    const pr=eoc(seg(t,+p.dataset.t0,+p.dataset.t1));
    const lean=+g.dataset.lean, rot=+g.dataset.rot;
    g.setAttribute('transform','rotate('+rot+') rotate('+(-lean*(1-pr)).toFixed(2)+') scale('+(0.55+0.45*pr).toFixed(4)+')');
    p.style.strokeDashoffset=(1-pr).toFixed(4);
    p.style.fillOpacity=(+p.dataset.fo*seg(t,+p.dataset.f0,+p.dataset.f0+0.6)).toFixed(3);
  }
  for(const sEl of stams){
    const p=eoc(seg(t,+sEl.dataset.t0,+sEl.dataset.t0+0.45));
    sEl.style.opacity=p.toFixed(3);
    sEl.setAttribute('transform','scale('+(0.6+0.4*p).toFixed(3)+')');
  }

  /* 幕三：缓缓浮现 lyco brain · 云枢智创 */
  letters.forEach((el,i)=>{
    const p=eoc(seg(t,7.10+i*.055,7.65+i*.055));
    el.style.opacity=p.toFixed(3);
    el.style.transform='translateY('+(26*(1-p)).toFixed(1)+'px)';
  });
  slogan.style.opacity=eoc(seg(t,8.30,9.30)).toFixed(3);
  slogan.style.letterSpacing=(lerp(30,14,eio(seg(t,8.30,9.30)))).toFixed(1)+'px';

  /* 品牌星点呼吸 */
  for(const o of P){
    const yy=((o.y-t*o.vy)%1080+1080)%1080-20, x=o.x+t*o.vx;
    const edge=clamp(Math.min((yy-10)/70,(1010-yy)/70),0,1);
    const tw=.5+.5*Math.sin(t*1.4+o.ph);
    o.el.style.opacity=(edge*(.14+.30*tw)*eoc(seg(t,5.0,7.0))).toFixed(3);
    o.el.style.transform='translate(-50%,-50%) translate('+x+'px,'+yy+'px) scale('+(o.s*(.7+.3*tw)).toFixed(3)+') rotate('+(t*8+o.ph*30)+'deg)';
  }
  wm.style.opacity=(.5*eoc(seg(t,1.0,2.0))).toFixed(3);
}

let auto=true; const t0=performance.now();
(function loop(now){ if(auto) render(((now||0)-t0)/1000%DUR); requestAnimationFrame(loop); })(t0);
window.DUR=DUR;
window.seek=function(t){auto=false;render(t)};
<\/script>
</body>
</html>
`;

fs.mkdirSync(ART, { recursive: true });
fs.writeFileSync(path.join(ART, 'lily-paths.html'), LILY_SVG + '\n');
fs.writeFileSync(path.join(ROOT, 'lily_promo.html'), HTML);

console.log('wrote artifacts/lily-paths.html + lily_promo.html');
console.log('outer petals t0:', T.outer.map(s => s.t0).join('/'), '| inner:', T.inner.map(s => s.t0).join('/'));
