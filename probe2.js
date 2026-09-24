// 像素探针 v2：onload 等待 + mark 区域墨色像素统计
const { chromium } = require('playwright-core');
const EXEC = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8123/promo.html', { waitUntil: 'networkidle' });
  const out = await page.evaluate(() => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = 1920; cv.height = 1080;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const cx = 960, cy = 367, R = 175;
        const d = ctx.getImageData(cx - R, cy - R, 2 * R, 2 * R).data;
        let dark = 0, total = 0, min = 255;
        for (let y = 0; y < 2 * R; y++) {
          for (let x = 0; x < 2 * R; x++) {
            const dx = x - R, dy = y - R;
            if (dx * dx + dy * dy > R * R) continue;
            const i = (y * 2 * R + x) * 4;
            const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            total++;
            if (lum < 100) dark++;
            if (lum < min) min = lum;
          }
        }
        resolve({ darkPixels: dark, circlePixels: total, darkRatio: (dark / total).toFixed(3), darkest: Math.round(min) });
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('image load failed'));
    img.src = '/frames/f_0383.jpg';
  }));
  console.log(JSON.stringify(out));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
