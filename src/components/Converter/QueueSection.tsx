import React from 'react';
import { Trash2, Loader2, Zap } from 'lucide-react';
import { GlobalControls } from '../GlobalControls';
import { VirtualFileList } from '../VirtualFileList';
import { ImageFileItem, ConversionSettings } from '../../types';
import { cn } from '../../lib/utils';

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
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
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
