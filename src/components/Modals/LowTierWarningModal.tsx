import React from 'react';
import { Cpu, FolderDown, X } from 'lucide-react';

interface LowTierWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvertNormally: () => void;
  onSelectDirectoryAndConvert: () => void;
  hasDirectoryPicker?: boolean;
}

export function LowTierWarningModal({
  isOpen,
  onClose,
  onConvertNormally,
  onSelectDirectoryAndConvert,
  hasDirectoryPicker = true,
}: LowTierWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="low-tier-warning-overlay"
    >
      <div 
        className="relative bg-white dark:bg-[#303134] border border-neutral-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full mx-3 overflow-hidden animate-in zoom-in-95 duration-200"
        id="low-tier-warning-card"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
          id="btn-close-warning"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Content */}
        <div className="p-5 sm:p-6 pt-6 sm:pt-8 flex flex-col items-center text-center">
          <div className="p-2.5 bg-blue-50 dark:bg-[#1a2c42] text-blue-600 dark:text-[#8ab4f8] rounded-full mb-3 sm:mb-4">
            <FolderDown className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white mb-1.5 sm:mb-2 leading-tight">
            High Memory Recommendation
          </h3>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#9aa0a6] mb-4 sm:mb-6 leading-relaxed">
            Large batch: This batch may use significant memory. Save completed files directly to a folder as they finish to keep memory usage low.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
            <button
              onClick={onSelectDirectoryAndConvert}
              className="w-full py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              id="btn-warning-folder-save"
            >
              <FolderDown className="w-4 h-4" />
              <span>Save Directly to Folder (Recommended)</span>
            </button>

            <button
              onClick={onConvertNormally}
              className="w-full py-2 sm:py-2.5 px-4 bg-neutral-100 dark:bg-[#202124] hover:bg-neutral-200 dark:hover:bg-[#3c4043] text-neutral-800 dark:text-[#e8eaed] font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer border border-neutral-200 dark:border-[#3c4043]"
              id="btn-warning-anyway"
            >
              Continue Normally
            </button>

            <button
              onClick={onClose}
              className="w-full py-1.5 px-4 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-500 dark:text-[#9aa0a6] hover:text-neutral-700 dark:hover:text-[#e8eaed] font-semibold rounded-xl transition-all text-[11px] mt-0.5 cursor-pointer"
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
