require("dotenv").config();
const puppeteer = require("puppeteer");
const path = require("path");

const email = process.env.NAUKRI_EMAIL;
const password = process.env.NAUKRI_PASSWORD;
const resumePath = path.resolve(__dirname, process.env.RESUME_PATH);

(async () => {
  const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

  console.log("Using resume:", resumePath);

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to Naukri login
  await page.goto("https://www.naukri.com/nlogin/login", { waitUntil: "domcontentloaded" });

  // Fill in login form
  await page.waitForSelector("#usernameField");
  await page.type('#usernameField', email);
  await page.type('#passwordField', password);
  await page.click('button[type="submit"]');

  // Wait for login to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Go to profile page
  await page.goto("https://www.naukri.com/mnjuser/profile", { waitUntil: "networkidle2" });

  // Upload resume
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) {
    console.error("Resume file input not found.");
    await browser.close();
    return;
  }

  await fileInput.uploadFile(resumePath);
  console.log("Resume uploaded successfully!");

  // Wait before closing
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
})();
