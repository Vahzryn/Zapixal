import React, { useState, useEffect } from 'react';
import { DownloadCloud, Github, Moon, Sun, Heart, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
const logoImg = '/logo.svg';

interface HeaderNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onInstallApp: () => void;
  onOpenDonate?: () => void;
  onShareApp?: () => void;
  isCopiedShareLink?: boolean;
}

export function HeaderNavbar({
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  onInstallApp,
  onOpenDonate,
}: HeaderNavbarProps) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-[#3c4043] bg-white/80 dark:bg-[#202124]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-[1600px] mx-auto">
        {/* Left Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 group cursor-pointer active:scale-95 transition-transform outline-none"
            >
              <img 
                src={logoImg} 
                alt="Zapixal Logo" 
                loading="eager"
                decoding="async"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-contain group-hover:scale-105 transition-transform shadow-2xs" 
              />
              <span className="flex flex-col items-start leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Zapixal
                </span>
                <span className="mt-1 hidden text-[11px] font-semibold text-neutral-500 dark:text-[#9aa0a6] sm:block">
                  Offline image converter & compressor
                </span>
              </span>
            </button>
          </div>

          
          {/* Dynamic Status Badge */}
          <div className={cn(
            "hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border shadow-2xs ml-2",
            isOffline 
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#4d3a1f] dark:text-[#fde293] dark:border-[#7a5924]"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#1e3427] dark:text-[#81c995] dark:border-[#2d523c]"
          )}>
            {isOffline ? (
              <>
                <span>✈️</span>
                <span>Offline Mode</span>
              </>
            ) : (
              <>
                <span>🟢</span>
                <span>Online · 100% Local Processing</span>
              </>
            )}
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Support / Donate Button */}
          {onOpenDonate && (
            <button
              onClick={onOpenDonate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/30 dark:text-pink-400 dark:hover:bg-pink-900/40 border border-pink-200 dark:border-pink-800/50 rounded-full transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Support Zapixal"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Support</span>
            </button>
          )}

          {/* GitHub Open Source */}
          <a
            href="https://github.com/Vahzryn/Zapixal"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] hover:bg-neutral-100 dark:hover:bg-[#303134] rounded-full transition-colors cursor-pointer"
            aria-label="Zapixal Open Source GitHub Repository"
            title="View Open-Source Code on GitHub"
          >
            <Github className="w-5 h-5" />
            <span className="sr-only">Zapixal Open Source Project on GitHub</span>
          </a>

          {/* Install App Button */}
          <button 
            onClick={onInstallApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-[#e8eaed] bg-neutral-100 hover:bg-neutral-200 dark:bg-[#303134] dark:hover:bg-[#3c4043] border border-neutral-200 dark:border-transparent rounded-full transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Install Zapixal Progressive Web App"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
            <span className="sm:hidden">Install</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] hover:bg-neutral-100 dark:hover:bg-[#303134] rounded-full transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
            title="Toggle Light / Dark theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#8ab4f8]" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
