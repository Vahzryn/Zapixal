import heic2any from 'heic2any';

self.onmessage = async (e) => {
  try {
    const { id, file } = e.data;
    
    // heic2any returns either a Blob or an array of Blobs
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8
    });
    
    const blob = Array.isArray(result) ? result[0] : result;
    
    self.postMessage({ id, status: 'success', blob });
  } catch (error: any) {
    self.postMessage({ id: e.data.id, status: 'error', error: error.message });
  }
};
