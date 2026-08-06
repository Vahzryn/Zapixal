import heic2any from 'heic2any';

self.onmessage = async (e: MessageEvent) => {
  const { id, file } = e.data;

  try {
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8,
    });

    const blob = Array.isArray(result) ? result[0] : result;
    const buffer = await blob.arrayBuffer();

    // Post message with transfer list
    (self as any).postMessage({ id, status: 'success', buffer, mimeType: 'image/jpeg' }, [buffer]);
  } catch (error: any) {
    (self as any).postMessage({ id, status: 'error', error: error?.message || 'HEIC decoding failed' });
  }
};
