import React from 'react';
import { Check, Sparkles, DownloadCloud, Share2, FolderDown } from 'lucide-react';
import { ImageFileItem, ConversionSettings } from '../../types';
import { formatBytes } from '../../lib/utils';

interface CompleteViewProps {
  files: ImageFileItem[];
  settings: ConversionSettings;
  isCopiedShareLink: boolean;
  onDownloadAll: () => void;
  onDownloadDirect: () => void;
  onDownloadToDirectory?: () => void;
  hasDirectoryPicker?: boolean;
  onShareApp: () => void;
  onClearAll: () => void;
}

export const CompleteView = React.memo<CompleteViewProps>(function CompleteView({
  files,
  settings,
  isCopiedShareLink,
  onDownloadAll,
  onDownloadDirect,
  onDownloadToDirectory,
  hasDirectoryPicker,
  onShareApp,
  onClearAll,
}) {
  const completed = files.filter(f => f.status === 'success' && f.convertedSize !== undefined);
  const totOrig = completed.reduce((acc, f) => acc + f.originalSize, 0);
  const totConv = completed.reduce((acc, f) => acc + (f.convertedSize || 0), 0);
  const netSaved = totOrig - totConv;
  const pct = totOrig > 0 ? Math.round((netSaved / totOrig) * 100) : 0;
  const successCount = files.filter(f => f.status === 'success' && f.blob).length;

  return (
    <div className="flex flex-col items-center gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto w-full min-h-[300px]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-2">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-neutral-900 dark:text-white">Conversion Complete</h2>
        
        {netSaved >= 0 ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-[#1e3427] text-emerald-700 dark:text-[#81c995] rounded-xl border border-emerald-200 dark:border-[#2d523c]">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-sm">
              Saved {formatBytes(netSaved)} ({pct}% reduction)
            </span>
          </div>
        ) : (
          (() => {
            const isFormatOverhead = settings.targetFormat === 'ico';
            return (
              <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-[#2e2312] text-amber-800 dark:text-[#fdd663] rounded-xl border border-amber-200 dark:border-[#4d3a1f] text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="font-bold text-sm">
                    {isFormatOverhead
                      ? `${settings.targetFormat.toUpperCase()} Generated (${formatBytes(totConv)})`
                      : `Size increased by ${formatBytes(Math.abs(netSaved))} (+${Math.abs(pct)}%)`}
                  </span>
                </div>
                {!isFormatOverhead && (
                  <span className="text-xs font-semibold opacity-90 border-t sm:border-t-0 sm:border-l border-amber-300 dark:border-amber-700/50 pt-1 sm:pt-0 sm:pl-2.5">
                    Tip: Switch format to WebP or AVIF for 80% compression
                  </span>
                )}
              </div>
            );
          })()
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full mt-4 flex-wrap">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:flex-initial flex-wrap">
          <button
            onClick={onDownloadAll}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg active:scale-95 transition-all"
            id="btn-download-all"
          >
            <DownloadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
            {successCount === 1 ? 'Download File' : 'Download All (.ZIP)'}
          </button>

          {hasDirectoryPicker && onDownloadToDirectory && successCount > 1 && (
            <button
              onClick={onDownloadToDirectory}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Save files directly to a directory on your machine with zero memory overhead"
              id="btn-save-to-folder"
            >
              <FolderDown className="w-5 h-5 shrink-0" />
              Save to Folder
            </button>
          )}

          {successCount > 1 && (
            <button
              onClick={onDownloadDirect}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm active:scale-95 transition-all"
              id="btn-download-separately"
            >
              Download Separately
            </button>
          )}
        </div>
        <button
          onClick={onShareApp}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-neutral-700 dark:text-[#e8eaed] bg-white dark:bg-[#303134] hover:bg-neutral-50 border border-neutral-200 dark:border-[#3c4043] rounded-2xl shadow-sm active:scale-95 transition-all"
        >
          {isCopiedShareLink ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
          {isCopiedShareLink ? 'Link Copied!' : 'Share App'}
        </button>
      </div>
      
      <button
        onClick={onClearAll}
        className="mt-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:text-[#9aa0a6] dark:hover:text-white underline decoration-neutral-300 underline-offset-4"
      >
        Convert More Files
      </button>
    </div>
  );
});
