import React from 'react';
import { SlidersHorizontal, Lock, Unlock, Zap, HelpCircle } from 'lucide-react';
import { ConversionSettings, OutputFormat } from '../types';

interface SettingsBarProps {
  settings: ConversionSettings;
  onUpdateSettings: (newSettings: ConversionSettings) => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const formats: { value: OutputFormat; label: string; desc: string }[] = [
    { value: 'webp', label: 'WEBP', desc: 'Smallest Web Size' },
    { value: 'avif', label: 'AVIF', desc: 'Next-Gen Speed' },
    { value: 'jpg', label: 'JPG', desc: 'Standard Photo' },
    { value: 'png', label: 'PNG', desc: 'Lossless & Alpha' },
    { value: 'bmp', label: 'BMP', desc: 'Uncompressed' },
    { value: 'ico', label: 'ICO', desc: 'Favicon Icon' },
    { value: 'pdf', label: 'PDF', desc: 'Multi-Page Doc' },
  ];

  const handleFormatChange = (format: OutputFormat) => {
    onUpdateSettings({
      ...settings,
      targetFormat: format,
    });
  };

  const handleQualityChange = (qualityVal: number) => {
    let preset: 'custom' | 'web70' | 'balanced85' | 'max100' = 'custom';
    if (qualityVal === 0.7) preset = 'web70';
    if (qualityVal === 0.85) preset = 'balanced85';
    if (qualityVal === 1.0) preset = 'max100';

    onUpdateSettings({
      ...settings,
      quality: qualityVal,
      presetName: preset,
    });
  };

  const handlePresetClick = (preset: 'web70' | 'balanced85' | 'max100') => {
    let q = 0.85;
    if (preset === 'web70') q = 0.7;
    if (preset === 'balanced85') q = 0.85;
    if (preset === 'max100') q = 1.0;

    onUpdateSettings({
      ...settings,
      quality: q,
      presetName: preset,
    });
  };

  const handleToggleResize = () => {
    onUpdateSettings({
      ...settings,
      resize: {
        ...settings.resize,
        enabled: !settings.resize.enabled,
      },
    });
  };

  const handleWidthChange = (val: string) => {
    const num = parseInt(val, 10);
    onUpdateSettings({
      ...settings,
      resize: {
        ...settings.resize,
        maxWidth: isNaN(num) ? undefined : num,
      },
    });
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val, 10);
    onUpdateSettings({
      ...settings,
      resize: {
        ...settings.resize,
        maxHeight: isNaN(num) ? undefined : num,
      },
    });
  };

  const handleToggleAspectRatio = () => {
    onUpdateSettings({
      ...settings,
      resize: {
        ...settings.resize,
        keepAspectRatio: !settings.resize.keepAspectRatio,
      },
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 text-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <span>Global Conversion Controls</span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Applies to all files in queue
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Target Format Selection */}
        <div className="lg:col-span-5 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Target Output Format
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {formats.map((fmt) => {
              const isSelected = settings.targetFormat === fmt.value;
              return (
                <button
                  key={fmt.value}
                  onClick={() => handleFormatChange(fmt.value)}
                  title={fmt.desc}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm scale-[1.02]'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white font-medium'
                  }`}
                >
                  <span>{fmt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Quality Control & Presets */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Compression Quality
            </label>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {Math.round(settings.quality * 100)}%
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.05"
              value={settings.quality}
              onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
              disabled={settings.targetFormat === 'png'}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
            />

            {/* Quick Quality Presets */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                onClick={() => handlePresetClick('web70')}
                className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  settings.presetName === 'web70'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Web 70%
              </button>
              <button
                onClick={() => handlePresetClick('balanced85')}
                className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  settings.presetName === 'balanced85'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Balanced 85%
              </button>
              <button
                onClick={() => handlePresetClick('max100')}
                className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  settings.presetName === 'max100'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Max 100%
              </button>
            </div>
          </div>
        </div>

        {/* 3. Aspect-Ratio Safe Resize */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Aspect-Ratio Resize
            </label>
            <button
              onClick={handleToggleResize}
              className={`text-xs px-2 py-0.5 rounded font-bold transition-colors ${
                settings.resize.enabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {settings.resize.enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {settings.resize.enabled ? (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="number"
                placeholder="Max W (px)"
                value={settings.resize.maxWidth || ''}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleToggleAspectRatio}
                title={
                  settings.resize.keepAspectRatio
                    ? 'Aspect ratio locked'
                    : 'Aspect ratio unlocked'
                }
                className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
              >
                {settings.resize.keepAspectRatio ? (
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-amber-600" />
                )}
              </button>
              <input
                type="number"
                placeholder="Max H (px)"
                value={settings.resize.maxHeight || ''}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <div className="text-xs text-slate-500 pt-2 font-medium">
              Images retain original dimensions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
