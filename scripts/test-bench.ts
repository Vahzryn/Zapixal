import fs from 'node:fs';
import path from 'node:path';
import { validateBenchmarkData } from '../src/data/benchmarks/validation';

const jsonPath = path.resolve(process.cwd(), 'src/data/benchmarks/compression-2026.json');
if (!fs.existsSync(jsonPath)) {
  console.error('compression-2026.json not found!');
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
validateBenchmarkData(rawData);
console.log('✓ compression-2026.json validated successfully against benchmark schema!');
