import fs from 'node:fs';
import path from 'node:path';

const jsonPath = path.resolve(process.cwd(), 'src/data/benchmarks/compression-2026.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('--- AUDITING BENCHMARK DATASET ---');
console.log('Total images:', data.imageBenchmarkItems.length);

let totalOrigBytes = 0;
let totalJpgBytes = 0;
let totalWebpBytes = 0;
let totalAvifBytes = 0;
let totalPngBytes = 0;

let photoCount = 0;
let graphicCount = 0;
let photoOrigBytes = 0;
let graphicOrigBytes = 0;

const pcts = { JPEG: [] as number[], WebP: [] as number[], AVIF: [] as number[], PNG: [] as number[] };
const times = { JPEG: [] as number[], WebP: [] as number[], AVIF: [] as number[], PNG: [] as number[] };

const photoPcts = { JPEG: [] as number[], WebP: [] as number[], AVIF: [] as number[], PNG: [] as number[] };
const graphicPcts = { JPEG: [] as number[], WebP: [] as number[], AVIF: [] as number[], PNG: [] as number[] };

for (const item of data.imageBenchmarkItems) {
  totalOrigBytes += item.originalSizeBytes;
  if (item.category === 'Photo') {
    photoCount++;
    photoOrigBytes += item.originalSizeBytes;
  } else {
    graphicCount++;
    graphicOrigBytes += item.originalSizeBytes;
  }

  if (item.conversions.length !== 4) {
    console.error(`Item ${item.filename} has ${item.conversions.length} conversions instead of 4!`);
  }

  for (const c of item.conversions) {
    if (c.error) {
      console.error(`Item ${item.filename} format ${c.targetFormat} has error: ${c.error}`);
    }
    const fmt = c.targetFormat as 'JPEG' | 'WebP' | 'AVIF' | 'PNG';
    pcts[fmt].push(c.reductionPct);
    times[fmt].push(c.timeMs);

    if (item.category === 'Photo') {
      photoPcts[fmt].push(c.reductionPct);
    } else {
      graphicPcts[fmt].push(c.reductionPct);
    }

    if (fmt === 'JPEG') totalJpgBytes += c.outputSizeBytes;
    if (fmt === 'WebP') totalWebpBytes += c.outputSizeBytes;
    if (fmt === 'AVIF') totalAvifBytes += c.outputSizeBytes;
    if (fmt === 'PNG') totalPngBytes += c.outputSizeBytes;
  }
}

console.log(`Photos: ${photoCount} (Bytes: ${photoOrigBytes})`);
console.log(`Graphics: ${graphicCount} (Bytes: ${graphicOrigBytes})`);
console.log(`Total Original Bytes: ${totalOrigBytes} (${(totalOrigBytes / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Total JPEG Bytes: ${totalJpgBytes} (${(totalJpgBytes / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Total WebP Bytes: ${totalWebpBytes} (${(totalWebpBytes / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Total AVIF Bytes: ${totalAvifBytes} (${(totalAvifBytes / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Total PNG Bytes: ${totalPngBytes} (${(totalPngBytes / 1024 / 1024).toFixed(2)} MB)`);

function mean(arr: number[]) {
  return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
}

function median(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)) : Number(sorted[mid].toFixed(2));
}

console.log('\n--- FORMAT RECALCULATED MEANS / MEDIANS ---');
for (const fmt of ['JPEG', 'WebP', 'AVIF', 'PNG'] as const) {
  console.log(`${fmt}: Mean Red% = ${mean(pcts[fmt])}%, Median Red% = ${median(pcts[fmt])}%, Mean Time = ${Math.round(mean(times[fmt]))}ms`);
}

console.log('\n--- CATEGORY PHOTO RECALCULATED MEANS ---');
for (const fmt of ['JPEG', 'WebP', 'AVIF', 'PNG'] as const) {
  console.log(`Photo ${fmt}: Mean Red% = ${mean(photoPcts[fmt])}%`);
}

console.log('\n--- CATEGORY GRAPHIC RECALCULATED MEANS ---');
for (const fmt of ['JPEG', 'WebP', 'AVIF', 'PNG'] as const) {
  console.log(`Graphic ${fmt}: Mean Red% = ${mean(graphicPcts[fmt])}%`);
}
