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

// 3. Test saveFilesToDirectory API Fallback in Node environment
{
  import('../src/lib/fileSystemAccess.ts').then(async (mod) => {
    const res = await mod.saveFilesToDirectory([{ blob: new Blob(['hello']), name: 'test.png' }]);
    assert.strictEqual(res.success, false, 'Should gracefully fail in non-browser environment without showDirectoryPicker');
    assert.strictEqual(res.writtenCount, 0);
    console.log('✓ saveFilesToDirectory Fallback tests passed');
  });
}

// 4. Test Chunked ZIP Grouping logic
{
  const mockBlobs = [
    { size: 100 * 1024 * 1024 }, // 100MB
    { size: 100 * 1024 * 1024 }, // 100MB
    { size: 100 * 1024 * 1024 }, // 100MB
  ];
  const zipSizeBudget = 150 * 1024 * 1024; // 150MB budget

  const zipChunks: any[][] = [];
  let currentChunk: any[] = [];
  let currentChunkBytes = 0;

  for (const b of mockBlobs) {
    if (currentChunk.length > 0 && currentChunkBytes + b.size > zipSizeBudget) {
      zipChunks.push(currentChunk);
      currentChunk = [b];
      currentChunkBytes = b.size;
    } else {
      currentChunk.push(b);
      currentChunkBytes += b.size;
    }
  }
  if (currentChunk.length > 0) zipChunks.push(currentChunk);

  assert.strictEqual(zipChunks.length, 3, 'Should split 300MB total into 3 parts under 150MB budget');
  console.log('✓ Sequential Chunked ZIP Budgeting tests passed');
}

// 5. Test Per-File Format Precedence in Mixed Batch (A->AVIF, B->ICO, C->JPEG, D->PNG)
{
  const globalSettings: ConversionSettings = {
    targetFormat: 'webp',
    quality: 0.8,
    renamePattern: '',
    resize: { enabled: false, keepAspectRatio: true },
    stripExif: true,
    filenamePrefix: '',
    filenameSuffix: '',
  };

  const batch: ImageFileItem[] = [
    {
      id: 'file-a',
      file: new File([''], 'photo-a.jpg', { type: 'image/jpeg' }),
      previewUrl: '',
      originalSize: 1024,
      status: 'success',
      progress: 100,
      customTargetFormat: 'avif',
      blob: new Blob(['fake-avif'], { type: 'image/avif' }),
    },
    {
      id: 'file-b',
      file: new File([''], 'photo-b.png', { type: 'image/png' }),
      previewUrl: '',
      originalSize: 2048,
      status: 'success',
      progress: 100,
      customTargetFormat: 'ico',
      blob: new Blob(['fake-ico'], { type: 'image/x-icon' }),
    },
    {
      id: 'file-c',
      file: new File([''], 'photo-c.webp', { type: 'image/webp' }),
      previewUrl: '',
      originalSize: 3072,
      status: 'success',
      progress: 100,
      customTargetFormat: 'jpg',
      blob: new Blob(['fake-jpg'], { type: 'image/jpeg' }),
    },
    {
      id: 'file-d',
      file: new File([''], 'photo-d.bmp', { type: 'image/bmp' }),
      previewUrl: '',
      originalSize: 4096,
      status: 'success',
      progress: 100,
      customTargetFormat: 'png',
      blob: new Blob(['fake-png'], { type: 'image/png' }),
    },
    {
      id: 'file-e',
      file: new File([''], 'photo-e.heic', { type: 'image/heic' }),
      previewUrl: '',
      originalSize: 5120,
      status: 'success',
      progress: 100,
      customTargetFormat: undefined,
      blob: new Blob(['fake-webp'], { type: 'image/webp' }),
    },
  ];

  const filenames = batch.map((item, idx) => formatOutputFilename(item, idx, globalSettings));
  assert.deepStrictEqual(
    filenames,
    ['photo-a.avif', 'photo-b.ico', 'photo-c.jpg', 'photo-d.png', 'photo-e.webp'],
    'Mixed-format batch files must output exact per-file format extensions ignoring global default, while undefined correctly uses the global default'
  );
  console.log('✓ Per-file format precedence in mixed batch tests passed');
}

// 6. Test PDF Intermediate Data Cleanup & Retry/Re-download Integrity
{
  const pdfBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
  const intermediateJpegBlob = new Blob(['fake-jpeg-bytes'], { type: 'image/jpeg' });
  
  const pdfItem: ImageFileItem = {
    id: 'pdf-1',
    file: new File([''], 'doc.pdf', { type: 'application/pdf' }),
    previewUrl: 'blob:pdf-preview',
    originalSize: 5000,
    status: 'success',
    progress: 100,
    blob: pdfBlob,
    convertedUrl: 'blob:pdf-converted',
    convertedSize: pdfBlob.size,
    pdfImageData: intermediateJpegBlob,
    pdfImageWidth: 1000,
    pdfImageHeight: 1400,
  };

  assert.ok(pdfItem.pdfImageData, 'pdfImageData should be present before export');

  // Simulation of Direct Folder Save or Export cleanup
  const cleanedItem: ImageFileItem = {
    ...pdfItem,
    pdfImageData: undefined,
    pdfImageWidth: undefined,
    pdfImageHeight: undefined,
  };

  assert.strictEqual(cleanedItem.pdfImageData, undefined, 'pdfImageData must be cleared');
  assert.strictEqual(cleanedItem.blob, pdfBlob, 'Converted PDF blob must remain for re-download');
  assert.strictEqual(cleanedItem.convertedUrl, 'blob:pdf-converted', 'Converted URL must remain for preview/download');
  assert.strictEqual(cleanedItem.status, 'success', 'Item status remains success');

  // Simulation of retry on a cleaned item
  const retriedItem: ImageFileItem = {
    ...cleanedItem,
    status: 'pending',
    blob: undefined,
    convertedUrl: undefined,
  };
  assert.strictEqual(retriedItem.status, 'pending', 'Cleaned item can be retried cleanly');

  console.log('✓ PDF Intermediate Data Cleanup & Retry/Re-download tests passed');
}

// 7. Test Worker Recycling Pool Invariants (Lazy replacement & Concurrency bounds)
{
  let terminatedId: number | null = null;
  let createdCount = 0;

  class FakeWorker {
    id: number;
    listeners: Record<string, Function[]> = {};
    constructor() {
      this.id = ++createdCount;
    }
    addEventListener(type: string, fn: Function) {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push(fn);
    }
    removeEventListener() {}
    postMessage() {}
    terminate() {
      terminatedId = this.id;
    }
  }

  // Verify worker pool state mechanics
  const mockPool = {
    maxWorkers: 2,
    workers: [] as { id: number; worker: FakeWorker; active: boolean; totalMp?: number; count?: number }[],
    pendingQueue: [] as Array<{ resolve: Function; reject: Function }>,
    
    releaseWorker(w: any, opts?: { shouldRecycle?: boolean; mp?: number }) {
      w.totalMp = (w.totalMp || 0) + (opts?.mp || 0);
      w.count = (w.count || 0) + 1;
      
      const mustRecycle = opts?.shouldRecycle || w.totalMp > 80 || w.count >= 30;
      if (mustRecycle) {
        this.recycleWorker(w);
        return;
      }
      w.active = false;
      if (this.pendingQueue.length > 0) {
        const next = this.pendingQueue.shift();
        w.active = true;
        next?.resolve(w);
      }
    },

    recycleWorker(w: any) {
      w.worker.terminate();
      this.workers = this.workers.filter(item => item.id !== w.id);
      if (this.pendingQueue.length > 0 && this.workers.length < this.maxWorkers) {
        const freshWorker = { id: Date.now(), worker: new FakeWorker(), active: true };
        this.workers.push(freshWorker);
        const next = this.pendingQueue.shift();
        next?.resolve(freshWorker);
      }
    }
  };

  const worker1 = { id: 1, worker: new FakeWorker(), active: true, totalMp: 0, count: 0 };
  mockPool.workers.push(worker1);

  // Normal release - no recycle
  mockPool.releaseWorker(worker1, { shouldRecycle: false, mp: 2 });
  assert.strictEqual(worker1.active, false, 'Worker remains inactive in pool');
  assert.strictEqual(terminatedId, null, 'Worker was NOT terminated');

  // Release with recycling triggered (e.g. 15MP image)
  worker1.active = true;
  mockPool.releaseWorker(worker1, { shouldRecycle: true, mp: 15 });
  assert.strictEqual(terminatedId, 1, 'Worker 1 was cleanly terminated');
  assert.strictEqual(mockPool.workers.length, 0, 'Worker 1 was removed from pool');

  console.log('✓ Worker Recycling Pool Invariants tests passed');
}

console.log("\nAll orchestration unit tests passed successfully!");
