import { ImageFileItem, ConversionSettings, ImageDimensions, TargetFormat } from '../types';
import { formatBytes } from './utils';
import { getWorkerPool, PooledWorker } from './workerPool';
import { validateMagicBytes, encodeJpeg, encodePng, encodeWebp, encodeAvif, encodeBmp, encodeIco, injectDpiMetadata } from './codecs';
import { detectHardwareCapabilities, getMaxPixels, getMaxMegapixels } from './hardwareCapabilities';

export async function loadImageElement(file: File): Promise<{
  img: ImageBitmap | HTMLImageElement;
  dimensions: ImageDimensions;
  objectUrl: string;
}> {
  let objectUrl: string;
  let targetFile: File | Blob = file;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Check TIFF support (only native in Safari)
  if (extension === 'tiff' || extension === 'tif' || file.type.includes('tiff')) {
    const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari) {
      throw new Error(`TIFF decoding is not natively supported by this browser. Please convert the TIFF file to PNG or JPEG first, or use Safari.`);
    }
  }

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
    } catch (e: any) {
      console.error('HEIC worker decoding failed:', e);
      throw new Error(`Failed to decode HEIC/HEIF file. Ensure the file is not corrupted or try a different HEIC encoder.`);
    }
  } else {
    objectUrl = URL.createObjectURL(file);
  }

  // Helper to construct highly informative error messages
  const getHelpfulError = (): Error => {
    if (extension === 'avif') {
      return new Error(`Failed to decode AVIF. Your browser or operating system may not support AVIF image decoding.`);
    }
    if (extension === 'webp') {
      return new Error(`Failed to decode WebP. Ensure the WebP image is valid and not corrupted.`);
    }
    if (extension === 'svg') {
      return new Error(`Failed to decode SVG. Ensure the SVG file is valid and contains standard XML elements.`);
    }
    if (extension === 'gif') {
      return new Error(`Failed to decode GIF. Ensure the file is valid. Note that animated GIFs are flattened to their first frame.`);
    }
    return new Error(`Unsupported or corrupted image file format (${extension.toUpperCase()}).`);
  };

  // Downscale at decode time if hardware caps or settings specify max dimensions
  const hw = detectHardwareCapabilities();
  const maxPixels = getMaxPixels(hw.tier);
  const maxMP = getMaxMegapixels(hw.tier);

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let imgBitmap = await createImageBitmap(targetFile);

      // Check decoded pixel dimensions safety ceiling before proceeding
      const decodedPixels = imgBitmap.width * imgBitmap.height;
      if (decodedPixels > maxPixels) {
        imgBitmap.close();
        URL.revokeObjectURL(objectUrl);
        throw new Error(`Image dimensions too large to process safely on this device (${Math.round(decodedPixels / 1_000_000)} MP exceeds ${maxMP} MP limit)`);
      }

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
    } catch (err: any) {
      if (err.message && err.message.includes('Image dimensions too large to process safely on this device')) {
        throw err;
      }
      console.warn(`createImageBitmap attempt ${attempt} failed:`, err);
      if (attempt < maxAttempts) {
        // Yield to the event loop
        if (typeof (window as any).scheduler?.yield === 'function') {
          await (window as any).scheduler.yield();
        } else {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
        continue;
      }

      // If we reach here, we've exhausted all attempts of createImageBitmap.
      // Now fall back to the Image() method EXACTLY once.
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const decodedPixels = img.naturalWidth * img.naturalHeight;
          if (decodedPixels > maxPixels) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`Image dimensions too large to process safely on this device (${Math.round(decodedPixels / 1_000_000)} MP exceeds ${maxMP} MP limit)`));
            return;
          }
          resolve({
            img,
            dimensions: { width: img.naturalWidth, height: img.naturalHeight },
            objectUrl,
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(getHelpfulError());
        };
        img.src = objectUrl;
      });
    }
  }

  // Fallback return just in case
  throw getHelpfulError();
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

export function calculateCropRect(
  sourceWidth: number,
  sourceHeight: number,
  targetRatio: { width: number; height: number }
): { cropX: number; cropY: number; cropWidth: number; cropHeight: number } {
  if (sourceWidth <= 0 || sourceHeight <= 0 || !targetRatio || targetRatio.width <= 0 || targetRatio.height <= 0) {
    return { cropX: 0, cropY: 0, cropWidth: Math.max(1, sourceWidth), cropHeight: Math.max(1, sourceHeight) };
  }

  const targetAspect = targetRatio.width / targetRatio.height;
  const sourceAspect = sourceWidth / sourceHeight;

  let cropWidth: number;
  let cropHeight: number;

  if (sourceAspect > targetAspect) {
    // Source is wider than target ratio -> crop width
    cropHeight = sourceHeight;
    cropWidth = sourceHeight * targetAspect;
  } else {
    // Source is taller than or equal to target ratio -> crop height
    cropWidth = sourceWidth;
    cropHeight = sourceWidth / targetAspect;
  }

  const cropX = Math.max(0, Math.min((sourceWidth - cropWidth) / 2, sourceWidth - cropWidth));
  const cropY = Math.max(0, Math.min((sourceHeight - cropHeight) / 2, sourceHeight - cropHeight));

  return {
    cropX: Math.round(cropX),
    cropY: Math.round(cropY),
    cropWidth: Math.round(cropWidth),
    cropHeight: Math.round(cropHeight),
  };
}

export function getCropSourceRect(
  sourceWidth: number,
  sourceHeight: number,
  rotation: number,
  cropRatio?: { width: number; height: number } | null
): { cropX: number; cropY: number; cropWidth: number; cropHeight: number } {
  const effectiveRotation = ((rotation % 360) + 360) % 360;
  const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;
  const postRotWidth = isRotated90or270 ? sourceHeight : sourceWidth;
  const postRotHeight = isRotated90or270 ? sourceWidth : sourceHeight;

  if (!cropRatio || cropRatio.width <= 0 || cropRatio.height <= 0) {
    return { cropX: 0, cropY: 0, cropWidth: sourceWidth, cropHeight: sourceHeight };
  }

  const cropRectPost = calculateCropRect(postRotWidth, postRotHeight, cropRatio);
  const { cropX: X, cropY: Y, cropWidth: W, cropHeight: H } = cropRectPost;

  let cropX = 0;
  let cropY = 0;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (effectiveRotation === 0) {
    cropX = X;
    cropY = Y;
    cropWidth = W;
    cropHeight = H;
  } else if (effectiveRotation === 90) {
    cropX = sourceWidth - (Y + H);
    cropY = X;
    cropWidth = H;
    cropHeight = W;
  } else if (effectiveRotation === 180) {
    cropX = sourceWidth - (X + W);
    cropY = sourceHeight - (Y + H);
    cropWidth = W;
    cropHeight = H;
  } else if (effectiveRotation === 270) {
    cropX = Y;
    cropY = sourceHeight - (X + W);
    cropWidth = H;
    cropHeight = W;
  }

  cropX = Math.max(0, Math.min(cropX, sourceWidth - cropWidth));
  cropY = Math.max(0, Math.min(cropY, sourceHeight - cropHeight));

  return { cropX, cropY, cropWidth, cropHeight };
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

  let derivedFormat: TargetFormat = 'jpg';
  if (settings.targetFormatMode === 'per-original') {
    try {
      const headerBuffer = await item.file.slice(0, 16).arrayBuffer();
      const validation = validateMagicBytes(headerBuffer);
      if (validation.valid && validation.format) {
        if (validation.format === 'jpg' || validation.format === 'png' || validation.format === 'webp' || validation.format === 'bmp' || validation.format === 'ico') {
          derivedFormat = validation.format as TargetFormat;
        } else {
          derivedFormat = 'jpg';
        }
      } else {
        const ext = item.file.name.split('.').pop()?.toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg') derivedFormat = 'jpg';
        else if (ext === 'png') derivedFormat = 'png';
        else if (ext === 'webp') derivedFormat = 'webp';
        else if (ext === 'bmp') derivedFormat = 'bmp';
        else if (ext === 'ico') derivedFormat = 'ico';
        else derivedFormat = 'jpg';
      }
    } catch (e) {
      const ext = item.file.name.split('.').pop()?.toLowerCase();
      if (ext === 'jpg' || ext === 'jpeg') derivedFormat = 'jpg';
      else if (ext === 'png') derivedFormat = 'png';
      else if (ext === 'webp') derivedFormat = 'webp';
      else if (ext === 'bmp') derivedFormat = 'bmp';
      else if (ext === 'ico') derivedFormat = 'ico';
      else derivedFormat = 'jpg';
    }
  } else {
    derivedFormat = settings.targetFormat;
  }

  if (item.customTargetFormat) {
    derivedFormat = item.customTargetFormat;
  }

  const effectiveSettings: ConversionSettings = {
    ...settings,
    targetFormat: derivedFormat,
  };

  const { targetFormat, quality, resize } = effectiveSettings;
  const effectiveRotation = (((effectiveSettings.rotation || 0) + (item.rotation || 0)) % 360 + 360) % 360;
  const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;

  // PDF Export
  if (targetFormat === 'pdf') {
    const loaded = await loadImageElement(item.file);
    try {
      if (signal?.aborted) {
        throw new DOMException('The operation was aborted.', 'AbortError');
      }

      const pdfSourceW = loaded.dimensions.width;
      const pdfSourceH = loaded.dimensions.height;
      const pdfPostW = isRotated90or270 ? pdfSourceH : pdfSourceW;
      const pdfPostH = isRotated90or270 ? pdfSourceW : pdfSourceH;

      let pdfCroppedW = pdfPostW;
      let pdfCroppedH = pdfPostH;
      if (effectiveSettings.cropAspectRatio && effectiveSettings.cropAspectRatio.width > 0 && effectiveSettings.cropAspectRatio.height > 0) {
        const cropPost = calculateCropRect(pdfPostW, pdfPostH, effectiveSettings.cropAspectRatio);
        pdfCroppedW = cropPost.cropWidth;
        pdfCroppedH = cropPost.cropHeight;
      }

      const targetDim = calculateTargetDimensions(
        { width: pdfCroppedW, height: pdfCroppedH },
        resize.maxWidth,
        resize.maxHeight,
        resize.keepAspectRatio
      );

      const canvasWidth = targetDim.width;
      const canvasHeight = targetDim.height;

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

      const pdfCropSource = getCropSourceRect(pdfSourceW, pdfSourceH, effectiveRotation, effectiveSettings.cropAspectRatio);
      if (effectiveRotation !== 0) {
        const drawW = isRotated90or270 ? canvasHeight : canvasWidth;
        const drawH = isRotated90or270 ? canvasWidth : canvasHeight;
        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.rotate((effectiveRotation * Math.PI) / 180);
        ctx.drawImage(loaded.img as CanvasImageSource, pdfCropSource.cropX, pdfCropSource.cropY, pdfCropSource.cropWidth, pdfCropSource.cropHeight, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else {
        ctx.drawImage(loaded.img as CanvasImageSource, pdfCropSource.cropX, pdfCropSource.cropY, pdfCropSource.cropWidth, pdfCropSource.cropHeight, 0, 0, canvasWidth, canvasHeight);
      }

      applyBlurAndPixelateRegions(ctx, canvasWidth, canvasHeight, item.blurRegions, item.blurMode);

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

  const sourceW = loaded.dimensions.width;
  const sourceH = loaded.dimensions.height;
  const postRotW = isRotated90or270 ? sourceH : sourceW;
  const postRotH = isRotated90or270 ? sourceW : sourceH;

  let croppedW = postRotW;
  let croppedH = postRotH;
  if (effectiveSettings.cropAspectRatio && effectiveSettings.cropAspectRatio.width > 0 && effectiveSettings.cropAspectRatio.height > 0) {
    const cropPost = calculateCropRect(postRotW, postRotH, effectiveSettings.cropAspectRatio);
    croppedW = cropPost.cropWidth;
    croppedH = cropPost.cropHeight;
  }

  const targetDim = calculateTargetDimensions(
    { width: croppedW, height: croppedH },
    resize.enabled ? resize.maxWidth : undefined,
    resize.enabled ? resize.maxHeight : undefined,
    resize.keepAspectRatio
  );

  const canvasWidth = targetDim.width;
  const canvasHeight = targetDim.height;

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
              settings: effectiveSettings,
              targetDim,
              rotation: effectiveRotation,
              originalSize: item.originalSize,
              blurRegions: item.blurRegions,
              blurMode: item.blurMode,
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

    const fbSourceW = fallbackLoaded.dimensions.width;
    const fbSourceH = fallbackLoaded.dimensions.height;
    const cropSource = getCropSourceRect(fbSourceW, fbSourceH, effectiveRotation, effectiveSettings.cropAspectRatio);

    if (effectiveRotation !== 0) {
      const drawW = isRotated90or270 ? canvasHeight : canvasWidth;
      const drawH = isRotated90or270 ? canvasWidth : canvasHeight;
      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((effectiveRotation * Math.PI) / 180);
      ctx.drawImage(fallbackLoaded.img as CanvasImageSource, cropSource.cropX, cropSource.cropY, cropSource.cropWidth, cropSource.cropHeight, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(fallbackLoaded.img as CanvasImageSource, cropSource.cropX, cropSource.cropY, cropSource.cropWidth, cropSource.cropHeight, 0, 0, canvasWidth, canvasHeight);
    }

    applyBlurAndPixelateRegions(ctx, canvasWidth, canvasHeight, item.blurRegions, item.blurMode);

    if (effectiveSettings.grayscale) {
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    if (effectiveSettings.watermarkText && effectiveSettings.watermarkText.trim()) {
      const text = effectiveSettings.watermarkText.trim();
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
      let pngBytes = await encodePng(imgData, quality, item.originalSize, canvas);
      if (effectiveSettings.targetDPI && effectiveSettings.targetDPI > 0) {
        pngBytes = injectDpiMetadata(pngBytes, 'png', effectiveSettings.targetDPI);
      }
      convertedBlob = new Blob([pngBytes.buffer], { type: 'image/png' });
    } else if (targetFormat === 'jpg') {
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      let jpegBytes = await encodeJpeg(imgData, quality, canvas);
      if (effectiveSettings.targetDPI && effectiveSettings.targetDPI > 0) {
        jpegBytes = injectDpiMetadata(jpegBytes, 'jpg', effectiveSettings.targetDPI);
      }
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

    // targetMaxKB reduction loop if required on main thread
    if (effectiveSettings.targetMaxKB && effectiveSettings.targetMaxKB > 0 && targetFormat !== 'ico') {
      const maxBytes = effectiveSettings.targetMaxKB * 1024;
      let currentQuality = quality;
      let step = 0;

      // 1. First degrade quality
      while (convertedBlob.size > maxBytes && currentQuality > 0.12 && step < 10) {
        step++;
        currentQuality = Math.max(0.1, currentQuality * 0.75);
        if (targetFormat === 'jpg') {
          const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          let bytes = await encodeJpeg(imgData, currentQuality, canvas);
          if (effectiveSettings.targetDPI && effectiveSettings.targetDPI > 0) {
            bytes = injectDpiMetadata(bytes, 'jpg', effectiveSettings.targetDPI);
          }
          convertedBlob = new Blob([bytes.buffer], { type: 'image/jpeg' });
        } else if (targetFormat === 'png') {
          const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          let bytes = await encodePng(imgData, currentQuality, item.originalSize, canvas);
          if (effectiveSettings.targetDPI && effectiveSettings.targetDPI > 0) {
            bytes = injectDpiMetadata(bytes, 'png', effectiveSettings.targetDPI);
          }
          convertedBlob = new Blob([bytes.buffer], { type: 'image/png' });
        } else if (targetFormat === 'webp') {
          convertedBlob = await encodeWebp(canvas, currentQuality);
        } else if (targetFormat === 'avif') {
          convertedBlob = await encodeAvif(canvas, currentQuality);
        } else {
          break;
        }
      }

      // 2. Then scale down dimensions if still too big
      let currentCanvas: any = canvas;
      let scale = 0.85;
      while (convertedBlob.size > maxBytes && scale > 0.15 && step < 15) {
        step++;
        const w = Math.max(16, Math.round(canvasWidth * scale));
        const h = Math.max(16, Math.round(canvasHeight * scale));
        
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = w;
        scaledCanvas.height = h;
        const sCtx = scaledCanvas.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(currentCanvas, 0, 0, w, h);
          if (targetFormat === 'jpg') {
            const imgData = sCtx.getImageData(0, 0, w, h);
            let bytes = await encodeJpeg(imgData, currentQuality, scaledCanvas);
            if (effectiveSettings.targetDPI && effectiveSettings.targetDPI > 0) {
              bytes = injectDpiMetadata(bytes, 'jpg', effectiveSettings.targetDPI);
            }
            convertedBlob = new Blob([bytes.buffer], { type: 'image/jpeg' });
          } else if (targetFormat === 'png') {
            const imgData = sCtx.getImageData(0, 0, w, h);
            let bytes = await encodePng(imgData, currentQuality, item.originalSize, scaledCanvas);
            if (effectiveSettings.targetDPI && effectiveSettings.targetDPI > 0) {
              bytes = injectDpiMetadata(bytes, 'png', effectiveSettings.targetDPI);
            }
            convertedBlob = new Blob([bytes.buffer], { type: 'image/png' });
          } else if (targetFormat === 'webp') {
            convertedBlob = await encodeWebp(scaledCanvas, currentQuality);
          } else if (targetFormat === 'avif') {
            convertedBlob = await encodeAvif(scaledCanvas, currentQuality);
          } else if (targetFormat === 'bmp') {
            convertedBlob = await encodeBmp(scaledCanvas);
          }
          currentCanvas = scaledCanvas;
        }
        scale *= 0.8;
      }

      if (convertedBlob.size > maxBytes) {
        throw new Error(`target not reached (final size: ${formatBytes(convertedBlob.size)})`);
      }
    }
  }

  const hasTransformations =
    effectiveRotation !== 0 ||
    (effectiveSettings.resize && effectiveSettings.resize.enabled) ||
    (effectiveSettings.watermarkText && effectiveSettings.watermarkText.trim() !== '') ||
    !!effectiveSettings.grayscale;

  const isStripExif = effectiveSettings.stripExif !== false;
  if (convertedBlob.size > item.originalSize && !hasTransformations && targetFormat !== 'ico' && !isStripExif) {
    convertedBlob = item.file;
    originalFallback = true;
  } else if (originalFallback && !isStripExif) {
    convertedBlob = item.file;
  } else {
    originalFallback = false;
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
    if (item.status !== 'success') continue;

    try {
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
    } catch (itemErr) {
      console.error(`Skipping failed image ${item.file.name} in combined PDF generation:`, itemErr);
    }
  }

  if (!doc) throw new Error('No images successfully compiled into PDF');
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

export function applyBlurAndPixelateRegions(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  regions: Array<{ x: number; y: number; width: number; height: number }> | undefined,
  mode: 'blur' | 'pixelate' | undefined
) {
  if (!regions || regions.length === 0) return;
  const activeMode = mode || 'blur';

  for (const region of regions) {
    const rx = Math.round(region.x * canvasWidth);
    const ry = Math.round(region.y * canvasHeight);
    const rw = Math.round(region.width * canvasWidth);
    const rh = Math.round(region.height * canvasHeight);

    if (rw <= 0 || rh <= 0) continue;

    if (activeMode === 'blur') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();

      try {
        const tempCanvas = typeof OffscreenCanvas !== 'undefined'
          ? new OffscreenCanvas(rw, rh)
          : document.createElement('canvas');
        tempCanvas.width = rw;
        tempCanvas.height = rh;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(ctx.canvas, rx, ry, rw, rh, 0, 0, rw, rh);
          
          // Draw with blur filter
          ctx.filter = 'blur(16px)';
          ctx.drawImage(tempCanvas as any, rx, ry);
        }
      } catch (err) {
        // Fallback: draw directly
        ctx.filter = 'blur(16px)';
        ctx.drawImage(ctx.canvas, rx, ry, rw, rh, rx, ry, rw, rh);
      }
      ctx.restore();
    } else {
      // Pixelate
      ctx.save();
      try {
        const scale = 0.08; // 8% of original size
        const sw = Math.max(1, Math.round(rw * scale));
        const sh = Math.max(1, Math.round(rh * scale));

        const tempCanvas = typeof OffscreenCanvas !== 'undefined'
          ? new OffscreenCanvas(sw, sh)
          : document.createElement('canvas');
        tempCanvas.width = sw;
        tempCanvas.height = sh;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.imageSmoothingEnabled = false;
          tempCtx.drawImage(ctx.canvas, rx, ry, rw, rh, 0, 0, sw, sh);

          ctx.imageSmoothingEnabled = false;
          (ctx as any).mozImageSmoothingEnabled = false;
          (ctx as any).webkitImageSmoothingEnabled = false;
          (ctx as any).msImageSmoothingEnabled = false;

          ctx.drawImage(tempCanvas as any, 0, 0, sw, sh, rx, ry, rw, rh);
        }
      } catch (err) {
        console.error('Failed to pixelate region:', err);
      }
      ctx.restore();
    }
  }
}
