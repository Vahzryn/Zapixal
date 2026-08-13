import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  BookOpen,
  Zap as ZapIcon,
  FileImage,
  Sliders,
  Cpu
} from 'lucide-react';

const logoImg = '/assets/logo.webp';

interface FooterLinkHubProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}
export function FooterLinkHub({ currentPath, onNavigate }: FooterLinkHubProps) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
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
            <span>Zero server uploads — Secure local processing</span>
          </div>
        </div>

        {/* Curated Contextual Link Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-4 border-b border-slate-200/70 dark:border-[#222428]">
          {/* Column 1: Editorial Hub & Categories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Editorial & Tech Guides</span>
            </div>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="/articles" onClick={(e) => handleClick(e, '/articles')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Editorial Hub (/articles)
                </a>
              </li>
              <li>
                <a href="/articles/formats" onClick={(e) => handleClick(e, '/articles/formats')} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FileImage className="w-3 h-3 text-slate-400" />
                  <span>Format Codecs (/formats)</span>
                </a>
              </li>
              <li>
                <a href="/articles/privacy" onClick={(e) => handleClick(e, '/articles/privacy')} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  <span>Privacy & Metadata (/privacy)</span>
                </a>
              </li>
              <li>
                <a href="/articles/workflows" onClick={(e) => handleClick(e, '/articles/workflows')} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  <span>KB Limits & Workflows (/workflows)</span>
                </a>
              </li>
              <li>
                <a href="/articles/performance" onClick={(e) => handleClick(e, '/articles/performance')} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Cpu className="w-3 h-3 text-slate-400" />
                  <span>WASM Architecture (/performance)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Featured Technical Guides */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Featured In-Depth Guides</span>
            </div>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="/articles/heic-vs-jpg" onClick={(e) => handleClick(e, '/articles/heic-vs-jpg')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  HEIC vs JPG Compression & Quality
                </a>
              </li>
              <li>
                <a href="/articles/exif-metadata-privacy-guide" onClick={(e) => handleClick(e, '/articles/exif-metadata-privacy-guide')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  EXIF Metadata Location Security Guide
                </a>
              </li>
              <li>
                <a href="/articles/compress-image-to-kb-limit-guide" onClick={(e) => handleClick(e, '/articles/compress-image-to-kb-limit-guide')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Compressing Images to Strict KB Limits
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Core Conversion & Compression Tools */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              <ZapIcon className="w-4 h-4 text-amber-500" />
              <span>Core Image Tools</span>
            </div>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="/tools" onClick={(e) => handleClick(e, '/tools')} className="font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors flex items-center gap-1">
                  <span>All 42 Tools Directory (/tools)</span>
                </a>
              </li>
              <li>
                <a href="/convert-heic-to-jpg-locally" onClick={(e) => handleClick(e, '/convert-heic-to-jpg-locally')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Convert HEIC to JPG Locally
                </a>
              </li>
              <li>
                <a href="/strip-exif-metadata-online-private" onClick={(e) => handleClick(e, '/strip-exif-metadata-online-private')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Strip EXIF Metadata Privately
                </a>
              </li>
              <li>
                <a href="/compress-image-to-100kb-online" onClick={(e) => handleClick(e, '/compress-image-to-100kb-online')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Compress Image to 100KB
                </a>
              </li>
              <li>
                <a href="/bulk-image-compressor-offline" onClick={(e) => handleClick(e, '/bulk-image-compressor-offline')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Bulk Local Image Compressor
                </a>
              </li>
              <li>
                <a href="/convert-to-avif-online-free" onClick={(e) => handleClick(e, '/convert-to-avif-online-free')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Convert Image to Next-Gen AVIF
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Legal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zapixal Platform</span>
            </div>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="/about" onClick={(e) => handleClick(e, '/about')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About Zapixal
                </a>
              </li>
              <li>
                <a href="/privacy" onClick={(e) => handleClick(e, '/privacy')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" onClick={(e) => handleClick(e, '/terms')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="https://github.com/Vahzryn/Zapixal" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('zapixal-open-feedback'))} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Submit Feedback
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 font-sans">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span>© 2026 Zapixal. 100% Client-Side, WebAssembly & Privacy-First.</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
