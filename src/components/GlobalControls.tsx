import React, { useState } from 'react';
import { TargetFormat, ConversionSettings } from '../types';
import { Globe, Smartphone, Minimize2, Zap, Loader2, Maximize, Crop, Settings2, ShieldCheck, Printer, RotateCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { SeoRouteData } from '../lib/seoEngine';

interface GlobalControlsProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  seoData?: SeoRouteData;
  disabled?: boolean;
  onConvert?: () => void;
  onStop?: () => void;
  isProcessing?: boolean;
  isStopping?: boolean;
  pendingCount?: number;
  successCount?: number;
  onContinueToDownload?: () => void;
}

function GlobalControlsComponent({
  settings,
  onChange,
  seoData,
  disabled,
  onConvert,
  onStop,
  isProcessing = false,
  isStopping = false,
  pendingCount = 0,
  successCount = 0,
  onContinueToDownload
}: GlobalControlsProps) {
  const [localQuality, setLocalQuality] = React.useState(settings.quality);
  const [localMaxKB, setLocalMaxKB] = React.useState(settings.targetMaxKB?.toString() || '');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [customCropWidth, setCustomCropWidth] = React.useState<string>(
    settings.cropAspectRatio ? String(settings.cropAspectRatio.width) : '16'
  );
  const [customCropHeight, setCustomCropHeight] = React.useState<string>(
    settings.cropAspectRatio ? String(settings.cropAspectRatio.height) : '9'
  );
  const [customDpiInput, setCustomDpiInput] = React.useState<string>(
    settings.targetDPI ? String(settings.targetDPI) : '300'
  );

  React.useEffect(() => {
    setLocalQuality(settings.quality);
  }, [settings.quality]);

  React.useEffect(() => {
    setLocalMaxKB(settings.targetMaxKB?.toString() || '');
  }, [settings.targetMaxKB]);

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const updateSettings = (updates: Partial<ConversionSettings>) => {
    onChange({ ...settings, ...updates });
  };

  const updateResize = (updates: Partial<ConversionSettings['resize']>) => {
    onChange({ ...settings, resize: { ...settings.resize, ...updates } });
  };

  const handleQualityChange = (val: number) => {
    setLocalQuality(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange({ ...settings, quality: val });
    }, 100);
  };

  const handleMaxKBChange = (val: string) => {
    setLocalMaxKB(val);
    const parsed = parseInt(val, 10);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange({ ...settings, targetMaxKB: !isNaN(parsed) && parsed > 0 ? parsed : undefined });
    }, 500);
  };

  const handleQualityCommit = (val: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange({ ...settings, quality: val });
  };

  const path = seoData?.path || '';
  const isCompressionMode = seoData?.pageCategory === 'compression' || seoData?.targetMaxKB !== undefined || path.includes('compress');
  const isLockedFormat = !!seoData?.toFormat;

  const isResizePrimary = seoData?.presetResize !== undefined || path.includes('resize') || path.includes('passport') || path.includes('size-reducer');
  const isCropPrimary = path.includes('crop');
  const isDpiPrimary = path.includes('dpi');
  const isRotationPrimary = path.includes('rotate') || path.includes('flip');
  const isPrivacyPrimary = path.includes('exif') || path.includes('metadata');

  const renderResizeControls = () => (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#202124] border border-emerald-100 dark:border-[#2d523c] rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-[#1e3427] text-emerald-600 dark:text-[#81c995] rounded-lg">
            <Maximize className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">Dimension Resizing</h4>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.resize.enabled}
            onChange={(e) => updateResize({ enabled: e.target.checked })}
            disabled={disabled}
          />
          <div className="w-10 h-6 bg-neutral-300 dark:bg-[#303134] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#e8eaed] after:border-neutral-300 dark:after:border-[#3c4043] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 dark:peer-checked:bg-[#81c995]"></div>
        </label>
      </div>

      {settings.resize.enabled && (
        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
          <div>
            <label className="block mb-1 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">Max Width (px)</label>
            <input
              type="number"
              value={settings.resize.maxWidth || ''}
              onChange={(e) => updateResize({ maxWidth: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g. 1920"
              disabled={disabled}
              className="w-full px-3 py-1.5 text-xs font-semibold border-2 rounded-xl bg-neutral-50 dark:bg-[#303134] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-emerald-500 focus:outline-none transition-colors shadow-xs"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">Max Height (px)</label>
            <input
              type="number"
              value={settings.resize.maxHeight || ''}
              onChange={(e) => updateResize({ maxHeight: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g. 1080"
              disabled={disabled}
              className="w-full px-3 py-1.5 text-xs font-semibold border-2 rounded-xl bg-neutral-50 dark:bg-[#303134] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-emerald-500 focus:outline-none transition-colors shadow-xs"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-0.5 col-span-2">
            <input
              type="checkbox"
              checked={settings.resize.keepAspectRatio}
              onChange={(e) => updateResize({ keepAspectRatio: e.target.checked })}
              disabled={disabled}
              className="w-3.5 h-3.5 rounded text-emerald-500 border-neutral-300 focus:ring-emerald-500"
            />
            <span className="text-xs font-semibold text-neutral-700 dark:text-[#e8eaed]">Keep aspect ratio</span>
          </label>
        </div>
      )}
    </div>
  );

  const renderCropControls = () => (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#202124] border border-indigo-100 dark:border-[#282d4a] rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-[#1e2338] text-indigo-600 dark:text-[#a8b1ff] rounded-lg">
            <Crop className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">Crop Aspect Ratio</h4>
        </div>
        {settings.cropAspectRatio && (
          <button
            type="button"
            onClick={() => updateSettings({ cropAspectRatio: null })}
            disabled={disabled}
            className="text-[11px] font-bold text-indigo-600 dark:text-[#a8b1ff] hover:underline cursor-pointer"
          >
            Clear Crop
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {[
          { label: '1:1 (Square)', value: { width: 1, height: 1 } },
          { label: '4:3 (Classic)', value: { width: 4, height: 3 } },
          { label: '16:9 (Widescreen)', value: { width: 16, height: 9 } },
          { label: '9:16 (Story)', value: { width: 9, height: 16 } },
        ].map((preset) => {
          const isActive = settings.cropAspectRatio?.width === preset.value.width && settings.cropAspectRatio?.height === preset.value.height;
          return (
            <button
              key={preset.label}
              type="button"
              disabled={disabled}
              onClick={() => {
                updateSettings({ cropAspectRatio: preset.value });
                if (preset.value) {
                  setCustomCropWidth(String(preset.value.width));
                  setCustomCropHeight(String(preset.value.height));
                }
              }}
              className={cn(
                "px-2 py-1.5 text-[11px] font-bold rounded-lg border transition-all text-center truncate cursor-pointer",
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 dark:bg-[#8ab4f8] dark:text-[#202124] dark:border-[#8ab4f8]"
                  : "bg-neutral-50 dark:bg-[#303134] text-neutral-700 dark:text-[#e8eaed] border-neutral-200 dark:border-[#3c4043] hover:border-indigo-400"
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      
      <div className="pt-2 border-t border-neutral-100 dark:border-[#3c4043]">
        <label className="block mb-1.5 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">
          Custom Ratio (W : H)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="1000"
            disabled={disabled}
            value={customCropWidth}
            onChange={(e) => {
              const val = e.target.value;
              setCustomCropWidth(val);
              const w = parseFloat(val);
              const h = parseFloat(customCropHeight);
              if (!isNaN(w) && w > 0 && !isNaN(h) && h > 0) {
                updateSettings({ cropAspectRatio: { width: w, height: h } });
              }
            }}
            className="w-20 px-3 py-1.5 text-xs font-semibold border-2 rounded-xl bg-neutral-50 dark:bg-[#303134] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-indigo-500 focus:outline-none transition-colors"
          />
          <span className="text-xs font-bold text-neutral-500 dark:text-[#9aa0a6]">:</span>
          <input
            type="number"
            min="1"
            max="1000"
            disabled={disabled}
            value={customCropHeight}
            onChange={(e) => {
              const val = e.target.value;
              setCustomCropHeight(val);
              const w = parseFloat(customCropWidth);
              const h = parseFloat(val);
              if (!isNaN(w) && w > 0 && !isNaN(h) && h > 0) {
                updateSettings({ cropAspectRatio: { width: w, height: h } });
              }
            }}
            className="w-20 px-3 py-1.5 text-xs font-semibold border-2 rounded-xl bg-neutral-50 dark:bg-[#303134] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );

  const renderDpiControls = () => (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#202124] border border-blue-100 dark:border-[#2d3a4e] rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8] rounded-lg">
            <Printer className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">Target DPI</h4>
        </div>
        {settings.targetDPI !== null && settings.targetDPI !== undefined && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateSettings({ targetDPI: null })}
            className="text-[11px] font-bold text-blue-600 dark:text-[#8ab4f8] hover:underline cursor-pointer"
          >
            Clear DPI
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: '72 (Web)', value: 72 },
          { label: '150 (Draft)', value: 150 },
          { label: '300 (Print)', value: 300 },
        ].map((preset) => {
          const isActive = settings.targetDPI === preset.value;
          return (
            <button
              key={preset.label}
              type="button"
              disabled={disabled}
              onClick={() => {
                updateSettings({ targetDPI: preset.value });
                if (preset.value) setCustomDpiInput(String(preset.value));
              }}
              className={cn(
                "px-2 py-1.5 text-[11px] font-bold rounded-lg border transition-all text-center truncate cursor-pointer",
                isActive
                  ? "bg-blue-600 text-white border-blue-600 dark:bg-[#8ab4f8] dark:text-[#202124] dark:border-[#8ab4f8]"
                  : "bg-neutral-50 dark:bg-[#303134] text-neutral-700 dark:text-[#e8eaed] border-neutral-200 dark:border-[#3c4043] hover:border-blue-400"
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      
      <div className="pt-2 border-t border-neutral-100 dark:border-[#3c4043] flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">
          Custom DPI
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="2400"
            disabled={disabled}
            value={customDpiInput}
            onChange={(e) => {
              const val = e.target.value;
              setCustomDpiInput(val);
              const num = parseInt(val, 10);
              if (!isNaN(num) && num > 0) {
                updateSettings({ targetDPI: num });
              }
            }}
            className="w-24 px-3 py-1.5 text-xs font-semibold border-2 rounded-xl bg-neutral-50 dark:bg-[#303134] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );

  const renderRotationControls = () => (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#202124] border border-amber-100 dark:border-[#3a2818] rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 dark:bg-[#3a2818] text-amber-600 dark:text-[#fdd663] rounded-lg">
            <RotateCw className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">Batch Rotation</h4>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: '0°', value: 0 },
          { label: '90°', value: 90 },
          { label: '180°', value: 180 },
          { label: '270°', value: 270 },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={disabled}
            onClick={() => updateSettings({ rotation: preset.value })}
            className={cn(
              "px-2 py-1.5 text-[11px] font-bold rounded-lg border transition-all text-center cursor-pointer",
              settings.rotation === preset.value || (preset.value === 0 && !settings.rotation)
                ? "bg-amber-500 text-white border-amber-500 dark:bg-[#fdd663] dark:text-[#202124] dark:border-[#fdd663]"
                : "bg-neutral-50 dark:bg-[#303134] text-neutral-700 dark:text-[#e8eaed] border-neutral-200 dark:border-[#3c4043] hover:border-amber-400"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderPrivacyControls = () => (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#202124] border border-rose-100 dark:border-[#381e26] rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-100 dark:bg-[#381e26] text-rose-600 dark:text-[#f28b82] rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">Metadata & Privacy</h4>
        </div>
      </div>
      
      <label className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-xl cursor-pointer hover:border-rose-300 dark:hover:border-rose-800 transition-colors">
        <input
          type="checkbox"
          checked={settings.stripExif !== false}
          onChange={(e) => updateSettings({ stripExif: e.target.checked })}
          disabled={disabled}
          className="mt-0.5 w-4 h-4 text-rose-500 rounded border-neutral-300 dark:border-[#5f6368] dark:bg-[#202124] focus:ring-rose-500 cursor-pointer"
        />
        <div>
          <span className="block text-xs font-bold text-neutral-800 dark:text-[#e8eaed]">
            Strip EXIF & Location Data
          </span>
          <span className="block text-[11px] text-neutral-500 dark:text-[#9aa0a6] mt-0.5">
            Removes camera metadata, GPS location, and other identifiable info.
          </span>
        </div>
      </label>
    </div>
  );

  // Filter which secondary controls to display based on what is already primary
  const advancedControls = [
    { key: 'resize', render: renderResizeControls, isPrimary: isResizePrimary },
    { key: 'crop', render: renderCropControls, isPrimary: isCropPrimary },
    { key: 'dpi', render: renderDpiControls, isPrimary: isDpiPrimary },
    { key: 'rotation', render: renderRotationControls, isPrimary: isRotationPrimary },
    { key: 'privacy', render: renderPrivacyControls, isPrimary: isPrivacyPrimary },
  ];

  const primaryRenderers = advancedControls.filter(c => c.isPrimary);
  const secondaryRenderers = advancedControls.filter(c => !c.isPrimary);

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#303134] p-4 sm:p-5 rounded-3xl border border-neutral-200 dark:border-[#3c4043] shadow-sm w-full relative z-30 min-h-[140px]">
      
      {/* 1. Primary Task Controls & Main Action */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4 w-full lg:w-auto flex-1">
          {/* Format Selection - Hide if format is locked to focus on primary intent */}
          {!isLockedFormat && (
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-black text-neutral-500 dark:text-[#9aa0a6] uppercase tracking-wider">
                Output Format
              </label>
              <div className="relative">
                <select
                  disabled={disabled}
                  value={settings.targetFormat}
                  onChange={(e) => onChange({ ...settings, targetFormat: e.target.value as TargetFormat })}
                  className="w-full sm:w-48 appearance-none bg-blue-50 dark:bg-[#1e293b] border-2 border-blue-200 dark:border-[#384c6c] text-blue-700 dark:text-[#8ab4f8] text-sm sm:text-base font-black rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
                  title="Select the target output format for all images"
                >
                  <option value="webp">WebP (Recommended)</option>
                  <option value="jpg">JPG (JPEG)</option>
                  <option value="png">PNG (Lossless)</option>
                  <option value="avif">AVIF (High Efficiency)</option>
                  <option value="bmp">BMP (Bitmap)</option>
                  <option value="ico">ICO (Favicon)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-700 dark:text-[#8ab4f8]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          )}

          {/* Context-aware primary control: Target Size OR Quality */}
          {isCompressionMode ? (
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] w-full sm:w-auto mt-2 sm:mt-0">
              <label className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider whitespace-nowrap">
                Compression Mode
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <select
                  disabled={disabled}
                  value={settings.targetMaxKB ? 'target' : (localQuality > 0.95 ? 'lossless' : 'auto')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'target') {
                      handleMaxKBChange(localMaxKB || '50');
                    } else if (val === 'lossless') {
                      handleQualityChange(1);
                      onChange({ ...settings, targetMaxKB: undefined, quality: 1 });
                    } else {
                      handleQualityChange(0.8);
                      onChange({ ...settings, targetMaxKB: undefined, quality: 0.8 });
                    }
                  }}
                  className="w-full sm:w-48 appearance-none bg-emerald-50 dark:bg-[#1e3427] border-2 border-emerald-200 dark:border-[#2d523c] text-emerald-700 dark:text-emerald-300 text-sm sm:text-base font-black rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-sm"
                >
                  <option value="auto">Auto — Best Balance</option>
                  <option value="target">Target File Size</option>
                  <option value="lossless">Lossless</option>
                </select>

                {settings.targetMaxKB !== undefined && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      disabled={disabled}
                      value={localMaxKB}
                      onChange={(e) => handleMaxKBChange(e.target.value)}
                      className="w-full sm:w-32 bg-white dark:bg-[#202124] border-2 border-emerald-200 dark:border-[#2d523c] text-neutral-800 dark:text-[#e8eaed] text-sm sm:text-base font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-sm"
                    />
                    <span className="text-sm font-bold text-neutral-500 dark:text-[#9aa0a6]">KB</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
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
          )}
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
            ) : pendingCount === 0 && successCount > 0 && onContinueToDownload ? (
              <button
                onClick={onContinueToDownload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base sm:text-lg font-black rounded-xl shadow-md border-b-4 transition-all bg-emerald-600 text-white border-emerald-800 hover:bg-emerald-700 active:translate-y-[2px] active:border-b-0 active:mb-[4px]"
              >
                Continue to Download
              </button>
            ) : (
              <button
                onClick={onConvert}
                disabled={pendingCount === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base sm:text-lg font-black text-neutral-900 bg-[#fdd663] hover:bg-[#fbbc04] transition-all rounded-xl shadow-md border-b-4 border-[#e3a800] disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[2px] active:border-b-0 active:mb-[4px]"
              >
                <Zap className="w-5 h-5 fill-current" />
                {isCompressionMode ? 'Compress' : (isResizePrimary ? 'Resize' : (isCropPrimary ? 'Crop' : 'Convert'))} {pendingCount} {pendingCount === 1 ? 'Image' : 'Images'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Primary Dynamic Specific Controls (Shown based on SEO intent) */}
      {primaryRenderers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 dark:border-[#3c4043] animate-in fade-in">
          {primaryRenderers.map(r => (
            <React.Fragment key={r.key}>{r.render()}</React.Fragment>
          ))}
        </div>
      )}

      {/* Presets and Advanced Options Toggle Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-[#3c4043]">
        <div className="flex flex-wrap items-center gap-2">
          {!isLockedFormat && !isCompressionMode && (
            <>
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
            </>
          )}
        </div>

        {secondaryRenderers.length > 0 && (
          <button
            disabled={disabled}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 cursor-pointer sm:ml-auto w-full sm:w-auto px-4 py-2 bg-neutral-50 hover:bg-neutral-100 dark:bg-[#202124] dark:hover:bg-[#292a2d] transition-colors rounded-xl border border-neutral-200 dark:border-[#3c4043]"
            aria-expanded={showAdvanced}
          >
            <Settings2 className="w-4 h-4 text-neutral-600 dark:text-[#9aa0a6]" />
            <span className="text-sm font-bold text-neutral-700 dark:text-[#e8eaed]">
              {showAdvanced ? "Hide editing options" : "More editing options"}
            </span>
          </button>
        )}
      </div>

      {/* Advanced Collapsible Content */}
      {showAdvanced && secondaryRenderers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 dark:border-[#3c4043] animate-in fade-in slide-in-from-top-2">
          {secondaryRenderers.map(r => (
            <React.Fragment key={r.key}>{r.render()}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export const GlobalControls = React.memo(GlobalControlsComponent);
