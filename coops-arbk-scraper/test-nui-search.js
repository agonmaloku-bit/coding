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
        if (url.includes('/api/api/') && !url.includes('GetDate') && !url.includes('GetSlides') && !url.includes('GetNews') && !url.includes('GetMenus') && !url.includes('GetSocial') && !url.includes('GetLinks') && !url.includes('GetChat') && !url.includes('SideBar') && !url.includes('StatL') && !url.includes('StatS') && !url.includes('GetContacts') && !url.includes('ListaK') && !url.includes('GetListaA') && !url.includes('LlojetE')) {
            apiCalls.push({ type: 'req', method: req.method(), path: url.replace('https://arbk.rks-gov.net', '') });
        }
    });

    page.on('response', async resp => {
        const url = resp.url();
        if (apiCalls.some(c => c.path && url.includes(c.path.split('?')[0].replace('/api/api/', '')))) {
            try {
                const body = await resp.text();
                apiCalls.push({ type: 'resp', path: url.replace('https://arbk.rks-gov.net', ''), body: body.substring(0, 500) });
            } catch (_) {}
        }
    });

    // Also capture navigation
    page.on('framenavigated', frame => {
        if (frame === page.mainFrame()) {
            console.log('NAV:', frame.url());
        }
    });

    await page.goto('https://arbk.rks-gov.net', { waitUntil: 'networkidle', timeout: 30000 });

    const nuiInput = page.locator('input[placeholder="Numri Unik Identifikues"]');
    await nuiInput.fill('810137918');

    // Click KËRKO button (Button[18] = class btn-search-s)
    const kerkoBtn = page.locator('button.btn-search-s');
    await kerkoBtn.click();

    // Wait for navigation and API calls
    await page.waitForTimeout(8000);
    console.log('Final URL:', page.url());

    apiCalls.forEach(c => console.log(c.type.toUpperCase(), c.path || c.method, c.body ? c.body : ''));

    await browser.close();
})().catch(e => console.error(e.message));
