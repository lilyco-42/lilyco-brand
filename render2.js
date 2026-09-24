// lily_promo 渲染脚本：确定性 seek → 逐帧 JPEG（参数化：URL / DUR / 输出目录）
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = 'C:/Users/liuqi/WorkBuddy/2026-09-24-16-58-21';
const PAGE = process.argv[2] || 'lily_promo.html';
const OUT = process.argv[3] || 'frames2';
const FPS = 24, DUR = Number(process.argv[4] || 14);
const URL = 'http://127.0.0.1:8123/' + PAGE + '?v=' + Date.now();
const EXEC = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const outDir = path.join(ROOT, OUT);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: EXEC,
    headless: true,
    args: ['--force-device-scale-factor=1', '--hide-scrollbars']
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.seek(0)); // 确认契约
  const dur = await page.evaluate(() => window.DUR);
  if (dur !== DUR) throw new Error('DUR mismatch: ' + dur);
  const n = Math.floor(FPS * DUR);
  for (let i = 0; i < n; i++) {
    const t = i / FPS;
    await page.evaluate(tt => window.seek(tt), t);
    await page.screenshot({
      path: path.join(outDir, 'f_' + String(i).padStart(4, '0') + '.jpg'),
      type: 'jpeg', quality: 92
    });
    if (i % 96 === 0) console.log('frame', i, 't=' + t.toFixed(2));
  }
  await browser.close();
  console.log('rendered', n, 'frames ->', outDir);
})().catch(e => { console.error(e); process.exit(1); });
