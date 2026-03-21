const fs = require('fs');
const strip = require('strip-comments');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        
        if (file === 'node_modules' || file.startsWith('.')) continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const stripped = strip(content);

                const cleaned = stripped.replace(/\n\s*\n\s*\n/g, '\n\n');
                
                if (content !== cleaned) {
                    fs.writeFileSync(fullPath, cleaned);
                    console.log(`Removed comments from: ${fullPath}`);
                }
            } catch (err) {
                console.error(`Error processing ${fullPath}:`, err);
            }
        }
    }
}

console.log('Bắt đầu xóa ghi chú (comments) trong toàn bộ các tệp .js của dự án...');
processDir(__dirname);
console.log('Hoàn tất!');
