import React from 'react';
import { ConversionSettings, TargetFormat } from '../types';
import { Settings2, Maximize, FileImage, FileText } from 'lucide-react';
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

export function SettingsPanel({ settings, onChange, disabled }: SettingsPanelProps) {
  const updateSettings = (updates: Partial<ConversionSettings>) => {
    onChange({ ...settings, ...updates });
  };

  const updateResize = (updates: Partial<ConversionSettings['resize']>) => {
    onChange({ ...settings, resize: { ...settings.resize, ...updates } });
  };

  return (
    <div className={cn("flex flex-col gap-8 p-8 bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-3xl shadow-sm", disabled && "opacity-50 pointer-events-none")}>
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
              <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Quality Compression</h3>
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
        </div>
      )}

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
            <h3 className="text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">Filename Options</h3>
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
  );
}
