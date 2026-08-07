# Zapixal Architecture Blueprint & Directory Submission

## Overview
Zapixal is a 100% client-side, privacy-first web utility for image compression and conversion. It leverages modern web technologies to process files entirely in the user's browser memory, ensuring absolute data privacy, massive scalability, and zero server costs.

## 1. Core WASM & Worker Pipeline (Zero GC Overhead)
- **Streaming Compilation**: WebAssembly modules are instantiated using `WebAssembly.instantiateStreaming(fetch('codec.wasm.br'))` for near-instant boot times.
- **Persistent Memory Buffer**: To avoid JS Garbage Collection pauses during large batch processing, a shared `WebAssembly.Memory` buffer is initialized once and re-used for sequential file reads/writes.
- **Lazy-Loaded Codecs**: Heavy decoders (e.g., `libheif` for HEIC, `libavif` for AVIF) are dynamically imported via JS `import()` only when a matching file is dragged in.
- **Worker Pool**: Utilizing Transferable Objects (`postMessage({ buffer }, [buffer])`), the `conversionWorker.ts` scales to `navigator.hardwareConcurrency - 1` threads, offloading CPU-intensive encoding (WebP/AVIF) from the main UI thread.

## 2. Adaptive Hardware Detection & "Eco-Mode" Throttling
(Implementation located in `src/lib/hardwareCapabilities.ts`)
- The system checks `navigator.deviceMemory`, `navigator.hardwareConcurrency`, and `navigator.getBattery()`.
- **Standard Mode**: High-end devices process multiple images concurrently, utilizing the full worker pool and WebGPU/OffscreenCanvas for rapid resizing and color transformations before WASM encoding.
- **Eco-Mode**: Low-memory devices or devices on low battery gracefully downgrade to sequential processing (1 file at a time), strict memory clearing (`ctx.clearRect()`, immediate `URL.revokeObjectURL()`), and downscaled max canvas dimensions (2560px) to prevent OOM (Out of Memory) browser crashes.

## 3. Zero-Copy File I/O & Direct Download System
(Implementation located in `src/lib/fileSystemAccess.ts`)
- **Direct Download Strategy**: Default behavior relies on instant Blob URL creation and immediate hidden `<a>` clicks, followed instantly by memory revocation.
- **Native File System API**: For massive batch exports, `window.showSaveFilePicker()` and `window.showDirectoryPicker()` stream encoded buffers directly to disk, bypassing browser RAM limits.
- **Clipboard & DataTransfer**: Global paste listeners and recursive directory walking (`DataTransferItem.webkitGetAsEntry()`) allow seamless drag-and-drop of entire folders without freezing the UI.

## 4. Security Headers, PWA & UX Enhancements
- **Security Headers**: `vercel.json` applies `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` to unlock `SharedArrayBuffer` for true multi-threading.
- **PWA Service Worker**: `public/sw.js` caches static WASM binaries using stale-while-revalidate for sub-100ms offline loading.
- **OS File Handlers**: `public/manifest.json` binds Zapixal to the OS so users can right-click an image on Windows/Mac and choose "Open with Zapixal".

## 5. Technical SEO & Structured Data (JSON-LD)
- The SEO engine is modularized in `src/lib/seoEngine.ts`.
- Over 25+ programmatic SEO (pSEO) routes are generated statically for specific long-tail keywords (e.g., `/compress/image-under-100kb`).
- Each route injects specific HTML `<title>`, `<meta name="description">`, and extensive Schema.org JSON-LD structured data (`WebApplication`, `FAQPage`, `HowTo`) targeting low-competition search terms.

## 6. Fallback & Recovery Matrix

Zapixal is built with progressive enhancement in mind. Below is the fallback and recovery matrix implemented across the pipeline to handle older browsers, constrained hardware tiers, and sandboxed environments:

| Native Capability / API | Fallback Mechanism | Triggering Condition | Failure Outcome (If Fallback Fails) |
| :--- | :--- | :--- | :--- |
| **OffscreenCanvas** | Standard `<canvas>` on the main thread | Browser lacks `OffscreenCanvas` support (older engines). | Processing falls back to main thread `<canvas>`; UI rendering may experience minor frame stutters during massive batches. |
| **`createImageBitmap`** | Legacy `Image()` constructor with onload/onerror callbacks | Failure or error during direct bitmap generation. | Image fails to decode, setting file status to `'error'`. |
| **AVIF Encoding (WASM)** | WebP Encoding fallback | Heavy AVIF WASM loader fails or is blocked by runtime constraints. | Image encodes as high-quality WebP. If WebP is unsupported, falls back to native JPEG. |
| **WASM JPEG/PNG Encoders** | Native Canvas encoding (`canvas.toBlob`) | WASM binary fails to fetch, instantiate, or exceeds thread limit. | Image encodes via browser's native canvas encoder; output sizes are slightly larger but the file succeeds. |
| **HEIC Decoder Worker** | Direct Object URL / Native engine decode | HEIC worker crashes or fails to instantiate. | Falls back to native object URL rendering. If browser lacks HEIC codecs natively, status is marked `'error'`. |
| **Concurrent Workers** | Sequential single-thread processing | Low-end hardware tier detected (concurrency = 1) or Eco-Mode active. | Batch processing is processed sequentially to prevent CPU bottlenecks, memory spikes, and browser page crashes. |

---



### SEO Tags & Keywords
`image converter`, `heic to jpg`, `webp converter`, `avif encoder`, `privacy-first tool`, `offline image compressor`, `webassembly`, `bulk image resize`
