import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { ImageFileItem, ConversionSettings, TargetFormat } from './types';
import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { FileItem } from './components/FileItem';
import { Breadcrumbs } from './components/Breadcrumbs';
import { parseSeoRoute, applySeoToHead, SeoRouteData } from './lib/seoEngine';
import { convertSingleImage, generateCombinedPdf } from './lib/imageProcessor';
import { Zap, DownloadCloud, Trash2, ShieldCheck, Activity, Image as ImageIcon, Heart, Moon, Sun, Loader2, X, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { cn, formatOutputFilename, formatBytes } from './lib/utils';

// Lazy load non-critical modals & lower-fold content to optimize LCP & FCP
const DonateModal = React.lazy(() => import('./components/DonateModal').then(m => ({ default: m.DonateModal })));
const CompareModal = React.lazy(() => import('./components/CompareModal').then(m => ({ default: m.CompareModal })));
const ImageDetailsModal = React.lazy(() => import('./components/ImageDetailsModal').then(m => ({ default: m.ImageDetailsModal })));
const BatchStatsChart = React.lazy(() => import('./components/BatchStatsChart').then(m => ({ default: m.BatchStatsChart })));
const EmbedWidget = React.lazy(() => import('./components/EmbedWidget').then(m => ({ default: m.EmbedWidget })));
const PseoContentGuide = React.lazy(() => import('./components/PseoContentGuide').then(m => ({ default: m.PseoContentGuide })));
const FooterLinkHub = React.lazy(() => import('./components/FooterLinkHub').then(m => ({ default: m.FooterLinkHub })));

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
  const [etaText, setEtaText] = useState<string>('');
  const [processingSpeed, setProcessingSpeed] = useState<string>('');
  const [concurrencyProfile, setConcurrencyProfile] = useState<string>('');
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isCopiedShareLink, setIsCopiedShareLink] = useState(false);
  const [lastBatchDuration, setLastBatchDuration] = useState<string>('');
  const [copiedSuccessImage, setCopiedSuccessImage] = useState(false);

  // Dynamic pSEO Engine Routing
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const seoData: SeoRouteData = parseSeoRoute(currentPath);

  useEffect(() => {
    applySeoToHead(seoData);

    setSettings(prev => {
      const updated = { ...prev };
      if (seoData.toFormat) {
        updated.targetFormat = seoData.toFormat;
      }
      if (seoData.targetMaxKB !== undefined) {
        updated.targetMaxKB = seoData.targetMaxKB;
      }
      if (seoData.stripExif !== undefined) {
        updated.stripExif = seoData.stripExif;
      }
      if (seoData.presetResize) {
        updated.resize = {
          enabled: true,
          keepAspectRatio: true,
          maxWidth: seoData.presetResize.maxWidth,
          maxHeight: seoData.presetResize.maxHeight
        };
      }
      return updated;
    });
  }, [currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = useCallback((newPath: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', newPath);
      setCurrentPath(newPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('Zapixal is 100% offline-ready! To install as a desktop/mobile app, click your browser menu and choose "Add to Home Screen" or "Install Zapixal".');
    }
  };

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Zapixal - Fast Local Image Converter',
        text: '100% Client-Side Image Converter & Compressor that works offline!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopiedShareLink(true);
      setTimeout(() => setIsCopiedShareLink(false), 2000);
    }
  };

  const handleCopyConvertedToClipboard = async () => {
    const successFiles = files.filter(f => f.status === 'success' && f.blob);
    if (successFiles.length === 0) return;
    const itemToCopy = successFiles[successFiles.length - 1]; // Latest converted item
    try {
      let pngBlob = itemToCopy.blob!;
      if (pngBlob.type !== 'image/png') {
        const img = new Image();
        const url = URL.createObjectURL(pngBlob);
        await new Promise((res) => { img.onload = res; img.src = url; });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        pngBlob = (await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png')))!;
        URL.revokeObjectURL(url);
      }
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      setCopiedSuccessImage(true);
      setTimeout(() => setCopiedSuccessImage(false), 2000);
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
    }
  };
  const [compareItem, setCompareItem] = useState<ImageFileItem | null>(null);
  const [inspectItem, setInspectItem] = useState<ImageFileItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const batchStartTimeRef = useRef<number>(0);
  const completedBatchCountRef = useRef<number>(0);
  const totalBatchCountRef = useRef<number>(0);

  const updateEtaMetrics = useCallback(() => {
    if (completedBatchCountRef.current === 0) {
      setEtaText('Estimating...');
      setProcessingSpeed('');
      return;
    }

    const elapsedMs = Math.max(1, Date.now() - batchStartTimeRef.current);
    const completed = completedBatchCountRef.current;
    const total = totalBatchCountRef.current;
    const remaining = total - completed;

    if (remaining <= 0) {
      setEtaText('Almost done...');
      setProcessingSpeed('');
      return;
    }

    const elapsedSeconds = elapsedMs / 1000;
    const itemsPerSec = completed / elapsedSeconds;
    const estimatedRemainingSec = Math.ceil(remaining / itemsPerSec);

    let formattedTime = '';
    if (estimatedRemainingSec <= 3) {
      formattedTime = 'A few seconds left';
    } else if (estimatedRemainingSec < 60) {
      formattedTime = `~${estimatedRemainingSec}s left`;
    } else {
      const mins = Math.floor(estimatedRemainingSec / 60);
      const secs = estimatedRemainingSec % 60;
      formattedTime = `~${mins}m ${secs}s left`;
    }

    setEtaText(formattedTime);
    setProcessingSpeed(`${itemsPerSec.toFixed(1)} img/s`);
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      setEtaText('');
      setProcessingSpeed('');
      return;
    }

    const interval = setInterval(() => {
      updateEtaMetrics();
    }, 500);

    return () => clearInterval(interval);
  }, [isProcessing, updateEtaMetrics]);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    setFiles(prevFiles => {
      const updated = [...prevFiles];
      const [movedItem] = updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, movedItem);
      return updated;
    });

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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

  // Global Paste Listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);
      const pastedFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const ext = file.type.split('/')[1] || 'png';
            const name = `pasted-image-${Date.now()}.${ext}`;
            pastedFiles.push(new File([file], name, { type: file.type }));
          }
        }
      }
      if (pastedFiles.length > 0) {
        handleFilesAdded(pastedFiles);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFilesAdded]);

  const handleRotateItem = useCallback((id: string, deltaDegrees: number) => {
    setFiles(prev =>
      prev.map(file => {
        if (file.id === id) {
          const currentRotation = file.rotation || 0;
          const newRotation = ((currentRotation + deltaDegrees) % 360 + 360) % 360;
          if (file.convertedUrl) {
            URL.revokeObjectURL(file.convertedUrl);
          }
          return {
            ...file,
            rotation: newRotation,
            status: 'pending',
            blob: undefined,
            convertedSize: undefined,
            convertedUrl: undefined,
          };
        }
        return file;
      })
    );
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
    const index = files.findIndex(f => f.id === item.id);
    const fileName = formatOutputFilename(item, index >= 0 ? index : 0, settings);
    const a = document.createElement('a');
    a.href = item.convertedUrl;
    a.download = fileName;
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

    const JSZipModule = await import('jszip');
    const JSZip = JSZipModule.default;
    const zip = new JSZip();
    const folder = zip.folder(`converted_images_${settings.targetFormat}`);
    const usedNames = new Set<string>();

    successFiles.forEach((item, idx) => {
      let fileName = formatOutputFilename(item, idx, settings);
      
      if (usedNames.has(fileName)) {
        const dotIdx = fileName.lastIndexOf('.');
        const namePart = dotIdx >= 0 ? fileName.substring(0, dotIdx) : fileName;
        const extPart = dotIdx >= 0 ? fileName.substring(dotIdx) : '';
        let counter = 1;
        while (usedNames.has(`${namePart}_${counter}${extPart}`)) {
          counter++;
        }
        fileName = `${namePart}_${counter}${extPart}`;
      }
      usedNames.add(fileName);

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

    batchStartTimeRef.current = Date.now();
    completedBatchCountRef.current = 0;
    totalBatchCountRef.current = pendingFiles.length;
    setEtaText('Estimating...');
    setProcessingSpeed('');

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
              completedBatchCountRef.current++;
              updateEtaMetrics();
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
      
      {/* Proof of Privacy Notification Banner */}
      {showPrivacyBanner && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 flex items-center justify-between gap-3 shadow-sm border-b border-emerald-500/30">
          <div className="flex items-center gap-2 max-w-5xl mx-auto text-center sm:text-left flex-1 justify-center">
            <span className="text-sm shrink-0">🔒</span>
            <span>
              <strong className="font-extrabold">100% Offline Capable:</strong> Turn off your Wi-Fi right now and try converting an image—it still works!
            </span>
          </div>
          <button
            onClick={() => setShowPrivacyBanner(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0 text-white/90 hover:text-white"
            title="Dismiss Privacy Proof Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-[#303134] border-b border-neutral-200 dark:border-[#3c4043] sticky top-0 z-40 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Zapixal Logo" 
            width="40"
            height="40"
            decoding="async"
            fetchPriority="high"
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

        <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-[#9aa0a6] bg-neutral-50/50 dark:bg-[#202124] p-1 border border-neutral-100 dark:border-[#3c4043] rounded-2xl">
          <button onClick={() => handleNavigate('/')} className={cn("px-3 py-1.5 rounded-xl transition-all cursor-pointer", currentPath === '/' ? "bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] font-bold" : "hover:bg-neutral-100 dark:hover:bg-[#3c4043]")}>All Converters</button>
          <button onClick={() => handleNavigate('/heic-to-jpg')} className={cn("px-3 py-1.5 rounded-xl transition-all cursor-pointer", currentPath === '/heic-to-jpg' ? "bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] font-bold" : "hover:bg-neutral-100 dark:hover:bg-[#3c4043]")}>HEIC to JPG</button>
          <button onClick={() => handleNavigate('/convert-png-to-webp')} className={cn("px-3 py-1.5 rounded-xl transition-all cursor-pointer", currentPath === '/convert-png-to-webp' ? "bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] font-bold" : "hover:bg-neutral-100 dark:hover:bg-[#3c4043]")}>PNG to WEBP</button>
          <button onClick={() => handleNavigate('/compress-jpeg-under-200kb')} className={cn("px-3 py-1.5 rounded-xl transition-all cursor-pointer", currentPath === '/compress-jpeg-under-200kb' ? "bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] font-bold" : "hover:bg-neutral-100 dark:hover:bg-[#3c4043]")}>Compress 200KB</button>
          <button onClick={() => handleNavigate('/passport-photo-compressor')} className={cn("px-3 py-1.5 rounded-xl transition-all cursor-pointer", currentPath === '/passport-photo-compressor' ? "bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] font-bold" : "hover:bg-neutral-100 dark:hover:bg-[#3c4043]")}>Passport Photo</button>
          <button onClick={() => handleNavigate('/exif-metadata-remover')} className={cn("px-3 py-1.5 rounded-xl transition-all cursor-pointer", currentPath === '/exif-metadata-remover' ? "bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] font-bold" : "hover:bg-neutral-100 dark:hover:bg-[#3c4043]")}>EXIF Remover</button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-full transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-[#8ab4f8]" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={handleInstallPWA}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-blue-700 dark:text-[#8ab4f8] bg-blue-50 dark:bg-[#1e293b] border border-blue-200 dark:border-[#384c6c] hover:bg-blue-100 dark:hover:bg-[#28354f] rounded-full transition-colors shadow-xs"
            title="Install Zapixal App"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Install App (PWA)</span>
          </button>

          <button
            onClick={handleShareApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-[#e8eaed] bg-neutral-100 dark:bg-[#3c4043] hover:bg-neutral-200 rounded-full transition-all"
            title="Share Zapixal"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCopiedShareLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-[#81c995] bg-emerald-50 dark:bg-[#1e3427] border border-emerald-200 dark:border-[#2d523c] rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Private
          </div>
        </div>
      </nav>

      <main className="max-w-6xl px-6 py-16 mx-auto lg:py-24">
        
        {/* Hero Section */}
        <div className="hero-container-cls-guard min-h-[160px] sm:min-h-[200px] flex flex-col items-center mb-10 text-center">
          <Breadcrumbs items={seoData.breadcrumbs} onNavigate={handleNavigate} />
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4 max-w-4xl leading-tight">
            {seoData.h1Title}
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-neutral-500 dark:text-[#9aa0a6] font-medium leading-relaxed">
            {seoData.metaDescription}
          </p>
        </div>

        {/* Dropzone & Quick Tasks */}
        <div className="flex flex-col gap-6 mb-16">
          <Dropzone onFilesAdded={handleFilesAdded} />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-700 dark:text-[#8ab4f8]">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 dark:bg-[#1e293b]">
                <Zap className="w-4 h-4 text-blue-600 dark:text-[#8ab4f8]" />
              </span>
              <span>Popular Intent Presets:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => handleNavigate('/heic-to-jpg')} className="px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-[#e8eaed] bg-neutral-100 dark:bg-[#202124] hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-blue-600 dark:hover:text-[#8ab4f8] rounded-xl transition-all cursor-pointer border border-neutral-200 dark:border-[#3c4043]">
                HEIC to JPG
              </button>
              <button onClick={() => handleNavigate('/convert-png-to-webp')} className="px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-[#e8eaed] bg-neutral-100 dark:bg-[#202124] hover:bg-purple-50 dark:hover:bg-[#2e1d40] hover:text-purple-600 dark:hover:text-[#c58af9] rounded-xl transition-all cursor-pointer border border-neutral-200 dark:border-[#3c4043]">
                PNG to WEBP
              </button>
              <button onClick={() => handleNavigate('/compress-jpeg-under-200kb')} className="px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-[#e8eaed] bg-neutral-100 dark:bg-[#202124] hover:bg-emerald-50 dark:hover:bg-[#1e3427] hover:text-emerald-600 dark:hover:text-[#81c995] rounded-xl transition-all cursor-pointer border border-neutral-200 dark:border-[#3c4043]">
                Under 200KB
              </button>
              <button onClick={() => handleNavigate('/passport-photo-compressor')} className="px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-[#e8eaed] bg-neutral-100 dark:bg-[#202124] hover:bg-amber-50 dark:hover:bg-[#332a15] hover:text-amber-600 dark:hover:text-[#fdd663] rounded-xl transition-all cursor-pointer border border-neutral-200 dark:border-[#3c4043]">
                Passport Photo
              </button>
              <button onClick={() => handleNavigate('/exif-metadata-remover')} className="px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-[#e8eaed] bg-neutral-100 dark:bg-[#202124] hover:bg-rose-50 dark:hover:bg-[#331822] hover:text-rose-600 dark:hover:text-[#f28b82] rounded-xl transition-all cursor-pointer border border-neutral-200 dark:border-[#3c4043]">
                Wipe EXIF
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
                      {isProcessing && etaText && (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-100 dark:bg-[#1e293b] text-blue-700 dark:text-[#8ab4f8] shadow-sm border border-blue-200 dark:border-[#384c6c] flex items-center gap-1.5">
                          <span>⏱️</span>
                          <span>ETA: {etaText}</span>
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
                  {files.length > 1 && (
                    <div className="text-[11px] font-semibold text-neutral-400 dark:text-[#9aa0a6] flex items-center gap-1.5 px-1 pb-1">
                      <span>💡</span>
                      <span>Drag items using the grip handle to prioritize processing order</span>
                    </div>
                  )}
                  {files.map((file, idx) => (
                    <FileItem 
                      key={file.id} 
                      item={file} 
                      index={idx}
                      onRemove={handleRemoveFile} 
                      onDownload={handleDownloadSingle}
                      onRotate={handleRotateItem}
                      onCompare={(item) => setCompareItem(item)}
                      onInspectDetails={(item) => setInspectItem(item)}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedIndex === idx}
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
                  <div className="flex flex-col gap-2.5 p-4 bg-blue-50/70 dark:bg-[#1a2333] border border-blue-100 dark:border-[#2d3a4e] rounded-2xl mb-2 shadow-xs">
                    <div className="flex items-center justify-between text-sm font-bold text-neutral-700 dark:text-[#e8eaed]">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        <span>Converting...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {processingSpeed && (
                          <span className="hidden sm:inline-block text-[11px] font-semibold text-neutral-500 dark:text-[#9aa0a6] bg-white dark:bg-[#202124] px-2 py-0.5 rounded-md border border-neutral-200 dark:border-[#3c4043]">
                            ⚡ {processingSpeed}
                          </span>
                        )}
                        {etaText && (
                          <span className="text-xs font-bold text-blue-700 dark:text-[#8ab4f8] bg-white dark:bg-[#202124] px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-[#384c6c] shadow-xs">
                            ⏱️ {etaText}
                          </span>
                        )}
                        <span className="text-sm font-black text-neutral-800 dark:text-[#e8eaed] ml-1">{progressPercent}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-neutral-200/70 dark:bg-[#202124] rounded-full overflow-hidden border border-neutral-200/60 dark:border-[#3c4043]">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out rounded-full shadow-sm"
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

        {/* Recharts Summary Chart for Batch Size Savings */}
        <Suspense fallback={null}>
          <BatchStatsChart files={files} />
        </Suspense>

        {/* Success Real-time Stats Banner */}
        {successCount > 0 && (
          <div className="p-6 my-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-[#1a2e23] dark:via-[#1e3427] dark:to-[#1a2e23] border border-emerald-200 dark:border-[#2d523c] rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-sm shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-[#2d523c] text-emerald-800 dark:text-[#81c995] rounded-md">
                    Conversion Complete
                  </span>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6]">
                    {successCount} {successCount === 1 ? 'file' : 'files'} processed
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-800 dark:text-[#e8eaed] mt-1">
                  Saved {((files.filter(f => f.status === 'success').reduce((acc, f) => acc + (f.originalSize - (f.convertedSize || f.originalSize)), 0)) / (1024 * 1024)).toFixed(2)} MB ({Math.max(0, Math.round(((files.filter(f => f.status === 'success').reduce((acc, f) => acc + (f.originalSize - (f.convertedSize || f.originalSize)), 0)) / Math.max(1, files.filter(f => f.status === 'success').reduce((acc, f) => acc + f.originalSize, 0))) * 100))}% smaller) {lastBatchDuration ? `in ${lastBatchDuration} seconds` : ''}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-[#9aa0a6] mt-0.5">
                  Processed 100% locally in your browser with zero data sent to external servers.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyConvertedToClipboard}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-[#81c995] bg-emerald-100/80 dark:bg-[#2d523c] hover:bg-emerald-200 rounded-xl transition-all shadow-xs border border-emerald-300/50 cursor-pointer"
              >
                {copiedSuccessImage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSuccessImage ? 'Copied Image!' : 'Copy Image to Clipboard'}</span>
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just converted & compressed my images 100% offline with Zapixal! Saved ${((files.filter(f => f.status === 'success').reduce((acc, f) => acc + (f.originalSize - (f.convertedSize || f.originalSize)), 0)) / (1024 * 1024)).toFixed(2)} MB in ${lastBatchDuration || 1}s 🚀`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-xl transition-all shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Zapixal on X</span>
              </a>
            </div>
          </div>
        )}

        {/* Embed Widget for Webmasters & SEO */}
        <Suspense fallback={null}>
          <EmbedWidget />
        </Suspense>

        {/* Dynamic pSEO Content Guide & FAQ */}
        <Suspense fallback={null}>
          <PseoContentGuide seoData={seoData} />
        </Suspense>
      </main>

      {/* Dynamic pSEO Interlinking Footer Link Hub */}
      <Suspense fallback={null}>
        <FooterLinkHub currentPath={currentPath} onNavigate={handleNavigate} />
        <DonateModal 
          isOpen={isDonateModalOpen} 
          onClose={() => setIsDonateModalOpen(false)} 
        />
        {compareItem && (
          <CompareModal
            item={compareItem}
            onClose={() => setCompareItem(null)}
          />
        )}
        {inspectItem && (
          <ImageDetailsModal
            item={inspectItem}
            onClose={() => setInspectItem(null)}
          />
        )}
      </Suspense>
    </div>
  );
}


