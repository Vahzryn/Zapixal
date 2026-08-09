import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  Zap as ZapIcon
} from 'lucide-react';
import { PSEO_ROUTES_LIST } from '../lib/seoEngine';
const logoImg = '/assets/logo.webp';

interface FooterLinkHubProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenInstall?: () => void;
}

export function FooterLinkHub({ currentPath, onNavigate, onOpenInstall }: FooterLinkHubProps) {
  const [isToolsetOpen, setIsToolsetOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer 
      id="main-footer" 
      role="contentinfo" 
      aria-label="Zapixal Footer"
      className="w-full bg-slate-50/90 dark:bg-[#121315] border-t border-slate-200/70 dark:border-[#222428] mt-20 pt-10 pb-8 transition-colors duration-200 text-slate-600 dark:text-slate-400 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Header Section */}
        <div className="pb-8 border-b border-slate-200/70 dark:border-[#222428] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <img 
                src={logoImg} 
                alt="Zapixal Logo" 
                width="32"
                height="32"
                decoding="async"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-[#1a1b1e] p-1 border border-slate-200/80 dark:border-[#32353a]"
              />
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                Zapixal
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-sans">
                <Lock className="w-2.5 h-2.5" />
                100% In-Browser
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-sans">
              Ultra-fast, private client-side batch image converter & compressor. Processes HEIC, PNG, JPG, WEBP, AVIF, SVG, and PDF in browser memory via Web Workers & WASM.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-[#18191c] px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-[#282a2e] shrink-0 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero server uploads — Secure processing</span>
          </div>

        </div>

        <div className="grid gap-3 py-6 md:grid-cols-3 border-b border-slate-200/70 dark:border-[#222428]">
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 dark:border-[#282a2e] dark:bg-[#18191c]/70">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Privacy-first workflow
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Files stay local in the browser, which helps protect metadata, documents, and personal images.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 dark:border-[#282a2e] dark:bg-[#18191c]/70">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <Lock className="w-4 h-4 text-blue-500" />
              Trusted for real-world use
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Reliable tools for web, ecommerce, and submissions, focusing on compatibility and performance.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 dark:border-[#282a2e] dark:bg-[#18191c]/70">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <ZapIcon className="w-4 h-4 text-amber-500" />
              Practical output choices
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Choose between JPEG, PNG, WebP, AVIF, or specific size targets with expert guidance.
            </p>
          </div>
        </div>

        {/* Discrete Toolset Section - All links always rendered in DOM for SEO crawlers */}
        {PSEO_ROUTES_LIST.length > 0 && (
          <div className="py-4 border-b border-slate-200/70 dark:border-[#222428]">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setIsToolsetOpen(!isToolsetOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#18191c] border border-slate-200/80 dark:border-[#2a2c30] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-[#383a40] transition-all cursor-pointer shadow-xs"
                aria-expanded={isToolsetOpen}
                aria-label="Toggle toolset directory view"
              >
                <ZapIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Zapixal Toolset Directory ({PSEO_ROUTES_LIST.length})</span>
                {isToolsetOpen ? (
                  <>
                    <span className="text-[10px] text-slate-400 font-normal">(Collapse)</span>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-400 font-normal">(Show All)</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>

            <div
              className={`relative rounded-2xl bg-white/80 dark:bg-[#18191c]/80 border border-slate-200/70 dark:border-[#282a2e] transition-all duration-300 ease-in-out ${
                isToolsetOpen ? 'max-h-[3000px] p-4' : 'max-h-48 p-4 overflow-hidden'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {PSEO_ROUTES_LIST.map((route) => {
                  const isActive = currentPath === route.path;
                  return (
                    <a
                      key={route.path}
                      href={route.path}
                      onClick={(e) => handleClick(e, route.path)}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-transparent hover:border-slate-200/80 dark:hover:border-[#2e3035] hover:bg-slate-100/60 dark:hover:bg-[#202226] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate">{route.label}</span>
                    </a>
                  );
                })}
              </div>

              {!isToolsetOpen && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 via-slate-50/90 dark:from-[#121315] dark:via-[#121315]/90 to-transparent pointer-events-none flex items-end justify-center pb-2 rounded-b-2xl"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        )}

        {/* Bottom Bar: Copyright & Primary Navigation */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 font-sans">
          
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-sans">© 2026 Zapixal. 100% Client-Side & Private.</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <nav aria-label="Legal Links" className="flex items-center gap-3">
              <a href="/about" onClick={(e) => handleClick(e, '/about')} className="hover:text-slate-900 dark:hover:text-white hover:underline font-medium">About</a>
              <a href="/privacy" onClick={(e) => handleClick(e, '/privacy')} className="hover:text-slate-900 dark:hover:text-white hover:underline font-medium">Privacy</a>
              <a href="/terms" onClick={(e) => handleClick(e, '/terms')} className="hover:text-slate-900 dark:hover:text-white hover:underline font-medium">Terms</a>
              <a href="https://github.com/Vahzryn/Zapixal" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white hover:underline font-medium">Source Code</a>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-sans"
              >
                Install App
              </button>
            )}
          </div>

        </div>

      </div>
    </footer>
  );
}
