import { encodeJpeg, encodePng, encodeWebp, encodeAvif, encodeBmp, encodeIco } from '../lib/codecs';

self.onmessage = async (e: MessageEvent) => {
  const { id, imageBitmap, settings, targetDim, rotation = 0, originalSize = 0 } = e.data;

  try {
    const { targetFormat, quality } = settings;
    const effectiveRotation = ((rotation % 360) + 360) % 360;
    const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;

    const canvasWidth = isRotated90or270 ? targetDim.height : targetDim.width;
    const canvasHeight = isRotated90or270 ? targetDim.width : targetDim.height;

    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('OffscreenCanvas 2D context not supported');
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
      ctx.drawImage(imageBitmap, -targetDim.width / 2, -targetDim.height / 2, targetDim.width, targetDim.height);
      ctx.restore();
    } else {
      ctx.drawImage(imageBitmap, 0, 0, targetDim.width, targetDim.height);
    }

    if (settings.watermarkText && settings.watermarkText.trim()) {
      const text = settings.watermarkText.trim();
      const fontSize = Math.max(14, Math.round(targetDim.height * 0.04));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      const padding = Math.max(12, Math.round(fontSize * 0.8));
      const x = targetDim.width - padding;
      const y = targetDim.height - padding;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText(text, x + 1, y + 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(text, x, y);
    }

    // Close early if possible to free GPU/CPU memory
    if (imageBitmap && typeof imageBitmap.close === 'function') {
      try { imageBitmap.close(); } catch (e) {}
    }

    let blob: Blob;

    if (targetFormat === 'ico') {
      blob = await encodeIco(canvas);
    } else if (targetFormat === 'png') {
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const pngBytes = await encodePng(imgData, quality, originalSize, canvas);
      blob = new Blob([pngBytes.buffer], { type: 'image/png' });
    } else if (targetFormat === 'jpg') {
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const jpegBytes = await encodeJpeg(imageDataToData(imgData), quality, canvas);
      blob = new Blob([jpegBytes.buffer], { type: 'image/jpeg' });
    } else if (targetFormat === 'webp') {
      blob = await encodeWebp(canvas, quality);
    } else if (targetFormat === 'avif') {
      blob = await encodeAvif(canvas, quality);
    } else if (targetFormat === 'bmp') {
      blob = await encodeBmp(canvas);
    } else {
      blob = await encodeWebp(canvas, quality);
    }

    // targetMaxKB reduction loop if required
    if (settings.targetMaxKB && settings.targetMaxKB > 0 && targetFormat !== 'ico') {
      const maxBytes = settings.targetMaxKB * 1024;
      let currentQuality = quality;
      let step = 0;

      while (blob.size > maxBytes && currentQuality > 0.12 && step < 5) {
        step++;
        currentQuality = Math.max(0.1, currentQuality * 0.75);
        if (targetFormat === 'jpg') {
          const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          const bytes = await encodeJpeg(imgData, currentQuality, canvas);
          blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
        } else if (targetFormat === 'webp' || targetFormat === 'png') {
          blob = await encodeWebp(canvas, currentQuality);
        } else if (targetFormat === 'avif') {
          blob = await encodeAvif(canvas, currentQuality);
        }
      }

      let currentCanvas = canvas;
      let scale = 0.85;
      while (blob.size > maxBytes && scale > 0.25 && step < 8) {
        step++;
        const w = Math.max(32, Math.round(canvasWidth * scale));
        const h = Math.max(32, Math.round(canvasHeight * scale));
        const scaledCanvas = new OffscreenCanvas(w, h);
        const sCtx = scaledCanvas.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(currentCanvas, 0, 0, w, h);
          if (targetFormat === 'jpg') {
            const imgData = sCtx.getImageData(0, 0, w, h);
            const bytes = await encodeJpeg(imgData, currentQuality, scaledCanvas);
            blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
          } else {
            blob = await encodeWebp(scaledCanvas, currentQuality);
          }
          currentCanvas = scaledCanvas;
        }
        scale *= 0.8;
      }
    }

    const hasTransformations =
      effectiveRotation !== 0 ||
      (settings.resize && settings.resize.enabled) ||
      (settings.watermarkText && settings.watermarkText.trim() !== '');

    let originalFallback = false;
    if (originalSize > 0 && blob.size > originalSize && !hasTransformations && targetFormat !== 'ico') {
      originalFallback = true;
    }

    const buffer = await blob.arrayBuffer();
    // Post back with transfer list for zero-copy
    (self as any).postMessage({ id, status: 'success', buffer, mimeType: blob.type, originalFallback }, [buffer]);
  } catch (error: any) {
    (self as any).postMessage({ id, status: 'error', error: error?.message || 'Conversion error' });
  } finally {
    if (imageBitmap && typeof imageBitmap.close === 'function') {
      try {
        imageBitmap.close();
      } catch (closeErr) {
        console.warn('Failed to close imageBitmap in worker finally:', closeErr);
      }
    }
  }
};

function imageDataToData(imgData: ImageData): ImageData {
  return imgData;
}
