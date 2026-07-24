import React, { useState, useRef } from 'react';
import { ImageFileItem } from '../types';
import { formatBytes } from '../lib/utils';
import { X, SlidersHorizontal, ArrowLeftRight, Check, Eye } from 'lucide-react';

interface CompareModalProps {
  item: ImageFileItem;
  onClose: () => void;
}

export function CompareModal({ item, onClose }: CompareModalProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const originalUrl = React.useMemo(() => URL.createObjectURL(item.file), [item.file]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const savings = (item.originalSize && item.convertedSize)
    ? Math.round(((item.originalSize - item.convertedSize) / item.originalSize) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#202124] rounded-3xl shadow-2xl border border-neutral-200 dark:border-[#3c4043] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-[#3c4043]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8] rounded-2xl">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-[#e8eaed]">Quality Comparison Inspector</h3>
              <p className="text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6] truncate max-w-md">
                {item.file.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 transition-all text-neutral-400 hover:text-neutral-700 dark:hover:text-[#e8eaed] hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Canvas Area */}
        <div className="relative flex-1 min-h-[350px] p-6 bg-neutral-900 flex items-center justify-center overflow-hidden select-none">
          <div
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
            className="relative w-full h-full max-h-[500px] flex items-center justify-center cursor-ew-resize overflow-hidden rounded-2xl border border-neutral-800"
          >
            {/* Converted Image (Right side / Full background) */}
            <img
              src={item.convertedUrl}
              alt="Converted"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            
            {/* Label Right - Converted */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-emerald-600/90 text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-md">
              Converted ({formatBytes(item.convertedSize || 0)})
            </div>

            {/* Original Image (Left side clipped) */}
            <div
              style={{ width: `${sliderPosition}%` }}
              className="absolute top-0 left-0 bottom-0 overflow-hidden border-r-2 border-white dark:border-[#8ab4f8] shadow-2xl pointer-events-none"
            >
              <img
                src={originalUrl}
                alt="Original"
                className="absolute top-0 left-0 h-full max-w-none object-contain"
                style={{
                  width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                }}
              />
              {/* Label Left - Original */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-neutral-900/90 text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-md">
                Original ({formatBytes(item.originalSize)})
              </div>
            </div>

            {/* Drag Handle Bar */}
            <div
              style={{ left: `${sliderPosition}%` }}
              className="absolute top-0 bottom-0 z-20 -ml-4 w-8 flex items-center justify-center pointer-events-none"
            >
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#202124] text-neutral-800 dark:text-[#8ab4f8] shadow-xl border-2 border-blue-500 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-neutral-50 dark:bg-[#171717] border-t border-neutral-200 dark:border-[#3c4043]">
          <div className="p-3 bg-white dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
            <span className="block text-xs font-semibold text-neutral-400 dark:text-[#9aa0a6]">Original Size</span>
            <span className="text-base font-bold text-neutral-800 dark:text-[#e8eaed]">
              {formatBytes(item.originalSize)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
            <span className="block text-xs font-semibold text-neutral-400 dark:text-[#9aa0a6]">New Size</span>
            <span className="text-base font-bold text-emerald-600 dark:text-[#81c995]">
              {formatBytes(item.convertedSize || 0)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
            <span className="block text-xs font-semibold text-neutral-400 dark:text-[#9aa0a6]">Space Savings</span>
            <span className="text-base font-bold text-blue-600 dark:text-[#8ab4f8]">
              {savings > 0 ? `-${savings}% Smaller` : `${Math.abs(savings)}% Larger`}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
