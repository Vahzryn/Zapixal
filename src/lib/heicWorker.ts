import heic2any from 'heic2any';

self.onmessage = async (e) => {
  try {
    const { file, id } = e.data;
    
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/png',
    });
    
    const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    self.postMessage({ id, status: 'success', blob: singleBlob });
  } catch (error: any) {
    self.postMessage({ id: e.data.id, status: 'error', error: error.message });
  }
};
