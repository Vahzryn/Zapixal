import React from 'react';
import { Cpu, AlertTriangle, X } from 'lucide-react';

interface LowTierWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvertAnyway: () => void;
  onConvertInBatches: () => void;
}

export function LowTierWarningModal({
  isOpen,
  onClose,
  onConvertAnyway,
  onConvertInBatches,
}: LowTierWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="low-tier-warning-overlay"
    >
      <div 
        className="relative bg-white dark:bg-[#303134] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
        id="low-tier-warning-card"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
          id="btn-close-warning"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8 flex flex-col items-center text-center">
          <div className="p-3.5 bg-amber-50 dark:bg-[#3d2b1f] text-amber-600 dark:text-[#fdd663] rounded-full mb-4">
            <Cpu className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white mb-2 leading-tight">
            Performance Alert: High Resource Batch
          </h3>

          <p className="text-sm text-neutral-600 dark:text-[#9aa0a6] mb-6 leading-relaxed">
            This device has entry-level resource capabilities. Processing a batch of this size (&gt;20 files or &gt;300MB) all at once may cause your browser tab to freeze or crash.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={onConvertInBatches}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              id="btn-warning-batches"
            >
              <span>🚀 Convert in Chunks of 15 (Recommended)</span>
            </button>

            <button
              onClick={onConvertAnyway}
              className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-[#202124] hover:bg-neutral-200 dark:hover:bg-[#3c4043] text-neutral-800 dark:text-[#e8eaed] font-bold rounded-xl transition-all text-sm cursor-pointer border border-neutral-200 dark:border-[#3c4043]"
              id="btn-warning-anyway"
            >
              Convert All Anyway
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-500 dark:text-[#9aa0a6] hover:text-neutral-700 dark:hover:text-[#e8eaed] font-semibold rounded-xl transition-all text-xs mt-1 cursor-pointer"
              id="btn-warning-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
