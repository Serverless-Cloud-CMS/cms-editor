const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });
    // Check for login page by looking for a form or text
    const loginExists = await page.$('form') || await page.$x("//*[contains(text(), 'login') or contains(text(), 'Login')]");
    if (!loginExists || (Array.isArray(loginExists) && loginExists.length === 0)) {
      console.error('Login page not found');
      await browser.close();
      process.exit(1);
    }
    console.log('Login page found');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error checking login page:', err);
    await browser.close();
    process.exit(1);
  }
})();

