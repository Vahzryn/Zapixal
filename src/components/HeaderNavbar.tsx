import React, { useState, useEffect } from 'react';
import { Moon, Sun, Heart, BookOpen, Grid } from 'lucide-react';
import { cn } from '../lib/utils';

const logoImg = '/assets/logo.webp';

interface HeaderNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDonate?: () => void;
  onShareApp?: () => void;
  isCopiedShareLink?: boolean;
}

export function HeaderNavbar({
  currentPath = '/',
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
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
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 dark:border-[#3c4043]/80 bg-white/90 dark:bg-[#202124]/90 backdrop-blur-md transition-colors">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3.5 sm:px-6 max-w-[1600px] mx-auto">
        {/* Left: Brand Identity + Subtle Status */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 group cursor-pointer active:scale-[0.98] transition-transform outline-none shrink-0"
            aria-label="Zapixal Home"
          >
            <img 
              src={logoImg} 
              alt="Zapixal" 
              width="32"
              height="32"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain group-hover:opacity-90 transition-opacity" 
            />
            <span className="text-base sm:text-lg font-black tracking-tight text-neutral-900 dark:text-white">
              Zapixal
            </span>
          </button>
          
          {/* Subtle status indicator */}
          <div 
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/60"
            title={isOffline ? "Operating offline in local browser memory" : "Client-side processing active"}
          >
            <span className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isOffline ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
            )} />
            <span className="truncate">{isOffline ? "Offline mode" : "In-browser"}</span>
          </div>
        </div>

        {/* Right: Clean Navigation Cluster */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {/* Tools Directory */}
          <button
            onClick={() => onNavigate('/tools')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95",
              currentPath === '/tools' || currentPath.startsWith('/tools/')
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
            title="Browse All Tools"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Tools</span>
          </button>

          {/* Guides / Documentation */}
          <button
            onClick={() => onNavigate('/articles')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95",
              currentPath.startsWith('/articles')
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
            title="Guides and Articles"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guides</span>
          </button>

          {/* Support / Donate */}
          {onOpenDonate && (
            <button
              onClick={onOpenDonate}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-lg transition-colors cursor-pointer active:scale-95"
              title="Support Zapixal"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Support</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5 sm:mx-1" />

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
