const https = require('https');

https.get({
    hostname: 'arbk.rks-gov.net',
    path: '/static/js/main.f742929c.chunk.js',
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'identity' }
}, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {
        // Find gjuhaId:T context - what is T?
        const tIdx = d.indexOf('gjuhaId:T}');
        if (tIdx > -1) {
            console.log('=== gjuhaId:T context ===');
            console.log(d.slice(Math.max(0, tIdx - 400), tIdx + 50));
        }

        // Find all gjuhaId occurrences
        console.log('\n=== All gjuhaId occurrences ===');
        let pos = 0, count = 0;
        while ((pos = d.indexOf('gjuhaId', pos)) !== -1) {
            console.log(`[${count}] ...${d.slice(Math.max(0, pos - 60), pos + 80)}...`);
            pos += 7;
            if (++count > 12) break;
        }

        // Try to find numeric or string language IDs  
        console.log('\n=== Language switch context ===');
        const langSq = d.indexOf('"sq"');
        if (langSq > -1) console.log('sq context:', d.slice(Math.max(0, langSq - 100), langSq + 150));
    });
}).on('error', e => console.error(e.message));
