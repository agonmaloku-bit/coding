/**
 * ARBK Kosovo Business Registry Lookup Service
 *
 * How it works:
 *   1. GET /lookup?nui=<NUI>
 *   2a. If CAPSOLVER_API_KEY is set → use capsolver.com to solve Turnstile token,
 *       then POST Services/KerkoBiznesin directly (no browser needed, ~5-10s)
 *   2b. Otherwise → launch stealth browser, fill form, intercept KerkoBiznesin response
 *
 * Config env vars:
 *   CAPSOLVER_API_KEY   - API key from capsolver.com (optional but recommended)
 *   PORT                - listen port (default 8080)
 */

const https   = require('https');
const http    = require('http');
const crypto  = require('crypto');
const express = require('express');

const app   = express();
const PORT  = process.env.PORT || 8080;
const cache = new Map();
const CACHE_TTL_MS   = 60 * 60 * 1000;
const ARBK_SITEKEY   = '0x4AAAAAACZtiLmEmN3oaQNR';
const ARBK_BASE_URL  = 'https://arbk.rks-gov.net/api/api/';

// ─── Low-level helpers ────────────────────────────────────────────────────────

function httpRequest(opts, body = null) {
    return new Promise((resolve, reject) => {
        const lib = opts.protocol === 'http:' ? http : https;
        const req = lib.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                catch { resolve({ status: res.statusCode, body: d }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

function get(path, headers = {}) {
    const u = new URL(ARBK_BASE_URL + path);
    return httpRequest({
        hostname: u.hostname, path: u.pathname + u.search, method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0', ...headers },
    });
}

function post(path, headers, bodyObj) {
    const u    = new URL(ARBK_BASE_URL + path);
    const body = JSON.stringify(bodyObj);
    return httpRequest({
        hostname: u.hostname, path: u.pathname, method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'User-Agent': 'Mozilla/5.0',
            ...headers,
        },
    }, body);
}

function capsolverPost(bodyObj) {
    const body = JSON.stringify(bodyObj);
    return httpRequest({
        hostname: 'api.capsolver.com', path: '/createTask', method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
        },
    }, body);
}

function capsolverPoll(bodyObj) {
    const body = JSON.stringify(bodyObj);
    return httpRequest({
        hostname: 'api.capsolver.com', path: '/getTaskResult', method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
        },
    }, body);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── ARBK AES key ─────────────────────────────────────────────────────────────

async function getApiKey() {
    const { body } = await get('Home/GetDate');
    const dateStr  = (typeof body === 'string' ? body : JSON.stringify(body))
                      .replace(/"/g, '').trim();
    const k      = '8056483646328769';
    const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(k, 'utf8'), Buffer.from(k, 'utf8'));
    let enc      = cipher.update(dateStr, 'utf8', 'base64');
    enc         += cipher.final('base64');
    return enc;
}

// ─── CapSolver Turnstile solver ───────────────────────────────────────────────

async function solveTurnstileViaCapsolver(apiKey) {
    const createResp = await capsolverPost({
        clientKey: apiKey,
        task: {
            type: 'AntiTurnstileTaskProxyLess',
            websiteURL: 'https://arbk.rks-gov.net',
            websiteKey: ARBK_SITEKEY,
        },
    });
    if (!createResp.body.taskId) {
        throw new Error('CapSolver createTask failed: ' + JSON.stringify(createResp.body));
    }
    const taskId = createResp.body.taskId;
    // Poll until ready (up to 60s)
    for (let i = 0; i < 20; i++) {
        await sleep(3000);
        const res = await capsolverPoll({ clientKey: apiKey, taskId });
        if (res.body.status === 'ready') return res.body.solution.token;
        if (res.body.errorId) throw new Error('CapSolver error: ' + JSON.stringify(res.body));
    }
    throw new Error('CapSolver timeout');
}

// ─── Browser-based fallback (stealth) ─────────────────────────────────────────

async function lookupViaBrowser(nui) {
    const { chromium } = require('playwright-extra');
    const Stealth      = require('puppeteer-extra-plugin-stealth');
    chromium.use(Stealth());

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
    try {
        const ctx  = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 }, locale: 'sq-AL',
        });
        const page = await ctx.newPage();

        // Detect Cloudflare PAT 401 — means this VPS IP is blocked by Turnstile
        // No point waiting the full timeout; bail early.
        let patBlocked = false;
        const turnstileBlock = new Promise((_, rej) => {
            page.on('response', resp => {
                if (resp.url().includes('/pat/') && resp.status() === 401) {
                    patBlocked = true;
                    rej(new Error('Turnstile blocked: VPS IP rejected by Cloudflare PAT (set CAPSOLVER_API_KEY)'));
                }
            });
        });

        const searchDone = new Promise(resolve => {
            page.on('response', async resp => {
                if (resp.url().includes('Services/KerkoBiznesin')) {
                    try { resolve(await resp.json()); } catch { resolve(null); }
                }
            });
        });

        await page.goto('https://arbk.rks-gov.net', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('input[placeholder*="Unik"]', { timeout: 15000 });
        await page.locator('input[placeholder*="Unik"]').fill(nui);
        await page.locator('button[class*="btn-search"]').click({ timeout: 10000 });
        console.log(`[ARBK] Browser clicked KËRKO for ${nui}, awaiting Turnstile...`);

        const result = await Promise.race([
            searchDone,
            turnstileBlock,
            new Promise((_, rej) => setTimeout(() => rej(new Error('Browser Turnstile timeout after 30s')), 30000)),
        ]);
        await browser.close();
        return result;
    } catch (e) {
        await browser.close().catch(() => {});
        throw e;
    }
}

// ─── Field mapper ─────────────────────────────────────────────────────────────

function mapRow(row) {
    // Response can be { teDhenatBiznesit: {...} } or { table: {...} } or flat
    const t = (row && row.teDhenatBiznesit) ? row.teDhenatBiznesit
             : (row && row.table)           ? row.table
             : row;
    return {
        name:          t.EmriBiznesit  || t.emriBiznesit  || '',
        trade_name:    t.EmriTregtar   || t.emriTregtar   || '',
        nui:           t.NUI           || t.NumriBiznesit || t.numriBiznesit || '',
        address:       t.Adresa        || t.adresa        || '',
        city:          t.Komuna        || t.komuna        || '',
        country:       'Kosovë',
        municipality:  t.Komuna        || t.komuna        || '',
        business_type: t.LlojiBiznesit || t.llojiBiznesit || '',
        status:        t.StatusiARBK   || t.statusiARBK   || '',
        phone:         t.Telefoni      || t.telefoni      || t.Telefon       || t.telefon       || '',
        email:         t.Email         || t.email         || '',
        website:       t.WebFaqja      || t.webFaqja      || '',
        fiscal_number: t.NumriFiskal   || t.NrFiskal      || t.nrFiskal      || '',
        nRegjistriId:  t.nRegjistriID  || t.nRegjistriId  || t.NRegjistriId  || '',
    };
}

// ─── Direct API lookup (no Turnstile required) ───────────────────────────────

async function lookupDirectApi(nui) {
    const encKey = await getApiKey();

    // Attempt 1: Home/Search GET (reverse-engineered, no token needed)
    try {
        const r = await get(`Home/Search?parameter=${encodeURIComponent(nui)}&Gjuha=sq`, { key: encKey });
        if (r.status === 200 && Array.isArray(r.body) && r.body.length > 0) {
            console.log(`[ARBK] Home/Search succeeded for NUI=${nui}`);
            return { raw: r.body, mode: 'direct-search' };
        }
        console.log(`[ARBK] Home/Search returned status=${r.status} body=${JSON.stringify(r.body).slice(0,120)}`);
    } catch (e) {
        console.warn('[ARBK] Home/Search error:', e.message);
    }

    // Attempt 2: KerkoBiznesin POST without Turnstile token
    try {
        const r = await post('Services/KerkoBiznesin', { key: encKey }, {
            emriBiznesit: '', nui, nrFiscal: '', numriPersonal: '',
            aktivitetiKryesorId: '', aktivitetetTjeraId: '', gjuhaId: '1', token: '',
        });
        if (r.status === 200 && Array.isArray(r.body) && r.body.length > 0) {
            console.log(`[ARBK] KerkoBiznesin (no token) succeeded for NUI=${nui}`);
            return { raw: r.body, mode: 'direct-notoken' };
        }
        console.log(`[ARBK] KerkoBiznesin-notoken status=${r.status} body=${JSON.stringify(r.body).slice(0,120)}`);
    } catch (e) {
        console.warn('[ARBK] KerkoBiznesin (no token) error:', e.message);
    }

    return null;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_, res) => res.json({ status: 'ok', capsolver: !!process.env.CAPSOLVER_API_KEY }));

app.get('/lookup', async (req, res) => {
    const nui      = (req.query.nui || '').trim();
    const apiKey   = process.env.CAPSOLVER_API_KEY;

    if (!nui) return res.status(400).json({ error: 'Missing nui parameter' });

    const cached = cache.get(nui);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
        return res.json({ ...cached.data, cached: true });
    }

    try {
        let raw  = null;
        let mode = 'unknown';

        // ── 1. Direct API (fastest, no Turnstile) ──
        console.log(`[ARBK] Trying direct API for NUI=${nui}...`);
        const direct = await lookupDirectApi(nui);
        if (direct) { raw = direct.raw; mode = direct.mode; }

        // ── 2. CapSolver path (reliable on VPS IPs) ──
        if (!raw && apiKey) {
            console.log(`[ARBK] Solving Turnstile via CapSolver for NUI=${nui}...`);
            const token  = await solveTurnstileViaCapsolver(apiKey);
            const encKey = await getApiKey();
            const resp   = await post('Services/KerkoBiznesin', { key: encKey }, {
                emriBiznesit: '', nui, nrFiscal: '', numriPersonal: '',
                aktivitetiKryesorId: '', aktivitetetTjeraId: '', gjuhaId: '1', token,
            });
            console.log(`[ARBK] CapSolver KerkoBiznesin status=${resp.status} results=${Array.isArray(resp.body) ? resp.body.length : JSON.stringify(resp.body).slice(0,80)}`);
            if (resp.status === 200 && Array.isArray(resp.body) && resp.body.length > 0) {
                raw = resp.body; mode = 'capsolver';
            }
        }

        // ── 3. Skip browser if CapSolver ran (IP is blocked by Turnstile PAT) ──
        if (!raw && !apiKey) {
            console.log(`[ARBK] Browser stealth lookup for NUI=${nui}...`);
            try {
                raw = await lookupViaBrowser(nui);
                if (raw) mode = 'browser';
            } catch (e) {
                console.warn('[ARBK] Browser lookup failed:', e.message);
            }
        }

        if (!raw || !Array.isArray(raw) || raw.length === 0) {
            return res.status(404).json({
                error: 'Business not found in ARBK registry',
                tip: apiKey ? null : 'Set CAPSOLVER_API_KEY env var for reliable lookups on VPS.'
            });
        }

        const result = { ...mapRow(raw[0]), mode };
        cache.set(nui, { data: result, ts: Date.now() });
        return res.json(result);
    } catch (err) {
        console.error('[ARBK] Error:', err.message);
        return res.status(503).json({ error: 'Lookup failed: ' + err.message });
    }
});

// ─── Manual token test endpoint ───────────────────────────────────────────────
// Usage: GET /lookup-with-token?nui=810137918&token=<cf_token>&key=<key_header>
// How to get BOTH values in one go:
//   1. Open https://arbk.rks-gov.net in your browser
//   2. Open DevTools → Network tab → filter: KerkoBiznesin
//   3. Enter any NUI and click Kërko
//   4. Click the captured POST request → Headers → copy the "key" header value
//   5. Click the same request → Payload → copy the "token" field value
//   6. curl "http://127.0.0.1:8181/lookup-with-token?nui=810137918&key=KEY&token=TOKEN"
//      (URL-encode the values or use --data-urlencode with curl)
app.get('/lookup-with-token', async (req, res) => {
    const nui        = (req.query.nui   || '').trim();
    const token      = (req.query.token || '').trim();
    const rawKey     = (req.query.key   || '').trim();

    if (!nui)   return res.status(400).json({ error: 'Missing nui parameter' });
    if (!token) return res.status(400).json({ error: 'Missing token — get it from DevTools → KerkoBiznesin request → Payload → token field' });

    try {
        // Use browser-copied key if provided, otherwise generate our own
        const encKey = rawKey || await getApiKey();
        console.log(`[ARBK] manual-token lookup NUI=${nui} key=${encKey.slice(0,20)}... token=${token.slice(0,20)}...`);

        const resp = await post('Services/KerkoBiznesin', { key: encKey }, {
            emriBiznesit: '', nui, nrFiscal: '', numriPersonal: '',
            aktivitetiKryesorId: '', aktivitetetTjeraId: '', gjuhaId: '1', token,
        });
        console.log(`[ARBK] manual-token status=${resp.status}`);
        if (resp.status === 200 && Array.isArray(resp.body) && resp.body.length > 0) {
            return res.json({ ...mapRow(resp.body[0]), mode: 'manual-token' });
        }
        return res.status(resp.status).json({ raw_status: resp.status, raw_body: resp.body });
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`ARBK service on :${PORT} [capsolver=${!!process.env.CAPSOLVER_API_KEY}]`));
