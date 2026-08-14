const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
  
  console.log("Clicking 'Start Career'");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const startBtn = buttons.find(b => b.textContent.includes('Start Career'));
    if(startBtn) startBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  const text = await page.evaluate(() => document.body.innerText);
  console.log("Text after click:", text.substring(0, 200));
  
  await browser.close();
})();
