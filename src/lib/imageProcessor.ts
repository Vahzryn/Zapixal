import { ConversionSettings, ImageDimensions, ImageFileItem, TargetFormat } from '../types';

/**
 * Format helper for readable file size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Helper to calculate percentage savings
 */
export function calculateSavings(originalSize: number, convertedSize: number): {
  bytesSaved: number;
  percentage: number;
  isSmaller: boolean;
} {
  const diff = originalSize - convertedSize;
  const percentage = Math.round((diff / originalSize) * 100);
  return {
    bytesSaved: diff,
    percentage: Math.abs(percentage),
    isSmaller: diff > 0,
  };
}

// HEIC Worker singleton
let heicWorker: Worker | null = null;
let heicTaskId = 0;
const heicResolvers = new Map<number, { resolve: (b: Blob) => void, reject: (e: any) => void }>();

function getHeicWorker() {
  if (!heicWorker) {
    heicWorker = new Worker(new URL('./heicWorker', import.meta.url), { type: 'module' });
    heicWorker.onmessage = (e) => {
      const { id, status, blob, error } = e.data;
      const resolvers = heicResolvers.get(id);
      if (resolvers) {
        if (status === 'success') resolvers.resolve(blob);
        else resolvers.reject(new Error(error));
        heicResolvers.delete(id);
      }
    };
  }
  return heicWorker;
}

export async function loadImageElement(file: File): Promise<{
  img: ImageBitmap | HTMLImageElement;
  dimensions: ImageDimensions;
  objectUrl: string;
}> {
  let objectUrl: string;
  let targetFile: File | Blob = file;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'heic' || extension === 'heif' || file.type.includes('heic')) {
    try {
      const worker = getHeicWorker();
      const id = heicTaskId++;
      targetFile = await new Promise<Blob>((resolve, reject) => {
        heicResolvers.set(id, { resolve, reject });
        worker.postMessage({ id, file });
      });
      objectUrl = URL.createObjectURL(targetFile);
    } catch (e) {
      console.warn('HEIC decoding fallback to direct object URL:', e);
      objectUrl = URL.createObjectURL(file);
    }
  } else {
    objectUrl = URL.createObjectURL(file);
  }

  try {
    const imgBitmap = await createImageBitmap(targetFile);
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
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
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

  // Thermal & OOM Safeguard: Absolute safe dimension bounds for HTML Canvas (especially for iOS Safari limit of ~256MB)
  const isMobile = typeof navigator !== 'undefined' && (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768);
  const MAX_SAFE_DIM = isMobile ? 8192 : 16384; 
  if (width > MAX_SAFE_DIM || height > MAX_SAFE_DIM) {
    const safetyRatio = Math.min(MAX_SAFE_DIM / width, MAX_SAFE_DIM / height);
    width = Math.round(width * safetyRatio);
    height = Math.round(height * safetyRatio);
  }

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

export async function convertSingleImage(
  item: ImageFileItem,
  settings: ConversionSettings
): Promise<{
  blob: Blob;
  convertedSize: number;
  dimensions: ImageDimensions;
  convertedUrl: string;
}> {
  const { targetFormat, quality, resize } = settings;
  const effectiveRotation = (((settings.rotation || 0) + (item.rotation || 0)) % 360 + 360) % 360;
  const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;

  // PDF export handling
  if (targetFormat === 'pdf') {
    const loaded = await loadImageElement(item.file);
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

    if (loaded.img instanceof ImageBitmap) {
      loaded.img.close(); // Immediate memory release
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
  }

  // Standard Image Canvas conversion (WEBP, AVIF, JPG, PNG, BMP, ICO)
  const loaded = await loadImageElement(item.file);
  const targetDim = calculateTargetDimensions(
    loaded.dimensions,
    resize.enabled ? resize.maxWidth : undefined,
    resize.enabled ? resize.maxHeight : undefined,
    resize.keepAspectRatio
  );

  const canvasWidth = isRotated90or270 ? targetDim.height : targetDim.width;
  const canvasHeight = isRotated90or270 ? targetDim.width : targetDim.height;

  let convertedBlob: Blob;

  // Try OffscreenCanvas Web Worker approach if supported and we have an ImageBitmap
  if (typeof OffscreenCanvas !== 'undefined' && loaded.img instanceof ImageBitmap && targetFormat !== 'ico') {
    convertedBlob = await new Promise<Blob>((resolve, reject) => {
      const worker = new Worker(new URL('./conversionWorker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => {
        if (e.data.status === 'success') resolve(e.data.blob);
        else reject(new Error(e.data.error));
        worker.terminate();
      };
      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };
      
      worker.postMessage({
        id: item.id,
        imageBitmap: loaded.img,
        settings,
        targetDim,
        rotation: effectiveRotation
      }, [loaded.img]); // Transfer ownership of ImageBitmap to worker for zero-copy
    });
  } else {
    // Fallback to Main Thread Canvas (for ICO or if OffscreenCanvas/ImageBitmap not supported)
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create HTML5 Canvas context');
    }

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
      ctx.drawImage(loaded.img as CanvasImageSource, -targetDim.width / 2, -targetDim.height / 2, targetDim.width, targetDim.height);
      ctx.restore();
    } else {
      ctx.drawImage(loaded.img as CanvasImageSource, 0, 0, targetDim.width, targetDim.height);
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

    if (loaded.img instanceof ImageBitmap) {
      loaded.img.close(); // Immediate memory release
    }

    let mimeType = 'image/jpeg';
    switch (targetFormat) {
      case 'webp': mimeType = 'image/webp'; break;
      case 'avif': mimeType = 'image/avif'; break;
      case 'jpg': mimeType = 'image/jpeg'; break;
      case 'png': mimeType = 'image/png'; break;
      case 'bmp': mimeType = 'image/bmp'; break;
      case 'ico': mimeType = 'image/x-icon'; break;
    }

    convertedBlob = await new Promise<Blob>((resolve, reject) => {
      if (targetFormat === 'ico') {
        const icoCanvas = document.createElement('canvas');
        const icoDim = Math.min(256, Math.max(16, canvasWidth));
        icoCanvas.width = icoDim;
        icoCanvas.height = icoDim;
        const icoCtx = icoCanvas.getContext('2d');
        if (icoCtx) {
          icoCtx.drawImage(canvas, 0, 0, icoDim, icoDim);
          icoCanvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('ICO export failed'))),
            'image/x-icon'
          );
          return;
        }
      }

      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            if (targetFormat === 'avif' || targetFormat === 'bmp') {
              canvas.toBlob(
                (fallbackBlob) =>
                  fallbackBlob
                    ? resolve(fallbackBlob)
                    : reject(new Error(`${targetFormat.toUpperCase()} export not supported`)),
                'image/webp',
                quality
              );
            } else {
              reject(new Error('Canvas export failed'));
            }
          }
        },
        mimeType,
        targetFormat === 'png' ? undefined : quality
      );
    });

    if (settings.targetMaxKB && settings.targetMaxKB > 0 && convertedBlob) {
      const maxBytes = settings.targetMaxKB * 1024;
      if (convertedBlob.size > maxBytes) {
        let currentQuality = quality;
        let tempBlob = convertedBlob;
        let step = 0;
        while (tempBlob.size > maxBytes && currentQuality > 0.12 && step < 5) {
          step++;
          currentQuality = Math.max(0.1, currentQuality * 0.75);
          const res = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, mimeType, currentQuality);
          });
          if (res) tempBlob = res;
        }
        convertedBlob = tempBlob;
      }
    }
  }

  const convertedUrl = URL.createObjectURL(convertedBlob);

  return {
    blob: convertedBlob,
    convertedSize: convertedBlob.size,
    dimensions: { width: canvasWidth, height: canvasHeight },
    convertedUrl,
  };
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

      if (loaded.img instanceof ImageBitmap) {
        loaded.img.close(); // Immediate memory release
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      doc?.addImage(dataUrl, 'JPEG', 0, 0, canvasWidth, canvasHeight);
    }
  }

  if (!doc) throw new Error('No images available for PDF compile');
  return doc.output('blob');
}