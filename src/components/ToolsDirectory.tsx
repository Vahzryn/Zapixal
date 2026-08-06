import React, { useEffect } from 'react';
import { Shield, Zap, Search, ChevronRight } from 'lucide-react';
import { PSEO_ROUTES_LIST } from '../lib/seoEngine';

interface ToolsDirectoryProps {
  onNavigate: (path: string) => void;
}

export function ToolsDirectory({ onNavigate }: ToolsDirectoryProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  const converters = PSEO_ROUTES_LIST.filter(r => r.category === 'converter');
  const compressions = PSEO_ROUTES_LIST.filter(r => r.category === 'compression');
  const useCases = PSEO_ROUTES_LIST.filter(r => r.category === 'use-case');
  const comparisons = PSEO_ROUTES_LIST.filter(r => r.category === 'resource' && r.path.startsWith('/vs/'));

  
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": PSEO_ROUTES_LIST.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://zapixal.com${tool.path}`,
      "name": tool.label
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema).replace(/</g, '\\u003c') }} />
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in pb-24">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-[#303134] text-neutral-800 dark:text-[#e8eaed] text-xs font-bold uppercase tracking-widest mb-6">
          <Shield className="w-4 h-4" />
          <span>100% Secure Client-Side Engine</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-6">
          All Zapixal Image Tools
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
          Over 50+ specialized, ultra-fast image utilities. Every tool runs completely offline in your browser memory via WebAssembly. Zero uploads. Zero limits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {/* Format Conversions */}
        <div className="bg-transparent ">
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-3">
            Format Conversions
          </h2>
          <p className="text-sm text-neutral-500 dark:text-[#9aa0a6] mb-6 font-medium">
            Lossless and high-efficiency format switching.
          </p>
          <ul className="space-y-4">
            {converters.map(tool => (
              <li key={tool.path}>
                <a 
                  href={tool.path}
                  onClick={(e) => handleClick(e, tool.path)}
                  className="flex items-center justify-between group/link"
                >
                  <span className="text-[15px] font-medium text-neutral-600 dark:text-[#9aa0a6] group-hover/link:text-neutral-900 dark:group-hover/link:text-white transition-colors">
                    {tool.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-[#5f6368] group-hover/link:text-neutral-900 dark:group-hover/link:text-white transition-all group-hover/link:translate-x-1 group-hover/link:text-neutral-900 dark:group-hover/link:text-white" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* File Size Compression */}
        <div className="bg-transparent ">
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-3">
            Target Size Compression
          </h2>
          <p className="text-sm text-neutral-500 dark:text-[#9aa0a6] mb-6 font-medium">
            Hit exact KB limits for forms, emails, and uploads.
          </p>
          <ul className="space-y-4">
            {compressions.map(tool => (
              <li key={tool.path}>
                <a 
                  href={tool.path}
                  onClick={(e) => handleClick(e, tool.path)}
                  className="flex items-center justify-between group/link"
                >
                  <span className="text-[15px] font-medium text-neutral-600 dark:text-[#9aa0a6] group-hover/link:text-neutral-900 dark:group-hover/link:text-white transition-colors">
                    {tool.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-[#5f6368] group-hover/link:text-neutral-900 dark:group-hover/link:text-white transition-all group-hover/link:translate-x-1 group-hover/link:text-neutral-900 dark:group-hover/link:text-white" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Specialized Use-Cases */}
        <div className="bg-transparent">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Specialized Use-Cases
          </h2>
          <p className="text-sm text-neutral-500 dark:text-[#9aa0a6] mb-6 font-medium">
            Pre-configured tools for specific platform requirements.
          </p>
          <ul className="space-y-4">
            {useCases.map(tool => (
              <li key={tool.path}>
                <a 
                  href={tool.path}
                  onClick={(e) => handleClick(e, tool.path)}
                  className="flex items-center justify-between group/link"
                >
                  <span className="text-[15px] font-medium text-neutral-600 dark:text-[#9aa0a6] group-hover/link:text-neutral-900 dark:group-hover/link:text-white transition-colors">
                    {tool.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-[#5f6368] group-hover/link:text-neutral-900 dark:group-hover/link:text-white transition-all group-hover/link:translate-x-1 group-hover/link:text-neutral-900 dark:group-hover/link:text-white" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Comparisons & Resources */}
        <div className="bg-transparent">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            Comparisons & Reviews
          </h2>
          <p className="text-sm text-neutral-500 dark:text-[#9aa0a6] mb-6 font-medium">
            See how Zapixal's client-side engine compares to cloud tools.
          </p>
          <ul className="space-y-4">
            {comparisons.map(tool => (
              <li key={tool.path}>
                <a 
                  href={tool.path}
                  onClick={(e) => handleClick(e, tool.path)}
                  className="flex items-center justify-between group/link"
                >
                  <span className="text-[15px] font-medium text-neutral-600 dark:text-[#9aa0a6] group-hover/link:text-neutral-900 dark:group-hover/link:text-white transition-colors">
                    {tool.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-[#5f6368] group-hover/link:text-neutral-900 dark:group-hover/link:text-white transition-all group-hover/link:translate-x-1 group-hover/link:text-neutral-900 dark:group-hover/link:text-white" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}
