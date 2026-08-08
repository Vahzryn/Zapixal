import React, { useState, useEffect } from 'react';
import { DownloadCloud, Monitor, Smartphone, ShieldCheck, Zap, X, Check, Share, MoreVertical, PlusSquare } from 'lucide-react';
const logoImg = '/assets/logo.webp';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export function InstallModal({ isOpen, onClose, deferredPrompt, onInstallSuccess }: InstallModalProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios');
    } else if (/android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted' && onInstallSuccess) {
          onInstallSuccess();
          onClose();
        }
      } catch (err) {
        console.error('PWA install error:', err);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl shadow-2xl overflow-hidden text-neutral-900 dark:text-[#e8eaed]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-[#1a233a] dark:to-[#1e293b] text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <img 
                src={logoImg} 
                alt="Zapixal" 
                width="40"
                height="40"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-contain rounded-xl" 
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                <DownloadCloud className="w-3 h-3" /> Progressive Web App
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Install Zapixal App</h3>
              <p className="text-xs text-blue-100 dark:text-neutral-300 mt-0.5">
                Convert & compress images natively on your desktop or phone—offline!
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#303134] border border-neutral-100 dark:border-[#3c4043] text-center">
              <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <div className="text-xs font-bold">Instant Launch</div>
              <div className="text-[10px] text-neutral-500 dark:text-[#9aa0a6]">From Dock / Desktop</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#303134] border border-neutral-100 dark:border-[#3c4043] text-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <div className="text-xs font-bold">Works Offline</div>
              <div className="text-[10px] text-neutral-500 dark:text-[#9aa0a6]">No internet required</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#303134] border border-neutral-100 dark:border-[#3c4043] text-center">
              {deviceType === 'desktop' ? (
                <Monitor className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              ) : (
                <Smartphone className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              )}
              <div className="text-xs font-bold">Zero Uploads</div>
              <div className="text-[10px] text-neutral-500 dark:text-[#9aa0a6]">Private local memory</div>
            </div>
          </div>

          {/* Action / Instructions according to device & prompt status */}
          {deferredPrompt ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleTriggerInstall}
                disabled={isInstalling}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-[#8ab4f8] dark:hover:bg-[#7ca8f7] text-white dark:text-[#202124] font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-sm"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>{isInstalling ? 'Installing Zapixal...' : 'Install Zapixal Now (1-Click)'}</span>
              </button>
              <p className="text-[11px] text-center text-neutral-500 dark:text-[#9aa0a6]">
                Installs directly into your operating system without app store downloads.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-[#1a233a] border border-blue-100 dark:border-[#28354f] space-y-3">
              <div className="text-xs font-bold text-blue-900 dark:text-[#8ab4f8] flex items-center gap-1.5">
                <span>How to install on {deviceType === 'ios' ? 'iOS / iPhone' : deviceType === 'android' ? 'Android' : 'Desktop / Laptop'}:</span>
              </div>

              {deviceType === 'ios' && (
                <ol className="text-xs text-neutral-700 dark:text-neutral-300 space-y-2 list-decimal list-inside">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 p-1 bg-white dark:bg-[#303134] rounded border border-neutral-200 dark:border-[#3c4043] text-blue-600 dark:text-[#8ab4f8]">
                      <Share className="w-3.5 h-3.5" />
                    </span>
                    <span>Tap the <strong>Share</strong> button at the bottom of Safari.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 p-1 bg-white dark:bg-[#303134] rounded border border-neutral-200 dark:border-[#3c4043] text-blue-600 dark:text-[#8ab4f8]">
                      <PlusSquare className="w-3.5 h-3.5" />
                    </span>
                    <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 p-1 bg-white dark:bg-[#303134] rounded border border-neutral-200 dark:border-[#3c4043] text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>Tap <strong>Add</strong> in the top right corner. Done!</span>
                  </li>
                </ol>
              )}

              {deviceType === 'android' && (
                <ol className="text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <MoreVertical className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>Tap the <strong>three dots menu (⋮)</strong> in Chrome.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4 text-blue-600 dark:text-[#8ab4f8] shrink-0" />
                    <span>Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </li>
                </ol>
              )}

              {deviceType === 'desktop' && (
                <ol className="text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-white dark:bg-[#303134] rounded border border-neutral-200 dark:border-[#3c4043] font-mono text-[10px]">⊕</span>
                    <span>Click the <strong>Install icon</strong> in your browser address bar (Chrome/Edge/Brave).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4 text-blue-600 dark:text-[#8ab4f8] shrink-0" />
                    <span>Or open browser menu (<strong>⋮</strong>) &rarr; <strong>Cast, save & share</strong> &rarr; <strong>Install Zapixal</strong>.</span>
                  </li>
                </ol>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-[#9aa0a6] pt-2 border-t border-neutral-100 dark:border-[#3c4043]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-[#81c995] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Official App (zapixal.com)
            </span>
            <span>Size: &lt;1 MB • Web Standalone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
