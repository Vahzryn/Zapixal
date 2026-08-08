import React from 'react';
import { Trash2, Loader2, Zap, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { GlobalControls } from '../GlobalControls';
import { VirtualFileList } from '../VirtualFileList';
import { ImageFileItem, ConversionSettings, TargetFormat } from '../../types';
import { cn, formatBytes } from '../../lib/utils';

interface QueueSectionProps {
  files: ImageFileItem[];
  selectedFileIds: Set<string>;
  settings: ConversionSettings;
  setSettings: React.Dispatch<React.SetStateAction<ConversionSettings>>;
  isProcessing: boolean;
  isStopping: boolean;
  etaText: string;
  pendingCount: number;
  processedCount: number;
  totalCount: number;
  progressPercent: number;
  successCount: number;
  onConvert: () => void;
  onStop: () => void;
  onClearAll: () => void;
  onToggleSelect: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  onDownloadSingle: (file: ImageFileItem) => void;
  onRotateItem: (id: string, delta: number) => void;
  onCompare: (item: ImageFileItem) => void;
  onInspectDetails: (item: ImageFileItem) => void;
  onUpdateFileFormat?: (id: string, format: TargetFormat | undefined) => void;
  onReformatItems?: (ids: string[], format: TargetFormat) => void;
  onReformatItem?: (id: string, format: TargetFormat) => void;
  onSelectRegions?: (item: ImageFileItem) => void;
  concurrencyProfile?: string;
  showLargeBatchBanner?: boolean;
  onDismissLargeBatchBanner?: () => void;
  showAutoChunkedBanner?: boolean;
  onDismissAutoChunkedBanner?: () => void;
  totalPendingBytes?: number;
}

export const QueueSection = React.memo<QueueSectionProps>(function QueueSection({
  files,
  selectedFileIds,
  settings,
  setSettings,
  isProcessing,
  isStopping,
  etaText,
  pendingCount,
  processedCount,
  totalCount,
  progressPercent,
  successCount,
  onConvert,
  onStop,
  onClearAll,
  onToggleSelect,
  onRemoveFile,
  onRetryFile,
  onDownloadSingle,
  onRotateItem,
  onCompare,
  onInspectDetails,
  onUpdateFileFormat,
  onReformatItems,
  onReformatItem,
  onSelectRegions,
  concurrencyProfile,
  showLargeBatchBanner,
  onDismissLargeBatchBanner,
  showAutoChunkedBanner,
  onDismissAutoChunkedBanner,
  totalPendingBytes,
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Large Batch Non-Blocking Banner */}
      {showLargeBatchBanner && (
        <div 
          className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-in slide-in-from-top-2 duration-200"
          id="large-batch-warning-banner"
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold text-left">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>This is a large batch for your device. Processing will take longer. We recommend folder-save mode below for the most reliable result.</span>
          </div>
          {onDismissLargeBatchBanner && (
            <button
              onClick={onDismissLargeBatchBanner}
              className="p-1.5 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss banner"
              id="btn-dismiss-large-batch-banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Auto-Chunked Notice Banner */}
      {showAutoChunkedBanner && (
        <div 
          className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center justify-between gap-3 text-blue-900 dark:text-blue-200 animate-in slide-in-from-top-2 duration-200"
          id="auto-chunked-notice-banner"
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold text-left">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Memory-Safe Export Engaged: Total batch size ({formatBytes(totalPendingBytes || 0)}) reaches your device safety threshold. Chunked processing mode was automatically engaged to protect your device from memory strain.
            </span>
          </div>
          {onDismissAutoChunkedBanner && (
            <button
              onClick={onDismissAutoChunkedBanner}
              className="p-1.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notice"
              id="btn-dismiss-auto-chunked-banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <GlobalControls 
        settings={settings} 
        onChange={setSettings} 
        disabled={isProcessing}
        onConvert={onConvert}
        onStop={onStop}
        isProcessing={isProcessing}
        isStopping={isStopping}
        pendingCount={pendingCount}
      />

      <div className="flex flex-col bg-white dark:bg-neutral-900 border rounded-3xl border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-neutral-900 dark:text-white text-lg">Queue ({files.length})</span>
            {concurrencyProfile && (
              <span className="text-xs font-semibold text-neutral-400 dark:text-[#9aa0a6] hidden sm:inline" id="hw-tier-badge">
                • {concurrencyProfile}
              </span>
            )}
            {isProcessing && etaText && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 dark:bg-[#1e293b] text-blue-700 dark:text-[#8ab4f8] shadow-sm border border-blue-200 dark:border-[#384c6c] flex items-center gap-1.5">
                <span>⏱️ {etaText}</span>
              </span>
            )}
          </div>
          <button 
            onClick={onClearAll}
            disabled={isProcessing}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>

        {selectedFileIds.size > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 border-b border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/20 text-sm font-bold">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-neutral-900">
                {selectedFileIds.size}
              </span>
              <span>selected</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs text-neutral-400 dark:text-[#9aa0a6]">Bulk Reformat:</span>
              <select
                disabled={isProcessing}
                value=""
                onChange={(e) => {
                  const format = e.target.value as TargetFormat;
                  if (format && onReformatItems) {
                    onReformatItems(Array.from(selectedFileIds), format);
                  }
                }}
                className="px-2.5 py-1.5 text-xs font-bold border-2 rounded-xl bg-white dark:bg-[#202124] border-blue-200 dark:border-[#384c6c] text-blue-700 dark:text-[#8ab4f8] focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="" disabled>Select Format...</option>
                <option value="webp">WebP (Recommended)</option>
                <option value="avif">AVIF</option>
                <option value="jpg">JPEG</option>
                <option value="png">PNG (Lossless)</option>
                <option value="pdf">PDF Document</option>
                <option value="bmp">BMP</option>
                <option value="ico">ICO</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Screen reader aria-live progress region */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isProcessing
            ? `Converting batch: ${processedCount} of ${totalCount} files processed (${progressPercent}% complete).`
            : successCount > 0 && successCount === totalCount
            ? `Batch conversion complete. ${successCount} files converted.`
            : ''}
        </div>

        <div className="p-4">
          <VirtualFileList
            files={files}
            selectedFileIds={selectedFileIds}
            onToggleSelect={onToggleSelect}
            onRemove={onRemoveFile}
            onRetry={onRetryFile}
            onDownload={onDownloadSingle}
            onRotate={onRotateItem}
            onCompare={onCompare}
            onInspectDetails={onInspectDetails}
            onUpdateFormat={onUpdateFileFormat}
            onReformatItem={onReformatItem}
            onSelectRegions={onSelectRegions}
          />
        </div>
      </div>

      {/* Mobile Floating Action Widget */}
      <div className="md:hidden fixed bottom-6 right-5 z-40 flex justify-end animate-in slide-in-from-bottom-4 fade-in duration-300">
        {isProcessing ? (
          <button
            onClick={onStop}
            disabled={isStopping}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-black text-white transition-all rounded-full shadow-xl border border-red-400 dark:border-red-600",
              isStopping
                ? "bg-amber-500 cursor-not-allowed opacity-90 border-amber-400 shadow-md"
                : "bg-red-500 hover:bg-red-600 active:scale-95 shadow-lg"
            )}
            aria-label="Stop Processing"
          >
            {isStopping ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Stopping...</>
            ) : (
              <><Zap className="w-4 h-4 animate-pulse" /> Stop</>
            )}
          </button>
        ) : pendingCount > 0 ? (
          <button
            onClick={onConvert}
            className="flex items-center gap-2 px-5 py-3 text-sm font-black text-neutral-900 bg-[#fdd663] hover:bg-[#fbbc04] active:scale-95 transition-all rounded-full shadow-xl border border-[#e3a800]"
            aria-label="Convert Files"
          >
            <Zap className="w-4 h-4 fill-current text-neutral-900" />
            <span>Convert ({pendingCount})</span>
          </button>
        ) : null}
      </div>
    </div>
  );
});
