import fs from 'fs';
import path from 'path';

async function generateSwManifest() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const assetsDir = path.join(distDir, 'assets');
  const swDistPath = path.join(distDir, 'sw.js');
  const swPublicPath = path.resolve(process.cwd(), 'public', 'sw.js');

  if (!fs.existsSync(assetsDir)) {
    console.error('dist/assets directory not found. Did you run vite build?');
    process.exit(1);
  }

  const targetPrefixes = [
    'conversionWorker-',
    'heic2any-',
    'heicWorker-',
    'imagequant-',
    'imagequant_bg-',
    'UPNG-',
    'encode-',
    'mozjpeg_enc-',
    'avif_enc-',
    'avif_enc_mt-',
    'avif_enc_mt.worker-',
    'webp_enc-',
    'webp_enc_simd-',
    'jspdf.es.min-'
  ];

  const files = fs.readdirSync(assetsDir);
  const matchedAssets: string[] = [];

  for (const file of files) {
    if (file.endsWith('.map')) continue;

    const isWasm = file.endsWith('.wasm');
    const isJs = file.endsWith('.js');

    if (!isWasm && !isJs) continue;

    if (isWasm || targetPrefixes.some((prefix) => file.startsWith(prefix))) {
      matchedAssets.push(`/assets/${file}`);
    }
  }

  matchedAssets.sort();

  console.log('Discovered SW assets in dist/assets:');
  matchedAssets.forEach((asset) => console.log(` - ${asset}`));

  const staticEntries = ['/', '/index.html', '/manifest.json'];
  const fullAssetsList = [...staticEntries, ...matchedAssets];

  let swContent = '';
  if (fs.existsSync(swDistPath)) {
    swContent = fs.readFileSync(swDistPath, 'utf8');
  } else if (fs.existsSync(swPublicPath)) {
    swContent = fs.readFileSync(swPublicPath, 'utf8');
  } else {
    console.error('Service worker template not found in dist/sw.js or public/sw.js');
    process.exit(1);
  }

  const assetEntriesString = fullAssetsList.map((asset) => `  '${asset}'`).join(',\n');
  const newAssetsArray = `const ASSETS = [\n${assetEntriesString}\n];`;

  const updatedSwContent = swContent.replace(/const ASSETS = \[\s*[\s\S]*?\s*\];/, newAssetsArray);

  fs.writeFileSync(swDistPath, updatedSwContent, 'utf8');

  console.log(`\nSuccessfully updated ${swDistPath} with ${fullAssetsList.length} assets:`);
  fullAssetsList.forEach((asset) => console.log(` + ${asset}`));
}

generateSwManifest().catch((err) => {
  console.error('Failed to generate service worker manifest:', err);
  process.exit(1);
});
