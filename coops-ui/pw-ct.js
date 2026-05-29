const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const consoleMsgs = [];
  const pageErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => pageErrors.push(err.message + '\n' + (err.stack || '')));
  page.on('requestfailed', (req) => networkErrors.push(`${req.failure()?.errorText} ${req.url()}`));
  page.on('response', async (res) => {
    if (res.status() >= 400) networkErrors.push(`HTTP ${res.status()} ${res.request().method()} ${res.url()}`);
  });

  try {
    console.log('Navigating to login...');
    await page.goto('https://cl.ictility.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);

    console.log('URL after initial load:', page.url());

    // Try to find the login form
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="mail" i]';
    const passSel = 'input[type="password"]';

    await page.waitForSelector(emailSel, { timeout: 15000 });
    await page.fill(emailSel, 'agoni.m1@gmail.com');
    await page.fill(passSel, 'Admin1234');

    await Promise.all([
      page.waitForURL(/\/platform/, { timeout: 30000 }).catch(() => {}),
      page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign")'),
    ]);
    await page.waitForTimeout(2000);
    console.log('URL after login:', page.url());

    console.log('Navigating to Contract Templates...');
    await page.goto('https://cl.ictility.com/platform/contract_templates', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2000);
    console.log('URL:', page.url());

    const bodyHTML = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('--- body snippet ---');
    console.log(bodyHTML);

    // Find the Add button
    const addBtn = await page.locator('button:has-text("Add"), button:has-text("Shto"), .btn-outline-primary:has-text("Add")').first();
    const cnt = await addBtn.count();
    console.log('Add button count:', cnt);
    if (cnt > 0) {
      console.log('Clicking Add...');
      await addBtn.click();
      await page.waitForTimeout(1500);

      const modalOpen = await page.locator('.modal.show, .modal[style*="display: block"], .showAddModal').count();
      console.log('Modal visible elements:', modalOpen);
      const bodyAfter = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log('--- body after click snippet ---');
      console.log(bodyAfter);

      // Deeper debug: modal presence in DOM, QuillEditor presence
      const diag = await page.evaluate(() => {
        const modals = document.querySelectorAll('.modal');
        const quill = document.querySelectorAll('.ql-editor, .ql-container, [ref="addEditor"]');
        const teleported = document.querySelectorAll('body > .modal');
        return {
          modalCount: modals.length,
          modalsHTML: Array.from(modals).slice(0,2).map(m => ({
            classes: m.className,
            style: m.getAttribute('style'),
            visible: m.offsetParent !== null,
            innerSnippet: m.innerHTML.substring(0, 200),
          })),
          quillCount: quill.length,
          teleportedCount: teleported.length,
          errorBoundaryVisible: !!document.querySelector('.error-boundary, [data-error]'),
          appContent: document.querySelector('#app')?.children.length || 0,
        };
      });
      console.log('--- DOM DIAG ---');
      console.log(JSON.stringify(diag, null, 2));
    }

    await page.screenshot({ path: '/tmp/ct-after.png', fullPage: false });
  } catch (e) {
    console.log('SCRIPT ERROR:', e.message);
  } finally {
    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMsgs.forEach((m) => console.log(m));
    console.log('\n=== PAGE ERRORS ===');
    pageErrors.forEach((m) => console.log(m));
    console.log('\n=== NETWORK ERRORS / 4xx 5xx ===');
    networkErrors.forEach((m) => console.log(m));
    await browser.close();
  }
})();
