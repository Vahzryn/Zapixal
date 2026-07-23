import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { ConversionSettings, ImageDimensions, ImageFileItem, OutputFormat } from '../types';

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

/**
 * Load image elements safely with HEIC fallback support
 */
export async function loadImageElement(file: File): Promise<{
  img: HTMLImageElement;
  dimensions: ImageDimensions;
  objectUrl: string;
}> {
  let objectUrl: string;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'heic' || extension === 'heif' || file.type.includes('heic')) {
    try {
      // Dynamic import or usage of heic2any for client-side HEIC rendering
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/png',
      });
      const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      objectUrl = URL.createObjectURL(singleBlob);
    } catch (e) {
      console.warn('HEIC decoding fallback to direct object URL:', e);
      objectUrl = URL.createObjectURL(file);
    }
  } else {
    objectUrl = URL.createObjectURL(file);
  }

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
    img.onerror = (err) => {
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = objectUrl;
  });
}

/**
 * Calculate target aspect-ratio safe dimensions
 */
export function calculateTargetDimensions(
  original: ImageDimensions,
  maxWidth?: number,
  maxHeight?: number,
  keepAspectRatio: boolean = true
): ImageDimensions {
  if (!maxWidth && !maxHeight) {
    return original;
  }

  let { width, height } = original;

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

/**
 * Main function to convert an image item
 */
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

  // PDF export handling
  if (targetFormat === 'pdf') {
    const loaded = await loadImageElement(item.file);
    const targetDim = calculateTargetDimensions(
      loaded.dimensions,
      resize.maxWidth,
      resize.maxHeight,
      resize.keepAspectRatio
    );

    const doc = new jsPDF({
      orientation: targetDim.width > targetDim.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [targetDim.width, targetDim.height],
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetDim.width;
    canvas.height = targetDim.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    ctx.drawImage(loaded.img, 0, 0, targetDim.width, targetDim.height);
    const imgDataUrl = canvas.toDataURL('image/jpeg', Math.max(0.6, quality));

    doc.addImage(imgDataUrl, 'JPEG', 0, 0, targetDim.width, targetDim.height);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      blob: pdfBlob,
      convertedSize: pdfBlob.size,
      dimensions: targetDim,
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

  const canvas = document.createElement('canvas');
  canvas.width = targetDim.width;
  canvas.height = targetDim.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create HTML5 Canvas context');
  }

  // Smooth scaling settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Format specific canvas background fill (JPG/BMP need white background for non-transparent export)
  if (targetFormat === 'jpg' || targetFormat === 'bmp') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetDim.width, targetDim.height);
  }

  ctx.drawImage(loaded.img, 0, 0, targetDim.width, targetDim.height);

  let mimeType = 'image/jpeg';
  switch (targetFormat) {
    case 'webp':
      mimeType = 'image/webp';
      break;
    case 'avif':
      mimeType = 'image/avif';
      break;
    case 'jpg':
      mimeType = 'image/jpeg';
      break;
    case 'png':
      mimeType = 'image/png';
      break;
    case 'bmp':
      mimeType = 'image/bmp';
      break;
    case 'ico':
      mimeType = 'image/x-icon';
      break;
  }

  const convertedBlob = await new Promise<Blob>((resolve, reject) => {
    // ICO scaling check
    if (targetFormat === 'ico') {
      const icoCanvas = document.createElement('canvas');
      const icoDim = Math.min(256, Math.max(16, targetDim.width));
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
          // Fallback if browser doesn't natively support AVIF/BMP toBlob
          if (targetFormat === 'avif' || targetFormat === 'bmp') {
            canvas.toBlob(
              (fallbackBlob) =>
                fallbackBlob
                  ? resolve(fallbackBlob)
                  : reject(new Error(`${targetFormat.toUpperCase()} export not supported in this browser`)),
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

  const convertedUrl = URL.createObjectURL(convertedBlob);

  return {
    blob: convertedBlob,
    convertedSize: convertedBlob.size,
    dimensions: targetDim,
    convertedUrl,
  };
}

/**
 * Packaging multiple files into a single ZIP file for Bulk Export
 */
export async function createZipArchive(
  items: ImageFileItem[],
  targetFormat: OutputFormat
): Promise<Blob> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.convertedBlob) {
      const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const fileName = `${baseName}.${targetFormat}`;
      zip.file(fileName, item.convertedBlob);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Combine multiple converted image items into a single unified multi-page PDF document
 */
export async function createCombinedPdf(items: ImageFileItem[]): Promise<Blob> {
  if (items.length === 0) throw new Error('No items to export to PDF');

  let doc: jsPDF | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const loaded = await loadImageElement(item.file);
    const dim = loaded.dimensions;

    const orientation = dim.width > dim.height ? 'landscape' : 'portrait';

    if (i === 0) {
      doc = new jsPDF({
        orientation,
        unit: 'px',
        format: [dim.width, dim.height],
      });
    } else if (doc) {
      doc.addPage([dim.width, dim.height], orientation);
    }

    const canvas = document.createElement('canvas');
    canvas.width = dim.width;
    canvas.height = dim.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(loaded.img, 0, 0, dim.width, dim.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      doc?.addImage(dataUrl, 'JPEG', 0, 0, dim.width, dim.height);
    }
  }

  if (!doc) throw new Error('Failed to generate PDF document');
  return doc.output('blob');
}
