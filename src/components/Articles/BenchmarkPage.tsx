import React, { useState } from 'react';
import { Zap, BarChart2, ShieldCheck, ArrowRight, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import rawBenchmarkData from '../../data/benchmarks/compression-2026.json';
import { validateBenchmarkData } from '../../data/benchmarks/validation';

export default function BenchmarkPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const benchmarkData = rawBenchmarkData as any;
  validateBenchmarkData(benchmarkData);

  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'graphics'>('all');

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const filteredImages = (benchmarkData.imageBenchmarkItems || []).filter((item: any) => {
    if (activeTab === 'photos') return item.category === 'Photo';
    if (activeTab === 'graphics') return item.category === 'Graphic/Screenshot';
    return true;
  });

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-500 min-h-screen">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">
          <BarChart2 className="w-4 h-4" />
          Zapixal Research & Codec Benchmarks (2026)
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-6 leading-tight">
          Client-Side Image Codec Compression Benchmark
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          An empirical, reproducible analysis evaluating WebAssembly-compiled in-browser image encoders (MozJPEG, libwebp, libavif, and UPNG) across a real-world dataset of photographs and high-density UI graphics.
        </p>
      </header>

      {/* Research Question Banner */}
      <section className="mb-12 bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="text-xs font-mono uppercase text-blue-400 tracking-wider mb-2">Core Research Question</div>
        <blockquote className="text-xl sm:text-2xl font-bold leading-snug">
          "{benchmarkData.researchQuestion || 'How do JPEG, WebP, and AVIF compression compare across a diverse real-world image dataset?'}"
        </blockquote>
        <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
          <div><strong className="text-neutral-200">Date:</strong> {formatDate(benchmarkData.testDate)}</div>
          <div><strong className="text-neutral-200">Sample Size:</strong> {benchmarkData.dataset.totalImagesProcessed || 20} Images</div>
          <div><strong className="text-neutral-200">Total Raw Volume:</strong> {formatBytes(benchmarkData.dataset.uncompressedBytes)}</div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          Executive Summary & Key Findings
        </h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/60">
          <ul className="space-y-4 text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>AVIF Achieves Highest Average Per-Image Size Reduction (78.48% Mean Reduction):</strong> Across the 20 real-world image sample set, AVIF (libavif Quality 80) achieved the highest average percentage size reduction per image (78.48% mean reduction, 79.78% median reduction).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>WebP Yields Smallest Total Dataset Volume (1.07 MB Total) with Fast Latency (108ms Avg):</strong> WebP (libwebp Quality 80, Method 4) generated the smallest total aggregate file volume across the 20 images (shrinking raw dataset volume from 6.55 MB down to 1.07 MB total vs AVIF's 1.15 MB total) while encoding over 11x faster than AVIF (108ms vs 1247ms per image).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Category Divergence (Photos vs UI Screenshots):</strong> Photos achieved high compression across all modern lossy codecs (WebP 83.83% mean reduction, AVIF 80.42% mean reduction, MozJPEG 78.61% mean reduction). On flat UI screenshots and vector graphics, AVIF significantly outperformed MozJPEG (74.87% vs 33.41% reduction) by suppressing color ringing along crisp interface boundaries.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Controlled Test Environment:</strong> These benchmark measurements were compiled under a controlled environment (Node.js v22). When you use Zapixal normally, all image conversion and compression occur locally on your individual device in browser memory.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Dataset & Methodology */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          Dataset & Test Methodology
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
            <p className="leading-relaxed">
              The benchmark dataset comprises 20 real-world image files spanning two distinct visual categories:
            </p>
            <ul className="space-y-2 text-xs font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span><strong>13 High-Resolution Photographs:</strong> Natural scenes, portraits, textures, and variable lighting conditions.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span><strong>7 High-Density Screenshots & UI Graphics:</strong> Desktop screenshots, vector art, typography, and sharp UI elements.</span>
              </li>
            </ul>
            <div className="pt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <div><strong>Runtime Engine:</strong> {benchmarkData.environment}</div>
              <div><strong>Total Input Size:</strong> {formatBytes(benchmarkData.dataset.uncompressedBytes)} (6,872,527 bytes)</div>
              <div><strong>Average Image Resolution:</strong> {benchmarkData.dataset.width} × {benchmarkData.dataset.height} px</div>
            </div>
          </div>

          {/* Controlled Encoder Settings Box */}
          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-500" />
              Controlled Codec Settings
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-white">MozJPEG (@jsquash/jpeg v1.6.0)</div>
                <div className="text-neutral-500 mt-0.5">Parameters: <code>{`{ quality: 80 }`}</code></div>
              </div>
              <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-white">libwebp (@jsquash/webp v1.5.0)</div>
                <div className="text-neutral-500 mt-0.5">Parameters: <code>{`{ quality: 80, method: 4 }`}</code></div>
              </div>
              <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-white">libavif (@jsquash/avif v2.1.1)</div>
                <div className="text-neutral-500 mt-0.5">Parameters: <code>{`{ quality: 80 }`}</code></div>
              </div>
              <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-white">UPNG (upng-js v2.1.0)</div>
                <div className="text-neutral-500 mt-0.5">Parameters: <code>cnum = 256</code> (256-color palette quantization)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Timing & Scope Callout */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 p-5 rounded-2xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="block font-bold mb-1 text-amber-950 dark:text-amber-100">Measurement Scope & Timing Parameters:</strong>
          Encoding latency measures the execution time of the WebAssembly encoder calls (<code>encodeJpeg</code>, <code>encodeWebp</code>, <code>encodeAvif</code>, <code>UPNG.encode</code>) in milliseconds. It includes WebAssembly module initialization, image compression processing, and output buffer generation. It excludes disk I/O, canvas rendering, and network transfers.
        </div>
      </section>

      {/* Aggregate Results Summary Table */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          Format Comparison Aggregate Results
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white">
                <th className="p-4 font-bold border-b border-neutral-200 dark:border-neutral-800">Target Format</th>
                <th className="p-4 font-bold border-b border-neutral-200 dark:border-neutral-800">Codec Engine</th>
                <th className="p-4 font-bold border-b border-neutral-200 dark:border-neutral-800">Settings</th>
                <th className="p-4 font-bold border-b border-neutral-200 dark:border-neutral-800">Total Output Size</th>
                <th className="p-4 font-bold border-b border-neutral-200 dark:border-neutral-800">Avg Reduction</th>
                <th className="p-4 font-bold border-b border-neutral-200 dark:border-neutral-800">Median Reduction</th>
                <th className="p-4 font-bold border-b border-neutral-200 dark:border-neutral-800">Avg WASM Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {(benchmarkData.formatSummaries || []).map((summary: any, idx: number) => {
                const isAvif = summary.format === 'AVIF';
                const isWebp = summary.format === 'WebP';
                return (
                  <tr key={idx} className={isAvif ? 'bg-green-50/60 dark:bg-green-900/10' : 'bg-white dark:bg-neutral-900'}>
                    <td className="p-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      {summary.format}
                      {isAvif && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-full">
                          Highest Mean Reduction (78.48%)
                        </span>
                      )}
                      {isWebp && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 rounded-full">
                          Smallest Aggregate Volume (1.07 MB)
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-neutral-700 dark:text-neutral-300">{summary.codec}</td>
                    <td className="p-4 text-neutral-500">{summary.settings}</td>
                    <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white">{formatBytes(summary.totalOutputSizeBytes)}</td>
                    <td className="p-4 font-bold text-green-600 dark:text-green-400">{summary.avgReductionPct}% reduction</td>
                    <td className="p-4 font-mono text-neutral-700 dark:text-neutral-300">{summary.medianReductionPct}% reduction</td>
                    <td className="p-4 font-mono text-neutral-900 dark:text-white">{summary.avgTimeMs} ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Category Breakdown (Photos vs UI Graphics) */}
      {benchmarkData.categoryBreakdown && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            Performance Breakdown by Image Type
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Photographs (13 Images)</h3>
              <p className="text-xs text-neutral-500 mb-4">Continuous tone, natural gradients, complex detail</p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">WebP (libwebp)</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">{benchmarkData.categoryBreakdown.photos.avgReductionPctByFormat.WebP}% reduction</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">AVIF (libavif)</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">{benchmarkData.categoryBreakdown.photos.avgReductionPctByFormat.AVIF}% reduction</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">JPEG (MozJPEG)</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">{benchmarkData.categoryBreakdown.photos.avgReductionPctByFormat.JPEG}% reduction</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">PNG (UPNG 256c)</span>
                  <span className="font-mono font-bold text-neutral-500">{benchmarkData.categoryBreakdown.photos.avgReductionPctByFormat.PNG}% reduction</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Screenshots & UI Graphics (7 Images)</h3>
              <p className="text-xs text-neutral-500 mb-4">Flat color areas, sharp typography, high-contrast UI edges</p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">AVIF (libavif)</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">{benchmarkData.categoryBreakdown.graphics.avgReductionPctByFormat.AVIF}% reduction</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">WebP (libwebp)</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">{benchmarkData.categoryBreakdown.graphics.avgReductionPctByFormat.WebP}% reduction</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">PNG (UPNG 256c)</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">{benchmarkData.categoryBreakdown.graphics.avgReductionPctByFormat.PNG}% reduction</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">JPEG (MozJPEG)</span>
                  <span className="font-mono font-bold text-neutral-500">{benchmarkData.categoryBreakdown.graphics.avgReductionPctByFormat.JPEG}% reduction</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Detailed Per-Image Measurements Table */}
      <section className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Detailed Per-Image Measurements ({filteredImages.length} Files)
          </h2>
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'all' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              All (20)
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'photos' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              Photos (13)
            </button>
            <button
              onClick={() => setActiveTab('graphics')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'graphics' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              Graphics (7)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white">
                <th className="p-3.5 font-bold border-b border-neutral-200 dark:border-neutral-800 min-w-[200px]">Filename</th>
                <th className="p-3.5 font-bold border-b border-neutral-200 dark:border-neutral-800">Dimensions</th>
                <th className="p-3.5 font-bold border-b border-neutral-200 dark:border-neutral-800">Original Size</th>
                <th className="p-3.5 font-bold border-b border-neutral-200 dark:border-neutral-800">MozJPEG Q80</th>
                <th className="p-3.5 font-bold border-b border-neutral-200 dark:border-neutral-800">libwebp Q80</th>
                <th className="p-3.5 font-bold border-b border-neutral-200 dark:border-neutral-800">libavif CQ32</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
              {filteredImages.map((img: any, idx: number) => {
                const jpgRes = img.conversions.find((c: any) => c.targetFormat === 'JPEG');
                const webpRes = img.conversions.find((c: any) => c.targetFormat === 'WebP');
                const avifRes = img.conversions.find((c: any) => c.targetFormat === 'AVIF');

                return (
                  <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="p-3.5 font-mono text-neutral-900 dark:text-white font-medium truncate max-w-[220px]" title={img.filename}>
                      {img.filename}
                      <div className="text-[10px] font-sans text-neutral-400 mt-0.5">{img.category} • {img.originalFormat}</div>
                    </td>
                    <td className="p-3.5 font-mono text-neutral-600 dark:text-neutral-400">{img.width} × {img.height}</td>
                    <td className="p-3.5 font-mono font-bold text-neutral-900 dark:text-white">{formatBytes(img.originalSizeBytes)}</td>

                    {/* MozJPEG */}
                    <td className="p-3.5 font-mono">
                      {jpgRes ? (
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-white">{formatBytes(jpgRes.outputSizeBytes)}</div>
                          <div className={`text-[10px] ${jpgRes.reductionPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {jpgRes.reductionPct >= 0 ? `${jpgRes.reductionPct}% reduction` : `+${Math.abs(jpgRes.reductionPct)}% increase`} ({jpgRes.timeMs}ms)
                          </div>
                        </div>
                      ) : '—'}
                    </td>

                    {/* WebP */}
                    <td className="p-3.5 font-mono">
                      {webpRes ? (
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-white">{formatBytes(webpRes.outputSizeBytes)}</div>
                          <div className={`text-[10px] ${webpRes.reductionPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {webpRes.reductionPct >= 0 ? `${webpRes.reductionPct}% reduction` : `+${Math.abs(webpRes.reductionPct)}% increase`} ({webpRes.timeMs}ms)
                          </div>
                        </div>
                      ) : '—'}
                    </td>

                    {/* AVIF */}
                    <td className="p-3.5 font-mono">
                      {avifRes ? (
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-white">{formatBytes(avifRes.outputSizeBytes)}</div>
                          <div className={`text-[10px] ${avifRes.reductionPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {avifRes.reductionPct >= 0 ? `${avifRes.reductionPct}% reduction` : `+${Math.abs(avifRes.reductionPct)}% increase`} ({avifRes.timeMs}ms)
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Limitations & Reproducibility */}
      <section className="mb-16 space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Reproducibility
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              Developers can independently verify these exact benchmark numbers by running the benchmark command in a Node.js runtime environment:
            </p>
            <div className="bg-neutral-900 text-neutral-200 p-3 rounded-xl text-xs font-mono flex items-center justify-between">
              <code>npx tsx scripts/run-benchmarks.ts</code>
              <FileCode className="w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Technical Constraints
            </h2>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
              <div>• WASM single-thread CPU bounds: In-browser AVIF encoding is constrained by browser thread memory limits.</div>
              <div>• Color Space: Input buffers converted via sRGB 8-bit RGBA canvas context.</div>
              <div>• Execution Context: Test benchmark executed in sandboxed Node.js environment replicating browser WASM memory limits.</div>
            </div>
          </div>
        </div>

        {/* Scope & Applicability Disclaimer Card */}
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <strong className="block font-bold text-sm text-neutral-900 dark:text-white mb-2">Notice on Scope & Applicability</strong>
          These empirical benchmark results are specific to this 20-image dataset (13 photography files, 7 UI screenshots), tested using <code>@jsquash</code> WASM codec versions (<code>@jsquash/jpeg</code> v1.6.0, <code>@jsquash/webp</code> v1.5.0, <code>@jsquash/avif</code> v2.1.1, <code>upng-js</code> v2.1.0) under single-threaded Node.js v22 WebAssembly execution on August 13, 2026. Compression ratios, encoding throughput, and visual fidelity will vary across different image content, resolutions, hardware processor architectures, browser execution engines, quality parameters, and multi-threading options. These findings do not represent a universal rule for all images or mobile devices.
        </div>
      </section>

      {/* Recommended Conversion Tools */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          Test These Codecs Live in Your Browser
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('/convert-png-to-webp-lossless')}
            className="p-4 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-neutral-900 transition-all group"
          >
            <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-between">
              Convert PNG to WebP Lossless
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Shrink PNG file size while preserving transparent pixel details.</p>
          </button>

          <button
            onClick={() => onNavigate('/convert-to-avif-online-free')}
            className="p-4 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-neutral-900 transition-all group"
          >
            <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-between">
              Convert Image to AVIF Next-Gen
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Export ultra-compressed AVIF images locally with customizable quality sliders.</p>
          </button>

          <button
            onClick={() => onNavigate('/convert-heic-to-jpg-locally')}
            className="p-4 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-neutral-900 transition-all group"
          >
            <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-between">
              Convert iPhone HEIC to JPG
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Batch convert iOS HEIC photos to compatible JPEGs in browser memory.</p>
          </button>

          <button
            onClick={() => onNavigate('/widget')}
            className="p-4 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-neutral-900 transition-all group"
          >
            <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-between">
              Zapixal Embed Widget Documentation
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Embed our lightweight image compressor on your third-party website or portal.</p>
          </button>
        </div>
      </section>

      {/* Main App CTA */}
      <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Run Custom Benchmark Tests on Your Photos</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-xl mx-auto text-sm">
          Drop your own high-resolution photographs or UI graphics into Zapixal to compare output sizes across WebP, JPEG, and PNG in real time.
        </p>
        <button 
          onClick={() => onNavigate('/')}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
        >
          Open Zapixal In-Browser Engine
        </button>
      </div>
    </article>
  );
}
