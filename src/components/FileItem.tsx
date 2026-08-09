import React, { useState } from 'react';
import { ImageFileItem, TargetFormat } from '../types';
import { formatBytes } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Download, Trash2, ArrowRight, Eye, GripVertical, RotateCcw, RotateCw, Copy, Check, Info, Image as ImageIcon, RefreshCw, EyeOff, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileItemProps {
  item: ImageFileItem;
  index: number;
  isSelected?: boolean;
  onToggleSelect?: (id: string, multi: boolean) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  onDownload: (item: ImageFileItem) => void;
  onRotate?: (id: string, deltaDegrees: number) => void;
  onCompare?: (item: ImageFileItem) => void;
  onInspectDetails?: (item: ImageFileItem) => void;
  onUpdateFormat?: (id: string, format: TargetFormat | undefined) => void;
  onReformatItem?: (id: string, format: TargetFormat) => void;
  onSelectRegions?: (item: ImageFileItem) => void;
  onEditItem?: (item: ImageFileItem) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

function FileItemComponent({ 
  item, 
  index,
  isSelected = false,
  onToggleSelect,
  onRemove, 
  onRetry,
  onDownload, 
  onRotate,
  onCompare,
  onInspectDetails,
  onUpdateFormat,
  onReformatItem,
  onSelectRegions,
  onEditItem,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}: FileItemProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);
  const isComplete = item.status === 'success';
  const isError = item.status === 'error';
  const isProcessing = item.status === 'processing';

  const rotation = item.rotation || 0;
  const previewSrc = item.convertedUrl || item.previewUrl;

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
      onClick={(e) => {
        if (onToggleSelect) {
          onToggleSelect(item.id, e.metaKey || e.ctrlKey || e.shiftKey);
        }
      }}
      className={cn(
        "flex flex-col p-3 transition-all bg-white dark:bg-[#303134] border-2 rounded-2xl group shadow-sm select-none gap-2 min-w-0 w-full",
        !isProcessing && "cursor-grab active:cursor-grabbing",
        isSelected && "border-blue-500 dark:border-[#8ab4f8] bg-blue-50/40 dark:bg-blue-900/20",
        !isSelected && isDragging && "opacity-40 border-dashed border-blue-500 dark:border-[#8ab4f8] bg-blue-50/50 dark:bg-[#1e293b]",
        !isSelected && isError 
          ? "border-red-200 dark:border-[#5c2828] bg-red-50/50 dark:bg-[#2c1a1a]" 
          : !isSelected && isComplete 
          ? "border-emerald-100 dark:border-[#2d523c] hover:border-emerald-200 dark:hover:border-[#3c6d50] bg-emerald-50/30 dark:bg-[#1a2c20]/50" 
          : !isSelected ? "border-neutral-200 dark:border-[#3c4043] hover:border-blue-200 dark:hover:border-[#8ab4f8]/50" : ""
      )}
    >
      {/* Top / Main File Identity Row */}
      <div className="flex items-center justify-between min-w-0 w-full gap-2.5">
        <div className="flex items-center flex-1 min-w-0 gap-2.5">
          {/* Checkbox for Selection */}
          {onToggleSelect && (
            <div className="shrink-0 flex items-center justify-center pl-0.5">
              <div 
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer",
                  isSelected 
                    ? "bg-blue-600 border-blue-600 dark:bg-[#8ab4f8] dark:border-[#8ab4f8]" 
                    : "border-neutral-300 dark:border-[#5f6368] group-hover:border-blue-400"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white dark:text-neutral-900" strokeWidth={3} />}
              </div>
            </div>
          )}

          {/* Grip Drag Handle */}
          <div 
            className="flex items-center justify-center shrink-0 text-neutral-300 dark:text-[#5f6368] group-hover:text-neutral-500 dark:group-hover:text-[#9aa0a6] transition-colors"
            title="Drag to reorder priority in queue"
          >
            <GripVertical className="w-4 h-4 shrink-0" />
          </div>

          {/* Preview Thumbnail with Rotation */}
          <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 overflow-hidden rounded-xl bg-neutral-100 dark:bg-[#202124] border border-neutral-200/60 dark:border-[#3c4043] shadow-sm flex items-center justify-center">
            {previewSrc && !hasImgError ? (
              <img 
                src={previewSrc} 
                alt={item.file.name}
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setHasImgError(true)}
                className="block object-cover w-full h-full transition-transform duration-300 ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full bg-blue-50 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8]">
                <ImageIcon className="w-5 h-5 shrink-0" />
                <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5 max-w-[40px] truncate">
                  {item.file.name.split('.').pop() || 'IMG'}
                </span>
              </div>
            )}
            {rotation !== 0 && (
              <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-mono font-bold px-1 py-0.2 rounded backdrop-blur-xs">
                {rotation}°
              </span>
            )}
          </div>

          {/* File Name & Metric Info */}
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <span className="text-sm font-bold truncate text-neutral-800 dark:text-[#e8eaed] mb-0.5" title={item.file.name}>
              {item.file.name}
            </span>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-[#9aa0a6]">
              <span className="shrink-0">{formatBytes(item.originalSize)}</span>
              {rotation !== 0 && (
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-[#a8b1ff] shrink-0">
                  • {rotation}°
                </span>
              )}
              {isComplete && item.convertedSize && (
                <>
                  <ArrowRight className="w-3 h-3 shrink-0 text-neutral-400 dark:text-[#9aa0a6]" />
                  <span className={cn("shrink-0 font-bold", compressionRatio > 0 ? "text-emerald-600 dark:text-[#81c995]" : "text-neutral-500 dark:text-[#9aa0a6]")}>
                    {formatBytes(item.convertedSize)}
                  </span>
                  {compressionRatio > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-emerald-100 dark:bg-[#1e3427] text-emerald-700 dark:text-[#81c995] font-bold shrink-0 border border-emerald-200 dark:border-[#2d523c]">
                      -{compressionRatio}%
                    </span>
                  )}
                  {compressionRatio === 0 && (
                    <span 
                      className="px-1.5 py-0.5 text-[10px] rounded-md bg-amber-50 dark:bg-[#322312] text-amber-700 dark:text-[#fdd663] font-bold shrink-0 border border-amber-200 dark:border-[#523d24]"
                      title="PNG format is lossless. Select WebP or JPG format in Output Format to save ~80% space!"
                    >
                      0% (Try WebP format)
                    </span>
                  )}
                  {compressionRatio < 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-red-100 dark:bg-[#3c1e1e] text-red-700 dark:text-[#f28b82] font-bold shrink-0 border border-red-200 dark:border-[#5c2828]">
                      +{Math.abs(compressionRatio)}%
                    </span>
                  )}
                </>
              )}
              {isError && (
                <span className="text-red-600 dark:text-[#f28b82] font-bold truncate shrink-0">{item.error}</span>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicator Badge */}
        <div className="shrink-0 flex items-center pl-1">
          {isProcessing && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 dark:text-[#8ab4f8] shrink-0" />
          )}
          {isComplete && (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-[#81c995] shrink-0" />
          )}
          {isError && (
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-[#f28b82] shrink-0" />
          )}
        </div>
      </div>

      {/* Bottom / Action Controls Bar */}
      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-neutral-100 dark:border-[#3c4043]/60 min-w-0 w-full mt-0.5">
        {/* Left Group: Target Format & Edit Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onUpdateFormat && !isProcessing && !isComplete && (
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] font-bold text-neutral-400 dark:text-[#9aa0a6] select-none">To:</span>
              <select
                value={item.customTargetFormat || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateFormat(item.id, val ? (val as TargetFormat) : undefined);
                }}
                className="px-1 py-0.5 text-[10px] font-bold border rounded-md bg-neutral-50 dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-700 dark:text-[#e8eaed] focus:outline-none focus:border-blue-500 cursor-pointer font-sans"
                title="Auto uses the global format, or matches the original if 'Original Format' is selected."
              >
                <option value="">Auto</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
                <option value="jpg">JPEG</option>
                <option value="png">PNG</option>
                <option value="bmp">BMP</option>
                <option value="ico">ICO</option>
              </select>
            </div>
          )}

          {onReformatItem && isComplete && !isProcessing && (
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-[#81c995] select-none">Reformat:</span>
              <select
                value={item.customTargetFormat || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    onReformatItem(item.id, val as TargetFormat);
                  }
                }}
                className="px-1 py-0.5 text-[10px] font-bold border rounded-md bg-emerald-50 dark:bg-[#1a2c20]/50 border-emerald-200 dark:border-[#2d523c] text-emerald-800 dark:text-[#81c995] focus:outline-none focus:border-emerald-500 cursor-pointer font-sans"
              >
                <option value="" disabled>Change Format</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
                <option value="jpg">JPEG</option>
                <option value="png">PNG</option>
                <option value="bmp">BMP</option>
                <option value="ico">ICO</option>
              </select>
            </div>
          )}

          {!isProcessing && (onEditItem || onInspectDetails) && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onEditItem) {
                  onEditItem(item);
                } else if (onInspectDetails) {
                  onInspectDetails(item);
                }
              }}
              className="px-2 py-1 transition-all rounded-lg text-xs font-bold text-neutral-600 dark:text-[#e8eaed] bg-neutral-100 dark:bg-[#3c4043] hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-[#8ab4f8] border border-neutral-200/80 dark:border-[#5f6368] flex items-center gap-1 shrink-0 cursor-pointer"
              title="Edit per-file options (format, rotation, redaction)"
              aria-label="Edit image options"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-[#8ab4f8]" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Right Group: Tool Action Buttons */}
        <div className="flex items-center gap-0.5 shrink-0 ml-auto">
          {onRotate && !isProcessing && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); onRotate(item.id, -90); }}
                className="p-1.5 transition-all rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-indigo-600 dark:hover:text-[#a8b1ff] shrink-0 cursor-pointer"
                title="Rotate Left (-90°)"
                aria-label="Rotate image 90 degrees counter-clockwise"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRotate(item.id, 90); }}
                className="p-1.5 transition-all rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-indigo-600 dark:hover:text-[#a8b1ff] shrink-0 cursor-pointer"
                title="Rotate Right (+90°)"
                aria-label="Rotate image 90 degrees clockwise"
              >
                <RotateCw className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}

          {onInspectDetails && !isProcessing && (
            <button
              onClick={(e) => { e.stopPropagation(); onInspectDetails(item); }}
              className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-indigo-50 dark:hover:bg-[#21243a] hover:text-indigo-600 dark:hover:text-[#a8b1ff] shrink-0 cursor-pointer"
              title="Inspect Dimensions, Spec & Color Palette"
              aria-label="Inspect image dimensions, specifications, and color palette"
            >
              <Info className="w-4 h-4 shrink-0" />
            </button>
          )}

          {onSelectRegions && !isProcessing && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelectRegions(item); }}
              className={cn(
                "p-1.5 transition-all rounded-xl shrink-0 cursor-pointer relative border border-transparent",
                item.blurRegions && item.blurRegions.length > 0
                  ? "bg-amber-50 dark:bg-[#322312] text-amber-600 dark:text-[#fdd663] border-amber-200 dark:border-[#523d24]"
                  : "text-neutral-400 hover:bg-amber-50 dark:hover:bg-[#322312] hover:text-amber-600 dark:hover:text-[#fdd663]"
              )}
              title={
                item.blurRegions && item.blurRegions.length > 0
                  ? `Redact Regions (${item.blurRegions.length} Active Areas)`
                  : "Redact (Blur or Pixelate) Regions"
              }
              aria-label="Blur or pixelate custom regions of the image"
            >
              <EyeOff className="w-4 h-4 shrink-0" />
              {item.blurRegions && item.blurRegions.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          )}

          {!isProcessing && (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyToClipboard(); }}
              className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-neutral-800 dark:hover:text-[#e8eaed] shrink-0 cursor-pointer"
              title={isCopied ? "Copied to Clipboard!" : "Copy Image to Clipboard"}
              aria-label={isCopied ? "Image successfully copied to clipboard" : "Copy image to clipboard"}
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Copy className="w-4 h-4 shrink-0" />
              )}
            </button>
          )}

          {isComplete && onCompare && (
            <button
              onClick={(e) => { e.stopPropagation(); onCompare(item); }}
              className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-blue-600 dark:hover:text-[#8ab4f8] shrink-0 cursor-pointer"
              title="Compare Original vs Converted Quality"
              aria-label="Compare original and converted image quality side-by-side"
            >
              <Eye className="w-4 h-4 shrink-0" />
            </button>
          )}

          {isComplete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(item); }}
              className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-neutral-800 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] shrink-0 cursor-pointer"
              title="Download"
              aria-label="Download converted image file"
            >
              <Download className="w-4 h-4 shrink-0" />
            </button>
          )}

          {isError && onRetry && (
            <button
              onClick={(e) => { e.stopPropagation(); onRetry(item.id); }}
              className="p-1.5 transition-all rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-blue-600 dark:hover:text-[#8ab4f8] shrink-0 cursor-pointer"
              title="Retry Conversion"
              aria-label="Retry converting this image"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
            </button>
          )}

          {(item.status === 'pending' || item.status === 'error' || isComplete) && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              className={cn(
                "p-1.5 transition-all rounded-xl shrink-0 cursor-pointer",
                isComplete ? "sm:opacity-0 sm:group-hover:opacity-100 text-neutral-400 hover:bg-red-50 dark:hover:bg-[#3c1e1e] hover:text-red-600 dark:hover:text-[#f28b82]" : "text-neutral-400 hover:bg-red-50 dark:hover:bg-[#3c1e1e] hover:text-red-600 dark:hover:text-[#f28b82]"
              )}
              title="Remove"
              aria-label="Remove this image from the batch list"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const FileItem = React.memo(FileItemComponent);


