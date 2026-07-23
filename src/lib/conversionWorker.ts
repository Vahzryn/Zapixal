self.onmessage = async (e) => {
  try {
    const { id, imageBitmap, settings, targetDim } = e.data;
    const { targetFormat, quality } = settings;

    const canvas = new OffscreenCanvas(targetDim.width, targetDim.height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('OffscreenCanvas context 2d not supported');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (targetFormat === 'jpg' || targetFormat === 'bmp') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetDim.width, targetDim.height);
    }

    ctx.drawImage(imageBitmap, 0, 0, targetDim.width, targetDim.height);

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
    const blob = await canvas.convertToBlob({
      type: mimeType,
      quality: targetFormat === 'png' ? undefined : quality,
    });

    self.postMessage({ id, status: 'success', blob });
  } catch (error: any) {
    self.postMessage({ id: e.data.id, status: 'error', error: error.message });
  }
};
