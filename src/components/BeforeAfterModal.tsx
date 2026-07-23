import React, { useState } from 'react';
import { X, Sliders, ArrowLeftRight, Check, Sparkles } from 'lucide-react';
import { calculateSavings, formatBytes } from '../lib/imageProcessor';
import { ImageFileItem } from '../types';

interface BeforeAfterModalProps {
  item: ImageFileItem;
  onClose: () => void;
}

export const BeforeAfterModal: React.FC<BeforeAfterModalProps> = ({
  item,
  onClose,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');

  if (!item.convertedUrl) return null;

  const originalSizeStr = formatBytes(item.originalSize);
  const convertedSizeStr = item.convertedSize ? formatBytes(item.convertedSize) : 'N/A';
  const savings = item.convertedSize
    ? calculateSavings(item.originalSize, item.convertedSize)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-t-8 border-blue-600 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-800">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Visual Comparison: {item.name}</span>
            </h3>
            {savings && (
              <p className="text-xs text-slate-500 mt-0.5">
                Original: <span className="text-slate-800 font-semibold">{originalSizeStr}</span> → Converted:{' '}
                <span className="text-emerald-600 font-bold">{convertedSizeStr}</span> (
                {savings.isSmaller ? `-${savings.percentage}% smaller` : 'larger'})
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
              <button
                onClick={() => setViewMode('slider')}
                className={`px-2.5 py-1 rounded font-semibold ${
                  viewMode === 'slider' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Slider
              </button>
              <button
                onClick={() => setViewMode('sideBySide')}
                className={`px-2.5 py-1 rounded font-semibold ${
                  viewMode === 'sideBySide' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Side-by-Side
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Comparison Visual */}
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center bg-slate-100/60">
          {viewMode === 'slider' ? (
            <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden border border-slate-300 select-none bg-slate-200">
              {/* Converted Image (Underneath) */}
              <img
                src={typeof item.convertedUrl === 'string' ? item.convertedUrl : URL.createObjectURL(item.convertedUrl)}
                alt="Converted"
                className="absolute inset-0 w-full h-full object-contain bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"
              />

              {/* Original Image (Clipped Top Layer) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={item.previewUrl}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain max-w-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-600 shadow-md cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg -ml-3.5">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
              </div>

              {/* Slider Input overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
              />

              {/* Labels */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800 border border-slate-200 shadow-xs">
                Original ({originalSizeStr})
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-700 border border-emerald-200 shadow-xs">
                Converted ({convertedSizeStr})
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block text-center">
                  Original Image ({originalSizeStr})
                </span>
                <div className="aspect-square bg-white border border-slate-200 rounded-xl overflow-hidden p-2 flex items-center justify-center shadow-xs">
                  <img
                    src={item.previewUrl}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-700 block text-center">
                  Converted Result ({convertedSizeStr})
                </span>
                <div className="aspect-square bg-white border border-slate-200 rounded-xl overflow-hidden p-2 flex items-center justify-center shadow-xs">
                  <img
                    src={
                      typeof item.convertedUrl === 'string'
                        ? item.convertedUrl
                        : URL.createObjectURL(item.convertedUrl)
                    }
                    alt="Converted"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
