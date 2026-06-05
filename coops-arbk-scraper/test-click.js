const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    const apiLog = [];

    page.on('request', req => {
        const url = req.url();
        if (url.includes('/api/api/') && !url.includes('GetDate') && !url.includes('GetSlides') && !url.includes('GetNews') && !url.includes('GetMenus') && !url.includes('GetSocial') && !url.includes('GetLinks') && !url.includes('GetChat') && !url.includes('SideBar') && !url.includes('GetListaA') && !url.includes('LlojetE') && !url.includes('ListaK') && !url.includes('StatL') && !url.includes('StatS') && !url.includes('GetContacts')) {
            apiLog.push('REQ: ' + req.method() + ' ' + url.replace('https://arbk.rks-gov.net',''));
        }
    });

    page.on('response', async resp => {
        const url = resp.url();
        if (url.includes('/api/api/') && apiLog.some(l => l.includes(url.replace('https://arbk.rks-gov.net','').split('?')[0]))) {
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

    const nuiInput = page.locator('input[placeholder="Numri Unik Identifikues"]');
    await nuiInput.fill('810137918');

    // Try clicking the button with partial class match
    const btn = page.locator('button[class*="btn-search"]').first();
    const btnVisible = await btn.isVisible();
    console.log('Button visible:', btnVisible);
    if (btnVisible) {
        await btn.click({ timeout: 10000 });
        console.log('Clicked btn-search button');
    } else {
        // Fallback: try the submit button by index 
        const allSubmit = page.locator('button[type="submit"]');
        const cnt = await allSubmit.count();
        console.log('Submit buttons:', cnt);
        for (let i = 0; i < cnt; i++) {
            const vis = await allSubmit.nth(i).isVisible();
            const txt = await allSubmit.nth(i).innerText();
            console.log(`  submit[${i}] visible=${vis} text="${txt}"`);
        }
        // Click the one with KËRKO text
        await allSubmit.nth(1).click({ timeout: 10000 }).catch(e => console.log('Click failed:', e.message));
    }

    await page.waitForTimeout(8000);
    console.log('Final URL:', page.url());
    apiLog.forEach(l => console.log(l));

    await browser.close();
})().catch(e => console.error(e.message));
