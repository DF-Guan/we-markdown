const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

const allSrcFiles = [];
function scanDir(d) {
    if (!fs.existsSync(d)) return;
    fs.readdirSync(d).forEach(item => {
        const full = path.join(d, item);
        if (fs.statSync(full).isDirectory()) scanDir(full);
        else if (item.endsWith('.js')) allSrcFiles.push(full);
    });
}
scanDir(srcDir);

// 1. Extension/Index line count <= 250
const indexPath = path.join(srcDir, 'index.js');
if (fs.existsSync(indexPath)) {
    const lines = fs.readFileSync(indexPath, 'utf8').split('\n').length;
    if (lines > 250) {
        console.error(`❌ Dune Axiom 4 Violation: index.js has ${lines} lines (>250 limit)!`);
        process.exit(1);
    }
}

// 2. Zero empty catch
let emptyCatch = 0;
allSrcFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/catch\s*\([a-zA-Z0-9_]*\)\s*\{\s*\}/g);
    if (matches) emptyCatch += matches.length;
});

if (emptyCatch > 0) {
    console.error(`❌ Dune Axiom 5 Violation: Found ${emptyCatch} empty catch blocks!`);
    process.exit(1);
}

console.log("✅ Dune Architecture Verification Passed!");
process.exit(0);
