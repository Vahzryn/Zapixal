import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageFileItem, ConversionSettings, TargetFormat } from '../types';
import { detectHardwareCapabilities } from '../lib/hardwareCapabilities';
import { formatBytes } from '../lib/utils';

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
    const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    setConcurrencyProfile(`Optimized (${cores}-core: ${config.maxConcurrentWorkers} workers)${config.mode === 'ECO' ? ' (Eco Mode)' : ''}`);
  }, []);

  const thumbnailQueue = useRef<{ id: string; file: File }[]>([]);
  const isProcessingThumbnails = useRef(false);

  const processThumbnailQueue = useCallback(async () => {
    if (isProcessingThumbnails.current) return;
    isProcessingThumbnails.current = true;
    
    try {
      const { generateThumbnail } = await import('../lib/imageProcessor');
      
      while (thumbnailQueue.current.length > 0) {
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
    const MAX_BATCH_SIZE = 100; // 100 files max

    setFiles(prev => {
      const currentCount = prev.length;
      const newItems: ImageFileItem[] = [];

      validFiles.forEach((file) => {
        const isOverSize = file.size > MAX_FILE_SIZE;
        const isOverBatch = (currentCount + newItems.length) >= MAX_BATCH_SIZE;

        let status: 'pending' | 'error' = 'pending';
        let error: string | undefined = undefined;

        if (isOverSize) {
          status = 'error';
          error = `File size exceeds 150MB limit (${formatBytes(file.size)}).`;
        } else if (isOverBatch) {
          status = 'error';
          error = `Batch limit exceeded. Max ${MAX_BATCH_SIZE} files allowed per batch.`;
        }

        newItems.push({
          id: crypto.randomUUID(),
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

  const handleClearAll = useCallback(() => {
    setFiles(prev => {
      prev.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      });
      return [];
    });
    setSelectedFileIds(new Set());
  }, []);

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
    
    let extension = settings.targetFormat.toLowerCase();
    if (extension === 'jpeg') extension = 'jpg';
    
    const baseName = file.file.name.substring(0, file.file.name.lastIndexOf('.')) || file.file.name;
    const finalName = `${baseName}.${extension}`;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [settings.targetFormat]);

  const handleDownloadAll = useCallback(async () => {
    const successfulFiles = files.filter(f => f.status === 'success' && f.blob);
    if (successfulFiles.length === 0) return;

    if (settings.targetFormat === 'pdf') {
      try {
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        
        for (let i = 0; i < successfulFiles.length; i++) {
          const file = successfulFiles[i];
          if (i > 0) pdf.addPage();
          
          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file.blob!);
          });
          
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgRatio = imgProps.width / imgProps.height;
          const pdfRatio = pdfWidth / pdfHeight;
          
          let w = pdfWidth;
          let h = pdfHeight;
          if (imgRatio > pdfRatio) {
            h = pdfWidth / imgRatio;
          } else {
            w = pdfHeight * imgRatio;
          }
          const x = (pdfWidth - w) / 2;
          const y = (pdfHeight - h) / 2;
          
          pdf.addImage(imgData, 'JPEG', x, y, w, h);
        }
        
        pdf.save('converted-documents.pdf');
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      }
      return;
    }

    if (successfulFiles.length === 1) {
      handleDownloadSingle(successfulFiles[0]);
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      successfulFiles.forEach(file => {
        let extension = settings.targetFormat.toLowerCase();
        if (extension === 'jpeg') extension = 'jpg';
        
        const baseName = file.file.name.substring(0, file.file.name.lastIndexOf('.')) || file.file.name;
        const finalName = `${baseName}.${extension}`;
        zip.file(finalName, file.blob!);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zapixal-converted-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    }
  }, [files, settings.targetFormat, handleDownloadSingle]);

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

  const processFiles = useCallback(async () => {
    if (isProcessing) return;
    
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) return;

    setIsProcessing(true);
    setIsStopping(false);
    
    abortControllerRef.current = new AbortController();
    batchStartTimeRef.current = Date.now();
    completedBatchCountRef.current = 0;
    totalBatchCountRef.current = pendingFiles.length;
    setEtaText('Calculating...');

    const processor = await import('../lib/imageProcessor');
    
    setFiles(prev => prev.map(f => {
      if (pendingFiles.some(p => p.id === f.id)) {
        return { ...f, status: 'processing', progress: 0, error: undefined };
      }
      return f;
    }));

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

        while (activeWorkers < maxConcurrent && currentIndex < pendingFiles.length) {
          const item = pendingFiles[currentIndex++];
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
  }, [files, isProcessing, settings, updateEtaMetrics]);

  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const totalCount = files.length;
  const processedCount = files.filter(f => f.status === 'success' || f.status === 'error').length;
  const progressPercent = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  const setFormat = useCallback((format: TargetFormat) => {
    setSettings(prev => ({ ...prev, targetFormat: format }));
  }, [setSettings]);

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
    handleRetryFile,
    handleRemoveFile,
    handleClearAll,
    handleToggleSelect,
    handleDownloadSingle,
    handleDownloadAll,
    handleDownloadDirect,
    stopProcessing,
    processFiles,
  };
}
