import React, { useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  RefreshCw,
  Settings2,
  FileDown
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { SeoRouteData } from '../lib/seoEngine';
import { loadPdfDocument, renderPdfPageToJpg } from '../lib/pdfProcessor';
import { SeoGuideContent } from './Converter/SeoGuideContent';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface PdfCompressorPageProps {
  seoData: SeoRouteData;
  onNavigate: (path: string) => void;
}

type CompressionLevel = 'low' | 'medium' | 'high' | 'extreme';

export function PdfCompressorPage({ seoData, onNavigate }: PdfCompressorPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ url: string; filename: string; originalSize: number; newSize: number } | null>(null);
  
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF file.');
      return;
    }

    setErrorMessage(null);
    setSuccessResult(null);
    setFile(selectedFile);
    setLoadingPdf(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const doc = await loadPdfDocument(arrayBuffer);
      setPdfDoc(doc);
      setNumPages(doc.numPages);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load PDF.');
      setFile(null);
      setPdfDoc(null);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleCompress = async () => {
    if (!file || !pdfDoc || numPages === 0) return;
    
    setIsProcessing(true);
    setErrorMessage(null);
    setProgressPercent(0);
    
    try {
      // Determine rasterization settings based on compression level
      // Lower scale = smaller resolution. Lower quality = higher JPEG compression.
      let scale = 1.0;
      let quality = 0.75;
      
      switch (compressionLevel) {
        case 'low':
          scale = 1.5;
          quality = 0.85;
          break;
        case 'medium':
          scale = 1.0;
          quality = 0.65;
          break;
        case 'high':
          scale = 0.75;
          quality = 0.50;
          break;
        case 'extreme':
          scale = 0.5;
          quality = 0.30;
          break;
      }

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'px' });
      pdf.deletePage(1); // Remove default empty page

      for (let i = 1; i <= numPages; i++) {
        const rendered = await renderPdfPageToJpg(pdfDoc, i, scale, quality);
        const { blob, width, height } = rendered;
        
        const orientation = width > height ? 'l' : 'p';
        pdf.addPage([width, height], orientation);
        
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        pdf.addImage(uint8Array, 'JPEG', 0, 0, width, height);
        
        setProgressPercent(Math.round((i / numPages) * 100));
      }

      const compressedBlob = pdf.output('blob');
      const url = URL.createObjectURL(compressedBlob);
      
      const dotIdx = file.name.lastIndexOf('.');
      const baseName = dotIdx >= 0 ? file.name.substring(0, dotIdx) : file.name;
      const newFilename = `${baseName}_compressed.pdf`;

      setSuccessResult({
        url,
        filename: newFilename,
        originalSize: file.size,
        newSize: compressedBlob.size
      });
      
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during compression.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setErrorMessage(null);
    if (successResult?.url) URL.revokeObjectURL(successResult.url);
    setSuccessResult(null);
    setProgressPercent(0);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <Breadcrumbs items={seoData.breadcrumbs} onNavigate={onNavigate} />
        
        <div className="text-center mb-10 mt-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            {seoData.h1Title}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {seoData.metaDescription}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800/30">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Main Workspace Card */}
        <div className="bg-white dark:bg-[#1e2024] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          
          {!file && !loadingPdf && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative group flex flex-col items-center justify-center py-20 px-6
                border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }
              `}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-xl font-medium text-neutral-800 dark:text-neutral-200 mb-2">
                Click or drag PDF file here
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm">
                Files are processed entirely in your browser. No uploads.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          )}

          {loadingPdf && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading document...</p>
            </div>
          )}

          {file && !successResult && !loadingPdf && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[200px] sm:max-w-xs">{file.name}</h3>
                    <p className="text-sm text-neutral-500">{formatBytes(file.size)} • {numPages} pages</p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-3 sm:mt-0 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-red-600 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm hover:shadow transition-all"
                  disabled={isProcessing}
                >
                  Change File
                </button>
              </div>

              {/* Compression Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings2 className="w-5 h-5 text-neutral-500" />
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Select Compression Level</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'low', label: 'Low Compression', desc: 'High Quality', scale: '1.5x' },
                    { id: 'medium', label: 'Medium', desc: 'Good Balance', scale: '1.0x' },
                    { id: 'high', label: 'High Compression', desc: 'Lower Quality', scale: '0.75x' },
                    { id: 'extreme', label: 'Extreme', desc: 'Smallest File', scale: '0.5x' }
                  ].map((level) => (
                    <button
                      key={level.id}
                      disabled={isProcessing}
                      onClick={() => setCompressionLevel(level.id as CompressionLevel)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${compressionLevel === level.id 
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }
                        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{level.label}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{level.desc}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  * Compression works by rasterizing document pages securely in your browser to remove hidden bloat and optimize imagery. Text may become slightly blurry at higher compression levels.
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white shadow-lg transition-all
                    ${isProcessing 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Compressing ({progressPercent}%)...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Compress PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {successResult && (
            <div className="animate-in zoom-in-95 duration-400">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Compression Complete
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                  Your document was successfully compressed.
                </p>
                
                <div className="flex justify-center items-center gap-6 py-4">
                  <div className="text-center">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">Original Size</div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 line-through opacity-70">{formatBytes(successResult.originalSize)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">New Size</div>
                    <div className="font-bold text-green-600 dark:text-green-400 text-lg">{formatBytes(successResult.newSize)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">Saved</div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {Math.max(0, Math.round(100 - (successResult.newSize / successResult.originalSize) * 100))}%
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <a
                    href={successResult.url}
                    download={successResult.filename}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all w-full sm:w-auto"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </a>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-sm transition-all w-full sm:w-auto"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Compress Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic SEO Guide Content */}
        {!isProcessing && !successResult && (
          <SeoGuideContent seoData={seoData} onNavigate={onNavigate} />
        )}

      </main>
    </div>
  );
}
