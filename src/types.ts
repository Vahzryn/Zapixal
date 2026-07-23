export type OutputFormat = 'webp' | 'avif' | 'jpg' | 'png' | 'bmp' | 'ico' | 'pdf';

export type InputFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'heic' | 'heif' | 'svg' | 'bmp' | 'gif';

export type ViewState = 'zero' | 'workspace' | 'success';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ResizeSettings {
  enabled: boolean;
  maxWidth?: number;
  maxHeight?: number;
  keepAspectRatio: boolean;
}

export interface ConversionSettings {
  targetFormat: OutputFormat;
  quality: number; // 0.1 to 1.0 (or 10 to 100)
  resize: ResizeSettings;
  presetName?: 'custom' | 'web70' | 'balanced85' | 'max100';
}

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalType: string;
  originalExtension: string;
  previewUrl: string;
  dimensions?: ImageDimensions;
  
  // Status tracking
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number; // 0 to 100
  errorMessage?: string;
  
  // Result data
  convertedBlob?: Blob;
  convertedUrl?: Blob | string;
  convertedSize?: number;
  convertedDimensions?: ImageDimensions;
  convertedFormat?: OutputFormat;
}

export interface SeoRouteInfo {
  path: string;
  targetFormat?: OutputFormat;
  title: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  badge: string;
  faqs: { question: string; answer: string }[];
}
