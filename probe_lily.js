// lily_promo 验收：关键帧区域墨色像素统计（走 http 服务避免 canvas taint）
const { chromium } = require('playwright-core');
const EXEC = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8123/frames2/';
// [帧, 名称, 区域列表 [x0,y0,x1,y1,label]]
const PLAN = [
  ['f_0003', '空场基线', [[0, 0, 1920, 1080, '全图']]],
  ['f_0033', '42落地', [[820, 520, 1100, 760, '42字区'], [480, 740, 1440, 800, '地面线带']]],
  ['f_0130', '绽放中', [[760, 160, 1160, 500, '花区']]],
  ['f_0230', '完整定格', [[760, 160, 1160, 500, '花区'], [600, 800, 1320, 940, '文字区'], [860, 60, 1060, 180, '顶冠42']]],
];

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
  await page.goto('http://127.0.0.1:8123/lily_promo.html', { waitUntil: 'load' });
  for (const [f, name, zones] of PLAN) {
    const res = await page.evaluate(async ({ f, zones }) => {
      const img = new Image();
      img.src = '../frames2/' + f + '.jpg';
      await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; });
      const W = img.naturalWidth, H = img.naturalHeight;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const out = {};
      for (const [x0, y0, x1, y1, label] of zones) {
        const d = cx.getImageData(x0, y0, x1 - x0, y1 - y0).data;
        let ink = 0, total = (x1 - x0) * (y1 - y0);
        for (let i = 0; i < d.length; i += 4) {
          const v = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (v < 120) ink++;
        }
        out[label] = (100 * ink / total).toFixed(2) + '%';
      }
      return out;
    }, { f, zones });
    console.log(f, name, JSON.stringify(res));
  }
  await browser.close();
  console.log('PROBE_DONE');
})().catch(e => { console.error(e); process.exit(1); });
