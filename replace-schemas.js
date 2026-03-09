const fs = require('fs');
const path = require('path');

const replacements = [
    { file: 'app/api/assets/route.ts', schema: 'AssetSchema', path: '@/lib/validations/asset-schema' },
    { file: 'app/api/licenses/route.ts', schema: 'LicenseSchema', path: '@/lib/validations/license-schema' },
    { file: 'app/api/backups/route.ts', schema: 'BackupSchema', path: '@/lib/validations/backup-schema' },
    { file: 'app/api/infra/route.ts', schema: 'InfrastructureSchema', path: '@/lib/validations/infrastructure-schema' },
    { file: 'app/api/docs/route.ts', schema: 'DocumentSchema', path: '@/lib/validations/document-schema' }
];

replacements.forEach(({ file: relPath, schema, path: newPath }) => {
    const file = path.join(__dirname, relPath);
    if (!fs.existsSync(file)) return;

    let content = fs.readFileSync(file, 'utf8');

    // Replace import statement
    const oldImportRegex = new RegExp(`import { ${schema} } from '@\/lib\/validators';`);
    const newImport = `import { ${schema} } from '${newPath}';`;

    content = content.replace(oldImportRegex, newImport);

    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + relPath);
});
