import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ConversionSettings, ImageFileItem } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function getExtensionFromMime(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    case 'image/bmp':
      return 'bmp';
    case 'image/x-icon':
    case 'image/vnd.microsoft.icon':
      return 'ico';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'jpg';
  }
}

export function formatOutputFilename(
  item: ImageFileItem,
  index: number,
  settings: ConversionSettings
): string {
  const originalName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
  const originalExt = item.file.name.split('.').pop()?.toLowerCase() || '';
  
  let ext: string = settings.targetFormat;
  if (item.blob) {
    ext = getExtensionFromMime(item.blob.type) as any;
  } else if (item.originalFallback && originalExt) {
    ext = originalExt as any;
  } else if (item.customTargetFormat) {
    ext = item.customTargetFormat;
  }
  
  if (ext === 'jpeg') ext = 'jpg';

  if (settings.renamePattern && settings.renamePattern.trim()) {
    const pattern = settings.renamePattern.trim();
    const dateStr = new Date().toISOString().split('T')[0];
    
    const idx = index + 1; // 1-based index
    const idx2 = String(idx).padStart(2, '0');
    const idx3 = String(idx).padStart(3, '0');

    let result = pattern
      .replace(/\{name\}/gi, originalName)
      .replace(/\{index3\}/gi, idx3)
      .replace(/\{00index\}/gi, idx3)
      .replace(/\{index2\}/gi, idx2)
      .replace(/\{0index\}/gi, idx2)
      .replace(/\{index\}/gi, String(idx))
      .replace(/\{date\}/gi, dateStr)
      .replace(/\{format\}/gi, ext)
      .replace(/\{ext\}/gi, ext);

    const prefix = settings.filenamePrefix || '';
    const suffix = settings.filenameSuffix || '';

    if (!result.toLowerCase().endsWith(`.${ext}`)) {
      result = `${prefix}${result}${suffix}.${ext}`;
    }
    return result;
  }

  const prefix = settings.filenamePrefix || '';
  const suffix = settings.filenameSuffix || '';
  return `${prefix}${originalName}${suffix}.${ext}`;
}

