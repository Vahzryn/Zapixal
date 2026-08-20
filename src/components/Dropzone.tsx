import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../lib/utils';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  fromFormat?: string;
  variant?: 'standard' | 'compact';
}

export function Dropzone({ onFilesAdded, fromFormat, variant = 'standard' }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [emptyFileMessage, setEmptyFileMessage] = useState<string | null>(null);

  const processFileList = useCallback(
    (rawFiles: File[]) => {
      setEmptyFileMessage(null);
      const validFiles: File[] = [];
      let emptyCount = 0;

      for (const f of rawFiles) {
        if (f.size === 0) {
          emptyCount++;
        } else {
          validFiles.push(f);
        }
      }

      if (emptyCount > 0) {
        setEmptyFileMessage(
          emptyCount === 1
            ? "This file is empty (0 bytes) and can't be processed."
            : `${emptyCount} files are empty (0 bytes) and can't be processed.`
        );
      }

      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    },
    [onFilesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      
      const getAllFilesFromEntries = async (dataTransferItemList: DataTransferItemList): Promise<File[]> => {
        const files: File[] = [];
        
        const readEntriesPromise = (dirReader: any) => {
          return new Promise<any[]>((resolve, reject) => {
            dirReader.readEntries(resolve, reject);
          });
        };

        const traverseFileTree = async (item: any, path?: string) => {
          path = path || "";
          if (item.isFile) {
            await new Promise<void>((resolve, reject) => {
              item.file((file: File) => {
                if (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic')) {
                  files.push(file);
                }
                resolve();
              }, reject);
            });
          } else if (item.isDirectory) {
            const dirReader = item.createReader();
            let entries: any[] = [];
            let readResult = await readEntriesPromise(dirReader);
            while(readResult.length > 0) {
              entries = entries.concat(readResult);
              readResult = await readEntriesPromise(dirReader);
            }
            for (const entry of entries) {
              await traverseFileTree(entry, path + item.name + "/");
            }
          }
        };

        const items = Array.from(dataTransferItemList);
        for (const item of items) {
          const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
          if (entry) {
            await traverseFileTree(entry);
          } else if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file && (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic'))) {
              files.push(file);
            }
          }
        }
        return files;
      };

      let files: File[] = [];
      if (e.dataTransfer.items) {
        files = await getAllFilesFromEntries(e.dataTransfer.items);
      } else {
        files = Array.from(e.dataTransfer.files).filter((file: File) => 
          file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic')
        );
      }
      
      if (files.length > 0) {
        processFileList(files);
      }
    },
    [processFileList]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files).filter((file: File) => 
          file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic')
        );
        if (files.length > 0) {
          processFileList(files);
        }
      }
    },
    [processFileList]
  );

  if (variant === 'compact') {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "dropzone-cls-guard min-h-[96px] sm:min-h-[104px] relative flex items-center justify-between w-full py-3.5 px-4 sm:px-6 transition-all duration-150 border-2 border-dashed rounded-2xl cursor-pointer group bg-white/70 dark:bg-[#1e2024]/70 hover:bg-white dark:hover:bg-[#1e2024] active:scale-[0.998]",
          isDragActive 
            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30" 
            : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
        )}
      >
        <input
          type="file"
          id="file-upload-input"
          aria-label="Upload files or drop them here"
          multiple
          accept="image/*,.heic"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="flex items-center gap-3.5 pointer-events-none w-full">
          {/* Upload Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-xs flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-colors shrink-0">
            <Upload className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>

          {/* Prompt text */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white tracking-tight truncate">
              Drop files to get started, or <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2 font-bold">browse local files</span>
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              Batch processing · Local browser memory · Paste from clipboard (Ctrl+V)
            </p>
          </div>

          {/* Format Chips on Desktop */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {['HEIC', 'PNG', 'JPG', 'WEBP', 'AVIF', 'SVG'].map((fmt) => (
              <span key={fmt} className="px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 rounded">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* Empty file warning */}
        {emptyFileMessage && (
          <div className="absolute top-2 right-2 pointer-events-auto px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-200 z-20 flex items-center gap-1.5 shadow-xs">
            <span>⚠️ {emptyFileMessage}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEmptyFileMessage(null);
              }}
              className="ml-1 px-1 rounded hover:bg-amber-200/50 dark:hover:bg-amber-800/50 cursor-pointer"
              aria-label="Dismiss warning"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "dropzone-cls-guard min-h-[220px] sm:min-h-[260px] md:min-h-[300px] relative flex flex-col items-center justify-center w-full py-8 px-4 sm:px-8 transition-all duration-150 border-2 border-dashed rounded-2xl cursor-pointer group bg-neutral-50/50 hover:bg-neutral-50 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/60 active:scale-[0.998]",
        isDragActive 
          ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20" 
          : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
      )}
    >
      <input
        type="file"
        id="file-upload-input"
        aria-label="Upload image files or drop them here"
        multiple
        accept="image/*,.heic"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center gap-3 pointer-events-none w-full max-w-lg text-center">
        {/* Upload Icon */}
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <Upload className="w-5 h-5" />
        </div>
        
        {/* Empty file warning */}
        {emptyFileMessage && (
          <div className="pointer-events-auto px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-200 z-20 flex items-center gap-1.5">
            <span>⚠️ {emptyFileMessage}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEmptyFileMessage(null);
              }}
              className="ml-1 px-1 rounded hover:bg-amber-200/50 dark:hover:bg-amber-800/50 cursor-pointer"
              aria-label="Dismiss warning"
            >
              ✕
            </button>
          </div>
        )}

        {/* Primary Prompt */}
        <div className="space-y-1.5">
          <p className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">
            Drop {fromFormat ? <span className="uppercase text-blue-600 dark:text-blue-400">{fromFormat}</span> : "images"} here, or <span className="text-blue-600 dark:text-blue-400 underline underline-offset-4 font-bold">choose files</span>
          </p>
          
          {/* Format Badges */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-0.5">
            {(fromFormat ? [fromFormat.toUpperCase()] : ['HEIC', 'PNG', 'JPG', 'WEBP', 'AVIF', 'SVG']).map((fmt) => (
              <span key={fmt} className="px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md tracking-wide">
                {fmt}
              </span>
            ))}
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
            {fromFormat 
              ? `Convert your ${fromFormat.toUpperCase()} files locally in browser memory`
              : "Batch selection supported · Paste from clipboard (Ctrl+V)"
            }
          </p>
        </div>
      </div>
    </div>
  );
}

