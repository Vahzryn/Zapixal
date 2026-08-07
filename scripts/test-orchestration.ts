import assert from 'node:assert';
import { getExtensionFromMime, formatOutputFilename } from '../src/lib/utils';
import type { ImageFileItem, ConversionSettings } from '../src/types';

console.log('Running unit tests for conversion orchestration...\n');

// 1. Test formatOutputFilename and getExtensionFromMime
{
  assert.strictEqual(getExtensionFromMime('image/jpeg'), 'jpg');
  assert.strictEqual(getExtensionFromMime('image/png'), 'png');
  assert.strictEqual(getExtensionFromMime('image/webp'), 'webp');
  assert.strictEqual(getExtensionFromMime('image/avif'), 'avif');
  assert.strictEqual(getExtensionFromMime('image/bmp'), 'bmp');
  assert.strictEqual(getExtensionFromMime('image/x-icon'), 'ico');
  assert.strictEqual(getExtensionFromMime('application/pdf'), 'pdf');
  assert.strictEqual(getExtensionFromMime('unknown/type'), 'jpg', 'Fallback to jpg for unknown types');

  const mockFile = new File([''], 'test-image.JPEG', { type: 'image/jpeg' });
  const item: ImageFileItem = {
    id: '123',
    file: mockFile,
    previewUrl: '',
    originalSize: 0,
    status: 'success',
    progress: 100,
    blob: new Blob([''], { type: 'image/webp' })
  };
  const settings: ConversionSettings = {
    targetFormat: 'jpg',
    quality: 0.8,
    renamePattern: '',
    resize: { enabled: false, keepAspectRatio: true },
    stripExif: true,
    filenamePrefix: '',
    filenameSuffix: '',
  };

  const filename1 = formatOutputFilename(item, 0, settings);
  assert.strictEqual(filename1, 'test-image.webp', 'Should use extension from converted blob type');

  item.blob = undefined;
  item.originalFallback = true;
  const filename2 = formatOutputFilename(item, 0, settings);
  assert.strictEqual(filename2, 'test-image.jpg', 'Should fallback to original extension when originalFallback is true');

  settings.renamePattern = 'my_prefix_{index}_{name}';
  const filename3 = formatOutputFilename(item, 1, settings);
  assert.strictEqual(filename3, 'my_prefix_2_test-image.jpg', 'Should support rename patterns');

  console.log('✓ File naming and extensions tests passed');
}

// 2. Test ZIP Name Collision Handling Simulation
{
  const names = ['test.jpg', 'test.jpg', 'image.png', 'test.jpg'];
  const usedNames = new Set<string>();
  const finalNames: string[] = [];
  
  for (const name of names) {
    let fileName = name;
    if (usedNames.has(fileName)) {
      const dotIdx = fileName.lastIndexOf('.');
      const namePart = dotIdx >= 0 ? fileName.substring(0, dotIdx) : fileName;
      const extPart = dotIdx >= 0 ? fileName.substring(dotIdx) : '';
      let counter = 1;
      while (usedNames.has(`${namePart}_${counter}${extPart}`)) {
        counter++;
      }
      fileName = `${namePart}_${counter}${extPart}`;
    }
    usedNames.add(fileName);
    finalNames.push(fileName);
  }

  assert.deepStrictEqual(finalNames, ['test.jpg', 'test_1.jpg', 'image.png', 'test_2.jpg'], 'Zip naming collisions resolved correctly');
  console.log('✓ ZIP Name Collision Handling tests passed');
}

console.log('\nAll orchestration unit tests passed successfully!');
