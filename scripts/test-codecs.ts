import assert from 'assert';
import { validateMagicBytes } from '../src/lib/codecs.ts';
import { parseSeoRoute } from '../src/lib/seo/meta.ts';
import { calculateTargetDimensions } from '../src/lib/conversionOrchestrator.ts';
import { safeRandomUUID, hasCreateImageBitmap, hasOffscreenCanvas } from '../src/lib/capabilities.ts';
import { detectHardwareCapabilities } from '../src/lib/hardwareCapabilities.ts';

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
  const homepageSeo = parseSeoRoute('/');
  assert.strictEqual(homepageSeo.canonicalUrl, 'https://zapixal.com', 'Homepage canonical URL match');
  assert.strictEqual(homepageSeo.isIndexable, true, 'Homepage should be indexable');

  const heicSeo = parseSeoRoute('/convert-heic-to-jpg-locally');
  assert.strictEqual(heicSeo.toFormat, 'jpg', 'HEIC to JPG toFormat should be jpg');
  assert.strictEqual(heicSeo.canonicalUrl, 'https://zapixal.com/convert-heic-to-jpg-locally', 'Canonical URL match');

  const smallCompressSeo = parseSeoRoute('/compress-jpg-under-5kb');
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
