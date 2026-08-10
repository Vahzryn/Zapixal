const fs = require('fs');
let code = fs.readFileSync('src/lib/hardwareCapabilities.ts', 'utf8');
code = code.replace(/targetFormat: string,\n  \): number {/, 'targetFormat: string\n): number {');
fs.writeFileSync('src/lib/hardwareCapabilities.ts', code);
