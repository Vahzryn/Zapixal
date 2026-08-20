import React, { useState } from 'react';
import { 
  Check, 
  Download, 
  Archive, 
  FolderDown, 
  ArrowLeft, 
  Plus, 
  RotateCw, 
  AlertCircle, 
  FileImage, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ImageFileItem, ConversionSettings } from '../../types';
import { formatBytes, formatOutputFilename, getEffectiveTargetFormat } from '../../lib/utils';

interface CompleteViewProps {
  files: ImageFileItem[];
  settings: ConversionSettings;
  isCopiedShareLink?: boolean;
  onDownloadAll: () => void;
  onDownloadDirect: () => void;
  onDownloadToDirectory?: () => void;
  hasDirectoryPicker?: boolean;
  onShareApp?: () => void;
  onClearAll: () => void;
  onBackToWorkspace?: () => void;
  onDownloadSingle?: (file: ImageFileItem) => void;
  onRetryFile?: (id: string) => void;
}

export const CompleteView = React.memo<CompleteViewProps>(function CompleteView({
  files,
  settings,
  onDownloadAll,
  onDownloadDirect,
  onDownloadToDirectory,
  hasDirectoryPicker,
  onClearAll,
  onBackToWorkspace,
  onDownloadSingle,
  onRetryFile,
}) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [downloadFeedbackText, setDownloadFeedbackText] = useState('Download Started');

  const completed = files.filter(f => f.status === 'success' && (f.convertedSize !== undefined || f.blob));
  const failed = files.filter(f => f.status === 'error');
  const totalCount = files.length;
  const successCount = completed.length;
  const failedCount = failed.length;

  const totOrig = completed.reduce((acc, f) => acc + f.originalSize, 0);
  const totConv = completed.reduce((acc, f) => acc + (f.convertedSize || f.blob?.size || 0), 0);
  const netSaved = totOrig - totConv;
  const pct = totOrig > 0 ? Math.round((netSaved / totOrig) * 100) : 0;

  const handleTriggerDownloadAll = () => {
    onDownloadAll();
    setDownloadFeedbackText(successCount === 1 ? 'Downloaded' : 'ZIP Download Started');
    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 2500);
  };

  const handleTriggerDownloadDirect = () => {
    onDownloadDirect();
    setDownloadFeedbackText('Downloading Files...');
    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 2500);
  };

  const handleTriggerDirectorySave = () => {
    if (onDownloadToDirectory) {
      onDownloadToDirectory();
      setDownloadFeedbackText('Saved to Folder');
      setDownloadStarted(true);
      setTimeout(() => setDownloadStarted(false), 2500);
    }
  };

  return (
    <div 
      className="max-w-2xl mx-auto w-full px-2 sm:px-4 py-4 space-y-6 animate-in fade-in zoom-in-98 duration-300"
      id="tool-completion-view"
    >
      {/* Screen Reader Live Region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {failedCount > 0 
          ? `Processing complete. ${successCount} of ${totalCount} files ready for download. ${failedCount} files encountered errors.`
          : `Processing complete. All ${successCount} files are ready for download.`
        }
      </div>

      {/* Main Result Card */}
      <div className="bg-white dark:bg-[#1e2024] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 text-center">
        
        {/* Status Indicator & Main Headline */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {failedCount > 0 
                ? `${successCount} of ${totalCount} Files Ready`
                : successCount === 1 
                  ? 'File Ready for Download'
                  : `All ${successCount} Files Ready`}
            </h2>

            {failedCount > 0 ? (
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{failedCount} {failedCount === 1 ? 'file' : 'files'} could not be processed</span>
              </p>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Processed locally with zero data loss or quality compromise.
              </p>
            )}
          </div>
        </div>

        {/* Compression / Format Summary Metrics */}
        {successCount > 0 && (
          <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/80 rounded-2xl p-4">
            {netSaved > 0 ? (
              <div className="grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-800 text-center">
                <div className="px-2">
                  <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Original</div>
                  <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{formatBytes(totOrig)}</div>
                </div>
                <div className="px-2">
                  <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">New Size</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatBytes(totConv)}</div>
                </div>
                <div className="px-2">
                  <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Reduction</div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>{pct}% (-{formatBytes(netSaved)})</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Total Size: <span className="font-bold">{formatBytes(totConv)}</span>
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Target Format: <span className="font-bold uppercase text-blue-600 dark:text-blue-400">{settings.targetFormat}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        {successCount > 0 && (
          <div className="space-y-3">
            <button
              onClick={handleTriggerDownloadAll}
              disabled={downloadStarted}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-90"
              id="btn-primary-completion-download"
              aria-label={successCount === 1 ? 'Download processed file' : `Download all ${successCount} files as ZIP archive`}
            >
              {downloadStarted ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white animate-in zoom-in" />
                  <span>{downloadFeedbackText}</span>
                </>
              ) : successCount === 1 ? (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download File</span>
                </>
              ) : (
                <>
                  <Archive className="w-5 h-5" />
                  <span>Download All ({successCount} Files · .ZIP)</span>
                </>
              )}
            </button>

            {/* Secondary Download Actions (Direct / Folder) */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {hasDirectoryPicker && onDownloadToDirectory && successCount > 1 && (
                <button
                  onClick={handleTriggerDirectorySave}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
                  id="btn-secondary-save-folder"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Save to Folder</span>
                </button>
              )}

              {successCount > 1 && (
                <button
                  onClick={handleTriggerDownloadDirect}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
                  id="btn-secondary-download-separately"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Separately</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Failed items notice & retry */}
        {failedCount > 0 && onRetryFile && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{failedCount} {failedCount === 1 ? 'file failed' : 'files failed to convert'}</span>
            </div>
            <button
              onClick={() => failed.forEach(f => onRetryFile(f.id))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>Retry Failed</span>
            </button>
          </div>
        )}

        {/* Result File List Preview */}
        {completed.length > 0 && (
          <div className="space-y-2 text-left pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Output Files ({completed.length})
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {completed.map((item, index) => {
                const outName = formatOutputFilename(item, index, settings);
                const outSize = item.convertedSize || item.blob?.size || 0;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileImage className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                          {outName}
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {formatBytes(item.originalSize)} → <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatBytes(outSize)}</span>
                        </p>
                      </div>
                    </div>

                    {onDownloadSingle && (
                      <button
                        onClick={() => onDownloadSingle(item)}
                        className="p-1.5 text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                        title={`Download ${outName}`}
                        aria-label={`Download ${outName}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue Workflow Navigation */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
          {onBackToWorkspace && (
            <button
              onClick={onBackToWorkspace}
              className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Workspace</span>
            </button>
          )}

          <span className="text-neutral-300 dark:text-neutral-700">•</span>

          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Process More Files</span>
          </button>
        </div>

      </div>
    </div>
  );
});
