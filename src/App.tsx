import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImageFileItem, ConversionSettings, TargetFormat } from './types';
import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { FileItem } from './components/FileItem';
import { DonateModal } from './components/DonateModal';
import { convertSingleImage, generateCombinedPdf } from './lib/imageProcessor';
import { Zap, DownloadCloud, Trash2, ShieldCheck, Activity, Image as ImageIcon, Heart, Moon, Sun, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { cn } from './lib/utils';

export default function App() {
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    targetFormat: 'webp',
    quality: 0.8,
    resize: { enabled: false, keepAspectRatio: true },
    filenamePrefix: '',
    filenameSuffix: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [concurrencyProfile, setConcurrencyProfile] = useState<string>('');
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const workersCount = Math.min(4, Math.max(1, cores - 1));
    setConcurrencyProfile(`Optimized (${cores}-core: ${workersCount} workers)`);
  }, []);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const newItems: ImageFileItem[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      originalSize: file.size,
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newItems]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.convertedUrl) {
        URL.revokeObjectURL(file.convertedUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const handleClearAll = () => {
    files.forEach(file => {
      if (file?.convertedUrl) URL.revokeObjectURL(file.convertedUrl);
    });
    setFiles([]);
  };

  const handleDownloadSingle = (item: ImageFileItem) => {
    if (!item.convertedUrl || !item.blob) return;
    const originalName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
    const ext = settings.targetFormat;
    const prefix = settings.filenamePrefix || '';
    const suffix = settings.filenameSuffix || '';
    const a = document.createElement('a');
    a.href = item.convertedUrl;
    a.download = `${prefix}${originalName}${suffix}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = async () => {
    const successFiles = files.filter(f => f.status === 'success' && f.blob);
    if (successFiles.length === 0) return;

    if (settings.targetFormat === 'pdf') {
      try {
        setIsProcessing(true);
        const pdfBlob = await generateCombinedPdf(successFiles, settings);
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted_document.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (err) {
        console.error("PDF combination failed", err);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (successFiles.length === 1) {
      handleDownloadSingle(successFiles[0]);
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder(`converted_images_${settings.targetFormat}`);
    
    const prefix = settings.filenamePrefix || '';
    const suffix = settings.filenameSuffix || '';

    successFiles.forEach(item => {
      const originalName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
      const fileName = `${prefix}${originalName}${suffix}.${settings.targetFormat}`;
      folder?.file(fileName, item.blob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = `converted_${settings.targetFormat}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(zipUrl), 100);
  };

  const stopProcessing = () => {
    setIsStopping(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const processFiles = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsStopping(false);
    
    abortControllerRef.current = new AbortController();

    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) {
      setIsProcessing(false);
      setIsStopping(false);
      return;
    }

    const hardwareCores = navigator.hardwareConcurrency || 4;
    
    // Reduce max concurrent slightly to keep main thread responsive
    let baseMaxConcurrent = Math.min(4, Math.max(1, hardwareCores - 1));

    let activeWorkers = 0;
    let currentIndex = 0;

    return new Promise<void>((resolve) => {
      const next = async () => {
        if (abortControllerRef.current?.signal.aborted) {
          if (activeWorkers === 0) {
            setFiles(prev => prev.map(f => f.status === 'processing' ? { ...f, status: 'pending' } : f));
            setIsProcessing(false);
            setIsStopping(false);
            resolve();
          }
          return;
        }

        // Yield to the main thread to prevent UI stuttering
        await new Promise(r => setTimeout(r, 10));

        if (abortControllerRef.current?.signal.aborted) {
          if (activeWorkers === 0) {
            setFiles(prev => prev.map(f => f.status === 'processing' ? { ...f, status: 'pending' } : f));
            setIsProcessing(false);
            setIsStopping(false);
            resolve();
          }
          return;
        }

        if (currentIndex >= pendingFiles.length && activeWorkers === 0) {
          resolve();
          return;
        }
        
        // Peek at the next file to determine if we should throttle
        let currentLimit = baseMaxConcurrent;
        if (currentIndex < pendingFiles.length) {
          const nextItem = pendingFiles[currentIndex];
          const isHugeFile = nextItem.originalSize > 8 * 1024 * 1024 || 
            (nextItem.dimensions && nextItem.dimensions.width * nextItem.dimensions.height > 12000000);
          
          if (isHugeFile) {
            currentLimit = 1;
          }
        }
        
        while (activeWorkers < currentLimit && currentIndex < pendingFiles.length) {
          if (abortControllerRef.current?.signal.aborted) break;

          const item = pendingFiles[currentIndex++];
          
          activeWorkers++;
          setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', error: undefined } : f));
          
          convertSingleImage(item, settings)
            .then(result => {
              if (abortControllerRef.current?.signal.aborted) {
                setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'pending' } : f));
              } else {
                setFiles(prev => prev.map(f => f.id === item.id ? { 
                  ...f, 
                  status: 'success', 
                  blob: result.blob,
                  convertedSize: result.convertedSize,
                  convertedUrl: result.convertedUrl,
                  dimensions: result.dimensions
                } : f));
              }
            })
            .catch(error => {
              if (abortControllerRef.current?.signal.aborted) {
                setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'pending' } : f));
              } else {
                setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', error: error.message } : f));
              }
            })
            .finally(() => {
              activeWorkers--;
              next();
            });
        }

        if (activeWorkers === 0 && (currentIndex >= pendingFiles.length || abortControllerRef.current?.signal.aborted)) {
          if (abortControllerRef.current?.signal.aborted) {
            setFiles(prev => prev.map(f => f.status === 'processing' ? { ...f, status: 'pending' } : f));
          }
          setIsProcessing(false);
          setIsStopping(false);
          resolve();
        }
      };
      
      next();
    }).then(() => {
      setIsProcessing(false);
      setIsStopping(false);
    });
  };

  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const totalCount = files.length;
  const processedCount = files.filter(f => f.status === 'success' || f.status === 'error').length;
  const progressPercent = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  const setFormat = (format: TargetFormat) => {
    setSettings(prev => ({ ...prev, targetFormat: format }));
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-[#202124] text-neutral-900 dark:text-[#e8eaed] font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-[#303134] border-b border-neutral-200 dark:border-[#3c4043] sticky top-0 z-40 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Zapixal Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain bg-white dark:bg-[#202124] shadow-sm border border-neutral-100 dark:border-[#3c4043]" 
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-[#e8eaed]">Zapixal</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold text-blue-700 dark:text-[#8ab4f8] bg-blue-50 dark:bg-[#1e293b] border border-blue-200 dark:border-[#384c6c] rounded-md uppercase tracking-wider">
                V2.5 LOCAL
              </span>
            </div>
            <span className="text-[11px] font-medium text-neutral-500 dark:text-[#9aa0a6] -mt-0.5 hidden sm:block">Lightning-Fast Client-Side Engine</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-sm font-semibold text-neutral-600 dark:text-[#9aa0a6] bg-neutral-50/50 dark:bg-[#202124] p-1 border border-neutral-100 dark:border-[#3c4043] rounded-2xl">
          <button className="px-4 py-2 text-white bg-blue-600 dark:bg-[#8ab4f8] dark:text-[#202124] font-bold rounded-xl shadow-sm">All Converters</button>
          <button className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-xl transition-colors hover:text-neutral-800 dark:hover:text-[#e8eaed]">HEIC to JPG</button>
          <button className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-xl transition-colors hover:text-neutral-800 dark:hover:text-[#e8eaed]">AVIF Speed</button>
          <button className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-xl transition-colors hover:text-neutral-800 dark:hover:text-[#e8eaed]">PNG Compress</button>
          <button className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-xl transition-colors hover:text-neutral-800 dark:hover:text-[#e8eaed]">Image to PDF</button>
          <button className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-xl transition-colors hover:text-neutral-800 dark:hover:text-[#e8eaed]">WEBP Tool</button>
          <button className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-xl transition-colors hover:text-neutral-800 dark:hover:text-[#e8eaed]">Favicon .ICO</button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-full transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-[#8ab4f8]" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsDonateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-pink-600 dark:text-[#f28b82] bg-pink-50 dark:bg-[#3c2a2f] border border-pink-200 dark:border-[#5c3a42] hover:bg-pink-100 dark:hover:bg-[#4d3239] rounded-full transition-colors shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 fill-pink-600 dark:fill-[#f28b82]" />
            <span>Support Us</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-[#81c995] bg-emerald-50 dark:bg-[#1e3427] border border-emerald-200 dark:border-[#2d523c] rounded-full">
            <ShieldCheck className="w-4 h-4" />
            100% Private
          </div>
        </div>
      </nav>

      <main className="max-w-6xl px-6 py-16 mx-auto lg:py-24">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-neutral-900 dark:text-white mb-6 max-w-3xl leading-tight">
            Fast Local Image Converter & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Compressor</span>
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
            Lightning-fast image converter. Process HEIC, PNG, JPG, WEBP, and AVIF instantly right in your browser.
          </p>
        </div>

        {/* Dropzone & Quick Tasks */}
        <div className="flex flex-col gap-6 mb-16">
          <Dropzone onFilesAdded={handleFilesAdded} />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              Popular Quick Tasks:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFormat('webp')} className="px-3 sm:px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                WEBP (Smallest Web Size)
              </button>
              <button onClick={() => setFormat('avif')} className="px-3 sm:px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm">
                AVIF (Next-Gen Speed)
              </button>
              <button onClick={() => setFormat('jpg')} className="px-3 sm:px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
                JPG (Standard Photo)
              </button>
              <button onClick={() => setFormat('pdf')} className="px-3 sm:px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                PDF Document Export
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspace (Visible only when files exist) */}
        {files.length > 0 && (
          <div className="flex flex-col-reverse xl:grid xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            {/* Left Column: Queue List */}
            <div className="flex flex-col gap-6 xl:col-span-7">
              <div className="flex flex-col bg-white dark:bg-neutral-900 border rounded-3xl border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                
                {/* Queue Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 dark:bg-neutral-800/50">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xl">Queue ({files.length})</span>
                      {successCount > 0 && (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200">
                          {successCount} completed
                        </span>
                      )}
                    </div>
                    {/* Hardware Profile Banner */}
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mt-1">
                      <Activity className="w-4 h-4" />
                      {concurrencyProfile}
                    </div>
                  </div>
                  <button 
                    onClick={handleClearAll}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-red-600 bg-white border-2 border-neutral-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
                
                <div className="flex flex-col max-h-[600px] overflow-y-auto p-6 gap-4">
                  {files.map(file => (
                    <FileItem 
                      key={file.id} 
                      item={file} 
                      onRemove={handleRemoveFile} 
                      onDownload={handleDownloadSingle}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Settings & Actions */}
            <div className="flex flex-col gap-6 xl:col-span-5 static xl:sticky top-24 h-fit">
              {/* Actions Panel */}
              <div className="flex flex-col gap-4 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                {isProcessing && (
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex justify-between text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      <span>Converting...</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {isProcessing ? (
                  <button
                    onClick={stopProcessing}
                    disabled={isStopping}
                    className={cn(
                      "flex items-center justify-center w-full gap-2 px-6 py-4 text-lg font-bold text-white transition-all rounded-2xl shadow-sm",
                      isStopping
                        ? "bg-amber-600 dark:bg-amber-700 cursor-not-allowed opacity-90"
                        : "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
                    )}
                  >
                    {isStopping ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                        <span>Stopping...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 animate-pulse fill-current" />
                        <span>Stop Processing</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={processFiles}
                    disabled={pendingCount === 0}
                    className="flex items-center justify-center w-full gap-2 px-6 py-4 text-lg font-bold text-white transition-all rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
                  >
                    <Zap className="w-6 h-6 fill-current" />
                    Convert {pendingCount > 0 ? pendingCount : ''} {pendingCount === 1 ? 'Image' : 'Images'}
                  </button>
                )}
                <button
                  onClick={handleDownloadAll}
                  disabled={isProcessing || successCount === 0}
                  className={cn(
                    "flex items-center justify-center w-full gap-2 px-6 py-4 text-lg font-bold transition-all rounded-2xl border-2 active:scale-[0.98]",
                    successCount > 0 && !isProcessing
                      ? "bg-white text-neutral-900 dark:text-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                      : "bg-neutral-50 text-neutral-400 border-neutral-100 cursor-not-allowed"
                  )}
                >
                  <DownloadCloud className="w-6 h-6" />
                  Download All ({successCount})
                </button>
              </div>

              <SettingsPanel 
                settings={settings} 
                onChange={setSettings} 
                disabled={isProcessing}
              />
            </div>
            
          </div>
        )}
        {/* FAQ Section */}
        <div className="mt-24 pt-16 border-t border-neutral-200">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 rounded-full">
              <span className="flex items-center justify-center w-4 h-4 rounded-full border border-blue-600 font-serif">?</span>
              IMAGE FORMAT KNOWLEDGE BASE
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-neutral-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="max-w-xl text-neutral-500 dark:text-neutral-400 font-medium">
              Everything you need to know about bulk image conversion, quality compression, and browser privacy.
            </p>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <h3 className="flex items-center justify-between font-bold text-blue-700 text-lg mb-3">
                How does Zapixal convert and compress images without server uploads?
                <span className="text-blue-500">^</span>
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Zapixal processes your images entirely inside your browser using modern WebAssembly, HTML5 Canvas API, and JavaScript decoders. Your files never touch an external server, offering 100% data privacy, immediate results, and complete confidentiality.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-300 transition-colors">
              <h3 className="flex items-center justify-between font-bold text-blue-700 text-lg">
                Which image formats are supported for input and output?
                <span className="text-blue-500">v</span>
              </h3>
            </div>
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-300 transition-colors">
              <h3 className="flex items-center justify-between font-bold text-blue-700 text-lg">
                What is the benefit of WEBP and AVIF next-gen formats?
                <span className="text-blue-500">v</span>
              </h3>
            </div>
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-300 transition-colors">
              <h3 className="flex items-center justify-between font-bold text-blue-700 text-lg">
                Is there any file size or conversion limit?
                <span className="text-blue-500">v</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-neutral-200 text-center flex flex-col items-center gap-6 pb-8">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">Zapixal — Free Client-Side Image Converter & Compressor</span>
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">100% Browser Local Processing • Files Never Leave Your Device • Zero Latency</span>
          </div>
          <span className="text-xs text-neutral-400">© {new Date().getFullYear()} Zapixal. Designed for high performance and Web Vitals optimization.</span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-neutral-400">
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">Home</a>
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">HEIC to JPG</a>
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">Compress JPEG</a>
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">PNG Compressor</a>
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">Image Format Changer</a>
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">AVIF Converter</a>
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">Image to PDF</a>
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">WEBP Optimizer</a>
            <a href="#" className="hover:text-neutral-600 dark:text-neutral-300 transition-colors">Favicon Generator</a>
          </div>
        </footer>
      </main>

      <DonateModal 
        isOpen={isDonateModalOpen} 
        onClose={() => setIsDonateModalOpen(false)} 
      />
    </div>
  );
}


