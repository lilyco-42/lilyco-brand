// 对照实验：A=终态截图；B=注入测试图形后再截图
const { chromium } = require('playwright-core');
const fs = require('fs');
const EXEC = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8123/promo.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.seek(15.9));
  await page.screenshot({ path: 'shotA.png', clip: { x: 700, y: 150, width: 520, height: 440 } });

  await page.evaluate(() => {
    const knot = document.getElementById('knot');
    knot.insertAdjacentHTML('beforeend',
      '<circle id="t1" r="20" fill="#FF0000" stroke="none"/>' +
      '<path id="t2" d="M-60,-60 h30 v30 h-30 Z" fill="#00FF00" stroke="none"/>');
    // 同时给 seg0 强制去掉 dash/填充透明，验证 path 能否以最朴素方式渲染
    const p0 = knot.querySelector('path');
    p0.setAttribute('style', 'stroke:#0000FF;stroke-width:1');
    p0.setAttribute('pathLength', null);
    p0.setAttribute('fill-opacity', '1');
  });
  await page.screenshot({ path: 'shotB.png', clip: { x: 700, y: 150, width: 520, height: 440 } });

  // 顺带 dump seg0 的最终属性
  const st = await page.evaluate(() => {
    const p0 = document.querySelector('#knot path');
    return { d0: p0.getAttribute('d').slice(0, 60), style: p0.getAttribute('style'), pl: p0.getAttribute('pathLength') };
  });
  console.log(JSON.stringify(st));
  await browser.close();
  console.log('shots written:', fs.existsSync('shotA.png'), fs.existsSync('shotB.png'));
})().catch(e => { console.error(e); process.exit(1); });
