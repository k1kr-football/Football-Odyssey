const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('ERROR:', msg.text());
      const args = msg.args();
      args.forEach(arg => console.log('ARG:', arg._remoteObject.description));
    }
  });
  
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    localStorage.setItem('rtg_careersave', JSON.stringify({
      screen: 'HUB',
      player: { firstName: 'Test', lastName: 'Player', finances: { balance: 0 }, reputation: { world: 0 } },
      currentWeek: 1, currentDay: 'MON', inbox: [], seasonCalendar: []
    }));
  });
  await page.reload();
  await new Promise(r => setTimeout(r, 1000));
  const continueBtn = await page.$('button');
  if (continueBtn) await continueBtn.click();
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
