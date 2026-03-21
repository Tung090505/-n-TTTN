const https = require('https');
const fs = require('fs');
const dns = require('dns');
const path = require('path');

const targetPath = path.join(__dirname, 'public', 'js', 'tailwind.js');
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

console.log('Downloading Tailwind CSS (Bypassing IPv6 routing errors)...');

const options = {
    lookup: (hostname, opts, callback) => {
        // Force IPv4 as some ISPs have broken IPv6 routes causing ECONNRESET
        dns.lookup(hostname, { family: 4 }, (err, address, family) => {
            callback(err, address, family);
        });
    }
};

https.get('https://cdn.tailwindcss.com/3.4.17', options, (res) => {
    if (res.statusCode !== 200) {
        console.error('Failed with status:', res.statusCode);
        return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync(targetPath, data);
        console.log('Tải thành công! Kích thước:', (data.length / 1024).toFixed(2), 'KB');
    });
}).on('error', (err) => {
    console.error('Lỗi tải:', err.message);
});
