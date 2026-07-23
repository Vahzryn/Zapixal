import React from 'react';
import { ImageFileItem } from '../types';
import { formatBytes } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Download, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileItemProps {
  item: ImageFileItem;
  onRemove: (id: string) => void;
  onDownload: (item: ImageFileItem) => void;
}

export function FileItem({ item, onRemove, onDownload }: FileItemProps) {
  const isComplete = item.status === 'success';
  const isError = item.status === 'error';
  const isProcessing = item.status === 'processing';

  const compressionRatio = (item.convertedSize && item.originalSize)
    ? Math.round((1 - item.convertedSize / item.originalSize) * 100)
    : 0;

  return (
    <div className={cn(
      "flex items-center justify-between p-3 transition-all bg-white dark:bg-[#303134] border-2 rounded-2xl group shadow-sm",
      isError 
        ? "border-red-200 dark:border-[#5c2828] bg-red-50/50 dark:bg-[#2c1a1a]" 
        : isComplete 
        ? "border-emerald-100 dark:border-[#2d523c] hover:border-emerald-200 dark:hover:border-[#3c6d50] bg-emerald-50/30 dark:bg-[#1a2c20]/50" 
        : "border-neutral-200 dark:border-[#3c4043] hover:border-blue-200 dark:hover:border-[#8ab4f8]/50"
    )}>
      <div className="flex items-center flex-1 min-w-0 gap-4">
        {/* Preview Thumbnail */}
        <div className="relative flex-shrink-0 w-14 h-14 overflow-hidden rounded-xl bg-neutral-100 dark:bg-[#202124] border border-neutral-200/60 dark:border-[#3c4043] shadow-sm">
          <img 
            src={URL.createObjectURL(item.file)} 
            alt={item.file.name}
            className="block object-cover w-full h-full"
            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
          />
        </div>

        {/* File Info */}
        <div className="flex flex-col min-w-0 justify-center">
          <span className="text-sm font-bold truncate text-neutral-800 dark:text-[#e8eaed] mb-0.5">
            {item.file.name}
          </span>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-[#9aa0a6]">
            <span>{formatBytes(item.originalSize)}</span>
            {isComplete && item.convertedSize && (
              <>
                <ArrowRight className="w-3 h-3 text-neutral-400 dark:text-[#9aa0a6]" />
                <span className={cn(compressionRatio > 0 ? "text-emerald-600 dark:text-[#81c995]" : "text-neutral-500 dark:text-[#9aa0a6]")}>
                  {formatBytes(item.convertedSize)}
                </span>
                {compressionRatio > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-[#1e3427] text-emerald-700 dark:text-[#81c995] font-bold ml-1 border border-emerald-200 dark:border-[#2d523c]">
                    -{compressionRatio}%
                  </span>
                )}
                {compressionRatio < 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-[#3c1e1e] text-red-700 dark:text-[#f28b82] font-bold ml-1 border border-red-200 dark:border-[#5c2828]">
                    +{Math.abs(compressionRatio)}%
                  </span>
                )}
              </>
            )}
            {isError && (
              <span className="text-red-600 dark:text-[#f28b82] font-bold truncate">{item.error}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions / Status */}
      <div className="flex items-center gap-2 pl-4 pr-1 ml-4 border-l-2 border-neutral-100 dark:border-[#3c4043]">
        {isProcessing && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500 dark:text-[#8ab4f8]" />
        )}
        
        {isComplete && (
          <>
            <button
              onClick={() => onDownload(item)}
              className="p-2 transition-all rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-neutral-800 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed]"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-[#81c995]" />
          </>
        )}
        
        {isError && (
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-[#f28b82]" />
        )}

        {(item.status === 'pending' || item.status === 'error' || isComplete) && (
          <button
            onClick={() => onRemove(item.id)}
            className={cn(
              "p-2 transition-all rounded-xl",
              isComplete ? "opacity-0 group-hover:opacity-100 text-neutral-400 hover:bg-red-50 dark:hover:bg-[#3c1e1e] hover:text-red-600 dark:hover:text-[#f28b82]" : "text-neutral-400 hover:bg-red-50 dark:hover:bg-[#3c1e1e] hover:text-red-600 dark:hover:text-[#f28b82]"
            )}
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
