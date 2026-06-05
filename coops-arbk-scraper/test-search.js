const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    const apiCalls = [];

    page.on('request', req => {
        const url = req.url();
        if (url.includes('/api/api/') && !url.includes('GetDate') && !url.includes('GetSlides') && !url.includes('GetNews') && !url.includes('GetMenus')) {
            apiCalls.push({ type: 'req', method: req.method(), url: url.replace('https://arbk.rks-gov.net', ''), keyHeader: req.headers()['key'] || '' });
        }
    });

    page.on('response', async resp => {
        const url = resp.url();
        if (url.includes('/api/api/') && !url.includes('GetDate') && !url.includes('GetSlides') && !url.includes('GetNews') && !url.includes('GetMenus')) {
            let body = '';
            try { body = await resp.text(); } catch (_) {}
            apiCalls.push({ type: 'resp', url: url.replace('https://arbk.rks-gov.net', ''), body: body.substring(0, 400) });
        }
    });

    await page.goto('https://arbk.rks-gov.net', { waitUntil: 'networkidle', timeout: 30000 });

    // Fill the NUI input
    const nuiInput = page.locator('input[placeholder="Numri Unik Identifikues"]');
    await nuiInput.fill('810137918');

    // Click the search button
    const searchBtn = page.locator('button').filter({ hasText: /kërko/i }).first();
    console.log('Clicking search...');
    await searchBtn.click();
    await page.waitForTimeout(6000);

    apiCalls.forEach(c => {
        if (c.type === 'req') {
            console.log('REQ:', c.method, c.url, '| key:', c.keyHeader.substring(0, 30) + '...');
        } else {
            console.log('RESP:', c.url, '=>', c.body);
        }
    });

    // Also get page URL after navigation
    console.log('Final URL:', page.url());

    await browser.close();
})().catch(e => console.error(e.message));
