import { ImageFileItem, ConversionSettings, ImageDimensions } from '../types';
import { getWorkerPool, PooledWorker } from './workerPool';
import { validateMagicBytes, encodeJpeg, encodePng, encodeWebp, encodeAvif, encodeBmp, encodeIco } from './codecs';
import { detectHardwareCapabilities } from './hardwareCapabilities';

export async function loadImageElement(file: File): Promise<{
  img: ImageBitmap | HTMLImageElement;
  dimensions: ImageDimensions;
  objectUrl: string;
}> {
  let objectUrl: string;
  let targetFile: File | Blob = file;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Validate magic bytes first
  try {
    const headerBuffer = await file.slice(0, 16).arrayBuffer();
    const validation = validateMagicBytes(headerBuffer);
    if (!validation.valid && validation.error) {
      console.warn(`Magic byte validation warning for ${file.name}: ${validation.error}`);
    }
  } catch (err) {
    console.warn(`Could not read magic bytes for ${file.name}:`, err);
  }

  // HEIC decoding via worker pool
  if (extension === 'heic' || extension === 'heif' || file.type.includes('heic')) {
    try {
      targetFile = await getWorkerPool().decodeHeic(file);
      objectUrl = URL.createObjectURL(targetFile);
    } catch (e) {
      console.warn('HEIC worker decoding failed, falling back to direct object URL:', e);
      objectUrl = URL.createObjectURL(file);
    }
  } else {
    objectUrl = URL.createObjectURL(file);
  }

  // Downscale at decode time if hardware caps or settings specify max dimensions
  const hw = detectHardwareCapabilities();

  try {
    let imgBitmap = await createImageBitmap(targetFile);

    if (imgBitmap.width > hw.maxCanvasDimension || imgBitmap.height > hw.maxCanvasDimension) {
      const scale = Math.min(
        hw.maxCanvasDimension / imgBitmap.width,
        hw.maxCanvasDimension / imgBitmap.height
      );
      const resizeWidth = Math.max(1, Math.round(imgBitmap.width * scale));
      const resizeHeight = Math.max(1, Math.round(imgBitmap.height * scale));

      try {
        const resizedBitmap = await createImageBitmap(targetFile, {
          resizeWidth,
          resizeHeight,
          resizeQuality: 'high',
        });
        imgBitmap.close();
        imgBitmap = resizedBitmap;
      } catch (resizeErr) {
        console.warn('createImageBitmap with resize options failed, keeping unscaled bitmap:', resizeErr);
      }
    }

    return {
      img: imgBitmap,
      dimensions: { width: imgBitmap.width, height: imgBitmap.height },
      objectUrl,
    };
  } catch (err) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        resolve({
          img,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          objectUrl,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load image: ${file.name}`));
      };
      img.src = objectUrl;
    });
  }
}

export function calculateTargetDimensions(
  original: ImageDimensions,
  maxWidth?: number,
  maxHeight?: number,
  keepAspectRatio: boolean = true
): ImageDimensions {
  let { width, height } = original;

  if (!maxWidth && !maxHeight) {
    return {
      width: Math.max(1, width),
      height: Math.max(1, height),
    };
  }

  if (keepAspectRatio) {
    const widthRatio = maxWidth ? maxWidth / width : 1;
    const heightRatio = maxHeight ? maxHeight / height : 1;
    const minRatio = Math.min(widthRatio, heightRatio);

    if (minRatio < 1) {
      width = Math.round(width * minRatio);
      height = Math.round(height * minRatio);
    }
  } else {
    if (maxWidth) width = maxWidth;
    if (maxHeight) height = maxHeight;
  }

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

export async function generateThumbnail(file: File, maxDim: number = 200): Promise<string> {
  if (file.size < 100 * 1024) {
    return URL.createObjectURL(file);
  }
  try {
    const loaded = await loadImageElement(file);
    const { width, height } = loaded.dimensions;
    const scale = Math.min(maxDim / width, maxDim / height);

    if (scale >= 1) {
      if (typeof (loaded.img as any).close === 'function') {
        (loaded.img as any).close();
      }
      return loaded.objectUrl;
    }

    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    let blob: Blob | null = null;
    try {

    if (typeof OffscreenCanvas !== 'undefined' && loaded.img instanceof ImageBitmap) {
      const canvas = new OffscreenCanvas(targetW, targetH);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(loaded.img, 0, 0, targetW, targetH);
        blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.6 });
      }
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(loaded.img, 0, 0, targetW, targetH);
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.6);
        });
      }
    }

    } finally {
      if (typeof (loaded.img as any).close === 'function') {
        (loaded.img as any).close();
      }
      URL.revokeObjectURL(loaded.objectUrl);
    }

    if (blob) {
      return URL.createObjectURL(blob);
    }
    return '';
  } catch (e) {
    console.error('Thumbnail generation failed:', e);
    return '';
  }
}

export async function convertSingleImage(
  item: ImageFileItem,
  settings: ConversionSettings,
  signal?: AbortSignal
): Promise<{
  blob: Blob;
  convertedSize: number;
  dimensions: ImageDimensions;
  convertedUrl: string;
  originalFallback?: boolean;
}> {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  const { targetFormat, quality, resize } = settings;
  const effectiveRotation = (((settings.rotation || 0) + (item.rotation || 0)) % 360 + 360) % 360;
  const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;

  // PDF Export
  if (targetFormat === 'pdf') {
    const loaded = await loadImageElement(item.file);
    try {
      if (signal?.aborted) {
        throw new DOMException('The operation was aborted.', 'AbortError');
      }

      const targetDim = calculateTargetDimensions(
      loaded.dimensions,
      resize.maxWidth,
      resize.maxHeight,
      resize.keepAspectRatio
    );

    const canvasWidth = isRotated90or270 ? targetDim.height : targetDim.width;
    const canvasHeight = isRotated90or270 ? targetDim.width : targetDim.height;

    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF;
    const doc = new jsPDF({
      orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvasWidth, canvasHeight],
    });

    if (signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    if (effectiveRotation !== 0) {
      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((effectiveRotation * Math.PI) / 180);
      ctx.drawImage(loaded.img as CanvasImageSource, -targetDim.width / 2, -targetDim.height / 2, targetDim.width, targetDim.height);
      ctx.restore();
    } else {
      ctx.drawImage(loaded.img as CanvasImageSource, 0, 0, targetDim.width, targetDim.height);
    }

    const imgDataUrl = canvas.toDataURL('image/jpeg', Math.max(0.6, quality));
    doc.addImage(imgDataUrl, 'JPEG', 0, 0, canvasWidth, canvasHeight);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      blob: pdfBlob,
      convertedSize: pdfBlob.size,
      dimensions: { width: canvasWidth, height: canvasHeight },
      convertedUrl: pdfUrl,
    };
    } finally {
      if (loaded.img instanceof ImageBitmap) {
        try { loaded.img.close(); } catch(e) {}
      }
      URL.revokeObjectURL(loaded.objectUrl);
    }
  }

  // Load image
  let loaded = await loadImageElement(item.file);
  let fallbackLoaded = null;
  try {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  const targetDim = calculateTargetDimensions(
    loaded.dimensions,
    resize.enabled ? resize.maxWidth : undefined,
    resize.enabled ? resize.maxHeight : undefined,
    resize.keepAspectRatio
  );

  const canvasWidth = isRotated90or270 ? targetDim.height : targetDim.width;
  const canvasHeight = isRotated90or270 ? targetDim.width : targetDim.height;

  let convertedBlob: Blob | null = null;
  let originalFallback = false;

  // Worker Path via workerPool
  if (typeof OffscreenCanvas !== 'undefined' && loaded.img instanceof ImageBitmap && targetFormat !== 'ico') {
    let pooledWorker: PooledWorker | undefined;
    try {
      pooledWorker = await getWorkerPool().acquireWorker();
      if (signal?.aborted) {
        throw new DOMException('The operation was aborted.', 'AbortError');
      }

      const workerInstance = pooledWorker.worker;
      const result = await new Promise<{ buffer: ArrayBuffer; mimeType: string; originalFallback?: boolean }>(
        (resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Worker conversion timeout (25s)'));
          }, 25000);

          const onAbort = () => {
            clearTimeout(timeoutId);
            workerInstance.removeEventListener('message', onMsg);
            workerInstance.removeEventListener('error', onErr);
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          };

          if (signal) {
            if (signal.aborted) {
              onAbort();
              return;
            }
            signal.addEventListener('abort', onAbort);
          }

          const onMsg = (e: MessageEvent) => {
            if (e.data.id !== item.id) return;
            workerInstance.removeEventListener('message', onMsg);
            workerInstance.removeEventListener('error', onErr);
            if (signal) signal.removeEventListener('abort', onAbort);
            clearTimeout(timeoutId);

            if (e.data.status === 'success') {
              resolve({
                buffer: e.data.buffer,
                mimeType: e.data.mimeType || 'image/jpeg',
                originalFallback: e.data.originalFallback,
              });
            } else {
              reject(new Error(e.data.error || 'Worker conversion failed'));
            }
          };

          const onErr = (err: ErrorEvent) => {
            workerInstance.removeEventListener('message', onMsg);
            workerInstance.removeEventListener('error', onErr);
            if (signal) signal.removeEventListener('abort', onAbort);
            clearTimeout(timeoutId);
            reject(err instanceof Error ? err : new Error('Worker script error'));
          };

          workerInstance.addEventListener('message', onMsg);
          workerInstance.addEventListener('error', onErr);

          workerInstance.postMessage(
            {
              id: item.id,
              imageBitmap: loaded.img,
              settings,
              targetDim,
              rotation: effectiveRotation,
              originalSize: item.originalSize,
            },
            [loaded.img] // Transfer ImageBitmap ownership for zero copy
          );
        }
      );

      convertedBlob = new Blob([result.buffer], { type: result.mimeType });
      originalFallback = !!result.originalFallback;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (pooledWorker) {
          getWorkerPool().terminateWorker(pooledWorker);
          pooledWorker = undefined;
        }
        throw err;
      }
      console.warn('Worker conversion failed or timed out, using main-thread fallback:', err);
      if (pooledWorker) {
        getWorkerPool().terminateWorker(pooledWorker);
        pooledWorker = undefined;
      }
    } finally {
      if (pooledWorker) {
        getWorkerPool().releaseWorker(pooledWorker);
      }
    }
  }

  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  // Main thread fallback (if worker path was skipped or failed)
  if (!convertedBlob) {
    fallbackLoaded = typeof OffscreenCanvas !== 'undefined' && targetFormat !== 'ico' 
      ? await loadImageElement(item.file)
      : loaded;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context failed');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (targetFormat === 'jpg' || targetFormat === 'bmp') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    if (effectiveRotation !== 0) {
      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((effectiveRotation * Math.PI) / 180);
      ctx.drawImage(fallbackLoaded.img as CanvasImageSource, -targetDim.width / 2, -targetDim.height / 2, targetDim.width, targetDim.height);
      ctx.restore();
    } else {
      ctx.drawImage(fallbackLoaded.img as CanvasImageSource, 0, 0, targetDim.width, targetDim.height);
    }

    if (settings.watermarkText && settings.watermarkText.trim()) {
      const text = settings.watermarkText.trim();
      const fontSize = Math.max(14, Math.round(canvasHeight * 0.04));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      const padding = Math.max(12, Math.round(fontSize * 0.8));
      const x = canvasWidth - padding;
      const y = canvasHeight - padding;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText(text, x + 1, y + 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(text, x, y);
    }

    if (typeof (globalThis as any).scheduler?.yield === 'function') {
      await (globalThis as any).scheduler.yield();
    } else {
      await new Promise(r => setTimeout(r, 0));
    }

    if (targetFormat === 'ico') {
      convertedBlob = await encodeIco(canvas);
    } else if (targetFormat === 'png') {
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const pngBytes = await encodePng(imgData, quality, item.originalSize, canvas);
      convertedBlob = new Blob([pngBytes.buffer], { type: 'image/png' });
    } else if (targetFormat === 'jpg') {
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const jpegBytes = await encodeJpeg(imgData, quality, canvas);
      convertedBlob = new Blob([jpegBytes.buffer], { type: 'image/jpeg' });
    } else if (targetFormat === 'webp') {
      convertedBlob = await encodeWebp(canvas, quality);
    } else if (targetFormat === 'avif') {
      convertedBlob = await encodeAvif(canvas, quality);
    } else if (targetFormat === 'bmp') {
      convertedBlob = await encodeBmp(canvas);
    } else {
      convertedBlob = await encodeWebp(canvas, quality);
    }
  }

  const hasTransformations =
    effectiveRotation !== 0 ||
    (settings.resize && settings.resize.enabled) ||
    (settings.watermarkText && settings.watermarkText.trim() !== '');

  if (convertedBlob.size > item.originalSize && !hasTransformations && targetFormat !== 'ico') {
    convertedBlob = item.file;
    originalFallback = true;
  }

  const convertedUrl = URL.createObjectURL(convertedBlob);

  return {
    blob: convertedBlob,
    convertedSize: convertedBlob.size,
    dimensions: { width: canvasWidth, height: canvasHeight },
    convertedUrl,
    originalFallback,
  };
  } finally {
    if (loaded && loaded.img instanceof ImageBitmap) {
      try { loaded.img.close(); } catch(e) {}
    }
    if (loaded && loaded.objectUrl) URL.revokeObjectURL(loaded.objectUrl);
    
    if (fallbackLoaded && fallbackLoaded !== loaded) {
      if (fallbackLoaded.img instanceof ImageBitmap) {
        try { fallbackLoaded.img.close(); } catch(e) {}
      }
      if (fallbackLoaded.objectUrl) URL.revokeObjectURL(fallbackLoaded.objectUrl);
    }
  }
}

export async function generateCombinedPdf(
  items: ImageFileItem[],
  settings: ConversionSettings
): Promise<Blob> {
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF;
  let doc: any = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.status !== 'success' && item.status !== 'pending') continue;

    const effectiveRotation = (((settings.rotation || 0) + (item.rotation || 0)) % 360 + 360) % 360;
    const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;

    const loaded = await loadImageElement(item.file);
    try {
      const dim = calculateTargetDimensions(
      loaded.dimensions,
      settings.resize.maxWidth,
      settings.resize.maxHeight,
      settings.resize.keepAspectRatio
    );

    const canvasWidth = isRotated90or270 ? dim.height : dim.width;
    const canvasHeight = isRotated90or270 ? dim.width : dim.height;
    const orientation = canvasWidth > canvasHeight ? 'landscape' : 'portrait';

    if (!doc) {
      doc = new jsPDF({
        orientation,
        unit: 'px',
        format: [canvasWidth, canvasHeight],
      });
    } else {
      doc.addPage([canvasWidth, canvasHeight], orientation);
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (effectiveRotation !== 0) {
        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.rotate((effectiveRotation * Math.PI) / 180);
        ctx.drawImage(loaded.img as CanvasImageSource, -dim.width / 2, -dim.height / 2, dim.width, dim.height);
        ctx.restore();
      } else {
        ctx.drawImage(loaded.img as CanvasImageSource, 0, 0, dim.width, dim.height);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      doc.addImage(dataUrl, 'JPEG', 0, 0, canvasWidth, canvasHeight);
    }
    } finally {
      if (loaded.img instanceof ImageBitmap) {
        try { loaded.img.close(); } catch(e) {}
      }
      URL.revokeObjectURL(loaded.objectUrl);
    }
  }

  if (!doc) throw new Error('No images available for PDF compile');
  return doc.output('blob');
}

export async function generateBatchZip(
  files: ImageFileItem[],
  settings: ConversionSettings,
  formatOutputFilename: (item: ImageFileItem, idx: number, settings: ConversionSettings) => string
): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const folder = zip.folder(`converted_images_${settings.targetFormat}`);
  const successFiles = files.filter((f) => f.status === 'success' && f.blob);
  const usedNames = new Set<string>();

  for (let i = 0; i < successFiles.length; i++) {
    const f = successFiles[i];
    if (!f.blob) continue;

    let fileName = formatOutputFilename(f, i, settings);
      
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

    folder?.file(fileName, f.blob);
  }

  return await zip.generateAsync({ type: 'blob' });
}
