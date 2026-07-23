export interface ImageDimensions {
  width: number;
  height: number;
}

export type TargetFormat = 'webp' | 'avif' | 'jpg' | 'png' | 'bmp' | 'ico' | 'pdf';

export interface ConversionSettings {
  targetFormat: TargetFormat;
  quality: number; // 0 to 1
  resize: {
    enabled: boolean;
    maxWidth?: number;
    maxHeight?: number;
    keepAspectRatio: boolean;
  };
  filenamePrefix: string;
  filenameSuffix: string;
}

export interface ImageFileItem {
  id: string;
  file: File;
  originalSize: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  blob?: Blob;
  convertedSize?: number;
  dimensions?: ImageDimensions;
  convertedUrl?: string;
  error?: string;
}
