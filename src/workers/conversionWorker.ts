import { encodeJpeg, encodePng, encodeWebp, encodeAvif, encodeBmp, encodeIco, injectDpiMetadata } from '../lib/codecs';
import { getCropSourceRect } from '../lib/conversionOrchestrator';

self.onmessage = async (e: MessageEvent) => {
  const { id, imageBitmap, settings, targetDim, rotation = 0, originalSize = 0, blurRegions, blurMode } = e.data;

  try {
    const { targetFormat, quality } = settings;
    const effectiveRotation = ((rotation % 360) + 360) % 360;
    const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;

    const canvasWidth = targetDim.width;
    const canvasHeight = targetDim.height;

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

    const cropSource = getCropSourceRect(imageBitmap.width, imageBitmap.height, effectiveRotation, settings.cropAspectRatio);

    if (effectiveRotation !== 0) {
      const drawW = isRotated90or270 ? canvasHeight : canvasWidth;
      const drawH = isRotated90or270 ? canvasWidth : canvasHeight;
      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((effectiveRotation * Math.PI) / 180);
      ctx.drawImage(
        imageBitmap,
        cropSource.cropX,
        cropSource.cropY,
        cropSource.cropWidth,
        cropSource.cropHeight,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        imageBitmap,
        cropSource.cropX,
        cropSource.cropY,
        cropSource.cropWidth,
        cropSource.cropHeight,
        0,
        0,
        canvasWidth,
        canvasHeight
      );
    }

    applyBlurAndPixelateRegions(ctx, canvasWidth, canvasHeight, blurRegions, blurMode);

    if (settings.grayscale) {
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
      let pngBytes = await encodePng(imgData, quality, originalSize, canvas);
      if (settings.targetDPI && settings.targetDPI > 0) {
        pngBytes = injectDpiMetadata(pngBytes, 'png', settings.targetDPI);
      }
      blob = new Blob([pngBytes.buffer], { type: 'image/png' });
    } else if (targetFormat === 'jpg') {
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      let jpegBytes = await encodeJpeg(imgData, quality, canvas);
      if (settings.targetDPI && settings.targetDPI > 0) {
        jpegBytes = injectDpiMetadata(jpegBytes, 'jpg', settings.targetDPI);
      }
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

      // 1. First degrade quality
      while (blob.size > maxBytes && currentQuality > 0.12 && step < 10) {
        step++;
        currentQuality = Math.max(0.1, currentQuality * 0.75);
        if (targetFormat === 'jpg') {
          const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          let bytes = await encodeJpeg(imgData, currentQuality, canvas);
          if (settings.targetDPI && settings.targetDPI > 0) {
            bytes = injectDpiMetadata(bytes, 'jpg', settings.targetDPI);
          }
          blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
        } else if (targetFormat === 'png') {
          const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          let bytes = await encodePng(imgData, currentQuality, originalSize, canvas);
          if (settings.targetDPI && settings.targetDPI > 0) {
            bytes = injectDpiMetadata(bytes, 'png', settings.targetDPI);
          }
          blob = new Blob([bytes.buffer], { type: 'image/png' });
        } else if (targetFormat === 'webp') {
          blob = await encodeWebp(canvas, currentQuality);
        } else if (targetFormat === 'avif') {
          blob = await encodeAvif(canvas, currentQuality);
        } else {
          break;
        }
      }

      // 2. Then scale down dimensions if still too big
      let currentCanvas: OffscreenCanvas = canvas;
      let scale = 0.85;
      while (blob.size > maxBytes && scale > 0.15 && step < 15) {
        step++;
        const w = Math.max(16, Math.round(canvasWidth * scale));
        const h = Math.max(16, Math.round(canvasHeight * scale));
        const scaledCanvas = new OffscreenCanvas(w, h);
        const sCtx = scaledCanvas.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(currentCanvas, 0, 0, w, h);
          if (targetFormat === 'jpg') {
            const imgData = sCtx.getImageData(0, 0, w, h);
            let bytes = await encodeJpeg(imgData, currentQuality, scaledCanvas);
            if (settings.targetDPI && settings.targetDPI > 0) {
              bytes = injectDpiMetadata(bytes, 'jpg', settings.targetDPI);
            }
            blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
          } else if (targetFormat === 'png') {
            const imgData = sCtx.getImageData(0, 0, w, h);
            let bytes = await encodePng(imgData, currentQuality, originalSize, scaledCanvas);
            if (settings.targetDPI && settings.targetDPI > 0) {
              bytes = injectDpiMetadata(bytes, 'png', settings.targetDPI);
            }
            blob = new Blob([bytes.buffer], { type: 'image/png' });
          } else if (targetFormat === 'webp') {
            blob = await encodeWebp(scaledCanvas, currentQuality);
          } else if (targetFormat === 'avif') {
            blob = await encodeAvif(scaledCanvas, currentQuality);
          } else if (targetFormat === 'bmp') {
            blob = await encodeBmp(scaledCanvas);
          }
          currentCanvas = scaledCanvas;
        }
        scale *= 0.8;
      }
    }

    const hasTransformations =
      effectiveRotation !== 0 ||
      (settings.resize && settings.resize.enabled) ||
      (settings.watermarkText && settings.watermarkText.trim() !== '') ||
      !!settings.grayscale;

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

function applyBlurAndPixelateRegions(
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
