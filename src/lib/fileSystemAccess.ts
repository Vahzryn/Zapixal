/**
 * Zero-Copy File I/O & Direct Download System
 */

/**
 * Strategy A: Standard direct download via Object URL.
 * Immediately revokes to prevent memory leaks.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Cleanup immediately
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Strategy B: Native File System Access API
 * Streams output directly to user's hard drive without holding in RAM.
 */
export async function saveFileDirectly(blob: Blob, defaultName: string) {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultName,
        types: [{
          description: 'Images',
          accept: { [blob.type]: [`.${defaultName.split('.').pop()}`] },
        }],
      });
      
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('File System API Error:', err);
      }
      // Fallback
      return false;
    }
  }
  return false;
}

/**
 * Setup Global Clipboard Paste Listener
 */
export function setupClipboardPasteListener(onFilesPasted: (files: File[]) => void) {
  const handler = (e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      e.preventDefault();
      const files = Array.from(e.clipboardData.files);
      // Filter for images only
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        onFilesPasted(imageFiles);
      }
    }
  };
  
  window.addEventListener('paste', handler);
  return () => window.removeEventListener('paste', handler);
}
