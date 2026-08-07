import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  Zap as ZapIcon
} from 'lucide-react';
import { PSEO_ROUTES_LIST } from '../lib/seoEngine';
const logoImg = '/logo.svg';

interface FooterLinkHubProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenInstall?: () => void;
}

export function FooterLinkHub({ currentPath, onNavigate, onOpenInstall }: FooterLinkHubProps) {
  const [showFullToolsDirectory, setShowFullToolsDirectory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  // Deduplicated featured links for tool presets directory
  const uniqueRoutesMap = new Map<string, typeof PSEO_ROUTES_LIST[0]>();
  PSEO_ROUTES_LIST.forEach(item => {
    if (!uniqueRoutesMap.has(item.path)) {
      uniqueRoutesMap.set(item.path, item);
    }
  });
  const uniqueRoutes = Array.from(uniqueRoutesMap.values());

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'converter', label: 'Format Converters' },
    { id: 'compression', label: 'Target Size Compressors' },
    { id: 'use-case', label: 'Niche & Social Media' },
    { id: 'resource', label: 'Comparisons & Tech' },
  ];

  const filteredRoutes = selectedCategory === 'all' 
    ? uniqueRoutes 
    : uniqueRoutes.filter(r => r.category === selectedCategory);

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
            <span>Zero server uploads — 100% private</span>
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
              The guidance covers compatibility, accessibility, performance, and size limits for web, ecommerce, and submissions.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 dark:border-[#282a2e] dark:bg-[#18191c]/70">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <ZapIcon className="w-4 h-4 text-amber-500" />
              Practical output choices
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              The site explains when to use JPEG, PNG, WebP, AVIF, or a stricter size target instead of relying on defaults.
            </p>
          </div>
        </div>

        {/* Minimal Directory Toggle Bar */}
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-b border-slate-200/70 dark:border-[#222428]">
          <span className="text-slate-500 dark:text-slate-400 font-sans">
            Need a specific conversion preset or compression limit?
          </span>

          <button
            onClick={() => setShowFullToolsDirectory(!showFullToolsDirectory)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-sans"
          >
            <span>{showFullToolsDirectory ? 'Hide Full Directory' : `Browse All ${uniqueRoutes.length}+ Tool Presets`}</span>
            {showFullToolsDirectory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Categorized Directory */}
        {showFullToolsDirectory && (
          <div className="py-6 animate-fade-in border-b border-slate-200/70 dark:border-[#222428] space-y-4 font-sans">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 font-sans">
                Tools & Format Directory ({filteredRoutes.length} Presets)
              </p>
              
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-200/60 dark:bg-[#1c1d21] p-1 rounded-xl">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-white dark:bg-[#2c2d32] text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Categorized Listing */}
            {selectedCategory === 'all' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                {categories.filter(c => c.id !== 'all').map(cat => {
                  const catRoutes = uniqueRoutes.filter(r => r.category === cat.id);
                  if (catRoutes.length === 0) return null;
                  return (
                    <div key={cat.id} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-[#282a2e]">
                        {cat.label} ({catRoutes.length})
                      </h4>
                      <div className="flex flex-col gap-1 text-xs">
                        {catRoutes.map(route => (
                          <a
                            key={route.path}
                            href={route.path}
                            onClick={(e) => handleClick(e, route.path)}
                            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate py-0.5 font-sans"
                            title={route.label}
                          >
                            {route.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs pt-2">
                {filteredRoutes.map(route => (
                  <a
                    key={route.path}
                    href={route.path}
                    onClick={(e) => handleClick(e, route.path)}
                    className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate py-1 font-sans"
                    title={route.label}
                  >
                    {route.label}
                  </a>
                ))}
              </div>
            )}
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
