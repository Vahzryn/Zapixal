import React, { useState, useCallback, Suspense, lazy } from 'react';
import { ImageFileItem, ConversionSettings } from './types';
import { Dropzone } from './components/Dropzone';
import { HeaderNavbar } from './components/HeaderNavbar';
import { HeroHeader } from './components/Converter/HeroHeader';
import { CompleteView } from './components/Converter/CompleteView';
import { ValuePropsSection } from './components/Converter/ValuePropsSection';
import { QueueSection } from './components/Converter/QueueSection';
import { ModalsOrchestrator } from './components/Modals/ModalsOrchestrator';

import { useAppRouting } from './hooks/useAppRouting';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useShareActions } from './hooks/useShareActions';
import { useDarkMode } from './hooks/useDarkMode';
import { useBatchConversion } from './hooks/useBatchConversion';
import { Loader2 } from 'lucide-react';

// Lazy-loaded routes & secondary widgets
const PrivacyMap = lazy(() => import('./components/PrivacyMap').then(m => ({ default: m.PrivacyMap })));
const Calculator = lazy(() => import('./components/Calculator').then(m => ({ default: m.Calculator })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./components/TermsOfService').then(m => ({ default: m.TermsOfService })));
const AboutPage = lazy(() => import('./components/AboutPage').then(m => ({ default: m.AboutPage })));
const BatchStatsChart = lazy(() => import('./components/BatchStatsChart').then(m => ({ default: m.BatchStatsChart })));
const DocsArchitecture = lazy(() => import('./components/DocsArchitecture').then(m => ({ default: m.DocsArchitecture })));
const ToolsDirectory = lazy(() => import('./components/ToolsDirectory').then(m => ({ default: m.ToolsDirectory })));
const FooterLinkHub = lazy(() => import('./components/FooterLinkHub').then(m => ({ default: m.FooterLinkHub })));
const EmbedWidget = lazy(() => import('./components/EmbedWidget').then(m => ({ default: m.EmbedWidget })));
const PseoContentGuide = lazy(() => import('./components/PseoContentGuide').then(m => ({ default: m.PseoContentGuide })));

const PageLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center py-20 min-h-[400px] gap-3 text-neutral-500 dark:text-[#9aa0a6] animate-in fade-in duration-300">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    <span className="text-sm font-medium">Loading content...</span>
  </div>
);

const ChartLoadingFallback = () => (
  <div className="w-full h-64 bg-neutral-100 dark:bg-[#202124] rounded-2xl animate-pulse my-8 flex items-center justify-center border border-neutral-200 dark:border-[#3c4043]">
    <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      Loading batch stats chart...
    </div>
  </div>
);

interface AppProps {
  initialPath?: string;
}

export default function App({ initialPath }: AppProps) {
  const [settings, setSettings] = useState<ConversionSettings>({
    targetFormat: 'webp',
    quality: 80,
    resize: { enabled: false, keepAspectRatio: true },
    filenamePrefix: '',
    filenameSuffix: '',
  });

  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [hasDismissedPwaBanner, setHasDismissedPwaBanner] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zapixal_pwa_banner_dismissed') === 'true';
    }
    return false;
  });

  const [compareItem, setCompareItem] = useState<ImageFileItem | null>(null);
  const [inspectItem, setInspectItem] = useState<ImageFileItem | null>(null);

  // Extracted Custom Hooks
  const { currentPath, handleNavigate, seoData } = useAppRouting({ initialPath, setSettings });
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { deferredPrompt, handleInstallPWA } = usePwaInstall({
    onOpenInstallModal: () => setIsInstallModalOpen(true),
  });

  const {
    files,
    isProcessing,
    isStopping,
    etaText,
    hasConvertedInSession,
    selectedFileIds,
    pendingCount,
    successCount,
    totalCount,
    processedCount,
    progressPercent,
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
  } = useBatchConversion({ settings, setSettings });

  const { isCopiedShareLink, handleShareApp } = useShareActions({ files });

  const handleClosePwaBanner = useCallback(() => {
    setHasDismissedPwaBanner(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zapixal_pwa_banner_dismissed', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-neutral-50/50 dark:bg-[#202124] text-neutral-900 dark:text-[#e8eaed] font-sans transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>

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
        {/* Hero Header Section */}
        <HeroHeader seoData={seoData} onNavigate={handleNavigate} />

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
          <Suspense fallback={<PageLoadingFallback />}>
            <PrivacyMap />
          </Suspense>
        ) : currentPath === '/calculator' ? (
          <Suspense fallback={<PageLoadingFallback />}>
            <Calculator />
          </Suspense>
        ) : currentPath === '/docs/architecture' ? (
          <Suspense fallback={<PageLoadingFallback />}>
            <DocsArchitecture />
          </Suspense>
        ) : currentPath === '/privacy' ? (
          <Suspense fallback={<PageLoadingFallback />}>
            <PrivacyPolicy />
          </Suspense>
        ) : currentPath === '/terms' ? (
          <Suspense fallback={<PageLoadingFallback />}>
            <TermsOfService />
          </Suspense>
        ) : currentPath === '/tools' ? (
          <Suspense fallback={<PageLoadingFallback />}>
            <ToolsDirectory onNavigate={handleNavigate} />
          </Suspense>
        ) : currentPath === '/about' ? (
          <Suspense fallback={<PageLoadingFallback />}>
            <AboutPage />
          </Suspense>
        ) : (
          <React.Fragment>
            {files.length === 0 ? (
              /* STATE 1: IDLE */
              <div className="flex flex-col gap-6 mb-16 animate-in fade-in zoom-in-95 duration-300 min-h-[400px]">
                <Dropzone onFilesAdded={handleFilesAdded} fromFormat={seoData.fromFormat} />
              </div>
            ) : successCount === files.length && !isProcessing ? (
              /* STATE 3: COMPLETE */
              <CompleteView
                files={files}
                settings={settings}
                isCopiedShareLink={isCopiedShareLink}
                onDownloadAll={handleDownloadAll}
                onDownloadDirect={handleDownloadDirect}
                onShareApp={handleShareApp}
                onClearAll={handleClearAll}
              />
            ) : (
              /* STATE 2: ACTIVE QUEUE */
              <QueueSection
                files={files}
                selectedFileIds={selectedFileIds}
                settings={settings}
                setSettings={setSettings}
                isProcessing={isProcessing}
                isStopping={isStopping}
                etaText={etaText}
                pendingCount={pendingCount}
                processedCount={processedCount}
                totalCount={totalCount}
                progressPercent={progressPercent}
                successCount={successCount}
                onConvert={processFiles}
                onStop={stopProcessing}
                onClearAll={handleClearAll}
                onToggleSelect={handleToggleSelect}
                onRemoveFile={handleRemoveFile}
                onRetryFile={handleRetryFile}
                onDownloadSingle={handleDownloadSingle}
                onRotateItem={handleRotateItem}
                onCompare={setCompareItem}
                onInspectDetails={setInspectItem}
              />
            )}

            {/* Value Propositions / Why choose Zapixal */}
            <ValuePropsSection />

            {/* Recharts Summary Chart for Batch Size Savings */}
            {successCount > 0 && (
              <Suspense fallback={<ChartLoadingFallback />}>
                <BatchStatsChart files={files} />
              </Suspense>
            )}

            {/* Embed Widget for Webmasters & SEO */}
            <Suspense fallback={null}>
              <EmbedWidget />
            </Suspense>

            {/* Dynamic pSEO Content Guide & FAQ */}
            <Suspense fallback={null}>
              <PseoContentGuide seoData={seoData} onNavigate={handleNavigate} />
            </Suspense>
          </React.Fragment>
        )}
      </main>

      {/* Dynamic pSEO Interlinking Footer Link Hub */}
      <Suspense fallback={null}>
        <FooterLinkHub 
          currentPath={currentPath} 
          onNavigate={handleNavigate} 
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />
      </Suspense>

      {/* Orchestrated Modals & Floating Banners */}
      <ModalsOrchestrator
        compareItem={compareItem}
        inspectItem={inspectItem}
        isDonateModalOpen={isDonateModalOpen}
        isInstallModalOpen={isInstallModalOpen}
        hasConvertedInSession={hasConvertedInSession}
        hasDismissedPwaBanner={hasDismissedPwaBanner}
        deferredPrompt={deferredPrompt}
        onCloseCompare={() => setCompareItem(null)}
        onCloseInspect={() => setInspectItem(null)}
        onCloseDonate={() => setIsDonateModalOpen(false)}
        onCloseInstall={() => setIsInstallModalOpen(false)}
        onClosePwaBanner={handleClosePwaBanner}
      />
    </div>
  );
}
