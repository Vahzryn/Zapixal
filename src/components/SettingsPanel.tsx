import React from 'react';
import { ConversionSettings, TargetFormat } from '../types';
import { Settings2, Maximize, FileImage, FileText, Sparkles, Stamp, ShieldCheck, RotateCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsPanelProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  disabled?: boolean;
}

const FORMATS: { value: TargetFormat; label: string }[] = [
  { value: 'webp', label: 'WebP (Recommended)' },
  { value: 'avif', label: 'AVIF (Best Compression)' },
  { value: 'jpg', label: 'JPEG' },
  { value: 'png', label: 'PNG (Lossless)' },
  { value: 'pdf', label: 'PDF Document' },
  { value: 'bmp', label: 'BMP' },
  { value: 'ico', label: 'ICO' },
];

const PRESETS = [
  {
    name: '🚀 Web Fast',
    apply: (): Partial<ConversionSettings> => ({
      targetFormat: 'webp',
      quality: 0.82,
      resize: { enabled: true, maxWidth: 1920, maxHeight: 1080, keepAspectRatio: true },
    }),
  },
  {
    name: '📱 Social Media',
    apply: (): Partial<ConversionSettings> => ({
      targetFormat: 'jpg',
      quality: 0.85,
      resize: { enabled: true, maxWidth: 1080, maxHeight: 1080, keepAspectRatio: true },
    }),
  },
  {
    name: '🎨 Pro Quality',
    apply: (): Partial<ConversionSettings> => ({
      targetFormat: 'png',
      quality: 1.0,
      resize: { enabled: false, keepAspectRatio: true },
    }),
  },
  {
    name: '⚡ Ultra Tiny',
    apply: (): Partial<ConversionSettings> => ({
      targetFormat: 'avif',
      quality: 0.60,
      resize: { enabled: true, maxWidth: 1280, maxHeight: 720, keepAspectRatio: true },
    }),
  },
];

function SettingsPanelComponent({ settings, onChange, disabled }: SettingsPanelProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(true);
  const [localQuality, setLocalQuality] = React.useState(settings.quality);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Synchronize localQuality when upstream settings.quality changes from outside (e.g. presets)
  React.useEffect(() => {
    setLocalQuality(settings.quality);
  }, [settings.quality]);

  // Clean up debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const updateSettings = (updates: Partial<ConversionSettings>) => {
    const targetFormatMode = updates.targetFormatMode !== undefined 
      ? updates.targetFormatMode 
      : (updates.targetFormat ? 'unified' : settings.targetFormatMode || 'per-original');
    onChange({ ...settings, ...updates, targetFormatMode });
  };

  const handleQualityChange = (val: number) => {
    setLocalQuality(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updateSettings({ quality: val });
    }, 100);
  };

  const handleQualityCommit = (val: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    updateSettings({ quality: val });
  };

  const updateResize = (updates: Partial<ConversionSettings['resize']>) => {
    onChange({ ...settings, resize: { ...settings.resize, ...updates } });
  };

  return (
    <div className={cn("flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-3xl shadow-sm font-sans", disabled && "opacity-50 pointer-events-none")}>
      
      {/* 1-Click Workflow Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-amber-50 dark:bg-[#322312] text-amber-600 dark:text-[#fdd663] rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Quick Workflow Presets</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => updateSettings(preset.apply())}
              className="px-3 py-2.5 text-xs font-bold rounded-xl bg-neutral-100 dark:bg-[#202124] hover:bg-neutral-200 dark:hover:bg-[#3c4043] text-neutral-700 dark:text-[#e8eaed] transition-all border border-transparent hover:border-amber-400 dark:hover:border-[#fdd663] text-center cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Target Output Format Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8] rounded-xl">
              <FileImage className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Output Format</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            onClick={() => {
              updateSettings({ targetFormatMode: 'per-original' });
            }}
            className={cn(
              "px-3 py-2.5 text-sm font-bold rounded-xl transition-all border-2 cursor-pointer col-span-2 sm:col-span-3",
              settings.targetFormatMode === 'per-original'
                ? "border-emerald-600 bg-emerald-600 text-white dark:bg-[#81c995] dark:text-[#202124] dark:border-[#81c995] shadow-sm"
                : "border-transparent bg-neutral-100 dark:bg-[#202124] text-neutral-600 dark:text-[#9aa0a6] hover:bg-neutral-200 dark:hover:bg-[#3c4043]"
            )}
          >
            Original Format (Auto-Match & Compress)
          </button>
          {FORMATS.map((format) => (
            <button
              key={format.value}
              onClick={() => {
                let newQuality = settings.quality;
                // Cap AVIF default quality so standard photos naturally compress rather than inflate
                if (format.value === 'avif' && newQuality > 0.70) {
                  newQuality = 0.70;
                }
                updateSettings({ targetFormat: format.value, quality: newQuality, targetFormatMode: 'unified' });
              }}
              className={cn(
                "px-3 py-2.5 text-sm font-bold rounded-xl transition-all border-2 cursor-pointer",
                settings.targetFormatMode === 'unified' && settings.targetFormat === format.value
                  ? "border-blue-600 bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] dark:border-[#8ab4f8] shadow-sm"
                  : "border-transparent bg-neutral-100 dark:bg-[#202124] text-neutral-600 dark:text-[#9aa0a6] hover:bg-neutral-200 dark:hover:bg-[#3c4043]"
              )}
            >
              {format.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options & Micro-Tuning Drawer Toggle */}
      <div className="pt-2 border-t border-neutral-100 dark:border-[#3c4043]">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#202124] hover:bg-neutral-100 dark:hover:bg-[#28292c] border border-neutral-200 dark:border-[#3c4043] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Settings2 className="w-5 h-5 text-purple-600 dark:text-[#c58af9]" />
            <span className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">
              Advanced Options & Micro-Tuning
            </span>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-[#c58af9] bg-purple-50 dark:bg-[#3a1d48] px-2 py-0.5 rounded-md">
              Quality, Resize, EXIF Privacy
            </span>
          </div>
          <span className="text-xs font-bold text-neutral-500 dark:text-[#9aa0a6] hover:underline">
            {showAdvanced ? 'Hide Options ▲' : 'Show Options ▼'}
          </span>
        </button>

        {/* Collapsible Power-User Drawer Content */}
        {showAdvanced && (
          <div className="flex flex-col gap-6 mt-4 p-5 bg-neutral-50/70 dark:bg-[#202124]/60 border border-neutral-200/80 dark:border-[#3c4043] rounded-2xl animate-in fade-in slide-in-from-top-2">
            
            {/* 1. Precise Quality & Target Max File Size */}
            {settings.targetFormat !== 'png' && settings.targetFormat !== 'ico' && settings.targetFormat !== 'bmp' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-[#3a1d48] text-purple-600 dark:text-[#c58af9] rounded-lg">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">Compression Quality & Target Size</h4>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-[#c58af9] bg-purple-100 dark:bg-[#3a1d48] rounded-full">
                    {Math.round(localQuality * 100)}% Quality
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={localQuality}
                  onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                  onMouseUp={(e) => handleQualityCommit(parseFloat((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => handleQualityCommit(parseFloat((e.target as HTMLInputElement).value))}
                  className="w-full h-2.5 rounded-full appearance-none bg-neutral-200 dark:bg-[#303134] accent-purple-600 dark:accent-[#c58af9] cursor-pointer"
                />
                <div className="flex justify-between mt-1 text-[11px] font-semibold text-neutral-400 dark:text-[#9aa0a6]">
                  <span>Smallest Size</span>
                  <span>Highest Fidelity</span>
                </div>

                {/* Target Max File Size (KB) Input */}
                <div className="mt-3 p-3.5 bg-white dark:bg-[#202124] border border-purple-100 dark:border-[#3a1d48] rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-800 dark:text-[#e8eaed]">
                      Target Max File Size Limit (Optional)
                    </label>
                    {settings.targetMaxKB && (
                      <button
                        type="button"
                        onClick={() => updateSettings({ targetMaxKB: undefined })}
                        className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                      >
                        Clear limit
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-neutral-500">Target size under:</span>
                    <input
                      type="number"
                      min="10"
                      max="50000"
                      value={settings.targetMaxKB || ''}
                      onChange={(e) => updateSettings({ targetMaxKB: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="e.g. 200"
                      className="w-28 px-3 py-1 text-xs font-bold border-2 rounded-xl bg-neutral-50 dark:bg-[#303134] border-purple-200 dark:border-[#3a1d48] text-neutral-800 dark:text-[#e8eaed] focus:border-purple-600 focus:outline-none shadow-xs"
                    />
                    <span className="text-xs font-bold text-neutral-700 dark:text-[#e8eaed]">KB</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[100, 200, 500, 1000].map((kb) => (
                      <button
                        key={kb}
                        type="button"
                        onClick={() => updateSettings({ targetMaxKB: kb })}
                        className={cn(
                          "px-2 py-0.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer",
                          settings.targetMaxKB === kb
                            ? "bg-purple-600 text-white border-purple-600 dark:bg-[#c58af9] dark:text-[#202124] dark:border-[#c58af9]"
                            : "bg-white dark:bg-[#303134] text-neutral-600 dark:text-[#9aa0a6] border-neutral-200 dark:border-[#3c4043] hover:border-purple-300"
                        )}
                      >
                        &lt; {kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Custom Dimension Resizing */}
            <div className="pt-4 border-t border-neutral-200/60 dark:border-[#3c4043]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-[#1e3427] text-emerald-600 dark:text-[#81c995] rounded-lg">
                    <Maximize className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">Custom Dimension Resizing</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.resize.enabled}
                    onChange={(e) => updateResize({ enabled: e.target.checked })}
                  />
                  <div className="w-10 h-6 bg-neutral-300 dark:bg-[#303134] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#e8eaed] after:border-neutral-300 dark:after:border-[#3c4043] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 dark:peer-checked:bg-[#81c995]"></div>
                </label>
              </div>
              
              {settings.resize.enabled && (
                <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#202124] border border-emerald-100 dark:border-[#2d523c] rounded-xl animate-in fade-in slide-in-from-top-1">
                  <div>
                    <span className="block mb-1.5 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">
                      Preset Dimensions
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: 'Square (1080×1080)', w: 1080, h: 1080 },
                        { label: 'Story (1080×1920)', w: 1080, h: 1920 },
                        { label: 'Full HD (1920×1080)', w: 1920, h: 1080 },
                        { label: 'Banner (1200×630)', w: 1200, h: 630 },
                        { label: 'Favicon (256×256)', w: 256, h: 256 },
                        { label: '4K (3840×2160)', w: 3840, h: 2160 },
                        { label: 'HD 720p (1280×720)', w: 1280, h: 720 },
                        { label: 'Passport (600×600)', w: 600, h: 600 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateResize({ maxWidth: preset.w, maxHeight: preset.h })}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-neutral-50 dark:bg-[#303134] text-neutral-700 dark:text-[#e8eaed] border border-neutral-200 dark:border-[#3c4043] hover:border-emerald-500 dark:hover:border-[#81c995] transition-all text-center truncate cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">Max Width (px)</label>
                      <input
                        type="number"
                        value={settings.resize.maxWidth || ''}
                        onChange={(e) => updateResize({ maxWidth: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="e.g. 1920"
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
                        className="w-full px-3 py-1.5 text-xs font-semibold border-2 rounded-xl bg-neutral-50 dark:bg-[#303134] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-emerald-500 focus:outline-none transition-colors shadow-xs"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-0.5">
                    <input
                      type="checkbox"
                      checked={settings.resize.keepAspectRatio}
                      onChange={(e) => updateResize({ keepAspectRatio: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-emerald-500 border-neutral-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-neutral-700 dark:text-[#e8eaed]">Keep aspect ratio</span>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Batch Rotation & EXIF Metadata Privacy */}
            <div className="pt-4 border-t border-neutral-200/60 dark:border-[#3c4043] grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Batch Rotation */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8] rounded-lg">
                    <RotateCw className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-[#e8eaed]">Batch Rotation</h4>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { angle: 0, label: '0°' },
                    { angle: 90, label: '90°' },
                    { angle: 180, label: '180°' },
                    { angle: 270, label: '270°' },
                  ].map((rot) => (
                    <button
                      key={rot.angle}
                      type="button"
                      onClick={() => updateSettings({ rotation: rot.angle })}
                      className={cn(
                        "px-2 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer text-center",
                        (settings.rotation || 0) === rot.angle
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-[#1e293b] dark:text-[#8ab4f8] dark:border-[#8ab4f8]"
                          : "border-neutral-200 dark:border-[#3c4043] bg-white dark:bg-[#303134] text-neutral-600 dark:text-[#9aa0a6] hover:bg-neutral-100"
                      )}
                    >
                      {rot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strip EXIF Privacy */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-[#1a2c20] text-emerald-600 dark:text-[#81c995] rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-[#e8eaed]">EXIF & Location Privacy</h4>
                </div>
                <label className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#202124] border border-emerald-100 dark:border-[#2d523c] rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.stripExif !== false}
                    onChange={(e) => updateSettings({ stripExif: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 border-neutral-300 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-neutral-800 dark:text-[#e8eaed]">
                      Strip EXIF Metadata & GPS
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-[#81c995] bg-emerald-100 dark:bg-[#2d523c] rounded-md">
                    {settings.stripExif !== false ? 'Protected' : 'Off'}
                  </span>
                </label>
              </div>

            </div>

            {/* 4. Batch Renaming & Watermark */}
            <div className="pt-4 border-t border-neutral-200/60 dark:border-[#3c4043] space-y-3">
              <div>
                <label className="block mb-1 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">
                  Watermark Text (Optional)
                </label>
                <input
                  type="text"
                  value={settings.watermarkText || ''}
                  onChange={(e) => updateSettings({ watermarkText: e.target.value })}
                  placeholder="e.g. © 2026 Zapixal / Confidential"
                  className="w-full px-3 py-1.5 text-xs font-semibold border-2 rounded-xl bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-rose-500 focus:outline-none transition-colors shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">
                    Custom Batch Renaming Pattern
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-[#a8b1ff] font-semibold">
                    e.g. photo-&#123;index2&#125;
                  </span>
                </div>
                <input
                  type="text"
                  value={settings.renamePattern || ''}
                  onChange={(e) => updateSettings({ renamePattern: e.target.value })}
                  placeholder="e.g. photo-{index} or {name}_optimized"
                  className="w-full px-3 py-1.5 text-xs font-semibold border-2 rounded-xl bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-indigo-500 focus:outline-none transition-colors shadow-xs"
                />
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

export const SettingsPanel = React.memo(SettingsPanelComponent);

