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

    // Remove the leftover broken code from GET and POST blocks
    content = content.replace(/\s*}\);\s*return NextResponse\.json\(\{ error: 'Too many requests' \}, \{ status: 429 \}\);\s*}/g, '');

    // Fix undefined clientIp/ip in CSRF logs
    content = content.replace(/details: \{ ip: clientIp, route: /g, "details: { ip: req.headers.get('x-forwarded-for') || 'unknown', route: ");
    content = content.replace(/details: \{ ip, route: /g, "details: { ip: req.headers.get('x-forwarded-for') || 'unknown', route: ");

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + relPath);
});
