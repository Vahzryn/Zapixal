import fs from 'node:fs';
import path from 'node:path';
import { parseSeoRoute } from '../src/lib/seo/meta';
import { PSEO_ROUTES_LIST, ALL_ARTICLE_SYSTEM_ROUTES } from '../src/lib/seo/routes';

async function testOgImages() {
  console.log('=== RUNNING OG IMAGE ↔ ROUTE CONSISTENCY & VALIDATION TEST ===');

  const staticRoutes = ['/', '/tools', '/about', '/privacy', '/terms'];
  const allRoutes = Array.from(
    new Set([
      ...staticRoutes,
      ...ALL_ARTICLE_SYSTEM_ROUTES,
      ...PSEO_ROUTES_LIST.map((r) => r.path),
    ])
  );

  const ogImagesDir = path.resolve(process.cwd(), 'public', 'og-images');
  if (!fs.existsSync(ogImagesDir)) {
    throw new Error(`Directory public/og-images does not exist at ${ogImagesDir}`);
  }

  let totalRoutesChecked = 0;
  let missingImages = 0;
  let invalidImages = 0;
  const requiredFilenames = new Set<string>();

  const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  for (const routePath of allRoutes) {
    totalRoutesChecked++;
    const seoData = await parseSeoRoute(routePath);
    
    // Check ogImage property in metadata
    const ogObj = seoData.ogImage;
    const ogUrl = typeof ogObj === 'string' ? ogObj : ogObj?.url;
    if (!ogUrl || !ogUrl.startsWith('https://zapixal.com/og-images/')) {
      console.error(`✗ Route '${routePath}' has invalid/missing ogImage metadata: '${ogUrl}'`);
      missingImages++;
      continue;
    }

    const filename = ogUrl.replace('https://zapixal.com/og-images/', '');
    requiredFilenames.add(filename);

    const filePath = path.join(ogImagesDir, filename);

    if (!fs.existsSync(filePath)) {
      console.error(`✗ Route '${routePath}' references missing OG image: public/og-images/${filename}`);
      missingImages++;
      continue;
    }

    const fileBuf = fs.readFileSync(filePath);

    // 1. Verify byte length > 100 bytes
    if (fileBuf.length < 100) {
      console.error(`✗ OG image public/og-images/${filename} is corrupted/too small (${fileBuf.length} bytes)`);
      invalidImages++;
      continue;
    }

    // 2. Verify PNG Magic Bytes (first 8 bytes)
    const header = fileBuf.subarray(0, 8);
    if (!header.equals(pngMagicBytes)) {
      console.error(`✗ OG image public/og-images/${filename} lacks valid PNG magic bytes header`);
      invalidImages++;
      continue;
    }

    // 3. Verify dimensions in IHDR chunk (Width: bytes 16-19, Height: bytes 20-23)
    const width = fileBuf.readUInt32BE(16);
    const height = fileBuf.readUInt32BE(20);

    if (width !== 1200 || height !== 630) {
      console.error(`✗ OG image public/og-images/${filename} has incorrect dimensions: ${width}x${height} (Expected 1200x630)`);
      invalidImages++;
      continue;
    }
  }

  // Check /tools specifically
  const toolsPath = path.join(ogImagesDir, 'tools.png');
  if (!fs.existsSync(toolsPath)) {
    console.error('✗ CRITICAL: public/og-images/tools.png is MISSING!');
    missingImages++;
  } else {
    console.log('✓ /tools OG image public/og-images/tools.png exists and is verified.');
  }

  // Check for orphan files in public/og-images/
  const actualFilesOnDisk = fs.readdirSync(ogImagesDir).filter(f => f.endsWith('.png'));
  let orphanCount = 0;
  for (const file of actualFilesOnDisk) {
    if (!requiredFilenames.has(file)) {
      console.warn(`! Unreferenced / extra image on disk: public/og-images/${file}`);
      orphanCount++;
    }
  }

  console.log('\n=== OG IMAGE TEST SUMMARY ===');
  console.log(`- Total Metadata Routes Checked: ${totalRoutesChecked}`);
  console.log(`- Total OG Images Required: ${requiredFilenames.size}`);
  console.log(`- Total OG Images Present & Validated: ${requiredFilenames.size - missingImages - invalidImages}`);
  console.log(`- Missing Images: ${missingImages}`);
  console.log(`- Invalid Images: ${invalidImages}`);
  console.log(`- Unreferenced Files: ${orphanCount}`);

  if (missingImages > 0 || invalidImages > 0) {
    console.error('\nOG Image Verification FAILED.');
    process.exit(1);
  } else {
    console.log('\n✓ OG Image Verification PASSED SUCCESSFULLY WITH 0 MISSING AND 0 INVALID IMAGES!');
  }
}

testOgImages().catch((err) => {
  console.error('OG Image Test Failed with exception:', err);
  process.exit(1);
});
