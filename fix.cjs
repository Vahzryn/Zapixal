const fs = require('fs');
let code = fs.readFileSync('src/lib/hardwareCapabilities.ts', 'utf8');
code = code.replace(/compressionMode: string\n\): number {/, '): number {');
code = code.replace(/if \(compressionMode === 'lossless'\) {\n    baseWork \*= 1.2;\n  }/, '');
fs.writeFileSync('src/lib/hardwareCapabilities.ts', code);
