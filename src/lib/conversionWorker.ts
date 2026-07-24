self.onmessage = async (e) => {
  try {
    const { id, imageBitmap, settings, targetDim, rotation = 0 } = e.data;
    const { targetFormat, quality } = settings;

    const effectiveRotation = (rotation % 360 + 360) % 360;
    const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;

    const canvasWidth = isRotated90or270 ? targetDim.height : targetDim.width;
    const canvasHeight = isRotated90or270 ? targetDim.width : targetDim.height;

    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('OffscreenCanvas context 2d not supported');
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

      // Draw subtle text shadow/background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText(text, x + 1, y + 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(text, x, y);
    }

    // Immediately close ImageBitmap to release CPU/GPU memory in worker thread
    if (typeof imageBitmap.close === 'function') {
      imageBitmap.close();
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

    // toBlob is convertToBlob in OffscreenCanvas
    let blob = await canvas.convertToBlob({
      type: mimeType,
      quality: targetFormat === 'png' ? undefined : quality,
    });

    if (settings.targetMaxKB && settings.targetMaxKB > 0) {
      const maxBytes = settings.targetMaxKB * 1024;
      let currentQuality = quality;
      let step = 0;

      while (blob.size > maxBytes && currentQuality > 0.12 && step < 5) {
        step++;
        currentQuality = Math.max(0.1, currentQuality * 0.75);
        blob = await canvas.convertToBlob({
          type: mimeType,
          quality: currentQuality,
        });
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
          blob = await scaledCanvas.convertToBlob({
            type: mimeType,
            quality: currentQuality,
          });
          currentCanvas = scaledCanvas;
        }
        scale *= 0.8;
      }
    }

    self.postMessage({ id, status: 'success', blob });
  } catch (error: any) {
    self.postMessage({ id: e.data.id, status: 'error', error: error.message });
  }
};
