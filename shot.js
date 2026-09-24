// shot.js <url> <out.png> [w] [h] — 单帧截图，用于 mark 对照迭代
const { chromium } = require('playwright-core');
const EXEC = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
(async () => {
  const [, , url, out, w = '800', h = '800'] = process.argv;
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out });
  await browser.close();
  console.log('shot ->', out);
})().catch(e => { console.error(e); process.exit(1); });
