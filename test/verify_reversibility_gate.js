const fs = require('fs');
const path = require('path');

const isRelease = process.argv.includes('--release');
const isApproved = process.argv.includes('--user-approved') || process.env.USER_APPROVED === 'true';

if (isRelease && !isApproved) {
    console.error("❌ Reversibility Gate Blocked: Release requires explicit --user-approved flag!");
    process.exit(1);
}

console.log("✅ Reversibility Gate Passed!");
process.exit(0);
