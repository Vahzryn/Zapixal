import React, { useState, useEffect } from 'react';
import { X, DownloadCloud, Monitor, Smartphone, Share, PlusSquare, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
const logoImg = '/logo-mark.svg';

interface PwaBannerProps {
  deferredPrompt: any;
  onClose: () => void;
}

export function PwaBanner({ deferredPrompt, onClose }: PwaBannerProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true for hydration
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check device type
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios');
    } else if (/android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Delay visibility for a smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }
      } catch (err) {
        console.error('Install prompt error', err);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for transition out
  };

  if (isStandalone) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 w-[calc(100%-2rem)] sm:w-[380px] bg-white dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      )}
    >
      <div className="p-4 sm:p-5">
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-[#303134] transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-4">
          <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-inner">
            <img src={logoImg} alt="Zapixal" className="w-7 h-7 object-contain" />
          </div>
          
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-sm font-extrabold text-neutral-900 dark:text-[#e8eaed] leading-tight mb-1">
              Install Zapixal App
            </h4>
            <p className="text-xs text-neutral-500 dark:text-[#9aa0a6] leading-relaxed mb-3">
              Work completely offline directly from your {deviceType === 'desktop' ? 'dock/desktop' : 'home screen'}.
            </p>

            {deferredPrompt ? (
              <button 
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                {isInstalling ? 'Installing...' : 'Install Now (1-Click)'}
              </button>
            ) : (
              <div className="text-[11px] bg-neutral-50 dark:bg-[#303134] border border-neutral-100 dark:border-[#3c4043] rounded-lg p-2.5 text-neutral-600 dark:text-neutral-300">
                {deviceType === 'ios' && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-blue-600 dark:text-[#8ab4f8]">iOS Installation:</span>
                    <span className="flex items-center gap-1">Tap <Share className="w-3 h-3 inline text-blue-600"/> <strong>Share</strong>, then <strong>Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline"/></span>
                  </div>
                )}
                {deviceType === 'android' && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-blue-600 dark:text-[#8ab4f8]">Android Installation:</span>
                    <span className="flex items-center gap-1">Tap menu <MoreVertical className="w-3 h-3 inline"/> then <strong>Install App</strong></span>
                  </div>
                )}
                {deviceType === 'desktop' && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-blue-600 dark:text-[#8ab4f8]">Desktop Installation:</span>
                    <span className="flex items-center gap-1">Click the <DownloadCloud className="w-3 h-3 inline"/> install icon in your browser's address bar.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
