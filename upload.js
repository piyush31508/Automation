require("dotenv").config();
const puppeteer = require("puppeteer");
const path = require("path");

// CLI inputs
const [, , argEmail, argPassword, argResumePath] = process.argv;

// Fallback to .env if CLI args are not given
const email = argEmail || process.env.NAUKRI_EMAIL;
const password = argPassword || process.env.NAUKRI_PASSWORD;
const resumePath = path.resolve(__dirname, argResumePath || process.env.RESUME_PATH);

// Show usage help if necessary
if (!email || !password || !resumePath || process.argv.includes("--help")) {
  console.log(`
Usage:
  node upload.js <email> <password> <resume-path>

Example:
  node upload.js user@example.com mypass123 ./resume.pdf

Tip:
  You can also store credentials in a .env file:
    NAUKRI_EMAIL=your-email
    NAUKRI_PASSWORD=your-password
    RESUME_PATH=absolute-or-relative-path

CLI arguments override .env values.
`);
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to login page...");
  await page.goto("https://www.naukri.com/nlogin/login", { waitUntil: "domcontentloaded" });

  console.log("Waiting for login fields...");
  await page.waitForSelector("#usernameField", { timeout: 40000 });
  await page.type('#usernameField', email);
  await page.type('#passwordField', password);
  await page.click('button[type="submit"]');

  console.log("Logging in...");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log("Navigating to profile page...");
  await page.goto("https://www.naukri.com/mnjuser/profile", { waitUntil: "networkidle2" });

  console.log("Uploading resume...");
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) {
    console.error("❌ Resume file input not found.");
    await browser.close();
    return;
  }

  await fileInput.uploadFile(resumePath);
  console.log("✅ Resume uploaded successfully!");

  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
})();
