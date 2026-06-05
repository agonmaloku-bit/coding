const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();

    // Capture ALL interesting API calls
    const apiLog = [];
    page.on('request', req => {
        const url = req.url();
        if (url.includes('/api/api/') && !url.includes('GetDate') && !url.includes('GetSlides') && !url.includes('GetNews') && !url.includes('GetMenus') && !url.includes('GetSocial') && !url.includes('GetLinks') && !url.includes('GetChat') && !url.includes('SideBar')) {
            apiLog.push('REQ: ' + req.method() + ' ' + url.replace('https://arbk.rks-gov.net',''));
        }
    });

    page.on('response', async resp => {
        const url = resp.url();
        if (url.includes('/api/api/') && !url.includes('GetDate') && !url.includes('GetSlides') && !url.includes('GetNews') && !url.includes('GetMenus') && !url.includes('GetSocial') && !url.includes('GetLinks') && !url.includes('GetChat') && !url.includes('SideBar') && !url.includes('GetListaA') && !url.includes('LlojetE') && !url.includes('ListaK') && !url.includes('StatL') && !url.includes('StatS') && !url.includes('GetContacts')) {
            try {
                const body = await resp.text();
                apiLog.push('RESP: ' + url.replace('https://arbk.rks-gov.net','') + ' => ' + body.substring(0, 400));
            } catch (_) {}
        }
    });

    page.on('framenavigated', frame => {
        if (frame === page.mainFrame()) apiLog.push('NAV: ' + frame.url());
    });

    await page.goto('https://arbk.rks-gov.net', { waitUntil: 'networkidle', timeout: 30000 });

    // Find the NUI input
    const nuiInput = page.locator('input[placeholder="Numri Unik Identifikues"]');
    await nuiInput.waitFor({ state: 'visible', timeout: 10000 });
    await nuiInput.fill('810137918');

    // Press Enter instead of clicking the button
    await nuiInput.press('Enter');

    // Wait for API response
    await page.waitForTimeout(8000);
    console.log('Final URL:', page.url());
    apiLog.forEach(l => console.log(l));

    await browser.close();
})().catch(e => console.error(e.message));
