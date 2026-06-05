/**
 * Probe various ARBK API endpoints to find what works without Turnstile.
 */
const https  = require('https');
const crypto = require('crypto');

function req(opts, body = null) {
    return new Promise((res, rej) => {
        const r = https.request(opts, resp => {
            let d = ''; resp.on('data', c => d += c);
            resp.on('end', () => { try { res({ s: resp.statusCode, b: JSON.parse(d) }); } catch { res({ s: resp.statusCode, b: d.slice(0, 300) }); } });
        });
        r.on('error', rej); if (body) r.write(body); r.end();
    });
}

async function getKey() {
    const { b } = await req({ hostname: 'arbk.rks-gov.net', path: '/api/api/Home/GetDate', headers: { 'User-Agent': 'Mozilla/5.0' } });
    const dateStr = (typeof b === 'string' ? b : JSON.stringify(b)).replace(/"/g, '').trim();
    const k = Buffer.from('8056483646328769', 'utf8');
    const cipher = crypto.createCipheriv('aes-128-cbc', k, k);
    return Buffer.concat([cipher.update(Buffer.from(dateStr, 'utf8')), cipher.final()]).toString('base64');
}

async function get(path, key) {
    return req({
        hostname: 'arbk.rks-gov.net', path: '/api/api/' + path, method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', key: key || '' },
    });
}

async function post(path, key, bodyObj) {
    const body = JSON.stringify(bodyObj);
    return req({
        hostname: 'arbk.rks-gov.net', path: '/api/api/' + path, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'User-Agent': 'Mozilla/5.0', key: key || '' },
    }, body);
}

(async () => {
    console.log('Getting API key...');
    const key = await getKey();
    console.log('Key:', key.slice(0, 30) + '...\n');

    const nui = process.argv[2] || '810137918';
    console.log(`=== Testing with NUI: ${nui} ===\n`);

    // Explore search endpoints
    const tests = [
        ['Home/Search?parameter=' + nui + '&Gjuha=sq', 'key', 'GET'],
        ['Home/Search?parameter=' + nui + '&Gjuha=en', 'key', 'GET'],
        ['Services/NdryshimiStatusitBiznesit', 'nokey', 'GET'],

        // Maybe a direct detail endpoint if we already have ID from somewhere
        ['Services/TeDhenatBiznesit?nRegjistriId=1&Gjuha=sq&token=', 'key', 'GET'],

        // KerkoBiznesin alternatives
        ['Services/KerkoBiznesin', 'key', 'POST-nui'],
        ['Services/KerkoBiznesin', 'nokey', 'POST-nui'],

        // List endpoints
        ['Services/KomunatLista?Gjuha=sq', 'key', 'GET'],
        ['Services/AktivitetetLista?Gjuha=sq', 'key', 'GET'],
        ['Home/GetNumbBusinesses', 'key', 'GET'],
        ['Home/GetNumbBusinesses', 'nokey', 'GET'],
    ];

    for (const [path, useKey, method] of tests) {
        try {
            let r;
            if (method === 'GET') {
                r = await get(path, useKey === 'key' ? key : '');
            } else if (method === 'POST-nui') {
                r = await post(path, useKey === 'key' ? key : '', {
                    emriBiznesit: '', nui, nrFiscal: '', numriPersonal: '',
                    aktivitetiKryesorId: '', aktivitetetTjeraId: '', gjuhaId: 'sq', token: '',
                });
            }
            const preview = typeof r.b === 'object' ? JSON.stringify(r.b).slice(0, 150) : String(r.b).slice(0, 150);
            const hit = JSON.stringify(r.b).includes(nui) || JSON.stringify(r.b).toLowerCase().includes('biznes');
            console.log(`[${r.s}] ${method} ${path.split('?')[0]} [${useKey}]${hit ? ' *** HIT ***' : ''}`);
            if (r.s !== 404 && r.s !== 405) console.log('   ', preview);
        } catch (e) {
            console.log(`[ERR] ${path}: ${e.message}`);
        }
    }
})();
