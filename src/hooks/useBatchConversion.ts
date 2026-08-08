import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageFileItem, ConversionSettings, TargetFormat } from '../types';
import { detectHardwareCapabilities, checkBatteryThrottling, getBatchThresholds } from '../lib/hardwareCapabilities';
import { formatBytes, formatOutputFilename, getExtensionFromMime } from '../lib/utils';
import { safeRandomUUID } from '../lib/capabilities';
import { saveFilesToDirectory, downloadBlob } from '../lib/fileSystemAccess';

interface UseBatchConversionProps {
  settings: ConversionSettings;
  setSettings: React.Dispatch<React.SetStateAction<ConversionSettings>>;
}

export function useBatchConversion({ settings, setSettings }: UseBatchConversionProps) {
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [etaText, setEtaText] = useState<string>('');
  const [processingSpeed, setProcessingSpeed] = useState<string>('');
  const [concurrencyProfile, setConcurrencyProfile] = useState<string>('');
  const [hasConvertedInSession, setHasConvertedInSession] = useState(false);
  const [lastBatchDuration, setLastBatchDuration] = useState<string>('');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [showLowTierWarning, setShowLowTierWarning] = useState(false);
  const [stalledResetMessage, setStalledResetMessage] = useState<string | null>(null);

  const [isLargeBatchBannerDismissed, setIsLargeBatchBannerDismissed] = useState(false);
  const [isAutoChunkedBannerDismissed, setIsAutoChunkedBannerDismissed] = useState(false);

  // Global unhandled promise rejection listener integration
  useEffect(() => {
    const handleGlobalRejection = (e: Event) => {
      const customEvent = e as CustomEvent;
      const errorMsg = customEvent.detail?.message || '';
      
      setFiles(prev => {
        let matched = false;
        const nextFiles = prev.map(f => {
          if (f.status === 'processing') {
            const matchesName = errorMsg && f.file.name && errorMsg.includes(f.file.name);
            if (matchesName) {
              matched = true;
              return {
                ...f,
                status: 'error' as const,
                error: 'Unhandled operation failure'
              };
            }
          }
          return f;
        });
        
        if (!matched) {
          const firstProcessing = prev.find(f => f.status === 'processing');
          if (firstProcessing) {
            return prev.map(f => f.id === firstProcessing.id ? {
              ...f,
              status: 'error' as const,
              error: 'Operation failed unexpectedly'
            } : f);
          }
        }
        return nextFiles as ImageFileItem[];
      });
    };

    window.addEventListener('zapixal-unhandled-rejection' as any, handleGlobalRejection);
    return () => {
      window.removeEventListener('zapixal-unhandled-rejection' as any, handleGlobalRejection);
    };
  }, []);

  // Watchdog timer to detect stalled processing
  useEffect(() => {
    if (!isProcessing) return;

    const processingStartedAt = Date.now();
    let lastProgressAt = Date.now();
    let lastCompletedCount = completedBatchCountRef.current;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const currentCompleted = completedBatchCountRef.current;

      if (currentCompleted !== lastCompletedCount) {
        lastCompletedCount = currentCompleted;
        lastProgressAt = now;
      }

      const totalElapsed = now - processingStartedAt;
      const noProgressElapsed = now - lastProgressAt;

      // Watchdog conditions: total processing > 45s AND no progress for > 20s
      if (totalElapsed > 45000 && noProgressElapsed > 20000) {
        console.warn('Watchdog: Batch processing has stalled. Resetting in-progress files.');
        
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        setFiles(prev =>
          prev.map(f =>
            f.status === 'processing'
              ? {
                  ...f,
                  status: 'pending' as const,
                  progress: 0,
                  error: undefined,
                }
              : f
          )
        );

        setIsProcessing(false);
        setIsStopping(false);
        setStalledResetMessage('Conversion stalled and was reset — you can try converting again.');

        import('../lib/imageProcessor').then(m => {
          m.terminateWorkers();
        }).catch(e => {
          console.error('Failed to terminate workers in watchdog:', e);
        });

        clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isProcessing]);

  const isProcessingRef = useRef(false);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const batchStartTimeRef = useRef<number>(0);
  const completedBatchCountRef = useRef<number>(0);
  const totalBatchCountRef = useRef<number>(0);

  useEffect(() => {
    if (!hasConvertedInSession && files.some(f => f.status === 'success')) {
      setHasConvertedInSession(true);
    }
  }, [files, hasConvertedInSession]);

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
    if (config.tier === 'LOW') {
      setConcurrencyProfile('Optimized for this device (entry-level — sequential processing)');
    } else if (config.tier === 'MID') {
      setConcurrencyProfile(`Optimized for this device (balanced — up to ${config.maxConcurrentWorkers} parallel processes)`);
    } else {
      setConcurrencyProfile(`Optimized for this device (performance-tier — up to ${config.maxConcurrentWorkers} parallel processes)`);
    }
  }, []);

  const thumbnailQueue = useRef<{ id: string; file: File }[]>([]);
  const isProcessingThumbnails = useRef(false);

  const processThumbnailQueue = useCallback(async () => {
    if (isProcessingThumbnails.current) return;
    isProcessingThumbnails.current = true;
    
    try {
      const { generateThumbnail } = await import('../lib/imageProcessor');
      
      while (thumbnailQueue.current.length > 0) {
        if (isProcessingRef.current) {
          // Pause and wait before pulling items from the queue
          await new Promise(resolve => setTimeout(resolve, 250));
          continue;
        }

        const hw = detectHardwareCapabilities();
        const batchSize = hw.thumbnailBatchSize;
        const batch = thumbnailQueue.current.splice(0, batchSize);
        
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

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file && file.size > 0);
    if (validFiles.length === 0) return;

    const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB

    // Reset banner dismissal flags when adding new files
    setIsLargeBatchBannerDismissed(false);
    setIsAutoChunkedBannerDismissed(false);

    setFiles(prev => {
      const newItems: ImageFileItem[] = [];

      validFiles.forEach((file) => {
        const isOverSize = file.size > MAX_FILE_SIZE;

        let status: 'pending' | 'error' = 'pending';
        let error: string | undefined = undefined;

        if (isOverSize) {
          status = 'error';
          error = `File size exceeds 150MB limit (${formatBytes(file.size)}).`;
        }

        newItems.push({
          id: safeRandomUUID(),
          file,
          previewUrl: '',
          originalSize: file.size,
          status,
          error,
          progress: 0,
        });
      });

      const merged = [...prev, ...newItems];

      // Push to thumbnail queue only if status is pending
      newItems.forEach(item => {
        if (item.status === 'pending') {
          thumbnailQueue.current.push({ id: item.id, file: item.file });
        }
      });

      return merged;
    });

    processThumbnailQueue();
  }, [processThumbnailQueue]);

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

  const handleUpdateFileFormat = useCallback((id: string, format: TargetFormat | undefined) => {
    setFiles(prev =>
      prev.map(file => {
        if (file.id === id) {
          if (file.convertedUrl) {
            URL.revokeObjectURL(file.convertedUrl);
          }
          return {
            ...file,
            customTargetFormat: format,
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

  const handleUpdateBlurRegions = useCallback((id: string, regions: Array<{ x: number; y: number; width: number; height: number }> | undefined, mode: 'blur' | 'pixelate' | undefined) => {
    setFiles(prev =>
      prev.map(file => {
        if (file.id === id) {
          if (file.convertedUrl) {
            URL.revokeObjectURL(file.convertedUrl);
          }
          return {
            ...file,
            blurRegions: regions,
            blurMode: mode,
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
      const processor = await import('../lib/imageProcessor');
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
            convertedUrl: result.convertedUrl,
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
      const target = prev.find(f => f.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter(f => f.id !== id);
    });
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const cleanupWorkers = useCallback(() => {
    import('../lib/imageProcessor').then(m => m.terminateWorkers()).catch(e => {
      console.error('Failed to cleanup workers:', e);
    });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => cleanupWorkers();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupWorkers();
    };
  }, [cleanupWorkers]);

  const handleClearAll = useCallback(() => {
    setFiles(prev => {
      prev.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      });
      return [];
    });
    setSelectedFileIds(new Set());
    cleanupWorkers();
  }, [cleanupWorkers]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDownloadSingle = useCallback(async (file: ImageFileItem) => {
    if (!file.blob || !file.convertedUrl) return;
    const a = document.createElement('a');
    a.href = file.convertedUrl;
    
    const idx = files.findIndex(f => f.id === file.id);
    const finalName = formatOutputFilename(file, idx !== -1 ? idx : 0, settings);
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [files, settings]);

  const handleDownloadToDirectory = useCallback(async () => {
    const successfulFiles = files.filter(f => f.status === 'success' && f.blob);
    if (successfulFiles.length === 0) return false;

    const usedNames = new Set<string>();
    const res = await saveFilesToDirectory(successfulFiles, (file, i) => {
      const idx = files.findIndex(f => f.id === file.id);
      let fileName = formatOutputFilename(file, idx !== -1 ? idx : i, settings);
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
      return fileName;
    });

    return res.success;
  }, [files, settings]);

  const handleDownloadAll = useCallback(async () => {
    const successfulFiles = files.filter(f => f.status === 'success' && f.blob);
    if (successfulFiles.length === 0) return;

    if (settings.targetFormat === 'pdf') {
      try {
        const { generateCombinedPdf } = await import('../lib/conversionOrchestrator');
        const pdfBlob = await generateCombinedPdf(successfulFiles, settings);
        downloadBlob(pdfBlob, 'zapixal-converted-documents.pdf');
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      }
      return;
    }

    if (successfulFiles.length === 1) {
      handleDownloadSingle(successfulFiles[0]);
      return;
    }

    const totalBatchBytes = successfulFiles.reduce((sum, f) => sum + (f.blob?.size || f.convertedSize || f.originalSize), 0);
    const hw = detectHardwareCapabilities();
    const thresholds = getBatchThresholds(hw.tier);
    const isMaxBatch = totalBatchBytes >= thresholds.maxBatchBytes;
    const hasDirectoryPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    // Helper function for formatting filenames uniquely
    const getFormattedName = (file: ImageFileItem, i: number, usedNames: Set<string>) => {
      const idx = files.findIndex(f => f.id === file.id);
      let fileName = formatOutputFilename(file, idx !== -1 ? idx : i, settings);
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
      return fileName;
    };

    // 1. Automatic Directory Stream strategy when max batch threshold is crossed
    if (isMaxBatch && hasDirectoryPicker) {
      const batchNames = new Set<string>();
      const itemsWithUniqueNames = successfulFiles.map((f, i) => ({
        blob: f.blob!,
        name: getFormattedName(f, i, batchNames),
      }));

      const res = await saveFilesToDirectory(itemsWithUniqueNames);
      if (res.success || res.canceled) {
        return;
      }
      // If folder export failed without cancellation, fall back to chunked ZIP export!
    }

    // 2. Chunked ZIP export strategy (for browsers without DirectoryPicker or as fallback)
    const zipSizeBudget = thresholds.optimalBatchBytes;
    const zipChunks: ImageFileItem[][] = [];
    let currentChunk: ImageFileItem[] = [];
    let currentChunkBytes = 0;

    for (const file of successfulFiles) {
      const fSize = file.blob?.size || file.convertedSize || file.originalSize;
      if (currentChunk.length > 0 && (currentChunkBytes + fSize > zipSizeBudget)) {
        zipChunks.push(currentChunk);
        currentChunk = [file];
        currentChunkBytes = fSize;
      } else {
        currentChunk.push(file);
        currentChunkBytes += fSize;
      }
    }
    if (currentChunk.length > 0) {
      zipChunks.push(currentChunk);
    }

    try {
      const JSZip = (await import('jszip')).default;

      if (zipChunks.length <= 1) {
        const zip = new JSZip();
        const usedNames = new Set<string>();
        for (let i = 0; i < successfulFiles.length; i++) {
          const file = successfulFiles[i];
          const fileName = getFormattedName(file, i, usedNames);
          zip.file(fileName, file.blob!);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        downloadBlob(content, `zapixal-converted-${Date.now()}.zip`);
      } else {
        const totalParts = zipChunks.length;
        const globalUsedNames = new Set<string>();

        for (let partIdx = 0; partIdx < totalParts; partIdx++) {
          const chunk = zipChunks[partIdx];
          const zip = new JSZip();

          for (let i = 0; i < chunk.length; i++) {
            const file = chunk[i];
            const fileName = getFormattedName(file, i, globalUsedNames);
            zip.file(fileName, file.blob!);
          }

          const content = await zip.generateAsync({ type: 'blob' });
          const partName = `zapixal-export-part-${partIdx + 1}-of-${totalParts}.zip`;
          downloadBlob(content, partName);

          if (partIdx < totalParts - 1) {
            await new Promise(res => setTimeout(res, 500));
          }
        }
      }
    } catch (err) {
      console.error('Failed to generate ZIP export:', err);
    }
  }, [files, settings, handleDownloadSingle]);

  const handleDownloadDirect = useCallback(async () => {
    const successfulFiles = files.filter(f => f.status === 'success' && f.blob);
    for (let i = 0; i < successfulFiles.length; i++) {
      handleDownloadSingle(successfulFiles[i]);
      if (i < successfulFiles.length - 1) {
        await new Promise(res => setTimeout(res, 200));
      }
    }
  }, [files, handleDownloadSingle]);

  const stopProcessing = useCallback(() => {
    if (!isProcessing || isStopping) return;
    setIsStopping(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [isProcessing, isStopping]);

  const processFiles = useCallback(async (options?: { forceAll?: boolean; chunked?: boolean }) => {
    if (isProcessing) return;
    
    setStalledResetMessage(null);
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) return;

    const baseHw = detectHardwareCapabilities();
    const hw = await checkBatteryThrottling(baseHw);
    const thresholds = getBatchThresholds(hw.tier);
    const totalSize = pendingFiles.reduce((sum, f) => sum + f.originalSize, 0);

    // Automatically engage safest export strategy (chunked) if total size reaches maxBatchBytes
    const runChunked = options?.chunked || totalSize >= thresholds.maxBatchBytes;

    setIsProcessing(true);
    setIsStopping(false);
    
    abortControllerRef.current = new AbortController();
    
    const processor = await import('../lib/imageProcessor');
    const maxConcurrent = hw.maxConcurrentWorkers;

    // Split pendingFiles into chunks of 15 if chunked processing is selected or auto-engaged
    const chunkSize = 15;
    const chunks: ImageFileItem[][] = [];
    if (runChunked) {
      for (let i = 0; i < pendingFiles.length; i += chunkSize) {
        chunks.push(pendingFiles.slice(i, i + chunkSize));
      }
    } else {
      chunks.push(pendingFiles);
    }

    try {
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        if (abortControllerRef.current?.signal.aborted) break;
        
        const currentChunk = chunks[chunkIndex];
        completedBatchCountRef.current = 0;
        totalBatchCountRef.current = currentChunk.length;
        batchStartTimeRef.current = Date.now();
        setEtaText(runChunked ? `Chunk ${chunkIndex + 1} of ${chunks.length}...` : 'Calculating...');

        // Update files in current chunk to 'processing'
        setFiles(prev => prev.map(f => {
          if (currentChunk.some(p => p.id === f.id)) {
            return { ...f, status: 'processing', progress: 0, error: undefined };
          }
          return f;
        }));

        let currentIndex = 0;
        let activeWorkers = 0;

        await new Promise<void>((resolveChunk) => {
          const next = () => {
            if (abortControllerRef.current?.signal.aborted) {
              if (activeWorkers === 0) {
                resolveChunk();
              }
              return;
            }

            while (activeWorkers < maxConcurrent && currentIndex < currentChunk.length) {
              const item = currentChunk[currentIndex++];
              activeWorkers++;

              processor.convertSingleImage(item, settings, abortControllerRef.current?.signal)
                .then(result => {
                  if (abortControllerRef.current?.signal.aborted) {
                    if (result.convertedUrl) {
                      try { URL.revokeObjectURL(result.convertedUrl); } catch (e) {}
                    }
                    return;
                  }
                  setFiles(prev => prev.map(f => f.id === item.id ? {
                    ...f,
                    status: 'success',
                    blob: result.blob,
                    convertedSize: result.convertedSize,
                    convertedUrl: result.convertedUrl,
                    dimensions: result.dimensions,
                    originalFallback: result.originalFallback,
                    progress: 100
                  } : f));
                })
                .catch(err => {
                  if (abortControllerRef.current?.signal.aborted) return;
                  setFiles(prev => prev.map(f => f.id === item.id ? {
                    ...f,
                    status: 'error',
                    error: err.message || 'Conversion failed'
                  } : f));
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
            }

            if (activeWorkers === 0 && (currentIndex >= currentChunk.length || abortControllerRef.current?.signal.aborted)) {
              if (abortControllerRef.current?.signal.aborted) {
                setFiles(prev => prev.map(f => f.status === 'processing' ? { ...f, status: 'pending' } : f));
              }
              resolveChunk();
            }
          };
          
          next();
        });
      }
    } finally {
      setIsProcessing(false);
      setIsStopping(false);
    }
  }, [files, isProcessing, settings, updateEtaMetrics]);

  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const totalCount = files.length;
  const processedCount = files.filter(f => f.status === 'success' || f.status === 'error').length;
  const progressPercent = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  const setFormat = useCallback((format: TargetFormat) => {
    setSettings(prev => ({ ...prev, targetFormat: format }));
  }, [setSettings]);

  const handleReformatItems = useCallback(async (ids: string[], newFormat: TargetFormat) => {
    if (isProcessing) return;
    const itemsToReformat = files.filter(f => ids.includes(f.id));
    if (itemsToReformat.length === 0) return;

    setIsProcessing(true);
    setIsStopping(false);

    abortControllerRef.current = new AbortController();
    setEtaText('Reformatting...');

    // Set files to processing, update customTargetFormat, and revoke old URLs
    setFiles(prev =>
      prev.map(f => {
        if (ids.includes(f.id)) {
          if (f.convertedUrl) {
            try { URL.revokeObjectURL(f.convertedUrl); } catch (e) {}
          }
          return {
            ...f,
            status: 'processing',
            customTargetFormat: newFormat,
            progress: 0,
            blob: undefined,
            convertedSize: undefined,
            convertedUrl: undefined,
            error: undefined,
          };
        }
        return f;
      })
    );

    const processor = await import('../lib/imageProcessor');
    const hardware = detectHardwareCapabilities();
    const maxConcurrent = hardware.maxConcurrentWorkers;

    let currentIndex = 0;
    let activeWorkers = 0;

    return new Promise<void>((resolve) => {
      const next = () => {
        if (abortControllerRef.current?.signal.aborted) {
          if (activeWorkers === 0) {
            setIsProcessing(false);
            setIsStopping(false);
            resolve();
          }
          return;
        }

        while (activeWorkers < maxConcurrent && currentIndex < itemsToReformat.length) {
          const item = itemsToReformat[currentIndex++];
          activeWorkers++;

          const itemSettings = {
            ...settings,
            targetFormat: newFormat,
          };

          processor.convertSingleImage({ ...item, customTargetFormat: newFormat }, itemSettings, abortControllerRef.current?.signal)
            .then(result => {
              if (abortControllerRef.current?.signal.aborted) {
                if (result.convertedUrl) {
                  try { URL.revokeObjectURL(result.convertedUrl); } catch (e) {}
                }
                return;
              }
              setFiles(prev => prev.map(f => f.id === item.id ? {
                ...f,
                status: 'success',
                blob: result.blob,
                convertedSize: result.convertedSize,
                convertedUrl: result.convertedUrl,
                dimensions: result.dimensions,
                originalFallback: result.originalFallback,
                progress: 100
              } : f));
            })
            .catch(err => {
              if (abortControllerRef.current?.signal.aborted) return;
              setFiles(prev => prev.map(f => f.id === item.id ? {
                ...f,
                status: 'error',
                error: err.message || 'Reformat failed'
              } : f));
            })
            .finally(() => {
              activeWorkers--;
              if (typeof (globalThis as any).scheduler?.yield === 'function') {
                (globalThis as any).scheduler.yield().then(next);
              } else {
                setTimeout(next, 0);
              }
            });
        }

        if (activeWorkers === 0 && (currentIndex >= itemsToReformat.length || abortControllerRef.current?.signal.aborted)) {
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
  }, [files, isProcessing, settings]);

  const totalPendingBytes = files
    .filter(f => f.status === 'pending' || f.status === 'error')
    .reduce((sum, f) => sum + f.originalSize, 0);

  const hwConfig = detectHardwareCapabilities();
  const currentThresholds = getBatchThresholds(hwConfig.tier);

  const isLargeBatch = totalPendingBytes >= currentThresholds.optimalBatchBytes && totalPendingBytes < currentThresholds.maxBatchBytes;
  const isMaxBatch = totalPendingBytes >= currentThresholds.maxBatchBytes;

  const showLargeBatchBanner = isLargeBatch && !isLargeBatchBannerDismissed;
  const showAutoChunkedBanner = isMaxBatch && !isAutoChunkedBannerDismissed;

  const dismissLargeBatchBanner = useCallback(() => {
    setIsLargeBatchBannerDismissed(true);
  }, []);

  const dismissAutoChunkedBanner = useCallback(() => {
    setIsAutoChunkedBannerDismissed(true);
  }, []);

  return {
    files,
    isProcessing,
    isStopping,
    etaText,
    processingSpeed,
    concurrencyProfile,
    hasConvertedInSession,
    lastBatchDuration,
    selectedFileIds,
    pendingCount,
    successCount,
    totalCount,
    processedCount,
    progressPercent,
    setFormat,
    handleFilesAdded,
    handleRotateItem,
    handleUpdateFileFormat,
    handleUpdateBlurRegions,
    handleReformatItems,
    handleRetryFile,
    handleRemoveFile,
    handleClearAll,
    handleToggleSelect,
    handleDownloadSingle,
    handleDownloadAll,
    handleDownloadDirect,
    handleDownloadToDirectory,
    hasDirectoryPicker: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
    stopProcessing,
    processFiles,
    showLowTierWarning,
    setShowLowTierWarning,
    stalledResetMessage,
    setStalledResetMessage,
    showLargeBatchBanner,
    dismissLargeBatchBanner,
    showAutoChunkedBanner,
    dismissAutoChunkedBanner,
    totalPendingBytes,
    optimalBatchBytes: currentThresholds.optimalBatchBytes,
    maxBatchBytes: currentThresholds.maxBatchBytes,
    isAutoChunkedActive: isMaxBatch,
  };
}
