export interface ImageDimensions {
  width: number;
  height: number;
}

export type TargetFormat = 'webp' | 'avif' | 'jpg' | 'png' | 'bmp' | 'ico' | 'pdf';

export interface ConversionSettings {
  targetFormat: TargetFormat;
  quality: number; // 0 to 1
  targetMaxKB?: number; // Target size under X KB
  resize: {
    enabled: boolean;
    maxWidth?: number;
    maxHeight?: number;
    keepAspectRatio: boolean;
  };
  filenamePrefix: string;
  filenameSuffix: string;
  renamePattern?: string;
  rotation?: number; // 0, 90, 180, 270
  stripExif?: boolean;
  watermarkText?: string;
}

export interface ImageFileItem {
  id: string;
  file: File;
  originalSize: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  rotation?: number; // 0, 90, 180, 270
  blob?: Blob;
  convertedSize?: number;
  dimensions?: ImageDimensions;
  convertedUrl?: string;
  error?: string;
}
