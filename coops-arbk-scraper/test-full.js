/**
 * Full end-to-end CapSolver → ARBK test with all headers correct
 */
const https  = require('https');
const crypto = require('crypto');

const CAP_KEY = process.env.CAPSOLVER_API_KEY;
const NUI     = process.argv[2] || '810137918';

function httpReq(hostname, path, method, headers, bodyObj) {
    return new Promise((res, rej) => {
        const body = bodyObj ? JSON.stringify(bodyObj) : null;
        const opts = {
            hostname, path, method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                ...headers,
                ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}),
            },
        };
        const req = https.request(opts, r => {
            let d = ''; r.on('data', c => d += c);
            r.on('end', () => { try { res({ s: r.statusCode, b: JSON.parse(d) }); } catch { res({ s: r.statusCode, b: d }); } });
        });
        req.on('error', rej);
        if (body) req.write(body);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    if (!CAP_KEY) {
        console.error('Set CAPSOLVER_API_KEY before running this test.');
        process.exit(1);
    }

    console.log(`\n=== ARBK Lookup Test, NUI: ${NUI} ===\n`);

    // 1. Solve Turnstile via CapSolver
    console.log('[1] Creating CapSolver task...');
    const ct = await httpReq('api.capsolver.com', '/createTask', 'POST', {}, {
        clientKey: CAP_KEY,
        task: { type: 'AntiTurnstileTaskProxyLess', websiteURL: 'https://arbk.rks-gov.net', websiteKey: '0x4AAAAAACZtiLmEmN3oaQNR' },
    });
    if (!ct.b.taskId) { console.error('CapSolver createTask failed:', ct.b); return; }
    console.log('   taskId:', ct.b.taskId);

    let token = null;
    for (let i = 0; i < 20; i++) {
        await sleep(3000);
        const r = await httpReq('api.capsolver.com', '/getTaskResult', 'POST', {}, { clientKey: CAP_KEY, taskId: ct.b.taskId });
        process.stdout.write(`   poll ${i+1}: ${r.b.status || JSON.stringify(r.b).slice(0,80)}\r`);
        if (r.b.status === 'ready') { token = r.b.solution.token; break; }
        if (r.b.errorId) { console.error('\n   CapSolver error:', r.b); return; }
    }
    if (!token) { console.error('\n   Timeout waiting for token'); return; }
    console.log(`\n   Token length: ${token.length}, prefix: ${token.slice(0, 30)}...`);

    // 2. Get ARBK API encryption key
    console.log('\n[2] Getting ARBK API key...');
    const dateResp = await httpReq('arbk.rks-gov.net', '/api/api/Home/GetDate', 'GET', {});
    const dateStr = (typeof dateResp.b === 'string' ? dateResp.b : JSON.stringify(dateResp.b)).replace(/"/g, '').trim();
    console.log('   Date:', dateStr);

    const k = Buffer.from('8056483646328769', 'utf8');
    const cipher = crypto.createCipheriv('aes-128-cbc', k, k);
    const encKey = Buffer.concat([cipher.update(Buffer.from(dateStr, 'utf8')), cipher.final()]).toString('base64');
    console.log('   Encrypted key:', encKey.slice(0, 30) + '...');

    // 3. Call ARBK KerkoBiznesin with key header + turnstile token
    console.log('\n[3] Calling KerkoBiznesin...');
    const arbkBody = {
        emriBiznesit: '', nui: NUI, nrFiscal: '', numriPersonal: '',
        aktivitetiKryesorId: '', aktivitetetTjeraId: '', Gjuha: 'sq', token,
    };
    const arbkHeaders = {
        'key': encKey,
        'Origin': 'https://arbk.rks-gov.net',
        'Referer': 'https://arbk.rks-gov.net/',
    };
    const arbk = await httpReq('arbk.rks-gov.net', '/api/api/Services/KerkoBiznesin', 'POST', arbkHeaders, arbkBody);
    console.log('   Status:', arbk.s);
    console.log('   Body:', JSON.stringify(arbk.b).slice(0, 500));

    if (arbk.s === 200 && Array.isArray(arbk.b) && arbk.b.length > 0) {
        console.log('\n=== SUCCESS ===');
        const r = arbk.b[0];
        console.log('Name:', r.emriBiznesit || r.EmriBiznesit);
        console.log('Address:', r.adresa || r.Adresa);
        console.log('Phone:', r.telefon || r.Telefon);
    } else if (arbk.s === 401) {
        console.log('\n=== 401 Unauthorized — trying with URL-encoded key ===');
        // Maybe request header needs URL encoding
        const encKeyUrl = encodeURIComponent(encKey);
        console.log('URL-encoded key:', encKeyUrl.slice(0, 40) + '...');
        const arbk2Headers = { 'key': encKeyUrl, 'Origin': 'https://arbk.rks-gov.net', 'Referer': 'https://arbk.rks-gov.net/' };
        const arbk2 = await httpReq('arbk.rks-gov.net', '/api/api/Services/KerkoBiznesin', 'POST', arbk2Headers, arbkBody);
        console.log('   Status:', arbk2.s, 'Body:', JSON.stringify(arbk2.b).slice(0, 200));
    }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
