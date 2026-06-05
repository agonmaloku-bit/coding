process.on('uncaughtException', e => { console.error('UNCAUGHT:', e.message); process.exit(1); });
(async () => {
  const { chromium } = require('playwright-extra');
  const Stealth = require('puppeteer-extra-plugin-stealth');
  chromium.use(Stealth());
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu']
    });
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });
    const page = await ctx.newPage();

    page.on('response', async resp => {
      const url = resp.url();
      if (url.includes('turnstile') || url.includes('challenges.cloudflare') || url.includes('challenge-platform')) {
        console.log('CF:', url.slice(0,120), 'status:', resp.status());
      }
      if (url.includes('KerkoBiznesin') || url.includes('kerkobiznesin')) {
        console.log('ARBK KerkoBiznesin hit! status:', resp.status());
        try { console.log('  body:', JSON.stringify(await resp.json()).slice(0,200)); } catch {}
      }
    });

    console.log('Navigating to arbk.rks-gov.net...');
    await page.goto('https://arbk.rks-gov.net', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('Page loaded, title:', await page.title());

    // Check for NUI input
    try {
      await page.waitForSelector('input[placeholder*="Unik"]', { timeout: 8000 });
      console.log('Found NUI input!');

      // Wait for Turnstile to initialize
      await page.waitForTimeout(3000);

      // Check for Turnstile token in DOM
      const token = await page.evaluate(() => {
        const el = document.querySelector('[name="cf-turnstile-response"]');
        return el ? el.value : null;
      });
      console.log('CF token in DOM (before click):', token ? token.slice(0, 30) + '...' : 'null');

      // Fill NUI and click
      await page.locator('input[placeholder*="Unik"]').fill('810137918');
      await page.waitForTimeout(1000);
      await page.locator('button[class*="btn-search"]').click();
      console.log('Clicked search, waiting for Turnstile to solve (up to 20s)...');

      // Wait for token after click
      await page.waitForTimeout(5000);
      const token2 = await page.evaluate(() => {
        const el = document.querySelector('[name="cf-turnstile-response"]');
        return el ? el.value : null;
      });
      console.log('CF token in DOM (after click+5s):', token2 ? token2.slice(0, 30) + '...' : 'null');

      // Wait more
      await page.waitForTimeout(10000);
      const token3 = await page.evaluate(() => {
        const el = document.querySelector('[name="cf-turnstile-response"]');
        return el ? el.value : null;
      });
      console.log('CF token in DOM (after click+15s):', token3 ? token3.slice(0, 30) + '...' : 'null');

    } catch (e) {
      console.log('No NUI input found within 8s:', e.message);
    }

    await browser.close();
    console.log('Done.');
  } catch(e) {
    console.error('Error:', e.message);
    if(browser) await browser.close().catch(() => {});
  }
})();
