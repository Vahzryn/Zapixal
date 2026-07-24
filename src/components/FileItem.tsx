import React, { useState } from 'react';
import { ImageFileItem } from '../types';
import { formatBytes } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Download, Trash2, ArrowRight, Eye, GripVertical, RotateCcw, RotateCw, Copy, Check, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileItemProps {
  item: ImageFileItem;
  index: number;
  onRemove: (id: string) => void;
  onDownload: (item: ImageFileItem) => void;
  onRotate?: (id: string, deltaDegrees: number) => void;
  onCompare?: (item: ImageFileItem) => void;
  onInspectDetails?: (item: ImageFileItem) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export function FileItem({ 
  item, 
  index,
  onRemove, 
  onDownload, 
  onRotate,
  onCompare,
  onInspectDetails,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}: FileItemProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isComplete = item.status === 'success';
  const isError = item.status === 'error';
  const isProcessing = item.status === 'processing';

  const rotation = item.rotation || 0;

  const handleCopyToClipboard = async () => {
    try {
      const blobToCopy = item.blob || item.file;
      let pngBlob = blobToCopy;

      // Clipboard API requires PNG for image copy in standard web browsers
      if (blobToCopy.type !== 'image/png') {
        const img = new Image();
        const url = URL.createObjectURL(blobToCopy);
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        pngBlob = (await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png')))!;
        URL.revokeObjectURL(url);
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
    }
  };

  const compressionRatio = (item.convertedSize && item.originalSize)
    ? Math.round((1 - item.convertedSize / item.originalSize) * 100)
    : 0;

  return (
    <div 
      draggable={!isProcessing}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center justify-between p-3 transition-all bg-white dark:bg-[#303134] border-2 rounded-2xl group shadow-sm select-none",
        !isProcessing && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40 border-dashed border-blue-500 dark:border-[#8ab4f8] bg-blue-50/50 dark:bg-[#1e293b]",
        isError 
          ? "border-red-200 dark:border-[#5c2828] bg-red-50/50 dark:bg-[#2c1a1a]" 
          : isComplete 
          ? "border-emerald-100 dark:border-[#2d523c] hover:border-emerald-200 dark:hover:border-[#3c6d50] bg-emerald-50/30 dark:bg-[#1a2c20]/50" 
          : "border-neutral-200 dark:border-[#3c4043] hover:border-blue-200 dark:hover:border-[#8ab4f8]/50"
      )}
    >
      <div className="flex items-center flex-1 min-w-0 gap-3">
        {/* Grip Drag Handle */}
        <div 
          className="flex items-center justify-center text-neutral-300 dark:text-[#5f6368] group-hover:text-neutral-500 dark:group-hover:text-[#9aa0a6] transition-colors"
          title="Drag to reorder priority in queue"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Preview Thumbnail with Rotation */}
        <div className="relative flex-shrink-0 w-14 h-14 overflow-hidden rounded-xl bg-neutral-100 dark:bg-[#202124] border border-neutral-200/60 dark:border-[#3c4043] shadow-sm flex items-center justify-center">
          <img 
            src={URL.createObjectURL(item.file)} 
            alt={item.file.name}
            width="56"
            height="56"
            loading="lazy"
            decoding="async"
            className="block object-cover w-full h-full transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
          />
          {rotation !== 0 && (
            <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-mono font-bold px-1 py-0.2 rounded backdrop-blur-xs">
              {rotation}°
            </span>
          )}
        </div>

        {/* File Info */}
        <div className="flex flex-col min-w-0 justify-center">
          <span className="text-sm font-bold truncate text-neutral-800 dark:text-[#e8eaed] mb-0.5">
            {item.file.name}
          </span>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-[#9aa0a6]">
            <span>{formatBytes(item.originalSize)}</span>
            {rotation !== 0 && (
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-[#a8b1ff]">
                • Rotated {rotation}°
              </span>
            )}
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
      <div className="flex items-center gap-1.5 pl-3 pr-1 ml-3 border-l-2 border-neutral-100 dark:border-[#3c4043]">
        {/* Rotate Controls */}
        {onRotate && !isProcessing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onRotate(item.id, -90)}
              className="p-1.5 transition-all rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-indigo-600 dark:hover:text-[#a8b1ff]"
              title="Rotate Left (-90°)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRotate(item.id, 90)}
              className="p-1.5 transition-all rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-indigo-600 dark:hover:text-[#a8b1ff]"
              title="Rotate Right (+90°)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Inspect Details & Color Palette */}
        {onInspectDetails && !isProcessing && (
          <button
            onClick={() => onInspectDetails(item)}
            className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-indigo-50 dark:hover:bg-[#21243a] hover:text-indigo-600 dark:hover:text-[#a8b1ff]"
            title="Inspect Dimensions, Spec & Color Palette"
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        {/* Copy Image to Clipboard */}
        {!isProcessing && (
          <button
            onClick={handleCopyToClipboard}
            className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-neutral-800 dark:hover:text-[#e8eaed]"
            title={isCopied ? "Copied to Clipboard!" : "Copy Image to Clipboard"}
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}

        {isProcessing && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500 dark:text-[#8ab4f8] my-1" />
        )}
        
        {isComplete && (
          <>
            {onCompare && (
              <button
                onClick={() => onCompare(item)}
                className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-blue-600 dark:hover:text-[#8ab4f8]"
                title="Compare Original vs Converted Quality"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDownload(item)}
              className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-neutral-800 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed]"
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
              "p-1.5 transition-all rounded-xl",
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
