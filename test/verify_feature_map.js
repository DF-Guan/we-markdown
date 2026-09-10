const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const featureMapPath = path.join(projectRoot, 'docs', 'feature_map.md');

if (!fs.existsSync(featureMapPath)) {
    console.error("❌ docs/feature_map.md missing!");
    process.exit(1);
}

const entry = require(path.join(projectRoot, 'src', 'index.js'));
if (typeof entry.main !== 'function') {
    console.error("❌ src/index.js main export missing!");
    process.exit(1);
}

console.log("✅ Feature Map Verification Passed!");
process.exit(0);
