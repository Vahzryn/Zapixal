import { useState, useEffect, useCallback } from 'react';

interface UsePwaInstallOptions {
  onOpenInstallModal: () => void;
}

export function usePwaInstall({ onOpenInstallModal }: UsePwaInstallOptions) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = useCallback(async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch {
        onOpenInstallModal();
      }
    } else {
      onOpenInstallModal();
    }
  }, [deferredPrompt, onOpenInstallModal]);

  return {
    deferredPrompt,
    handleInstallPWA,
  };
}
