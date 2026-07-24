import React, { useCallback, useState } from 'react';
import { Upload, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export function Dropzone({ onFilesAdded }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      
      const files = Array.from(e.dataTransfer.files).filter((file: File) => 
        file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic')
      );
      
      if (files.length > 0) {
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files).filter((file: File) => 
          file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic')
        );
        if (files.length > 0) {
          onFilesAdded(files);
        }
      }
    },
    [onFilesAdded]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full py-16 px-8 transition-all duration-200 border-2 border-dashed rounded-3xl cursor-pointer group bg-white dark:bg-[#303134]",
        isDragActive 
          ? "border-blue-500 bg-blue-50/20 dark:bg-[#8ab4f8]/10" 
          : "border-blue-200 dark:border-[#3c4043] hover:border-blue-400 dark:hover:border-[#8ab4f8]"
      )}
    >
      <input
        type="file"
        multiple
        accept="image/*,.heic"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-6 pointer-events-none w-full max-w-2xl text-center">
        {/* Icon Area */}
        <div className="relative mb-2">
          <div className="flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#1e293b] dark:to-[#28354f] text-blue-600 dark:text-[#8ab4f8] shadow-sm border border-blue-100/50 dark:border-[#384c6c]">
            <Upload className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white border-4 border-white dark:border-[#303134] shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
        </div>
        
        {/* Text */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 dark:text-[#e8eaed] mb-3 tracking-tight">
            Drop your images here, or <span className="text-blue-600 dark:text-[#8ab4f8] underline decoration-blue-200 dark:decoration-[#384c6c] hover:decoration-blue-400 underline-offset-4 transition-colors">browse files</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-base text-neutral-500 dark:text-[#9aa0a6] font-medium">
            <span>Free unlimited daily usage.</span>
            <span className="hidden sm:inline">•</span>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const items = await navigator.clipboard.read();
                  const files: File[] = [];
                  for (const item of items) {
                    for (const type of item.types) {
                      if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        files.push(new File([blob], `clipboard-image-${Date.now()}.${type.split('/')[1] || 'png'}`, { type }));
                      }
                    }
                  }
                  if (files.length > 0) onFilesAdded(files);
                } catch (err) {
                  console.warn('Clipboard direct read not permitted or empty:', err);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-blue-700 dark:text-[#8ab4f8] bg-blue-50 dark:bg-[#1e293b] hover:bg-blue-100 rounded-full border border-blue-200 dark:border-[#384c6c] transition-all cursor-pointer pointer-events-auto"
            >
              <span>📋 Paste from Clipboard (Ctrl+V)</span>
            </button>
          </div>
        </div>

        {/* Format Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-md">
          {['JPG', 'PNG', 'WEBP', 'AVIF', 'HEIC', 'SVG', 'BMP', 'PDF'].map(fmt => (
            <span key={fmt} className="px-3 py-1 text-[11px] font-extrabold tracking-wider bg-neutral-100 dark:bg-[#202124] text-neutral-500 dark:text-[#9aa0a6] rounded-lg border border-neutral-200 dark:border-[#3c4043] uppercase">
              {fmt}
            </span>
          ))}
        </div>

        {/* Features list */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6 pt-6 border-t border-neutral-100 dark:border-[#3c4043] w-full max-w-md">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-[#81c995]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero Server Uploads</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-[#8ab4f8]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Instant Local Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

