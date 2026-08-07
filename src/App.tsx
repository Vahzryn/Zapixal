import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ImageFileItem, ConversionSettings, TargetFormat } from './types';
import { Dropzone } from './components/Dropzone';
import { HeaderNavbar } from './components/HeaderNavbar';
import { SettingsPanel } from './components/SettingsPanel';
import { FileItem } from './components/FileItem';
import { GlobalControls } from './components/GlobalControls';
import { Breadcrumbs } from './components/Breadcrumbs';
import { VirtualFileList } from './components/VirtualFileList';
import { FooterLinkHub } from './components/FooterLinkHub';
import { PrivacyMap } from './components/PrivacyMap';
import { Calculator } from './components/Calculator';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { AboutPage } from './components/AboutPage';
import { DonateModal } from './components/DonateModal';
import { InstallModal } from './components/InstallModal';
import { PwaBanner } from './components/PwaBanner';
import { CompareModal } from './components/CompareModal';
import { ImageDetailsModal } from './components/ImageDetailsModal';
import { BatchStatsChart } from './components/BatchStatsChart';
import { EmbedWidget } from './components/EmbedWidget';
import { PseoContentGuide } from './components/PseoContentGuide';
import { DocsArchitecture } from './components/DocsArchitecture';
import { ToolsDirectory } from './components/ToolsDirectory';
import { useAppRouting } from './hooks/useAppRouting';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useShareActions } from './hooks/useShareActions';
import { useDarkMode } from './hooks/useDarkMode';
import { Zap, DownloadCloud, Trash2, ShieldCheck, Activity, Image as ImageIcon, Heart, Moon, Sun, Loader2, X, Share2, Copy, Check, Sparkles, Lock } from 'lucide-react';
import { detectHardwareCapabilities } from './lib/hardwareCapabilities';
import { cn, formatOutputFilename, formatBytes } from './lib/utils';

interface AppProps {
  initialPath?: string;
}

export default function App({ initialPath }: AppProps = {}) {
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zapixal_settings');
      if (saved) {
        try {
          return {
            targetFormat: 'webp',
            quality: 0.8,
            resize: { enabled: false, keepAspectRatio: true },
            filenamePrefix: '',
            filenameSuffix: '',
            ...JSON.parse(saved)
          };
        } catch (e) {
          console.error("Failed to parse settings", e);
        }
      }
    }
    return {
      targetFormat: 'webp',
      quality: 0.8,
      resize: { enabled: false, keepAspectRatio: true },
      filenamePrefix: '',
      filenameSuffix: ''
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zapixal_settings', JSON.stringify(settings));
    }
  }, [settings]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [etaText, setEtaText] = useState<string>('');
  const [processingSpeed, setProcessingSpeed] = useState<string>('');
  const [concurrencyProfile, setConcurrencyProfile] = useState<string>('');
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [hasDismissedPwaBanner, setHasDismissedPwaBanner] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zapixal_pwa_banner_dismissed') === 'true';
    }
    return false;
  });
  const [hasConvertedInSession, setHasConvertedInSession] = useState(false);
  const [lastBatchDuration, setLastBatchDuration] = useState<string>('');
  
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [deletedHistory, setDeletedHistory] = useState<{ files: ImageFileItem[], indices: { id: string, index: number }[] }[]>([]);

  // Extracted Custom Hooks
  const { currentPath, handleNavigate, seoData } = useAppRouting({ initialPath, setSettings });
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { deferredPrompt, handleInstallPWA } = usePwaInstall({
    onOpenInstallModal: () => setIsInstallModalOpen(true),
  });
  const { isCopiedShareLink, copiedSuccessImage, handleShareApp, handleCopyConvertedToClipboard } = useShareActions({ files });

  useEffect(() => {
    if (!hasConvertedInSession && files.some(f => f.status === 'success')) {
      setHasConvertedInSession(true);
    }
  }, [files, hasConvertedInSession]);

  const handleClosePwaBanner = useCallback(() => {
    setHasDismissedPwaBanner(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zapixal_pwa_banner_dismissed', 'true');
    }
  }, []);

  const [compareItem, setCompareItem] = useState<ImageFileItem | null>(null);
  const [inspectItem, setInspectItem] = useState<ImageFileItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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
    const config = detectHardwareCapabilities();
    const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    setConcurrencyProfile(`Optimized (${cores}-core: ${config.maxConcurrentWorkers} workers)${config.mode === 'ECO' ? ' (Eco Mode)' : ''}`);
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

  const thumbnailQueue = useRef<{ id: string, file: File }[]>([]);
  const isProcessingThumbnails = useRef(false);

  const processThumbnailQueue = useCallback(async () => {
    if (isProcessingThumbnails.current) return;
    isProcessingThumbnails.current = true;
    
    try {
      const { generateThumbnail } = await import('./lib/imageProcessor');
      
      while (thumbnailQueue.current.length > 0) {
        // Process in batches of 5 to prevent OOM
        const batch = thumbnailQueue.current.splice(0, 5);
        const results = await Promise.all(batch.map(async (item) => {
          try {
            const url = await generateThumbnail(item.file, 120);
            return { id: item.id, url };
          } catch (e) {
            return { id: item.id, url: '' };
          }
        }));
        
        setFiles(prev => {
          const nextFiles = [...prev];
          let changed = false;
          results.forEach(match => {
            const idx = nextFiles.findIndex(f => f.id === match.id);
            if (idx !== -1 && match.url) {
              nextFiles[idx] = { ...nextFiles[idx], previewUrl: match.url };
              changed = true;
            }
          });
          
          results.forEach(r => {
            if (r.url && !nextFiles.find(f => f.id === r.id)) {
              URL.revokeObjectURL(r.url);
            }
          });
          
          return changed ? nextFiles : prev;
        });
        
        // Let the main thread breathe
        if (typeof (globalThis as any).scheduler?.yield === 'function') {
          await (globalThis as any).scheduler.yield();
        } else {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    } catch (err) {
      console.error("Failed to process thumbnail queue", err);
    } finally {
      isProcessingThumbnails.current = false;
    }
  }, []);

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file && file.size > 0);
    if (validFiles.length === 0) return;

    const newItems: ImageFileItem[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: '',
      originalSize: file.size,
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newItems]);
    
    newItems.forEach(item => {
      if (item.status === 'pending') {
        thumbnailQueue.current.push({ id: item.id, file: item.file });
      }
    });
    processThumbnailQueue();

    // Track engagement locally as soon as files are selected to prevent false bounces
    if (newFiles.length > 0) {
    }
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

  const handleRetryFile = useCallback(async (id: string) => {
    let itemToProcess: ImageFileItem | undefined;
    
    setFiles(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      itemToProcess = { ...next[idx], status: 'pending', error: undefined };
      next[idx] = { ...itemToProcess, status: 'processing' };
      return next;
    });

    if (!itemToProcess) return;

    try {
      const processor = await import('./lib/imageProcessor');
      const result = await processor.convertSingleImage(itemToProcess, settings);
      
      setFiles(prev => {
        const nextFiles = [...prev];
        const idx = nextFiles.findIndex(f => f.id === id);
        if (idx !== -1) {
          nextFiles[idx] = { 
            ...nextFiles[idx], 
            status: 'success', 
            blob: result.blob, 
            convertedSize: result.convertedSize, 
            convertedUrl: URL.createObjectURL(result.blob),
            dimensions: result.dimensions,
            originalFallback: result.originalFallback
          };
        }
        return nextFiles;
      });
    } catch (err: any) {
      setFiles(prev => {
        const nextFiles = [...prev];
        const idx = nextFiles.findIndex(f => f.id === id);
        if (idx !== -1) {
          nextFiles[idx] = { ...nextFiles[idx], status: 'error', error: err.message || 'Conversion failed' };
        }
        return nextFiles;
      });
    }
  }, [settings]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index === -1) return prev;
      const file = prev[index];
      
      setDeletedHistory(hist => [...hist, { files: [file], indices: [{ id: file.id, index }] }]);
      
      return prev.filter(f => f.id !== id);
    });
    setSelectedFileIds(prev => {
      if (prev.has(id)) {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }
      return prev;
    });
  }, []);

  const handleRemoveSelected = useCallback(() => {
    if (selectedFileIds.size === 0) return;
    
    setFiles(prev => {
      const toRemove: ImageFileItem[] = [];
      const indices: {id: string, index: number}[] = [];
      
      prev.forEach((f, idx) => {
        if (selectedFileIds.has(f.id)) {
          toRemove.push(f);
          indices.push({ id: f.id, index: idx });
        }
      });
      
      if (toRemove.length > 0) {
        setDeletedHistory(hist => [...hist, { files: toRemove, indices }]);
      }
      
      return prev.filter(f => !selectedFileIds.has(f.id));
    });
    setSelectedFileIds(new Set());
  }, [selectedFileIds]);

  const handleToggleSelect = useCallback((id: string, multi: boolean) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (multi) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        if (next.has(id) && next.size === 1) {
          next.delete(id);
        } else {
          next.clear();
          next.add(id);
        }
      }
      return next;
    });
  }, []);
  const handleUndo = useCallback(() => {
    setDeletedHistory(hist => {
      if (hist.length === 0) return hist;
      const last = hist[hist.length - 1];
      
      setFiles(prev => {
        const next = [...prev];
        last.indices.forEach(({ index }, i) => {
          next.splice(index, 0, last.files[i]);
        });
        return next;
      });
      
      return hist.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleRemoveSelected();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setFiles(prev => {
          setSelectedFileIds(new Set(prev.map(f => f.id)));
          return prev;
        });
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRemoveSelected, handleUndo]);

  const handleClearAll = () => {
    files.forEach(file => {
      if (file?.convertedUrl) URL.revokeObjectURL(file.convertedUrl);
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
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

  const handleDownloadDirect = () => {
    const successFiles = files.filter(f => f.status === 'success' && f.blob);
    if (successFiles.length === 0) return;
    
    successFiles.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadSingle(item);
      }, index * 400); // 400ms delay to prevent browser blocking multiple concurrent downloads
    });
  };

  const handleDownloadAll = async () => {
    const successFiles = files.filter(f => f.status === 'success' && f.blob);
    if (successFiles.length === 0) return;

    if (settings.targetFormat === 'pdf') {
      try {
        setIsProcessing(true);
        const processor = await import('./lib/imageProcessor');
        const pdfBlob = await processor.generateCombinedPdf(successFiles, settings);
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

    const { generateBatchZip } = await import('./lib/conversionOrchestrator');
    const zipBlob = await generateBatchZip(successFiles, settings, formatOutputFilename);
    const zipUrl = URL.createObjectURL(zipBlob);
    const zipFileName = `converted_${settings.targetFormat}.zip`;


    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = zipFileName;
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

    // Maximize processing power by utilizing all available hardware cores, capped at 12 to prevent WASM OOM
    const hardwareCores = navigator.hardwareConcurrency || 4;
    let baseMaxConcurrent = Math.min(12, hardwareCores);

    let activeWorkers = 0;
    let currentIndex = 0;

    const processor = await import('./lib/imageProcessor');
    const convertSingleImage = processor.convertSingleImage;

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

        // Yield to the main thread via scheduler.yield or micro-task chunking to fix INP
        if (typeof (globalThis as any).scheduler?.yield === 'function') {
          await (globalThis as any).scheduler.yield();
        } else {
          await new Promise(r => setTimeout(r, 0));
        }

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
        
        const itemsToProcess: ImageFileItem[] = [];
        while (activeWorkers < currentLimit && currentIndex < pendingFiles.length) {
          if (abortControllerRef.current?.signal.aborted) break;
          itemsToProcess.push(pendingFiles[currentIndex++]);
          activeWorkers++;
        }

        if (itemsToProcess.length > 0) {
          setFiles(prev => {
            const nextFiles = [...prev];
            itemsToProcess.forEach(item => {
              const idx = nextFiles.findIndex(f => f.id === item.id);
              if (idx !== -1) {
                nextFiles[idx] = { ...nextFiles[idx], status: 'processing', error: undefined };
              }
            });
            return nextFiles;
          });

          itemsToProcess.forEach(item => {
            const itemStartTime = performance.now();
            convertSingleImage(item, settings)
              .then(result => {
                if (abortControllerRef.current?.signal.aborted) {
                  setFiles(prev => {
                    const nextFiles = [...prev];
                    const idx = nextFiles.findIndex(f => f.id === item.id);
                    if (idx !== -1) nextFiles[idx] = { ...nextFiles[idx], status: 'pending' };
                    return nextFiles;
                  });
                } else {
                  const processingTimeMs = Math.round(performance.now() - itemStartTime);
                  const compressionRatio = result.convertedSize && item.originalSize
                    ? Math.round((1 - result.convertedSize / item.originalSize) * 100)
                    : 0;


                  setFiles(prev => {
                    const nextFiles = [...prev];
                    const idx = nextFiles.findIndex(f => f.id === item.id);
                    if (idx !== -1) {
                      nextFiles[idx] = { 
                        ...nextFiles[idx], 
                        status: 'success', 
                        blob: result.blob,
                        convertedSize: result.convertedSize,
                        convertedUrl: result.convertedUrl,
                        dimensions: result.dimensions,
                        originalFallback: result.originalFallback
                      };
                    }
                    return nextFiles;
                  });
                }
              })
              .catch(error => {
                if (abortControllerRef.current?.signal.aborted) {
                  setFiles(prev => {
                    const nextFiles = [...prev];
                    const idx = nextFiles.findIndex(f => f.id === item.id);
                    if (idx !== -1) nextFiles[idx] = { ...nextFiles[idx], status: 'pending' };
                    return nextFiles;
                  });
                } else {
                  setFiles(prev => {
                    const nextFiles = [...prev];
                    const idx = nextFiles.findIndex(f => f.id === item.id);
                    if (idx !== -1) nextFiles[idx] = { ...nextFiles[idx], status: 'error', error: error.message };
                    return nextFiles;
                  });
                }
              })
              .finally(() => {
                activeWorkers--;
                completedBatchCountRef.current++;
                updateEtaMetrics();
                
                if (typeof (globalThis as any).scheduler?.yield === 'function') {
                  (globalThis as any).scheduler.yield().then(next);
                } else {
                  setTimeout(next, 0);
                }
              });
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
      processor.terminateWorkers();
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-neutral-50/50 dark:bg-[#202124] text-neutral-900 dark:text-[#e8eaed] font-sans transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>
      
      {/* Proof of Privacy Notification Banner */}
      {/* Privacy banner removed temporarily for debugging */}
      
      {/* Top Navbar */}
      <HeaderNavbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onInstallApp={handleInstallPWA}
        onOpenDonate={() => setIsDonateModalOpen(true)}
        onShareApp={handleShareApp}
        isCopiedShareLink={isCopiedShareLink}
      />

      <main id="main-content" className="max-w-6xl px-3 sm:px-6 py-4 sm:py-6 mx-auto lg:py-8 overflow-x-hidden">
        
        {/* Hero Section */}
        <div className="hero-container-cls-guard min-h-[80px] sm:min-h-[120px] flex flex-col items-center mb-4 sm:mb-6 text-center">
          <Breadcrumbs items={seoData.breadcrumbs} onNavigate={handleNavigate} />
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white mb-1.5 sm:mb-3 max-w-4xl leading-snug sm:leading-tight">
            {seoData.h1Title}
          </h1>
          <p className="max-w-3xl text-xs sm:text-base text-neutral-600 dark:text-[#9aa0a6] font-medium leading-relaxed px-2">
            {seoData.metaDescription}
          </p>
        </div>

        {/* Main Content Router */}
        {seoData.isNotFound ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20 min-h-[400px]">
            <h2 className="text-4xl font-black text-neutral-900 dark:text-white">Page Not Found</h2>
            <p className="text-neutral-600 dark:text-[#9aa0a6] text-center max-w-md">
              We couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
            <div className="flex gap-4">
              <button onClick={() => handleNavigate('/')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                Go to Home
              </button>
              <button onClick={() => handleNavigate('/tools')} className="px-6 py-3 bg-neutral-200 dark:bg-[#3c4043] text-neutral-900 dark:text-white font-bold rounded-xl hover:bg-neutral-300 dark:hover:bg-[#4a4d51] transition-colors">
                View All Tools
              </button>
            </div>
          </div>
        ) : currentPath === '/privacy-map' ? (
          <PrivacyMap />
        ) : currentPath === '/calculator' ? (
          <Calculator />
        ) : currentPath === '/docs/architecture' ? (
          <DocsArchitecture />
        ) : currentPath === '/privacy' ? (
          <PrivacyPolicy />
        ) : currentPath === '/terms' ? (
          <TermsOfService />
        ) : currentPath === '/tools' ? (
          <ToolsDirectory onNavigate={handleNavigate} />
        ) : currentPath === '/about' ? (
          <AboutPage />
        ) : (
          <React.Fragment>
            {files.length === 0 ? (
              /* STATE 1: IDLE */
              <div className="flex flex-col gap-6 mb-16 animate-in fade-in zoom-in-95 duration-300 min-h-[400px]">
                <Dropzone onFilesAdded={handleFilesAdded} fromFormat={seoData.fromFormat} />
              </div>
            ) : successCount === files.length && !isProcessing ? (
              /* STATE 3: COMPLETE */
              <div className="flex flex-col items-center gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto w-full min-h-[300px]">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                    <Check className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-neutral-900 dark:text-white">Conversion Complete</h2>
                  
                  {(() => {
                    const completed = files.filter(f => f.status === 'success' && f.convertedSize !== undefined);
                    const totOrig = completed.reduce((acc, f) => acc + f.originalSize, 0);
                    const totConv = completed.reduce((acc, f) => acc + (f.convertedSize || 0), 0);
                    const netSaved = totOrig - totConv;
                    const pct = totOrig > 0 ? Math.round((netSaved / totOrig) * 100) : 0;

                    if (netSaved >= 0) {
                      return (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-[#1e3427] text-emerald-700 dark:text-[#81c995] rounded-xl border border-emerald-200 dark:border-[#2d523c]">
                          <Sparkles className="w-5 h-5" />
                          <span className="font-bold text-sm">
                            Saved {formatBytes(netSaved)} ({pct}% reduction)
                          </span>
                        </div>
                      );
                    } else {
                      const isFormatOverhead = settings.targetFormat === 'ico' || settings.targetFormat === 'pdf';
                      return (
                        <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-[#2e2312] text-amber-800 dark:text-[#fdd663] rounded-xl border border-amber-200 dark:border-[#4d3a1f] text-center sm:text-left">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span className="font-bold text-sm">
                              {isFormatOverhead
                                ? `${settings.targetFormat.toUpperCase()} Document Generated (${formatBytes(totConv)})`
                                : `Size increased by ${formatBytes(Math.abs(netSaved))} (+${Math.abs(pct)}%)`}
                            </span>
                          </div>
                          {!isFormatOverhead && (
                            <span className="text-xs font-semibold opacity-90 border-t sm:border-t-0 sm:border-l border-amber-300 dark:border-amber-700/50 pt-1 sm:pt-0 sm:pl-2.5">
                              Tip: Switch format to WebP or AVIF for 80% compression
                            </span>
                          )}
                        </div>
                      );
                    }
                  })()}
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full mt-4">
                  <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:flex-initial">
                    <button
                      onClick={handleDownloadAll}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                      <DownloadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
                      {(() => {
                        const successCount = files.filter(f => f.status === 'success' && f.blob).length;
                        if (settings.targetFormat === 'pdf') return 'Download PDF';
                        if (successCount === 1) return 'Download File';
                        return 'Download All (.ZIP)';
                      })()}
                    </button>
                    {files.filter(f => f.status === 'success' && f.blob).length > 1 && settings.targetFormat !== 'pdf' && (
                      <button
                        onClick={handleDownloadDirect}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm active:scale-95 transition-all"
                      >
                        Download Separately
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleShareApp}
                    className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-neutral-700 dark:text-[#e8eaed] bg-white dark:bg-[#303134] hover:bg-neutral-50 border border-neutral-200 dark:border-[#3c4043] rounded-2xl shadow-sm active:scale-95 transition-all"
                  >
                    {isCopiedShareLink ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
                    {isCopiedShareLink ? 'Link Copied!' : 'Share App'}
                  </button>
                </div>
                
                <button
                  onClick={handleClearAll}
                  className="mt-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:text-[#9aa0a6] dark:hover:text-white underline decoration-neutral-300 underline-offset-4"
                >
                  Convert More Files
                </button>
              </div>
            ) : (
              /* STATE 2: ACTIVE */
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <GlobalControls 
                  settings={settings} 
                  onChange={setSettings} 
                  disabled={isProcessing}
                  onConvert={processFiles}
                  onStop={stopProcessing}
                  isProcessing={isProcessing}
                  isStopping={isStopping}
                  pendingCount={pendingCount}
                />

                <div className="flex flex-col bg-white dark:bg-neutral-900 border rounded-3xl border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-neutral-900 dark:text-white text-lg">Queue ({files.length})</span>
                      {isProcessing && etaText && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 dark:bg-[#1e293b] text-blue-700 dark:text-[#8ab4f8] shadow-sm border border-blue-200 dark:border-[#384c6c] flex items-center gap-1.5">
                          <span>⏱️ {etaText}</span>
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleClearAll}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> Clear
                    </button>
                  </div>
                  
                  {/* Screen reader aria-live progress region */}
                  <div className="sr-only" aria-live="polite" aria-atomic="true">
                    {isProcessing
                      ? `Converting batch: ${processedCount} of ${totalCount} files processed (${progressPercent}% complete).`
                      : successCount > 0 && successCount === totalCount
                      ? `Batch conversion complete. ${successCount} files converted.`
                      : ''}
                  </div>

                  <div className="p-4">
                    <VirtualFileList
                      files={files}
                      selectedFileIds={selectedFileIds}
                      onToggleSelect={handleToggleSelect}
                      onRemove={handleRemoveFile}
                      onRetry={handleRetryFile}
                      onDownload={handleDownloadSingle}
                      onRotate={handleRotateItem}
                      onCompare={(item) => setCompareItem(item)}
                      onInspectDetails={(item) => setInspectItem(item)}
                    />
                  </div>
                </div>

                {/* Mobile Floating Action Widget */}
                <div className="md:hidden fixed bottom-6 right-5 z-40 flex justify-end animate-in slide-in-from-bottom-4 fade-in duration-300">
                  {isProcessing ? (
                    <button
                      onClick={stopProcessing}
                      disabled={isStopping}
                      className={cn(
                        "flex items-center gap-2 px-5 py-3 text-sm font-black text-white transition-all rounded-full shadow-xl border border-red-400 dark:border-red-600",
                        isStopping
                          ? "bg-amber-500 cursor-not-allowed opacity-90 border-amber-400 shadow-md"
                          : "bg-red-500 hover:bg-red-600 active:scale-95 shadow-lg"
                      )}
                      aria-label="Stop Processing"
                    >
                      {isStopping ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Stopping...</>
                      ) : (
                        <><Zap className="w-4 h-4 animate-pulse" /> Stop</>
                      )}
                    </button>
                  ) : pendingCount > 0 ? (
                    <button
                      onClick={processFiles}
                      className="flex items-center gap-2 px-5 py-3 text-sm font-black text-neutral-900 bg-[#fdd663] hover:bg-[#fbbc04] active:scale-95 transition-all rounded-full shadow-xl border border-[#e3a800]"
                      aria-label="Convert Files"
                    >
                      <Zap className="w-4 h-4 fill-current text-neutral-900" />
                      <span>Convert ({pendingCount})</span>
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            <section className="w-full max-w-5xl mx-auto mb-8 rounded-3xl border border-neutral-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-[#3c4043] dark:bg-[#303134]/90 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600 dark:text-[#8ab4f8]">
                    Why people choose Zapixal
                  </p>
                  <h2 className="mt-2 text-lg font-black text-neutral-900 dark:text-white sm:text-xl">
                    A stronger image workflow for privacy, compatibility, and speed
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-[#2d523c] dark:bg-[#1e3427] dark:text-[#81c995]">
                  <ShieldCheck className="h-4 w-4" />
                  Zero uploads · 100% local
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
                  <div className="flex items-center gap-2 text-sm font-black text-neutral-900 dark:text-white">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    Privacy-first by design
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
                    Files stay in your browser, which lowers the risk of exposing metadata, documents, or personal content.
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
                  <div className="flex items-center gap-2 text-sm font-black text-neutral-900 dark:text-white">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Built for real workflows
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
                    The app supports batch work, size targets, format changes, and accessible delivery for web, ecommerce, and documents.
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
                  <div className="flex items-center gap-2 text-sm font-black text-neutral-900 dark:text-white">
                    <ImageIcon className="h-4 w-4 text-amber-600" />
                    Better output decisions
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
                    The guidance explains when to use JPEG, PNG, WebP, AVIF, or a smaller target size so the results are practical, not just smaller.
                  </p>
                </div>
              </div>
            </section>

            {/* Recharts Summary Chart for Batch Size Savings */}
            <BatchStatsChart files={files} />

            {/* Embed Widget for Webmasters & SEO */}
            <EmbedWidget />

            {/* Dynamic pSEO Content Guide & FAQ */}
            <PseoContentGuide seoData={seoData} onNavigate={handleNavigate} />
          </React.Fragment>
        )}
      </main>

      {/* Dynamic pSEO Interlinking Footer Link Hub */}
      <FooterLinkHub 
        currentPath={currentPath} 
        onNavigate={handleNavigate} 
        onOpenInstall={() => setIsInstallModalOpen(true)}
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

      <DonateModal 
        isOpen={isDonateModalOpen} 
        onClose={() => setIsDonateModalOpen(false)} 
      />
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
      {hasConvertedInSession && !hasDismissedPwaBanner && (
        <PwaBanner
          deferredPrompt={deferredPrompt}
          onClose={handleClosePwaBanner}
        />
      )}
    </div>
  );
}


