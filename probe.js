// DOM 探针：读取终态下 8 段 knot 的计算样式，定位 fill 失效根因
const { chromium } = require('playwright-core');
const EXEC = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8123/promo.html', { waitUntil: 'networkidle' });
  const info = await page.evaluate(() => {
    window.seek(15.9);
    const knot = document.getElementById('knot');
    const paths = [...knot.querySelectorAll('path')];
    return {
      knotChildren: knot.childNodes.length,
      paths: paths.map((s, i) => ({
        i,
        dHead: s.getAttribute('d').slice(0, 30),
        styleFO: s.style.fillOpacity,
        computedFO: getComputedStyle(s).fillOpacity,
        fillAttr: s.getAttribute('fill'),
        dash: s.style.strokeDashoffset,
        totalLen: Math.round(s.getTotalLength()),
        bbox: (() => { const b = s.getBBox(); return [b.x.toFixed(1), b.y.toFixed(1), b.width.toFixed(1), b.height.toFixed(1)].join(','); })(),
      })),
      seedOpacity: getComputedStyle(document.getElementById('seedgrid')).opacity,
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
