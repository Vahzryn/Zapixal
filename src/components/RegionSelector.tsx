import React, { useState, useRef, useEffect } from 'react';
import { ImageFileItem } from '../types';
import { X, Trash2, Eye, ShieldAlert, Sparkles, Paintbrush, Undo, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface RegionSelectorProps {
  item: ImageFileItem;
  onClose: () => void;
  onSave: (
    id: string,
    regions: Array<{ x: number; y: number; width: number; height: number }> | undefined,
    mode: 'blur' | 'pixelate' | undefined
  ) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  item,
  onClose,
  onSave,
}) => {
  const [regions, setRegions] = useState<Array<{ x: number; y: number; width: number; height: number }>>(
    item.blurRegions || []
  );
  const [blurMode, setBlurMode] = useState<'blur' | 'pixelate'>(item.blurMode || 'blur');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrag, setCurrentDrag] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Stop propagation for all key/mouse events to prevent modal conflicts
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    // Left click only
    if (e.button !== 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setIsDragging(true);
    setDragStart({ x, y });
    setCurrentDrag({ x, y, width: 0, height: 0 });
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const currentY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const width = Math.abs(dragStart.x - currentX);
    const height = Math.abs(dragStart.y - currentY);

    setCurrentDrag({ x, y, width, height });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    containerRef.current.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    if (currentDrag && currentDrag.width > 0.01 && currentDrag.height > 0.01) {
      setRegions((prev) => [...prev, currentDrag]);
    }

    setDragStart(null);
    setCurrentDrag(null);
  };

  const handleDeleteRegion = (index: number) => {
    setRegions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setRegions([]);
  };

  const handleSave = () => {
    onSave(item.id, regions.length > 0 ? regions : undefined, regions.length > 0 ? blurMode : undefined);
    onClose();
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-sm animate-fade-in" id="region-selector-modal">
      <div className="bg-white dark:bg-[#202124] rounded-2xl w-full max-w-5xl h-[90vh] md:h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200 dark:border-[#3c4043] animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-[#3c4043]/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-[#21243a] text-indigo-600 dark:text-[#a8b1ff] rounded-xl">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-800 dark:text-[#e8eaed]">Blur & Pixelate Regions</h3>
              <p className="text-xs text-neutral-500 dark:text-[#9aa0a6] hidden sm:block">
                Redact sensitive image parts (faces, plates, names) before saving.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 transition-colors rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#3c4043] hover:text-neutral-800 dark:hover:text-[#e8eaed] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 w-full">
          
          {/* Main Preview (Left / Center) */}
          <div className="flex-1 bg-neutral-100 dark:bg-[#121212] p-4 flex items-center justify-center overflow-auto min-h-0 relative select-none">
            {/* Checkerboard transparency grid container */}
            <div className="relative border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-md overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2c2d30_1px,transparent_1px)] [background-size:16px_16px] bg-[#f9fafb] dark:bg-[#1a1b1e]">
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative inline-block max-w-full cursor-crosshair overflow-hidden touch-none"
              >
                {/* Invisible/Display Image */}
                <img
                  src={item.previewUrl}
                  alt="Redaction Preview"
                  className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain block select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />

                {/* Render Selected Regions */}
                {regions.map((region, idx) => (
                  <div
                    key={idx}
                    className="absolute border border-indigo-500 bg-indigo-500/10 group/item"
                    style={{
                      left: `${region.x * 100}%`,
                      top: `${region.y * 100}%`,
                      width: `${region.width * 100}%`,
                      height: `${region.height * 100}%`,
                    }}
                  >
                    {/* Simulated Blur or Pixelation in preview */}
                    {blurMode === 'blur' ? (
                      <div className="w-full h-full backdrop-blur-md" />
                    ) : (
                      <div className="w-full h-full bg-[#000]/15" style={{ backgroundImage: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)', backgroundSize: '12px 12px' }} />
                    )}

                    {/* Quick Delete Overlay Badge */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRegion(idx);
                        }}
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md cursor-pointer"
                        title="Delete Region"
                      >
                        <X className="w-3 h-3" strokeWidth={3} />
                      </button>
                    </div>

                    <span className="absolute bottom-1 left-1 px-1 bg-black/75 text-white text-[8px] font-mono rounded select-none">
                      #{idx + 1}
                    </span>
                  </div>
                ))}

                {/* Render Current Drag Rectangle */}
                {currentDrag && (
                  <div
                    className="absolute border-2 border-dashed border-indigo-500 bg-indigo-500/20"
                    style={{
                      left: `${currentDrag.x * 100}%`,
                      top: `${currentDrag.y * 100}%`,
                      width: `${currentDrag.width * 100}%`,
                      height: `${currentDrag.height * 100}%`,
                    }}
                  >
                    {blurMode === 'blur' ? (
                      <div className="w-full h-full backdrop-blur-sm" />
                    ) : (
                      <div className="w-full h-full bg-[#000]/10" style={{ backgroundImage: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)', backgroundSize: '8px 8px' }} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hint overlay */}
            {regions.length === 0 && !isDragging && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900/80 text-white text-xs font-semibold rounded-full shadow-lg pointer-events-none text-center">
                Click and drag on the image to draw redaction areas
              </div>
            )}
          </div>

          {/* Sidebar Panel (Right) */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-[#3c4043]/60 p-4 flex flex-col min-h-0 bg-neutral-50/50 dark:bg-[#1a1a1c] shrink-0">
            
            {/* Redaction Type Option */}
            <div className="mb-4">
              <span className="block mb-2 text-xs font-bold text-neutral-500 dark:text-[#9aa0a6] uppercase tracking-wider">
                Redaction Effect
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBlurMode('blur')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center",
                    blurMode === 'blur'
                      ? "bg-indigo-50 dark:bg-[#1e2338] border-indigo-500 text-indigo-700 dark:text-[#a8b1ff]"
                      : "bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-600 dark:text-[#e8eaed] hover:border-neutral-300"
                  )}
                >
                  <Eye className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Smooth Blur</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBlurMode('pixelate')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center",
                    blurMode === 'pixelate'
                      ? "bg-indigo-50 dark:bg-[#1e2338] border-indigo-500 text-indigo-700 dark:text-[#a8b1ff]"
                      : "bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-600 dark:text-[#e8eaed] hover:border-neutral-300"
                  )}
                >
                  <Sparkles className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Pixelate</span>
                </button>
              </div>
            </div>

            {/* List of Regions */}
            <div className="flex-1 flex flex-col min-h-0 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-500 dark:text-[#9aa0a6] uppercase tracking-wider">
                  Active Areas ({regions.length})
                </span>
                {regions.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] font-bold text-red-600 dark:text-[#f28b82] hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {regions.length === 0 ? (
                <div className="flex-1 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 text-center text-neutral-400">
                  <ShieldAlert className="w-8 h-8 mb-2 text-neutral-300 dark:text-[#5f6368]" />
                  <span className="text-xs font-medium">No redaction areas defined yet.</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[30vh] md:max-h-none">
                  {regions.map((region, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043]/80 rounded-xl text-xs hover:border-indigo-300 dark:hover:border-[#5f6368] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-neutral-100 dark:bg-[#303134] text-[10px] font-bold text-neutral-600 dark:text-[#e8eaed] flex items-center justify-center font-mono">
                          #{idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-700 dark:text-[#e8eaed]">
                            Area {Math.round(region.width * 100)}% × {Math.round(region.height * 100)}%
                          </span>
                          <span className="text-[10px] text-neutral-400 dark:text-[#9aa0a6] font-mono">
                            x:{Math.round(region.x * 100)}% y:{Math.round(region.y * 100)}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRegion(idx)}
                        className="p-1.5 transition-colors rounded-lg text-neutral-400 hover:bg-red-50 dark:hover:bg-[#3c1e1e] hover:text-red-600 dark:hover:text-[#f28b82] cursor-pointer"
                        title="Delete region"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-neutral-300 dark:border-[#3c4043] text-neutral-700 dark:text-[#e8eaed] bg-white dark:bg-[#202124] hover:bg-neutral-50 dark:hover:bg-[#303134] transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#a8c7fa] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
                Save Regions
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
