import React, { useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Scissors, 
  Download, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  RefreshCw,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { SeoRouteData } from '../lib/seoEngine';
import { splitPdfFile, parsePageRanges } from '../lib/pdfSplitMerge';
import { loadPdfDocument, renderPdfPageThumbnail } from '../lib/pdfProcessor';

import { SeoGuideContent } from './Converter/SeoGuideContent';

interface PdfSplitterPageProps {
  seoData: SeoRouteData;
  onNavigate: (path: string) => void;
}

export function PdfSplitterPage({ seoData, onNavigate }: PdfSplitterPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [rangeInput, setRangeInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{ url: string; filename: string; size: number; count: number } | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const cleanupResults = useCallback(() => {
    if (successResult?.url && successResult.url.startsWith('blob:')) {
      URL.revokeObjectURL(successResult.url);
    }
    setSuccessResult(null);
  }, [successResult]);

  const handleReset = useCallback(() => {
    cleanupResults();
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setRangeInput('');
    setThumbnails({});
    setErrorMessage(null);
  }, [cleanupResults]);

  const processPdfFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.includes('pdf') && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file (.pdf).');
      return;
    }

    setLoadingPdf(true);
    setErrorMessage(null);
    cleanupResults();
    setFile(selectedFile);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setRangeInput(`1-${Math.min(doc.numPages, 3)}`);

      // Load thumbnail previews for up to 30 pages
      const limit = Math.min(doc.numPages, 30);
      for (let i = 1; i <= limit; i++) {
        renderPdfPageThumbnail(doc, i, 160).then((url) => {
          setThumbnails((prev) => ({ ...prev, [i]: url }));
        }).catch(() => {});
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse PDF document.');
      setFile(null);
      setPdfDoc(null);
    } finally {
      setLoadingPdf(false);
    }
  }, [cleanupResults]);

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

  const handleSplit = async () => {
    if (!file || !pdfDoc) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      const pageNumbers = parsePageRanges(rangeInput, numPages);
      const splitBytes = await splitPdfFile(file, pageNumbers);
      const blob = new Blob([splitBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${file.name.replace(/\.[^/.]+$/, '')}-extracted-${pageNumbers.length}pages.pdf`;

      setSuccessResult({
        url,
        filename,
        size: blob.size,
        count: pageNumbers.length,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to split PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="space-y-4">
        <Breadcrumbs items={seoData.breadcrumbs} onNavigate={onNavigate} />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          <Scissors className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Client-Side PDF Splitter</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {seoData.h1Title}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          {seoData.metaDescription}
        </p>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white dark:bg-[#1e2024] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500 bg-neutral-50/50 dark:bg-neutral-900/30'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-200">
                Drag & drop a PDF document here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Processed entirely offline in browser memory. Zero cloud uploads.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processPdfFile(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* File info header */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#25282c] border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {formatBytes(file.size)} • {loadingPdf ? 'Loading...' : `${numPages} Pages`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 transition-colors shrink-0"
              >
                Change PDF
              </button>
            </div>

            {/* Range Input Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <span>Enter Pages or Ranges to Extract</span>
                </label>
                <span className="text-xs text-neutral-400 font-mono">
                  Example: 1-3, 5, 7-10
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-4, 6, 8-10"
                  className="flex-1 px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  disabled={isProcessing || !rangeInput.trim()}
                  onClick={handleSplit}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>Extract Pages</span>
                    </>
                  )}
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-neutral-400 font-semibold">Quick Presets:</span>
                <button
                  onClick={() => setRangeInput(`1-${numPages}`)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors"
                >
                  All ({numPages} pages)
                </button>
                <button
                  onClick={() => setRangeInput('1')}
                  className="px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors"
                >
                  First Page (1)
                </button>
                <button
                  onClick={() => setRangeInput(`${numPages}`)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors"
                >
                  Last Page ({numPages})
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-red-700 dark:text-red-300 text-xs sm:text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Page Previews Grid */}
            {numPages > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Page Previews ({numPages} total pages)
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-64 overflow-y-auto p-2 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  {Array.from({ length: Math.min(numPages, 100) }, (_, i) => i + 1).map((pageNum) => (
                    <div
                      key={pageNum}
                      className="group relative bg-white dark:bg-[#25282c] rounded-xl border border-neutral-200 dark:border-neutral-700 p-2 flex flex-col items-center gap-1.5 shadow-2xs"
                    >
                      <div className="w-full aspect-[3/4] bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center">
                        {thumbnails[pageNum] ? (
                          <img
                            src={thumbnails[pageNum]}
                            alt={`Page ${pageNum}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-400">P.{pageNum}</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                        {pageNum}
                      </span>
                    </div>
                  ))}
                  {numPages > 100 && (
                    <div className="col-span-full py-4 text-center text-xs text-neutral-400">
                      Preview limited to first 100 pages. You can still extract any page up to {numPages}.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Result Card */}
        {successResult && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    PDF Split Successfully ({successResult.count} pages extracted)!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    File size: {formatBytes(successResult.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSuccessResult(null)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Adjust Range
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={successResult.url}
                download={successResult.filename}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Extracted PDF</span>
              </a>
            </div>
          </div>
        )}

      </div>

      <SeoGuideContent seoData={seoData} onNavigate={onNavigate} />
    </div>
  );
}
