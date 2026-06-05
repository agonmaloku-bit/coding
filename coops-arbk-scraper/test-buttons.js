const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();

    await page.goto('https://arbk.rks-gov.net', { waitUntil: 'networkidle', timeout: 30000 });

    // List all buttons
    const buttons = await page.locator('button').all();
    console.log('Button count:', buttons.length);
    for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].innerText();
        const type = await buttons[i].getAttribute('type');
        const cls = await buttons[i].getAttribute('class');
        const vis = await buttons[i].isVisible();
        if (vis) console.log(`Button[${i}] type=${type} text="${text.trim().substring(0,50)}" class=${(cls||'').substring(0,60)}`);
    }

    // Also check the URL pattern when clicking search button in the form
    const nuiInput = page.locator('input[placeholder="Numri Unik Identifikues"]');
    await nuiInput.fill('810137918');
    console.log('NUI filled');

    // Screenshot to see the state
    await page.screenshot({ path: '/tmp/arbk-form.png', fullPage: false });
    console.log('Screenshot taken');

    await browser.close();
})().catch(e => console.error(e.message));
