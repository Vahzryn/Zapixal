with open("src/lib/imageProcessor.ts", "r") as f:
    content = f.read()

old_load = """export async function loadImageElement(file: File): Promise<{
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
}"""

new_load = """// HEIC Worker singleton
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
    // createImageBitmap is much faster and offloads decoding from main thread
    const imgBitmap = await createImageBitmap(targetFile);
    return {
      img: imgBitmap,
      dimensions: { width: imgBitmap.width, height: imgBitmap.height },
      objectUrl,
    };
  } catch (err) {
    // Fallback to Image element
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
}"""

content = content.replace(old_load, new_load)
with open("src/lib/imageProcessor.ts", "w") as f:
    f.write(content)
