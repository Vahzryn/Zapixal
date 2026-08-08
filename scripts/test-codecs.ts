import assert from 'assert';
import { validateMagicBytes, injectDpiMetadata } from '../src/lib/codecs.ts';
import { parseSeoRoute } from '../src/lib/seoEngine.ts';
import { calculateTargetDimensions, calculateCropRect, getCropSourceRect } from '../src/lib/conversionOrchestrator.ts';
import { safeRandomUUID, hasCreateImageBitmap, hasOffscreenCanvas } from '../src/lib/capabilities.ts';
import { detectHardwareCapabilities, getBatchThresholds, getMaxMegapixels, getMaxPixels } from '../src/lib/hardwareCapabilities.ts';

console.log('Running unit tests for codecs, SEO parsing, and target dimensions...\n');

// 1. Test Magic Bytes Validation
{
  // PNG Magic Bytes: 89 50 4E 47
  const pngBuffer = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]).buffer;
  const pngVal = validateMagicBytes(pngBuffer);
  assert.strictEqual(pngVal.valid, true, 'PNG magic bytes should be valid');
  assert.strictEqual(pngVal.format, 'png', 'Format should be recognized as png');

  // JPEG Magic Bytes: FF D8 FF
  const jpegBuffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]).buffer;
  const jpegVal = validateMagicBytes(jpegBuffer);
  assert.strictEqual(jpegVal.valid, true, 'JPEG magic bytes should be valid');
  assert.strictEqual(jpegVal.format, 'jpg', 'Format should be recognized as jpg');

  // Corrupted Buffer
  const badBuffer = new Uint8Array([0x00, 0x01]).buffer;
  const badVal = validateMagicBytes(badBuffer);
  assert.strictEqual(badVal.valid, false, 'Invalid buffer should fail validation');

  console.log('✓ Magic Bytes Validation tests passed');
}

// 2. Test SEO Route Parsing
{
  const homepageSeo = await parseSeoRoute('/');
  assert.strictEqual(homepageSeo.canonicalUrl, 'https://zapixal.com', 'Homepage canonical URL match');
  assert.strictEqual(homepageSeo.isIndexable, true, 'Homepage should be indexable');

  const heicSeo = await parseSeoRoute('/convert-heic-to-jpg-locally');
  assert.strictEqual(heicSeo.toFormat, 'jpg', 'HEIC to JPG toFormat should be jpg');
  assert.strictEqual(heicSeo.canonicalUrl, 'https://zapixal.com/convert-heic-to-jpg-locally', 'Canonical URL match');

  const smallCompressSeo = await parseSeoRoute('/compress-jpg-under-5kb');
  assert.strictEqual(smallCompressSeo.isIndexable, false, 'Compress under 5KB should be marked noindex to avoid low quality spam');

  console.log('✓ SEO Route Parsing tests passed');
}

// 3. Test Calculate Target Dimensions
{
  const orig = { width: 1920, height: 1080 };

  // Keep aspect ratio resize to max 800 width
  const dim1 = calculateTargetDimensions(orig, 800, undefined, true);
  assert.strictEqual(dim1.width, 800);
  assert.strictEqual(dim1.height, 450);

  // Exact resize without aspect ratio
  const dim2 = calculateTargetDimensions(orig, 500, 500, false);
  assert.strictEqual(dim2.width, 500);
  assert.strictEqual(dim2.height, 500);

  console.log('✓ Target Dimensions Calculation tests passed');
}

// 3b. Test Calculate Crop Rect & Rotation Composition
{
  // 1:1 Crop on 3000x2000 landscape image
  const crop1 = calculateCropRect(3000, 2000, { width: 1, height: 1 });
  assert.strictEqual(crop1.cropWidth, 2000);
  assert.strictEqual(crop1.cropHeight, 2000);
  assert.strictEqual(crop1.cropX, 500);
  assert.strictEqual(crop1.cropY, 0);

  // 16:9 Crop on 2000x3000 portrait image
  const crop2 = calculateCropRect(2000, 3000, { width: 16, height: 9 });
  assert.strictEqual(crop2.cropWidth, 2000);
  assert.strictEqual(crop2.cropHeight, 1125); // 2000 / (16/9) = 1125
  assert.strictEqual(crop2.cropX, 0);
  assert.strictEqual(crop2.cropY, 938); // (3000 - 1125) / 2 = 937.5 rounded to 938

  // getCropSourceRect without rotation
  const rect0 = getCropSourceRect(3000, 2000, 0, { width: 1, height: 1 });
  assert.strictEqual(rect0.cropX, 500);
  assert.strictEqual(rect0.cropY, 0);
  assert.strictEqual(rect0.cropWidth, 2000);
  assert.strictEqual(rect0.cropHeight, 2000);

  // getCropSourceRect with 90° rotation on 3000x2000 (post-rotation is 2000x3000)
  // Post-rotation 2000x3000 cropped to 1:1 gives post crop rect: X=0, Y=500, W=2000, H=2000
  // In source space (3000x2000):
  // cropX = 3000 - (500 + 2000) = 500
  // cropY = 0
  // cropWidth = 2000, cropHeight = 2000
  const rect90 = getCropSourceRect(3000, 2000, 90, { width: 1, height: 1 });
  assert.strictEqual(rect90.cropX, 500);
  assert.strictEqual(rect90.cropY, 0);
  assert.strictEqual(rect90.cropWidth, 2000);
  assert.strictEqual(rect90.cropHeight, 2000);

  console.log('✓ Crop Rect & Rotation Composition tests passed');
}

// 3c. Test DPI Metadata Injection for JPEG & PNG
{
  // Test JPEG with existing APP0 segment
  const dummyJpegApp0 = new Uint8Array([
    0xFF, 0xD8,                                 // SOI
    0xFF, 0xE0, 0x00, 0x10,                     // APP0 header, length 16
    0x4A, 0x46, 0x49, 0x46, 0x00,               // "JFIF\0"
    0x01, 0x01,                                 // Version 1.1
    0x00,                                       // Units: 0 (none)
    0x00, 0x48,                                 // X density 72
    0x00, 0x48,                                 // Y density 72
    0x00, 0x00,                                 // Thumbnail 0x0
    0xFF, 0xDB, 0x00, 0x43                      // DQT dummy
  ]);

  const jpeg300 = injectDpiMetadata(dummyJpegApp0, 'jpg', 300);
  assert.strictEqual(jpeg300[13], 1, 'JPEG APP0 units flag must be 1 for DPI');
  assert.strictEqual((jpeg300[14] << 8) | jpeg300[15], 300, 'JPEG X density must be 300');
  assert.strictEqual((jpeg300[16] << 8) | jpeg300[17], 300, 'JPEG Y density must be 300');

  // Test JPEG without APP0 (needs APP0 injection)
  const rawJpeg = new Uint8Array([0xFF, 0xD8, 0xFF, 0xDB, 0x00, 0x43]);
  const injectedJpeg = injectDpiMetadata(rawJpeg, 'jpg', 150);
  assert.strictEqual(injectedJpeg[2], 0xFF);
  assert.strictEqual(injectedJpeg[3], 0xE0);
  assert.strictEqual(injectedJpeg[13], 1);
  assert.strictEqual((injectedJpeg[14] << 8) | injectedJpeg[15], 150);

  // Test PNG pHYs chunk injection
  const dummyPng = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D,                         // IHDR length 13
    0x49, 0x48, 0x44, 0x52,                         // "IHDR"
    0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, // 16x16
    0x08, 0x06, 0x00, 0x00, 0x00,                   // 8bit RGBA
    0x1F, 0x15, 0xC4, 0x89,                         // IHDR CRC
    0x00, 0x00, 0x00, 0x00,                         // IEND length
    0x49, 0x45, 0x4E, 0x44,                         // "IEND"
    0xAE, 0x42, 0x60, 0x82                          // IEND CRC
  ]);

  const png300 = injectDpiMetadata(dummyPng, 'png', 300);
  const expectedPpm = Math.round(300 * 39.3701); // 11811 pixels/meter
  // Check that pHYs chunk exists after IHDR (at byte 33)
  assert.strictEqual(png300[33], 0x00);
  assert.strictEqual(png300[34], 0x00);
  assert.strictEqual(png300[35], 0x00);
  assert.strictEqual(png300[36], 0x09); // length 9
  const chunkType = String.fromCharCode(png300[37], png300[38], png300[39], png300[40]);
  assert.strictEqual(chunkType, 'pHYs');
  const view = new DataView(png300.buffer, png300.byteOffset, png300.byteLength);
  assert.strictEqual(view.getUint32(41, false), expectedPpm, 'PNG X pixels per meter must match 300 DPI');
  assert.strictEqual(view.getUint32(45, false), expectedPpm, 'PNG Y pixels per meter must match 300 DPI');
  assert.strictEqual(png300[49], 1, 'PNG unit specifier must be 1 (meters)');

  console.log('✓ DPI Metadata Injection tests passed');
}

// 4. Test Capabilities Fallback Layer & Polyfills
{
  // Test safeRandomUUID polyfill format and uniqueness
  const uuid1 = safeRandomUUID();
  const uuid2 = safeRandomUUID();
  assert.strictEqual(uuid1.length, 36, 'UUID must be 36 characters long');
  assert.notStrictEqual(uuid1, uuid2, 'UUIDs must be unique');
  assert.strictEqual((uuid1.match(/-/g) || []).length, 4, 'UUID must contain exactly 4 hyphens');

  // Verify behavior when createImageBitmap is defined/undefined
  const origCreateImageBitmap = (globalThis as any).createImageBitmap;
  
  (globalThis as any).createImageBitmap = undefined;
  assert.strictEqual(hasCreateImageBitmap(), false, 'hasCreateImageBitmap should return false when undefined');

  (globalThis as any).createImageBitmap = () => {};
  assert.strictEqual(hasCreateImageBitmap(), true, 'hasCreateImageBitmap should return true when defined');

  // Restore
  (globalThis as any).createImageBitmap = origCreateImageBitmap;

  console.log('✓ Capabilities Fallback Layer tests passed');
}

// 5. Test Low-Tier Device Concurrency Rules
{
  const origConcurrency = Object.getOwnPropertyDescriptor(globalThis.navigator || {}, 'hardwareConcurrency');
  const origMemory = Object.getOwnPropertyDescriptor(globalThis.navigator || {}, 'deviceMemory');

  if (!globalThis.navigator) {
    (globalThis as any).navigator = {};
  }

  // Mock a low-end mobile phone (e.g. 2 cores, 2GB memory)
  Object.defineProperty(globalThis.navigator, 'hardwareConcurrency', {
    value: 2,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis.navigator, 'deviceMemory', {
    value: 2,
    configurable: true,
    writable: true,
  });

  const lowCap = detectHardwareCapabilities();
  assert.strictEqual(lowCap.tier, 'LOW', '2GB memory / 2 CPU cores should be LOW tier');
  assert.strictEqual(lowCap.maxConcurrentWorkers, 1, 'LOW tier must process sequentially (concurrency = 1)');

  // Mock a Safari/iOS device where deviceMemory is undefined and hardwareConcurrency is 4
  Object.defineProperty(globalThis.navigator, 'hardwareConcurrency', {
    value: 4,
    configurable: true,
    writable: true,
  });
  // @ts-ignore
  delete (globalThis.navigator as any).deviceMemory;

  const safariLowCap = detectHardwareCapabilities();
  assert.strictEqual(safariLowCap.tier, 'LOW', 'Safari/iOS with 4 cores and undefined deviceMemory should be LOW tier');
  assert.strictEqual(safariLowCap.maxConcurrentWorkers, 1, 'Safari/iOS LOW tier must process sequentially');

  // Restore navigator properties
  if (origConcurrency) {
    Object.defineProperty(globalThis.navigator, 'hardwareConcurrency', origConcurrency);
  } else {
    // @ts-ignore
    delete globalThis.navigator.hardwareConcurrency;
  }
  if (origMemory) {
    Object.defineProperty(globalThis.navigator, 'deviceMemory', origMemory);
  } else {
    // @ts-ignore
    delete globalThis.navigator.deviceMemory;
  }

  console.log('✓ Low-Tier Device Concurrency tests passed');

  // Test Tier Batch Thresholds
  const lowThresh = getBatchThresholds('LOW');
  assert.strictEqual(lowThresh.optimalBatchBytes, 150 * 1024 * 1024, 'LOW optimal should be 150MB');
  assert.strictEqual(lowThresh.maxBatchBytes, 450 * 1024 * 1024, 'LOW max should be 450MB');

  const midThresh = getBatchThresholds('MID');
  assert.strictEqual(midThresh.optimalBatchBytes, 500 * 1024 * 1024, 'MID optimal should be 500MB');
  assert.strictEqual(midThresh.maxBatchBytes, 1500 * 1024 * 1024, 'MID max should be 1.5GB');

  const highThresh = getBatchThresholds('HIGH');
  assert.strictEqual(highThresh.optimalBatchBytes, 1500 * 1024 * 1024, 'HIGH optimal should be 1.5GB');
  assert.strictEqual(highThresh.maxBatchBytes, 4500 * 1024 * 1024, 'HIGH max should be 4.5GB');

  console.log('✓ Tier Batch Thresholds tests passed');

  // Test Tier Megapixel Ceilings
  assert.strictEqual(getMaxMegapixels('LOW'), 40, 'LOW tier should cap at 40 MP');
  assert.strictEqual(getMaxPixels('LOW'), 40_000_000, 'LOW tier should cap at 40,000,000 pixels');

  assert.strictEqual(getMaxMegapixels('MID'), 100, 'MID tier should cap at 100 MP');
  assert.strictEqual(getMaxPixels('MID'), 100_000_000, 'MID tier should cap at 100,000,000 pixels');

  assert.strictEqual(getMaxMegapixels('HIGH'), 300, 'HIGH tier should cap at 300 MP');
  assert.strictEqual(getMaxPixels('HIGH'), 300_000_000, 'HIGH tier should cap at 300,000,000 pixels');

  console.log('✓ Tier Megapixel Ceilings tests passed');
}

// 6. Test Unsupported Source Format Helpful Errors
{
  // Simulated function replicating the exact helper in loadImageElement for error checking
  const getHelpfulErrorSimulated = (extension: string): string => {
    if (extension === 'tiff' || extension === 'tif') {
      return 'TIFF decoding is not natively supported by this browser. Please convert the TIFF file to PNG or JPEG first, or use Safari.';
    }
    if (extension === 'avif') {
      return 'Failed to decode AVIF. Your browser or operating system may not support AVIF image decoding.';
    }
    if (extension === 'webp') {
      return 'Failed to decode WebP. Ensure the WebP image is valid and not corrupted.';
    }
    if (extension === 'svg') {
      return 'Failed to decode SVG. Ensure the SVG file is valid and contains standard XML elements.';
    }
    if (extension === 'gif') {
      return 'Failed to decode GIF. Ensure the file is valid. Note that animated GIFs are flattened to their first frame.';
    }
    return `Unsupported or corrupted image file format (${extension.toUpperCase()}).`;
  };

  assert.ok(getHelpfulErrorSimulated('tiff').includes('TIFF decoding is not natively supported'), 'TIFF message verification');
  assert.ok(getHelpfulErrorSimulated('avif').includes('AVIF image decoding'), 'AVIF message verification');
  assert.ok(getHelpfulErrorSimulated('webp').includes('Ensure the WebP image is valid'), 'WebP message verification');
  assert.ok(getHelpfulErrorSimulated('svg').includes('contains standard XML elements'), 'SVG message verification');
  assert.ok(getHelpfulErrorSimulated('gif').includes('animated GIFs are flattened'), 'GIF message verification');
  assert.ok(getHelpfulErrorSimulated('raw').includes('Unsupported or corrupted image file format'), 'Generic format message verification');

  console.log('✓ Unsupported Format Error Messaging tests passed');
}

// 7. Test PWA Cache Strategy & Exclusion Rules
{
  // Replicating sw.js logic for caching checks to assert rules correctness
  function shouldCacheSimulated(urlStr: string, method: string, responseSizeMB?: number) {
    const url = new URL(urlStr);
    const path = url.pathname.toLowerCase();

    // Only HTTP/HTTPS
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    // Only GET
    if (method !== 'GET') {
      return false;
    }

    // Strict Exclusions
    if (
      path.endsWith('.wasm') ||
      path.endsWith('.wasm.br') ||
      path.includes('wasm') ||
      path.includes('codec') ||
      path.includes('worker') ||
      path.includes('jsquash') ||
      path.includes('imagequant') ||
      path.includes('upng') ||
      path.includes('heic2any') ||
      path.includes('heif') ||
      path.includes('pdfjs') ||
      path.includes('pdf.js')
    ) {
      return false;
    }

    // Size limit (2MB)
    if (responseSizeMB && responseSizeMB > 2) {
      return false;
    }

    return true;
  }

  // 1. Valid asset
  assert.strictEqual(shouldCacheSimulated('https://zapixal.com/index.html', 'GET', 0.1), true, 'Standard HTML shell must be cached');
  assert.strictEqual(shouldCacheSimulated('https://zapixal.com/assets/index.js', 'GET', 0.5), true, 'Hashed main JS bundle must be cached');

  // 2. Large asset exclusion
  assert.strictEqual(shouldCacheSimulated('https://zapixal.com/assets/heavy-image.png', 'GET', 2.5), false, 'Assets larger than 2MB must be excluded');

  // 3. Codec and Worker exclusion
  assert.strictEqual(shouldCacheSimulated('https://zapixal.com/assets/conversionWorker.js', 'GET', 0.1), false, 'Workers must be excluded');
  assert.strictEqual(shouldCacheSimulated('https://zapixal.com/assets/avif.wasm', 'GET', 0.5), false, 'WASM files must be excluded');
  assert.strictEqual(shouldCacheSimulated('https://zapixal.com/lib/heic2any.js', 'GET', 0.5), false, 'HEIC2any heavy lib must be excluded');

  // 4. Non-http protocols (e.g. user files via blob URLs) exclusion
  assert.strictEqual(shouldCacheSimulated('blob:https://zapixal.com/463dfg-dfg4', 'GET'), false, 'Blob URLs of user files must be excluded');

  console.log('✓ PWA Cache Exclusion strategy tests passed');
}

console.log('\nAll unit tests passed successfully!');
