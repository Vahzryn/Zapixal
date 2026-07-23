import React, { useEffect, useState } from 'react';
import { AdBanner } from './components/AdBanner';
import { Dropzone } from './components/Dropzone';
import { FaqSection } from './components/FaqSection';
import { Header } from './components/Header';
import { QueueList } from './components/QueueList';
import { SeoHead } from './components/SeoHead';
import { SettingsBar } from './components/SettingsBar';
import { SuccessView } from './components/SuccessView';
import { DonateModal } from './components/DonateModal';
import { convertSingleImage, loadImageElement } from './lib/imageProcessor';
import { getSeoInfoForRoute } from './lib/seoData';
import { ConversionSettings, ImageFileItem, OutputFormat, ViewState } from './types';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [viewState, setViewState] = useState<ViewState>('zero');
  const [items, setItems] = useState<ImageFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  useEffect(() => {
    const handleOpenDonate = () => setIsDonateOpen(true);
    window.addEventListener('open-donate', handleOpenDonate);
    return () => window.removeEventListener('open-donate', handleOpenDonate);
  }, []);

  // Global settings state
  const [settings, setSettings] = useState<ConversionSettings>({
    targetFormat: 'webp',
    quality: 0.85,
    presetName: 'balanced85',
    resize: {
      enabled: false,
      keepAspectRatio: true,
    },
  });

  // Handle URL hash changes
  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);

      const seo = getSeoInfoForRoute(path);
      if (seo.targetFormat) {
        setSettings((prev) => ({
          ...prev,
          targetFormat: seo.targetFormat!,
        }));
      }
    };

    handlePathChange();
    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, []);

  const handleNavigate = (routePath: string) => {
    window.history.pushState({}, '', routePath);
    setCurrentRoute(routePath);
    const seo = getSeoInfoForRoute(routePath);
    if (seo.targetFormat) {
      setSettings((prev) => ({
        ...prev,
        targetFormat: seo.targetFormat!,
      }));
    }
  };

  // Handle adding new files
  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    let filesToAdd = files;

    if (filesToAdd.length === 0) return;

    const newItems: ImageFileItem[] = [];

    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      let dimensions = undefined;
      let previewUrl = '';

      try {
        const loaded = await loadImageElement(file);
        dimensions = loaded.dimensions;
        previewUrl = loaded.objectUrl;
      } catch (err) {
        console.warn('Preview load error:', err);
        previewUrl = URL.createObjectURL(file);
      }

      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      newItems.push({
        id,
        file,
        name: file.name,
        originalSize: file.size,
        originalType: file.type,
        originalExtension: extension,
        previewUrl,
        dimensions,
        status: 'pending',
        progress: 0,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    if (viewState === 'zero') {
      setViewState('workspace');
    }
  };

  // Remove single item and revoke URLs for memory safety
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.convertedUrl && typeof target.convertedUrl === 'string') {
          URL.revokeObjectURL(target.convertedUrl);
        }
      }
      const updated = prev.filter((item) => item.id !== id);
      if (updated.length === 0) {
        setViewState('zero');
      }
      return updated;
    });
  };

  // Clear entire queue
  const handleClearQueue = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl && typeof item.convertedUrl === 'string') {
        URL.revokeObjectURL(item.convertedUrl);
      }
    });
    setItems([]);
    setViewState('zero');
  };

  // Batch Conversion Engine
  const handleConvertAll = async () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);

    // Limit concurrency to keep UI responsive
    const concurrencyLimit = 2; 
    let activeTasks = 0;
    let currentIndex = 0;

    return new Promise<void>((resolve) => {
      const processNext = async () => {
        if (currentIndex >= items.length && activeTasks === 0) {
          setIsProcessing(false);
          setViewState('success');
          resolve();
          return;
        }

        while (activeTasks < concurrencyLimit && currentIndex < items.length) {
          const itemIndex = currentIndex++;
          activeTasks++;
          
          const currentItem = items[itemIndex];
          
          // Yield to main thread briefly before heavy work
          await new Promise(r => setTimeout(r, 20));

          setItems((prev) =>
            prev.map((item) =>
              item.id === currentItem.id
                ? { ...item, status: 'processing', progress: 30 }
                : item
            )
          );

          try {
            // Give UI time to update the progress bar to 30%
            await new Promise(r => setTimeout(r, 20));
            const result = await convertSingleImage(currentItem, settings);
            
            setItems((prev) =>
              prev.map((item) =>
                item.id === currentItem.id
                  ? {
                      ...item,
                      status: 'completed',
                      progress: 100,
                      convertedBlob: result.blob,
                      convertedSize: result.convertedSize,
                      convertedUrl: result.convertedUrl,
                      convertedDimensions: result.dimensions,
                      convertedFormat: settings.targetFormat,
                    }
                  : item
              )
            );
          } catch (error: any) {
            console.error(`Error converting ${currentItem.name}:`, error);
            setItems((prev) =>
              prev.map((item) =>
                item.id === currentItem.id
                  ? {
                      ...item,
                      status: 'error',
                      progress: 0,
                      errorMessage: error.message || 'Conversion failed',
                    }
                  : item
              )
            );
          } finally {
            activeTasks--;
            // Yield before starting next
            setTimeout(processNext, 20);
          }
        }
      };

      processNext();
    });
  };

  const handleReset = () => {
    // Reset back to workspace or zero state
    if (items.length > 0) {
      setViewState('workspace');
    } else {
      setViewState('zero');
    }
  };

  const seoInfo = getSeoInfoForRoute(currentRoute);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Dynamic SEO Meta & Head Tags */}
      <SeoHead currentRoute={currentRoute} />

      {/* Main Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        queueLength={items.length}
      />

      {/* Main Container with Sidebar Skyscraper Ad layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        <div className="flex-1 min-w-0 space-y-6">
          {/* VIEW STATE 1: ZeroState (Landing Dropzone) */}
          {viewState === 'zero' && (
            <>
              <Dropzone
                onFilesSelected={handleFilesSelected}
                seoInfo={seoInfo}
                onQuickPresetSelect={(fmt) => {
                  setSettings((prev) => ({ ...prev, targetFormat: fmt }));
                }}
              />
              <AdBanner type="leaderboard" />
            </>
          )}

          {/* VIEW STATE 2: WorkspaceState (Queue & Settings) */}
          {viewState === 'workspace' && (
            <div className="space-y-6 animate-fadeIn">
              <SettingsBar
                settings={settings}
                onUpdateSettings={(newSettings) => setSettings(newSettings)}
              />

              <QueueList
                items={items}
                settings={settings}
                isProcessing={isProcessing}
                onConvertAll={handleConvertAll}
                onClearQueue={handleClearQueue}
                onRemoveItem={handleRemoveItem}
                onAddMoreFiles={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept =
                    '.jpg,.jpeg,.png,.webp,.avif,.heic,.heif,.svg,.bmp,.gif,image/*';
                  input.onchange = (e: any) => {
                    if (e.target.files) {
                      handleFilesSelected(Array.from(e.target.files));
                    }
                  };
                  input.click();
                }}
              />

              <AdBanner type="leaderboard" />
            </div>
          )}

          {/* VIEW STATE 3: SuccessState (Results & Download) */}
          {viewState === 'success' && (
            <div className="animate-fadeIn">
              <SuccessView
                items={items}
                settings={settings}
                onReset={handleReset}
              />
            </div>
          )}

          {/* FAQ Accordion Section */}
          <FaqSection seoInfo={seoInfo} />
        </div>

        {/* Sticky Desktop 160x600 Sidebar Ad */}
        <AdBanner type="skyscraper" />
      </main>

      {/* Mobile Stickied 320x50 Bottom Anchor Ad */}
      <AdBanner type="mobileAnchor" />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-500 mb-12 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 space-y-4 flex flex-col items-center">
          <p className="font-semibold text-slate-700">
            Zapixal — Free Client-Side Batch Image Converter & Compressor
          </p>
          <p className="text-slate-500">
            100% Browser Local Processing • Files Never Leave Your Device • Zero Latency
          </p>

          <p className="text-[10px] text-slate-400 pt-2">
            © {new Date().getFullYear()} Zapixal. Designed for high performance and Web Vitals optimization.
          </p>

          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-[10px] text-slate-400">
            <a href="/" className="hover:text-slate-600 transition-colors">Home</a>
            <a href="/heic-to-jpg" className="hover:text-slate-600 transition-colors">HEIC to JPG</a>
            <a href="/compress-jpeg" className="hover:text-slate-600 transition-colors">Compress JPEG</a>
            <a href="/compress-png" className="hover:text-slate-600 transition-colors">PNG Compressor</a>
            <a href="/image-format-changer" className="hover:text-slate-600 transition-colors">Image Format Changer</a>
            <a href="/convert-to-avif" className="hover:text-slate-600 transition-colors">AVIF Converter</a>
            <a href="/image-to-pdf" className="hover:text-slate-600 transition-colors">Image to PDF</a>
            <a href="/webp-converter" className="hover:text-slate-600 transition-colors">WEBP Optimizer</a>
            <a href="/ico-converter" className="hover:text-slate-600 transition-colors">Favicon Generator</a>
          </nav>
        </div>
      </footer>
      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
    </div>
  );
}
