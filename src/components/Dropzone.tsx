import React, { useCallback, useState } from 'react';
import { Upload, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  fromFormat?: string;
}

export function Dropzone({ onFilesAdded, fromFormat }: DropzoneProps) {
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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "dropzone-cls-guard min-h-[180px] min-[360px]:min-h-[200px] md:min-h-[250px] lg:min-h-[280px] xl:min-h-[320px] relative flex flex-col items-center justify-center w-full py-4 md:py-6 lg:py-8 xl:py-10 px-3 sm:px-6 lg:px-8 transition-all duration-200 border-2 border-dashed rounded-3xl cursor-pointer group bg-white dark:bg-[#303134] active:bg-blue-50/30 dark:active:bg-[#1e293b]/30 [contain:layout]",
        isDragActive 
          ? "border-blue-500 bg-blue-50/20 dark:bg-[#8ab4f8]/10" 
          : "border-slate-300 dark:border-[#3c4043] hover:border-blue-400 dark:hover:border-[#8ab4f8]"
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
      <div className="flex flex-col items-center gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 pointer-events-none w-full max-w-2xl text-center">
        {/* Icon Area */}
        <div className="relative mb-0.5 sm:mb-1">
          <div className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 lg:w-18 lg:h-18 xl:w-20 xl:h-20 rounded-xl sm:rounded-2xl lg:rounded-[1.75rem] xl:rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#1e293b] dark:to-[#28354f] text-blue-600 dark:text-[#8ab4f8] shadow-2xs border border-blue-100/50 dark:border-[#384c6c]">
            <Upload className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white border sm:border-2 lg:border-4 border-white dark:border-[#303134] shadow-2xs">
            <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 fill-current" />
          </div>
        </div>
        
        {/* Text */}
        <div className="flex flex-col items-center w-full">
          {emptyFileMessage && (
            <div className="pointer-events-auto mb-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 rounded-xl flex items-center gap-1.5 text-[11px] sm:text-sm font-bold text-amber-900 dark:text-amber-100 shadow-2xs animate-fade-in z-20">
              <span className="shrink-0 text-amber-600 dark:text-amber-400">⚠️</span>
              <span>{emptyFileMessage}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEmptyFileMessage(null);
                }}
                className="ml-1.5 px-1 py-0.5 rounded-md hover:bg-amber-200/60 dark:hover:bg-amber-800/60 text-amber-800 dark:text-amber-200"
                aria-label="Dismiss message"
              >
                ✕
              </button>
            </div>
          )}

          <h2 className="text-xs min-[360px]:text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-neutral-800 dark:text-[#e8eaed] mb-1 sm:mb-2 tracking-tight leading-snug px-1">
            Drop {fromFormat ? <span className="uppercase text-blue-600 dark:text-[#8ab4f8]">{fromFormat}</span> : "images"} here, or <span className="text-blue-600 dark:text-[#8ab4f8] underline decoration-blue-200 dark:decoration-[#384c6c] hover:decoration-blue-400 underline-offset-4 transition-colors font-black">browse files</span>
          </h2>

          {/* Format Badges */}
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 md:mt-2 mb-1">
            {(fromFormat ? [fromFormat.toUpperCase()] : ['HEIC', 'PNG', 'JPG', 'WebP', 'AVIF']).map((fmt) => (
              <span key={fmt} className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 text-[8px] min-[360px]:text-[9px] sm:text-[10px] md:text-[11px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100/80 dark:bg-[#202124] border border-neutral-200/80 dark:border-[#3c4043] rounded uppercase tracking-wider shadow-2xs">
                {fmt}
              </span>
            ))}
          </div>

          {/* Mobile Tap Button CTA */}
          <div className="mt-1 mb-1 sm:hidden">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black text-white bg-blue-600 dark:bg-[#8ab4f8] dark:text-[#202124] rounded-full shadow-2xs">
              <Upload className="w-3 h-3" />
              <span>Select Photos</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] min-[360px]:text-[10px] sm:text-xs md:text-sm lg:text-base text-neutral-500 dark:text-[#9aa0a6] font-medium mt-0.5">
            <span>Free local conversion</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] min-[360px]:text-[10px] font-bold text-blue-700 dark:text-[#8ab4f8] bg-blue-50 dark:bg-[#1e293b] rounded-md border border-blue-200 dark:border-[#384c6c]">
              <span>📋 Paste (Ctrl+V)</span>
            </span>
          </div>
        </div>

        {/* Features list */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 md:gap-6 lg:gap-8 mt-1.5 sm:mt-4 md:mt-5 lg:mt-6 pt-1.5 sm:pt-4 md:pt-5 lg:pt-6 border-t border-neutral-100 dark:border-[#3c4043] w-full max-w-md">
          <div className="flex items-center gap-1 text-[9px] min-[360px]:text-[10px] sm:text-xs md:text-sm font-bold text-emerald-700 dark:text-[#81c995]">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Secure Local Privacy</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] min-[360px]:text-[10px] sm:text-xs md:text-sm font-bold text-blue-700 dark:text-[#8ab4f8]">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Local Processing (No Upload)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

