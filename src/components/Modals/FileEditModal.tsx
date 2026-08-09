import React, { useState, useEffect } from 'react';
import { ImageFileItem, TargetFormat } from '../../types';
import { formatBytes } from '../../lib/utils';
import { X, RotateCcw, RotateCw, EyeOff, Info, Eye, Check, Sliders } from 'lucide-react';

interface FileEditModalProps {
  item: ImageFileItem;
  onClose: () => void;
  onRotate?: (id: string, deltaDegrees: number) => void;
  onUpdateFormat?: (id: string, format: TargetFormat | undefined) => void;
  onReformatItem?: (id: string, format: TargetFormat) => void;
  onSelectRegions?: (item: ImageFileItem) => void;
  onInspectDetails?: (item: ImageFileItem) => void;
  onCompare?: (item: ImageFileItem) => void;
}

export function FileEditModal({
  item,
  onClose,
  onRotate,
  onUpdateFormat,
  onReformatItem,
  onSelectRegions,
  onInspectDetails,
  onCompare,
}: FileEditModalProps) {
  const [previewSrc, setPreviewSrc] = useState<string>(item.convertedUrl || item.previewUrl || '');

  useEffect(() => {
    if (item.convertedUrl) {
      setPreviewSrc(item.convertedUrl);
      return;
    }
    const url = URL.createObjectURL(item.file);
    setPreviewSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [item.convertedUrl, item.file, item.previewUrl]);

  const rotation = item.rotation || 0;
  const isComplete = item.status === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-lg bg-white dark:bg-[#202124] rounded-3xl shadow-2xl border border-neutral-200 dark:border-[#3c4043] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-[#3c4043]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-[#8ab4f8] rounded-2xl shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-[#e8eaed]">Image Edit & Options</h3>
              <p className="text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6] truncate">
                {item.file.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 transition-all text-neutral-400 hover:text-neutral-700 dark:hover:text-[#e8eaed] hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-full shrink-0 cursor-pointer"
            aria-label="Close edit dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Image Preview Canvas */}
          <div className="relative w-full h-48 bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center border border-neutral-800">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt={item.file.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            ) : (
              <div className="text-sm text-neutral-500">Preview loading...</div>
            )}
            {rotation !== 0 && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-lg">
                {rotation}° Rotated
              </span>
            )}
          </div>

          {/* Quick Technical Summary */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-[#303134] rounded-2xl border border-neutral-200 dark:border-[#3c4043] text-xs">
            <div>
              <span className="text-neutral-400 dark:text-[#9aa0a6]">Original Size: </span>
              <span className="font-bold text-neutral-800 dark:text-[#e8eaed]">{formatBytes(item.originalSize)}</span>
            </div>
            {isComplete && item.convertedSize && (
              <div>
                <span className="text-neutral-400 dark:text-[#9aa0a6]">Output Size: </span>
                <span className="font-bold text-emerald-600 dark:text-[#81c995]">{formatBytes(item.convertedSize)}</span>
              </div>
            )}
          </div>

          {/* Format Settings */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-[#e8eaed] uppercase tracking-wider block">
              Per-File Target Format
            </label>
            <select
              value={item.customTargetFormat || ''}
              onChange={(e) => {
                const val = e.target.value as TargetFormat;
                if (isComplete && onReformatItem && val) {
                  onReformatItem(item.id, val);
                } else if (onUpdateFormat) {
                  onUpdateFormat(item.id, val ? val : undefined);
                }
              }}
              className="w-full px-3.5 py-2 text-sm font-bold border-2 rounded-xl bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Auto (Use Global Format Setting)</option>
              <option value="webp">WebP (Optimized & Responsive)</option>
              <option value="avif">AVIF (Next-Gen Compression)</option>
              <option value="jpg">JPEG (Universal Compatibility)</option>
              <option value="png">PNG (Lossless Transparency)</option>
              <option value="pdf">PDF (Document Format)</option>
              <option value="bmp">BMP (Uncompressed Bitmap)</option>
              <option value="ico">ICO (Favicon Icon)</option>
            </select>
            <p className="text-[11px] text-neutral-500 dark:text-[#9aa0a6]">
              {item.customTargetFormat ? `Custom format ${item.customTargetFormat.toUpperCase()} active for this file.` : 'Defaulting to global batch conversion format.'}
            </p>
          </div>

          {/* Rotation Controls */}
          {onRotate && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-[#e8eaed] uppercase tracking-wider block">
                Rotation Angle
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onRotate(item.id, -90)}
                  className="px-3 py-2 border border-neutral-200 dark:border-[#3c4043] hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-xl text-xs font-bold text-neutral-800 dark:text-[#e8eaed] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-500" />
                  <span>Rotate Left (-90°)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRotate(item.id, 90)}
                  className="px-3 py-2 border border-neutral-200 dark:border-[#3c4043] hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-xl text-xs font-bold text-neutral-800 dark:text-[#e8eaed] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-indigo-500" />
                  <span>Rotate Right (+90°)</span>
                </button>
              </div>
            </div>
          )}

          {/* Special Tools */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-[#3c4043]">
            <label className="text-xs font-bold text-neutral-700 dark:text-[#e8eaed] uppercase tracking-wider block">
              Advanced Image Tools
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onSelectRegions && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectRegions(item);
                  }}
                  className="p-3 border border-neutral-200 dark:border-[#3c4043] hover:bg-amber-50 dark:hover:bg-[#322312] hover:border-amber-300 dark:hover:border-amber-700 rounded-2xl text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-neutral-800 dark:text-[#e8eaed] group-hover:text-amber-700 dark:group-hover:text-amber-300">
                    <EyeOff className="w-4 h-4 text-amber-500" />
                    <span>Redact / Blur Areas</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-[#9aa0a6] mt-1">
                    {item.blurRegions?.length ? `${item.blurRegions.length} region(s) redacted` : 'Hide sensitive information'}
                  </p>
                </button>
              )}

              {onInspectDetails && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInspectDetails(item);
                  }}
                  className="p-3 border border-neutral-200 dark:border-[#3c4043] hover:bg-indigo-50 dark:hover:bg-[#21243a] hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-neutral-800 dark:text-[#e8eaed] group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <span>Inspect Spec & Palette</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-[#9aa0a6] mt-1">
                    Dimensions, EXIF & dominant colors
                  </p>
                </button>
              )}

              {isComplete && onCompare && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCompare(item);
                  }}
                  className="p-3 border border-neutral-200 dark:border-[#3c4043] hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl text-left transition-colors cursor-pointer group col-span-1 sm:col-span-2"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-neutral-800 dark:text-[#e8eaed] group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>Compare Original vs Converted</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-[#9aa0a6] mt-1">
                    Side-by-side quality comparison slider
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-[#303134] border-t border-neutral-200 dark:border-[#3c4043] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Done
          </button>
        </div>
      </div>
    </div>
  );
}
