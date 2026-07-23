import React, { useRef, useState } from 'react';
import { Upload, ShieldCheck, Zap, FileImage, Sparkles, CheckCircle2 } from 'lucide-react';
import { SeoRouteInfo } from '../types';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  seoInfo: SeoRouteInfo;
  onQuickPresetSelect?: (format: 'webp' | 'avif' | 'jpg' | 'pdf') => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  seoInfo,
  onQuickPresetSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    { label: 'JPG', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    { label: 'PNG', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    { label: 'WEBP', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'AVIF', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'HEIC', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    { label: 'SVG', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    { label: 'BMP', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    { label: 'PDF', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Route Hero Heading */}
      <div className="text-center space-y-3 pt-2 sm:pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{seoInfo.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {seoInfo.h1}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          {seoInfo.subtitle}
        </p>
      </div>

      {/* Drag & Drop Hero Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-100/60 scale-[1.01] shadow-md'
            : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50/90 shadow-sm'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".jpg,.jpeg,.png,.webp,.avif,.heic,.heif,.svg,.bmp,.gif,image/*"
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform duration-200 shadow-xs">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
              <Zap className="w-3 h-3 fill-white" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Drop your images here, or{' '}
              <span className="text-blue-600 underline decoration-blue-400 underline-offset-4 font-extrabold">
                browse files
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Free unlimited daily usage. No batch limits.
            </p>
          </div>

          {/* Format Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {supportedFormats.map((fmt) => (
              <span
                key={fmt.label}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md border shadow-2xs ${fmt.bg}`}
              >
                {fmt.label}
              </span>
            ))}
          </div>

          {/* Privacy Guarantee Row */}
          <div className="pt-4 border-t border-slate-200/80 w-full max-w-md mx-auto flex items-center justify-center space-x-6 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Server Uploads</span>
            </div>
            <div className="flex items-center space-x-1.5 text-blue-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Instant Local Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Presets Bar */}
      {onQuickPresetSelect && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-semibold flex items-center space-x-1.5">
            <FileImage className="w-4 h-4 text-blue-600" />
            <span>Popular Quick Tasks:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onQuickPresetSelect('webp');
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 font-semibold transition-colors shadow-2xs"
            >
              WEBP (Smallest Web Size)
            </button>
            <button
              onClick={() => {
                onQuickPresetSelect('avif');
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 font-semibold transition-colors shadow-2xs"
            >
              AVIF (Next-Gen Speed)
            </button>
            <button
              onClick={() => {
                onQuickPresetSelect('jpg');
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 font-semibold transition-colors shadow-2xs"
            >
              JPG (Standard Photo)
            </button>
            <button
              onClick={() => {
                onQuickPresetSelect('pdf');
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 font-semibold transition-colors shadow-2xs"
            >
              PDF Document Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
