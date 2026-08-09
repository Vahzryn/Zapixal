import React, { Suspense, lazy } from 'react';
import { ImageFileItem } from '../../types';

const CompareModal = lazy(() => import('../CompareModal').then(m => ({ default: m.CompareModal })));
const ImageDetailsModal = lazy(() => import('../ImageDetailsModal').then(m => ({ default: m.ImageDetailsModal })));
const DonateModal = lazy(() => import('../DonateModal').then(m => ({ default: m.DonateModal })));
const InstallModal = lazy(() => import('../InstallModal').then(m => ({ default: m.InstallModal })));
const PwaBanner = lazy(() => import('../PwaBanner').then(m => ({ default: m.PwaBanner })));

function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="rounded-2xl bg-white p-4 shadow-xl dark:bg-[#303134]">
        <span className="text-sm font-medium text-neutral-700 dark:text-[#e8eaed]">Loading modal...</span>
      </div>
    </div>
  );
}

interface ModalsOrchestratorProps {
  compareItem: ImageFileItem | null;
  inspectItem: ImageFileItem | null;
  isDonateModalOpen: boolean;
  isInstallModalOpen: boolean;
  hasConvertedInSession: boolean;
  hasDismissedPwaBanner: boolean;
  deferredPrompt: any;
  onCloseCompare: () => void;
  onCloseInspect: () => void;
  onCloseDonate: () => void;
  onCloseInstall: () => void;
  onClosePwaBanner: () => void;
}

export const ModalsOrchestrator = React.memo<ModalsOrchestratorProps>(function ModalsOrchestrator({
  compareItem,
  inspectItem,
  isDonateModalOpen,
  isInstallModalOpen,
  hasConvertedInSession,
  hasDismissedPwaBanner,
  deferredPrompt,
  onCloseCompare,
  onCloseInspect,
  onCloseDonate,
  onCloseInstall,
  onClosePwaBanner,
}) {
  return (
    <>
      {compareItem && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <CompareModal item={compareItem} onClose={onCloseCompare} />
        </Suspense>
      )}
      {inspectItem && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <ImageDetailsModal item={inspectItem} onClose={onCloseInspect} />
        </Suspense>
      )}
      {isDonateModalOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <DonateModal isOpen={isDonateModalOpen} onClose={onCloseDonate} />
        </Suspense>
      )}
      {/* InstallModal is kept for manual click on "Install App" in Navbar */}
      {isInstallModalOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <InstallModal
            isOpen={isInstallModalOpen}
            onClose={onCloseInstall}
            deferredPrompt={deferredPrompt}
          />
        </Suspense>
      )}
    </>
  );
});
