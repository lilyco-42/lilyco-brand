// 冒烟测试：关键帧 DOM 状态 + 运行时错误捕获
const { chromium } = require('playwright-core');
const URL = 'http://127.0.0.1:8123/lily_promo.html?v=' + Date.now();
const EXEC = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TS = [0.2, 1.0, 1.2, 2.8, 4.2, 5.2, 6.5, 9.5, 13.5];

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await page.goto(URL, { waitUntil: 'networkidle' });
  for (const t of TS) {
    await page.evaluate(tt => window.seek(tt), t);
    const s = await page.evaluate(() => {
      const $ = id => document.getElementById(id);
      const p0 = document.querySelector('g.pw');
      const p6 = document.querySelectorAll('g.pw')[3];
      return {
        DUR: window.DUR,
        big42: { op: $('big42').style.opacity, tf: $('big42').style.transform.slice(0, 90) },
        bloom: $('bloom') ? $('bloom').getAttribute('transform') : 'MISSING',
        petal0: p0 ? p0.getAttribute('transform') : 'MISSING',
        petal0_dash: p0 ? p0.querySelector('path.k').style.strokeDashoffset : 'MISSING',
        petal0_fill: p0 ? p0.querySelector('path.k').style.fillOpacity : 'MISSING',
        petal3: p6 ? p6.getAttribute('transform') : 'MISSING',
        stem: $('stem').style.strokeDashoffset,
        stams_op: [...document.querySelectorAll('g.st')].map(g => g.style.opacity).join(','),
        lyco_first: $('lyco').querySelector('span').style.opacity,
        slogan_op: $('slogan').style.opacity, slogan_ls: $('slogan').style.letterSpacing,
        ground: $('groundline').style.strokeDashoffset,
        flash: $('flash').style.opacity,
      };
    });
    console.log('--- t=' + t.toFixed(2), JSON.stringify(s));
  }
  await browser.close();
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'NO_JS_ERRORS');
})().catch(e => { console.error(e); process.exit(1); });
