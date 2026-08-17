import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckSquare,
  Square,
  Sliders,
  Download,
  Archive,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import JSZip from 'jszip';
import {
  loadPdfDocument,
  renderPdfPageToJpg,
  renderPdfPageThumbnail,
  sanitizeFilenameForPage,
  RenderedPdfPage
} from '../lib/pdfProcessor';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface PdfToJpgConverterProps {
  onNavigate?: (path: string) => void;
}

export function PdfToJpgConverter({ onNavigate }: PdfToJpgConverterProps) {
  // File & Document State
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Page Selection State
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState<string>('');
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  // Render & Output Settings
  const [scale, setScale] = useState<number>(1.5);
  const [quality, setQuality] = useState<number>(0.85);

  // Processing & Results State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentProcessingPage, setCurrentProcessingPage] = useState<number>(0);
  const [processedResults, setProcessedResults] = useState<RenderedPdfPage[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);

  const abortControllerRef = useRef<boolean>(false);

  // Clean up object URLs when resetting or unmounting
  const cleanupResults = useCallback(() => {
    processedResults.forEach((res) => {
      if (res.dataUrl && res.dataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(res.dataUrl);
      }
    });
    setProcessedResults([]);
  }, [processedResults]);

  const handleReset = useCallback(() => {
    cleanupResults();
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setSelectedPages(new Set());
    setThumbnails({});
    setErrorMessage(null);
    setIsProcessing(false);
    setCurrentProcessingPage(0);
    setRangeInput('');
  }, [cleanupResults]);

  // Load PDF when file is selected
  const processPdfFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.includes('pdf') && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file (.pdf).');
      return;
    }

    setLoadingPdf(true);
    setErrorMessage(null);
    setFile(selectedFile);
    cleanupResults();

    try {
      const buffer = await selectedFile.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      setPdfDoc(doc);
      setNumPages(doc.numPages);

      // Default: Select all pages
      const allPages = new Set<number>();
      for (let i = 1; i <= doc.numPages; i++) {
        allPages.add(i);
      }
      setSelectedPages(allPages);

      // Lazily load thumbnails with bounded concurrency
      loadThumbnailsInBatches(doc, doc.numPages);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse PDF document.');
      setFile(null);
      setPdfDoc(null);
    } finally {
      setLoadingPdf(false);
    }
  }, [cleanupResults]);

  // Generate page thumbnails in small background batches
  const loadThumbnailsInBatches = async (doc: any, pageCount: number) => {
    // Only render thumbnails for up to 50 pages to prevent memory spike
    const pagesToRender = Math.min(pageCount, 50);
    for (let i = 1; i <= pagesToRender; i++) {
      try {
        const thumbUrl = await renderPdfPageThumbnail(doc, i, 180);
        setThumbnails((prev) => ({ ...prev, [i]: thumbUrl }));
      } catch (e) {
        console.warn(`Failed to generate thumbnail for page ${i}:`, e);
      }
    }
  };

  // Drag & drop handlers
  const [isDragActive, setIsDragActive] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processPdfFile(e.target.files[0]);
    }
  };

  // Page selection toggles
  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const selectAllPages = () => {
    const all = new Set<number>();
    for (let i = 1; i <= numPages; i++) {
      all.add(i);
    }
    setSelectedPages(all);
  };

  const clearPageSelection = () => {
    setSelectedPages(new Set());
  };

  const applyRangeSelection = () => {
    if (!rangeInput.trim()) return;
    const newSelected = new Set<number>();
    const parts = rangeInput.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= numPages) newSelected.add(i);
          }
        }
      } else {
        const page = parseInt(trimmed, 10);
        if (!isNaN(page) && page >= 1 && page <= numPages) {
          newSelected.add(page);
        }
      }
    }

    if (newSelected.size > 0) {
      setSelectedPages(newSelected);
    } else {
      setErrorMessage(`Invalid page range. Please enter valid page numbers between 1 and ${numPages}.`);
    }
  };

  // Convert selected pages sequentially
  const handleConvertPages = async () => {
    if (!pdfDoc || !file || selectedPages.size === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    cleanupResults();
    abortControllerRef.current = false;

    const pagesToProcess = Array.from(selectedPages).sort((a, b) => a - b);
    const results: RenderedPdfPage[] = [];

    try {
      for (let index = 0; index < pagesToProcess.length; index++) {
        if (abortControllerRef.current) break;

        const pageNum = pagesToProcess[index];
        setCurrentProcessingPage(pageNum);

        const { blob, width, height } = await renderPdfPageToJpg(pdfDoc, pageNum, scale, quality);
        const dataUrl = URL.createObjectURL(blob);
        const filename = sanitizeFilenameForPage(file.name, pageNum, 'jpg');

        results.push({
          pageNumber: pageNum,
          blob,
          dataUrl,
          width,
          height,
          sizeBytes: blob.size,
          filename
        });
      }

      setProcessedResults(results);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during page rendering.');
    } finally {
      setIsProcessing(false);
      setCurrentProcessingPage(0);
    }
  };

  const handleStopProcessing = () => {
    abortControllerRef.current = true;
  };

  // Single file download
  const handleDownloadSinglePage = (pageResult: RenderedPdfPage) => {
    const link = document.createElement('a');
    link.href = pageResult.dataUrl;
    link.download = pageResult.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk ZIP Download
  const handleDownloadZip = async () => {
    if (processedResults.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const folderName = file ? file.name.replace(/\.[^/.]+$/, '') : 'pdf_pages';

      processedResults.forEach((item) => {
        zip.file(item.filename, item.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(Math.floor(metadata.percent));
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${folderName}_jpg_pages.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    } catch (err: any) {
      setErrorMessage(`Failed to create ZIP package: ${err.message || 'Unknown error'}`);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Tool Header Card */}
      <div className="bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-[#1e293b] border border-blue-200 dark:border-[#384c6c] text-blue-700 dark:text-[#8ab4f8] text-xs font-bold mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>In-Browser PDF Rasterizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              Convert PDF Pages to JPG Images
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-[#9aa0a6] mt-2 max-w-2xl">
              Convert selected pages from a PDF into JPG images directly in your browser. Choose the pages you need, adjust the output settings, and download the resulting images.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-emerald-700 dark:text-[#81c995] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2 rounded-2xl shrink-0 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Secure Local Memory</span>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-center justify-between gap-3 text-amber-800 dark:text-amber-200 text-sm font-medium animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 text-amber-500 hover:text-amber-700 dark:hover:text-amber-100 rounded-lg"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STATE 1: EMPTY / FILE DROPZONE */}
      {!file && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`min-h-[260px] sm:min-h-[320px] relative flex flex-col items-center justify-center w-full p-6 sm:p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-200 bg-white dark:bg-[#303134] ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/20 dark:bg-[#8ab4f8]/10'
              : 'border-blue-200 dark:border-[#3c4043] hover:border-blue-400 dark:hover:border-[#8ab4f8]'
          }`}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="pdf-upload-input"
            aria-label="Upload PDF document"
          />
          <div className="flex flex-col items-center text-center max-w-md pointer-events-none gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#1e293b] dark:to-[#28354f] text-blue-600 dark:text-[#8ab4f8] flex items-center justify-center shadow-xs border border-blue-100 dark:border-[#384c6c]">
              {loadingPdf ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                {loadingPdf ? 'Parsing PDF Document...' : 'Drop a PDF here or click to choose'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#9aa0a6] mt-1">
                Supports all multi-page PDF files • Converts pages to JPEG images
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#202124] text-xs font-semibold text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#3c4043] mt-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>No image files uploaded • Private in-browser execution</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2 & 3: PDF LOADED & WORKSPACE */}
      {file && pdfDoc && (
        <div className="flex flex-col gap-6">
          {/* File Meta Header Bar */}
          <div className="bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/60 font-bold text-xs">
                PDF
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-[#9aa0a6] mt-0.5">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span className="font-bold text-blue-600 dark:text-[#8ab4f8]">{numPages} {numPages === 1 ? 'Page' : 'Pages'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-[#202124] hover:bg-neutral-200 dark:hover:bg-[#3c4043] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Choose Another PDF</span>
              </button>
            </div>
          </div>

          {/* Page Selection Controls */}
          <div className="bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-[#3c4043] pb-4">
              <div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-[#8ab4f8]" />
                  <span>Select Pages to Convert</span>
                </h4>
                <p className="text-xs text-neutral-500 dark:text-[#9aa0a6] mt-0.5">
                  {selectedPages.size} of {numPages} pages selected
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={selectAllPages}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-[#8ab4f8] bg-blue-50 dark:bg-[#1e293b] hover:bg-blue-100 dark:hover:bg-[#28354f] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Select All</span>
                </button>
                <button
                  onClick={clearPageSelection}
                  className="px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-[#202124] hover:bg-neutral-200 dark:hover:bg-[#3c4043] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Clear Selection</span>
                </button>
              </div>
            </div>

            {/* Quick Range Selection */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">Select Range:</span>
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 7-10"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyRangeSelection()}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-[#3c4043] bg-neutral-50 dark:bg-[#202124] text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none w-44"
              />
              <button
                onClick={applyRangeSelection}
                className="px-3 py-1.5 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 font-bold rounded-lg text-xs hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Pages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[360px] overflow-y-auto p-1 scrollbar-thin">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                const isSelected = selectedPages.has(pageNum);
                const thumb = thumbnails[pageNum];

                return (
                  <button
                    key={pageNum}
                    onClick={() => togglePageSelection(pageNum)}
                    className={`relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'border-blue-600 dark:border-[#8ab4f8] bg-blue-50/50 dark:bg-[#1e293b]/50 ring-2 ring-blue-500/20'
                        : 'border-neutral-200 dark:border-[#3c4043] bg-neutral-50 dark:bg-[#202124] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200">
                        Page {pageNum}
                      </span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-[#303134]'
                        }`}
                      >
                        {isSelected && <CheckSquare className="w-3 h-3" />}
                      </div>
                    </div>

                    <div className="w-full aspect-[3/4] bg-white dark:bg-[#303134] rounded border border-neutral-200 dark:border-[#3c4043] flex items-center justify-center overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={`Preview Page ${pageNum}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-neutral-400">
                          <FileText className="w-5 h-5" />
                          <span className="text-[9px]">Page {pageNum}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Output Settings Bar */}
          <div className="bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8] flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Output Quality & Resolution
                </h4>
                <p className="text-xs text-neutral-500 dark:text-[#9aa0a6]">
                  JPG encoding • Client-side rasterization
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Quality Slider */}
              <div className="flex items-center gap-2">
                <label htmlFor="quality-slider" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input
                  id="quality-slider"
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-24 accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Resolution Scale */}
              <div className="flex items-center gap-2">
                <label htmlFor="scale-select" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">
                  DPI Scale:
                </label>
                <select
                  id="scale-select"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-[#3c4043] bg-neutral-50 dark:bg-[#202124] text-neutral-900 dark:text-white text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value={1.0}>1.0x (Standard ~72 DPI)</option>
                  <option value={1.5}>1.5x (Crisp ~108 DPI)</option>
                  <option value={2.0}>2.0x (High-Res ~144 DPI)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action & Conversion Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl p-5">
            <div className="text-xs text-neutral-600 dark:text-[#9aa0a6]">
              {selectedPages.size === 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Select at least one page to convert.</span>
              ) : (
                <span>Ready to convert <strong className="text-neutral-900 dark:text-white">{selectedPages.size}</strong> selected {selectedPages.size === 1 ? 'page' : 'pages'} to JPG.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isProcessing ? (
                <button
                  onClick={handleStopProcessing}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Conversion</span>
                </button>
              ) : (
                <button
                  onClick={handleConvertPages}
                  disabled={selectedPages.size === 0}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                    selectedPages.size === 0
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 dark:bg-[#8ab4f8] text-white dark:text-[#202124] hover:bg-blue-700 dark:hover:bg-blue-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Convert {selectedPages.size} {selectedPages.size === 1 ? 'Page' : 'Pages'} to JPG</span>
                </button>
              )}
            </div>
          </div>

          {/* Processing Progress Overlay */}
          {isProcessing && (
            <div className="bg-blue-50 dark:bg-[#1e293b] border border-blue-200 dark:border-[#384c6c] rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-200">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-[#8ab4f8] animate-spin" />
              <div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                  Converting Page {currentProcessingPage}...
                </h4>
                <p className="text-xs text-neutral-600 dark:text-[#9aa0a6] mt-0.5">
                  Rendering PDF vector layer into high-fidelity JPEG pixels in browser RAM
                </p>
              </div>
            </div>
          )}

          {/* STATE 5: CONVERTED RESULTS & DOWNLOADS */}
          {processedResults.length > 0 && !isProcessing && (
            <div className="flex flex-col gap-5 mt-2 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                      Successfully Converted {processedResults.length} {processedResults.length === 1 ? 'Page' : 'Pages'}!
                    </h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      Your JPG images are ready for individual or batch ZIP download.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {processedResults.length > 1 && (
                    <button
                      onClick={handleDownloadZip}
                      disabled={isZipping}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {isZipping ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating ZIP ({zipProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4" />
                          <span>Download All as ZIP</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Converted Files Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedResults.map((res) => (
                  <div
                    key={res.pageNumber}
                    className="bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-[#202124] px-2.5 py-1 rounded-md">
                        Page {res.pageNumber}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6]">
                        {formatBytes(res.sizeBytes)}
                      </span>
                    </div>

                    <div className="w-full aspect-[4/3] bg-neutral-100 dark:bg-[#202124] rounded-xl overflow-hidden border border-neutral-200 dark:border-[#3c4043] flex items-center justify-center">
                      <img
                        src={res.dataUrl}
                        alt={`Converted Page ${res.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-[#3c4043]">
                      <span className="text-[11px] font-medium text-neutral-500 dark:text-[#9aa0a6]">
                        {res.width} × {res.height} px
                      </span>
                      <button
                        onClick={() => handleDownloadSinglePage(res)}
                        className="px-3 py-1.5 bg-blue-600 dark:bg-[#8ab4f8] text-white dark:text-[#202124] hover:bg-blue-700 dark:hover:bg-blue-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JPG</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
