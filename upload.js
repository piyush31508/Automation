require('dotenv').config();
const puppeteer = require('puppeteer');

const email = process.env.NAUKRI_EMAIL;
const password = process.env.NAUKRI_PASSWORD;
const resumePath = process.env.RESUME_PATH;

(async () => {
  let browser;
  try {
    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
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
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36');

    console.log("🌐 Navigating to login page...");
    await page.goto('https://www.naukri.com/mnjuser/login', { waitUntil: 'domcontentloaded', timeout: 45000 });

    console.log("⌨️ Filling login credentials...");
    await page.waitForSelector('input[type="text"]', { timeout: 15000 });
    await page.type('input[type="text"]', email, { delay: 80 });
    await page.type('input[type="password"]', password, { delay: 80 });

    const loginButton = await page.$('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
      loginButton.click(),
    ]);

    console.log("✅ Logged in. Navigating to profile page...");
    await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log("📂 Uploading resume...");
    await page.waitForSelector('input[type="file"]', { timeout: 20000 });
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile(resumePath);

    await page.waitForTimeout(5000); // wait for file to upload
    console.log("✅ Resume uploaded successfully!");

  } catch (err) {
    console.error("❌ Automation error:", err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
