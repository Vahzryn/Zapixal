import React, { useState, useEffect } from 'react';
import { Moon, Sun, Heart, BookOpen, Grid, Search, Github } from 'lucide-react';
import { cn } from '../lib/utils';

const logoImg = '/assets/logo.webp';

interface HeaderNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDonate?: () => void;
  onOpenSearch?: () => void;
  onShareApp?: () => void;
  isCopiedShareLink?: boolean;
}

export function HeaderNavbar({
  currentPath = '/',
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  onOpenDonate,
  onOpenSearch,
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
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md transition-colors">
      <div className="flex h-14 items-center justify-between px-3 sm:px-6 max-w-6xl mx-auto gap-2">
        {/* Left: Brand Identity + In-Browser/Offline Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer active:scale-[0.98] transition-transform outline-none shrink-0"
            aria-label="Zapixal Home"
          >
            <img 
              src={logoImg} 
              alt="Zapixal" 
              width="28"
              height="28"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-lg object-contain shrink-0" 
            />
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white shrink-0 whitespace-nowrap">
              Zapixal
            </span>
          </button>

          {/* Privacy & In-Browser Processing Indicator */}
          <div 
            className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 shrink-0"
            title={isOffline ? "Operating offline in local browser memory" : "Client-side processing active — zero cloud upload"}
          >
            <span className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isOffline ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
            )} />
            <span className="truncate">{isOffline ? "Offline" : "Client-Side"}</span>
          </div>
        </div>

        {/* Right: Clean, Non-overlapping Navigation Cluster */}
        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Quick Search Trigger */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Search tools (Cmd+K / Ctrl+K)"
              aria-label="Search tools"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-flex items-center px-1 text-[10px] font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-400 rounded">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Tools Directory */}
          <button
            onClick={() => onNavigate('/tools')}
            className={cn(
              "px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0",
              currentPath === '/tools' || currentPath.startsWith('/tools/')
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
            title="Browse All Tools"
          >
            Tools
          </button>

          {/* Guides / Documentation (Visible on tablet & desktop) */}
          <button
            onClick={() => onNavigate('/articles')}
            className={cn(
              "hidden sm:inline-flex px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0",
              currentPath.startsWith('/articles')
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
            title="Guides and Articles"
          >
            Guides
          </button>

          {/* Support / Donate (Visible on md+ screens) */}
          {onOpenDonate && (
            <button
              onClick={onOpenDonate}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Support Zapixal development"
            >
              <Heart className="w-3.5 h-3.5 fill-pink-500/20" />
              <span>Support</span>
            </button>
          )}

          {/* GitHub Repository Link (Visible on sm+ screens) */}
          <a
            href="https://github.com/Vahzryn/Zapixal"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="View source code on GitHub"
            title="Open Source GitHub"
          >
            <Github className="w-4 h-4" />
          </a>

          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shrink-0"
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
