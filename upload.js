require('dotenv').config();
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ],
    defaultViewport: null
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36"
  );

  console.log("Navigating to login page...");
  await page.goto('https://www.naukri.com/mnjuser/profile', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log("Waiting for login fields...");
  await page.waitForSelector('#usernameField', { timeout: 60000 });
  await page.type('#usernameField', process.env.NAUKRI_EMAIL, { delay: 50 });
  await page.type('#passwordField', process.env.NAUKRI_PASSWORD, { delay: 50 });

  const loginBtnSelector = 'button[type="submit"], .btn-primary.login-btn';
  await page.waitForSelector(loginBtnSelector);
  await Promise.all([
    page.click(loginBtnSelector),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  console.log("Logged in. Navigating to profile page...");
  await page.goto('https://www.naukri.com/mnjuser/profile', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log("Waiting for upload resume button...");
  const uploadInputSelector = 'input[type="file"]';
  await page.waitForSelector(uploadInputSelector, { timeout: 60000 });

  const resumePath = path.resolve(process.env.RESUME_PATH);
  const inputUploadHandle = await page.$(uploadInputSelector);
  await inputUploadHandle.uploadFile(resumePath);

  console.log("Resume uploaded. Waiting for save...");
  await page.waitForTimeout(5000);

  await browser.close();
  console.log("✅ Resume upload completed successfully.");
})();
