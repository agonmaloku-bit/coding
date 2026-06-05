const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();

    // Track the initial requests (before button click)
    const initialUrls = new Set();
    const afterClickUrls = [];
    let clicked = false;

    page.on('request', req => {
        const url = req.url();
        if (url.includes('/api/api/')) {
            if (!clicked) {
                initialUrls.add(url.replace('https://arbk.rks-gov.net','').split('?')[0]);
            } else {
                afterClickUrls.push('REQ: ' + req.method() + ' ' + url.replace('https://arbk.rks-gov.net',''));
            }
        }
    });

    page.on('response', async resp => {
        const url = resp.url();
        if (url.includes('/api/api/') && clicked) {
            try {
                const body = await resp.text();
                afterClickUrls.push('RESP: ' + url.replace('https://arbk.rks-gov.net','') + ' => ' + body.substring(0, 500));
            } catch (_) {}
        }
    });

    page.on('framenavigated', frame => {
        if (frame === page.mainFrame()) {
            afterClickUrls.push('NAV: ' + frame.url());
        }
    });

    await page.goto('https://arbk.rks-gov.net', { waitUntil: 'networkidle', timeout: 30000 });

    const nuiInput = page.locator('input[placeholder="Numri Unik Identifikues"]');
    await nuiInput.fill('810137918');

    // Start capturing
    clicked = true;

    const btn = page.locator('button[class*="btn-search"]').first();
    await btn.click({ timeout: 10000 });
    console.log('Clicked. Waiting...');

    await page.waitForTimeout(8000);

    console.log('=== AFTER CLICK API CALLS ===');
    afterClickUrls.forEach(l => console.log(l));
    console.log('Final URL:', page.url());

    await browser.close();
})().catch(e => console.error(e.message));
