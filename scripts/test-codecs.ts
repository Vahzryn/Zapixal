import assert from 'assert';
import { validateMagicBytes } from '../src/lib/codecs.ts';
import { parseSeoRoute } from '../src/lib/seo/meta.ts';
import { calculateTargetDimensions } from '../src/lib/conversionOrchestrator.ts';

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

  const heicSeo = parseSeoRoute('/heic-to-jpg');
  assert.strictEqual(heicSeo.toFormat, 'jpg', 'HEIC to JPG toFormat should be jpg');
  assert.strictEqual(heicSeo.canonicalUrl, 'https://zapixal.com/heic-to-jpg', 'Canonical URL match');

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

console.log('\nAll unit tests passed successfully!');
