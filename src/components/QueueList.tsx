import React from 'react';
import { Trash2, Play, Plus, RefreshCw, FileText, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '../lib/imageProcessor';
import { ConversionSettings, ImageFileItem } from '../types';

interface QueueListProps {
  items: ImageFileItem[];
  settings: ConversionSettings;
  isProcessing: boolean;
  onConvertAll: () => void;
  onClearQueue: () => void;
  onRemoveItem: (id: string) => void;
  onAddMoreFiles: () => void;
}

export const QueueList: React.FC<QueueListProps> = ({
  items,
  settings,
  isProcessing,
  onConvertAll,
  onClearQueue,
  onRemoveItem,
  onAddMoreFiles,
}) => {
  const totalOriginalBytes = items.reduce((acc, item) => acc + item.originalSize, 0);
  const overallProgress = items.length > 0 
    ? Math.round(items.reduce((acc, item) => acc + item.progress, 0) / items.length) 
    : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Queue Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start space-x-3 mb-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Conversion Queue</span>
              <span className="bg-slate-100 text-blue-700 border border-slate-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {items.length} {items.length === 1 ? 'file' : 'files'}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium flex items-center justify-between sm:justify-start space-x-4">
            <span>Total Size: <span className="text-slate-800 font-semibold">{formatBytes(totalOriginalBytes)}</span></span>
            {isProcessing && (
              <span className="text-blue-600 font-semibold">{overallProgress}% Complete</span>
            )}
          </p>
          {isProcessing && (
             <div className="w-full sm:max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
               <div
                 className="bg-blue-600 h-full transition-all duration-300 ease-out"
                 style={{ width: `${overallProgress}%` }}
               />
             </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onAddMoreFiles}
            disabled={isProcessing}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add More</span>
          </button>

          <button
            onClick={onClearQueue}
            disabled={isProcessing}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-semibold border border-slate-200 hover:border-rose-200 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onConvertAll}
            disabled={isProcessing || items.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Convert All ({items.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Large Batch Warning */}
      {items.length > 25 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-2 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Large Batch Warning:</strong> Conversion remains 100% free with no hard limits, but batches larger than 25 files may consume significant browser memory or cause temporary freezing during processing depending on your hardware.
          </p>
        </div>
      )}

      {/* Item List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
          >
            {/* Thumbnail Preview & Filename */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="bg-white px-1.5 py-0.2 rounded border border-slate-200 font-medium">
                    {formatBytes(item.originalSize)}
                  </span>
                  {item.dimensions && (
                    <span>
                      {item.dimensions.width}×{item.dimensions.height}
                    </span>
                  )}
                  <span className="text-slate-400">→</span>
                  <span className="text-blue-600 font-bold uppercase">
                    {settings.targetFormat}
                  </span>
                </div>

                {/* Progress bar if processing */}
                {item.status === 'processing' && (
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-blue-600 h-full transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status & Delete */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {item.status === 'pending' && (
                <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                  Ready
                </span>
              )}

              {item.status === 'processing' && (
                <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-medium flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                  <span>Converting</span>
                </span>
              )}

              {item.status === 'completed' && (
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-medium flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Done</span>
                </span>
              )}

              {item.status === 'error' && (
                <span className="text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-md font-medium flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>Failed</span>
                </span>
              )}

              <button
                onClick={() => onRemoveItem(item.id)}
                disabled={isProcessing}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
