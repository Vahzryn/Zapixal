import React from 'react';
import { PSEO_ROUTES_LIST } from '../lib/seoEngine';
import { Link2, Sparkles, Shield, Cpu } from 'lucide-react';

interface FooterLinkHubProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function FooterLinkHub({ currentPath, onNavigate }: FooterLinkHubProps) {
  const converters = PSEO_ROUTES_LIST.filter(r => r.category === 'converter');
  const compressions = PSEO_ROUTES_LIST.filter(r => r.category === 'compression');
  const useCases = PSEO_ROUTES_LIST.filter(r => r.category === 'use-case');

  const handleClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="w-full bg-white dark:bg-[#1f1f1f] border-t border-neutral-200 dark:border-[#3c4043] mt-24 pt-16 pb-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Top Brand Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-neutral-200 dark:border-[#3c4043]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                Z
              </div>
              <span className="text-xl font-black text-neutral-800 dark:text-[#e8eaed] tracking-tight">
                Zapixal
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-[#9aa0a6] max-w-md font-medium">
              Ultra-fast, 100% private client-side image converter & compressor operating in browser memory via Web Workers & WebAssembly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-600 dark:text-[#bdc1c6]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-[#303134] rounded-xl">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Zero Upload Privacy</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-[#303134] rounded-xl">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span>Client Multi-Core WASM</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-[#303134] rounded-xl">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>100% Free Forever</span>
            </div>
          </div>
        </div>

        {/* Footer Link Hub Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
          
          {/* Column 1: Popular Image Converters */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-[#9aa0a6] mb-4 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Popular Image Converters</span>
            </h4>
            <ul className="space-y-2">
              {converters.map(item => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => handleClick(e, item.path)}
                    className={`text-xs font-semibold transition-colors hover:underline ${
                      currentPath === item.path
                        ? 'text-blue-600 dark:text-[#8ab4f8] font-bold'
                        : 'text-neutral-600 dark:text-[#bdc1c6] hover:text-blue-600 dark:hover:text-[#8ab4f8]'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: File Size Compression Targets */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-[#9aa0a6] mb-4 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Target File Size Compression</span>
            </h4>
            <ul className="space-y-2">
              {compressions.map(item => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => handleClick(e, item.path)}
                    className={`text-xs font-semibold transition-colors hover:underline ${
                      currentPath === item.path
                        ? 'text-blue-600 dark:text-[#8ab4f8] font-bold'
                        : 'text-neutral-600 dark:text-[#bdc1c6] hover:text-blue-600 dark:hover:text-[#8ab4f8]'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Specialized Use-Case Tools */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-[#9aa0a6] mb-4 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Specialized Use-Case Tools</span>
            </h4>
            <ul className="space-y-2">
              {useCases.map(item => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => handleClick(e, item.path)}
                    className={`text-xs font-semibold transition-colors hover:underline ${
                      currentPath === item.path
                        ? 'text-blue-600 dark:text-[#8ab4f8] font-bold'
                        : 'text-neutral-600 dark:text-[#bdc1c6] hover:text-blue-600 dark:hover:text-[#8ab4f8]'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Sitemap Link */}
        <div className="pt-8 border-t border-neutral-100 dark:border-[#3c4043] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-neutral-500 dark:text-[#9aa0a6]">
          <span>
            © 2026 Zapixal Core Engine. All rights reserved. 100% Private Client-Side Application.
            <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
              Zapixal is open-source. <a href="https://github.com/Vahzryn/Zapixal" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline dark:text-blue-400">Star on GitHub ⭐</a>
            </span>
          </span>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:underline">
              XML Sitemap
            </a>
            <span>•</span>
            <span className="text-emerald-600 dark:text-[#81c995] font-bold">100% Verified Offline</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
