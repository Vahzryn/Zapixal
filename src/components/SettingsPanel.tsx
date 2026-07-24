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

export function SettingsPanel({ settings, onChange, disabled }: SettingsPanelProps) {
  const updateSettings = (updates: Partial<ConversionSettings>) => {
    onChange({ ...settings, ...updates });
  };

  const updateResize = (updates: Partial<ConversionSettings['resize']>) => {
    onChange({ ...settings, resize: { ...settings.resize, ...updates } });
  };

  return (
    <div className={cn("flex flex-col gap-8 p-8 bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-3xl shadow-sm", disabled && "opacity-50 pointer-events-none")}>
      
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
              className="px-3 py-2.5 text-xs font-bold rounded-xl bg-neutral-100 dark:bg-[#202124] hover:bg-neutral-200 dark:hover:bg-[#3c4043] text-neutral-700 dark:text-[#e8eaed] transition-all border border-transparent hover:border-amber-400 dark:hover:border-[#fdd663] text-center"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8] rounded-xl">
              <FileImage className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Output Format</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FORMATS.map((format) => (
            <button
              key={format.value}
              onClick={() => updateSettings({ targetFormat: format.value })}
              className={cn(
                "px-3 py-2.5 text-sm font-bold rounded-xl transition-all border-2",
                settings.targetFormat === format.value
                  ? "border-blue-600 bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] dark:border-[#8ab4f8] shadow-sm"
                  : "border-transparent bg-neutral-100 dark:bg-[#202124] text-neutral-600 dark:text-[#9aa0a6] hover:bg-neutral-200 dark:hover:bg-[#3c4043]"
              )}
            >
              {format.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {settings.targetFormat !== 'png' && settings.targetFormat !== 'ico' && settings.targetFormat !== 'bmp' && (
        <div className="pt-6 border-t border-neutral-100 dark:border-[#3c4043]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 dark:bg-[#2c1a32] text-purple-600 dark:text-[#c58af9] rounded-xl">
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Quality & Target File Size</h3>
            </div>
            <span className="px-3 py-1 text-sm font-bold text-purple-700 dark:text-[#c58af9] bg-purple-100 dark:bg-[#3a1d48] rounded-full">
              {Math.round(settings.quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={settings.quality}
            onChange={(e) => updateSettings({ quality: parseFloat(e.target.value) })}
            className="w-full h-3 rounded-full appearance-none bg-neutral-100 dark:bg-[#202124] accent-purple-600 dark:accent-[#c58af9] cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-xs font-semibold text-neutral-400 dark:text-[#9aa0a6]">
            <span>Smallest File</span>
            <span>Highest Quality</span>
          </div>

          {/* Target Max File Size (KB) Input */}
          <div className="mt-4 p-4 bg-purple-50/50 dark:bg-[#2c1a32]/30 border border-purple-100 dark:border-[#3a1d48] rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-[#e8eaed]">
                Target Max File Size (Optional)
              </label>
              {settings.targetMaxKB && (
                <button
                  type="button"
                  onClick={() => updateSettings({ targetMaxKB: undefined })}
                  className="text-[11px] font-bold text-purple-600 hover:underline"
                >
                  Clear limit
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-semibold text-neutral-500">Target size under:</span>
              <input
                type="number"
                min="10"
                max="50000"
                value={settings.targetMaxKB || ''}
                onChange={(e) => updateSettings({ targetMaxKB: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g. 200"
                className="w-28 px-3 py-1.5 text-xs font-bold border-2 rounded-xl bg-white dark:bg-[#202124] border-purple-200 dark:border-[#3a1d48] text-neutral-800 dark:text-[#e8eaed] focus:border-purple-600 focus:outline-none shadow-xs"
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
                    "px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all",
                    settings.targetMaxKB === kb
                      ? "bg-purple-600 text-white border-purple-600 dark:bg-[#c58af9] dark:text-[#202124] dark:border-[#c58af9]"
                      : "bg-white dark:bg-[#202124] text-neutral-600 dark:text-[#9aa0a6] border-neutral-200 dark:border-[#3c4043] hover:border-purple-300"
                  )}
                >
                  &lt; {kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rotation & Orientation */}
      <div className="pt-6 border-t border-neutral-100 dark:border-[#3c4043]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8] rounded-xl">
              <RotateCw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Batch Rotation</h3>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { angle: 0, label: '0° (Original)' },
            { angle: 90, label: '90° CW' },
            { angle: 180, label: '180°' },
            { angle: 270, label: '270° CW' },
          ].map((rot) => (
            <button
              key={rot.angle}
              type="button"
              onClick={() => updateSettings({ rotation: rot.angle })}
              className={cn(
                "px-3 py-2 text-xs font-bold rounded-xl transition-all border-2 text-center",
                (settings.rotation || 0) === rot.angle
                  ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-[#1e293b] dark:text-[#8ab4f8] dark:border-[#8ab4f8]"
                  : "border-transparent bg-neutral-100 dark:bg-[#202124] text-neutral-600 dark:text-[#9aa0a6] hover:bg-neutral-200 dark:hover:bg-[#3c4043]"
              )}
            >
              {rot.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-neutral-100 dark:border-[#3c4043]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-[#1e3427] text-emerald-600 dark:text-[#81c995] rounded-xl">
              <Maximize className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Resize (Optional)</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.resize.enabled}
              onChange={(e) => updateResize({ enabled: e.target.checked })}
            />
            <div className="w-12 h-7 bg-neutral-200 dark:bg-[#202124] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#e8eaed] after:border-neutral-300 dark:after:border-[#3c4043] after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 dark:peer-checked:bg-[#81c995]"></div>
          </label>
        </div>
        
        {settings.resize.enabled && (
          <div className="flex flex-col gap-4 p-5 mt-2 bg-emerald-50/50 dark:bg-[#1e3427]/40 border border-emerald-100 dark:border-[#2d523c] rounded-2xl animate-in fade-in slide-in-from-top-2">
            {/* Quick Dimension Presets */}
            <div>
              <span className="block mb-1.5 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">
                Dimension Presets
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
                    className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-white dark:bg-[#202124] text-neutral-700 dark:text-[#e8eaed] border border-neutral-200 dark:border-[#3c4043] hover:border-emerald-500 dark:hover:border-[#81c995] transition-all text-center truncate"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">Max Width (px)</label>
                <input
                  type="number"
                  value={settings.resize.maxWidth || ''}
                  onChange={(e) => updateResize({ maxWidth: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="e.g. 1920"
                  className="w-full px-4 py-2.5 text-sm font-semibold border-2 rounded-xl bg-white dark:bg-[#202124] border-transparent dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">Max Height (px)</label>
                <input
                  type="number"
                  value={settings.resize.maxHeight || ''}
                  onChange={(e) => updateResize({ maxHeight: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="e.g. 1080"
                  className="w-full px-4 py-2.5 text-sm font-semibold border-2 rounded-xl bg-white dark:bg-[#202124] border-transparent dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={settings.resize.keepAspectRatio}
                onChange={(e) => updateResize({ keepAspectRatio: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 border-neutral-300 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-neutral-700 dark:text-[#e8eaed]">Keep aspect ratio</span>
            </label>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-neutral-100 dark:border-[#3c4043]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-[#21243a] text-indigo-600 dark:text-[#a8b1ff] rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Batch Renaming & Filename</h3>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">
                Custom Renaming Pattern
              </label>
              <span className="text-[11px] text-indigo-600 dark:text-[#a8b1ff] font-semibold">
                e.g. vacation-&#123;index&#125;
              </span>
            </div>
            <input
              type="text"
              value={settings.renamePattern || ''}
              onChange={(e) => updateSettings({ renamePattern: e.target.value })}
              placeholder="e.g. vacation-{index} or {name}_opt"
              className="w-full px-4 py-2.5 text-sm font-semibold border-2 rounded-xl bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-indigo-500 focus:outline-none transition-colors shadow-sm"
            />
            
            {/* Clickable Pattern Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-neutral-400 font-semibold flex items-center mr-1">Insert Token:</span>
              {[
                { tag: '{index}', label: '{index} (1, 2)' },
                { tag: '{index2}', label: '{index2} (01, 02)' },
                { tag: '{name}', label: '{name}' },
                { tag: '{date}', label: '{date}' },
                { tag: '{format}', label: '{format}' },
              ].map(({ tag, label }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const current = settings.renamePattern || '';
                    updateSettings({ renamePattern: current + tag });
                  }}
                  className="px-2 py-0.5 text-[11px] font-mono font-bold bg-neutral-100 hover:bg-indigo-50 text-neutral-600 hover:text-indigo-600 dark:bg-[#202124] dark:hover:bg-[#21243a] dark:text-[#9aa0a6] dark:hover:text-[#a8b1ff] rounded-md transition-all border border-neutral-200 dark:border-[#3c4043]"
                  title={`Add ${tag} token`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">Prefix</label>
              <input
                type="text"
                value={settings.filenamePrefix}
                onChange={(e) => updateSettings({ filenamePrefix: e.target.value })}
                placeholder="e.g. thumb_"
                className="w-full px-4 py-2.5 text-sm font-semibold border-2 rounded-xl bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-indigo-500 focus:outline-none transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">Suffix</label>
              <input
                type="text"
                value={settings.filenameSuffix}
                onChange={(e) => updateSettings({ filenameSuffix: e.target.value })}
                placeholder="e.g. _converted"
                className="w-full px-4 py-2.5 text-sm font-semibold border-2 rounded-xl bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-indigo-500 focus:outline-none transition-colors shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Watermarking & EXIF Privacy Safeguard */}
      <div className="pt-6 border-t border-neutral-100 dark:border-[#3c4043]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-[#341b21] text-rose-600 dark:text-[#f28b82] rounded-xl">
              <Stamp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Watermark & Privacy</h3>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-neutral-600 dark:text-[#9aa0a6]">
              Watermark Text (Optional)
            </label>
            <input
              type="text"
              value={settings.watermarkText || ''}
              onChange={(e) => updateSettings({ watermarkText: e.target.value })}
              placeholder="e.g. © 2026 Zapixal / Confidential"
              className="w-full px-4 py-2.5 text-sm font-semibold border-2 rounded-xl bg-white dark:bg-[#202124] border-neutral-200 dark:border-[#3c4043] text-neutral-800 dark:text-[#e8eaed] focus:border-rose-500 focus:outline-none transition-colors shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 dark:bg-[#1a2c20]/50 border border-emerald-100 dark:border-[#2d523c] rounded-2xl">
            <label className="flex items-center gap-3 cursor-pointer w-full">
              <input
                type="checkbox"
                checked={settings.stripExif !== false}
                onChange={(e) => updateSettings({ stripExif: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 border-neutral-300 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2.5 flex-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-[#81c995] shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-neutral-800 dark:text-[#e8eaed]">
                    Strip EXIF & Location Data (Increases Privacy)
                  </span>
                  <span className="block text-[11px] text-neutral-500 dark:text-[#9aa0a6]">
                    Wipes GPS coordinates, camera model, and timestamp metadata
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-[#81c995] bg-emerald-100 dark:bg-[#2d523c] rounded-lg shrink-0">
                {settings.stripExif !== false ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
