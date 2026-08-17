import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const origFetch = global.fetch;
global.fetch = async (url, opts) => {
  if (url.toString().startsWith('file://') && url.toString().endsWith('.wasm')) {
    const filePath = fileURLToPath(url.toString());
    const buffer = fs.readFileSync(filePath);
    return new Response(buffer, { headers: { 'Content-Type': 'application/wasm' } });
  }
  return origFetch(url, opts);
};

import { decode as decodeJpeg, encode as encodeJpeg } from '@jsquash/jpeg';
import { encode as encodeWebp } from '@jsquash/webp';
import { encode as encodeAvif } from '@jsquash/avif';
import UPNG from 'upng-js';

export interface ImageConversionResult {
  targetFormat: string;
  codec: string;
  settings: string;
  outputSizeBytes: number;
  byteReduction: number;
  reductionPct: number;
  timeMs: number;
  error?: string;
}

export interface ImageBenchmarkItem {
  filename: string;
  category: 'Photo' | 'Graphic/Screenshot';
  originalFormat: 'JPG' | 'PNG';
  originalSizeBytes: number;
  width: number;
  height: number;
  conversions: ImageConversionResult[];
}

export interface FormatSummary {
  format: string;
  codec: string;
  version: string;
  settings: string;
  totalOutputSizeBytes: number;
  avgReductionPct: number;
  medianReductionPct: number;
  avgTimeMs: number;
}

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

async function run() {
  const benchmarkDir = path.resolve(process.cwd(), 'benchmark_images');
  if (!fs.existsSync(benchmarkDir)) {
    throw new Error('benchmark_images directory does not exist on disk!');
  }

  const fileNames = fs.readdirSync(benchmarkDir).filter(f => !f.startsWith('.'));
  console.log(`Found ${fileNames.length} images in ${benchmarkDir}`);

  if (fileNames.length === 0) {
    throw new Error('No files found in benchmark_images directory!');
  }

  const imageBenchmarkItems: ImageBenchmarkItem[] = [];
  let totalOriginalBytes = 0;
  let totalPixels = 0;

  for (const fileName of fileNames) {
    const filePath = path.join(benchmarkDir, fileName);
    const fileStat = fs.statSync(filePath);
    const originalSizeBytes = fileStat.size;
    totalOriginalBytes += originalSizeBytes;

    const fileBuffer = fs.readFileSync(filePath);
    const isJpg = fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg');
    const isPng = fileName.toLowerCase().endsWith('.png');
    const originalFormat: 'JPG' | 'PNG' = isJpg ? 'JPG' : 'PNG';
    const category: 'Photo' | 'Graphic/Screenshot' = isJpg ? 'Photo' : 'Graphic/Screenshot';

    console.log(`\n[Processing ${imageBenchmarkItems.length + 1}/${fileNames.length}] ${fileName} (${(originalSizeBytes / 1024).toFixed(1)} KB)...`);

    let imageData: ImageData;
    let width = 0;
    let height = 0;

    try {
      if (isJpg) {
        const decoded = await decodeJpeg(fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength));
        width = decoded.width;
        height = decoded.height;
        imageData = {
          data: decoded.data,
          width: decoded.width,
          height: decoded.height,
          colorSpace: 'srgb',
        };
      } else if (isPng) {
        const upngImg = UPNG.decode(fileBuffer);
        width = upngImg.width;
        height = upngImg.height;
        const rgbaBuffers = UPNG.toRGBA8(upngImg);
        const rgbaArray = new Uint8ClampedArray(rgbaBuffers[0]);
        imageData = {
          data: rgbaArray,
          width: upngImg.width,
          height: upngImg.height,
          colorSpace: 'srgb',
        };
      } else {
        throw new Error(`Unsupported original image format for file ${fileName}`);
      }
    } catch (err: any) {
      console.error(`  Failed to decode ${fileName}:`, err);
      continue;
    }

    totalPixels += width * height;
    console.log(`  Decoded dimensions: ${width} x ${height} px`);

    const conversions: ImageConversionResult[] = [];

    // 1. JPEG (MozJPEG Quality 80)
    try {
      const startMs = performance.now();
      const jpgBuf = await encodeJpeg(imageData, { quality: 80 });
      const timeMs = Math.round(performance.now() - startMs);
      const outputSizeBytes = jpgBuf.byteLength;
      const byteReduction = originalSizeBytes - outputSizeBytes;
      const reductionPct = Number(((byteReduction / originalSizeBytes) * 100).toFixed(2));

      conversions.push({
        targetFormat: 'JPEG',
        codec: 'MozJPEG (@jsquash/jpeg)',
        settings: 'Quality 80',
        outputSizeBytes,
        byteReduction,
        reductionPct,
        timeMs,
      });
      console.log(`  -> JPEG (MozJPEG Q80): ${(outputSizeBytes / 1024).toFixed(1)} KB (${reductionPct >= 0 ? '-' : '+'}${Math.abs(reductionPct)}%) in ${timeMs}ms`);
    } catch (err: any) {
      console.error(`  Failed MozJPEG conversion for ${fileName}:`, err);
      conversions.push({
        targetFormat: 'JPEG',
        codec: 'MozJPEG (@jsquash/jpeg)',
        settings: 'Quality 80',
        outputSizeBytes: 0,
        byteReduction: 0,
        reductionPct: 0,
        timeMs: 0,
        error: err?.message || 'MozJPEG encoding error',
      });
    }

    // 2. WebP (libwebp Quality 80, Method 4)
    try {
      const startMs = performance.now();
      const webpBuf = await encodeWebp(imageData, { quality: 80, method: 4 });
      const timeMs = Math.round(performance.now() - startMs);
      const outputSizeBytes = webpBuf.byteLength;
      const byteReduction = originalSizeBytes - outputSizeBytes;
      const reductionPct = Number(((byteReduction / originalSizeBytes) * 100).toFixed(2));

      conversions.push({
        targetFormat: 'WebP',
        codec: 'libwebp (@jsquash/webp)',
        settings: 'Quality 80, Method 4',
        outputSizeBytes,
        byteReduction,
        reductionPct,
        timeMs,
      });
      console.log(`  -> WebP (libwebp Q80): ${(outputSizeBytes / 1024).toFixed(1)} KB (${reductionPct >= 0 ? '-' : '+'}${Math.abs(reductionPct)}%) in ${timeMs}ms`);
    } catch (err: any) {
      console.error(`  Failed libwebp conversion for ${fileName}:`, err);
      conversions.push({
        targetFormat: 'WebP',
        codec: 'libwebp (@jsquash/webp)',
        settings: 'Quality 80, Method 4',
        outputSizeBytes: 0,
        byteReduction: 0,
        reductionPct: 0,
        timeMs: 0,
        error: err?.message || 'WebP encoding error',
      });
    }

    // 3. AVIF (libavif Quality 80)
    try {
      const startMs = performance.now();
      const avifBuf = await encodeAvif(imageData, { quality: 80 });
      const timeMs = Math.round(performance.now() - startMs);
      const outputSizeBytes = avifBuf.byteLength;
      const byteReduction = originalSizeBytes - outputSizeBytes;
      const reductionPct = Number(((byteReduction / originalSizeBytes) * 100).toFixed(2));

      conversions.push({
        targetFormat: 'AVIF',
        codec: 'libavif (@jsquash/avif)',
        settings: 'Quality 80',
        outputSizeBytes,
        byteReduction,
        reductionPct,
        timeMs,
      });
      console.log(`  -> AVIF (libavif Q80): ${(outputSizeBytes / 1024).toFixed(1)} KB (${reductionPct >= 0 ? '-' : '+'}${Math.abs(reductionPct)}%) in ${timeMs}ms`);
    } catch (err: any) {
      console.error(`  Failed libavif conversion for ${fileName}:`, err);
      conversions.push({
        targetFormat: 'AVIF',
        codec: 'libavif (@jsquash/avif)',
        settings: 'Quality 80',
        outputSizeBytes: 0,
        byteReduction: 0,
        reductionPct: 0,
        timeMs: 0,
        error: err?.message || 'AVIF encoding error',
      });
    }

    // 4. PNG (UPNG 256 colors / Lossless fallback)
    try {
      const startMs = performance.now();
      const pngArrayBuf = UPNG.encode([imageData.data.buffer], width, height, 256);
      const timeMs = Math.round(performance.now() - startMs);
      const outputSizeBytes = pngArrayBuf.byteLength;
      const byteReduction = originalSizeBytes - outputSizeBytes;
      const reductionPct = Number(((byteReduction / originalSizeBytes) * 100).toFixed(2));

      conversions.push({
        targetFormat: 'PNG',
        codec: 'UPNG (upng-js)',
        settings: '256 Colors',
        outputSizeBytes,
        byteReduction,
        reductionPct,
        timeMs,
      });
      console.log(`  -> PNG (UPNG 256 c): ${(outputSizeBytes / 1024).toFixed(1)} KB (${reductionPct >= 0 ? '-' : '+'}${Math.abs(reductionPct)}%) in ${timeMs}ms`);
    } catch (err: any) {
      console.error(`  Failed UPNG conversion for ${fileName}:`, err);
      conversions.push({
        targetFormat: 'PNG',
        codec: 'UPNG (upng-js)',
        settings: '256 Colors',
        outputSizeBytes: 0,
        byteReduction: 0,
        reductionPct: 0,
        timeMs: 0,
        error: err?.message || 'PNG encoding error',
      });
    }

    imageBenchmarkItems.push({
      filename: fileName,
      category,
      originalFormat,
      originalSizeBytes,
      width,
      height,
      conversions,
    });
  }

  // Calculate format summaries across all images
  const targetFormats = [
    { format: 'JPEG', codec: 'MozJPEG (@jsquash/jpeg)', version: '1.6.0', settings: 'Quality 80' },
    { format: 'WebP', codec: 'libwebp (@jsquash/webp)', version: '1.5.0', settings: 'Quality 80, Method 4' },
    { format: 'AVIF', codec: 'libavif (@jsquash/avif)', version: '2.1.1', settings: 'Quality 80' },
    { format: 'PNG', codec: 'UPNG (upng-js)', version: '2.1.0', settings: '256 Colors' },
  ];

  const formatSummaries: FormatSummary[] = [];
  const resultsForValidation: { format: string; quality: number | string; sizeBytes: number; timeMs: number; reductionPct: string }[] = [];

  for (const tf of targetFormats) {
    const formatConversions = imageBenchmarkItems.flatMap(img =>
      img.conversions.filter(c => c.targetFormat === tf.format && !c.error && c.outputSizeBytes > 0)
    );

    const totalOutputSizeBytes = formatConversions.reduce((sum, c) => sum + c.outputSizeBytes, 0);
    const pcts = formatConversions.map(c => c.reductionPct);
    const times = formatConversions.map(c => c.timeMs);

    const avgReductionPct = Number((pcts.reduce((a, b) => a + b, 0) / (pcts.length || 1)).toFixed(2));
    const medianReductionPct = Number(calculateMedian(pcts).toFixed(2));
    const avgTimeMs = Math.round(times.reduce((a, b) => a + b, 0) / (times.length || 1));

    formatSummaries.push({
      format: tf.format,
      codec: tf.codec,
      version: tf.version,
      settings: tf.settings,
      totalOutputSizeBytes,
      avgReductionPct,
      medianReductionPct,
      avgTimeMs,
    });

    resultsForValidation.push({
      format: `${tf.format} (${tf.codec.split(' ')[0]})`,
      quality: tf.settings,
      sizeBytes: Math.round(totalOutputSizeBytes / imageBenchmarkItems.length),
      timeMs: avgTimeMs,
      reductionPct: avgReductionPct.toString(),
    });
  }

  // Calculate photo vs graphic category averages
  const photoItems = imageBenchmarkItems.filter(i => i.category === 'Photo');
  const graphicItems = imageBenchmarkItems.filter(i => i.category === 'Graphic/Screenshot');

  const photoTotalBytes = photoItems.reduce((acc, i) => acc + i.originalSizeBytes, 0);
  const graphicTotalBytes = graphicItems.reduce((acc, i) => acc + i.originalSizeBytes, 0);

  const benchmarkData = {
    testDate: new Date().toISOString(),
    environment: 'Node.js v22 with Zapixal WASM engine (@jsquash/jpeg, @jsquash/webp, @jsquash/avif, upng-js)',
    researchQuestion: 'How do JPEG, WebP, and AVIF compression compare across a diverse real-world image dataset?',
    dataset: {
      type: 'Real-world photography & high-density desktop screenshots/graphics',
      totalImagesProcessed: imageBenchmarkItems.length,
      photosCount: photoItems.length,
      graphicsCount: graphicItems.length,
      width: Math.round(imageBenchmarkItems.reduce((acc, i) => acc + i.width, 0) / imageBenchmarkItems.length),
      height: Math.round(imageBenchmarkItems.reduce((acc, i) => acc + i.height, 0) / imageBenchmarkItems.length),
      uncompressedBytes: totalOriginalBytes,
      baselinePngBytes: totalOriginalBytes,
      pngTimeMs: Math.round(formatSummaries.find(s => s.format === 'PNG')?.avgTimeMs || 0),
    },
    formatSummaries,
    results: resultsForValidation,
    categoryBreakdown: {
      photos: {
        count: photoItems.length,
        originalBytes: photoTotalBytes,
        avgReductionPctByFormat: {
          JPEG: Number((photoItems.flatMap(i => i.conversions.filter(c => c.targetFormat === 'JPEG')).reduce((acc, c) => acc + c.reductionPct, 0) / photoItems.length).toFixed(2)),
          WebP: Number((photoItems.flatMap(i => i.conversions.filter(c => c.targetFormat === 'WebP')).reduce((acc, c) => acc + c.reductionPct, 0) / photoItems.length).toFixed(2)),
          AVIF: Number((photoItems.flatMap(i => i.conversions.filter(c => c.targetFormat === 'AVIF')).reduce((acc, c) => acc + c.reductionPct, 0) / photoItems.length).toFixed(2)),
          PNG: Number((photoItems.flatMap(i => i.conversions.filter(c => c.targetFormat === 'PNG')).reduce((acc, c) => acc + c.reductionPct, 0) / photoItems.length).toFixed(2)),
        }
      },
      graphics: {
        count: graphicItems.length,
        originalBytes: graphicTotalBytes,
        avgReductionPctByFormat: {
          JPEG: Number((graphicItems.flatMap(i => i.conversions.filter(c => c.targetFormat === 'JPEG')).reduce((acc, c) => acc + c.reductionPct, 0) / graphicItems.length).toFixed(2)),
          WebP: Number((graphicItems.flatMap(i => i.conversions.filter(c => c.targetFormat === 'WebP')).reduce((acc, c) => acc + c.reductionPct, 0) / graphicItems.length).toFixed(2)),
          AVIF: Number((graphicItems.flatMap(i => i.conversions.filter(c => c.targetFormat === 'AVIF')).reduce((acc, c) => acc + c.reductionPct, 0) / graphicItems.length).toFixed(2)),
          PNG: Number((graphicItems.flatMap(i => i.conversions.filter(c => c.targetFormat === 'PNG')).reduce((acc, c) => acc + c.reductionPct, 0) / graphicItems.length).toFixed(2)),
        }
      }
    },
    imageBenchmarkItems,
  };

  const outputDir = path.resolve(process.cwd(), 'src/data/benchmarks');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'compression-2026.json');
  fs.writeFileSync(outputPath, JSON.stringify(benchmarkData, null, 2));

  console.log(`\n==================================================`);
  console.log(`BENCHMARK COMPLETED SUCCESSFULLY!`);
  console.log(`Total Images Processed: ${imageBenchmarkItems.length}`);
  console.log(`Total Source Bytes: ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved authoritative dataset to ${outputPath}`);
  console.log(`==================================================\n`);
}

run().catch((err) => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
