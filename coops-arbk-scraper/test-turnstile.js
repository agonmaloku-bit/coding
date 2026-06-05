const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    const allReqs = [];

    page.on('request', req => {
        allReqs.push({ time: Date.now(), method: req.method(), url: req.url() });
    });

    page.on('response', async resp => {
        const url = resp.url();
        if (url.includes('/api/api/Services') || url.includes('/api/api/Home/Search')) {
            try {
                const body = await resp.text();
                console.log('IMPORTANT RESP:', url.replace('https://arbk.rks-gov.net',''), '=>', body.substring(0, 500));
            } catch (_) {}
        }
    });

    await page.goto('https://arbk.rks-gov.net', { waitUntil: 'networkidle', timeout: 40000 });
    const loadTime = Date.now();

    // Wait for Turnstile to complete 
    await page.waitForTimeout(5000);

    // Check Turnstile token BEFORE clicking
    const beforeToken = await page.evaluate(() => {
        const inp = document.querySelector('[name="cf-turnstile-response"]');
        return inp ? inp.value : 'NOT FOUND';
    });
    console.log('Turnstile token before click:', beforeToken ? beforeToken.substring(0, 50) + '...' : 'none');

    const nuiInput = page.locator('input[placeholder="Numri Unik Identifikues"]');
    await nuiInput.fill('810137918');

    const btn = page.locator('button[class*="btn-search"]').first();
    const t0 = Date.now();
    await btn.click({ timeout: 10000 });
    console.log('Clicked KËRKO');

    // Wait up to 30s for any Services API call
    await page.waitForTimeout(25000);

    // Check DOM for results
    const bodySnippet = await page.evaluate(() => document.body.innerText.substring(0, 800));
    console.log('Page body after wait:', bodySnippet);

    // Check Turnstile token AFTER clicking
    const afterToken = await page.evaluate(() => {
        const inp = document.querySelector('[name="cf-turnstile-response"]');
        return inp ? inp.value : 'NOT FOUND';
    });
    console.log('Turnstile token after:', afterToken ? afterToken.substring(0, 50) + '...' : 'none');

    // Log any new requests after click time
    const afterClickReqs = allReqs.filter(r => r.time > t0 && !r.url.includes('GetDate') && !r.url.includes('.png') && !r.url.includes('.css') && !r.url.includes('.js') && !r.url.includes('fonts'));
    console.log('After-click requests:');
    afterClickReqs.forEach(r => console.log(' ', r.method, r.url.replace('https://arbk.rks-gov.net','')));

    await browser.close();
})().catch(e => console.error(e.message));
