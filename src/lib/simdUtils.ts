/**
 * WASM SIMD & Fast Buffer Algorithms
 * 
 * Provides runtime WebAssembly SIMD detection and 32-bit pixel-packed algorithms
 * for high-throughput image manipulation.
 */

let cachedSimdSupport: boolean | null = null;

/**
 * Checks whether the current JavaScript engine supports WebAssembly SIMD.
 * Uses the canonical WebAssembly SIMD test bytecode probe.
 */
export async function detectWasmSimdSupport(): Promise<boolean> {
  if (cachedSimdSupport !== null) return cachedSimdSupport;
  
  if (typeof WebAssembly !== 'object' || typeof WebAssembly.validate !== 'function') {
    cachedSimdSupport = false;
    return false;
  }

  try {
    // 0x00, 0x61, 0x73, 0x6d (magic) + 0x01, 0x00, 0x00, 0x00 (version)
    // with a v128.const SIMD opcode
    const simdProbeBytes = new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10,
      10, 1, 8, 0, 253, 12, 0, 0, 0, 0, 0, 0, 11
    ]);
    cachedSimdSupport = WebAssembly.validate(simdProbeBytes);
  } catch {
    cachedSimdSupport = false;
  }

  return cachedSimdSupport;
}

/**
 * Fast 32-bit pixel buffer luminance extractor.
 * Processes 4 bytes per iteration via Uint32Array rather than slow individual byte indexing.
 */
export function fastCalculateAverageBrightness(imageData: ImageData): number {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  if (totalPixels === 0) return 0;

  const u32 = new Uint32Array(data.buffer, data.byteOffset, totalPixels);
  let totalLuma = 0;
  // Sample up to 10,000 pixels adaptively for instant execution
  const step = Math.max(1, Math.floor(totalPixels / 10000));
  let samples = 0;

  for (let i = 0; i < totalPixels; i += step) {
    const pixel = u32[i];
    // In little-endian: RGBA -> byte 0: R, byte 1: G, byte 2: B, byte 3: A
    const r = pixel & 0xff;
    const g = (pixel >> 8) & 0xff;
    const b = (pixel >> 16) & 0xff;
    const a = (pixel >> 24) & 0xff;

    if (a > 16) {
      totalLuma += 0.299 * r + 0.587 * g + 0.114 * b;
      samples++;
    }
  }

  return samples > 0 ? totalLuma / samples : 0;
}

/**
 * Checks if image data contains any transparent or semi-transparent pixels
 * using 32-bit fast scanning (bails early on first transparent pixel).
 */
export function fastHasAlphaTransparency(imageData: ImageData): boolean {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const u32 = new Uint32Array(data.buffer, data.byteOffset, totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    // Top byte is alpha in little-endian Uint32
    if ((u32[i] & 0xff000000) !== 0xff000000) {
      return true;
    }
  }

  return false;
}
