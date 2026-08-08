import React from 'react';
import { TargetFormat, ConversionSettings } from '../types';
import { Globe, Smartphone, Minimize2, Zap, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface GlobalControlsProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  disabled?: boolean;
  onConvert?: () => void;
  onStop?: () => void;
  isProcessing?: boolean;
  isStopping?: boolean;
  pendingCount?: number;
}

function GlobalControlsComponent({
  settings,
  onChange,
  disabled,
  onConvert,
  onStop,
  isProcessing = false,
  isStopping = false,
  pendingCount = 0
}: GlobalControlsProps) {
  const [localQuality, setLocalQuality] = React.useState(settings.quality);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setLocalQuality(settings.quality);
  }, [settings.quality]);

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleQualityChange = (val: number) => {
    setLocalQuality(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange({ ...settings, quality: val });
    }, 100);
  };

  const handleQualityCommit = (val: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange({ ...settings, quality: val });
  };
  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#303134] p-4 sm:p-5 rounded-3xl border border-neutral-200 dark:border-[#3c4043] shadow-sm w-full relative z-30 min-h-[140px]">
      
      {/* Top Row: Format, Quality & Desktop Action */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4 w-full lg:w-auto flex-1">
          {/* Format Selection - Highlighted to be very visible */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-black text-neutral-500 dark:text-[#9aa0a6] uppercase tracking-wider">
              Output Format
            </label>
            <div className="relative">
              <select
                disabled={disabled}
                value={settings.targetFormat}
                onChange={(e) => onChange({ ...settings, targetFormat: e.target.value as TargetFormat })}
                className="w-full sm:w-60 appearance-none bg-blue-50 dark:bg-[#1e293b] border-2 border-blue-200 dark:border-[#384c6c] text-blue-700 dark:text-[#8ab4f8] text-sm sm:text-base font-black rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
              >
                <option value="webp">Convert to WebP (Recommended)</option>
                <option value="jpg">Convert to JPG</option>
                <option value="png">Convert to PNG (Lossless)</option>
                <option value="avif">Convert to AVIF (Next-Gen)</option>
                <option value="ico">Convert to ICO (Favicon)</option>
                <option value="pdf">Convert to PDF Document</option>
                <option value="bmp">Convert to BMP</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-700 dark:text-[#8ab4f8]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Quality Slider */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] w-full sm:w-auto mt-2 sm:mt-0">
            <label className="text-xs font-black text-neutral-500 dark:text-[#9aa0a6] uppercase tracking-wider whitespace-nowrap">
              Quality: {Math.round(localQuality * 100)}%
            </label>
            <div className="flex items-center h-[52px]">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                disabled={disabled}
                value={localQuality}
                onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                onMouseUp={(e) => handleQualityCommit(parseFloat((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleQualityCommit(parseFloat((e.target as HTMLInputElement).value))}
                className="w-full h-2.5 bg-neutral-200 dark:bg-[#3c4043] rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Action Button - Visible on Desktop/Tablet inside this bar */}
        {onConvert && onStop && (
          <div className="hidden md:block w-full lg:w-auto flex-shrink-0 mt-4 lg:mt-0">
            {isProcessing ? (
              <button
                onClick={onStop}
                disabled={isStopping}
                className={cn(
                  "w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base sm:text-lg font-black text-white transition-all rounded-xl shadow-md border-b-4",
                  isStopping
                    ? "bg-amber-600 border-amber-800 cursor-not-allowed opacity-90"
                    : "bg-red-500 hover:bg-red-600 border-red-700 active:translate-y-[2px] active:border-b-0 active:mb-[4px]"
                )}
              >
                {isStopping ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Stopping...</>
                ) : (
                  <><Zap className="w-5 h-5 animate-pulse" /> Stop</>
                )}
              </button>
            ) : (
              <button
                onClick={onConvert}
                disabled={pendingCount === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base sm:text-lg font-black text-neutral-900 bg-[#fdd663] hover:bg-[#fbbc04] transition-all rounded-xl shadow-md border-b-4 border-[#e3a800] disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[2px] active:border-b-0 active:mb-[4px]"
              >
                <Zap className="w-5 h-5 fill-current" />
                Convert {pendingCount} {pendingCount === 1 ? 'File' : 'Files'}
              </button>
            )}
          </div>
        )}

      </div>

      {/* Secondary Controls: Presets & Privacy */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-[#3c4043]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-400 dark:text-[#9aa0a6] uppercase tracking-wider mr-1 hidden xl:inline-block">Presets:</span>
          <button
            disabled={disabled}
            onClick={() => onChange({ ...settings, targetFormat: 'webp', quality: 0.8, targetMaxKB: undefined })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 dark:bg-[#1e293b] dark:text-[#8ab4f8] dark:border-[#2d3a4e]"
          >
            <Globe className="w-3.5 h-3.5" /> Web Optimized
          </button>
          <button
            disabled={disabled}
            onClick={() => onChange({ ...settings, targetFormat: 'jpg', quality: 0.85, targetMaxKB: undefined })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 dark:bg-[#2e1d40] dark:text-[#c58af9] dark:border-[#432a5a]"
          >
            <Smartphone className="w-3.5 h-3.5" /> Social
          </button>
          <button
            disabled={disabled}
            onClick={() => onChange({ ...settings, targetFormat: 'webp', quality: 0.6, targetMaxKB: 100 })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 dark:bg-[#1e3427] dark:text-[#81c995] dark:border-[#2d523c]"
          >
            <Minimize2 className="w-3.5 h-3.5" /> Max Compression
          </button>
        </div>

        {/* Privacy Toggle */}
        <label className="flex items-center gap-2 cursor-pointer sm:ml-auto w-full sm:w-auto p-2 sm:p-0 bg-neutral-50 sm:bg-transparent dark:bg-[#202124] sm:dark:bg-transparent rounded-lg sm:rounded-none border sm:border-0 border-neutral-200 dark:border-[#3c4043]">
          <input
            type="checkbox"
            disabled={disabled}
            checked={settings.stripExif !== false}
            onChange={(e) => onChange({ ...settings, stripExif: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded border-neutral-300 dark:border-[#5f6368] dark:bg-[#303134] focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-neutral-700 dark:text-[#e8eaed] whitespace-nowrap">Strip EXIF Metadata</span>
        </label>
      </div>
    </div>
  );
}

export const GlobalControls = React.memo(GlobalControlsComponent);

