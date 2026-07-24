import React, { useEffect, useState } from 'react';
import { ImageFileItem } from '../types';
import { formatBytes } from '../lib/utils';
import { X, Info, Palette, Copy, Check, Layers, Image as ImageIcon } from 'lucide-react';

interface ImageDetailsModalProps {
  item: ImageFileItem;
  onClose: () => void;
}

export function ImageDetailsModal({ item, onClose }: ImageDetailsModalProps) {
  const [colors, setColors] = useState<string[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(
    item.dimensions || null
  );

  const previewUrl = React.useMemo(() => {
    return item.convertedUrl || URL.createObjectURL(item.file);
  }, [item.convertedUrl, item.file]);

  // Extract color palette & verify exact natural dimensions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewUrl;

    img.onload = () => {
      if (!imgDimensions) {
        setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }

      // Sample colors on small 24x24 canvas
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 24, 24);
      const imgData = ctx.getImageData(0, 0, 24, 24).data;

      const colorMap = new Map<string, number>();
      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        if (a < 128) continue; // Skip transparent pixels

        // Quantize colors to reduce noise
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;

        const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }

      const sorted = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map((entry) => entry[0]);

      setColors(sorted);
    };
  }, [previewUrl, imgDimensions]);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const calculateAspectRatio = (w: number, h: number) => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(w, h);
    const rw = w / divisor;
    const rh = h / divisor;
    if (rw > 20 || rh > 20) {
      return (w / h).toFixed(2) + ':1';
    }
    return `${rw}:${rh}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-2xl bg-white dark:bg-[#202124] rounded-3xl shadow-2xl border border-neutral-200 dark:border-[#3c4043] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-[#3c4043]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-[#21243a] text-indigo-600 dark:text-[#a8b1ff] rounded-2xl">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-[#e8eaed]">Image Details & Palette</h3>
              <p className="text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6] truncate max-w-xs sm:max-w-md">
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Image Preview Canvas */}
          <div className="relative w-full h-52 bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center border border-neutral-800">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
              style={{ transform: `rotate(${item.rotation || 0}deg)` }}
            />
          </div>

          {/* Quick Technical Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-neutral-50 dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
              <span className="block text-[11px] font-bold text-neutral-400 dark:text-[#9aa0a6] uppercase tracking-wider">Original Size</span>
              <span className="text-sm font-black text-neutral-800 dark:text-[#e8eaed] mt-0.5 block">
                {formatBytes(item.originalSize)}
              </span>
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
              <span className="block text-[11px] font-bold text-neutral-400 dark:text-[#9aa0a6] uppercase tracking-wider">Dimensions</span>
              <span className="text-sm font-black text-neutral-800 dark:text-[#e8eaed] mt-0.5 block">
                {imgDimensions ? `${imgDimensions.width} × ${imgDimensions.height}` : 'Loading...'}
              </span>
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
              <span className="block text-[11px] font-bold text-neutral-400 dark:text-[#9aa0a6] uppercase tracking-wider">Aspect Ratio</span>
              <span className="text-sm font-black text-blue-600 dark:text-[#8ab4f8] mt-0.5 block">
                {imgDimensions ? calculateAspectRatio(imgDimensions.width, imgDimensions.height) : '-'}
              </span>
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
              <span className="block text-[11px] font-bold text-neutral-400 dark:text-[#9aa0a6] uppercase tracking-wider">MIME Type</span>
              <span className="text-sm font-black text-neutral-800 dark:text-[#e8eaed] mt-0.5 block uppercase truncate">
                {item.file.type.replace('image/', '') || 'UNKNOWN'}
              </span>
            </div>
          </div>

          {/* Color Palette Extraction */}
          <div className="p-5 bg-neutral-50 dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600 dark:text-[#a8b1ff]" />
                <h4 className="text-sm font-bold text-neutral-800 dark:text-[#e8eaed]">Extracted Color Palette</h4>
              </div>
              <span className="text-[11px] font-semibold text-neutral-400">Click color code to copy</span>
            </div>

            {colors.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {colors.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => copyToClipboard(hex)}
                    className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] hover:border-indigo-500 transition-all group"
                  >
                    <div
                      className="w-full h-10 rounded-lg shadow-inner mb-1.5 border border-black/10"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[11px] font-mono font-bold text-neutral-700 dark:text-[#e8eaed] group-hover:text-indigo-600 flex items-center gap-1">
                      {copiedColor === hex ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        hex
                      )}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">Analyzing palette...</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
