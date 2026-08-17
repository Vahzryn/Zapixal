import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, ExternalLink, Loader2, Download, Settings } from 'lucide-react';
import { convertSingleImage } from '../../lib/conversionOrchestrator';
import { ConversionSettings, TargetFormat } from '../../types';

export default function EmbedWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; name: string; width?: number; height?: number } | null>(null);
  const [progress, setProgress] = useState(0);

  // Dynamic parameters from URL or UI controls
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('webp');
  const [quality, setQuality] = useState<number>(80);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Parse URL query parameters if available
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fmt = params.get('format')?.toLowerCase();
      if (fmt === 'jpeg' || fmt === 'jpg') setTargetFormat('jpg');
      else if (fmt === 'png') setTargetFormat('png');
      else if (fmt === 'webp') setTargetFormat('webp');
      else if (fmt === 'avif') setTargetFormat('avif');

      const q = parseInt(params.get('quality') || '', 10);
      if (!isNaN(q) && q >= 10 && q <= 100) {
        setQuality(q);
      }
    }

    // Apply noindex tag to iframe host
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    document.title = 'Zapixal Client-Side Image Processor Widget';
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && !selectedFile.name.toLowerCase().match(/\.(heic|heif|tif|tiff|bmp|ico)$/)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, WebP, HEIC, AVIF, TIFF, or BMP image.');
      return;
    }
    
    // Check reasonable size safety limit (e.g. 50MB) to protect browser memory
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB. Please use the full Zapixal app for large files.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
    setIsProcessing(true);
    setProgress(15);

    const settings: ConversionSettings = {
      targetFormat,
      quality: quality / 100,
      resize: { enabled: false, keepAspectRatio: true },
      stripExif: true,
      grayscale: false,
      filenamePrefix: '',
      filenameSuffix: '',
    };

    try {
      setProgress(40);
      const fileId = Math.random().toString(36).substring(7);
      
      const processed = await convertSingleImage({
        id: fileId,
        file: selectedFile,
        originalSize: selectedFile.size,
        status: 'pending',
        progress: 40,
      }, settings);

      setProgress(90);

      let outExtension = targetFormat === 'jpg' ? 'jpg' : targetFormat;
      let outName = selectedFile.name;
      const lastDot = outName.lastIndexOf('.');
      if (lastDot > 0) outName = outName.substring(0, lastDot);
      outName = `${outName}.${outExtension}`;

      // Get image dimensions for confirmation
      let width: number | undefined;
      let height: number | undefined;
      try {
        const img = new Image();
        const url = URL.createObjectURL(selectedFile);
        await new Promise((res) => {
          img.onload = () => {
            width = img.width;
            height = img.height;
            URL.revokeObjectURL(url);
            res(true);
          };
          img.onerror = () => res(false);
          img.src = url;
        });
      } catch {
        // Dimension reading failure is non-fatal
      }

      setResult({
        blob: processed.blob,
        originalSize: selectedFile.size,
        name: outName,
        width,
        height
      });
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'In-browser processing failed. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-3 flex flex-col font-sans text-neutral-900 dark:text-white" style={{ background: 'transparent' }}>
      <style>{`
        body { background: transparent !important; }
      `}</style>
      
      <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm flex flex-col overflow-hidden max-w-sm mx-auto w-full">
        {/* Widget Header */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Zapixal Image Tool
            </h3>
            <p className="text-[10px] text-neutral-500">100% Client-Side WASM</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Toggle conversion settings"
              className="p-1 rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <a 
              href="https://zapixal.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Zapixal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Quick Settings Panel */}
        {showSettings && (
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-neutral-600 dark:text-neutral-300">Format:</label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
                className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 text-xs"
              >
                <option value="webp">WebP (Optimized)</option>
                <option value="jpg">JPEG (Universal)</option>
                <option value="png">PNG (Lossless)</option>
                <option value="avif">AVIF (Next-Gen)</option>
              </select>
            </div>
            {targetFormat !== 'png' && (
              <div className="flex justify-between items-center gap-2">
                <label className="font-medium text-neutral-600 dark:text-neutral-300 shrink-0">Quality ({quality}%):</label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-neutral-300 dark:bg-neutral-700 rounded accent-blue-600"
                />
              </div>
            )}
          </div>
        )}

        {/* Main Interactive Zone */}
        <div className="p-4 flex-1 flex flex-col justify-center">
          {!file && !isProcessing && !result && (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              tabIndex={0}
              role="button"
              aria-label="Upload or drag image file"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('zapixal-widget-input')?.click();
                }
              }}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors text-center"
            >
              <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-xs font-bold mb-1">Click or Drag Image Here</span>
              <span className="text-[10px] text-neutral-500">JPEG, PNG, WebP, HEIC, AVIF</span>
              <input 
                id="zapixal-widget-input"
                type="file" 
                className="hidden" 
                accept="image/*,.heic,.heif,.tif,.tiff,.bmp"
                onChange={(e) => e.target.files && e.target.files[0] && handleFileSelection(e.target.files[0])}
              />
            </label>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-6 text-center" role="status" aria-live="polite">
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin mb-2" />
              <div className="text-xs font-bold">Compressing in Browser...</div>
              <div className="text-[10px] text-neutral-500 mt-1">Zero server uploads</div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(15, progress)}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <AlertCircle className="w-7 h-7 text-red-500 mb-2" />
              <div className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Processing Error</div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mb-3 px-2">{error}</div>
              <button 
                onClick={() => { setFile(null); setError(null); }}
                className="text-xs px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 rounded font-semibold transition-colors"
              >
                Try Another File
              </button>
            </div>
          )}

          {result && !isProcessing && (
            <div className="flex flex-col items-center justify-center py-2 text-center animate-in fade-in">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
              </div>
              <div className="text-xs font-bold truncate w-full px-2 mb-1" title={result.name}>{result.name}</div>
              {result.width && result.height && (
                <div className="text-[10px] text-neutral-500 mb-2">{result.width} × {result.height} px</div>
              )}

              <div className="grid grid-cols-3 gap-2 w-full mb-3 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg text-[11px]">
                <div>
                  <span className="block text-[9px] uppercase text-neutral-400 font-semibold">Original</span>
                  <span className="font-mono line-through text-neutral-500">{(result.originalSize / 1024).toFixed(1)} KB</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-neutral-400 font-semibold">Result</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">{(result.blob.size / 1024).toFixed(1)} KB</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-neutral-400 font-semibold">Saved</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {Math.max(0, ((1 - (result.blob.size / result.originalSize)) * 100)).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => { setFile(null); setResult(null); }}
                  className="flex-1 py-2 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  New Image
                </button>
                <a
                  href={URL.createObjectURL(result.blob)}
                  download={result.name}
                  className="flex-[1.5] flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Legitimate, Non-Spam Attribution */}
        <div className="p-2 bg-neutral-50 dark:bg-neutral-800/80 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-center text-neutral-500">
          Powered by <a href="https://zapixal.com" target="_blank" rel="noopener noreferrer" className="font-bold underline text-neutral-700 dark:text-neutral-300">Zapixal</a>. 100% private in-browser processing.
        </div>
      </div>
    </div>
  );
}
