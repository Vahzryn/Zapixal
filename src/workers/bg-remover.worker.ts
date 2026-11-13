import type {
  WorkerInboundMessage,
  WorkerOutboundMessage,
  ExecutionBackend,
} from '../features/background-remover/types';

// Model definition (RMBG-1.4 is state-of-the-art for fine hair and product boundaries)
const DEFAULT_MODEL_ID = 'briaai/RMBG-1.4';

let modelInstance: any = null;
let processorInstance: any = null;
let currentLoadedBackend: ExecutionBackend | null = null;
let currentActiveOperationId: string | null = null;
let isCancelled = false;

/**
 * Detects WebAssembly SIMD support by validating a minimal SIMD magic bytes probe.
 */
async function detectWasmSimd(): Promise<boolean> {
  try {
    // Minimal WASM module that uses i32x4.add (a SIMD operation)
    const simdProbe = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, 0x03,
      0x02, 0x01, 0x00, 0x0a, 0x0a, 0x01, 0x08, 0x00,
      0xfd, 0x0f, 0xfd, 0x0f, 0xfd, 0xfe, 0x01, 0x0b,
    ]);
    return WebAssembly.validate(simdProbe);
  } catch {
    return false;
  }
}

/**
 * Creates a timeout promise that rejects after `ms` milliseconds.
 */
function createTimeout(ms: number, label: string): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`${label} timed out after ${ms / 1000}s. Check your internet connection and try again.`)),
      ms
    )
  );
}

/**
 * Lazily loads transformers.js and instantiates the segmentation pipeline.
 * Includes chunked/resilient loading for constrained mobile devices (e.g., Galaxy A35).
 */
async function loadSegmentationModel(
  backend: ExecutionBackend = 'webgpu',
  modelId: string = DEFAULT_MODEL_ID,
  operationId: string
): Promise<{ model: any; processor: any; backendUsed: ExecutionBackend }> {
  if (modelInstance && processorInstance && currentLoadedBackend === backend) {
    return { model: modelInstance, processor: processorInstance, backendUsed: backend };
  }

  // Dispose previous instance if backend switched
  if (modelInstance) {
    try {
      if (typeof modelInstance.dispose === 'function') {
        await modelInstance.dispose();
      }
    } catch {
      // Ignore disposal errors
    }
    modelInstance = null;
    processorInstance = null;
  }

  postResponse({
    type: 'PROGRESS',
    operationId,
    stage: 'downloading-model',
    progress: 5,
    message: 'Preparing AI background removal model...',
  });

  const { AutoModel, AutoProcessor, env } = await import('@huggingface/transformers');

  // Detect mobile context for conservative threading
  const isMobile = typeof self !== 'undefined' &&
    /Mobi|Android|iPhone|iPad|iPod/i.test((self as any).navigator?.userAgent || '');

  // Detect SIMD support for WASM thread configuration
  const hasSimd = await detectWasmSimd();

  // Configure browser environment flags
  env.allowLocalModels = false;
  env.useBrowserCache = true;

  // Guard WASM thread and environment configuration
  try {
    if (env.backends?.onnx?.wasm) {
      // Disable SharedArrayBuffer-dependent proxy mode on mobile (SAB not guaranteed without COOP/COEP headers)
      if (isMobile) {
        (env.backends.onnx.wasm as any).proxy = false;
        (env.backends.onnx.wasm as any).numThreads = 1;
      } else if (!hasSimd) {
        (env.backends.onnx.wasm as any).numThreads = 1;
      } else {
        (env.backends.onnx.wasm as any).numThreads = Math.min(
          typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 1) : 1,
          2
        );
      }
    }
  } catch {
    // If env.backends config fails, proceed — transformers.js will use defaults
  }

  const fileProgressMap = new Map<string, { loaded: number; total: number; percent: number }>();
  let lastReportedTime = 0;

  const progressCallback = (p: any) => {
    if (isCancelled || currentActiveOperationId !== operationId) return;

    if (p.status === 'progress' && typeof p.progress === 'number') {
      const fileName = p.file || 'model_weights';
      fileProgressMap.set(fileName, {
        loaded: p.loaded || 0,
        total: p.total || (43 * 1024 * 1024),
        percent: p.progress,
      });

      let totalLoaded = 0;
      let totalExpected = 0;
      for (const entry of fileProgressMap.values()) {
        totalLoaded += entry.loaded;
        totalExpected += entry.total;
      }

      if (totalExpected === 0) {
        totalExpected = 43 * 1024 * 1024;
      }

      const globalPct = Math.min(100, Math.max(0, Math.round((totalLoaded / totalExpected) * 100)));
      const scaledUiPct = Math.min(75, Math.max(5, 5 + Math.round((globalPct * 70) / 100)));

      const now = performance.now();
      if (now - lastReportedTime > 80 || globalPct >= 99 || globalPct <= 5) {
        lastReportedTime = now;
        postResponse({
          type: 'PROGRESS',
          operationId,
          stage: 'downloading-model',
          progress: scaledUiPct,
          message: `Downloading AI model (${globalPct}%)...`,
          bytesLoaded: totalLoaded,
          bytesTotal: totalExpected,
        });
      }
    } else if (p.status === 'ready' || p.status === 'done') {
      postResponse({
        type: 'PROGRESS',
        operationId,
        stage: 'initializing-backend',
        progress: 75,
        message: `Initializing ${backend === 'webgpu' ? 'WebGPU' : 'WASM'} acceleration...`,
      });
    }
  };

  let actualBackend = backend;
  let model: any = null;
  let processor: any = null;

  // Load processor with its own error context
  try {
    processor = await Promise.race([
      AutoProcessor.from_pretrained(modelId, { progress_callback: progressCallback }),
      createTimeout(90_000, 'Processor download'),
    ]);
  } catch (procErr: any) {
    const rawMsg = procErr?.message || String(procErr);
    const friendlyMsg = rawMsg.includes('timed out')
      ? rawMsg
      : rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError')
      ? 'Unable to download AI model config. Please check your internet connection and try again.'
      : `Failed to load model processor: ${rawMsg}`;
    throw new Error(friendlyMsg);
  }

  // Helper: attempt model load with a specific device
  async function attemptModelLoad(device: 'webgpu' | 'wasm', label: string): Promise<any> {
    postResponse({
      type: 'PROGRESS',
      operationId,
      stage: 'initializing-backend',
      progress: 78,
      message: `Initializing ${label} backend...`,
    });
    return Promise.race([
      AutoModel.from_pretrained(modelId, {
        device,
        progress_callback: progressCallback,
      }),
      createTimeout(120_000, `${label} model initialization`),
    ]);
  }

  // Primary attempt
  try {
    model = await attemptModelLoad(
      backend === 'webgpu' ? 'webgpu' : 'wasm',
      backend === 'webgpu' ? 'WebGPU' : 'WASM'
    );
    actualBackend = backend;
  } catch (primaryErr: any) {
    const primaryMsg = primaryErr?.message || String(primaryErr);
    console.warn(`[bg-remover] Primary backend (${backend}) failed:`, primaryMsg);

    // First fallback: switch to WASM if WebGPU failed
    if (backend === 'webgpu') {
      postResponse({
        type: 'PROGRESS',
        operationId,
        stage: 'initializing-backend',
        progress: 78,
        message: 'WebGPU unavailable, switching to WASM fallback...',
      });
      try {
        model = await attemptModelLoad('wasm', 'WASM');
        actualBackend = 'wasm';
      } catch (wasmErr: any) {
        // Second fallback: single-threaded WASM (for Galaxy A35-class devices)
        console.warn('[bg-remover] Multi-threaded WASM failed, trying single-threaded:', wasmErr?.message);
        postResponse({
          type: 'PROGRESS',
          operationId,
          stage: 'initializing-backend',
          progress: 79,
          message: 'Applying single-threaded fallback for this device...',
        });
        try {
          if (env.backends?.onnx?.wasm) {
            (env.backends.onnx.wasm as any).numThreads = 1;
            (env.backends.onnx.wasm as any).proxy = false;
          }
          model = await attemptModelLoad('wasm', 'WASM (single-thread)');
          actualBackend = 'wasm';
        } catch (finalErr: any) {
          const rawMsg = finalErr?.message || String(finalErr);
          const friendlyMsg = rawMsg.includes('timed out')
            ? rawMsg
            : rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError')
            ? 'Unable to download AI model weights. Please check your internet connection and try again.'
            : rawMsg.includes('memory') || rawMsg.includes('OOM') || rawMsg.includes('allocation')
            ? 'Not enough device memory to load the AI model. Try closing other browser tabs and retry.'
            : `Failed to load background removal model: ${rawMsg}`;
          throw new Error(friendlyMsg);
        }
      }
    } else {
      // WASM primary failed: try single-threaded WASM fallback
      console.warn('[bg-remover] WASM multi-thread failed, trying single-threaded:', primaryMsg);
      postResponse({
        type: 'PROGRESS',
        operationId,
        stage: 'initializing-backend',
        progress: 79,
        message: 'Applying single-threaded fallback for this device...',
      });
      try {
        if (env.backends?.onnx?.wasm) {
          (env.backends.onnx.wasm as any).numThreads = 1;
          (env.backends.onnx.wasm as any).proxy = false;
        }
        model = await attemptModelLoad('wasm', 'WASM (single-thread)');
        actualBackend = 'wasm';
      } catch (finalErr: any) {
        const rawMsg = finalErr?.message || String(finalErr);
        const friendlyMsg = rawMsg.includes('timed out')
          ? rawMsg
          : rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError')
          ? 'Unable to download AI model weights. Please check your internet connection and try again.'
          : rawMsg.includes('memory') || rawMsg.includes('OOM') || rawMsg.includes('allocation')
          ? 'Not enough device memory to load the AI model. Try closing other browser tabs and retry.'
          : `Failed to load background removal model: ${rawMsg}`;
        throw new Error(friendlyMsg);
      }
    }
  }

  modelInstance = model;
  processorInstance = processor;
  currentLoadedBackend = actualBackend;

  return { model, processor, backendUsed: actualBackend };
}

/**
 * Runs segmentation inference on input image data.
 */
async function runInference(
  imageDataOrBitmap: ImageBitmap | ImageData,
  targetWidth: number,
  targetHeight: number,
  backend: ExecutionBackend = 'webgpu',
  operationId: string
) {
  currentActiveOperationId = operationId;
  isCancelled = false;

  const startTime = performance.now();

  const { model, processor, backendUsed } = await loadSegmentationModel(backend, DEFAULT_MODEL_ID, operationId);

  if (isCancelled || currentActiveOperationId !== operationId) {
    return;
  }

  postResponse({
    type: 'PROGRESS',
    operationId,
    stage: 'inferring',
    progress: 85,
    message: 'Computing subject cutout & alpha matte...',
  });

  const { RawImage } = await import('@huggingface/transformers');

  // Convert input to RawImage for Transformers.js processor
  let rawImage: any;
  if ('data' in imageDataOrBitmap) {
    // ImageData
    rawImage = new RawImage(
      imageDataOrBitmap.data,
      imageDataOrBitmap.width,
      imageDataOrBitmap.height,
      4
    );
  } else {
    // ImageBitmap - draw to an OffscreenCanvas to get Uint8ClampedArray
    const offscreen = new OffscreenCanvas(imageDataOrBitmap.width, imageDataOrBitmap.height);
    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Could not create OffscreenCanvas 2D context in worker');
    }
    ctx.drawImage(imageDataOrBitmap, 0, 0);
    const imgData = ctx.getImageData(0, 0, imageDataOrBitmap.width, imageDataOrBitmap.height);
    rawImage = new RawImage(imgData.data, imgData.width, imgData.height, 4);

    // Close bitmap as soon as drawn
    try {
      imageDataOrBitmap.close();
    } catch {
      // Ignore
    }
  }

  if (isCancelled || currentActiveOperationId !== operationId) {
    return;
  }

  // Preprocess image
  const imageInputs = await processor(rawImage);

  if (isCancelled || currentActiveOperationId !== operationId) {
    return;
  }

  // Run model inference
  const { output } = await model(imageInputs);

  if (isCancelled || currentActiveOperationId !== operationId) {
    return;
  }

  postResponse({
    type: 'PROGRESS',
    operationId,
    stage: 'compositing',
    progress: 95,
    message: 'Extracting high-precision alpha mask...',
  });

  // Output mask processing
  // output is [1, 1, H, W] probability tensor
  const maskRaw = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(targetWidth, targetHeight);

  const inferenceTimeMs = Math.round(performance.now() - startTime);

  // Extract raw mask byte buffer
  // maskRaw.data is Uint8ClampedArray / Uint8Array representing grayscale pixels
  const maskArray = maskRaw.data;
  const maskBuffer = maskArray.buffer.slice(
    maskArray.byteOffset,
    maskArray.byteOffset + maskArray.byteLength
  );

  postResponse(
    {
      type: 'SUCCESS',
      operationId,
      maskBuffer,
      maskWidth: targetWidth,
      maskHeight: targetHeight,
      backendUsed,
      inferenceTimeMs,
    },
    [maskBuffer] // Transferable ArrayBuffer
  );
}

function postResponse(message: WorkerOutboundMessage, transfer?: Transferable[]) {
  if (transfer && transfer.length > 0) {
    self.postMessage(message, { transfer });
  } else {
    self.postMessage(message);
  }
}

// Global worker listener
self.onmessage = async (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data;
  if (!msg) return;

  switch (msg.type) {
    case 'INIT': {
      try {
        currentActiveOperationId = msg.operationId;
        isCancelled = false;
        await loadSegmentationModel(msg.backend || 'webgpu', msg.modelId || DEFAULT_MODEL_ID, msg.operationId);
        postResponse({
          type: 'PROGRESS',
          operationId: msg.operationId,
          stage: 'completed',
          progress: 100,
          message: 'Model ready for inference.',
        });
      } catch (err: any) {
        postResponse({
          type: 'ERROR',
          operationId: msg.operationId,
          error: err?.message || 'Failed to initialize segmentation worker.',
        });
      }
      break;
    }

    case 'INFER': {
      const input = msg.imageBitmap || msg.imageData;
      if (!input) {
        postResponse({
          type: 'ERROR',
          operationId: msg.operationId,
          error: 'No image input provided for inference.',
        });
        return;
      }

      try {
        await runInference(
          input,
          msg.targetWidth,
          msg.targetHeight,
          msg.backend || 'webgpu',
          msg.operationId
        );
      } catch (err: any) {
        if (currentActiveOperationId === msg.operationId && !isCancelled) {
          postResponse({
            type: 'ERROR',
            operationId: msg.operationId,
            error: err?.message || 'Background removal inference failed.',
          });
        }
      }
      break;
    }

    case 'CANCEL': {
      if (currentActiveOperationId === msg.operationId) {
        isCancelled = true;
      }
      break;
    }

    case 'DISPOSE': {
      isCancelled = true;
      if (modelInstance) {
        try {
          if (typeof modelInstance.dispose === 'function') {
            modelInstance.dispose();
          }
        } catch {
          // Ignore
        }
        modelInstance = null;
        processorInstance = null;
      }
      currentLoadedBackend = null;
      break;
    }
  }
};
