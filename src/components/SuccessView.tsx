import React, { useState } from 'react';
import { Download, CheckCircle2, ArrowRight, Eye, RefreshCw, FileArchive, Sparkles, FileText } from 'lucide-react';
import { calculateSavings, createCombinedPdf, createZipArchive, formatBytes } from '../lib/imageProcessor';
import { ConversionSettings, ImageFileItem, OutputFormat } from '../types';
import { BeforeAfterModal } from './BeforeAfterModal';
import { AdBanner } from './AdBanner';

interface SuccessViewProps {
  items: ImageFileItem[];
  settings: ConversionSettings;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  items,
  settings,
  onReset,
}) => {
  const [selectedInspectItem, setSelectedInspectItem] = useState<ImageFileItem | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const totalOriginalBytes = items.reduce((acc, item) => acc + item.originalSize, 0);
  const totalConvertedBytes = items.reduce(
    (acc, item) => acc + (item.convertedSize || item.originalSize),
    0
  );
  const totalSavings = calculateSavings(totalOriginalBytes, totalConvertedBytes);

  const handleDownloadSingle = (item: ImageFileItem) => {
    if (!item.convertedUrl) return;
    const link = document.createElement('a');
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    link.download = `${baseName}.${settings.targetFormat}`;
    link.href =
      typeof item.convertedUrl === 'string'
        ? item.convertedUrl
        : URL.createObjectURL(item.convertedUrl);
    link.click();
  };

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await createZipArchive(items, settings.targetFormat);
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.download = `Zapixal_Converted_Images_${settings.targetFormat.toUpperCase()}.zip`;
      link.href = zipUrl;
      link.click();
      URL.revokeObjectURL(zipUrl);
    } catch (e) {
      console.error('ZIP creation error:', e);
      alert('Failed to generate ZIP package. Please download files individually.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleExportCombinedPdf = async () => {
    try {
      setIsExportingPdf(true);
      const pdfBlob = await createCombinedPdf(items);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.download = `Zapixal_Combined_Document.pdf`;
      link.href = pdfUrl;
      link.click();
      URL.revokeObjectURL(pdfUrl);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('Failed to generate combined PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Success Summary Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Conversion Finished Successfully!</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {items.length} {items.length === 1 ? 'Image' : 'Images'} Converted to{' '}
              <span className="text-blue-600 uppercase">{settings.targetFormat}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Original Total: <span className="text-slate-800 font-semibold">{formatBytes(totalOriginalBytes)}</span>{' '}
              → Converted Total:{' '}
              <span className="text-emerald-600 font-bold">{formatBytes(totalConvertedBytes)}</span>
            </p>
          </div>

          {/* Savings Highlight Badge */}
          {totalSavings.isSmaller && (
            <div className="bg-emerald-50 border border-emerald-200 px-6 py-4 rounded-xl text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 block">
                -{totalSavings.percentage}%
              </span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Total Saved ({formatBytes(totalSavings.bytesSaved)})
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Creating ZIP Archive...</span>
              </>
            ) : (
              <>
                <FileArchive className="w-5 h-5" />
                <span>Download All (.zip)</span>
              </>
            )}
          </button>

          {settings.targetFormat === 'pdf' && (
            <button
              onClick={handleExportCombinedPdf}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Export Combined PDF</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>Convert More Images</span>
          </button>
        </div>
      </div>

      {/* REQUIREMENT: High Dwell-Time Ad Slot next to or below Download All */}
      <div className="py-2">
        <AdBanner type="highDwell" />
      </div>

      {/* Results Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 px-1">Converted Files List</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => {
            const savings = item.convertedSize
              ? calculateSavings(item.originalSize, item.convertedSize)
              : null;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
              >
                {/* Image Info */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src={
                        item.convertedUrl
                          ? typeof item.convertedUrl === 'string'
                            ? item.convertedUrl
                            : URL.createObjectURL(item.convertedUrl)
                          : item.previewUrl
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                      {item.name}
                    </p>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span>{formatBytes(item.originalSize)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-600 font-bold">
                        {item.convertedSize ? formatBytes(item.convertedSize) : 'Ready'}
                      </span>
                    </div>

                    {savings && savings.isSmaller && (
                      <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded font-semibold">
                        -{savings.percentage}% Smaller
                      </span>
                    )}
                  </div>
                </div>

                {/* Individual Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setSelectedInspectItem(item)}
                    title="Compare Original vs Converted"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => handleDownloadSingle(item)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Diff Inspect Modal */}
      {selectedInspectItem && (
        <BeforeAfterModal
          item={selectedInspectItem}
          onClose={() => setSelectedInspectItem(null)}
        />
      )}
    </div>
  );
};
