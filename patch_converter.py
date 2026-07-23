with open("src/lib/imageProcessor.ts", "r") as f:
    content = f.read()

old_code = """  // Standard Image Canvas conversion (WEBP, AVIF, JPG, PNG, BMP, ICO)
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
  });"""

new_code = """  // Standard Image Canvas conversion (WEBP, AVIF, JPG, PNG, BMP, ICO)
  const loaded = await loadImageElement(item.file);
  const targetDim = calculateTargetDimensions(
    loaded.dimensions,
    resize.enabled ? resize.maxWidth : undefined,
    resize.enabled ? resize.maxHeight : undefined,
    resize.keepAspectRatio
  );

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
        targetDim
      }, [loaded.img]); // Transfer ownership of ImageBitmap to worker for zero-copy
    });
  } else {
    // Fallback to Main Thread Canvas (for ICO or if OffscreenCanvas/ImageBitmap not supported)
    const canvas = document.createElement('canvas');
    canvas.width = targetDim.width;
    canvas.height = targetDim.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create HTML5 Canvas context');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (targetFormat === 'jpg' || targetFormat === 'bmp') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetDim.width, targetDim.height);
    }

    ctx.drawImage(loaded.img, 0, 0, targetDim.width, targetDim.height);

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
  }"""

content = content.replace(old_code, new_code)
with open("src/lib/imageProcessor.ts", "w") as f:
    f.write(content)

