const fs = require('fs');
const path = require('path');

const targetFiles = [
    'modules/dashboard/utils/dashboardUtils.ts',
    'modules/assets/AssetInventory.tsx',
    'modules/docs/DocumentList.tsx',
    'modules/backups/BackupManagement.tsx',
    'modules/docs/CategoryForm.tsx',
    'modules/assets/AssetForm.tsx',
    'modules/docs/DocForm.tsx',
    'modules/backups/RoutineForm.tsx',
    'modules/infra/InfraWhiteboard.tsx',
    'modules/licenses/LicenseForm.tsx',
    'modules/admin/Administration.tsx',
    'modules/licenses/LicenseManagement.tsx'
];

targetFiles.forEach(relPath => {
    const file = path.join(__dirname, relPath);
    if (!fs.existsSync(file)) return;

    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('fetch(')) {
        const hasImport = content.includes('fetchWithCSRF');
        content = content.replace(/fetch\(/g, 'fetchWithCSRF(');

        if (!hasImport) {
            const importStatement = "import { fetchWithCSRF } from '@/lib/api';\n";
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLine = content.indexOf('\n', lastImportIndex);
                content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
            } else {
                content = importStatement + content;
            }
        }
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + relPath);
    }
});
