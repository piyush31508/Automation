require('dotenv').config();
const puppeteer = require('puppeteer');

const email = process.env.NAUKRI_EMAIL;
const password = process.env.NAUKRI_PASSWORD;
const resumePath = process.env.RESUME_PATH;

(async () => {
  let browser;

  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: 'new', // Recommended headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000); // 60s timeout

    console.log("Navigating to login page...");
    await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'load' });

    console.log("Waiting for login fields...");
    await page.waitForSelector('input[type="text"]', { timeout: 15000 });
    await page.type('input[type="text"]', email, { delay: 100 });
    await page.type('input[type="password"]', password, { delay: 100 });

    const loginButton = await page.$('button[type="submit"]');
    await loginButton.click();

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("Logged in. Navigating to profile page...");

    await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'networkidle2' });

    console.log("Waiting for upload resume button...");
    await page.waitForSelector('input[type="file"]', { timeout: 20000 });

    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile(resumePath);

    console.log("Resume uploaded. Waiting for save...");
    await page.waitForTimeout(5000); // wait for upload to complete

    console.log("✅ Resume upload completed successfully.");
  } catch (err) {
    console.error("❌ Error occurred during automation:", err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
