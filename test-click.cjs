const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 1000));
  
  // Set a mock save game in localStorage so "Continue Career" appears
  await page.evaluate(() => {
    localStorage.setItem('rtg_careersave', JSON.stringify({
      screen: 'HUB',
      player: { firstName: 'Test', lastName: 'Player', finances: { balance: 0 }, reputation: { world: 0 } },
      currentWeek: 1, currentDay: 'MON', inbox: [], seasonCalendar: []
    }));
  });
  await page.reload();
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Clicking Continue...");
  const continueBtn = await page.$('button');
  if (continueBtn) {
    await continueBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log('HTML AFTER CLICK:', html.substring(0, 500));
  } else {
    console.log("No button found");
  }
  await browser.close();
})();
