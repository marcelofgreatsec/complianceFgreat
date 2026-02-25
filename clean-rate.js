const fs = require('fs');
const path = require('path');

const targetFiles = [
    'app/api/assets/route.ts',
    'app/api/licenses/route.ts',
    'app/api/backups/route.ts',
    'app/api/infra/route.ts',
    'app/api/docs/route.ts',
    'app/api/audit/route.ts'
];

targetFiles.forEach(relPath => {
    const file = path.join(__dirname, relPath);
    if (!fs.existsSync(file)) return;

    let content = fs.readFileSync(file, 'utf8');

    // Regex to remove the rate limit block
    const getRegex = /const clientIp = req\.headers\.get\('x-forwarded-for'\) \|\| 'unknown';\s+const { success } = await rateLimit\(clientIp\);\s+if \(\!success\) {[^}]+}\s+/g;
    const ipRegex = /const ip = req\.headers\.get\('x-forwarded-for'\) \|\| 'unknown';\s+const { success } = await rateLimit\(ip\);\s+if \(\!success\) {[^}]+}\s+/g;

    content = content.replace(getRegex, '');
    content = content.replace(ipRegex, '');

    // also remove rateLimit imports
    content = content.replace(/import { rateLimit } from '@\/lib\/rate-limit';?\n/g, '');

    fs.writeFileSync(file, content, 'utf8');
    console.log('Cleaned ' + relPath);
});
