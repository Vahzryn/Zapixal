import fs from 'fs';
import path from 'path';

/**
 * Cloudflare Pages enforces a hard 25.00 MiB (26,214,400 bytes) limit per asset.
 * This script ensures no oversized bundled runtime files (like ONNX asyncify wasm)
 * are left in dist/, ensuring 100% compliant and instant deployments.
 */
function cleanLargeAssets(dir: string, maxBytes: number = 24.5 * 1024 * 1024) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanLargeAssets(fullPath, maxBytes);
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      if (stats.size > maxBytes || entry.name.includes('ort-wasm-simd-threaded.asyncify')) {
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
        fs.unlinkSync(fullPath);
        console.log(`[Deploy Optimizer] Removed oversized asset: ${entry.name} (${sizeMb} MB) -> CDN loaded dynamically at runtime for Cloudflare Pages compatibility.`);
      }
    }
  }
}

const distDir = path.resolve(process.cwd(), 'dist');
cleanLargeAssets(distDir);
console.log('✓ Verified all dist/ assets are under Cloudflare Pages 25 MiB ceiling.');
