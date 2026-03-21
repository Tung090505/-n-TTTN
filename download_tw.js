const https = require('https');
const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'public', 'js', 'tailwind-play.js');
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

console.log('Downloading Tailwind Play CDN...');

function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return download(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Status ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                fs.writeFileSync(targetPath, data);
                console.log('Downloaded successfully! Size:', data.length);
                resolve();
            });
        }).on('error', reject);
    });
}

download('https://cdn.tailwindcss.com')
    .catch(err => {
        console.log('Failed to download from primary URL:', err.message);
        console.log('Trying alternative unpkg mirror...');
        return download('https://unpkg.com/tailwindcss-cdn@3.4.1/tailwindcss.js');
    })
    .catch(err => {
        console.error('All download attempts failed:', err.message);
    });
