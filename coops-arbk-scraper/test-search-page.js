const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();

    // Capture ALL API calls
    page.on('request', req => {
        if (req.url().includes('/api/')) {
            console.log('REQ:', req.method(), req.url().replace('https://arbk.rks-gov.net',''));
        }
    });

    page.on('response', async resp => {
        if (resp.url().includes('/api/') && !resp.url().includes('GetDate')) {
            try {
                const body = await resp.text();
                const path = resp.url().replace('https://arbk.rks-gov.net','');
                // Only show non-empty results or interesting endpoints
                if (body !== '[]' && body.length > 10 && (path.includes('Biznes') || path.includes('Search') || path.includes('Kerkim') || path.includes('Lista'))) {
                    console.log('RESP:', path, '=>', body.substring(0, 300));
                }
            } catch (_) {}
        }
    });

    console.log('Navigating to Search results page...');
    // Navigate to search with NUI directly in URL
    await page.goto('https://arbk.rks-gov.net/Search/810137918', {
        waitUntil: 'networkidle',
        timeout: 30000
    });
    console.log('Final URL:', page.url());
    await page.waitForTimeout(3000);

    // Get page content
    const title = await page.title();
    const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Title:', title);
    console.log('Body text:', text);

    await browser.close();
})().catch(e => console.error(e.message));
