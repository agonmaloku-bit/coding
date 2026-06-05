const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();

    // Capture ALL navigations and responses
    const navLog = [];
    page.on('framenavigated', frame => {
        if (frame === page.mainFrame()) {
            navLog.push('NAV: ' + frame.url());
        }
    });

    // Log all requests
    page.on('request', req => {
        const url = req.url();
        if (!url.includes('GetDate') && !url.includes('.png') && !url.includes('.jpg') && !url.includes('.css') && !url.includes('.js') && !url.includes('fonts')) {
            navLog.push('REQ: ' + req.method() + ' ' + url);
        }
    });

    await page.goto('https://arbk.rks-gov.net', { waitUntil: 'networkidle', timeout: 30000 });
    navLog.length = 0; // Clear initial load
    navLog.push('=== AFTER LOAD ===');

    const nuiInput = page.locator('input[placeholder="Numri Unik Identifikues"]');
    await nuiInput.fill('810137918');

    const btn = page.locator('button[class*="btn-search"]').first();
    await btn.click({ timeout: 10000 });
    console.log('Clicked KËRKO');

    await page.waitForTimeout(5000);

    navLog.forEach(l => console.log(l));
    console.log('Final URL:', page.url());
    console.log('Title:', await page.title());

    // Get all links on the page that might be search results
    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(a => a.href).filter(h => h.includes('Search') || h.includes('Biznes') || h.includes('rbk')).slice(0, 10);
    });
    console.log('Relevant links:', links);

    await browser.close();
})().catch(e => console.error(e.message));
